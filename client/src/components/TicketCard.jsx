import React from "react";
import Button from "./Button";

const TicketCard = ({ id, name, price, count, onAdd, onRemove }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4 shadow-sm bg-white flex flex-col sm:flex-row justify-between items-center">
      <div className="text-left">
        <h2 className="text-lg font-semibold text-gray-900">{name}</h2>
        <p className="text-gray-800 font-medium">{price}</p>
        <a href="#" className="text-pink-600 text-sm hover:underline">
          Know more
        </a>
      </div>

      <div className="flex items-center gap-3 mt-3 sm:mt-0">
        <Button
          onClick={() => onRemove && onRemove(id)}
          disabled={count === 0}
          className={`border border-pink-500 text-pink-600 bg-white hover:bg-pink-50 ${
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
          className="border border-pink-500 text-pink-600 bg-white hover:bg-pink-50"
        >
          +
        </Button>
      </div>
    </div>
  );
};

export default TicketCard;
