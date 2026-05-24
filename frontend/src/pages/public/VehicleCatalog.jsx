import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "../../ui/ui/button";
import { Input } from "../../ui/ui/input";
import {
  Search,
  Car,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Heart,
  Scale,
  X,
  SlidersHorizontal,
  LayoutGrid,
  List,
  ArrowUpDown,
} from "lucide-react";
import { getPublicVehicles } from "../../rtk/thunk/vehicleThunk";
import { addToComparison, removeFromComparison } from "../../rtk/slice/comparisonSlice";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import Pagination from "../../components/common/Pagination";
import CommentSection from "../../components/common/CommentSection";
import ComparisonDrawer from "../../components/common/ComparisonDrawer";
import FilterSidebar from "../../components/public/FilterSidebar";
import useFavorites from "../../hooks/useFavorites";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "../../ui/ui/dialog";
import { isUserVerified } from "../../lib/verification";

// Helper to construct full image URL
const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath.replace(/\\/g, "/")}`;
};

const initialFilters = {
  brand: [],
  fuel: [],
  minPrice: null,
  maxPrice: null,
  minYear: null,
  maxYear: null,
  transmission: [],
  minKm: null,
  maxKm: null,
  sort: "newest",
};

const sortLabelMap = {
  newest: "Newest",
  price_asc: "Price: Low to High",
  price_desc: "Price: High to Low",
  year_desc: "Year: Newest First",
  year_asc: "Year: Oldest First",
  mileage_asc: "Mileage: Lowest",
};

const formatNumber = (value) => Number(value).toLocaleString("en-IN");

const getConditionMeta = (condition) => {
  if (condition === "sold") {
    return { label: "Sold", className: "bg-red-600 text-white" };
  }

  if (condition === "reserved" || condition === "pending") {
    return { label: "Reserved", className: "bg-amber-600 text-white" };
  }

  return { label: "Available", className: "bg-black text-white" };
};

const VehicleListRow = ({
  vehicle,
  imageUrl,
  isFavorite,
  onFavoriteToggle,
  onViewDetails,
  onCompare,
  isInComparison,
}) => {
  const conditionMeta = getConditionMeta(vehicle?.condition);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-lg md:flex-row md:items-stretch md:p-4">
      <div className="relative overflow-hidden rounded-xl bg-gray-100 md:h-[92px] md:w-[120px] md:flex-shrink-0">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={vehicle?.name}
            className="h-48 w-full object-cover md:h-full"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
            }}
          />
        ) : (
          <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400 md:h-full">
            <Car className="h-12 w-12" />
          </div>
        )}

        <span className={`absolute left-2 top-2 z-10 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold shadow-md ${conditionMeta.className}`}>
          <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white" />
          {conditionMeta.label}
        </span>

        <button
          type="button"
          onClick={(event) => onFavoriteToggle(event, vehicle.id)}
          className="absolute right-2 top-2 z-20 rounded-full bg-white/85 p-1.5 text-slate-600 backdrop-blur transition-transform active:scale-90"
          aria-label={isFavorite(vehicle.id) ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isFavorite(vehicle.id) ? "fill-red-500 text-red-500" : "fill-white text-slate-600"
            }`}
          />
        </button>
      </div>

      <div className="min-w-0 flex-1 py-0 md:py-1">
        <div className="flex h-full flex-col justify-between gap-3 lg:flex-row lg:items-start lg:gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-bold text-gray-900 md:text-lg">{vehicle?.name}</h3>
            <p className="mt-0.5 text-xs font-medium text-gray-500 md:text-sm">
              {vehicle?.make} {vehicle?.model} • {vehicle?.year}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-gray-500 md:text-xs">
              <span>{vehicle?.mileage ? `${formatNumber(vehicle.mileage)} km` : "N/A"}</span>
              <span className="text-gray-300">|</span>
              <span>{vehicle?.fuelType || "N/A"}</span>
              <span className="text-gray-300">|</span>
              <span>{vehicle?.transmission || "N/A"}</span>
              <span className="text-gray-300">|</span>
              <span>{vehicle?.location || "N/A"}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 lg:min-w-[160px] lg:flex-col lg:items-end lg:justify-between">
            <div className="text-right">
              <p className="text-xl font-black text-blue whitespace-nowrap md:text-2xl">
                Rs. {parseFloat(vehicle?.price)?.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-stretch">
              <Button
                variant="info"
                size="sm"
                className="h-9 px-3 text-xs font-semibold md:px-4"
                onClick={() => onViewDetails(vehicle)}
              >
                <Eye className="mr-1 h-3.5 w-3.5" />
                Details
              </Button>
              <Button
                variant={isInComparison(vehicle.id) ? "default" : "outline"}
                size="sm"
                className={`h-9 px-3 text-xs font-semibold md:px-4 ${isInComparison(vehicle.id) ? "bg-blue text-white" : ""}`}
                onClick={() => onCompare(vehicle)}
                disabled={isInComparison(vehicle.id) ? false : false}
              >
                <Scale className="mr-1 h-3.5 w-3.5" />
                Compare
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const VehicleCatalog = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get("type"); // 'Buy/Sell' or 'Rent'

  const { publicVehicles, loading, publicPagination } = useSelector((state) => state.vehicle);
  const { user } = useSelector((state) => state.auth);
  const { comparedVehicles } = useSelector((state) => state.comparison);
  const { toggleFavorite, isFavorite } = useFavorites();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filters, setFilters] = useState(initialFilters);
  const [viewMode, setViewMode] = useState("grid");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [imageIndices, setImageIndices] = useState({});
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [activeCommentVehicle, setActiveCommentVehicle] = useState(null);
  const [isComparisonDrawerOpen, setIsComparisonDrawerOpen] = useState(false);

  // Map URL param to DB enum
  const categoryFilter = categoryParam === "rent" ? "Renting" : "Buy/Sell";
  const pageTitle = categoryParam === "rent" ? "Vehicles for Rent" : "Vehicles for Sale";

  const cleanedFilters = useMemo(() => {
    const cleaned = Object.entries(filters).reduce((accumulator, [key, value]) => {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          accumulator[key] = value.join(",");
        }
        return accumulator;
      }

      if (value !== null && value !== "" && value !== undefined) {
        accumulator[key] = value;
      }

      return accumulator;
    }, {});

    if (cleaned.sort === "newest") {
      delete cleaned.sort;
    }

    return cleaned;
  }, [filters]);

  useEffect(() => {
    dispatch(
      getPublicVehicles({
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
        category: categoryFilter,
        ...cleanedFilters,
      }),
    );
  }, [dispatch, currentPage, pageSize, searchTerm, categoryFilter, cleanedFilters]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handlePrevImage = (vehicleId, totalImages) => {
    setImageIndices((prev) => ({
      ...prev,
      [vehicleId]: (prev[vehicleId] || 0) === 0 ? totalImages - 1 : (prev[vehicleId] || 0) - 1,
    }));
  };

  const handleNextImage = (vehicleId, totalImages) => {
    setImageIndices((prev) => ({
      ...prev,
      [vehicleId]: ((prev[vehicleId] || 0) + 1) % totalImages,
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
    return comparedVehicles.some((v) => v.id === vehicleId);
  };

  const handleFavoriteToggle = (event, vehicleId) => {
    event.stopPropagation();
    const wasFavorite = isFavorite(vehicleId);
    toggleFavorite(vehicleId);
    if (!wasFavorite) {
      navigate("/favorites");
    }
  };

  const handleSidebarFiltersChange = useCallback((nextFilters) => {
    setFilters(nextFilters);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedViewMode = window.localStorage.getItem("publicVehicleViewMode");
    if (storedViewMode === "grid" || storedViewMode === "list") {
      setViewMode(storedViewMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateViewport);
      return () => mediaQuery.removeEventListener("change", updateViewport);
    }

    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  const handleViewModeChange = useCallback((nextMode) => {
    setViewMode(nextMode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("publicVehicleViewMode", nextMode);
    }
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isFiltersOpen) setIsFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFiltersOpen]);

  const effectiveViewMode = isMobile ? "list" : viewMode;

  const updateFilter = (key, value) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeMultiFilterValue = (key, value) => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((item) => item !== value),
    }));
  };

  const clearAllFilters = () => {
    setCurrentPage(1);
    setFilters(initialFilters);
  };

  const removeYearFilter = () => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      minYear: null,
      maxYear: null,
    }));
  };

  const removeKmFilter = () => {
    setCurrentPage(1);
    setFilters((prev) => ({
      ...prev,
      minKm: null,
      maxKm: null,
    }));
  };

  const activeFilterChips = [];

  (filters.brand || []).forEach((value) => {
    activeFilterChips.push({
      key: `brand-${value}`,
      label: `Brand: ${value}`,
      className: "border-primary/20 bg-primary/10 text-primary",
      onRemove: () => removeMultiFilterValue("brand", value),
    });
  });

  (filters.fuel || []).forEach((value) => {
    activeFilterChips.push({
      key: `fuel-${value}`,
      label: `Fuel: ${value}`,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      onRemove: () => removeMultiFilterValue("fuel", value),
    });
  });

  (filters.transmission || []).forEach((value) => {
    activeFilterChips.push({
      key: `transmission-${value}`,
      label: `Transmission: ${value}`,
      className: "border-blue-200 bg-blue-50 text-blue-700",
      onRemove: () => removeMultiFilterValue("transmission", value),
    });
  });

  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const minPrice = filters.minPrice !== null ? formatNumber(filters.minPrice) : null;
    const maxPrice = filters.maxPrice !== null ? formatNumber(filters.maxPrice) : null;
    let label = "Price";

    if (minPrice && maxPrice) {
      label = `Price: Rs. ${minPrice} - Rs. ${maxPrice}`;
    } else if (minPrice) {
      label = `Price: From Rs. ${minPrice}`;
    } else if (maxPrice) {
      label = `Price: Under Rs. ${maxPrice}`;
    }

    activeFilterChips.push({
      key: "price",
      label,
      className: "border-amber-200 bg-amber-50 text-amber-700",
      onRemove: () => {
        setCurrentPage(1);
        setFilters((prev) => ({
          ...prev,
          minPrice: null,
          maxPrice: null,
        }));
      },
    });
  }

  if (filters.minYear !== null || filters.maxYear !== null) {
    let label = "Year";

    if (filters.minYear !== null && filters.maxYear !== null) {
      label = `Year: ${filters.minYear} - ${filters.maxYear}`;
    } else if (filters.minYear !== null) {
      label = `Year: From ${filters.minYear}`;
    } else if (filters.maxYear !== null) {
      label = `Year: Up to ${filters.maxYear}`;
    }

    activeFilterChips.push({
      key: "year",
      label,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      onRemove: removeYearFilter,
    });
  }

  if (filters.minKm !== null || filters.maxKm !== null) {
    let label = "KM";

    if (filters.minKm !== null && filters.maxKm !== null) {
      label = `KM: ${formatNumber(filters.minKm)} - ${formatNumber(filters.maxKm)} km`;
    } else if (filters.minKm !== null) {
      label = `KM: From ${formatNumber(filters.minKm)} km`;
    } else if (filters.maxKm !== null) {
      label = `KM: Under ${formatNumber(filters.maxKm)} km`;
    }

    activeFilterChips.push({
      key: "km",
      label,
      className: "border-amber-200 bg-amber-50 text-amber-700",
      onRemove: removeKmFilter,
    });
  }

  if (filters.sort && filters.sort !== "newest") {
    const sortMap = {
      price_asc: "Sort: Price ↑",
      price_desc: "Sort: Price ↓",
      year_desc: "Sort: Year ↓",
      year_asc: "Sort: Year ↑",
      mileage_asc: "Sort: Mileage ↑",
    };

    activeFilterChips.push({
      key: "sort",
      label: sortMap[filters.sort] || `Sort: ${sortLabelMap[filters.sort] || filters.sort}`,
      className: "border-slate-200 bg-slate-100 text-slate-700",
      onRemove: () => updateFilter("sort", "newest"),
    });
  }

  const activeFilterCount = activeFilterChips.length;

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
            {isUserVerified(user) && (
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
        <div className="mb-5 md:mb-6 flex gap-2 md:gap-4 flex-col md:flex-row">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <Input
              placeholder="Search by make, model, or name..."
              className="pl-9 md:pl-10 h-10 md:h-12 text-sm md:text-base border-gray-300 focus:border-blue focus:ring-blue"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Active filters</p>
                <p className="text-xs text-slate-500">Click a chip to remove it</p>
              </div>
              <button
                type="button"
                onClick={clearAllFilters}
                className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/15"
              >
                Clear All ({activeFilterCount})
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${chip.className}`}
                >
                  <span>{chip.label}</span>
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className="flex flex-col gap-6">
          <section className="mb-4 flex flex-col gap-3 rounded-xl border border-emerald-100 border-l-4 border-l-emerald-500 bg-white px-5 py-3 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-sm font-bold text-slate-900">
                Showing <span className="text-emerald-600">{Number(publicPagination?.count ?? publicVehicles.length ?? 0).toLocaleString("en-IN")}</span> vehicles
              </p>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-emerald-600" />
                <label className="text-sm font-medium text-slate-600">Sort by:</label>
              </div>

              <div className="relative">
                <select
                  value={filters.sort || "newest"}
                  onChange={(e) => handleSidebarFiltersChange({ ...filters, sort: e.target.value })}
                  className="appearance-none rounded-lg border-2 border-emerald-200 bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-800 outline-none transition-all duration-200 hover:border-emerald-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
                >
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price (Low to High)</option>
                  <option value="price_desc">Price (High to Low)</option>
                  <option value="year_asc">Year (Asc)</option>
                  <option value="year_desc">Year (Desc)</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex gap-1 rounded-lg bg-emerald-50/50 p-1">
                <button
                  onClick={() => handleViewModeChange("grid")}
                  className={`rounded-lg p-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${effectiveViewMode === "grid" ? "bg-emerald-500 text-white shadow-md" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid
                    size={18}
                    strokeWidth={2.5}
                    style={{ color: effectiveViewMode === "grid" ? "#ffffff" : "#0f766e" }}
                  />
                </button>
                <button
                  onClick={() => handleViewModeChange("list")}
                  className={`rounded-lg p-2 transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${effectiveViewMode === "list" ? "bg-emerald-500 text-white shadow-md" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                  aria-label="List view"
                >
                  <List
                    size={18}
                    strokeWidth={2.5}
                    style={{ color: effectiveViewMode === "list" ? "#ffffff" : "#0f766e" }}
                  />
                </button>
              </div>

              <button
                onClick={() => setIsFiltersOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg border-2 border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-semibold text-emerald-700 transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-100 focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
              >
                <SlidersHorizontal size={18} strokeWidth={2.5} className="shrink-0 text-emerald-700" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </section>

          <section className="order-1 min-w-0 flex-1 xl:order-2">
            {/* Grid */}
            {loading && publicVehicles.length === 0 ? (
              <div className="flex justify-center items-center h-48 md:h-64">
                <div className="animate-spin rounded-full h-10 md:h-12 w-10 md:w-12 border-b-2 border-blue"></div>
              </div>
            ) : !publicVehicles || publicVehicles.length === 0 ? (
              <div className="text-center py-12 md:py-16 bg-white rounded-xl border border-dashed border-gray-300 px-4">
                <Car className="w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-3 md:mb-4" />
                <h3 className="text-lg md:text-xl font-medium text-gray-900">No vehicles found</h3>
                <p className="text-sm md:text-base text-gray-500 mt-2">Try adjusting your search terms</p>
              </div>
            ) : effectiveViewMode === "list" ? (
              <div className="space-y-3 pb-12">
                {publicVehicles.map((vehicle) => {
                  const imageIndex = imageIndices[vehicle.id] || 0;
                  const imagePath = Array.isArray(vehicle.images) && vehicle.images.length > 0 ? vehicle.images[imageIndex] : null;

                  return (
                    <VehicleListRow
                      key={vehicle.id}
                      vehicle={vehicle}
                      imageUrl={imagePath ? getImageUrl(imagePath) : ""}
                      isFavorite={isFavorite}
                      onFavoriteToggle={handleFavoriteToggle}
                      onViewDetails={(selectedVehicle) => navigate(`/vehicles/public/${selectedVehicle.id}`)}
                      onCompare={handleCompare}
                      isInComparison={isVehicleInComparison}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-12">
                {publicVehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="bg-white rounded-xl md:rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 group flex flex-col"
                  >
                    {/* Image Carousel */}
                    <div className="relative h-48 md:h-64 bg-gray-100 overflow-hidden">
                      <button
                        type="button"
                        onClick={(event) => handleFavoriteToggle(event, vehicle.id)}
                        className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-2 text-slate-600 backdrop-blur transition-transform active:scale-90"
                        aria-label={isFavorite(vehicle.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors ${
                            isFavorite(vehicle.id)
                              ? "fill-red-500 text-red-500"
                              : "fill-white text-slate-600"
                          }`}
                        />
                      </button>

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
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrevImage(vehicle.id, vehicle.images.length);
                                }}
                                className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 p-1 md:p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                              >
                                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleNextImage(vehicle.id, vehicle.images.length);
                                }}
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
                      <div
                        className={`absolute top-2 md:top-4 left-2 md:left-4 inline-flex items-center gap-1 rounded-full px-2 md:px-3 py-1 md:py-1.5 text-xs font-semibold shadow-md ${
                          vehicle.condition === "sold"
                            ? "bg-red-600 text-white"
                            : vehicle.condition === "reserved" || vehicle.condition === "pending"
                              ? "bg-amber-600 text-white"
                              : "bg-black text-white"
                        }`}
                      >
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-white" />
                        {vehicle.condition === "sold"
                          ? "Sold"
                          : vehicle.condition === "reserved" || vehicle.condition === "pending"
                            ? "Reserved"
                            : "Available"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-5 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1">{vehicle.name}</h3>
                          <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                            {vehicle.make} {vehicle.model} • {vehicle.year}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-lg md:text-xl font-black text-blue whitespace-nowrap">
                            Rs. {parseFloat(vehicle.price)?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 md:gap-3 my-3 md:my-4 text-xs md:text-sm">
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 min-h-14 md:min-h-16 flex flex-col justify-center">
                          <span className="text-gray-500 text-xs block mb-1">Mileage</span>
                          <span className="font-semibold text-gray-900 line-clamp-1 text-xs md:text-sm">
                            {vehicle.mileage ? `${vehicle.mileage} km` : "N/A"}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 min-h-14 md:min-h-16 flex flex-col justify-center">
                          <span className="text-gray-500 text-xs block mb-1">Fuel</span>
                          <span className="font-semibold text-gray-900 capitalize line-clamp-1 text-xs md:text-sm">
                            {vehicle.fuelType || "N/A"}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 min-h-14 md:min-h-16 flex flex-col justify-center">
                          <span className="text-gray-500 text-xs block mb-1">Trans.</span>
                          <span className="font-semibold text-gray-900 capitalize line-clamp-1 text-xs md:text-sm">
                            {vehicle.transmission || "N/A"}
                          </span>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 min-h-14 md:min-h-16 flex flex-col justify-center">
                          <span className="text-gray-500 text-xs block mb-1">Location</span>
                          <span className="font-semibold text-gray-900 line-clamp-1 text-xs md:text-sm">
                            {vehicle.location || "N/A"}
                          </span>
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
                          className={`flex-1 font-semibold transition-all hover:scale-105 text-xs md:text-sm ${
                            isVehicleInComparison(vehicle.id) ? "bg-blue text-white" : ""
                          }`}
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
          </section>
        </div>
      </main>

      <Footer />

      {/* Filters Drawer Overlay */}
      {isFiltersOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsFiltersOpen(false)} />

          <aside className="relative z-50 h-full w-[90%] sm:w-[380px] bg-white shadow-2xl overflow-hidden flex flex-col">
            <header className="flex-shrink-0 border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">Filters</h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    clearAllFilters();
                  }}
                  className="text-sm text-slate-600"
                >
                  Clear all
                </button>
                <button type="button" onClick={() => setIsFiltersOpen(false)} className="p-2 text-slate-500 hover:text-slate-900">
                  <X />
                </button>
              </div>
            </header>

            <main className="flex-1 overflow-y-auto px-6 py-4">
              <FilterSidebar
                onChange={handleSidebarFiltersChange}
                vehicles={publicVehicles}
                filters={filters}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                showViewToggle={!isMobile}
                showControls={false}
                allowCollapse={false}
                embedded={true}
              />
            </main>

            <footer className="flex-shrink-0 border-t px-6 py-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  clearAllFilters();
                }}
                className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsFiltersOpen(false)}
                className="flex-1 rounded-lg bg-blue text-white px-4 py-2 text-sm"
              >
                Show {publicPagination?.count || publicVehicles.length} vehicles
              </button>
            </footer>
          </aside>
        </div>
      )}

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
            {activeCommentVehicle && <CommentSection vehicleId={activeCommentVehicle.id} isOwner={false} />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparison Drawer */}
      <ComparisonDrawer isOpen={isComparisonDrawerOpen} onToggle={setIsComparisonDrawerOpen} />
    </div>
  );
};

export default VehicleCatalog;
