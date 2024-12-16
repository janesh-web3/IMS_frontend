import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";

interface Notification {
  id: string;
  message: string;
  isRead?: boolean;
  createdAt?: Date;
}

interface NotificationContextProps {
  notifications: Notification[];
  countNotifications: number;
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
  const token = sessionStorage.getItem("token");

  // Fetch previous notifications on mount
  useEffect(() => {
    const fetchPreviousNotifications = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:5000/api/user/get-role",
          {
            headers: {
              Authorization: token,
            },
          }
        );
        const data = await response.json();

        if (data.notifications) {
          setNotifications(
            data.notifications.map((n: any) => ({
              message: n.notificationId.message,
              isRead: n.isRead,
              id: n.notificationId._id,
              createdAt: n.notificationId.createdAt,
            }))
          );

          // Set count of unread notifications
          setCountNotifications(
            data.notifications.filter((n: any) => !n.isRead).length
          );
        }
      } catch (error) {
        console.error("Error fetching previous notifications:", error);
      }
    };

    fetchPreviousNotifications();
  }, [token]);

  // Socket connection effect
  useEffect(() => {
    if (!token) {
      console.log("No token found in sessionStorage");
      return;
    }

    const socket: Socket = io("http://localhost:5000", {
      auth: { token }, // Send token in connection
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
    });

    socket.on("new-notification", (notification: Notification) => {
      console.log("New notification received:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setCountNotifications((prev) => prev + 1);
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

  return (
    <NotificationContext.Provider value={{ notifications, countNotifications }}>
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
