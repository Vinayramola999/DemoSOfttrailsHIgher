
import React, { useEffect, useState } from "react";
import SubSubTabs from "./SubSubTabs"; // The next component in the hierarchy

const SubTabs = ({ applicationModules, allModules }) => {
  console.log("Data in sub tab =>>>>>",allModules) // activeSubTab will now hold the selected moduleName (e.g., "Asset Lifecycle")
  const [activeSubTab, setActiveSubTab] = useState("");
  // subTabs will be the list of unique moduleNames for the current application
  const [subTabs, setSubTabs] = useState([]);
  const [moduleTableNames, setModuleTableNames] = useState([]);

  useEffect(() => {
    // Extract unique, non-empty moduleNames from the modules of the current application
    const uniqueModuleNames = [
      ...new Set(applicationModules.map((m) => m.moduleName).filter(Boolean)),
    ];
    setSubTabs(uniqueModuleNames);

    // Set the first moduleName as the default active one
    if (uniqueModuleNames.length > 0) {
      setActiveSubTab(uniqueModuleNames[0]);
      handleSubTabClick(uniqueModuleNames[0]);
    } else {
      setActiveSubTab(""); // Reset if no modules for this application
    }
  }, [applicationModules]); // This effect re-runs whenever the selected application changes

  // Filter the application's modules to get only the items for the currently selected moduleName
  const subSubTabItems = applicationModules.filter(
    (m) => m.moduleName === activeSubTab
  );

  const handleSubTabClick = (subTab) => {
    setActiveSubTab(subTab)
    console.warn('subTab clicked:', subTab);
    const filteredModule = allModules.filter(module => module.moduleName == subTab);
    console.warn('filter:',filteredModule)
    // let tableNames = {};
    let tableNames = [];
    // filteredModule.forEach((module) => {
    //   if (module.tableName) {
    //     module.tableName.split(',').forEach(name => {
    //       // tableNames[name.trim()] = name.trim();
    //       tableNames.push(name.trim());
    //     });
    //   }
    // });
    filteredModule.forEach((module) => {
        module.tableName.split(',').forEach(name => {
          // tableNames[name.trim()] = name.trim();
          tableNames.push(name.trim());
        });
    });
    console.warn('tableNames:',tableNames);
    // setModuleTableNames(Object.keys(tableNames));
    setModuleTableNames(tableNames);
  }

  console.log("module table names ->>>>>>>>>>>>>",moduleTableNames);

  return (
    <div className="bg-white">
      {/* Horizontally scrollable tab buttons for Module Name */}
      <div className="overflow-x-auto border-b">
        <div className="flex whitespace-nowrap w-max">
          {subTabs.map((subTab) => (
            <button
              key={subTab}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeSubTab === subTab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => handleSubTabClick(subTab)}
            >
              {subTab}
            </button>
          ))}
        </div>
      </div>

      {/* Render the next level of hierarchy (SubSubTabs). */}
      {/* This component will handle displaying the subModuleName list and ultimately the form. */}
      <div className="mt-4">
        <SubSubTabs
          // Pass only the items specific to the selected module (e.g., all "Asset Lifecycle" items)
          moduleSpecificItems={subSubTabItems}
          // Continue passing the full list of allModules for context
          allModules={allModules}
          moduleTableNames={moduleTableNames}
        />
      </div>
    </div>
  );
};

export default SubTabs;