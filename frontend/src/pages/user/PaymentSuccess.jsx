import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, ArrowRight, Calendar } from "lucide-react";
import { Button } from "../../components/ui/button";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const pidx = searchParams.get("pidx");
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    // If we were redirected from Khalti with a pidx, verify it with backend
    if (pidx) {
      (async () => {
        setVerifying(true);
        try {
          const backend = import.meta.env.VITE_BACKEND_URL || '';
          const url = backend
            ? `${backend.replace(/\/$/, '')}/api/v1/bookings/payment/verify?pidx=${encodeURIComponent(pidx)}`
            : `/api/v1/bookings/payment/verify?pidx=${encodeURIComponent(pidx)}`;
          const resp = await fetch(url);
          const result = await resp.json();
          if (resp.ok && result.status) {
            // If backend processed and returned bookingId, we can show it (result.data)
            // If redirect included bookingId already, that's still shown via query param
            // Optionally navigate to bookings page or update UI
            // If result.data.bookingId present, navigate to bookings
            if (result.data?.bookingId) {
              // Replace URL to include bookingId for display
              const params = new URLSearchParams(window.location.search);
              params.set('bookingId', String(result.data.bookingId));
              const newUrl = `${window.location.pathname}?${params.toString()}`;
              window.history.replaceState({}, '', newUrl);
            }
          } else {
            setVerifyError(result.message || 'Payment verification failed');
          }
        } catch (e) {
          setVerifyError('Network error while verifying payment');
        } finally {
          setVerifying(false);
        }
      })();
    }
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. Thank you for choosing Second Auto Gear!
          </p>

          {/* Booking ID */}
          {verifying && (
            <div className="mb-4 text-sm text-gray-600">Verifying payment, please wait...</div>
          )}
          {verifyError && (
            <div className="mb-4 text-sm text-red-600">{verifyError}</div>
          )}
          {bookingId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Booking ID</p>
              <p className="text-lg font-semibold text-gray-900">#{bookingId}</p>
            </div>
          )}

          {/* What's Next */}
          <div className="bg-purple/5 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-purple mb-2">What's Next?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green">✓</span>
                You will receive a confirmation email shortly
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green">✓</span>
                Contact details will be shared for vehicle pickup
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green">✓</span>
                Bring valid ID and booking confirmation on pickup day
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/bookings")}
              className="flex-1 bg-purple text-white hover:bg-purple/90"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View My Bookings
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1"
            >
              Back to Home
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
