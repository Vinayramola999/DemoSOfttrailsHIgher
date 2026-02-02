import React, { useEffect, useState } from "react";
import { FaSearch, FaCalendarAlt, FaGreaterThan } from "react-icons/fa";
import axios from "axios";
import { TbMathGreater } from "react-icons/tb";
import { FaLessThan } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import { AiFillFilePdf } from "react-icons/ai";

export default function CustomersDetails() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [source, setSource] = useState("");
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If backend provides available filters (sources/statuses), store them
  const [availableSources, setAvailableSources] = useState([]);
  const [availableStatuses, setAvailableStatuses] = useState([]);

  // Debounce search input to avoid rapid requests
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 450);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch customers from backend with query params
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (debouncedSearch) params.search = debouncedSearch;
        if (source) params.source = source;
        // send status as 'stage' if backend expects stage param (also send status)
        if (status) {
          params.stage = status;
          params.status = status;
        }
        if (startDate) params.dateFrom = startDate;
        if (endDate) params.dateTo = endDate;
        if (sortBy) params.sortBy = sortBy;
        params.page = currentPage;
        params.limit = itemsPerPage;

        const response = await axios.get(
          "https://devdemo.softtrails.net/customers/",
          {
            params,
          }
        );

        // Flexible response handling
        const data = response.data;
        // Case A: API returns an array directly
        if (Array.isArray(data)) {
          setCustomers(data);
          const total = parseInt(response.headers["x-total-count"] || "0", 10);
          if (total) {
            setTotalItems(total);
            setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));
          } else {
            setTotalItems(data.length);
            setTotalPages(Math.max(1, Math.ceil(data.length / itemsPerPage)));
          }

          // derive filters from data if empty
          const srcs = Array.from(
            new Set(data.map((c) => c.source).filter(Boolean))
          );
          if (srcs.length) setAvailableSources(srcs);
          const sts = Array.from(
            new Set(data.map((c) => c.stage || c.status).filter(Boolean))
          );
          if (sts.length) setAvailableStatuses(sts);

          // Case B: API returns wrapped object (your example: { success, message, data: { customers: [...], totalPages, totalCount } })
        } else if (data && data.data && Array.isArray(data.data.customers)) {
          const list = data.data.customers;
          setCustomers(list);

          const total =
            data.data.totalCount ||
            data.data.total ||
            parseInt(response.headers["x-total-count"] || "0", 10) ||
            list.length;
          setTotalItems(total);
          setTotalPages(
            data.data.totalPages || Math.max(1, Math.ceil(total / itemsPerPage))
          );

          // populate available filters from payload if possible
          if (Array.isArray(list) && list.length) {
            const srcs = Array.from(
              new Set(list.map((c) => c.source).filter(Boolean))
            );
            if (srcs.length) setAvailableSources(srcs);
            const sts = Array.from(
              new Set(list.map((c) => c.stage || c.status).filter(Boolean))
            );
            if (sts.length) setAvailableStatuses(sts);
          }

          // Case C: other shapes: results/customers/data/items
        } else {
          const list =
            data.results || data.customers || data.data || data.items || [];
          // Ensure we always store an array in state to avoid .map errors
          setCustomers(Array.isArray(list) ? list : []);
          const total =
            data.total ||
            data.count ||
            parseInt(response.headers["x-total-count"] || "0", 10) ||
            (Array.isArray(list) ? list.length : 0);
          setTotalItems(total);
          setTotalPages(Math.max(1, Math.ceil(total / itemsPerPage)));

          if (data.filters) {
            if (Array.isArray(data.filters.sources))
              setAvailableSources(data.filters.sources);
            if (Array.isArray(data.filters.stages))
              setAvailableStatuses(data.filters.stages);
          }
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        setError(err.message || "Failed to fetch");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    debouncedSearch,
    source,
    status,
    startDate,
    endDate,
    sortBy,
    currentPage,
    itemsPerPage,
  ]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, source, status, startDate, endDate, sortBy]);

  // Ensure paginatedCustomers is always an array before using .map()
  const paginatedCustomers = Array.isArray(customers) ? customers : [];

  const handleDownloadPDF = async () => {
    try {
      const params = {};
      if (debouncedSearch) params.search = debouncedSearch;
      if (source) params.source = source;
      if (status) {
        params.status = status;
        params.stage = status;
      }
      if (startDate) params.dateFrom = startDate;
      if (endDate) params.dateTo = endDate;

      params.page = 1; // first page
      params.limit = 10000; // get all data

      const response = await axios.get(
        "https://devdemo.softtrails.net/customers/",
        { params }
      );

      const allCustomers =
        response.data?.data?.customers ||
        response.data?.customers ||
        response.data ||
        [];

      generatePDF(allCustomers);
    } catch (err) {
      console.error("PDF Fetch Error", err);
    }
  };
  const generatePDF = (allCustomers) => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Customers Report", 14, 15);

    const tableColumn = [
      "S.No",
      "Customer",
      "Customer ID",
      "Registered Date",
      "Email",
      "Phone",
      "Status",
    ];

    const tableRows = [];

    allCustomers.forEach((customer, index) => {
      tableRows.push([
        index + 1,
        customer.customer_name,
        "EMP" + String(customer.customer_id).padStart(1, "0"),
        customer.created_at
          ? new Date(customer.created_at).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "-",
        customer.email_id,
        customer.phone_number,
        customer.status,
      ]);
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("customers_report.pdf");
  };

  return (
    <>
      <div className="fixed ">
        <div>
          <p className="text-[#00235A] text-[20px] font-semibold text-start">
            Customers
          </p>
        </div>

        <div className="flex w-[80vw] justify-between items-center ">
          <div className="flex flex-wrap items-center gap-4 py-4">
            {/* Search Box */}
            <div className="flex items-center border border-[#CDCDCD] rounded-lg px-3 py-2 w-[200px] bg-white">
              <FaSearch className="text-gray-500 mr-2" />
              <input
                type="text"
                placeholder="Search"
                className="outline-none w-full text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div className="flex items-center border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm bg-white">
              <input
                type="date"
                className="outline-none text-gray-700"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className="mx-2 text-gray-500">TO</span>
              <input
                type="date"
                className="outline-none text-gray-700"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <FaCalendarAlt className="text-gray-500 ml-2" />
            </div>

            {/* Status Dropdown (use backend-provided list when available) */}
            <select
              className="border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm text-gray-700 w-[160px]"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Status</option>
              {(availableStatuses.length > 0
                ? availableStatuses
                : ["active", "inactive"]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Sort By Dropdown */}

            {/* Source Dropdown (use backend-provided list when available) */}
            <select
              className="border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm text-gray-700 w-[160px]"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            >
              <option value="">Source</option>
              {(availableSources.length > 0
                ? availableSources
                : ["sales", "Website", "facebook"]
              ).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button className="" onClick={handleDownloadPDF}>
              <AiFillFilePdf size={32} color="#E33629" />
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-white mt-24 mr-5">
        <div className="max-h-[63vh] min-h-[63vh]  overflow-y-scroll scrollbar-hide">
          {loading ? (
            <div className="p-6 text-center">Loading customers...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-600">Error: {error}</div>
          ) : (
            <table className="w-full text-sm text-left border-collapse px-10 overflow-y-scroll scrollbar-hide">
              <thead className="border-b-2 border-black  ">
                <tr>
                  <th className="px-4 py-6 font-medium text-[12px]">S. No.</th>
                  <th className="px-4 py-6 font-medium text-[12px]">
                    Customer
                  </th>
                  <th className="px-4 py-6 font-medium text-[12px]">
                    Customer ID
                  </th>
                  <th className="px-4 py-6 font-medium text-[12px]">
                    Registered Date
                  </th>
                  <th className="px-4 py-6 font-medium text-[12px]">
                    Email-ID
                  </th>
                  <th className="px-4 py-6 font-medium text-[12px]">
                    Phone number
                  </th>
                  <th className="px-4 py-6 font-medium text-[12px]">Status</th>
                </tr>
              </thead>
              <tr className="h-3"></tr>
              <tbody>
                {paginatedCustomers.map((customer, index) => (
                  <tr
                    key={customer.customer_id || index}
                    className="odd:bg-[#005AE61A] even:bg-white"
                  >
                    <td className="text-[12px] py-5 px-4">
                      {(currentPage - 1) * itemsPerPage + index + 1}.
                    </td>
                    <td className="text-[12px] py-5">
                      {customer.customer_name}
                    </td>
                    <td className="text-[12px] py-5 text-[#444444]">
                      EMP{String(customer.customer_id || "").padStart(1, "0")}
                    </td>
                    <td className="text-[12px] py-5 text-[#444444]">
                      {customer.created_at
                        ? new Date(customer.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )
                        : "-"}
                    </td>
                    <td className="text-[12px] py-5">{customer.email_id}</td>
                    <td className="text-[12px] py-5">
                      {customer.phone_number}
                    </td>
                    <td className="text-[12px] py-5 capitalize">
                      {customer.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-3 p-4">
          <button
            className="p-3 rounded border-[#BCBCBC] border-[0.5px] text-sm"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            <FaLessThan size={10} color="#BCBCBC" />
          </button>
          <span className="text-[12px] font-semibold flex items-center gap-2">
            <span className="bg-[#005AE6] text-white px-[14px] py-2 rounded">
              {currentPage}
            </span>
            Of
            <span className="border border-[#005AE6] text-[#005AE6] px-[12px] py-[6px] rounded">
              {totalPages}
            </span>
          </span>
          <button
            className="p-3 rounded border-[#BCBCBC] border-[0.5px] text-sm"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages || loading}
          >
            <FaGreaterThan size={10} color="#BCBCBC" />
          </button>
        </div>
      </div>
    </>
  );
}
