import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart3,
  Users,
  Car,
  LogOut,
  FileText,
  UserCheck,
  ChevronRight,
  Calendar,
  CreditCard,
  RotateCcw,
  MessageCircle,
  PieChart
} from "lucide-react";
import { userLogout } from "../../../rtk/thunk/authThunk";
import NotificationBell from "../../../components/common/NotificationBell";
import { getConversations } from "../../../rtk/thunk/chatThunk";
import { Badge } from "../../../ui/ui/badge";
import BrandMark from "../../../components/common/BrandMark";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/ui/dialog";

const AdminLayout = ({ children, activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { role, name, email } = useSelector((state) => state.auth);
  const { conversations = [] } = useSelector((state) => state.chat);
  const { refundRequests = [] } = useSelector((state) => state.admin || {});
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  const usersWithUnreadMessages = conversations.filter((conv) => conv?.unreadCount > 0).length;
  const pendingRefundCount = refundRequests.filter((request) => request?.status === "Pending").length;

  useEffect(() => {
    if (role === "admin") {
      dispatch(getConversations());
    }
  }, [dispatch, role, location.pathname]);

  const handleLogout = async () => {
    await dispatch(userLogout());
    setIsLogoutDialogOpen(false);
    navigate("/login");
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/admin/dashboard", description: "Overview & analytics" },
    { id: "insights", label: "Insights", icon: PieChart, path: "/admin/insights", description: "User interest analytics" },
    { id: "users", label: "User Management", icon: Users, path: "/admin/users", description: "Manage all users" },
    { id: "verification", label: "Verification", icon: UserCheck, path: "/admin/verification", description: "Verify user accounts" },
    { id: "vehicles", label: "Vehicles", icon: Car, path: "/admin/vehicles", description: "Manage listings" },
    { id: "messages", label: "Messages", icon: MessageCircle, path: "/admin/messages", description: "Support conversations" },
    { id: "bookings", label: "Bookings", icon: Calendar, path: "/admin/bookings", description: "Manage all bookings" },
    { id: "payments", label: "Payments", icon: CreditCard, path: "/admin/payments", description: "Transaction history" },
    { id: "refunds", label: "Refund Requests", icon: RotateCcw, path: "/admin/refunds", description: "Review refund requests" },
    { id: "documents", label: "Documents", icon: FileText, path: "/admin/documents", description: "Review documents" }
  ];

  const isActive = (id) => activeTab === id || location.pathname === menuItems.find(m => m.id === id)?.path;

  return (
    <div className="min-h-screen flex bg-light-bg">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-72 bg-sideNav text-white flex flex-col shadow-2xl">
        {/* Logo Section */}
        <div className="px-6 py-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <BrandMark size={40} className="rounded-xl shadow-lg" />
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Second Auto Gear
              </h2>
              <p className="text-xs text-gray-400">Admin Console</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Main Menu
          </p>
          {menuItems.map(({ id, label, icon: Icon, path, description }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`group flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200
                ${
                  isActive(id)
                    ? "bg-purple text-white shadow-lg"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <div className={`p-2 rounded-lg ${isActive(id) ? 'bg-white/20' : 'bg-gray-800 group-hover:bg-gray-700'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{label}</p>
                  {id === "refunds" && pendingRefundCount > 0 && (
                    <Badge className="bg-red text-white text-[10px] px-1.5 py-0 h-5 min-w-5 rounded-full flex items-center justify-center">
                      {pendingRefundCount > 9 ? "9+" : pendingRefundCount}
                    </Badge>
                  )}
                </div>
                <p className={`text-xs ${isActive(id) ? 'text-white/70' : 'text-gray-500'}`}>
                  {description}
                </p>
              </div>
              {isActive(id) && <ChevronRight size={16} className="text-white/70" />}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700/50">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-800/50 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple flex items-center justify-center text-white font-bold">
              {(name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{name || 'Administrator'}</p>
              <p className="text-xs text-gray-400 truncate">{email || 'admin@secondautogear.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItems.find(m => isActive(m.id))?.label || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {menuItems.find(m => isActive(m.id))?.description || 'System overview & management'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/messages")}
              className="relative p-2 text-gray-500 hover:text-purple hover:bg-light-bg rounded-lg transition"
              title="Admin Messages"
            >
              <MessageCircle size={20} />
              {usersWithUnreadMessages > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red text-white text-[10px] px-1.5 py-0 h-5 min-w-5 rounded-full flex items-center justify-center">
                  {usersWithUnreadMessages > 9 ? "9+" : usersWithUnreadMessages}
                </Badge>
              )}
            </button>
            <NotificationBell />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple flex items-center justify-center text-white text-sm font-bold">
                {(name || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
            </div>
            <div className="h-8 border-l border-slate-200 mx-2" />
            <button
              type="button"
              onClick={() => setIsLogoutDialogOpen(true)}
              title="Logout"
              className="flex items-center gap-2 rounded-lg border-2 border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-all hover:border-red-300 hover:bg-red-50 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-light-bg">
          {children}
        </main>
      </div>

      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Are you sure you want to logout?</DialogTitle>
            <DialogDescription>
              You will be signed out from the admin panel and redirected to the login page.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
            >
              Confirm
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLayout;