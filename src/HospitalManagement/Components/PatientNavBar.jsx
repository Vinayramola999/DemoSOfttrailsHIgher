import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const PatientNavBar = ({
  search,
  setSearch,
  handleDownloadAllExcel,
  handleDownloadAllPDF,
}) => {
  const location = useLocation();

  // Determine current page from the route
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/patient-registration')) return 'registration';
    if (path.includes('/patient-details')) return 'details';
    return '';
  };

  const currentPage = getCurrentPage();


  const isDetails = currentPage === "details";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 mt-3 w-full ">
      <div className="flex flex-wrap gap-2 items-center">
        {!location.pathname.includes("/patient-history") && (
          <>
            <Link
              to="/HospitalManagement/patient-registration"
              className={`w-[180px] h-[32px] rounded-[80px] opacity-100 font-medium text-sm transition-all flex items-center justify-center focus:outline-none
            ${
              currentPage === "registration"
                ? "bg-gradient-to-r from-blue-800 to-blue-800 text-white"
                : "bg-white text-blue-700 border-2 border-blue-600 hover:bg-blue-50"
            }`}
              style={{
                letterSpacing: "0.5px",
                boxShadow:
                  currentPage === "registration"
                    ? "0 4px 16px 0 rgba(37,99,235,0.10)"
                    : undefined,
              }}
            >
              Patient Registration
            </Link>

            <Link
              to="/HospitalManagement/patient-details"
              className={`w-[180px] h-[32px] rounded-[80px] opacity-100 font-medium text-sm transition-all flex items-center justify-center
            ${
              currentPage === "details"
                ? "bg-gradient-to-r from-blue-800 to-blue-800 text-white"
                : "bg-white text-blue-700 border-2 border-blue-600 hover:bg-blue-50"
            }`}
              style={{
                letterSpacing: "0.5px",
                boxShadow:
                  currentPage === "details"
                    ? "0 4px 16px 0 rgba(37,99,235,0.10)"
                    : undefined,
              }}
            >
              Registered Patient
            </Link>
          </>
        )}
      </div>

      {/* Search box on the right side for details page */}
      {isDetails && (
        <div className="flex w-full sm:w-auto justify-end mr-2 items-start">
          <input
            type="text"
            placeholder="Search Patient details..."
            className="h-8 w-full sm:w-80 max-w-full px-3 py-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {/* Excel/PDF icons aligned with top of search box */}
          <div className="flex flex-row items-start gap-3 ml-2">
            <FaFileExcel
              className="text-green-600 hover:text-green-800 cursor-pointer transition-colors"
              size={26}
              title="Download Excel"
              onClick={handleDownloadAllExcel}
            />
            <FaFilePdf
              className="text-red-600 hover:text-red-800 cursor-pointer transition-colors"
              size={26}
              title="Download PDF"
              onClick={handleDownloadAllPDF}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientNavBar;