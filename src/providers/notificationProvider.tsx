import { crudRequest } from "@/lib/api";
import { socketBaseUrl } from "@/server";
import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { io, Socket } from "socket.io-client";
import { useNotificationSound, type SoundType } from "@/contexts/NotificationSoundContext";

export interface Notification {
  id: string;
  notificationId: {
    _id: string;
    title: string;
    message: string;
    type?: string; // e.g., 'info', 'success', 'warning', 'error'
    category?: string; // e.g., 'message', 'alert', 'system'
    createdAt: string;
  };
  isRead: boolean;
  userId: string;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

interface NotificationContextProps {
  notifications: Notification[];
  countNotifications: number;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [countNotifications, setCountNotifications] = useState(0);
  const { playNotificationSound } = useNotificationSound();
  const token = sessionStorage.getItem("token");

  const fetchNotifications = useCallback(async () => {
    if (!token) return;

    try {
      const response = await crudRequest<any>("GET", "/user/get-role");
      const data = await response;

      if (data.notifications) {
        setNotifications(data.notifications);
        setCountNotifications(data.notifications.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [token]);

  // Fetch notifications on mount and when fetchNotifications changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Socket connection effect
  useEffect(() => {
    if (!token) {
      console.log("No token found in sessionStorage");
      return;
    }

    const socket: Socket = io(socketBaseUrl, {
      auth: { token }, // Send token in connection
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
    });

    socket.on("new-notification", (notification: Notification) => {
      console.log("New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setCountNotifications((prev) => prev + 1);

      // Determine sound type based on notification category/type
      let soundType: SoundType = 'default';
      if (notification.notificationId?.category === 'message') {
        soundType = 'message';
      } else if (notification.notificationId?.type === 'error') {
        soundType = 'error';
      } else if (notification.notificationId?.type === 'success') {
        soundType = 'success';
      } else if (notification.notificationId?.category === 'alert' || 
                notification.notificationId?.type === 'VisitStudent') {
        soundType = 'alert';
      }

      playNotificationSound(soundType);
    });

    socket.on("notification-read", (notificationId: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setCountNotifications((prev) => Math.max(0, prev - 1));
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await crudRequest("PATCH", `/notification/mark-as-read/${notificationId}`);
      setNotifications(prev =>
        prev.map(n =>
          n.notificationId._id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setCountNotifications(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        countNotifications, 
        markNotificationAsRead,
        fetchNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextProps => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};

export default NotificationProvider;
