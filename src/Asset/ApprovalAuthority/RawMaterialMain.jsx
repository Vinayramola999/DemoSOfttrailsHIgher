import React, { useState, useEffect, useRef } from "react";
import { FaHome, FaSignOutAlt, FaEye, FaEdit, FaRegFileAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
//
import axios from "axios";
import MessageModal from "../ApprovalAuthority/MessageModal";
import Select from "react-select";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const RequestTable = ({
  type,
  requests,
  onUpdateStatus,
  onResubmit,
  setShowPublishPrompt,
  showPublishPrompt,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editDetails, setEditDetails] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [editCategoryDetails, setEditCategoryDetails] = useState(null);
  
  const [categories, setCategories] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const modalRef = useRef(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(""); 
  const [message, setMessage] = useState(""); 
  const [messageType, setMessageType] = useState(""); 
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isCategoryPublished, setIsCategoryPublished] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All Assets");
   const [selectedEditCategory, setSelectedEditCategory] = useState(null);
   const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedEditCategoryId, setSelectedEditCategoryId] = useState(null);
  
const [isPaginating, setIsPaginating] = useState(false);
// 🧭 Pagination + Search Management States
const [limit, setLimit] = useState(25); // items per page
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalRecords, setTotalRecords] = useState(0);


// 🧭 Debounce for Search Input
const [debounceTimer, setDebounceTimer] = useState(null);


  const requestData =
    {
      Material: requests.assetRequests,
      Category: requests.categoryRequests,
    }[type] || [];

  const filteredDynamicFields = dynamicFields.filter(
    (field) =>
      field !== "unique_id" &&
      field !== "created_at" &&
      field !== "status" &&
      field !== "sub_stages" &&
      field !== "toapprove" &&
      field !== "stages"
  );
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem("token"); 

        if (!token) {
          console.error("Token missing. User may not be logged in.");
          setMessage("Authentication token missing. Please log in.");
          setMessageType("error");
          return;
        }

        const response = await axios.get(
          `${JAVA_BASE}api/categories/rawmaterials`,
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );

        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
        setMessage("Failed to fetch categories. Please try again.");
        setMessageType("error");
      }
    };

    fetchCategories();
  }, []);

  
    useEffect(() => {
      if (selectedCategory === "All Assets") {
        fetchAllPendingAssets();
      } else if (selectedCategory) {
        fetchTableData(selectedCategory);
      }
    }, [selectedCategory]);


 useEffect(() => {
    if (selectedCategory === "All Assets") {
      fetchAllPendingAssets();
    }
  }, [selectedCategory]);


  useEffect(() => {
    if (editDetails?.request?.categoryId) {
      const publishedCategories = JSON.parse(
        localStorage.getItem("publishedCategories") || "[]"
      );
      if (publishedCategories.includes(editDetails.request.categoryId)) {
        setIsCategoryPublished(true);
      } else {
        setIsCategoryPublished(false);
      }
    }
  }, [editDetails?.request?.categoryId, isEditCategoryModalOpen]);

