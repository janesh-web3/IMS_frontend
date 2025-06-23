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
import { IDocument, IDocumentFolder } from "@/types/document";

interface DocumentUploadFormProps {
  studentId: string;
  onUploadSuccess: (document: IDocument) => void;
  folders: IDocumentFolder[];
}

export function DocumentUploadForm({
  studentId,
  onUploadSuccess,
  folders,
}: DocumentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string>("none");
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentType) {
      toast({
        title: "Error",
        description: "Please select a file and document type.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("documents", file);
    formData.append("documentType", documentType);
    if (selectedFolder && selectedFolder !== "none") {
      formData.append("folderId", selectedFolder);
    }

    try {
      const response = await crudRequest<{ documents: IDocument[] }>(
        "POST",
        `/document/${studentId}/documents`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      
      if (response.documents && response.documents.length > 0) {
        onUploadSuccess(response.documents[0]);
        setFile(null);
        setDocumentType("");
        setSelectedFolder("none");
        toast({
          title: "Success",
          description: "Document uploaded successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload document.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="file">Select File</Label>
        <Input
          id="file"
          type="file"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="documentType">Document Type</Label>
        <Input
          id="documentType"
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          placeholder="Enter document type"
          disabled={isUploading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="folder">Select Folder</Label>
        <Select
          value={selectedFolder}
          onValueChange={setSelectedFolder}
          disabled={isUploading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Folder</SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder._id} value={folder._id}>
                {folder.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload Document"}
      </Button>
    </form>
  );
}
