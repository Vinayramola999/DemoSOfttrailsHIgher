import React, { useEffect, useState } from "react";
import axios from "axios";
// ... imports unchanged
import { FaEye } from "react-icons/fa";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const ProductionInventory = () => {
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


  const rowsPerPage = 10;

  useEffect(() => {
    const loadAll = async () => {
      const projectList = await fetchProjects();
      await fetchHistoryData(projectList);
    };
    loadAll();
  }, [allocationType]);

// ✅ Fetch projects
const fetchProjects = async () => {
  try {
    const token = sessionStorage.getItem("token"); // get token from sessionStorage

    const res = await axios.get(`${JAVA_BASE}api/projects/fetch`, {
      headers: {
        Authorization: `Bearer ${token}`, // add token here
      },
    });

    setProjects(res.data);
    return res.data;
  } catch (err) {
    console.error("Error fetching projects:", err);
    return [];
  }
};

// ✅ Fetch history
const fetchHistoryData = async (projectList) => {
  try {
    const token = sessionStorage.getItem("token");

    const res = await axios.get(
      `${ASSET_NODE_BASE}processlifecycle/fine-goods/mapping/all?status=awaiting_approval&allocation_type=${encodeURIComponent(allocationType)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

// ✅ Handle Approve/Reject
const handleAction = async (actionType) => {
  try {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId) {
      setMessageType("error");
      setMessage("User ID not found in session. Please log in again.");
      return;
    }

    const payload = {
      action: "FineMappingApproval",
      status: actionType,
      ...(actionType === "Rejected"
        ? { rejected_by: userId, rejection_reason: rejectionReason }
        : { approved_by: userId }),
    };

    await axios.put(
      `${ASSET_NODE_BASE}processlifecycle/fine-goods/Manual/mappingss/${selectedLog.id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`, // add token here
        },
      }
    );

    setMessageType("success");
    setMessage(`Successfully ${actionType === "Approved" ? "Approved" : "Rejected"}.`);
    setActionModalOpen(false);

    const updatedProjects = await fetchProjects();
    await fetchHistoryData(updatedProjects);
  } catch (err) {
    console.error(err);
    setMessageType("error");
    setMessage("Action failed. Try again.");
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

    {(allocationType === "allocation to user" || allocationType === "allocation to vendor") && (
      <th className="p-5 text-left">Allocated User</th>
    )}

    {allocationType === "allocation to location" && (
      <th className="p-5 text-left">Location</th>
    )}

    <th className="p-5 text-left">Allocated Qty</th>
      {allocationType === "allocation to vendor" && (
      <>
        <th className="p-5 text-left">Discount %</th>
        <th className="p-5 text-left">Warranty Period</th>
      </>
      
    )}
    <th className="p-5 text-left">Status</th>
    <th className="p-5 text-left">Stage</th>
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
        <td className="px-5 py-3">{log.project_name || "N/A"}</td>

        {(allocationType === "allocation to user" || allocationType === "allocation to vendor") && (
          <td className="px-5 py-3">{log.display_user_name || "N/A"}</td>
        )}

        {allocationType === "allocation to location" && (
          <td className="px-5 py-3">
            Building: {log.building_no}, Floor: {log.floor}, Section: {log.section}
          </td>
        )}

        <td className="px-5 py-3">{log.requested_quantity}</td>

        {allocationType === "allocation to vendor" && (
      <>
            <td className="px-5 py-3">{log.discount_percentage || "0.00"}%</td>
            <td className="px-5 py-3">{log.warranty_expiry_date ? new Date(log.warranty_expiry_date).toLocaleDateString() : "N/A"}</td>
          </>
        )}

        <td className="px-5 py-3 font-bold text-blue-600">{log.status}</td>
        <td className="px-5 py-3 font-bold text-purple-600">{log.stages}</td>
        <td className="px-5 py-3 text-blue-600">
          <FaEye className="cursor-pointer" onClick={(e) => handleActionClick(e, log)} />
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="9" className="py-6 px-4 text-center text-gray-500">No records found.</td>
    </tr>
  )}
</tbody>


            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {viewModalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-xl relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-2 right-3 text-xl text-gray-600"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-600">Fine Goods Details</h2>
<div className="space-y-2 text-sm">
  <p><strong>Project:</strong> {selectedLog.project_name}</p>

  {(allocationType === "allocation to user" || allocationType === "allocation to vendor") && (
    <p><strong>User:</strong> {selectedLog.display_user_name}</p>
  )}

  {allocationType === "allocation to location" && (
    <>
      <p><strong>Building:</strong> {selectedLog.building_no}</p>
      <p><strong>Floor:</strong> {selectedLog.floor}</p>
      <p><strong>Section:</strong> {selectedLog.section}</p>
    </>
  )}

  <p><strong>Allocated Qty:</strong> {selectedLog.requested_quantity}</p>

{allocationType === "allocation to vendor" && (
  <>
    <p><strong>Discount %:</strong> {selectedLog.discount_percentage}</p>
    <p><strong>Warranty Period:</strong> {selectedLog.warranty_expiry_date 
      ? new Date(selectedLog.warranty_expiry_date).toLocaleDateString() 
      : "N/A"}</p>
  </>
)}


  <p><strong>Stage:</strong> {selectedLog.stages}</p>
  <p><strong>Status:</strong> {selectedLog.status}</p>
  <p><strong>Requested At:</strong> {new Date(selectedLog.requested_at).toLocaleDateString()}</p>
  <p><strong>Allocation Type:</strong> {selectedLog.allocation_type}</p>
</div>


          </div>
        </div>
      )}

      {/* Action Modal */}
{actionModalOpen && selectedLog && (
  <div className="fixed inset-0 bg-black bg-opacity-30  flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-6 relative border border-gray-200">

      {/* Close */}
      <button
        onClick={() => setActionModalOpen(false)}
        className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
        aria-label="Close"
      >
        &times;
      </button>

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <span className="text-3xl">🛠️</span>
      </div>

      {/* Title & Description */}
      <h2 className="text-lg font-bold text-center text-gray-800 mb-1">
        Confirm Production Action
      </h2>
      <p className="text-center text-sm text-gray-500 mb-5">
        Choose whether to approve or reject this request.
      </p>

      {/* Action Selection */}
      <div className="flex justify-center gap-3 mb-4">
        <button
          onClick={() => {
            setSelectedAction("Approved");
            setShowRejectionInput(false);
          }}
          className={`px-4 py-1.5 rounded-md border text-sm font-medium flex items-center gap-1 ${
            selectedAction === "Approved"
              ? "bg-green-500 text-white border-green-500"
              : "bg-white text-green-600 border-green-400"
          }`}
        >
          ✅ Approve
        </button>

        <button
          onClick={() => {
            setSelectedAction("Rejected");
            setShowRejectionInput(true);
          }}
          className={`px-4 py-1.5 rounded-md border text-sm font-medium flex items-center gap-1 ${
            selectedAction === "Rejected"
              ? "bg-red-500 text-white border-red-500"
              : "bg-white text-red-600 border-red-400"
          }`}
        >
          ❌ Rejected
        </button>
      </div>

      {/* Rejection Reason Input */}
      {selectedAction === "Rejected" && (
        <input
          type="text"
          placeholder="Reason for rejection"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm mb-4"
        />
      )}

      {/* Final Confirm/Cancel */}
      <div className="flex justify-between mt-2">
        <button
          onClick={() => {
            if (
              selectedAction === "Approved" ||
              (selectedAction === "Rejected" && rejectionReason.trim() !== "")
            ) {
              const confirmText =
                selectedAction === "Approved"
                  ? "Are you sure you want to approve this request?"
                  : "Are you sure you want to reject this request?";
              if (window.confirm(confirmText)) {
                handleAction(selectedAction);
              }
            } else {
              alert("Please provide a reason for rejection.");
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-md"
        >
          Confirm Action
        </button>

        <button
          onClick={() => setActionModalOpen(false)}
          className="bg-gray-200 hover:bg-gray-200 text-gray-700 text-sm px-4 py-1.5 rounded-md border border-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}




      <MessageModal message={message} type={messageType} setMessage={setMessage} />
    </div>
  );
};

export default ProductionInventory;
