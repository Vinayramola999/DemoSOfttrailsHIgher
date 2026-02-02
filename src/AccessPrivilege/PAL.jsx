import axios from "axios";
import Modal from "react-modal";
import Swal from "sweetalert2";
import Select from "react-select";
import React, { useState } from "react";
import useFetchEmails from "../NewComponents/useFetchEmails";
Modal.setAppElement("#root");

const PAL = () => {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [apiAccess, setApiAccess] = useState([]);

  // Access States
  const [isPALChecked, setIsPALChecked] = useState(false);
  const [isFineGoodsChecked, setIsFineGoodsChecked] = useState(false); // Asset Fine Goods
  const [isCategoryFineGoodsChecked, setIsCategoryFineGoodsChecked] =
    useState(false); // Category Fine Goods

  const [hasAmsAccess, setHasAmsAccess] = useState(false);
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

        // Set Access Values
        setIsPALChecked(apiAccessNames.includes("PAL"));
        setIsFineGoodsChecked(apiAccessNames.includes("AssetFineGoods"));
        setIsCategoryFineGoodsChecked(apiAccessNames.includes("FineProduct"));
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
      setIsPALChecked(false);
      setIsFineGoodsChecked(false);
      setIsCategoryFineGoodsChecked(false);
    }
  };

  const handleApiAccessChange = async (apiName) => {
    const isAlreadySelected = apiAccess.includes(apiName);
    setApiAccess((prev) =>
      isAlreadySelected
        ? prev.filter((name) => name !== apiName)
        : [...prev, apiName]
    );

    if (apiName === "update_access") {
      setHasAmsAccess((prev) => !prev);
    } else if (apiName === "PAL") {
      setIsPALChecked((prev) => !prev);
    } else if (apiName === "AssetFineGoods") {
      setIsFineGoodsChecked((prev) => !prev);
    } else if (apiName === "FineProduct") {
      setIsCategoryFineGoodsChecked((prev) => !prev);
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

    const selectedModule = "PAL";
    const selectedApiAccess = [];

    if (isPALChecked) selectedApiAccess.push("PAL");
    if (isFineGoodsChecked) selectedApiAccess.push("AssetFineGoods"); // Asset Fine Goods
    if (isCategoryFineGoodsChecked) selectedApiAccess.push("FineProduct"); // Category Fine Goods

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
          {/* Select User */}
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

          {/* Permissions */}
          <div className="flex flex-col sm:flex-row mt-6">
            <div className="w-full sm:w-1/2 rounded-lg p-4 overflow-y-auto h-[300px]">
              {/* PAL */}
              <label className="flex items-center">
                <input
                  type="checkbox"
                  onChange={() => handleApiAccessChange("PAL")}
                  checked={isPALChecked}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-blue-600 text-lg font-bold ml-5">
                  Product Assembly Line
                </span>
              </label>

              {/* Asset Fine Goods */}
              <label className="flex items-center mt-4">
                <input
                  type="checkbox"
                  onChange={() => handleApiAccessChange("AssetFineGoods")}
                  checked={isFineGoodsChecked}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-green-600 text-lg font-bold ml-5">
                  Asset Fine Goods
                </span>
              </label>

              {/* Category Fine Goods */}
              <label className="flex items-center mt-4">
                <input
                  type="checkbox"
                  onChange={() => handleApiAccessChange("FineProduct")}
                  checked={isCategoryFineGoodsChecked}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="text-purple-600 text-lg font-bold ml-5">
                  Category Fine Goods
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6 ml-5">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PAL;
