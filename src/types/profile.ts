// Centra Profile Types
// Database types matching Supabase schema

// Gender options
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say'

// Base profile (basic info)
export interface Profile {
  id: string
  user_id: string
  // Name
  first_name: string | null
  last_name: string | null
  first_name_kana: string | null
  last_name_kana: string | null
  // Contact
  phone: string | null
  // Address
  postal_code: string | null
  prefecture: string | null
  city: string | null
  address_line1: string | null
  address_line2: string | null
  // Basic attributes
  date_of_birth: string | null // ISO date string
  gender: Gender | null
  avatar_url: string | null
  // Timestamps
  created_at: string
  updated_at: string
}

// Sharing settings
export interface SharingSetting {
  id: string
  user_id: string
  field_name: string
  is_shareable: boolean
  created_at: string
  updated_at: string
}

// Form types (for creating/updating)
export type ProfileInput = Omit<Profile, 'id' | 'user_id' | 'created_at' | 'updated_at'>

// Full user profile with all related data
export interface FullProfile {
  profile: Profile | null
  sharingSettings: SharingSetting[]
}

// Profile completion calculation
export interface ProfileCompletion {
  percentage: number
  completedFields: number
  totalFields: number
  missingFields: string[]
}

// Shareable field names
export const SHAREABLE_FIELDS = [
  'first_name',
  'last_name',
  'first_name_kana',
  'last_name_kana',
  'phone',
  'postal_code',
  'prefecture',
  'city',
  'address_line1',
  'address_line2',
  'date_of_birth',
  'gender',
  'avatar_url',
] as const

export type ShareableField = typeof SHAREABLE_FIELDS[number]
