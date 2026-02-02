import React, { useEffect, useState } from "react";
import axios from "axios";
import { Modal, Box, Typography, Button, TextField } from "@mui/material";
import {
  DMS_BASE,
  JAVA_BASE,
  ASSET_NODE_BASE,
  UCS_BASE,
  MAIN_BASE,
} from "../../config/apiBase";
import MessageModal from "../ApprovalAuthority/MessageModal";

const ProductionEstimation = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [estimationData, setEstimationData] = useState(null);
  const [filters, setFilters] = useState({ materialName: "", status: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [produceUnits, setProduceUnits] = useState("");

  // ✅ Message modal state
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const rowsPerPage = 10;

  // ✅ Fetch projects
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    axios
      .get(`${JAVA_BASE}api/projects/fetch`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setProjects(response.data);
        } else {
          console.error("Unexpected projects response:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching projects:", error));
  }, []);

  // ✅ Fetch estimation data when project selected
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (selectedProject) {
      axios
        .get(
          `${ASSET_NODE_BASE}process/project/production-capacity/${selectedProject}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .then((response) => setEstimationData(response.data))
        .catch((error) => console.error("Estimation fetch error:", error));
    } else {
      setEstimationData(null);
    }
  }, [selectedProject]);

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value.toString());
  };

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => {
    setProduceUnits("");
    setIsModalOpen(false);
  };

  // ✅ Submit production request
  const handleSubmitProduction = async () => {
    if (!produceUnits || isNaN(produceUnits)) {
      setMessage("Please enter a valid number of units.");
      setMessageType("error");
      return;
    }

    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId) {
      setMessage("User ID not found in session. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      const response = await axios.post(
        `${ASSET_NODE_BASE}process/project/production-request/${selectedProject}`,
        {
          requested_units: Number(produceUnits),
          created_by: Number(userId),
          user_id: Number(userId),
          action: "ProductionExecution",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // ✅ If backend sends a message field
      const successMsg =
        response.data?.message ||
        "Production recorded successfully!";
      setMessage(successMsg);
      setMessageType("success");

      handleModalClose();

      // Refresh updated estimation data
      const updated = await axios.get(
        `${ASSET_NODE_BASE}process/project/production-capacity/${selectedProject}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEstimationData(updated.data);
    } catch (error) {
      console.error("Error submitting production:", error);
      const backendError =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to record production.";
      setMessage(backendError);
      setMessageType("error");
       setIsModalOpen(false);
    }
  };

  // ✅ Filter & Pagination logic
  const filteredBreakdown =
    estimationData?.capacity_breakdown?.filter((item) => {
      return (
        item.material_name
          .toLowerCase()
          .includes(filters.materialName.toLowerCase()) &&
        (filters.status === "" || item.status === filters.status)
      );
    }) || [];

  const currentItems = filteredBreakdown.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredBreakdown.length / rowsPerPage);

  const statuses = Array.from(
    new Set(estimationData?.capacity_breakdown?.map((item) => item.status))
  );

  return (
    <div className="w-full h-screen p-4 md:p-6 overflow-y-auto bg-gray-50">
      {/* Project Dropdown */}
      <div className="mb-4 w-full md:w-[300px]">
        <label
          htmlFor="project-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select Project
        </label>
        <select
          id="project-select"
          value={selectedProject}
          onChange={handleProjectChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="">Select Project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.projectName ?? `Project #${project.id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Estimation Section */}
      {estimationData && (
        <div className="bg-white p-6 rounded-xl shadow-md border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-blue-800 mb-1">
                Estimated Output
              </h2>
              <p className="text-3xl font-bold text-green-700">
                {estimationData.max_producible_units} Units
              </p>
            </div>

            <Button
              variant="contained"
              color="primary"
              onClick={handleModalOpen}
              className="mt-2"
            >
              🚀 Production Execution
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by Material Name"
              value={filters.materialName}
              onChange={(e) =>
                setFilters({ ...filters, materialName: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[300px]"
            />
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[200px]"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
            <div className="flex flex-col max-h-[70vh] overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead className="text-[16px] font-medium bg-white sticky top-0 z-50 border-b-2 border-black">
                    <tr>
                      <th className="p-5 text-left">S.No</th>
                      <th className="p-5 text-left">Material</th>
                      <th className="p-5 text-left">Qty/Unit</th>
                      <th className="p-5 text-left">Available Quantity</th>
                      <th className="p-5 text-left">Possible Units</th>
                      <th className="p-5 text-left">Unit</th>
                      <th className="p-5 text-left">Allocated Cost</th>
                      <th className="p-5 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentItems.length > 0 ? (
                      currentItems.map((item, idx) => (
                        <tr
                          key={idx}
                          className={`border-t ${
                            idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                          }`}
                        >
                          <td className="px-5 py-3">
                            {(currentPage - 1) * rowsPerPage + idx + 1}
                          </td>
                          <td className="px-5 py-3">{item.material_name}</td>
                          <td className="px-5 py-3">{item.quantity_per_unit}</td>
                          <td className="px-5 py-3">{item.available_quantity}</td>
                          <td className="px-5 py-3 font-bold text-green-700">
                            {item.possible_units}
                          </td>
                          <td className="px-5 py-3">{item.unit}</td>
                          <td className="px-5 py-3">
                            ₹{item.total_allocated_cost ?? 0}
                          </td>
                          <td className="px-5 py-3 text-blue-600 font-medium">
                            {item.status}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="8"
                          className="py-6 px-4 text-center text-gray-500"
                        >
                          No material data available.
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Production Execution Modal */}
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <Box className="bg-white shadow-2xl p-6 rounded-xl w-full max-w-sm mx-auto mt-[20vh]">
          <Typography
            variant="h6"
            className="text-center text-blue-800 mb-4 font-bold"
          >
            Confirm Production Execution
          </Typography>
          <TextField
            fullWidth
            label="Units to Produce"
            type="number"
            value={produceUnits}
            onChange={(e) => setProduceUnits(e.target.value)}
            className="mb-4"
          />
          <div className="flex justify-center gap-4 mt-4">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmitProduction}
            >
              ✅ Submit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleModalClose}
            >
              ❌ Cancel
            </Button>
          </div>
        </Box>
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

export default ProductionEstimation;
