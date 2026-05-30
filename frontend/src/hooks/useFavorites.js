import { useEffect, useState } from "react";

const STORAGE_KEY = "favoriteVehicles";

const readFavorites = () => {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);

  const syncFavorites = () => {
    setFavorites(readFavorites());
  };

  useEffect(() => {
    syncFavorites();

    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        syncFavorites();
      }
    };

    const handleFavoritesChange = () => {
      syncFavorites();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("favoriteschange", handleFavoritesChange);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("favoriteschange", handleFavoritesChange);
    };
  }, []);

  const persistFavorites = (nextFavorites) => {
    setFavorites(nextFavorites);

    if (typeof window === "undefined") return;

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites));
    window.dispatchEvent(new Event("favoriteschange"));
  };

  const toggleFavorite = (vehicleId) => {
    const normalizedId = vehicleId;
    const nextFavorites = favorites.includes(normalizedId)
      ? favorites.filter((id) => id !== normalizedId)
      : [...favorites, normalizedId];

    persistFavorites(nextFavorites);
  };

  const isFavorite = (vehicleId) => favorites.includes(vehicleId);

  return { favorites, toggleFavorite, isFavorite };
};

export default useFavorites;