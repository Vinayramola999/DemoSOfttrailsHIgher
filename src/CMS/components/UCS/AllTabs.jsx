import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
// import Sidebar from '../Sidebar/HRMSidebar';
// import ProfileDropdown from '../ProfileDropdown';
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
// import UCS3 from './UCS3';
import UCS from "./UCS";
import UCS2 from "./Ucs2";
import UserAddition from "./UserAddition";

const Organization = () => {
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("UCS");
  const [childActiveTab, setChildActiveTab] = useState("MyAPI");

  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  const tabs = [
    // { id: "UCS3", label: "Gateway Setup" },
    { id: "UCS", label: "Add Template" },
    { id: "UA", label: "Add Modules" },
    { id: "UCS2", label: "Select Template" },

    // { id: "DA", label: "Dev API"}
  ];

  const handleHome = () => {
    navigate("/Cards");
  };

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
          const response = await axios.get(
            `https://devdemo.softtrails.net/users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data) {
            const user = response.data;
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
      // navigate('/');
      return;
    }
    try {
      await axios.post(
        "https://devdemo.softtrails.net/users/verify-token",
        { token }
      );
      // stay on the current product addon route (avoid navigating to a non-existent '/AllTabs')
      navigate("/productaddon/ucs");
    } catch (error) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenExpiry");
      // navigate('/');
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

  useEffect(() => {
    verifyToken();
    setActiveTab("UCS"); // Ensure UCS3 tab is selected initially
  }, []);

  return (
    <div className="flex">
      <div className="w-full">
        <div className="flex flex-col w-[100%] mt-2">
          <div className="flex flex-col ">
            <div className="flex gap-2 w-[70%] rounded-full p-1 relative">
              <motion.div
                layoutId="activeTab"
                className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                style={{
                  width: `calc(100% / ${tabs.length})`,
                  left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) /
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
                  className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 ${activeTab === tab.id ? "text-white" : "text-gray-700"
                    }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {/* {activeTab === "UCS3" && <UCS3 />} */}
              {activeTab === "UCS" && <UCS />}
              {activeTab === "UCS2" && <UCS2 />}
              {activeTab === "UA" && (
                <div>
                  <UserAddition />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Organization;
