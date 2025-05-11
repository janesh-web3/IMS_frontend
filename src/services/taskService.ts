import { crudRequest } from "@/lib/api";
import { socketBaseUrl } from "@/server";
import { io } from "socket.io-client";

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
  dueDate: string;
  assignedTo: {
    _id: string;
    username: string;
    role: string;
  };
  createdBy: {
    _id: string;
    username: string;
    role: string;
  };
  activities: {
    _id: string;
    type: string;
    activity: string;
    date: string;
    by: {
      _id: string;
      username: string;
    }
  }[];
  subTasks: {
    _id: string;
    title: string;
    date: string;
    tag: string;
    completed: boolean;
  }[];
  createdAt: string;
  updatedAt: string;
  assets?: any[];
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Completed";
  dueDate: Date;
  assignedTo: string;
  subTasks?: {
    title: string;
    date: string;
    tag: string;
  }[];
}

class TaskService {
  private socket: any = null;
  
  // Initialize socket connection
  initSocket(token: string) {
    if (!token) return;
    
    this.socket = io(socketBaseUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
    });
    
    this.socket.on("connect", () => {
      console.log("Task socket connected");
    });
    
    return this.socket;
  }
  
  // Get all tasks
  async getTasks(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });
      
      const queryString = new URLSearchParams(filters as any).toString();
      const url = queryString ? `/tasks?${queryString}` : '/tasks';
      const response = await crudRequest<Task[]>('GET', url);
      return response || [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }
  
  // Create new task
  async createTask(taskData: TaskFormData) {
    try {
      const response = await crudRequest<{success: boolean, task: Task}>('POST', '/tasks', taskData);
      return response.task;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }
  
  // Get task by id
  async getTaskById(id: string) {
    try {
      const response = await crudRequest<{success: boolean, task: Task}>('GET', `/tasks/${id}`);
      return response.task;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      throw error;
    }
  }
  
  // Update task
  async updateTask(id: string, taskData: Partial<TaskFormData>) {
    try {
      const response = await crudRequest<{success: boolean, task: Task}>('PUT', `/tasks/${id}`, taskData);
      return response.task;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  }
  
  // Add task activity
  async addTaskActivity(id: string, activity: string, type: string) {
    try {
      const response = await crudRequest<{success: boolean, activity: any}>(
        'POST', 
        `/tasks/${id}/activity`, 
        { activity, type }
      );
      return response.activity;
    } catch (error) {
      console.error(`Error adding activity to task ${id}:`, error);
      throw error;
    }
  }
  
  // Delete task
  async deleteTask(id: string) {
    try {
      await crudRequest<{success: boolean}>('DELETE', `/tasks/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }
  
  // Update task status via socket
  updateTaskStatusSocket(taskId: string, status: string) {
    if (!this.socket) return;
    
    this.socket.emit('task-status-update', { taskId, status });
  }
}

export const taskService = new TaskService();