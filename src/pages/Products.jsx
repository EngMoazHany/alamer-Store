import { useTranslation } from 'react-i18next'
import ProductGrid from '../components/ProductGrid'
import SectionTitle from '../components/SectionTitle'
import { getProducts } from '../utils/productsLoader'

function Products() {
  const { t } = useTranslation()
  const products = getProducts()

  return (
    <section className="min-h-[70vh] bg-cream px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-7xl">
        <SectionTitle kicker={t('sections.productsKicker')} title={t('sections.products')} />
        <ProductGrid products={products} />
      </div>
    </section>
  )
}

export default Products
