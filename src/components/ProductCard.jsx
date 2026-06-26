import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCart } from '../hooks/useCart'
import { buttonHover, buttonTap, staggerItem } from '../utils/animations'

function ProductCard({ product }) {
  const { t, i18n } = useTranslation()
  const { addProduct } = useCart()
  const isArabic = i18n.language === 'ar'
  const name = isArabic ? product.nameAr : product.nameEn
  const category = isArabic ? product.categoryAr : product.categoryEn
  const isFinalAd = product.source === 'excel-final-ad'
  const [justAdded, setJustAdded] = useState(false)

  const handleAdd = () => {
    addProduct(product)
    setJustAdded(true)
    window.setTimeout(() => setJustAdded(false), 900)
  }

  return (
    <motion.article
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -6 }}
      className="group flex min-h-[280px] flex-col overflow-hidden rounded-[1.75rem] border border-white/80 bg-white/80 p-3 shadow-luxury backdrop-blur-xl transition duration-300 hover:shadow-gold"
    >
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-cream via-white to-gold/10">
        <img
          src={product.image}
          alt={name}
          loading="lazy"
          decoding="async"
          width="320"
          height="320"
          className={`h-full w-full object-contain transition duration-500 group-hover:scale-[1.025] ${
            isFinalAd ? 'p-1.5' : 'p-4'
          }`}
        />
        {!isFinalAd && (
          <span className="absolute top-3 rounded-full bg-purpleDeep/85 px-3 py-1 text-[11px] font-bold text-goldLight shadow-sm ltr:left-3 rtl:right-3">
            {category}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-1 pt-3">
        {isFinalAd && (
          <span className="w-fit rounded-full bg-gold/12 px-3 py-1 text-[11px] font-black text-burgundy">
            {category}
          </span>
        )}
        <h3 className="line-clamp-2 min-h-12 text-sm font-black leading-6 text-purpleDark sm:text-base">
          {name}
        </h3>
        <motion.button
          type="button"
          onClick={handleAdd}
          whileHover={buttonHover}
          whileTap={buttonTap}
          animate={justAdded ? { boxShadow: '0 0 0 5px rgba(212,175,55,0.22)' } : undefined}
          className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-burgundy to-purpleDeep px-4 py-3 text-sm font-black text-white shadow-lg shadow-burgundy/25 transition hover:from-purpleDeep hover:to-burgundy focus:outline-none focus:ring-4 focus:ring-gold/30"
        >
          <motion.span animate={justAdded ? { scale: [1, 1.25, 1] } : undefined}>
            <ShoppingBag className="h-4 w-4" />
          </motion.span>
          {justAdded ? t('cart.title') : t('actions.addToOrder')}
        </motion.button>
      </div>
    </motion.article>
  )
}

export default memo(ProductCard)
