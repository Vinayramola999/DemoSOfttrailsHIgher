import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProjectApproval from './ProjectApproval';
import MaterialRequest from './MaterialRequest';
import MaterialCompositionRequest from './CompositionApproval';
import ProductionExecutionRequest from './ProductionExecutionRequest';
import VerifyToken from '../../NewComponents/VerifyToken';
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const Organization = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("project");
const [tabs] = useState([
  { id: "project", label: "Project Material Request" },
  { id: "MaterialCompositionRequest", label: "Material Composition Request" },
  
  // { id: "MaterialRequest", label: "Material Requisition Request" },
  
  { id: "ProductionExecutionRequest", label: "Production Execution Request" },
]);
  const navigate = useNavigate();

  const userId = sessionStorage.getItem('userId');
  const token = sessionStorage.getItem('token');
  VerifyToken("/Processtab");

  // Fetch user data
  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${MAIN_BASE}users/id_user/${userId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.data) {
            setUserData(response.data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
      fetchUserData();
    }
  }, [token, userId]);


  // Check user access
//   useEffect(() => {
//     const checkAMSAccess = async () => {
//       setLoading(true);
//       try {
//         if (!userId || !token) {
//           console.error('userId or token is missing');
//           return;
//         }

//         const response = await axios.get(`https://saaspro.softtrails.net/saas/asset/pro/access/access/${userId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const userAccess = response.data;
//         const hasProjectAccess = userAccess.some(access => access.api_name === 'project');

//         const accessibleTabs = [];
//         if (hasProjectAccess) accessibleTabs.push({ id: "project", label: "Project Approval" });

//         setTabs(accessibleTabs);
//         setActiveTab(accessibleTabs[0]?.id || "project");
//       } catch (error) {
//         console.error('Error during access check:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAMSAccess();
//   }, []);

  // Tab indicator styles
  const tabWidth = `${100 / tabs.length}%`;
  const activeLeft = `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`;

  return (
    <div className='flex flex-col w-full'>
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-4">

          {/* Tabs */}
          <div className="flex gap-2 w-[50%] rounded-full p-1 relative">
            <motion.div
              layoutId="activeTab"
              className="absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
              style={{ width: tabWidth, left: activeLeft }}
              transition={{
                type: "spring",
                stiffness: 600,
                damping: 20,
              }}
            />

            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id ? "text-white" : "text-black"}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-grow border-gray-300 h-screen">
                {activeTab === "project" && <ProjectApproval />}
            {activeTab === "MaterialCompositionRequest" && <MaterialCompositionRequest/>}
        
             {/* {activeTab === "MaterialRequest" && <MaterialRequest/>} */}
        
            {activeTab === "ProductionExecutionRequest" && <ProductionExecutionRequest/>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Organization;