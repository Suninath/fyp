# Payment Integration Testing Guide

## Quick Setup

### 1. Environment Variables Setup

Create or update your `.env` file in the `server` folder:

```env
# eSewa
ESEWA_MERCHANT_CODE=EPAYTEST

# Khalti
KHALTI_SECRET_KEY=05bf95cc57244045b8df5fad06748dab  # Test key
KHALTI_MERCHANT_USERNAME=test_merchant

# URLs (for local development)
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### 2. Testing with Postman/cURL

#### Test eSewa Payment Initiation

```bash
curl -X POST http://localhost:3000/api/v1/bookings/1/payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "esewa"}'
```

Response should include:
```json
{
  "status": true,
  "data": {
    "paymentGateway": {
      "amt": 1000,
      "pid": "BOOKING_1_101_1706887234234",
      "su": "http://localhost:3000/api/v1/bookings/payment/callback/esewa",
      "fu": "http://localhost:5173/booking/payment/failure",
      "esewaUrl": "https://uat.esewa.com.np/epay/main"
    }
  }
}
```

#### Test Khalti Payment Initiation

```bash
curl -X POST http://localhost:3000/api/v1/bookings/1/payment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"method": "khalti"}'
```

Response should include:
```json
{
  "status": true,
  "data": {
    "paymentGateway": {
      "pidx": "bZQLD9wRVWo4CdESSfuSsB",
      "payment_url": "https://test-pay.khalti.com/?pidx=bZQLD9wRVWo4CdESSfuSsB",
      "khaltiUrl": "https://test-pay.khalti.com/?pidx=bZQLD9wRVWo4CdESSfuSsB"
    }
  }
}
```

### 3. Testing Payment Callbacks

#### eSewa Callback Test

Use this when testing eSewa callbacks (after payment completion):

```bash
# Simulate eSewa returning after successful payment
curl "http://localhost:3000/api/v1/bookings/payment/callback/esewa?pid=BOOKING_1_101_1706887234234&rid=0000001234&amt=1000&txAmt=1000&psc=0&pdc=0"
```

Response:
```json
{
  "status": true,
  "message": "Payment verified successfully",
  "data": {
    "bookingId": 1,
    "paymentId": 101,
    "transactionId": "0000001234"
  }
}
```

#### Khalti Callback Test

```bash
# Simulate Khalti returning after successful payment
curl "http://localhost:3000/api/v1/bookings/payment/callback/khalti?pidx=bZQLD9wRVWo4CdESSfuSsB&transaction_id=4H7AhoXDJWg5WjrcPT9ixW&amount=100000&status=Completed&purchase_order_id=BOOKING_1_101"
```

Response:
```json
{
  "status": true,
  "message": "Payment verified successfully",
  "data": {
    "bookingId": 1,
    "paymentId": 101,
    "transactionId": "4H7AhoXDJWg5WjrcPT9ixW"
  }
}
```

### 4. Actual Payment Gateway Testing

#### eSewa Test Flow

1. **Initiate Payment:**
   - Call your `/payment` endpoint
   - Get response with payment parameters

2. **Redirect to eSewa:**
   - Construct URL: `https://uat.esewa.com.np/epay/main?amt=1000&pid=...&su=...&fu=...&scd=EPAYTEST`
   - User is redirected to eSewa test portal
   - Portal shows "TEST ENVIRONMENT" banner

3. **Test Payment:**
   - Complete test payment on eSewa
   - eSewa redirects to your `su` (success_url)

4. **Backend Verification:**
   - Your backend receives callback with transaction code
   - Backend verifies with eSewa's transactionStatus API
   - Payment is marked as successful

#### Khalti Test Flow

1. **Initiate Payment:**
   ```
   POST /api/v1/bookings/1/payment
   {
     "method": "khalti"
   }
   ```

2. **Get Payment URL:**
   ```
   Response includes payment_url
   Redirect user to that URL
   ```

3. **Test Payment on Khalti:**
   - User is redirected to Khalti test portal
   - Use test credentials:
     - Khalti ID: 9800000000-9800000005
     - MPIN: 1111
     - OTP: 987654

4. **Backend Verification:**
   - Khalti redirects to your return_url
   - Backend calls Khalti lookup API with pidx
   - Payment status is confirmed

### 5. Database Verification

After successful payment, verify in your database:

```sql
-- Check payment record
SELECT * FROM payments WHERE id = 101;
-- Should show: status = 'SUCCESS', transaction_id = '<gateway_transaction_id>'

-- Check booking record
SELECT * FROM bookings WHERE id = 1;
-- Should show: status = 'CONFIRMED'
```

### 6. Debugging Common Issues

#### Payment Initiation Fails

**Issue:** 401 Unauthorized
- **Solution:** Ensure token is in Authorization header
- Check: `Authorization: Bearer YOUR_TOKEN`

**Issue:** 404 Booking not found
- **Solution:** Verify booking ID exists
- Check booking is in PENDING status

#### Khalti API Fails

**Issue:** "Invalid token" error
- **Solution:** Verify KHALTI_SECRET_KEY is correct
- Check format: Should be "Key YOUR_KEY"

**Issue:** "Invalid pidx"
- **Solution:** Ensure pidx matches payment record
- Verify pidx hasn't expired (60 minutes max)

#### Callback Not Working

**Issue:** Callback URL returns 404
- **Solution:** Ensure URLs in response match routing
- Check: `BACKEND_URL` environment variable

**Issue:** Payment not updated after callback
- **Solution:** Check server logs for verification errors
- Verify payment gateway credentials

### 7. Log Monitoring

Monitor your server logs during testing:

```bash
# Terminal where server is running
# Look for these log messages:

✅ Khalti payment verified successfully for booking: 1
✅ eSewa payment verified successfully for booking: 1
❌ Payment verification failed
❌ Khalti callback error
```

### 8. Network Testing with ngrok (For Remote Testing)

If testing from different machine:

```bash
# Install ngrok
# Run ngrok tunnel
ngrok http 3000

# Update environment variable
BACKEND_URL=https://your-ngrok-url.ngrok.io

# Update callback URLs in payment gateways if needed
```

### 9. Production Checklist

Before going live:

- [ ] Get production credentials from eSewa and Khalti
- [ ] Update merchant codes and secret keys in `.env`
- [ ] Change URLs to production eSewa/Khalti endpoints
- [ ] Use HTTPS for all URLs
- [ ] Enable email notifications on successful payments
- [ ] Set up proper error handling and logging
- [ ] Test with real transactions (small amounts first)
- [ ] Implement refund handling
- [ ] Add payment history/receipts
- [ ] Monitor payment gateway health

### 10. Useful Resources

- **eSewa Dashboard:** https://merchant.esewa.com.np/
- **Khalti Sandbox Dashboard:** https://test-admin.khalti.com/
- **Khalti Production Dashboard:** https://admin.khalti.com/
- **eSewa API Docs:** https://developer.esewa.com.np/
- **Khalti API Docs:** https://docs.khalti.com/

