import clsx from "clsx";
import { Plus } from "lucide-react";

const TaskTitle = ({ label, className } : {label : string , className : string}) => {
  return (
    <div className='w-full h-10 md:h-12 px-2 md:px-4 rounded bg-dashboard6 flex items-center justify-between gap-10'>
      <div className='flex gap-2 items-center'>
        <div className={clsx("w-4 h-4 rounded-full ", className)} />
        <p className='text-sm md:text-base text-foreground'>{label}</p>
      </div>

      <button className='hidden md:block'>
        <Plus className='text-lg text-black' />
      </button>
    </div>
  );
};

export default TaskTitle;
