import { crudRequest } from "@/lib/api";
import { socketBaseUrl } from "@/server";
import { io } from "socket.io-client";

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: "Pending" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  priority: "Low" | "Medium" | "High" | "Urgent";
  category: "Administrative" | "Academic" | "Technical" | "Financial" | "Maintenance" | "Event" | "Other";
  dueDate: string;
  assignedTo: {
    _id: string;
    username: string;
    role: string;
  }[];
  assignedTeam?: string;
  delegatedBy?: {
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
  comments: {
    _id: string;
    text: string;
    createdBy: {
      _id: string;
      username: string;
      role: string;
    };
    createdAt: string;
  }[];
  attachments: {
    _id: string;
    filename: string;
    originalname: string;
    mimetype: string;
    path: string;
    size: number;
    uploadedBy: {
      _id: string;
      username: string;
      role: string;
    };
    uploadedAt: string;
  }[];
  subTasks: {
    _id: string;
    title: string;
    date: string;
    tag: string;
    completed: boolean;
    assignedTo?: {
      _id: string;
      username: string;
      role: string;
    };
  }[];
  isRecurring: boolean;
  recurringPattern?: {
    frequency: "Daily" | "Weekly" | "Monthly" | "Custom";
    interval: number;
    endDate: string;
  };
  dependencies: {
    taskId: {
      _id: string;
      title: string;
      status: string;
    };
    type: "Blocks" | "Blocked by" | "Related to";
  }[];
  createdAt: string;
  updatedAt: string;
  assets?: any[];
}

export interface TaskFormData {
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Pending" | "In Progress" | "Completed" | "On Hold" | "Cancelled";
  category?: "Administrative" | "Academic" | "Technical" | "Financial" | "Maintenance" | "Event" | "Other";
  dueDate: Date;
  assignedTo: string | string[];
  assignedTeam?: string;
  subTasks?: {
    title: string;
    date: string;
    tag: string;
    assignedTo?: string;
  }[];
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: "Daily" | "Weekly" | "Monthly" | "Custom";
    interval: number;
    endDate: Date;
  };
  dependencies?: {
    taskId: string;
    type: "Blocks" | "Blocked by" | "Related to";
  }[];
}

export interface TaskFilter {
  assignedTo?: string;
  createdBy?: string;
  status?: string;
  priority?: string;
  category?: string;
  dueDate?: string;
  search?: string;
  isRecurring?: boolean;
}

export interface TaskSummary {
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  overdueTasks: number;
  dueTodayTasks: number;
  dueThisWeekTasks: number;
  recentTasks: Task[];
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
  async getTasks(filters: TaskFilter = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });
      
      const queryString = queryParams.toString();
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
  
  // Add comment to task
  async addComment(id: string, text: string) {
    try {
      const response = await crudRequest<{success: boolean, comment: any}>(
        'POST',
        `/tasks/${id}/comment`,
        { text }
      );
      return response.comment;
    } catch (error) {
      console.error(`Error adding comment to task ${id}:`, error);
      throw error;
    }
  }
  
  // Upload attachment to task
  async uploadAttachment(id: string, file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`/api/tasks/${id}/attachment`, {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type here, browser will set it with boundary
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file');
      }
      
      const data = await response.json();
      return data.attachment;
    } catch (error) {
      console.error(`Error uploading attachment to task ${id}:`, error);
      throw error;
    }
  }
  
  // Delete attachment
  async deleteAttachment(taskId: string, attachmentId: string) {
    try {
      await crudRequest<{success: boolean}>(
        'DELETE',
        `/tasks/${taskId}/attachment/${attachmentId}`
      );
      return true;
    } catch (error) {
      console.error(`Error deleting attachment ${attachmentId}:`, error);
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
  
  // Delegate task
  async delegateTask(taskId: string, assignedTo: string | string[]) {
    try {
      const response = await crudRequest<{success: boolean, task: Task}>(
        'POST', 
        '/tasks/delegate', 
        { taskId, assignedTo }
      );
      return response.task;
    } catch (error) {
      console.error(`Error delegating task ${taskId}:`, error);
      throw error;
    }
  }
  
  // Get task dashboard summary
  async getTaskSummary() {
    try {
      const response = await crudRequest<{success: boolean, summary: TaskSummary}>(
        'GET',
        '/tasks/dashboard/summary'
      );
      return response.summary;
    } catch (error) {
      console.error('Error fetching task summary:', error);
      throw error;
    }
  }
  
  // Update subtask status
  async updateSubtask(taskId: string, subtaskId: string, completed: boolean) {
    try {
      const response = await crudRequest<{success: boolean, subtask: any}>(
        'PUT',
        `/tasks/${taskId}/subtask/${subtaskId}`,
        { completed }
      );
      return response.subtask;
    } catch (error) {
      console.error(`Error updating subtask ${subtaskId}:`, error);
      throw error;
    }
  }
}

export const taskService = new TaskService();