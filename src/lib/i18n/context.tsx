'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Language } from './translations'

type TranslationsType = typeof translations.ja

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationsType
}

const I18nContext = createContext<I18nContextType | null>(null)

const STORAGE_KEY = 'auth-consent-language'

function getBrowserLanguage(): Language {
  if (typeof window === 'undefined') return 'en'

  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('ja')) return 'ja'
  return 'en'
}

function getStoredLanguage(): Language | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ja' || stored === 'en') return stored
  } catch {
    // localStorage might not be available
  }
  return null
}

export function I18nProvider({ children }: { children: ReactNode }) {
  // Default to 'en' for SSR, will be updated client-side
  const [language, setLanguageState] = useState<Language>('en')

  useEffect(() => {
    // Only run on client-side
    const stored = getStoredLanguage()
    const detected = stored || getBrowserLanguage()
    setLanguageState(detected)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // localStorage might not be available
    }
  }

  const t = translations[language]

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// Helper function to replace placeholders like {email} in translation strings
export function formatMessage(message: string, params: Record<string, string>): string {
  return Object.entries(params).reduce(
    (msg, [key, value]) => msg.replace(`{${key}}`, value),
    message
  )
}
