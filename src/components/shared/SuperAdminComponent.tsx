import React from "react";
import { useAdminContext } from "@/context/adminContext";

type AdminComponentProps = {
  children: React.ReactNode;
};

const SuperAdminComponent: React.FC<AdminComponentProps> = ({ children }) => {
  const { adminDetails } = useAdminContext();

  if (adminDetails.role !== "superadmin") {
    return null;
  }
  return <>{children}</>;
};

export default SuperAdminComponent;
