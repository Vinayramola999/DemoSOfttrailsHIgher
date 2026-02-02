import React from "react";
const ApprovalCustomer = ({
  isOpen,
  customer,
  workflows = [],
  countries = [],
  states = [],
  cities = [],
  onChange,
  onClose,
  onResubmit,
  onReject,
  onApprove,
}) => {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-5 rounded-2xl w-[55%] max-h-[100vh] overflow-auto scrollbar-hide relative">
        {/* Close Button */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold mb-4 ml-7">Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
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
        <form className="grid grid-cols-1 gap-4 w-full">
          <div className="ml-4 sm:ml-7">
            <div className="grid gap-4 mb-2 md:grid-cols-2">
              {/* Customer Name */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Customer Name*
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  name="customer_name"
                  value={customer.customer_name || ""}
                  readOnly
                />
              </div>

              {/* Phone No */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Phone no.*
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  name="phone_number"
                  value={customer.phone_number || ""}
                  readOnly
                />
              </div>
            </div>
            <div className="grid gap-4 mb-2 md:grid-cols-3">
              {/* Email */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">Email*</label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  name="email_id"
                  value={customer.email_id || ""}
                  readOnly
                />
              </div>
              {/* Address */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Address
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  name="address"
                  value={customer.address || ""}
                  readOnly
                />
              </div>
              {/* Country Dropdown */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Country
                </label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  name="country"
                  value={customer.country || ""}
                  disabled
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid gap-4 mb-2 md:grid-cols-3">
              {/* State Dropdown */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">State</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  name="state"
                  value={customer.state || ""}
                  disabled
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              {/* City Dropdown */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">City</label>
                <select
                  className="border rounded px-3 py-2 w-full"
                  name="city"
                  value={customer.city || ""}
                  disabled
                >
                  <option value="">Select City</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              {/* Pin code */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  Pin code
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  name="pincode"
                  value={customer.pincode || ""}
                  readOnly
                />
              </div>
            </div>
            <div className="grid gap-4 mb-2 md:grid-cols-3">
              {/* GST number */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  GST number
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  name="gst_number"
                  value={customer.gst_number || ""}
                  readOnly
                />
              </div>
              {/* PAN number */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  PAN number
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  name="pan_number"
                  value={customer.pan_no || ""}
                  readOnly
                />
              </div>
              {/* TAN number */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium mb-1">
                  TAN number
                </label>
                <input
                  className="border rounded px-3 py-2 w-full"
                  name="tan_number"
                  value={customer.tan_number || ""}
                  readOnly
                />
              </div>
            </div>
          </div>
        </form>
        <div className="flex justify-between items-center mt-8 px-8">
          <button
            className="bg-[#FFA800] text-white w-[200px] px-10 py-2 rounded-md font-semibold"
            onClick={onResubmit}
            type="button"
          >
            Resubmit
          </button>

          <div className="space-x-4">
            <button
              className="bg-[#E53935] text-white w-[200px] px-10 py-2 rounded-md font-semibold"
              onClick={onReject}
              type="button"
            >
              Reject
            </button>
            <button
              className="bg-[#1976D2] text-white w-[200px] px-10 py-2 rounded-md font-semibold"
              onClick={onApprove}
              type="button"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalCustomer;
