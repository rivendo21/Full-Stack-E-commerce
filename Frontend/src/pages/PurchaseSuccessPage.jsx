import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import axios from "../lib/axios";
import { useCartStore } from "../stores/useCartStore";

const PurchaseSuccessPage = () => {
  const [processing, setProcessing] = useState(true);
  const { clearCart } = useCartStore();

  useEffect(() => {
    const handleCheckoutSuccess = async (sessionId) => {
      try {
        await axios.post(`/payments/checkout-success`, { sessionId });
        clearCart();
      } catch (error) {
        console.error(error);
      } finally {
        setProcessing(false);
      }
    };
    const sessionId = new URLSearchParams(window.location.search).get(
      "sessionId"
    );
    if (sessionId) {
      handleCheckoutSuccess(sessionId);
    } else {
      setProcessing(false);
    }
  }, [clearCart]);
  if (processing) {
    return (
      <div className="h-screen flex items-center justify-center px-4">
        <div className="p-6 sm:p-8">
          <div className="flex justify-center">Thank you for your purchase</div>
          <h1 className="text-center text-2xl font-bold text-emerald-400 mt-4">
            Your order has been placed successfully
          </h1>
          <p>Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center px-4">
      <div className="p-6 sm:p-8">
        <div className="flex justify-center">Thank you for your purchase</div>
        <h1 className="text-center text-2xl font-bold text-emerald-400 mt-4">
          Your order has been placed successfully
        </h1>
        <p>We are currently processing your order</p>
        <p>Check your email for order details and updates</p>
        <div className="bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Order ID</span>
            <span className="text-sm font-semibold text-emerald-400">
              #12345
            </span>

            <div>
              <span className="text-sm text-gray-400">Estimated delivery</span>
              <span className="text-sm font-semibold text-emerald-400">
                3-5 business days
              </span>
            </div>
          </div>
          <Link to="/">
            <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center justify-center">
              Continue shopping
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;
