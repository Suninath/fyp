# Frontend Component Examples

## Complete Working Examples for Quick Reference

### 1. Booking Form Component

```jsx
// BookingFilter.jsx - Enhanced Version
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBooking, getVehicleBookings } from "../../rtk/slice/bookingSlice";
import { Calendar, MapPin, DollarSign, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ErrorToast, SucessToast } from "./toast";
import PaymentModal from "./PaymentModal";

const BookingFilter = ({ vehicleId, vehiclePrice, vehicleName, vehicleLocation }) => {
  const dispatch = useDispatch();
  const { loading, currentBooking, error, vehicleBookings } = useSelector(
    (state) => state.booking
  );
  const { authenticate } = useSelector((state) => state.auth);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState(vehicleLocation || "");
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfDays, setNumberOfDays] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [availability, setAvailability] = useState(null);

  // Load unavailable dates on mount
  useEffect(() => {
    dispatch(getVehicleBookings(vehicleId));
  }, [vehicleId, dispatch]);

  // Calculate price and check availability when dates change
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end > start) {
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        setNumberOfDays(days);
        setTotalPrice(vehiclePrice * days);
        
        // Check if dates are available
        const hasConflict = vehicleBookings.some(booking => {
          const bookingStart = new Date(booking.startDate);
          const bookingEnd = new Date(booking.endDate);
          return start < bookingEnd && end > bookingStart;
        });
        
        setAvailability(!hasConflict);
      } else {
        setTotalPrice(0);
        setNumberOfDays(0);
        setAvailability(null);
      }
    }
  }, [startDate, endDate, vehiclePrice, vehicleBookings]);

  const handleBooking = async () => {
    if (!authenticate) {
      ErrorToast({ message: "Please login to book a vehicle" });
      return;
    }

    if (!startDate || !endDate || !location) {
      ErrorToast({ message: "Please fill all required fields" });
      return;
    }

    if (!availability) {
      ErrorToast({ message: "Selected dates are not available" });
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
      SucessToast({ message: "Booking created! Proceed to payment." });
      setShowPaymentModal(true);
      // Reset form
      setStartDate("");
      setEndDate("");
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
        {/* Vehicle Info */}
        <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-2">
          <span className="text-lg">📍</span>
          <span className="text-gray-700">{vehicleName} available at {vehicleLocation}</span>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Start Date
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={getTodayDate()}
            className="w-full"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            End Date
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate || getTodayDate()}
            className="w-full"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Pickup Location
          </label>
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter pickup location"
            className="w-full"
          />
        </div>

        {/* Availability Status */}
        {numberOfDays > 0 && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${
              availability
                ? "bg-green-50 border border-green-200 text-green-800"
                : "bg-red-50 border border-red-200 text-red-800"
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span>
              {availability
                ? `✓ Vehicle available for ${numberOfDays} days`
                : "✗ Vehicle not available for selected dates"}
            </span>
          </div>
        )}

        {/* Pricing Summary */}
        {numberOfDays > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2 border-l-4 border-green-500">
            <div className="flex justify-between">
              <span>Daily Rate:</span>
              <span className="font-semibold">Rs. {vehiclePrice}</span>
            </div>
            <div className="flex justify-between">
              <span>Number of Days:</span>
              <span className="font-semibold">{numberOfDays}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg font-bold text-green-600">
              <span>Total Price:</span>
              <span>Rs. {totalPrice}</span>
            </div>
          </div>
        )}

        {/* Booking Button */}
        <Button
          onClick={handleBooking}
          disabled={!availability || loading || numberOfDays === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Creating Booking...
            </span>
          ) : (
            "Book Now"
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Payment Modal */}
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
```

### 2. Enhanced Payment Modal

