import { useAdminContext } from "@/context/adminContext";
import React from "react";

type AdminComponentProps = {
  children: React.ReactNode;
};

const TeacherComponent: React.FC<AdminComponentProps> = ({ children }) => {
  const { adminDetails } = useAdminContext();

  // Check if role is not "admin" AND not "superadmin"
  if (adminDetails.role !== "teacher") {
    return null;
  }

  return <>{children}</>;
};

export default TeacherComponent;
