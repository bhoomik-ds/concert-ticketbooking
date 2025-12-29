import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Tag } from 'lucide-react'; 
import { useUser, useClerk } from "@clerk/clerk-react";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation(); // Data from previous page
  
  // Clerk Hooks
  const { isSignedIn, user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  
  // ✅ NEW: State to hold booking details (from URL or LocalStorage)
  const [bookingDetails, setBookingDetails] = useState(null);

  // ✅ 1. Load Data Logic (The Fix)
  useEffect(() => {
    // A. If we have data coming from the previous page, use it AND save backup
    if (state) {
      setBookingDetails(state);
      localStorage.setItem("tempBooking", JSON.stringify(state));
    } 
    // B. If no data (user just logged in and page reloaded), try loading backup
    else {
      const savedData = localStorage.getItem("tempBooking");
      if (savedData) {
        setBookingDetails(JSON.parse(savedData));
      }
    }
  }, [state]);

  // Handle Apply Coupon
  const handleApplyCoupon = async () => {
    if (!couponCode) return alert("Please enter a code");
    try {
      const res = await axios.post("http://localhost:5000/api/apply-discount", {
        bookingId: id,
        code: couponCode
      });
      setDiscountData(res.data);
      alert("✅ Coupon Applied Successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Invalid Coupon Code");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!isSignedIn) {
        // ✅ Force Clerk to redirect BACK to this page after login
        openSignIn({
            redirectUrl: window.location.href 
        });
        return;
    }

    const res = await loadRazorpayScript();
    if (!res) return alert("Razorpay SDK failed to load.");

    // Use current data values
    const finalAmount = discountData ? discountData.finalAmount : bookingDetails.totalAmount;

    try {
      setLoading(true);
      const { data } = await axios.post("http://localhost:5000/api/payment/create-order", { 
          eventId: id,
          amount: finalAmount,
          seats: bookingDetails.selectedSeats, // ✅ Use details from state
          userId: user.id 
      });
      
      if (!data.success) throw new Error("Order creation failed");

      const options = {
        key: data.key_id, 
        amount: data.amount,
        currency: "INR",
        name: "BookMyConcert",
        description: `Event: ${bookingDetails.eventDetails?.title || id}`,
        order_id: data.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post("http://localhost:5000/api/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: { 
                  eventId: id,
                  userId: user.id,
                  seats: bookingDetails.selectedSeats,
                  totalAmount: finalAmount
              }
            });
            if (verifyRes.data.success) {
                // ✅ Cleanup: Clear local storage after success
                localStorage.removeItem("tempBooking");
                navigate(`/view-ticket/${verifyRes.data.bookingId}`);
            }
          } catch (err) { alert("Payment verification failed."); }
        },
        prefill: { 
            name: user.fullName || "User", 
            email: user.primaryEmailAddress?.emailAddress, 
            contact: "" 
        },
        theme: { color: "#db2777" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      setLoading(false);
    } catch (error) {
      console.error("Payment Error:", error);
      setLoading(false);
      alert("Something went wrong.");
    }
  };

  // --- RENDER LOGIC ---

  // 1. Wait for auth to load
  if (!isLoaded) return <div className="p-10 text-center">Loading user data...</div>;

  // 2. If no data found even after trying to restore backup
  if (!bookingDetails) {
      return <div className="p-10 text-center text-red-500">No booking details found. Please select tickets first.</div>;
  }

  // 3. Extract values for render
  const { selectedSeats, totalAmount, eventDetails } = bookingDetails;
  const currentTotal = discountData ? discountData.finalAmount : totalAmount;
  const discount = discountData ? discountData.discountAmount : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen flex gap-6">
      
      {/* LEFT: Ticket Summary */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
        <h3 className="text-lg font-semibold">{eventDetails?.title || "Concert Ticket"}</h3>
        
        <div className="mt-4 border-t pt-4">
            <div className="flex justify-between my-2">
                <span>Seats</span>
                <span className="font-medium">{Array.isArray(selectedSeats) ? selectedSeats.join(", ") : selectedSeats}</span>
            </div>
            <div className="flex justify-between my-2">
                <span>Quantity</span>
                <span>{selectedSeats.length}</span>
            </div>
        </div>

        {/* Coupon Section */}
        <div className="mt-6 p-3 bg-gray-100 rounded border border-dashed border-gray-300">
            <div className="flex gap-2">
                <Tag className="w-5 h-5 text-gray-500 mt-2" />
                <input 
                    type="text" 
                    placeholder="Coupon Code"
                    className="flex-1 bg-transparent outline-none uppercase font-bold text-gray-700"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <button onClick={handleApplyCoupon} className="text-pink-600 font-bold text-sm">APPLY</button>
            </div>
            {discount > 0 && <p className="text-green-600 text-xs mt-1 font-bold">Saved ₹{discount}</p>}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">₹{currentTotal}</span>
        </div>
      </div>

      {/* RIGHT: Auth & Payment Action */}
      <div className="w-80 bg-white p-6 rounded-lg shadow-md h-fit">
        {isSignedIn ? (
            // ✅ LOGGED IN STATE
            <div>
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm font-medium">
                    Logged in as {user.firstName}
                </div>
                <button 
                  onClick={handlePayment}
                  disabled={loading}
                  className="w-full bg-pink-600 text-white py-3 rounded-lg font-bold hover:bg-pink-700 transition"
                >
                  {loading ? "Processing..." : "Proceed to Pay"}
                </button>
            </div>
        ) : (
            // ❌ GUEST STATE (Shows Login Button)
            <div>
                <p className="text-gray-600 text-sm mb-4">
                    To complete your purchase and receive the ticket via email, please login.
                </p>
                <button 
                  onClick={() => openSignIn({
                    redirectUrl: window.location.href // Force return to this page
                  })}
                  className="w-full border-2 border-pink-600 text-pink-600 py-3 rounded-lg font-bold hover:bg-pink-50 transition"
                >
                  Login to Proceed
                </button>
            </div>
        )}
      </div>

    </div>
  );
};

export default PaymentPage;