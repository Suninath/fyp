import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  Edit,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Save,
  X,
  Eye,
  Calendar,
  Users,
} from "lucide-react";

import { Button } from "../../../ui/ui/button";
import { Input } from "../../../ui/ui/input";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/ui/dialog";

import AdminLayout from "./AdminLayout";
import DebouncedInput from "../../../components/common/DebouncedInput";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PhoneInput from "../../../components/common/PhoneInput";
import { ErrorToast } from "../../../components/common/toast";
import { formatPhoneNumber, getPhoneValidationState } from "../../../lib/phone";

import {
  getAllUsers,
  blockUser,
  unblockUser,
  updateUser,
  deleteUser,
} from "../../../rtk/thunk/adminThunk";

const UserManagement = () => {
  const dispatch = useDispatch();
  const { users, userPagination, loading } = useSelector(
    (state) => state.admin
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [deleteUserId, setDeleteUserId] = useState(null);
  const [deleteUserName, setDeleteUserName] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserDetailsOpen, setIsUserDetailsOpen] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers({ page, limit: 10, search }));
  }, [page, search, dispatch]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleBlockUnblock = async (userId, isBlocked) => {
    setActionLoading(userId);
    if (isBlocked) {
      await dispatch(unblockUser(userId));
    } else {
      await dispatch(blockUser(userId));
    }
    setActionLoading(null);
  };

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    const phoneValidation = getPhoneValidationState(editForm.phoneNumber);
    if (!phoneValidation.isValid) {
      ErrorToast({ message: "Please enter a valid 10-digit Nepali mobile number" });
      return;
    }

    setActionLoading(editingUser);
    await dispatch(updateUser({ userId: editingUser, data: editForm }));
    setActionLoading(null);
    setIsEditDialogOpen(false);
    setEditingUser(null);
  };

  const refreshData = () => {
    dispatch(getAllUsers({ page, limit: 10, search }));
  };

  return (
    <AdminLayout activeTab="users">
      <Card className="bg-white border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck size={20} className="text-purple" />
            User Management
          </CardTitle>

          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <DebouncedInput
                className="pl-10"
                placeholder="Search users by name or email..."
                value={search}
                onChange={handleSearch}
                debounceMs={300}
              />
            </div>

            <Button onClick={refreshData} variant="outline">
              <RefreshCw size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 text-sm text-gray-600">
            Showing {users?.length || 0} of {userPagination?.total || 0} users
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatPhoneNumber(user.phoneNumber) || "N/A"}</TableCell>

                    {/* STATUS BADGE */}
                    <TableCell>
                      <Badge
                        className={`px-3 py-1 rounded-full text-xs font-semibold
                          ${
                            user.isBlocked
                              ? "bg-red text-white"
                              : "bg-green text-white"
                          }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="info"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsUserDetailsOpen(true);
                          }}
                          className="hover:scale-105 transition-transform"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(user)}
                          className="hover:scale-105 transition-transform hover:border-purple-500"
                        >
                          <Edit size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant={user.isBlocked ? "success" : "warning"}
                          onClick={() =>
                            handleBlockUnblock(user.id, user.isBlocked)
                          }
                          disabled={actionLoading === user.id}
                          className="hover:scale-105 transition-transform"
                        >
                          {actionLoading === user.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : user.isBlocked ? (
                            <UserCheck size={14} />
                          ) : (
                            <UserX size={14} />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeleteUserId(user.id);
                            setDeleteUserName(user.name);
                          }}
                          className="hover:scale-105 transition-transform"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {userPagination?.totalPages >0 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-600">
                Page {page} of {userPagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={16} /> Prev
                </Button>
                <Button
                  variant="outline"
                  disabled={page === userPagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDIT USER DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white rounded-xl shadow-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Edit User
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={editForm.email}
              onChange={(e) =>
                setEditForm({ ...editForm, email: e.target.value })
              }
            />
            <PhoneInput
              id="admin-user-phone"
              label="Phone Number"
              value={editForm.phoneNumber}
              onChange={(value) =>
                setEditForm({ ...editForm, phoneNumber: value })
              }
              placeholder="e.g., 9841234567"
              required
              showCountryCode
              className="space-y-1"
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X size={16} className="mr-1" /> Cancel
              </Button>

              <Button
                onClick={handleUpdateUser}
                disabled={actionLoading === editingUser || !getPhoneValidationState(editForm.phoneNumber).isValid}
                className="bg-purple text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading === editingUser ? (
                  <RefreshCw size={16} className="mr-1 animate-spin" />
                ) : (
                  <Save size={16} className="mr-1" />
                )}
                Update
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* USER DETAILS DIALOG */}
      <Dialog open={isUserDetailsOpen} onOpenChange={setIsUserDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple via-blue to-green bg-clip-text text-transparent">
              <Users className="text-purple" size={28} />
              User Details
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete information about the user
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 mt-4">
              {/* Profile Section */}
              <div className="bg-gradient-to-r from-purple/10 to-blue/10 p-6 rounded-lg border border-purple/20">
                <h3 className="font-semibold text-lg mb-4 text-purple">
                  Profile Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-semibold">{selectedUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{selectedUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-semibold">
                      {formatPhoneNumber(selectedUser.phoneNumber) || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="font-mono text-sm">{selectedUser.id}</p>
                  </div>
                </div>
              </div>

              {/* Account Status Section */}
              <div className="bg-gradient-to-r from-green/10 to-blue/10 p-6 rounded-lg border border-green/20">
                <h3 className="font-semibold text-lg mb-4 text-green">
                  Account Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedUser.isBlocked
                          ? "bg-red text-white"
                          : "bg-green text-white"
                      }`}
                    >
                      {selectedUser.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Verified</p>
                    <Badge
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        selectedUser.isVerified
                          ? "bg-green text-white"
                          : "bg-orange-200 text-orange-800"
                      }`}
                    >
                      {selectedUser.isVerified ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar size={14} />
                      Joined Date
                    </p>
                    <p className="font-semibold">
                      {new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar size={14} />
                      Last Updated
                    </p>
                    <p className="font-semibold">
                      {new Date(selectedUser.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsUserDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    handleEdit(selectedUser);
                    setIsUserDetailsOpen(false);
                  }}
                  className="bg-purple text-white hover:bg-purple-600"
                >
                  <Edit size={16} className="mr-2" />
                  Edit User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={!!deleteUserId}
        onOpenChange={() => {
          setDeleteUserId(null);
          setDeleteUserName("");
        }}
        onConfirm={async () => {
          setActionLoading(deleteUserId);
          await dispatch(deleteUser(deleteUserId));
          setDeleteUserId(null);
          setDeleteUserName("");
          setActionLoading(null);
        }}
        title="Delete User"
        description={
          <>
            Are you sure you want to delete user <strong>{deleteUserName}</strong>?
            <br />
            <span className="text-red-600 font-semibold mt-2 block">
              This action cannot be undone and will permanently remove this user and all associated data.
            </span>
          </>
        }
        confirmText="Delete User"
        isLoading={actionLoading === deleteUserId}
        type="danger"
      />
    </AdminLayout>
  );
};

export default UserManagement;
