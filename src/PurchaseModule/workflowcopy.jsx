import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaSearch, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import Sidebar from "../Sidebar/HRMSidebar";
import Header from "../employee data/Header";
import ProfileDropdown from "../ProfileDropdown";
import Swal from "sweetalert2";

const AddPurchaseWorkflow = () => {
  const [workflows, setWorkflows] = useState([]);
  const [formData, setFormData] = useState({
    workflowName: "",
    budget: "",
    description: "",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const createdBy = sessionStorage.getItem("userId");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [indentRequest, setIndentRequest] = useState([]);
  const [indentApprover, setIndentApprover] = useState("");
  const [bypassRequest, setBypassRequest] = useState(false);
  const [bypassApprover, setBypassApprover] = useState(false);
  const [isRolesPopupOpen, setIsRolesPopupOpen] = useState(false);
  const [groupData, setGroupData] = useState([]); // holds API response
  const [newlyAddedUsers, setNewlyAddedUsers] = useState([]);

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get(
        "https://devdemo.softtrails.net/budget-workflow/workflows"
      );
      setWorkflows(response.data);
    } catch (error) {
      console.error("Error fetching workflows:", error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editData) {
      setEditData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(
        "https://devdemo.softtrails.net/budget/get-budget"
      );
      setBudgets(response.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async () => {
    const payload = {
      workflowname: formData.workflowName,
      description: formData.description,
      created_by: parseInt(createdBy),
      budget_ids: Array.isArray(formData.budget)
        ? formData.budget.map((b) => parseInt(b))
        : [parseInt(formData.budget)],
    };

    try {
      const response = await axios.post(
        "https://devdemo.softtrails.net/budget-workflow/workflows ",
        payload
      );
      console.log("Workflow saved:", response.data);
      Swal.fire("Workflow Added successfully!");

      setWorkflows([...workflows, response.data]);

      setFormData({
        workflowName: "",
        budget: "",
        // approver: "",
        // createdBy: "",
        description: "",
      });
    } catch (error) {
      console.error("Error submitting workflow:", error);
      Swal.fire("Failed to submit workflow. Please try again.");
    }
  };

  const handleRoleSubmit = () => {
    const payload = [
      {
        workflowid: editData?.workflowid,
        action: "Approve",
        group_names: bypassApprover ? ["Bypass"] : [indentApprover],
      },
      {
        workflowid: editData?.workflowid,
        action: "Request",
        group_names: bypassRequest ? ["Bypass"] : indentRequest,
      },
    ];

    axios
      .put("https://devdemo.softtrails.net/budget-workflow/group", payload)
      .then((response) => {
        Swal.fire("Success", "Data submitted successfully!", "success");
        setIndentRequest([]);
        setBypassRequest(false);
        setIndentApprover("");
        setBypassApprover(false);
        setIsRolesPopupOpen(false);
      })
      .catch((error) => {
        const errorMessage =
          error?.response?.data?.message || "Failed to submit data.";
        Swal.fire("Error", errorMessage, "error");
      });
  };

  const handleNext = () => {
    if (!editData?.workflowid) {
      console.error("Workflow ID is missing in editData");
      Swal.fire("Error", "Workflow ID is missing", "error");
      return;
    }

    Swal.fire({
      icon: "info",
      title: "Next Step",
      text: "No users were selected. Proceeding to approval group configuration.",
      confirmButtonText: "Continue",
      confirmButtonColor: "#007bff",
    }).then(() => {
      setIsPopupOpen(false);
      setIsRolesPopupOpen(true);
    });
  };

  const handleUpdate = async () => {
    if (!editData?.workflowid) {
      console.error("Workflow ID is missing in editData");
      Swal.fire("Error", "Workflow ID is missing", "error");
      return;
    }

    const payload = {
      userids: newlyAddedUsers.map((user) => user.user_id),
      workflowid: editData.workflowid,
    };

    try {
      await axios.post(
        "https://devdemo.softtrails.net/budget-workflow/user",
        payload
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "You have successfully added users to this workflow. Now, proceed with the approval group process.",
        confirmButtonText: "Continue",
        confirmButtonColor: "#007bff",
      }).then(() => {
        setIsPopupOpen(false);
        setIsRolesPopupOpen(true);
      });

      fetchWorkflows();
      setNewlyAddedUsers([]); // Clear after success
    } catch (error) {
      console.error("Error updating workflow:", error);
    }
  };

  const handleEditClick = (workflow) => {
    if (!workflow.workflowid) {
      console.error("Workflow ID is missing");
      Swal.fire("Error", "Workflow ID is missing", "error");
      return;
    }

    setEditData(workflow);
    setIsPopupOpen(true);

    // Clear previous selections
    setIndentRequest([]);
    setIndentApprover("");
    setBypassRequest(false);
    setBypassApprover(false);

    // Fetch assigned users with their internal ID
    axios
      .get(
        `https://devdemo.softtrails.net/budget-workflow/user/${workflow.workflowid}`
      )
      .then((res) => {
        const userEntries = res.data; // contains id, userid, etc.

        const enrichedUsers = userEntries.map((entry) => {
          const matchedUser = users.find((u) => u.user_id === entry.userid);
          return {
            id: entry.id, // internal id for deletion
            user_id: entry.userid,
            first_name: matchedUser?.first_name || "",
            last_name: matchedUser?.last_name || "",
          };
        });

        setEditData((prev) => ({
          ...prev,
          users: enrichedUsers,
        }));

        const userIds = userEntries.map((item) => item.userid);
        setAvailableUsers((prev) =>
          prev.filter((user) => !userIds.includes(user.user_id))
        );
      })
      .catch((error) => console.error("Error fetching workflow users:", error));

    // Fetch associated groups and setup approver/request
    axios
      .get(
        `https://devdemo.softtrails.net/budget-workflow/group/${workflow.workflowid}`
      )
      .then((res) => {
        const groups = res.data;
        setEditData((prev) => ({
          ...prev,
          groups,
        }));

        groups.forEach((group) => {
          if (group.group_name === "Bypass") {
            if (group.action === "Approve") {
              setBypassApprover(true);
              setIndentApprover("");
            } else if (group.action === "Request") {
              setBypassRequest(true);
              setIndentRequest([]);
            }
          } else {
            if (group.action === "Approve") {
              setBypassApprover(false);
              setIndentApprover(group.group_name);
            } else if (group.action === "Request") {
              setBypassRequest(false);
              setIndentRequest((prev) => [...prev, group.group_name]);
            }
          }
        });
      })
      .catch((error) =>
        console.error("Error fetching workflow groups:", error)
      );
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setEditData(null);
  };

  const handleRemoveUser = async (index) => {
    const removedUser = editData?.users[index];
    if (!removedUser || !removedUser.id) {
      console.error("User or user ID is missing");
      Swal.fire("Error", "User ID is missing. Cannot remove user.", "error");
      return;
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to remove ${removedUser.first_name} ${removedUser.last_name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove",
    });

    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(
        `https://devdemo.softtrails.net/budget-workflow/user/${removedUser.id}`
      );

      const updatedUsers = [...editData.users];
      updatedUsers.splice(index, 1);
      setEditData((prev) => ({ ...prev, users: updatedUsers }));

      setAvailableUsers((prev) => {
        const exists = prev.some(
          (user) => user.user_id === removedUser.user_id
        );
        return exists ? prev : [...prev, removedUser];
      });

      Swal.fire("Removed!", "User has been removed.", "success");
    } catch (error) {
      console.error("Failed to delete user:", error);
      Swal.fire("Error", "Failed to remove user. Please try again.", "error");
    }
  };

  const handleAddUser = (e) => {
    const selectedUserId = parseInt(e.target.value);
    if (!selectedUserId) return;

    const selectedUser = availableUsers.find(
      (user) => user.user_id === selectedUserId
    );

    if (
      selectedUser &&
      !editData?.users?.some((user) => user.user_id === selectedUserId)
    ) {
      // Add to selected users
      setEditData((prev) => ({
        ...prev,
        users: [...(prev?.users || []), selectedUser],
      }));

      // Add to newly added users
      setNewlyAddedUsers((prev) => [...prev, selectedUser]);

      // Remove from available users
      setAvailableUsers((prev) =>
        prev.filter((user) => user.user_id !== selectedUserId)
      );

      // Reset select
      e.target.value = "";
    }
  };

  const [availableUsers, setAvailableUsers] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios
      .get("https://devdemo.softtrails.net/users")
      .then((response) => {
        setUsers(response.data);
        setAvailableUsers(response.data);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  useEffect(() => {
    setAvailableUsers(
      users.filter((user) => !editData?.users?.includes(user.user_id))
    );
  }, [users, editData?.users]);

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axios
      .get("https://devdemo.softtrails.net/role")
      .then((response) => setRoles(response.data))
      .catch((error) => console.error("Error fetching roles:", error));
  }, []);
  const [existingUsers, setExistingUsers] = useState([]);

  const hasFetchedUsersRef = useRef(false);

  useEffect(() => {
    if (availableUsers.length > 0 && !hasFetchedUsersRef.current) {
      const workflowid = 1;
      axios
        .get(`https://devdemo.softtrails.net/budget-workflow/user/${workflowid}`)
        .then((response) => {
          const enrichedUsers = response.data.map((entry) => {
            const matchedUser = availableUsers.find(
              (u) => u.user_id === entry.userid
            );
            return {
              id: entry.id,
              user_id: entry.userid,
              first_name: matchedUser?.first_name || "",
              last_name: matchedUser?.last_name || "",
            };
          });
          setEditData((prev) => ({ ...prev, users: enrichedUsers }));
          hasFetchedUsersRef.current = true; // only run once
        })
        .catch((error) =>
          console.error("Error fetching existing users:", error)
        );
    }
  }, [availableUsers]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-6 w-full">
        <Header />
        <div className="ml-[61%] w-[50%] fixed z-20">
          {isDropdownOpen && (
            <div ref={dropdownRef}>
              <ProfileDropdown className="absolute z-10 right-0" />
            </div>
          )}
        </div>
        <div className="border-gray bg-white p-2 rounded-lg">
          <h1 className="text-xl text-[#00235A] font-bold mb-4">
            Add Purchase Workflow
          </h1>
          <div className="grid grid-cols-5 gap-2 mb-4 items-end">
            {/* Form Inputs */}
            <div>
              <label
                htmlFor="workflowName"
                className="block text-sm font-medium text-black-700"
              >
                Workflow Name
              </label>
              <input
                id="workflowName"
                type="text"
                name="workflowName"
                placeholder="Enter Workflow Name"
                value={formData.workflowName}
                onChange={handleChange}
                className="border p-2 rounded-lg w-2/3"
              />
            </div>
            <div>
              {/* Budget Dropdown */}
              <label
                htmlFor="budget"
                className="block text-sm font-medium text-black-700"
              >
                Budget
              </label>
              <select
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="border p-2 rounded-lg w-2/3"
              >
                <option value="">Select Budget</option>
                {budgets.map((budget) => (
                  <option key={budget.id} value={budget.id}>
                    {budget.budget_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-black-700"
              >
                Description
              </label>
              <input
                id="description"
                type="text"
                name="description"
                placeholder="Add Description"
                value={formData.description}
                onChange={handleChange}
                className="border p-2 rounded-lg w-full"
              />
            </div>
            <div className="justify-self-end">
              <button
                onClick={handleSubmit}
                className="bg-[#005AE6] text-white p-2 px-8 rounded-lg w-full"
              >
                Submit
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}

        <table className="w-full bg-white border-collapse rounded-lg mt-4">
          <thead className="border-b-2 border-black">
            <tr className=" p-4">
              <th className="p-2">S. No</th>
              <th className="p-2">Workflow Name</th>
              <th className="p-2">Budget</th>
              <th className="p-2">Description</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((workflow, index) => (
              <tr
                key={workflow.id || index}
                className="odd:bg-blue-50 text-center"
              >
                <td className="p-2">{index + 1}</td>
                <td className="p-2">{workflow.workflowname}</td>
                <td className="p-2">
                  {budgets.find((b) => b.id === workflow.budget_id)
                    ?.budget_name || "N/A"}
                </td>
                <td className="p-2">{workflow.description}</td>
                <td className="p-2 flex justify-center gap-2">
                  <FaEdit
                    className="text-blue-500 cursor-pointer"
                    onClick={() => handleEditClick(workflow)}
                  />
                  <FaTrash className="text-red-500 cursor-pointer" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {isPopupOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg w-1/2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  Update/Add User in Workflow
                </h2>
                <button
                  onClick={handleClosePopup}
                  className="text-red-500 text-xl"
                >
                  ✖
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label>Workflow</label>
                  <input
                    type="text"
                    name="workflowname"
                    value={editData?.workflowname || ""}
                    onChange={handleChange}
                    className="border p-2 w-full"
                  />
                </div>
                <div>
                  <label>Budget</label>
                  <select
                    name="budget_id"
                    value={editData?.budget_id || ""}
                    onChange={handleChange}
                    className="border p-2 w-full"
                  >
                    {budgets.map((budget) => (
                      <option key={budget.id} value={budget.id}>
                        {budget.budget_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editData?.description || ""}
                  onChange={handleChange}
                  className="border p-2 w-full h-24"
                />
              </div>

              <div className="mb-4">
                <label>Add User</label>
                <div className="border p-2 w-full flex flex-wrap gap-2">
                  {editData?.users?.map((user, index) => (
                    <div
                      key={index}
                      className="bg-gray-200 px-2 py-1 rounded flex items-center gap-1"
                    >
                      {user.first_name} {user.last_name}
                      <button
                        onClick={() => handleRemoveUser(index)}
                        className="ml-1 text-red-600 hover:text-red-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <select onChange={handleAddUser} className="border p-2">
                    <option value="">Select User</option>
                    {availableUsers
                      .filter(
                        (user) =>
                          !editData.users?.some(
                            (selected) => selected.user_id === user.user_id
                          )
                      )
                      .map((user) => (
                        <option key={user.user_id} value={user.user_id}>
                          {user.first_name} {user.last_name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-start gap-4">
                {newlyAddedUsers.length > 0 ? (
                  <button
                    onClick={handleUpdate}
                    className="bg-blue-500 text-white p-2 rounded-lg"
                  >
                    Save Change
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="bg-blue-500 text-white p-2 rounded-lg"
                  >
                    Next
                  </button>
                )}
                <button
                  onClick={handleClosePopup}
                  className="bg-gray-400 text-white p-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isRolesPopupOpen && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg w-[450px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Authorization Groups</h2>
                <button
                  onClick={() => setIsRolesPopupOpen(false)}
                  className="text-red-500 text-xl"
                >
                  ✖
                </button>
              </div>

              {/* Indent Request Section */}
              <div className="mb-4 flex items-center">
                <div className="w-full">
                  <label className="block mb-2 text-gray-700">
                    Indent Request
                  </label>
                  <div className="border p-2 rounded-lg flex items-center">
                    {indentRequest.map((item, index) => (
                      <span
                        key={index}
                        className="bg-gray-200 px-2 py-1 rounded-lg mr-2 flex items-center"
                      >
                        {item}
                        <button
                          onClick={() =>
                            setIndentRequest(
                              indentRequest.filter((_, i) => i !== index)
                            )
                          }
                          className="ml-1 text-red-500 text-sm"
                        >
                          ✖
                        </button>
                      </span>
                    ))}
                    <select
                      className="border-none outline-none w-full"
                      onChange={(e) => {
                        if (
                          e.target.value &&
                          !indentRequest.includes(e.target.value)
                        ) {
                          setIndentRequest([...indentRequest, e.target.value]);
                        }
                      }}
                      disabled={bypassRequest}
                    >
                      <option value="">Select Role</option>
                      {roles.map((role) => (
                        <option key={role.role_id} value={role.role}>
                          {role.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="ml-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={bypassRequest}
                    onChange={() => {
                      setBypassRequest(!bypassRequest);
                      if (!bypassRequest) setIndentRequest([]);
                    }}
                  />
                  <span className="ml-2">Bypass</span>
                </label>
              </div>

              {/* Indent Approver Section */}
              <div className="mb-4 flex items-center">
                <div className="w-full">
                  <label className="block mb-2 text-gray-700">
                    Indent Approver
                  </label>
                  <select
                    className="border p-2 rounded-lg w-full"
                    value={indentApprover}
                    onChange={(e) => setIndentApprover(e.target.value)}
                    disabled={bypassApprover}
                  >
                    <option value="">Select Role </option>
                    {roles.map((role) => (
                      <option key={role.role_id} value={role.role}>
                        {role.role}
                      </option>
                    ))}
                  </select>
                </div>
                <label className="ml-4 flex items-center">
                  <input
                    type="checkbox"
                    checked={bypassApprover}
                    onChange={() => {
                      setBypassApprover(!bypassApprover);
                      if (!bypassApprover) setIndentApprover("");
                    }}
                  />
                  <span className="ml-2">Bypass</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setIsRolesPopupOpen(false)}
                  className="bg-gray-200 text-black px-6 py-2 rounded-lg border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRoleSubmit}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddPurchaseWorkflow;
