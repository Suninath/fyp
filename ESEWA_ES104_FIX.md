# eSewa ES104 Error - Invalid Payload Signature

## Error
```json
{
  "code": "ES104",
  "message": "Invalid payload signature."
}
```

## What This Means
The signature being sent to eSewa doesn't match what eSewa expects. This is a security validation that prevents tampering with payment data.

## Root Causes

### 1. ❌ Wrong Secret Key
- The ESEWA_SECRET_KEY in `.env` was not set
- Code was defaulting to hardcoded value
- **Solution**: Add correct secret key to `.env`

### 2. ❌ Field Order Mismatch
- Signature must be calculated from fields in **exact order** specified in `signed_field_names`
- Order matters for HMAC validation

### 3. ❌ Data Format Issues
- Values must be strings, consistent formatting
- No extra whitespace or type coercion issues

## Fixes Applied

### 1. ✅ Updated `.env` file
```env
# Payment Gateways
# eSewa
ESEWA_MERCHANT_CODE=EPAYTEST
ESEWA_SECRET_KEY=8gBm/:&EnhH.1/q(
```

### 2. ✅ Improved Signature Generation
**File**: `server/src/service/booking.service.ts`

Enhanced logging to debug:
```typescript
console.log("🔐 Signature Generation Details:", {
  secretKey,
  totalAmount: total,
  transactionUuid: uuid,
  productCode: code,
  signableData,
});
```

### 3. ✅ Correct Field Order
The signature is calculated from these fields **in this exact order**:
1. `total_amount`
2. `transaction_uuid`
3. `product_code`

Formula:
```
signableData = "${total_amount},${transaction_uuid},${product_code}"
signature = HMAC-SHA256(signableData, secretKey)
```

## How Signature Validation Works

```
eSewa Form Submission:
┌─────────────────────────────────────────────────────────┐
│ Field           │ Value                    │ In Sig?     │
├─────────────────────────────────────────────────────────┤
│ total_amount    │ 1000.00                  │ ✅ YES      │
│ transaction_uuid│ 1_100_1706887234234      │ ✅ YES      │
│ product_code    │ EPAYTEST                 │ ✅ YES      │
│ signature       │ <calculated hash>        │ ❌ NO (meta) │
└─────────────────────────────────────────────────────────┘

Signable Data:
"1000.00,1_100_1706887234234,EPAYTEST"

Hash = HMAC-SHA256(
  "1000.00,1_100_1706887234234,EPAYTEST",
  "8gBm/:&EnhH.1/q("
)
```

## Testing

### Before Submitting Payment
1. Check console logs for signature generation details
2. Verify `signed_field_names` order matches signature calculation
3. Confirm `ESEWA_SECRET_KEY` is set in `.env`

### Console Output
You should see:
```
🔐 Signature Generation Details: {
  secretKey: '8gBm/:&EnhH.1/q(',
  totalAmount: '1000.00',
  transactionUuid: '1_100_1706887234234',
  productCode: 'EPAYTEST',
  signableData: '1000.00,1_100_1706887234234,EPAYTEST'
}
✅ Generated Signature: [base64_hash_here]
```

## If Still Getting ES104

1. **Verify Secret Key**
   ```bash
   # In server/.env
   echo $ESEWA_SECRET_KEY  # Should show: 8gBm/:&EnhH.1/q(
   ```

2. **Check Field Order**
   - `signed_field_names` order must match signature calculation order
   - Current order: `total_amount,transaction_uuid,product_code`

3. **Test with RC Environment**
   - URL: `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=EPAYTEST&total_amount=100&transaction_uuid=123`
   - Merchant Code: `EPAYTEST`
   - This is the test sandbox

4. **Enable Detailed Logging**
   - Check server console output
   - Look for 🔐 and ✅ emoji markers for signature details

## References
- eSewa Developer Docs: https://developer.esewa.com.np/
- RC Environment: `https://rc.esewa.com.np/`
- Test Merchant Code: `EPAYTEST`
- Test Secret Key: `8gBm/:&EnhH.1/q(`

## Common Issues

| Issue | Solution |
|-------|----------|
| ES104 still appearing | Verify `ESEWA_SECRET_KEY` in `.env` |
| Signature mismatch | Check `signed_field_names` order matches calculation |
| Payment portal redirects back | Check `success_url` and `failure_url` are correct |
| Cannot submit form | Check all required fields are present in form |
