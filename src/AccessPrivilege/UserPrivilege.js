import axios from "axios";
import Modal from "react-modal";
import Swal from "sweetalert2";
import React, { useState } from "react";
import Select from "react-select";
import useFetchEmails from "../NewComponents/useFetchEmails";
Modal.setAppElement("#root");

const UpdateAccess = () => {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [apiAccess, setApiAccess] = useState([]);
  const [isUsersChecked, setIsUsersChecked] = useState(false);
  const [isUMCChecked, setIsUMCChecked] = useState(false);
  const [isRoleChecked, setIsRoleChecked] = useState(false);
  const [isUserChecked, setIsUserChecked] = useState(false);
  const [isAddUserChecked, setIsAddUserChecked] = useState(false);
  const [isDeleteUserChecked, setIsDeleteUserChecked] = useState(false);
  const [isEditUserChecked, setIsEditUserChecked] = useState(false);
  const [hasAmsAccess, setHasAmsAccess] = useState(false);
  const token = sessionStorage.getItem("token");
  const emails = useFetchEmails();

  const handleEmailChange = async (e) => {
    const userId = e.target.value;
    setSelectedEmail(userId);

    if (userId) {
      try {
        const response = await axios.get(
          `https://devdemo.softtrails.net/access/access/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const filteredAccess = response.data.filter(
          (access) => access.user_id === parseInt(userId)
        );
        const apiAccessNames = filteredAccess.map((access) => access.api_name);
        setApiAccess(apiAccessNames);
        setHasAmsAccess(apiAccessNames.includes("update_access"));
        setIsUMCChecked(apiAccessNames.includes("UMC"));
        setIsRoleChecked(apiAccessNames.includes("Role"));
        setIsUserChecked(apiAccessNames.includes("UM"));
        setIsAddUserChecked(apiAccessNames.includes("AddUM"));
        setIsDeleteUserChecked(apiAccessNames.includes("DltUM"));
        setIsEditUserChecked(apiAccessNames.includes("EditUM"));
      } catch (error) {
        Swal.fire({
          icon: "warning",
          title: "No Access",
          text: "No Access is available for the provided User.",
        });
      }
    } else {
      setApiAccess([]);
      setHasAmsAccess(false);
      setIsUsersChecked(false);
      setIsUMCChecked(false);
      setIsRoleChecked(false);
      setIsUserChecked(false);
      setIsAddUserChecked(false);
      setIsDeleteUserChecked(false);
      setIsEditUserChecked(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "Token does not exist.",
      });
      return;
    }

    const selectedModule = "UserDirectory";
    const selectedApiAccess = [];
    if (isUMCChecked) selectedApiAccess.push("UMC");
    if (isRoleChecked) selectedApiAccess.push("Role");
    if (isUserChecked) selectedApiAccess.push("UM");
    if (isAddUserChecked) selectedApiAccess.push("AddUM");
    if (isDeleteUserChecked) selectedApiAccess.push("DltUM");
    if (isEditUserChecked) selectedApiAccess.push("EditUM");
    try {
      const response = await axios.put(
        "https://devdemo.softtrails.net/access/update_access",
        {
          user_id: selectedEmail,
          module: selectedModule,
          api_access: selectedApiAccess,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User Updated Successfully!",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Error: ${response.data.error}`,
        });
      }
    } catch (error) {
      const { response } = error;
      if (response) {
        if (response.status === 403) {
          Swal.fire({
            icon: "warning",
            title: "Permission Denied",
            text: "You do not have permission to perform this action.",
          });
        } else if (response.status === 404) {
          Swal.fire({
            icon: "error",
            title: "User Not Found",
            text: "Please check the email entered.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Update Failed",
            text: "Error updating API access.",
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Network Error",
          text: "Error updating API access.",
        });
      }
    }
  };

  return (
    <div className="w-full max-h-[80vh] overflow-auto">
      <div className="bg-white p-4 rounded-lg mt-3">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[50%]">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
            >
              {" "}
              Select User:{" "}
            </label>
            <div className="w-full sm:w-[60%]">
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

          {/* Permissions Section */}
          <div className="flex flex-col sm:flex-row mt-6">
            <div className="w-full sm:w-1/2 rounded-lg p-4 overflow-y-auto h-[300px]">
              <label className="flex items-center font-semibold text-blue-700 text-lg">
                <input
                  type="checkbox"
                  onChange={() => setIsUMCChecked(!isUMCChecked)}
                  checked={isUMCChecked}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2">Directory Service</span>
              </label>

              {isUMCChecked && (
                <div className="ml-6 mt-3">
                  {/* 1. Users */}
                  <label className="flex items-center font-medium">
                    <input
                      type="checkbox"
                      onChange={() => setIsUserChecked(!isUserChecked)}
                      checked={isUserChecked}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2">Users</span>
                  </label>

                  {isUserChecked && (
                    <div className="ml-6 mt-2 text-sm">
                      {/* 1.1 Add User */}
                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setIsAddUserChecked(!isAddUserChecked)
                          }
                          checked={isAddUserChecked}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2"> Add User</span>
                      </label>

                      {/* 1.2 Delete */}
                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setIsDeleteUserChecked(!isDeleteUserChecked)
                          }
                          checked={isDeleteUserChecked}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2"> Delete</span>
                      </label>

                      {/* 1.3 Edit User */}
                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setIsEditUserChecked(!isEditUserChecked)
                          }
                          checked={isEditUserChecked}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2"> Edit User</span>
                      </label>
                    </div>
                  )}

                  {/* 2. Group */}
                  <label className="flex items-center mt-4 font-medium">
                    <input
                      type="checkbox"
                      onChange={() => setIsRoleChecked(!isRoleChecked)}
                      checked={isRoleChecked}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2"> Group</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 ml-5">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none"
            >
              Update Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UpdateAccess;
