// AssetHistoryActivityFeed.jsx
import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import * as XLSX from "xlsx";
import Excel from "../../assests/excel.png";
import { saveAs } from "file-saver";
import {
  JAVA_BASE,
  MAIN_BASE,
} from "../../config/apiBase";

import {
  FiClock,
  FiChevronRight,
  FiChevronLeft,
  FiDatabase,
  FiCheckCircle,
  FiAlertTriangle,
  FiMapPin,
  FiUser,
} from "react-icons/fi";

const AssetHistoryActivityFeed = () => {
  const token = sessionStorage.getItem("token");

  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ assetname: "", categoryname: "" });
  const [loading, setLoading] = useState(true);

  const logsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch users
  useEffect(() => {
    fetch(`${MAIN_BASE}users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setUsers(d))
      .catch((error) => console.warn("Failed to fetch users:", error));
  }, [token]);

  // Fetch history
  useEffect(() => {
    setLoading(true);
    fetch(`${JAVA_BASE}api/assethistory/with-location-details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d) ? d : d.history || [];
        arr.sort((a, b) => new Date(b.updatedOn) - new Date(a.updatedOn));
        setLogs(arr);
      })
      .catch((error) => {
        console.warn("Failed to fetch asset history:", error);
        setLogs([]);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const getUserName = (id, fallback) => {
    if (fallback) return fallback;
    const u = users.find((x) => String(x.user_id) === String(id));
    return u ? `${u.first_name} ${u.last_name}` : "Unknown";
  };

  // Filters
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const a = log.assetname?.toLowerCase() || "";
      const c = log.CategoriesName?.toLowerCase() || "";

      return (
        a.includes(filters.assetname.toLowerCase()) &&
        c.includes(filters.categoryname.toLowerCase())
      );
    });
  }, [logs, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const indexOfLast = currentPage * logsPerPage;
  const indexOfFirst = indexOfLast - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);

  useEffect(() => setCurrentPage(1), [filters]);

  // Excel Export
  const downloadExcel = () => {
    const headers = [
      [
        "S.no.",
        "Asset Name",
        "Asset ID",
        "Previous Substage",
        "Current Substage",
        "Previous Status",
        "Current Status",
        "Updated On",
        "Category Name",
        "Action Performed",
        "Action By",
      ],
    ];

    const data = filteredLogs.map((log, i) => [
      i + 1,
      log.assetname,
      log.assetId,
      log.previousSubStages,
      log.currentSubStages,
      log.previousStatus,
      log.currentStatus,
      log.updatedOn
        ? new Date(log.updatedOn).toLocaleString()
        : "N/A",
      log.CategoriesName,
      log.ActionPerformend,
      log.updatedByName || getUserName(log.updatedBy),
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");

    const blob = new Blob(
      [
        XLSX.write(wb, {
          bookType: "xlsx",
          type: "array",
        }),
      ],
      {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    );

    saveAs(blob, "AssetHistory.xlsx");
  };

  const getActionIcon = (log) => {
    const act = log.ActionPerformend?.toLowerCase() || "";
    const st = log.currentStatus?.toLowerCase() || "";

    if (act.includes("approved")) return <FiCheckCircle className="text-green-600" />;
    if (act.includes("request")) return <FiAlertTriangle className="text-yellow-600" />;
    if (st.includes("inventory")) return <FiDatabase className="text-blue-600" />;
    if (act.includes("transfer") || act.includes("maintenance"))
      return <FiMapPin className="text-purple-600" />;

    return <FiClock className="text-gray-600" />;
  };

  const formatDate = (dt) => {
    if (!dt) return "N/A";
    return new Date(dt).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatJSON = (obj) => {
    if (!obj) return [];

    return Object.entries(obj).map(([key, value]) => {
      let type = typeof value;

      return (
        <div key={key} className="flex justify-between border-b py-1.5">
          <span className="font-medium text-gray-700">{key}</span>

          <span
            className={
              type === "number"
                ? "text-blue-600"
                : type === "boolean"
                  ? "text-purple-600"
                  : value === null
                    ? "text-red-500"
                    : "text-gray-800"
            }
          >
            {type === "object"
              ? JSON.stringify(value)
              : String(value)}
          </span>
        </div>
      );
    });
  };


  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      <div className="flex flex-col w-full p-4">

        {/* HEADER */}
        <div className="p-5 mb-4 sticky top-0 z-20 bg-white/95 backdrop-blur-xl rounded-xl shadow border">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 tracking-tight">
                Activity Feed
              </h1>
              <p className="text-sm text-gray-500">
                Monitor all asset actions in real-time.
              </p>
            </div>

            <div className="flex items-center gap-4">

              {/* Asset filter */}
              <div>
                <label className="text-xs font-medium text-gray-600">Asset Name</label>
                <input
                  name="assetname"
                  value={filters.assetname}
                  onChange={(e) =>
                    setFilters({ ...filters, assetname: e.target.value })
                  }
                  placeholder="Search asset..."
                  className="ml-2 px-3 py-2 w-44 border rounded-md text-sm bg-gray-50 focus:outline-blue-500 focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* Category filter */}
              <div>
                <label className="text-xs font-medium text-gray-600">Category</label>
                <input
                  name="categoryname"
                  value={filters.categoryname}
                  onChange={(e) =>
                    setFilters({ ...filters, categoryname: e.target.value })
                  }
                  placeholder="Search category..."
                  className="ml-2 px-3 py-2 w-44 border rounded-md text-sm bg-gray-50 focus:outline-blue-500 focus:ring-2 focus:ring-blue-300"
                />
              </div>

              {/* Export */}
              <button
                onClick={downloadExcel}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm shadow-md transition"
              >
                <img src={Excel} className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex gap-6 h-full overflow-hidden">

          {/* LEFT LIST */}
          <div className="flex-1 pr-2 overflow-y-auto">

            {loading ? (
              <div className="py-20 text-center text-gray-500 font-medium">
                Loading history...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-20 text-center text-gray-500 font-medium">
                No matching records found.
              </div>
            ) : (
              <div className="space-y-4">
                {currentLogs.map((log, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedLog(log)}
                    className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition p-4 border border-gray-100"
                  >
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-gray-100 border flex items-center justify-center rounded-lg text-2xl">
                        {getActionIcon(log)}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-gray-800">
                              {log.assetname}
                            </h3>

                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                              <span>{log.previousStatus} → {log.currentStatus}</span>
                              <span className="text-gray-400">•</span>
                              <span className="font-medium">{log.ActionPerformend}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-gray-400">{formatDate(log.updatedOn)}</div>
                            <div className="flex justify-end gap-1 items-center text-xs text-gray-500">
                              <FiUser />
                              {getUserName(log.updatedBy, log.updatedByName)}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4 mt-3 text-xs text-gray-500">
                          <div className="flex gap-1 items-center">
                            <FiClock />
                            {new Date(log.updatedOn).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>

                          {log.locationDetails?.locality && (
                            <div className="flex gap-1 items-center">
                              <FiMapPin />
                              {log.locationDetails.locality}
                            </div>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold ${log.currentStatus === "Inventory"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                              }`}
                          >
                            {log.currentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="sticky bottom-0 bg-white mt-4 p-3 border-t border-gray-200 rounded-md shadow-md flex justify-center items-center gap-3">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <FiChevronLeft />
                </button>

                <span className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-semibold">
                  {currentPage}
                </span>

                <span className="text-sm font-medium">of</span>

                <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded text-sm font-semibold">
                  {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT SUMMARY PANEL */}
          <aside className="w-80 hidden md:block">
            <div className="sticky top-4 space-y-4 pt-1">

              <div className="bg-white p-5 rounded-xl border shadow">
                <h4 className="text-sm font-bold text-gray-800 mb-2">Summary</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Total events</span>
                    <span className="font-semibold text-gray-800">{filteredLogs.length}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Unique assets</span>
                    <span className="font-semibold text-gray-800">
                      {new Set(filteredLogs.map((l) => l.assetId)).size}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Inventory events</span>
                    <span className="font-semibold text-gray-800">
                      {
                        filteredLogs.filter((l) =>
                          l.currentStatus?.toLowerCase().includes("inventory")
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border shadow">
                <h4 className="text-sm font-bold text-gray-800 mb-3">Recent actions</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  {filteredLogs.slice(0, 5).map((log, i) => (
                    <li key={i} className="flex gap-2 items-start">
                      <div>{getActionIcon(log)}</div>
                      <div>
                        <div className="font-medium text-gray-800">
                          {log.ActionPerformend}
                        </div>
                        <div className="text-xs text-gray-400">
                          {log.assetname} · {formatDate(log.updatedOn)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-5 rounded-xl border shadow">
                <h4 className="text-sm font-bold text-gray-800 mb-2">Quick tips</h4>
                <p className="text-xs text-gray-500 leading-5">
                  • Click any event to see details.
                  • Use filters to refine results.
                  • Export downloads only filtered logs.
                </p>
              </div>

            </div>
          </aside>

        </div>

        {/* DETAILS MODAL */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setSelectedLog(null)}
            />

            <div className="relative bg-white rounded-xl shadow-2xl w-full md:max-w-3xl mx-4 my-8 overflow-auto border">
              <div className="flex justify-between items-center px-5 py-4 border-b bg-gray-50 rounded-t-xl">
                <h3 className="text-lg font-semibold text-gray-800">Event Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-2xl text-gray-600 hover:text-red-600"
                >
                  ×
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Asset</p>
                  <p className="font-semibold text-gray-800">
                    {selectedLog.assetname}
                    <span className="text-xs text-gray-400"> · ID: {selectedLog.assetId}</span>
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Action</p>
                  <p className="font-semibold text-gray-800">
                    {selectedLog.ActionPerformend}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Status from → to</p>
                  <p className="text-gray-800">
                    {selectedLog.previousStatus} → {selectedLog.currentStatus}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Timestamp</p>
                  <p className="text-gray-800">{formatDate(selectedLog.updatedOn)}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Category / Location</p>
                  <p className="text-gray-800">
                    {selectedLog.CategoriesName}
                    {selectedLog.locationDetails?.locality &&
                      ` · ${selectedLog.locationDetails.locality}`}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500">Performed by</p>
                  <p className="text-gray-800">
                    {getUserName(selectedLog.updatedBy, selectedLog.updatedByName)}
                  </p>
                </div>

                {/* USER-FRIENDLY PAYLOAD */}
                <div className="md:col-span-2">
                  <p className="text-xs text-gray-500 mb-2">Full Event Payload</p>

                  <div className="bg-white border rounded-xl shadow-inner p-4 max-h-72 overflow-auto">

                    <div className="space-y-2 text-sm">
                      {formatJSON(selectedLog)}
                    </div>

                  </div>
                </div>

              </div>

              <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-xl">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AssetHistoryActivityFeed;
