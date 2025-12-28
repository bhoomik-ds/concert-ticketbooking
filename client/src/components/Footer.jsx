const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-semibold mb-4">Tickets</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Fan pit standing</a></li>
              <li><a href="#" className="hover:text-white">Platinum Seating</a></li>
              <li><a href="#" className="hover:text-white">General standing</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Events</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">All Events</a></li>
              <li><a href="#" className="hover:text-white">Music Shows</a></li>
              <li><a href="#" className="hover:text-white">Comedy Shows</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">About Us</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Social</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Facebook</a></li>
              <li><a href="#" className="hover:text-white">Twitter</a></li>
              <li><a href="#" className="hover:text-white">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2025 BookMyConcert. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;