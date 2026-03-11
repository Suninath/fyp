import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
} from "../../ui/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/ui/select";
import { Upload, Trash2, CheckCircle, AlertCircle, Loader, Eye, FileText, ExternalLink } from "lucide-react";
import { uploadDocument, deleteDocument } from "../../service/documentService";
import { getVerificationStatus } from "../../service/documentService";
import ConfirmDialog from "../common/ConfirmDialog";

const DOCUMENT_TYPES = {
  CITIZENSHIP: "Citizenship",
  NATIONAL_CARD: "National Card",
  PANCARD: "PAN Card",
  COMPANY_REGISTRATION: "Company Registration",
};

const DocumentUploadComponent = () => {
  const [selectedType, setSelectedType] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [viewDocument, setViewDocument] = useState(null);

  React.useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true);
      const response = await getVerificationStatus();
      console.log("📋 Verification status response:", response);
      if (response.status) {
        setVerificationStatus(response.data);
        setDocuments(response.data.documents || []);
        console.log("📄 Documents loaded:", response.data.documents);
      }
    } catch (err) {
      console.error("❌ Failed to fetch verification status:", err);
      setError(err?.message || "Failed to load verification status");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPG, PNG, and PDF files are allowed");
        return;
      }

      // Check file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedType || !selectedFile) {
      setError("Please select document type and file");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      
      const response = await uploadDocument(selectedType, selectedFile);
      
      if (response.status) {
        setSuccess("Document uploaded successfully! Pending verification.");
        setSelectedType("");
        setSelectedFile(null);
        
        // Refresh status
        setTimeout(() => {
          fetchVerificationStatus();
          setSuccess(null);
        }, 2000);
      } else {
        setError(response.message || "Upload failed");
      }
    } catch (err) {
      setError(err?.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    try {
      setUploading(true);
      const response = await deleteDocument(deleteConfirm.id);
      
      if (response.status) {
        setSuccess("Document deleted successfully");
        setDocuments(documents.filter((d) => d.id !== deleteConfirm.id));
        setDeleteConfirm(null);
        
        setTimeout(() => setSuccess(null), 2000);
      } else {
        setError(response.message || "Delete failed");
      }
    } catch (err) {
      setError(err?.message || "Failed to delete document");
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green/10 text-green border border-green/20";
      case "Rejected":
        return "bg-red/10 text-red border border-red/20";
      case "Pending":
        return "bg-blue/10 text-blue border border-blue/20";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="w-4 h-4" />;
      case "Rejected":
        return <AlertCircle className="w-4 h-4" />;
      case "Pending":
        return <Loader className="w-4 h-4 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Verification Status Summary */}
      {verificationStatus && (
        <Card className="border border-gray-200 bg-white shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple to-blue text-white">
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Documents Uploaded */}
              <div className="bg-white border-2 border-purple/20 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-3 bg-purple/10 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-purple" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {verificationStatus.documentsUploaded}
                </div>
                <div className="text-sm text-gray-500 font-medium">Uploaded</div>
              </div>

              {/* Pending Review */}
              <div className="bg-white border-2 border-blue/20 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-3 bg-blue/10 rounded-full flex items-center justify-center">
                  <Loader className="w-6 h-6 text-blue" />
                </div>
                <div className="text-2xl font-bold text-blue">
                  {verificationStatus.documentsPending}
                </div>
                <div className="text-sm text-gray-500 font-medium">Pending</div>
              </div>

              {/* Approved */}
              <div className="bg-white border-2 border-green/20 rounded-xl p-4 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-3 bg-green/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green" />
                </div>
                <div className="text-2xl font-bold text-green">
                  {verificationStatus.documentsApproved}
                </div>
                <div className="text-sm text-gray-500 font-medium">Approved</div>
              </div>

              {/* Account Status */}
              <div className={`bg-white border-2 rounded-xl p-4 text-center hover:shadow-md transition-shadow ${
                verificationStatus.accountVerified ? 'border-green/20' : 'border-red/20'
              }`}>
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  verificationStatus.accountVerified ? 'bg-green/10' : 'bg-red/10'
                }`}>
                  {verificationStatus.accountVerified ? (
                    <CheckCircle className="w-6 h-6 text-green" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red" />
                  )}
                </div>
                <div className={`text-lg font-bold ${
                  verificationStatus.accountVerified ? 'text-green' : 'text-red'
                }`}>
                  {verificationStatus.accountVerified ? "Verified" : "Not Verified"}
                </div>
                <div className="text-sm text-gray-500 font-medium">Account</div>
              </div>
            </div>

            {verificationStatus.verificationRejected && (
              <div className="mt-6 p-4 bg-red/5 border border-red/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red">Verification Rejected</p>
                    <p className="text-sm text-gray-700 mt-1">
                      {verificationStatus.rejectionReason}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Upload className="w-5 h-5 text-purple" />
            Upload Verification Document
          </CardTitle>
          <CardDescription className="text-gray-600">
            Upload your citizenship, ID, PAN card, or company registration documents
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleUpload} className="space-y-4">
            {/* Alert Messages */}
            {error && (
              <div className="p-3 bg-red/5 border border-red/20 rounded-lg flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red flex-shrink-0" />
                <p className="text-sm text-red">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 bg-green/5 border border-green/20 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green flex-shrink-0" />
                <p className="text-sm text-green">{success}</p>
              </div>
            )}

            {/* Document Type Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Document Type *</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DOCUMENT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* File Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-900">Document File *</label>
              <div className="border-2 border-dashed border-purple/30 rounded-xl p-6 text-center hover:border-purple/50 hover:bg-purple/5 transition bg-white">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-input"
                  disabled={uploading}
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-purple/10 rounded-full flex items-center justify-center">
                      <Upload className="w-6 h-6 text-purple" />
                    </div>
                    <div className="text-sm text-gray-600">
                      {selectedFile ? (
                        <>
                          <p className="font-semibold text-green">
                            {selectedFile.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-gray-700">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            JPG, PNG, or PDF (up to 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple to-blue hover:from-purple/90 hover:to-blue/90 text-white"
              disabled={uploading || !selectedType || !selectedFile}
            >
              {uploading ? "Uploading..." : "Upload Document"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card className="bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gray-50 border-b border-gray-100">
          <CardTitle className="text-gray-900 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-purple" />
            Uploaded Documents
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your submitted documents and their verification status
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 animate-spin mx-auto text-purple" />
              <p className="text-sm text-gray-600 mt-2">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600">No documents uploaded yet</p>
              <p className="text-sm text-gray-400 mt-1">Upload your first document above</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-light-bg border border-gray-200 rounded-xl hover:shadow-md transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple/10 rounded-lg flex items-center justify-center">
                        {doc.documentUrl?.toLowerCase().includes('.pdf') ? (
                          <FileText className="w-5 h-5 text-purple" />
                        ) : (
                          <Upload className="w-5 h-5 text-purple" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.type}</p>
                        <p className="text-xs text-gray-500">
                          ID: {doc.id}
                          {doc.createdAt && (
                            <span> • Uploaded: {new Date(doc.createdAt).toLocaleDateString()}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Status Badge */}
                    <Badge className={getStatusColor(doc.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(doc.status)}
                        {doc.status}
                      </span>
                    </Badge>

                    {/* View Button */}
                    {doc.documentUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewDocument(doc)}
                        className="hover:bg-purple/10"
                        title="View Document"
                      >
                        <Eye className="w-4 h-4 text-purple" />
                      </Button>
                    )}

                    {/* Delete Button */}
                    {doc.status === "Pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(doc)}
                        disabled={uploading}
                        className="hover:bg-red/10"
                      >
                        <Trash2 className="w-4 h-4 text-red" />
                      </Button>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {doc.status === "Rejected" && doc.reason && (
                    <div className="mt-2 p-3 bg-red/5 border border-red/20 rounded-lg text-sm text-red w-full">
                      <strong>Rejection Reason:</strong> {doc.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        description={`Are you sure you want to delete this document? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
        isLoading={uploading}
      />

      {/* Document View Dialog */}
      <Dialog open={!!viewDocument} onOpenChange={() => setViewDocument(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple" />
              {viewDocument?.type}
            </DialogTitle>
            <DialogDescription>
              Document ID: {viewDocument?.id} • Status: {viewDocument?.status}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {viewDocument?.documentUrl && (
              <>
                {/* Check if it's a PDF or image */}
                {viewDocument.documentUrl.toLowerCase().includes('.pdf') ? (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-purple/10 rounded-2xl flex items-center justify-center">
                      <FileText className="w-12 h-12 text-purple" />
                    </div>
                    <p className="text-gray-600">PDF Document</p>
                    <Button
                      onClick={() => window.open(viewDocument.documentUrl, '_blank')}
                      className="bg-gradient-to-r from-purple to-blue hover:from-purple/90 hover:to-blue/90 text-white"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open PDF in New Tab
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <img
                      src={viewDocument.documentUrl}
                      alt={viewDocument.type}
                      className="w-full max-h-[60vh] object-contain rounded-lg border border-gray-200"
                    />
                    <div className="flex justify-center">
                      <Button
                        onClick={() => window.open(viewDocument.documentUrl, '_blank')}
                        variant="outline"
                        className="text-purple border-purple hover:bg-purple/10"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentUploadComponent;
