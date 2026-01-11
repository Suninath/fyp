import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Store as StoreIcon,
  CheckCircle,
  XCircle,
  Shield,
  ShieldOff
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
  TableRow
} from "../../../ui/ui/table";
import AdminLayout from "./AdminLayout";
import DebouncedInput from "../../../components/common/DebouncedInput";
import {
  getAllStores,
  verifyStore,
  blockStore,
  unblockStore
} from "../../../rtk/thunk/adminThunk";

const StoreManagement = () => {
  const dispatch = useDispatch();
  const { stores, storePagination, loading } = useSelector((state) => state.admin);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    dispatch(getAllStores({ page, limit: 10, search }));
  }, [page, search, dispatch]);

  const handleSearch = (value) => {
    setSearch(value);
    setPage(1); // Reset to first page when searching
  };

  const handleVerify = async (storeId) => {
    setActionLoading(storeId);
    await dispatch(verifyStore(storeId));
    setActionLoading(null);
  };

  const handleBlockUnblock = async (storeId, isBlocked) => {
    setActionLoading(storeId);
    if (isBlocked) {
      await dispatch(unblockStore(storeId));
    } else {
      await dispatch(blockStore(storeId));
    }
    setActionLoading(null);
  };

  const refreshData = () => {
    dispatch(getAllStores({ page, limit: 10, search }));
  };

  return (
    <AdminLayout activeTab="stores">
      <Card className="bg-white border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StoreIcon size={20} className="text-purple" />
            Store Management
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <DebouncedInput
                className="pl-10"
                placeholder="Search stores by name or owner..."
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
            Showing {stores?.length || 0} of {storePagination?.totalItems || 0} stores
            {search && ` for "${search}"`}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Store Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stores?.map((store) => (
                  <TableRow key={store.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{store.storeName}</TableCell>
                    <TableCell>{store.ownerName}</TableCell>
                    <TableCell>{store.email}</TableCell>
                    <TableCell>{store.phoneNumber || "N/A"}</TableCell>
                    <TableCell>
                      <Badge className={store.isVerified ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}>
                        {store.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={store.isBlocked ? "bg-red-500 text-white" : "bg-green-500 text-white"}>
                        {store.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(store.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!store.isVerified && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleVerify(store.id)}
                            disabled={actionLoading === store.id}
                          >
                            {actionLoading === store.id ? (
                              <RefreshCw size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={store.isBlocked ? "default" : "destructive"}
                          onClick={() => handleBlockUnblock(store.id, store.isBlocked)}
                          disabled={actionLoading === store.id}
                        >
                          {actionLoading === store.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : store.isBlocked ? (
                            <ShieldOff size={14} />
                          ) : (
                            <Shield size={14} />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {storePagination && storePagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                Page {page} of {storePagination.totalPages}
              </div>
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
                  disabled={page === storePagination.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default StoreManagement;