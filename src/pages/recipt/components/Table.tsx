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
import ReciptCreateForm from "./ReciptCreateForm";
import { Plus } from "lucide-react";
import ReciptStats from "./ReciptStats";
import AdminComponent from "@/components/shared/AdminComponent";
import { Input } from "@/components/ui/input";

type Recipt = {
  _id: string;
  income: string;
  amount: string;
  paymentMethod: number;
};

export function ReciptTable() {
  const [recipts, setRecipts] = useState<Recipt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedRecipt, setSelectedRecipt] = useState<Recipt | null>(null);

  //pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const [searchQuery, setSearchQuery] = useState<string>("");

  const onConfirm = async (id: string) => {
    try {
      const success = await moveToRecycleBin("Recipt", id);
      if (success) {
        setOpen(false);
      } else {
        setOpen(false);
      }
    } catch (error) {
      console.error("Error deleting recipt:", error);
    }
  };

  const fetchRecipts = async (
    page: number = 1,
    limit: number = itemsPerPage,
    search: string = searchQuery
  ) => {
    try {
      const response = await crudRequest<{
        result: Recipt[];
        totalPages: number;
        pageCount: number;
        totalUser: number;
      }>("GET", `/recipt/recipt?page=${page}&limit=${limit}&search=${search}`);
      setRecipts(response.result);
      setTotalPages(response.totalPages);
    } catch (error) {
      setError("Error fetching receipt data");
      console.error("Error fetching receipt data:", error);
    } finally {
      setLoading(false);
    }
  };

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = debounce((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
    fetchRecipts(1, itemsPerPage, value);
  }, 500);

  useEffect(() => {
    fetchRecipts(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleUpdate = async (values: Partial<Recipt>) => {
    try {
      await crudRequest(
        "PUT",
        `/recipt/update-recipt/${selectedRecipt?._id}`,
        values
      );
      setIsUpdateModalOpen(false);
      fetchRecipts(currentPage, itemsPerPage);
    } catch (error) {
      console.error("Error updating receipt:", error);
    }
  };

  if (error) return <Error />;

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
              text="Add Recipt"
              icon={<Plus className="w-4 h-4 mr-2" />}
              renderModal={(onClose) => (
                <ReciptCreateForm modalClose={onClose} />
              )}
            />
          </div>
        </AdminComponent>
      </div>
        <AdminComponent>
          <ReciptStats />
        </AdminComponent>
      <div className="w-full">
        <div className="w-full ">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">S.N</TableHead>
                <TableHead>Recipt Statement</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <AdminComponent>
                  <TableHead>Actions</TableHead>
                </AdminComponent>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, index) => (
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
                ))
              ) : recipts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>No receipt available</TableCell>
                </TableRow>
              ) : (
                recipts.map((recipt, index) => (
                  <TableRow key={recipt._id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{recipt.income}</TableCell>
                    <TableCell>{recipt.amount}</TableCell>
                    <TableCell>{recipt.paymentMethod}</TableCell>
                    <AdminComponent>
                      <TableCell className="cursor-pointer">
                        <AlertModal
                          isOpen={open}
                          onClose={() => setOpen(false)}
                          onConfirm={() => onConfirm(recipt._id)}
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
                                setSelectedRecipt({
                                  _id: recipt._id,
                                  income: recipt.income,
                                  amount: recipt.amount,
                                  paymentMethod: recipt.paymentMethod,
                                });
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
                    </AdminComponent>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="grid grid-cols-1 gap-10 mt-5 mb-10 md:mb-20 md:grid-cols-3">
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
          setSelectedRecipt(null);
        }}
        onSubmit={handleUpdate}
        initialData={selectedRecipt || undefined}
      />
    </>
  );
}
