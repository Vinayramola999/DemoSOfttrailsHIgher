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
  
  const [mappingRequestRole, setMappingRequestRole] = useState([]);

  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [error, setError] = useState(''); // Add this state to handle errors
  const [message, setMessage] = useState(''); // State to store the message
  const [messageType, setMessageType] = useState(''); // State to store the type of message
  const [isThirdModalOpen, setIsThirdModalOpen] = useState(false); 
  const [categoryApprovalBypass, setCategoryApprovalBypass] = useState(false);
const [assetApprovalBypass, setAssetApprovalBypass] = useState(false);
const [assetAdditionBypass, setAssetAdditionBypass] = useState(false);
const [assetMappingBypass, setAssetMappingBypass] = useState(false);

const [mappingRequestBypass, setMappingRequestBypass] = useState(false);


const [updatedOn, setUpdatedOn] = useState(Date.now());

 
useEffect(() => {
  const fetchRoles = async () => {
    try {
      const token = sessionStorage.getItem("token"); // or wherever your token is stored

      const response = await axios.get(`${MAIN_BASE}role`, {
        headers: {
          Authorization: `Bearer ${token}`, // attach token here
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

//   const handleSubmit = async () => {
//   try {
//     const token = sessionStorage.getItem("token"); // Get token from sessionStorage or wherever it's stored
//     const url = `${JAVA_BASE}api/roles/add/${categoryId}`;
//     const updateStagesUrl = `${ASSET_NODE_BASE}assets/stages/${categoryId}`;

//     // Prepare the data with selected roles and bypass as part of the groups array
//     const data = [
//       { 
//         action: "CategoryApproval", 
//         groups: [...categoryApprovalRole, categoryApprovalBypass && "bypass"].filter(Boolean) 
//       },
//       { 
//         action: "AssetApproval", 
//         groups: [...assetApprovalRole, assetApprovalBypass && "bypass"].filter(Boolean) 
//       },
//       { 
//         action: "AssetAddition", 
//         groups: [...assetAdditionRole, assetAdditionBypass && "bypass"].filter(Boolean) 
//       },
//       { 
//         action: "RawMappingApprove", 
//         groups: [...assetMappingRole, assetMappingBypass && "bypass"].filter(Boolean) 
//       },
//       { 
//         action: "RawMappingRequest", 
//         groups: [...mappingRequestRole, mappingRequestBypass && "bypass"].filter(Boolean) 
//       },
//     ];

//     // Send roles to the backend with Authorization header
//     const res = await axios.post(url, data, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     console.log("Roles Response:", res.data);

//     // Payload to update stages
//     const stagesData = { value: "FormDesign" };

//     // Update stages using PUT method with Authorization header
//     const stagesResponse = await axios.put(updateStagesUrl, stagesData, {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     });
//     console.log("Stages Response:", stagesResponse.data);

//     // Clear selected roles and bypass values
//     setCategoryApprovalRole([]);
//     setAssetApprovalRole([]);
//     setAssetAdditionRole([]);
//     setAssetMappingRole([]);
//     setMappingRequestRole([]);

//     setCategoryApprovalBypass(false);
//     setAssetApprovalBypass(false);
//     setAssetAdditionBypass(false);
//     setAssetMappingBypass(false);
//     setMappingRequestBypass(false);

//     // Close modals
//     closeModal();
//     setIsSecondModalOpen(false);
//     setIsThirdModalOpen(false);

//     // Show success modal
//     setRoleModalMessage("Approval Roles added successfully.");
//     setIsRoleModalOpen(true);
//     setUpdatedOn(Date.now());
//       refreshData();
//   } catch (error) {
//     console.error("Error in handleSubmit:", error);

//     // Show error modal
//     setMessage("An error occurred while submitting the form. Please try again.");
//     setMessageType(true);
//   }
// };
const handleSubmit = async () => {
  try {
    const token = sessionStorage.getItem("token");
    const url = `${ASSET_NODE_BASE}workflow/asset/group/upsert`; // ✅ Node API (from first function)
    const updateStagesUrl = `${ASSET_NODE_BASE}assets/stages/${categoryId}`;

    // ✅ Create role configurations (same actions as your second version)
    const roleConfigs = [
      { action: "CategoryApproval", roles: categoryApprovalRole, bypass: categoryApprovalBypass },
      { action: "AssetApproval", roles: assetApprovalRole, bypass: assetApprovalBypass },
      { action: "AssetAddition", roles: assetAdditionRole, bypass: assetAdditionBypass },
      { action: "MappingApprove", roles: assetMappingRole, bypass: assetMappingBypass },
      { action: "MappingRequest", roles: mappingRequestRole, bypass: mappingRequestBypass },
    ];

    // 🔍 Validation — at least one role or bypass must be selected
    const invalidActions = roleConfigs.filter(
      ({ roles, bypass }) => roles.length === 0 && !bypass
    );
    if (invalidActions.length > 0) {
      const invalidActionNames = invalidActions.map(item => item.action).join(", ");
      setMessage(`Please select at least one role or bypass for: ${invalidActionNames}`);
      setMessageType(true);
      return;
    }

    // ✅ Format payload (same as your first version)
    const formattedData = roleConfigs.map(({ action, roles, bypass }) => ({
      module_name: "Asset Management",
      sub_module_name: "Raw material",
      module_id: 1,
      sub_id: 13,
      category_id: categoryId,
      action_name: action,
      group_names: [...roles, bypass ? "bypass" : null].filter(Boolean),
    }));

    // 🔐 1️⃣ Send role configuration data
    const res = await axios.put(url, formattedData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Roles Response:", res.data);

    // 🔐 2️⃣ Update stages
    const stagesData = { value: "FormDesign" };
    const stagesResponse = await axios.put(updateStagesUrl, stagesData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Stages Response:", stagesResponse.data);

    // ✅ Reset role states
    const resetRoles = () => {
      setCategoryApprovalRole([]);
      setAssetApprovalRole([]);
      setAssetAdditionRole([]);
      setAssetMappingRole([]);
      setMappingRequestRole([]);
    };

    const resetBypasses = () => {
      setCategoryApprovalBypass(false);
      setAssetApprovalBypass(false);
      setAssetAdditionBypass(false);
      setAssetMappingBypass(false);
      setMappingRequestBypass(false);
    };

    resetRoles();
    resetBypasses();

    // ✅ Close modals and show success
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

// const handleViewRoles = async () => {
//   try {
//     const token = sessionStorage.getItem("token"); // get your token

//     const response = await fetch(
//       `${JAVA_BASE}api/roles/category/${categoryId}`,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`, // attach token here
//         },
//       }
//     );

//     const result = await response.json();
//     console.log("Fetched roles:", result);

//     const rolesByAction = {};
//     const bypassMap = {};

//     result.roles.forEach(({ action, groups }) => {
//       if (groups === "bypass") {
//         bypassMap[action] = true;
//       } else {
//         if (!rolesByAction[action]) rolesByAction[action] = [];
//         rolesByAction[action].push(groups);
//       }
//     });

//     const setRoleAndBypass = (actionKey, setRoleFn, setBypassFn) => {
//       const roles = rolesByAction[actionKey] || [];
//       const isBypass = bypassMap[actionKey] || false;

//       setRoleFn(isBypass ? [] : roles); // Clear dropdown if bypass checked
//       setBypassFn(isBypass);            // Check checkbox if bypass found
//     };

//     // Match exactly the roles used in handleSubmit
//     setRoleAndBypass("CategoryApproval", setCategoryApprovalRole, setCategoryApprovalBypass);
//     setRoleAndBypass("AssetApproval", setAssetApprovalRole, setAssetApprovalBypass);
//     setRoleAndBypass("AssetAddition", setAssetAdditionRole, setAssetAdditionBypass);
//     setRoleAndBypass("MappingApprove", setAssetMappingRole, setAssetMappingBypass);
//     setRoleAndBypass("MappingRequest", setMappingRequestRole, setMappingRequestBypass);

//   } catch (error) {
//     console.error("Error fetching roles:", error);
//   }
// };

const handleViewRoles = async () => {
  const token = sessionStorage.getItem("token");

  try {
    if (!categoryId) {
      console.error("No categoryId provided");
      return;
    }

    // ✅ Use Node-based API (same as your latest standard)
    const response = await fetch(
      `${ASSET_NODE_BASE}workflow/asset/approval-groups?module_name=Asset Management&sub_module_name=Raw material&action_category_id=${categoryId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    console.log("Fetched roles:", result);

    // ✅ Convert API data to rolesByAction and bypassFlags
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

    // ✅ Function to set role & bypass cleanly
    const setRoleAndBypass = (actionKey, setRoleFn, setBypassFn) => {
      const roles = rolesByAction[actionKey] || [];
      const isBypass = bypassFlags[actionKey] || false;

      setRoleFn(isBypass ? [] : roles);
      setBypassFn(isBypass);
    };

    // ✅ Match same actions as your updated handleSubmit
    setRoleAndBypass("CategoryApproval", setCategoryApprovalRole, setCategoryApprovalBypass);
    setRoleAndBypass("AssetApproval", setAssetApprovalRole, setAssetApprovalBypass);
    setRoleAndBypass("AssetAddition", setAssetAdditionRole, setAssetAdditionBypass);
    setRoleAndBypass("MappingApprove", setAssetMappingRole, setAssetMappingBypass);
    setRoleAndBypass("MappingRequest", setMappingRequestRole, setMappingRequestBypass);

  } catch (error) {
    console.error("Error fetching roles:", error);
  }
};

  

  const handleNext = () => {
    setIsSecondModalOpen(true);
  };


// const handleUpdate = async () => {
//   try {
//     const userId = parseInt(sessionStorage.getItem("userId"), 10);
//     const token = sessionStorage.getItem("token"); // get your token

//     const roleConfigs = [
//       { action: "CategoryApproval", roles: categoryApprovalRole, bypass: categoryApprovalBypass },
//       { action: "AssetApproval", roles: assetApprovalRole, bypass: assetApprovalBypass },
//       { action: "AssetAddition", roles: assetAdditionRole, bypass: assetAdditionBypass },
//       { action: "MappingApprove", roles: assetMappingRole, bypass: assetMappingBypass },
//       { action: "MappingRequest", roles: mappingRequestRole, bypass: mappingRequestBypass },
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

//     // ✅ Format Payload
//     const payload = {
//       userId,
//       approvalGroups: roleConfigs.map(({ action, roles, bypass }) => ({
//         action,
//         groups: [...roles, ...(bypass ? ["bypass"] : [])]
//       }))
//     };

//     const url = `${JAVA_BASE}api/roles/${categoryId}`;
//     const res = await axios.put(url, payload, {
//       headers: {
//         Authorization: `Bearer ${token}`, // attach token here
//         "Content-Type": "application/json",
//       },
//     });

//     console.log("Roles Response:", res.data);

//     // Reset Selections
//     const resetRoles = () => {
//       setCategoryApprovalRole([]);
//       setAssetApprovalRole([]);
//       setAssetAdditionRole([]);
//       setAssetMappingRole([]);
//       setMappingRequestRole([]);
//     };

//     const resetBypasses = () => {
//       setCategoryApprovalBypass(false);
//       setAssetApprovalBypass(false);
//       setAssetAdditionBypass(false);
//       setAssetMappingBypass(false);
//       setMappingRequestBypass(false);
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
//     console.error("Error updating roles:", error);
//     setMessage("An error occurred while submitting the form. Please try again.");
//     setMessageType(true);
//   }
// };

  
const handleUpdate = async () => {
  try {
    const token = sessionStorage.getItem("token");
    const userId = parseInt(sessionStorage.getItem("userId"), 10);

    // ✅ Define actions configuration
    const roleConfigs = [
      { action: "CategoryApproval", roles: categoryApprovalRole, bypass: categoryApprovalBypass },
      { action: "AssetApproval", roles: assetApprovalRole, bypass: assetApprovalBypass },
      { action: "AssetAddition", roles: assetAdditionRole, bypass: assetAdditionBypass },
      { action: "MappingApprove", roles: assetMappingRole, bypass: assetMappingBypass },
      { action: "MappingRequest", roles: mappingRequestRole, bypass: mappingRequestBypass },
    ];

    // ✅ Validation check
    const invalidActions = roleConfigs.filter(
      ({ roles, bypass }) => roles.length === 0 && !bypass
    );

    if (invalidActions.length > 0) {
      const invalidActionNames = invalidActions.map((item) => item.action).join(", ");
      setMessage(`Please select at least one role or bypass for: ${invalidActionNames}`);
      setMessageType(true);
      return;
    }

    // ✅ Build payload (as per upsert API)
    const payload = roleConfigs.map(({ action, roles, bypass }) => ({
      module_name: "Asset Management",
      sub_module_name: "Raw material",
      module_id: 1,
      sub_id: 13,
      category_id: categoryId,
      action_name: action,
      group_names: [...roles, ...(bypass ? ["bypass"] : [])],
      userId,
    }));

    console.log("Payload to be sent:", payload);

    // ✅ Use upsert API
    const url = `${ASSET_NODE_BASE}workflow/asset/group/upsert`;
    const res = await axios.put(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Roles Response:", res.data);

    // ✅ Reset selections after success
    const resetRoles = () => {
      setCategoryApprovalRole([]);
      setAssetApprovalRole([]);
      setAssetAdditionRole([]);
      setAssetMappingRole([]);
      setMappingRequestRole([]);
    };

    const resetBypasses = () => {
      setCategoryApprovalBypass(false);
      setAssetApprovalBypass(false);
      setAssetAdditionBypass(false);
      setAssetMappingBypass(false);
      setMappingRequestBypass(false);
    };

    resetRoles();
    resetBypasses();

    // ✅ Close modals and show success
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
        className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Close"
      >
        <FaTimes className="text-2xl" />
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Material Approvals</h2>
      {loading ? (
        <div className="text-center text-gray-600">Loading roles...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {[
            {
              label: "Material Category Approval",
              state: categoryApprovalRole,
              setter: setCategoryApprovalRole,
              bypassState: categoryApprovalBypass,
              setBypassState: setCategoryApprovalBypass,
            },
            {
              label: "Material Addition Authority",
              state: assetAdditionRole,
              setter: setAssetAdditionRole,
              bypassState: assetAdditionBypass,
              setBypassState: setAssetAdditionBypass,
            },
            {
              label: "Material Approval",
              state: assetApprovalRole,
              setter: setAssetApprovalRole,
              bypassState: assetApprovalBypass,
              setBypassState: setAssetApprovalBypass,
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


{(isSecondModalOpen || isThirdModalOpen) && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50 animate-fadeIn"
    onClick={closeModal}
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg md:max-w-xl relative animate-slideIn overflow-y-auto max-h-[90vh]"
      onClick={(e) => e.stopPropagation()}
    >
      
      {loading ? (
        <div className="text-center text-gray-600">Loading roles...</div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* === Request Authority Section === */}
          <div className="flex flex-col gap-4 border-b pb-6">
            <h3 className="text-xl font-bold text-gray-700">Lifecycle Request Authority</h3>
            {[
              {
                label: "Material Allocation Request",
                state: mappingRequestRole,
                setter: setMappingRequestRole,
                bypassState: mappingRequestBypass,
                setBypassState: setMappingRequestBypass,
              },
            ].map(({ label, state, setter, bypassState, setBypassState }) => (
              <div className="flex flex-col gap-4" key={label}>
                <label className="text-lg font-medium text-gray-700">{label}</label>

                <Select
                  isMulti
                  isDisabled={bypassState}
                  options={roles.map((role) => ({
                    value: role.role,
                    label: role.role,
                  }))}
                  value={state.map((role) => ({ value: role, label: role }))}
                  onChange={(selectedOptions) => {
                    const selectedRoles = selectedOptions.map((option) => option.value);
                    setter(selectedRoles);
                    if (selectedRoles.length > 0) {
                      setBypassState(false);
                    }
                  }}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />

                <div className="flex items-center gap-3 text-gray-800">
                  <input
                    type="checkbox"
                    checked={bypassState}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setBypassState(checked);
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

          {/* === Approval Section === */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-gray-700">Lifecycle Approvals</h3>
            {[
              {
                label: "Material Allocation Approval",
                state: assetMappingRole,
                setter: setAssetMappingRole,
                bypassState: assetMappingBypass,
                setBypassState: setAssetMappingBypass,
              },
            ].map(({ label, state, setter, bypassState, setBypassState }) => (
              <div className="flex flex-col gap-4" key={label}>
                <label className="text-lg font-medium text-gray-700">{label}</label>

                <Select
                  isMulti
                  isDisabled={bypassState}
                  options={roles.map((role) => ({
                    value: role.role,
                    label: role.role,
                  }))}
                  value={state.map((role) => ({ value: role, label: role }))}
                  onChange={(selectedOptions) => {
                    setter(selectedOptions.map((option) => option.value));
                    setBypassState(false);
                  }}
                  className="basic-multi-select"
                  classNamePrefix="select"
                />

                <div className="flex items-center gap-3 text-gray-800">
                  <input
                    type="checkbox"
                    checked={bypassState}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setBypassState(checked);
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
        </div>
      )}

      <div className="mt-6 flex justify-end gap-4">
        <button
          onClick={() => {
            setIsSecondModalOpen(false);
            setIsThirdModalOpen(false);
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Cancel
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






