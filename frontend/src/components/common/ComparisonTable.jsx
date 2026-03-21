import React, { useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

const ComparisonTable = ({ vehicles = [], onRemove }) => {
  const [expandedSpecs, setExpandedSpecs] = useState({
    basic: true,
    performance: true,
    features: true,
  });

  const toggleSpec = (section) => {
    setExpandedSpecs(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const specGroups = {
    basic: {
      title: "Basic Information",
      icon: "📋",
      specs: [
        { label: "Make", key: "make" },
        { label: "Model", key: "model" },
        { label: "Year", key: "year" },
        { label: "Category", key: "category" },
        { label: "Price", key: "price", format: (val) => `Rs. ${val?.toLocaleString()}` },
      ]
    },
    performance: {
      title: "Performance & Specs",
      icon: "⚙️",
      specs: [
        { label: "Mileage", key: "mileage", format: (val) => `${val?.toLocaleString() || 'N/A'} km` },
        { label: "Transmission", key: "transmission" },
        { label: "Fuel Type", key: "fuelType" },
        { label: "Engine", key: "engine" },
        { label: "Top Speed", key: "topSpeed" },
      ]
    },
    features: {
      title: "Features & Safety",
      icon: "✨",
      specs: [
        { label: "Condition", key: "condition" },
        { label: "Seats", key: "seats" },
        { label: "Color", key: "color" },
        { label: "Registration", key: "registration" },
      ]
    }
  };

  const getRawValue = (vehicle, spec) => {
    return vehicle[spec.key];
  };

  const getValueAtIndex = (vehicle, spec) => {
    const value = vehicle[spec.key];
    if (spec.format) {
      return spec.format(value);
    }
    return value || 'N/A';
  };

  const getHighlightClass = (spec, values, vehicleValue) => {
    // For numeric values (price, mileage), highlight min as best
    if (['price', 'mileage'].includes(spec.key)) {
      const numValues = values.map(v => {
        if (typeof v === 'number') return v;
        const num = parseInt(v);
        return isNaN(num) ? Infinity : num;
      }).filter(v => v !== Infinity);
      
      if (numValues.length === 0) return '';
      
      const minVal = Math.min(...numValues);
      if (minVal !== Infinity) {
        const numVal = typeof vehicleValue === 'number' ? vehicleValue : parseInt(vehicleValue);
        return !isNaN(numVal) && numVal === minVal ? 'bg-green-50 border-l-4 border-green-500' : '';
      }
    }
    return '';
  };


  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="p-6 md:p-8 text-center bg-gray-50">
        <p className="text-gray-500 text-base md:text-lg font-semibold mb-2">📭 No Vehicles to Compare</p>
        <p className="text-gray-400 text-sm">Add 2-4 vehicles to see a detailed comparison</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      {/* Mobile-first stacked comparison */}
      <div className="md:hidden">
        {Object.entries(specGroups).map(([groupKey, group]) => {
          const specsToShow = group.specs.filter((spec) =>
            vehicles.some((v) => v[spec.key] !== undefined && v[spec.key] !== null),
          );

          if (specsToShow.length === 0) return null;

          return (
            <section key={groupKey} className="border-b border-gray-200">
              <button
                onClick={() => toggleSpec(groupKey)}
                className="w-full bg-slate-800 text-white px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{group.icon}</span>
                  <div className="text-left">
                    <h3 className="font-semibold text-sm">{group.title}</h3>
                    <p className="text-xs text-slate-300">{specsToShow.length} specs</p>
                  </div>
                </div>
                {expandedSpecs[groupKey] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {expandedSpecs[groupKey] && (
                <div className="p-3 space-y-3 bg-slate-50">
                  {specsToShow.map((spec) => {
                    const values = vehicles.map((v) => getRawValue(v, spec));
                    return (
                      <div key={`${groupKey}-${spec.key}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
                          <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">{spec.label}</p>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {vehicles.map((vehicle) => {
                            const rawValue = getRawValue(vehicle, spec);
                            const value = getValueAtIndex(vehicle, spec);
                            const highlightClass = getHighlightClass(spec, values, rawValue);
                            return (
                              <div key={`${vehicle.id}-${groupKey}-${spec.key}`} className={`px-3 py-2 flex items-center justify-between gap-3 ${highlightClass}`}>
                                <span className="text-xs text-gray-600 max-w-[45%] truncate">{vehicle.name}</span>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">{value}</p>
                                  {['price', 'mileage'].includes(spec.key) && highlightClass && (
                                    <p className="text-[11px] text-green-700 font-medium">Best value</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Desktop comparison table */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-full">
          {Object.entries(specGroups).map(([groupKey, group]) => {
            const specsToShow = group.specs.filter((spec) =>
              vehicles.some((v) => v[spec.key] !== undefined && v[spec.key] !== null),
            );

            if (specsToShow.length === 0) return null;

            return (
              <div key={groupKey} className="mb-0">
                <button
                  onClick={() => toggleSpec(groupKey)}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 md:px-6 py-3 md:py-4 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="text-lg md:text-2xl">{group.icon}</span>
                    <div className="text-left">
                      <h3 className="font-bold text-sm md:text-base">{group.title}</h3>
                      <p className="text-xs text-slate-300">{specsToShow.length} specs</p>
                    </div>
                  </div>
                  <span className="p-1 hover:bg-white/20 rounded transition" aria-hidden="true">
                    {expandedSpecs[groupKey] ? (
                      <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </span>
                </button>

                {expandedSpecs[groupKey] && (
                  <div className="border-b border-gray-200">
                    <table className="w-full text-xs md:text-sm">
                      <tbody>
                        {specsToShow.map((spec, idx) => {
                          const values = vehicles.map((v) => getRawValue(v, spec));

                          return (
                            <tr
                              key={`${groupKey}-${spec.key}`}
                              className={`border-b border-gray-100 hover:bg-slate-50 transition ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                              <td className="px-3 md:px-4 py-3 md:py-4 font-semibold text-gray-900 bg-gray-50 sticky left-0 z-10 min-w-36 md:min-w-44 whitespace-nowrap">
                                <span className="text-slate-700">{spec.label}</span>
                              </td>

                              {vehicles.map((vehicle) => {
                                const value = getValueAtIndex(vehicle, spec);
                                const rawValue = getRawValue(vehicle, spec);
                                const highlightClass = getHighlightClass(spec, values, rawValue);

                                return (
                                  <td
                                    key={`${vehicle.id}-${spec.key}`}
                                    className={`px-2 md:px-4 py-3 md:py-4 text-center min-w-36 md:min-w-44 font-medium transition ${highlightClass}`}
                                  >
                                    <div className={`${highlightClass ? 'font-bold text-green-700' : 'text-gray-900'}`}>{value}</div>
                                    {['price', 'mileage'].includes(spec.key) && highlightClass && (
                                      <div className="text-xs text-green-600 flex items-center justify-center gap-1 mt-1">
                                        <Plus className="w-3 h-3" />
                                        {spec.key === 'price' ? 'Best Price' : 'Lowest Mileage'}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-200 px-4 md:px-6 py-4 md:py-6">
        <div className="flex items-start gap-2 md:gap-3">
          <span className="text-lg md:text-2xl flex-shrink-0">💡</span>
          <div>
            <p className="font-bold text-gray-900 text-sm md:text-base mb-2">Comparison Insight</p>
            <ul className="text-xs md:text-sm text-gray-700 space-y-1">
              <li className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <strong>Green highlights</strong> indicate best value (lowest price/mileage)
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                Expand sections to focus only on the specs you care about
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
