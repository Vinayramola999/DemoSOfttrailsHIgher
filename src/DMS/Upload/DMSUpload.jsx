import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import DocumentUpload from "./DocumentUpload";
import DocsView from "./DocumentView";
import {MAIN_API_BASE} from "../../config/apiBase";

const DMS = () => {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState("DocumentUpload");
  const tabs = [
    { id: "DocumentUpload", label: "Upload Documents" },
    { id: "DocsView", label: "View Documents" },
  ];
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  const verifyToken = async () => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const response = await axios.post(
        `${MAIN_API_BASE}/users/verify-token`,
        {
          token: token,
        }
      );
      console.log("Token is valid:", response.data);
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

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          console.log("Fetching data for userId:", userId);
          const response = await axios.get(
            `${MAIN_API_BASE}/users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("API Response:", response);
          if (response.data) {
            const user = response.data;
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
    verifyToken();
  }, []);

  return (
    <div className="flex">
      <div className="w-full">
        <div className=" flex space-x-4">
          <div className="flex gap-2 w-[40%] rounded-full p-1 relative">
            <motion.div
              layoutId="activeTab"
              className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
              style={{
                width: `calc(100% / ${tabs.length})`,
                left: `${
                  (tabs.findIndex((t) => t.id === activeTab) * 100) /
                  tabs.length
                }%`,
              }}
              transition={{
                type: "spring",
                stiffness: 600,
                damping: 20,
              }}
            />

            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${
                  activeTab === tab.id ? "text-white" : "text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          {activeTab === "DocumentUpload" && <DocumentUpload />}
          {activeTab === "DocsView" && <DocsView />}
        </div>
      </div>
    </div>
  );
};

export default DMS;
