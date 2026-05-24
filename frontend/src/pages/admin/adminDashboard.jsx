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
  TrendingUp,
  Eye,
  X,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  FileText,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/ui/dialog";
import Loading from "../../components/common/loading";
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import AdminDocumentReviewComponent from "../../components/adminComp/AdminDocumentReviewComponent";
import { formatPhoneNumber } from "../../lib/phone";

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
import { userLogout } from "../../rtk/thunk/authThunk";

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

  const [userPageSize, setUserPageSize] = useState(10);
  const [storePageSize, setStorePageSize] = useState(10);
  const [vehiclePageSize, setVehiclePageSize] = useState(10);

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

  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState("");
  const [deleteVehicleId, setDeleteVehicleId] = useState(null);
  const [deleteVehicleName, setDeleteVehicleName] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isVehicleDetailsOpen, setIsVehicleDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  /* ---------------- AUTH ---------------- */

  useEffect(() => {
    if (login === "admin") {
      dispatch(getDashboardStats());
      dispatch(getAllUsers({ page: userPage, limit: userPageSize, search: userSearch }));
      dispatch(getAllStores({ page: storePage, limit: storePageSize, search: storeSearch }));
      dispatch(
        getAllVehicles({
          page: vehiclePage,
          limit: vehiclePageSize,
          search: vehicleSearch,
          brand: vehicleBrand,
          color: vehicleColor
        })
      );
    }
  }, [
    login,
    userPage,
    userPageSize,
    storePage,
    storePageSize,
    vehiclePage,
    vehiclePageSize,
    userSearch,
    storeSearch,
    vehicleSearch,
    vehicleBrand,
    vehicleColor,
    dispatch
  ]);

  useEffect(() => {
    if (login !== "admin") return;

    const intervalId = setInterval(() => {
      dispatch(getDashboardStats());
    }, 30_000);

    return () => clearInterval(intervalId);
  }, [login, dispatch]);

  const handleLogout = () => {
    dispatch(userLogout()).then(() => {
      navigate("/login");
    });
  };

  // Pagination handlers
  const handleUserPageChange = (page) => setUserPage(page);
  const handleUserPageSizeChange = (size) => { setUserPageSize(size); setUserPage(1); };
  
  const handleStorePageChange = (page) => setStorePage(page);
  const handleStorePageSizeChange = (size) => { setStorePageSize(size); setStorePage(1); };
  
  const handleVehiclePageChange = (page) => setVehiclePage(page);
  const handleVehiclePageSizeChange = (size) => { setVehiclePageSize(size); setVehiclePage(1); };

  const handleUpdateUser = () => {
    dispatch(updateUser({ userId: editingUser, data: editForm })).then(() =>
      setEditingUser(null)
    );
  };

  if (loading) return <Loading />;

  /* ---------------- DASHBOARD ---------------- */
  const barData = [
    { name: "Users", count: dashboardStats?.totalUsers || 0 },
    { name: "Stores", count: dashboardStats?.totalStores || 0 },
    { name: "Vehicles", count: dashboardStats?.totalVehicles || 0 }
  ];

  const COLORS = ['#22c55e', '#eab308', '#ef4444'];
  const DOC_COLORS = ['#3b82f6', '#22c55e', '#ef4444'];

  const userPieData = [
    { name: "Verified", value: dashboardStats?.verifiedUsers || 0, color: '#22c55e' },
    { name: "Pending", value: dashboardStats?.pendingVerificationUsers || 0, color: '#eab308' },
    { name: "Rejected", value: dashboardStats?.rejectedVerificationUsers || 0, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const docPieData = [
    { name: "Pending", value: dashboardStats?.pendingDocuments || 0, color: '#3b82f6' },
    { name: "Approved", value: dashboardStats?.approvedDocuments || 0, color: '#22c55e' },
    { name: "Rejected", value: dashboardStats?.rejectedDocuments || 0, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const totalUsers = (dashboardStats?.verifiedUsers || 0) + 
                    (dashboardStats?.pendingVerificationUsers || 0) + 
                    (dashboardStats?.rejectedVerificationUsers || 0);

  const totalDocs = (dashboardStats?.pendingDocuments || 0) + 
                   (dashboardStats?.approvedDocuments || 0) + 
                   (dashboardStats?.rejectedDocuments || 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
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
            { id: "vehicles", label: "Vehicles", icon: Car },
            { id: "documents", label: "Documents", icon: FileText }
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
            {/* Main KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Users", value: dashboardStats?.totalUsers, icon: Users, color: "text-blue-600" },
                { label: "Stores", value: dashboardStats?.totalStores, icon: Store, color: "text-green-600" },
                { label: "Vehicles", value: dashboardStats?.totalVehicles, icon: Car, color: "text-purple" },
                { label: "Revenue", value: `$${dashboardStats?.totalRevenue || 0}`, icon: DollarSign, color: "text-yellow-600" }
              ].map(({ label, value, icon: Icon, color }) => (
                <Card key={label} className="bg-white border shadow-sm">
                  <CardHeader className="flex justify-between items-center">
                    <CardTitle className="text-sm text-gray-500">
                      {label}
                    </CardTitle>
                    <Icon className={color} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {value || 0}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Verification Stats - Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck size={18} className="text-green-600" />
                    User Verification Status
                  </CardTitle>
                  <CardDescription>Distribution of user account verification</CardDescription>
                </CardHeader>
                <CardContent>
                  {totalUsers === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <Users size={48} className="mb-2 opacity-50" />
                      <p>No user data available</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={userPieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                          >
                            {userPieData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke={entry.color}
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} users`, name]}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-center -mt-4">
                        <p className="text-2xl font-bold text-gray-800">{totalUsers}</p>
                        <p className="text-sm text-gray-500">Total Users</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center gap-4 mt-4 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-700">Verified: {dashboardStats?.verifiedUsers || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium text-yellow-700">Pending: {dashboardStats?.pendingVerificationUsers || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-red-700">Rejected: {dashboardStats?.rejectedVerificationUsers || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Stats - Pie Chart */}
              <Card className="bg-white border shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck size={18} className="text-blue-600" />
                    Document Verification Status
                  </CardTitle>
                  <CardDescription>Distribution of document verifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {totalDocs === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                      <FileCheck size={48} className="mb-2 opacity-50" />
                      <p>No document data available</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={docPieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={renderCustomLabel}
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={800}
                          >
                            {docPieData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={entry.color}
                                stroke={entry.color}
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name) => [`${value} documents`, name]}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                          <Legend 
                            verticalAlign="bottom" 
                            height={36}
                            formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="text-center -mt-4">
                        <p className="text-2xl font-bold text-gray-800">{totalDocs}</p>
                        <p className="text-sm text-gray-500">Total Documents</p>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center gap-4 mt-4 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium text-blue-700">Pending: {dashboardStats?.pendingDocuments || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium text-green-700">Approved: {dashboardStats?.approvedDocuments || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-red-50 rounded-full">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium text-red-700">Rejected: {dashboardStats?.rejectedDocuments || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CHARTS */}
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
                <Button onClick={() => dispatch(getAllUsers({ page: userPage, limit: userPageSize, search: userSearch }))}>
                  <RefreshCw size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="mb-4 flex justify-end">
                <Pagination
                  currentPage={userPagination?.currentPage || userPage}
                  totalPages={userPagination?.totalPages || 1}
                  totalItems={userPagination?.count || users?.length || 0}
                  pageSize={userPagination?.perpage || userPageSize}
                  onPageChange={handleUserPageChange}
                  onPageSizeChange={handleUserPageSizeChange}
                  pageSizeOptions={[5, 10, 20, 50]}
                  showInfo={false}
                  className="p-2"
                />
              </div>
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
                          variant="info"
                          onClick={() => {
                            setSelectedUser(u);
                            setIsUserDetailsOpen(true);
                          }}
                          className="hover:scale-105 transition-transform"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant={u.isBlocked ? "success" : "warning"}
                          onClick={() =>
                            u.isBlocked
                              ? dispatch(unblockUser(u.id))
                              : dispatch(blockUser(u.id))
                          }
                          className="hover:scale-105 transition-transform"
                        >
                          {u.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => {
                            setDeleteUserId(u.id);
                            setDeleteUserName(u.name);
                          }}
                          className="hover:scale-105 transition-transform"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-6 border-2 border-blue-500 rounded-lg">
                <Pagination
                  currentPage={userPagination?.currentPage || userPage}
                  totalPages={userPagination?.totalPages || 1}
                  totalItems={userPagination?.count || users?.length || 0}
                  pageSize={userPagination?.perpage || userPageSize}
                  onPageChange={handleUserPageChange}
                  onPageSizeChange={handleUserPageSizeChange}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------- STORES TAB ---------------- */}
        {activeTab === "stores" && (
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle>Store Management</CardTitle>
              <div className="flex gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    className="pl-10"
                    placeholder="Search stores..."
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                  />
                </div>
                <Button onClick={() => dispatch(getAllStores({ page: storePage, limit: storePageSize, search: storeSearch }))}>
                  <RefreshCw size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="mb-4 flex justify-end">
                <Pagination
                  currentPage={storePagination?.currentPage || storePage}
                  totalPages={storePagination?.totalPages || 1}
                  totalItems={storePagination?.count || stores?.length || 0}
                  pageSize={storePagination?.perpage || storePageSize}
                  onPageChange={handleStorePageChange}
                  onPageSizeChange={handleStorePageSizeChange}
                  pageSizeOptions={[5, 10, 20, 50]}
                  showInfo={false}
                  className="p-2"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Store Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stores?.map((s) => (
                    <TableRow key={s.id} className="hover:bg-gray-100">
                      <TableCell>{s.storeName}</TableCell>
                      <TableCell>{s.email}</TableCell>
                      <TableCell>{formatPhoneNumber(s.phoneNumber) || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className={s.isVerified ? "bg-green text-white" : "bg-yellow-500 text-white"}>
                          {s.isVerified ? "Verified" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={s.isBlocked ? "bg-red text-white" : "bg-green text-white"}>
                          {s.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        {!s.isVerified && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => dispatch(verifyStore(s.id))}
                          >
                            Verify
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={s.isBlocked ? "default" : "destructive"}
                          onClick={() =>
                            s.isBlocked
                              ? dispatch(unblockStore(s.id))
                              : dispatch(blockStore(s.id))
                          }
                        >
                          {s.isBlocked ? "Unblock" : "Block"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-6 border-2 border-blue-500 rounded-lg">
                <Pagination
                  currentPage={storePagination?.currentPage || storePage}
                  totalPages={storePagination?.totalPages || 1}
                  totalItems={storePagination?.count || stores?.length || 0}
                  pageSize={storePagination?.perpage || storePageSize}
                  onPageChange={handleStorePageChange}
                  onPageSizeChange={handleStorePageSizeChange}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ---------------- VEHICLES TAB ---------------- */}
        {activeTab === "vehicles" && (
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle>Vehicle Management</CardTitle>
              <div className="flex gap-4 mt-4 flex-wrap">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input
                    className="pl-10"
                    placeholder="Search vehicles..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                  />
                </div>
                <Input
                  className="w-40"
                  placeholder="Filter by brand"
                  value={vehicleBrand}
                  onChange={(e) => setVehicleBrand(e.target.value)}
                />
                <Input
                  className="w-40"
                  placeholder="Filter by color"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                />
                <Button onClick={() => dispatch(getAllVehicles({ page: vehiclePage, limit: vehiclePageSize, search: vehicleSearch, brand: vehicleBrand, color: vehicleColor }))}>
                  <RefreshCw size={16} />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="mb-4 flex justify-end">
                <Pagination
                  currentPage={vehiclePagination?.currentPage || vehiclePage}
                  totalPages={vehiclePagination?.totalPages || 1}
                  totalItems={vehiclePagination?.count || vehicles?.length || 0}
                  pageSize={vehiclePagination?.perpage || vehiclePageSize}
                  onPageChange={handleVehiclePageChange}
                  onPageSizeChange={handleVehiclePageSizeChange}
                  pageSizeOptions={[5, 10, 20, 50]}
                  showInfo={false}
                  className="p-2"
                />
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-100">
                    <TableHead>Name</TableHead>
                    <TableHead>Make/Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles?.map((v) => (
                    <TableRow key={v.id} className="hover:bg-gray-100">
                      <TableCell>{v.name}</TableCell>
                      <TableCell>{v.make} {v.model}</TableCell>
                      <TableCell>{v.year}</TableCell>
                      <TableCell>Rs. {Number(v.price).toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Badge className={v.isBlocked ? "bg-red text-white" : "bg-green text-white"}>
                          {v.isBlocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <Button
                          size="sm"
                          variant="info"
                          onClick={() => {
                            setSelectedVehicle(v);
                            setIsVehicleDetailsOpen(true);
                          }}
                          className="hover:scale-105 transition-transform"
                        >
                          <Eye size={14} className="mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant={v.isBlocked ? "success" : "warning"}
                          onClick={() =>
                            v.isBlocked
                              ? dispatch(unblockVehicle(v.id))
                              : dispatch(blockVehicle(v.id))
                          }
                          className="hover:scale-105 transition-transform"
                        >
                          {v.isBlocked ? "Unblock" : "Block"}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => {
                            setDeleteVehicleId(v.id);
                            setDeleteVehicleName(v.name);
                          }}
                          className="hover:scale-105 transition-transform"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-6 border-2 border-blue-500 rounded-lg">
                <Pagination
                  currentPage={vehiclePagination?.currentPage || vehiclePage}
                  totalPages={vehiclePagination?.totalPages || 1}
                  totalItems={vehiclePagination?.count || vehicles?.length || 0}
                  pageSize={vehiclePagination?.perpage || vehiclePageSize}
                  onPageChange={handleVehiclePageChange}
                  onPageSizeChange={handleVehiclePageSizeChange}
                  pageSizeOptions={[5, 10, 20, 50]}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "documents" && (
          <AdminDocumentReviewComponent />
        )}
      </main>

      {/* DELETE USER CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={!!deleteUserId}
        onOpenChange={() => {
          setDeleteUserId(null);
          setDeleteUserName("");
        }}
        onConfirm={async () => {
          await dispatch(deleteUser(deleteUserId));
          setDeleteUserId(null);
          setDeleteUserName("");
        }}
        title="Delete User"
        description={
          <>
            Are you sure you want to delete user <strong>{deleteUserName}</strong>?
            <br />
            <span className="text-red-600 font-semibold mt-2 block">
              This action cannot be undone.
            </span>
          </>
        }
        confirmText="Delete User"
        type="danger"
      />

      {/* DELETE VEHICLE CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={!!deleteVehicleId}
        onOpenChange={() => {
          setDeleteVehicleId(null);
          setDeleteVehicleName("");
        }}
        onConfirm={async () => {
          await dispatch(deleteVehicle(deleteVehicleId));
          setDeleteVehicleId(null);
          setDeleteVehicleName("");
        }}
        title="Delete Vehicle"
        description={
          <>
            Are you sure you want to delete vehicle <strong>{deleteVehicleName}</strong>?
            <br />
            <span className="text-red-600 font-semibold mt-2 block">
              This action cannot be undone.
            </span>
          </>
        }
        confirmText="Delete Vehicle"
        type="danger"
      />

      {/* VEHICLE DETAILS DIALOG */}
      <Dialog open={isVehicleDetailsOpen} onOpenChange={setIsVehicleDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {selectedVehicle && (
            <>
              <DialogHeader className="bg-gradient-to-r from-purple to-blue text-white p-6 sticky top-0 z-10">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <Car className="w-6 h-6" />
                  Vehicle Details
                </DialogTitle>
                <DialogDescription className="text-gray-100 mt-2">
                  Complete information about {selectedVehicle.name}
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* Images Section */}
                {selectedVehicle.images && selectedVehicle.images.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Eye className="w-5 h-5 text-purple" />
                      Images
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedVehicle.images.map((img, idx) => (
                        <div key={idx} className="aspect-video rounded-lg overflow-hidden border-2 border-gray-200 hover:border-purple transition-colors">
                          <img 
                            src={img} 
                            alt={`${selectedVehicle.name} ${idx + 1}`}
                            className="w-full h-full object-cover hover:scale-110 transition-transform"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Car className="w-5 h-5 text-purple" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Vehicle Name</p>
                      <p className="font-bold text-gray-900">{selectedVehicle.name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Make</p>
                      <p className="font-bold text-gray-900">{selectedVehicle.make}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Model</p>
                      <p className="font-bold text-gray-900">{selectedVehicle.model}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Year
                      </p>
                      <p className="font-bold text-gray-900">{selectedVehicle.year}</p>
                    </div>
                    <div className="bg-blue/10 p-4 rounded-lg border-2 border-blue">
                      <p className="text-sm text-blue mb-1">Price</p>
                      <p className="font-bold text-2xl text-blue">Rs. {selectedVehicle.price?.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Color</p>
                      <p className="font-bold text-gray-900 capitalize">{selectedVehicle.color}</p>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Gauge className="w-5 h-5 text-purple" />
                    Specifications
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Gauge className="w-4 h-4" />
                        Mileage
                      </p>
                      <p className="font-bold text-gray-900">{selectedVehicle.mileage?.toLocaleString()} km</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <Fuel className="w-4 h-4" />
                        Fuel Type
                      </p>
                      <p className="font-bold text-gray-900 capitalize">{selectedVehicle.fuelType}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Transmission</p>
                      <p className="font-bold text-gray-900 capitalize">{selectedVehicle.transmission}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Condition</p>
                      <p className="font-bold text-gray-900 capitalize">{selectedVehicle.condition || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Location & Category */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple" />
                    Location & Category
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Location
                      </p>
                      <p className="font-bold text-gray-900">{selectedVehicle.location}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Category</p>
                      <Badge className="bg-purple text-white font-semibold">
                        {selectedVehicle.category || "Buy/Sell"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedVehicle.description && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Description</h3>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {selectedVehicle.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Uploader Information */}
                {selectedVehicle.uploader && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple" />
                      Uploader Information
                    </h3>
                    <div className="bg-gradient-to-r from-purple/10 to-blue/10 p-4 rounded-lg border border-purple/20">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple text-white flex items-center justify-center font-bold text-xl">
                          {selectedVehicle.uploader.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{selectedVehicle.uploader.name}</p>
                          <p className="text-sm text-gray-600">{formatPhoneNumber(selectedVehicle.uploader.phoneNumber)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Status</h3>
                  <div className="flex gap-4">
                    <Badge className={selectedVehicle.isBlocked ? "bg-red text-white text-base px-4 py-2" : "bg-green text-white text-base px-4 py-2"}>
                      {selectedVehicle.isBlocked ? "🚫 Blocked" : "✅ Active"}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setIsVehicleDetailsOpen(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* USER DETAILS DIALOG */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {selectedUser && (
            <>
              <DialogHeader className="bg-gradient-to-r from-purple to-blue text-white p-6 sticky top-0 z-10">
                <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                  <Users className="w-6 h-6" />
                  User Details
                </DialogTitle>
                <DialogDescription className="text-gray-100 mt-2">
                  Complete information about {selectedUser.name}
                </DialogDescription>
              </DialogHeader>

              <div className="p-6 space-y-6">
                {/* Profile Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple" />
                    Profile Information
                  </h3>
                  <div className="flex items-center gap-6 bg-gradient-to-r from-purple/10 to-blue/10 p-6 rounded-lg border border-purple/20">
                    <div className="w-20 h-20 rounded-full bg-purple text-white flex items-center justify-center font-bold text-3xl shadow-lg">
                      {selectedUser.name?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-gray-900">{selectedUser.name}</h4>
                      <p className="text-gray-600 mt-1">{selectedUser.email}</p>
                    </div>
                    <Badge className={selectedUser.isBlocked ? "bg-red text-white text-base px-4 py-2" : "bg-green text-white text-base px-4 py-2"}>
                      {selectedUser.isBlocked ? "🚫 Blocked" : "✅ Active"}
                    </Badge>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Email Address</p>
                      <p className="font-bold text-gray-900">{selectedUser.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Phone Number</p>
                      <p className="font-bold text-gray-900">{formatPhoneNumber(selectedUser.phoneNumber) || "Not provided"}</p>
                    </div>
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-900">Account Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">User ID</p>
                      <p className="font-mono text-sm text-gray-900">{selectedUser.id}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">Account Status</p>
                      <Badge className={selectedUser.isBlocked ? "bg-red text-white" : "bg-green text-white"}>
                        {selectedUser.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </div>
                    {selectedUser.createdAt && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Member Since
                        </p>
                        <p className="font-bold text-gray-900">
                          {new Date(selectedUser.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                    {selectedUser.updatedAt && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                        <p className="font-bold text-gray-900">
                          {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setIsUserDetailsOpen(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      setIsUserDetailsOpen(false);
                      handleEdit(selectedUser);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit User
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
