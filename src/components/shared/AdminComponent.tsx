import { useAdminContext } from "@/context/adminContext";
import React from "react";

type AdminComponentProps = {
  children: React.ReactNode;
};

const AdminComponent: React.FC<AdminComponentProps> = ({ children }) => {
  const { adminDetails } = useAdminContext();

  // Check if role is not "admin" AND not "superadmin"
  if (adminDetails.role !== "admin" && adminDetails.role !== "superadmin") {
    return null; // Render nothing if the user doesn't have access
  }

  return <>{children}</>;
};

export default AdminComponent;
