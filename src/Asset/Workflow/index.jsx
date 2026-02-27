import React, { useState, useEffect, useRef } from "react";
import { FaTrash, FaEdit, FaSearch } from "react-icons/fa"; // Import FaEdit icon
import { FaHome, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import NotificationSelector from "../Components/NotificationSelector";
import axios from "axios";
import MessageModal from "../ApprovalAuthority/MessageModal";
//import ProfileDropdown from "../../ProfileDropdown";
import Select from "react-select";
import Loader from "../Components/Loader";
import { DMS_BASE, JAVA_BASE, ASSET_NODE_BASE, UCS_BASE, MAIN_BASE } from "../../config/apiBase"
const WorkflowPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workflows, setWorkflows] = useState([]); // Main table data
  const [pendingWorkflows, setPendingWorkflows] = useState([]); // Workflows to be added
  const [formData, setFormData] = useState({
    workflowname: "",
    workflowid: " ",
    user: "",
    description: "",
    user_id: "",
  });
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

  const [availableWorkflows, setAvailableWorkflows] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newWorkflow, setNewWorkflow] = useState("");
  const [editWorkflowId, setEditWorkflowId] = useState(null);
  const [updatedOn, setUpdatedOn] = useState(null);
  const [tempWorkflows, setTempWorkflows] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // To store user details
  const [newWorkflowDetails, setNewWorkflowDetails] = useState(null);
  const [users, setUsers] = useState([]); // Users associated with workflows
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // To control modal visibility
  const [workflowToDelete, setWorkflowToDelete] = useState(null); // Store the workflow id to delete
  const [workflowUsers, setWorkflowUsers] = useState(null);
  const [error, setError] = useState(""); // Add this state to handle errors
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState(""); // State to store the type of message
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // You can change this to whatever number you prefer
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationPayload, setNotificationPayload] = useState(null);
  //TOKEN AND USERPROFILE  START
  const userId = sessionStorage.getItem("userId");
  const [userData, setUserData] = useState("");
  const navigate = useNavigate();
  const getToken = () => {
    const token = sessionStorage.getItem("token");
    return token;
  };
  const token = getToken();
  console.log("Retrieved token:", token);
  useEffect(() => {
    const token = sessionStorage.getItem("token"); // Get token once

    const fetchWorkflows = async () => {
      try {
        const response = await axios.get(
          `${JAVA_BASE}workflow/get`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Attach token
          }
        );
        setAvailableWorkflows(response.data);
        setWorkflows(response.data); // Ensure ID is included
      } catch (error) {
        console.error("Error fetching workflows:", error);
      }
    };

    const fetchUsersByWorkflowId = async (workflowId) => {
      try {
        const response = await axios.get(
          `${ASSET_NODE_BASE}workflow/workflowid`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Attach token
          }
        );
        setUsers(response.data.users);
      } catch (error) {
        console.error("Error fetching users for workflow:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${MAIN_BASE}users/getusers`,
          {
            headers: { Authorization: `Bearer ${token}` }, // Attach token
          }
        );

        const usersArray = response.data.users || []; // ✅ extract users array
        setAvailableUsers(usersArray);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchWorkflows();
    fetchUsers();
  }, [updatedOn]);

  const handleOpenDeleteModal = (id) => {
    setWorkflowToDelete(id); // Store the id of the workflow to be deleted
    setIsDeleteModalOpen(true); // Open the modal
  };
  const cancelDelete = () => {
    setIsDeleteModalOpen(false); // Close the modal
    setWorkflowToDelete(null); // Reset the workflow to delete
  };

  const confirmDelete = async () => {
    if (workflowToDelete) {
      await handleDeleteWorkflow(workflowToDelete);
      setIsDeleteModalOpen(false); // Close the modal after deletion
      setWorkflowToDelete(null); // Reset the workflow to delete
    }
  };
  const handleDeleteWorkflow = async (id) => {
    if (!id) {
      console.error("Invalid workflow ID:", id);
      return;
    }

    const token = sessionStorage.getItem("token"); // Get token

    try {
      const response = await axios.delete(
        `${JAVA_BASE}workflow/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // Attach token
        }
      );

      setWorkflows(workflows.filter((workflow) => workflow.id !== id));
      setUpdatedOn((prev) => prev + 1); // Trigger re-render if needed
      // alert("Workflow deleted successfully!");
    } catch (error) {
      console.error("Error deleting workflow:", error);
      alert("Error deleting workflow. Please try again.");
    }
  };

  // const handleAddUserToWorkflow = async (e) => {
  //   e.preventDefault();

  //   if (!formData.user_id || !formData.workflowid) {
  //     setError("User ID or Workflow ID is missing");
  //     setMessageType("error");
  //     return;
  //   }

  //   const selectedUser = availableUsers.find(
  //     (user) => user.user_id === Number(formData.user_id)
  //   );

  //   if (!selectedUser) {
  //     setError("User not found");
  //     setMessageType("error");
  //     return;
  //   }

  //   const selectedWorkflow = availableWorkflows.find(
  //     (workflow) => workflow.workflowid === Number(formData.workflowid)
  //   );

  //   if (!selectedWorkflow) {
  //     setError("Workflow not found");
  //     setMessageType("error");
  //     return;
  //   }

  //   const payloadToSend = {
  //     userid: Number(formData.user_id),
  //     workflowid: Number(formData.workflowid),
  //     workflowname: selectedWorkflow.workflowname,
  //     email: selectedUser.email,
  //     phone_no: selectedUser.phone_no,
  //   };

  //   try {
  //     const token = sessionStorage.getItem("token");

  //     const response = await axios.post(
  //       "https://saaspro.softtrails.net/saas/asset/pro/workflow",
  //       payloadToSend,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     console.log("User added to workflow:", response.data);
  //     setError("");
  //     setMessage("User added to Approval workflow successfully");
  //     setMessageType("success");

  //     // Optionally refresh workflow details
  //     fetchWorkflowDetails(formData.workflowid);
  //   } catch (error) {
  //     console.error("Error in workflow process:", error);
  //     const backendMessage =
  //       error.response?.data?.message ||
  //       "Something went wrong. Please try again.";
  //     setError(backendMessage);
  //     setMessageType("error");
  //   }
  // };


  const handleAddUserToWorkflow = async (e) => {
    e.preventDefault();

    if (!formData.user_id || !formData.workflowid) {
      setError("User ID or Workflow ID is missing");
      setMessageType("error");
      return;
    }

    const selectedUser = availableUsers.find(
      (user) => user.user_id === Number(formData.user_id)
    );
    const selectedWorkflow = availableWorkflows.find(
      (workflow) => workflow.workflowid === Number(formData.workflowid)
    );

    if (!selectedUser || !selectedWorkflow) {
      setError("User or Workflow not found");
      setMessageType("error");
      return;
    }

    const payloadToSend = {
      userid: Number(formData.user_id),
      workflowid: Number(formData.workflowid),
      workflowname: selectedWorkflow.workflowname,
      email: selectedUser.email,
      phone_no: selectedUser.phone_no,
    };

    let finalMessage = "";
    let messageTypeFinal = "success";

    try {
      const token = sessionStorage.getItem("token");

      // ✅ Step 1: Add user to Workflow (Start loader here)
      setIsLoading(true);

      await axios.post(`${ASSET_NODE_BASE}workflow`, payloadToSend, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("User added to workflow");
      await fetchWorkflowDetails(formData.workflowid);

      // ✅ Stop loader after user successfully added
      setIsLoading(false);

      // ✅ Step 2: Fetch UCS module info (no loader needed yet)
      const moduleResponse = await axios.get(`${UCS_BASE}api/modules`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const filteredModule = moduleResponse.data.find(
        (mod) =>
          mod.moduleName === "Workflow" && mod.subModuleName === "User Addition"
      );

      if (!filteredModule) {
        finalMessage = "User added, but UCS module not found.";
        messageTypeFinal = "error";
        setMessage(finalMessage);
        setMessageType(messageTypeFinal);
        return;
      }

      // ✅ Step 3: Open notification selection modal
      setNotificationPayload({
        ...payloadToSend,
        name: selectedUser.name,
        moduleName: filteredModule.moduleName,
        subName: filteredModule.subModuleName,
        uniqueIdentifierName: filteredModule.uniqueIdentifierName,
        applicationName: filteredModule.applicationName,
      });

      setShowNotificationModal(true);
      // ❌ Do not set loader here, only when actual notification is sent
    } catch (error) {
      console.error("Workflow API error:", error);
      finalMessage =
        error.response?.data?.message ||
        "Something went wrong while adding the user.";
      messageTypeFinal = "error";
      setMessage(finalMessage);
      setMessageType(messageTypeFinal);
      setIsLoading(false);
    }
  };


  // 📨 Handle sending UCS based on modal selection
  const handleSendNotification = async (selectedTypes) => {
    if (!notificationPayload) return;

    setShowNotificationModal(false);
    setIsLoading(true); // 🟢 Loader starts only now (sending notification)

    try {
      const token = sessionStorage.getItem("token");

      const finalPayload = {
        ...notificationPayload,
        ...(selectedTypes.includes("email") ? {} : { email: undefined }),
        ...(selectedTypes.includes("sms") ? {} : { phone_no: undefined }),
      };

      await axios.post(`${UCS_BASE}ucs/send`, finalPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessage("User added and notification sent successfully.");
      setMessageType("success");
    } catch (ucsError) {
      console.error("UCS/send API error:", ucsError);
      setMessage("User added, but failed to send UCS notification.");
      setMessageType("error");
    } finally {
      setIsLoading(false); // 🟢 Stop loader after UCS call completes
      setNotificationPayload(null);
    }
  };




  const handleNewWorkflow = (workflowname) => {
    const workflow = availableWorkflows.find(
      (w) => w.workflowname === workflowname
    );

    if (workflow) {
      // Match user based on user_id, not workflowid
      const user = availableUsers?.find(
        (u) => u.user_id === workflow.validuser
      );

      setFormData({
        ...formData,
        workflowname: workflow.workflowname,
        description: workflow.description,
        user_id: workflow.validuser,
        workflowid: workflow.workflowid,
        createdby: user ? `${user.first_name} ${user.last_name}` : "Unknown",
      });

      if (user) setSelectedUser(user);

      console.log({ user, workflow, formData });
    }
  };

  const handleAddNewWorkflow = () => {
    if (newWorkflow.trim() === "") return;

    const loggedInUser = availableUsers.find(
      (u) => u.user_id === parseInt(userId)
    );

    const newWorkflowEntry = {
      workflowname: newWorkflow,
      description: "",
      createdby: loggedInUser
        ? `${loggedInUser.first_name} ${loggedInUser.last_name}`
        : "Unknown",
      id: Math.random().toString(36).substr(2, 9),
    };

    setTempWorkflows((prev) => [...prev, newWorkflowEntry]);

    // 🟢 Immediately set the workflow as selected
    setFormData((prev) => ({
      ...prev,
      workflowname: newWorkflow,
      description: "",
      createdby: newWorkflowEntry.createdby,
    }));

    setSelectedUser(null); // Clear previous user
    handleNewWorkflow(newWorkflow); // Load other fields (like createdby)

    setNewWorkflow(""); // Clear input
  };

  const handleAddWorkflow = async () => {
    if (!formData.workflowname || !formData.description) {
      setError("Please fill in all fields.");
      setMessageType("error");
      return;
    }

    const loggedInUser = availableUsers.find(
      (u) => u.user_id === parseInt(userId)
    );

    const createdByName = loggedInUser
      ? `${loggedInUser.first_name} ${loggedInUser.last_name}`
      : "Unknown";

    const token = sessionStorage.getItem("token"); // Get token

    try {
      const response = await axios.post(
        `${JAVA_BASE}workflow/save`,
        {
          workflowname: formData.workflowname,
          description: formData.description,
          createdby: createdByName,
        },
        {
          headers: { Authorization: `Bearer ${token}` }, // Add token here
        }
      );

      const newWorkflowData = {
        ...formData,
        createdby: createdByName,
        id: response.data.id,
      };

      setWorkflows([...workflows, newWorkflowData]);

      setFormData({
        workflowid: "",
        workflowname: "",
        user: "",
        description: "",
        createdby: "",
        user_id: "",
      });

      setMessage("Approval Workflow added successfully");
      setMessageType("success");
      setIsModalOpen(false);
      setUpdatedOn(new Date());
    } catch (error) {
      console.error("Error adding workflow:", error);
      setError("Failed to add workflow. Please try again.");
      setMessageType("error");
    }
  };

  const filteredWorkflows = [...availableWorkflows, ...pendingWorkflows].filter(
    (workflow) =>
      workflow.workflowname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    console.log(formData);
    return formData.workflowname && formData.description;
  };
  const handleEditWorkflow = (workflow) => {
    if (!workflow) {
      setError("Invalid workflow data."); // Error if workflow is not valid
      setMessageType("error"); // Set message type to error
      return;
    }

    // Set the form data for editing the workflow
    setEditWorkflowId(workflow.workflowid);
    setFormData({
      workflowname: workflow.workflowname,
      description: workflow.description,
      user_id: workflow.userId,
      createdby: workflow.createdby,
      workflowid: workflow.workflowid,
    });

    // Find the user based on workflow data (ensure user exists)
    const selectedUser = availableUsers.find(
      (user) => user.user_id === workflow.userId
    );
    if (selectedUser) {
      setSelectedUser(selectedUser); // Set selected user if found
    } else {
      setError("User not found for this workflow."); // Show error if user not found
      setMessageType("error"); // Set message type to error
    }

    // Open the modal for editing
    setIsModalOpen(true);
  };

  const openModalForNewWorkflow = () => {
    setFormData({
      workflowname: "",
      description: "",
      user_id: "",
      createdby: "admin",
      workflowid: "",
    });
    setSelectedUser(null);
    setNewWorkflow(""); // Clear new workflow input
    setIsModalOpen(true);
  };
  // const excludedUserIds = workflows.map((workflow) => workflow.user_id);
  // const availableUsersForDropdown = availableUsers.filter(
  //   (user) => !excludedUserIds.includes(user.user_id)
  // );

  const [availableUsersForDropdown, setAvailableUsersForDropdown] =
    useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");

    if (userId) {
      const fetchUserData = async () => {
        try {
          console.log("Fetching data for userId:", userId);
          const response = await axios.get(
            `${MAIN_BASE}users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("API Response:", response);

          // Extract user from the "users" array
          const userArray = response.data.users || [];
          const user = userArray[0] || null;

          if (user) {
            console.log("User:", user);
            setUserData(user);
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [token, userId]);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.post(
          `${MAIN_BASE}users/verify-token`,
          { token }
        );
        console.log("Token is valid:", response.data);
        navigate("/Workflow");
      } catch (error) {
        console.error(
          "Token verification failed:",
          error.response ? error.response.data : error.message
        );
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("tokenExpiry");
        navigate("/");
      }
    };
    verifyToken();
  }, [token, navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    navigate("/");
  };

  const handleHome = () => {
    navigate("/Cards");
  };
  //END
  const fetchWorkflowDetails = async (workflowid) => {
    console.log("fetchWorkflowDetails", { workflowid });
    if (!workflowid) {
      console.log("Workflow ID is invalid");
      return null;
    }

    const token = sessionStorage.getItem("token"); // Get token

    try {
      const response = await axios.get(
        `${ASSET_NODE_BASE}workflow/${workflowid}`,
        {
          headers: { Authorization: `Bearer ${token}` }, // Add token here
        }
      );

      setWorkflowDetails(response.data); // Update state with the fetched data

      const tempObj = {};
      response.data.forEach((u) => {
        tempObj[u.userid] = [u.id, u.workflowid];
      });

      const workflowUsers = availableUsers.filter((u) => {
        if (tempObj[u.user_id] === undefined) {
          return true;
        }
        return false;
      });

      const tableUser = availableUsers.filter((u) => {
        if (tempObj[u.user_id]) {
          u.workFlowId = tempObj[u.user_id];
          return true;
        }
        return false;
      });

      console.log(response, availableUsers, tempObj, workflowUsers);

      setNewWorkflowDetails(workflowUsers);
      setWorkflowUsers(tableUser);
      console.log(workflowUsers);
    } catch (error) {
      console.error(
        "Error fetching workflow details:",
        error.response?.data?.error || error.message
      );

      if (
        error.response?.data?.error ===
        "No user found for the specified workflow."
      ) {
        setNewWorkflowDetails(availableUsers);
        setWorkflowUsers([]);
      }

      setWorkflowDetails(null); // Reset details on error
    }
  };

  const handleDeleteWorkflowUsers = async (workflowUserId) => {
    console.log(workflowUserId);
    if (!workflowUserId) {
      console.log("Workflow User ID is invalid");
      return null;
    }

    try {
      const response = await axios.delete(
        `${ASSET_NODE_BASE}workflow/${workflowUserId[0]}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUpdatedOn(new Date());
      fetchWorkflowDetails(workflowUserId[1]);
    } catch (error) {
      console.error("Error fetching workflow details:", error);
      setWorkflowDetails(null); // Reset details on error
    }
  };

  const handleWorkflowChange = (e) => {
    const selectedWorkflowId = e.target.value;
    setFormData({ ...formData, workflowid: selectedWorkflowId });
    if (selectedWorkflowId) {
      fetchWorkflowDetails(selectedWorkflowId); // Fetch details for selected workflow
    }
  };

  const [workflowDetails, setWorkflowDetails] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    // Add event listener to detect clicks outside the dropdown
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const dropdownRef = useRef(null);

  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);

  const paginatedWorkflows = filteredWorkflows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const workflowOptions = [
    {
      label: "➕ Add Approval Workflow",
      value: "add-new",
      color: "red",
    },
    ...filteredWorkflows.map((workflow) => ({
      label: workflow.workflowname,
      value: workflow.workflowname,
    })),
    ...(tempWorkflows || []).map((workflow) => ({
      label: workflow.workflowname,
      value: workflow.workflowname,
    })),
  ];

  const customStyles = {
    control: (base, state) => ({
      ...base,
      padding: "0.25rem",
      borderRadius: "0.5rem",
      borderColor: state.isFocused ? "#3B82F6" : "#E5E7EB",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(59,130,246,0.5)" : "none",
      "&:hover": {
        borderColor: "#3B82F6",
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#3B82F6"
        : state.isFocused
          ? "#DBEAFE"
          : "white",
      color: state.isSelected || state.isFocused ? "#1E3A8A" : "#111827",
      padding: "0.5rem 1rem",
    }),
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex">
        <div className="w-full p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={openModalForNewWorkflow} // Open modal for adding new workflow
              className="rounded-full bg-blue-600 text-white py-3 px-6 hover:bg-blue-700 transition duration-300  w-full sm:w-auto"
            >
              + Add Approval Workflow
            </button>
            <div className="flex items-center w-full sm:w-64 mr-5">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500  w-full"
              />
              {/* <FaSearch className="text-gray-500 ml-6" /> */}
            </div>
          </div>
          {/* Workflow Table */}
          <div className="relative w-full mt-3">
            <div
              id="workflow-table"
              className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[65vh] md:max-h-[55vh] border rounded-lg"
            >
              <table className="min-w-full table-auto border-collapse ">
                <thead className="sticky top-0 bg-white border-b-2 border-black text-[16px] font-medium ">
                  <tr>
                    {[
                      "S.No",
                      "Approval Workflow",
                      "Description",
                      "Created By",
                      "Action",
                    ].map((heading, i) => (
                      <th key={i} className="p-4 text-center">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedWorkflows.map((workflow, index) => {
                    const user = availableUsers?.find(
                      (user) => user.user_id === workflow.validuser
                    );
                    const userName = user
                      ? `${user.first_name} ${user.last_name}`
                      : "N/A";

                    return (
                      <tr
                        key={workflow.workflowid}
                        className={`hover:bg-blue-100 ${index % 2 === 0 ? "bg-blue-50" : "bg-white"
                          }`}
                      >
                        <td className="p-4 text-center">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="p-4 text-center">
                          {workflow.workflowname}
                        </td>
                        <td className="p-4 text-center">
                          {workflow.description}
                        </td>
                        <td className="p-4 text-center">
                          {workflow.createdby || "N/A"}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center items-center gap-3">
                            <button
                              onClick={() => handleEditWorkflow(workflow)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit"
                            >
                              <FaEdit className="text-base" />
                            </button>
                            <button
                              onClick={() =>
                                handleOpenDeleteModal(workflow.workflowid)
                              }
                              className="text-red-500 hover:text-red-700"
                              title="Delete"
                            >
                              <FaTrash className="text-base" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 mt-4 p-3 border-t border-gray-300">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded disabled:bg-gray-100 disabled:text-gray-400"
                >
                  &lt;
                </button>

                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`px-3 py-1 rounded text-sm ${currentPage === idx + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm rounded disabled:bg-gray-100 disabled:text-gray-400"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>

          {isDeleteModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/4">
                <div className="p-6">
                  <h2 className="text-lg font-bold text-gray-800">
                    Are you sure you want to delete this workflow?
                  </h2>
                  <div className="flex justify-end space-x-4 mt-4">
                    <button
                      onClick={cancelDelete}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded"
                    >
                      No
                    </button>
                    <button
                      onClick={confirmDelete}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 md:w-3/4 lg:w-1/2">
                <h2 className="text-xl font-bold mb-7 text-center">
                  Approval Workflow
                </h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddWorkflow();
                  }}
                  className="grid grid-cols-1 gap-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-gray-700 mb-1">
                        Approval Workflow
                      </label>
                      <Select
                        options={workflowOptions}
                        value={workflowOptions.find(
                          (option) => option.value === formData.workflowname
                        )}
                        onChange={(selectedOption) => {
                          const selectedValue = selectedOption.value;
                          if (selectedValue === "add-new") {
                            setFormData({ workflowname: selectedValue });
                            setSelectedUser(null);
                          } else {
                            setFormData({
                              ...formData,
                              workflowname: selectedValue,
                            });
                          }
                          handleNewWorkflow(selectedValue);
                        }}
                        styles={customStyles}
                        placeholder="Select Approval Workflow"
                        className="w-full"
                        isSearchable
                      />

                      {formData.workflowname === "add-new" && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={newWorkflow}
                            onChange={(e) => setNewWorkflow(e.target.value)}
                            placeholder="New Workflow Name"
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition duration-200"
                          />
                          <button
                            type="button"
                            onClick={handleAddNewWorkflow}
                            className="mt-2 rounded bg-blue-500 text-white py-1 px-4 hover:bg-blue-600"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full transition duration-200"
                        placeholder="Enter description"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-1 opacity-0">
                        S.NO
                      </label>
                      <button
                        type="submit"
                        className="rounded bg-blue-500 text-white py-3 text-sm hover:bg-blue-700 transition duration-300 w-full"
                      >
                        Submit
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setTempWorkflows([]); // Clear temp workflows on modal close
                        setFormData({
                          workflowid: "",
                          workflowname: "",
                          user: "",
                          description: "",
                          createdby: "",
                          user_id: "",
                        });
                        setSelectedUser(null);
                        setNewWorkflow(""); // Optional reset if needed
                      }}
                      className="rounded bg-red-600 text-white py-2 px-3 hover:bg-red-700 transition duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddUserModalOpen(true);
                        fetchWorkflowDetails(formData.workflowid);
                      }} // Set the Add User modal to open
                      className="rounded bg-green-600 text-white py-2 px-3 hover:bg-green-700 transition duration-300"
                    >
                      View User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          {isAddUserModalOpen && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
              <div className="bg-white rounded-lg p-6 shadow-lg w-11/12 md:w-3/4 lg:w-1/2 xl:w-1/2 relative">
                {/* Close Icon */}
                <button
                  onClick={() => {
                    setIsAddUserModalOpen(false);
                    setIsModalOpen(false);
                  }}
                  className="absolute top-2 right-2 text-red-600 hover:text-red-900 focus:outline-none"
                  style={{ zIndex: 100 }}
                >
                  <FaTimes className="text-2xl" />
                </button>

                <h2 className="text-xl font-bold mb-7 text-center">
                  Assign User to Approval Workflow
                </h2>

                <form
                  onSubmit={handleAddUserToWorkflow}
                  className="flex flex-col gap-6"
                >
                  {/* Workflow & User Selection */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-gray-700 mb-1">
                        Approval Workflow
                      </label>
                      <Select
                        className="w-full"
                        options={filteredWorkflows.map((workflow) => ({
                          value: workflow.workflowid,
                          label: workflow.workflowname,
                        }))}
                        onChange={(selectedOption) => {
                          const selectedWorkflowId =
                            selectedOption?.value || "";
                          setFormData({
                            ...formData,
                            workflowid: selectedWorkflowId,
                          });
                          if (selectedWorkflowId) {
                            fetchWorkflowDetails(selectedWorkflowId); // Fetch details for selected workflow
                          }
                        }}
                        value={
                          filteredWorkflows
                            .map((workflow) => ({
                              value: workflow.workflowid,
                              label: workflow.workflowname,
                            }))
                            .find(
                              (option) => option.value === formData.workflowid
                            ) || null
                        }
                        placeholder="Search and select workflow"
                        isClearable
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-gray-700 mb-1">
                        Select User
                      </label>
                      <Select
                        className="w-full"
                        options={availableUsers
                          .filter(
                            (user) =>
                              !workflowUsers?.some(
                                (assigned) => assigned.user_id === user.user_id
                              )
                          )
                          .map((user) => ({
                            value: user.user_id,
                            label: `${user.first_name} ${user.last_name}`,
                          }))}
                        onChange={(selected) =>
                          setFormData({
                            ...formData,
                            user_id: selected?.value || "",
                          })
                        }
                        placeholder="Search and select user"
                        isClearable
                      />
                    </div>
                  </div>

                  {/* User Details Section */}
                  <div className="mt-4 border-t pt-4">
                    <h3 className="font-bold text-lg mb-4">User Details</h3>

                    {workflowUsers?.length > 0 ? (
                      <div className="overflow-y-auto max-h-48">
                        <table className="table-auto border-collapse border border-gray-300 w-full">
                          <thead>
                            <tr>
                              <th className="sticky top-0 bg-gray-400 border border-gray-300 px-4 py-2">
                                Name
                              </th>
                              <th className="sticky top-0 bg-gray-400 border border-gray-300 px-4 py-2">
                                Email
                              </th>
                              <th className="sticky top-0 bg-gray-400 border border-gray-300 px-4 py-2">
                                Phone
                              </th>
                              <th className="sticky top-0 bg-gray-400 border border-gray-300 px-4 py-2">
                                Employee ID
                              </th>
                              <th className="sticky top-0 bg-gray-400 border border-gray-300 px-4 py-2">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {workflowUsers.map((user) => (
                              <tr key={user.email}>
                                <td className="border border-gray-300 px-4 py-2">
                                  {user.first_name} {user.last_name}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {user.email}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {user.phone_no}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                  {user.emp_id}
                                </td>
                                <td className="border border-gray-300 px-4 py-2 text-center">
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      await handleDeleteWorkflowUsers(
                                        user.workFlowId
                                      );
                                    }}
                                  >
                                    <FaTrash className="text-red-500 hover:underline" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center italic">
                        No assigned users in this workflow.
                      </p>
                    )}
                  </div>

                  {/* Message Modal */}
                  <MessageModal
                    message={message}
                    type={messageType}
                    setMessage={setMessage}
                  />

                  {/* Action Buttons */}
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => setIsAddUserModalOpen(false)}
                      className="rounded bg-red-600 text-white py-2 px-3 hover:bg-red-700 transition duration-300"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="rounded bg-green-600 text-white py-2 px-3 hover:bg-green-700 transition duration-300"
                    >
                      Add User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
      <Loader isVisible={isLoading} text="Sending notification..." />
      <MessageModal
        message={message}
        type={messageType}
        setMessage={setMessage}
      />
      <NotificationSelector
        open={showNotificationModal}
        onClose={() => setShowNotificationModal(false)}
        onConfirm={handleSendNotification}
      />

    </div>
  );
};

export default WorkflowPage;
