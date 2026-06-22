import { Camera, Globe2, MapPin, MessageCircle, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo/alamer-logo.png'
import { storeInfo } from '../data/storeInfo'
import { fadeUp, staggerContainer, staggerItem, viewportOnce } from '../utils/animations'

function Footer() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  return (
    <motion.footer
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="relative overflow-hidden bg-[linear-gradient(145deg,#25002F_0%,#2E043B_54%,#180020_100%)] px-4 pb-28 pt-10 text-cream sm:px-6 lg:px-8 lg:pb-10"
    >
      <div className="gold-line-shimmer absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div className="absolute -top-24 h-52 w-52 rounded-full bg-burgundy/22 blur-3xl ltr:-right-16 rtl:-left-16" />

      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr] lg:items-start">
        <motion.div variants={fadeUp} className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <motion.img
              src={logo}
              alt={t('splash.name')}
              whileHover={{ scale: 1.05, filter: 'drop-shadow(0 0 14px rgba(212,175,55,0.40))' }}
              className="h-16 w-16 shrink-0 rounded-full border border-gold/35 object-cover shadow-[0_14px_38px_rgba(212,175,55,0.18)]"
            />
            <div className="min-w-0">
              <h2 className="truncate text-3xl font-black text-goldLight">
                {isArabic ? storeInfo.nameAr : storeInfo.nameEn}
              </h2>
              <p className="mt-1 font-black text-white">{isArabic ? storeInfo.fullNameAr : storeInfo.fullNameEn}</p>
              <p className="mt-1 text-sm font-bold text-cream/68">{isArabic ? storeInfo.fieldAr : storeInfo.fieldEn}</p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={staggerContainer} className="grid gap-3 text-sm font-bold leading-7 text-cream/86">
          <motion.div variants={staggerItem} className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
            <Phone className="mt-1 h-5 w-5 shrink-0 text-goldLight" />
            <span>{storeInfo.phone}</span>
          </motion.div>
          <motion.div variants={staggerItem} className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
            <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-goldLight" />
            <span>{storeInfo.whatsapp}</span>
          </motion.div>
          <motion.div variants={staggerItem} className="flex gap-3 rounded-3xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
            <MapPin className="mt-1 h-5 w-5 shrink-0 text-goldLight" />
            <span>{isArabic ? storeInfo.addressAr : storeInfo.addressEn}</span>
          </motion.div>
          <div className="flex gap-2">
            {[Globe2, Camera, MessageCircle].map((Icon, index) => (
              <motion.span
                key={index}
                whileHover={{ y: -3, scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/25 bg-gold/8 text-goldLight shadow-sm"
              >
                <Icon className="h-5 w-5" />
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        variants={fadeUp}
        className="mx-auto mt-8 max-w-7xl border-t border-gold/16 pt-5 text-center text-xs font-bold text-cream/62"
      >
        © {new Date().getFullYear()} {isArabic ? storeInfo.nameAr : storeInfo.nameEn}. {t('footer.copyright')}.
      </motion.div>
      <motion.div
        variants={fadeUp}
        className="mx-auto mt-3 max-w-7xl text-center text-[11px] font-black tracking-wide text-goldLight/85"
      >
        {t('footer.developerCredit')}
      </motion.div>
    </motion.footer>
  )
}

export default Footer
