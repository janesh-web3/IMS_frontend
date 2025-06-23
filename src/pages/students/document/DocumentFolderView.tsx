import { useState } from 'react';
import { IDocument, IDocumentFolder } from '@/types/document';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Trash2, 
  FolderPlus,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { DocumentViewer } from './DocumentViewer';
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
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { crudRequest } from '@/lib/api';
import { getFileIcon, formatFileSize } from '@/utils/documentUtils';

interface DocumentFolderViewProps {
  studentId: string;
  documents: IDocument[];
  folders: IDocumentFolder[];
  onDocumentDeleted: (documentId: string) => void;
  onDocumentMoved: (documentId: string, newFolderId: string) => void;
  onFolderCreated: (folder: IDocumentFolder) => void;
}

export function DocumentFolderView({
  studentId,
  documents,
  folders,
  onDocumentDeleted,
  onDocumentMoved,
  onFolderCreated,
}: DocumentFolderViewProps) {
  const { toast } = useToast();
  const [_activeFolder, setActiveFolder] = useState<string>('all');
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('dashboard1');

  // Group documents by folder
  const documentsByFolder = documents.reduce((acc, doc) => {
    const folderId = typeof doc.folderId === 'object' ? doc.folderId._id : doc.folderId || 'uncategorized';
    if (!acc[folderId]) {
      acc[folderId] = [];
    }
    acc[folderId].push(doc);
    return acc;
  }, {} as Record<string, IDocument[]>);

  // Get documents for the current folder
  const getDocumentsForFolder = (folderId: string) => {
    if (folderId === 'all') {
      return documents;
    }
    return documentsByFolder[folderId] || [];
  };

  // Handle document deletion
  const handleDelete = async (documentId: string) => {
    try {
      await crudRequest('DELETE', `/document/${studentId}/documents/${documentId}`);
      onDocumentDeleted(documentId);
      toast({
        title: 'Success',
        description: 'Document deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete document.',
        variant: 'destructive',
      });
    }
  };

  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a folder name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await crudRequest<IDocumentFolder>('POST', `/document/${studentId}/folders`, {
        name: newFolderName,
        color: newFolderColor,
      });
      
      onFolderCreated(response);
      setShowNewFolderDialog(false);
      setNewFolderName('');
      setNewFolderColor('dashboard1');
      
      toast({
        title: 'Success',
        description: 'Folder created successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create folder.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveFolder}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Documents</TabsTrigger>
            {folders.map((folder) => (
              <TabsTrigger 
                key={folder._id} 
                value={folder._id}
                className={`bg-${folder.color} hover:bg-${folder.color}/90`}
              >
                {folder.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="all" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {getDocumentsForFolder('all').map((doc) => (
                <DocumentCard
                  key={doc._id}
                  document={doc}
                  studentId={studentId}
                  onDelete={handleDelete}
                  onMove={onDocumentMoved}
                  folders={folders}
                />
              ))}
            </div>
          </TabsContent>

          {folders.map((folder) => (
            <TabsContent key={folder._id} value={folder._id} className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getDocumentsForFolder(folder._id).map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    studentId={studentId}
                    onDelete={handleDelete}
                    onMove={onDocumentMoved}
                    folders={folders}
                  />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-4">
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Create a new folder to organize your documents.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="folderName">Folder Name</Label>
                <Input
                  id="folderName"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="folderColor">Folder Color</Label>
                <select
                  id="folderColor"
                  value={newFolderColor}
                  onChange={(e) => setNewFolderColor(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={`dashboard${num}`}>
                      Color {num}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={handleCreateFolder}>Create Folder</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Document Card Component
function DocumentCard({
  document: doc,
  studentId,
  onDelete,
  folders,
}: {
  document: IDocument;
  studentId: string;
  onDelete: (id: string) => void;
  onMove: (id: string, folderId: string) => void;
  folders: IDocumentFolder[];
}) {
  const { toast } = useToast();
  const folder = folders.find(f => f._id === doc.folderId);
  const cardColor = folder?.color || 'dashboard1';

  const handleDownload = async () => {
    try {
      const pathParts = doc.path.split(/[\\\/]/);
      const filename = pathParts[pathParts.length - 1];
      const downloadUrl = `${window.location.origin}/api/document/${studentId}/file?filename=${encodeURIComponent(filename)}&download=true`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.originalname;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: 'Download Started',
        description: 'Your file download has started.',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download the file. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-${cardColor} dark:bg-${cardColor}/20`}>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getFileIcon(doc.mimetype)}
            <CardTitle className="text-lg font-medium truncate">
              {doc.originalname}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Type: {doc.documentType}
          </p>
          <p className="text-sm text-muted-foreground">
            Size: {formatFileSize(doc.size)}
          </p>
          <p className="text-sm text-muted-foreground">
            Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
          </p>
          {folder && (
            <p className="text-sm text-muted-foreground">
              Folder: {folder.name}
            </p>
          )}
          <div className="flex items-center space-x-2 pt-2">
            <DocumentViewer document={doc} studentId={studentId} />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Document</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this document? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(doc._id)}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 