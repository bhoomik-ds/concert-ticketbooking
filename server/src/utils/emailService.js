const nodemailer = require('nodemailer');

// 1. Configure Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use 'host' and 'port' for other providers
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Main Send Function
const sendTicketEmail = async (booking, event, recipientEmail) => {
  try {
    // Format Date
    const eventDate = new Date(event.date).toDateString();
    
    // Create Ticket List HTML (Seat Numbers & Types)
    const ticketListHtml = booking.tickets.map(t => `
      <div style="background: #fdf2f8; padding: 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #fbcfe8;">
        <strong style="color: #be185d; font-size: 16px;">${t.ticketType}</strong> 
        <span style="background: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; border: 1px solid #ddd; margin-left: 10px;">x${t.quantity}</span>
        <br/>
        <div style="margin-top: 5px; color: #4b5563; font-size: 14px;">
           <span style="font-weight:bold;">Seats:</span> ${t.seatNumbers.join(', ')}
        </div>
      </div>
    `).join('');

    // 3. Email Template
    const mailOptions = {
      from: `"BookMyConcert" <${process.env.EMAIL_USER}>`,
      to: recipientEmail, 
      subject: `🎟 Booking Confirmed: ${event.title}`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
          
          <div style="background-color: #db2777; padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">Ticket Confirmed!</h1>
            <p style="margin: 10px 0 0; color: #fce7f3; font-size: 16px;">Get ready for the show, ${booking.guestName}</p>
          </div>

          <div style="padding: 30px;">
            <h2 style="color: #1f2937; margin-top: 0; font-size: 20px; border-bottom: 2px solid #f3f4f6; padding-bottom: 15px;">${event.title}</h2>
            
            <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 100px;">Date</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${eventDate}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Time</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${event.time}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Venue</td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${event.venue.name}, ${event.venue.city}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Booking ID</td>
                <td style="padding: 8px 0; color: #111827; font-family: monospace;">${booking._id}</td>
              </tr>
            </table>

            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px dashed #e5e7eb;">
               <h3 style="color: #4b5563; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px;">Guest Details</h3>
               <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280; width: 100px; font-size: 14px;">Name:</td>
                    <td style="padding: 4px 0; color: #111827; font-weight: 500; font-size: 14px;">${booking.guestName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">Mobile:</td>
                    <td style="padding: 4px 0; color: #111827; font-weight: 500; font-size: 14px;">${booking.mobile}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; color: #6b7280; font-size: 14px;">City:</td>
                    <td style="padding: 4px 0; color: #111827; font-weight: 500; font-size: 14px;">${booking.city}</td>
                  </tr>
               </table>
            </div>

            <div style="margin-top: 25px;">
              <h3 style="color: #9d174d; font-size: 16px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 15px;">Your Seats</h3>
              ${ticketListHtml}
            </div>

            <div style="margin-top: 20px; text-align: right; border-top: 2px solid #f3f4f6; padding-top: 15px;">
              <span style="color: #6b7280; font-size: 14px;">Total Paid:</span>
              <span style="color: #db2777; font-size: 24px; font-weight: 800; margin-left: 10px;">₹${booking.totalAmount}</span>
            </div>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #9ca3af; font-size: 12px;">
              Need help? Contact support. <br/>
              © 2026 BookMyConcert
            </p>
          </div>
        </div>
      `,
    };

    // 4. Send
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${recipientEmail}`);
  } catch (error) {
    console.error("❌ Email Sending Failed:", error);
  }
};

module.exports = { sendTicketEmail };