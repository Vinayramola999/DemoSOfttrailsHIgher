import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const ChargeTabs = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    { label: 'Charge Type', path: '/HospitalManagement/charge-list' },
    { label: 'Manage List', path: '/HospitalManagement/manage-list' },
  ];

  return (
    <div className="flex gap-2 mt-3 mb-3 items-center">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.label}
            onClick={() => navigate(tab.path)}
            className={`rounded-full px-6 py-2 min-w-[140px] min-h-[36px] font-semibold text-base cursor-pointer transition-all duration-200 focus:outline-none shadow-sm
              ${isActive ? 'bg-blue-800 text-white' : 'bg-white text-gray-900 border border-gray-300'}
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default ChargeTabs; 