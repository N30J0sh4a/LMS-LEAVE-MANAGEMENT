import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { getUserProfile, clearUserProfile, saveUserProfile } from '../../lib/session'
import { loginUserSession, type UserProfile } from '@/lib/auth-api'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { submitLeave } from '@/lib/leaves-api'
import { AppSidebar } from '@/components/app-sidebar'
import { toast } from 'sonner'

import {
  ArrowLeft,
  Building,
  CalendarDays,
  CalendarIcon,
  Clock3,
  PanelLeft,
  ShieldCheck,
  Workflow,
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldLabel } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const Route = createFileRoute('/request-leaves/request-leave')({
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
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)

  const [leaveType, setLeaveType] = useState('')
  const [department, setDepartment] = useState('')
  const [position, setPosition] = useState('')
  const [reason, setReason] = useState('')
  const [date, setDate] = useState<DateRange | undefined>()

  const router = useRouter()
  const onBack = () => router.history.back()

  useEffect(() => {
    document.title = 'Request leave'
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

  const handleSubmit = async () => {
    if (!user) {
      return
    }

    if (!leaveType) {
      toast.warning('Please choose a leave type.')
      return
    }
    if (!department.trim()) {
      toast.warning('Department is required.')
      return
    }
    if (!position.trim()) {
      toast.warning('Position is required.')
      return
    }
    if (!reason.trim()) {
      toast.warning('Please provide your reason for leave.')
      return
    }
    if (!date?.from || !date?.to) {
      toast.warning('Please choose the leave date range.')
      return
    }

    try {
      setSubmitting(true)
      await submitLeave({
        employeeId: user.uid,
        employeeName: user.fullName,
        employeeEmail: user.email,
        leaveType,
        startDate: format(date.from, 'yyyy-MM-dd'),
        endDate: format(date.to, 'yyyy-MM-dd'),
        department: department.trim(),
        position: position.trim(),
        reason: reason.trim(),
      })

      toast.success('Leave request submitted successfully.')
      setLeaveType('')
      setDepartment('')
      setPosition('')
      setReason('')
      setDate(undefined)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong while submitting.'
      toast.error(message)
    } finally {
      setSubmitting(false)
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
        currentPath="/request-leaves/request-leave"
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
                  <p className="text-sm text-[#D6D9E0]">EMPLOYEE</p>
                  <h1 className="text-2xl font-semibold text-white md:text-3xl">Leave request form</h1>
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

        <section className="mx-auto w-full max-w-5xl px-6 py-8 md:px-10">
          <Card className="p-4 md:p-8">
            <CardHeader className="px-0 text-xl font-semibold">
              <div className="w-full">
                <Link
                  to="/"
                  onClick={() => {
                    onBack()
                    return false
                  }}
                  className="inline-block mr-4"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
                <p className="inline-block">Fill up the form</p>
              </div>
            </CardHeader>
            <CardContent className="px-0">
              <div className="grid gap-5">
                <div className="grid gap-2">
                  <Label className="text-stone-700">Account name</Label>
                  <p className="rounded-md border border-[#E6E8EC] bg-[#F9FAFC] px-3 py-2 text-sm">
                    {user.fullName}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="department" className="mb-2 font-normal text-stone-700">
                      Department <span className="text-red-800">*</span>
                    </Label>
                    <InputGroup>
                      <InputGroupAddon>
                        <Building />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="department"
                        placeholder="Enter your department"
                        value={department}
                        onChange={(event) => setDepartment(event.target.value)}
                      />
                    </InputGroup>
                  </div>

                  <div>
                    <Label htmlFor="position" className="mb-2 font-normal text-stone-700">
                      Designation / Position <span className="text-red-800">*</span>
                    </Label>
                    <InputGroup>
                      <InputGroupAddon>
                        <Workflow />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="position"
                        placeholder="Enter your current position"
                        value={position}
                        onChange={(event) => setPosition(event.target.value)}
                      />
                    </InputGroup>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label className="font-normal text-stone-700">
                    Nature of leave to be availed <span className="text-red-800">*</span>
                  </Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SICK">Sick</SelectItem>
                      <SelectItem value="VACATION">Vacation</SelectItem>
                      <SelectItem value="EMERGENCY">Emergency</SelectItem>
                      <SelectItem value="UNPAID">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Field className="w-full">
                  <FieldLabel htmlFor="date-picker-range" className="text-stone-700 font-normal">
                    Date picker range <span className="text-red-800">*</span>
                  </FieldLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        id="date-picker-range"
                        className="w-full justify-start px-2.5 font-normal"
                      >
                        <CalendarIcon className="text-stone-700 font-normal" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                            </>
                          ) : (
                            format(date.from, 'LLL dd, y')
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={date?.from ?? new Date()}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </Field>

                <Field>
                  <FieldLabel htmlFor="textarea-message" className="text-stone-700 font-normal">
                    Message <span className="text-red-800">*</span>
                  </FieldLabel>
                  <Textarea
                    id="textarea-message"
                    placeholder="Elaborate your reason for requesting a leave."
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                  />
                </Field>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-[#1A5FD7] text-white hover:cursor-pointer hover:bg-[#174bb0]"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </SidebarInset>
    </SidebarProvider>
  )
}
