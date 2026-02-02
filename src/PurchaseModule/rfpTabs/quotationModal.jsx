// ./rfpTabs/QuotationModal.jsx

import React, { useState } from "react";
import Swal from "sweetalert2";

const QuotationModal = ({ onClose }) => {
  const [deliveryDays, setDeliveryDays] = useState(30);
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSend = () => {
    // API integration can go here
    Swal.fire(
      `Quotation sent with delivery in ${deliveryDays} days and file: ${
        file?.name || "No file"
      }`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-md w-[500px] shadow-md relative">
        <button
          className="absolute top-2 right-2 text-red-600 text-xl"
          onClick={onClose}
        >
          ×
        </button>

        <h2 className=" flex justify-start text-lg font-semibold mb-4">Quotation</h2>

        <label className="block mb-4">
          <span className="text-sm">Delivery time till</span>
          <div className="flex items-center space-x-2 mt-1">
            <input
              type="number"
              className="border rounded px-3 py-1 w-24"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
            />
            <span>Days</span>
          </div>
        </label>

        <div className="border-2 border-dashed rounded-md p-4 text-center mb-4">
          <p className="font-medium">Choose a file or drag & drop it here.</p>
          <p className="text-sm text-gray-500">
            JPEG, PNG, PDF, and DOX formats, up to 50 MB.
          </p>
          <label className="text-blue-600 underline cursor-pointer block mt-2">
            Browse File
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
          {file && <p className="text-sm text-green-600 mt-2">{file.name}</p>}
        </div>

        <div className="mb-4">
          <strong className="block mb-1">Terms and conditions</strong>
          <p className="text-sm text-gray-600">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry. Lorem Ipsum has been the industry's standard dummy text
            ever since the 1500s...
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={handleSend}
          >
            Send
          </button>
          <button
            className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const RFPForm = () => {
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  return (
    <div>
      <button
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        onClick={() => setShowQuotationModal(true)}
      >
        Send 
      </button>

      {showQuotationModal && (
        <QuotationModal onClose={() => setShowQuotationModal(false)} />
      )}
    </div>
  );
};

export default RFPForm;
