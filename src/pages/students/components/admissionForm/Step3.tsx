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
import { Checkbox } from "@/components/ui/checkbox";

// StepProps interface
interface StepProps {
  formData: {
    coursesFee: string;
  };
  handleChange: (field: string, value: any) => void;
}

// Step 3 Component
const Step3: React.FC<StepProps> = ({ formData, handleChange }) => {
  return (
    <div>
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <Label htmlFor="coursesFee">Enter Course Fee</Label>
          <Input
            id="coursesFee"
            placeholder="Enter course fee"
            value={formData.coursesFee}
            onChange={(e) => handleChange("coursesFee", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default Step3;
