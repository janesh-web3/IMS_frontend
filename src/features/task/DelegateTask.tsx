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
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { crudRequest } from "@/lib/api";
import { useTaskContext } from "@/context/taskContext";
import { MultiSelect } from "@/components/ui/multi-select";

const FormSchema = z.object({
  assignedTo: z.array(z.string()).min(1, "Please select at least one assignee"),
});

interface DelegateTaskProps {
  taskId: string;
  onClose: () => void;
}

const DelegateTask = ({ taskId, onClose }: DelegateTaskProps) => {
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<
    { _id: string; username: string; role: string }[]
  >([]);
  const { delegateTask } = useTaskContext();

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await crudRequest<any[]>("GET", "/user/get-admin");
        if (response) {
          // Only show admin and superadmin users
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
          description: "Could not fetch admin users for delegation",
        });
      }
    };

    fetchAdmins();
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      assignedTo: [],
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      setLoading(true);

      await delegateTask(taskId, values.assignedTo);
      onClose();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delegate task",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold text-center">Delegate Task</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delegate To</FormLabel>
                <MultiSelect
                  options={admins.map(admin => ({
                    label: `${admin.username} (${admin.role})`,
                    value: admin._id
                  }))}
                  selected={field.value}
                  onChange={(selected) => {
                    field.onChange(selected);
                    form.setValue("assignedTo", selected, {
                      shouldValidate: true,
                    });
                  }}
                  placeholder="Select administrators"
                />
                <FormDescription>
                  Select one or more administrators to delegate this task to
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Delegating..." : "Delegate Task"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DelegateTask;