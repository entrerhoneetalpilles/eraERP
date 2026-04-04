import { auth, signOut } from "@/auth"
import { LogOut, Bell } from "lucide-react"
import { Button } from "@conciergerie/ui"

export async function Header() {
  const session = await auth()

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-white border-b border-garrigue-100 flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-garrigue-500 hover:text-garrigue-700 hover:bg-garrigue-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l border-garrigue-100">
          <div className="text-right">
            <p className="text-sm font-medium text-garrigue-900">
              {session?.user?.name}
            </p>
            <p className="text-xs text-garrigue-500">{session?.user?.role}</p>
          </div>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/login" })
            }}
          >
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="text-garrigue-500 hover:text-garrigue-700"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
