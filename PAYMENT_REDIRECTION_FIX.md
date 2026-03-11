# Payment Redirection - Debugging & Fix Guide

## 🔴 Issues Fixed

### Issue 1: eSewa Form Field Names
**Problem:** Form was sending incorrect field names and amounts
- `txAmt` was set to `0` instead of the actual amount
- Extra field `tAmt` that eSewa doesn't recognize
- Amount was divided by 100 unnecessarily

**Fix:** 
- Changed to use correct field names: `amt`, `psc`, `pdc`, `txAmt`
- Fixed amount calculation: `txAmt = amt + psc - pdc`
- Using field names directly from backend payload

### Issue 2: Payment Gateway Data Not Accessible
**Problem:** Frontend was looking for fields that didn't exist in the response
- Expected: `data.transactionUuid` (doesn't exist)
- Expected: `data.merchantCode` (doesn't exist)
- Expected: `data.successUrl` (doesn't exist)

**Fix:**
- Now using fields that are actually returned by backend
- `pid` instead of `transactionUuid`
- `merchant_code` instead of `merchantCode`
- `su` instead of `successUrl`

### Issue 3: Missing Error Handling
**Problem:** No error messages if redirection failed
- No console logs for debugging
- No null checks on payment data

**Fix:**
- Added comprehensive console logging
- Added null checks for payment gateway data
- Added timeout for smoother transition
- Better error messages to user

---

## ✅ What Was Changed

### Frontend Changes
**File:** `frontend/src/components/common/PaymentModal.jsx`

1. **Fixed `redirectToEsewa()` function:**
   ```javascript
   // Before (WRONG)
   const fields = {
     amt: Math.round(data.amount) / 100,
     txAmt: 0,           // WRONG - should be amount
     tAmt: amount,       // WRONG - extra field
     pid: data.transactionUuid,  // WRONG - doesn't exist
   };

   // After (CORRECT)
   const fields = {
     amt: data.amt,            // Use backend value
     txAmt: amt,               // Same as amt for now
     pid: data.pid,            // Correct field name
     scd: data.merchant_code,  // Correct field name
   };
   ```

2. **Enhanced `handlePayment()` function:**
   - Added logging to see response from backend
   - Added null checks for payment data
   - Added timeout for smooth transition
   - Better error handling with console output

3. **Improved `redirectToKhalti()` function:**
   - Added logging for debugging
   - Better error messages

### Backend Changes
**File:** `server/src/service/booking.service.ts`

1. **Added detailed logging to `initiatePayment()`:**
   - Logs when payment is created
   - Logs payload for each payment method
   - Logs final response sent to frontend

**File:** `server/src/controller/booking.controller.ts`

1. **Added logging to controller:**
   - Logs incoming request parameters
   - Logs response being sent

---

## 🧪 Testing the Fix

### Step 1: Start Backend with Logging
```powershell
cd server
npm run dev
```

Watch for these logs:
```
Payment initiation: userId=1, bookingId=1, method=eSewa
Payment created: paymentId=1, method=eSewa, amount=1000
eSewa payload generated: { amt: 1000, pid: BOOKING_1_1_..., ... }
Payment initiation successful: { status: true, data: { paymentGateway: {...} } }
```

### Step 2: Start Frontend
```powershell
cd frontend
npm run dev
```

### Step 3: Test eSewa Payment
1. Open `http://localhost:5173`
2. Create a booking
3. Click "Pay Now"
4. Select "eSewa"
5. Click "Proceed to Payment"

**Expected Console Output (Frontend):**
```
Payment initiation result: { status: true, data: { paymentGateway: {...} } }
Payment Gateway Data: { amt: 1000, pid: BOOKING_1_1_..., ... }
eSewa Form Fields: { amt: 1000, psc: 0, pdc: 0, txAmt: 1000, ... }
```

**Expected Behavior:**
- Form created and submitted automatically
- Redirected to eSewa payment page (or mock page in development)

### Step 4: Test Khalti Payment
1. Open `http://localhost:5173`
2. Create a booking
3. Click "Pay Now"
4. Select "Khalti"
5. Click "Proceed to Payment"

**Expected Console Output (Frontend):**
```
Payment initiation result: { status: true, data: { paymentGateway: {...} } }
Payment Gateway Data: { payment_url: "https://khalti.com/...", ... }
Khalti redirect data: { payment_url: "https://khalti.com/..." }
Khalti URL: https://khalti.com/...
```

**Expected Behavior:**
- Redirected to Khalti payment page (or mock page)

---

## 🔍 Debugging Checklist

If payments still don't redirect:

### 1. Check Backend Logs
```
☐ Is payment created successfully?
☐ Is payload generated for the payment method?
☐ Is response being returned to frontend?
☐ Check: console shows "Payment initiation successful"
```

### 2. Check Frontend Console (Browser DevTools)
```
☐ Does result.payload have status: true?
☐ Does paymentGateway exist?
☐ For eSewa: Are all form fields present?
☐ For Khalti: Is khaltiUrl present?
```

### 3. Check Network Tab (Browser DevTools)
```
☐ POST /api/v1/bookings/:id/payment
  - Status: 200
  - Response has: { status: true, data: { paymentGateway: {...} } }
```

### 4. Network Issues
```
☐ Backend running on http://localhost:3000?
☐ Frontend running on http://localhost:5173?
☐ CORS enabled on backend?
☐ AuthToken in localStorage?
```

### 5. Booking Issues
```
☐ Is booking in PENDING state?
☐ Does booking belong to current user?
☐ finalAmount > 0?
```

---

## 📋 eSewa Form Fields Reference

When form is submitted to eSewa, these fields are sent:

| Field | Value | Description |
|-------|-------|-------------|
| `amt` | 1000 | Amount in rupees |
| `psc` | 0 | Service charge |
| `pdc` | 0 | Discount |
| `txAmt` | 1000 | Total: amt + psc - pdc |
| `pid` | BOOKING_1_1_... | Product ID / Transaction UUID |
| `scd` | EPAYTEST | Merchant code |
| `su` | http://localhost:3000/... | Success callback URL |
| `fu` | http://localhost:5173/... | Failure callback URL |

### Example eSewa URL After Form Submission
```
POST https://uat.esewa.com.np/epay/main
Body: amt=1000&psc=0&pdc=0&txAmt=1000&pid=BOOKING_1_1_...&scd=EPAYTEST&su=...&fu=...
```

---

## 🧬 Khalti Response Structure

Backend returns:
```json
{
  "pidx": "mock_pidx_123456",
  "payment_url": "https://khalti.com/pay?pidx=mock_pidx_123456",
  "expires_at": "2026-02-04T11:23:54Z",
  "khaltiUrl": "https://khalti.com/pay?pidx=mock_pidx_123456"
}
```

Frontend extracts:
```javascript
const khaltiUrl = data.payment_url || data.khaltiUrl;
window.location.href = khaltiUrl;
```

---

## 💾 Quick Verification Steps

### Verify eSewa Works
```bash
# 1. Create booking via API
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": 1,
    "startDate": "2026-02-05",
    "endDate": "2026-02-07",
    "location": "Kathmandu"
  }'

# 2. Initiate payment
curl -X POST http://localhost:3000/api/v1/bookings/1/payment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "method": "eSewa" }'

# 3. Check response has:
# - status: true
# - data.paymentGateway with: amt, pid, scd, su, fu, esewaUrl
```

### Verify Khalti Works
```bash
# Same as above but with method: "Khalti"
curl -X POST http://localhost:3000/api/v1/bookings/1/payment \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{ "method": "Khalti" }'

# Check response has:
# - status: true
# - data.paymentGateway with: pidx, payment_url, khaltiUrl, expires_at
```

---

## 🔗 Related Files Modified

1. **frontend/src/components/common/PaymentModal.jsx**
   - Fixed form field names
   - Added error handling and logging
   - Added null checks

2. **server/src/service/booking.service.ts**
   - Added detailed logging
   - Ensures all payload fields are present

3. **server/src/controller/booking.controller.ts**
   - Added request/response logging

---

## 🚀 After Verification

Once payment redirection is working:

1. **Test full flow:**
   - Create booking
   - Pay with eSewa (mock succeeds instantly)
   - Verify callback received
   - Check payment status updated to SUCCESS
   - Check booking status updated to CONFIRMED

2. **Test with Khalti:**
   - Create booking
   - Pay with Khalti (mock succeeds instantly)
   - Verify callback received
   - Check database: payment and booking updated

3. **Test error cases:**
   - Invalid booking ID
   - Booking in wrong state
   - Missing payment data
   - Network error

---

## 📝 Console Output Examples

### Successful eSewa Flow
```
Backend:
  Payment initiation: userId=1, bookingId=1, method=eSewa
  Payment created: paymentId=1, method=eSewa, amount=1000
  eSewa payload generated: { amt: 1000, pid: 'BOOKING_1_1_1706887234234', ... }
  Payment initiation successful: { status: true, ... }

Frontend:
  Payment initiation result: { status: true, data: { paymentGateway: {...} } }
  Payment Gateway Data: { amt: 1000, pid: 'BOOKING_1_1_1706887234234', ... }
  eSewa Form Fields: { amt: 1000, psc: 0, pdc: 0, txAmt: 1000, ... }
  [Form submitted to eSewa]
  [Redirected to payment page]
```

### Successful Khalti Flow
```
Backend:
  Payment initiation: userId=1, bookingId=1, method=Khalti
  Payment created: paymentId=1, method=Khalti, amount=1000
  🎭 Using mock Khalti initiation for local development
  Khalti payload generated: { pidx: 'mock_pidx_...', payment_url: '...' }
  Payment initiation successful: { status: true, ... }

Frontend:
  Payment initiation result: { status: true, data: { paymentGateway: {...} } }
  Payment Gateway Data: { pidx: 'mock_pidx_...', payment_url: '...' }
  Khalti redirect data: { pidx: 'mock_pidx_...', payment_url: '...' }
  Khalti URL: https://khalti.com/mock/...
  [Redirected to Khalti]
```

---

## ✅ Summary

The payment redirection issue has been fixed by:

1. **Correcting eSewa form field names and values**
2. **Using correct field names from backend response**
3. **Adding comprehensive error handling and logging**
4. **Adding null checks and timeouts**
5. **Better error messages for debugging**

Test the fix and check console logs to verify everything is working correctly.
