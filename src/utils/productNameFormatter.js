const categoryRules = [
  {
    keywords: ['blender', 'mixer', 'kettle', 'fan', 'iron', 'heater', 'oven', 'microwave', 'chopper', 'toaster', 'fryer', 'airfryer', 'grill'],
    categoryAr: 'أجهزة كهربائية',
    categoryEn: 'Electrical Appliances',
  },
  {
    keywords: ['plate', 'cup', 'glass', 'spoon', 'fork', 'tray', 'bowl', 'mug'],
    categoryAr: 'أدوات منزلية',
    categoryEn: 'Homeware',
  },
  {
    keywords: ['bridal', 'bride', 'package', 'kitchen-set', 'arousa', 'aroosa'],
    categoryAr: 'تجهيز عرائس',
    categoryEn: 'Bridal Equipment',
  },
  {
    keywords: ['cookware', 'pan', 'pot', 'granite', 'tefal', 'set', 'casserole', 'saucepan'],
    categoryAr: 'حلل وطاسات',
    categoryEn: 'Cookware',
  },
  {
    keywords: ['storage', 'organizer', 'plastic', 'box', 'basket'],
    categoryAr: 'منظمات وتخزين',
    categoryEn: 'Storage & Organizers',
  },
]

export const fallbackCategory = {
  categoryAr: 'كل المنتجات',
  categoryEn: 'All Products',
}

export function getFilename(path = '') {
  return path.split('/').pop()?.split('\\').pop() || ''
}

export function removeExtension(filename = '') {
  return filename.replace(/\.[^/.]+$/, '')
}

export function normalizeFilenameName(filename = '') {
  return removeExtension(filename).replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim()
}

export function toTitleCase(value = '') {
  return value
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function generateNameEn(filename = '') {
  return toTitleCase(normalizeFilenameName(filename))
}

export function generateNameAr(filename = '') {
  return normalizeFilenameName(filename) || 'منتج'
}

export function detectCategory(filename = '') {
  const normalized = removeExtension(filename).toLowerCase()
  const searchable = normalized.replace(/[_\s]+/g, '-')

  const match = categoryRules.find((rule) =>
    rule.keywords.some((keyword) => searchable.includes(keyword)),
  )

  if (!match) return fallbackCategory

  return {
    categoryAr: match.categoryAr,
    categoryEn: match.categoryEn,
  }
}
