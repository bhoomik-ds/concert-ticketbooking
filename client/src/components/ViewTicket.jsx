import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Ticket, User, MapPin } from 'lucide-react';

const ViewTicket = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // Make sure this URL matches your actual backend URL
    axios.get(`https://concert-api-77il.onrender.com/api/ticketbooking/${id}`)
      .then(res => setBooking(res.data))
      .catch(err => console.error(err));
  }, [id]);

  if (!booking) return <div className="p-10 text-center">Loading Ticket...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        
        {/* Success Header */}
        <div className="bg-green-600 p-6 text-center text-white">
          <CheckCircle className="w-16 h-16 mx-auto mb-2" />
          <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
          <p className="opacity-90">Your ticket ID: <span className="font-mono font-bold">{booking._id.slice(-6).toUpperCase()}</span></p>
        </div>

        {/* Main Content */}
        <div className="p-6">
          
          {/* 1. Guest Details Section */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <User size={14} /> Guest Information
            </h4>
            <div className="grid grid-cols-2 gap-y-3">
                <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-bold text-gray-900 text-sm">{booking.guestName}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Mobile</p>
                    <p className="font-bold text-gray-900 text-sm">{booking.mobile}</p>
                </div>
                <div className="col-span-2">
                    <p className="text-xs text-gray-500">City</p>
                    <p className="font-bold text-gray-900 text-sm flex items-center gap-1">
                        <MapPin size={12} className="text-gray-400" /> {booking.city}
                    </p>
                </div>
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-4 relative">
             <div className="absolute -left-8 -top-3 w-6 h-6 bg-gray-100 rounded-full"></div>
             <div className="absolute -right-8 -top-3 w-6 h-6 bg-gray-100 rounded-full"></div>
          </div>

          {/* 2. Ticket & Seat Details */}
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Ticket size={14} /> Ticket Details
            </h4>
            
            <div className="space-y-3">
              {booking.tickets.map((t, index) => (
                <div key={index} className="bg-pink-50 border border-pink-100 p-3 rounded-lg">
                   
                   {/* Ticket Type Header */}
                   <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-pink-700">{t.ticketType}</span>
                      <span className="text-xs font-bold bg-white text-pink-600 px-2 py-1 rounded shadow-sm border border-pink-100">
                         x{t.quantity}
                      </span>
                   </div>

                   {/* Specific Seat IDs */}
                   {t.seatNumbers && t.seatNumbers.length > 0 ? (
                       <div className="mt-2">
                           <p className="text-[10px] text-pink-400 uppercase font-bold mb-1">Seat Numbers</p>
                           <div className="flex flex-wrap gap-1">
                               {t.seatNumbers.map((seat, i) => (
                                   <span key={i} className="font-mono text-xs font-bold text-gray-700 bg-white border border-pink-200 px-2 py-1 rounded">
                                       {/* ✅ FIXED: Replaces Hyphen with Colon (e.g. VIP : 1) */}
                                       {seat.replace(/-(\d+)$/, ' : $1')}
                                   </span>
                               ))}
                           </div>
                       </div>
                   ) : (
                       <p className="text-xs text-gray-500 italic">General Admission (No specific seat)</p>
                   )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center">
          <Link to="/" className="text-pink-600 font-bold hover:text-pink-700 text-sm">
             &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewTicket;