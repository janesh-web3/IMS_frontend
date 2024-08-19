import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// StepProps interface
type StepProps = {
  formData: {
    studentName: string;
    schoolName: string;
    address: string;
    dateOfBirth: Date;
    gender: string;
    phone: string;
    billNo: string;
    guardianName: string;
    guardianContact: string;
    localGuardianName: string;
    localGuardianContact: string;
    referredBy: string;
    admissionNo: string;
    admissionFee: string;
    tShirtFee: boolean;
    examFee: boolean;
    documentFee: boolean;
    bookFee: boolean;
    coursesFee: boolean;
    totalDiscount: string;
    totalAfterDiscount: string;
    paidAmount: string;
    remainingAmount: string;
    paymentMethod: string;
    paymentDeadline: Date;
  };
  handleChange: (field: string, value: any) => void;
};

// Step 1 Component
const Step1 = ({ formData, handleChange }: StepProps) => {
  const [date, setDate] = useState<Date | undefined>(formData.dateOfBirth);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    handleChange("dateOfBirth", selectedDate);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <Label htmlFor="studentName">Student Name</Label>
          <Input
            id="studentName"
            placeholder="Enter student name"
            value={formData.studentName}
            onChange={(e) => handleChange("studentName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="schoolName">School Name</Label>
          <Input
            id="schoolName"
            placeholder="Enter school name"
            value={formData.schoolName}
            onChange={(e) => handleChange("schoolName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="address">Enter Address</Label>
          <Input
            id="address"
            placeholder="Enter address"
            value={formData.address}
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
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <Label htmlFor="gender">Select Gender</Label>
          <Select
            onValueChange={(value) => handleChange("gender", value)}
            value={formData.gender}
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
          <Label htmlFor="phone">Enter Phone Number</Label>
          <Input
            id="phone"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="billNo">Enter Bill No</Label>
          <Input
            id="billNo"
            placeholder="Enter bill number"
            value={formData.billNo}
            onChange={(e) => handleChange("billNo", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="guardianName">Enter Guardian Name</Label>
          <Input
            id="guardianName"
            placeholder="Enter guardian name"
            value={formData.guardianName}
            onChange={(e) => handleChange("guardianName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="guardianContact">Enter Guardian Contact</Label>
          <Input
            id="guardianContact"
            placeholder="Enter guardian contact"
            value={formData.guardianContact}
            onChange={(e) => handleChange("guardianContact", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="localGuardianName">Enter Local Guardian Name</Label>
          <Input
            id="localGuardianName"
            placeholder="Enter local guardian name"
            value={formData.localGuardianName}
            onChange={(e) => handleChange("localGuardianName", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="localGuardianContact">
            Enter Local Guardian Contact
          </Label>
          <Input
            id="localGuardianContact"
            placeholder="Enter local guardian contact"
            value={formData.localGuardianContact}
            onChange={(e) =>
              handleChange("localGuardianContact", e.target.value)
            }
          />
        </div>
        <div>
          <Label htmlFor="referredBy">Referred By</Label>
          <Select
            onValueChange={(value) => handleChange("referredBy", value)}
            value={formData.referredBy}
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
          <Label htmlFor="admissionNo">Enter Admission Number</Label>
          <Input
            id="admissionNo"
            placeholder="Enter admission number"
            value={formData.admissionNo}
            onChange={(e) => handleChange("admissionNo", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Step1;
