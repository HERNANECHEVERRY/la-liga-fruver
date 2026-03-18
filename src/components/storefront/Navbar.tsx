'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, User, Search, Store, Menu, X, LogIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'

export function Navbar() {
  const { getItemCount, getTotal, cart, removeFromCart, updateQuantity } = useCart()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)

  const count = getItemCount()

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground group-hover:scale-105 transition-transform">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gradient">HECTOR STORE</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Catálogo
              </Link>
              <Link href="/pedidos" className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground">
                Mis Pedidos
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="h-10 w-48 lg:w-64 rounded-xl border border-border bg-muted/50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl hover:bg-muted transition-colors group"
            >
              <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>

            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Admin
            </Link>

            <button className="flex h-10 w-10 items-center justify-center rounded-xl sm:hidden border border-border" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-[70] h-full w-full max-w-md bg-card border-l border-border shadow-2xl p-0 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  Tu Carrito
                </h3>
                <button onClick={() => setIsCartOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
                      <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <p className="text-lg font-medium">Tu carrito está vacío</p>
                    <p className="text-sm text-muted-foreground mb-6">Parece que aún no has añadido nada.</p>
                    <button onClick={() => setIsCartOpen(false)} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-medium">
                      Explorar productos
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-muted border border-border">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex justify-between font-medium">
                          <h4 className="line-clamp-1">{item.name}</h4>
                          <span className="text-primary">${(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">${item.price.toLocaleString()} c/u</p>
                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-muted rounded-lg px-2">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-7 w-7 flex items-center justify-center hover:text-primary">-</button>
                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-7 w-7 flex items-center justify-center hover:text-primary">+</button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-border bg-muted/30">
                  <div className="flex justify-between text-lg font-bold mb-6">
                    <span>Total</span>
                    <span className="text-primary">${getTotal().toLocaleString()}</span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="flex w-full items-center justify-center gap-2 bg-primary dark:bg-primary py-4 rounded-2xl text-primary-foreground font-bold shadow-soft transition-all hover:scale-[1.02] active:scale-95"
                  >
                    Ir al Pago
                  </Link>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
