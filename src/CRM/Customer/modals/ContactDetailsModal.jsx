import React from "react";
const ContactDetailsModal = ({ isOpen, contact, onClose }) => {
  if (!isOpen || !contact) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="relative flex justify-between items-center px-5 py-3 bg-white border-b border-gray-300">
          <h2 className="text-gray-800 font-semibold text-base">
            Contact Details
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Status Badge */}
           {contact.status && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                contact.status?.toLowerCase() === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {contact.status}
              </span>
            )}
            
            <button
              onClick={onClose}
              className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors"
            >
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M1 1L12 12M12 1L1 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="bg-gray-50 border-b border-gray-300 px-5 py-4">
          {/* Desktop Grid - Matching the exact layout specified */}
          <div className="grid grid-cols-3 gap-x-8 gap-y-3 text-sm">
            {/* Row 1 - Contact Name, Department, Phone */}
            <div className="text-gray-500">
              <span className="text-gray-900 font-semibold text-xl">{contact.contact_person}</span>
            </div>
            <div className="text-gray-500">
              Department: <span className="text-gray-900 font-medium">{contact.department || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              Phone No.: <span className="text-gray-900 font-medium">{contact.phone_num || "N/A"}</span>
            </div>

            {/* Row 2 - Email, Address, Country */}
            <div className="text-gray-500">
              Email: <span className="text-gray-900 font-medium">{contact.email_id || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              Address: <span className="text-gray-900 font-medium">{contact.address || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              Country: <span className="text-gray-900 font-medium">{contact.country || "N/A"}</span>
            </div>

            {/* Row 3 - State, City, Pin Code */}
            <div className="text-gray-500">
              State: <span className="text-gray-900 font-medium">{contact.state || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              City: <span className="text-gray-900 font-medium">{contact.city || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              Pin Code: <span className="text-gray-900 font-medium">{contact.pincode || "N/A"}</span>
            </div>

            {/* Row 4 - Designation, Start Date, End Date */}
            <div className="text-gray-500">
              Designation: <span className="text-gray-900 font-medium">{contact.designation || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              Start Date: <span className="text-gray-900 font-medium">{contact.date_of_start || "N/A"}</span>
            </div>
            <div className="text-gray-500">
              End Date: <span className="text-gray-900 font-medium">{contact.date_of_end || "N/A"}</span>
            </div>

            {/* Row 5 - Contact ID (if available) */}
            {contact.contact_id && (
              <div className="text-gray-500">
                Contact ID: <span className="text-gray-900 font-medium">{contact.contact_id}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailsModal;