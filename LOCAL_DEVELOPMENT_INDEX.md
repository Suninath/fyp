# Local Development Documentation Index

This folder contains complete documentation for setting up and developing Second Auto Gear locally with mock payment support.

---

## 🚀 Quick Start (Start Here!)

1. **[LOCAL_DEVELOPMENT_SETUP_SUMMARY.md](LOCAL_DEVELOPMENT_SETUP_SUMMARY.md)**
   - 5-minute quick start
   - Problem explanation and solution
   - Key files created
   - Troubleshooting overview

2. **Run Setup Script:**
   ```powershell
   .\setup-dev.bat
   ```

---

## 📚 Complete Documentation

### Setup & Installation

- **[LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)**
  - Detailed step-by-step setup
  - Database configuration (PostgreSQL/Docker)
  - Environment variables explained
  - Database migration and seeding
  - CORS and port configuration
  - 10+ troubleshooting scenarios
  - Development tools recommendations

### Development Workflow

- **[LOCAL_DEVELOPMENT_CHECKLIST.md](LOCAL_DEVELOPMENT_CHECKLIST.md)**
  - Pre-setup verification
  - Database setup checklist
  - Backend setup checklist
  - Frontend setup checklist
  - Running the application
  - Payment mock verification
  - Database verification
  - Common issues resolution
  - IDE setup (VS Code)
  - Cleanup & reset procedures

### Payment Testing

- **[MOCK_PAYMENT_TESTING.md](MOCK_PAYMENT_TESTING.md)**
  - Mock payment configuration
  - Complete payment flows (eSewa, Khalti)
  - Mock response examples
  - Testing scenarios with curl/Postman
  - Backend console output reference
  - Troubleshooting mock payments
  - Switching between mock and real payments
  - Implementation details

---

## 🔧 Setup Tools

- **[setup-dev.bat](setup-dev.bat)**
  - Automated Windows setup script
  - Checks prerequisites (Node.js, PostgreSQL)
  - Installs dependencies
  - Creates environment files
  - Displays next steps

- **[server/.env.local.example](server/.env.local.example)**
  - Environment variable template
  - Pre-configured mock settings
  - Database configuration
  - Payment gateway credentials
  - All variables explained in comments

---

## 📝 Code Files Modified/Created

### New Files Created

1. **[server/src/utils/mockPaymentService.ts](server/src/utils/mockPaymentService.ts)**
   - Mock eSewa verification
   - Mock Khalti payment initiation
   - Mock Khalti lookup
   - Mock NepaliPay verification
   - Axios interceptor setup

### Files Modified

1. **[server/src/service/booking.service.ts](server/src/service/booking.service.ts)**
   - Added mock payment support
   - Updated `generateEsewaPayload()` method
   - Updated `generateKhaltiPayload()` method
   - Updated `esewaCallback()` method
   - Updated `khaltiCallback()` method
   - Conditional logic: use mock if `MOCK_PAYMENTS=true`

---

## 🎯 How It Works

### The Problem (Solved ✅)
```
DNS_PROBE_FINISHED_NXDOMAIN for uat.esewa.com.np
↓
Cannot reach eSewa UAT server during local development
↓
Solution: Mock all payment requests during development
```

### The Solution

**Configuration:**
```env
MOCK_PAYMENTS=true
NODE_ENV=development
```

**Behavior:**
- All payment API calls are intercepted
- Mock responses returned instantly
- Payments marked as SUCCESS automatically
- Database updated correctly
- Console logs show `🎭` emoji when mock is active

**When Disabled:**
```env
MOCK_PAYMENTS=false
```
- Real API calls made to payment gateways
- Requires valid merchant credentials
- Requires network access
- Realistic production behavior

---

## 📊 File Organization

```
second_auto_gear/
├── 📄 LOCAL_DEVELOPMENT_SETUP_SUMMARY.md  ← Start here (5 min)
├── 📄 LOCAL_DEVELOPMENT_GUIDE.md          ← Full guide (30 min)
├── 📄 LOCAL_DEVELOPMENT_CHECKLIST.md      ← Verification steps
├── 📄 MOCK_PAYMENT_TESTING.md             ← Payment testing
├── 📄 LOCAL_DEVELOPMENT_INDEX.md          ← This file
├── 🔧 setup-dev.bat                       ← Automated setup
│
├── server/
│   ├── .env.local.example                 ← Template
│   └── src/
│       ├── utils/
│       │   └── mockPaymentService.ts      ← NEW: Mock implementation
│       └── service/
│           └── booking.service.ts         ← MODIFIED: Mock integration
│
└── frontend/
    └── (no changes needed)
```

---

## ✅ Setup Checklist

Quick reference for setup order:

1. **Prerequisites**
   - [ ] Node.js v18+ installed
   - [ ] PostgreSQL or Docker ready
   - [ ] Git installed
   - [ ] Internet connection

2. **Environment Setup**
   - [ ] Run `.\setup-dev.bat`
   - [ ] Edit `server/.env.local`
   - [ ] Set up database

3. **Start Services**
   - [ ] Backend: `npm run dev`
   - [ ] Frontend: `npm run dev`
   - [ ] Browser: `http://localhost:5173`

4. **Verify Setup**
   - [ ] Backend running without errors
   - [ ] Frontend compiling without errors
   - [ ] Can access website
   - [ ] Can create bookings

