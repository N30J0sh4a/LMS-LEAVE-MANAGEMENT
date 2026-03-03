import * as React from 'react'
import { PanelLeft } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type SidebarContextValue = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error('Sidebar components must be used inside SidebarProvider.')
  }
  return context
}

function SidebarProvider({
  children,
  defaultOpen = false,
  className,
}: React.ComponentProps<'div'> & { defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen)

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <div className={cn('flex min-h-screen w-full', className)}>{children}</div>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  children,
  className,
}: React.ComponentProps<'aside'>) {
  const { open, setOpen } = useSidebar()

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-72 border-r border-[#E6E8EC] bg-white transition-transform md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        {children}
      </aside>
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/30 md:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        />
      ) : null}
    </>
  )
}

function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { open, setOpen } = useSidebar()

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn('md:hidden', className)}
      onClick={() => setOpen(!open)}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('min-w-0 flex-1', className)} {...props} />
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('border-b border-[#E6E8EC] p-5', className)} {...props} />
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex-1 space-y-6 p-4', className)} {...props} />
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-2', className)} {...props} />
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-auto border-t border-[#E6E8EC] p-4', className)} {...props} />
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
}
