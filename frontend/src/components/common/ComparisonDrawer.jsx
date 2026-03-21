import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { X, Zap, Info, Scale } from "lucide-react";
import { Button } from "../../ui/ui/button";
import { clearComparison, removeFromComparison } from "../../rtk/slice/comparisonSlice";
import ComparisonTable from "./ComparisonTable";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath.replace(/\\/g, "/")}`;
};

const ComparisonDrawer = ({ isOpen, onToggle }) => {
  const dispatch = useDispatch();
  const { comparedVehicles } = useSelector((state) => state.comparison);
  const [showTip, setShowTip] = useState(true);

  if (!isOpen && comparedVehicles.length === 0) {
    return null;
  }

  if (!isOpen && comparedVehicles.length > 0) {
    return (
      <button
        onClick={() => onToggle(true)}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition px-4 py-3 flex items-center gap-2"
        aria-label={`Open vehicle comparison with ${comparedVehicles.length} vehicles`}
      >
        <Scale className="w-4 h-4" />
        <span className="text-sm font-semibold">Compare ({comparedVehicles.length})</span>
      </button>
    );
  }

  const handleRemove = (vehicleId) => {
    dispatch(removeFromComparison(vehicleId));
  };

  const handleClearAll = () => {
    if (window.confirm("Clear all vehicles from comparison?")) {
      dispatch(clearComparison());
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[2px]"
        onClick={() => onToggle(false)}
        aria-hidden="true"
      />

      <div className="fixed z-50 inset-x-0 bottom-0 top-[9%] md:top-[8%] md:bottom-[8%] md:inset-x-[4%] lg:inset-x-[10%] bg-white rounded-t-2xl md:rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col">
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Zap className="w-5 h-5 text-blue-700" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-base md:text-lg">Compare Vehicles</h3>
              <p className="text-xs text-gray-500">{comparedVehicles.length} selected</p>
            </div>
          </div>
          <button
            onClick={() => onToggle(false)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            aria-label="Close comparison"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-gray-50">
          {comparedVehicles.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center">
                <Zap className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold">No Vehicles Selected</p>
                <p className="text-sm text-gray-500 mt-1">Add 2-4 vehicles to compare.</p>
              </div>
            </div>
          ) : (
            <>
              {showTip && (
                <div className="bg-blue-50 border border-blue-200 p-3 md:p-4 mx-4 md:mx-6 mt-4 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-blue-900 font-semibold">Tip</p>
                    <p className="text-xs text-blue-800 mt-1">Best value rows are highlighted in green.</p>
                  </div>
                  <button onClick={() => setShowTip(false)} className="text-blue-500 hover:text-blue-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="mt-4 px-4 md:px-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Selected Vehicles</h4>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {comparedVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="min-w-[170px] bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
                      <div className="relative h-20 bg-gray-100">
                        {vehicle.images && vehicle.images.length > 0 && (
                          <img
                            src={getImageUrl(vehicle.images[0])}
                            alt={vehicle.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <button
                          onClick={() => handleRemove(vehicle.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 text-red-600 rounded-md hover:bg-white"
                          aria-label={`Remove ${vehicle.name}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="p-2.5">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{vehicle.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{vehicle.make} {vehicle.model}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="m-4 md:m-6">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <ComparisonTable vehicles={comparedVehicles} onRemove={handleRemove} />
                </div>
              </div>
            </>
          )}
        </div>

        {comparedVehicles.length > 0 && (
          <div className="border-t border-gray-200 bg-white p-3 md:p-4 flex items-center justify-between gap-3">
            <p className="text-xs md:text-sm text-gray-600">Maximum 4 vehicles</p>
            <div className="flex gap-2">
              <Button
                onClick={() => onToggle(false)}
                variant="outline"
                className="h-10 text-sm"
              >
                Close
              </Button>
              <Button
                onClick={handleClearAll}
                className="h-10 bg-red-600 hover:bg-red-700 text-white text-sm"
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ComparisonDrawer;
