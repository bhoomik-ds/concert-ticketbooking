import React from "react";

const EventHeader = ({ title, venue, datetime }) => {
  return (
    <div className="text-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-700">{venue}</p>
      <p className="text-gray-500">{datetime}</p>
    </div>
  );
};

export default EventHeader;
