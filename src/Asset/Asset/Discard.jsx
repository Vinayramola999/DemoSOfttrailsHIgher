import React, { useState, useEffect } from "react";
import { FaHome, FaSignOutAlt, FaEdit, FaTrash, FaEye } from "react-icons/fa";
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
  const [itemsPerPage] = useState(15);
  // Fetch categories when the component mounts
useEffect(() => {
  const fetchCategories = async () => {
    const token = sessionStorage.getItem("token"); // Get token
    try {
      const response = await axios.get(
        `${JAVA_BASE}api/categories/onlyPublish`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include token
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

// Fetch dynamic fields and table data based on the selected category
const fetchTableData = async (categoryName = selectedCategory) => {
  const token = sessionStorage.getItem("token"); // Get token
  try {
    const response = await axios.get(
      `${ASSET_NODE_BASE}table-data/${categoryName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Include token
        },
      }
    );

    setTableData({
      columns: response.data.columns || [],
      data: response.data.data || [],
    });
    setDynamicFields(response.data.columns || []);
    setFilteredData(response.data.data || []); // Initialize filtered data
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

  // Handle form submission (Create or Update)
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const token = sessionStorage.getItem("token"); // Get token
    const { category, ...payloadToSend } = formData;

    const url = editingAssetId
      ? `${JAVA_BASE}api/crud/update/${selectedCategory}/${editingAssetId}` // Update
      : `${JAVA_BASE}api/tables/insert/${selectedCategory}`; // Create new

    const method = editingAssetId ? "post" : "post";

    const response = await axios[method](url, payloadToSend, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Include token
      },
    });

    // If the backend returns errors, set them in formErrors state
    if (response.data.errors) {
      setFormErrors(response.data.errors); // Backend validation errors
    } else {
      console.log("Form submitted successfully:", response.data);

      // If editing, update the data in the table with the new values instead of adding a new asset
      if (editingAssetId) {
        const updatedData = tableData.data.map((row) =>
          row.unique_id === editingAssetId
            ? { ...row, ...response.data }
            : row
        );
        setTableData((prevState) => ({
          ...prevState,
          data: updatedData,
        }));
      } else {
        // If creating a new asset, just add the new asset to the table
        setTableData((prevState) => ({
          ...prevState,
          data: [...prevState.data, response.data],
        }));
      }

      // After submitting, close the modal and reset the editing state
      setIsAssetModalOpen(false);
      setEditingAssetId(null); // Reset editing state
      setFormErrors({}); // Clear any previous errors
    }
  } catch (error) {
    console.error("Error submitting form:", error.message);
    setFormErrors({ general: "An error occurred. Please try again." }); // Show a general error if the request fails
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

  // Delete asset function
  const handleDelete = (unique_id) => {
    if (unique_id) {
      setAssetToDelete(unique_id); // Store the unique_id of the asset to delete
      setIsDeleteModalOpen(true); // Open the delete confirmation modal
    } else {
      console.error("Asset unique_id is undefined or invalid");
    }
  };
  // Confirm delete action
const confirmDelete = async () => {
  if (assetToDelete !== null) {
    try {
      const token = sessionStorage.getItem("token"); // Get token
      const url = `${JAVA_BASE}api/crud/delete/${selectedCategory}/${assetToDelete}`;
      
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token
        },
      });
      
      console.log("Asset deleted successfully:", response.data);

      // Remove deleted asset from tableData
      setTableData((prevState) => ({
        ...prevState,
        data: prevState.data.filter(
          (asset) => asset.unique_id !== assetToDelete
        ),
      }));

      // Close the modal after successful deletion
      setIsDeleteModalOpen(false);
      setAssetToDelete(null); // Clear the asset to delete
    } catch (error) {
      console.error("Error deleting asset:", error.message);
      setIsDeleteModalOpen(false); // Close the modal if there's an error
    }
  } else {
    console.error("No asset unique_id found for deletion");
  }
};


  // Cancel delete action
  const cancelDelete = () => {
    setIsDeleteModalOpen(false); // Just close the modal without deleting
    setAssetToDelete(null); // Clear the asset to delete
  };

  // Edit asset function
  const handleEdit = (unique_id) => {
    const asset = tableData.data.find((row) => row.unique_id === unique_id);
    if (asset) {
      setFormData(asset);
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
        navigate("/RepoAllTab");
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

  //   const handleMapped = async (unique_id) => {
  //     // 1. Get the userId from sessionStorage
  //     const userId = sessionStorage.getItem('userId'); // Assuming the userId is stored as a string in sessionStorage

  //     if (!userId) {
  //       console.error("User ID is missing or invalid in sessionStorage.");
  //       alert("User not logged in or user ID is missing.");
  //       return;
  //     }

  //     const parsedUserId = parseInt(userId, 10); // Convert userId to an integer

  //     if (isNaN(parsedUserId)) {
  //       console.error("Invalid User ID retrieved from sessionStorage.");
  //       alert("Invalid User ID.");
  //       return;
  //     }

  //     // 2. Ensure selectedCategory is available and fetch the corresponding category ID
  //     if (!selectedCategory) {
  //       console.error("No category selected.");
  //       alert("Please select a category.");
  //       return;
  //     }

  //     // Find the category object from the categories array based on selectedCategory (category name)
  //     const selectedCategoryObj = categories.find(
  //       (category) => category.categoriesname === selectedCategory
  //     );

  //     if (!selectedCategoryObj) {
  //       console.error("Category not found in the categories list.");
  //       alert("Invalid or missing category.");
  //       return;
  //     }

  //     const selectedCategoryId = selectedCategoryObj.categoryId; // Get the category ID
  //     console.log("Selected Category ID:", selectedCategoryId);

  //     // 3. Fetch locationId dynamically from the location API
  //     let locationId;
  //     try {
  //       const locationResponse = await fetch('https://saaspro.softtrails.net/saas/main/pro/loc'); // Adjust the API endpoint as necessary
  //       if (!locationResponse.ok) {
  //         throw new Error(`Failed to fetch location. Status: ${locationResponse.status}`);
  //       }
  //       const locationData = await locationResponse.json();

  //       // Assuming the API returns an array of locations, and you need to pick one (customize as needed)
  //       if (locationData && locationData.length > 0) {
  //         locationId = locationData[0].location_id; // Modify to match the actual response structure
  //         console.log("Fetched Location ID:", locationId);
  //       } else {
  //         console.error("No location data found.");
  //         alert("Failed to fetch location details.");
  //         return;
  //       }
  //     } catch (error) {
  //       console.error("Error fetching location ID:", error);
  //       alert("Failed to fetch location details. Please try again.");
  //       return;
  //     }

  //     // 4. Prepare the payload
  //     const payload = {
  //       assetId: unique_id, // Use the unique ID of the asset
  //       locationId: locationId,

  //       categoryId: selectedCategoryId, // Use the category ID
  //       userId: parsedUserId // Use the parsed userId
  //     };

  //     console.log("Payload:", payload);

  //     // 5. Make the API call to map the asset
  //     try {
  //       const response = await fetch('https://saaspro.softtrails.net/saas/java/pro/api/assetmapping', {
  //         method: "POST", // Adjust method as required by your API
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload),
  //       });

  //       if (!response.ok) {
  //         throw new Error(`Error: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       console.log("Mapping successful:", data);
  //       setIsAssetModalOpen(false); // Close the modal
  //       alert("Asset mapped successfully!");
  //     } catch (error) {
  //       console.error("Mapping failed:", error);
  //       alert("Failed to map the asset. Please try again.");
  //     }
  //   };

const handleDiscard = async (unique_id) => {
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
    setMessage("Please select a category.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const selectedCategoryObj = categories.find(
    (category) => category.categoriesname === selectedCategory
  );
  if (!selectedCategoryObj) return;

  const payload = {
    category_id: selectedCategoryObj.categoryId,
    user_id: parsedUserId,
    new_stages: "Discard",
    action: "AssetApproval",
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
    console.log("Discard successful:", data);
    setIsAssetModalOpen(false);
    setMessage("Asset successfully Discarded!");
    setMessageType("success");
  } catch (error) {
    console.error("Discard failed:", error);
    setMessage("Failed to discard the asset. Please try again.");
    setMessageType("error");
    setIsAssetModalOpen(false);
  }
};

const handleRepaired = async (unique_id) => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  if (!userId) {
    setMessage("User not logged in or user ID is missing.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) return;

  const selectedCategoryObj = categories.find(
    (category) => category.categoriesname === selectedCategory
  );
  if (!selectedCategoryObj) return;

  const payload = {
    category_id: selectedCategoryObj.categoryId,
    user_id: parsedUserId,
    new_stages: "Repaired",
    action: "AssetApproval",
  };

  try {
    const response = await fetch(
    `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    console.log("Repaired successful:", data);
    setIsAssetModalOpen(false);
    setMessage("Asset successfully sent for Repaired!");
    setMessageType("success");
  } catch (error) {
    console.error("Repaired failed:", error);
    setMessage("Failed to Repaired the asset. Please try again.");
    setMessageType("error");
    setIsAssetModalOpen(false);
  }
};

const handleactive = async (unique_id) => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  if (!userId) {
    setMessage("User not logged in or user ID is missing.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) return;

  const selectedCategoryObj = categories.find(
    (category) => category.categoriesname === selectedCategory
  );
  if (!selectedCategoryObj) return;

  const payload = {
    category_id: selectedCategoryObj.categoryId,
    user_id: parsedUserId,
    new_stages: "Active",
    action: "AssetApproval",
  };

  try {
    const response = await fetch(
      `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    console.log("Active successful:", data);
    setIsAssetModalOpen(false);
    setMessage("Asset successfully Active!");
    setMessageType("success");
  } catch (error) {
    console.error("Active failed:", error);
    setMessage("Failed to Active the asset. Please try again.");
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
                  <select
                    name="category"
                    value={selectedCategory}
                    onChange={handleChange}
                    className="p-2 rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500 bg-gray-300 w-[200px]"
                    required
                  >
                    <option value="">Select Asset category</option>
                    {categories.map((category, i) => (
                      <option key={i} value={category.categoriesname}>
                        {category.categoriesname}
                      </option>
                    ))}
                  </select>
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-300 sticky top-0">
                    {selectedCategory && (
                      <th className="px-2 md:px-4 py-2 border text-center">
                        S.no
                      </th>
                    )}

                    {/* Displaying essential columns */}
                    {["Asset Name", "Created On", "Status", "Stage"].map(
                      (column, index) => (
                        <th
                          key={index}
                          className="px-2 md:px-4 py-2 border font-bold text-center"
                        >
                          {column.charAt(0).toUpperCase() +
                            column.slice(1).replace("_", " ")}
                        </th>
                      )
                    )}

                    {/* {selectedCategory && (
                      <th className="px-2 md:px-4 py-2 border text-center">
                        Action
                      </th>
                    )} */}
                  </tr>
                </thead>

                <tbody>
                  {paginate(
                    filteredData.filter(
                      (asset) =>
                        asset.stages === "Discard" 
                        
                    ) // Filter for "Damaged" stages
                  ).map((asset, index) => (
                    <React.Fragment key={index}>
                      {/* Row displaying essential columns */}
                      <tr
                        className={`${
                          index % 2 === 0 ? "bg-blue-50" : "bg-white"
                        } hover:bg-blue-200 cursor-pointer`}
                        onClick={() => (asset)} // Add click handler here
                      >
                        {/* S.no */}
                        {selectedCategory && (
                          <td className="px-2 md:px-4 py-2 border text-center">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                        )}

                        {/* Displaying basic columns */}
                        {["Asset Name", "created_at", "status", "stages"].map(
                        (column, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-2 md:px-4 py-2 border text-center "
                          >
                            {column === "created_at"
                              ? formatDate(asset[column]) // Format date for created_at
                              : column === "stages" || column === "sub_stages"
                              ? formatStages(asset[column]) // Format stages
                              : asset[column] || ""}
                          </td>
                        )
                      )}

                        {/* Action Column */}
                        {/* {selectedCategory && (
                          <td className="px-2 md:px-4 py-2 border text-center">
                            <button
                              className="text-red-600 mx-1 md:mx-2"
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent triggering handleRowClick
                                handleEdit(asset.unique_id);
                              }}
                            >
                              <FaEye />
                            </button>
                          </td>
                        )} */}
                      </tr>

                      {/* Full Asset Details (toggle visibility when row is clicked) */}
                      {selectedAsset &&
                        selectedAsset.unique_id === asset.unique_id && (
                          <tr className="bg-gray-50">
                            <td
                              colSpan={selectedCategory ? 6 : 5}
                              className="p-4"
                            >
                              {/* Full Asset Details Section */}
                              <div className="relative">
                                {/* Asset Details Header */}
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-lg font-bold">
                                    Asset Details
                                  </h3>
                                  <button
                                    onClick={() => setSelectedAsset(null)} // Close details view
                                    className="text-red-600 hover:text-red-800 font-bold text-lg"
                                  >
                                    ✕
                                  </button>
                                </div>

                                {/* Asset Details Content */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                  <div>
                                    <strong>Asset Name:</strong> Asset Name
                                  </div>
                                  <div>
                                    <strong>Status:</strong> {asset.status}
                                  </div>
                                  <div>
                                    <strong>Stages:</strong> {asset.stages}
                                  </div>
                                  <div>
                                    <strong>Original Cost:</strong>{" "}
                                    {asset.original_cost}
                                  </div>
                                  <div>
                                    <strong>Created At:</strong>{" "}
                                    {formatDate(asset.created_at)}
                                  </div>
                                  {/* Add any other fields you'd like to show */}
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
            <div className="flex justify-center mt-4">
              <ul className="flex space-x-2">
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((pageNumber) => (
                  <li key={pageNumber}>
                    <button
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-3 py-1 rounded ${
                        pageNumber === currentPage
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  </li>
                ))}
              </ul>
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
                    onSubmit={handleSubmit}
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
                          column !== "unique_id" &&
                          column !== "stages" &&
                          column !== "category_id"
                      )
                      .map((field, index) => (
                        <div key={index} className="flex flex-col">
                          <label
                            htmlFor={field}
                            className="mb-1 text-sm font-medium text-gray-700"
                          >
                            {field}
                          </label>
                          <input
                            type="text"
                            name={field}
                            value={formData[field] || ""}
                            onChange={handleChange}
                            className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0] "
                            disabled
                          />
                          {/* Display backend validation errors for this field */}
                          {formErrors[field] && (
                            <span className="text-red-600 text-sm">
                              {formErrors[field]}
                            </span>
                          )}
                        </div>
                      ))}
                    {/* Show general error
                    {formErrors.general && (
                      <p className="text-red-600 text-sm">
                        {formErrors.general}
                      </p>
                    )}
                 <div className="col-span-2 flex justify-end mt-4">
  {formData.stages === "Repaired" ? (
    <button
      type="button"
      onClick={() => handleactive(editingAssetId)}
      className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded"
    >
      Active
    </button>
  ) : (
    <>
      <button
        type="button"
        onClick={() => handleDiscard(editingAssetId)}
        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded mr-2"
      >
        Discard Asset
      </button>
      <button
        type="button"
        onClick={() => handleRepaired(editingAssetId)}
        className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
      >
        Repaired
      </button>
    </>
  )}
</div> */}

                  </form>
                </div>
              </div>
            )}
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/4">
                  <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-800">
                      Are you sure you want to delete this asset?
                    </h2>
                    <div className="flex justify-end space-x-4 mt-4">
                      <button
                        onClick={cancelDelete}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded"
                      >
                        No
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                      >
                        Yes
                      </button>
                    </div>
                  </div>
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
