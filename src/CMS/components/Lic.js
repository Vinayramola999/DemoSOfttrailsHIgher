import React, { useState } from "react";
import Sett from "./Sett";
import CreatePlans from "./CreatePlans";
import SetupLicenseParameter from "./SetupLicenseParameter";
import DevelpersLicences from "./DevelpersLicences";

export default function Lic() {
  const tabs = [
    "Create Plan",
    "Setup Plan",
    "License Parameter",
    "Develpers License",
  ];
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="h-screen flex flex-col fixed w-full bg-[#faf9f6]">
      {/* Tabs */}
      <div className="z-10 border-b border-gray-300">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <div
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer px-12 py-2 text-12   transition-colors ${
                activeTab === tab
                  ? "bg-white text-black border-[1px] border-b-white border-[#BEBEBE] rounded-t-lg"
                  : "bg-[#D9D9D9] text-black border-[1px]  border-[#BEBEBE] mb-1 rounded-lg"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "Create Plan" && <CreatePlans />}
        {activeTab === "Setup Plan" && <Sett />}
        {activeTab === "License Parameter" && <SetupLicenseParameter />}
        {activeTab === "Develpers License" && <DevelpersLicences />}
      </div>
    </div>
  );
}
