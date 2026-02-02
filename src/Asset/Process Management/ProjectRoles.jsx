import axios from "axios";
import React, { useState, useEffect } from "react";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { FaHome, FaSignOutAlt, FaTimes } from "react-icons/fa";
import Select from "react-select";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"

const RolesAddModal = ({ isOpen, setIsOpen, categoryId,edit,refreshData, projectId, }) => {
  const [categoryData, setCategoryData] = useState({ approvalrole: "" });
  const [categoryApprovalRole, setCategoryApprovalRole] = useState([]); // Now an array to hold multiple roles
  const [assetApprovalRole, setAssetApprovalRole] = useState([]); // Now an array to hold multiple roles
  const [assetAdditionRole, setAssetAdditionRole] = useState([]); // Now an array to hold multiple roles
  const [roles, setRoles] = useState([]);  // State to store the fetched roles
  const [loading, setLoading] = useState(true); // State to handle loading state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [roleModalMessage, setRoleModalMessage] = useState("");

  const [message, setMessage] = useState(''); // State to store the message
  const [messageType, setMessageType] = useState(''); // State to store the type of message
    const [compositionCreationRole, setCompositionCreationRole] = useState([]);
  const [compositionApproveRole, setCompositionApproveRole] = useState([]);
  const [productionExecutionRole, setProductionExecutionRole] = useState([]);
  const [productionApproveRole, setProductionApproveRole] = useState([]);
  const [fineGoodsAdditionRole, setFineGoodsAdditionRole] = useState([]);
  const [fineGoodsApprovalRole, setFineGoodsApprovalRole] = useState([]);
  const [fineGoodsMappingRole, setFineGoodsMappingRole] = useState([]);
  const [fineMappingApprovalRole, setFineMappingApprovalRole] = useState([]);

  // Bypass states
  const [compositionCreationBypass, setCompositionCreationBypass] = useState(false);
  const [compositionApproveBypass, setCompositionApproveBypass] = useState(false);
  const [productionExecutionBypass, setProductionExecutionBypass] = useState(false);
  const [productionApproveBypass, setProductionApproveBypass] = useState(false);
  const [fineGoodsAdditionBypass, setFineGoodsAdditionBypass] = useState(false);
  const [fineGoodsApprovalBypass, setFineGoodsApprovalBypass] = useState(false);
  const [fineGoodsMappingBypass, setFineGoodsMappingBypass] = useState(false);
  const [fineMappingApprovalBypass, setFineMappingApprovalBypass] = useState(false);

const [step, setStep] = useState(1); // modal step: 1 ya 2

console.log(assetApprovalRole)

const [updatedOn, setUpdatedOn] = useState(Date.now());

console.log(categoryId)
 
useEffect(() => {
  if (!edit && isOpen) {
    resetModalFields(); // Clean everything when opening for new project
  }
}, [edit, isOpen]);

useEffect(() => {
  const fetchRoles = async () => {
    const token = sessionStorage.getItem("token"); // ✅ Token fetch

    try {
      const response = await axios.get(`${MAIN_BASE}role`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token pass
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
  
 const resetModalFields = () => {
  // Reset all roles
  setCompositionCreationRole([]);
  setCompositionCreationBypass(false);

  setCompositionApproveRole([]);
  setCompositionApproveBypass(false);

  setProductionExecutionRole([]);
  setProductionExecutionBypass(false);

  setProductionApproveRole([]);
  setProductionApproveBypass(false);

  setFineGoodsAdditionRole([]);
  setFineGoodsAdditionBypass(false);

  setFineGoodsApprovalRole([]);
  setFineGoodsApprovalBypass(false);

  setFineGoodsMappingRole([]);
  setFineGoodsMappingBypass(false);

  setFineMappingApprovalRole([]);
  setFineMappingApprovalBypass(false);

  // Reset step to 1
  setStep(1);
};

const handleSubmit = async () => {
  const token = sessionStorage.getItem("token"); // ✅ Token fetch

  try {
    const roleConfigs = [
      { action: "CompositionCreation", roles: compositionCreationRole, bypass: compositionCreationBypass },
      { action: "CompositionApprove", roles: compositionApproveRole, bypass: compositionApproveBypass },
      { action: "ProductionExecution", roles: productionExecutionRole, bypass: productionExecutionBypass },
      { action: "ProductionApprove", roles: productionApproveRole, bypass: productionApproveBypass },
      { action: "FineGoodsAddition", roles: fineGoodsAdditionRole, bypass: fineGoodsAdditionBypass },
      { action: "FineGoodsApproval", roles: fineGoodsApprovalRole, bypass: fineGoodsApprovalBypass },
      { action: "FineGoodsMapping", roles: fineGoodsMappingRole, bypass: fineGoodsMappingBypass },
      { action: "FineMappingApproval", roles: fineMappingApprovalRole, bypass: fineMappingApprovalBypass },
    ];

    // Validation
    const invalidActions = roleConfigs.filter(({ roles, bypass }) => roles.length === 0 && !bypass);
    if (invalidActions.length > 0) {
      setMessageType('error');
      setMessage(`Please select at least one role or bypass for: ${invalidActions.map(a => a.action).join(", ")}`);
      return;
    }

    const formattedData = roleConfigs.map(({ action, roles, bypass }) => ({
      module_name: "Process Management",
      sub_module_name: "Fine goods",
      module_id: 8,
      sub_id: 47,
      Project_id: projectId,
      action_name: action,
      group_names: [...roles, bypass ? "bypass" : null].filter(Boolean),
    }));

    const res = await axios.put(
      `${ASSET_NODE_BASE}workflow/asset/group/upsert`,
      formattedData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      }
    );

    // Status check
    if (res.status === 200 || res.status === 201) {
      console.log("Submit Response:", res.data);
      setMessageType('success');
      setMessage('Roles updated successfully!');
      setIsOpen(false);
      refreshData();
      resetModalFields();
    } else {
      setMessageType('error');
      setMessage('Failed to submit roles. API returned an error.');
    }

  } catch (error) {
    console.error("Error in handleSubmit:", error);
    const errMsg = error.response?.data?.message || error.message || 'Failed to submit roles. Please try again.';
    setMessageType('error');
    setMessage(errMsg);
  }
};


  
const handleViewRoles = async () => {
  const token = sessionStorage.getItem("token");

  try {
    if (!projectId) {
      console.error("No projectId provided");
      return;
    }

    const response = await fetch(
      `${ASSET_NODE_BASE}workflow/asset/approval-groups?module_name=Process Management&sub_module_name=Fine goods&action_category_id=${projectId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const result = await response.json();
    console.log("Fetched roles:", result);

    // 🧩 Step 1: Transform data into rolesByAction (filter out "bypass")
    const rolesByAction = {};
    const bypassFlags = {};

    result.forEach((item) => {
      const action = item.action_name;
      const group = item.group_name;

      // ✅ If "bypass" — mark bypass true, don't add to roles list
      if (group?.toLowerCase() === "bypass") {
        bypassFlags[action] = true;
      } else {
        if (!rolesByAction[action]) rolesByAction[action] = [];
        rolesByAction[action].push(group);
      }
    });

    console.log("rolesByAction", rolesByAction);
    console.log("bypassFlags", bypassFlags);

    // 🧩 Step 2: Set state (roles + bypass)
    setCompositionCreationRole(rolesByAction["CompositionCreation"] || []);
    setCompositionCreationBypass(bypassFlags["CompositionCreation"] || false);

    setCompositionApproveRole(rolesByAction["CompositionApprove"] || []);
    setCompositionApproveBypass(bypassFlags["CompositionApprove"] || false);

    setProductionExecutionRole(rolesByAction["ProductionExecution"] || []);
    setProductionExecutionBypass(bypassFlags["ProductionExecution"] || false);

    setProductionApproveRole(rolesByAction["ProductionApprove"] || []);
    setProductionApproveBypass(bypassFlags["ProductionApprove"] || false);

    setFineGoodsAdditionRole(rolesByAction["FineGoodsAddition"] || []);
    setFineGoodsAdditionBypass(bypassFlags["FineGoodsAddition"] || false);

    setFineGoodsApprovalRole(rolesByAction["FineGoodsApproval"] || []);
    setFineGoodsApprovalBypass(bypassFlags["FineGoodsApproval"] || false);

    setFineGoodsMappingRole(rolesByAction["FineGoodsMapping"] || []);
    setFineGoodsMappingBypass(bypassFlags["FineGoodsMapping"] || false);

    setFineMappingApprovalRole(rolesByAction["FineMappingApproval"] || []);
    setFineMappingApprovalBypass(bypassFlags["FineMappingApproval"] || false);
  } catch (error) {
    console.error("Error fetching roles:", error);
  }
};




 
const handleUpdate = async () => {
  const token = sessionStorage.getItem("token"); // ✅ Token fetch

  try {
    const roleConfigs = [
      { action: "CompositionCreation", roles: compositionCreationRole, bypass: compositionCreationBypass },
      { action: "CompositionApprove", roles: compositionApproveRole, bypass: compositionApproveBypass },
      { action: "ProductionExecution", roles: productionExecutionRole, bypass: productionExecutionBypass },
      { action: "ProductionApprove", roles: productionApproveRole, bypass: productionApproveBypass },
      { action: "FineGoodsAddition", roles: fineGoodsAdditionRole, bypass: fineGoodsAdditionBypass },
      { action: "FineGoodsApproval", roles: fineGoodsApprovalRole, bypass: fineGoodsApprovalBypass },
      { action: "FineGoodsMapping", roles: fineGoodsMappingRole, bypass: fineGoodsMappingBypass },
      { action: "FineMappingApproval", roles: fineMappingApprovalRole, bypass: fineMappingApprovalBypass },
    ];

    // Validation
    const invalidActions = roleConfigs.filter(({ roles, bypass }) => roles.length === 0 && !bypass);
    if (invalidActions.length > 0) {
      setMessageType('error');
      setMessage(`Please select at least one role or bypass for: ${invalidActions.map(a => a.action).join(", ")}`);
      return;
    }

    // Formatted payload same as handleSubmit
    const formattedData = roleConfigs.map(({ action, roles, bypass }) => ({
      module_name: "Process Management",
      sub_module_name: "Fine goods",
      module_id: 8,
      sub_id: 47,
      Project_id: projectId, 
      action_name: action,
      group_names: [...roles, bypass ? "bypass" : null].filter(Boolean),
    }));

    const res = await axios.put(
      `${ASSET_NODE_BASE}workflow/asset/group/upsert`,
      formattedData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Token pass
        },
      }
    );

    if (res.status === 200 || res.status === 201) {
      console.log("Update Response:", res.data);
      setMessageType('success');
      setMessage('Roles updated successfully!');
      setIsOpen(false);
      refreshData();
      resetModalFields();
    } else {
      setMessageType('error');
      setMessage('Failed to update roles. API returned an error.');
    }

  } catch (error) {
    console.error("Error in handleUpdate:", error);
    const errMsg = error.response?.data?.message || error.message || 'Failed to update roles. Please try again.';
    setMessageType('error');
    setMessage(errMsg);
  }
};




  const roleOptions = roles.map((r) => ({ value: r.role, label: r.role }));

  
 

  const handleCloseApprovalModal = () => {
    setIsRoleModalOpen(false);
  };



  return (
    <div className="relative">
{isOpen && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 z-50"
    onClick={() => setIsOpen(false)}
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg md:max-w-xl relative"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 text-red-600 hover:text-red-900"
      >
        <FaTimes className="text-2xl" />
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Fine Goods Approvals
      </h2>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          {[
            { label: "Composition Creation Authority", state: compositionCreationRole, setter: setCompositionCreationRole, bypassState: compositionCreationBypass, setBypassState: setCompositionCreationBypass },
            { label: "Composition Approval Authority", state: compositionApproveRole, setter: setCompositionApproveRole, bypassState: compositionApproveBypass, setBypassState: setCompositionApproveBypass },
            { label: "Production Execution Authority", state: productionExecutionRole, setter: setProductionExecutionRole, bypassState: productionExecutionBypass, setBypassState: setProductionExecutionBypass },
            { label: "Production Approval Authority", state: productionApproveRole, setter: setProductionApproveRole, bypassState: productionApproveBypass, setBypassState: setProductionApproveBypass },
          ].map(({ label, state, setter, bypassState, setBypassState }) => (
            <div className="flex flex-col gap-4" key={label}>
              <label className="text-lg font-medium text-gray-700">{label}</label>
              <Select
                isMulti
                options={roleOptions}
                value={state.map((role) => ({ value: role, label: role }))}
                onChange={(selectedOptions) => {
                  setter(selectedOptions.map((option) => option.value));
                  setBypassState(false);
                }}
                isDisabled={bypassState}
              />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={bypassState}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setBypassState(checked);
                    if (checked) setter([]);
                  }}
                  className="w-4 h-4 accent-red-500"
                />
                <span>Bypass</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          {[
            { label: "Fine Goods Addition Authority", state: fineGoodsAdditionRole, setter: setFineGoodsAdditionRole, bypassState: fineGoodsAdditionBypass, setBypassState: setFineGoodsAdditionBypass },
            { label: "Fine Goods Approval Authority", state: fineGoodsApprovalRole, setter: setFineGoodsApprovalRole, bypassState: fineGoodsApprovalBypass, setBypassState: setFineGoodsApprovalBypass },
            { label: "Fine Goods Mapping Authority", state: fineGoodsMappingRole, setter: setFineGoodsMappingRole, bypassState: fineGoodsMappingBypass, setBypassState: setFineGoodsMappingBypass },
            { label: "Fine Goods Mapping Approval Authority", state: fineMappingApprovalRole, setter: setFineMappingApprovalRole, bypassState: fineMappingApprovalBypass, setBypassState: setFineMappingApprovalBypass },
          ].map(({ label, state, setter, bypassState, setBypassState }) => (
            <div className="flex flex-col gap-4" key={label}>
              <label className="text-lg font-medium text-gray-700">{label}</label>
              <Select
                isMulti
                options={roleOptions}
                value={state.map((role) => ({ value: role, label: role }))}
                onChange={(selectedOptions) => {
                  setter(selectedOptions.map((option) => option.value));
                  setBypassState(false);
                }}
                isDisabled={bypassState}
              />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={bypassState}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setBypassState(checked);
                    if (checked) setter([]);
                  }}
                  className="w-4 h-4 accent-red-500"
                />
                <span>Bypass</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex justify-between">
        {step > 1 ? (
          <button
            onClick={() => setStep(step - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Back
          </button>
        ) : <div></div>}

        {step < 2 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => (edit ? handleUpdate() : handleSubmit())}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            {edit ? "Update" : "Submit"}
          </button>
        )}
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