const fetchAllPendingAssets = async (page = 1, limitValue = limit, search = "") => {
  try {
    const safePage = page < 1 ? 1 : page; // ✅ Fix page floor
    const token = sessionStorage.getItem("token");

    const response = await axios.get(
      `${ASSET_NODE_BASE}getPendingAssetsByTypess`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: "RawMaterials",
          stages: "AwaitingApproval",
           status:"Repository",
          page: safePage,
          limit: limitValue,
          search,
        },
      }
    );

    const { records = [] } = response.data;
    if (!records.length) {
      setFilteredData([]);
      setTotalRecords(0);
      setTotalPages(1);
      setCurrentPage(1); // ✅ Always reset to 1
      return;
    }

    const flatData = [];
    const catMap = {};

    records.forEach((record) => {
      const categoryName = record.category;
      const assets = record.data || [];

      if (assets.length > 0) catMap[categoryName] = assets[0].category_id;
      assets.forEach((asset) => flatData.push({ ...asset, category: categoryName }));
    });

    setCategoryMap(catMap);
    setFilteredData(flatData);
    setTableData(flatData);

    const pagination = records[0].pagination || {};
    const total = pagination.total || flatData.length;

    setTotalRecords(total);
    setLimit(pagination.limit || limitValue);
    setCurrentPage(pagination.page && pagination.page > 0 ? pagination.page : safePage); // ✅ Fix
    setTotalPages(Math.ceil(total / (pagination.limit || limitValue)));
  } catch (err) {
    console.error("Error fetching pending assets:", err.message);
  }
};




  
const fetchTableData = async (
  categoryName = selectedCategory,
  offsetOrPage = 1,
  limitValue = limit,
  search = ""
) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      console.error("Token missing. Please log in again.");
      return;
    }

    const safePage = offsetOrPage < 1 ? 1 : offsetOrPage; // ✅ Fix page floor
    const offset = (safePage - 1) * limitValue;

    const params = {
      offset,
      limit: limitValue,
      search,
      status: "Repository",
      stages: "AwaitingApproval",
      type:"Raw material",
    };

    const response = await axios.get(
      `${ASSET_NODE_BASE}getColumnTypesAndData/${categoryName}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params,
      }
    );

    const { data = [], columns = [], pagination = {} } = response.data;
    setFilteredData(data);
    setTableData(data);
    setDynamicFields(columns);

    const total = pagination.total || data.length;
    setTotalRecords(total);
    setLimit(pagination.limit || limitValue);
    setCurrentPage(
      pagination.offset >= 0
        ? Math.floor(pagination.offset / (pagination.limit || limitValue)) + 1
        : safePage
    ); // ✅ Prevent 0 or negative
    setTotalPages(Math.ceil(total / (pagination.limit || limitValue)));
  } catch (error) {
    console.error("Error fetching table data:", error.message);
  }
};



const handleChange = async (e) => {
  const value = e.target.value || e?.target?.value || e?.value;
  setSelectedCategory(value);
  setCurrentPage(1);
  setSearchTerm("");

  if (value === "All Assets") {
    fetchAllPendingAssets(1, limit);
  } else {
    fetchTableData(value, 1, limit);
  }
};




  const handleCategoryUpdate = (type, request) => {
    setEditDetails({ type, request });

    const categoryId = request.categoryId;
    const published = JSON.parse(
      localStorage.getItem("publishedCategories") || "[]"
    );
    const alreadyPublished = published.includes(categoryId);

    if (alreadyPublished) {
      // ✅ Load fields from localStorage
      const savedFields =
        JSON.parse(localStorage.getItem(`fields_${categoryId}`)) || [];
      setEditCategoryDetails(savedFields);
    } else {
      const filterCategoryFields = Array.isArray(categoryDetails)
        ? categoryDetails.filter(
          (c) => c.categoryName === request.categoriesname
        )
        : [];

      setEditCategoryDetails(
        filterCategoryFields.map((c) => ({
          id: c.id,
          fieldname: c.fieldname,
          assetDataType: c.assetDataType,
          isUnique: c.isUnique,
          isNullable: c.isNullable,
        }))
      );
    }

    setIsEditCategoryModalOpen(true);
  };

  useEffect(() => {
    if (isCategoryPublished) {
    
    }
  }, [isCategoryPublished]);

  const onPublish = async (categoryId) => {
    try {
      const editFields = {};
      for (let field of editCategoryDetails) {
        editFields[field.fieldname] = `${field.assetDataType}, ${field.isUnique ? "UNIQUE, " : ""
          }${field.isNullable ? "NOT NULL" : ""}`;
      }

      const publishData = {
        categoryName: editDetails.request?.categoriesname,
        fields: editFields,
      };

      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${ASSET_NODE_BASE}assettable`,
        // `${ASSET_NODE_BASE}assettable`,
        publishData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const published = JSON.parse(
        localStorage.getItem("publishedCategories") || "[]"
      );
      if (!published.includes(categoryId)) {
        published.push(categoryId);
        localStorage.setItem("publishedCategories", JSON.stringify(published));
      }

    
      localStorage.setItem(
        `fields_${categoryId}`,
        JSON.stringify(editCategoryDetails)
      );

      setIsCategoryPublished(true);
      closeModal();
      setMessage(
        "Form published successfully. You can now view it in the Material repository."
      );
      setMessageType("success");
      setShowPublishPrompt(false);
    } catch (error) {
      console.error("Error during publish:", error);

      setMessage("There was an error publishing the category.");
      setMessageType("error");
    }
  };

  const filteredRequests = requestData.filter((request) => {
    const name =
      type === "Material"
        ? request.assetName
        : type === "Category"
          ? request.categoriesname
          : request.workflowname;
   
    const matchesSearch = (name?.toLowerCase() || "").includes(
      searchTerm.toLowerCase()
    );

    const matchesDate =
      (!startDate || new Date(request.createdAt) >= new Date(startDate)) &&
      (!endDate || new Date(request.createdAt) <= new Date(endDate));
    return matchesSearch && matchesDate;
  });

  const closeModal = () => {
    setIsEditCategoryModalOpen(false);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };

