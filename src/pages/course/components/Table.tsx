import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { crudRequest, moveToRecycleBin } from "@/lib/api";
import { AlertModal } from "@/components/shared/alert-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Search, Trash, View } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Error from "@/pages/not-found/error";
import UpdateCourseForm from "./UpdateCourseForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import AdminComponent from "@/components/shared/AdminComponent";
import PopupModal from "@/components/shared/popup-modal";
import CourseCreateForm from "./CourseCreateForm";
import { Plus } from "lucide-react";
import CourseStats from "./CourseStats";
import { Input } from "@/components/ui/input";

type Course = {
  _id: string;
  name: string;
};

export function CourseTable() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<{ isOpen: boolean; courseId: string | null }>({
    isOpen: false,
    courseId: null
  });
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchCourses = async (search?: string) => {
    try {
      const queryParams = search ? `?search=${encodeURIComponent(search)}` : "";
      const response = await crudRequest<Course[]>(
        "GET",
        `/course/get-course${queryParams}`
      );
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

  const onConfirm = async () => {
    if (!open.courseId) return;
    
    try {
      const success = await moveToRecycleBin("Course", open.courseId);
      if (success) {
        setOpen({ isOpen: false, courseId: null });
        fetchCourses();
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      setOpen({ isOpen: false, courseId: null });
    }
  };

  const refreshCourses = () => {
    fetchCourses();
  };

  useEffect(() => {
    fetchCourses(searchQuery);
  }, [searchQuery]);

  const renderLoadingSkeleton = () => (
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
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="h-4 bg-muted animate-pulse rounded w-[30px]" />
            </TableCell>
            <TableCell>
              <div className="h-4 bg-muted animate-pulse rounded w-[200px]" />
            </TableCell>
            <TableCell>
              <div className="h-8 bg-muted animate-pulse rounded w-[80px]" />
            </TableCell>
            <TableCell>
              <div className="w-8 h-8 rounded bg-muted animate-pulse" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (loading) return renderLoadingSkeleton();
  if (error) return <Error />;

  return (
    <div>
      <div className="flex items-center justify-between gap-2 py-5 p-2">
        <div className="relative flex-1 mx-2 ml-auto md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
        <AdminComponent>
          <div className="flex gap-3">
            <PopupModal
              text="Add Course"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <CourseCreateForm modalClose={onClose} />
              )}
            />
          </div>
        </AdminComponent>
      </div>
      <div>
          <AdminComponent>
            <CourseStats />
          </AdminComponent>
      </div>
      <div className="min-h-fit overflow-auto max-h-fit pt-6">
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
                <TableRow key={course._id}>
                  <TableCell className="font-medium">
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
                      <UpdateCourseForm
                        id={course._id}
                        onCourseUpdated={refreshCourses}
                      />
                    </SheetContent>
                  </Sheet>

                  <TableCell className="cursor-pointer">
                    <AlertModal
                      isOpen={open.isOpen && open.courseId === course._id}
                      onClose={() => setOpen({ isOpen: false, courseId: null })}
                      onConfirm={onConfirm}
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
                        <AdminComponent>
                          <DropdownMenuItem
                            onClick={() => setOpen({ isOpen: true, courseId: course._id })}
                            className="cursor-pointer"
                          >
                            <Trash className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </AdminComponent>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
