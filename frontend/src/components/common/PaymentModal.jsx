import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { initiatePayment } from "../../rtk/slice/bookingSlice";
import { X } from "lucide-react";
import { Button } from "../ui/button";
import { SucessToast, ErrorToast } from "./toast";
import { isKhaltiSandbox } from "../../lib/khalti";

const PaymentModal = ({ booking, onClose }) => {
  const dispatch = useDispatch();
  const [selectedMethod, setSelectedMethod] = useState("");
  const [loading, setLoading] = useState(false);

  // Safety check for booking data
  if (!booking || !booking.id) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <p className="text-red-600 font-semibold">Error: Booking data is unavailable</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Close
          </button>
        </div>
      </div>
    );
  }

  const paymentMethods = [
    {
      id: "eSewa",
      name: "eSewa",
      description: "Pay with eSewa digital wallet",
      icon: "🏦",
      color: "from-green-400 to-green-600",
    },
    {
      id: "Khalti",
      name: "Khalti",
      description: "Pay with Khalti digital wallet",
      icon: "💜",
      color: "from-purple-400 to-purple-600",
    },
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      ErrorToast({ message: "Please select a payment method" });
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(
        initiatePayment({
          bookingId: booking.id,
          method: selectedMethod,
        })
      );

      console.log("Payment initiation result:", result);

      if (result.payload?.status) {
        const paymentGateway = result.payload.data?.paymentGateway;

        if (result.payload?.data?.reusedExisting) {
          SucessToast({ message: "Resuming previous payment attempt..." });
        }
        
        if (!paymentGateway) {
          ErrorToast({ message: "Payment gateway data not received" });
          setLoading(false);
          return;
        }

        console.log("Payment Gateway Data:", paymentGateway);

        // Redirect to payment gateway based on method
        if (selectedMethod === "eSewa") {
          SucessToast({ message: "Redirecting to eSewa..." });
          setTimeout(() => redirectToEsewa(paymentGateway), 500);
        } else if (selectedMethod === "Khalti") {
          SucessToast({ message: "Redirecting to Khalti..." });
          setTimeout(() => redirectToKhalti(paymentGateway), 500);
        }
      } else {
        const errorMsg = result.payload?.message || "Payment initiation failed";
        console.error("Payment error:", errorMsg);
        ErrorToast({ message: errorMsg });
      }
    } catch (error) {
      console.error("Payment error:", error);
      ErrorToast({ message: "Payment error: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const redirectToEsewa = (data) => {
    // Create form for eSewa API v2 - official field names
    const form = document.createElement("form");
    form.method = "POST";
    form.action = data.esewaUrl;

    // eSewa API v2 form fields (official names from documentation)
    const fields = {
      amount: data.amount,
      tax_amount: data.tax_amount,
      product_service_charge: data.product_service_charge,
      product_delivery_charge: data.product_delivery_charge,
      total_amount: data.total_amount,
      transaction_uuid: data.transaction_uuid,
      product_code: data.product_code,
      success_url: data.success_url,
      failure_url: data.failure_url,
      signed_field_names: data.signed_field_names,
      signature: data.signature,
    };

    Object.keys(fields).forEach((key) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = fields[key];
      form.appendChild(input);
    });

    console.log("✅ eSewa Form Fields (API v2):", fields);
    console.log("📤 Submitting form to:", data.esewaUrl);
    document.body.appendChild(form);
    form.submit();
  };

  const redirectToKhalti = async (data) => {
    try {
      const paymentUrl = data.gateway_payment_url || data.payment_url || data.go_link;

      if (!paymentUrl) {
        ErrorToast({ message: "Khalti payment URL was not returned" });
        return;
      }

      console.log("Redirecting to Khalti payment:", paymentUrl);
      window.location.href = paymentUrl;
    } catch (error) {
      console.error("Khalti redirect error:", error);
      ErrorToast({ message: "Failed to connect to Khalti" });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Select Payment Method</h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="space-y-2">
            <p className="text-gray-600">
              <strong>Vehicle:</strong> {booking.vehicle?.name || "Vehicle"}
            </p>
            <p className="text-gray-600">
              <strong>Duration:</strong> {booking.numberOfDays || 0} days
            </p>
            <p className="text-2xl font-bold text-green-600">
              Amount to Pay: Rs. {booking.finalAmount || 0}
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="px-6 py-6 space-y-3">
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedMethod === method.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{method.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{method.name}</h3>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 ${
                    selectedMethod === method.id
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 bg-gray-50 border-t flex gap-3">
          {(import.meta.env.MODE !== 'production' || isKhaltiSandbox) && (
            <div className="absolute left-6 top-6 w-[calc(100%-96px)]">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm">
                <p className="font-semibold text-amber-900 mb-1">🧪 Test Mode — Khalti Sandbox</p>
                <p className="text-amber-800">
                  Use these test credentials on the Khalti page:
                  <br />
                  <span className="font-mono">Phone: 9800000000</span> · <span className="font-mono">MPIN: 1111</span> · <span className="font-mono">OTP: 987654</span>
                </p>
              </div>
            </div>
          )}
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={!selectedMethod || loading}
            className="flex-1 bg-green text-white hover:bg-green-600"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </Button>
        </div>

        {/* Info Message */}
        <div className="px-6 py-3 bg-blue-50 border-t text-sm text-blue-800">
          💳 Your booking will be confirmed once payment is successful.
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
