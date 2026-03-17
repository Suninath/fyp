import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Users,
  Store,
  Car,
  DollarSign,
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  FileCheck,
  Eye,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlertCircle
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

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../ui/ui/card";
import { Button } from "../../../ui/ui/button";
import { Badge } from "../../../ui/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../ui/ui/dialog";
import { Input } from "../../../ui/ui/input";
import { Label } from "../../../ui/ui/label";
import AdminLayout from "./AdminLayout";
import { getDashboardStats, getPendingVerificationUsers, verifyUserAccount } from "../../../rtk/thunk/adminThunk";

// Theme colors from tailwind.config.js
const COLORS = ['#00b300', '#0096FF', '#e50000']; // green, blue, red
const DOC_COLORS = ['#0096FF', '#00b300', '#e50000']; // blue, green, red

const DashboardOverview = () => {
  const dispatch = useDispatch();
  const { dashboardStats, pendingUsers, pendingUsersPagination, loading } = useSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    dispatch(getDashboardStats());
    dispatch(getPendingVerificationUsers({ page, limit: 5 }));
  }, [dispatch, page]);

  const barData = [
    { name: "Users", count: dashboardStats?.totalUsers || 0 },
    { name: "Vehicles", count: dashboardStats?.totalVehicles || 0 }
  ];

  const userPieData = [
    { name: "Verified", value: dashboardStats?.verifiedUsers || 0, color: '#00b300' },
    { name: "Pending", value: dashboardStats?.pendingVerificationUsers || 0, color: '#0096FF' },
    { name: "Rejected", value: dashboardStats?.rejectedVerificationUsers || 0, color: '#e50000' }
  ].filter(item => item.value > 0);

  const docPieData = [
    { name: "Pending", value: dashboardStats?.pendingDocuments || 0, color: '#0096FF' },
    { name: "Approved", value: dashboardStats?.approvedDocuments || 0, color: '#00b300' },
    { name: "Rejected", value: dashboardStats?.rejectedDocuments || 0, color: '#e50000' }
  ].filter(item => item.value > 0);

  // Booking pie chart data
  const bookingPieData = [
    { name: "Pending", value: dashboardStats?.pendingBookings || 0, color: '#F59E0B' },
    { name: "Confirmed", value: dashboardStats?.confirmedBookings || 0, color: '#00b300' },
    { name: "Completed", value: dashboardStats?.completedBookings || 0, color: '#0096FF' },
    { name: "Cancelled", value: dashboardStats?.cancelledBookings || 0, color: '#e50000' }
  ].filter(item => item.value > 0);

  const totalUsers = (dashboardStats?.verifiedUsers || 0) + 
                    (dashboardStats?.pendingVerificationUsers || 0) + 
                    (dashboardStats?.rejectedVerificationUsers || 0);

  const totalDocs = (dashboardStats?.pendingDocuments || 0) + 
                   (dashboardStats?.approvedDocuments || 0) + 
                   (dashboardStats?.rejectedDocuments || 0);

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label if less than 5%

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleApproveUser = async (userId) => {
    setVerifying(true);
    await dispatch(verifyUserAccount({ userId, approved: true }));
    setVerifying(false);
    setShowUserDialog(false);
    dispatch(getDashboardStats());
  };

  const handleRejectUser = async () => {
    if (!rejectionReason.trim()) return;
    setVerifying(true);
    await dispatch(verifyUserAccount({ 
      userId: selectedUser.id, 
      approved: false, 
      rejectionReason 
    }));
    setVerifying(false);
    setShowRejectDialog(false);
    setShowUserDialog(false);
    setRejectionReason("");
    dispatch(getDashboardStats());
  };

  const refreshData = () => {
    dispatch(getDashboardStats());
    dispatch(getPendingVerificationUsers({ page, limit: 5 }));
  };

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "Total Users", value: dashboardStats?.totalUsers || 0, icon: Users, bgColor: "bg-blue/10", iconColor: "text-blue", loading: loading },
            { label: "Total Stores", value: dashboardStats?.totalStores || 0, icon: Store, bgColor: "bg-green/10", iconColor: "text-green", loading: loading },
            { label: "Total Vehicles", value: dashboardStats?.totalVehicles || 0, icon: Car, bgColor: "bg-purple/10", iconColor: "text-purple", loading: loading }
          ].map(({ label, value, icon: Icon, bgColor, iconColor, loading: itemLoading }) => (
            <Card key={label} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
                    {itemLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{value}</p>
                    )}
                  </div>
                  <div className={`p-4 rounded-xl ${bgColor}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Payment Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              label: "Payment Successful Revenue",
              value: `$${dashboardStats?.totalRevenue || 0}`,
              icon: DollarSign,
              bgColor: "bg-green/10",
              iconColor: "text-green",
              loading: loading,
            },
            {
              label: "Pending Revenue",
              value: `$${dashboardStats?.pendingPaymentAmount || 0}`,
              icon: Clock,
              bgColor: "bg-amber/10",
              iconColor: "text-amber",
              loading: loading,
            },
          ].map(({ label, value, icon: Icon, bgColor, iconColor, loading: itemLoading }) => (
            <Card key={label} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
                    {itemLoading ? (
                      <div className="animate-pulse">
                        <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <p className="text-3xl font-bold text-gray-900">{value}</p>
                    )}
                  </div>
                  <div className={`p-4 rounded-xl ${bgColor}`}>
                    <Icon className={`h-6 w-6 ${iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Booking Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Bookings", value: dashboardStats?.totalBookings || 0, icon: Calendar, bgColor: "bg-purple/10", iconColor: "text-purple" },
            { label: "Pending", value: dashboardStats?.pendingBookings || 0, icon: Clock, bgColor: "bg-amber/10", iconColor: "text-amber" },
            { label: "Confirmed", value: dashboardStats?.confirmedBookings || 0, icon: CheckCircle, bgColor: "bg-green/10", iconColor: "text-green" },
            { label: "Completed", value: dashboardStats?.completedBookings || 0, icon: FileCheck, bgColor: "bg-blue/10", iconColor: "text-blue" },
            { label: "Cancelled", value: dashboardStats?.cancelledBookings || 0, icon: XCircle, bgColor: "bg-red/10", iconColor: "text-red" }
          ].map(({ label, value, icon: Icon, bgColor, iconColor }) => (
            <Card key={label} className="bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">{label}</p>
                    {loading ? (
                      <div className="animate-pulse">
                        <div className="h-7 w-12 bg-gray-200 rounded"></div>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-xl ${bgColor}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pie Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Verification Pie Chart */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck size={18} className="text-green" />
                User Verification Status
              </CardTitle>
              <CardDescription>Distribution of user account verification</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ) : totalUsers === 0 ? (
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
                <div className="flex items-center gap-2 px-3 py-1 bg-green/10 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-green"></div>
                  <span className="text-sm font-medium text-green">Verified: {dashboardStats?.verifiedUsers || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-blue/10 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-blue"></div>
                  <span className="text-sm font-medium text-blue">Pending: {dashboardStats?.pendingVerificationUsers || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red/10 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-red"></div>
                  <span className="text-sm font-medium text-red">Rejected: {dashboardStats?.rejectedVerificationUsers || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document Verification Pie Chart */}
          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck size={18} className="text-blue" />
                Document Verification Status
              </CardTitle>
              <CardDescription>Distribution of document verifications</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              ) : totalDocs === 0 ? (
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
                <div className="flex items-center gap-2 px-3 py-1 bg-blue/10 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-blue"></div>
                  <span className="text-sm font-medium text-blue">Pending: {dashboardStats?.pendingDocuments || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green/10 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-green"></div>
                  <span className="text-sm font-medium text-green">Approved: {dashboardStats?.approvedDocuments || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-red/10 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-red"></div>
                  <span className="text-sm font-medium text-red">Rejected: {dashboardStats?.rejectedDocuments || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Booking Statistics Pie Chart */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={18} className="text-purple" />
              Booking Statistics
            </CardTitle>
            <CardDescription>Distribution of booking statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ) : (dashboardStats?.totalBookings || 0) === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Calendar size={48} className="mb-2 opacity-50" />
                <p>No booking data available</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={bookingPieData}
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
                      {bookingPieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                          stroke={entry.color}
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} bookings`, name]}
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
                  <p className="text-2xl font-bold text-gray-800">{dashboardStats?.totalBookings || 0}</p>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                </div>
              </div>
            )}
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              <div className="flex items-center gap-2 px-3 py-1 bg-amber/10 rounded-full">
                <div className="w-3 h-3 rounded-full bg-amber"></div>
                <span className="text-sm font-medium text-amber">Pending: {dashboardStats?.pendingBookings || 0}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-green/10 rounded-full">
                <div className="w-3 h-3 rounded-full bg-green"></div>
                <span className="text-sm font-medium text-green">Confirmed: {dashboardStats?.confirmedBookings || 0}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue/10 rounded-full">
                <div className="w-3 h-3 rounded-full bg-blue"></div>
                <span className="text-sm font-medium text-blue">Completed: {dashboardStats?.completedBookings || 0}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-red/10 rounded-full">
                <div className="w-3 h-3 rounded-full bg-red"></div>
                <span className="text-sm font-medium text-red">Cancelled: {dashboardStats?.cancelledBookings || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manual User Verification Section - Quick Summary */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck size={18} className="text-purple" />
                  User Verification
                </CardTitle>
                <CardDescription>Quick overview of verification queue</CardDescription>
              </div>
              <Button 
                onClick={() => window.location.href = '/admin/verification'}
                className="bg-purple text-white hover:bg-purple-600"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={20} className="text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Pending</span>
                </div>
                <p className="text-2xl font-bold text-yellow-900">
                  {dashboardStats?.pendingVerificationUsers || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={20} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">Verified</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {dashboardStats?.verifiedUsers || 0}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle size={20} className="text-red-600" />
                  <span className="text-sm font-medium text-red-800">Rejected</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {dashboardStats?.rejectedVerificationUsers || 0}
                </p>
              </div>
            </div>
            {pendingUsers?.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>{pendingUsers.length}</strong> user(s) awaiting verification. 
                  <a href="/admin/verification" className="ml-1 text-purple underline hover:no-underline">
                    Review now →
                  </a>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <Card className="bg-white border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={18} className="text-purple" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-80 bg-gray-200 rounded"></div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">User Verification Review</DialogTitle>
            <DialogDescription>Review user details and documents before verification</DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{selectedUser.name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{selectedUser.email}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedUser.phoneNumber || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Registered:</span>
                    <p className="font-medium">
                      {new Date(selectedUser.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-semibold mb-3">Submitted Documents</h3>
                {selectedUser.documents?.length === 0 ? (
                  <p className="text-gray-500 text-sm">No documents submitted</p>
                ) : (
                  <div className="space-y-3">
                    {selectedUser.documents?.map((doc) => (
                      <div 
                        key={doc.id} 
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{doc.documentType}</p>
                          <Badge 
                            className={
                              doc.verificationStatus === "Approved" 
                                ? "bg-green-100 text-green-700"
                                : doc.verificationStatus === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {doc.verificationStatus}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.documentUrl, '_blank')}
                        >
                          <Eye size={14} className="mr-1" /> View
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setShowUserDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setShowRejectDialog(true);
                  }}
                >
                  <XCircle size={16} className="mr-1" /> Reject
                </Button>
                <Button 
                  className="bg-green text-white hover:bg-green-600"
                  onClick={() => handleApproveUser(selectedUser.id)}
                  disabled={verifying}
                >
                  {verifying ? (
                    <RefreshCw size={16} className="mr-1 animate-spin" />
                  ) : (
                    <CheckCircle size={16} className="mr-1" />
                  )}
                  Approve User
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Reject User Verification</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this user's verification
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">Rejection Reason</Label>
              <Input
                id="reason"
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectUser}
              disabled={!rejectionReason.trim() || verifying}
            >
              {verifying ? (
                <RefreshCw size={16} className="mr-1 animate-spin" />
              ) : (
                <XCircle size={16} className="mr-1" />
              )}
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default DashboardOverview;