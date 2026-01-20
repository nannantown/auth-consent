// App Configuration for OAuth Callbacks
// Add new apps here to support them in the authentication flow

export interface AppConfig {
  slug: string
  scheme: string
  name: string
  colors: {
    primary: string
    primaryHover: string
    background: string
  }
}

export const APP_CONFIGS: Record<string, AppConfig> = {
  'murder-mystery': {
    slug: 'murder-mystery',
    scheme: 'io.supabase.murderrpg',
    name: 'Mada Mystery',
    colors: {
      primary: 'rgb(37, 99, 235)',      // blue-600
      primaryHover: 'rgb(29, 78, 216)', // blue-700
      background: 'rgb(219, 234, 254)', // blue-100
    },
  },
  'roost': {
    slug: 'roost',
    scheme: 'io.supabase.roost',
    name: 'Roost',
    colors: {
      primary: 'rgb(217, 119, 6)',      // amber-600
      primaryHover: 'rgb(180, 83, 9)',  // amber-700
      background: 'rgb(254, 243, 199)', // amber-100
    },
  },
}

export function getAppConfig(appSlug: string): AppConfig | null {
  return APP_CONFIGS[appSlug] || null
}

export function getAllAppSlugs(): string[] {
  return Object.keys(APP_CONFIGS)
}
