import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/ui/select";
import {
  CheckCircle,
  XCircle,
  Eye,
  Loader,
  AlertCircle,
} from "lucide-react";
import {
  getPendingDocuments,
  verifyDocument,
} from "../../service/documentService";

const AdminDocumentReviewComponent = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState(null);

  // Dialog states
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showVerfiyDialog, setShowVerifyDialog] = useState(false);
  const [verificationAction, setVerificationAction] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchPendingDocuments();
  }, [page]);

  const fetchPendingDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPendingDocuments(page, 10);
      
      if (response.status) {
        setDocuments(response.data);
        setPagination(response.pagination);
        setTotalPages(response.pagination?.pages || 1);
      }
    } catch (err) {
      setError(err?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
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

    if (
      verificationAction === "Rejected" &&
      !rejectionReason.trim()
    ) {
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
        setSuccess(
          `Document ${verificationAction.toLowerCase()} successfully!`
        );
        setShowVerifyDialog(false);
        setSelectedDocument(null);

        // Refresh list
        setTimeout(() => {
          fetchPendingDocuments();
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

  return (
    <div className="space-y-6">
      <Card className="border-2 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Document Verification Queue
          </CardTitle>
          <CardDescription>
            Review and verify user submitted documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pagination && (
            <div className="text-sm text-gray-600">
              <p>
                Total Pending Documents: <strong>{pagination.total}</strong>
              </p>
              <p>
                Page {pagination.page} of {pagination.pages}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}

      {/* Documents List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Loader className="w-8 h-8 animate-spin mx-auto text-gray-400" />
                <p className="text-sm text-gray-600 mt-3">
                  Loading documents...
                </p>
              </div>
            </CardContent>
          </Card>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-lg font-semibold text-gray-700">
                  All Caught Up!
                </p>
                <p className="text-sm text-gray-600">
                  No pending documents to review
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Document Info */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          {doc.documentType}
                        </h3>
                        <Badge variant="outline" className="bg-yellow-50">
                          Pending
                        </Badge>
                      </div>

                      {/* User Info */}
                      {doc.user && (
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <strong>User:</strong> {doc.user.name || "N/A"}
                          </p>
                          <p>
                            <strong>Email:</strong> {doc.user.auth?.email}
                          </p>
                          <p>
                            <strong>Phone:</strong> {doc.user.phoneNumber || "N/A"}
                          </p>
                          <p>
                            <strong>Document ID:</strong> {doc.id}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:w-48">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewDocument(doc)}
                      disabled={verifying}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Document
                    </Button>

                    <Button
                      className="w-full bg-green text-white hover:bg-green-600"
                      onClick={() => handleVerifyClick(doc, "Approved")}
                      disabled={verifying}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>

                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleVerifyClick(doc, "Rejected")}
                      disabled={verifying}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Document Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
            <DialogDescription>
              {selectedDocument?.documentType} - ID: {selectedDocument?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedDocument?.documentUrl && (
            <div className="space-y-4">
              {selectedDocument.documentUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={selectedDocument.documentUrl}
                  className="w-full h-96 border rounded"
                  title="PDF Document"
                />
              ) : (
                <img
                  src={selectedDocument.documentUrl}
                  alt="Document"
                  className="w-full max-h-96 object-contain border rounded"
                />
              )}
              <a
                href={selectedDocument.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-sm"
              >
                Open in new tab →
              </a>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={showVerfiyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationAction === "Approved"
                ? "Approve Document"
                : "Reject Document"}
            </DialogTitle>
            <DialogDescription>
              {selectedDocument?.documentType} from {selectedDocument?.user?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {verificationAction === "Rejected" && (
              <div className="space-y-2">
                <Label htmlFor="reason">Rejection Reason *</Label>
                <Input
                  id="reason"
                  placeholder="e.g., Document is blurry, incomplete, or invalid"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  disabled={verifying}
                />
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                {verificationAction === "Approved"
                  ? "This document will be approved and the user's account verification status will be updated if all documents are approved."
                  : "The user will be notified about the rejection and can resubmit documents."}
              </p>
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
              disabled={
                verifying ||
                (verificationAction === "Rejected" && !rejectionReason.trim())
              }
              className={
                verificationAction === "Approved"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {verifying ? "Processing..." : verificationAction}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDocumentReviewComponent;
