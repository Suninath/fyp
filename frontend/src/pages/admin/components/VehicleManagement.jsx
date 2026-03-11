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
  Eye,
  X,
  MapPin,
  Gauge,
  Fuel,
  Calendar,
  User,
  Phone,
  Mail,
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
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../ui/ui/dialog";
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
    (state) => state.admin,
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState(ALL);
  const [color, setColor] = useState(ALL);
  const [actionLoading, setActionLoading] = useState(null);
  const [deleteVehicleId, setDeleteVehicleId] = useState(null);
  const [deleteVehicleName, setDeleteVehicleName] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [isVehicleDetailsOpen, setIsVehicleDetailsOpen] = useState(false);

  /* ---------------- FETCH VEHICLES ---------------- */
  useEffect(() => {
    dispatch(
      getAllVehicles({
        page,
        limit: 10,
        search,
        brand: brand === ALL ? undefined : brand,
        color: color === ALL ? undefined : color,
      }),
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

  const handleDeleteClick = (vehicleId, vehicleName) => {
    setDeleteVehicleId(vehicleId);
    setDeleteVehicleName(vehicleName);
  };

  const handleDeleteConfirm = async () => {
    setActionLoading(deleteVehicleId);
    await dispatch(deleteVehicle(deleteVehicleId));
    setActionLoading(null);
    setDeleteVehicleId(null);
    setDeleteVehicleName("");
  };

  const refreshData = () => {
    dispatch(
      getAllVehicles({
        page,
        limit: 10,
        search,
        brand: brand === ALL ? undefined : brand,
        color: color === ALL ? undefined : color,
      }),
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
      vehicles?.map((v) => v.make).filter((v) => v && v.trim() !== "") || [],
    ),
  ];

  const uniqueColors = [
    ...new Set(
      vehicles?.map((v) => v.color).filter((v) => v && v.trim() !== "") || [],
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
              <SelectTrigger className="w-40 bg-white">
                <SelectValue placeholder="Brand" />
              </SelectTrigger>
              <SelectContent className="bg-white">
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
              <SelectTrigger className="w-40 bg-white">
                <SelectValue placeholder="Color" />
              </SelectTrigger>
              <SelectContent className="bg-white">
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
                    <TableCell>Rs. {vehicle.price?.toLocaleString('en-IN')}</TableCell>
                    <TableCell>{vehicle.uploader?.name || "N/A"}</TableCell>
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
                          variant="info"
                          onClick={() => {
                            setSelectedVehicle(vehicle);
                            setIsVehicleDetailsOpen(true);
                          }}
                          className="hover:scale-105 transition-transform"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>

                        <Button
                          size="sm"
                          variant={
                            vehicle.isBlocked ? "success" : "warning"
                          }
                          onClick={() =>
                            handleBlockUnblock(vehicle.id, vehicle.isBlocked)
                          }
                          disabled={actionLoading === vehicle.id}
                          className="hover:scale-105 transition-transform"
                        >
                          {actionLoading === vehicle.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : vehicle.isBlocked ? (
                            <ShieldOff size={14} />
                          ) : (
                            <Shield size={14} />
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteClick(vehicle.id, vehicle.name)}
                          disabled={actionLoading === vehicle.id}
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

          {/* PAGINATION */}
          {vehiclePagination?.totalPages > 0 && (
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

      {/* VEHICLE DETAILS DIALOG */}
      <Dialog open={isVehicleDetailsOpen} onOpenChange={setIsVehicleDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-purple via-blue to-green bg-clip-text text-transparent">
              <Car className="text-purple" size={28} />
              Vehicle Details
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete information about the vehicle
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-6 mt-4">
              {/* Images Section */}
              {selectedVehicle.images && selectedVehicle.images.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg text-purple">Vehicle Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedVehicle.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`${selectedVehicle.name} - ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg border-2 border-purple/20 hover:border-purple/50 transition-colors"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Info Section */}
              <div className="bg-gradient-to-r from-purple/10 to-blue/10 p-6 rounded-lg border border-purple/20">
                <h3 className="font-semibold text-lg mb-4 text-purple">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Name</p>
                    <p className="font-semibold">{selectedVehicle.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Brand</p>
                    <p className="font-semibold">{selectedVehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Model</p>
                    <p className="font-semibold">{selectedVehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="font-semibold">{selectedVehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold text-green text-lg">
                      Rs. {selectedVehicle.price?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge
                      className={
                        selectedVehicle.isBlocked
                          ? "bg-red text-white"
                          : "bg-green text-white"
                      }
                    >
                      {selectedVehicle.isBlocked ? "Blocked" : "Active"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Specifications Section */}
              <div className="bg-gradient-to-r from-blue/10 to-green/10 p-6 rounded-lg border border-blue/20">
                <h3 className="font-semibold text-lg mb-4 text-blue">
                  Specifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Gauge size={14} />
                      Mileage
                    </p>
                    <p className="font-semibold">{selectedVehicle.mileage} km/l</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Fuel size={14} />
                      Fuel Type
                    </p>
                    <p className="font-semibold">{selectedVehicle.fuelType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Transmission</p>
                    <p className="font-semibold">{selectedVehicle.transmission}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Seating Capacity</p>
                    <p className="font-semibold">{selectedVehicle.seatingCapacity} seats</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Calendar size={14} />
                      Year
                    </p>
                    <p className="font-semibold">{selectedVehicle.year}</p>
                  </div>
                </div>
              </div>

              {/* Location Section */}
              <div className="bg-gradient-to-r from-green/10 to-purple/10 p-6 rounded-lg border border-green/20">
                <h3 className="font-semibold text-lg mb-4 text-green flex items-center gap-2">
                  <MapPin size={20} />
                  Location
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-semibold">{selectedVehicle.location?.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">State</p>
                    <p className="font-semibold">{selectedVehicle.location?.state || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {selectedVehicle.description && (
                <div className="bg-gray-50 p-6 rounded-lg border">
                  <h3 className="font-semibold text-lg mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedVehicle.description}
                  </p>
                </div>
              )}

              {/* Uploader Info Section */}
              {selectedVehicle.uploadedBy && (
                <div className="bg-gradient-to-r from-orange/10 to-red/10 p-6 rounded-lg border border-orange/20">
                  <h3 className="font-semibold text-lg mb-4 text-orange flex items-center gap-2">
                    <User size={20} />
                    Uploaded By
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <User size={14} />
                        Name
                      </p>
                      <p className="font-semibold">{selectedVehicle.uploadedBy.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail size={14} />
                        Email
                      </p>
                      <p className="font-semibold">{selectedVehicle.uploadedBy.email}</p>
                    </div>
                    {selectedVehicle.uploadedBy.phoneNumber && (
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone size={14} />
                          Phone
                        </p>
                        <p className="font-semibold">
                          {selectedVehicle.uploadedBy.phoneNumber}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Calendar size={14} />
                        Upload Date
                      </p>
                      <p className="font-semibold">
                        {new Date(selectedVehicle.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsVehicleDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant={selectedVehicle.isBlocked ? "success" : "warning"}
                  onClick={() => {
                    handleBlockUnblock(selectedVehicle.id, selectedVehicle.isBlocked);
                    setIsVehicleDetailsOpen(false);
                  }}
                  className="hover:opacity-90"
                >
                  {selectedVehicle.isBlocked ? (
                    <>
                      <ShieldOff size={16} className="mr-2" />
                      Unblock Vehicle
                    </>
                  ) : (
                    <>
                      <Shield size={16} className="mr-2" />
                      Block Vehicle
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={!!deleteVehicleId}
        onOpenChange={() => {
          setDeleteVehicleId(null);
          setDeleteVehicleName("");
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        description={
          <>
            Are you sure you want to delete <strong>{deleteVehicleName}</strong>?
            <br />
            <span className="text-red-600 font-semibold mt-2 block">
              This action cannot be undone and will permanently remove this vehicle.
            </span>
          </>
        }
        confirmText="Delete Vehicle"
        isLoading={actionLoading === deleteVehicleId}
        type="danger"
      />
    </AdminLayout>
  );
};

export default VehicleManagement;
