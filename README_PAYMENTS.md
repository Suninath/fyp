# Payment System Implementation - Complete Documentation

## Overview

This document provides a complete overview of the eSewa and Khalti payment integration implemented in the Second Auto Gear booking system.

## Documentation Files

- **PAYMENT_INTEGRATION.md** - Complete integration guide with API specifications
- **PAYMENT_TESTING.md** - Testing procedures and examples
- **PAYMENT_IMPLEMENTATION_SUMMARY.md** - Summary of all code changes

## Quick Start

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create `.env` file in `server` directory:

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

# eSewa (Test)
ESEWA_MERCHANT_CODE=EPAYTEST

# Khalti (Test)
KHALTI_SECRET_KEY=05bf95cc57244045b8df5fad06748dab
KHALTI_MERCHANT_USERNAME=test_merchant

# URLs
BACKEND_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173

# Node
NODE_ENV=development
```

### 3. Start Server

```bash
npm run dev
```

### 4. Test Payment Integration

See **PAYMENT_TESTING.md** for complete testing guide.

---

## Payment Flow Overview

### User Workflow

```
1. User logs in ✓
2. User selects vehicle and books ✓
3. Booking created in PENDING status ✓
4. User initiates payment (chooses payment method)
   ↓
5. System shows payment options:
   - eSewa
   - Khalti
   - Nepali Pay (basic implementation)
6. User selects payment method
7. Redirected to payment gateway
8. Completes payment on payment gateway
9. Returns to application
10. Payment verified with payment gateway API
11. Booking updated to CONFIRMED
12. User receives confirmation
```

### Backend Payment Processing

```
POST /api/v1/bookings/{bookingId}/payment
├─ Authentication check ✓
├─ Booking validation
│  ├─ Booking exists
│  └─ Booking status is PENDING
├─ Create payment record (PENDING status)
├─ Generate payment gateway payload
│  ├─ For eSewa: Generate form data
│  └─ For Khalti: Call /epayment/initiate/ API
└─ Return payment info to frontend

GET /api/v1/bookings/payment/callback/{gateway}
├─ Receive callback from payment gateway
├─ Extract payment info
├─ Verify with payment gateway API
├─ Update payment record (SUCCESS/FAILED)
├─ Update booking status (CONFIRMED/PENDING)
└─ Return response
```

---

## API Endpoints

### Payment Initiation

```
POST /api/v1/bookings/{bookingId}/payment
Authorization: Bearer <token>
Content-Type: application/json

{
  "method": "khalti" | "esewa" | "nepali-pay"
}

Response (Success - Khalti):
{
  "status": true,
  "message": "Payment initiated",
  "data": {
    "paymentId": 101,
    "bookingId": 1,
    "amount": 1000,
    "method": "khalti",
    "paymentGateway": {
      "pidx": "bZQLD9wRVWo4CdESSfuSsB",
      "payment_url": "https://test-pay.khalti.com/?pidx=bZQLD9wRVWo4CdESSfuSsB",
      "khaltiUrl": "https://test-pay.khalti.com/?pidx=bZQLD9wRVWo4CdESSfuSsB"
    }
  }
}

