import React, { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import { Modal, Box, Button, Typography } from "@mui/material";
import axios from "axios";
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

const ProductionOutput = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const rowsPerPage = 10;

  const userId = sessionStorage.getItem("userId") || 1;

  // Fetch projects for dropdown
const fetchProjects = async () => {
  const token = sessionStorage.getItem("token"); // ✅ Token from sessionStorage
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

  // Fetch production request data
const fetchData = async (projectId) => {
  const token = sessionStorage.getItem("token"); // ✅ Token from sessionStorage
  try {
    const url = projectId
      ? `${ASSET_NODE_BASE}process/project/production-request/${projectId}`
      : `${ASSET_NODE_BASE}process/project/production-request`;

    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    setData(res.data.requests || []);
  } catch (err) {
    console.error("Fetch error:", err);
  }
};


  useEffect(() => {
    fetchProjects();
    fetchData();
  }, []);

useEffect(() => {
  if (selectedProject) {
    fetchData(selectedProject); 
  } else {
    fetchData(); 
  }
}, [selectedProject]);

  const filteredData = data.filter((item) =>
    item.project_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRequests = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleApproveClick = (id) => {
    setSelectedRequestId(id);
    setIsModalOpen(true);
  };

const handleConfirmApproval = async () => {
  const token = sessionStorage.getItem("token"); // ✅ Token from sessionStorage
  try {
    await axios.post(
      `${ASSET_NODE_BASE}process/productionRequest/${selectedRequestId}/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    alert("Production request approved successfully!");
    setIsModalOpen(false);
    fetchData(selectedProject);
  } catch (err) {
    console.error("Approval error:", err);
    alert("Failed to approve production request.");
  }
};


  return (
    <div className="p-4">
      {/* Project Dropdown and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[300px]"
        >
          <option value="">Select Project</option>
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
                  <th className="p-5 text-left">Project Name</th>
                  <th className="p-5 text-left">Units Produced</th>
                  <th className="p-5 text-left">Stage</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-left">Created At</th>
                  {/* <th className="p-5 text-left">Action</th> */}
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
  {new Date(req.created_at).toLocaleDateString("en-GB")} {/* Output: DD/MM/YYYY */}
</td>

                      {/* <td className="px-5 py-3">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleApproveClick(req.id)}
                        >
                          <FaEye />
                        </button>
                      </td> */}
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
        <Box className="bg-white shadow-2xl p-8 rounded-2xl w-[90%] max-w-md mx-auto mt-[20vh]">
          <Typography variant="h6" className="mb-4 text-lg font-bold text-gray-800 text-center">
            Approve Production Request?
          </Typography>
          <Typography className="text-gray-600 text-sm text-center mb-6">
            This will mark the production request as approved. Do you want to continue?
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

export default ProductionOutput;
