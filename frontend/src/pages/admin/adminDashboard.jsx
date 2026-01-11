import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Store,
  Car,
  DollarSign,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PieChart,
  TrendingUp
} from "lucide-react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

import { Button } from "../../ui/ui/button";
import { Input } from "../../ui/ui/input";
import { Badge } from "../../ui/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../../ui/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../../ui/ui/table";
import Loading from "../../components/common/loading";

import {
  getDashboardStats,
  getAllUsers,
  getAllStores,
  verifyStore,
  blockUser,
  unblockUser,
  blockStore,
  unblockStore,
  getAllVehicles,
  blockVehicle,
  unblockVehicle,
  deleteVehicle,
  updateUser,
  deleteUser
} from "../../rtk/thunk/adminThunk";

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { login } = useSelector((state) => state.auth);
  const {
    dashboardStats,
    users,
    stores,
    vehicles,
    userPagination,
    storePagination,
    vehiclePagination,
    loading
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [userPage, setUserPage] = useState(1);
  const [storePage, setStorePage] = useState(1);
  const [vehiclePage, setVehiclePage] = useState(1);

  const [userSearch, setUserSearch] = useState("");
  const [storeSearch, setStoreSearch] = useState("");
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phoneNumber: ""
  });

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    if (login === "admin") {
      dispatch(getDashboardStats());
      dispatch(getAllUsers({ page: userPage, limit: 10, search: userSearch }));
      dispatch(getAllStores({ page: storePage, limit: 10, search: storeSearch }));
      dispatch(
        getAllVehicles({
          page: vehiclePage,
          limit: 10,
          search: vehicleSearch,
          brand: vehicleBrand,
          color: vehicleColor
        })
      );
    }
  }, [
    login,
    userPage,
    storePage,
    vehiclePage,
    userSearch,
    storeSearch,
    vehicleSearch,
    vehicleBrand,
    vehicleColor,
    dispatch
  ]);

  const handleLogout = () => navigate("/login");

  const handleUpdateUser = () => {
    dispatch(updateUser({ userId: editingUser, data: editForm })).then(() =>
      setEditingUser(null)
    );
  };

  if (loading) return <Loading />;

  /* ---------------- DASHBOARD ---------------- */
  const pieData = [
    { name: "Users", value: dashboardStats?.totalUsers || 0, color: "#624BFF" },
    { name: "Stores", value: dashboardStats?.totalStores || 0, color: "#0096FF" }
  ];

  const barData = [
    { name: "Users", count: dashboardStats?.totalUsers || 0 },
    { name: "Stores", count: dashboardStats?.totalStores || 0 },
    { name: "Vehicles", count: dashboardStats?.totalVehicles || 0 }
  ];

  return (
    <div className="min-h-screen flex bg-light-bg">
      {/* ---------------- SIDEBAR ---------------- */}
      <aside className="w-72 bg-sideNav text-white flex flex-col px-6 py-8 shadow-xl">
        <h2 className="text-2xl font-bold text-purple mb-10 tracking-wide">
          Admin Panel
        </h2>

        <nav className="flex-1 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: BarChart3 },
            { id: "users", label: "Users", icon: Users },
            { id: "stores", label: "Stores", icon: Store },
            { id: "vehicles", label: "Vehicles", icon: Car }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
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

        <Button
          variant="outline"
          onClick={handleLogout}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </aside>

      {/* ---------------- MAIN ---------------- */}
      <main className="flex-1 p-8 overflow-y-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          System overview & management
        </p>

        {/* ---------------- DASHBOARD TAB ---------------- */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Users", value: dashboardStats?.totalUsers, icon: Users },
                { label: "Stores", value: dashboardStats?.totalStores, icon: Store },
                { label: "Vehicles", value: dashboardStats?.totalVehicles, icon: Car },
                { label: "Revenue", value: `$${dashboardStats?.totalRevenue || 0}`, icon: DollarSign }
              ].map(({ label, value, icon: Icon }) => (
                <Card key={label} className="bg-white border shadow-sm">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-sm text-gray-500">
                      {label}
                    </CardTitle>
                    <Icon className="text-purple" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {value || 0}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart size={18} className="text-purple" />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <RechartsPieChart>
                      <Pie data={pieData} dataKey="value" outerRadius={90}>
                        {pieData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-purple" />
                    System Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#624BFF" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ---------------- USERS TAB ---------------- */}
        {activeTab === "users" && (
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    className="pl-10"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                </div>
                <Button onClick={() => dispatch(getAllUsers({ page: userPage, limit: 10, search: userSearch }))}>
                  <RefreshCw size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users?.map((u) => (
                    <TableRow key={u.id} className="hover:bg-gray-100">
                      <TableCell>{u.name}</TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge className={u.isBlocked ? "bg-red text-white" : "bg-green text-white"}>
                          {u.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant={u.isBlocked ? "default" : "destructive"}
                          onClick={() =>
                            u.isBlocked
                              ? dispatch(unblockUser(u.id))
                              : dispatch(blockUser(u.id))
                          }
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => dispatch(deleteUser(u.id))}>
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  disabled={userPage === 1}
                  onClick={() => setUserPage(userPage - 1)}
                >
                  <ChevronLeft size={16} /> Prev
                </Button>
                <Button
                  variant="outline"
                  disabled={userPage === userPagination?.totalPages}
                  onClick={() => setUserPage(userPage + 1)}
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
