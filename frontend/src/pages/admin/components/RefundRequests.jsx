import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RefreshCw, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "../../../ui/ui/button";
import { Badge } from "../../../ui/ui/badge";
import { Card, CardContent } from "../../../ui/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../ui/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../../ui/ui/dialog";
import { Textarea } from "../../../ui/ui/textarea";
import AdminLayout from "./AdminLayout";
import { getRefundRequests, reviewRefundRequest } from "../../../rtk/thunk/adminThunk";

const ALL = "all";

const RefundRequests = () => {
  const dispatch = useDispatch();
  const { refundRequests, refundPagination, loading } = useSelector((state) => state.admin);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    dispatch(getRefundRequests({ page, limit: 10, status: statusFilter === ALL ? undefined : statusFilter }));
  }, [page, statusFilter, dispatch]);

  const handleRefresh = () => {
    dispatch(getRefundRequests({ page, limit: 10, status: statusFilter === ALL ? undefined : statusFilter }));
  };

  const formatDate = (value) => value ? new Date(value).toLocaleString() : "-";

  const getBadge = (status) => {
    switch (status) {
      case "Pending": return <Badge className="bg-amber text-white">Pending</Badge>;
      case "Approved": return <Badge className="bg-blue-600 text-white">Approved</Badge>;
      case "Rejected": return <Badge className="bg-red text-white">Rejected</Badge>;
      case "Processed": return <Badge className="bg-green text-white">Processed</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleReview = async (id, action) => {
    setActionLoading(id);
    await dispatch(reviewRefundRequest({ id, action, adminNotes: reviewNotes }));
    setActionLoading(null);
    setReviewNotes("");
    setIsDetailsOpen(false);
    setSelectedRequest(null);
    handleRefresh();
  };

  return (
    <AdminLayout activeTab="refunds">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Refund Requests</h1>
            <p className="text-gray-600">Review refund requests and process refunds manually through gateway dashboards.</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <Card>
          <CardContent className="p-4 flex gap-3 items-center">
            <label className="text-sm font-medium text-gray-600">Filter:</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value={ALL}>All</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Processed">Processed</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {refundRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>#{request.bookingId}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{request.user?.name || "N/A"}</div>
                        <div className="text-gray-500">{request.user?.email || "-"}</div>
                      </div>
                    </TableCell>
                    <TableCell>{request.vehicle?.name || "-"}</TableCell>
                    <TableCell>Rs. {Number(request.amount || 0).toLocaleString("en-IN")}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>{formatDate(request.requestedAt)}</TableCell>
                    <TableCell>{getBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedRequest(request); setIsDetailsOpen(true); }}>
                          <Eye className="w-4 h-4 mr-1" /> View
                        </Button>
                        {request.status === "Pending" && (
                          <>
                            <Button size="sm" className="bg-green text-white hover:bg-green/90" onClick={() => handleReview(request.id, "Approve")} disabled={actionLoading === request.id}>
                              <CheckCircle className="w-4 h-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" className="bg-red text-white hover:bg-red/90" onClick={() => handleReview(request.id, "Reject")} disabled={actionLoading === request.id}>
                              <XCircle className="w-4 h-4 mr-1" /> Reject
                            </Button>
                          </>
                        )}
                        {request.status === "Approved" && (
                          <Button size="sm" className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleReview(request.id, "Processed")} disabled={actionLoading === request.id}>
                            <Clock className="w-4 h-4 mr-1" /> Mark Processed
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Page {refundPagination?.currentPage || 1} of {refundPagination?.totalPages || 1}</span>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
            <Button variant="outline" disabled={page >= (refundPagination?.totalPages || 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refund Request Details</DialogTitle>
            <DialogDescription>Review or process this refund request.</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-3 text-sm text-gray-700">
              <p><strong>Booking:</strong> #{selectedRequest.bookingId}</p>
              <p><strong>User:</strong> {selectedRequest.user?.name} ({selectedRequest.user?.email})</p>
              <p><strong>Vehicle:</strong> {selectedRequest.vehicle?.name}</p>
              <p><strong>Amount:</strong> Rs. {Number(selectedRequest.amount || 0).toLocaleString("en-IN")}</p>
              <p><strong>Reason:</strong> {selectedRequest.reason}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              {selectedRequest.adminNotes && <p><strong>Admin notes:</strong> {selectedRequest.adminNotes}</p>}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-800">Admin notes</label>
                <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Optional review / rejection notes" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>Close</Button>
                {selectedRequest.status === "Pending" && (
                  <>
                    <Button className="bg-green text-white hover:bg-green/90" onClick={() => handleReview(selectedRequest.id, "Approve")}>Approve</Button>
                    <Button className="bg-red text-white hover:bg-red/90" onClick={() => handleReview(selectedRequest.id, "Reject")}>Reject</Button>
                  </>
                )}
                {selectedRequest.status === "Approved" && (
                  <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => handleReview(selectedRequest.id, "Processed")}>Mark Processed</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default RefundRequests;
