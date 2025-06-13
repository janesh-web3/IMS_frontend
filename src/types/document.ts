// src/types/document.ts
export interface IDocument {
    _id: string; // MongoDB ObjectId
    filename: string;
    originalname: string;
    path: string; // Path on the server, primarily for backend use
    mimetype: string;
    size: number;
    uploadDate: Date;
    documentType: string;
    studentId: string;
    folderId?: string | IDocumentFolder; // Can be either string (ID) or populated folder object
    color?: string;
  }
  
  // You might also want to update your existing Student interface
  // src/types/student.ts (example update)
  export interface IStudent {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    // ... other student fields
    documents?: IDocument[]; // Optional: if you fetch full document details with student
    documentCount?: number; // Optional: if you only fetch the count for table views
  }

  export interface IDocumentFolder {
    _id: string;
    name: string;
    description?: string;
    color?: string;
    studentId: string;
    createdAt: Date;
    updatedAt: Date;
  }

  // Default folder types
  export const DEFAULT_FOLDERS = [
    { name: 'Personal', color: 'dashboard1' },
    { name: 'Academic', color: 'dashboard2' },
    { name: 'Resume/CV', color: 'dashboard3' },
    { name: 'Certificates', color: 'dashboard4' },
    { name: 'Projects', color: 'dashboard5' },
    { name: 'References', color: 'dashboard6' },
    { name: 'Other', color: 'dashboard7' }
  ];