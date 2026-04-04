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
    <div className="min-h-screen flex items-center justify-center bg-calcaire-100">
      <div className="w-full max-w-sm space-y-10 px-8 py-10 bg-white rounded-2xl shadow-card">
        <div className="text-center space-y-3">
          <h1 className="font-serif text-3xl text-garrigue-900 tracking-wide">
            Entre Rhône et Alpilles
          </h1>
          <p className="text-sm text-garrigue-500">
            Votre espace propriétaire
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-garrigue-700">
              Adresse email
            </Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="vous@exemple.fr"
              className="border-argile-300 focus:border-olivier-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-garrigue-700">
              Mot de passe
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="border-argile-300 focus:border-olivier-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-olivier-500 hover:bg-olivier-600 text-white transition-colors duration-300"
            disabled={isLoading}
          >
            {isLoading ? "Connexion…" : "Accéder à mon espace"}
          </Button>
        </form>
      </div>
    </div>
  )
}
