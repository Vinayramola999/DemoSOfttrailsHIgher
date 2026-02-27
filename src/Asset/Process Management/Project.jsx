import React, { useState, useEffect, useRef, useMemo } from "react";
import { FaEdit, FaTrash, FaEye, FaClipboardList } from "react-icons/fa";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProjectRoles from "./ProjectRoles";
import MessageModal from "../ApprovalAuthority/MessageModal";
//import ProfileDropdown from "../../ProfileDropdown";
import { DMS_BASE, JAVA_BASE, ASSET_NODE_BASE, UCS_BASE, MAIN_BASE, WORKFLOW_BASE } from "../../config/apiBase"
const Category = () => {
  const [categoryData, setCategoryData] = useState({
    projectName: "",
    workflow_name: "Select Workflow",
    workflow_id: "",
    description: "",
    createdBy: "userId",
  });

  const [quantity, setQuantity] = useState("");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false); // State to toggle the visibility of filters
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAssetApprovalModal, setShowAssetApprovalModal] = useState(false);
  const [showAssetAdditionModal, setShowAssetAdditionModal] = useState(false);
  const [tempData, setTempData] = useState([]); // Temporary table data
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectAll, setSelectAll] = useState(false); // State for Select All check
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [existingFields, setExistingFields] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // Store selected category ID
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
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [availableMaterial, setAvailableMaterial] = useState(null);
  const [costPerUnit, setCostPerUnit] = useState(0);
  const [selectedApprovalRole, setSelectedApprovalRole] = useState("");
  const filteredCategories = categories.filter((category) =>
    category.categoriesname?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [compositionMaterials, setCompositionMaterials] = useState([]);
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
  const [projectId, setProjectId] = useState(null);  // id naam confuse kar raha tha
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [approvalModalMessage, setApprovalModalMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedRoleType, setSelectedRoleType] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [isProjectSelectionModalOpen, setIsProjectSelectionModalOpen] =
    useState(false);
  const [filteredMaterials, setFilteredMaterials] = useState([]); // Materials matching selected category name
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stagesFilter, setStagesFilter] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [isMaterialRequisitionFormOpen, setIsMaterialRequisitionFormOpen] =
    useState(false);
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [requisitionList, setRequisitionList] = useState([]);

  const [materials, setMaterials] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [uom, setUom] = useState("");

  const [requisitionCategory, setRequisitionCategory] = useState("");
  const [requisitionMaterials, setRequisitionMaterials] = useState([]);
  const [requisitionSelectedMaterial, setRequisitionSelectedMaterial] =
    useState("");
  const [requisitionAvailableQuantity, setRequisitionAvailableQuantity] =
    useState(null);
  const [requisitionQuantity, setRequisitionQuantity] = useState("");
  const [requisitionUOM, setRequisitionUOM] = useState("");
  const [requisitionRemarks, setRequisitionRemarks] = useState("");
  const [requisitionTable, setRequisitionTable] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [isCompositionModalOpen, setIsCompositionModalOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [isProjectEdit, setIsProjectedit] = useState(false);
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
    if (statusFilter || stagesFilter || startDate || endDate) {
      fetchFilteredCategories(statusFilter, stagesFilter, startDate, endDate);
    } else {
      fetchCategories(); // Fetch all categories if no filters are applied
    }
  }, [statusFilter, stagesFilter, startDate, endDate]); // Re-fetch when any filter changes
  useEffect(() => {
    if (isCompositionModalOpen && selectedProject) {
      fetchCompositionData();
    }
  }, [isCompositionModalOpen, selectedProject]);

  // Fetch categories with token
  useEffect(() => {
    const token = sessionStorage.getItem("token"); // Get token from storage

    fetch(`${JAVA_BASE}api/categories/rawmaterials`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetched Categories:", data);
        if (Array.isArray(data)) {
          setCategory(data);
        }
      })
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // Fetch materials for selected category with token
  useEffect(() => {
    if (selectedCategoryName) {
      const token = sessionStorage.getItem("token");

      axios
        .get(
          `${ASSET_NODE_BASE}getColumnTypesAndData/${selectedCategoryName}`,
          {
            params: {
              type: "Raw material"
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          const materialsData = response.data?.data || [];
          setMaterials(materialsData);
          setFilteredMaterials(materialsData);
          setRequisitionMaterials(materialsData);
        })
        .catch((error) => console.error("Error fetching materials:", error));
    }
  }, [selectedCategoryName]);

  // Fetch roles with token
  useEffect(() => {
    if (isEditCategoryModalOpen && categories) {
      const token = sessionStorage.getItem("token");

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
        .catch((error) => console.error("Error fetching roles:", error));
    }
  }, [isEditCategoryModalOpen, categories]);

  // Fetch workflows with token
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await axios.get(
          `${WORKFLOW_BASE}uniworkflow/workflow/get-modules/module?module_name=Process Management`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response && response.data && Array.isArray(response.data.workflows)) {
          setWorkflows(response.data.workflows);
        }
      } catch (error) {
        console.error("Error fetching workflows:", error);
      }
    };

    fetchWorkflows();
  }, []);


  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token"); // Get token

      const response = await axios.get(
        `${JAVA_BASE}api/projects/fetch`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("API response:", response.data);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const openModal = async () => {
    setIsModalOpen(true);
    try {
      const token = sessionStorage.getItem("token"); // Get token

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
      console.error("Error fetching categories:", error);
    }
  };

  const handleCompositionMaterialChange = (e) => {
    const selectedName = e.target.value;
    setSelectedMaterial(selectedName);

    const mat = materials.find((m) => m.material_name === selectedName);
    if (mat) {
      setUom(mat.uom || "");
      setCostPerUnit(parseFloat(mat["Unit Cost"]) || 0);
      setSelectedMaterialId(mat.unique_id);
      setSelectedCategoryId(mat.category_id);
    }
  };

  // Add Material to Local Table
  const handleAddComposition = async () => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    try {
      const payload = {
        action: "CompositionCreation",
        user_id: Number(userId),
        materials: [
          {
            material_name: selectedMaterial,
            quantity_per_unit: quantity,
            unit: uom,
            cost_per_unit: costPerUnit,
            material_id: selectedMaterialId,
            category_id: selectedCategoryId,
          },
        ],
      };

      await axios.post(
        `${ASSET_NODE_BASE}process/commission/${selectedProject.project_Id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
        }
      );

      // Fetch updated table data
      fetchCompositionData();

      // Clear fields
      setSelectedMaterial("");
      setQuantity("");
      setUom("");
      setCostPerUnit("");
    } catch (error) {
      console.error("Add Composition Failed:", error);
    }
  };


  const fetchCompositionData = async () => {
    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    try {
      const res = await axios.get(
        `${ASSET_NODE_BASE}process/commission/${selectedProject.project_Id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
        }
      );

      if (res.data?.success) {
        setCompositionMaterials(res.data.commissions);
      }
    } catch (error) {
      console.error("Fetching composition data failed:", error);
    }
  };


  // Delete from table
  const handleDeleteComposition = async (id) => {
    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    try {
      const res = await axios.delete(
        `${ASSET_NODE_BASE}process/commission/${selectedProject.project_Id}/${id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
        }
      );

      if (res.status === 200) {
        // Refresh the list after successful deletion
        fetchCompositionData();
      }
    } catch (error) {
      console.error("Delete Composition Failed:", error);
      alert("Failed to delete material.");
    }
  };


  // Submit API
  const handleSubmitComposition = async () => {
    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    try {
      const res = await axios.post(
        `${ASSET_NODE_BASE}process/commission/${selectedProject.project_Id}`,
        { materials: compositionMaterials },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
        }
      );

      if (res.status === 200) {
        // Proceed to Project Material Request modal
        setIsCompositionModalOpen(false);
        setIsProjectSelectionModalOpen(false);
        setIsMaterialRequisitionFormOpen(false);
      }
    } catch (error) {
      console.error("Submit Composition Failed", error);
    }
  };

  const handleMaterialChange = (e) => {
    const selectedMaterialName = e.target.value;
    setSelectedMaterial(selectedMaterialName);

    const selectedMaterialObj = filteredMaterials.find(
      (material) => material.material_name === selectedMaterialName
    );

    if (selectedMaterialObj) {
      setUom(selectedMaterialObj.uom || "N/A");
      setAvailableMaterial(selectedMaterialObj["Available Materials"] || 0);

      // ⭐ Most Important Fix
      setSelectedMaterialId(selectedMaterialObj.unique_id || null);

      console.log("Selected Material UOM:", selectedMaterialObj.uom);
      console.log("Material ID:", selectedMaterialObj.unique_id);
      console.log(
        "Available Material:",
        selectedMaterialObj["Available Materials"]
      );
    } else {
      setUom("N/A");
      setAvailableMaterial(null);
      setSelectedMaterialId(null); // Reset ID
    }
  };


  const handleAddToTable = () => {
    if (!selectedMaterial || !quantity) {
      alert("Please select a material and enter a quantity.");
      return;
    }

    if (!selectedMaterialId) {
      alert("Material ID missing! Please reselect the material.");
      return;
    }

    const newData = {
      project_Id: selectedProject?.project_Id,
      projectName: selectedProject?.projectName,

      categoryId: selectedCategory?.categoryId,
      categoryName: selectedCategory?.categoriesname,

      materialName: selectedMaterial,
      material_Id: selectedMaterialId,   // ⭐ MOST IMPORTANT LINE

      quantity,
      uom,
    };

    setTempData((prev) => [...prev, newData]);

    // Reset fields
    setSelectedMaterial("");
    setSelectedMaterialId(null);
    setQuantity("");
    // uom apne aap next selection me set hoga
  };


  const handleCategoryChange = (e) => {
    const categoryName = e.target.value;

    const selectedCategoryObj = filteredCategoryList.find(
      (item) => item.categoriesname === categoryName
    );

    setSelectedCategory({
      categoryId: selectedCategoryObj?.categoryId || "",
      categoriesname: categoryName,
    });

    setSelectedCategoryName(categoryName);
  };

  const fetchFilteredCategories = async (
    status = "",
    stages = "",
    startDate = "",
    endDate = ""
  ) => {
    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    try {
      let url = `${JAVA_BASE}categories?`;
      if (status) url += `status=${status}&`;
      if (stages) url += `stages=${stages}&`;
      if (startDate && endDate) url += `&startDate=${startDate}&endDate=${endDate}`;

      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      });

      console.log("Filtered API response:", response.data);
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching filtered categories:", error);
      setCategories([]); // Ensures categories is an array even if fetch fails
    }
  };

  const fetchCategoryFields = async () => {
    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    try {
      const response = await axios.get(
        `${JAVA_BASE}api/assets/fetch`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
        }
      );

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

  const handleAddRequisitionToList = () => {
    if (!selectedMaterial || !requestedQuantity) return;

    const entry = {
      material: selectedMaterial,
      quantity: requestedQuantity,
      remarks,
      available: availableMaterial,
    };

    setRequisitionList([...requisitionList, entry]);
    setRequestedQuantity("");
    setRemarks("");
  };

  const handleSubmitFinalRequisition = () => {
    // API call or pass to backend here
    console.log("Final Requisition Submitted:", requisitionList);

    // Optionally reset
    setRequisitionList([]);
    setIsMaterialRequisitionFormOpen(false);
  };

  const handleSubmits = async () => {
    const token = sessionStorage.getItem("token");

    const payload =
      tempData.length > 0
        ? tempData.map((item) => ({
          project_Id: item.project_Id,
          projectName: item.projectName,
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          materialName: item.materialName,
          material_Id: item.material_Id,        // ⭐ DIRECT ID (perfect)
          uom: item.uom,
          createdAt: new Date().toISOString(),
          projectQuantity: item.quantity,
        }))
        : [
          {
            project_Id: selectedProject.project_Id,
            projectName: selectedProject.projectName,
            categoryId: selectedCategory.categoryId,
            categoryName: selectedCategory.categoriesname,
            materialName: selectedMaterial,
            material_Id: selectedMaterialId,    // ⭐ Use selectedMaterialId
            uom: uom,
            createdAt: new Date().toISOString(),
            projectQuantity: quantity,
          },
        ];

    console.log("Payload to Send:", payload);

    try {
      await axios.post(
        `${JAVA_BASE}api/fine-goods/create`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("Data submitted successfully!");
      setMessageType("success");

      setTempData([]);
      resetFields();
      handleCloseProjectSelectionModal();
    } catch (error) {
      console.error("Error submitting data:", error);
      setMessage("Failed to submit data. Try again.");
      setMessageType("error");
    }
  };



  const handleClose = () => {
    setTempData([]);
    handleCloseProjectSelectionModal();
  };

  const handleDeleteFromTable = (indexToDelete) => {
    const updatedTempData = tempData.filter(
      (_, index) => index !== indexToDelete
    );
    setTempData(updatedTempData); // Update tempData without the deleted row
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
    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    try {
      await axios.delete(`${JAVA_BASE}api/assets/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      });

      window.location.reload();
      setUpdatedOn((prev) => prev + 1);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleWorkflowChange = (e) => {
    const selectedId = e.target.value;

    // Find the selected workflow object using `workflow_id`
    const selectedWorkflow = workflows.find(
      (workflow) => String(workflow.workflow_id) === selectedId
    );

    if (!selectedWorkflow) {
      console.error("Selected Workflow not found!");
      return;
    }

    setCategoryData((prevData) => ({
      ...prevData,
      workflow_id: Number(selectedId), // ✅ Correct ID for payload
      workflow_name: selectedWorkflow.workflow_name, // ✅ Store name for UI
      sub_module_name: selectedWorkflow.sub_module_name, // (optional: extra info)
    }));

    console.log("Selected Workflow ID:", selectedId);
    console.log("Selected Workflow Name:", selectedWorkflow.workflow_name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryData.workflow_id) {
      setModalMessage("Please select a workflow.");
      setModalType("error");
      setIsModalOpen(true);
      return;
    }

    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    if (!userId) {
      setModalMessage("User ID is not available.");
      setModalType("error");
      setIsModalOpen(true);
      return;
    }

    try {
      const newCategory = {
        projectName: categoryData.projectName,
        description: categoryData.description,
        wrokflowId: categoryData.workflow_id,
        createdby: Number(userId),
      };

      console.log("Submitting category: ", newCategory);

      const response = await axios.post(
        `${JAVA_BASE}api/projects/create`,
        newCategory,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
        }
      );

      console.log("API Response:", response);
      setProjectId(response.data.id);
      setUpdatedOn(new Date());
      setCategories(
        Array.isArray(response.data.categories) ? response.data.categories : []
      );

      resetForm();
      setModalMessage("Product added successfully!");
      setModalType("success");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error Adding Product:", error);
      setModalMessage("Error Adding Product Name. Please try again.");
      setModalType("error");
    }
  };


  const resetForm = () => {
    setCategoryData({
      projectName: "",
      workflow_name: "Select Workflow",
      workflow_id: "",
      description: "",
      createdBy: "userId",
    });

    setSelectedWorkflow("");
  };

  const handleOpenProjectSelectionModal = (project) => {
    console.log("Selected project:", project); // Debugging to check the project object

    // Ensure project contains project_Id and other necessary fields
    setSelectedProject({
      project_Id: project.id,
      projectName: project.projectName,
    });

    setIsProjectSelectionModalOpen(true);
  };

  const handleCloseProjectSelectionModal = () => {
    // Clear modal-related data
    setSelectedCategory(null);
    setSelectedCategoryName("");
    setSelectedMaterial("");
    setQuantity("");
    setUom("");
    setTempData([]);
    setAvailableMaterial(null);

    fetchCategories();

    setIsProjectSelectionModalOpen(false);
    setIsCompositionModalOpen(true);
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
  const handleAddRequirement = () => {
    navigate("/AddRequirement"); // Redirect to AddRequirement page
  };
  const lockedFields = ["Project Name", "Created By", "Total Cost"];

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

  const verifyToken = async () => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const response = await axios.post(
        `${MAIN_BASE}users/verify-token`,
        {
          token: token,
        }
      );

      navigate("/Project");
    } catch (error) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenExpiry");
      navigate("/");
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };
  const handleCloseApprovalModal = () => {
    setIsApprovalModalOpen(false);
  };
  const resetFields = () => {
    setSelectedCategory({ categoryId: "", categoriesname: "" });
    setSelectedMaterial("");
    setQuantity("");
    setUom("");
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
  const handleSaveSelection = () => {
    if (!selectedCategory || !selectedMaterial) {
      alert("Please select both category and material.");
      return;
    }

    console.log("Selection saved:", {
      project: selectedProject?.projectName,
      category: selectedCategory,
      material: selectedMaterial,
    });

    setIsModalOpen(false); // Close modal after saving
  };
  console.log("Categories state:", categories);

  const handleRequisitionCategoryChange = (e) => {
    const selectedName = e.target.value;
    setRequisitionCategory(selectedName); // For dropdown binding
    setSelectedCategoryName(selectedName); // 🔁 Triggers useEffect to fetch materials
    setRequisitionMaterials([]); // Clear old materials
    setRequisitionSelectedMaterial("");
    setRequisitionUOM("");
    setRequisitionAvailableQuantity(null);
  };

  const handleRequisitionMaterialChange = (e) => {
    const selected = e.target.value;
    setRequisitionSelectedMaterial(selected);

    const mat = requisitionMaterials.find((m) => m.material_name === selected);
    if (mat) {
      setRequisitionAvailableQuantity(mat["Available Materials"] || 0);
      setRequisitionUOM(mat.uom || "N/A");
    } else {
      setRequisitionAvailableQuantity(null);
      setRequisitionUOM("");
    }
  };

  const handleAddToRequisitionTable = () => {
    if (requisitionSelectedMaterial && requisitionQuantity) {
      const item = {
        material: requisitionSelectedMaterial,
        quantity: requisitionQuantity,
        uom: requisitionUOM,
        remarks: requisitionRemarks,
        available: requisitionAvailableQuantity,
      };
      setRequisitionTable([...requisitionTable, item]);
      setRequisitionSelectedMaterial("");
      setRequisitionQuantity("");
      setRequisitionRemarks("");
      setRequisitionAvailableQuantity(null);
      setRequisitionUOM("");
    }
  };

  const handleRemoveRequisitionItem = (index) => {
    const updated = [...requisitionTable];
    updated.splice(index, 1);
    setRequisitionTable(updated);
  };
  const handleSubmitRequisition = async () => {
    if (!selectedProject?.project_Id) {
      setMessage("Please select a project before submitting.");
      setMessageType("error");
      return;
    }

    let tempTable = [...requisitionTable];

    // If the current form has unadded data, add that too
    if (requisitionSelectedMaterial && requisitionQuantity) {
      tempTable.push({
        material: requisitionSelectedMaterial,
        quantity: requisitionQuantity,
        uom: requisitionUOM,
        remarks: requisitionRemarks,
        available: requisitionAvailableQuantity,
      });
    }

    if (tempTable.length === 0) {
      setMessage("Please add at least one material before submitting.");
      setMessageType("error");
      return;
    }

    const payload = tempTable.map((item) => {
      const selectedCategoryObj = category.find(
        (cat) =>
          cat.categoriesname?.toLowerCase().trim() ===
          requisitionCategory?.toLowerCase().trim()
      );

      const selectedMaterialObj = requisitionMaterials.find(
        (mat) =>
          mat.material_name?.toLowerCase().trim() ===
          item.material?.toLowerCase().trim()
      );

      return {
        projectId: selectedProject.project_Id,
        projectName: selectedProject.projectName,
        categoryId: selectedCategoryObj?.categoryId || 0,
        categoryName: requisitionCategory,
        materialId: selectedMaterialObj?.unique_id || 0,
        requestedQuantity: Number(item.quantity),
        uom: item.uom || "N/A",
        availableQuantity: item.available || 0,
        description: item.remarks || "",
        materialName: selectedMaterialObj?.material_name || item.material,
      };
    });

    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    try {
      const response = await fetch(
        `${JAVA_BASE}api/raw-material`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        setMessage("Requisition submitted successfully!");
        setMessageType("success");

        // Reset everything
        setRequisitionTable([]);
        setIsMaterialRequisitionFormOpen(false);
        setRequisitionSelectedMaterial("");
        setRequisitionQuantity("");
        setRequisitionRemarks("");
        setRequisitionAvailableQuantity(null);
        setRequisitionUOM("");
      } else {
        setMessage("Failed to submit requisition.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error submitting requisition:", error);
      setMessage("Server error occurred.");
      setMessageType("error");
    }
  };

  const handleOpenCompositionModal = (project) => {
    setSelectedProject({
      project_Id: project.id,
      projectName: project.projectName,
    });

    // Clear previous state if needed
    setSelectedCategoryName("");
    setSelectedMaterial("");
    setQuantity("");
    setUom("");
    setCostPerUnit("");
    setCompositionMaterials([]);

    // Show the composition modal

    setIsCompositionModalOpen(true);
  };

  const handleStatusChange = async (requestId) => {
    const token = sessionStorage.getItem("token"); // ✅ Token fetch
    const userId = sessionStorage.getItem("userId");

    if (!userId) {
      alert("User not logged in");
      return;
    }

    try {
      const res = await axios.post(
        `${ASSET_NODE_BASE}process/comissionRequest/${requestId}/${userId}`,
        { actionapprove: "SUBMITTEDFORAPPROVAL", action: "CompositionCreation" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // ✅ Token pass
          },
        }
      );

      if (res.status === 200) {
        fetchCompositionData();
        setShowStatusModal(false); // ✅ Close the modal
      }
    } catch (error) {
      console.error("Status change failed:", error);
      alert("Failed to update status.");
    }
  };

  // ✅ First, only keep items with status "Active" and stages "Approved"
  const approvedCompositionMaterials = useMemo(() => {
    return compositionMaterials.filter(
      (item) => item.status === "Active" && item.stages === "Approved"
    );
  }, [compositionMaterials]);

  // ✅ Then extract only approved category IDs
  const uniqueCategoryIdsFromComposition = useMemo(() => {
    return [
      ...new Set(
        approvedCompositionMaterials.map((item) => String(item.category_id))
      ),
    ];
  }, [approvedCompositionMaterials]);

  // ✅ And approved material names
  const uniqueMaterialNamesFromComposition = useMemo(() => {
    return [
      ...new Set(
        approvedCompositionMaterials.map((item) => item.material_name)
      ),
    ];
  }, [approvedCompositionMaterials]);

  // ✅ Filter category list to only approved ones
  const filteredCategoryList = useMemo(() => {
    return category.filter((cat) =>
      uniqueCategoryIdsFromComposition.includes(String(cat.categoryId))
    );
  }, [category, uniqueCategoryIdsFromComposition]);

  // ✅ Filter materials list to only approved ones in the selected category
  const filteredMaterialsForSelection = useMemo(() => {
    return materials.filter(
      (mat) =>
        mat.category_id === selectedCategory?.categoryId &&
        uniqueMaterialNamesFromComposition.includes(mat.material_name)
    );
  }, [materials, selectedCategory, uniqueMaterialNamesFromComposition]);

  return (
    <div className="flex overflow-hidden">
      <div className="flex-col w-full">
        <ProjectRoles
          projectId={projectId}
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          roles={roles}
          edit={isProjectEdit}
          refreshData={fetchCategories}
        />
        <div className="p-3 w-full">
          <div className="rounded-lg ">
            <form
              onSubmit={handleSubmit}
              className="flex flex-wrap items-end gap-6 mb-6"
            >
              {/* Project Name */}
              <div className="flex flex-col gap-2 w-full sm:w-[200px]">
                <label className="text-[#555252] font-semibold">Project Name</label>
                <input
                  type="text"
                  name="projectName"
                  onChange={handleInputChange}
                  value={categoryData.projectName}
                  className="p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 w-full sm:w-[200px]">
                <label className="text-[#555252] font-semibold">Description</label>
                <input
                  type="text"
                  name="description"
                  value={categoryData.description}
                  onChange={handleInputChange}
                  className="p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Workflow Dropdown */}
              {/* Workflow Dropdown */}
              <div className="flex flex-col gap-2 w-full sm:w-[200px]">
                <label className="text-[#555252] font-semibold">Approval Workflow</label>
                <select
                  name="workflow_id"
                  value={categoryData.workflow_id}
                  onChange={handleWorkflowChange}
                  className="p-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#F9FAFB]"
                  required
                >
                  <option value="">Select Approval Workflow</option>
                  {workflows.map((workflow) => (
                    <option
                      key={workflow.workflow_id}
                      value={workflow.workflow_id}
                    >
                      {workflow.workflow_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="rounded-full bg-blue-600 text-white py-2 px-10 hover:bg-blue-700"
                >
                  Submit
                </button>
              </div>
            </form>

            {/* Table Section */}
            <div className="relative w-full">
              <div className="overflow-x-auto overflow-y-auto max-h-[70vh] border rounded-lg border-gray-300">
                <table className="min-w-full table-auto border-collapse ">
                  <thead className="sticky top-0 bg-gray-100 border-b-2 border-gray-300 text-[14px] font-bold text-gray-700">
                    <tr>
                      {[
                        "S.No",
                        "Project Name",
                        "Description",
                        "Created On",
                        "Approval Workflow",
                        "Created By",
                        "Action",
                      ].map((heading, i) => (
                        <th key={i} className="p-4 text-center">
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {categories.length > 0 ? (
                      categories.map((category, index) => (
                        <tr
                          key={category.categoryId}
                          className={`transition-colors duration-300 hover:bg-blue-100 ${index % 2 === 0 ? "bg-white" : "bg-blue-50"
                            }`}
                        >
                          <td className="p-4 text-center">{index + 1}</td>
                          <td className="p-4 text-center">
                            {category.projectName}
                          </td>
                          <td className="p-4 text-center">
                            {category.description}
                          </td>
                          <td className="p-4 text-center">
                            {category?.createdAt
                              ? formatDate(category.createdAt)
                              : ""}
                          </td>
                          <td className="p-4 text-center">
                            {category.workflowName}
                          </td>
                          <td className="p-4 text-center">
                            {category.createdBy || "Unknown User"}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex justify-center items-center gap-3">
                              <button
                                onClick={() =>
                                  handleOpenCompositionModal(category)
                                }
                                className="text-blue-600 hover:text-blue-800"
                                title="Select Project"
                              >
                                <FaEye className="text-base" />
                              </button>

                              <button
                                onClick={() => {
                                  setIsOpen(true);
                                  setIsProjectedit(true);
                                  setProjectId(category.id);
                                }}
                              >
                                <FaEdit color="green" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center p-4 text-gray-500"
                        >
                          No categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {isProjectSelectionModalOpen && selectedProject && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-[1px] px-3">
              <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl p-4 md:p-6 space-y-6 overflow-y-auto max-h-[90vh]">
                {/* Heading */}
                <h2 className="text-lg md:text-xl font-bold text-center text-blue-700">
                  Project Material Request
                </h2>

                {/* Project Info & Requisition Button */}
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="w-full md:w-2/3">
                    <label className="text-sm text-gray-700 font-medium mb-1 block">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={selectedProject.projectName}
                      readOnly
                      className="w-[250px] px-3 py-2 text-sm rounded-md border border-gray-300 bg-gray-100"
                    />
                  </div>
                  <div className="w-full md:w-1/3 flex justify-end md:justify-start">
                    {/* <button
                      onClick={() => setIsMaterialRequisitionFormOpen(true)}
                      className="w-full md:w-auto px-4 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
                    >
                      Raise Material Requisition →
                    </button> */}
                  </div>
                </div>

                {/* Category & Material */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 font-medium mb-1 block">
                      Select Category
                    </label>
                    <select
                      className="w-full px-3 py-2 text-sm rounded-md border border-gray-300"
                      onChange={handleCategoryChange}
                      value={selectedCategory?.categoriesname || ""}
                    >
                      <option value="">-- Select Category --</option>
                      {filteredCategoryList.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoriesname}>
                          {cat.categoriesname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-700 font-medium mb-1 block">
                      Select Material
                    </label>
                    {materials.length > 0 ? (
                      <>
                        <select
                          className="w-full px-3 py-2 text-sm rounded-md border border-gray-300"
                          onChange={handleMaterialChange}
                          value={selectedMaterial}
                          disabled={!selectedCategory}
                        >
                          <option value="">-- Select Material --</option>
                          {filteredMaterialsForSelection.map((material) => (
                            <option
                              key={material.unique_id}
                              value={material.material_name}
                            >
                              {material.material_name}
                            </option>
                          ))}
                        </select>
                        {availableMaterial !== null && (
                          <div className="mt-1 text-xs text-green-700 font-bold">
                            Available:{" "}
                            <span className="font-bold">
                              {availableMaterial}
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="p-2 rounded-md border border-yellow-400 bg-yellow-100 text-xs text-yellow-800">
                        No materials found for this category.
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity & UOM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-700 font-medium mb-1 block">
                      Min Quantity
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="Enter Quantity"
                      className="w-full px-3 py-2 text-sm rounded-md border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-700 font-medium mb-1 block">
                      UOM
                    </label>
                    <input
                      type="text"
                      value={uom || "N/A"}
                      readOnly
                      className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 bg-gray-100"
                    />
                  </div>
                </div>

                {/* Add Button */}
                <div className="flex justify-start mt-1">
                  <button
                    onClick={handleAddToTable}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    + Add
                  </button>
                </div>

                {/* Table */}
                {tempData.length > 0 && (
                  <div className="overflow-x-auto border border-gray-300 rounded-md mt-3 max-h-56 overflow-y-auto">
                    <table className="min-w-full table-auto text-sm text-center">
                      <thead className="bg-blue-100 text-blue-800 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 border">Material</th>
                          <th className="px-3 py-2 border">Quantity</th>
                          <th className="px-3 py-2 border">UOM</th>
                          <th className="px-3 py-2 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tempData.map((item, idx) => (
                          <tr
                            key={idx}
                            className="even:bg-blue-50 hover:bg-gray-100 transition"
                          >
                            <td className="border px-3 py-2">
                              {item.materialName}
                            </td>
                            <td className="border px-3 py-2">
                              {item.quantity}
                            </td>
                            <td className="border px-3 py-2">{item.uom}</td>
                            <td className="border px-2 py-2">
                              <button
                                onClick={() => handleDeleteFromTable(idx)}
                              >
                                <FaTrash className="text-red-500 hover:text-red-600" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Submit Button */}
                {/* Bottom Buttons Section */}
                <div className="pt-4  mt-4 flex justify-between items-center">
                  {/* Back Button */}
                  <button
                    onClick={handleCloseProjectSelectionModal}
                    className="px-5 py-2 text-sm bg-gray-400 text-gray-800 rounded-md hover:bg-gray-700 hover:text-white transition w-28"
                  >
                    ← Back
                  </button>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmits}
                    className="px-5 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition w-28"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {isMaterialRequisitionFormOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-[1px]">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 space-y-6 relative">
                <h2 className="text-2xl font-bold text-center text-blue-700">
                  Material Requisition Form
                </h2>

                {/* Project Info Display */}
                {selectedProject && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-600 mb-1">
                        Selected Project
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 rounded border border-gray-300 bg-gray-100"
                        value={selectedProject.projectName}
                        readOnly
                      />
                    </div>
                  </div>
                )}

                {/* Category & Material Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Select Category
                    </label>
                    <select
                      className="w-full p-2 rounded border border-gray-300"
                      value={requisitionCategory}
                      onChange={handleRequisitionCategoryChange}
                    >
                      <option value="">-- Select Category --</option>
                      {category.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoriesname}>
                          {cat.categoriesname}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Select Material
                    </label>
                    <select
                      className="w-full p-2 rounded border border-gray-300"
                      value={requisitionSelectedMaterial}
                      onChange={handleRequisitionMaterialChange}
                      disabled={!requisitionCategory}
                    >
                      <option value="">-- Select Material --</option>
                      {requisitionMaterials.map((mat) => (
                        <option key={mat.unique_id} value={mat.material_name}>
                          {mat.material_name}
                        </option>
                      ))}
                    </select>

                    {requisitionAvailableQuantity !== null && (
                      <div className="text-sm mt-1 text-green-700 font-bold">
                        Available Quantity:{" "}
                        <span className="font-bold">
                          {requisitionAvailableQuantity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quantity & UOM */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      Required Quantity
                    </label>
                    <input
                      type="number"
                      className="w-full p-2 rounded border border-gray-300"
                      value={requisitionQuantity}
                      onChange={(e) => setRequisitionQuantity(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-600 mb-1">
                      UOM
                    </label>
                    <input
                      type="text"
                      readOnly
                      className="w-full p-2 bg-gray-100 rounded border border-gray-300"
                      value={requisitionUOM}
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div>
                  <label className="block font-bold text-gray-600 mb-1">
                    Remarks
                  </label>
                  <textarea
                    className="w-full p-2 rounded border border-gray-300"
                    value={requisitionRemarks}
                    onChange={(e) => setRequisitionRemarks(e.target.value)}
                  ></textarea>
                </div>

                {/* Add to Table */}
                <div className="text-right">
                  <button
                    onClick={handleAddToRequisitionTable}
                    className="px-5 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    + Add
                  </button>
                </div>

                {/* Table */}
                {requisitionTable.length > 0 && (
                  <div className="overflow-x-auto mt-4">
                    <table className="min-w-full border border-gray-300 table-auto">
                      <thead className="bg-blue-100 text-blue-800">
                        <tr>
                          <th className="px-4 py-2 border">Material</th>
                          <th className="px-4 py-2 border">
                            Required Quantity
                          </th>
                          <th className="px-4 py-2 border">UOM</th>
                          <th className="px-4 py-2 border">
                            Available Quantity
                          </th>
                          <th className="px-4 py-2 border">Remarks</th>
                          <th className="px-4 py-2 border">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requisitionTable.map((item, idx) => (
                          <tr key={idx} className="text-center">
                            <td className="border px-4 py-2">
                              {item.material}
                            </td>
                            <td className="border px-4 py-2">
                              {item.quantity}
                            </td>
                            <td className="border px-4 py-2">{item.uom}</td>
                            <td className="border px-4 py-2">
                              {item.available}
                            </td>
                            <td className="border px-4 py-2">{item.remarks}</td>
                            <td className="border px-2 py-2">
                              <button
                                onClick={() => handleRemoveRequisitionItem(idx)}
                              >
                                <FaTrash className="text-red-500 hover:text-red-600" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-6">
                  <button
                    onClick={() => setIsMaterialRequisitionFormOpen(false)}
                    className="px-5 py-2 text-sm bg-gray-400 text-gray-800 rounded-md hover:bg-gray-700"
                  >
                    ← Back
                  </button>

                  <button
                    onClick={handleSubmitRequisition}
                    className="px-5 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {isCompositionModalOpen && selectedProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-[1px] px-4">
              <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
                {/* Close Button */}
                <button
                  onClick={() => setIsCompositionModalOpen(false)}
                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition"
                  title="Close"
                >
                  ✕
                </button>

                {/* Header */}
                <h2 className="text-xl md:text-2xl font-bold text-center text-blue-700 mb-4">
                  Project Composition
                </h2>

                {/* Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={selectedProject.projectName}
                      readOnly
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setIsCompositionModalOpen(false); // Close composition modal
                        setIsProjectSelectionModalOpen(true); // Open project selection modal
                      }}
                      className="w-full px-4 py-2 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition"
                    >
                      + Project Material Request
                    </button>
                  </div>
                </div>

                {/* Select Category & Material */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Category
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                      onChange={handleCategoryChange}
                      value={
                        selectedCategory ? selectedCategory.categoriesname : ""
                      }
                    >
                      <option value="">-- Select Category --</option>
                      {Array.isArray(categories) && categories.length > 0 ? (
                        category.map((cat) => (
                          <option
                            key={cat.categoryId}
                            value={cat.categoriesname}
                          >
                            {cat.categoriesname}
                          </option>
                        ))
                      ) : (
                        <option disabled>Loading categories...</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Material
                    </label>
                    <select
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                      onChange={handleCompositionMaterialChange}
                      value={selectedMaterial}
                      disabled={!selectedCategoryName}
                    >
                      <option value="">-- Select Material --</option>
                      {materials.map((material) => (
                        <option
                          key={material.unique_id}
                          value={material.material_name}
                        >
                          {material.material_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quantity, Unit, Cost */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity Per Unit
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={uom}
                      readOnly
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Per Unit
                    </label>
                    <input
                      type="text"
                      value={costPerUnit}
                      readOnly
                      className="w-full px-3 py-2 rounded-md border border-gray-300 bg-gray-100 text-sm"
                    />
                  </div>
                </div>

                {/* Add Material Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleAddComposition}
                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
                  >
                    + Add Material
                  </button>
                </div>

                {/* Table Section */}
                {compositionMaterials.length > 0 && (
                  <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto mb-4">
                    <table className="min-w-full text-sm text-center">
                      <thead className="bg-blue-100 text-blue-800 sticky top-0">
                        <tr>
                          <th className="px-3 py-2">Material</th>
                          <th className="px-3 py-2">Qty/Unit</th>
                          <th className="px-3 py-2">Unit</th>
                          <th className="px-3 py-2">Cost/Unit</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Stage</th>
                          <th className="px-3 py-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {compositionMaterials.map((item, idx) => (
                          <tr
                            key={idx}
                            className="bg-white even:bg-blue-50 hover:bg-gray-100 transition"
                          >
                            <td className="px-3 py-2">{item.material_name}</td>
                            <td className="px-3 py-2">
                              {item.quantity_per_unit}
                            </td>
                            <td className="px-3 py-2">{item.unit}</td>
                            <td className="px-3 py-2">{item.cost_per_unit}</td>
                            <td className="px-3 py-2">{item.status}</td>
                            <td className="px-3 py-2">{item.stages}</td>
                            <td className="px-3 py-2 flex justify-center gap-2">
                              {item.status === "Active" &&
                                item.stages === "Approved" ? (
                                <span
                                  className="text-gray-500 text-lg"
                                  title="Locked"
                                >
                                  🔒
                                </span>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setSelectedRequestId(item.id);
                                      setShowStatusModal(true);
                                    }}
                                    title="View"
                                  >
                                    <FaEye className="text-blue-500 hover:text-blue-700" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteComposition(item.id)
                                    }
                                    title="Delete"
                                  >
                                    <FaTrash className="text-red-500 hover:text-red-700" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
          {showStatusModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
                  Confirm Status Change
                </h2>
                <p className="text-gray-700 text-center">
                  Are you sure you want to send this material for approval?
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <button
                    onClick={() => handleStatusChange(selectedRequestId)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Yes, Confirm
                  </button>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <MessageModal
        message={message}
        type={messageType}
        setMessage={setMessage}
      />
    </div>
  );
};

export default Category;
