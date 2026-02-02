import React, { useState, useEffect, useRef } from "react";
import {
  FaHome,
  FaSignOutAlt,
  FaEye,
  FaEdit,
  FaFileDownload,
  FaRegFileAlt,
  FaFilter,
} from "react-icons/fa";
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
  const [assetStartDate, setAssetStartDate] = useState("");
  const [assetEndDate, setAssetEndDate] = useState("");
  const [categoryStartDate, setCategoryStartDate] = useState("");
  const [categoryEndDate, setCategoryEndDate] = useState("");
  const [selectedEditCategoryId, setSelectedEditCategoryId] = useState(null);

  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editDetails, setEditDetails] = useState(null);
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [editCategoryDetails, setEditCategoryDetails] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All Assets");
  const [categories, setCategories] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const modalRef = useRef(null);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(""); // Add this state to handle errors
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState(""); // State to store the type of message
  const [uniqueId, setUniqueId] = useState(null);
  const [showDateFilters, setShowDateFilters] = useState(false);
  const [categoryMap, setCategoryMap] = useState({});
  const [selectedEditCategory, setSelectedEditCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null); // for Add flow
  const [isCategoryPublished, setIsCategoryPublished] = useState(false);
const [isPaginating, setIsPaginating] = useState(false);
// 🧭 Pagination + Search Management States
const [limit, setLimit] = useState(25); // items per page
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalRecords, setTotalRecords] = useState(0);

