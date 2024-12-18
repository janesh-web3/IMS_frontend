import { useAdminContext } from "@/context/adminContext";
import React from "react";

type AdminComponentProps = {
  children: React.ReactNode;
};

const StudentComponent: React.FC<AdminComponentProps> = ({ children }) => {
  const { adminDetails } = useAdminContext();

  // Check if role is not "admin" AND not "superadmin"
  if (adminDetails.role !== "student") {
    return null;
  }

  return <>{children}</>;
};

export default StudentComponent;
