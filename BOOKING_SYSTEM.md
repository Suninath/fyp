# Vehicle Booking System Documentation

## Overview
A comprehensive vehicle booking and rental system with integrated Nepali payment gateways (eSewa, Khalti, and Nepali Pay).

## Features

### 1. **Booking Management**
- Users can book vehicles for specific date ranges
- Real-time availability checking
- Automatic price calculation based on rental duration
- Location-based booking

### 2. **Payment Integration**
Supports three major Nepali payment methods:
- **eSewa**: Digital wallet payments
- **Khalti**: Mobile wallet payments
- **Nepali Pay**: Bank transfer payments

### 3. **Booking Status Tracking**
- `Pending`: Awaiting payment confirmation
- `Confirmed`: Payment completed, booking confirmed
- `Completed`: Rental period completed
- `Cancelled`: Booking cancelled by user

## Backend Architecture

### Entities

#### BookingEntity
```typescript
{
  id: number;
  user: UserEntity;
  vehicle: VehicleEntity;
  startDate: Date;
  endDate: Date;
  location: string;
  dailyRate: number;
  numberOfDays: number;
  totalAmount: number;
  discount?: number;
  finalAmount: number;
  status: BOOKING_STATUS;
  notes?: string;
  payments: PaymentEntity[];
}
```

#### PaymentEntity
```typescript
{
  id: number;
  booking: BookingEntity;
  amount: number;
  method: PAYMENT_METHOD; // eSewa, Khalti, NepaliPay
  status: PAYMENT_STATUS; // Pending, Success, Failed
  transactionId?: string;
  response?: string;
  paidAt?: Date;
  refundId?: string;
  refundAmount?: number;
  refundedAt?: Date;
}
```

### API Routes

#### Booking Routes
```
POST   /api/v1/bookings                    - Create new booking
GET    /api/v1/bookings                    - Get user's bookings
GET    /api/v1/bookings/:id               - Get booking details
PATCH  /api/v1/bookings/:id/cancel        - Cancel booking
GET    /api/v1/bookings/vehicle/:vehicleId - Get vehicle availability
```

#### Payment Routes
```
POST  /api/v1/bookings/:bookingId/payment           - Initiate payment
POST  /api/v1/bookings/payment/callback/esewa       - eSewa callback
POST  /api/v1/bookings/payment/callback/khalti      - Khalti callback
POST  /api/v1/bookings/payment/callback/nepali-pay  - Nepali Pay callback
GET   /api/v1/bookings/:bookingId/payment/status    - Check payment status
```

### Services

#### BookingService Methods
- `createBooking()` - Create new booking with validation
- `getUserBookings()` - Fetch user's booking history (paginated)
- `getBookingById()` - Get detailed booking information
- `cancelBooking()` - Cancel pending booking
- `getVehicleBookings()` - Check vehicle availability

#### Payment Methods
- `initiatePayment()` - Initialize payment process
- `esewaCallback()` - Handle eSewa payment verification
- `khaltiCallback()` - Handle Khalti payment verification
- `nepaliPayCallback()` - Handle Nepali Pay verification
- `getPaymentStatus()` - Get current payment status

## Frontend Architecture

### Redux Store
```javascript
// Location: src/rtk/slice/bookingSlice.js
State: {
  bookings: [],           // User's bookings list
  currentBooking: null,   // Selected booking details
  vehicleBookings: [],    // Vehicle availability dates
  paymentData: null,      // Payment gateway data
  loading: boolean,
  error: null,
  pagination: {}
}
```

### Components

#### 1. **BookingFilter**
- Location: `src/components/userComp/BookingFilter.jsx`
- Features:
  - Date range selection
  - Location selection
  - Real-time price calculation
  - Vehicle availability checking
  - Booking creation

#### 2. **PaymentModal**
- Location: `src/components/common/PaymentModal.jsx`
- Features:
  - Payment method selection
  - Payment gateway integration
  - Transaction processing
  - Payment status display

#### 3. **BookingHistory**
- Location: `src/components/userComp/BookingHistory.jsx`
- Features:
  - List all user bookings
  - Booking status display
  - Cancel booking functionality
  - Pagination support
  - Booking details view

#### 4. **UserBookingsPage**
- Location: `src/pages/user/bookings.jsx`
- Features:
  - Complete booking management interface
  - Booking statistics
  - Filter by status
  - Responsive design

### Pages
```
/bookings                 - User's booking history and management
/vehicles/public/:id      - Vehicle details with booking option
```

## Payment Gateway Integration

### eSewa Integration
```javascript
// Configuration
Merchant Code: EPAYTEST (test environment)
Environment: https://rc-epay.esewa.com.np/api/epay/main/v2/form

// Payload Structure
{
  amt: amount in NPR,
  psc: 0,
  pdc: 0,
  txAmt: 0,
  tAmt: total amount,
  pid: transaction UUID,
  scd: merchant code,
  su: success URL,
  fu: failure URL
}
```

