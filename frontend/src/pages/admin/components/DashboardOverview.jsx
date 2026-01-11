import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Users,
  Store,
  Car,
  DollarSign,
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

import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/ui/card";
import AdminLayout from "./AdminLayout";
import { getDashboardStats } from "../../../rtk/thunk/adminThunk";

const DashboardOverview = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  const pieData = [
    { name: "Users", value: dashboardStats?.totalUsers || 0, color: "#624BFF" },
    { name: "Stores", value: dashboardStats?.totalStores || 0, color: "#0096FF" },
    { name: "Vehicles", value: dashboardStats?.totalVehicles || 0, color: "#00D4FF" }
  ];

  const barData = [
    { name: "Users", count: dashboardStats?.totalUsers || 0 },
    { name: "Stores", count: dashboardStats?.totalStores || 0 },
    { name: "Vehicles", count: dashboardStats?.totalVehicles || 0 }
  ];

  return (
    <AdminLayout activeTab="dashboard">
      <div className="space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: "Total Users", value: dashboardStats?.totalUsers || 0, icon: Users, color: "text-blue-600", loading: loading },
            { label: "Total Stores", value: dashboardStats?.totalStores || 0, icon: Store, color: "text-green-600", loading: loading },
            { label: "Total Vehicles", value: dashboardStats?.totalVehicles || 0, icon: Car, color: "text-purple-600", loading: loading },
            { label: "Total Revenue", value: `$${dashboardStats?.totalRevenue || 0}`, icon: DollarSign, color: "text-yellow-600", loading: loading }
          ].map(({ label, value, icon: Icon, color, loading: itemLoading }) => (
            <Card key={label} className="bg-white border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex justify-between items-center pb-2">
                <CardTitle className="text-sm text-gray-500 font-medium">
                  {label}
                </CardTitle>
                <Icon className={`h-5 w-5 ${color}`} />
              </CardHeader>
              <CardContent>
                {itemLoading ? (
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">
                    {value}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart size={18} className="text-purple" />
                User Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-80 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPieChart>
                    <Pie data={pieData} dataKey="value" outerRadius={90}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              )}
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
      </div>
    </AdminLayout>
  );
};

export default DashboardOverview;