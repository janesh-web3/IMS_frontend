import { navItems } from "@/constants/data";
import { usePathname } from "@/routes/hooks";
import Heading from "./heading";
import { ModeToggle } from "./theme-toggle";
import TimeTracker from "./Session";

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

  return (
    <div className="flex items-center justify-between flex-1 px-4 bg-secondary">
      <Heading title={headingText} />
      <div className="flex items-center ml-4 md:ml-6">
        <TimeTracker />
        {/* <UserNav /> */}
        <ModeToggle />
      </div>
    </div>
  );
}
