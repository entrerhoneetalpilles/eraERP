import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getNotifications } from "@/lib/dal/notifications"
import { PageHeader } from "@/components/ui/page-header"
import { Bell } from "lucide-react"
import { NotificationsList } from "./notifications-list"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const notifications = await getNotifications(session.user.id)

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title="Notifications"
        description={`${notifications.filter(n => !n.lu).length} non lue${notifications.filter(n => !n.lu).length !== 1 ? "s" : ""}`}
      />
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-20 text-muted-foreground">
          <Bell className="w-10 h-10 opacity-20" />
          <p className="text-sm">Aucune notification</p>
        </div>
      ) : (
        <NotificationsList notifications={notifications as any} userId={session.user.id} />
      )}
    </div>
  )
}
