import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header (BookMyShow-style, pink) */}
      

      <main className="flex-grow p-4 max-w-3xl mx-auto">{children}</main>

      
    </div>
  );
};

export default Layout;
