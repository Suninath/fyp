# Frontend Implementation Guide - Booking & Payments

## Overview

This guide covers the frontend implementation for the Second Auto Gear booking system, including vehicle selection, date picker, availability checking, and payment processing.

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── authComp/          (Login, Signup, Password Reset)
│   │   ├── common/            (Shared components: PaymentModal, ChatDialog, etc.)
│   │   ├── userComp/          (User features: BookingFilter, VehicleDetails, etc.)
│   │   ├── adminComp/         (Admin dashboard)
│   │   └── ui/                (UI components: Button, Input, etc.)
│   ├── pages/
│   │   ├── auth/              (Login/Signup pages)
│   │   ├── user/              (User pages: MyBookings, Profile)
│   │   └── public/            (Public pages: Home, Vehicles)
│   ├── rtk/                   (Redux Toolkit)
│   │   ├── slice/             (Redux slices)
│   │   ├── thunk/             (Async thunks)
│   │   └── store/             (Redux store config)
│   ├── service/               (API services)
│   ├── contexts/              (React contexts - SocketContext)
│   └── App.jsx                (Root component)
```

## Key Components

### 1. VehicleDetails Component
Displays vehicle information and contains the BookingFilter component for date selection.

**Location:** `frontend/src/components/userComp/VehicleDetails.jsx`

**Features:**
- Display vehicle images, specs, and reviews
- Embedded booking form with date picker
- Show unavailable dates
- Real-time availability checking

### 2. BookingFilter Component
Handles date selection, availability checking, and booking creation.

**Location:** `frontend/src/components/userComp/BookingFilter.jsx`

**Key Functions:**
- `handleBooking()` - Create booking and trigger payment modal
- `isDateBooked()` - Check if date is in unavailable list
- `getTodayDate()` - Get minimum date for picker

**Flow:**
```
1. User selects start/end dates
2. System calculates number of days and total price
3. User clicks "Book Now"
4. Booking created with status PENDING
5. PaymentModal shown
```

### 3. PaymentModal Component
Modal dialog for selecting payment method and processing payment.

**Location:** `frontend/src/components/common/PaymentModal.jsx`

**Supported Payment Methods:**
- eSewa
- Khalti
- Nepali Pay (manual bank transfer)

**Fixed Issues:**
- ✅ Proper null-safety checks for undefined booking data
- ✅ Vehicle info fallback if not loaded
- ✅ Khalti redirect to actual payment URL (not just khalti.com)

## Redux State Management

### Booking Slice
Manages booking state and API calls.

**File:** `frontend/src/rtk/slice/bookingSlice.js`

**State:**
```javascript
{
  booking: {
    loading: false,
    error: null,
    currentBooking: null,  // Current booking being processed
    vehicleBookings: [],   // All bookings for a vehicle
    userBookings: [],      // All bookings for current user
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  }
}
```

**Thunks:**
- `createBooking(bookingData)` - Create new booking
- `getUserBookings({ page, limit })` - Get user's bookings
- `getBookingById(bookingId)` - Get specific booking
- `getVehicleBookings(vehicleId)` - Get bookings for vehicle
- `cancelBooking(bookingId)` - Cancel booking
- `initiatePayment({ bookingId, method })` - Start payment
- `getPaymentStatus(bookingId)` - Check payment status

**Improvements Made:**
- Booking data now includes vehicle object
- Fallback vehicle name if not provided
- Better error handling

### Auth Slice
Manages authentication state.

**File:** `frontend/src/rtk/slice/authSlice.jsx`

**Key Actions:**
- `loginUser()` - Handle login
- `logoutUser()` - Handle logout
- `restoreAuthFromStorage()` - Restore auth state from localStorage on app startup

**Token Handling:**
- Access token stored in localStorage
- Token sent in Authorization header for all authenticated requests

## API Integration

### Main URI Configuration
**File:** `frontend/src/service/index.jsx`

**Setup:**
```javascript
import axios from "axios";

export const main_uri = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true, // Send cookies with requests
});
```

**Usage:**
```javascript
// All booking endpoints include auth header
const config = {};
if (token) {
  config.headers = {
    Authorization: `Bearer ${token}`,
  };
}
const response = await main_uri.post("/api/v1/bookings", bookingData, config);
```

## Complete Booking Flow

### 1. User Browses Vehicles
```
VehicleGrid → VehicleCard
  ↓
  User clicks vehicle
  ↓
VehicleDetails (with embedded BookingFilter)
```

### 2. User Selects Dates
```
BookingFilter Component:
  ├─ Load unavailable dates for vehicle
  │   GET /api/v1/bookings/vehicle/:vehicleId/unavailable-dates
  ├─ User selects start/end dates
  ├─ System checks availability
  │   POST /api/v1/bookings/vehicle/:vehicleId/check-availability
  └─ Display price: dailyRate × numberOfDays