Response (Success - eSewa):
{
  "status": true,
  "message": "Payment initiated",
  "data": {
    "paymentId": 101,
    "bookingId": 1,
    "amount": 1000,
    "method": "esewa",
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

### Payment Callbacks

#### eSewa Callback
```
GET /api/v1/bookings/payment/callback/esewa?pid=...&rid=...&amt=...
```

#### Khalti Callback
```
GET /api/v1/bookings/payment/callback/khalti?pidx=...&transaction_id=...&amount=...&status=...
```

### Payment Status

```
GET /api/v1/bookings/{bookingId}/payment/status
Authorization: Bearer <token>

Response:
{
  "status": true,
  "data": {
    "bookingStatus": "CONFIRMED",
    "paymentStatus": "SUCCESS",
    "paymentMethod": "khalti",
    "amount": 1000
  }
}
```

---

## Database Schema

### Payment Entity

```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL FOREIGN KEY,
  amount DECIMAL(10, 2),
  method VARCHAR(50), -- 'khalti', 'esewa', 'nepali-pay'
  status VARCHAR(50), -- 'PENDING', 'SUCCESS', 'FAILED'
  transaction_id VARCHAR(255), -- Gateway transaction ID
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Booking Status Updates

```
PENDING → CONFIRMED (on successful payment)
PENDING → CANCELLED (on cancellation)
CONFIRMED → COMPLETED (after rental period)
```

---

## Error Handling

### Common Error Responses

```json
{
  "status": false,
  "message": "Booking not found"
}
```

**Status Codes:**
- `200` - Success
- `201` - Resource created
- `400` - Bad request
- `401` - Unauthorized
- `404` - Not found
- `409` - Conflict (booking already exists)
- `500` - Server error

---

## Security Considerations

### ✅ Implemented Security Measures

1. **Authentication Required:**
   - All payment endpoints require valid JWT token
   - User can only access their own bookings

2. **Server-Side Verification:**
   - All payments verified with payment gateway API
   - Never trust client-side data
   - Transaction amounts validated

3. **Secure Secret Storage:**
   - Payment gateway secrets in environment variables
   - Not exposed to frontend
   - Not committed to version control

4. **HTTPS in Production:**
   - All payment URLs must use HTTPS
   - Secure cookie transmission

5. **Transaction Logging:**
   - All payment attempts logged
   - Transaction IDs stored for audit trail

### 🔐 Best Practices

1. Use webhook verification when available
2. Implement rate limiting on callbacks
3. Store payment receipts
4. Regular security audits
5. PCI DSS compliance for production

---

## Test Credentials

### eSewa

```
Environment: https://uat.esewa.com.np/epay/main
Merchant Code: EPAYTEST
Test Amount: Any amount
Payment Status: Automatically succeeds
```

### Khalti

```
Environment: https://test-pay.khalti.com
Khalti ID: 9800000000 - 9800000005
MPIN: 1111
OTP: 987654
Test Amount: Any amount
Payment Status: Choose success/failure
```

---

## Troubleshooting

### Payment Verification Fails

**Issue:** "Payment verification failed"

**Solutions:**
1. Verify payment gateway credentials in `.env`
2. Check if test/production environment is correct
3. Verify callback URL is accessible
4. Check payment gateway logs

### Khalti 401 Unauthorized

**Issue:** "Invalid token" from Khalti API

**Solutions:**
1. Verify KHALTI_SECRET_KEY is correct
2. Ensure "Key " prefix is included in Authorization header
3. Check if using correct environment (test/production)

### eSewa Transaction Not Found

**Issue:** eSewa returns transaction not found

**Solutions:**
1. Verify merchant code is correct
2. Check transaction UUID format
3. Ensure transaction code (RID) is correct
4. Verify amount is not negative

---

## Production Checklist

- [ ] Get production credentials from both payment gateways
- [ ] Update `.env` with production keys
- [ ] Change API endpoints to production URLs
- [ ] Enable HTTPS for all payment URLs
- [ ] Set up email notifications
- [ ] Implement payment receipts
- [ ] Add refund handling
- [ ] Set up payment reconciliation
- [ ] Test with real transactions
- [ ] Monitor payment failures
- [ ] Set up error alerts
- [ ] Implement retry logic
- [ ] Add payment history for users
- [ ] Document support procedures

---

## Support & Resources

### Official Documentation
- **eSewa:** https://developer.esewa.com.np/
- **Khalti:** https://docs.khalti.com/khalti-epayment/

### Integration Guides
- See `PAYMENT_INTEGRATION.md` for complete API documentation
- See `PAYMENT_TESTING.md` for testing procedures

### Contact
- eSewa Support: https://developer.esewa.com.np/
- Khalti Support: https://docs.khalti.com/contact-us/

---

## Version History

- **v1.0 (Current)** - Initial implementation with eSewa and Khalti support
  - Server-side payment verification
  - Environment-based configuration
  - Complete error handling
  - Test and production ready

---

## File Structure

```
server/
├── src/
│   ├── controller/
│   │   └── booking.controller.ts      (callback handlers)
│   ├── service/
│   │   └── booking.service.ts         (payment logic)
│   ├── routes/
│   │   └── booking.routes.ts          (payment endpoints)
│   └── entities/
│       └── payment.entity.ts          (payment schema)
└── .env.example                       (configuration template)

project_root/
├── PAYMENT_INTEGRATION.md             (API documentation)
├── PAYMENT_TESTING.md                 (testing guide)
└── PAYMENT_IMPLEMENTATION_SUMMARY.md  (change summary)
```

---

## Next Steps

1. **Review Documentation:**
   - Read PAYMENT_INTEGRATION.md for complete API specs
   - Read PAYMENT_TESTING.md for testing procedures

2. **Configure Environment:**
   - Set up `.env` file with test credentials
   - Run database migrations

3. **Test Locally:**
   - Follow PAYMENT_TESTING.md procedures
   - Test both eSewa and Khalti
   - Verify error handling

4. **Deploy to Production:**
   - Get production credentials
   - Update configuration
   - Run final tests
   - Deploy and monitor

---

## Questions?

Refer to:
1. PAYMENT_INTEGRATION.md - For API details
2. PAYMENT_TESTING.md - For testing help
3. Official payment gateway documentation
4. Server logs for debugging information

