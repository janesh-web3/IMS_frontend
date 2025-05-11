import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useTaskContext } from "@/context/taskContext";
import { useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Overview = () => {
  const { tasks, loading, error, fetchTasks } = useTaskContext();
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    if (!tasks.length) {
      return {
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
        overdue: 0
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total: tasks.length,
      completed: tasks.filter(task => task.status === "Completed").length,
      inProgress: tasks.filter(task => task.status === "In Progress").length,
      pending: tasks.filter(task => task.status === "Pending").length,
      overdue: tasks.filter(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate < today && task.status !== "Completed";
      }).length
    };
  }, [tasks]);

  // if (loading) {
  //   return <TaskOverviewSkeleton />;
  // }

  // if (error) {
  //   return <div className="text-red-500">Error loading tasks: {error}</div>;
  // }

  return (
    <div>
      <div className="grid gap-2 md:gap-3 md:grid-cols-2 lg:grid-cols-5">
        {/* total task */}
        <Link to="/task/list">
          <Card className="bg-dashboard3 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                Total Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">{stats.total}</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                created upto date.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* complete task */}
        <Link to="/task/list">
          <Card className="bg-dashboard4 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                Completed Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">{stats.completed}</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                completed upto date.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* pending task */}
        <Link to="/task/list">
          <Card className="bg-dashboard6 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                In Progress Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">{stats.inProgress}</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                in progress upto date.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* overdue task */}
        <Link to="/task/list">
          <Card className="bg-dashboard5 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                Overdue Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">{stats.overdue}</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                overdue upto date.
              </p>
            </CardContent>
          </Card>
        </Link>

        {/* pending tasks */}
        <Link to="/task/list">
          <Card className="bg-dashboard7 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-base font-bold md:text-lg">{stats.pending}</div>
              <p className="text-xs md:text-sm text-muted-foreground">
                pending upto date.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};

// Skeleton loader for task overview
const TaskOverviewSkeleton = () => (
  <div className="grid gap-2 md:gap-3 md:grid-cols-2 lg:grid-cols-5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <Skeleton className="h-4 w-[100px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[50px] mb-2" />
          <Skeleton className="h-4 w-[140px]" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default Overview;
