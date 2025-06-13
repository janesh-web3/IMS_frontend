import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, FolderPlus, FileText } from "lucide-react";
import { DocumentUploadForm } from "./DocumentUpload";
import { DocumentFolderView } from "./DocumentFolderView";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IDocument, IDocumentFolder } from "@/types/document";
import { crudRequest } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

export default function StudentDocumentPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [folders, setFolders] = useState<IDocumentFolder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
      fetchDocuments();
      fetchFolders();
    }
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      const response = await crudRequest<any>("GET", `/student/get-student/${studentId}`);
      setStudent(response.result);
    } catch (err: any) {
      setError("Failed to fetch student details.");
      console.error("Error fetching student:", err);
    }
  };

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await crudRequest<IDocument[]>("GET", `/document/${studentId}/documents`);
      setDocuments(response);
    } catch (err: any) {
      setError("Failed to fetch documents.");
      console.error("Error fetching documents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    try {
      const response = await crudRequest<IDocumentFolder[]>("GET", `/document/${studentId}/folders`);
      setFolders(response);
    } catch (err: any) {
      console.error("Error fetching folders:", err);
    }
  };

  const handleDocumentAdded = (newDocument: IDocument) => {
    setDocuments((prev) => [newDocument, ...prev]);
    setShowUploadForm(false);
  };

  const handleDocumentDeleted = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
  };

  const handleDocumentMoved = async (documentId: string, newFolderId: string) => {
    try {
      await crudRequest("PUT", `/document/${studentId}/documents/${documentId}`, {
        folderId: newFolderId,
      });
      
      setDocuments((prev) =>
        prev.map((doc) =>
          doc._id === documentId ? { ...doc, folderId: newFolderId } : doc
        )
      );
      
      toast({
        title: "Success",
        description: "Document moved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to move document.",
        variant: "destructive",
      });
    }
  };

  const handleFolderCreated = (newFolder: IDocumentFolder) => {
    setFolders((prev) => [...prev, newFolder]);
  };

  if (error) {
    return (
      <div className="p-4">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <h1 className="text-2xl font-bold">
            {student?.personalInfo?.studentName || "Student"}'s Documents
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Create a new folder to organize documents.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input id="folderName" placeholder="Enter folder name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folderDescription">Description</Label>
                  <Input id="folderDescription" placeholder="Enter folder description" />
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => setShowUploadForm(!showUploadForm)}>
            {showUploadForm ? "Cancel" : (
              <>
                <Plus className="mr-2 h-4 w-4" /> Upload Documents
              </>
            )}
          </Button>
        </div>
      </div>

      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <CardDescription>
              Upload documents for {student?.personalInfo?.studentName || "the student"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentUploadForm 
              studentId={studentId || ""} 
              onUploadSuccess={handleDocumentAdded}
              folders={folders}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            Manage {student?.personalInfo?.studentName || "student"}'s documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentFolderView
            studentId={studentId || ""}
            documents={documents}
            folders={folders}
            onDocumentDeleted={handleDocumentDeleted}
            onDocumentMoved={handleDocumentMoved}
            onFolderCreated={handleFolderCreated}
          />
        </CardContent>
      </Card>
    </div>
  );
} 