### Khalti Integration (KPG-2 Web Checkout)

Khalti ePayment integration using the latest Web Checkout (KPG-2) API.

**API Flow:**
1. Backend calls Khalti API to initiate payment
2. Khalti returns `payment_url` and `pidx`
3. Frontend redirects user to `payment_url`
4. User completes payment on Khalti portal
5. Khalti redirects to `return_url` with status parameters
6. Backend verifies payment using lookup API

**API Endpoints:**
- Sandbox: `https://dev.khalti.com/api/v2/epayment/initiate/`
- Production: `https://khalti.com/api/v2/epayment/initiate/`
- Lookup: `/epayment/lookup/` (same base URL)

**Test Credentials:**
- Khalti ID: 9800000000 - 9800000005
- MPIN: 1111
- OTP: 987654

Get sandbox keys from: https://test-admin.khalti.com/

### Nepali Pay Integration
```javascript
// Configuration
Merchant ID: From environment variables
Payment Method: Bank transfer with reference code
```

## Environment Variables

Create `.env` file in backend with:
```
# eSewa Configuration
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q
ESEWA_API_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form

# Khalti Configuration (KPG-2)
# Get live_secret_key from https://test-admin.khalti.com/ (sandbox) or https://admin.khalti.com/ (prod)
KHALTI_SECRET_KEY=live_secret_key_from_khalti_dashboard
KHALTI_RETURN_URL=http://localhost:3000/api/v1/bookings/payment/callback/khalti

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

## Database Schema

### booking table
```sql
CREATE TABLE booking (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES user(id),
  vehicle_id INTEGER REFERENCES vehicle(id),
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  location VARCHAR(100) NOT NULL,
  daily_rate NUMERIC(12,2) NOT NULL,
  number_of_days INTEGER NOT NULL,
  total_amount NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2),
  final_amount NUMERIC(12,2) NOT NULL,
  status ENUM NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE payment (
  id SERIAL PRIMARY KEY,
  booking_id INTEGER REFERENCES booking(id),
  amount NUMERIC(12,2) NOT NULL,
  method ENUM NOT NULL,
  status ENUM DEFAULT 'Pending',
  transaction_id VARCHAR(255),
  response TEXT,
  paid_at TIMESTAMP,
  refund_id VARCHAR(255),
  refund_amount NUMERIC(12,2),
  refunded_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP
);
```

## Usage Flow

### User Booking Flow
1. User views vehicle details
2. User selects start and end dates
3. System calculates number of days and total price
4. User confirms booking
5. System creates booking with PENDING status
6. PaymentModal opens
7. User selects payment method
8. User completes payment on gateway
9. Gateway redirects to callback URL
10. System verifies payment
11. Booking status updated to CONFIRMED
12. User receives confirmation

### Admin Management
Admins can:
- View all bookings
- View booking analytics
- Process refunds
- Update booking status
- Manage vehicle availability

## Error Handling

### Validation Errors
- Date validation (end date must be after start date)
- Vehicle availability check
- User authentication check
- Payment method validation

### Payment Errors
- Failed transaction verification
- Timeout handling
- Retry mechanism
- Refund processing

## Testing

### Test Credentials
- **eSewa Test**: Merchant code `EPAYTEST`
- **Khalti Test**: Use test public/secret keys
- **Nepali Pay Test**: Use test merchant ID

### Test Cases
1. Create booking with valid dates
2. Create booking with conflicting dates (should fail)
3. Payment success callback
4. Payment failure callback
5. Cancel pending booking
6. Check booking history

## Future Enhancements

1. **Cancellation Policies**
   - Flexible cancellation with refund percentage
   - Non-refundable bookings
   - Change booking dates

2. **Notifications**
   - Email confirmations
   - SMS reminders
   - Payment receipts

3. **Advanced Features**
   - Insurance options
   - Driver addition
   - Vehicle upgrades
   - Seasonal pricing

4. **Analytics**
   - Revenue reports
   - Popular booking periods
   - Vehicle utilization rates
   - Customer insights

## Security Considerations

1. **Payment Security**
   - Use HTTPS for all transactions
   - Validate payment callbacks
   - Store sensitive data encrypted
   - PCI DSS compliance for payment handling

2. **Data Protection**
   - Validate all user inputs
   - Use rate limiting on APIs
   - Implement booking access controls
   - Audit payment transactions

3. **Transaction Verification**
   - Verify all payment gateway responses
   - Check transaction IDs
   - Validate amount consistency
   - Implement idempotency

## Troubleshooting

### Booking Creation Fails
- Check vehicle ID validity
- Verify date format (ISO 8601)
- Ensure user is authenticated
- Check for date conflicts

### Payment Redirect Issues
- Verify gateway URLs are correct
- Check environment variables
- Validate merchant codes
- Test with test credentials

### Callback Issues
- Verify callback endpoint is accessible
- Check request headers
- Validate transaction data
- Review server logs
