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

const studentFormSchema = z.object({
  reception: z.string().nonempty({ message: "Reception is required" }),
  admin: z.string().nonempty({ message: "Admin is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
});

type StudentFormSchemaType = z.infer<typeof studentFormSchema>;

const HandOverCreateForm = ({ modalClose }: { modalClose: () => void }) => {
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
    try {
      await crudRequest("POST", "/handover/add-handover", values);
      toast.success("Handover added successfully");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error adding handover:", error);
      toast.error("Failed to add handover");
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
              render={({ field }) => (
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
                            <SelectItem value="Reception A">
                              Reception A
                            </SelectItem>
                            <SelectItem value="Reception B">
                              Reception B
                            </SelectItem>
                            <SelectItem value="Reception C">
                              Reception C
                            </SelectItem>
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
              render={({ field }) => (
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
                            <SelectItem value="Admin A">Admin A</SelectItem>
                            <SelectItem value="Admin B">Admin B</SelectItem>
                            <SelectItem value="Admin C">Admin C</SelectItem>
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
            <Button type="submit" className="rounded-full" size="lg">
              Create HandOver
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default HandOverCreateForm;
