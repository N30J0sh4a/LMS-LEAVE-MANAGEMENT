import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
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
        className="flex flex-col gap-2 rounded-xl border border-[#E6E8EC] p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-stone-100"
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
              className="flex flex-0 mt-2 hover:cursor-pointer over:bg-red-700"
              variant="destructive"
              onClick={withdrawRequest}
              hidden
            >
              Withdraw request
            </Button>
          )}
          <Dialog>
            <DialogTrigger>
              <Button variant="outline" className="mt-2 hover:cursor-pointer">
                View request info
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  <p>Request information</p>
                  <p className="text-[0.9rem] font-light mt-1">{time}</p>
                </DialogTitle>

                <Separator />

                <DialogDescription>
                  <div className="grid grid-cols-5 grid-rows-5 gap-4">
                    
                  </div>
                </DialogDescription>
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