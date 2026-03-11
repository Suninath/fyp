# Payment Integration Guide

This document provides detailed information about integrating Khalti and eSewa payment gateways.

## Table of Contents
- [eSewa Integration](#esewa-integration)
- [Khalti Integration](#khalti-integration)
- [Environment Configuration](#environment-configuration)
- [Testing](#testing)

---

## eSewa Integration

### Overview
eSewa is a Nepali payment gateway that processes online payments through their portal.

**Documentation:** https://developer.esewa.com.np/

### How It Works
1. Generate payment payload with merchant code and transaction UUID
2. Redirect user to eSewa payment portal
3. User completes payment on eSewa
4. eSewa redirects to `success_url` with transaction code in query parameters
5. Backend verifies transaction with eSewa's transactionStatus API

### API Endpoints

#### Payment Portal (Redirect User)
```
URL: https://uat.esewa.com.np/epay/main (Test)
URL: https://esewa.com.np/epay/main (Production)

Parameters:
- amt: Amount in rupees (e.g., 1000)
- psc: Service charge (usually 0)
- pdc: Discount (usually 0)
- txAmt: Total amount (amt + psc - pdc)
- pid: Product/Transaction ID (unique identifier)
- su: Success URL (where to redirect after successful payment)
- fu: Failure URL (where to redirect after failed payment)
- scd: Merchant code (provided by eSewa)
```

#### Verification API
```
GET https://uat.esewa.com.np/epay/transactionStatus

Parameters:
- amt: Amount (can be empty)
- rid: Response ID / Transaction Code (received in callback)
- pid: Product ID (sent during payment initiation)
- scd: Merchant code

Response:
{
  "status": "COMPLETE",  // or "FAILED", "PENDING"
  "oid": "transaction_id",
  "refId": "reference_id",
  ...
}
```

### Response Parameters
When eSewa redirects to your success_url, these query parameters are included:

```
GET /callback/esewa?pid=BOOKING_1_100_1706887234234&rid=0000001234&amt=1000&txAmt=1000&psc=0&pdc=0&ss_year=2080&ss_month=10&ss_day=20
```

| Parameter | Description |
|-----------|-------------|
| pid | Product ID (your transaction UUID) |
| rid | Response ID (transaction code from eSewa) |
| amt | Amount in rupees |
| txAmt | Total transaction amount |

### Integration Steps

1. **Generate Payment Payload:**
   ```typescript
   const payload = {
     amt: 1000,           // Amount in rupees
     psc: 0,              // Service charge
     pdc: 0,              // Discount
     txAmt: 1000,         // Total (amt + psc - pdc)
     pid: "BOOKING_1_100_1706887234234",  // Unique transaction ID
     su: "http://localhost:3000/api/v1/bookings/payment/callback/esewa",
     fu: "http://localhost:5173/booking/payment/failure",
     scd: "EPAYTEST",     // Merchant code
   };
   ```

2. **Redirect User:**
   ```
   https://uat.esewa.com.np/epay/main?amt=1000&psc=0&pdc=0&txAmt=1000&pid=...&su=...&fu=...&scd=EPAYTEST
   ```

3. **Handle Callback:**
   - User is redirected to your success_url with query parameters
   - Verify transaction with eSewa API
   - Update payment and booking status

### eSewa Test Credentials
- **Merchant Code:** EPAYTEST
- **Test URL:** https://uat.esewa.com.np/epay/main
- **Environment Variables:**
  ```
  ESEWA_MERCHANT_CODE=EPAYTEST
  ```

---

## Khalti Integration

### Overview
Khalti is a modern Nepali payment gateway with SDK support.

**Documentation:** https://docs.khalti.com/khalti-epayment/

### How It Works
1. **Server-side Payment Initiation:**
   - Backend calls Khalti's `/epayment/initiate/` API
   - Receives `pidx` (payment identifier) and `payment_url`
   
2. **Redirect User:**
   - Frontend redirects user to the `payment_url`
   
3. **Payment at Khalti:**
   - User completes payment on Khalti portal
   - Khalti redirects to your `return_url` with payment confirmation
   
4. **Verify Payment:**
   - Backend calls Khalti's `/epayment/lookup/` API with `pidx`
   - Confirms payment status

### API Endpoints

#### 1. Initiate Payment (Server-to-Server)
```
POST https://dev.khalti.com/api/v2/epayment/initiate/
Authorization: Key YOUR_SECRET_KEY

{
  "return_url": "http://localhost:5173/booking/payment/success/khalti",
  "website_url": "http://localhost:5173",
  "amount": 100000,  // In paisa (100 rupees = 10000 paisa)
  "purchase_order_id": "BOOKING_1_100",
  "purchase_order_name": "Vehicle Booking",
  "customer_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9800000123"
  },
  "merchant_username": "your_merchant_username"
}

Response:
{
  "pidx": "bZQLD9wRVWo4CdESSfuSsB",
  "payment_url": "https://test-pay.khalti.com/?pidx=bZQLD9wRVWo4CdESSfuSsB",
  "expires_at": "2023-05-25T16:26:16.471649+05:45",
  "expires_in": 1800
}
```

#### 2. Verify Payment (Server-to-Server)
```
POST https://dev.khalti.com/api/v2/epayment/lookup/
Authorization: Key YOUR_SECRET_KEY

{
  "pidx": "bZQLD9wRVWo4CdESSfuSsB"
}

Response:
{
  "pidx": "bZQLD9wRVWo4CdESSfuSsB",
  "total_amount": 100000,
  "status": "Completed",  // "Pending", "Initiated", "Refunded", "Expired", "User canceled"
  "transaction_id": "4H7AhoXDJWg5WjrcPT9ixW",
  "fee": 0,
  "refunded": false
}
```

### Khalti Callback Parameters
When Khalti redirects to your return_url:

```
GET /booking/payment/success/khalti?pidx=bZQLD9wRVWo4CdESSfuSsB&transaction_id=4H7AhoXDJWg5WjrcPT9ixW&amount=100000&status=Completed&purchase_order_id=BOOKING_1_100
```

| Parameter | Description |
|-----------|-------------|
| pidx | Payment identifier (use for lookup) |
| transaction_id | Khalti transaction ID |
| amount | Amount in paisa |
| status | Transaction status (Completed, Pending, User canceled, etc.) |
| purchase_order_id | Your order ID |

### Payment Status Codes
| Status | Meaning | Action |
|--------|---------|--------|
| Completed | ✅ Payment successful | Confirm booking |
| Pending | ⏳ Payment in progress | Wait or ask user to retry |
| Expired | ❌ Payment link expired | Ask user to try again |
| User canceled | ❌ User canceled | Ask user to retry |
| Refunded | 🔄 Payment refunded | Do not confirm |

### Integration Steps

1. **Frontend initiates payment:**
   ```javascript
   // Frontend sends booking details
   POST /api/v1/bookings/payment
   {
     "bookingId": 1,
     "method": "khalti"
   }
   
   // Backend returns payment info
   {
     "paymentId": 100,
     "paymentGateway": {
       "pidx": "bZQLD9wRVWo4CdESSfuSsB",
       "payment_url": "https://test-pay.khalti.com/?pidx=..."
     }
   }
   ```

2. **Frontend redirects user:**
   ```javascript
   window.location.href = response.data.paymentGateway.payment_url;
   ```

3. **Handle callback:**
   - Khalti redirects to your return_url with query parameters
   - Frontend calls backend to verify payment
   - Backend verifies with Khalti lookup API

4. **Verify payment:**
   ```
   POST /api/v1/bookings/payment/callback/khalti
   Query: ?pidx=...&transaction_id=...&status=...
   ```

### Khalti Test Credentials

**Sandbox Environment:**
- **Base URL:** https://dev.khalti.com
- **Pay URL:** https://test-pay.khalti.com
- **Merchant Dashboard:** https://test-admin.khalti.com
- **Login OTP:** 987654

**Test Card Details:**
- **Khalti ID:** 9800000000-9800000005
- **MPIN:** 1111
- **OTP:** 987654

**Environment Variables:**
```
KHALTI_SECRET_KEY=your_secret_key_from_dashboard
KHALTI_MERCHANT_USERNAME=your_merchant_username
```

---

## Environment Configuration

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=booking_system

# JWT
ACCESS_TOKEN_SECRET=your_secret_key_1
REFRESH_TOKEN_SECRET=your_secret_key_2

# eSewa
ESEWA_MERCHANT_CODE=EPAYTEST

# Khalti
KHALTI_SECRET_KEY=your_secret_key_from_khalti_dashboard
KHALTI_MERCHANT_USERNAME=your_merchant_username

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### Frontend (.env)

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

---

## Testing

### eSewa Test Flow

1. **Start payment:**
   ```
   1. User clicks "Pay with eSewa"
   2. Backend creates payment record
   3. Frontend redirects to eSewa portal with payload
   ```

2. **Complete payment:**
   ```
   eSewa Portal displays test environment message
   User can complete test payment
   ```

3. **Verify callback:**
   ```
   eSewa redirects to success_url with transaction code
   Backend verifies with eSewa API
   Backend updates payment status
   ```

### Khalti Test Flow

1. **Initiate payment:**
   ```bash
   POST http://localhost:3000/api/v1/bookings/{bookingId}/payment
   {
     "method": "khalti"
   }
   ```

2. **Response:**
   ```json
   {
     "status": true,
     "data": {
       "paymentGateway": {
         "payment_url": "https://test-pay.khalti.com/?pidx=..."
       }
     }
   }
   ```

3. **Test payment:**
   - User is redirected to Khalti test portal
   - Use test Khalti ID: 9800000000
   - Use test MPIN: 1111
   - Use test OTP: 987654

4. **Verify callback:**
   - Khalti redirects to return_url
   - Backend verifies with lookup API
   - Backend updates payment status

### Debug Checklist

- [ ] Check environment variables are set correctly
- [ ] Verify merchant codes/keys in dashboard
- [ ] Check callback URLs are accessible (use ngrok for local testing)
- [ ] Verify database records are created
- [ ] Check server logs for API responses
- [ ] Test with actual test credentials from each provider

---

## Important Notes

### Security
- ✅ Always verify payments on the backend (never trust client-side data)
- ✅ Use HTTPS in production
- ✅ Keep secret keys in environment variables
- ✅ Implement rate limiting on callback endpoints
- ✅ Validate transaction amounts

### Best Practices
- ✅ Store all transaction IDs for reconciliation
- ✅ Implement retry logic for failed payments
- ✅ Send payment confirmation emails
- ✅ Log all payment events
- ✅ Use webhook verification endpoints

### Production Migration
1. Get production credentials from eSewa and Khalti
2. Update merchant codes and secret keys
3. Change URLs to production endpoints
4. Test with real transactions (small amounts)
5. Monitor for errors in production logs

---

## Support

- **eSewa Support:** https://developer.esewa.com.np/
- **Khalti Support:** https://docs.khalti.com/
- **Khalti Slack Channel:** https://khalti.slack.com/

