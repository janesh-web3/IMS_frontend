import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { io, Socket } from "socket.io-client";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { crudRequest } from "@/lib/api";
import { useLocation } from "react-router-dom";
import { socketBaseUrl } from "@/server";
import { useMessages } from "@/providers/messageProvider";

interface PrivateMessage {
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

interface Contact {
  _id: string;
  name: string;
  role: string;
  photo?: string;
}

interface CustomSocket extends Socket {
  auth: {
    userId?: string;
  };
}

const formatMessageTime = (timestamp: string | Date) => {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (date.toDateString() === yesterday.toDateString()) {
    return (
      "Yesterday " +
      date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    );
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
};

const ChatPage = () => {
  const location = useLocation();
  const { setMessages } = useMessages();

  const { selectedContactId, scrollToMessageId, contactDetails } =
    location.state || {};

  const [socket, setSocket] = useState<CustomSocket | null>(null);
  const [messages, setMessage] = useState<PrivateMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    const newSocket = io(socketBaseUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
      transports: ["websocket", "polling"],
    }) as CustomSocket;

    newSocket.on("connect", () => {
      newSocket.emit("set user", { userId: sessionStorage.getItem("userId") });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (selectedContact && socket) {
      const unreadMessages = messages.filter(
        (msg) => !msg.isCurrentUser && !msg.read
      );
      unreadMessages.forEach((msg) => {
        socket.emit("message read", { messageId: msg._id });
      });
    }
  }, [selectedContact, socket, messages]);

  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = (message: PrivateMessage) => {
      const isCurrentUser = message.isCurrentUser;
      console.log(message);

      socket.on("message read", (messageId: string) => {
        setMessage((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, read: true } : msg
          )
        );
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      });

      setMessage((prev) => [
        ...prev,
        {
          ...message,
          isCurrentUser,
          sender: message.isCurrentUser ? message.receiver : message.sender,
        },
      ]);

      if (!message.isCurrentUser) {
        setSelectedContact(message.sender);
      }

      if (!isCurrentUser) {
        socket?.emit("message read", { messageId: message._id });
      }
    };

    socket.on("private message", handlePrivateMessage);

