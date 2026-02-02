
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Index from "./index";
import RawMaterial from "./RawMaterial";
import AllCategory from "./AllCategory";
import FineProduct from "./FineProduct";
import VerifyToken from '../../NewComponents/VerifyToken';
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const CategoryTab = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("AllCategory");
  const [tabs, setTabs] = useState([{ id: "AllCategory", label: "AllCategory" }]);

  const userId = sessionStorage.getItem('userId');
  const token = sessionStorage.getItem('token');

  // Verify Token
  VerifyToken("/CategoryTab");

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
           `${MAIN_BASE}users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log("USER DATA RESPONSE ✅:", response.data);

          if (response.data?.user) {
            setUserData(response.data.user);
          }
        } catch (error) {
          console.error(
            "❌ Error fetching user data:",
            error.response ? error.response.data : error.message
          );
        }
      };
      fetchUserData();
    }
  }, [token, userId]);

 useEffect(() => {
  console.log("✅ useEffect mounted: preparing to run checkAMSAccess");

  const checkAMSAccess = async () => {
    console.log("🚀 checkAMSAccess started");

    setLoading(true);

    try {
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      console.log("📦 sessionStorage values:", { userId, token });

      if (!userId || !token) {
        console.error("❌ Missing userId or token → skipping API call");
        return;
      }

      // API URL
      const url = `${MAIN_BASE}access/access/${userId}`;
      console.log("🌍 API URL:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ ACCESS API RESPONSE:", response.data);

      const userAccess = response.data;
      const accessibleTabs = [];

      if (userAccess.some((access) => access.api_name === "AllCategory")) {
        accessibleTabs.push({ id: "AllCategory", label: "All Category Type" });
      }
      if (userAccess.some((access) => access.api_name === "Index")) {
        accessibleTabs.push({ id: "Index", label: "Movable Asset" });
      }
      if (userAccess.some((access) => access.api_name === "RawMaterial")) {
        accessibleTabs.push({ id: "RawMaterial", label: "Raw Material" });
      }
      if (userAccess.some((access) => access.api_name === "FineProduct")) {
        accessibleTabs.push({ id: "FineProduct", label: "Fine Goods" });
      }

      console.log("📌 Accessible Tabs Built:", accessibleTabs);

      setTabs(accessibleTabs);

      if (accessibleTabs.length > 0) {
        console.log("🎯 Setting active tab:", accessibleTabs[0].id);
        setActiveTab(accessibleTabs[0].id);
      } else {
        console.warn("⚠ No accessible tabs for this user");
      }
    } catch (error) {
      console.error(
        "❌ Error during API call:",
        error.response ? error.response.data : error.message
      );
    } finally {
      console.log("🛑 checkAMSAccess finished");
      setLoading(false);
    }
  };

  checkAMSAccess();
}, []);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-[100%]">
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-2 w-[65%] rounded-full p-1 relative">
            <motion.div
              layoutId="activeTab"
              className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
              style={{
                width: `calc(100% / ${tabs.length})`,
                left: `${
                  (tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length
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
                  activeTab === tab.id ? "text-white" : "text-black"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-grow border-gray-300 h-screen">
            {activeTab === "AllCategory" && <AllCategory />}
            {activeTab === "Index" && <Index />}
            {activeTab === "RawMaterial" && <RawMaterial />}
            {activeTab === "FineProduct" && <FineProduct />}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CategoryTab;
