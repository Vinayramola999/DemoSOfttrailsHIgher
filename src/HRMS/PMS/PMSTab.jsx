// import axios from 'axios';
// import { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import Goals from './Goals';
// import KRA from './KRA';
// import Mapping from './Mapping';

// const LeaveManagement = () => {
//     const [userData, setUserData] = useState(null);
//     const [loading, setLoading] = useState(null);
//     const [activeTab, setActiveTab] = useState("goals");
//     const navigate = useNavigate();
//     const userId = sessionStorage.getItem('userId');
//     const [tabs, setTabs] = useState([
//         { id: "goals", label: "Goals" },
//         { id: "kra", label: "KRA's" },
//         { id: "mapping", label: "Mapping" }
//     ]);

//     const getToken = () => {
//         const token = sessionStorage.getItem('token');
//         return token;
//     };
//     const token = getToken();

//     useEffect(() => {
//         const userId = sessionStorage.getItem('userId');
//         if (userId) {
//             const fetchUserData = async () => {
//                 try {
//                     const response = await axios.get(`https://devdemo.softtrails.net/users/id_user/${userId}`, {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     });
//                     if (response.data) {
//                         const user = response.data;
//                         setUserData(user);
//                     }
//                 } catch (error) {
//                     console.error('Error fetching user data:', error);
//                 }
//             };
//             fetchUserData();
//         }
//     }, [token, userId]);

//     const verifyToken = async () => {
//         if (!token) {
//             navigate('/');
//             return;
//         }
//         try {
//             await axios.post('https://devdemo.softtrails.net/users/verify-token', { token });
//             navigate('/PMSTab');
//         } catch (error) {
//             sessionStorage.removeItem('token');
//             sessionStorage.removeItem('tokenExpiry');
//             navigate('/');
//         }
//     };

//     useEffect(() => {
//         verifyToken();
//     }, []);

//     // useEffect(() => {
//     //     const checkAMSAccess = async () => {
//     //         setLoading(true);
//     //         try {
//     //             const userId = sessionStorage.getItem('userId');
//     //             const token = sessionStorage.getItem('token');
//     //             if (!userId || !token) {
//     //                 console.error('userId or token is missing');
//     //                 return;
//     //             }
//     //             const response = await axios.get(`https://devdemo.softtrails.net/access/access/${userId}`, {
//     //                 headers: {
//     //                     'Authorization': `Bearer ${token}`,
//     //                 },
//     //             });
//     //             const userAccess = response.data;
//     //             const hasCreateAccess = userAccess.some(access => access.api_name === 'Create');
//     //             const hasApplyAccess = userAccess.some(access => access.api_name === 'Apply');
//     //             const hasBalanceAccess = userAccess.some(access => access.api_name === 'Balance');
//     //             const hasApprovalAccess = userAccess.some(access => access.api_name === 'Approval');
//     //             const hasPolicyAccess = userAccess.some(access => access.api_name === 'Policy');
//     //             const hasYearAccess = userAccess.some(access => access.api_name === 'YearSet');
//     //             const hasWorkAccess = userAccess.some(access => access.api_name === 'Work');
//     //             const hasHolidayAccess = userAccess.some(access => access.api_name === 'Holiday');
//     //             const hasAllBalanceAccess = userAccess.some(access => access.api_name === 'AllBalance');
//     //             const hasStatusAccess = userAccess.some(access => access.api_name === 'Status');
//     //             const hasApprovalBalanceAccess = userAccess.some(access => access.api_name === 'ApprovalBalance');
//     //             // Dynamically build tabs
//     //             const accessibleTabs = [];
//     //             if (hasPolicyAccess) accessibleTabs.push({ id: "policy", label: "Policy" });
//     //             if (hasCreateAccess) accessibleTabs.push({ id: "alleave", label: "Create Leave" });
//     //             if (hasApplyAccess) accessibleTabs.push({ id: "apply", label: "Apply Leave" });
//     //             if (hasBalanceAccess) accessibleTabs.push({ id: "balance", label: "Balance Leave" });
//     //             if (hasApprovalAccess) accessibleTabs.push({ id: "leaveapproval", label: "Leave Approval" });
//     //             if (hasYearAccess) accessibleTabs.push({ id: "calender", label: "Year Setup" });
//     //             if (hasWorkAccess) accessibleTabs.push({ id: "workingdays", label: "Working Days" });
//     //             if (hasHolidayAccess) accessibleTabs.push({ id: "holiday", label: "Holiday" });
//     //             if (hasAllBalanceAccess) accessibleTabs.push({ id: "allbalances", label: "All Balances" });
//     //             if (hasStatusAccess) accessibleTabs.push({ id: "approvalstatus", label: "Status" });
//     //             if (hasApprovalBalanceAccess) accessibleTabs.push({ id: "approvalauthority", label: "Balance Approval" });
//     //             setTabs(accessibleTabs);
//     //             setActiveTab(accessibleTabs[0].id);

