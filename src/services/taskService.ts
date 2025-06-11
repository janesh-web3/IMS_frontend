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
    date?: Date;
    tag?: string;
    assignedTo?: string;
  }[];
  isRecurring?: boolean;
  recurringPattern?: {
    frequency: "Daily" | "Weekly" | "Monthly" | "Custom";
    interval: number;
    endDate?: Date;
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
  
  // Get all tasks with role-based filtering
  async getTasks(filters: TaskFilter = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, String(value));
      });
      
      const queryString = queryParams.toString();
      const url = queryString ? `/tasks?${queryString}` : '/tasks';
      
      // The backend will handle role-based filtering
      const response = await crudRequest<Task[]>('GET', url);
      return response || [];
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }
  
  // Cache for dashboard and board data
  private dashboardCache: any = null;
  private boardCache: any = null;
  
  // Get tasks for dashboard view with improved error handling
  async getTasksForDashboard() {
    try {
      // First check if we have cached data
      if (this.dashboardCache) {
        console.log("Using cached dashboard data while fetching fresh data");
        
        // Start fetching fresh data in the background without awaiting it
        this.fetchDashboardDataInBackground();
        
        // Return cached data immediately
        return this.dashboardCache;
      }
      
      // If no cache, fetch data synchronously
      return await this.fetchDashboardDataFresh();
    } catch (error) {
      console.error("Error fetching dashboard tasks:", error);
      
      // Return cached data if available
      if (this.dashboardCache) {
        console.log("Returning cached dashboard data after error");
        return this.dashboardCache;
      }
      
      // Create empty data structure if nothing else is available
      return {
        summary: {
          statusCounts: {},
          priorityCounts: {},
          overdueTasks: 0,
          dueTodayTasks: 0,
          dueThisWeekTasks: 0,
          recentTasks: []
        },
        pendingTasks: [],
        inProgressTasks: [],
        completedTasks: []
      };
    }
  }
  
  // Helper method to fetch dashboard data in background
  private async fetchDashboardDataInBackground() {
    try {
      await this.fetchDashboardDataFresh();
    } catch (error) {
      console.error("Background dashboard data fetch failed:", error);
    }
  }
  
  // Helper method to fetch fresh dashboard data
  private async fetchDashboardDataFresh() {
    try {
      // Get task summary for dashboard
      const summary = await this.getTaskSummary();
      
      // Get tasks for different statuses - use Promise.allSettled to handle partial failures
      const [pendingResult, inProgressResult, completedResult] = await Promise.allSettled([
        this.getTasks({ status: 'Pending' }),
        this.getTasks({ status: 'In Progress' }),
        this.getTasks({ status: 'Completed' })
      ]);
      
      // Extract values or use empty arrays for failed promises
      const pendingTasks = pendingResult.status === 'fulfilled' ? pendingResult.value : [];
      const inProgressTasks = inProgressResult.status === 'fulfilled' ? inProgressResult.value : [];
      const completedTasks = completedResult.status === 'fulfilled' ? completedResult.value : [];
      
      // Create new dashboard data
      const dashboardData = {
        summary,
        pendingTasks,
        inProgressTasks,
        completedTasks
      };
      
      // Update cache
      this.dashboardCache = dashboardData;
      
      return dashboardData;
    } catch (error) {
      console.error("Error fetching fresh dashboard data:", error);
      throw error;
    }
  }
  
  // Get tasks for board view with improved error handling
  async getTasksForBoard() {
    try {
      // First check if we have cached data
      if (this.boardCache) {
        console.log("Using cached board data while fetching fresh data");
        
        // Start fetching fresh data in the background without awaiting it
        this.fetchBoardDataInBackground();
        
        // Return cached data immediately
        return this.boardCache;
      }
      
      // If no cache, fetch data synchronously
      return await this.fetchBoardDataFresh();
    } catch (error) {
      console.error("Error fetching board tasks:", error);
      
      // Return cached data if available
      if (this.boardCache) {
        console.log("Returning cached board data after error");
        return this.boardCache;
      }
      
      // Create empty data structure if nothing else is available
      return {
        Pending: [],
        'In Progress': [],
        'On Hold': [],
        Completed: [],
        Cancelled: []
      };
    }
  }
  
  // Helper method to fetch board data in background
  private async fetchBoardDataInBackground() {
    try {
      await this.fetchBoardDataFresh();
    } catch (error) {
      console.error("Background board data fetch failed:", error);
    }
  }
  
  // Helper method to fetch fresh board data
  private async fetchBoardDataFresh() {
    try {
      const allTasks = await this.getTasks();
      
      // Group tasks by status
      const tasksByStatus = {
        Pending: allTasks.filter(task => task.status === 'Pending'),
        'In Progress': allTasks.filter(task => task.status === 'In Progress'),
        'On Hold': allTasks.filter(task => task.status === 'On Hold'),
        Completed: allTasks.filter(task => task.status === 'Completed'),
        Cancelled: allTasks.filter(task => task.status === 'Cancelled')
      };
      
      // Update cache
      this.boardCache = tasksByStatus;
      
      return tasksByStatus;
    } catch (error) {
      console.error("Error fetching fresh board data:", error);
      throw error;
    }
  }
  
  // Create new task
  async createTask(taskData: TaskFormData) {
    try {
      console.log("Creating task with data:", JSON.stringify(taskData, null, 2));
      
      // Ensure assignedTo is valid
      if (Array.isArray(taskData.assignedTo)) {
        // Filter out invalid IDs - MongoDB ObjectIDs are 24 hex characters
        taskData.assignedTo = taskData.assignedTo.filter(id => 
          id && 
          typeof id === 'string' && 
          id !== 'none' && 
          /^[0-9a-fA-F]{24}$/.test(id)
        );
      }
      
      // Handle recurring pattern
      if (!taskData.isRecurring) {
        // If not recurring, completely remove the recurringPattern field
        delete taskData.recurringPattern;
      } else if (taskData.isRecurring && taskData.recurringPattern) {
        // Ensure valid values for recurring pattern
        taskData.recurringPattern = {
          frequency: taskData.recurringPattern.frequency || "Daily",
          interval: Number(taskData.recurringPattern.interval) || 1,
          endDate: taskData.recurringPattern.endDate
        };
      } else if (taskData.isRecurring) {
        // If recurring but no pattern, create a default one
        taskData.recurringPattern = {
          frequency: "Daily",
          interval: 1,
          endDate: undefined
        };
      }
      
      console.log("Sanitized task data:", JSON.stringify(taskData, null, 2));
      
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