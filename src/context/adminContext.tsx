import { crudRequest } from "@/lib/api";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Notification {
  message: string;
  title: string;
  type: string;
}
interface AdminDetails {
  role: string;
  username: string;
  notifications: {
    notificationId: Notification;
  }[];
}

// Define the initial state for the basic plan
const initialState: AdminDetails = {
  role: "admin",
  username: "",
  notifications: [],
};

// Define the shape of the context
interface AdminContextType {
  adminDetails: AdminDetails;
  isLoading: boolean;
}

// Create the context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

type AdminProviderProps = {
  children: React.ReactNode;
};

// Provider to fetch and store package details
export default function AdminProvider({ children }: AdminProviderProps) {
  const [adminDetails, setAdminDetails] = useState<AdminDetails>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const response = await crudRequest<AdminDetails>(
          "GET",
          "/user/get-role"
        );
        setAdminDetails(response);
        console.log(response);
      } catch (error) {
        console.error("Failed to fetch package details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDetails();
  }, []);

  return (
    <AdminContext.Provider value={{ adminDetails, isLoading }}>
      {children}
    </AdminContext.Provider>
  );
}

// Custom hook for accessing the package context
export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("usePackageContext must be used within a PackageProvider");
  }
  return context;
};
