// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";

// const ACTIONS_API =
//   "https://devdemo.softtrails.net/uniworkflow/get-All/actions?module_name=Customer Relation Management";
// const MODULES_API =
//   "https://devdemo.softtrails.net/uniworkflow/modules/with-submodules";

// const ManageActionModal = ({ open, onClose, onActionsUpdated }) => {
//   const [identifier, setIdentifier] = useState("");
//   const [description, setDescription] = useState("");
//   const [actions, setActions] = useState([]);
//   const [modules, setModules] = useState([]);
//   const [selectedModule, setSelectedModule] = useState(null);
//   const [selectedSubModule, setSelectedSubModule] = useState(null);
//   const [selectedWorkflow, setSelectedWorkflow] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [allworkflow, setAllWorkflows] = useState();

//   // Fetch actions
//   const fetchActions = async () => {
//     try {
//       const response = await axios.get(ACTIONS_API);
//       const actionsData = response.data?.actions || [];
//       setActions(
//         Array.isArray(actionsData)
//           ? actionsData.map((a) => ({ ...a, enabled: !!a.enabled }))
//           : []
//       );
//     } catch (error) {
//       console.error("Failed to fetch actions:", error);
//       setActions([]);
//     }
//   };

//   // Fetch workflows
//   useEffect(() => {
//     if (!selectedSubModule) {
//       setAllWorkflows([]);
//       setSelectedWorkflow(null);
//       return;
//     }

//     const fetchWorkflows = async () => {
//       try {
//         const res = await axios.get(
//           `https://devdemo.softtrails.net/uniworkflow/workflow/get-modules/module`,
//           {
//             params: {
//               module_name: "Customer Relation Management",
//               sub_module_name: selectedSubModule.sub_module,
//             },
//           }
//         );
//         setAllWorkflows(res.data?.workflows || []);
//         setSelectedWorkflow(null);
//       } catch (error) {
//         console.error("Failed to fetch workflows:", error);
//         setAllWorkflows([]);
//         setSelectedWorkflow(null);
//       }
//     };

//     fetchWorkflows();
//   }, [selectedSubModule]);

//   const fetchData = async () => {
//     setLoading(true);
//     try {
//       const moduleRes = await axios.get(MODULES_API);
//       const modulesData = moduleRes.data?.data || [];

//       const crmModule = modulesData.find(
//         (m) => m.module_name?.toLowerCase() === "customer relation management"
//       );

//       const normalizedModules = modulesData.map((m) => ({
//         product_name: m.module_name,
//         product_no: m.module_id,
//         sub_modules: m.sub_modules || [],
//       }));

//       setModules(normalizedModules);
//       setSelectedModule(
//         crmModule
//           ? {
//               product_name: crmModule.module_name,
//               product_no: crmModule.module_id,
//               sub_modules: crmModule.sub_modules || [],
//             }
//           : null
//       );
//       setSelectedSubModule(null);

//       await fetchActions();
//     } catch (error) {
//       console.error("Error fetching modules/actions:", error);
//       setModules([]);
//       setActions([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (open) fetchData();
//   }, [open]);

//   const resetForm = () => {
//     setIdentifier("");
//     setDescription("");
//     setSelectedSubModule(null);
//   };

//   const handleAdd = async () => {
//     if (
//       !identifier ||
//       !description ||
//       !selectedSubModule ||
//       !selectedWorkflow
//     ) {
//       Swal.fire({
//         icon: "warning",
//         title: "Missing Fields",
//         text: "Please fill in all required fields.",
//       });
//       return;
//     }

//     // ✅ Duplicate check before proceeding
//     const duplicateExists = actions.some(
//       (a) =>
//         a.action_name?.trim().toLowerCase() ===
//           identifier.trim().toLowerCase() &&
//         a.workflow_id === selectedWorkflow.workflow_id
//     );

//     if (duplicateExists) {
//       Swal.fire({
//         icon: "info",
//         title: "Action Already Exists",
//         text: `The action "${identifier}" is already linked to this workflow.`,
//         confirmButtonColor: "#005AE6",
//       });
//       return; // stop here, no API call
//     }

