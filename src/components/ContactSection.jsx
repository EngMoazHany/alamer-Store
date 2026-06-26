import { MapPin, MessageCircle, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { storeInfo } from '../data/storeInfo'
import { getWhatsAppContactUrl } from '../utils/whatsapp'
import {
  buttonHover,
  buttonTap,
  fadeUp,
  luxuryCardReveal,
  staggerContainer,
  staggerItem,
  viewportOnce,
} from '../utils/animations'

function ContactSection() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const address = isArabic ? storeInfo.addressAr : storeInfo.addressEn

  const rows = [
    { icon: Phone, label: t('contact.phone'), value: storeInfo.phone },
    { icon: MessageCircle, label: t('contact.whatsappOrder'), value: storeInfo.whatsapp },
    { icon: MapPin, label: t('contact.address'), value: address },
  ]

  return (
    <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={luxuryCardReveal}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="overflow-hidden rounded-[2rem] border border-gold/18 bg-[radial-gradient(circle_at_top,#8A1E4D_0%,#3B0A50_45%,#25002F_100%)] p-5 text-white shadow-[0_30px_86px_rgba(37,0,47,0.20)] lg:p-8"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={viewportOnce}>
              <span className="rounded-full border border-gold/40 px-4 py-2 text-xs font-black text-goldLight">
                {t('sections.contact')}
              </span>
              <h2 className="mt-5 text-3xl font-black sm:text-4xl">{isArabic ? storeInfo.nameAr : storeInfo.nameEn}</h2>
              <p className="mt-3 max-w-xl font-semibold leading-8 text-cream/85">
                {isArabic ? storeInfo.fieldAr : storeInfo.fieldEn}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <motion.a
                  href={`tel:${storeInfo.phone}`}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-goldLight px-5 text-sm font-black text-purpleDark shadow-[0_14px_34px_rgba(212,175,55,0.24)]"
                >
                  <Phone className="h-4 w-4" />
                  {t('actions.callNow')}
                </motion.a>
                <motion.a
                  href={getWhatsAppContactUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-gold/35 bg-white/11 px-5 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('actions.whatsapp')}
                </motion.a>
                <motion.a
                  href={storeInfo.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-gold/35 bg-white/11 px-5 text-sm font-black text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                >
                  <MapPin className="h-4 w-4" />
                  {t('actions.openLocation')}
                </motion.a>
              </div>
            </motion.div>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="grid gap-3"
            >
              {rows.map((row) => {
                const Icon = row.icon
                return (
                  <motion.div
                    key={row.label}
                    variants={staggerItem}
                    whileHover={{ y: -3, borderColor: 'rgba(212,175,55,0.34)' }}
                    className="rounded-3xl border border-white/15 bg-white/[0.105] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur"
                  >
                    <div className="flex gap-3">
                      <motion.div
                        whileHover={{ scale: 1.08 }}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold text-purpleDark"
                      >
                        <Icon className="h-5 w-5" />
                      </motion.div>
                      <div>
                        <p className="text-xs font-black text-goldLight">{row.label}</p>
                        <p className="mt-1 text-sm font-bold leading-7 text-white">{row.value}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactSection
