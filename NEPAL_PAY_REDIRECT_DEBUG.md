# NepaliPay Redirect Debugging Guide

## Issue: NepaliPay not being redirected

This guide will help you debug why NepaliPay is not redirecting to the payment page.

---

## Step 1: Check Backend Logs

When you select NepaliPay and click "Proceed to Payment", you should see these logs in the server terminal:

```
📋 NepaliPay payload generated: {
  merchantId: 'test_merchant',
  amount: 5000,
  orderId: 'BOOKING_1_1',
  orderDescription: 'Vehicle Booking - Toyota Camry',
  successUrl: 'http://localhost:3000/api/v1/bookings/payment/callback/nepali-pay',
  failureUrl: 'http://localhost:5173/booking/payment/failure',
  paymentUrl: 'https://payment.nepalipy.com/api/payment/initiate'
}

NepaliPay payload generated: {...}

✅ Payment initiation successful: {...}
```

### If you DON'T see these logs:
- Check if you selected NepaliPay correctly
- Check if the server is actually running
- Check if there are errors before the NepaliPay logs

---

## Step 2: Check Browser Console Logs

Open DevTools (F12) → Console tab. You should see:

```javascript
Payment initiation result: {...}
Payment Gateway Data: {
  merchantId: 'test_merchant',
  amount: 5000,
  orderId: 'BOOKING_1_1',
  orderDescription: 'Vehicle Booking - Toyota Camry',
  successUrl: 'http://localhost:3000/api/v1/bookings/payment/callback/nepali-pay',
  failureUrl: 'http://localhost:5173/booking/payment/failure',
  paymentUrl: 'https://payment.nepalipy.com/api/payment/initiate'
}

Redirecting to Nepali Pay...

🎯 Nepali Pay redirect called with data: {...}
✅ Nepali Pay URL found: https://payment.nepalipy.com/api/payment/initiate
📋 Creating Nepali Pay form with fields: {...}
  ➕ Added field: merchantId = test_merchant
  ➕ Added field: amount = 5000
  ➕ Added field: orderId = BOOKING_1_1
  ➕ Added field: orderDescription = Vehicle Booking - Toyota Camry
  ➕ Added field: successUrl = http://localhost:3000/api/v1/bookings/payment/callback/nepali-pay
  ➕ Added field: failureUrl = http://localhost:5173/booking/payment/failure
📤 Appending form to document and submitting...
🚀 Submitting Nepali Pay form...
```

### If you DON'T see these logs:
1. **Check if payment initiated**: Look for "Payment initiation result:"
   - If not present, payment API call failed
   
2. **Check if paymentUrl is present**: Look for "✅ Nepali Pay URL found:"
   - If not present, backend didn't include paymentUrl

3. **Check if form was submitted**: Look for "🚀 Submitting Nepali Pay form..."
   - If not present, form submission was blocked

---

## Step 3: Check Network Tab

Open DevTools → Network tab

### Expected requests:
1. **POST** `/api/v1/bookings/{id}/payment`
   - Status: **200**
   - Response should have `paymentGateway` with `paymentUrl`

