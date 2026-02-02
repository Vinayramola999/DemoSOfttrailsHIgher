import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AllLeads from "./AllLeads";
import Verifiedleads from "./VerifiedLeads";
import SetupLeadCategory from "./SetupLeadCategory";

const Tabs = [
  { id: "AllLeads", label: "All Leads" },
  { id: "verified_leads", label: "Verified Leads" },
  { id: "Setup_Lead_Category", label: "Setup Lead Category" },
];

const baseUrlu = process.env.REACT_APP_URL_users || '';
const Lead = () => {
  const [activeTab, setActiveTab] = React.useState("AllLeads"); // ✅ Match first tab
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const [userData, setUserData] = React.useState(null);

  const renderContent = () => {
    switch (activeTab) {
      case "AllLeads":
        return <AllLeads />;
      case "verified_leads":
        return <Verifiedleads />;
      case "Setup_Lead_Category":
        return <SetupLeadCategory />;

      default:
        return <AllLeads />;
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
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
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
        <div className="flex-grow rounded">{renderContent()}</div>  
      </div>
    </div>
  );
};

export default Lead;
