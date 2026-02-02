import React, { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { PiMedalBold } from "react-icons/pi";
import { TiHome } from "react-icons/ti";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { MdDashboard, MdOutlinePeopleOutline } from "react-icons/md";
import { RiFunctionAddLine } from "react-icons/ri";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";

export default function Header() {
  const location = useLocation();
  const [openSubMenu, setOpenSubMenu] = useState(false);

  const menuItems = [
    { path: "/", label: "Dashboard", icon: <MdDashboard /> },
    {
      path: "/products",
      label: "Products",
      icon: <MdOutlineProductionQuantityLimits />,
    },
    { path: "/setup", label: "Setup License", icon: <PiMedalBold /> },
    {
      path: "/customers",
      label: "Customers",
      icon: <MdOutlinePeopleOutline />,
    },
    {
      label: "Product Add On",
      icon: <RiFunctionAddLine />,
      subItems: [
        { path: "/productaddon/ucs", label: "UCS" },
        { path: "/productaddon/dms", label: " DMS" },
      ],
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white m-4 border rounded-lg">
        <div className="px-6 mt-6 font-bold text-blue-600 text-2xl">
          <img src="./Hi.png" alt="Hi" />
        </div>
        <hr className="my-4" />

        <nav className="mt-2">
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li key={item.label} className="flex flex-col">
                {item.subItems ? (
                  <>
                    {/* Parent with submenu */}
                    <button
                      onClick={() => setOpenSubMenu((prev) => !prev)}
                      className={`px-4 py-2 flex gap-3 items-center text-sm w-full text-left ${
                        openSubMenu ||
                        location.pathname.startsWith("/productaddon")
                          ? "font-bold text-black"
                          : "text-[#686868]"
                      }`}
                    >
                      {item.icon}
                      <p className="flex-1">{item.label}</p>
                      {openSubMenu ? <IoIosArrowDown /> : <IoIosArrowForward />}
                    </button>

                    {/* Submenu items */}
                    {openSubMenu && (
                      <ul className="ml-8 mt-2 space-y-2">
                        {item.subItems.map((sub) => (
                          <li key={sub.path}>
                            <Link
                              to={sub.path}
                              className={`block px-2 py-1 text-sm rounded-md ${
                                location.pathname === sub.path
                                  ? "text-blue-600 font-semibold"
                                  : "text-gray-600 hover:text-black"
                              }`}
                            >
                              {sub.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  // Regular menu item
                  <Link
                    to={item.path}
                    className={`px-4 py-2 flex gap-3 items-center text-sm ${
                      location.pathname === item.path
                        ? "font-bold text-black"
                        : "text-[#686868]"
                    }`}
                  >
                    {item.icon}
                    <p>{item.label}</p>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="fixed bottom-8 left-20 flex flex-col justify-center">
          <p className="text-[12px] font-medium my-4 text-center">Powered by</p>
          <div className="flex justify-center">
            <img src="./Softtrail.png" alt="SoftTrail" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-[#005AE6] p-4 text-white my-4 mr-4 rounded-lg flex justify-between">
          <div className="flex items-center gap-2">
            <TiHome size={20} />
            <p className="text-[20px] font-semibold">Control Panel</p>
          </div>
          <div className="flex items-center space-x-2 bg-white py-2 px-3 rounded-full">
            <div className="font-semibold text-black">Arpit Pundir</div>
            <div className="w-8 h-8 bg-black rounded-full"></div>
          </div>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
