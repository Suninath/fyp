import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  comparedVehicles: [], // Array of vehicle objects to compare
  maxComparisons: 4, // Maximum vehicles to compare side by side
};

const comparisonSlice = createSlice({
  name: "comparison",
  initialState,
  reducers: {
    addToComparison: (state, action) => {
      const vehicle = action.payload;
      
      // Check if vehicle is already in comparison
      const exists = state.comparedVehicles.find(v => v.id === vehicle.id);
      if (exists) return;
      
      // Check if we've reached max comparisons
      if (state.comparedVehicles.length < state.maxComparisons) {
        state.comparedVehicles.push(vehicle);
      }
    },
    removeFromComparison: (state, action) => {
      const vehicleId = action.payload;
      state.comparedVehicles = state.comparedVehicles.filter(
        v => v.id !== vehicleId
      );
    },
    clearComparison: (state) => {
      state.comparedVehicles = [];
    },
    setMaxComparisons: (state, action) => {
      state.maxComparisons = action.payload;
    },
  },
});

export const {
  addToComparison,
  removeFromComparison,
  clearComparison,
  setMaxComparisons,
} = comparisonSlice.actions;

export default comparisonSlice.reducer;
