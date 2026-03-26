import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaSearch, FaCheck, FaTimes } from "react-icons/fa";
import Select from "react-select";
import PopupModal from "./PopupModal";
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
  const [modalType, setModalType] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalCallback, setModalCallback] = useState(null);

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
    { value: "RFP Approved", label: "Approved" },
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
          `${API.PURCHASE_API}/rfps/all-rfp`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const rfpData = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
          ? response.data
          : [];

        // Extract rfp_info and flatten the structure
        const flattenedData = rfpData.map((item) => ({
          ...(item.rfp_info || item),
          items: item.items || [],
        }));

        // Add serial numbers
        const dataWithSno = flattenedData.map((item, index) => ({
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

  // Close Modal
  const closeModal = () => {
    setModalType(null);
    setModalTitle("");
    setModalMessage("");
    setModalCallback(null);
  };

  // Confirm Approval
  const handleConfirmApproval = async () => {
    try {
      await axios.put(
        `${API.PURCHASE_API}/rfps/update-status/${pendingRfpId}`,
        { status: "Approved", },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalType("success");
      setModalTitle("Success");
      setModalMessage("RFP approved successfully.");

      // Refresh data
      setData(data.map(item => 
        item.rfp_id === pendingRfpId 
          ? { ...item, status: "RFP Approved" }
          : item
      ));

      setShowReasonModal(false);
      setApprovalReason("");
      setPendingRfpId(null);
      setPendingAction(null);
      setModalCallback(() => () => {
        setShowReasonModal(false);
        setApprovalReason("");
        setPendingRfpId(null);
        setPendingAction(null);
      });
    } catch (error) {
      console.error("Error approving RFP:", error);
      setModalType("error");
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "Failed to approve RFP.");
    }
  };

  // Confirm Rejection
  const handleConfirmRejection = async () => {
    if (!rejectionReason.trim()) {
      setModalType("warning");
      setModalTitle("Warning");
      setModalMessage("Please provide a rejection reason.");
      return;
    }

    try {
      await axios.put(
        `${API.PURCHASE_API}/rfps/update-status/${pendingRfpId}`,
        { status: "Rejected", reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalType("success");
      setModalTitle("Success");
      setModalMessage("RFP rejected successfully.");

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
      setModalCallback(() => () => {
        setShowReasonModal(false);
        setRejectionReason("");
        setPendingRfpId(null);
        setPendingAction(null);
      });
    } catch (error) {
      console.error("Error rejecting RFP:", error);
      setModalType("error");
      setModalTitle("Error");
      setModalMessage(error.response?.data?.message || "Failed to reject RFP.");
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
      case "RFP Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex">
      <div className="p-3 w-full">
        <div className="flex mb-4 gap-4 items-center">
          <div className="relative w-1/4">
            <input
              type="text"
              placeholder="Search"
              className="border border-gray-300 w-full p-2 pl-10 rounded-xl bg-[#FFFFFF] h-10 text-base"
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minHeight: "40px" }}
            />
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="w-1/6">
            <Select
              className="w-full"
              styles={{
                ...selectStyles,
                control: (provided) => ({
                  ...provided,
                  backgroundColor: "#FFFFFF",
                }),
                menu: (provided) => ({
                  ...provided,
                  backgroundColor: "#FFFFFF",
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isFocused ? "#F3F4F6" : "#FFFFFF",
                  color: "#111827",
                }),
              }}
              options={statusOptions}
              value={statusOptions.find((opt) => opt.value === selectedStatus)}
              onChange={(opt) => setSelectedStatus(opt.value)}
              isSearchable
              placeholder="All Status"
            />
          </div>
          <div className="flex-1 flex justify-end">
            <DownloadTableButtons
              data={filteredData.map((item, idx) => ({
                sno: idx + 1,
                rfp_id: item.rfp_id,
                title: item.title,
                start_date: formatDate(item.rfp_start_date),
                end_date: formatDate(item.rfp_end_date),
                status: item.status,
              }))}
              columns={columns}
              fileName="RFPRequests"
            />
          </div>
        </div>
        <div
          className="overflow-x-auto rounded-lg shadow bg-white p-4"
          style={{ maxHeight: 600, overflowY: "auto", minWidth: 900 }}
        >
          <table className="w-full bg-white rounded-lg border-collapse">
            <thead className="border-b-2 border-black top-0 bg-white z-10">
              <tr className="p-4 text-center">
                <th className="p-2">S. No.</th>
                <th className="p-2">RFP ID</th>
                <th className="p-2">Title</th>
                <th className="p-2">Start Date</th>
                <th className="p-2">End Date</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No RFP requests found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr
                    key={index}
                    className="odd:bg-blue-50 text-center"
                  >
                    <td className="p-2">
                      {index + 1 + (currentPage - 1) * rowsPerPage}
                    </td>
                    <td className="p-2 text-blue-600 cursor-pointer font-medium">
                      <button onClick={() => handleViewDetails(item)}>
                        {item.rfp_id}
                      </button>
                    </td>
                    <td className="p-2">{item.title || "-"}</td>
                    <td className="p-2">
                      {formatDate(item.rfp_start_date)}
                    </td>
                    <td className="p-2">
                      {formatDate(item.rfp_end_date)}
                    </td>
                    <td className="p-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusBadgeColor(item.status)}`}>
                        {item.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-2">
                      {item.status === "Pending" ? (
                        <div className="flex gap-2 justify-center">
                          <button
                            onClick={() => handleApproveClick(item)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1 transition text-xs"
                            title="Approve"
                          >
                            <FaCheck size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectClick(item)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1 transition text-xs"
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

        {/* Pagination Controls */}
        <div className="flex items-center gap-2 mt-4 justify-center">
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white border-gray-300 border rounded disabled:opacity-50"
          >
            &lt;
          </button>

          <button className="px-4 py-2 bg-custome-blue border-custome-blue text-white rounded">
            {currentPage}
          </button>

          <span className="px-2">of</span>

          <button className="px-4 py-2 border rounded text-custome-blue">
            {totalPages}
          </button>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white border-gray-300 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
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
            <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
              {pendingAction === "approve" ? "Approve RFP" : "Reject RFP"}
            </h2>

            {pendingAction === "reject" && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide your reason..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-32"
                />
              </div>
            )}

            <div className="flex justify-center gap-3">
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

      {/* Custom Popup Modal */}
      {modalType && (
        <PopupModal
          type={modalType}
          title={modalTitle}
          message={modalMessage}
          onClose={closeModal}
          onConfirm={modalCallback}
          onCancel={closeModal}
        />
      )}
    </div>
  );
};

export default RfpApprovals;
