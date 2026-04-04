import { auth, signOut } from "@/auth"
import { LogOut, Bell } from "lucide-react"
import { Button } from "@conciergerie/ui"

export async function Header() {
  const session = await auth()

  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 bg-background border-b flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 pl-3 border-l">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">
              {session?.user?.name}
            </p>
            <p className="text-xs text-muted-foreground">{session?.user?.role}</p>
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
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </header>
  )
}
