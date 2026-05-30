# Local Development Quick Start

Having issues with payment gateway DNS errors? Follow this guide to set up local development with mock payments.

---

## 🎯 Problem: DNS_PROBE_FINISHED_NXDOMAIN for uat.esewa.com.np

**Solution:** Use mock payments for local development. All payment requests are automatically intercepted and return success responses.

---

## ⚡ 5-Minute Setup

### 1. Run Setup Script
```powershell
cd d:\second_auto_gear
.\setup-dev.bat
```

### 2. Configure Backend (Edit `server/.env.local`)
```env
MOCK_PAYMENTS=true
NODE_ENV=development
DB_HOST=localhost
DB_PASSWORD=your_password
```

### 3. Start Backend
```powershell
cd server
npm run dev
```

### 4. Start Frontend (New Terminal)
```powershell
cd frontend
npm run dev
```

### 5. Open Browser
```
http://localhost:5173
```

---

## ✅ Verify Setup

### Look for Success Messages

**Backend Console:**
```
✅ Server running on http://localhost:3000
✅ Connected to database
```

**Frontend Console:**
```
✅ Local: http://localhost:5173
```

### Test Payment Flow

1. Create a booking
2. Click "Pay Now"
3. Backend console shows: `🎭 Mock eSewa Verification called...`
4. Payment marked SUCCESS
5. Booking status: CONFIRMED

---

## 📚 Full Documentation

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [LOCAL_DEVELOPMENT_INDEX.md](LOCAL_DEVELOPMENT_INDEX.md) | Navigation hub | 5 min |
| [LOCAL_DEVELOPMENT_SETUP_SUMMARY.md](LOCAL_DEVELOPMENT_SETUP_SUMMARY.md) | Quick overview | 5 min |
| [LOCAL_DEVELOPMENT_GUIDE.md](LOCAL_DEVELOPMENT_GUIDE.md) | Complete setup guide | 30 min |
| [LOCAL_DEVELOPMENT_CHECKLIST.md](LOCAL_DEVELOPMENT_CHECKLIST.md) | Verification checklist | 20 min |
| [MOCK_PAYMENT_TESTING.md](MOCK_PAYMENT_TESTING.md) | Payment testing guide | 15 min |

---

## 🔧 Important Files

- **[setup-dev.bat](setup-dev.bat)** - Automated Windows setup
- **[server/.env.local.example](server/.env.local.example)** - Environment template
- **[server/src/utils/mockPaymentService.ts](server/src/utils/mockPaymentService.ts)** - Mock implementation
- **[server/src/service/booking.service.ts](server/src/service/booking.service.ts)** - Updated with mock support

---

## 🚨 Common Issues

### DNS Error Still Occurring?
```env
# Verify in server/.env.local
MOCK_PAYMENTS=true
NODE_ENV=development
```
Then restart backend.

### Mock Not Being Called?
Check backend console for `🎭` emoji:
- If present: Mock is working ✅
- If not: Restart backend after env changes

### Database Connection Error?
```powershell
# Create database
psql -U postgres -c "CREATE DATABASE second_auto_gear_dev;"

# Or use Docker
docker run --name postgres-dev -e POSTGRES_PASSWORD=password -e POSTGRES_DB=second_auto_gear_dev -p 5432:5432 -d postgres:15
```

---

## 📖 Next Steps

1. **Start Here:** [LOCAL_DEVELOPMENT_SETUP_SUMMARY.md](LOCAL_DEVELOPMENT_SETUP_SUMMARY.md)
2. **Follow Checklist:** [LOCAL_DEVELOPMENT_CHECKLIST.md](LOCAL_DEVELOPMENT_CHECKLIST.md)
3. **Test Payments:** [MOCK_PAYMENT_TESTING.md](MOCK_PAYMENT_TESTING.md)

For complete documentation, see [LOCAL_DEVELOPMENT_INDEX.md](LOCAL_DEVELOPMENT_INDEX.md)

---

## ✨ What You Get

✅ **Mock Payments** - No DNS errors, instant success
✅ **Auto-Reload** - Backend and frontend auto-reload on changes
✅ **Database Support** - Local PostgreSQL development
✅ **Full Integration** - Test booking + payment flow
✅ **Production-Ready** - Switch to real payments anytime

---

## 💡 Pro Tips

### View Mock Logs
```
🎭 = Mock is active and processing request
✅ = Payment verified successfully
```

### Database Verification
```sql
SELECT * FROM payment WHERE status = 'SUCCESS';
SELECT * FROM booking WHERE status = 'CONFIRMED';
```

### Kill Port If In Use
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

---

🎉 **Ready? Start with `.\setup-dev.bat`**
