import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from "react-beautiful-dnd";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Task, TaskFilter, taskService } from "@/services/taskService";
import { format } from "date-fns";
import { 
  CheckCircle, 
  Clock, 
  PauseCircle, 
  XCircle,
  Plus,
  Calendar,
  Search
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ViewSwitcher from "./ViewSwitcher";

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilter>({});
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Group tasks by status
  const columns = {
    "Pending": {
      title: "Pending",
      icon: <Clock className="h-5 w-5 text-gray-500" />,
      color: "bg-gray-100",
      tasks: tasks.filter(task => task.status === "Pending")
    },
    "In Progress": {
      title: "In Progress",
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-100",
      tasks: tasks.filter(task => task.status === "In Progress")
    },
    "On Hold": {
      title: "On Hold",
      icon: <PauseCircle className="h-5 w-5 text-yellow-500" />,
      color: "bg-yellow-100",
      tasks: tasks.filter(task => task.status === "On Hold")
    },
    "Completed": {
      title: "Completed",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: "bg-green-100",
      tasks: tasks.filter(task => task.status === "Completed")
    },
    "Cancelled": {
      title: "Cancelled",
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      color: "bg-red-100",
      tasks: tasks.filter(task => task.status === "Cancelled")
    }
  };

  // Fetch tasks with filters
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const fetchedTasks = await taskService.getTasks(filters);
        
        // Apply search filter if any
        const filteredTasks = searchTerm 
          ? fetchedTasks.filter(task => 
              task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
              (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
          : fetchedTasks;
          
        setTasks(filteredTasks);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, [filters, searchTerm]);

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    // If dropped in a different column
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId;
      
      try {
        // Update task status in backend
        await taskService.updateTask(draggableId, { status: newStatus as any });
        
        // Update local state
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === draggableId ? { ...task, status: newStatus as any } : task
          )
        );
        
        toast({
          title: "Task Updated",
          description: `Task status changed to ${newStatus}`,
        });
      } catch (error) {
        console.error("Failed to update task status:", error);
        toast({
          title: "Error",
          description: "Failed to update task status",
          variant: "destructive",
        });
      }
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-blue-100 text-blue-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format due date with relative indicator
  const formatDueDate = (dueDate: string) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const isOverdue = date < today;
    const isToday = date >= today && date < tomorrow;
    
    return (
      <div className="flex items-center gap-1">
        <Calendar className={`h-3 w-3 ${isOverdue ? 'text-red-500' : isToday ? 'text-yellow-500' : 'text-gray-500'}`} />
        <span className={isOverdue ? 'text-red-500 font-medium' : isToday ? 'text-yellow-500 font-medium' : ''}>
          {format(date, "MMM dd")}
        </span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Task Board</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          <ViewSwitcher currentView="board" />
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-8 w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate("/tasks/new")}>
            <Plus className="h-4 w-4 mr-1" /> New Task
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(columns).map(([status, column]) => (
            <div key={status} className="flex flex-col">
              <div className={`flex items-center gap-2 p-2 rounded-t-md ${column.color}`}>
                {column.icon}
                <h3 className="font-medium">{column.title}</h3>
                <Badge variant="outline" className="ml-auto">
                  {column.tasks.length}
                </Badge>
              </div>
              
              <Droppable droppableId={status}>
                {(provided: DroppableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 bg-gray-50 p-2 rounded-b-md min-h-[70vh] overflow-y-auto"
                  >
                    {column.tasks.length > 0 ? (
                      column.tasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided: DraggableProvided) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => navigate(`/tasks/${task._id}`)}
                            >
                              <CardHeader className="p-3 pb-0">
                                <div className="flex justify-between">
                                  <Badge className={getPriorityColor(task.priority)}>
                                    {task.priority}
                                  </Badge>
                                  {task.category && (
                                    <Badge variant="outline">{task.category}</Badge>
                                  )}
                                </div>
                                <CardTitle className="text-base mt-2 line-clamp-2">
                                  {task.title}
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="p-3 pt-1">
                                {task.description && (
                                  <CardDescription className="line-clamp-2 mt-1">
                                    {task.description}
                                  </CardDescription>
                                )}
                                <div className="flex justify-between items-center mt-3">
                                  <div className="flex -space-x-2">
                                    {task.assignedTo.slice(0, 3).map((user, i) => (
                                      <div 
                                        key={user._id} 
                                        className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium border-2 border-white"
                                        title={user.username}
                                      >
                                        {user.username.charAt(0).toUpperCase()}
                                      </div>
                                    ))}
                                    {task.assignedTo.length > 3 && (
                                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
                                        +{task.assignedTo.length - 3}
                                      </div>
                                    )}
                                  </div>
                                  {task.dueDate && formatDueDate(task.dueDate)}
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No tasks
                      </div>
                    )}
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

export default TaskBoard; 