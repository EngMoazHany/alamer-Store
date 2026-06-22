import { useContext } from 'react'
import { CartContextValue } from '../context/cartContextValue'

export function useCart() {
  const context = useContext(CartContextValue)
  if (!context) {
    throw new Error('useCart must be used inside CartProvider')
  }
  return context
}
