import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModelManageList from '../Model/ModelManageList';
import { FaFileExcel, FaFilePdf, FaRegEdit, FaTrash, FaRegEye } from 'react-icons/fa';
import ChargeTabs from '../Components/ChargeTabs';
import { FaTimes } from 'react-icons/fa';
import {
  getActiveChargeTypes,
  addManageListItem,
  updateManageListItem,
  getaddManageListItem,
  getInventorySummary,
} from '../api/Service';
import { getActiveServices, getActiveConsumables } from '../api/Service';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import Success from "../Components/Success";

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
};

const ManageList = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [chargeTypes, setChargeTypes] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [consumableTypes, setConsumableTypes] = useState([]);
  const [selectedChargeType, setSelectedChargeType] = useState('');
  const [items, setItems] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    chargeTypeId: 0,
    name: '',
    uom: '',
    charge: 0,
    description: '',
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAlreadyAdmittedModal, setShowAlreadyAdmittedModal] = useState(false);
  const [alreadyAdmittedError,] = useState("");

  // Add these states:
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [showInactiveConfirm, setShowInactiveConfirm] = useState(false);
  const [rowToInactivate, setRowToInactivate] = useState(null);
  // (statusOptions removed — dropdown rendered inline)

  useEffect(() => {
    // Fetch ACTIVE charge types on mount
    getActiveChargeTypes()
      .then((types) => {
        // Only allow CHARGEABLE + ACTIVE
        const filtered = types.filter(t => t.status === "ACTIVE" && (t.category === "SERVICE" || t.category === "CONSUMABLE" || t.category === "CHARGEABLE"));
        setChargeTypes(filtered);
        if (filtered.length > 0) {
          setSelectedChargeType(filtered[0].name);
          setForm(prev => ({
            ...prev,
            chargeTypeId: filtered[0].id,

          }));
        }
      })
      .catch((err) => setError(err.message));

    // Fetch active services and consumables for modal selects
    getActiveServices()
      .then(data => setServiceTypes(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch services', err.message));

    getActiveConsumables()
      .then(data => setConsumableTypes(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch consumables', err.message));

    getInventorySummary()
      .then(data => setInventoryItems(Array.isArray(data) ? data : []))
      .catch(err => console.error('Failed to fetch inventory summary', err.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(""); // Clear previous error
    let chargeTypeId = null;
    if (selectedChargeType) {
      const selectedTypeObj = chargeTypes.find(type => type.name === selectedChargeType);
      if (selectedTypeObj) {
        chargeTypeId = selectedTypeObj.id;
      }
    }
    getaddManageListItem(chargeTypeId)
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) {
          setItems([]);
          setError("No records found from API.");
        } else {
          setItems(data);
        }
      })
      .catch((err) => {
        setItems([]);
        setError("API error: " + (err.message || "Unknown error"));
      })
      .finally(() => setLoading(false));
  }, [selectedChargeType, chargeTypes]);

  // Reset to page 1 when chargeType or items change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedChargeType, items.length]);

  // Clamp currentPage if it exceeds totalPages after items change
  const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Paginated items
  const paginatedItems = items.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const openAddModal = () => {
    // Always set chargeTypeId to a valid value (first active charge type)
    const firstActiveType = chargeTypes && chargeTypes.length > 0 ? chargeTypes[0] : null;
    setForm({
      id: 0,
      chargeTypeId: firstActiveType ? firstActiveType.id : '',
      chargeTypeName: firstActiveType ? firstActiveType.name : '',
      name: '',
      uom: '',
      charge: 0,
      description: '',
      itemId: '',
      status: 'ACTIVE',
    });
    setIsEdit(false);
    setShowModal(true);
  };

  const handleEdit = (row) => {
    setForm({
      id: row.id || 0,
      chargeTypeId: row.chargeTypeId || 0,
      chargeTypeName: row.chargeTypeName || selectedChargeType,
      name: row.name || '',
      uom: row.uom || '',
      charge: row.unitPrice || row.charge || 0,
      description: row.description || '',
      itemId: row.itemId || '',
      status: row.status || 'ACTIVE',
    });
    setIsEdit(true);
    setShowModal(true);
  };

  // Change status handler (updates locally; replace with API call if available)
  const handleChangeStatus = async (row, newStatus) => {
    setLoading(true);
    setError("");
    try {
      // Update locally for now. Replace with an API call if you have one like updateManageListStatus(row.id, newStatus)
      if (row && row.id !== undefined) {
        setItems(prev => prev.map(it => it.id === row.id ? { ...it, status: newStatus } : it));
      }
      setStatusDropdown(null);
      setShowInactiveConfirm(false);
      setRowToInactivate(null);
    } catch (err) {
      setError("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;
    // Numeric fields
    if (["id", "chargeTypeId", "quantity", "charge", "itemId", "serviceType", "consumableType"].includes(name)) {
      processedValue = value === '' ? '' : Number(value);
    }
    // If chargeTypeName is changed in modal, update selectedChargeType and chargeTypeId
    if (name === "chargeTypeName") {
      setSelectedChargeType(value);
      // Find chargeTypeId for selected chargeTypeName
      const selectedTypeObj = chargeTypes.find(type => type.name === value);
      setForm(prev => ({
        ...prev,
        chargeTypeName: value,
        chargeTypeId: selectedTypeObj ? selectedTypeObj.id : ''
      }));
    } else if (name === 'serviceType') {
      // user selected a specific service (id)
      const sel = serviceTypes.find(s => String(s.id) === String(value));
      setForm(prev => ({
        ...prev,
        serviceType: processedValue,
        consumableType: undefined,
        chargeTypeId: sel ? sel.id : processedValue,
        // keep chargeTypeName as the category label (Services) instead of the specific service name
        chargeTypeName: sel ? (sel.category && String(sel.category).toLowerCase().includes('consumable') ? 'Consumables' : 'Services') : prev.chargeTypeName
      }));
      if (sel) setSelectedChargeType(sel.category && String(sel.category).toLowerCase().includes('consumable') ? 'Consumables' : 'Services');
    } else if (name === 'consumableType') {
      // user selected a specific consumable (id)
      const sel = consumableTypes.find(c => String(c.id) === String(value));
      setForm(prev => ({
        ...prev,
        consumableType: processedValue,
        serviceType: undefined,
        chargeTypeId: sel ? sel.id : processedValue,
        // keep chargeTypeName as the category label (Consumables) instead of the specific consumable name
        chargeTypeName: sel ? (sel.category && String(sel.category).toLowerCase().includes('consumable') ? 'Consumables' : 'Services') : prev.chargeTypeName
      }));
      if (sel) setSelectedChargeType(sel.category && String(sel.category).toLowerCase().includes('consumable') ? 'Consumables' : 'Services');
    } else {
      setForm(prev => ({ ...prev, [name]: processedValue }));
    }
  };

  const handleSubmit = async (payloadOrEvent) => {
    // Accept payload from modal or event from form
    let payload;
    if (payloadOrEvent && typeof payloadOrEvent === 'object' && payloadOrEvent.preventDefault) {
      payloadOrEvent.preventDefault();
      // basic validation
      if (!form.name || !form.uom || form.charge === '' || form.charge === null || Number(form.charge) <= 0) {
        setError("Name, UOM, and Charge (>0) are required.");
        setLoading(false);
        return;
      }

      // Determine the selected detailed charge type (service/consumable) by id
      const detailedType = serviceTypes.find(s => Number(s.id) === Number(form.chargeTypeId))
        || consumableTypes.find(c => Number(c.id) === Number(form.chargeTypeId))
        || chargeTypes.find(ct => Number(ct.id) === Number(form.chargeTypeId));

      // Build base payload
      payload = {
        name: form.name,
        chargeTypeId: form.chargeTypeId ? Number(form.chargeTypeId) : '',
        unitPrice: Number(form.charge),
        uom: form.uom,
        description: form.description,
        status: form.status || 'ACTIVE',
      };

      if (form.chargeTypeName === 'Consumables' || (payload.chargeTypeName === 'Consumables') || (form.consumableType)) {
        payload.itemId = form.itemId ? Number(form.itemId) : undefined;
      }

      // Ensure chargeTypeId is present for API
      if (!payload.chargeTypeId) {
        setError('Charge Type is required.');
        setLoading(false);
        return;
      }
      // Remove fields that are undefined (but keep nulls for API)
      Object.keys(payload).forEach(
        key => payload[key] === undefined && delete payload[key]
      );
    } else {
      // Called from modal with payload — normalize fields to API shape
      payload = { ...payloadOrEvent };
      // backend expects unitPrice not charge
      if (payload.charge !== undefined) {
        payload.unitPrice = Number(payload.charge) || 0;
        delete payload.charge;
      }
      // Remove serviceType if present
      if (payload.serviceType !== undefined) delete payload.serviceType;
      if (payload.consumableType !== undefined) delete payload.consumableType;
      if (payload.chargeTypeName !== undefined) delete payload.chargeTypeName;

      if (payload.itemId !== undefined && payload.itemId !== '' && payload.itemId !== null) {
        payload.itemId = Number(payload.itemId);
      } else {
        delete payload.itemId;
      }
    }
    setLoading(true);
    setError('');
    // Ensure we don't send `id` in the request body. API expects id in URL for updates and none for creates.
    if (payload && payload.id !== undefined) delete payload.id;

    const selectedTypeObj = chargeTypes.find(type => type.name === (payload.chargeTypeName || form.chargeTypeName))
      || serviceTypes.find(s => Number(s.id) === Number(payload.chargeTypeId))
      || consumableTypes.find(c => Number(c.id) === Number(payload.chargeTypeId));
    try {
      if (isEdit) {
        // Pass id via URL/first param; body should not include id
        await updateManageListItem(form.id, payload);
      } else {
        await addManageListItem(null, payload);
      }
      // Always refresh table after add or edit
      const data = await getaddManageListItem(payload.chargeTypeId || (selectedTypeObj && selectedTypeObj.id));
      setItems(Array.isArray(data) ? data : []);
      if (selectedTypeObj && selectedTypeObj.name) setSelectedChargeType(selectedTypeObj.name);
      setShowModal(false);
      setShowConfirm(false);
      setShowSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = items.map((row, idx) => ({
      "S. No.": idx + 1,
      "Charge type": row.chargeTypeName || selectedChargeType,
      "Name": row.name,
      "Quantity": row.quantity,
      "UOM": row.uom,
      "Charge": row.charge,
      "Date": formatDate(row.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ManageList");
    XLSX.writeFile(workbook, "ManageList.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.text("Manage List", 40, 30);
    const tableColumn = ["S. No.", "Charge type", "Name", "Quantity", "UOM", "Charge", "Date"];
    const tableRows = items.map((row, idx) => [
      idx + 1,
      row.chargeTypeName || selectedChargeType,
      row.name,
      row.quantity,
      row.uom,
      row.charge,
      formatDate(row.createdAt),
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: 20, right: 20 },
      tableWidth: "auto"
    });
    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
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
    doc.save("ManageList.pdf");
  };

  // Status dropdown is handled inline in the table row (see render) —
  // Previously there was a handler which fetched available statuses; removed to keep UI consistent with Advance.jsx

  return (
    <div className="bg-[#FAFCF9]">
      {/* Tabs - match ChargeList UI */}
      <div className="flex items-center mt-2 border-b border-gray-300">
        <button
          className={`px-8 py-2 text-sm font-medium text-black bg-white rounded-t-lg border border-gray-300 transition-colors border-b-transparent`}
          style={{ marginRight: '8px' }}
          disabled
        >
          Charge Type
        </button>
        <button
          className={`px-8 py-2 mb-1 text-sm font-medium text-black bg-gray-300 rounded-lg transition-colors hover:bg-gray-200`}
          style={{ marginRight: '8px' }}
          onClick={() => navigate('/HospitalManagement/advance')}
        >
          Advance
        </button>
        <button
          className={`px-8 py-2 mb-1 text-sm font-medium text-black bg-gray-300 rounded-lg transition-colors hover:bg-gray-200`}
          onClick={() => navigate('/HospitalManagement/discount')}
        >
          Discount
        </button>
      </div>
      {/* Manage List and Charge Type tab buttons */}
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
              marginBottom: 1,
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
              padding: 0
            }}
          >
            Charge Type
          </span>
        </button>
        <button
          className="border-none focus:outline-none"
          style={{
            marginBottom: 1,
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
              padding: 0
            }}
          >
            Manage List
          </span>
        </button>

      </div>
      {/* Top Bar */}
      <div className="flex items-center mb-0">
        <button
          className="px-12 py-2 mr-2 text-white bg-blue-700 shadow rounded-xl hover:bg-blue-800 font-sm"
          onClick={openAddModal}
        >
          + Add List
        </button>
      </div>
      {/* Use ModelManageList for modal */}
      {showModal && (
        <ModelManageList
          showModal={showModal}
          setShowModal={setShowModal}
          showSuccess={showSuccess}
          setShowSuccess={setShowSuccess}
          showAlreadyAdmittedModal={showAlreadyAdmittedModal}
          setShowAlreadyAdmittedModal={setShowAlreadyAdmittedModal}
          alreadyAdmittedError={alreadyAdmittedError}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          handleSubmit={handleSubmit}
          form={form || {}}
          handleFormChange={handleFormChange}
          chargeTypes={chargeTypes || []}
          serviceTypes={serviceTypes || []}
          consumableTypes={consumableTypes || []}
          inventoryItems={inventoryItems || []}
          isEdit={isEdit}
        />
      )}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="relative flex flex-col items-center w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full">
                <span className="text-2xl font-bold text-white">?</span>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-blue-700">Manage Charge List ?</h2>
            <p className="mb-6 text-center text-gray-700">Are you sure you want to add manage charge list?</p>
            <div className="flex w-full gap-4">
              <button
                className="flex-1 py-2 font-medium text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Filters */}
      <div className="flex items-center gap-4 mt-1 mb-1">
        {/* Search */}
        <div className="relative" style={{ width: 350 }}>
          <span className="absolute text-gray-400 -translate-y-1/2 left-3 top-1/2">
            <svg width="18" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
          </span>
          <input
            placeholder="Search"
            className="w-full h-10 p-1 text-base bg-white border border-gray-300 rounded-lg shadow-sm pl-9 focus:outline-none"
          />
        </div>
        {/* Date range */}
        <div className="flex items-center">
          <input
            type="date"
            className="h-10 px-3 py-2 text-base text-gray-900 border border-gray-300 rounded-lg"
            style={{ width: 150 }}
            placeholder="dd-mm-yyyy"
          />
          <span className="mx-2 text-base font-bold text-gray-700">TO</span>
          <input
            type="date"
            className="h-10 px-3 py-2 text-base text-gray-900 border border-gray-300 rounded-lg"
            style={{ width: 150 }}
            placeholder="dd-mm-yyyy"
          />
        </div>
        {/* Export buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            className="flex items-center justify-center p-1 rounded-lg shadow-sm hover:bg-gray-100"
            style={{ width: 24, height: 24 }}
            title="Export to Excel"
            onClick={exportToExcel}
          >
            <FaFileExcel size={28} className="text-green-600" />
          </button>
          <button
            type="button"
            className="flex items-center justify-center p-1 rounded-lg shadow-sm hover:bg-gray-100"
            style={{ width: 24, height: 24 }}
            title="Export to PDF"
            onClick={exportToPDF}
          >
            <FaFilePdf size={28} className="text-red-500" />
          </button>
        </div>
      </div>

      {/* Table - updated UI to match Advance.jsx */}
      <div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mb-14 ">
        <div className="">
          <table className="min-w-full text-sm">
            <thead className="font-medium text-black border-b border-black">
              <tr className="h-12">
                <th className="px-3 py-3 text-left">S. No.</th>
                <th className="px-3 py-3 text-left">Charge type</th>
                <th className="px-3 py-3 text-left">Name</th>
                <th className="px-3 py-3 text-left">UOM</th>
                <th className="px-3 py-3 text-left">Charge</th>
                <th className="px-3 py-3 text-left">Date</th>
                <th className="px-3 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="" />

              {loading && (
                <tr>
                  <td colSpan={8} className="py-6 text-center">Loading...</td>
                </tr>
              )}

              {!loading && paginatedItems.length === 0 && (
                <tr><td colSpan={7} className="py-4 font-medium text-center text-gray-500">No records found.</td></tr>
              )}

              {!loading && paginatedItems.map((row, idx) => (
                <tr
                  key={row.id}
                  className="h-10 transition border-b hover:bg-gray-50 odd:bg-white even:bg-blue-100"
                >
                  <td className="px-2 py-2">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                  <td className="px-2 py-2">{row.chargeTypeName || selectedChargeType}</td>
                  <td className="px-2 py-2">{row.name}</td>
                  <td className="px-2 py-2">{row.uom}</td>
                  <td className="px-2 py-2">{formatCurrency(row.charge)}</td>
                  <td className="px-2 py-2">{formatDate(row.createdAt)}</td>
                  <td className="px-2 py-2">
                    <div className="relative">
                      {(() => {
                        const status = (row.status || 'INACTIVE').toString().toUpperCase();
                        return (
                          <>
                            <button
                              className={`flex items-center gap-1 bg-transparent focus:outline-none cursor-pointer ${status === 'ACTIVE' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}
                              onClick={() => setStatusDropdown(prev => (prev === row.id ? null : row.id))}
                              disabled={loadingStatus}
                            >
                              {status === 'ACTIVE' ? 'Active' : 'Inactive'}
                              <span className="inline-block ml-1 align-middle">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="black" xmlns="http://www.w3.org/2000/svg">
                                  <polygon points="4,6 8,10 12,6" />
                                </svg>
                              </span>
                            </button>

                            {statusDropdown === row.id && (
                              <div className="absolute z-10 w-20 mt-2 -translate-x-1/2 bg-white border rounded shadow left-1/2">
                                {status !== 'ACTIVE' && (
                                  <div
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#009A10] font-semibold text-xs"
                                    onClick={() => handleChangeStatus(row, 'ACTIVE')}
                                  >
                                    Active
                                  </div>
                                )}
                                {status !== 'INACTIVE' && (
                                  <div
                                    className="px-4 py-2 cursor-pointer text-[#FF3A3A] font-semibold text-xs"
                                    onClick={() => {
                                      setRowToInactivate(row);
                                      setShowInactiveConfirm(true);
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {/* Pagination Controls: Modern Small Style */}
      <div className="flex items-center justify-center gap-2 mt-6 text-xs">
        <button
          className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === 1 || totalPages === 1 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1 || totalPages === 1}
          aria-label="Previous page"
        >
          <span className="text-lg">&lt;</span>
        </button>
        <button
          className={`flex justify-center items-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg`}
          style={{ boxShadow: "0 2px 8px 0 rgba(24, 144, 255, 0.08)" }}
          disabled
        >
          {items.length === 0 ? 0 : currentPage}
        </button>
        <span className="mx-1 font-semibold text-black">of</span>
        <button
          className={`flex justify-center items-center w-8 h-8 font-bold text-blue-600 bg-white rounded-lg border border-blue-500`}
          style={{ boxShadow: "0 2px 8px 0 rgba(24, 144, 255, 0.08)" }}
          disabled
        >
          {items.length === 0 ? 0 : totalPages}
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
      <Success
        open={showSuccess}
        onContinue={() => setShowSuccess(false)}
        title="Success"
        message="Vendor added successfully. Now, proceed with the approval group process"
      />
      {showAlreadyAdmittedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="flex flex-col items-center w-full max-w-xs px-6 pb-6 bg-white shadow-xl pt-7 rounded-2xl">
            <div className="flex items-center justify-center mb-4 bg-red-600 rounded-full w-14 h-14">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h8M12 8v8" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold text-center text-red-700">Already Admitted</h2>
            <p className="text-base text-center text-gray-500 mb-7">
              {alreadyAdmittedError || "This patient is already admitted. Duplicate admission is not allowed."}
            </p>
            <button
              className="w-full py-2 text-base font-semibold text-white transition bg-blue-600 rounded-lg shadow hover:bg-blue-700"
              onClick={() => setShowAlreadyAdmittedModal(false)}
              type="button"
            >
              OK
            </button>
          </div>
        </div>
      )}
      {showInactiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
          <div className="relative flex flex-col items-center w-full max-w-sm p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full">
                <span className="text-2xl font-bold text-white">!</span>
              </div>
            </div>
            <h2 className="mb-2 text-xl font-bold text-red-700">Inactivate Item?</h2>
            <p className="mb-6 text-center text-gray-700">Are you sure you want to inactivate?</p>
            <button
              className="flex-1 py-2 font-medium text-white bg-red-600 rounded hover:bg-red-700"
              onClick={async () => {
                if (rowToInactivate) await handleChangeStatus(rowToInactivate, 'INACTIVE');
                setShowInactiveConfirm(false);
                setRowToInactivate(null);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageList;