//     const confirm = await Swal.fire({
//       icon: "question",
//       title: "Confirm Add Action",
//       html: `
//       <b>Action:</b> ${identifier}<br/>
//       <b>Module:</b> ${selectedModule.product_name}<br/>
//       <b>Sub-Module:</b> ${selectedSubModule.sub_module}<br/>
//       <b>Workflow:</b> ${selectedWorkflow.workflow_name}<br/>
//       Do you want to continue?
//     `,
//       showCancelButton: true,
//       confirmButtonText: "Yes, Add it",
//       cancelButtonText: "Cancel",
//     });

//     if (!confirm.isConfirmed) return;

//     try {
//       setLoading(true);
//       await axios.post(
//         "https://devdemo.softtrails.net/uniworkflow/actions_workflow",
//         {
//           action_name: identifier,
//           module_name: selectedModule.product_name,
//           sub_module_name: selectedSubModule.sub_module,
//           module_id: Number(selectedModule.product_no),
//           sub_id: Number(selectedSubModule.sub_id),
//           description: description,
//           workflow_id: Number(selectedWorkflow.workflow_id),
//         }
//       );

//       await fetchActions();
//       resetForm();

//       Swal.fire({
//         icon: "success",
//         title: "Action Added",
//         text: `"${identifier}" was added successfully!`,
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       if (onActionsUpdated) onActionsUpdated();
//     } catch (err) {
//       console.error("Error adding action:", err);
//       Swal.fire({
//         icon: "error",
//         title: "Failed",
//         text: "Could not add the action. Please try again.",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl w-full max-w-3xl p-8 relative">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-bold">Manage Actions</h2>
//           <button
//             onClick={() => {
//               resetForm();
//               onClose();
//             }}
//             className="text-grey-700 hover:text-gray-700 text-xl"
//             title="Close"
//           >
//             ✖
//           </button>
//         </div>

//         {/* Dropdown Section */}
//         <div className="flex gap-4 mb-4">
//           <div className="w-1/3">
//             <label className="font-medium mb-1 block">Module</label>
//             <input
//               className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
//               value={selectedModule?.product_name || ""}
//               disabled
//               readOnly
//             />
//           </div>

//           <div className="w-1/3">
//             <label className="font-medium mb-1 block">Sub-Module</label>
//             <select
//               className="border rounded px-3 py-2 w-full bg-white"
//               value={selectedSubModule?.sub_id || ""}
//               onChange={(e) =>
//                 setSelectedSubModule(
//                   selectedModule?.sub_modules.find(
//                     (sm) => sm.sub_id === e.target.value
//                   )
//                 )
//               }
//             >
//               <option value="">Select</option>
//               {selectedModule?.sub_modules.map((sm) => (
//                 <option key={sm.sub_id} value={sm.sub_id}>
//                   {sm.sub_module}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="w-1/3">
//             <label className="font-medium mb-1 block">Workflow</label>
//             <select
//               className="border rounded px-3 py-2 w-full bg-white"
//               value={selectedWorkflow?.workflow_id || ""}
//               disabled={!selectedSubModule}
//               onChange={(e) => {
//                 const wf = allworkflow.find(
//                   (wf) => wf.workflow_id === Number(e.target.value)
//                 );
//                 setSelectedWorkflow(wf || null);
//               }}
//             >
//               <option value="">Select</option>
//               {allworkflow?.map((wf) => (
//                 <option key={wf.workflow_id} value={wf.workflow_id}>
//                   {wf.workflow_name}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         {/* Add Action Section */}
//         <div className="flex items-center gap-4 mb-8">
//           <div className="flex flex-col w-1/3">
//             <label className="font-medium mb-1">Action</label>
//             <select
//               value={identifier}
//               onChange={(e) => setIdentifier(e.target.value)}
//               className="border rounded px-4 py-2 bg-white"
//             >
//               <option value="">Select Action</option>
//               <option value="Add Customer">Add Customer</option>
//               <option value="Approve Customer">Approve Customer</option>
//               <option value="Update Customer">Update Customer</option>
//             </select>
//           </div>

//           <div className="flex flex-col w-2/3">
//             <label className="font-medium mb-1">Description</label>
//             <input
//               type="text"
//               placeholder="Description"
//               value={description}
//               onChange={(e) => setDescription(e.target.value)}
//               className="border rounded px-4 py-2"
//             />
//           </div>

