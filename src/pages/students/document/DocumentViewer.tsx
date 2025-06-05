import { useState, useEffect } from 'react';
import { IDocument } from '@/types/document';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image, FileIcon, ZoomIn, ZoomOut } from 'lucide-react';
import { Card,  } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { socketBaseUrl } from '@/server';
import './document-viewer.css';

interface DocumentViewerProps {
  document: IDocument;
  studentId: string;
}

export function DocumentViewer({ document, studentId }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");

  // Extract base server URL (without /api suffix)
  const baseServerUrl = socketBaseUrl; // Use socketBaseUrl as it doesn't have the /api suffix


  // New simpler endpoint using just the filename
  const getFilenameFromPath = () => {
    if (!document.path) return '';

    // Get the last part of the path which should be the filename
    const parts = document.path.split(/[\\\/]/);
    return parts[parts.length - 1];
  };

  const filename = getFilenameFromPath();
  const fileViewUrl = filename
    ? `${baseServerUrl}/api/document/${studentId}/file?filename=${encodeURIComponent(filename)}`
    : '';

  // Use the appropriate URL based on file type
  const downloadUrl = `${fileViewUrl}&download=true`;


  // Function to get the appropriate file icon
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('image/')) return <Image className="h-6 w-6" />;
    if (mimetype === 'application/pdf') return <FileText className="h-6 w-6" />;
    return <FileIcon className="h-6 w-6" />;
  };

  // Handle zoom in/out for images
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };


  // Function to determine if we can preview this file type
  const canPreview = (mimetype: string): boolean => {
    return (
      mimetype.startsWith('image/') || 
      mimetype === 'application/pdf' ||
      mimetype === 'text/plain'
    );
  };

  // Function to determine if this is an image
  const isImage = (mimetype: string): boolean => {
    return mimetype.startsWith('image/');
  };

  // Function to determine if this is a PDF
  const isPDF = (mimetype: string): boolean => {
    return mimetype === 'application/pdf';
  };

  // Reset loading state when opening the dialog
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setIsLoading(true);
      // Set the image source when opening the dialog
      const filename = getFilenameFromPath();
      const imageUrl = filename
        ? `${baseServerUrl}/api/document/${studentId}/file?filename=${encodeURIComponent(filename)}`
        : '';
      
      console.log('Document viewer URL:', imageUrl);
      setImageSrc(imageUrl);
    } else {
      // Reset zoom when closing
      setZoom(100);
    }
  };

  useEffect(() => {
    if (isOpen && document) {
      // Extract just the filename from the path if needed
      const filename = getFilenameFromPath();
      const imageUrl = filename
        ? `${baseServerUrl}/api/document/${studentId}/file?filename=${encodeURIComponent(filename)}`
        : '';
      
      console.log('Document viewer URL:', imageUrl);
      setImageSrc(imageUrl);
    }
  }, [document, studentId, isOpen, baseServerUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <FileText size={16} />
          View
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 file-name">
            <span className="file-name-icon">{getFileIcon(document.mimetype)}</span>
            {document.originalname}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 file-info">
            <Badge variant="outline">{document.documentType}</Badge>
            <span className="text-xs text-muted-foreground">
              {(document.size / (1024 * 1024)).toFixed(2)} MB •
              {new Date(document.uploadDate).toLocaleDateString()}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="document-preview mt-4 relative">
          {isLoading && (
            <div className="document-loading">
              <span>Loading document...</span>
            </div>
          )}

          {error && (
            <div className="p-4 text-red-500 text-center">
              {error}
            </div>
          )}

          {canPreview(document.mimetype) ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="w-full overflow-auto p-2 flex justify-center">
                {isImage(document.mimetype) ? (
                  <img 
                    src={imageSrc} 
                    alt={document.originalname}
                    style={{ 
                      width: `${zoom}%`,
                      maxWidth: zoom > 100 ? 'none' : '100%',
                      transition: 'width 0.3s ease'
                    }}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      setError('Failed to load image. The file may be corrupted or inaccessible.');
                      setIsLoading(false);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully');
                      setIsLoading(false);
                      setError(null);
                    }}
                  />
                ) : isPDF(document.mimetype) ? (
                  <div className="w-full h-[500px]">
                    <iframe
                      src={imageSrc}
                      className="w-full h-full border-0"
                      title={document.originalname}
                      onLoad={() => setIsLoading(false)}
                      onError={() => {
                        setIsLoading(false);
                        setError("Failed to load PDF. The file may be corrupted or inaccessible.");
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className="text-4xl mb-4">{getFileIcon(document.mimetype)}</div>
                    <p className="text-lg font-medium">{document.originalname}</p>
                    <p className="text-sm text-gray-500 mb-4">{document.mimetype}</p>
                    <a 
                      href={imageSrc || ''} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                      Open Document
                    </a>
                  </div>
                )}
              </div>
              <div className="zoom-controls">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                >
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm">{zoom}%</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                >
                  <ZoomIn size={16} />
                </Button>
              </div>
            </div>
          ) : (
            <Card className="p-6 flex flex-col items-center justify-center gap-4">
              <div className="document-icon-container">
                {getFileIcon(document.mimetype)}
              </div>
              <p className="text-center">
                This file type cannot be previewed directly.
              </p>
            </Card>
          )}
        </div>

        <div className="document-footer">
          <div className="text-sm text-muted-foreground">
            {document.mimetype}
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
            <Button
              variant="default"
              onClick={() => window.open(downloadUrl, '_blank')}
              className="gap-1"
            >
              <Download size={16} />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 