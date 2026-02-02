import React, { useState, useEffect } from "react";
import { FaHome, FaSignOutAlt, FaEdit, FaEye, faQrcode } from "react-icons/fa";
import { BiQr } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
//
import axios from "axios";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const AssetManagementPage = () => {
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tableData, setTableData] = useState({ columns: [], data: [] });
  const [searchTerm, setSearchTerm] = useState(""); 
  const [filteredData, setFilteredData] = useState([]); 
  const [editingAssetId, setEditingAssetId] = useState(null); 

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitMapModalState, setIsSubmitMapModalState] = useState({
    isOpen: false,
  });
  const [selectedAsset, setSelectedAsset] = useState(null); 
  const [locationDetails, setLocationDetails] = useState([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState(""); // State to store the type of message
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [uniqueId, setUniqueId] = useState(null); // For unique asset ID
  const [subLocations, setSubLocations] = useState([]); // State for sub-locations
  const [selectedLocation, setSelectedLocation] = useState(
    isSubmitMapModalState?.locationId || ""
  );

  // Fetch categories when the component mounts
useEffect(() => {
  const token = sessionStorage.getItem("token"); // 👈 get token once

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${JAVA_BASE}api/categories/rawmaterials`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  const fetchLocations = async () => {
    try {
      const locationResponse = await axios.get(
       `${MAIN_BASE}loc`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      setLocationDetails(locationResponse.data || []);
    } catch (error) {
      console.log("Error fetching locations", error);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const userResponse = await axios.get(
       `${MAIN_BASE}users/getusers`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      const users = Array.isArray(userResponse.data)
        ? userResponse.data
        : userResponse.data?.users || [];

      setAllUsers(users);
    } catch (error) {
      console.log("Error fetching users", error);
      setAllUsers([]); // fallback
    }
  };

  fetchCategories();
  fetchTableData();
  fetchLocations();
  fetchAllUsers();
}, []);

 


  useEffect(() => {
    if (selectedCategory && selectedCategory.id) {
      fetchTableData(selectedCategory.id);
    }
  }, [selectedCategory]); // Runs only when selectedCategory changes

  console.log("all users", allUsers);

  // Function to fetch table data (can be modified to take selectedCategory)
// Function to fetch mapping material data
const fetchTableData = async (categoryId = "") => {
  setIsLoading(true);
  const token = sessionStorage.getItem("token");

  try {
    // Build API URL
    const url = categoryId
      ? `${ASSET_NODE_BASE}assets/raw-material/mapping?category_id=${categoryId}`
      : `${ASSET_NODE_BASE}assets/raw-material/mapping`;

    const response = await axios.get(url, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        "Content-Type": "application/json",
      },
    });

    const data = response.data?.data || [];

    // Map table columns dynamically from keys
    const columns =
      data.length > 0
        ? Object.keys(data[0]).map((key) => ({ columnName: key }))
        : [];

    setTableData({
      columns: columns,
      data: data,
    });

    setFilteredData(data);
    setDynamicFields(columns);
    setFormErrors({});
  } catch (error) {
    console.error("Error fetching mapping data:", error);
    setFormErrors({
      general: "Error fetching mapping data. Please try again.",
    });
  } finally {
    setIsLoading(false);
  }
};




  // Handle the form data change
 const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData((prev) => ({
    ...prev,
    [name]: value,
  }));

  if (name === "category") {
    const selected = categories.find((cat) => cat.categoriesname === value);
    setSelectedCategory(selected);

    if (selected?.category_id) {
      fetchTableData(selected.category_id);
    }
  }
};

  

  // Handle search term changes and update filtered data
 const handleSearch = (e) => {
  const searchValue = e.target.value.toLowerCase();
  setSearchTerm(e.target.value);

  if (!searchValue.trim()) {
    // If search bar is empty, show all data
    setFilteredData(tableData.data || []);
    return;
  }

  const filtered = (tableData.data || []).filter((row) =>
    Object.values(row || {}).some((val) => {
      if (val === null || val === undefined) return false; // ✅ Prevent crash
      return val.toString().toLowerCase().includes(searchValue);
    })
  );

  setFilteredData(filtered);
};


  // Pagination logic
  const paginate = (data) => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  };
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  

  // Edit asset function
const handleEdit = (unique_id) => {
  const asset = tableData.data.find(
    (row) => row.material_details?.unique_id === unique_id
  );
  if (!asset) return alert("Asset not found");

  const parsed = {};
  const rawDetails = asset.material_details;

  for (const key in rawDetails) {
    const val = rawDetails[key];
    parsed[key] =
      key.toLowerCase().includes("date") && val
        ? new Date(val).toISOString().split("T")[0]
        : val;
  }

  // Add user name and location details
  parsed["location_details"] = asset.sublocation_details;
  parsed["user_full_name"] = asset.user_full_name;

  setFormData(parsed);
  setEditingAssetId(unique_id);
  setIsAssetModalOpen(true);

  // 🔍 Dynamically extract only the dynamic fields from parsed
  const knownStaticFields = Object.keys(parsed);
const dynamicOnly = dynamicFields.reduce((acc, field) => {
  const colName = field.columnName || field; // ✅ Ensure correct key
  if (!["unique_id", "created_at", "status", "toapprove", "stages"].includes(colName)) {
    if (parsed[colName] !== undefined) {
      acc[colName] = parsed[colName];
    }
  }
  return acc;
}, {});


  console.log("Form Data in handleEdit:", parsed);
  console.log("Dynamic Fields:", dynamicOnly); // ✅ shows only dynamic ones
};




  // Format the created_at date to 'YYYY-MM-DD'
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits for day

    return `${year}-${month}-${day}`;
  };

  // Filter out `unique_id` and `created_at` fields from dynamic fields
  const filteredDynamicFields = dynamicFields.filter(
    (field) =>
      field !== "unique_id" &&
      field !== "created_at" &&
      field !== "status" &&
      field !== "toapprove" &&
      field !== "stages"
  );
  

  //TOKEN AND USERPROFILE  START
  const userId = sessionStorage.getItem("userId");
  const [userData, setUserData] = useState("");
  const navigate = useNavigate();
  const getToken = () => {
    const token = sessionStorage.getItem("token");
    return token;
  };
  const token = getToken();


  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    console.log("UserId:", userId);
    if (userId) {
      const fetchUserData = async () => {
        try {
          console.log("Fetching data for userId:", userId);
          const response = await axios.get(
            `${MAIN_BASE}users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("API Response:", response);
          if (response.data) {
            const user = response.data;
            console.log("User:", user);
            setUserData(user);
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token, userId]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const handleHome = () => {
    navigate("/Cards");
  };



  const formatStages = (stages) => {
    if (!stages) return ""; // Handle empty or undefined values

    // Add spaces before capital letters and capitalize each word properly
    const formattedStage = stages
      .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
      .replace(
        /([A-Z][a-z]*)/g,
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize words
      )
      .trim(); // Remove any leading or trailing spaces

    // Get the color class for the stage
    const colorClass = getStageColor(stages);

    // Return the formatted stage as a styled span
    return (
      <span
        className={`px-2 py-1 rounded-full text-sm font-medium ${colorClass}`}
      >
        {formattedStage}
      </span>
    );
  };
  const getRandomColor = () => {
    const colors = [
   
      "text-blue-500",
   
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const stageColors = {};

  const getStageColor = (stage) => {
    if (!stageColors[stage]) {
      stageColors[stage] = getRandomColor(); // Assign a random color if not already assigned
    }
    return stageColors[stage];
  };

 

 return (
  <div className="flex flex-col overflow-hidden">
    <div className="flex">
      <div className="w-full">
        <div className="p-4 md:p-5 flex flex-col space-y-6 min-h-screen">

          {/* ======= Dropdown + Search Bar ======= */}
          <div className="flex items-center justify-between flex-wrap space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <label
                  htmlFor="category"
                  className="block mb-1 text-sm font-medium text-gray-700"
                ></label>
                <select
                  name="category"
                  value={selectedCategory?.categoriesname || ""}
                  onChange={(e) => {
                    const selected = categories.find(
                      (cat) => cat.categoriesname === e.target.value
                    );

                    // Default case: "All Materials"
                    if (!selected) {
                      setSelectedCategory(null);
                      fetchTableData(); // fetch all data
                      return;
                    }

                    setSelectedCategory(selected);
                    fetchTableData(selected.categoryId); // fetch by category
                  }}
                  className="p-2 rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-300 w-[200px]"
                >
                  <option value="">All Materials</option>
                  {categories?.map((category, i) => (
                    <option key={i} value={category.categoriesname}>
                      {category.categoriesname}
                    </option>
                  ))}
                </select>
              </div>
            </div>

              {/* Search Bar */}
    <div className="relative w-[250px]">
      <input
        id="search"
        type="text"
        placeholder="Search material..."
        className="w-full h-[42px] pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
        value={searchTerm}
        onChange={handleSearch}
      />
      {/* Search Icon */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35m1.15-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
        />
      </svg>
    </div>
          </div>

         <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
            <table className="min-w-full table-auto text-sm border-collapse">
              <thead className="sticky top-0 bg-white border-b-2 border-black text-[16px] font-medium">
                <tr>
                  <th className="p-5 text-center">S.No</th>
                  {[
                    "Material Name",
                    "Category",
                    "Quantity",
                    "Average Cost",
                    "Status",
                    "Stage",
                    "Allocation Date",
                    "Allocated User",
                    "Location",

                  ].map((col, i) => (
                    <th key={i} className="p-5 text-center">{col}</th>
                  ))}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {paginate(filteredData).map((item, index) => {
                  // status & stage color classes
                  const getColor = (value) => {
                    if (value === "Approved") return "text-green-600 font-semibold";
                    if (value === "Rejected") return "text-red-600 font-semibold";
                    if (value === "Pending") return "text-yellow-600 font-semibold";
                    return "text-gray-700";
                  };

                  const formattedDate = item.allocation_date
                    ? new Date(item.allocation_date).toLocaleDateString()
                    : "N/A";

                  const location = [
                    item.building_no && `Bldg: ${item.building_no}`,
                    item.floor && `Flr: ${item.floor}`,
                    item.room && `Room: ${item.room}`,
                    item.section && `Sec: ${item.section}`,
                    item.locality && item.locality,
                    item.city && item.city,
                  ]
                    .filter(Boolean)
                    .join(", ");

                  return (
                    <tr
                      key={item.mapping_id}
                      className={`${
                        index % 2 === 0 ? "bg-blue-50" : "bg-white"
                      } hover:bg-blue-100`}
                    >
                      <td className="px-5 py-3 text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-5 py-3 text-center">{item.material_name}</td>
                      <td className="px-5 py-3 text-center">{item.categoriesname}</td>
                      <td className="px-5 py-3 text-center">{item.quantity}</td>
                      <td className="px-5 py-3 text-center">{item.average_cost}</td>
                      <td className={`px-5 py-3 text-center ${getColor(item.status)}`}>
                        {item.status || "N/A"}
                      </td>
                      <td className={`px-5 py-3 text-center ${getColor(item.stage)}`}>
                        {item.stage || "N/A"}
                      </td>
                      <td className="px-5 py-3 text-center">{formattedDate}</td>
                      <td className="px-5 py-3 text-center">{item.mapped_user}</td>
                      <td className="px-5 py-3 text-center text-gray-800">
                        {location || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ======= Pagination ======= */}
          {totalPages > 1 && (
            <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
              <button
                onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
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
                onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
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
  </div>


    {/* Message Modal */}
    <MessageModal
      message={message}
      type={messageType}
      setMessage={setMessage}
    />
  </div>
);

};
export default AssetManagementPage;
