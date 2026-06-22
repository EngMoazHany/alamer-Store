import { ShoppingBag } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function EmptyCart() {
  const { t } = useTranslation()

  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-4 rounded-[2rem] border border-dashed border-gold/40 bg-cream/70 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purpleDeep text-goldLight">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <div>
        <h3 className="text-xl font-black text-purpleDark">{t('cart.emptyTitle')}</h3>
        <p className="mt-2 text-sm font-semibold leading-7 text-purpleDark/70">{t('cart.emptyText')}</p>
      </div>
    </div>
  )
}

export default EmptyCart
