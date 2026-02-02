import React, { useState } from "react";
import SalesChannel from "../component/SalesChannel";
import SetupWorkflow from "../modals/SetupWorkflowModal";

const SetupCRM = () => {
  const [activeTab, setActiveTab] = useState("sales");

  return (
    <div className="relative w-full -mt-8">
      {/* Visual container - does NOT affect layout */}
      <div className="absolute inset-0 rounded-2xl border border-gray-300 pointer-events-none"></div>

      {/* Original content stays exactly as it was, add top padding + left padding */}
      <div className="relative w-full p-1 pt-6 pl-6">
        {/* Tabs */}
        <div className="flex mb-4 space-x-2">
          <button
            className={`w-[13%] px-4 py-2 rounded-2xl mb-2 ${
              activeTab === "sales"
                ? "bg-[#005BE7] text-white"
                : "bg-white text-black"
            }`}
            onClick={() => setActiveTab("sales")}
          >
            Sales Channel
          </button>

          <button
            className={`w-[13%] px-4 py-2 rounded-2xl mb-2 ${
              activeTab === "workflow"
                ? "bg-[#005BE7] text-white"
                : "bg-white text-black"
            }`}
            onClick={() => setActiveTab("workflow")}
          >
            Workflow Setup
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "sales" && <SalesChannel />}
        {activeTab === "workflow" && <SetupWorkflow />}
      </div>
    </div>
  );
};

export default SetupCRM;
