// src/components/students/StudentDocumentList.tsx
import { useState, useEffect } from "react";
import { IDocument } from "@/types/document"; // Adjust path
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Trash2, FileText, File, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { crudRequest } from "@/lib/api";
import { socketBaseUrl } from "@/server";
import { DocumentViewer } from "./DocumentViewer"; // Import our new component

interface StudentDocumentListProps {
  studentId: string;
  initialDocuments?: IDocument[]; // Optional: if documents are already fetched by parent
  onDocumentDeleted: (documentId: string) => void; // Callback after deletion
}

export function StudentDocumentList({
  studentId,
  initialDocuments,
  onDocumentDeleted,
}: StudentDocumentListProps) {
  const [documents, setDocuments] = useState<IDocument[]>(
    initialDocuments || []
  );
  const [isLoading, setIsLoading] = useState(!initialDocuments);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!initialDocuments) {
      // Fetch only if not provided
      fetchDocuments();
    } else {
      setDocuments(initialDocuments);
    }
  }, [studentId, initialDocuments]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Fetching documents for student:', studentId);
      const response = await crudRequest<IDocument[]>(
        "GET",
        `/document/${studentId}/documents`
      );
      console.log('Documents fetched:', response);
      setDocuments(response);
    } catch (err: any) {
      console.error("Error fetching documents:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to fetch documents.";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (doc: IDocument) => {
    // Get the filename from the path
    const getFilenameFromPath = () => {
      if (!doc.path) return '';
      
      // Get the last part of the path which should be the filename
      const parts = doc.path.split(/[\\\/]/);
      return parts[parts.length - 1];
    };
    
    const filename = getFilenameFromPath();
    
    // Construct the download URL using our new file endpoint
    const downloadUrl = filename 
      ? `${socketBaseUrl}/api/document/${studentId}/file?filename=${encodeURIComponent(filename)}&download=true`
      : `${socketBaseUrl}/api/document/${studentId}/documents/${doc._id}`;
    
    console.log('Downloading file:', {
      path: doc.path,
      filename,
      downloadUrl
    });
    
    // Open in a new tab to download
    window.open(downloadUrl, "_blank");
  };

  // Function to get the appropriate file icon
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimetype === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const handleDelete = async (documentId: string) => {
    try {
      await crudRequest(
        "DELETE",
        `/document/${studentId}/documents/${documentId}`
      );
      setDocuments((prevDocs) =>
        prevDocs.filter((doc) => doc._id !== documentId)
      );
      onDocumentDeleted(documentId); // Notify parent
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      });
    } catch (err: any) {
      console.error("Error deleting document:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to delete document.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <p>Loading documents...</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  return (
    <div className="space-y-4">
      {documents.length === 0 ? (
        <p>No documents uploaded for this student yet.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>File Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Uploaded On</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc._id}>
                <TableCell className="font-medium flex items-center">
                  {getFileIcon(doc.mimetype)}
                  <span className="ml-2">{doc.originalname}</span>
                </TableCell>
                <TableCell>{doc.documentType}</TableCell>
                <TableCell>
                  {(doc.size / (1024 * 1024)).toFixed(2)} MB
                </TableCell>
                <TableCell>
                  {new Date(doc.uploadDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="space-x-2 flex">
                  {/* Our new document viewer component */}
                  <DocumentViewer document={doc} studentId={studentId} />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(doc)}
                    title="Download"
                    className="flex items-center gap-1"
                  >
                    <Download size={16} />
                    Download
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" title="Delete" className="flex items-center gap-1">
                        <Trash2 size={16} />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the document "{doc.originalname}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(doc._id)}
                        >
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
