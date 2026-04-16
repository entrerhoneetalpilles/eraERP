import type { Metadata } from "next"
import { Cormorant_Garamond, Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import "../bones/registry"

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Entre Rhône et Alpilles — Espace Propriétaire",
  description: "Votre espace propriétaire haut de gamme",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            classNames: {
              toast: "font-sans text-sm rounded-xl shadow-luxury-card border border-border",
            },
          }}
        />
      </body>
    </html>
  )
}
