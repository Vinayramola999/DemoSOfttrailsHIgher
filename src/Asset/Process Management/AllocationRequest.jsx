import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaClipboardCheck, FaEye } from "react-icons/fa";
import { Button, Modal, Box } from "@mui/material";
import { FaHome } from "react-icons/fa";
import ProfileDropdown from "../../ProfileDropdown";
import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const Organization = () => {
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [projectData, setProjectData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const [uom, setUom] = useState("");
  const [page, setPage] = useState(0);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allocationType, setAllocationType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);

  const [locationDetails, setLocationDetails] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [subLocations, setSubLocations] = useState([]);
  const [selectedSubLocation, setSelectedSubLocation] = useState("");
  const [partialConfirmModal, setPartialConfirmModal] = useState({
    open: false,
    data: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const filteredData = projectData.filter((row) => row.status !== "Draft");
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

useEffect(() => {
  if (allocationType === "location") {
    const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

    axios
      .get(`${MAIN_BASE}loc`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      })
      .then((res) => {
        setLocationDetails(res.data);
      })
      .catch((err) => console.error("Failed to fetch locations", err));
  }
}, [allocationType]);

useEffect(() => {
  if (selectedLocation) {
    const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

    axios
      .get(`${MAIN_BASE}sloc/${selectedLocation}`, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      })
      .then((res) => {
        setSubLocations(res.data);
      })
      .catch((err) => console.error("Failed to fetch sub-locations", err));
  }
}, [selectedLocation]);

  const handleHome = () => {
    navigate("/Cards");
  };

  const verifyToken = async () => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const response = await axios.post(
        `${MAIN_BASE}users/verify-token`,
        { token: token }
      );
      console.log("Token is valid:", response.data);
    } catch (error) {
      console.error(
        "Token verification failed:",
        error.response ? error.response.data : error.message
      );
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenExpiry");
      navigate("/");
    }
  };

  useEffect(() => {
    verifyToken();
  }, [token]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
        `${MAIN_BASE}users/id_user/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId, token]);

  // Fetch Categories on Component Mount
useEffect(() => {
  const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

  axios
    .get(`${JAVA_BASE}api/categories/rawmaterials`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Token pass
      },
    })
    .then((response) => {
      setCategories(response.data); // Assuming response.data contains the category list
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
    });
}, []);
useEffect(() => {
  fetchProjects();
}, []);

const fetchProjects = async () => {
  try {
    const token = sessionStorage.getItem("token");

    const response = await axios.get(
      `${JAVA_BASE}api/fine-goods/all`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setProjects(response.data);
    setProjectData(response.data);
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};


useEffect(() => {
  const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

  if (selectedCategory) {
    axios
      .post(
       `${ASSET_NODE_BASE}getColumnTypesAndData`,
        { categoryName: selectedCategory },
        {
           params: {
          type:"Raw material"
         },
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
        }
      )
      .then((response) => {
        setMaterials(response.data); // Material list
      })
      .catch((error) => {
        console.error("Error fetching materials:", error);
      });
  }
}, [selectedCategory]);


  useEffect(() => {
    const filtered = projects.filter((project) => {
      const matchesProject =
        !selectedProject ||
        String(project.project_Id) === String(selectedProject);
      const matchesSearch = project.projectName
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesProject && matchesSearch;
    });
    setProjectData(filtered);
  }, [selectedProject, searchQuery, projects]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleProjectChange = (event) => {
    setSelectedProject(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    // Fetch materials based on the selected category
    const selectedCategoryData = categories.find(
      (category) => category.categoryId === event.target.value
    );
    setMaterials(selectedCategoryData ? selectedCategoryData.materials : []);
  };

  const handleMaterialChange = (event) => {
    setSelectedMaterial(event.target.value);
    // Set UOM based on the selected material
    const selectedMaterialData = materials.find(
      (material) => material.materialId === event.target.value
    );
    setUom(selectedMaterialData ? selectedMaterialData.uom : "");
  };

  const uniqueProjects = Array.from(
    new Map(projects.map((item) => [item.project_Id, item])).values()
  ).filter((project) =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
  };

  const generateColor = (key) => {
    const colors = [
      " text-red-800",
      "text-green-800",
      " text-blue-800",
      "text-yellow-800",
      "text-purple-800",
      "text-pink-800",
      "text-indigo-800",
      "text-teal-800",
      "text-orange-800",
    ];
    const hash = key
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const statusColors = useMemo(() => {
    const map = {};
    projectData.forEach((row) => {
      if (!map[row.status]) {
        map[row.status] = generateColor(row.status);
      }
    });
    return map;
  }, [projectData]);
  const stageColors = useMemo(() => {
    const map = {};
    projectData.forEach((row) => {
      if (!map[row.stages]) {
        map[row.stages] = generateColor(row.stages);
      }
    });
    return map;
  }, [projectData]);
  const handleOpenModal = (row) => {
    console.log("Selected Row:", row);
    setSelectedRow(row);
    setSelectedProjectId(row.project_Id ?? "");
    setSelectedRequestId(row.id ?? ""); // ✅ this is the requestId
    setIsModalOpen(true);
  };

  // Close Modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRow(null);
    setAllocationType("");
  };
const handleConfirmPartial = async (confirmValue) => {
  const { allocatedBy, allocatedTo, capitalizedType, selectedRequestId } =
    partialConfirmModal.data;

  const url = `${JAVA_BASE}api/allocation/allocate/partial/${selectedRequestId}?allocatedBy=${allocatedBy}&allocatedTo=${allocatedTo}&allocationType=${capitalizedType}&confirmPartial=${confirmValue}`;

  const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

  try {
    await axios.post(url, null, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Token pass
      },
    });

    alert(
      confirmValue
        ? "Partial allocation completed successfully."
        : "Partial allocation declined."
    );
    setPartialConfirmModal({ open: false, data: null });
    fetchProjects(); 
    handleCloseModal();
  } catch (error) {
    console.error("Partial allocation failed:", error);
    alert("Failed to complete the partial allocation.");
  }
};

const handleSubmitAllocation = async () => {
  const allocatedBy = parseInt(sessionStorage.getItem("userId"), 10);
  let allocatedTo = null;

  if (allocationType === "project") {
    allocatedTo = parseInt(selectedProjectId, 10);
    if (!allocatedTo || isNaN(allocatedTo)) {
      alert("Please select a valid project.");
      return;
    }
  } else if (allocationType === "location") {
    allocatedTo = parseInt(selectedSubLocation, 10);
    if (!allocatedTo || isNaN(allocatedTo)) {
      alert("Please select a valid sub-location.");
      return;
    }
  } else {
    alert("Please select an allocation type.");
    return;
  }

  if (!allocatedBy || isNaN(allocatedBy) || !selectedRequestId) {
    alert("Missing user ID or request ID.");
    return;
  }

  const capitalizedType =
    allocationType.charAt(0).toUpperCase() + allocationType.slice(1);

  const apiUrl = `${JAVA_BASE}api/allocation/allocate/${selectedRequestId}?allocatedBy=${allocatedBy}&allocatedTo=${allocatedTo}&allocationType=${capitalizedType}`;

  const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

  try {
    const res = await axios.post(apiUrl, null, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Token attach
      },
    });

    const message = res?.data?.message || res?.data;

    if (
      typeof message === "string" &&
      message.includes(
        "Insufficient quantity available. Please confirm partial allocation"
      )
    ) {
      // Open partial confirmation modal
      setPartialConfirmModal({
        open: true,
        data: {
          allocatedBy,
          allocatedTo,
          capitalizedType,
          selectedRequestId,
        },
      });
    } else {
      alert(`${capitalizedType} allocated successfully!`);
      fetchProjects(); 
      handleCloseModal();
    }
  } catch (error) {
    console.error("Error allocating:", error);
    alert("Something went wrong while allocating.");
  }
};

  return (
    <div className="flex">
    <div className="flex flex-col p-2 w-full">
  {/* Top Filters */}
  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
    {/* Project Dropdown */}
    <div>
      <label
        htmlFor="project-select"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
       
      </label>
      <select
        id="project-select"
        value={selectedProject}
        onChange={handleProjectChange}
        className="w-full p-2 border border-gray-300 rounded-md text-sm"
      >
        <option value="">Select Project</option>
        {uniqueProjects.map((project) => (
          <option key={project.project_Id} value={project.project_Id}>
            {project.projectName}
          </option>
        ))}
      </select>
    </div>

    {/* Search Bar */}
    <div>
      <label
        htmlFor="search-projects"
        className="block text-sm font-medium text-gray-700 mb-1"
      >
       
      </label>
      <input
        id="search-projects"
        type="text"
        placeholder="Search Projects"
        value={searchQuery}
        onChange={handleSearchChange}
        className="w-full p-2 border border-gray-300 rounded-md text-sm"
      />
    </div>
  </div>

  {/* Table Section */}
  <div className="relative w-full p-4 border rounded-lg shadow-sm bg-white">
    <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
      <table className="min-w-full table-auto border-collapse ">
        <thead className="sticky top-0 bg-white border-b-2 border-black text-[14px] font-bold text-gray-700">
          <tr>
            {[
              "S.No",
              "Project Name",
              "Material Name",
              "Status",
              "Stages",
              "Quantity",
              "Action",
            ].map((header) => (
              <th key={header} className="p-4 text-center whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.length > 0 ? (
            filteredData
              .slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
              )
              .map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`transition-colors duration-300 hover:bg-blue-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <td className="p-4 text-center">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="p-4 text-center">{row.projectName}</td>
                  <td className="p-4 text-center">{row.materialName}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`${
                        statusColors[row.status] ||
                        "bg-gray-200 text-gray-800"
                      } px-2 py-1 rounded`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`${
                        stageColors[row.stages] ||
                        "bg-gray-200 text-gray-800"
                      } px-2 py-1 rounded`}
                    >
                      {row.stages}
                    </span>
                  </td>
                  <td className="p-4 text-center">{row.projectQuantity}</td>
                  <td className="p-4 text-center">
                    <button
                      className="text-blue-600 hover:text-blue-800 text-lg"
                      onClick={() => handleOpenModal(row)}
                      title="Allocate Project"
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center p-4 text-gray-500">
                No data available
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


      {/* Modal for Allocation */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        className="flex items-center justify-center p-4"
      >
        <Box className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-2xl transition-all duration-300">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6">
            Select Allocation Type
          </h2>

          {/* Toggle Buttons */}
          <div className="flex justify-center gap-3 mb-6">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
                allocationType === "project"
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50"
              }`}
              onClick={() => setAllocationType("project")}
            >
              Project
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium border transition-all duration-200 ${
                allocationType === "location"
                  ? "bg-pink-600 text-white border-pink-600"
                  : "bg-white text-pink-600 border-pink-300 hover:bg-pink-50"
              }`}
              onClick={() => setAllocationType("location")}
            >
              Location
            </button>
          </div>

          {/* Project Allocation Form */}
          {allocationType === "project" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={selectedRow?.projectName || ""}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Name
                </label>
                <input
                  type="text"
                  value={selectedRow?.materialName || ""}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAllocation}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Location Allocation Form */}
          {allocationType === "location" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Material Name
                </label>
                <input
                  type="text"
                  value={selectedRow?.materialName || ""}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={selectedRow?.projectName || ""}
                  readOnly
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                >
                  <option value="">-- Select Location --</option>
                  {locationDetails.map((location) => (
                    <option
                      key={location.location_id}
                      value={location.location_id}
                    >
                      {location.locality}
                    </option>
                  ))}
                </select>
              </div>

              {selectedLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Sub-Location
                  </label>
                  <select
                    value={selectedSubLocation}
                    onChange={(e) => setSelectedSubLocation(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                  >
                    <option value="">-- Select Sub-Location --</option>
                    {subLocations.map((subLocation, index) => (
                      <option key={index} value={subLocation.sub_location_id}>
                        {`Building: ${subLocation.building_no}, Floor: ${subLocation.floor}, Room: ${subLocation.room}`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAllocation}
                  className="px-5 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </Box>
      </Modal>

      <Modal
        open={partialConfirmModal.open}
        onClose={() => setPartialConfirmModal({ open: false, data: null })}
        className="flex items-center justify-center p-4"
      >
        <Box className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl transition-all duration-300 animate-fade-in">
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Partial Allocation
          </h2>

          <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
            The available quantity is insufficient to fulfill the full
            allocation.
            <br />
            Would you like to proceed with a <strong>partial allocation</strong>
            ?
          </p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleConfirmPartial(false)}
              className="px-5 py-2 rounded-full border border-red-400 text-red-600 hover:bg-red-50 transition"
            >
              No, Cancel
            </button>
            <button
              onClick={() => handleConfirmPartial(true)}
              className="px-5 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition shadow-md"
            >
              Yes, Proceed
            </button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Organization;
