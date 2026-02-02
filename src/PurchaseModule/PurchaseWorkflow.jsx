import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import axios from "axios";
import API from "../config/api";
import ManageActionModal from "./components/ManageActionModal";
import ProfileDropdown from "../ProfileDropdown";
import PopupModal from "./PopupModal";

const SetupWorkflow = () => {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  //show modalpopup
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Workflows
  const [workflows, setWorkflows] = useState([]);
  const [workflowOptions, setWorkflowOptions] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Actions
  const [actions, setActions] = useState([]);
  const [actionOptions, setActionOptions] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);

  // Roles (approver groups)
  const [roles, setRoles] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [groups, setGroups] = useState([]);

  // Bypass states
  const [bypassRequest, setBypassRequest] = useState(false);
  const [bypassApprover, setBypassApprover] = useState(false);

  // Refresh trigger for actions
  const [actionsUpdated, setActionsUpdated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Fetch roles once
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get(`${API.COLUMN_TYPES_API}/role`, { headers: { Authorization: `Bearer ${token}` } });
        setRoles(data || []);
        setRoleOptions(
          (data || []).map((role) => ({ value: role.role, label: role.role }))
        );
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // Fetch workflows once
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API.WORKFLOW_API}/workflow/get-modules/module`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { module_name: "Purchase Management" },
        });
        const crmWorkflows = data?.workflows || [];
        setWorkflows(crmWorkflows);
        setWorkflowOptions(
          crmWorkflows.map((wf) => ({
            value: wf.workflow_id,
            label: wf.workflow_name,
            data: wf,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
      }
    };
    fetchWorkflows();
  }, []);

  // Fetch actions whenever workflow changes or ManageActionModal updates
  useEffect(() => {
    if (!selectedWorkflow) return;

    const fetchActions = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(`${API.WORKFLOW_API}/actions/get-workflow`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            workflow_name: selectedWorkflow.workflow_name,
            workflow_id: selectedWorkflow.workflow_id,
          },
        });

        const acts = data?.workflow?.actions || [];
        setActions(acts);
        setActionOptions(
          acts.map((a) => ({
            value: a.action_id,
            label: a.action_name,
            data: a,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch actions:", error);
        setActions([]);
        setActionOptions([]);
      }
    };

    fetchActions();
  }, [selectedWorkflow, actionsUpdated]);

  // Submit
 const handleSubmit = async () => {
    if (!selectedWorkflow || !selectedAction) {
      setErrorMsg("Please select workflow, action, and groups");
      setShowError(true);
      return;
    }

    const payload = [
      {
        module_name: selectedWorkflow.module_name,
        sub_module_name: selectedWorkflow.sub_module_name,
        module_id: selectedWorkflow.module_id,
        sub_id: selectedWorkflow.sub_id,
        action_name: selectedAction.data.action_name,
        group_names: groups,
      },
    ];

  try {
  const token = sessionStorage.getItem("token");

  await axios.put(`${API.WORKFLOW_API}/group`, payload, { headers: { Authorization: `Bearer ${token}` } });

  setShowSuccess(true);
  resetForm();
} catch (err) {
  console.error(err);
  setErrorMsg("Save failed");
  setShowError(true);
}

  };

  const resetForm = () => {
    setSelectedWorkflow(null);
    setSelectedAction(null);
    setGroups([]);
    setBypassRequest(false);
    setBypassApprover(false);
  };

  return (
    <div className="flex">
      <div className="p-6 w-full">
        {/* Approval Groups Section (not a popup) */}
        <div className="flex flex-col overflow-visible w-full">
          <div className="border rounded-lg p-4 bg-white shadow-sm max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-blue-900">
                Setup workflow
              </h2>
              <button
                onClick={() => setIsActionModalOpen(true)}
                className="text-[#005AE6] font-semibold underline"
              >
                Manage Action
              </button>
            </div>

            {/* Workflow & Action */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Workflow Dropdown */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-black">
                  Workflow
                </label>
                <select
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2"
                  value={selectedWorkflow?.workflow_id || ""}
                  onChange={(e) => {
                    const wf = workflows.find(
                      (w) => w.workflow_id === parseInt(e.target.value, 10)
                    );
                    setSelectedWorkflow(wf || null);
                    setSelectedAction(null);
                  }}
                >
                  <option value="">Select</option>
                  {workflowOptions.map((wf) => (
                    <option key={wf.value} value={wf.value}>
                      {wf.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Dropdown */}
              <div>
                <label className="block text-sm font-semibold mb-1 text-black">
                  Action
                </label>
                <select
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2"
                  value={selectedAction?.value || ""}
                  onChange={(e) => {
                    const act = actionOptions.find(
                      (a) => a.value === parseInt(e.target.value, 10)
                    );
                    setSelectedAction(act || null);
                  }}
                  disabled={!selectedWorkflow}
                >
                  <option value="">Select</option>
                  {actionOptions.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Approval Groups */}
            {selectedAction?.label === "Approve Indent" && (
              <ApprovalGroup
                label="Initiating Indent"
                roleOptions={roleOptions}
                groups={groups}
                setGroups={setGroups}
                bypass={bypassRequest}
                setBypass={setBypassRequest}
              />
            )}

           
              <ApprovalGroup
                label="Indent Approver"
                roleOptions={roleOptions}
                groups={groups}
                setGroups={setGroups}
                bypass={bypassApprover}
                setBypass={setBypassApprover}
              />
            

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                Submit
              </button>
              <button
                onClick={resetForm}
                className="border border-gray-400 px-6 py-2 rounded"
              >
                Cancel
              </button>
            </div>

            <ManageActionModal
              open={isActionModalOpen}
              onClose={() => setIsActionModalOpen(false)}
              onActionsUpdated={() => setActionsUpdated((p) => !p)}
            />
          </div>
        </div>
      </div>
        <ManageActionModal
        open={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        onActionsUpdated={() => setActionsUpdated((p) => !p)}
      />

      {/* Success Popup */}
      {showSuccess && (
        <PopupModal
          type="success"
          title="Success"
          message="Group mapping saved!"
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* Error Popup */}
      {showError && (
        <PopupModal
          type="error"
          title="Error"
          message={errorMsg}
          onClose={() => setShowError(false)}
        />
      )}
    </div>
  );
};

const ApprovalGroup = ({
  label,
  roleOptions,
  groups,
  setGroups,
  bypass,
  setBypass,
}) => (
  <div className="flex items-center mb-4">
    <div className="w-full">
      <label className="block text-sm font-semibold mb-1">{label}</label>
      <Select
        isMulti
        isDisabled={bypass}
        options={roleOptions}
        value={roleOptions.filter((opt) => groups.includes(opt.value))}
        onChange={(selected) =>
          setGroups(selected ? selected.map((opt) => opt.value) : [])
        }
        placeholder="Select Role(s)"
        classNamePrefix="select"
        menuPortalTarget={document.body}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
          menu: (base) => ({ ...base, zIndex: 9999 }),
        }}
      />
    </div>
    <label className="ml-4 flex items-center mt-6">
      <input
        type="checkbox"
        checked={bypass}
        onChange={() => {
          const newVal = !bypass;
          setBypass(newVal);
          if (newVal) setGroups(["bypass"]);
          else setGroups([]);
        }}
        className="mr-2"
      />
      Bypass
    </label>
  </div>
  
);

export default SetupWorkflow;
