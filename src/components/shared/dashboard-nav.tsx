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
  const filteredNavItems = items.filter((item) => {
    switch (userPlan) {
      case "PremiumPlus":
        // Show all items for PremiumPlus users
        return true;
      case "Premium":
        // Show Basic and Premium items for Premium users
        return item.tag === "Basic" || item.tag === "Premium";
      case "Basic":
      default:
        // Show only Basic items for Basic users
        return item.tag === "Basic";
    }
  });

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
                      "flex items-center gap-2 rounded-md py-2 text-sm font-medium hover:text-muted-foreground",
                      path === item.href
                        ? packageDetails.plan !== "Basic"
                          ? "bg-primary text-primary-foreground hover:text-primary-foreground"
                          : "bg-primary text-primary-foreground hover:text-primary-foreground "
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
          {(isMobileNav || !isMinimized) && (
            <UpgradeToPro onClick={handleUpgradeClick} />
          )}
        </div>
      </TooltipProvider>
    </nav>
  );
}
