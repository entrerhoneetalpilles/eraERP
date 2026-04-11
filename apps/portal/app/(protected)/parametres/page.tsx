import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@conciergerie/db"
import { ChangePasswordForm } from "@/components/parametres/change-password-form"
import { MfaSection } from "@/components/parametres/mfa-section"
import { User, Mail, Calendar, ShieldCheck } from "lucide-react"

export default async function ParametresPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const ownerUser = await db.ownerUser.findUnique({
    where: { id: session.user.id },
    select: {
      email: true,
      mfa_active: true,
      derniere_connexion: true,
      createdAt: true,
    },
  })
  if (!ownerUser) redirect("/login")

  const memberSince = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(ownerUser.createdAt)

  const lastLogin = ownerUser.derniere_connexion
    ? new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(ownerUser.derniere_connexion)
    : null

  return (
    <div className="max-w-2xl space-y-10 animate-fade-up">
      {/* Page header */}
      <div>
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Paramètres.</h1>
        <p className="text-sm text-garrigue-400 mt-1">Gérez votre compte et votre sécurité</p>
      </div>

      {/* Account info */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-argile-200/40">
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
            Informations du compte
          </h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
              <User size={15} strokeWidth={1.6} className="text-garrigue-500" />
            </div>
            <div>
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Nom</p>
              <p className="text-sm font-medium text-garrigue-900">{session.user.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
              <Mail size={15} strokeWidth={1.6} className="text-garrigue-500" />
            </div>
            <div>
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Email</p>
              <p className="text-sm font-medium text-garrigue-900">{ownerUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
              <Calendar size={15} strokeWidth={1.6} className="text-garrigue-500" />
            </div>
            <div>
              <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Membre depuis</p>
              <p className="text-sm font-medium text-garrigue-900 capitalize">{memberSince}</p>
            </div>
          </div>
          {lastLogin && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-calcaire-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={15} strokeWidth={1.6} className="text-garrigue-500" />
              </div>
              <div>
                <p className="text-[10px] text-garrigue-400 uppercase tracking-wide font-medium mb-0.5">Dernière connexion</p>
                <p className="text-sm font-medium text-garrigue-900 capitalize">{lastLogin}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Change password */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-argile-200/40">
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
            Changer le mot de passe
          </h2>
        </div>
        <div className="px-6 py-5">
          <ChangePasswordForm />
        </div>
      </section>

      {/* MFA */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 overflow-hidden">
        <div className="px-6 py-5 border-b border-argile-200/40">
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em]">
            Authentification à deux facteurs
          </h2>
        </div>
        <div className="px-6 py-5">
          <MfaSection mfaActive={ownerUser.mfa_active} />
        </div>
      </section>
    </div>
  )
}