### After form submission:
2. **POST** to `https://payment.nepalipy.com/api/payment/initiate`
   - This might be blocked by CORS in development (that's OK, it means the form tried to submit)

---

## Step 4: Verify Backend Response

Check that the API response includes the paymentUrl:

```bash
curl -X POST http://localhost:3000/api/v1/bookings/1/payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method":"NepaliPay"}'
```

**Expected Response:**
```json
{
  "status": true,
  "code": 200,
  "message": "Payment initiated",
  "data": {
    "paymentId": 123,
    "bookingId": 1,
    "amount": 5000,
    "method": "NepaliPay",
    "paymentGateway": {
      "merchantId": "test_merchant",
      "amount": 5000,
      "orderId": "BOOKING_1_123",
      "orderDescription": "Vehicle Booking - Toyota Camry",
      "successUrl": "http://localhost:3000/api/v1/bookings/payment/callback/nepali-pay",
      "failureUrl": "http://localhost:5173/booking/payment/failure",
      "paymentUrl": "https://payment.nepalipy.com/api/payment/initiate"
    }
  }
}
```

### If paymentUrl is missing:
- Check `server/src/service/booking.service.ts`
- Check `generateNepaliPayPayload()` includes `paymentUrl`

---

## Step 5: Common Issues & Solutions

### Issue 1: Error "Payment gateway data not received"
**Cause**: Backend didn't return paymentGateway
**Fix**: 
- Check backend logs for errors
- Verify booking exists
- Verify payment was created

### Issue 2: Error "Nepali Pay payment URL not available"
**Cause**: `paymentUrl` is null or undefined
**Fix**:
- Check backend response includes `paymentUrl`
- Check `generateNepaliPayPayload()` in booking.service.ts

### Issue 3: Console shows logs but no redirect happens
**Cause**: Form submission is blocked or gateway URL is wrong
**Fix**:
- Check browser console for CORS errors
- Verify `paymentUrl` value is correct
- Check if browser pop-up blocker is active

### Issue 4: Form appears in DOM but doesn't submit
**Cause**: JavaScript execution blocked or timing issue
**Fix**:
- Add a longer delay before form.submit()
- Try adding form to iframe first
- Check browser console for JavaScript errors

---

## Step 6: Manual Testing

If automatic redirect isn't working, test the form manually:

1. Open browser DevTools
2. Paste this code in Console:

```javascript
// Create the form manually
const form = document.createElement("form");
form.method = "POST";
form.action = "https://payment.nepalipy.com/api/payment/initiate";

const fields = {
  merchantId: "test_merchant",
  amount: "5000",
  orderId: "BOOKING_1_123",
  orderDescription: "Vehicle Booking - Test",
  successUrl: "http://localhost:3000/api/v1/bookings/payment/callback/nepali-pay",
  failureUrl: "http://localhost:5173/booking/payment/failure"
};

Object.entries(fields).forEach(([key, value]) => {
  const input = document.createElement("input");
  input.type = "hidden";
  input.name = key;
  input.value = value;
  form.appendChild(input);
});

document.body.appendChild(form);
form.submit();
```

This will manually submit the form and you should see what happens.

---

## Step 7: Compare with eSewa

eSewa uses the same form submission method. Compare the two:

### eSewa (Working):
```javascript
const form = document.createElement("form");
form.method = "POST";
form.action = data.esewaUrl;  // https://uat.esewa.com.np/epay/main

// Add fields...
form.submit();
```

### NepaliPay (Should be the same):
```javascript
const form = document.createElement("form");
form.method = "POST";
form.action = data.paymentUrl;  // https://payment.nepalipy.com/api/payment/initiate

// Add fields...
form.submit();
```

---

## Files to Check:

1. **Backend Payload Generation**
   - File: `server/src/service/booking.service.ts`
   - Function: `generateNepaliPayPayload()`
   - Should include `paymentUrl`

2. **Frontend Form Submission**
   - File: `frontend/src/components/common/PaymentModal.jsx`
   - Function: `redirectToNepaliPay()`
   - Should create form and submit

3. **Payment Initiation**
   - File: `frontend/src/components/common/PaymentModal.jsx`
   - Function: `handlePayment()`
   - Should call `redirectToNepaliPay()` with proper data

4. **Environment**
   - File: `server/.env`
   - Should have `BACKEND_URL=http://localhost:3000`
   - Should have `FRONTEND_URL=http://localhost:5173`

---

## Quick Fix Checklist:

- [ ] Server has `NODE_ENV=development`
- [ ] Server has `MOCK_PAYMENTS=true`
- [ ] Backend logs show NepaliPay payload
- [ ] Frontend logs show payment gateway data
- [ ] Frontend logs show Nepali Pay redirect called
- [ ] Frontend logs show form being submitted
- [ ] No browser console errors
- [ ] paymentUrl is present in response

---

## Still Not Working?

1. **Restart the server**: Some environment changes need restart
2. **Clear browser cache**: Old cached version might be running
3. **Check for typos**: Case-sensitive field names
4. **Verify mock interceptor**: Check if it's working (test other payment methods)
5. **Check CORS**: Form submissions might be blocked by CORS

---

## Success Indicators:

✅ You should see:
- Browser console logs with all the debugging info
- Form being created with all fields
- Network request to payment.nepalipy.com (will fail with CORS in dev, but that's expected)
- OR: Redirect to actual NepaliPay payment page (if real credentials set up)

❌ You should NOT see:
- "Payment gateway data not received" error
- "Nepali Pay payment URL not available" error
- Blank console (add logs to see what's happening)
