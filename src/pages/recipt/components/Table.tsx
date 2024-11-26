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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

type Recipt = {
  _id: string;
  income: string;
  amount: string;
  paymentMethod: number;
};

export function ReciptTable() {
  const [teachers, setTeachers] = useState<Recipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);

  //pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onConfirm = async () => {
    if (!selectedTeacher) return;
    try {
      await crudRequest(
        "DELETE",
        `/recipt/delete-recipt/${selectedTeacher}`
      ).then(() => {
        setTeachers((prev) =>
          prev.filter((teacher) => teacher._id !== selectedTeacher)
        );
        setOpen(false);
        toast.success("Recipt deleted successfully");
      });
    } catch (error) {
      setError("Error deleting recipt");
      toast.error("Failed to delete recipt");
      console.error("Error deleting recipt:", error);
    }
  };

  const fetchTeachers = async (
    page: number = 1,
    limit: number = itemsPerPage,
    search: string = ""
  ) => {
    try {
      const response = await crudRequest<{
        result: Recipt[];
        totalPages: number;
        pageCount: number;
        totalUser: number;
      }>("GET", `/recipt/recipt?page=${page}&limit=${limit}&search=${search}`);
      setTeachers(response.result);
      setTotalPages(response.totalPages);
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
    <div className="w-full overflow-x-auto max-h-[500px] py-2 pb-16">
      <div className="w-full max-h-[200vh] ">
        <Table className="min-w-[800px] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">S.N</TableHead>
              <TableHead>Recipt Statement</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
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
                  <TableCell>{teacher.income}</TableCell>
                  <TableCell>{teacher.amount}</TableCell>
                  <TableCell>{teacher.paymentMethod}</TableCell>
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
      </div>

      <div className="grid grid-cols-1 gap-10 mt-5 md:grid-cols-3">
        <Select
          onValueChange={(value) => setItemsPerPage(Number(value))}
          value={itemsPerPage.toString()}
        >
          <SelectTrigger id="itemsPerPage">
            <SelectValue placeholder="Items per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>

        <Pagination className=" columns-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                isActive={currentPage === 1 ? false : true}
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                // disabled={currentPage === 1}
              />
            </PaginationItem>
            {[...Array(totalPages)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  onClick={() => handlePageChange(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() =>
                  handlePageChange(Math.min(currentPage + 1, totalPages))
                }
                isActive={currentPage === totalPages ? false : true}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
