# Mock Payment Testing Guide

## Quick Start - Local Development with Mock Payments

When `MOCK_PAYMENTS=true` in your `.env.local`, all payment requests are automatically intercepted and mocked.

---

## Configuration

### Enable Mock Payments

**File:** `server/.env.local`

```env
NODE_ENV=development
MOCK_PAYMENTS=true
ESEWA_MERCHANT_CODE=EPAYTEST
KHALTI_SECRET_KEY=test_secret_key
```

### Verify Mock is Enabled

Start your backend server and look for these console logs:

```
🎭 Using mock eSewa verification for local development
🎭 Using mock Khalti initiation for local development
🎭 Using mock Khalti lookup for local development
```

---

## Mock Payment Flow

### 1. Create a Booking

```bash
POST http://localhost:3000/api/v1/bookings
{
  "vehicleId": 1,
  "startDate": "2026-02-05",
  "endDate": "2026-02-07",
  "location": "Kathmandu"
}
```

### 2. Initiate Payment

Frontend calls:
```bash
GET http://localhost:3000/api/v1/bookings/:bookingId/payment/initiate?method=eSewa
```

**Expected Mock Response for eSewa:**
```json
{
  "esewaUrl": "https://uat.esewa.com.np/epay/main",
  "pid": "BOOKING_1_1_1706887234234",
  "amount": 1000,
  "merchant_code": "EPAYTEST"
}
```

**Expected Mock Response for Khalti:**
```json
{
  "khaltiUrl": "https://khalti.com/mock/payment?pidx=mock_pidx_1706887234234",
  "pidx": "mock_pidx_1706887234234",
  "payment_url": "https://khalti.com/mock/payment?pidx=mock_pidx_1706887234234",
  "expires_at": "2026-02-04T11:23:54.234Z"
}
```

### 3. Handle Payment Callback

**eSewa Mock Callback:**
```bash
GET http://localhost:3000/api/v1/bookings/payment/callback/esewa?pid=BOOKING_1_1_1706887234234&rid=mock_rid_123
```

Backend logs:
```
🎭 Mock eSewa Verification called with params: {
  amt: "",
  rid: "mock_rid_123",
  pid: "BOOKING_1_1_1706887234234",
  scd: "EPAYTEST"
}
✅ eSewa payment verified successfully for booking: 1
```

**Khalti Mock Callback:**
```bash
GET http://localhost:3000/api/v1/bookings/payment/callback/khalti?pidx=mock_pidx_1706887234234&transaction_id=mock_txn_123
```

Backend logs:
```
🎭 Mock Khalti lookup called with pidx: mock_pidx_1706887234234
✅ Khalti payment verified successfully for booking: 1
```

### 4. Verify Payment in Database

```sql
-- Check payment status
SELECT id, booking_id, method, status, amount FROM payment 
WHERE status = 'SUCCESS' 
ORDER BY created_at DESC LIMIT 1;

-- Check booking status
SELECT id, user_id, status, total_amount, created_at FROM booking 
WHERE status = 'CONFIRMED' 
ORDER BY created_at DESC LIMIT 1;
```

Expected result:
```
id | booking_id | method | status  | amount
---+------------+--------+---------+-------
 1 |          1 | eSewa  | SUCCESS | 1000.00
```

---

## Testing Scenarios

### Scenario 1: Complete Payment Flow (eSewa)

```bash
# 1. Create booking
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":1,"startDate":"2026-02-05","endDate":"2026-02-07"}'

# 2. Get payment URL
curl http://localhost:3000/api/v1/bookings/1/payment/initiate?method=eSewa

# 3. Simulate payment callback (in browser or Postman)
# User is redirected to: https://uat.esewa.com.np/epay/main?pid=...
# Mock response: 🎭 Mock eSewa Verification called...

# 4. Redirect back with callback (simulate with curl)
curl "http://localhost:3000/api/v1/bookings/payment/callback/esewa?pid=BOOKING_1_1_1706887234234&rid=mock_rid"

# 5. Verify in database
```

### Scenario 2: Complete Payment Flow (Khalti)

