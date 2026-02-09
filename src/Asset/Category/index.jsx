import React, { useState, useEffect, useMemo, useRef } from "react";
import Select from "react-select";
import {
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaHistory,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import RolesAddModal from "./RolesAddModal";
import MessageModal from "../ApprovalAuthority/MessageModal";
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
import { JAVA_BASE, ASSET_NODE_BASE, MAIN_BASE, WORKFLOW_BASE } from "../../config/apiBase";
import LoaderModal from "../Components/Loader";

const DEFAULT_PREDEFINED_FIELDS = [
  { fieldname: "Asset Name", assetDataType: "String", isNullable: false, isUnique: false },
  { fieldname: "Purchase Date", assetDataType: "Date", isNullable: false, isUnique: false },
  { fieldname: "Original Cost", assetDataType: "Number", isNullable: false, isUnique: false },
  { fieldname: "Scrap Value", assetDataType: "Number", isNullable: false, isUnique: false },
  { fieldname: "Useful Life", assetDataType: "Number", isNullable: false, isUnique: false },
  { fieldname: "Unit Of Measure", assetDataType: "String", isNullable: false, isUnique: false },
];

const cleanFields = (fields) => {
  return fields
    .map((f) => ({
      ...f,
      fieldname: f.fieldname?.trim() || null,
      assetDataType: f.assetDataType?.trim() || null,
    }))
    .filter((f) => f.fieldname !== null && f.assetDataType !== null);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};



const Category = () => {
  const [categoryData, setCategoryData] = useState({
    categoryName: "",
    categoryType: "Movable",
    workflowname: "Select Workflow",
    approvalrole: "Approvers Role",
    createdBy: "userId ",
    role: "Select Role",
    AssetRole: "Select Role",
    status: "Draft",
    stages: "Preview",
  });
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
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
  const [workflows, setWorkflows] = useState([]);
  const [selectedApprovalRole, setSelectedApprovalRole] = useState("");

  const filteredCategories = useMemo(() => categories.filter((category) =>
    category.categoriesname?.toLowerCase().includes(searchTerm.toLowerCase())
  ), [categories, searchTerm]);

  const [selectedCategoryName, setSelectedCategoryName] = useState("");
  const [isTempModalOpen, setIsTempModalOpen] = useState(false);
  const modalRef = useRef(null);
  const [updatedOn, setUpdatedOn] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [isCategoryEditable, setIsCategoryEditable] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false); // To manage modal visibility
  const [modalMessage, setModalMessage] = useState(""); // Store the message to show in the modal
  const [modalType, setModalType] = useState("success");
  const [isOpen, setIsOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalMessage, setApprovalModalMessage] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [isAssestEdit, setIsAssetedit] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [resubmittedLogs, setResubmittedLogs] = useState([]);
  const [isResubmittedModalOpen, setIsResubmittedModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stagesFilter, setStagesFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loaderText, setLoaderText] = useState("Processing...");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const filteredMovable = useMemo(() => filteredCategories.filter(
    (category) => category.categoriesType === "Movable"
  ), [filteredCategories]);

  const sortedMovable = useMemo(() => [...filteredMovable].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  }), [filteredMovable]);

  const totalPages = useMemo(() => Math.ceil(filteredMovable.length / rowsPerPage), [filteredMovable.length, rowsPerPage]);

  const paginatedData = useMemo(() => sortedMovable.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  ), [sortedMovable, currentPage, rowsPerPage]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsOpen(true);
  };
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [updatedOn]);

  useEffect(() => {
    if (isResubmittedModalOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [isResubmittedModalOpen]);

  useEffect(() => {
    if (statusFilter || stagesFilter || startDate || endDate) {
      fetchFilteredCategories(statusFilter, stagesFilter, startDate, endDate);
    } else {
      fetchCategories(); // Fetch all categories if no filters are applied
    }
  }, [statusFilter, stagesFilter, startDate, endDate]); // Re-fetch when any filter changes

  useEffect(() => {
    if ((isEditCategoryModalOpen, categories)) {
      const token = sessionStorage.getItem("token"); // get token

      axios
        .get(`${MAIN_BASE}role`, {
          headers: {
            Authorization: `Bearer ${token}`,
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
      const token = sessionStorage.getItem("token");

      try {
        const response = await axios.get(
          `${WORKFLOW_BASE}uniworkflow/workflow/get-modules/module`,
          {
            params: {
              module_name: "Asset Management",
              sub_module_name: "Movable",
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response && response.data && Array.isArray(response.data.workflows)) {
          setWorkflows(response.data.workflows);
        } else {
          console.warn("Unexpected response structure:", response.data);
          setWorkflows([]);
        }
      } catch (error) {
        console.error("Error fetching workflows:", error);
        setWorkflows([]);
      }
    };

    fetchWorkflows();
  }, []);

  const fetchCategories = async () => {
    const token = sessionStorage.getItem("token"); // get token
    try {
      const response = await axios.get(`${JAVA_BASE}api/categories/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("API response:", response.data);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const fetchFilteredCategories = async (
    status = "",
    stages = "",
    startDate = "",
    endDate = ""
  ) => {
    const token = sessionStorage.getItem("token");
    try {
      let url = `${JAVA_BASE}categories?`;
      if (status) url += `status=${status}&`;
      if (stages) url += `stages=${stages}&`;
      if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Filtered API response:", response.data);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching filtered categories:", error);
      setCategories([]);
    }
  };

  const fetchCategoryFields = async (categoryName) => {
    const token = sessionStorage.getItem("token");

    try {
      const response = await axios.get(
        `${JAVA_BASE}api/assets/find/${categoryName}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = response.data || [];

      if (data.length === 0) {

        setExistingFields(
          DEFAULT_PREDEFINED_FIELDS.map((f, i) => ({
            id: null,
            categoryName,
            ...f
          }))
        );
      } else {

        setExistingFields(data);
      }

    } catch (error) {
      console.error("Error fetching fields:", error);

      // Safety fallback → Default predefined fields
      setExistingFields(
        DEFAULT_PREDEFINED_FIELDS.map((f, i) => ({
          id: null,
          categoryName,
          ...f
        }))
      );
    }
  };





  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    setCategoryData({ ...categoryData, [name]: newValue });
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
    const token = sessionStorage.getItem("token");

    try {
      await axios.delete(`${JAVA_BASE}api/assets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove from state directly — NO REFRESH
      setExistingFields(prev => prev.filter(f => f.id !== id));

    } catch (error) {
      console.log("Error deleting field:", error);
    }
  };



  const resetForm = () => {
    setCategoryData({
      categoryName: "",
      categoryType: "Movable",
      workflowname: "",
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
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    categoryData.categoryName = categoryData.categoryName.trim();

    const invalidChars = /[^a-zA-Z0-9\s-]/;

    if (!categoryData.categoryName) {
      setModalMessage("Category name cannot be empty or only spaces.");
      setModalType("error");
      setIsModalOpen(true);
      return;
    }

    if (invalidChars.test(categoryData.categoryName)) {
      setModalMessage("Special characters are not allowed in category name.");
      setModalType("error");
      setIsModalOpen(true);
      return;
    }

    if (categoryData.workflowname === "Select Workflow") {
      setModalMessage("Please select a workflow.");
      setModalType("error");
      setIsModalOpen(true);
      return;
    }

    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId) {
      setModalMessage("User ID is not available.");
      setModalType("error");
      setIsModalOpen(true);
      return;
    }

    try {
      // 🔍 Check for duplicate category name (case-insensitive)
      const isDuplicate = categories.some(
        (cat) =>
          cat.categoriesname.toLowerCase().trim() ===
          categoryData.categoryName.toLowerCase().trim()
      );

      if (isDuplicate) {
        setModalMessage("This category name already exists. Please choose another.");
        setModalType("error");
        setIsModalOpen(true);
        return;
      }

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
        newCategory,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCategoryId(response.data.categoryId);
      setUpdatedOn(new Date());
      setCategories(
        Array.isArray(response.data.categories)
          ? response.data.categories
          : []
      );

      resetForm();
      setModalMessage("Asset Category added successfully!");
      setModalType("success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error adding category:", error);
      setModalMessage("Error adding category. Please try again.");
      setModalType("error");
      setIsModalOpen(true);
    }
  };




  const handleUpdate = async (e) => {
    e.preventDefault();

    if (categoryData.workflowname === "Select Workflow") {
      setMessage("Please select a workflow.");
      setMessageType("error");
      setIsMessageModalOpen(true);
      return;
    }

    const token = sessionStorage.getItem("token");

    try {
      const newCategory = {
        categoriesname: categoryData.categoryName,
        createdBy: Number(userId),
        categoriesType: "Movable",
        workflowname: categoryData.workflowname,
        status: categoryData.status,
        stages: categoryData.stages,
      };

      console.log("Updating category: ", newCategory);

      const response = await axios.put(
        `${JAVA_BASE}api/categories/id/${categoryData.categoryId}/user/${userId}`,
        newCategory,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setUpdatedOn(new Date());
      setCategories(
        Array.isArray(response.data.categories) ? response.data.categories : []
      );

      resetForm();

      setMessage("Category updated successfully!");
      setMessageType("success");
      setIsMessageModalOpen(true);
      setIsCategoryEditable(false);
    } catch (error) {
      console.error("Error updating category:", error);
      setMessage("Error updating category. Please try again.");
      setMessageType("error");
      setIsMessageModalOpen(true);
    }
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
    const token = sessionStorage.getItem("token");

    try {
      if (assetToDelete) {
        await axios.delete(
          `${JAVA_BASE}api/categories/id/${assetToDelete}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setCategories(
          categories.filter((category) => category.id !== assetToDelete)
        );
        setUpdatedOn((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    } finally {
      setIsDeleteModalOpen(false);
      setAssetToDelete(null);
    }
  };




  const handleTemporarySave = async () => {
    const token = sessionStorage.getItem("token");

    const payload = {
      categoryName: selectedCategoryName?.trim(),
      assets: [
        ...cleanFields(existingFields),
        ...cleanFields(newFields)
      ]
    };

    try {
      const response = await axios.post(
        `${JAVA_BASE}api/assets/insert/${selectedCategoryName}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage("Category Saved Temporarily!");
      setMessageType("success");
      closeModal();

    } catch (error) {
      console.error("TEMP SAVE ERROR:", error);
      setMessage("Something went wrong!");
      setMessageType("error");
    }
  };





  const handleApproval = async () => {
    const token = sessionStorage.getItem("token");

    const payload = {
      categoryName: selectedCategoryName?.trim(),
      assets: [
        ...cleanFields(existingFields),
        ...cleanFields(newFields)
      ]
    };

    try {
      const saveResponse = await axios.post(
        `${JAVA_BASE}api/assets/insert/${selectedCategoryName}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const stageResponse = await axios.put(
        `${ASSET_NODE_BASE}assets/stages/${editCategoryId}`,
        { value: "SubmittedForApproval" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      setCategories(prev =>
        prev.map(category =>
          category.categoryId === editCategoryId
            ? { ...category, stages: "SubmittedForApproval" }
            : category
        )
      );

      setMessage("Category Submitted For Approval!");
      setMessageType("success");
      closeModal();

    } catch (error) {
      console.error("APPROVAL ERROR:", error);
      setMessage("Something went wrong!");
      setMessageType("error");
    }
  };



  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

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

      console.log("Updated Category Data:", updatedCategory);

      const response = await axios.post(
        `${JAVA_BASE}api/temp/save`,
        updatedCategory,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response from Save:", response.data);
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





  const openEditModal = async (category) => {
    setSelectedCategoryName(category.categoriesname);
    setEditCategoryId(category.categoryId);
    setIsEditCategoryModalOpen(true);

    // Fetch correct fields for this category
    await fetchCategoryFields(category.categoriesname);


    setNewFields([
      {
        fieldname: "",
        assetDataType: "String",
        isUnique: false,
        isNullable: false,
      }
    ]);
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
  const workflowOptions = useMemo(() => [
    { value: "", label: "Select Workflow" },
    ...workflows.map((workflow) => ({
      value: workflow.workflow_name,
      label: workflow.workflow_name,
    })),
  ], [workflows]);







  const userId = sessionStorage.getItem("userId");
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  console.log("Retrieved token:", token);



  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
  };


  const handleResubmittedClick = async (categoryId) => {
    try {
      const response = await axios.get(`${ASSET_NODE_BASE}AMSlog`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const logs = response.data.filter(
        (log) => log.category_id === categoryId && log.stages === "Resubmitted"
      );

      setResubmittedLogs(logs);
      setIsResubmittedModalOpen(true);
    } catch (error) {
      console.error("Error fetching resubmitted logs:", error);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex">
        <RolesAddModal
          categoryId={categoryId}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          roles={roles}
          edit={isAssestEdit}
          refreshData={fetchCategories}
        />
        <div className="w-full">
          <div className=" p-2 ">
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-5 mb-6">
              {/* Asset Category Name */}
              <div className="flex flex-col gap-1 w-full md:w-[200px]">
                <label className="text-[#555252] font-semibold">Asset Category Name</label>
                <input
                  type="text"
                  name="categoryName"
                  value={categoryData.categoryName}
                  onChange={handleInputChange}
                  className="p-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {/[^\w\s-]/.test(categoryData.categoryName) && (
                  <span className="text-red-500 text-sm">
                    Only letters, numbers, and hyphens are allowed.
                  </span>
                )}
              </div>

              {/* Asset Category Type */}
              <div className="flex flex-col gap-1 w-full md:w-[200px]">
                <label className="text-[#555252] font-semibold">Asset Category Type</label>
                <input
                  type="text"
                  name="categoryType"
                  value="Movable"
                  readOnly
                  className="p-2 w-full border rounded-md focus:outline-none bg-[#F0F0F0] text-gray-700"
                />
              </div>

              {/* Workflow Dropdown */}
              <div className="flex flex-col gap-1 w-full md:w-[250px]">
                <label className="text-[#555252] font-semibold">Approval Workflow</label>
                <Select
                  options={workflowOptions}
                  value={
                    categoryData.workflowname
                      ? workflowOptions.find(
                        (option) => option.value === categoryData.workflowname
                      )
                      : null
                  }
                  onChange={(selectedOption) =>
                    handleInputChange({
                      target: {
                        name: "workflowname",
                        value: selectedOption?.value || "",
                      },
                    })
                  }
                  className="react-select-container"
                  classNamePrefix="react-select"
                  placeholder="Select Approval Workflow"
                  isSearchable
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: '0.375rem', // md rounded
                      minHeight: '38px',
                      boxShadow: 'none',
                      borderColor: '#d1d5db',
                      '&:hover': { borderColor: '#3b82f6' },
                    }),
                  }}
                />
              </div>

              {/* Submit Button - right next to workflow */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
                >
                  Submit
                </button>
              </div>

              {/* Search Input at the end */}
              <div className="relative ml-auto">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-3 py-2 border rounded-md w-[230px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
            </form>

            {/* Filter Section */}
            {isFiltersVisible && (
              <div className="bg-white-50 p-2 rounded-lg mb-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-[#555252] font-semibold">Status</label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Status</option>
                      <option value="Draft">Draft</option>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  {/* Stages Filter */}
                  <div>
                    <label className="block text-[#555252] font-semibold">Stages</label>
                    <select
                      value={stagesFilter}
                      onChange={(e) => setStagesFilter(e.target.value)}
                      className="p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Stage</option>
                      <option value="Approved">Approved</option>
                      <option value="Hidden">Hidden</option>
                      <option value="FormDesign">Form Design</option>
                      <option value="Resubmitted">Resubmitted</option>
                      <option value="SubmittedForApproval">
                        Submitted For Approval
                      </option>
                    </select>
                  </div>

                  {/* Date Filter */}
                  <div>
                    <label className="block text-[#555252] font-semibold">Date Range</label>
                    <div className="flex gap-4">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="p-3 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
                <table className="min-w-full table-auto border-collapse ">
                  <thead
                    className="text-[16px] font-medium bg-white sticky top-0 "
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
                      <th className="p-5 text-center ">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.length > 0 && paginatedData.length > 0 ? (
                      paginatedData.map((category, index) => (
                        <tr
                          key={category.categoryId}
                          className={`${index % 2 === 0 ? "bg-blue-50" : "bg-white"
                            }`}
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
                          <td className="px-5 py-3 flex space-x-3 justify-center text-gray-700">
                            {category.status === "Draft" &&
                              category.stages !== "SubmittedForApproval" &&
                              category.stages !== "Preview" && (
                                <button
                                  onClick={() => openEditModal(category)}
                                  className="text-blue-500 hover:underline flex items-center text-md"
                                >
                                  <FaSave className="mr-1" />
                                </button>
                              )}

                            <button
                              onClick={() => {
                                setIsOpen(true);
                                setIsAssetedit(true);
                                setCategoryId(category.categoryId);
                              }}
                            >
                              <FaEdit color="green" />

                            </button>
                            {category.stages !== "Approved" && (
                              <button
                                onClick={() => handleDelete(category.categoryId)}
                                className="text-red-500 hover:underline text-md"
                              >
                                <FaTrash />
                              </button>
                            )}

                            {category.stages === "Resubmitted" && (
                              <button
                                onClick={() =>
                                  handleResubmittedClick(category.categoryId)
                                }
                                className="text-purple-600 hover:underline text-md"
                                title="View Resubmitted Logs"
                              >
                                <FaHistory />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="9"
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
                <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3  border-gray-300">
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
          {isResubmittedModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white p-8 rounded-2xl w-[90%] max-w-3xl shadow-lg relative">
                <h2 className="text-2xl font-bold mb-6 text-purple-700">
                  Resubmitted Category
                </h2>
                <button
                  onClick={() => setIsResubmittedModalOpen(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-2xl"
                >
                  ✕
                </button>

                {resubmittedLogs.length > 0 ? (
                  <div className="space-y-6">
                    {resubmittedLogs.map((log) => {
                      // We are only showing the description now
                      return (
                        <div
                          key={log.id}
                          className="bg-gray-50 p-6 rounded-lg shadow-md border-l-4 border-purple-600 hover:bg-gray-100 transition-all"
                        >
                          <div className="mt-4">
                            <p className="text-md text-gray-800">
                              <span className="font-medium">Description:</span>{" "}
                              {log.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center">
                    No resubmitted logs found.
                  </p>
                )}
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
                  <div className="flex flex-col gap-2 w-full md:w-[250px]">
                    <label className="text-[#555252] font-semibold">Approval Workflow</label>
                    <Select
                      options={workflowOptions}
                      value={
                        categoryData.workflowname
                          ? workflowOptions.find(
                            (option) => option.value === categoryData.workflowname
                          )
                          : null
                      }
                      onChange={(selectedOption) =>
                        handleInputChange({
                          target: {
                            name: "workflowname",
                            value: selectedOption?.value || "",
                          },
                        })
                      }
                      className="react-select-container"
                      classNamePrefix="react-select"
                      placeholder="Select Approval Workflow"
                      isSearchable
                    />
                  </div>

                </form>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 sm:gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsCategoryEditable(false)}
                    className="bg-red-600 hover:bg-red-700 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-md shadow-md transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    className="bg-green-600 hover:bg-green-700 text-white py-1 sm:py-2 px-4 sm:px-6 rounded-md shadow-md transition-all duration-300"
                  >
                    update
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Category Modal */}
          {isEditCategoryModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50">
              <div
                ref={modalRef}
                className="relative bg-white rounded-lg p-6 shadow-lg w-11/12 md:w-3/4 lg:w-1/3 xl:w-1/2"
              >
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-2xl font-bold"
                >
                  <FaTimes />
                </button>
                <h2 className="text-lg font-bold mb-4">Create Form</h2>
                {/* Notification Note */}
                <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
                  <h3 className="font-bold text-lg">Important Note:</h3>
                  <p className="text-sm">
                    Please be aware that any changes made to the fields in this
                    form may affect the Asset Evaluation and Depreciation Rate
                    calculations for this category. Do not remove or modify any
                    predefined fields if you want to maintain these calculations
                    accurately.
                  </p>
                </div>

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
                    {existingFields.map((field, index) => {
                      const isPredefined = [
                        "Asset Name",
                        "Purchase Date",
                        "Original Cost",
                        "Scrap Value",
                        "Useful Life",
                        "Unit Of Measure"
                      ].includes(field.fieldname);

                      return (
                        <div key={index} className="flex items-center gap-4 flex-wrap">

                          {/* Field Name */}
                          <input
                            type="text"
                            name="fieldname"
                            value={field.fieldname}
                            onChange={(e) => handleExistingFieldChange(index, e)}
                            disabled={isPredefined}        // 👈 ONLY predefined non-editable
                            className={`p-2 border rounded-lg flex-1 ${isPredefined ? "bg-gray-200 cursor-not-allowed" : ""
                              }`}
                          />

                          {/* Data Type */}
                          <select
                            name="assetDataType"
                            value={field.assetDataType}
                            onChange={(e) => handleExistingFieldChange(index, e)}
                            disabled={isPredefined}         // 👈 ONLY predefined lock
                            className={`p-2 border rounded-lg ${isPredefined ? "bg-gray-200 cursor-not-allowed" : ""
                              }`}
                          >
                            <option value="String">Alpha Numeric</option>
                            <option value="Integer">Whole Number</option>
                            <option value="Number">Decimal Number</option>
                            <option value="Boolean">Yes/No</option>
                            <option value="Date">Date</option>
                            <option value="Json">Upload File</option>
                          </select>

                          {/* Not Null Checkbox */}
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="isNullable"
                              checked={field.isNullable}
                              onChange={(e) => handleExistingFieldChange(index, e)}
                              disabled={isPredefined}      // 👈 Lock only predefined
                            />
                            Not Null
                          </label>

                          {/* Unique Checkbox */}
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="isUnique"
                              checked={field.isUnique}
                              onChange={(e) => handleExistingFieldChange(index, e)}
                              disabled={isPredefined}
                            />
                            Unique
                          </label>

                          {/* DELETE BUTTON — Only if not predefined */}
                          {!isPredefined && (
                            <button
                              type="button"
                              onClick={() => removeExistingField(field.id)}
                              className="text-red-500 hover:underline"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                      );
                    })}


                    {newFields.map((field, index) => (
                      <div key={index} className="flex items-center gap-4 flex-wrap">

                        <input
                          type="text"
                          name="fieldname"
                          value={field.fieldname}
                          onChange={(e) => handleNewFieldChange(index, e)}
                          className="p-2 border rounded-lg flex-1"
                        />

                        <select
                          name="assetDataType"
                          value={field.assetDataType}
                          onChange={(e) => handleNewFieldChange(index, e)}
                          className="p-2 border rounded-lg"
                        >
                          <option value="String">Alpha Numeric</option>
                          <option value="Integer">Whole Number</option>
                          <option value="Number">Decimal Number</option>
                          <option value="Boolean">Yes/No</option>
                          <option value="Date">Date</option>
                          <option value="Json">Upload File</option>
                        </select>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isNullable"
                            checked={field.isNullable}
                            onChange={(e) => handleNewFieldChange(index, e)}
                          />
                          Not Null
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="isUnique"
                            checked={field.isUnique}
                            onChange={(e) => handleNewFieldChange(index, e)}
                          />
                          Unique
                        </label>

                        <button
                          type="button"
                          onClick={() => removeField(index)}
                          className="text-red-500 hover:underline"
                        >
                          <FaTrash />
                        </button>

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

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
              <div className="w-80 h-80 bg-white p-6 rounded-2xl shadow-lg text-center flex flex-col justify-between">
                {/* Modal Icon */}
                <div className="modal-icon mt-4">
                  <div
                    className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full ${modalType === "error" ? "bg-red-600" : "bg-blue-600"
                      }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      {modalType === "error" ? (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      ) : (
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      )}
                    </svg>
                  </div>
                </div>

                {/* Modal Header */}
                <h2
                  className={`font-inter text-2xl font-bold mt-4 ${modalType === "error" ? "text-red-600" : "text-blue-600"
                    }`}
                >
                  {modalType === "error" ? "Error" : "Success"}
                </h2>

                {/* Modal Body */}
                <p className="text-black text-[16px] mb-3">
                  {modalMessage ||
                    (modalType === "error"
                      ? "Something went wrong."
                      : "Category added successfully!")}
                </p>

                {/* Modal Footer */}
                <button
                  className={`px-3 font-medium text-lg py-2 rounded-md transition duration-300 text-white ${modalType === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  onClick={() => {
                    if (modalType === "error") {
                      setIsModalOpen(false);
                    } else {
                      handleCloseModal();
                    }
                  }}
                >
                  {modalType === "error" ? "Close" : "Continue"}
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
      <LoaderModal isVisible={isLoading} text={loaderText} />
      <MessageModal
        message={message}
        type={messageType}
        setMessage={setMessage}
      />
      {/* Notification Selector Modal */}
      {/* <NotificationSelector
        open={isNotificationSelectorOpen}
        onClose={() => setIsNotificationSelectorOpen(false)}
        onConfirm={handleNotificationConfirm}
      /> */}
      <DeleteConfirmModal
        open={isDeleteModalOpen}
        title="Delete Category?"
        message="Are you sure you want to delete this category?"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Category;
