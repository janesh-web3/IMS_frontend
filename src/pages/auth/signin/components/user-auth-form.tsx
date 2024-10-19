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
  username: string;
  token: string;
}

const formSchema = z.object({
  username: z.string({ message: "Enter a valid username" }),
  password: z.string({ message: "Incorrect Password" }),
});

type UserFormValue = z.infer<typeof formSchema>;

export default function UserAuthForm() {
  const router = useRouter();
  const [loading] = useState(false);
  const defaultValues = {
    username: "",
    password: "",
  };
  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: UserFormValue) => {
    try {
      const response: AuthResponse = await crudRequest(
        "POST",
        "/user/login-admin",
        data
      );
      toast.success("Login successful !");
      sessionStorage.setItem("token", response.token);
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login Failed !");
    }

    console.log("data", data);
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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>UserName</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Enter your username..."
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
