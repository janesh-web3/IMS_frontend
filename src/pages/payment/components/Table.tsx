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
import { Skeleton } from "@/components/ui/skeleton";
import { UpdateModal } from "./UpdateModal";
import PopupModal from "@/components/shared/popup-modal";
import PaymentCreateForm from "./PaymentCreateForm";
import { Plus } from "lucide-react";
import PaymentStats from "./PaymentStats";
import AdminComponent from "@/components/shared/AdminComponent";
import { Input } from "@/components/ui/input";

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

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Teacher | null>(null);

  // Add search state
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Add debounce function
  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
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

  // Update fetchTeachers function to include search
  const fetchTeachers = async (
    page: number = 1,
    limit: number = itemsPerPage,
    search: string = searchQuery
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

  // Add debounced search handler
  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    fetchTeachers(1, itemsPerPage, value);
  }, 500);

  useEffect(() => {
    fetchTeachers(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleUpdate = async (values: Partial<Teacher>) => {
    try {
      await crudRequest(
        "PUT",
        `/payment/update-payment/${selectedPayment?._id}`,
        values
      );
      setIsUpdateModalOpen(false);
      fetchTeachers(currentPage, itemsPerPage);
    } catch (error) {
      console.error("Error updating payment:", error);
    }
  };

  if (loading) {
    return (
      <div className="w-full overflow-auto">
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
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="w-8 h-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[250px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="w-8 h-8 rounded-full" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
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
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
        <AdminComponent>
          <div className="flex gap-3">
            <PopupModal
              text="Add Payment"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <PaymentCreateForm modalClose={onClose} />
              )}
            />
          </div>
        </AdminComponent>
      </div>
        <AdminComponent>
          <PaymentStats />
        </AdminComponent>
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPayment(teacher);
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

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedPayment(null);
        }}
        onSubmit={handleUpdate}
        initialData={selectedPayment || undefined}
      />
    </>
  );
}
