import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Entre Rhône et Alpilles — Espace Propriétaire",
  description: "Votre espace propriétaire haut de gamme",
  themeColor: "#F4EFEA",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
