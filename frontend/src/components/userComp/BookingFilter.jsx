import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBooking, getVehicleBookings } from "../../rtk/slice/bookingSlice";
import { getAuthorize, getUserProfile } from "../../rtk/thunk/authThunk";
import { Calendar, MapPin, DollarSign } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { SucessToast, ErrorToast } from "../common/toast";
import PaymentModal from "../common/PaymentModal";
import { isUserVerified } from "../../lib/verification";

const BookingFilter = ({ vehicleId, vehiclePrice, vehicleLocation }) => {
  const dispatch = useDispatch();
  const { loading, currentBooking, error, vehicleBookings } = useSelector(
    (state) => state.booking
  );
  const { user, authenticate } = useSelector((state) => state.auth);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState(vehicleLocation || "");
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    dispatch(getVehicleBookings(vehicleId));
    // Ensure auth state is refreshed from cookies/session if page was reloaded
    if (!authenticate) {
      dispatch(getAuthorize());
    } else {
      dispatch(getUserProfile());
    }
  }, [vehicleId, dispatch, authenticate]);

  // Calculate total price when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end > start) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        setNumberOfDays(days);
        setTotalPrice(vehiclePrice * days);
      } else {
        setTotalPrice(0);
        setNumberOfDays(0);
      }
    }
  }, [startDate, endDate, vehiclePrice]);

  const isDateBooked = (date) => {
    return vehicleBookings.some(
      (booking) =>
        new Date(date) >= new Date(booking.startDate) &&
        new Date(date) <= new Date(booking.endDate)
    );
  };

  const handleBooking = async () => {
    if (!authenticate) {
      const authResult = await dispatch(getAuthorize());
      if (authResult.meta.requestStatus !== "fulfilled") {
        ErrorToast({ message: "Please login to book a vehicle" });
        return;
      }
    }

    if (!user) {
      await dispatch(getUserProfile());
      ErrorToast({ message: "Loading your profile, please try again." });
      return;
    }

    if (!isUserVerified(user)) {
      ErrorToast({ message: "Account verification is required before booking." });
      return;
    }

    if (!startDate || !endDate || !location) {
      ErrorToast({ message: "Please fill all fields" });
      return;
    }

    const bookingData = {
      vehicleId,
      startDate,
      endDate,
      location,
      notes: "",
    };

    const result = await dispatch(createBooking(bookingData));

    if (result.payload?.status) {
      SucessToast({ message: "Booking created successfully! Proceed to payment." });
      // Add vehicle info to the booking data for the payment modal
      const bookingWithVehicle = {
        ...result.payload.data,
        vehicle: { name: `Vehicle #${vehicleId}` },
      };
      // Note: currentBooking from Redux will be used by PaymentModal
      setShowPaymentModal(true);
    } else {
      ErrorToast({ message: result.payload?.message || "Booking failed" });
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-6">Book This Vehicle</h3>

      <div className="space-y-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium mb-2">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="date"
              min={getTodayDate()}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium mb-2">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="date"
              min={startDate || getTodayDate()}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">Pickup Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter pickup location"
              className="pl-10"
            />
          </div>
        </div>

        {/* Price Summary */}
        {numberOfDays > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Rate:</span>
              <span className="font-medium">Rs. {vehiclePrice}/day</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Number of Days:</span>
              <span className="font-medium">{numberOfDays} days</span>
            </div>
            <div className="border-t pt-2 flex justify-between items-center">
              <span className="font-semibold">Total Price:</span>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  Rs. {totalPrice.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Booking Button */}
        <Button
          onClick={handleBooking}
          disabled={loading || !startDate || !endDate || !location}
          className="w-full bg-blue text-white hover:bg-blue-600 py-3 rounded-lg font-semibold"
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800">
            {error}
          </div>
        )}
      </div>

      {/* Payment Modal would go here */}
      {showPaymentModal && currentBooking && (
        <PaymentModal
          booking={currentBooking}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
};

export default BookingFilter;
