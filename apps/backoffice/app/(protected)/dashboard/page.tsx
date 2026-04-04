import { auth } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold text-garrigue-900">
        Tableau de bord
      </h1>
      <p className="text-muted-foreground mt-2">
        Connecté en tant que {session?.user?.name} ({session?.user?.role})
      </p>
    </div>
  )
}
