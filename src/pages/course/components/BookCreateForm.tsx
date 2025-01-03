import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";
import { useState } from "react";

const bookFormSchema = z.object({
  name: z.string().min(1, { message: "Book name is required" }),
  price: z.number().min(0),
  isFree: z.boolean(),
  bookType: z.enum(["COURSE_MATERIAL", "GENERAL_KNOWLEDGE", "IQ", "OTHER"]),
});

type BookFormSchemaType = z.infer<typeof bookFormSchema>;

interface BookResponse {
  success: boolean;
  data: any;
}

const BookCreateForm = ({
  courseId,
  modalClose,
}: {
  courseId: string;
  modalClose: () => void;
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<BookFormSchemaType>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      name: "",
      price: 0,
      isFree: false,
      bookType: "COURSE_MATERIAL",
    },
  });

  const onSubmit = async (values: BookFormSchemaType) => {
    setIsSubmitting(true);

    try {
      const response = await crudRequest<BookResponse>(
        "POST",
        "/book/add-book",
        {
          ...values,
          course: courseId,
        }
      );

      if (response.success) {
        toast.success("Book added successfully");
        modalClose();
      } else {
        toast.error("Failed to add book");
      }
    } catch (error) {
      toast.error("Error adding book");
    }finally{
      setIsSubmitting(false);

    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input placeholder="Book name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bookType"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select book type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COURSE_MATERIAL">
                    Course Material
                  </SelectItem>
                  <SelectItem value="GENERAL_KNOWLEDGE">
                    General Knowledge
                  </SelectItem>
                  <SelectItem value="IQ">IQ</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Price"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isFree"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <label>Free Book</label>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button  type="button" variant="outline" onClick={modalClose}>
            Cancel
          </Button>
          <Button type="submit"  disabled={isSubmitting}>   {isSubmitting ? "Adding..." : "Add Book"}</Button>
        </div>
      </form>
    </Form>
  );
};

export default BookCreateForm;
