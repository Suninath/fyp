import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Car,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  DollarSign,
} from "lucide-react";

import { Button } from "../../../ui/ui/button";
import { Badge } from "../../../ui/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../ui/ui/dialog";

import AdminLayout from "./AdminLayout";
import { getAllBookings, updateBookingStatus, getBookingStats } from "../../../rtk/thunk/adminThunk";

const ALL = "all";

const BookingManagement = () => {
  const dispatch = useDispatch();
  const { bookings, bookingPagination, bookingStats, loading } = useSelector(
    (state) => state.admin
  );

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  /* ---------------- FETCH BOOKINGS ---------------- */
  useEffect(() => {
    dispatch(
      getAllBookings({
        page,
        limit: 10,
        status: statusFilter === ALL ? undefined : statusFilter,
      })
    );
  }, [page, statusFilter, dispatch]);

  /* ---------------- FETCH STATS ---------------- */
  useEffect(() => {
    dispatch(getBookingStats());
  }, [dispatch]);

  /* ---------------- HANDLERS ---------------- */
  const handleStatusChange = async () => {
    if (!selectedBooking || !newStatus) return;
    setActionLoading(selectedBooking.id);
    await dispatch(updateBookingStatus({ bookingId: selectedBooking.id, status: newStatus }));
    // Refresh stats after status change
    dispatch(getBookingStats());
    setActionLoading(null);
    setIsStatusDialogOpen(false);
    setSelectedBooking(null);
    setNewStatus("");
  };

  const openStatusDialog = (booking, status) => {
    setSelectedBooking(booking);
    setNewStatus(status);
    setIsStatusDialogOpen(true);
  };

  const handleRefresh = () => {
    dispatch(
      getAllBookings({
        page,
        limit: 10,
        status: statusFilter === ALL ? undefined : statusFilter,
      })
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return <Badge className="bg-green text-white">Confirmed</Badge>;
      case "Pending":
        return <Badge className="bg-amber text-white">Pending</Badge>;
      case "Cancelled":
        return <Badge className="bg-red text-white">Cancelled</Badge>;
      case "Completed":
        return <Badge className="bg-blue text-white">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="w-4 h-4 text-green" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-amber" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-red" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-blue" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const totalPages = bookingPagination?.totalPages || 1;

  return (
    <AdminLayout activeTab="bookings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
            <p className="text-gray-600">View and manage all vehicle bookings</p>
          </div>
          <Button
            onClick={handleRefresh}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{bookingStats?.total || 0}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-amber">
                    {bookingStats?.pending || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-amber opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Confirmed</p>
                  <p className="text-2xl font-bold text-green">
                    {bookingStats?.confirmed || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-blue">
                    {bookingStats?.completed || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Cancelled</p>
                  <p className="text-2xl font-bold text-red">
                    {bookingStats?.cancelled || 0}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Status:</span>
                <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setPage(1); }}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-purple" />
              </div>
            ) : bookings?.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No bookings found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Dates</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings?.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">#{booking.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">{booking.user?.name || "N/A"}</p>
                              <p className="text-xs text-gray-500">{booking.user?.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {booking.vehicle?.images?.[0] ? (
                              <img
                                src={booking.vehicle.images[0]}
                                alt={booking.vehicle.name}
                                className="w-10 h-10 rounded object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                <Car className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-sm">{booking.vehicle?.name}</p>
                              <p className="text-xs text-gray-500">
                                {booking.vehicle?.make} {booking.vehicle?.model}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{formatDate(booking.startDate)}</p>
                            <p className="text-gray-500">to {formatDate(booking.endDate)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-semibold text-green">Rs. {Number(booking.finalAmount).toLocaleString('en-IN')}</p>
                        </TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsDetailsOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {booking.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green text-white hover:bg-green-600"
                                  onClick={() => openStatusDialog(booking, "Confirmed")}
                                  disabled={actionLoading === booking.id}
                                >
                                  Confirm
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => openStatusDialog(booking, "Cancelled")}
                                  disabled={actionLoading === booking.id}
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {booking.status === "Confirmed" && (
                              <Button
                                size="sm"
                                className="bg-blue text-white hover:bg-blue-600"
                                onClick={() => openStatusDialog(booking, "Completed")}
                                disabled={actionLoading === booking.id}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Booking Details #{selectedBooking?.id}</DialogTitle>
              <DialogDescription>
                Complete information about this booking
              </DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-6">
                {/* Status */}
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedBooking.status)}
                  {getStatusBadge(selectedBooking.status)}
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Name</p>
                      <p className="font-medium">{selectedBooking.user?.name || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Email</p>
                      <p className="font-medium">{selectedBooking.user?.email || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Car className="w-4 h-4" /> Vehicle Information
                  </h4>
                  <div className="flex gap-4">
                    {selectedBooking.vehicle?.images?.[0] && (
                      <img
                        src={selectedBooking.vehicle.images[0]}
                        alt={selectedBooking.vehicle.name}
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                      <div>
                        <p className="text-gray-500">Name</p>
                        <p className="font-medium">{selectedBooking.vehicle?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Make & Model</p>
                        <p className="font-medium">
                          {selectedBooking.vehicle?.make} {selectedBooking.vehicle?.model}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Year</p>
                        <p className="font-medium">{selectedBooking.vehicle?.year}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Booking Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Start Date</p>
                      <p className="font-medium">{formatDate(selectedBooking.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End Date</p>
                      <p className="font-medium">{formatDate(selectedBooking.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Duration</p>
                      <p className="font-medium">{selectedBooking.numberOfDays} days</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Location</p>
                      <p className="font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {selectedBooking.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Payment Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Daily Rate</p>
                      <p className="font-medium">Rs. {Number(selectedBooking.dailyRate).toLocaleString('en-IN')}/day</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Amount</p>
                      <p className="font-medium">Rs. {Number(selectedBooking.totalAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Final Amount</p>
                      <p className="font-semibold text-green text-lg">Rs. {Number(selectedBooking.finalAmount).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Payment Status</p>
                      <Badge variant={selectedBooking.paymentStatus === "Completed" ? "default" : "secondary"}>
                        {selectedBooking.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Created At */}
                <div className="text-xs text-gray-500">
                  Created: {new Date(selectedBooking.createdAt).toLocaleString()}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Update Confirmation Dialog */}
        <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Booking Status</DialogTitle>
              <DialogDescription>
                Are you sure you want to change the booking status to "{newStatus}"?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleStatusChange}
                className={
                  newStatus === "Confirmed"
                    ? "bg-green text-white hover:bg-green-600"
                    : newStatus === "Cancelled"
                    ? "bg-red text-white hover:bg-red-600"
                    : "bg-blue text-white hover:bg-blue-600"
                }
                disabled={actionLoading}
              >
                {actionLoading ? "Updating..." : `Mark as ${newStatus}`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default BookingManagement;
