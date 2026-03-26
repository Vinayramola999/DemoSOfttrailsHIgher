import React, { useState, useEffect } from "react";
import { getFinalizedBill, getPatientsAdmissionDetails } from "../api/Service";

const PatientDetails = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [admissionId, setAdmissionId] = useState("");
  const [admissionOptions, setAdmissionOptions] = useState([]);
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    phone: "",
    admissionDate: "",
    // add other fields as needed
  });
  // Fetch admission IDs on mount
  useEffect(() => {
    const fetchAdmissions = async () => {
      try {
        const data = await getPatientsAdmissionDetails();
        setAdmissionOptions(data || []);
      } catch {
        setAdmissionOptions([]);
      }
    };
    fetchAdmissions();
  }, []);

  const services = [
    {
      date: "Jun 12, 2023",
      time: "10:30 AM",
      chargeType: "Charge Type Name",
      chargeList: "Charge List",
      charge: "₹1000.00",
      frequency: "-",
      discount: "₹100.00",
      advance: "₹100.00",
    }
  ];

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentServices = services.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleAdmissionIdChange = async (e) => {
    const id = e.target.value;
    setAdmissionId(id);
    if (id) {
      try {
        const data = await getFinalizedBill(id);
        setPatientDetails({
          name: data.patientName || "",
          phone: data.phone || "",
          admissionDate: data.admissionDate || "",
          // map other fields as needed
        });
      } catch {
        // Optionally handle error (e.g., show a message)
      }
    } else {
      setPatientDetails({
        name: "",
        phone: "",
        admissionDate: "",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-10">
      <div className="bg-white rounded-xl shadow-2xl relative max-w-5xl w-full mx-4 overflow-hidden text-[14px]">
        {/* Close Button - match PatientDetailsModal style */}
        <button
          className="absolute top-4 right-4 text-red-500 hover:text-red-600 bg-color-500 text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Patient Details
          </h2>
        </div>

        {/* Patient Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Admission ID
            </label>
            <select
              onChange={handleAdmissionIdChange}
              value={admissionId}
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-blue-500"
            >
              <option value="">Search ID</option>
              {admissionOptions.map((admission) => (
                <option key={admission.id} value={admission.id}>
                  {admission.id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Patient name
            </label>
            <input
              type="text"
              value={patientDetails.name}
              readOnly
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Phone number
            </label>
            <input
              type="text"
              value={patientDetails.phone}
              readOnly
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Date of admission
            </label>
            <input
              type="date"
              value={patientDetails.admissionDate}
              readOnly
              className="mt-1 w-full border rounded-md px-3 py-2 text-sm focus:outline-blue-500"
            />
          </div>
        </div>

        {/* Service History */}
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-700 text-base">
              Services History
            </h3>
            <input
              type="text"
              placeholder="Search services..."
              className="border rounded-md px-3 py-2 text-sm focus:outline-blue-500"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-base text-left border-separate" style={{ borderSpacing: 0 }}>
              <thead className="bg-[#F6F8FA] text-gray-700">
                <tr>
                  <th className="p-4 font-semibold text-gray-700">Date</th>
                  <th className="p-4 font-semibold text-gray-700">Charge Type</th>
                  <th className="p-4 font-semibold text-gray-700">Charge List</th>
                  <th className="p-4 font-semibold text-gray-700">Charge</th>
                  <th className="p-4 font-semibold text-gray-700">Frequency</th>
                  <th className="p-4 font-semibold text-gray-700">Discount</th>
                  <th className="p-4 font-semibold text-gray-700">Advance</th>
                </tr>
              </thead>
              <tbody>
                {currentServices?.map((s, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-200 hover:bg-gray-50 transition text-gray-700"
                  >
                    <td className="p-4 align-top">
                      <span className="font-semibold text-base text-gray-800">{s?.date}</span>
                      <br />
                      <span className="text-xs text-gray-500">{s?.time}</span>
                    </td>
                    <td className="p-4 font-semibold">{s?.chargeType}</td>
                    <td className="p-4">{s?.chargeList}</td>
                    <td className="p-4">{s?.charge}</td>
                    <td className="p-4">{s?.frequency}</td>
                    <td className="p-4">{s?.discount}</td>
                    <td className="p-4">{s?.advance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded text-sm ${currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'hover:bg-gray-100'
                }`}
            >
              &lt;
            </button>
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 border rounded text-sm ${currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'hover:bg-gray-100'
                    }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded text-sm ${currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'hover:bg-gray-100'
                }`}
            >
              &gt;
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-end">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            Generate bill →
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;