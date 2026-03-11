# Local Development Setup Guide

## Quick Start for Local Development

This guide helps you set up the Second Auto Gear project for local development without requiring access to external payment gateways.

---

## Prerequisites

- Node.js (v18+)
- PostgreSQL (local or Docker)
- npm or yarn
- Windows (based on your setup)

---

## Step 1: Database Setup

### Option A: Using PostgreSQL Locally

```powershell
# Install PostgreSQL if not already installed
# https://www.postgresql.org/download/windows/

# Create database
$env:PGPASSWORD = "your_password"
psql -U postgres -c "CREATE DATABASE second_auto_gear_dev;"
```

### Option B: Using Docker (Recommended)

```powershell
# Start PostgreSQL container
docker run --name postgres-dev `
  -e POSTGRES_PASSWORD=your_password `
  -e POSTGRES_DB=second_auto_gear_dev `
  -p 5432:5432 `
  -d postgres:15
```

---

## Step 2: Environment Configuration

### Server Setup

```powershell
cd server

# Copy the example env file
Copy-Item .env.local.example .env.local

# Edit .env.local with your values
# Important variables:
# - DB_HOST=localhost
# - DB_PORT=5432
# - DB_USER=postgres
# - DB_PASSWORD=your_password
# - DB_NAME=second_auto_gear_dev
# - MOCK_PAYMENTS=true
# - NODE_ENV=development
```

### Frontend Setup

```powershell
cd frontend

# Create .env.local
$env:VITE_API_URL = "http://localhost:3000"
```

---

## Step 3: Database Migration & Seeding

```powershell
cd server

# Install dependencies
npm install

# Run database migrations (if using TypeORM)
npm run typeorm migration:run

# Seed sample data
npm run seed
```

---

## Step 4: Running the Application

### Terminal 1 - Backend Server

```powershell
cd server
npm run dev

# Expected output:
# ✅ Server running on http://localhost:3000
# ✅ Socket.IO running on ws://localhost:3001
```

### Terminal 2 - Frontend Dev Server

```powershell
cd frontend
npm install
npm run dev

# Expected output:
# ✅ Frontend running on http://localhost:5173
```

---

## Payment Gateway Testing

### Mock Payments (Default for Local Dev)

When `MOCK_PAYMENTS=true` in your `.env.local`, all payment requests will be automatically mocked:

```
✅ eSewa calls → Mock success response
✅ Khalti calls → Mock payment URL
✅ NepaliPay calls → Mock verification
```

#### Test Payment Flow

1. Create a booking
2. Proceed to payment
3. Select any payment method
4. You'll be redirected to a mock payment URL
5. Click "Complete Payment" (or callback will auto-complete)
6. Payment marked as successful in database

### Real Payment Gateway Testing (Optional)

If you want to test with real gateways:

1. Set `MOCK_PAYMENTS=false` in `.env.local`
2. Obtain credentials from each payment provider:
   - **eSewa**: https://developer.esewa.com.np/
   - **Khalti**: https://docs.khalti.com/
   - **NepaliPay**: Contact provider

3. Update `.env.local`:
   ```
   ESEWA_MERCHANT_CODE=your_real_code
   KHALTI_SECRET_KEY=your_real_key
   MOCK_PAYMENTS=false
   ```

---

## Useful Commands

### Database

```powershell
# Create migration
npm run typeorm migration:create -- -n MigrationName

# Run migrations
npm run typeorm migration:run

# Revert last migration
npm run typeorm migration:revert

# Generate migration from entities
npm run typeorm migration:generate -- -n GeneratedMigration
```

### Development

```powershell
# Backend development mode (with auto-reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run seed
npm run seed
```

---

## Troubleshooting

### Error: DNS_PROBE_FINISHED_NXDOMAIN

**Problem**: Cannot reach `uat.esewa.com.np`

**Solution**: 
- Set `MOCK_PAYMENTS=true` in `.env.local`
- Ensure `NODE_ENV=development`
- Restart your backend server

```powershell
# Verify mock is working
# You should see: 🎭 Mock eSewa Verification called...
```

### Error: Database Connection Failed

**Problem**: Cannot connect to PostgreSQL

**Solution**:
```powershell
# Check if PostgreSQL is running
netstat -an | Select-String "5432"

# Or restart Docker container
docker restart postgres-dev

# Verify credentials in .env.local
```

### Error: CORS Issues

**Problem**: Frontend cannot reach backend API

**Solution**:
1. Check `FRONTEND_URL` in backend `.env.local`
2. Check `VITE_API_URL` in frontend `.env.local`
3. Both should match your local URLs

```powershell
# Backend should have:
FRONTEND_URL=http://localhost:5173

# Frontend environment variables should point to:
VITE_API_URL=http://localhost:3000
```

### Error: Port Already in Use

**Problem**: Port 3000 or 5173 is in use

**Solution**:
```powershell
# Find process using port 3000
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess

# Kill process
Stop-Process -Id <PID> -Force

# Or use different port in .env.local
PORT=3001
```

---

## Testing Payment Integration

### Mock Payment Test Checklist

- [ ] Create booking
- [ ] Select payment method
- [ ] Redirected to payment gateway
- [ ] Complete payment (mock auto-completes)
- [ ] Redirected back to success page
- [ ] Booking status updated to CONFIRMED
- [ ] Payment record shows SUCCESS status

### Database Verification

```powershell
# Connect to database
psql -U postgres -d second_auto_gear_dev

# Check payment records
SELECT id, status, method, amount, created_at FROM payment ORDER BY created_at DESC LIMIT 5;

# Check booking status
SELECT id, status, user_id, vehicle_id, total_amount FROM booking WHERE status = 'CONFIRMED' LIMIT 5;
```

---

## Development Tools

### Recommended Extensions

- **REST Client** - Test API endpoints directly in VS Code
- **Thunder Client** - Lightweight Postman alternative
- **Database Client** - Browse PostgreSQL directly in VS Code
- **Prisma** - If you switch from TypeORM

### Debugging

```typescript
// Enable detailed logging in booking.service.ts
console.log("🎭 Mock eSewa Verification called with params:", params);

// Check browser console for frontend errors
console.log("Payment response:", response);

// Database query logging
// Set in .env.local: DB_LOGGING=true
```

---

## Next Steps

1. ✅ Set up local database
2. ✅ Configure environment variables
3. ✅ Run backend server
4. ✅ Run frontend dev server
5. ✅ Test payment flow with mock payments
6. ✅ Verify database records

For more information:
- [PAYMENT_INTEGRATION.md](../PAYMENT_INTEGRATION.md) - Payment gateway details
- [PAYMENT_TESTING.md](../PAYMENT_TESTING.md) - Testing guide
- [README.md](../README.md) - General setup

---

## Support

If you encounter issues:

1. Check `.env.local` configuration
2. Review console logs in both terminals
3. Ensure all prerequisites are installed
4. Check file paths match your setup
5. Verify database is running and accessible
