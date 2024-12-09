import { useState } from "react";
import { crudRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface BookUpdateFormProps {
  bookId: string;
  initialData: {
    name: string;
    price: number;
    bookType: string;
    isFree: boolean;
  };
  modalClose: () => void;
}

const BookUpdateForm = ({
  bookId,
  initialData,
  modalClose,
}: BookUpdateFormProps) => {
  const [formData, setFormData] = useState(initialData);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await crudRequest(
        "PUT",
        `/book/update-book/${bookId}`,
        formData
      );
      if (response.success) {
        toast.success("Book updated successfully");
        modalClose();
      }
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error("Failed to update book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Book Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="bookType">Book Type</Label>
        <Select
          value={formData.bookType}
          onValueChange={(value) =>
            setFormData({ ...formData, bookType: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select book type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="COURSE_MATERIAL">Course Material</SelectItem>
            <SelectItem value="GENERAL_KNOWLEDGE">General Knowledge</SelectItem>
            <SelectItem value="IQ">IQ</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isFree"
          checked={formData.isFree}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isFree: checked as boolean })
          }
        />
        <Label htmlFor="isFree">Free Book</Label>
      </div>

      {!formData.isFree && (
        <div>
          <Label htmlFor="price">Price</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            required
          />
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Book"}
      </Button>
    </form>
  );
};

export default BookUpdateForm;
