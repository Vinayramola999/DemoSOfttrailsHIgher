import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import ConfirmationModal from "../../../NewComponents/ConfirmationModal";
import MessageModal from "../../../NewComponents/MessageModal";
import API_BASE_URL from "../../config/api";

const ACTIONS_API = `${API_BASE_URL}/uniworkflow/get-All/actions?module_name=Customer Relation Management`;
const MODULES_API =
  "https://devapi.softtrails.net/node/demo/uniworkflow/modules/with-submodules";

const ManageActionModal = ({ open, onClose, onActionsUpdated }) => {
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [actions, setActions] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubModule, setSelectedSubModule] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allworkflow, setAllWorkflows] = useState();
  const [descriptionError, setDescriptionError] = useState("");
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

  // Fetch actions
  const fetchActions = async () => {
    try {
      const response = await axios.get(ACTIONS_API);
      const actionsData = response.data?.actions || [];
      setActions(
        Array.isArray(actionsData)
          ? actionsData.map((a) => ({ ...a, enabled: !!a.enabled }))
          : []
      );
    } catch (error) {
      console.error("Failed to fetch actions:", error);
      setActions([]);
    }
  };

  // Fetch workflows
  useEffect(() => {
    if (!selectedSubModule) {
      setAllWorkflows([]);
      setSelectedWorkflow(null);
      return;
    }

    const fetchWorkflows = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}uniworkflow/workflow/get-modules/module`,
          {
            params: {
              module_name: selectedModule?.product_name,  // ✅ dynamic module
              sub_module_name: selectedSubModule.sub_module,
            },
          }
        );

        setAllWorkflows(res.data?.workflows || []);
        setSelectedWorkflow(null);
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
        setAllWorkflows([]);
        setSelectedWorkflow(null);
      }
    };

    fetchWorkflows();
  }, [selectedSubModule]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const moduleRes = await axios.get(MODULES_API);
      const modulesData = moduleRes.data?.data || [];

      const crmModule = modulesData.find(
        (m) => m.module_name?.toLowerCase() === "customer relation management"
      );

      const normalizedModules = modulesData.map((m) => ({
        product_name: m.module_name,
        product_no: m.module_id,
        sub_modules: m.sub_modules || [],
      }));

      setModules(normalizedModules);
      setSelectedModule(
        crmModule
          ? {
            product_name: crmModule.module_name,
            product_no: crmModule.module_id,
            sub_modules: crmModule.sub_modules || [],
          }
          : null
      );
      setSelectedSubModule(null);

      await fetchActions();
    } catch (error) {
      console.error("Error fetching modules/actions:", error);
      setModules([]);
      setActions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
  }, [open]);

  const resetForm = () => {
    setIdentifier("");
    setDescription("");
    setSelectedSubModule(null);
  };

  const handleAdd = () => {
    // Clear previous error
    setDescriptionError("");

    // Check for empty description specifically
    if (!description || description.trim() === "") {
      setDescriptionError("Description is required");
      return;
    }

    // Check for other required fields
    if (!identifier || !selectedSubModule || !selectedWorkflow) {
      setMessageModal({
        message: "Please fill in all required fields.",
        type: "error",
      });
      return;
    }

    // ✅ Duplicate check before proceeding
    const duplicateExists = actions.some(
      (a) =>
        a.action_name?.trim().toLowerCase() === identifier.trim().toLowerCase() &&
        a.workflow_id === selectedWorkflow.workflow_id
    );

    if (duplicateExists) {
      setMessageModal({
        message: `The action "${identifier}" is already linked to this workflow.`,
        type: "error",
      });
      return; // stop here, no API call
    }

    setConfirmationModal({
      isOpen: true,
      title: "Confirm Add Action",
      message: `Action: ${identifier}\nModule: ${selectedModule.product_name}\nSub-Module: ${selectedSubModule.sub_module}\nWorkflow: ${selectedWorkflow.workflow_name}\n\nDo you want to continue?`,
      onConfirm: async () => {

        try {
          setLoading(true);
          await axios.post(
            `${API_BASE_URL}/uniworkflow/actions_workflow`,
            {
              action_name: identifier,
              module_name: selectedModule.product_name,
              sub_module_name: selectedSubModule.sub_module,
              module_id: Number(selectedModule.product_no),
              sub_id: Number(selectedSubModule.sub_id),
              description: description,
              workflow_id: Number(selectedWorkflow.workflow_id),
            }
          );

          await fetchActions();
          resetForm();

          setMessageModal({
            message: `"${identifier}" was added successfully!`,
            type: "success",
          });

          if (onActionsUpdated) onActionsUpdated();
        } catch (err) {
          console.error("Error adding action:", err);
          setMessageModal({
            message: "Could not add the action. Please try again.",
            type: "error",
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-8 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Actions</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-grey-700 hover:text-gray-700 text-xl"
            title="Close"
          >
            ✖
          </button>
        </div>

        {/* Dropdown Section */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/3">
            <label className="font-medium mb-1 block">Module</label>
            <input
              className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              value={selectedModule?.product_name || ""}
              disabled
              readOnly
            />
          </div>

          <div className="w-1/3">
            <label className="font-medium mb-1 block">Sub-Module</label>
            <select
              className="border rounded px-3 py-2 w-full bg-white"
              value={selectedSubModule?.sub_id || ""}
              onChange={(e) =>
                setSelectedSubModule(
                  selectedModule?.sub_modules.find(
                    (sm) => sm.sub_id === e.target.value
                  )
                )
              }
            >
              <option value="">Select</option>
              {selectedModule?.sub_modules.map((sm) => (
                <option key={sm.sub_id} value={sm.sub_id}>
                  {sm.sub_module}
                </option>
              ))}
            </select>
          </div>

          <div className="w-1/3">
            <label className="font-medium mb-1 block">Workflow</label>
            <select
              className="border rounded px-3 py-2 w-full bg-white"
              value={selectedWorkflow?.workflow_id || ""}
              disabled={!selectedSubModule}
              onChange={(e) => {
                const wf = allworkflow.find(
                  (wf) => wf.workflow_id === Number(e.target.value)
                );
                setSelectedWorkflow(wf || null);
              }}
            >
              <option value="">Select</option>
              {allworkflow?.map((wf) => (
                <option key={wf.workflow_id} value={wf.workflow_id}>
                  {wf.workflow_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Add Action Section */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex flex-col w-1/3">
            <label className="font-medium mb-1">Action</label>
            <select
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="border rounded px-4 py-2 bg-white"
            >
              <option value="">Select Action</option>

              {/* ✅ If submodule is Sales Management → show ONLY these actions */}
              {selectedSubModule?.sub_module
                ?.toLowerCase()
                ?.replace(/\s+/g, "") === "salesmanagement" ? (
                <>
                  <option value="Add Lead">Add Lead</option>
                  <option value="Approve Lead">Approve Lead</option>
                  <option value="Update KAM">Update KAM</option>
                  <option value="Indent Approval">Indent Approval</option>
                  <option value="Quotation Approval">Quotation Approval</option>
                </>
              ) : (
                <>
                  {/* ✅ Otherwise show CRM actions */}
                  <option value="Add Customer">Add Customer</option>
                  <option value="Approve Customer">Approve Customer</option>
                  <option value="Update Customer">Update Customer</option>
                </>
              )}
            </select>


          </div>

          <div className="flex flex-col w-2/3">
            <div className="flex justify-between">
              <label className="font-medium mb-1">Description</label>{descriptionError && (
                <span className="text-red-500 text-sm mt-1">{descriptionError}</span>
              )}
            </div>
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descriptionError) setDescriptionError(""); // Clear error on input
              }}
              className={`border rounded px-4 py-2 ${descriptionError ? 'border-red-500' : ''}`}
              required
            />
          </div>

          <button
            onClick={handleAdd}
            className="ml-2 mt-6 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full w-12 flex aspect-square items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            title="Add"
            disabled={loading || !identifier}
          >
            🡪
          </button>
        </div>

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

export default ManageActionModal;
