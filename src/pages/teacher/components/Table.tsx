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
import { MoreHorizontal, Trash, View, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Error from "@/pages/not-found/error";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import TeacherUpdateForm from "./TeacherUpdateForm";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import TeacherDetails from "./TeacherDetails";
import { SalaryPaymentForm } from "./SalaryPaymentForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import AdminComponent from "@/components/shared/AdminComponent";

type Teacher = {
  _id: string;
  name: string;
  contactNo: string;
  monthlySalary: string | null;
  percentage: string;
  photo: string[];
  courses: Array<{
    courseEnroll: {
      _id: string;
      name: string;
      subjects: string[];
      deleted: boolean;
      enabled: boolean;
    };
    subjectsEnroll: Array<{
      subjectName: {
        _id: string;
        subjectName: string;
        monthlyFee: string;
        regularFee: string;
        deleted: boolean;
        enabled: boolean;
      };
      _id: string;
    }>;
    _id: string;
  }>;
  enabled: boolean;
  deleted: boolean;
  invoices: any[];
};

export function TeacherTable() {
  const [teacher, setTeacher] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showSalaryModal, setShowSalaryModal] = useState<boolean>(false);

  const onConfirm = async (id: string) => {
    try {
      const success = await moveToRecycleBin("Faculty", id);
      if (success) {
        setTeacher((prev) => prev.filter((t) => t._id !== id));
        setOpen(false);
      }
    } catch (error) {
      console.error("Error moving teacher to recycle bin:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await crudRequest<Teacher[]>(
        "GET",
        "/faculty/get-faculty"
      );
      if (response && Array.isArray(response)) {
        setTeacher(response);
      } else {
        setError("Unexpected response format");
      }
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

  const handleSalaryPayment = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowSalaryModal(true);
  };

  if (error) return <Error />;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">S.N</TableHead>
            <TableHead>Teacher Name</TableHead>
            <TableHead>Contact Number</TableHead>
            <TableHead>Monthly Salary</TableHead>
            <TableHead>Percentage</TableHead>
            <AdminComponent>
              <TableHead>Update</TableHead>
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
                  <Skeleton className="h-4 w-[200px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-9 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-9 w-[40px]" />
                </TableCell>
              </TableRow>
            ))
          ) : teacher.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7}>No teachers available</TableCell>
            </TableRow>
          ) : (
            teacher.map((teacher, index) => (
              <TableRow key={teacher._id}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.contactNo}</TableCell>
                <TableCell>{teacher.monthlySalary}</TableCell>
                <TableCell>{teacher.percentage}</TableCell>
                <AdminComponent>
                  <Sheet>
                    <TableCell>
                      <SheetTrigger asChild>
                        <Button variant="outline">Update</Button>
                      </SheetTrigger>
                    </TableCell>
                    <SheetContent className="overflow-auto">
                      <SheetHeader>
                        <SheetTitle>Update Teacher</SheetTitle>
                        <SheetDescription>
                          Fill the data correctly to update teacher.
                        </SheetDescription>
                      </SheetHeader>
                      <TeacherUpdateForm id={teacher._id} />
                    </SheetContent>
                  </Sheet>

                  <TableCell className="cursor-pointer">
                    <Drawer>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="w-8 h-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>

                          <DrawerTrigger asChild>
                            <DropdownMenuItem className="cursor-pointer">
                              <View className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                          </DrawerTrigger>

                          <DropdownMenuItem
                            onClick={() => handleSalaryPayment(teacher)}
                            className="cursor-pointer"
                          >
                            <DollarSign className="w-4 h-4 mr-2" /> Pay Salary
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => setOpen(true)}
                            className="cursor-pointer"
                          >
                            <Trash className="w-4 h-4 mr-2" /> Move to Recycle
                            Bin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertModal
                        isOpen={open}
                        onClose={() => setOpen(false)}
                        onConfirm={() => onConfirm(teacher._id)}
                        loading={loading}
                      />
                      <DrawerContent className="z-50">
                        <div className="w-full max-h-[80vh] mx-auto overflow-auto max-w-7xl">
                          <DrawerHeader>
                            <DrawerTitle>Teacher Details</DrawerTitle>
                            <DrawerDescription>
                              See details about {teacher.name}
                            </DrawerDescription>
                          </DrawerHeader>
                          <div className="p-4 pb-0">
                            <TeacherDetails {...teacher} />
                          </div>
                          <DrawerFooter>
                            <DrawerClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      </DrawerContent>
                    </Drawer>
                  </TableCell>
                </AdminComponent>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={showSalaryModal} onOpenChange={setShowSalaryModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay Salary - {selectedTeacher?.name}</DialogTitle>
            <DialogDescription>
              Enter salary payment details below
            </DialogDescription>
          </DialogHeader>
          {selectedTeacher && (
            <SalaryPaymentForm
              teacher={selectedTeacher}
              onSuccess={() => {
                setShowSalaryModal(false);
                fetchTeachers(); // Refresh the teacher list
              }}
              onCancel={() => setShowSalaryModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
