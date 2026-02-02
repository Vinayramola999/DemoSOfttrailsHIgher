import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { FaUser, FaFile, FaProjectDiagram, FaTh, FaTimes, FaIndustry, FaCoins, FaUserShield, FaServer, FaUserCog, FaComments, FaClipboardList, FaTachometerAlt, FaBuilding, FaCalendarAlt, FaCog, FaShoppingCart,FaRegFolderOpen,FaFileUpload} from "react-icons/fa";
import logo from "../assests/Logo.png";
// import logo from "../assests/LOGODEMO.png";
import SoftTrails from "../assests/SoftTrails.png";
import { RiFunctionAddLine } from "react-icons/ri";
import { MdDashboard, MdOutlinePeopleOutline } from "react-icons/md";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";
import { PiMedalBold } from "react-icons/pi";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [loading, setLoading] = useState();
  const [hasAMSAccessASM, setHasAMSAccessASM] = useState(false);
  const [hasAMSAccessUCS, setHasAMSAccessUCS] = useState(false);
  const [hasAMSAccessHRMS, setHasAMSAccessHRMS] = useState(false);
  const [hasAMSAccessCRM, setHasAMSAccessCRM] = useState(false);
  const [hasAMSAccessORG, setHasAMSAccessORG] = useState(false);
  const [hasAMSAccessUser, setHasAMSAccessUser] = useState(false);
  const [hasAMSAccessLeave, setHasAMSAccessLeave] = useState(false);
  const [hasAMSAccessAttendance, setHasAMSAccessAttendance] = useState(false);
  const [hasAMSAccessPMS, setHasAMSAccessPMS] = useState(false);
  const [hasAMSAccessPrivilege, setHasAMSAccessPrivilege] = useState(false);
  const [hasAMSAccessApprovals, setHasAMSAccessApprovals] = useState(false);
  const [hasAMSAccessLogs, setHasAMSAccessLogs] = useState(false);
  const [hasAMSAccessAsset, setHasAMSAccessAsset] = useState(false);
  const [hasAMSAccessCategory, setHasAMSAccessCategory] = useState(false);
  const [hasAMSAccessValuation, setHasAMSAccessValuation] = useState(false);
  const [hasAMSAccessPurchase, setHasAMSAccessPurchase] = useState(false);
  const [hasAMSAccessLogsAccess, setHasAMSAccessLogsAccess] = useState(false);
  const [hasAMSAccessBudget, setHasAMSAccessBudget] = useState(false);
  const [hasAMSAccessWorkflow, setHasAMSAccessWorkflow] = useState(false);
  const [hasAMSAccessDMS, setHasAMSAccessDMS] = useState(false);
  const [hasAMSAccessPAL, setHasAMSAccessPAL] = useState(false);
  const [hasAMSAccessCMS, setHasAMSAccessCMS] = useState(false);
  const [hasAMSAccessAllCMS, setHasAMSAccessAllCMS] = useState(false);
  const [isProductAddonOpen, setIsProductAddonOpen] = useState(false);
  const [hasAMSHR, setHasAMSHR] = useState(false);
  const userId = sessionStorage.getItem("userId");

  const [isCrmOpen, setIsCrmOpen] = useState(
    location.pathname.includes("/CRMTabs")
  );
  const [isHRMSOpen, setIsHRMSOpen] = useState(
    location.pathname.includes("/PMSTab") ||
      location.pathname.includes("/Leave") ||
      location.pathname.includes("/AMSTab") ||
      location.pathname.includes("/HRCorner")
  );
  const [isAssetOpen, setIsAssetOpen] = useState(
    location.pathname.includes("/AllTab") ||
      location.pathname.includes("/RepoAllTab") ||
      location.pathname.includes("/CategoryTab") ||
      location.pathname.includes("/AddRequirement") ||
      location.pathname.includes("/Depreciation") ||
      location.pathname.includes("/Workflow") ||
      location.pathname.includes("/AssetHistory") ||
      location.pathname.includes("/Reports")
  );
  const [isProcessOpen, setIsProcessOpen] = useState(
    location.pathname.includes("/Project") ||
      location.pathname.includes("/AllocationRequest") ||
      location.pathname.includes("/ProjectApproval")
  );
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(
    location.pathname.includes("/PurchaseModule") ||
      location.pathname.includes("/PurchaseApproval") ||
      location.pathname.includes("/PurchaseProcess") ||
      location.pathname.includes("/PurchaseWorkflow") ||
      location.pathname.includes("/VendorManagement")
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(
    location.pathname.includes(`/employeelayout/${userId}`) ||
      location.pathname.includes("/change")
  );
  const [isDmsOpen, setIsDmsOpen] = useState(
    location.pathname.includes("/dms")
  );
  const [isSalesManagementOpen, setIsSalesManagementOpen] = useState([
    location.pathname.includes("/Lead"),
  ]);
  const [isCmsOpen, setIsCmsOpen] = useState(
    location.pathname.includes("/CmsDashBoard") ||
      location.pathname.includes("/setup") ||
      location.pathname.includes("/customers") ||
      location.pathname.includes("/products") ||
      location.pathname.includes("/our-products") ||
      location.pathname.includes("/product/:id") ||
      location.pathname.includes("/product-show/:id") ||
      location.pathname.includes("/productaddon/ucs")
  );
  const toggleCrmMenu = () => {
    setIsCrmOpen((prevState) => !prevState);
  };
  const toggleHRMSMenu = () => {
    setIsHRMSOpen((prevState) => !prevState);
  };
  const toggleAssetMenu = () => {
    setIsAssetOpen((prevState) => !prevState);
  };
  const toggleProcessMenu = () => {
    setIsProcessOpen((prevState) => !prevState);
  };
  const toggleDmsMenu = () => {
    setIsDmsOpen((prevState) => !prevState);
  };
  const toggleSalesManagementMenu = () => {
    setIsSalesManagementOpen((prevState) => !prevState);
  };
  const togglePurchaseMenu = () => {
    setIsPurchaseOpen((prevState) => !prevState);
  };
  const toggleSettingsMenu = () => {
    setIsSettingsOpen((prevState) => !prevState);
  };
  const toggleCmsMenu = () => {
    setIsCmsOpen((prevState) => !prevState);
  };
  const toggleProductAddonMenu = () => {
    setIsProductAddonOpen((prev) => !prev);
  };
  const hasFetchedRef = useRef(false);
  const checkAMSAccess = useCallback(async () => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    setLoading(true);
    try {
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");
      if (!userId || !token) {
        console.error("userId or token is missing");
        return;
      }

      const response = await axios.get(
        `https://devdemo.softtrails.net/access/access/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const userAccess = response.data;
      const hasAccess = {
        ASM: "ASM",
        UCS: "UCS",
        HRMS: "HRMS",
        CRM: "CRM",
        ORG: "ORG",
        UMC: "UMC",
        LMC: "LMC",
        DMS: "DMS",
        update_access: "update_access",
        Approvals: "Approvals",
        Logs: "Logs",
        RepoAllTab: "RepoAllTab",
        Category: "Category",
        Valuation: "Valuation",
        WF: "WF",
        purchase_module: "purchase_module",
        doc_management: "doc_management",
        Budget: "Budget",
        LogsAccess: "LogsAccess",
        HR: "HR",
        TalentDatabase: "TalentDatabase",
        AttendanceTab: "AttendanceTab",
        PMS: "PMS",
        CMS: "CMS",
      };
      setHasAMSAccessASM(userAccess.some((access) => access.api_name === hasAccess.ASM));
      setHasAMSAccessUCS(userAccess.some((access) => access.api_name === hasAccess.UCS));
      setHasAMSAccessHRMS(userAccess.some((access) => access.api_name === hasAccess.HRMS));
      setHasAMSAccessCRM(userAccess.some((access) => access.api_name === hasAccess.CRM));
      setHasAMSAccessORG(userAccess.some((access) => access.api_name === hasAccess.ORG));
      setHasAMSAccessAttendance(userAccess.some((access) => access.api_name === hasAccess.AttendanceTab));
      setHasAMSAccessPMS(userAccess.some((access) => access.api_name === hasAccess.PMS));
      setHasAMSAccessUser(userAccess.some((access) => access.api_name === hasAccess.UMC));
      setHasAMSAccessLeave(userAccess.some((access) => access.api_name === hasAccess.LMC));
      setHasAMSAccessPrivilege(userAccess.some((access) => access.api_name === hasAccess.update_access));
      setHasAMSAccessApprovals(userAccess.some((access) => access.api_name === hasAccess.Approvals));
      setHasAMSAccessLogs(userAccess.some((access) => access.api_name === hasAccess.Logs));
      setHasAMSAccessAsset(userAccess.some((access) => access.api_name === hasAccess.RepoAllTab));
      setHasAMSAccessCategory(userAccess.some((access) => access.api_name === hasAccess.Category));
      setHasAMSAccessValuation(userAccess.some((access) => access.api_name === hasAccess.Valuation));
      setHasAMSAccessPurchase(userAccess.some((access) => access.api_name === hasAccess.purchase_module));
      setHasAMSAccessBudget(userAccess.some((access) => access.api_name === hasAccess.Budget));
      setHasAMSAccessWorkflow(userAccess.some((access) => access.api_name === hasAccess.WF));
      setHasAMSAccessLogsAccess(userAccess.some((access) => access.api_name === hasAccess.LogsAccess));
      setHasAMSHR(userAccess.some((access) => access.api_name === hasAccess.HR));
      setHasAMSAccessDMS(userAccess.some((access) => access.api_name === hasAccess.doc_management));
      setHasAMSAccessPAL(userAccess.some((access) => access.api_name === hasAccess.PAL));
      setHasAMSAccessCMS(userAccess.some((access) => access.api_name === hasAccess.CMS));
      setHasAMSAccessAllCMS(userAccess.some((access) => access.api_name === hasAccess.AllCMS));
    } catch (error) {
      console.error("Error occurred during API call: ", error);
      if (error.response) {
        console.error("API Response error:", error.response.data);
        console.error("Status code:", error.response.status);
      } else if (error.request) {
        console.error("No response received from API:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      setHasAMSAccessASM(false);
      setHasAMSAccessDMS(false);
      setHasAMSAccessPAL(false);
      setHasAMSAccessUCS(false);
      setHasAMSAccessHRMS(false);
      setHasAMSAccessCRM(false);
      setHasAMSAccessORG(false);
      setHasAMSAccessAttendance(false);
      setHasAMSAccessPMS(false);
      setHasAMSAccessUser(false);
      setHasAMSAccessLeave(false);
      setHasAMSAccessPrivilege(false);
      setHasAMSAccessApprovals(false);
      setHasAMSAccessLogs(false);
      setHasAMSAccessAsset(false);
      setHasAMSAccessCategory(false);
      setHasAMSAccessValuation(false);
      setHasAMSAccessPurchase(false);
      setHasAMSAccessBudget(false);
      setHasAMSAccessWorkflow(false);
      setHasAMSAccessLogsAccess(false);
      setHasAMSHR(false);
      setHasAMSAccessCMS(false);
      setHasAMSAccessAllCMS(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAMSAccess();
  }, [checkAMSAccess]);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && ( <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={onClose} /> )}

      <div
        className={` fixed top-0 left-0 h-full w-64 bg-white border p-5 rounded-r-lg flex flex-col text-[14px] z-30 transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-[15%] lg:rounded-lg `}
        onClick={(e) => e.stopPropagation()}
      >
      {/* Close button for mobile */}
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 lg:hidden" > <FaTimes size={20} /> </button>

        {/* Logo */}
        <div className="border-b border-gray-300 pb-4 mb-4 flex justify-center"> <img src={logo} alt="Logo" className="w-30" /> </div>
        <div className="flex-grow overflow-y-auto scrollbar-hide pr-2">
          <ul className="list-none p-0">
            {/*ORG */}
            {hasAMSAccessORG && (
              <li className="mt-1">
                {" "}
                <Link
                  to="/Organization"
                  className={`flex items-center p-2 text-black rounded transition-colors ${
                    location.pathname === "/Organization"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {" "}
                  <FaBuilding className="mr-2" /> Organization Setup
                </Link>{" "}
              </li>
            )}
            {/* User Directory */}
            {hasAMSAccessUser && (
              <li className="mt-1">
                {" "}
                <Link
                  to="/Users"
                  className={`flex items-center p-2 text-black rounded transition-colors ${
                    location.pathname === "/Users"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {" "}
                  <FaUser className="mr-2" /> Directory Service{" "}
                </Link>{" "}
              </li>
            )}
            {/* HRMS Menu Item */}
            {hasAMSAccessHRMS && (
              <li className="mt-1">
                <div
                  onClick={toggleHRMSMenu}
                  className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <FaUserCog className="mr-2" /> HRMS{" "}
                </div>
                {isHRMSOpen && (
                  <ul className="ml-4">
                    {hasAMSAccessLeave && (
                      <li className="mt-1">
                        <Link
                          to="/Leave"
                          className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                            location.pathname === "/Leave"
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          <FaCalendarAlt className="mr-2" /> Leave Management
                        </Link>
                      </li>
                    )}
                    {hasAMSHR && (
                      <li className="mt-1">
                        {" "}
                        <Link
                          to="/HRCorner"
                          className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                            location.pathname === "/HRCorner"
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          {" "}
                          <FaBuilding className="mr-2" /> HR Corner{" "}
                        </Link>
                      </li>
                    )}
                    {hasAMSAccessAttendance && (
                      <li className="mt-1">
                        {" "}
                        <Link
                          to="/AMSTab"
                          className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                            location.pathname === "/AMSTab"
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          {" "}
                          <FaBuilding className="mr-2" /> Attendance Management{" "}
                        </Link>{" "}
                      </li>
                    )}
                    {hasAMSAccessPMS && (
                      <li className="mt-1">
                        {" "}
                        <Link
                          to="/PMSTab"
                          className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                            location.pathname === "/PMSTab"
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          {" "}
                          <FaBuilding className="mr-2" /> Performance Management{" "}
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            )}
            {/* ASM Menu Item */}
            {hasAMSAccessASM && (
              <li className="mt-1">
                <div
                  onClick={toggleAssetMenu}
                  className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                >
                  {" "}
                  <FaServer className="mr-2" /> Asset Management{" "}
                </div>
                {isAssetOpen && (
                  <ul className="ml-4">
                    <li className="mt-3">
                      <Link
                        to="/Reports"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/Reports"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        <FaTachometerAlt className="mr-2" />
                        Dashboard
                      </Link>
                    </li>
                    {hasAMSAccessApprovals && (
                      <li className="mt-3">
                        <Link
                          to="/AllTab"
                          className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                            location.pathname === "/AllTab"
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          <FaUserCog className="mr-2" /> Approvals
                        </Link>
                      </li>
                    )}
                    {/* {hasAMSAccessLogs && (
                                        <li className="mt-3">
                                            <Link
                                                to="/ResubmittedApproval"
                                                className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${location.pathname === '/ResubmittedApproval' ? 'bg-blue-600 text-white' : 'hover:bg-blue-600 hover:text-white'}`}
                                            >
                                                <FaUserCog className="mr-2" /> Resubmitted Logs
                                            </Link>
                                        </li>
                                    )} */}
                    {hasAMSAccessAsset && (
                      <li className="mt-3">
                        {" "}
                        <Link
                          to="/RepoAllTab"
                          className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                            location.pathname === "/RepoAllTab"
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          <FaTh className="mr-2" /> Asset{" "}
                        </Link>{" "}
                      </li>
                    )}
                    {hasAMSAccessCategory && (
                      <li className="mt-3">
                        {" "}
                        <Link
                          to="/CategoryTab"
                          className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                            location.pathname === "/CategoryTab"
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          {" "}
                          <FaClipboardList className="mr-2" /> Asset Category{" "}
                        </Link>{" "}
                      </li>
                    )}
                    {hasAMSAccessValuation && (
                      <li className="mt-3">
                        <Link
                          to="/Depreciation"
                          className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                            location.pathname === "/Depreciation"
                              ? "bg-blue-600 text-white"
                              : "hover:bg-blue-600 hover:text-white"
                          }`}
                        >
                          <FaUserCog className="mr-2" />
                          Asset Valuation
                        </Link>
                      </li>
                    )}
                    <li className="mt-3">
                      <Link
                        to="/AssetHistory"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/AssetHistory"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        <FaProjectDiagram className="mr-2" />
                        Asset History
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}
            {/*Document Management System */}
            {hasAMSAccessDMS && (
              <li className="mt-1">
                <div
                  onClick={toggleDmsMenu}
                  className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <FaRegFolderOpen className="mr-2" /> DMS
                </div>
                {isDmsOpen && (
                  <ul className="ml-4">
                    <li className="mt-1">
                      <Link
                        to="/dms/setup"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/dms/setup"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        <FaCog className="mr-2" />
                        Setup
                      </Link>
                    </li>
                    <li className="mt-1">
                      <Link
                        to="/dms/upload"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/dms/upload"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        <FaFileUpload className="mr-2" />
                        Upload
                      </Link>
                    </li>  
                  </ul>
                )}
              </li>
            )}
            {/* Project Assembly Line */}
            {/* {hasAMSAccessPAL && ( */}
            <li className="mt-1">
              <div
                onClick={toggleProcessMenu}
                className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
              >
                <FaIndustry className="mr-2" /> Product Assembly Line
              </div>
              {isProcessOpen && (
                <ul className="ml-4">
                  <li className="mt-3">
                    <Link
                      to="/Project"
                      className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                        location.pathname === "/Project"
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      <FaUserCog className="mr-2" /> Project
                    </Link>
                  </li>
                  <li className="mt-3">
                    <Link
                      to="/AllocationRequest"
                      className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                        location.pathname === "/AllocationRequest"
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      <FaProjectDiagram className="mr-2" />
                      Allocation
                    </Link>
                  </li>
                  <li className="mt-3">
                    <Link
                      to="/Processtab"
                      className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                        location.pathname === "/Processtab"
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      <FaUser className="mr-2" />
                      Approvals
                    </Link>
                  </li>
                  <li className="mt-3">
                    <Link
                      to="/ProjectEstimation"
                      className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                        location.pathname === "/ProjectEstimation"
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      <FaUser className="mr-2" />
                      Production Estimation
                    </Link>
                  </li>
                  <li className="mt-3">
                    <Link
                      to="/ProductionOutput"
                      className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                        location.pathname === "/ProductionOutput"
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      <FaProjectDiagram className="mr-2" />
                      Production Output
                    </Link>
                  </li>
                  {/* <li className="mt-3">
                                    <Link
                                        to="/ProductionRepository"
                                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${location.pathname === "/ProductionRepository"
                                            ? "bg-blue-600 text-white"
                                            : "hover:bg-blue-600 hover:text-white"
                                            }`}
                                    >
                                        <FaUser className="mr-2" />
                                       Production Repository
                                    </Link>
                                </li> */}
                </ul>
              )}
            </li>
            {/* CRM */}
            {hasAMSAccessCRM && (
              <li className="mt-3">
                <div
                  onClick={toggleCrmMenu}
                  className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                >
                  <FaUser className="mr-2" /> CRM
                </div>

                {isCrmOpen && (
                  <ul className="ml-4">
                    {/* Customers Tab */}
                    <li className="mt-1">
                      <Link
                        to="/CRMTabs"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/CRMTabs"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        <FaUser className="mr-2" /> Customers
                      </Link>
                    </li>

                    {/* Sales Management Section */}
                    <li className="mt-1">
                      <div
                        onClick={toggleSalesManagementMenu}
                        className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors text-[12px]"
                      >
                        {" "}
                        <FaUser className="mr-2" /> Sales Management
                      </div>
                      {isSalesManagementOpen && (
                        <ul className="ml-6">
                          {/* Leads Tab */}
                          <li className="mt-1">
                            <Link
                              to="/Lead"
                              className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                                location.pathname === "/Lead"
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              {" "}
                              <FaUser className="mr-2" /> Leads{" "}
                            </Link>
                          </li>
                          <li className="mt-1">
                            <Link
                              to="/SalesProcess"
                              className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                                location.pathname === "/SalesProcess"
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              {" "}
                              <FaUser className="mr-2" /> Sales Process
                            </Link>
                          </li>
                        </ul>
                      )}
                    </li>
                  </ul>
                )}
              </li>
            )}
            {/*UCS */}
            {hasAMSAccessUCS && (
              <li className="mt-1"> <Link to="/AllTabs" className={`flex items-center p-2 text-black rounded transition-colors ${ location.pathname === "/AllTabs" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} > <FaComments className="mr-2" /> Communication Service{" "} </Link> </li>
            )}
            {/* Workflow */}
             {hasAMSAccessWorkflow && (
            <li className="mt-1"><Link to="/SetupWorkflow" className={`flex items-center p-2 rounded transition-colors text-[12px] ${location.pathname === "/SetupWorkflow" ? "bg-blue-600 text-white" : "text-black hover:bg-blue-600 hover:text-white" }`} > <FaProjectDiagram className="mr-2" /> Approval Workflow </Link></li>
            )}
            {/* PURCHASE MODULE */}
            {hasAMSAccessPurchase && (
              <li className="mt-1">
                <div onClick={togglePurchaseMenu} className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors" ><FaShoppingCart className="mr-2" /> Purchase Module </div>
                {isPurchaseOpen && (
                  <ul className="ml-4">
                    <li className="mt-3">
                      <Link to="/PurchaseModule" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${ location.pathname === "/PurchaseModule" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} > <FaUserCog className="mr-2" /> Indent </Link>
                    </li>
                    <li className="mt-3">
                      <Link to="/PurchaseApproval" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${ location.pathname === "/PurchaseApproval" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} ><FaUserCog className="mr-2" /> Approval </Link>
                    </li>
                    <li className="mt-3">
                      <Link
                        to="/PurchaseWorkflow"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/PurchaseWorkflow"
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-600 hover:text-white"
                        }`}
                      > 
                        <FaTh className="mr-2" /> Purchase Workflow
                      </Link>
                    </li>
                    <li className="mt-3">
                      <Link to="/PurchaseProcess" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${ location.pathname === "/PurchaseProcess" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} > <FaTh className="mr-2" /> Purchase Process </Link>
                    </li>
                    <li className="mt-3">
                      <Link to="/VendorManagement" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${ location.pathname === "/VendorManagement" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} >
                        <FaTh className="mr-2" /> Vendor Management
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            )}
            {/* Financial Module */}
            {hasAMSAccessBudget && (
              <li className="mt-1">
                {" "}
                <Link
                  to="/FinancialBudget"
                  className={`flex items-center p-2 text-black rounded transition-colors ${
                    location.pathname === "/FinancialBudget"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {" "}
                  <FaCoins className="mr-2" /> Financial Budget{" "}
                </Link>{" "}
              </li>
            )}           
            {/* Access Privilege*/}
            {hasAMSAccessPrivilege && (
              <li className="mt-1">
                {" "}
                <Link
                  to="/AccessPrivilege"
                  className={`flex items-center p-2 text-black rounded transition-colors ${
                    location.pathname === "/AccessPrivilege"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {" "}
                  <FaUserShield className="mr-2" /> Access Privilege{" "}
                </Link>{" "}
              </li>
            )}
            {/* Logs */}
            {hasAMSAccessLogsAccess && (
              <li className="mt-1">
                {" "}
                <Link
                  to="/LogsPage"
                  className={`flex items-center p-2 text-black rounded transition-colors ${
                    location.pathname === "/LogsPage"
                      ? "bg-blue-600 text-white"
                      : "hover:bg-blue-600 hover:text-white"
                  }`}
                >
                  {" "}
                  <FaUser className="mr-2" /> Logs{" "}
                </Link>{" "}
              </li>
            )}
            {/* CMS  */}
            {hasAMSAccessCMS && (
              <li className="mt-1">
                <div
                  onClick={toggleCmsMenu}
                  className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                >
                  {" "}
                  <FaUser className="mr-2" /> CMS Module{" "}
                </div>
                {isCmsOpen && (
                  // <ul className="ml-4">
                  //    {hasAMSAccessAllCMS &&(
                  //     <li className="mt-3"><Link to="/CmsDashBoard" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${location.pathname === "/CmsDashBoard" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} > <MdDashboard className="mr-2" /> DashBoard </Link></li>
                  //     )}
                  //      {hasAMSAccessAllCMS &&(
                  //     <li className="mt-3"> <Link to="/products" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${location.pathname === "/products" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} > <MdOutlineProductionQuantityLimits className="mr-2" /> Product </Link> </li>
                  //      )}
                  //     {hasAMSAccessCMS && (
                  //     <li className="mt-3"><Link to="/setup" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${location.pathname === "/setup" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} > <PiMedalBold className="mr-2" /> Setup </Link></li>
                  //     )}
                  //     {hasAMSAccessAllCMS && (
                  //     <li className="mt-3"> <Link to="/customers" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${location.pathname === "/customers" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} > <MdOutlinePeopleOutline className="mr-2" /> Customers </Link> </li>
                  //     )}
                  //     {hasAMSAccessAllCMS &&(
                  //     <li className="mt-3">
                  //         <div onClick={toggleProductAddonMenu} className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors text-[12px]" > <RiFunctionAddLine className="mr-2" /> Product Add On </div>
                  //         {isProductAddonOpen && (
                  //             <ul className="ml-6 mt-2">
                  //                 <li className="mt-2"> <Link to="/productaddon/ucs" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${location.pathname === "/productaddon/ucs" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} > UCS </Link> </li>
                  //                 <li className="mt-2"> <Link to="/productaddon/dms" className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${location.pathname === "/productaddon/dms" ? "bg-blue-600 text-white" : "hover:bg-blue-600 hover:text-white" }`} > DMS </Link> </li>
                  //             </ul>
                  //         )}
                  //     </li>
                  //     )}
                  // </ul>
                  <ul className="ml-4">
                    <li className="mt-3">
                      <Link
                        to="/CmsDashBoard"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/CmsDashBoard"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        {" "}
                        <MdDashboard className="mr-2" /> DashBoard{" "}
                      </Link>
                    </li>

                    <li className="mt-3">
                      {" "}
                      <Link
                        to="/products"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/products"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        {" "}
                        <MdOutlineProductionQuantityLimits className="mr-2" />{" "}
                        Product{" "}
                      </Link>{" "}
                    </li>

                    <li className="mt-3">
                      <Link
                        to="/setup"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/setup"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        {" "}
                        <PiMedalBold className="mr-2" /> Setup{" "}
                      </Link>
                    </li>
                    <li className="mt-3">
                      {" "}
                      <Link
                        to="/customers"
                        className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                          location.pathname === "/customers"
                            ? "bg-blue-600 text-white"
                            : "hover:bg-blue-600 hover:text-white"
                        }`}
                      >
                        {" "}
                        <MdOutlinePeopleOutline className="mr-2" /> Customers{" "}
                      </Link>{" "}
                    </li>
                    <li className="mt-3">
                      <div
                        onClick={toggleProductAddonMenu}
                        className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors text-[12px]"
                      >
                        {" "}
                        <RiFunctionAddLine className="mr-2" /> Product Add On{" "}
                      </div>
                      {isProductAddonOpen && (
                        <ul className="ml-6 mt-2">
                          <li className="mt-2">
                            {" "}
                            <Link
                              to="/productaddon/ucs"
                              className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                                location.pathname === "/productaddon/ucs"
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              {" "}
                              UCS{" "}
                            </Link>{" "}
                          </li>
                          <li className="mt-2">
                            {" "}
                            <Link
                              to="/productaddon/dms"
                              className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                                location.pathname === "/productaddon/dms"
                                  ? "bg-blue-600 text-white"
                                  : "hover:bg-blue-600 hover:text-white"
                              }`}
                            >
                              {" "}
                              DMS{" "}
                            </Link>{" "}
                          </li>
                        </ul>
                      )}
                    </li>
                  </ul>
                )}
              </li>
            )}
            {/* Settings */}
            <li className="mt-1">
              <div
                onClick={toggleSettingsMenu}
                className="flex items-center p-2 text-black rounded cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
              >
                {" "}
                <FaCog className="mr-2" /> Settings{" "}
              </div>
              {isSettingsOpen && (
                <ul className="ml-4">
                  <li className="mt-3">
                    <Link
                      to={`/employeelayout/${userId}`}
                      className={`flex items-center p-2 text-black rounded transition-colors text-[12px] ${
                        location.pathname === `/employeelayout/${userId}`
                          ? "bg-blue-600 text-white"
                          : "hover:bg-blue-600 hover:text-white"
                      }`}
                    >
                      {" "}
                      <FaUser className="mr-2" /> Profile{" "}
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          </ul>
        </div>
        {/* Footer */}
        <div className="mt-auto flex flex-col items-center text-center border-t border-gray-300">
          <p className="text-sm text-gray-500 mt-5">Powered by</p>
          <img src={SoftTrails} alt="SoftTrails Logo" className="w-30 mb-2" />
        </div>
      </div>
    </>
  );
};
export default Sidebar;