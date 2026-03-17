import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart3,
  Users,
  Car,
  LogOut,
  Shield,
  FileText,
  UserCheck,
  Settings,
  ChevronRight,
  Calendar,
  CreditCard
} from "lucide-react";
import { Button } from "../../../ui/ui/button";
import { userLogout } from "../../../rtk/thunk/authThunk";
import NotificationBell from "../../../components/common/NotificationBell";

const AdminLayout = ({ children, activeTab }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { role, name, email } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(userLogout()).then(() => {
      navigate("/login");
    });
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/admin/dashboard", description: "Overview & analytics" },
    { id: "users", label: "User Management", icon: Users, path: "/admin/users", description: "Manage all users" },
    { id: "verification", label: "Verification", icon: UserCheck, path: "/admin/verification", description: "Verify user accounts" },
    { id: "vehicles", label: "Vehicles", icon: Car, path: "/admin/vehicles", description: "Manage listings" },
    { id: "bookings", label: "Bookings", icon: Calendar, path: "/admin/bookings", description: "Manage all bookings" },
    { id: "payments", label: "Payments", icon: CreditCard, path: "/admin/payments", description: "Transaction history" },
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
            <div className="w-10 h-10 rounded-xl bg-purple flex items-center justify-center shadow-lg">
              <Shield size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                AutoGear
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
                <p className="font-medium text-sm">{label}</p>
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
              <p className="text-xs text-gray-400 truncate">{email || 'admin@autogear.com'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-red hover:border-red hover:text-white transition-all"
          >
            <LogOut size={16} className="mr-2" />
            Sign Out
          </Button>
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
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button className="p-2 text-gray-400 hover:text-purple hover:bg-light-bg rounded-lg transition">
              <Settings size={20} />
            </button>
            <div className="w-px h-8 bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple flex items-center justify-center text-white text-sm font-bold">
                {(name || 'A').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-gray-700 capitalize">{role}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 overflow-y-auto bg-light-bg">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;