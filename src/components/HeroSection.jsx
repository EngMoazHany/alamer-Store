import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo/alamer-logo.png'
import reference from '../assets/logo/alamer-reference.png'
import { openWhatsAppContact } from '../utils/whatsapp'
import {
  buttonHover,
  buttonTap,
  fadeUp,
  scaleIn,
  staggerContainer,
  staggerItem,
} from '../utils/animations'

function HeroSection() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const ArrowIcon = isArabic ? ArrowLeft : ArrowRight
  const badges = t('hero.badges', { returnObjects: true })

  return (
    <section className="luxury-gradient-motion relative isolate overflow-hidden bg-[linear-gradient(135deg,#25002F_0%,#3B0A50_42%,#8A1E4D_100%)] px-4 pb-12 pt-7 text-white sm:px-6 lg:px-8 lg:pb-20 lg:pt-14">
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.65, 0.95, 0.65], scale: [1, 1.04, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 -z-10 opacity-85 [background:radial-gradient(circle_at_18%_18%,rgba(244,215,122,0.18),transparent_26%),radial-gradient(circle_at_78%_22%,rgba(138,30,77,0.55),transparent_28%),radial-gradient(circle_at_55%_88%,rgba(212,175,55,0.12),transparent_24%)]"
      />
      <div className="gold-line-shimmer absolute inset-x-6 top-9 -z-10 h-px bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -z-10 h-72 w-72 rounded-full border border-gold/14 ltr:-right-20 rtl:-left-20"
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-10 -z-10 h-52 w-52 rounded-full border border-gold/12 ltr:left-8 rtl:right-8"
      />

      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative overflow-hidden rounded-[2rem] border border-white/14 bg-white/[0.085] p-5 shadow-[0_28px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-8 lg:p-10"
        >
          <div className="gold-line-shimmer absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
          <motion.span variants={staggerItem} className="inline-flex max-w-full items-center gap-2 rounded-full border border-gold/35 bg-gold/12 px-4 py-2 text-xs font-black text-goldLight shadow-sm">
            <Sparkles className="h-4 w-4 shrink-0" />
            <span className="truncate">{t('hero.subtitle')}</span>
          </motion.span>

          <motion.h1 variants={fadeUp} className="mt-6 max-w-3xl text-[2.55rem] font-black leading-[1.12] text-white sm:text-6xl lg:text-7xl">
            {t('hero.headline')}
          </motion.h1>
          <motion.p variants={staggerItem} className="mt-5 max-w-2xl text-[1.02rem] font-bold leading-8 text-cream/88 sm:text-lg">
            {t('hero.description')}
          </motion.p>

          <motion.div variants={staggerContainer} className="mt-7 grid gap-3 sm:max-w-xl sm:grid-cols-2">
            <motion.div variants={staggerItem} whileHover={buttonHover} whileTap={buttonTap}>
            <Link
              to="/products"
              className="gold-shimmer inline-flex min-h-[3.35rem] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-goldLight px-6 text-sm font-black text-purpleDark shadow-[0_18px_46px_rgba(212,175,55,0.28)]"
            >
              {t('actions.browseProducts')}
              <ArrowIcon className="h-4 w-4" />
            </Link>
            </motion.div>
            <motion.button
              type="button"
              onClick={openWhatsAppContact}
              variants={staggerItem}
              whileHover={buttonHover}
              whileTap={buttonTap}
              className="inline-flex min-h-[3.35rem] items-center justify-center gap-2 rounded-2xl border border-gold/35 bg-white/10 px-6 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur transition hover:bg-white/15"
            >
              <MessageCircle className="h-4 w-4" />
              {t('actions.whatsappContact')}
            </motion.button>
          </motion.div>

          <motion.div variants={staggerContainer} className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {badges.map((badge) => (
              <motion.span
                key={badge}
                variants={staggerItem}
                className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.075] px-3 text-center text-xs font-black text-cream"
              >
                <CheckCircle2 className="hidden h-4 w-4 text-goldLight sm:block" />
                {badge}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          className="soft-float relative mx-auto w-full max-w-[25rem] lg:max-w-[29rem]"
        >
          <div className="absolute -inset-4 rounded-[2.4rem] border border-gold/14 bg-white/[0.035]" />
          <div className="relative overflow-hidden rounded-[2.15rem] border border-gold/25 bg-gradient-to-br from-cream via-white to-goldLight/35 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.26)]">
            <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-gold/65 to-transparent" />
            <img
              src={reference}
              alt={t('hero.headline')}
              className="aspect-[4/4.55] w-full rounded-[1.65rem] object-cover object-center"
            />
            <div className="absolute inset-x-5 bottom-5 rounded-[1.35rem] border border-white/55 bg-cream/88 p-3 shadow-luxury backdrop-blur">
              <div className="flex items-center gap-3">
                <img src={logo} alt={t('splash.name')} className="h-11 w-11 shrink-0 rounded-full object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-purpleDark">{t('splash.name')}</p>
                  <p className="truncate text-xs font-extrabold text-burgundy">{t('splash.subtitle')}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
