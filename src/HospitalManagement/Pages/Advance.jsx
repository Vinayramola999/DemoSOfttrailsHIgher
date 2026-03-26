import React, { useState, useEffect } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import {
  createAdvanceType,
  getAdvanceTypes,
} from "../api/Service";
import { useNavigate } from "react-router-dom";

const Advance = () => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({ name: "", description: "" });
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(9);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [advanceToInactivate, setAdvanceToInactivate] = useState(null);
  // Change status handler (mock, replace with API if available)
  const handleChangeStatus = async (advance, newStatus) => {
    setLoading(true);
    setError("");
    try {
      // TODO: Replace with API call if available, e.g. updateAdvanceTypeStatus(advance.id, newStatus)
      // For now, update locally
      setAdvances(prev => prev.map(a => a.id === advance.id ? { ...a, status: newStatus } : a));
      setStatusDropdown(null);
      setShowInactiveModal(false);
      setAdvanceToInactivate(null);
    } catch {
      setError("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all advance types on mount
  useEffect(() => {
    setLoading(true);
    getAdvanceTypes()
      .then(data => {
        setAdvances(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Add Advance Type - open confirm modal first
  const handleAddAdvanceType = (e) => {
    e.preventDefault();
    setError("");
    if (!advanceForm.name.trim()) {
      setError("Advance type name is required.");
      return;
    }
    const payload = {
      name: advanceForm.name.trim(),
      description: advanceForm.description.trim(),
      status: "ACTIVE",
    };
    setPendingPayload(payload);
    setShowConfirmModal(true);
  };

  const confirmAddAdvanceType = async () => {
    if (!pendingPayload) return;
    setShowConfirmModal(false);
    setLoading(true);
    setError("");
    try {
      await createAdvanceType(pendingPayload);
      // Refresh list
      const updated = await getAdvanceTypes();
      setAdvances(updated);
      // close add modal and reset form
      setShowAddModal(false);
      setAdvanceForm({ name: "", description: "" });
      // show success modal
      setShowSuccessModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPendingPayload(null);
    }
  };

  // Filter advances by search and date
  const filteredAdvances = advances.filter(adv => {
    const matchesSearch =
      adv.name.toLowerCase().includes(search.toLowerCase()) ||
      (adv.description || "").toLowerCase().includes(search.toLowerCase());
    let matchesDate = true;
    if (fromDate) {
      matchesDate = new Date(adv.createdAt) >= new Date(fromDate);
    }
    if (toDate) {
      matchesDate = matchesDate && new Date(adv.createdAt) <= new Date(toDate);
    }
    return matchesSearch && matchesDate;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredAdvances.length / rowsPerPage));
  const paginatedAdvances = filteredAdvances.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate]);

  // Clamp currentPage if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  return (
    <div className="bg-[#FAFBF7] mb-4 mt-2">
      {/* Tabs (Charge/Advance/Discount) - match ChargeList.jsx */}
      <div className="flex items-center border-b border-gray-300 cursor-pointer">
        <button
          className={`px-8 py-2 text-sm font-medium cursor-pointer transition-colors ${window.location.pathname.includes("/charge-list") ? "bg-white text-black border border-gray-300 border-b-transparent rounded-t-lg" : "bg-gray-300 text-black hover:bg-gray-200 mb-1 rounded-lg border border-gray-300"}`}
          style={!window.location.pathname.includes("/charge-list") ? { marginRight: '8px' } : {}}
          onClick={() => navigate("/HospitalManagement/charge-list")}
        >
          Charge
        </button>
        <div className="flex items-center ml-2 space-x-4">
          <button
            className={`px-8 py-2 text-sm font-medium cursor-pointer transition-colors ${window.location.pathname.includes("/advance") ? "bg-white text-black border border-gray-300 border-b-transparent rounded-t-lg" : "bg-gray-300 text-black hover:bg-gray-200 rounded-lg"}`}
            onClick={() => navigate("/HospitalManagement/advance")}
          >
            Advance
          </button>
          <button
            className={`px-8 py-2 text-sm font-medium cursor-pointer transition-colors ${window.location.pathname.includes("/discount") ? "bg-white text-black border border-gray-300 border-b-transparent rounded-t-lg" : "bg-gray-300 text-black hover:bg-gray-200 mb-1 rounded-lg"}`}
            onClick={() => navigate("/HospitalManagement/discount")}
          >
            Discount
          </button>
        </div>
      </div>

      {/* Header - Figma: Add Advance left, Excel/PDF top right */}
      <div className="flex items-center mt-2 mb-2">
        <button
          className="bg-blue-700 hover:bg-blue-800 text-white cursor-pointer rounded-xl shadow flex items-center justify-center gap-2 w-[163px] h-[40px] opacity-100"
          onClick={() => setShowAddModal(true)}
        >
          <span className="text-xl">+</span> Add Advance
        </button>
      </div>
      {/* Add Advance Modal */}
      {showAddModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/30">
          <div className="flex relative flex-col p-6 w-full max-w-2xl bg-white rounded-xl shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center mt-2 mb-4">
              <h2
                className="text-[#00235A] font-[Inter] font-semibold cursor-pointer text-[16px] leading-[100%] tracking-normal"
                style={{
                  width: "146px",
                  height: "19px",
                  top: "18px",
                  left: "22px",
                  opacity: 1,
                }}
              >
                Add Advance Type
              </h2>
              {/* Close button - custom UI */}
              <button
                className="absolute top-3 right-3 rounded-full cursor-pointer hover:bg-gray-100"
                onClick={() => {
                  setShowAddModal(false);
                  setError("");
                }}
                aria-label="Close"
                type="button"
              >
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="15" fill="#FF3A3A" />
                  <path
                    d="M20.2426 11.7574L16 16M16 16L11.7574 20.2426M16 16L20.2426 20.2426M16 16L11.7574 11.7574"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-4" onSubmit={handleAddAdvanceType}>
              <div>
                <label className="block font-medium mb-1 text-base text-[#00235A]">
                  Advance Type Name
                </label>
                <input
                  type="text"
                  placeholder="Advance Type Name"
                  value={advanceForm.name}
                  onChange={(e) =>
                    setAdvanceForm((f) => ({ ...f, name: e.target.value }))
                  }
                  className="px-3 py-2 w-full text-base rounded-lg border border-gray-300 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1 text-base text-[#00235A]">
                  Description
                </label>
                <textarea
                  placeholder="Enter description"
                  value={advanceForm.description}
                  onChange={(e) =>
                    setAdvanceForm((f) => ({ ...f, description: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none min-h-[80px]"
                />
              </div>
              {error && (
                <div className="text-sm font-medium text-red-600">{error}</div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 mt-2">
                <button
                  type="submit"
                  className="bg-[#0e5ede] hover:bg-[#001D4C] text-white font-semibold rounded-lg w-[180px] h-[38px] text-base"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add"}
                </button>
                <button
                  type="button"
                  className="bg-white text-[#00235A] border border-[#00235A] font-semibold rounded-lg w-[180px] h-[38px] text-base hover:bg-gray-100"
                  onClick={() => {
                    setShowAddModal(false);
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Add Advance Modal (Figma - Tailwind) */}
      {showConfirmModal && (
        <div className="flex fixed inset-0 justify-center items-center backdrop-blur-sm z-60">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowConfirmModal(false)} />

          <div role="dialog" aria-modal="true" className="relative w-[365px]">
            <div className="flex flex-col items-center px-6 pt-6 pb-6 bg-white rounded-2xl border border-gray-200">

              <div className="w-[57.5px] h-[57.5px] rounded-full bg-[#005ae6] flex items-center justify-center mb-6">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="text-2xl font-semibold text-[#005ae6] mb-3">Add Advance Type?</h3>

              <p className="mb-6 text-sm text-center text-gray-600">Are you sure you want to add advance type?</p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-[160px] h-10 bg-white border border-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmAddAdvanceType}
                  disabled={loading}
                  className="w-[160px] h-10 bg-[#005ae6] hover:bg-[#0046c0] text-white rounded-md"
                >
                  {loading ? "Adding..." : "Confirm"}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Success modal (Figma style - Tailwind) */}
      {showSuccessModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm">
          <div className="absolute inset-0 bg-black opacity-30" onClick={() => setShowSuccessModal(false)} />

          <div role="dialog" aria-modal="true" className="relative w-[365px]">
            <div className="flex flex-col items-center px-6 pt-6 pb-6 bg-white rounded-2xl border border-gray-200">

              <div className="w-[57.5px] h-[57.5px] rounded-full bg-[#005ae6] flex items-center justify-center mb-6">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="text-2xl font-semibold text-[#005ae6] mb-3">Success</h3>

              <p className="mb-6 text-sm text-center text-gray-600">Advance type added successfully</p>

              <div className="flex justify-center w-full">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-[160px] h-10 bg-[#005ae6] hover:bg-[#0046c0] text-white rounded-md focus:outline-none"
                >
                  Continue
                </button>
              </div>

            </div>
          </div>
        </div>
      )}


      {/* Filters and Export Icons - match ChargeList.jsx style */}
      <div className="flex flex-col gap-2 items-center mb-4 md:flex-row">
        <input
          type="text"
          placeholder="Search"
          className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 md:w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex items-center w-full md:w-auto">
          <input
            type="date"
            className="px-2 py-2 text-sm rounded-lg border border-gray-300"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
          <span className="mx-1 text-gray-500">TO</span>
          <input
            type="date"
            className="px-2 py-2 text-sm rounded-lg border border-gray-300"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
        </div>
        <div className="flex gap-2 items-center ml-auto">
          <FaFileExcel
            className="text-green-600 cursor-pointer hover:text-green-800"
            size={24}
            title="Export to Excel"
            onClick={() => { /* TODO: Add Excel export logic */ }}
          />
          <FaFilePdf
            className="text-red-600 cursor-pointer hover:text-red-800"
            size={24}
            title="Export to PDF"
            onClick={() => { /* TODO: Add PDF export logic */ }}
          />
        </div>
      </div>

      {/* Table - updated UI to match Discount.jsx */}
      <div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mt-2">
        <div className="">
          <table className="min-w-full text-sm">
            <thead className="font-medium text-black border-b border-black">
              <tr className="h-12">
                <th className="px-3 py-3 text-left">S. No.</th>
                <th className="px-3 py-3 text-left">Advance Type</th>
                <th className="px-3 py-3 text-left">Date</th>
                <th className="px-3 py-3 text-left">Description</th>
                <th className="px-3 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="" />

              {loading && (
                <tr>
                  <td colSpan={5} className="py-6 text-center">Loading...</td>
                </tr>
              )}

              {!loading && filteredAdvances.length === 0 && (
                <tr><td colSpan={5} className="py-4 font-medium text-center text-gray-500">No advance types found.</td></tr>
              )}

              {!loading && paginatedAdvances.map((adv, idx) => (
                <tr
                  key={adv.id}
                  className="h-10 border-b transition hover:bg-gray-50 odd:bg-white even:bg-blue-100"
                >
                  <td className="px-2 py-2">{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                  <td className="px-2 py-2 font-semibold text-blue-600">{adv.name}</td>
                  <td className="px-2 py-2">{adv.createdAt ? new Date(adv.createdAt).toLocaleDateString() : "-"}</td>
                  <td className="px-2 py-2 max-w-xs">{adv.description || "-"}</td>
                  <td className="px-2 py-2">
                    <div className="relative">
                      {(() => {
                        // normalize status to handle null/undefined and case-insensitive values
                        const status = (adv.status || 'INACTIVE').toString().toUpperCase();
                        return (
                          <>
                            <button
                              className={`flex items-center gap-1 bg-transparent focus:outline-none cursor-pointer ${status === 'ACTIVE' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}
                              onClick={() => setStatusDropdown(prev => (prev === adv.id ? null : adv.id))}
                            >
                              {status === 'ACTIVE' ? 'Active' : 'Inactive'}
                              <span className="inline-block ml-1 align-middle">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="black" xmlns="http://www.w3.org/2000/svg">
                                  <polygon points="4,6 8,10 12,6" />
                                </svg>
                              </span>
                            </button>

                            {statusDropdown === adv.id && (
                              <div className="absolute left-1/2 z-10 mt-2 w-20 bg-white rounded border shadow -translate-x-1/2">
                                {status !== 'ACTIVE' && (
                                  <div
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#009A10] font-semibold text-xs"
                                    onClick={() => handleChangeStatus(adv, 'ACTIVE')}
                                  >
                                    Active
                                  </div>
                                )}
                                {status !== 'INACTIVE' && (
                                  <div
                                    className="px-4 py-2 cursor-pointer text-[#FF3A3A] font-semibold text-xs"
                                    onClick={() => {
                                      setAdvanceToInactivate(adv);
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex gap-2 justify-center items-center mt-2 text-xs">
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === 1 || filteredAdvances.length === 0 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || filteredAdvances.length === 0}
            aria-label="Previous page"
          >
            <span className="text-lg">&lt;</span>
          </button>
          <button
            className="flex justify-center items-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg shadow-md"
            disabled={filteredAdvances.length === 0}
            aria-label="Current page"
          >
            {filteredAdvances.length === 0 ? 0 : currentPage}
          </button>
          <span className="mx-1 font-semibold text-black">of</span>
          <button
            className="flex justify-center items-center w-8 h-8 font-bold text-blue-600 bg-white rounded-lg border border-blue-500 shadow-md"
            disabled
            aria-label="Total pages"
          >
            {filteredAdvances.length === 0 ? 0 : totalPages}
          </button>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === totalPages || filteredAdvances.length === 0 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || filteredAdvances.length === 0}
            aria-label="Next page"
          >
            <span className="text-lg">&gt;</span>
          </button>
        </div>
      </div>

      {/* Inactive Modal */}
      {showInactiveModal && (
        <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/30">
          <div className="p-6 w-full max-w-md bg-white rounded-xl shadow-lg">
            <h2 className="mb-2 text-xl font-bold">Inactive Advance Type</h2>
            <p className="mb-6">This will result in no further mapping however the existing mapping work interrupt.</p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-6 py-2 font-semibold rounded border"
                onClick={() => {
                  setShowInactiveModal(false);
                  setAdvanceToInactivate(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 font-semibold text-white bg-blue-600 rounded"
                onClick={async () => {
                  if (advanceToInactivate) {
                    await handleChangeStatus(advanceToInactivate, 'INACTIVE');
                  }
                  setShowInactiveModal(false);
                  setAdvanceToInactivate(null);
                }}
              >
                Inactive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Advance;
