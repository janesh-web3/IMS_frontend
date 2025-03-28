import { usePackageContext } from "@/context/packageContext";
import React from "react";

type PremiumComponentProps = {
  children: React.ReactNode;
};

const PremiumComponent: React.FC<PremiumComponentProps> = ({ children }) => {
  const { packageDetails } = usePackageContext();

  if (
    packageDetails.plan !== "Premium" &&
    packageDetails.plan !== "PremiumPlus"
  ) {
    return null;
  }

  return <>{children}</>;
};

export default PremiumComponent;
