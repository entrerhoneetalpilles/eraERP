import Link from "next/link"
import { getUsers, getAuditLogs, getSystemStats } from "@/lib/dal/admin"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus, Shield, Users, Activity, Bell, CheckCircle2, XCircle, Clock } from "lucide-react"
import { AdminTable } from "./admin-table"

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrateur", DIRECTION: "Direction", GESTIONNAIRE: "Gestionnaire",
  COMPTABLE: "Comptable", SERVICES: "Services", TRAVAUX: "Travaux",
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  DIRECTION: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  GESTIONNAIRE: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  COMPTABLE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
  SERVICES: "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400",
  TRAVAUX: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
}

export default async function AdminPage() {
  const [users, auditLogs, sysStats] = await Promise.all([getUsers(), getAuditLogs(30), getSystemStats()])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Gestion des utilisateurs, rôles et journal d'audit"
        actions={
          <Link href="/admin/users/new">
            <Button size="sm" className="cursor-pointer"><Plus className="w-4 h-4 mr-2" />Nouvel utilisateur</Button>
          </Link>
        }
      />

      {/* System stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Utilisateurs internes", value: String(sysStats.users), icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Portails propriétaires", value: String(sysStats.ownerUsers), icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "Actions d'audit", value: String(sysStats.auditLogs), icon: Activity, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Notifs non lues", value: String(sysStats.notifications), icon: Bell, color: sysStats.notifications > 0 ? "text-amber-600" : "text-muted-foreground", bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-1"><span className="text-xs text-muted-foreground">{label}</span><div className={`p-1.5 rounded-md ${bg}`}><Icon className={`w-3.5 h-3.5 ${color}`} /></div></div>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Security notice */}
      <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-3">
        <Shield className="w-4 h-4 text-muted-foreground shrink-0" />
        <p className="text-sm text-muted-foreground">
          Seul un administrateur peut créer, modifier ou désactiver des comptes. Les mots de passe ne sont jamais affichés.
          MFA recommandé pour tous les comptes avec accès comptabilité ou administration.
        </p>
      </div>

      {/* Users table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Utilisateurs ({users.length})</p>
        </div>
        <div className="divide-y divide-border">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">{user.nom[0]}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{user.nom}</p>
                    {user.mfa_active && <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded font-medium">MFA</span>}
                    {!user.actif && <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded">Inactif</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[user.role] ?? "bg-muted text-muted-foreground"}`}>{ROLE_LABELS[user.role] ?? user.role}</span>
                {user.actif ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-muted-foreground" />}
                <Link href={`/admin/users/${user.id}/edit`} className="text-xs text-primary hover:underline cursor-pointer">Modifier</Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit log */}
      {auditLogs.length > 0 && (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Journal d&apos;audit (30 dernières actions)</p>
          </div>
          <div className="divide-y divide-border">
            {auditLogs.map(log => (
              <div key={log.id} className="flex items-center gap-4 px-5 py-2.5 hover:bg-accent/30 transition-colors">
                <span className="text-xs text-muted-foreground w-32 shrink-0 tabular-nums">
                  {new Date(log.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </span>
                <span className="text-xs font-medium text-foreground w-24 shrink-0">{log.user?.nom ?? "Système"}</span>
                <span className="text-xs px-1.5 py-0.5 bg-muted text-muted-foreground rounded font-mono">{log.action}</span>
                <span className="text-xs text-muted-foreground">{log.entity_type} #{log.entity_id.slice(-6)}</span>
                {log.ip && <span className="text-xs text-muted-foreground ml-auto font-mono">{log.ip}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
