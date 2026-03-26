import React, { useState, useEffect } from 'react';

const ModelPatientDetailsNew = ({
  isOpen,
  onClose,
  patient: patientData,
  allocations = [],
  onAddAllocation,
  onGenerateBill,
}) => {
  // Search and pagination state
  const [page, setPage] = useState(1);
  const [serviceSearch, setServiceSearch] = useState("");
  const rowsPerPage = 4;

  // Filter allocations based on search
  const filteredAllocations = serviceSearch
    ? allocations.filter(a =>
        (a.chargeTypeName || "").toLowerCase().includes(serviceSearch.toLowerCase()) ||
        (a.manageListName || "").toLowerCase().includes(serviceSearch.toLowerCase())
      )
    : allocations;

  // Calculate pagination
  const totalPages = Math.ceil(filteredAllocations.length / rowsPerPage);
  const paginatedAllocations = filteredAllocations.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Reset page when allocations change
  useEffect(() => {
    setPage(1);
  }, [allocations]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB");
  };

  if (!isOpen || !patientData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="w-[842px] h-[645px] bg-red-500 rounded-lg border border-[#DDDDDD] relative">
        <button
          className="absolute top-4 right-4 text-gray-500 bg-red-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        <div className="p-4">
          {/* Header */}
          <h2 className="text-[16px] font-inter font-semibold text-[#1F2937] mt-[18px] ml-[19px]">
            Patient Details
          </h2>

          {/* Patient Information Grid */}
          <div className="grid grid-cols-5 gap-[13px] mt-[20px] mx-[22px]">
            <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
              <label className="block text-sm text-gray-600">Admission ID</label>
              <span className="font-medium">#{patientData.admissionId ?? "-"}</span>
            </div>

            <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
              <label className="block text-sm text-gray-600">Patient Name</label>
              <span className="font-medium">{patientData.patientName || "-"}</span>
            </div>

            <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
              <label className="block text-sm text-gray-600">Phone Number</label>
              <span className="font-medium">{patientData.phoneNumber ?? "-"}</span>
            </div>

            <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
              <label className="block text-sm text-gray-600">Date of Admission</label>
              <span className="font-medium">
                {patientData.admissionDate ? formatDate(patientData.admissionDate) : "-"}
              </span>
            </div>

            <div className="w-[189.13px] h-[57px] border border-[#DDDDDD] rounded-lg p-2">
              <label className="block text-sm text-gray-600">Charge Type</label>
              <span className="font-medium">Regular</span>
            </div>
          </div>

          {/* Services Section */}
          <div className="relative mt-[72px]">
            <h3 className="text-[14px] font-inter font-semibold text-[#00235A] ml-[22px]">
              Allocation of services & consumables
            </h3>

            <div className="mt-[5.6px] ml-[22px]">
              <h4 className="text-[14.4px] font-roboto font-semibold leading-[22.4px]">
                Service History
              </h4>
            </div>

            {/* Search Box */}
            <div className="absolute right-[16.4px] top-[20px]">
              <input
                type="text"
                placeholder="Search services..."
                className="w-[192.8px] h-[33.6px] border border-[#E5E7EB] rounded px-3"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
              />
            </div>

            {/* Table Section */}
            <div className="mt-[40px] mx-[19.2px]">
              <div className="w-full">
                <table className="w-full">
                  <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <tr className="h-[32.8px]">
                      <th className="px-4 py-2 text-left font-semibold text-sm">Date</th>
                      <th className="px-4 py-2 text-left font-semibold text-sm">Service</th>
                      <th className="px-4 py-2 text-left font-semibold text-sm">Quantity</th>
                      <th className="px-4 py-2 text-left font-semibold text-sm">Rate</th>
                      <th className="px-4 py-2 text-left font-semibold text-sm">Amount</th>
                      <th className="px-4 py-2 text-left font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedAllocations.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-500">
                          No services found.
                        </td>
                      </tr>
                    ) : (
                      paginatedAllocations.map((a, idx) => (
                        <tr key={a.id || idx} className="h-[58.4px] border border-[#E5E7EB]">
                          <td className="px-4 py-4">{formatDate(a.createdAt)}</td>
                          <td className="px-4 py-4">{a.chargeTypeName ?? "-"}</td>
                          <td className="px-4 py-4">1</td>
                          <td className="px-4 py-4">
                            {a.baseAmount !== undefined
                              ? `₹${Number(a.baseAmount).toFixed(2)}`
                              : "-"}
                          </td>
                          <td className="px-4 py-4">
                            {a.baseAmount !== undefined
                              ? `₹${Number(a.baseAmount).toFixed(2)}`
                              : "-"}
                          </td>
                          <td className="px-4 py-4">
                            <button className="text-blue-600 hover:text-blue-800">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="absolute bottom-[-120px] left-0 right-0 px-[22px] flex items-center justify-between">
              <button
                className="border border-gray-300 rounded px-4 py-2 bg-white hover:bg-blue-50"
                onClick={onAddAllocation}
              >
                Add new allocation
              </button>

              <div className="w-[196.3px] h-[24px] border border-[#E5E7EB] rounded flex items-center justify-center">
                <button
                  className="px-2 disabled:text-gray-300"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1 || totalPages === 1}
                >
                  ←
                </button>
                <span className="mx-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="px-2 disabled:text-gray-300"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={page === totalPages || totalPages === 1}
                >
                  →
                </button>
              </div>

              <button
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-8 py-2.5 font-medium text-sm transition-colors"
                onClick={onGenerateBill}
              >
                Generate bill →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPatientDetailsNew;