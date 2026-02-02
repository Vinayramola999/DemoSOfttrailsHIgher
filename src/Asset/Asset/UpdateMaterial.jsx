import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Modal, Box } from "@mui/material";
import {
  FaHome,
  FaSignOutAlt,
  FaEdit,
  FaEye,
  faQrcode,
  FaPlusCircle,
} from "react-icons/fa";

import { useLocation, useNavigate } from "react-router-dom";
//
import axios from "axios";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const UpdateMaterial = () => {
  const location = useLocation();
  console.log("location state", location.state);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(
    location?.state?.category || ""
  );
  const [tableData, setTableData] = useState({ columns: [], data: [] });
  const [searchTerm, setSearchTerm] = useState(
    location?.state?.requestAsset || ""
  ); // State for search input
  const [filteredData, setFilteredData] = useState([]); // State for filtered table data
  const [editingAssetId, setEditingAssetId] = useState(null); // State for tracking which asset is being edited

  const [formErrors, setFormErrors] = useState({}); // To store form validation errors from backend
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

  const [selectedLocation, setSelectedLocation] = useState(
    isSubmitMapModalState?.locationId || ""
  ); // Track selected location

  const [openQtyModal, setOpenQtyModal] = useState(false);
  const [selectedForQtyUpdate, setSelectedForQtyUpdate] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState("");
  const [totalCost, setTotalCost] = useState("");

  const handleDownloadQrCode = () => {
    const canvas = document.getElementById("qrCodeCanvas"); // Get the canvas element by its ID
    const imageUrl = canvas.toDataURL("image/png"); // Convert the canvas to a PNG image URL

    // Create a link to download the image
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "qr_code.png"; // Set the file name for the downloaded image
    link.click(); // Trigger the download
  };
  const [mappingType, setMappingType] = useState(null); // 'user-only' or 'user-with-location'

  // Fetch categories when the component mounts
 useEffect(() => {
  const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
       `${JAVA_BASE}api/categories/rawmaterials`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token pass
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
            Authorization: `Bearer ${token}`, // ✅ Token pass
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
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
        }
      );
      setAllUsers(userResponse.data || []);
    } catch (error) {
      console.log("Error fetching users", error);
    }
  };

  fetchCategories();
  fetchTableData();
  fetchLocations();
  fetchAllUsers();
}, []);


