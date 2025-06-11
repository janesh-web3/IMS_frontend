import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TaskList from "./TaskList";
import TaskDetail from "./TaskDetail";
import TaskForm from "./TaskForm";
import TaskDashboard from "./TaskDashboard";
import TaskBoard from "./TaskBoard";
import { Task, taskService } from "@/services/taskService";

interface User {
  _id: string;
  username: string;
  role: string;
}

const TasksModule: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // This would be replaced with an actual API call to get users
        // For now, using mock data
        setUsers([
          { _id: "1", username: "admin", role: "admin" },
          { _id: "2", username: "teacher1", role: "teacher" },
          { _id: "3", username: "staff1", role: "staff" },
        ]);
        
        // Fetch tasks for dependencies
        const tasks = await taskService.getTasks();
        setRelatedTasks(tasks);
        
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<TaskList />} />
      <Route path="/dashboard" element={<TaskDashboard />} />
      <Route path="/board" element={<TaskBoard />} />
      <Route path="/new" element={<TaskForm users={users} relatedTasks={relatedTasks} />} />
      <Route path="/:id" element={<TaskDetail />} />
      <Route path="/:id/edit" element={<TaskForm users={users} relatedTasks={relatedTasks} />} />
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  );
};

export default TasksModule; 