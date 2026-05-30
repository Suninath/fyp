# Payment System Complete Verification & Testing Guide

## 🔍 System Status

### ✅ Backend Implementation
- [x] Axios instance with mock interceptor created
- [x] All three payment methods implemented
- [x] Khalti async API integration
- [x] eSewa form-based submission
- [x] NepaliPay form-based submission
- [x] Payment callback handlers for all methods
- [x] Environment variables configured

### ✅ Frontend Implementation
- [x] PaymentModal component with all three methods
- [x] eSewa redirect with form submission
- [x] Khalti redirect with window.location.href
- [x] NepaliPay redirect with form submission
- [x] Success toasts for all methods
- [x] Proper error handling
- [x] Detailed console logging

---

## 🧪 Complete Testing Checklist

### 1. **Environment Setup**
```bash
# Verify server/.env has:
✓ NODE_ENV=development
✓ MOCK_PAYMENTS=true
✓ KHALTI_SECRET_KEY=test_secret_key
✓ ESEWA_MERCHANT_CODE=EPAYTEST
✓ NEPALI_PAY_MERCHANT_ID=test_merchant
✓ BACKEND_URL=http://localhost:3000
✓ FRONTEND_URL=http://localhost:5173
```

### 2. **Start Servers**
```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Expected: Both servers running on correct ports
```

### 3. **Test Khalti Payment**

**Steps:**
1. Open http://localhost:5173
2. Login as user
3. Create a booking
4. Click "Pay Now"
5. Select "Khalti"
6. Click "Proceed to Payment"

**Expected Logs (Backend):**
```
📤 Initiating Khalti payment with payload: {...}
🎭 Mocking Khalti initiate with payload: {...}
✅ Khalti response received: {pidx: "...", payment_url: "..."}
```

**Expected Logs (Frontend - Console):**
```
Payment initiation result: {...}
Payment Gateway Data: {pidx: "...", payment_url: "...", khaltiUrl: "..."}
Redirecting to Khalti...
Khalti redirect data: {...}
Khalti URL: https://khalti.com/...
```

**Expected Behavior:**
- ✅ Shows "Redirecting to Khalti..." toast
- ✅ Redirects to Khalti payment page
- ✅ No 500 error

---

### 4. **Test eSewa Payment**

**Steps:**
1. Open http://localhost:5173
2. Create another booking
3. Click "Pay Now"
4. Select "eSewa"
5. Click "Proceed to Payment"

**Expected Logs (Backend):**
```
eSewa payload generated: {
  amt: 5000,
  pid: "BOOKING_...",
  merchant_code: "EPAYTEST",
  esewaUrl: "https://uat.esewa.com.np/epay/main"
}
```

**Expected Logs (Frontend - Console):**
```
Payment initiation result: {...}
Payment Gateway Data: {amt: ..., pid: ..., esewaUrl: "..."}
Redirecting to eSewa...
eSewa Form Fields: {amt: ..., pid: ..., ...}
```

**Expected Behavior:**
- ✅ Shows "Redirecting to eSewa..." toast
- ✅ Form submits to eSewa
- ✅ Redirects to eSewa payment page

---

### 5. **Test NepaliPay Payment**

**Steps:**
1. Open http://localhost:5173
2. Create another booking
3. Click "Pay Now"
4. Select "Nepali Pay"
5. Click "Proceed to Payment"

**Expected Logs (Backend):**
```
📋 NepaliPay payload generated: {
  merchantId: "test_merchant",
  amount: 5000,
  orderId: "BOOKING_...",
  paymentUrl: "https://payment.nepalipy.com/api/payment/initiate"
}
```

**Expected Logs (Frontend - Console):**
```
Payment initiation result: {...}
Payment Gateway Data: {
  merchantId: "...",
  amount: 5000,
  paymentUrl: "..."
}
Redirecting to Nepali Pay...
🎯 Nepali Pay redirect called with data: {...}
✅ Nepali Pay URL found: https://payment.nepalipy.com/api/payment/initiate
📋 Creating Nepali Pay form with fields: {...}
📤 Appending form to document and submitting...
🚀 Submitting Nepali Pay form...
```

**Expected Behavior:**
- ✅ Shows "Redirecting to Nepali Pay..." toast
- ✅ Form submits to NepaliPay
- ✅ Redirects to NepaliPay payment page

---

## 🐛 Troubleshooting

### Issue 1: Getting 500 Error
**Diagnosis:**
```bash
# Check backend logs for:
❌ "Failed to initiate Khalti payment"
❌ "Failed to generate payment gateway data"
```

**Fixes:**
1. Verify axiosInstance.ts exists
2. Verify booking.service.ts imports axiosInstance
3. Check NODE_ENV=development in .env
4. Check MOCK_PAYMENTS=true in .env
5. Restart server

---

