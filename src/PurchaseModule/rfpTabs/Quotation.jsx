import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import DownloadTableButtons from "../components/Downloadpdfexcel";
import { toast } from "react-toastify";
import Select from "react-select";
import PopupModal from "../PopupModal";
import ManualQuotationModal from "./ManualQuotationModal";
const Quotation = () => {
  const createdBy = sessionStorage.getItem("userId");
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const { userId } = useParams();
  const [rfpOptions, setRfpOptions] = useState([]);
  const [selectedRfp, setSelectedRfp] = useState("");
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [docStatus, setDocStatus] = useState({}); // { docName: "Qualified" | "Disqualified" }
  const [showCommercialModal, setShowCommercialModal] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const [popupModalProps, setPopupModalProps] = useState({
    type: "warning",
    title: "",
    message: "",
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();
  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "Date", accessor: "quotation_date" },
    { header: "Quotation Id.", accessor: "quotation_id" },
    { header: "RFP ID", accessor: "rfp_id" },
    { header: "Vendor", accessor: "vendor_name" },
    { header: "Status", accessor: "status" },
  ];
  const handleViewHistory = async (quotationId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/history/${quotationId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data && response.data.success === false) {
        setHistory([]);
        setShowHistoryModal(false);
        setPopupModalProps({
          type: "warning",
          title: "No History",
          message:
            response.data?.message || "No history found for this quotation ID.",
        });
        setShowPopupModal(true);
        return;
      }
      const historyData = response.data?.data || [];
      setHistory(historyData);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Error fetching quotation history:", error);
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to fetch quotation history.";
      setPopupModalProps({
        type: "error",
        title: "Error",
        message: errMsg,
      });
      setShowPopupModal(true);
    }
  };

  // Fetch RFP options on mount
  useEffect(() => {
    const fetchRfps = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/rfp_ids`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setRfpOptions(res.data?.data || []);
      } catch (err) {
        setRfpOptions([]);
      }
    };
    fetchRfps();
  }, [token]);

  // Convert RFP options to react-select format
  const rfpSelectOptions = rfpOptions.map((rfp) => ({
    value: rfp.rfp_id,
    label: rfp.rfp_id,
  }));

  // Fetch quotations when RFP is selected
  useEffect(() => {
    if (!selectedRfp) {
      setQuotations([]);
      return;
    }
    setLoading(true);
    // In your useEffect for fetching quotations:
    axios
      .get(
        `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/rfp/${selectedRfp}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      .then((res) => {
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        // Map documents for popup and normalize id field
        const mapped = data.map((row) => ({
          // ensure component uses `quotation_id`
          quotation_id: row.quotation_id || row.quotation_group_id || "",
          // keep original fields
          ...row,
          // documents normalized from required_doc
          documents: row.required_doc
            ? Object.entries(row.required_doc).map(([name, url]) => ({
                name,
                url,
              }))
            : [],
        }));

        setQuotations(mapped);
      })
      .catch(() => setQuotations([]))
      .finally(() => setLoading(false));
  }, [selectedRfp, token]);

  const filteredQuotations = quotations.filter((row) => {
    // Search by vendor, quotation no, etc.
    const searchMatch =
      !search ||
      (row.vendor_name &&
        row.vendor_name.toLowerCase().includes(search.toLowerCase())) ||
      (row.quotation_id && String(row.quotation_id).includes(search)) ||
      (row.rfp_id && String(row.rfp_id).includes(search));
    // Date filter
    const date = row.quotation_date ? new Date(row.quotation_date) : null;
    const from = dateFrom ? new Date(dateFrom) : null;
    const to = dateTo ? new Date(dateTo) : null;
    const dateMatch =
      (!from || (date && date >= from)) && (!to || (date && date <= to));
    return searchMatch && dateMatch;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filteredQuotations.length / rowsPerPage);

  const paginatedData = filteredQuotations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const handlePrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNextPage = () =>
    setCurrentPage((p) => Math.min(totalPages, p + 1));
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [filteredQuotations.length, totalPages]);

  const statusLifecycle = {
    Received: ["Rejected", "Technically Qualified", "Technically Disqualified"],
    "Technically Disqualified": ["Technically Qualified", "Rejected"],
    "Technically Qualified": [
      "Commercially Qualified",
      "Commercially Disqualified",
      "Rejected",
    ],
    "Commercially Disqualified": ["Rejected", "Commercially Qualified"],
    "Commercially Qualified": ["Negotiation", "Rejected"],
    Negotiation: ["Rejected", "Closed"],
  };

  const handleUpdateStatus = async () => {
    if (!selectedQuotation) return;

    const allQualified = Object.values(docStatus).every(
      (v) => v === "Qualified"
    );
    let newStatus = "Rejected";
    if (newStatus === "Commercially Qualified") {
      setShowCommercialModal(true);
    }
    // Status transition logic
    switch (selectedQuotation.status) {
      case "Received":
        newStatus = allQualified
          ? "Technically Qualified"
          : "Technically Disqualified";
        break;
      case "Technically Disqualified":
        newStatus = allQualified ? "Technically Qualified" : "Rejected";
        break;
      case "Technically Qualified":
        newStatus = allQualified
          ? "Commercially Qualified"
          : "Commercially Disqualified";
        break;
      case "Commercially Disqualified":
        newStatus = allQualified ? "Commercially Qualified" : "Rejected";
        break;
      case "Commercially Qualified":
        newStatus = allQualified ? "Negotiation" : "Rejected";
        break;
      case "Negotiation":
        newStatus = allQualified ? "Closed" : "Rejected";
        break;
      default:
        newStatus = "Rejected";
    }

    try {
      await axios.put(
        `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/update-status/${selectedQuotation.quotation_id}`,
        {
          status: newStatus,
          user_id: createdBy,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update status in quotations table
      setQuotations((prev) =>
        prev.map((q) =>
          q.quotation_id === selectedQuotation.quotation_id
            ? { ...q, status: newStatus }
            : q
        )
      );
      setShowDocModal(false);
    } catch (err) {
      alert("Failed to update status");
    }
  };
  const exportData = filteredQuotations.map((row, idx) => ({
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
      {/* <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} /> */}
      <div className="pl-4 pt-2">
        <button
          className="bg-[#0057FF] text-white font-semibold px-5 py-2 rounded-lg shadow mb-4"
          onClick={() => setShowPopup(true)}
        >
          + Manual Quotation
        </button>
      </div>
      <ManualQuotationModal
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        quotationOptions={rfpSelectOptions}
      />
      <div className="flex gap-4 mb-4 items-center">
        {/* Filters */}
        <div className="relative flex items-center">
          <span className="absolute left-3 text-gray-400 text-lg">
            <svg width="18" height="18" fill="none" stroke="currentColor">
              <circle cx="8" cy="8" r="7" strokeWidth="2" />
              <path d="M17 17L13 13" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            className="border rounded px-3 py-2 pl-9 w-56"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          options={rfpSelectOptions}
          value={
            selectedRfp ? { value: selectedRfp, label: selectedRfp } : null
          }
          onChange={(option) => setSelectedRfp(option ? option.value : "")}
          placeholder="Select RFP ID"
          isClearable
          isSearchable
          className="w-48"
          styles={{
            control: (base) => ({
              ...base,
              borderColor: "#ccc",
              borderRadius: "0.375rem",
            }),
          }}
        />
        <div className="flex items-center border rounded px-2 py-1">
          <input
            type="date"
            className="border-none outline-none px-2 py-1 bg-transparent"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            placeholder="dd/mm/yyyy"
          />
          <span className="mx-2 text-gray-500 font-medium">TO</span>
          <input
            type="date"
            className="border-none outline-none px-2 py-1 bg-transparent"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            placeholder="dd/mm/yyyy"
          />
          <span className="ml-2 text-gray-400">
            <svg width="18" height="18" fill="none" stroke="currentColor">
              <rect x="2" y="4" width="14" height="12" rx="2" strokeWidth="2" />
              <path d="M6 2v4M12 2v4" strokeWidth="2" />
            </svg>
          </span>
        </div>
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
              <th className="p-2">S. No.</th>
              <th className="p-2">Date</th>
              <th className="p-2">Quotation Id.</th>
              <th className="p-2">RFP ID</th>
              <th className="p-2">Vendor</th>
              <th className="p-2">Status</th>
              {/* <th className="py-2 px-3 font-medium text-left">Amount</th> */}
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-gray-400">
                  Please wait... Selected RFP is loading quotations.
                </td>
              </tr>
            ) : filteredQuotations.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  Select an RFP first to see quotations, or no quotations are
                  available.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row.quotation_id || idx} className="odd:bg-blue-50">
                  <td className="p-2">{idx + 1}.</td>
                  <td className="p-2">
                    {row.quotation_date
                      ? new Date(row.quotation_date).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" }
                        )
                      : "--"}
                  </td>
                  <td className="p-2">
                    {row.quotation_id ? (
                      <button
                        className="text-blue-600 underline"
                        onClick={() =>
                          navigate(`/quotation/${row.quotation_id}`)
                        }
                      >
                        {row.quotation_id}
                      </button>
                    ) : (
                      "--"
                    )}
                  </td>
                  <td className="p-2">{row.rfp_id || "--"}</td>
                  <td className="p-2">{row.vendor_name || "--"}</td>
                  <td className="p-2">
                    <button
                      className={`underline ${
                        row.status === "Negotiation" || "Closed"
                          ? "text-blue-600 "
                          : "text-blue-600 cursor-pointer"
                      }`}
                      onClick={() => {
                        if (row.status === "Negotiation") return;

                        setSelectedQuotation(row);

                        if (row.status === "Commercially Qualified") {
                          setShowCommercialModal(true);
                        } else {
                          setShowDocModal(true);

                          // Initialize docStatus for this quotation
                          if (row.documents) {
                            const initialStatus = {};
                            // documents may be objects {name, url} or plain urls; normalize to use url as key
                            row.documents.forEach((doc) => {
                              const key =
                                (typeof doc === "string" ? doc : doc?.url) ||
                                doc?.name ||
                                "";
                              if (key) initialStatus[key] = "Qualified";
                            });
                            setDocStatus(initialStatus);
                          }
                        }
                      }}
                    >
                      {row.status || "--"}
                    </button>
                  </td>
                  {/* <td className="py-2 px-3">
          ₹{row.total_with_tax ? Number(row.total_with_tax).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "--"}
        </td> */}
                  <td className="p-2">
                    <button
                      title="View History"
                      className="text-gray-600 hover:text-blue-600"
                      onClick={() => handleViewHistory(row.quotation_id)} // use actual ID
                    >
                      <Icon icon="mdi:history" width="20" height="20" />
                    </button>
                  </td>{" "}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {showHistoryModal && (
          <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-1/2 max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Quotation History</h2>
              <ul className="space-y-2">
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <li key={idx} className="border p-2 rounded shadow">
                      <p>
                        <strong>Version:</strong> {item.version}
                      </p>
                      <p>
                        <strong>Updated On:</strong>{" "}
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                      <p>
                        <strong>Quantity:</strong> {item.quantity}
                      </p>
                      <p>
                        <strong>Unit Price:</strong> ₹{item.unit_price}
                      </p>
                      <p>
                        <strong>Tax %:</strong> {item.tax_percentage}%
                      </p>
                      <p>
                        <strong>Tax Amount:</strong> ₹{item.tax_amount}
                      </p>
                      <p>
                        <strong>Total Amount:</strong> ₹{item.total_amount}
                      </p>
                      <p>
                        <strong>Total with Tax:</strong> ₹{item.total_with_tax}
                      </p>
                    </li>
                  ))
                ) : (
                  <p>No history found.</p>
                )}
              </ul>
              <button
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => setShowHistoryModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        {showDocModal && selectedQuotation && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                width: 400,
                padding: 24,
                borderRadius: 12,
                boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
                position: "relative",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: "#d32f2f",
                  cursor: "pointer",
                }}
                onClick={() => setShowDocModal(false)}
              >
                ×
              </button>
              <h2 style={{ fontWeight: 700, fontSize: 20, marginBottom: 16 }}>
                Documents
              </h2>
              {(selectedQuotation.documents || []).length > 0 ? (
                selectedQuotation.documents.map((doc, idx) => {
                  // doc may be a string (url) or an object { name, url }
                  const docUrl = typeof doc === "string" ? doc : doc?.url;
                  const docName =
                    (typeof doc === "string"
                      ? docUrl?.split("/").pop()
                      : doc?.name) ||
                    docUrl?.split("/").pop() ||
                    `Document-${idx + 1}`;
                  const statusKey = docUrl || docName;
                  return (
                    <div key={idx} style={{ marginBottom: 18 }}>
                      <div style={{ fontWeight: 500, marginBottom: 6 }}>
                        Document name
                      </div>
                      <div
                        style={{
                          border: "1px solid #eee",
                          borderRadius: "6px",
                          padding: "8px",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          marginBottom: 8,
                        }}
                      >
                        <img
                          src="pdf-icon.png"
                          alt="PDF"
                          style={{ width: 24, height: 24 }}
                        />
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#0052CC",
                            textDecoration: "underline",
                          }}
                        >
                          {docName}
                        </a>
                      </div>
                      <div style={{ display: "flex", gap: 18 }}>
                        <label>
                          <input
                            type="radio"
                            name={`status-${idx}`}
                            checked={docStatus[statusKey] === "Qualified"}
                            onChange={() =>
                              setDocStatus((prev) => ({
                                ...prev,
                                [statusKey]: "Qualified",
                              }))
                            }
                          />{" "}
                          Qualified
                        </label>
                        <label>
                          <input
                            type="radio"
                            name={`status-${idx}`}
                            checked={docStatus[statusKey] === "Disqualified"}
                            onChange={() =>
                              setDocStatus((prev) => ({
                                ...prev,
                                [statusKey]: "Disqualified",
                              }))
                            }
                          />{" "}
                          Disqualified
                        </label>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ marginTop: 12, color: "#888" }}>
                  No document uploaded yet.
                </div>
              )}

              <div style={{ display: "flex", gap: 16, marginTop: 24 }}>
                <button
                  style={{
                    background: "#0052CC", // stable blue instead of invalid token
                    color: "#fff",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={handleUpdateStatus}
                >
                  Update
                </button>
                <button
                  style={{
                    background: "#fff",
                    color: "#0052CC",
                    padding: "12px 32px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "1px solid #0052CC",
                    cursor: "pointer",
                  }}
                  onClick={() => setShowDocModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {showCommercialModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                background: "#fff",
                width: 340,
                padding: 24,
                borderRadius: 12,
                boxShadow: "0 4px 32px rgba(0,0,0,0.15)",
                position: "relative",
                textAlign: "center",
              }}
            >
              <button
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  background: "none",
                  border: "none",
                  fontSize: 22,
                  color: "#d32f2f",
                  cursor: "pointer",
                }}
                onClick={() => setShowCommercialModal(false)}
                aria-label="Close"
              >
                ×
              </button>
              <h2 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>
                Select Commercial Action
              </h2>
              <div style={{ color: "#555", marginBottom: 18 }}>
                Take the next step by choosing to negotiate or reject.
              </div>
              <div
                style={{ display: "flex", gap: 16, justifyContent: "center" }}
              >
                <button
                  style={{
                    background: "#0052CC",
                    color: "#fff",
                    padding: "10px 28px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    // Update status to Negotiation
                    await axios.put(
                      `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/update-status/${selectedQuotation.quotation_id}`,
                      {
                        status: "Negotiation",
                        user_id: createdBy,
                      },
                      { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setQuotations((prev) =>
                      prev.map((q) =>
                        q.quotation_id === selectedQuotation.quotation_id
                          ? { ...q, status: "Negotiation" }
                          : q
                      )
                    );
                    setShowCommercialModal(false);
                  }}
                >
                  Negotiate
                </button>
                <button
                  style={{
                    background: "#d32f2f",
                    color: "#fff",
                    padding: "10px 28px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: 16,
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={async () => {
                    // Update status to Rejected
                    await axios.put(
                      `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/quotations/update-status/${selectedQuotation.quotation_id}`,
                      {
                        status: "Rejected",
                        user_id: createdBy,
                      }
                    );
                    setQuotations((prev) =>
                      prev.map((q) =>
                        q.quotation_id === selectedQuotation.quotation_id
                          ? { ...q, status: "Rejected" }
                          : q
                      )
                    );
                    setShowCommercialModal(false);
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}
        {/* paginatedData */}
        <div className="flex justify-center items-center gap-2 mt-2">
          <button
            className="w-10 h-10 rounded border bg-[#FAFAF5] flex items-center justify-center disabled:opacity-50"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          <button className="w-10 h-10 rounded bg-blue-600 text-white font-bold">
            {currentPage}
          </button>
          <span className="mx-1">of</span>
          <button className="w-10 h-10 rounded border border-blue-600 text-blue-600 font-bold bg-white">
            {totalPages}
          </button>
          <button
            className="w-10 h-10 rounded border bg-[#FAFAF5] flex items-center justify-center disabled:opacity-50"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            &gt;
          </button>
        </div>
        {showPopupModal && (
          <PopupModal
            type={popupModalProps.type}
            // title={popupModalProps.title}
            message={popupModalProps.message}
            onClose={() => setShowPopupModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default Quotation;
