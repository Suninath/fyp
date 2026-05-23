import React, { useState } from "react";
import {
  Car,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Heart,
  MessageSquare,
  Scale,
  Trash2,
} from "lucide-react";
import { Button } from "../../ui/ui/button";
import useFavorites from "../../hooks/useFavorites";

const getConditionMeta = (condition) => {
  if (condition === "sold") {
    return { label: "Sold", className: "bg-red-600 text-white" };
  }

  if (condition === "reserved" || condition === "pending") {
    return { label: "Reserved", className: "bg-amber-600 text-white" };
  }

  return { label: "Available", className: "bg-black text-white" };
};

const formatMileage = (value) => {
  if (value === null || value === undefined || value === "") return "N/A";
  const numericValue = Number(value);
   if (!Number.isFinite(numericValue)) return `${value} Km`;
   return `${numericValue.toLocaleString("en-IN")} Km`;
};

const formatCapitalized = (value) => {
  if (!value) return "N/A";
  return String(value).charAt(0).toUpperCase() + String(value).slice(1);
};

const formatLocation = (value) => {
  if (!value) return "N/A";
  // Ensure a space after commas, trim surrounding whitespace
  return String(value).replace(/\s*,\s*/g, ", ").trim();
};

const VehicleCard = ({
  vehicle,
  variant = "grid",
  getImageUrl,
  onView,
  onCompare,
  onEdit,
  onDelete,
  onComment,
  onContact,
  isInComparison = false,
  showFavorite,
  showActions,
  showOwnerActions,
  showContactAction,
  showCommentAction,
  showCompareAction,
  showImage,
  showDescription,
  description,
}) => {
  const [currentImage, setCurrentImage] = useState(0);
  const { toggleFavorite, isFavorite } = useFavorites();

  const images = Array.isArray(vehicle?.images) ? vehicle.images : [];
  const favorite = isFavorite(vehicle?.id);
  const conditionMeta = getConditionMeta(vehicle?.condition);

  const shouldShowImage = showImage ?? true;
  const shouldShowFavorite = showFavorite ?? variant !== "owner";
  const isListVariant = variant === "list";
  const isGridVariant = variant === "grid" || variant === "listing";
  const shouldShowActions = showActions ?? isGridVariant;
  const shouldShowOwnerActions = showOwnerActions ?? variant === "owner";
  const shouldShowContactAction = showContactAction ?? variant === "detail";
  const shouldShowCommentAction = showCommentAction ?? variant === "owner";
  const shouldShowCompareAction = showCompareAction ?? variant === "detail";
  const shouldShowDescription = showDescription ?? (variant === "detail" || variant === "owner");

  const imageSource = images.length > 0 ? getImageUrl(images[currentImage]) : null;

  const prev = (e) => {
    e?.stopPropagation();
    setCurrentImage((index) => (index === 0 ? images.length - 1 : index - 1));
  };

  const next = (e) => {
    e?.stopPropagation();
    setCurrentImage((index) => (images.length === 0 ? 0 : (index + 1) % images.length));
  };

  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    toggleFavorite(vehicle.id);
  };

  const handleActionClick = (e, handler, payload) => {
    e.stopPropagation();
    handler?.(payload ?? vehicle);
  };

  const specItems = [
    { label: "Mileage", value: formatMileage(vehicle?.mileage) },
    { label: "Fuel", value: formatCapitalized(vehicle?.fuelType) },
    { label: "Trans", value: formatCapitalized(vehicle?.transmission) },
    { label: "Location", value: formatLocation(vehicle?.location) },
  ];

  const cardDescription = description ?? vehicle?.description;
  // Always use 2 columns for a consistent 2x2 layout across variants
  const specGridColumns = "grid-cols-2";

  const renderImageArea = () => {
    if (!shouldShowImage) {
      return (
        <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-5 sm:p-6">
          <div className="absolute left-4 top-4 z-10">
              <span className={`absolute top-3 left-3 z-10 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-md ${conditionMeta.className}`}>
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white" />
              {conditionMeta.label}
            </span>
          </div>

          {shouldShowFavorite && (
            <button
              type="button"
              onClick={handleFavoriteToggle}
              className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-2 text-slate-600 backdrop-blur transition-transform active:scale-90"
              aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={`h-4 w-4 transition-colors ${favorite ? "fill-red-500 text-red-500" : "fill-white text-slate-600"}`}
              />
            </button>
          )}

          <div className="h-16 w-full" />
        </div>
      );
    }

    return (
      <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-200 to-slate-300 aspect-[4/3]">
        {imageSource ? (
          <>
            <div className="h-full w-full overflow-hidden">
              <img
                src={imageSource}
                alt={vehicle?.name}
                className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
                }}
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 via-transparent to-transparent opacity-40" />

            {shouldShowFavorite && (
              <button
                type="button"
                onClick={handleFavoriteToggle}
                className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-2 text-slate-600 backdrop-blur transition-transform active:scale-90"
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${favorite ? "fill-red-500 text-red-500" : "fill-white text-slate-600"}`}
                />
              </button>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur transition-transform hover:bg-white active:scale-90"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4 text-slate-700" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-0 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-1.5 shadow-md backdrop-blur transition-transform hover:bg-white active:scale-90"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4 text-slate-700" />
                </button>
              </>
            )}

            {images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2">
                <div className="rounded-full bg-emerald-900/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md border border-white/20 shadow-sm">
                  {currentImage + 1} / {images.length}
                </div>
              </div>
            )}

            <div className="absolute left-3 top-3 z-10">
                <span className={`absolute top-3 left-3 z-10 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-md ${conditionMeta.className}`}>
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white" />
                {conditionMeta.label}
              </span>
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-secondary">
            <Car className="h-24 w-24 text-white opacity-40" />
            {shouldShowFavorite && (
              <button
                type="button"
                onClick={handleFavoriteToggle}
                className="absolute right-3 top-3 z-20 rounded-full bg-white/80 p-2 text-slate-600 backdrop-blur transition-transform active:scale-90"
                aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart
                  className={`h-4 w-4 transition-colors ${favorite ? "fill-red-500 text-red-500" : "fill-white text-slate-600"}`}
                />
              </button>
            )}
            <div className="absolute left-3 top-3 z-10">
                <span className={`absolute top-3 left-3 z-10 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-md ${conditionMeta.className}`}>
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-white" />
                {conditionMeta.label}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = () => {
    const buttons = [];

    if (shouldShowContactAction && onContact) {
      buttons.push(
        <Button
          key="contact"
          size="sm"
          variant="info"
          onClick={(e) => handleActionClick(e, onContact)}
          className="h-9 rounded-lg bg-secondary px-4 text-sm font-semibold text-white hover:bg-secondary-600"
        >
          <MessageSquare className="mr-1 h-4 w-4" />
          Contact
        </Button>,
      );
    }

    if (shouldShowActions && onView) {
      buttons.push(
        <Button
          key="details"
          size="sm"
          variant="info"
          onClick={(e) => handleActionClick(e, onView, vehicle.id)}
          className="h-9 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-700"
        >
          <Eye className="mr-1 h-4 w-4" />
          Details
        </Button>,
      );
    }

    if ((shouldShowActions || shouldShowCompareAction) && onCompare) {
      buttons.push(
        <Button
          key="compare"
          size="sm"
          variant={isInComparison ? "default" : "outline"}
          onClick={(e) => handleActionClick(e, onCompare, vehicle)}
          className={`h-9 rounded-lg px-4 text-sm font-semibold ${isInComparison ? "bg-secondary text-white hover:bg-secondary-700" : "border border-emerald-200 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50"}`}
        >
          <Scale className="mr-1 h-4 w-4" />
          {isInComparison ? "Remove" : "Compare"}
        </Button>,
      );
    }

    if (shouldShowCommentAction && onComment) {
      buttons.push(
        <Button
          key="comment"
          size="sm"
          variant="success"
          onClick={(e) => handleActionClick(e, onComment, vehicle)}
          className="h-9 rounded-lg px-4 text-sm font-semibold"
        >
          <MessageSquare className="mr-1 h-4 w-4" />
          Comments
        </Button>,
      );
    }

    if (shouldShowOwnerActions) {
      if (onEdit) {
        buttons.push(
          <Button
            key="edit"
            size="sm"
            variant="info"
            onClick={(e) => handleActionClick(e, onEdit, vehicle)}
            className="h-9 rounded-lg px-4 text-sm font-semibold"
          >
            <Edit className="mr-1 h-4 w-4" />
            Edit
          </Button>,
        );
      }

      if (onDelete) {
        buttons.push(
          <Button
            key="delete"
            size="sm"
            variant="destructive"
            onClick={(e) => handleActionClick(e, onDelete, vehicle)}
            className="h-9 rounded-lg px-4 text-sm font-semibold"
          >
            <Trash2 className="h-4 w-4" />
          </Button>,
        );
      }
    }

    if (buttons.length === 0) return null;

    return (
      <div className={`flex flex-wrap items-center gap-2 pt-1 sm:pt-2 ${isListVariant ? "xl:justify-end" : "mt-auto"}`}>
        {buttons}
      </div>
    );
  };

  const renderGridContent = () => (
    <div className="p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3 md:space-y-3.5 flex-grow flex flex-col">
      <div>
        <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">{vehicle?.name}</h3>
        <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
          {vehicle?.year} • {vehicle?.make}
        </p>
      </div>

      <div className="py-2 sm:py-2.5 px-3 border-l-4 border-primary bg-primary/5 rounded">
        <p className="text-[9px] sm:text-[10px] text-primary font-bold uppercase tracking-wider mb-0.5">Price</p>
        <p className="text-base sm:text-lg md:text-xl font-black text-primary leading-tight">
          Rs. {parseFloat(vehicle?.price)?.toLocaleString("en-IN")}
        </p>
      </div>

      <div className={`grid ${specGridColumns} gap-3 items-stretch`}> 
        {specItems.map((spec) => {
          // reuse existing primary (teal) shade used by Price container
          const accentClass = "border-t-2 border-primary bg-primary/5";

          return (
            <div key={spec.label} className={`${accentClass} min-w-0 h-full rounded p-3`}> 
              <p className="text-[9px] sm:text-[10px] font-bold uppercase text-primary">{spec.label}</p>
              <p className="mt-1 whitespace-normal text-sm font-bold text-slate-800">{spec.value}</p>
            </div>
          );
        })}
      </div>

      {shouldShowDescription && cardDescription && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-relaxed text-slate-700">
          <p className="text-[9px] sm:text-[10px] font-bold uppercase text-emerald-700">DESCRIPTION</p>
          {variant === "detail" ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{cardDescription}</p>
          ) : (
            <p className="mt-2 text-sm text-slate-600 line-clamp-2 leading-relaxed">{cardDescription}</p>
          )}
        </div>
      )}

      {renderActionButtons()}
    </div>
  );

  return (
    <div
      className="group w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300 hover:shadow-emerald-100"
    >
      {renderImageArea()}
      {renderGridContent()}
    </div>
  );
};

export default VehicleCard;