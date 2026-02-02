import axios from "axios";
import Modal from "react-modal";
import Swal from "sweetalert2";
import React, { useState } from "react";
import Select from "react-select";
import useFetchEmails from "../NewComponents/useFetchEmails";
Modal.setAppElement("#root");

const UpdateAccess = () => {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [isAsmChecked, setIsAsmChecked] = useState(false);
  const [hasAmsAccess, setHasAmsAccess] = useState(false);
  const [apiAccess, setApiAccess] = useState([]);
  const [isApprovalChecked, setIsApprovalChecked] = useState(false);
  const [isLogsChecked, setIsLogsChecked] = useState(false);
  const [isAssetChecked, setIsAssetChecked] = useState(false);
  const [isAssetMovableChecked, setIsAssetMovableChecked] = useState(false);
  const [isAssetRawMaterialChecked, setIsAssetRawMaterialChecked] =
    useState(false);
  const [isCategoryChecked, setIsCategoryChecked] = useState(false);
  const [isValuationChecked, setIsValuationChecked] = useState(false);
  const [isWorkflowChecked, setIsWorkflowChecked] = useState(false);
  const [isAllCategoryChecked, setIsAllCategoryChecked] = useState(false);
  const [isIndexChecked, setIsIndexChecked] = useState(false);
  const [isRawMaterialChecked, setIsRawMaterialChecked] = useState(false);
  const [isFineProductChecked, setIsFineProductChecked] = useState(false);
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
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        const filteredAccess = response.data.filter(
          (access) => access.user_id === parseInt(userId)
        );
        const apiAccessNames = filteredAccess.map((access) => access.api_name);
        setApiAccess(apiAccessNames);
        setIsAsmChecked(apiAccessNames.includes("ASM"));
        setIsAssetMovableChecked(apiAccessNames.includes("AssetMovable"));
        setIsAssetRawMaterialChecked(
          apiAccessNames.includes("AssetRawMaterial")
        );
        setIsApprovalChecked(apiAccessNames.includes("Approvals"));
        setIsLogsChecked(apiAccessNames.includes("Logs"));
        setIsAssetChecked(apiAccessNames.includes("RepoAllTab"));
        setIsCategoryChecked(apiAccessNames.includes("Category"));
        setIsValuationChecked(apiAccessNames.includes("Valuation"));
        setIsWorkflowChecked(apiAccessNames.includes("Workflow"));
        setHasAmsAccess(apiAccessNames.includes("update_access"));
        setIsCategoryChecked(apiAccessNames.includes("Category"));
        setIsAllCategoryChecked(apiAccessNames.includes("AllCategory"));
        setIsIndexChecked(apiAccessNames.includes("Index"));
        setIsRawMaterialChecked(apiAccessNames.includes("RawMaterial"));
        setIsFineProductChecked(apiAccessNames.includes("FineProduct"));
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
      setIsAsmChecked(false);
      setIsApprovalChecked(false);
      setIsLogsChecked(false);
      setIsAssetChecked(false);
      setIsCategoryChecked(false);
      setIsAllCategoryChecked(false);
      setIsIndexChecked(false);
      setIsRawMaterialChecked(false);
      setIsFineProductChecked(false);
      setIsValuationChecked(false);
      setIsWorkflowChecked(false);
      setIsAssetMovableChecked(false);
      setIsAssetRawMaterialChecked(false);
    }
  };

  const handleAsmCheckboxChange = () => {
    const newCheckedState = !isAsmChecked;
    setIsAsmChecked(newCheckedState);
    setIsApprovalChecked(newCheckedState);
    setIsLogsChecked(newCheckedState);
    setIsAssetChecked(newCheckedState);
    setIsCategoryChecked(newCheckedState);
    setIsValuationChecked(newCheckedState);
    setIsWorkflowChecked(newCheckedState);
    setIsAllCategoryChecked(newCheckedState);
    setIsIndexChecked(newCheckedState);
    setIsRawMaterialChecked(newCheckedState);
    setIsFineProductChecked(newCheckedState);
    setIsAssetMovableChecked(newCheckedState);
    setIsAssetRawMaterialChecked(newCheckedState);
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
    } else if (apiName === "ASM") {
      setIsAsmChecked((prev) => !prev);
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
    const selectedModule = "ASM";
    const selectedApiAccess = [];
    if (isAsmChecked) selectedApiAccess.push("ASM");
    if (isApprovalChecked) selectedApiAccess.push("Approvals");
    if (isLogsChecked) selectedApiAccess.push("Logs");
    if (isAssetChecked) selectedApiAccess.push("RepoAllTab");
    if (isAssetMovableChecked) selectedApiAccess.push("AssetMovable");
    if (isAssetRawMaterialChecked) selectedApiAccess.push("AssetRawMaterial");
    if (isCategoryChecked) {
      selectedApiAccess.push("Category");
      if (isAllCategoryChecked) selectedApiAccess.push("AllCategory");
      if (isIndexChecked) selectedApiAccess.push("Index");
      if (isRawMaterialChecked) selectedApiAccess.push("RawMaterial");
      if (isFineProductChecked) selectedApiAccess.push("FineProduct");
    }
    if (isValuationChecked) selectedApiAccess.push("Valuation");
    if (isWorkflowChecked) selectedApiAccess.push("Workflow");
    try {
      const response = await axios.put(
        "https://devdemo.softtrails.net/access/update_access",
        {
          user_id: selectedEmail,
          module: selectedModule,
          api_access: selectedApiAccess.length ? selectedApiAccess : [],
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
    <div className="w-full max-h-[80vh] overflow-auto">
      <div className="bg-white p-4 rounded-lg shadow-md mt-3">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[50%]">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4"
            >
              Select User:
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
            <div className="w-full sm:w-1/2 rounded-lg scrollbar-hide p-4 overflow-y-auto h-[300px]">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  onChange={handleAsmCheckboxChange}
                  checked={isAsmChecked}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-blue-600 text-lg font-bold ml-5">
                  Asset Management
                </span>
              </label>

              {isAsmChecked && (
                <div className="ml-5 mt-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      onChange={() => setIsApprovalChecked(!isApprovalChecked)}
                      checked={isApprovalChecked}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2">Approvals</span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      onChange={() => setIsLogsChecked(!isLogsChecked)}
                      checked={isLogsChecked}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2">Logs</span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      onChange={() => setIsAssetChecked(!isAssetChecked)}
                      checked={isAssetChecked}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2">Asset</span>
                  </label>

                  {/* NEW ACCESS UNDER ASSET */}
                  {isAssetChecked && (
                    <div className="ml-6 mt-2">
                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setIsAssetMovableChecked(!isAssetMovableChecked)
                          }
                          checked={isAssetMovableChecked}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2">Movable</span>
                      </label>

                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setIsAssetRawMaterialChecked(
                              !isAssetRawMaterialChecked
                            )
                          }
                          checked={isAssetRawMaterialChecked}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2">Raw Material</span>
                      </label>
                    </div>
                  )}
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      onChange={() => setIsCategoryChecked(!isCategoryChecked)}
                      checked={isCategoryChecked}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2">Asset Category</span>
                  </label>

                  {/* Category Sub-access */}
                  {isCategoryChecked && (
                    <div className="ml-6 mt-2">
                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setIsAllCategoryChecked(!isAllCategoryChecked)
                          }
                          checked={isAllCategoryChecked}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2">All Category Type</span>
                      </label>

                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() => setIsIndexChecked(!isIndexChecked)}
                          checked={isIndexChecked}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2">Movable Asset</span>
                      </label>

                      <label className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          onChange={() =>
                            setIsRawMaterialChecked(!isRawMaterialChecked)
                          }
                          checked={isRawMaterialChecked}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="ml-2">Raw Material</span>
                      </label>
                      {/* <label className="flex items-center mt-2">
                                                <input
                                                    type="checkbox"
                                                    onChange={() => setIsFineProductChecked(!isFineProductChecked)}
                                                    checked={isFineProductChecked}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                />
                                                <span className="ml-2">Fine Goods</span>
                                            </label> */}
                    </div>
                  )}

                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      onChange={() =>
                        setIsValuationChecked(!isValuationChecked)
                      }
                      checked={isValuationChecked}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2">Asset Valuation</span>
                  </label>
                  <label className="flex items-center mt-2">
                    <input
                      type="checkbox"
                      onChange={() => setIsWorkflowChecked(!isWorkflowChecked)}
                      checked={isWorkflowChecked}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className="ml-2">Asset Workflow</span>
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
