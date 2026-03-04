import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/leaves-list/requests-list')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/leaves-list/requests-list"!</div>
}
