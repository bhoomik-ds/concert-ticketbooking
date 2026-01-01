import React, { useState, useEffect } from "react";
import { Star, Heart, Share2, Calendar, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EventInfo = () => {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch Data from Backend
  useEffect(() => {
    const fetchEventInfo = async () => {
      try {
        const response = await axios.get("https://raghavevents.in/api/events");
        // Assuming we are showing the first event
        setEventData(response.data[0]); 
        setLoading(false);
      } catch (error) {
        console.error("Error loading event info:", error);
        setLoading(false);
      }
    };
    fetchEventInfo();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading Event Details...</div>;
  }

  if (!eventData) {
    return <div className="text-center py-20 text-red-500">Event data not found.</div>;
  }

  // Helper to format date nicely
  const formattedDate = new Date(eventData.date).toDateString();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2">
            
            {/* Title + Stats */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {eventData.title}
              </h1>

              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="font-semibold">{eventData.rating}/5</span>
                  <span className="ml-1">({eventData.votes} Votes)</span>
                </div>
                <span>•</span>
                <span>{eventData.category}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {eventData.tags?.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-pink-50 text-pink-700 rounded-full text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md border transition ${
                    liked ? "bg-pink-50 border-pink-600 text-pink-600" : "border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${liked ? "fill-pink-600" : ""}`} />
                  <span className="text-sm font-medium">{liked ? "Liked" : "Interested"}</span>
                </button>

                <button className="flex items-center space-x-2 px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:border-gray-400 transition">
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Share</span>
                </button>

                <div className="hidden md:block text-sm text-gray-600">
                  {eventData.interested} Interested
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Event</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{eventData.about}</p>

              <h3 className="text-lg font-semibold text-gray-900 mb-3">Highlights</h3>
              <ul className="space-y-2">
                {eventData.highlights?.map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-pink-600 mr-2">•</span>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Icons Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-pink-600 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Date</div>
                  <div className="text-gray-600">{formattedDate}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-pink-600 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Time</div>
                  <div className="text-gray-600">{eventData.time}</div>
                  <div className="text-sm text-gray-500">Duration: {eventData.duration}</div>
                </div>
              </div>

              <div className="flex items-start space-x-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-pink-600 mt-1" />
                <div>
                  <div className="font-semibold text-gray-900">Venue</div>
                  <div className="text-gray-600">{eventData.venue?.name}</div>
                  <div className="text-sm text-gray-500">{eventData.venue?.address}</div>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {eventData.galleryImages?.map((image, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden cursor-pointer group">
                    <img
                      src={image}
                      alt={`Event ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
                <div className="mb-4">
                  {eventData.originalPrice && (
                     <div className="text-sm text-gray-500 line-through">{eventData.originalPrice}</div>
                  )}
                  <div className="text-3xl font-bold text-gray-900">{eventData.priceRange}</div>
                  <div className="text-sm text-green-600 font-medium">onwards</div>
                </div>

                <button 
                  onClick={() => navigate("/TicketBooking")} 
                  className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition mb-3 shadow-md"
                >
                  Book Now
                </button>

                <div className="text-center text-xs text-gray-500">Limited seats available</div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Event Details</div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language</span>
                      <span className="text-gray-900">English, Hindi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age Limit</span>
                      <span className="text-gray-900">18+</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category</span>
                      <span className="text-gray-900">{eventData.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventInfo;