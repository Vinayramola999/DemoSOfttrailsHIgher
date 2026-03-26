import React, { useState, useEffect } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import { createDiscount, getDiscounts } from "../api/Service";
import { useNavigate } from "react-router-dom";

const Button = ({ onClick, children, className, Icon, ...props }) => (
  <button
    onClick={onClick}
    className={`bg-[#005AE6] text-white px-6 py-2 rounded-lg hover:bg-[#004bb5] transition duration-300 flex items-center gap-2 ${className}`}
    {...props}
  >
    {Icon && <Icon />}
    {children}
  </button>
);

const Discount = () => {
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [discountForm, setDiscountForm] = useState({ name: "", description: "", percentage: "" });
  const [discounts, setDiscounts] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(12);
  const [statusDropdown, setStatusDropdown] = useState(null);
  const [showInactiveModal, setShowInactiveModal] = useState(false);
  const [discountToInactivate, setDiscountToInactivate] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPayload, setPendingPayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Change status handler (mock, replace with API if available)
  const handleChangeStatus = async (discount, newStatus) => {
    try {
      // TODO: Replace with API call if available, e.g. updateDiscountStatus(discount.id, newStatus)
      // For now, update locally
      setDiscounts(prev => prev.map(d => d.id === discount.id ? { ...d, status: newStatus } : d));
      setStatusDropdown(null);
      setShowInactiveModal(false);
      setDiscountToInactivate(null);
    } catch {
      setError("Failed to update status.");
    }
  };

  useEffect(() => {
    getDiscounts()
      .then(data => setDiscounts(data))
      .catch(() => setDiscounts([]));
  }, []);

  // Filter discounts by search and date (moved out of render to match Advance.jsx behavior)
  const filteredDiscounts = discounts.filter(d => {
    const matchesSearch =
      (d.name && d.name.toLowerCase().includes(search.toLowerCase())) ||
      ((d.description || "").toLowerCase().includes(search.toLowerCase()));
    let matchesDate = true;
    if (fromDate) matchesDate = new Date(d.createdAt) >= new Date(fromDate);
    if (toDate) matchesDate = matchesDate && new Date(d.createdAt) <= new Date(toDate);
    return matchesSearch && matchesDate;
  });

  const totalPages = Math.max(1, Math.ceil(filteredDiscounts.length / rowsPerPage));
  const paginatedDiscounts = filteredDiscounts.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Page display helpers
  const displayTotalPages = filteredDiscounts.length === 0 ? 0 : totalPages;
  const displayCurrentPage = filteredDiscounts.length === 0 ? 0 : currentPage;
  const prevDisabled = filteredDiscounts.length === 0 || currentPage === 1;
  const nextDisabled = filteredDiscounts.length === 0 || currentPage === totalPages;

  // Reset page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, fromDate, toDate]);

  // Clamp currentPage if it exceeds totalPages
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  // Confirm add discount handler
  const confirmAddDiscount = async () => {
    if (!pendingPayload) return;
    setShowConfirmModal(false);
    setLoading(true);
    setError("");
    try {
      await createDiscount(pendingPayload);
      const data = await getDiscounts();
      setDiscounts(data);
      setShowSuccessModal(true);
      setDiscountForm({ name: "", description: "", percentage: "" });
      setShowAddModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPendingPayload(null);
    }
  };

  return (
    <div className="bg-[#FAFBF7] mt-2">
      {/* Tabs (Charge/Advance/Discount) - match ChargeList.jsx */}
      <div className="flex items-center border-b border-gray-300">
        <button
          className={`px-8 py-2 text-sm font-medium transition-colors ${window.location.pathname.includes("/charge-list") ? "bg-white text-black border border-gray-300 border-b-transparent rounded-t-lg" : "bg-gray-300 text-black hover:bg-gray-200 mb-1 rounded-lg border border-gray-300 mr-2"}`}
          onClick={() => navigate("/HospitalManagement/charge-list")}
        >
          Charge
        </button>
        <div className="flex items-center ml-2 space-x-4 ">
          <button
            className={`px-8 py-2 text-sm font-medium transition-colors ${window.location.pathname.includes("/advance") ? "bg-white text-black border border-gray-300 border-b-transparent rounded-t-lg" : "bg-gray-300 text-black hover:bg-gray-200 mb-1 rounded-lg"}`}
            onClick={() => navigate("/HospitalManagement/advance")}
          >
            Advance
          </button>
          <button
            className={`px-8 py-2 text-sm font-medium transition-colors ${window.location.pathname.includes("/discount") ? "bg-white text-black border border-gray-300 border-b-transparent rounded-t-lg" : "bg-gray-300 text-black hover:bg-gray-200 rounded-lg"}`}
            onClick={() => navigate("/HospitalManagement/discount")}
          >
            Discount
          </button>
        </div>
      </div>

      {/* Header - Figma: Add Advance left, Excel/PDF top right */}
      <div className="flex items-center mt-2 mb-2">
        <Button
          className="w-[170px] h-[40px] justify-center shadow opacity-100"
          onClick={() => setShowAddModal(true)}
        >
          <span className="text-xl">+</span> Add Discount
        </Button>
      </div>
      {/* Add Discount Modal - UI matched to Advance.jsx */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="relative flex flex-col w-full max-w-2xl p-4 bg-white shadow-lg rounded-xl">
            {/* Header */}
            <div className="flex items-center justify-between mt-2 mb-4">
              <h2
                className="text-[#00235A] font-[Inter] font-semibold text-[16px] leading-[100%] tracking-normal"
              >
                Add Discount
              </h2>
              {/* Close button - custom UI */}
              <button
                className="absolute rounded-full top-3 right-3 hover:bg-gray-100"
                onClick={() => { setShowAddModal(false); setError(""); }}
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
            <form className="flex flex-col gap-4" onSubmit={e => {
              e.preventDefault();
              setError("");
              // Validate payload
              const payload = {
                name: discountForm.name.trim(),
                description: discountForm.description.trim(),
                percentage: Number(discountForm.percentage),
                status: "ACTIVE"
              };
              if (!payload.name) {
                setError("Discount type name is required.");
                return;
              }
              if (isNaN(payload.percentage) || payload.percentage < 0 || payload.percentage > 100) {
                setError("Discount percentage must be between 0 and 100.");
                return;
              }
              // open confirm modal instead of immediate submit
              setPendingPayload(payload);
              setShowConfirmModal(true);
            }}>
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className="block font-medium mb-1 text-base text-[#00235A]">Discount Type</label>
                  <input
                    type="text"
                    placeholder="Discount Type Name"
                    value={discountForm.name}
                    onChange={e => setDiscountForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg focus:outline-none"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-medium mb-1 text-base text-[#00235A]">Discount Percentage</label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="%"
                      value={discountForm.percentage || ""}
                      onChange={e => setDiscountForm(f => ({ ...f, percentage: e.target.value }))}
                      className="w-full px-3 py-2 pr-8 text-base border border-gray-300 rounded-lg focus:outline-none"
                      min="0"
                      max="100"
                      required
                    />
                    <span className="absolute text-base text-gray-400 -translate-y-1/2 right-3 top-1/2">%</span>
                  </div>
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1 text-base text-[#00235A]">Description</label>
                <textarea
                  placeholder="Enter description"
                  value={discountForm.description}
                  onChange={e => setDiscountForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:outline-none min-h-[80px]"
                />
              </div>
              {error && (
                <div className="text-sm font-medium text-red-600">{error}</div>
              )}
              {/* Buttons */}
              <div className="flex gap-4 mt-2">
                <Button
                  type="submit"
                  className="w-[180px] h-[38px] text-base font-semibold justify-center"
                >
                  Add
                </Button>
                <button
                  type="button"
                  className="bg-white text-[#00235A] border border-[#00235A] font-semibold rounded-lg w-[180px] h-[38px] text-base hover:bg-gray-100"
                  onClick={() => { setShowAddModal(false); setError(""); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Add Discount Modal  */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)} />

          <div role="dialog" aria-modal="true" className="relative w-[365px]">
            <div className="flex flex-col items-center px-6 pt-6 pb-6 bg-white border border-gray-200 rounded-2xl">

              <div className="w-[57.5px] h-[57.5px] rounded-full bg-[#005ae6] flex items-center justify-center mb-6">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="text-2xl font-semibold text-[#005ae6] mb-3">Add Discount?</h3>

              <p className="mb-6 text-sm text-center text-gray-600">Are you sure you want to add discount?</p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  className="w-[160px] h-10 bg-white border border-gray-200 text-gray-800 rounded-md"
                >
                  Cancel
                </button>
                <Button
                  type="button"
                  onClick={confirmAddDiscount}
                  disabled={loading}
                  className="w-[160px] h-10 justify-center"
                >
                  {loading ? "Adding..." : "Confirm"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Success modal (Figma style - Tailwind) */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />

          <div role="dialog" aria-modal="true" className="relative w-[365px]">
            <div className="flex flex-col items-center px-6 pt-6 pb-6 bg-white border border-gray-200 rounded-2xl">

              <div className="w-[57.5px] h-[57.5px] rounded-full bg-[#005ae6] flex items-center justify-center mb-6">
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="text-2xl font-semibold text-[#005ae6] mb-3">Success</h3>

              <p className="mb-6 text-sm text-center text-gray-600">Discount added successfully</p>

              <div className="flex justify-center w-full">
                <Button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-[160px] h-10 justify-center focus:outline-none"
                >
                  Continue
                </Button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Filters and Export Icons - match ChargeList.jsx style */}
      <div className="flex flex-col items-center gap-2 mb-4 md:flex-row">
        <input
          type="text"
          placeholder="Search"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg md:w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex items-center w-full gap-2 md:w-auto">
          <input
            type="date"
            className="px-2 py-2 text-sm border border-gray-300 rounded-lg"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
          />
          <span className="mx-1 text-gray-500">TO</span>
          <input
            type="date"
            className="px-2 py-2 text-sm border border-gray-300 rounded-lg"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
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

      {/* Table - updated UI with Original Columns/Logic */}
      <div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mt-2">
        <div className="">
          <table className="min-w-full text-sm">
            <thead className="font-medium text-black border-b border-black">
              <tr className="h-12">
                <th className="px-3 py-3 text-left">S. No.</th>
                <th className="px-3 py-3 text-left">Discount Type</th>
                <th className="px-3 py-3 text-left">Percentage</th>
                <th className="px-3 py-3 text-left">Date</th>
                <th className="px-3 py-3 text-left">Description</th>
                <th className="px-3 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="" />
              {paginatedDiscounts.length > 0 ? (
                paginatedDiscounts.map((discount, index) => (
                  <tr
                    key={discount.id}
                    className="h-10 transition border-b hover:bg-gray-50 odd:bg-white even:bg-blue-100"
                  >
                    <td className="px-2 py-2">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-2 py-2 font-semibold text-blue-600">
                      {discount.name}
                    </td>
                    <td className="px-2 py-2">{discount.percentage}%</td>
                    <td className="px-2 py-2">{discount.createdAt ? new Date(discount.createdAt).toLocaleDateString() : "-"}</td>
                    <td className="px-2 py-2">{discount.description}</td>
                    <td className="px-2 py-2">
                      <div className="relative">
                        {(() => {
                          const status = (discount.status || 'INACTIVE').toString().toUpperCase();
                          return (
                            <>
                              <button
                                className={`flex items-center gap-1 bg-transparent focus:outline-none cursor-pointer ${status === 'ACTIVE' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}`}
                                onClick={() => setStatusDropdown(prev => (prev === discount.id ? null : discount.id))}
                              >
                                {status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                <span className="inline-block ml-1 align-middle">
                                  <svg width="16" height="16" viewBox="0 0 16 16" fill="black" xmlns="http://www.w3.org/2000/svg">
                                    <polygon points="4,6 8,10 12,6" />
                                  </svg>
                                </span>
                              </button>

                              {statusDropdown === discount.id && (
                                <div className="absolute z-10 w-20 mt-2 -translate-x-1/2 bg-white border rounded shadow left-1/2">
                                  {status !== 'ACTIVE' && (
                                    <div
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-[#009A10] font-semibold text-xs"
                                      onClick={() => handleChangeStatus(discount, 'ACTIVE')}
                                    >
                                      Active
                                    </div>
                                  )}
                                  {status !== 'INACTIVE' && (
                                    <div
                                      className="px-4 py-2 cursor-pointer text-[#FF3A3A] font-semibold text-xs"
                                      onClick={() => {
                                        setDiscountToInactivate(discount);
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
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="py-4 font-medium text-center text-gray-500"
                  >
                    No discounts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-center gap-2 mt-2 text-xs">
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${prevDisabled ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={prevDisabled}
            aria-label="Previous page"
          >
            <span className="text-lg">&lt;</span>
          </button>
          <button
            className="flex items-center justify-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg shadow-md"
            disabled={filteredDiscounts.length === 0}
            aria-label="Current page"
          >
            {displayCurrentPage}
          </button>
          <span className="mx-1 font-semibold text-black">of</span>
          <button
            className="flex items-center justify-center w-8 h-8 font-bold text-blue-600 bg-white border border-blue-500 rounded-lg shadow-md"
            disabled
            aria-label="Total pages"
          >
            {displayTotalPages}
          </button>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${nextDisabled ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={nextDisabled}
            aria-label="Next page"
          >
            <span className="text-lg">&gt;</span>
          </button>
        </div>
      </div>

      {/* Inactive Modal */}
      {showInactiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white shadow-lg rounded-xl">
            <h2 className="mb-2 text-xl font-bold">Inactive Discount</h2>
            <p className="mb-6">This will result in no further mapping however the existing mapping work interrupt.</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-2 font-semibold border rounded"
                onClick={() => {
                  setShowInactiveModal(false);
                  setDiscountToInactivate(null);
                }}
              >
                Cancel
              </button>
              <Button
                className="justify-center font-semibold"
                onClick={async () => {
                  if (discountToInactivate) {
                    await handleChangeStatus(discountToInactivate, 'INACTIVE');
                  }
                  setShowInactiveModal(false);
                  setDiscountToInactivate(null);
                }}
              >
                Inactive
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Discount;
