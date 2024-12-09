import { Icons } from "@/components/ui/icons";

export interface NavItem {
  title: string;
  href: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  tag: string;
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export interface Courses {
  _id: string;
  name: string;
  subjects: {
    _id: string;
    subjectName: string;
    monthlyFee: string;
    regularFee: string;
  }[];
  books: Book[];
}

export interface StudentCourse {
  courseEnroll: {
    name: string;
  };
  subjectsEnroll: {
    subjectName: {
      subjectName: string;
    };
    feeType: string;
    discount: string;
    _id: string;
  }[];
}

export interface Student {
  _id: string;
  personalInfo: {
    studentName: string;
    schoolName: string;
    address: string;
    dateOfBirth: string | null;
    gender: string;
    contactNo: string;
    billNo: Array<{
      billNo: string;
      dateSubmitted: string;
      paid: string;
      method: string;
      _id: string;
    }>;
    admissionNumber: string;
    paymentDeadline: string | null;
    guardianName: string;
    guardianContact: string;
    localGuardianName: string;
    localGuardianContact: string;
    paymentMethod: string;
    referredBy: string;
  };
  courses: Array<{
    courseEnroll: {
      _id: string;
      name: string;
    };
    subjectsEnroll: Array<{
      subjectName: {
        _id: string;
        subjectName: string;
        monthlyFee: string;
        regularFee: string;
      };
      feeType: string;
      discount: number;
      _id: string;
    }>;
    booksEnroll: Array<{
      bookName?: {
        _id: string;
        name: string;
        price: number;
        isFree: boolean;
      };
      price: number;
      discount: number;
      _id: string;
    }>;
    _id: string;
  }>;
  booksFee: number;
  admissionFee: number;
  tshirtFee: number;
  examFee: number;
  document: string;
  totalDiscount: number;
  paid: number;
  remaining: number;
  totalAmount: number;
  totalAfterDiscount: number;
  dateOfAdmission: string;
  photo: string | null;
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export interface Book {
  _id: string;
  name: string;
  price: number;
  bookType: string;
  isFree: boolean;
  course: string;
}

export interface SubjectEnroll {
  subjectName: {
    _id: string;
    subjectName: string;
    monthlyFee: string;
    regularFee: string;
  };
  feeType: string;
  discount: number;
  _id: string;
}