const [debounceTimer, setDebounceTimer] = useState(null);
  const requestData =
    {
      Asset: requests.assetRequests,
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
        const token = sessionStorage.getItem("token"); // 🔑 Get token

        const response = await axios.get(
          `${JAVA_BASE}api/categories/movable`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Attach token
            },
          }
        );

        setCategories(response.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
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
      type:"Movable",
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


  // const handleCategoryUpdate = (type, request) => {
  //   // Set edit details state
  //   setEditDetails({
  //     type,
  //     request,
  //   });

  //   const filterCategoryFields = Array.isArray(categoryDetails)
  //     ? categoryDetails.filter((c) => c.categoryName === request.categoriesname)
  //     : [];

  //   // Set edit category details safely
  //   setEditCategoryDetails(
  //     filterCategoryFields.map((c) => ({
  //       id: c.id,
  //       fieldname: c.fieldname,
  //       assetDataType: c.assetDataType,
  //       isUnique: c.isUnique,
  //       isNullable: c.isNullable,
  //     }))
  //   );

  //   console.log({ editCategoryDetails, filterCategoryFields, request });

  //   // Open modal
  //   setIsEditCategoryModalOpen(true);
  // };

  // const onPublish = async () => {
  //   try {
  //     const editFields = {};

  //     for (let field of editCategoryDetails) {
  //       editFields[field.fieldname] = `${field.assetDataType}, ${
  //         field.isUnique ? "UNIQUE, " : ""
  //       }${field.isNullable ? "NOT NULL" : ""}`;
  //     }

  //     const publishData = {
  //       categoryName: editDetails.request?.categoriesname,
  //       fields: editFields,
  //     };

  //     // Get token from sessionStorage or wherever you're storing it
  //     const token = sessionStorage.getItem("token"); // or localStorage.getItem("token");

  //     const response = await axios.post(
  //       "https://saaspro.softtrails.net/saas/asset/pro/assettable",
  //       publishData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log("Response from Publish:", response.data);
  //     closeModal();
  //     setMessage("Form published successfully. You can now view it in the Asset repository.");
  //     setMessageType("success");
  //     setShowPublishPrompt(false);
  //   } catch (error) {
  //     setMessage("There was an error publishing the category.");
  //     setMessageType("error");
  //   }
  // };

  useEffect(() => {
    if (isCategoryPublished) {
      // Keep editCategoryDetails as it is — do not reset
    }
  }, [isCategoryPublished]);

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

  // const onPublish = async (categoryId) => {
  //   try {
  //     const editFields = {};
  //     for (let field of editCategoryDetails) {
  //       editFields[field.fieldname] = `${field.assetDataType}, ${
  //         field.isUnique ? "UNIQUE, " : ""
  //       }${field.isNullable ? "NOT NULL" : ""}`;
  //     }

  //     const publishData = {
  //       categoryName: editDetails.request?.categoriesname,
  //       fields: editFields,
  //     };

  //     const token = sessionStorage.getItem("token");

  //     const response = await axios.post(
  //       "https://saaspro.softtrails.net/saas/asset/pro/assettable",
  //       publishData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     console.log("Publish success:", response.data);

  //     // ✅ Save to localStorage
  //     const published = JSON.parse(localStorage.getItem("publishedCategories") || "[]");
  //     if (!published.includes(categoryId)) {
  //       published.push(categoryId);
  //       localStorage.setItem("publishedCategories", JSON.stringify(published));
  //     }

  //     setIsCategoryPublished(true); // ✅ Hide button
  //     setMessage("Form published successfully. You can now view it in the Asset repository.");
  //     setMessageType("success");

  //   } catch (error) {
  //     console.error("Error during publish:", error);
  //     setMessage("There was an error publishing the category.");
  //     setMessageType("error");
  //   }
  // };

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
        
        publishData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Publish success:", response.data);

      // ✅ Save published categoryId
      const published = JSON.parse(
        localStorage.getItem("publishedCategories") || "[]"
      );
      if (!published.includes(categoryId)) {
        published.push(categoryId);
        localStorage.setItem("publishedCategories", JSON.stringify(published));
      }

      // ✅ Save the current field list too
      localStorage.setItem(
        `fields_${categoryId}`,
        JSON.stringify(editCategoryDetails)
      );

      setIsCategoryPublished(true);
      closeModal();
      setMessage(
        "Form published successfully. You can now view it in the Asset repository."
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
    let name = "";
    let start = "";
    let end = "";

    // Determine name and date filters based on type
    if (type === "Asset") {
      name = request.assetname;
      start = assetStartDate;
      end = assetEndDate;
    } else if (type === "Asset Category" || type === "Category") {
      name = request.categoriesname;
      start = categoryStartDate;
      end = categoryEndDate;
    }

    const matchesSearch = (name?.toLowerCase() || "").includes(
      searchTerm.toLowerCase()
    );

    const createdAt = request.createdAt ? new Date(request.createdAt) : null;

    const matchesDate =
      (!start || (createdAt && createdAt >= new Date(start))) &&
      (!end || (createdAt && createdAt <= new Date(end)));

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

  const extractErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "An unexpected error occurred."
    );
  };
  const handleApprovals = async (unique_id) => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId || !token) {
      alert("User not logged in or token is missing.");
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

    const commonHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // 🔑 Token added
    };

    const lifecyclePayload = {
      category_id: selectedCategoryId,
      user_id: parsedUserId,
      new_stages: "Active",
      sub_stages: "Added",
      action: "AssetApproval",
      submodule: "Movable"
    };

    try {
      // 🔁 1. Update lifecycle
      const lifecycleResponse = await fetch(
       `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
        {
          method: "PUT",
          headers: commonHeaders,
          body: JSON.stringify(lifecyclePayload),
        }
      );

      const lifecycleData = await lifecycleResponse.json();
      if (!lifecycleResponse.ok || lifecycleData.error) {
        throw new Error(
          lifecycleData?.message ||
          lifecycleData?.error ||
          "Lifecycle update failed."
        );
      }

      // 🔁 2. Update asset status
      const assetStatusPayload = {
        category_id: selectedCategoryId,
        user_id: parsedUserId,
        new_status: "Inventory",
        action: "AssetApproval",
        submodule: "Movable"
      };

      const assetStatusResponse = await fetch(
       `${ASSET_NODE_BASE}assets/update-asset-status/${unique_id}`,
        {
          method: "PUT",
          headers: commonHeaders,
          body: JSON.stringify(assetStatusPayload),
        }
      );

      const assetStatusData = await assetStatusResponse.json();
      if (!assetStatusResponse.ok || assetStatusData.error) {
        throw new Error(
          assetStatusData?.message ||
          assetStatusData?.error ||
          "Asset status update failed."
        );
      }

      console.log("Asset status update successful:", assetStatusData);

      // 🔁 3. Insert asset history
      try {
        const historyPayload = {
          assetId: unique_id,
          categoryId: selectedCategoryId,
          updatedBy: parsedUserId,
          previousSubStages: "Added",
          currentSubStages: "Added",
          currentStatus: "Inventory",
          previousStatus: "Repository",
          action: "Asset Approved",
          assetname: selectedAsset?.assetname || "",
        };

        const historyResponse = await fetch(
         `${JAVA_BASE}api/assethistory/insert-history`,
          {
            method: "POST",
            headers: commonHeaders,
            body: JSON.stringify(historyPayload),
          }
        );

        const historyData = await historyResponse.json();
        if (!historyResponse.ok || historyData.error) {
          throw new Error(
            historyData?.message ||
            historyData?.error ||
            "Failed to log asset history."
          );
        }

        console.log("Asset History Recorded:", historyData);
      } catch (historyError) {
        console.error("Asset History API error:", historyError);
        setMessage(extractErrorMessage(historyError));
        setMessageType("error");
      }

      // 🔁 4. Generate QR Code
      try {
        const qrCodeResponse = await fetch(
          `${JAVA_BASE}api/qr/generate?categoryId=${selectedCategoryId}&assetId=${unique_id}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`, // ✅ Only auth needed
            },
          }
        );

        const contentType = qrCodeResponse.headers.get("content-type");
        const qrCodeData = contentType?.includes("application/json")
          ? await qrCodeResponse.json()
          : await qrCodeResponse.text();
 const isLastItemOnPage = filteredData.length === 1 && currentPage > 1;
        if (!qrCodeResponse.ok || qrCodeData?.error) {
          throw new Error(
            qrCodeData?.message ||
            qrCodeData?.error ||
            "QR Code generation failed."
          );
        }

        console.log("QR Code generated successfully:", qrCodeData);

        setIsModalOpen(false);
        setMessage("Asset approved and QR Code generated successfully!");
        setMessageType("success");
        fetchAllPendingAssets();
      } catch (qrError) {
        console.error("QR Code generation failed:", qrError);
        setMessage(extractErrorMessage(qrError));
        setMessageType("error");
      }
    } catch (error) {
      console.error("Approval process failed:", error);
      setMessage(extractErrorMessage(error));
      setMessageType("error");
    }
  };


  //     const handleApprovals = async (unique_id) => {
  //   const userId = sessionStorage.getItem("userId");

  //   if (!userId) {
  //     console.error("User ID is missing or invalid in sessionStorage.");
  //     alert("User not logged in or user ID is missing.");
  //     return;
  //   }

  //   const parsedUserId = parseInt(userId, 10);
  //   if (isNaN(parsedUserId)) {
  //     console.error("Invalid User ID retrieved from sessionStorage.");
  //     alert("Invalid User ID.");
  //     return;
  //   }

  //   // 🟡 Get category name from any available source
  //   const categoryName =
  //     selectedEditCategory || selectedCategory || formData?.category;

  //   if (!categoryName) {
  //     console.error("No category selected.");
  //     alert("Please select a category.");
  //     return;
  //   }

  //   // 🟢 Try to find categoryId from multiple sources
  //   let selectedCategoryId = selectedEditCategoryId;

  //   if (!selectedCategoryId) {
  //     const matched = categories.find(
  //       (cat) => cat.categoriesname === categoryName
  //     );
  //     selectedCategoryId = matched?.categoryId || categoryMap?.[categoryName];
  //   }

  //   if (!selectedCategoryId) {
  //     console.error("Category ID not found.");
  //     alert("Could not determine category ID.");
  //     return;
  //   }

  //   // ✅ Prepare payloads
  //   const lifecyclePayload = {
  //     category_id: selectedCategoryId,
  //     user_id: parsedUserId,
  //     new_stages: "Active",
  //     sub_stages: "Added",
  //     action: "AssetApproval",
  //   };

  //   try {
  //     // 🔁 1. Update lifecycle
  //     const lifecycleResponse = await fetch(
  //       `https://saaspro.softtrails.net/saas/asset/pro/lifecycle/update-asset-status/${unique_id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(lifecyclePayload),
  //       }
  //     );

  //     if (!lifecycleResponse.ok) {
  //       throw new Error(`Lifecycle Update Error: ${lifecycleResponse.status}`);
  //     }

  //     const lifecycleData = await lifecycleResponse.json();

  //     // 🔁 2. Update asset status
  //     const assetStatusPayload = {
  //       category_id: selectedCategoryId,
  //       user_id: parsedUserId,
  //       new_status: "Inventory",
  //       action: "AssetApproval",
  //     };

  //     const assetStatusResponse = await fetch(
  //       `https://saaspro.softtrails.net/saas/asset/pro/assets/update-asset-status/${unique_id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(assetStatusPayload),
  //       }
  //     );

  //     if (!assetStatusResponse.ok) {
  //       throw new Error(
  //         `Asset Status Update Error: ${assetStatusResponse.status}`
  //       );
  //     }

  //     const assetStatusData = await assetStatusResponse.json();
  //     console.log("Asset status update successful:", assetStatusData);

  //     // 🔁 3. Insert asset history
  //     try {
  //       const historyPayload = {
  //         assetId: unique_id,
  //         categoryId: selectedCategoryId,
  //         updatedBy: parsedUserId,
  //         previousSubStages: "Added",
  //         currentSubStages: "Added",
  //         currentStatus: "Inventory",
  //         previousStatus: "Repository",
  //         action: "Asset Approved",
  //         assetname: selectedAsset?.assetname || "",
  //       };

  //       const historyResponse = await fetch(
  //         "https://saaspro.softtrails.net/saas/java/pro/api/assethistory/insert-history",
  //         {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify(historyPayload),
  //         }
  //       );

  //       const historyData = await historyResponse.json();
  //       if (!historyResponse.ok || historyData.error) {
  //         throw new Error(
  //           historyData.message || "Failed to log asset history."
  //         );
  //       }

  //       console.log("Asset History Recorded:", historyData);
  //     } catch (historyError) {
  //       console.error("Asset History API error:", historyError);
  //     }

  //     // 🔁 4. Generate QR Code
  //     try {
  //       const qrCodeResponse = await fetch(
  //         `https://saaspro.softtrails.net/saas/java/pro/api/qr/generate?categoryId=${selectedCategoryId}&assetId=${unique_id}`,
  //         {
  //           method: "POST",
  //         }
  //       );

  //       if (!qrCodeResponse.ok) {
  //         throw new Error(`QR Code Generation Error: ${qrCodeResponse.status}`);
  //       }

  //       const contentType = qrCodeResponse.headers.get("content-type");
  //       let qrCodeData = contentType?.includes("application/json")
  //         ? await qrCodeResponse.json()
  //         : await qrCodeResponse.text();

  //       console.log("QR Code generated successfully:", qrCodeData);

  //       // ✅ Final success state
  //       setIsModalOpen(false);
  //       setMessage("Asset approved and QR Code generated successfully!");
  //       setMessageType("success");
  //       fetchAllPendingAssets();
  //     } catch (qrError) {
  //       console.error("QR Code generation failed:", qrError);
  //       setMessage("Failed to generate QR Code. Please try again.");
  //       setMessageType("error");
  //     }
  //   } catch (error) {
  //     console.error("Approval process failed:", error);
  //     setMessage(
  //       "Failed to approve the asset or update lifecycle. Please try again."
  //     );
  //     setMessageType("error");
  //   }
  // };

  const resetAssetDates = () => {
    setAssetStartDate("");
    setAssetEndDate("");
  };

  // Reset function for category dates
  const resetCategoryDates = () => {
    setCategoryStartDate("");
    setCategoryEndDate("");
  };

  // const handleResubmissions = async (unique_id) => {
  //   const userId = sessionStorage.getItem("userId");

  //   if (!userId) {
  //     console.error("User ID is missing or invalid in sessionStorage.");
  //     alert("User not logged in or user ID is missing.");
  //     return;
  //   }

  //   const parsedUserId = parseInt(userId, 10);

  //   if (isNaN(parsedUserId)) {
  //     console.error("Invalid User ID retrieved from sessionStorage.");
  //     alert("Invalid User ID.");
  //     return;
  //   }

  //   if (!selectedCategory) {
  //     console.error("No category selected.");
  //     alert("Please select a category.");
  //     return;
  //   }

  //   const selectedCategoryObj = categories.find(
  //     (category) => category.categoriesname === selectedCategory
  //   );

  //   if (!selectedCategoryObj) {
  //     console.error("Category not found in the categories list.");
  //     alert("Invalid or missing category.");
  //     return;
  //   }

  //   const selectedCategoryId = selectedCategoryObj.categoryId;

  //   // Prepare the payload for lifecycle update
  //   const resubmissionPayload = {
  //     user_id: parsedUserId,
  //     new_stages: "Resubmitted",
  //     sub_stages: "Added",
  //     category_id: selectedCategoryId,
  //     action: "AssetApproval",
  //   };

  //   try {
  //     // Lifecycle API call
  //     const response = await fetch(
  //       `https://saaspro.softtrails.net/saas/asset/pro/lifecycle/update-asset-status/${unique_id}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(resubmissionPayload),
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`Resubmission Update Error: ${response.status}`);
  //     }

  //     const result = await response.json();
  //     console.log("Asset resubmission successful:", result);

  //     // Asset History API call
  //     try {
  //       const historyPayload = {
  //         assetId: unique_id,
  //         categoryId: selectedCategoryId,
  //         updatedBy: parsedUserId,
  //         previousSubStages: "Added",
  //         currentSubStages: "Added",
  //         currentStatus: "Repository",
  //         previousStatus: "Repository",
  //         action: "Asset Resubmitted",
  //         assetname: selectedAsset?.assetname || "", // Use selected asset name if available
  //       };

  //       const historyResponse = await fetch(
  //         "https://saaspro.softtrails.net/saas/java/pro/api/assethistory/insert-history",
  //         {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(historyPayload),
  //         }
  //       );

  //       const historyData = await historyResponse.json();
  //       if (!historyResponse.ok || historyData.error) {
  //         throw new Error(
  //           historyData.message || "Failed to log asset history."
  //         );
  //       }

  //       console.log("Asset History logged:", historyData);
  //     } catch (historyError) {
  //       console.error("Asset History API error:", historyError);
  //     }

  //     // Success feedback
  //     setIsModalOpen(false);
  //     setIsAssetModalOpen(false);
  //     setMessage("Asset resubmitted successfully!");
  //     setMessageType("success");
  //   } catch (error) {
  //     console.error("Asset resubmission failed:", error);
  //     setMessage("Failed to resubmit the asset. Please try again.");
  //     setMessageType("error");
  //   }
  // };
  const handleResubmissions = async (unique_id) => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId) {
      console.error("User ID is missing or invalid in sessionStorage.");
      alert("User not logged in or user ID is missing.");
      return;
    }

    const parsedUserId = parseInt(userId, 10);

    if (isNaN(parsedUserId)) {
      console.error("Invalid User ID retrieved from sessionStorage.");
      alert("Invalid User ID.");
      return;
    }

    // ✅ Get category ID from either Add or Edit mode
    const selectedCatId = selectedCategoryId || selectedEditCategoryId;

    if (!selectedCatId) {
      console.error("Category ID is missing.");
      alert(
        "Please select a category or ensure the asset has a valid category."
      );
      return;
    }

    // 📦 Payload for lifecycle update
    const resubmissionPayload = {
      user_id: parsedUserId,
      new_stages: "Resubmitted",
      sub_stages: "Added",
      category_id: selectedCatId,
      action: "AssetApproval",
      submodule: "Movable"
    };

    try {
      // 🛠️ Lifecycle update
      const response = await fetch(
        `${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Added token
          },
          body: JSON.stringify(resubmissionPayload),
        }
      );

      if (!response.ok) {
        throw new Error(`Resubmission Update Error: ${response.status}`);
      }

      const result = await response.json();
      console.log("Asset resubmission successful:", result);

      // 📝 Asset History logging
      try {
        const historyPayload = {
          assetId: unique_id,
          categoryId: selectedCatId,
          updatedBy: parsedUserId,
          previousSubStages: "Added",
          currentSubStages: "Added",
          currentStatus: "Repository",
          previousStatus: "Repository",
          action: "Asset Resubmitted",
          assetname: selectedAsset?.assetname || "",
        };

        const historyResponse = await fetch(
          `${JAVA_BASE}api/assethistory/insert-history`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // ✅ Added token
            },
            body: JSON.stringify(historyPayload),
          }
        );
 const isLastItemOnPage = filteredData.length === 1 && currentPage > 1;
        const historyData = await historyResponse.json();
        if (!historyResponse.ok || historyData.error) {
          throw new Error(
            historyData.message || "Failed to log asset history."
          );
        }

        console.log("Asset History logged:", historyData);
      } catch (historyError) {
        console.error("Asset History API error:", historyError);
      }

      // ✅ Final feedback
      setIsModalOpen(false);
      setIsAssetModalOpen(false);
      setMessage("Asset resubmitted successfully!");
      setMessageType("success");
      fetchAllPendingAssets();
    } catch (error) {
      console.error("Asset resubmission failed:", error);
      setMessage("Failed to resubmit the asset. Please try again.");
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
            Authorization: `Bearer ${token}`, // ✅ Attach token
          },
        }
      );

      console.log("response", response.data);
      setCategoryDetails(response.data);
    } catch (error) {
      console.error("Error fetching categories fields:", error);
    }
  };

  console.log({ categoryDetails });

  useEffect(() => {
    fetchCategoryFields();
  }, []);

  const openApprovalModal = (assetId) => {
    // setSelectedAssetId(assetId); // Store the selected asset ID
    setIsModalOpen(true); // Open the modal
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
const fetchAllPendingAssets = async (page = 1, limitValue = limit, search = "") => {
  try {
    const safePage = page < 1 ? 1 : page; // ✅ Fix page floor
    const token = sessionStorage.getItem("token");

    const response = await axios.get(
      `${ASSET_NODE_BASE}getPendingAssetsByTypess`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          type: "Movable",
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



const handleEdit = async (unique_id) => {
  // ✅ Fix: tableData is now an array, not an object
  const assetList = Array.isArray(tableData) ? tableData : tableData.data || [];

  if (!Array.isArray(assetList) || assetList.length === 0) {
    console.error("Asset data not available.");
    return;
  }

  const asset = assetList.find((row) => row.unique_id === unique_id);
  if (!asset) {
    console.error("Asset not found.");
    return;
  }

  // ✅ Set modal states
  setSelectedAssetId(unique_id);
  setFormData(asset);
  setEditingAssetId(unique_id);
  setIsAssetModalOpen(true);
  setSelectedAsset({
    assetId: asset.unique_id,
    assetname: asset["Asset Name"] || "",
  });

  // ✅ If category is available, fetch its fields
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
           params: { status: "Repository",
          type:"Movable"
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
  } else {
    console.warn("Category missing for selected asset:", asset);
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
          Authorization: `Bearer ${token}`, // ✅ Add token here
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


  if (tableData.length > 0) {
    console.log("Selected Category Unique ID:", tableData[0].unique_id);
  }
  function generateColorFromStage(stage) {
    // Generate a consistent color based on the stage text
    const colors = [
      "#F87171", // Red
      "#FBBF24", // Yellow
      "#34D399", // Green
      "#60A5FA", // Blue
      "#A78BFA", // Purple
    ];
    let hash = 0;
    for (let i = 0; i < stage.length; i++) {
      hash = stage.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
  function addSpacesToStage(stage) {
    // Regular expression to add spaces between camel case words
    return stage.replace(/([a-z])([A-Z])/g, "$1 $2");
  }

  const categoriesOptions = [
    { value: "All Assets", label: "All Assets" }, // ✅ prepend manually
    ...categories.map((category) => ({
      value: category.categoriesname,
      label: category.categoriesname,
    })),
  ];

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
  if (type === "Asset") {
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
      <div className="flex flex-col md:flex-row mb-4 space-y-2 md:space-y-0 md:space-x-2 flex-wrap items-center">
        {/* Left side: Search input and Select */}
        <div className="flex items-center space-x-2 w-full md:w-auto md:flex-shrink-0 justify-start">
           <input
    type="text"
    placeholder={`Search ${type}...`}
    className="border border-gray-300 rounded p-2 w-[250px] max-w-full"
    value={searchTerm}
    onChange={handleSearch}
  />

          {type === "Asset" && (
            <div className="w-[250px]">
              <Select
                options={categoriesOptions}
                value={categoriesOptions.find(
                  (option) =>
                    option.value === selectedEditCategory ||
                    option.value === selectedCategory
                )}
                onChange={(selectedOption) =>
                  handleChange({
                    target: {
                      name: "category",
                      value: selectedOption?.value,
                    },
                  })
                }
                placeholder="Select Asset Category"
                isSearchable

                className="react-select-container"
                classNamePrefix="react-select"
              />
            </div>
          )}
        </div>

        {/* Right side: Filter toggle + Date Filters + Reset */}
        <div className="flex flex-wrap items-center space-x-2 md:flex-grow justify-end">
          {(type === "Asset" || type === "Category") && (
            <button
              type="button"
              onClick={() => setShowDateFilters((prev) => !prev)}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
              aria-label="Toggle Date Filters"
              title="Toggle Date Filters"
            >
              <FaFilter className="mr-2 text-gray-600" />
              <span className="hidden md:inline-block font-bold text-gray-700">
                Filters
              </span>
            </button>
          )}

          {showDateFilters && type === "Asset" && (
            <>
              <label className="flex flex-col text-sm text-gray-700 w-full md:w-48">
                Start Date
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 mt-1 w-full"
                  value={assetStartDate}
                  onChange={(e) => setAssetStartDate(e.target.value)}
                  placeholder="Start Date"
                />
              </label>
              <label className="flex flex-col text-sm text-gray-700 w-full md:w-48">
                End Date
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 mt-1 w-full"
                  value={assetEndDate}
                  onChange={(e) => setAssetEndDate(e.target.value)}
                  placeholder="End Date"
                />
              </label>
              <button
                type="button"
                onClick={resetAssetDates}
                className="ml-2 mt-5 px-3 py-1 border border-red-400 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                Reset
              </button>
            </>
          )}

          {showDateFilters && type === "Category" && (
            <>
              <label className="flex flex-col text-sm text-gray-700 w-full md:w-48">
                Start Date
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 mt-1 w-full"
                  value={categoryStartDate}
                  onChange={(e) => setCategoryStartDate(e.target.value)}
                  placeholder="Start Date"
                />
              </label>
              <label className="flex flex-col text-sm text-gray-700 w-full md:w-48">
                End Date
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 mt-1 w-full"
                  value={categoryEndDate}
                  onChange={(e) => setCategoryEndDate(e.target.value)}
                  placeholder="End Date"
                />
              </label>
              <button
                type="button"
                onClick={resetCategoryDates}
                className="ml-2 mt-5 px-3 py-1 border border-red-400 text-red-600 rounded-lg hover:bg-red-100 transition"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Table for displaying Asset data */}
      {type === "Asset" && (
        <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
            <table className="min-w-full table-auto border-collapse  text-center">
              <thead className="text-[16px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                <tr>
                  <th className="p-5 font-bold ">S.No</th>
                  <th className="p-5 font-bold ">
                    Asset Name
                  </th>
                  <th className="p-5 font-bold ">
                    Created On
                  </th>
                  <th className="p-5 font-bold ">Stage</th>
                  <th className="p-5 font-bold ">Status</th>
                  <th className="p-5 font-bold ">Action</th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200 text-center">
                {Array.isArray(filteredData) && filteredData.length > 0 ? (
                  filteredData
                    .filter((asset) => asset.stages === "AwaitingApproval")
                    .filter((asset) => {
                      const createdAt = asset.created_at
                        ? new Date(asset.created_at)
                        : null;
                      const start = assetStartDate
                        ? new Date(assetStartDate)
                        : null;
                      const end = assetEndDate ? new Date(assetEndDate) : null;

                      return (
                        (!start || (createdAt && createdAt >= start)) &&
                        (!end || (createdAt && createdAt <= end))
                      );
                    })
                    .map((asset, index) => (
                      <tr
                        key={`${asset.category || "unknown"}-${asset.unique_id
                          }`}
                        className={`${index % 2 === 0 ? "bg-blue-50" : "bg-white"
                          } transition`}
                      >
                        <td className="px-5 py-3 text-gray-700">{Math.max((currentPage - 1) * limit + index + 1, 1)}</td>
                        <td className="px-5 py-3 text-gray-700">
                          {asset["Asset Name"]}
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {asset.created_at
                            ? formatDate(asset.created_at)
                            : "N/A"}
                        </td>
                        <td
                          className="px-5 py-3 font-bold"
                          style={{
                            color: generateColorFromStage(asset.stages),
                          }}
                        >
                          {addSpacesToStage(asset.stages)}
                        </td>
                        <td className="px-5 py-3 text-gray-700">
                          {asset.status}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-center items-center gap-3">
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

                            {Object.entries(asset).map(([key, value]) => {
                              if (
                                value &&
                                typeof value === "object" &&
                                value.url
                              ) {
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
                    .filter((category) => category.categoriesType === "Movable")
                    .filter((category) => {
                      const createdAt = category.createdAt
                        ? new Date(category.createdAt)
                        : null;
                      const start = categoryStartDate
                        ? new Date(categoryStartDate)
                        : null;
                      const end = categoryEndDate
                        ? new Date(categoryEndDate)
                        : null;

                      return (
                        (!start || (createdAt && createdAt >= start)) &&
                        (!end || (createdAt && createdAt <= end))
                      );
                    })
                    .map((request, index) => {
                      if (
                        request.stages === "FormDesign" ||
                        request.stages === "Preview"
                      ) {
                        return null;
                      }

                      return (
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
                                  <span className="text-green-500">
                                    Approved
                                  </span>
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
                              onClick={() =>
                                handleCategoryUpdate(type, request)
                              }
                            >
                              <FaEye />
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
   {type === "Asset" && totalPages > 1 && (
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
      {/* Modal Section */}
      {isAssetModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50">
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
              onSubmit={handleSubmit}
              className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Asset Category (Disabled) */}
              <div className="flex flex-col">
                <label
                  htmlFor="category"
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  Asset Category
                </label>
                <select
                  name="category"
                  value={selectedEditCategory || selectedCategory}
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

              {/* Dynamic Fields with Label Customization */}
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
                  const normalized = field.columnName
                    .toLowerCase()
                    .replace(/[_ ]/g, "");
                  let label = field.columnName;
                  if (normalized === "usefullife") {
                    label = "Useful Life (in months)";
                  } else if (normalized === "scrapvalue") {
                    label = "Scrap Value (in Rupees)";
                  } else if (normalized === "originalcost") {
                    label = "Original Cost (in Rupees)";
                  }

                  const value = formData[field.columnName];

                  // ✅ Handle object with URL (e.g., file)
                  if (value && typeof value === "object" && value.url) {
                    const fileName = value.url.split("/").pop();
                    return (
                      <div key={index} className="flex flex-col col-span-2">
                        <label className="mb-1 text-sm font-medium text-gray-700">
                          {label}
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
                  // ✅ Special layout with ₹ symbol for rupee fields
                  const isRupeeField =
                    normalized === "scrapvalue" ||
                    normalized === "originalcost";
                  // Normal input
                  return (
                    <div key={index} className="flex flex-col">
                      <label
                        htmlFor={field.columnName}
                        className="mb-1 text-sm font-medium text-gray-700"
                      >
                        {label}
                      </label>
                      {isRupeeField ? (
                        <div className="flex items-center border border-gray-300 rounded bg-[#F0F0F0]">
                          <span className="px-3 text-gray-600">₹</span>
                          <input
                            type="number"
                            name={field.columnName}
                            value={value || ""}
                            onChange={handleChange}
                            placeholder={label}
                            className="p-2 w-full bg-[#F0F0F0] focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                          />
                        </div>
                      ) : (
                        <input
                          type={
                            field.dataType === "number"
                              ? "number"
                              : field.dataType === "date" ||
                                field.columnName.toLowerCase().includes("date")
                                ? "date"
                                : "text"
                          }
                          name={field.columnName}
                          value={
                            field.dataType === "date" ||
                              field.columnName.toLowerCase().includes("date")
                              ? formData[field.columnName]
                                ? new Date(formData[field.columnName])
                                  .toISOString()
                                  .split("T")[0]
                                : ""
                              : formData[field.columnName] || ""
                          }
                          onChange={handleChange}
                          placeholder={label}
                          className="p-2 rounded border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
                        />
                      )}
                      {formErrors[field.columnName] && (
                        <span className="text-red-600 text-sm">
                          {formErrors[field.columnName]}
                        </span>
                      )}
                    </div>
                  );
                })}

              {/* General Form Error */}
              {formErrors.general && (
                <p className="text-red-600 text-sm col-span-2">
                  {formErrors.general}
                </p>
              )}

              {/* Action Buttons */}
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
                            onClick={() => {
                              onUpdateStatus(
                                editDetails.request.categoryId,
                                "Active"
                              );
                              // setShowPublishPrompt(true)
                            }}
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
                            Resubmit
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
  const [selectedReceiverId, setSelectedReceiverId] = useState(null);
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
  const fetchCategoryCreatorById = async (categoryId) => {
    try {
      const token = sessionStorage.getItem("token"); // Get token from sessionStorage
      const response = await axios.get(
        `${JAVA_BASE}api/categories/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token here
          },
        }
      );

      if (response.status === 200 && Array.isArray(response.data)) {
        const matchedCategory = response.data.find(
          (category) => category.categoryId === categoryId
        );

        return matchedCategory ? matchedCategory.createdBy : null; // ✅ Return createdBy
      } else {
        console.error("Invalid category data format.");
        return null;
      }
    } catch (error) {
      console.error("Error fetching category creator:", error);
      return null;
    }
  };

  const extractErrorMessage = (error) => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "An unexpected error occurred."
    );
  };
  const handleSubmitResubmission = async () => {
    if (!description) {
      setMessage("Description is required");
      setMessageType("error");
      return;
    }

    if (!selectedCategoryId) {
      setMessage("Category ID is required");
      setMessageType("error");
      return;
    }

    try {
      // ✅ Receiver ID fetch karo (Category ID se creator ID find karega)
      const receiverId = await fetchCategoryCreatorById(selectedCategoryId);

      if (!receiverId) {
        setMessage("Failed to fetch category creator ID");
        setMessageType("error");
        return;
      }

      const token = sessionStorage.getItem("token"); // Get token

      const resubmissionPayload = {
        category_id: selectedCategoryId,
        user_id: userId,
        new_status: "Draft",
        new_stages: "Resubmitted",
        action: "CategoryApproval",
        submodule: "Movable"

      };

      const resubmissionResponse = await axios.put(
        `${ASSET_NODE_BASE}assets/update-category-status`,
        resubmissionPayload,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token here
          },
        }
      );

      if (resubmissionResponse.status === 200) {
        console.log("Category successfully resubmitted");
        setMessage("Category resubmitted successfully!");
        setMessageType("success");

        await fetchCategoryRequests();

        const logPayload = {
          sender_id: userId,
          receiver_id: receiverId,
          category_id: selectedCategoryId,
          status: "Draft",
          stages: "Resubmitted",
          description: description,
        };

        try {
          const logResponse = await axios.post(
            `${ASSET_NODE_BASE}AMSlog`,
            logPayload,
            {
              headers: {
                Authorization: `Bearer ${token}`, // Add token here
              },
            }
          );

          if (logResponse.status === 200) {
            console.log("Action logged successfully.");
          } else {
            console.log("Failed to log action.");
          }
        } catch (logError) {
          console.error("Error logging the action:", logError);
          setMessage(extractErrorMessage(logError));
          setMessageType("error");
        }

        setIsModalOpen(false);
      } else {
        setMessage("Failed to resubmit the category. Please try again.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error resubmitting category:", error);
      setMessage(extractErrorMessage(error));
      setMessageType("error");
    }
  };

  // const handleSubmitResubmission = async () => {
  //   if (!description) {
  //     setMessage("Description is required");
  //     setMessageType("error");
  //     return;
  //   }

  //   if (!selectedCategoryId) {
  //     setMessage("Category ID is required");
  //     setMessageType("error");
  //     return;
  //   }

  //   try {
  //     // ✅ Receiver ID fetch karo (Category ID se creator ID find karega)
  //     const receiverId = await fetchCategoryCreatorById(selectedCategoryId);

  //     if (!receiverId) {
  //       setMessage("Failed to fetch category creator ID");
  //       setMessageType("error");
  //       return;
  //     }

  //     // ✅ API Payload
  //     const resubmissionPayload = {
  //       category_id: selectedCategoryId,
  //       user_id: userId,
  //       new_status: "Draft",
  //       new_stages: "Resubmitted",
  //       action: "CategoryApproval",
  //     };

  //     // ✅ Resubmission API Call
  //     const resubmissionResponse = await axios.put(
  //       "https://saaspro.softtrails.net/saas/asset/pro/assets/update-category-status",
  //       resubmissionPayload
  //     );

  //     if (resubmissionResponse.status === 200) {
  //       console.log("Category successfully resubmitted");

  //       setMessage("Category resubmitted successfully!");
  //       setMessageType("success");

  //       // ✅ Refresh category list
  //       await fetchCategoryRequests();

  //       // ✅ Log Action
  //       const logPayload = {
  //         sender_id: userId,
  //         receiver_id: receiverId, // ✅ Matched creator ID
  //         category_id: selectedCategoryId,
  //         status: "Draft",
  //         stages: "Resubmitted",
  //         description: description,
  //       };

  //       try {
  //         const logResponse = await axios.post(
  //           "https://saaspro.softtrails.net/saas/asset/pro/AMSlog",
  //           logPayload
  //         );

  //         if (logResponse.status === 200) {
  //           console.log("Action logged successfully.");
  //         } else {
  //           console.log("Failed to log action.");
  //         }
  //       } catch (logError) {
  //         console.error("Error logging the action:", logError);
  //       }

  //       // ✅ Close Modal
  //       setIsModalOpen(false);
  //     } else {
  //       setMessage(
  //         "An error occurred while resubmitting the category. Please try again."
  //       );
  //       setMessageType("error");
  //     }
  //   } catch (error) {
  //     console.error("Error resubmitting category:", error);
  //     setMessage(
  //       "An error occurred while processing the resubmission. Please try again."
  //     );
  //     setMessageType("error");
  //   }
  // };

  const fetchCategoryRequests = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Get token from sessionStorage
      const response = await axios.get(
        `${JAVA_BASE}api/categories/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Add token here
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
  //   description,
  //   categoriesname,
  //   categories
  // ) => {
  //   if (!categoryId || !status) {
  //     console.error("categoryId or status is missing.");
  //     setMessage("Category ID or Status is missing.");
  //     setMessageType("error");
  //     return;
  //   }

  //   const userId = parseInt(sessionStorage.getItem("userId"), 10);

  //   // Function to update the stage based on status
  //   const updateStage = async (categoryId, stageValue) => {
  //     const stagePayload = {
  //       category_id: categoryId,
  //       value: stageValue, // value will be 'Approved' or 'Hidden'
  //     };

  //     try {
  //       const stageResponse = await axios.put(
  //         `https://saaspro.softtrails.net/saas/asset/pro/assets/stages/${categoryId}`,
  //         stagePayload
  //       );

  //       if (stageResponse.status === 200) {
  //         console.log(`Stage updated to ${stageValue}.`);
  //       }
  //     } catch (error) {
  //       console.error(`Error updating stage to ${stageValue}:`, error);
  //       setMessage("There was an error updating the stage.");
  //       setMessageType("error");
  //     }
  //   };

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
  //         setMessage(
  //           "Category successfully resubmitted and status set to Draft."
  //         );
  //         setMessageType("success");
  //         fetchCategoryRequests();

  //         // Call to update the stage (for Resubmitted)
  //         await updateStage(categoryId, "Resubmitted");
  //       }
  //     } else if (status === "Active") {
  //       // ✅ Safely determine category name
  //       let categoryName = "Unknown";

  //       if (Array.isArray(categories) && categories.length > 0) {
  //         const categoryObj = categories.find(
  //           (cat) => Number(cat.categoryId) === Number(categoryId)
  //         );
  //         categoryName = categoryObj?.categoriesname || "Unknown";
  //       } else if (categoriesname) {
  //         categoryName = categoriesname;
  //       }

  //       const activePayload = {
  //         category_id: categoryId,
  //         user_id: userId,
  //         new_status: "Active",
  //         value: "Approved",
  //         action: "CategoryApproval",
  //         category_name: categoryName,
  //       };

  //       try {
  //         const activeResponse = await axios.put(
  //           "https://saaspro.softtrails.net/saas/asset/pro/assets/update-category-status",
  //           activePayload
  //         );

  //         if (activeResponse.status === 200) {
  //           setMessage("Asset Category Status Successfully Updated.");
  //           setMessageType("success");
  //           setShowPublishPrompt(true);
  //           fetchCategoryRequests();

  //           // ✅ Update Stage
  //           await updateStage(categoryId, "Approved");

  //           // ✅ Get Users with AssetAddition action
  //           const userResponse = await axios.get(
  //             `https://saaspro.softtrails.net/saas/java/pro/workflow/users-by-category/${categoryId}`
  //           );

  //           const assetAdditionUsers = userResponse.data.filter(
  //             (user) =>
  //               Array.isArray(user.action) &&
  //               user.action.some(
  //                 (action) => action.trim().toLowerCase() === "assetaddition"
  //               )
  //           );

  //           if (assetAdditionUsers.length === 0) {
  //             console.warn("No users with AssetAddition action.");
  //           }

  //           // ✅ Get Module Details
  //           const moduleResponse = await axios.get(
  //             "https://ucsdemo.softtrails.net/api/modules"
  //           );

  //           let targetModule = moduleResponse.data.find(
  //             (mod) =>
  //               mod.subName === "Approval" && mod.moduleName === "EAM-CFD"
  //           );

  //           if (!targetModule) {
  //             console.warn("Module not found. Using fallback.");
  //             targetModule = {
  //               id: "41f02bc2-4eec-4c43-ac2b-c88cd74b357a",
  //               name: "Category",
  //               subName: "Approval/Submission/Rejection",
  //               moduleName: "EAM-CFD",
  //             };
  //           }

  //           // ✅ Send Notifications
  //           for (const user of assetAdditionUsers) {
  //             const notificationPayload = {
  //               name: `${user.first_name} ${user.last_name || ""}`.trim(),
  //               email: user.email,
  //               phone_no: user.phone_no,
  //               categoryName,
  //               categoryId,
  //               status: "Active",
  //               subName: targetModule.subName,
  //               moduleName: targetModule.moduleName,
  //               moduleId: targetModule.id,
  //             };

  //             try {
  //               const notifyResponse = await axios.post(
  //                 "https://ucsdemo.softtrails.net/ucs/send",
  //                 notificationPayload,
  //                 {
  //                   headers: {
  //                     "Content-Type": "application/json",
  //                   },
  //                 }
  //               );
  //               console.log(
  //                 `✅ UCS sent to ${user.email}:`,
  //                 notifyResponse.data
  //               );
  //             } catch (notifyError) {
  //               console.error(
  //                 `❌ Failed to notify ${user.email}:`,
  //                 notifyError.response?.data || notifyError.message
  //               );
  //             }
  //           }
  //         }
  //       } catch (err) {
  //         console.error("❌ Error in Active block:", err.message);
  //         if (err.response) {
  //           console.error(
  //             "➡️ Response Error:",
  //             err.response.status,
  //             err.response.data
  //           );
  //         } else if (err.request) {
  //           console.error("➡️ Request Error:", err.request);
  //         } else {
  //           console.error("➡️ General Error:", err.message);
  //         }
  //       }
  //     } else if (status === "Inactive") {
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
  //         setMessage(
  //           "Category status updated to Inactive and stage set to Hidden."
  //         );
  //         setMessageType("success");
  //         fetchCategoryRequests();

  //         // Call to update the stage (for Inactive)
  //         await updateStage(categoryId, "Hidden");
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

  //         // Call to update the stage (for other statuses)
  //         await updateStage(categoryId, status);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error updating category status:", error);
  //     setMessage("There was an error updating the category status.");
  //     setMessageType("error");
  //   }
  // };

  // 🔧 Error Message Helper

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

  const updateStage = async (categoryId, stageValue) => {
    const stagePayload = {
      category_id: categoryId,
      value: stageValue,
      submodule: "Movable",
      action: "CategoryApproval"
    };

    try {
      const stageResponse = await axios.put(
        `${ASSET_NODE_BASE}assets/stages/${categoryId}`,
        stagePayload,
        {
          headers: { Authorization: `Bearer ${token}` }, // Add token
        }
      );

      if (stageResponse.status === 200) {
        console.log(`Stage updated to ${stageValue}.`);
      }
    } catch (error) {
      console.error(`Error updating stage to ${stageValue}:`, error);
      setMessage(extractErrorMessage(error));
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
        submodule: "Movable"
      };

      const resubmissionResponse = await axios.put(
        `${ASSET_NODE_BASE}assets/update-category-status`,
        resubmissionPayload,
        {
          headers: { Authorization: `Bearer ${token}` }, // Add token
        }
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
        submodule : "Movable"
      };

      try {
        const activeResponse = await axios.put(
          `${ASSET_NODE_BASE}assets/update-category-status`,
          activePayload,
          {
            headers: { Authorization: `Bearer ${token}` }, // Add token
          }
        );

        if (activeResponse.status === 200) {
          setMessage("Asset Category Status Successfully Updated.");
          setMessageType("success");
          setShowPublishPrompt(true);
          fetchCategoryRequests();
          await updateStage(categoryId, "Approved");

          const userResponse = await axios.get(
         `${JAVA_BASE}workflow/users-by-category/${categoryId}`,
            {
              headers: { Authorization: `Bearer ${token}` }, // Add token
            }
          );

          const assetAdditionUsers = userResponse.data.filter(
            (user) =>
              Array.isArray(user.action) &&
              user.action.some(
                (action) => action.trim().toLowerCase() === "assetaddition"
              )
          );

          if (assetAdditionUsers.length === 0) {
            console.warn("No users with AssetAddition action.");
          }

          const moduleResponse = await axios.get(
            `${UCS_BASE}/modules`,
            {
              headers: { Authorization: `Bearer ${token}` }, // Add token if required
            }
          );

          let targetModule = moduleResponse.data.find(
            (mod) =>
              mod.subName === "Approval" && mod.moduleName === "EAM-CFD"
          );

          if (!targetModule) {
            console.warn("Module not found. Using fallback.");
            targetModule = {
              id: "41f02bc2-4eec-4c43-ac2b-c88cd74b357a",
              name: "Category",
              subName: "Approval/Submission/Rejection",
              moduleName: "EAM-CFD",
            };
          }

          for (const user of assetAdditionUsers) {
            const notificationPayload = {
              name: `${user.first_name} ${user.last_name || ""}`.trim(),
              email: user.email,
              phone_no: user.phone_no,
              categoryName,
              categoryId,
              status: "Active",
              subName: targetModule.subName,
              moduleName: targetModule.moduleName,
              moduleId: targetModule.id,
            };

            try {
              const notifyResponse = await axios.post(
                `${UCS_BASE}ucs/send`,
                notificationPayload,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Add token
                  },
                }
              );
              console.log(`✅ UCS sent to ${user.email}:`, notifyResponse.data);
            } catch (notifyError) {
              console.error(
                `❌ Failed to notify ${user.email}:`,
                notifyError.response?.data || notifyError.message
              );
            }
          }
        }
      } catch (err) {
        console.error("❌ Error in Active block:", err.message);
      }
    } else if (status === "Inactive") {
      const inactivePayload = {
        category_id: categoryId,
        user_id: userId,
        new_status: "Inactive",
        value: "Hidden",
        action: "CategoryApproval",
        submodule: "Movable"
      };

      const inactiveResponse = await axios.put(
        `${ASSET_NODE_BASE}assets/update-category-status`,
        inactivePayload,
        {
          headers: { Authorization: `Bearer ${token}` }, // Add token
        }
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
        submodule: "Movable"
      };

      const statusResponse = await axios.put(
        `${ASSET_NODE_BASE}assets/update-category-status`,
        statusUpdatePayload,
        {
          headers: { Authorization: `Bearer ${token}` }, // Add token
        }
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
    setMessage(extractErrorMessage(error));
    setMessageType("error");
  }
};


  const getCurrentCategoryStatus = async (categoryId) => {
    try {
      const response = await axios.get(
       `${JAVA_BASE}api/categories/id/${categoryId}`
      );
      return response.data.status;
    } catch (error) {
      console.error("Error fetching current category status:", error);
      return null;
    }
  };

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
          {["Asset", "Category"].map((tab) => (
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
          onResubmit={handleResubmission} // Pass the handler to table
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
