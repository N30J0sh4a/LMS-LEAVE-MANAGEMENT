import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from '@tanstack/react-router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  BriefcaseBusiness,
  CalendarCheck2,
  Clock3,
  PanelLeft,
  ShieldCheck,
  Sparkles,
  UserRoundCog,
  UsersRound,
} from 'lucide-react'

import { auth } from '../lib/firebase'
import { loginUserSession, type UserProfile } from '../lib/auth-api'
import { listLeavesByStatus, type LeaveRequest } from '../lib/leaves-api'
import { clearUserProfile, getUserProfile, saveUserProfile } from '../lib/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AppSidebar } from '../components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { Button } from '../components/ui/button'

export const Route = createFileRoute('/manager')({
  beforeLoad: () => {
    if (typeof window === 'undefined') {
      return
    }

    const profile = getUserProfile()
    if (!profile || profile.role !== 'manager') {
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState<UserProfile | null>(() => getUserProfile())
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(true)

  useEffect(() => {
    document.title = 'Manager | Dashboard'
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        clearUserProfile()
        setUser(null)
        setLoadingProfile(false)
        await navigate({ to: '/' })
        return
      }

      try {
        const idToken = await firebaseUser.getIdToken()
        const profile = await loginUserSession(idToken, {
          role: 'manager',
          autoCreate: false,
        })

        saveUserProfile(profile)
        setUser(profile)
      } catch {
        clearUserProfile()
        setUser(null)
        await navigate({ to: '/' })
      } finally {
        setLoadingProfile(false)
      }
    })

    return () => unsubscribe()
  }, [navigate])

  useEffect(() => {
    if (!user) {
      return
    }

    const fetchLeaves = async () => {
      try {
        setLoadingLeaves(true)
        const [pending, approved, rejected, cancelled] = await Promise.all([
          listLeavesByStatus('PENDING'),
          listLeavesByStatus('APPROVED'),
          listLeavesByStatus('REJECTED'),
          listLeavesByStatus('CANCELLED'),
        ])

        const merged = [...pending, ...approved, ...rejected, ...cancelled].sort(
          (a, b) =>
            new Date(b.updatedAt || b.createdAt).getTime() -
            new Date(a.updatedAt || a.createdAt).getTime()
        )
        setLeaves(merged)
      } finally {
        setLoadingLeaves(false)
      }
    }

    void fetchLeaves()
  }, [user?.uid])

  const formattedDate = useMemo(
    () =>
      currentTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    [currentTime]
  )

  const formattedTime = useMemo(
    () =>
      currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    [currentTime]
  )

  const initials = useMemo(() => {
    if (!user?.fullName) {
      return 'M'
    }
    return user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }, [user?.fullName])

  const pendingCount = useMemo(
    () => leaves.filter((leave) => leave.status === 'PENDING').length,
    [leaves]
  )
  const approvedCount = useMemo(
    () => leaves.filter((leave) => leave.status === 'APPROVED').length,
    [leaves]
  )
  const rejectedCount = useMemo(
    () => leaves.filter((leave) => leave.status === 'REJECTED').length,
    [leaves]
  )

  const handleLogout = async () => {
    await signOut(auth)
    clearUserProfile()
    await navigate({ to: '/' })
  }

  if (loadingProfile || !user) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#F4F6F9]">
        <p className="text-sm text-[#2D3142]">Loading your management workspace...</p>
      </main>
    )
  }

  if (location.pathname !== '/manager') {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <AppSidebar
        userName={user.fullName}
        userEmail={user.email}
        role="manager"
        currentPath="/manager"
        onLogout={handleLogout}
      />
      <SidebarInset className="bg-[#F4F6F9] text-[#2D3142]">
        <div className="relative overflow-hidden border-b border-[#E6E8EC] bg-gradient-to-br from-[#2D3142] via-[#1A5FD7] to-[#2D3142]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#F26327_0%,transparent_40%)] opacity-25" />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-8 md:px-10">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                  <PanelLeft className="h-4 w-4" />
                </SidebarTrigger>
                <div className="grid size-12 place-items-center rounded-xl bg-white/15 text-sm font-semibold text-white backdrop-blur-sm">
                  {initials}
                </div>
                <div>
                  <p className="text-sm text-[#D6D9E0]">Manager workspace</p>
                  <h1 className="text-2xl font-semibold text-white md:text-3xl">
                    Good day, {user.fullName}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm text-[#E4E8F0]">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="h-4 w-4" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {formattedTime}
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Elevated access active
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 md:px-10">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Manager profile</CardDescription>
                <CardTitle className="text-lg">Signed in as</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-[#6B7280] capitalize">{user.role}</p>
              </CardContent>
            </Card>

            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Today</CardDescription>
                <CardTitle className="text-lg">Team requests</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <p className="text-4xl font-semibold">{loadingLeaves ? '-' : leaves.length}</p>
                <UsersRound className="h-5 w-5 text-[#1A5FD7]" />
              </CardContent>
            </Card>

            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Queue</CardDescription>
                <CardTitle className="text-lg">Pending approvals</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <p className="text-4xl font-semibold">{loadingLeaves ? '-' : pendingCount}</p>
                <Sparkles className="h-5 w-5 text-[#1A5FD7]" />
              </CardContent>
            </Card>

            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Decision stats</CardDescription>
                <CardTitle className="text-lg">Approved / Rejected</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-2xl font-semibold">
                  {loadingLeaves ? '-' : `${approvedCount} / ${rejectedCount}`}
                </p>
                <p className="text-sm text-[#6B7280]">Total reviewed decisions</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-[#E6E8EC] shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Manager Dashboard</CardTitle>
                <CardDescription>
                  Use Team Leaves to approve or reject requests by status tabs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-[#E6E8EC] bg-white p-4">
                  <p className="font-medium">Workflow</p>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Go to Team Leaves for pending reviews and final decisions.
                  </p>
                  <Button asChild className="mt-4 bg-[#1A5FD7] text-white hover:bg-[#174bb0]">
                    <Link to="/manager/team-leaves">Open Team Leaves</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Admin Snapshot</CardTitle>
                <CardDescription>Authenticated manager session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <UserRoundCog className="h-4 w-4 text-[#1A5FD7]" />
                  <span>{user.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <BriefcaseBusiness className="h-4 w-4 text-[#1A5FD7]" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-[#1A5FD7]" />
                  <span>
                    Last login:{' '}
                    {new Date(user.lastLoginAt).toLocaleString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default RouteComponent
