import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { Modal, Box, Button, Typography } from "@mui/material";
import {
  ASSET_NODE_BASE,
} from "../../config/apiBase";
import MessageModal from "../ApprovalAuthority/MessageModal"; // ✅ For success/error popup

// 🎨 Utility to color labels dynamically
const getTextColorClass = (label) => {
  const colors = [
    "text-red-600", "text-blue-600", "text-green-600", "text-yellow-600",
    "text-purple-600", "text-pink-600", "text-indigo-600", "text-gray-600",
    "text-orange-600", "text-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// 🏷 Format labels like "submitted_for_approval" → "Submitted For Approval"
const formatLabel = (value) =>
  value ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "NA";

const MaterialCompositionRequest = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "", stage: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ✅ Message Modal states
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success | error

  const rowsPerPage = 10;
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  // ✅ Fetch commission requests
  const fetchCommissionData = async () => {
    if (!token) return console.error("Token missing");

    try {
      const res = await fetch(`${ASSET_NODE_BASE}process/commission-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch commission data");

      setData(json.commissions || []);
      setFilteredData(json.commissions || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessageType("error");
      setMessage(err.message || "Error fetching data.");
    }
  };

  useEffect(() => {
    fetchCommissionData();
  }, []);

  // 🔍 Apply filters + search
  useEffect(() => {
    const filtered = data.filter(
      (item) =>
        item.material_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filters.status === "" || item.status === filters.status) &&
        (filters.stage === "" || item.stages === filters.stage)
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, filters, data]);

  // 🟢 Open modal to approve
  const handleApproveClick = (requestId) => {
    setSelectedRequestId(requestId);
    setIsModalOpen(true);
  };

  // ✅ Confirm approval handler
  const handleConfirmApproval = async () => {
    if (!token) return console.error("Token missing");

    try {
      const res = await fetch(
        `${ASSET_NODE_BASE}process/comissionRequest/${selectedRequestId}/${userId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            actionapprove: "APPROVE",
            action: "CompositionApprove",
          }),
        }
      );

      const json = await res.json();

      if (res.ok) {
        setMessageType("success");
        setMessage(json?.message || "Request approved successfully!");
        await fetchCommissionData(); // refresh table
      } else {
        // ✅ Handle backend error message
        setMessageType("error");
        setMessage(json?.error || json?.message || "Approval failed.");
      }
    } catch (err) {
      console.error("Approval error:", err);
      setMessageType("error");
      setMessage(err.message || "Something went wrong while approving.");
    } finally {
      // ✅ Always close modal
      setIsModalOpen(false);
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRequests = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const statuses = [...new Set(data.map((item) => item.status))];
  const stages = [...new Set(data.map((item) => item.stages))];

  return (
    <div className="p-4">
      {/* 🔍 Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Material Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[300px]"
        />
        <div className="flex flex-wrap gap-4">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.stage}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
          >
            <option value="">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>
                {formatLabel(stage)}
              </option>
            ))}
          </select>
          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {formatLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 🧾 Table */}
      <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
        <div className="flex flex-col max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="text-[16px] font-medium bg-white sticky top-0 border-b-2 border-black">
                <tr>
                  <th className="p-5 text-left">S.No</th>
                  <th className="p-5 text-left">Project Name</th>
                  <th className="p-5 text-left">Material Name</th>
                  <th className="p-5 text-left">Stage</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.length > 0 ? (
                  currentRequests.map((req, idx) => (
                    <tr
                      key={req.id}
                      className={`border-t ${idx % 2 === 0 ? "bg-blue-50" : "bg-white"}`}
                    >
                      <td className="px-5 py-3">{indexOfFirst + idx + 1}</td>
                      <td className="px-5 py-3">{req.project_name}</td>
                      <td className="px-5 py-3">{req.material_name}</td>
                      <td className="px-5 py-3 font-bold">
                        <span className={getTextColorClass(req.stages || "")}>
                          {formatLabel(req.stages)}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-bold">
                        <span className={getTextColorClass(req.status || "")}>
                          {formatLabel(req.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleApproveClick(req.id)}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-6 px-4 text-center text-gray-500">
                      No commission requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 📄 Pagination */}
          {totalPages > 1 && (
            <div className="sticky bottom-0 bg-white flex justify-center items-center gap-2 p-3 border-t border-gray-300">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                &lt;
              </button>
              <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
                {currentPage}
              </span>
              <span className="text-sm font-medium">of</span>
              <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">
                {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Approval Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Box className="bg-white shadow-xl p-8 rounded-2xl w-[90%] max-w-md mx-auto mt-[20vh]">
          <Typography
            variant="h6"
            className="mb-4 text-xl font-bold text-gray-800 text-center"
          >
            Approve Commission Request?
          </Typography>
          <Typography className="text-gray-600 text-center mb-6">
            This action will submit the commission request for approval.
          </Typography>

          <div className="flex justify-center gap-4">
            <Button variant="contained" color="primary" onClick={handleConfirmApproval}>
              ✅ Yes, Approve
            </Button>
            <Button variant="outlined" color="error" onClick={() => setIsModalOpen(false)}>
              ❌ Cancel
            </Button>
          </div>
        </Box>
      </Modal>

      {/* ✅ Message Modal */}
      <MessageModal message={message} type={messageType} setMessage={setMessage} />
    </div>
  );
};

export default MaterialCompositionRequest;
