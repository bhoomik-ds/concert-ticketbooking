import React from "react";

const StepIndicator = () => {
  return (
    <div className="flex items-center justify-center gap-2 mb-4 text-sm">
      <span className="text-gray-600"></span>
      <span className="text-gray-400"></span>
      <span className="font-semibold text-pink-600">Ticket</span>
      <span className="text-gray-400">/</span>
      <span className="text-gray-600"> Proceed to Pay</span>
    </div>
  );
};

export default StepIndicator;