```

### 3. User Creates Booking
```
POST /api/v1/bookings
{
  "vehicleId": 1,
  "startDate": "2026-02-15T00:00:00Z",
  "endDate": "2026-02-20T00:00:00Z",
  "location": "Kathmandu",
  "notes": ""
}

Response:
{
  "status": true,
  "code": 201,
  "data": {
    "id": 1,
    "vehicleId": 1,
    "startDate": "2026-02-15T00:00:00Z",
    "endDate": "2026-02-20T00:00:00Z",
    "numberOfDays": 5,
    "dailyRate": 2000,
    "totalAmount": 10000,
    "finalAmount": 10000,
    "status": "Pending"
  }
}

Status: PENDING (dates not yet locked)
         ↓
PaymentModal shown
```

### 4. User Selects Payment Method
```
PaymentModal Component:
  ├─ Display payment method options
  ├─ User selects method
  └─ Booking summary (vehicle, days, amount)
```

### 5. Payment Processing

#### eSewa Flow:
```
1. User selects eSewa
2. Frontend calls:
   POST /api/v1/bookings/:bookingId/payment
   { "method": "eSewa" }

3. Backend returns:
   {
     "paymentGateway": {
       "esewaUrl": "https://uat.esewa.com.np/epay/main",
       "amt": 1000,
       "pid": "BOOKING_1_101_...",
       "su": "http://localhost:3000/api/v1/bookings/payment/callback/esewa"
     }
   }

4. Frontend creates form with hidden fields
5. Form submits to eSewa
6. User completes payment on eSewa
7. eSewa redirects to callback URL with query params
8. Backend verifies and updates booking status → CONFIRMED
9. Frontend redirects user to success page
```

#### Khalti Flow:
```
1. User selects Khalti
2. Frontend calls:
   POST /api/v1/bookings/:bookingId/payment
   { "method": "khalti" }

3. Backend calls Khalti API:
   POST https://dev.khalti.com/api/v2/epayment/initiate/
   Returns: { "pidx": "...", "payment_url": "..." }

4. Frontend receives:
   {
     "paymentGateway": {
       "payment_url": "https://test-pay.khalti.com/?pidx=...",
       "khaltiUrl": "https://test-pay.khalti.com/?pidx=..."
     }
   }

5. Frontend redirects to payment_url
6. User completes payment on Khalti
7. Khalti redirects to callback URL
8. Backend verifies and updates booking status → CONFIRMED
9. Frontend redirects user to success page
```

## Error Handling

### Common Errors & Solutions

#### Error: "Cannot read properties of undefined (reading 'name')"
**Cause:** Booking or vehicle data not loaded
**Solution:** ✅ Fixed with null-safety checks
```javascript
// Safe access to vehicle name
const vehicleName = booking.vehicle?.name || "Vehicle";
```

#### Error: "Unauthorized"
**Cause:** Token not sent or expired
**Solution:**
- Ensure token is in localStorage
- Check Authorization header is set
- Verify token hasn't expired

#### Error: "Vehicle is not available for selected dates"
**Cause:** Date range overlaps with existing confirmed booking
**Solution:**
- Check unavailable dates
- Select different dates
- Use availability checking before booking

### Error Toast Messages
```javascript
import { ErrorToast, SucessToast } from "../common/toast";

// Error
ErrorToast({ message: "Booking failed" });

// Success
SucessToast({ message: "Booking created successfully!" });
```

## Testing Checklist

- [ ] Load vehicle details page
- [ ] Check unavailable dates display correctly
- [ ] Select start and end dates
- [ ] Verify total price calculation (dailyRate × days)
- [ ] Create booking successfully
- [ ] PaymentModal opens with correct booking info
- [ ] Select eSewa payment method
- [ ] Redirect to eSewa test portal
- [ ] Complete test payment (EPAYTEST merchant code)
- [ ] Receive callback and verify booking status → CONFIRMED
- [ ] Select Khalti payment method
- [ ] Redirect to Khalti test portal
- [ ] Complete test payment (9800000000 test ID)
- [ ] Verify payment status endpoint works
- [ ] Test cancel booking functionality
- [ ] Verify cancelled bookings release dates

## Frontend Integration Tips

### 1. Date Picker Integration
```javascript
import { Calendar } from "lucide-react";

// Show disabled dates in picker
const disabledDates = unavailableDates.map(range => ({
  start: new Date(range.startDate),
  end: new Date(range.endDate)
}));

