'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, ShoppingBag, Shield, Heart, TrendingUp, Users, Clock, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    shipped: 0,
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      const { data } = await supabase.from('orders').select('status')
      if (data) {
        setStats({
          total: data.length,
          pending: data.filter(d => d.status === 'pendiente').length,
          assigned: data.filter(d => d.status === 'asignado').length,
          shipped: data.filter(d => d.status === 'enviado').length,
        })
      }
      setLoading(false)
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-12 pb-20">
      
      {/* Hero Welcome Admin */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-black text-white p-12 rounded-[50px] border-[10px] border-black shadow-[15px_15px_0px_0px_rgba(238,29,35,0.4)] overflow-hidden"
      >
        <div className="absolute top-0 right-0 h-full w-1/3 bg-primary skew-x-[-15deg] translate-x-12 opacity-90 p-12 flex flex-col justify-center items-center">
            <Zap className="h-24 w-24 text-secondary fill-secondary animate-pulse" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
           <h1 className="text-5xl md:text-6xl font-black italic tracking-tighter mb-4" style={{ fontFamily: 'var(--font-bangers)' }}>
              ¡BIENVENIDO, <span className="text-secondary">COMANDANTE!</span>
           </h1>
           <p className="text-xl font-bold uppercase tracking-widest text-[#AAA]">La Liga de la Justicia del Fruver está a tus órdenes. Revisa las misiones del día.</p>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Misiones Totales', value: stats.total, icon: ShoppingBag, color: 'bg-white', textColor: 'text-black' },
          { label: 'Pendientes Urgentes', value: stats.pending, icon: Clock, color: 'bg-primary', textColor: 'text-white' },
          { label: 'En camino', value: stats.assigned, icon: Zap, color: 'bg-accent', textColor: 'text-white' },
          { label: 'Éxito rotundo', value: stats.shipped, icon: Shield, color: 'bg-secondary', textColor: 'text-black' },
        ].map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            key={stat.label} 
            className={`${stat.color} border-[6px] border-black p-8 rounded-[40px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center`}
          >
            <div className={`h-16 w-16 rounded-2xl border-4 border-black mb-4 flex items-center justify-center ${stat.textColor === 'text-white' ? 'bg-black text-white' : 'bg-white text-black'} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
               <stat.icon className="h-8 w-8" />
            </div>
            <p className={`text-xs font-black uppercase tracking-widest mb-1 ${stat.textColor === 'text-white' ? 'opacity-80' : 'opacity-60'}`}>{stat.label}</p>
            <h3 className={`text-4xl font-black italic uppercase ${stat.textColor}`} style={{ fontFamily: 'var(--font-bangers)' }}>{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* Recent Activity Comic Style */}
         <div className="bg-white border-[8px] border-black rounded-[50px] p-10 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black italic mb-8 uppercase flex items-center gap-4" style={{ fontFamily: 'var(--font-bangers)' }}>
               <TrendingUp className="h-8 w-8 text-primary" />
               ACTIVIDAD HEROICA
            </h2>
            <div className="space-y-6">
               {[1,2,3].map(i => (
                 <div key={i} className="p-6 rounded-3xl bg-muted/30 border-4 border-black border-dashed flex items-center gap-6">
                    <div className="h-12 w-12 rounded-full border-2 border-black bg-secondary flex items-center justify-center font-black">?</div>
                    <div>
                       <p className="font-black italic uppercase text-lg">MISIÓN #{i}829 AVANCE</p>
                       <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">El domiciliario FLASH reporta éxito en la zona norte.</p>
                    </div>
                 </div>
               ))}
            </div>
            <Link href="/admin/orders" className="mt-10 w-full h-14 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
               VER TODAS LAS MISIONES <ArrowRight className="h-4 w-4" />
            </Link>
         </div>

         {/* Logistic Super Panel */}
         <div className="bg-accent border-[8px] border-black rounded-[50px] p-10 shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary rotate-45 translate-x-12 -translate-y-12 border-b-8 border-black"></div>
            <h2 className="text-3xl font-black italic mb-8 uppercase flex items-center gap-4" style={{ fontFamily: 'var(--font-bangers)' }}>
               <Shield className="h-8 w-8 text-secondary fill-secondary" />
               ESTADO DE LA LIGA
            </h2>
            <div className="space-y-6 relative z-10">
               <div className="p-8 bg-black/40 rounded-3xl border-4 border-black border-dashed">
                  <p className="text-3xl font-black italic uppercase leading-none mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>BATMAN (MOTO)</p>
                  <div className="h-4 w-full bg-black rounded-full overflow-hidden border-2 border-black shadow-inner">
                      <div className="h-full bg-secondary w-[85%]"></div>
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest mt-3 text-secondary italic">ESTADO: PATRULLANDO ZONA SUR (85% COMBUSTIBLE)</p>
               </div>
               <div className="p-8 bg-black/40 rounded-3xl border-4 border-black border-dashed opacity-50">
                  <p className="text-3xl font-black italic uppercase leading-none mb-2" style={{ fontFamily: 'var(--font-bangers)' }}>FLASH (CORRIENDO)</p>
                  <div className="h-4 w-full bg-black rounded-full overflow-hidden border-2 border-black shadow-inner text-black">
                      <div className="h-full bg-primary w-[20%]"></div>
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest mt-3 text-primary italic">ESTADO: DESCANSO EN LA BATICUEVA (20% ENERGÍA)</p>
               </div>
            </div>
         </div>
      </div>

    </div>
  )
}
