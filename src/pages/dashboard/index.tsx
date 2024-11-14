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
import Loading from "../not-found/loading";
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

type Dashboard = {
  totalAmount: string;
  totalStudents: string;
  totalPaidAmount: string;
  totalRemainingAmount: string;
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

type StudentCourse = {
  courseEnroll: {
    name: string;
    _id: string;
  };
  subjectsEnroll: SubjectEnroll[];
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

type Course = {
  studentsData: number;
  totalAdmissionData: number;
  totalPaidAmount: number;
  totalVisitData: number;
  coursesData: [
    {
      totalVisit: string;
      totalAdmission: string;
      totalPaidAmount: string;
      totalVisitData: string;
      course: string;
    },
  ];
};

export default function DashboardPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard>({
    totalAmount: "",
    totalStudents: "",
    totalPaidAmount: "",
    totalRemainingAmount: "",
  });
  const [alert, setAlert] = useState<Alert[]>([]);
  const [course, setCourse] = useState<Course>();

  const fetchDashboardData = async () => {
    try {
      const response = await crudRequest<Dashboard>(
        "GET",
        "/student/dashboard"
      );
      if (response) {
        setDashboard(response);
      } else {
        setError("Unexpected response format");
      }
    } catch (error) {
      setError("Error fetching dashboard data");
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAlertData = async () => {
    try {
      const response = await crudRequest<Alert[]>(
        "GET",
        "/student/students-with-remaining"
      );
      if (response) {
        setAlert(response);
      } else {
        setError("Unexpected response format");
      }
    } catch (error) {
      setError("Error fetching alert data");
      console.error("Error fetching alert data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await crudRequest<Course>(
        "GET",
        "/student/count-students-by-courses"
      );
      if (response) {
        setCourse(response);
      } else {
        setError("Unexpected response format");
      }
    } catch (error) {
      setError("Error fetching alert data");
      console.error("Error fetching alert data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAlertData();
    fetchCourseData();
  }, []);

  if (loading) {
    return (
      <>
        <Loading />
      </>
    );
  }
  if (error) {
    return (
      <div>
        <Error />
      </div>
    );
  }
  return (
    <>
      <PageHead title="Dashboard | App" />
      <div className="flex-1 max-h-screen p-4 pt-6 space-y-4 overflow-y-auto md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Hi, Welcome back 👋
          </h2>
        </div>
        <Tabs defaultValue="overview" className="space-y-4 ">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounting">Accounting</TabsTrigger>
            <TabsTrigger value="control">Control</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Students
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboard.totalStudents}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    in the institute.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Amount
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rs. {dashboard.totalAmount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of all students
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Paid Amount
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rs. {dashboard.totalPaidAmount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of all students
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">
                    Total Remaining Amount
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-4 h-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Rs. {dashboard.totalRemainingAmount}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    of all students
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 col-span-5 gap-4 pb-10 lg:grid-cols-5 md:gap-8">
              <Card className="col-span-3">
                <CardHeader className="flex flex-row items-center gap-10">
                  <div className="grid gap-2">
                    <CardTitle>Course Summary</CardTitle>
                    <CardDescription>
                      Course, Admission, Amount Summary.
                    </CardDescription>
                  </div>
                  <Select>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select Date" />
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
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Program</TableHead>
                        <TableHead>Total Office Visit</TableHead>
                        <TableHead>New Admission</TableHead>
                        <TableHead className="text-right">Income</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {course &&
                        course.coursesData.map((data, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="font-medium">{data.course}</div>
                            </TableCell>
                            <TableCell>{data.totalVisit}</TableCell>
                            <TableCell>{data.totalAdmission}</TableCell>
                            <TableCell className="text-right">
                              {data.totalPaidAmount}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className=" h-[500px] overflow-y-auto col-span-2 ">
                <CardHeader>
                  <CardTitle>Alert Students</CardTitle>
                  <CardDescription>
                    Student details with remaining fee and deadlines.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8 overflow-auto">
                    {alert &&
                      alert.map((data, index) => (
                        <Drawer>
                          <DrawerTrigger
                            asChild
                            className="cursor-pointer hover:bg-secondary hover:rounded-sm"
                          >
                            <div className="flex items-center" key={index}>
                              <Avatar className="h-9 w-9">
                                <AvatarImage src={data.photo} alt="Avatar" />
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="accounting">
            <Accounting />
          </TabsContent>
          <TabsContent value="control">
            <Control />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
