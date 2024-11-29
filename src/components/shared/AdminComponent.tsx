import { useAdminContext } from "@/context/adminContext";
import React from "react";

type AdminComponentProps = {
  children: React.ReactNode;
};

const AdminComponent: React.FC<AdminComponentProps> = ({ children }) => {
  const { adminDetails } = useAdminContext();

  // Check if the current plan is premium (e.g., 'standard')
  if (adminDetails.role !== "admin" || "superadmin") {
    return null; // Render nothing if the user doesn't have access
  }

  return <>{children}</>;
};

export default AdminComponent;
