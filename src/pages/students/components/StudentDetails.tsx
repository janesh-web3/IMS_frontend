import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoreVertical,
  Truck,
} from "lucide-react";

import React from "react";

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
  };
  price: number;
  discount: number;
  _id: string;
};

type Course = {
  courseEnroll: {
    name: string;
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
  email: string;
  admissionNumber: string;
  paymentDeadline: string;
  guardianName: string;
  guardianContact: string;
  localGuardianName: string;
  localGuardianContact: string;
  paymentMethod: string;
  referredBy: string;
};

type StudentDetailsProps = {
  _id: string;
  personalInfo: PersonalInfo;
  courses: Course[];
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
};

const StudentDetails: React.FC<StudentDetailsProps> = ({
  personalInfo,
  courses,
  admissionFee,
  tshirtFee,
  examFee,
  document,
  totalDiscount,
  paid,
  remaining,
  totalAmount,
  totalAfterDiscount,
}) => {
  return (
    console.log(courses),
    (
      <div>
        <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
          <CardHeader className="flex flex-row items-start bg-muted/50">
            <div className="grid gap-0.5">
              <CardTitle className="flex items-center gap-2 text-lg group">
                {personalInfo.studentName}
                <Button
                  size="icon"
                  variant="outline"
                  className="w-6 h-6 transition-opacity opacity-0 group-hover:opacity-100"
                >
                  <Copy className="w-3 h-3" />
                  <span className="sr-only">Copy Order ID</span>
                </Button>
              </CardTitle>
              <CardDescription>{personalInfo.schoolName}</CardDescription>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Truck className="h-3.5 w-3.5" />
                <span className="lg:sr-only xl:not-sr-only xl:whitespace-nowrap">
                  Track Order
                </span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="outline" className="w-8 h-8">
                    <MoreVertical className="h-3.5 w-3.5" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Export</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Trash</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-6 text-sm">
            <Separator className="my-4" />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="grid gap-3">
                <div className="font-semibold">Personal Details</div>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Admission No:</span>
                    <span>{personalInfo.admissionNumber}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Gender</span>
                    <span>{personalInfo.gender}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Email</span>
                    <span>{personalInfo.email}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Contact Us </span>
                    <span>{personalInfo.contactNo}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Address </span>
                    <span>{personalInfo.address}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Date of Birth{" "}
                    </span>
                    <span>{personalInfo.dateOfBirth ?? "N/A"}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Guardian </span>
                    <span>
                      {personalInfo.guardianName} (
                      {personalInfo.guardianContact})
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Local Guardian{" "}
                    </span>
                    <span>
                      {personalInfo.localGuardianName} (
                      {personalInfo.localGuardianContact})
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Referred By </span>
                    <span>{personalInfo.referredBy}</span>
                  </li>
                </ul>
              </div>

              <div className="grid gap-3 auto-rows-max">
                <div className="font-semibold">Payment Details</div>
                <ul className="grid gap-3">
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Admission Fee</span>
                    <span>{admissionFee}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">T-shirt Fee</span>
                    <span>{tshirtFee}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Exam Fee</span>
                    <span>{examFee}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Document</span>
                    <span>{document}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span>{totalAmount}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Total Discount
                    </span>
                    <span>{totalDiscount}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Total After Discount
                    </span>
                    <span>{totalAfterDiscount}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Paid</span>
                    <span>{paid}</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span className="text-muted-foreground">Remaining</span>
                    <span>{remaining}</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="grid gap-3">
                <div className="font-semibold">Billing Informations</div>
                <ul className="grid gap-3">
                  {personalInfo.billNo.map((bill) => (
                    <div key={bill._id}>
                      <li className="flex items-center justify-between">
                        <Badge variant="outline" className="mr-1 ">
                          <span className="text-muted-foreground">
                            Bill No:
                          </span>
                          <span className="font-normal">
                            &nbsp;{bill.billNo}
                          </span>
                        </Badge>
                        <div>
                          <p>
                            <span className="text-muted-foreground">
                              Date Submitted:
                            </span>
                            <span>
                              &nbsp;
                              {new Date(
                                bill.dateSubmitted
                              ).toLocaleDateString()}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">Paid:</span>
                            <span>&nbsp; {bill.paid}</span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Method:
                            </span>
                            <span>&nbsp;{bill.method}</span>
                          </p>
                        </div>
                      </li>
                      <Separator className="my-2" />
                    </div>
                  ))}
                </ul>
              </div>

              <div className="grid gap-3 auto-rows-max">
                <div className="font-semibold">Courses & Subjects</div>
                <ul>
                  {courses &&
                    courses.map((course, index) => (
                      <li key={index}>
                        <h2 className="font-semibold">
                          <span className="text-muted-foreground">
                            Course Name : &nbsp;
                          </span>
                          <span>{course.courseEnroll.name}</span>
                        </h2>
                        <ul className="grid gap-3">
                          {course.subjectsEnroll.map((subject) => (
                            <div key={subject._id}>
                              <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Subject Name : &nbsp;
                                </span>
                                <span>{subject.subjectName.subjectName}</span>
                              </li>
                              <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Fee Type : &nbsp;
                                </span>
                                <span>{subject.feeType}</span>
                              </li>
                              <li className="flex items-center justify-between">
                                <span className="text-muted-foreground">
                                  Discount : &nbsp;
                                </span>
                                <span>{subject.discount}</span>
                              </li>
                              <Separator className="my-2" />
                            </div>
                          ))}
                        </ul>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="grid gap-3 auto-rows-max">
                <div className="font-semibold">Books Enrolled</div>
                <ul>
                  {courses?.map((course, index) => (
                    <li key={index}>
                      <h2 className="font-semibold">
                        <span className="text-muted-foreground">
                          Course Name : &nbsp;
                        </span>
                        <span>{course?.courseEnroll?.name}</span>
                      </h2>
                      <ul className="grid gap-3">
                        {course?.booksEnroll?.map((book) => (
                          <div key={book._id}>
                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Book Name : &nbsp;
                              </span>
                              <span>{book?.bookName?.name || "N/A"}</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Price : &nbsp;
                              </span>
                              <span>{book?.price || 0}</span>
                            </li>
                            <li className="flex items-center justify-between">
                              <span className="text-muted-foreground">
                                Discount : &nbsp;
                              </span>
                              <span>{book?.discount || 0}</span>
                            </li>
                            <Separator className="my-2" />
                          </div>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-row items-center px-6 py-3 border-t bg-muted/50">
            <div className="text-xs text-muted-foreground">
              Updated <time dateTime="2023-11-23">November 23, 2023</time>
            </div>
            <Pagination className="w-auto ml-auto mr-0">
              <PaginationContent>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="w-6 h-6">
                    <ChevronLeft className="h-3.5 w-3.5" />
                    <span className="sr-only">Previous Order</span>
                  </Button>
                </PaginationItem>
                <PaginationItem>
                  <Button size="icon" variant="outline" className="w-6 h-6">
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="sr-only">Next Order</span>
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        </Card>
      </div>
    )
  );
};

export default StudentDetails;