```bash
# 1. Create booking
curl -X POST http://localhost:3000/api/v1/bookings \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":1,"startDate":"2026-02-05","endDate":"2026-02-07"}'

# 2. Get payment URL (Khalti)
curl http://localhost:3000/api/v1/bookings/1/payment/initiate?method=Khalti

# Expected: 
# 🎭 Using mock Khalti initiation for local development
# Returns: mock_pidx_... and payment_url

# 3. Simulate Khalti redirect
curl "http://localhost:3000/api/v1/bookings/payment/callback/khalti?pidx=mock_pidx_1706887234234&transaction_id=mock_txn"

# Expected:
# 🎭 Using mock Khalti lookup for local development
# ✅ Khalti payment verified successfully for booking: 1
```

### Scenario 3: Test with Thunder Client / Postman

**Collection Setup:**
```json
{
  "create_booking": {
    "method": "POST",
    "url": "{{API_URL}}/bookings",
    "body": {
      "vehicleId": 1,
      "startDate": "2026-02-05",
      "endDate": "2026-02-07",
      "location": "Kathmandu"
    }
  },
  "esewa_initiate": {
    "method": "GET",
    "url": "{{API_URL}}/bookings/{{booking_id}}/payment/initiate?method=eSewa"
  },
  "esewa_callback": {
    "method": "GET",
    "url": "{{API_URL}}/bookings/payment/callback/esewa?pid={{pid}}&rid=mock_rid_123&amt=1000"
  }
}
```

---

## Backend Console Output

When testing with mock payments, you should see these logs:

### eSewa Payment Initiation
```
✅ Payment initiated: BOOKING_1_1_1706887234234
```

### eSewa Callback
```
🎭 Mock eSewa Verification called with params: { 
  amt: '', 
  rid: 'mock_rid_123', 
  pid: 'BOOKING_1_1_1706887234234', 
  scd: 'EPAYTEST' 
}
eSewa verification response: { 
  status: 'COMPLETE', 
  oid: 'BOOKING_1_1_1706887234234', 
  refId: 'mock_rid_123' 
}
✅ eSewa payment verified successfully for booking: 1
```

### Khalti Initiation
```
🎭 Using mock Khalti initiation for local development
```

### Khalti Callback
```
🎭 Using mock Khalti lookup for local development
Khalti verification response: { 
  pidx: 'mock_pidx_1706887234234', 
  total_amount: 100000, 
  status: 'Completed', 
  transaction_id: 'mock_txn_1706887234234' 
}
✅ Khalti payment verified successfully for booking: 1
```

---

## Troubleshooting Mock Payments

### Issue: "DNS_PROBE_FINISHED_NXDOMAIN" for eSewa

**Solution:** Ensure mock payments are enabled
```env
MOCK_PAYMENTS=true
NODE_ENV=development
```

### Issue: Mock not being called

**Check:**
1. `NODE_ENV=development` in `.env.local`
2. `MOCK_PAYMENTS=true` in `.env.local`
3. Restart backend server
4. Check console for: `🎭` emoji indicating mock is active

### Issue: Payment status not updating

**Check database:**
```sql
-- See if payment was created
SELECT * FROM payment WHERE booking_id = 1;

-- See if callback was processed
SELECT * FROM booking WHERE id = 1;
```

### Issue: Wrong amount in mock

The mock uses the booking's `finalAmount` by default. To verify:
```sql
SELECT id, final_amount FROM booking WHERE id = 1;
```

---

## Switching Between Mock and Real Payments

### Enable Mock (Development)
```env
MOCK_PAYMENTS=true
NODE_ENV=development
```

### Disable Mock (Production-like testing)
```env
MOCK_PAYMENTS=false
NODE_ENV=production
```

When `MOCK_PAYMENTS=false`, the system will:
1. Make real API calls to eSewa and Khalti
2. Require valid merchant credentials in `.env.local`
3. Handle network errors if payment gateways are down

---

## Mock Service Implementation Details

See [server/src/utils/mockPaymentService.ts](server/src/utils/mockPaymentService.ts) for:
- Mock response structures
- How interception works
- How to extend with more scenarios

---

## Next Steps

1. ✅ Enable mock payments in `.env.local`
2. ✅ Start backend: `npm run dev`
3. ✅ Start frontend: `npm run dev`
4. ✅ Test payment flow: Create booking → Pay → Verify
5. ✅ Check database: Confirm payment and booking status updated

For more information, see [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)
