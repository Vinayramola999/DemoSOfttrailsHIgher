




import axios from "axios";
import React, { useState, useEffect } from "react";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { FaHome, FaSignOutAlt, FaTimes } from "react-icons/fa";
import Select from "react-select";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const RolesAddModal = ({ isOpen, setIsOpen, categoryId,edit,refreshData }) => {
  const [categoryData, setCategoryData] = useState({ approvalrole: "" });
  const [categoryApprovalRole, setCategoryApprovalRole] = useState([]); // Now an array to hold multiple roles
  const [assetApprovalRole, setAssetApprovalRole] = useState([]); // Now an array to hold multiple roles
  const [assetAdditionRole, setAssetAdditionRole] = useState([]); // Now an array to hold multiple roles
  const [roles, setRoles] = useState([]);  // State to store the fetched roles
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalMessage, setRoleModalMessage] = useState("");
  const [assetMappingRole, setAssetMappingRole] = useState([]);
  const [assetDiscardRole, setAssetDiscardRole] = useState([]);
  const [assetRepairRole, setAssetRepairRole] = useState([]);
  const [assetDamageRole, setAssetDamageRole] = useState([]);
  const [mappingRequestRole, setMappingRequestRole] = useState([]);
  const [discardRequestRole, setDiscardRequestRole] = useState([]);
  const [repairRequestRole, setRepairRequestRole] = useState([]);
  const [damageRequestRole, setDamageRequestRole] = useState([]);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [error, setError] = useState(''); // Add this state to handle errors
  const [message, setMessage] = useState(''); // State to store the message
  const [messageType, setMessageType] = useState(''); // State to store the type of message
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false); 
  const [categoryApprovalBypass, setCategoryApprovalBypass] = useState(false);
const [assetApprovalBypass, setAssetApprovalBypass] = useState(false);
const [assetAdditionBypass, setAssetAdditionBypass] = useState(false);
const [assetMappingBypass, setAssetMappingBypass] = useState(false);
const [assetDiscardBypass, setAssetDiscardBypass] = useState(false);
const [assetRepairBypass, setAssetRepairBypass] = useState(false);
const [assetDamageBypass, setAssetDamageBypass] = useState(false);
const [mappingRequestBypass, setMappingRequestBypass] = useState(false);
const [discardRequestBypass, setDiscardRequestBypass] = useState(false);
const [repairRequestBypass, setRepairRequestBypass] = useState(false);
const [damageRequestBypass, setDamageRequestBypass] = useState(false);

console.log(assetApprovalRole)

const [updatedOn, setUpdatedOn] = useState(Date.now());

console.log(categoryId)
 

