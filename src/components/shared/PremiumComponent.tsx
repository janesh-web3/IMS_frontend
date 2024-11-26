import { usePackageContext } from "@/context/packageContext";
import React from "react";

type PremiumComponentProps = {
  children: React.ReactNode;
};

const PremiumComponent: React.FC<PremiumComponentProps> = ({ children }) => {
  const { packageDetails } = usePackageContext();

  // Check if the current plan is premium (e.g., 'standard')
  if (packageDetails.plan !== "Standard") {
    return null; // Render nothing if the user doesn't have access
  }

  return <>{children}</>;
};

export default PremiumComponent;
