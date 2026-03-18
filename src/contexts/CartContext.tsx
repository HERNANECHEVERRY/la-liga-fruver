'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart')
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (e) {
        console.error('Failed to parse cart', e)
      }
    }
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart))
  }, [cart])

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
        )
      }
      return [...prev, item]
    })
  }

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }

  const clearCart = () => setCart([])

  const getTotal = () => cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const getItemCount = () => cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
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
