# Local Development Checklist

Complete this checklist to get your local development environment running smoothly.

---

## Pre-Setup

- [ ] Node.js v18+ installed: `node --version`
- [ ] PostgreSQL installed or Docker available
- [ ] Git installed: `git --version`
- [ ] VS Code installed (optional but recommended)
- [ ] Internet connection working

---

## Database Setup

### Option A: PostgreSQL Local

- [ ] PostgreSQL service running
- [ ] Created database `second_auto_gear_dev`
- [ ] Have database credentials: user, password, host

### Option B: Docker

- [ ] Docker installed: `docker --version`
- [ ] PostgreSQL container running
  ```powershell
  docker run --name postgres-dev `
    -e POSTGRES_PASSWORD=password `
    -e POSTGRES_DB=second_auto_gear_dev `
    -p 5432:5432 `
    -d postgres:15
  ```
- [ ] Container is accessible at `localhost:5432`

---

## Backend Setup

- [ ] Navigate to `server/` directory
- [ ] Dependencies installed: `npm install`
- [ ] Created `server/.env.local` from `.env.local.example`
- [ ] Updated environment variables:
  - [ ] `DB_HOST=localhost`
  - [ ] `DB_PORT=5432`
  - [ ] `DB_USER=postgres`
  - [ ] `DB_PASSWORD=<your_password>`
  - [ ] `DB_NAME=second_auto_gear_dev`
  - [ ] `NODE_ENV=development`
  - [ ] `MOCK_PAYMENTS=true`
  - [ ] `JWT_SECRET=<any_random_string>`
  - [ ] `FRONTEND_URL=http://localhost:5173`

- [ ] Database migrations run (if applicable)
- [ ] Test backend starts: `npm run dev`
  - Expected: `✅ Server running on http://localhost:3000`
  - Expected: `✅ Connected to database`

---

## Frontend Setup

- [ ] Navigate to `frontend/` directory
- [ ] Dependencies installed: `npm install`
- [ ] Created `frontend/.env.local`
- [ ] Set `VITE_API_URL=http://localhost:3000`
- [ ] Test frontend starts: `npm run dev`
  - Expected: `✅ Frontend running on http://localhost:5173`

---

## Running the Application

### Terminal 1 - Backend
```powershell
cd server
npm run dev
```
- [ ] Server starts successfully
- [ ] Shows: `✅ Server running on http://localhost:3000`
- [ ] Database connection successful
- [ ] Socket.IO running on `ws://localhost:3001`

### Terminal 2 - Frontend
```powershell
cd frontend
npm run dev
```
- [ ] Frontend compiles without errors
- [ ] Shows: `✅ Local: http://localhost:5173`
- [ ] Opens in browser automatically (or visit manually)

### Terminal 3 - Browser
- [ ] Open: `http://localhost:5173`
- [ ] Application loads without console errors
- [ ] Can navigate pages without 404 errors
- [ ] Can see mock payment URLs when initiating payments

---

## Payment Mock Verification

### Mock Payments Enabled Check

In browser console or backend logs, look for:

- [ ] `🎭 Mock eSewa Verification called...` (when testing eSewa)
- [ ] `🎭 Using mock Khalti initiation...` (when testing Khalti)
- [ ] `🎭 Using mock Khalti lookup...` (when testing Khalti callback)

### Test Payment Flow

- [ ] Create a test booking
  - [ ] Select vehicle
  - [ ] Choose dates
  - [ ] Fill location/notes
  - [ ] Submit booking

- [ ] Initiate payment (eSewa)
  - [ ] Click "Pay Now"
  - [ ] Select "eSewa" as payment method
  - [ ] Redirected to: `https://uat.esewa.com.np/epay/main?...`
  - [ ] See mock URL (not real eSewa)
  - [ ] Backend shows: `🎭 Mock eSewa Verification called...`

- [ ] Initiate payment (Khalti)
  - [ ] Click "Pay Now"
  - [ ] Select "Khalti" as payment method
  - [ ] Backend shows: `🎭 Using mock Khalti initiation...`
  - [ ] Get mock payment URL

- [ ] Handle callback
  - [ ] After payment, callback processed
  - [ ] Backend shows success message
  - [ ] Payment status: `SUCCESS`
  - [ ] Booking status: `CONFIRMED`

---

## Database Verification

### Connect to Database

```powershell
# Local PostgreSQL
$env:PGPASSWORD = "your_password"
psql -U postgres -d second_auto_gear_dev

# Docker PostgreSQL
docker exec -it postgres-dev psql -U postgres -d second_auto_gear_dev
```

### Verify Tables

```sql
-- Check tables exist
\dt

-- Check users
SELECT id, first_name, email FROM users LIMIT 5;

-- Check vehicles
SELECT id, name, model, price_per_day FROM vehicle LIMIT 5;

-- Check bookings
SELECT id, user_id, vehicle_id, status FROM booking LIMIT 5;

-- Check payments
SELECT id, booking_id, method, status, amount FROM payment LIMIT 5;
```

- [ ] All tables exist
- [ ] Sample data present (if seeded)
- [ ] Can query without errors

---

