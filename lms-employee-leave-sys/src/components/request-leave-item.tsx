import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog'
import { Separator } from './ui/separator'
import type { LeaveRequest } from '@/lib/leaves-api'
import { Loader2 } from 'lucide-react'

interface Props {
  leave: LeaveRequest
  onWithdraw?: (leave: LeaveRequest) => Promise<void> | void
  withdrawing?: boolean
}

const statusChipClass: Record<string, string> = {
  PENDING: 'bg-[#EEF4FF] text-[#1A5FD7]',
  APPROVED: 'bg-[#ECFDF5] text-[#047857]',
  REJECTED: 'bg-[#FEF2F2] text-[#B91C1C]',
  CANCELLED: 'bg-[#F3F4F6] text-[#4B5563]',
}

const RequestLeaveItem = ({ leave, onWithdraw, withdrawing = false }: Props) => {
  const submittedAt = new Date(leave.createdAt).toLocaleString('en-US')
  const reviewedAt = leave.reviewedAt ? new Date(leave.reviewedAt).toLocaleString('en-US') : null
  const canWithdraw = leave.status === 'PENDING' && Boolean(onWithdraw)

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[#E6E8EC] bg-white p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <p className="font-medium text-start">
          {leave.leaveType} leave ({leave.startDate} to {leave.endDate})
        </p>
        <p className="text-sm text-[#6B7280]">Submitted: {submittedAt}</p>

        <div className="flex flex-wrap gap-2">
          {canWithdraw ? (
            <Button
              className="hover:cursor-pointer"
              variant="destructive"
              disabled={withdrawing}
              onClick={() => onWithdraw?.(leave)}
            >
              {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Withdraw request
            </Button>
          ) : null}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:cursor-pointer">
                View request info
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request information</DialogTitle>
                <DialogDescription>Leave ID: {leave.leaveId}</DialogDescription>
                <Separator />
                <div className="grid gap-2 text-sm text-[#374151]">
                  <p>
                    <span className="font-medium">Leave type:</span> {leave.leaveType}
                  </p>
                  <p>
                    <span className="font-medium">Date range:</span> {leave.startDate} to {leave.endDate}
                  </p>
                  <p>
                    <span className="font-medium">Department:</span> {leave.department || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Position:</span> {leave.position || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Reason:</span> {leave.reason || 'N/A'}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span> {leave.status}
                  </p>
                  <p>
                    <span className="font-medium">Submitted at:</span> {submittedAt}
                  </p>
                  {leave.reviewedBy ? (
                    <p>
                      <span className="font-medium">Reviewed by:</span> {leave.reviewedBy}
                    </p>
                  ) : null}
                  {reviewedAt ? (
                    <p>
                      <span className="font-medium">Reviewed at:</span> {reviewedAt}
                    </p>
                  ) : null}
                  {leave.rejectionReason ? (
                    <p>
                      <span className="font-medium">Rejection reason:</span> {leave.rejectionReason}
                    </p>
                  ) : null}
                </div>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <span
        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${statusChipClass[leave.status] ?? 'bg-[#EEF4FF] text-[#1A5FD7]'}`}
      >
        {leave.status}
      </span>
    </div>
  )
}

export default RequestLeaveItem
