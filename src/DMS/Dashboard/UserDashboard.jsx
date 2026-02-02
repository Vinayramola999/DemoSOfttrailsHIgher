import React, { useState, useEffect } from "react";
import { fetchDocumentTree } from "../service/Dashboard"; // Import service
import {
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCloudUploadAlt,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedServices, setExpandedServices] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");
        // For development/mocking if API isn't ready
        // if (!userId) { setError("No User ID found"); setLoading(false); return; }

        const data = await fetchDocumentTree(userId, token);
        setDashboardData(data);

        // Initialize all services as collapsed by default
        setExpandedServices({});

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleService = (serviceId) => {
    setExpandedServices((prev) => ({
      ...prev,
      [serviceId]: !prev[serviceId],
    }));
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500">Loading Dashboard...</div>
    );
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const totalSummary = dashboardData.reduce(
    (acc, service) => {
      const summary = service.summary || {};
      return {
        required: acc.required + (summary.total_required_documents || 0),
        uploaded: acc.uploaded + (summary.total_uploaded_documents || 0),
        approved: acc.approved + (summary.total_approved_documents || 0),
        rejected: acc.rejected + (summary.total_rejected_documents || 0),
      };
    },
    { required: 0, uploaded: 0, approved: 0, rejected: 0 },
  );

  // --- Filtering Logic ---
  // Incomplete/In Progress: uploaded < required AND uploaded > 0
  // OR fully uploaded but not fully approved yet (Waiting for approval, etc.)
  // Actually, request says: "show services which are incomplete because none are uploaded" -> Not Started
  // "show services which are incomplete where totaldocuments are not completely uploaded" -> In Progress/Incomplete

  const inProgressServices = [];
  const notStartedServices = [];

  dashboardData.forEach((service) => {
    const summary = service.summary || {};
    const uploaded = summary.total_uploaded_documents || 0;
    const required = summary.total_required_documents || 0;

    // Classify
    if (uploaded === 0 && required > 0) {
      notStartedServices.push(service);
    } else {
      // Includes fully uploaded, partially uploaded, etc.
      // The prompt implies we primarily want to see "what is left to do".
      // But usually a dashboard shows everything or filters.
      // Let's list everything else here (In Progress, Completed, etc)
      // or strictly follow "incomplete where totaldocuments are not completely uploaded"

      // However, we also need to show status for fully uploaded ones.
      // Let's call this main list "Active Services" covering everything that has progress or is done.
      inProgressServices.push(service);
    }
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">User Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Required Docs"
          value={totalSummary.required}
          icon={<FaFileAlt className="text-blue-500" />}
          bgColor="bg-blue-50"
          borderColor="border-blue-200"
        />
        <KPICard
          title="Uploaded"
          value={totalSummary.uploaded}
          icon={<FaCloudUploadAlt className="text-purple-500" />}
          bgColor="bg-purple-50"
          borderColor="border-purple-200"
        />
        <KPICard
          title="Approved"
          value={totalSummary.approved}
          icon={<FaCheckCircle className="text-green-500" />}
          bgColor="bg-green-50"
          borderColor="border-green-200"
        />
        <KPICard
          title="Rejected"
          value={totalSummary.rejected}
          icon={<FaTimesCircle className="text-red-500" />}
          bgColor="bg-red-50"
          borderColor="border-red-200"
        />
      </div>

      <div className="space-y-8">
        {/* Section 1: In Progress / Uploaded / Completed */}
        {inProgressServices.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCloudUploadAlt className="text-blue-600" /> Active Services
            </h2>
            <div className="space-y-6">
              {inProgressServices.map((service) => (
                <ServiceCard
                  key={service.service_id}
                  service={service}
                  expanded={expandedServices[service.service_id]}
                  onToggle={() => toggleService(service.service_id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Not Started (None uploaded) */}
        {notStartedServices.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaFileAlt className="text-gray-500" /> Not Started
            </h2>
            <div className="space-y-6">
              {notStartedServices.map((service) => (
                <ServiceCard
                  key={service.service_id}
                  service={service}
                  expanded={expandedServices[service.service_id]}
                  onToggle={() => toggleService(service.service_id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ServiceCard = ({ service, expanded, onToggle }) => {
  const { status, color, percentage, message } =
    calculateApplicationStatus(service);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 transition-all hover:shadow-lg">
      <div
        className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors gap-4"
        onClick={onToggle}
      >
        <div className="flex items-center gap-4 flex-1">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-gray-700">
              {service.service_name}
            </h2>
            <span className="text-xs text-gray-500">
              Service ID: {service.service_id}
            </span>
          </div>
        </div>

        {/* Progress Bar & Status Section */}
        <div className="flex flex-col w-full md:w-1/3 gap-1">
          <div className="flex justify-between text-xs font-semibold uppercase tracking-wide">
            <span className={`${color.text}`}>{status}</span>
            <span className="text-gray-500">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-200 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ease-out ${color.bar}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-400 text-right">
            {message}
          </span>
        </div>

        <div className="ml-4">
          {expanded ? (
            <FaChevronUp className="text-gray-400" />
          ) : (
            <FaChevronDown className="text-gray-400" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-6 animate-fadeIn">
          <div className="grid grid-cols-1 gap-6">
            {service.doctypes.map((doctype) => (
              <div
                key={doctype.doctype_id}
                className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <h3 className="font-semibold text-gray-800 mb-3 border-b pb-2 flex items-center gap-2">
                  <FaFileAlt className="text-blue-500" /> {doctype.doctype_name}
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          Document Name
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {doctype.allowed_docs.map((doc) => (
                        <tr
                          key={doc.allow_doc_id}
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                            {doc.allow_doc_name}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={doc.approval_status} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            {doc.is_uploaded ? (
                              <a
                                href={doc.document_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 transition-colors"
                              >
                                View Document
                              </a>
                            ) : (
                              <span className="text-gray-400 italic text-xs">
                                Not Uploaded
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper: Calculate Logic
const calculateApplicationStatus = (service) => {
  const summary = service.summary || {};
  const totalRequired = summary.total_required_documents || 1; // avoid divide by zero
  const totalUploaded = summary.total_uploaded_documents || 0;

  // Collect all individual doc statuses
  let allDocs = [];
  service.doctypes.forEach((dt) => {
    if (dt.allowed_docs) allDocs = [...allDocs, ...dt.allowed_docs];
  });

  const hasRejections = allDocs.some((d) => d.approval_status === "REJECTED");
  const hasResubmitted = allDocs.some(
    (d) => d.approval_status === "RESUBMITTED",
  ); // Assuming this status exists
  const allApproved =
    allDocs.length > 0 &&
    allDocs.every((d) => d.approval_status === "APPROVED");

  // Percentage for the bar
  let percentage = Math.round((totalUploaded / totalRequired) * 100);
  if (percentage > 100) percentage = 100;

  // Logic
  if (totalUploaded < totalRequired) {
    // Incomplete
    return {
      status: "INCOMPLETE",
      color: { text: "text-orange-600", bar: "bg-orange-500" },
      percentage: percentage,
      message: `${totalUploaded}/${totalRequired} Uploaded`,
    };
  } else {
    // All uploaded. Now check approval status.
    if (hasRejections) {
      return {
        status: "REJECTED",
        color: { text: "text-red-600", bar: "bg-red-500" },
        percentage: 100,
        message: "Action Required: Check Rejected Documents",
      };
    } else if (allApproved) {
      return {
        status: "APPROVED",
        color: { text: "text-green-600", bar: "bg-green-500" },
        percentage: 100,
        message: "Application Approved",
      };
    } else if (hasResubmitted) {
      // If everything else is fine but some resubmitted?
      // Or maybe Resubmitted implies pending review.
      return {
        status: "RESUBMITTED",
        color: { text: "text-blue-600", bar: "bg-blue-500" },
        percentage: 100,
        message: "Under Review",
      };
    } else {
      // Pending (Uploaded but not all approved, no rejections)
      return {
        status: "PENDING",
        color: { text: "text-yellow-600", bar: "bg-yellow-500" },
        percentage: 100,
        message: "Awaiting Approval",
      };
    }
  }
};

const KPICard = ({ title, value, icon, bgColor, borderColor }) => (
  <div
    className={`${bgColor} border ${borderColor} rounded-xl p-5 flex items-center justify-between shadow-sm`}
  >
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
    <div className="text-3xl opacity-80">{icon}</div>
  </div>
);

const StatusBadge = ({ status }) => {
  let colorClass = "bg-gray-100 text-gray-600";
  if (status === "APPROVED") colorClass = "bg-green-100 text-green-700";
  else if (status === "REJECTED") colorClass = "bg-red-100 text-red-700";
  else if (status === "OPEN" || status === "Submitted")
    colorClass = "bg-blue-100 text-blue-700";
  else if (status === "RESUBMITTED")
    colorClass = "bg-purple-100 text-purple-700";

  return (
    <span
      className={`px-2 py-1 rounded-md text-xs font-semibold ${colorClass}`}
    >
      {status || "PENDING"}
    </span>
  );
};

export default UserDashboard;
