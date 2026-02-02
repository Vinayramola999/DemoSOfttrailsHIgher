import React, { useState, useEffect, useRef } from "react";
import { FaHome, FaSignOutAlt, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
//
import axios from "axios";
import ProfileDropdown from "../../ProfileDropdown";
import DepreciationHistory from "./DepreciationHistory"; // path adjust kar lena based on your file structure
import Select from "react-select"; // at the top of your file
import Excel from "../../assests/excel.png";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase";
import { motion } from "framer-motion";
const DepreciationPage = () => {
  const [activeTab, setActiveTab] = useState("setup");
  const [tabWidth, setTabWidth] = useState(0);
const [activeLeft, setActiveLeft] = useState(0);
const tabRefs = useRef([]);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("WDV");
  const [showModal, setShowModal] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [depreciationValue, setDepreciationValue] = useState("");
  const [data, setData] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [viewData, setViewData] = useState([]);
  const [startDate, setStartDate] = useState("");
   const [message, setMessage] = useState(""); // State to store the message
    const [messageType, setMessageType] = useState("");
  const [dateOption, setDateOption] = useState("custom"); // New state for date range option
  const [categoryError, setCategoryError] = useState("");
  const [depreciationError, setDepreciationError] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // You can change this
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState(null);
const tabs = [
  { id: "setup", label: "Setup WDV" },
  { id: "view", label: "View Depreciation" },
  { id: "history", label: "Depreciation History" },
];

useEffect(() => {
  if (tabRefs.current[0]) {
    const index = tabs.findIndex((tab) => tab.id === activeTab);
    const currentTab = tabRefs.current[index];
    setTabWidth(currentTab.offsetWidth);
    setActiveLeft(currentTab.offsetLeft);
  }
}, [activeTab]);
useEffect(() => {
  const fetchCategories = async () => {
    try {
      const token = sessionStorage.getItem("token"); // get token

      const response = await fetch(
       `${JAVA_BASE}api/categories/movable`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      setCategories(result);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token"); // get token

      const response = await fetch(`${JAVA_BASE}test/depr/getall`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  fetchCategories();
  fetchData();
}, []);


  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "view") {
      setShowModal(true);
      setShowTable(false);
    } else {
      setShowModal(false);
    }
  };

const fetchViewData = async () => {
  const formattedStartDate = dateOption === "custom" ? startDate : ""; // Only set if custom

  try {
    let endpoint = "";
    if (dateOption === "today") {
      if (selectedMethod === "WDV") {
        endpoint = `${JAVA_BASE}api/dep/calculateWDB/${selectedCategory}`;
      } else if (selectedMethod === "SLM") {
        endpoint = `${JAVA_BASE}test/depr/calculateSLM/${selectedCategory}`;
      }
    } else if (dateOption === "custom" && formattedStartDate) {
      if (selectedMethod === "WDV") {
        endpoint = `${JAVA_BASE}api/dep/calculateWDBByDate/${selectedCategory}/${formattedStartDate}?page=0&size=20`;
      } else if (selectedMethod === "SLM") {
        endpoint = `${JAVA_BASE}api/dep/calculateSlmDepreciationToDate/${selectedCategory}/${formattedStartDate}`;
      }
    }

    if (endpoint) {
      const token = sessionStorage.getItem("token"); // get token

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      setViewData(result);
      setShowTable(true);
      setShowModal(false);
    }
  } catch (error) {
    console.error("Error fetching depreciation data:", error);
    setShowModal(false);
  }
};


  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginatedData = (
    selectedMethod === "SLM" && Array.isArray(viewData?.assets)
      ? viewData.assets
      : Array.isArray(viewData)
      ? viewData
      : []
  ).slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalItems =
    selectedMethod === "SLM" && Array.isArray(viewData?.assets)
      ? viewData.assets.length
      : Array.isArray(viewData)
      ? viewData.length
      : 0;

  const totalPages = Math.ceil(totalItems / itemsPerPage);

const handleSubmit = async (e) => {
  e.preventDefault();

  // Reset errors
  setCategoryError("");
  setDepreciationError("");
  setMessage("");
  setMessageType("");

  let hasError = false;

  if (!selectedCategory || selectedCategory.trim() === "") {
    setCategoryError("Please select an asset category.");
    hasError = true;
  }

  if (
    !depreciationValue ||
    isNaN(depreciationValue) ||
    parseFloat(depreciationValue) <= 0
  ) {
    setDepreciationError("Please enter a valid depreciation percentage.");
    hasError = true;
  }

  if (hasError) return;

  const payload = {
    categoriesname: selectedCategory,
    assertName: " ",
    deprecessionPercentage: parseFloat(depreciationValue),
    createdBy: " ",
  };

  try {
    const token = sessionStorage.getItem("token"); // get token

    const response = await fetch(
      `${JAVA_BASE}test/depr/save`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // attach token
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const updatedData = await fetch(
        `${JAVA_BASE}test/depr/getall`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // attach token
          },
        }
      );
      const result = await updatedData.json();
      setData(result);
      resetForm();

      setMessage("Depreciation value set successfully.");
      setMessageType("success");
    } else {
      setMessage("Failed to save depreciation value.");
      setMessageType("error");
    }
  } catch (error) {
    console.error("Error submitting data:", error);
    setMessage("Something went wrong while saving.");
    setMessageType("error");
  } finally {
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  }
};



  const handleEdit = (item) => {
    setEditingItem(item);
    setSelectedCategory(item.categoriesname);
    setDepreciationValue(item.deprecessionPercentage);
    setShowModal(true);
  };
  const handleViewSubmit = async () => {
    if (!selectedCategory) {
      setErrorMessage("⚠️ Please select an asset category.");
      setTimeout(() => setErrorMessage(""), 3000); // auto-dismiss in 3 sec
      return;
    }

    await fetchViewData();
  };

const handleUpdate = async (e) => {
  e.preventDefault();
  if (!editingItem) return;

  const payload = {
    ...editingItem,
    categoriesname: selectedCategory,
    deprecessionPercentage: parseFloat(depreciationValue),
  };

  try {
    const token = sessionStorage.getItem("token"); // Get token

    const response = await fetch(
      `${JAVA_BASE}test/depr/update/${editingItem.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Attach token
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.ok) {
      const updatedData = await fetch(
       `${JAVA_BASE}test/depr/getall`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token
          },
        }
      );
      const result = await updatedData.json();
      setData(result);
      resetForm();
    } else {
      console.error("Failed to update data");
    }
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

const handleDelete = async (id) => {
  try {
    const token = sessionStorage.getItem("token"); // Get token

    const response = await fetch(
      `${JAVA_BASE}test/depr/delete/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Attach token
        },
      }
    );

    if (response.ok) {
      const updatedData = await fetch(
      `${JAVA_BASE}test/depr/getall`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Attach token
          },
        }
      );
      const result = await updatedData.json();
      setData(result);

      setMessage("Asset Valuation percentage deleted successfully.");
      setMessageType("success");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } else {
      setMessage("Failed to delete Asset Valuation percentage.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    setMessage("Something went wrong while deleting.");
    setMessageType("error");

    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 3000);
  }
};


  const resetForm = () => {
    setSelectedCategory("");
    setDepreciationValue("");
    setEditingItem(null);
    setShowModal(false);
    setShowTable(false);
  };

  const exportToCSV = () => {
    if (!Array.isArray(viewData) || viewData.length === 0) {
      alert("No data available to export.");
      return;
    }

    const csvData = [
      [
        "Sr. No.",
        "Asset Name",
        "Purchase Date",
        "Original Cost",
        selectedMethod === "SLM" ? "SLM Value" : "Future WDV",
        selectedMethod === "SLM" ? "Scrap Value" : "Scrap Value",
        selectedMethod === "WDV" ? "Useful Life" : "Useful Life",
        selectedMethod === "WDV" ? "Years Used" : "Years Used",
      ],
      ...viewData.map((item, index) => [
        index + 1,
        item["Asset Name"] || item.assetName || "",
        item["Purchase Date"] || item.purchaseDate || "",
        item["Original Cost"] || item.originalCost || "",
        selectedMethod === "SLM"
          ? item["SLM Value"] || item.slmDepreciation || ""
          : item["Future WDB"] || item.wdvDepreciation || "",
        item["Scrap Value"] || "",
        item["Useful Life"] || "",
        item["Years Used"] || "",
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csvData.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "depreciation_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    const userId = sessionStorage.getItem("userId");
    console.log("UserId:", userId);
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
          if (response.data) {
            const user = response.data;
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
        navigate("/Depreciation");
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const dropdownRef = useRef(null);

  return (
        <div className="flex flex-col h-screen overflow-hidden">
      <div className="flex">
        <div className="w-full">
          <div className="w-[50%] ">
            <div className="relative flex flex-wrap justify-start gap-2 md:gap-3 pb-2 pl-2 md:pl-6">   
              <motion.div
                layoutId="activeTab"
                className="absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full"
                style={{ width: tabWidth, left: activeLeft }}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[index] = el)}
                  onClick={() => handleTabSwitch(tab.id)}
                  className={`relative z-10 flex-1 text-center py-2 px-4 font-bold rounded-full transition-all duration-300 ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-gray-700 hover:text-blue-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Depreciation History */}
          {activeTab === "history" && (
            <DepreciationHistory historyData={historyData} />
          )}

          {/* Setup WDV Section */}
          <div className="p-6">
            {activeTab === "setup" ? (
              <div>
                <div className="flex md:grid-cols-3 gap-4 mb-7">
                  <div className="flex flex-col">
                    <label
                      htmlFor="categories"
                      className="mb-2 text-gray-700 font-bold"
                    >
                      Select Asset Category
                    </label>

                    <Select
                      id="categories"
                      className="w-[250px]"
                      classNamePrefix="react-select"
                      placeholder="Select Asset Category"
                      isSearchable
                      value={
                        selectedCategory
                          ? { label: selectedCategory, value: selectedCategory }
                          : null
                      }
                      onChange={(option) =>
                        setSelectedCategory(option ? option.value : "")
                      }
                      options={
                        Array.isArray(categories)
                          ? categories
                              .filter(
                                (category) =>
                                  !data.some(
                                    (item) =>
                                      item.categoriesname.toLowerCase() ===
                                      category.categoriesname.toLowerCase()
                                  )
                              )
                              .map((category) => ({
                                label: category.categoriesname,
                                value: category.categoriesname,
                              }))
                          : []
                      }
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="depreciation"
                      className="mb-2 text-gray-700 font-bold"
                    >
                      Depreciation Value (%)
                    </label>
                    <input
                      id="depreciation"
                      type="number"
                      value={depreciationValue}
                      onChange={(e) => setDepreciationValue(e.target.value)}
                      placeholder="Enter Dep Value"
                      className="px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-200 w-[250px]"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={editingItem ? handleUpdate : handleSubmit}
                      className="w-[250px] px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition duration-300"
                    >
                      {editingItem ? "Update" : "Submit"}
                    </button>
                  </div>
                </div>

                <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
                  <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
                    <table className="min-w-full table-auto border-collapse ">
                      <thead className="text-[16px] font-medium bg-white sticky top-0  border-b-2 border-black">
                        <tr>
                          <th className="p-5 text-left font-bold ">
                            S.No
                          </th>
                          <th className="p-5 text-left font-bold ">
                            Asset Category
                          </th>
                          <th className="p-5 text-left font-bold ">
                            Depreciation [%]
                          </th>
                          <th className="p-5 text-left font-bold ">
                            Created On
                          </th>
                          <th className="p-5 text-left font-bold ">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(data) && data.length > 0 ? (
                          data.map((item, index) => (
                            <tr
                              key={index}
                              className={`border-t ${
                                index % 2 === 0 ? "bg-blue-50" : "bg-white"
                              }`}
                            >
                              <td className="px-5 py-3 text-left text-gray-700">
                                {index + 1}
                              </td>
                              <td className="px-5 py-3 text-left text-gray-700">
                                {item.categoriesname}
                              </td>
                              <td className="px-5 py-3 text-left text-gray-700">
                                {item.deprecessionPercentage}
                              </td>
                              <td className="px-5 py-3 text-left text-gray-700">
                                {new Date(item.createdat).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}
                              </td>
                              <td className="px-5 py-3 text-left text-gray-700 flex gap-3">
                                {/* <button
                                  onClick={() => handleEdit(item)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <FaEdit className="text-md" />
                                </button> */}
                                <button
                                  onClick={() => {
                                    setSelectedDeleteId(item.id);
                                    setShowDeleteModal(true);
                                  }}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTrash className="text-md" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="5"
                              className="py-6 px-4 text-center text-gray-500"
                            >
                              No data available.
                            </td>
                          </tr>
                        )}
                     {showDeleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
      <h2 className="text-lg font-bold mb-4 text-gray-800">
        Are you sure you want to delete this Asset Valuation percentage?
      </h2>

      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 text-sm text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>

  <button
  onClick={async () => {
    try {
      const response = await fetch(
        `${JAVA_BASE}test/depr/delete/${selectedDeleteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const updatedData = await fetch(
          `${JAVA_BASE}test/depr/getall`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            },
          }
        );
        const result = await updatedData.json();
        setData(result);
        setMessage("Asset Valuation percentage deleted successfully.");
        setMessageType("success");
      } else {
        setMessage("Failed to delete Asset Valuation percentage.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      setMessage("Something went wrong while deleting.");
      setMessageType("error");
    } finally {
      setShowDeleteModal(false);
      setSelectedDeleteId(null);
      // Auto clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  }}
  className="px-4 py-2 text-sm text-white bg-red-500 rounded hover:bg-red-600"
>
  Yes, Delete
</button>

      </div>
    </div>
  </div>
)}

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                {showModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 md:p-8 transition-all duration-300 transform scale-100">
                      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
                        Depreciation Method Selection
                      </h2>
                      {errorMessage && (
                        <div className="mb-4 px-4 py-3 bg-red-100 text-red-700 text-center rounded-lg border border-red-300 shadow-sm">
                          {errorMessage}
                        </div>
                      )}
                      <div className="mb-6 px-4 py-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 rounded-md shadow-sm text-sm">
                        <strong>Note:</strong> To view depreciation values using
                        the <span className="font-bold">WDV method</span>,
                        please ensure that the selected asset category has been
                        configured with WDV setup. Only after the setup is
                        complete will the depreciation values be available for
                        that category.
                      </div>

                      {/* Method Selection */}
                      <div className="flex items-center justify-center gap-6 mb-6">
                        <label className="flex items-center gap-2 text-gray-800 font-medium cursor-pointer">
                          <input
                            type="radio"
                            value="WDV"
                            checked={selectedMethod === "WDV"}
                            onChange={() => setSelectedMethod("WDV")}
                            className="accent-blue-600 w-4 h-4"
                          />
                          WDV
                        </label>
                        <label className="flex items-center gap-2 text-gray-800 font-medium cursor-pointer">
                          <input
                            type="radio"
                            value="SLM"
                            checked={selectedMethod === "SLM"}
                            onChange={() => {
                              setSelectedMethod("SLM");
                              setDateOption("today");
                              setStartDate("");
                            }}
                            className="accent-blue-600 w-4 h-4"
                          />
                          SLM
                        </label>
                      </div>

                      {/* Asset Category */}
                      <div className="mb-6">
                        <label
                          htmlFor="categories"
                          className="block text-gray-700 font-bold mb-2"
                        >
                          Select Asset Category
                        </label>

                        <Select
                          id="categories"
                          className="w-full"
                          classNamePrefix="react-select"
                          placeholder="Select Asset Category"
                          isSearchable
                          value={
                            selectedCategory
                              ? {
                                  label: selectedCategory,
                                  value: selectedCategory,
                                }
                              : null
                          }
                          onChange={(option) =>
                            setSelectedCategory(option ? option.value : "")
                          }
                          options={
                            Array.isArray(categories)
                              ? categories.map((category) => ({
                                  label: category.categoriesname,
                                  value: category.categoriesname,
                                }))
                              : []
                          }
                        />
                      </div>

                      {/* Date Range */}
                      <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">
                          As on
                        </label>
                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={() => {
                              setDateOption("today");
                              setStartDate("");
                            }}
                            className={`px-6 py-2 rounded-md font-bold shadow-sm transition duration-200 ${
                              dateOption === "today"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            Today
                          </button>

                          {selectedMethod !== "SLM" && (
                            <button
                              onClick={() => setDateOption("custom")}
                              className={`px-6 py-2 rounded-md font-bold shadow-sm transition duration-200 ${
                                dateOption === "custom"
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              Custom Date
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Custom Date */}
                      {selectedMethod !== "SLM" && dateOption === "custom" && (
                        <div className="mb-6">
                          <label
                            htmlFor="startDate"
                            className="block text-gray-700 font-bold mb-2"
                          >
                            Select Date
                          </label>
                          <input
                            type="date"
                            id="startDate"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-300"
                          />
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex justify-end gap-4 mt-6">
                        <button
                          onClick={() => setShowModal(false)}
                          className="px-5 py-2 rounded-md text-white bg-red-500 hover:bg-red-600 transition duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleViewSubmit}
                          className="px-6 py-2 rounded-md bg-blue-600 text-white font-bold hover:bg-blue-700 transition duration-200"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* View Depreciation Table */}
                {showTable && (
                  <div className="relative w-full  shadow rounded-lg overflow-hidden">
                    <button onClick={exportToCSV}>
                      <img
                        src={Excel}
                        alt="Export to Excel"
                        className="w-10 h-10"
                      />
                    </button>

                    <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh] border rounded-lg">
                      <table className="min-w-full table-auto border-collapse ">
                        <thead className="text-[16px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                          <tr>
                            <th className="p-5 text-left font-bold ">
                              Sr. No.
                            </th>
                            <th className="p-5 text-left font-bold ">
                              Asset
                            </th>
                            <th className="p-5 text-left font-bold ">
                              Original Cost
                            </th>

                            {selectedMethod === "SLM" && (
                              <th className="p-5 text-left font-bold ">
                                SLM Depreciation
                              </th>
                            )}
                            {selectedMethod === "WDV" && (
                              <>
                                <th className="p-5 text-left font-bold ">
                                  WDV Depreciation
                                </th>
                                <th className="p-5 text-left font-bold ">
                                  Years Used
                                </th>
                              </>
                            )}

                            <th className="p-5 text-left font-bold ">
                              Asset Added On
                            </th>
                          </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedData.map((item, index) => {
                            const srNo =
                              (currentPage - 1) * itemsPerPage + index + 1;
                            return (
                              <tr
                                key={index}
                                className={`border-t ${
                                  index % 2 === 0 ? "bg-blue-50" : "bg-white"
                                }`}
                              >
                                <td className="px-5 py-3 text-left text-gray-700">
                                  {srNo}
                                </td>
                                <td className="px-5 py-3 text-left text-gray-700">
                                  {item["Asset Name"]}
                                </td>
                                <td className="px-5 py-3 text-left text-gray-700">
                                  {item["Original Cost"]}
                                </td>

                                {selectedMethod === "SLM" && (
                                  <td className="px-5 py-3 text-left text-gray-700">
                                    {item["SLM Value"]}
                                  </td>
                                )}

                                {selectedMethod === "WDV" && (
                                  <>
                                    <td className="px-5 py-3 text-left text-gray-700">
                                      {item["Future WDB"]}
                                    </td>
                                    <td className="px-5 py-3 text-left text-gray-700">
                                      {item["Years Used"] === 0
                                        ? "New asset"
                                        : `Used for ${item["Years Used"]} year${
                                            item["Years Used"] > 1 ? "s" : ""
                                          }`}
                                    </td>
                                  </>
                                )}

                                <td className="px-5 py-3 text-left text-gray-700">
                                  {(() => {
                                    const date = new Date(
                                      item["Purchase Date"]
                                    );
                                    const day = date
                                      .getDate()
                                      .toString()
                                      .padStart(2, "0");
                                    const month = date.toLocaleString(
                                      "default",
                                      { month: "short" }
                                    );
                                    const year = date.getFullYear();
                                    return `${day}-${month}-${year}`;
                                  })()}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {totalPages > 1 && (
                      <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
                        <button
                          onClick={() =>
                            handlePageChange(Math.max(currentPage - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          &lt;
                        </button>

                        <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
                          {currentPage}
                        </span>

                        <span className="text-sm font-medium">of</span>

                        <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">
                          {totalPages}
                        </span>

                        <button
                          onClick={() =>
                            handlePageChange(
                              Math.min(currentPage + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          &gt;
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

       {/* Message Modal */}
            <MessageModal
              message={message}
              type={messageType}
              setMessage={setMessage}
            />
    </div>
  );
};
export default DepreciationPage;
