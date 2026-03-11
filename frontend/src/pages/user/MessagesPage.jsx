import React, { useState } from "react";
import { useSelector } from "react-redux";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import ChatList from "../../components/common/ChatList";
import ChatDialog from "../../components/common/ChatDialog";
import { Badge } from "../../ui/ui/badge";

const MessagesPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { conversations } = useSelector((state) => state.chat);

  // Count conversations with unread messages
  const usersWithUnreadMessages = conversations.filter((conv) => conv.unreadCount > 0).length;

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <Navigation />
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Messages</h1>
              <p className="text-gray-500">Your conversations and messages</p>
            </div>
            {usersWithUnreadMessages > 0 && (
              <Badge className="bg-red-500 text-white rounded-full px-4 py-2 text-sm font-semibold">
                {usersWithUnreadMessages} new message{usersWithUnreadMessages > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>
        <ChatList onSelectUser={handleSelectUser} />
      </main>

      {selectedUser && (
        <ChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          otherUser={selectedUser}
        />
      )}

      <Footer />
    </div>
  );
};

export default MessagesPage;
