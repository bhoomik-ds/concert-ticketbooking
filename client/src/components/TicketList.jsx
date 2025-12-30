import React from "react";
import TicketCard from "./TicketCard";

const TicketList = ({ tickets, selectedTickets, onAdd, onRemove }) => {
  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          id={ticket.id}
          name={ticket.name}
          price={ticket.price}
          
          // 👇 NEW: Pass the available count so the card can show it
          available={ticket.available} 
          
          count={selectedTickets[ticket.id] || 0}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default TicketList;