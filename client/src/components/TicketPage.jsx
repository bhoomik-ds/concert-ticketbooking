import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Layout from "./Layout";
import StepIndicator from "./StepIndicator";
import EventHeader from "./EventHeader";
import TicketList from "./TicketList";
import Button from "./Button";
import Banner from "./Banner"; 

const TicketPage = () => {
  const navigate = useNavigate();
  const { user, isSignedIn } = useUser();

  const [tickets, setTickets] = useState([]);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [eventDetails, setEventDetails] = useState({
    title: "Loading Event...",
    venue: "",
    date: "",
    bannerImage: "" 
  });
  const API_URL = "https://concert-api-77il.onrender.com";

  // 1. Fetch Data from Backend
  useEffect(() => {
    const API_URL = "https://concert-api-77il.onrender.com";

    const fetchTickets = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/events`);
        const eventData = response.data[0];

        if (eventData) {
          setEventDetails({
            title: eventData.title,
            venue: `${eventData.venue.name}, ${eventData.venue.city}`,
            date: new Date(eventData.date).toDateString(),
            bannerImage: eventData.bannerImage 
          });

          if (eventData.ticketTypes) {
            const formattedTickets = eventData.ticketTypes.map((t) => ({
              id: t._id,              
              name: t.name,
              price: `₹${t.price}`,   
              rawPrice: t.price       
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

  // 2. Handle Add Ticket
  const handleAdd = (id) => {
    const totalCount = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);
    if (totalCount >= 10) return; 

    setSelectedTickets((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  // 3. Handle Remove Ticket
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

  // 4. Calculate Totals
  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  const totalPrice = Object.entries(selectedTickets).reduce((sum, [id, qty]) => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return sum;
    return sum + (ticket.rawPrice * qty);
  }, 0);

  // 5. Handle Proceed
  const handleProceed = async () => {
    console.log("Button Clicked!"); // Debugging Log

    if (!isSignedIn) {
      alert("Please Sign In to book tickets!");
      return;
    }

    if (totalTickets === 0) {
      alert("Please select at least one ticket.");
      return;
    }

    const bookingPayload = {
      userId: user.id,
      userEmail: user.primaryEmailAddress?.emailAddress,
      totalTickets,
      totalAmount: totalPrice,
      tickets: Object.entries(selectedTickets).map(([id, qty]) => {
        const ticketInfo = tickets.find((t) => t.id === id);
        return {
          ticketType: ticketInfo.name,
          price: ticketInfo.rawPrice,
          quantity: qty,
          subtotal: ticketInfo.rawPrice * qty
        };
      })
    };

    try {
      console.log("Sending Request to Backend...");
      // This 'await' works now because 'async' is added above
      const response = await axios.post(`${API_URL}/api/ticketbooking`, bookingPayload);

      console.log("Booking Success:", response.data);
      navigate(`/payment/${response.data._id}`);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Something went wrong with the booking. Please try again.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Event Details...</div>;

  return (
    <Layout>
      <Banner image={eventDetails.bannerImage} title={eventDetails.title} />

      <StepIndicator />
      
      <EventHeader
        title={eventDetails.title}
        venue={eventDetails.venue}
        datetime={eventDetails.date}
      />

      <TicketList
        tickets={tickets}
        selectedTickets={selectedTickets}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />

      <div className="mt-6 text-center space-y-2 pb-10">
        <p className="text-lg font-semibold text-gray-700">
          Total: ₹{totalPrice.toLocaleString()} • {totalTickets} Ticket{totalTickets !== 1 ? "s" : ""}
        </p>

        <Button
          onClick={handleProceed}
          disabled={totalTickets === 0}
          className={`w-full sm:w-auto px-8 py-3 rounded-lg font-bold transition ${
            totalTickets > 0
              ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
              : "bg-gray-400 text-white cursor-not-allowed"
          }`}
        >
          Proceed to Pay
        </Button>
      </div>
    </Layout>
  );
};

export default TicketPage;