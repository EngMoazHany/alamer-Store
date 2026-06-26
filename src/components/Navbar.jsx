import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { NavLink, Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import logo from '../assets/logo/alamer-logo.png'
import LanguageSwitcher from './LanguageSwitcher'
import { useCart } from '../hooks/useCart'
import { buttonTap, fadeDown } from '../utils/animations'

function Navbar() {
  const { t } = useTranslation()
  const { cartCount, openCart } = useCart()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/products', label: t('nav.products') },
    { to: '/about', label: t('nav.about') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={fadeDown}
      className={`sticky top-0 z-40 transition duration-300 ${
        scrolled
          ? 'border-b border-gold/25 bg-cream/92 shadow-[0_16px_46px_rgba(37,0,47,0.12)] backdrop-blur-2xl'
          : 'border-b border-gold/10 bg-cream/82 backdrop-blur-xl'
      }`}
    >
      <nav className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-6 lg:px-8">
        <motion.div whileHover={{ scale: 1.015 }} whileTap={buttonTap}>
        <Link
          to="/"
          aria-label={t('nav.home')}
          className="group flex min-w-0 items-center gap-2 rounded-full border border-gold/24 bg-gradient-to-r from-white/92 to-cream/86 py-1.5 pl-3 pr-1.5 shadow-[0_12px_34px_rgba(37,0,47,0.10)] backdrop-blur-xl transition hover:border-gold/45 rtl:pl-1.5 rtl:pr-3"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[radial-gradient(circle,#F4D77A_0%,#D4AF37_48%,#3B0A50_100%)] p-[1px] shadow-sm transition group-hover:shadow-[0_0_22px_rgba(212,175,55,0.38)]">
            <img src={logo} alt={t('splash.name')} className="h-full w-full rounded-full object-cover" />
          </span>
          <span className="min-w-0 px-1">
            <span className="block truncate text-[15px] font-black leading-5 text-purpleDark sm:text-base">
              {t('splash.name')}
            </span>
            <span className="block truncate text-[10px] font-extrabold leading-4 text-burgundy sm:text-[11px]">
              {t('hero.subtitle')}
            </span>
          </span>
        </Link>
        </motion.div>

        <div className="hidden items-center gap-1 rounded-full border border-gold/22 bg-white/68 p-1 shadow-[0_12px_34px_rgba(37,0,47,0.09)] backdrop-blur-xl lg:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="relative rounded-full px-5 py-2.5 text-sm font-black text-purpleDark/80 transition hover:text-purpleDark"
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-pill"
                      className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#3B0A50,#8A1E4D)] shadow-[inset_0_0_0_1px_rgba(244,215,122,0.34),0_10px_24px_rgba(59,10,80,0.18)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className={`relative z-10 ${isActive ? 'text-goldLight' : ''}`}>{link.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher />
          <motion.button
            type="button"
            onClick={openCart}
            aria-label={t('actions.openCart')}
            whileHover={{ y: -2, scale: 1.04 }}
            whileTap={buttonTap}
            animate={cartCount > 0 ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={{ duration: 0.28 }}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_25%,#8A1E4D,#3B0A50_68%,#25002F)] text-goldLight shadow-[0_12px_34px_rgba(92,18,53,0.30)] transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-gold/25"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-black text-purpleDark ring-2 ring-cream ltr:-right-1 rtl:-left-1">
                {cartCount}
              </span>
            )}
          </motion.button>
        </div>
      </nav>
    </motion.header>
  )
}

export default Navbar
