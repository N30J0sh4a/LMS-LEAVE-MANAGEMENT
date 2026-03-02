import React, { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { SunIcon } from "lucide-react";
import { CardFooter } from "../components/ui/card";
import { LeaveRequestItem } from "../components/leave-request-item";
import { Calendar } from "@/components/ui/calendar"
import { AppSidebar } from "@/components/app-sidebar"

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

export function RouteComponent (){

  {/**Get current date * time w/ format */}
  const currentDate = new Date();
  const formattedDate = currentDate.toDateString();


  {/**Page title change */}
  useEffect(() => {
    document.title = 'Employee | Dashboard'
  }, []);

  {/**For th shadcn calendar */}
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    //page content
    <main className='flex flex-1 w-screen h-screen m-0 p-0'>

      {/**Sidebar */}
      <section className='flex flex-1 flex-col w-auto h-full '>
       <SidebarProvider
        open={true}
        defaultOpen={true}
       >
          <AppSidebar/>
          <main>
            <SidebarTrigger/>
          </main>
       </SidebarProvider>

      </section>

      {/**Main content */}
      <section className='flex flex-5 flex-col w-auto h-full p-20 gap-5'>
        
        <div className='flex flex-0 flex-col w-full h-fit gap-2.5'>
          <div className='flex flex-0 flex-row h-fit w-full content-center gap-5'>
            <SunIcon className='w-8 h-auto'/>
            <h1 className='text-2xl text-stone-600 font-semibold'>Good morning!</h1>
          </div>

          <p className='text-xl font-thin'>Today is <span className='font-normal'>{formattedDate}</span></p>
        </div>
        
        {/**Leave cards */}
        <div className='flex flex-0 w-full h-fit gap-10'>
          <Card
            className='flex-1 h-full'
          >
            <CardHeader>
              <CardTitle><p className='text-2xl'>Number of leaves</p></CardTitle>
              <CardDescription>Available leaves</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='w-full h-fit'>
                <p className='text-5xl font-bold'>5</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className='flex-1 h-full'
          >
            <CardHeader>
              <CardTitle><p className='text-2xl'>Pending leaves</p></CardTitle>
              <CardDescription>Current, pending leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='w-full h-fit'>
                <p className='text-5xl font-bold'>1</p>
              </div>
            </CardContent>
            
          </Card>

          <Card
            className='flex-1 h-full'
          >
            <CardHeader>
              <CardTitle><p className='text-2xl'>Rejected leaves</p></CardTitle>
              <CardDescription>Leave requests rejected by the manager</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='w-full h-fit'>
                <p className='text-5xl font-bold'>0</p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/**Leaves list */}
        <div className='flex flex-1 w-full h-auto m-0 p-0 gap-10'>
          
          {/**Your leave requests */}
          <Card
            className='flex-1 h-full w-auto'
          >
            <CardHeader>
              <CardTitle><p className='text-2xl'>Your leave requests</p></CardTitle>
              <CardDescription>Click on each item to view your request status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='w-full h-fit border-t-3'>
                <LeaveRequestItem
                  title="Hudson Williams"
                  dateTime="February 25, 2026 | 07:15:34 AM"
                />
                <LeaveRequestItem
                  title="Connor Storrie"
                  dateTime="February 25, 2026 | 07:15:34 AM"
                />
                <LeaveRequestItem
                  title="Sabrina Carpenter"
                  dateTime="February 25, 2026 | 07:15:34 AM"
                />
              </div>
            </CardContent>
          </Card>

          {/**Rejected leave requests */}
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border"
          />

        </div>

        <div className='flex flex-1 h-auto w-full'/>
      </section>
    </main>
  )
}

export default RouteComponent;
