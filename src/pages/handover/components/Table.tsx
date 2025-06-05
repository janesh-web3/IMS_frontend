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
import { Edit, MoreHorizontal, Search, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import Error from "@/pages/not-found/error";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { UpdateModal } from "./UpdateModal";
import PopupModal from "@/components/shared/popup-modal";
import HandOverCreateForm from "./HandOverCreateForm";
import { Plus } from "lucide-react";
import HandOverStats from "./HandOverStats";
import AdminComponent from "@/components/shared/AdminComponent";
import { Input } from "@/components/ui/input";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout>();
  const limit = 10; // items per page
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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      setPage(1);
      fetchTeachers(1, value);
    }, 500);

    setDebounceTimeout(timeout);
  };

  const fetchTeachers = async (currentPage?: number, search?: string) => {
    try {
      setLoading(true);
      const response = await crudRequest<{
        data: Teacher[];
        pagination: { total: number; page: number; totalPages: number };
      }>(
        "GET",
        `/handover/get-handover?page=${currentPage || page}&limit=${limit}&search=${search || searchQuery}`
      );
      setTeachers(response.data);
      setTotalPages(response.pagination.totalPages);
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
  }, [page]); // Fetch when page changes

  const Pagination = () => (
    <div className="flex items-center justify-end space-x-2 py-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(page - 1)}
        disabled={page === 1}
      >
        Previous
      </Button>
      <div className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setPage(page + 1)}
        disabled={page === totalPages}
      >
        Next
      </Button>
    </div>
  );

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
      <div className="flex items-center justify-between gap-2 py-5">
        <div className="relative flex-1 mx-2 ml-auto md:grow-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <AdminComponent>
          <div className="flex gap-3">
            <PopupModal
              text="Add HandOver"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <HandOverCreateForm modalClose={onClose} />
              )}
            />
          </div>
        </AdminComponent>
      </div>
        <AdminComponent>
          <HandOverStats />
        </AdminComponent>
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

      <Pagination />
    </>
  );
}
