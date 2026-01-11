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
} from "../../../ui/ui/dialog";

import AdminLayout from "./AdminLayout";
import DebouncedInput from "../../../components/common/DebouncedInput";

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
  const [actionLoading, setActionLoading] = useState(null);

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
                    <TableCell>{user.phoneNumber || "N/A"}</TableCell>

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
                          variant="outline"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant={user.isBlocked ? "default" : "destructive"}
                          onClick={() =>
                            handleBlockUnblock(user.id, user.isBlocked)
                          }
                          disabled={actionLoading === user.id}
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
                          onClick={() => setDeleteUserId(user.id)}
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
          {userPagination?.totalPages > 1 && (
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
            <Input
              placeholder="Phone Number"
              value={editForm.phoneNumber}
              onChange={(e) =>
                setEditForm({ ...editForm, phoneNumber: e.target.value })
              }
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                <X size={16} className="mr-1" /> Cancel
              </Button>

              <Button
                className="bg-purple text-white"
                onClick={handleUpdateUser}
                disabled={actionLoading === editingUser}
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

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <DialogContent className="bg-white rounded-xl shadow-xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Delete User
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600">
            Are you sure you want to delete this user?
            <span className="text-red font-semibold">
              {" "}
              This action cannot be undone.
            </span>
          </p>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteUserId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                setActionLoading(deleteUserId);
                await dispatch(deleteUser(deleteUserId));
                setDeleteUserId(null);
                setActionLoading(null);
              }}
              disabled={actionLoading === deleteUserId}
            >
              <Trash2 size={16} className="mr-1" />
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagement;
