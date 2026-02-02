// components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "large", 
  color = "blue" 
}) => {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-8 h-8", 
    large: "w-12 h-12",
    xl: "w-16 h-16"
  };

  const colorClasses = {
    blue: "border-blue-600",
    green: "border-green-600",
    red: "border-red-600",
    gray: "border-gray-600"
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center space-y-4">
        <div 
          className={`${sizeClasses[size]} border-4 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
          role="status"
          aria-label="Loading"
        >
        </div>
        {message && (
          <div className={`text-${color}-600 text-xl font-semibold`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;