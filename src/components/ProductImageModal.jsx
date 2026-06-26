import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ShoppingBag, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCart } from '../hooks/useCart'
import { buttonTap } from '../utils/animations'

function ProductImageModal({ product, onClose }) {
  const { t, i18n } = useTranslation()
  const { addProduct } = useCart()
  const shouldReduceMotion = useReducedMotion()
  const isArabic = i18n.language === 'ar'
  const name = product ? (isArabic ? product.nameAr : product.nameEn) : ''
  const title = isArabic ? 'عرض المنتج' : 'Product Preview'
  const closeLabel = isArabic ? 'إغلاق' : 'Close'
  const addLabel = isArabic ? 'أضف للطلب' : 'Add to Order'

  useEffect(() => {
    if (!product) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose, product])

  const handleAddToOrder = () => {
    if (!product) return
    addProduct(product)
  }

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[rgba(20,0,30,0.75)] px-3 py-5 backdrop-blur-md sm:px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.65rem] border border-gold/55 bg-[linear-gradient(145deg,rgba(255,248,234,0.98),rgba(255,255,255,0.96))] shadow-[0_34px_110px_rgba(0,0,0,0.46),0_0_0_1px_rgba(244,215,122,0.15)]"
            initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96, y: shouldReduceMotion ? 0 : 12 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-gold/18 bg-white/70 px-4 py-3 backdrop-blur sm:px-5">
              <div className="min-w-0">
                <p className="text-xs font-black text-burgundy">{title}</p>
                <h2 className="truncate text-sm font-black text-purpleDark sm:text-base">{name}</h2>
              </div>
              <motion.button
                type="button"
                aria-label={closeLabel}
                onClick={onClose}
                whileTap={buttonTap}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purpleDeep text-goldLight shadow-[0_12px_30px_rgba(37,0,47,0.22)] focus:outline-none focus:ring-4 focus:ring-gold/30"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.14),transparent_34%)] p-3 sm:p-5">
              <img
                src={product.image}
                alt={name}
                loading="eager"
                decoding="async"
                className="max-h-[68vh] w-full rounded-[1.1rem] object-contain"
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-gold/18 bg-white/78 px-4 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="line-clamp-2 text-sm font-black leading-6 text-purpleDark">{name}</p>
              <motion.button
                type="button"
                onClick={handleAddToOrder}
                whileTap={buttonTap}
                whileHover={{ y: -2 }}
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-burgundy to-purpleDeep px-5 text-sm font-black text-white shadow-lg shadow-burgundy/25"
              >
                <ShoppingBag className="h-4 w-4" />
                {addLabel || t('actions.addToOrder')}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ProductImageModal
