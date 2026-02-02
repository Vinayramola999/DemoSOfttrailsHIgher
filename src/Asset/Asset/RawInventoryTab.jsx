import { Box } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaHome } from "react-icons/fa";
//
import ProfileDropdown from "../../ProfileDropdown";
import { useLocation, useNavigate } from "react-router-dom";
import Index from "./index";
import RawInventory from "./RawInventory";
import AllocatedMaterial from "./AllocatedMaterial";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const Tabs = () => {
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const userId = sessionStorage.getItem("userId");
  const [loading, setLoading] = useState(true);
  const [setUserId] = useState(null);
  const location = useLocation();

  console.log("Raw Inventry")

  console.log(location.state)

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
          console.log("Fetching data for userId:", userId);
          const response = await axios.get(
            `${MAIN_BASE}users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data) {
            const user = response.data;
            console.log("User:", user);
            setUserData(user);
          } else {
          }
        } catch (error) {
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
          `${MAIN_BASE}users/verify-token`,
          { token }
        );
        navigate("/RepoAllTab", {
          state: {
            requestFor : location?.state?.requestFor,     
            category:location?.state?.category,        
            requestAsset:location?.state?.requestAsset,    
            type: "inventory" 
          },
        });
      } catch (error) {
        
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("tokenExpiry");
        navigate("/");
      }
    };
    verifyToken();
  }, [token, navigate]);

  return (
    <div className="flex">
      <div className="w-full">
        <Box>
          <div className="flex justify-left font-bold  mt-3 border-gray-300">
            <button
              className={`px-6 py-2 text-14px font-bold relative focus:outline-none transition duration-300 rounded-t-md ${
                tabValue === 0
                  ? "bg-white text-blue-600 border-l border-t border-r border-gray-300"
                  : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setTabValue(0)}
            >
             Inventory
            </button>
            <button
              className={`px-6 py-2 text-14px font-bold relative focus:outline-none transition duration-300 rounded-t-md ${
                tabValue === 1
                  ? "bg-white text-blue-600 border-l border-t border-r border-gray-300"
                  : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setTabValue(1)}
            >
             Allocated Material
            </button>
           

          </div>

          <div className="border-l border-r border-gray-300 h-full bg-white">
            {tabValue === 0 && (
              <div>
                <RawInventory />
              </div>
            )}
             {tabValue === 1 && (
              <div>
                <AllocatedMaterial/>
              </div>
            )}
            
          </div>
        </Box>
      </div>
    </div>
  );
};
export default Tabs;