// Pass to date input or calendar component
```

### 2. Real-time Availability Checking
```javascript
// Check availability as user types dates
async function handleDateChange(date) {
  const isAvailable = await checkVehicleAvailability(vehicleId, startDate, date);
  if (!isAvailable) {
    showWarning("These dates are not available");
  }
}
```

### 3. Payment Status Polling
```javascript
// Check payment status periodically after redirect
useEffect(() => {
  if (bookingId) {
    const interval = setInterval(async () => {
      const status = await dispatch(getPaymentStatus(bookingId));
      if (status.payload.data.bookingStatus === "CONFIRMED") {
        // Payment successful!
        clearInterval(interval);
        navigate("/booking/success");
      }
    }, 2000);
    return () => clearInterval(interval);
  }
}, [bookingId]);
```

### 4. Loading States
```javascript
// Show loading while creating booking
const { loading } = useSelector(state => state.booking);

return (
  <button disabled={loading} onClick={handleBooking}>
    {loading ? "Creating Booking..." : "Book Now"}
  </button>
);
```

## Component Imports

### Common Imports
```javascript
import { useDispatch, useSelector } from "react-redux";
import { createBooking, initiatePayment } from "../../rtk/slice/bookingSlice";
import { main_uri } from "../../service";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ErrorToast, SucessToast } from "./toast";
import { Calendar, MapPin, DollarSign } from "lucide-react";
```

### Icon Library
Uses **Lucide React** for icons:
- Calendar - for dates
- MapPin - for location
- DollarSign - for prices
- X - for close buttons
- ChevronDown - for dropdowns
- etc.

## Environment Variables

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Second Auto Gear
```

## Performance Optimization

### 1. Lazy Loading Components
```javascript
const PaymentModal = React.lazy(() => import("./PaymentModal"));

// Use Suspense
<Suspense fallback={<div>Loading...</div>}>
  <PaymentModal booking={booking} onClose={onClose} />
</Suspense>
```

### 2. Memoization
```javascript
const BookingFilter = React.memo(({ vehicleId, vehiclePrice }) => {
  // Component only re-renders if props change
});
```

### 3. Pagination
```javascript
// Load bookings with pagination
const [page, setPage] = useState(1);
const { userBookings, pagination } = useSelector(state => state.booking);

// Load next page
const loadMore = () => {
  dispatch(getUserBookings({ page: page + 1 }));
};
```

## Troubleshooting

### Issue: Payment Modal shows "Error: Booking data is unavailable"
**Solutions:**
1. Ensure booking was created successfully
2. Check Redux state in DevTools
3. Verify API response includes required fields
4. Check browser console for API errors

### Issue: Khalti redirects to khalti.com instead of payment URL
**Solution:** ✅ Fixed - now uses payment_url from backend response

### Issue: eSewa form not submitting
**Solutions:**
1. Verify form fields match eSewa spec
2. Check merchant code (EPAYTEST for testing)
3. Verify callback URL is correct
4. Check browser console for JavaScript errors

### Issue: Dates showing as available when they should be booked
**Solutions:**
1. Check booking status (must be CONFIRMED to block dates)
2. Verify date comparison logic
3. Reload unavailable dates list
4. Check backend for overlapping bookings

## Quick Start

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Browse to vehicle:**
   - Navigate to homepage
   - Click on any vehicle card
   - VehicleDetails page loads with BookingFilter

4. **Test booking:**
   - Select start/end dates
   - Click "Book Now"
   - PaymentModal opens
   - Select payment method
   - Redirect to payment gateway

5. **Verify in console:**
   - Use React DevTools
   - Check Redux state
   - Monitor network requests

## Next Steps

1. **Enhance UI:**
   - Add calendar date picker component
   - Improve loading states
   - Add booking confirmation page

2. **Add Features:**
   - Payment history for users
   - Invoice generation
   - Email receipts
   - Refund handling

3. **Optimize Performance:**
   - Code splitting for payment components
   - Lazy load vehicle images
   - Cache booking data

4. **Improve UX:**
   - Add error boundaries
   - Better error messages
   - Loading animations
   - Success celebrations

## Resources

- React: https://react.dev
- Redux Toolkit: https://redux-toolkit.js.org
- Axios: https://axios-http.com
- Lucide Icons: https://lucide.dev
- Tailwind CSS: https://tailwindcss.com

---

## Summary

The frontend implementation provides:
- ✅ Complete booking workflow
- ✅ Real-time availability checking
- ✅ Payment method selection
- ✅ Proper error handling
- ✅ State management with Redux
- ✅ Safe data access with null checks
- ✅ Integration with eSewa and Khalti
- ✅ Responsive UI with Tailwind CSS
