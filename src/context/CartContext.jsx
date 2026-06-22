import { useCallback, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { CartContextValue } from './cartContextValue'
const STORAGE_KEY = 'mecca-alamer-cart-v1'

export function CartProvider({ children }) {
  const [items, setItems] = useLocalStorage(STORAGE_KEY, [])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const addProduct = useCallback((product) => {
    setItems((current) => {
      const existing = current.find((item) => item.id === product.id)
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { ...product, quantity: 1 }]
    })
    setIsCartOpen(true)
  }, [setItems])

  const removeProduct = useCallback((productId) => {
    setItems((current) => current.filter((item) => item.id !== productId))
  }, [setItems])

  const increaseQuantity = useCallback((productId) => {
    setItems((current) =>
      current.map((item) =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    )
  }, [setItems])

  const decreaseQuantity = useCallback((productId) => {
    setItems((current) =>
      current
        .map((item) =>
          item.id === productId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }, [setItems])

  const clearCart = useCallback(() => setItems([]), [setItems])
  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  const value = useMemo(() => {
    const cartCount = items.reduce((total, item) => total + item.quantity, 0)

    return {
      items,
      cartCount,
      isCartOpen,
      addProduct,
      removeProduct,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      openCart,
      closeCart,
    }
  }, [
    items,
    isCartOpen,
    addProduct,
    removeProduct,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    openCart,
    closeCart,
  ])

  return <CartContextValue.Provider value={value}>{children}</CartContextValue.Provider>
}
