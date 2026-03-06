import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  CalendarDays,
  Clock3,
  Loader2,
  PanelLeft,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'

import { auth } from '../lib/firebase'
import { loginUserSession, type UserProfile } from '../lib/auth-api'
import { listEmployeeLeaves, type LeaveRequest } from '../lib/leaves-api'
import { clearUserProfile, getUserProfile, saveUserProfile } from '../lib/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AppSidebar } from '../components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export const Route = createFileRoute('/employee')({
  beforeLoad: () => {
    if (typeof window === 'undefined') {
      return
    }

    const profile = getUserProfile()
    if (!profile || profile.role !== 'employee') {
      throw redirect({ to: '/' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(() => getUserProfile())
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(true)
  const [leavesError, setLeavesError] = useState('')

  useEffect(() => {
    document.title = 'Employee | Dashboard'
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
          role: 'employee',
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

    const fetchEmployeeLeaves = async () => {
      try {
        setLoadingLeaves(true)
        setLeavesError('')
        const items = await listEmployeeLeaves(user.uid)
        setLeaves(items)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load leave requests.'
        setLeavesError(message)
        toast.error(message)
      } finally {
        setLoadingLeaves(false)
      }
    }

    void fetchEmployeeLeaves()
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
      return 'U'
    }
    return user.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }, [user?.fullName])

  const stats = useMemo(() => {
    const pending = leaves.filter((leave) => leave.status === 'PENDING').length
    const approved = leaves.filter((leave) => leave.status === 'APPROVED').length
    const rejected = leaves.filter((leave) => leave.status === 'REJECTED').length
    const cancelled = leaves.filter((leave) => leave.status === 'CANCELLED').length

    return {
      total: leaves.length,
      pending,
      approved,
      rejected,
      cancelled,
    }
  }, [leaves])

  const recentLeaves = useMemo(() => leaves.slice(0, 4), [leaves])

  const handleLogout = async () => {
    await signOut(auth)
    clearUserProfile()
    await navigate({ to: '/' })
  }

  if (loadingProfile || !user) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#F4F6F9]">
        <p className="text-sm text-[#2D3142]">Loading your workspace...</p>
      </main>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar
        userName={user.fullName}
        userEmail={user.email}
        role="employee"
        currentPath="/employee"
        onLogout={handleLogout}
      />
      <SidebarInset className="bg-[#F4F6F9] text-[#2D3142]">
        <div className="relative overflow-hidden border-b border-[#E6E8EC] bg-linear-to-br from-[#2D3142] via-[#1A5FD7] to-[#2D3142]">
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
                  <p className="text-sm text-[#D6D9E0]">Employee workspace</p>
                  <h1 className="text-2xl font-semibold text-white md:text-3xl">
                    Welcome back, {user.fullName}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-sm text-[#E4E8F0]">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formattedDate}
              </div>
              <div className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {formattedTime}
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Secure session active
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 md:px-10">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Profile</CardDescription>
                <CardTitle className="text-lg">Signed in as</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-medium">{user.email}</p>
                <p className="text-sm text-[#6B7280] capitalize">{user.role}</p>
              </CardContent>
            </Card>

            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Total filed</CardDescription>
                <CardTitle className="text-lg">Leave requests</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <p className="text-4xl font-semibold">{loadingLeaves ? '-' : stats.total}</p>
                <Sparkles className="h-5 w-5 text-[#1A5FD7]" />
              </CardContent>
            </Card>

            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>In progress</CardDescription>
                <CardTitle className="text-lg">Pending requests</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <p className="text-4xl font-semibold">{loadingLeaves ? '-' : stats.pending}</p>
                <Sparkles className="h-5 w-5 text-[#1A5FD7]" />
              </CardContent>
            </Card>

            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription>Decisions</CardDescription>
                <CardTitle className="text-lg">Approved / Rejected</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-2xl font-semibold">
                  {loadingLeaves ? '-' : `${stats.approved} / ${stats.rejected}`}
                </p>
                <p className="text-sm text-[#6B7280]">Cancelled: {loadingLeaves ? '-' : stats.cancelled}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="border-[#E6E8EC] shadow-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Recent Leave Activity</CardTitle>
                <CardDescription>Live data from your leave requests.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingLeaves ? (
                  <div className="flex items-center gap-2 rounded-xl border border-[#E6E8EC] p-4 text-sm text-[#6B7280]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading activity...
                  </div>
                ) : null}

<<<<<<< HEAD
                <RequestLeaveItem
                  title="Sick Leave"
                  time="Approved last week"
                  status="Approved"
                />
                <RequestLeaveItem
                  title="Emergency Leave"
                  time="Reviewed 3 weeks ago"
                  status="Rejected"
                />
=======
                {!loadingLeaves && leavesError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {leavesError}
                  </div>
                ) : null}
>>>>>>> dd73de1f9ad201d110f98f76a4ac8b1aefccdba8

                {!loadingLeaves && !leavesError && recentLeaves.length === 0 ? (
                  <div className="rounded-xl border border-[#E6E8EC] p-4 text-sm text-[#6B7280]">
                    No leave requests filed yet.
                  </div>
                ) : null}

                {!loadingLeaves && !leavesError
                  ? recentLeaves.map((leave) => (
                      <div
                        key={leave.leaveId}
                        className="flex flex-col gap-2 rounded-xl border border-[#E6E8EC] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="font-medium">
                            {leave.leaveType} ({leave.startDate} to {leave.endDate})
                          </p>
                          <p className="text-sm text-[#6B7280]">
                            Submitted: {new Date(leave.createdAt).toLocaleString('en-US')}
                          </p>
                        </div>
                        <span className="inline-flex w-fit rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-medium text-[#1A5FD7]">
                          {leave.status}
                        </span>
                      </div>
                    ))
                  : null}

                <Button asChild variant="outline" className="w-full">
                  <Link to="/leaves-list/requests-list">View your requests</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-[#E6E8EC] shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Account Snapshot</CardTitle>
                <CardDescription>Fetched from authenticated session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <UserRound className="h-4 w-4 text-[#1A5FD7]" />
                  <span>{user.fullName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-4 w-4 text-[#1A5FD7]" />
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
