import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { toast } from 'sonner'
import {
  CheckCircle2,
  Clock3,
  Loader2,
  PanelLeft,
  ShieldCheck,
  XCircle,
} from 'lucide-react'

import { auth } from '../lib/firebase'
import { loginUserSession, type UserProfile } from '../lib/auth-api'
import { approveLeave, listLeavesByStatus, rejectLeave, type LeaveRequest } from '../lib/leaves-api'
import { clearUserProfile, getUserProfile, saveUserProfile } from '../lib/session'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { AppSidebar } from '../components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { Textarea } from '../components/ui/textarea'

export const Route = createFileRoute('/manager/team-leaves')({
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
  const [user, setUser] = useState<UserProfile | null>(() => getUserProfile())
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [leaves, setLeaves] = useState<LeaveRequest[]>([])
  const [loadingLeaves, setLoadingLeaves] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [leavesError, setLeavesError] = useState('')
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [targetLeaveId, setTargetLeaveId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    document.title = 'Manager | Team Leaves'
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

  const fetchLeaves = async () => {
    try {
      setLoadingLeaves(true)
      setLeavesError('')
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load leave requests.'
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
    void fetchLeaves()
  }, [user?.uid])

  const leavesByStatus = useMemo(() => {
    return {
      PENDING: leaves.filter((leave) => leave.status === 'PENDING'),
      APPROVED: leaves.filter((leave) => leave.status === 'APPROVED'),
      REJECTED: leaves.filter((leave) => leave.status === 'REJECTED'),
    }
  }, [leaves])

  const currentItems = leavesByStatus[activeTab]

  const handleLogout = async () => {
    await signOut(auth)
    clearUserProfile()
    await navigate({ to: '/' })
  }

  const handleApprove = async (leaveId: string) => {
    if (!user) {
      return
    }

    try {
      setActionLoading(`approve:${leaveId}`)
      await approveLeave(leaveId, user.email)
      toast.success('Leave request approved.')
      await fetchLeaves()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve leave.'
      setLeavesError(message)
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  const openRejectDialog = (leaveId: string) => {
    setTargetLeaveId(leaveId)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  const handleRejectSubmit = async () => {
    if (!user || !targetLeaveId) {
      return
    }

    if (!rejectionReason.trim()) {
      toast.warning('Rejection reason is required.')
      return
    }

    try {
      setActionLoading(`reject:${targetLeaveId}`)
      await rejectLeave(targetLeaveId, user.email, rejectionReason.trim())
      toast.success('Leave request rejected.')
      setRejectDialogOpen(false)
      setTargetLeaveId(null)
      setRejectionReason('')
      await fetchLeaves()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject leave.'
      setLeavesError(message)
      toast.error(message)
    } finally {
      setActionLoading(null)
    }
  }

  if (loadingProfile || !user) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#F4F6F9]">
        <p className="text-sm text-[#2D3142]">Loading team leaves...</p>
      </main>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar
        userName={user.fullName}
        userEmail={user.email}
        role="manager"
        currentPath="/manager/team-leaves"
        onLogout={handleLogout}
      />
      <SidebarInset className="bg-[#F4F6F9] text-[#2D3142]">
        <div className="relative overflow-hidden border-b border-[#E6E8EC] bg-gradient-to-br from-[#2D3142] via-[#1A5FD7] to-[#2D3142]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#F26327_0%,transparent_40%)] opacity-25" />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-5 px-6 py-8 md:px-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white">
                <PanelLeft className="h-4 w-4" />
              </SidebarTrigger>
              <div>
                <p className="text-sm text-[#D6D9E0]">Manager workspace</p>
                <h1 className="text-2xl font-semibold text-white md:text-3xl">Team Leaves</h1>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#E4E8F0]">
              <ShieldCheck className="h-4 w-4" />
              Review leave requests by status and take action on pending items.
            </div>
          </div>
        </div>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 md:px-10">
          <Card className="border-[#E6E8EC] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Leave Requests</CardTitle>
              <CardDescription>Pending, approved, and rejected team requests.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {(['PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => {
                  const count = leavesByStatus[status].length
                  const active = activeTab === status
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setActiveTab(status)}
                      className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                        active
                          ? 'bg-[#1A5FD7] text-white'
                          : 'border border-[#E6E8EC] bg-white text-[#2D3142] hover:bg-[#EEF4FF]'
                      }`}
                    >
                      {status.charAt(0) + status.slice(1).toLowerCase()} ({count})
                    </button>
                  )
                })}
              </div>

              {loadingLeaves ? (
                <div className="flex items-center gap-2 rounded-xl border border-[#E6E8EC] p-4 text-sm text-[#6B7280]">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading leave requests...
                </div>
              ) : null}

              {!loadingLeaves && leavesError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {leavesError}
                </div>
              ) : null}

              {!loadingLeaves && !leavesError && currentItems.length === 0 ? (
                <div className="rounded-xl border border-[#E6E8EC] p-4 text-sm text-[#6B7280]">
                  No {activeTab.toLowerCase()} requests found.
                </div>
              ) : null}

              {!loadingLeaves && !leavesError
                ? currentItems.map((item) => {
                    const isPending = item.status === 'PENDING'
                    const approveKey = `approve:${item.leaveId}`
                    const rejectKey = `reject:${item.leaveId}`
                    const isApproving = actionLoading === approveKey
                    const isRejecting = actionLoading === rejectKey

                    return (
                      <div
                        key={item.leaveId}
                        className="space-y-3 rounded-xl border border-[#E6E8EC] bg-white p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-medium">{item.employeeName || item.employeeId}</p>
                            <p className="text-sm text-[#6B7280]">
                              {item.leaveType} • {item.startDate} to {item.endDate}
                            </p>
                          </div>
                          <span className="inline-flex w-fit rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-medium text-[#1A5FD7]">
                            {item.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-4 text-xs text-[#6B7280]">
                          <p>Submitted: {new Date(item.createdAt).toLocaleString('en-US')}</p>
                          {item.reviewedBy ? <p>Reviewed by: {item.reviewedBy}</p> : null}
                          {item.reviewedAt ? (
                            <p>Reviewed at: {new Date(item.reviewedAt).toLocaleString('en-US')}</p>
                          ) : null}
                        </div>

                        {item.rejectionReason ? (
                          <p className="text-xs text-red-600">Reason: {item.rejectionReason}</p>
                        ) : null}

                        {isPending ? (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md border border-[#D1FAE5] bg-[#ECFDF5] px-3 py-1.5 text-xs font-medium text-[#047857] hover:bg-[#D1FAE5]"
                              onClick={() => handleApprove(item.leaveId)}
                              disabled={Boolean(actionLoading)}
                            >
                              {isApproving ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                              Approve
                            </button>

                            <button
                              type="button"
                              className="inline-flex items-center gap-1 rounded-md border border-[#FEE2E2] bg-[#FEF2F2] px-3 py-1.5 text-xs font-medium text-[#B91C1C] hover:bg-[#FEE2E2]"
                              onClick={() => openRejectDialog(item.leaveId)}
                              disabled={Boolean(actionLoading)}
                            >
                              {isRejecting ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <XCircle className="h-3.5 w-3.5" />
                              )}
                              Reject
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })
                : null}
            </CardContent>
          </Card>

          <Card className="border-[#E6E8EC] shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Manager Session</CardTitle>
              <CardDescription>Current authenticated reviewer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[#4B5563]">
              <p>{user.fullName}</p>
              <p>{user.email}</p>
              <p className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-[#1A5FD7]" />
                Last login: {new Date(user.lastLoginAt).toLocaleString('en-US')}
              </p>
            </CardContent>
          </Card>
        </section>

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
              <DialogDescription>
                Provide a clear reason. This will be saved and shown in request history.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <p className="text-xs text-[#6B7280]">Leave ID: {targetLeaveId ?? '-'}</p>
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(event) => setRejectionReason(event.target.value)}
                className="min-h-28"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false)
                  setTargetLeaveId(null)
                  setRejectionReason('')
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="bg-[#B91C1C] text-white hover:bg-[#991B1B]"
                onClick={handleRejectSubmit}
                disabled={Boolean(actionLoading) || !targetLeaveId}
              >
                {targetLeaveId && actionLoading === `reject:${targetLeaveId}` ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  'Confirm Reject'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  )
}

