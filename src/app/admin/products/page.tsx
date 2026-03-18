'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Plus, Search, MoreVertical, Trash2, Edit2, Mic, MicOff, Image as ImageIcon, Loader2, X, Camera, RefreshCw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type Category = Database['public']['Tables']['categories']['Row']

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // Voice & Video States
  const [isListening, setIsListening] = useState(false)
  const [activeVoiceField, setActiveVoiceField] = useState<'name' | 'description' | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category_id: '',
    image_url: '',
  })
  
  const [uploadingImage, setUploadingImage] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  async function fetchProducts() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    if (data) setProducts(data)
    setLoading(false)
  }

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
  }

  const handleVoice = (field: 'name' | 'description') => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Tu navegador no soporta el reconocimiento de voz.')
      return
    }

    if (isListening) return

    setActiveVoiceField(field)
    setIsListening(true)
    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.lang = 'es-CO'

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setFormData((prev) => ({ ...prev, [field]: prev[field] ? prev[field] + ' ' + transcript : transcript }))
    }

    recognition.onend = () => {
      setIsListening(false)
      setActiveVoiceField(null)
    }

    recognition.start()
  }

  // Camera integration (Fixed & Robust)
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      setShowCamera(true)
      // Wait for next tick to ensure video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(e => console.error("Video play failed", e))
        }
      }, 100)
    } catch (err) {
      console.error(err)
      alert('Error: No se pudo acceder a la cámara. Asegúrate de dar permisos en tu navegador.')
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
      setShowCamera(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext('2d')

      if (context && video.videoWidth > 0) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })
            handleImageUpload(file)
            stopCamera()
          }
        }, 'image/jpeg', 0.8)
      }
    }
  }

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    const fileName = `${Date.now()}_${file.name.replace(/\s/g, '_')}`
    
    try {
      const { data, error } = await supabase.storage.from('products').upload(fileName, file)
      
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName)
      setFormData((prev) => ({ ...prev, image_url: publicUrl }))
    } catch (error: any) {
      console.error(error)
      alert(`Error al subir imagen: ${error.message || 'Verifica que el bucket sea público.'}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category_id: formData.category_id || null,
      image_url: formData.image_url,
    }

    try {
      if (editingProduct) {
        const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
      }

      setShowModal(false)
      setEditingProduct(null)
      setFormData({ name: '', description: '', price: 0, stock: 0, category_id: '', image_url: '' })
      fetchProducts()
    } catch (err: any) {
      alert(`Error de guardado: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Eliminar producto definitivamente?')) {
      await supabase.from('products').delete().eq('id', id)
      fetchProducts()
    }
  }

  const openEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price,
      stock: product.stock,
      category_id: product.category_id || '',
      image_url: product.image_url || '',
    })
    setShowModal(true)
  }

  return (
    <div className="space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
            <Camera className="h-10 w-10 text-primary" />
            Gestor de Catálogo
          </h1>
          <p className="text-muted-foreground text-lg">Administra el inventario de LA LIGA DEL FRUVER.</p>
        </div>
        <button
          onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price: 0, stock: 0, category_id: '', image_url: '' }); setShowModal(true); }}
          className="flex h-14 items-center gap-2 bg-primary text-primary-foreground px-8 rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all"
        >
          <Plus className="h-6 w-6" />
          Nuevo Producto
        </button>
      </div>

      {loading && !products.length ? (
        <div className="flex flex-col items-center justify-center p-20 py-40">
          <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={product.id}
              className="group relative flex flex-col rounded-[32px] border border-border bg-card p-6 shadow-sm hover:shadow-2xl transition-all"
            >
              <div className="relative h-48 w-full mb-6 rounded-3xl overflow-hidden bg-muted border border-border">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center opacity-30">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-xl line-clamp-1">{product.name}</h3>
                  <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">${product.price.toLocaleString()}</span>
                </div>
                <p className="text-muted-foreground text-sm mb-6 line-clamp-2 h-10">{product.description || 'Sin descripción.'}</p>
                
                <div className="mt-auto pt-6 border-t border-border flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'} shadow-sm`}></span>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{product.stock} en stock</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(product)} className="h-10 w-10 flex items-center justify-center bg-muted rounded-xl hover:bg-primary hover:text-primary-foreground transition-all">
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="h-10 w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { stopCamera(); setShowModal(false); }} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-[48px] shadow-2xl p-8 sm:p-12 custom-scrollbar"
            >
              <button onClick={() => { stopCamera(); setShowModal(false); }} className="absolute top-6 right-6 h-12 w-12 rounded-full flex items-center justify-center hover:bg-muted transition-colors z-50">
                <X className="h-6 w-6" />
              </button>
              
              <h2 className="text-3xl font-black mb-10">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Nombre</label>
                    <button
                      type="button"
                      onClick={() => handleVoice('name')}
                      className={`flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-full ${isListening && activeVoiceField === 'name' ? 'bg-red-500 text-white animate-pulse' : 'bg-muted text-muted-foreground'}`}
                    >
                      <Mic className="h-3 w-3" /> Dictar
                    </button>
                  </div>
                  <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full h-16 rounded-[28px] border border-border bg-muted/30 px-6 font-bold text-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Ej: Hamburguesa de la Casa" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Precio ($)</label>
                    <input required type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full h-16 rounded-[28px] border border-border bg-muted/30 px-6 font-bold text-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Stock</label>
                    <input required type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full h-16 rounded-[28px] border border-border bg-muted/30 px-6 font-bold text-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Categoría</label>
                  <select required value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="w-full h-16 rounded-[28px] border border-border bg-muted/30 px-6 font-bold outline-none cursor-pointer focus:ring-4 focus:ring-primary/10 transition-all">
                    <option value="">Selecciona categoría...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2">Imagen</label>
                  
                  <div className="relative w-full aspect-video rounded-[40px] bg-muted overflow-hidden border-2 border-dashed border-border flex items-center justify-center">
                    {uploadingImage && <div className="absolute inset-0 z-30 bg-black/40 flex items-center justify-center backdrop-blur-sm"><Loader2 className="h-10 w-10 text-white animate-spin" /></div>}
                    
                    {showCamera ? (
                      <div className="relative h-full w-full">
                        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
                        <div className="absolute inset-x-0 bottom-8 flex justify-center gap-4 z-20">
                          <button type="button" onClick={capturePhoto} className="h-14 bg-primary text-primary-foreground px-10 rounded-2xl font-black shadow-2xl scale-110 active:scale-95 transition-all flex items-center gap-2">
                            <Camera className="h-5 w-5" /> CAPTURAR FOTO
                          </button>
                        </div>
                      </div>
                    ) : formData.image_url ? (
                      <img src={formData.image_url} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground gap-4">
                        <ImageIcon className="h-16 w-16 opacity-10" />
                        <p className="font-bold opacity-30 uppercase tracking-widest text-xs">Sin imagen</p>
                      </div>
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button type="button" onClick={showCamera ? stopCamera : startCamera} className={`flex-1 h-16 rounded-[20px] font-bold flex items-center justify-center gap-2 transition-all ${showCamera ? 'bg-red-500 text-white' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                      {showCamera ? <X className="h-5 w-5" /> : <Camera className="h-5 w-5" />}
                      {showCamera ? 'Cerrar Cámara' : 'Cámara Web'}
                    </button>
                    <label className="flex-1 h-16 bg-card text-foreground rounded-[20px] font-bold flex items-center justify-center gap-2 border border-border cursor-pointer hover:bg-muted transition-all">
                      <ImageIcon className="h-5 w-5" /> Archivo de PC
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                    </label>
                  </div>
                </div>

                <div className="pt-6">
                  <button type="submit" disabled={loading || uploadingImage} className="w-full h-20 bg-primary text-primary-foreground rounded-[30px] font-black text-2xl shadow-2xl shadow-primary/20 hover:scale-[1.03] active:scale-95 transition-all">
                    {loading ? <Loader2 className="h-8 w-8 animate-spin mx-auto" /> : editingProduct ? 'GUARDAR CAMBIOS' : 'CREAR PRODUCTO'}
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
