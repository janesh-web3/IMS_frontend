// src/types/document.ts
export interface IDocument {
    _id: string; // MongoDB ObjectId
    filename: string;
    originalname: string;
    path: string; // Path on the server, primarily for backend use
    mimetype: string;
    size: number;
    uploadDate: string; // ISO Date string
    documentType: string;
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