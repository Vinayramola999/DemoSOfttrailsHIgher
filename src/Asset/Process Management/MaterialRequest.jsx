import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { Modal, Box, Button, Typography } from "@mui/material";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
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

const formatLabel = (value) => {
  if (!value) return "NA";
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
};

const MaterialRequest = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ category: "", status: "", stage: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rowsPerPage = 10;

  const userId = 2; 

useEffect(() => {
  const token = sessionStorage.getItem("token");

  fetch(`${JAVA_BASE}api/raw-material`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ✅ Token add
    },
  })
    .then((res) => res.json())
    .then((json) => {
      setData(json);
      setFilteredData(json);
    })
    .catch((err) => console.error("Fetch error:", err));
}, []);

  useEffect(() => {
    let filtered = data.filter((item) =>
      item.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filters.category === "" || item.categoryName === filters.category) &&
      (filters.status === "" || item.status === filters.status) &&
      (filters.stage === "" || item.stage === filters.stage)
    );
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchTerm, filters, data]);

  const categories = [...new Set(data.map(item => item.categoryName))];
  const statuses = [...new Set(data.map(item => item.status))];
  const stages = [...new Set(data.map(item => item.stage))];

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRequests = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleApproveClick = (requestId) => {
    setSelectedRequestId(requestId);
    setIsModalOpen(true);
  };

const handleConfirmApproval = async () => {
  const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

  try {
    const res = await fetch(
      `${JAVA_BASE}api/raw-material/approve/${selectedRequestId}/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId: selectedRequestId,
          userId: userId,
        }),
      }
    );

    if (res.ok) {
      alert("Request approved successfully!");

      // Fetch updated data with token
      const updatedData = await fetch(`${JAVA_BASE}api/raw-material`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      }).then((res) => res.json());

      setData(updatedData);
      setFilteredData(updatedData);
    } else {
      alert("Approval failed.");
    }
  } catch (err) {
    console.error("Approval error:", err);
    alert("Something went wrong.");
  }

  setIsModalOpen(false);
};



  return (
    <div className="p-4">
      {/* Search & Filters */}
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
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{formatLabel(cat)}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.stage}
            onChange={(e) => setFilters({ ...filters, stage: e.target.value })}
          >
            <option value="">All Stages</option>
            {stages.map((stage) => (
              <option key={stage} value={stage}>{formatLabel(stage)}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>{formatLabel(status)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
        <div className="flex flex-col max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse ">
              <thead className="text-[16px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                <tr>
                  <th className="p-5 text-left">S.No</th>
                  <th className="p-5 text-left">Project Name</th>
                  <th className="p-5 text-left">Material Category</th>
                  <th className="p-5 text-left">Material Name</th>
                  <th className="p-5 text-left">Requested Qty</th>
                  <th className="p-5 text-left">UOM</th>
                  <th className="p-5 text-left">Available Qty</th>
                  <th className="p-5 text-left">Description</th>
                  <th className="p-5 text-left">Stage</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-left">Action</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.length > 0 ? (
                  currentRequests.map((req, idx) => (
                    <tr key={req.requestId} className={`border-t ${idx % 2 === 0 ? "bg-blue-50" : "bg-white"}`}>
                      <td className="px-5 py-3">{indexOfFirst + idx + 1}</td>
                      <td className="px-5 py-3">{req.projectName || "-"}</td>
                      <td className="px-5 py-3">{req.categoryName}</td>
                      <td className="px-5 py-3">{req.materialName}</td>
                      <td className="px-5 py-3">{req.requestedQuantity}</td>
                      <td className="px-5 py-3">{req.uom}</td>
                      <td className="px-5 py-3">{req.availableQuantity}</td>
                      <td className="px-5 py-3">{req.description}</td>
                      <td className="px-5 py-3 font-bold">
                        <span className={getTextColorClass(req.stage || "")}>{formatLabel(req.stage)}</span>
                      </td>
                      <td className="px-5 py-3 font-bold">
                        <span className={getTextColorClass(req.status || "")}>{formatLabel(req.status)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleApproveClick(req.requestId)}
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" className="py-6 px-4 text-center text-gray-500">
                      No material requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* Approval Confirmation Modal */}
    <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
  <Box
    className="bg-gradient-to-br from-white via-blue-50 to-purple-100 shadow-2xl p-8 rounded-2xl w-[90%] max-w-md mx-auto mt-[20vh] transition-all duration-300"
  >
    <Typography
      variant="h6"
      className="mb-4 text-lg md:text-xl font-bold text-gray-800 text-center tracking-wide"
    >
      Approve Material Request?
    </Typography>
    <Typography className="text-gray-600 text-sm md:text-base text-center mb-6">
      This action will approve the selected material request. Are you sure you want to continue?
    </Typography>

    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleConfirmApproval}
        className="rounded-lg py-2 text-base font-medium shadow-md"
      >
        ✅ Yes, Approve
      </Button>
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={() => setIsModalOpen(false)}
        className="rounded-lg py-2 text-base font-medium"
      >
        ❌ Cancel
      </Button>
    </div>
  </Box>
</Modal>

    </div>
  );
};

export default MaterialRequest;
