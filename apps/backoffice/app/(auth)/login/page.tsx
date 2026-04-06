"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button, Input, Label } from "@conciergerie/ui"
import { KeyRound, Loader2 } from "lucide-react"

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
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
    <div className="min-h-screen flex bg-background">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[hsl(222,47%,11%)] flex-col items-center justify-center p-12">
        <div className="max-w-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center mx-auto">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Entre Rhône et Alpilles
            </h1>
            <p className="text-[hsl(220,15%,60%)] mt-2 text-base">
              Gestion de résidences haut de gamme
            </p>
          </div>
          <div className="w-12 h-px bg-primary/60 mx-auto" />
          <p className="text-sm text-[hsl(220,10%,50%)] leading-relaxed">
            Plateforme de gestion locative — Provence, France
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Entre Rhône et Alpilles</p>
              <p className="text-xs text-muted-foreground">Back-office</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">Connexion</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Accédez à votre espace de gestion
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">Adresse email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="vous@conciergerie.fr"
                className="h-9"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                className="h-9"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