//     //         } catch (error) {
//     //             console.error('Error during API call: ', error);
//     //         } finally {
//     //             setLoading(false);
//     //         }
//     //     };

//     //     checkAMSAccess();
//     // }, []);

//     const tabRefs = useRef({});
//     const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

//     useEffect(() => {
//         const currentTab = tabRefs.current[activeTab];
//         if (currentTab) {
//             const { offsetLeft, offsetWidth } = currentTab;
//             setIndicatorStyle({ width: offsetWidth, left: offsetLeft });
//         }
//     }, [activeTab]);

//     return (
//         <div className="flex flex-col w-full">
//             <div className="flex flex-col w-full">
//                 <div className="flex flex-col">
//                     {/* Tab Bar */}
//                     <div className="flex gap-2 w-[20%] rounded-full p-1 relative">
//                         <motion.div
//                             layoutId="activeTab"
//                             className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
//                             style={{ width: `calc(100% / ${tabs.length})`, left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`, }}
//                             transition={{
//                                 type: "spring",
//                                 stiffness: 600,
//                                 damping: 20,
//                             }}
//                         />

//                         {tabs.map((tab) => (
//                             <button key={tab.id} className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id ? "text-white" : "text-black"}`}
//                                 onClick={() => setActiveTab(tab.id)}
//                             >
//                                 {tab.label}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Tab Content */}
//                     <div className="flex-grow border-gray-300">
//                         {activeTab === "goals" && <Goals />}
//                         {activeTab === "kra" && <KRA />}
//                         {activeTab === "mapping" && <Mapping />}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
// export default LeaveManagement;

////////////////////////////////////////////////////
// import axios from 'axios';
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import Goals from './Goals';
// import KRA from './KRA';
// import Mapping from './Mapping';
// import VerifyToken from '../../NewComponents/VerifyToken';
// import SettingAnnnualGoals from './SettingAnnualGoals';

// const PMSTab = () => {
//     const [userData, setUserData] = useState(null);
//     const [loading, setLoading] = useState(null);
//     const [activeTab, setActiveTab] = useState("goals");
//     const navigate = useNavigate();
//     const userId = sessionStorage.getItem('userId');
//     const [tabs, setTabs] = useState([{ id: "goals", label: "Goals" }]);
//     const getToken = () => {
//         const token = sessionStorage.getItem('token');
//         return token;
//     };
//     const token = getToken();
//     VerifyToken("/PMSTab");

//     useEffect(() => {
//         const userId = sessionStorage.getItem('userId');
//         if (userId) {
//             const fetchUserData = async () => {
//                 try {
//                     const response = await axios.get(`https://devdemo.softtrails.net/users/id_user/${userId}`, {
//                         headers: {
//                             Authorization: `Bearer ${token}`,
//                         },
//                     });
//                     if (response.data.user) {
//                         const user = response.data.user;
//                         setUserData(user);
//                     }
//                 } catch (error) {
//                     console.error('Error fetching user data:', error);
//                 }
//             };
//             fetchUserData();
//         }
//     }, [token, userId]);

//     useEffect(() => {
//         const checkAMSAccess = async () => {
//             setLoading(true);
//             try {
//                 const userId = sessionStorage.getItem('userId');
//                 const token = sessionStorage.getItem('token');

