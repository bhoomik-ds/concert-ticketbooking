import React, { useState } from 'react';
import { Menu, X, Search, MapPin, Ticket, Gift } from 'lucide-react'; // Added Gift Icon
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Helper to close menu when a link is clicked
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* --- LOGO --- */}
          <div className="flex items-center space-x-8">
             <div className="flex-shrink-0 cursor-pointer">
              <Link to="/" className="text-2xl font-extrabold tracking-tight">
                <span className="text-pink-500">Book</span>
                <span className="text-gray-900">MY</span>
                <span className="text-pink-500">Concert</span>
              </Link>
            </div>

            {/* --- DESKTOP SEARCH --- */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-md px-4 border border-gray-300 py-2 w-96">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Book your tickets now"
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </div>

          {/* --- DESKTOP NAVIGATION --- */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/TicketBooking" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              Book Tickets
            </Link>
            <Link to="/TicketBooking" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              Gift Cards
            </Link>
            
            <Link to="/" className="flex items-center text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              <MapPin className="w-4 h-4 mr-1" />
              Junagadh
            </Link>

            {/* --- CLERK AUTH LOGIC (Desktop) --- */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-700 transition">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <Link to="/my-tickets" className="flex items-center text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
                <Ticket className="w-4 h-4 mr-1" />
                My Tickets
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </nav>

          {/* --- MOBILE TOP BAR ACTIONS --- */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="w-6 h-6 text-gray-700" />
            </button>

            {/* Mobile User Profile (Visible in top bar for quick access) */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-700">
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* --- MOBILE SEARCH BAR (Toggle) --- */}
        {searchOpen && (
          <div className="md:hidden pb-3 border-t border-gray-100 pt-3">
            <div className="flex items-center bg-gray-50 rounded-md px-4 py-2 border border-gray-300 mx-1">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search events..."
                className="bg-transparent outline-none text-sm w-full"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* --- MOBILE MENU DRAWER --- */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full left-0 z-40">
          <nav className="flex flex-col px-4 py-4 space-y-4">
            
            {/* Location Selector (Mobile) */}
            <div className="flex items-center text-gray-700 pb-2 border-b border-gray-100">
               <MapPin className="w-5 h-5 mr-3 text-pink-500" />
               <span className="font-medium">Junagadh</span>
            </div>

            {/* Navigation Links */}
            <Link 
              to="/TicketBooking" 
              onClick={closeMenu}
              className="flex items-center text-base text-gray-700 hover:text-pink-600 hover:bg-gray-50 p-2 rounded-lg transition-colors" 
            >
              <Ticket className="w-5 h-5 mr-3" />
              Book Tickets
            </Link>

            <Link 
              to="/TicketBooking" 
              onClick={closeMenu}
              className="flex items-center text-base text-gray-700 hover:text-pink-600 hover:bg-gray-50 p-2 rounded-lg transition-colors" 
            >
              <Gift className="w-5 h-5 mr-3" />
              Gift Cards
            </Link>
            
            {/* Auth Based Links */}
            <SignedIn>
              <Link 
                to="/my-tickets" 
                onClick={closeMenu}
                className="flex items-center text-base text-gray-700 hover:text-pink-600 hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                <Ticket className="w-5 h-5 mr-3 text-pink-600" />
                <span className="font-medium text-pink-600">My Tickets</span>
              </Link>
            </SignedIn>

            <SignedOut>
              <div className="pt-2">
                <SignInButton mode="modal">
                  <button className="w-full bg-pink-600 text-white px-4 py-3 rounded-lg text-base font-semibold shadow-md hover:bg-pink-700 transition">
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </SignedOut>

          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;