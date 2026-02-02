import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { Modal } from "@mui/material";
import axios from "axios";
import MessageModal from "../ApprovalAuthority/MessageModal";
import {
  DMS_BASE,
  JAVA_BASE,
  ASSET_NODE_BASE,
  UCS_BASE,
  MAIN_BASE,
} from "../../config/apiBase";

const getTextColorClass = (label) => {
  const colors = [
    "text-red-600",
    "text-blue-600",
    "text-green-600",
    "text-yellow-600",
    "text-purple-600",
    "text-pink-600",
    "text-indigo-600",
    "text-gray-600",
    "text-orange-600",
    "text-teal-600",
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

const ProductionExecution = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAction, setSelectedAction] = useState("APPROVE");

  // Message Modal states
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const rowsPerPage = 10;
  const userId = sessionStorage.getItem("userId") || 1;

  // ✅ Fetch all projects
  const fetchProjects = async () => {
    const token = sessionStorage.getItem("token");
    try {
      const res = await axios.get(`${JAVA_BASE}api/projects/fetch`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  // ✅ Fetch production requests (all or by project)
  const fetchData = async (projectId = "") => {
    const token = sessionStorage.getItem("token");
    try {
      const url = projectId
        ? `${ASSET_NODE_BASE}process/project/production-request/${projectId}`
        : `${ASSET_NODE_BASE}process/project/production-request`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.requests || []);
    } catch (err) {
      console.error("Error fetching production requests:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchData(selectedProject);
    else fetchData();
  }, [selectedProject]);

  // ✅ Handle Approve/Reject Modal
  const handleApproveClick = (request) => {
    setSelectedRequestId(request.id);
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // ✅ Handle confirmation for Approve/Reject
  const handleConfirmApproval = async () => {
    const token = sessionStorage.getItem("token");

    try {
      const response = await axios.post(
        `${ASSET_NODE_BASE}process/project/production-status/${selectedRequestId}/${userId}`,
        {
          approveaction: selectedAction,
          action: "ProductionApprove",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // ✅ Success message from backend
      setMessage(
        response?.data?.message ||
          `Production request ${
            selectedAction === "APPROVE" ? "approved" : "rejected"
          } successfully!`
      );
      setMessageType("success");

      // ✅ Refresh data and close modal
      fetchData(selectedProject);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Approval error:", error);

      // ✅ Backend error message
      const errMsg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to process production request.";

      setMessage(errMsg);
      setMessageType("error");

      // ✅ Modal close even on error
      setIsModalOpen(false);
    }
  };

  // ✅ Filtering and pagination
  const filteredData = data.filter((item) =>
    item.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRequests = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <div className="p-4 w-full h-full  overflow-y-auto">
      {/* Project Dropdown & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[300px]"
        >
          <option value="">Select Project</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.projectName || `Project #${proj.id}`}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by Project Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[300px]"
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
                  <th className="p-5 text-left">Project Name</th>
                  <th className="p-5 text-left">Requested Units</th>
                  <th className="p-5 text-left">Stage</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-left">Created At</th>
                  <th className="p-5 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.length > 0 ? (
                  currentRequests.map((req, idx) => (
                    <tr key={req.id} className={`border-t ${idx % 2 === 0 ? "bg-blue-50" : "bg-white"}`}>
                      <td className="px-5 py-3">{indexOfFirst + idx + 1}</td>
                      <td className="px-5 py-3">{req.project_name}</td>
                      <td className="px-5 py-3">{req.requested_units}</td>
                      <td className="px-5 py-3 font-bold">
                        <span className={getTextColorClass(req.stages)}>{formatLabel(req.stages)}</span>
                      </td>
                      <td className="px-5 py-3 font-bold">
                        <span className={getTextColorClass(req.status)}>{formatLabel(req.status)}</span>
                      </td>
                 <td className="px-5 py-3">
  {new Date(req.created_at).toLocaleDateString("en-GB")}
</td>

                      <td className="px-5 py-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleApproveClick(req)}

                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-6 px-4 text-center text-gray-500">
                      No production requests found.
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
              <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">{currentPage}</span>
              <span className="text-sm font-medium">of</span>
              <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">{totalPages}</span>
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

      {/* Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-40 z-50">
          <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 transition-all duration-300">
            <h2 className="text-center text-xl font-bold text-gray-800 mb-3">
              Confirm Production Action
            </h2>
            <p className="text-center text-gray-600 text-sm mb-6">
              Please choose whether to approve or reject this production request.
            </p>

            {/* Toggle Buttons */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setSelectedAction("APPROVE")}
                className={`px-5 py-2 rounded-lg text-sm font-medium border transition ${
                  selectedAction === "APPROVE"
                    ? "bg-green-600 text-white border-green-600 shadow"
                    : "bg-white text-gray-800 border-gray-300 hover:border-green-500"
                }`}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => setSelectedAction("REJECT")}
                className={`px-5 py-2 rounded-lg text-sm font-medium border transition ${
                  selectedAction === "REJECT"
                    ? "bg-red-600 text-white border-red-600 shadow"
                    : "bg-white text-gray-800 border-gray-300 hover:border-red-500"
                }`}
              >
                ❌ Reject
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleConfirmApproval}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Confirm Action
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </Modal>

      {/* ✅ Message Modal */}
      <MessageModal
        message={message}
        type={messageType}
        setMessage={setMessage}
      />
    </div>
  );
};

export default ProductionExecution;
