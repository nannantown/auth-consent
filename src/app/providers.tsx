'use client'

import { ReactNode, useEffect } from 'react'
import { ThemeProvider, useTheme } from 'next-themes'
import { I18nProvider } from '@/lib/i18n'
import { loadThemeConfig, applyAccentTheme } from '@ground/ui/theme'

function AccentThemeInit() {
  const { resolvedTheme } = useTheme()
  useEffect(() => {
    // Re-apply accent tokens when dark/light mode changes
    // so contrast adjustments update for the new background
    const isDark = resolvedTheme === 'dark'
    applyAccentTheme(loadThemeConfig(), isDark)
  }, [resolvedTheme])
  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
      <I18nProvider>
        <AccentThemeInit />
        {children}
      </I18nProvider>
    </ThemeProvider>
  )
}
