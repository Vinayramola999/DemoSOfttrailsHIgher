import React, { useState, useEffect,useMemo,useCallback} from "react";
import { FaHome, FaSignOutAlt, FaEdit, FaTrash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
//
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Import the CSS for date picker
import { format } from "date-fns";
import MessageModal from "../ApprovalAuthority/MessageModal";
import Select from "react-select";
import * as XLSX from "xlsx";
import Excel from "../../assests/excel.png";
import { HiUpload } from "react-icons/hi";
import DeleteConfirmModal from "../Components/DeleteConfirmModal"; // adjust the path as needed
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const AssetManagementPage = () => {
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tableData, setTableData] = useState({ columns: [], data: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]); // State for filtered table data
  const [editingAssetId, setEditingAssetId] = useState(null); // State for tracking which asset is being edited
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State for delete confirmation modal
  const [assetToDelete, setAssetToDelete] = useState(null); // Store asset ID to delete
  const [formErrors, setFormErrors] = useState({}); // To store form validation errors from backend
  const [startDate, setStartDate] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [error, setError] = useState(""); // Add this state to handle errors
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [dates, setDates] = useState({}); // Object to store dates for each field
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileFieldName, setFileFieldName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDocumentType, setSelectedDocumentType] = useState(null);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [allowedDocuments, setAllowedDocuments] = useState([]);
  const [selectedAllowedDoc, setSelectedAllowedDoc] = useState(null);
  const [uploadFormats, setUploadFormats] = useState([]);
  const [publishId, setPublishId] = useState(null);
 const [isUploading, setIsUploading] = useState(false);

 const [pagination, setPagination] = useState({
   total: 0,
   limit: 20,
   offset: 0,
   nextOffset: null,
   prevOffset: null,
 });
 
 const [debounceTimer, setDebounceTimer] = useState(null);
 
 const [isPaginating, setIsPaginating] = useState(false);
  const location = useLocation();
  console.log("location", location.state);

  useEffect(() => {
    if (selectedService && selectedDocumentType) {
      const token = sessionStorage.getItem("token"); // ✅ Get token
      fetch(
       `${DMS_BASE}dmsapi/upload?service_id=${selectedService.service_id}&doctype_id=${selectedDocumentType.doctype_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Add token
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setAllowedDocuments(data);
          console.log("Allowed Documents:", data);
        })
        .catch((err) =>
          console.error("Error fetching allowed documents:", err)
        );
    }
  }, [selectedService, selectedDocumentType]);

 


  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem("token"); // ✅ Get token
          const response = await axios.get(`${JAVA_BASE}api/categories/movable`, {
        headers: { Authorization: `Bearer ${token}` },
      });

        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);


    // const interval = setInterval(() => {
    //   fetchTableData(selectedCategory);
    // }, 30000);

    // return () => clearInterval(interval);
  }, [selectedCategory]);

  useEffect(() => {
    if (!isAssetModalOpen) {
      setEditingAssetId(null);
      setFormData({});
      setDates({});
      setFormErrors({});
    }
  }, [isAssetModalOpen]);

  useEffect(() => {
    const token = sessionStorage.getItem("token"); // ✅ Get token

    // Fetch all services
    fetch(`${DMS_BASE}dmsapi/upload`, {
      headers: { Authorization: `Bearer ${token}` }, // ✅ Add token
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Services:", data);
        setServices(data);
      })
      .catch((err) => console.error("Error fetching services:", err));

    // Fetch document types for selected service
    if (selectedService) {
      fetch(
        `${DMS_BASE}dmsapi/upload?service_id=${selectedService.service_id}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // ✅ Add token
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
  setTableData({
  columns,
  data: data.map((item) => ({
    ...item,
    categoryName: response.data.table || selectedCategory, // ✅ add categoryName explicitly
  })),
  table: response.data.table, // ✅ store category name for reference
});

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
      return null;
    });
  };
  const handleAllowedDocSelect = async (allowDoc) => {
    setSelectedAllowedDoc(allowDoc);

    try {
      const token = sessionStorage.getItem("token"); // ✅ Get token

      // Fetch allowed document formats
      const response = await fetch(
       `${DMS_BASE}dmsapi/upload?service_id=${selectedService.service_id}&doctype_id=${selectedDocumentType.doctype_id}&allow_doc_id=${allowDoc.allow_doc_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add token
          },
        }
      );
      const data = await response.json();
      setUploadFormats(data?.[0]?.format || []);
      console.log("Upload Formats:", data);

      // Get publish_id from mapping API
      const mappingRes = await fetch(
        `${DMS_BASE}mapping`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Add token
          },
        }
      );
      const mappingData = await mappingRes.json();
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

  //   const handleChange = async (e) => {
  //     const { name, value, type, files } = e.target;
  //     let errorMsg = "";

  //     if (type === "file") {
  //       setFormData((prevFormData) => ({
  //         ...prevFormData,
  //         [name]: files[0],
  //       }));
  //     } else {
  //       const field = filteredDynamicFields.find(
  //         (field) => field.columnName === name
  //       );
  //       const fieldDataType = field?.dataType;
  //       const isRequired = field?.isNullable === false;
  //       const trimmedValue = value?.toString().trim();
  //       // Validation rules
  //   if (isRequired && (!value || value.trim() === "")) {
  //   errorMsg = "This field is required";
  //       } else if (fieldDataType === "numeric" || fieldDataType === "integer") {
  //         if (!/^\d*\.?\d*$/.test(value.trim()) || parseFloat(value) < 0) {
  //   errorMsg = "Only positive numeric values are allowed";
  // }

  //       } else if (fieldDataType === "date") {
  //         if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
  //           errorMsg = "Date format should be YYYY-MM-DD";
  //         }
  //       }

  //       // Ensure state update happens properly
  //       setFormData((prevFormData) => ({
  //         ...prevFormData,
  //         [name]: value,
  //       }));

  //       // Store validation errors
  //       setFormErrors((prevErrors) => ({
  //         ...prevErrors,
  //         [name]: errorMsg,
  //       }));
  //     }

  //     // If category is changed, reset form fields and errors
  //     if (name === "category") {
  //       setSelectedCategory(value);
  //       await fetchTableData(value);
  //       handleEdit(value);
  //       setFormErrors({});
  //       setFormData({});
  //     }
  //   };
 const handleChange = async (e) => {
  const { name, value, type, files } = e.target;
  let errorMsg = "";

  if (type === "file") {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: files[0],
    }));
    return;
  }

  const field = filteredDynamicFields.find(
    (field) => field.columnName === name
  );
  const fieldDataType = field?.dataType;
  const isRequired = field?.isNullable === false;
  const trimmedValue = value?.toString().trim();

  // Validation
  if (isRequired && (!trimmedValue || trimmedValue === "")) {
    errorMsg = "This field is required";
  } else if (
    (fieldDataType === "numeric" || fieldDataType === "integer") &&
    (isNaN(value) || parseFloat(value) < 0)
  ) {
    errorMsg = "Only positive numeric values are allowed";
  } else if (fieldDataType === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      errorMsg = "Date must be in YYYY-MM-DD format";
    }
  }

  // Update Form Data
  setFormData((prevFormData) => ({
    ...prevFormData,
    [name]: value,
  }));

  // Update Form Errors
  setFormErrors((prevErrors) => ({
    ...prevErrors,
    [name]: errorMsg,
  }));

  // Category Change Handling
  if (name === "category") {
    setSelectedCategory(value);

    // Reset pagination to page 1
    setCurrentPage(1);

    // Fetch new category table
    await fetchTableData(value, 0, pagination.limit, searchTerm);

    // Reset form & errors
    setFormErrors({});
    setFormData({});
  }
};


  const handleSelectChange = (selectedOption) => {
    setSelectedCategory(selectedOption);
    handleChange({ target: { name: "category", value: selectedOption.value } });
  };

  console.log(tableData);

  const resetForm = () => {
    setFormData({});
    setStartDate(null);
    setFormErrors({});
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   setMessage("");
  //   setMessageType("");
  //   setFormErrors({});

  //   let updatedFormData = { ...formData }; // ✅ Copy current form fields

  //   // ✅ Handle file upload
  //   if (selectedFile && fileFieldName) {
  //     const uploadedUrl = await handleFileUpload(selectedFile);
  //     if (uploadedUrl) {
  //       updatedFormData[fileFieldName] = JSON.stringify({ url: uploadedUrl });
  //     }
  //   }

  //   const userId = sessionStorage.getItem("userId");
  //   if (!userId) {
  //     console.error("User ID missing.");
  //     setMessage("User not logged in.");
  //     setMessageType("error");
  //     setIsModalOpen(true);
  //     return false;
  //   }

  //   const parsedUserId = parseInt(userId, 10);
  //   if (isNaN(parsedUserId)) {
  //     console.error("Invalid user ID.");
  //     setMessage("Invalid user ID.");
  //     setMessageType("error");
  //     setIsModalOpen(true);
  //     return false;
  //   }

  //   if (!selectedCategory) {
  //     console.error("No category selected.");
  //     setMessage("Please select a category.");
  //     setMessageType("error");
  //     setIsModalOpen(true);
  //     return false;
  //   }

  //   // ✅ Match category object
  //   let selectedCategoryObj = categories.find(
  //     (category) => category.categoriesname.trim() === selectedCategory.trim()
  //   );

  //   if (!selectedCategoryObj) {
  //     selectedCategoryObj = categories.find(
  //       (category) =>
  //         category.categoriesname.trim().toLowerCase() ===
  //         selectedCategory.trim().toLowerCase()
  //     );
  //   }

  //   if (!selectedCategoryObj) {
  //     console.error("Category not found.");
  //     setMessage("Invalid category.");
  //     setMessageType("error");
  //     setIsModalOpen(true);
  //     return false;
  //   }

  //   const selectedCategoryId = selectedCategoryObj.categoryId;

  //   // ✅ Filter out empty fields
  //   const filteredValues = Object.fromEntries(
  //     Object.entries(updatedFormData).filter(
  //       ([key, value]) =>
  //         key !== "unique_id" &&
  //         key !== "category_id" &&
  //         key !== "categoryName" &&
  //         value !== "" &&
  //         value !== null &&
  //         value !== undefined
  //     )
  //   );

  //   if (Object.keys(filteredValues).length === 0) {
  //     setMessage("Please fill at least one field.");
  //     setMessageType("error");
  //     setIsModalOpen(true);
  //     return false;
  //   }

  //   // ✅ Construct payload based on mode
  //   const payload = editingAssetId
  //     ? {
  //         action: "AssetAddition",
  //         category_id: selectedCategoryId,
  //         unique_id: editingAssetId,
  //         fieldsToUpdate: filteredValues,
  //       }
  //     : {
  //         category_id: selectedCategoryId,
  //         user_id: parsedUserId,
  //         action: "AssetAddition",
  //         values: filteredValues,
  //       };

  //   const url = editingAssetId
  //     ? "https://saaspro.softtrails.net/saas/asset/pro/assettable/update"
  //     : `https://saaspro.softtrails.net/saas/asset/pro/insert/${encodeURIComponent(
  //         selectedCategory
  //       )}`;

  //   const method = editingAssetId ? "PUT" : "POST";

  //   try {
  //     const response = await fetch(url, {
  //       method,
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(payload),
  //     });

  //     const rawResponse = await response.text();

  //     if (
  //       rawResponse.toLowerCase().includes("error") ||
  //       rawResponse.toLowerCase().includes("failed")
  //     ) {
  //       setMessage("Failed to save asset. Try again.");
  //       setMessageType("error");
  //       setIsModalOpen(true);
  //       return false;
  //     } else {
  //       setMessage(
  //         editingAssetId
  //           ? "Asset updated successfully!"
  //           : "Asset created successfully!"
  //       );
  //       setMessageType("success");
  //       setIsAssetModalOpen(false);

  //       fetchTableData(selectedCategory);

  //       setFormData({});
  //       setStartDate(null);
  //       setEditingAssetId(null);

  //       return true;
  //     }
  //   } catch (error) {
  //     console.error("Error submitting form:", error);
  //     setMessage("Failed to save asset. Try again.");
  //     setMessageType("error");
  //     setIsModalOpen(true);
  //     return false;
  //   }
  // };
  const extractErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "An unexpected error occurred."
    );
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setFormErrors({});

    let updatedFormData = { ...formData };

    // ✅ Handle file upload
    for (const [fieldName, fieldValue] of Object.entries(updatedFormData)) {
      if (fieldValue?.file) {
        const uploadedUrl = await handleFileUpload(fieldValue.file);
        if (uploadedUrl) {
          updatedFormData[fieldName] = JSON.stringify({ url: uploadedUrl });
        } else {
          console.warn(`Upload failed for field: ${fieldName}`);
          setMessage(`Upload failed for field: ${fieldName}`);
          setMessageType("error");
          setIsModalOpen(true);
          return false;
        }
      }
    }

    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token"); // ✅ Get token

    if (!userId) {
      setMessage("User not logged in.");
      setMessageType("error");
      setIsModalOpen(true);
      return false;
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      setMessage("Invalid user ID.");
      setMessageType("error");
      setIsModalOpen(true);
      return false;
    }

    if (!selectedCategory) {
      setMessage("Please select a category.");
      setMessageType("error");
      setIsModalOpen(true);
      return false;
    }

    let selectedCategoryObj = categories.find(
      (category) => category.categoriesname.trim() === selectedCategory.trim()
    );

    if (!selectedCategoryObj) {
      selectedCategoryObj = categories.find(
        (category) =>
          category.categoriesname.trim().toLowerCase() ===
          selectedCategory.trim().toLowerCase()
      );
    }

    if (!selectedCategoryObj) {
      setMessage("Invalid category.");
      setMessageType("error");
      setIsModalOpen(true);
      return false;
    }

    const selectedCategoryId = selectedCategoryObj.categoryId;

    // ✅ Remove empty fields
    const filteredValues = Object.fromEntries(
      Object.entries(updatedFormData).filter(
        ([key, value]) =>
          key !== "unique_id" &&
          key !== "category_id" &&
          key !== "categoryName" &&
          value !== "" &&
          value !== null &&
          value !== undefined
      )
    );

    if (Object.keys(filteredValues).length === 0) {
      setMessage("Please fill at least one field.");
      setMessageType("error");
      setIsModalOpen(true);
      return false;
    }

    const payload = editingAssetId
      ? {
          action: "AssetAddition",
          category_id: selectedCategoryId,
          unique_id: editingAssetId,
          fieldsToUpdate: filteredValues,
          submodule: "Movable"
        }
      : {
          category_id: selectedCategoryId,
          user_id: parsedUserId,
          action: "AssetAddition",
          values: filteredValues,
          submodule: "Movable"
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
          Authorization: `Bearer ${token}`, // ✅ Include token
        },
        body: JSON.stringify(payload),
      });

      const rawResponse = await response.text();

      if (
        rawResponse.toLowerCase().includes("error") ||
        rawResponse.toLowerCase().includes("failed")
      ) {
        setMessage(rawResponse); // Show exact backend message
        setMessageType("error");
        setIsModalOpen(true);
        return false;
      } else {
        setMessage(
          editingAssetId
            ? "Asset updated successfully!"
            : "Asset created successfully!"
        );
        setMessageType("success");
        setIsAssetModalOpen(false);

        fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);


        setFormData({});
        setStartDate(null);
        setEditingAssetId(null);

        return true;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setMessage(extractErrorMessage(error));
      setMessageType("error");
      setIsModalOpen(true);
      return false;
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
      setAssetToDelete(asset); // Store full asset, not just ID
      setIsDeleteModalOpen(true);
    } else {
      console.error("Invalid asset for deletion");
    }
  };

  const confirmDelete = async () => {
    if (assetToDelete !== null) {
      try {
        const token = sessionStorage.getItem("token"); // ✅ Get token
        const categoryToUse = assetToDelete.categoryName || selectedCategory;

        const url = `${JAVA_BASE}api/crud/delete/${categoryToUse}/${assetToDelete.unique_id}`;

        const response = await axios.delete(url, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Include token
          },
        });

        console.log("Asset deleted successfully:", response.data);

        // Refresh table after delete
        await fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);


        // ✅ Set success message
        setMessage("Asset deleted successfully.");
        setMessageType("success");

        // Close modal and reset
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
      } catch (error) {
        console.error("Error deleting asset:", error.message);

        // ❌ Set error message
        setMessage("Failed to delete asset. Please try again.");
        setMessageType("error");

        setIsDeleteModalOpen(false);
      }

      // Clear messages after 3 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
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
  // const handleEdit = async (unique_id) => {
  //   const asset = tableData.data.find((row) => row.unique_id === unique_id);
  //   if (!asset) return;

  //   const categoryName = asset.categoryName; // 🟢 Category name attached in fetch step

  //   try {
  //     const response = await axios.get(
  //       `https://saaspro.softtrails.net/saas/asset/pro/getColumnTypesAndData/${categoryName}`,
  //       { params: { status: "Repository" } }
  //     );

  //     const columns = response.data.columns || [];

  //     const parsedData = {};
  //     Object.keys(asset).forEach((key) => {
  //       const value = asset[key];
  //       if (key.toLowerCase().includes("date")) {
  //         parsedData[key] = value ? new Date(value) : null;
  //       } else if (typeof value === "string" && !isNaN(value)) {
  //         parsedData[key] = parseFloat(value);
  //       } else {
  //         parsedData[key] = value;
  //       }
  //     });

  //     setDynamicFields(columns);
  //     setFormData(parsedData);
  //     setSelectedCategory(categoryName); // ✅ Set category for dropdown
  //     setEditingAssetId(unique_id);
  //     setSelectedAsset({
  //       assetId: asset.unique_id,
  //       assetname: asset["Asset Name"] || "", // 🛠️ get exact key from backend
  //     });
  //     setIsAssetModalOpen(true);
  //   } catch (error) {
  //     console.error("Error loading asset fields:", error.message);
  //   }
  // };
