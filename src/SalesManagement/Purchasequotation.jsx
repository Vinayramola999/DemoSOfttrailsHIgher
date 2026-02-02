import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import LeadsTable from './components/LeadsTable';



export default function QuotationList() {
  const baseUrlp = process.env.REACT_APP_URL_purchase || '';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          console.error("Token not found. Please log in.");
          return;
        }
        const res = await axios.get(
          `${baseUrlp}/sales/salesIndenting/AllQuotation`,
          // `https://devapi.softtrails.net/saas/purchase/test/purchase/sales/salesIndenting/AllQuotation`,
          // `${baseUrl}/salesmanagement/indent/salesIndenting/AllQuotation`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched quotations:", res);
        if (res.data.success) {
          setQuotations(res.data.quotations || []);
        }
      } catch (err) {
        console.error("Error fetching quotations:", err);
      }
    };
    fetchQuotations();
  }, []);

  // Apply search & date filter
  const filteredQuotations = quotations.filter((q) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      q.quotation_id.toString().toLowerCase().includes(query) ||
      (q.vendor_name && q.vendor_name.toLowerCase().includes(query));
    const quotationDate = new Date(q.quotation_date);
    const isAfterStart = startDate
      ? quotationDate >= new Date(startDate)
      : true;
    const isBeforeEnd = endDate ? quotationDate <= new Date(endDate) : true;
    return matchesSearch && isAfterStart && isBeforeEnd;
  });

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = filteredQuotations.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredQuotations.length / itemsPerPage)
  );

  return (
    <div className="flex flex-col h-[63vh] rounded-md">
        {!selectedQuotation && (
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
      )}

      {!selectedQuotation ? (
        <>
          <div className="flex-col">
            <LeadsTable
              columns={[
                { key: 'sno', label: 'S. No.', render: (_, idx) => `${indexOfFirst + idx + 1}.`, cellClass: 'font-medium text-gray-700' },
                { key: 'quotation_date', label: 'Quotation date', render: (q) => new Date(q.quotation_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) },
                { key: 'quotation_id', label: 'Quotation No.', render: (q) => q.quotation_id },
                { 
                  key: 'vendor_name', 
                  label: 'Quotation from', 
                  render: (q) => {
                    const name = q.vendor_name || '-';
                    const isExpanded = expandedRow === `vendor_${q.quotation_id}`;
                    return (
                              <div className="text-center whitespace-normal break-words max-w-[150px] mx-auto">
                              {isExpanded ? name : (name.length > 20 ? `${name.slice(0, 20)}...` : name)}
                              {name.length > 20 && (
                                <button
                                  className="ml-2 text-blue-600 font-medium hover:text-blue-800"
                                  onClick={() => setExpandedRow(isExpanded ? null : `vendor_${q.quotation_id}`)}
                                >
                                  {isExpanded ? 'Show less' : 'Read more'}
                                </button>
                              )}
                            </div>
                    );
                  },
                  cellClass: 'text-center whitespace-normal',
                },
                { key: 'grand_total', label: 'Amount', render: (q) => `₹${q.grand_total}` },
                { key: 'status', label: 'Status', render: (q) => {
                  const statusColor = q.status === 'Verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
                  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>{q.status || '-'}</span>;
                }},
              ]}
              data={currentRows}
              indexOffset={indexOfFirst}
              rowKey={(q) => q.quotation_id}
              actionsRenderer={({ row }) => (
                <button
                  onClick={() => setSelectedQuotation(row)}
                  className="text-blue-600 hover:underline font-medium"
                >
                  View
                </button>
              )}
              page={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              visibleRowsPerPage={6}
            />
          </div>
        </>
      ) : (
        // --- details view with header ---
        <div className="">
          {/* TOP ACTION BAR (match QuotationApproval style) */}
          <div className="flex items-center justify-between bg-white p-4 border-b rounded-t">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedQuotation(null)}
                className="text-gray-600 hover:text-blue-600"
              >
                <FaArrowLeft />
              </button>
              <div className="text-sm text-gray-500">
                {selectedQuotation?.vendor_name || 'Company'} &gt; Quotation &gt;{' '}
                <span className="text-gray-800 font-semibold">
                  {selectedQuotation?.quotation_id}
                </span>
              </div>
            </div>

            {/* action buttons removed per design preference */}
          </div>

          <div className="flex items-center justify-between bg-gray px-4 py-3 border-b">
            </div>

          <div className="bg-white border rounded p-8 shadow">
            <h2 className="text-2xl font-bold mb-6">Quotation</h2>

            <div className="grid grid-cols-2 gap-y-1 text-sm mb-6">
              <p>
                <strong>Quotation No.</strong> {selectedQuotation.quotation_id}
              </p>
              <p>
                <strong>RFP ID.</strong> {selectedQuotation.rfp_id}
              </p>
              <p>
                <strong>Quotation date</strong>{" "}
                {new Date(selectedQuotation.quotation_date).toDateString()}
              </p>
              <p>
                <strong>Validity date</strong>{" "}
                {new Date(selectedQuotation.validity_date).toDateString()}
              </p>
            </div>

            {/* table header */}
            <div className="grid grid-cols-5 bg-blue-600 text-white font-medium px-4 py-2 rounded-t-md text-sm">
              <div>Item &amp; Description</div>
              <div>Quantity</div>
              <div>Unit Price</div>
              <div>Tax (%)</div>
              <div>Amount</div>
            </div>

            {/* single item */}
            <div className="max-h-[400px] overflow-y-auto">
            {Array.isArray(selectedQuotation.items) && selectedQuotation.items.length > 0 ? (
              selectedQuotation.items.map((item, idx) => (
                <div key={item.quotation_group_id || idx} className="grid grid-cols-5 gap-4 border-b px-4 py-3 text-sm">
                  <div>
                    <span className="font-medium">{item.asset_name}</span>
                    <p className="text-gray-500 text-xs">{item.description}</p>
                  </div>
                  <div>{item.quantity}</div>
                  <div>₹{item.unit_price}</div>
                  <div>{item.tax_percentage}%</div>
                  <div>₹{item.total_amount}</div>
                </div>
              ))
            ) : (
              <div className="grid grid-cols-5 gap-4 border-b px-4 py-3 text-sm text-center text-gray-400">
                <div colSpan={5}>No items found</div>
              </div>
            )}
            </div>

            {/* Bottom Summary */}
            <div className="border-t mt-8 pt-4 max-w-md ml-auto text-right space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount</span>
                <span>₹{selectedQuotation.total_amount}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Taxable amount</span>
                <span>₹{selectedQuotation.total_tax}</span>
              </div>

              <hr className="my-4" />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total (INR)</span>
                <span>₹{selectedQuotation.grand_total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
