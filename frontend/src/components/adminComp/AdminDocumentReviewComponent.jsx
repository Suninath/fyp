import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../ui/ui/card";
import { Button } from "../../ui/ui/button";
import { Badge } from "../../ui/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../ui/ui/dialog";
import { Input } from "../../ui/ui/input";
import { Label } from "../../ui/ui/label";
import {
  CheckCircle,
  XCircle,
  Eye,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Users,
  ExternalLink,
} from "lucide-react";
import {
  getAllDocuments,
  verifyDocument,
} from "../../service/documentService";

const TABS = [
  { key: "all", label: "All" },
  { key: "Pending", label: "Pending" },
  { key: "Approved", label: "Approved" },
  { key: "Rejected", label: "Rejected" },
];

const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Approved: "bg-green-100 text-green-800 border-green-200",
  Rejected: "bg-red-100 text-red-800 border-red-200",
};

const AdminDocumentReviewComponent = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [counts, setCounts] = useState({ all: 0, Pending: 0, Approved: 0, Rejected: 0 });

  // Dialog states
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [verifying, setVerifying] = useState(false);

  const fetchDocuments = useCallback(async (tabStatus, pageNum) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllDocuments(pageNum, 10, tabStatus);
      if (response.status) {
        setDocuments(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch counts for all tabs on mount and after actions
  const fetchCounts = useCallback(async () => {
    try {
      const [all, pending, approved, rejected] = await Promise.all([
        getAllDocuments(1, 1, "all"),
        getAllDocuments(1, 1, "Pending"),
        getAllDocuments(1, 1, "Approved"),
        getAllDocuments(1, 1, "Rejected"),
      ]);
      setCounts({
        all: all.pagination?.total ?? 0,
        Pending: pending.pagination?.total ?? 0,
        Approved: approved.pagination?.total ?? 0,
        Rejected: rejected.pagination?.total ?? 0,
      });
    } catch {
      // non-critical
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    fetchDocuments(activeTab, page);
  }, [activeTab, page, fetchDocuments]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setShowImageDialog(true);
  };

  const handleVerifyClick = (doc, action) => {
    setSelectedDocument(doc);
    setVerificationAction(action);
    setRejectionReason("");
    setShowVerifyDialog(true);
  };

  const handleSubmitVerification = async () => {
    if (!selectedDocument) return;
    if (verificationAction === "Rejected" && !rejectionReason.trim()) {
      setError("Rejection reason is required");
      return;
    }

    try {
      setVerifying(true);
      setError(null);
      const response = await verifyDocument(
        selectedDocument.id,
        verificationAction,
        verificationAction === "Rejected" ? rejectionReason : null
      );
      if (response.status) {
        setSuccess(`Document ${verificationAction.toLowerCase()} successfully!`);
        setShowVerifyDialog(false);
        setSelectedDocument(null);
        setTimeout(() => {
          fetchDocuments(activeTab, page);
          fetchCounts();
          setSuccess(null);
        }, 1500);
      } else {
        setError(response.message || "Verification failed");
      }
    } catch (err) {
      setError(err?.message || "Failed to verify document");
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Document Verification</h2>
          <p className="text-sm text-gray-500 mt-1">Review and verify user-submitted documents</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-gray-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">{counts.all}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-yellow-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-xl font-bold text-yellow-700">{counts.Pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-green-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Approved</p>
                <p className="text-xl font-bold text-green-700">{counts.Approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-red-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Rejected</p>
                <p className="text-xl font-bold text-red-700">{counts.Rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3 items-center">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
          <button className="ml-auto text-red-400 hover:text-red-600" onClick={() => setError(null)}>✕</button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3 items-center">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Table Card */}
      <Card className="border border-gray-200 shadow-sm">
        {/* Filter Tabs */}
        <div className="border-b border-gray-200 px-6 pt-4">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "bg-white border border-b-white border-gray-200 text-blue-600 -mb-px z-10"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {counts[tab.key] ?? 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <p className="text-sm">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="w-12 h-12 mb-3" />
              <p className="text-base font-medium text-gray-600">No documents found</p>
              <p className="text-sm mt-1">
                {activeTab === "all" ? "No documents have been submitted yet." : `No ${activeTab.toLowerCase()} documents.`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Document Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                        #{String(doc.id).slice(0, 8)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                            {(doc.user?.name || "U").charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{doc.user?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{doc.user?.auth?.email || "—"}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{doc.documentType}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[doc.verificationStatus] || "bg-gray-100 text-gray-600"}`}>
                          {doc.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(doc.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                            onClick={() => handleViewDocument(doc)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          {doc.verificationStatus === "Pending" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleVerifyClick(doc, "Approved")}
                                disabled={verifying}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 px-2 text-xs"
                                onClick={() => handleVerifyClick(doc, "Rejected")}
                                disabled={verifying}
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, pagination.total)} of {pagination.total} documents
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700 px-2">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Document Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Document Preview
            </DialogTitle>
            <DialogDescription>
              <strong>{selectedDocument?.documentType}</strong> — submitted by{" "}
              {selectedDocument?.user?.name || "Unknown User"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {selectedDocument?.documentUrl ? (
              <>
                {selectedDocument.documentUrl.toLowerCase().match(/\.pdf(\?|$)/) ? (
                  <iframe
                    src={selectedDocument.documentUrl}
                    className="w-full h-96 border rounded-lg"
                    title="PDF Document"
                  />
                ) : (
                  <img
                    src={selectedDocument.documentUrl}
                    alt="Document"
                    className="w-full max-h-96 object-contain border rounded-lg bg-gray-50"
                  />
                )}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Submitted: {formatDate(selectedDocument?.createdAt)}</span>
                  <a
                    href={selectedDocument.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Open in new tab
                  </a>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-8 text-gray-400">
                <FileText className="w-12 h-12 mb-2" />
                <p>No document URL available</p>
              </div>
            )}
          </div>

          <DialogFooter>
            {selectedDocument?.verificationStatus === "Pending" && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    setShowImageDialog(false);
                    handleVerifyClick(selectedDocument, "Approved");
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowImageDialog(false);
                    handleVerifyClick(selectedDocument, "Rejected");
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setShowImageDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Confirmation Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${verificationAction === "Approved" ? "text-green-700" : "text-red-700"}`}>
              {verificationAction === "Approved" ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              {verificationAction === "Approved" ? "Approve Document" : "Reject Document"}
            </DialogTitle>
            <DialogDescription>
              <strong>{selectedDocument?.documentType}</strong> from{" "}
              {selectedDocument?.user?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {verificationAction === "Rejected" && (
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason <span className="text-red-500">*</span></Label>
                <Input
                  id="reason"
                  placeholder="e.g., Document is blurry, incomplete, or invalid"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={verifying}
                />
              </div>
            )}

            <div className={`p-3 rounded-lg text-sm ${verificationAction === "Approved" ? "bg-green-50 border border-green-200 text-green-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
              {verificationAction === "Approved"
                ? "The user will be notified and their account verification status will be updated."
                : "The user will be notified about the rejection and can resubmit their documents."}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVerifyDialog(false)}
              disabled={verifying}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitVerification}
              disabled={verifying || (verificationAction === "Rejected" && !rejectionReason.trim())}
              className={verificationAction === "Approved" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {verifying ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                verificationAction
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocumentReviewComponent;