### Issue 2: No Toast/Redirect
**Diagnosis:**
```bash
# Frontend console should show:
✅ "Payment initiation result:"
✅ "Payment Gateway Data:"
```

**If missing:**
1. Check backend returns correct response
2. Check booking exists and is PENDING
3. Check payment was created

**If present but no redirect:**
1. Check if payment method specific logs appear
2. For Khalti: Check for "Khalti redirect data:"
3. For eSewa: Check for "eSewa Form Fields:"
4. For NepaliPay: Check for "Nepali Pay redirect called"

---

### Issue 3: Missing Payment Data
**Diagnosis:**
```javascript
// In browser console, check:
result.payload.data.paymentGateway // Should not be null/undefined
```

**Fixes:**
1. Verify generateKhaltiPayload() returns correct structure
2. Verify generateEsewaPayload() returns correct structure
3. Verify generateNepaliPayPayload() returns correct structure

---

## 📝 Key Files Summary

### Backend
- `server/src/utils/axiosInstance.ts` - Mock interceptor
- `server/src/service/booking.service.ts` - Payment logic
  - `initiatePayment()` - Entry point
  - `generateKhaltiPayload()` - Khalti
  - `generateEsewaPayload()` - eSewa
  - `generateNepaliPayPayload()` - NepaliPay
  - `khaltiCallback()` - Khalti verification
  - `esewaCallback()` - eSewa verification
  - `nepaliPayCallback()` - NepaliPay verification
- `server/.env` - Configuration

### Frontend
- `frontend/src/components/common/PaymentModal.jsx`
  - `handlePayment()` - Initiates payment
  - `redirectToKhalti()` - Khalti redirect
  - `redirectToEsewa()` - eSewa redirect
  - `redirectToNepaliPay()` - NepaliPay redirect
- `frontend/src/rtk/slice/bookingSlice.js`
  - `initiatePayment()` thunk

---

## ✨ Features

### All Three Methods Support:
✅ Mock payments in development
✅ Production ready with real credentials
✅ Proper error handling
✅ Detailed logging
✅ Success/failure callbacks
✅ Payment verification

### Khalti Specific:
✅ Async API initiation
✅ Payment expiry handling
✅ Amount conversion to paisa
✅ Lookup verification

### eSewa Specific:
✅ Form submission
✅ Merchant code integration
✅ Transaction UUID tracking

### NepaliPay Specific:
✅ Form submission
✅ Merchant ID integration
✅ Bank transfer flow

---

## 🚀 Production Setup

To use real payment gateways:

1. **Get Credentials:**
   - Khalti: https://test-admin.khalti.com
   - eSewa: https://developer.esewa.com.np
   - NepaliPay: Contact support

2. **Update .env:**
```env
NODE_ENV=production
MOCK_PAYMENTS=false

KHALTI_SECRET_KEY=your_real_secret_key
KHALTI_PUBLIC_KEY=your_real_public_key
KHALTI_MERCHANT_USERNAME=your_merchant_username

ESEWA_MERCHANT_CODE=your_merchant_code

NEPALI_PAY_MERCHANT_ID=your_merchant_id
```

3. **Test thoroughly** before going live

---

## 📊 Payment Flow Diagram

```
┌──────────────────┐
│  User Booking    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  Payment Method Select   │
└────────┬─────────────────┘
         │
    ┌────┴────┬────────┬──────────┐
    ▼         ▼        ▼          ▼
  Khalti   eSewa   NepaliPay  (others)
    │        │         │
    │        │         │
    ▼        ▼         ▼
  API     Form       Form
  Call    Submit     Submit
    │        │         │
    ▼        ▼         ▼
  Verify  Redirect  Redirect
    │        │         │
    ▼        ▼         ▼
  Update   Update    Update
  Payment  Payment   Payment
```

---

## ✅ Success Criteria

- [ ] All three payment methods appear in selection
- [ ] Khalti initiates with API call
- [ ] eSewa redirects with form
- [ ] NepaliPay redirects with form
- [ ] All show proper toast messages
- [ ] No 500 errors
- [ ] Console logs show expected messages
- [ ] Proper redirects happen
- [ ] Mock mode works in development
- [ ] Ready for production credentials

---

## 🎯 Quick Test Commands

```bash
# Check environment
grep -E "NODE_ENV|MOCK_PAYMENTS" server/.env

# Check backend files
ls -la server/src/utils/axiosInstance.ts
grep "axiosInstance" server/src/service/booking.service.ts

# Check frontend files
grep "redirectToKhalti\|redirectToEsewa\|redirectToNepaliPay" frontend/src/components/common/PaymentModal.jsx

# Run servers
npm run dev --prefix server &
npm run dev --prefix frontend &
```

---

## 📞 Support

If issues persist:
1. Check all files mentioned above
2. Verify environment variables
3. Restart servers
4. Clear browser cache
5. Check console logs (both backend and frontend)
6. Review error messages carefully
