import React, { useEffect, useState } from "react";
import TemplateMappingForm from "./TemplateMappingForm";

const SubSubTabs = ({ moduleSpecificItems, allModules, moduleTableNames }) => {
  const [activeSubSubTab, setActiveSubSubTab] = useState("");

  useEffect(() => {
    const validSubModules = moduleSpecificItems.filter(
      (item) => item.subModuleName && item.subModuleName.trim() !== ""
    );

    if (validSubModules.length > 0) {
      setActiveSubSubTab(validSubModules[0].subModuleName);
    } else {
      const firstItem = moduleSpecificItems[0];
      setActiveSubSubTab(firstItem ? firstItem.uniqueIdentifierName : "");
    }
  }, [moduleSpecificItems]);

  const subModuleTabs = moduleSpecificItems.filter(
    (item) => item.subModuleName && item.subModuleName.trim() !== ""
  );

  const shouldRenderForm =
    activeSubSubTab || (subModuleTabs.length === 0 && moduleSpecificItems.length > 0);

  const activeIdentifier =
    subModuleTabs.length > 0
      ? activeSubSubTab
      : moduleSpecificItems[0]?.subModuleName || "";

  // ✅ Dynamically find applicationName from allModules
  const matchingModule = allModules.find(
    (m) => m.subModuleName === activeIdentifier
  );
  const applicationName = matchingModule?.applicationName || "";

  return (
    <div>
      {subModuleTabs.length > 0 && (
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
      )}

      <div className="mt-6">
        {shouldRenderForm && (
          <TemplateMappingForm
            activeTab={activeIdentifier}
            allModules={allModules}
            moduleTableNames={moduleTableNames}
            applicationName={applicationName} // ✅ send here
          />
        )}
      </div>
    </div>
  );
};

export default SubSubTabs;


// import React, { useEffect, useState } from "react";
// import TemplateMappingForm from "./TemplateMappingForm"; // The final component to be rendered

// const SubSubTabs = ({ moduleSpecificItems, allModules,moduleTableNames,tableName}) => {
//   // activeSubSubTab will hold the string of the selected subModuleName (e.g., "Damage Request")
//   const [activeSubSubTab, setActiveSubSubTab] = useState("");

//   console.log("Module Specific Items in subsubtabs:", moduleSpecificItems);

//   // This effect runs when the selected module changes (e.g., from "Asset" to "Asset Lifecycle")
//   useEffect(() => {
//     // Find all valid sub-modules for the current module
//     const validSubModules = moduleSpecificItems.filter(
//       (item) => item.subModuleName && item.subModuleName.trim() !== ""
//     );

//     // Set the first valid sub-module as the default active one
//     if (validSubModules.length > 0) {
//       setActiveSubSubTab(validSubModules[0].subModuleName);
//     } else {
//       // If there are no sub-modules, reset the state
//       setActiveSubSubTab("");
//     }
//   }, [moduleSpecificItems]); // Dependency ensures this runs when the items change

//   // Filter the items to only those with a non-empty subModuleName to create the tabs
//   const subModuleTabs = moduleSpecificItems.filter(
//     (item) => item.subModuleName && item.subModuleName.trim() !== ""
//   );

//   // If there are no actionable sub-modules, don't render anything.
//   // if (subModuleTabs.length === 0) {
//   //   return (
//   //     <div className="mt-6">
//   //       {/* No specific actions available for this module. */}
//   //       < TemplateMappingForm/>
//   //     </div>
//   //   );
//   // }

//   console.log("table name below ",activeSubSubTab)

//   return (
//     <div>
//       {/* Horizontally scrollable tabs for Sub-Module Names */}
//       <div className="overflow-x-auto border-b">
//         <div className="flex whitespace-nowrap w-max">
//           {subModuleTabs.map((subTabItem, index) => (
//             <button
//               key={index}
//               className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
//                 activeSubSubTab === subTabItem.subModuleName
//                   ? "border-b-2 border-blue-600 text-blue-600"
//                   : "text-gray-500 hover:text-gray-700"
//               }`}
//               onClick={() => setActiveSubSubTab(subTabItem.subModuleName)}
//             >
//               {subTabItem.subModuleName}
//             </button>
//           ))}
//         </div>
//       </div>
          
//       {/* Conditionally render the TemplateMappingForm below the tabs. */}
//       <div className="mt-6">
//         {/* Only render the form if a sub-module tab is selected */}
//         {activeSubSubTab && (
//           <TemplateMappingForm
//             // Pass the selected subModuleName as the 'activeTab' prop to the form.
//             // This is the key piece of information the form needs to fetch its dynamic columns.
//             activeTab={activeSubSubTab}
//             // The form also needs the full list of modules to find the `tableName` and `uniqueIdentifierName`.
//             allModules={allModules}
//             moduleTableNames={moduleTableNames}
//             tableName={tableName}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default SubSubTabs;