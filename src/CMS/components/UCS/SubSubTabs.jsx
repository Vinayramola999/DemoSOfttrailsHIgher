import React, { useEffect, useState } from "react";
import TemplateMappingForm from "./TemplateMappingForm"; // The final component to be rendered

const SubSubTabs = ({ moduleSpecificItems, allModules,moduleTableNames}) => {
  console.log("Data in sub tab =>>>>>",allModules)
  // activeSubSubTab will hold the string of the selected subModuleName (e.g., "Damage Request")
  const [activeSubSubTab, setActiveSubSubTab] = useState("");

  // This effect runs when the selected module changes (e.g., from "Asset" to "Asset Lifecycle")
  useEffect(() => {
    // Find all valid sub-modules for the current module
    const validSubModules = moduleSpecificItems.filter(
      (item) => item.subModuleName && item.subModuleName.trim() !== ""
    );

    // Set the first valid sub-module as the default active one
    if (validSubModules.length > 0) {
      setActiveSubSubTab(validSubModules[0].subModuleName);
    } else {
      // If there are no sub-modules, reset the state
      setActiveSubSubTab("");
    }
  }, [moduleSpecificItems]); // Dependency ensures this runs when the items change

  // Filter the items to only those with a non-empty subModuleName to create the tabs
  const subModuleTabs = moduleSpecificItems.filter(
    (item) => item.subModuleName && item.subModuleName.trim() !== ""
  );

  // If there are no actionable sub-modules, don't render anything.
  if (subModuleTabs.length === 0) {
    return (
      <div className="mt-6">
        {/* No specific actions available for this module. */}
        {/* < TemplateMappingForm moduleTableNames={moduleTableNames}/> */}
        <TemplateMappingForm
 activeTab={activeSubSubTab}
 allModules={allModules}
 moduleTableNames={moduleTableNames}
/>
      </div>
    );
  }

  return (
    <div>
      {/* Horizontally scrollable tabs for Sub-Module Names */}
      <div className="overflow-x-auto border-b">
        <div className="flex whitespace-nowrap w-max">
          {subModuleTabs.map((subTabItem, index) => (
            <button
              key={index}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                activeSubSubTab === subTabItem.subModuleName
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveSubSubTab(subTabItem.subModuleName)}
            >
              {subTabItem.subModuleName}
            </button>
          ))}
        </div>
      </div>

      {/* Conditionally render the TemplateMappingForm below the tabs. */}
      <div className="mt-6">
        {/* Only render the form if a sub-module tab is selected */}
        {activeSubSubTab && (
          <TemplateMappingForm            
            activeTab={activeSubSubTab}
            allModules={allModules}
            moduleTableNames={moduleTableNames}
          />
        )}
      </div>
    </div>
  );
};

export default SubSubTabs;