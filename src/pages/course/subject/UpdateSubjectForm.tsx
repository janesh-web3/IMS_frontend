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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";

const courseFormSchema = z.object({
  subjectName: z.string().min(1, { message: "subjectName is required" }),
  monthlyFee: z.string().min(1, { message: "monthlyFee is required" }),
  regularFee: z.string().min(1, { message: "monthlyFee is required" }),
});

type CourseResponse = {
  subjectName: string;
  monthlyFee: string;
  regularFee: string;
};

type CourseFormSchemaType = z.infer<typeof courseFormSchema>;

const UpdateSubjectForm = ({ id }: { id: string }) => {
  const form = useForm<CourseFormSchemaType>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      subjectName: "",
      monthlyFee: "",
      regularFee: "",
    },
  });

  useEffect(() => {
    const fetchCourse = () => {
      crudRequest<CourseResponse>("GET", `/subject/get-subject/${id}`)
        .then((response) => {
          // Set the value of `name` field with the fetched `response.name`
          form.setValue("subjectName", response.subjectName);
          form.setValue("monthlyFee", response.monthlyFee);
          form.setValue("regularFee", response.regularFee);
        })
        .catch(() => {
          toast.error("Failed to fetch course");
        });
    };
    fetchCourse();
  }, [id, form]);

  const onSubmit = async (values: CourseFormSchemaType) => {
    const data = {
      subjectName: values.subjectName,
      monthlyFee: values.monthlyFee,
      regularFee: values.regularFee,
      courseId: id,
    };

    await crudRequest("PUT", `/subject/update-subject/${id}`, data)
      .then(() => {
        toast.success("Subject updated successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      })
      .catch(() => {
        toast.error("Failed to updated subject");
      });
  };

  return (
    <div>
      <div className="px-2">
        <Heading
          title={"Update Subject"}
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
              <Button type="submit" className="rounded-full" size="lg">
                Update Subject
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default UpdateSubjectForm;
