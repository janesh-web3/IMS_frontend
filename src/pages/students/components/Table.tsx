import {
  Edit,
  File,
  ListFilter,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  View,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import PopupModal from "@/components/shared/popup-modal";
import StudentCreateForm from "./StudentCreateForm";
import { useEffect, useState } from "react";
import { crudRequest, moveToRecycleBin } from "@/lib/api";
import { AlertModal } from "@/components/shared/alert-modal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import StudentDetails from "./StudentDetails";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Courses } from "@/types";
import Error from "@/pages/not-found/error";
import Loading from "@/pages/not-found/loading";
import { toast } from "react-toastify";
import PremiumComponent from "@/components/shared/PremiumComponent";
import { Modal } from "@/components/ui/modal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap } from "lucide-react";
import { generateBill } from "@/components/shared/BillGenerator";
import { formatCurrency } from "@/lib/utils";

type Bill = {
  billNo: string;
  dateSubmitted: string;
  paid: string;
  method: string;
  _id: string;
};

type SubjectEnroll = {
  subjectName: {
    subjectName: string;
  };
  feeType: string;
  discount: string;
  _id: string;
};

type BooksEnroll = {
  bookName: {
    name: string;
    isFree: boolean;
    bookType: string;
  };
  price: number;
  discount: number;
  _id: string;
};

type StudentCourse = {
  courseEnroll: {
    name: string;
    _id: string;
  };
  subjectsEnroll: SubjectEnroll[];
  booksEnroll: BooksEnroll[];
  _id: string;
};

type PersonalInfo = {
  studentName: string;
  schoolName: string;
  address: string;
  dateOfBirth: string | null;
  gender: string;
  contactNo: string;
  billNo: Bill[];
  admissionNumber: string;
  paymentDeadline: string;
  guardianName: string;
  guardianContact: string;
  localGuardianName: string;
  localGuardianContact: string;
  paymentMethod: string;
  referredBy: string;
};

type Student = {
  _id: string;
  personalInfo: PersonalInfo;
  courses: StudentCourse[];
  admissionFee: number;
  tshirtFee: number;
  examFee: number;
  document: string;
  totalDiscount: number;
  paid: number;
  remaining: number;
  totalAmount: number;
  totalAfterDiscount: number;
  dateOfAdmission: string;
  photo: string;
};

type Billing = {
  amount: number;
  billNo: number;
  paymentMethod: string;
  remaining: number;
};

type StatsResponse = {
  total: {
    allStudents: number;
    filteredStudents: number;
  };
  genderCounts: {
    male: number;
    female: number;
    other: number;
  };
  feeStatus: {
    complete: number;
    incomplete: number;
  };
  financial: {
    totalAmount: number;
    totalPaid: number;
    totalRemaining: number;
  };
};

export function StudentTable() {
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [filterFeeComplete, setFilterFeeComplete] = useState<boolean | null>(
    null
  );
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courses, setCourses] = useState<Courses[]>([]);
  const [stats, setStats] = useState({
    total: {
      allStudents: 0,
      filteredStudents: 0,
    },
    genderCounts: {
      male: 0,
      female: 0,
      other: 0,
    },
    feeStatus: {
      complete: 0,
      incomplete: 0,
    },
    financial: {
      totalAmount: 0,
      totalPaid: 0,
      totalRemaining: 0,
    },
  });

  // Add the generateBill function
  const generateStudentBill = (studentData: any) => {
    generateBill({
      title: "Fee Receipt",
      billNo: studentData.billNo,
      recipientName: studentData.studentName,
      amount: studentData.amount,
      paymentMethod: studentData.method,
      description: "Fee payment",
      type: "fee",
      additionalDetails: [
        {
          label: "Remaining Amount",
          value: formatCurrency(studentData.remaining),
        },
      ],
    });
  };

  //Update fee and billing
  const [updateFee, setUpdateFee] = useState<Billing>({
    amount: 0,
    billNo: 0,
    paymentMethod: "",
    remaining: 0,
  });

  const handleBillingChange = (name: string, value: any) => {
    setUpdateFee((prev) => ({ ...prev, [name]: value }));
  };

  const submitBilling = async (student: Student) => {
    if (!updateFee.amount || !updateFee.billNo || !updateFee.paymentMethod) {
      toast.error("Please fill all required fields");
      return;
    }

    console.log(student.remaining, updateFee.amount);
    if (updateFee.amount > student.remaining) {
      toast.error("Paid amount cannot be greater than remaining amount");
      return;
    }

    //  Prepare the notification payload
    const notificationPayload = {
      title: "Student Billing",
      message: `Rs. ${updateFee.amount} amount is billed by ${name}.`,
      type: "Student",
      forRoles: ["admin", "superadmin"],
      push: true,
      sound: true,
    };

    try {
      await crudRequest<Billing>(
        "PUT",
        `/student/update-student-cash/${student._id}`,
        updateFee
      ).then(() => {
        toast.success("Fee Updated successfully");
      });
      await crudRequest(
        "POST",
        "/notification/add-notification",
        notificationPayload
      );
      // Generate and print bill
      const studentBillData = {
        studentName: student.personalInfo.studentName,
        billNo: updateFee.billNo,
        amount: updateFee.amount,
        method: updateFee.paymentMethod,
        remaining: student.remaining,
      };

      generateStudentBill(studentBillData);

      setUpdateFee({
        amount: 0,
        billNo: 0,
        paymentMethod: "",
        remaining: 0,
      });
    } catch (error) {
      console.error("Error updating fee:", error);
    }
  };

  //pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10); // Customize this based on your requirement

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    fetchStudent(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  //search functionality
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    photo: true,
    name: true,
    status: true,
    contact: true,
    address: true,
    dateOfBirth: false,
  });

  const toggleColumnVisibility = (column: keyof typeof columnVisibility) => {
    setColumnVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };
  const onConfirm = async () => {
    if (!studentToDelete) return;

    try {
      const success = await moveToRecycleBin("Student", studentToDelete);
      if (success) {
        setStudent((prev) => prev.filter((s) => s._id !== studentToDelete));
        setFilteredStudents((prev) =>
          prev.filter((s) => s._id !== studentToDelete)
        );
        setOpen(false);
        setStudentToDelete(null);
      }
    } catch (error) {
      console.error("Error moving student to recycle bin:", error);
    }
  };

  const fetchStudent = async (
    page: number = 1,
    limit: number = itemsPerPage,
    search: string = ""
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await crudRequest<{
        result: Student[];
        totalPages: number;
        pageCount: number;
        totalUser: number;
      }>(
        "GET",
        `/student/get-pagination-students?page=${page}&limit=${limit}&search=${search}`
      );
      if (response && Array.isArray(response.result)) {
        setStudent(response.result);
        setFilteredStudents(response.result);
        setTotalPages(response.totalPages);
      } else {
        setError("Unexpected response format");
      }
    } catch (error) {
      setError("Error fetching student data");
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await crudRequest<Courses[]>(
        "GET",
        "/course/get-course"
      );
      if (response && Array.isArray(response)) {
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
    fetchStudent(currentPage, itemsPerPage, searchQuery);
    fetchCourses();
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    let filtered = student;

    // Filter by gender
    if (selectedTab !== "all") {
      filtered = filtered.filter(
        (s) => s.personalInfo.gender.toLowerCase() === selectedTab.toLowerCase()
      );
    }

    // Filter by fee status
    if (filterFeeComplete !== null) {
      filtered = filtered.filter((s) =>
        filterFeeComplete ? s.remaining === 0 : s.remaining > 0
      );
    }
    // Filter by selected courses
    if (selectedCourses.length > 0) {
      filtered = filtered.filter((s) =>
        selectedCourses.some((courseId) =>
          s.courses.some((course) => course.courseEnroll._id === courseId)
        )
      );
    }

    setFilteredStudents(filtered);
  }, [selectedTab, filterFeeComplete, selectedCourses, student]);

  useEffect(() => {
    setFilteredStudents(student);
  }, [student]);

  // if (error)
  //   return (
  //     <div>
  //       <Error />
  //     </div>
  //   );

  // AI MODEL SETUP

  const [response, setResponse] = useState<string>();
  const [generate, setGenerate] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  type ResponseElement = JSX.Element;

  const formatResponse = (text: string): JSX.Element => {
    const lines = text.split("\n"); // Split into lines for processing
    const elements: ResponseElement[] = []; // Define as an array of JSX elements

    lines.forEach((line, index) => {
      if (line.startsWith("***")) {
        // Handle `***` as a styled heading or separator
        elements.push(
          <h2 key={index} className="mt-4 text-xl font-semibold">
            {line.replace("***", "").trim()}
          </h2>
        );
      } else if (line.startsWith("*") || line.startsWith("-")) {
        const bullet = line.replace(/^\*+|-+/, "").trim();
        elements.push(
          <li key={index} className="ml-6 list-disc">
            {bullet}
          </li>
        );
      } else if (line.startsWith("**")) {
        {
          line.replace("**", "").trim();
        }
      } else {
        // Default handling for regular text
        elements.push(
          <p key={index} className="mb-2">
            {line}
          </p>
        );
      }
    });

    return <div>{elements}</div>;
  };

  const onClose = () => {
    setGenerate(false);
  };

  const preparePrompt = (student: Student) => {
    return `
    Summarize the student record:
    Name: ${student.personalInfo.studentName}
    Gender: ${student.personalInfo.gender}
    School: ${student.personalInfo.schoolName}
    Address: ${student.personalInfo.address}
    Contact: ${student.personalInfo.contactNo}
    Guardian Name: ${student.personalInfo.guardianName}
    Guardian Number: ${student.personalInfo.guardianContact}
   Local Guardian Name: ${student.personalInfo.localGuardianName}
   Local Guardian Number: ${student.personalInfo.localGuardianContact}
    Admission Number: ${student.personalInfo.admissionNumber}
    Total Paid: ${student.paid}
    Outstanding Balance: ${student.remaining}
    admissionFee: ${student.admissionFee}
    tshirtFee: ${student.tshirtFee}
    examFee: ${student.examFee}
    totalDiscount: ${student.totalDiscount}
    totalAmount: ${student.totalAmount}
    totalAfterDiscount: ${student.totalAfterDiscount}
    dateOfAdmission: ${student.dateOfAdmission}
    Payment History:
    ${student.personalInfo.billNo
      .map(
        (bill) =>
          `- Bill No: ${bill.billNo}, Paid: ${bill.paid}, Method: ${bill.method}`
      )
      .join("\n")}
      Courses Taken : ${student.courses.map(
        (course) => `- Courses Enroll: ${course.courseEnroll.name}
        - Subject Taken: ${course.subjectsEnroll.map(
          (subject) => `- Subject Enroll : ${subject.subjectName?.subjectName}
          
        -Discount : ${subject.discount}`
        )}
        - Book Taken : ${course.booksEnroll.map(
          (book) =>
            `- Book Name : ${book.bookName.name}
            - Book Price : ${book.price}
            - Book Type : ${book.bookName.bookType}
            - Book Discount: ${book.discount}
            - Book Status : ${book.bookName.isFree ? "Free" : "Paid"}`
        )}`
      )}
        


    Generate an overview and any insights.
  `;
  };

  const handleGenerateReport = async (studentData: Student) => {
    const prompt = preparePrompt(studentData);
    setGenerate(true);
    try {
      setGenerating(true);
      const response = await crudRequest<{ data: string }>(
        "POST",
        "/gemini/get-response",
        { prompt }
      );
      setResponse(response.data);
      setGenerating(false);
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const params = new URLSearchParams();

      if (selectedCourses.length > 0) {
        selectedCourses.forEach((courseId) => {
          params.append("courseIds", courseId);
        });
      }

      if (selectedTab !== "all") {
        params.append("gender", selectedTab);
      }

      if (filterFeeComplete !== null) {
        params.append(
          "feeStatus",
          filterFeeComplete ? "complete" : "incomplete"
        );
      }

      const response = await crudRequest<StatsResponse>(
        "GET",
        `/student/stats?${params.toString()}`
      );
      setStats(response);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [selectedTab, filterFeeComplete, selectedCourses]);

  const renderStats = () => (
    <div className="grid grid-cols-2 gap-4 p-2 md:grid-cols-4">
      <Card className="p-4">
        <div className="flex flex-col space-y-1">
          <p className="text-sm text-muted-foreground">Total Students</p>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{stats.total.allStudents}</h2>
            <span className="text-xs text-muted-foreground">
              ({stats.total.filteredStudents} filtered)
            </span>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col space-y-1">
          <p className="text-sm text-muted-foreground">Gender Distribution</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="font-semibold">{stats.genderCounts.male}</p>
              <p className="text-xs text-muted-foreground">Male</p>
            </div>
            <div>
              <p className="font-semibold">{stats.genderCounts.female}</p>
              <p className="text-xs text-muted-foreground">Female</p>
            </div>
            <div>
              <p className="font-semibold">{stats.genderCounts.other}</p>
              <p className="text-xs text-muted-foreground">Other</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col space-y-1">
          <p className="text-sm text-muted-foreground">Fee Status</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="font-semibold">{stats.feeStatus.complete}</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div>
              <p className="font-semibold">{stats.feeStatus.incomplete}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex flex-col space-y-1">
          <p className="text-sm text-muted-foreground">Financial Overview</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Total:</span>
              <span className="font-semibold">
                ₹{stats.financial.totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Paid:</span>
              <span className="font-semibold text-green-600">
                ₹{stats.financial.totalPaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Due:</span>
              <span className="font-semibold text-red-600">
                ₹{stats.financial.totalRemaining.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStudentTable = () => (
    <Card className="py-2 md:py-4">
      <CardHeader>
        <CardTitle>Students</CardTitle>
        <CardDescription>
          Manage your students and view their details.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full max-h-[200vh]">
          <Table>
            <TableHeader>
              <TableRow>
                {columnVisibility.photo && (
                  <TableHead className="table-cell">
                    <span>Photo</span>
                  </TableHead>
                )}
                {columnVisibility.name && (
                  <TableHead className="table-cell">Name</TableHead>
                )}
                {columnVisibility.status && (
                  <TableHead className="table-cell">Status</TableHead>
                )}
                {columnVisibility.contact && (
                  <TableHead className="table-cell">Contact</TableHead>
                )}
                {columnVisibility.address && (
                  <TableHead className="table-cell">Address</TableHead>
                )}
                {columnVisibility.dateOfBirth && (
                  <TableHead className="table-cell">Date of Birth</TableHead>
                )}
                <TableHead className="table-cell">Billing</TableHead>
                <PremiumComponent>
                  <TableHead className="table-cell">AI</TableHead>
                </PremiumComponent>
                <TableHead className="table-cell">
                  <span>Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow className="table-cell">
                  <TableCell colSpan={7}>No student a vailable</TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
                  <TableRow key={index}>
                    {columnVisibility.photo && (
                      <TableCell className="table-cell">
                        <img
                          alt="/profile.jpg"
                          className="object-cover rounded-md aspect-square"
                          height="64"
                          src={student.photo ? student.photo : "/profile.jpg"}
                          width="64"
                        />
                      </TableCell>
                    )}
                    {columnVisibility.name && (
                      <TableCell className="table-cell font-medium">
                        {student.personalInfo.studentName}
                      </TableCell>
                    )}
                    {columnVisibility.status && (
                      <TableCell className="table-cell">
                        <Badge
                          variant={
                            student.remaining === 0 ? "default" : "destructive"
                          }
                        >
                          {student.remaining === 0
                            ? "Fee Complete"
                            : "Fee Incomplete"}
                        </Badge>
                      </TableCell>
                    )}
                    {columnVisibility.contact && (
                      <TableCell className="table-cell">
                        {student.personalInfo.contactNo}
                      </TableCell>
                    )}
                    {columnVisibility.address && (
                      <TableCell className="table-cell">
                        {student.personalInfo.address}
                      </TableCell>
                    )}
                    {columnVisibility.dateOfBirth && (
                      <TableCell className="table-cell">
                        {student.personalInfo.dateOfBirth}
                      </TableCell>
                    )}

                    <Sheet>
                      <TableCell className="table-cell">
                        <SheetTrigger asChild>
                          <Button variant="outline">Update Fee</Button>
                        </SheetTrigger>
                      </TableCell>

                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Update Fee</SheetTitle>
                          <SheetDescription>
                            Update fee for {student.personalInfo.studentName}
                          </SheetDescription>
                        </SheetHeader>
                        <div className="grid gap-4 py-4">
                          <div className="items-center gap-4">
                            <Label htmlFor="remaining" className="text-right">
                              Total Remaining Amount
                            </Label>
                            <Input
                              id="remaining"
                              readOnly
                              value={student.remaining}
                              className="col-span-3"
                            />
                          </div>
                          <div className="items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                              Paid Amount *
                            </Label>
                            <Input
                              id="amount"
                              type="number"
                              value={updateFee.amount || ""}
                              onChange={(e) =>
                                handleBillingChange(
                                  "amount",
                                  Number(e.target.value)
                                )
                              }
                              placeholder="Enter paid amount"
                              className="col-span-3"
                              required
                            />
                            {updateFee.amount > student.remaining && (
                              <p className="text-sm text-red-500">
                                Amount cannot exceed remaining balance of{" "}
                                {student.remaining}
                              </p>
                            )}
                          </div>
                          <div className="items-center gap-4">
                            <Label htmlFor="billNo" className="text-right">
                              Bill No *
                            </Label>
                            <Input
                              id="billNo"
                              type="number"
                              value={updateFee.billNo || ""}
                              onChange={(e) =>
                                handleBillingChange(
                                  "billNo",
                                  Number(e.target.value)
                                )
                              }
                              placeholder="Enter bill number"
                              className="col-span-3"
                              required
                            />
                          </div>
                          <div className="items-center gap-4">
                            <Label
                              htmlFor="paymentMethod"
                              className="text-right"
                            >
                              Payment Method *
                            </Label>
                            <Select
                              onValueChange={(value) =>
                                handleBillingChange("paymentMethod", value)
                              }
                              value={updateFee.paymentMethod}
                            >
                              <SelectTrigger id="paymentMethod">
                                <SelectValue placeholder="Select Payment Method" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Online">Online</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <SheetFooter>
                          <SheetClose asChild>
                            <Button
                              type="submit"
                              onClick={() => submitBilling(student)}
                              disabled={
                                !updateFee.amount ||
                                !updateFee.billNo ||
                                !updateFee.paymentMethod ||
                                updateFee.amount > student.remaining
                              }
                            >
                              Update Fee
                            </Button>
                          </SheetClose>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                    <PremiumComponent>
                      <TableCell className="table-cell">
                        <button
                          onClick={() => handleGenerateReport(student)}
                          className="flex items-center gap-2 px-2 py-1 font-semibold text-white transition-all transform rounded-full shadow-lg bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hover:from-indigo-500 hover:to-blue-500 hover:scale-105 hover:shadow-2xl"
                        >
                          <Zap className="w-5 h-5 text-teal-400" />
                          Report
                        </button>
                      </TableCell>
                    </PremiumComponent>

                    <TableCell className="table-cell">
                      <Drawer>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-8 h-8 p-0">
                              <MoreHorizontal className="w-6 h-6" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="cursor-pointer"
                          >
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="flex justify-between cursor-pointer"
                              onClick={() =>
                                navigate(`/student/update/${student._id}`)
                              }
                            >
                              Edit <Edit size={17} />
                            </DropdownMenuItem>
                            <DrawerTrigger asChild>
                              <DropdownMenuItem className="flex justify-between cursor-pointer">
                                View <View size={17} />
                              </DropdownMenuItem>
                            </DrawerTrigger>
                            <DropdownMenuItem
                              onClick={() => {
                                setOpen(true);
                                setStudentToDelete(student._id);
                              }}
                              className="flex justify-between cursor-pointer"
                            >
                              Delete
                              <Trash size={17} />
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <AlertModal
                          isOpen={open}
                          onClose={() => {
                            setOpen(false);
                            setStudentToDelete(null);
                          }}
                          onConfirm={onConfirm}
                          loading={loading}
                          title="Delete Student"
                          description="Are you sure you want to delete this student?"
                        />
                        <DrawerContent className="z-50">
                          <div className="w-full max-h-[80vh] mx-auto overflow-auto max-w-7xl">
                            <DrawerHeader>
                              <DrawerTitle>Student Details</DrawerTitle>
                              <DrawerDescription>
                                See details about{" "}
                                {student.personalInfo.studentName}
                              </DrawerDescription>
                            </DrawerHeader>
                            <div className="p-4 pb-0">
                              <StudentDetails {...student} />
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <div className="grid grid-cols-1 gap-10 mt-3 md:mt-5 md:grid-cols-3">
            <Select
              onValueChange={(value) => setItemsPerPage(Number(value))}
              value={itemsPerPage.toString()}
            >
              <SelectTrigger id="itemsPerPage">
                <SelectValue placeholder="Items per page" />
              </SelectTrigger>
              <SelectContent className="cursor-pointer">
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
                    className="cursor-pointer"
                    isActive={currentPage === 1 ? false : true}
                    onClick={() =>
                      handlePageChange(Math.max(currentPage - 1, 1))
                    }
                    // disabled={currentPage === 1}
                  />
                </PaginationItem>
                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      className="cursor-pointer"
                      onClick={() => handlePageChange(index + 1)}
                      isActive={currentPage === index + 1}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    className="cursor-pointer"
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
      </CardContent>
      <CardFooter className="flex justify-between">
        {/* ... any footer content ... */}
      </CardFooter>
    </Card>
  );

  // Function to convert data to CSV and download
  const exportToCSV = () => {
    const csvRows = [];

    // Add the headers to the CSV
    const headers = [];
    if (columnVisibility.photo) headers.push("Photo");
    if (columnVisibility.name) headers.push("Name");
    if (columnVisibility.status) headers.push("Status");
    if (columnVisibility.contact) headers.push("Contact");
    if (columnVisibility.address) headers.push("Address");
    if (columnVisibility.dateOfBirth) headers.push("Date of Birth");
    csvRows.push(headers.join(","));

    // Add the rows of data
    filteredStudents.forEach((student) => {
      const row = [];
      if (columnVisibility.photo) row.push(student.photo);
      if (columnVisibility.name) row.push(student.personalInfo.studentName);
      if (columnVisibility.status)
        row.push(student.remaining === 0 ? "Fee Complete" : "Fee Incomplete");
      if (columnVisibility.contact) row.push(student.personalInfo.contactNo);
      if (columnVisibility.address) row.push(student.personalInfo.address);
      if (columnVisibility.dateOfBirth)
        row.push(student.personalInfo.dateOfBirth);
      csvRows.push(row.join(","));
    });

    // Convert rows to CSV string
    const csvString = csvRows.join("\n");

    // Create a blob and trigger a download
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "students.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex flex-col flex-1 sm:gap-4 sm:py-4">
        <header className="sticky top-0 z-30 flex items-center gap-4 px-4 border-b h-14 bg-background sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="#">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="#">Students</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>All Students</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="relative flex-1 mx-2 ml-auto md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          {renderStats()}
          <Tabs defaultValue="all" value={selectedTab} className="p-2">
            <div className="flex flex-wrap items-center gap-2">
              <TabsList>
                <TabsTrigger value="all" onClick={() => setSelectedTab("all")}>
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="male"
                  onClick={() => setSelectedTab("male")}
                >
                  Male
                </TabsTrigger>
                <TabsTrigger
                  value="female"
                  onClick={() => setSelectedTab("female")}
                >
                  Female
                </TabsTrigger>
                <TabsTrigger
                  value="other"
                  onClick={() => setSelectedTab("other")}
                >
                  Other
                </TabsTrigger>
              </TabsList>
              <div className="flex flex-wrap  items-center gap-2 ml-auto">
                {/* Filter by fee */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="">Filter by Fee</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by fee</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={filterFeeComplete === null}
                      onCheckedChange={() => setFilterFeeComplete(null)}
                    >
                      All
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterFeeComplete === true}
                      onCheckedChange={() => setFilterFeeComplete(true)}
                    >
                      Fee Complete
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={filterFeeComplete === false}
                      onCheckedChange={() => setFilterFeeComplete(false)}
                    >
                      Fee Incomplete
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* filter by course */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span>Filter by Course</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by Course</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {courses &&
                      courses.map((course, index) => (
                        <DropdownMenuCheckboxItem
                          key={index}
                          checked={selectedCourses.includes(course._id)}
                          onCheckedChange={(checked) => {
                            setSelectedCourses((prev) =>
                              checked
                                ? [...prev, course._id]
                                : prev.filter((id) => id !== course._id)
                            );
                          }}
                        >
                          {course.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 ml-2 md:h-9"
                    >
                      Columns
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <DropdownMenuLabel>Select Columns</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.photo}
                      onCheckedChange={() => toggleColumnVisibility("photo")}
                    >
                      Photo
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.name}
                      onCheckedChange={() => toggleColumnVisibility("name")}
                    >
                      Name
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.status}
                      onCheckedChange={() => toggleColumnVisibility("status")}
                    >
                      Status
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.contact}
                      onCheckedChange={() => toggleColumnVisibility("contact")}
                    >
                      Contact
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.address}
                      onCheckedChange={() => toggleColumnVisibility("address")}
                    >
                      Address
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={columnVisibility.dateOfBirth}
                      onCheckedChange={() =>
                        toggleColumnVisibility("dateOfBirth")
                      }
                    >
                      Date of Birth
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <PremiumComponent>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1"
                    onClick={exportToCSV}
                  >
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Export
                    </span>
                  </Button>
                </PremiumComponent>
                <PopupModal
                  text="Add Student"
                  icon={<Plus className="w-4 h-4 mr-2" />}
                  renderModal={(onClose) => (
                    <StudentCreateForm modalClose={onClose} />
                  )}
                />
                {generate && (
                  <Modal
                    isOpen={generate}
                    onClose={onClose}
                    className={
                      "bg-card !px-1 w-full min-w-[300px] max-w-[1000px] overflow-y-auto"
                    }
                  >
                    <ScrollArea>
                      {generating ? (
                        <div className="text-xl text-center">
                          Report Generating ...
                        </div>
                      ) : (
                        <>
                          <h2 className="text-xl font-medium text-center">
                            Student Report
                          </h2>
                          <div className="p-4 mt-4 max-h-[50vh]">
                            {response && formatResponse(response)}
                          </div>
                        </>
                      )}
                    </ScrollArea>
                  </Modal>
                )}
              </div>
            </div>

            {loading ? (
              <div>
                <Loading />
              </div>
            ) : error ? (
              <div>
                <Error />
              </div>
            ) : (
              <div className="overflow-auto">
                <TabsContent value={selectedTab}>
                  {renderStudentTable()}
                </TabsContent>
              </div>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  );
}
