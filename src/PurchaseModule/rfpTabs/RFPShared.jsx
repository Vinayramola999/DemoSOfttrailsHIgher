import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API from "../../config/api";
import DownloadTableButtons from "../components/Downloadpdfexcel";
import Select from "react-select";
export default function RFPShared() {
  const token = sessionStorage.getItem("token");
  const [search, setSearch] = useState("");
  const [selectedRfp, setSelectedRfp] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    type: "success",
    title: "",
    message: "",
  });
  const [rfpOptions, setRfpOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch RFP options on mount
  useEffect(() => {
    const fetchRfps = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/rfp_ids/shared`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const options = (res.data?.data || []).map((rfp) => ({
          value: rfp.rfp_id,
          label: rfp.rfp_id,
        }));
        setRfpOptions(options);
      } catch (err) {
        setRfpOptions([]);
      }
    };
    fetchRfps();
  }, [token]);

  const fetchShared = useCallback(async () => {
    setLoading(true);
    try {
      const rfpId = selectedRfp?.value || selectedRfp;

      const res = await axios.get(
        `${API.PURCHASE_API}/rfps/shared_rfp/${rfpId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Expecting array at res.data.data or res.data
      const items = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];
      setData(items);
    } catch (err) {
      console.error("Failed to fetch shared RFPs", err?.response || err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedRfp, token]);

  useEffect(() => {
    // Only fetch if RFP is selected
    if (selectedRfp) {
      fetchShared();
    } else {
      setData([]);
    }
  }, [selectedRfp, dateFrom, dateTo, currentPage, fetchShared]);

  const exportData = data.map((row, idx) => ({
    sno: idx + 1,
    rfp_id: row.rfp_id,
    vendor_id: row.vendor_id,
    shared_date: row.shared_at
      ? new Date(row.shared_at).toLocaleDateString("en-GB")
      : "--",
    sender_contact: row.send_by_email || "-",
    vendor_contact: row.vendor_email || "-",
  }));

  const totalPages = Math.max(1, Math.ceil((data.length || 0) / rowsPerPage));
  const paginated = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleReShare = async (row) => {
    try {
      await axios.post(
        `${API.PURCHASE_API}/rfps/share_rfp/${row.rfp_id}`,
        { email_id: [row.vendor_email] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalProps({
        type: "success",
        title: "Success!",
        message: "RFP re-shared successfully.",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    } catch (error) {
      setModalProps({
        type: "error",
        title: "Error!",
        message: "Failed to re-share RFP. Please try again.",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };

  return (
    <div className="p-6 min-h-[60vh] rounded-xl ">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">RFP Shared</h2>
          <p className="text-sm text-gray-500">
            View and manage all shared RFP records
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DownloadTableButtons
            data={exportData}
            columns={[
              { header: "S. No.", accessor: "sno" },
              { header: "RFP ID", accessor: "rfp_id" },
              { header: "Vendor ID", accessor: "vendor_id" },
              { header: "Shared Date", accessor: "shared_date" },
              { header: "Sender Contact", accessor: "sender_contact" },
              { header: "Vendor Contact", accessor: "vendor_contact" },
            ]}
            fileName="RFP_Shared"
          />
        </div>
      </div>

      <div className="flex gap-4 items-center mb-4">
        <div className="relative flex items-center">
          {/* <span className="absolute left-3 top-2 text-gray-400">🔍</span> */}
            <span className="absolute left-3 text-gray-400 text-lg">
            <svg width="18" height="18" fill="none" stroke="currentColor">
              <circle cx="8" cy="8" r="7" strokeWidth="2" />
              <path d="M17 17L13 13" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="pl-10 pr-3 py-2 border rounded w-72"
          />
        </div>

        <Select
          options={rfpOptions}
          value={selectedRfp}
          onChange={setSelectedRfp}
          placeholder="Select RFP ID"
          isClearable
          isSearchable
          className="w-48"
          styles={{
            control: (base) => ({
              ...base,
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
            }),
          }}
        />

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <span className="text-sm text-gray-500">TO</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>

        <div className="ml-auto" />
      </div>

      <div
        className="overflow-x-auto rounded-lg shadow bg-white p-4"
        style={{ maxHeight: 400, overflowY: "auto", minWidth: 900 }}
      >
        <table className="w-full bg-white rounded-lg border-collapse">
          <thead className="border-b-2 border-black  bg-white z-10">
            <tr className="border-b-2 border-gray-200 text-black text-left">
              <th className="p-2 text-left">S. No.</th>
              <th className="p-2 text-left">RFP ID</th>
              <th className="p-2 text-left">Vendor ID</th>
              <th className="p-2 text-left">Shared Date</th>
              {/* <th className="p-2 text-left">Sender Name</th> */}
              <th className="p-2 text-left">Sender Contact</th>
              <th className="p-2 text-left">Vendor Contact</th>
              <th className="p-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  No shared RFPs found.
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <tr
                  key={row.rfp_id + "-" + idx}
                  className={idx % 2 === 0 ? "bg-blue-50" : ""}
                >
                  <td className="p-3">
                    {(currentPage - 1) * rowsPerPage + idx + 1}.
                  </td>
                  <td className="p-3">{row.rfp_id}</td>
                  <td className="p-3">{row.vendor_id}</td>
                  <td className="p-3">
                    {row.shared_at
                      ? new Date(row.shared_at).toLocaleDateString("en-GB")
                      : "--"}
                  </td>
                  {/* <td className="p-3">{row.sender_name}</td> */}
                  <td className="p-3">{row.send_by_email}</td>
                  <td className="p-3 text-blue-600 underline cursor-pointer">
                    {row.vendor_email || "view vendor contacts"}
                  </td>
                  <td className="p-3">
                    <button 
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => handleReShare(row)}
                    >
                      Re-Share
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-center gap-2 mt-4">
        <button
          className="px-3 py-2 bg-white border rounded"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        <div className="px-3 py-2 bg-blue-600 text-white rounded">
          {currentPage}
        </div>
        <div className="px-2 text-sm">of</div>
        <div className="px-3 py-2 border rounded">{totalPages}</div>
        <button
          className="px-3 py-2 bg-white border rounded"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          &gt;
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{modalProps.title}</h2>
            <p className="mb-4">{modalProps.message}</p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => setShowModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
