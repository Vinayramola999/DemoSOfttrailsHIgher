import { Box } from "@mui/material";
import axios from "axios";
import React, { useState, useEffect ,useRef} from "react";
import { FaHome } from "react-icons/fa";
//
import ProfileDropdown from "../../ProfileDropdown";
import { useLocation, useNavigate } from "react-router-dom";
import RawRepository from "./RawRepository";
import RawInventory from "./RawInventoryTab";
import FineGoodsRepository from "./FineGoodsRepository";
import FineGoodsInventory from "./FineGoodsInventory";
import AllocatedFineGoods from "./AllocatedFineGoods";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const Tabs = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(location?.state?.type === "inventory" ? 1 : 0);
  const userId = sessionStorage.getItem("userId");

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
            requestFor : location?.state?.requestFor,      // selected "requestedFor"
            category:location?.state?.category,        // selected "category"
            requestAsset:location?.state?.requestAsset,    // selected "material"
            type: "inventory" // ✅ hardcoded value
          },
        });
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
        {/* Header */}
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
              Finished Goods Repository
            </button>
            <button
              className={`px-6 py-2 text-14px font-bold relative focus:outline-none transition duration-300 rounded-t-md ${
                tabValue === 1
                  ? "bg-white text-blue-600 border-l border-t border-r border-gray-300"
                  : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setTabValue(1)}
            >
             Finished Goods Inventory
            </button>
             <button
              className={`px-6 py-2 text-14px font-bold relative focus:outline-none transition duration-300 rounded-t-md ${
                tabValue === 2
                  ? "bg-white text-blue-600 border-l border-t border-r border-gray-300"
                  : "bg-gray-200 text-gray-600"
              }`}
              onClick={() => setTabValue(2)}
            >
          Allocated Finished Goods
            </button>
          </div>

          <div className="border-l border-r border-gray-300 h-full bg-white">
            {tabValue === 0 && (
              <div>
                <FineGoodsRepository/>
              </div>
            )}
            {tabValue === 1 && (
              <div>
                <FineGoodsInventory/>
              </div>
            )}
            {tabValue === 2 && (
              <div>
                <AllocatedFineGoods/>
              </div>
            )}
          </div>
        </Box>
      </div>
    </div>
  );
};
export default Tabs;
