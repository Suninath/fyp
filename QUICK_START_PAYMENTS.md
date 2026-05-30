# Quick Start: Testing Payment Integration

## ⚡ 30-Second Setup

### 1. Verify Environment Configuration
```bash
# Check server/.env contains:
✓ NODE_ENV=development
✓ MOCK_PAYMENTS=true
✓ KHALTI_SECRET_KEY=test_secret_key
✓ BACKEND_URL=http://localhost:3000
✓ FRONTEND_URL=http://localhost:5173
```

### 2. Start Servers
```bash
# Terminal 1: Start Backend
cd server
npm run dev

# Terminal 2: Start Frontend  
cd frontend
npm run dev
```

### 3. Test Payment Flow
1. Go to http://localhost:5173
2. Login as user
3. Create a booking
4. Click "Pay Now"
5. Select payment method (Khalti, eSewa, or NepaliPay)
6. Click "Proceed to Payment"
7. ✅ Should redirect to payment page

---

## 🔍 Debugging Checklist

### Check Backend Logs
```bash
✓ See "📦 Setting up mock payment interceptor..." on startup
✓ See "🎭 Intercepting Khalti request:" when payment initiated
✓ See "✅ Khalti response received:" after API call
```

### Check Frontend Logs
```bash
✓ "Payment initiation result: {...}" in console
✓ "Payment Gateway Data: {...}" in console
✓ "Redirecting to Khalti..." toast notification
```

### Check Network Tab (Browser DevTools)
```bash
✓ POST /api/v1/bookings/:id/payment → 200 OK
✓ Response should have paymentGateway data
```

---

## 💰 Payment Methods Status

| Method | Status | Flow |
|--------|--------|------|
| **Khalti** | ✅ FIXED | API → Redirect |
| **eSewa** | ✅ WORKING | Form POST |
| **NepaliPay** | ✅ FIXED | Form POST |

---

## 📝 Expected Responses

### Success Response:
```json
{
  "status": true,
  "code": 200,
  "message": "Payment initiated",
  "data": {
    "paymentId": 123,
    "bookingId": 456,
    "amount": 5000,
    "method": "Khalti",
    "paymentGateway": {
      "pidx": "jxELuMMuXfj3cDSMnKqLCA",
      "payment_url": "https://khalti.com/payment/...",
      "expires_at": "2026-02-04T12:30:00Z",
      "khaltiUrl": "https://khalti.com/payment/..."
    }
  }
}
```

### Error Response (Before Fix):
```json
{
  "status": false,
  "code": 500,
  "message": "Failed to initiate Khalti payment"
}
```

---

## 🐛 If You Still Get 500 Error

### Step 1: Restart Server
```bash
# Kill server and restart
npm run dev
# Check for "📦 Setting up mock payment interceptor..."
```

### Step 2: Verify Files
```bash
✓ server/src/utils/axiosInstance.ts exists
✓ server/src/service/booking.service.ts imports axiosInstance
✓ server/.env has NODE_ENV=development and MOCK_PAYMENTS=true
```

### Step 3: Check Console
```bash
# Terminal where server is running
# Should see debug logs when payment initiated
🎭 Intercepting Khalti request: https://dev.khalti.com/api/v2/epayment/initiate/
🎭 Mocking Khalti initiate with payload: {...}
```

### Step 4: Clear Cache
```bash
# Clear browser cache
# Clear node_modules (if needed)
rm -rf node_modules
npm install
```

---

## 🎯 Payment Flow Diagram

```
┌─────────────────┐
│  User Action:   │
│  "Pay Now"      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Select Payment Method:     │
│  ○ Khalti                   │
│  ○ eSewa                    │
│  ○ NepaliPay                │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Frontend: Click             │
│  "Proceed to Payment"        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  POST /api/v1/bookings/{id} │
│  /payment                   │
│  { method: "Khalti" }       │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend:                   │
│  generateKhaltiPayload()    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  axiosInstance.post(        │
│  dev.khalti.com/...         │
│  )                          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Mock Interceptor:          │
│  Returns mock response      │
│  (in development)           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Backend Returns:           │
│  paymentGateway with URL    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Frontend Redirects:        │
│  window.location.href =     │
│  payment_url                │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  ✅ User on Khalti          │
│     Payment Page            │
└─────────────────────────────┘
```

---

## 🔑 Key Files Modified

1. **server/src/utils/axiosInstance.ts** ← NEW FILE
   - Mock interceptor setup
   - Logs detailed debug info

2. **server/src/service/booking.service.ts**
   - Uses axiosInstance for all payment calls
   - Cleaner code without redundant mocking

3. **server/.env**
   - Mock payment configuration
   - Payment gateway credentials

4. **frontend/src/components/common/PaymentModal.jsx**
   - Fixed NepaliPay redirect

---

## 📚 Documentation Files

- `KHALTI_PAYMENT_FIX_SUMMARY.md` ← Full documentation
- `PAYMENT_GATEWAY_FLOW.md` ← Flow diagrams
- `PAYMENT_GATEWAY_COMPARISON.md` ← Detailed comparison
- `NEPALI_PAY_FIX.md` ← NepaliPay specific

---

## ✨ What Was Fixed

| Issue | Before | After |
|-------|--------|-------|
| **Khalti 500 Error** | ❌ No interceptor | ✅ Mock interceptor |
| **NepaliPay Redirect** | ❌ Toast only | ✅ Form submission |
| **Debugging** | ❌ Silent failures | ✅ Detailed logs |
| **Code Quality** | ❌ Repeated logic | ✅ Single instance |

---

## 🚀 Next Steps

1. ✅ Test all three payment methods
2. ✅ Verify callbacks work
3. ⚠️ When ready for production:
   - Set `NODE_ENV=production`
   - Set `MOCK_PAYMENTS=false`
   - Add real API credentials

---

## 💬 Common Questions

**Q: Why do I need mock payments?**
A: Because real payment gateways need live credentials and can't be tested without actually paying.

**Q: How does the mock interceptor work?**
A: It catches API calls to payment gateways and returns fake but valid responses.

**Q: Can I use this in production?**
A: No. Set `MOCK_PAYMENTS=false` to use real payment gateways.

**Q: How do I add real credentials?**
A: Update `KHALTI_SECRET_KEY`, `ESEWA_MERCHANT_CODE`, etc. in `.env` and set `MOCK_PAYMENTS=false`.

---

## 📞 Support

If you encounter issues:
1. Check console logs (see Debugging section above)
2. Read `KHALTI_PAYMENT_FIX_SUMMARY.md`
3. Verify all files are modified correctly
4. Restart the server
