'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, Heart, ArrowRight, Loader2, Mail, Lock, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName }
          }
        })
        if (error) throw error
        
        // Crear perfil inicial
        if (data.user) {
          await supabase.from('profiles').insert([
            { id: data.user.id, full_name: fullName, role: 'cliente' }
          ])
        }
        alert('¡Bienvenido a la Liga! Revisa tu correo (si es necesario) o inicia sesión.')
      }
      router.push('/')
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Background Comic Patterns */}
      <div className="absolute inset-0 z-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #EE1D23 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-accent -skew-x-12 translate-x-1/2 opacity-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        className="w-full max-w-lg bg-white border-[8px] border-black rounded-[50px] shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-10 md:p-14 relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
           <div className="h-20 w-20 bg-primary rounded-full border-4 border-black flex items-center justify-center -rotate-12 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-6">
              <Zap className="h-10 w-10 text-secondary fill-secondary" />
           </div>
           <h1 className="text-4xl md:text-5xl font-black italic text-center tracking-tighter" style={{ fontFamily: 'var(--font-bangers)' }}>
              ¡RECLUTAMIENTO <span className="text-primary italic">HERÓICO!</span>
           </h1>
           <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mt-2">Únete a la liga del Fruver</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-8">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }}
                className="space-y-2"
              >
                <label className="text-xs font-black uppercase tracking-widest ml-2">Nombre de Super-Héroe</label>
                <div className="relative">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input required type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full h-16 rounded-2xl border-4 border-black bg-muted/20 pl-14 pr-6 font-bold text-lg outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="Ej: Super Pedro" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-2">Bati-Email</label>
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-16 rounded-2xl border-4 border-black bg-muted/20 pl-14 pr-6 font-bold text-lg outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="heroe@estore.com" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest ml-2">Código Secreto</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full h-16 rounded-2xl border-4 border-black bg-muted/20 pl-14 pr-6 font-bold text-lg outline-none focus:ring-4 focus:ring-primary/10 transition-all" placeholder="••••••••" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full h-20 bg-primary text-white text-2xl font-black italic rounded-[30px] border-[6px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[-6px] active:translate-y-0 transition-all flex items-center justify-center gap-4 group"
            style={{ fontFamily: 'var(--font-bangers)' }}
          >
            {loading ? <Loader2 className="h-8 w-8 animate-spin" /> : (
              <>
                 {isLogin ? '¡ENTRAR A LA BASE!' : '¡UNIRSE A LA LIGA!'}
                 <ArrowRight className="h-8 w-8 group-hover:translate-x-2 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center">
           <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-black uppercase tracking-widest underline underline-offset-8 decoration-primary decoration-4 hover:text-primary transition-colors"
           >
             {isLogin ? '¿No tienes cuenta? ¡Regístrate aquí!' : '¿Ya eres un héroe? ¡Inicia sesión!'}
           </button>
        </div>

        <Link href="/" className="flex items-center justify-center gap-2 mt-8 text-xs font-black uppercase text-muted-foreground hover:text-black">
           Volver al Super Fruver
        </Link>
      </motion.div>
    </div>
  )
}