const fetchTableData = async (categoryName = selectedCategory) => {
  setIsLoading(true); // Show loading before fetching
  const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

  if (!token) {
    console.error("Token is missing in sessionStorage.");
    setFormErrors({
      general: "User not logged in or token is missing.",
    });
    setIsLoading(false);
    return;
  }

  try {
    console.log("Fetching table data for category:", categoryName);
    const response = await axios.get(
      `${ASSET_NODE_BASE}getColumnTypesAndData/${categoryName}`,
      {
           params: {
          type:"Raw material"
         },
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      }
    );
    console.log("Fetched data:", response.data);

    setTableData({
      columns: response.data.columns || [],
      data: response.data.data || [],
    });
    setDynamicFields(response.data.columns || []);
    setFilteredData(response.data.data || []);

    setFormErrors({}); // Clear previous errors
  } catch (error) {
    console.error("Error fetching table data:", error.message);
    setFormErrors({
      general: "Error fetching table data. Please try again.",
    });
  } finally {
    setIsLoading(false); // Hide loading once data is fetched or error occurs
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
  const categoryOptions = categories.map((category) => ({
  value: category.categoriesname,
  label: category.categoriesname,
}));
const handleCategoryChange = (selectedOption) => {
  const value = selectedOption.value;

  // Update form data like the old handleChange
  setFormData((prevFormData) => ({
    ...prevFormData,
    category: value,
  }));

  setSelectedCategory(value);
  fetchTableData(value);
  handleEdit(value);
};

  // Handle search term changes and update filtered data
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = tableData.data.filter((row) =>
      Object.values(row).some((val) =>
        (val ?? "").toString().toLowerCase().includes(value.toLowerCase())
      )
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
    const asset = tableData.data.find((row) => row.unique_id === unique_id);
    if (asset) {
      const parsedData = {};
      Object.keys(asset).forEach((key) => {
        const value = asset[key];
        if (key.includes("date")) {
          parsedData[key] = value ? new Date(value) : null; // Format as 'yyyy-MM-dd'
          // Handle empty or invalid dates
        } else if (typeof value === "string" && !isNaN(value)) {
          parsedData[key] = parseFloat(value);
        } else {
          parsedData[key] = value;
        }
      });
      setFormData(parsedData);
      setEditingAssetId(unique_id);
      setIsAssetModalOpen(true);
    }
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
      field !== "sub_stages" &&
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

  console.log({ userData });

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const handleHome = () => {
    navigate("/Cards");
  };

 const handleAddQuantity = async () => {
  if (!selectedForQtyUpdate || !quantityToAdd || !totalCost) {
    setMessage("Please fill all required fields.");
    setMessageType("error");
    return;
  }

  const referenceId = selectedForQtyUpdate.unique_id;
  const categoryId = selectedForQtyUpdate.category_id;
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token"); // ✅ Token fetch

  if (!userId) {
    setMessage("User ID not found in session.");
    setMessageType("error");
    return;
  }

  if (!token) {
    setMessage("Authentication token missing.");
    setMessageType("error");
    return;
  }

  const payload = {
    referenceid: referenceId,
    category_id: categoryId,
    quantity: Number(quantityToAdd),
    total_cost: Number(totalCost),
    user_id: Number(userId),
    action: "AssetAddition",
    submodule: "Raw material"
  };

  const apiUrl =`${ASSET_NODE_BASE}assets/temp-asset-quantity`;

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Token added
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200 || response.status === 201) {
      setMessage("Quantity successfully updated.");
      setMessageType("success");
      setOpenQtyModal(false);
      setQuantityToAdd("");
      setTotalCost("");
      // Optional: refreshInventory();
    } else {
      setMessage("Failed to update quantity. Please try again.");
      setMessageType("error");
    }
  } catch (error) {
    console.error("Error updating quantity:", error);
    setMessage("Something went wrong while updating quantity.");
    setMessageType("error");
  }
};


  const parseResponse = async (response) => {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json(); // Parse as JSON
    } else {
      return await response.text(); // Parse as plain text
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
      "text-red-500",
      "text-blue-500",
      "text-green-500",
      "text-yellow-500",
      "text-purple-500",
      "text-pink-500",
      "text-orange-500",
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
        <div className=" w-full">
          <div className="p-4 md:p-5 flex flex-col space-y-6 min-h-screen">
            {/* Add Asset Button, Category Dropdown, and Search Input */}
            <div className="flex items-center justify-between flex-wrap space-y-4 md:space-y-0">
              {/* Left Section: Add Asset Button and Category Dropdown */}
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <label
                    htmlFor="category"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  ></label>
                <Select
  options={categoryOptions}
  value={categoryOptions.find((opt) => opt.value === selectedCategory)}
  onChange={handleCategoryChange}
  placeholder="Select Material Category"
  className="w-[250px] text-sm"
  isSearchable
  required
/>
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

            {/* Inventory Table */}
            <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
                <table className="min-w-full table-auto text-sm border-collapse">
                  <thead className="sticky top-0  bg-white border-b-2 border-black text-[16px] font-medium ">
                    <tr>
                      {selectedCategory && (
                        <th className="p-5 text-center">S.no</th>
                      )}
                      {[
                        "Material Name",
                        "Created On",
                        "Status",
                        "Stage",
                        "Sub Stage",
                      ].map((column, index) => (
                        <th
                          key={index}
                          className="p-5 text-center "
                        >
                          {column}
                        </th>
                      ))}
                      {selectedCategory && (
                        <th className="p-5 text-center">Action</th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginate(
                      filteredData.filter(
                        (asset) => asset.status === "Inventory"
                      )
                    ).map((asset, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className={`cursor-pointer ${
                            index % 2 === 0 ? "bg-blue-50" : "bg-white"
                          } hover:bg-blue-100`}
                          onClick={() => setSelectedAsset(asset)}
                        >
                          {selectedCategory && (
                            <td className="px-5 py-3 text-center">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                          )}

                          {[
                            "material_name",
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
                                : asset[column] || "N/A"}
                            </td>
                          ))}

                          {selectedCategory && (
                            <td className="px-5 py-3 text-center">
                              <button
                                className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(asset.unique_id);
                                }}
                                title="View Details"
                              >
                                <FaEye className="text-sm md:text-base" />
                              </button>

                              <button
                                type="button"
                                title="Add Quantity"
                                aria-label="Add Quantity"
                                className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition duration-150 ease-in-out"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedForQtyUpdate(asset);
                                  setQuantityToAdd("");
                                  setTotalCost("");
                                  setOpenQtyModal(true);
                                }}
                              >
                                <FaPlusCircle className="text-base md:text-lg" />
                              </button>
                            </td>
                          )}
                        </tr>

                        {selectedAsset &&
                          selectedAsset.unique_id === asset.unique_id && (
                            <tr className="bg-gray-50">
                              <td
                                colSpan={selectedCategory ? 7 : 6}
                                className="p-4"
                              >
                                <div className="relative">
                                  <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold">
                                      Material Details
                                    </h3>
                                    <button
                                      onClick={() => setSelectedAsset(null)}
                                      className="text-red-600 hover:text-red-800 font-bold text-lg"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    <div>
                                      <strong>Material Name:</strong>{" "}
                                      {asset.material_name}
                                    </div>
                                    <div>
                                      <strong>Status:</strong> {asset.status}
                                    </div>
                                    <div>
                                      <strong>Stages:</strong>{" "}
                                      {formatStages(asset.stages)}
                                    </div>
                                    <div>
                                      <strong>Sub Stages:</strong>{" "}
                                      {formatStages(asset.sub_stages)}
                                    </div>
                                    <div>
                                      <strong>Original Cost:</strong>{" "}
                                      {asset.original_cost || "N/A"}
                                    </div>
                                    <div>
                                      <strong>Created At:</strong>{" "}
                                      {formatDate(asset.created_at)}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
                  <button
                    onClick={() =>
                      handlePageChange(Math.max(currentPage - 1, 1))
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
                      handlePageChange(Math.min(currentPage + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
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
                      {editingAssetId ? "Review Asset" : "Add Asset"}
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
                  <form className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                      <label
                        htmlFor="category"
                        className="mb-1 text-sm font-medium text-gray-700"
                      >
                        Asset Category
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
                            "sub_stages",
                            "toapprove",
                          ].includes(column.columnName)
                      )
                      .map((field, index) => {
                        // Make specific fields editable
                        const isEditableField = [
                          "Original Cost",
                          "Useful Life",
                          "Scrap Value",
                        ].includes(field.columnName);

                        // Format the date fields without the time and timezone
                        const fieldValue = field.columnName.includes("Date")
                          ? formData[field.columnName]
                            ? new Date(formData[field.columnName])
                                .toISOString()
                                .split("T")[0] // Format date
                            : ""
                          : formData[field.columnName] || "";

                        return (
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
                              value={fieldValue}
                              onChange={handleChange}
                              className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
                              disabled={!isEditableField} // Disable only non-editable fields
                            />
                            {/* Display backend validation errors for this field */}
                            {formErrors[field.columnName] && (
                              <span className="text-red-600 text-sm">
                                {formErrors[field.columnName]}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    {/* Show general error */}
                    {formErrors.general && (
                      <p className="text-red-600 text-sm">
                        {formErrors.general}
                      </p>
                    )}
                  </form>
                </div>
              </div>
            )}

            <Modal open={openQtyModal} onClose={() => setOpenQtyModal(false)}>
              <Box className="absolute top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl">
                <h2 className="text-lg font-bold mb-4">Add Quantity</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity to Add:
                    </label>
                    <input
                      type="number"
                      value={quantityToAdd}
                      onChange={(e) => setQuantityToAdd(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Cost:
                    </label>
                    <input
                      type="number"
                      value={totalCost}
                      onChange={(e) => setTotalCost(e.target.value)}
                      className="w-full p-2 border rounded-lg"
                      min="0"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setOpenQtyModal(false)}
                      className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={handleAddQuantity}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Add Quantity
                    </button>
                  </div>
                </div>
              </Box>
            </Modal>
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
export default UpdateMaterial;
