import { crudRequest } from "@/lib/api";
import { socketBaseUrl } from "@/server";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  _id: string;
  message: string;
  timestamp: Date;
  read: boolean;
  isCurrentUser: boolean;
  sender: {
    _id: string;
    name: string;
    photo?: string;
    role: string;
  };
  receiver: {
    _id: string;
    name: string;
    photo?: string;
    role: string;
  };
}

interface MessageContextType {
  messages: Message[];
  unreadMessages: number;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  markMessageAsRead: (messageId: string) => Promise<void>;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export const MessageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [, setSocket] = useState<Socket | null>(null);
  const token = sessionStorage.getItem("token");

  const unreadMessages = messages.filter((m) => !m.read).length;

  const fetchUnreadMessages = async () => {
    try {
      const response = await crudRequest("GET", "chat/unread-messages");
      const data = await response;
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
    }
  };

  useEffect(() => {
    if (!token) return;

    fetchUnreadMessages();

    const newSocket = io(socketBaseUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat socket:", newSocket.id);
    });

    newSocket.on("private message", (newMessage: Message) => {
      setMessages((prev) =>
        Array.isArray(prev) ? [newMessage, ...prev] : [newMessage]
      );
    });
    setSocket(newSocket);

    newSocket.on("message read", (messageId: string) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token]);

  const markMessageAsRead = async (messageId: string) => {
    try {
      await crudRequest("PATCH", `/chat/mark-read/${messageId}`);

      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  };

  return (
    <MessageContext.Provider
      value={{
        messages,
        unreadMessages,
        setMessages,
        markMessageAsRead,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessages must be used within a MessageProvider");
  }
  return context;
};
