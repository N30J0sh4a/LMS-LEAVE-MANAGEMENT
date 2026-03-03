import React, { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { SunIcon } from "lucide-react";
import { LeaveRequestItem } from "../components/leave-request-item";
import { Calendar } from "../components/ui/calendar"
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Avatar, AvatarImage } from "../components/ui/avatar";

export const Route = createFileRoute('/employee')({
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

  {/**For the shadcn calendar */}
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  {/**Live clock and time format */}
  const[currentTime, setCurrentTime] = useState(new Date())
  const padTwoDigits = (num) => num.toString().padStart(2, '0');
  const formattedTime = `${padTwoDigits(currentTime.getHours())}:${padTwoDigits(currentTime.getMinutes())}:${padTwoDigits(currentTime.getSeconds())}`
  useEffect(() => {
    const tick = () => {
      setCurrentTime(new Date())
    };

    const timerId = setInterval(tick, 1000);

    return function cleanup() {
      clearInterval(timerId);
    };
  }, []);

  return (
    //page content
    <main className='flex flex-1 w-screen h-screen m-0 p-0'>
      {/**Sidebar */}
      <section className='flex flex-1 flex-col px-2 py-[5dvh] w-auto h-full bg-stone-100'>

        {/**Avatar */}
        <div className='flex flex-1 flex-col px-2 py-5 w-full h-full justify-center content-center text-center gap-7'>
          <Avatar
            className="w-20 h-auto self-center"
          >
            <AvatarImage src="user-placeholder.png"/>
          </Avatar>

          <div className='flex flex-1 flex-col w-full h-fit'>
            <h1 className='text-2xl font-normal'>Juan dela Cruz</h1>
            <h1 className='text-xl font-light'>Employee</h1>
          </div>
        </div>
      
        <div className='flx flex-1 flex-col w-full h-auto'>
          <Button
          variant={"outline"}
          className='w-full mb-3 active:bg-stone-300'
          >Request for a leave</Button>

          <Button
          variant={"outline"}
          className='w-full mb-3 active:bg-stone-300'
          >View your requests</Button>

          <Button
          variant={"destructive"}
          className="w-full mb-3 active:bg-red-800"
        >
          Log out
        </Button>
        </div>

      {/**Space */}
      <div className='flex flex-3 w-full h-auto'/>

      <Separator/>

      {/**Live clock */}
      <div className='flex flex-0 flex-col py-3 w-full h-fit text-center'>
        <p className='text-xl'>Current time</p>
        <p className='text-2xl font-light'>{formattedTime.toString()}</p>
      </div>

      </section>
      <Separator
        orientation="vertical"
      />
      {/**Main content */}
      <section className='flex flex-5 flex-col w-auto h-full p-20 gap-5'>
        
        <div className='flex flex-0 flex-col w-full h-fit gap-2.5'>
          <div className='flex flex-0 flex-row h-fit w-full content-center gap-5'>
            <SunIcon className='w-8 h-auto'/>
            <h1 className='text-4xl text-stone-600 font-semibold'>Good morning!</h1>
          </div>

          <p className='text-xl font-thin'>Today is <span className='font-semibold'>{formattedDate}</span></p>
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
                  title="Service-incentive Leave (SIL)"
                  dateTime="February 25, 2026 | 07:15:34 AM"
                />
                <LeaveRequestItem
                  title="Maternity Leave"
                  dateTime="February 25, 2026 | 07:15:34 AM"
                />
                <LeaveRequestItem
                  title="Sick Leave"
                  dateTime="February 25, 2026 | 07:15:34 AM"
                />
              </div>

              <Button
                variant={"outline"}
                
              />
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
