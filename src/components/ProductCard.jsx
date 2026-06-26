import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, ZoomIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useCart } from '../hooks/useCart'
import { buttonHover, buttonTap, staggerItem } from '../utils/animations'

function ProductCard({ product, onImageClick }) {
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
      className="group flex min-h-[280px] flex-col overflow-hidden rounded-[1.45rem] border border-white/85 bg-white/86 p-2.5 shadow-[0_20px_58px_rgba(37,0,47,0.12)] backdrop-blur-xl transition duration-300 hover:border-gold/32 hover:shadow-gold sm:p-3"
    >
      <button
        type="button"
        onClick={() => onImageClick(product)}
        aria-label={`${isArabic ? 'عرض المنتج' : 'Product Preview'}: ${name}`}
        className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.15rem] bg-gradient-to-br from-cream via-white to-gold/10 focus:outline-none focus:ring-4 focus:ring-gold/30"
      >
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
        <span className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-1.5 rounded-full border border-white/45 bg-purpleDark/78 px-3 py-2 text-[11px] font-black text-goldLight opacity-0 shadow-lg backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <ZoomIn className="h-3.5 w-3.5" />
          {isArabic ? 'عرض' : 'Preview'}
        </span>
      </button>
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
