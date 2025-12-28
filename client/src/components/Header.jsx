import React, { useState } from 'react';
import { Menu, X, Search, MapPin, Ticket } from 'lucide-react'; // Added Ticket Icon
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-8">
             <div className="flex-shrink-0 cursor-pointer">
              <Link to="/" className="text-2xl font-extrabold tracking-tight">
                <span className="text-pink-500">Book</span>
                <span className="text-gray-900">MY</span>
                <span className="text-pink-500">Concert</span>
              </Link>
            </div>

            {/* Desktop Search */}
            <div className="hidden md:flex items-center bg-gray-50 rounded-md px-4 border border-gray-300 py-2 w-96">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Book your tickets now"
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/TicketBooking" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              Book Tickets
            </Link>
            <Link to="/TicketBooking" className="text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              Gift Cards
            </Link>
            
            <Link to="/" className=" flex text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
              <MapPin className="w-4 h-4 mr-1" />
              Junagadh
            </Link>
            {/* --- CLERK LOGIN LOGIC --- */}
            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-700 transition">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              {/* NEW: My Tickets Button (Only visible when logged in) */}
              <Link to="/my-tickets" className="flex items-center text-sm font-medium text-gray-700 hover:text-pink-600 transition-colors">
                <Ticket className="w-4 h-4 mr-1" />
                My Tickets
              </Link>
              
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            {/* ------------------------- */}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-3">
            <button onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="w-6 h-6 text-gray-700" />
            </button>

            {/* Mobile User Profile */}
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <div className="flex items-center bg-gray-50 rounded-md px-4 py-2">
              <Search className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="flex flex-col space-y-4 px-4 py-4">
            <Link to="/TicketBooking" className="text-sm text-gray-700 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>
              Book Tickets
            </Link>
            
            <SignedIn>
              <Link to="/my-tickets" className="text-sm text-gray-700 hover:text-gray-900" onClick={() => setMobileMenuOpen(false)}>
                My Tickets
              </Link>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm w-full text-center">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;