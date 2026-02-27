import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import API from "../config/api";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import RaiseRequest from "./RaiseRequest";
import AllRequest from "./AllRequest";
import InventryIndenting from "./InventryIndenting";
const PurchaseModule = () => {
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("raiseRequest");
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  const tabs = [
    { id: "raiseRequest", label: "Raise Request" },
    { id: "allRequests", label: "All Requests" },
    { id: "Approved Request", label: "Approved Request" },
  ];

  const getToken = () => {
    const token = sessionStorage.getItem("token");
    return token;
  };
  const token = getToken();

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${API.API_BASE}/users/id_user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data) {
            const user = response.data.user;
            setUserData(user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token, userId]);

  const verifyToken = async () => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      await axios.post(`${API.API_BASE}/users/verify-token`, { token });
      navigate("/PurchaseModule");
    } catch (error) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenExpiry");
      navigate("/");
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  const dropdownRef = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="p-3 w-full">
        {/* Tab Navigation */}
        <div className="flex flex-col w-[100%] mt-2">
          <div className="flex flex-col  ">
            <div className="flex gap-2 w-[60%] rounded-full p-1 relative">
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

            {/* Tab Content */}
<div className="mt-2 h-[calc(100vh-120px)] overflow-y-auto pr-2">
              {activeTab === "raiseRequest" && (
                <RaiseRequest deptName={userData?.dept_name || ""} />
              )}{" "}
              {activeTab === "allRequests" && <AllRequest />}
              {activeTab === "Approved Request" && (
                <div>
                  <InventryIndenting />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PurchaseModule;
