import React, { useState, useEffect,useCallback, useMemo } from "react";
import { FaHome, FaSignOutAlt, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for date picker
import { format } from "date-fns";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { HiUpload } from "react-icons/hi";
import Select from "react-select";
import * as XLSX from "xlsx";
import Excel from "../../assests/excel.png";
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
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
  const [startDate, setStartDate] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null); // State to store the selected asset for full details
  const [error, setError] = useState(""); // Add this state to handle errors
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState(""); // State to store the type of message
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState("");
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileFieldName, setFileFieldName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [services, setServices] = useState([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [dates, setDates] = useState({}); // Object to store dates for each field
  const [unitValue, setUnitValue] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("");
  const unitOptions = ["cm", "meter", "litre", "kg", "inch"];
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [allowedDocuments, setAllowedDocuments] = useState([]);
  const [selectedAllowedDoc, setSelectedAllowedDoc] = useState(null);
  const [uploadFormats, setUploadFormats] = useState([]);
  const [publishId, setPublishId] = useState(null);
  const [pagination, setPagination] = useState({
  total: 0,
  limit: 20,
  offset: 0,
  nextOffset: null,
  prevOffset: null,
});
 const [isUploading, setIsUploading] = useState(false);

const [debounceTimer, setDebounceTimer] = useState(null);

const [isPaginating, setIsPaginating] = useState(false);
useEffect(() => {
  if (selectedService && selectedDocumentType) {
    const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

    if (!token) {
      console.error("Token is missing in sessionStorage.");
      return;
    }

    fetch(
     `${DMS_BASE}dmsapi/upload?service_id=${selectedService.service_id}&doctype_id=${selectedDocumentType.doctype_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setAllowedDocuments(data);
        console.log("Allowed Documents:", data);
      })
      .catch((err) => console.error("Error fetching allowed documents:", err));
  }
}, [selectedService, selectedDocumentType]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo
      if (!token) {
        console.error("Token is missing in sessionStorage.");
        return;
      }

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

  fetchCategories();
  fetchTableData();

 
}, []);
// Empty dependency array ensures this effect runs once on mount

  useEffect(() => {
    if (!isAssetModalOpen) {
      setEditingAssetId(null);
      setFormData({});
      setDates({});
      setFormErrors({});
    }
  }, [isAssetModalOpen]);

useEffect(() => {
  const token = sessionStorage.getItem("token");

  // ✅ Fetch all services
  fetch( `${DMS_BASE}dmsapi/upload`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`, // 🔹 send token in headers
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      console.log("Services:", data);
      setServices(data);
    })
    .catch((err) => console.error("Error fetching services:", err));

  // ✅ Fetch document types when a service is selected
  if (selectedService) {
    fetch(
       `${DMS_BASE}upload?service_id=${selectedService.service_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, // 🔹 token here too
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        console.log("Document Types Response:", data);
        setDocumentTypes(Array.isArray(data) ? data : []); // Prevent .map error
      })
      .catch((err) => console.error("Error fetching document types:", err));
  }
}, [selectedService]);


  const handleDateChange = (date, columnName) => {
    if (date) {
      setDates((prevDates) => ({
        ...prevDates,
        [columnName]: date, // Store date per column
      }));
      handleChange({
        target: { name: columnName, value: format(date, "yyyy-MM-dd") },
      });
    } else {
      setDates((prevDates) => ({
        ...prevDates,
        [columnName]: null,
      }));
      handleChange({ target: { name: columnName, value: "" } });
    }
  };
  const getInputType = (dataType) => {
    switch (dataType) {
      case "date":
        return "date";
      case "integer":
        return "number";
      case "text":
        return "text";
      case "file": // Added case for file input type
        return "file";
      default:
        return "text";
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
      status: "Repository", 
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




  const handleSelectedFileUpload = async (file, fieldName) => {
  if (
    file &&
    selectedService &&
    selectedDocumentType &&
    selectedAllowedDoc &&
    publishId
  ) {
    const uploadedUrl = await handleFileUpload(file);

    if (uploadedUrl) {
      // ✅ Save URL + filename (object ke form me)
      setFormData((prev) => ({
        ...prev,
        [fieldName]: {
          url: uploadedUrl,
          name: file.name, // ✅ temporary filename bhi store karo
        },
      }));
    } else {
      console.error("File upload failed");
    }

    setIsFileModalOpen(false);
  } else {
    console.warn("Missing service/docType/allowedDoc/publishId");
  }
};


  const renderDynamicForm = (columns) => {
    return columns.map((column, index) => {
      if (column && column.columnName && column.dataType) {
        return (
          <div key={index} className="form-group">
            <label htmlFor={column.columnName}>{column.columnName}</label>
            <input
              id={column.columnName}
              type={getInputType(column.dataType)}
              name={column.columnName}
              value={formData[column.columnName] || ""}
              onChange={handleChange}
              className="form-input"
            />
          </div>
        );
      }
      return null; // Skip invalid entries
    });
  };

  // Handle the form data change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    let errorMsg = "";

    if (type === "file") {
      // Handle file input
      setFormData({
        ...formData,
        [name]: files[0], // Store the first file in the array
      });
    } else {
      // Identify field data type from columns list
      const fieldDataType = filteredDynamicFields.find(
        (field) => field.columnName === name
      )?.dataType;

      if (fieldDataType === "numeric" || fieldDataType === "integer") {
        // Validate number fields
        if (!/^\d*\.?\d*$/.test(value)) {
          errorMsg = "Only numeric values are allowed";
        }
      } else if (fieldDataType === "date") {
        // Validate date fields
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          errorMsg = "Date format should be YYYY-MM-DD";
        }
      }

      // Update form data if no validation errors
      if (!errorMsg) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          [name]: value,
        }));
      }

      // Store validation errors
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: errorMsg,
      }));
    }

    // Clear errors and update category-specific fields
    if (name === "category") {
      setSelectedCategory(value);
      fetchTableData(value);
      handleEdit(value);

      // Clear form errors when switching category
      setFormErrors({});
      setFormData({}); // Optional: Reset form fields on category change
    }
  };
  const handleSelectChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    handleChange({ target: { name: "category", value: selectedOption.value } });
  };

  console.log(tableData);

  const resetForm = () => {
    setFormData({}); // Reset form data but keep selectedCategory
    setStartDate(null); // Reset the date picker if you're using one
    setFormErrors({}); // Clear form errors
  };

  // Handle search term changes and update filtered data
  // const handleSubmit = async (e) => {
  //   e.preventDefault(); // Prevent form default behavior

  //   setMessage(""); // Clear previous messages
  //   setMessageType(""); // Reset the modal type
  //   setFormErrors({}); // Clear previous form errors

  //   // 1. Retrieve and validate `user_id` from sessionStorage
  //   const userId = sessionStorage.getItem("userId");

  //   if (!userId) {
  //     console.error("User ID is missing or invalid in sessionStorage.");
  //     setMessage("User not logged in or user ID is missing.");
  //     setMessageType("error");
  //     setIsModalOpen(true); // Open error modal
  //     return;
  //   }

  //   const parsedUserId = parseInt(userId, 10);

  //   if (isNaN(parsedUserId)) {
  //     console.error("Invalid User ID retrieved from sessionStorage.");
  //     setMessage("Invalid User ID.");
  //     setMessageType("error");
  //     setIsModalOpen(true); // Open error modal
  //     return;
  //   }

  //   console.log("Retrieved User ID:", parsedUserId);

  //   // 2. Ensure `selectedCategory` is available and valid
  //   if (!selectedCategory) {
  //     console.error("No category selected.");
  //     setMessage("Please select a category.");
  //     setMessageType("error");
  //     setIsModalOpen(true); // Open error modal
  //     return;
  //   }

  //   // Log categories array for debugging
  //   console.log("Categories Array:", categories);

  //   // Log the selected category for debugging
  //   console.log("Selected Category:", selectedCategory);

  //   // Find the category object in `categories` based on `selectedCategory`
  //   const selectedCategoryObj = categories.find(
  //     (category) =>
  //       category.categoriesname.trim().toLowerCase() ===
  //       selectedCategory.trim().toLowerCase()
  //   );

  //   // Log the selected category object
  //   console.log("Selected Category Object:", selectedCategoryObj);

  //   if (!selectedCategoryObj) {
  //     console.error("Category not found in the categories list.");
  //     setMessage("Invalid or missing category.");
  //     setMessageType("error");
  //     setIsModalOpen(true); // Open error modal
  //     return;
  //   }

  //   const selectedCategoryId = selectedCategoryObj.categoryId;

  //   // Log selected category ID for debugging
  //   console.log("Selected Category ID:", selectedCategoryId);

  //   // 3. Destructure `category` from formData and prepare the payload
  //   const { category, ...filteredFormData } = formData;

  //   // Payload preparation
  //   const payload = {
  //     category_id: selectedCategoryId,
  //     user_id: parsedUserId,
  //     action: "AssetAddition", // Define the action
  //     values: filteredFormData, // Embed form data
  //   };

  //   // Log the payload before making the API request
  //   console.log("Prepared Payload:", payload);

  //   // 4. Make the API call
  //   try {
  //     const url = editingAssetId
  //       ? `https://saaspro.softtrails.net/saas/java/pro/api/crud/update/${selectedCategory}/${editingAssetId}`
  //       : `https://saaspro.softtrails.net/saas/asset/pro/insert/${selectedCategory}`;

  //     const response = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(payload),
  //     });

  //     // Log the raw response to check its content type
  //     const rawResponse = await response.text();
  //     console.log("Raw Response:", rawResponse);

  //     // Handle response based on content type
  //     if (
  //       rawResponse.toLowerCase().includes("error") ||
  //       rawResponse.toLowerCase().includes("failed")
  //     ) {
  //       console.error("Error response received:", rawResponse);
  //       setMessage("Failed to save material. Please try again.");
  //       setMessageType("error");
  //       setIsModalOpen(true); // Open error modal
  //     } else {
  //       // Success handling for non-JSON responses (like plain text or HTML)
  //       setMessage(
  //         editingAssetId
  //           ? "Material updated successfully!"
  //           : "Material created successfully!"
  //       );
  //       setMessageType("success");
  //       setIsAssetModalOpen(false); // Close modal

  //       // Fetch updated table data
  //       fetchTableData(selectedCategory);

  //       // Reset form state
  //       setFormData({});
  //       setStartDate(null);
  //       setEditingAssetId(null);
  //     }
  //   } catch (error) {
  //     console.error("Error during form submission:", error);
  //     setMessage("Failed to save material. Please try again.");
  //     setType("error");
  //     setIsModalOpen(true); // Open error modal
  //   }
  // };
 const handleAllowedDocSelect = async (allowDoc) => {
  setSelectedAllowedDoc(allowDoc);

  try {
    const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo
    if (!token) {
      console.error("Token is missing in sessionStorage.");
      return;
    }

    // 1. Fetch upload formats
    const response = await fetch(
      `${DMS_BASE}dmsapi/upload?service_id=${selectedService.service_id}&doctype_id=${selectedDocumentType.doctype_id}&allow_doc_id=${allowDoc.allow_doc_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      }
    );
    const data = await response.json();
    setUploadFormats(data?.[0]?.format || []);
    console.log("Upload Formats:", data);

    // 2. Fetch mapping
    const mappingRes = await fetch( `${DMS_BASE}mapping`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Token pass
      },
    });
    const mappingData = await mappingRes.json();

    // 3. Find matched publish_id
    const matched = mappingData.find(
      (item) =>
        item.service_id === selectedService.service_id &&
        item.doctype_id === selectedDocumentType.doctype_id &&
        item.allow_doc_id === allowDoc.allow_doc_id
    );

    if (matched) {
      setPublishId(matched.id);
      console.log("Matched publish_id:", matched.id);
    } else {
      setPublishId(null);
    }
  } catch (error) {
    console.error("Error fetching formats or mapping:", error);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();

  setMessage("");
  setMessageType("");
  setFormErrors({});

  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token"); // ✅ Token fetch

  if (!userId) {
    setMessage("User not logged in or user ID is missing.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  if (!token) {
    setMessage("User not authenticated. Token missing.");
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

  // ✅ Step 1: Process file uploads before final payload
  const processedFormData = { ...formData };

  for (const [key, value] of Object.entries(formData)) {
    if (value && typeof value === "object" && value.file) {
      const uploadedUrl = await handleFileUpload(value.file);

      if (uploadedUrl) {
        processedFormData[key] = uploadedUrl;
      } else {
        setMessage(`Failed to upload file for field: ${key}`);
        setMessageType("error");
        setIsModalOpen(true);
        return;
      }
    }
  }

  // ✅ Step 2: Filter values
  const filteredValues = Object.fromEntries(
    Object.entries(processedFormData).filter(
      ([key, value]) =>
        !["unique_id", "category_id", "categoryName","Unit Cost", "Available Materials"
].includes(key) &&
        value !== "" &&
        value !== null &&
        value !== undefined
    )
  );

  const updatedFields = {
    ...filteredValues,
    status: "Repository",
    stages: "Added",
    sub_stages: "Added",
    created_at: new Date().toISOString(),
  };

  const payload = editingAssetId
    ? {
        action: "AssetAddition",
        category_id: selectedCategoryId,
        unique_id: editingAssetId,
        fieldsToUpdate: updatedFields,
        submodule: "Raw material"
      }
    : {
        action: "AssetAddition",
        category_id: selectedCategoryId,
        user_id: parsedUserId,
        values: filteredValues,
        submodule: "Raw material"
      };

  const url = editingAssetId
    ? `${ASSET_NODE_BASE}assettable/update`
    : `${ASSET_NODE_BASE}insert/${encodeURIComponent(
        selectedCategory
      )}`;

  const method = editingAssetId ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Added token
      },
      body: JSON.stringify(payload),
    });

    const rawResponse = await response.text();
    console.log("Raw Response:", rawResponse);

    if (
      rawResponse.toLowerCase().includes("error") ||
      rawResponse.toLowerCase().includes("failed")
    ) {
      setMessage("Failed to save material. Please try again.");
      setMessageType("error");
      setIsModalOpen(true);
    } else {
      setMessage(
        editingAssetId
          ? "Material updated successfully!"
          : "Material created successfully!"
      );
      setMessageType("success");
      setIsAssetModalOpen(false);
       await fetchTableData(selectedCategory, (currentPage - 1) * itemsPerPage, itemsPerPage);
      setFormData({});
      setStartDate(null);
      setEditingAssetId(null);
    }
  } catch (error) {
    console.error("Error during form submission:", error);
    setMessage("Failed to save material. Please try again.");
    setMessageType("error");
    setIsModalOpen(true);
  }
};


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


  // Delete asset function
  const handleDelete = (asset) => {
    if (asset?.unique_id) {
      setAssetToDelete(asset); // Save full asset object
      setIsDeleteModalOpen(true);
    } else {
      console.error("Asset is undefined or invalid");
    }
  };

  // Confirm delete action
const confirmDelete = async () => {
  if (assetToDelete !== null) {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token is missing in sessionStorage.");
        setMessage("User not logged in or token is missing.");
        setMessageType("error");
        setIsDeleteModalOpen(false);
        return;
      }

      const categoryToUse = assetToDelete.categoryName || selectedCategory;

      const url = `${JAVA_BASE}api/crud/delete/${categoryToUse}/${assetToDelete.unique_id}`;
      const response = await axios.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      });


           await fetchTableData(selectedCategory, (currentPage - 1) * itemsPerPage, itemsPerPage);

      // ✅ Show success message
      setMessage("Material deleted successfully.");
      setMessageType("success");

      // Close modal and reset
      setIsDeleteModalOpen(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error("Error deleting asset:", error.message);

      // ❌ Show error message
      setMessage("Failed to delete asset. Please try again.");
      setMessageType("error");

      setIsDeleteModalOpen(false);
    }
  } else {
    console.error("No asset selected for deletion");
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
    const parsedData = {};
    Object.keys(asset).forEach((key) => {
      const value = asset[key];

      if (key.includes("date")) {
        parsedData[key] = value
          ? new Date(value).toISOString().split("T")[0] // ✅ yyyy-MM-dd format
          : "";
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


  const handleAddAsset = () => {
    setFormData({}); // Clear form data
    setIsAssetModalOpen(true); // Open the modal
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

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const handleHome = () => {
    navigate("/Cards");
  };

  // const handleApproval = async (unique_id) => {
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
  //     new_stages: "AwaitingApproval", // New status
  //     action: "AssetApproval", // Action to be performed
  //   };

  //   // 4. Make the API call to approve the asset
  //   try {
  //     const response = await fetch(
  //       `https://saaspro.softtrails.net/saas/asset/pro/lifecycle/update-asset-status/${unique_id}`,
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
  //     setMessage("Asset successfully sent for approval!"); // Success message
  //     setMessageType("success"); // Success type
  //   } catch (error) {
  //     console.error("Approval failed:", error);
  //     setMessage("Failed to approve the asset. Please try again.");
  //     setMessageType("error"); // Error type
  //     setIsAssetModalOpen(false); // Open the modal with error message
  //   }
  // };

const handleApproval = async (unique_id) => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token"); // 🔑 Token nikal lo

  if (!userId) {
    setMessage("User not logged in or user ID is missing.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  if (!token) {
    setMessage("User not logged in or token is missing.");
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

  const payload = {
    category_id: selectedCategoryId,
    user_id: parsedUserId,
    new_stages: "AwaitingApproval",
    sub_stages: "Added",
    action: "AssetAddition",
    submodule:"Raw material"
  };

  try {
    const response = await fetch(
     `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Approval successful:", data);

    setMessage("Material successfully sent for approval!");
    setMessageType("success");
    setIsAssetModalOpen(false);

    // Fetch updated table data
    await fetchTableData(
      selectedCategory,
      (currentPage - 1) * itemsPerPage,
      itemsPerPage
    );
  } catch (error) {
    console.error("Approval failed:", error);
    setMessage("Failed to approve the material. Please try again.");
    setMessageType("error");
    setIsAssetModalOpen(false);
  }
};

  // Function to refresh table data
  const refreshTableData = async () => {
    try {
      const response = await fetch("API_ENDPOINT_FOR_FETCHING_ASSETS");
      const updatedData = await response.json();
      setFilteredData(updatedData); // Update the state holding table data
    } catch (error) {
      console.error("Failed to refresh table data:", error);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Agar directly file select kiya, to S3 pe upload karo
      handleFileUpload(files[0]).then((uploadedUrl) => {
        if (uploadedUrl) {
          setFormData({
            ...formData,
            [name]: JSON.stringify({ url: uploadedUrl }), // ✅ stringify
          });
        }
      });
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
 const handleFileUpload = async (file) => {
  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  if (!file || !userId) {
    setMessage("Cannot upload file. Missing required information.");
    setMessageType("error");
    setIsModalOpen(true);
    return null;
  }

  try {
    // Step 1: Get dms_publish_id from mapping API
    const mappingRes = await fetch(
       `${DMS_BASE}mapping/check?service_name=Asset Management&doctype=Movable Assets&doc_name=Movable Assets`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const mappingData = await mappingRes.json();
    const publishId = mappingData?.dms_publish_id;

    if (!publishId) {
      setMessage("Failed to get DMS publish ID.");
      setMessageType("error");
      setIsModalOpen(true);
      return null;
    }

    // Step 2: Upload file
    const uploadData = new FormData();
    uploadData.append("documents", file);
    uploadData.append("ref", "DMS");

    const metadata = [
      {
        service: "Asset Management",
        publish_id: parseInt(publishId),
        user_id: userId,
        document_name: file.name.replace(/[^a-zA-Z0-9_.\- ]/g, ""),
      },
    ];

    uploadData.append("metadata", JSON.stringify(metadata));

    const response = await fetch(`${DMS_BASE}dmsapi/upload-documents`, {
      method: "POST",
      body: uploadData,
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error(`Upload failed with status ${response.status}`);

    const data = await response.json();
if (data.uploaded_files && data.uploaded_files.length > 0) {
  const fileUrl = data.uploaded_files[0].file_url;
  return JSON.stringify({ url: fileUrl }); // 👈 send as JSON string
}
else {
      setMessage("No file returned from upload API.");
      setMessageType("error");
      setIsModalOpen(true);
      return null;
    }
  } catch (err) {
    console.error("Upload failed:", err);
    setMessage("File upload failed. Please try again.");
    setMessageType("error");
    setIsModalOpen(true);
    return null;
  }
};


  const handleDownloadTemplate = () => {
    const headers = filteredDynamicFields
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
            "Available Materials",
            "Used Materials",
            "Unit Cost",
            "Remaining Cost"
          ].includes(column.columnName)
      )
      .map((field) => field.columnName);

    const worksheet = XLSX.utils.json_to_sheet([], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets Template");

    XLSX.writeFile(workbook, `${selectedCategory}_Asset_Template.xlsx`);
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

  const fieldNameMap = {
    uom: "Unit Of Measure",
    material_name: "Material Name",
    quantity: "Quantity",

    MIN: " Minimum Threshhold Quantity",
    MAX: "Maximum Threshhold Quantity",
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
           {/* Add Material, Category Dropdown, Search, Bulk Upload */}
<div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">

  {/* Left Section */}
  <div className="flex flex-wrap items-center gap-4">

    {/* Add Material Button */}
    <button
      onClick={handleAddAsset}
      className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition duration-200 shadow-sm w-[200px]"
    >
      + Add Material
    </button>

    {/* Category Dropdown */}
    <div className="w-[250px]">
 <Select
  options={categoryOptions}
  value={categoryOptions.find((opt) => opt.value === selectedCategory)}
  onChange={(selectedOption) => {
    const value = selectedOption.value;

    setFormData((prev) => ({
      ...prev,
      category: value,
    }));

    setSelectedCategory(value);
    fetchTableData(value); // ✅ Trigger API call immediately
  }}
  placeholder="Select Material Category"
  className="react-select-container"
  classNamePrefix="react-select"
  isSearchable
/>

    </div>

    {/* Bulk Upload Button */}
    <button
      onClick={() => setShowBulkUploadModal(true)}
      className="bg-green-600 text-white px-5 py-2.5 rounded-md flex items-center gap-2 hover:bg-green-700 transition duration-200 shadow-sm"
    >
      <HiUpload className="text-xl" />
      Bulk Upload
    </button>

  </div>

  {/* Right Section — Search Bar */}
 <div className="relative w-[250px]">
  <input
    type="text"
    placeholder="Search materials..."
    className="w-full h-[42px] pl-10 pr-8 border border-gray-300 rounded-md shadow-sm 
               focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
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

  {/* Clear Button */}
  {searchTerm && (
    <button
      className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
      onClick={() => {
        setSearchTerm("");
        fetchTableData(selectedCategory, 0, pagination.limit, "");
      }}
    >
      ✕
    </button>
  )}
</div>


</div>


           {/* Repository Table */}
<div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
  <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
  {useMemo(() => (
      <table className="min-w-full table-auto text-sm border-collapse">
        {/* 🧩 Table Header */}
        <thead className="sticky top-0 bg-white border-b-2 border-black text-[16px] font-medium">
          <tr>
            {selectedCategory && <th className="p-5 text-center">S.no</th>}
            {["Material Name", "Created On", "Status", "Stage"].map(
              (column, index) => (
                <th key={index} className="p-5 text-center">
                  {column}
                </th>
              )
            )}
            {selectedCategory && <th className="p-5 text-center">Action</th>}
          </tr>
        </thead>

        {/* 🧩 Memoized Table Body */}
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredData.map((asset, index) => (
            <tr
              key={asset.unique_id}
              className={`cursor-pointer ${
                index % 2 === 0 ? "bg-blue-50" : "bg-white"
              } hover:bg-blue-100`}
            >
              {/* S.no */}
              {selectedCategory && (
                <td className="px-5 py-3 text-center">
                  {pagination.offset + index + 1}
                </td>
              )}

              {/* Basic columns */}
              {["material_name", "created_at", "status", "stages"].map(
                (column, colIndex) => (
                  <td
                    key={colIndex}
                    className="px-5 py-3 text-center truncate"
                    title={asset[column] || ""}
                  >
                    {column === "created_at"
                      ? formatDate(asset[column])
                      : column === "stages"
                      ? formatStages(asset[column])
                      : asset[column] || "N/A"}
                  </td>
                )
              )}

              {/* Action Buttons */}
              {selectedCategory && (
                <td className="px-5 py-3 text-center whitespace-nowrap">
                  <button
                    className="text-blue-600 hover:text-blue-800 mx-1 p-2 rounded-full hover:bg-blue-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(asset.unique_id);
                    }}
                    title="Edit"
                  >
                    <FaEdit className="text-sm md:text-base" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 mx-1 p-2 rounded-full hover:bg-red-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(asset);
                    }}
                    title="Delete"
                  >
                    <FaTrash className="text-sm md:text-base" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    ), [filteredData, pagination.offset, selectedCategory])}
  </div>

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
                      {editingAssetId ? "Edit Material" : "Add Material"}
                    </h2>

                    <div className="flex items-center space-x-3">
                      {/* Bulk Upload Button */}
                      <button
                        onClick={() => setShowBulkUploadModal(true)}
                        className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                        title="Bulk Upload"
                      >
                        <HiUpload className="text-xl" />
                        Bulk Upload
                      </button>
                      {!editingAssetId &&
                        selectedCategory &&
                        filteredDynamicFields.length > 0 && (
                          <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="p-1 rounded-full hover:scale-105 transition-transform duration-200"
                            title="Download Excel Template"
                          >
                            <img
                              src={Excel}
                              alt="Excel Icon"
                              className="w-8 h-8"
                            />
                          </button>
                          
                        )}

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
                  </div>
                  <form
                    onSubmit={handleSubmit}
                    className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    <div className="flex flex-col">
                      <label
                        htmlFor="category"
                        className="mb-1 text-sm font-medium text-gray-700"
                      >
                        Material Category
                      </label>
                      <select
                        name="category"
                        value={selectedCategory}
                        onChange={handleChange}
                        className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
                        required
                      >
                        <option value="">Select Material category</option>
                        {categories.map((category, i) => (
                          <option key={i} value={category.categoriesname}>
                            {category.categoriesname}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Filter out the unwanted columns */}
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
                            "Available Materials",
                            "Used Materials",
                            "Unit Cost",
                            "Remaining Cost"
                          ].includes(column.columnName)
                      )
                      .map((field, index) => {
                        const displayName =
                          fieldNameMap[field.columnName] || field.columnName; // Use mapped name if exists

                        return (
                          <div key={index} className="flex flex-col">
                            <label
                              htmlFor={field.columnName}
                              className="mb-1 text-sm font-medium text-gray-700"
                            >
                              {displayName}
                            </label>

                            {/* UOM Field - Dropdown Only */}
                            {field.columnName === "uom" ? (
                              <select
                                name="uom"
                                value={formData.uom || ""}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    uom: e.target.value,
                                  })
                                }
                                className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0] w-full"
                              >
                                <option value="">Select Unit</option>
                                {unitOptions.map((unit, i) => (
                                  <option key={i} value={unit}>
                                    {unit}
                                  </option>
                                ))}
                              </select>
                            ) : field.dataType === "date" ? (
                  <ReactDatePicker
                    selected={
                      formData[field.columnName]
                        ? new Date(formData[field.columnName])
                        : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        [field.columnName]: date
                          ? date.toISOString().split("T")[0]
                          : "",
                      })
                    }
                    dateFormat="yyyy-MM-dd"
                    className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0] w-full"
                    placeholderText="YYYY-MM-DD"
                  />
                            ) : field.dataType === "file" ||
                              field.dataType === "json" ? (
                              /* File Upload Button */
                              <button
                                type="button"
                                className="p-2 rounded border border-gray-300 bg-[#F0F0F0] w-full text-blue-500 text-left"
                                onClick={() => {
                                  setFileFieldName(field.columnName);
                                  setIsFileModalOpen(true);
                                }}
                              >
                                {(() => {
                                  const fileVal = formData[field.columnName];
                                  if (fileVal?.file?.name)
                                    return fileVal.file.name;
                                  if (fileVal?.name) return fileVal.name;

                                  if (editingAssetId && fileVal?.url)
                                    return fileVal.url.split("/").pop();

                                  return "Upload File";
                                })()}
                              </button>
                            ) : (
                              <input
                                type="text"
                                name={field.columnName}
                                value={formData[field.columnName] || ""}
                                onChange={handleChange}
                                className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0] w-full"
                              />
                            )}

                            {/* Validation Errors */}
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

                     <div className="col-span-3 flex justify-end mt-4">
                      {formData.stages !== "AwaitingApproval" && (
                        <>
                          <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
                          >
                            {editingAssetId ? "Update Material" : "Add Material"}
                          </button>

                          {editingAssetId && (
                            <button
                              type="button"
                              onClick={() => {
                                handleApproval(editingAssetId);
                                setIsAssetModalOpen(false);
                              }}
                              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                            >
                              Submit For Approval
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

                     {isFileModalOpen && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Upload File
      </h2>

      {/* File Input */}
      <div className="mb-4">
        <label className="block text-sm font-bold text-gray-700 mb-1">
          Select File
        </label>
        <input
          type="file"
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="p-2 rounded-lg border border-gray-300 w-full"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-4">
        <button
          className={`bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50`}
          disabled={!selectedFile}
          onClick={async () => {
            if (selectedFile) {
              const uploadedUrl = await handleFileUpload(selectedFile);
              if (uploadedUrl) {
                // Add uploaded file to formData
                setFormData((prev) => ({
                  ...prev,
                  [fileFieldName]: { file: selectedFile, url: uploadedUrl },
                }));
                setIsFileModalOpen(false);
              }
            }
          }}
        >
          Upload
        </button>

        <button
          className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
          onClick={() => setIsFileModalOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
{showBulkUploadModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">Bulk Upload Assets</h2>
        <button
          onClick={() => setShowBulkUploadModal(false)}
          className="text-red-500 hover:text-red-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          if (!bulkCategory || !bulkFile)
            return alert("Please select a category and upload a file.");

          const formData = new FormData();
          formData.append("file", bulkFile);
          formData.append("action", "AssetAddition"); // ✅ Add action
          formData.append("submodule", "Raw material");     // ✅ Add submodule
          formData.append("category", bulkCategory);   // Optional but often useful

          setIsUploading(true);

          try {
            const response = await fetch(
              `${ASSET_NODE_BASE}assets/api/bulkdata/upload-excel/${bulkCategory}`,
              {
                method: "POST",
                body: formData,
                headers: {
                  Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
              }
            );

            if (response.ok) {
              setMessage("✅ Upload successful!");
              setMessageType("success");
              setShowBulkUploadModal(false);
              setBulkFile(null);
            } else {
              const errText = await response.text();
              setMessage(`❌ Upload failed: ${errText}`);
              setMessageType("error");
            }
          } catch (error) {
            console.error("Error uploading file:", error);
            setMessage("⚠️ Error occurred during upload");
            setMessageType("error");
          } finally {
            setIsUploading(false);
          }
        }}
        className="space-y-4"
      >
        {/* Category Dropdown */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Select Asset Category
          </label>
          <Select
            isSearchable
            placeholder="Select Category"
            value={
              bulkCategory
                ? {
                    value: bulkCategory,
                    label:
                      categories.find(
                        (cat) => cat.categoryId === bulkCategory
                      )?.categoriesname || "Select Category",
                  }
                : null
            }
            onChange={(option) => setBulkCategory(option?.value)}
            options={categories.map((cat) => ({
              value: cat.categoryId,
              label: cat.categoriesname,
            }))}
            className="rounded"
            classNamePrefix="react-select"
          />
        </div>

        {/* File Upload */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Upload Excel File
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setBulkFile(e.target.files[0])}
            className="p-2 border rounded"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isUploading}
          className={`px-4 py-2 rounded-lg text-white font-medium ${
            isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {/* Loader Overlay */}
      {isUploading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-3"></div>
          <p className="text-gray-700 font-medium">Processing your file...</p>
        </div>
      )}
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
       <DeleteConfirmModal
              open={isDeleteModalOpen}
              title="Delete Asset?"
              message="Are you sure you want to delete this asset?"
              onCancel={cancelDelete}
              onConfirm={confirmDelete}
              loading={false}
            />
    </div>
  );
};
export default AssetManagementPage;
