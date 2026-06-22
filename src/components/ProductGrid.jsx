import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SearchBar from './SearchBar'
import ProductCard from './ProductCard'
import { fadeDown, fadeUp, staggerContainer, staggerItem, viewportOnce } from '../utils/animations'

function ProductGrid({ products, limit }) {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const isArabic = i18n.language === 'ar'

  const categories = useMemo(() => {
    const categoryMap = new Map()
    products.forEach((product) => {
      const key = `${product.categoryAr}|${product.categoryEn}`
      if (!categoryMap.has(key)) {
        categoryMap.set(key, {
          id: key,
          label: isArabic ? product.categoryAr : product.categoryEn,
        })
      }
    })
    return [{ id: 'all', label: t('products.allProducts') }, ...categoryMap.values()]
  }, [products, isArabic, t])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchesCategory = (product) =>
      category === 'all' || `${product.categoryAr}|${product.categoryEn}` === category

    return products
      .filter((product) => {
        const searchable = [
          product.nameAr,
          product.nameEn,
          product.filename,
          product.categoryAr,
          product.categoryEn,
        ]
          .join(' ')
          .toLowerCase()

        return matchesCategory(product) && (!normalizedQuery || searchable.includes(normalizedQuery))
      })
      .slice(0, limit || products.length)
  }, [products, query, category, limit])

  if (!products.length) {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="rounded-[2rem] border border-gold/25 bg-white/75 p-8 text-center font-bold text-purpleDark shadow-luxury"
      >
        {t('products.noProducts')}
      </motion.div>
    )
  }

  return (
    <div className="space-y-5">
      <motion.div variants={fadeDown} initial="hidden" whileInView="visible" viewport={viewportOnce}>
        <SearchBar value={query} onChange={setQuery} />
      </motion.div>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="no-scrollbar flex gap-2 overflow-x-auto pb-1"
      >
        {categories.map((item) => {
          const active = item.id === category
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              variants={staggerItem}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-black transition ${
                active
                  ? 'border-gold bg-purpleDeep text-goldLight shadow-gold'
                  : 'border-gold/25 bg-white/75 text-purpleDark hover:border-gold'
              }`}
            >
              {item.label}
            </motion.button>
          )
        })}
      </motion.div>
      {filteredProducts.length ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          <AnimatePresence initial={false}>
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="rounded-[2rem] border border-gold/25 bg-white/75 p-8 text-center font-bold text-purpleDark"
        >
          {t('products.empty')}
        </motion.div>
      )}
    </div>
  )
}

export default ProductGrid
