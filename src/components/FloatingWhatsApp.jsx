import { MessageCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useCart } from '../hooks/useCart'
import { openWhatsAppContact } from '../utils/whatsapp'
import { buttonTap } from '../utils/animations'

function FloatingWhatsApp() {
  const { t } = useTranslation()
  const { cartCount, openCart } = useCart()

  const handleClick = () => {
    if (cartCount > 0) {
      openCart()
      return
    }
    openWhatsAppContact()
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label={t('actions.whatsappContact')}
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={buttonTap}
      className="whatsapp-breathe fixed bottom-24 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white ring-4 ring-white/45 transition lg:bottom-6 ltr:right-4 rtl:left-4"
    >
      <MessageCircle className="h-7 w-7" />
    </motion.button>
  )
}

export default FloatingWhatsApp
