'use client'

import React, { useState } from 'react'
import { LayoutDashboard, ShoppingCart, Image, Users, LogOut, Menu, X, Zap, Shield, Heart } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { icon: LayoutDashboard, label: 'Resumen', href: '/admin' },
  { icon: ShoppingCart, label: 'Pedidos', href: '/admin/orders' },
  { icon: Zap, label: 'Productos', href: '/admin/products' },
  { icon: LayoutDashboard, label: 'Categorías', href: '/admin/categories' },
  { icon: Image, label: 'Multimedia Banners', href: '/admin/settings' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans flex text-foreground">
      
      {/* Sidebar Comica */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 w-80 bg-white border-r-[8px] border-black z-40 hidden md:flex flex-col p-8"
          >
            <div className="flex items-center gap-4 mb-20">
              <div className="h-16 w-16 bg-primary rounded-full border-4 border-black flex items-center justify-center -rotate-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <Zap className="h-10 w-10 text-secondary fill-secondary" />
              </div>
              <h1 className="text-xl font-black leading-tight italic" style={{ fontFamily: 'var(--font-bangers)' }}>
                SUPER <span className="text-primary">ADMIN</span><br/>
                PANEL
              </h1>
            </div>

            <nav className="space-y-4 flex-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-4 border-black font-black uppercase text-sm transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] active:translate-y-0 ${
                      isActive ? 'bg-secondary text-black' : 'bg-white hover:bg-muted'
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <button className="mt-auto flex items-center gap-4 p-5 rounded-2xl border-4 border-black font-black uppercase text-sm bg-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition-all">
              <LogOut className="h-6 w-6" />
              Cerrar Sesión
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
        {/* Mobile Header */}
        <header className="h-20 bg-white border-b-[6px] border-black flex items-center justify-between px-8 z-30 sticky top-0 md:bg-transparent md:border-none">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="h-14 w-14 rounded-2xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            {isSidebarOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
          <div className="flex md:hidden items-center gap-3">
             <h2 className="text-xl font-black italic uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>LA LIGA</h2>
          </div>
          <div className="h-12 w-12 rounded-full border-4 border-black bg-muted flex items-center justify-center font-black">A</div>
        </header>

        <div className="p-8 md:p-12 max-w-[1400px] mx-auto min-h-[calc(100vh-80px)]">
           {children}
        </div>
      </main>
    </div>
  )
}