//                 if (!userId || !token) {
//                     console.error('userId or token is missing');
//                     return;
//                 }

//                 const response = await axios.get(`https://devdemo.softtrails.net/access/access/${userId}`, {
//                     headers: {
//                         'Authorization': `Bearer ${token}`,
//                     },
//                 });

//                 const userAccess = response.data;
//                 const hasGoalAccess = userAccess.some(access => access.api_name === 'Goal');
//                 const hasKRAAccess = userAccess.some(access => access.api_name === 'KRA');
//                 const hasMappingAccess = userAccess.some(access => access.api_name === 'Mapping');
//                 const accessibleTabs = [];
//                 if (hasGoalAccess) accessibleTabs.push({ id: "goals", label: "Goal" });
//                 if (hasKRAAccess) accessibleTabs.push({ id: "kra", label: "KRA's" });
//                 if (hasMappingAccess) accessibleTabs.push({ id: "mapping", label: "Mapping" });
//                 setTabs(accessibleTabs);
//                 setActiveTab(accessibleTabs[0].id);
//             } catch (error) {
//                 console.error('Error during API call: ', error);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         checkAMSAccess();
//     }, []);

//     return (
//         <div className='flex flex-col w-full'>
//             <div className="flex flex-col w-[100%]">
//                 <div className="flex flex-col  gap-4">
//                     <div className="flex gap-2  w-[30%] rounded-full p-1 relative">
//                         <motion.div
//                             layoutId="activeTab"
//                             className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
//                             style={{ width: `calc(100% / ${tabs.length})`, left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`, }}
//                             transition={{
//                                 type: "spring",
//                                 stiffness: 600,
//                                 damping: 20,
//                             }}
//                         />

//                         {tabs.map((tab) => (
//                             <button key={tab.id} className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id ? "text-white" : "text-black"}`}
//                                 onClick={() => setActiveTab(tab.id)}
//                             >
//                                 {tab.label}
//                             </button>
//                         ))}
//                     </div>

//                     {/* Tab Content */}
//                     <div className="flex-grow border-gray-300 h-screen">
//                         {activeTab === "goals" && <Goals />}
//                         {activeTab === "kra" && <KRA />}
//                         {activeTab === "mapping" && <Mapping />}
//                         {activeTab === "settingannualgoals" &&<SettingAnnnualGoals/> }

//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
// export default PMSTab;

// code with setting annual goals

import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Goals from "./Goals";
import KRA from "./KRA";
import Mapping from "./Mapping";
import VerifyToken from "../../NewComponents/VerifyToken";
import SettingAnnualGoals from "./SettingAnnualGoals";
import ApprovalSetup from "./ApprovalSetup";
import ApproveGoal from "./ApproveGoal";
import GoalSetting from "./GoalSetting";

