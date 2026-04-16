import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import { BonesProvider } from "@/components/bones-provider"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "Entre Rhône et Alpilles — Back-office",
  description: "Gestion locative haut de gamme",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <BonesProvider />
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