    return () => {
      socket.off("private message", handlePrivateMessage);
    };
  }, [socket, selectedContact]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleTyping = () => {
    if (!socket || !selectedContact) return;

    socket.emit("typing", selectedContact._id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", selectedContact._id);
    }, 1000);
  };

  const sendMessage = () => {
    if (!socket || !selectedContact || !newMessage.trim()) return;
    const messageData = {
      receiver: selectedContact._id,
      message: newMessage.trim(),
      isCurrentUser: true,
      sender: sessionStorage.getItem("userId"),
    };

    socket.emit("private message", messageData);
    setNewMessage("");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      socket.emit("stop typing", selectedContact._id);
    }
  };

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await crudRequest<Contact[]>("GET", "chat/contacts");
        const data = response;
        setAllContacts(data);
        setFilteredContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  useEffect(() => {
    const filtered = allContacts.filter((contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredContacts(filtered);
  }, [searchQuery, allContacts]);

  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!selectedContact) return;

      try {
        setIsLoading(true);
        setMessage([]);

        const response = await crudRequest<PrivateMessage[]>(
          "GET",
          `/chat/history/${selectedContact._id}`
        );

        console.log(response);
        const transformedMessages = response.map((msg) => ({
          ...msg,
          sender: msg.isCurrentUser ? msg.receiver : msg.sender,
        }));

        setMessage(transformedMessages);
        setTimeout(scrollToBottom, 100);
      } catch (error) {
        console.error("Error fetching chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatHistory();
  }, [selectedContact?._id]);

  useEffect(() => {
    if (contactDetails) {
      setSelectedContact(contactDetails);
    } else if (selectedContactId) {
      const contact = allContacts.find((c) => c._id === selectedContactId);
      if (contact) {
        setSelectedContact(contact);
      }
    }
  }, [selectedContactId, contactDetails, allContacts]);

  useEffect(() => {
    if (scrollToMessageId && !isLoading && messages.length > 0) {
      const messageElement = document.getElementById(
        `message-${scrollToMessageId}`
      );
      if (messageElement) {
        setTimeout(() => {
          messageElement.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
          messageElement.classList.add("highlight-message");
        }, 100); // Small delay to ensure rendering is complete
      }
    }
  }, [scrollToMessageId, isLoading, messages, selectedContact]);

  return (
    <div className="h-[calc(100vh-4rem)] ">
      <div className="flex h-full">
        {/* Contacts Sidebar */}
        <div
          className={`flex flex-col border-r ${
            isSidebarOpen ? "w-80" : "w-20"
          } border-s3`}
        >
          {/* Search Bar */}
          <div className="p-4 border-b border-s3">
            <div className="relative">
              <Search className="absolute w-4 h-4 transform -translate-y-1/2 left-3 top-1/2 text-p3" />
              <Input
                className="pl-10 border-s3 text-p4"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Contact Groups */}
          <ScrollArea className="flex-1 scroll-hide">
            {/* Admins */}
            <div className="p-4">
              <h3 className="px-3 mb-3 small-2 text-p3">
                {isSidebarOpen ? "Admins" : "A"}
              </h3>
              {filteredContacts
                ?.filter(
                  (contact) =>
                    contact.role === "admin" || contact.role === "superadmin"
                )
                .map((contact) => (
                  <ContactItem
                    isSidebarOpen={isSidebarOpen}
                    key={contact._id}
                    contact={contact}
                    isSelected={selectedContact?._id === contact._id}
                    onClick={() => setSelectedContact(contact)}
                  />
                ))}
            </div>

            {/* Teachers */}
            <div className="p-4">
              <h3 className="px-3 mb-3 small-2 text-p3">
                {isSidebarOpen ? "Teachers" : "T"}
              </h3>
              {filteredContacts
                ?.filter((contact) => contact.role === "faculty")
                .map((contact) => (
                  <ContactItem
                    isSidebarOpen={isSidebarOpen}
                    key={contact._id}
                    contact={contact}
                    isSelected={selectedContact?._id === contact._id}
                    onClick={() => setSelectedContact(contact)}
                  />
                ))}
            </div>

            {/* Students */}
            <div className="p-4">
              <h3 className="px-3 mb-3 small-2 text-p3">
                {isSidebarOpen ? "Students" : "S"}
              </h3>
              {filteredContacts
                ?.filter((contact) => contact.role === "student")
                .map((contact) => (
                  <ContactItem
                    isSidebarOpen={isSidebarOpen}
                    key={contact._id}
                    contact={contact}
                    isSelected={selectedContact?._id === contact._id}
                    onClick={() => setSelectedContact(contact)}
                  />
                ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex flex-col flex-1 bg-s1">
          <div className="w-6 h-6 m-2 rounded-full bg-primary">
            <button className="z-10 top-4 left-4" onClick={toggleSidebar}>
              {isSidebarOpen ? (
                <ArrowLeft className="w-6 h-6" />
              ) : (
                <ArrowRight className="w-6 h-6" />
              )}
            </button>
          </div>
          {selectedContact ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-s3 bg-s1">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedContact.photo} />
                    <AvatarFallback className="bg-s2 text-p4">
                      {selectedContact.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="base-bold text-p4">
                      {selectedContact.name}
                    </div>
                    <div className="capitalize small-1 text-p3">
                      {selectedContact.role}
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6 scroll-hide">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="small-1 text-p3">Loading messages...</div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center py-4">
                    <div className="small-1 text-p3">No messages yet</div>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex mb-4 ${
                        msg.isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`p-3 rounded-lg shadow-md max-w-xs ${
                          msg.isCurrentUser
                            ? "bg-primary/10 text-foreground rounded-br-none"
                            : "bg-foreground/10 text-foreground rounded-bl-none"
                        }`}
                      >
                        <p className="small-1">{msg.message}</p>
                        <span className="block mt-1 text-xs text-gray-500">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-s3 bg-s1">
                <div className="flex space-x-3">
                  <Input
                    className="flex-1 bg-card border-s3 text-p4"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") sendMessage();
                    }}
                    onKeyDown={handleTyping}
                    placeholder="Type a message..."
                  />
                  <Button
                    onClick={sendMessage}
                    className="g2 text-p1 hover:opacity-90"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1">
              <div className="text-center">
                <h3 className="mb-2 h6 text-p4">Welcome to Chat</h3>
                <p className="base text-p3">
                  Select a contact to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({
  contact,
  isSelected,
  isSidebarOpen,
  onClick,
}: {
  contact: Contact;
  isSelected: boolean;
  isSidebarOpen: boolean;
  onClick: () => void;
}) => (
  <div
    className={`p-4 hover:bg-primary/30 cursor-pointer rounded-lg transition-colors ${
      isSelected ? "bg-primary/30" : ""
    }`}
    onClick={onClick}
  >
    <div
      className={`  ${isSidebarOpen ? "space-x-2 flex items-center" : "space-x-0 block items-start"}`}
    >
      <Avatar>
        <AvatarImage src={contact.photo} />
        <AvatarFallback>
          {contact.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {isSidebarOpen && (
        <div>
          <div className="font-medium">{contact.name}</div>
          <div className="text-sm capitalize text-secondary-foreground/50">
            {contact.role}
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ChatPage;
