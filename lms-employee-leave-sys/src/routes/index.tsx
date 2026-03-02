import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "../components/ui/separator";
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

export const Route = createFileRoute('/')({
  component: Dashboard,
})

export function Dashboard (){
  return (
    //page content
    <main className='flex flex-1 w-screen h-screen m-0 p-0'>

      {/**Sidebar */}
      <section className='flex flex-1 w-auto h-full '>
       <SidebarProvider
        open={true}
        defaultOpen={true}
       >
          <main>
            <SidebarTrigger/>
          </main>
       </SidebarProvider>
        
      </section>

      <Separator
        orientation="vertical"
      />

      {/**Main content */}
      <section className='flex flex-5 flex-col w-auto h-full p-20 gap-5'>
        <div className='flex flex-0 flex-row h-fit w-full content-center gap-5'>
          <SunIcon className='w-8 h-auto'/>
          <h1 className='text-2xl text-stone-600 font-semibold'>Good morning, Juan!</h1>
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
                <p className='text-4xl font-bold'>5</p>
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
                <p className='text-4xl font-bold'>1</p>
              </div>
            </CardContent>
            <CardFooter>
              <p className='text-xs italic text-stone-700'>Leave was submitted last 07/15/26</p>
            </CardFooter>
          </Card>

          <Card
            className='flex-1 h-full'
          >
            <CardHeader>
              <CardTitle>No. of Leaves</CardTitle>
              <CardDescription>Available leaves</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='w-full h-fit'>
                <p className='text-4xl font-bold'>5</p>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className=''>
          
        </div>

        <div className='flex flex-1 h-auto w-full'/>
      </section>
    </main>
  )
}

export default Dashboard;
