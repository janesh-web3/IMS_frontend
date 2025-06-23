import { ReactNode } from 'react';
import { FileText, Image, File } from 'lucide-react';

// Get file icon based on mimetype
export const getFileIcon = (mimetype: string): ReactNode => {
  if (mimetype.startsWith('image/')) return <Image className="h-6 w-6 text-blue-500" />;
  if (mimetype === 'application/pdf') return <FileText className="h-6 w-6 text-red-500" />;
  return <File className="h-6 w-6 text-gray-500" />;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}; 