import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import Excel from "../assests/excel.png";
import Select from "react-select";
import useFetchEmails from "../NewComponents/useFetchEmails";

const UpdateAccess = () => {
  const [roles, setRoles] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState("");
  const [selectedRoles, setSelectedRoles] = useState({});
  const [apiAccess, setApiAccess] = useState([]);
  const emails = useFetchEmails();

  const handleEmailChange = async (e) => {
    const userId = e.target.value;
    setSelectedEmail(userId);

    if (userId) {
      try {
        const accessResponse = await axios.get(
          `https://devdemo.softtrails.net/access/access/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );

        const filteredAccess = accessResponse.data.filter(
          (access) => access.user_id === parseInt(userId)
        );
        const apiAccessNames = filteredAccess.map((access) => access.api_name);

        const updatedRoles = roles.reduce((acc, role) => {
          acc[role.role] = apiAccessNames.includes(role.role);
          return acc;
        }, {});

        setSelectedRoles(updatedRoles);
        setApiAccess(apiAccessNames);
      } catch (error) {
        showAlert(
          "Error",
          "No Access is available for the provided User",
          "error"
        );
      }
    } else {
      setApiAccess([]);
      setRoles([]);
      setSelectedRoles({});
    }
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(
          "https://devdemo.softtrails.net/role",
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        const rolesWithSelection = response.data.reduce((acc, role) => {
          acc[role.role_name] = false;
          return acc;
        }, {});

        setRoles(response.data);
        setSelectedRoles(rolesWithSelection);
      } catch (error) {
        showAlert("Error", "Error fetching roles.", "error");
      }
    };
    fetchRoles();
  }, []);

  const handleRoleChange = (roleName) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [roleName]: !prev[roleName],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    if (!token) {
      showAlert("Error", "Token does not exist.", "error");
      return;
    }

    const selectedRolesArray = Object.keys(selectedRoles).filter(
      (role) => selectedRoles[role]
    );
    const selectedApiAccess = [];
    const selectedModuleForRoles = "ROLE";

    // Ensure module is sent even if api_access is empty
    const payload = {
      user_id: selectedEmail,
      module: selectedModuleForRoles,
      api_access: selectedRolesArray.length > 0 ? selectedRolesArray : [], // Can be empty
    };
    try {
      const response = await axios.put(
        "https://devdemo.softtrails.net/access/update_access",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        showAlert("Success", "User Updated Successfully!", "success");
      } else if (
        response.data.error ===
        "User not found. Please check the email entered."
      ) {
        showAlert(
          "Error",
          "User not found. Please check the email entered.",
          "error"
        );
      } else {
        showAlert("Error", `Error: ${response.data.error}`, "error");
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 403) {
          showAlert(
            "Error",
            "You do not have permission to perform this action.",
            "error"
          );
        } else if (error.response.status === 404) {
          showAlert(
            "Error",
            "User not found. Please check the email entered.",
            "error"
          );
        } else {
          showAlert("Error", "Error updating access.", "error");
        }
      } else {
        showAlert("Error", "Error updating access.", "error");
      }
    }
  };

  const showAlert = (title, text, icon) => {
    Swal.fire({
      title,
      text,
      icon,
      confirmButtonColor: "#3085d6",
      confirmButtonText: "OK",
    });
  };

  const navigate = useNavigate();

  //*************************** RIGHT PART *************************/
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const token = sessionStorage.getItem("token"); // get token from sessionStorage
    if (!token) return;

    fetch("https://devdemo.softtrails.net/role", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => setRoles(data)) // Assuming the API returns an array of roles
      .catch((error) => console.error("Error fetching roles:", error));
  }, []);

  // const handleGroupChange = (event) => {
  //     setSelectedRole(event.target.value);
  // };

  ////////////////////////RIGHT PART////////////////////////

  useEffect(() => {
    const token = sessionStorage.getItem("token"); // get token from sessionStorage
    if (!token) return;

    fetch("https://devdemo.softtrails.net/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const usersArray = data.users || []; // extract users array
        setUsers(usersArray);

        // Pre-select users based on assigned roles
        const preselectedRoles = {};
        usersArray.forEach((user) => {
          preselectedRoles[user.role] = true;
        });
        setSelectedRoles(preselectedRoles);
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  const handleDownloadExcel = () => {
    if (!selectedRole1) {
      alert("Please select a role first.");
      return;
    }
    const roleName =
      roles.find((r) => r.role_id === parseInt(selectedRole1))?.role || "Role";
    const filteredUsers = users1.filter((user) =>
      assignedUserIds1.includes(user.user_id)
    );
    // Create the Excel data array
    const excelData = [
      { Role: roleName }, // Add role name as the first row
      {}, // Empty row for spacing
      { "User ID": "User ID", "User Name": "User Name", Email: "Email" }, // Header row
      ...filteredUsers.map((user) => ({
        "User ID": user.user_id,
        "User Name": `${user.first_name || ""} ${user.last_name || ""}`.trim(),
        Email: user.email || "N/A",
      })),
    ];

    // Convert to worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData, { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    // Save the file
    XLSX.writeFile(workbook, `${roleName}_Users.xlsx`);
  };

  const [selectedRole1, setSelectedRole1] = useState("");
  const [users1, setUsers1] = useState([]);
  const [assignedUserIds1, setAssignedUserIds1] = useState([]);

  const handleGroupChange1 = async (e) => {
    const roleId = e.target.value;
    setSelectedRole1(roleId);

    // Get the role name based on selected role_id
    const selectedRoleObj = roles.find((r) => r.role_id === parseInt(roleId));
    const roleName = selectedRoleObj?.role;

    if (!roleName) {
      console.error("Role name not found for role_id:", roleId);
      return;
    }

    try {
      const token = sessionStorage.getItem("token"); // get token
      if (!token) {
        console.error("No token found in sessionStorage");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch users assigned to the role
      const res = await fetch(
        `https://devdemo.softtrails.net/access/role-users?role=${roleName}`,
        {
          headers,
        }
      );
      const data = await res.json();
      setAssignedUserIds1(data.users || []);

      // Fetch all users
      const userRes = await fetch(
        `https://devdemo.softtrails.net/users`,
        {
          headers,
        }
      );
      const allUsersData = await userRes.json();
      const allUsersArray = allUsersData.users || []; // extract users array
      setUsers1(allUsersArray);
    } catch (error) {
      console.error("Error fetching users for role:", error);
    }
  };

  const handleRoleChange1 = (userId) => {
    setAssignedUserIds1((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="p-4 sm:p-6 w-full flex flex-col lg:flex-row gap-6">
      {/* Left Panel */}
      <div className="bg-white w-full lg:w-1/2 h-[500px] rounded-xl shadow-md p-4 flex flex-col border border-blue-300">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[50%]">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
            >
              {" "}
              Select User:{" "}
            </label>
            <div className="w-full sm:w-[80%]">
              <Select
                id="email"
                options={emails}
                value={
                  emails.find((user) => user.value === selectedEmail) || null
                }
                onChange={(selectedOption) => {
                  handleEmailChange({
                    target: { value: selectedOption?.value || "" },
                  });
                }}
                placeholder="Search or select user..."
                isSearchable
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: "0.5rem",
                    padding: "2px",
                    borderColor: "#d1d5db",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#2563eb" },
                  }),
                }}
              />
            </div>
          </div>

          {roles.length > 0 && (
            <div className="flex-1 overflow-y-auto rounded-lg p-3 border border-blue-500">
              <h3 className="text-md font-semibold mb-2">Assign Group:</h3>
              <div className="flex flex-col gap-2">
                {roles.map((role) => (
                  <label key={role.role_id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={!!selectedRoles[role.role]}
                      onChange={() => handleRoleChange(role.role)}
                      className="mr-2"
                    />
                    {role.role}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
            >
              Update Access
            </button>
            <button
              onClick={() => navigate("/HRMS")}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md ml-4"
            >
              Back
            </button>
          </div>
        </form>
      </div>

      {/* Right Panel */}
      <div className="bg-white w-full lg:w-1/2 h-[500px] rounded-xl shadow-md p-4 flex flex-col border border-blue-300">
        <div className="flex flex-col sm:flex-row sm:items-center mt-2 mb-4">
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
          >
            Select Group:
          </label>
          <select
            id="role"
            value={selectedRole1}
            onChange={handleGroupChange1}
            required
            className="block w-full sm:w-[60%] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
          >
            <option value="">Select a role</option>
            {roles.map((role, index) => (
              <option key={index} value={role.role_id}>
                {role.role}
              </option>
            ))}
          </select>
          <button onClick={handleDownloadExcel} className="ml-2">
            <img
              src={Excel}
              alt="Excel"
              className="w-8 h-8 cursor-pointer hover:scale-105 transition"
            />
          </button>
        </div>

        {users1.length > 0 && (
          <div className="flex-1 overflow-y-auto border border-blue-300 rounded-lg p-3 bg-gray-50">
            <h3 className="text-md font-semibold mb-2">Assigned Users:</h3>
            <div className="flex flex-col gap-2">
              {users1
                .filter((user) => assignedUserIds1.includes(user.user_id))
                .map((user) => (
                  <label key={user.user_id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleRoleChange1(user.user_id)}
                      className="mr-2"
                    />
                    {user.first_name && user.last_name
                      ? `${user.first_name} ${user.last_name}`
                      : user.first_name || user.last_name}
                  </label>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UpdateAccess;
