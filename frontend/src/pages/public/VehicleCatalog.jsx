import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../ui/ui/button";
import { Input } from "../../ui/ui/input";
import { Search, Filter, Car, ChevronLeft, ChevronRight, MessageSquare, Star, Eye } from "lucide-react";
import { getPublicVehicles } from "../../rtk/thunk/vehicleThunk";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import Pagination from "../../components/common/Pagination";
import CommentSection from "../../components/common/CommentSection";
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

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [imageIndices, setImageIndices] = useState({});
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [activeCommentVehicle, setActiveCommentVehicle] = useState(null);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      
      <main className="flex-grow pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{pageTitle}</h1>
            <p className="text-gray-600">Find the perfect vehicle for your needs</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input 
                    placeholder="Search by make, model, or name..." 
                    className="pl-10 h-12 border-gray-300 focus:border-blue focus:ring-blue"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Grid */}
        {loading && publicVehicles.length === 0 ? (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
            </div>
        ) : (!publicVehicles || publicVehicles.length === 0) ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900">No vehicles found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search terms</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {publicVehicles.map((vehicle) => (
                <div key={vehicle.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 group flex flex-col">
                  {/* Image Carousel */}
                  <div className="relative h-64 bg-gray-100 overflow-hidden">
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
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleNextImage(vehicle.id, vehicle.images.length); }}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            </>
                        )}
                         <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                            {(imageIndices[vehicle.id] || 0) + 1} / {vehicle.images.length}
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <Car className="w-16 h-16" />
                      </div>
                    )}
                     <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                        {vehicle.condition || "Used"}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                             <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{vehicle.name}</h3>
                             <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model} • {vehicle.year}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xl font-black text-blue">
                                Rs. {parseFloat(vehicle.price)?.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 my-4 text-sm">
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="text-gray-500 text-xs block">Mileage</span>
                            <span className="font-semibold text-gray-900">{vehicle.mileage ? `${vehicle.mileage} km` : 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="text-gray-500 text-xs block">Fuel</span>
                            <span className="font-semibold text-gray-900 capitalize">{vehicle.fuelType || 'N/A'}</span>
                        </div>
                         <div className="bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="text-gray-500 text-xs block">Transmission</span>
                            <span className="font-semibold text-gray-900 capitalize">{vehicle.transmission || 'N/A'}</span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100">
                            <span className="text-gray-500 text-xs block">Location</span>
                            <span className="font-semibold text-gray-900 line-clamp-1">{vehicle.location || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-auto border-t border-gray-100 pt-4 flex gap-2">
                        <Button 
                            variant="info"
                            className="flex-1 font-semibold transition-all hover:scale-105"
                            onClick={() => navigate(`/vehicles/public/${vehicle.id}`)}
                        >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
        )}

        {/* Pagination */}
        {publicPagination && publicPagination.totalPages > 0 && (
          <div className="mb-12">
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
                            isOwner={user?.id === activeCommentVehicle.uploader?.id} 
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
};

export default VehicleCatalog;
