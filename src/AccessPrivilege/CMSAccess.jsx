import axios from "axios";
import Modal from "react-modal";
import Swal from "sweetalert2";
import { useState } from "react";
import Select from "react-select";
import { ChevronDown, ChevronUp } from "lucide-react";
import useFetchEmails from "../NewComponents/useFetchEmails";
Modal.setAppElement("#root");

const UpdateAccess = () => {
  const emails = useFetchEmails();
  const [selectedEmail, setSelectedEmail] = useState("");
  const [apiAccess, setApiAccess] = useState([]);

  //for each states
  const [hasAmsAccess, setHasAmsAccess] = useState(false);
  const [isCMSChecked, setIsCMSChecked] = useState(false);
  const [isAllCMSChecked, setIsAllCMSChecked] = useState(false);

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
        setHasAmsAccess(apiAccessNames.includes("update_access"));
        setIsCMSChecked(apiAccessNames.includes("CMS"));
        setIsAllCMSChecked(apiAccessNames.includes("AllCMS"));
      } catch (error) {
        Swal.fire({
          icon: "warning",
          title: "No Access",
          text: "No Access is available for the provided User.",
        });
      }
    } else {
      setApiAccess([]);
      setIsCMSChecked(false);
      setIsAllCMSChecked(false);
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
    } else if (apiName === "CMS") {
      setIsCMSChecked((prev) => !prev);
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
    const selectedModule = "CMS";
    const selectedApiAccess = [];
    if (isCMSChecked) selectedApiAccess.push("CMS");
    if (isAllCMSChecked) selectedApiAccess.push("AllCMS");
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

  const Checkbox = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="form-checkbox text-indigo-600 focus:ring-indigo-500"
      />{" "}
      <span>{label}</span>
    </label>
  );

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

          <div className="w-full h-[300px] overflow-y-auto p-4">
            <div className="bg-white p-6 space-y-4">
              {/* HRMS Header */}
              <div
                className="cursor-pointer flex justify-between items-center"
                onClick={() => setIsCMSChecked(!isCMSChecked)}
              >
                <span className="text-lg font-semibold text-blue-700">
                  CMS Module
                </span>
                {isCMSChecked ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </div>
              {isCMSChecked && (
                <div className="pl-4 border-l-2 border-blue-200 space-y-6">
                  <div>
                    <Checkbox
                      label="Set up"
                      checked={isCMSChecked}
                      onChange={() => setIsCMSChecked(!isCMSChecked)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

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
