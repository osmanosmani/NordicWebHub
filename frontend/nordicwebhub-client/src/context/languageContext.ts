import { createContext } from 'react'

export type Language = 'en' | 'sv'

export type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string
  translateStatus: (label: string) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

