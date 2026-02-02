import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaCubes, FaBoxOpen, FaCheckCircle } from "react-icons/fa";
import Index from "./index";
import Raw from "./Raw";
import Fine from "./Fine";
import VerifyToken from "../../NewComponents/VerifyToken";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const CategoryTabs = () => {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("Index");

  const tabs = [
    { id: "Index", label: "Movable Asset", icon: <FaCubes /> },
    { id: "Raw", label: "Raw Material", icon: <FaBoxOpen /> },
    // { id: "Fine", label: "Finished Goods", icon: <FaCheckCircle /> },
  ];

  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");
  VerifyToken("/Reports");

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
           `${MAIN_BASE}users/id_user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data) setUserData(response.data);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token, userId]);

  return (
    <div className="flex flex-col w-full">
      {/* Tab Bar */}
      <div className="w-full flex justify-center mt-3">
        <div className="relative flex gap-3 bg-white/40 backdrop-blur-lg p-2 rounded-2xl shadow-lg border border-gray-100">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "text-white"
                  : "text-gray-700 hover:text-blue-600"
              }`}
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated background for active tab */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-800 shadow-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}

              <span className="relative z-10 text-lg">{tab.icon}</span>
              <span className="relative z-10">{tab.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-grow border-gray-200 min-h-screen mt-5">
        <AnimatePresence mode="wait">
          {activeTab === "Index" && (
            <motion.div
              key="Index"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <Index />
            </motion.div>
          )}
          {activeTab === "Raw" && (
            <motion.div
              key="Raw"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <Raw />
            </motion.div>
          )}
          {/* {activeTab === "Fine" && (
            <motion.div
              key="Fine"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <Fine />
            </motion.div>
          )} */}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CategoryTabs;
