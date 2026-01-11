import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  BarChart3,
  Users,
  Store,
  Car,
  LogOut,
  Home
} from "lucide-react";
import { Button } from "../../../ui/ui/button";

const AdminLayout = ({ children, activeTab }) => {
  const navigate = useNavigate();
  const { role } = useSelector((state) => state.auth);

  const handleLogout = () => navigate("/login");

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3, path: "/admin/dashboard" },
    { id: "users", label: "Users", icon: Users, path: "/admin/users" },
    { id: "stores", label: "Stores", icon: Store, path: "/admin/stores" },
    { id: "vehicles", label: "Vehicles", icon: Car, path: "/admin/vehicles" }
  ];

  return (
    <div className="min-h-screen flex bg-light-bg">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-72 bg-sideNav text-white flex flex-col px-6 py-8 shadow-xl">
        <div className="flex items-center gap-3 mb-10">
          <Home size={24} className="text-purple" />
          <h2 className="text-2xl font-bold text-purple tracking-wide">
            Admin Panel
          </h2>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map(({ id, label, icon: Icon, path }) => (
            <button
              key={id}
              onClick={() => navigate(path)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg transition
                ${
                  activeTab === id
                    ? "bg-purple text-white shadow"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <div className="text-sm text-gray-400 mb-4">
            Logged in as: <span className="text-purple capitalize">{role}</span>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 w-full"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ---------------- MAIN ---------------- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            System overview & management
          </p>
        </div>

        {children}
      </main>
    </div>
  );
};

export default AdminLayout;