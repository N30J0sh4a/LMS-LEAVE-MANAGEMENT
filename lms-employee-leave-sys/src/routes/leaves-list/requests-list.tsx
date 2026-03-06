import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getUserProfile, clearUserProfile, saveUserProfile } from '../../lib/session'
import { loginUserSession, type UserProfile } from '@/lib/auth-api'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { AppSidebar } from '@/components/app-sidebar'
import { cancelLeave, listEmployeeLeaves, type LeaveRequest, type LeaveStatus } from '@/lib/leaves-api'
import { toast } from 'sonner'

import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Home,
  NotebookPen,
  PanelLeft,
  ShieldCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import RequestLeaveItem from '@/components/request-leave-item'

export const Route = createFileRoute('/leaves-list/requests-list')({
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
  const [user, setUser] = useState<UserProfile | null>(() => getUserProfile())
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(true)
  const [withdrawingLeaveId, setWithdrawingLeaveId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'ALL' | LeaveStatus>('ALL')
  const [leavesError, setLeavesError] = useState('')
  const navigate = useNavigate()
  const router = useRouter()

  const onBack = () => router.history.back()

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    document.title = 'My Requests'
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

  const fetchLeaves = async (employeeId: string) => {
    try {
      setLoadingLeaves(true)
      setLeavesError('')
      const items = await listEmployeeLeaves(employeeId)
      setLeaves(items)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load your leave requests.'
      setLeavesError(message)
      toast.error(message)
    } finally {
      setLoadingLeaves(false)
    }
  }

  useEffect(() => {
    if (!user) {
      return
    }
    void fetchLeaves(user.uid)
  }, [user?.uid])

  const filteredLeaves = useMemo(() => {
    if (activeTab === 'ALL') {
      return leaves
    }
    return leaves.filter((leave) => leave.status === activeTab)
  }, [activeTab, leaves])

  const statusCounts = useMemo(
    () => ({
      ALL: leaves.length,
      PENDING: leaves.filter((leave) => leave.status === 'PENDING').length,
      APPROVED: leaves.filter((leave) => leave.status === 'APPROVED').length,
      REJECTED: leaves.filter((leave) => leave.status === 'REJECTED').length,
      CANCELLED: leaves.filter((leave) => leave.status === 'CANCELLED').length,
    }),
    [leaves]
  )

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

  const handleLogout = async () => {
    await signOut(auth)
    clearUserProfile()
    await navigate({ to: '/' })
  }

  const handleWithdraw = async (leave: LeaveRequest) => {
    if (!user) {
      return
    }

    if (leave.status !== 'PENDING') {
      toast.warning('Only pending requests can be withdrawn.')
      return
    }
    
    try {
      setWithdrawingLeaveId(leave.leaveId)
      await cancelLeave(leave.leaveId, user.uid)
      toast.success('Leave request withdrawn successfully.')
      await fetchLeaves(user.uid)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to withdraw leave request.'
      toast.error(message)
    } finally {
      setWithdrawingLeaveId(null)
    }
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
        currentPath="/leaves-list/requests-list"
        onLogout={handleLogout}
      />
      <SidebarInset className="min-h-screen bg-[#F4F6F9] text-[#2D3142]">
        <div className="w-full relative overflow-hidden border-b border-[#E6E8EC] bg-linear-to-br from-[#2D3142] via-[#1A5FD7] to-[#2D3142]">
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
                  <p className="text-sm text-[#D6D9E0]">Employee</p>
                  <h1 className="text-2xl font-semibold text-white md:text-3xl">My requests</h1>
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

        <section className="mx-auto w-full max-w-7xl px-6 py-8 md:px-10">
          <Card className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-wrap items-center gap-2 border-b pb-4">
              <Link
                to="/"
                onClick={() => {
                  onBack()
                  return false
                }}
                className="inline-block"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <div className="ml-auto flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to={user.role === 'employee' ? '/employee' : '/manager'}>
                    <Home className="h-4 w-4" />
                    Return to dashboard
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/request-leaves/request-leave">
                    <NotebookPen className="h-4 w-4" />
                    Request new leave
                  </Link>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'] as const).map((tab) => {
                const active = activeTab === tab
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      active
                        ? 'bg-[#1A5FD7] text-white'
                        : 'border border-[#E6E8EC] bg-white text-[#2D3142] hover:bg-[#EEF4FF]'
                    }`}
                  >
                    {tab.charAt(0) + tab.slice(1).toLowerCase()} ({statusCounts[tab]})
                  </button>
                )
              })}
            </div>

            <div className="space-y-3">
              {loadingLeaves ? (
                <div className="rounded-xl border border-[#E6E8EC] p-4 text-sm text-[#6B7280]">
                  Loading your requests...
                </div>
              ) : null}

              {!loadingLeaves && leavesError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {leavesError}
                </div>
              ) : null}

              {!loadingLeaves && !leavesError && filteredLeaves.length === 0 ? (
                <div className="rounded-xl border border-[#E6E8EC] p-4 text-sm text-[#6B7280]">
                  No requests found for this tab.
                </div>
              ) : null}

              {!loadingLeaves && !leavesError
                ? filteredLeaves.map((leave) => (
                    <RequestLeaveItem
                      key={leave.leaveId}
                      leave={leave}
                      onWithdraw={handleWithdraw}
                      withdrawing={withdrawingLeaveId === leave.leaveId}
                    />
                  ))
                : null}
            </div>
          </Card>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}
