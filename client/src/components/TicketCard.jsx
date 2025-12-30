import React from "react";
import Button from "./Button";

const TicketCard = ({ id, name, price, count, available, onAdd, onRemove }) => {
  
  // 1. Calculate Status
  const isSoldOut = available === 0;
  const isLowStock = !isSoldOut && available < 50; 
  const isMaxReached = count >= available; 

  return (
    <div 
      className={`border border-gray-200 rounded-lg p-4 mb-4 shadow-sm bg-white flex flex-col sm:flex-row justify-between items-center transition ${isSoldOut ? "opacity-60 grayscale bg-gray-50" : ""}`}
    >
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
        
        <div className="flex items-center gap-2">
            <p className="text-gray-800 font-medium">{price}</p>
            
            {/* Red Warning Badge (Only shows if < 50 left) */}
            {isLowStock && (
                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100 animate-pulse">
                   Only {available} Left!
                </span>
            )}
             {isSoldOut && (
                <span className="text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded">
                   SOLD OUT
                </span>
            )}
        </div>

        {/* ✅ UPDATE: Removed "Know more" link. Added Available Seat Count */}
        {!isSoldOut && (
            <p className="text-xs text-gray-500 mt-1 font-medium">
                Available Tickets: <span className="text-gray-900 font-bold">{available}</span>
            </p>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 sm:mt-0">
        <Button
          onClick={() => onRemove && onRemove(id)}
          disabled={count === 0}
          className={`border border-pink-500 text-pink-600 bg-white hover:bg-pink-50 px-3 py-1 ${
            count === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          −
        </Button>

        <span className="text-gray-900 font-medium min-w-[2rem] text-center">
          {count || 0}
        </span>

        <Button
          onClick={() => onAdd(id)}
          // 🔒 LOCK BUTTON if Sold Out OR Max Reached
          disabled={isSoldOut || isMaxReached}
          className={`border border-pink-500 text-pink-600 bg-white hover:bg-pink-50 px-3 py-1 ${
            isSoldOut || isMaxReached ? "opacity-50 cursor-not-allowed bg-gray-100 border-gray-300 text-gray-400" : ""
          }`}
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default TicketCard;