import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "./Layout";
import StepIndicator from "./StepIndicator";
import EventHeader from "./EventHeader";
import TicketList from "./TicketList";
import Button from "./Button";
import Banner from "./Banner";

const TicketPage = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [loading, setLoading] = useState(true);

  // Store Event ID so we can put it in the URL
  const [eventDetails, setEventDetails] = useState({
    id: "",
    title: "Loading Event...",
    venue: "",
    date: "",
    bannerImage: ""
  });

  // 1. Fetch Data from Backend
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await axios.get("https://raghavevents.in/api/events");
        const eventData = response.data[0]; 

        if (eventData) {
          setEventDetails({
            id: eventData._id, 
            title: eventData.title,
            venue: `${eventData.venue.name}, ${eventData.venue.city}`,
            date: new Date(eventData.date).toDateString(),
            bannerImage: eventData.bannerImage
          });

          if (eventData.ticketTypes) {
            // ✅ UPDATE: We now extract 'availableSeats' from the backend
            const formattedTickets = eventData.ticketTypes.map((t) => ({
              id: t._id,
              name: t.name,
              price: `₹${t.price}`,
              rawPrice: t.price,
              available: t.availableSeats // <--- CRITICAL NEW FIELD
            }));
            setTickets(formattedTickets);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const handleAdd = (id) => {
    const ticket = tickets.find(t => t.id === id);
    const currentQty = selectedTickets[id] || 0;

    // ✅ CHECK 1: Global Limit per user (Max 10)
    const totalCount = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    if (totalCount >= 10) {
        alert("You can only book a maximum of 10 tickets.");
        return;
    }

    // ✅ CHECK 2: Availability Limit (Prevent overbooking)
    if (ticket && currentQty >= ticket.available) {
        alert(`Sorry! Only ${ticket.available} tickets left for ${ticket.name}.`);
        return;
    }

    setSelectedTickets((prev) => ({ ...prev, [id]: currentQty + 1 }));
  };

  const handleRemove = (id) => {
    setSelectedTickets((prev) => {
      if (!prev[id]) return prev;
      const updated = { ...prev };
      if (updated[id] > 1) {
        updated[id] = updated[id] - 1;
      } else {
        delete updated[id];
      }
      return updated;
    });
  };

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
  const totalPrice = Object.entries(selectedTickets).reduce((sum, [id, qty]) => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return sum;
    return sum + (ticket.rawPrice * qty);
  }, 0);

  // 5. Handle Proceed
  const handleProceed = () => {
    if (totalTickets === 0) {
      alert("Please select at least one ticket.");
      return;
    }

    const seatSummary = Object.entries(selectedTickets).map(([id, qty]) => {
        const ticket = tickets.find(t => t.id === id);
        return `${ticket.name} (x${qty})`; 
    });

    const bookingData = {
        selectedSeats: seatSummary, 
        totalAmount: totalPrice,
        eventDetails: eventDetails
    };
    localStorage.setItem("pendingBooking", JSON.stringify(bookingData));

    navigate(`/payment/${eventDetails.id}`, { state: bookingData });
  };

  if (loading) return <div className="p-10 text-center">Loading Event Details...</div>;

  return (
    <Layout>
      <Banner image={eventDetails.bannerImage} title={eventDetails.title} />
      <StepIndicator step={1} />
      <EventHeader title={eventDetails.title} venue={eventDetails.venue} datetime={eventDetails.date} />
      
      <TicketList tickets={tickets} selectedTickets={selectedTickets} onAdd={handleAdd} onRemove={handleRemove} />

      <div className="mt-6 text-center space-y-2 pb-10">
        <p className="text-lg font-semibold text-gray-700">
          Total: ₹{totalPrice.toLocaleString()} • {totalTickets} Ticket{totalTickets !== 1 ? "s" : ""}
        </p>

        <Button
          onClick={handleProceed}
          disabled={totalTickets === 0}
          className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold transition ${
            totalTickets > 0 ? "bg-green-600 text-white hover:bg-green-700 shadow-md" : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          Proceed to Pay
        </Button>
      </div>
    </Layout>
  );
};

export default TicketPage;