
import React, { useState, useEffect,useCallback,useMemo } from "react";
import { Modal, Box } from '@mui/material';
import { FaHome, FaSignOutAlt, FaEdit, FaEye, FaFileAlt,FaRegFileAlt } from "react-icons/fa";
import { BiQr } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import axios from "axios";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { QRCodeCanvas } from "qrcode.react"; // Use QRCodeCanvas
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase";
import IndentModal from "./IndentModal";
import { MdOutlineRequestPage } from "react-icons/md";
import { HiOutlineClipboardDocumentList } from "react-icons/hi2";


const AssetManagementPage = () => {
  const location = useLocation()
  console.log("location state",location.state)
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(location?.state?.category || "");
  const [tableData, setTableData] = useState({ columns: [], data: [] });
  const [searchTerm, setSearchTerm] = useState(location?.state?.requestAsset || ""); // State for search input
  const [filteredData, setFilteredData] = useState([]); // State for filtered table data
  const [editingAssetId, setEditingAssetId] = useState(null); // State for tracking which asset is being edited
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
  const [assetToDelete, setAssetToDelete] = useState(null); // Store asset ID to delete
  const [formErrors, setFormErrors] = useState({}); // To store form validation errors from backend
  const [isSubmitMapModalState, setIsSubmitMapModalState] = useState({
    isOpen: false,
  });
  const [selectedAsset, setSelectedAsset] = useState(null); // State to store the selected asset for full details
  const [locationDetails, setLocationDetails] = useState([]);
   const [startDate, setStartDate] = useState(null);
   const [backendError, setBackendError] = useState(""); 
   
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState(""); // State to store the type of message
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState(""); // For category ID
  const [uniqueId, setUniqueId] = useState(null); // For unique asset ID
  const [subLocations, setSubLocations] = useState([]); // State for sub-locations
  const [selectedLocation, setSelectedLocation] = useState(
    isSubmitMapModalState?.locationId || ""
  ); 
  const [qrCodeData, setQrCodeData] = useState(null); // Store the data to be encoded in the QR code
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [openQtyModal, setOpenQtyModal] = useState(false);
const [selectedForQtyUpdate, setSelectedForQtyUpdate] = useState(null);
const [quantityToAdd, setQuantityToAdd] = useState("");
const [totalCost, setTotalCost] = useState("");
const [indentModalOpen, setIndentModalOpen] = useState(false);


  const [mappingType, setMappingType] = useState(null); // 'user-only' or 'user-with-location'
 const [pagination, setPagination] = useState({
  total: 0,
  limit: 20,
  offset: 0,
  nextOffset: null,
  prevOffset: null,
});

const [debounceTimer, setDebounceTimer] = useState(null);

const [isPaginating, setIsPaginating] = useState(false);

useEffect(() => {
  const token = sessionStorage.getItem("token"); // Get token from sessionStorage

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
      setCategories([]); // Fallback to empty array
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
      console.error("Error fetching locations:", error);
      setLocationDetails([]); // Fallback to empty array
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

    console.log("API Response:", userResponse.data); // 👈 Debug once

    // Ensure we always set an array
    const users = Array.isArray(userResponse.data)
      ? userResponse.data
      : userResponse.data?.users || [];

    setAllUsers(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    setAllUsers([]); // Fallback to empty array
  }
};


  fetchCategories();
  fetchTableData(); // This will need token integration inside fetchTableData if required
  fetchLocations();
  fetchAllUsers();
}, []);


useEffect(() => {
  if (selectedCategory) {
    fetchTableData(selectedCategory);
  }
}, [selectedCategory]);

