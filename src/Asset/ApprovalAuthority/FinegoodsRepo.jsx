import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye } from "react-icons/fa";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const ProductionRepository = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);

  const rowsPerPage = 10;
  const userId = Number(sessionStorage.getItem("userId") || 1);

  const fetchProjects = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Get token from sessionStorage

      const res = await axios.get(
        `${JAVA_BASE}api/projects/fetch`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchHistoryData = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Get token from sessionStorage

      const res = await axios.get(
        `${ASSET_NODE_BASE}processlifecycle/fine-goods/by-status?status=Repository`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const filteredData = (res.data.data || []).filter(
        (item) =>
          item.status === "Repository" && item.stages === "AwaitingApproval"
      );

      setHistoryData(filteredData);
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
    setSelectedAction(null);
    setModalOpen(true);
  };

  // const handleConfirmAction = async () => {
  //   if (!selectedAction) return alert("Please select an action");

  //   const payload = selectedAction === "APPROVE"
  //     ? {
  //         user_id: userId,
  //         action: "FineGoodsApproval",
  //         new_status: "Inventory",

  //       }

  //     : {
  //         user_id: userId,
  //         action: "FineGoodsApproval",
  //         new_stages: "Resubmitted",
  //         sub_stages: "Added",
  //       };

  //   try {
  //     await axios.put(
  //       `https://saaspro.softtrails.net/saas/asset/pro/processlifecycle/fine-goods/update-status/${selectedLog.id}`,
  //       payload
  //     );
  //     alert("Action submitted successfully!");
  //     setModalOpen(false);
  //     fetchHistoryData();
  //   } catch (err) {
  //     console.error("Error submitting action:", err);
  //     alert("Submission failed. Please try again.");
  //   }
  // };

  const handleConfirmAction = async () => {
    if (!selectedAction) return alert("Please select an action");

    const token = sessionStorage.getItem("token"); // ✅ Get token from sessionStorage

    try {
      if (selectedAction === "APPROVE") {
        // ✅ Only First API: Update stage/substage to "Active / Added"
        const stagePayload = {
          user_id: userId,
          action: "FineGoodsApproval",
          new_stages: "Active",
          sub_stages: "Added",
        };

        const stageUrl = `${ASSET_NODE_BASE}processlifecycle/fine-goods/update-statuss/${selectedLog.id}`;

        await axios.put(stageUrl, stagePayload, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token added
          },
        });
      } else {
        // For RESUBMIT
        const resubmitPayload = {
          user_id: userId,
          action: "FineGoodsApproval",
          new_stages: "Resubmitted",
          sub_stages: "Added",
        };

        const resubmitUrl = `${ASSET_NODE_BASE}processlifecycle/fine-goods/update-statuss/${selectedLog.id}`;

        await axios.put(resubmitUrl, resubmitPayload, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token added
          },
        });
      }

      alert("Action submitted successfully!");
      setModalOpen(false);
      fetchHistoryData();
    } catch (err) {
      console.error("Error submitting action:", err);
      alert("Submission failed. Please try again.");
    }
  };

  return (
    <div className="p-4">
      {/* Filters */}
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
                  <th className="p-5 text-left">Markup Percentage</th>
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
                      className={`border-t ${
                        idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                      }`}
                    >
                      <td className="px-5 py-3">{indexOfFirst + idx + 1}</td>
                      <td className="px-5 py-3">{log.batch_number}</td>
                      <td className="px-5 py-3">{log.project_name}</td>
                      <td className="px-5 py-3">{log.quantity}</td>
                      <td className="px-5 py-3">₹{log.cost_per_unit}</td>
                      <td className="px-5 py-3">₹{log.total_cost}</td>
                      <td className="px-5 py-3">{log.markup_percentage}%</td>
                      <td className="px-5 py-3 font-bold text-blue-600">
                        {log.stages}
                      </td>
                      <td className="px-5 py-3 font-bold text-green-600">
                        {log.status}
                      </td>
                      <td className="px-5 py-3">
                        {new Date(log.repository_at).toLocaleDateString(
                          "en-GB"
                        )}
                      </td>
                      <td className="px-5 py-3 text-blue-600 cursor-pointer">
                        <FaEye onClick={() => openModal(log)} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="py-6 px-4 text-center text-gray-500"
                    >
                      No production data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center  bg-black bg-opacity-40 z-50">
          <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-center mb-4">
              <span className="text-3xl">📝</span>
            </div>

            <h2 className="text-center text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Select Action
            </h2>
            <p className="text-center text-gray-600 text-sm mb-6">
              Project: <strong>{selectedLog?.project_name}</strong>
            </p>

            {/* Toggle Buttons */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setSelectedAction("APPROVE")}
                className={`px-5 py-2 rounded-lg text-sm font-medium border transition 
            ${
              selectedAction === "APPROVE"
                ? "bg-green-600 text-white border-green-600 shadow"
                : "bg-white text-gray-800 border-gray-300 hover:border-green-500"
            }`}
              >
                ✅ Approve
              </button>
              <button
                onClick={() => setSelectedAction("RESUBMIT")}
                className={`px-5 py-2 rounded-lg text-sm font-medium border transition 
            ${
              selectedAction === "RESUBMIT"
                ? "bg-yellow-500 text-white border-yellow-500 shadow"
                : "bg-white text-gray-800 border-gray-300 hover:border-yellow-500"
            }`}
              >
                🔄 Resubmit
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleConfirmAction}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Confirm
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionRepository;
