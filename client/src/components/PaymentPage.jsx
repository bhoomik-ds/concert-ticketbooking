import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Tag } from 'lucide-react'; // Import Tag Icon

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // New States for Discount
  const [couponCode, setCouponCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Define API URL
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    axios.get(`${API_URL}/api/ticketbooking/${id}`)
      .then(res => {
        setBooking(res.data);
        // If booking already has a discount, load it
        if(res.data.discountAmount > 0) {
            setDiscountData({
                discountAmount: res.data.discountAmount,
                finalAmount: res.data.finalAmount
            });
        }
      })
      .catch(err => console.error("Error fetching booking:", err));
  }, [id]);

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

  const loadRazorpayScript = () => { /* ... (Same as before) ... */
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    /* ... (Same as before, Backend handles the correct price now) ... */
    const res = await loadRazorpayScript();
    if (!res) return alert("Razorpay SDK failed to load.");

    try {
      setLoading(true);
      const { data } = await axios.post(`${API_URL}/api/payment/create-order`, { bookingId: id });
      
      if (!data.success) throw new Error("Order creation failed");

      const options = {
        key: data.key_id, 
        amount: data.amount,
        currency: "INR",
        name: "BookMyConcert",
        description: `Booking ID: ${id}`,
        order_id: data.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post(`${API_URL}/api/payment/verify`, {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: id
            });
            if (verifyRes.data.success) navigate(`/view-ticket/${id}`);
          } catch (err) { alert("Payment verification failed."); }
        },
        prefill: { name: "User", email: booking?.userEmail, contact: "9999999999" },
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

  if (!booking) return <div className="p-10 text-center">Loading Invoice...</div>;

  // Calculate Display Values
  const currentTotal = discountData ? discountData.finalAmount : booking.totalAmount;
  const discount = discountData ? discountData.discountAmount : 0;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white min-h-screen">
      <div className="border p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">Invoice</h1>
        
        {/* Items List */}
        {booking.tickets.map((t, i) => (
           <div key={i} className="flex justify-between border-b py-2">
             <span>{t.ticketType} (x{t.quantity})</span>
             <span>₹{t.subtotal}</span>
           </div>
        ))}

        {/* --- COUPON INPUT SECTION --- */}
        <div className="mt-6 p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Have a Gift Card?"
                        className="w-full pl-9 pr-4 py-2 border rounded focus:outline-pink-500 uppercase font-medium"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    />
                </div>
                <button 
                    onClick={handleApplyCoupon}
                    className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black transition"
                >
                    Apply
                </button>
            </div>
            {discount > 0 && <p className="text-green-600 text-sm mt-2 font-bold">🎉 Coupon Applied! You saved ₹{discount}</p>}
        </div>

        {/* Price Breakdown */}
        <div className="mt-6 space-y-2 text-right">
             <div className="text-gray-500">Subtotal: ₹{booking.totalAmount}</div>
             {discount > 0 && <div className="text-green-600">Discount: -₹{discount}</div>}
             <div className="text-2xl font-bold text-pink-600 border-t pt-2">
                 Total: ₹{currentTotal}
             </div>
        </div>

        <button 
          onClick={handlePayment}
          disabled={loading}
          className="w-full mt-8 bg-pink-600 text-white py-3 rounded-lg font-bold hover:bg-pink-700 transition"
        >
          {loading ? "Processing..." : `Pay ₹${currentTotal}`}
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;