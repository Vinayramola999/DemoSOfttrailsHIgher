// import HRMSidebar from "./NewComponents/HRMSidebar";
// import Header from "./NewComponents/Header";
// import { Outlet } from "react-router-dom";

// const MainLayout = () => {
//   return (
//     <div className="flex h-screen overflow-hidden bg-lightgray p-4">
//       <HRMSidebar />
//       <div className="flex-1 flex flex-col ml-4">
//         <Header />
//         <div className="flex-1 overflow-auto scrollbar-hide">
//           <Outlet />
//         </div>
//       </div>
//     </div>
//   );
// };
// export default MainLayout; 

///////////////////   RESPONSIVE  /////////////////

import React, { useState } from "react";
import HRMSidebar from "./NewComponents/HRMSidebar";
import Header from "./NewComponents/Header";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-lightgray p-4">
      <HRMSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col ml-4">
     
        <Header onHamburgerClick={() => setSidebarOpen(true)} />

        <div className="flex-1 overflow-auto scrollbar-hide  ">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
export default MainLayout;