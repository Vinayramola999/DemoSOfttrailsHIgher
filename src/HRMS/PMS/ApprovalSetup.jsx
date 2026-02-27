import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import Swal from "sweetalert2";
import ManageActionModal from "./ManageActionModal";
import ApprovalGroup from "../../NewComponents/ApprovalGroup";

function ApprovalSetup() {
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedVertical, setSelectedVertical] = useState(null);
  // Departments and Verticals state
  const [departments, setDepartments] = useState([]);
  const [verticals, setVerticals] = useState([]);

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
  const [groups, setGroups] = useState([{ role: null }]);

  // Bypass states
  const [bypassRequest, setBypassRequest] = useState(false);
  const [bypassApprover, setBypassApprover] = useState(false);

  const [actionsUpdated, setActionsUpdated] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  // Fetch roles once
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const { data } = await axios.get("https://devdemo.softtrails.net/role", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoles(data || []);
        setRoleOptions(
          (data || []).map((role) => ({
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

  // Fetch workflows once
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const { data } = await axios.get(
          "https://devdemo.softtrails.net/uniworkflow/workflow/get-modules/module",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { module_name: "Human Resource Management" },
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
          "https://devdemo.softtrails.net/uniworkflow/actions/get-workflow",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              workflow_name: selectedWorkflow.workflow_name,
              workflow_id: selectedWorkflow.workflow_id,
            },
          }
        );
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
  // ===================== DEPARTMENT + VERTICAL LOGIC =====================

  // Fetch departments on load
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const res = await axios.get("https://devdemo.softtrails.net/departments", {
          headers,
        });

        setDepartments(res.data || []);
      } catch (error) {
        console.error("Failed to fetch departments", error);
      }
    };
    fetchDepartments();
  }, []);

  const deptOptions = departments.map((d) => ({
    value: d.dept_id,
    label: d.dept_name,
  }));

  // Fetch verticals on department change
  const handleDepartmentChange = async (selectedDept) => {
    setSelectedDepartment(selectedDept);
    setVerticals([]);
    setSelectedVertical(null);

    if (!selectedDept) return;

    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        `https://devdemo.softtrails.net/sub_dept/get/${selectedDept.value}`,
        { headers }
      );

      setVerticals(res.data || []);
    } catch (error) {
      console.error("Failed to fetch verticals", error);
    }
  };

  const verticalOptions = verticals.map((v) => ({
    value: v.sub_id,
    label: v.sub_dept_name,
  }));

  // Submit
  const handleSubmit = async () => {
    if (!selectedWorkflow || !selectedAction) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please select workflow, action, and group",
      });
      return;
    }

    // Get group names as string array
    const groupNames = groups.map((g) => g.role?.value).filter(Boolean);

    if (groupNames.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Group",
        text: "Please select at least one role",
      });
      return;
    }
    // const mappingPayloads =[{

    //  selectedVertical.map((v) => ({
    // workflow_id: Number(selectedWorkflow.workflow_id),
    // dept_id: Number(selectedDepartment.value),
    // sub_id: Number(selectedVertical.value),  }]
    // }));

    const mappingPayloads = {
      workflow_id: Number(selectedWorkflow.workflow_id),
      dept_id: Number(selectedDepartment.value),
      sub_id: Number(selectedVertical.value),
    };

    const payload = [
      {
        module_name: selectedWorkflow.module_name,
        sub_module_name: selectedWorkflow.sub_module_name,
        module_id: Number(selectedWorkflow.module_id),
        sub_id: Number(selectedWorkflow.sub_id),
        action_name: selectedAction.data?.action_name || selectedAction.label,
        workflow_id: Number(selectedWorkflow.workflow_id),
        group_names: groups.map((g) => g.role?.label).filter(Boolean),
        department_id: selectedDepartment
          ? Number(selectedDepartment.value)
          : null,
      },
    ];

    try {
      console.log("Payload to submit:", mappingPayloads);
      await axios.put("https://devdemo.softtrails.net/uniworkflow/group", payload, {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      });
      // -------- SECOND API CALL (Workflow → Dept → Sub Dept mapping) --------
      if (selectedDepartment && selectedVertical.length > 0) {
        for (const payload of mappingPayloads) {
      await axios.post(
        "https://devdemo.softtrails.net/pms/workflow-dept-sub_id-mapping",
        mappingPayloads,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
        }
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Group mapping saved!",
        timer: 1500,
        showConfirmButton: false,
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
        Swal.fire({
          icon: "info",
          title: "Already Exists",
          text:
            msg && /exist/i.test(msg)
              ? msg
              : "This workflow → action → group mapping already exists.",
          confirmButtonText: "OK",
        });
      } else {
        console.error(err);
        Swal.fire({ icon: "error", title: "Error", text: "Save failed" });
      }
    }
  };

  const resetForm = () => {
    setSelectedWorkflow(null);
    setSelectedAction(null);
    setGroups([{ role: null }]);
    setBypassRequest(false);
    setBypassApprover(false);
  };
  return (
    <>
      <div className="flex flex-col overflow-visible w-full">
        <div className="border rounded-lg p-4 bg-white shadow-sm max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setIsPopupOpen(true)}
                className="bg-[#005AE6] text-white px-5 py-2 rounded-lg                                                                                                                "
              >
                Setup Workflow
              </button>

              <button
                onClick={() => setIsActionModalOpen(true)}
                className="text-[#005AE6] font-semibold underline"
              >
                Manage Action
              </button>
            </div>
          </div>

          {/* Workflow & Action */}

          <ManageActionModal
            open={isActionModalOpen}
            onClose={() => setIsActionModalOpen(false)}
            onActionsUpdated={() => setActionsUpdated((p) => !p)}
          />
        </div>
      </div>
      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-3xl rounded-xl shadow-lg p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Setup Workflow Mapping
              </h3>
              <button
                onClick={() => setIsPopupOpen(false)}
                className="text-gray-500 hover:text-black text-xl"
              >
                ×
              </button>
            </div>

            {/* Workflow + Action */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Workflow</label>
                <Select
                  options={workflowOptions.map((w) => ({
                    value: w.value,
                    label: w.label,
                  }))}
                  value={
                    workflowOptions
                      .map((w) => ({ value: w.value, label: w.label }))
                      .find(
                        (opt) => opt.value === selectedWorkflow?.workflow_id
                      ) || null
                  }
                  onChange={(selected) => {
                    const wf = workflows.find(
                      (w) => w.workflow_id === selected?.value
                    );
                    setSelectedWorkflow(wf || null);
                    setSelectedAction(null);
                  }}
                  placeholder="Select Workflow"
                  isClearable
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Action</label>
                <Select
                  options={actionOptions}
                  value={selectedAction}
                  onChange={setSelectedAction}
                  placeholder="Select Action"
                  isClearable
                  className="text-sm"
                />
              </div>
            </div>

            {/* Department + Vertical */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium">Department</label>
                <Select
                  options={deptOptions}
                  value={selectedDepartment}
                  onChange={handleDepartmentChange}
                  placeholder="Select Department"
                
                  isClearable
                  className="text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Vertical</label>
                <Select
                  options={verticalOptions}
                  value={selectedVertical}
                  onChange={setSelectedVertical}
                  isDisabled={!selectedDepartment}
                  placeholder="Select Sub-Department"
                  isClearable
                  
                  className="text-sm"
                />
              </div>
            </div>

            {/* Approval Group INSIDE POPUP */}
            {selectedAction && (
              <ApprovalGroup
                label={selectedAction.label}
                roleOptions={roleOptions}
                groups={groups}
                setGroups={setGroups}
                bypass={bypassApprover}
                setBypass={setBypassApprover}
              />
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsPopupOpen(false)}
                className="border px-4 py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await handleSubmit();
                  setIsPopupOpen(false);
                }}
                className="bg-[#005AE6] text-white px-6 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
// const ApprovalGroup = ({
//   label,
//   roleOptions,
//   groups,
//   setGroups,
//   bypass,
//   setBypass,
// }) => (
//   <div className="flex items-center mb-4">
//     <div className="w-full">
//       <label className="block text-sm font-semibold mb-1">{label}</label>
//       <Select
//         isMulti
//         isDisabled={bypass}
//         options={roleOptions}
//         value={roleOptions.filter((opt) => groups.includes(opt.value))}
//         onChange={(selected) =>
//           setGroups(selected ? selected.map((opt) => opt.value) : [])
//         }
//         placeholder="Select Role(s)"
//         classNamePrefix="select"
//         menuPortalTarget={document.body}
//         styles={{
//           menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//           menu: (base) => ({ ...base, zIndex: 9999 }),
//         }}
//       />
//     </div>
//     <label className="ml-4 flex items-center mt-6">
//       <input
//         type="checkbox"
//         checked={bypass}
//         onChange={() => {
//           const newVal = !bypass;
//           setBypass(newVal);
//           if (newVal) setGroups(["bypass"]);
//           else setGroups([]);
//         }}
//         className="mr-2"
//       />
//       Bypass
//     </label>
//   </div>
// );

export default ApprovalSetup;
