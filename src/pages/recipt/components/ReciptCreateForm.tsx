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
import { z } from "zod";

// Define your form schema using Zod
const studentFormSchema = z.object({
  income: z.string({ required_error: "Income is required" }),
  amount: z.string().min(1, { message: "Amount is required" }),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
});

type StudentFormSchemaType = z.infer<typeof studentFormSchema>;

const ReciptCreateForm = ({ modalClose }: { modalClose: () => void }) => {
  // Initialize useForm with Zod schema
  const form = useForm<StudentFormSchemaType>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      income: "",
      amount: "",
      paymentMethod: "",
    },
  });

  // Handle form submission
  const onSubmit = async (values: StudentFormSchemaType) => {
    try {
      await crudRequest("POST", "/recipt/add-recipt", values);
      alert("Receipt added successfully");
      window.location.reload();
    } catch (error) {
      console.error("Error adding receipt:", error);
    }
  };

  return (
    <div className="px-2">
      <Heading
        title={"Create New Receipt"}
        description={""}
        className="space-y-2 py-4 text-center"
      />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          autoComplete="off"
        >
          <FormField
            control={form.control}
            name="income"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Enter income type"
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="Enter amount"
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
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <Controller
                    name="paymentMethod"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        {...field}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger
                          className="items-start [&_[data-description]]:hidden"
                        >
                          <SelectValue placeholder="Select Payment Method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Online">
                            <div className="flex items-start gap-3 text-muted-foreground">
                              <div className="grid gap-0.5">
                                <h1>Online</h1>
                              </div>
                            </div>
                          </SelectItem>
                          <SelectItem value="Offline">
                            <div className="flex items-start gap-3 text-muted-foreground">
                              <div className="grid gap-0.5">
                                <h1>Offline</h1>
                              </div>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
              Create Receipt
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ReciptCreateForm;
