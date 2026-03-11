import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  User,
  Car,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  DollarSign,
  Wallet,
  TrendingUp,
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
} from "../../../ui/ui/dialog";

import AdminLayout from "./AdminLayout";
import { getAllPayments, getPaymentStats } from "../../../rtk/thunk/adminThunk";

const ALL = "all";

const PaymentManagement = () => {
  const dispatch = useDispatch();
  const { payments, paymentPagination, paymentStats, loading } = useSelector(
    (state) => state.admin
  );

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [methodFilter, setMethodFilter] = useState(ALL);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  /* ---------------- FETCH PAYMENTS ---------------- */
  useEffect(() => {
    dispatch(
      getAllPayments({
        page,
        limit: 10,
        status: statusFilter === ALL ? undefined : statusFilter,
        method: methodFilter === ALL ? undefined : methodFilter,
      })
    );
  }, [page, statusFilter, methodFilter, dispatch]);

  /* ---------------- FETCH STATS ---------------- */
  useEffect(() => {
    dispatch(getPaymentStats());
  }, [dispatch]);

  /* ---------------- HANDLERS ---------------- */
  const handleRefresh = () => {
    dispatch(
      getAllPayments({
        page,
        limit: 10,
        status: statusFilter === ALL ? undefined : statusFilter,
        method: methodFilter === ALL ? undefined : methodFilter,
      })
    );
    dispatch(getPaymentStats());
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return <Badge className="bg-green text-white">Success</Badge>;
      case "Pending":
        return <Badge className="bg-amber text-white">Pending</Badge>;
      case "Failed":
        return <Badge className="bg-red text-white">Failed</Badge>;
      case "Cancelled":
        return <Badge className="bg-gray-500 text-white">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Success":
        return <CheckCircle className="w-4 h-4 text-green" />;
      case "Pending":
        return <Clock className="w-4 h-4 text-amber" />;
      case "Failed":
        return <XCircle className="w-4 h-4 text-red" />;
      case "Cancelled":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getMethodBadge = (method) => {
    switch (method) {
      case "eSewa":
        return <Badge className="bg-green-600 text-white">eSewa</Badge>;
      case "Khalti":
        return <Badge className="bg-purple text-white">Khalti</Badge>;
      default:
        return <Badge variant="secondary">{method}</Badge>;
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  const totalPages = paymentPagination?.totalPages || 1;

  return (
    <AdminLayout activeTab="payments">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600">View all payment transactions</p>
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
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{paymentStats?.total || 0}</p>
                </div>
                <CreditCard className="w-8 h-8 text-purple opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Success</p>
                  <p className="text-2xl font-bold text-green">
                    {paymentStats?.success || 0}
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
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-amber">
                    {paymentStats?.pending || 0}
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
                  <p className="text-xs text-gray-500">Failed</p>
                  <p className="text-2xl font-bold text-red">
                    {paymentStats?.failed || 0}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">eSewa</p>
                  <p className="text-2xl font-bold text-green-600">
                    {paymentStats?.byMethod?.esewa || 0}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Khalti</p>
                  <p className="text-2xl font-bold text-purple">
                    {paymentStats?.byMethod?.khalti || 0}
                  </p>
                </div>
                <Wallet className="w-8 h-8 text-purple opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Card */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Revenue (Successful Payments)</p>
                <p className="text-3xl font-bold mt-1">
                  {formatCurrency(paymentStats?.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={ALL}>All Status</SelectItem>
              <SelectItem value="Success">Success</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Failed">Failed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-white">
              <SelectValue placeholder="Filter by method" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value={ALL}>All Methods</SelectItem>
              <SelectItem value="eSewa">eSewa</SelectItem>
              <SelectItem value="Khalti">Khalti</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Payments Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Vehicle</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Method</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Transaction ID</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-gray-400" />
                        <p className="mt-2 text-gray-500">Loading payments...</p>
                      </TableCell>
                    </TableRow>
                  ) : payments?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <CreditCard className="w-12 h-12 mx-auto text-gray-300" />
                        <p className="mt-2 text-gray-500">No payments found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments?.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">#{payment.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">
                                {payment.user?.name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.user?.email || ""}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="font-medium text-sm">
                                {payment.vehicle?.name || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.vehicle?.make} {payment.vehicle?.model}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>{getMethodBadge(payment.method)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(payment.status)}
                            {getStatusBadge(payment.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {payment.transactionId || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {formatDate(payment.paidAt || payment.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages} ({paymentPagination?.count || 0} total)
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Payment Details Dialog */}
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple" />
                Payment Details #{selectedPayment?.id}
              </DialogTitle>
              <DialogDescription>
                Complete transaction information
              </DialogDescription>
            </DialogHeader>
            {selectedPayment && (
              <div className="space-y-4 mt-4">
                {/* Payment Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Payment Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Amount:</span>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(selectedPayment.amount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Method:</span>
                      <p>{getMethodBadge(selectedPayment.method)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p>{getStatusBadge(selectedPayment.status)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Transaction ID:</span>
                      <p className="font-mono text-xs">
                        {selectedPayment.transactionId || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" /> Customer Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Name:</span>
                      <p className="font-medium">{selectedPayment.user?.name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p>{selectedPayment.user?.email || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle & Booking Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Car className="w-4 h-4" /> Booking Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Vehicle:</span>
                      <p className="font-medium">{selectedPayment.vehicle?.name || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Booking ID:</span>
                      <p>#{selectedPayment.booking?.id || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Booking Status:</span>
                      <p>{selectedPayment.booking?.status || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Booking Amount:</span>
                      <p>{formatCurrency(selectedPayment.booking?.finalAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Timestamps
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Created At:</span>
                      <p>{formatDate(selectedPayment.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Paid At:</span>
                      <p>{formatDate(selectedPayment.paidAt)}</p>
                    </div>
                    {selectedPayment.refundedAt && (
                      <>
                        <div>
                          <span className="text-gray-500">Refund ID:</span>
                          <p>{selectedPayment.refundId || "-"}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Refund Amount:</span>
                          <p>{formatCurrency(selectedPayment.refundAmount)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Refunded At:</span>
                          <p>{formatDate(selectedPayment.refundedAt)}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default PaymentManagement;
