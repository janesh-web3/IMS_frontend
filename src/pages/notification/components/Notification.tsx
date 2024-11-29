import { useNotifications } from "@/providers/notificationProvider";
import { Bell } from "lucide-react";

const Notification = () => {
  const { countNotifications } = useNotifications();
  return (
    <div className="flex flex-row-reverse px-2 cursor-pointer">
      <span className="text-sm mt-[-10px]">{countNotifications}</span>
      <Bell className="text-orange-600" fill="orange" />
    </div>
  );
};

export default Notification;
