'use client'

import React, { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { Navbar } from '@/components/storefront/Navbar'
import { MapPin, Phone, User, CreditCard, Loader2, Navigation, Trash2, ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// Store location (e.g., Bogota)
const STORE_COORDS = { lat: 4.5981, lng: -74.0758 }
const SHIPPING_COST_PER_KM = 1000

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

export default function CheckoutPage() {
  const { cart, getTotal, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [shippingCost, setShippingCost] = useState(0)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
  })
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (coords) {
      const dist = calculateDistance(STORE_COORDS.lat, STORE_COORDS.lng, coords.lat, coords.lng)
      setDistance(dist)
      setShippingCost(Math.ceil(dist) * SHIPPING_COST_PER_KM)
    }
  }, [coords])

  const handleLocate = () => {
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLocating(false)
      },
      (error) => {
        console.error(error)
        setLocating(false)
        alert('Error al obtener la ubicación.')
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!coords) {
      alert('Por favor, comparte tu ubicación para calcular el envío.')
      return
    }
    setLoading(true)

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          total_products_price: getTotal(),
          shipping_price: shippingCost,
          total_price: getTotal() + shippingCost,
          status: 'pendiente',
          client_lat: coords.lat,
          client_lng: coords.lng,
          customer_name: formData.name,
          customer_address: formData.address,
          customer_phone: formData.phone,
        })
        .select()
        .single()

      if (orderError) throw orderError

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }))

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
      if (itemsError) throw itemsError

      clearCart()
      alert('¡Pedido realizado con éxito!')
      router.push('/')
    } catch (error) {
      console.error(error)
      alert('Error al procesar el pedido.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen flex flex-col">
        <Navbar />
        <div className="mx-auto max-w-2xl px-4 py-32 text-center space-y-6">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
          </div>
          <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
          <p className="text-muted-foreground">Regresa al catálogo para añadir algunos productos antes de finalizar tu compra.</p>
          <button onClick={() => router.push('/')} className="px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold">
            Ver Productos
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col pb-24">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-12">
          <h1 className="text-4xl font-black mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">Completa tus datos y calcularemos el envío satelital.</p>
        </div>

        {/* Form Section */}
        <div className="lg:col-span-7 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-3xl border border-border bg-card p-8 shadow-sm"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Datos del Cliente
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Nombre Completo</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Juan Pérez"
                    className="w-full h-14 rounded-2xl border border-border bg-muted/30 px-4 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Teléfono de Contacto</label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+57 300 000 0000"
                    className="w-full h-14 rounded-2xl border border-border bg-muted/30 px-4 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Dirección de Entrega</label>
                <input
                  required
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Calle 123 # 45-67"
                  className="w-full h-14 rounded-2xl border border-border bg-muted/30 px-4 focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                />
              </div>

              <div className="pt-4">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-primary" />
                  Envío Satelital
                </h3>
                <div className={`p-6 rounded-2xl border-2 transition-all ${coords ? 'border-primary bg-primary/5' : 'border-dashed border-border bg-muted/20'}`}>
                  {!coords ? (
                    <div className="flex flex-col items-center text-center gap-4">
                      <p className="text-sm text-muted-foreground">Necesitamos tu ubicación exacta para calcular el costo de envío basado en la distancia.</p>
                      <button
                        type="button"
                        onClick={handleLocate}
                        disabled={locating}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 disabled:opacity-50"
                      >
                        {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                        Compartir Ubicación Actual
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Ubicación Capturada</p>
                          <p className="text-sm text-muted-foreground">Distancia estimada: {distance?.toFixed(2)} km</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setCoords(null)} className="text-sm text-red-500 font-medium hover:underline">Cambiar</button>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !coords}
                className="w-full h-16 mt-8 rounded-3xl bg-primary text-primary-foreground text-lg font-black shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <CreditCard className="h-6 w-6" />}
                Pagar ${ (getTotal() + shippingCost).toLocaleString() }
              </button>
            </form>
          </motion.div>
        </div>

        {/* Summary Section */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-32 rounded-3xl border border-border bg-card overflow-hidden shadow-sm"
          >
            <div className="p-8 border-b border-border bg-muted/30">
              <h2 className="text-xl font-bold">Resumen del Pedido</h2>
            </div>
            <div className="p-8 space-y-6">
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="h-16 w-16 bg-muted rounded-xl border border-border overflow-hidden flex-shrink-0">
                      {item.image_url && <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold line-clamp-1">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} x ${item.price.toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-primary">${(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider">Subtotal</span>
                  <span className="font-bold text-lg">${getTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium uppercase tracking-wider">Costo de Envío</span>
                  {coords ? (
                    <span className="font-bold text-lg text-emerald-500">+ ${shippingCost.toLocaleString()}</span>
                  ) : (
                    <span className="text-muted-foreground italic font-medium">Calculando...</span>
                  )}
                </div>
                <div className="flex justify-between pt-4 border-t border-border">
                  <span className="text-2xl font-black">Total</span>
                  <span className="text-3xl font-black text-primary">${(getTotal() + shippingCost).toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-4 border border-primary/20">
                <p className="text-xs text-center text-primary font-bold uppercase tracking-widest leading-relaxed">
                  Calculado a razón de ${SHIPPING_COST_PER_KM.toLocaleString()} por KM recorrido desde nuestra tienda física.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  )
}
