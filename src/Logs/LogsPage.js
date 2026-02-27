import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaHome } from "react-icons/fa";
//import ProfileDropdown from "../../ProfileDropdown";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import Excel from "../assests/excel.png";
import { Filter } from "lucide-react";
import { saveAs } from "file-saver";

const LeaveManagement = () => {
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const [loading, setLoading] = useState(true);
  const [hasAMSAccessLeaveLog, setHasAMSAccessLeaveLog] = useState(false);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null); // State to store clicked log

  useEffect(() => {
    fetch("https://devdemo.softtrails.net/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Users API Response:", data); // Debugging
        if (data && Array.isArray(data)) {
          setUsers(data);
        }
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  useEffect(() => {
    fetch("https://devdemo.softtrails.net/logs/get-logs", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Logs API Response:", data); // Debugging
        if (data.logs) {
          setLogs(data.logs);
        }
      })
      .catch((error) => console.error("Error fetching logs:", error));
  }, []);

  const getUserName = (userId) => {
    console.log("Searching for userId:", userId); // Debugging
    console.log("Current Users:", users); // Debugging

    const user = users.find((u) => String(u.user_id) === String(userId));
    console.log("Matched User:", user); // Debugging
    return user ? `${user.first_name} ${user.last_name}` : "Unknown";
  };

  const handleHome = () => {
    navigate("/Cards");
  };
  const getToken = () => {
    const token = sessionStorage.getItem("token");
    return token;
  };
  const token = getToken();
  console.log("Retrieved token:", token);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      const fetchUserData = async () => {
        try {
          console.log("Fetching data for userId:", userId);
          const response = await axios.get(
            `https://devdemo.softtrails.net/users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("API Response:", response);
          if (response.data.user) {
            const user = response.data.user;
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

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.post(
          "https://devdemo.softtrails.net/users/verify-token",
          { token }
        );
        console.log("Token is valid:", response.data);
        navigate("/LogsPage");
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

  useEffect(() => {
    const checkAMSAccess = async () => {
      setLoading(true);
      try {
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        if (!userId || !token) {
          console.error("userId or token is missing");
          return;
        }
        // Make the API call
        const response = await axios.get(
          `https://devdemo.softtrails.net/access/access/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Access API Response:", response.data);
        const userAccess = response.data;
        const hasLeaveLogAccess = userAccess.some(
          (access) => access.api_name === "LeaveLogs"
        );
        setHasAMSAccessLeaveLog(hasLeaveLogAccess);
      } catch (error) {
        console.error("Error occurred during API call: ", error);
        if (error.response) {
          console.error("API Response error:", error.response.data);
          console.error("Status code:", error.response.status);
        } else if (error.request) {
          console.error("No response received from API:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
        setHasAMSAccessLeaveLog(false);
      } finally {
        setLoading(false);
      }
    };
    checkAMSAccess();
  }, []);

  const dropdownRef = useRef(null);

  //*******************FILTERS*********************/
  const [filteredLogs, setFilteredLogs] = useState(logs);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    username: "",
    startDate: "",
    endDate: "",
    status: "",
    module: "",
    submodule: "",
    method: "",
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      username: "",
      startDate: "",
      endDate: "",
      status: "",
      module: "",
      submodule: "",
      method: "",
    });
  };

  useEffect(() => {
    const filtered = logs.filter((log) => {
      const logDate = log.created_at
        ? new Date(log.created_at).getTime()
        : null;
      const startDate = filters.startDate
        ? new Date(filters.startDate).getTime()
        : null;
      const endDate = filters.endDate
        ? new Date(filters.endDate).getTime()
        : null;

      return (
        (!filters.username ||
          getUserName(log.user_id)
            ?.toLowerCase()
            .includes(filters.username.toLowerCase())) &&
        (!filters.status ||
          log.status?.toLowerCase() === filters.status.toLowerCase()) &&
        (!startDate || (logDate && logDate >= startDate)) &&
        (!endDate || (logDate && logDate <= endDate + 86400000)) && // Including end date till 23:59:59
        (!filters.module ||
          log.module?.toLowerCase().includes(filters.module.toLowerCase())) &&
        (!filters.submodule ||
          log.submodule
            ?.toLowerCase()
            .includes(filters.submodule.toLowerCase())) &&
        (!filters.method ||
          log.method?.toLowerCase() === filters.method.toLowerCase())
      );
    });

    setFilteredLogs(filtered);
  }, [filters, logs]);
  /*************************Excel*************************/
  const downloadExcel = () => {
    if (filteredLogs.length === 0) {
      alert("No data available to export!");
      return;
    }

    // Define table headers
    const headers = [
      [
        "S.no.",
        "Username",
        "API Endpoint",
        "Method",
        "Submodule",
        "Action",
        "Status",
        "Created At",
        "Request Payload",
        "Response Payload",
      ],
    ];

    // Convert data to worksheet format
    const data = filteredLogs.map((log, index) => [
      index + 1,
      getUserName(log.user_id),
      log.api_endpoint,
      log.method,
      log.submodule,
      log.action,
      log.status,
      new Date(log.created_at).toLocaleString(),
      JSON.stringify(log.request_payload), // Convert request payload to string
      JSON.stringify(log.response_payload), // Convert response payload to string
    ]);

    // Create worksheet and workbook
    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");

    // Convert to Excel file and trigger download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, "Logs.xlsx");
  };

  /********************************   PAGINATION    ****************************************/
  const logsPerPage = 100; // Change this as needed
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setCurrentPage(1); // Reset to page 1 whenever filters change
  }, [filters]);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col w-full">
        {/* Header */}
        {/* Main Content */}
        <div className="overflow-x-auto max-h-screen bg-white p-5">
          {/* Filter Toggle Button */}
          <div className="flex justify-end">
            <button
              className="flex gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-5"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
            </button>
            <button
              onClick={downloadExcel}
              className="text-green-600 hover:text-green-800"
            >
              <img src={Excel} alt="Excel Logo" className="w-8 h-8" />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white shadow-lg p-5 rounded-lg mt-3 animate-fade-in border border-gray-200">
              {/* Filter Fields */}
              <div className="grid grid-cols-4 gap-4 items-end">
                {/* Username Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    placeholder="Enter username..."
                    value={filters.username}
                    onChange={handleFilterChange}
                    className="border p-2 rounded w-full focus:outline-blue-400"
                  />
                </div>

                {/* Date Range Filter */}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-600">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      name="startDate"
                      value={filters.startDate}
                      onChange={handleFilterChange}
                      className="border p-2 rounded w-full focus:outline-blue-400"
                    />
                    <input
                      type="date"
                      name="endDate"
                      value={filters.endDate}
                      onChange={handleFilterChange}
                      className="border p-2 rounded w-full focus:outline-blue-400"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    className="border p-2 rounded w-full bg-white focus:outline-blue-400"
                  >
                    <option value="">All Status</option>
                    <option value="success">✅ Success</option>
                    <option value="failed">❌ Failed</option>
                  </select>
                </div>

                {/* Module Filter */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Module
                  </label>
                  <input
                    type="text"
                    name="module"
                    value={filters.module || ""} // Default to empty string
                    onChange={handleFilterChange}
                    className="border p-2 rounded w-full bg-white focus:outline-blue-400"
                    placeholder="Enter Module"
                  />
                </div>

                {/* Submodule Filter (Dynamic) */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Submodule
                  </label>
                  <input
                    type="text"
                    name="submodule"
                    value={filters.submodule || ""} // Default to empty string
                    onChange={handleFilterChange}
                    className="border p-2 rounded w-full bg-white focus:outline-blue-400"
                    disabled={!filters.module}
                    placeholder="Enter Submodule"
                  />
                </div>

                {/* Method Filter (Dropdown) */}
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Method
                  </label>
                  <select
                    name="method"
                    value={filters.method || ""} // Default to empty string
                    onChange={handleFilterChange}
                    className="border p-2 rounded w-full bg-white focus:outline-blue-400"
                  >
                    <option value="">Select Method</option>
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PUT">PUT</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end mt-5 gap-3">
                <button
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition"
                  onClick={clearFilters}
                >
                  🔄 Reset
                </button>
                <button
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
                  onClick={() => setShowFilters(false)}
                >
                  ✅ Apply
                </button>
              </div>
            </div>
          )}

          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-200 top-0 z-10">
              <tr>
                <th className="border-b text-left p-3">S.no.</th>
                <th className="border-b text-left p-3">Username</th>
                {/* <th className="border-b text-left p-3">API Endpoint</th> */}
                <th className="border-b text-left p-3">Module</th>
                <th className="border-b text-left p-3">Submodule</th>
                <th className="border-b text-left p-3">Method</th>
                <th className="border-b text-left p-3">Action</th>
                <th className="border-b text-left p-3">Status</th>
                <th className="border-b text-left p-3">Created At</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.length > 0 ? (
                currentLogs.map((log, index) => (
                  <tr key={log.id} className="hover:bg-gray-100">
                    <td className="p-3 border-b text-left">
                      {(currentPage - 1) * logsPerPage + index + 1}
                    </td>
                    <td className="p-3 border-b text-left">
                      {getUserName(log.user_id)}
                    </td>
                    {/* <td className="p-3 border-b text-left">{log.api_endpoint}</td> */}
                    <td className="p-3 border-b text-left">{log.module}</td>
                    <td className="p-3 border-b text-left">{log.submodule}</td>
                    <td className="p-3 border-b text-left">{log.method}</td>
                    <td className="p-3 border-b text-left">{log.action}</td>
                    <td
                      className={`p-3 border-b cursor-pointer font-semibold ${
                        log.status.toLowerCase() === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                      onClick={() => setSelectedLog(log)}
                    >
                      {log.status
                        ? log.status.charAt(0).toUpperCase() +
                          log.status.slice(1).toLowerCase()
                        : "N/A"}
                    </td>
                    <td className="p-3 border-b text-left">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="border px-4 py-2 text-center">
                    No logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-center items-center p-4">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index}
                onClick={() => handlePageChange(index + 1)}
                className={`px-3 py-1 mx-1 rounded ${
                  currentPage === index + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {selectedLog && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-5 rounded-lg max-w-2xl w-full relative">
                <button
                  className="absolute top-2 right-3 text-gray-600 hover:text-red-600 text-xl"
                  onClick={() => setSelectedLog(null)}
                >
                  ×
                </button>
                <h2 className="text-lg font-semibold mb-3">Log Details</h2>
                <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-80">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default LeaveManagement;