const PMSTab = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("goals");
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const [tabs, setTabs] = useState([{ id: "goals", label: "Goals" }]);

  const token = sessionStorage.getItem("token");
  VerifyToken("/PMSTab");

  // refs & indicator for accurate indicator positioning on all viewports
  const tabRefs = useRef({});
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `https://devdemo.softtrails.net/users/id_user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data.user) {
            setUserData(response.data.user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token, userId]);

  useEffect(() => {
    const checkAMSAccess = async () => {
      setLoading(true);
      try {
        if (!userId || !token) {
          console.error("userId or token is missing");
          return;
        }

        const response = await axios.get(
          `https://devdemo.softtrails.net/access/access/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("response", response);
        const userAccess = response.data;
        const hasGoalAccess = userAccess.some(
          (access) => access.api_name === "Goal"
        );
        const hasKRAAccess = userAccess.some(
          (access) => access.api_name === "KRA"
        );
        const hasMappingAccess = userAccess.some(
          (access) => access.api_name === "Mapping"
        );
        const hasSettingAnnualGoalsAccess = userAccess.some(
          (access) => access.api_name === "AnnualGoals"
        );
        const hasApprovalSetupAccess = userAccess.some(
          (access) => access.api_name === "approvalsetup"
        );
        const hasApproveGoalAccess = userAccess.some(
          (access) => access.api_name === "ApproveGoal"
        );
        const hasGoalSettingAccess = userAccess.some(
          (access) => access.api_name === "GoalSetting"
        );

        const accessibleTabs = [];
        if (hasGoalAccess) accessibleTabs.push({ id: "goals", label: "Goal" });
        if (hasKRAAccess) accessibleTabs.push({ id: "kra", label: "KRA's" });
        if (hasMappingAccess)
          accessibleTabs.push({ id: "mapping", label: "Mapping" });
        if (hasSettingAnnualGoalsAccess)
          accessibleTabs.push({
            id: "settingannualgoals",
            label: "Setting Annual Goals",
          });
        if (hasApprovalSetupAccess)
          accessibleTabs.push({ id: "approvalsetup", label: "Approval Setup" });
        if (hasApproveGoalAccess)
          accessibleTabs.push({ id: "approvegoal", label: "Approve Goal" });
        if (hasGoalSettingAccess)
          accessibleTabs.push({ id: "goalsetting", label: "Goal Setting" });
        // Fallback: show all tabs if access is empty
        if (accessibleTabs.length === 0) {
          accessibleTabs.push(
            { id: "goals", label: "Goal" },
            { id: "kra", label: "KRA's" },
            { id: "mapping", label: "Mapping" },
            { id: "settingannualgoals", label: "Setting Annual Goals" },
            { id: "approvalsetup", label: "Approval Setup" },
            { id: "approvegoal", label: "Approve Goal" },
            { id: "goalsetting", label: "Goal Setting" }
          );
        }

        setTabs(accessibleTabs);

        setActiveTab(accessibleTabs[0].id);
      } catch (error) {
        console.error("Error during API call: ", error);
      } finally {
        setLoading(false);
      }
    };

    checkAMSAccess();
  }, []);

  // update indicator whenever activeTab or tabs change
  useEffect(() => {
    const current = tabRefs.current[activeTab];
    if (current) {
      setIndicatorStyle({
        width: current.offsetWidth,
        left: current.offsetLeft,
      });
    } else {
      // fallback: evenly split width if refs not ready
      setIndicatorStyle({ width: 0, left: 0 });
    }
  }, [activeTab, tabs]);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const el = tabRefs.current[tabId];
    if (el && el.scrollIntoView) {
      // ensure the clicked tab is visible on small screens
      el.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  };
  useEffect(() => {
    const handleResize = () => {
      const activeButton = tabRefs.current[activeTab];
      if (activeButton) {
        const { offsetWidth, offsetLeft } = activeButton;
        setIndicatorStyle({ width: offsetWidth, left: offsetLeft });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col w-full">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <div className="flex gap-2 w-full sm:w-[75%] md:w-[85%] lg:w-[75%] rounded-full p-1  overflow-x-auto no-scrollbar">
              {/* indicator uses absolute pixel values derived from refs for accuracy */}
              <motion.div
                className="absolute top-1 bottom-1 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full shadow-md"
                animate={{
                  width: indicatorStyle.width,
                  left: indicatorStyle.left,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 30,
                }}
              />

              <div className="flex gap-2 whitespace-nowrap">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    ref={(el) => (tabRefs.current[tab.id] = el)}
                    className={`relative flex-shrink-0 min-w-[110px] sm:min-w-0 px-3 sm:px-4 py-2 sm:py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${
                      activeTab === tab.id ? "text-white" : "text-black"
                    } text-sm sm:text-base`}
                    onClick={() => handleTabClick(tab.id)}
                    aria-pressed={activeTab === tab.id}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-grow border-gray-300 min-h-[60vh] sm:min-h-screen h-auto overflow-y-auto">
            {activeTab === "goals" && <Goals />}
            {activeTab === "kra" && <KRA />}
            {activeTab === "mapping" && <Mapping />}
            {activeTab === "settingannualgoals" && <SettingAnnualGoals />}
            {activeTab === "approvalsetup" && <ApprovalSetup />}
            {activeTab === "approvegoal" && <ApproveGoal />}
            {activeTab === "goalsetting" && <GoalSetting />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PMSTab;
