import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Tag, User, Phone, MapPin } from 'lucide-react'; 
import { useUser, useClerk } from "@clerk/clerk-react";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  
  const { isSignedIn, user, isLoaded } = useUser();
  const { openSignIn } = useClerk();

  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discountData, setDiscountData] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

  // ✅ NEW: User Details Form State
  const [userDetails, setUserDetails] = useState({
    fullName: "",
    mobile: "",
    city: ""
  });
  const [isDetailsSaved, setIsDetailsSaved] = useState(false); // Controls if form is locked

  // 1. Load Booking Data
  useEffect(() => {
    const savedData = localStorage.getItem("pendingBooking");
    if (state) {
      setBookingDetails(state);
    } else if (savedData) {
      setBookingDetails(JSON.parse(savedData));
    }
  }, [state]);

  // 2. Prefill Name from Clerk Login
  useEffect(() => {
    if (user) {
      setUserDetails(prev => ({
        ...prev,
        fullName: user.fullName || prev.fullName
      }));
    }
  }, [user]);

  // ✅ Handle User Input
  const handleInputChange = (e) => {
    setUserDetails({ ...userDetails, [e.target.name]: e.target.value });
  };

  // ✅ SAVE USER DETAILS TO DB
  const handleSaveDetails = async () => {
    if (!userDetails.fullName || !userDetails.mobile || !userDetails.city) {
      return alert("Please fill in all details (Name, Mobile, City)");
    }

    try {
      setLoading(true);
      // Call our new Backend Route
      await axios.post("https://concert-api-77il.onrender.com/api/user/update", {
        clerkId: user.id,
        fullName: userDetails.fullName,
        phoneNumber: userDetails.mobile,
        city: userDetails.city
      });
      
      setIsDetailsSaved(true); // ✅ Unlock Payment Button
      setLoading(false);
      alert("Details Saved! Proceeding to payment...");
    } catch (error) {
      console.error(error);
      alert("Failed to save details. Try again.");
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!isSignedIn) {
        openSignIn({ redirectUrl: window.location.href });
        return;
    }
    
    // ✅ Check if details are saved
    if (!isDetailsSaved) {
        return alert("Please Confirm your Details first!");
    }

    const loadRazorpayScript = () => { /* ... same as before ... */
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const res = await loadRazorpayScript();
    if (!res) return alert("Razorpay SDK failed.");

    const finalAmount = discountData ? discountData.finalAmount : bookingDetails.totalAmount;

    // ✅ PARSE SEATS: Convert "Gold (x2)" -> { type: "Gold", qty: 2 }
    const parsedSeats = bookingDetails.selectedSeats.map(seatStr => {
        const match = seatStr.match(/(.+) \(x(\d+)\)/);
        if (match) {
            return { ticketType: match[1], quantity: parseInt(match[2]) };
        }
        return { ticketType: seatStr, quantity: 1 };
    });

    try {
      setLoading(true);
      const { data } = await axios.post("https://concert-api-77il.onrender.com/api/payment/create-order", { 
          eventId: id,
          amount: finalAmount,
          seats: parsedSeats, // Send parsed structure
          userId: user.id 
      });
      
      if (!data.success) throw new Error("Order creation failed");

      const options = {
        key: data.key_id, 
        amount: data.amount,
        currency: "INR",
        name: "BookMyConcert",
        description: `Booking for ${userDetails.fullName}`,
        order_id: data.order_id,
        handler: async function (response) {
          try {
            const verifyRes = await axios.post("https://concert-api-77il.onrender.com/api/payment/verify", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: { 
                  eventId: id,
                  userId: user.id,
                  seats: parsedSeats,
                  totalAmount: finalAmount
              }
            });
            if (verifyRes.data.success) {
                localStorage.removeItem("pendingBooking"); 
                navigate(`/view-ticket/${verifyRes.data.bookingId}`);
            }
          } catch (err) { alert("Payment verification failed."); }
        },
        prefill: { 
            name: userDetails.fullName, // Use Form Name
            email: user.primaryEmailAddress?.emailAddress, 
            contact: userDetails.mobile // Use Form Mobile
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

  if (!isLoaded) return <div className="p-10 text-center">Loading...</div>;
  if (!bookingDetails) return <div className="p-10 text-center">No Booking Found</div>;

  const { selectedSeats, totalAmount, eventDetails } = bookingDetails;
  const currentTotal = discountData ? discountData.finalAmount : totalAmount;
  const discount = discountData ? discountData.discountAmount : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen flex flex-col md:flex-row gap-6">
      
      {/* LEFT: Summary */}
      <div className="flex-1 bg-white p-6 rounded-lg shadow-md h-fit">
        <h2 className="text-xl font-bold mb-4">Booking Summary</h2>
        <h3 className="text-lg font-semibold">{eventDetails?.title}</h3>
        <div className="mt-4 border-t pt-4">
            <div className="flex justify-between my-2">
                <span>Seats</span>
                <span className="font-medium">{Array.isArray(selectedSeats) ? selectedSeats.join(", ") : selectedSeats}</span>
            </div>
            <div className="flex justify-between my-2">
                <span>Total Quantity</span>
                <span>{selectedSeats.length}</span>
            </div>
        </div>
        
        {/* Coupon */}
        <div className="mt-6 p-3 bg-gray-100 rounded border border-dashed border-gray-300">
             <div className="flex gap-2">
                <Tag className="w-5 h-5 text-gray-500 mt-2" />
                <input type="text" placeholder="Coupon Code" className="flex-1 bg-transparent outline-none uppercase font-bold text-gray-700"
                    value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
                <button onClick={handleApplyCoupon} className="text-pink-600 font-bold text-sm">APPLY</button>
            </div>
            {discount > 0 && <p className="text-green-600 text-xs mt-1 font-bold">Saved ₹{discount}</p>}
        </div>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <span className="text-gray-600">Total Amount</span>
            <span className="text-2xl font-bold text-gray-900">₹{currentTotal}</span>
        </div>
      </div>

      {/* RIGHT: User Details & Payment */}
      <div className="w-full md:w-80 bg-white p-6 rounded-lg shadow-md h-fit">
        {isSignedIn ? (
            <div>
                <div className="mb-4 p-3 bg-green-50 text-green-700 rounded text-sm font-medium">
                    Logged in as {user.firstName}
                </div>

                {/* ✅ USER DETAILS FORM */}
                {!isDetailsSaved ? (
                    <div className="space-y-3 mb-4">
                        <p className="text-sm font-bold text-gray-700">Enter Details to Proceed:</p>
                        
                        <div className="flex items-center border rounded px-2 py-2 bg-gray-50">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <input name="fullName" value={userDetails.fullName} onChange={handleInputChange} 
                                placeholder="Full Name" className="w-full bg-transparent outline-none text-sm" />
                        </div>

                        <div className="flex items-center border rounded px-2 py-2 bg-gray-50">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <input name="mobile" value={userDetails.mobile} onChange={handleInputChange} 
                                placeholder="Mobile Number" className="w-full bg-transparent outline-none text-sm" />
                        </div>

                        <div className="flex items-center border rounded px-2 py-2 bg-gray-50">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <input name="city" value={userDetails.city} onChange={handleInputChange} 
                                placeholder="City" className="w-full bg-transparent outline-none text-sm" />
                        </div>

                        <button onClick={handleSaveDetails} disabled={loading} className="w-full bg-gray-800 text-white py-2 rounded font-bold hover:bg-black text-sm">
                            {loading ? "Saving..." : "Confirm Details"}
                        </button>
                    </div>
                ) : (
                    <div className="mb-4 text-center">
                        <p className="text-green-600 font-bold text-sm">✅ Details Confirmed!</p>
                        <p className="text-xs text-gray-500">{userDetails.fullName} | {userDetails.city}</p>
                    </div>
                )}

                <button 
                  onClick={handlePayment} 
                  disabled={loading || !isDetailsSaved} // 🔒 Locked until saved
                  className={`w-full py-3 rounded-lg font-bold transition ${isDetailsSaved ? "bg-pink-600 text-white hover:bg-pink-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                >
                  {loading ? "Processing..." : `Proceed to Pay ₹${currentTotal}`}
                </button>
            </div>
        ) : (
            <div>
                <p className="text-gray-600 text-sm mb-4">To complete your purchase, please login.</p>
                <button onClick={() => openSignIn({ redirectUrl: window.location.href })} className="w-full border-2 border-pink-600 text-pink-600 py-3 rounded-lg font-bold hover:bg-pink-50 transition">
                  Login to Proceed
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;