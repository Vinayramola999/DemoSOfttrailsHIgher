import React, { useState, useEffect } from "react";
import { showCustomAlert } from "./components/CustomAlert";
import { Eye } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import LeadsTable from "./components/LeadsTable";

const baseUrl = process.env.REACT_APP_URL_sales || '';

// Reject Modal
const RejectModal = ({ onClose, onSubmit }) => {
  const [reason, setReason] = React.useState("");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[420px]">
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Reject</h2>
          <button className="text-red-500 hover:text-red-700" onClick={onClose}>
            <FaTimes size={18} />
          </button>
        </div>
        <div className="p-5">
          <label className="block mb-2 font-medium">Reason</label>
          <textarea
            className="w-full border rounded px-3 py-2 mb-6"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason"
          />
          <div className="flex justify-center gap-4 mt-2">
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              onClick={() => onSubmit(reason)}
            >
              Submit
            </button>
            <button
              className="border border-gray-500 text-black px-6 py-2 rounded hover:bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Popup Component
const ActionPopup = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[420px]">
        {/* Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">Email Quotation</h2>
          <button className="text-red-500 hover:text-red-700" onClick={onClose}>
            <FaTimes size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 border rounded-xl bg-red-50 mx-4 my-4">
          <p className="text-base font-semibold mb-1">
            Connect your Personal and Work emails
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Send Invoice, Quotation etc. emails from your own email address.
          </p>

          {/* Email Options */}
          <div className="space-y-3">
            <button className="w-full flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-50 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="48"
                height="48"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#4caf50"
                  d="M45,16.2l-5,2.75l-5,4.75L35,40h7c1.657,0,3-1.343,3-3V16.2z"
                ></path>
                <path
                  fill="#1e88e5"
                  d="M3,16.2l3.614,1.71L13,23.7V40H6c-1.657,0-3-1.343-3-3V16.2z"
                ></path>
                <polygon
                  fill="#e53935"
                  points="35,11.2 24,19.45 13,11.2 12,17 13,23.7 24,31.95 35,23.7 36,17"
                ></polygon>
                <path
                  fill="#c62828"
                  d="M3,12.298V16.2l10,7.5V11.2L9.876,8.859C9.132,8.301,8.228,8,7.298,8h0C4.924,8,3,9.924,3,12.298z"
                ></path>
                <path
                  fill="#fbc02d"
                  d="M45,12.298V16.2l-10,7.5V11.2l3.124-2.341C38.868,8.301,39.772,8,40.702,8h0 C43.076,8,45,9.924,45,12.298z"
                ></path>
              </svg>
              <span>Connect to Gmail</span>
            </button>
            <button className="w-full flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-50 transition">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                x="0px"
                y="0px"
                width="48"
                height="48"
                viewBox="0 0 48 48"
              >
                <path
                  fill="#03A9F4"
                  d="M21,31c0,1.104,0.896,2,2,2h17c1.104,0,2-0.896,2-2V16c0-1.104-0.896-2-2-2H23c-1.104,0-2,0.896-2,2V31z"
                ></path>
                <path
                  fill="#B3E5FC"
                  d="M42,16.975V16c0-0.428-0.137-0.823-0.367-1.148l-11.264,6.932l-7.542-4.656L22.125,19l8.459,5L42,16.975z"
                ></path>
                <path
                  fill="#0277BD"
                  d="M27 41.46L6 37.46 6 9.46 27 5.46z"
                ></path>
                <path
                  fill="#FFF"
                  d="M21.216,18.311c-1.098-1.275-2.546-1.913-4.328-1.913c-1.892,0-3.408,0.669-4.554,2.003c-1.144,1.337-1.719,3.088-1.719,5.246c0,2.045,0.564,3.714,1.69,4.986c1.126,1.273,2.592,1.91,4.378,1.91c1.84,0,3.331-0.652,4.474-1.975c1.143-1.313,1.712-3.043,1.712-5.199C22.869,21.281,22.318,19.595,21.216,18.311z M19.049,26.735c-0.568,0.769-1.339,1.152-2.313,1.152c-0.939,0-1.699-0.394-2.285-1.187c-0.581-0.785-0.87-1.861-0.87-3.211c0-1.336,0.289-2.414,0.87-3.225c0.586-0.81,1.368-1.211,2.355-1.211c0.962,0,1.718,0.393,2.267,1.178c0.555,0.795,0.833,1.895,0.833,3.31C19.907,24.906,19.618,25.968,19.049,26.735z"
                ></path>
              </svg>
              <span>Connect to Outlook</span>
            </button>
            <button className="w-full flex items-center gap-2 border rounded-lg px-4 py-2 hover:bg-gray-50 transition">
              <img
                src="https://www.svgrepo.com/show/349376/domain.svg"
                alt="domain"
                className="w-5 h-5"
              />
              <span>Custom Domain</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuotationApproval = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showActionPopup, setShowActionPopup] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  // Removed showSuccessModal state, only SweetAlert2 will be used
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [expandedRow, setExpandedRow] = useState(null);

  const itemsPerPage = 25;

  const filterQuotations = () => {
    return data.filter((row) => {
      const date = new Date(row.quotation.quotation_date);
      const matchesSearch =
        row.quotation.quotation_no
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        row.quotation_for.customer_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        row.quotation.status?.toLowerCase().includes(searchQuery.toLowerCase());
      const inDateRange =
        (!startDate || date >= new Date(startDate)) &&
        (!endDate || date <= new Date(endDate));
      return matchesSearch && inDateRange;
    });
  };

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `${baseUrl}/salesmanagement/quotation/allquotation`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setData(response.data?.data || []);
      } catch (error) {
        console.error("Error fetching quotations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  const handleStatusUpdate = async (quotationId, newStatus, reason) => {
    try {
      const token = sessionStorage.getItem("token");
      let body = { status: newStatus };
      if (typeof arguments !== "undefined") {
      }
      // Accepts optional reason as third argument
      if (typeof reason !== "undefined" && reason) {
        body.reason = reason;
        console.log("Reject reason:", reason);
      }
      const res = await axios.put(
        `${baseUrl}/salesmanagement/quotation/status/${quotationId}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (res.data.success) {
        toast.success(`Quotation ${newStatus} successfully!`);
        // Refresh list after status change
        try {
          // call fetchQuotations defined in useEffect scope
          await (async () => {
            const token2 = sessionStorage.getItem("token");
            const resp = await axios.get(`${baseUrl}/salesmanagement/quotation/allquotation`, { headers: { Authorization: `Bearer ${token2}` } });
            setData(resp.data?.data || []);
          })();
        } catch (e) {
          console.warn('Failed to refresh quotations after status update', e);
        }
      } else {
        toast.error("Something went wrong!");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status!");
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const filteredRows = filterQuotations();
  const currentRows = filteredRows.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / itemsPerPage));

  const calculateAmount = (item) => {
    return item.quantity * item.unit_rate * (1 + item.tax_percent / 100);
  };

  return (
    <div>
      <div className=" h-[73vh]">
        {/* If no quotation is selected → show table */}
        {!selectedQuotation ? (
          <>
            {/* FILTERS */}
        <div className="flex gap-2 items-center">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border rounded-md pl-10 pr-4 h-12 py-2 w-[250px]"
            />
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                />
              </svg>
            </span>
          </div>

          {/* Date Range Filter */}
          <div className="flex justify-center bg-white items-center m-3 h-12 border rounded-md">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 sm:w-30 rounded-2xl"
            />
            <span className="text-gray-600 px-2">TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 sm:w-30 rounded-2xl"
            />
          </div>

          <button
            onClick={() => {
              setSearchQuery("");
              setStartDate("");
              setEndDate("");
              setCurrentPage(1);
            }}
            className="bg-gray-200 text-black px-4 py-2 h-12 rounded-md hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>

            {/* Table */}
            <div className="flex-col">
              {loading ? (
                <p className="p-4">Loading...</p>
              ) : (
                <LeadsTable
                  columns={[
                    { key: 'sno', label: 'S. No.', render: (_, idx) => `${indexOfFirst + idx + 1}.`, cellClass: 'font-medium text-gray-700' },
                    { key: 'date', label: 'Date', render: (r) => new Date(r.quotation.quotation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                    { key: 'quotation_no', label: 'Quotation No.', render: (r) => r.quotation.quotation_no },
                    { 
                      key: 'quotation_for', 
                      label: 'Quotation For', 
                      render: (r) => {
                          const name = r.quotation_for?.customer_name || '-';
                          const isExpanded = expandedRow === `customer_${r.quotation.quotation_id}`;
                          return (
                            <div className="text-center whitespace-normal break-words max-w-[150px] mx-auto">
                              {isExpanded ? name : (name.length > 20 ? `${name.slice(0, 20)}...` : name)}
                              {name.length > 20 && (
                                <button
                                  className="ml-2 text-blue-600 font-medium hover:text-blue-800"
                                  onClick={() => setExpandedRow(isExpanded ? null : `customer_${r.quotation.quotation_id}`)}
                                >
                                  {isExpanded ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          );
                        },
                        cellClass: 'text-center whitespace-normal',
                    },
                    { key: 'amount', label: 'Amount', render: (r) => `₹${r.quotation.total_amount}` },
                    { key: 'status', label: 'Status', render: (r) => {
                      let statusColor = 'bg-orange-100 text-orange-800';
                      if (r.quotation.status === 'Approved') statusColor = 'bg-green-100 text-green-800';
                      else if (r.quotation.status === 'Rejected') statusColor = 'bg-red-100 text-red-800';
                      
                      return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{r.quotation.status}</span>;
                    }}
                  ]}
                  data={currentRows}
                  indexOffset={indexOfFirst}
                  rowKey={(r, i) => r.quotation.quotation_id || i}
                  actionsRenderer={({ row }) => (
                    <button
                      className="text-gray-600 hover:text-blue-600"
                      onClick={() => setSelectedQuotation(row)}
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                  )}
                  page={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => setCurrentPage(p)}
                  visibleRowsPerPage={6}
                />
              )}
            </div>
          </>
        ) : (
          // Quotation Detail UI
          <div>
            {/* BACK BUTTON */}
            {/* TOP ACTION BAR */}
         <div className="flex items-center justify-between bg-white p-4 border-b rounded-t">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedQuotation(null)}
                className="text-gray-600 hover:text-blue-600"
              >
                <FaArrowLeft />
              </button>
              <div className="text-sm text-gray-500">
                Higher India Private Limited &gt; Quotation &gt;{" "}
                <span className="text-gray-800 font-semibold">
                  {selectedQuotation?.quotation?.quotation_no}
                </span>
              </div>
            </div>
          </div>

            {/* QUOTATION PREVIEW */}
            <div className="flex items-center justify-between bg-gray px-4 py-3 border-b">
              </div>
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-blue-600 mb-4">
                Quotation
              </h2>

              {/* Header */}
              <div className="flex justify-between mb-6">
                <div>
                  <p>
                    <strong>Quotation No:</strong>{" "}
                    {selectedQuotation.quotation.quotation_no}
                  </p>
                  <p>
                    <strong>Quotation Date:</strong>{" "}
                    {new Date(
                      selectedQuotation.quotation.quotation_date
                    ).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Validity Date:</strong>{" "}
                    {new Date(
                      selectedQuotation.quotation.validity_date
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>RFP ID:</strong>{" "}
                    {selectedQuotation.quotation.rfp_id}
                  </p>
                </div>
              </div>

              {/* Quotation From / To */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Quotation From
                  </h3>
                  <p>{selectedQuotation.quotation_from.business_name}</p>
                  <p>
                    {selectedQuotation.quotation_from.city},{" "}
                    {selectedQuotation.quotation_from.state} -{" "}
                    {selectedQuotation.quotation_from.postal_code}
                  </p>
                  <p>GSTIN - {selectedQuotation.quotation_from.gstin}</p>
                  <p>PAN - {selectedQuotation.quotation_from.pan}</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <h3 className="font-semibold text-gray-700 mb-2">
                    Quotation For
                  </h3>
                  <p>{selectedQuotation.quotation_for.customer_name}</p>
                  <p>
                    {selectedQuotation.quotation_for.city},{" "}
                    {selectedQuotation.quotation_for.state} -{" "}
                    {selectedQuotation.quotation_for.postal_code}
                  </p>
                  <p>GSTIN - {selectedQuotation.quotation_for.gstin}</p>
                  <p>PAN - {selectedQuotation.quotation_for.pan}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="max-h-[400px] overflow-y-auto mb-6 border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-blue-600 text-white sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-center">Quantity</th>
                    <th className="p-2 text-center">Unit Rate</th>
                    <th className="p-2 text-center">HSN/SAC</th>
                    <th className="p-2 text-center">IGST (%)</th>
                    <th className="p-2 text-center">CGST (%)</th>
                    <th className="p-2 text-center">SGST (%)</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuotation.items.map((item, i) => (
                    <tr key={i} className="even:bg-blue-50">
                      <td className="p-2">
                        {item.item_name}
                        <p className="text-xs text-gray-500">
                          {item.description}
                        </p>
                      </td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-center">₹{item.unit_rate}</td>
                      <td className="p-2 text-center">{item.hsn_sac || "-"}</td>
                      <td className="p-2 text-center">
                        {item.igst ?? "0.00"} %
                      </td>
                      <td className="p-2 text-center">
                        {item.cgst ?? "0.00"} %
                      </td>
                      <td className="p-2 text-center">
                        {item.sgst ?? "0.00"} %
                      </td>
                      <td className="p-2 text-right">
                        ₹{calculateAmount(item).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>

              {/* Totals */}
              <div className="text-right space-y-1 mb-6">
                <p>
                  <strong>Tax Amount:</strong> ₹
                  {(
                    parseFloat(selectedQuotation.quotation.total_amount) -
                    parseFloat(selectedQuotation.quotation.total_taxable)
                  ).toFixed(2)}
                </p>
                <p>
                  <strong>Taxable Amount:</strong> ₹
                  {selectedQuotation.quotation.total_taxable}
                </p>
                <p className="text-xl font-bold text-gray-800">
                  Total (INR): ₹{selectedQuotation.quotation.total_amount}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-6">
                <button
                  onClick={() => setShowRejectModal(true)}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg shadow hover:bg-red-600"
                >
                  Reject
                </button>
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
                >
                  Approve
                </button>
                {/* APPROVE MODAL */}
                {showApproveModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-[420px] p-8 flex flex-col items-center">
                      <div className="flex flex-col items-center mb-4">
                        <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                          <span className="text-white text-4xl font-bold">
                            ?
                          </span>
                        </div>
                        <h2 className="text-3xl font-bold text-blue-700 text-center mb-2">
                          Quotation Indent
                          <br />
                          request ?
                        </h2>
                      </div>
                      <p className="text-lg text-gray-600 text-center mb-8">
                        Are you sure you want to approve Quotation Indent
                        request?
                      </p>
                      <div className="flex gap-6 w-full justify-center">
                        <button
                          className="border border-gray-400 text-black px-8 py-3 rounded-lg bg-white text-lg"
                          onClick={() => {
                            setShowApproveModal(false);
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold"
                          onClick={async () => {
                            setShowApproveModal(false);
                            handleStatusUpdate(
                              selectedQuotation.quotation.quotation_id,
                              "Approved"
                            );
                            setSelectedQuotation(null);
                            await showCustomAlert({
                              type: "success",
                              title: "Success",
                              message: "Quotation Approved successfully",
                              confirmText: "Continue",
                            });
                          }}
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* SUCCESS MODAL REMOVED - SweetAlert2 is now used for success popup */}
              </div>
            </div>
          </div>
        )}
        {/* ACTION POPUP */}
        {showActionPopup && (
          <ActionPopup
            onClose={() => {
              setShowActionPopup(false);
            }}
          />
        )}
        {/* REJECT MODAL */}
        {showRejectModal && (
          <RejectModal
            onClose={() => {
              setShowRejectModal(false);
            }}
            onSubmit={(reason) => {
              handleStatusUpdate(
                selectedQuotation.quotation.quotation_id,
                "Rejected",
                reason
              );
              setShowRejectModal(false);
              setSelectedQuotation(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default QuotationApproval;
