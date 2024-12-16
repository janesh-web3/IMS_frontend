import { usePackageContext } from "@/context/packageContext";
import React from "react";

type PremiumComponentProps = {
  children: React.ReactNode;
};
const PremiumPlusComponent: React.FC<PremiumComponentProps> = ({
  children,
}) => {
  const { packageDetails } = usePackageContext();

  if (packageDetails.plan !== "PremiumPlus") {
    return null;
  }

  return <>{children}</>;
};

export default PremiumPlusComponent;
