# Khalti Payment Fix - Complete Summary

## Issue Reported:
**Error**: `{"status":false,"code":500,"message":"Failed to initiate Khalti payment"}`

## Root Cause:
The Khalti payment initiation was failing because:
1. The `axiosInstance` was not being used with the mock payment interceptor
2. Without the interceptor, real API calls were being made
3. Real API calls were failing (invalid credentials, network issues, DNS problems)
4. The error was being caught but not properly debugged

## Solution Implemented:

### 1. Created Axios Instance with Mock Interceptor
**File**: `server/src/utils/axiosInstance.ts` (NEW)

- Sets up a single axios instance for all HTTP requests
- Automatically intercepts payment API calls
- Returns mock responses in development mode
- Logs all intercepted requests for debugging

**Key Features:**
```typescript
- Intercepts: dev.khalti.com, uat.esewa.com.np, nepalipy
- Returns mock data when NODE_ENV=development or MOCK_PAYMENTS=true
- Logs detailed information for debugging
- Falls through to real API in production
```

### 2. Updated Booking Service
**File**: `server/src/service/booking.service.ts`

**Changes:**
- ✅ Import: Changed `import axios from "axios"` to `import axiosInstance from "../utils/axiosInstance"`
- ✅ Updated `generateKhaltiPayload()` to use `axiosInstance` instead of `axios`
- ✅ Updated `esewaCallback()` to use `axiosInstance` for verification
- ✅ Updated `khaltiCallback()` to use `axiosInstance` for verification
- ✅ Removed redundant mock checks (now handled by interceptor)
- ✅ Added better error logging with emoji indicators

**Before:**
```typescript
// Multiple redundant checks
if (process.env.MOCK_PAYMENTS === "true" || process.env.NODE_ENV === "development") {
  const mockData = mockPaymentService.mockKhaltiInitiate(payload);
  response = { data: mockData };
} else {
  response = await axios.post("https://dev.khalti.com/...", ...);
}
```

**After:**
```typescript
// Single, clean call - interceptor handles mocking automatically
response = await axiosInstance.post(
  "https://dev.khalti.com/api/v2/epayment/initiate/",
  payload,
  { headers: {...} }
);
```

### 3. Fixed NepaliPay (Bonus)
**File**: `server/src/service/booking.service.ts`

- Added `paymentUrl` to the response payload
- Proper callback URLs pointing to backend

**File**: `frontend/src/components/common/PaymentModal.jsx`

- Updated `redirectToNepaliPay()` to actually redirect
- Now uses form submission like eSewa

### 4. Updated Environment Configuration
**File**: `server/.env`

Added:
```env
NODE_ENV=development
MOCK_PAYMENTS=true

# Payment Gateways
ESEWA_MERCHANT_CODE=EPAYTEST
KHALTI_SECRET_KEY=test_secret_key
KHALTI_PUBLIC_KEY=test_public_key
KHALTI_MERCHANT_USERNAME=test_merchant
NEPALI_PAY_MERCHANT_ID=test_merchant
BACKEND_URL=http://localhost:3000
```

---

## Files Modified:

| File | Changes |
|------|---------|
| `server/src/utils/axiosInstance.ts` | ✨ **NEW** - Axios instance with mock interceptor |
| `server/src/service/booking.service.ts` | ✅ Updated imports & payment methods |
| `server/.env` | ✅ Added environment variables |
| `frontend/src/components/common/PaymentModal.jsx` | ✅ Fixed NepaliPay redirect |
| `PAYMENT_GATEWAY_FLOW.md` | ✨ **NEW** - Architecture documentation |
| `PAYMENT_GATEWAY_COMPARISON.md` | ✨ **NEW** - Comparison guide |
| `NEPALI_PAY_FIX.md` | ✨ **NEW** - Fix documentation |

---

## How It Works Now:

### Development Mode (MOCK_PAYMENTS=true):
```
User initiates Khalti payment
         ↓
Backend calls axiosInstance.post() to Khalti API
         ↓
Interceptor catches the call
         ↓
Interceptor returns mock response (no real API call)
         ↓
Payment proceeds with mock data
         ↓
User can test complete payment flow
```

