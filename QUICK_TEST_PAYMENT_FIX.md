# Quick Test: Payment Redirection Fix

## Before Testing
- Backend running: `npm run dev` (from server folder)
- Frontend running: `npm run dev` (from frontend folder)
- Browser open: `http://localhost:5173`
- Browser DevTools open: F12

## Test 1: eSewa Payment

### Steps
1. Create a new booking (select vehicle, dates, etc.)
2. Click "Pay Now" button
3. Select "eSewa" payment method
4. Click "Proceed to Payment"

### Expected Results

**Browser Console (Frontend):**
```
Payment initiation result: {..., status: true}
Payment Gateway Data: {amt: 1000, pid: "BOOKING_...", psc: 0, pdc: 0, ...}
eSewa Form Fields: {amt: 1000, psc: 0, pdc: 0, txAmt: 1000, pid: "BOOKING_...", ...}
```

**Backend Terminal:**
```
Payment initiation: userId=1, bookingId=1, method=eSewa
Payment created: paymentId=1, method=eSewa, amount=1000
eSewa payload generated: {...}
Payment initiation successful: {...}
```

**Browser Behavior:**
- ✅ Page should submit a form automatically
- ✅ Redirected to: `https://uat.esewa.com.np/epay/main?amt=1000&pid=...`
- ✅ (In dev mode) Mocked response received
- ✅ Redirected to success page

**If NOT Working:**
- ❌ Check browser console for errors
- ❌ Check backend console for errors
- ❌ Verify payment data received
- ❌ Check Network tab in DevTools

---

## Test 2: Khalti Payment

### Steps
1. Create a new booking
2. Click "Pay Now" button
3. Select "Khalti" payment method
4. Click "Proceed to Payment"

### Expected Results

**Browser Console:**
```
Payment initiation result: {..., status: true}
Payment Gateway Data: {pidx: "mock_pidx_...", payment_url: "https://khalti.com/...", ...}
Khalti redirect data: {pidx: "mock_pidx_...", payment_url: "https://khalti.com/..."}
Khalti URL: https://khalti.com/mock/payment?pidx=...
```

**Backend Terminal:**
```
Payment initiation: userId=1, bookingId=1, method=Khalti
Payment created: paymentId=1, method=Khalti, amount=1000
🎭 Using mock Khalti initiation for local development
Khalti payload generated: {...}
```

**Browser Behavior:**
- ✅ Direct redirect to Khalti URL
- ✅ (In dev mode) Redirected to mock payment page
- ✅ Redirected to success page after payment

---

## Test 3: Verify Database Updated

After successful payment:

```powershell
# Connect to database
psql -U postgres -d second_auto_gear_dev

# Check payment created
SELECT id, status, method, amount FROM payment WHERE id = 1;
# Expected: id=1, status=SUCCESS, method=eSewa/Khalti, amount=1000

# Check booking updated
SELECT id, status FROM booking WHERE id = 1;
# Expected: id=1, status=CONFIRMED
```

---

## Troubleshooting

### Issue: No form submission / no redirect

**Cause:** Payment data not received

**Solution:**
1. Check browser console for error message
2. Check Network tab → POST request status
3. Check backend logs for error

```
curl -X POST http://localhost:3000/api/v1/bookings/1/payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "eSewa"}'
```

### Issue: Form submitted but no redirect

**Cause:** eSewa URL or form fields wrong

**Solution:**
1. Browser DevTools → Network tab → find POST to uat.esewa.com.np
2. Check request body has correct field names
3. Verify: `amt`, `pid`, `scd`, `su`, `fu`

### Issue: Payment created but not updated to SUCCESS

**Cause:** Callback not processed

**Solution:**
1. Check callback URL: `GET /api/v1/bookings/payment/callback/esewa?pid=...&rid=...`
2. Verify payment record exists with that `pid`
3. Check backend logs for callback processing

---

## Quick Checklist

- [ ] Backend running and logs visible
- [ ] Frontend running on localhost:5173
- [ ] DevTools console open
- [ ] Create booking successfully
- [ ] Click "Pay Now"
- [ ] Select payment method
- [ ] Click "Proceed to Payment"
- [ ] See correct console logs
- [ ] Form submitted or redirect happens
- [ ] Redirected to payment gateway
- [ ] Payment status updates to SUCCESS
- [ ] Booking status updates to CONFIRMED

---

## Console Log Meanings

| Log | Means |
|-----|-------|
| `Payment initiation result: {..., status: true}` | ✅ Backend responded with data |
| `Payment Gateway Data: {...}` | ✅ Payment data received and parsed |
| `eSewa Form Fields: {...}` | ✅ Form fields prepared correctly |
| `Khalti URL: https://...` | ✅ Khalti URL extracted correctly |
| `🎭 Using mock Khalti initiation` | ℹ️ Mock payment mode (for development) |
| `Payment error:` | ❌ Error occurred, check message |
| `No Khalti URL found` | ❌ Missing payment URL in response |

---

## Still Having Issues?

1. Check [PAYMENT_REDIRECTION_FIX.md](PAYMENT_REDIRECTION_FIX.md) for detailed guide
2. Review [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md) for setup
3. Restart both backend and frontend
4. Clear browser cache: DevTools → Network → Disable cache
5. Try incognito/private window

---

## Success Criteria

✅ Payment redirection is working when:
- Form submits automatically for eSewa
- Redirect happens for Khalti
- Console logs show correct data
- Browser redirects to payment page
- Payment status updates in database
- Booking status updates to CONFIRMED
