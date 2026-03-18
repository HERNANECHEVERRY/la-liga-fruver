'use client'

import { Products } from '@/types/database' // wait, I didn't export like that
import { Database } from '@/types/database'
import Image from 'next/image'
import { Plus, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/contexts/CartContext'

type Product = Database['public']['Tables']['products']['Row']

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image_url: product.image_url || undefined,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-xl dark:shadow-indigo-500/10"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-4">
          <button
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-xl font-medium shadow-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Añadir al carrito
          </button>
        </div>
      </div>
      <div className="flex flex-col p-4">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4 h-10">
          {product.description || 'Sin descripción disponible.'}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ${product.price.toLocaleString('es-CO')}
          </span>
          {product.stock > 0 ? (
            <span className="text-xs px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full font-medium">
              En stock
            </span>
          ) : (
            <span className="text-xs px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full font-medium">
              Agotado
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
