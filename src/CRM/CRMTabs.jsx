import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

// Components
import TabButton from "./Customer/component/TabButton";
import TabErrorBoundary from "./Customer/component/TabErrorBoundary";
import LoadingSpinner from "./Customer/component/LoadingSpinner";

// CRM Tabs (Customer pages)
import Customer from "./Customer/pages/Customer";
import SubmitApprovalTab from "./Customer/pages/SubmitApprovalTab";
import ApprovalTab from "./Customer/pages/ApprovalTab";
import FlagTab from "./Customer/pages/FlagTab";
import AllContacts from "./Customer/pages/AllContacts";
import SetupCRM from "./Customer/pages/SetupCRM";

const TABS = [
  { id: "customer", label: "Customer" },
  { id: "request", label: "New Approval Request" },
  { id: "approval", label: "Approval" },
  { id: "flag", label: "Flag" },
  { id: "allContacts", label: "All Contact" },
];

const STORAGE_KEY = "crm-active-tab";

export default function CRMTabs() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && (saved === "setupCRM" || TABS.some((tab) => tab.id === saved))
        ? saved
        : TABS[0].id;
    }
    return TABS[0].id;
  });

  const [isLoading, setIsLoading] = useState(false);
  const tabRefs = useRef({});
  const scrollContainerRef = useRef(null);

  const handleTabChange = useCallback(
    async (tabId) => {
      if (tabId === activeTab) return;
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 100));
      setActiveTab(tabId);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, tabId);
      }
      setIsLoading(false);
    },
    [activeTab]
  );

  const scrollTabs = useCallback((direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollTo({
        left:
          direction === "left"
            ? container.scrollLeft - scrollAmount
            : container.scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  }, []);

  const handleBackClick = useCallback(() => {
    handleTabChange(TABS[0].id); // back to "Customer"
  }, [handleTabChange]);

  const renderContent = useMemo(() => {
    if (isLoading) return <LoadingSpinner />;

    const getContent = () => {
      switch (activeTab) {
        case "customer":
          return <Customer />;
        case "request":
          return <SubmitApprovalTab />;
        case "approval":
          return <ApprovalTab />;
        case "flag":
          return <FlagTab />;
        case "allContacts":
          return <AllContacts />;
        case "setupCRM":
          return <SetupCRM />;
        default:
          return null;
      }
    };

    return (
      <TabErrorBoundary key={activeTab}>
        <div
          id={`tabpanel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`tab-${activeTab}`}
          className="h-full"
        >
          {getContent()}
        </div>
      </TabErrorBoundary>
    );
  }, [activeTab, isLoading]);

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-full relative">
        {/* Tabs Header */}
        <div className="sticky top-0 z-50 mb-4 flex items-center justify-between w-full">
          {/* Tabs section - fades out when setupCRM is active */}
          <div
            className={`flex items-center justify-between w-full transition-opacity duration-500 ease-in-out ${
              activeTab === "setupCRM"
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            {/* Left scroll + tabs */}
            <div className="flex items-center">
              {/* Always active left button */}
              <button
                onClick={() => scrollTabs("left")}
                className="md:hidden flex-shrink-0 p-2 mr-2 rounded-full border text-gray-700 border-gray-300 hover:bg-gray-100"
                aria-label="Scroll tabs left"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Tabs */}
              <div className="flex-1 overflow-hidden">
                <div
                  ref={scrollContainerRef}
                  className="overflow-x-auto hide-scrollbar"
                >
                  <div
                    className="flex space-x-1.5"
                    role="tablist"
                    aria-label="CRM Navigation Tabs"
                    style={{ height: "49.5px" }}
                  >
                    {TABS.map((tab) => (
                      <TabButton
                        key={tab.id}
                        tab={tab}
                        isActive={activeTab === tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        tabRef={(el) => (tabRefs.current[tab.id] = el)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Always active right button */}
              <button
                onClick={() => scrollTabs("right")}
                className="md:hidden flex-shrink-0 p-2 ml-2 rounded-full border text-gray-700 border-gray-300 hover:bg-gray-100"
                aria-label="Scroll tabs right"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Setup CRM button */}
            <div className="ml-6">
              <button
                onClick={() => handleTabChange("setupCRM")}
                className="px-5 py-2 rounded-md font-medium bg-blue-600 text-white transition-all duration-300 hover:bg-blue-700"
              >
                Setup CRM
              </button>
            </div>
          </div>

          {/* Setup CRM Header (with ← arrow) */}
          <div
            className={`absolute top-0 left-0 flex items-center justify-start w-full transition-opacity duration-500 ease-in-out ${
              activeTab === "setupCRM"
                ? "opacity-100"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <button
              onClick={handleBackClick}
              className="flex items-center gap-2 text-gray-900 hover:text-gray-700 transition-all font-semibold"
            >
              <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
              <span className="text-lg font-semibold">Setup CRM</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div
          className={`flex-grow transition-opacity duration-500 ease-in-out ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          {renderContent}
        </div>
      </div>
    </div>
  );
}
