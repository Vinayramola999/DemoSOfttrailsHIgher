import React from 'react';

const ModelPatientDetailsNew = ({ isOpen, onClose, patientData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 ">
      <div className="w-[842px] h-[645px] bg-white rounded-lg border border-[#DDDDDD] relative">
        {/* Header - Patient Details */}
        <h2 className="text-[16px] font-inter font-semibold text-[#1F2937] mt-[18px] ml-[19px]">
          Patient Details
        </h2>

        {/* Patient Information Grid */}
        <div className="grid grid-cols-5 gap-[13px] mt-[20px] mx-[22px]">
          {/* Admission ID */}
          <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
            <label className="block text-sm text-gray-600">Admission ID</label>
            <span className="font-medium">{patientData?.admissionId || 'N/A'}</span>
          </div>

          {/* Patient Name */}
          <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
            <label className="block text-sm text-gray-600">Patient Name</label>
            <span className="font-medium">{patientData?.patientName || 'N/A'}</span>
          </div>

          {/* Phone Number */}
          <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
            <label className="block text-sm text-gray-600">Phone Number</label>
            <span className="font-medium">{patientData?.phoneNumber || 'N/A'}</span>
          </div>

          {/* Date of Admission */}
          <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
            <label className="block text-sm text-gray-600">Date of Admission</label>
            <span className="font-medium">{patientData?.admissionDate || 'N/A'}</span>
          </div>

          {/* Charge Type */}
          <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
            <label className="block text-sm text-gray-600">Charge Type</label>
            <span className="font-medium">{patientData?.chargeType || 'N/A'}</span>
          </div>
        </div>

        {/* Allocation Section */}
        <h3 className="text-[14px] font-inter font-semibold text-[#00235A] mt-[149px] ml-[22px]">
          Allocation of services & consumables
        </h3>

        {/* Service History */}
        <div className="mt-[5.6px]">
          <h4 className="text-[14.4px] font-roboto font-semibold leading-[22.4px]">
            Service History
          </h4>
        </div>

        {/* Search Box */}
        <div className="absolute right-[16.4px] top-[278px]">
          <input
            type="text"
            placeholder="Search..."
            className="w-[192.8px] h-[33.6px] border border-[#E5E7EB] rounded px-3"
          />
        </div>

        {/* Table Header */}
        <div className="absolute left-[19.2px] top-[324.4px] w-[804px] h-[32.8px] bg-[#F9FAFB] border-b border-[#E5E7EB] flex items-center px-4">
          <div className="grid grid-cols-6 w-full">
            <div className="font-medium">Date</div>
            <div className="font-medium">Service</div>
            <div className="font-medium">Quantity</div>
            <div className="font-medium">Rate</div>
            <div className="font-medium">Amount</div>
            <div className="font-medium">Actions</div>
          </div>
        </div>

        {/* Table Row */}
        <div className="absolute left-[19.2px] top-[357.2px] w-[806.55px] h-[58.4px] border border-[#E5E7EB] flex items-center px-4">
          <div className="grid grid-cols-6 w-full">
            <div>22/10/2025</div>
            <div>Consultation</div>
            <div>1</div>
            <div>$100</div>
            <div>$100</div>
            <div>
              <button className="text-blue-600">Edit</button>
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="absolute bottom-[17.6px] right-[20.7px] w-[196.3px] h-[24px] border border-[#E5E7EB] rounded flex items-center justify-center">
          <button className="px-2">←</button>
          <span className="mx-2">Page 1 of 5</span>
          <button className="px-2">→</button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ModelPatientDetailsNew;