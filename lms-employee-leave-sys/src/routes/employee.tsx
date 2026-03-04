import { useEffect, useMemo, useState } from 'react'
import { createFileRoute, Link, redirect, useNavigate } from '@tanstack/react-router'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  CalendarDays,
  Clock3,
  PanelLeft,
  Plane,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'

import { auth } from '../lib/firebase'
import { loginUserSession, type UserProfile } from '../lib/auth-api'
import { clearUserProfile, getUserProfile, saveUserProfile } from '../lib/session'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { AppSidebar } from '../components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { Button } from '@/components/ui/button'

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
              <CardDescription>Available leaves</CardDescription>
              <CardTitle className="text-lg">Leave balance</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <p className="text-4xl font-semibold">5</p>
              <Plane className="h-5 w-5 text-[#1A5FD7]" />
            </CardContent>
          </Card>

          <Card className="border-[#E6E8EC] shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>In progress</CardDescription>
              <CardTitle className="text-lg">Pending requests</CardTitle>
            </CardHeader>
            <CardContent className="flex items-end justify-between">
              <p className="text-4xl font-semibold">1</p>
              <Sparkles className="h-5 w-5 text-[#1A5FD7]" />
            </CardContent>
          </Card>

          <Card className="border-[#E6E8EC] shadow-sm">
            <CardHeader className="pb-2">
              <CardDescription>Account</CardDescription>
              <CardTitle className="text-lg">Member since</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                  year: 'numeric',
                })}
              </p>
              <p className="text-sm text-[#6B7280]">Corporate profile verified</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="border-[#E6E8EC] shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl">Recent Leave Activity</CardTitle>
              <CardDescription>
                Dynamic profile is live. Leave API integration can be connected next.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  title: 'Vacation Leave',
                  status: 'Pending',
                  when: 'Submitted 2 days ago',
                },
                {
                  title: 'Sick Leave',
                  status: 'Approved',
                  when: 'Approved last week',
                },
                {
                  title: 'Emergency Leave',
                  status: 'Rejected',
                  when: 'Reviewed 3 weeks ago',
                },
              ].map((item) => (
                <div
                  key={item.title + item.when}
                  className="flex flex-col gap-2 rounded-xl border border-[#E6E8EC] p-4 sm:flex-row sm:items-center sm:justify-between hover:cursor-pointer hover:bg-stone-100"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-[#6B7280]">{item.when}</p>
                  </div>
                  <span className="inline-flex w-fit rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-medium text-[#1A5FD7]">
                    {item.status}
                  </span>
                </div>
              ))}
              <Button
                asChild
                variant={"outline"}
                className='w-full'
              >
                <Link to='/leaves-list/requests-list'>View your requests</Link>
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
