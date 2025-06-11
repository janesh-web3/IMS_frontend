import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from "@hello-pangea/dnd";
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
import { Task } from "@/services/taskService";
import { format } from "date-fns";
import { 
  CheckCircle, 
  Clock, 
  PauseCircle, 
  XCircle,
  Plus,
  Calendar,
  Search,
  ChevronDown,
  Edit,
  GripVertical,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ViewSwitcher from "./ViewSwitcher";
import { useAdminContext } from "@/context/adminContext";
import { useTaskContext } from "@/context/taskContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

const TaskBoard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { adminDetails } = useAdminContext();
  const { 
    loading, 
    boardData, 
    fetchBoardData, 
    updateTaskStatus,
    updateTaskPriority 
  } = useTaskContext();
  
  // Check if user is admin or superadmin
  const isAdmin = adminDetails?.role === "admin" || adminDetails?.role === "superadmin";

  // Fetch tasks with filters and add retry logic - only once on mount
  useEffect(() => {
    console.log("Fetching board data...");
    
    // Use a ref to track if component is mounted
    const isMounted = { current: true };
    
    const fetchData = async () => {
      if (!boardData) { // Only fetch if we don't have data yet
        try {
          await fetchBoardData();
        } catch (error) {
          console.error("Error in initial board data fetch:", error);
          
          // Retry after 3 seconds if still mounted
          const retryTimeout = setTimeout(async () => {
            if (isMounted.current) {
              console.log("Retrying board data fetch...");
              try {
                await fetchBoardData();
              } catch (retryError) {
                console.error("Error in retry board data fetch:", retryError);
              }
            }
          }, 3000);
          
          return () => {
            clearTimeout(retryTimeout);
          };
        }
      }
    };
    
    fetchData();
    
    // Cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Handle manual refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchBoardData();
      toast({
        title: "Board Refreshed",
        description: "The board data has been updated",
      });
    } catch (error) {
      console.error("Failed to refresh board:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to refresh board data"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Get filtered tasks based on search term
  const getFilteredTasks = () => {
    if (!boardData) return {};
    
    if (!searchTerm) return boardData;
    
    const filteredData: Record<string, Task[]> = {};
    
    Object.entries(boardData).forEach(([status, tasks]) => {
      filteredData[status] = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });
    
    return filteredData;
  };

  // Handle drag and drop
  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside the list or no change
    if (!destination || 
        (source.droppableId === destination.droppableId && 
         source.index === destination.index)) {
      return;
    }
    
    console.log("Drag end:", { source, destination, draggableId });
    
    // If dropped in a different column
    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId;
      const oldStatus = source.droppableId;
      
      try {
        // Update task status in backend and context
        // The updateTaskStatus function now handles optimistic UI updates
        await updateTaskStatus(draggableId, newStatus);
      } catch (error) {
        console.error("Failed to update task status:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: `Failed to move task to ${newStatus}. The task will remain in ${oldStatus}.`,
        });
      }
    }
  };
  
  // Handle priority change
  const handlePriorityChange = async (taskId: string, priority: "Low" | "Medium" | "High" | "Urgent") => {
    try {
      // Update task priority in backend and context
      await updateTaskPriority(taskId, priority);
    } catch (error) {
      console.error("Failed to update task priority:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task priority"
      });
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

  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2 mt-4 md:mt-0">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col">
              <Skeleton className="h-10 rounded-t-md" />
              <Skeleton className="flex-1 h-[70vh] rounded-b-md" />
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render error state
  const renderError = () => {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Task Board</h1>
          <div className="flex gap-2 mt-4 md:mt-0">
            <ViewSwitcher currentView="board" />
            <Button onClick={() => navigate("/tasks/new")}>
              <Plus className="h-4 w-4 mr-1" /> New Task
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Failed to load board</h2>
              <p className="text-gray-500 mt-2 mb-4">
                There was an error loading the board data.
              </p>
              <Button 
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Refreshing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh Board
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render empty board
  const renderEmptyBoard = () => {
    const filteredTasks = getFilteredTasks();
    const isEmpty = Object.values(filteredTasks).every(tasks => tasks.length === 0);
    
    if (!isEmpty) return null;
    
    return (
      <Card className="mt-4">
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="text-center">
            <h2 className="text-xl font-bold">No tasks found</h2>
            {searchTerm ? (
              <p className="text-gray-500 mt-2">
                No tasks match your search term "{searchTerm}"
              </p>
            ) : (
              <p className="text-gray-500 mt-2">
                There are no tasks to display. Create a new task to get started.
              </p>
            )}
            <div className="mt-4 flex gap-2 justify-center">
              {searchTerm && (
                <Button 
                  variant="outline"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
              )}
              <Button onClick={() => navigate("/tasks/new")}>
                <Plus className="h-4 w-4 mr-1" /> New Task
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return renderSkeleton();
  }

  if (!boardData) {
    return renderError();
  }
  
  const filteredTasks = getFilteredTasks();
  console.log("Board data:", boardData);
  console.log("Filtered tasks:", filteredTasks);
  
  // Define columns with their properties
  const columns = {
    "Pending": {
      title: "Pending",
      icon: <Clock className="h-5 w-5 text-gray-500" />,
      color: "bg-gray-100",
      tasks: filteredTasks["Pending"] || []
    },
    "In Progress": {
      title: "In Progress",
      icon: <Clock className="h-5 w-5 text-blue-500" />,
      color: "bg-blue-100",
      tasks: filteredTasks["In Progress"] || []
    },
    "On Hold": {
      title: "On Hold",
      icon: <PauseCircle className="h-5 w-5 text-yellow-500" />,
      color: "bg-yellow-100",
      tasks: filteredTasks["On Hold"] || []
    },
    "Completed": {
      title: "Completed",
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      color: "bg-green-100",
      tasks: filteredTasks["Completed"] || []
    },
    "Cancelled": {
      title: "Cancelled",
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      color: "bg-red-100",
      tasks: filteredTasks["Cancelled"] || []
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Task Board</h1>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh board"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
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

      {renderEmptyBoard()}

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
                {(provided: DroppableProvided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 rounded-b-md min-h-[70vh] overflow-y-auto transition-colors ${
                      snapshot.isDraggingOver ? "bg-gray-100" : "bg-gray-50"
                    }`}
                  >
                    {column.tasks.length > 0 ? (
                      column.tasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided: DraggableProvided, snapshot) => (
                            <Card
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`mb-2 cursor-pointer hover:shadow-md transition-all group ${
                                snapshot.isDragging ? "shadow-lg ring-2 ring-primary ring-opacity-50" : ""
                              }`}
                            >
                              <CardHeader className="p-3 pb-0 relative">
                                <div 
                                  {...provided.dragHandleProps}
                                  className="absolute left-1 top-2 opacity-30 hover:opacity-100 cursor-grab active:cursor-grabbing"
                                >
                                  <GripVertical className="h-4 w-4" />
                                </div>
                                <div className="flex justify-between pl-5">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Badge className={`${getPriorityColor(task.priority)} cursor-pointer`}>
                                        {task.priority} <ChevronDown className="h-3 w-3 ml-1" />
                                      </Badge>
                                    </DropdownMenuTrigger>
                                    {(isAdmin || task.createdBy._id === adminDetails._id) && (
                                      <DropdownMenuContent>
                                        <DropdownMenuItem onClick={() => handlePriorityChange(task._id, "Low")}>
                                          Low
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePriorityChange(task._id, "Medium")}>
                                          Medium
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePriorityChange(task._id, "High")}>
                                          High
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handlePriorityChange(task._id, "Urgent")}>
                                          Urgent
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    )}
                                  </DropdownMenu>
                                  {task.category && (
                                    <Badge variant="outline">{task.category}</Badge>
                                  )}
                                </div>
                                <CardTitle 
                                  className="text-base mt-2 line-clamp-2 pl-5"
                                  onClick={() => navigate(`/tasks/${task._id}`)}
                                >
                                  {task.title}
                                </CardTitle>
                                {(isAdmin || task.createdBy._id === adminDetails._id) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="absolute top-2 right-2 p-1 h-auto opacity-0 group-hover:opacity-100"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigate(`/tasks/${task._id}/edit`);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                )}
                              </CardHeader>
                              <CardContent 
                                className="p-3 pt-1"
                                onClick={() => navigate(`/tasks/${task._id}`)}
                              >
                                {task.description && (
                                  <CardDescription className="line-clamp-2 mt-1">
                                    {task.description}
                                  </CardDescription>
                                )}
                                <div className="flex justify-between items-center mt-3">
                                  <div className="flex -space-x-2">
                                    {task.assignedTo.slice(0, 3).map((user) => (
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