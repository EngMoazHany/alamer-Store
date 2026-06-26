import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import SearchBar from './SearchBar'
import ProductCard from './ProductCard'
import ProductImageModal from './ProductImageModal'
import { fadeDown, fadeUp, staggerContainer, staggerItem, viewportOnce } from '../utils/animations'

function getProductBatchConfig() {
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches
  return {
    initial: isDesktop ? 36 : 24,
    step: isDesktop ? 24 : 12,
  }
}

function ProductGrid({ products, limit }) {
  const { t, i18n } = useTranslation()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [batchConfig, setBatchConfig] = useState(getProductBatchConfig)
  const [visibleCount, setVisibleCount] = useState(() => getProductBatchConfig().initial)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const isArabic = i18n.language === 'ar'
  const shouldUseLoadMore = !limit

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

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    const handleViewportChange = () => {
      const nextConfig = getProductBatchConfig()
      setBatchConfig(nextConfig)
      setVisibleCount((current) => Math.max(current, nextConfig.initial))
    }

    mediaQuery.addEventListener('change', handleViewportChange)
    return () => mediaQuery.removeEventListener('change', handleViewportChange)
  }, [])

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const matchesCategory = (product) =>
      category === 'all' || `${product.categoryAr}|${product.categoryEn}` === category

    return products.filter((product) => {
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
  }, [products, query, category])

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, shouldUseLoadMore ? visibleCount : limit),
    [filteredProducts, limit, shouldUseLoadMore, visibleCount],
  )

  const hasMoreProducts = shouldUseLoadMore && visibleProducts.length < filteredProducts.length
  const resetVisibleCount = () => {
    if (shouldUseLoadMore) setVisibleCount(batchConfig.initial)
  }
  const handleSearchChange = (value) => {
    setQuery(value)
    resetVisibleCount()
  }
  const handleCategoryChange = (value) => {
    setCategory(value)
    resetVisibleCount()
  }
  const handleLoadMore = () => {
    setVisibleCount((current) => Math.min(current + batchConfig.step, filteredProducts.length))
  }

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
      <ProductImageModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      <motion.div variants={fadeDown} initial="hidden" whileInView="visible" viewport={viewportOnce}>
        <SearchBar value={query} onChange={handleSearchChange} />
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
              onClick={() => handleCategoryChange(item.id)}
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
      {visibleProducts.length ? (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
        >
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} onImageClick={setSelectedProduct} />
          ))}
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
      {hasMoreProducts && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex justify-center pt-2">
          <motion.button
            type="button"
            onClick={handleLoadMore}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-burgundy to-purpleDeep px-7 text-sm font-black text-white shadow-lg shadow-burgundy/20"
          >
            {t('products.loadMore', { defaultValue: isArabic ? 'عرض المزيد' : 'Load More' })}
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

export default ProductGrid
