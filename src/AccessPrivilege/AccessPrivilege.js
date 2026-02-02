import axios from "axios";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import CRM from "./CRM";
import HRMS from "./HRMS1";
import ASM from "./ASM";
import UCS from "./UCS";
import Group from "./Group";
import AccessPrivilege from "./UpdateAccess";
import PurchaseModule from "./PurchaseAccess";
import Logs from "./LogsAccess";
import FinancialBudget from "./BudgetAccess";
import UserPrivilege from "./UserPrivilege";
import DocumentManagement from "./DMSAccess";
import Organization from "./OrganizationTab";
import PAL from "./PAL";
import CMSAccess from "./CMSAccess";
import Workflow from "./Workflow";
import VerifyToken from "../NewComponents/VerifyToken";

const AccessPrivilege1 = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("group");
  const userId = sessionStorage.getItem("userId");
  const [tabs, setTabs] = useState([{ id: "group", label: "Group" }]);
  VerifyToken("/AccessPrivilege");

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
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");
        if (!userId || !token) {
          console.error("userId or token is missing");
          return;
        }
        const response = await axios.get(`https://devdemo.softtrails.net/access/access/${userId}`,{ headers: { Authorization: `Bearer ${token}`, }, });
        const userAccess = response.data;
        const hasCRMAccess = userAccess.some((access) => access.api_name === "CRM");
        const hasHRMSAccess = userAccess.some((access) => access.api_name === "HRMS");
        const hasORGAccess = userAccess.some((access) => access.api_name === "ORG");
        const hasASMAccess = userAccess.some((access) => access.api_name === "ASM");
        const hasPALAccess = userAccess.some((access) => access.api_name === "PAL");
        const hasUCSAccess = userAccess.some((access) => access.api_name === "UCS");
        const hasAMSAccess = userAccess.some((access) => access.api_name === "update_access");
        const hasGroupAccess = userAccess.some((access) => access.module === "ROLE");
        const hasPurchaseAccess = userAccess.some((access) => access.api_name === "purchase_module");
        const hasLogsPagesAccess = userAccess.some((access) => access.api_name === "LogsAccess");
        const hasBudgetPagesAccess = userAccess.some((access) => access.api_name === "Budget");
        const hasUserAccess = userAccess.some((access) => access.api_name === "UMC");
        const hasDocumentAccess = userAccess.some((access) => access.api_name === "doc_management");
        const hasCMSAccess = userAccess?.some((access) => access.api_name === "CMS");
        const hasWorkflowAccess =userAccess?.some((access) => access.api_name === "WF")
        const accessibleTabs = [];
        if (hasGroupAccess) accessibleTabs.push({ id: "group", label: "Group" });
        if (hasORGAccess) accessibleTabs.push({ id: "org", label: "Org Setup" });
        if (hasUserAccess) accessibleTabs.push({ id: "user", label: "Directory Service" });
        if (hasHRMSAccess) accessibleTabs.push({ id: "hrms", label: "HRMS" });
        if (hasASMAccess) accessibleTabs.push({ id: "asm", label: "EAM" });
        if (hasPALAccess) accessibleTabs.push({ id: "pal", label: "Product Assembly" });
        if (hasDocumentAccess) accessibleTabs.push({ id: "dms", label: "DMS" });
        if (hasCRMAccess) accessibleTabs.push({ id: "crm", label: "CRM" });
        if (hasUCSAccess) accessibleTabs.push({ id: "ucs", label: "Communication Service" });
        if (hasWorkflowAccess) accessibleTabs.push({ id: "wf", label: "Workflow" });
        if (hasPurchaseAccess) accessibleTabs.push({ id: "purchasemodule", label: "Purchase Module", });
        if (hasBudgetPagesAccess) accessibleTabs.push({ id: "financialbudget", label: "Financial Budget", });  
        if (hasCMSAccess) accessibleTabs.push({ id: "cms", label: "CMS" });  
        if (hasAMSAccess) accessibleTabs.push({ id: "accessprivilege", label: "Access Privilege", });
        if (hasLogsPagesAccess)accessibleTabs.push({ id: "logs", label: "Logs" });
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
    <div className="flex flex-col w-full min-w-0">
      <div className="flex flex-col w-full">
        <div className="flex flex-col">
          {/* Tab Bar */}
          <div className="relative overflow-x-auto">
            <div className="flex gap-2 w-max px-1 py-1 rounded-full relative whitespace-nowrap">
              {/* Animated Indicator */}
              <motion.div
                layout
                className="absolute bg-gradient-to-r from-blue-500 to-blue-800 rounded-full h-10 top-0 z-0"
                animate={indicatorStyle}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />

              {/* Tab Buttons */}
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 px-4 py-2 text-[12px] font-medium rounded-full whitespace-nowrap ${
                    activeTab === tab.id ? "text-white" : "text-black"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-grow ">
            {activeTab === "group" && <Group />}
            {activeTab === "org" && <Organization />}
            {activeTab === "user" && <UserPrivilege />}
            {activeTab === "hrms" && <HRMS />}
            {activeTab === "asm" && <ASM />}
            {activeTab === "pal" && <PAL />}
            {activeTab === "dms" && <DocumentManagement />}
            {activeTab === "crm" && <CRM />}
            {activeTab === "ucs" && <UCS />}
            {activeTab === "purchasemodule" && <PurchaseModule />}
            {activeTab === "financialbudget" && <FinancialBudget />}
            {activeTab === "accessprivilege" && <AccessPrivilege />}
            {activeTab === "logs" && <Logs />}
            {activeTab === "cms" && <CMSAccess />}
            {activeTab === "wf" && <Workflow/>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AccessPrivilege1;
