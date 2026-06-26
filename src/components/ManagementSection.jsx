import {
  BriefcaseBusiness,
  Crown,
  MessageCircle,
  Phone,
  TrendingUp,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { storeInfo } from '../data/storeInfo'
import { getWhatsAppContactUrl } from '../utils/whatsapp'
import {
  buttonHover,
  buttonTap,
  fadeUp,
  staggerContainer,
  staggerItem,
  viewportOnce,
} from '../utils/animations'

const roleIcons = [Crown, BriefcaseBusiness, TrendingUp]

function buildWhatsAppUrl(contact, role, isArabic) {
  const message = isArabic
    ? `السلام عليكم، أريد التواصل مع ${role} في مكة العامر.`
    : `Hello, I would like to contact the ${role} at Mecca Al Amer.`

  return getWhatsAppContactUrl(message, contact.whatsapp)
}

function ManagementSection() {
  const { i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'

  const content = {
    title: isArabic ? 'إدارة مكة العامر' : 'Mecca Al Amer Management',
    subtitle: isArabic
      ? 'فريق الإدارة جاهز للتواصل معكم وخدمتكم في أي وقت.'
      : 'Our management team is ready to assist you anytime.',
    kicker: isArabic ? 'فريق الإدارة' : 'Management Team',
    call: isArabic ? 'اتصال' : 'Call',
    whatsapp: isArabic ? 'واتساب' : 'WhatsApp',
  }

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFF8EA_0%,#FFFFFF_52%,#FFF8EA_100%)] px-4 py-14 sm:px-6 lg:px-8 lg:py-[4.5rem]">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_18%_14%,rgba(212,175,55,0.18),transparent_24%),radial-gradient(circle_at_86%_72%,rgba(138,30,77,0.10),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="mx-auto mb-8 max-w-2xl text-center"
        >
          <span className="inline-flex rounded-full border border-gold/30 bg-white/75 px-4 py-2 text-xs font-black text-burgundy shadow-sm">
            {content.kicker}
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight text-purpleDark sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-3 text-sm font-bold leading-7 text-purpleDark/70 sm:text-base">
            {content.subtitle}
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="grid gap-4 lg:grid-cols-3"
        >
          {storeInfo.management.map((contact, index) => {
            const Icon = roleIcons[index] || BriefcaseBusiness
            const role = isArabic ? contact.roleAr : contact.roleEn
            const name = isArabic ? contact.nameAr : contact.nameEn

            return (
              <motion.article
                key={contact.phone}
                variants={staggerItem}
                whileHover={{ y: -6, borderColor: 'rgba(212,175,55,0.42)' }}
                className="group relative overflow-hidden rounded-[1.6rem] border border-gold/22 bg-white/84 p-5 shadow-[0_22px_64px_rgba(37,0,47,0.11)] backdrop-blur-xl transition duration-300 hover:shadow-gold"
              >
                <div className="gold-line-shimmer absolute inset-x-7 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
                <div className="absolute -top-14 h-32 w-32 rounded-full bg-gold/12 blur-2xl ltr:-right-12 rtl:-left-12" />

                <div className="relative flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: -3 }}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_35%_25%,#8A1E4D,#3B0A50_68%,#25002F)] text-goldLight shadow-[0_16px_38px_rgba(59,10,80,0.24)]"
                  >
                    <Icon className="h-7 w-7" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-flex rounded-full bg-gold/15 px-3 py-1 text-[11px] font-black text-burgundy">
                      {role}
                    </span>
                    <h3 className="mt-3 text-xl font-black leading-8 text-purpleDark">{name}</h3>
                    <a
                      href={`tel:${contact.phone}`}
                      className="mt-1 inline-flex text-sm font-extrabold text-purpleDark/70 transition hover:text-burgundy"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>

                <div className="relative mt-6 grid grid-cols-2 gap-2">
                  <motion.a
                    href={`tel:${contact.phone}`}
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-gold to-goldLight px-4 text-sm font-black text-purpleDark shadow-[0_14px_34px_rgba(212,175,55,0.20)]"
                  >
                    <Phone className="h-4 w-4" />
                    {content.call}
                  </motion.a>
                  <motion.a
                    href={buildWhatsAppUrl(contact, role, isArabic)}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={buttonHover}
                    whileTap={buttonTap}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 text-sm font-black text-white shadow-[0_14px_34px_rgba(37,211,102,0.20)]"
                  >
                    <MessageCircle className="h-4 w-4" />
                    {content.whatsapp}
                  </motion.a>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default ManagementSection
