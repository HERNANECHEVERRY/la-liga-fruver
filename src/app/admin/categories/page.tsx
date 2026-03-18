'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Tag, Edit2, Trash2, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  
  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (editingCategory) {
      const { error } = await supabase.from('categories').update(formData).eq('id', editingCategory.id)
      if (error) alert(error.message)
    } else {
      const { error } = await supabase.from('categories').insert([formData])
      if (error) alert(error.message)
    }

    setShowModal(false)
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    fetchCategories()
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro? Se podrían desvincular productos.')) {
      await supabase.from('categories').delete().eq('id', id)
      fetchCategories()
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <Tag className="h-10 w-10 text-primary" />
            Categorías
          </h1>
          <p className="text-muted-foreground">Organiza tus productos por tipo.</p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setFormData({ name: '', description: '' }); setShowModal(true); }}
          className="flex h-14 items-center gap-2 bg-primary text-primary-foreground px-8 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
        >
          <Plus className="h-6 w-6" />
          Nueva Categoría
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={category.id}
            className="group relative rounded-3xl border border-border bg-card p-8 shadow-sm hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Tag className="h-6 w-6" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => { setEditingCategory(category); setFormData({ name: category.name, description: category.description || '' }); setShowModal(true); }}
                  className="h-10 w-10 flex items-center justify-center bg-muted rounded-xl hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="text-2xl font-black mb-2">{category.name}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{category.description || 'Sin descripción.'}</p>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-[40px] shadow-2xl p-8 sm:p-12"
            >
              <h2 className="text-3xl font-black mb-8">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nombre</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-16 rounded-2xl border border-border bg-muted/30 px-6 font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                    placeholder="Ej. Pizzas, Hamburguesas..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Descripción</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-2xl border border-border bg-muted/30 px-6 py-4 font-medium focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                    placeholder="Describe brevemente esta categoría..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="submit" className="flex-1 h-16 rounded-2xl bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                    {editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
