import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";

const fuels = ["Petrol", "Diesel", "Electric", "Hybrid", "CNG", "LPG"];
const transmissions = ["Manual", "Automatic", "CVT", "AMT"];
const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Year: Newest First", value: "year_desc" },
  { label: "Year: Oldest First", value: "year_asc" },
  { label: "Mileage: Lowest", value: "mileage_asc" },
];
const budgetPresets = [
  { label: "Under 5L", minPrice: "", maxPrice: "500000" },
  { label: "5-10L", minPrice: "500000", maxPrice: "1000000" },
  { label: "10-20L", minPrice: "1000000", maxPrice: "2000000" },
  { label: "20-50L", minPrice: "2000000", maxPrice: "5000000" },
  { label: "50L+", minPrice: "5000000", maxPrice: "" },
];
const YEAR_MIN = 1990;
const YEAR_MAX = new Date().getFullYear();

const CollapsibleSection = ({ title, count, isOpen, onToggle, badgeClassName = "bg-emerald-500 text-white", children }) => {
  return (
    <div>
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={isOpen}>
        <span className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-900">{title}</span>
          {count > 0 && <span className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${badgeClassName}`}>{count}</span>}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>

      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[1000px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0 pointer-events-none"}`}>
        {children}
      </div>
    </div>
  );
};

