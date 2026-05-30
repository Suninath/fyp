import React, { useState } from "react";
import { Car, ChevronLeft, ChevronRight, Eye, Heart, Scale } from "lucide-react";
import { Button } from "../ui/button";
import useFavorites from "../../hooks/useFavorites";

const VehicleListRow = ({ vehicle, onView, onCompare, isInComparison, getImageUrl }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const { toggleFavorite, isFavorite } = useFavorites();
  const images = vehicle.images || [];
  const favorite = isFavorite(vehicle.id);

  const prev = (e) => {
    e?.stopPropagation();
    export { default } from "./VehicleCard";
  );
};

export default VehicleListRow;