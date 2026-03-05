import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Separator } from "./ui/separator";

interface Props {
    title: string,
    status: string,
    time: string
}

const RequestLeaveItem = ({title, status, time} : Props) => {

    const withdrawRequest = () => {

    }

    return (
      <div
        key={title + time}
        className="flex flex-col gap-2 rounded-xl border border-[#E6E8EC] px-4 py-2 sm:flex-row sm:items-center sm:justify-between hover:bg-stone-100"
      >
        <div>
          <p className="font-medium text-start">{title}</p>
          <p className="text-sm text-[#6B7280]">{time}</p>
          {status == "Pending" && document.title == "Request List" ? (
            <Button
              className="flex flex-0 mt-2 hover:cursor-pointer hover:bg-red-700"
              variant="destructive"
              onClick={withdrawRequest}
            >
              Withdraw request
            </Button>
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
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <p>Request information</p>
                  <p className="text-[0.9rem] font-light mt-1">{time}</p>
                </DialogTitle>

                <Separator />

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
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
        <span className="inline-flex w-fit rounded-full bg-[#EEF4FF] px-3 py-1 text-xs font-medium text-[#1A5FD7]">
          {status}
        </span>
      </div>
    );
}

export default RequestLeaveItem;