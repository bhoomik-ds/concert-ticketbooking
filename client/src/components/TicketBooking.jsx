import React from 'react';
import EventInfo from './EventInfo';
import Layout from './Layout';
import EventHeader from './EventHeader';
import TicketPage from './TicketPage';
import StepIndicator from './StepIndicator';

const TicketBooking = () => {
  return (
    <div>
      <Layout />
      {/* Step 1 is active. User is NOT blocked here. */}
      <StepIndicator step={1} /> 
      <EventHeader />
      <TicketPage />
    </div>
  );
};

export default TicketBooking;