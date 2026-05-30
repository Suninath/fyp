# Payment System - Complete End-to-End Testing Guide

## 🎯 Pre-Testing Checklist

Before testing, ensure:

```bash
# 1. Check all files exist
✓ server/src/utils/axiosInstance.ts
✓ server/src/service/booking.service.ts (has payment methods)
✓ frontend/src/components/common/PaymentModal.jsx
✓ server/.env (has all variables)

# 2. Verify database
✓ PostgreSQL running
✓ Database created (fyp)
✓ Tables migrated
✓ At least one user exists

# 3. Check environment
✓ Node.js v18+
✓ npm packages installed on both frontend and backend
```

---

## 🚀 Step-by-Step Test Execution

### Phase 1: Server Startup (5 minutes)

#### Step 1.1: Start Backend Server
```bash
cd server
npm run dev
```

**Expected Output:**
```
Database initialized
Server listening on port 3000
📦 Setting up mock payment interceptor...
```

#### Step 1.2: Start Frontend Server
```bash
# In another terminal
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v7.2.5 running at:
  ➜ Local: http://localhost:5173/
```

#### Step 1.3: Verify Connectivity
- Open http://localhost:5173 in browser
- Should see landing page
- No connection errors in console

---

### Phase 2: User Setup (3 minutes)

#### Step 2.1: Create/Login User
1. Click "Sign Up" or "Login"
2. Create a test user account OR login with existing credentials
3. Verify you're logged in (should see dashboard)

**Check:**
- ✅ No auth errors
- ✅ User profile loads
- ✅ Can navigate to vehicle catalog

---

### Phase 3: Vehicle Setup (3 minutes)

#### Step 3.1: Find a Vehicle
1. Navigate to "Vehicles" or "Vehicle Catalog"
2. Select any vehicle
3. Note the vehicle details (name, price)

**Check:**
- ✅ Vehicle loads
- ✅ Can see price
- ✅ "Book Now" button available

---

### Phase 4: Khalti Payment Test (5 minutes)

#### Step 4.1: Create Khalti Booking
1. On vehicle page, fill booking form:
   - Check-in date: Today + 1 day
   - Check-out date: Today + 3 days
   - Location: Your location
2. Click "Create Booking"

**Backend Console Check:**
```
Payment created: paymentId=X, method=Khalti, amount=XXXX
```

**Frontend Console Check:**
```
Booking created successfully
```

#### Step 4.2: Initiate Khalti Payment
1. On bookings page, find the new booking
2. Click "Pay Now"
3. Select "Khalti"
4. Click "Proceed to Payment"

**Backend Console Should Show:**
```
📤 Initiating Khalti payment with payload: {
  amount: XXXXX,
  purchase_order_id: "BOOKING_X_X",
  ...
}
🎭 Mocking Khalti initiate with payload: {...}
✅ Khalti response received: {
  pidx: "jxELuMMuXfj3cDSMnKqLCA",
  payment_url: "https://khalti.com/...",
  expires_at: "..."
}
```

**Frontend Console Should Show:**
```
Payment initiation result: {
  status: true,
  code: 200,
  message: "Payment initiated",
  data: {paymentGateway: {...}}
}
Payment Gateway Data: {
  pidx: "...",
  payment_url: "...",
  khaltiUrl: "..."
}
Redirecting to Khalti...
Khalti redirect data: {...}
Khalti URL: https://khalti.com/...
```

**Browser UI Should Show:**
```
✅ Toast: "Redirecting to Khalti..."
✅ Redirects to payment page (or mock in dev mode)
```

#### Step 4.3: Khalti Verification
- ✅ Redirected successfully
- ✅ No 500 error
- ✅ All console logs present

---

### Phase 5: eSewa Payment Test (5 minutes)

#### Step 5.1: Create eSewa Booking
1. Create another booking with same steps as Phase 4.1

#### Step 5.2: Initiate eSewa Payment
1. On bookings page, find the new booking
2. Click "Pay Now"
3. Select "eSewa"
4. Click "Proceed to Payment"

**Backend Console Should Show:**
```
eSewa payload generated: {
  amt: XXXX,
  pid: "BOOKING_X_X_TIMESTAMP",
  merchant_code: "EPAYTEST",
  esewaUrl: "https://uat.esewa.com.np/epay/main",
  su: "http://localhost:3000/api/v1/bookings/payment/callback/esewa",
  fu: "http://localhost:5173/booking/payment/failure"
}
```

**Frontend Console Should Show:**
```
Payment initiation result: {...}
Payment Gateway Data: {
  amt: XXXX,
  pid: "...",
  merchant_code: "EPAYTEST",
  esewaUrl: "https://uat.esewa.com.np/epay/main",
  su: "...",
  fu: "..."
}
Redirecting to eSewa...
eSewa Form Fields: {
  amt: XXXX,
  pid: "...",
  merchant_code: "EPAYTEST",
  su: "...",
  fu: "..."
}
```

**Browser UI Should Show:**
```
✅ Toast: "Redirecting to eSewa..."
✅ Form submits
✅ Redirects to eSewa payment page
```

#### Step 5.3: eSewa Verification
- ✅ Form submission works
- ✅ Redirect happens
- ✅ All fields passed correctly

---

### Phase 6: NepaliPay Payment Test (5 minutes)

#### Step 6.1: Create NepaliPay Booking
1. Create another booking (Phase 4.1 steps)

#### Step 6.2: Initiate NepaliPay Payment
1. On bookings page, find the new booking
2. Click "Pay Now"
3. Select "Nepali Pay"
4. Click "Proceed to Payment"

