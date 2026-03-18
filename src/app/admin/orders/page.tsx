'use client'

import React, { useState, useEffect } from 'react'
import { ShoppingBag, Eye, MapPin, CheckCircle, Clock, XCircle, Search, Trash2, Loader2, ArrowUpRight, BarChart3, TrendingUp, Calendar, User, Zap, Shield, Heart, Truck, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Order = Database['public']['Tables']['orders']['Row']

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchOrders()
  }, [])

  async function fetchOrders() {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) setOrders(data)
    setLoading(false)
  }

  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id)
    if (error) alert(error.message)
    else {
      fetchOrders()
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status: newStatus })
    }
  }

  const handleAssignDelivery = async (id: string, deliveryPerson: string) => {
    const { error } = await supabase.from('orders').update({ 
      delivery_person: deliveryPerson,
      status: 'asignado' 
    }).eq('id', id)
    
    if (error) alert(error.message)
    else {
      fetchOrders()
      alert('¡Héroe Domiciliario Asignado!')
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, delivery_person: deliveryPerson, status: 'asignado' })
    }
  }

  const openDetail = (order: Order) => {
    setSelectedOrder(order)
    setShowDetail(true)
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-4 italic" style={{ fontFamily: 'var(--font-bangers)' }}>
            <Zap className="h-10 w-10 text-primary" />
            MISIÓN: CONTROL DE PEDIDOS
          </h1>
          <p className="text-muted-foreground text-lg font-bold uppercase tracking-widest bg-black text-white px-4 py-1 rounded-full inline-block">¡A TODO GAS!</p>
        </div>
      </div>

      {/* Stats Cards Comics Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Pedidos Pendientes', value: orders.filter(o => o.status === 'pendiente').length, icon: Clock, color: 'bg-primary' },
          { label: 'Enviados Hoy', value: orders.filter(o => o.status === 'enviado').length, icon: Send, color: 'bg-accent' },
          { label: 'Héroes en Camino', value: orders.filter(o => o.status === 'asignado').length, icon: Truck, color: 'bg-secondary' },
        ].map((stat, i) => (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} key={stat.label} className="bg-white border-[6px] border-black p-8 rounded-[40px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-4px] transition-all">
            <div className="flex items-center gap-6">
              <div className={`h-16 w-16 rounded-2xl ${stat.color} border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                <stat.icon className={`h-8 w-8 ${stat.color === 'bg-secondary' ? 'text-black' : 'text-white'}`} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-4xl font-black italic uppercase" style={{ fontFamily: 'var(--font-bangers)' }}>{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Hero Table */}
      <div className="bg-white border-[6px] border-black rounded-[48px] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/40 border-b-[6px] border-black">
                <th className="p-8 text-xs font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">CÓDIGO SECRETO</th>
                <th className="p-8 text-xs font-black uppercase tracking-widest text-muted-foreground">DOMICILIO</th>
                <th className="p-8 text-xs font-black uppercase tracking-widest text-muted-foreground">REPARTIDOR</th>
                <th className="p-8 text-xs font-black uppercase tracking-widest text-muted-foreground">ESTADO ACTUAL</th>
                <th className="p-8 text-xs font-black uppercase tracking-widest text-muted-foreground text-center">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              {orders.map((order) => (
                <tr key={order.id} className="group hover:bg-muted/10 transition-all font-sans">
                  <td className="p-8">
                    <div className="bg-black text-white px-4 py-1.5 rounded-full inline-block font-black text-xs uppercase italic tracking-widest">
                       #{order.id.slice(0, 7).toUpperCase()}
                    </div>
                  </td>
                  <td className="p-8">
                    <p className="font-black italic text-lg line-clamp-1">{order.shipping_address}</p>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5" /> Recibido {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="p-8">
                    {order.delivery_person ? (
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-secondary border-2 border-black rounded-full flex items-center justify-center font-black">
                           {order.delivery_person[0].toUpperCase()}
                        </div>
                        <span className="font-black italic uppercase text-sm">{order.delivery_person}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-black uppercase text-muted-foreground italic">¡SIN HÉROE ASIGNADO!</span>
                    )}
                  </td>
                  <td className="p-8">
                    <span className={`px-6 py-2 rounded-2xl border-[4px] border-black text-xs font-black uppercase tracking-widest inline-flex items-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)] ${
                      order.status === 'pendiente' ? 'bg-primary text-white' :
                      order.status === 'asignado' ? 'bg-secondary text-black' :
                      'bg-accent text-white'
                    }`}>
                      <div className={`h-3 w-3 rounded-full border border-black ${
                        order.status === 'pendiente' ? 'bg-white animate-pulse' :
                        order.status === 'asignado' ? 'bg-black' : 'bg-black'
                      }`}></div>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-8 text-center">
                    <button 
                      onClick={() => openDetail(order)} 
                      className="h-14 px-8 bg-white border-4 border-black rounded-2xl text-xs font-black uppercase italic tracking-widest hover:bg-black hover:text-white hover:translate-y-[-4px] active:translate-y-0 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    >
                      VER EXPEDIENTE
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETALLES DEL PEDIDO (COMIC STYLE) */}
      <AnimatePresence>
        {showDetail && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetail(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.9, rotate: 2 }}
              className="relative w-full max-w-4xl bg-white border-[10px] border-black rounded-[60px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header Modal */}
              <div className="bg-primary p-8 border-b-[8px] border-black flex justify-between items-center text-white">
                <div>
                   <h3 className="text-4xl font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-bangers)' }}>
                      EXPEDIENTE DE PEDIDO - #{selectedOrder.id.slice(0, 8).toUpperCase()}
                   </h3>
                </div>
                <button onClick={() => setShowDetail(false)} className="h-14 w-14 rounded-full bg-white text-black border-4 border-black flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
                  <XCircle className="h-8 w-8" />
                </button>
              </div>

              <div className="p-10 overflow-y-auto custom-scrollbar flex-1 grid grid-cols-1 md:grid-cols-2 gap-12">
                
                {/* Panel Izquierdo: Resumen Productos */}
                <div className="space-y-8">
                   <div className="bg-muted p-8 rounded-[40px] border-4 border-black border-dashed relative">
                      <h4 className="absolute -top-6 left-8 bg-yellow-400 text-black border-4 border-black px-6 py-2 font-black italic skew-x-[-10deg]" style={{ fontFamily: 'var(--font-bangers)' }}>¿QUÉ PIDIÓ EL HÉROE?</h4>
                      <div className="text-xl font-black italic leading-relaxed whitespace-pre-line text-black pt-4">
                         {selectedOrder.order_details}
                      </div>
                   </div>

                   <div className="bg-accent/10 p-8 rounded-[40px] border-4 border-black relative">
                      <h4 className="absolute -top-6 left-8 bg-black text-white px-6 py-2 font-black italic uppercase text-sm tracking-widest rounded-full">ENTREGAR EN</h4>
                      <p className="text-2xl font-black italic uppercase leading-tight pt-4">{selectedOrder.shipping_address}</p>
                   </div>
                </div>

                {/* Panel Derecho: Logistica de SuperHéroes */}
                <div className="space-y-10">
                   {/* Asignar Repartidor */}
                   <div className="space-y-4">
                      <p className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                         <Truck className="h-5 w-5 text-primary" /> ASIGNAR DOMICILIARIO
                       </p>
                      <div className="flex gap-4">
                        <select 
                          value={selectedOrder.delivery_person || ''}
                          onChange={(e) => handleAssignDelivery(selectedOrder.id, e.target.value)}
                          className="flex-1 h-14 rounded-2xl border-4 border-black bg-white px-6 font-black uppercase italic outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <option value="">Selecciona al Héroe...</option>
                          <option value="Batman (Bati-Moto)">Batman (Bati-Moto)</option>
                          <option value="Flash (A pie)">Flash (A pie)</option>
                          <option value="Superman (Vuelo)">Superman (Vuelo)</option>
                          <option value="Aquaman (Delfín)">Aquaman (Delfín)</option>
                        </select>
                      </div>
                   </div>

                   {/* Marcar Enviado */}
                   <div className="space-y-4">
                      <p className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                         <Send className="h-5 w-5 text-primary" /> ACCIÓN RÁPIDA
                       </p>
                      <button 
                        disabled={selectedOrder.status === 'enviado'}
                        onClick={() => handleStatusChange(selectedOrder.id, 'enviado')}
                        className={`w-full h-20 rounded-[30px] border-[6px] border-black text-2xl font-black italic tracking-widest uppercase transition-all shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-4 ${
                          selectedOrder.status === 'enviado' ? 'bg-muted text-muted-foreground grayscale cursor-not-allowed' : 'bg-primary text-white hover:translate-y-[-6px]'
                        }`}
                        style={{ fontFamily: 'var(--font-bangers)' }}
                      >
                        <Zap className="h-10 w-10 text-secondary fill-secondary" />
                        ¡MARCAR COMO ENVIADO!
                      </button>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function XCircle({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
  )
}