```jsx
// PaymentModal.jsx - Enhanced with better error handling
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { initiatePayment } from "../../rtk/slice/bookingSlice";
import { X, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { SucessToast, ErrorToast } from "./toast";

const PaymentModal = ({ booking, onClose }) => {
  const dispatch = useDispatch();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);

  // Safety check for booking data
  if (!booking || !booking.id) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <p className="text-red-600 font-semibold">Error: Booking data unavailable</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    {
      id: "khalti",
      name: "Khalti",
      description: "Pay with Khalti mobile wallet",
      icon: "📱",
      color: "from-purple-400 to-purple-600",
    },
    {
      id: "esewa",
      name: "eSewa",
      description: "Pay with eSewa digital wallet",
      icon: "🏦",
      color: "from-green-400 to-green-600",
    },
    {
      id: "nepali-pay",
      name: "Bank Transfer",
      description: "Transfer through Nepali bank",
      icon: "🏧",
      color: "from-blue-400 to-blue-600",
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      ErrorToast({ message: "Please select a payment method" });
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(
        initiatePayment({
          bookingId: booking.id,
          method: selectedMethod,
        })
      );

      if (result.payload?.status) {
        const paymentGateway = result.payload.data.paymentGateway;

        // Process payment based on method
        if (selectedMethod === "esewa") {
          redirectToEsewa(paymentGateway);
        } else if (selectedMethod === "khalti") {
          redirectToKhalti(paymentGateway);
        } else if (selectedMethod === "nepali-pay") {
          showBankTransferInfo(paymentGateway);
        }
      } else {
        ErrorToast({
          message: result.payload?.message || "Payment initiation failed",
        });
      }
    } catch (error) {
      ErrorToast({ message: `Error: ${error.message}` });
    } finally {
      setLoading(false);
    }
  };

  const redirectToEsewa = (data) => {
    try {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = data.esewaUrl || "https://uat.esewa.com.np/epay/main";

      const fields = {
        amt: data.amt,
        psc: data.psc || 0,
        pdc: data.pdc || 0,
        txAmt: data.txAmt || data.amt,
        pid: data.pid,
        su: data.su,
        fu: data.fu,
        scd: data.merchant_code || "EPAYTEST",
      };

      Object.keys(fields).forEach((key) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = fields[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      SucessToast({ message: "Redirecting to eSewa..." });
      form.submit();
    } catch (error) {
      ErrorToast({ message: "Failed to redirect to eSewa" });
    }
  };

  const redirectToKhalti = (data) => {
    const khaltiUrl = data.payment_url || data.khaltiUrl;
    if (khaltiUrl) {
      SucessToast({ message: "Redirecting to Khalti..." });
      window.location.href = khaltiUrl;
    } else {
      ErrorToast({ message: "Khalti payment URL not available" });
    }
  };

  const showBankTransferInfo = (data) => {
    SucessToast({
      message: `Please transfer Rs. ${data.amount || booking.finalAmount} to the provided account`,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold">Complete Payment</h2>
          </div>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-blue-50 border-b">
          <div className="space-y-2">
            <p className="text-gray-700">
              <strong>Vehicle:</strong> {booking.vehicle?.name || "Vehicle"}
            </p>
            <p className="text-gray-700">
              <strong>Duration:</strong> {booking.numberOfDays || 0} days
            </p>
            <p className="text-gray-700">
              <strong>Location:</strong> {booking.location}
            </p>
            <div className="pt-2 border-t mt-3 flex items-center justify-between">
              <span className="text-lg font-bold">Amount to Pay:</span>
              <span className="text-3xl font-bold text-green-600">
                Rs. {booking.finalAmount || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="px-6 py-6 space-y-3">
          <p className="text-sm font-semibold text-gray-600 mb-4">
            Select a payment method:
          </p>
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedMethod === method.id
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-400 bg-white"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{method.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{method.name}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedMethod === method.id
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  {selectedMethod === method.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!selectedMethod || loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Processing...
              </span>
            ) : (
              "Proceed to Payment"
            )}
          </Button>
        </div>

        {/* Info Message */}
        <div className="px-6 py-3 bg-blue-50 border-t text-sm text-blue-800 rounded-b-lg">
          ℹ️ Your booking will be confirmed once payment is successful.
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
```

### 3. Check Availability Hook

```jsx
// useCheckAvailability.js - Custom hook for availability checking
import { useState, useCallback } from "react";
import { main_uri } from "../service";

export const useCheckAvailability = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkAvailability = useCallback(async (vehicleId, startDate, endDate) => {
    try {
      setLoading(true);
      setError(null);

      const response = await main_uri.post(
        `/api/v1/bookings/vehicle/${vehicleId}/check-availability`,
        { startDate, endDate }
      );

      return response.data.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to check availability";
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUnavailableDates = useCallback(async (vehicleId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await main_uri.get(
        `/api/v1/bookings/vehicle/${vehicleId}/unavailable-dates`
      );

      return response.data.data.unavailableDates;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Failed to load unavailable dates";
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    checkAvailability,
    getUnavailableDates,
    loading,
    error,
  };
};
```

### 4. Usage Example in VehicleDetails

