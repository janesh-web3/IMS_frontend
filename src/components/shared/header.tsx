import { navItems } from "@/constants/data";
import { usePathname } from "@/routes/hooks";
import Heading from "./heading";
import { ModeToggle } from "./theme-toggle";
import TimeTracker from "./Session";
import Notification from "@/pages/notification/components/Notification";
import PremiumComponent from "./PremiumComponent";
import AdminComponent from "./AdminComponent";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { lazy } from "react";
import { MessageCircle } from "lucide-react";
import MessageDropdown from "./MessageDropdown";
import { useMessages } from "@/providers/messageProvider";
const NotificationPage = lazy(() => import("@/pages/notification"));

// Custom hook to find the matched path
const useMatchedPath = (pathname: string) => {
  const matchedPath =
    navItems.find((item) => item.href === pathname) ||
    navItems.find(
      (item) => pathname.startsWith(item.href + "/") && item.href !== "/"
    );
  return matchedPath?.title || "";
};

export default function Header() {
  const pathname = usePathname();
  const headingText = useMatchedPath(pathname);
  const { unreadMessages } = useMessages();

  return (
    <div className="flex items-center justify-between flex-1 px-4 bg-secondary">
      <Heading title={headingText} />
      <div className="flex items-center ml-4 md:ml-6">
        <TimeTracker />
        <PremiumComponent>
          <AdminComponent>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative">
                  <MessageCircle className="text-blue-600" />
                  {unreadMessages > 0 && (
                    <span className="absolute flex items-center justify-center w-4 h-4 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                      {unreadMessages}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount className="mt-2">
                <MessageDropdown />
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button>
                  <Notification />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount className="mt-2">
                <NotificationPage />
              </DropdownMenuContent>
            </DropdownMenu>
          </AdminComponent>
        </PremiumComponent>
        <ModeToggle />
      </div>
    </div>
  );
}
