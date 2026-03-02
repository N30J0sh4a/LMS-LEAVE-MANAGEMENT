interface Props {
    dateTime: string,
    title: string
}

export function LeaveRequestItem({dateTime, title} : Props) {
    return (
        <div className='flex flex-1 flex-col w-full h-full rounded-xl px-3 py-5 gap-1 border-b-1 hover:cursor-pointer hover:bg-stone-200 active:bg-stone-300'>
            <p className='text-x font-semibold'>{title}</p>
            <p className='text-xs'>{dateTime}</p>
        </div>
    )
} 