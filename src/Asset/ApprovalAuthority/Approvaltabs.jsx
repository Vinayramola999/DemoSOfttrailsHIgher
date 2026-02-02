import { Box } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import { FaHome } from "react-icons/fa";
//
import ProfileDropdown from "../../ProfileDropdown";
import { useNavigate } from "react-router-dom";
import Index from "./index";
import ApprovalTabs from "./Approvaltabs1";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const Tabs = () => {
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const userId = sessionStorage.getItem("userId");
  const [loading, setLoading] = useState(true);
  const [setUserId] = useState(null);

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

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    // Add event listener to detect clicks outside the dropdown
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const dropdownRef = useRef(null);

  return (
    <div className="flex">
      <div className="w-full">
        <Box>
          <div className="flex justify-left font-bold  mt-3 border-gray-300">
            <button
              className={`px-6 py-2 text-14px font- relative focus:outline-none transition duration-300 rounded-t-md ${
                tabValue === 0
                  ? "bg-white text-blue-600 border-l border-t border-r border-gray-300"
                  : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setTabValue(0)}
            >
              Asset Category Request
            </button>
            <button
              className={`px-6 py-2 text-14px font- relative focus:outline-none transition duration-300 rounded-t-md ${
                tabValue === 1
                  ? "bg-white text-blue-600 border-l border-t border-r border-gray-300"
                  : "bg-gray-200 text-gray-600"
              }`} 
              onClick={() => setTabValue(1)}
            >
              Asset Lifecycle Request
            </button>
          </div>

          <div className="border-l border-r border-gray-300 h-full bg-white">
            {tabValue === 0 && (
              <div>
                <Index />
              </div>
            )}
             {tabValue === 1 && (
              <div>
                <ApprovalTabs />
              </div>
            )}
          </div>
        </Box>
      </div>
    </div>
  );
};
export default Tabs;
