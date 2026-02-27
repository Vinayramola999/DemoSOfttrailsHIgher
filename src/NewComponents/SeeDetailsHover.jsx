import { useState, useEffect } from "react";

export default function Tooltip({ children, text }) {
  const [show, setShow] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    let timer;
    if (hovering) {
      timer = setTimeout(() => setShow(true), 1000); 
    } else {
      clearTimeout(timer);
      setShow(false);
    }

    return () => clearTimeout(timer);
  }, [hovering]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {children}
      {show && (
        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-2 py-1 rounded shadow-lg whitespace-nowrap z-50">
          {text}
        </div>
      )}
    </div>
  );
}
