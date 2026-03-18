export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          stock: number
          image_url: string | null
          category_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          stock?: number
          image_url?: string | null
          category_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          stock?: number
          image_url?: string | null
          category_id?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          role: string
          full_name: string | null
          avatar_url: string | null
          updated_at: string
        }
        Insert: {
          id: string
          role?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          role?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          total_products_price: number
          shipping_price: number
          total_price: number
          status: 'pendiente' | 'asignado' | 'enviado'
          client_lat: number | null
          client_lng: number | null
          customer_name: string
          customer_address: string
          customer_phone: string
          delivery_person: string | null
          order_details: string
          shipping_address: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          total_products_price: number
          shipping_price: number
          total_price: number
          status?: 'pendiente' | 'asignado' | 'enviado'
          client_lat: number | null
          client_lng: number | null
          customer_name: string
          customer_address: string
          customer_phone: string
          delivery_person?: string | null
          order_details?: string
          shipping_address?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          total_products_price?: number
          shipping_price?: number
          total_price?: number
          status?: 'pendiente' | 'asignado' | 'enviado'
          client_lat?: number | null
          client_lng?: number | null
          customer_name?: string
          customer_address?: string
          customer_phone?: string
          delivery_person?: string | null
          order_details?: string
          shipping_address?: string
          created_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          unit_price?: number
          created_at?: string
        }
      }
      app_settings: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_at?: string
        }
      }
    }
  }
}
