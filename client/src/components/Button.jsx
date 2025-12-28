import React from "react";

const Button = ({ children, onClick, className, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-semibold transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;