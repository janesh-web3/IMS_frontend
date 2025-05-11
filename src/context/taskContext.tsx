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
  addTaskActivity: (taskId: string, activity: string, type?: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  notifications: TaskNotification[];
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
  
  const { adminDetails } = useAdminContext();

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
    try {
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
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await taskService.updateTask(taskId, { status: status as any });
      
      // Also emit via socket for real-time updates
      if (socket) {
        socket.emit('task-status-update', { taskId, status });
      }
      
      // Update local state
      setTasks(prev => 
        prev.map(task => 
          task._id === taskId ? { ...task, status: status as any } : task
        )
      );
      
      toast({
        title: "Success",
        description: `Task status updated to ${status}`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update task status",
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

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        updateTaskStatus,
        addTaskActivity,
        deleteTask,
        notifications,
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