useEffect(() => {
  const fetchRoles = async () => {
    try {
      const token = sessionStorage.getItem("token"); // get your token

      const response = await axios.get(`${MAIN_BASE}role`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const transformedRoles = response.data.map((role) => ({
        role_id: role.role_id,
        role: role.role,
      }));

      setRoles(transformedRoles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching roles:", error);
      setLoading(false);
    }
  };

  if (isOpen) {
    fetchRoles();
  }
}, [isOpen]);


  useEffect(() => {
    if (edit && isOpen) {
      handleViewRoles();
    }
  }, [edit, isOpen]);
  
  const handleApprovalRoleChange = (e, setRole) => {
    // Update the state to allow multiple selections
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setRole(selectedOptions);
  };

  const closeModal = () => setIsOpen(false);
  
  // Handle form submission
// const handleSubmit = async () => {
//   try {
//     const token = sessionStorage.getItem("token"); // get your token

//     // Configuration of actions, roles, and bypasses
//     const roleConfigs = [
//       { action: "CategoryApproval", roles: categoryApprovalRole, bypass: categoryApprovalBypass },
//       { action: "AssetApproval", roles: assetApprovalRole, bypass: assetApprovalBypass },
//       { action: "AssetAddition", roles: assetAdditionRole, bypass: assetAdditionBypass },
//       { action: "MappingApprove", roles: assetMappingRole, bypass: assetMappingBypass },
//       { action: "DiscardApprove", roles: assetDiscardRole, bypass: assetDiscardBypass },
//       { action: "RepairApprove", roles: assetRepairRole, bypass: assetRepairBypass },
//       { action: "DamageApprove", roles: assetDamageRole, bypass: assetDamageBypass },
//       { action: "MappingRequest", roles: mappingRequestRole, bypass: mappingRequestBypass },
//       { action: "DiscardRequest", roles: discardRequestRole, bypass: discardRequestBypass },
//       { action: "RepairRequest", roles: repairRequestRole, bypass: repairRequestBypass },
//       { action: "DamageRequest", roles: damageRequestRole, bypass: damageRequestBypass },
//     ];

//     // Validation
//     const invalidActions = roleConfigs.filter(
//       ({ roles, bypass }) => roles.length === 0 && !bypass
//     );

//     if (invalidActions.length > 0) {
//       const invalidActionNames = invalidActions.map(item => item.action).join(", ");
//       setMessage(`Please select at least one role or bypass for: ${invalidActionNames}`);
//       setMessageType(true);
//       return;
//     }

//     // Prepare data
//     const url = `${JAVA_BASE}api/roles/add/${categoryId}`;
//     const updateStagesUrl = `${ASSET_NODE_BASE}assets/stages/${categoryId}`;

//     const data = roleConfigs.map(({ action, roles, bypass }) => ({
//       action,
//       groups: [...roles, bypass ? "bypass" : null].filter(Boolean),
//     }));

//     // POST request with token
//     const res = await axios.post(url, data, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     console.log("Roles Response:", res.data);

//     // PUT request with token to update stage
//     const stagesData = { value: "FormDesign" };
//     const stagesResponse = await axios.put(updateStagesUrl, stagesData, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     console.log("Stages Response:", stagesResponse.data);

//     // Reset selections
//     const resetRoles = () => {
//       setCategoryApprovalRole([]);
//       setAssetApprovalRole([]);
//       setAssetAdditionRole([]);
//       setAssetMappingRole([]);
//       setAssetDiscardRole([]);
//       setAssetRepairRole([]);
//       setAssetDamageRole([]);
//       setMappingRequestRole([]);
//       setDiscardRequestRole([]);
//       setRepairRequestRole([]);
//       setDamageRequestRole([]);
//     };

//     const resetBypasses = () => {
//       setCategoryApprovalBypass(false);
//       setAssetApprovalBypass(false);
//       setAssetAdditionBypass(false);
//       setAssetMappingBypass(false);
//       setAssetDiscardBypass(false);
//       setAssetRepairBypass(false);
//       setAssetDamageBypass(false);
//       setMappingRequestBypass(false);
//       setDiscardRequestBypass(false);
//       setRepairRequestBypass(false);
//       setDamageRequestBypass(false);
//     };

//     resetRoles();
//     resetBypasses();

//     closeModal();
//     setIsSecondModalOpen(false);
//     setIsThirdModalOpen(false);

//     setRoleModalMessage("Approval Roles added successfully.");
//     setIsRoleModalOpen(true);
//     setUpdatedOn(Date.now());
//     refreshData();
//   } catch (error) {
//     console.error("Error in handleSubmit:", error);
//     setMessage("An error occurred while submitting the form. Please try again.");
//     setMessageType(true);
//   }
// };


const handleSubmit = async () => {
  try {
    const token = sessionStorage.getItem("token"); // 🔒 Get token

    const roleConfigs = [
      { action: "CategoryApproval", roles: categoryApprovalRole, bypass: categoryApprovalBypass },
      { action: "AssetApproval", roles: assetApprovalRole, bypass: assetApprovalBypass },
      { action: "AssetAddition", roles: assetAdditionRole, bypass: assetAdditionBypass },
      { action: "MappingApprove", roles: assetMappingRole, bypass: assetMappingBypass },
      { action: "DiscardApprove", roles: assetDiscardRole, bypass: assetDiscardBypass },
      { action: "RepairApprove", roles: assetRepairRole, bypass: assetRepairBypass },
      { action: "DamageApprove", roles: assetDamageRole, bypass: assetDamageBypass },
      { action: "MappingRequest", roles: mappingRequestRole, bypass: mappingRequestBypass },
      { action: "DiscardRequest", roles: discardRequestRole, bypass: discardRequestBypass },
      { action: "RepairRequest", roles: repairRequestRole, bypass: repairRequestBypass },
      { action: "DamageRequest", roles: damageRequestRole, bypass: damageRequestBypass },
    ];

    // 🔍 Validation
    const invalidActions = roleConfigs.filter(
      ({ roles, bypass }) => roles.length === 0 && !bypass
    );

    if (invalidActions.length > 0) {
      const invalidActionNames = invalidActions.map(item => item.action).join(", ");
      setMessage(`Please select at least one role or bypass for: ${invalidActionNames}`);
      setMessageType(true);
      return;
    }

    // ✅ Format data for new API
    const formattedData = roleConfigs.map(({ action, roles, bypass }) => ({
      module_name: "Asset Management",
      sub_module_name: "Movable",
      module_id: 1,
      sub_id: 12,
      category_id: categoryId,
      action_name: action,
      group_names: [...roles, bypass ? "bypass" : null].filter(Boolean),
    }));

    // 🔐 1️⃣ Send role configurations
    const res = await axios.put(
      `${ASSET_NODE_BASE}workflow/asset/group/upsert`,
      formattedData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("New Roles API Response:", res.data);

    // 🔐 2️⃣ Update stages
    const updateStagesUrl = `${ASSET_NODE_BASE}assets/stages/${categoryId}`;
    const stagesData = {
  value: "FormDesign",
  action: "CategoryApproval",
  submodule: "Movable"
};


    const stagesResponse = await axios.put(updateStagesUrl, stagesData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Stages Response:", stagesResponse.data);

    // ✅ Reset forms and modals
    const resetRoles = () => {
      setCategoryApprovalRole([]);
      setAssetApprovalRole([]);
      setAssetAdditionRole([]);
      setAssetMappingRole([]);
      setAssetDiscardRole([]);
      setAssetRepairRole([]);
      setAssetDamageRole([]);
      setMappingRequestRole([]);
      setDiscardRequestRole([]);
      setRepairRequestRole([]);
      setDamageRequestRole([]);
    };

    const resetBypasses = () => {
      setCategoryApprovalBypass(false);
      setAssetApprovalBypass(false);
      setAssetAdditionBypass(false);
      setAssetMappingBypass(false);
      setAssetDiscardBypass(false);
      setAssetRepairBypass(false);
      setAssetDamageBypass(false);
      setMappingRequestBypass(false);
      setDiscardRequestBypass(false);
      setRepairRequestBypass(false);
      setDamageRequestBypass(false);
    };

    resetRoles();
    resetBypasses();

    closeModal();
    setIsSecondModalOpen(false);
    setIsThirdModalOpen(false);

    setRoleModalMessage("Approval Roles added successfully.");
    setIsRoleModalOpen(true);
    setUpdatedOn(Date.now());
    refreshData();
  } catch (error) {
    console.error("Error in handleSubmit:", error);
    setMessage("An error occurred while submitting the form. Please try again.");
    setMessageType(true);
  }
};


  
 const handleViewRoles = async () => {
  const token = sessionStorage.getItem("token");

  try {
    if (!categoryId) {
      console.error("No categoryId provided");
      return;
    }

    const response = await fetch(
      `${ASSET_NODE_BASE}workflow/asset/approval-groups?module_name=Asset Management&sub_module_name=Movable&action_category_id=${categoryId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    console.log("Fetched roles:", result);

    // ✅ Transform API data into rolesByAction and bypassFlags
    const rolesByAction = {};
    const bypassFlags = {};

    result.forEach((item) => {
      const action = item.action_name;
      const group = item.group_name;

      if (!action || !group) return;

      if (group?.toLowerCase() === "bypass") {
        bypassFlags[action] = true;
      } else {
        if (!rolesByAction[action]) rolesByAction[action] = [];
        rolesByAction[action].push(group);
      }
    });

    console.log("rolesByAction", rolesByAction);
    console.log("bypassFlags", bypassFlags);

    // ✅ Assign roles + bypass just like before
    setCategoryApprovalRole(rolesByAction["CategoryApproval"] || []);
    setCategoryApprovalBypass(bypassFlags["CategoryApproval"] || false);

    setAssetApprovalRole(rolesByAction["AssetApproval"] || []);
    setAssetApprovalBypass(bypassFlags["AssetApproval"] || false);

    setAssetAdditionRole(rolesByAction["AssetAddition"] || []);
    setAssetAdditionBypass(bypassFlags["AssetAddition"] || false);

    setMappingRequestRole(rolesByAction["MappingRequest"] || []);
    setMappingRequestBypass(bypassFlags["MappingRequest"] || false);

    setDamageRequestRole(rolesByAction["DamageRequest"] || []);
    setDamageRequestBypass(bypassFlags["DamageRequest"] || false);

    setRepairRequestRole(rolesByAction["RepairRequest"] || []);
    setRepairRequestBypass(bypassFlags["RepairRequest"] || false);

    setDiscardRequestRole(rolesByAction["DiscardRequest"] || []);
    setDiscardRequestBypass(bypassFlags["DiscardRequest"] || false);

    setAssetMappingRole(rolesByAction["MappingApprove"] || []);
    setAssetMappingBypass(bypassFlags["MappingApprove"] || false);

    setAssetDamageRole(rolesByAction["DamageApprove"] || []);
    setAssetDamageBypass(bypassFlags["DamageApprove"] || false);

    setAssetRepairRole(rolesByAction["RepairApprove"] || []);
    setAssetRepairBypass(bypassFlags["RepairApprove"] || false);

    setAssetDiscardRole(rolesByAction["DiscardApprove"] || []);
    setAssetDiscardBypass(bypassFlags["DiscardApprove"] || false);

  } catch (error) {
    console.error("Error fetching roles:", error);
  }
};


// const handleViewRoles = async () => {
//   try {
//     const token = sessionStorage.getItem("token"); // get your token

//     const response = await fetch(
//       `${JAVA_BASE}api/roles/category/${categoryId}`,
//       {
//         method: "GET",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const result = await response.json();
//     console.log("Fetched roles:", result);

//     // Collect roles by action (without bypass)
//     const rolesByAction = {};
//     const bypassMap = {};

//     result.roles.forEach(({ action, groups }) => {
//       if (!rolesByAction[action]) rolesByAction[action] = [];

//       if (groups === "bypass") {
//         bypassMap[action] = true;
//       } else {
//         rolesByAction[action].push(groups);
//       }
//     });

//     const setRoleAndBypass = (actionKey, setRoleFn, setBypassFn) => {
//       const roles = rolesByAction[actionKey] || [];
//       const isBypass = bypassMap[actionKey] || false;

//       setRoleFn(isBypass ? [] : roles); // empty dropdown if bypass
//       setBypassFn(isBypass);            // checkbox checked if bypass
//     };

//     // Approvals
//     setRoleAndBypass("CategoryApproval", setCategoryApprovalRole, setCategoryApprovalBypass);
//     setRoleAndBypass("AssetApproval", setAssetApprovalRole, setAssetApprovalBypass);
//     setRoleAndBypass("AssetAddition", setAssetAdditionRole, setAssetAdditionBypass);

//     // Requests
//     setRoleAndBypass("MappingRequest", setMappingRequestRole, setMappingRequestBypass);
//     setRoleAndBypass("DamageRequest", setDamageRequestRole, setDamageRequestBypass);
//     setRoleAndBypass("RepairRequest", setRepairRequestRole, setRepairRequestBypass);
//     setRoleAndBypass("DiscardRequest", setDiscardRequestRole, setDiscardRequestBypass);

//     // Approvals
//     setRoleAndBypass("MappingApprove", setAssetMappingRole, setAssetMappingBypass);
//     setRoleAndBypass("DamageApprove", setAssetDamageRole, setAssetDamageBypass);
//     setRoleAndBypass("RepairApprove", setAssetRepairRole, setAssetRepairBypass);
//     setRoleAndBypass("DiscardApprove", setAssetDiscardRole, setAssetDiscardBypass);

//   } catch (error) {
//     console.error("Error fetching roles:", error);
//   }
// };





  const handleNext = () => {
    setIsSecondModalOpen(true);
  };
//  const handleUpdate = async () => {
//   try {
//     const token = sessionStorage.getItem("token"); // get your token
//     const userId = parseInt(sessionStorage.getItem("userId"), 10);

//     const roleConfigs = [
//       { action: "CategoryApproval", roles: categoryApprovalRole, bypass: categoryApprovalBypass },
//       { action: "AssetApproval", roles: assetApprovalRole, bypass: assetApprovalBypass },
//       { action: "AssetAddition", roles: assetAdditionRole, bypass: assetAdditionBypass },
//       { action: "MappingApprove", roles: assetMappingRole, bypass: assetMappingBypass },
//       { action: "DiscardApprove", roles: assetDiscardRole, bypass: assetDiscardBypass },
//       { action: "RepairApprove", roles: assetRepairRole, bypass: assetRepairBypass },
//       { action: "DamageApprove", roles: assetDamageRole, bypass: assetDamageBypass },
//       { action: "MappingRequest", roles: mappingRequestRole, bypass: mappingRequestBypass },
//       { action: "DiscardRequest", roles: discardRequestRole, bypass: discardRequestBypass },
//       { action: "RepairRequest", roles: repairRequestRole, bypass: repairRequestBypass },
//       { action: "DamageRequest", roles: damageRequestRole, bypass: damageRequestBypass },
//     ];

//     const invalidActions = roleConfigs.filter(
//       ({ roles, bypass }) => roles.length === 0 && !bypass
//     );

//     if (invalidActions.length > 0) {
//       const invalidActionNames = invalidActions.map(item => item.action).join(", ");
//       setMessage(`Please select at least one role or bypass for: ${invalidActionNames}`);
//       setMessageType(true);
//       return;
//     }

//     // Format Payload
//     const payload = {
//       userId,
//       approvalGroups: roleConfigs.map(({ action, roles, bypass }) => ({
//         action,
//         groups: [...roles, ...(bypass ? ["bypass"] : [])],
//       })),
//     };

//     const url = `${JAVA_BASE}api/roles/${categoryId}`;
//     const res = await axios.put(url, payload, {
//       headers: { Authorization: `Bearer ${token}` }, // attach token
//     });
//     console.log("Roles Response:", res.data);

//     // Reset Selections
//     const resetRoles = () => {
//       setCategoryApprovalRole([]);
//       setAssetApprovalRole([]);
//       setAssetAdditionRole([]);
//       setAssetMappingRole([]);
//       setAssetDiscardRole([]);
//       setAssetRepairRole([]);
//       setAssetDamageRole([]);
//       setMappingRequestRole([]);
//       setDiscardRequestRole([]);
//       setRepairRequestRole([]);
//       setDamageRequestRole([]);
//     };

//     const resetBypasses = () => {
//       setCategoryApprovalBypass(false);
//       setAssetApprovalBypass(false);
//       setAssetAdditionBypass(false);
//       setAssetMappingBypass(false);
//       setAssetDiscardBypass(false);
//       setAssetRepairBypass(false);
//       setAssetDamageBypass(false);
//       setMappingRequestBypass(false);
//       setDiscardRequestBypass(false);
//       setRepairRequestBypass(false);
//       setDamageRequestBypass(false);
//     };

//     resetRoles();
//     resetBypasses();

//     closeModal();
//     setIsSecondModalOpen(false);
//     setIsThirdModalOpen(false);
//     setRoleModalMessage("Approval Roles added successfully.");
//     setIsRoleModalOpen(true);
//     setUpdatedOn(Date.now());
//   } catch (error) {
//     console.error("Error in handleUpdate:", error);
//     setMessage("An error occurred while submitting the form. Please try again.");
//     setMessageType(true);
//   }
// };

 const handleUpdate = async () => {
  try {
    const token = sessionStorage.getItem("token");
    const userId = parseInt(sessionStorage.getItem("userId"), 10);

    // Actions Configuration
    const roleConfigs = [
      { action: "CategoryApproval", roles: categoryApprovalRole, bypass: categoryApprovalBypass },
      { action: "AssetApproval", roles: assetApprovalRole, bypass: assetApprovalBypass },
      { action: "AssetAddition", roles: assetAdditionRole, bypass: assetAdditionBypass },
      { action: "MappingApprove", roles: assetMappingRole, bypass: assetMappingBypass },
      { action: "DiscardApprove", roles: assetDiscardRole, bypass: assetDiscardBypass },
      { action: "RepairApprove", roles: assetRepairRole, bypass: assetRepairBypass },
      { action: "DamageApprove", roles: assetDamageRole, bypass: assetDamageBypass },
      { action: "MappingRequest", roles: mappingRequestRole, bypass: mappingRequestBypass },
      { action: "DiscardRequest", roles: discardRequestRole, bypass: discardRequestBypass },
      { action: "RepairRequest", roles: repairRequestRole, bypass: repairRequestBypass },
      { action: "DamageRequest", roles: damageRequestRole, bypass: damageRequestBypass },
    ];

    // Validation
    const invalidActions = roleConfigs.filter(
      ({ roles, bypass }) => roles.length === 0 && !bypass
    );

    if (invalidActions.length > 0) {
      const invalidActionNames = invalidActions.map(item => item.action).join(", ");
      setMessage(`Please select at least one role or bypass for: ${invalidActionNames}`);
      setMessageType(true);
      return;
    }

    // ✅ Build payload as per new API
    const payload = roleConfigs.map(({ action, roles, bypass }) => ({
      module_name: "Asset Management",
      sub_module_name: "Movable",
      module_id: 1,
      sub_id: 12,
      category_id: categoryId, // ✅ replacing project_id
      action_name: action,
      group_names: [...roles, ...(bypass ? ["bypass"] : [])],
    }));

    console.log("Payload to be sent:", payload);

    const url = `${ASSET_NODE_BASE}workflow/asset/group/upsert`;
    const res = await axios.put(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Roles Response:", res.data);

    // Reset all selections
    const resetRoles = () => {
      setCategoryApprovalRole([]);
      setAssetApprovalRole([]);
      setAssetAdditionRole([]);
      setAssetMappingRole([]);
      setAssetDiscardRole([]);
      setAssetRepairRole([]);
      setAssetDamageRole([]);
      setMappingRequestRole([]);
      setDiscardRequestRole([]);
      setRepairRequestRole([]);
      setDamageRequestRole([]);
    };

    const resetBypasses = () => {
      setCategoryApprovalBypass(false);
      setAssetApprovalBypass(false);
      setAssetAdditionBypass(false);
      setAssetMappingBypass(false);
      setAssetDiscardBypass(false);
      setAssetRepairBypass(false);
      setAssetDamageBypass(false);
      setMappingRequestBypass(false);
      setDiscardRequestBypass(false);
      setRepairRequestBypass(false);
      setDamageRequestBypass(false);
    };

    resetRoles();
    resetBypasses();

    closeModal();
    setIsSecondModalOpen(false);
    setIsThirdModalOpen(false);
    setRoleModalMessage("Approval roles updated successfully!");
    setIsRoleModalOpen(true);
    setUpdatedOn(Date.now());
  } catch (error) {
    console.error("Error in handleUpdate:", error);
    setMessage("An error occurred while submitting the form. Please try again.");
    setMessageType(true);
  }
};


  const handleCloseApprovalModal = () => {
    setIsRoleModalOpen(false);
  };



  return (
    <div className="relative">
{isOpen && !isSecondModalOpen && !isThirdModalOpen && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50 animate-fadeIn"
    onClick={closeModal}
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg md:max-w-xl relative animate-slideIn"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={closeModal}
        className="absolute top-4 right-4 text-red-600 hover:text-red-900 focus:outline-none"
        aria-label="Close"
      >
        <FaTimes className="text-2xl" />
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Asset Approvals</h2>
      {loading ? (
        <div className="text-center text-gray-600">Loading roles...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {[
            {
              label: "Asset Category Approval",
              state: categoryApprovalRole,
              setter: setCategoryApprovalRole,
              bypassState: categoryApprovalBypass,
              setBypassState: setCategoryApprovalBypass,
            },
            {
              label: "Asset Approval",
              state:  assetApprovalRole,
              setter: setAssetApprovalRole,
              bypassState: assetApprovalBypass,
              setBypassState: setAssetApprovalBypass,
            },
            {
              label: "Asset Addition Authority",
              state: assetAdditionRole,
              setter:  setAssetAdditionRole,
              bypassState:  assetAdditionBypass,
              setBypassState:  setAssetAdditionBypass,
            },
          ].map(({ label, state, setter, bypassState, setBypassState }) => (
            <div className="flex flex-col gap-4" key={label}>
              <label className="text-lg font-medium text-gray-700">{label}</label>
              
              {/* React Select Multi-Select Dropdown */}
              <Select
                isMulti
                options={roles.map((role) => ({
                  value: role.role,
                  label: role.role,
                }))}
                value={state.map((role) => ({ value: role, label: role }))}
                onChange={(selectedOptions) => {
                  setter(selectedOptions.map((option) => option.value));
                  setBypassState(false); // Uncheck bypass when role is selected
                }}
                isDisabled={bypassState} // Disable dropdown if bypass is checked
                className="basic-multi-select"
                classNamePrefix="select"
              />

              {/* Bypass Checkbox, hide if any role is selected */}
              {state.length === 0 || bypassState ? (
                <div className="flex items-center gap-3 text-gray-800">
                  <input
                    type="checkbox"
                    checked={bypassState}
                    onChange={(e) => setBypassState(e.target.checked)}
                    className="w-4 h-4 accent-red-500 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span>Bypass</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => setIsSecondModalOpen(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  </div>
)}


{isSecondModalOpen && !isThirdModalOpen && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50 animate-fadeIn"
    onClick={closeModal}
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg md:max-w-xl relative animate-slideIn"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lifecycle Request Authority</h2>
      {loading ? (
        <div className="text-center text-gray-600">Loading roles...</div>
      ) : (
        <div className="flex flex-col gap-6">
        {[
          {
            label: "Asset Allocation Request",
            state: mappingRequestRole,
            setter: setMappingRequestRole,
            bypassState: mappingRequestBypass,
            setBypassState: setMappingRequestBypass,
          },
          {
            label: "Asset Damage Request",
            state: damageRequestRole,
            setter: setDamageRequestRole,
            bypassState: damageRequestBypass,
            setBypassState: setDamageRequestBypass,
          },
          {
            label: "Asset Repair Request",
            state: repairRequestRole,
            setter: setRepairRequestRole,
            bypassState: repairRequestBypass,
            setBypassState: setRepairRequestBypass,
          },
          {
            label: "Asset Discard Request",
            state: discardRequestRole,
            setter: setDiscardRequestRole,
            bypassState: discardRequestBypass,
            setBypassState: setDiscardRequestBypass,
          },
        
         
        ].map(({ label, state, setter, bypassState, setBypassState }) => (
          <div className="flex flex-col gap-4" key={label}>
            <label className="text-lg font-medium text-gray-700">{label}</label>

            {/* React Select Dropdown */}
            <Select
              isMulti
              isDisabled={bypassState} // Disable if Bypass is checked
              options={roles.map((role) => ({
                value: role.role,
                label: role.role,
              }))}
              value={state.map((role) => ({ value: role, label: role }))}
              onChange={(selectedOptions) => {
                setter(selectedOptions.map((option) => option.value));
                setBypassState(false); // Uncheck bypass when selecting roles
              }}
              className="basic-multi-select"
              classNamePrefix="select"
            />

            {/* Bypass Checkbox */}
            <div className="flex items-center gap-3 text-gray-800">
              <input
                type="checkbox"
                checked={bypassState}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setBypassState(checked);

                  // Clear roles when bypass is selected
                  if (checked) {
                    setter([]);
                  }
                }}
                className="w-4 h-4 accent-red-500 rounded border-gray-300 focus:ring-red-500"
              />
              <span>Bypass</span>
            </div>
          </div>
        ))}
      </div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setIsSecondModalOpen(false)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Back
        </button>
        <button
          onClick={() => setIsThirdModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Next
        </button>
      </div>
    </div>
  </div>
)}
{isThirdModalOpen && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50 animate-fadeIn"
    onClick={closeModal}
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg md:max-w-xl relative animate-slideIn"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lifecycle Approvals </h2>
      {loading ? (
        <div className="text-center text-gray-600">Loading roles...</div>
      ) : (
       

<div className="flex flex-col gap-6">
{[
  {
    label: "Asset Allocation Approval",
    state: assetMappingRole,
    setter: setAssetMappingRole,
    bypassState: assetMappingBypass,
    setBypassState: setAssetMappingBypass,
  },
  {
    label: "Asset Damage Approval",
    state: assetDamageRole,
    setter: setAssetDamageRole,
    bypassState: assetDamageBypass,
    setBypassState: setAssetDamageBypass,
  },
  {
    label: "Asset Repair Approval",
    state: assetRepairRole,
    setter: setAssetRepairRole,
    bypassState: assetRepairBypass,
    setBypassState: setAssetRepairBypass,
  },
  {
    label: "Asset Discard Approval",
    state: assetDiscardRole,
    setter: setAssetDiscardRole,
    bypassState: assetDiscardBypass,
    setBypassState: setAssetDiscardBypass,
  },
].map(({ label, state, setter, bypassState, setBypassState }) => (
  <div className="flex flex-col gap-4" key={label}>
    <label className="text-lg font-medium text-gray-700">{label}</label>
    
    {/* Multi-select Dropdown */}
    <Select
      isMulti
      isDisabled={bypassState} // Disable if Bypass is selected
      options={roles.map((role) => ({
        value: role.role,
        label: role.role,
      }))}
      value={state.map((role) => ({ value: role, label: role }))}
      onChange={(selectedOptions) => {
        const selectedRoles = selectedOptions.map((option) => option.value);
        setter(selectedRoles);
        // If roles are selected, disable bypass
        if (selectedRoles.length > 0) {
          setBypassState(false);
        }
      }}
      className="basic-multi-select"
      classNamePrefix="select"
    />

    {/* Bypass Checkbox */}
    <div className="flex items-center gap-3 text-gray-800">
      <input
        type="checkbox"
        checked={bypassState}
        onChange={(e) => {
          const checked = e.target.checked;
          setBypassState(checked);

          // If Bypass is checked, clear the selected roles
          if (checked) {
            setter([]);
          }
        }}
        className="w-4 h-4 accent-red-500 rounded border-gray-300 focus:ring-red-500"
      />
      <span>Bypass</span>
    </div>
  </div>
))}
</div>
      )}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setIsThirdModalOpen(false)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Back
        </button>
        <button
          onClick={()=>edit ? handleUpdate() :handleSubmit()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}



      {isRoleModalOpen && (
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
              Success !
            </h2>

            {/* Modal Body */}
            <p className="text-black text-[16px] mb-3">
              {roleModalMessage || "Approval process completed successfully!"}
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

      <MessageModal message={message} type={messageType} setMessage={setMessage} />
    </div>

  );
};

export default RolesAddModal;






