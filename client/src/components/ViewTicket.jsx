import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { QrCode, CheckCircle, Ticket } from 'lucide-react';

const ViewTicket = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
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
          <p className="opacity-90">Your ticket has been sent to your email.</p>
        </div>

        {/* Ticket Details */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
             <div>
               <p className="text-gray-500 text-sm">Event</p>
               <h3 className="font-bold text-xl">Grand Live Concert</h3>
             </div>
             <div className="text-right">
                <p className="text-gray-500 text-sm">Date</p>
                <p className="font-semibold">Jan 17, 2026</p>
             </div>
          </div>

          <div className="border-t border-dashed border-gray-300 my-4"></div>

          {/* Ticket List */}
          <div className="space-y-3">
             {booking.tickets.map((t, index) => (
               <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div className="flex items-center gap-3">
                    <Ticket className="text-pink-600 w-5 h-5" />
                    <span className="font-medium">{t.ticketType}</span>
                  </div>
                  <span className="font-bold">x{t.quantity}</span>
               </div>
             ))}
          </div>

          <div className="border-t border-dashed border-gray-300 my-4"></div>

          {/* QR Code Section */}
          <div className="text-center">
            <p className="text-xs text-gray-400 mb-2">Scan at the entrance</p>
            <div className="bg-white p-2 inline-block border rounded-lg">
               <QrCode className="w-32 h-32 text-gray-800" />
            </div>
            <p className="mt-2 text-sm font-mono text-gray-500">{booking._id}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center">
          <Link to="/" className="text-pink-600 font-semibold hover:underline">
             Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ViewTicket;