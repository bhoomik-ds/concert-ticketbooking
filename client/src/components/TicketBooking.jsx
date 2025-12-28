import React from 'react';
import EventInfo from './EventInfo';
import Layout from './Layout';
import EventHeader from './EventHeader';
import TicketPage from './TicketPage';
//import TicketList from './TicketList';
import StepIndicator from './StepIndicator';


const TicketBooking = () => {
  return (
    <div>
      <Layout />
      <StepIndicator />
      <EventHeader />
      <TicketPage />
    </div>
  );
};

export default TicketBooking;