```jsx
// VehicleDetails.jsx - Using the availability hook
import { useEffect, useState } from "react";
import { useCheckAvailability } from "../../hooks/useCheckAvailability";
import BookingFilter from "./BookingFilter";

const VehicleDetails = ({ vehicleId }) => {
  const { getUnavailableDates, loading } = useCheckAvailability();
  const [unavailableDates, setUnavailableDates] = useState([]);

  useEffect(() => {
    const loadUnavailableDates = async () => {
      const dates = await getUnavailableDates(vehicleId);
      setUnavailableDates(dates);
    };

    loadUnavailableDates();
  }, [vehicleId, getUnavailableDates]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Vehicle Details</h1>

      {/* Vehicle Images and Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2>Images and Specs</h2>
        </div>

        <div>
          {/* Booking Form */}
          <BookingFilter
            vehicleId={vehicleId}
            vehiclePrice={100}
            vehicleName="Toyota Corolla"
            vehicleLocation="Kathmandu"
          />

          {/* Unavailable Dates Info */}
          {unavailableDates.length > 0 && (
            <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Unavailable Dates:</h3>
              <ul className="space-y-1">
                {unavailableDates.map((range) => (
                  <li key={range.bookingId} className="text-sm text-gray-700">
                    {new Date(range.startDate).toLocaleDateString()} -{" "}
                    {new Date(range.endDate).toLocaleDateString()}
                    <span className="text-gray-500"> (Booked by {range.userName})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;
```

### 5. Payment Status Checker Component

```jsx
// PaymentStatusChecker.jsx - Check and update payment status
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getPaymentStatus } from "../../rtk/slice/bookingSlice";
import { SucessToast, ErrorToast } from "./toast";

const PaymentStatusChecker = ({ bookingId, onPaymentSuccess }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pollingCount, setPollingCount] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await dispatch(getPaymentStatus(bookingId));

        if (result.payload?.status) {
          const paymentData = result.payload.data;
          setStatus(paymentData);

          // Check if payment is confirmed
          if (paymentData.bookingStatus === "CONFIRMED") {
            SucessToast({ message: "✓ Payment successful! Booking confirmed." });
            onPaymentSuccess?.();
            return;
          }

          // Continue polling if still pending
          if (paymentData.bookingStatus === "PENDING" && pollingCount < 60) {
            setTimeout(() => {
              setPollingCount((prev) => prev + 1);
              checkStatus();
            }, 2000);
          }
        }
      } catch (error) {
        console.error("Error checking payment status:", error);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [bookingId, dispatch, pollingCount, onPaymentSuccess]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-blue-600">
        <span className="animate-spin">⏳</span>
        Checking payment status...
      </div>
    );
  }

  if (!status) {
    return <div className="text-red-600">Error loading payment status</div>;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Booking Status:</span>
        <span className={`font-semibold ${
          status.bookingStatus === "CONFIRMED"
            ? "text-green-600"
            : "text-yellow-600"
        }`}>
          {status.bookingStatus}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Payment Status:</span>
        <span className={`font-semibold ${
          status.paymentStatus === "SUCCESS"
            ? "text-green-600"
            : "text-yellow-600"
        }`}>
          {status.paymentStatus}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Payment Method:</span>
        <span className="font-semibold">{status.paymentMethod}</span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t">
        <span className="text-gray-600 font-semibold">Amount:</span>
        <span className="text-lg font-bold text-green-600">
          Rs. {status.amount}
        </span>
      </div>
    </div>
  );
};

export default PaymentStatusChecker;
```

## Tips & Tricks

### 1. Test with Redux DevTools
```javascript
// Install Redux DevTools browser extension
// Then view Redux state changes in real-time
// https://github.com/reduxjs/redux-devtools
```

### 2. Mock API Responses for Testing
```javascript
// Temporarily mock API for UI testing
jest.mock("../../service", () => ({
  main_uri: {
    post: jest.fn().mockResolvedValue({
      data: { status: true, data: { id: 1, finalAmount: 5000 } }
    }),
    get: jest.fn().mockResolvedValue({
      data: { data: { unavailableDates: [] } }
    }),
  },
}));
```

### 3. Debug Payment Redirects
```javascript
// Log redirect details before submitting
const redirectToEsewa = (data) => {
  console.log("eSewa Redirect Data:", data);
  // ... rest of code
};
```

---

These examples provide ready-to-use components that integrate seamlessly with your Redux store and API endpoints.
