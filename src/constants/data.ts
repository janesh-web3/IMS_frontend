import { NavItem } from "@/types";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: "layoutDashboard",
    tag: "Basic",
    label: "Dashboard",
    role: "all",
  },
  {
    title: "Students",
    href: "/student",
    icon: "graduationCap",
    tag: "Basic",
    label: "Student",
    role: "admin",
  },
  {
    title: "Visit Students",
    href: "/visit-student",
    icon: "clipboardCheck",
    tag: "Basic",
    role: "admin",
    label: "Visit Students",
  },
  {
    title: "Courses",
    href: "/course",
    icon: "bookOpen",
    role: "admin",
    tag: "Basic",
    label: "Courses",
  },
  {
    title: "Teacher",
    href: "/teacher",
    icon: "userCog",
    tag: "Basic",
    role: "admin",
    label: "Teacher",
  },
  {
    title: "Recipt",
    href: "/recipt",
    role: "admin",
    icon: "receipt",
    tag: "Basic",
    label: "Recipt",
  },
  {
    title: "Payment",
    href: "/payment",
    role: "admin",
    icon: "creditCard",
    tag: "Basic",
    label: "Payment",
  },
  {
    title: "Handover",
    href: "/handover",
    icon: "switchHorizontal",
    role: "admin",
    tag: "Basic",
    label: "Handover",
  },
  {
    title: "Quiz",
    href: "/quiz",
    icon: "helpCircle",
    role: "all",
    tag: "Premium",
    label: "Quiz",
  },
  {
    title: "AI Model",
    href: "/ai-model",
    icon: "brain",
    role: "all",
    tag: "PremiumPlus",
    label: "AI Model",
  },
  {
    title: "Chat Bot",
    href: "/chat-bot",
    role: "all",
    icon: "messageSquare",
    tag: "PremiumPlus",
    label: "Chat Bot",
  },
  {
    title: "Live Classes",
    role: "admin",
    href: "/live-classes",
    icon: "video",
    tag: "PremiumPlus",
    label: "Live Classes",
  },
  {
    title: "Notice",
    href: "/notice",
    icon: "bell",
    role: "all",
    tag: "PremiumPlus",
    label: "Notice",
  },
  {
    title: "ID Card",
    href: "/id-card",
    role: "admin",
    icon: "idCard",
    tag: "PremiumPlus",
    label: "ID Card",
  },
  {
    title: "Complain",
    href: "/complain",
    role: "all",
    icon: "alertCircle",
    tag: "PremiumPlus",
    label: "Complain",
  },
];

export const users = [
  {
    id: 1,
    name: "Candice Schiner",
    company: "Dell",
    role: "Frontend Developer",
    verified: false,
    status: "Active",
  },
  {
    id: 2,
    name: "John Doe",
    company: "TechCorp",
    role: "Backend Developer",
    verified: true,
    status: "Active",
  },
  {
    id: 3,
    name: "Alice Johnson",
    company: "WebTech",
    role: "UI Designer",
    verified: true,
    status: "Active",
  },
  {
    id: 4,
    name: "David Smith",
    company: "Innovate Inc.",
    role: "Fullstack Developer",
    verified: false,
    status: "Inactive",
  },
  {
    id: 5,
    name: "Emma Wilson",
    company: "TechGuru",
    role: "Product Manager",
    verified: true,
    status: "Active",
  },
  {
    id: 6,
    name: "James Brown",
    company: "CodeGenius",
    role: "QA Engineer",
    verified: false,
    status: "Active",
  },
  {
    id: 7,
    name: "Laura White",
    company: "SoftWorks",
    role: "UX Designer",
    verified: true,
    status: "Active",
  },
  {
    id: 8,
    name: "Michael Lee",
    company: "DevCraft",
    role: "DevOps Engineer",
    verified: false,
    status: "Active",
  },
  {
    id: 9,
    name: "Olivia Green",
    company: "WebSolutions",
    role: "Frontend Developer",
    verified: true,
    status: "Active",
  },
  {
    id: 10,
    name: "Robert Taylor",
    company: "DataTech",
    role: "Data Analyst",
    verified: false,
    status: "Active",
  },
];

export const dashboardCard = [
  {
    date: "Today",
    total: 2000,
    role: "Students",
    color: "bg-[#EC4D61] bg-opacity-40",
  },
  {
    date: "Today",
    total: 2000,
    role: "Teachers",
    color: "bg-[#FFEB95] bg-opacity-100",
  },
  {
    date: "Today",
    total: 2000,
    role: "Parents",
    color: "bg-[#84BD47] bg-opacity-30",
  },
  {
    date: "Today",
    total: 2000,
    role: "Schools",
    color: "bg-[#D289FF] bg-opacity-30",
  },
];

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  date_of_birth: string; // Consider using a proper date type if possible
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
  longitude?: number; // Optional field
  latitude?: number; // Optional field
  job: string;
  profile_picture?: string | null; // Profile picture can be a string (URL) or null (if no picture)
};
