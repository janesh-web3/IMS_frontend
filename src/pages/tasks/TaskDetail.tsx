import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Task, taskService } from "@/services/taskService";
import { format } from "date-fns";
import { CheckCircle, Clock, AlertCircle, FileText, Paperclip, MessageSquare, Activity, Edit, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useAdminContext } from "@/context/adminContext";

const TaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { adminDetails } = useAdminContext();
  
  // Check if user is admin or superadmin
  const isAdmin = adminDetails?.role === "admin" || adminDetails?.role === "superadmin";
  
  // Check if current user is the creator or an assignee of the task
  const isCreatorOrAssignee = () => {
    if (!task || !adminDetails) return false;
    
    const isCreator = task.createdBy._id === adminDetails._id;
    const isAssignee = task.assignedTo.some(user => user._id === adminDetails._id);
    
    return isCreator || isAssignee || isAdmin;
  };

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const fetchedTask = await taskService.getTaskById(id);
        setTask(fetchedTask);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch task:", error);
        toast({
          title: "Error",
          description: "Failed to load task details",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  const handleStatusChange = async (status: string) => {
    if (!task || !id) return;
    
    try {
      const updatedTask = await taskService.updateTask(id, { status: status as any });
      setTask(updatedTask);
      toast({
        title: "Status Updated",
        description: `Task status changed to ${status}`,
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !task || !id) return;
    
    try {
      const newComment = await taskService.addComment(id, comment);
      setTask((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [...prev.comments, newComment],
        };
      });
      setComment("");
      toast({
        title: "Comment Added",
        description: "Your comment has been added to the task",
      });
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAttachment = async () => {
    if (!file || !task || !id) return;
    
    try {
      setUploading(true);
      const attachment = await taskService.uploadAttachment(id, file);
      setTask((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          attachments: [...prev.attachments, attachment],
        };
      });
      setFile(null);
      setUploading(false);
      toast({
        title: "File Uploaded",
        description: "Your file has been attached to the task",
      });
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task || !id) return;
    
    try {
      await taskService.deleteAttachment(id, attachmentId);
      setTask((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          attachments: prev.attachments.filter((a) => a._id !== attachmentId),
        };
      });
      toast({
        title: "Attachment Deleted",
        description: "The attachment has been removed",
      });
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      toast({
        title: "Error",
        description: "Failed to delete attachment",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async () => {
    if (!task || !id) return;
    
    try {
      await taskService.deleteTask(id);
      toast({
        title: "Task Deleted",
        description: "The task has been deleted",
      });
      navigate("/tasks");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  };

  const handleSubtaskToggle = async (subtaskId: string, completed: boolean) => {
    if (!task || !id) return;
    
    try {
      await taskService.updateSubtask(id, subtaskId, completed);
      setTask((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          subTasks: prev.subTasks.map((st) =>
            st._id === subtaskId ? { ...st, completed } : st
          ),
        };
      });
    } catch (error) {
      console.error("Failed to update subtask:", error);
      toast({
        title: "Error",
        description: "Failed to update subtask",
        variant: "destructive",
      });
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "In Progress":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "On Hold":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "Cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-blue-100 text-blue-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status badge color
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

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Task not found</h2>
              <p className="text-gray-500 mt-2">
                The task you're looking for doesn't exist or has been deleted.
              </p>
              <Button
                className="mt-4"
                onClick={() => navigate("/tasks")}
              >
                Back to Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {getStatusIcon(task.status)}
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {task.category && (
                <Badge variant="outline">{task.category}</Badge>
              )}
            </div>
            <CardTitle className="text-2xl">{task.title}</CardTitle>
            <CardDescription className="mt-2">
              Created by {task.createdBy.username} on{" "}
              {format(new Date(task.createdAt), "MMM dd, yyyy")}
              {task.dueDate && (
                <>
                  {" "}
                  · Due by {format(new Date(task.dueDate), "MMM dd, yyyy")}
                </>
              )}
            </CardDescription>
          </div>
          {(isAdmin || task.createdBy._id === adminDetails._id) && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/tasks/${id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Task</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this task? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteTask}
                    >
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Tabs defaultValue="details">
                <TabsList className="mb-4">
                  <TabsTrigger value="details">
                    <FileText className="h-4 w-4 mr-1" /> Details
                  </TabsTrigger>
                  <TabsTrigger value="comments">
                    <MessageSquare className="h-4 w-4 mr-1" /> Comments ({task.comments.length})
                  </TabsTrigger>
                  <TabsTrigger value="attachments">
                    <Paperclip className="h-4 w-4 mr-1" /> Attachments ({task.attachments.length})
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    <Activity className="h-4 w-4 mr-1" /> Activity
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      {task.description ? (
                        <p className="whitespace-pre-wrap">{task.description}</p>
                      ) : (
                        <p className="text-gray-500 italic">No description provided</p>
                      )}
                    </div>
                  </div>

                  {task.subTasks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Subtasks</h3>
                      <div className="space-y-2">
                        {task.subTasks.map((subtask) => (
                          <div
                            key={subtask._id}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-50"
                          >
                            <Checkbox
                              checked={subtask.completed}
                              onCheckedChange={(checked) =>
                                handleSubtaskToggle(
                                  subtask._id,
                                  checked as boolean
                                )
                              }
                              disabled={!isCreatorOrAssignee()}
                            />
                            <span
                              className={
                                subtask.completed ? "line-through text-gray-500" : ""
                              }
                            >
                              {subtask.title}
                            </span>
                            {subtask.tag && (
                              <Badge variant="outline" className="ml-auto">
                                {subtask.tag}
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.dependencies && task.dependencies.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Dependencies</h3>
                      <div className="space-y-2">
                        {task.dependencies.map((dep) => (
                          <div
                            key={dep.taskId._id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center gap-2">
                              <span>{dep.type}:</span>
                              <Button
                                variant="link"
                                className="p-0 h-auto"
                                onClick={() => navigate(`/tasks/${dep.taskId._id}`)}
                              >
                                {dep.taskId.title}
                              </Button>
                            </div>
                            <Badge className={getStatusColor(dep.taskId.status)}>
                              {dep.taskId.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.isRecurring && task.recurringPattern && (
                    <div>
                      <h3 className="text-lg font-medium mb-2">Recurring Pattern</h3>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <p>
                          Repeats {task.recurringPattern.frequency.toLowerCase()}{" "}
                          {task.recurringPattern.interval > 1 && `every ${task.recurringPattern.interval} ${task.recurringPattern.frequency.toLowerCase()}`}
                          {task.recurringPattern.endDate && ` until ${format(new Date(task.recurringPattern.endDate), "MMM dd, yyyy")}`}
                        </p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="space-y-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddComment} disabled={!comment.trim()}>
                      Add
                    </Button>
                  </div>

                  <div className="space-y-4 mt-4">
                    {task.comments.length > 0 ? (
                      [...task.comments]
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime()
                        )
                        .map((comment) => (
                          <div
                            key={comment._id}
                            className="bg-gray-50 p-4 rounded-md"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="font-medium">
                                {comment.createdBy.username}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(
                                  new Date(comment.createdAt),
                                  "MMM dd, yyyy 'at' h:mm a"
                                )}
                              </div>
                            </div>
                            <p className="whitespace-pre-wrap">{comment.text}</p>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        No comments yet
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="attachments" className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleUploadAttachment}
                      disabled={!file || uploading}
                    >
                      {uploading ? "Uploading..." : "Upload"}
                    </Button>
                  </div>

                  <div className="space-y-2 mt-4">
                    {task.attachments.length > 0 ? (
                      task.attachments.map((attachment) => (
                        <div
                          key={attachment._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" />
                            <div>
                              <div className="font-medium">
                                {attachment.originalname}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(2)} KB ·
                                Uploaded by {attachment.uploadedBy.username} on{" "}
                                {format(
                                  new Date(attachment.uploadedAt),
                                  "MMM dd, yyyy"
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/api/uploads/tasks/${attachment.filename}`, "_blank")}
                            >
                              Download
                            </Button>
                            {(isAdmin || attachment.uploadedBy._id === adminDetails._id) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteAttachment(attachment._id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        No attachments yet
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-4">
                    {task.activities.length > 0 ? (
                      [...task.activities]
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() - new Date(a.date).getTime()
                        )
                        .map((activity) => (
                          <div
                            key={activity._id}
                            className="flex gap-3 p-2 border-b border-gray-100"
                          >
                            <div className="flex-shrink-0">
                              <Activity className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="flex-1">
                              <p>{activity.activity}</p>
                              <p className="text-sm text-gray-500">
                                {activity.by?.username} ·{" "}
                                {format(
                                  new Date(activity.date),
                                  "MMM dd, yyyy 'at' h:mm a"
                                )}
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        No activity recorded
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Task Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCreatorOrAssignee() && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Change Status</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant={task.status === "Pending" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange("Pending")}
                        >
                          Pending
                        </Button>
                        <Button
                          variant={task.status === "In Progress" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange("In Progress")}
                        >
                          In Progress
                        </Button>
                        <Button
                          variant={task.status === "Completed" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange("Completed")}
                        >
                          Completed
                        </Button>
                        <Button
                          variant={task.status === "On Hold" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange("On Hold")}
                        >
                          On Hold
                        </Button>
                        <Button
                          variant={task.status === "Cancelled" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleStatusChange("Cancelled")}
                        >
                          Cancelled
                        </Button>
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium mb-2">Assigned To</h4>
                    <div className="space-y-2">
                      {task.assignedTo.map((user) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <span>{user.username}</span>
                          <Badge variant="outline">{user.role}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {task.delegatedBy && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Delegated By</h4>
                      <div className="p-2 bg-gray-50 rounded-md">
                        <span>{task.delegatedBy.username}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskDetail; 