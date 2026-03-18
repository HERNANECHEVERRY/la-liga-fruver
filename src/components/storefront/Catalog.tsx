'use client'

import React, { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { ProductCard } from './ProductCard'
import { Search, Loader2, PackageX, Layers } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export function Catalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data: cats } = await supabase.from('categories').select('*').order('name')
      const { data: prods } = await supabase.from('products').select('*').order('name')
      
      if (cats) setCategories(cats)
      if (prods) setProducts(prods)
      
      // Select first category by default if any
      if (cats && cats.length > 0) {
        setActiveCategory(cats[0].id)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory ? p.category_id === activeCategory : true
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Cargando catálogo premium...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12 py-8">
      {/* Categories Horizontal Scroll */}
      <div className="sticky top-20 z-40 -mx-4 overflow-x-auto px-4 py-4 bg-background/95 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 border-b border-border/50">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveCategory(null)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-bold transition-all shadow-sm ${
              activeCategory === null
                ? 'bg-primary text-primary-foreground shadow-primary/25'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Layers className="h-4 w-4" />
            Todos
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-2xl px-6 py-3 text-sm font-bold transition-all shadow-sm ${
                activeCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-primary/25'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight">
            {activeCategory 
              ? categories.find(c => c.id === activeCategory)?.name 
              : 'Nuestros Productos'}
          </h2>
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Buscar en ${activeCategory ? categories.find(c => c.id === activeCategory)?.name : 'catálogo'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 rounded-2xl border border-border bg-card pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
            />
          </div>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          <AnimatePresence mode='popLayout'>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-24 flex flex-col items-center justify-center text-center text-muted-foreground"
              >
                <PackageX className="h-16 w-16 mb-4 text-muted-foreground/30" />
                <p className="text-xl font-medium">No se encontraron productos</p>
                <p className="text-sm">Intenta con otros términos o cambia la categoría.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
