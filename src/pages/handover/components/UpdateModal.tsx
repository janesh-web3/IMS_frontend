import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";

type AdminUser = {
  _id: string;
  username: string;
  role: string;
};

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialData?: {
    admin: string;
    reception: string;
    amount: string;
  };
}

export function UpdateModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: UpdateModalProps) {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [receptions, setReceptions] = useState<AdminUser[]>([]);

  const form = useForm({
    defaultValues: {
      admin: initialData?.admin || "",
      reception: initialData?.reception || "",
      amount: initialData?.amount || "",
    },
  });

  // Fetch users (admins and receptions)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await crudRequest<AdminUser[]>(
          "GET",
          "/user/get-admin"
        );
        if (response) {
          // Filter admins (including superadmins)
          setAdmins(
            response.filter(
              (user) => user.role === "admin" || user.role === "superadmin"
            )
          );
          // Filter receptions
          setReceptions(response.filter((user) => user.role === "reception"));
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to fetch users");
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        admin: initialData.admin,
        reception: initialData.reception,
        amount: initialData.amount,
      });
    }
  }, [initialData, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Handover</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="reception"
              render={() => (
                <FormItem>
                  <FormLabel>Reception Name</FormLabel>
                  <FormControl>
                    <Controller
                      name="reception"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value}
                          name={field.name}
                        >
                          <SelectTrigger className="items-start">
                            <SelectValue placeholder="Select Reception" />
                          </SelectTrigger>
                          <SelectContent>
                            {receptions.map((reception) => (
                              <SelectItem
                                key={reception._id}
                                value={reception.username}
                                className="capitalize"
                              >
                                {reception.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin"
              render={() => (
                <FormItem>
                  <FormLabel>Admin Name</FormLabel>
                  <FormControl>
                    <Controller
                      name="admin"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value}
                          name={field.name}
                        >
                          <SelectTrigger className="items-start">
                            <SelectValue placeholder="Select Admin" />
                          </SelectTrigger>
                          <SelectContent>
                            {admins.map((admin) => (
                              <SelectItem
                                key={admin._id}
                                value={admin.username}
                                className="capitalize"
                              >
                                {admin.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Update</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
