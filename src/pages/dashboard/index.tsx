import PageHead from "@/components/shared/page-head.jsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs.js";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { crudRequest } from "@/lib/api.js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Error from "../not-found/error";
import { Control } from "./controls";
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
import StudentDetails from "../students/components/StudentDetails";
import { Button } from "@/components/ui/button";
import Accounting from "./accounting";
import PremiumComponent from "@/components/shared/PremiumComponent";
import StudentDataVisualization from "./statistics/StudentDataVisualization";
import { Transactions } from "./transactions/Transactions";
import { Skeleton } from "@/components/ui/skeleton";
import AdminComponent from "@/components/shared/AdminComponent";
import SuperAdminComponent from "@/components/shared/SuperAdminComponent";
import StudentDashboard from "./student/StudentDashboard";
import StudentComponent from "@/components/shared/StudentComponent";
import TeacherComponent from "@/components/shared/TeacherComponent";
import TeacherDashboard from "./teacher/TeacherDashboard";
import ReceptionComponent from "@/components/shared/ReceptionComponent";
import { Link } from "react-router-dom";
import Board from "@/features/task/Board";
import List from "@/features/task/List";
import Overview from "@/features/task/Overview";
import PopupModal from "@/components/shared/popup-modal";
import { Plus } from "lucide-react";
import AddTask from "@/features/task/AddTask";

type Dashboard = {
  totalAmount: string;
  totalStudents: string;
  totalPaidAmount: string;
  totalRemainingAmount: string;
  totalCourses: string;
  totalSubjects: string;
  totalVisits: string;
  totalBooks: string;
  totalQuizzes: string;
  totalFaculties: string;
  totalRecipts: string;
  totalPayments: string;
};

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