useEffect(() => {
  const token = sessionStorage.getItem("token"); // Get token from sessionStorage

  if (selectedLocation) {
    axios
      .get(`${MAIN_BASE}sloc/${selectedLocation}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      })
      .then((response) => {
        setSubLocations(response.data || []); // Update state with sub-locations
      })
      .catch((error) => {
        console.error("Error fetching sub-locations:", error);
        setSubLocations([]); // Fallback to empty array on error
      });
  } else {
    setSubLocations([]); // Reset sub-locations when no location is selected
  }
}, [selectedLocation]);


 
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
      type:"Raw material",
        search,
    };

    const response = await axios.get(
      `${ASSET_NODE_BASE}getColumnTypesAndData/${categoryName}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params, // ✅ use query params properly
      }
    );

    const { columns = [], data = [], pagination = {} } = response.data || {};

    // ✅ Table + Dynamic fields setup
    setTableData({ columns, data });
    setDynamicFields(columns);
    setFilteredData(data);

    // ✅ Pagination fix
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
      setSelectedCategory(  value);
      fetchTableData(value);
      handleEdit(value);
    }
  };
  console.log(tableData);

const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent form default behavior

  setMessage(""); // Clear previous messages
  setMessageType(""); // Reset the modal type
  setFormErrors({}); // Clear previous form errors

  // 1. Retrieve and validate `user_id` from sessionStorage
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token"); // Get token

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
  console.log("Retrieved User ID:", parsedUserId);

  // 2. Ensure `selectedCategory` is available and valid
  if (!selectedCategory) {
    console.error("No category selected.");
    setMessage("Please select a category.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const selectedCategoryObj = categories.find(
    (category) =>
      category.categoriesname.trim().toLowerCase() ===
      selectedCategory.trim().toLowerCase()
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

  // 3. Prepare payload
  const { category, "Purchase Date": purchase, ...filteredFormData } = formData;

  const formattedStartDate = startDate
    ? new Date(startDate).toISOString().split("T")[0]
    : null;

  const payload = {
    category_id: selectedCategoryId,
    user_id: parsedUserId,
    action: editingAssetId ? "AssetUpdate" : "AssetAddition",
    values: {
      ...filteredFormData,
      "Original Cost": filteredFormData["Original Cost"]
        ? parseInt(filteredFormData["Original Cost"], 10)
        : 0,
      "Useful Life": filteredFormData["Useful Life"]
        ? parseInt(filteredFormData["Useful Life"], 10)
        : 0,
      "Scrap Value": filteredFormData["Scrap Value"]
        ? parseInt(filteredFormData["Scrap Value"], 10)
        : 0,
    },
  };

  if (formattedStartDate) payload.values.startDate = formattedStartDate;

  console.log("Prepared Payload:", payload);

  // 4. API call with token
  try {
    const url = editingAssetId
      ? `${JAVA_BASE}api/crud/update/${selectedCategory}/${editingAssetId}`
      :`${ASSET_NODE_BASE}insert/${selectedCategory}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify(payload),
    });

    const rawResponse = await response.text();
    console.log("Raw Response:", rawResponse);

    if (!response.ok || rawResponse.toLowerCase().includes("error") || rawResponse.toLowerCase().includes("failed")) {
      console.error("Error response received:", rawResponse);
      setMessage("Failed to save asset. Please try again.");
      setMessageType("error");
      setIsModalOpen(true);
    } else {
      setMessage(editingAssetId ? "Asset updated successfully!" : "Asset created successfully!");
      setMessageType("success");
      setIsAssetModalOpen(false);

      // Fetch updated table data
      fetchTableData(selectedCategory);

      // Reset form state
      setFormData({});
      setStartDate(null);
      setEditingAssetId(null);
    }
  } catch (error) {
    console.error("Error during form submission:", error);
    setMessage("Failed to save asset. Please try again.");
    setMessageType("error");
    setIsModalOpen(true);
  }
};

  
  
  
  

  // Handle search term changes and update filtered data
const handleSearch = (e) => {
  const value = e.target.value;
  setSearchTerm(value);

  // 🧭 Clear previous debounce timer
  if (debounceTimer) clearTimeout(debounceTimer);

  // 🕒 Set new debounce delay (500ms)
  const newTimer = setTimeout(() => {
    // Call backend API with the search query
    fetchTableData(selectedCategory, 0, pagination.limit, value.trim());
  }, 800);

  setDebounceTimer(newTimer);
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

  // handleLocationChange implement this method
const handleLocationChange = async (e) => {
  const locationId = e.target.value;

  setIsSubmitMapModalState((prevState) => ({
    ...prevState,
    locationId: locationId,
  }));

  const token = sessionStorage.getItem("token"); // Get token

  if (!locationId) {
    console.warn("No location selected.");
    setSubLocations([]);
    return;
  }

  try {
    const response = await axios.get(
      `${MAIN_BASE}sloc/${locationId}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      }
    );

    setSubLocations(response.data || []);
    console.log("Fetched sub-locations:", response.data);
  } catch (error) {
    console.error("Error fetching sub-locations:", error.message);
    setSubLocations([]);
    setMessage("Failed to fetch sub-locations. Please try again.");
    setMessageType("error");
    setIsModalOpen(true); // Show error modal
  }
};



