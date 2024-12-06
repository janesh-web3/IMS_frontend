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

type Teacher = {
  _id: string;
  expense: string;
  amount: string;
  paymentMethod: number;
};

export function PaymentTable() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);

  //pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const onConfirm = async (id: string) => {
    try {
      const success = await moveToRecycleBin("Payment", id);
      if (success) {
        setOpen(false);
      } else {
        setOpen(false);
      }
    } catch (error) {
      setError("Error deleting payment");
      console.error("Error deleting payment:", error);
    }
  };

  const fetchTeachers = async (
    page: number = 1,
    limit: number = itemsPerPage,
    search: string = ""
  ) => {
    try {
      const response = await crudRequest<{
        result: Teacher[];
        totalPages: number;
        pageCount: number;
        totalUser: number;
      }>(
        "GET",
        `/payment/payment?page=${page}&limit=${limit}&search=${search}`
      );
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
    <div className="w-full overflow-auto max-h-[700px] md:max-h-[500px] md:py-2">
      <div className="w-full max-h-[200vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">S.N</TableHead>
              <TableHead>Payment Statement</TableHead>
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
                  <TableCell>{teacher.expense}</TableCell>
                  <TableCell>{teacher.amount}</TableCell>
                  <TableCell>{teacher.paymentMethod}</TableCell>
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
                        <DropdownMenuItem className="cursor-pointer">
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

      <div className="grid grid-cols-1 gap-10 mt-3 mb-10 md:mb-20 md:mt-5 md:grid-cols-3">
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
