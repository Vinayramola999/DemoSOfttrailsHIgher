// ✅ SetupWorkflow.jsx (FINAL with Sales Initiator + role filter)

import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import Swal from "sweetalert2";
import ManageActionModal from "./ManageActionModal";
import ConfirmationModal from "../../../NewComponents/ConfirmationModal";
import MessageModal from "../../../NewComponents/MessageModal";
import API_BASE_URL from "../../config/api";

const SetupWorkflow = () => {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

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

  // Modal states
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [messageModal, setMessageModal] = useState({
    message: "",
    type: "",
  });

  // Fetch roles once
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get(`${API_BASE_URL}/role`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(data || []);
        setRoleOptions(
          (data || [])
            .filter((role) => role.role !== "Initiator")
            .map((role) => ({
              value: role.role,
              label: role.role,
            }))
        );
      } catch (error) {
        console.error("Failed to fetch roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // Fetch workflows
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(
          `${API_BASE_URL}uniworkflow/workflow/get-modules/module`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { module_name: "Customer Relation Management" },
          }
        );
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

  // Fetch actions when workflow changes
  useEffect(() => {
    if (!selectedWorkflow) return;

    const fetchActions = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(
          `${API_BASE_URL}/uniworkflow/actions/get-workflow`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              workflow_name: selectedWorkflow.workflow_name,
              workflow_id: selectedWorkflow.workflow_id,
            },
          }
        );

        let acts = data?.workflow?.actions || [];

        // ✅ SALES FILTER (NO LOGIC REMOVED, ONLY ADDED)
        const submoduleNorm =
          selectedWorkflow?.sub_module_name
            ?.toLowerCase()
            ?.replace(/\s+/g, "") || "";

        if (submoduleNorm === "salesmanagement") {
          const allow = ["approvelead", "addlead", "updatekam", "indentapproval", "quotationapproval"];
          acts = acts.filter((a) =>
            allow.includes(a?.action_name?.toLowerCase()?.replace(/\s+/g, ""))
          );
        }

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

  // ✅ Sales Action Identifier
  const isSalesAction =
    ["approvelead", "addlead", "updatekam", "indentapproval", "quotationapproval"].includes(
      selectedAction?.label?.toLowerCase()?.replace(/\s+/g, "")
    );

  // ✅ Sales Initiator allowed roles
  const salesInitiatorRoles = roleOptions.filter((r) =>
    ["approver", "developer", "admin"].includes(
      r.value?.toLowerCase()?.replace(/\s+/g, "")
    )
  );

  // Submit
  const handleSubmit = () => {
    if (!selectedWorkflow || !selectedAction) {
      setMessageModal({
        message: "Please select workflow, action, and groups",
        type: "error",
      });
      return;
    }

    setConfirmationModal({
      isOpen: true,
      title: "Setup Workflow",
      message: "Are you sure you want to save this workflow configuration?",
      onConfirm: async () => {
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
          await axios.put(`${API_BASE_URL}/uniworkflow/group`, payload);
          setMessageModal({
            message: "Group mapping saved successfully!",
            type: "success",
          });
          resetForm();
        } catch (err) {
          const status = err?.response?.status;
          const msg =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            "";

          const looksLikeDuplicate =
            status === 409 || /exist/i.test(msg) || /duplicate/i.test(msg);

          if (looksLikeDuplicate) {
            setMessageModal({
              message: msg && /exist/i.test(msg)
                ? msg
                : "This workflow → action → group mapping already exists.",
              type: "error",
            });
          } else {
            setMessageModal({
              message: "Save failed",
              type: "error",
            });
          }
        }
      },
    });
  };

  const resetForm = () => {
    setSelectedWorkflow(null);
    setSelectedAction(null);
    setGroups([]);
    setBypassRequest(false);
    setBypassApprover(false);
  };

  return (
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


        {/* Workflow + Action selection */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
                // Reset groups and bypass states when action changes
                setGroups([]);
                setBypassRequest(false);
                setBypassApprover(false);
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

        {/* ✅ SALES ACTION → ONLY INITIATOR */}
        {isSalesAction && (
          <ApprovalGroup
            label="Initiator"
            roleOptions={salesInitiatorRoles}
            groups={groups}
            setGroups={setGroups}
            bypass={bypassRequest}
            setBypass={setBypassRequest}
          />
        )}

        {/* ✅ CUSTOMER ACTIONS (your logic unchanged) */}
        {!isSalesAction && selectedAction?.label === "Add Customer" && (
          <ApprovalGroup
            label="Initiating Customer"
            roleOptions={roleOptions}
            groups={groups}
            setGroups={setGroups}
            bypass={bypassRequest}
            setBypass={setBypassRequest}
          />
        )}

        {!isSalesAction && selectedAction?.label === "Approve Customer" && (
          <ApprovalGroup
            label="Customer Approver"
            roleOptions={roleOptions}
            groups={groups}
            setGroups={setGroups}
            bypass={bypassApprover}
            setBypass={setBypassApprover}
          />
        )}

        {!isSalesAction && selectedAction?.label === "Update Customer" && (
          <ApprovalGroup
            label="Update Approver"
            roleOptions={roleOptions}
            groups={groups}
            setGroups={setGroups}
            bypass={bypassApprover}
            setBypass={setBypassApprover}
          />
        )}

        <div className="flex gap-4 mt-6">
          <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded">
            Submit
          </button>
          <button onClick={resetForm} className="border border-gray-400 px-6 py-2 rounded">
            Cancel
          </button>
        </div>

        <ManageActionModal
          open={isActionModalOpen}
          onClose={() => setIsActionModalOpen(false)}
          onActionsUpdated={() => setActionsUpdated((p) => !p)}
        />

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        />

        {/* Message Modal */}
        <MessageModal
          message={messageModal.message}
          type={messageModal.type}
          setMessage={(msg) => setMessageModal(prev => ({ ...prev, message: msg }))}
        />
      </div>
    </div>
  );
};

// ✅ ApprovalGroup component (unchanged)
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
