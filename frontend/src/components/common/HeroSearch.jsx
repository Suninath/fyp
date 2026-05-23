import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import SearchAutocomplete from "../ui/SearchAutocomplete";

const HeroSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [location, setLocation] = useState("");

  const submit = (e) => {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type && type !== "all") params.set("type", type);
    if (location) params.set("location", location);
    navigate(`/vehicles/browse?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="w-full">
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/95 p-2.5 sm:p-3 md:p-4 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.35)] backdrop-blur">
        <div className="grid gap-2 sm:gap-2.5 md:gap-3 grid-cols-1 sm:grid-cols-[1fr_100px] md:grid-cols-[1fr_120px_180px_120px] lg:grid-cols-[minmax(0,1fr)_140px_200px_140px]">
          <div className="flex items-center gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-2">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 shrink-0" />
            <div className="min-w-0 flex-1">
              <SearchAutocomplete
                value={query}
                onChange={(v) => setQuery(v)}
                suggestions={["Nexon", "Punch", "Creta", "Swift", "Kathmandu", "Pokhara", "Tata", "Maruti", "Hyundai", "SUV", "Sedan", "Electric"]}
                placeholder="Search cars, brands, models or cities"
                storageKey="recentHeroSearches"
                className="w-full text-xs sm:text-sm"
              />
            </div>
          </div>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 outline-none hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          >
            <option value="all">All</option>
            <option value="buy">Buy</option>
            <option value="rent">Rent</option>
          </select>

          <input
            aria-label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-2.5 sm:px-3 py-2 text-xs sm:text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
          />

          <button
            type="submit"
            className="h-9 sm:h-10 md:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-secondary px-3 sm:px-4 md:px-5 text-xs sm:text-sm font-semibold text-white shadow-md transition-colors hover:opacity-95 sm:col-span-2 md:col-span-1"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
};

export default HeroSearch;
