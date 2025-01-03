import Heading from "@/components/shared/heading";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crudRequest } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";
import { useEffect, useState } from "react";

const studentFormSchema = z.object({
  reception: z.string().nonempty({ message: "Reception is required" }),
  admin: z.string().nonempty({ message: "Admin is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
});

type StudentFormSchemaType = z.infer<typeof studentFormSchema>;

type AdminUser = {
  _id: string;
  username: string;
  role: string;
};

const HandOverCreateForm = ({ modalClose }: { modalClose: () => void }) => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [receptions, setReceptions] = useState<AdminUser[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    fetchUsers();
  }, []);

  const form = useForm<StudentFormSchemaType>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      reception: "",
      admin: "",
      amount: "",
    },
  });

  const { handleSubmit, control } = form;

  const onSubmit = async (values: StudentFormSchemaType) => {
    setIsSubmitting(true);

    try {
      const notificationPayload = {
        title: "New Handover Added",
        message: ` ${values.reception} handover ${values.amount} amount to ${values.admin}.`,
        type: "Handover",
        forRoles: ["admin", "superadmin"],
        push: true,
        sound: true,
      };

      await crudRequest("POST", "/handover/add-handover", values);
      await crudRequest(
        "POST",
        "/notification/add-notification",
        notificationPayload
      );
      toast.success("Handover added successfully");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error adding handover:", error);
      toast.error("Failed to add handover");
    }finally{
      setIsSubmitting(false);

    }
  };

  return (
    <div className="px-2">
      <Heading
        title={"Create New HandOver"}
        description={""}
        className="py-4 space-y-2 text-center"
      />
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          autoComplete="off"
        >
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <FormField
              control={control}
              name="reception"
              render={() => (
                <FormItem>
                  <FormControl>
                    <Controller
                      name="reception"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value}
                          name={field.name}
                        >
                          <SelectTrigger
                            id="reception"
                            className="items-start [&_[data-description]]:hidden"
                          >
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
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name="admin"
              render={() => (
                <FormItem>
                  <FormControl>
                    <Controller
                      name="admin"
                      control={control}
                      render={({ field }) => (
                        <Select
                          onValueChange={(value) => field.onChange(value)}
                          value={field.value}
                          name={field.name}
                        >
                          <SelectTrigger
                            id="admin"
                            className="items-start [&_[data-description]]:hidden"
                          >
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
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter Amount"
                    {...field}
                    className="px-4 py-6 shadow-inner drop-shadow-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full"
              size="lg"
              onClick={modalClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="rounded-full" size="lg">
            {isSubmitting ? "Adding..." : "Add Handover"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default HandOverCreateForm;
