import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye } from "react-icons/fa";
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

const ProductionRepository = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [markupPercentage, setMarkupPercentage] = useState("");

  const rowsPerPage = 10;

  const userId = sessionStorage.getItem("userId") || 1;
const token = sessionStorage.getItem("token"); // Get token from sessionStorage

const fetchProjects = async () => {
  try {
    const res = await axios.get(`${JAVA_BASE}api/projects/fetch`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    setProjects(res.data);
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
};

const fetchHistoryData = async () => {
  try {
    const res = await axios.get(`${ASSET_NODE_BASE}process/finegoods`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    setHistoryData(res.data.data || []);
  } catch (err) {
    console.error("Error fetching fine goods data:", err);
  }
};


  useEffect(() => {
    fetchProjects();
    fetchHistoryData();
  }, []);

  const filteredData = historyData
    .filter((item) =>
      selectedProject ? item.project_id === selectedProject : true
    )
    .filter((item) =>
      item.project_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentLogs = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const openModal = (log) => {
    setSelectedLog(log);
    setMarkupPercentage("");
    setModalOpen(true);
  };

const handleSubmit = async () => {
  const numericMarkup = Number(markupPercentage);
  const numericUserId = Number(userId);

  if (!numericMarkup || isNaN(numericMarkup)) {
    alert("Please enter a valid markup percentage.");
    return;
  }

  const payload = {
    user_id: numericUserId,
    action: "FineGoodsAddition",
    new_stages: "AwaitingApproval",
    sub_stages: "Added",
    markup_percentage: numericMarkup,
  };

  try {
    await axios.put(
      `${ASSET_NODE_BASE}processlifecycle/fine-goods/update-status/${selectedLog.id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    alert("Markup submitted successfully!");
    setModalOpen(false);
    fetchHistoryData();
  } catch (err) {
    console.error("Error submitting markup:", err);
    alert("Submission failed. Please try again.");
  }
};


  return (
    <div className="p-4">
      {/* Dropdown & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[300px]"
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
                  <th className="p-5 text-left">Batch No</th>
                  <th className="p-5 text-left">Project Name</th>
                  <th className="p-5 text-left">Units Produced</th>
                  <th className="p-5 text-left">Cost/Unit</th>
                  <th className="p-5 text-left">Total Cost</th>
                  <th className="p-5 text-left">Stage</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-left">Repository Date</th>
                  <th className="p-5 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLogs.length > 0 ? (
                  currentLogs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={`border-t ${idx % 2 === 0 ? "bg-blue-50" : "bg-white"}`}
                    >
                      <td className="px-5 py-3">{indexOfFirst + idx + 1}</td>
                      <td className="px-5 py-3">{log.batch_number}</td>
                      <td className="px-5 py-3">{log.project_name}</td>
                      <td className="px-5 py-3">{log.quantity}</td>
                      <td className="px-5 py-3">₹{log.cost_per_unit}</td>
                      <td className="px-5 py-3">₹{log.total_cost}</td>
                      <td className="px-5 py-3 font-bold">
                        <span className={getTextColorClass(log.stages)}>{formatLabel(log.stages)}</span>
                      </td>
                      <td className="px-5 py-3 font-bold">
                        <span className={getTextColorClass(log.status)}>{formatLabel(log.status)}</span>
                      </td>
                      <td className="px-5 py-3">
                        {new Date(log.repository_at).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-5 py-3 text-blue-600 cursor-pointer">
                        <FaEye onClick={() => openModal(log)} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="py-6 px-4 text-center text-gray-500">
                      No production data found.
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
              >&lt;</button>
              <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">{currentPage}</span>
              <span className="text-sm font-medium">of</span>
              <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">{totalPages}</span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >&gt;</button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Submit Markup</h2>
            <p className="mb-2 text-gray-700">Project: <strong>{selectedLog?.project_name}</strong></p>
            <input
              type="number"
              placeholder="Enter markup percentage"
              value={markupPercentage}
              onChange={(e) => setMarkupPercentage(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded mb-4"
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionRepository;
