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
import { crudRequest } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const courseFormSchema = z.object({
  name: z.string().min(1, { message: "coursename is required" }),
});

type CourseFormSchemaType = z.infer<typeof courseFormSchema>;

const CourseCreateForm = ({ modalClose }: { modalClose: () => void }) => {
  const form = useForm<CourseFormSchemaType>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: CourseFormSchemaType) => {
    const notificationPayload = {
      title: "New Course Added",
      message: `A course name ${values.name} has been created.`,
      type: "Courses",
      forRoles: ["admin", "superadmin"],
      push: true,
      sound: true,
    };

    const response = await crudRequest<{ success: boolean }>(
      "POST",
      "/course/add-course",
      values
    );

    if (response.success) {
      await crudRequest(
        "POST",
        "/notification/add-notification",
        notificationPayload
      );
      toast.success("Course added successfully");
      modalClose();
      window.location.reload();
    } else {
      toast.error("Failed to add course");
    }
  };

  return (
    <div className="px-2">
      <Heading
        title={"Create New Course"}
        description={""}
        className="py-4 space-y-2 text-center"
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          autoComplete="off"
        >
          <div className="grid grid-cols-1 gap-x-8 gap-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter course name"
                      {...field}
                      className="px-4 py-6 shadow-inner drop-shadow-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full "
              size="lg"
              onClick={modalClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" size="lg">
              Create Course
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CourseCreateForm;
