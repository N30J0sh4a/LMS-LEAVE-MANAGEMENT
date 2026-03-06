<<<<<<< HEAD
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";
=======
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
>>>>>>> dd73de1f9ad201d110f98f76a4ac8b1aefccdba8

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

<<<<<<< HEAD
    return (
      <div
        key={title + time}
        className="flex flex-col gap-2 rounded-xl border border-[#E6E8EC] px-4 py-2 sm:flex-row sm:items-center sm:justify-between hover:bg-stone-100"
      >
        <div>
          <p className="font-medium text-start">{title}</p>
          <p className="text-sm text-[#6B7280]">{time}</p>
          {status == "Pending" && document.title == "Request List" ? (
=======
        <div className="flex flex-wrap gap-2">
          {canWithdraw ? (
>>>>>>> dd73de1f9ad201d110f98f76a4ac8b1aefccdba8
            <Button
              className="hover:cursor-pointer"
              variant="destructive"
              disabled={withdrawing}
              onClick={() => onWithdraw?.(leave)}
            >
              {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Withdraw request
            </Button>
<<<<<<< HEAD
          ) : (
            <Button
              className="flex flex-0 w-0 h-0 mt-2 hover:cursor-pointer over:bg-red-700"
              variant="destructive"
              onClick={withdrawRequest}
              hidden
            >
              Withdraw request
            </Button>
          )}
          <Dialog>
            <DialogTrigger className='w-auto h-fit'>
              {document.title == "Employee | Dashboard" ? (
                <Button variant="outline" className="mt-2 hidden hover:cursor-pointer">
                  View request info
                </Button>
              ) : (
                <Button variant="outline" className="mt-2 hover:cursor-pointer">
                  View request info
                </Button>
              )}
=======
          ) : null}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="hover:cursor-pointer">
                View request info
              </Button>
>>>>>>> dd73de1f9ad201d110f98f76a4ac8b1aefccdba8
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request information</DialogTitle>
                <DialogDescription>Leave ID: {leave.leaveId}</DialogDescription>
                <Separator />
<<<<<<< HEAD

                <DialogDescription>
                  <div className="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full mt-2">
                    <div className="col-span-2">Type of leave</div>
                    <div className="col-span-3">SICK</div>
                    <div className="row-start-2 col-span-2">
                      Date of request
                    </div>
                    <div className="row-start-2 col-span-3">
                      March 03, 2026 | 12:15:00 PM
                    </div>
                    <div className="row-start-3 col-span-2">Department</div>
                    <div className="row-start-3 col-span-3">HR Department</div>
                    <div className="row-start-4 col-span-2">Position</div>
                    <div className="row-start-4 col-span-3">
                      Talent Acquisition Manager
                    </div>
                    <div className="row-start-5 col-span-2">
                      Inclusive date of leave
                    </div>
                    <div className="row-start-5 col-span-3">
                      March 05, 2026 - March 15, 2026
                    </div>
                    <div className="row-start-6 col-span-2">
                      Reason for requesting leave
                    </div>
                    <div className="row-start-6 col-span-3">
                      My head hurts and I need to go to the doctor
                    </div>
                  </div>
                </DialogDescription>
                <DialogFooter>
                  <footer className="flex flex-1 w-full h-fit mt-5">
                    {status == "Pending" && document.title == "Request List" ? (
                      <Button
                        variant="destructive"
                        className="flex-1 hover:bg-red-800 hover:cursor-pointer"
                      >
                        Withdraw request
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        className="flex-1 hover:bg-red-800 hover:cursor-pointer"
                        hidden
                      >
                        Withdraw request
                      </Button>
                    )}
                  </footer>
                </DialogFooter>
=======
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
>>>>>>> dd73de1f9ad201d110f98f76a4ac8b1aefccdba8
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
