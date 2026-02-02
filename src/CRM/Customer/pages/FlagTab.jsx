import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaLessThan, FaGreaterThan } from "react-icons/fa";
import CustomerFilters from "../component/CustomerFilters";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import pdfIcon from '../../../assests/folder.png';
import excel from '../../../assests/excel.png';
import { saveAs } from "file-saver";
import API_BASE_URL from "../../config/api";
function FlagTab() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRows, setExpandedRows] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const navigate = useNavigate();

  // -------- Filter State --------
  const [filterState, setFilterState] = useState({
    search: "",
    dateRange: { start: "", end: "" },
  });

  const filtersConfig = [
    { type: "search", key: "search", placeholder: "Search by name, email, or phone" },
    { type: "dateRange", key: "dateRange" },
  ];

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Fetch flagged customers
  const fetchFlaggedCustomers = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}/customers/flagged`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const flags = response.data.flags;
      setCustomers(Array.isArray(flags) ? flags : []);
    } catch (error) {
      console.error("Error fetching flagged customers:", error);
      setCustomers([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFlaggedCustomers();
  }, []);

  // -------- Filter Logic --------
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => c.stage === "Flagged" || c.stage === "Rejected")
      .filter((customer) => {
        const term = filterState.search.toLowerCase();
        const name = customer.customer_name?.toLowerCase() || "";
        const email = customer.email_id?.toLowerCase() || "";
        const phone = customer.phone_number || "";
        const matchesSearch =
          name.includes(term) || email.includes(term) || phone.includes(term);

        const { start, end } = filterState.dateRange;
        const flaggedDate = customer.flagged_at ? new Date(customer.flagged_at) : null;
        const isAfterStart = start ? flaggedDate >= new Date(start) : true;
        const isBeforeEnd = end ? flaggedDate <= new Date(end + "T23:59:59") : true;

        return matchesSearch && isAfterStart && isBeforeEnd;
      });
  }, [customers, filterState]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => setCurrentPage(1), [filterState]);

  // ------------------ Excel / PDF ------------------
  const handleDownloadExcel = () => {
    if (!filteredCustomers.length) {
      Swal.fire("No Data", "There are no flagged customers to export.", "info");
      return;
    }

    const wsData = filteredCustomers.map((c, index) => ({
      "S.No": index + 1,
      "Customer Name": c.customer_name,
      "Email": c.email_id || "N/A",
      "Phone": c.phone_number || "N/A",
      "Reason": c.flag_reason || "N/A",
      "Date": c.flagged_at ? new Date(c.flagged_at).toLocaleDateString() : "N/A",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Flagged Customers");
    XLSX.writeFile(wb, "Flagged_Customers.xlsx");
  };

  const handleDownloadPDF = () => {
    if (!filteredCustomers.length) {
      Swal.fire("No Data", "There are no flagged customers to export.", "info");
      return;
    }

    const doc = new jsPDF();
    const tableColumn = ["S.No", "Customer Name", "Email", "Phone", "Reason", "Date"];
    const tableRows = filteredCustomers.map((c, index) => [
      index + 1,
      c.customer_name,
      c.email_id || "N/A",
      c.phone_number || "N/A",
      c.flag_reason || "N/A",
      c.flagged_at ? new Date(c.flagged_at).toLocaleDateString() : "N/A",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
    });

    doc.save("Flagged_Customers.pdf");
  };

  return (
    <div className="flex flex-col overflow-hidden w-full">
      {/* Filters and Export Buttons (Container removed) */}
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

      <div className="overflow-x-auto overflow-y-auto hide-scrollbar max-h-[75vh] sm:max-h-[60vh] md:max-h-[70vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="text-[14px] font-normal bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
              <tr>
                <th className="p-5 text-left text-black">S.No</th>
                <th className="p-5 text-left text-black">Customer</th>
                <th className="p-5 text-left text-black">Email</th>
                <th className="p-5 text-left text-black">Phone no.</th>
                <th className="p-5 text-left text-black">Reason</th>
                <th className="p-5 text-left text-black">Date</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
              {paginatedCustomers.map((customer, index) => (
                <tr key={`flag-${customer.flag_id}-${index}`} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                  <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="px-5 py-4 text-left text-[14px] text-black max-w-[200px] whitespace-normal break-words">
                    {(() => {
                      const text = customer.customer_name || "N/A";
                      const LIMIT = 10;

                      const rowKey = `cust-${customer.flag_id}`;
                      const isExpanded = expandedRows[rowKey];
                      const showDots = text.length > LIMIT;

                      return (
                        <span className="block break-words">
                          {isExpanded || !showDots ? text : text.substring(0, LIMIT)}

                          {showDots && !isExpanded && (
                            <button
                              className="text-blue-600 text-xs font-medium inline"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(rowKey);
                              }}
                            >
                              ...
                            </button>
                          )}
                        </span>
                      );
                    })()}
                  </td>


                  <td className="px-5 py-4 text-left text-[14px] text-black">{customer.email_id || "NA"}</td>
                  <td className="px-5 py-4 text-left text-[14px] text-black">{customer.phone_number || "NA"}</td>
                  <td className="px-5 py-4 text-left text-[14px] text-black max-w-[200px] whitespace-normal break-words">
                    {(() => {
                      const reason = customer.flag_reason || "N/A";
                      const LIMIT = 10; // <-- SET YOUR CHARACTER LIMIT HERE

                      const isExpanded = expandedRows[customer.flag_id];
                      const showReadMore = reason.length > LIMIT;

                      return (
                        <>
                          {isExpanded || !showReadMore
                            ? reason
                            : reason.substring(0, LIMIT) + "..."}

                          {showReadMore && (
                            <button
                              className="text-blue-600 font-medium text-sm ml-1"
                              onClick={() => toggleRow(customer.flag_id)}
                            >
                              {isExpanded ? "Read less" : "Read more"}
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </td>

                  <td className="px-5 py-4 text-left text-[14px] text-black max-w-[200px] whitespace-normal break-words">
                    {(() => {
                      const text = customer.flag_reason || "N/A";
                      const LIMIT = 18;

                      const rowKey = `reason-${customer.flag_id}`;
                      const isExpanded = expandedRows[rowKey];
                      const showReadMore = text.length > LIMIT;

                      return (
                        <div className="flex items-center gap-1 whitespace-normal break-words">
                          <span className="break-words">
                            {isExpanded || !showReadMore ? text : text.substring(0, LIMIT)}
                          </span>

                          {showReadMore && !isExpanded && (
                            <button
                              className="text-blue-600 text-xs font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRow(rowKey);
                              }}
                            >
                              ...
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 py-4 sticky bottom-0 ">
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

    </div>
  );
}
export default FlagTab;
