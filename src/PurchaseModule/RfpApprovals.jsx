import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";
import Select from "react-select";
import DownloadTableButtons from "./components/Downloadpdfexcel";
import API from "../config/api";

const RfpApprovals = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [pendingAction, setPendingAction] = useState(null); // "approve" or "reject"
  const [pendingRfpId, setPendingRfpId] = useState(null);

  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();

  const [departments, setDepartments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "RFP ID", accessor: "rfp_id" },
    { header: "Title", accessor: "title" },
    { header: "Start Date", accessor: "rfp_start_date" },
    { header: "End Date", accessor: "rfp_end_date" },
    { header: "Status", accessor: "status" },
    { header: "Actions", accessor: "actions" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Approved", label: "Approved" },
    { value: "Rejected", label: "Rejected" },
    { value: "Pending", label: "Pending" },
  ];

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "40px",
      height: "40px",
      borderRadius: "0.75rem",
      fontSize: "16px",
      backgroundColor: "#F4F4F4",
      borderColor: "#d1d5db",
      boxShadow: "none",
    }),
    valueContainer: (provided) => ({
      ...provided,
      height: "40px",
      padding: "0 12px",
    }),
    input: (provided) => ({
      ...provided,
      margin: "0px",
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      height: "40px",
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "#111827",
      fontSize: "16px",
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "#6b7280",
      fontSize: "16px",
    }),
  };

  // Fetch Departments
  // useEffect(() => {
  //   const fetchDepartments = async () => {
  //     try {
  //       const response = await axios.get(
  //         `${API.PURCHASE_API}/rfps/receive_rfp`,
  //         { headers: { Authorization: `Bearer ${token}` } }
  //       );
  //       setDepartments(response.data);
  //     } catch (error) {
  //       console.error("Error fetching departments:", error);
  //     }
  //   };

  //   if (token) {
  //     fetchDepartments();
  //   }
  // }, [token]);

  // Fetch RFP Data
  useEffect(() => {
    const fetchRfpData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${API.PURCHASE_API}/rfps/receive_rfp`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const rfpData = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        // Add serial numbers
        const dataWithSno = rfpData.map((item, index) => ({
          ...item,
          sno: index + 1,
        }));

        setData(dataWithSno);
      } catch (error) {
        console.error("Error fetching RFP data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRfpData();
    }
  }, [token]);

  // Filter Data
  const filteredData = data.filter((item) => {
    const matchesStatus = selectedStatus
      ? item.status === selectedStatus
      : true;

    const matchesSearch = searchTerm
      ? (
          (item.rfp_id || "") +
          " " +
          (item.organization_name || "") +
          " " +
          (item.title || "") +
          " " +
          (item.status || "")
        )
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    return matchesStatus && matchesSearch;
  });

  // View Details
  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  // Approve RFP
  const handleApproveClick = (item) => {
    setPendingRfpId(item.rfp_id);
    setPendingAction("approve");
    setShowReasonModal(true);
  };

  // Reject RFP
  const handleRejectClick = (item) => {
    setPendingRfpId(item.rfp_id);
    setPendingAction("reject");
    setShowReasonModal(true);
  };

  // Confirm Approval
  const handleConfirmApproval = async () => {
    if (!approvalReason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please provide an approval reason.",
      });
      return;
    }

    try {
      await axios.patch(
        `${API.PURCHASE_API}/rfps/${pendingRfpId}/approve`,
        { status: "Approved", reason: approvalReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "RFP approved successfully.",
      });

      // Refresh data
      setData(data.map(item => 
        item.rfp_id === pendingRfpId 
          ? { ...item, status: "Approved" }
          : item
      ));

      setShowReasonModal(false);
      setApprovalReason("");
      setPendingRfpId(null);
      setPendingAction(null);
    } catch (error) {
      console.error("Error approving RFP:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to approve RFP.",
      });
    }
  };

  // Confirm Rejection
  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please provide a rejection reason.",
      });
      return;
    }

    try {
      await axios.patch(
        `${API.PURCHASE_API}/rfps/${pendingRfpId}/reject`,
        { status: "Rejected", reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "RFP rejected successfully.",
      });

      // Refresh data
      setData(data.map(item => 
        item.rfp_id === pendingRfpId 
          ? { ...item, status: "Rejected" }
          : item
      ));

      setShowReasonModal(false);
      setRejectionReason("");
      setPendingRfpId(null);
      setPendingAction(null);
    } catch (error) {
      console.error("Error rejecting RFP:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to reject RFP.",
      });
    }
  };

  // Close modals
  const handleCloseReasonModal = () => {
    setShowReasonModal(false);
    setApprovalReason("");
    setRejectionReason("");
    setPendingRfpId(null);
    setPendingAction(null);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };

  // Format Date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  // Get Status Badge Color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">RFP Approvals</h1>

          {/* Search and Filters */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search RFP ID, Organization, Title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Status Filter */}
            <div>
              <Select
                options={statusOptions}
                value={statusOptions.find((opt) => opt.value === selectedStatus) || statusOptions[0]}
                onChange={(opt) => setSelectedStatus(opt.value)}
                styles={selectStyles}
                isSearchable={false}
              />
            </div>

            {/* Download */}
            <div className="flex justify-end">
              <DownloadTableButtons data={filteredData} columns={columns} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.accessor}
                    className="px-6 py-3 text-left text-sm font-semibold text-gray-700"
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                    No RFP requests found.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-sm text-gray-900">{item.sno}</td>
                    <td className="px-6 py-3 text-sm text-blue-600 cursor-pointer font-medium">
                      <button onClick={() => handleViewDetails(item)}>
                        {item.rfp_id}
                      </button>
                    </td>
                    {/* <td className="px-6 py-3 text-sm text-gray-700">{item.organization_name || "-"}</td> */}
                    <td className="px-6 py-3 text-sm text-gray-700">{item.title || "-"}</td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {formatDate(item.rfp_start_date)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-700">
                      {formatDate(item.rfp_end_date)}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(item.status)}`}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {item.status === "Pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproveClick(item)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                            title="Approve"
                          >
                            <FaCheck size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(item)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition"
                            title="Reject"
                          >
                            <FaTimes size={14} />
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Popup */}
      {isPopupOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 w-[90%] max-w-2xl shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-900">RFP Details</h2>
              <button
                onClick={handleClosePopup}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">RFP ID</p>
                <p className="text-lg font-semibold text-gray-900">{selectedItem.rfp_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Organization</p>
                <p className="text-lg font-semibold text-gray-900">{selectedItem.organization_name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Title</p>
                <p className="text-lg font-semibold text-gray-900">{selectedItem.title || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(selectedItem.status)}`}>
                  {selectedItem.status || "Pending"}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Start Date</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(selectedItem.rfp_start_date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">End Date</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(selectedItem.rfp_end_date)}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Logo</p>
                {selectedItem.logo_file_link ? (
                  <img
                    src={selectedItem.logo_file_link}
                    alt="Organization Logo"
                    className="h-20 w-20 object-cover rounded mt-2"
                  />
                ) : (
                  <p className="text-gray-500">No logo available</p>
                )}
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-2">RFP File</p>
                {selectedItem.rfp_file_link ? (
                  <a
                    href={selectedItem.rfp_file_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View RFP Document
                  </a>
                ) : (
                  <p className="text-gray-500">No document available</p>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleClosePopup}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-6 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Reason Modal */}
      {showReasonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-8 w-[90%] max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {pendingAction === "approve" ? "Approve RFP" : "Reject RFP"}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {pendingAction === "approve" ? "Approval Reason" : "Rejection Reason"}
              </label>
              <textarea
                value={pendingAction === "approve" ? approvalReason : rejectionReason}
                onChange={(e) =>
                  pendingAction === "approve"
                    ? setApprovalReason(e.target.value)
                    : setRejectionReason(e.target.value)
                }
                placeholder="Please provide your reason..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseReasonModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-4 py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={
                  pendingAction === "approve"
                    ? handleConfirmApproval
                    : handleConfirmRejection
                }
                className={`${
                  pendingAction === "approve"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                } text-white px-4 py-2 rounded-lg transition`}
              >
                {pendingAction === "approve" ? "Approve" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RfpApprovals;
