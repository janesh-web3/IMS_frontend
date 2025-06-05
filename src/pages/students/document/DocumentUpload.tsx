// src/components/students/DocumentUploadForm.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"; // Assuming Shadcn's toast
import { crudRequest } from "@/lib/api";
import { IDocument } from "@/types/document";

interface DocumentUploadFormProps {
  studentId: string;
  onUploadSuccess: (newDocument: IDocument) => void; // Callback after successful upload
}

// Define common document types, you can extend this
const DOCUMENT_TYPES = [
  "Passport",
  "IELTS Certificate",
  "Offer Letter",
  "Visa Copy",
  "Academic Transcript",
  "Resume/CV",
  "SOP",
  "LOR",
  "Other",
];

export function DocumentUploadForm({
  studentId,
  onUploadSuccess,
}: DocumentUploadFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(event.target.files);
    setError(null); // Clear previous errors
  };

  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      setError("Please select at least one file to upload.");
      return;
    }
    if (!documentType) {
      setError("Please select a document type.");
      return;
    }

    // Basic frontend validation (size/type) - backend is the ultimate validator
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setError(`File "${file.name}" exceeds the 5MB size limit.`);
        return;
      }
      // Add more specific MIME type checks if needed, though Multer handles this robustly
    }

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("documents", selectedFiles[i]);
    }
    formData.append("documentType", documentType); // Backend expects this

    setIsUploading(true);
    setError(null);

    try {
      const response = await crudRequest<any>(
        "POST",
        `/document/${studentId}/documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      // Check if documents exist in the response (not nested under data)
      if (response.documents && response.documents.length > 0) {
        response.documents.forEach((doc: IDocument) => onUploadSuccess(doc)); // Notify parent for each new doc
        toast({
          title: "Success",
          description: `${response.documents.length} document(s) uploaded successfully.`,
        });
      } else {
        toast({
          title: "Info",
          description:
            response.message ||
            "Upload processed, but no document data returned.",
          variant: "default",
        });
      }
      setSelectedFiles(null); // Reset file input
      setDocumentType(""); // Reset document type
      // Optionally reset the input field value if it's controlled
      if (event.target instanceof HTMLFormElement) {
        event.target.reset();
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to upload documents.";
      setError(errorMessage);
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-md">
      <div>
        <Label htmlFor="document-type">Document Type</Label>
        <Select onValueChange={handleDocumentTypeChange} value={documentType}>
          <SelectTrigger id="document-type">
            <SelectValue placeholder="Select document type" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="file-upload">
          Select Files (Max 5MB each, PDF, DOC, DOCX, JPG, PNG)
        </Label>
        <Input
          id="file-upload"
          type="file"
          multiple
          onChange={handleFileChange}
          disabled={isUploading}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />
        {selectedFiles && selectedFiles.length > 0 && (
          <p className="text-sm text-muted-foreground mt-1">
            {selectedFiles.length} file(s) selected.
          </p>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        type="submit"
        disabled={isUploading || !selectedFiles || !documentType}
      >
        {isUploading ? "Uploading..." : "Upload Documents"}
      </Button>
    </form>
  );
}
