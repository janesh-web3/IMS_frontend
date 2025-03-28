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
import { MoreHorizontal, Trash, View } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useParams } from "react-router-dom";
import Error from "@/pages/not-found/error";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import UpdateSubjectForm from "./UpdateSubjectForm";
import { toast } from "react-toastify";
import AdminComponent from "@/components/shared/AdminComponent";

type Subject = {
  _id: string;
  name: string;
  monthlyFee: string;
  regularFee: string;
  subjectName: string;
};

type Course = {
  _id: string;
  name: string;
  subjects: Subject[];
};

export function Subject() {
  const [courses, setCourses] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const { id } = useParams();

  const onConfirm = async (id: any) => {
    try {
      await moveToRecycleBin("Subject", id);
    } catch (error) {
      toast.error("Error deleting subject");
      console.error("Error fetching subject data:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await crudRequest<Course>(
        "GET",
        `/course/get-course/${id}`
      );
      if (response && response.subjects) {
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
  }, [id]);

  const renderLoadingSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">S.N</TableHead>
          <TableHead>Subject Name</TableHead>
          <TableHead>Monthly Fee</TableHead>
          <TableHead>Regular Fee</TableHead>
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
              <div className="h-4 bg-muted animate-pulse rounded w-[150px]" />
            </TableCell>
            <TableCell>
              <div className="h-4 bg-muted animate-pulse rounded w-[100px]" />
            </TableCell>
            <TableCell>
              <div className="h-4 bg-muted animate-pulse rounded w-[100px]" />
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">S.N</TableHead>
            <TableHead>Subject Name</TableHead>
            <TableHead>Monthly Fee</TableHead>
            <TableHead>Regular Fee</TableHead>
            <AdminComponent>
              <TableHead>Update</TableHead>
              <TableHead>Actions</TableHead>
            </AdminComponent>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!courses || courses.subjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3}>No subject available</TableCell>
            </TableRow>
          ) : (
            courses.subjects.map((subject, index) => (
              <TableRow key={subject._id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <Link to={`/course/subject/${subject._id}`}>
                    {subject.subjectName}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/course/subject/${subject._id}`}>
                    {subject.monthlyFee}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link to={`/course/subject/${subject._id}`}>
                    {subject.regularFee}
                  </Link>
                </TableCell>

                <AdminComponent>
                  <Sheet>
                    <TableCell>
                      <SheetTrigger asChild>
                        <Button variant="outline">Update</Button>
                      </SheetTrigger>
                    </TableCell>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Update Subject</SheetTitle>
                        <SheetDescription>
                          Fill the data correctly to update subject.
                        </SheetDescription>
                      </SheetHeader>
                      <UpdateSubjectForm id={subject._id} />
                    </SheetContent>
                  </Sheet>
                </AdminComponent>

                <AdminComponent>
                  <TableCell>
                    <AlertModal
                      isOpen={open}
                      onClose={() => setOpen(false)}
                      onConfirm={() => onConfirm(subject._id)}
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
                        <DropdownMenuItem className="cursor-pointer">
                          <View className="w-4 h-4 mr-2" /> Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setOpen(true)}
                          className="cursor-pointer"
                        >
                          <Trash className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </AdminComponent>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
