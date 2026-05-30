## Payment Gateway Integration Flow

### 1. **Khalti Payment Flow** ✅ (API-based with redirect URL)
```
Frontend → Backend initiatePayment()
  ↓
Backend → Khalti API (POST /epayment/initiate/)
  ↓
Khalti returns: {pidx, payment_url, expires_at}
  ↓
Backend → Frontend {payment_url}
  ↓
Frontend redirects user to payment_url
  ↓
User completes payment on Khalti
  ↓
Khalti redirects → Backend /api/v1/bookings/payment/callback/khalti?pidx=xxx&transaction_id=xxx
  ↓
Backend verifies with Khalti API (lookup)
  ↓
Backend → Database update + redirect to success page
```

### 2. **eSewa Payment Flow** ✅ (Form-based with direct URL)
```
Frontend → Backend initiatePayment()
  ↓
Backend generates payload: {amt, pid, su, fu, merchant_code, esewaUrl}
  ↓
Backend → Frontend {esewaUrl, payload}
  ↓
Frontend creates HTML FORM and auto-submits to esewaUrl with payload
  ↓
User completes payment on eSewa
  ↓
eSewa redirects → Backend /api/v1/bookings/payment/callback/esewa?rid=xxx&pid=xxx
  ↓
Backend verifies with eSewa API
  ↓
Backend → Database update + redirect to success page
```

### 3. **NepaliPay Payment Flow** ❌ (Currently broken)
```
Frontend → Backend initiatePayment()
  ↓
Backend generates payload (but NO URL to redirect to!)
  ↓
Backend → Frontend sends payload as response
  ↓
Frontend doesn't know what to do with it ❌
  ↓
Payment never initiates
```

### **Solution for NepaliPay:**

Choose ONE approach:

#### **Option A: Make it like Khalti (async API call)**
- Backend calls NepaliPay API to initiate payment
- Returns payment_url to frontend
- Frontend redirects user to payment page

#### **Option B: Make it like eSewa (form submission)**
- Backend generates payload with direct payment URL
- Frontend auto-submits form to payment gateway
- Gateway handles payment and redirects back

#### **Option C: Mock for Development**
- In development mode, use mock payment service
- Returns fake payment_url or mock redirect

### **Recommended Implementation:**
Option B is simpler and doesn't require additional API credentials during development.
The frontend should handle this by:

1. Receiving the payload from backend
2. Creating an HTML form with the payload data
3. Auto-submitting the form to the `paymentUrl`

**Example Frontend Code:**
```javascript
// Receive response from backend
const response = await initiatePayment(bookingId, 'NepaliPay');

// For NepaliPay
if (response.method === 'NepaliPay') {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = response.paymentGateway.paymentUrl;
  
  // Add form fields from payload
  Object.keys(response.paymentGateway).forEach(key => {
    if (key !== 'paymentUrl') {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = response.paymentGateway[key];
      form.appendChild(input);
    }
  });
  
  document.body.appendChild(form);
  form.submit();
}
```