const FilterSidebar = ({
  onChange,
  vehicles = [],
  filters,
  viewMode = "grid",
  onViewModeChange,
  showViewToggle = true,
  showControls = true,
  allowCollapse = true,
  embedded = false,
}) => {
  const [brand, setBrand] = useState([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [fuel, setFuel] = useState([]);
  const [sort, setSort] = useState("newest");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [transmission, setTransmission] = useState([]);
  const [minKm, setMinKm] = useState("");
  const [maxKm, setMaxKm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [isDesktop, setIsDesktop] = useState(false);
  const lastSyncedFiltersRef = useRef("");

  const [openSections, setOpenSections] = useState({
    brand: true,
    fuel: true,
    year: false,
    mileage: false,
    price: false,
    transmission: false,
  });

  const normalizeMulti = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean).map(String);
    if (typeof value === "string" && value.trim()) return value.split(",").map((item) => item.trim()).filter(Boolean);
    if (value === null || value === undefined || value === "") return [];
    return [String(value)];
  };

  useEffect(() => {
    if (!filters) return;

    const nextSignature = JSON.stringify({
      brand: normalizeMulti(filters.brand),
      fuel: normalizeMulti(filters.fuel),
      sort: filters.sort ?? "newest",
      minYear: filters.minYear ?? null,
      maxYear: filters.maxYear ?? null,
      transmission: normalizeMulti(filters.transmission),
      minKm: filters.minKm ?? null,
      maxKm: filters.maxKm ?? null,
      minPrice: filters.minPrice ?? null,
      maxPrice: filters.maxPrice ?? null,
    });

    if (lastSyncedFiltersRef.current === nextSignature) return;
    lastSyncedFiltersRef.current = nextSignature;

    setBrand(normalizeMulti(filters.brand));
    setFuel(normalizeMulti(filters.fuel));
    setSort(filters.sort ?? "newest");
    setMinYear(filters.minYear !== undefined && filters.minYear !== null ? String(filters.minYear) : "");
    setMaxYear(filters.maxYear !== undefined && filters.maxYear !== null ? String(filters.maxYear) : "");
    setTransmission(normalizeMulti(filters.transmission));
    setMinKm(filters.minKm !== undefined && filters.minKm !== null ? String(filters.minKm) : "");
    setMaxKm(filters.maxKm !== undefined && filters.maxKm !== null ? String(filters.maxKm) : "");
    setMinPrice(filters.minPrice !== undefined && filters.minPrice !== null ? String(filters.minPrice) : "");
    setMaxPrice(filters.maxPrice !== undefined && filters.maxPrice !== null ? String(filters.maxPrice) : "");
  }, [filters]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(min-width: 1280px)");
    const updateViewport = () => setIsDesktop(mediaQuery.matches);
    updateViewport();
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateViewport);
      return () => mediaQuery.removeEventListener("change", updateViewport);
    }
    mediaQuery.addListener(updateViewport);
    return () => mediaQuery.removeListener(updateViewport);
  }, []);

  const brands = useMemo(() => [...new Set(vehicles.map((vehicle) => vehicle.brand ?? vehicle.make ?? vehicle.brandName).filter(Boolean))].sort(), [vehicles]);

  const filteredBrands = useMemo(() => {
    if (!brandSearch.trim()) return brands;
    return brands.filter((value) => value.toLowerCase().includes(brandSearch.toLowerCase()));
  }, [brandSearch, brands]);

  const toNullableInt = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = parseInt(String(value), 10);
    return Number.isNaN(parsed) ? null : parsed;
  };

  const toggleMultiValue = (setter, currentValues, value) => {
    setter(currentValues.includes(value) ? currentValues.filter((item) => item !== value) : [...currentValues, value]);
  };

  const activeFilterCount = brand.length + fuel.length + transmission.length + [minPrice, maxPrice, minYear, maxYear, minKm, maxKm].filter((item) => item !== null && item !== "").length + (sort !== "newest" ? 1 : 0);

  const sectionCounts = {
    brand: brand.length,
    fuel: fuel.length,
    year: [minYear, maxYear].filter(Boolean).length,
    mileage: [minKm, maxKm].filter(Boolean).length,
    price: [minPrice, maxPrice].filter(Boolean).length,
    transmission: transmission.length,
  };

  useEffect(() => {
    onChange({
      brand,
      fuel,
      minPrice: toNullableInt(minPrice),
      maxPrice: toNullableInt(maxPrice),
      minYear: toNullableInt(minYear),
      maxYear: toNullableInt(maxYear),
      transmission,
      minKm: toNullableInt(minKm),
      maxKm: toNullableInt(maxKm),
      sort,
    });
  }, [brand, fuel, minPrice, maxPrice, minYear, maxYear, transmission, minKm, maxKm, sort, onChange]);

  const clearFilters = () => {
    setBrand([]);
    setBrandSearch("");
    setFuel([]);
    setSort("newest");
    setMinYear("");
    setMaxYear("");
    setTransmission([]);
    setMinKm("");
    setMaxKm("");
    setMinPrice("");
    setMaxPrice("");
  };

  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  const setBudgetPreset = (preset) => {
    setMinPrice(preset.minPrice);
    setMaxPrice(preset.maxPrice);
  };

  const rootClass = embedded ? "flex h-full flex-col" : "flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";

  return (
    <div className={rootClass}>
      {!embedded && (
        <div className="border-b px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">Filters</p>
              <h2 className="text-lg font-bold text-slate-900">Advanced Search</h2>
            </div>
            {isDesktop && allowCollapse && (
              <button type="button" className="rounded-lg border border-slate-200 p-2 text-slate-500">
                <ChevronUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}>
        <div className="space-y-6">
          <CollapsibleSection title="Brand" count={sectionCounts.brand} isOpen={openSections.brand} onToggle={() => toggleSection("brand")}>
            <div className="relative mb-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search brands"
                className="w-full rounded-lg border-2 border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
              />
              {brandSearch.trim() && (
                <button type="button" onClick={() => setBrandSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto pr-1">
              {filteredBrands.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {filteredBrands.map((value) => {
                    const isSelected = brand.includes(value);
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleMultiValue(setBrand, brand, value)}
                        className={`rounded-lg border-2 px-3 py-2.5 text-center text-sm font-medium transition-all ${
                          isSelected ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {value}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="py-3 text-sm text-slate-500">No brands found</p>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Fuel Type" count={sectionCounts.fuel} isOpen={openSections.fuel} onToggle={() => toggleSection("fuel")}>
            <div className="grid grid-cols-2 gap-3">
              {fuels.map((value) => {
                const isSelected = fuel.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleMultiValue(setFuel, fuel, value)}
                    className={`rounded-lg border-2 px-3 py-2.5 text-center text-sm font-medium transition-all ${
                      isSelected ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Year" count={sectionCounts.year} isOpen={openSections.year} onToggle={() => toggleSection("year")}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">From Year</label>
                <input
                  type="number"
                  min={YEAR_MIN}
                  max={YEAR_MAX}
                  step="1"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  placeholder="1990"
                  className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">To Year</label>
                <input
                  type="number"
                  min={YEAR_MIN}
                  max={YEAR_MAX}
                  step="1"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  placeholder={String(YEAR_MAX)}
                  className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
                />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Max Mileage" count={sectionCounts.mileage} isOpen={openSections.mileage} onToggle={() => toggleSection("mileage")}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Min Km</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={minKm}
                  onChange={(e) => setMinKm(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600">Max Km</label>
                <input
                  type="number"
                  min={0}
                  step="1"
                  value={maxKm}
                  onChange={(e) => setMaxKm(e.target.value)}
                  placeholder="Any"
                  className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
                />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Price Range" count={sectionCounts.price} isOpen={openSections.price} onToggle={() => toggleSection("price")}>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {budgetPresets.map((preset) => {
                  const isActive = minPrice === preset.minPrice && maxPrice === preset.maxPrice;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setBudgetPreset(preset)}
                      className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all ${
                        isActive ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Minimum Price</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="e.g. 100000"
                    className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-600">Maximum Price</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="e.g. 2000000"
                    className="w-full rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Transmission" count={sectionCounts.transmission} isOpen={openSections.transmission} onToggle={() => toggleSection("transmission")}>
            <div className="grid grid-cols-2 gap-3">
              {transmissions.map((value) => {
                const isSelected = transmission.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleMultiValue(setTransmission, transmission, value)}
                    className={`rounded-lg border-2 px-3 py-2.5 text-center text-sm font-medium transition-all ${
                      isSelected ? "border-primary bg-primary/10 text-primary" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {!embedded && (
        <div className="border-t px-4 py-3">
          <div className="flex items-center justify-between">
            <button type="button" onClick={clearFilters} className="rounded-lg border px-3 py-2 text-sm">
              Clear
            </button>
            <button type="button" className="rounded-lg bg-blue text-white px-4 py-2 text-sm">
              Show filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSidebar;
