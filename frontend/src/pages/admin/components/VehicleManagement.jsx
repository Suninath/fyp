import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Car,
  Trash2,
  Shield,
  ShieldOff,
  Filter,
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

import AdminLayout from "./AdminLayout";
import DebouncedInput from "../../../components/common/DebouncedInput";
import {
  getAllVehicles,
  blockVehicle,
  unblockVehicle,
  deleteVehicle,
} from "../../../rtk/thunk/adminThunk";

const ALL = "all";

const VehicleManagement = () => {
  const dispatch = useDispatch();
  const { vehicles, vehiclePagination, loading } = useSelector(
    (state) => state.admin
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState(ALL);
  const [color, setColor] = useState(ALL);
  const [actionLoading, setActionLoading] = useState(null);

  /* ---------------- FETCH VEHICLES ---------------- */
  useEffect(() => {
    dispatch(
      getAllVehicles({
        page,
        limit: 10,
        search,
        brand: brand === ALL ? undefined : brand,
        color: color === ALL ? undefined : color,
      })
    );
  }, [page, search, brand, color, dispatch]);

  /* ---------------- HANDLERS ---------------- */
  const handleSearch = (value) => {
    setSearch(value);
    setPage(1);
  };

  const handleBlockUnblock = async (vehicleId, isBlocked) => {
    setActionLoading(vehicleId);
    if (isBlocked) {
      await dispatch(unblockVehicle(vehicleId));
    } else {
      await dispatch(blockVehicle(vehicleId));
    }
    setActionLoading(null);
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;
    setActionLoading(vehicleId);
    await dispatch(deleteVehicle(vehicleId));
    setActionLoading(null);
  };

  const refreshData = () => {
    dispatch(
      getAllVehicles({
        page,
        limit: 10,
        search,
        brand: brand === ALL ? undefined : brand,
        color: color === ALL ? undefined : color,
      })
    );
  };

  const clearFilters = () => {
    setSearch("");
    setBrand(ALL);
    setColor(ALL);
    setPage(1);
  };

  /* ---------------- FILTER OPTIONS ---------------- */
  const uniqueBrands = [
    ...new Set(
      vehicles?.map((v) => v.make).filter((v) => v && v.trim() !== "") || []
    ),
  ];

  const uniqueColors = [
    ...new Set(
      vehicles?.map((v) => v.color).filter((v) => v && v.trim() !== "") || []
    ),
  ];

  return (
    <AdminLayout activeTab="vehicles">
      <Card className="bg-white border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car size={20} className="text-purple" />
            Vehicle Management
          </CardTitle>

          <div className="flex flex-wrap gap-4 mt-4">
            {/* SEARCH */}
            <div className="relative flex-1 min-w-64">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <DebouncedInput
                className="pl-10"
                placeholder="Search vehicles by model, brand, or owner..."
                value={search}
                onChange={handleSearch}
                debounceMs={300}
              />
            </div>

            {/* BRAND FILTER */}
            <Select value={brand} onValueChange={setBrand}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Brands</SelectItem>
                {uniqueBrands.map((b) => (
                  <SelectItem key={b} value={b}>
                    {b}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* COLOR FILTER */}
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All Colors</SelectItem>
                {uniqueColors.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={clearFilters}>
              <Filter size={16} className="mr-1" />
              Clear
            </Button>

            <Button variant="outline" onClick={refreshData}>
              <RefreshCw size={16} />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 text-sm text-gray-600">
            Showing {vehicles?.length || 0} of{" "}
            {vehiclePagination?.totalItems || 0} vehicles
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Model</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {vehicles?.map((vehicle) => (
                  <TableRow key={vehicle.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">
                      {vehicle.model}
                    </TableCell>
                    <TableCell>{vehicle.make}</TableCell>
                    <TableCell>{vehicle.year}</TableCell>
                    <TableCell className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor: vehicle.color?.toLowerCase(),
                        }}
                      />
                      {vehicle.color}
                    </TableCell>
                    <TableCell>
                      ${vehicle.price?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {vehicle.uploader?.name || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          vehicle.isBlocked
                            ? "bg-red text-white"
                            : "bg-green text-white"
                        }
                      >
                        {vehicle.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(vehicle.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={
                            vehicle.isBlocked ? "default" : "destructive"
                          }
                          onClick={() =>
                            handleBlockUnblock(
                              vehicle.id,
                              vehicle.isBlocked
                            )
                          }
                          disabled={actionLoading === vehicle.id}
                        >
                          {actionLoading === vehicle.id ? (
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                          ) : vehicle.isBlocked ? (
                            <ShieldOff size={14} />
                          ) : (
                            <Shield size={14} />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(vehicle.id)}
                          disabled={actionLoading === vehicle.id}
                        >
                          {actionLoading === vehicle.id ? (
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* PAGINATION */}
          {vehiclePagination?.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-600">
                Page {page} of {vehiclePagination.totalPages}
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
                  disabled={page === vehiclePagination.totalPages}
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

export default VehicleManagement;
