import { Languages } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { buttonTap } from '../utils/animations'

function LanguageSwitcher() {
  const { t, i18n } = useTranslation()
  const language = i18n.language

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-gold/25 bg-white/72 p-1 shadow-[0_10px_28px_rgba(37,0,47,0.08)] backdrop-blur-xl">
      <Languages className="mx-1 hidden h-4 w-4 text-burgundy sm:block" aria-hidden="true" />
      {['ar', 'en'].map((item) => (
        <motion.button
          key={item}
          type="button"
          onClick={() => i18n.changeLanguage(item)}
          aria-label={`${t('language.label')} ${item}`}
          whileTap={buttonTap}
          className="relative min-h-9 min-w-9 rounded-full px-2 text-xs font-black text-purpleDark/78 transition hover:text-purpleDark"
        >
          {language === item && (
            <motion.span
              layoutId="language-active-pill"
              className="absolute inset-0 rounded-full bg-purpleDeep shadow-sm"
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            />
          )}
          <span className={`relative z-10 ${language === item ? 'text-goldLight' : ''}`}>
            {item === 'ar' ? 'ع' : 'EN'}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
