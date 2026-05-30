import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XCircle, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import Navigation from "../../components/common/Navigation";
import Footer from "../../components/common/Footer";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message") || "Payment could not be completed";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          {/* Failure Icon */}
          <div className="w-20 h-20 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Failed
          </h1>
          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {/* Help Text */}
          <div className="bg-amber/5 rounded-lg p-4 mb-6 text-left border border-amber/20">
            <h3 className="font-semibold text-amber mb-2">What could have happened?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-amber">•</span>
                Insufficient balance in your wallet
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber">•</span>
                Transaction was cancelled by user
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber">•</span>
                Network or server error occurred
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber">•</span>
                Session expired during payment
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate("/bookings")}
              className="flex-1 bg-purple text-white hover:bg-purple/90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
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

          {/* Support */}
          <p className="text-sm text-gray-500 mt-6">
            Need help? <a href="/contact" className="text-purple hover:underline">Contact Support</a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentFailure;
