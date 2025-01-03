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
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { z } from "zod";

const courseFormSchema = z.object({
  name: z.string().min(1, { message: "coursename is required" }),
});

type CourseFormSchemaType = z.infer<typeof courseFormSchema>;
type CourseResponse = {
  name: string;
};

interface UpdateCourseFormProps {
  id: string;
  onCourseUpdated: () => void;
}

const UpdateCourseForm = ({ id, onCourseUpdated }: UpdateCourseFormProps) => {
  const form = useForm<CourseFormSchemaType>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: "",
    },
  });
      const [isSubmitting, setIsSubmitting] = useState(false);
  

  useEffect(() => {
    const fetchCourse = () => {
      crudRequest<CourseResponse>("GET", `/course/get-course/${id}`).then(
        (response) => {
          // Set the value of `name` field with the fetched `response.name`
          form.setValue("name", response.name);
        }
      );
    };
    fetchCourse();
  }, [id, form]);

  const onSubmit = async (values: CourseFormSchemaType) => {
    setIsSubmitting(true);
    const notificationPayload = {
      title: " Course Updated",
      message: `A course name ${values.name} has been updated.`,
      type: "Courses",
      forRoles: ["admin", "superadmin"],
      push: true,
      sound: true,
    };

    try {
      
    await crudRequest("PUT", `/course/update-course/${id}`, values)
    .then(() => {
      toast.success("Course updated successfully");
      onCourseUpdated();
    })
    .catch(() => {
      toast.error("Failed to update course");
    });

  await crudRequest(
    "POST",
    "/notification/add-notification",
    notificationPayload
  );
    } catch (error) {
      toast.error("Failed to update course");
      
    }finally{
      setIsSubmitting(false);

    }

  };

  return (
    <div className="px-2">
      <Heading
        title={"Update Course"}
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
            <Button disabled={isSubmitting}   type="submit" className="rounded-full" size="lg">
            {isSubmitting ? "Updating..." : "Update Course"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateCourseForm;
