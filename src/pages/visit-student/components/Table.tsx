import {
  File,
  ListFilter,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  View,
  Edit,
} from "lucide-react";

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
import { Link } from "react-router-dom";
import PopupModal from "@/components/shared/popup-modal";
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

import { Courses } from "@/types";
import VisitStudentDetails from "./VisitStudentDetails";
import VisitStudentCreateForm from "./VisitStudentCreateForm";
import Error from "@/pages/not-found/error";
import PremiumComponent from "@/components/shared/PremiumComponent";
import VisitStats from "./VisitStats";
import AdminComponent from "@/components/shared/AdminComponent";
import { UpdateModal } from "./UpdateModal";
import { toast } from "react-toastify";

type VisitStudent = {
  _id: string;
  studentName: string;
  studentNumber: string;
  address: string;
  gender: string;
  dateOfVisit: string;
  courses: StudentCourse[];
  photo?: string;
  schoolName: string;
};

type SubjectEnroll = {
  _id: string;
  subjectName: { _id: string; subjectName: string };
};

type StudentCourse = {
  _id: string;
  courseEnroll: { _id: string; name: string };
  subjectsEnroll: SubjectEnroll[];
};

export function VisitStudentTable() {
  const [student, setStudent] = useState<VisitStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<VisitStudent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<string>("all");
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [courses, setCourses] = useState<Courses[]>([]);

  //pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10); // Keep only the value

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
    gender: true,
    contact: true,
    address: true,
    schoolName: false,
    dateOfVisit: true,
  });

  const toggleColumnVisibility = (column: keyof typeof columnVisibility) => {
    setColumnVisibility((prevState) => ({
      ...prevState,
      [column]: !prevState[column],
    }));
  };

  const onConfirm = async (id: string) => {
    try {
      const success = await moveToRecycleBin("Visit", id);
      if (success) {
        setOpen(false);
      } else {
        setOpen(false);
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    } finally {
      setOpen(false);
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
        result: VisitStudent[];
        totalPages: number;
        pageCount: number;
        totalUser: number;
      }>("GET", `/visit/visit?page=${page}&limit=${limit}&search=${search}`);
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
        (s) => s.gender.toLowerCase() === selectedTab.toLowerCase()
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
  }, [selectedTab, selectedCourses, student]);

  useEffect(() => {
    setFilteredStudents(student);
  }, [student]);

  // if (error) return <div>{error}</div>;

  const renderStudentTable = () => (
    <Table>
      <TableHeader className="sticky top-0 bg-background">
        <TableRow>
          {columnVisibility.name && <TableHead>Name</TableHead>}
          {columnVisibility.gender && <TableHead>Gender</TableHead>}
          {columnVisibility.contact && <TableHead>Contact</TableHead>}
          {columnVisibility.address && <TableHead>Address</TableHead>}
          {columnVisibility.schoolName && <TableHead>School</TableHead>}
          {columnVisibility.dateOfVisit && <TableHead>Visit Date</TableHead>}
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredStudents.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7}>No student a vailable</TableCell>
          </TableRow>
        ) : (
          filteredStudents.map((student, index) => (
            <TableRow key={index}>
              {columnVisibility.name && (
                <TableCell className="font-medium">
                  {student.studentName}
                </TableCell>
              )}

              {columnVisibility.contact && (
                <TableCell className="table-cell">
                  {student.studentNumber}
                </TableCell>
              )}
              {columnVisibility.schoolName && (
                <TableCell className="table-cell">
                  {student.schoolName}
                </TableCell>
              )}
              {columnVisibility.gender && (
                <TableCell className="table-cell">{student.gender}</TableCell>
              )}
              {columnVisibility.address && (
                <TableCell className="table-cell">{student.address}</TableCell>
              )}
              {columnVisibility.dateOfVisit && (
                <TableCell className="table-cell">
                  <span>
                    {new Date(student.dateOfVisit).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </TableCell>
              )}

              <TableCell>
                <Drawer>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-8 h-8 p-0">
                        <MoreHorizontal className="w-6 h-6" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="cursor-pointer">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DrawerTrigger asChild>
                        <DropdownMenuItem className="flex justify-between cursor-pointer">
                          View <View size={17} />
                        </DropdownMenuItem>
                      </DrawerTrigger>
                      <AdminComponent>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedStudent(student);
                            setIsUpdateModalOpen(true);
                          }}
                          className="flex justify-between cursor-pointer"
                        >
                          Update <Edit size={17} />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setOpen(true);
                          }}
                          className="flex justify-between cursor-pointer"
                        >
                          Delete <Trash size={17} />
                        </DropdownMenuItem>
                      </AdminComponent>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <AlertModal
                    isOpen={open}
                    onClose={() => setOpen(false)}
                    onConfirm={() => onConfirm(student._id)}
                    loading={loading}
                    title="Delete Student"
                    description="Are you sure you want to delete this student?"
                  />
                  <DrawerContent className="z-50">
                    <div className="w-full max-h-[80vh] mx-auto overflow-auto max-w-7xl">
                      <DrawerHeader>
                        <DrawerTitle>Student Details</DrawerTitle>
                        <DrawerDescription>
                          See details about {student.studentName}
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 pb-0">
                        <VisitStudentDetails {...student} />
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
  );

  // Function to convert data to CSV and download
  const exportToCSV = () => {
    const csvRows = [];

    // Add the headers to the CSV
    const headers = [];
    if (columnVisibility.photo) headers.push("Photo");
    if (columnVisibility.name) headers.push("Name");
    if (columnVisibility.gender) headers.push("Gender");
    if (columnVisibility.contact) headers.push("Contact");
    if (columnVisibility.address) headers.push("Address");
    if (columnVisibility.dateOfVisit) headers.push("Date of Visit");
    csvRows.push(headers.join(","));

    // Add the rows of data
    filteredStudents.forEach((student) => {
      const row = [];
      if (columnVisibility.photo) row.push(student.photo);
      if (columnVisibility.name) row.push(student.studentName);
      if (columnVisibility.gender) row.push(student.gender);
      if (columnVisibility.contact) row.push(student.studentNumber);
      if (columnVisibility.address) row.push(student.address);
      if (columnVisibility.dateOfVisit) row.push(student.dateOfVisit);
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

  const renderLoadingSkeleton = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Gender</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Address</TableHead>
          <TableHead>Visit Date</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(5)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <div className="h-4 bg-muted animate-pulse rounded w-[150px]" />
            </TableCell>
            <TableCell>
              <div className="h-4 bg-muted animate-pulse rounded w-[80px]" />
            </TableCell>
            <TableCell>
              <div className="h-4 bg-muted animate-pulse rounded w-[120px]" />
            </TableCell>
            <TableCell>
              <div className="h-4 bg-muted animate-pulse rounded w-[200px]" />
            </TableCell>
            <TableCell>
              <div className="h-4 bg-muted animate-pulse rounded w-[100px]" />
            </TableCell>
            <TableCell>
              <div className="w-8 h-8 rounded bg-muted animate-pulse" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<VisitStudent | null>(
    null
  );

  const handleUpdate = async (values: any) => {
    try {
      await crudRequest(
        "PUT",
        `/visit/update-visit/${selectedStudent?._id}`,
        values
      );
      setIsUpdateModalOpen(false);
      fetchStudent(currentPage, itemsPerPage);
      toast.success("Student updated successfully");
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
              <BreadcrumbPage>Visits Students</BreadcrumbPage>
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
      </div>

      <div className="border rounded-md">
        <Tabs
          defaultValue="all"
          value={selectedTab}
          onValueChange={setSelectedTab}
        >
          <div className="flex items-center justify-between p-2">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="male">Male</TabsTrigger>
              <TabsTrigger value="female">Female</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2 ml-auto">
              {/* filter by course */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <ListFilter className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      Filter by Course
                    </span>
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
                    checked={columnVisibility.gender}
                    onCheckedChange={() => toggleColumnVisibility("gender")}
                  >
                    Gender
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
                    checked={columnVisibility.schoolName}
                    onCheckedChange={() => toggleColumnVisibility("schoolName")}
                  >
                    School
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={columnVisibility.dateOfVisit}
                    onCheckedChange={() =>
                      toggleColumnVisibility("dateOfVisit")
                    }
                  >
                    Date of Visit
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <PremiumComponent>
                <AdminComponent>
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
                </AdminComponent>
              </PremiumComponent>
              <PopupModal
                text="Add Visit Student"
                icon={<Plus className="w-4 h-4 mr-2" />}
                renderModal={(onClose) => (
                  <VisitStudentCreateForm modalClose={onClose} />
                )}
              />
            </div>
          </div>
          <PremiumComponent>
            <AdminComponent>
              <div className="px-2">
                <VisitStats />
              </div>
            </AdminComponent>
          </PremiumComponent>
          {loading ? (
            <div className="flex justify-center p-8">
              {renderLoadingSkeleton()}
            </div>
          ) : error ? (
            <div className="flex justify-center p-8">
              <Error />
            </div>
          ) : (
            <div className="relative overflow-auto ">
              <div className="max-h-[calc(100vh-300px)] overflow-auto">
                <TabsContent value="all">{renderStudentTable()}</TabsContent>
                <TabsContent value="male">{renderStudentTable()}</TabsContent>
                <TabsContent value="female">{renderStudentTable()}</TabsContent>
                <TabsContent value="other">{renderStudentTable()}</TabsContent>
              </div>
            </div>
          )}
        </Tabs>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end py-4 space-x-2">
        <Pagination>
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

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleUpdate}
        initialData={selectedStudent || undefined}
      />
    </div>
  );
}
