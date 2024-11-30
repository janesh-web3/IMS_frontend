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
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

const courseFormSchema = z.object({
  subjectName: z.string().min(1, { message: "subjectName is required" }),
  monthlyFee: z.string().min(1, { message: "monthlyFee is required" }),
  regularFee: z.string().min(1, { message: "monthlyFee is required" }),
});

type CourseFormSchemaType = z.infer<typeof courseFormSchema>;

const SubjectCreateForm = ({ modalClose }: { modalClose: () => void }) => {
  const form = useForm<CourseFormSchemaType>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      subjectName: "",
      monthlyFee: "",
      regularFee: "",
    },
  });

  const { id } = useParams();

  const onSubmit = async (values: CourseFormSchemaType) => {
    const data = {
      subjectName: values.subjectName,
      monthlyFee: values.monthlyFee,
      regularFee: values.regularFee,
      courseId: id,
    };

    const notificationPayload = {
      title: "New Subject Added",
      message: `A subject name ${values.subjectName} has been created.`,
      type: "Subject",
      forRoles: ["admin", "superadmin"],
      push: true,
      sound: true,
    };

    await crudRequest("POST", "/subject/add-subject", data)
      .then(() => {
        toast.success("Subject added successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(() => {
        toast.error("Failed to add subject");
      });

    await crudRequest(
      "POST",
      "/notification/add-notification",
      notificationPayload
    );
  };

  return (
    <div className="px-2">
      <Heading
        title={"Create New Subject"}
        description={""}
        className="py-4 space-y-2 text-center"
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="subjectName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter subject name"
                    {...field}
                    className="px-4 py-6 shadow-inner drop-shadow-xl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <FormField
              control={form.control}
              name="monthlyFee"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter monthly fee"
                      {...field}
                      className="px-4 py-6 shadow-inner drop-shadow-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="regularFee"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter regular fee"
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
              Create Subject
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SubjectCreateForm;
