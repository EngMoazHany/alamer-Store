import { storeInfo } from '../data/storeInfo'

function absoluteImageUrl(image) {
  if (!image) return ''
  if (/^(https?:|data:|blob:)/.test(image)) return image
  if (image.startsWith('/')) return `${window.location.origin}${image}`
  return new URL(image, window.location.origin).href
}

export function buildWhatsAppOrderMessage(items, language = 'ar') {
  const isArabic = language === 'ar'
  const lines = isArabic
    ? [`السلام عليكم، أريد طلب المنتجات التالية من ${storeInfo.nameAr}:`, '']
    : [`Hello, I would like to order the following products from ${storeInfo.nameEn}:`, '']

  items.forEach((item, index) => {
    const name = isArabic ? item.nameAr : item.nameEn
    lines.push(`${index + 1}) ${name}`)
    lines.push(`${isArabic ? 'الكمية' : 'Quantity'}: ${item.quantity}`)
    lines.push(`${isArabic ? 'صورة المنتج' : 'Product image'}: ${absoluteImageUrl(item.image)}`)
    lines.push('')
  })

  if (isArabic) {
    lines.push('بيانات العميل:', 'الاسم:', 'رقم الهاتف:', 'العنوان:', '', 'شكراً لكم.')
  } else {
    lines.push('Customer details:', 'Name:', 'Phone:', 'Address:', '', 'Thank you.')
  }

  return lines.join('\n')
}

export function getWhatsAppOrderUrl(items, language = 'ar') {
  const message = buildWhatsAppOrderMessage(items, language)
  return `https://wa.me/${storeInfo.whatsappDigits}?text=${encodeURIComponent(message)}`
}

export function openWhatsAppOrder(items, language = 'ar') {
  window.open(getWhatsAppOrderUrl(items, language), '_blank', 'noopener,noreferrer')
}

export function openWhatsAppContact() {
  window.open(`https://wa.me/${storeInfo.whatsappDigits}`, '_blank', 'noopener,noreferrer')
}
