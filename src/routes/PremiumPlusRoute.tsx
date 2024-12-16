import { usePackageContext } from "@/context/packageContext";
import React from "react";
import { Navigate } from "react-router-dom";

type PremiumRouteProps = {
  children: React.ReactNode;
};
const PremiumPlusRoute: React.FC<PremiumRouteProps> = ({ children }) => {
  const { packageDetails } = usePackageContext();

  // Allow access only for "standard" or "premium" plans
  if (packageDetails.plan !== "PremiumPlus") {
    return <Navigate to="/" replace />; // Redirect to the dashboard if not authorized
  }

  return <>{children}</>;
};

export default PremiumPlusRoute;
