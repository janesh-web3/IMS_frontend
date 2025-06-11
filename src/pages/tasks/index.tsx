import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TaskList from "./TaskList";
import TaskDetail from "./TaskDetail";
import TaskForm from "./TaskForm";
import TaskDashboard from "./TaskDashboard";
import TaskBoard from "./TaskBoard";
import { Task, taskService } from "@/services/taskService";
import { useAdminContext } from "@/context/adminContext";

const TasksModule: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const { adminDetails } = useAdminContext();
  
  useEffect(() => {
    // Fetch users for task assignment
    const fetchUsers = async () => {
      try {
        // In a real application, you would fetch users from an API
        // For now, we'll use dummy data
        setUsers([
          { _id: "1", username: "admin", role: "admin" },
          { _id: "2", username: "teacher1", role: "teacher" },
          { _id: "3", username: "staff1", role: "staff" },
          // Add the current user if not already in the list
          ...(adminDetails && !users.some(u => u._id === adminDetails._id) 
            ? [{ _id: adminDetails._id, username: adminDetails.username, role: adminDetails.role }] 
            : [])
        ]);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    // Fetch related tasks for dependencies
    const fetchRelatedTasks = async () => {
      try {
        const tasks = await taskService.getTasks();
        setRelatedTasks(tasks);
      } catch (error) {
        console.error("Failed to fetch related tasks:", error);
      }
    };

    fetchUsers();
    fetchRelatedTasks();
  }, [adminDetails]);

  return (
    <Routes>
      <Route path="/" element={<TaskList />} />
      <Route path="/dashboard" element={<TaskDashboard />} />
      <Route path="/board" element={<TaskBoard />} />
      <Route path="/new" element={<TaskForm users={users} relatedTasks={relatedTasks} />} />
      <Route path="/:id" element={<TaskDetail />} />
      <Route path="/:id/edit" element={<TaskForm users={users} relatedTasks={relatedTasks} />} />
      <Route path="*" element={<Navigate to="/tasks" />} />
    </Routes>
  );
};

export default TasksModule; 