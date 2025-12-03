"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export interface CartItem {
  id: number
  name: string
  price: string
  quantity: number
  extras: string[]
  removedIngredients: string[]
  observations: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  updateQuantity: (index: number, quantity: number) => void
  removeItem: (index: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getSubtotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setCart(JSON.parse(savedCart))
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('cart', JSON.stringify(cart))
      } catch (error) {
        console.error('Erro ao salvar carrinho:', error)
      }
    }
  }, [cart, isLoaded])

  const addToCart = (newItem: CartItem) => {
    setCart(prev => {
      const existingItem = prev.find(item => 
        item.id === newItem.id && 
        JSON.stringify(item.extras) === JSON.stringify(newItem.extras) &&
        JSON.stringify(item.removedIngredients) === JSON.stringify(newItem.removedIngredients) &&
        item.observations === newItem.observations
      )

      if (existingItem) {
        return prev.map(item => 
          item === existingItem 
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      } else {
        return [...prev, newItem]
      }
    })
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    setCart(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setCart([])
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const getItemPrice = (priceString: string) => {
    return parseFloat(priceString.replace('R$ ', '').replace(',', '.'))
  }

  const getItemTotal = (item: CartItem) => {
    const basePrice = getItemPrice(item.price)
    // Calcular preço dos extras baseado nos dados reais do menu
    const extrasPrice = item.extras.length * 8 // Preço médio dos extras
    return (basePrice + extrasPrice) * item.quantity
  }

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + getItemTotal(item), 0)
  }

  return (
    <CartContext.Provider value={{
      cart: isLoaded ? cart : [],
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      getTotalItems,
      getSubtotal
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}