import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { MessageCircle, Circle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/ui/card";
import { Badge } from "../../ui/ui/badge";
import { getConversations } from "../../rtk/thunk/chatThunk";

const ChatList = ({
  onSelectUser,
  title = "Conversations",
  emptyTitle = "No conversations yet",
  emptySubtext = "Messages from your conversations will appear here",
}) => {
  const dispatch = useDispatch();
  const { conversations = [], conversationsLoading } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  const formatTime = (date) => {
    if (!date) return "";
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <Card className="border-0 shadow-lg rounded-2xl bg-white">
      <CardHeader className="border-b border-gray-100 pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl text-gray-900">
          <div className="p-2 bg-purple/10 rounded-lg">
            <MessageCircle className="text-purple" size={24} />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {conversationsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-purple" size={32} />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <MessageCircle size={48} className="text-gray-400" />
              </div>
            </div>
            <p className="text-gray-600 font-medium text-lg">{emptyTitle}</p>
            <p className="text-gray-500 text-sm mt-2">{emptySubtext}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectUser(conv.otherUser)}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer border transition-all ${
                  conv.unreadCount > 0
                    ? "bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-md"
                    : "hover:bg-gray-50 border-gray-100 hover:border-purple/30 hover:shadow-md"
                }`}
              >
                <div className="relative flex-shrink-0">
                  {conv.otherUser.profileImage ? (
                    <img
                      src={conv.otherUser.profileImage}
                      alt={conv.otherUser.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple text-white flex items-center justify-center text-lg font-semibold">
                      {conv.otherUser.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <Circle
                    size={10}
                    className={`absolute bottom-0 right-0 ${
                      conv.otherUser.isOnline
                        ? "fill-green text-green"
                        : "fill-gray-400 text-gray-400"
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-semibold text-sm truncate ${
                      conv.unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                    }`}>
                      {conv.otherUser.name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${
                    conv.unreadCount > 0
                      ? "font-medium text-gray-900"
                      : "text-gray-600"
                  }`}>
                    {conv.lastMessageText || "No messages yet"}
                  </p>
                </div>

                {conv.unreadCount > 0 && (
                  <Badge className="bg-purple text-white rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap">
                    {conv.unreadCount}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatList;
