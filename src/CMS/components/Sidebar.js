import React from "react";

export default function Sidebar() {
  return (
    <div>
      <aside className="w-64 bg-white  m-4 border-[1px] border-[#DDDDDD] rounded-lg">
        <div className="px-6 mt-6 font-bold text-blue-600 text-2xl">
          <img src="./Hi.png" alt="Hi" />
        </div>
        <hr className="my-4 border-t border-gray-300 mx-3" />

        <nav className="mt-2">
          <ul className="space-y-4">
            {/* Dashboard */}
            <div className="flex">
              {activeView === "dashboard" && (
                <div className="transition-all duration-300 w-[8px] rounded-r-lg bg-blue-500"></div>
              )}
              <li
                className={`p-4 cursor-pointer text-start text-sm flex gap-3 items-center
            ${
              activeView === "dashboard"
                ? " font-bold text-black"
                : "text-[#686868]"
            }`}
                onClick={() => setActiveView("dashboard")}
              >
                <MdDashboard />
                <p className="">Dashboard</p>
              </li>
            </div>

            {/* Setup License */}
            <div className="flex">
              {activeView === "setup" && (
                <div className="transition-all duration-300 w-[8px] rounded-r-lg bg-blue-500"></div>
              )}
              <li
                className={`p-4 cursor-pointer text-sm text-start flex gap-3 items-center
          ${
            activeView === "setup" ? " font-bold text-black" : "text-[#686868]"
          }`}
                onClick={() => setActiveView("setup")}
              >
                <PiMedalBold />
                <p>Setup Licensesss</p>
              </li>
            </div>

            {/* Customers */}
            <div className="flex">
              {activeView === "customers" && (
                <div className="transition-all duration-300 w-[8px] rounded-r-lg bg-blue-500"></div>
              )}
              <li
                className={`p-4 cursor-pointer text-sm text-start flex gap-3 items-center
          ${
            activeView === "customers"
              ? " font-bold text-black"
              : "text-[#686868]"
          }`}
                onClick={() => setActiveView("customers")}
              >
                <MdOutlinePeopleOutline />
                <p>Customers</p>
              </li>
            </div>

            {/* product */}
            <div className="flex">
              {activeView === "Products" && (
                <div className="transition-all duration-300 w-[8px] rounded-r-lg bg-blue-500"></div>
              )}
              <li
                className={`p-4 cursor-pointer text-sm text-start flex gap-3 items-center
          ${
            activeView === "Products"
              ? " font-bold text-black"
              : "text-[#686868]"
          }`}
                onClick={() => setActiveView("Products")}
              >
                <MdOutlinePeopleOutline />
                <p> Products</p>
              </li>
            </div>
          
          </ul>
        </nav>

        <div className=" bg-red-500">
          <p className="text-[12px] font-medium my-4 ">Powered by</p>
          <div className="flex justify-center ">
            <img src="./Softtrail.png" alt="SoftTrail" />
          </div>
        </div>
      </aside>
    </div>
  );
}
