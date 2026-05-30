import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
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
import { Input } from "../../../ui/ui/input";
import { Label } from "../../../ui/ui/label";
import { Textarea } from "../../../ui/ui/textarea";
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
import { createVehicle } from "../../../rtk/thunk/vehicleThunk";
import { formatPhoneNumber } from "../../../lib/phone";

const ALL = "all";
const TAB_ALL = "all";
const TAB_SALE = "sale";
const TAB_RENT = "rent";
const PAGE_SIZE = 10;

const getVehicleListingType = (vehicle) => {
  const listingCategory = `${
    vehicle?.category || vehicle?.listingType || vehicle?.type || ""
  }`.toLowerCase();
  return listingCategory.includes("rent") ? TAB_RENT : TAB_SALE;
};

const getRentalBookingCount = (vehicle) => {
  if (Array.isArray(vehicle?.bookings)) {
    return vehicle.bookings.length;
  }

  return Number(
    vehicle?.activeBookings ??
      vehicle?.totalBookings ??
      vehicle?.bookingCount ??
      0,
  );
};

const VehicleManagement = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { vehicles, loading } = useSelector(
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
  const [isCreateVehicleOpen, setIsCreateVehicleOpen] = useState(false);
  const [isUploadTypeMenuOpen, setIsUploadTypeMenuOpen] = useState(false);
  const [createPresetType, setCreatePresetType] = useState(null);
  const [isTabFading, setIsTabFading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    make: "",
    model: "",
    year: "",
    price: "",
    category: "Buy/Sell",
    mileage: "",
    fuelType: "",
    transmission: "",
    color: "",
    location: "",
    condition: "",
    description: "",
    images: [],
  });

  const tabParam = searchParams.get("tab");
  const activeTab =
    tabParam === TAB_SALE || tabParam === TAB_RENT ? tabParam : TAB_ALL;

  /* ---------------- FETCH VEHICLES ---------------- */
  useEffect(() => {
    dispatch(getAllVehicles({ page: 1, limit: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    setPage(1);
  }, [search, brand, color, activeTab]);

  useEffect(() => {
    setIsTabFading(true);
    const timeoutId = setTimeout(() => setIsTabFading(false), 200);
    return () => clearTimeout(timeoutId);
  }, [activeTab]);

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
    dispatch(getAllVehicles({ page: 1, limit: 1000 }));
  };

  const handleTabChange = (tab) => {
    const nextParams = new URLSearchParams(searchParams);
    if (tab === TAB_ALL) {
      nextParams.delete("tab");
    } else {
      nextParams.set("tab", tab);
    }
    setSearchParams(nextParams);
    setIsUploadTypeMenuOpen(false);
  };

  const openCreateDialog = (type = null) => {
    const category = type === TAB_RENT ? "Renting" : "Buy/Sell";
    setCreatePresetType(type);
    setCreateForm((prev) => ({ ...prev, category }));
    setIsUploadTypeMenuOpen(false);
    setIsCreateVehicleOpen(true);
  };

  const resetCreateForm = () => {
    setCreateForm({
      name: "",
      make: "",
      model: "",
      year: "",
      price: "",
      category: "Buy/Sell",
      mileage: "",
      fuelType: "",
      transmission: "",
      color: "",
      location: "",
      condition: "",
      description: "",
      images: [],
    });
  };

  const handleCreateInputChange = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setCreateForm((prev) => ({
      ...prev,
      images: files,
    }));
  };

  const handleAdminVehicleCreate = async (e) => {
    e.preventDefault();

    if (createLoading) {
      return;
    }

    setCreateLoading(true);
    try {
      const formData = new FormData();
      Object.keys(createForm).forEach((key) => {
        if (key === "images") {
          createForm.images.forEach((imageFile) => {
            formData.append("images", imageFile);
          });
        } else if (createForm[key]) {
          formData.append(key, createForm[key]);
        }
      });

      await dispatch(createVehicle(formData)).unwrap();
      setIsCreateVehicleOpen(false);
      resetCreateForm();
      setPage(1);
      refreshData();
    } catch (error) {
      console.error("Failed to create vehicle from admin panel:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setBrand(ALL);
    setColor(ALL);
    setPage(1);
  };

  const tabScopedVehicles = useMemo(() => {
    if (!Array.isArray(vehicles)) return [];
    if (activeTab === TAB_ALL) return vehicles;
    return vehicles.filter((vehicle) => getVehicleListingType(vehicle) === activeTab);
  }, [vehicles, activeTab]);

  const tabCounts = useMemo(() => {
    const saleCount = (vehicles || []).filter(
      (vehicle) => getVehicleListingType(vehicle) === TAB_SALE,
    ).length;
    const rentCount = (vehicles || []).filter(
      (vehicle) => getVehicleListingType(vehicle) === TAB_RENT,
    ).length;

    return {
      [TAB_ALL]: (vehicles || []).length,
      [TAB_SALE]: saleCount,
      [TAB_RENT]: rentCount,
    };
  }, [vehicles]);

  /* ---------------- FILTER OPTIONS ---------------- */
  const uniqueBrands = useMemo(
    () => [
      ...new Set(
        tabScopedVehicles
          ?.map((v) => v.make)
          .filter((v) => v && v.trim() !== "") || [],
      ),
    ],
    [tabScopedVehicles],
  );

  const uniqueColors = useMemo(
    () => [
      ...new Set(
        tabScopedVehicles
          ?.map((v) => v.color)
          .filter((v) => v && v.trim() !== "") || [],
      ),
    ],
    [tabScopedVehicles],
  );

  const filteredVehicles = useMemo(() => {
    const term = search.trim().toLowerCase();

    return tabScopedVehicles.filter((vehicle) => {
      const matchesSearch =
        !term ||
        [
          vehicle?.name,
          vehicle?.model,
          vehicle?.make,
          vehicle?.uploader?.name,
          vehicle?.uploadedBy?.name,
        ]
          .filter(Boolean)
          .some((value) => `${value}`.toLowerCase().includes(term));

      const matchesBrand =
        brand === ALL ||
        `${vehicle?.make || ""}`.toLowerCase() === brand.toLowerCase();

      const matchesColor =
        color === ALL ||
        `${vehicle?.color || ""}`.toLowerCase() === color.toLowerCase();

      return matchesSearch && matchesBrand && matchesColor;
    });
  }, [tabScopedVehicles, search, brand, color]);

  const totalFiltered = filteredVehicles.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE));
  const pageStart = (page - 1) * PAGE_SIZE;
  const paginatedVehicles = filteredVehicles.slice(pageStart, pageStart + PAGE_SIZE);

  const createDialogTitle =
    createForm.category === "Renting"
      ? "Upload Rental Vehicle (Admin)"
      : "Upload Sale Vehicle (Admin)";

  const createDialogDescription =
    createForm.category === "Renting"
      ? "Fill rental details. Price will be used as daily rate (Rs./day)."
      : "Fill sale listing details for a Buy/Sell vehicle.";

  const uploadButtonLabel =
    activeTab === TAB_SALE
      ? "Upload Sale Vehicle"
      : activeTab === TAB_RENT
        ? "Upload Rental Vehicle"
        : "Upload Vehicle";

  return (
    <AdminLayout activeTab="vehicles">
      <Card className="bg-white border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car size={20} className="text-purple" />
            Vehicle Management
          </CardTitle>

          <div className="flex gap-2 border-b border-slate-200 mb-6 mt-4">
            <button
              type="button"
              onClick={() => handleTabChange(TAB_ALL)}
              className={`px-5 py-2.5 border-b-2 transition-colors ${
                activeTab === TAB_ALL
                  ? "text-emerald-700 font-semibold border-emerald-600"
                  : "text-slate-600 font-medium border-transparent hover:text-emerald-700 hover:border-emerald-300"
              }`}
            >
              All Vehicles ({tabCounts[TAB_ALL] || 0})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange(TAB_SALE)}
              className={`px-5 py-2.5 border-b-2 transition-colors ${
                activeTab === TAB_SALE
                  ? "text-emerald-700 font-semibold border-emerald-600"
                  : "text-slate-600 font-medium border-transparent hover:text-emerald-700 hover:border-emerald-300"
              }`}
            >
              For Sale ({tabCounts[TAB_SALE] || 0})
            </button>
            <button
              type="button"
              onClick={() => handleTabChange(TAB_RENT)}
              className={`px-5 py-2.5 border-b-2 transition-colors ${
                activeTab === TAB_RENT
                  ? "text-emerald-700 font-semibold border-emerald-600"
                  : "text-slate-600 font-medium border-transparent hover:text-emerald-700 hover:border-emerald-300"
              }`}
            >
              For Rent ({tabCounts[TAB_RENT] || 0})
            </button>
          </div>

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

            {activeTab === TAB_ALL ? (
              <div className="relative">
                <Button onClick={() => setIsUploadTypeMenuOpen((prev) => !prev)}>
                  <Plus size={16} className="mr-1" />
                  {uploadButtonLabel}
                  <ChevronDown size={16} className="ml-2" />
                </Button>

                {isUploadTypeMenuOpen && (
                  <div className="absolute right-0 top-full z-20 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                    <button
                      type="button"
                      onClick={() => openCreateDialog(TAB_SALE)}
                      className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      + Upload Sale Vehicle
                    </button>
                    <button
                      type="button"
                      onClick={() => openCreateDialog(TAB_RENT)}
                      className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                    >
                      + Upload Rental Vehicle
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Button onClick={() => openCreateDialog(activeTab)}>
                <Plus size={16} className="mr-1" />
                + {activeTab === TAB_RENT ? "Upload Rental Vehicle" : "Upload Sale Vehicle"}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="mb-4 text-sm text-gray-600">
            Showing {paginatedVehicles.length || 0} of {totalFiltered} vehicles
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
            <div className={`transition-opacity duration-200 ${isTabFading ? "opacity-0" : "opacity-100"}`}>
              <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead>Model</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>{activeTab === TAB_RENT ? "Price/Day" : "Price"}</TableHead>
                  {activeTab === TAB_ALL && <TableHead>Type</TableHead>}
                  <TableHead>Owner</TableHead>
                  {activeTab === TAB_RENT && <TableHead>Bookings</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedVehicles?.map((vehicle) => (
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
                      Rs. {vehicle.price?.toLocaleString("en-IN")}
                      {activeTab === TAB_RENT ? " / day" : ""}
                    </TableCell>
                    {activeTab === TAB_ALL && (
                      <TableCell>
                        <Badge
                          className={
                            getVehicleListingType(vehicle) === TAB_RENT
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }
                        >
                          {getVehicleListingType(vehicle) === TAB_RENT
                            ? "For Rent"
                            : "For Sale"}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>{vehicle.uploader?.name || vehicle.uploadedBy?.name || "N/A"}</TableCell>
                    {activeTab === TAB_RENT && (
                      <TableCell>{getRentalBookingCount(vehicle)}</TableCell>
                    )}
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
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 0 && (
            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
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
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE VEHICLE DIALOG */}
      <Dialog
        open={isCreateVehicleOpen}
        onOpenChange={(open) => {
          setIsCreateVehicleOpen(open);
          if (!open) {
            setCreatePresetType(null);
            resetCreateForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl bg-white rounded-lg">
          <div className="bg-gradient-to-r from-purple to-blue text-white p-4 sm:p-6">
            <DialogHeader className="p-0 space-y-2">
              <DialogTitle className="text-white text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Plus size={20} />
                {createDialogTitle}
              </DialogTitle>
              <DialogDescription className="text-gray-100 mt-1 text-sm sm:text-base">
                {createDialogDescription}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-4 sm:p-6 bg-white">
            <form onSubmit={handleAdminVehicleCreate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label htmlFor="admin-name" className="font-semibold text-gray-900">Vehicle Name *</Label>
                  <Input
                    id="admin-name"
                    value={createForm.name}
                    onChange={(e) => handleCreateInputChange("name", e.target.value)}
                    placeholder="e.g., Toyota Camry 2020"
                    className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="admin-make" className="font-semibold text-gray-900">Make *</Label>
                  <Input
                    id="admin-make"
                    value={createForm.make}
                    onChange={(e) => handleCreateInputChange("make", e.target.value)}
                    placeholder="e.g., Toyota"
                    className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="admin-model" className="font-semibold text-gray-900">Model *</Label>
                  <Input
                    id="admin-model"
                    value={createForm.model}
                    onChange={(e) => handleCreateInputChange("model", e.target.value)}
                    placeholder="e.g., Camry"
                    className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="admin-year" className="font-semibold text-gray-900">Year *</Label>
                  <Input
                    id="admin-year"
                    type="number"
                    value={createForm.year}
                    onChange={(e) => handleCreateInputChange("year", e.target.value)}
                    className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="admin-price" className="font-semibold text-gray-900">
                    {createForm.category === "Renting" ? "Price Per Day (Rs.) *" : "Price (Rs.) *"}
                  </Label>
                  <Input
                    id="admin-price"
                    type="number"
                    value={createForm.price}
                    onChange={(e) => handleCreateInputChange("price", e.target.value)}
                    className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="admin-mileage" className="font-semibold text-gray-900">Mileage (km)</Label>
                  <Input
                    id="admin-mileage"
                    type="number"
                    value={createForm.mileage}
                    onChange={(e) => handleCreateInputChange("mileage", e.target.value)}
                    className="border-2 border-gray-300 focus:border-blue focus:ring-blue"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="admin-fuel" className="font-semibold text-gray-900">Fuel Type</Label>
                  <Select
                    value={createForm.fuelType}
                    onValueChange={(value) => handleCreateInputChange("fuelType", value)}
                  >
                    <SelectTrigger id="admin-fuel" className="border-2 border-gray-300 focus:border-purple focus:ring-purple bg-white">
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Petrol">Petrol</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="CNG">CNG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="admin-transmission" className="font-semibold text-gray-900">Transmission</Label>
                  <Select
                    value={createForm.transmission}
                    onValueChange={(value) => handleCreateInputChange("transmission", value)}
                  >
                    <SelectTrigger id="admin-transmission" className="border-2 border-gray-300 focus:border-purple focus:ring-purple bg-white">
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="admin-color" className="font-semibold text-gray-900">Color</Label>
                  <Input
                    id="admin-color"
                    value={createForm.color}
                    onChange={(e) => handleCreateInputChange("color", e.target.value)}
                    placeholder="e.g., White"
                    className="border-2 border-gray-300 focus:border-blue focus:ring-blue"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="admin-condition" className="font-semibold text-gray-900">Condition</Label>
                  <Select
                    value={createForm.condition}
                    onValueChange={(value) => handleCreateInputChange("condition", value)}
                  >
                    <SelectTrigger id="admin-condition" className="border-2 border-gray-300 focus:border-purple focus:ring-purple bg-white">
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="admin-location" className="font-semibold text-gray-900">Location</Label>
                <Input
                  id="admin-location"
                  value={createForm.location}
                  onChange={(e) => handleCreateInputChange("location", e.target.value)}
                  placeholder="e.g., Kathmandu"
                  className="border-2 border-gray-300 focus:border-blue focus:ring-blue"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="admin-description" className="font-semibold text-gray-900">Description</Label>
                <Textarea
                  id="admin-description"
                  value={createForm.description}
                  onChange={(e) => handleCreateInputChange("description", e.target.value)}
                  rows={4}
                  placeholder="Describe your vehicle..."
                  className="border-2 border-gray-300 focus:border-blue focus:ring-blue resize-none"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="admin-images" className="font-semibold text-gray-900">Vehicle Photos</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple transition-colors cursor-pointer">
                  <input
                    id="admin-images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleCreateImageChange}
                    className="hidden"
                  />
                  <label htmlFor="admin-images" className="cursor-pointer block text-center">
                    <div className="text-gray-600 font-medium mb-2">Click to upload photos</div>
                    <div className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB each (max 10 images)</div>
                    {Array.isArray(createForm.images) && createForm.images.length > 0 && (
                      <div className="mt-4 text-sm text-green font-semibold">
                        {createForm.images.length} image(s) selected
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateVehicleOpen(false);
                    resetCreateForm();
                  }}
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="bg-gradient-to-r from-purple to-blue hover:from-purple hover:to-blue text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createLoading ? "Uploading..." : createForm.category === "Renting" ? "Upload Rental Vehicle" : "Upload Sale Vehicle"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

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
                          {formatPhoneNumber(selectedVehicle.uploadedBy.phoneNumber)}
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
