# NepaliPay Payment Integration - Fix Summary

## Problem Identified:

NepaliPay was not redirecting users to the payment page because:

1. **Backend Issue**: `generateNepaliPayPayload()` only returned data without a payment gateway URL
2. **Frontend Issue**: `redirectToNepaliPay()` function was only showing a toast message instead of redirecting

## What Was Fixed:

### 1. Backend Changes (`server/src/service/booking.service.ts`):

**Before:**
```typescript
generateNepaliPayPayload(booking: BookingEntity, paymentId: number) {
  const merchantId = process.env.NEPALI_PAY_MERCHANT_ID || "test_merchant";
  const amount = booking.finalAmount;

  return {
    merchantId,
    amount: Math.round(amount),
    orderId: `BOOKING_${booking.id}_${paymentId}`,
    orderDescription: `Vehicle Booking - ${booking.vehicle.name}`,
    successUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/booking/payment/success/nepali-pay`,
    failureUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/booking/payment/failure`,
  };
}
```

**After:**
```typescript
generateNepaliPayPayload(booking: BookingEntity, paymentId: number) {
  const merchantId = process.env.NEPALI_PAY_MERCHANT_ID || "test_merchant";
  const amount = booking.finalAmount;
  const successUrl = `${process.env.BACKEND_URL || "http://localhost:3000"}/api/v1/bookings/payment/callback/nepali-pay`;
  const failureUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/booking/payment/failure`;

  return {
    merchantId,
    amount: Math.round(amount),
    orderId: `BOOKING_${booking.id}_${paymentId}`,
    orderDescription: `Vehicle Booking - ${booking.vehicle.name}`,
    successUrl,
    failureUrl,
    // NepaliPay payment gateway URL (sandbox)
    paymentUrl: `https://payment.nepalipy.com/api/payment/initiate`,
  };
}
```

**Changes:**
- Added `successUrl` pointing to backend callback handler (not frontend)
- Added `paymentUrl` (the payment gateway URL to redirect to)
- Updated to use `BACKEND_URL` for callbacks

### 2. Frontend Changes (`frontend/src/components/common/PaymentModal.jsx`):

**Before:**
```javascript
const redirectToNepaliPay = (data) => {
  // For Nepali Pay bank transfer
  SucessToast({
    message: `Please transfer Rs. ${data.amount} to the account provided. Reference: ${data.orderId}`
  });
};
```

**After:**
```javascript
const redirectToNepaliPay = (data) => {
  // For Nepali Pay - use form submission similar to eSewa
  if (!data.paymentUrl) {
    ErrorToast({ message: "Nepali Pay payment URL not available" });
    console.error("No Nepali Pay URL found in data:", data);
    return;
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.paymentUrl;

  // Nepali Pay expects these field names
  const fields = {
    merchantId: data.merchantId,
    amount: data.amount,
    orderId: data.orderId,
    orderDescription: data.orderDescription,
    successUrl: data.successUrl,
    failureUrl: data.failureUrl,
  };

  Object.keys(fields).forEach((key) => {
    if (fields[key]) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    }
  });

  console.log("Nepali Pay Form Fields:", fields);
  document.body.appendChild(form);
  form.submit();
};
```

**Changes:**
- Now creates an HTML form similar to eSewa
- Auto-submits the form to `paymentUrl`
- Passes all required fields to NepaliPay gateway
- Includes error handling if `paymentUrl` is missing

## How It Works Now:

### NepaliPay Payment Flow (Fixed):
```
Frontend → Backend initiatePayment()
  ↓
Backend calls generateNepaliPayPayload()
  ↓
Backend returns: {
  merchantId,
  amount,
  orderId,
  orderDescription,
  successUrl,          ← Backend callback URL
  failureUrl,          ← Frontend error page
  paymentUrl           ← Gateway URL (NEW!)
}
  ↓
Frontend receives paymentData
  ↓
Frontend creates HTML FORM
  ↓
Frontend auto-submits form to paymentUrl
  ↓
User completes payment on NepaliPay
  ↓
NepaliPay redirects → Backend /api/v1/bookings/payment/callback/nepali-pay
  ↓
Backend verifies payment in nepaliPayCallback()
  ↓
Backend updates payment status + booking status
  ↓
Backend redirects to success page
```

## Comparison of All Three Payment Methods:

| Gateway | Method | Flow | Status |
|---------|--------|------|--------|
| **eSewa** | Form POST | Backend provides URL, Frontend submits form | ✅ Working |
| **Khalti** | API Call | Backend calls API, gets URL, Frontend redirects | ✅ Working |
| **NepaliPay** | Form POST | Backend provides URL, Frontend submits form | ✅ FIXED |

## Testing:

1. Start the server: `npm run dev --prefix server`
2. Start the frontend: `npm run dev --prefix frontend`
3. Create a booking
4. Select "Nepali Pay" as payment method
5. Click "Proceed to Payment"
6. You should now be redirected to NepaliPay payment page (or mock in dev mode)

## Configuration:

Ensure these environment variables are set in `server/.env`:

```
NEPALI_PAY_MERCHANT_ID=your_merchant_id
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

For development with mock payments:
```
NODE_ENV=development
MOCK_PAYMENTS=true
```

## Files Modified:

1. `server/src/service/booking.service.ts` - Updated `generateNepaliPayPayload()`
2. `frontend/src/components/common/PaymentModal.jsx` - Updated `redirectToNepaliPay()`
3. `server/.env` - Added payment configuration (MOCK_PAYMENTS, BACKEND_URL, etc.)
4. `server/src/utils/axiosInstance.ts` - Created for mock payment interceptor
