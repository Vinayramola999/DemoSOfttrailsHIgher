import React from "react";

const Section = ({ title }) => {
  return (
    <div className="border-b pb-4">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </div>
  );
};

export default Section;
