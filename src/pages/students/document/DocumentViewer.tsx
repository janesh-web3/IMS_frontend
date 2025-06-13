import { IDocument } from '@/types/document';
import { Button } from '@/components/ui/button';
import { FileText, Image, FileIcon } from 'lucide-react';
import { socketBaseUrl } from '@/server';

interface DocumentViewerProps {
  document: IDocument;
  studentId: string;
}

export function DocumentViewer({ document, studentId }: DocumentViewerProps) {
  // Function to get the appropriate file icon
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimetype === 'application/pdf') return <FileText className="h-4 w-4" />;
    return <FileIcon className="h-4 w-4" />;
  };

  // Function to get the document URL
  const getDocumentUrl = () => {
    if (!document.path) return '';
    
    // Get filename from path
    const pathParts = document.path.split(/[\\\/]/);
    const filename = pathParts[pathParts.length - 1];
    
    // Use the API endpoint for reliable access
    return `${socketBaseUrl}/api/document/${studentId}/file?filename=${encodeURIComponent(filename)}`;
  };

  const handleViewDocument = () => {
    const url = getDocumentUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleViewDocument}
      className="flex items-center gap-1"
    >
      {getFileIcon(document.mimetype)}
      View
    </Button>
  );
} 