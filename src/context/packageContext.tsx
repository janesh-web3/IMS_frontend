// import { crudRequest } from "@/lib/api";
import React, { createContext, useContext, useState } from "react";

// Define the structure for package features
interface PackageFeatures {
  studentsLimit: number;
  analytics: boolean;
  notifications: boolean;
  quizOptions: number;
}

interface PackageDetails {
  plan: "Basic" | "Premium" | "PremiumPlus";
  features: PackageFeatures;
}

// Define the initial state for the basic plan
const initialState: PackageDetails = {
  plan: "PremiumPlus", // Initial plan is 'basic'
  features: {
    studentsLimit: 100,
    analytics: false,
    notifications: false,
    quizOptions: 1,
  },
};

// Define the shape of the context
interface PackageContextType {
  packageDetails: PackageDetails;
  isLoading: boolean;
}

// Create the context
const PackageContext = createContext<PackageContextType | undefined>(undefined);

type PackageProviderProps = {
  children: React.ReactNode;
};

// Provider to fetch and store package details
export default function PackageProvider({ children }: PackageProviderProps) {
  const [packageDetails, setPackageDetails] =
    useState<PackageDetails>(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   const fetchPackageDetails = async () => {
  //     try {
  //       const response = await crudRequest<PackageDetails>(
  //         "GET",
  //         "/packages/get-package"
  //       );
  //       setPackageDetails(response);
  //     } catch (error) {
  //       console.error("Failed to fetch package details:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchPackageDetails();
  // }, []);

  return (
    <PackageContext.Provider value={{ packageDetails, isLoading }}>
      {children}
    </PackageContext.Provider>
  );
}

// Custom hook for accessing the package context
export const usePackageContext = () => {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error("usePackageContext must be used within a PackageProvider");
  }
  return context;
};
