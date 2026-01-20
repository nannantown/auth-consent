// Centra Profile Data Access Layer
import { SupabaseClient } from '@supabase/supabase-js'
import {
  Profile,
  ProfileInput,
  SharingSetting,
  FullProfile,
  ProfileCompletion,
  ShareableField,
  SHAREABLE_FIELDS,
} from '@/types/profile'

// ============================================
// Profile (Basic Info) Operations
// ============================================

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }
  return data
}

export async function createProfile(
  supabase: SupabaseClient,
  userId: string,
  input: Partial<ProfileInput>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ user_id: userId, ...input })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: Partial<ProfileInput>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(input)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function upsertProfile(
  supabase: SupabaseClient,
  userId: string,
  input: Partial<ProfileInput>
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ user_id: userId, ...input }, { onConflict: 'user_id' })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============================================
// Sharing Settings Operations
// ============================================

export async function getSharingSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<SharingSetting[]> {
  const { data, error } = await supabase
    .from('sharing_settings')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data || []
}

export async function updateSharingSetting(
  supabase: SupabaseClient,
  userId: string,
  fieldName: ShareableField,
  isShareable: boolean
): Promise<SharingSetting> {
  const { data, error } = await supabase
    .from('sharing_settings')
    .upsert(
      { user_id: userId, field_name: fieldName, is_shareable: isShareable },
      { onConflict: 'user_id,field_name' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

export async function initializeSharingSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<SharingSetting[]> {
  const existingSettings = await getSharingSettings(supabase, userId)
  const existingFields = new Set(existingSettings.map(s => s.field_name))

  const newSettings = SHAREABLE_FIELDS
    .filter(field => !existingFields.has(field))
    .map(field => ({
      user_id: userId,
      field_name: field,
      is_shareable: false,
    }))

  if (newSettings.length === 0) {
    return existingSettings
  }

  const { data, error } = await supabase
    .from('sharing_settings')
    .insert(newSettings)
    .select()

  if (error) throw error
  return [...existingSettings, ...(data || [])]
}

// ============================================
// Full Profile Operations
// ============================================

export async function getFullProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<FullProfile> {
  const [profile, sharingSettings] = await Promise.all([
    getProfile(supabase, userId),
    getSharingSettings(supabase, userId),
  ])

  return {
    profile,
    sharingSettings,
  }
}

// ============================================
// Profile Completion Calculation
// ============================================

export function calculateProfileCompletion(fullProfile: FullProfile): ProfileCompletion {
  const fields = [
    { name: 'first_name', filled: !!fullProfile.profile?.first_name },
    { name: 'last_name', filled: !!fullProfile.profile?.last_name },
    { name: 'first_name_kana', filled: !!fullProfile.profile?.first_name_kana },
    { name: 'last_name_kana', filled: !!fullProfile.profile?.last_name_kana },
    { name: 'phone', filled: !!fullProfile.profile?.phone },
    { name: 'postal_code', filled: !!fullProfile.profile?.postal_code },
    { name: 'prefecture', filled: !!fullProfile.profile?.prefecture },
    { name: 'city', filled: !!fullProfile.profile?.city },
    { name: 'address_line1', filled: !!fullProfile.profile?.address_line1 },
    { name: 'date_of_birth', filled: !!fullProfile.profile?.date_of_birth },
    { name: 'gender', filled: !!fullProfile.profile?.gender },
  ]

  const completedFields = fields.filter(f => f.filled).length
  const totalFields = fields.length
  const missingFields = fields.filter(f => !f.filled).map(f => f.name)

  return {
    percentage: Math.round((completedFields / totalFields) * 100),
    completedFields,
    totalFields,
    missingFields,
  }
}

// ============================================
// Helper Functions
// ============================================

export function isFieldShareable(
  sharingSettings: SharingSetting[],
  fieldName: string
): boolean {
  const setting = sharingSettings.find(s => s.field_name === fieldName)
  return setting?.is_shareable ?? false
}

export function getShareableData(
  fullProfile: FullProfile
): Partial<FullProfile> {
  const settings = fullProfile.sharingSettings
  const result: Partial<FullProfile> = {}

  // Check profile fields
  if (fullProfile.profile) {
    const shareableProfile: Partial<Profile> = {}
    const profileFields: (keyof Profile)[] = [
      'first_name', 'last_name', 'first_name_kana', 'last_name_kana',
      'phone', 'postal_code', 'prefecture', 'city', 'address_line1',
      'address_line2', 'date_of_birth', 'gender', 'avatar_url'
    ]

    for (const field of profileFields) {
      if (isFieldShareable(settings, field)) {
        shareableProfile[field] = fullProfile.profile[field] as never
      }
    }
    result.profile = { ...fullProfile.profile, ...shareableProfile } as Profile
  }

  return result
}
