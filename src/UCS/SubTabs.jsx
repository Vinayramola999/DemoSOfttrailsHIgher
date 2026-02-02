// import React, { useEffect, useState } from "react";
// import SubSubTabs from "./SubSubTabs"; // The next component in the hierarchy

// const SubTabs = ({ applicationModules, allModules }) => {
//   // activeSubTab will now hold the selected moduleName (e.g., "Asset Lifecycle")
//   const [activeSubTab, setActiveSubTab] = useState("");
//   const [tableName, setTableName] = useState("");
//   // subTabs will be the list of unique moduleNames for the current application
//   const [subTabs, setSubTabs] = useState([]);
//   const [moduleTableNames, setModuleTableNames] = useState([]);
//   useEffect(() => {
//     // Extract unique, non-empty moduleNames from the modules of the current application
//     const uniqueModuleNames = [
//       ...new Set(applicationModules.map((m) => m.moduleName).filter(Boolean)),
//     ];
//     setSubTabs(uniqueModuleNames);
//     console.log("Unique Module Names:", uniqueModuleNames);
//     // Set the first moduleName as the default active one
//     if (uniqueModuleNames.length > 0) {
//       setActiveSubTab(uniqueModuleNames[0]);
//       getTableName(uniqueModuleNames[0]); // Fetch table name for the first module
//     } else {
//       setActiveSubTab(""); // Reset if no modules for this application
//     }
//   }, [applicationModules]); // This effect re-runs whenever the selected application changes

//   // Filter the application's modules to get only the items for the currently selected moduleName
//   const subSubTabItems = applicationModules.filter(
//     (m) => m.moduleName === activeSubTab
//   );

//   const handleSubTabClick = (subTab) => {
//     console.log("SubTab clicked:", subTab);
//     getTableName(activeSubTab || subTab);
//     setActiveSubTab(subTab)
//     const filteredModule = allModules.filter(module => module.moduleName == subTab);
//     let tableNames = [];
//     filteredModule.forEach((module) => {
//       if (module.tableName) {
//         module.tableName.split(',').forEach(name => {
//           tableNames.push(name.trim());
//         });
//       }
//     });
//     setModuleTableNames(tableNames);
//   }

//   const getTableName = (moduleName) => {
//     try {
//       console.log("Fetching table name for module:", moduleName);
//       const filteredModule = allModules.filter(module => module.moduleName === moduleName);
//       console.log("Filtered Module:", filteredModule);
//       let tableName = [];
//       filteredModule.length && filteredModule.forEach((module)=>{
//         if (module.tableName) {
//           tableName.push(module.tableName);
//         }
//       })
//       setTableName(tableName);
//       console.log("Table Name:", tableName);
//     } catch (error) {
//       console.error("Error filtering module:", error);
//     }
//   }

//   return (
//     <div className="bg-white">
//       {/* Horizontally scrollable tab buttons for Module Name */}
//       <div className="overflow-x-auto border-b">
//         <div className="flex whitespace-nowrap w-max">
//           {subTabs.map((subTab) => (
//             <button
//               key={subTab}
//               className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${activeSubTab === subTab
//                   ? "border-b-2 border-blue-600 text-blue-600"
//                   : "text-gray-500 hover:text-gray-700"
//                 }`}
//               onClick={() => handleSubTabClick(subTab)}
//             >
//               {subTab}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Render the next level of hierarchy (SubSubTabs). */}
//       {/* This component will handle displaying the subModuleName list and ultimately the form. */}
//       <div className="mt-4">
//         <SubSubTabs
//           // Pass only the items specific to the selected module (e.g., all "Asset Lifecycle" items)
//           moduleSpecificItems={subSubTabItems}
//           // Continue passing the full list of allModules for context
//           allModules={allModules}
//           moduleTableNames={moduleTableNames}
//           tableName={tableName}
//         />
//       </div>
//     </div>
//   );
// };

// export default SubTabs;

import React, { useEffect, useState } from "react";
import SubSubTabs from "./SubSubTabs"; // The next component in the hierarchy

const SubTabs = ({ applicationModules, allModules }) => {
  const [activeSubTab, setActiveSubTab] = useState("");
  const [subTabs, setSubTabs] = useState([]);
  // CHANGE: This state now holds an array of all unique table names for the active module.
  const [moduleTableNames, setModuleTableNames] = useState([]);

  // This effect correctly sets up the module tabs and pre-loads data for the first tab.
  useEffect(() => {
    const uniqueModuleNames = [
      ...new Set(applicationModules.map((m) => m.moduleName).filter(Boolean)),
    ];
    setSubTabs(uniqueModuleNames);

    if (uniqueModuleNames.length > 0) {
      // Set the first module as active and trigger the logic to find its table names.
      handleSubTabClick(uniqueModuleNames[0]);
    } else {
      // Reset if there are no modules.
      setActiveSubTab("");
      setModuleTableNames([]);
    }
  }, [applicationModules]); // Re-run when the application changes.

  // Filter the application's modules for the currently selected moduleName.
  const subSubTabItems = applicationModules.filter(
    (m) => m.moduleName === activeSubTab
  );

  // --- KEY CHANGE IS HERE ---
  // This function now correctly finds ALL table names for a given moduleName.
  const handleSubTabClick = (moduleNameToActivate) => {
    setActiveSubTab(moduleNameToActivate);

    // 1. Filter ALL modules to find every object with the matching moduleName.
    const relevantModules = allModules.filter(
      (module) => module.moduleName === moduleNameToActivate
    );

    // 2. Collect all table names from these modules.
    const tables = new Set(); // Use a Set to automatically handle duplicates.
    relevantModules.forEach((module) => {
      if (module.tableName && module.tableName.trim() !== "") {
        // 3. Split by comma to handle multiple tables in one string, then add to the Set.
        module.tableName.split(',').forEach(name => {
          tables.add(name.trim());
        });
      }
    });

    // 4. Convert the Set back to an array and update the state.
    const uniqueTableNames = Array.from(tables);
    console.log(`Table names for module "${moduleNameToActivate}":`, uniqueTableNames);
    setModuleTableNames(uniqueTableNames);
  };

  return (
    <div className="bg-white">
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

      <div className="mt-4">
        <SubSubTabs
          moduleSpecificItems={subSubTabItems}
          allModules={allModules}
          // Pass the correctly collected array of table names.
          moduleTableNames={moduleTableNames}
        />
      </div>
    </div>
  );
};

export default SubTabs;


