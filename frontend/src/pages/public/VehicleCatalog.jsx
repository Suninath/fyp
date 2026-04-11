import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../ui/ui/button";
import { Input } from "../../ui/ui/input";
import { Search, Filter, Car, ChevronLeft, ChevronRight, MessageSquare, Star, Eye, Scale } from "lucide-react";
import { getPublicVehicles } from "../../rtk/thunk/vehicleThunk";
import { addToComparison, removeFromComparison } from "../../rtk/slice/comparisonSlice";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import Pagination from "../../components/common/Pagination";
import CommentSection from "../../components/common/CommentSection";
import ComparisonDrawer from "../../components/common/ComparisonDrawer";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/ui/dialog";

// Helper to construct full image URL
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath.replace(/\\/g, "/")}`;
};

const VehicleCatalog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("type"); // 'Buy/Sell' or 'Rent'
  
  const { publicVehicles, loading, publicPagination } = useSelector((state) => state.vehicle);
  const { user } = useSelector((state) => state.auth);
  const { comparedVehicles } = useSelector((state) => state.comparison);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [imageIndices, setImageIndices] = useState({});
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [activeCommentVehicle, setActiveCommentVehicle] = useState(null);
  const [isComparisonDrawerOpen, setIsComparisonDrawerOpen] = useState(false);

  // Map URL param to DB enum
  const categoryFilter = categoryParam === "rent" ? "Renting" : "Buy/Sell";
  const pageTitle = categoryParam === "rent" ? "Vehicles for Rent" : "Vehicles for Sale";

  useEffect(() => {
    dispatch(getPublicVehicles({
      page: currentPage,
      limit: pageSize,
      search: searchTerm,
      category: categoryFilter
    }));
  }, [dispatch, currentPage, pageSize, searchTerm, categoryFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
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

  const handleOpenComments = (vehicle) => {
    setActiveCommentVehicle(vehicle);
    setIsCommentModalOpen(true);
  };

  const handleCompare = (vehicle) => {
    if (isVehicleInComparison(vehicle.id)) {
      dispatch(removeFromComparison(vehicle.id));
    } else {
      dispatch(addToComparison(vehicle));
    }
    setIsComparisonDrawerOpen(true);
  };

  const handleRemoveFromComparison = (vehicleId) => {
    dispatch(removeFromComparison(vehicleId));
  };

  const isVehicleInComparison = (vehicleId) => {
    return comparedVehicles.some(v => v.id === vehicleId);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-16 md:pt-20 px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 md:mb-2">{pageTitle}</h1>
              <p className="text-sm md:text-base text-gray-600">Find the perfect vehicle for your needs</p>
            </div>
            <div className="flex gap-2 flex-col sm:flex-row w-full sm:w-auto">
              {user?.accountVerified && (
                <Button
                  onClick={() => navigate("/user/create-vehicle")}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-secondary text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm md:text-base w-full sm:w-auto justify-center"
                >
                  <Car className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Add Vehicle</span>
                </Button>
              )}
              {comparedVehicles.length > 0 && (
                <button
                  onClick={() => setIsComparisonDrawerOpen(true)}
                  className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue/90 transition-colors animate-pulse text-sm md:text-base w-full sm:w-auto justify-center sm:justify-start"
                >
                  <Scale className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Compare ({comparedVehicles.length})</span>
                </button>
              )}
            </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6 md:mb-8 flex gap-2 md:gap-4 flex-col md:flex-row">
            <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
                <Input 
                    placeholder="Search by make, model, or name..." 
                    className="pl-9 md:pl-10 h-10 md:h-12 text-sm md:text-base border-gray-300 focus:border-blue focus:ring-blue"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Grid */}
        {loading && publicVehicles.length === 0 ? (
            <div className="flex justify-center items-center h-48 md:h-64">
                <div className="animate-spin rounded-full h-10 md:h-12 w-10 md:w-12 border-b-2 border-blue"></div>
            </div>
        ) : (!publicVehicles || publicVehicles.length === 0) ? (
            <div className="text-center py-12 md:py-16 bg-white rounded-xl border border-dashed border-gray-300 px-4">
                <Car className="w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-medium text-gray-900">No vehicles found</h3>
                <p className="text-sm md:text-base text-gray-500 mt-2">Try adjusting your search terms</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-12">
            {publicVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 group flex flex-col">
                  {/* Image Carousel */}
                  <div className="relative h-48 md:h-64 bg-gray-100 overflow-hidden">
                    {vehicle.images && vehicle.images.length > 0 ? (
                      <>
                        <img
                          src={getImageUrl(vehicle.images[imageIndices[vehicle.id] || 0])}
                          alt={vehicle.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/600x400?text=No+Image";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40"></div>
                        
                        {vehicle.images.length > 1 && (
                            <>
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePrevImage(vehicle.id, vehicle.images.length); }}
                                className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 p-1 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            >
                                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNextImage(vehicle.id, vehicle.images.length); }}
                                className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-white/90 p-1 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                            >
                                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                            </>
                        )}
                         <div className="absolute bottom-2 md:bottom-4 right-2 md:right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                            {(imageIndices[vehicle.id] || 0) + 1} / {vehicle.images.length}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <Car className="w-12 h-12 md:w-16 md:h-16" />
                      </div>
                    )}
                     <div className="absolute top-2 md:top-4 left-2 md:left-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-2 md:px-3 py-1 md:py-1.5 rounded-full shadow-sm">
                        {vehicle.condition || "Used"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-3 md:p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                             <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1">{vehicle.name}</h3>
                             <p className="text-xs md:text-sm text-gray-500 line-clamp-1">{vehicle.make} {vehicle.model} • {vehicle.year}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="text-lg md:text-xl font-black text-blue whitespace-nowrap">
                                Rs. {parseFloat(vehicle.price)?.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:gap-3 my-3 md:my-4 text-xs md:text-sm">
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 min-h-14 md:min-h-16 flex flex-col justify-center">
                            <span className="text-gray-500 text-xs block mb-1">Mileage</span>
                            <span className="font-semibold text-gray-900 line-clamp-1 text-xs md:text-sm">{vehicle.mileage ? `${vehicle.mileage} km` : 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 min-h-14 md:min-h-16 flex flex-col justify-center">
                            <span className="text-gray-500 text-xs block mb-1">Fuel</span>
                            <span className="font-semibold text-gray-900 capitalize line-clamp-1 text-xs md:text-sm">{vehicle.fuelType || 'N/A'}</span>
                        </div>
                         <div className="bg-gray-50 p-2 rounded border border-gray-100 min-h-14 md:min-h-16 flex flex-col justify-center">
                            <span className="text-gray-500 text-xs block mb-1">Trans.</span>
                            <span className="font-semibold text-gray-900 capitalize line-clamp-1 text-xs md:text-sm">{vehicle.transmission || 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 min-h-14 md:min-h-16 flex flex-col justify-center">
                            <span className="text-gray-500 text-xs block mb-1">Location</span>
                            <span className="font-semibold text-gray-900 line-clamp-1 text-xs md:text-sm">{vehicle.location || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-auto border-t border-gray-100 pt-3 md:pt-4 flex gap-2 flex-col sm:flex-row">
                        <Button 
                            variant="info"
                            size="sm"
                            className="flex-1 font-semibold transition-all hover:scale-105 text-xs md:text-sm"
                            onClick={() => navigate(`/vehicles/public/${vehicle.id}`)}
                        >
                            <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                        </Button>
                        <Button 
                            variant={isVehicleInComparison(vehicle.id) ? "default" : "outline"}
                            size="sm"
                            className={`flex-1 font-semibold transition-all hover:scale-105 text-xs md:text-sm ${isVehicleInComparison(vehicle.id) ? 'bg-blue text-white' : ''}`}
                            onClick={() => handleCompare(vehicle)}
                            disabled={comparedVehicles.length >= 4 && !isVehicleInComparison(vehicle.id)}
                        >
                            <Scale className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                            <span className="hidden sm:inline">
                              {isVehicleInComparison(vehicle.id) ? "Remove from Compare" : "Add to Compare"}
                            </span>
                            <span className="sm:hidden">
                              {isVehicleInComparison(vehicle.id) ? "Remove" : "Add"}
                            </span>
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}

        {/* Pagination */}
        {publicPagination && publicPagination.totalPages > 0 && (
          <div className="mb-8 md:mb-12">
            <Pagination
              currentPage={publicPagination.currentPage || currentPage}
              totalPages={publicPagination.totalPages}
              totalItems={publicPagination.count || 0}
              pageSize={publicPagination.perpage || pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[6, 12, 24, 48]}
              showPageSizeSelector={true}
              showInfo={true}
            />
          </div>
        )}
      </main>
      
      <Footer />

       {/* Comments Modal */}
       <Dialog open={isCommentModalOpen} onOpenChange={setIsCommentModalOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-0 shadow-2xl bg-white rounded-lg">
                <div className="bg-gradient-to-r from-blue to-purple text-white p-6">
                    <DialogTitle className="text-white text-2xl font-bold">Vehicle Inquiry</DialogTitle>
                    <DialogDescription className="text-blue-100 mt-2">
                        Ask questions about the {activeCommentVehicle?.name}
                    </DialogDescription>
                </div>
                <div className="p-6 bg-white">
                    {activeCommentVehicle && (
                        <CommentSection 
                            vehicleId={activeCommentVehicle.id} 
                        isOwner={false} 
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Comparison Drawer */}
        <ComparisonDrawer 
          isOpen={isComparisonDrawerOpen}
          onToggle={setIsComparisonDrawerOpen}
        />
    </div>
  );
};

export default VehicleCatalog;
