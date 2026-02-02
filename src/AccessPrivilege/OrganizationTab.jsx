import axios from "axios";
import Modal from "react-modal";
import Swal from "sweetalert2";
import Select from "react-select";
import { useState } from "react";
import useFetchEmails from "../NewComponents/useFetchEmails";
Modal.setAppElement("#root");

const OrganizationTab = () => {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [apiAccess, setApiAccess] = useState([]);
  const emails = useFetchEmails();

  //for each states
  const [isORGChecked, setIsORGChecked] = useState(false);

  // ORG child states
  const [isSummaryChecked, setIsSummaryChecked] = useState(false);
  const [isDeptChecked, setIsDeptChecked] = useState(false);
  const [isLocationChecked, setIsLocationChecked] = useState(false);
  const [isDesignationChecked, setIsDesignationChecked] = useState(false);
  const [isDomainChecked, setIsDomainChecked] = useState(false);
  const [isUserCategoryChecked, setIsUserCategoryChecked] = useState(false);
  const [hasAmsAccess, setHasAmsAccess] = useState(false);

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
        setIsSummaryChecked(apiAccessNames.includes("Summary"));
        setIsORGChecked(apiAccessNames.includes("ORG"));
        setIsDeptChecked(apiAccessNames.includes("Dept"));
        setIsDomainChecked(apiAccessNames.includes("Domain"));
        setIsDesignationChecked(apiAccessNames.includes("Designation"));
        setIsLocationChecked(apiAccessNames.includes("Location"));
        setIsUserCategoryChecked(apiAccessNames.includes("UserCategory"));
      } catch (error) {
        Swal.fire({
          icon: "warning",
          title: "No Access",
          text: "No Access is available for the provided User.",
        });
      }
    } else {
      setApiAccess([]);
      setIsSummaryChecked(false);
      setIsORGChecked(false);
      setIsDeptChecked(false);
      setIsDomainChecked(false);
      setIsDesignationChecked(false);
      setIsLocationChecked(false);
      setIsUserCategoryChecked(false);
    }
  };

  const handleOrgCheckboxChange = () => {
    const newCheckedState = !isORGChecked;
    setIsORGChecked(newCheckedState);
    if (newCheckedState) {
      setIsSummaryChecked(true);
      setIsDeptChecked(true);
      setIsLocationChecked(true);
      setIsDesignationChecked(true);
      setIsDomainChecked(true);
      setIsUserCategoryChecked(true);
    } else {
      setIsSummaryChecked(false);
      setIsDeptChecked(false);
      setIsLocationChecked(false);
      setIsDesignationChecked(false);
      setIsDomainChecked(false);
      setIsUserCategoryChecked(false);
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
    } else if (apiName === "ORG") {
      setIsORGChecked((prev) => !prev);
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
    const selectedModule = "ORG";
    const selectedApiAccess = [];
    if (isORGChecked) selectedApiAccess.push("ORG");
    if (isSummaryChecked) selectedApiAccess.push("Summary");
    if (isDeptChecked) selectedApiAccess.push("Dept");
    if (isDomainChecked) selectedApiAccess.push("Domain");
    if (isDesignationChecked) selectedApiAccess.push("Designation");
    if (isLocationChecked) selectedApiAccess.push("Location");
    if (isUserCategoryChecked) selectedApiAccess.push("UserCategory");
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

  return (
    <div className="w-full overflow-auto">
      <div className="bg-white p-4 rounded-lg h-[75vh] shadow-md mt-3">
        <form onSubmit={handleSubmit} className="flex flex-col min-h-[70vh]">
          <div className="flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[50%]">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4" > Select User:</label>
            <div className="w-full sm:w-[60%]">
              <Select
                id="email"
                options={emails}
                value={emails.find((user) => user.value === selectedEmail) || null}
                onChange={(selectedOption) => { handleEmailChange({ target: { value: selectedOption?.value || "" }, }); }}
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
            <div className="w-full sm:w-1/2 rounded-lg p-4 h-auto max-h-[450px] overflow-y-auto">
              <div className="rounded-lg overflow-y-auto">
                {/* Parent Checkbox - Organization Setup */}
                <label className="flex items-center font-semibold text-blue-700 text-lg">
                  <input
                    type="checkbox"
                    onChange={handleOrgCheckboxChange}
                    checked={isORGChecked}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2">Organization Setup</span>
                </label>

                {/* Child Checkboxes - Only visible when Organization Setup is checked */}
                {isORGChecked && (
                  <div className="ml-6 mt-3 flex flex-col space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        onChange={() => setIsSummaryChecked(!isSummaryChecked)}
                        checked={isSummaryChecked}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2">Summary</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        onChange={() => setIsDeptChecked(!isDeptChecked)}
                        checked={isDeptChecked}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2">Dept</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        onChange={() => setIsLocationChecked(!isLocationChecked)}
                        checked={isLocationChecked}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2">Location</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        onChange={() => setIsDesignationChecked(!isDesignationChecked)}
                        checked={isDesignationChecked}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2">Designation</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        onChange={() => setIsDomainChecked(!isDomainChecked)}
                        checked={isDomainChecked}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2">Domain</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        onChange={() => setIsUserCategoryChecked(!isUserCategoryChecked)}
                        checked={isUserCategoryChecked}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2">User Directory</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-auto flex justify-start pr-6 pb-6">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md" > Update Access </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default OrganizationTab;
