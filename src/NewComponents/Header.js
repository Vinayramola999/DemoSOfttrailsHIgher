import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaArrowLeft, FaBars } from "react-icons/fa";
import ProfileDropdown from "../Cards/ProfileDropdown";
import { createPortal } from "react-dom";
import { MAIN_API_BASE } from "../config/apiBase";

const Header = ({ onHamburgerClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState(null);
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 80, left: 1200 });

  const toggleDropdown = () => {
    if (!dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 240;
      const margin = 10;

      let left = rect.left;
      let top = rect.bottom + 5;

      if (left + dropdownWidth > window.innerWidth - margin) {
        left = window.innerWidth - dropdownWidth - margin;
      }
      if (left > 1580) {
        left = 1580;
      }

      setDropdownPos({ top, left });
    }
    setDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    if (dropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `${MAIN_API_BASE}/users/id_user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data?.user) {
            setUserData(response.data.user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token]);

  const handleNavigate = () => {
    if (location.pathname.includes("/employeelayout")) {
      navigate("/HRCorner");
    } else {
      navigate("/Cards");
    }
  };

  const getHeading = () => {
    switch (location.pathname) {
      case "/documentUpload":
        return "Upload Employee Documents";
      case "/employeelayout":
        return "Employee Layout";
      case "/Reports":
        return "Dashboard";
      case "/PurchaseModule":
      case "/PurchaseWorkflow":
      case "/Approval":
        return "Purchase Module";
      case "/FinancialBudget":
        return "Finance";
      case "/Organization":
        return "Organization Setup";
        case "/UploadEmpDocsTab":
        return "Upload Employee Documents";
      case "/Leave":
        return "Leave Management";
      case "/HRCorner":
        return "HR Corner";
      case "/Users":
        return "Directory Service";
      case "/LogsPage":
        return "Logs";
      case "/AccessPrivilege":
        return "Access Privilege";
      case "/Profile":
        return "Profile";
      case "/UCS":
        return "Communication Service";
      case "/Project":
        return "Project";
      case "/Lead":
        return "Sales Management";
      case "/SalesProcess":
        return "Sales Process";
      case "/ProjectApproval":
        return "Approvals";
      case "/AllocationRequest":
        return "Allocation Request";
      case "/AllTab":
        return "Approvals";
      case "/ResubmittedApproval":
        return "Logs";
      case "/RepoAllTab":
        return "Asset Management";
      case "/CategoryTab":
        return "Asset Category";
      case "/Depreciation":
        return "Asset Valuation";
      case "/Workflow":
        return "Approval Workflow";
      case "/AssetHistory":
        return "Asset History";
      case "/AllTabs":
        return "Communication Service";
      case "/HRPolicies":
        return "HR Policy";
      case "/TabNavigation":
      case "/ApprovalWorkflow":
        return "CRM";
      case "/VendorManagement":
        return "Vendor Management";
      case "/PurchaseProcess":
        return "Purchase Process";
      case "/Processtab":
        return "Approval Process";
      case "/dms/setup":
        return "Document Management System";
      case "/AMSTab":
        return "Attendance Management System";
      case "/dms/upload":
        return "Document File Upload";
      case "/PMSTab":
        return "Performance Management";
      case "/CRMTabs":
        return "Customers";
      case "/PurchaseApproval":
        return "Purchase Approval";
      case "/CmsDashBoard":
        return "Dashboard";
      case "/products":
        return "Products";
      case "/setup":
        return "Set";
      case "/customers":
        return "Customers";
      case "/productaddon/ucs":
        return "Communication Service";
        case "/SetupWorkflow":
          return "Approval Workflow"
      default:
        return "Employee Data";
    }
  };

  const [hasAMSAccessEmployees, setHasAMSAccessEmployees] = useState(false);

  useEffect(() => {
    const checkAMSAccess = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");
        if (!userId || !token) return;

        const response = await axios.get(`${MAIN_API_BASE}/access/access/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const userAccess = response.data;
        const hasEmployeeAccess = userAccess.some(
          (access) => access.api_name === "EmployeeData"
        );
        setHasAMSAccessEmployees(hasEmployeeAccess);
      } catch (error) {
        console.error("Error checking access:", error);
        setHasAMSAccessEmployees(false);
      }
    };
    if (location.pathname.includes("/employeelayout")) {
      checkAMSAccess();
    }
  }, [location.pathname]);


  return (
    <div className="flex flex-col w-full">
      <div
        className="
          bg-custome-blue w-full
          px-2 sm:px-4 md:px-6
          py-1 sm:py-2 md:py-3
          mb-3 flex flex-col sm:flex-row
          justify-between items-center
          shadow-lg sticky top-0 rounded-lg
        "
      >
        {/* Left: Hamburger + Back/Home + Heading */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Hamburger (mobile only) */}
          <button
            onClick={onHamburgerClick}
            className="text-white lg:hidden"
          >
            <FaBars size={20} />
          </button>

          {/* Back/Home button */}
          {location.pathname.includes("/employeelayout") ? (
            <button
              onClick={hasAMSAccessEmployees ? handleNavigate : undefined}
              disabled={!hasAMSAccessEmployees}
              type="button"
              className={`flex items-center p-1 sm:p-2 rounded-full transition-all duration-200
      ${hasAMSAccessEmployees
                  ? "opacity-100 cursor-pointer pointer-events-auto relative"
                  : "opacity-0 cursor-not-allowed pointer-events-none absolute"
                }`}
            >
              <FaArrowLeft className="text-white" size={20} />
            </button>
          ) : (
            <button
              onClick={handleNavigate}
              type="button"
              className="flex items-center p-1 sm:p-2 rounded-full"
            >
              <FaHome className="text-white" size={20} />
            </button>
          )}

          {/* Heading */}
          <h1 className=" text-white font-bold truncate text-sm sm:text-base md:text-lg lg:text-2xl max-w-[140px] sm:max-w-none" >
            {getHeading()}
          </h1>
        </div>

        {/* Right: Profile */}
        {userData && (
          <div className="relative mt-2 sm:mt-0">
            <button ref={buttonRef} onClick={toggleDropdown} type="button" className=" bg-white flex items-center rounded-full px-2 py-1 sm:px-3 sm:py-2 " >
              <img
                src="http://cdn.builder.io/api/v1/image/assets/TEMP/8839e5a86c91c744ae902ecbb75ae11121a15ba11a67d20ec56f825e116dd9ef?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db"
                alt="Profile Icon"
                className="h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8 rounded-full mr-1 sm:mr-2"
              />
              <span className="hidden sm:block text-xs sm:text-sm md:text-base font-semibold text-custome-black"> {userData.first_name} {userData.last_name} </span>
            </button>

            {dropdownOpen &&
              createPortal(
                <>
                  <div className="fixed inset-0 bg-transparent z-[99998]" onClick={() => setDropdownOpen(false)} />
                  <div
                    ref={dropdownRef}
                    style={{
                      position: "fixed",
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      zIndex: 99999,
                    }}
                    className="rounded-lg shadow-lg p-2 bg-white"
                  >
                    <ProfileDropdown />
                  </div>
                </>,
                document.body
              )}
          </div>
        )}
      </div>
    </div>
  );
};
export default Header;