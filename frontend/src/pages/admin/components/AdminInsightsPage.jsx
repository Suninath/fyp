import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieChartIcon, Users, Car, RefreshCw } from "lucide-react";

import AdminLayout from "./AdminLayout";
import { getDashboardStats } from "../../../rtk/thunk/adminThunk";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../ui/ui/card";
import { Button } from "../../../ui/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/ui/table";

const CHART_COLORS = ["#624BFF", "#00b300", "#0096FF", "#F59E0B", "#e50000", "#06B6D4", "#8B5CF6"];

const AdminInsightsPage = () => {
  const dispatch = useDispatch();
  const { dashboardStats, loading } = useSelector((state) => state.admin);
  const [insightsWindow, setInsightsWindow] = useState("all");

  const fetchInsights = useCallback(() => {
    const insightsDays = insightsWindow === "all" ? undefined : Number(insightsWindow);
    dispatch(getDashboardStats({ insightsDays }));
  }, [dispatch, insightsWindow]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  useEffect(() => {
    const refreshTimer = window.setInterval(() => {
      fetchInsights();
    }, 15000);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, [fetchInsights]);

  const vehicleInsights = dashboardStats?.vehicleInterestInsights || [];

  const pieData = useMemo(() => {
    return vehicleInsights
      .filter((item) => Number(item?.interestedUsersCount || 0) > 0)
      .map((item) => ({
        name: item?.vehicleName || `Vehicle #${item?.vehicleId}`,
        value: Number(item?.interestedUsersCount || 0),
        fullLabel: `${item?.make || ""} ${item?.model || ""} ${item?.year ? `(${item.year})` : ""}`.trim(),
      }));
  }, [vehicleInsights]);

  const interestedUserRows = useMemo(() => {
    return vehicleInsights.flatMap((insight) => {
      const renters = new Set((insight?.renters || []).map((r) => r?.id));
      const purchasers = new Set((insight?.purchasers || []).map((p) => p?.id));

      return (insight?.interestedUsers || []).map((user) => ({
        key: `${insight?.vehicleId}-${user?.id}`,
        vehicleId: insight?.vehicleId,
        vehicleName: insight?.vehicleName,
        make: insight?.make,
        model: insight?.model,
        year: insight?.year,
        userId: user?.id,
        userName: user?.name || "Unknown User",
        userEmail: user?.email || "N/A",
        isRenter: renters.has(user?.id),
        isPurchaser: purchasers.has(user?.id),
      }));
    });
  }, [vehicleInsights]);

  const totalVehicleViews = Number(dashboardStats?.totalVehicleViews || 0);
  const vehiclesWithViews = Number(dashboardStats?.vehiclesWithViews || 0);
  const totalInterestedUsers = Number(dashboardStats?.totalVehicleInterests || 0);
  const vehiclesWithInterest = Number(dashboardStats?.vehiclesWithInterest || 0);

  return (
    <AdminLayout activeTab="insights">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Vehicle Interest Insights</h2>
            <p className="text-sm text-gray-500 mt-1">
              Analyze which vehicles attract users and see detailed interested-user records.
            </p>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="w-full md:w-64">
              <Select value={insightsWindow} onValueChange={setInsightsWindow}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Filter time range" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              className="border-gray-300 bg-white"
              onClick={fetchInsights}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Vehicle Views</p>
                  <p className="text-3xl font-bold text-gray-900">{totalVehicleViews}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue/10">
                  <PieChartIcon className="h-6 w-6 text-blue" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Vehicles Viewed</p>
                  <p className="text-3xl font-bold text-gray-900">{vehiclesWithViews}</p>
                </div>
                <div className="p-4 rounded-xl bg-cyan/10">
                  <Car className="h-6 w-6 text-cyan" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Interested Users</p>
                  <p className="text-3xl font-bold text-gray-900">{totalInterestedUsers}</p>
                </div>
                <div className="p-4 rounded-xl bg-purple/10">
                  <Users className="h-6 w-6 text-purple" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium mb-1">Vehicles With Interest</p>
                  <p className="text-3xl font-bold text-gray-900">{vehiclesWithInterest}</p>
                </div>
                <div className="p-4 rounded-xl bg-blue/10">
                  <Car className="h-6 w-6 text-blue" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Compact Top Vehicles */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <PieChartIcon size={18} className="text-purple" />
                Top Vehicles (by interest)
              </span>
              <span className="text-sm text-gray-500">Top 5</span>
            </CardTitle>
            <CardDescription className="text-sm">Most engaged vehicles — unique interested users first, then views.</CardDescription>
          </CardHeader>
          <CardContent>
            {vehicleInsights.length === 0 ? (
              <div className="text-center py-6 text-gray-500">No vehicle interest data available.</div>
            ) : (
              <div className="space-y-3">
                {vehicleInsights.slice(0, 5).map((item, idx) => (
                  <div key={item.vehicleId} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{idx + 1}. {item.vehicleName}</div>
                      <div className="text-xs text-gray-500 truncate">{item.make} {item.model} {item.year ? `• ${item.year}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{item.interestedUsersCount || 0}</div>
                        <div className="text-xs text-gray-500">Interested</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{item.totalViews || 0}</div>
                        <div className="text-xs text-gray-500">Views</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{(item.rentalsCount || 0)}</div>
                        <div className="text-xs text-gray-500">Rented</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{(item.purchasesCount || 0)}</div>
                        <div className="text-xs text-gray-500">Purchased</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon size={18} className="text-purple" />
              Interest Distribution by Vehicle
            </CardTitle>
            <CardDescription>Number of interested users per vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-72 bg-gray-200 rounded"></div>
              </div>
            ) : pieData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <PieChartIcon size={36} className="mx-auto mb-2 opacity-50" />
                <p>No interest data to display.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={120}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`insight-cell-${entry.name}-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, _name, item) => [`${value} users`, item?.payload?.name || "Vehicle"]}
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={48}
                    formatter={(value, entry) => {
                      const label = entry?.payload?.fullLabel || value;
                      return <span className="text-sm text-gray-700">{label}</span>;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl">
          <CardHeader>
            <CardTitle>Interested Users Table</CardTitle>
            <CardDescription>
              Detailed list of users who showed interest in each vehicle.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            ) : interestedUserRows.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No interested users recorded yet.</div>
            ) : (
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Interested User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Converted</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interestedUserRows.map((row) => (
                      <TableRow key={row.key}>
                        <TableCell>
                          <p className="font-semibold text-gray-900">{row.vehicleName}</p>
                          <p className="text-xs text-gray-500">
                            {row.make} {row.model} ({row.year})
                          </p>
                        </TableCell>
                        <TableCell className="text-gray-800">{row.userName}</TableCell>
                        <TableCell className="text-gray-700">{row.userEmail}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                              row.isPurchaser
                                ? "bg-indigo/10 text-indigo"
                                : row.isRenter
                                ? "bg-green/10 text-green"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {row.isPurchaser ? "Purchased" : row.isRenter ? "Rented" : "Not yet"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminInsightsPage;
