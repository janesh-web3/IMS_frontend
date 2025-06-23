import { useEffect, useState } from "react";
import { useTaskContext } from "@/context/taskContext";
import { format } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import AddTask from "./AddTask";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { TASK_STATUS_COLORS, PRIORITY_COLORS } from "@/lib/utils";

// Define the user type to fix the TypeScript error
interface User {
  _id: string;
  username: string;
  role: string;
}

const List = () => {
  const { tasks,  fetchTasks, updateTaskStatus, deleteTask } = useTaskContext();
  const [open, setOpen] = useState(false);
  const [deleteAlert, setDeleteAlert] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusChange = async (taskId: string, status: string) => {
    await updateTaskStatus(taskId, status);
  };

  const handlePriorityChange = async (taskId: string, _priority: string) => {
    await updateTaskStatus(taskId, tasks.find(t => t._id === taskId)?.status || "Pending");
  };

  const handleDeleteConfirm = async () => {
    if (selectedTask) {
      await deleteTask(selectedTask);
      setDeleteAlert(false);
    }
  };

  const openDeleteDialog = (taskId: string) => {
    setSelectedTask(taskId);
    setDeleteAlert(true);
  };

  // Get text color for priority
  const getPriorityTextColor = (priority: string) => {
    const colorSet = PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS];
    return colorSet ? colorSet.text : "text-primary";
  };

  // Get text color for status
  const getStatusTextColor = (status: string) => {
    const colorSet = TASK_STATUS_COLORS[status as keyof typeof TASK_STATUS_COLORS];
    return colorSet ? colorSet.text : "text-primary";
  };

  // if (loading) {
  //   return <div className="p-4">Loading tasks...</div>;
  // }

  // if (error) {
  //   return <div className="p-4 text-red-500">Error: {error}</div>;
  // }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Task List</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <AddTask modalClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No tasks found. Create a new task to get started.
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task._id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    {task.dueDate ? format(new Date(task.dueDate), 'PP') : 'No due date'}
                  </TableCell>
                  <TableCell>
                    {task.assignedTo ? (
                      Array.isArray(task.assignedTo) 
                        ? (task.assignedTo[0] as User)?.username || 'Unassigned'
                        : typeof task.assignedTo === 'object' && 'username' in task.assignedTo 
                          ? (task.assignedTo as User).username 
                          : 'Unassigned'
                    ) : 'Unassigned'}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.priority}
                      onValueChange={(value) => handlePriorityChange(task._id, value)}
                    >
                      <SelectTrigger className={`w-28 ${getPriorityTextColor(task.priority)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleStatusChange(task._id, value)}
                    >
                      <SelectTrigger className={`w-32 ${getStatusTextColor(task.status)}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <span className="sr-only">Open menu</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => openDeleteDialog(task._id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteAlert} onOpenChange={setDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default List;
