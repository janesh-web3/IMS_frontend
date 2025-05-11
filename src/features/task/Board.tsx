import { useEffect, useState } from "react";
import { useTaskContext } from "@/context/taskContext";
import TaskCard from "./TaskCard";
import TaskTitle from "./TaskTitle";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AddTask from "./AddTask";
import { Task } from "@/services/taskService";
// Import from react-beautiful-dnd with proper types
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const Board = () => {
  const { tasks, loading, error, fetchTasks, updateTaskStatus } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [columns, setColumns] = useState<Record<'Pending' | 'In Progress' | 'Completed', { title: string; items: Task[] }>>({
    Pending: {
      title: "Pending",
      items: [] as Task[]
    },
    "In Progress": {
      title: "In Progress",
      items: [] as Task[]
    },
    Completed: {
      title: "Completed",
      items: [] as Task[]
    }
  });

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (tasks.length) {
      const newColumns = {
        Pending: {
          title: "Pending",
          items: tasks.filter(task => task.status === "Pending")
        },
        "In Progress": {
          title: "In Progress",
          items: tasks.filter(task => task.status === "In Progress")
        },
        Completed: {
          title: "Completed",
          items: tasks.filter(task => task.status === "Completed")
        }
      };
      setColumns(newColumns);
    } else {
      // Reset to empty when no tasks
      setColumns({
        Pending: {
          title: "Pending",
          items: []
        },
        "In Progress": {
          title: "In Progress",
          items: []
        },
        Completed: {
          title: "Completed",
          items: []
        }
      });
    }
  }, [tasks]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Same column, just reordering within column (no status change)
      return;
    }
    
    // Different column, update task status
    const newStatus = destination.droppableId;
    try {
      await updateTaskStatus(draggableId, newStatus);
    } catch (error) {
      console.error("Failed to update task status:", error);
    }
  };

  // if (loading) {
  //   return <div className="p-4">Loading tasks...</div>;
  // }

  // if (error) {
  //   return <div className="p-4 text-red-500">Error: {error}</div>;
  // }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Task Board</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <AddTask modalClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.keys(columns).map(columnKey => (
            <div key={columnKey} className="flex flex-col h-full">
              <TaskTitle 
                label={columns[columnKey as 'Pending' | 'In Progress' | 'Completed'].title} 
                className={columnKey === "Pending" 
                  ? "bg-blue-600" 
                  : columnKey === "In Progress" 
                    ? "bg-yellow-600" 
                    : "bg-green-600"
                } 
              />
              
              <Droppable droppableId={columnKey}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 min-h-[500px] bg-muted/30 rounded-md mt-2 p-2 overflow-y-auto"
                  >
                    {columns[columnKey as 'Pending' | 'In Progress' | 'Completed'].items.map((task: Task, index: number) => (
                      <Draggable 
                        key={task._id} 
                        draggableId={task._id} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-3"
                          >
                            <TaskCard 
                              task={{
                                _id: task._id,
                                title: task.title,
                                date: task.dueDate,
                                priority: task.priority.toLowerCase() as any,
                                stage: task.status === "In Progress" ? "in progress" : task.status.toLowerCase() as any,
                                team: [{
                                  _id: task.assignedTo?._id || "",
                                  name: task.assignedTo?.username || "Unassigned",
                                  title: task.assignedTo?.role || "",
                                  email: "",
                                  completed: false // Added missing property
                                }],
                                isTrashed: false,
                                activities: task.activities || [],
                                subTasks: task.subTasks?.map((st: { title: string; date: string; tag?: string; _id: string }) => ({
                                  title: st.title,
                                  date: st.date,
                                  tag: st.tag || "Task",
                                  _id: st._id
                                })) || [],
                                createdAt: task.createdAt,
                                updatedAt: task.updatedAt,
                                __v: 0,
                                assets: task.assets || [] // Added missing property
                              }}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Board;
