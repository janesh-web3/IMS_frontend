import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { crudRequest } from "@/lib/api";
import { toast } from "react-toastify";
import { generateBill } from "@/components/shared/BillGenerator";

interface SalaryPaymentFormProps {
  teacher: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SalaryPaymentForm({
  teacher,
  onSuccess,
  onCancel,
}: SalaryPaymentFormProps) {
  const [payment, setPayment] = useState({
    amount: 0,
    paymentMethod: "",
    description: "",
  });

  const handleSubmit = async () => {
    try {
      if (!payment.amount || !payment.paymentMethod) {
        toast.error("Please fill all required fields");
        return;
      }

      // Make API call to pay salary
      await crudRequest("POST", "/faculty/pay-salary", {
        facultyId: teacher._id,
        ...payment,
      });

      // Generate bill
      generateBill({
        title: "Salary Payment Receipt",
        recipientName: teacher.name,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        description:
          payment.description || `Salary payment for ${teacher.name}`,
        type: "salary",
        additionalDetails: [
          {
            label: "Monthly Salary",
            value: teacher.monthlySalary || 0,
          },
          {
            label: "Percentage",
            value: `${teacher.percentage || 0}%`,
          },
        ],
      });

      toast.success("Salary paid successfully");
      onSuccess();
    } catch (error) {
      console.error("Error paying salary:", error);
      toast.error("Failed to pay salary");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>Amount</Label>
        <Input
          type="number"
          value={payment.amount}
          onChange={(e) =>
            setPayment({ ...payment, amount: Number(e.target.value) })
          }
          placeholder="Enter amount"
        />
      </div>

      <div className="space-y-2">
        <Label>Payment Method</Label>
        <Select
          value={payment.paymentMethod}
          onValueChange={(value) =>
            setPayment({ ...payment, paymentMethod: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Cash">Cash</SelectItem>
            <SelectItem value="Online">Online</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Description (Optional)</Label>
        <Input
          value={payment.description}
          onChange={(e) =>
            setPayment({ ...payment, description: e.target.value })
          }
          placeholder="Enter description"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Pay Salary</Button>
      </div>
    </div>
  );
}
