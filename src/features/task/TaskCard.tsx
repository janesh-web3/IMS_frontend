import clsx from "clsx";
import React, { useState } from "react";

import {
  ArrowDown,
  ArrowUp,
  ArrowUp01,
  File,
  List,
  MessageCircleMore,
  Plus,
} from "lucide-react";
import { BGS, formatDate, PRIOTITYSTYELS, TASK_TYPE } from "@/lib/utils";

const ICONS = {
  high: <ArrowUp />,
  medium: <ArrowUp01 />,
  low: <ArrowDown />,
};

interface Task {
  _id: string;
  title: string;
  date: string;
  priority:  "high" | "medium" | "low";
  stage: "todo" | "in progress" | "completed";
  assets: [string];
  team: {
    _id: string;
    name: string;
    title: string;
    email: string;
  }[];
  isTrashed: boolean;
  activities: [];
  subTasks: {
    title: string;
    date: string;
    tag: string;
    _id: string;
  }[];
  createdAt : string;
  updatedAt : string;
  __v : number;
}
[];

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({task}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full h-fit bg-blue shadow-md p-4 rounded">
        <div className="w-full flex justify-between">
          <div
            className={clsx(
              "flex flex-1 gap-1 items-center text-sm font-medium",
              PRIOTITYSTYELS[task?.priority]
            )}
          >
            <span className="text-lg">{ICONS[task?.priority]}</span>
            <span className="uppercase">{task?.priority} Priority</span>
          </div>

          {/* {user?.isAdmin && <TaskDialog task={task} />} */}
        </div>

        <>
          <div className='flex items-center gap-2'>
            <div
              className={clsx("w-4 h-4 rounded-full", TASK_TYPE[task.stage])}
            />
            <h4 className='line-clamp-1 text-black'>{task?.title}</h4>
          </div>
          <span className='text-sm text-gray-600'>
            {formatDate(new Date(task?.date))}
          </span>
        </>

        <div className="w-full border-t border-gray-200 my-2" />
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-center text-sm text-gray-600">
              <MessageCircleMore />
              <span>{task?.activities?.length}</span>
            </div>
            <div className="flex gap-1 items-center text-sm text-gray-600 ">
              <File />
              <span>{task?.assets?.length}</span>
            </div>
            <div className="flex gap-1 items-center text-sm text-gray-600 ">
              <List />
              <span>0/{task?.subTasks?.length}</span>
            </div>
          </div>

          <div className='flex flex-row-reverse'>
            {task?.team?.map((m, index) => (
              <div
                key={index}
                className={clsx(
                  "w-7 h-7 rounded-full text-white flex items-center justify-center text-sm -mr-1",
                  BGS[index % BGS?.length]
                )}
              >
                {/* <UserInfo user={m} /> */}
              </div>
            ))}
          </div>
        </div>

        {/* sub tasks */}
        {task?.subTasks?.length > 0 ? (
          <div className='py-4 border-t border-gray-200'>
            <h5 className='text-base line-clamp-1 text-black'>
              {task?.subTasks[0].title}
            </h5>

            <div className='p-4 space-x-8'>
              <span className='text-sm text-gray-600'>
                {formatDate(new Date(task?.subTasks[0]?.date))}
              </span>
              <span className='bg-blue-600/10 px-3 py-1 rounded0full text-blue-700 font-medium'>
                {task?.subTasks[0].tag}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className='py-4 border-t border-gray-200'>
              <span className='text-gray-500'>No Sub Task</span>
            </div>
          </>
        )}

        <div className='w-full pb-2'>
          <button
            onClick={() => setOpen(true)}
            className='w-full flex gap-4 items-center text-sm text-gray-500 font-semibold disabled:cursor-not-allowed disabled::text-gray-300'
          >
            <Plus className='text-lg' />
            <span>ADD SUBTASK</span>
          </button>
        </div>
      </div>

      {/* <AddSubTask open={open} setOpen={setOpen} id={task._id} /> */}
    </>
  );
};

export default TaskCard;
