# Booking Availability & Double Booking Prevention

## Overview

This document explains how the double booking prevention system works. Once a user books a vehicle for specific dates and the booking is confirmed (payment completed), no other user can book the same vehicle for overlapping dates.

## How It Works

### 1. Date Range Overlap Detection

When a user attempts to create a booking, the system checks all **CONFIRMED** bookings for that vehicle and verifies that the requested dates don't overlap with any existing bookings.

**Overlap Logic:**
```
Two date ranges overlap if:
  requestStartDate < existingEndDate AND requestEndDate > existingStartDate
```

**Example:**
- Existing booking: Jan 5 - Jan 10
- Request: Jan 8 - Jan 12 → **BLOCKED** (overlaps Jan 8-10)
- Request: Jan 1 - Jan 5 → **BLOCKED** (overlaps at Jan 5)
- Request: Jan 1 - Jan 4 → **ALLOWED** (no overlap)
- Request: Jan 11 - Jan 15 → **ALLOWED** (no overlap)

### 2. Booking Status Consideration

Only **CONFIRMED** bookings block new reservations:
- `PENDING` - Payment not yet processed → doesn't block
- `CONFIRMED` - Payment completed → blocks overlapping dates
- `CANCELLED` - Booking cancelled → doesn't block
- `COMPLETED` - Rental period finished → doesn't block

This means:
- User can create multiple PENDING bookings
- Once any booking is confirmed (payment succeeds), those dates are locked
- If payment fails/is cancelled, the dates become available again

## API Endpoints

### 1. Create Booking (with Availability Check)

```http
POST /api/v1/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "vehicleId": 1,
  "startDate": "2026-02-15T00:00:00Z",
  "endDate": "2026-02-20T00:00:00Z",
  "location": "Kathmandu",
  "notes": "Optional notes"
}
```

**Response - Success (201):**
```json
{
  "status": true,
  "code": 201,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "vehicleId": 1,
    "startDate": "2026-02-15T00:00:00Z",
    "endDate": "2026-02-20T00:00:00Z",
    "location": "Kathmandu",
    "numberOfDays": 5,
    "dailyRate": 2000,
    "totalAmount": 10000,
    "finalAmount": 10000,
    "status": "Pending"
  }
}
```

**Response - Conflict (409):**
```json
{
  "status": false,
  "code": 409,
  "message": "Vehicle is not available for the selected dates. Please choose different dates."
}
```

### 2. Check Vehicle Availability

Check if a vehicle is available for specific dates without creating a booking.

```http
POST /api/v1/bookings/vehicle/:vehicleId/check-availability
Content-Type: application/json

{
  "startDate": "2026-02-15T00:00:00Z",
  "endDate": "2026-02-20T00:00:00Z"
}
```

**Response - Available (200):**
```json
{
  "status": true,
  "code": 200,
  "data": {
    "isAvailable": true,
    "vehicleId": 1,
    "requestedStartDate": "2026-02-15T00:00:00Z",
    "requestedEndDate": "2026-02-20T00:00:00Z",
    "message": "Vehicle is available for selected dates"
  }
}
```

**Response - Not Available (200):**
```json
{
  "status": true,
  "code": 200,
  "data": {
    "isAvailable": false,
    "vehicleId": 1,
    "requestedStartDate": "2026-02-15T00:00:00Z",
    "requestedEndDate": "2026-02-20T00:00:00Z",
    "conflictingBookings": [
      {
        "bookingId": 5,
        "startDate": "2026-02-16T00:00:00Z",
        "endDate": "2026-02-18T00:00:00Z",
        "userName": "John Doe"
      }
    ],
    "message": "Vehicle is not available for selected dates"
  }
}
```

### 3. Get Unavailable Dates for Vehicle

Get a list of all unavailable date ranges for a specific vehicle.

```http
GET /api/v1/bookings/vehicle/:vehicleId/unavailable-dates
```

**Response:**
```json
{
  "status": true,
  "code": 200,
  "data": {
    "vehicleId": 1,
    "vehicleName": "Toyota Corolla",
    "unavailableDates": [
      {
        "startDate": "2026-02-05T00:00:00Z",
        "endDate": "2026-02-10T00:00:00Z",
        "bookingId": 3,
        "userName": "Jane Smith"
      },
      {
        "startDate": "2026-02-20T00:00:00Z",
        "endDate": "2026-02-25T00:00:00Z",
        "bookingId": 7,
        "userName": "Bob Johnson"
      }
    ],
    "totalUnavailableDateRanges": 2
  }
}
```

## Frontend Implementation

### Example: Check Availability Before Creating Booking

```javascript
// 1. First, check if vehicle is available
async function checkVehicleAvailability(vehicleId, startDate, endDate) {
  try {
    const response = await mainUri.post(
      `/bookings/vehicle/${vehicleId}/check-availability`,
      { startDate, endDate }
    );
    
    if (response.data.data.isAvailable) {
      console.log("✓ Vehicle is available");
      return true;
    } else {
      console.log("✗ Vehicle is not available");
      console.log("Conflicts:", response.data.data.conflictingBookings);
      return false;
    }
  } catch (error) {
    console.error("Error checking availability:", error);
    return false;
  }
}

// 2. Create booking only if available
async function createBooking(vehicleId, startDate, endDate, location) {
  const isAvailable = await checkVehicleAvailability(vehicleId, startDate, endDate);
  
  if (!isAvailable) {
    alert("This vehicle is already booked for the selected dates");
    return;
  }
  
  // Proceed with booking
  const result = await mainUri.post("/bookings", {
    vehicleId,
    startDate,
    endDate,
    location
  });
  
  if (result.data.status) {
    console.log("✓ Booking created successfully");
  } else {
    console.log("✗ Booking failed:", result.data.message);
  }
}
```

