import Link from "next/link"
import { getUsers } from "@/lib/dal/admin"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus, Shield } from "lucide-react"
import { AdminTable } from "./admin-table"

export default async function AdminPage() {
  const users = await getUsers()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description={`${users.length} utilisateur${users.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/admin/users/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvel utilisateur
            </Button>
          </Link>
        }
      />

      <div className="bg-card border rounded-lg p-4 flex items-center gap-3">
        <Shield className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Seul un administrateur peut créer ou désactiver des comptes. Les mots de passe ne sont jamais affichés.
        </p>
      </div>

      <AdminTable data={users} />
    </div>
  )
}
