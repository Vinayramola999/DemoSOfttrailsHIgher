import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import LeadsTable from './components/LeadsTable';
import { exportToExcel, exportToPDF } from './components/ExportUtils';
const baseUrl = process.env.REACT_APP_URL_sales || '';

export default function QueryAndLeads() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [Leads, setLeads] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);

  // Fetch verified leads on mount
  ////api for ->to get the verified lead with status verified

  useEffect(() => {
    const fetchVerifiedLeads = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `${baseUrl}/salesmanagement/leads/get-verifyedlead`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Handle case where leads come inside a property or directly
        const leads = Array.isArray(response.data)
          ? response.data
          : response.data.leads || [];

        setLeads(leads);
      } catch (error) {
        console.error("Error fetching verified leads:", error);
        setLeads([]);
      }
    };
    fetchVerifiedLeads();
  }, []);

  // Filter logic
  const filteredLeads = Array.isArray(Leads)
    ? Leads.filter((lead) => {
        // Get only date part (YYYY-MM-DD) for comparison
        const leadDateStr =
          lead.created_at || lead.date
            ? new Date(lead.created_at || lead.date).toISOString().split("T")[0]
            : "";
        const isAfterStart = startDate ? leadDateStr >= startDate : true;
        const isBeforeEnd = endDate ? leadDateStr <= endDate : true;
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch =
          ((lead.customer_uid || lead.customer_id)?.toString() || "").includes(searchLower) ||
          (lead.service || "").toLowerCase().includes(searchLower) ||
          (lead.source || "").toLowerCase().includes(searchLower) ||
          (lead.kam_name || "").toLowerCase().includes(searchLower) ||
          (lead.messages || "").toLowerCase().includes(searchLower);
        return matchesSearch && isAfterStart && isBeforeEnd;
      })
    : [];

  // Pagination logic
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = filteredLeads.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredLeads.length / itemsPerPage)
  );

  // Reset pagination when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, startDate, endDate]);

  return (
    <div className="flex flex-col h-[80vh] rounded-md">
      <div className="flex flex-col w-full">
        <div className="flex items-start justify-between gap-4">
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

          {/* Icons: Excel, PDF, Settings */}
          <div className="flex items-center gap-2 ml-2 mt-1">
            {(function(){
              const excelIcon = encodeURI('/vscode-icons_file-type-excel2.png');
              const pdfIcon = encodeURI('/material-icon-theme_pdf (1).png');
              return (
                <>
                  <button onClick={() => {
                    const headers = ["S.No.", "Customer ID", "Customer Name", "Lead", "Lead ID", "Lead Date", "Source", "KAM", "Stage", "Validity", "Status"];
                    exportToExcel(filteredLeads, headers, (item, idx) => [idx+1, item.customer_uid || item.customer_id, item.customer_name, item.service, item.lead_uid, item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '-', item.source, item.name || item.kam_name || '-', item.status || '-', item.active_days || '-', item.status || '-'], `verified_leads_${new Date().toISOString().slice(0,10)}.csv`);
                  }} title="Export to Excel" className="px-1 py-1 bg-transparent rounded hover:bg-gray-100">
                    <img src={excelIcon} alt="Excel" className="w-[59px] h-[24px] object-contain" />
                  </button>
                  <button onClick={() => {
                    const headers = ["S.No.", "Customer ID", "Customer Name", "Lead", "Lead ID", "Lead Date", "Source", "KAM", "Stage", "Validity", "Status"];
                    exportToPDF(filteredLeads, headers, (item, idx) => [idx+1, item.customer_uid || item.customer_id, item.customer_name, item.service, item.lead_uid, item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '-', item.source, item.name || item.kam_name || '-', item.status || '-', item.active_days || '-', item.status || '-'], `verified_leads_${new Date().toISOString().slice(0,10)}.pdf`, 'Verified Leads Report');
                  }} title="Export to PDF" className="px-1 py-1 bg-transparent rounded hover:bg-gray-100">
                    <img src={pdfIcon} alt="PDF" className="w-[59px] h-[24px] object-contain" />
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        {/* Leads Table (reusable) */}
        <LeadsTable
          columns={[
            { key: 'sno', label: 'S.No.', render: (_, idx) => `${(currentPage - 1) * itemsPerPage + idx + 1}.`, cellClass: 'font-medium text-gray-700' },
            { key: 'customer_id', label: 'Customer ID', render: (r) => r.customer_uid ? r.customer_uid : `CID-${(r.customer_id || 0).toString().padStart(3, '0')}` },
            { 
              key: 'customer_name', 
              label: 'Customer Name', 
              headClass: 'text-center',
              render: (r) => {
                const name = r.customer_name || '-';
                const isExpanded = expandedRow === `customer_${r.lead_id}`;
                return (
                  <div className="text-center whitespace-normal break-words max-w-[150px] mx-auto">
                    {isExpanded ? name : (name.length > 20 ? `${name.slice(0, 20)}...` : name)}
                    {name.length > 20 && (
                      <button
                        className="ml-2 text-blue-600 font-medium hover:text-blue-800"
                        onClick={() => setExpandedRow(isExpanded ? null : `customer_${r.lead_id}`)}
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                );
              },
              cellClass: 'text-center whitespace-normal',
            },
            { 
              key: 'service', 
              label: 'Lead', 
              headClass: 'text-center',
              render: (r) => {
                const service = r.service || '-';
                const isExpanded = expandedRow === `service_${r.lead_id}`;
                return (
                  <div className="text-center whitespace-normal break-words text-wrap max-w-[200px] mx-auto">
                    {isExpanded ? service : (service.length > 50 ? `${service.slice(0, 50)}...` : service)}
                    {service.length > 50 && (
                      <button
                        className="ml-2 text-blue-600 font-medium hover:text-blue-800"
                        onClick={() => setExpandedRow(isExpanded ? null : `service_${r.lead_id}`)}
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                );
              },
              cellClass: 'text-center whitespace-normal',
            },
            { key: 'lead_uid', label: 'Lead ID', render: (r) => r.lead_uid || '-' },
            { key: 'created_at', label: 'Lead Date', render: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString('en-GB') : '-' },
            { key: 'source', label: 'Source', render: (r) => r.source || '-' },
            { key: 'name', label: 'KAM', render: (r) => r.name || '-' },
            { key: 'stage', label: 'Stage', render: (r) => {
              const stageMap = {
                'indent_processing': 'Processing',
                'indent_processed': 'Processed',
                'indent_approved': 'Approved',
                'indent_rejected': 'Rejected',
                'indent_resubmitted': 'Resubmitted',
                'quotation_raised': 'Quotation Raised',
                'quotation_approved': 'Quotation Approved',
                'Verified': 'Verified',
                'Closed': 'Closed'
              };
              return stageMap[r.status] || r.status;
            }},
            { key: 'validity', label: 'Validity', render: (r) => {
              if (r.active_days) {
                return `${r.active_days} days`;
              }
              return '-';
            }},
            { key: 'status', label: 'Status', render: (r) => {
              const statusColor = r.status === 'Verified' ? 'text-green-600' : 'text-yellow-600';
              return <span className={`px-2 py-1 rounded-full text-xs ${statusColor}`}>{r.status}</span>;
            }}
          ]}
          data={currentRows}
          indexOffset={indexOfFirst}
          rowKey={(r, i) => r.id || r.lead_id || i}
          actionsRenderer={({ row }) => (
            <div className="flex justify-center">
              {row.status === 'Verified' ? (
                <Link to="/SalesProcess" state={{ leadId: row.lead_id || null }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-black">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m2-2.5V9a2 2 0 01-2-2V5.5M7 21h10a2 2 0 002-2V9l-6-6H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </Link>
              ) : (
                <div className="w-6 h-6 text-gray-400 cursor-not-allowed" title="Action disabled for closed leads">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m2-2.5V9a2 2 0 01-2-2V5.5M7 21h10a2 2 0 002-2V9l-6-6H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          )}
          page={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Customer Name Expanded Modal */}
    </div>
  );
}
