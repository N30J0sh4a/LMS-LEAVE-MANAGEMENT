import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { getUserProfile, clearUserProfile, saveUserProfile } from '../../lib/session'
import { loginUserSession, type UserProfile } from '@/lib/auth-api'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { addDays, format } from "date-fns"
import type { DateRange } from 'react-day-picker'

/* 
import { auth } from '../lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
*/

import {
  ArrowDown01,
  ArrowLeft,
  CalendarDays,
  CalendarIcon,
  Clock3,
  Home,
  NotebookPen,
  PanelLeft,
  ShieldCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Field } from '@/components/ui/field'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'

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

    {/**React hooks */}
    const [user, setUser] = useState<UserProfile | null>(() => getUserProfile())
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const navigate = useNavigate();

    {/**Going back one page */}
    const router = useRouter();
    const [position, setPosition] = useState("Filter list by")
    const onBack = () => router.history.back();

    const [date, setDate] = useState<DateRange | undefined>({
            from: new Date(new Date().getFullYear(), 0, 20),
            to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
        })
    
        useEffect(() => {
            const timer = window.setInterval(() => {
              setCurrentTime(new Date())
            }, 1000)
        
            return () => window.clearInterval(timer)
        }, [])
    
    useEffect(() => {
        const timer = window.setInterval(() => {
          setCurrentTime(new Date())
        }, 1000)
    
        return () => window.clearInterval(timer)
    }, [])

    useEffect(() => {
        document.title = "Request List"
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

      const leaveInfo = () => {
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent>
            <PopoverHeader>
              <PopoverTitle>Title</PopoverTitle>
              <PopoverDescription>Description text here.</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      }

      {/**Withdraw request */}
      const withdrawRequest = () => {

      }
    
      /*
      const handleLogout = async () => {
        await signOut(auth)
        clearUserProfile()
        await navigate({ to: '/' })
      }
        */
    
      if (loadingProfile || !user) {
        return (
          <main className="min-h-screen grid place-items-center bg-[#F4F6F9]">
            <p className="text-sm text-[#2D3142]">Loading your workspace...</p>
          </main>
        )
      }

    {/**CONTENT */}
    return <main className='w-screen h-screen flex flex-col'>
        <SidebarProvider className='flex flex-1 flex-col w-full h-fit bg-radial'>
            <SidebarInset className='flex flex-0 w-full h-auto'>
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
                        <h1 className="text-2xl font-semibold text-white md:text-3xl">
                        Your requests
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
            </SidebarInset>

            {/**List requests */}
            <section className='flex flex-1 w-auto h-auto bg-[#F4F6F9] px-[18dvw] py-[2.5%]'>
              <Card className='flex flex-col flex-4 w-fit h-full px-[5dvw]'>
                <div className='flex flex-0 flex-row w-full h-fit gap-5 content-center pb-3 border-b'>

                  <Link 
                    to={"/"}
                    onClick={() => {
                      onBack();
                    return false;
                  }}
                  className='inline-block mr-4 h-auto w-auto content-center'
                  >
                    <ArrowLeft className='h-auto'/>
                  </Link>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant={'outline'}
                      >
                        <ArrowDown01/>
                        {position == null ? "" : position}
                                </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-32">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Choose an option</DropdownMenuLabel>
                            <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                              <DropdownMenuRadioItem value="By weeks">By weeks</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="By months">By months</DropdownMenuRadioItem>
                              <DropdownMenuRadioItem value="By years">By years</DropdownMenuRadioItem>
                             </DropdownMenuRadioGroup>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    <Field className="flex flex-0 w-fit self-start">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            id="date-picker-range"
                            className="justify-start px-2.5 font-normal"
                          >
                          <CalendarIcon className='text-stone-700 font-normal'/>
                            {date?.from ? (
                            date.to ? (
                              <>
                                {format(date.from, "LLL dd, y")} -{" "}
                                {format(date.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(date.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          defaultMonth={date?.from}
                          selected={date}
                          onSelect={setDate}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </Field>

                  <div className='flex flex-auto w-full h-fit'/>

                  <Button
                    asChild
                    variant={"outline"}
                  >
                    <Link to={user.role == "employee" ? "/employee" : "/manager"}>
                          <Home/>
                          <p className='text-stone-700'>Return to dashboard</p>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant={"outline"}
                  >
                    <Link to="/request-leaves/request-leave">
                          <NotebookPen/>
                          <p className='text-stone-700'>Request new leave</p>
                    </Link>
                  </Button>
                </div>

                <div className='flex flex-1 flex-col gap-5'>
                  <p>This week</p>
                  {[
                    {
                      title: 'Vacation Leave',
                      status: 'Pending',
                      when: 'Submitted 2 days ago',
                    },
                  ].map((item) => (
                    <div
                      key={item.title + item.when}
                      className="flex flex-col gap-2 rounded-xl border border-[#E6E8EC] p-4 sm:flex-row sm:items-center sm:justify-between hover:cursor-pointer hover:bg-stone-100"
                    >
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-[#6B7280]">{item.when}</p>
                        {item.status == "Pending" ? 
                        <Button
                          className='flex flex-0 mt-2'
                          variant='destructive'
                          onClick={withdrawRequest}
                        >
                          Withdraw request
                        </Button>
                        :
                        <Button
                          className='flex flex-0 mt-2'
                          variant='destructive'
                          onClick={withdrawRequest}
                          disabled
                        >
                          Withdraw request
                        </Button>
                        }
                      </div>
                      <span className="inline-flex w-fit rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-medium text-[#1A5FD7]">
                        {item.status}
                      </span>
                    </div>
                  ))}

                  <p>This month</p>
                  {[
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
                      onClick={leaveInfo}
                    >
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-[#6B7280]">{item.when}</p>
                        {item.status == "Pending" ? 
                        <Button
                          className='flex flex-0 mt-2'
                          variant='destructive'
                          onClick={withdrawRequest}
                        >
                          Withdraw request
                        </Button>
                        :
                        <Button
                          className='flex flex-0 mt-2'
                          variant='destructive'
                          onClick={withdrawRequest}
                          disabled
                        >
                          Withdraw request
                        </Button>
                        }
                      </div>
                      <span className="inline-flex w-fit rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-medium text-[#1A5FD7]">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
                    
                </Card>
            </section>
        </SidebarProvider>
    </main>
}