const handleAddQuantity = async () => {
  if (!selectedForQtyUpdate || !quantityToAdd || !totalCost) {
    setMessage("Please fill all required fields.");
    setMessageType("error");
    setIsModalOpen(true); // Open error modal
    return;
  }

  const referenceId = selectedForQtyUpdate.unique_id;
  const categoryId = selectedForQtyUpdate.category_id;
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  if (!userId) {
    console.error("User ID not found in session.");
    setMessage("User ID not found in session.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  const payload = {
    referenceid: referenceId,
    category_id: categoryId,
    quantity: Number(quantityToAdd),
    total_cost: Number(totalCost),
    user_id: Number(userId),
    action: "AssetAddition",
    submodule:"Raw material"
  };

  const apiUrl = `${ASSET_NODE_BASE}assets/temp-asset-quantity`;

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });

    if (response.status === 200 || response.status === 201) {
      console.log("Quantity update successful:", response.data);
      setMessage("Quantity successfully updated.");
      setMessageType("success");
      setOpenQtyModal(false);
      setQuantityToAdd("");
      setTotalCost("");

      if (selectedCategory) {
        await fetchTableData(selectedCategory);
      }
    } else {
      console.warn("Unexpected response:", response);
      setMessage("Failed to update quantity. Please try again.");
      setMessageType("error");
      setIsModalOpen(true);
    }
  } catch (error) {
    console.error("Error updating quantity:", error.message || error);
    setMessage("Something went wrong while updating quantity.");
    setMessageType("error");
    setIsModalOpen(true);
  }
};




