import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";

import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";
import useFavorites from "../../hooks/useFavorites";
import { getPublicVehicleById } from "../../rtk/thunk/vehicleThunk";
import { Button } from "../../ui/ui/button";
import { Card, CardContent } from "../../ui/ui/card";

const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${backendUrl}/${cleanPath.replace(/\\/g, "/")}`;
};

const Favorites = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadFavorites = async () => {
      if (!favorites.length) {
        setVehicles([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const results = await Promise.allSettled(
        favorites.map((id) => dispatch(getPublicVehicleById(id)).unwrap()),
      );

      if (!active) return;

      const nextVehicles = [];
      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          nextVehicles.push(result.value);
        }
      });

      setVehicles(nextVehicles);
      setLoading(false);
    };

    loadFavorites();

    return () => {
      active = false;
    };
  }, [dispatch, favorites]);

  const handleRemove = (vehicleId) => {
    toggleFavorite(vehicleId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-blue-50">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 rounded-3xl border border-rose-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-gray-900">Saved Vehicles</h1>
            <p className="mt-2 text-sm text-gray-600">Vehicles you liked are collected here.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => navigate("/vehicles/browse?type=buy")} className="gap-2 bg-gradient-to-r from-purple to-blue hover:from-purple hover:to-blue text-white shadow-md hover:shadow-lg transition-all">
              <ArrowLeft className="h-4 w-4" />
              Browse Vehicles
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-gray-300 bg-white">
            <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-rose-500" />
          </div>
        ) : vehicles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center shadow-sm">
            <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-900">No favorites yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-600">
              Click the heart icon on a vehicle listing to save it here.
            </p>
            <Button onClick={() => navigate("/vehicles/browse?type=buy")} className="mt-6 gap-2">
              Browse Vehicles
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {vehicles.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden border-0 shadow-lg transition-shadow hover:shadow-xl">
                <div className="relative aspect-[4/3] bg-gray-100">
                  <img
                    src={getImageUrl(vehicle.images?.[0]) || "https://placehold.co/600x400?text=No+Image"}
                    alt={vehicle.name}
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "https://placehold.co/600x400?text=No+Image";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemove(vehicle.id)}
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-rose-600 backdrop-blur transition-transform active:scale-90"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="absolute left-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black shadow-md border border-gray-200">
                    <Heart className="mr-1 inline-block h-3.5 w-3.5 fill-black text-black" />
                    Favorite
                  </div>
                </div>

                <CardContent className="space-y-4 p-5">
                  <div>
                    <h2 className="truncate text-lg font-bold text-gray-900">{vehicle.name}</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      {vehicle.make} {vehicle.model} • {vehicle.year}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xl font-black text-blue">
                      Rs. {Number(vehicle.price || 0).toLocaleString("en-IN")}
                    </p>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {vehicle.condition || "Available"}
                    </span>
                  </div>

                  <p className="line-clamp-2 text-sm text-gray-600">
                    {vehicle.description || "No description available."}
                  </p>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => navigate(`/vehicles/public/${vehicle.id}`)}>
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;