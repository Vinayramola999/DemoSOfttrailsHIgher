import axios from "axios";
import React, { useState, useEffect } from "react";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { FaHome, FaSignOutAlt, FaTimes } from "react-icons/fa";
import Select from "react-select";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"

const RolesAddModal = ({ isOpen, setIsOpen, categoryId }) => {
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



 

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${MAIN_BASE}role`); // Replace with your actual API URL
        // Transform the response to extract only the role_id and role
        const transformedRoles = response.data.map(role => ({
          role_id: role.role_id,
          role: role.role,
        }));
        setRoles(transformedRoles); // Set the transformed roles in state
        console.log(transformedRoles); //
        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error("Error fetching roles:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    if (isOpen) {
      fetchRoles(); // Fetch roles only when the modal is open
    }
  }, [isOpen]);


  const handleApprovalRoleChange = (e, setRole) => {
    // Update the state to allow multiple selections
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setRole(selectedOptions);
  };

  const closeModal = () => setIsOpen(false);
  // Handle form submission
  const handleSubmit = async () => {
    try {
      const url = `${JAVA_BASE}api/roles/add/${categoryId}`;
      const updateStagesUrl = `${ASSET_NODE_BASE}assets/stages/${categoryId}`;
  
      // Prepare the data with selected roles and bypass as part of the groups array
      const data = [
        { 
          action: "CategoryApproval", 
          groups: [...categoryApprovalRole, categoryApprovalBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "AssetApproval", 
          groups: [...assetApprovalRole, assetApprovalBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "AssetAddition", 
          groups: [...assetAdditionRole, assetAdditionBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "MappingApprove", 
          groups: [...assetMappingRole, assetMappingBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "DiscardApprove", 
          groups: [...assetDiscardRole, assetDiscardBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "RepairApprove", 
          groups: [...assetRepairRole, assetRepairBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "DamageApprove", 
          groups: [...assetDamageRole, assetDamageBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "MappingRequest", 
          groups: [...mappingRequestRole, mappingRequestBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "DiscardRequest", 
          groups: [...discardRequestRole, discardRequestBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "RepairRequest", 
          groups: [...repairRequestRole, repairRequestBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "DamageRequest", 
          groups: [...damageRequestRole, damageRequestBypass && "bypass"].filter(Boolean) 
        },
      ];
  
      // Send roles to the backend
      const res = await axios.post(url, data);
      console.log("Roles Response:", res.data);
  
      // Payload to update stages
      const stagesData = { value: "FormDesign" };
  
      // Update stages using PUT method
      const stagesResponse = await axios.put(updateStagesUrl, stagesData);
      console.log("Stages Response:", stagesResponse.data);
  
      // Clear selected roles and bypass values
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
  
      // Close modals
      closeModal();
      setIsSecondModalOpen(false);
      setIsThirdModalOpen(false);
  
      // Optionally show success modal
      setRoleModalMessage("Approval Roles added successfully.");
      setIsRoleModalOpen(true);
    } catch (error) {
      console.error("Error in handleSubmit:", error);
  
      // Optionally show error modal
      setMessage("An error occurred while submitting the form. Please try again.");
      setMessageType(true);
    }
  };
  
  

  const handleNext = () => {
    setIsSecondModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
    
  
      const url = `${JAVA_BASE}api/roles/update/${categoryId}`; // Update the URL here with categoryId
      const updateStagesUrl = `${ASSET_NODE_BASE}assets/stages/${categoryId}`;
  
      // Prepare the data with selected roles and bypass as part of the groups array
      const data = [
        { 
          action: "CategoryApproval", 
          groups: [...categoryApprovalRole, categoryApprovalBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "AssetApproval", 
          groups: [...assetApprovalRole, assetApprovalBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "AssetAddition", 
          groups: [...assetAdditionRole, assetAdditionBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "MappingApprove", 
          groups: [...assetMappingRole, assetMappingBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "DiscardApprove", 
          groups: [...assetDiscardRole, assetDiscardBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "RepairApprove", 
          groups: [...assetRepairRole, assetRepairBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "DamageApprove", 
          groups: [...assetDamageRole, assetDamageBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "MappingRequest", 
          groups: [...mappingRequestRole, mappingRequestBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "DiscardRequest", 
          groups: [...discardRequestRole, discardRequestBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "RepairRequest", 
          groups: [...repairRequestRole, repairRequestBypass && "bypass"].filter(Boolean) 
        },
        { 
          action: "DamageRequest", 
          groups: [...damageRequestRole, damageRequestBypass && "bypass"].filter(Boolean) 
        },
      ];
  
      // Send roles to the backend for update
      const res = await axios.put(url, data);
      console.log("Roles Update Response:", res.data);
  
      // Payload to update stages
      const stagesData = { value: "FormDesign" };
  
      // Update stages using PUT method
      const stagesResponse = await axios.put(updateStagesUrl, stagesData);
      console.log("Stages Response:", stagesResponse.data);
  
      // Clear selected roles and bypass values
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
  
      // Close modals
      closeModal();
      setIsSecondModalOpen(false);
      setIsThirdModalOpen(false);
  
      // Optionally show success modal
      setRoleModalMessage("Roles updated successfully.");
      setIsRoleModalOpen(true);
  
    } catch (error) {
      console.error("Error in handleUpdate:", error);
  
      // Optionally show error modal
      setMessage("An error occurred while updating the roles. Please try again.");
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
              label: "Material Allocation Request",
              state: mappingRequestRole,
              setter: setMappingRequestRole,
              bypassState: mappingRequestBypass,
              setBypassState: setMappingRequestBypass,
            },
            {
              label: "Material Damage Request",
              state: damageRequestRole,
              setter: setDamageRequestRole,
              bypassState: damageRequestBypass,
              setBypassState: setDamageRequestBypass,
            },
            {
              label: "Material Repair Request",
              state: repairRequestRole,
              setter: setRepairRequestRole,
              bypassState: repairRequestBypass,
              setBypassState: setRepairRequestBypass,
            },
            {
              label: "Material Discard Request",
              state: discardRequestRole,
              setter: setDiscardRequestRole,
              bypassState: discardRequestBypass,
              setBypassState: setDiscardRequestBypass,
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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Lifecycle Approvals</h2>
      {loading ? (
        <div className="text-center text-gray-600">Loading roles...</div>
      ) : (
        <div className="flex flex-col gap-6">
          {[
           {
            label: "Material Allocation Approval",
            state: assetMappingRole,
            setter: setAssetMappingRole,
            bypassState: assetMappingBypass,
            setBypassState: setAssetMappingBypass,
          },
          {
            label: "Material Damage Approval",
            state: assetDamageRole,
            setter: setAssetDamageRole,
            bypassState: assetDamageBypass,
            setBypassState: setAssetDamageBypass,
          },
          {
            label: "Material Repair Approval",
            state: assetRepairRole,
            setter: setAssetRepairRole,
            bypassState: assetRepairBypass,
            setBypassState: setAssetRepairBypass,
          },
          {
            label: "Material Discard Approval",
            state: assetDiscardRole,
            setter: setAssetDiscardRole,
            bypassState: assetDiscardBypass,
            setBypassState: setAssetDiscardBypass,
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
          onClick={() => setIsThirdModalOpen(false)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
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




