import { auth } from "@/auth"

export default async function OwnerDashboardPage() {
  const session = await auth()

  return (
    <div className="p-8">
      <h1 className="font-serif text-3xl text-garrigue-900">
        Bonjour, {session?.user?.name}
      </h1>
      <p className="text-garrigue-500 mt-2">
        Votre espace propriétaire
      </p>
    </div>
  )
}
