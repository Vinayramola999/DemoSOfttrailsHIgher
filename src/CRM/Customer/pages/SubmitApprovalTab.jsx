import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CustomerInfoModal from "../modals/CustomerInfoModal";
import CustomerFormModal from "../modals/CustomerFormModal";
import CustomerFilters from "../component/CustomerFilters";
import Swal from "sweetalert2";
import { Country, State, City } from "country-state-city";
import Pagination from "../component/pagination";
import { EditIcon, DeleteIcon, FlagIcon } from "../component/Icons";
import useCustomerData from "../../hooks/useCustomerData";
import CustomerTable from "../component/CustomerTable";
import pdfIcon from "../../../assests/folder.png";
import excelIcon from "../../../assests/excel.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import ConfirmationModal from "../../../NewComponents/ConfirmationModal";
import MessageModal from "../../../NewComponents/MessageModal";



import {
  DEFAULT_CUSTOMER,
  VALIDATION_REGEX,
  ERROR_MESSAGES,
  PAGINATION,
  CUSTOMER_STAGES,
  STAGE_COLORS,
  FILTER_TYPES,
} from "../utils/constants";

const SubmitApprovalTab = () => {
  const navigate = useNavigate();

  const {
    customers,
    loading,
    fetchCustomers,
    updateCustomerData,
    deleteCustomer,
    flagCustomer,
  } = useCustomerData();

  // ---------- STATES ----------
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [FilteredCustomers, setFilteredCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState(DEFAULT_CUSTOMER);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCustomerIndex, setCurrentCustomerIndex] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [gstError, setGstError] = useState("");
  const [panError, setPanError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});

  const [filterState, setFilterState] = useState({
    searchQuery: "",
    dateRange: { start: "", end: "" },
    stage: "",
  });

  const pageSize = PAGINATION.CONTACT_PAGE_SIZE;
  // ---------- CONFIRMATION WRAPPER ----------
  const askConfirmation = (actionCallback) => {
    setPendingAction(() => actionCallback);
    setShowConfirmModal(true);
  };


  // ---------- UTILITY FUNCTIONS ----------
  const resetForm = () => {
    setNewCustomer(DEFAULT_CUSTOMER);
    setIsEditMode(false);
    setCurrentCustomerIndex(null);
    setErrorMessage("");
    setPanError("");
    setGstError("");
    setMobileError("");
    setEmailError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };

  const handlemobileChange = (e) => {
    const { value } = e.target;
    if (!VALIDATION_REGEX.PHONE_DIGITS.test(value)) return;
    setNewCustomer((prev) => ({ ...prev, phone_number: value }));
    setMobileError(
      value.length !== 10 ? ERROR_MESSAGES.INVALID_PHONE_LENGTH : ""
    );
  };

  const handleEmailChange = (e) => {
    const { value } = e.target;
    setNewCustomer((prev) => ({ ...prev, email_id: value }));
    setEmailError(
      !VALIDATION_REGEX.EMAIL.test(value)
        ? ERROR_MESSAGES.INVALID_EMAIL
        : ""
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer((prev) => ({ ...prev, [name]: value }));
  };



  const handleEditSubmit = (e) => {
    e.preventDefault();

    setErrorMessage("");
    setGstError("");
    setPanError("");

    if (newCustomer.gst_number && !VALIDATION_REGEX.GST.test(newCustomer.gst_number)) {
      setGstError(ERROR_MESSAGES.INVALID_GST);
      return;
    }

    if (newCustomer.pan_no && !VALIDATION_REGEX.PAN.test(newCustomer.pan_no)) {
      setPanError(ERROR_MESSAGES.INVALID_PAN);
      return;
    }

    // Ask confirmation before update
    askConfirmation(async () => {
      const customerId = customers[currentCustomerIndex].customer_id;

      const result = await updateCustomerData(customerId, newCustomer);

      if (result.success) {
        setMessage("Customer updated successfully!");
        setMessageType("success");

        setIsPopupOpen(false);
        resetForm();
        await fetchCustomers([
          CUSTOMER_STAGES.PENDING,
          CUSTOMER_STAGES.RESUBMITTED,
        ]);
      } else {
        setMessage(result.error || "Failed to update customer");
        setMessageType("error");
      }
    });
  };


  const handleDeleteCustomer = (customer) => {
    askConfirmation(async () => {
      const result = await deleteCustomer(customer.customer_id);

      if (result.success) {
        setMessage("Customer deleted successfully!");
        setMessageType("success");

        await fetchCustomers([
          CUSTOMER_STAGES.PENDING,
          CUSTOMER_STAGES.RESUBMITTED,
        ]);
      } else {
        setMessage(result.error || "Failed to delete customer");
        setMessageType("error");
      }
    });
  };

  const handleFlagCustomer = (customer) => {
    askConfirmation(async () => {
      try {
        const { value: reason, isConfirmed } = await Swal.fire({
          title: "Flag Customer",
          input: "textarea",
          inputPlaceholder: "Enter reason for flagging...",
          showCancelButton: true,
        });

        if (isConfirmed && reason) {
          const result = await flagCustomer(customer.customer_id, reason);

          if (result.success) {
            setMessage("Customer flagged successfully!");
            setMessageType("success");

            await fetchCustomers([
              CUSTOMER_STAGES.PENDING,
              CUSTOMER_STAGES.RESUBMITTED,
            ]);
          } else {
            setMessage("Failed to flag customer");
            setMessageType("error");
          }
        }
      } catch (error) {
        setMessage("Unexpected error while flagging customer");
        setMessageType("error");
      }
    });
  };


  const handleCustomerClick = (customer) => {
    setSelectedCustomer(customer);
    setIsDetailModalOpen(true);
  };

  const filtersConfig = [
    { type: FILTER_TYPES.SEARCH, key: "searchQuery", placeholder: "Search by name" },
    { type: FILTER_TYPES.DATE_RANGE, key: "dateRange", label: "Date Range" },
    {
      type: FILTER_TYPES.SELECT,
      key: "stage",
      label: "Stage",
      options: [CUSTOMER_STAGES.PENDING, CUSTOMER_STAGES.RESUBMITTED],
    },
  ];

  const { searchQuery, dateRange, stage } = filterState;

  const filteredCustomers = customers
    .filter((customer) => {
      const isPendingOrResubmitted =
        customer.stage === CUSTOMER_STAGES.PENDING ||
        customer.stage === CUSTOMER_STAGES.RESUBMITTED;
      if (!isPendingOrResubmitted) return false;

      const matchesSearch =
        !searchQuery ||
        customer.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDate =
        (!dateRange.start || new Date(customer.created_at) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(customer.created_at) <= new Date(dateRange.end));

      const matchesStage = !stage || customer.stage === stage;

      return matchesSearch && matchesDate && matchesStage;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // ---------- EXCEL / PDF DOWNLOAD ----------
  function handleDownloadExcel() {
    if (!filteredCustomers.length) return alert("No data available to download.");

    const worksheet = XLSX.utils.json_to_sheet(
      filteredCustomers.map((c, index) => ({
        "S. No.": index + 1,
        Customer: c.customer_name,
        Email: c.email_id,
        "Phone No.": c.phone_number,
        Workflow: c.workflow,
        Date: c.created_at ? new Date(c.created_at).toLocaleDateString() : "NA",
        Stage: c.stage,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "Customers.xlsx");
  }

  async function handleDownloadPDF() {
    if (!filteredCustomers.length) return alert("No data available to download.");

    const { jsPDF } = await import("jspdf");
    await import("jspdf-autotable");

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Customers", 14, 22);

    const tableColumn = ["S. No.", "Customer", "Email", "Phone No.", "Workflow", "Date", "Stage"];
    const tableRows = filteredCustomers.map((c, index) => [
      index + 1,
      c.customer_name,
      c.email_id,
      c.phone_number,
      c.workflow,
      c.created_at ? new Date(c.created_at).toLocaleDateString() : "NA",
      c.stage,
    ]);

    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 30 });
    doc.save("Customers.pdf");
  }

  const columns = [
    { label: "S. No.", render: (item, i) => (currentPage - 1) * pageSize + i + 1 },
{
  label: "Customer",
  width: "200px",
  render: (item) => {
    const LIMIT = 12;
    const text = item.customer_name || "N/A";
    const rowKey = `cust-${item.customer_id}`;

    const showReadMore = text.length > LIMIT;
    const isExpanded = expandedRows[rowKey];

    return (
      <div className="flex items-center gap-1 max-w-[180px] whitespace-normal break-words">
        <span
          className="text-blue-600 cursor-pointer whitespace-normal break-words"
          onClick={() => handleCustomerClick(item)}
        >
          {isExpanded || !showReadMore
            ? text
            : text.substring(0, LIMIT)}
        </span>

        {/* Expand Button */}
        {showReadMore && !isExpanded && (
          <button
            className="text-blue-600 text-xs font-medium"
            onClick={(e) => {
              e.stopPropagation(); // prevents triggering row click
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

    { label: "Email", key: "email_id" },
    { label: "Phone no.", key: "phone_number" },
{
  label: "Workflow",
  render: (item) => {
    const workflowName = item.workflow || "";
    const workflowId = item.workflow_id ? ` ${item.workflow_id}` : "";
    return workflowName + workflowId;
  }
},

    { label: "Date", render: (item) => (item.created_at ? item.created_at.split("T")[0] : "NA") },
    {
      label: "Stage",
      render: (item) => {
        const colorClass = STAGE_COLORS[item.stage] || "text-gray-600 bg-gray-100";
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {item.stage}
          </span>
        );
      },
    },
  ];
  // Handle clicking "Edit" on a customer
  const handleEditClick = (customer) => {
    setNewCustomer({
      customer_name: customer.customer_name || "",
      phone_number: customer.phone_number || "",
      email_id: customer.email_id || "",
      address: customer.address || "",
      country: customer.country || "",
      state: customer.state || "",
      city: customer.city || "",
      pincode: customer.pincode || "",
      tan_number: customer.tan_number || "",
      gst_number: customer.gst_number || "",
      pan_no: customer.pan_no || "",
    });
    setIsEditMode(true);
    setIsPopupOpen(true);
    setCurrentCustomerIndex(
      customers.findIndex((c) => c.customer_id === customer.customer_id)
    );
  };

  const actions = [
    { label: "Edit", icon: EditIcon, onClick: handleEditClick, color: "text-blue-500", show: true },
    { label: "Delete", icon: DeleteIcon, onClick: handleDeleteCustomer, color: "text-red-500", show: true },
    { label: "Flag", icon: FlagIcon, onClick: handleFlagCustomer, color: "text-orange-500", show: true },
  ];

  // useEffect(() => {
  //   fetchCustomers([CUSTOMER_STAGES.PENDING, CUSTOMER_STAGES.RESUBMITTED]);
  // }, [fetchCustomers]);
  useEffect(() => {
    const initializeComponent = async () => {
      // ✅ Single fetch for both stages instead of two sequential calls
      const res = await fetchCustomers([
        CUSTOMER_STAGES.PENDING,
        CUSTOMER_STAGES.RESUBMITTED,
      ]);
      if (res?.success && Array.isArray(res.data)) {
        const sorted = res.data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setFilteredCustomers(sorted);
      } else {
        setFilteredCustomers([]);
      }
    };

    initializeComponent();
  }, [fetchCustomers]);


  useEffect(() => setCurrentPage(1), [filterState]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-blue-600 text-xl font-semibold">Loading...</div>
      </div>
    );


  // ---------- RENDER ----------
  return (
    <div className="flex flex-col overflow-hidden w-full">
      {/* Filters + Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <CustomerFilters  
          filtersConfig={filtersConfig}
          filterState={filterState}
          setFilterState={setFilterState}
        />

        <div className="flex gap-2">
          <button onClick={handleDownloadExcel} className="flex items-center justify-center">
            <img src={excelIcon} alt="Excel" className="w-6 h-6" />
          </button>
          <button onClick={handleDownloadPDF} className="flex items-center justify-center">
            <img src={pdfIcon} alt="PDF" className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto hide-scrollbar h-[75vh] rounded-lg relative">
        <CustomerTable
          data={paginatedCustomers}
          columns={columns}
          currentPage={currentPage}
          pageSize={pageSize}
          actions={actions}
        />

        {totalPages > 0 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              className="w-[32px] h-[32px] border border-blue-500 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              &lt;
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
              &gt;
            </button>
          </div>
        )}
      </div> {/* ✅ closes overflow div properly */}


      {/* ✅ Move modals OUTSIDE of table container */}
      <CustomerFormModal
        isOpen={isPopupOpen}
        isEditMode={isEditMode}
        newCustomer={newCustomer}
        onChange={handleChange}
        onmobileChange={handlemobileChange}
        onEmailChange={handleEmailChange}
        onInputChange={handleInputChange}
        onSubmit={handleEditSubmit}
        onClose={() => {
          setIsPopupOpen(false);
          resetForm();
        }}
        errorMessage={errorMessage}
        mobileError={mobileError}
        emailError={emailError}
        gstError={gstError}
        panError={panError}
        handleCountryChange={(e) =>
          setNewCustomer({ ...newCustomer, country: e.target.value, state: "", city: "" })
        }
        handleStateChange={(e) =>
          setNewCustomer({ ...newCustomer, state: e.target.value, city: "" })
        }
        handleCityChange={(e) =>
          setNewCustomer({ ...newCustomer, city: e.target.value })
        }
        Country={Country}
        State={State}
        City={City}
      />

      {isDetailModalOpen && (
        <CustomerInfoModal
          isOpen={isDetailModalOpen}
          customer={selectedCustomer}
          onClose={() => setIsDetailModalOpen(false)}
        />
      )}
      {/* ✅ Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={() => {
          if (pendingAction) pendingAction();
          setShowConfirmModal(false);
        }}
        title="Are you sure?"
        message="Please confirm to continue."
        icon="!"
      />

      {/* ✅ Message Modal */}
      <MessageModal
        message={message}
        type={messageType}
        setMessage={setMessage}
      />

    </div>

  );
};


export default SubmitApprovalTab;