**Backend Console Should Show:**
```
📋 NepaliPay payload generated: {
  merchantId: "test_merchant",
  amount: XXXX,
  orderId: "BOOKING_X_X",
  orderDescription: "Vehicle Booking - ...",
  successUrl: "http://localhost:3000/api/v1/bookings/payment/callback/nepali-pay",
  failureUrl: "http://localhost:5173/booking/payment/failure",
  paymentUrl: "https://payment.nepalipy.com/api/payment/initiate"
}
```

**Frontend Console Should Show:**
```
Payment initiation result: {...}
Payment Gateway Data: {
  merchantId: "test_merchant",
  amount: XXXX,
  orderId: "BOOKING_X_X",
  orderDescription: "...",
  successUrl: "...",
  failureUrl: "...",
  paymentUrl: "https://payment.nepalipy.com/api/payment/initiate"
}
Redirecting to Nepali Pay...
🎯 Nepali Pay redirect called with data: {...}
✅ Nepali Pay URL found: https://payment.nepalipy.com/api/payment/initiate
📋 Creating Nepali Pay form with fields: {
  merchantId: "test_merchant",
  amount: XXXX,
  ...
}
  ➕ Added field: merchantId = test_merchant
  ➕ Added field: amount = XXXX
  ➕ Added field: orderId = BOOKING_X_X
  ➕ Added field: orderDescription = ...
  ➕ Added field: successUrl = ...
  ➕ Added field: failureUrl = ...
📤 Appending form to document and submitting...
🚀 Submitting Nepali Pay form...
```

**Browser UI Should Show:**
```
✅ Toast: "Redirecting to Nepali Pay..."
✅ Form submits
✅ Redirect to NepaliPay
```

#### Step 6.3: NepaliPay Verification
- ✅ Form created correctly
- ✅ All fields added
- ✅ Form submitted
- ✅ Redirect happens

---

## 📊 Test Results Summary Template

```
Test Execution Date: ___________
Tester: ___________

KHALTI:
  [ ] Payment initiated successfully
  [ ] Backend logs show API call
  [ ] Frontend redirects properly
  [ ] No 500 errors
  [ ] Toast message shows

eSEWA:
  [ ] Payment initiated successfully
  [ ] Backend generates payload
  [ ] Frontend form submits
  [ ] Redirects to eSewa
  [ ] No 500 errors
  [ ] Toast message shows

NEPALIPAY:
  [ ] Payment initiated successfully
  [ ] Backend generates payload
  [ ] Frontend form submits
  [ ] Redirects to NepaliPay
  [ ] No 500 errors
  [ ] Toast message shows

OVERALL:
  [ ] All three methods work
  [ ] Console shows no JavaScript errors
  [ ] No database errors
  [ ] Proper error handling
  [ ] Ready for production testing
```

---

## 🔧 Common Issues During Testing

### Issue 1: Server Not Starting
```bash
Error: listen EADDRINUSE: address already in use :::3000
Fix: Kill process on port 3000
# Windows: netstat -ano | findstr :3000
# Mac/Linux: lsof -i :3000
```

### Issue 2: Database Connection Error
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
Fix: Verify PostgreSQL is running
# Windows: Check Services
# Mac: brew services list
# Linux: systemctl status postgresql
```

### Issue 3: CORS Errors
```javascript
Error: Access to XMLHttpRequest blocked by CORS
Fix: Backend should handle CORS - check server.ts
```

### Issue 4: Payment Not Redirecting
**For Khalti:**
```javascript
// Check console for:
"Khalti URL: undefined"
Fix: Verify response has payment_url field
```

**For eSewa:**
```javascript
// Check console for:
"eSewa Form Fields: {}"
Fix: Verify esewaUrl and other fields present
```

**For NepaliPay:**
```javascript
// Check console for:
"No Nepali Pay URL found"
Fix: Verify paymentUrl field is present in response
```

---

## ✅ Success Checklist

After completing all tests, verify:

- [ ] All three payment methods appear in selection
- [ ] Khalti initiates with mock API
- [ ] eSewa form submits correctly
- [ ] NepaliPay form submits correctly
- [ ] All show proper success toasts
- [ ] Redirects happen as expected
- [ ] Backend logs are clean
- [ ] Frontend console has no critical errors
- [ ] No 500 errors in any case
- [ ] Payment data saved to database

---

## 🎓 Understanding the Flow

### Khalti Flow:
```
Frontend sends {method: "Khalti"}
  ↓
Backend initiatePayment()
  ↓
generateKhaltiPayload() creates payload
  ↓
axiosInstance.post() to Khalti API
  ↓
Mock interceptor returns mock response
  ↓
Response has {pidx, payment_url}
  ↓
Frontend redirectToKhalti()
  ↓
window.location.href = payment_url
  ↓
User on Khalti page
```

### eSewa Flow:
```
Frontend sends {method: "eSewa"}
  ↓
Backend generateEsewaPayload()
  ↓
Returns {esewaUrl, fields...}
  ↓
Frontend creates HTML form
  ↓
Form submits to esewaUrl
  ↓
User on eSewa page
```

### NepaliPay Flow:
```
Frontend sends {method: "NepaliPay"}
  ↓
Backend generateNepaliPayPayload()
  ↓
Returns {paymentUrl, fields...}
  ↓
Frontend creates HTML form
  ↓
Form submits to paymentUrl
  ↓
User on NepaliPay page
```

---

## 📞 Support

If tests fail:
1. Check all console logs (backend + frontend)
2. Verify environment variables
3. Check database connectivity
4. Verify all files are present
5. Restart servers
6. Clear browser cache
7. Check error messages carefully

For detailed debugging, see: `NEPAL_PAY_REDIRECT_DEBUG.md`
