import Heading from "@/components/shared/heading";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { crudRequest } from "@/lib/api";
import { Courses, Book } from "@/types";
import WebcamCapture from "@/components/shared/WebcamCapture";
import axios from "axios";
import { server } from "@/server";
import { toast } from "react-toastify";

const StudentCreateForm = ({ modalClose }: { modalClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //step-1
  const [personalInfo, setPersonalInfo] = useState({
    studentName: "",
    schoolName: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    email: "",
    contactNo: "",
    billNo: "",
    guardianName: "",
    guardianContact: "",
    localGuardianName: "",
    localGuardianContact: "",
    referredBy: "",
    admissionNumber: "",
    paymentMethod: "",
  });
  const [deadlinedate, setDeadlineDate] = useState<Date | undefined>(undefined);

  const handleChange = (name: string, value: any) => {
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  //step 2
  const [feesInfo, setFeesInfo] = useState({
    admissionFee: 0,
    tshirtFee: 0,
    examFee: 0,
    document: false,
    totalDiscount: 0,
    totalAmount: 0,
    totalAfterDiscount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    paymentMethod: "",
    paymentDeadline: null,
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [subjectFees, setSubjectFees] = useState<{
    [subjectId: string]: { discount: number; feeType: string };
  }>({});
  const [coursesData, setCourseData] = useState<Courses[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<string[]>([]);
  const [bookFees, setBookFees] = useState<{
    [bookId: string]: { discount: number; price: number };
  }>({});

  const handleCourseChange = (courseId: string) => {
    setSelectedCourses((prevSelectedCourses) => {
      const isSelected = prevSelectedCourses.includes(courseId);
      const newSelectedCourses = isSelected
        ? prevSelectedCourses.filter((_id) => _id !== courseId)
        : [...prevSelectedCourses, courseId];

      // Update selected subjects based on the new selection of courses
      const newSubjects = coursesData
        .filter((course) => newSelectedCourses.includes(course._id))
        .flatMap((course) => course.subjects.map((subject) => subject._id));

      // Remove subjects not in the newly selected courses
      const updatedSubjects = selectedSubjects.filter((subjectId) =>
        newSubjects.includes(subjectId)
      );

      setSelectedSubjects(updatedSubjects);

      return newSelectedCourses;
    });
  };

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjects((prevSelectedSubjects) =>
      prevSelectedSubjects.includes(subjectId)
        ? prevSelectedSubjects.filter((_id) => _id !== subjectId)
        : [...prevSelectedSubjects, subjectId]
    );
  };

  const handleDiscountChange = (subjectId: string, value: any) => {
    setSubjectFees((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        discount: Number(value),
      },
    }));
  };

  const handleSubjectFeeTypeChange = (subjectId: string, feeType: string) => {
    setSubjectFees((prev) => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        feeType,
      },
    }));
  };
  const handleFeesInfoChange = (name: string, value: any) => {
    setFeesInfo((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleTshirtChange = (name: string, checked: any) => {
    handleFeesInfoChange(name, checked ? 500 : 0);
  };

  const handleExamChange = (name: string, checked: any) => {
    handleFeesInfoChange(name, checked ? 100 : 0);
  };

  const handleDocumentChange = (name: string, checked: any) => {
    handleFeesInfoChange(name, checked);
  };
  const handleDealineChange = (selectedDate: Date | undefined) => {
    setDeadlineDate(selectedDate);
    handleFeesInfoChange("paymentDeadline", selectedDate);
  };

  // step 3
  const [photo, setPhoto] = useState<null | string | Blob>(null);

  // Handle webcam capture
  const handleCapturePhoto = (image: Blob) => {
    setPhoto(image);
  };

  // Calculate Total Amount
  useEffect(() => {
    const { totalSubjectFees, totalDiscount: subjectDiscount } =
      selectedSubjects.reduce(
        (
          acc: { totalSubjectFees: number; totalDiscount: number },
          subjectId
        ) => {
          const subject = coursesData
            ?.flatMap((course) => course.subjects)
            .find((sub) => sub._id === subjectId);

          if (subject) {
            const feeType = subjectFees[subjectId]?.feeType ?? "monthly";
            const discount = subjectFees[subjectId]?.discount ?? 0;
            const feeAmount =
              feeType === "monthly"
                ? Number(subject.monthlyFee)
                : Number(subject.regularFee);

            acc.totalSubjectFees += feeAmount;
            acc.totalDiscount += discount;
          }
          return acc;
        },
        { totalSubjectFees: 0, totalDiscount: 0 }
      );

    // Calculate book fees and discounts
    const { totalBookFees, totalBookDiscount } = selectedBooks.reduce(
      (acc: { totalBookFees: number; totalBookDiscount: number }, bookId) => {
        const book = coursesData
          ?.flatMap((course) => course.books)
          .find((b) => b._id === bookId);

        if (book && !book.isFree) {
          const bookPrice = Number(book.price) || 0;
          const bookDiscount = Number(bookFees[bookId]?.discount) || 0;

          acc.totalBookFees += bookPrice;
          acc.totalBookDiscount += bookDiscount;
        }
        return acc;
      },
      { totalBookFees: 0, totalBookDiscount: 0 }
    );

    const totalAmount =
      Number(feesInfo.admissionFee) +
      Number(feesInfo.tshirtFee) +
      Number(feesInfo.examFee) +
      Number(totalSubjectFees) +
      Number(totalBookFees);

    const totalDiscount = Number(subjectDiscount) + Number(totalBookDiscount);
    const totalAfterDiscount = Number(totalAmount) - Number(totalDiscount);

    handleFeesInfoChange("totalAmount", totalAmount);
    handleFeesInfoChange("totalDiscount", totalDiscount);
    handleFeesInfoChange("totalAfterDiscount", totalAfterDiscount);
    handleFeesInfoChange(
      "remainingAmount",
      Number(totalAfterDiscount) - Number(feesInfo.paidAmount)
    );
  }, [
    feesInfo.admissionFee,
    feesInfo.tshirtFee,
    feesInfo.examFee,
    feesInfo.paidAmount,
    selectedSubjects,
    selectedBooks,
    bookFees,
    subjectFees,
    coursesData,
  ]);

  //fetch courses data
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await crudRequest<Courses[]>(
          "GET",
          "/course/get-course"
        );
        if (response && Array.isArray(response)) {
          setCourseData(response);
          console.log(response);
        } else {
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };
    fetchCourses();
  }, []);

  const handleNext = () => {
    if (step === 1) {
      if (
        !personalInfo.studentName ||
        !personalInfo.contactNo ||
        !personalInfo.billNo
      ) {
        toast.error("Please fill all the required fields");
        return;
      }
    }

    if (step === 2) {
      if (selectedCourses.length === 0) {
        toast.error("Please select at least one course");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  // bill print functionality
  // Add this utility function to format currency
  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
    }).format(Number(amount));
  };

  // ... existing imports ...

  // Add these type definitions at the top of the file
  type StudentBill = {
    studentName: string;
    billNo: string;
    amount: number;
    totalAmount: number;
    method: string;
    remaining: number;
  };

  // Update the generateBill function with proper typing
  const generateBill = (studentData: StudentBill) => {
    const billHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Fee Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .bill-container { max-width: 400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .bill-details { margin-bottom: 20px; }
        .bill-row { display: flex; justify-content: space-between; margin: 5px 0; }
        .footer { margin-top: 30px; text-align: center; }
        @media print {
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="bill-container">
        <div class="header">
          <h2>Fee Receipt</h2>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="bill-details">
          <div class="bill-row">
            <strong>Student Name:</strong>
            <span>${studentData.studentName}</span>
          </div>
          <div class="bill-row">
            <strong>Bill No:</strong>
            <span>${studentData.billNo}</span>
            <div class="bill-row">
              <strong>Total Amount:</strong>
              <span>${formatCurrency(studentData.totalAmount.toString())}</span>
            </div>
          </div>
          <div class="bill-row">
            <strong>Payment Method:</strong>
            <span>${studentData.method}</span>
          </div>
          <div class="bill-row">
            <strong>Remaining Amount:</strong>
            <span>${formatCurrency(studentData.remaining.toString())}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your payment!</p>
        </div>
      </div>
      <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()">Print Receipt</button>
      </div>
    </body>
    </html>
  `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(billHTML);
      printWindow.document.close();
      // Automatically trigger print
      printWindow.onload = function () {
        printWindow.print();
      };
    }
  };

  const handleBookChange = (bookId: string) => {
    setSelectedBooks((prev) =>
      prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleBookDiscountChange = (bookId: string, value: number) => {
    setBookFees((prev) => ({
      ...prev,
      [bookId]: {
        ...prev[bookId],
        discount: Number(value),
      },
    }));
  };

  // Update onSubmit to include books
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 setIsSubmitting(true);

    const formattedDateOfBirth = personalInfo.dateOfBirth
      ? format(personalInfo.dateOfBirth, "yyyy-MM-dd")
      : null;

    const formattedPaymentDeadline = feesInfo.paymentDeadline
      ? format(feesInfo.paymentDeadline, "yyyy-MM-dd")
      : null;

    const studentData = {
      personalInfo: {
        ...personalInfo,
        dateOfBirth: formattedDateOfBirth,
        paymentDeadline: formattedPaymentDeadline,
        billNo: [
          {
            billNo: personalInfo.billNo,
            dateSubmitted: new Date(),
            paid: feesInfo.paidAmount.toString(),
            method: feesInfo.paymentMethod,
          },
        ],
      },
      courses: coursesData
        .filter((course) => selectedCourses.includes(course._id))
        .map((course) => ({
          courseEnroll: course._id,
          subjectsEnroll: course.subjects
            .filter((subject) => selectedSubjects.includes(subject._id))
            .map((subject) => ({
              subjectName: subject._id,
              feeType: subjectFees[subject._id]?.feeType || "monthly",
              discount: subjectFees[subject._id]?.discount || 0,
            })),
          booksEnroll: course.books
            .filter((book) => selectedBooks.includes(book._id))
            .map((book) => ({
              bookName: book._id,
              price: book.price,
              discount: bookFees[book._id]?.discount || 0,
            })),
        })),
      admissionFee: feesInfo.admissionFee,
      tshirtFee: feesInfo.tshirtFee,
      examFee: feesInfo.examFee,
      document: feesInfo.document ? "Yes" : "No",
      totalDiscount: feesInfo.totalDiscount,
      paid: feesInfo.paidAmount,
      remaining: feesInfo.remainingAmount,
      totalAmount: feesInfo.totalAmount,
      totalAfterDiscount: feesInfo.totalAfterDiscount,
      photo: photo,
    };


    // Prepare the notification payload
    const notificationPayload = {
      title: "New Student Added",
      message: `New Student ${personalInfo.studentName} has been added.`,
      type: "Student",
      category: "alert",
      forRoles: ["admin", "superadmin"],
      push: true,
      sound: true,
    };

    // Generate and print bill
    const studentBill: StudentBill = {
      studentName: personalInfo.studentName,
      billNo: personalInfo.billNo,
      totalAmount: feesInfo.totalAmount,
      amount: feesInfo.paidAmount,
      method: feesInfo.paymentMethod,
      remaining: feesInfo.remainingAmount,
    };

    const contentType =
      photo === null ? "application/json" : "multipart/form-data";

    const token = sessionStorage.getItem("token");
    try {
      await axios
        .post(`${server}/student/add-student`, studentData, {
          headers: {
            "Content-Type": contentType,
            Authorization: token,
          },
        })
        .then(async () => {
          toast.success("Student added successfully");

          await crudRequest(
            "POST",
            "/notification/add-notification",
            notificationPayload
          );

          // generateBill(studentBill);
        });

      modalClose();
    } catch (error) {
      toast.error("Failed to add student");
      console.error("Error adding student:", error);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the component code ...

  return (
    <div className="px-2">
      <Heading
        title={"Create New Student"}
        description={""}
        className="pb-3 space-y-2 text-center"
      />
      <form className="space-y-2 md:space-y-4" autoComplete="off">
        {/* first step */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 uppercase md:grid-cols-2 gap-x-3 md:gap-x-8 gap-y-4 md:gap-y-7">
              <div>
                <Label htmlFor="studentName">Student Name *</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  value={personalInfo.studentName}
                  onChange={(e) => handleChange("studentName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="contactNo">Enter Phone Number *</Label>
                <Input
                  id="contactNo"
                  placeholder="Enter phone number"
                  value={personalInfo.contactNo}
                  onChange={(e) => handleChange("contactNo", e.target.value)}
                />
              </div>
              <div className="grid">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  placeholder="Enter dateOfBirth"
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="gender">Select Gender *</Label>
                <Select
                  onValueChange={(value) => handleChange("gender", value)}
                  value={personalInfo.gender}
                >
                  <SelectTrigger
                    id="gender"
                    className="items-start [&_[data-description]]:hidden"
                  >
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="guardianName">Enter Guardian Name</Label>
                <Input
                  id="guardianName"
                  placeholder="Enter guardian name"
                  value={personalInfo.guardianName}
                  onChange={(e) => handleChange("guardianName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="guardianContact">Enter Guardian Contact</Label>
                <Input
                  id="guardianContact"
                  placeholder="Enter guardian contact"
                  value={personalInfo.guardianContact}
                  onChange={(e) =>
                    handleChange("guardianContact", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="localGuardianName">
                  Enter Local Guardian Name
                </Label>
                <Input
                  id="localGuardianName"
                  placeholder="Enter local guardian name"
                  value={personalInfo.localGuardianName}
                  onChange={(e) =>
                    handleChange("localGuardianName", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="localGuardianContact">
                  Enter Local Guardian Contact
                </Label>
                <Input
                  id="localGuardianContact"
                  placeholder="Enter local guardian contact"
                  value={personalInfo.localGuardianContact}
                  onChange={(e) =>
                    handleChange("localGuardianContact", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="billNo">Enter Bill No *</Label>
                <Input
                  id="billNo"
                  placeholder="Enter bill number"
                  value={personalInfo.billNo}
                  onChange={(e) => handleChange("billNo", e.target.value)}
                />
              </div>
             
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter email"
                  value={personalInfo.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  placeholder="Enter school name"
                  value={personalInfo.schoolName}
                  onChange={(e) => handleChange("schoolName", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="address">Enter Address</Label>
                <Input
                  id="address"
                  placeholder="Enter address"
                  value={personalInfo.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
              
              
            
            
              <div>
                <Label htmlFor="referredBy">Referred By</Label>
                <Select
                  onValueChange={(value) => handleChange("referredBy", value)}
                  value={personalInfo.referredBy}
                >
                  <SelectTrigger
                    id="referredBy"
                    className="items-start [&_[data-description]]:hidden"
                  >
                    <SelectValue placeholder="Referred By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Advertisement">Advertisement</SelectItem>
                    <SelectItem value="News Paper">News Paper</SelectItem>
                    <SelectItem value="Friends">Friends</SelectItem>
                    <SelectItem value="Relatives">Relatives</SelectItem>
                    <SelectItem value="Seniors">Seniors</SelectItem>
                    <SelectItem value="F.M">F.M</SelectItem>
                    <SelectItem value="Prospectus">Prospectus</SelectItem>
                    <SelectItem value="Counselor">Counselor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="admissionNumber">Enter Admission Number</Label>
                <Input
                  id="admissionNumber"
                  placeholder="Enter admission number"
                  value={personalInfo.admissionNumber}
                  onChange={(e) =>
                    handleChange("admissionNumber", e.target.value)
                  }
                />
              </div>
            </div>
          </>
        )}

        {/* second step */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 md:gap-x-8 md:gap-y-4">
              <div>
                <Label htmlFor="admissionFee">Select Admission Fee</Label>
                <Select
                  onValueChange={(value) =>
                    handleFeesInfoChange("admissionFee", Number(value))
                  }
                  value={feesInfo.admissionFee.toString()} // Convert to string
                >
                  <SelectTrigger
                    id="admissionFee"
                    className="items-start [&_[data-description]]:hidden"
                  >
                    <SelectValue placeholder="Select Admission Fee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1000">1000</SelectItem>
                    <SelectItem value="2500">2500</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 gap-4 md:gap-10 md:grid-cols-3">
              <div className="flex items-center justify-center gap-3 text-center">
                  <Label htmlFor="tShirtFee">T-Shirt Fee</Label>
                  <Checkbox
                    id="tshirtFee"
                    checked={feesInfo.tshirtFee === 500} // Convert to boolean
                    onCheckedChange={(checked) =>
                      handleTshirtChange("tshirtFee", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-center gap-3 text-center">
                  <Label htmlFor="examFee">Exam Fee</Label>
                  <Checkbox
                    id="examFee"
                    checked={feesInfo.examFee === 100} // Convert to boolean
                    onCheckedChange={(checked) =>
                      handleExamChange("examFee", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-center gap-3 text-center">
                  <Label htmlFor="document">Document</Label>
                  <Checkbox
                    id="document"
                    checked={feesInfo.document}
                    onCheckedChange={(checked) =>
                      handleDocumentChange("document", checked)
                    }
                  />
                </div>
              </div>

              {/* courses & subject */}
              <div className="col-span-2 gap-10 pb-4">
                <Label htmlFor="courses" className="mb-4">
                  Select Courses
                </Label>
                <div className="grid md:grid-cols-4 md:gap-x-10 md:gap-y-6">
                  {coursesData &&
                    coursesData.map((course, index) => (
                      <div key={index}>
                        <div className="flex items-center gap-2 py-2">
                          <Checkbox
                            id={course._id}
                            checked={selectedCourses.includes(course._id)}
                            onCheckedChange={() =>
                              handleCourseChange(course._id)
                            }
                          />
                          <Label htmlFor={course._id}>{course.name}</Label>
                        </div>

                        {selectedCourses.includes(course._id) && (
                          <div className="pl-6 space-y-2">
                            {course.subjects.map((subject) => (
                              <div key={subject._id}>
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={subject._id}
                                    checked={selectedSubjects.includes(
                                      subject._id
                                    )}
                                    onCheckedChange={() =>
                                      handleSubjectChange(subject._id)
                                    }
                                  />
                                  <Label htmlFor={subject._id}>
                                    {subject.subjectName}
                                  </Label>
                                </div>

                                {selectedSubjects.includes(subject._id) && (
                                  <div>
                                    <div>
                                      <Label htmlFor="discount">
                                        Discount Amount
                                      </Label>
                                      <Input
                                        id={`discount_${subject._id}`}
                                        type="text"
                                        placeholder="Enter discount amount"
                                        value={
                                          subjectFees[subject._id]?.discount ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleDiscountChange(
                                            subject._id,
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                    <div>
                                      <Label htmlFor="feeType">
                                        Select Fee Type
                                      </Label>
                                      <Select
                                        onValueChange={(value) =>
                                          handleSubjectFeeTypeChange(
                                            subject._id,
                                            value
                                          )
                                        }
                                        value={
                                          subjectFees[subject._id]?.feeType ||
                                          ""
                                        }
                                      >
                                        <SelectTrigger id="feeType">
                                          <SelectValue placeholder="Select Fee Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="monthly">
                                            Monthly: {subject.monthlyFee}
                                          </SelectItem>
                                          <SelectItem value="regular">
                                            Regular: {subject.regularFee}
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {/* Books selection */}
                            <div className="mt-4">
                              <Label>Course Books</Label>
                              {course.books?.map((book: Book) => (
                                <div key={book._id} className="py-1">
                                  <div className="flex items-center gap-2 ">
                                    <Checkbox
                                      id={`book-${book._id}`}
                                      checked={selectedBooks.includes(book._id)}
                                      onCheckedChange={() =>
                                        handleBookChange(book._id)
                                      }
                                    />
                                    <Label htmlFor={`book-${book._id}`}>
                                      {book.name} -{" "}
                                      {book.isFree
                                        ? "Free"
                                        : `Rs. ${book.price}`}
                                    </Label>
                                  </div>

                                  {selectedBooks.includes(book._id) &&
                                    !book.isFree && (
                                      <div className="pl-6 mt-2">
                                        <Label>Discount</Label>
                                        <Input
                                          type="text"
                                          value={
                                            bookFees[book._id]?.discount || 0
                                          }
                                          onChange={(e) =>
                                            handleBookDiscountChange(
                                              book._id,
                                              Number(e.target.value)
                                            )
                                          }
                                          className="w-24"
                                        />
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input id="totalAmount" readOnly value={feesInfo.totalAmount} />
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="totalDiscount">Total Discount Amount</Label>
                <Input
                  id="totalDiscount"
                  readOnly
                  value={feesInfo.totalDiscount}
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="totalAfterDiscount">
                  Total After Discount Amount
                </Label>
                <Input
                  id="totalAfterDiscount"
                  value={feesInfo.totalAfterDiscount}
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="paidAmount">Total Paid Amount</Label>
                <Input
                  id="paidAmount"
                  value={feesInfo.paidAmount}
                  onChange={(e) =>
                    handleFeesInfoChange("paidAmount", Number(e.target.value))
                  }
                />
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="remainingAmount">Total Remaining Amount</Label>
                <Input id="remainingAmount" value={feesInfo.remainingAmount} />
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="paymentMethod">Select Payment Method</Label>
                <Select
                  onValueChange={(value) =>
                    handleFeesInfoChange("paymentMethod", value)
                  }
                  value={feesInfo.paymentMethod}
                >
                  <SelectTrigger
                    id="paymentMethod"
                    className="items-start [&_[data-description]]:hidden"
                  >
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 md:col-span-1">
                <Label htmlFor="paymentDeadline">Payment Deadline</Label>
                <Input
                  id="deadlinedate"
                  type="date"
                  placeholder="Enter deadlinedate"
                  value={deadlinedate ? format(deadlinedate, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    handleDealineChange(date);
                  }}
                />
              </div>
            </div>
          </>
        )}

        {/* third step */}
        {step === 3 && (
          <>
            <h2 className="text-lg font-medium">Upload Photo</h2>
              <WebcamCapture onCapture={handleCapturePhoto} />
          </>
        )}

        {/* footer button */}
        <div className="grid justify-between grid-cols-2 gap-4">
          {step === 1 && (
            <Button
              type="button"
              variant="secondary"
              className="rounded-full max-w-40"
              size="lg"
              onClick={modalClose}
            >
              Cancel
            </Button>
          )}
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              className="rounded-full max-w-40"
              size="lg"
              onClick={handlePrevious}
            >
              Previous
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              className="rounded-full max-w-40"
              size="lg"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-full max-w-40"
              size="lg"
              disabled={isSubmitting}
              onClick={onSubmit}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default StudentCreateForm;
