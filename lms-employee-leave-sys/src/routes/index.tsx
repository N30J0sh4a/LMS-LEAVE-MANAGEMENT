import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Dashboard,
})

function Dashboard() {
  return <main className='flex flex-1 flex-col w-screen h-screen m-0 p-0'>
    
  </main>
}

export default Dashboard;