const handleMapped = async (unique_id) => {
  try {
    const parseResponse = async (response) => {
      const contentType = response.headers.get("Content-Type");
      const isJson = contentType && contentType.includes("application/json");
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        throw new Error(
          (isJson && data?.message) || data || "API request failed."
        );
      }
      return data;
    };

    // ------------------ Validation Checks ------------------
    const modalUserId = parseInt(isSubmitMapModalState?.userId, 10);
    if (!modalUserId) {
      setMessage("⚠️ Please select a valid user for mapping.");
      setMessageType("error");
      return;
    }

    const subLocationId = parseInt(isSubmitMapModalState?.subLocationId, 10);
    if (!subLocationId) {
      setMessage("⚠️ Please select a valid sub-location for mapping.");
      setMessageType("error");
      return;
    }

    const sessionStorageUserId = sessionStorage.getItem("userId");
    const parsedUserId = parseInt(sessionStorageUserId, 10);
    if (!parsedUserId) {
      setMessage("⚠️ User not logged in or invalid User ID.");
      setMessageType("error");
      return;
    }

    if (!selectedCategory) {
      setMessage("⚠️ Please select a category.");
      setMessageType("error");
      return;
    }

    const selectedCategoryObj = categories.find(
      (c) => c.categoriesname === selectedCategory
    );
    if (!selectedCategoryObj) {
      setMessage("⚠️ Invalid or missing category.");
      setMessageType("error");
      return;
    }

    const quantity = parseInt(isSubmitMapModalState?.quantity, 10);
    if (!quantity || quantity <= 0) {
      setMessage("⚠️ Please enter a valid quantity.");
      setMessageType("error");
      return;
    }

    // ------------------ API Call ------------------
    const selectedCategoryId = selectedCategoryObj.categoryId;
    const materialId = parseInt(unique_id, 10);
    const token = sessionStorage.getItem("token");

    const payload = {
      category_id: selectedCategoryId,
      materialId,
      quantity,
      subLocationId,
      userId: modalUserId,
      action: "MappingRequest",
      submodule: "Raw material"
  
    };

    console.log("📦 Mapping Payload:", payload);

    const mappingResponse = await fetch(`${ASSET_NODE_BASE}assets/raw-material/mapping`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: JSON.stringify(payload),
    }).catch(() => {
      throw new Error("Network error during material mapping.");
    });

    const mappingData = await parseResponse(mappingResponse);
    console.log("✅ Mapping API Response:", mappingData);

    // ------------------ Success Flow ------------------
    setIsAssetModalOpen(false);
    setIsSubmitMapModalState({ isOpen: false });
    setMessage("✅ Material Mapped Successfully!");
    setMessageType("success");

    if (selectedCategory) {
      await fetchTableData(selectedCategory);
    }

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 8000);
  } catch (error) {
    console.error("❌ Error in handleMapped:", error);
    setMessage(error.message || "An unexpected error occurred. Please try again.");
    setMessageType("error");

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
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

const handleinactive = async (unique_id) => {
  // 1. Get the userId from sessionStorage
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token"); // ✅ Token fetch

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
  console.log("Retrieved User ID:", parsedUserId);

  // 2. Ensure selectedCategory is available
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

  // 3. Prepare the payload
  const payload = {
    category_id: selectedCategoryId,
    user_id: parsedUserId,
    new_stages: "Inactive",
    sub_stages: "AwaitingApproval",
    toapprove: "Inactive",
    action: "MappingRequest",
    submodule:"Raw material"
  };

  // 4. Make the API call with token
  try {
    const response = await fetch(
      `${ASSET_NODE_BASE}lifecycle/sub_stage/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token add here
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
   
     await fetchTableData(selectedCategory);
    setIsAssetModalOpen(false);
    setMessage("Asset successfully Sent For Inactive Request!");
    setMessageType("success");
  } catch (error) {
    console.error("Approval failed:", error);
    setMessage("Failed to inactive the asset. Please try again.");
    setMessageType("error");
    setIsAssetModalOpen(false);
  }
};

const handleDiscard = async (unique_id) => {
  // 1. Get the userId & token from sessionStorage
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token"); // ✅ Token fetch

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
  console.log("Retrieved User ID:", parsedUserId);

  // 2. Ensure selectedCategory is available
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

  // 3. Prepare the payload
  const payload = {
    category_id: selectedCategoryId,
    user_id: parsedUserId,
    new_stages: "Discard",
    sub_stages: "AwaitingApproval",
    toapprove: "Discard",
    action: "DiscardRequest",
    submodule:"Raw material"
  };

  // 4. Make the API call with token
  try {
    const response = await fetch(
      `${ASSET_NODE_BASE}lifecycle/sub_stage/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token add here
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    await fetchTableData(selectedCategory);
    setIsAssetModalOpen(false);
    setMessage("Asset successfully Discard!");
    setMessageType("success");
  } catch (error) {
    console.error("Approval failed:", error);
    setMessage("Failed to discard the asset. Please try again.");
    setMessageType("error");
    setIsAssetModalOpen(false);
  }
};

const handleactive = async (unique_id) => {

  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token"); // Token ko sessionStorage se lo

  if (!userId) {
    console.error("User ID is missing or invalid in sessionStorage.");
    setMessage("User not logged in or user ID is missing.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  if (!token) {
    console.error("Token is missing in sessionStorage.");
    setMessage("User not logged in or token is missing.");
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
  console.log("Retrieved User ID:", parsedUserId);

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

  const payload = {
    category_id: selectedCategoryId,
    user_id: parsedUserId,
    new_stages: "Active",
    sub_stages: "AwaitingApproval",
    toapprove: "Active",
    action: "DiscardRequest",
    submodule:"Raw material"
  };

  try {
    const response = await fetch(
      `${ASSET_NODE_BASE}lifecycle/sub_stage/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔑 Token pass kiya
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    await fetchTableData(selectedCategory);
    setIsAssetModalOpen(false);
    setMessage("Asset Active Request successfully sent!");
    setMessageType("success");
  } catch (error) {
    console.error("Approval failed:", error);
    setMessage("Failed to send the Request. Please try again.");
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
    
      "text-purple-500",
    
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
      placeholder="Select Material category"
      className="react-select-container"
     classNamePrefix="react-select"
      isSearchable
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
    {useMemo(() => (
      <table className="min-w-full table-auto text-sm border-collapse">
        <thead className="sticky top-0 bg-white border-b-2 border-black text-[16px] font-medium">
          <tr>
            {selectedCategory && <th className="p-5 text-center">S.no</th>}
            {[
              "Material Name",
              "Purchase Date",
              "Total Quantity",
              "Used Materials",
              "Available Materials",
              "Unit Cost",
              "UOM",
              "Stock Status",
            ].map((column, index) => (
              <th key={index} className="p-5 text-center">
                {column}
              </th>
            ))}
            {selectedCategory && <th className="p-5 text-center">Action</th>}
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((asset, index) => {
            // 🟢 Stock Status Logic
            let stockStatus = "";
            let stockColor = "";

            const available = Number(asset["Available Materials"]);
            const min = Number(asset.MIN);
            const max = Number(asset.MAX);

            if (available < min) {
              stockStatus = "Low Stock";
              stockColor = "text-red-600 font-bold";
            } else if (available > max) {
              stockStatus = "Over Stock";
              stockColor = "text-yellow-600 font-bold";
            } else {
              stockStatus = "In Stock";
              stockColor = "text-green-600 font-bold";
            }

            return (
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

                  {/* Material Name */}
                  <td className="px-5 py-3 text-center truncate">
                    {asset.material_name || "N/A"}
                  </td>

                  {/* Purchase Date */}
                  <td className="px-5 py-3 text-center">
                    {asset["Purchase Date"]
                      ? new Date(asset["Purchase Date"]).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* Total Quantity */}
                  <td className="px-5 py-3 text-center">
                    {asset.quantity || "0"}
                  </td>

                  {/* Used Materials */}
                  <td className="px-5 py-3 text-center">
                    {asset["Used Materials"] || "0"}
                  </td>

                  {/* Available Materials */}
                  <td className="px-5 py-3 text-center">
                    {asset["Available Materials"] || "0"}
                  </td>

                  {/* Unit Cost */}
                  <td className="px-5 py-3 text-center">
                    {asset["Unit Cost"]
                      ? Number(asset["Unit Cost"]).toFixed(6)
                      : "0.000000"}
                  </td>

                  {/* UOM */}
                  <td className="px-5 py-3 text-center uppercase">
                    {asset.uom || "N/A"}
                  </td>

                  {/* 🟢 Stock Status Column */}
                  <td className={`px-5 py-3 text-center ${stockColor}`}>
                    {stockStatus}
                  </td>

                  {/* Action Column */}
                  {selectedCategory && (
                    <td className="px-5 py-3 text-center">
                      <div className="flex justify-center items-center gap-3">
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
{stockStatus === "Low Stock" && (
  <button
    className="text-purple-600 hover:text-purple-800 p-2 rounded-full hover:bg-purple-100"
    onClick={(e) => {
      e.stopPropagation();
      setSelectedAsset(asset);
      setIndentModalOpen(true);
    }}
    title="Raise Indent"
  >
    <HiOutlineClipboardDocumentList   className="text-lg" />
  </button>
)}

                        {Object.entries(asset).map(([key, value]) => {
                          if (value && typeof value === "object" && value.url) {
                            return (
                              <a
                                key={key}
                                href={value.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:text-green-800"
                                title={`View Document: ${key}`}
                              >
                                <FaRegFileAlt className="text-base" />
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              </React.Fragment>
            );
          })}
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
        {Math.ceil(
          (pagination.total ?? 0) / (pagination.limit ?? itemsPerPage)
        )}
      </span>

      <button
        onClick={() => handlePageChange("next")}
        disabled={
          currentPage === Math.ceil(pagination.total / pagination.limit)
        }
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
      {/* Header */}
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div className="flex flex-col">
          <label htmlFor="category" className="mb-1 text-sm font-medium text-gray-700">
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
            // ✅ Mapping backend names → user-friendly display names (like table)
            const displayNames = {
              material_name: "Material Name",
              "Purchase Date": "Purchase Date",
              quantity: "Total Quantity",
              "Used Materials": "Used Materials",
              "Available Materials": "Available Materials",
              "Unit Cost": "Unit Cost",
              uom: "UOM",
              MIN: "Min Value",
              MAX: "Max Value",
              "Total Cost": "Total Cost",
              "Remaining Cost": "Remaining Cost",
            };

            const label =
              displayNames[field.columnName] || field.columnName;

            // Editable field logic
            const isEditableField = [
              "Original Cost",
              "Useful Life",
              "Scrap Value",
            ].includes(field.columnName);

            // Date handling
            const fieldValue = field.columnName.includes("Date")
              ? formData[field.columnName]
                ? new Date(formData[field.columnName])
                    .toISOString()
                    .split("T")[0]
                : ""
              : formData[field.columnName] || "";

            return (
              <div key={index} className="flex flex-col">
                <label
                  htmlFor={field.columnName}
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  {label}
                </label>
                <input
                  type="text"
                  name={field.columnName}
                  value={fieldValue}
                  onChange={handleChange}
                  className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
                  disabled={!isEditableField}
                />
                {/* Field-level error */}
                {formErrors[field.columnName] && (
                  <span className="text-red-600 text-sm">
                    {formErrors[field.columnName]}
                  </span>
                )}
              </div>
            );
          })}

        {/* General Error */}
        {formErrors.general && (
          <p className="text-red-600 text-sm">{formErrors.general}</p>
        )}

        {/* ✅ Action Buttons */}
        <div className="col-span-2 flex justify-end mt-4">
          {formData.stages === "Active" &&
          formData.sub_stages === "Approved" ? (
            <>
              <button
                type="button"
                onClick={() => handleinactive(editingAssetId)}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-6 rounded mr-2"
              >
                Inactive Request
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAssetModalOpen(false);
                  setIsSubmitMapModalState({
                    ...isSubmitMapModalState,
                    isOpen: true,
                    editingAssetId,
                  });
                }}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Allocation Request
              </button>
            </>
          ) : formData.stages === "Active" &&
            formData.sub_stages === "AwaitingApproval" ? (
            <button
              type="button"
              onClick={() => handleinactive(editingAssetId)}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Inactive Request
            </button>
          ) : formData.stages === "Active" &&
            formData.sub_stages === "Added" ? (
            <>
              <button
                type="button"
                onClick={() => handleinactive(editingAssetId)}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded mr-3"
              >
                Inactive Request
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAssetModalOpen(false);
                  setIsSubmitMapModalState({
                    ...isSubmitMapModalState,
                    isOpen: true,
                    editingAssetId,
                  });
                }}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Allocation Request
              </button>
            </>
          ) : formData.stages === "Inactive" &&
            formData.sub_stages === "Approved" ? (
            <>
              <button
                type="button"
                onClick={() => handleDiscard(editingAssetId)}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded mr-2"
              >
                Discard Asset Request
              </button>
              <button
                type="button"
                onClick={() => handleactive(editingAssetId)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
              >
                Active Asset Request
              </button>
            </>
          ) : null}
        </div>
      </form>
    </div>
  </div>
)}

<Modal open={openQtyModal} onClose={() => setOpenQtyModal(false)}>
  <Box className="absolute top-1/2 left-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-xl">
    <h2 className="text-lg font-bold mb-4">Add Quantity</h2>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity to Add:</label>
        <input
          type="number"
          value={quantityToAdd}
          onChange={(e) => setQuantityToAdd(e.target.value)}
          className="w-full p-2 border rounded-lg"
          min="1"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost:</label>
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



            {/* Submit Mapping Modal */}
            {!!isSubmitMapModalState?.isOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50">
    <div className="bg-white rounded-xl shadow-xl w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 p-6 transform transition-all relative">
      
      {/* Close Button */}
      <button
        onClick={() => setIsSubmitMapModalState({ isOpen: false })}
        className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-3xl"
      >
        ×
      </button>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">
          Allocation with Location
        </h2>

        {/* User Dropdown */}
        <div>
          <label
            htmlFor="userId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Mapped User:
          </label>
          <select
            name="userId"
            value={isSubmitMapModalState?.userId || ""}
            onChange={(e) =>
              setIsSubmitMapModalState({
                ...isSubmitMapModalState,
                userId: e.target.value,
              })
            }
            className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
          >
            <option value="" disabled>
              Select User
            </option>
            {allUsers.map((user, index) => (
              <option key={`users-${index}`} value={user.user_id}>
                {`${user.first_name} ${user.last_name}`}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity Input */}
        <div>
          <label
            htmlFor="quantity"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Quantity:
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={isSubmitMapModalState?.quantity || ""}
            onChange={(e) =>
              setIsSubmitMapModalState({
                ...isSubmitMapModalState,
                quantity: e.target.value,
              })
            }
            className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
            min="1"
            placeholder="Enter quantity"
          />
        </div>

        {/* Location Dropdown */}
        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Location:
          </label>
          <select
            name="location"
            value={isSubmitMapModalState?.locationId || ""}
            onChange={handleLocationChange}
            className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
          >
            <option value="" disabled>
              Select Location
            </option>
            {locationDetails.map((location) => (
              <option key={location.location_id} value={location.location_id}>
                {location.locality}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-location Dropdown */}
        {isSubmitMapModalState?.locationId && subLocations.length > 0 && (
          <div>
            <label
              htmlFor="subLocation"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Sub-location:
            </label>
            <select
              name="subLocation"
              value={isSubmitMapModalState?.subLocationId || ""}
              onChange={(e) => {
                const selectedSubLocation = subLocations.find(
                  (subLocation) =>
                    subLocation.sub_location_id === parseInt(e.target.value, 10)
                );
                if (selectedSubLocation) {
                  setIsSubmitMapModalState({
                    ...isSubmitMapModalState,
                    subLocationId: selectedSubLocation.sub_location_id,
                  });
                }
              }}
              className="w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
            >
              <option value="" disabled>
                Select Sub-location
              </option>
              {subLocations.map((subLocation, index) => (
                <option key={index} value={subLocation.sub_location_id}>
                  {`Building: ${subLocation.building_no}, Floor: ${subLocation.floor}, Room: ${subLocation.room}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end mt-6">
        

        
           
            <button
              type="button"
              onClick={() =>
                handleMapped(isSubmitMapModalState?.editingAssetId)
              }
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-150"
            >
              Submit
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
      {indentModalOpen && (
  <IndentModal
    asset={selectedAsset}
    onClose={() => setIndentModalOpen(false)}
    refreshTable={fetchTableData}
  />
)}

    </div>
  );
};
export default AssetManagementPage;
