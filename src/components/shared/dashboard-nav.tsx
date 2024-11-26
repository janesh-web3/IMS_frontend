"use client";

import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { NavItem } from "@/types";
import { Dispatch, SetStateAction } from "react";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePathname } from "@/routes/hooks";
import { Link, useNavigate } from "react-router-dom";
import UpgradeToPro from "./upgrade-pro";
import { usePackageContext } from "@/context/packageContext";
import Billboard from "./Billboard";

interface DashboardNavProps {
  items: NavItem[];
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isMobileNav?: boolean;
}

export default function DashboardNav({
  items,
  setOpen,
  isMobileNav = false,
}: DashboardNavProps) {
  const path = usePathname();
  const { isMinimized } = useSidebar();

  // Access package details
  const { packageDetails } = usePackageContext();
  const userPlan = packageDetails?.plan || "Basic"; // Default to "Basic" if not defined

  // Filter navigation items based on user plan
  const filteredNavItems = items.filter(
    (item) =>
      item.tag === "Basic" ||
      (userPlan === "Standard" && item.tag === "Standard")
  );

  if (!filteredNavItems.length) {
    return null;
  }

  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate("/upgrade-to-pro");
  };

  return (
    <nav className="grid items-start gap-2">
      <TooltipProvider>
        {filteredNavItems.map((item, index) => {
          const Icon = Icons[item.icon || "arrowRight"];
          return (
            item.href && (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.disabled ? "/" : item.href}
                    className={cn(
                      "flex items-center gap-2 overflow-hidden rounded-md py-2 text-sm font-medium hover:text-muted-foreground",
                      path === item.href
                        ? packageDetails.plan !== "Basic"
                          ? "bg-primary text-white hover:text-gray-100"
                          : "bg-primary text-black hover:text-black"
                        : "transparent",
                      item.disabled && "cursor-not-allowed opacity-80"
                    )}
                    onClick={() => {
                      if (setOpen) setOpen(false);
                    }}
                  >
                    <Icon className={`ml-2.5 size-5`} />
                    {isMobileNav || (!isMinimized && !isMobileNav) ? (
                      <span className="mr-2 truncate">{item.title}</span>
                    ) : (
                      ""
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  align="center"
                  side="right"
                  sideOffset={8}
                  className={!isMinimized ? "hidden" : "inline-block"}
                >
                  {item.title}
                </TooltipContent>
              </Tooltip>
            )
          );
        })}
        <div className="mb-28">
          {userPlan === "Basic" && (isMobileNav || !isMinimized) && (
            <UpgradeToPro onClick={handleUpgradeClick} />
          )}
          {userPlan === "Standard" && (isMobileNav || !isMinimized) && (
            <Billboard />
          )}
        </div>
      </TooltipProvider>
    </nav>
  );
}
