import { crudRequest } from "@/lib/api";
import React, { createContext, useContext, useEffect, useState } from "react";

interface Notification {
  message: string;
  title: string;
  type: string;
  createdAt: string;
  _id: string;
}
interface AdminDetails {
  role: string;
  username: string;
  notifications: {
    isRead: boolean;
    notificationId: Notification;
  }[];
  _id: string;
}

// Define the initial state for the basic plan
const initialState: AdminDetails = {
  role: "admin",
  username: "",
  notifications: [],
  _id: "",
};

// Define the shape of the context
interface AdminContextType {
  adminDetails: AdminDetails;
  isLoading: boolean;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  fetchAdminDetails: () => Promise<void>; // Corrected type
}

// Create the context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

type AdminProviderProps = {
  children: React.ReactNode;
};

// Provider to fetch and store admin details
export default function AdminProvider({ children }: AdminProviderProps) {
  const [adminDetails, setAdminDetails] = useState<AdminDetails>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminDetails = async () => {
    try {
      const response = await crudRequest<AdminDetails>("GET", "/user/get-role");
      setAdminDetails(response);
    } catch (error) {
      console.error("Failed to fetch admin details:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      await fetchAdminDetails();
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // Function to mark a notification as read
  const markNotificationAsRead = async (notificationId: string) => {
    try {
      // API call to update the notification status
      await crudRequest("PATCH", `/notification/mark-as-read`, {
        notificationId,
      });

      // Update local state after a successful API call
      const updatedNotifications = adminDetails.notifications.map((n) =>
        n.notificationId._id === notificationId ? { ...n, isRead: true } : n
      );

      setAdminDetails({
        ...adminDetails,
        notifications: updatedNotifications,
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        adminDetails,
        isLoading,
        markNotificationAsRead,
        fetchAdminDetails,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

// Custom hook for accessing the admin context
export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within an AdminProvider");
  }
  return context;
};
