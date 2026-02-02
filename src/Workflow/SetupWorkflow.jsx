import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoIosCloseCircle } from "react-icons/io";
import { MdDelete, MdClose } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";
import SearchableDropdown from "./SearchableDropdown";

export default function SetupWorkflow() {
  const BASE_URL = process.env.REACT_APP_API_URL_Workflow;
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [userModal, setUserModal] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [description, setDescription] = useState("");
  const [ModuleName, setModuleName] = useState("");
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [module, setModule] = useState([]);
  const [moduleId, setModuleId] = useState("");
  const [subModuleId, setSubModuleId] = useState("");
  const [workflow, setWorkflow] = useState([]);
  const [submodulename, setSubmodulename] = useState("");
  const [workflows, setWorkflows] = useState([]);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [userData, setUserData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [showApprovalGroupModal, setShowApprovalGroupModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");

  const baseUrlu = process.env.REACT_APP_URL_users || '';

  //for assigned users
  useEffect(() => {
    const ids = assignedUsers.map((user) => user.user_id);
    setSelectedUserIds(ids); // auto-select in dropdown
  }, [assignedUsers]);

  // Fetch assigned users for a specific workflow
  const fetchAssignedUsers = async (workflowId) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}uniworkflow/userworkflows/present-users/${workflowId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch users");

      const result = await response.json();
      console.log("API Result:", result);

      // Always set an array safely
      setAssignedUsers(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Fetch error:", error);
      setAssignedUsers([]); // fallback to empty array on error
    }
  };

  // Get user data from session storage
  React.useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (userId && token) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `${baseUrlu}/users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data) {
            setUserData(response.data);
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    } else {
      console.error("User ID or token is missing");
    }
  }, []);

  // Fetch user data
  const fetchAvailableUsers = async (workflowId) => {
    try {
      if (!workflowId) {
        console.warn("No workflowId provided");
        return [];
      }

      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}uniworkflow/userworkflows/available-users/${workflowId}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch available users");
      }
      const data = await response.json();
      console.log("thisisdata", data);
      setAvailableUsers(data.users);
      return data.users || [];
    } catch (error) {
      console.error("Error fetching available users:", error);
      return [];
    }
  };

  console.log("availableusers", availableUsers);

  // Fetch Modules from backend
  const fetchModule = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Token does not exist.");
        return;
      }

      const response = await axios.get(
        `${BASE_URL}uniworkflow/modules/with-submodules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response) {
        setModule(response.data.data);
        console.log("Modules fetched:", response.data.data);
      } else {
        setModule([]);
      }
    } catch (error) {
      console.error("Failed to fetch modules:", error);
      setError("Failed to fetch modules.");
      setModule([]);
    }
  };

  useEffect(() => {
    fetchModule();
  }, []);

  // Fetch workflows from backend
  const fetchWorkflows = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Token does not exist.");
        return;
      }
      const response = await axios.get(
        `${BASE_URL}uniworkflow/workflow`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (Array.isArray(response.data)) {
        setWorkflows(response.data);
      } else {
        setWorkflows([]);
      }
    } catch (error) {
      setError("Failed to fetch workflows.");
      setWorkflows([]);
    }
  };
  useEffect(() => {
    fetchWorkflows();
  }, []);

  // POST selected user IDs for save changes
  const submitUserAssignments = async () => {
    const confirmResult = await Swal.fire({
      title: "Confirm?",
      text: "Are you sure you want to save these changes?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, submit it!",
    });
    if (!confirmResult.isConfirmed) return;
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        Swal.fire("Error!", "Token does not exist.", "error");
        return;
      }

      // 1. PUT: Update workflow with user assignments
      Swal.fire({
        title: "Success!",
        text: "your workflow has been updated with the selected users.",
        icon: "success",
        confirmButtonText: "Continue",
      }).then((result) => {
        if (result.isConfirmed) {
          setShowApprovalGroupModal(true);
        }
      });
      setShowEditModal(false);
      fetchWorkflows(); // refresh data
    } catch (error) {
      console.error("Submit error:", error.response.data.error);
      Swal.fire("Error!", error.response.data.error, "error");
    }
  };

  // Fetch workflow names through module ID
  const fetchWorkflow = async (sub_module) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `${BASE_URL}uniworkflow/workflow/get-modules/module?module_name=${ModuleName}&sub_module_name=${sub_module}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      if (!response.ok) throw new Error("Failed to fetch workflows");

      const data = await response.json();
      if (Array.isArray(data.workflows)) {
        setWorkflow(data.workflows);
        console.log("Fetched workflows:", data.workflows);
      } else {
        setWorkflow([]);
      }
    } catch (error) {
      console.error("Error fetching workflows:", error);
      setWorkflow([]);
    }
  };

  // Add workflow
  const handleAddWorkflow = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Token does not exist.");
        return;
      }

      const payload = {
        workflow_name: workflowName,
        description: description,
        module_name: ModuleName,
        module_id: Number(moduleId),
        sub_module_name: submodulename,
        sub_id: Number(subModuleId),
        created_by: Number(sessionStorage.getItem("userId")),
      };

      console.log("payload: ", payload);

      const response = await axios.post(
        `${BASE_URL}uniworkflow/workflow`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      if (
        result.message &&
        result.message.toLowerCase().includes("workflow created")
      ) {
        const wf = result.Workflow || {};
        Swal.fire({
          icon: "success",
          title: "Workflow Created",
          html: `
          <p><strong>Workflow Name:</strong> ${wf.Workflow_workflow_name || workflowName
            }</p>
          <p><strong>Description:</strong> ${wf.Workflow_description || description
            }</p>
          <p><strong>Module Name:</strong> ${wf.Workflow_module_name || ModuleName
            }</p>
          <p><strong>Module ID:</strong> ${wf.Workflow_module_id || moduleId
            }</p>
          <p><strong>Sub Module Name:</strong> ${wf.Workflow_sub_module_name || submodulename
            }</p>
          <p><strong>Sub Module ID:</strong> ${wf.Workflow_sub_id || subModuleId
            }</p>
        `,
          confirmButtonText: "OK",
        }).then(() => {
          setShowModal(false);
          fetchWorkflows(); // Refresh workflow list
          resetForm(); // Reset form after success
        });

        setError("");
      } else {
        setError(result.message || "An error occurred");
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  // Post Add user to the workflow
  const handleAddUserWorkflow = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Token does not exist.");
        return;
      }

      // Filter already assigned users
      const filteredUserIds = selectedUserIds.filter(
        (id) => !assignedUsers.some((user) => user.user_id === id)
      );

      if (filteredUserIds.length === 0) {
        setError("All selected users are already assigned to this workflow.");
        return;
      }

      const payload = {
        workflow_id: selectedWorkflowId,
        user_ids: filteredUserIds,
      };

      const response = await axios.post(
        `${BASE_URL}uniworkflow/userworkflow/user`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;
      console.log("API Result:", result); // Log the result for debugging
      console.log("message ", result.message); // Log filtered user IDs
      if (result.message) {
        console.log("successful:");
        setError("");
        Swal.fire({
          icon: "success",
          title: "User assigned to workflow",
          html: `
          <p><strong>Workflow Name:</strong> ${result.Workflow?.Workflow_id || selectedWorkflowId
            }</p>
          <p><strong>Assigned Users:</strong> ${filteredUserIds.join(
              ", "
            )}</p>            
        `,
          confirmButtonText: "OK",
        }).then(() => {
          setUserModal(false);
          resetForm();
          setSelectedUserIds([]);
          setSelectedWorkflowId("");
        });
      } else {
        setError(result.message || "Some users could not be assigned.");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
        "All provided users are already assigned to this workflow"
      );
    }
  };

  // deactivate workflow (backend only)
  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });
    if (confirmResult.isConfirmed) {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Token does not exist.");
          return;
        }
        await axios.patch(
          `${BASE_URL}uniworkflow/workflow/deactivate/${id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        Swal.fire("deactivate!", "Workflow has been deactivated.", "success");
        fetchWorkflows(); // Refresh list
      } catch (error) {
        setError("Failed to deactivate workflow.");
        Swal.fire("Error!", "Failed to deactivate workflow.", "error");
      }
    }
  };

  // Delete user from workflow (backend only)
  const handleUnassignUser = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: "This will unassign the user from the workflow.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, unassign!",
    });

    if (!confirmResult.isConfirmed) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        setError("Token does not exist.");
        return;
      }

      await axios.delete(
        `${BASE_URL}uniworkflow/userworkflow/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire("Success!", "User has been unassigned.", "success");
      fetchAvailableUsers(selectedWorkflowId);
      fetchAssignedUsers(selectedWorkflowId);
    } catch (error) {
      console.error("Delete error:", error);
      setError("Failed to unassign user.");
      Swal.fire("Error!", "Failed to unassign user.", "error");
    }
  };

  const resetForm = () => {
    setWorkflowName("");
    setDescription("");
    setModuleName("");
    setSubmodulename("");
    setAssignedUsers([]);
    setAvailableUsers([]);
    setError("");
  };

  // Edit workflow logic (UI only)
  const handleEditWorkflow = (workflow) => {
    setSelectedWorkflow(workflow);
    setSelectedUserIds([]);
    setShowEditModal(true);
    setSelectedWorkflowId(workflow.workflow_id);

    setAssignedUsers([]);
  };

  const handleHome = () => {
    navigate("/Cards");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Filter workflows using backend fields
  const filteredWorkflows = workflows.filter((workflow) => {
    // Use the most reliable date field
    const workflowDateStr = workflow.created_time || workflow.created_at || workflow.date || "";
    // If no date filter, show all
    if (!startDate && !endDate) {
      return (workflow.workflow_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    }
    if (!workflowDateStr) return false;
    // Extract only the date part (YYYY-MM-DD)
    const workflowDateOnly = workflowDateStr.split('T')[0];
    // Compare as strings for date-only accuracy
    const isAfterStart = startDate ? workflowDateOnly >= startDate : true;
    const isBeforeEnd = endDate ? workflowDateOnly <= endDate : true;
    return (
      (workflow.workflow_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) &&
      isAfterStart &&
      isBeforeEnd
    );
  });

  const subs = (moduleId) => {
    const mod = module.find((m) => m.module_id === moduleId);
    return mod ? mod.sub_modules : [];
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);
  const paginatedWorkflows = filteredWorkflows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex ">
      {/* hide-scrollbar class styles (cross-browser) */}
      <style>{`.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      <div className="flex flex-col w-full p-1">

        <div className="flex flex-col h-[80vh] px-2 w-full">
          <div className="flex gap-3 ">
            <div className="flex s gap-4 items-center">
              <button
                className="bg-[#0A64F0] text-white rounded-2xl shadow-md flex items-center justify-center gap-3 w-[183px] h-[40px]"
                style={{ opacity: 1, transform: 'rotate(0deg)' }}
                onClick={() => setShowModal(true)}
              >
                <span className="text-xl leading-none">+</span>
                <span className="text-sm font-medium">Add workflow</span>
              </button>
            </div>
            <div className="flex space-x-2 gap-4 items-center">
              <button
                className="bg-[#0A64F0] text-white rounded-2xl shadow-md flex items-center justify-center gap-3 w-[183px] h-[40px]"
                style={{ opacity: 1, transform: 'rotate(0deg)' }}
                onClick={() => setUserModal(true)}
              >
                <span className="text-xl leading-none">+</span>
                <span className="text-sm font-medium">Add Users</span>
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {/* Search Bar */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border rounded-2xl pl-10 pr-4 py-2 w-full"
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                  />
                </svg>
              </span>
            </div>
            {/* Date Range Filter */}
            <div className="flex justify-center bg-white items-center m-3 border rounded-2xl">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 sm:w-30 rounded-2xl"
              />
              <span className="text-gray-600">TO</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 sm:w-30 rounded-2xl"
              />
            </div>
            {/* Clear Filters Button */}
            <button
              onClick={() => {
                setSearchQuery("");
                setStartDate("");
                setEndDate("");
              }}
              className="bg-gray-200 text-black px-4 py-2 rounded-2xl hover:bg-gray-300"
            >
              Clear Filters
            </button>
          </div>
          {userModal && (
            <div
              className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-10"
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-white p-6 flex flex-col rounded-2xl w-full max-w-4xl scrollbar-hide relative border border-black">
                <div className=" mb-4">
                  <div className="flex justify-center flex-col items-center">
                    <h2 className="text-xl font-bold mb-2 ">Add user</h2>
                    <button
                      className="absolute top-2 right-2 text-red-500 text-xl"
                      onClick={() => {
                        setUserModal(false);
                        resetForm();
                      }}
                      aria-label="Close Modal"
                    >
                      <IoIosCloseCircle />
                    </button>
                  </div>
                  {/* Module Dropdown */}
                  <div className="flex gap-5 ml-6">
                    <div className="flex flex-col">
                      <label className="mb-1 font-medium">
                        Module: <span className="text-red-500">*</span>
                      </label>
                      <SearchableDropdown
                        options={module}
                        placeholder="Choose module"
                        value={module.find((m) => m.module_id === moduleId) || null}
                        onSelect={(sel) => {
                          if (!sel) {
                            setModuleName("");
                            setModuleId("");
                            // clear dependents
                            setSubModuleId("");
                            setSubmodulename("");
                            setWorkflow([]);
                            setSelectedWorkflow(null);
                            setSelectedWorkflowId("");
                            setAssignedUsers([]);
                            setAvailableUsers([]);
                            return;
                          }
                          const { module_id, module_name } = sel;
                          setModuleName(module_name);
                          setModuleId(module_id);
                        }}
                      />
                    </div>
                    {/* SubModule Dropdown */}
                    <div className="flex flex-col">
                      <label className="mb-1 font-medium">
                        SubModule: <span className="text-red-500">*</span>
                      </label>
                      <SearchableDropdown
                        options={subs(moduleId)} // `subs` should return an array of { sub_id, sub_module }
                        value={subs(moduleId).find((s) => s.sub_id === subModuleId) || null}
                        placeholder="Choose submodule"
                        onSelect={(sel) => {
                          if (!sel) {
                            setSubModuleId("");
                            setSubmodulename("");
                            setWorkflow([]);
                            setSelectedWorkflow(null);
                            setSelectedWorkflowId("");
                            setAssignedUsers([]);
                            setAvailableUsers([]);
                            return;
                          }
                          const { sub_id, sub_module } = sel;
                          console.log("Selected SubModule:", sub_module);
                          setSubModuleId(sub_id);
                          setSubmodulename(sub_module);
                          fetchWorkflow(sub_module); // Trigger workflow fetch
                        }}
                      />
                    </div>
                    {/* Workflow Dropdown */}
                    <div className="flex flex-col">
                      <label className="mb-1 font-medium">
                        Workflow : <span className="text-red-500">*</span>
                      </label>
                      <SearchableDropdown
                        options={Array.isArray(workflow) ? workflow : []}
                        placeholder="Choose workflow"
                        value={Array.isArray(workflow) ? workflow.find(wf => wf.workflow_id === selectedWorkflowId) || null : null}
                        onSelect={(selectedWorkflow) => {
                          setSelectedWorkflow(selectedWorkflow);
                          setSelectedWorkflowId(selectedWorkflow.workflow_id);
                          fetchAssignedUsers(selectedWorkflow.workflow_id);
                          fetchAvailableUsers(selectedWorkflow.workflow_id);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <form onSubmit={handleAddUserWorkflow} className="px-6">
                  <label className="mb-1 font-medium">Add User</label>
                  <div className="flex flex-col w-full mb-4">
                    {/* Chips for selected users */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {availableUsers
                        .filter((user) =>
                          selectedUserIds.includes(user.user_id)
                        )
                        .map((user) => (
                          <span
                            key={user.user_id}
                            className="flex items-center bg-gray-200 rounded px-2 py-1 text-sm"
                          >
                            {user.username}
                            <button
                              type="button"
                              className="ml-1 text-gray-600 hover:text-red-600"
                              onClick={() =>
                                setSelectedUserIds(
                                  selectedUserIds.filter(
                                    (id) => id !== user.user_id
                                  )
                                )
                              }
                            >
                              <MdClose />
                            </button>
                          </span>
                        ))}
                    </div>
                    {/* Multi-select dropdown for users */}
                    <Select
                      isMulti
                      placeholder="Select User(s)"
                      options={availableUsers.map((user) => ({
                        value: user.user_id,
                        label: user.username,
                      }))}
                      value={availableUsers
                        .filter((user) =>
                          selectedUserIds.includes(user.user_id)
                        )
                        .map((user) => ({
                          value: user.user_id,
                          label: user.username,
                        }))}
                      onChange={(selectedOptions) => {
                        setSelectedUserIds(
                          selectedOptions
                            ? selectedOptions.map((opt) => opt.value)
                            : []
                        );
                      }}
                      className="basic-multi-select mb-4"
                      classNamePrefix="select"
                    />
                  </div>
                  {/* Users Table Below the Form */}
                  <div>
                    <h3 className="font-semibold mt-4 mb-2">Users details</h3>
                    <table className="min-w-full table-auto border-collapse text-sm mb-4">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="py-2 px-4 border-b text-left">NAME</th>
                          <th className="py-2 px-4 border-b text-left">
                            MODULE
                          </th>
                          <th className="py-2 px-4 border-b text-left">
                            SUB MODULE
                          </th>
                          <th className="py-2 px-4 border-b text-left">
                            USER ID
                          </th>
                          <th className="py-2 px-4 border-b text-left">
                            ACTION
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedUsers.map((user) => (
                          <tr key={user.id}>
                            <td className="p-2">{user.username}</td>
                            <td className="p-2">{user.module_name}</td>
                            <td className="p-2">{user.sub_module_name}</td>
                            <td className="p-2">{user.user_id}</td>
                            <td className="p-2">
                              <button
                                className="text-red-600"
                                onClick={() => handleUnassignUser(user.id)}
                              >
                                <MdDelete />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Buttons aligned right */}
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="Add user"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add user
                    </button>
                    <button
                      type="button"
                      className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        setUserModal(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Add Workflow Modal */}
          {showModal && (
            <div
              className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-10"
              role="dialog"
              aria-modal="true"
            >
              <div className="bg-white p-6 flex flex-col rounded-2xl w-full max-w-4xl  relative border border-black">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold mb-2 ml-7">Add Workflow</h2>
                  <button
                    className="absolute top-2 right-2 text-red-500 text-xl"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    aria-label="Close Modal"
                  >
                    <IoIosCloseCircle />
                  </button>
                </div>
                <form onSubmit={handleAddWorkflow} className="px-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                    {/* Left Column: Workflow Name & Description */}
                    <div className="flex flex-col gap-4">
                      {/* Workflow Name */}
                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">
                          Workflow Name: <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="border border-gray-300 rounded px-3 py-2"
                          placeholder="Workflow Name"
                          value={workflowName}
                          onChange={(e) => setWorkflowName(e.target.value)}
                        />
                      </div>

                      {/* Description */}
                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">
                          Description: <span className="text-red-500">*</span>
                        </label>
                        <input
                          className="border border-gray-300 rounded px-3 py-2"
                          placeholder="Description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Right Column: Module & Sub Module */}
                    <div className="flex flex-col gap-4">
                      {/* Module Dropdown */}
                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">
                          Module: <span className="text-red-500">*</span>
                        </label>
                        <SearchableDropdown
                          options={module}
                          placeholder="Choose module"
                          value={module.find((m) => m.module_id === moduleId) || null}
                          onSelect={(sel) => {
                            if (!sel) {
                              setModuleName("");
                              setModuleId("");
                              setSubModuleId("");
                              setSubmodulename("");
                              setWorkflow([]);
                              return;
                            }
                            const { module_id, module_name } = sel;
                            setModuleName(module_name);
                            setModuleId(module_id);
                          }}
                        />
                      </div>

                      {/* Submodule Dropdown */}
                      <div className="flex flex-col">
                        <label className="mb-1 font-medium">
                          Sub Module: <span className="text-red-500">*</span>
                        </label>
                        <SearchableDropdown
                          options={subs(moduleId)}
                          value={subs(moduleId).find((s) => s.sub_id === subModuleId) || null}
                          placeholder="Choose submodule"
                          onSelect={(sel) => {
                            if (!sel) {
                              setSubmodulename("");
                              setSubModuleId("");
                              setWorkflow([]);
                              return;
                            }
                            const { sub_id, sub_module } = sel;
                            setSubmodulename(sub_module);
                            setSubModuleId(sub_id);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buttons aligned right */}
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {/* Workflow Table */}
          <div className="flex flex-col min-h-[66vh] bg-white">
            {/* make table body scrollable while keeping header sticky */}
            <div className="w-full overflow-auto max-h-[58vh] border border-gray-200 rounded-lg bg-white hide-scrollbar">
              <table className="min-w-full text-sm">
                <thead className="h-[70px] sticky top-0 bg-white border-b-black border-b-2">
                  <tr>
                    <th className="py-2 px-4 border-b text-center">S.No.</th>
                    <th className="py-2 px-4 border-b text-center"> Workflow</th>
                    <th className="py-2 px-4 border-b text-center">Date</th>
                    <th className="py-2 px-4 border-b text-center">Name</th>
                    <th className="py-2 px-4 border-b text-center">
                      Description
                    </th>
                    <th className="py-2 px-4 border-b text-center">
                      Module Name
                    </th>
                    <th className="py-2 px-4 border-b text-center">
                      SubModule Name
                    </th>
                    <th className="py-2 px-4 border-b text-center">Status</th>
                    <th className="py-2 px-4 border-b text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-3"></tr>
                  {paginatedWorkflows.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center p-4 text-gray-500">
                        No workflows available.
                      </td>
                    </tr>
                  ) : (
                    paginatedWorkflows.map((wf, index) => (
                      <tr
                        key={wf.workflow_id || wf.id}
                        className={`border-t h-[61px] ${index % 2 === 0 ? "bg-blue-50" : "bg-white"
                          } hover:bg-blue-100 transition-colors`}
                      >
                        <td className="p-3 text-center align-middle font-medium text-gray-700">
                          {(currentPage - 1) * itemsPerPage + index + 1}.
                        </td>
                        <td className="p-3 text-center align-middle">
                          {wf.workflow_name}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {wf.created_time
                            ? new Date(wf.created_time).toLocaleDateString(
                              "en-GB"
                            )
                            : "-"}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {wf.madeby || ""}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {wf.description}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {wf.module_name}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {wf.sub_module_name || "Null"}
                        </td>
                        <td className="p-3 text-center align-middle">
                          {wf.status}
                        </td>
                        <td className="p-3 text-center align-middle">
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEditWorkflow(wf)}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDelete(wf.workflow_id || wf.id)}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div
              className="flex items-center justify-center gap-2 w-full bg-white shadow-md mt-4"
              style={{ marginTop: "auto" }}
            >
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                &lt;
              </button>
              <span className="px-3 py-1 border rounded-md bg-blue-600 text-white">
                {currentPage}
              </span>
              <span>of</span>
              <span className="px-3 py-1 border rounded-md">{totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                className="px-3 py-1 border rounded-md disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
            {/* Edit Workflow Modal*/}
            {showEditModal && selectedWorkflow && (
              <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-10">
                <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg relative border border-black">
                  <button
                    className="absolute top-2 right-2 text-red-500 text-xl"
                    onClick={() => setShowEditModal(false)}
                    aria-label="Close Modal"
                  >
                    <IoIosCloseCircle />
                  </button>
                  <h2 className="text-xl font-semibold mb-4">Edit Workflow</h2>
                  <div className="flex flex-col gap-4 mb-6">
                    {/* Two-column layout for the first four fields */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Left Column: Workflow & Description */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                          <label className="mb-1 font-medium">Workflow</label>
                          <input
                            className="border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                            value={selectedWorkflow.workflow_name}
                            readOnly
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 font-medium">
                            Description
                          </label>
                          <input
                            className="border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                            value={selectedWorkflow.description}
                            readOnly
                          />
                        </div>
                      </div>
                      {/* Right Column: Module & Sub Module */}
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col">
                          <label className="mb-1 font-medium">Module</label>
                          <input
                            className="border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                            value={selectedWorkflow.module_name}
                            readOnly
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="mb-1 font-medium">Sub Module</label>
                          <input
                            className="border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                            value={selectedWorkflow.sub_module_name}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      onClick={submitUserAssignments}
                    >
                      Save changes
                    </button>
                    <button
                      className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
                      onClick={() => setShowEditModal(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
