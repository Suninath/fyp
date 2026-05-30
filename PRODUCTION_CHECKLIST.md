Khalti Production Deployment Steps

1. Update backend .env:
   - KHALTI_API_URL=https://khalti.com/api/v2
   - KHALTI_SECRET_KEY=<live_secret_key_from_admin.khalti.com>
   - KHALTI_PUBLIC_KEY=<live_public_key>

2. Ensure FRONTEND_URL and BACKEND_URL are correct (https with your production domains).

3. Restart backend so environment variables take effect.

4. Verify initiate endpoint uses `KHALTI_API_URL` and `Authorization: Key <secret>` header is present.

5. Test a real wallet transaction (real phone + MPIN). Sandbox test credentials (9800000000, MPIN 1111) will NOT work in production.

6. Monitor server logs for any Khalti error responses and ensure `purchase_order_id` is unique per attempt.

7. Ensure callback or verify flow marks bookings as paid only after successful Khalti lookup verification.

Notes:
- For sandbox testing use `KHALTI_API_URL=https://dev.khalti.com/api/v2` and test keys from https://test-admin.khalti.com.
- Never expose `KHALTI_SECRET_KEY` to the frontend or client-side code.

Sandbox reminder:
- Use `KHALTI_API_URL=https://dev.khalti.com/api/v2` in development.
- Use `test_secret_key_*` and `test_public_key_*` from the Khalti test dashboard.
