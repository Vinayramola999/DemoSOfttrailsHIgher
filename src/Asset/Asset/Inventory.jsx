import React, { useState, useEffect,useCallback,useMemo} from "react";
import {
  FaHome,
  FaSignOutAlt,
  FaEdit,
  FaEye,
  faQrcode,
  FaRegFileAlt,
} from "react-icons/fa";
import { BiQr } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import axios from "axios";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { QRCodeCanvas } from "qrcode.react"; // Use QRCodeCanvas
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Excel from "../../assests/excel.png";
import pdf from "../../assests/folder.png";
import Select from "react-select";
import {
  DMS_BASE,
  JAVA_BASE,
  ASSET_NODE_BASE,
  UCS_BASE,
  MAIN_BASE,
} from "../../config/apiBase";
import AssetHistoryDrawer from "../Components/AssetHistoryDrawer";

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
  const [isSubmitMapModalState, setIsSubmitMapModalState] = useState({
    isOpen: false,
  });
  const [selectedAsset, setSelectedAsset] = useState(null); // State to store the selected asset for full details
  const [locationDetails, setLocationDetails] = useState([]);
  const [startDate, setStartDate] = useState(null);

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
  ); // Track selected location
  const [qrCodeData, setQrCodeData] = useState(null); // Store the data to be encoded in the QR code
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [sourceCategory, setSourceCategory] = useState(null);
  const [destinationCategory, setDestinationCategory] = useState(null);
  const [sourceAsset, setSourceAsset] = useState(null);
  const [destinationAsset, setDestinationAsset] = useState(null);

  const [sourceAssetOptions, setSourceAssetOptions] = useState([]);
  const [destinationAssetOptions, setDestinationAssetOptions] = useState([]);
   const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    offset: 0,
    nextOffset: null,
    prevOffset: null,
  });
  const [selectedAssetId, setSelectedAssetId] = useState(null);
const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  
  const [isPaginating, setIsPaginating] = useState(false);
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

  const assetName = selectedAsset ? selectedAsset.assetname : "";
  const [assetsByCategory, setAssetsByCategory] = useState({});

  useEffect(() => {
    if (!isSubmitMapModalState?.isOpen) {
      setMappingType(null);
      setSourceCategory(null);
      setDestinationCategory(null);
      setSourceAsset(null);
      setDestinationAsset(null);
    }
  }, [isSubmitMapModalState?.isOpen]);

  const getCategoryOptions = categories.map((cat) => ({
    value: cat.categoryId,
    label: cat.categoriesname,
  }));

