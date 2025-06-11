import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskSummary, taskService } from "@/services/taskService";
import { format } from "date-fns";
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  PauseCircle, 
  XCircle,
  PieChart,
  BarChart3,
  Calendar,
  ListTodo,
  Plus
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ViewSwitcher from "./ViewSwitcher";

const TaskDashboard: React.FC = () => {
  const [summary, setSummary] = useState<TaskSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const data = await taskService.getTaskSummary();
        setSummary(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch task summary:", error);
        toast({
          title: "Error",
          description: "Failed to load task summary data",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Calculate total tasks
  const getTotalTasks = () => {
    if (!summary) return 0;
    
    return Object.values(summary.statusCounts).reduce(
      (total, count) => total + count,
      0
    );
  };

  // Get percentage for a specific status
  const getStatusPercentage = (status: string) => {
    if (!summary || !summary.statusCounts[status]) return 0;
    
    const total = getTotalTasks();
    if (total === 0) return 0;
    
    return Math.round((summary.statusCounts[status] / total) * 100);
  };

  // Get percentage for a specific priority
  const getPriorityPercentage = (priority: string) => {
    if (!summary || !summary.priorityCounts[priority]) return 0;
    
    const total = getTotalTasks();
    if (total === 0) return 0;
    
    return Math.round((summary.priorityCounts[priority] / total) * 100);
  };

  // Get color for status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "On Hold":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get icon for status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "In Progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "On Hold":
        return <PauseCircle className="h-5 w-5 text-yellow-500" />;
      case "Cancelled":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
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
        <h1 className="text-3xl font-bold">Task Dashboard</h1>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <ViewSwitcher currentView="dashboard" />
          <Button onClick={() => navigate("/tasks/new")}>
            <Plus className="h-4 w-4 mr-1" /> New Task
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Tasks</p>
                <h3 className="text-3xl font-bold">{getTotalTasks()}</h3>
              </div>
              <ListTodo className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Overdue</p>
                <h3 className="text-3xl font-bold text-red-500">
                  {summary?.overdueTasks || 0}
                </h3>
              </div>
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Due Today</p>
                <h3 className="text-3xl font-bold text-yellow-500">
                  {summary?.dueTodayTasks || 0}
                </h3>
              </div>
              <Calendar className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Due This Week</p>
                <h3 className="text-3xl font-bold text-blue-500">
                  {summary?.dueThisWeekTasks || 0}
                </h3>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Task Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary && Object.entries(summary.statusCounts).map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span>{status}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {count} ({getStatusPercentage(status)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${status === "Completed" ? "bg-green-500" : 
                        status === "In Progress" ? "bg-blue-500" : 
                        status === "On Hold" ? "bg-yellow-500" : 
                        status === "Cancelled" ? "bg-red-500" : "bg-gray-500"}`}
                      style={{ width: `${getStatusPercentage(status)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Task Priority Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary && ["Urgent", "High", "Medium", "Low"].map((priority) => (
                <div key={priority}>
                  <div className="flex justify-between items-center mb-1">
                    <span>{priority}</span>
                    <span className="text-sm font-medium">
                      {summary.priorityCounts[priority] || 0} ({getPriorityPercentage(priority)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        priority === "Urgent" ? "bg-red-500" : 
                        priority === "High" ? "bg-orange-500" : 
                        priority === "Medium" ? "bg-yellow-500" : "bg-blue-500"
                      }`}
                      style={{ width: `${getPriorityPercentage(priority)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
          <CardDescription>
            Your most recently created tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary && summary.recentTasks.length > 0 ? (
                summary.recentTasks.map((task) => (
                  <TableRow key={task._id}>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          task.priority === "Urgent" ? "bg-red-100 text-red-800" : 
                          task.priority === "High" ? "bg-orange-100 text-orange-800" : 
                          task.priority === "Medium" ? "bg-yellow-100 text-yellow-800" : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {task.dueDate
                        ? format(new Date(task.dueDate), "MMM dd, yyyy")
                        : "No due date"}
                    </TableCell>
                    <TableCell>
                      {task.assignedTo.map((user) => user.username).join(", ")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/tasks/${task._id}`)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No recent tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-center">
            <Button
              variant="outline"
              onClick={() => navigate("/tasks")}
            >
              View All Tasks
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDashboard; 