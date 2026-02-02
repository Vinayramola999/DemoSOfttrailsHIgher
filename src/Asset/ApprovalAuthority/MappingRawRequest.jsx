import React, { useState, useEffect } from "react";
import { FaHome, FaSignOutAlt, FaEdit, FaEye, faQrcode } from "react-icons/fa";
import { BiQr } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
//
import axios from "axios";
import MessageModal from "./MessageModal";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const AssetManagementPage = () => {
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tableData, setTableData] = useState({ columns: [], data: [] });
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [filteredData, setFilteredData] = useState([]); // State for filtered table data
  const [editingAssetId, setEditingAssetId] = useState(null); // State for tracking which asset is being edited

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitMapModalState, setIsSubmitMapModalState] = useState({
    isOpen: false,
  });
  const [selectedAsset, setSelectedAsset] = useState(null); // State to store the selected asset for full details
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


// ✅ New Fetch Table Data Function
 const fetchTableData = async (categoryId = null) => {
    setIsLoading(true);
    try {
      const url = categoryId
        ? `${ASSET_NODE_BASE}assets/raw-material/mapping/pending?category_id=${categoryId}`
        : `${ASSET_NODE_BASE}assets/raw-material/mapping/pending`;

      const res = await axios.get(url, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });

    let data = res.data?.data || res.data || [];

// 🔹 If data is a single object, wrap it into an array
if (!Array.isArray(data)) {
  data = [data];
}

setTableData(data);


      // Detect dynamic fields (optional)
      if (data.length > 0) {
        const keys = Object.keys(data[0]);
        setDynamicFields(keys.map((k) => ({ columnName: k })));
      }
    } catch (err) {
      console.error("Error fetching table data:", err.message);
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

const handleCategoryChange = (e) => {
  const value = e.target.value.trim();

  if (value === "All" || !value) {
    setSelectedCategory(null);
    fetchTableData(); // fetch all data
    return;
  }

  const selected = categories.find(
    (cat) =>
      cat.categoriesname?.trim().toLowerCase() === value.toLowerCase()
  );

  if (selected) {
    setSelectedCategory(selected); // ✅ full object store
    fetchTableData(selected.category_id || selected.categoryId);
  } else {
    console.warn("Category not found for:", value);
    setSelectedCategory(null);
  }
};


    const handleView = (asset) => {
    setSelectedAsset(asset);
    setIsAssetModalOpen(true);
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

const handleApproveMappedAsset = async (unique_id) => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token"); // ✅ Get token

  if (!userId) {
    console.error("User ID is missing or invalid in sessionStorage.");
    setMessage("User not logged in or user ID is missing.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    console.error("Invalid User ID retrieved from sessionStorage.");
    setMessage("Invalid User ID.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  if (!selectedCategory || !selectedCategory.categoryId) {
    console.error("No category selected or category ID missing.");
    setMessage("Invalid or missing category.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const selectedCategoryId = selectedCategory.categoryId;

  const payload = {
    category_id: selectedCategoryId,
    user_id: parsedUserId,
    new_stages: "Mapped",
    sub_stages: "Approved",
    action: "MappingApprove",
    submodule:"Raw material"
  };

  try {
    const response = await fetch(
      `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Add token here
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Approval successful:", data);

    setIsAssetModalOpen(false);
    setMessage("Asset Mapping successfully approved!");
    setMessageType("success");

    // ✅ Refresh table after approval
    if (selectedCategoryId) {
      await fetchTableData(selectedCategoryId);
    }

  } catch (error) {
    console.error("Approval failed:", error);
    setMessage("Failed to approve the asset. Please try again.");
    setMessageType("error");
    setIsAssetModalOpen(false);
  }
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
// ✅ Approve Material
// ✅ Approve Material
// ✅ Approve Material
const handleApproveMaterial = async (unique_id, asset) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage("User not authenticated.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    // 🧩 Get logged-in user ID
    const storedUser = sessionStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const user_id =
      parsedUser?.id ||
      parsedUser?._id ||
      sessionStorage.getItem("userId") ||
      userData?.id ||
      userData?._id;

    // 🧩 Category ID — directly from asset (not selectedCategory)
    const category_id = asset?.categories_id || null;

    if (!user_id || !unique_id) {
      setMessage("Missing user or asset details.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const payload = {
      user_id,
      category_id,
      action: "MappingApprove"
    
    };

    console.log("✅ Approve Payload:", payload);

    const response = await axios.put(
      `${ASSET_NODE_BASE}assets/raw-material/mapping/approve/${unique_id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("✅ Approval Response:", response.data);

    setMessage("Material approved successfully!");
    setMessageType("success");
    setIsModalOpen(true);
    setIsAssetModalOpen(false);

    await fetchTableData(selectedCategory?.category_id || null);
  } catch (err) {
    console.error("Approval failed:", err?.response?.data || err.message);
    setMessage(err?.response?.data?.error || "Failed to approve the material.");
    setMessageType("error");
    setIsModalOpen(true);
  }
};

// ✅ Reject Material
const handleRejectMaterial = async (unique_id, asset, rejectReason = "Not specified") => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setMessage("User not authenticated.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const storedUser = sessionStorage.getItem("user");
    const parsedUser = storedUser ? JSON.parse(storedUser) : null;
    const user_id =
      parsedUser?.id ||
      parsedUser?._id ||
      sessionStorage.getItem("userId") ||
      userData?.id ||
      userData?._id;

    // 🧩 Category ID — again from asset
    const category_id = asset?.categories_id || null;

    if (!user_id || !unique_id) {
      setMessage("Missing user or asset details.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const payload = {
      user_id,
      category_id,
      action: "MappingApprove",
     
    };

    console.log("🚫 Reject Payload:", payload);

    const response = await axios.put(
      `${ASSET_NODE_BASE}assets/raw-material/mapping/reject/${unique_id}`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("🚫 Rejection Response:", response.data);

    setMessage("Material rejected successfully!");
    setMessageType("success");
    setIsModalOpen(true);
    setIsAssetModalOpen(false);

    await fetchTableData(selectedCategory?.category_id || null);
  } catch (err) {
    console.error("Rejection failed:", err?.response?.data || err.message);
    setMessage(err?.response?.data?.error || "Failed to reject the material.");
    setMessageType("error");
    setIsModalOpen(true);
  }
};





 
const formatLabel = (key) => {
  if (!key) return "";

  return key
    .replace(/_/g, " ") // replace underscores
    .replace(/([a-z])([A-Z])/g, "$1 $2") // split camelCase
    .replace(/([a-z]+)(name|id|type|price|number|status|category|categories)/gi, "$1 $2") // insert space in lowercase combos
    .replace(/\b\w/g, (char) => char.toUpperCase()) // capitalize words
    .trim();
};

return (
  <div className="p-4">
    {/* 🔹 Dropdown Filter */}
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <select
        name="category"
        value={selectedCategory?.categoriesname || ""}
        onChange={handleCategoryChange}
        className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[300px]"
      >
        <option value="">Select Material Category</option>
        <option value="All">All Materials</option>
        {categories.map((cat, idx) => (
          <option key={idx} value={cat.categoriesname}>
            {cat.categoriesname}
          </option>
        ))}
      </select>
    </div>

    {/* 🔹 Table Section */}
 <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
  <div className="flex flex-col max-h-[70vh] overflow-y-auto">
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto border-collapse">
        <thead className="text-[16px] font-medium bg-white sticky top-0 z-10 border-b-2 border-black">
          <tr>
            <th className="p-5 text-left">S.no </th>
            <th className="p-5 text-left">Material Name</th>
            <th className="p-5 text-left">Category</th>
            <th className="p-5 text-left">Quantity</th>
           
            <th className="p-5 text-left">Status</th>
            <th className="p-5 text-left">Stage</th>
            <th className="p-5 text-left">Location</th>
            <th className="p-5 text-left">Action</th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(tableData) && tableData.length > 0 ? (
            tableData.map((item, idx) => (
              <tr
                key={item.mapping_id || idx}
                className={`${
                  idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                } hover:bg-blue-100 transition`}
              >
                {/* 🔹 Serial Number */}
                <td className="px-5 py-3 font-medium text-gray-800">
                  {idx + 1}
                </td>

                {/* 🔹 Material Name */}
                <td className="px-5 py-3">{item.material_name || "N/A"}</td>

                {/* 🔹 Category Name */}
                <td className="px-5 py-3">
                  {item.categoriesname
                    ? item.categoriesname
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : "N/A"}
                </td>

                {/* 🔹 Quantity */}
                <td className="px-5 py-3">{item.quantity || "N/A"}</td>


                {/* 🔹 Status */}
                <td className="px-5 py-3 font-medium text-green-600">
                  {item.status || "Pending"}
                </td>

                {/* 🔹 Stage */}
                <td className="px-5 py-3 font-medium text-blue-600">
                  {item.stage || "N/A"}
                </td>

                {/* 🔹 Location (Single Column) */}
                <td className="px-5 py-3 text-sm text-gray-700">
                  {[
                    item.building_no && `Building ${item.building_no}`,
                    item.floor && `Floor ${item.floor}`,
                    item.room && `Room ${item.room}`,
                    item.section && `Section ${item.section}`,
                    item.locality,
                    item.city,
                    item.state,
                    item.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "N/A"}
                </td>

                {/* 🔹 Action */}
                <td className="px-5 py-3 text-blue-600 cursor-pointer">
                  <FaEye onClick={() => handleView(item)} />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="9"
                className="py-6 px-4 text-center text-gray-500"
              >
                No materials found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
</div>


    {/* ⏳ Loading */}
    {isLoading && (
      <div className="text-center py-4 text-gray-600 italic">Loading...</div>
    )}

    {/* 🔹 Modal */}
    {isAssetModalOpen && selectedAsset && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
        <div className="bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl p-6 transition-all duration-300 overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Material Details
            </h2>
            <button
              onClick={() => setIsAssetModalOpen(false)}
              className="text-red-500 text-xl hover:text-red-700"
            >
              ✕
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(selectedAsset).map(([key, value]) => {
              if (
                [
                  "mapping_id",
                  "material_id",
                  "categories_id",
                  "sub_location_id",
                  "user_id",
                  "building_no",
                  "floor",
                  "room",
                  "section",
                  "locality",
                  "city",
                  "state",
                  "country",
                  "stage",
                  "status",
                  "sublocation_id",
                  "approved_user",
                  "approved_by",
                  "code",
                  "created_by"
                ].includes(key)
              )
                return null;

              const formattedLabel = formatLabel(key);

              return (
                <div key={key} className="flex flex-col">
                  <label className="mb-1 text-sm font-medium text-gray-700">
                    {formattedLabel}
                  </label>
                  <input
                    readOnly
                    value={value ?? "N/A"}
                    className="p-2 rounded-md border border-gray-300 bg-gray-50"
                  />
                </div>
              );
            })}

            {/* 📍 Location */}
            <div className="col-span-full flex flex-col">
              <label className="mb-1 text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="p-3 rounded-md border border-gray-300 bg-gray-50 text-sm text-gray-700 leading-relaxed break-words">
                {[
                  selectedAsset.building_no && `Building ${selectedAsset.building_no}`,
                  selectedAsset.floor && `Floor ${selectedAsset.floor}`,
                  selectedAsset.room && `Room ${selectedAsset.room}`,
                  selectedAsset.section && `Section ${selectedAsset.section}`,
                  selectedAsset.locality,
                  selectedAsset.city,
                  selectedAsset.state,
                  selectedAsset.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6">
           <button
  onClick={() => handleApproveMaterial(selectedAsset.mapping_id, selectedAsset)}
  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
>
  ✅ Approve
</button>

<button
  onClick={() => handleRejectMaterial(selectedAsset.mapping_id, selectedAsset)}
  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition"
>
  ❌ Reject
</button>

          </div>
        </div>
      </div>
    )}

    {/* Message Modal */}
    <MessageModal message={message} type={messageType} setMessage={setMessage} />
  </div>




  );
};
export default AssetManagementPage;
