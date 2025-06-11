import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Task, TaskSummary, taskService } from "@/services/taskService";
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
  Plus,
  Edit,
  RefreshCw
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import ViewSwitcher from "./ViewSwitcher";
import { useAdminContext } from "@/context/adminContext";
import { useTaskContext } from "@/context/taskContext";
import { Skeleton } from "@/components/ui/skeleton";

const TaskDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { adminDetails } = useAdminContext();
  const { 
    loading, 
    dashboardData, 
    fetchDashboardData 
  } = useTaskContext();
  
  const [refreshing, setRefreshing] = useState(false);
  
  // Check if user is admin or superadmin
  const isAdmin = adminDetails?.role === "admin" || adminDetails?.role === "superadmin";

  // Fetch dashboard data on component mount with retry logic - only once
  useEffect(() => {
    console.log("Fetching dashboard data...");
    
    // Use a ref to track if component is mounted
    const isMounted = { current: true };
    
    const fetchData = async () => {
      if (!dashboardData) { // Only fetch if we don't have data yet
        try {
          await fetchDashboardData();
        } catch (error) {
          console.error("Error in initial dashboard data fetch:", error);
          
          // Retry after 3 seconds if still mounted
          const retryTimeout = setTimeout(async () => {
            if (isMounted.current) {
              console.log("Retrying dashboard data fetch...");
              try {
                await fetchDashboardData();
              } catch (retryError) {
                console.error("Error in retry dashboard data fetch:", retryError);
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
      await fetchDashboardData();
      toast({
        title: "Dashboard Refreshed",
        description: "The dashboard data has been updated",
      });
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate total tasks
  const getTotalTasks = () => {
    if (!dashboardData?.summary) return 0;
    
    return Object.values(dashboardData.summary.statusCounts as Record<string, number>).reduce(
      (total: number, count: number) => total + count,
      0
    );
  };

  // Get percentage for a specific status
  const getStatusPercentage = (status: string) => {
    if (!dashboardData?.summary || !dashboardData.summary.statusCounts[status]) return 0;
    
    const total = getTotalTasks();
    if (total === 0) return 0;
    
    return Math.round((dashboardData.summary.statusCounts[status] as number / total) * 100);
  };

  // Get percentage for a specific priority
  const getPriorityPercentage = (priority: string) => {
    if (!dashboardData?.summary || !dashboardData.summary.priorityCounts[priority]) return 0;
    
    const total = getTotalTasks();
    if (total === 0) return 0;
    
    return Math.round((dashboardData.summary.priorityCounts[priority] as number / total) * 100);
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

  // Render loading skeleton
  const renderSkeleton = () => {
    return (
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <Skeleton className="h-10 w-48" />
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Summary Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2.5 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2.5 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render error state
  const renderError = () => {
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
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Failed to load dashboard</h2>
              <p className="text-gray-500 mt-2 mb-4">
                There was an error loading the dashboard data.
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
                    Refresh Dashboard
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return renderSkeleton();
  }

  if (!dashboardData || !dashboardData.summary) {
    return renderError();
  }

  const summary = dashboardData.summary;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Task Dashboard</h1>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefresh}
            disabled={refreshing}
            title="Refresh dashboard"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
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
              {summary && Object.entries(summary.statusCounts as Record<string, number>).length > 0 ? (
                Object.entries(summary.statusCounts as Record<string, number>).map(([status, count]) => (
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No status data available
                </div>
              )}
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
              {summary && Object.entries(summary.priorityCounts as Record<string, number>).length > 0 ? (
                ["Urgent", "High", "Medium", "Low"].map((priority) => (
                  <div key={priority}>
                    <div className="flex justify-between items-center mb-1">
                      <span>{priority}</span>
                      <span className="text-sm font-medium">
                        {(summary.priorityCounts as Record<string, number>)[priority] || 0} ({getPriorityPercentage(priority)}%)
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
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No priority data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>
              Your most recently created tasks
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
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
              {summary && summary.recentTasks && summary.recentTasks.length > 0 ? (
                summary.recentTasks.map((task: Task) => (
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
                      {task.assignedTo.map((user: any) => user.username).join(", ")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/tasks/${task._id}`)}
                        >
                          View
                        </Button>
                        {(isAdmin || task.createdBy._id === adminDetails._id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/tasks/${task._id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-4">
          <Button
            variant="outline"
            onClick={() => navigate("/tasks")}
          >
            View All Tasks
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TaskDashboard; 