import React, { useState, useEffect,useCallback,useMemo} from "react";
import { FaHome, FaSignOutAlt, FaEdit, FaEye, faQrcode } from "react-icons/fa";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [editingAssetId, setEditingAssetId] = useState(null);

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitMapModalState, setIsSubmitMapModalState] = useState({
    isOpen: false,
  });
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [locationDetails, setLocationDetails] = useState([]);
  const [startDate, setStartDate] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [uniqueId, setUniqueId] = useState(null);
  const [subLocations, setSubLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(
    isSubmitMapModalState?.locationId || ""
  );
  const [mappingType, setMappingType] = useState(null);
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
    const token = sessionStorage.getItem("token");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get(
         `${JAVA_BASE}api/categories/movable`,
          config
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
          config
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
          config
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

 useEffect(() => {
  if (selectedCategory) {
    fetchTableData(selectedCategory);
  }
}, [selectedCategory]);

  useEffect(() => {
    if (selectedLocation) {
      const token = sessionStorage.getItem("token"); 

      axios
        .get(
          `${ASSET_NODE_BASE}sloc/${selectedLocation}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          setSubLocations(response.data || []);
        })
        .catch((error) => {
          console.error("Error fetching sub-locations:", error);
        });
    } else {
      setSubLocations([]); 
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
      search,
      // ✅ Moved filtering logic to API
      stages: "Active, Inactive,Repaired,SendForRepair" ,
      sub_stages: "AwaitingApproval",
      toapprove:"Discard,Active,Inactive",
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



  const parseResponse = async (response) => {
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json(); // Parse as JSON
    } else {
      return await response.text(); // Parse as plain text
    }
  };

  const handleInactive = async () => {
    // Show confirmation modal
    setIsModalOpen(true);
  };
  const handleConfirmInactive = async (unique_id) => {
    const token = sessionStorage.getItem("token"); // Get token for authorization

    try {
      const parseResponse = async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json(); // Parse as JSON
        } else {
          return await response.text(); // Parse as plain text
        }
      };

      // Ensure the unique_id is valid
      console.log("Unique ID:", unique_id); // Log the unique_id value
      const uniqueIdInt = parseInt(unique_id, 10);
      if (!uniqueIdInt || isNaN(uniqueIdInt)) {
        setMessage("Invalid asset ID.");
        setType("error");
        return;
      }

      // Ensure valid user is logged in
      const sessionStorageUserId = sessionStorage.getItem("userId");
      const parsedUserId = parseInt(sessionStorageUserId, 10);
      if (!sessionStorageUserId || isNaN(parsedUserId)) {
        setMessage("User not logged in or invalid User ID.");
        setType("error");
        return;
      }

      // Ensure a valid category is selected
      if (!selectedCategory) {
        setMessage("Please select a category.");
        setType("error");
        return;
      }

      const selectedCategoryObj = categories.find(
        (category) => category.categoriesname === selectedCategory
      );
      if (!selectedCategoryObj) {
        setMessage("Invalid or missing category.");
        setType("error");
        return;
      }

      const selectedCategoryId = selectedCategoryObj.categoryId;

      // Update the asset status to "Inactive"
      const updatePayload = {
        category_id: selectedCategoryId,
        user_id: parsedUserId,
        new_stages: "Inactive",
        sub_stages: "Approved",
        action: "DiscardApprove",
         submodule: "Movable"
      };

      const updateResponse = await fetch(
        `${ASSET_NODE_BASE}lifecycle/update-asset-status/${uniqueIdInt}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          Authorization: `Bearer ${token}`, // Add token

          body: JSON.stringify(updatePayload),
        }
      );

      // Check for any issues with the status update API response
      const updateData = await parseResponse(updateResponse);
      if (!updateResponse.ok || updateData.error) {
        setMessage(updateData.message || "Failed to update asset status.");
        setType("error");
        return;
      }

    

              await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);
      setIsModalOpen(false);
      setMessage("Asset status updated to Inactive successfully!");
      setType("success");

      setTimeout(() => {
        setMessage("");
        setType("");
      }, 8000); // Clear message after 8 seconds
    } catch (error) {
      console.error("Error in asset status update:", error);
      setMessage(
        error.message || "An error occurred while updating the asset."
      );
      setType("error");

      setTimeout(() => {
        setMessage("");
        setType("");
      }, 3000); // Clear message after 3 seconds
    }
  };

  const handleCancelInactive = () => {
    // Close the modal if the user cancels
    setIsModalOpen(false);
  };

  const handleinactive = async (unique_id) => {
    // 1. Get the userId from sessionStorage
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token"); // Get token for authorization

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

    // 3. Get asset details from local data
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

    // 4. Prepare the payload for stage update
    const payload = {
      category_id: selectedCategoryId,
      user_id: parsedUserId,
      new_stages: "Inactive",
      sub_stages: "Approved",
      action: "MappingApprove",
       submodule: "Movable"
    };

    // 5. Call API to update asset status
    try {
      const response = await fetch(
      `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token here too
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Approval successful:", data);

      // 6. Prepare history payload
      const historyPayload = {
        assetId: unique_id,
        categoryId: selectedCategoryId,
        updatedBy: parsedUserId,
        assetname,
        previousSubStages,
        currentSubStages: "Approved",
        previousStatus,
        currentStatus: "Inactive",
        previousStages,
        currentStages: "Inactive",
        action: "Asset Inactive Request Approved",
      };

      // 7. Call Asset History API to log the history
      const historyRes = await fetch(
       `${JAVA_BASE}api/assethistory/insert-history`, // Asset History API URL
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token here too
          },
          body: JSON.stringify(historyPayload),
        }
      );

      if (!historyRes.ok) {
        throw new Error("Failed to log asset history");
      }

     
              await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);
      setIsAssetModalOpen(false);
      setMessage("Asset successfully Inactive and History logged!");
      setMessageType("success");
    } catch (error) {
      console.error("Approval failed:", error);
      setMessage("Failed to inactive the asset. Please try again.");
      setMessageType("error");
      setIsAssetModalOpen(false); // Open the modal with error message
    }
  };

  const handleDiscard = async (unique_id) => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token"); // Get token for authorization

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

    const newStage = "Discard";
    const newSubStage = "Approved";

    const payload = {
      category_id: selectedCategoryId,
      user_id: parsedUserId,
      new_stages: newStage,
      sub_stages: newSubStage,
      action: "DiscardApprove",
       submodule: "Movable"
    };

    try {
      const response = await fetch(
       `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token here too
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Discard approval successful:", data);

      // Asset History Logging
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
        action: "Asset Discrad Request Approved",
      };

      const historyRes = await fetch(
        `${JAVA_BASE}api/assethistory/insert-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token here too
          },
          body: JSON.stringify(historyPayload),
        }
      );

      if (!historyRes.ok) {
        throw new Error("Failed to log asset history");
      }

               await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);
      setIsAssetModalOpen(false);
      setMessage("Asset successfully Discard!");
      setMessageType("success");
    } catch (error) {
      console.error("Discard approval failed:", error);
      setMessage("Failed to discard the asset. Please try again.");
      setMessageType("error");
      setIsAssetModalOpen(false);
    }
  };

  const handleactive = async (unique_id) => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token"); // Get token for authorization

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

    const newStage = "Active";
    const newSubStage = "Added";

    const payload = {
      category_id: selectedCategoryId,
      user_id: parsedUserId,
      new_stages: newStage,
      sub_stages: newSubStage,
      action: "DiscardApprove",
       submodule: "Movable"
    };

    try {
      const response = await fetch(
        `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token here too
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Active approval successful:", data);

      // Asset History Logging
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
        action: "Asset Active Request Approved",
      };

      const historyRes = await fetch(
       `${JAVA_BASE}api/assethistory/insert-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token here too
          },
          body: JSON.stringify(historyPayload),
        }
      );

      if (!historyRes.ok) {
        throw new Error("Failed to log asset history");
      }

              await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);
      setIsAssetModalOpen(false);
      setMessage("Asset successfully Active!");
      setMessageType("success");
    } catch (error) {
      console.error("Active approval failed:", error);
      setMessage("Failed to Active the asset. Please try again.");
      setMessageType("error");
      setIsAssetModalOpen(false);
    }
  };

  const handleApproveMappedAsset = async (unique_id) => {
    // 1. Get the userId from sessionStorage
    const token = sessionStorage.getItem("token"); // Get token for API authorization
    const userId = sessionStorage.getItem("userId"); // Assuming the userId is stored as a string in sessionStorage

    if (!userId) {
      console.error("User ID is missing or invalid in sessionStorage.");
      setMessage("User not logged in or user ID is missing.");
      setMessageType("error");
      setIsModalOpen(true); // Open the modal with error message
      return;
    }

    const parsedUserId = parseInt(userId, 10); // Convert userId to an integer

    if (isNaN(parsedUserId)) {
      console.error("Invalid User ID retrieved from sessionStorage.");
      setMessage("Invalid User ID.");
      setMessageType("error");
      setIsModalOpen(true); // Open the modal with error message
      return;
    }
    console.log("Retrieved User ID:", parsedUserId);

    // 2. Ensure selectedCategory is available and fetch the corresponding category ID
    if (!selectedCategory) {
      console.error("No category selected.");
      setMessage("Please select a category.");
      setMessageType("error");
      setIsModalOpen(true); // Open the modal with error message
      return;
    }

    // Find the category object from the categories array based on selectedCategory (category name)
    const selectedCategoryObj = categories.find(
      (category) => category.categoriesname === selectedCategory
    );

    if (!selectedCategoryObj) {
      console.error("Category not found in the categories list.");
      setMessage("Invalid or missing category.");
      setMessageType("error");
      setIsModalOpen(true); // Open the modal with error message
      return;
    }

    const selectedCategoryId = selectedCategoryObj.categoryId; // Get the category ID
    console.log("Selected Category ID:", selectedCategoryId);

    // 3. Prepare the payload
    const payload = {
      category_id: selectedCategoryId, // Use the retrieved category ID
      user_id: parsedUserId, // Use the parsed userId
      new_stages: "Mapped", // New status for approval
      sub_stages: "Approved",
      action: "MappingApprove", // Action to be performed
       submodule: "Movable"
    };

    // 4. Make the API call to approve the asset
    try {
      const response = await fetch(
       `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token here
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
             await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);
      setIsAssetModalOpen(false); // Close the modal
      setMessage("Asset Mapping successfully approved!"); // Success message
      setMessageType("success"); // Success type
    } catch (error) {
      console.error("Approval failed:", error);
      setMessage("Failed to approve the asset. Please try again.");
      setMessageType("error"); // Error type
      setIsAssetModalOpen(false); // Open the modal with error message
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

            {/* Inventory Asset Table */}
                    {/* Table */}
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
                                  "Next Stage"
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
                      "toapprove"
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
                            "toapprove",
                            "sub_stages",
                            "location_details",
                            "name",
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
                    <div className="col-span-2 flex justify-end mt-4">
                      {formData.toapprove === "Active" && (
                        <button
                          type="button"
                          onClick={() => handleactive(editingAssetId)}
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                        >
                          Active Approved
                        </button>
                      )}

                      {formData.toapprove === "Discard" && (
                        <button
                          type="button"
                          onClick={() => handleDiscard(editingAssetId)}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                        >
                          Discard Approved
                        </button>
                      )}

                      {formData.toapprove === "Inactive" && (
                        <button
                          type="button"
                          onClick={() => handleinactive(editingAssetId)}
                          className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                        >
                          Inactive Approved
                        </button>
                      )}

                      {formData.toapprove === "Mapping" && (
                        <button
                          type="button"
                          onClick={() =>
                            handleApproveMappedAsset(editingAssetId)
                          }
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                        >
                          Mapping Approved
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

         

            {/* Confirmation Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                  <h3 className="text-xl font-bold">
                    Are you sure you want to inactive this asset?
                  </h3>
                  <div className="mt-4">
                    <button
                      className="bg-red-500 text-white py-2 px-4 rounded mr-2"
                      onClick={() =>
                        handleConfirmInactive(isModalOpen?.editingAssetId)
                      }
                    >
                      Yes, Inactive
                    </button>
                    <button
                      className="bg-gray-500 text-white py-2 px-4 rounded"
                      onClick={handleCancelInactive}
                    >
                      Cancel
                    </button>
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
