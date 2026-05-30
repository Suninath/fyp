# Payment Gateway Comparison & Architecture

## Quick Reference Table

| Aspect | eSewa | Khalti | NepaliPay |
|--------|-------|--------|-----------|
| **Type** | Digital Wallet | Mobile Wallet | Bank Transfer |
| **Backend Approach** | Sync (Returns URL) | Async (Calls API) | Sync (Returns URL) |
| **Frontend Approach** | Form Submission | Direct Redirect | Form Submission |
| **Returns** | `esewaUrl, payload` | `payment_url, pidx` | `paymentUrl, payload` |
| **Implementation** | Immediate | Requires API Key | Immediate |
| **Status** | ✅ Working | ✅ Working | ✅ FIXED |

---

## Backend Response Structure

### eSewa Response:
```javascript
{
  status: true,
  code: 200,
  message: "Payment initiated",
  data: {
    paymentId: 123,
    bookingId: 456,
    amount: 5000,
    method: "eSewa",
    paymentGateway: {
      amt: 5000,
      psc: 0,
      pdc: 0,
      txAmt: 5000,
      pid: "BOOKING_456_123_1707123456",
      su: "http://localhost:3000/api/v1/bookings/payment/callback/esewa",
      fu: "http://localhost:5173/booking/payment/failure",
      merchant_code: "EPAYTEST",
      esewaUrl: "https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=100&transaction_uuid=123"  // ← Payment page URL
    }
  }
}
```

### Khalti Response:
```javascript
{
  status: true,
  code: 200,
  message: "Payment initiated",
  data: {
    paymentId: 123,
    bookingId: 456,
    amount: 5000,
    method: "Khalti",
    paymentGateway: {
      pidx: "jxELuMMuXfj3cDSMnKqLCA",           ← Payment ID
      payment_url: "https://khalti.com/...",   ← Payment page URL
      expires_at: "2026-02-04T12:30:00Z",
      khaltiUrl: "https://khalti.com/..."      ← Alternate URL field
    }
  }
}
```

### NepaliPay Response (FIXED):
```javascript
{
  status: true,
  code: 200,
  message: "Payment initiated",
  data: {
    paymentId: 123,
    bookingId: 456,
    amount: 5000,
    method: "NepaliPay",
    paymentGateway: {
      merchantId: "test_merchant",
      amount: 5000,
      orderId: "BOOKING_456_123",
      orderDescription: "Vehicle Booking - ...",
      successUrl: "http://localhost:3000/api/v1/bookings/payment/callback/nepali-pay",
      failureUrl: "http://localhost:5173/booking/payment/failure",
      paymentUrl: "https://payment.nepalipy.com/api/payment/initiate"  ← Payment page URL
    }
  }
}
```

---

## Frontend Handling

### eSewa - Form Submission:
```javascript
const redirectToEsewa = (data) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.esewaUrl;  // ← This is the gateway URL
  
  // Add hidden fields
  form.appendChild(createInput("amt", data.amt));
  form.appendChild(createInput("pid", data.pid));
  // ... etc
  
  document.body.appendChild(form);
  form.submit();  // ← Auto-submit to gateway
};
```

### Khalti - Direct Redirect:
```javascript
const redirectToKhalti = (data) => {
  const khaltiUrl = data.payment_url || data.khaltiUrl;
  
  if (khaltiUrl) {
    window.location.href = khaltiUrl;  // ← Direct redirect
  }
};
```

### NepaliPay - Form Submission (FIXED):
```javascript
const redirectToNepaliPay = (data) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.paymentUrl;  // ← This is the gateway URL
  
  // Add hidden fields
  form.appendChild(createInput("merchantId", data.merchantId));
  form.appendChild(createInput("amount", data.amount));
  // ... etc
  
  document.body.appendChild(form);
  form.submit();  // ← Auto-submit to gateway
};
```

---

## Key Differences Explained

### Why eSewa & NepaliPay use Form Submission:
- **Reason**: These gateways accept data via form POST
- **How**: Create hidden form fields and auto-submit
- **Advantage**: Simple, no authentication needed
- **Disadvantage**: User is redirected immediately, no validation

### Why Khalti uses Direct Redirect:
- **Reason**: Khalti returns a payment URL after API call
- **How**: Call Khalti API → Get payment_url → Redirect user
- **Advantage**: Can validate response, handle errors gracefully
- **Disadvantage**: Requires API call, needs authentication keys

---

## Common Mistakes (FIXED):

### ❌ Before (NepaliPay - Broken):
```javascript
const redirectToNepaliPay = (data) => {
  // Just showing a message, not actually redirecting!
  SucessToast({
    message: `Please transfer Rs. ${data.amount}...`
  });
};
```
**Problem**: No redirect happens, user never sees payment page

### ✅ After (NepaliPay - Fixed):
```javascript
const redirectToNepaliPay = (data) => {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = data.paymentUrl;  // ← Now we have the URL!
  
  // Add fields and submit
  // ... form submission code
};
```
**Solution**: Now properly redirects to payment gateway

---

## Payment Flow Summary

```
User clicks "Proceed to Payment"
           ↓
     Payment Method Selected
           ↓
    Backend initiatePayment()
           ↓
    ┌──────┴──────┬──────────┐
    ↓             ↓          ↓
  eSewa         Khalti    NepaliPay
  (Sync)       (Async)     (Sync)
    │             │          │
    ├─→ Return    └─→ API   ├─→ Return
    │  esewaUrl     Call     │ paymentUrl
    │  + payload   → Get      │ + payload
    │             payment_url │
    │             + pidx      │
    │                         │
    ↓                ↓        ↓
  Frontend submits  Redirect  Frontend submits
  form to           to        form to
  esewaUrl          payment_  paymentUrl
                    url
    
    ↓                ↓        ↓
  User on          User on   User on
  eSewa             Khalti    NepaliPay
  Payment Page      Payment   Payment
                    Page      Page
    
    ↓                ↓        ↓
  Complete         Complete  Complete
  Payment          Payment    Payment
    
    ↓                ↓        ↓
  Redirect to      Redirect  Redirect to
  Backend          to        Backend
  Callback         Backend   Callback
                   Callback
```

---

## Mock Payments (For Development)

All three gateways support mock mode:

```javascript
// server/.env
NODE_ENV=development
MOCK_PAYMENTS=true

// This will intercept all payment API calls and return mock responses
```

When enabled:
- ✅ No real API credentials needed
- ✅ Instant payment confirmation
- ✅ Perfect for testing
- ✅ Redirects still work with mock URLs

See [PAYMENT_GATEWAY_FLOW.md](./PAYMENT_GATEWAY_FLOW.md) for more details.
