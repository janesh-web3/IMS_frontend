import { useMessages } from "@/providers/messageProvider";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const MessageDropdown = () => {
  const { messages, markMessageAsRead } = useMessages();
  const navigate = useNavigate();
  const messageList = Array.isArray(messages) ? messages : [];

  const getInitial = (name?: string) => {
    return name ? name.charAt(0) : "?";
  };

  const handleMessageClick = async (messageId: string) => {
    try {
      const message = messageList.find((m) => m._id === messageId);
      if (message) {
        await markMessageAsRead(messageId);

        const otherUser = message.isCurrentUser
          ? message.receiver
          : message.sender;

        if (!otherUser || !otherUser._id) {
          console.error("Invalid user data:", otherUser);
          return;
        }

        navigate("/chat-bot", {
          state: {
            selectedContactId: otherUser._id,
            scrollToMessageId: messageId,
            contactDetails: {
              _id: otherUser._id,
              name: otherUser.name || "Unknown User",
              role: otherUser.role || "unknown",
              photo: otherUser.photo || undefined,
            },
          },
          replace: true,
        });
      }
    } catch (error) {
      console.error("Error handling message click:", error);
    }
  };

  return (
    <ScrollArea className="h-[300px] w-[300px] p-4">
      {messageList.length === 0 ? (
        <div className="text-sm text-center text-gray-500">No messages</div>
      ) : (
        messageList.map((message) => {
          const displayUser = message.isCurrentUser
            ? message.receiver
            : message.sender;

          return (
            <div
              key={message._id}
              onClick={() => handleMessageClick(message._id)}
              className={`flex items-start gap-3 p-2 cursor-pointer rounded-lg mb-2 hover:bg-primary/5 ${
                !message.read ? "bg-primary/30" : ""
              } ${message.isCurrentUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <Avatar className="flex-shrink-0 w-10 h-10">
                <AvatarImage src={displayUser?.photo} />
                <AvatarFallback>{getInitial(displayUser?.name)}</AvatarFallback>
              </Avatar>

              <div
                className={`flex-1 ${message.isCurrentUser ? "text-right" : "text-left"}`}
              >
                <div
                  className={`flex items-center gap-2 ${
                    message.isCurrentUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <span className="font-medium text-secondary-foreground/90">
                    {displayUser?.name}
                  </span>
                  <span className="text-xs text-secondary-foreground/40">
                    {formatDistanceToNow(new Date(message.timestamp), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <p
                  className={`text-sm text-secondary-foreground/80 line-clamp-2 ${
                    message.isCurrentUser ? "text-right" : "text-left"
                  }`}
                >
                  {message.message}
                </p>

                <span
                  className={`text-xs capitalize text-secondary-foreground/40 ${
                    message.isCurrentUser ? "text-right" : "text-left"
                  }`}
                >
                  {displayUser?.role}
                </span>
              </div>
            </div>
          );
        })
      )}
    </ScrollArea>
  );
};

export default MessageDropdown;
