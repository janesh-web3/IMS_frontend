import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { crudRequest } from "@/lib/api";
import { useRouter } from "@/routes/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as z from "zod";

interface AuthResponse {
  _id: string;
  email: string;
  token: string;
}

const formSchema = z.object({
  email: z.string({ message: "Enter a valid email" }),
  password: z.string({ message: "Incorrect Password" }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function StudentForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const defaultValues = {
    email: "",
    password: "",
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (formData: UserFormValue) => {
    setLoading(true);
    try {
      const loginTime = new Date();

      const response: AuthResponse = await crudRequest(
        "POST",
        "/user/login-student",
        { ...formData, loginTime }
      );

      toast.success("Login successful!");
      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("userId", response._id);
      router.push("/");
      window.location.reload();
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full space-y-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your email..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password..."
                    disabled={loading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button disabled={loading} className="w-full ml-auto" type="submit">
            Continue
          </Button>
        </form>
      </Form>
    </>
  );
}
