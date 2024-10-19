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
import { Link, useParams } from "react-router-dom";
import Loading from "@/pages/not-found/loading";
import Error from "@/pages/not-found/error";

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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">S.N</TableHead>
            <TableHead>Subject Name</TableHead>
            <TableHead>Monthly Fee</TableHead>
            <TableHead>Regular Fee</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!courses || courses.subjects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3}>No courses available</TableCell>
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

                <TableCell>
                  <AlertModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    onConfirm={async () => {
                      // Add delete logic here
                      setOpen(false);
                    }}
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
                        <Edit className="w-4 h-4 mr-2" /> Update
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
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </>
  );
}
