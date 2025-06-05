import UserAuthForm from "./components/user-auth-form";
import StudentForm from "./components/student-auth-form";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import TeacherForm from "./components/teacher-auth-form";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <div className="relative flex-col items-center justify-center h-screen md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <Link
        to="/"
        className={cn(
          buttonVariants({ variant: "default" }),
          "absolute right-4 top-4  md:right-8 md:top-8"
        )}
      >
        Back
      </Link>

      <div className="relative flex-col hidden h-full p-10 text-white  bg-gradient-to-br from-green-950 via-black to-green-900 dark:border-r lg:flex">
        <div className="absolute inset-0  bg-gradient-to-br from-green-950 via-black to-green-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="mb-6"
          >
            <img
              src={"logot.png"}
              alt="Logo"
              className="rounded-full"
              width={120}
              height={120}
            />
          </motion.div>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;You’re just one login away from managing the future of education.&rdquo;
            </p>
            <footer className="text-sm">- Crown Mantra AGI</footer>
          </blockquote>
        </div>

        {/* Galaxy Stars Background */}
        <div className="absolute inset-0 z-0">
          {[...Array(100)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-30"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{
                repeat: Infinity,
                duration: 4 + Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center h-full p-4 lg:p-8">
        
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Login to your account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your username below to login your account
            </p>
          </div>
          <Tabs defaultValue="admin" className="space-y-4 ">
            <TabsList>
              <TabsTrigger value="admin">Admin</TabsTrigger>
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
            </TabsList>
            <TabsContent value="admin">
              <UserAuthForm />
            </TabsContent>
            <TabsContent value="student">
              <StudentForm />
            </TabsContent>
            <TabsContent value="teacher">
              <TeacherForm />
            </TabsContent>
          </Tabs>
          <p className="px-8 text-sm text-center text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              to="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
          
        </div>
      </div>
    </div>
  );
}
