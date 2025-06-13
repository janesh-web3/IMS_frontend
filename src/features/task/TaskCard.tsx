import clsx from "clsx";
import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUp01,
  File,
  List as ListIcon,
  MessageCircleMore,
} from "lucide-react";
import { BGS, formatDate, PRIOTITYSTYELS, TASK_TYPE, TASK_STATUS_COLORS } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DelegateTask from "./DelegateTask";
import { useAdminContext } from "@/context/adminContext";

const ICONS = {
  high: <ArrowUp />,
  medium: <ArrowUp01 />,
  low: <ArrowDown />,
};

interface Task {
  delegatedBy: any;
  assignedTo(assignedTo: any): unknown;
  _id: string;
  title: string;
  date: string;
  priority: "high" | "medium" | "low";
  stage: "todo" | "in progress" | "completed" | "pending";
  assets: string[];
  team: {
    _id: string;
    name: string;
    title: string;
    email: string;
    completed: boolean;
  }[];
  isTrashed: boolean;
  activities: any[];
  subTasks: {
    completed: unknown;
    title: string;
    date: string;
    tag: string;
    _id: string;
  }[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const { adminDetails } = useAdminContext();
  
  // Check if current user is admin or superadmin
  const isAdmin = adminDetails.role === "admin" || adminDetails.role === "superadmin";

  // Get status color class based on task stage
  const getStatusColorClass = (stage: string) => {
    const normalizedStage = stage.charAt(0).toUpperCase() + stage.slice(1);
    const statusKey = normalizedStage as keyof typeof TASK_STATUS_COLORS;
    
    if (TASK_STATUS_COLORS[statusKey]) {
      return TASK_STATUS_COLORS[statusKey].bg;
    }
    
    return TASK_TYPE[stage as keyof typeof TASK_TYPE] || TASK_TYPE.todo;
  };

  return (
    <div className="w-full h-fit bg-card shadow-md p-4 rounded">
      <div className="w-full flex justify-between">
        <div
          className={clsx(
            "flex flex-1 gap-1 items-center text-sm font-medium",
            PRIOTITYSTYELS[task?.priority] || ""
          )}
        >
          <span className="text-lg">{ICONS[task?.priority]}</span>
          <span className="uppercase">{task?.priority} Priority</span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div
          className={clsx(
            "w-4 h-4 rounded-full",
            getStatusColorClass(task.stage)
          )}
        />
        <h4 className="line-clamp-1 font-medium">{task?.title}</h4>
      </div>
      <span className="text-sm text-muted-foreground">
        {task?.date ? formatDate(new Date(task?.date)) : "No due date"}
      </span>

      <div className="w-full border-t border-muted my-2" />

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="flex gap-1 items-center text-sm text-muted-foreground">
            <MessageCircleMore className="w-4 h-4" />
            <span>{task?.activities?.length || 0}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-muted-foreground">
            <File className="w-4 h-4" />
            <span>{task?.assets?.length || 0}</span>
          </div>
          <div className="flex gap-1 items-center text-sm text-muted-foreground">
            <ListIcon className="w-4 h-4" />
            <span>
              {(task?.subTasks?.filter((st) => st.completed) || []).length}/
              {task?.subTasks?.length || 0}
            </span>
          </div>
        </div>

        <div className="flex flex-row-reverse">
          {task?.team?.map((m, index) => (
            <div
              key={index}
              className={clsx(
                "w-7 h-7 rounded-full flex items-center justify-center text-sm -mr-1",
                BGS[index % BGS?.length]
              )}
              title={`${m.name} (${m.title})`}
            >
              {m.name.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>

      {/* Sub tasks preview */}
      {task?.subTasks?.length > 0 && (
        <div
          className="py-2 border-t border-muted cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-medium">
              Subtasks ({task.subTasks.length})
            </h5>
            <span className="text-xs text-muted-foreground">
              {expanded ? "Hide" : "Show"}
            </span>
          </div>

          {expanded && (
            <div className="mt-2 space-y-2">
              {task.subTasks.map((subtask, i) => (
                <div key={i} className="text-xs p-2 bg-secondary/40 rounded">
                  <div className="font-medium">{subtask.title}</div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">
                      {subtask.date
                        ? formatDate(new Date(subtask.date))
                        : "No date"}
                    </span>
                    {subtask.tag && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {subtask.tag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-2">
        <h3 className="text-sm font-medium">Assigned To:</h3>
        <div className="flex flex-wrap gap-1 mt-1">
          {Array.isArray(task.assignedTo) ? (
            ((task.assignedTo as unknown) as Array<{ _id: string; username: string }>).map((assignee) => (
              <span 
                key={assignee._id} 
                className="px-2 py-1 bg-primary/10 text-primary rounded-full"
              >
                {assignee.username}
              </span>
            ))
          ) : (
            <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
              {typeof task.assignedTo === 'function' ? "Unassigned" : 
                (typeof task.assignedTo === 'object' && task.assignedTo !== null && 'username' in task.assignedTo) ? 
                  (task.assignedTo as unknown as {username: string}).username : "Unassigned"}
            </span>
          )}
        </div>
      </div>
      
      {task.delegatedBy && (
        <div className="mt-2 text-xs text-muted-foreground">
          Delegated by: {task.delegatedBy.username}
        </div>
      )}
      
      {(Array.isArray(task.assignedTo) ? task.assignedTo.length > 0 : task.assignedTo !== null) && (
        <div className="mt-2 text-xs">
          Team: <span className="font-medium">
            {typeof task.assignedTo === 'function' ? 'Unassigned' :
              Array.isArray(task.assignedTo) ? 
                ((task.assignedTo as unknown) as Array<{username: string}>).map(user => user.username).join(', ') :
                ((task.assignedTo as unknown) as { username: string })?.username || 'Unassigned'
            }
          </span>
        </div>
      )}
      
      {/* Add delegation button for admins */}
      {isAdmin && (
        <Dialog open={delegateOpen} onOpenChange={setDelegateOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Delegate Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DelegateTask 
              taskId={task._id} 
              onClose={() => setDelegateOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      )}
      
      {/* Sub tasks preview */}
      {task?.subTasks?.length > 0 && (
        <div
          className="py-2 border-t border-muted cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex justify-between items-center">
            <h5 className="text-sm font-medium">
              Subtasks ({task.subTasks.length})
            </h5>
            <span className="text-xs text-muted-foreground">
              {expanded ? "Hide" : "Show"}
            </span>
          </div>

          {expanded && (
            <div className="mt-2 space-y-2">
              {task.subTasks.map((subtask, i) => (
                <div key={i} className="text-xs p-2 bg-secondary/40 rounded">
                  <div className="font-medium">{subtask.title}</div>
                  <div className="flex justify-between mt-1">
                    <span className="text-muted-foreground">
                      {subtask.date
                        ? formatDate(new Date(subtask.date))
                        : "No date"}
                    </span>
                    {subtask.tag && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {subtask.tag}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskCard;
