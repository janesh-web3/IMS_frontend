import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, taskService } from '@/services/taskService';
import { useAdminContext } from './adminContext';
import { socketBaseUrl } from '@/server';
import { io } from 'socket.io-client';
import { toast } from '@/components/ui/use-toast';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (filters?: any) => Promise<void>;
  updateTaskStatus: (taskId: string, status: string) => Promise<void>;
  updateTaskPriority: (taskId: string, priority: string) => Promise<void>;
  addTaskActivity: (taskId: string, activity: string, type?: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  delegateTask: (taskId: string, assignedTo: string | string[]) => Promise<void>;
  notifications: TaskNotification[];
  dashboardData: {
    summary: any;
    pendingTasks: Task[];
    inProgressTasks: Task[];
    completedTasks: Task[];
  } | null;
  boardData: {
    [key: string]: Task[];
  } | null;
  fetchDashboardData: () => Promise<void>;
  fetchBoardData: () => Promise<void>;
}

interface TaskNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  date: Date;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [notifications, setNotifications] = useState<TaskNotification[]>([]);
  const [dashboardData, setDashboardData] = useState<TaskContextType['dashboardData']>(null);
  const [boardData, setBoardData] = useState<TaskContextType['boardData']>(null);
  
  const { adminDetails } = useAdminContext();

  // Add these fetch state flags
  const [isFetchingTasks, setIsFetchingTasks] = useState<boolean>(false);
  const [isFetchingDashboard, setIsFetchingDashboard] = useState<boolean>(false);
  const [isFetchingBoard, setIsFetchingBoard] = useState<boolean>(false);
  const [dataInitialized, setDataInitialized] = useState<boolean>(false);

  // Initialize socket
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) return;

    const newSocket = io(socketBaseUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Task socket connected");
    });

    newSocket.on("new-task", (data) => {
      toast({
        title: "New Task Assigned",
        description: `${data.from} assigned you a new task: ${data.title}`,
      });
      
      setNotifications(prev => [
        {
          id: data.taskId,
          title: "New Task",
          message: `${data.from} assigned you a task: ${data.title}`,
          read: false,
          date: new Date()
        },
        ...prev
      ]);
      
      // Refresh task list
      fetchTasks();
    });

    newSocket.on("task-updated", (data) => {
      toast({
        title: "Task Updated",
        description: `Task status updated to ${data.status} by ${data.updatedBy}`,
      });
      
      // Refresh task list
      fetchTasks();
    });

    newSocket.on("task-activity", (data) => {
      toast({
        title: `New ${data.activity.type} on Task`,
        description: `${data.activity.by}: ${data.activity.message}`,
      });
      
      // Refresh tasks to get the latest activities
      fetchTasks();
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [adminDetails._id]);

  const fetchTasks = async (filters = {}) => {
    // Prevent multiple simultaneous fetches
    if (isFetchingTasks) return;
    
    try {
      setIsFetchingTasks(true);
      setLoading(true);
      const fetchedTasks = await taskService.getTasks(filters);
      setTasks(fetchedTasks);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || 'Failed to fetch tasks');
      toast({
        variant: "destructive",
        title: "Error fetching tasks",
        description: err.message || "Failed to load tasks"
      });
    } finally {
      setLoading(false);
      setIsFetchingTasks(false);
    }
  };
  
  const fetchDashboardData = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingDashboard) return;
    
    try {
      setIsFetchingDashboard(true);
      setLoading(true);
      const data = await taskService.getTasksForDashboard();
      if (data) {
        setDashboardData(data);
        setError(null);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message || 'Failed to fetch dashboard data');
      toast({
        variant: "destructive",
        title: "Error fetching dashboard data",
        description: err.message || "Failed to load dashboard data"
      });
    } finally {
      setLoading(false);
      setIsFetchingDashboard(false);
    }
  };
  
  const fetchBoardData = async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingBoard) return;
    
    try {
      setIsFetchingBoard(true);
      setLoading(true);
      const data = await taskService.getTasksForBoard();
      if (data) {
        setBoardData(data);
        setError(null);
      }
    } catch (err: any) {
      console.error("Error fetching board data:", err);
      setError(err.message || 'Failed to fetch board data');
      toast({
        variant: "destructive",
        title: "Error fetching board data",
        description: err.message || "Failed to load board data"
      });
    } finally {
      setLoading(false);
      setIsFetchingBoard(false);
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      console.log(`Updating task ${taskId} status to ${status}`);
      
      // First update local state immediately for better UX
      if (boardData) {
        // Find the task in the current status column
        let taskToUpdate: Task | undefined;
        const updatedBoardData = { ...boardData };
        
        // Remove the task from its current status column
        Object.keys(updatedBoardData).forEach(key => {
          const taskIndex = updatedBoardData[key].findIndex(t => t._id === taskId);
          if (taskIndex !== -1) {
            taskToUpdate = { ...updatedBoardData[key][taskIndex], status: status as any };
            updatedBoardData[key] = updatedBoardData[key].filter(t => t._id !== taskId);
          }
        });
        
        // Add the task to its new status column
        if (taskToUpdate) {
          if (!updatedBoardData[status]) {
            updatedBoardData[status] = [];
          }
          updatedBoardData[status] = [...updatedBoardData[status], taskToUpdate];
        }
        
        // Update board data immediately
        setBoardData(updatedBoardData);
      }
      
      // Update tasks list state
      setTasks(prev => 
        prev.map(task => 
          task._id === taskId ? { ...task, status: status as any } : task
        )
      );
      
      // Then send to the backend
      await taskService.updateTask(taskId, { status: status as any });
      
      // Also emit via socket for real-time updates
      if (socket) {
        socket.emit('task-status-update', { taskId, status });
      }
      
      toast({
        title: "Success",
        description: `Task status updated to ${status}`,
      });
    } catch (err: any) {
      console.error("Failed to update task status:", err);
      
      // If API call fails, we need to revert the UI changes
      // Refresh board data from the server
      fetchBoardData();
      
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update task status",
      });
    }
  };
  
  const updateTaskPriority = async (taskId: string, priority: string) => {
    try {
      await taskService.updateTask(taskId, { priority: priority as any });
      
      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task._id === taskId ? { ...task, priority: priority as any } : task
        )
      );
      
      // Update board data if available
      if (boardData) {
        const updatedBoardData = { ...boardData };
        
        Object.keys(updatedBoardData).forEach(key => {
          updatedBoardData[key] = updatedBoardData[key].map(task => 
            task._id === taskId ? { ...task, priority: priority as any } : task
          );
        });
        
        setBoardData(updatedBoardData);
      }
      
      toast({
        title: "Success",
        description: `Task priority updated to ${priority}`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update task priority",
      });
    }
  };

  const addTaskActivity = async (taskId: string, activity: string, type = "comment") => {
    try {
      await taskService.addTaskActivity(taskId, activity, type);
      
      // Emit socket event for real-time updates
      if (socket) {
        socket.emit('task-activity', { 
          taskId, 
          activity: {
            message: activity,
            type: type,
            by: adminDetails.username
          }
        });
      }
      
      // Refresh tasks to update activities
      fetchTasks();
      
      toast({
        title: "Success",
        description: `Activity added to task`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to add task activity",
      });
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
      
      // Update local state
      setTasks(prev => prev.filter(task => task._id !== taskId));
      
      // Update board data if available
      if (boardData) {
        const updatedBoardData = { ...boardData };
        
        Object.keys(updatedBoardData).forEach(key => {
          updatedBoardData[key] = updatedBoardData[key].filter(task => task._id !== taskId);
        });
        
        setBoardData(updatedBoardData);
      }
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete task",
      });
    }
  };

  const delegateTask = async (taskId: string, assignedTo: string | string[]) => {
    try {
      await taskService.delegateTask(taskId, assignedTo);
      
      // Refresh tasks to update assignees
      fetchTasks();
      
      toast({
        title: "Success",
        description: `Task delegated successfully`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delegate task",
      });
    }
  };
  
  useEffect(() => {
    if (!dataInitialized && adminDetails?._id) {
      console.log("Initializing task data...");
      fetchTasks();
      setDataInitialized(true);
    }
  }, [adminDetails, dataInitialized]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        updateTaskStatus,
        updateTaskPriority,
        addTaskActivity,
        deleteTask,
        delegateTask,
        notifications,
        dashboardData,
        boardData,
        fetchDashboardData,
        fetchBoardData,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};
