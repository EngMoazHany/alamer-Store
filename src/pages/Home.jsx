import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import AboutSection from '../components/AboutSection'
import ContactSection from '../components/ContactSection'
import HeroSection from '../components/HeroSection'
import ProductGrid from '../components/ProductGrid'
import SectionTitle from '../components/SectionTitle'
import { fadeUp, viewportOnce } from '../utils/animations'
import { getProducts } from '../utils/productsLoader'

function Home() {
  const { t } = useTranslation()
  const products = getProducts()

  return (
    <>
      <HeroSection />
      <motion.section
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="relative overflow-hidden bg-[linear-gradient(180deg,#FFF8EA_0%,#FFFFFF_100%)] px-4 py-14 sm:px-6 lg:px-8 lg:py-[4.5rem]"
      >
        <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent" />
        <div className="absolute -top-20 h-48 w-48 rounded-full bg-gold/10 blur-3xl ltr:-left-16 rtl:-right-16" />
        <div className="mx-auto max-w-7xl">
          <SectionTitle kicker={t('sections.featuredKicker')} title={t('sections.featured')} />
          <ProductGrid products={products} limit={8} />
        </div>
      </motion.section>
      <AboutSection />
      <ContactSection />
    </>
  )
}

export default Home
