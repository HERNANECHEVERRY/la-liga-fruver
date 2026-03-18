'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, User as UserIcon, Zap, Shield, Heart, LogOut, Mail } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [banners, setBanners] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function init() {
      // Load Banners
      const { data: bannerData } = await supabase.from('app_settings').select('value').eq('key', 'hero_banner_url').single()
      if (bannerData) setBanners([bannerData.value])
      
      // Load User Session
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profileData) setProfile(profileData)
      }
      
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col font-sans">
      
      {/* Background Comic Patterns */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #EE1D23 2px, transparent 2px)', backgroundSize: '24px 24px' }} />

      {/* Hero Navbar */}
      <header className="relative z-10 flex justify-between items-center p-6 md:px-12">
        <div className="flex items-center gap-3">
          <div className="h-14 w-14 bg-primary rounded-full border-4 border-black flex items-center justify-center -rotate-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Zap className="h-8 w-8 text-secondary fill-secondary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter" style={{ fontFamily: 'var(--font-bangers)' }}>
            LA <span className="text-primary italic">LIGA</span> DE LA JUSTICIA <br className="hidden md:block"/>
            <span className="text-accent italic">& EL SUPER FRUVER</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {user ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 md:gap-5"
              >
                <div className="flex flex-col items-end hidden sm:flex">
                   <p className="font-black italic text-lg leading-none" style={{ fontFamily: 'var(--font-bangers)' }}>¡HOLA, {profile?.full_name?.toUpperCase() || 'HÉROE'}!</p>
                   <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-1">
                      <Mail className="h-2.5 w-2.5" /> {user.email}
                   </p>
                </div>
                
                <div className="group relative">
                  <div className="h-14 w-14 rounded-2xl border-4 border-black bg-secondary flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-xl italic" style={{ fontFamily: 'var(--font-bangers)' }}>
                    {profile?.full_name?.[0]?.toUpperCase() || 'H'}
                  </div>
                  {/* Dropdown Logout */}
                  <button 
                    onClick={handleLogout}
                    className="absolute top-full right-0 mt-3 bg-black text-white px-4 py-2 rounded-xl border-2 border-black font-black text-[10px] uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-primary transition-all invisible group-hover:visible whitespace-nowrap z-50 flex items-center gap-2"
                  >
                    <LogOut className="h-3 w-3" /> Cerrar Sesión
                  </button>
                </div>
              </motion.div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 group">
                <div className="h-12 w-12 rounded-2xl border-4 border-black group-hover:bg-primary transition-all flex items-center justify-center bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black">
                  <UserIcon className="h-6 w-6 group-hover:text-white" />
                </div>
                <span className="hidden sm:block font-black text-xs uppercase tracking-widest bg-black text-white px-4 py-1.5 rounded-full -ml-3 z-20">Log In / Únete</span>
              </Link>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Content (Super Simple) */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto py-12">
        
        {/* Banner Hero Style */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: -1 }}
          className="w-full relative rounded-[48px] border-[6px] border-black bg-white p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
        >
          <div className="overflow-hidden rounded-[36px] bg-muted relative aspect-[16/9] md:aspect-[3/1]">
            {loading ? (
              <div className="animate-pulse h-full w-full bg-muted shadow-inner" />
            ) : (
              <img 
                src={banners[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'} 
                alt="Banner Hero" 
                className="h-full w-full object-cover"
              />
            )}
            {/* Superhero Caption */}
            <div className="absolute top-4 left-4 bg-secondary text-black font-black italic text-xl md:text-2xl px-8 py-3 border-4 border-black skew-x-[-12deg] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" style={{ fontFamily: 'var(--font-bangers)' }}>
              ¡PODER VEGETAL!
            </div>
          </div>
        </motion.div>

        {/* Why us Section (Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 w-full">
          <div className="flex flex-col items-center text-center group">
            <div className="h-20 w-20 rounded-3xl border-4 border-black bg-accent flex items-center justify-center rotate-3 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-0 transition-transform mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-black uppercase mb-2">Máxima Calidad</h3>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-wide leading-relaxed">Seleccionamos cada pieza como si fuera un tesoro sagrado.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="h-20 w-20 rounded-3xl border-4 border-black bg-primary flex items-center justify-center -rotate-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-0 transition-transform mb-6">
              <Zap className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-black uppercase mb-2">Velocidad Flash</h3>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-wide leading-relaxed">Entregas más rápidas que una bala en todo el barrio.</p>
          </div>
          <div className="flex flex-col items-center text-center group">
            <div className="h-20 w-20 rounded-3xl border-4 border-black bg-secondary flex items-center justify-center rotate-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-0 transition-transform mb-6">
              <Heart className="h-10 w-10 text-black fill-black" />
            </div>
            <h3 className="text-xl font-black uppercase mb-2">Trato Heroico</h3>
            <p className="text-muted-foreground text-sm font-bold uppercase tracking-wide leading-relaxed">Nuestros clientes son los héroes de esta historia.</p>
          </div>
        </div>

      </main>

      {/* Floating Orders Bubble (THE CORE OF THE APP) */}
      <div className="fixed bottom-10 right-10 z-50">
        <motion.button 
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          className="group relative flex flex-col items-center"
          onClick={() => {
            // @ts-ignore
            if (window.Chat) {
              // @ts-ignore
              window.Chat.open();
            } else {
              alert('¡El super-chat se está cargando! Intentalo de nuevo en un segundo.');
            }
          }}
        >
          {/* Comic Speech Bubble */}
          <div className="absolute bottom-[100%] right-0 mb-4 bg-secondary text-black font-black text-xl px-6 py-3 border-4 border-black rounded-3xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap comic-text animate-bounce" style={{ fontFamily: 'var(--font-bangers)' }}>
            ¡HAZ TU PEDIDO AQUÍ!
            <div className="absolute -bottom-3 right-6 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[14px] border-t-black"></div>
            <div className="absolute -bottom-2 right-[25px] w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[12px] border-t-secondary z-10"></div>
          </div>
          {/* Main Button */}
          <div className="h-24 w-24 bg-primary rounded-full border-[6px] border-black flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600 transition-colors">
            <ShoppingBag className="h-12 w-12 text-white" />
          </div>
        </motion.button>
      </div>

    </div>
  )
}