const handleApprovals = async (unique_id) => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  if (!userId) {
    alert("User not logged in or user ID missing.");
    return;
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    alert("Invalid User ID.");
    return;
  }

  const categoryName =
    selectedEditCategory || selectedCategory || formData?.category;

  if (!categoryName) {
    alert("Please select a category.");
    return;
  }

  let selectedCategoryId = selectedEditCategoryId;
  if (!selectedCategoryId) {
    const matched = categories.find(
      (cat) => cat.categoriesname === categoryName
    );
    selectedCategoryId = matched?.categoryId || categoryMap?.[categoryName];
  }

  if (!selectedCategoryId) {
    alert("Could not determine category ID.");
    return;
  }

  const lifecyclePayload = {
    category_id: selectedCategoryId,
    user_id: parsedUserId,
    new_stages: "Active",
    sub_stages: "Added",
    action: "AssetApproval",
    submodule: "Raw material",
  };

  try {
    // ✅ 1️⃣ Update lifecycle
    const lifecycleResponse = await fetch(
      `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(lifecyclePayload),
      }
    );

    if (!lifecycleResponse.ok)
      throw new Error(`Lifecycle Update Error: ${lifecycleResponse.status}`);

    const lifecycleData = await lifecycleResponse.json();
    console.log("Lifecycle update successful:", lifecycleData);

    // ✅ 2️⃣ Update asset status
    const assetStatusPayload = {
      category_id: selectedCategoryId,
      user_id: parsedUserId,
      new_status: "Inventory",
      action: "AssetApproval",
      submodule: "Raw material",
    };

    const assetStatusResponse = await fetch(
      `${ASSET_NODE_BASE}assets/update-asset-status/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(assetStatusPayload),
      }
    );

    if (!assetStatusResponse.ok)
      throw new Error(
        `Material Status Update Error: ${assetStatusResponse.status}`
      );

    const assetStatusData = await assetStatusResponse.json();
    console.log("Material status update successful:", assetStatusData);

    // ✅ Determine whether to stay on same page or move to previous
    const isLastItemOnPage = filteredData.length === 1 && currentPage > 1;

    if (!selectedCategory || selectedCategory.toLowerCase() === "all") {
      console.log(`🔄 Refreshing All Pending Assets`);
      if (isLastItemOnPage) {
        await fetchAllPendingAssets(currentPage - 1, limit, searchTerm);
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchAllPendingAssets(currentPage, limit, searchTerm);
      }
    } else {
      console.log(`🔄 Refreshing category: ${categoryName}`);
      if (isLastItemOnPage) {
        await fetchTableData(categoryName, currentPage - 1, limit, searchTerm);
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchTableData(categoryName, currentPage, limit, searchTerm);
      }
    }

    setIsModalOpen(false);
    setMessage("Material approved successfully!");
    setMessageType("success");
  } catch (error) {
    console.error("Approval process failed:", error);
    setMessage("Failed to approve the material. Please try again.");
    setMessageType("error");
  }
};



  useEffect(() => {
    if (isEditCategoryModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditCategoryModalOpen]);

  const formatDate = (date) => new Date(date).toLocaleDateString();

  console.log({ filteredRequests });

  const fetchCategoryFields = async () => {
    try {
      const token = sessionStorage.getItem("token"); 

      const response = await axios.get(
        `${JAVA_BASE}api/assets/fetch`,
        {
          headers: {
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json",
          },
        }
      );

      console.log("response", response.data);
      setCategoryDetails(response.data);
    } catch (error) {
      console.error("Error fetching category fields:", error);
    }
  };

  console.log({ categoryDetails });

  useEffect(() => {
    fetchCategoryFields();
  }, []);

  const openApprovalModal = (assetId) => {
  
    setIsModalOpen(true); 
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    console.log("handle edit submit");
    // try {
    //   const updatedCategory = {
    //     categoriesname: selectedCategoryName,
    //   };

    //   console.log("Updated Category Data:", updatedCategory); // Log data being submitted

    //   const response = await axios.post(
    //     "https://saaspro.softtrails.net/saas/java/pro/api/temp/save",
    //     updatedCategory
    //   );

    //   console.log("Response from Save:", response.data); // Log response from server
    //   closeModal();
    //   fetchCategories();
    // } catch (error) {
    //   if (error.response) {
    //     console.error("Error response from server:", error.response.data);
    //   } else if (error.request) {
    //     console.error("No response received from server:", error.request);
    //   } else {
    //     console.error("Error in setting up request:", error.message);
    //   }
    // }
  };
  // Edit asset function

  //   const handleEdit = (unique_id) => {
  //     // Log the tableData and unique_id to debug
  //     setSelectedAssetId(unique_id);
  // console.log(selectedAssetId)
  //     console.log("Table Data:", tableData);
  //     console.log("Selected Asset ID:", unique_id);

  //     if (Array.isArray(tableData) && tableData.length > 0) {
  //       // Find the asset by unique_id
  //       const asset = tableData.find((row) => row.unique_id === unique_id);
  //       console.log("Found Asset:", asset);

  //       if (asset) {
  //         setFormData(asset); // Set the form data to the selected asset
  //         setEditingAssetId(unique_id); // Set the editing asset ID
  //         setIsAssetModalOpen(true); // Open the modal
  //       } else {
  //         console.error('Asset not found.');
  //       }
  //     } else {
  //       console.error('Data is not available.');
  //     }
  //   };
const handleEdit = async (unique_id) => {
  // ✅ Always use visible data source
  const assetList = filteredData || [];

  if (!Array.isArray(assetList) || assetList.length === 0) {
    console.error("Asset data not available.");
    return;
  }

  const asset = assetList.find((row) => row.unique_id === unique_id);
  if (!asset) {
    console.error("Asset not found.");
    return;
  }

  // ✅ Populate modal with asset details
  setSelectedAssetId(unique_id);
  setFormData(asset);
  setEditingAssetId(unique_id);
  setIsAssetModalOpen(true);
  setSelectedAsset({
    assetId: asset.unique_id,
    assetname: asset["material_name"] || "",
  });

  // ✅ Fetch category-specific dynamic fields for the form
  if (asset.category) {
    console.log("Editing Asset:", asset);
    console.log("Asset Category:", asset.category);

    setSelectedEditCategory(asset.category);
    setSelectedEditCategoryId(asset.category_id);

    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${ASSET_NODE_BASE}getColumnTypesAndData/${asset.category}`,
        {
          params: { 
          type:"Raw material"
         },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const fields = res.data.columns || [];
      setDynamicFields(fields);
    } catch (err) {
      console.error("Error fetching fields for form:", err.message);
    }
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { category, ...payloadToSend } = formData;
      const token = sessionStorage.getItem("token"); // ✅ Get token

      const url = editingAssetId
        ? `${JAVA_BASE}api/crud/update/${selectedCategory}/${editingAssetId}` // Update
        : `${JAVA_BASE}insert/${selectedCategory}`; // Create new

      const method = editingAssetId ? "post" : "post";
      const response = await axios[method](url, payloadToSend, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });

    
      if (response.data.errors) {
        setFormErrors(response.data.errors); 
      } else {
        console.log("Form submitted successfully:", response.data);

    
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
          
          setTableData((prevState) => ({
            ...prevState,
            data: [...prevState.data, response.data],
          }));
        }

    
        setIsAssetModalOpen(false);
        setEditingAssetId(null); 
        setFormErrors({}); 
      }
    } catch (error) {
      console.error("Error submitting form:", error.message);
      setFormErrors({ general: "An error occurred. Please try again." }); 
    }
  };

  if (tableData.length > 0) {
    console.log("Selected Category Unique ID:", tableData[0].unique_id);
  }
  function generateColorFromStage(stage) {
    
    const colors = [
      "#F87171", 
      "#FBBF24", 
      "#34D399", 
      "#60A5FA", 
      "#A78BFA",
    ];
    let hash = 0;
    for (let i = 0; i < stage.length; i++) {
      hash = stage.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
  function addSpacesToStage(stage) {

    return stage.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

 const categoriesOptions = [
    { value: "All Assets", label: "All Material" }, // ✅ prepend manually
    ...categories.map((category) => ({
      value: category.categoriesname,
      label: category.categoriesname,
    })),
  ];

const handleResubmissions = async (unique_id) => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  if (!userId) {
    alert("User not logged in or user ID missing.");
    return;
  }

  const parsedUserId = parseInt(userId, 10);
  if (isNaN(parsedUserId)) {
    alert("Invalid User ID.");
    return;
  }

  const selectedCatId = selectedCategoryId || selectedEditCategoryId;

  if (!selectedCatId) {
    alert("Please select a valid category before resubmitting.");
    return;
  }

  const resubmissionPayload = {
    user_id: parsedUserId,
    new_stages: "Resubmitted",
    sub_stages: "Added",
    category_id: selectedCatId,
    action: "AssetApproval",
    submodule: "Raw material",
  };

  try {
    // 🛠️ Lifecycle update
    const response = await fetch(
      `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(resubmissionPayload),
      }
    );

    if (!response.ok)
      throw new Error(`Resubmission Update Error: ${response.status}`);

    const result = await response.json();
    console.log("Asset resubmission successful:", result);

    // 🧾 Log asset history
    try {
      const historyPayload = {
        assetId: unique_id,
        categoryId: selectedCatId,
        updatedBy: parsedUserId,
        previousSubStages: "Added",
        currentSubStages: "Added",
        currentStatus: "Repository",
        previousStatus: "Repository",
        action: "Material Resubmitted",
        assetname: selectedAsset?.assetname || "",
      };

      const historyResponse = await fetch(
        `${JAVA_BASE}api/assethistory/insert-history`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(historyPayload),
        }
      );

      const historyData = await historyResponse.json();
      if (!historyResponse.ok || historyData.error)
        throw new Error(historyData.message || "Failed to log history.");

      console.log("Asset History logged:", historyData);
    } catch (historyError) {
      console.error("History log failed:", historyError);
    }

    // ✅ Refresh same page or previous page if empty
    const isLastItemOnPage = filteredData.length === 1 && currentPage > 1;

    if (!selectedCategory || selectedCategory.toLowerCase() === "all") {
      if (isLastItemOnPage) {
        await fetchAllPendingAssets(currentPage - 1, limit, searchTerm);
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchAllPendingAssets(currentPage, limit, searchTerm);
      }
    } else {
      if (isLastItemOnPage) {
        await fetchTableData(selectedCategory, currentPage - 1, limit, searchTerm);
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchTableData(selectedCategory, currentPage, limit, searchTerm);
      }
    }

    setIsModalOpen(false);
    setIsAssetModalOpen(false);
    setMessage("Asset resubmitted successfully!");
    setMessageType("success");
  } catch (error) {
    console.error("Resubmission failed:", error);
    setMessage("Failed to resubmit the asset. Please try again.");
    setMessageType("error");
  }
};

