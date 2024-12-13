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
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Error from "@/pages/not-found/error";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { UpdateModal } from "./UpdateModal";

type Teacher = {
  _id: string;
  admin: string;
  amount: string;
  reception: string;
};

type HandOver = Teacher;

export function HandOverTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedHandOver, setSelectedHandOver] = useState<HandOver | null>(
    null
  );

  const onConfirm = async (id: string) => {
    try {
      const success = await moveToRecycleBin("HandOver", id);
      if (success) {
        setOpen(false);
      } else {
        setOpen(false);
      }
    } catch (error) {
      setError("Error deleting teacher");
      console.error("Error deleting teacher:", error);
      toast.error("Error deleting handover");
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

  const handleUpdate = async (values: Partial<HandOver>) => {
    try {
      await crudRequest(
        "PUT",
        `/handover/update-handover/${selectedHandOver?._id}`,
        values
      );
      setIsUpdateModalOpen(false);
      fetchTeachers(); // Refresh the data
      toast.success("Handover updated successfully");
    } catch (error) {
      console.error("Error updating handover:", error);
      toast.error("Error updating handover");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  if (loading)
    return (
      <div className="w-full overflow-x-auto">
        <div className="space-y-3">
          <Skeleton className="w-full h-10" />
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="w-full h-16" />
          ))}
        </div>
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
      <div className="w-full overflow-x-auto max-h-[700px] md:max-h-[500px] md:py-2">
        <div className="w-full max-h-[200vh]">
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
                        onConfirm={() => onConfirm(teacher._id)}
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedHandOver(teacher);
                              setIsUpdateModalOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Edit className="w-4 h-4 mr-2" /> Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
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
        </div>
      </div>

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedHandOver(null);
        }}
        onSubmit={handleUpdate}
        initialData={selectedHandOver || undefined}
      />
    </>
  );
}