const handleViewHistory = (asset) => {
  if (!asset?.unique_id || !asset?.category_id) {
    console.warn("Missing asset identifiers:", asset);
    return;
  }

  setSelectedAssetId(asset.unique_id);
  setSelectedCategory(asset.category_id);
  setSelectedAsset(asset);
  setIsHistoryOpen(true);
};


  useEffect(() => {
    if (
      mappingType === "asset-to-asset" &&
      isSubmitMapModalState?.editingAssetId &&
      tableData?.data?.length
    ) {
      const assetRow = tableData.data.find(
        (row) => row.unique_id === isSubmitMapModalState.editingAssetId
      );

      if (assetRow) {
        // Source Category
        const matchingCategory = getCategoryOptions.find(
          (opt) =>
            opt.label === assetRow.categoryName ||
            opt.value == assetRow.category_id
        );
        if (matchingCategory) setSourceCategory(matchingCategory);

        // Source Asset
        const assetOption = {
          value: assetRow.unique_id,
          label: assetRow["Asset Name"] || "Unnamed Asset",
        };
        setSourceAsset(assetOption);
      }
    }
  }, [mappingType, isSubmitMapModalState?.editingAssetId, tableData]);

  const getAssetOptions = (categoryId) => {
    const assets = assetsByCategory[categoryId] || [];
    return assets.map((asset) => ({
      value: asset.asset_id,
      label: `${asset.asset_name} (${asset.asset_model_no})`,
    }));
  };

  // Fetch categories when the component mounts
  useEffect(() => {
    const token = sessionStorage.getItem("token");

    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${JAVA_BASE}api/categories/movable`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error.message || error);
      }
    };

    const fetchLocations = async () => {
      try {
        const locationResponse = await axios.get(`${MAIN_BASE}loc`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setLocationDetails(locationResponse.data || []);
      } catch (error) {
        console.error("Error fetching locations:", error.message || error);
      }
    };

    const fetchAllUsers = async () => {
      try {
        const userResponse = await axios.get(`${MAIN_BASE}users/getusers`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });

        // Debug response
        console.log("API Response:", userResponse.data);

        // If API returns { users: [...] }
        const users = Array.isArray(userResponse.data)
          ? userResponse.data
          : userResponse.data.users || [];

        setAllUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error.message || error);
        setAllUsers([]); // fallback
      }
    };

    // Fetch initial data
    fetchCategories();
    fetchTableData();
    fetchLocations();
    fetchAllUsers();
  }, []);

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    const fetchSubLocations = async () => {
      if (!selectedLocation) {
        setSubLocations([]);
        return;
      }

      try {
        const response = await axios.get(
          `${MAIN_BASE}sloc/${selectedLocation}`,
          { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
        );
        setSubLocations(response.data || []);
      } catch (error) {
        console.error("Error fetching sub-locations:", error.message || error);
        setSubLocations([]); // fallback in case of error
      }
    };

    fetchSubLocations();
  }, [selectedLocation]);

  useEffect(() => {
    if (sourceCategory?.label) {
      fetchAssetsForCategory(sourceCategory.label, "source");
    }
  }, [sourceCategory]);

  useEffect(() => {
    if (destinationCategory?.label) {
      fetchAssetsForCategory(destinationCategory.label, "destination");
    }
  }, [destinationCategory]);

  const fetchAssetsForCategory = async (categoryName, type) => {
    const token = sessionStorage.getItem("token");

    if (!categoryName) return;

    try {
      const response = await axios.get(
        `${ASSET_NODE_BASE}getColumnTypesAndData/${categoryName}`,
        {
           params: {
          type:"Movable"
         },
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      const data = response.data?.data || [];

      if (!Array.isArray(data)) {
        console.error("Unexpected data format:", response.data);
        return;
      }

      const assetOptions = data.map((item) => ({
        value: item.unique_id,
        label: item["Asset Name"] || "Unnamed Asset",
      }));

      if (type === "source") {
        setSourceAssetOptions(assetOptions);
      } else {
        setDestinationAssetOptions(assetOptions);
      }

      console.log(`Fetched ${type} assets:`, assetOptions);
    } catch (err) {
      console.error("Error fetching assets:", err.message || err);
    }
  };

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
      type:"Movable",
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

  const handleQrCodeFetch = async (categoryId, uniqueId) => {
    console.log("Category ID:", categoryId);
    console.log("Unique ID:", uniqueId);

    const token = sessionStorage.getItem("token"); // Get token from session

    if (!categoryId || !uniqueId) {
      console.warn("Category ID or Unique ID missing for QR code fetch.");
      setMessage("Invalid category or asset ID.");
      setMessageType("error");
      return;
    }

    try {
      const response = await axios.get(
        `${JAVA_BASE}api/qr/url/${categoryId}/${uniqueId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          responseType: "text", // Since QR code URL is plain text
        }
      );

      const qrCodeUrl = response.data;
      console.log("QR Code URL:", qrCodeUrl);

      if (qrCodeUrl) {
        setQrCodeData(qrCodeUrl); // Set URL to display QR code
        setIsQrModalOpen(true); // Open modal
      } else {
        console.error("QR Code URL not found");
        setMessage("QR Code not found. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error fetching QR code:", error.message || error);
      setMessage("Failed to fetch QR code. Please try again.");
      setMessageType("error");
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
      setSelectedAsset({
        assetId: asset.unique_id,
        assetname: asset["Asset Name"] || "", // 🛠️ get exact key from backend
      });
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
        const response = await axios.post(`${MAIN_BASE}users/verify-token`, {
          token,
        });
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

  const handleLocationChange = async (e) => {
    const locationId = e.target.value;
    setIsSubmitMapModalState((prevState) => ({
      ...prevState,
      locationId,
    }));

    const token = sessionStorage.getItem("token"); // Authorization token

    try {
      const response = await axios.get(`${MAIN_BASE}sloc/${locationId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      setSubLocations(response.data || []);
    } catch (error) {
      console.error("Error fetching sub-locations:", error?.response || error);

      const errorMsg =
        error?.response?.data?.error ||
        "Failed to fetch sub-locations. Please try again.";
      setMessage(errorMsg);
      setMessageType("error");
      setIsModalOpen(true);
    }
  };

  const handleMapped = async (unique_id) => {
    const token = sessionStorage.getItem("token"); // Authorization token

    try {
      const parseResponse = async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          return await response.text();
        }
      };

      const modalUserId = parseInt(isSubmitMapModalState?.userId, 10);
      if (!modalUserId || isNaN(modalUserId)) {
        setMessage("Please select a valid user for mapping.");
        setMessageType("error");
        setIsModalOpen(true);
        return;
      }

      if (mappingType === "user-with-location") {
        const subLocationId = isSubmitMapModalState?.subLocationId;
        if (!subLocationId || isNaN(parseInt(subLocationId, 10))) {
          setMessage("Please select a valid sub-location for mapping.");
          setMessageType("error");
          setIsModalOpen(true);
          return;
        }
      }

      const sessionStorageUserId = sessionStorage.getItem("userId");
      const parsedUserId = parseInt(sessionStorageUserId, 10);
      if (!sessionStorageUserId || isNaN(parsedUserId)) {
        setMessage("User not logged in or invalid User ID.");
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
        (category) =>
          category.categoriesname.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase()
      );
      if (!selectedCategoryObj) {
        setMessage("Invalid or missing category.");
        setMessageType("error");
        setIsModalOpen(true);
        return;
      }

      const selectedCategoryId = selectedCategoryObj.categoryId;
      const uniqueIdInt = parseInt(unique_id, 10);

      const mappingPayload = {
        assetId: uniqueIdInt,
        categoryId: selectedCategoryId,
        userId: modalUserId,
      };

      if (mappingType === "user-with-location") {
        mappingPayload.location_id = parseInt(
          isSubmitMapModalState?.subLocationId,
          10
        );
      }

      // ✅ Mapping API call with Authorization
      const mappingResponse = await fetch(
        `${ASSET_NODE_BASE}assetmapping`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(mappingPayload),
        }
      );

      const mappingData = await parseResponse(mappingResponse);
      if (!mappingResponse.ok || mappingData.error) {
        throw new Error(mappingData.message || "Failed to map asset.");
      }

      // ✅ Update asset status API call
      const updatePayload = {
        category_id: selectedCategoryId,
        user_id: parsedUserId,
        new_stages: "Mapped",
        sub_stages: "AwaitingApproval",
        toapprove: "Mapping",
        action: "MappingRequest",
        submodule: "Movable",
      };

      const updateResponse = await fetch(
        `${ASSET_NODE_BASE}lifecycle/sub_stage/${uniqueIdInt}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      const updateData = await parseResponse(updateResponse);
      if (!updateResponse.ok || updateData.error) {
        throw new Error(updateData.message || "Failed to update asset status.");
      }

      // ✅ Insert Asset History API Call
      const historyPayload = {
        assetId: uniqueIdInt,
        categoryId: selectedCategoryId,
        updatedBy: parsedUserId,
        previousSubStages: "Added",
        currentSubStages: "AwaitingApproval",
        currentStatus: "Inventory",
        locationId:
          mappingType === "user-with-location"
            ? parseInt(isSubmitMapModalState?.subLocationId, 10)
            : null,
        assetname: selectedAsset?.assetname || "",
        previousStatus: "Inventory",
        action: "Asset Mapping Request",
      };

      const historyResponse = await fetch(
        `${JAVA_BASE}api/assethistory/insert-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(historyPayload),
        }
      );

      const historyData = await parseResponse(historyResponse);
      if (!historyResponse.ok || historyData.error) {
        throw new Error(
          historyData.message || "Failed to insert asset history."
        );
      }

      setIsAssetModalOpen(false);
      setIsSubmitMapModalState({ isOpen: false });
      setMessage("Asset Allocation Request Sent successfully!");
      setMessageType("success");

     await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 8000);
    } catch (error) {
      console.error("Error in handleMapped:", error);
      setMessage(
        error.message || "An unexpected error occurred. Please try again later."
      );
      setMessageType("error");
      setIsModalOpen(true);
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    }
  };

  // const handleAssetToAssetMapping = async () => {
  //   if (!sourceCategory || !destinationCategory || !sourceAsset || !destinationAsset) {
  //     alert("Please select all fields for Asset to Asset mapping.");
  //     return;
  //   }

  //   const sourceAssetId = parseInt(sourceAsset.value, 10);
  //   const destinationAssetId = parseInt(destinationAsset.value, 10);
  //   const sourceCategoryId = parseInt(sourceCategory.value, 10);
  //   const destinationCategoryId = parseInt(destinationCategory.value, 10);

  //   const payload = {
  //     sourceCategory_Id: sourceCategoryId,
  //     destinationCategory_Id: destinationCategoryId,
  //     sourceAssetId,
  //     destinationAssetId,
  //   };

  //   try {
  //     const res = await fetch("https://saaspro.softtrails.net/saas/asset/pro/assetmapping", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });
  //     const data = await res.json();

  //     if (!res.ok || data.error) throw new Error(data.message || "Failed to map assets");

  //     // Step 1: Sub Stage Update for Source Asset
  //     const sessionStorageUserId = sessionStorage.getItem("userId");
  //     const parsedUserId = parseInt(sessionStorageUserId, 10);

  //     const updatePayload = {
  //       category_id: sourceCategoryId,
  //       user_id: parsedUserId,
  //       new_stages: "Mapped",
  //       sub_stages: "AwaitingApproval",
  //       toapprove: "Mapping",
  //       action: "MappingRequest",
  //     };

  //     const updateResponse = await fetch(
  //       `https://saaspro.softtrails.net/saas/asset/pro/lifecycle/sub_stage/${sourceAssetId}`,
  //       {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(updatePayload),
  //       }
  //     );

  //     const updateData = await updateResponse.json();
  //     if (!updateResponse.ok || updateData.error) {
  //       throw new Error(updateData.message || "Failed to update sub-stage.");
  //     }

  //     // Step 2: Insert into Asset History for Source Asset
  //     const historyPayload = {
  //       assetId: sourceAssetId,
  //       categoryId: sourceCategoryId,
  //       updatedBy: parsedUserId,
  //       previousSubStages: "Added",
  //       currentSubStages: "AwaitingApproval",
  //       currentStatus: "Inventory",
  //       locationId: null,
  //       assetname: sourceAsset.label || "", // assuming label contains name
  //       previousStatus: "Inventory",
  //       action: "Asset Mapping Request",
  //     };

  //     const historyResponse = await fetch(
  //       "https://saaspro.softtrails.net/saas/java/pro/api/assethistory/insert-history",
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(historyPayload),
  //       }
  //     );

  //     const historyData = await historyResponse.json();
  //     if (!historyResponse.ok || historyData.error) {
  //       throw new Error(historyData.message || "Failed to insert asset history.");
  //     }
  //    await fetchTableData();
  //     alert("Asset to Asset Mapping Successful!");
  //     setIsSubmitMapModalState({ isOpen: false });
  //   } catch (err) {
  //     alert("Error: " + err.message);
  //   }
  // };
  const handleAssetToAssetMapping = async () => {
    const token = sessionStorage.getItem("token"); // Authorization token

    if (
      !sourceCategory ||
      !destinationCategory ||
      !sourceAsset ||
      !destinationAsset
    ) {
      setMessage("Please select all fields for Asset to Asset mapping.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const sourceAssetId = parseInt(sourceAsset.value, 10);
    const destinationAssetId = parseInt(destinationAsset.value, 10);
    const sourceCategoryId = parseInt(sourceCategory.value, 10);
    const destinationCategoryId = parseInt(destinationCategory.value, 10);

    const payload = {
      sourceCategory_Id: sourceCategoryId,
      destinationCategory_Id: destinationCategoryId,
      sourceAssetId,
      destinationAssetId,
    };

    try {
      const parseResponse = async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          return await response.text();
        }
      };

      // ✅ Step 1: Asset Mapping API call
      const res = await fetch(`${ASSET_NODE_BASE}assetmapping`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(payload),
      });

      const data = await parseResponse(res);
      if (!res.ok || data.error) {
        throw new Error(data.message || "Failed to map assets");
      }

      // ✅ Step 2: Sub Stage Update for Source Asset
      const sessionStorageUserId = sessionStorage.getItem("userId");
      const parsedUserId = parseInt(sessionStorageUserId, 10);

      if (!parsedUserId || isNaN(parsedUserId)) {
        throw new Error("User not logged in or invalid User ID.");
      }

      const updatePayload = {
        category_id: sourceCategoryId,
        user_id: parsedUserId,
        new_stages: "Mapped",
        sub_stages: "AwaitingApproval",
        toapprove: "Mapping",
        action: "MappingRequest",
        submodule: "Movable",
      };

      const updateResponse = await fetch(
        `${ASSET_NODE_BASE}lifecycle/sub_stage/${sourceAssetId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(updatePayload),
        }
      );

      const updateData = await parseResponse(updateResponse);
      if (!updateResponse.ok || updateData.error) {
        throw new Error(updateData.message || "Failed to update sub-stage.");
      }

      // ✅ Step 3: Insert into Asset History for Source Asset
      const historyPayload = {
        assetId: sourceAssetId,
        categoryId: sourceCategoryId,
        updatedBy: parsedUserId,
        previousSubStages: "Added",
        currentSubStages: "AwaitingApproval",
        currentStatus: "Inventory",
        locationId: null,
        assetname: sourceAsset.label || "",
        previousStatus: "Inventory",
        action: "Asset Mapping Request",
      };

      const historyResponse = await fetch(
        `${JAVA_BASE}api/assethistory/insert-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(historyPayload),
        }
      );

      const historyData = await parseResponse(historyResponse);
      if (!historyResponse.ok || historyData.error) {
        throw new Error(
          historyData.message || "Failed to insert asset history."
        );
      }

    await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);


      setMessage("Asset to Asset Mapping Successful!");
      setMessageType("success");
      setIsSubmitMapModalState({ isOpen: false });

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } catch (err) {
      console.error("Error in handleAssetToAssetMapping:", err);
      setMessage(
        err.message || "An unexpected error occurred. Please try again."
      );
      setMessageType("error");
      setIsModalOpen(true);
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    }
  };

  const handlePrintQrCode = () => {
    const canvas = document.getElementById("qrCodeCanvas");

    if (!canvas) {
      alert("QR Code canvas not found.");
      return;
    }

    const imageUrl = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank", "width=600,height=400");

    if (printWindow) {
      printWindow.document.write(`
      <html>
        <head>
          <title>Print QR Code</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background: white;
            }
            img {
              max-width: 100%;
              height: auto;
            }
          </style>
        </head>
        <body>
          <img src="${imageUrl}" alt="QR Code" />
        </body>
      </html>
    `);

      printWindow.document.close();

      // Wait for image to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          printWindow.close();
        }, 500); // slight delay ensures image loads
      };
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

  // const handleinactive = async (unique_id) => {
  //   // 1. Get the userId from sessionStorage
  //   const userId = sessionStorage.getItem("userId"); // Assuming the userId is stored as a string in sessionStorage

  //   if (!userId) {
  //     console.error("User ID is missing or invalid in sessionStorage.");
  //     setMessage("User not logged in or user ID is missing.");
  //     setMessageType("error");
  //     setIsModalOpen(true); // Open the modal with error message
  //     return;
  //   }

  //   const parsedUserId = parseInt(userId, 10); // Convert userId to an integer

  //   if (isNaN(parsedUserId)) {
  //     console.error("Invalid User ID retrieved from sessionStorage.");
  //     setMessage("Invalid User ID.");
  //     setMessageType("error");
  //     setIsModalOpen(true); // Open the modal with error message
  //     return;
  //   }
  //   console.log("Retrieved User ID:", parsedUserId);

  //   // 2. Ensure selectedCategory is available and fetch the corresponding category ID
  //   if (!selectedCategory) {
  //     console.error("No category selected.");
  //     setMessage("Please select a category.");
  //     setMessageType("error");
  //     setIsModalOpen(true); // Open the modal with error message
  //     return;
  //   }

  //   // Find the category object from the categories array based on selectedCategory (category name)
  //   const selectedCategoryObj = categories.find(
  //     (category) => category.categoriesname === selectedCategory
  //   );

  //   if (!selectedCategoryObj) {
  //     console.error("Category not found in the categories list.");
  //     setMessage("Invalid or missing category.");
  //     setMessageType("error");
  //     setIsModalOpen(true); // Open the modal with error message
  //     return;
  //   }

  //   const selectedCategoryId = selectedCategoryObj.categoryId; // Get the category ID
  //   console.log("Selected Category ID:", selectedCategoryId);

  //   // 3. Prepare the payload
  //   const payload = {
  //     category_id: selectedCategoryId, // Use the retrieved category ID
  //     user_id: parsedUserId, // Use the parsed userId
  //     new_stages: "Inactive", // New status
  //     sub_stages: "AwaitingApproval",
  //     toapprove: "Inactive",
  //     action: "MappingRequest", // Action to be performed
  //   };

  //   // 4. Make the API call to approve the asset
  //   try {
  //     const response = await fetch(
  //       `https://saaspro.softtrails.net/saas/asset/pro/lifecycle/sub_stage/${unique_id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     console.log("Approval successful:", data);
  //     setIsAssetModalOpen(false); // Open the modal with success message
  //     setMessage("Asset successfully Sent For Inactive Request!"); // Success message
  //     setMessageType("success"); // Success type
  //   } catch (error) {
  //     console.error("Approval failed:", error);
  //     setMessage("Failed to inactive the asset. Please try again.");
  //     setMessageType("error"); // Error type
  //     setIsAssetModalOpen(false); // Open the modal with error message
  //   }
  // };

  const handleinactive = async (unique_id) => {
    const token = sessionStorage.getItem("token"); // Authorization token

    // 1. Get the userId from sessionStorage
    const userId = sessionStorage.getItem("userId");
    if (!userId) {
      setMessage("User not logged in or user ID is missing.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      setMessage("Invalid User ID.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    // 2. Ensure selectedCategory is available
    if (!selectedCategory) {
      setMessage("Please select a category.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const selectedCategoryObj = categories.find(
      (category) => category.categoriesname === selectedCategory
    );

    if (!selectedCategoryObj) {
      setMessage("Invalid or missing category.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const selectedCategoryId = selectedCategoryObj.categoryId;

    // 3. Get asset details from local data
    const asset = tableData?.data?.find((a) => a.unique_id === unique_id);
    if (!asset) {
      setMessage("Asset data not found.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const previousStages = asset?.stages || "";
    const previousSubStages = asset?.sub_stages || "";
    const previousStatus = asset?.status || "";
    const assetname = asset?.["Asset Name"] || "";

    const payload = {
      category_id: selectedCategoryId,
      user_id: parsedUserId,
      new_stages: "Inactive",
      sub_stages: "AwaitingApproval",
      toapprove: "Inactive",
      action: "MappingRequest",
      submodule: "Movable",
    };

    try {
      const parseResponse = async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          return await response.text();
        }
      };

      // 4. Call API to update asset stage
      const response = await fetch(
        `${ASSET_NODE_BASE}lifecycle/sub_stage/${unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await parseResponse(response);
      if (!response.ok || data.error) {
        throw new Error(data.message || "Failed to update asset stage.");
      }

      // 5. Prepare history payload
      const historyPayload = {
        assetId: unique_id,
        categoryId: selectedCategoryId,
        updatedBy: parsedUserId,
        assetname,
        previousSubStages,
        currentSubStages: "AwaitingApproval",
        previousStatus,
        currentStatus: "Inactive",
        previousStages,
        currentStages: "Inactive",
        action: "Asset Inactive Request",
      };

      // 6. Call Asset History API
      const historyRes = await fetch(
        `${JAVA_BASE}api/assethistory/insert-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(historyPayload),
        }
      );

      const historyData = await parseResponse(historyRes);
      if (!historyRes.ok || historyData.error) {
        throw new Error(historyData.message || "Failed to log asset history.");
      }

      setIsAssetModalOpen(false);
      setMessage("Asset successfully Sent For Inactive Request!");
      setMessageType("success");
 await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } catch (error) {
      console.error("Inactive request failed:", error);
      setMessage(
        error.message || "Failed to mark asset as inactive. Please try again."
      );
      setMessageType("error");
      setIsAssetModalOpen(false);
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    }
  };

  const handleDiscard = async (unique_id) => {
    const token = sessionStorage.getItem("token"); // Authorization token
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      setMessage("User not logged in or user ID is missing.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
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

    if (!selectedCategoryObj) {
      setMessage("Invalid or missing category.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const selectedCategoryId = selectedCategoryObj.categoryId;

    const asset = tableData?.data?.find((a) => a.unique_id === unique_id);
    if (!asset) {
      setMessage("Asset data not found.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const previousStages = asset?.stages || "";
    const previousSubStages = asset?.sub_stages || "";
    const previousStatus = asset?.status || "";
    const assetname = asset?.["Asset Name"] || "";

    const payload = {
      category_id: selectedCategoryId,
      user_id: parsedUserId,
      new_stages: "Discard",
      sub_stages: "AwaitingApproval",
      toapprove: "Discard",
      action: "DiscardRequest",
      submodule: "Movable",
    };

    try {
      const parseResponse = async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          return await response.text();
        }
      };

      const response = await fetch(
        `${ASSET_NODE_BASE}lifecycle/sub_stage/${unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await parseResponse(response);
      if (!response.ok || data.error) {
        throw new Error(data.message || "Failed to update asset stage.");
      }

      const historyPayload = {
        assetId: unique_id,
        categoryId: selectedCategoryId,
        updatedBy: parsedUserId,
        assetname,
        previousSubStages,
        currentSubStages: "AwaitingApproval",
        previousStatus,
        currentStatus: "Discard",
        previousStages,
        currentStages: "Discard",
        action: "Asset Discard Request",
      };

      const historyRes = await fetch(
        `${JAVA_BASE}api/assethistory/insert-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(historyPayload),
        }
      );

      const historyData = await parseResponse(historyRes);
      if (!historyRes.ok || historyData.error) {
        throw new Error(historyData.message || "Failed to log asset history.");
      }

      setIsAssetModalOpen(false);
      setMessage("Asset successfully Discarded!");
      setMessageType("success");
     await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } catch (error) {
      console.error("Discard request failed:", error);
      setMessage(
        error.message || "Failed to discard the asset. Please try again."
      );
      setMessageType("error");
      setIsAssetModalOpen(false);
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    }
  };

  const handleactive = async (unique_id) => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      setMessage("User not logged in or user ID is missing.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
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

    if (!selectedCategoryObj) {
      setMessage("Invalid or missing category.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const selectedCategoryId = selectedCategoryObj.categoryId;

    const asset = tableData?.data?.find((a) => a.unique_id === unique_id);
    if (!asset) {
      setMessage("Asset data not found.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    const previousStages = asset?.stages || "";
    const previousSubStages = asset?.sub_stages || "";
    const previousStatus = asset?.status || "";
    const assetname = asset?.["Asset Name"] || "";

    const payload = {
      category_id: selectedCategoryId,
      user_id: parsedUserId,
      new_stages: "Active",
      sub_stages: "AwaitingApproval",
      toapprove: "Active",
      action: "ActiveRequest",
    };

    try {
      const parseResponse = async (response) => {
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
          return await response.json();
        } else {
          return await response.text();
        }
      };

      const response = await fetch(
        `${ASSET_NODE_BASE}lifecycle/sub_stage/${unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await parseResponse(response);
      if (!response.ok || data.error) {
        throw new Error(data.message || "Failed to update asset stage.");
      }

      const historyPayload = {
        assetId: unique_id,
        categoryId: selectedCategoryId,
        updatedBy: parsedUserId,
        assetname,
        previousSubStages,
        currentSubStages: "AwaitingApproval",
        previousStatus,
        currentStatus: "Active",
        previousStages,
        currentStages: "Active",
        action: "Asset Active Request",
      };

      const historyRes = await fetch(
        `${JAVA_BASE}api/assethistory/insert-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(historyPayload),
        }
      );

      const historyData = await parseResponse(historyRes);
      if (!historyRes.ok || historyData.error) {
        throw new Error(historyData.message || "Failed to log asset history.");
      }

      setIsAssetModalOpen(false);
      setMessage("Asset Active Request successfully sent!");
      setMessageType("success");
      await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    } catch (error) {
      console.error("Active request failed:", error);
      setMessage(
        error.message || "Failed to send the Request. Please try again."
      );
      setMessageType("error");
      setIsAssetModalOpen(false);
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
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
    const colors = ["text-blue-500", "text-purple-500"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const stageColors = {};

  const getStageColor = (stage) => {
    if (!stageColors[stage]) {
      stageColors[stage] = getRandomColor(); // Assign a random color if not already assigned
    }
    return stageColors[stage];
  };

  // PDF Export
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const allFields = getAllFields();

    const tableRows = filteredData.map((item) =>
      allFields.map((field) => {
        const value = item[field];
        if (field === "created_at") return formatDate(value);
        if (field === "stages" || field === "sub_stages")
          return formatStages(value);
        return value !== undefined ? value : "";
      })
    );

    doc.autoTable({
      head: [allFields],
      body: tableRows,
      styles: { fontSize: 6 },
    });

    doc.save("dynamic-assets.pdf");
  };

  // Excel Export
  const handleExportExcel = () => {
    const allFields = getAllFields();

    const data = filteredData.map((item) => {
      const row = {};
      allFields.forEach((field) => {
        const value = item[field];
        row[field] =
          field === "created_at"
            ? formatDate(value)
            : field === "stages" || field === "sub_stages"
            ? formatStages(value)
            : value || "";
      });
      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const dataBlob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(dataBlob, "dynamic-assets.xlsx");
  };

  const ignoredFields = [
    "__v",
    "updatedAt",
    "stages",
    "sub_stages",
    "toapprove",
  ];
  const getAllFields = () => {
    const allKeys = new Set();
    filteredData.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (!ignoredFields.includes(key)) {
          allKeys.add(key);
        }
      });
    });
    return Array.from(allKeys);
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
{/* Category Dropdown + Search + Export */}
<div className="flex flex-wrap items-center justify-between gap-6 mb-4">

  {/* Left Section: Category + Search */}
  <div className="flex flex-wrap items-center gap-4">

    {/* Category Dropdown */}
    <div className="w-[250px]">
      <Select
        name="category"
        options={categoryOptions}
        value={categoryOptions.find(
          (opt) => opt.value === selectedCategory
        )}
        onChange={(selectedOption) =>
          handleChange({
            target: {
              name: "category",
              value: selectedOption.value,
            },
          })
        }
        className="react-select-container"
        classNamePrefix="react-select"
        placeholder="Select Asset Category"
        isSearchable
        styles={{
          control: (base) => ({
            ...base,
            height: "42px",
            borderColor: "#cbd5e1",
            boxShadow: "none",
            '&:hover': { borderColor: "#3b82f6" },
          }),
        }}
      />
    </div>

    {/* Search Bar */}
    <div className="relative w-[250px]">
      <input
        id="search"
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

  {/* Right Section: Export Buttons */}
  <div className="flex gap-4">
    <button onClick={handleExportExcel}>
      <img src={Excel} alt="Export to Excel" className="w-10 h-10" />
    </button>

    <button onClick={handleExportPDF}>
      <img src={pdf} alt="Export to PDF" className="w-10 h-10" />
    </button>
  </div>
</div>



            {/* Table */}
            <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
                <table className="min-w-full table-auto text-sm border-collapse">
                  <thead
                    className="text-[16px] font-medium bg-white sticky top-0 "
                    style={{ boxShadow: "0 2px 0 black" }}
                  >
                    <tr>
                      {selectedCategory && (
                        <th className="p-5 text-center">S.no</th>
                      )}

                      {[
                        "Asset ID",
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
        >
          {selectedCategory && (
  <td className="px-5 py-3 text-center font-medium text-gray-700">
    {(pagination.offset ?? 0) + index + 1}
  </td>
)}


          {[
            "unique_id",
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
              <div className="flex justify-center items-center gap-3">
                <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(asset.unique_id);
                  }}
                >
                  <FaEye className="text-base" />
                </button>
                <button
                  className="text-gray-600 hover:text-gray-800"
                  onClick={() =>
                    handleQrCodeFetch(asset.category_id, asset.unique_id)
                  }
                >
                  <BiQr className="text-base" />
                </button>

     <button
  className="text-indigo-600 hover:text-indigo-800"
  title="View Asset History"
  onClick={(e) => {
    e.stopPropagation(); // Prevent triggering row click
    handleViewHistory(asset);
  }}
>
  <FiClock className="text-base" />
</button>

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
    ))
  ) : (
    <tr>
      <td
        colSpan={selectedCategory ? 8 : 7}
        className="text-center py-6 text-gray-500 italic"
      >
        No assets found.
      </td>
    </tr>
  )}
</tbody>

                </table>
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
                        const isEditableField = [].includes(field.columnName);

                        // Format the date fields without the time and timezone
                        const fieldValue = field.columnName.includes("Date")
                          ? formData[field.columnName]
                            ? new Date(formData[field.columnName])
                                .toISOString()
                                .split("T")[0] // Format date
                            : ""
                          : formData[field.columnName] || "";

                        return (
                          <div
                            key={index}
                            className="flex flex-col mb-2 w-full"
                          >
                            {fieldValue &&
                            typeof fieldValue === "object" &&
                            fieldValue.url ? (
                              <>
                                <label
                                  htmlFor={field.columnName}
                                  className="mb-1 text-sm font-medium text-gray-700"
                                >
                                  View Document
                                </label>
                                <a
                                  href={fieldValue.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline break-words text-sm hover:text-blue-800 transition-all duration-300"
                                  title="Click to view document"
                                >
                                  {fieldValue.url.split("/").pop()}{" "}
                                  {/* Extracts and shows just the file name */}
                                </a>
                              </>
                            ) : (
                              <>
                                <label
                                  htmlFor={field.columnName}
                                  className="mb-1 text-sm font-medium text-gray-700"
                                >
                                  {field.columnName === "Useful Life"
                                    ? "Useful Life (in months)"
                                    : field.columnName === "Scrap Value"
                                    ? "Scrap Value (in Rupees)"
                                    : field.columnName === "Original Cost"
                                    ? "Original Cost (in Rupees)"
                                    : field.columnName}
                                </label>
                                <input
                                  type="text"
                                  name={field.columnName}
                                  value={fieldValue}
                                  onChange={handleChange}
                                  className="p-2 rounded border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0] w-full"
                                  disabled={!isEditableField}
                                />
                              </>
                            )}

                            {formErrors[field.columnName] && (
                              <span className="text-red-600 text-sm mt-1">
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
                              setIsAssetModalOpen(false); // Close the current modal
                              setIsSubmitMapModalState({
                                ...isSubmitMapModalState,
                                isOpen: true, // Open the new modal
                                editingAssetId, // Pass the editing asset ID
                              });
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                          >
                            Allocation Request
                          </button>
                        </>
                      ) : formData.stages === "Active" &&
                        formData.sub_stages === "AwaitingApproval" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleinactive(editingAssetId)}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                          >
                            Inactive Request
                          </button>
                        </>
                      ) : formData.stages === "Mapped" &&
                        formData.sub_stages === "Approved" ? (
                        <button className=" "></button>
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
                              setIsAssetModalOpen(false); // Close the current modal
                              setIsSubmitMapModalState({
                                ...isSubmitMapModalState,
                                isOpen: true, // Open the new modal
                                editingAssetId, // Pass the editing asset ID
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

            {/* Submit Mapping Modal */}
            {!!isSubmitMapModalState?.isOpen && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50">
                <div className="bg-white rounded-xl shadow-xl w-11/12 sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3 p-6 relative transform transition-all">
                  {/* Cross Button */}
                  <button
                    onClick={() => {
                      setMappingType(null);
                      setIsSubmitMapModalState({ isOpen: false });
                    }}
                    className="absolute top-4 right-4 text-red-600 hover:text-red-800 text-3xl transition duration-200"
                  >
                    &times;
                  </button>

                  {/* Mapping Type Selection */}
                  {mappingType === null ? (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 text-center">
                        Select Allocation Type
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
                        <button
                          onClick={() => setMappingType("user-only")}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                        >
                          Allocation To User
                        </button>
                        <button
                          onClick={() => setMappingType("user-with-location")}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                        >
                          Allocation with Location
                        </button>
                        <button
                          onClick={() => setMappingType("asset-to-asset")}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                        >
                          Asset To Asset Mapping
                        </button>
                      </div>
                    </div>
                  ) : mappingType === "asset-to-asset" ? (
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-center border-b pb-3">
                        Asset to Asset Mapping
                      </h2>
                      <div>
                        <label className="block mb-1 font-medium">
                          Source Category
                        </label>
                        <Select
                          options={getCategoryOptions}
                          value={sourceCategory}
                          onChange={setSourceCategory}
                          placeholder="Select source category"
                          isDisabled
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">
                          Source Asset
                        </label>
                        <Select
                          options={sourceAssetOptions}
                          value={sourceAsset}
                          onChange={setSourceAsset}
                          placeholder="Select source asset"
                          isDisabled
                        />
                      </div>

                      <div>
                        <label className="block mb-1 font-medium">
                          Destination Category
                        </label>
                        <Select
                          options={getCategoryOptions}
                          value={destinationCategory}
                          onChange={setDestinationCategory}
                          placeholder="Select destination category"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">
                          Destination Asset
                        </label>
                        <Select
                          options={destinationAssetOptions}
                          value={destinationAsset}
                          onChange={setDestinationAsset}
                          placeholder="Select destination asset"
                          isSearchable
                        />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0 mt-6">
                        <button
                          type="button"
                          onClick={() => setMappingType(null)}
                          className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={handleAssetToAssetMapping}
                          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                        >
                          Submit Mapping
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3 text-center">
                        {mappingType === "user-only"
                          ? "Allocation With User"
                          : "Allocation with Location"}
                      </h2>

                      {mappingType === "user-with-location" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Location:
                            </label>
                            <select
                              name="location"
                              value={isSubmitMapModalState?.locationId || ""}
                              onChange={handleLocationChange}
                              className="w-full p-3 border rounded-lg bg-gray-100"
                            >
                              <option value="" disabled>
                                Select Location
                              </option>
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

                          {isSubmitMapModalState?.locationId &&
                            subLocations.length > 0 && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Sub-location:
                                </label>
                                <select
                                  name="subLocation"
                                  value={
                                    isSubmitMapModalState?.subLocationId || ""
                                  }
                                  onChange={(e) => {
                                    const selectedSubLocation =
                                      subLocations.find(
                                        (subLocation) =>
                                          subLocation.sub_location_id ===
                                          parseInt(e.target.value, 10)
                                      );
                                    if (selectedSubLocation) {
                                      setIsSubmitMapModalState({
                                        ...isSubmitMapModalState,
                                        subLocationId:
                                          selectedSubLocation.sub_location_id,
                                      });
                                    }
                                  }}
                                  className="w-full p-3 border rounded-lg bg-gray-100"
                                >
                                  <option value="" disabled>
                                    Select Sub-location
                                  </option>
                                  {subLocations.map((subLocation, index) => (
                                    <option
                                      key={index}
                                      value={subLocation.sub_location_id}
                                    >
                                      {`Building: ${subLocation.building_no}, Floor: ${subLocation.floor}, Room: ${subLocation.room}`}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                        </>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allocated User:
                        </label>
                        <select
                          name="userId"
                          value={isSubmitMapModalState?.userId || ""}
                          onChange={(e) => {
                            const selectedUserId = e.target.value;
                            const selectedUser = allUsers.find(
                              (user) => user.user_id == selectedUserId
                            );
                            const manager = allUsers.find(
                              (user) => user.user_id == selectedUser?.manager_id
                            );
                            setIsSubmitMapModalState({
                              ...isSubmitMapModalState,
                              userId: selectedUserId,
                              managerName: manager
                                ? `${manager.first_name} ${manager.last_name}`
                                : "No Manager Assigned",
                            });
                          }}
                          className="w-full p-3 border rounded-lg bg-gray-100"
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

                      {mappingType === "user-only" &&
                        isSubmitMapModalState?.managerName && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              User Manager:
                            </label>
                            <input
                              type="text"
                              value={isSubmitMapModalState.managerName}
                              readOnly
                              className="w-full p-3 border rounded-lg bg-gray-200 text-gray-700"
                            />
                          </div>
                        )}

                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0 mt-6">
                        <button
                          type="button"
                          onClick={() => setMappingType(null)}
                          className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                        >
                          Back
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleMapped(isSubmitMapModalState?.editingAssetId)
                          }
                          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* QR Code Modal */}
            {isQrModalOpen && qrCodeData && (
              <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white p-4 rounded shadow-lg relative">
                  <h2 className="text-lg font-bold mb-4">QR Code</h2>

                  {/* Close Icon (X) */}
                  <button
                    className="absolute top-2 right-2 text-xl text-red-700 hover:text-red-900"
                    onClick={() => setIsQrModalOpen(false)}
                  >
                    &times; {/* HTML entity for "X" */}
                  </button>

                  {/* QR Code Canvas */}
                  <div
                    id="printableQrCode"
                    className="flex flex-col items-center"
                  >
                    <QRCodeCanvas
                      id="qrCodeCanvas"
                      value={qrCodeData}
                      size={256}
                      fgColor="#000"
                      bgColor="#fff"
                    />
                  </div>

                  {/* Buttons for Download and Print */}
                  <div className="mt-4 flex space-x-2 justify-center">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={handleDownloadQrCode}
                    >
                      Download QR Code
                    </button>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      onClick={handlePrintQrCode}
                    >
                      Print QR Code
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
  <AssetHistoryDrawer
  assetId={selectedAssetId}
  categoryId={selectedCategory}
  assetName={selectedAsset?.["Asset Name"]}
  open={isHistoryOpen}
  onClose={() => setIsHistoryOpen(false)}
/>


    </div>
  );
};
export default AssetManagementPage;
