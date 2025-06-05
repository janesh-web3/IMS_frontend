import  { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { DocumentUploadForm } from "./DocumentUpload";
import { StudentDocumentList } from "./StudentDocumentList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IDocument } from "@/types/document";
import { crudRequest } from "@/lib/api";

export default function StudentDocumentPage() {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [_isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
      fetchDocuments();
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

  const handleDocumentAdded = (newDocument: IDocument) => {
    setDocuments((prev) => [newDocument, ...prev]);
    setShowUploadForm(false); // Hide the form after successful upload
  };

  const handleDocumentDeleted = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
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
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          {showUploadForm ? "Cancel" : (
            <>
              <Plus className="mr-2 h-4 w-4" /> Upload Documents
            </>
          )}
        </Button>
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
          <StudentDocumentList
            studentId={studentId || ""}
            initialDocuments={documents}
            onDocumentDeleted={handleDocumentDeleted}
          />
        </CardContent>
      </Card>
    </div>
  );
} 