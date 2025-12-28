import React, { useEffect, useState } from 'react';
import { useUser } from "@clerk/clerk-react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Ticket, Calendar, MapPin, ExternalLink } from 'lucide-react';

const MyTickets = () => {
  const { user, isSignedIn } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Define API URL
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    if (isSignedIn && user) {
      const fetchBookings = async () => {
        try {
          const response = await axios.get(`${API_URL}/api/my-bookings/${user.id}`);
          setBookings(response.data);
        } catch (error) {
          console.error("Error fetching bookings:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchBookings();
    }
  }, [isSignedIn, user]);

  if (!isSignedIn) return <div className="p-10 text-center">Please Sign In to view your tickets.</div>;
  if (loading) return <div className="p-10 text-center">Loading your tickets...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <Ticket className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600">No tickets found</h2>
          <p className="text-gray-500 mb-6">You haven't booked any concerts yet.</p>
          <Link to="/TicketBooking" className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700">
            Book Now
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="bg-white border rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(booking.bookingDate).toDateString()}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Grand Live Concert</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>Junagadh, Gujarat</span>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                    booking.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.paymentStatus}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex gap-4">
                      {booking.tickets.map((t, idx) => (
                        <div key={idx} className="bg-gray-50 px-3 py-1 rounded text-sm text-gray-700">
                          {t.quantity}x {t.ticketType}
                        </div>
                      ))}
                    </div>
                    
                    <Link to={`/view-ticket/${booking._id}`} className="flex items-center text-pink-600 font-semibold hover:underline">
                      View Ticket <ExternalLink className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTickets;