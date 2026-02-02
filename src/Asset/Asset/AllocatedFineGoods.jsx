import React, { useEffect, useState } from "react";
import axios from "axios";
// ... imports unchanged
import { FaEye } from "react-icons/fa";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { DMS_BASE ,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase";
const AllocatedFineGoods = () => {
  const [allocationType, setAllocationType] = useState("allocation to vendor");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
const [selectedAction, setSelectedAction] = useState(null);
const [showRejectionInput, setShowRejectionInput] = useState(false);
const [batchModalOpen, setBatchModalOpen] = useState(false);
const [batchData, setBatchData] = useState([]);


  const rowsPerPage = 10;

  useEffect(() => {
    const loadAll = async () => {
      const projectList = await fetchProjects();
      await fetchHistoryData(projectList);
    };
    loadAll();
  }, [allocationType]);

const fetchProjects = async () => {
  const token = sessionStorage.getItem("token"); // Get token
  try {
    const res = await axios.get(
     `${JAVA_BASE}api/projects/fetch`,
      {
        headers: { Authorization: `Bearer ${token}` }, // Add token here
      }
    );
    setProjects(res.data);
    return res.data;
  } catch (err) {
    console.error("Error fetching projects:", err);
    return [];
  }
};

const fetchHistoryData = async (projectList) => {
  const token = sessionStorage.getItem("token"); // Get token
  try {
    const res = await axios.get(
      `${ASSET_NODE_BASE}processlifecycle/fine-goods/mapping/all?status=processed&allocation_type=${encodeURIComponent(allocationType)}`,
      {
        headers: { Authorization: `Bearer ${token}` }, // Add token here
      }
    );

    const rawData = res.data.data || [];

    const enrichedData = rawData.map((item) => {
      const project = projectList.find((p) => p.id === item.project_id);
      return {
        ...item,
        project_name: project ? project.projectName : "N/A",
      };
    });

    setHistoryData(enrichedData);
  } catch (err) {
    console.error("Error fetching mapping data:", err);
  }
};



  const filteredData = historyData
    .filter((item) => (selectedProject ? item.project_id === +selectedProject : true))
    .filter((item) =>
      item.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentLogs = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleRowClick = (log) => {
    setSelectedLog(log);
    setViewModalOpen(true);
  };

  const handleActionClick = (e, log) => {
    e.stopPropagation(); // prevent row click
    setSelectedLog(log);
    setRejectionReason("");
    setActionModalOpen(true);
  };
const handleEyeClick = async (e, id) => {
  e.stopPropagation();
  const token = sessionStorage.getItem("token"); // Get token

  try {
    const res = await axios.get(
      `${ASSET_NODE_BASE}processlifecycle/fine-goods/mapping/${id}/details`,
      {
        headers: { Authorization: `Bearer ${token}` }, // Add token here
      }
    );

    setBatchData(res.data?.data?.batch_breakdown || []);
    setBatchModalOpen(true);
  } catch (err) {
    console.error("Error fetching batch breakdown:", err);
  }
};

const getLocationString = (log) => {
  const parts = [
    log.building_no,
    log.floor ? `Floor ${log.floor}` : null,
    log.section ? `Section ${log.section}` : null,
    log.city,
    log.state,
    log.country,
  ].filter(Boolean);

  return parts.join(", ");
};

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select
          value={allocationType}
          onChange={(e) => setAllocationType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[220px]"
        >
          <option value="allocation to vendor">Vendor</option>
          <option value="allocation to user">User</option>
          <option value="allocation to location">Location</option>
        </select>

        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[220px]"
        >
          <option value="">All Projects</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.projectName}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by Project Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[220px]"
        />
      </div>

      {/* Table */}
      <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
        <div className="flex flex-col max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse ">
            <thead className="text-[16px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
  <tr>
    <th className="p-5 text-left">S.No</th>
    <th className="p-5 text-left">Project</th>
    <th className="p-5 text-left">Allocated Qty</th>
    <th className="p-5 text-left">Final Price</th>
    <th className="p-5 text-left">Total Amount</th>
    <th className="p-5 text-left">Profit</th>
    <th className="p-5 text-left">Profit %</th>
    <th className="p-5 text-left">Discount %</th>
    <th className="p-5 text-left">Status</th>
    <th className="p-5 text-left">Stage</th>
    <th className="p-5 text-left">Requested At</th>
  {allocationType === "allocation to location" ? (
  <th className="p-5 text-left">Location</th>
) : (
  <th className="p-5 text-left">Allocated User</th>
)}

    <th className="p-5 text-left">Action</th>

  </tr>
</thead>
<tbody className="bg-white divide-y divide-gray-200">
  {currentLogs.length > 0 ? (
    currentLogs.map((log, idx) => (
      <tr
        key={log.id}
        className={`cursor-pointer ${idx % 2 === 0 ? "bg-blue-50" : "bg-white"} hover:bg-blue-100`}
        onClick={() => handleRowClick(log)}
      >
        <td className="px-5 py-3">{indexOfFirst + idx + 1}</td>
        <td className="px-5 py-3">{log.project_name}</td>
        <td className="px-5 py-3">{log.requested_quantity}</td>
        <td className="px-5 py-3">{log.final_selling_price}</td>
        <td className="px-5 py-3">{log.total_amount}</td>
        <td className="px-5 py-3">{log.total_profit}</td>
        <td className="px-5 py-3">{log.profit_margin}%</td>
        <td className="px-5 py-3">{log.discount_percentage}%</td>
        <td className="px-5 py-3 font-bold text-blue-600">{log.status}</td>
        <td className="px-5 py-3 font-bold text-purple-600">{log.stages}</td>
        <td className="px-5 py-3">{new Date(log.requested_at).toLocaleDateString()}</td>
       <td className="px-5 py-3">
  {allocationType === "allocation to location" ? (
    <>
      {log.building_no && <span>{log.building_no}, </span>}
      {log.floor && <span>Floor {log.floor}, </span>}
      {log.section && <span>Sec {log.section}, </span>}
      {log.city && <span>{log.city}</span>}
    </>
  ) : (
    log.display_user_name || "N/A"
  )}
</td>

        <td className="px-5 py-3 text-blue-600">
  <button onClick={(e) => handleEyeClick(e, log.id)}>
    <FaEye className="text-lg hover:text-blue-800" />
  </button>
</td>

      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="12" className="py-6 px-4 text-center text-gray-500">
        No records found.
      </td>
    </tr>
  )}
</tbody>

            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
   {viewModalOpen && selectedLog && (
  <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-2xl relative border border-gray-200">

      {/* Close Button */}
      <button
        onClick={() => setViewModalOpen(false)}
        className="absolute top-4 right-5 text-gray-500 hover:text-gray-700 text-2xl font-bold"
        aria-label="Close"
      >
        ×
      </button>

      {/* Title */}
      <h2 className="text-2xl font-bold text-blue-600 mb-5 text-center">
        Fine Goods Details
      </h2>

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-gray-700">
        <p><span className="font-bold">Project:</span> {selectedLog.project_name}</p>
        <p><span className="font-bold">Stage:</span> {selectedLog.stages}</p>
        <p><span className="font-bold">Status:</span> {selectedLog.status_display}</p>
        <p><span className="font-bold">Allocated User:</span> {selectedLog.display_user_name || 'N/A'}</p>
{allocationType === "allocation to location" ? (
  <p>
    <span className="font-bold">Location:</span> {getLocationString(selectedLog)}
  </p>
) : (
  <p>
    <span className="font-bold">User:</span> {selectedLog.display_user_name || 'N/A'}
  </p>
)}

        <p><span className="font-bold">Pricing Strategy:</span> {selectedLog.pricing_strategy_display}</p>
        <p><span className="font-bold">Requested Qty:</span> {selectedLog.requested_quantity}</p>
        <p><span className="font-bold">Allocated Qty:</span> {selectedLog.allocated_quantity}</p>
        <p><span className="font-bold">Final Selling Price:</span> ₹{selectedLog.final_selling_price}</p>
        <p><span className="font-bold">Total Amount:</span> ₹{selectedLog.total_amount}</p>
        <p><span className="font-bold">Cost per Unit:</span> ₹{selectedLog.cost_per_unit}</p>
        <p><span className="font-bold">Total Cost:</span> ₹{selectedLog.total_cost}</p>
        <p><span className="font-bold">Profit per Unit:</span> ₹{selectedLog.profit_per_unit}</p>
        <p><span className="font-bold">Total Profit:</span> ₹{selectedLog.total_profit}</p>
        <p><span className="font-bold">Profit Margin:</span> {selectedLog.profit_margin}%</p>
        <p><span className="font-bold">Requested At:</span> {new Date(selectedLog.requested_at).toLocaleString()}</p>
        {selectedLog.approved_at && (
          <p><span className="font-bold">Approved At:</span> {new Date(selectedLog.approved_at).toLocaleString()}</p>
        )}
        {selectedLog.rejected_at && (
          <p><span className="font-bold">Rejected At:</span> {new Date(selectedLog.rejected_at).toLocaleString()}</p>
        )}
        {selectedLog.rejection_reason && (
          <p><span className="font-bold">Rejection Reason:</span> {selectedLog.rejection_reason}</p>
        )}
      </div>
    </div>
  </div>
)}
{batchModalOpen && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 "
    onClick={(e) => {
      if (e.target.id === "batchModal") setBatchModalOpen(false);
    }}
    id="batchModal"
  >
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 sm:mx-6 md:mx-8 lg:mx-auto p-6 relative max-h-[90vh] overflow-y-auto border border-gray-200 animate-fadeIn">
      {/* Close Button */}
      <button
        onClick={() => setBatchModalOpen(false)}
        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
        aria-label="Close Modal"
      >
        &times;
      </button>

      {/* Modal Header */}
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-blue-700">📦 Batch Breakdown</h2>
        <p className="text-gray-500 text-sm mt-1">Detailed allocation of fine goods</p>
      </div>

      {/* Modal Content */}
      {batchData.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full text-sm text-center">
            <thead className="bg-blue-50 text-blue-800 text-sm sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 border-b">Batch No.</th>
                <th className="px-4 py-3 border-b">Allocated Qty</th>
                <th className="px-4 py-3 border-b">Cost/Unit</th>
                   <th className="px-4 py-3 border-b">MRP</th>
                <th className="px-4 py-3 border-b">Selling/Unit</th>
                <th className="px-4 py-3 border-b">Total Cost</th>
                
                <th className="px-4 py-3 border-b">Total Selling</th>
               
                <th className="px-4 py-3 border-b">Profit</th>
                <th className="px-4 py-3 border-b">Profit %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {batchData.map((batch, idx) => (
                <tr
                  key={batch.id || idx}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-4 py-2">{batch.batch_number}</td>
                  <td className="px-4 py-2">{batch.allocated_quantity}</td>
                  <td className="px-4 py-2">₹{batch.cost_per_unit}</td>
                      <td className="px-4 py-2">₹{batch.base_selling_price}</td>
                  <td className="px-4 py-2">₹{batch.selling_price_per_unit}</td>
                  <td className="px-4 py-2">₹{batch.batch_total_cost}</td>
                  <td className="px-4 py-2">₹{batch.batch_total_selling}</td>
                  <td className="px-4 py-2 text-green-600">₹{batch.batch_profit}</td>
                  <td className="px-4 py-2 font-medium text-blue-600">
                    {batch.batch_profit_margin}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-10">
          <p>No batch data available.</p>
        </div>
      )}
    </div>
  </div>
)}





      <MessageModal message={message} type={messageType} setMessage={setMessage} />
    </div>
  );
};

export default AllocatedFineGoods;
