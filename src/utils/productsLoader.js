import { productsMeta } from '../data/productsMeta'
import { generatedProducts } from '../data/generatedProducts'
import {
  detectCategory,
  generateNameAr,
  generateNameEn,
  getFilename,
} from './productNameFormatter'

const productModules = import.meta.glob('../assets/products/*.{png,jpg,jpeg,webp,avif}', {
  eager: true,
  import: 'default',
})

const folderProducts = Object.entries(productModules)
  .map(([path, image], index) => {
    const filename = getFilename(path)
    const meta = productsMeta[filename] || {}
    const category = detectCategory(filename)

    return {
      id: `${filename}-${index}`,
      filename,
      image,
      nameAr: meta.nameAr || generateNameAr(filename),
      nameEn: meta.nameEn || generateNameEn(filename),
      categoryAr: meta.categoryAr || category.categoryAr,
      categoryEn: meta.categoryEn || category.categoryEn,
    }
  })
  .sort((a, b) => a.filename.localeCompare(b.filename))

export const products = generatedProducts.length ? generatedProducts : folderProducts

export function getProducts() {
  return products
}
