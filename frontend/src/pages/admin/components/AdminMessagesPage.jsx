import React, { useState } from "react";
import { useSelector } from "react-redux";
import AdminLayout from "./AdminLayout";
import ChatList from "../../../components/common/ChatList";
import ChatDialog from "../../../components/common/ChatDialog";
import { Badge } from "../../../ui/ui/badge";

const AdminMessagesPage = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { conversations = [] } = useSelector((state) => state.chat);

  const usersWithUnreadMessages = conversations.filter((conv) => conv?.unreadCount > 0).length;

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setIsChatOpen(true);
  };

  return (
    <AdminLayout activeTab="messages">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Admin Messages</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage user inquiries and vehicle-interest conversations.
            </p>
          </div>
          {usersWithUnreadMessages > 0 && (
            <Badge className="bg-red text-white rounded-full px-3 py-1 text-sm font-semibold">
              {usersWithUnreadMessages} unread
            </Badge>
          )}
        </div>

        <ChatList
          onSelectUser={handleSelectUser}
          title="Admin Conversations"
          emptySubtext="User support and vehicle-interest messages will appear here."
        />
      </div>

      {selectedUser && (
        <ChatDialog
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          otherUser={selectedUser}
        />
      )}
    </AdminLayout>
  );
};

export default AdminMessagesPage;
