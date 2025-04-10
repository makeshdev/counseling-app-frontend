import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import { CreditCardIcon, CheckIcon } from "@heroicons/react/24/outline";

const stripePromise = loadStripe(import.meta.env.REACT_APP_STRIPE_PUBLIC_KEY);

export default function Payments() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [error, setError] = useState("");

  const appointmentId = searchParams.get("appointment");

  useEffect(() => {
    if (!appointmentId) {
      navigate("/appointments");
      return;
    }

    const fetchData = async () => {
      try {
        const [appointmentRes, paymentRes] = await Promise.all([
          axios.get(`/api/appointments/${appointmentId}`),
          axios.get("/api/payments"),
        ]);

        // Check if payment already exists for this appointment
        const existingPayment = paymentRes.data.find(
          (p) => p.appointment._id === appointmentId
        );
        if (existingPayment) {
          navigate(`/appointments`);
          return;
        }

        setAppointment(appointmentRes.data);

        // Create payment intent
        const intentRes = await axios.post(
          "/api/payments/create-payment-intent",
          {
            appointment: appointmentId,
            amount: 50, // Fixed amount for demo
          }
        );
        setPaymentIntent(intentRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appointmentId, navigate]);

  const handlePayment = async () => {
    setError("");
    try {
      const stripe = await stripePromise;

      const { error: stripeError } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${user.firstName} ${user.lastName}`,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      // Confirm payment on our server
      await axios.post("/api/payments/confirm", {
        appointment: appointmentId,
        amount: 50,
        paymentMethod: "card",
        transactionId: paymentIntent.id,
      });

      setPaymentSuccess(true);
      setTimeout(() => {
        navigate("/appointments");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || "Payment failed");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  if (!appointment) {
    return <div className="text-center py-12">Appointment not found</div>;
  }

  if (paymentSuccess) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckIcon className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="mt-3 text-lg font-medium text-gray-900">
          Payment successful
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          Your session with {appointment.counselor.firstName}{" "}
          {appointment.counselor.lastName} is confirmed.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Complete Payment</h2>
        </div>
        <div className="px-6 py-4">
          <div className="mb-6">
            <h3 className="text-md font-medium">Appointment Details</h3>
            <p className="mt-1 text-gray-600">
              {new Date(appointment.date).toLocaleDateString()} at{" "}
              {appointment.time}
            </p>
            <p className="text-gray-600">
              With {appointment.counselor.firstName}{" "}
              {appointment.counselor.lastName}
            </p>
            <p className="text-gray-600 capitalize">
              {appointment.type.replace("-", " ")} counseling
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-md font-medium">Payment Information</h3>
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Session Fee</span>
                <span className="font-medium">$50.00</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="font-medium text-lg">$50.00</span>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              role="alert"
            >
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="mb-6">
            <h3 className="text-md font-medium mb-2">Card Details</h3>
            <div className="border border-gray-300 rounded-md p-3">
              <div className="flex items-center">
                <CreditCardIcon className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm text-gray-600">
                  Secure payment powered by Stripe
                </span>
              </div>
              <div className="mt-3" id="card-element"></div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Pay $50.00
          </button>
        </div>
      </div>
    </div>
  );
}
