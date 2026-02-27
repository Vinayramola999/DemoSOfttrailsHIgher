import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import VerifyToken from '../../NewComponents/VerifyToken';
import ApplyLeave from './ApplyLeave';
import BalanceLeave from './BalanceLeave';
import LeaveApproval from './LeaveApproval';
import LeavePolicy from './LeavePolicy';
import Holiday from './Holiday';
import AllBalances from './AllBalances';
import CalenderLeave from './CalenderLeave';
import AllLeave from './AllLeave';
import ApprovalStatus from './LeaveStatus';
import WorkingDays from './WorkingDays';
import ApprovalAuthority from './ApprovalAuthority';
import { MAIN_API_BASE } from '../../config/apiBase';

const Leave = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [activeTab, setActiveTab] = useState("summary");
    const userId = sessionStorage.getItem('userId');
    const [tabs, setTabs] = useState([{ id: "summary", label: "Summary" }]);
    VerifyToken("/Leave");

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
                    const response = await axios.get(`${MAIN_API_BASE}/users/id_user/${userId}`, {
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
                const response = await axios.get(`${MAIN_API_BASE}/access/access/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const userAccess = response.data;
                const hasCreateAccess = userAccess.some(access => access.api_name === 'Create');
                const hasApplyAccess = userAccess.some(access => access.api_name === 'Apply');
                const hasBalanceAccess = userAccess.some(access => access.api_name === 'Balance');
                const hasApprovalAccess = userAccess.some(access => access.api_name === 'Approval');
                const hasPolicyAccess = userAccess.some(access => access.api_name === 'Policy');
                const hasYearAccess = userAccess.some(access => access.api_name === 'YearSet');
                const hasWorkAccess = userAccess.some(access => access.api_name === 'Work');
                const hasHolidayAccess = userAccess.some(access => access.api_name === 'Holiday');
                const hasAllBalanceAccess = userAccess.some(access => access.api_name === 'AllBalance');
                const hasStatusAccess = userAccess.some(access => access.api_name === 'Status');
                const hasApprovalBalanceAccess = userAccess.some(access => access.api_name === 'ApprovalBalance');
                // Dynamically build tabs
                const accessibleTabs = [];
                if (hasPolicyAccess) accessibleTabs.push({ id: "policy", label: "Policy" });
                if (hasCreateAccess) accessibleTabs.push({ id: "alleave", label: "Create Leave" });
                if (hasApplyAccess) accessibleTabs.push({ id: "apply", label: "Apply Leave" });
                if (hasBalanceAccess) accessibleTabs.push({ id: "balance", label: "Balance Leave" });
                if (hasApprovalAccess) accessibleTabs.push({ id: "leaveapproval", label: "Leave Approval" });
                if (hasYearAccess) accessibleTabs.push({ id: "calender", label: "Year Setup" });
                if (hasWorkAccess) accessibleTabs.push({ id: "workingdays", label: "Working Days" });
                if (hasHolidayAccess) accessibleTabs.push({ id: "holiday", label: "Holiday" });
                if (hasAllBalanceAccess) accessibleTabs.push({ id: "allbalances", label: "All Balances" });
                if (hasStatusAccess) accessibleTabs.push({ id: "approvalstatus", label: "Status" });
                if (hasApprovalBalanceAccess) accessibleTabs.push({ id: "approvalauthority", label: "Balance Approval" });
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

    const tabRefs = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

    useEffect(() => {
        const currentTab = tabRefs.current[activeTab];
        if (currentTab) {
            const { offsetLeft, offsetWidth } = currentTab;
            setIndicatorStyle({ width: offsetWidth, left: offsetLeft });
        }
    }, [activeTab]);

    return (
        <div className="flex flex-col w-full">            
        {/* Tabs Bar */}
            <div className="relative overflow-x-auto no-scrollbar scrollbar-hide">
                <div className="flex gap-2 w-max px-1 py-1 rounded-full relative whitespace-nowrap">
                    <motion.div
                        layout
                        className="absolute bg-gradient-to-r from-blue-500 to-blue-800 rounded-full h-10 top-0 z-0"
                        animate={indicatorStyle}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />

                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            ref={(el) => (tabRefs.current[tab.id] = el)}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative z-10 px-4 py-2 text-[12px] font-medium rounded-full whitespace-nowrap ${activeTab === tab.id ? "text-white" : "text-black"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="flex-grow overflow-y-auto border-gray-300 p-2">
                {activeTab === "apply" && <ApplyLeave />}
                {activeTab === "balance" && <BalanceLeave />}
                {activeTab === "leaveapproval" && <LeaveApproval />}
                {activeTab === "policy" && <LeavePolicy />}
                {activeTab === "holiday" && <Holiday />}
                {activeTab === "allbalances" && <AllBalances />}
                {activeTab === "calender" && <CalenderLeave />}
                {activeTab === "alleave" && <AllLeave />}
                {activeTab === "approvalstatus" && <ApprovalStatus />}
                {activeTab === "workingdays" && <WorkingDays />}
                {activeTab === "approvalauthority" && <ApprovalAuthority />}
            </div>
        </div>

    );
};
export default Leave;