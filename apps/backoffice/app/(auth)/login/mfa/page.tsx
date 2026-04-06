"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Button, Input, Label } from "@conciergerie/ui"

const mfaSchema = z.object({
  code: z
    .string()
    .length(6, "Le code doit contenir 6 chiffres")
    .regex(/^\d{6}$/, "Code invalide"),
})

type MfaFormData = z.infer<typeof mfaSchema>

export default function MfaPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaFormData>({ resolver: zodResolver(mfaSchema) })

  async function onSubmit(data: MfaFormData) {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/verify-mfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: data.code }),
      })

      if (!res.ok) {
        toast.error("Code incorrect ou expiré")
        return
      }

      router.push("/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Vérification en deux étapes
          </h1>
          <p className="text-sm text-muted-foreground">
            Entrez le code à 6 chiffres de votre application d&apos;authentification
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="code" className="text-sm font-medium">Code de vérification</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              className="text-center text-2xl tracking-widest h-12"
              {...register("code")}
            />
            {errors.code && (
              <p className="text-xs text-destructive mt-1">{errors.code.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading ? "Vérification…" : "Vérifier"}
          </Button>
        </form>
      </div>
    </div>
  )
}

