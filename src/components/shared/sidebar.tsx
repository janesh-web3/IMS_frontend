"use client";
import DashboardNav from "@/components/shared/dashboard-nav";
import { navItems } from "@/constants/data";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";
import { ChevronsLeft } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

type SidebarProps = {
  className?: string;
};

export default function Sidebar({ className }: SidebarProps) {
  const { isMinimized, toggle } = useSidebar();
  const [status, setStatus] = useState(false);

  const handleToggle = () => {
    setStatus(true);
    toggle();
    setTimeout(() => setStatus(false), 500);
  };

  return (
    <nav
      className={cn(
        `relative z-10 hidden h-screen flex-none  px-3 md:block`,
        status && "duration-500",
        !isMinimized ? "w-52" : "w-[100px]",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center px-0 py-5 md:px-2",
          isMinimized ? "justify-center " : "justify-between"
        )}
      >
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <img
              src={"logot.png"}
              alt="Logo"
              className="rounded-full"
              width={70}
              height={70}
            />
          </motion.div>
        )}
        <ChevronsLeft
          className={cn(
            "size-8 cursor-pointer rounded-full border bg-background text-foreground",
            isMinimized && "rotate-180"
          )}
          onClick={handleToggle}
        />
      </div>
      <div className="py-2 space-y-2 overflow-auto">
        <div className="px-2 h-[100vh]">
          <div className="mt-2 space-y-1 ">
            <DashboardNav items={navItems} />
          </div>
        </div>
      </div>
    </nav>
  );
}
