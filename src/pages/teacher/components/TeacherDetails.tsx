import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { crudRequest } from "@/lib/api";
import { useState, useEffect } from "react";

type Subject = {
  subjectName: {
    _id: string;
    subjectName: string;
    monthlyFee: string;
    regularFee: string;
    deleted: boolean;
    enabled: boolean;
  };
  _id: string;
};

type Course = {
  courseEnroll: {
    _id: string;
    name: string;
    subjects: string[];
    deleted: boolean;
    enabled: boolean;
  };
  subjectsEnroll: Subject[];
  _id: string;
};

type TeacherDetailsProps = {
  _id: string;
  name: string;
  contactNo: string;
  monthlySalary: string | null;
  percentage: string;
  photo: string[];
  courses: Course[];
  enabled: boolean;
  deleted: boolean;
  invoices: any[]; // Add proper type if you have invoice structure
};

type SubjectWiseDetail = {
  subject: string;
  totalStudents: number;
  monthlyStudents: number;
  regularStudents: number;
  monthlyFee: string;
  regularFee: string;
  totalWithDiscount: number;
  totalWithoutDiscount: number;
};

type MonthlyPaymentDetail = {
  studentName: string;
  date: string;
  amount: number;
  discountedAmount: number;
  billNo: string;
};

// Update the AccountingResponse type
type AccountingResponse = {
  salaryDetails: {
    facultyName: string;
    percentage: number;
    monthlySalary: number;
    subjectWiseDetails: SubjectWiseDetail[];
    monthlyPaymentDetails: MonthlyPaymentDetail[];
    totalEarnings: {
      withDiscount: number;
      withoutDiscount: number;
    };
    totalFees: {
      withDiscount: number;
      withoutDiscount: number;
    };
  };
  summary: {
    totalSalaryWithDiscount: number;
    totalSalaryWithoutDiscount: number;
  };
};

const TeacherDetails = ({
  _id,
  name,
  contactNo,
  monthlySalary,
  percentage,
  photo,
  courses,
  enabled,
  deleted,
  invoices,
}: TeacherDetailsProps) => {
  const [accountingData, setAccountingData] =
    useState<AccountingResponse | null>(null);
  const fetchAccounting = async () => {
    const response = await crudRequest<AccountingResponse>(
      "GET",
      `/faculty/get-accounting/${_id}`
    );
    setAccountingData(response);
  };

  useEffect(() => {
    fetchAccounting();
  }, []);
  return (
    <div className="space-y-4">
      {/* Personal Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            {photo && photo.length > 0 && (
              <div className="flex justify-center mb-4">
                <img
                  src={photo[0]}
                  alt={`${name}'s photo`}
                  className="object-cover w-32 h-32 border-2 rounded-full border-border"
                />
              </div>
            )}
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-base">{name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Contact Number
              </p>
              <p className="text-base">{contactNo}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Status
              </p>
              <div className="flex gap-2">
                <Badge variant={enabled ? "default" : "destructive"}>
                  {enabled ? "Enabled" : "Disabled"}
                </Badge>
                {deleted && <Badge variant="destructive">Deleted</Badge>}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Teacher ID
              </p>
              <p className="text-base">{_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Monthly Salary
              </p>
              <p className="text-base">
                {monthlySalary ? `Rs. ${monthlySalary}` : "Not set"}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">
                Percentage
              </p>
              <p className="text-base">{percentage}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses and Subjects Card */}
      <Card>
        <CardHeader>
          <CardTitle>Courses & Subjects</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {courses.map((course) => (
            <div key={course._id} className="p-4 border rounded-lg">
              <h3 className="mb-2 text-lg font-semibold">
                {course.courseEnroll.name}
              </h3>
              <div className="ml-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  Subjects Teaching:
                </p>
                <div className="flex flex-wrap gap-2">
                  {course.subjectsEnroll.map((subject) => (
                    <Badge key={subject._id} variant="secondary">
                      {subject.subjectName.subjectName}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-muted-foreground">No courses assigned</p>
          )}
        </CardContent>
      </Card>

      {/* Invoices Card */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-2">
              {/* Add invoice details here when you have the structure */}
            </div>
          ) : (
            <p className="text-muted-foreground">No invoices available</p>
          )}
        </CardContent>
      </Card>

      {/* accounting */}
      <Card>
        <CardHeader>
          <CardTitle>Accounting Information</CardTitle>
        </CardHeader>
        <CardContent>
          {accountingData ? (
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <h3 className="font-semibold">Total Earnings</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      With Discount
                    </p>
                    <p className="text-lg font-medium">
                      Rs.{" "}
                      {accountingData.salaryDetails.totalEarnings.withDiscount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Without Discount
                    </p>
                    <p className="text-lg font-medium">
                      Rs.{" "}
                      {
                        accountingData.salaryDetails.totalEarnings
                          .withoutDiscount
                      }
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold">Total Fees Collected</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      With Discount
                    </p>
                    <p className="text-lg font-medium">
                      Rs. {accountingData.salaryDetails.totalFees.withDiscount}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Without Discount
                    </p>
                    <p className="text-lg font-medium">
                      Rs.{" "}
                      {accountingData.salaryDetails.totalFees.withoutDiscount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Subject-wise Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Subject-wise Details</h3>
                <div className="space-y-3">
                  {accountingData.salaryDetails.subjectWiseDetails.map(
                    (detail, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-lg font-medium">
                            {detail.subject}
                          </h4>
                          <div className="flex gap-2">
                            <Badge variant="secondary">
                              Monthly: Rs. {detail.monthlyFee}
                            </Badge>
                            <Badge variant="secondary">
                              Regular: Rs. {detail.regularFee}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Total Students
                            </p>
                            <p className="font-medium">
                              {detail.totalStudents}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Monthly Students
                            </p>
                            <p className="font-medium">
                              {detail.monthlyStudents}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Regular Students
                            </p>
                            <p className="font-medium">
                              {detail.regularStudents}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Total (With Discount)
                            </p>
                            <p className="font-medium">
                              Rs. {detail.totalWithDiscount}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Total (Without Discount)
                            </p>
                            <p className="font-medium">
                              Rs. {detail.totalWithoutDiscount}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Monthly Payment Details */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  Monthly Payment History
                </h3>
                <div className="space-y-2">
                  {accountingData.salaryDetails.monthlyPaymentDetails.map(
                    (payment, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{payment.studentName}</p>
                          <Badge>Bill #{payment.billNo}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground">Date</p>
                            <p>{new Date(payment.date).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Amount</p>
                            <p>Rs. {payment.amount}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              After Discount
                            </p>
                            <p>Rs. {payment.discountedAmount}</p>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Final Summary */}
              <div className="grid grid-cols-2 gap-4 p-4 border-t">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Final Salary (With Discount)
                  </p>
                  <p className="text-xl font-semibold">
                    Rs. {accountingData.summary.totalSalaryWithDiscount}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Final Salary (Without Discount)
                  </p>
                  <p className="text-xl font-semibold">
                    Rs. {accountingData.summary.totalSalaryWithoutDiscount}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">
              Loading accounting information...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherDetails;
