import React, { useState, useEffect, useRef } from "react";
import { FaEdit, FaTrash, FaTimes, FaSave, FaEye } from "react-icons/fa";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RolesAddModal from "./RolesAddModal";
import MessageModal from "../ApprovalAuthority/MessageModal";
//import ProfileDropdown from "../../ProfileDropdown";
import { DMS_BASE, JAVA_BASE, ASSET_NODE_BASE, UCS_BASE, MAIN_BASE } from "../../config/apiBase"
const Category = () => {
  const [categoryData, setCategoryData] = useState({
    categoryName: "",
    categoryType: "Movable",
    workflowname: "Select Workflow",
    approvalrole: "Approvers Role", // Initialize approversRole
    createdBy: "userId ",
    role: "Select Role",
    AssetRole: "Select Role",
    status: "Draft",
    stages: "Preview",
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAssetApprovalModal, setShowAssetApprovalModal] = useState(false);
  const [showAssetAdditionModal, setShowAssetAdditionModal] = useState(false);

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false); // State for Select All check
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [existingFields, setExistingFields] = useState([]);

  const [newFields, setNewFields] = useState([
    {
      fieldname: "",
      assetDataType: "String",
      isUnique: false,
      isNullable: false,
    },
  ]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedRoles, setSelectedRoles] = useState("");
  const [selectedMappedRoles, setSelectedMappedRoles] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState("");
  const [workflows, setWorkflows] = useState([]);
  const [error, setError] = useState(null);

  const [selectedApprovalRole, setSelectedApprovalRole] = useState("");
  const filteredCategories = categories.filter((category) =>
    category.categoriesname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [isTempModalOpen, setIsTempModalOpen] = useState(false);
  const modalRef = useRef(null);
  const [categoryFields, setCategoryFields] = useState([]);
  const [updatedOn, setUpdatedOn] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [isCategoryEditable, setIsCategoryEditable] = useState(false);

  const [users, setUsers] = useState({});
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // To manage modal visibility
  const [isModalsOpen, setIsModalsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // Store the message to show in the modal
  const [modalType, setModalType] = useState("success");
  const [isOpen, setIsOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalMessage, setApprovalModalMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRoleType, setSelectedRoleType] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  // Sort latest first
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const totalPages = Math.ceil(sortedCategories.length / rowsPerPage);

  const paginatedData = sortedCategories.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsOpen(true);
  };
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
    fetchCategoryFields();
  }, [updatedOn]);
  useEffect(() => {
    if (isEditCategoryModalOpen && categories) {
      const token = sessionStorage.getItem("token"); // get token

      axios
        .get(`${MAIN_BASE}role`, {
          headers: {
            Authorization: `Bearer ${token}`, // add token here
          },
        })
        .then((response) => {
          if (response && response.data) {
            setRoles(response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching roles:", error);
        });
    }
  }, [isEditCategoryModalOpen, categories]);

  useEffect(() => {
    const fetchWorkflows = async () => {
      const token = sessionStorage.getItem("token"); // get token
      try {
        const response = await axios.get(`${JAVA_BASE}workflow/get`, {
          headers: {
            Authorization: `Bearer ${token}`, // add token here
          },
        });
        if (response && response.data) {
          setWorkflows(response.data); // Assuming workflows are returned in response.data
        }
      } catch (error) {
        console.error("Error fetching workflows:", error);
      }
    };

    fetchWorkflows();
  }, []); // Empty dependency array means this effect runs once on component mount

  const fetchCategories = async () => {
    const token = sessionStorage.getItem("token"); // get token
    try {
      const response = await axios.get(`${JAVA_BASE}api/categories/all`, {
        headers: {
          Authorization: `Bearer ${token}`, // add token here
        },
      });
      console.log("API response:", response.data); // Check structure of the response
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]); // Ensures `categories` is an array even if fetch fails
    }
  };

  const fetchCategoryFields = async () => {
    const token = sessionStorage.getItem("token"); // get token
    try {
      const response = await axios.get(`${JAVA_BASE}api/assets/fetch`, {
        headers: {
          Authorization: `Bearer ${token}`, // add token here
        },
      });
      console.log("response", response.data);
      setExistingFields(response.data);
    } catch (error) {
      console.error("Error fetching categories fields:", error);
    }
  };


  const closedModal = () => {
    setSelectedCategory(null);
    setSelectedRoleType(null);
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData({ ...categoryData, [name]: value });
  };

  // Handle changes for existing fields
  const handleExistingFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedFields = [...existingFields];
    updatedFields[index][name] = type === "checkbox" ? checked : value;
    setExistingFields(updatedFields);
  };

  // Handle changes for new fields
  const handleNewFieldChange = (index, e) => {
    const { name, value, type, checked } = e.target;
    const updatedFields = [...newFields];
    updatedFields[index][name] = type === "checkbox" ? checked : value;
    setNewFields(updatedFields);
  };

  const addField = () => {
    const newField = {
      fieldname: "",
      assetDataType: "String",
      isUnique: false,
      isNullable: false,
    };

    setNewFields([...newFields, newField]);
  };

  const removeField = (index) => {
    setNewFields(newFields.filter((_, i) => i !== index));
  };
  const removeExistingField = async (id) => {
    const token = sessionStorage.getItem("token"); // get token

    try {
      await axios.delete(`${JAVA_BASE}api/assets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // add token here
        },
      });

      window.location.reload();
      setUpdatedOn((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (categoryData.workflowname === "Select Workflow") {
      setModalMessage("Please select a workflow.");
      setModalType("error");
      setIsModalOpen(true);
      return;
    }

    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      setModalMessage("User ID is not available.");
      setModalType("error");
      setIsModalOpen(true);
      return;
    }
    try {
      const newCategory = {
        categoriesname: categoryData.categoryName,
        createdBy: Number(userId),
        categoriesType: "Movable",
        workflowname: categoryData.workflowname,
        status: "Draft",
        stages: categoryData.stages || "Preview",
      };
      console.log("Submitting category: ", newCategory);

      const response = await axios.post(
        `${JAVA_BASE}api/categories/add`,
        newCategory
      );
      console.log(response);
      setCategoryId(response.data.categoryId);
      setUpdatedOn(new Date());
      setCategories(
        Array.isArray(response.data.categories) ? response.data.categories : []
      );

      resetForm();
      setModalMessage("Asset Category added successfully!");
      setModalType("success");
      setIsModalOpen(true);
    } catch (error) {
      setModalMessage("Error adding category. Please try again.");
      setModalType("error");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    // Check if a valid workflow is selected

    if (categoryData.workflowname === "Select Workflow") {
      setModalMessage("Please select a workflow.");
      setModalType("error");
      setIsModalOpen(true);
      return;
    }

    try {
      const newCategory = {
        categoriesname: categoryData.categoryName, // Category name
        createdBy: Number(userId), // Creator user_id
        categoriesType: "Movable", // Category type (description)
        workflowname: categoryData.workflowname, // Workflow name
        approvalrole: categoryData.approvalrole,
        assetApprovalRole: selectedRole,
        status: categoryData.status,
        assetAdditionRole: selectedRoles,
        stages: categoryData.stages,
      };
      console.log("Updating category: ", newCategory); // Debug log to check data

      const response = await axios.put(
        `${JAVA_BASE}api/categories/id/${categoryData.categoryId}`,
        newCategory
      );
      setUpdatedOn(new Date()); // Trigger re-fetch or update of categories
      setCategories(
        Array.isArray(response.data.categories) ? response.data.categories : []
      );

      resetForm(); // Reset the form after successful submission

      setModalMessage("Category updated successfully!");
      setModalType("success"); // Success message
      setIsModalOpen(true); // Open success modal
      setIsCategoryEditable(false);
    } catch (error) {
      setModalMessage("Error adding category. Please try again.");
      setModalType("error"); // Error message
    }
  };


  const resetForm = () => {
    setCategoryData({
      categoriesname: "",
      categoryType: "Movable",
      workflowname: "Select Workflow ",
      approvalrole: [],
      assetApprovalRole: [],
      assetAdditionRole: [],
      createdBy: "userId",
      status: "Draft",
      publish: "FormDesign",
    });
    setNewFields([
      {
        fieldname: "",
        assetDataType: "String",
        isUnique: false,
        isNullable: false,
      },
    ]);
    setSelectedWorkflow("");
  };
  const cancelDelete = () => {
    setIsDeleteModalOpen(false); // Close the modal without deleting
    setAssetToDelete(null); // Clear the asset to delete
  };

  const handleDelete = (id) => {
    setAssetToDelete(id); // Set the category id to be deleted
    setIsDeleteModalOpen(true); // Open the modal
  };

  const confirmDelete = async () => {
    try {
      if (assetToDelete) {
        await axios.delete(
          `${JAVA_BASE}api/categories/id/${assetToDelete}`
        );
        setCategories(
          categories.filter((category) => category.id !== assetToDelete)
        ); // Update the categories list
        setUpdatedOn((prev) => prev + 1); // Trigger a re-render or refresh if needed
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleteModalOpen(false); // Close the modal after the operation
      setAssetToDelete(null); // Clear the asset to delete
    }
  };

  const handleTemporarySave = async (category) => {
    try {
      // Construct the temporary data in the correct format
      const temporaryData = {
        categoryName: selectedCategoryName, // Assuming this is already set correctly
        assets: newFields.map((field) => ({
          fieldname: field.fieldname,
          assetDataType: field.assetDataType,
          isNullable: field.isNullable,
          isUnique: field.isUnique,
          // role: field.role || [selectedRole], // Assign roles from the field or selectedRole if not present
        })),
      };

      console.log("Temporary Save Data:", temporaryData); // Log the data being sent

      const response = await axios.post(
        `${JAVA_BASE}api/assets/insert`,
        temporaryData
      );

      console.log("Response from Temporary Save:", response.data); // Log response for confirmation
      setIsTempModalOpen(true);
      console.log("Category temporarily saved:", temporaryData);
    } catch (error) {
      if (error.response) {
        console.error("Error response from server:", error.response.data);
      } else if (error.request) {
        console.error("No response received from server:", error.request);
      } else {
        console.error("Error in setting up request:", error.message);
      }
    }
  };

  // const handleApproval = async () => {
  //   try {
  //     // Construct the temporary data object in the correct format
  //     const temporaryData = {
  //       categoryName: selectedCategoryName, // Ensure this is set correctly
  //       assets: newFields.map((field) => ({
  //         fieldname: field.fieldname,
  //         assetDataType: field.assetDataType,
  //         isNullable: field.isNullable,
  //         isUnique: field.isUnique,
  //       })),
  //     };

  //     console.log("Preparing to send temporary data:", temporaryData);

  //     // Send a POST request to save the temporary data
  //     const saveResponse = await axios.post(
  //       "https://saaspro.softtrails.net/saas/java/pro/api/assets/insert",
  //       temporaryData
  //     );

  //     console.log("Temporary save successful. Response:", saveResponse.data);

  //     // Update the category's stage to 'SubmittedForApproval' via API
  //     const stageUpdateResponse = await axios.put(
  //       `https://saaspro.softtrails.net/saas/asset/pro/assets/stages/${editCategoryId}`,
  //       { value: "SubmittedForApproval" }
  //     );

  //     console.log(
  //       "Stage update to 'SubmittedForApproval' successful. Response:",
  //       stageUpdateResponse.data
  //     );

  //     // Update the local state to reflect the new stage
  //     setCategories((prevCategories) =>
  //       prevCategories.map((category) =>
  //         category.id === editCategoryId
  //           ? { ...category, stage: "SubmittedForApproval" }
  //           : category
  //       )
  //     );

  //     // Update the modification timestamp
  //     setUpdatedOn(new Date());

  //     console.log("Category stage updated to 'SubmittedForApproval'.");
  //   } catch (error) {
  //     // Enhanced error handling
  //     if (error.response) {
  //       console.error(
  //         "Server responded with an error:",
  //         error.response.status,
  //         error.response.data
  //       );
  //     } else if (error.request) {
  //       console.error(
  //         "No response received from server. Request details:",
  //         error.request
  //       );
  //     } else {
  //       console.error(
  //         "An error occurred during the request setup:",
  //         error.message
  //       );
  //     }
  //   }
  // };

  const handleApproval = async () => {
    try {
      const temporaryData = {
        categoryName: selectedCategoryName,
        assets: newFields.map((field) => ({
          fieldname: field.fieldname,
          assetDataType: field.assetDataType,
          isNullable: field.isNullable,
          isUnique: field.isUnique,
        })),
      };

      console.log("Preparing to send temporary data:", temporaryData);

      // Send a POST request to save the temporary data
      const saveResponse = await axios.post(
        `${JAVA_BASE}api/assets/insert`,
        temporaryData
      );

      console.log("Temporary save successful. Response:", saveResponse.data);

      // Update the category's stage to 'SubmittedForApproval' via API
      const stageUpdateResponse = await axios.put(
        `${ASSET_NODE_BASE}assets/stages/${editCategoryId}`,
        { value: "SubmittedForApproval" }
      );

      console.log(
        "Stage update to 'SubmittedForApproval' successful. Response:",
        stageUpdateResponse.data
      );

      // Update the local state to reflect the new stage
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === editCategoryId
            ? { ...category, stage: "SubmittedForApproval" }
            : category
        )
      );

      setUpdatedOn(new Date());

      // Show success modal for approval
      setApprovalModalMessage(
        "Asset Category successfully submitted for approval!"
      );
      setIsApprovalModalOpen(true);

      // Close other modals
      setIsCategoryEditable(false);
    } catch (error) {
      let errorMessage = "An error occurred. Please try again.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        errorMessage =
          "No response from the server. Please check your network.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      console.error("Error:", errorMessage);

      // Show error modal for approval
      setApprovalModalMessage(errorMessage);
      setIsApprovalModalOpen(true);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedCategory = {
        categoriesname: selectedCategoryName,
        fields: newFields.reduce((acc, field) => {
          acc[field.fieldname] =
            field.assetDataType +
            (field.isUnique ? ", UNIQUE" : "") +
            (field.isNullable ? ", NULL" : "");
          return acc;
        }, {}),
      };

      console.log("Updated Category Data:", updatedCategory); // Log data being submitted

      const response = await axios.post(
        `${JAVA_BASE}api/temp/save`,
        updatedCategory
      );

      console.log("Response from Save:", response.data); // Log response from server
      closeModal();
      fetchCategories();
    } catch (error) {
      if (error.response) {
        console.error("Error response from server:", error.response.data);
      } else if (error.request) {
        console.error("No response received from server:", error.request);
      } else {
        console.error("Error in setting up request:", error.message);
      }
    }
  };
  console.log({ existingFields, newFields });

  const handlePublish = async () => {
    console.log("handle publish");
    try {
      // Construct the publish data
      // console.log(newFields)

      let updatedFieldsData = newFields.reduce((acc, field) => {
        acc[field.fieldname] = `${field.assetDataType}${field.isNullable ? ",NULL" : ",NOT NULL"
          }`;
        return acc;
      }, {});

      for (let data of existingFields) {
        updatedFieldsData[data.fieldname] = `${data.assetDataType}${data.isNullable ? ",NULL" : ",NOT NULL"
          }`;
      }

      // updatedFieldsData["roles"] = [selectedRole];

      const publishData = {
        categoryName: selectedCategoryName,
        // role:[selectedRole],
        fields: updatedFieldsData,
      };

      console.log("Publishing Data:", publishData); // Log the data being sent

      const response = await axios.post(
        `${JAVA_BASE}api/tables/publish`,
        publishData
      );

      console.log("Response from Publish:", response.data); // Log response for confirmation
      closeModal();
      fetchCategories(); // Fetch categories again to refresh the list
      alert("Asset Category published successfully!");
    } catch (error) {
      console.log({
        error,
      });
      if (error.response) {
        console.error("Error response from server:", error.response.data);
      } else if (error.request) {
        console.error("No response received from server:", error.request);
      } else {
        console.error("Error in setting up request:", error.message);
      }
      alert("Failed to publish the Asset category. Please try again.");
    }
  };

  const openEditModal = (category) => {
    setSelectedCategoryName(category.categoriesname);
    setEditCategoryId(category.categoryId);
    setIsEditCategoryModalOpen(true);

    const filterCategoryFields = existingFields.filter((c) => {
      return c.categoryName === category.categoriesname;
    });

    setExistingFields(
      filterCategoryFields.length
        ? filterCategoryFields.map((c) => ({
          id: c.id,
          fieldname: c.fieldname,
          assetDataType: c.assetDataType,
          isUnique: c.isUnique,
          isNullable: c.isNullable,
        }))
        : []
    );

    setNewFields(
      !filterCategoryFields.length
        ? [
          {
            fieldname: "Asset Name",
            assetDataType: "String",
            isUnique: false,
            isNullable: false,
          },
          {
            fieldname: "Purchase Date",
            assetDataType: "Date",
            isUnique: false,
            isNullable: false,
          },
          {
            fieldname: "Original Cost",
            assetDataType: "Number",
            isUnique: false,
            isNullable: false,
          },
          {
            fieldname: "Scrap Value",
            assetDataType: "Number",
            isUnique: false,
            isNullable: false,
          },
          {
            fieldname: "Useful Life",
            assetDataType: "Number",
            isUnique: false,
            isNullable: false,
          },
        ]
        : [
          {
            fieldname: "",
            assetDataType: "String",
            isUnique: false,
            isNullable: false,
          },
        ]
    ); // Reset new fields
  };

  const closeModal = () => {
    setIsEditCategoryModalOpen(false);
    setNewFields([
      {
        fieldname: "",
        assetDataType: "String",
        isUnique: false,
        isNullable: false,
      },
    ]);
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      closeModal();
    }
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(date);
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
  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
  };

  const handleHome = () => {
    navigate("/Cards");
  };
  //END
  const handleViewRoles = async (category, roleType) => {
    try {
      // Log selected category and role type
      console.log("Selected Category:", category);
      console.log("Selected Role Type:", roleType);

      // Fetch roles from API
      const response = await fetch(
        `${JAVA_BASE}api/roles/category/${category.categoryId}`
      );
      const roles = await response.json();

      // Update selected category with roles
      setSelectedCategory({ ...category, roles });
      setSelectedRoleType(roleType);
      setIsModalsOpen(true);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  const renderRoles = (roles, action) => {
    return roles
      ? roles
        .filter((item) => item.action === action)
        .map((item) => item.groups)
        .join(", ") || "No roles assigned"
      : "No roles found";
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex">
        <RolesAddModal
          categoryId={categoryId}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          roles={roles}
        />
        <div className="w-full">
          <div>
            {/* Search Bar */}
            <div className="flex justify-end mb-4">
              <div className="flex items-end gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search"
                  className="w-[250px] p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

              </div>
            </div>

            <div className="relative w-full  overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
                <table className="min-w-full table-auto border-collapse ">
                  <thead
                    className="text-[16px] font-medium bg-white sticky top-0  "
                    style={{ boxShadow: "0 2px 0 black" }}
                  >
                    <tr>
                      <th className="p-5 text-center ">
                        S.No
                      </th>
                      <th className="p-5 text-center ">
                        Asset Category
                      </th>
                      <th className="p-5 text-center ">
                        Asset Category Type
                      </th>
                      <th className="p-5 text-center ">
                        Created On
                      </th>
                      <th className="p-5 text-center ">
                        Approval Workflow
                      </th>
                      <th className="p-5 text-center ">
                        Status
                      </th>
                      <th className="p-5 text-center ">
                        Stage
                      </th>
                      <th className="p-5 text-center ">
                        Created By
                      </th>
                      {/* <th className="p-5 text-center ">Action</th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length > 0 && paginatedData.length > 0 ? (
                      paginatedData.map((category, index) => (
                        <tr
                          key={category.categoryId}
                          className={`${index % 2 === 0 ? "bg-blue-50" : "bg-white"
                            } transition-colors duration-300 hover:bg-gray-100`}
                        >
                          <td className="px-5 py-3 text-center ">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </td>
                          <td className="px-5 py-3 text-center ">
                            {category.categoriesname}
                          </td>
                          <td className="px-5 py-3 text-center ">
                            {category.categoriesType?.replace(
                              /([a-z])([A-Z])/g,
                              "$1 $2"
                            )}
                          </td>
                          <td className="px-5 py-3 text-center ">
                            {category?.createdAt
                              ? formatDate(category?.createdAt)
                              : ""}
                          </td>
                          <td className="px-5 py-3 text-center ">
                            {category.workflowname}
                          </td>
                          <td className="px-5 py-3 text-center ">
                            {category.status}
                          </td>
                          <td className="px-5 py-3 text-center ">
                            {(() => {
                              if (category.status === "Active") {
                                return (
                                  <span className="text-green-500">
                                    Approved
                                  </span>
                                );
                              } else if (category.status === "Inactive") {
                                return (
                                  <span className="text-gray-500">Hidden</span>
                                );
                              } else if (category.status === "Draft") {
                                switch (category.stages) {
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
                                        {category?.stages.replace(
                                          /([a-z])([A-Z])/g,
                                          "$1 $2"
                                        )}
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
                          <td className="px-5 py-3 text-center ">
                            {category.createdByFullName || "Unknown User"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="10"
                          className="py-6 px-4 text-center text-gray-500"
                        >
                          No categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
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
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modal */}
          {isModalsOpen && selectedCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-6 rounded shadow-lg w-full max-w-md mx-4">
                <h2 className="text-xl font-bold mb-4 text-center">
                  {selectedRoleType === "CategoryApproval" && " Category"}
                  {selectedRoleType === "AssetApproval" && " Asset Approval"}
                  {selectedRoleType === "AssetAddition" && " Asset Addition"}
                  {selectedRoleType === "MappingApprove" && " Mapping Approval"}
                  {selectedRoleType === "DiscardApprove" && " Discard Approval"}
                  {selectedRoleType === "RepairApprove" && " Repair Approval"}
                  {selectedRoleType === "DamageApprove" && " Damage Approval"}
                  {selectedRoleType === "MappingRequest" && " Mapping Request"}
                  {selectedRoleType === "DiscardRequest" && " Discard Request"}
                  {selectedRoleType === "RepairRequest" && " Repair Request"}
                  {selectedRoleType === "DamageRequest" &&
                    " Damage Request"}{" "}
                  For {selectedCategory.categoriesname}
                </h2>
                <div className="max-h-96 overflow-y-auto">
                  {selectedCategory.roles &&
                    selectedCategory.roles.length > 0 ? (
                    <ol className="list-decimal pl-5">
                      {selectedCategory.roles
                        .filter((item) => item.action === selectedRoleType)
                        .map((item, index) => (
                          <li key={index} className="py-1">
                            {item.groups ? (
                              item.groups
                            ) : (
                              <span className="text-gray-500">
                                No groups assigned
                              </span>
                            )}
                          </li>
                        ))}
                    </ol>
                  ) : (
                    <p className="text-gray-500">
                      No roles assigned for this category.
                    </p>
                  )}
                </div>
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded mt-4 block mx-auto"
                  onClick={closedModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {isCategoryEditable && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50">
              <div className="bg-white rounded-lg shadow-lg w-10/12 sm:w-3/4 md:w-1/2 lg:w-1/3 p-4 sm:p-6 overflow-y-auto scale-90 sm:scale-100 animate-fadeIn max-h-[90vh]">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 text-center mb-4">
                  Edit Asset Category
                </h2>

                <form className="space-y-4">
                  {/* Category Name */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-[#555252] font-semibold">
                      Asset Category Name
                    </label>
                    <input
                      type="text"
                      name="categoryName"
                      value={categoryData.categoryName}
                      onChange={handleInputChange}
                      className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#F9F9F9] text-gray-700 placeholder-gray-500 transition-all duration-300"
                      placeholder="Enter Category Name"
                      required
                      disabled
                    />
                  </div>

                  {/* Category Type */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-[#555252] font-semibold">
                      Asset Category Type
                    </label>
                    <input
                      type="text"
                      name="categoryType"
                      value="Movable"
                      readOnly
                      className="p-2 sm:p-3 border rounded-lg focus:outline-none bg-[#F9F9F9] text-gray-700 placeholder-gray-500 transition-all duration-300"
                    />
                  </div>

                  {/* Workflow Dropdown */}
                  <div className="flex flex-col gap-2">
                    <label className="text-sm text-[#555252] font-semibold">
                      Approval Workflow
                    </label>
                    <select
                      name="workflowname"
                      value={categoryData.workflowname}
                      onChange={handleInputChange}
                      className="p-2 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#F9F9F9] text-gray-700 placeholder-gray-500 transition-all duration-300"
                      required
                    >
                      <option value="">Select Approval Workflow</option>
                      {workflows.map((workflow) => (
                        <option key={workflow.id} value={workflow.workflowname}>
                          {workflow.workflowname}
                        </option>
                      ))}
                    </select>
                  </div>
                </form>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 sm:gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsCategoryEditable(false)}
                    className="bg-green-600 hover:bg-green-700 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-md shadow-md transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-md shadow-md transition-all duration-300"
                  >
                    update
                  </button>
                </div>
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

          {/* Edit Category Modal */}
          {isEditCategoryModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div
                ref={modalRef}
                className="bg-white rounded-lg p-6 shadow-lg w-11/12 md:w-3/4 lg:w-1/3 xl:w-1/2"
              >
                <h2 className="text-lg font-bold mb-4">Create Form</h2>
                <form
                  onSubmit={handleEditSubmit}
                  className="flex flex-col gap-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2 w-[35%]">
                      <label className="text-[#555252] font-semibold">Asset Category</label>
                      <input
                        type="text"
                        value={selectedCategoryName}
                        onChange={(e) =>
                          setSelectedCategoryName(e.target.value)
                        }
                        className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled
                        required
                      />
                    </div>
                  </div>

                  {/* Scrollable Field Section */}
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto border p-4 rounded-lg ">
                    <label className="text-[#555252] font-semibold">Form Fields</label>
                    {console.log({ existingFields })}
                    {existingFields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 flex-wrap"
                      >
                        <input
                          type="text"
                          name="fieldname"
                          value={field.fieldname}
                          onChange={(e) => handleExistingFieldChange(index, e)}
                          placeholder="Field Name"
                          className="p-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          name="assetDataType"
                          value={field.assetDataType}
                          onChange={(e) => handleExistingFieldChange(index, e)}
                          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="String">String</option>
                          <option value="Integer">Integer</option>
                          <option value="Number">Number </option>
                          <option value="Boolean">Boolean</option>

                          <option value="Date">Date</option>
                          <option value="file">File</option>
                        </select>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isNullable"
                            checked={field.isNullable}
                            onChange={(e) =>
                              handleExistingFieldChange(index, e)
                            }
                          />{" "}
                          Not Null
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isUnique"
                            checked={field.isUnique}
                            onChange={(e) =>
                              handleExistingFieldChange(index, e)
                            }
                          />{" "}
                          Unique
                        </label>
                        {![
                          "Asset Name",
                          "Purchase Date",
                          "Original Cost",
                          "Scrap Value",
                          "Useful Life",
                        ].includes(field.fieldname) && (
                            <button
                              type="button"
                              onClick={() => removeExistingField(field.id)}
                              className="text-red-500 hover:underline"
                            >
                              <FaTrash />
                            </button>
                          )}
                      </div>
                    ))}
                    {newFields.map((field, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 flex-wrap"
                      >
                        <input
                          type="text"
                          required
                          name="fieldname"
                          value={field.fieldname}
                          onChange={(e) => handleNewFieldChange(index, e)}
                          placeholder="Field Name"
                          className="p-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          name="assetDataType"
                          value={field.assetDataType}
                          onChange={(e) => handleNewFieldChange(index, e)}
                          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="String">String</option>
                          <option value="Integer">Integer</option>
                          <option value="Number">Number </option>
                          <option value="Boolean">Boolean</option>

                          <option value="Date">Date</option>
                          <option value="file">File</option>
                        </select>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isNullable"
                            checked={field.isNullable}
                            onChange={(e) => handleNewFieldChange(index, e)}
                          />{" "}
                          Not Null
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isUnique"
                            checked={field.isUnique}
                            onChange={(e) => handleNewFieldChange(index, e)}
                          />{" "}
                          Unique
                        </label>
                        {![].includes(field.fieldname) && (
                          <button
                            type="button"
                            onClick={() => removeField(index)}
                            className="text-red-500 hover:underline"
                          >
                            <FaTrash />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="my-4 flex justify-between flex-wrap">
                    <button
                      type="button"
                      onClick={addField}
                      className="rounded-full bg-red-600 text-white py-2 px-8 hover:bg-red-700"
                    >
                      Add Field
                    </button>

                    <button
                      type="button"
                      onClick={handleTemporarySave}
                      className="rounded-full bg-blue-600 text-white py-2 px-4 hover:bg-blue-700"
                    >
                      Save As Draft
                    </button>

                    {/* <button
                      type="button"
                      onClick={handlePublish}
                      className="ml-3 rounded-full bg-green-600 text-white py-2 px-4 hover:bg-green-700"
                    >
                      Publish
                    </button> */}
                    <button
                      type="button"
                      onClick={handleApproval}
                      className="ml-3 rounded-full bg-green-600 text-white py-2 px-4 hover:bg-green-700"
                    >
                      Submit for Approval
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {isApprovalModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
              <div className="w-80 h-80 bg-white p-6 rounded-2xl shadow-lg text-center flex flex-col justify-between">
                {/* Modal Icon */}
                <div className="modal-icon mt-4">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center bg-blue-600 rounded-full">
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

                {/* Modal Header */}
                <h2 className="font-inter text-2xl font-bold text-blue-600 mt-4">
                  Approval Status
                </h2>

                {/* Modal Body */}
                <p className="text-black text-[16px] mb-3">
                  {approvalModalMessage ||
                    "Approval process completed successfully!"}
                </p>

                {/* Modal Footer */}
                <button
                  className="bg-blue-600 text-white px-3 font-medium text-lg py-2 rounded-md hover:bg-blue-700 transition duration-300"
                  onClick={handleCloseApprovalModal}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Custom Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
              <div className="w-80 h-80 bg-white p-6 rounded-2xl shadow-lg text-center flex flex-col justify-between">
                {/* Modal Icon */}
                <div className="modal-icon mt-4">
                  <div className="w-16 h-16 mx-auto flex items-center justify-center bg-blue-600 rounded-full">
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

                {/* Modal Header */}
                <h2 className=" font-inter text-2xl font-bold text-blue-600 mt-4">
                  Success
                </h2>

                {/* Modal Body */}
                <p className="text-black text-[16px] mb-3">
                  {modalMessage || "Category added successfully!"}
                </p>

                {/* Modal Footer */}
                <button
                  className="bg-blue-600 text-white px-3 font-medium text-lg py-2 rounded-md hover:bg-blue-700 transition duration-300"
                  onClick={handleCloseModal}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Temporary Save Modal */}
          {isTempModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg">
                <h2 className="text-lg font-bold mb-4">
                  Category Temporarily Saved!
                </h2>
                <button
                  onClick={() => {
                    setIsTempModalOpen(false);
                    fetchCategoryFields();
                  }}
                  className="rounded-full bg-blue-600 text-white py-2 px-4 hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Category;
