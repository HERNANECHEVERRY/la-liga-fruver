'use client'

import React, { useState, useEffect } from 'react'
import { Save, Image, Video, Link, Trash2, Zap, Layout, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    hero_banner_url: '',
    hero_video_url: '',
    n8n_chat_title: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    const { data } = await supabase.from('app_settings').select('*')
    if (data) {
      const settingsMap = data.reduce((acc: any, curr: any) => {
        acc[curr.key] = curr.value
        return acc
      }, {})
      setSettings((prev) => ({ ...prev, ...settingsMap }))
    }
    setLoading(false)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const updates = Object.entries(settings).map(([key, value]) => ({
      key,
      value: value || '',
    }))

    const { error } = await supabase.from('app_settings').upsert(updates, { onConflict: 'key' })

    if (error) alert(error.message)
    else alert('¡Ajustes actualizados con éxito!')
    
    setSaving(false)
  }

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div>
          <h1 className="text-4xl font-black mb-2 flex items-center gap-4 italic" style={{ fontFamily: 'var(--font-bangers)' }}>
            <Layout className="h-10 w-10 text-primary" />
            MULTIMEDIA & BANNERS
          </h1>
          <p className="text-muted-foreground text-lg font-bold uppercase tracking-widest bg-black text-white px-4 py-1 rounded-full inline-block">CONFIGURACIÓN HEROICA</p>
        </div>
      </div>

      <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        
        {/* Banner Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border-[6px] border-black rounded-[40px] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col h-full"
        >
          <div className="flex items-center gap-4 mb-10">
            <div className="h-14 w-14 rounded-2xl bg-secondary border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Image className="h-8 w-8 text-black" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter italic" style={{ fontFamily: 'var(--font-bangers)' }}>Hero Banner</h2>
          </div>

          <div className="flex-1 space-y-6">
             <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">URL DE IMAGEN (CLOUDINARY / UNSPLASH)</label>
                <div className="relative group">
                   <Link className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary" />
                   <input 
                     type="text" 
                     value={settings.hero_banner_url} 
                     onChange={(e) => setSettings({...settings, hero_banner_url: e.target.value})}
                     className="w-full h-16 rounded-2xl border-4 border-black bg-muted/30 pl-14 pr-6 font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all outline-none" 
                     placeholder="Pegar link de imagen aquí..."
                   />
                </div>
             </div>

             <div className="rounded-[32px] border-4 border-black overflow-hidden aspect-[16/9] bg-muted relative shadow-inner">
                {settings.hero_banner_url ? (
                  <img src={settings.hero_banner_url} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30">
                    <p className="font-black p-4 text-center">¡COPIA UN LINK ARRIBA PARA VER LA PREVIA!</p>
                  </div>
                )}
             </div>
          </div>
        </motion.div>

        {/* Video & Other Section */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="space-y-12"
        >
          {/* Video Section */}
          <div className="bg-white border-[6px] border-black rounded-[40px] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 rounded-2xl bg-accent border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Video className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic" style={{ fontFamily: 'var(--font-bangers)' }}>Hero Video (Cloudinary)</h2>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">CLOUDINARY VIDEO URL</label>
                <input 
                  type="text" 
                  value={settings.hero_video_url} 
                  onChange={(e) => setSettings({...settings, hero_video_url: e.target.value})}
                  className="w-full h-16 rounded-2xl border-4 border-black bg-muted/30 px-6 font-bold text-lg outline-none" 
                  placeholder="Pegar link de video aquí..."
                />
            </div>
          </div>

          {/* Chat Settings Section */}
          <div className="bg-white border-[6px] border-black rounded-[40px] p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 rounded-2xl bg-primary border-4 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Globe className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tighter italic" style={{ fontFamily: 'var(--font-bangers)' }}>Textos Chat n8n</h2>
            </div>
            <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-2">TÍTULO DEL CHAT (MENSAJE DE BIENVENIDA)</label>
                <input 
                  type="text" 
                  value={settings.n8n_chat_title} 
                  onChange={(e) => setSettings({...settings, n8n_chat_title: e.target.value})}
                  className="w-full h-16 rounded-2xl border-4 border-black bg-muted/30 px-6 font-bold text-lg outline-none" 
                  placeholder="¿Cómo quieres que te salude n8n?"
                />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={saving} 
            className="w-full h-20 rounded-[30px] bg-primary text-white text-2xl font-black uppercase border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(150,0,0,0.3)] hover:translate-y-[-8px] transition-all flex items-center justify-center gap-4 italic group"
            style={{ fontFamily: 'var(--font-bangers)' }}
          >
            {saving ? <RefreshCw className="h-8 w-8 animate-spin" /> : <Save className="h-10 w-10 text-secondary" />}
            GUARDAR CONFIGURACIÓN HEROICA
          </button>
        </motion.div>

      </form>
    </div>
  )
}

function RefreshCw({ className }: { className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>
  )
}
