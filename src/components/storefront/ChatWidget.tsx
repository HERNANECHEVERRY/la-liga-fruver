'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Zap } from 'lucide-react'

export function ChatWidget() {
  const [chatTitle, setChatTitle] = useState('¿Qué super-pedido haremos hoy?')
  const supabase = createClient()

  useEffect(() => {
    async function loadChatSettings() {
      try {
        const { data } = await supabase.from('app_settings').select('value').eq('key', 'n8n_chat_title').single()
        if (data) setChatTitle(data.value)
      } catch (e) {
        console.log('Using default chat title')
      }
    }
    loadChatSettings()

    const initChat = () => {
      // @ts-ignore
      if (typeof window.createChat === 'function') {
        // @ts-ignore
        window.Chat = window.createChat({
          webhookUrl: process.env.NEXT_PUBLIC_N8N_CHAT_URL,
          title: chatTitle,
          mode: 'fullscreen',
          showWelcomeMsg: true,
          welcomeMsg: '¡Hola Héroe! Estoy listo para tomar tu pedido de frutas, carnes y verduras. ¿Qué necesitas?',
          backgroundColor: '#EE1D23',
          mainColor: '#000000',
          bubbleBackgroundColor: '#EE1D23',
          bubbleIconColor: '#FFFFFF',
        })
      } else {
        setTimeout(initChat, 300)
      }
    }
    
    setTimeout(initChat, 1000)

  }, [chatTitle])

  return null // El widget se inyecta por n8n
}