type BookEnroll = {
  bookName: {
    name: string;
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
  booksEnroll: BookEnroll[];
  _id: string;
};

type PersonalInfo = {
  studentName: string;
  schoolName: string;
  address: string;
  dateOfBirth: string | null;
  gender: string;
  email: string;
  password: string;
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

type Alert = {
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

type CourseData = {
  course: string;
  totalStudents: number;
  totalAdmission: number;
  totalPaidAmount: number;
  totalVisit: number;
};

type Course = {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalAdmissionData: number;
  studentsData: number;
  totalPaidAmount: number;
  totalVisitData: number;
  coursesData: CourseData[];
};

const Loading = () => {
  return (
    <div className="flex-1 max-h-screen p-4 pt-6 space-y-4 overflow-y-auto md:p-8">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-8 w-[200px]" />
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="border-b">
          <div className="flex items-center h-10 space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-[100px]" />
            ))}
          </div>
        </div>

        {/* Dashboard Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="w-4 h-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[120px] mb-2" />
                <Skeleton className="h-4 w-[140px]" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid Skeleton */}
        <div className="grid grid-cols-1 col-span-5 gap-4 pb-10 lg:grid-cols-5 md:gap-8">
          {/* Course Summary Card Skeleton */}
          <Card className="col-span-3">
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-[150px]" />
                  <Skeleton className="h-4 w-[250px]" />
                </div>
                <Skeleton className="h-10 w-[150px]" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Summary Stats Skeleton */}
                <div className="grid grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 rounded-lg bg-secondary">
                      <Skeleton className="h-4 w-[100px] mb-2" />
                      <Skeleton className="h-8 w-[80px]" />
                    </div>
                  ))}
                </div>

                {/* Table Skeleton */}
                <div className="border rounded-lg">
                  <div className="border-b">
                    <div className="grid grid-cols-4 p-4">
                      {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-4 w-[100px]" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="grid grid-cols-4 p-4">
                        {[1, 2, 3, 4].map((j) => (
                          <Skeleton key={j} className="h-4 w-[100px]" />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Range Skeleton */}
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </CardContent>
          </Card>

          {/* Alert Card Skeleton */}
          <Card className="h-[500px] col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-[150px] mb-2" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);
  const [courseLoading, setCourseLoading] = useState<boolean>(true);
  const [alertLoading, setAlertLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard>({
    totalAmount: "",
    totalStudents: "",
    totalPaidAmount: "",
    totalRemainingAmount: "",
    totalCourses: "",
    totalSubjects: "",
    totalVisits: "",
    totalBooks: "",
    totalQuizzes: "",
    totalFaculties: "",
    totalRecipts: "",
    totalPayments: "",
  });
  const [alert, setAlert] = useState<Alert[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("yearly");
  const [course, setCourse] = useState<Course>();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);
        const response = await crudRequest<Dashboard>(
          "GET",
          "/student/dashboard"
        );
        if (response) {
          setDashboard(response);
          console.log(response);
        }
      } catch (error) {
        setError("Error fetching dashboard data");
        console.error("Error fetching dashboard data:", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    const fetchAlertData = async () => {
      try {
        setAlertLoading(true);
        const response = await crudRequest<Alert[]>(
          "GET",
          "/student/students-with-remaining"
        );
        if (response) {
          setAlert(response);
        }
      } catch (error) {
        setError("Error fetching alert data");
        console.error("Error fetching alert data:", error);
      } finally {
        setAlertLoading(false);
      }
    };

    const fetchCourseData = async (period: string) => {
      try {
        setCourseLoading(true);
        const response = await crudRequest<Course>(
          "GET",
          `/student/count-students-by-courses?period=${period}`
        );
        if (response) {
          setCourse(response);
        }
      } catch (error) {
        setError("Error fetching course data");
        console.error("Error fetching course data:", error);
      } finally {
        setCourseLoading(false);
      }
    };
    fetchDashboardData();
    fetchAlertData();
    fetchCourseData(selectedPeriod);
  }, [
    selectedPeriod,
    setCourse,
    setAlert,
    setDashboard,
    setDashboardLoading,
    setAlertLoading,
    setCourseLoading,
  ]);

  const DashboardSkeleton = () => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="w-4 h-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[120px] mb-2" />
            <Skeleton className="h-4 w-[140px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const CourseSummarySkeleton = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-lg bg-secondary">
            <Skeleton className="h-4 w-[100px] mb-2" />
            <Skeleton className="h-8 w-[80px]" />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-4 w-[60px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    </div>
  );

  const AlertSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div>
        <Error />
      </div>
    );
  }

  // Use the loading component when all sections are loading
  if (dashboardLoading && courseLoading && alertLoading) {
    return <Loading />;
  }

  return (
    <>
      <PageHead title="Dashboard | App" />
      <div className="flex-1 max-h-screen px-2 space-y-4 md:p-8">
        <div className="items-center justify-between">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <StudentComponent>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </StudentComponent>
              <TeacherComponent>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </TeacherComponent>
              <ReceptionComponent>
                <TabsTrigger value="overview">Overview</TabsTrigger>
              </ReceptionComponent>
              <PremiumComponent>
                <AdminComponent>
                  <TabsTrigger value="accounting">Accounting</TabsTrigger>
                  <SuperAdminComponent>
                    <TabsTrigger value="control">Control</TabsTrigger>
                  </SuperAdminComponent>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                </AdminComponent>
              </PremiumComponent>
            </TabsList>

            <StudentComponent>
              <TabsContent value="overview">
                <StudentDashboard />
              </TabsContent>
            </StudentComponent>
            <TeacherComponent>
              <TabsContent value="overview">
                <TeacherDashboard />
              </TabsContent>
            </TeacherComponent>
            <TabsContent value="overview" className="space-y-4">
              {dashboardLoading ? (
                <DashboardSkeleton />
              ) : (
                <div className="grid gap-2 md:gap-3 md:grid-cols-2 lg:grid-cols-6">
                  <Link to="/visit-student">
                    <Card className="bg-dashboard8 cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                          Total Visits
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-base font-bold md:text-lg">
                          {dashboard.totalVisits}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          in the institute.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/student">
                    <Card className="bg-dashboard1 cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-1 space-y-0 md:pb-2">
                        <CardTitle className="text-xs font-normal md:text-sm md:font-semibold">
                          Total Students
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-base font-bold md:text-xl">
                          {dashboard.totalStudents}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          in the institute.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Card className="bg-dashboard2 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                        Total Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-base font-bold md:text-lg">
                        Rs. {dashboard.totalAmount}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        of all students
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-dashboard3 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                        Total Paid Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-base font-bold md:text-lg">
                        Rs. {dashboard.totalPaidAmount}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        of all students
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-dashboard4 cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                        Total Remaining Amount
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-base font-bold md:text-lg">
                        Rs. {dashboard.totalRemainingAmount}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        of all students
                      </p>
                    </CardContent>
                  </Card>

                  <Link to="/course">
                    <Card className="bg-dashboard5 cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                          Total Courses
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-base font-bold md:text-lg">
                          {dashboard.totalCourses}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          in the institute.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/course">
                    <Card className="bg-dashboard6 cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                          Total Subjects
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-base font-bold md:text-lg">
                          {dashboard.totalSubjects}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          in the institute.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/teacher">
                    <Card className="bg-dashboard7 cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                          Total Faculties
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-base font-bold md:text-lg">
                          {dashboard.totalFaculties}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          in the institute.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>

                  <Link to="/course">
                    <Card className="bg-dashboard9 cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                          Total Books
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-base font-bold md:text-lg">
                          {dashboard.totalBooks}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          in the institute.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/quiz">
                    <Card className="bg-dashboard10 cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                          Total Quizzes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-base font-bold md:text-lg">
                          {dashboard.totalQuizzes}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          in the institute.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/payment">
                    <Card className="bg-dashboard11 cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                          Total Payments
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-base font-bold md:text-lg">
                          {dashboard.totalPayments}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          in the institute.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/recipt">
                    <Card className="bg-dashboard12 cursor-pointer">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                          Total Recipts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-base font-bold md:text-xl">
                          {dashboard.totalRecipts}
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          in the institute.
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              )}
              <div className="grid grid-cols-1 col-span-5 gap-4 pb-10 lg:grid-cols-5 md:gap-8">
                <Card className="col-span-3">
                  <CardHeader className="flex flex-row items-center gap-10">
                    <div className="grid gap-2">
                      <CardTitle className="text-xs font-normal md:text-sm md:font-medium">
                        Course Summary
                      </CardTitle>
                      <CardDescription className="text-xs md:text-sm text-muted-foreground">
                        Course, Admission, Amount Summary for{" "}
                        {selectedPeriod === "daily"
                          ? "Today"
                          : selectedPeriod === "weekly"
                            ? "This Week"
                            : selectedPeriod === "monthly"
                              ? "This Month"
                              : "This Year"}
                      </CardDescription>
                    </div>
                    <Select
                      value={selectedPeriod}
                      onValueChange={(value) => setSelectedPeriod(value)}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="yearly">Yearly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </CardHeader>
                  <CardContent className="max-h-[500px] overflow-auto px-1">
                    {courseLoading ? (
                      <CourseSummarySkeleton />
                    ) : (
                      <div className="space-y-8">
                        <div className="grid grid-cols-4 gap-2">
                          <div className="p-2 border rounded-lg bg-card">
                            <h3 className="text-xs font-normal">
                              Total Students
                            </h3>
                            <p className="font-bold text-md">
                              {course?.studentsData || 0}
                            </p>
                          </div>
                          <div className="p-2 border rounded-lg bg-card">
                            <h3 className="text-xs font-normal">
                              Total Visits
                            </h3>
                            <p className="font-bold text-md">
                              {course?.totalVisitData || 0}
                            </p>
                          </div>
                          <div className="p-2 border rounded-lg bg-card">
                            <h3 className="text-xs font-normal">
                              New Admissions
                            </h3>
                            <p className="font-bold text-md">
                              {course?.totalAdmissionData || 0}
                            </p>
                          </div>
                          <div className="p-2 border rounded-lg bg-card">
                            <h3 className="text-xs font-normal">
                              Total Income
                            </h3>
                            <p className="font-bold text-md">
                              Rs. {course?.totalPaidAmount || 0}
                            </p>
                          </div>
                        </div>

                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Program</TableHead>
                              <TableHead>Total Office Visit</TableHead>
                              <TableHead>New Admission</TableHead>
                              <TableHead className="text-right">
                                Income
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {course?.coursesData.map((data, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <div className="font-medium">
                                    {data.course}
                                  </div>
                                </TableCell>
                                <TableCell>{data.totalVisit}</TableCell>
                                <TableCell>{data.totalAdmission}</TableCell>
                                <TableCell className="text-right">
                                  Rs. {data.totalPaidAmount}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>

                        <div className="text-sm text-muted-foreground">
                          Data from:{" "}
                          {new Date(
                            course?.dateRange.start || ""
                          ).toLocaleDateString()}{" "}
                          &nbsp; to &nbsp;
                          {new Date(
                            course?.dateRange.end || ""
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="col-span-2 overflow-y-auto">
                  <CardHeader>
                    <CardTitle>Alert Students</CardTitle>
                    <CardDescription>
                      Student details with remaining fee and deadlines.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {alertLoading ? (
                      <AlertSkeleton />
                    ) : (
                      <div className="space-y-8 overflow-auto max-h-[500px] px-1">
                        {alert &&
                          alert.map((data, index) => (
                            <Drawer>
                              <DrawerTrigger
                                asChild
                                className="cursor-pointer hover:bg-secondary hover:rounded-sm"
                              >
                                <div className="flex items-center" key={index}>
                                  <Avatar className="h-9 w-9">
                                    <AvatarImage
                                      src={data.photo}
                                      alt="Avatar"
                                    />
                                    <AvatarFallback>OM</AvatarFallback>
                                  </Avatar>
                                  <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                      {data?.personalInfo.studentName}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {data.personalInfo.contactNo}
                                    </p>
                                  </div>
                                  <div className="ml-auto font-medium">
                                    {data?.remaining}
                                  </div>
                                </div>
                              </DrawerTrigger>
                              <DrawerContent className="z-50">
                                <div className="w-full max-h-[80vh] mx-auto overflow-auto max-w-7xl">
                                  <DrawerHeader>
                                    <DrawerTitle>Student Details</DrawerTitle>
                                    <DrawerDescription>
                                      See details about{" "}
                                      {data?.personalInfo?.studentName}
                                    </DrawerDescription>
                                  </DrawerHeader>
                                  <div className="p-4 pb-0">
                                    <StudentDetails {...data} />
                                  </div>
                                  <DrawerFooter>
                                    <DrawerClose asChild>
                                      <Button variant="outline">Cancel</Button>
                                    </DrawerClose>
                                  </DrawerFooter>
                                </div>
                              </DrawerContent>
                            </Drawer>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <PremiumComponent>
              <AdminComponent>
                <TabsContent value="accounting">
                  <Accounting />
                </TabsContent>
                <SuperAdminComponent>
                  <TabsContent value="control">
                    <Control />
                  </TabsContent>
                </SuperAdminComponent>
                <TabsContent value="transactions">
                  <Transactions />
                </TabsContent>
                <TabsContent value="stats">
                  <StudentDataVisualization />
                </TabsContent>
              </AdminComponent>
            </PremiumComponent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