const handleEdit = async (unique_id) => {
  // ✅ 1. Find the asset from table data
  const asset = tableData.data.find((row) => row.unique_id === unique_id);
  if (!asset) {
    console.error("Asset not found for editing:", unique_id);
    return;
  }

  // ✅ 2. Get category name safely
  const categoryName =
    asset.categoryName ||
    tableData.table || // from backend response (top level key)
    selectedCategory ||
    ""; // fallback

  if (!categoryName) {
    console.error("Category name missing for asset:", asset);
    setMessage("Unable to determine asset category. Please try again.");
    setMessageType("error");
    setIsModalOpen(true);
    return;
  }

  try {
    const token = sessionStorage.getItem("token");
    const response = await axios.get(
      `${ASSET_NODE_BASE}getColumnTypesAndData/${categoryName}`,
      {
        params: { status: "Repository",
          type:"Movable"
         },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const columns = response.data.columns || [];
    const parsedFormData = {};
    const parsedDates = {};

    Object.keys(asset).forEach((key) => {
      const value = asset[key];

      if (key.toLowerCase().includes("date")) {
        parsedFormData[key] = value || "";
        parsedDates[key] = value ? new Date(value) : null;
      } else if (typeof value === "string" && !isNaN(value)) {
        parsedFormData[key] = parseFloat(value);
      } else {
        parsedFormData[key] = value;
      }
    });

    // ✅ Update states
    setDynamicFields(columns);
    setFormData(parsedFormData);
    setDates(parsedDates);
    setSelectedCategory(categoryName); // ✅ ensures dropdown shows correct category
    setEditingAssetId(unique_id);
    setSelectedAsset({
      assetId: asset.unique_id,
      assetname: asset["Asset Name"] || "",
    });
    setIsAssetModalOpen(true);
  } catch (error) {
    console.error("Error loading asset fields:", error.message);
    setMessage("Failed to load asset data. Please try again.");
    setMessageType("error");
    setIsModalOpen(true);
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

    return `${day}-${month}-${year}`;
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
      return data.uploaded_files[0].file_url;
    } else {
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

  const handleSelectedFileUpload = (file, fieldName) => {
    if (
      file &&
      selectedService &&
      selectedDocumentType &&
      selectedAllowedDoc &&
      publishId
    ) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: {
          file: file,
          service: selectedService,
          documentType: selectedDocumentType,
          allowedDoc: selectedAllowedDoc,
          publishId: publishId,
        },
      }));

      setIsFileModalOpen(false);
    } else {
      console.warn("Missing service/docType/allowedDoc/publishId");
    }
  };

  // Function to refresh table data
  const handleApproval = async (unique_id) => {
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
    const categoryName = selectedCategoryObj.categoriesname;

    const payload = {
      category_id: selectedCategoryId,
      user_id: parsedUserId,
      new_stages: "AwaitingApproval",
      sub_stages: "Added",
      action: "AssetAddition",
      submodule: "Movable"
    };

    try {
      // ✅ Approve asset
      const response = await fetch(
        `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) throw new Error(`Error: ${response.status}`);
      const data = await response.json();
      console.log("Approval successful:", data);

      // ✅ Log asset history
      try {
        const historyPayload = {
          assetId: parseInt(unique_id, 10),
          categoryId: selectedCategoryId,
          updatedBy: parsedUserId,
          previousSubStages: "Added",
          currentSubStages: "Added",
          currentStatus: "Repository",
          previousStatus: "Repository",
          action: "Asset Approval Request",
          assetname: selectedAsset?.assetname || "",
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

        const historyData = await historyResponse.json();
        if (!historyResponse.ok || historyData.error) {
          throw new Error(
            historyData.message || "Failed to log asset history."
          );
        }

        console.log("Asset History Recorded:", historyData);
      } catch (historyError) {
        console.error("Asset History API error:", historyError);
      }

      // ✅ Fetch users and module data for notification
      try {
        const [userRes, moduleRes] = await Promise.all([
          axios.get(
            `${JAVA_BASE}workflow/users-by-category/${selectedCategoryId}`,
            {
              headers: { Authorization: token ? `Bearer ${token}` : undefined },
            }
          ),
          axios.get(`${UCS_BASE}api/modules`),
        ]);

        const approverUsers = Array.isArray(userRes.data)
          ? userRes.data.filter(
              (user) =>
                Array.isArray(user.action) &&
                user.action.some(
                  (action) => action.trim().toLowerCase() === "assetapproval"
                )
            )
          : [];

        let targetModule = moduleRes.data.find(
          (mod) =>
            mod.subName === "Asset Submission" && mod.moduleName === "EAM-AS"
        );

        if (!targetModule) {
          console.warn("Module not found. Using fallback.");
          targetModule = {
            id: "cf305748-8d1b-4433-96b7-f63aa48cf692",
            name: "Asset",
            subName: "Asset Submission",
            moduleName: "EAM-AS",
          };
        }

        // ✅ Send notification to all approver users
        for (const user of approverUsers) {
          try {
            const notifyPayload = {
              name: `${user.first_name} ${user.last_name || ""}`.trim(),
              email: user.email,
              phone_no: user.phone_no,
              categoryName,
              category_id: selectedCategoryId,
              status: "Repository",
              "Asset Name": selectedAsset?.assetname || "",
              unique_id: unique_id,
              subName: targetModule.subName,
              moduleName: targetModule.moduleName,
              moduleId: targetModule.id,
            };

            console.log("Sending UCS notification:", notifyPayload);

            await axios.post(
              `${UCS_BASE}ucs/send`,
              notifyPayload,
              { headers: { "Content-Type": "application/json" } }
            );
          } catch (userNotifyError) {
            console.error(
              "Notification failed for user:",
              user.email,
              "-",
              userNotifyError?.message || userNotifyError
            );
          }
        }
      } catch (notifyErr) {
        console.error(
          "UCS notification or module fetch failed:",
          notifyErr?.message || notifyErr
        );
      }

      setMessage("Asset successfully sent for approval!");
      setMessageType("success");
      setIsAssetModalOpen(false);
    fetchTableData(selectedCategory, pagination.offset, pagination.limit, searchTerm);

    } catch (error) {
      console.error("Approval failed:", error);
      setMessage("Failed to approve the asset. Please try again.");
      setMessageType("error");
      setIsAssetModalOpen(false);
    }
  };

  const refreshTableData = async () => {
    try {
      const response = await fetch("API_ENDPOINT_FOR_FETCHING_ASSETS");
      const updatedData = await response.json();
      setFilteredData(updatedData);
    } catch (error) {
      console.error("Failed to refresh table data:", error);
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData({
      ...formData,
      [name]: files[0],
    });
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
          ].includes(column.columnName)
      )
      .map((field) => field.columnName);

    const worksheet = XLSX.utils.json_to_sheet([], { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Assets Template");

    XLSX.writeFile(workbook, `${selectedCategory}_Asset_Template.xlsx`);
  };

  const handleBulkUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      console.log("Parsed Data:", json);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex">
        <div className=" w-full">
          <div className="p-4 md:p-5 flex flex-col space-y-6 min-h-screen">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 flex-wrap bg-white p-2 rounded-md">
  {/* Left Section: Add Asset, Category, Bulk Upload */}
  <div className="flex flex-wrap items-center gap-4">
    {/* Add Asset Button */}
    <button
      onClick={handleAddAsset}
      className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition duration-200 shadow-sm"
    >
      + Add Asset
    </button>

    {/* Category Dropdown */}
    <div className="w-[250px]">
      <Select
        id="category"
        placeholder="Select Asset Category"
        isSearchable
        classNamePrefix="react-select"
        value={
          selectedCategory
            ? { label: selectedCategory, value: selectedCategory }
            : null
        }
        onChange={(option) =>
          handleChange({
            target: { name: "category", value: option?.value },
          })
        }
        options={categories.map((category) => ({
          label: category.categoriesname,
          value: category.categoriesname,
        }))}
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: "0.375rem",
            borderColor: "#d1d5db",
            minHeight: "42px",
            boxShadow: "none",
            "&:hover": { borderColor: "#3b82f6" },
          }),
          placeholder: (base) => ({
            ...base,
            color: "#6b7280",
          }),
        }}
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

  {/* Right Section: Search Bar */}
  <div className="relative w-[250px]">
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
            <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[60vh]">
                {useMemo(() => (
                <table className="min-w-full table-auto text-sm border-collapse">
                  <thead
                    className="text-[16px] font-medium bg-white sticky top-0 "
                    style={{ boxShadow: "0 2px 0 black" }}
                  >
                    <tr>
                      <th className="p-5 text-center">S.no</th>
                      {["Asset Name", "Created On", "Status", "Stage"].map(
                        (column, index) => (
                          <th
                            key={index}
                            className="p-5 text-center "
                          >
                            {column}
                          </th>
                        )
                      )}
                      <th className="p-5 text-center">Action</th>
                    </tr>
                  </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
  {filteredData.length > 0 ? (
    filteredData.map((asset, index) => (
      <tr
        key={asset.unique_id || index}
        className={`cursor-pointer ${
          index % 2 === 0 ? "bg-blue-50" : "bg-white"
        } hover:bg-blue-100`}
      >
        <td className="px-5 py-3 text-center">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </td>

        {["Asset Name", "created_at", "status", "stages"].map(
          (column, colIndex) => (
            <td key={colIndex} className="px-5 py-3 text-center">
              {column === "created_at"
                ? formatDate(asset[column])
                : column === "stages"
                ? formatStages(asset[column])
                : asset[column] || ""}
            </td>
          )
        )}

        <td className="px-5 py-3 text-center">
          <button
            className="text-blue-600 mx-1 md:mx-2 p-1 rounded-full hover:bg-blue-100"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(asset.unique_id);
            }}
          >
            <FaEdit />
          </button>
          <button
            className="text-red-600 mx-1 md:mx-2 p-1 rounded-full hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(asset); // Pass full asset
            }}
          >
            <FaTrash />
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan={6}
        className="text-center py-5 text-gray-500 font-medium italic"
      >
        No records found.
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
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
                <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2">
                  {/* Header */}
                  <div className="flex justify-between items-center bg-gray-100 p-4 rounded-t-lg">
                    <h2 className="text-lg font-bold text-gray-800">
                      {editingAssetId ? "Edit Asset" : "Add Asset"}
                    </h2>

                    <div className="flex items-center space-x-3">
                      {/* Bulk Upload Button */}
                      {!editingAssetId && (
                        <button
                          onClick={() => setShowBulkUploadModal(true)}
                          className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                          title="Bulk Upload"
                        >
                          <HiUpload className="text-xl" />
                          Bulk Upload
                        </button>
                      )}
                      {!editingAssetId &&
                        selectedCategory &&
                        filteredDynamicFields.length > 0 && (
                          <div className="relative group">
                            <button
                              type="button"
                              onClick={handleDownloadTemplate}
                              className="p-2 bg-white border border-gray-300 rounded-full hover:shadow-md hover:bg-gray-100 transition-all duration-300 flex items-center justify-center"
                              title="Download Excel Template"
                            >
                              <img
                                src={Excel}
                                alt="Excel Icon"
                                className="w-8 h-8"
                              />
                            </button>

                            {/* Refined Tooltip */}
                            <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-md px-3 py-2 text-sm text-gray-800 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                              📥 Download Excel based on selected category
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-t border-gray-300 rotate-45 z-[-1]" />
                            </div>
                          </div>
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

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
                  >
                    {/* Asset Category Selection */}
                    <div className="flex flex-col">
                      <label
                        htmlFor="category"
                        className="mb-1 text-sm font-medium text-gray-700"
                      >
                        Asset Category
                      </label>
                      <Select
                        isSearchable
                        placeholder="Select Asset Category"
                        name="category"
                        value={
                          selectedCategory
                            ? {
                                value: selectedCategory,
                                label:
                                  categories.find(
                                    (cat) =>
                                      cat.categoriesname === selectedCategory
                                  )?.categoriesname || selectedCategory,
                              }
                            : null
                        }
                        onChange={(option) =>
                          handleChange({
                            target: { name: "category", value: option.value },
                          })
                        }
                        options={categories.map((cat) => ({
                          value: cat.categoriesname,
                          label: cat.categoriesname,
                        }))}
                        className="react-select-container"
                        classNamePrefix="react-select"
                        styles={{
                          control: (base) => ({
                            ...base,
                            backgroundColor: "#F0F0F0",
                            borderColor: "#D1D5DB", // Tailwind's gray-300
                            boxShadow: "none",
                            "&:hover": {
                              borderColor: "#6366F1", // Tailwind's indigo-500
                            },
                          }),
                        }}
                      />
                    </div>

                    {/* Dynamic Fields */}
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
                      .map((field, index) => (
                        <div key={index} className="flex flex-col">
                          {/* Label with Conditional Text */}
                          <label
                            htmlFor={field.columnName}
                            className="mb-1 text-sm font-medium text-gray-700"
                          >
                            {field.columnName === "Useful Life" &&
                              "Useful Life (in months)"}
                            {field.columnName === "Scrap Value" &&
                              "Scrap Value (in Rupees)"}
                            {field.columnName === "Original Cost" &&
                              "Original Cost (in Rupees)"}
                            {![
                              "Useful Life",
                              "Scrap Value",
                              "Original Cost",
                            ].includes(field.columnName) && field.columnName}
                            {field.isNullable === false && (
                              <span className="text-red-500"> *</span>
                            )}
                          </label>

                          {/* Render Date Picker for Date Fields */}
                          {field.dataType === "date" ? (
                            <ReactDatePicker
                              selected={dates[field.columnName] || null}
                              onChange={(date) =>
                                handleDateChange(date, field.columnName)
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
                          ) : ["Scrap Value", "Original Cost"].includes(
                              field.columnName
                            ) ? (
                            // ₹ Input field for Scrap Value and Original Cost
                            <div className="flex items-center border border-gray-300 rounded bg-[#F0F0F0]">
                              <span className="px-2 text-gray-600">₹</span>
                              <input
                                type="number"
                                name={field.columnName}
                                value={formData[field.columnName] || ""}
                                onChange={handleChange}
                                min="0"
                                onKeyDown={(e) => {
                                  if (e.key === "-" || e.key === "e") {
                                    e.preventDefault(); // prevent negative and exponential
                                  }
                                }}
                                className="p-2 bg-[#F0F0F0] w-full focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                              />
                            </div>
                          ) : (
                            // Standard text input
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
                      ))}

                    {/* Show General Error */}
                    {formErrors.general && (
                      <p className="text-red-600 text-sm">
                        {formErrors.general}
                      </p>
                    )}

                    {/* Submit Buttons */}
                    <div className="col-span-3 flex justify-end mt-4">
                      {formData.stages !== "AwaitingApproval" && (
                        <>
                          <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
                          >
                            {editingAssetId ? "Update Asset" : "Add Asset"}
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
          formData.append("submodule", "Movable");     // ✅ Add submodule
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
