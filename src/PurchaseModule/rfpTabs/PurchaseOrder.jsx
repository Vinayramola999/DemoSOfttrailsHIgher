import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { AiFillFileExcel, AiFillFilePdf } from "react-icons/ai";
import axios from "axios";
import API from "../../config/api";
import DownloadTableButtons from "../components/Downloadpdfexcel";
import GeneratePOPopup from "../components/GeneratePOPopup";

const rowsPerPage = 5;

const PurchaseOrder = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showPOPopup, setShowPOPopup] = useState(false);
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "PO no.", accessor: "po_no." },
    { header: "PO Recieved.", accessor: "po_received" },
    { header: "Date", accessor: "date" },
    { header: "Delivery Status", accessor: "delivery_status" },
    { header: "Delivery Date", accessor: "delivery_date" },
    { header: "Payment", accessor: "payment" },
  ];
  // Fetch API data
  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      const res = await axios.get(`${API.PURCHASE_API}/purchase_order/AllPO`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.error("API Error:", err.response?.data || err.message);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter logic
  const filteredData = data.filter((row) => {
    let matches = true;

    if (search) {
      matches =
        row.quotation_id?.toLowerCase().includes(search.toLowerCase()) ||
        row.status?.toLowerCase().includes(search.toLowerCase());
    }

    if (fromDate) {
      matches = matches && new Date(row.created_at) >= new Date(fromDate);
    }

    if (toDate) {
      matches = matches && new Date(row.created_at) <= new Date(toDate);
    }

    return matches;
  });

  const handlePreviewPO = async (row) => {
    try {
      const token = sessionStorage.getItem("token");
      const { po_id, vendor_id } = row;


      // Fetch Vendor Data
      const vendorRes = await axios.get(
        `${API.PURCHASE_API}/purchase_order/vendors_data/${vendor_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const timestamp = new Date().getTime();
      const res = await axios.get(
        `${API.PURCHASE_API}/purchase_order/poFile/${po_id}?t=${timestamp}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { _: timestamp },
        }
      );

      if (res.data?.data?.file_url) {
        const fileUrl = res.data.data.file_url;
        const separator = fileUrl.includes("?") ? "&" : "?";
        const cacheBustedUrl = `${fileUrl}${separator}t=${timestamp}`;

        window.open(cacheBustedUrl, "_blank");
      } else if (res.data?.data?.file) {
        const blob = new Blob(
          [Uint8Array.from(atob(res.data.data.file), (c) => c.charCodeAt(0))],
          { type: "application/pdf" }
        );
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 5000);
      } else {
        console.error("No file URL or file data found in response:", res.data);
        alert("No PO file found for this record.");
      }
    } catch (err) {
      console.error("Failed to fetch PO preview data:", err);
      alert(
        "Failed to fetch PO preview data. Please check the console for details."
      );
    }
  };
  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const exportData = filteredData.map((row, idx) => ({
    sno: idx + 1,
    quotation_date: row.quotation_date
      ? new Date(row.quotation_date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "--",
    quotation_id: row.quotation_id || "--",
    rfp_id: row.rfp_id || "--",
    vendor_name: row.vendor_name || "--",
    status: row.status || "--",
  }));

  return (
    <div className="p-6  min-h-[70vh] rounded-xl">
      {/* Generate PO Button */}
      <div className="pl-3 pt-2">
        <button
          className="bg-[#0057FF] text-white font-semibold px-5 py-2 rounded-lg shadow mb-4"
          onClick={() => setShowPOPopup(true)}
        >
          + Generate PO
        </button>
      </div>
      <GeneratePOPopup
        open={showPOPopup}
        onClose={() => setShowPOPopup(false)}
        fetchPOs={fetchData}
      />

      {/* Filters */}
      <div className="flex gap-4 mb-4 items-center">
        {/* Search */}
        <div className="relative w-1/4">
          <input
            type="text"
            placeholder="Search"
            className="border border-gray-300 w-full p-2 pl-10 rounded-lg bg-white h-10 text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        {/* Date Range */}
        <div className="flex gap-2 items-center">
          <input
            type="date"
            className="border border-gray-300 rounded-lg bg-white h-10  px-3 text-base"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <span className="text-gray-500 font-medium">TO</span>
          <input
            type="date"
            className="border border-gray-300 rounded-lg bg-white h-10 px-3 text-base"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
        {/* Export Buttons */}
        <div className="flex-1 flex justify-end">
          <DownloadTableButtons
            data={exportData}
            columns={columns}
            fileName="Quotations"
          />
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-lg shadow bg-white p-4"
        style={{ maxHeight: 400, overflowY: "auto", minWidth: 900 }}
      >
        {" "}
        <table className="w-full bg-white rounded-lg border-collapse">
          <thead className="border-b-2 border-black  bg-white z-10">
            <tr className="border-b-2 border-gray-200 text-black text-left">
              <th className="py-3 px-4 font-medium">S. No.</th>
              <th className="py-3 px-4 font-medium">PO No.</th>
              <th className="py-3 px-4 font-medium">Quotation ID</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Delivery Date</th>
              <th className="py-3 px-4 font-medium">Delivery Status</th>
              {/* <th className="py-3 px-4 font-medium">Payment</th> */}
              <th className="py-3 px-4 font-medium">Preview</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  No data found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.poNo || idx} className="odd:bg-blue-50">
                  <td className="py-3 px-4">
                    {idx + 1 + (currentPage - 1) * rowsPerPage}
                  </td>
                  <td className="py-3 px-4">{row.po_id}</td>
                  <td className="py-3 px-4">{row.quotation_id}</td>
                  <td className="py-3 px-4">
                    {new Date(row.created_at).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(row.delivery_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4">{row.status}</td>
                  {/* <td className="py-3 px-4">{row.payment}</td> */}
                  <td className="py-3 px-4">
                    <button
                      className="text-blue-600 underline hover:text-blue-800 font-medium"
                      onClick={() => {
                        console.log(
                          "Preview clicked for PO:",
                          row.po_id,
                          "Row data:",
                          row
                        );
                        handlePreviewPO(row);
                      }}
                      title={`Preview PO PDF - ${row.po_id}`}
                    >
                      Preview
                    </button>
                  </td>{" "}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 py-8">
        <button
          className="bg-white border border-gray-300 rounded px-3 py-2"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
        >
          <FiChevronLeft />
        </button>
        <button className="bg-[#0057FF] text-white rounded px-4 py-2 font-semibold">
          {currentPage}
        </button>
        <span className="px-2 text-gray-700 font-medium">of</span>
        <button className="border border-gray-300 rounded px-4 py-2 text-[#0057FF] font-semibold bg-white">
          {totalPages}
        </button>
        <button
          className="bg-white border border-gray-300 rounded px-3 py-2"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
        >
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};

export default PurchaseOrder;