const handlePageChange = async (newPage) => {
  if (isPaginating) return;
  setIsPaginating(true);

  if (selectedCategory === "All Assets") {
    await fetchAllPendingAssets(newPage, limit, searchTerm);
  } else {
    await fetchTableData(selectedCategory, newPage, limit, searchTerm);
  }

  setTimeout(() => setIsPaginating(false), 300);
};
// 🧭 Debounced + Hybrid Search Handler
const handleSearch = (e) => {
  const value = e.target.value;
  setSearchTerm(value);

  // 🧩 Case 1: Material → backend-based search (debounced)
  if (type === "Material") {
    if (debounceTimer) clearTimeout(debounceTimer);

    const newTimer = setTimeout(() => {
      if (selectedCategory === "All Assets") {
        fetchAllPendingAssets(1, limit, value.trim());
      } else {
        fetchTableData(selectedCategory, 1, limit, value.trim());
      }
    }, 700); // debounce delay

    setDebounceTimer(newTimer);
  }

  // 🧩 Case 2: Other types → frontend filtering only
  else {
    if (Array.isArray(tableData) && tableData.length > 0) {
      const filtered = tableData.filter((item) =>
        Object.values(item).some(
          (val) =>
            val &&
            val.toString().toLowerCase().includes(value.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else if (tableData?.data?.length > 0) {
      const filtered = tableData.data.filter((item) =>
        Object.values(item).some(
          (val) =>
            val &&
            val.toString().toLowerCase().includes(value.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }
};





  return (
    <div className="bg-white rounded-lg p-4 shadow-md mt-4 w-full h-full">
      <div className="flex flex-col md:flex-row mb-4 space-y-2 md:space-y-0 md:space-x-2">

     <input
    type="text"
    placeholder={`Search ${type}...`}
    className="border border-gray-300 rounded p-2 mb-4 w-full md:w-1/2 lg:w-[20%]"
    value={searchTerm}
    onChange={handleSearch}
  />
        {type === "Material" && (
          <div className="w-full md:w-[250px]">
            <Select
              options={categoriesOptions}
              value={categoriesOptions.find(
                (option) => option.value === selectedCategory
              )}
              onChange={(selectedOption) =>
                handleChange({
                  target: { name: "category", value: selectedOption?.value },
                })
              }
              placeholder="Select Material Category"
              isSearchable

              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>
        )}
      </div>
      {/* Table for displaying Asset data */}
      {type === "Material" && (
        <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
            <table className="min-w-full table-auto border-collapse ">
              <thead className="text-[16px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                <tr>
                  <th className="p-5 text-center ">
                    S.No
                  </th>
                  <th className="p-5 text-center ">
                    Material Name
                  </th>
                  <th className="p-5 text-center ">
                    Created On
                  </th>
                  <th className="p-5 text-center ">
                    Stage
                  </th>
                  <th className="p-5 text-center ">
                    Status
                  </th>
                  <th className="p-5 text-center ">
                    Action
                  </th>
                </tr>
              </thead>

            <tbody className="bg-white divide-y divide-gray-200">
  {Array.isArray(filteredData) && filteredData.length > 0 ? (
    filteredData.map((asset, index) => (
      <tr
        key={asset.unique_id}
        className={`border-t ${
          index % 2 === 0 ? "bg-blue-50" : "bg-white"
        }`}
      >
        {/* S.No */}
       <td className="px-5 py-3 text-center">
  {Math.max((currentPage - 1) * limit + index + 1, 1)}
</td>

        {/* Material Name */}
        <td className="px-5 py-3 text-center">
          {asset.material_name}
        </td>

        {/* Created On */}
        <td className="px-5 py-3 text-center">
          {asset.created_at ? formatDate(asset.created_at) : "N/A"}
        </td>

        {/* Stage */}
        <td
          className="px-5 py-3 text-center font-bold"
          style={{
            color: generateColorFromStage(asset.stages),
          }}
        >
          {addSpacesToStage(asset.stages)}
        </td>

        {/* Status */}
        <td className="px-5 py-3 text-center">
          {asset.status}
        </td>

        {/* Action Buttons */}
        <td className="px-5 py-3">
          <div className="flex justify-center items-center gap-3">
            {/* View Button */}
            <button
              className="text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(asset.unique_id);
              }}
              title="View Asset"
            >
              <FaEye className="text-base" />
            </button>

            {/* File Links */}
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
      </tr>
    ))
  ) : (
    <tr>
      <td
        colSpan="6"
        className="py-6 px-4 text-center text-gray-500"
      >
        No matching assets found.
      </td>
    </tr>
  )}
</tbody>

            </table>
          </div>
        </div>
      )}

      {/* Table for displaying Category data */}
      {type === "Category" && (
        <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
            <table className="min-w-full table-auto border-collapse ">
              <thead className="text-[16px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                <tr>
                  <th className="p-5 text-center ">
                    S.No
                  </th>
                  <th className="p-5 text-center ">
                    {type} Name
                  </th>
                  <th className="p-5 text-center ">
                    Created On
                  </th>
                  <th className="p-5 text-center ">
                    Approval Workflow
                  </th>
                  <th className="p-5 text-center ">
                    Category Type
                  </th>
                  <th className="p-5 text-center ">
                    Status
                  </th>
                  <th className="p-5 text-center ">
                    Stage
                  </th>
                  <th className="p-5 text-center ">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests
                    .filter(
                      (category) => category.categoriesType === "RawMaterials"
                    )
                    .map((request, index) => (
                      <tr
                        key={request.category_id}
                        className={`border-t ${index % 2 === 0 ? "bg-blue-50" : "bg-white"
                          }`}
                      >
                        <td className="px-5 py-3 text-center ">
                          {index + 1}
                        </td>
                        <td className="px-5 py-3 text-center ">
                          {request.categoriesname}
                        </td>
                        <td className="px-5 py-3 text-center ">
                          {request.createdAt
                            ? formatDate(request.createdAt)
                            : ""}
                        </td>
                        <td className="px-5 py-3 text-center ">
                          {request.workflowname}
                        </td>
                        <td className="px-5 py-3 text-center ">
                          {request.categoriesType?.replace(
                            /([a-z])([A-Z])/g,
                            "$1 $2"
                          )}
                        </td>
                        <td className="px-5 py-3 text-center ">
                          {request.status}
                        </td>
                        <td className="px-5 py-3 text-center ">
                          {(() => {
                            if (request.status === "Active") {
                              return (
                                <span className="text-green-500">Approved</span>
                              );
                            } else if (request.status === "Inactive") {
                              return (
                                <span className="text-gray-500">Hidden</span>
                              );
                            } else if (request.status === "Draft") {
                              switch (request.stages) {
                                case "SubmittedForApproval":
                                  return (
                                    <span className="text-yellow-500">
                                      Submitted For Approval
                                    </span>
                                  );
                                case "Resubmitted":
                                  return (
                                    <span className="text-purple-500">
                                      Resubmitted
                                    </span>
                                  );
                                default:
                                  return (
                                    <span className="text-red-500">
                                      {request?.stages}
                                    </span>
                                  );
                              }
                            } else {
                              return (
                                <span className="text-gray-500">
                                  Unknown Status
                                </span>
                              );
                            }
                          })()}
                        </td>
                        <td className="px-5 py-3 text-center text-red-500 hover:text-red-700 cursor-pointer">
                          <div
                            className="flex justify-center items-center"
                            onClick={() => handleCategoryUpdate(type, request)}
                          >
                            <FaEye />
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-6 px-4 text-center text-gray-500"
                    >
                      No matching requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

{type === "Material" && totalPages > 1 && (
  <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
    <button
      onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
      disabled={currentPage === 1 || isPaginating}
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
      disabled={currentPage === totalPages || isPaginating}
      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
    >
      &gt;
    </button>
  </div>
)}




      {/* Modal for confirming approval */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl mb-4">
              Are you sure you want to approve this asset?
            </h2>
            <div className="flex justify-end">
              <button
                onClick={() => handleApprovals(selectedAssetId)} // Call the handleApprovals function when confirmed
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={() => setIsModalOpen(false)} // Close the modal if canceled
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
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
            <form
              onSubmit={handleSubmit}
              className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Asset Category */}
              <div className="flex flex-col">
                <label
                  htmlFor="category"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Asset Category
                </label>
                <select
                  name="category"
                  value={selectedEditCategory ||selectedCategory}
                  onChange={handleChange}
                  className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
                  disabled
                >
                  <option value="">Select a category</option>
                  {categories.map((category, i) => (
                    <option key={i} value={category.categoriesname}>
                      {category.categoriesname}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Fields */}
              {filteredDynamicFields
                .filter(
                  (column) =>
                    column.columnName !== "unique_id" &&
                    column.columnName !== "stages" &&
                    column.columnName !== "status" &&
                    column.columnName !== "sub_stages" &&
                    column.columnName !== "toapprove" &&
                    column.columnName !== "created_at" &&
                    column.columnName !== "category_id"
                )
                .map((field, index) => {
                  const value = formData[field.columnName];

                  // ✅ File URL handling
                  if (value && typeof value === "object" && value.url) {
                    const fileName = value.name || value.url.split("/").pop();
                    return (
                      <div key={index} className="flex flex-col col-span-2">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                          {field.columnName}
                        </label>
                        <a
                          href={value.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline break-words"
                        >
                          {fileName}
                        </a>
                      </div>
                    );
                  }

                  // ✅ Date fields handling
                  const isDateField =
                    field.dataType === "date" ||
                    field.columnName.toLowerCase().includes("date");

                  return (
                    <div key={index} className="flex flex-col">
                      <label
                        htmlFor={field.columnName}
                        className="mb-1 text-sm font-medium text-gray-700"
                      >
                        {field.columnName}
                      </label>
                      <input
                        type={
                          field.dataType === "number"
                            ? "number"
                            : isDateField
                              ? "date"
                              : "text"
                        }
                        name={field.columnName}
                        value={
                          isDateField
                            ? value
                              ? new Date(value).toISOString().split("T")[0]
                              : ""
                            : value || ""
                        }
                        onChange={handleChange}
                        className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
                      />
                      {/* Errors */}
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
                <p className="text-red-600 text-sm col-span-2">
                  {formErrors.general}
                </p>
              )}

              {/* Buttons */}
              <div className="col-span-2 flex justify-end mt-4">
                  <button
                  type="button"
                  onClick={() => handleResubmissions(selectedAssetId)}
                  className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded mr-2"
                >
                  Resubmitted
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAssetModalOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  Approve
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditCategoryModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 shadow-lg w-11/12 md:w-3/4 lg:w-1/3 xl:w-1/2"
          >
            {/* Error Display */}
            {error && (
              <div className="text-red-500 mb-4 p-2 border border-red-500 bg-red-100 rounded">
                {error}
              </div>
            )}

            <h2 className="text-lg font-bold mb-4">Review Form</h2>
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col gap-2 w-[35%]">
                  <label className="text-[#555252] font-semibold">Asset Category</label>
                  <input
                    type="text"
                    value={editDetails.request.categoriesname}
                    className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled
                    required
                  />
                </div>
              </div>

              {/* Scrollable Field Section */}
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto border p-4 rounded-lg">
                <label className="text-[#555252] font-semibold">Form Fields</label>
                {editCategoryDetails?.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 flex-wrap"
                  >
                    <input
                      type="text"
                      name="fieldname"
                      value={field.fieldname}
                      placeholder="Field Name"
                      className="p-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      name="assetDataType"
                      value={field.assetDataType}
                      className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="String">Alpha Numeric</option>
                      <option value="Integer">Whole Number</option>
                      <option value="Number">Decimal Number</option>
                      <option value="Boolean">Yes\No</option>
                      <option value="Date">Date</option>
                      <option value="Json">Upload File</option>
                    </select>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isNullable"
                        checked={field.isNullable}
                      />{" "}
                      Not Null
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="isUnique"
                        checked={field.isUnique}
                      />{" "}
                      Unique
                    </label>
                  </div>
                ))}
              </div>
              {/* Buttons Section */}
              <div className="my-4 flex justify-end flex-wrap gap-2">
                {editDetails.type === "Category" && (
                  <>
                    {editDetails.request.status === "Draft" &&
                      editDetails.request.stages !== "Resubmitted" && (
                        <>
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                            onClick={() =>
                              onUpdateStatus(
                                editDetails.request.categoryId,
                                "Active"
                              )
                            }
                            disabled={editDetails.request.status === "Active"} // Disable if already Active
                            aria-label="Activate the category"
                          >
                            Active
                          </button>
                          <button
                            className="bg-orange-500 text-white px-2 py-1 rounded-lg hover:bg-orange-600 transition"
                            onClick={() =>
                              onResubmit(
                                editDetails.request.categoryId,
                                editDetails.request.receiverId
                              )
                            }
                            disabled={
                              editDetails.request.status === "Resubmitted"
                            } // Disable if already Resubmitted
                            aria-label="Resubmit the category"
                          >
                            Resubmitted
                          </button>
                        </>
                      )}
                    {editDetails.request.status === "Active" && (
                      <>
                        <button
                          className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                          onClick={() =>
                            onUpdateStatus(
                              editDetails.request.categoryId,
                              "Inactive"
                            )
                          }
                          disabled={editDetails.request.status === "Inactive"} // Disable if already Inactive
                          aria-label="Deactivate the category"
                        >
                          Inactive
                        </button>
                        {!isCategoryPublished && (
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded-lg hover:bg-green-600 transition"
                            onClick={() =>
                              onPublish(editDetails.request.categoryId)
                            }
                            aria-label="Publish the category"
                          >
                            Publish
                          </button>
                        )}
                      </>
                    )}
                    {editDetails.request.status === "Inactive" && (
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                        onClick={() =>
                          onUpdateStatus(
                            editDetails.request.categoryId,
                            "Active"
                          )
                        }
                        disabled={editDetails.request.status === "Active"} // Disable if already Active
                        aria-label="Activate the category"
                      >
                        Active
                      </button>
                    )}
                    {editDetails.request.status === "Resubmitted" && (
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 transition"
                        onClick={() =>
                          onUpdateStatus(
                            editDetails.request.categoryId,
                            "Draft"
                          )
                        }
                        disabled={editDetails.request.status === "Draft"} // Disable if already Draft
                        aria-label="Return the category to Draft"
                      >
                        Draft
                      </button>
                    )}
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {showPublishPrompt && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50  flex items-center justify-center z-50"
          onClick={() => setShowPublishPrompt(false)} // Close on outside click
        >
          <div
            className="relative bg-white w-full max-w-md mx-4 sm:mx-auto p-6 rounded-lg shadow-xl transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()} // Prevent close on inside click
          >
            {/* Icon */}
            <div className="modal-icon mt-2">
              <div className="w-16 h-16 mx-auto flex items-center justify-center bg-blue-500 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-center text-2xl font-bold mt-4 text-blue-600">
              Publish Category
            </h2>

            {/* Description */}
            <p className="mt-4 text-center text-gray-700 text-base leading-relaxed">
              Do you want to publish now or later?
              <br />
              You can also confirm this action later by going to the{" "}
              <span className="font-medium text-blue-500">Actions</span> menu.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex justify-center gap-4">
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                onClick={() => {
                  onPublish(editDetails.request.categoryId, "Inactive");
                  // setShowPublishPrompt(false);
                }}
              >
                Publish Now
              </button>
              <button
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                onClick={() => setShowPublishPrompt(false)}
              >
                Publish Later
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Message Modal */}
      <MessageModal
        message={message}
        type={messageType}
        setMessage={setMessage}
      />
    </div>
  );
};

const ApprovalAuthority = () => {
  const [activeTab, setActiveTab] = useState("Category");
  const [requests, setRequests] = useState({
    assetRequests: [],
    categoryRequests: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // For modal visibility
  const [userData, setUserData] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // To store the category ID
  const [description, setDescription] = useState(""); // To store the description input
  const [receiverId, setReceiverId] = useState(null); // To store the receiver ID
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const userId = parseInt(sessionStorage.getItem("userId"), 10);
  const [error, setError] = useState(""); // Add this state to handle errors
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState(""); // State to store the type of message
  const [showPublishPrompt, setShowPublishPrompt] = useState(false);
  const handleResubmission = (categoryId) => {
    const category = requests.categoryRequests.find(
      (request) => request.categoryId === categoryId
    );

    if (category) {
      const receiverId = category.createdBy; // 'createdBy' is the user who created the category

      setSelectedCategoryId(categoryId);
      setReceiverId(receiverId);
      setIsModalOpen(true); // Open the modal for description input
    } else {
      console.error("Category not found");
      setMessage("Category not found");
      setMessageType("error"); // Set error message type
      setIsModalOpen(true); // Open the modal
    }
  };

  const handleHome = () => {
    navigate("/Cards");
  };

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `${MAIN_BASE}users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data) {
            const user = response.data;
            setUserData(user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token, userId]);

  const handleSubmitResubmission = async () => {
  if (!description) {
    setMessage("Description is required");
    setMessageType("error");
    return; // Prevent submission if description is empty
  }

  const token = sessionStorage.getItem("token"); // ✅ get token

  // Payload for the "Resubmitted" stage
  const resubmissionPayload = {
    category_id: selectedCategoryId,
    user_id: userId,
    new_status: "Draft", // Status remains 'Draft'
    new_stages: "Resubmitted",
    action: "CategoryApproval",
      submodule:"Raw material"
  };

  try {
    // Call the API for the resubmission stage with token
    const resubmissionResponse = await axios.put(
      `${ASSET_NODE_BASE}assets/update-category-status`,
      resubmissionPayload,
      {
        headers: {
          Authorization: `Bearer ${token}`, // ✅ Add token
        },
      }
    );

    if (resubmissionResponse.status === 200) {
      console.log("Category successfully resubmitted");

      // Show success message
      setMessage("Category resubmitted successfully!");
      setMessageType("success");

      // Refresh category requests after success
      fetchCategoryRequests();

      // Close modal after submission
      setIsModalOpen(false);
    } else {
      // Handle failure if response status is not 200
      setMessage(
        "An error occurred while resubmitting the category. Please try again."
      );
      setMessageType("error");
    }
  } catch (error) {
    console.error("Error resubmitting category:", error);
    setMessage(
      "An error occurred while processing the resubmission. Please try again."
    );
    setMessageType("error");
  }
};


  const fetchCategoryRequests = async () => {
    try {
      const token = sessionStorage.getItem("token"); // get token from sessionStorage
      const response = await axios.get(
       `${JAVA_BASE}api/categories/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // add token here
          },
        }
      );
      setRequests((prev) => ({
        ...prev,
        categoryRequests: response.data,
      }));
    } catch (error) {
      console.error("Error fetching category requests:", error);
    }
  };

  // const updateCategoryStatus = async (
  //   categoryId,
  //   status,
  //   receiverId,
  //   description
  // ) => {
  //   if (!categoryId || !status) {
  //     console.error("categoryId or status is missing.");
  //     setMessage("Category ID or Status is missing.");
  //     setMessageType("error");
  //     return;
  //   }

  //   const userId = parseInt(sessionStorage.getItem("userId"), 10);
  //   try {
  //     if (status === "Resubmitted") {
  //       // Handle resubmission with a specific payload
  //       const resubmissionPayload = {
  //         category_id: categoryId,
  //         user_id: userId,
  //         new_status: "Draft", // Status remains 'Draft'
  //         new_stages: "Resubmitted",
  //         action: "CategoryApproval",
  //       };

  //       const resubmissionResponse = await axios.put(
  //         "https://saaspro.softtrails.net/saas/asset/pro/assets/update-category-status",
  //         resubmissionPayload
  //       );

  //       if (resubmissionResponse.status === 200) {
  //         setMessage("Category successfully resubmitted and status set to Draft.");
  //         setMessageType("success");
  //         fetchCategoryRequests();
  //       }
  //     } else if (status === "Active") {
  //       const activePayload = {
  //         category_id: categoryId,
  //         user_id: userId,
  //         new_status: "Active",
  //         value: "Approved",
  //         action: "CategoryApproval",
  //       };

  //       const activeResponse = await axios.put(
  //         "https://saaspro.softtrails.net/saas/asset/pro/assets/update-category-status",
  //         activePayload
  //       );

  //       if (activeResponse.status === 200) {
  //         setMessage("Material Category Status Successfully Updated.");
  //         setMessageType("success");
  //         fetchCategoryRequests();
  //       }
  //     } else if (status === "Inactive") {
  //       // When status is 'Inactive', set the stage to 'Hidden'
  //       const inactivePayload = {
  //         category_id: categoryId,
  //         user_id: userId,
  //         new_status: "Inactive", // Inactive status
  //         value: "Hidden", // Stage should be 'Hidden'
  //         action: "CategoryApproval",
  //       };

  //       const inactiveResponse = await axios.put(
  //         "https://saaspro.softtrails.net/saas/asset/pro/assets/update-category-status",
  //         inactivePayload
  //       );

  //       if (inactiveResponse.status === 200) {
  //         setMessage("Category status updated to Inactive and stage set to Hidden.");
  //         setMessageType("success");
  //         fetchCategoryRequests();
  //       }
  //     } else {
  //       // Handle other statuses if needed
  //       const statusUpdatePayload = {
  //         category_id: categoryId,
  //         user_id: userId,
  //         new_status: status,
  //         action: "CategoryApproval",
  //       };

  //       const statusResponse = await axios.put(
  //         "https://saaspro.softtrails.net/saas/asset/pro/assets/update-category-status",
  //         statusUpdatePayload
  //       );
  //       if (statusResponse.status === 200) {
  //         setMessage(`Category status updated to ${status}.`);
  //         setMessageType("success");
  //         fetchCategoryRequests();
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error updating category status:", error);
  //     setMessage("There was an error updating the category status.");
  //     setMessageType("error");
  //   }
  // };

  const updateCategoryStatus = async (
    categoryId,
    status,
    receiverId,
    description,
    categoriesname,
    categories
  ) => {
    if (!categoryId || !status) {
      console.error("categoryId or status is missing.");
      setMessage("Category ID or Status is missing.");
      setMessageType("error");
      return;
    }

    const userId = parseInt(sessionStorage.getItem("userId"), 10);
    const token = sessionStorage.getItem("token"); // ✅ get token

    // Function to update the stage based on status
    const updateStage = async (categoryId, stageValue) => {
      const stagePayload = {
        category_id: categoryId,
        value: stageValue, // value will be 'Approved', 'Hidden', or 'Resubmitted'
         submodule: "Raw material",
         action: "CategoryApproval"

      };

      try {
        const stageResponse = await axios.put(
         `${ASSET_NODE_BASE}assets/stages/${categoryId}`,
          stagePayload,
          { headers: { Authorization: `Bearer ${token}` } } // Add token
        );

        if (stageResponse.status === 200) {
          console.log(`Stage updated to ${stageValue}.`);
        }
      } catch (error) {
        console.error(`Error updating stage to ${stageValue}:`, error);
        setMessage("There was an error updating the stage.");
        setMessageType("error");
      }
    };

    try {
      if (status === "Resubmitted") {
        const resubmissionPayload = {
          category_id: categoryId,
          user_id: userId,
          new_status: "Draft",
          new_stages: "Resubmitted",
          action: "CategoryApproval",
            submodule:"Raw material"
        };

        const resubmissionResponse = await axios.put(
          `${ASSET_NODE_BASE}assets/update-category-status`,
          resubmissionPayload,
          { headers: { Authorization: `Bearer ${token}` } } // Add token
        );

        if (resubmissionResponse.status === 200) {
          setMessage(
            "Category successfully resubmitted and status set to Draft."
          );
          setMessageType("success");
          fetchCategoryRequests();
          await updateStage(categoryId, "Resubmitted");
        }
      } else if (status === "Active") {
        let categoryName = "Unknown";

        if (Array.isArray(categories) && categories.length > 0) {
          const categoryObj = categories.find(
            (cat) => Number(cat.categoryId) === Number(categoryId)
          );
          categoryName = categoryObj?.categoriesname || "Unknown";
        } else if (categoriesname) {
          categoryName = categoriesname;
        }

        const activePayload = {
          category_id: categoryId,
          user_id: userId,
          new_status: "Active",
          value: "Approved",
          action: "CategoryApproval",
          category_name: categoryName,
         submodule:"Raw material"
        };

        const activeResponse = await axios.put(
          `${ASSET_NODE_BASE}assets/update-category-status`,
          activePayload,
          { headers: { Authorization: `Bearer ${token}` } } // Add token
        );

        if (activeResponse.status === 200) {
          setMessage("Material Category Status Successfully Updated.");
          setMessageType("success");
          setShowPublishPrompt(true);
          fetchCategoryRequests();
          await updateStage(categoryId, "Approved");
        }
      } else if (status === "Inactive") {
        const inactivePayload = {
          category_id: categoryId,
          user_id: userId,
          new_status: "Inactive",
          value: "Hidden",
          action: "CategoryApproval",
          submodule:"Raw material"
        };

        const inactiveResponse = await axios.put(
          `${ASSET_NODE_BASE}assets/update-category-status`,
          inactivePayload,
          { headers: { Authorization: `Bearer ${token}` } } // Add token
        );

        if (inactiveResponse.status === 200) {
          setMessage(
            "Category status updated to Inactive and stage set to Hidden."
          );
          setMessageType("success");
          fetchCategoryRequests();
          await updateStage(categoryId, "Hidden");
        }
      } else {
        const statusUpdatePayload = {
          category_id: categoryId,
          user_id: userId,
          new_status: status,
          action: "CategoryApproval",
          submodule:"Raw material"
        };

        const statusResponse = await axios.put(
          `${ASSET_NODE_BASE}assets/update-category-status`,
          statusUpdatePayload,
          { headers: { Authorization: `Bearer ${token}` } } // Add token
        );

        if (statusResponse.status === 200) {
          setMessage(`Category status updated to ${status}.`);
          setMessageType("success");
          fetchCategoryRequests();
          await updateStage(categoryId, status);
        }
      }
    } catch (error) {
      console.error("Error updating category status:", error);
      setMessage("There was an error updating the category status.");
      setMessageType("error");
    }
  };


  // const getCurrentCategoryStatus = async (categoryId) => {
  //   try {
  //     const response = await axios.get(
  //       `https://saaspro.softtrails.net/saas/java/pro/api/categories/id/${categoryId}`
  //     );
  //     return response.data.status;
  //   } catch (error) {
  //     console.error("Error fetching current category status:", error);
  //     return null;
  //   }
  // };

  useEffect(() => {
    fetchCategoryRequests();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_id");
    navigate("/");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="p-6 flex flex-col w-full">
        <div className="flex justify-left space-x-6 mb-0 mt-2">
          {["Material", "Category"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative text-sm font-bold py-2 px-6 transition-all duration-500 ease-out rounded-full ${activeTab === tab
                ? "bg-blue-600 text-white scale-105 shadow-md"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              {tab} Requests
            </button>
          ))}
        </div>

        <RequestTable
          type={activeTab}
          requests={requests}
          onUpdateStatus={updateCategoryStatus}
          onResubmit={handleResubmission}
          showPublishPrompt={showPublishPrompt}
          setShowPublishPrompt={setShowPublishPrompt}
        />
      </div>

      {/* Modal for Resubmission */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Resubmit Request</h2>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="bg-red-700 text-white px-4 py-2  rounded-lg"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={handleSubmitResubmission}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Message Modal */}
      <MessageModal
        message={message}
        type={messageType}
        setMessage={setMessage}
      />
    </div>
  );
};

export default ApprovalAuthority;