## Common Issues Resolution

### ❌ "Cannot connect to database"
- [ ] PostgreSQL is running: `psql --version` shows version
- [ ] Database created: `second_auto_gear_dev`
- [ ] `.env.local` has correct credentials
- [ ] Port 5432 is open (not blocked by firewall)

### ❌ "DNS_PROBE_FINISHED_NXDOMAIN for eSewa"
- [ ] `MOCK_PAYMENTS=true` in `.env.local`
- [ ] `NODE_ENV=development` in `.env.local`
- [ ] Backend restarted after env changes
- [ ] Check backend console for `🎭` emoji

### ❌ "CORS error when frontend calls backend"
- [ ] Backend running on `http://localhost:3000`
- [ ] Frontend running on `http://localhost:5173`
- [ ] `.env.local` has correct URLs
- [ ] Backend CORS middleware properly configured

### ❌ "Port already in use"
- [ ] Kill process using port:
  ```powershell
  Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
  ```
- [ ] Or change port in `.env.local`: `PORT=3001`

### ❌ "Module not found error"
- [ ] Dependencies installed: `npm install`
- [ ] Proper file paths in imports
- [ ] TypeScript compiled correctly

---

## Development Workflow

### Daily Startup

1. [ ] Start PostgreSQL (if not running)
2. [ ] Open Terminal 1: Backend
   ```powershell
   cd server && npm run dev
   ```
3. [ ] Open Terminal 2: Frontend
   ```powershell
   cd frontend && npm run dev
   ```
4. [ ] Open `http://localhost:5173` in browser
5. [ ] Wait for both to fully start (green checkmarks)

### Testing Changes

- [ ] Backend changes: Auto-reload with `ts-node-dev`
- [ ] Frontend changes: Auto-reload with Vite
- [ ] Database changes: Restart backend or run migrations
- [ ] Env changes: Restart backend

### Committing Code

- [ ] Backend works: `npm run dev` starts without errors
- [ ] Frontend works: `npm run dev` compiles without errors
- [ ] No console errors in browser
- [ ] `.env.local` NOT committed to git (should be in .gitignore)

---

## IDE Setup (VS Code)

### Recommended Extensions

- [ ] Thunder Client (API testing)
- [ ] Prettier (code formatting)
- [ ] ESLint (linting)
- [ ] PostgreSQL (database browsing)
- [ ] REST Client (API testing)

### Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "cwd": "${workspaceFolder}/server",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## Performance Optimization (Optional)

- [ ] Enable database query logging for debugging:
  ```env
  DB_LOGGING=true
  ```

- [ ] Set appropriate NODE_ENV:
  - Development: `NODE_ENV=development` (with hot reload)
  - Production-like: `NODE_ENV=production` (no hot reload)

- [ ] Monitor memory:
  ```powershell
  # In backend terminal, check memory usage
  Get-Process -Name node | Select-Object -Property Name, @{N='MemoryMB';E={[math]::Round($_.WorkingSet/1MB)}}
  ```

---

## Cleanup & Reset

### Reset Database (if needed)

```powershell
# Option 1: Drop and recreate
psql -U postgres -c "DROP DATABASE second_auto_gear_dev;"
psql -U postgres -c "CREATE DATABASE second_auto_gear_dev;"

# Option 2: Docker container
docker rm -f postgres-dev
docker run --name postgres-dev ... (see above)
```

### Clear Cache

```powershell
# Backend
cd server
Remove-Item -Recurse -Force node_modules
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

### Fresh Start

```powershell
# Backend
cd server
Remove-Item -Recurse -Force node_modules dist
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
Remove-Item -Recurse -Force node_modules .vite
npm install
npm run dev
```

---

## Useful Commands Reference

```powershell
# Backend
cd server
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run typeorm ...  # Run TypeORM commands
npm run seed         # Seed database

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Run linter
npm run format       # Format code with Prettier

# Database
npm run typeorm migration:run      # Run migrations
npm run typeorm migration:revert   # Revert migrations
npm run typeorm migration:create   # Create new migration
```

---

## Success Checklist

- [ ] ✅ Backend starts without errors
- [ ] ✅ Frontend starts without errors
- [ ] ✅ Can access `http://localhost:5173`
- [ ] ✅ Can create bookings
- [ ] ✅ Can see mock payment URLs
- [ ] ✅ Payment mock working (see `🎭` logs)
- [ ] ✅ Database updates correctly
- [ ] ✅ No console errors in browser
- [ ] ✅ Ready for development!

---

## Documentation References

- [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md) - Full setup guide
- [MOCK_PAYMENT_TESTING.md](MOCK_PAYMENT_TESTING.md) - Payment testing guide
- [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md) - Payment gateway details
- [README.md](README.md) - Project overview
- [ARCHITECTURE_DIAGRAMS.md](ARCHITECTURE_DIAGRAMS.md) - System architecture

---

## Quick Support

If stuck:
1. Check this checklist for missed items
2. Look at troubleshooting section above
3. Review documentation links above
4. Check backend console for error messages
5. Check browser console for JavaScript errors
6. Check `.env.local` configuration

Happy coding! 🚀
