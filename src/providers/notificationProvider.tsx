import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";

interface Notification {
  message: string;
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
  const token = sessionStorage.getItem("token"); // Token is assumed to be stored in sessionStorage

  useEffect(() => {
    if (!token) {
      console.log("No token found in sessionStorage");
      return;
    }

    // Connect to the WebSocket server
    const socket: Socket = io("http://localhost:5000");

    // Emit authentication event with the token
    socket.emit("authenticate", { token });

    socket.on("new-notification", (notification: Notification) => {
      console.log("New notification received:", notification);
      setNotifications((prevNotifications) => [
        ...prevNotifications,
        notification,
      ]);
      setCountNotifications((prevCount) => prevCount + 1); // Increment count
      toast.info(notification.message);
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
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
