import { Award, BriefcaseBusiness, Crown, Gem, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo/alamer-logo.png'
import { storeInfo } from '../data/storeInfo'
import {
  fadeUp,
  luxuryCardReveal,
  scaleIn,
  staggerContainer,
  staggerItem,
  viewportOnce,
} from '../utils/animations'

const managementIcons = [Crown, BriefcaseBusiness, TrendingUp]

function AboutSection() {
  const { t, i18n } = useTranslation()
  const isArabic = i18n.language === 'ar'
  const badges = t('hero.badges', { returnObjects: true })

  return (
    <section className="relative isolate overflow-hidden bg-[linear-gradient(180deg,#FFF8EA_0%,#FFFFFF_52%,#FFF8EA_100%)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="absolute inset-0 -z-10 [background:radial-gradient(circle_at_16%_18%,rgba(212,175,55,0.18),transparent_24%),radial-gradient(circle_at_84%_62%,rgba(138,30,77,0.10),transparent_26%)]" />
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <motion.div
            variants={luxuryCardReveal}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="relative overflow-hidden rounded-[1.65rem] border border-gold/25 bg-[linear-gradient(135deg,#25002F_0%,#3B0A50_52%,#8A1E4D_100%)] p-5 text-white shadow-[0_28px_78px_rgba(37,0,47,0.18)] sm:p-7"
          >
            <div className="gold-line-shimmer absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
            <div className="absolute -bottom-20 -right-20 h-52 w-52 rounded-full border border-gold/14 rtl:-left-20 rtl:right-auto" />
            <div className="relative flex min-h-[23rem] flex-col justify-between">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 rounded-full border border-gold/35 bg-white/10 px-4 py-2 text-xs font-black text-goldLight backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  {t('sections.about')}
                </span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/15 text-goldLight">
                  <Gem className="h-6 w-6" />
                </span>
              </div>

              <motion.div
                variants={scaleIn}
                className="mx-auto my-6 flex h-[8.5rem] w-[8.5rem] items-center justify-center rounded-full bg-[radial-gradient(circle,#F4D77A_0%,#D4AF37_45%,rgba(255,255,255,0.12)_72%,transparent_74%)] p-[1px] shadow-[0_24px_80px_rgba(212,175,55,0.22)] sm:h-[9.5rem] sm:w-[9.5rem]"
                whileHover={{ scale: 1.03, filter: 'drop-shadow(0 0 18px rgba(212,175,55,0.38))' }}
              >
                <img src={logo} alt={t('splash.name')} className="h-full w-full rounded-full object-cover" />
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                className="grid grid-cols-2 gap-3"
              >
                <motion.div variants={staggerItem} className="rounded-3xl border border-white/12 bg-white/[0.08] p-4 backdrop-blur">
                  <ShieldCheck className="h-5 w-5 text-goldLight" />
                  <p className="mt-3 text-sm font-black text-cream">{badges[3]}</p>
                </motion.div>
                <motion.div variants={staggerItem} className="rounded-3xl border border-white/12 bg-white/[0.08] p-4 backdrop-blur">
                  <Award className="h-5 w-5 text-goldLight" />
                  <p className="mt-3 text-sm font-black text-cream">{badges[0]}</p>
                </motion.div>
              </motion.div>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                className="mt-4 grid gap-2"
              >
                {storeInfo.management.map((member, index) => {
                  const Icon = managementIcons[index] || Award
                  const role = isArabic ? member.roleAr : member.roleEn
                  const name = isArabic ? member.nameAr : member.nameEn

                  return (
                    <motion.div
                      key={member.roleEn}
                      variants={staggerItem}
                      whileHover={{ y: -2, borderColor: 'rgba(212,175,55,0.35)' }}
                      className="flex items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.075] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur transition hover:border-gold/28 hover:bg-white/[0.105]"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/24 bg-gold/12 text-goldLight">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[11px] font-black text-goldLight">{role}</span>
                        <span className="mt-0.5 block truncate text-sm font-black text-cream">{name}</span>
                      </span>
                    </motion.div>
                  )
                })}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            className="relative overflow-hidden rounded-[1.65rem] border border-gold/22 bg-white/82 p-5 shadow-[0_26px_70px_rgba(37,0,47,0.10)] backdrop-blur-xl sm:p-8 lg:p-10"
          >
            <div className="absolute -top-16 h-40 w-40 rounded-full bg-gold/10 blur-2xl ltr:-right-14 rtl:-left-14" />
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/13 px-4 py-2 text-xs font-black text-burgundy">
              <Sparkles className="h-4 w-4" />
              {t('sections.about')}
            </span>
            <h2 className="mt-5 text-4xl font-black leading-tight text-purpleDark sm:text-5xl">
              {t('hero.headline')}
            </h2>
            <p className="mt-5 max-w-3xl text-base font-bold leading-9 text-purpleDark/72 sm:text-lg">
              {t('about.text')}
            </p>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className="mt-7 grid gap-3 sm:grid-cols-3"
            >
              {badges.slice(0, 3).map((badge) => (
                <motion.div key={badge} variants={staggerItem} className="rounded-2xl border border-gold/18 bg-cream/68 p-4 shadow-sm">
                  <p className="text-sm font-black text-burgundy">{badge}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
