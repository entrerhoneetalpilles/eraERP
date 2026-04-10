"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button } from "@conciergerie/ui"
import { Input } from "@conciergerie/ui"
import { Label } from "@conciergerie/ui"
import { ArrowRight, Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})
type LoginFormData = z.infer<typeof loginSchema>

export default function PortalLoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      const result = await signIn("owner-credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        toast.error("Email ou mot de passe incorrect")
        return
      }
      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT — Brand panel (desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-dark relative flex-col justify-between p-12 overflow-hidden">
        {/* Decorative dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #DFC078 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Top: ERA logo */}
        <div className="relative">
          <span className="font-serif text-3xl font-semibold text-white tracking-[0.08em]">
            ERA
          </span>
        </div>
        {/* Center: tagline */}
        <div className="relative space-y-6">
          <h1 className="font-serif text-5xl font-light text-white leading-[1.1] italic">
            Gérez votre patrimoine avec élégance.
          </h1>
          <p className="text-garrigue-400 text-sm leading-relaxed max-w-xs font-light">
            Entre Rhône et Alpilles — votre conciergerie de location haut de gamme en Provence.
          </p>
        </div>
        {/* Bottom: fine print */}
        <div className="relative">
          <p className="text-garrigue-400/40 text-xs tracking-widest uppercase">
            Espace Propriétaire
          </p>
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center bg-white px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <span className="font-serif text-3xl font-semibold text-garrigue-900 tracking-[0.08em]">
              ERA
            </span>
            <p className="text-xs text-garrigue-400 mt-1 tracking-wide italic">
              Entre Rhône et Alpilles
            </p>
          </div>

          {/* Heading */}
          <div className="mb-10">
            <h2 className="font-serif text-3xl text-garrigue-900 font-light">
              Bonjour.
            </h2>
            <p className="text-garrigue-500 text-sm mt-2 leading-relaxed">
              Connectez-vous à votre espace propriétaire.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.fr"
                className="h-12 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 placeholder:text-garrigue-300 text-sm"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-garrigue-700 tracking-wide uppercase">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-12 border-argile-300 focus:border-garrigue-900 focus-visible:ring-0 rounded-xl text-garrigue-900 text-sm"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-garrigue-900 hover:bg-garrigue-700 text-white rounded-xl font-medium tracking-wide transition-smooth mt-2 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Accéder à mon espace
                  <ArrowRight size={15} />
                </span>
              )}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-garrigue-400/60 mt-10 italic">
            Entre Rhône et Alpilles · Conciergerie Haut de Gamme
          </p>
        </div>
      </div>
    </div>
  )
}
