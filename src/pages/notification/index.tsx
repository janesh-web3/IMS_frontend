import { useAdminContext } from "@/context/adminContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const Index = () => {
  const { adminDetails, markNotificationAsRead, fetchAdminDetails } =
    useAdminContext();

  return (
    <div className="w-[400px] max-h-[600px] p-4 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Button variant="default" size="sm" onClick={fetchAdminDetails}>
          Refresh
        </Button>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        {adminDetails?.notifications.map((notification, index) => (
          <div
            key={index}
            className={`mb-3 p-4 rounded-lg transition-colors ${
              notification.isRead
                ? "bg-muted/40"
                : "bg-background border border-border"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3 className="mb-1 font-medium">
                  {notification.notificationId?.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {notification.notificationId?.message}
                </p>
                <span className="block mt-2 text-xs text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(notification.notificationId?.createdAt),
                    { addSuffix: true }
                  )}
                </span>
              </div>
              {!notification.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    markNotificationAsRead(notification.notificationId._id)
                  }
                  className="shrink-0"
                >
                  Mark as read
                </Button>
              )}
            </div>
          </div>
        ))}
      </ScrollArea>
    </div>
  );
};

export default Index;
