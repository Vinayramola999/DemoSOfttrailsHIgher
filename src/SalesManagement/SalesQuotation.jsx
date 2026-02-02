import React, { useState, useEffect } from "react";
import axios from "axios";
import { Download, Pencil, Printer, Share2, Eye, History } from "lucide-react";
import { FaFunnelDollar, FaArrowLeft } from "react-icons/fa";
import { CiShare2 } from "react-icons/ci";
import LeadsTable from './components/LeadsTable';

import ShareQuotationPopup from './components/ShareQuotationPopup';
import NegotiationPopup from './components/NegotiationPopup';

const baseUrl = process.env.REACT_APP_URL_sales || '';

export default function QuotationListWithPreview() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [allQuotations, setAllQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showActionPopup, setShowActionPopup] = useState(false);

  const [shareQuotation, setShareQuotation] = useState(null);
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showQuotationHistory, setShowQuotationHistory] = useState(false);
  const [selectedRFP, setSelectedRFP] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [expandedRow, setExpandedRow] = useState(null);
  const [showNegotiationPopup, setShowNegotiationPopup] = useState(false);
  const [negotiationQuotation, setNegotiationQuotation] = useState(null);

  // Send handler used by ShareQuotationPopup
  const handleShareFromPopup = async (formData) => {
    try {
      const token = sessionStorage.getItem("token");
      const quotationId = shareQuotation?.quotation?.quotation_id || shareQuotation?.quotation_id;
      if (!quotationId) throw new Error("Missing quotation id");
      const url = `${baseUrl}/salesmanagement/quotation/send_quotation_mail/quotation_section/${quotationId}`;
      const config = { headers: { Authorization: token ? `Bearer ${token}` : undefined } };

      const response = await axios.post(url, formData, config);
      if (response.data?.success) {
        setShowShareSuccess(true);
      }
      return response;
    } catch (err) {
      console.error("Error sharing quotation:", err);
      throw err;
    }
  };

  // Fetch all quotations (exposed so other components can trigger a refresh)
  const fetchQuotations = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${baseUrl}/salesmanagement/quotation/allquotation`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllQuotations(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching quotations:", error);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const fetchHistory = async (rfpId) => {
    if (!rfpId) return;
    setHistoryLoading(true);
    try {
      // Using the IP provided by user for this specific endpoint as requested
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${baseUrl}/salesmanagement/quotation/history?rfp_id=${rfpId}`,
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );
      if (response.data && response.data.success) {
        setHistoryData(response.data.history || []);
      } else {
        setHistoryData([]);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistoryData([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const filterQuotations = () => {
    return allQuotations.filter((q) => {
      const date = new Date(q.quotation.quotation_date);
      const matchesSearch =
        q.quotation.quotation_no
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        q.quotation_for?.customer_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        q.quotation.status?.toLowerCase().includes(searchQuery.toLowerCase());
      const inDateRange =
        (!startDate || date >= new Date(startDate)) &&
        (!endDate || date <= new Date(endDate));
      return matchesSearch && inDateRange;
    });
  };

  const calculateAmount = (item) => {
    const subtotal = item.quantity * parseFloat(item.unit_rate || 0);
    const tax = (subtotal * parseFloat(item.tax_percent || 0)) / 100;
    return subtotal + tax;
  };

  return (
    <div>
      <div className="h-[73vh]">
        {!selectedQuotation ? (
          <>
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

            <div className="flex-col">
              {(() => {
                const filtered = filterQuotations();
                const indexOfLast = currentPage * itemsPerPage;
                const indexOfFirst = indexOfLast - itemsPerPage;
                const currentRows = filtered.slice(indexOfFirst, indexOfLast);
                const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

                return (
                  <LeadsTable
                    columns={[
                      { key: 'sno', label: 'S. No.', render: (_, idx) => `${indexOfFirst + idx + 1}.`, cellClass: 'font-medium text-gray-700' },
                      { key: 'date', label: 'Date', render: (q) => new Date(q.quotation.quotation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                      { key: 'quotation_no', label: 'Quotation No.', render: (q) => q.quotation.quotation_no },
                      { 
                        key: 'quotation_for', 
                        label: 'Quotation for', 
                        render: (q) => {
                          const name = q.quotation_for?.customer_name || '-';
                          const isExpanded = expandedRow === `customer_${q.quotation.quotation_id}`;
                          return (
                            <div className="text-center whitespace-normal break-words max-w-[150px] mx-auto">
                              {isExpanded ? name : (name.length > 20 ? `${name.slice(0, 20)}...` : name)}
                              {name.length > 20 && (
                                <button
                                  className="ml-2 text-blue-600 font-medium hover:text-blue-800"
                                  onClick={() => setExpandedRow(isExpanded ? null : `customer_${q.quotation.quotation_id}`)}
                                >
                                  {isExpanded ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </div>
                          );
                        },
                        cellClass: 'text-center whitespace-normal',
                      },
                      { key: 'amount', label: 'Amount', render: (q) => `₹${q.quotation.total_amount}` },
                      { key: 'status', label: 'Status', render: (q) => {
                        let statusColor = 'bg-orange-100 text-orange-800';
                        if (q.quotation.status === 'Approved') statusColor = 'bg-green-100 text-green-800';
                        else if (q.quotation.status === 'Rejected') statusColor = 'bg-red-100 text-red-800';
                        
                        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{q.quotation.status}</span>;
                      }}
                    ]}
                    data={currentRows}
                    indexOffset={indexOfFirst}
                    rowKey={(q) => q.quotation.quotation_id}
                    actionsRenderer={({ row: q }) => (
                      <div className="flex items-center justify-between gap-4">
                        <button
                          className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                          onClick={() => {
                            setNegotiationQuotation(q);
                            setShowNegotiationPopup(true);
                          }}
                          title="Negotiate"
                        >
                          Negotiate
                        </button>
                        <div className="flex items-center gap-3">
                          <button
                            className="text-gray-600 hover:text-blue-600"
                            onClick={() => setSelectedQuotation(q)}
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="text-gray-600 hover:text-green-600"
                            onClick={() => {
                              setSelectedRFP(q.quotation.rfp_id);
                              setShowQuotationHistory(true);
                              fetchHistory(q.quotation.rfp_id);
                            }}
                            title="Quotation History"
                          >
                            <History size={18} />
                          </button>
                          {q.quotation.status === 'Approved' && (
                            <button
                              className="text-black hover:text-blue-600"
                              onClick={() => {
                                setShareQuotation(q);
                                setShowActionPopup(true);
                              }}
                              title="Share"
                            >
                              <CiShare2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    page={currentPage}
                    totalPages={totalPages}
                    onPageChange={(p) => setCurrentPage(p)}
                    visibleRowsPerPage={6}
                  />
                );  
              })()}
            </div>
          </>
        ) : (
          <>
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

            <div className="flex items-center justify-between bg-gray px-4 py-3 border-b">
              <div className="flex gap-3">
                <button className="w-[110px] h-[40px] bg-white border border-gray-300 rounded flex items-center justify-center gap-2 text-gray-700 text-sm font-medium hover:bg-gray-100">
                  <Pencil size={16} /> Edit
                </button>
                <button className="w-[160px] h-[40px] bg-white border border-gray-300 rounded flex items-center justify-center gap-2 text-gray-700 text-sm font-medium hover:bg-gray-100">
                  <FaFunnelDollar size={16} /> Change Lead Status
                </button>
              </div>
              <div className="flex gap-3">
                <button className="w-[90px] h-[40px] bg-white border border-gray-300 rounded flex items-center justify-center gap-2 text-gray-700 text-sm font-medium hover:bg-gray-100">
                  <Printer size={16} /> Print
                </button>
                <button className="w-[110px] h-[40px] bg-white border border-gray-300 rounded flex items-center justify-center gap-2 text-gray-700 text-sm font-medium hover:bg-gray-100">
                  <Download size={16} /> Download
                </button>
                <button className="w-[90px] h-[40px] bg-white border border-gray-300 rounded flex items-center justify-center gap-2 text-gray-700 text-sm font-medium hover:bg-gray-100">
                  <Share2 size={16} /> Share
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded shadow-lg">
              <div className="flex justify-between mb-4">
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

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-100 p-4 rounded">
                  <h3 className="font-semibold">Quotation From</h3>
                  <p>{selectedQuotation.quotation_from.business_name}</p>
                  <p>
                    {selectedQuotation.quotation_from.city},{" "}
                    {selectedQuotation.quotation_from.state} -{" "}
                    {selectedQuotation.quotation_from.postal_code}
                  </p>
                  <p>GSTIN - {selectedQuotation.quotation_from.gstin}</p>
                  <p>PAN - {selectedQuotation.quotation_from.pan}</p>
                </div>
                <div className="bg-blue-100 p-4 rounded text-center">
                  <h3 className="font-semibold text-center">Quotation For</h3>
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

              <div className="max-h-[400px] overflow-y-auto mb-6 border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-blue-600 text-white sticky top-0">
                  <tr>
                    <th className="p-2">Item</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Unit Rate</th>
                    <th className="p-2">HSN/SAC</th>
                    <th className="p-2">IGST (%)</th>
                    <th className="p-2">CGST (%)</th>
                    <th className="p-2">SGST (%)</th>
                    <th className="p-2">Amount</th>
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

              <div className="text-right space-y-1">
                <p>
                  <strong>Total Tax:</strong> ₹
                  {(
                    parseFloat(selectedQuotation.quotation.total_amount) -
                    parseFloat(selectedQuotation.quotation.total_taxable)
                  ).toFixed(2)}
                </p>
                <p>
                  <strong>Taxable Amount:</strong> ₹
                  {selectedQuotation.quotation.total_taxable}
                </p>
                <p className="text-xl font-bold">
                  Total (INR): ₹{selectedQuotation.quotation.total_amount}
                </p>
              </div>
            </div>
          </>
        )}

        {showActionPopup && (
          <>
            <ShareQuotationPopup
              isOpen={showActionPopup}
              onClose={() => {
                setShowActionPopup(false);
                setShareQuotation(null);
              }}
              quotationData={shareQuotation || selectedQuotation}
              onShare={handleShareFromPopup}
            />

            {showShareSuccess && (
              <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[300px]">
                  <h2 className="text-lg font-semibold mb-4">Success!</h2>
                  <p>Email has been sent successfully.</p>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={() => {
                      setShowShareSuccess(false);
                      setShowActionPopup(false);
                      setShareQuotation(null);
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {showNegotiationPopup && (
          <NegotiationPopup
            isOpen={showNegotiationPopup}
            onClose={() => {
              setShowNegotiationPopup(false);
              setNegotiationQuotation(null);
            }}
            quotationData={negotiationQuotation}
            onSuccess={() => fetchQuotations()}
          />
        )}

        {showQuotationHistory && selectedRFP && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-11/12 md:w-3/4 lg:w-2/3 max-h-[80vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 pb-2 bg-white sticky top-0 z-10">
                <h2 className="text-xl font-bold text-gray-800">
                  Quotation History for RFP: <span className="ml-2">{selectedRFP}</span>
                </h2>
                <button
                  onClick={() => {
                    setShowQuotationHistory(false);
                    setSelectedRFP(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <span className="text-3xl">&times;</span>
                </button>
              </div>

              {/* Modal Body - Quotation History Table */}
              <div className="p-6 pt-2 overflow-auto min-h-0 max-h-[400px]">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 sticky top-0 bg-white z-10">
                      <th className="py-4 text-left font-medium text-gray-500">Quotation ID</th>
                      <th className="py-4 text-left font-medium text-gray-500">Quotation Date</th>
                      <th className="py-4 text-center font-medium text-gray-500">Quotation For</th>
                      <th className="py-4 text-left font-medium text-gray-500">Amount</th>
                      <th className="py-4 text-center font-medium text-gray-500">Status</th>
                      <th className="py-4 text-center font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8">Loading history...</td>
                      </tr>
                    ) : historyData.length > 0 ? (
                      historyData.map((h, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-4 font-semibold text-gray-800">{h.quotation_no}</td>
                          <td className="py-4 text-gray-600">
                            {new Date(h.quotation_date).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-4 text-gray-600 text-center">{h.quotation_for?.customer_name || '-'}</td> 
                          <td className="py-4 text-gray-600">₹{h.total_amount}</td>
                          <td className="py-4 text-center">
                            <span
                              className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                                h.status === 'Approved'
                                  ? 'bg-green-100 text-green-600'
                                  : h.status === 'Rejected'
                                  ? 'bg-red-100 text-red-600'
                                  : 'bg-orange-100 text-orange-600'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                          <td className="py-4 text-center">
                            <button
                              onClick={() => {
                                // Construct a quotation object compatible with the view
                                const viewQ = {
                                  quotation: {
                                    quotation_no: h.quotation_no,
                                    quotation_date: h.quotation_date,
                                    validity_date: h.validity_date,
                                    rfp_id: h.rfp_id,
                                    total_amount: h.total_amount,
                                    total_taxable: h.total_taxable,
                                    status: h.status
                                  },
                                  quotation_from: h.quotation_from || {},
                                  quotation_for: h.quotation_for || {},
                                  items: h.items || []
                                };
                                setSelectedQuotation(viewQ);
                                setShowQuotationHistory(false);
                                setSelectedRFP(null);
                              }}
                              className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                              title="View"
                            >
                              <Eye size={20} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-gray-500 py-8">No quotation history found for this RFP.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end p-6 pt-2 bg-white">
                <button
                  onClick={() => {
                    setShowQuotationHistory(false);
                    setSelectedRFP(null);
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