//           <button
//             onClick={handleAdd}
//             className="ml-2 mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 aspect-square flex items-center justify-center text-2xl"
//             title="Add"
//             disabled={loading || !identifier || !description}
//           >
//             ➔
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageActionModal;

import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import PopupModal from "../../NewComponents/PopUpmodal";
// import PopupModal from "../PopupModal";
// import API from "../../config/api";
const WORKFLOW_API = process.env.REACT_APP_API_BASE_URL;
// Use centralized workflow API from env
const MODULES_API = `${WORKFLOW_API}/uniworkflow/modules/with-submodules`;
const ACTIONS_API = `${WORKFLOW_API}/uniworkflow/get-All/actions?module_name=Human Resource Management`;

const ManageActionModal = ({ open, onClose, onActionsUpdated }) => {
  const [identifier, setIdentifier] = useState("");
  const [description, setDescription] = useState("");
  const [actions, setActions] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedSubModule, setSelectedSubModule] = useState(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [allworkflow, setAllWorkflows] = useState();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const actionOptions = [
    { value: "SetUpAnnualGoal", label: "Set Up Annual Goal" },
    { value: "Visibility", label: "Visibility" },
  ];

  // touch `modules` so linters don't complain about unused state (keeps value available during debugging)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("ManageActionModal modules loaded:", modules);
  }, [modules]);

  const fetchActions = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const response = await axios.get(ACTIONS_API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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

  // Fetch workflows whenever submodule changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!selectedSubModule) {
      setAllWorkflows([]);
      setSelectedWorkflow(null);
      return;
    }

    fetchWorkflows();
  }, [selectedSubModule]);

  const fetchWorkflows = async () => {
    try {
      const token = sessionStorage.getItem("token");

      const res = await axios.get(
        `${WORKFLOW_API}/uniworkflow/workflow/get-modules/module`,
        {
          params: {
            // prefer selectedModule.module_name when available
            module_name:
              selectedModule?.module_name || "Human Resource Management",
            sub_module_name: selectedSubModule?.sub_module,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Fetched workflows:", res.data);

      setAllWorkflows(res.data?.workflows || []);
      setSelectedWorkflow(null); // reset selection
    } catch (error) {
      console.error("Failed to fetch workflows:", error);
      setAllWorkflows([]);
      setSelectedWorkflow(null);
    }
  };

  useEffect(() => {
    if (!open) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem("token");

        // ✅ Add token in headers for modules API
        const moduleRes = await axios.get(MODULES_API, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // API may return { data: [...] } or an array directly. Prefer data.data when present.
        const modulesData = moduleRes.data?.data || moduleRes.data || [];

        // Find the "Purchase Management" module using the API field name 'module_name'
        const hrmsModule = modulesData.find(
          (m) =>
            m.module_name?.trim().toLowerCase() === "human resource management"
        );

        setSelectedModule(hrmsModule || null);

        setModules(modulesData);
        setSelectedModule(hrmsModule || null);
        setSelectedSubModule(null);

        // ✅ Fetch actions (this function should already include the token)
        await fetchActions();
      } catch (error) {
        console.error("Error fetching modules/actions:", error);
        setModules([]);
        setActions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [open]);

  // Add new action
  const handleAdd = async () => {
    if (
      !identifier ||
      !description ||
      !selectedSubModule ||
      !selectedWorkflow
    ) {
      setErrorMsg("Please fill in all required fields.");
      setShowError(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmAdd = async () => {
    setShowConfirm(false);
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");

      await axios.post(
        `${WORKFLOW_API}/uniworkflow/actions_workflow`,
        {
          action_name: identifier,
          // Use module_name/module_id keys from API
          module_name: selectedModule?.module_name,
          sub_module_name: selectedSubModule?.sub_module,
          module_id: Number(
            selectedModule?.module_id || selectedModule?.module_id
          ),
          sub_id: Number(selectedSubModule?.sub_id),
          description: description,
          workflow_id: Number(selectedWorkflow?.workflow_id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchActions();
      resetForm();
      setShowSuccess(true);

      if (onActionsUpdated) onActionsUpdated();
    } catch (err) {
      console.error("Error adding action:", err);
      setErrorMsg("Could not add the action.");
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  const resetForm = () => {
    setIdentifier("");
    setDescription("");
    setSelectedSubModule(null);
  };

  const handleToggle = (uuid) => {
    setActions((prev) =>
      prev.map((a) =>
        a.action_uuid === uuid ? { ...a, enabled: !a.enabled } : a
      )
    );
  };

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
            className="text-red-700 hover:text-gray-700 text-xl"
            title="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="red"
              className="size-8"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Module + Submodule  + Workflow Dropdown */}
        <div className="flex gap-4 mb-4">
          <div className="w-1/3">
            <label className="font-medium mb-1 block">Module</label>
            <input
              className="border rounded px-3 py-2 w-full bg-gray-100 text-gray-500 cursor-not-allowed"
              value={selectedModule?.module_name || ""}
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
                    (sm) => String(sm.sub_id) === String(e.target.value)
                  )
                )
              }
            >
              <option value="">Select</option>{" "}
              {/* 👈 shown when submodule is null */}
              {selectedModule?.sub_modules?.map((sm) => (
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
              disabled={!selectedSubModule} // 🔹 disable until submodule selected
              onChange={(e) => {
                const wf = allworkflow.find(
                  (wf) => wf.workflow_id === Number(e.target.value) // 🔹 cast to number
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

        {/* Add Action Inputs */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex flex-col w-1/3">
            <label className="font-medium mb-1">Action Name</label>
            <Select
              options={actionOptions}
              value={actionOptions.find(
                (option) => option.value === identifier
              )}
              onChange={(selectedOption) =>
                setIdentifier(selectedOption ? selectedOption.value : "")
              }
              placeholder="Select Action"
              className="text-sm"
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "6px",
                  padding: "2px",
                  borderColor: "#d1d5db", // Tailwind's gray-300
                  boxShadow: "none",
                  "&:hover": { borderColor: "#9ca3af" }, // Tailwind's gray-400
                }),
              }}
            />
          </div>
          <div className="flex flex-col w-2/3">
            <label className="font-medium mb-1">Description</label>
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border rounded px-4 py-2"
            />
          </div>
          <button
            onClick={handleAdd}
            className="ml-2 mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 aspect-square flex items-center justify-center text-2xl"
            title="Add"
          >
            ➔
          </button>
        </div>

        {/* Actions List with Scroll */}
        {/* <div className="max-h-[350px] overflow-y-auto space-y-4 pr-1 scrollbar">
          {loading ? (
            <div className="py-8 text-center text-gray-400">Loading...</div>
          ) : actions.length === 0 ? (
            <div className="py-8 text-center text-gray-400">
              No actions found.
            </div>
          ) : (
            actions.map((action) => (
              <div
                key={action.action_uuid}
                className="border-b border-gray-200 py-4 px-2 space-y-2"
              >
                <hr className="border-black" />
                <div className="font-semibold text-lg text-black">
                  {action.action_name || "Action Name"}
                </div>
                <div className="flex justify-between items-center mt-1">
                  <div className="text-gray-700 text-sm leading-snug flex-1 pr-4">
                    {action.description ||
                      "No description provided for this action."}
                  </div> */}

        {/* Toggle */}
        {/* <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={!action.enabled}
                      onChange={() => handleToggle(action.action_uuid)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-600 transition-colors duration-300"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white border rounded-full transition-transform duration-300 transform peer-checked:translate-x-full"></div>
                  </label>
                </div>
              </div>
            ))
          )}
        </div> */}
        {showConfirm && (
          <PopupModal
            type="confirm"
            title="Confirm Add Action"
            message="Are you sure you?"
            onConfirm={handleConfirmAdd}
            onCancel={() => setShowConfirm(false)}
            onClose={() => setShowConfirm(false)}
          />
        )}

        {showSuccess && (
          <PopupModal
            type="success"
            title="Action Added"
            message="Action was added successfully!"
            onClose={() => setShowSuccess(false)}
          />
        )}
        {showError && (
          <PopupModal
            type="error"
            title="Error!"
            message={errorMsg}
            onClose={() => setShowError(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ManageActionModal;
