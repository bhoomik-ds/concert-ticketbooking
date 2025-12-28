import React from "react";
import TicketCard from "./TicketCard";

const TicketList = ({ tickets, selectedTickets, onAdd, onRemove }) => {
  return (
    <div>
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          id={ticket.id}
          name={ticket.name}
          price={ticket.price}
          count={selectedTickets[ticket.id] || 0}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default TicketList;
