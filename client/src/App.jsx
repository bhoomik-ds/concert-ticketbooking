import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useUser } from "@clerk/clerk-react"; 
import axios from "axios"; 

/* Common Layout Components */
import Header from "./components/Header";
import Footer from "./components/Footer";
import Banner from "./components/Banner";
import EventInfo from "./components/EventInfo";

/* Import Pages */
import TicketPage from "./components/TicketPage"; 
import PaymentPage from "./components/PaymentPage";
import ViewTicket from "./components/ViewTicket"; 
import MyTickets from "./components/MyTickets"; // <--- NEW IMPORT

function App() {
  const { user, isSignedIn } = useUser();

  // Automatically save user to Database when they sign in
  useEffect(() => {
    // Define API URL
    const API_URL = import.meta.env.VITE_API_URL || "https://concert-api-77il.onrender.com";

    if (isSignedIn && user) {
      const saveUserToDB = async () => {
        try {
            await axios.post(`${API_URL}/api/save-user`, {
            clerkId: user.id,
            name: user.fullName,
            email: user.primaryEmailAddress?.emailAddress,
          });
          console.log("User synced with database!");
        } catch (error) {
          console.error("Error syncing user to DB:", error);
        }
      };
      
      saveUserToDB();
    }
  }, [isSignedIn, user]);
  return (
    <Router>
      <Header />
      <Routes>
        {/* Home Page */}
        <Route
          path="/"
          element={
            <>
              <Banner />
              <EventInfo />
            </>
          }
        />

        {/* Booking & Payment Pages */}
        <Route path="/TicketBooking" element={<TicketPage />} />
        <Route path="/payment/:id" element={<PaymentPage />} />
        <Route path="/view-ticket/:id" element={<ViewTicket />} />
        
        {/* NEW: My Tickets Page */}
        <Route path="/my-tickets" element={<MyTickets />} /> 

        {/* Helper routes */}
        <Route path="/PlatinumSeating" element={<TicketPage />} />
        <Route path="/GeneralStanding" element={<TicketPage />} />
        <Route path="/FanPitStanding" element={<TicketPage />} />

      </Routes>
      <Footer />
    </Router>
  );
}

export default App;