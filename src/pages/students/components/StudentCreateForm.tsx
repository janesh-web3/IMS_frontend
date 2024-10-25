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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { crudRequest } from "@/lib/api";
import { Courses } from "@/types";
import WebcamCapture from "@/components/shared/WebcamCapture";
import axios from "axios";
import { server } from "@/server";
import { toast } from "react-toastify";

const StudentCreateForm = ({ modalClose }: { modalClose: () => void }) => {
  const [step, setStep] = useState(1);

  //step-1
  const [personalInfo, setPersonalInfo] = useState({
    studentName: "",
    schoolName: "",
    address: "",
    dateOfBirth: null,
    gender: "",
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
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [deadlinedate, setDeadlineDate] = useState<Date | undefined>(undefined);

  const handleDoBChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    handleChange("dateOfBirth", selectedDate);
  };
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
    const { totalSubjectFees, totalDiscount } = selectedSubjects.reduce(
      (acc, subjectId) => {
        const subject = coursesData
          ?.flatMap((course) => course.subjects)
          .find((sub) => sub._id === subjectId);

        if (subject) {
          const feeType = subjectFees[subjectId]?.feeType ?? "monthly";
          const discount = subjectFees[subjectId]?.discount ?? 0;

          // Convert fee strings to numbers before calculation
          const feeAmount =
            feeType === "monthly"
              ? parseFloat(subject.monthlyFee.toString())
              : parseFloat(subject.regularFee.toString());

          acc.totalSubjectFees += feeAmount;
          acc.totalDiscount += discount;
        }

        return acc;
      },
      { totalSubjectFees: 0, totalDiscount: 0 }
    );

    const totalAmount =
      feesInfo.admissionFee +
      feesInfo.examFee +
      feesInfo.tshirtFee +
      totalSubjectFees;

    const remainingAmount = feesInfo.totalAfterDiscount - feesInfo.paidAmount;

    handleFeesInfoChange("totalAmount", totalAmount);
    handleFeesInfoChange("remainingAmount", remainingAmount);
    handleFeesInfoChange("totalDiscount", Number(totalDiscount));
    handleFeesInfoChange(
      "totalAfterDiscount",
      Number(totalAmount - totalDiscount)
    );
  }, [
    feesInfo.admissionFee,
    feesInfo.examFee,
    feesInfo.tshirtFee,
    feesInfo.paidAmount,
    feesInfo.remainingAmount,
    feesInfo.totalAfterDiscount,
    selectedSubjects,
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
      if (!personalInfo.studentName  || !personalInfo.address || !personalInfo.gender || !personalInfo.contactNo || personalInfo.billNo) {
        toast.error('Please fill all the required fields');
        return;
      }
    }
    
    if (step === 2) {
      if (selectedCourses.length === 0) {
        toast.error('Please select at least one course');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    const token = sessionStorage.getItem("token");
    {
      photo === null
        ? await crudRequest("POST", `/student/add-student`, studentData)
            .then(() => {
              toast.success("Student added successfully");
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            })
            .catch(() => {
              toast.error("Failed to add student");
            })
        : await axios
            .post(`${server}/student/add-student-photo`, studentData, {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: token,
              },
            })
            .then(() => {
              toast.success("Student added successfully");
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            })
            .catch(() => {
              toast.error("Failed to add student");
            });
    }
  };

  return (
    <div className="px-2">
      <Heading
        title={"Create New Student"}
        description={""}
        className="pb-3 space-y-2 text-center"
      />
      <form className="space-y-4" autoComplete="off">
        {/* first step */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-2 uppercase gap-x-8 gap-y-4">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Input
                  id="studentName"
                  placeholder="Enter student name"
                  value={personalInfo.studentName}
                  onChange={(e) => handleChange("studentName", e.target.value)}
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
              <div className="grid">
                <Popover>
                  <Label htmlFor="dateOfBirth">Enter Date of Birth</Label>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {date ? format(date, "PPP") : <span>Date of Birth</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDoBChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="gender">Select Gender</Label>
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
                <Label htmlFor="contactNo">Enter Phone Number</Label>
                <Input
                  id="contactNo"
                  placeholder="Enter phone number"
                  value={personalInfo.contactNo}
                  onChange={(e) => handleChange("contactNo", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="billNo">Enter Bill No</Label>
                <Input
                  id="billNo"
                  placeholder="Enter bill number"
                  value={personalInfo.billNo}
                  onChange={(e) => handleChange("billNo", e.target.value)}
                />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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

              <div className="flex flex-wrap gap-10">
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
              <div className="col-span-2 gap-10">
                <Label htmlFor="courses" className="mb-4">
                  Select Courses
                </Label>
                <div className="grid grid-cols-4 gap-x-10 gap-y-6">
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
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input id="totalAmount" readOnly value={feesInfo.totalAmount} />
              </div>

              <div>
                <Label htmlFor="totalDiscount">Total Discount Amount</Label>
                <Input
                  id="totalDiscount"
                  readOnly
                  value={feesInfo.totalDiscount}
                />
              </div>

              <div>
                <Label htmlFor="totalAfterDiscount">
                  Total After Discount Amount
                </Label>
                <Input
                  id="totalAfterDiscount"
                  value={feesInfo.totalAfterDiscount}
                />
              </div>

              <div>
                <Label htmlFor="paidAmount">Total Paid Amount</Label>
                <Input
                  id="paidAmount"
                  value={feesInfo.paidAmount}
                  onChange={(e) =>
                    handleFeesInfoChange("paidAmount", Number(e.target.value))
                  }
                />
              </div>

              <div>
                <Label htmlFor="remainingAmount">Total Remaining Amount</Label>
                <Input id="remainingAmount" value={feesInfo.remainingAmount} />
              </div>

              <div>
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

              <div className="flex items-center justify-center gap-6 text-center">
                <Label htmlFor="paymentDeadline">Payment Deadline</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[280px] justify-start text-left font-normal",
                        !deadlinedate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {deadlinedate ? (
                        format(deadlinedate, "PPP")
                      ) : (
                        <span>Payment Deadline</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={deadlinedate}
                      onSelect={handleDealineChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
              onClick={onSubmit}
            >
              Submit
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default StudentCreateForm;
