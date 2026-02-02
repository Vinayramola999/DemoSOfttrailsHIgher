import React, { useState, useEffect } from "react";
import axios from "axios";
import {Button,} from "@mui/material";
import { FaHome,FaCheckCircle,FaCheckDouble, FaEye  } from "react-icons/fa";
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
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [loading, setLoading] = useState(false);

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
    axios
      .get(`${JAVA_BASE}api/categories/rawmaterials`)
      .then((response) => {
        setCategories(response.data); // Assuming response.data contains the category list
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, []);

// Define fetchProjects outside
const fetchProjects = async () => {
  const token = sessionStorage.getItem("token"); // ✅ Token fetch

  try {
    const response = await axios.get(
      `${JAVA_BASE}api/fine-goods/all`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      }
    );

    setProjects(response.data);
    setProjectData((prevData) => {
      if (JSON.stringify(prevData) !== JSON.stringify(response.data)) {
        return response.data;
      }
      return prevData;
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
  }
};


// Run it initially inside useEffect
useEffect(() => {
  fetchProjects();
}, []);


  useEffect(() => {
    if (selectedCategory) {
      axios
        .post(`${ASSET_NODE_BASE}getColumnTypesAndData`, {
          categoryName: selectedCategory,
        })
        .then((response) => {
          setMaterials(response.data); // Assuming response.data contains the material list for the category
        })
        .catch((error) => {
          console.error("Error fetching materials:", error);
        });
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedProject) {
      const filteredData = projects.filter(
        (project) => String(project.project_Id) === String(selectedProject)
      );
      setProjectData(filteredData);
    } else {
      setProjectData(projects);
    }
  }, [selectedProject, projects]);

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

  // Table Pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleQuantityChange = (event) => {
    setQuantity(event.target.value);
  };

const handleApprove = async () => {
  if (!selectedRequestId || !userId) return;

  const token = sessionStorage.getItem("token"); // ✅ Token fetch

  try {
    const response = await axios.post(
      `${JAVA_BASE}api/fine-goods/approve/${selectedRequestId}/${userId}`,
      {}, // POST body can be empty
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      }
    );

    console.log("Approval Successful:", response.data);
    await fetchProjects();
  } catch (error) {
    console.error("Error approving project:", error);
  }

  handleCloseConfirm();
};


  const handleCloseConfirm = () => {
    setOpenConfirm(false);
    setSelectedRequestId(null);
  };

  const handleOpenConfirm = (requestId) => {
    setSelectedRequestId(requestId);
    setOpenConfirm(true);
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

  const totalPages = Math.ceil(
  projectData.filter(row => row.status !== "Inactive" && row.stages !== "partiallyAllocated").length / rowsPerPage
);


  return (
<div className="p-2">
  {/* Filters */}
  <div className=" flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0 items-stretch md:items-end mb-5">
    {/* Project Dropdown */}
    <div className="w-full md:w-1/5">
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
    <div className="w-full md:w-1/5">
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

  {/* Table */}
  <div className="relative w-full p-4 bg-white shadow rounded-lg">
    <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
      <table className="min-w-full table-auto border-collapse ">
        <thead className="sticky top-0 bg-white border-b-2 border-black text-[14px] font-bold text-gray-700 z-10">
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
              <th key={header} className="p-3 text-center whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projectData.filter(row => row.status !== "Inactive" && row.stages !== "partiallyAllocated").length > 0 ? (
            projectData
              .filter(row => row.status !== "Inactive" && row.stages !== "partiallyAllocated")
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`transition-colors duration-300 hover:bg-blue-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-blue-50"
                  }`}
                >
                  <td className="p-3 text-center">{page * rowsPerPage + index + 1}</td>
                  <td className="p-3 text-center">{row.projectName}</td>
                  <td className="p-3 text-center">{row.materialName}</td>
                  <td className="p-3 text-center">
                    <span className={`${statusColors[row.status] || "bg-gray-200 text-gray-800"} px-2 py-1 rounded text-xs font-medium`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`${stageColors[row.stages] || "bg-gray-200 text-gray-800"} px-2 py-1 rounded text-xs font-medium`}>
                      {row.stages}
                    </span>
                  </td>
                  <td className="p-3 text-center">{row.projectQuantity}</td>
                  <td className="p-3 text-center">
                    {row.stages !== "Approved" ? (
                      <button onClick={() => handleOpenConfirm(row.id)} title="Approve" className="text-blue-600 hover:text-blue-800">
                        <FaEye className="text-lg" />
                      </button>
                    ) : (
                      <div className="flex items-center justify-center text-green-600 font-bold text-xs md:text-sm">
                        <FaCheckDouble className="mr-1" />
                        Approved
                      </div>
                    )}
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
  </div>

  {/* Confirmation Dialog */}
  {openConfirm && (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md transform transition-all">
        <h2 className="text-lg md:text-xl font-bold text-center mb-4">Confirm Approval</h2>
        <p className="text-sm text-center mb-6">Are you sure you want to approve this material?</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            onClick={handleCloseConfirm}
            color="secondary"
            variant="outlined"
            className="px-4 py-2 rounded-md text-sm w-full sm:w-28"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            color="primary"
            variant="contained"
            className="px-4 py-2 rounded-md text-sm w-full sm:w-28"
            disabled={loading}
          >
            {loading ? "Approving..." : "Approve"}
          </Button>
        </div>
      </div>
    </div>
  )}

  
 {/* Pagination Controls */}
{totalPages > 1 && (
  <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
    <button
      onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
      disabled={page === 0}
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
    >
      &lt;
    </button>

    <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
      {page + 1}
    </span>

    <span className="text-sm font-medium">of</span>

    <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">
      {totalPages}
    </span>

    <button
      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
      disabled={page === totalPages - 1}
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
    >
      &gt;
    </button>
  </div>
)}

</div>


  );
};

export default Organization;
