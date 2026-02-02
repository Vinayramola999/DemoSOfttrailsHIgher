import React, { useEffect, useState } from "react";
import axios from "axios";
import SubTabs from "./SubTabs"; // The next component in the hierarchy

const LeaveManagement1 = () => {
  // State to hold modules grouped by their application name
  const [modulesByApp, setModulesByApp] = useState({});
  // State to hold the original, flat list of all modules
  const [allModules, setAllModules] = useState([]);
  // State to track the currently active application tab
  const [activeTab, setActiveTab] = useState("");
  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Function to fetch all module data from the API
  const getAllModules = async () => {
    try {
      const url = "https://ucsdemo.softtrails.net/api/modules";
      const token = sessionStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const res = await axios.get(url, config);
      const fetchedAllModules = res.data;

      if (!Array.isArray(fetchedAllModules)) {
        console.error("API did not return an array:", fetchedAllModules);
        setIsLoading(false);
        return;
      }

      // Store the original flat array. This is crucial for passing the full context to child components.
      setAllModules(fetchedAllModules);
      console.warn('API RESPONSE:', fetchedAllModules);
      // Group all module objects by their applicationName
      const groupedByApplication = {};
      fetchedAllModules.forEach((module) => {
        if (module.applicationName && module.applicationName.trim() !== "") {
          if (!groupedByApplication[module.applicationName]) {
            groupedByApplication[module.applicationName] = [];
          }
          // Push the entire module object into the array for that application
          groupedByApplication[module.applicationName].push(module);
        }
      });

      setModulesByApp(groupedByApplication);

      // Set the first application as the default active tab
      const firstApp = Object.keys(groupedByApplication)[0];
      if (firstApp) {
        setActiveTab(firstApp);
      }

    } catch (error) {
      console.error("Error fetching or processing modules data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch modules when the component mounts
  useEffect(() => {
    getAllModules();
  }, []);

  if (isLoading) {
    return <div className="p-6 text-center">Loading Modules...</div>;
  }

  return (
    <div className="w-full flex flex-col items-start px-2 sm:px-4 md:px-6">
      <div className="relative flex flex-wrap justify-center gap-2 rounded-full bg-gray-200 p-2 w-full sm:w-auto max-w-full  scrollbar-hide">
        {Object.keys(modulesByApp).map((appName) => (
          <button
            key={appName}
            className={`px-3 sm:px-4 py-2 rounded-full text-center text-sm sm:text-base font-medium whitespace-nowrap transition-all duration-300 flex-shrink-0 ${activeTab === appName
              ? "text-white bg-gradient-to-r from-blue-500 to-blue-800 shadow-md scale-105" // Active tab styling
              : "text-gray-700 hover:text-black hover:bg-gray-100" // Inactive hover effect
              }`}
            onClick={() => setActiveTab(appName)} // ✅ Switch active tab on click
          >
            {appName}
          </button>
        ))}
      </div>

      {/* ---------- Content Area for Active Tab ---------- */}
      {/* ✅ Scrollable container with fixed height to fit all screens */}
      <div className="mt-4 w-full max-w-[75rem] p-4 border border-gray-300 rounded-lg shadow-sm bg-white
                      max-h-[60vh] sm:max-h-[65vh] md:max-h-[72vh] lg:max-h-[78vh] overflow-auto">
        {/* ✅ Conditionally render SubTabs for the currently active application */}
        {activeTab && modulesByApp[activeTab] && (
          <SubTabs
            applicationModules={modulesByApp[activeTab]} // Modules for selected app
            allModules={allModules} // Pass all modules for lookup
          />
        )}
      </div>
    </div>

  );
};

export default LeaveManagement1;