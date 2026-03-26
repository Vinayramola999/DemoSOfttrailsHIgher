import React, { useState, useEffect } from 'react';
import { FaFileExcel, FaFilePdf, FaCalendarAlt } from "react-icons/fa";
import { useNavigate, } from 'react-router-dom';
import { createChargeType, getChargeTypes } from '../api/Service';
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from 'sweetalert2';
import ModelChargeList from '../Model/ModelChargeList';
import Success from "../Components/Success";

const ChargeList = () => {
  // Top tab state for Charge/Advance/Discount
  const [activeTab, setActiveTab] = useState('Charge');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage,] = useState(8);

  const [charges, setCharges] = useState([]);
  // Removed unused form state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [, setError] = useState('');
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [chargeToInactivate, setChargeToInactivate] = useState(null);
  const [showAddChargeModal, setShowAddChargeModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tempFormData, setTempFormData] = useState(null);
  const [, setChargeTypeForm] = useState({
    category: "CHARGEABLE",
    name: "",
    description: "",
    workMode: "ONE_TIME",
    workModeLabel: "One Time",
    frequency: "",
    cycleDuration: "",
    checkInTime: "",
    checkoutTime: "",
    bufferTime: "",
    chargeAmountType: "Including Tax",
    taxPercentage: "",
    status: "ACTIVE"
  });
  // type-related states removed
  // const [description, setDescription] = useState('');
  const navigate = useNavigate();
  // const location = useLocation();


  // Fetch charge types from new API endpoint
  const fetchCharges = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getChargeTypes();
      setCharges(Array.isArray(data) ? data : (data.data || []));
    } catch {
      setError('An error occurred while fetching charges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharges();
  }, []);

  // Filter logic (search, status)
  const filteredCharges = charges.filter((charge) => {
    const matchesSearch =
      (charge.name && charge.name.toLowerCase().includes(search.toLowerCase())) ||
      (charge.description && charge.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter ? charge.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredCharges.length / rowsPerPage));
  const paginatedCharges = filteredCharges.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to page 1 when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, dateFrom, dateTo]);

  // Clamp currentPage if it exceeds totalPages after filtering
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStatusDropdown = (id) => {
    setStatusDropdown(prev => (prev === id ? null : id));
  };

  const handleChangeStatus = async (charge, newStatus) => {
    setLoading(true);
    setError('');
    try {
      // updateChargeTypeStatus removed; implement alternative logic or remove this block
      setError('Status update is not implemented.');
      await fetchCharges();
    } catch (err) {
      setError('Failed to update status.');
      await fetchCharges();
    } finally {
      setLoading(false);
    }
  };

  // Excel export handler
  const handleDownloadExcel = () => {
    const data = filteredCharges.map((charge, idx) => ({
      "S.No": idx + 1,
      "Charge": charge.name,
      "Description": charge.description,
      "Status": charge.status,
      "Created At": charge.createdAt
        ? new Date(charge.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Charges");
    XLSX.writeFile(wb, "charge_list.xlsx");
  };

  // Fixed PDF export handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.text("Charge List", 40, 30);
    const tableColumn = [
      "S.No",
      "Charge",
      "Description",
      "Status",
      "Created At"
    ];
    const tableRows = filteredCharges.map((charge, idx) => [
      idx + 1,
      charge.name,
      charge.description,
      charge.status,
      charge.createdAt
        ? new Date(charge.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-',
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] },
      styles: { fontSize: 10 },
    });
    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }
    doc.save("charge_list.pdf");
  };

  const handleInitiateAdd = (formData) => {
    setTempFormData(formData);
    setShowAddChargeModal(false);
    setShowConfirm(true);
  };

  const handleConfirmAdd = async () => {
    if (!tempFormData) return;
    const formData = tempFormData;

    // Build payload strictly matching API documentation for SERVICE
    // Helper to format time as HH:mm (for LocalTime expected by backend)
    const formatLocalTime = (timeStr) => {
      if (!timeStr) return undefined;
      const s = String(timeStr).trim();
      // If it already looks like ISO duration containing hours/minutes e.g. "PT16H32M" or "PT16H32M:00:00"
      const ptMatch = s.match(/PT(\d+)H(\d+)M/);
      if (ptMatch) {
        const hh = ptMatch[1].padStart(2, "0");
        const mm = ptMatch[2].padStart(2, "0");
        return `${hh}:${mm}`;
      }
      // If simple HH:mm or HH:mm:ss
      if (s.includes(":")) {
        const parts = s.split(":");
        const hh = parts[0].padStart(2, "0");
        const mm = (parts[1] || "00").padStart(2, "0");
        return `${hh}:${mm}`;
      }
      // If numeric hour only
      if (!isNaN(s)) {
        return `${String(s).padStart(2, "0")}:00`;
      }
      // Fallback: return original string
      return s;
    };

    // Helper to format bufferTime as ISO-8601 duration (PTxxM)
    const formatBufferTime = (bufferStr) => {
      if (!bufferStr) return undefined;
      // If already starts with PT, return as is
      if (bufferStr.startsWith("PT")) return bufferStr;
      // If format is "mm:ss" or "HH:mm", convert to minutes
      const parts = bufferStr.split(":");
      if (parts.length === 2) {
        // If HH:mm, convert to total minutes
        const mins = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
        return `PT${mins}M`;
      }
      // If just a number, treat as minutes
      if (!isNaN(bufferStr)) {
        return `PT${parseInt(bufferStr, 10)}M`;
      }
      return bufferStr;
    };

    // Ensure inventoryType matches backend enum values (FINITE or INFINITE)
    const formatInventoryType = (val) => {
      if (val === undefined || val === null) return undefined;
      const v = String(val).trim().toUpperCase();
      if (v === "FINITE" || v === "INFINITE") return v;
      // handle common variants (e.g., 'finite', 'Finite')
      if (v.includes("FINITE")) return "FINITE";
      if (v.includes("INFINITE")) return "INFINITE";
      return undefined;
    };

    // Helper to determine exclusiveGroup based on charge name and description
    const determineExclusiveGroup = (name, description) => {
      const combinedText = `${name} ${description}`.toLowerCase();
      if (combinedText.includes('icu')) return 'ICU';
      if (combinedText.includes('bed')) return 'BED';
      if (combinedText.includes('room')) return 'ROOM';
      return 'NONE';
    };

    // Accept tax value from either `taxPercentage` or `taxPercent` (modal uses taxPercent)
    // Normalize when provided but do not force a default tax percentage.
    const rawTax = formData.taxPercentage !== undefined ? formData.taxPercentage : formData.taxPercent;
    const normalizedTax = rawTax !== undefined && rawTax !== '' ? Number(rawTax) : undefined;

    // Build payload mostly from incoming formData so a JSON like the example is sent as-is,
    // but normalize a few fields (times, enums) to match backend expectations.
    const payload = {
      name: formData.name,
      description: formData.description,
      // Normalize category (accept SERVICE or SERVICES variants)
      category: formData.category
        ? (String(formData.category).toUpperCase() === 'SERVICES' ? 'SERVICE' : String(formData.category).toUpperCase())
        : 'SERVICE',
      workMode: formData.workMode || 'RECURRING',
      frequency: formData.frequency ? String(formData.frequency).toUpperCase() : undefined,
      cycleDuration: formData.cycleDuration,
      // Normalize local time strings to HH:mm when present
      // Some modals provide `checkoutTime` but backend expects `checkInTime`.
      // Prefer explicit `checkInTime`, otherwise fall back to `checkoutTime`.
      checkInTime: formData.checkInTime
        ? formatLocalTime(formData.checkInTime)
        : formData.checkoutTime
          ? formatLocalTime(formData.checkoutTime)
          : undefined,
      checkoutTime: formData.checkoutTime ? formatLocalTime(formData.checkoutTime) : undefined,
      // Keep bufferTime if already ISO duration (PT...), otherwise try to format
      bufferTime: formData.bufferTime ? formatBufferTime(formData.bufferTime) : undefined,
      // taxApplicable: prefer explicit boolean, otherwise infer from presence of tax value
      taxApplicable: typeof formData.taxApplicable === 'boolean' ? formData.taxApplicable : (normalizedTax !== undefined),
      // Determine exclusiveGroup based on charge name/description
      exclusiveGroup: formData.exclusiveGroup || determineExclusiveGroup(formData.name || '', formData.description || ''),
    };

    // Only include taxPercentage when provided
    if (normalizedTax !== undefined) payload.taxPercentage = normalizedTax;

    // Ensure inventoryType is present and normalized
    const invType = formatInventoryType(formData.inventoryType) || 'FINITE';
    payload.inventoryType = invType;
    try {
      setLoading(true);
      await createChargeType(payload);
      setShowConfirm(false);
      setShowSuccess(true);
      fetchCharges(); // Refresh the list
    } catch (error) {
      Swal.fire('Error', 'Failed to add charge type. Please try again.', 'error');
      console.error("Error adding charge type:", error);
      // Handle error (show message, etc.)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 bg-gray-50">
      {/* Top Button Group: Charge, Advance, Discount */}
      <div className="flex items-center border-b border-gray-300">
        <button
          className={`px-8 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === "Charge"
            ? "bg-white text-black border border-gray-300 border-b-transparent rounded-t-lg"
            : "bg-gray-300 text-black hover:bg-gray-200 rounded-lg border border-gray-300"
            }`}
          style={activeTab !== "Charge" ? { marginRight: '8px' } : {}}
          onClick={() => setActiveTab("Charge")}
        >
          Charge
        </button>
        <div className="flex items-center ml-2 space-x-4">
          <button
            className={`px-8 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === "Advance"
              ? "bg-white text-black border border-gray-300 border-b-transparent rounded-t-lg"
              : "bg-gray-300 text-black hover:bg-gray-200 mb-1 rounded-lg"
              }`}
            onClick={() => {
              setActiveTab("Advance");
              navigate("/HospitalManagement/advance");
            }}
          >
            Advance
          </button>
          <button
            className={`px-8 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === "Discount"
              ? "bg-white text-black border border-gray-300 border-b-transparent rounded-t-lg"
              : "bg-gray-300 text-black hover:bg-gray-200 mb-1 rounded-lg"
              }`}
            onClick={() => {
              setActiveTab("Discount");
              navigate("/HospitalManagement/discount");
            }}
          >
            Discount
          </button>
        </div>
      </div>


      {/* Tabs: Charge Type & Manage List */}
      <div className="flex items-center gap-2 mt-3 mb-2">
          <button
            className="border-none focus:outline-none"
            style={{
              width: 108,
              height: 32,
              borderRadius: 80,
              background: window.location.pathname.includes('/charge-list')
                ? 'linear-gradient(90deg, #005AE6 0%, #003280 100%)'
                : '#fff',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              border: window.location.pathname.includes('/charge-list') ? 'none' : '1px solid #e5e7eb'
            }}
            onClick={() => navigate('/HospitalManagement/charge-list')}
          >
            <span
              style={{
                width: 70,
                height: 15,
                fontFamily: 'Inter',
                fontWeight: 500,
                fontStyle: 'Medium',
                fontSize: 10,
                lineHeight: '100%',
                letterSpacing: 0,
                color: window.location.pathname.includes('/charge-list') ? 'rgba(255,255,255,1)' : '#00235A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: "pointer"
              }}
            >
              Charge Type
            </span>
          </button>
          <button
            className="border-none focus:outline-none"
            style={{
              width: 108,
              height: 32,
              borderRadius: 80,
              background: window.location.pathname.includes('/manage-list')
                ? 'linear-gradient(90deg, #005AE6 0%, #003280 100%)'
                : '#fff',
              opacity: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              border: window.location.pathname.includes('/manage-list') ? 'none' : '1px solid #e5e7eb'
            }}
            onClick={() => navigate('/HospitalManagement/manage-list')}
          >
            <span
              style={{
                width: 70,
                height: 15,
                fontFamily: 'Inter',
                fontWeight: 500,
                fontStyle: 'Medium',
                fontSize: 12,
                lineHeight: '100%',
                letterSpacing: 0,
                color: window.location.pathname.includes('/manage-list') ? 'rgba(255,255,255,1)' : '#00235A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                cursor: "pointer"
              }}
            >
              Manage List
            </span>
          </button>

      </div>
      {/* Top Bar: Add Charge Type */}
      <div className="flex items-center justify-between mb-2">
        <button
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow flex items-center justify-center gap-2 px-10 py-1.5 cursor-pointer opacity-100"
          onClick={() => {
            setChargeTypeForm({
              category: "CHARGEABLE",
              name: "",
              description: "",
              workMode: "ONE_TIME",
              frequency: "",
              cycleDuration: "",

              checkoutTime: "",
              bufferTime: "",
              chargeAmountType: "Including Tax",
              taxPercentage: "",
              status: "ACTIVE",
              type: "SERVICES_CONSUMABLE"
            });
            setShowAddChargeModal(true);
          }}
        >
          <span className="text-xl">+</span> Add New
        </button>
      </div>
      {/* Filters and Export */}
      <div className="flex items-center gap-4 mt-2 mb-2">
        {/* Search */}
        <div className="relative" style={{ width: 450 }}>
          <span className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2">
            <svg width="20" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </span>
          <input
            type="text"
            placeholder="Search"
            className="w-full p-2 text-base bg-white border border-gray-300 rounded-lg shadow-sm pl-9 focus:outline-none"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {/* Date range */}
        <div className="flex items-center">
          <input
            type="date"
            className="px-3 py-2 text-base text-gray-900 border border-gray-300 rounded-lg"
            style={{ width: 150 }}
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            placeholder="dd-mm-yyyy"
          />
          <span className="mx-2 text-base font-bold text-gray-700">TO</span>
          <input
            type="date"
            className="px-3 py-2 text-base text-gray-900 border border-gray-300 rounded-lg"
            style={{ width: 150 }}
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            placeholder="dd-mm-yyyy"
          />
        </div>
        <select
          className="px-3 py-2 text-base text-gray-900 border border-gray-300 rounded-lg shadow-sm md:w-32 focus:outline-none"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            className="flex items-center justify-center p-1 rounded-lg shadow-sm hover:bg-gray-100"
            style={{ width: 24, height: 24 }}
            title="Export to Excel"
            onClick={handleDownloadExcel}
          >
            <FaFileExcel size={28} className="text-green-600" />
          </button>
          <button
            type="button"
            className="flex items-center justify-center p-1 rounded-lg shadow-sm hover:bg-gray-100"
            style={{ width: 24, height: 24 }}
            title="Export to PDF"
            onClick={handleDownloadPDF}
          >
            <FaFilePdf size={28} className="text-red-500" />
          </button>
        </div>
      </div>
      {/* Table - updated UI to match Discount.jsx */}
      <div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mt-2">
        <div className="">
          <table className="min-w-full text-sm">
            <thead className="font-medium text-black border-b border-black">
              <tr className="h-12">
                <th className="px-3 py-3 text-left">S. No.</th>
                <th className="px-3 py-3 text-left">Name</th>
                <th className="px-3 py-3 text-left">Category</th>
                <th className="px-3 py-3 text-left">Inventory Type</th>
                <th className="px-3 py-3 text-left">Tax %</th>
                <th className="px-3 py-3 text-left">Description</th>
                <th className="px-3 py-3 text-left">Date</th>
                <th className="px-3 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="" />
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-6 text-center">Loading...</td>
                </tr>
              ) : filteredCharges.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-4 font-medium text-center text-gray-500">No charges found.</td>
                </tr>
              ) : (
                paginatedCharges.map((charge, idx) => (
                  <tr
                    key={charge.id}
                    className="h-10 transition border-b hover:bg-gray-50 odd:bg-white even:bg-blue-100"
                  >
                    <td className="px-2 py-2">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                    <td className="px-2 py-2 font-semibold text-blue-600">{charge.name}</td>
                    <td className="px-2 py-2">{charge.category || '-'}</td>
                    <td className="px-2 py-2">{charge.inventoryType || '-'}</td>
                    <td className="px-2 py-2">{charge.taxPercentage !== undefined ? charge.taxPercentage : '-'}</td>
                    <td className="max-w-xs px-2 py-2">
                      {charge.description && charge.description.length > 100 && !expanded[charge.id] ? (
                        <>
                          {charge.description.slice(0, 100)}...{' '}
                          <span
                            className="font-medium text-blue-600 underline cursor-pointer"
                            onClick={() => toggleExpand(charge.id)}
                          >
                            Read more....
                          </span>
                        </>
                      ) : charge.description && charge.description.length > 100 ? (
                        <>
                          {charge.description}{' '}
                          <span
                            className="font-medium text-blue-600 underline cursor-pointer"
                            onClick={() => toggleExpand(charge.id)}
                          >
                            Show less
                          </span>
                        </>
                      ) : (
                        charge.description
                      )}
                    </td>
                    <td className="px-2 py-2">
                      {charge.createdAt
                        ? new Date(charge.createdAt).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })
                        : '-'}
                    </td>
                    <td className="px-2 py-2">
                      <div className="relative">
                        {(() => {
                          const status = (charge.status || 'INACTIVE').toString().toUpperCase();
                          return (
                            <>
                              <button
                                className={`flex items-center gap-1 bg-transparent focus:outline-none cursor-pointer ${status === 'ACTIVE' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}
                                onClick={() => handleStatusDropdown(charge.id)}
                              >
                                {status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                <span className="inline-block ml-1 align-middle">
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="black" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="4,6 8,10 12,6" />
                                  </svg>
                                </span>
                              </button>

                              {statusDropdown === charge.id && (
                                <div className="absolute z-10 w-20 mt-2 -translate-x-1/2 bg-white border rounded shadow left-1/2">
                                  {status !== 'ACTIVE' && (
                                    <div
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#009A10] font-semibold text-xs"
                                      onClick={() => handleChangeStatus(charge, 'ACTIVE')}
                                    >
                                      Active
                                    </div>
                                  )}
                                  {status !== 'INACTIVE' && (
                                    <div
                                      className="px-4 py-2 cursor-pointer text-[#FF3A3A] font-semibold text-xs"
                                      onClick={() => {
                                        setChargeToInactivate(charge);
                                        setShowInactiveModal(true);
                                        setStatusDropdown(null);
                                      }}
                                    >
                                      Inactive
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2 mt-2 text-xs">
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === 1 || totalPages === 1 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || totalPages === 1}
            aria-label="Previous page"
          >
            <span className="text-lg">&lt;</span>
          </button>
          <button
            className="flex items-center justify-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg shadow-md"
            disabled={filteredCharges.length === 0}
          >
            {filteredCharges.length === 0 ? 0 : currentPage}
          </button>
          <span className="mx-1 font-semibold text-black">of</span>
          <button
            className="flex items-center justify-center w-8 h-8 font-bold text-blue-600 bg-white border border-blue-500 rounded-lg shadow-md"
            disabled
          >
            {filteredCharges.length === 0 ? 0 : totalPages}
          </button>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === totalPages || totalPages === 1 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 1}
            aria-label="Next page"
          >
            <span className="text-lg">&gt;</span>
          </button>
        </div>
      </div>
      {/* Inactive Modal */}
      {showInactiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-xl">
            <h2 className="mb-2 text-xl font-bold">Inactive Service</h2>
            <p className="mb-6">This will result in no further mapping however the existing mapping work interrupt.</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-2 font-semibold border rounded"
                onClick={() => {
                  setShowInactiveModal(false);
                  setChargeToInactivate(null);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-[#005AE6] text-white px-6 py-2 rounded-lg hover:bg-[#004bb5] transition duration-300 font-semibold"
                onClick={async () => {
                  if (chargeToInactivate) {
                    await handleChangeStatus(chargeToInactivate, 'INACTIVE');
                  }
                  setShowInactiveModal(false);
                  setChargeToInactivate(null);
                }}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Charge Type Modal */}
      {showAddChargeModal && (
        <ModelChargeList
          open={showAddChargeModal}
          onClose={() => setShowAddChargeModal(false)}
          onSubmit={handleInitiateAdd}
        />
      )}
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="relative flex flex-col items-center w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                <span className="text-2xl font-bold text-white">?</span>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-blue-700">Add Charge Type ?</h2>
            <p className="mb-6 text-center text-gray-700">Are you sure you want to add this charge type?</p>
            <div className="flex w-full gap-4">
              <button
                className="flex-1 py-2 font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                onClick={handleConfirmAdd}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Success Modal */}
      {showSuccess && (
        <Success
          open={showSuccess}
          onContinue={() => setShowSuccess(false)}
          title="Success"
          message="Manage charge list added successfully"
        />
      )}
    </div>
  );
};

export default ChargeList;
