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
import Loading from "@/pages/not-found/loading";
import Error from "@/pages/not-found/error";

type Teacher = {
  _id: string;
  admin: string;
  amount: string;
  reception: number;
};

export function HandOverTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const onConfirm = async () => {
    if (selectedTeacher) {
      try {
        await crudRequest("DELETE", `/teacher/delete/${selectedTeacher}`);
        setTeachers((prev) =>
          prev.filter((teacher) => teacher._id !== selectedTeacher)
        );
        setOpen(false);
      } catch (error) {
        setError("Error deleting teacher");
        console.error("Error deleting teacher:", error);
      }
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await crudRequest<Teacher[]>(
        "GET",
        "/handover/get-handover"
      );
      setTeachers(response);
    } catch (error) {
      setError("Error fetching teacher data");
      console.error("Error fetching teacher data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">S.N</TableHead>
            <TableHead>Admin Name</TableHead>
            <TableHead>Reception Name</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {teachers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>No teachers available</TableCell>
            </TableRow>
          ) : (
            teachers.map((teacher, index) => (
              <TableRow key={teacher._id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{teacher.admin}</TableCell>
                <TableCell>{teacher.amount}</TableCell>
                <TableCell>{teacher.reception}</TableCell>
                {/* <TableCell>{teacher.courses.join(", ")}</TableCell> */}
                <TableCell className="cursor-pointer">
                  <AlertModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
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
                      <DropdownMenuItem className="cursor-pointer">
                        <Edit className="w-4 h-4 mr-2" /> Update
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedTeacher(teacher._id);
                          setOpen(true);
                        }}
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