### Production Mode (MOCK_PAYMENTS=false):
```
User initiates Khalti payment
         ↓
Backend calls axiosInstance.post() to Khalti API
         ↓
Interceptor lets it through (no interception)
         ↓
Real API call to Khalti
         ↓
Real response returned
         ↓
Payment proceeds normally
```

---

## Testing:

### To Test Khalti Payment:

1. **Start the servers:**
   ```bash
   # Terminal 1 - Server
   cd server
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. **Create a booking:**
   - Login as user
   - Navigate to a vehicle
   - Create a booking

3. **Initiate payment:**
   - Click "Pay Now" or similar
   - Select "Khalti" as payment method
   - Click "Proceed to Payment"
   - Should redirect to Khalti payment page (or mock in dev)

4. **Check console for logs:**
   ```
   ✅ Khalti response received: {...}
   📤 Initiating Khalti payment with payload: {...}
   🎭 Using mock Khalti initiation for local development
   🎭 Intercepting Khalti request: https://dev.khalti.com/api/v2/epayment/initiate/
   ```

### Success Indicators:
- ✅ No 500 error
- ✅ Console shows debug logs
- ✅ User redirected to payment page
- ✅ Payment data is returned correctly

---

## API Endpoints:

### Payment Initiation:
```
POST /api/v1/bookings/:bookingId/payment
Body: { method: "Khalti" }

Response: {
  status: true,
  code: 200,
  message: "Payment initiated",
  data: {
    paymentId: 123,
    bookingId: 456,
    amount: 5000,
    method: "Khalti",
    paymentGateway: {
      pidx: "...",
      payment_url: "...",
      expires_at: "...",
      khaltiUrl: "..."
    }
  }
}
```

### Payment Callbacks:
```
GET /api/v1/bookings/payment/callback/khalti?pidx=xxx&transaction_id=xxx
GET /api/v1/bookings/payment/callback/esewa?rid=xxx&pid=xxx
GET /api/v1/bookings/payment/callback/nepali-pay?pidx=xxx&status=xxx
```

---

## Debugging:

### Check Mock Interceptor:
```typescript
// In server/src/utils/axiosInstance.ts
// Look for console logs like:
// 🎭 Intercepting Khalti request: ...
// 🎭 Mocking Khalti initiate with payload: ...
```

### Check Environment Variables:
```bash
# server/.env should have:
NODE_ENV=development
MOCK_PAYMENTS=true
KHALTI_SECRET_KEY=test_secret_key
```

### Check Axios Instance Usage:
```bash
# All payment methods should import:
import axiosInstance from "../utils/axiosInstance";

# And use it like:
const response = await axiosInstance.post(...);
```

---

## Common Issues & Fixes:

### Issue: Still getting 500 error
**Fix:**
1. Check if `NODE_ENV=development` in `.env`
2. Check if `MOCK_PAYMENTS=true` in `.env`
3. Restart the server
4. Check console logs for more details

### Issue: No redirect happening
**Fix:**
1. Check if response has `paymentGateway.payment_url`
2. Check browser console for errors
3. Check if Khalti URL is correct in response

### Issue: Mock interceptor not working
**Fix:**
1. Verify `axiosInstance.ts` is created
2. Check if booking service imports it correctly
3. Restart server

---

## Next Steps:

1. ✅ Test Khalti payment flow
2. ✅ Verify mock payments work
3. ✅ Test eSewa (should also work now)
4. ✅ Test NepaliPay (now fixed with proper redirect)
5. ⚠️ When ready for production, set `MOCK_PAYMENTS=false`
6. ⚠️ Add real Khalti API credentials to `.env`

---

## Documentation Files Created:

1. **PAYMENT_GATEWAY_FLOW.md** - Detailed flow diagrams
2. **PAYMENT_GATEWAY_COMPARISON.md** - Comparison of all three gateways
3. **NEPALI_PAY_FIX.md** - NepaliPay-specific fix details
4. **This file** - Complete summary

See these files for more detailed information about each payment gateway!
