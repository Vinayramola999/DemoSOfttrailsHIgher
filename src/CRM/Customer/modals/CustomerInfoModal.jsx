const CustomerInfoModal = ({ isOpen, customer, onClose }) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[60%] max-h-[90vh] relative overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customer Details</h2>
          <button
            onClick={onClose}
            className="text-red-700 hover:text-gray-700 text-xl"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="red"
              className="size-8"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">
              Customer Name:
            </p>
            <p className="text-gray-800">{customer.customer_name}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">
              Phone No.:
            </p>
            <p className="text-gray-800">{customer.phone_number || "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">Email:</p>
            <p className="text-gray-800">{customer.email_id || "N/A"}</p>
          </div>
           <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">Industry:</p>
            <p className="text-gray-800">{customer.industry|| "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">Address:</p>
            <p className="text-gray-800">{customer.address || "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">Country:</p>
            <p className="text-gray-800">{customer.country || "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">State:</p>
            <p className="text-gray-800">{customer.state || "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">City:</p>
            <p className="text-gray-800">{customer.city || "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">Pin Code:</p>
            <p className="text-gray-800">{customer.pincode || "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">
              GST Number:
            </p>
            <p className="text-gray-800">{customer.gst_number || "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">
              PAN Number:
            </p>
            <p className="text-gray-800">{customer.pan_no || "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">
              TAN Number:
            </p>
            <p className="text-gray-800">{customer.tan_number || "N/A"}</p>
          </div>
          <div className="flex flex-row gap-4">
            <p className="font-bold text-gray-700 text-left w-1/2">Source:</p>
            <p className="text-gray-800">{customer.source || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoModal;
