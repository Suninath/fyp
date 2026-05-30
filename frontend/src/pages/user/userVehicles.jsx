import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Button } from "../../ui/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/ui/card";
import { Input } from "../../ui/ui/input";
import { Label } from "../../ui/ui/label";
import { Textarea } from "../../ui/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../../ui/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../ui/ui/table";
import {
  Car,
  Plus,
  Edit,
  Trash2,
  Search,
  Eye,
  ArrowLeft,
  Filter,
  Star,
  ChevronLeft,
  ChevronRight,
  MessageSquare // Added icon
} from "lucide-react";
import { getUserVehicles, createVehicle, updateVehicle, deleteVehicle } from "../../rtk/thunk/vehicleThunk";
import { clearLastCreatedVehicleId } from "../../rtk/slice/vehicleSlice";
import { getUserProfile } from "../../rtk/thunk/authThunk";
import CommentSection from "../../components/common/CommentSection"; // Import the component
import Pagination from "../../components/common/Pagination";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { ErrorToast } from "../../components/common/toast";
import { isUserVerified } from "../../lib/verification";

// Helper to construct full image URL
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  // Ensure path doesn't start with / if we're appending it, or handle cleanly
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath.replace(/\\/g, "/")}`;
};

const UserVehiclesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { vehicles, loading, pagination, lastCreatedVehicleId } = useSelector((state) => state.vehicle);
  const { user } = useSelector((state) => state.auth);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // modal removed: use full-page create route
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [imageIndices, setImageIndices] = useState({}); // Track image index for each vehicle
  const [vehicleForm, setVehicleForm] = useState({
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
    images: []
  });

  const [activeCommentVehicle, setActiveCommentVehicle] = useState(null); // ID of vehicle to show comments for here in the list? Or maybe a modal? A modal is cleaner.
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  useEffect(() => {
    console.log("UserVehiclesPage mounted, dispatching loadVehicles");
    loadVehicles();
  }, [dispatch, currentPage, pageSize, searchTerm]);

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const handleNavigateCreateVehicle = () => {
    if (!isUserVerified(user)) {
      ErrorToast({ message: "Account verification is required to list vehicles." });
      navigate("/profile");
      return;
    }

    navigate('/user/create-vehicle');
  };

  useEffect(() => {
    if (!lastCreatedVehicleId) return undefined;
    const timer = setTimeout(() => {
      dispatch(clearLastCreatedVehicleId());
    }, 5000);
    return () => clearTimeout(timer);
  }, [dispatch, lastCreatedVehicleId]);

  const loadVehicles = () => {
    dispatch(getUserVehicles({
      page: currentPage,
      limit: pageSize,
      search: searchTerm
    }));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) {
      return;
    }
    
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      
      // Add text fields
      Object.keys(vehicleForm).forEach((key) => {
        if (key !== "images") {
          formData.append(key, vehicleForm[key]);
        }
      });

      // Add image files
      if (Array.isArray(vehicleForm.images) && vehicleForm.images.length > 0) {
        vehicleForm.images.forEach((imageObj) => {
          if (imageObj.file) {
            formData.append("images", imageObj.file);
          }
        });
      } else if (vehicleForm.images instanceof FileList && vehicleForm.images.length > 0) {
        Array.from(vehicleForm.images).forEach((file) => formData.append("images", file));
      }

      await dispatch(createVehicle(formData)).unwrap();
      resetForm();
      loadVehicles();
    } catch (error) {
      console.error("Failed to create vehicle:", error);
    }
  };

  const handleEditVehicle = async (e) => {
    e.preventDefault();
    
    // Prevent double submission
    if (loading) {
      return;
    }
    
    try {
      // Create FormData to handle file uploads
      const formData = new FormData();
      
      // Add text fields
      Object.keys(vehicleForm).forEach((key) => {
        if (key !== "images") {
          formData.append(key, vehicleForm[key]);
        }
      });

      // Get existing images that user wants to keep
      const keepImages = vehicleForm.images
        .filter(img => img.isExisting)
        .map(img => img.url);
      
      if (keepImages.length > 0) {
        formData.append("keepImages", JSON.stringify(keepImages));
      }

      // Add only new image files (not existing ones)
      if (Array.isArray(vehicleForm.images) && vehicleForm.images.length > 0) {
        vehicleForm.images.forEach((imageObj) => {
          if (!imageObj.isExisting && imageObj.file) {
            formData.append("images", imageObj.file);
          }
        });
      }

      await dispatch(updateVehicle({ id: selectedVehicle.id, data: formData })).unwrap();
      setIsEditModalOpen(false);
      resetForm();
      loadVehicles();
    } catch (error) {
      console.error("Failed to update vehicle:", error);
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      await dispatch(deleteVehicle(vehicleId)).unwrap();
      setIsDeleteDialogOpen(false);
      setVehicleToDelete(null);
      loadVehicles();
    } catch (error) {
      console.error("Failed to delete vehicle:", error);
    }
  };

  const openDeleteDialog = (vehicle) => {
    setVehicleToDelete(vehicle);
    setIsDeleteDialogOpen(true);
  };

  const handlePrevImage = (vehicleId, totalImages) => {
    setImageIndices(prev => ({
      ...prev,
      [vehicleId]: (prev[vehicleId] || 0) === 0 ? totalImages - 1 : (prev[vehicleId] || 0) - 1
    }));
  };

  const handleNextImage = (vehicleId, totalImages) => {
    setImageIndices(prev => ({
      ...prev,
      [vehicleId]: ((prev[vehicleId] || 0) + 1) % totalImages
    }));
  };

  const handleAddReview = (vehicleId) => {
    navigate(`/vehicles/${vehicleId}/review`);
  };

  const openEditModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    // Convert existing images to objects with url property for display
    const existingImages = (vehicle.images || []).map(url => ({
      url,
      isExisting: true
    }));
    setVehicleForm({
      name: vehicle.name || "",
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: vehicle.year || "",
      price: vehicle.price || "",
      category: vehicle.category || "Buy/Sell",
      mileage: vehicle.mileage || "",
      fuelType: vehicle.fuelType || "",
      transmission: vehicle.transmission || "",
      color: vehicle.color || "",
      location: vehicle.location || "",
      condition: vehicle.condition || "",
      description: vehicle.description || "",
      images: existingImages
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setVehicleForm({
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
      images: []
    });
    setSelectedVehicle(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-bg via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/home')}
                className="flex items-center space-x-1 sm:space-x-2 text-purple hover:text-purple hover:bg-purple hover:bg-opacity-10 transition-all px-2 sm:px-3"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm sm:text-base">Back</span>
              </Button>
            </div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple to-blue bg-clip-text text-transparent">My Vehicles</h1>
            <div className="w-16 sm:w-24"></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Search and Actions */}
        <Card className="mb-4 sm:mb-6 border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple to-blue text-white rounded-t-lg p-4 sm:p-6">
            <CardTitle className="text-white text-lg sm:text-xl md:text-2xl">Vehicle Management</CardTitle>
            <CardDescription className="text-gray-100 mt-1 text-sm sm:text-base">Manage and list your vehicles for sale</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-2 border-gray-300 focus:border-purple focus:ring-purple"
                  />
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleNavigateCreateVehicle}
                className="flex-none px-5 py-2.5 rounded-lg font-semibold flex items-center gap-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Vehicle
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-blue bg-opacity-10 border border-blue border-opacity-20 p-3 sm:p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-xl sm:text-2xl font-bold text-blue">{pagination?.count || 0}</div>
                <div className="text-xs sm:text-sm text-blue font-medium mt-1">Total Vehicles</div>
              </div>
              <div className="bg-green bg-opacity-10 border border-green border-opacity-20 p-3 sm:p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-xl sm:text-2xl font-bold text-green">
                  {vehicles?.filter(v => v && v.condition !== 'sold')?.length || 0}
                </div>
                <div className="text-xs sm:text-sm text-green font-medium mt-1">Active Listings</div>
              </div>
              <div className="bg-purple bg-opacity-10 border border-purple border-opacity-20 p-3 sm:p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-xl sm:text-2xl font-bold text-purple">
                  {vehicles?.filter(v => v && v.condition === 'sold')?.length || 0}
                </div>
                <div className="text-xs sm:text-sm text-purple font-medium mt-1">Sold Vehicles</div>
              </div>
              <div className="bg-blue bg-opacity-10 border border-blue border-opacity-20 p-3 sm:p-4 rounded-lg hover:shadow-md transition-shadow">
                <div className="text-xl sm:text-2xl font-bold text-blue">
                  Rs. {vehicles?.reduce((sum, v) => sum + (parseFloat(v?.price) || 0), 0)?.toLocaleString('en-IN') || 0}
                </div>
                <div className="text-xs sm:text-sm text-blue font-medium mt-1">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Grid Cards */}
        {(!vehicles || vehicles.length === 0) ? (
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="p-0">
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 mx-auto mb-4 bg-purple bg-opacity-10 rounded-full flex items-center justify-center">
                  <Car className="w-10 h-10 text-purple" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No vehicles found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? 'No vehicles match your search criteria.' : 'You haven\'t listed any vehicles yet.'}
                </p>
                {/* Add Your First Vehicle button removed as requested */}
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {vehicles?.filter(v => v)?.map((vehicle) => (
                <div key={vehicle.id} className="group bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-200">
                  {/* Image Container with Premium Carousel */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <>
                        <img
                          src={getImageUrl(vehicle.images[imageIndices[vehicle.id] || 0])}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/600x400?text=No+Image"; // Fallback
                          }}
                        />
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40"></div>
                        
                        {/* Left Arrow */}
                        {vehicle.images.length > 1 && (
                          <button
                            onClick={() => handlePrevImage(vehicle.id, vehicle.images.length)}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg hover:scale-110"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                        )}

                        {/* Right Arrow */}
                        {vehicle.images.length > 1 && (
                          <button
                            onClick={() => handleNextImage(vehicle.id, vehicle.images.length)}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-black p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 shadow-lg hover:scale-110"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        )}

                        {/* Image Indicators with Counter */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-10">
                          {vehicle.images.length > 1 && (
                            <div className="flex gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/20">
                              {vehicle.images.map((_, index) => (
                                <button
                                  key={index}
                                  onClick={() => setImageIndices(prev => ({ ...prev, [vehicle.id]: index }))}
                                  className={`transition-all duration-300 rounded-full ${
                                    index === (imageIndices[vehicle.id] || 0)
                                      ? 'bg-blue w-2.5 h-2.5'
                                      : 'bg-white/50 w-2 h-2 hover:bg-white/80'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          <div className="ml-2 text-xs font-semibold text-white bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
                            {(imageIndices[vehicle.id] || 0) + 1}/{vehicle.images.length}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                        <Car className="w-20 h-20 text-white opacity-60" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                      {vehicle.id === lastCreatedVehicleId && (
                        <span className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-md">
                          New
                        </span>
                      )}
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-md ${
                        vehicle.condition === 'sold'
                          ? 'bg-red-600 text-white'
                          : vehicle.condition === 'reserved' || vehicle.condition === 'pending'
                            ? 'bg-amber-600 text-white'
                            : 'bg-black text-white'
                      }`}>
                        <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white" />
                        {vehicle.condition === 'sold'
                          ? 'Sold'
                          : vehicle.condition === 'reserved' || vehicle.condition === 'pending'
                            ? 'Reserved'
                            : 'Available'}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4">
                    {/* Vehicle Title */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{vehicle.name}</h3>
                      <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model} • {vehicle.year}</p>
                    </div>

                    {/* Price - Highlighted */}
                    <div className="pt-2 pb-3 border-t border-b border-gray-100">
                      <p className="text-3xl font-black text-blue">
                        Rs. {parseFloat(vehicle.price)?.toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Details Grid - Enhanced */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Mileage</p>
                        <p className="font-bold text-gray-900 mt-1">{vehicle.mileage ? `${vehicle.mileage} km` : 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Fuel</p>
                        <p className="font-bold text-gray-900 mt-1 capitalize">{vehicle.fuelType || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Trans</p>
                        <p className="font-bold text-gray-900 mt-1 capitalize">{vehicle.transmission || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-50 hover:bg-gray-100 transition-colors p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Location</p>
                        <p className="font-bold text-gray-900 mt-1 line-clamp-1 text-sm">{vehicle.location || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Description */}
                    {vehicle.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{vehicle.description}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="info"
                        onClick={() => openEditModal(vehicle)}
                        className="flex-1 font-semibold transition-all hover:scale-105"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                            setActiveCommentVehicle(vehicle);
                            setIsCommentModalOpen(true);
                        }}
                        className="flex-1 font-semibold transition-all hover:scale-105"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Comments
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(vehicle)}
                        className="font-semibold transition-all hover:scale-105"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 0 && (
              <Pagination
                currentPage={pagination.currentPage || currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.count || 0}
                pageSize={pagination.perpage || pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[5, 10, 20, 50]}
                showPageSizeSelector={true}
                showInfo={true}
              />
            )}
          </>
        )}

        {/* Edit Vehicle Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl bg-white rounded-lg">
            <div className="bg-gradient-to-r from-purple to-blue text-white p-6">
              <DialogTitle className="text-white text-2xl font-bold">Edit Vehicle</DialogTitle>
              <DialogDescription className="text-gray-100 mt-2">
                Update the vehicle information.
              </DialogDescription>
            </div>
            <div className="p-6 bg-white">
              <VehicleForm
                formData={vehicleForm}
                setFormData={setVehicleForm}
                onSubmit={handleEditVehicle}
                submitLabel="Update Vehicle"
                loading={loading}
              />
            </div>
          </DialogContent>
        </Dialog>

       {/* Comments Modal for Owner */}
       <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl bg-white rounded-lg">
                <div className="bg-gradient-to-r from-blue to-purple text-white p-6">
                    <DialogTitle className="text-white text-2xl font-bold">Manage Inquiries</DialogTitle>
                    <DialogDescription className="text-blue-100 mt-2">
                        View and reply to comments on your vehicle: {activeCommentVehicle?.name}
                    </DialogDescription>
                </div>
                <div className="p-6 bg-white">
                    {activeCommentVehicle && (
                        <CommentSection 
                            vehicleId={activeCommentVehicle.id} 
                            isOwner={true} 
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Delete Vehicle Confirmation Dialog */}
        <ConfirmDialog
          open={isDeleteDialogOpen}
          onOpenChange={(open) => {
            setIsDeleteDialogOpen(open);
            if (!open) setVehicleToDelete(null);
          }}
          onConfirm={() => handleDeleteVehicle(vehicleToDelete?.id)}
          title="Delete Vehicle"
          description={
            <>
              Are you sure you want to delete <strong>{vehicleToDelete?.name}</strong>?
              <br />
              <span className="text-red-600 font-semibold mt-2 block">
                This will permanently remove this vehicle and all associated data including comments and images.
              </span>
            </>
          }
          confirmText="Delete Vehicle"
          type="danger"
        />
      </div>
    </div>
  );
};

// Vehicle Form Component
const VehicleForm = ({ formData, setFormData, onSubmit, submitLabel, loading }) => {
  const handleChange = (field, value) => {
    if (field === "images") {
      // Add new files while preserving existing images
      const newFiles = value ? Array.from(value).map(file => ({
        file,
        isExisting: false
      })) : [];
      setFormData(prev => ({
        ...prev,
        images: [...(prev.images || []), ...newFiles]
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="name" className="font-semibold text-gray-900">Vehicle Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Toyota Camry 2020"
            className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="make" className="font-semibold text-gray-900">Make *</Label>
          <Input
            id="make"
            value={formData.make}
            onChange={(e) => handleChange("make", e.target.value)}
            placeholder="e.g., Toyota"
            className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="model" className="font-semibold text-gray-900">Model *</Label>
          <Input
            id="model"
            value={formData.model}
            onChange={(e) => handleChange("model", e.target.value)}
            placeholder="e.g., Camry"
            className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="year" className="font-semibold text-gray-900">Year *</Label>
          <Input
            id="year"
            type="number"
            value={formData.year}
            onChange={(e) => handleChange("year", e.target.value)}
            placeholder="e.g., 2020"
            className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="price" className="font-semibold text-gray-900">Price (Rs.) *</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => handleChange("price", e.target.value)}
            placeholder="e.g., 1500000"
            className="border-2 border-gray-300 focus:border-purple focus:ring-purple"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="mileage" className="font-semibold text-gray-900">Mileage (km)</Label>
          <Input
            id="mileage"
            type="number"
            value={formData.mileage}
            onChange={(e) => handleChange("mileage", e.target.value)}
            placeholder="e.g., 50000"
            className="border-2 border-gray-300 focus:border-blue focus:ring-blue"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="fuelType" className="font-semibold text-gray-900">Fuel Type</Label>
          <Select value={formData.fuelType} onValueChange={(value) => handleChange("fuelType", value)}>
            <SelectTrigger className="border-2 border-gray-300 focus:border-purple focus:ring-purple bg-white">
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="petrol">Petrol</SelectItem>
              <SelectItem value="diesel">Diesel</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
              <SelectItem value="cng">CNG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="transmission" className="font-semibold text-gray-900">Transmission</Label>
          <Select value={formData.transmission} onValueChange={(value) => handleChange("transmission", value)}>
            <SelectTrigger className="border-2 border-gray-300 focus:border-purple focus:ring-purple bg-white">
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="automatic">Automatic</SelectItem>
              <SelectItem value="cvt">CVT</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label htmlFor="color" className="font-semibold text-gray-900">Color</Label>
          <Input
            id="color"
            value={formData.color}
            onChange={(e) => handleChange("color", e.target.value)}
            placeholder="e.g., White"
            className="border-2 border-gray-300 focus:border-blue focus:ring-blue"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="condition" className="font-semibold text-gray-900">Condition</Label>
          <Select value={formData.condition} onValueChange={(value) => handleChange("condition", value)}>
            <SelectTrigger className="border-2 border-gray-300 focus:border-purple focus:ring-purple bg-white">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="excellent">Excellent</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
              <SelectItem value="poor">Poor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="location" className="font-semibold text-gray-900">Location</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="e.g., Mumbai, Maharashtra"
          className="border-2 border-gray-300 focus:border-blue focus:ring-blue"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="description" className="font-semibold text-gray-900">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe your vehicle..."
          rows={4}
          className="border-2 border-gray-300 focus:border-blue focus:ring-blue resize-none"
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="images" className="font-semibold text-gray-900">Vehicle Photos</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-purple transition-colors cursor-pointer">
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleChange("images", e.target.files)}
            className="hidden"
          />
          <label htmlFor="images" className="cursor-pointer block text-center">
            <div className="text-gray-600 font-medium mb-2">Click to upload photos</div>
            <div className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB each (max 10 images)</div>
            {Array.isArray(formData.images) && formData.images.length > 0 && (
              <div className="mt-4 text-sm text-green font-semibold">
                {formData.images.length} image(s) selected
              </div>
            )}
          </label>

            {Array.isArray(formData.images) && formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {formData.images.map((imageObj, index) => (
                <div key={index} className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <img
                    src={imageObj.isExisting ? getImageUrl(imageObj.url) : URL.createObjectURL(imageObj.file)}
                    alt={`vehicle-${index}`}
                    className="h-28 w-full object-cover"
                  />
                  {imageObj.isExisting && (
                    <div className="absolute top-2 left-2 bg-blue/80 text-white text-xs px-2 py-1 rounded">
                      Existing
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 bg-white/90 text-red border border-red text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={() => window.location.reload()} className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-gradient-to-r from-purple to-blue hover:from-purple hover:to-blue text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? (submitLabel === "Create Vehicle" ? "Creating..." : "Updating...") : submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default UserVehiclesPage;