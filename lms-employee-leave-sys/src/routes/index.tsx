import { createFileRoute } from '@tanstack/react-router'
import { SidebarProvider, SidebarTrigger } from '../components/ui/sidebar'
import { AppSidebar } from '../components/dashboard-sidebar';

interface Props {
  children?: React.ReactNode,
}

const Dashboard = ({children} : Props) => {
  return (
    //page content
    <main className='flex flex-1 flex-col w-screen h-screen m-0 p-0'>
      <section>
        <SidebarProvider>
          <main>
            <AppSidebar/>
            <SidebarTrigger/>
            {children}
          </main>
        </SidebarProvider>
      </section>
      <section>

      </section>
    </main>
  )
}

export default Dashboard;

export const Route = createFileRoute('/')({
  component: Dashboard,
})
