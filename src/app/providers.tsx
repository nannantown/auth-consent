'use client'

import { ReactNode } from 'react'
import { I18nProvider } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/language-switcher'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <LanguageSwitcher />
      {children}
    </I18nProvider>
  )
}