5. **Test Payments**
   - [ ] Create booking
   - [ ] Click "Pay Now"
   - [ ] See `🎭` logs in backend
   - [ ] Payment marked SUCCESS
   - [ ] Booking status CONFIRMED

---

## 🆘 Troubleshooting Quick Links

| Issue | Solution |
|-------|----------|
| DNS error for eSewa | Set `MOCK_PAYMENTS=true` |
| Mock not being called | Restart backend, check NODE_ENV |
| Database connection failed | Check PostgreSQL running, verify credentials |
| CORS error | Check `.env.local` URLs, restart backend |
| Port already in use | Kill process or change PORT in .env |
| Module not found | Run `npm install` in backend/frontend |

Full troubleshooting in [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md#troubleshooting)

---

## 📖 Reading Guide by Role

### Backend Developer
1. [LOCAL_DEVELOPMENT_SETUP_SUMMARY.md](LOCAL_DEVELOPMENT_SETUP_SUMMARY.md)
2. [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)
3. [MOCK_PAYMENT_TESTING.md](MOCK_PAYMENT_TESTING.md#mock-service-implementation-details)
4. Review `server/src/utils/mockPaymentService.ts`
5. Review modified `booking.service.ts`

### Frontend Developer
1. [LOCAL_DEVELOPMENT_SETUP_SUMMARY.md](LOCAL_DEVELOPMENT_SETUP_SUMMARY.md)
2. [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)
3. [MOCK_PAYMENT_TESTING.md](MOCK_PAYMENT_TESTING.md) - Focus on frontend behavior

### Full-Stack Developer
1. Start with [LOCAL_DEVELOPMENT_SETUP_SUMMARY.md](LOCAL_DEVELOPMENT_SETUP_SUMMARY.md)
2. Follow [LOCAL_DEVELOPMENT_CHECKLIST.md](LOCAL_DEVELOPMENT_CHECKLIST.md) step-by-step
3. Reference [MOCK_PAYMENT_TESTING.md](MOCK_PAYMENT_TESTING.md) when testing payments

### New Team Member
1. Run `.\setup-dev.bat`
2. Follow [LOCAL_DEVELOPMENT_CHECKLIST.md](LOCAL_DEVELOPMENT_CHECKLIST.md)
3. Reference documentation as needed
4. Ask questions if stuck on troubleshooting

---

## 🎓 Learning Resources

### Understanding Mock Payments
- See: [MOCK_PAYMENT_TESTING.md](MOCK_PAYMENT_TESTING.md#mock-payment-flow)
- Code: [server/src/utils/mockPaymentService.ts](server/src/utils/mockPaymentService.ts)

### Real Payment Gateway Integration
- See: [PAYMENT_INTEGRATION.md](../PAYMENT_INTEGRATION.md) (existing docs)
- Integration details for eSewa and Khalti

### System Architecture
- See: [ARCHITECTURE_DIAGRAMS.md](../ARCHITECTURE_DIAGRAMS.md) (existing docs)
- High-level system design

### Database Schema
- See: [server/src/entities/](server/src/entities/) (existing files)
- Payment, Booking, User entities

---

## 🔄 Common Workflows

### Daily Development
```powershell
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev

# Browser
http://localhost:5173
```

### Testing Payment Integration
```powershell
# 1. Backend running with mock enabled
# 2. Create booking
# 3. Initiate payment
# 4. Watch backend console for 🎭 emoji
# 5. Verify payment in database
```

### Switching to Real Payments
```env
# In server/.env.local
MOCK_PAYMENTS=false
# Obtain real credentials and set them
ESEWA_MERCHANT_CODE=your_real_code
KHALTI_SECRET_KEY=your_real_key
```

### Reset Everything
```powershell
# Backend
cd server
Remove-Item -Recurse -Force node_modules dist
npm install

# Frontend
cd frontend
Remove-Item -Recurse -Force node_modules .vite
npm install

# Database (if needed)
# Drop and recreate: psql -U postgres -c "DROP DATABASE second_auto_gear_dev;"
```

---

## 📞 Support

### Before Asking for Help

1. Check [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md#troubleshooting)
2. Check [LOCAL_DEVELOPMENT_CHECKLIST.md](LOCAL_DEVELOPMENT_CHECKLIST.md#common-issues-resolution)
3. Check backend console for `🎭` emoji (confirms mock is active)
4. Check browser console for JavaScript errors
5. Verify `.env.local` configuration

### Common Questions

**Q: Do I need real eSewa credentials?**
A: No! With `MOCK_PAYMENTS=true`, all payment calls are mocked.

**Q: How do I know the mock is working?**
A: Look for `🎭` emoji in backend console logs.

**Q: Can I test with real payments?**
A: Yes, set `MOCK_PAYMENTS=false` and obtain real credentials.

**Q: What if DNS error still occurs?**
A: Ensure `MOCK_PAYMENTS=true`, `NODE_ENV=development`, restart backend.

---

## 🚀 You're Ready!

All documentation is in place. Choose your next step:

- **Quick Start** → [LOCAL_DEVELOPMENT_SETUP_SUMMARY.md](LOCAL_DEVELOPMENT_SETUP_SUMMARY.md)
- **Detailed Setup** → [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md)
- **Step-by-Step** → [LOCAL_DEVELOPMENT_CHECKLIST.md](LOCAL_DEVELOPMENT_CHECKLIST.md)
- **Test Payments** → [MOCK_PAYMENT_TESTING.md](MOCK_PAYMENT_TESTING.md)

Happy coding! 🎉
