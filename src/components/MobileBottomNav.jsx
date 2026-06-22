import { Home, MessageCircle, PackageSearch, ShoppingBag } from 'lucide-react'
import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useCart } from '../hooks/useCart'
import { buttonTap } from '../utils/animations'

function MobileBottomNav() {
  const { t } = useTranslation()
  const { cartCount, openCart } = useCart()

  const links = [
    { to: '/', label: t('nav.home'), icon: Home },
    { to: '/products', label: t('nav.products'), icon: PackageSearch },
  ]

  const itemClass =
    'relative flex min-h-[3.35rem] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black text-purpleDark/84 transition hover:bg-gold/10'

  const navContent = (isActive, Icon, label) => (
    <>
      {isActive && (
        <motion.span
          layoutId="mobile-nav-active-pill"
          className="absolute inset-0 rounded-2xl bg-purpleDeep shadow-[0_10px_24px_rgba(59,10,80,0.22)]"
          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        />
      )}
      <motion.span className="relative z-10" whileTap={buttonTap}>
        <Icon className={`h-5 w-5 ${isActive ? 'text-goldLight' : ''}`} />
      </motion.span>
      <span className={`relative z-10 ${isActive ? 'text-goldLight' : ''}`}>{label}</span>
    </>
  )

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/20 bg-cream/88 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-18px_48px_rgba(37,0,47,0.14)] backdrop-blur-2xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1.5 rounded-[1.6rem] border border-white/70 bg-white/35 p-1">
        {links.map((link) => {
          const Icon = link.icon
          return (
            <NavLink key={link.to} to={link.to} className={itemClass}>
              {({ isActive }) => navContent(isActive, Icon, link.label)}
            </NavLink>
          )
        })}
        <motion.button
          type="button"
          onClick={openCart}
          whileTap={buttonTap}
          className="relative flex min-h-[3.35rem] flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-black text-purpleDark/84 transition hover:bg-gold/10"
        >
          <ShoppingBag className="h-5 w-5" />
          <span>{t('nav.cart')}</span>
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0.7 }}
              animate={{ scale: [1, 1.2, 1] }}
              className="absolute top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] text-white ring-2 ring-cream ltr:right-5 rtl:left-5"
            >
              {cartCount}
            </motion.span>
          )}
        </motion.button>
        <NavLink to="/contact" className={itemClass}>
          {({ isActive }) => navContent(isActive, MessageCircle, t('nav.contact'))}
        </NavLink>
      </div>
    </div>
  )
}

export default MobileBottomNav
