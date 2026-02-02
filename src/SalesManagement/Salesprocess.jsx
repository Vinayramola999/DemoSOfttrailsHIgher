import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NewQuotation from "./NewQuotation";
import SalesQuotation from "./SalesQuotation";
import Requirementdocument from "./Requirementdocuments";
import Purchasequotation from "./Purchasequotation";
import IndentApproval from "./IndentApproval";
import QuotationApproval from "./QuotationApproval";

const Tabs = [
  { id: "Requirement Document", label: "Requirement Document" },
  { id: "Indent_Approval", label: "Indent Approval" },
  { id: "Purchase_Quotation", label: "Purchase Quotation" },
  { id: "new_quotation", label: "New Quotation" },
  { id: "Sales_Quotation", label: "Sales Quotation" },
  { id: "Quotation_Approval", label: "Quotation Approval" },
];
const baseUrlu = process.env.REACT_APP_URL_users || '';

const Salesprocess = () => {
  const [activeTab, setActiveTab] = React.useState("Requirement Document");
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [userData, setUserData] = React.useState(null);
  const renderContent = () => {
    switch (activeTab) {
      case "Requirement Document":
        return <Requirementdocument />;
      case "Indent_Approval":
        return <IndentApproval />;
      case "new_quotation":
        return <NewQuotation />;
      case "Purchase_Quotation":
        return <Purchasequotation />;
      case "Sales_Quotation":
        return <SalesQuotation />;
      case "Quotation_Approval":
        return <QuotationApproval />;
      default:
        return <Requirementdocument />;
    }
  };

  const handleHome = () => {
    navigate("/Cards");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  React.useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (userId && token) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `${baseUrlu}/users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data) {
            setUserData(response.data);
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    } else {
      console.error("User ID or token is missing");
    }
  }, []);

  return (
    <div className="flex h-[89vh] overflow-auto">
      <div className="flex flex-col w-full">
        {/* Tabs */}
        <div className="flex items-center gap-3 mb-4 mt-4">
          {Tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-blue-900 text-white rounded-full shadow-md"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Salesprocess;
