import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { BriefcaseBusiness, CalendarClock, LayoutDashboard, LogOut, Notebook, UserRound } from "lucide-react"

type AppSidebarProps = {
  userName: string
  userEmail: string
  role: "employee" | "manager"
  currentPath: string
  onLogout: () => Promise<void> | void
}

export function AppSidebar({ userName, userEmail, role, currentPath, onLogout }: AppSidebarProps) {
  const navItems =
    role === "employee"
      ? [
          {
            label: "Dashboard",
            to: "/employee",
            icon: LayoutDashboard,
            active: currentPath === "/employee",
          },
          {
            label: "My Requests",
            to: "/leaves-list/requests-list",
            icon: CalendarClock,
            active: currentPath.startsWith("/leaves-list/requests-list"),
          },
          {
            label: "Request for a leave",
            to: "/request-leaves/request-leave",
            icon: Notebook,
            active: currentPath.startsWith("/request-leaves/request-leave"),
          },
        ]
      : [
          { label: "Dashboard", to: "/manager", icon: LayoutDashboard, active: currentPath === "/manager" },
          {
            label: "Team Leaves",
            to: "/manager/team-leaves",
            icon: BriefcaseBusiness,
            active: currentPath.startsWith("/manager/team-leaves"),
          },
        ]

  return (
    <Sidebar className="text-[#2D3142]">
      <SidebarHeader>
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#2D3142] via-[#1A5FD7] to-[#2D3142] p-4 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#F26327_0%,transparent_40%)] opacity-25" />
          <div className="relative z-10 space-y-1">
            <p className="text-xs uppercase tracking-wide text-[#DCE6FF]">{role} portal</p>
            <p className="text-lg font-semibold leading-tight">{userName}</p>
            <p className="text-xs text-[#DCE6FF]">{userEmail}</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <p className="px-2 text-xs uppercase tracking-wide text-[#9AA3B2]">Navigation</p>
          <div className="space-y-2 pt-2">
            {navItems.map((item) => (
              <Button
                key={item.label}
                asChild
                variant="ghost"
                className={`w-full justify-start ${
                  item.active
                    ? "bg-[#EEF4FF] text-[#1A5FD7]"
                    : "text-[#2D3142] hover:bg-[#EEF4FF] hover:text-[#1A5FD7]"
                }`}
              >
                <Link to={item.to}>
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>
        </SidebarGroup>

        <SidebarGroup>
          <p className="px-2 text-xs uppercase tracking-wide text-[#9AA3B2]">Session</p>
          <div className="rounded-xl border border-[#E6E8EC] bg-[#F9FAFC] p-3 text-sm text-[#4B5563]">
            <div className="mb-2 flex items-center gap-2">
              <UserRound className="h-4 w-4 text-[#1A5FD7]" />
              <span className="font-medium">{userName}</span>
            </div>
            <p className="text-xs">{userEmail}</p>
            <Button
              asChild
              variant='outline'
              className="w-full mt-2"
            >
              <Link to='/user-profile'>View your profile</Link>
            </Button>
          </div>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start border-[#E6E8EC] text-[#2D3142] hover:bg-[#FFF1F2] hover:text-[#B91C1C]"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
