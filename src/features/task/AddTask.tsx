import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { toast } from "@/components/ui/use-toast";

import { taskService, TaskFormData } from "@/services/taskService";
import { crudRequest } from "@/lib/api";
import { useTaskContext } from "@/context/taskContext";
import { MultiSelect } from "@/components/ui/multi-select";

const FormSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  status: z.enum(["Pending", "In Progress", "Completed"]),
  dueDate: z.date().min(new Date(), "Due date must be in the future"),
  assignedTo: z.union([z.string(), z.array(z.string())]).refine(val => val.length > 0, {
    message: "Please select at least one assignee",
  }),
  assignedTeam: z.string().optional(),
});

const AddTask = ({ modalClose }: { modalClose: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<
    { _id: string; username: string; role: string }[]
  >([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const { fetchTasks } = useTaskContext();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setAdminsLoading(true);
        const response = await crudRequest<any[]>("GET", "/user/get-admin");
        if (response) {
          const adminUsers = response.filter(
            (user) => user.role === "admin" || user.role === "superadmin"
          );
          setAdmins(adminUsers);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
        toast({
          variant: "destructive",
          title: "Failed to load administrators",
          description: "Could not fetch admin users for assignment",
        });
      } finally {
        setAdminsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "Pending",
      assignedTo: [],
      assignedTeam: "none",
      dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      setLoading(true);

      if (!values.assignedTo || (Array.isArray(values.assignedTo) && values.assignedTo.length === 0)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select at least one administrator to assign the task to",
        });
        return;
      }

      const taskData: TaskFormData = {
        title: values.title,
        description: values.description || "",
        priority: values.priority,
        status: values.status,
        assignedTo: values.assignedTo,
        assignedTeam: values.assignedTeam,
        dueDate: values.dueDate,
      };

      await taskService.createTask(taskData);

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      fetchTasks();

      modalClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create task",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-center">Create New Task</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter task title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter task description"
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={
                        field.value
                          ? new Date(field.value).toISOString().split("T")[0]
                          : ""
                      }
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        field.onChange(date);
                        form.setValue("dueDate", date, {
                          shouldValidate: true,
                        });
                      }}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    Select due date (must be today or later)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign To</FormLabel>
                  {adminsLoading ? (
                    <div className="text-sm text-gray-500">Loading administrators...</div>
                  ) : admins && admins.length > 0 ? (
                    <MultiSelect
                      options={admins.map(admin => ({
                        label: `${admin.username} (${admin.role})`,
                        value: admin._id
                      }))}
                      selected={Array.isArray(field.value) ? field.value : (field.value ? [field.value] : [])}
                      onChange={(selected) => {
                        field.onChange(selected);
                        form.setValue("assignedTo", selected, {
                          shouldValidate: true,
                        });
                      }}
                      placeholder="Select administrators"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">No administrators found.</div>
                  )}
                  <FormDescription>
                    Select one or more administrators to assign this task to
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="assignedTeam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to Team (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optionally assign to a team for better organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={modalClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddTask;
