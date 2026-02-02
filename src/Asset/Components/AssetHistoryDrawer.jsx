import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FiUser,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import Drawer from "./Drawer";
import { motion } from "framer-motion";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase";
export default function AssetHistoryDrawer({ assetId, categoryId, assetName, open, onClose }) {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [error, setError] = useState("");

  const fetchUsers = async (token) => {
    try {
      const { data } = await axios.get(
        `${MAIN_BASE}users/getusers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const userMap = {};
      (data?.users || []).forEach((user) => {
        userMap[user.user_id] = `${user.first_name || ""} ${user.last_name || ""}`.trim();
      });
      setUsersMap(userMap);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    }
  };

  const fetchHistory = async () => {
    if (!assetId || !categoryId) return;
    setLoading(true);
    setError("");
    const token = sessionStorage.getItem("token");
    if (!token) {
      setError("Authentication token missing. Please login again.");
      setLoading(false);
      return;
    }

    try {
      await fetchUsers(token);
      const { data } = await axios.get(
        `${JAVA_BASE}api/assethistory/get-by-category-and-asset/${categoryId}/${assetId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const records = Array.isArray(data) ? data : data?.data || [];
      setHistory(records.reverse());
    } catch (err) {
      console.error("Asset History Fetch Error:", err);
      setError(
        err.response?.status === 401
          ? "Session expired. Please login again."
          : "Failed to load asset history. Try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && assetId && categoryId) {
      fetchHistory();
    }
  }, [assetId, categoryId, open]);

  const getUserName = (userId) => usersMap[userId] || `User ID: ${userId}`;
  const formatDateOnly = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={`Asset History — ${assetName ? `${assetName} (ID: ${assetId})` : `ID: ${assetId}`}`}
    >
      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center py-20 text-blue-500">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
            className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full"
          ></motion.div>
          <span className="ml-3 text-gray-600 font-medium">Loading history...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col justify-center items-center text-center py-10 text-red-600">
          <FiAlertTriangle className="text-3xl mb-2" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* No Data */}
      {!loading && !error && history.length === 0 && (
        <p className="text-center text-gray-500 py-10">No history found for this asset.</p>
      )}

      {/* History Timeline */}
      {!loading && !error && history.length > 0 && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-400 to-indigo-400"></div>

          <div className="space-y-8 ml-10">
            {history.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative p-5 rounded-xl border border-gray-200 shadow-sm bg-white hover:shadow-md transition"
              >
                {/* Dot */}
                <div
                  className={`absolute -left-[1.05rem] top-6 w-4 h-4 rounded-full shadow-lg ${
                    item.action?.includes("Approved")
                      ? "bg-green-500"
                      : item.action?.includes("Request")
                      ? "bg-yellow-500"
                      : "bg-blue-500"
                  }`}
                ></div>

                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-semibold text-gray-800">{item.action}</h4>
                  <span className="flex items-center text-sm text-gray-500">
                    <FiClock className="mr-1 text-blue-500" />
                    {formatDateOnly(item.updatedOn)}
                  </span>
                </div>

                {/* Info */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Previous</p>
                    <p className="font-medium">{item.previousStatus || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Current</p>
                    <p className="font-medium text-blue-700">
                      {item.currentStatus || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Updated By</p>
                    <p className="font-medium flex items-center gap-1 text-indigo-600">
                      <FiUser /> {getUserName(item.updatedBy)}
                    </p>
                  </div>
                </div>

                {/* Substage transition */}
                <div className="mt-4 text-sm">
                  <p className="text-gray-500">Stage Transition</p>
                  <p className="font-medium">
                    {item.previousSubStages} → {item.currentSubStages}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Drawer>
  );
}