### Example: Display Calendar with Unavailable Dates

```javascript
async function loadUnavailableDates(vehicleId) {
  try {
    const response = await mainUri.get(
      `/bookings/vehicle/${vehicleId}/unavailable-dates`
    );
    
    const unavailableDates = response.data.data.unavailableDates;
    
    // Convert to format your calendar component understands
    const disabledRanges = unavailableDates.map(range => ({
      start: new Date(range.startDate),
      end: new Date(range.endDate),
      bookedBy: range.userName
    }));
    
    // Disable these dates in your date picker
    return disabledRanges;
  } catch (error) {
    console.error("Error loading unavailable dates:", error);
    return [];
  }
}

// Usage with date picker (e.g., react-date-range)
async function showAvailabilityCalendar(vehicleId) {
  const disabledDates = await loadUnavailableDates(vehicleId);
  
  // Pass disabledDates to your calendar component
  // Example: <DateRange disabledDates={disabledDates} />
}
```

## Code Flow Diagram

```
User attempts to book vehicle
        ↓
Frontend calls POST /bookings
        ↓
Backend: createBooking()
        ↓
Validate user & vehicle exist
        ↓
Check date range validity
        ↓
Query all CONFIRMED bookings for vehicle
        ↓
Loop through bookings checking for overlaps:
  ┌─ startDate < bookingEndDate?
  ├─ AND endDate > bookingStartDate?
  └─ = OVERLAP FOUND!
        ↓
Overlap found? → Return 409 (Conflict)
No overlap?   → Create PENDING booking
        ↓
Return booking details
        ↓
Frontend proceeds to payment
        ↓
Payment confirmed
        ↓
Booking status → CONFIRMED
        ↓
Dates are now locked for other users
```

## Database Considerations

### Query Performance

To ensure good performance with many bookings, create an index on bookings:

```sql
CREATE INDEX idx_booking_vehicle_status_dates 
  ON bookings(vehicle_id, status, start_date, end_date);
```

This index helps queries like:
```sql
SELECT * FROM bookings 
WHERE vehicle_id = ? 
  AND status = 'Confirmed'
  AND start_date < ? 
  AND end_date > ?;
```

## Edge Cases & Solutions

### Case 1: Booking at Same Time
- User A clicks book on Feb 15-20
- User B clicks book on Feb 15-20 (same moment)
- Both A and B see "available" in their checks
- A creates booking first (PENDING)
- B creates booking (also PENDING - both allow multiple PENDING)
- A completes payment → booking CONFIRMED → dates locked
- B tries to complete payment → should get checkout error on payment verification

**Solution:** Recommend payment immediately after booking to lock dates.

### Case 2: Multiple Date Ranges
- Vehicle booked: Feb 5-10 and Feb 20-25
- Can book: Feb 10-20 (gap between ranges)

**Handled by:** Overlap logic checks each range individually

### Case 3: Exact Date Boundaries
- Booking 1: Feb 5 - Feb 10
- Booking 2: Feb 10 - Feb 15?
- Status: **ALLOWED** (Feb 10 is end of first, start of second - no overlap)

**Note:** You might want to block same-day turnarounds for cleaning. Adjust logic if needed:
```javascript
// Current (allows same day)
return start < bookingEnd && end > bookingStart;

// If you want to block same-day turnaround:
return start <= bookingEnd && end >= bookingStart;
```

### Case 4: Cancelled Bookings
- User A: Booking confirmed for Feb 15-20
- User B: Wants Feb 18-22 (blocked due to A's booking)
- User A cancels booking
- User B: Tries again → Now allowed! (cancellation removed the conflict)

**Automatic:** System checks only CONFIRMED status, so cancellations automatically unblock dates.

## Booking Status Workflow

```
User creates booking
        ↓
Status: PENDING
(Dates not yet locked)
        ↓
User initiates payment
        ↓
Payment gateway callback received
        ↓
Payment verified
        ↓
Status: CONFIRMED ← DATES NOW LOCKED
(Other users blocked from overlapping dates)
        ↓
Rental starts
        ↓
Rental completes
        ↓
Status: COMPLETED

---OR---

User cancels booking before payment
        ↓
Status: CANCELLED
(Dates become available again)

---OR---

Payment fails/expires
        ↓
Status: PENDING (still)
(Dates not locked, can try payment again)
```

## Testing Checklist

- [ ] User A books vehicle Feb 15-20, pays → booking CONFIRMED
- [ ] User B tries to book Feb 16-18 → gets 409 error
- [ ] User B tries to book Feb 12-14 → succeeds
- [ ] User B tries to book Feb 20-25 → succeeds (Feb 20 not in conflict)
- [ ] User A cancels booking → now Feb 15-20 becomes available
- [ ] User B can now book Feb 15-20
- [ ] Multiple users can have PENDING bookings for same dates
- [ ] Only first to complete payment gets CONFIRMED status

## Frontend Integration Tips

1. **Show calendar with unavailable dates** - helps user see what's available
2. **Check availability on date change** - give instant feedback
3. **Don't allow checkout if dates are now booked** - double-check at payment time
4. **Show who booked** - transparency helps (userName in response)
5. **Suggest alternative dates** - if dates are unavailable

## Summary

The double booking prevention system:
- ✅ Prevents date range overlaps for CONFIRMED bookings
- ✅ Uses proper date overlap logic
- ✅ Provides API endpoints to check availability
- ✅ Shows conflicting bookings to help users choose dates
- ✅ Allows multiple PENDING bookings until payment
- ✅ Automatically releases dates on cancellation
- ✅ Efficient with database indexing
