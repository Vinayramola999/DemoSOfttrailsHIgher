import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";
import CustomerFilters from "../component/CustomerFilters";
import excelIcon from "../../../assests/excel.png";
import pdfIcon from "../../../assests/folder.png";
import { PAGINATION } from "../utils/constants";
import LoadingSpinner from "../component/LoadingSpinner";
import ErrorBoundary from "../component/ErrorBoundary";
import { FaLessThan, FaGreaterThan } from "react-icons/fa";

const CustomerContactTable = () => {
  const API_BASE_URL = process.env.REACT_APP_API_CRM_BASE_URL;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});
  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };


  const [filterState, setFilterState] = useState({
    searchQuery: "",
    selectedStatus: "",
  });

  // ✅ Fetch contacts
  const fetchCustomerContacts = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/contacts/with-customer-details`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data.contacts || []);
    } catch (err) {
      console.error("Error fetching customer contacts:", err);
      Swal.fire("Error", "Failed to fetch customer contacts", "error");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchCustomerContacts();
  }, [fetchCustomerContacts]);

  // ✅ Filters
  const filtersConfig = useMemo(
    () => [
      {
        type: "search",
        key: "searchQuery",
        placeholder: "Search by Contact Person, Email or Customer Name",
      },
      {
        type: "select",
        key: "selectedStatus",
        label: "Status",
        options: [...new Set(data.map((d) => d.status).filter(Boolean))],
      },
    ],
    [data]
  );

  const filteredData = useMemo(() => {
    const { searchQuery, selectedStatus } = filterState;
    return data.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [data, filterState]);

  const totalPages = Math.ceil(filteredData.length / PAGINATION.CUSTOMER_PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGINATION.CUSTOMER_PAGE_SIZE,
    currentPage * PAGINATION.CUSTOMER_PAGE_SIZE
  );

  useEffect(() => setCurrentPage(1), [filterState]);

  // ✅ Excel Download
  const handleDownloadExcel = useCallback(() => {
    if (!filteredData.length) {
      Swal.fire("No Data", "There are no contacts to export.", "info");
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CustomerContacts");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), "Customer_Contacts.xlsx");
  }, [filteredData]);

  // ✅ PDF Download
  const handleDownloadPDF = useCallback(() => {
    if (!filteredData.length) {
      Swal.fire("No Data", "There are no contacts to export.", "info");
      return;
    }
    const doc = new jsPDF();
    const tableColumn = ["S.No", "Contact Person", "Phone No.", "Email", "Status", "Customer ID", "Customer Name"];
    const tableRows = filteredData.map((row, i) => [
      i + 1,
      row.contact_person,
      row.phone_num,
      row.email_id,
      row.status,
      row.customer_uid,
      row.customer_name   ,
    ]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
    });
    doc.save("Customer_Contacts.pdf");
  }, [filteredData]);

  if (loading) return <LoadingSpinner message="Loading customer contacts..." />;

  return (
    <ErrorBoundary>
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

        {/* Table Section */}
        {/* Table + Scroll Container */}
        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-lg bg-white">


          {/* TABLE */}

          <table className="min-w-full table-auto border-collapse text-sm">
            <thead
              className="text-[14px] font-normal bg-white sticky top-0"
              style={{ boxShadow: "0 2px 0 black" }}
            >
              <tr>
                <th className="p-5 text-left text-black">S.No</th>
                <th className="p-5 text-left text-black">Contact Person</th>
                <th className="p-5 text-left text-black">Phone No.</th>
                <th className="p-5 text-left text-black">Email</th>
                <th className="p-5 text-left text-black">Status</th>
                <th className="p-5 text-left text-black">Customer ID</th>
                <th className="p-5 text-left text-black">Customer Name</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td colSpan="7" className="h-3 bg-white"></td>
              </tr>

              {paginatedData.map((item, index) => (
                <tr
                  key={item.contact_id || index}
                  className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"
                    }`}
                >
                  <td className="px-5 py-4 text-left text-[14px] text-black">
                    {(currentPage - 1) * PAGINATION.CUSTOMER_PAGE_SIZE + index + 1}
                  </td>

                  <td
                    className="px-5 py-4 text-left text-[14px] text-blue-600 cursor-pointer max-w-[180px] whitespace-normal break-words"
                    onClick={() => setSelectedContact(item)}
                  >
                    {(() => {
                      const text = item.contact_person || "N/A";
                      const LIMIT = 15;

                      const rowKey = `cp-${item.contact_id}`;
                      const isExpanded = expandedRows[rowKey];
                      const showReadMore = text.length > LIMIT;

                      return (
                        <div
                          className="flex items-start gap-1 whitespace-normal break-words"
                          style={{ wordBreak: "break-word" }}
                        >

                          <span className="break-words">
                            {isExpanded || !showReadMore ? text : text.substring(0, LIMIT)}
                          </span>

                          {/* Show "..." only when collapsed */}
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




                  <td className="px-5 py-4 text-left text-[14px] text-black">
                    {item.phone_num || "N/A"}
                  </td>

                  <td className="px-5 py-4 text-left text-[14px] text-black">
                    {item.email_id || "N/A"}
                  </td>

                  <td className="px-5 py-4 text-left text-[14px] text-black">
                    {item.status || "N/A"}
                  </td>

                  <td className="px-5 py-4 text-left text-[14px] text-black">
                    {item.customer_uid || "N/A"}
                  </td>
                  <td className="px-5 py-4 text-left text-[14px] text-black max-w-[180px] whitespace-normal break-words">
                    {(() => {
                      const text = item.customer_name || "N/A";
                      const LIMIT = 15;

                      const rowKey = `cust-${item.customer_id}`;
                      const isExpanded = expandedRows[rowKey];
                      const showReadMore = text.length > LIMIT;

                      return (
                        <div className="flex items-center gap-1 whitespace-normal break-words">
                          <span className="break-words">
                            {isExpanded || !showReadMore ? text : text.substring(0, LIMIT)}
                          </span>

                          {/* Show "..." only when collapsed */}
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
        {/* ✅ FIXED PAGINATION BELOW TABLE (OUTSIDE SCROLL) */}
        <div className="flex justify-center items-center gap-2 py-4">

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


        {/* Contact Modal */}
        {selectedContact && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[95%] sm:w-[700px] md:w-[800px] lg:w-[900px] relative">
              {/* Header */}
              <div className="flex justify-between items-center border-b px-6 py-3">
                <h2 className="text-base md:text-lg font-semibold text-gray-800">
                  Contact Details
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${selectedContact.status?.toLowerCase() === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                      }`}
                  >
                    {selectedContact.status || "N/A"}
                  </span>
                  <button
                    onClick={() => setSelectedContact(null)}
                    className="text-red-500 hover:text-red-700 text-xl leading-none"
                  >
                    ✖
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 px-6 py-4 text-sm text-gray-700">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedContact.contact_person}
                  </p>
                  <p><strong>Address:</strong> {selectedContact.address || "N/A"}</p>
                  <p><strong>City:</strong> {selectedContact.city || "N/A"}</p>
                  <p><strong>Start date:</strong> {selectedContact.date_of_start
                    ? new Date(selectedContact.date_of_start).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                    : "N/A"}
                  </p>
                  <p><strong>Customer ID:</strong> {selectedContact.customer_uid || "N/A"}</p>

                </div>

                <div className="space-y-2">
                  <p><strong>Phone No.:</strong> {selectedContact.phone_num || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedContact.email_id || "N/A"}</p>
                  <p><strong>Country:</strong> {selectedContact.country || "N/A"}</p>
                  <p><strong>State:</strong> {selectedContact.state || "N/A"}</p>
                  <p><strong>Pin Code:</strong> {selectedContact.pincode || "N/A"}</p>
                  <p><strong>Designation:</strong> {selectedContact.designation || "N/A"}</p>
                  <p><strong>End date:</strong> {selectedContact.date_of_end
                    ? new Date(selectedContact.date_of_end).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                    : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CustomerContactTable;
