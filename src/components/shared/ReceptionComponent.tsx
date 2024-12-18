import { useAdminContext } from "@/context/adminContext";
import React from "react";

type AdminComponentProps = {
  children: React.ReactNode;
};

const ReceptionComponent: React.FC<AdminComponentProps> = ({ children }) => {
  const { adminDetails } = useAdminContext();

  // Check if role is not "admin" AND not "superadmin"
  if (
    adminDetails.role !== "admin" &&
    adminDetails.role !== "superadmin" &&
    adminDetails.role !== "reception"
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ReceptionComponent;
