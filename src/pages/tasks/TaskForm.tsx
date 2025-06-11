import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { Task, TaskFormData, taskService } from "@/services/taskService";
import { toast } from "@/components/ui/use-toast";
import { useAdminContext } from "@/context/adminContext";
import axios from "axios";
import { server } from "@/server";

// Define form schema with Zod
const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  status: z.enum(["Pending", "In Progress", "Completed", "On Hold", "Cancelled"]),
  category: z.enum([
    "Administrative",
    "Academic",
    "Technical",
    "Financial",
    "Maintenance",
    "Event",
    "Other",
  ]),
  dueDate: z.date().optional(),
  assignedTo: z.array(z.string()).min(1, "At least one assignee is required"),
  subTasks: z.array(
    z.object({
      title: z.string().min(1, "Subtask title is required"),
      date: z.date().optional(),
      tag: z.string().optional(),
      assignedTo: z.string().optional(),
    })
  ),
  isRecurring: z.boolean().default(false),
  recurringPattern: z
    .object({
      frequency: z.enum(["Daily", "Weekly", "Monthly", "Custom"]),
      interval: z.number().min(1),
      endDate: z.date().optional(),
    })
    .optional(),
  dependencies: z
    .array(
      z.object({
        taskId: z.string(),
        type: z.enum(["Blocks", "Blocked by", "Related to"]),
      })
    )
    .optional(),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

interface User {
  _id: string;
  username: string;
  role: string;
}

interface TaskFormProps {
  users: User[];
  relatedTasks?: Task[];
}

