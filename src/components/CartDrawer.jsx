import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, Send, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCart } from '../hooks/useCart'
import { buttonHover, buttonTap, staggerContainer, staggerItem } from '../utils/animations'
import { openWhatsAppOrder } from '../utils/whatsapp'
import EmptyCart from './EmptyCart'

function CartDrawer() {
  const { t, i18n } = useTranslation()
  const {
    items,
    isCartOpen,
    closeCart,
    removeProduct,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
  } = useCart()
  const isArabic = i18n.language === 'ar'

  const handleSendOrder = () => {
    if (!items.length) return
    openWhatsAppOrder(items, i18n.language)
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50">
          <motion.button
            type="button"
            aria-label={t('actions.close')}
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-purpleDark/55 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ opacity: 0, y: 80, x: 0 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 80, x: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 28 }}
            className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-luxury lg:inset-y-0 lg:bottom-auto lg:w-[430px] lg:max-h-none lg:rounded-none ltr:lg:right-0 rtl:lg:left-0"
          >
            <div className="flex items-center justify-between border-b border-gold/20 bg-cream/75 p-4">
              <div>
                <p className="text-xs font-black text-burgundy">{t('nav.cart')}</p>
                <h2 className="text-2xl font-black text-purpleDark">{t('cart.title')}</h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label={t('actions.close')}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-purpleDeep text-goldLight"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length ? (
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  <AnimatePresence initial={false}>
                  {items.map((item) => {
                    const name = isArabic ? item.nameAr : item.nameEn
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        variants={staggerItem}
                        exit={{ opacity: 0, x: isArabic ? -24 : 24, scale: 0.96 }}
                        className="rounded-3xl border border-gold/20 bg-cream/55 p-3"
                      >
                        <div className="flex gap-3">
                          <img
                            src={item.image}
                            alt={name}
                            className="h-20 w-20 shrink-0 rounded-2xl bg-white object-contain p-2"
                            loading="lazy"
                            decoding="async"
                            width="80"
                            height="80"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="line-clamp-2 text-sm font-black leading-6 text-purpleDark">
                              {name}
                            </h3>
                            <p className="text-xs font-bold text-burgundy">
                              {t('cart.quantity')}: {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 rounded-full bg-white p-1 shadow-sm">
                            <motion.button
                              type="button"
                              onClick={() => decreaseQuantity(item.id)}
                              aria-label={t('actions.decrease')}
                              whileTap={buttonTap}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-cream text-purpleDark"
                            >
                              <Minus className="h-4 w-4" />
                            </motion.button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 0.82, opacity: 0.6 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="w-8 text-center text-sm font-black"
                            >
                              {item.quantity}
                            </motion.span>
                            <motion.button
                              type="button"
                              onClick={() => increaseQuantity(item.id)}
                              aria-label={t('actions.increase')}
                              whileTap={buttonTap}
                              className="flex h-9 w-9 items-center justify-center rounded-full bg-purpleDeep text-goldLight"
                            >
                              <Plus className="h-4 w-4" />
                            </motion.button>
                          </div>
                          <motion.button
                            type="button"
                            onClick={() => removeProduct(item.id)}
                            whileHover={{ y: -1 }}
                            whileTap={buttonTap}
                            className="inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-xs font-black text-burgundy hover:bg-burgundy/10"
                          >
                            <Trash2 className="h-4 w-4" />
                            {t('actions.remove')}
                          </motion.button>
                        </div>
                      </motion.div>
                    )
                  })}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <EmptyCart />
              )}
            </div>

            <div className="space-y-3 border-t border-gold/20 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <motion.button
                type="button"
                onClick={handleSendOrder}
                disabled={!items.length}
                whileHover={items.length ? buttonHover : undefined}
                whileTap={items.length ? buttonTap : undefined}
                className="inline-flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-burgundy to-purpleDeep px-5 text-sm font-black text-white shadow-lg shadow-burgundy/25 transition disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Send className="h-4 w-4" />
                {t('actions.sendWhatsApp')}
              </motion.button>
              {items.length > 0 && (
                <motion.button
                  type="button"
                  onClick={clearCart}
                  whileTap={buttonTap}
                  className="min-h-11 w-full rounded-2xl border border-burgundy/20 text-sm font-black text-burgundy"
                >
                  {t('actions.clearCart')}
                </motion.button>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}

export default CartDrawer
