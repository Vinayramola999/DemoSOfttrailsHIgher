import React from 'react';
import { X } from 'lucide-react';

const KAMDetailsPopup = ({ isOpen, kamData, onClose }) => {
  if (!isOpen) return null;
  
  // Early return if no KAM data
  if (!kamData) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-xl w-[500px] p-8">
          <p className="text-center text-gray-500">No KAM details available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-[500px] p-8">
        <div className="flex flex-col">
          {/* Header with Active Badge and Close Button */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">KAM Details</h2>
              <span className={`ml-4 px-3 py-1 text-sm rounded-full ${kamData.user_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {kamData.user_status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* KAM Details Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-500 text-sm">Full Name</h3>
              <p className="text-gray-900">{`${kamData.first_name} ${kamData.last_name}`}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm">Email</h3>
              <p className="text-gray-900">{kamData.email}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm">Phone No.</h3>
              <p className="text-gray-900">{kamData.phone_no}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm">Employee ID</h3>
              <p className="text-gray-900">{kamData.emp_id}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm">Department</h3>
              <p className="text-gray-900">{kamData.dept_name}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm">Sub Department</h3>
              <p className="text-gray-900">{kamData.sub_dept_name}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm">Designation</h3>
              <p className="text-gray-900">{kamData.designation}</p>
            </div>

            <div>
              <h3 className="text-gray-500 text-sm">Location</h3>
              <p className="text-gray-900">{kamData.locality}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KAMDetailsPopup;
