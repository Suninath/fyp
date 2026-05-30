#!/bin/bash
# NepaliPay Payment Integration Verification Script

echo "🔍 Checking NepaliPay Payment Integration..."
echo ""

# Check 1: Backend payload generation
echo "1️⃣ Checking backend generateNepaliPayPayload() function..."
if grep -q "paymentUrl: \`https://payment.nepalipy.com/api/payment/initiate\`" server/src/service/booking.service.ts; then
    echo "   ✅ paymentUrl is present in backend payload"
else
    echo "   ❌ paymentUrl is MISSING in backend payload"
    echo "   Fix: Add paymentUrl to generateNepaliPayPayload() return object"
fi
echo ""

# Check 2: Frontend redirect function
echo "2️⃣ Checking frontend redirectToNepaliPay() function..."
if grep -q "form.action = data.paymentUrl" frontend/src/components/common/PaymentModal.jsx; then
    echo "   ✅ Frontend form uses paymentUrl"
else
    echo "   ❌ Frontend is NOT using paymentUrl"
    echo "   Fix: Update redirectToNepaliPay() to create form with paymentUrl"
fi
echo ""

# Check 3: Frontend toast message
echo "3️⃣ Checking if toast message is shown for NepaliPay..."
if grep -q 'SucessToast.*Nepali Pay' frontend/src/components/common/PaymentModal.jsx; then
    echo "   ✅ Success toast message present"
else
    echo "   ⚠️  No success toast for NepaliPay redirect"
fi
echo ""

# Check 4: Environment variables
echo "4️⃣ Checking environment configuration..."
if [ -f "server/.env" ]; then
    if grep -q "BACKEND_URL" server/.env; then
        echo "   ✅ BACKEND_URL is set"
    else
        echo "   ⚠️  BACKEND_URL is not set"
    fi
    
    if grep -q "NODE_ENV=development" server/.env; then
        echo "   ✅ NODE_ENV is development"
    else
        echo "   ⚠️  NODE_ENV is not development"
    fi
    
    if grep -q "MOCK_PAYMENTS=true" server/.env; then
        echo "   ✅ MOCK_PAYMENTS is enabled"
    else
        echo "   ⚠️  MOCK_PAYMENTS is not enabled"
    fi
else
    echo "   ❌ server/.env not found"
fi
echo ""

# Check 5: Axios instance with interceptor
echo "5️⃣ Checking axios instance with mock interceptor..."
if [ -f "server/src/utils/axiosInstance.ts" ]; then
    echo "   ✅ axiosInstance.ts exists"
    if grep -q "dev.khalti.com\|uat.esewa.com.np\|nepalipy" server/src/utils/axiosInstance.ts; then
        echo "   ✅ Mock interceptor includes payment gateways"
    else
        echo "   ❌ Mock interceptor doesn't include payment endpoints"
    fi
else
    echo "   ❌ axiosInstance.ts is MISSING - critical file!"
fi
echo ""

# Check 6: Booking service imports
echo "6️⃣ Checking if booking service uses axiosInstance..."
if grep -q "import axiosInstance" server/src/service/booking.service.ts; then
    echo "   ✅ Booking service imports axiosInstance"
else
    echo "   ❌ Booking service is NOT importing axiosInstance"
fi
echo ""

echo "════════════════════════════════════════"
echo "✨ Verification Complete!"
echo ""
echo "💡 If you see ❌, check the suggested fixes above"
echo "⚠️  If you see ⚠️, these are optional but recommended"
echo ""
