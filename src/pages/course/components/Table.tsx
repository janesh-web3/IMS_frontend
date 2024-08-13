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
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type Course = {
  _id : string,
  name: string;
};

export function CourseTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const onConfirm = async () => {};

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">S.N</TableHead>
            <TableHead>Courses Name</TableHead>
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

                <TableCell className="cursor-pointer">
                  <AlertModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    onConfirm={onConfirm}
                    loading={loading}
                  />
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" /> Update
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setOpen(true)} className="cursor-pointer">
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
