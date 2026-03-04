import { createFileRoute, Link, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { getUserProfile, clearUserProfile, saveUserProfile } from '../../lib/session'
import { loginUserSession, type UserProfile } from '@/lib/auth-api'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '../../components/ui/sidebar'
import { onAuthStateChanged } from 'firebase/auth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { auth } from '../../lib/firebase'
import { addDays, format } from "date-fns"
import type { DateRange } from 'react-day-picker'
import { submitLeave } from '@/lib/leave-api'

/* 
import { auth } from '../lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
*/

import {
    ArrowDown01,
    ArrowLeft,
    Building,
  CalendarDays,
  CalendarIcon,
  Clock3,
  PanelLeft,
  ShieldCheck,
  User,
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

    {/**React hooks */}
    const [user, setUser] = useState<UserProfile | null>(() => getUserProfile())
    const [loadingProfile, setLoadingProfile] = useState(true)
    const [currentTime, setCurrentTime] = useState(() => new Date());
    const navigate = useNavigate();
<<<<<<< HEAD
    const [leaveType, setLeaveType] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [submitSuccess, setSubmitSuccess] = useState(false)
=======
    const [position, setPosition] = useState("Choose leave type")
>>>>>>> c2ff3849bb6523cde5e9fb0fd9d661d07d1a9edb

    {/**Going back one page */}
    const router = useRouter();
    const onBack = () => router.history.back();

    {/**Change page title */}
    useEffect(() => {
        document.title = "Request leave"
    }, [])

    {/**For date range picker */}
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(new Date().getFullYear(), 0, 20),
        to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
    })

    {/**Submit handler function */}
    const handleSubmit = async () => {
        if (!user) return

        if (!leaveType || !date?.from || !date?.to) {
            setSubmitError('Please fill in all required fields.')
            return
        }

        setSubmitting(true)
        setSubmitError(null)

        try {
            await submitLeave({
            employeeId: user.uid,
            leaveType: leaveType.toUpperCase(),
            startDate: format(date.from, 'yyyy-MM-dd'),
            endDate: format(date.to, 'yyyy-MM-dd'),
        })
        setSubmitSuccess(true)
        } catch (err) {
            setSubmitError(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setSubmitting(false)
        }
    }

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
                        <p className="text-sm text-[#D6D9E0]">EMPLOYEE</p>
                        <h1 className="text-2xl font-semibold text-white md:text-3xl">
                        Leave request form
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

            <section className='flex flex-1 flex-col w-full h-auto px-[20dvw] py-[2.5dvh]'>
                <Card className='flex flex-col h-fit px-[15%] py-[5%]'>
                    <CardHeader className='font-semibold text-xl'> 
                        <div className='w-full h-full justify-center'>
                            <Link 
                                to={"/"}
                                onClick={() => {
                                    onBack();
                                    return false;
                                }}
                                className='inline-block mr-4 h-auto w-auto'
                            >
                                <ArrowLeft className='h-auto'/>
                            </Link>
                            <p className='inline-block h-auto content-center justify-center'>Fill up the form</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/**Inputs */}
                        <Label htmlFor='employee-name' className='mb-2 font-normal text-stone-700'>Your name <span className='text-red-800'>*</span></Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <User/>
                            </InputGroupAddon>
                            <InputGroupInput id='employee-name' name='employee-name' placeholder='Enter your full name here'>
                            </InputGroupInput>
                        </InputGroup>

                        <div className='flex flex-1 w-full h-fit gap-5'>
                            <div className='flex flex-1 flex-col w-auto h-fit'>
                                <Label htmlFor='employee-name' className='mb-2 font-normal mt-5 text-stone-700'>Department<span className='text-red-800'>*</span></Label>
                                    <InputGroup>
                                    <InputGroupAddon>
                                        <Building/>
                                    </InputGroupAddon>
                                    <InputGroupInput id='employee-name' name='employee-name' placeholder='Enter your department'>
                                </InputGroupInput>
                            </InputGroup>
                            </div>

                            <div className='flex flex-1 flex-col w-auto h-fit'>
                                <Label htmlFor='employee-name' className='mb-2 font-normal mt-5 text-stone-700'>Designation / Position<span className='text-red-800'>*</span></Label>
                                    <InputGroup>
                                    <InputGroupAddon>
                                        <Workflow/>
                                    </InputGroupAddon>
                                    <InputGroupInput id='employee-name' name='employee-name' placeholder='Enter your current position'>
                                </InputGroupInput>
                            </InputGroup>
                            </div>
                        </div>

<<<<<<< HEAD
                        <Label htmlFor='employee-name' className='mb-2 font-normal mt-5 text-stone-700'>Nature of leave to be availed (maternity / sick / available) <span className='text-red-800'>*</span></Label>
                        <InputGroup>
                            <InputGroupAddon>
                                <User/>
                            </InputGroupAddon>
                            <InputGroupInput id='leave-type' name='leave-type' placeholder='Enter leave type' value={leaveType} onChange={(e) => setLeaveType(e.target.value)}>
                            </InputGroupInput>
                        </InputGroup>
=======
                        <Label htmlFor='employee-name' className='mb-2 font-normal mt-5 text-stone-700'>Nature of leave to be availed (<i>Sick / Paid / Emergency / Unpaid</i>) <span className='text-red-800'>*</span></Label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={'outline'}
                                    >
                                    <ArrowDown01/>
                                    {position == null ? "Choose leave type" : position}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-32">
                                <DropdownMenuGroup>
                                <DropdownMenuLabel>Leave types</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                                    <DropdownMenuRadioItem value="Sick">Sick</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Vacation">Vacation</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Emergency">Emergency</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="Unpaid">Unpaid</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
>>>>>>> c2ff3849bb6523cde5e9fb0fd9d661d07d1a9edb

                        {/**Pick leave date range */}
                        <Field className="mx-auto w-full mt-5">
                            <FieldLabel htmlFor="date-picker-range" className='text-stone-700 font-normal'>Date Picker Range <span className='text-red-800'>*</span></FieldLabel>
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

                        {/**Reason */}
                        <Field className='mt-5'>
                            <FieldLabel htmlFor="textarea-message" className='text-stone-700 font-normal'>Message <span className='text-red-800'>*</span></FieldLabel>
                            <Textarea id="textarea-message" placeholder="Elaborate your reason for requesting a leave." />
                        </Field>

<<<<<<< HEAD
                        {submitError && (
                            <p className='text-red-600 text-sm mt-2'>{submitError}</p>
                        )}
                        {submitSuccess && (
                            <p className='text-green-600 text-sm mt-2'>Leave request submitted successfully!</p>
                        )}
                        <Button onClick={handleSubmit} disabled={submitting} className='my-5 w-full hover:cursor-pointer'>
                            {submitting ? 'Submitting...' : 'Submit'}
=======
                        <Button
                            asChild
                            className='my-5 w-full hover:cursor-pointer'
                        >
                            <Link to='/leaves-list/requests-list'>Submit</Link>
>>>>>>> c2ff3849bb6523cde5e9fb0fd9d661d07d1a9edb
                        </Button>
                    </CardContent>
                </Card>
            </section>
        </SidebarProvider>
    </main>
}
