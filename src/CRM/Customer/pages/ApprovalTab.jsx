import React, { useEffect, useState } from "react";
import ApprovalCustomer from "../modals/ApprovalCustomerModal";
import CustomerFilters from "../component/CustomerFilters";
import useCustomerData from "../../hooks/useCustomerData";
import { CUSTOMER_STAGES } from "../utils/constants";
import jsPDF from "jspdf";
import "jspdf-autotable";
import pdfIcon from "../../../assests/folder.png";
import excel from "../../../assests/excel.png";
import * as XLSX from "xlsx";
import { EditIcon } from "../component/Icons";
import { FaLessThan, FaGreaterThan } from "react-icons/fa";
import ConfirmationModal from "../../../NewComponents/ConfirmationModal";
import MessageModal from "../../../NewComponents/MessageModal";
import CustomerTable from "../component/CustomerTable";


function ApprovalTab() {
  const {
    customers,
    loading,
    fetchCustomers,
    approveCustomer,
    rejectCustomer,
    resubmitCustomer,
  } = useCustomerData();

  const [filterState, setFilterState] = useState({
    search: "",
    stage: "",
    dateRange: { start: "", end: "" },
  });

  const filtersConfig = [
    { type: "search", key: "search", placeholder: "Search by name" },
    {
      type: "select",
      key: "stage",
      options: [
        CUSTOMER_STAGES.APPROVED,
        CUSTOMER_STAGES.PENDING,
        CUSTOMER_STAGES.REJECTED,
        CUSTOMER_STAGES.RESUBMITTED,
      ],
      label: "Stage",
    },
    { type: "dateRange", key: "dateRange" },
  ];

  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonType, setReasonType] = useState("");
  const [reasonText, setReasonText] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});


  const pageSize = 10;


  // Apply filters
  useEffect(() => {
    const norm = (v) => (v || "").toString().toLowerCase().trim();

    let filtered = customers.filter((c) => {
      const stage = norm(c.stage || c.status);
      return (
        stage === CUSTOMER_STAGES.PENDING.toLowerCase() ||
        stage === CUSTOMER_STAGES.RESUBMITTED.toLowerCase()
      );
    });

    if (filterState.search) {
      const term = filterState.search.toLowerCase();
      filtered = filtered.filter((c) =>
        c.customer_name.toLowerCase().includes(term)
      );
    }

    if (filterState.stage) {
      filtered = filtered.filter((c) => c.stage === filterState.stage);
    }

    const { start, end } = filterState.dateRange;
    if (start || end) {
      filtered = filtered.filter((c) => {
        const customerDate = new Date(c.created_at);
        const afterStart = start ? customerDate >= new Date(start) : true;
        const beforeEnd = end
          ? customerDate <= new Date(end + "T23:59:59")
          : true;
        return afterStart && beforeEnd;
      });
    }

    setFilteredCustomers(filtered);
  }, [customers, filterState]);

  useEffect(() => setCurrentPage(1), [filterState]);

  // Initial load
  useEffect(() => {
    fetchCustomers([CUSTOMER_STAGES.PENDING, CUSTOMER_STAGES.RESUBMITTED]);
  }, [fetchCustomers]);

  // Handle Approve/Reject/Resubmit
  const handleConfirmAction = async () => {
    if (!selectedCustomer) return;

    try {
      let updatedStage = null;

      if (pendingAction === "approve") {
        await approveCustomer(selectedCustomer.customer_id);
        updatedStage = CUSTOMER_STAGES.APPROVED;
        setMessage("Customer approved successfully!");
      } else if (pendingAction === "reject") {
        await rejectCustomer(selectedCustomer.customer_id, reasonText);
        updatedStage = CUSTOMER_STAGES.REJECTED;
        setMessage("Customer rejected successfully!");
      } else if (pendingAction === "resubmit") {
        await resubmitCustomer(selectedCustomer.customer_id, reasonText);
        updatedStage = CUSTOMER_STAGES.RESUBMITTED;
        setMessage("Customer resubmitted successfully!");
      }

      // ✅ Update stage locally (UI update without refetch)
      if (updatedStage) {
        // The hook's approve/reject/resubmit already refreshes customers (fetchCustomers).
        // No need to call fetchCustomers() again here (avoids double fetch).
        // We'll rely on the hook to update `customers` and the filter useEffect to run.
      }

      setMessageType("success");
      setShowConfirmModal(false);
      setShowApprovalModal(false);
      setShowReasonModal(false);
      setReasonText("");
      setPendingAction(null);
    } catch (error) {
      console.error("Approval error:", error);
      setMessage("Something went wrong. Please try again.");
      setMessageType("error");
      setShowConfirmModal(false);
    }
  };

  // ✅ REMOVED: This was a duplicate fetch causing slowness
  // The fetch above (line ~108) already loads both Pending + Resubmitted, no need for a second call



  const handleApprove = () => {
    setPendingAction("approve");
    setShowConfirmModal(true);
  };

  const handleReject = () => {
    setReasonType("Reject");
    setShowApprovalModal(false);
    setShowReasonModal(true);
  };

  const handleResubmit = () => {
    setReasonType("Resubmit");
    setShowApprovalModal(false);
    setShowReasonModal(true);
  };

  const handleReasonSubmit = () => {
    if (!reasonText.trim()) {
      setMessage("Please provide a reason before submitting.");
      setMessageType("error");
      return;
    }
    setPendingAction(reasonType === "Resubmit" ? "resubmit" : "reject");
    setShowConfirmModal(true);
    setShowReasonModal(false);
  };

  const handleReasonClose = () => {
    setShowReasonModal(false);
    setShowApprovalModal(true);
    setReasonText("");
  };

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleDownloadExcel = () => {
    if (!filteredCustomers.length) {
      setMessage("No customers to export.");
      setMessageType("info");
      return;
    }

    const wsData = filteredCustomers.map((c, index) => ({
      "S.No": index + 1,
      "Customer Name": c.customer_name,
      Email: c.email_id || "N/A",
      Phone: c.phone_number || "N/A",
      Workflow: c.workflow || "N/A",
      Date: c.created_at ? new Date(c.created_at).toLocaleDateString() : "N/A",
      Stage: c.stage,
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Approved Customers");
    XLSX.writeFile(wb, "Approved_Customers.xlsx");

    setMessage("Excel file downloaded successfully!");
    setMessageType("success");
  };

  const handleDownloadPDF = () => {
    if (!filteredCustomers.length) {
      setMessage("No customers to export.");
      setMessageType("info");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = [
      "S.No",
      "Customer Name",
      "Email",
      "Phone",
      "Workflow",
      "Date",
      "Stage",
    ];
    const tableRows = filteredCustomers.map((c, index) => [
      index + 1,
      c.customer_name,
      c.email_id || "N/A",
      c.phone_number || "N/A",
      c.workflow || "N/A",
      c.created_at ? new Date(c.created_at).toLocaleDateString() : "N/A",
      c.stage,
    ]);
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("Approved_Customers.pdf");

    setMessage("PDF downloaded successfully!");
    setMessageType("success");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-blue-600 text-xl font-semibold">Loading...</p>
      </div>
    );

  const columns = [
    { key: "sno", label: "S.No", render: (_, i) => (currentPage - 1) * pageSize + i + 1 },
    {
      key: "customer_name",
      label: "Customer",
      width: "200px",
      render: (item) => {
        const LIMIT = 12;
        const text = item.customer_name || "N/A";
        const rowKey = `approval-${item.customer_id}`;

        const showReadMore = text.length > LIMIT;
        const isExpanded = expandedRows[rowKey];

        return (
          <div className="flex items-center gap-1 max-w-[180px] whitespace-normal break-words">
            <span className="text-black whitespace-normal break-words">
              {isExpanded || !showReadMore
                ? text
                : text.substring(0, LIMIT)}
            </span>

            {/* Show "..." only when collapsed */}
            {showReadMore && !isExpanded && (
              <button
                className="text-blue-600 text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedRows((prev) => ({
                    ...prev,
                    [rowKey]: true,
                  }));
                }}
              >
                ...
              </button>
            )}
          </div>
        );
      },
    },


    { key: "email_id", label: "Email" },
    { key: "phone_number", label: "Phone" },
    {
      label: "Workflow",
      render: (item) => {
        const workflowName = item.workflow || "";
        const workflowId = item.workflow_id ? ` ${item.workflow_id}` : "";
        return workflowName + workflowId;
      }
    },
    { key: "created_at", label: "Date", render: (c) => new Date(c.created_at).toLocaleDateString() },
    {
      key: "stage",
      label: "Stage",
      render: (item) => {
        const stage = item.stage?.toLowerCase();
        const isPending = stage === "pending";

        return (
          <span
            className={`${isPending ? 'text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs font-bold' : ''}`}
            style={isPending ? { color: '#ba8d07ff', backgroundColor: '#FEF9C3' } : {}}
          >
            {item.stage}
          </span>
        );
      }
    },
  ];

  const actions = [
    {
      label: "Edit",
      icon: EditIcon,
      onClick: (customer) => {
        setSelectedCustomer(customer);
        setShowApprovalModal(true);
      },
      show: true,
    },
  ];

  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setPendingAction("delete");
    setShowConfirmModal(true); // Show confirmation first
  };

  return (
    <div className="flex flex-col overflow-hidden w-full">
      {/* Filters and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <CustomerFilters
          filtersConfig={filtersConfig}
          filterState={filterState}
          setFilterState={setFilterState}
        />
        <div className="flex gap-2">
          <button onClick={handleDownloadExcel} className="flex items-center justify-center">
            <img src={excel} alt="Excel" className="w-6 h-6" />
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center justify-center">
            <img src={pdfIcon} alt="PDF" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Customer Table */}
      <div className="h-[69vh] relative">
        <CustomerTable
          data={paginatedCustomers}
          columns={columns}
          currentPage={currentPage}
          pageSize={pageSize}
          actions={actions}
          height="flex-1 overflow-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[70vh] bg-white rounded-lg"
        />

        {/* Pagination (FlagTab style) */}
        <div className="flex justify-center items-center gap-2 py-4 z-10 absolute bottom-0 right-0 left-0">
          <button
            className="w-[32px] h-[32px] border border-blue-500 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <FaLessThan size={10} color="#000" />
          </button>

          <div className="w-[32px] h-[32px] bg-blue-600 text-white rounded flex items-center justify-center text-sm font-medium">
            {currentPage}
          </div>

          <span className="text-sm font-medium">of</span>

          <div className="w-[32px] h-[32px] border border-blue-500 rounded flex items-center justify-center text-sm font-medium">
            {totalPages}
          </div>

          <button
            className="w-[32px] h-[32px] border border-blue-500 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <FaGreaterThan size={10} color="#000" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <ApprovalCustomer
        isOpen={showApprovalModal}
        customer={selectedCustomer}
        onClose={() => setShowApprovalModal(false)}
        onApprove={handleApprove}
        onReject={handleReject}
        onResubmit={handleResubmit}
      />

      {showReasonModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-red-500 text-xl"
              onClick={() => {
                setShowReasonModal(false);
                setReasonText("");
              }}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">
              {reasonType === "Resubmit" ? "Resubmit Request" : "Reject Request"}
            </h2>
            <div className="mb-4">
              <label className="block text-md font-medium mb-2">Reason</label>
              <textarea
                className="border rounded px-3 py-2 w-full min-h-[120px] resize-none"
                placeholder="Type reason"
                value={reasonText}
                onChange={(e) => setReasonText(e.target.value)}
              />
            </div>
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                className="bg-[#1976D2] text-white px-8 py-2 rounded font-semibold"
                onClick={handleReasonSubmit}
              >
                Submit
              </button>
              <button
                type="button"
                className="border border-black text-black px-8 py-2 rounded font-semibold"
                onClick={handleReasonClose}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmAction}
        title="Confirm Action"
        message="Do you really want to continue this action?"
        confirmText="Yes"
        cancelText="Cancel"
        icon="?"
      />

      <MessageModal
        message={message}
        type={messageType}
        setMessage={setMessage}
      />
    </div>
  );
}

export default ApprovalTab;
