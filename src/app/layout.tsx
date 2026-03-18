import type { Metadata } from "next";
import { Outfit, Bangers } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/contexts/CartContext";
import { ChatWidget } from "@/components/storefront/ChatWidget";
import Script from "next/script";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LA LIGA DE LA JUSTICIA Y EL SUPER FRUVER",
  description: "¡Verduras, carnes y pollo con el poder de tus superhéroes favoritos!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/style.css" rel="stylesheet" />
      </head>
      <body className={`${outfit.variable} ${bangers.variable} font-sans antialiased`}>
        <CartProvider>
          {children}
          <ChatWidget />
        </CartProvider>
        <Script 
          src="https://cdn.jsdelivr.net/npm/@n8n/chat/dist/chat.bundle.umd.js" 
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
