import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ar from './locales/ar.json'
import en from './locales/en.json'

const storedLanguage = localStorage.getItem('mecca-alamer-lang') || 'ar'

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: storedLanguage,
  fallbackLng: 'ar',
  interpolation: {
    escapeValue: false,
  },
})

function updateDocumentLanguage(language) {
  document.documentElement.lang = language
  document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
}

updateDocumentLanguage(storedLanguage)

i18n.on('languageChanged', (language) => {
  localStorage.setItem('mecca-alamer-lang', language)
  updateDocumentLanguage(language)
})

export default i18n
