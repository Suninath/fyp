import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  UserX,
  FileText,
  ChevronLeft,
  ChevronRight,
  Filter,
  X
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../ui/ui/card";
import { Button } from "../../../ui/ui/button";
import { Badge } from "../../../ui/ui/badge";
import { Input } from "../../../ui/ui/input";
import { Label } from "../../../ui/ui/label";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../ui/ui/tabs";
import AdminLayout from "./AdminLayout";
import Loading from "../../../components/common/loading";
import { 
  getUsersByVerificationStatus, 
  verifyUserAccount,
  getDashboardStats 
} from "../../../rtk/thunk/adminThunk";

const UserVerification = () => {
  const dispatch = useDispatch();
  const { 
    verificationUsers, 
    verificationUsersPagination, 
    dashboardStats,
    loading 
  } = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState("pending");
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  // Dialog states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to first page on search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users when tab, page, or search changes
  const fetchUsers = useCallback(() => {
    dispatch(getUsersByVerificationStatus({ 
      status: activeTab, 
      page, 
      limit: 10,
      search: debouncedSearch 
    }));
  }, [dispatch, activeTab, page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
    dispatch(getDashboardStats());
  }, [fetchUsers, dispatch]);

  // Reset page when changing tabs
  const handleTabChange = (value) => {
    setActiveTab(value);
    setPage(1);
    setSearchTerm("");
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleApproveClick = (user) => {
    setSelectedUser(user);
    setShowApproveDialog(true);
  };

  const handleRejectClick = (user) => {
    setSelectedUser(user);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedUser) return;
    setVerifying(true);
    try {
      await dispatch(verifyUserAccount({ 
        userId: selectedUser.id, 
        approved: true 
      })).unwrap();
      setShowApproveDialog(false);
      setSelectedUser(null);
      fetchUsers();
      dispatch(getDashboardStats());
    } catch (error) {
      console.error("Error approving user:", error);
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!selectedUser || !rejectionReason.trim()) return;
    setVerifying(true);
    try {
      await dispatch(verifyUserAccount({ 
        userId: selectedUser.id, 
        approved: false, 
        rejectionReason: rejectionReason.trim() 
      })).unwrap();
      setShowRejectDialog(false);
      setSelectedUser(null);
      setRejectionReason("");
      fetchUsers();
      dispatch(getDashboardStats());
    } catch (error) {
      console.error("Error rejecting user:", error);
    } finally {
      setVerifying(false);
    }
  };

  const getStatusBadge = (user) => {
    if (user.accountVerified) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">Verified</Badge>;
    }
    if (user.verificationRejected) {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
  };

  const getDocumentStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const totalPages = verificationUsersPagination?.totalPages || 1;

  const tabConfig = [
    { 
      value: "pending", 
      label: "Pending", 
      icon: Clock, 
      color: "text-yellow-600",
      count: dashboardStats?.pendingVerificationUsers || 0 
    },
    { 
      value: "verified", 
      label: "Verified", 
      icon: CheckCircle, 
      color: "text-green-600",
      count: dashboardStats?.verifiedUsers || 0 
    },
    { 
      value: "rejected", 
      label: "Rejected", 
      icon: XCircle, 
      color: "text-red-600",
      count: dashboardStats?.rejectedVerificationUsers || 0 
    }
  ];

  return (
    <AdminLayout activeTab="verification">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple flex items-center justify-center">
                <UserCheck size={22} className="text-white" />
              </div>
              User Verification
            </h2>
            <p className="text-gray-500 mt-2 ml-[52px]">
              Manage user account verification requests
            </p>
          </div>
          <Button 
            onClick={fetchUsers} 
            className="flex items-center gap-2 bg-purple hover:bg-purple/90 text-white"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabConfig.map(({ value, label, icon: Icon, color, count }) => (
            <Card 
              key={value}
              className={`bg-white cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                activeTab === value 
                  ? value === 'pending' ? 'border-blue' 
                    : value === 'verified' ? 'border-green' 
                    : 'border-red'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTabChange(value)}
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${
                  value === 'pending' ? 'bg-blue/10' :
                  value === 'verified' ? 'bg-green/10' : 'bg-red/10'
                }`}>
                  <Icon size={24} className={`${
                    value === 'pending' ? 'text-blue' :
                    value === 'verified' ? 'text-green' : 'text-red'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label} Users</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                {activeTab === value && (
                  <div className={`ml-auto w-2 h-8 rounded-full ${
                    value === 'pending' ? 'bg-blue' :
                    value === 'verified' ? 'bg-green' : 'bg-red'
                  }`} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Card className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Users size={20} className="text-purple" />
                  {activeTab === 'pending' && 'Pending Verification'}
                  {activeTab === 'verified' && 'Verified Users'}
                  {activeTab === 'rejected' && 'Rejected Users'}
                </CardTitle>
                <CardDescription className="mt-1">
                  {verificationUsersPagination?.count || 0} users found
                </CardDescription>
              </div>
              
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Search by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-8"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                {tabConfig.map(({ value, label, icon: Icon, count }) => (
                  <TabsTrigger 
                    key={value} 
                    value={value}
                    className="flex items-center gap-2"
                  >
                    <Icon size={16} />
                    {label}
                    <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${
                      activeTab === value 
                        ? 'bg-white/30 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {count}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loading />
              </div>
            ) : verificationUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No {activeTab} users found</p>
                <p className="text-sm">
                  {searchTerm 
                    ? "Try adjusting your search terms" 
                    : `There are no users with ${activeTab} verification status`}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead>Status</TableHead>
                        {activeTab === 'rejected' && <TableHead>Reason</TableHead>}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell className="text-gray-600">{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                              {user.documents?.length || 0} documents
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(user)}</TableCell>
                          {activeTab === 'rejected' && (
                            <TableCell className="max-w-[200px] truncate text-sm text-red-600">
                              {user.rejectionReason || "No reason provided"}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewUser(user)}
                                className="flex items-center gap-1 border-purple text-purple hover:bg-purple hover:text-white"
                              >
                                <Eye size={14} />
                                Review
                              </Button>
                              {activeTab !== 'verified' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveClick(user)}
                                  className="flex items-center gap-1 bg-green hover:bg-green/90 text-white"
                                >
                                  <CheckCircle size={14} />
                                  Approve
                                </Button>
                              )}
                              {activeTab !== 'rejected' && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRejectClick(user)}
                                  className="flex items-center gap-1 bg-red hover:bg-red/90 text-white"
                                >
                                  <XCircle size={14} />
                                  Reject
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t">
                    <p className="text-sm text-gray-500">
                      Page {page} of {totalPages} ({verificationUsersPagination?.count} total)
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        <ChevronLeft size={16} />
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Next
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* User Details Dialog */}
        <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader className="bg-gradient-to-r from-purple to-blue text-white rounded-t-2xl -m-0 p-6">
              <DialogTitle className="flex items-center gap-3 text-white">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Users size={22} />
                </div>
                User Details
              </DialogTitle>
              <DialogDescription className="text-white/80">
                Review user information and documents
              </DialogDescription>
            </DialogHeader>
            
            {selectedUser && (
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4 p-5 bg-light-bg rounded-xl border border-gray-200">
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Name</Label>
                    <p className="font-semibold text-gray-900 mt-1">{selectedUser.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Email</Label>
                    <p className="font-semibold text-gray-900 mt-1">{selectedUser.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Phone</Label>
                    <p className="font-semibold text-gray-900 mt-1">{selectedUser.phoneNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 uppercase tracking-wide">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedUser)}</div>
                  </div>
                  {selectedUser.rejectionReason && (
                    <div className="col-span-2 p-3 bg-red/5 border border-red/20 rounded-lg">
                      <Label className="text-xs text-red uppercase tracking-wide">Rejection Reason</Label>
                      <p className="font-medium text-red mt-1">{selectedUser.rejectionReason}</p>
                    </div>
                  )}
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-gray-900">
                    <FileText size={18} className="text-purple" />
                    Documents ({selectedUser.documents?.length || 0})
                  </h4>
                  {selectedUser.documents?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedUser.documents.map((doc) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-blue/10 rounded-lg">
                              <FileText size={20} className="text-blue" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{doc.documentType}</p>
                              <div className="mt-1">{getDocumentStatusBadge(doc.verificationStatus)}</div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(doc.documentUrl, '_blank')}
                            className="border-purple text-purple hover:bg-purple hover:text-white transition-colors"
                          >
                            <Eye size={14} className="mr-1.5" />
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-light-bg rounded-xl border border-gray-200">
                      <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                      <p className="text-gray-500">No documents uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <DialogFooter className="border-t border-gray-200 bg-gray-50 p-4 -mx-0 -mb-0 rounded-b-2xl">
              <Button variant="outline" onClick={() => setShowUserDialog(false)} className="px-6">
                Close
              </Button>
              {selectedUser && !selectedUser.accountVerified && (
                <Button
                  className="bg-green hover:bg-green/90 text-white px-6 shadow-lg"
                  onClick={() => {
                    setShowUserDialog(false);
                    handleApproveClick(selectedUser);
                  }}
                >
                  <CheckCircle size={16} className="mr-2" />
                  Approve
                </Button>
              )}
              {selectedUser && !selectedUser.verificationRejected && (
                <Button
                  className="bg-red hover:bg-red/90 text-white px-6 shadow-lg"
                  onClick={() => {
                    setShowUserDialog(false);
                    handleRejectClick(selectedUser);
                  }}
                >
                  <XCircle size={16} className="mr-2" />
                  Reject
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approve Confirmation Dialog */}
        <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader className="bg-green/10 border-b border-green/20 -m-0 p-6 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green/20 rounded-full">
                  <CheckCircle size={24} className="text-green" />
                </div>
                <div>
                  <DialogTitle className="text-green">
                    Approve User Verification
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    Are you sure you want to verify this user's account?
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            {selectedUser && (
              <div className="p-6">
                <div className="p-4 bg-light-bg rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple/10 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-purple" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowApproveDialog(false)}
                disabled={verifying}
                className="px-5"
              >
                Cancel
              </Button>
              <Button
                className="bg-green hover:bg-green/90 text-white px-5 shadow-lg"
                onClick={handleApprove}
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} className="mr-2" />
                    Confirm Approval
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader className="bg-red/10 border-b border-red/20 -m-0 p-6 rounded-t-2xl">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red/20 rounded-full">
                  <XCircle size={24} className="text-red" />
                </div>
                <div>
                  <DialogTitle className="text-red">
                    Reject User Verification
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    Please provide a reason for rejecting this verification request.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            {selectedUser && (
              <div className="p-6 space-y-4">
                <div className="p-4 bg-light-bg rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple/10 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-purple" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                      <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="rejection-reason" className="text-gray-700 font-medium">Rejection Reason *</Label>
                  <textarea
                    id="rejection-reason"
                    className="w-full mt-2 p-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-red/20 focus:border-red transition-all bg-white"
                    rows={3}
                    placeholder="Enter the reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowRejectDialog(false)}
                disabled={verifying}
                className="px-5"
              >
                Cancel
              </Button>
              <Button
                className="bg-red hover:bg-red/90 text-white px-5 shadow-lg"
                onClick={handleReject}
                disabled={verifying || !rejectionReason.trim()}
              >
                {verifying ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle size={16} className="mr-2" />
                    Confirm Rejection
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default UserVerification;
