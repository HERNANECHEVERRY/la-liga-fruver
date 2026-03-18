# Guía de Instalación y Configuración - HECTOR STORE

Este proyecto utiliza **Next.js 15+**, **Supabase** y **n8n**. Sigue estos pasos para poner la tienda en marcha.

## 1. Configuración de Supabase

### A. Base de Datos (SQL)
Ejecuta el siguiente script en el **SQL Editor** de tu panel de Supabase:

```sql
-- Categorías
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Productos
create table products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric not null,
  stock integer default 0 not null,
  image_url text,
  category_id uuid references categories(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Perfiles de Usuario (Roles)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  role text default 'cliente' check (role in ('admin', 'cliente')),
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Pedidos (Simplificado para n8n Chat)
create table orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete set null,
  order_details text not null,
  shipping_address text not null,
  status text default 'pendiente' check (status in ('pendiente', 'asignado', 'enviado')),
  delivery_person text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ajustes de la Aplicación
create table app_settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Semilla de ajustes iniciales
insert into app_settings (key, value)
values 
  ('hero_banner_url', 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80'),
  ('n8n_chat_title', '¿Qué super-pedido haremos hoy?')
on conflict (key) do nothing;

-- POLÍTICAS DE SEGURIDAD (RLS)
alter table categories enable row level security;
create policy "Public Select" on categories for select using (true);
create policy "Admin All" on categories for all using (true); -- Simplificado para desarrollo inicial

alter table products enable row level security;
create policy "Public Select" on products for select using (true);
create policy "Admin All" on products for all using (true);

alter table orders enable row level security;
create policy "Public Insert" on orders for insert with check (true);
create policy "Admin/Owner Select" on orders for select using (true);
create policy "Admin Update" on orders for update using (true);

alter table app_settings enable row level security;
create policy "Public Select" on app_settings for select using (true);
create policy "Admin All" on app_settings for all using (true); -- Simplificado para desarrollo inicial
```

### B. Storage (Imágenes)
1. Ve a **Storage** en Supabase.
2. Crea un nuevo bucket llamado `products`.
3. Asegúrate de que el bucket sea **Público**.
4. Agrega una política de acceso para permitir que los usuarios suban archivos (puedes dejarla abierta para pruebas o restringir a administradores).

## 2. Variables de Entorno
Crea un archivo `.env.local` en la raíz del proyecto con las credenciales que te proporcionaron:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anon_de_supabase
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_de_google_maps
NEXT_PUBLIC_N8N_CHAT_URL=tu_url_de_webhook_n8n
```

## 3. Ejecución local

Instala las dependencias y corre el servidor:

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## 4. Despliegue en Vercel
Simplemente conecta tu repositorio de GitHub a Vercel. Asegúrate de agregar las mismas variables de entorno anteriores en la configuración de Vercel.

---
**HECTOR STORE - Desarrollado por Antigravity**
