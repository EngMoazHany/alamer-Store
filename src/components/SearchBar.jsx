import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function SearchBar({ value, onChange }) {
  const { t } = useTranslation()

  return (
    <label className="relative block w-full">
      <span className="sr-only">{t('products.searchPlaceholder')}</span>
      <Search className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-y-1/2 text-burgundy ltr:left-4 rtl:right-4" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t('products.searchPlaceholder')}
        className="h-[3.25rem] w-full rounded-2xl border border-gold/25 bg-white/80 px-12 text-sm font-semibold text-purpleDark shadow-sm outline-none transition focus:border-gold focus:ring-4 focus:ring-gold/15"
        type="search"
      />
    </label>
  )
}

export default SearchBar
