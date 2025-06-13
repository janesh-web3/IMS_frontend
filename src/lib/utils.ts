import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
  }).format(amount);
};


export const formatDate = (date : any) => {
  // Get the month, day, and year
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
};

export function dateFormatter(dateString : any) {
  const inputDate = new Date(dateString);

  if (isNaN(inputDate.getTime())) {
    return "Invalid Date";
  }

  const year = inputDate.getFullYear();
  const month = String(inputDate.getMonth() + 1).padStart(2, "0");
  const day = String(inputDate.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  return formattedDate;
}

export function getInitials(fullName : string) {
  const names = fullName.split(" ");

  const initials = names.slice(0, 2).map((name) => name[0].toUpperCase());

  const initialsStr = initials.join("");

  return initialsStr;
}

export const PRIOTITYSTYELS = {
  high: "text-destructive",
  medium: "text-primary",
  low: "text-muted-foreground",
};

export const TASK_TYPE = {
  todo: "bg-primary text-primary-foreground",
  "in progress": "bg-blue text-primary-foreground",
  completed: "bg-green-600 dark:bg-green-500 text-white",
  pending: "bg-yellow-600 dark:bg-yellow-500 text-white",
};

export const TASK_STATUS_COLORS = {
  "Pending": {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-300",
    icon: "text-yellow-500",
    border: "border-yellow-200 dark:border-yellow-800"
  },
  "In Progress": {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
    icon: "text-blue-500",
    border: "border-blue-200 dark:border-blue-800"
  },
  "On Hold": {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-800 dark:text-amber-300",
    icon: "text-amber-500",
    border: "border-amber-200 dark:border-amber-800"
  },
  "Completed": {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-300",
    icon: "text-green-500",
    border: "border-green-200 dark:border-green-800"
  },
  "Cancelled": {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
    icon: "text-red-500",
    border: "border-red-200 dark:border-red-800"
  }
};

export const PRIORITY_COLORS = {
  "Low": {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-300",
  },
  "Medium": {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-300",
  },
  "High": {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    text: "text-orange-800 dark:text-orange-300",
  },
  "Urgent": {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-300",
  }
};

export const BGS = [
  "bg-primary text-primary-foreground",
  "bg-blue text-primary-foreground",
  "bg-destructive text-destructive-foreground",
  "bg-green-600 dark:bg-green-500 text-white",
];
