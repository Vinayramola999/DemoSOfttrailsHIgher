// import axios from 'axios';
// import { useState, useEffect, useRef } from 'react';
// import { motion } from 'framer-motion';
// import EmployeeData from '../employee data/EmployeeData';
// import Recruitment from './RecruitmentTab';
// import HRPolicies from './HRPolicies';
// import BulkAttendance from './BulkAttendance';
// import VerifyToken from '../../NewComponents/VerifyToken';

// const HRCorner = () => {
//     const [userData, setUserData] = useState(null);
//     const [loading, setLoading] = useState(null);
//     const [activeTab, setActiveTab] = useState("EmployeeData");
//     const userId = sessionStorage.getItem('userId');
//     const [tabs, setTabs] = useState([{ id: "EmployeeData", label: "Employees" }]);

//     const getToken = () => {
//         const token = sessionStorage.getItem('token');
//         return token;
//     };
//     const token = getToken();
//     VerifyToken("/HRCorner");

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
//                 const hasEmployeeDataAccess = userAccess.some(access => access.api_name === 'EmployeeData');
//                 const hasRecruitmentAccess = userAccess.some(access => access.api_name === 'Recruitment');
//                 const hasPolicyAccess = userAccess.some(access => access.api_name === 'HRPolicies');
//                 const hasBulkAttendanceAccess = userAccess.some(access => access.api_name === 'BulkAttendance');
//                 const accessibleTabs = [];
//                 if (hasEmployeeDataAccess) accessibleTabs.push({ id: "EmployeeData", label: "Employees" });
//                 if (hasRecruitmentAccess) accessibleTabs.push({ id: "Recruitment", label: "Recruitment Activity" });
//                 if (hasPolicyAccess) accessibleTabs.push({ id: "HRPolicies", label: "HR Policies" });
//                 if (hasBulkAttendanceAccess) accessibleTabs.push({ id: "BulkAttendance", label: "Attendance" });
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
//     const tabRefs = useRef({});
//     const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

//     useEffect(() => {
//         const currentTab = tabRefs.current[activeTab];
//         if (currentTab) {
//             const { offsetLeft, offsetWidth } = currentTab;
//             setIndicatorStyle({ width: offsetWidth, left: offsetLeft });
//         }
//     }, [activeTab]);

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
//                     <div className="relative overflow-x-auto no-scrollbar">
//                         <div className="relative w-full border-b border-gray-300 overflow-x-auto px-2 py-2">
//                             <div className="flex gap-2 relative w-max">
//                                 {/* Motion indicator */}
//                                 <motion.div
//                                     className="absolute bottom-0 h-1 rounded-full"
//                                     animate={{ width: indicatorStyle.width, left: indicatorStyle.left }}
//                                     transition={{ type: "spring", stiffness: 500, damping: 30 }}
//                                 />
//                                 {tabs.map((tab) => (
//                                     <button
//                                         key={tab.id}
//                                         ref={(el) => (tabRefs.current[tab.id] = el)}
//                                         onClick={() => setActiveTab(tab.id)}
//                                         className={`relative z-10 px-5 py-2 text-sm font-medium border rounded-md ${activeTab === tab.id
//                                             ? "bg-white border-gray-300 text-black"
//                                             : "bg-gray-200 border-gray-300 text-gray-600"
//                                             }`}
//                                     >
//                                         {tab.label}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>
//                      </div>

//                     {/* Tab Content */}
//                     <div className="flex-grow border-gray-300">
//                         {activeTab === "EmployeeData" && <EmployeeData />}
//                         {activeTab === "Recruitment" && <Recruitment />}
//                         {activeTab === "HRPolicies" && <HRPolicies />}
//                         {activeTab === "BulkAttendance" && <BulkAttendance />}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
// export default HRCorner;



import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EmployeeData from '../employee data/EmployeeData';
import Recruitment from './RecruitmentTab';
import HRPolicies from './HRPolicies';
import BulkAttendance from './BulkAttendance';
import VerifyToken from '../../NewComponents/VerifyToken';

const HRCorner = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [activeTab, setActiveTab] = useState("EmployeeData");
    const userId = sessionStorage.getItem('userId');
    const [tabs, setTabs] = useState([{ id: "EmployeeData", label: "Employees" }]);
    VerifyToken("/HRCorner");

    const getToken = () => {
        const token = sessionStorage.getItem('token');
        return token;
    };
    const token = getToken();

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`https://devdemo.softtrails.net/users/id_user/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (response.data.user) {
                        const user = response.data.user;
                        setUserData(user);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [token, userId]);

    useEffect(() => {
        const checkAMSAccess = async () => {
            setLoading(true);
            try {
                const userId = sessionStorage.getItem('userId');
                const token = sessionStorage.getItem('token');
                if (!userId || !token) {
                    console.error('userId or token is missing');
                    return;
                }
                const response = await axios.get(`https://devdemo.softtrails.net/access/access/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const userAccess = response.data;
                const hasEmployeeDataAccess = userAccess.some(access => access.api_name === 'EmployeeData');
                const hasRecruitmentAccess = userAccess.some(access => access.api_name === 'Recruitment');
                const hasPolicyAccess = userAccess.some(access => access.api_name === 'HRPolicies');
                const hasBulkAttendanceAccess = userAccess.some(access => access.api_name === 'BulkAttendance');
                const accessibleTabs = [];
                if (hasEmployeeDataAccess) accessibleTabs.push({ id: "EmployeeData", label: "Employees" });
                if (hasRecruitmentAccess) accessibleTabs.push({ id: "Recruitment", label: "Recruitment Activity" });
                if (hasPolicyAccess) accessibleTabs.push({ id: "HRPolicies", label: "HR Policies" });
                if (hasBulkAttendanceAccess) accessibleTabs.push({ id: "BulkAttendance", label: "Attendance" });
                setTabs(accessibleTabs);
                setActiveTab(accessibleTabs[0].id);
            } catch (error) {
                console.error('Error during API call: ', error);
            } finally {
                setLoading(false);
            }
        };

        checkAMSAccess();
    }, []);

    return (
        <div className='flex flex-col w-full'>
            <div className="flex flex-col w-[100%]">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 w-[60%] rounded-full p-1 relative">
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                            style={{ width: `calc(100% / ${tabs.length})`, left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`, }}
                            transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 20,
                            }}
                        />
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id ? "text-white" : "text-gray-700"
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex-grow h-screen">
                        {activeTab === "EmployeeData" && <EmployeeData />}
                        {activeTab === "Recruitment" && <Recruitment />}
                        {activeTab === "HRPolicies" && <HRPolicies />}
                        {activeTab === "BulkAttendance" && <BulkAttendance />}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HRCorner;