import axios from "axios";
import Modal from "react-modal";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import React, { useState } from "react";
import useFetchEmails from "../NewComponents/useFetchEmails";
Modal.setAppElement("#root");

const UpdateAccess = () => {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [apiAccess, setApiAccess] = useState([]);
  const emails = useFetchEmails();
  const [isCrmChecked, setIsCrmChecked] = useState(false);
  const [hasAmsAccess, setHasAmsAccess] = useState(false);

  //CRM's Customer Info
  const [isCreateCustomer, setIsCreateCustomer] = useState(false);
  const [isEditCustomer, setIsEditCustomer] = useState(false);
  const [isDeleteCustomer, setIsDeleteCustomer] = useState(false);
  const [isAllCustomer, setIsAllCustomer] = useState(false);

  //CRM's Contact Info
  const [isCreateContact, setIsCreateContact] = useState(false);
  const [isEditContact, setIsEditContact] = useState(false);
  const [isDeleteContact, setIsDeleteContact] = useState(false);
  const [isAllContact, setIsAllContact] = useState(false);

  const handleEmailChange = async (e) => {
    const userId = e.target.value;
    setSelectedEmail(userId);
    if (userId) {
      try {
        const response = await axios.get(
          `https://devdemo.softtrails.net/access/access/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        const filteredAccess = response.data.filter(
          (access) => access.user_id === parseInt(userId)
        );
        const apiAccessNames = filteredAccess.map((access) => access.api_name);
        setApiAccess(apiAccessNames);
        setIsCrmChecked(apiAccessNames.includes("CRM"));
        setIsCreateCustomer(apiAccessNames.includes("create_customer"));
        setIsEditCustomer(apiAccessNames.includes("update_customer"));
        setIsDeleteCustomer(apiAccessNames.includes("delete_customer"));
        setIsAllCustomer(apiAccessNames.includes("all_customer"));
        setIsCreateContact(apiAccessNames.includes("create_contact"));
        setIsEditContact(apiAccessNames.includes("update_contact"));
        setIsDeleteContact(apiAccessNames.includes("delete_contact"));
        setIsAllContact(apiAccessNames.includes("all_contact"));
        setHasAmsAccess(apiAccessNames.includes("update_access"));
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
      setIsCrmChecked(false);
      setIsCreateCustomer(false);
      setIsEditCustomer(false);
      setIsDeleteCustomer(false);
      setIsAllCustomer(false);
      setIsCreateContact(false);
      setIsEditContact(false);
      setIsDeleteContact(false);
      setIsAllContact(false);
    }
  };

  const handleApiAccessChange = async (apiName) => {
    const isAlreadySelected = apiAccess.includes(apiName);
    setApiAccess(
      (prev) =>
        isAlreadySelected
          ? prev.filter((name) => name !== apiName) // Remove API if unchecked
          : [...prev, apiName] // Add API if checked
    );

    if (apiName === "update_access") {
      setHasAmsAccess((prev) => !prev);
    } else if (apiName === "CRM") {
      setIsCrmChecked((prev) => !prev);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Unauthorized",
        text: "Token does not exist.",
      });
      return;
    }
    const selectedModule = "CRM";
    const selectedApiAccess = [];
    if (isCrmChecked) selectedApiAccess.push("CRM");
    if (isCreateCustomer) selectedApiAccess.push("create_customer");
    if (isEditCustomer) selectedApiAccess.push("update_customer");
    if (isDeleteCustomer) selectedApiAccess.push("delete_customer");
    if (isAllCustomer) selectedApiAccess.push("all_customer");
    if (isCreateContact) selectedApiAccess.push("create_contact");
    if (isEditContact) selectedApiAccess.push("update_contact");
    if (isDeleteContact) selectedApiAccess.push("delete_contact");
    if (isAllContact) selectedApiAccess.push("all_contact");
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
      } else if (
        response.data.error ===
        "User not found. Please check the email entered."
      ) {
        Swal.fire({
          icon: "error",
          title: "User Not Found",
          text: "Please check the email entered.",
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

  const back = () => {
    navigate("/Cards");
  };

  //TOKEN AND USERPROFILE START
  const navigate = useNavigate();
  const getToken = () => {
    const token = sessionStorage.getItem("token");
    return token;
  };
  const token = getToken();
  console.log("Retrieved token:", token);
  //END

  return (
    <div className="w-full max-h-[80vh] overflow-auto">
      <div className="bg-white p-4 rounded-lg shadow-md mt-3">
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

          <div className="flex flex-col sm:flex-row mt-6">
            <div className="w-full rounded-lg p-4 overflow-y-auto h-[300px]">
              <div className="border-solid border-gray-300 rounded-lg">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setIsCrmChecked(isChecked);
                        setIsCreateCustomer(isChecked);
                        setIsEditCustomer(isChecked);
                        setIsDeleteCustomer(isChecked);
                        setIsAllCustomer(isChecked);
                        setIsCreateContact(isChecked);
                        setIsEditContact(isChecked);
                        setIsDeleteContact(isChecked);
                        setIsAllContact(isChecked);
                      }}
                      checked={isCrmChecked}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="text-blue-600 text-lg font-bold ml-5">
                      CRM
                    </span>
                  </label>
                </div>

                {isCrmChecked && (
                  <div className="ml-5 mt-[2%] max-h-[350px] overflow-y-auto pr-2">
                    <div>
                      <h2 className="text-blue-600 text-[16px] font-medium">
                        Customer's Info:
                      </h2>
                      <div className="ml-5">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            onChange={() =>
                              setIsCreateCustomer(!isCreateCustomer)
                            }
                            checked={isCreateCustomer}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-2">Create Customer</span>
                        </label>
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            onChange={() => setIsEditCustomer(!isEditCustomer)}
                            checked={isEditCustomer}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-2">Edit Customer</span>
                        </label>
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            onChange={() =>
                              setIsDeleteCustomer(!isDeleteCustomer)
                            }
                            checked={isDeleteCustomer}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-2">Delete Customer</span>
                        </label>
                        <label className="flex items-center mt-2">
                          <input
                            type="checkbox"
                            onChange={() => setIsAllCustomer(!isAllCustomer)}
                            checked={isAllCustomer}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                          />
                          <span className="ml-2">View All Customers</span>
                        </label>
                      </div>
                    </div>

                    <h2 className="text-blue-600 text-[16px] font-medium mt-4">
                      Customer's Contact:
                    </h2>
                    <div className="ml-5">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          onChange={() => setIsCreateContact(!isCreateContact)}
                          checked={isCreateContact}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2">Create Contact</span>
                      </label>
                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() => setIsEditContact(!isEditContact)}
                          checked={isEditContact}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2">Edit Contact</span>
                      </label>
                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() => setIsDeleteContact(!isDeleteContact)}
                          checked={isDeleteContact}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2">Delete Contact</span>
                      </label>
                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() => setIsAllContact(!isAllContact)}
                          checked={isAllContact}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2">View All Contacts</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center mt-6">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md"
                >
                  Submit
                </button>
                <button
                  onClick={back}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-md ml-4"
                >
                  Back
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
export default UpdateAccess;
