import React, { useState, useEffect,useCallback,useMemo } from "react";
import { FaHome, FaSignOutAlt, FaEdit, FaTrash, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete confirmation modal
  const [assetToDelete, setAssetToDelete] = useState(null); // Store asset ID to delete
  const [formErrors, setFormErrors] = useState({}); // To store form validation errors from backend

  const [selectedAsset, setSelectedAsset] = useState(null); // State to store the selected asset for full details
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState(""); // State to store the type of message
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
   const [pagination, setPagination] = useState({
        total: 0,
        limit: 20,
        offset: 0,
        nextOffset: null,
        prevOffset: null,
      });
      
      const [debounceTimer, setDebounceTimer] = useState(null);
      
      const [isPaginating, setIsPaginating] = useState(false);
  // Fetch categories when the component mounts
 useEffect(() => {
  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token"); // ✅ Get token
      const response = await axios.get(
        `${JAVA_BASE}api/categories/movable`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Include token
            "Content-Type": "application/json",
          },
        }
      );
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error.message);
    }
  };

  fetchCategories();
  fetchTableData();
}, []);

  
useEffect(() => {
  if (selectedCategory) {
    fetchTableData(selectedCategory);
  }
}, [selectedCategory]);

const fetchTableData = async (
  categoryName = selectedCategory,
  offset = 0,
  limit = itemsPerPage,
  search = searchTerm
) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Token is missing in sessionStorage.");
      return;
    }

    const params = {
      offset,
      limit,
      status: "Inventory",
      search,
      // ✅ Moved filtering logic to API
      stages: "Damage", 
      sub_stages: "AwaitingApproval",
      type:"Movable",
    };

    const response = await axios.get(
      `${ASSET_NODE_BASE}getColumnTypesAndData/${categoryName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params,
      }
    );

    const { columns = [], data = [], pagination = {} } = response.data || {};

    // ✅ Update table + pagination
    setTableData({ columns, data });
    setDynamicFields(columns);
    setFilteredData(data);

    setPagination({
      total: pagination.total ?? data.length,
      limit: pagination.limit ?? limit,
      offset: pagination.offset ?? offset,
      nextOffset:
        pagination.nextOffset !== undefined && pagination.nextOffset !== null
          ? Number(pagination.nextOffset)
          : null,
      prevOffset:
        pagination.prevOffset !== undefined && pagination.prevOffset !== null
          ? Number(pagination.prevOffset)
          : null,
    });
  } catch (error) {
    console.error("Error fetching table data:", error.message);
  }
};


  // Handle the form data change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "category") {
      setSelectedCategory(value);
      fetchTableData(value);
      handleEdit(value);
    }
  };
  console.log(tableData);

  

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



const handlePageChange = useCallback(
     async (direction) => {
       if (isPaginating || !pagination) return;
       setIsPaginating(true);
   
       const totalPages = Math.ceil(pagination.total / pagination.limit);
       const currentPageIndex =
         Math.floor(pagination.offset / pagination.limit) + 1;
   
       let newOffset = pagination.offset;
   
       if (direction === "next") {
         if (pagination.offset + pagination.limit >= pagination.total) return;
         newOffset =
           pagination.nextOffset ??
           (pagination.offset + pagination.limit < pagination.total
             ? pagination.offset + pagination.limit
             : pagination.offset);
         setCurrentPage((prev) => Math.min(prev + 1, totalPages));
       } else if (direction === "prev") {
         if (pagination.offset <= 0) return;
         newOffset =
           pagination.prevOffset ??
           (pagination.offset - pagination.limit >= 0
             ? pagination.offset - pagination.limit
             : 0);
         setCurrentPage((prev) => Math.max(prev - 1, 1));
       }
   
       console.log(`🔹 Changing Page: ${direction}, Offset → ${newOffset}`);
       await fetchTableData(selectedCategory, newOffset, pagination.limit, searchTerm);
   
       setTimeout(() => setIsPaginating(false), 300);
     },
     [pagination, selectedCategory, fetchTableData, isPaginating, searchTerm]
   );


  const handleEdit = (unique_id) => {
    const asset = tableData.data.find((row) => row.unique_id === unique_id);
    if (asset) {
      setFormData(asset);
      setEditingAssetId(unique_id);
      setIsAssetModalOpen(true);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
    const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits for day

    return `${year}-${month}-${day}`;
  };


  const filteredDynamicFields = dynamicFields.filter(
    (field) =>
      field !== "unique_id" &&
      field !== "created_at" &&
      field !== "status" &&
      field !== "sub_stages" &&
      field !== "stages"
  );


  const userId = sessionStorage.getItem("userId");
  const [userData, setUserData] = useState("");
  const navigate = useNavigate();
  const getToken = () => {
    const token = sessionStorage.getItem("token");
    return token;
  };
  const token = getToken();
  console.log("Retrieved token:", token);

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

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.post(
         `${MAIN_BASE}users/verify-token`,
          { token }
        );
        console.log("Token is valid:", response.data);
        navigate("/AllTab");
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
    verifyToken();
  }, [token, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const handleHome = () => {
    navigate("/Cards");
  };


 const handleRepair = async (unique_id) => {
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

  if (!selectedCategory) {
    console.error("No category selected.");
    setMessage("Please select a category.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const selectedCategoryObj = categories.find(
    (category) => category.categoriesname === selectedCategory
  );

  if (!selectedCategoryObj) {
    console.error("Category not found in the categories list.");
    setMessage("Invalid or missing category.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const selectedCategoryId = selectedCategoryObj.categoryId;
  console.log("Selected Category ID:", selectedCategoryId);

  const asset = tableData?.data?.find((a) => a.unique_id === unique_id);
  if (!asset) {
    console.error("Asset not found in local data.");
    setMessage("Asset data not found.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const previousStages = asset?.stages || "";
  const previousSubStages = asset?.sub_stages || "";
  const previousStatus = asset?.status || "";
  const assetname = asset?.["Asset Name"] || "";

  const newStage = "SendForRepair";
  const newSubStage = "Approved";

  const payload = {
    category_id: selectedCategoryId,
    user_id: parsedUserId,
    new_stages: newStage,
    sub_stages: newSubStage,
    action: "RepairApprove",
    submodule: "Movable"
  };

  try {
    const response = await fetch(
      `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Include token
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    console.log("Approval successful:", data);

    const historyPayload = {
      assetId: unique_id,
      categoryId: selectedCategoryId,
      updatedBy: parsedUserId,
      assetname,
      previousSubStages,
      currentSubStages: newSubStage,
      previousStatus,
      currentStatus: newStage,
      previousStages,
      currentStages: newStage,
      action: "Asset Repair Request Approved",
    };

    const historyRes = await fetch(
      `${JAVA_BASE}api/assethistory/insert-history`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Include token
        },
        body: JSON.stringify(historyPayload),
      }
    );

    if (!historyRes.ok) throw new Error("Failed to log asset history");
   
    await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);
    setIsAssetModalOpen(false);
    setMessage("Asset Repair Request Approved Successfully!");
    setMessageType("success");
  } catch (error) {
    console.error("Approval failed:", error);
    setMessage("Failed to Repair the asset. Please try again.");
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
    const categoryOptions = categories.map((category) => ({
  value: category.categoriesname,
  label: category.categoriesname,
}));

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex">
        <div className=" w-full">
          <div className="p-4 md:p-5 flex flex-col space-y-6 min-h-screen">
            {/* Add Asset Button, Category Dropdown, and Search Input */}
            <div className="flex items-center justify-between flex-wrap space-y-4 md:space-y-0">
              {/* Left Section: Add Asset Button and Category Dropdown */}
              <div className="flex items-center space-x-4">
                {/* Inventory Tabs */}
                {/* <InventoryTabs
                selectedCategory={selectedCategory}
                categories={categories}
                handleChange={handleChange}
              /> */}

                <div className="flex flex-col">
                  <label
                    htmlFor="category"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  ></label>
                                 <div className="w-[250px]"></div>
                   <Select
      options={categoryOptions}
      value={categoryOptions.find((opt) => opt.value === selectedCategory)}
      onChange={(selectedOption) =>
        setFormData((prev) => ({
          ...prev,
          category: selectedOption.value,
        })) || setSelectedCategory(selectedOption.value)
      }
      placeholder="Select Asset category"
      className="react-select-container"
     classNamePrefix="react-select"
      isSearchable
    />
                </div>
              </div>

              {/* Right Section: Search Bar */}
<div className="relative w-[250px] mt-4 md:mt-0">
  <input
    type="text"
    placeholder="Search assets..."
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

         {/* Damaged Asset Table */}
<div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
   <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
                 {useMemo(() => (
                <table className="min-w-full table-auto text-sm border-collapse">
                  <thead className="sticky top-0 bg-white border-b-2 border-black text-[16px] font-medium ">
                    <tr>
                      {selectedCategory && (
                        <th className="p-5 text-center">S.no</th>
                      )}

                      {[
                        "Asset Name",
                        "Created On",
                        "Status",
                        "Stage",
                        "Sub Stage",
                      ].map((column, index) => (
                        <th key={index} className="p-5 text-center ">
                          {column}
                        </th>
                      ))}

                      {selectedCategory && (
                        <th className="p-5 text-center">Action</th>
                      )}
                    </tr>
                  </thead>

                <tbody className="bg-white divide-y divide-gray-200">
  {Array.isArray(filteredData) && filteredData.length > 0 ? (
    filteredData.map((asset, index) => (
      <React.Fragment key={asset.unique_id || index}>
        <tr
          className={`cursor-pointer ${
            index % 2 === 0 ? "bg-blue-50" : "bg-white"
          } hover:bg-blue-100`}
          onClick={() => (asset)}
        >
          {selectedCategory && (
            <td className="px-5 py-3 text-center">
              {(pagination.offset ?? 0) + index + 1}
            </td>
          )}

          {[
            "Asset Name",
            "created_at",
            "status",
            "stages",
            "sub_stages",
          ].map((column, colIndex) => (
            <td
              key={colIndex}
              className="px-5 py-3 text-center truncate"
              title={asset[column]}
            >
              {column === "created_at"
                ? formatDate(asset[column])
                : column === "stages" || column === "sub_stages"
                ? formatStages(asset[column])
                : asset[column] || ""}
            </td>
          ))}

          {selectedCategory && (
            <td className="px-5 py-3 text-center">
              <button
                className="text-red-600 hover:text-red-800"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(asset.unique_id);
                }}
              >
                <FaEye className="text-base" />
              </button>
            </td>
          )}
        </tr>

        {selectedAsset && selectedAsset.unique_id === asset.unique_id && (
          <tr className="bg-gray-50">
            <td
              colSpan={selectedCategory ? 7 : 6}
              className="px-5 py-4 text-left"
            >
              <div className="relative">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Asset Details</h3>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="text-red-600 hover:text-red-800 font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <strong>Asset Name:</strong> {asset["Asset Name"]}
                  </div>
                  <div>
                    <strong>Status:</strong> {asset.status}
                  </div>
                  <div>
                    <strong>Stages:</strong> {asset.stages}
                  </div>
                  <div>
                    <strong>Original Cost:</strong> {asset.original_cost}
                  </div>
                  <div>
                    <strong>Created At:</strong> {formatDate(asset.created_at)}
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    ))
  ) : (
    <tr>
      <td
        colSpan={selectedCategory ? 7 : 6}
        className="py-6 text-center text-gray-500 italic"
      >
        No assets found.
      </td>
    </tr>
  )}
</tbody>

                </table>
                ), [filteredData, pagination.offset, selectedCategory])}
              </div>


                            {/* Pagination */}
 {pagination.total > pagination.limit && (
  <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
   <button
  onClick={() => handlePageChange("prev")}
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
  {Math.ceil((pagination.total ?? 0) / (pagination.limit ?? itemsPerPage))}
</span>

<button
  onClick={() => handlePageChange("next")}
  disabled={currentPage === Math.ceil(pagination.total / pagination.limit)}
  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
>
  &gt;
</button>

  </div>
)}
</div>

            {/* Modal Section */}
            {isAssetModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2">
                  <div className="flex justify-between items-center bg-gray-100 p-4 rounded-t-lg">
                    <h2 className="text-lg font-bold text-gray-800">
                      {editingAssetId ? " Review Asset" : "Add Asset"}
                    </h2>
                    <button
                      onClick={() => setIsAssetModalOpen(false)}
                      className="text-red-500"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <form
             
                    className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
                  >
                    <div className="flex flex-col">
                      <label
                        htmlFor="category"
                        className="mb-1 text-sm font-medium text-gray-700"
                      >
                        Category
                      </label>
                      <select
                        name="category"
                        value={selectedCategory}
                        onChange={handleChange}
                        className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
                        disabled
                      >
                        <option value="">Select Asset category</option>
                        {categories.map((category, i) => (
                          <option key={i} value={category.categoriesname}>
                            {category.categoriesname}
                          </option>
                        ))}
                      </select>
                    </div>
                    {filteredDynamicFields
                       .filter(
                        (column) =>
                          ![
                            "unique_id",
                            "category_id",
                            "status",
                            "stages",
                            "created_at",
                            "id",
                            "location_details",
                            "toapprove",
                          ].includes(column.columnName)
                      )
                      .map((field, index) => (
                        <div key={index} className="flex flex-col">
                          <label
                            htmlFor={field.columnName}
                            className="mb-1 text-sm font-medium text-gray-700"
                          >
                            {field.columnName}
                          </label>
                          <input
                            type="text"
                            name={field.columnName}
                            value={formData[field.columnName] || ""}
                            onChange={handleChange}
                            className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
                            disabled
                          />
                          {/* Display backend validation errors for this field */}
                          {formErrors[field.columnName] && (
                            <span className="text-red-600 text-sm">
                              {formErrors[field.columnName]}
                            </span>
                          )}
                        </div>
                      ))}
                           
                    {/* Show general error */}
                    {formErrors.general && (
                      <p className="text-red-600 text-sm">
                        {formErrors.general}
                      </p>
                    )}
                    <div className="col-span-2 flex justify-end mt-4">
               
                      <button
                        type="button"
                        onClick={() => handleRepair(editingAssetId)}
                        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                      >
                        Approve
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
        
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
