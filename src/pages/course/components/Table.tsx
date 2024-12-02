import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { crudRequest } from "@/lib/api";
import { AlertModal } from "@/components/shared/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash, View } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Loading from "@/pages/not-found/loading";
import Error from "@/pages/not-found/error";
import { toast } from "react-toastify";
import UpdateCourseForm from "./UpdateCourseForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Course = {
  _id: string;
  name: string;
};

export function CourseTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const onConfirm = async (id: any) => {
    try {
      const response = await crudRequest<Course[]>(
        "DELETE",
        `/course/delete-course/${id}`
      );
      if (response) {
        toast.info("Course deleted successfully");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Error deleting course");
      }
    } catch (error) {
      toast.error("Error deleting course");
      console.error("Error fetching course data:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await crudRequest<Course[]>("GET", "/course/get-course");
      if (response && Array.isArray(response)) {
        setCourses(response);
      } else {
        setError("Unexpected response format");
      }
    } catch (error) {
      setError("Error fetching course data");
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (loading)
    return (
      <div>
        <Loading />
      </div>
    );
  if (error)
    return (
      <div>
        <Error />
      </div>
    );

  return (
    <div className="w-full max-h-[200vh] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">S.N</TableHead>
            <TableHead>Courses Name</TableHead>
            <TableHead>Update</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2}>No courses available</TableCell>
            </TableRow>
          ) : (
            courses.map((course, index) => (
              <TableRow>
                <TableCell className="font-medium" key={index}>
                  {index + 1}
                </TableCell>
                <Link to={`/course/${course._id}`}>
                  <TableCell>{course.name}</TableCell>
                </Link>
                <Sheet>
                  <TableCell>
                    <SheetTrigger asChild>
                      <Button variant="outline">Update</Button>
                    </SheetTrigger>
                  </TableCell>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Update Course</SheetTitle>
                      <SheetDescription>
                        Fill the data correctly to update course.
                      </SheetDescription>
                    </SheetHeader>
                    <UpdateCourseForm id={course._id} />
                  </SheetContent>
                </Sheet>

                <TableCell className="cursor-pointer">
                  <AlertModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    onConfirm={() => onConfirm(course._id)}
                    loading={loading}
                  />
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-8 h-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <Link to={`${course._id}`}>
                        <DropdownMenuItem className="cursor-pointer">
                          <View className="w-4 h-4 mr-2" />
                          Details
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuItem
                        onClick={() => setOpen(true)}
                        className="cursor-pointer"
                      >
                        <Trash className="w-4 h-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
