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
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// StepProps interface
interface StepProps {
  formData: {
    admissionFee: string;
    tShirtFee: boolean;
    examFee: boolean;
    documentFee: boolean;
    totalDiscount: string;
    totalAfterDiscount: string;
    paidAmount: string;
    remainingAmount: string;
    paymentMethod: string;
    paymentDeadline: Date | undefined;
  };
  handleChange: (field: string, value: any) => void;
}

// Step 2 Component
const Step2: React.FC<StepProps> = ({ formData, handleChange }) => {
  const [date, setDate] = useState<Date | undefined>(formData.paymentDeadline);

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    handleChange("paymentDeadline", selectedDate);
  };

  const handleCheckboxChange = (field: string) => {
    handleChange(field, !formData[field as keyof typeof formData]);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <Label htmlFor="admissionFee">Select Admission Fee</Label>
          <Select
            onValueChange={(value) => handleChange("admissionFee", value)}
            value={formData.admissionFee}
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
        <div>
          <Label htmlFor="tShirtFee">T-Shirt Fee</Label>
          <Checkbox
            id="tShirtFee"
            checked={formData.tShirtFee}
            onCheckedChange={() => handleCheckboxChange("tShirtFee")}
          />
        </div>
        <div>
          <Label htmlFor="examFee">Exam Fee</Label>
          <Checkbox
            id="examFee"
            checked={formData.examFee}
            onCheckedChange={() => handleCheckboxChange("examFee")}
          />
        </div>
        <div>
          <Label htmlFor="documentFee">Document Fee</Label>
          <Checkbox
            id="documentFee"
            checked={formData.documentFee}
            onCheckedChange={() => handleCheckboxChange("documentFee")}
          />
        </div>
        <div>
          <Label htmlFor="totalDiscount">Enter Total Discount</Label>
          <Input
            id="totalDiscount"
            placeholder="Enter total discount"
            value={formData.totalDiscount}
            onChange={(e) => handleChange("totalDiscount", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="totalAfterDiscount">Enter Total After Discount</Label>
          <Input
            id="totalAfterDiscount"
            placeholder="Enter total after discount"
            value={formData.totalAfterDiscount}
            onChange={(e) => handleChange("totalAfterDiscount", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="paidAmount">Enter Paid Amount</Label>
          <Input
            id="paidAmount"
            placeholder="Enter paid amount"
            value={formData.paidAmount}
            onChange={(e) => handleChange("paidAmount", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="remainingAmount">Enter Remaining Amount</Label>
          <Input
            id="remainingAmount"
            placeholder="Enter remaining amount"
            value={formData.remainingAmount}
            onChange={(e) => handleChange("remainingAmount", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="paymentMethod">Select Payment Method</Label>
          <Select
            onValueChange={(value) => handleChange("paymentMethod", value)}
            value={formData.paymentMethod}
          >
            <SelectTrigger
              id="paymentMethod"
              className="items-start [&_[data-description]]:hidden"
            >
              <SelectValue placeholder="Select Payment Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Card">Card</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="paymentDeadline">Payment Deadline</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {date ? format(date, "PPP") : <span>Payment Deadline</span>}
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
      </div>
    </div>
  );
};

export default Step2;