const TaskForm: React.FC<TaskFormProps> = ({ users, relatedTasks = [] }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(id ? true : false);
  const [_originalTask, setOriginalTask] = useState<Task | null>(null);
  const isEditMode = Boolean(id);
  const { adminDetails } = useAdminContext();
  
  // Debug adminDetails
  useEffect(() => {
    console.log("Admin details in TaskForm:", adminDetails);
  }, [adminDetails]);
  
  // Check if user is admin or superadmin
  const isAdmin = adminDetails?.role === "admin" || adminDetails?.role === "superadmin";
  
  // Function to check API status and auth status
  const checkApiStatus = async () => {
    try {
      // Check if token exists
      const token = sessionStorage.getItem("token");
      console.log("Auth token:", token ? "exists" : "missing");
      
      // Check user details endpoint
      const response = await axios.get(`${server}/tasks/debug/user`, {
        headers: { Authorization: token }
      });
      console.log("User debug info:", response.data);
      
      return true;
    } catch (error) {
      console.error("API status check failed:", error);
      return false;
    }
  };

  // Initialize form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      status: "Pending",
      category: "Other",
      assignedTo: [],
      subTasks: [],
      isRecurring: false,
      dependencies: [],
    },
  });
  
  // Set default assignee when adminDetails is available
  useEffect(() => {
    if (adminDetails && adminDetails._id && !isEditMode) {
      console.log("Setting default assignee to current admin:", adminDetails._id);
      form.setValue("assignedTo", [adminDetails._id]);
    }
  }, [adminDetails, form, isEditMode]);

  // Setup field array for subtasks
  const {
    fields: subTaskFields,
    append: appendSubTask,
    remove: removeSubTask,
  } = useFieldArray({
    control: form.control,
    name: "subTasks",
  });

  // Setup field array for dependencies
  const {
    fields: dependencyFields,
    append: appendDependency,
    remove: removeDependency,
  } = useFieldArray({
    control: form.control,
    name: "dependencies",
  });

  // Fetch task data if in edit mode
  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;

      try {
        setInitializing(true);
        const task = await taskService.getTaskById(id);
        setOriginalTask(task);
        
        // Check if user has permission to edit this task
        const isCreator = task.createdBy._id === adminDetails._id;
        const isAssignee = task.assignedTo.some(user => user._id === adminDetails._id);
        
        if (!isAdmin && !isCreator && !isAssignee) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this task",
            variant: "destructive",
          });
          navigate(`/tasks/${id}`);
          return;
        }
        
        // Transform the data to match form structure
        form.reset({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          category: task.category,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
          assignedTo: task.assignedTo.map((user) => user._id),
          subTasks: task.subTasks.map((st) => ({
            title: st.title,
            date: st.date ? new Date(st.date) : undefined,
            tag: st.tag,
            assignedTo: st.assignedTo?._id || "none",
          })),
          isRecurring: task.isRecurring,
          recurringPattern: task.recurringPattern
            ? {
                frequency: task.recurringPattern.frequency,
                interval: task.recurringPattern.interval,
                endDate: task.recurringPattern.endDate
                  ? new Date(task.recurringPattern.endDate)
                  : undefined,
              }
            : undefined,
          dependencies: task.dependencies?.map((dep) => ({
            taskId: dep.taskId._id,
            type: dep.type,
          })),
        });
        
        setInitializing(false);
      } catch (error) {
        console.error("Failed to fetch task:", error);
        toast({
          title: "Error",
          description: "Failed to load task data",
          variant: "destructive",
        });
        setInitializing(false);
      }
    };

    fetchTask();
  }, [id, form, adminDetails._id, isAdmin, navigate]);

  // Watch for form values that affect conditional rendering
  const isRecurring = form.watch("isRecurring");
  
  // Set default values for recurring pattern when isRecurring changes
  useEffect(() => {
    if (isRecurring && !form.getValues("recurringPattern.frequency")) {
      form.setValue("recurringPattern.frequency", "Daily");
      form.setValue("recurringPattern.interval", 1);
    }
  }, [isRecurring, form]);

  // Handle form submission
  const onSubmit = async (values: TaskFormValues) => {
    try {
      setLoading(true);
      
      // Check API status before proceeding
      const apiStatus = await checkApiStatus();
      if (!apiStatus) {
        toast({
          title: "API Error",
          description: "Could not connect to the API or authentication issue",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }
      
      // Prepare data for API
      const taskData: TaskFormData = {
        ...values,
        dueDate: values.dueDate as Date,
      };
      
              // Make sure we have at least one assignee and all IDs are valid
        if (Array.isArray(taskData.assignedTo)) {
          // Filter out invalid IDs - MongoDB ObjectIDs are 24 hex characters
          taskData.assignedTo = taskData.assignedTo.filter(id => 
            id && 
            typeof id === 'string' && 
            id !== 'none' && 
            /^[0-9a-fA-F]{24}$/.test(id)
          );
        }
        
        // Check if we still have at least one valid assignee
        if (!taskData.assignedTo || (Array.isArray(taskData.assignedTo) && taskData.assignedTo.length === 0)) {
          if (adminDetails && adminDetails._id && /^[0-9a-fA-F]{24}$/.test(adminDetails._id)) {
            console.log("No valid assignees selected, using current admin as default");
            taskData.assignedTo = [adminDetails._id];
          } else {
            throw new Error("At least one valid assignee is required");
          }
        }
        
        // Log the assignedTo field
        console.log("Final assignedTo value:", taskData.assignedTo);
      
      // Handle recurring pattern
      if (!taskData.isRecurring) {
        // If not recurring, completely remove the recurringPattern field
        delete taskData.recurringPattern;
      } else if (taskData.isRecurring) {
        // Initialize recurringPattern if it doesn't exist
        if (!taskData.recurringPattern) {
          taskData.recurringPattern = {
            frequency: "Daily",
            interval: 1,
            endDate: undefined
          };
        } else {
          // Make sure frequency is one of the allowed values
          if (!["Daily", "Weekly", "Monthly", "Custom"].includes(taskData.recurringPattern.frequency)) {
            taskData.recurringPattern.frequency = "Daily";
          }
          
          // Ensure interval is a number
          taskData.recurringPattern.interval = Number(taskData.recurringPattern.interval) || 1;
        }
      }
      
      if (isEditMode && id) {
        // Update existing task
        await taskService.updateTask(id, taskData);
        toast({
          title: "Success",
          description: "Task updated successfully",
        });
      } else {
        // Create new task
        await taskService.createTask(taskData);
        toast({
          title: "Success",
          description: "Task created successfully",
        });
      }
      
      // Navigate back to task list
      navigate("/tasks");
    } catch (error) {
      console.error("Failed to save task:", error);
      toast({
        title: "Error",
        description: isEditMode
          ? "Failed to update task"
          : "Failed to create task",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Task" : "Create Task"}</CardTitle>
          <CardDescription>
            {isEditMode
              ? "Update the task details below"
              : "Fill in the task details below"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title*</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Administrative">Administrative</SelectItem>
                          <SelectItem value="Academic">Academic</SelectItem>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Financial">Financial</SelectItem>
                          <SelectItem value="Maintenance">Maintenance</SelectItem>
                          <SelectItem value="Event">Event</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Task description"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="Urgent">Urgent</SelectItem>
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
                          <SelectItem value="On Hold">On Hold</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={`w-full pl-3 text-left font-normal ${
                                !field.value ? "text-muted-foreground" : ""
                              }`}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To*</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          // Validate that the value is a proper MongoDB ObjectId
                          if (value && typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value)) {
                            const currentValues = new Set(field.value);
                            if (currentValues.has(value)) {
                              currentValues.delete(value);
                            } else {
                              currentValues.add(value);
                            }
                            field.onChange(Array.from(currentValues));
                          } else {
                            console.warn("Invalid user ID selected:", value);
                          }
                        }}
                        value={field.value[0] || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select users" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                              {user.username} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {field.value.map((userId) => {
                          const user = users.find((u) => u._id === userId);
                          return user ? (
                            <div
                              key={userId}
                              className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                            >
                              <span>{user.username}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-gray-200"
                                onClick={() => {
                                  const newValues = field.value.filter(
                                    (id) => id !== userId
                                  );
                                  field.onChange(newValues);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : null;
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Subtasks Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Subtasks</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendSubTask({ title: "", tag: "", assignedTo: "none" })
                    }
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Subtask
                  </Button>
                </div>
                <div className="space-y-4">
                  {subTaskFields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex flex-col gap-4 p-4 border rounded-md"
                    >
                      <div className="flex justify-between">
                        <h4 className="font-medium">Subtask {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSubTask(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`subTasks.${index}.title`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title*</FormLabel>
                              <FormControl>
                                <Input placeholder="Subtask title" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`subTasks.${index}.tag`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tag</FormLabel>
                              <FormControl>
                                <Input placeholder="Tag" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`subTasks.${index}.date`}
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Due Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={`w-full pl-3 text-left font-normal ${
                                        !field.value ? "text-muted-foreground" : ""
                                      }`}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`subTasks.${index}.assignedTo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Assigned To</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value || "none"}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select user" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  {users.map((user) => (
                                    <SelectItem key={user._id} value={user._id}>
                                      {user.username} ({user.role})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                  {subTaskFields.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      No subtasks added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Recurring Task Section */}
              <div className="border-t pt-4">
                <FormField
                  control={form.control}
                  name="isRecurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-medium cursor-pointer">
                        This is a recurring task
                      </FormLabel>
                    </FormItem>
                  )}
                />

                {isRecurring && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="recurringPattern.frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || "Daily"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Daily">Daily</SelectItem>
                              <SelectItem value="Weekly">Weekly</SelectItem>
                              <SelectItem value="Monthly">Monthly</SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurringPattern.interval"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interval</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              placeholder="1"
                              {...field}
                              onChange={(e) => {
                                const value = parseInt(e.target.value);
                                field.onChange(isNaN(value) ? 1 : value);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="recurringPattern.endDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={`w-full pl-3 text-left font-normal ${
                                    !field.value ? "text-muted-foreground" : ""
                                  }`}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>No end date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>

              {/* Dependencies Section */}
              {relatedTasks.length > 0 && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium">Task Dependencies</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendDependency({
                          taskId: "",
                          type: "Related to",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Dependency
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {dependencyFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="flex flex-col gap-4 p-4 border rounded-md"
                      >
                        <div className="flex justify-between">
                          <h4 className="font-medium">Dependency {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDependency(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`dependencies.${index}.taskId`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Related Task</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select task" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {relatedTasks.map((task) => (
                                      <SelectItem key={task._id} value={task._id}>
                                        {task.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`dependencies.${index}.type`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Relationship</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select relationship" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Blocks">Blocks</SelectItem>
                                    <SelectItem value="Blocked by">
                                      Blocked by
                                    </SelectItem>
                                    <SelectItem value="Related to">
                                      Related to
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                    {dependencyFields.length === 0 && (
                      <p className="text-center text-gray-500 py-4">
                        No dependencies added yet
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/tasks")}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : isEditMode ? (
                    "Update Task"
                  ) : (
                    "Create Task"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskForm; 