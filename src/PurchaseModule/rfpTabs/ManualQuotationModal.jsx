import axios from "axios";
import { toWords } from "number-to-words";
import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Select from "react-select";
import PopupModal from "../PopupModal"
// ...existing code...
const defaultRow = () => ({
  item: "",
  description: "",
  quantity: 1,
  unit_price: 0,
  tax_percent: 0,
});

export default function ManualQuotationModal({
  isOpen,
  onClose,
  poNumber = "",
  quotationOptions = [],
  vendorOptions = [],
  onSaveDraft = () => { },
  onSend = () => { },
  onDownloadPdf = () => { },
}) {
  // ...existing code...
  const [quotationDate, setQuotationDate] = useState("");
  const [validityDate, setValidityDate] = useState("");
  const [rfpId, setRfpId] = useState("");
  const [vendor, setVendor] = useState(null);
  const [rows, setRows] = useState([
    {
      item: "",
      quantity: "",
      unitPrice: "",
      tax: "",
      description: "",
    },
  ]);
  const [notes, setNotes] = useState("");
  const navigate = useNavigate();
  const addRow = () => setRows((s) => [...s, defaultRow()]);
  const removeRow = (i) => setRows((s) => s.filter((_, idx) => idx !== i));
  const updateRow = (i, key, val) =>
    setRows((s) => s.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));

  //   new
  const token = sessionStorage.getItem("token");
  const location = useLocation();
  const initialRfpId = location.state?.rfpId || "";
  const [existingQuotations, setExistingQuotations] = useState([]);
  const [missingFields, setMissingFields] = useState([]);
  // const [rfpId, setRfpId] = useState("");
  const [rfpLoading, setRfpLoading] = useState(false);
  const [rfpError, setRfpError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [quotationNo, setQuotationNo] = useState(""); // If you want to set it
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdBy, setCreatedBy] = useState(null);

  // New local states for fetched vendor/rfp options
  const [vendorList, setVendorList] = useState(vendorOptions || []);
  const [rfpOptions, setRfpOptions] = useState([]);

  // totals memo
  const totals = useMemo(() => {
    let amount = 0;
    let taxable = 0;
    rows.forEach((r) => {
      const q = Number(r.quantity) || 0;
      const up = Number(r.unitPrice) || 0;
      const line = q * up;
      const tax = (line * (Number(r.tax) || 0)) / 100;
      taxable += line;
      amount += line + tax;
    });
    return { amount, taxable };
  }, [rows]);

  // fetch vendor list on mount if none provided
  useEffect(() => {
    if (vendorOptions && vendorOptions.length > 0) {
      // normalize provided vendorOptions to {value,label} showing supplier_id
      setVendorList(
        vendorOptions.map((v) => {
          const supplierId = v?.supplier_id ?? v?.id ?? v?.value ?? v;
          return typeof v === "object" && v.value
            ? { value: String(v.value), label: String(v.value) }
            : { value: String(supplierId), label: String(supplierId) };
        })
      );
      return;
    }

    const fetchVendors = async () => {
      try {
        const res = await axios.get(
          "https://devdemo.softtrails.net/purchase/supplier/list",
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );
        const data = res.data?.data || res.data || [];
        const opts = (Array.isArray(data) ? data : []).map((v) => {
          const supplierId = v?.supplier_id ?? v?.id ?? v?.vendor_id ?? v;
          return {
            value: String(supplierId),
            label: String(supplierId), // show supplier id in dropdown
          };
        });
        setVendorList(opts);
      } catch (err) {
        console.error("Failed to fetch vendor list:", err?.message || err);
      }
    };
    fetchVendors();
  }, []);

  // fetch rfps when vendor selected
  useEffect(() => {
    if (!vendor?.value) {
      setRfpOptions([]);
      return;
    }
    const fetchRfps = async () => {
      setRfpLoading(true);
      setRfpError("");
      try {
        const res = await axios.get(
          `https://devdemo.softtrails.net/purchase/rfps/${vendor.value}/rfpIDs`,
          { headers: { Authorization: token ? `Bearer ${token}` : "" } }
        );
        const data = res.data?.data || res.data || [];
        const opts = (Array.isArray(data) ? data : []).map((item) => ({
          value: item?.rfp_id ?? item?.rfpId ?? item,
          label: item?.rfp_id ?? item?.rfpId ?? String(item),
        }));
        setRfpOptions(opts);
      } catch (err) {
        console.error("Failed to fetch RFP IDs:", err?.message || err);
        setRfpError("Failed to load RFP IDs");
        setRfpOptions([]);
      } finally {
        setRfpLoading(false);
      }
    };
    fetchRfps();
  }, [vendor]);

  // fetch existing quotation for selected vendor + rfp
  useEffect(() => {
    if (!vendor?.value || !rfpId) {
      setExistingQuotations([]);
      return;
    }

    const toInputDate = (d) => {
      if (!d) return "";
      const dt = new Date(d);
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const fetchExisting = async () => {
      try {
        const url = `https://devdemo.softtrails.net/purchase/supplier_quotation/quotationDetails?rfp_id=${encodeURIComponent(
          rfpId
        )}&&vendor_id=${encodeURIComponent(vendor.value)}`;
        const res = await axios.get(url, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        const data = res.data?.data || res.data || [];
        const arr = Array.isArray(data) ? data : [data];

        setExistingQuotations(arr);

        if (arr.length > 0) {
          const mappedRows = arr.map((a) => ({
            item: a.asset_name ?? "",
            quantity: a.quantity ?? "",
            unitPrice: a.unit_price != null ? String(a.unit_price) : "",
            tax: a.tax_percentage != null ? String(a.tax_percentage) : "",
            description: a.description ?? "",
          }));

          setRows(mappedRows.length ? mappedRows : [defaultRow()]);

          const first = arr[0];
          setQuotationNo(first.quotation_id ?? "");
          setQuotationDate(
            toInputDate(first.quotation_date ?? first.quotationDate)
          );
          setValidityDate(
            toInputDate(first.validity_date ?? first.validityDate)
          );

          // Safely set vendor only if value actually differs.
          const fetchedVendorId =
            first.vendor_id != null ? String(first.vendor_id) : null;
          if (fetchedVendorId) {
            // prefer using existing option object from vendorList to avoid new object references
            const match = vendorList.find(
              (v) => String(v.value) === fetchedVendorId
            );
            if (match) {
              if (!vendor || String(vendor.value) !== String(match.value)) {
                setVendor(match);
              }
            } else {
              if (!vendor || String(vendor.value) !== fetchedVendorId) {
                setVendor({ value: fetchedVendorId, label: fetchedVendorId });
              }
            }
          } else if (first.vendor_name) {
            const nameVal = String(first.vendor_name);
            if (!vendor || String(vendor.value) !== nameVal) {
              setVendor({ value: nameVal, label: nameVal });
            }
          }
        } else {
          // no existing data -> keep rows default
          setRows([defaultRow()]);
        }
      } catch (err) {
        console.error(
          "Failed to fetch existing quotation:",
          err?.message || err
        );
        setExistingQuotations([]);
      }
    };
    fetchExisting();
  }, [vendor, rfpId, vendorList]);
  if (!isOpen) return null;

  const handleAddRow = () => {
    setRows([
      ...rows,
      {
        item: "",
        quantity: "",
        unitPrice: "",
        tax: "",
        description: "",
      },
    ]);
  };
  const getRowAmount = (row) => {
    const q = Number(row.quantity) || 0;
    const u = Number(row.unitPrice) || 0;
    const t = Number(row.tax) || 0;
    return q && u ? Math.round(q * u * (1 + t / 100)) : 0;
  };
  // Remove row
  const handleRemoveRow = (idx) => {
    setRows(rows.filter((_, i) => i !== idx));
  };

  // Update row
  const handleRowChange = (idx, field, value) => {
    const updated = [...rows];
    updated[idx][field] = value;

    setRows(updated);
  };

  const numberToWords = (num) => {
    if (num === null || num === undefined) return "";
    const n = Number(num);
    if (!Number.isFinite(n) || isNaN(n)) return "";

    const sign = n < 0 ? "Minus " : "";
    const absN = Math.abs(n);
    const intPart = Math.floor(absN);
    const paise = Math.round((absN - intPart) * 100);

    // Avoid converting numbers outside JS safe integer range
    if (intPart > Number.MAX_SAFE_INTEGER) {
      return `${sign}${intPart.toLocaleString()} rupees`;
    }

    try {
      const intWords =
        intPart === 0
          ? "Zero"
          : toWords(intPart).replace(/^\w/, (c) => c.toUpperCase());
      let result = `${sign}${intWords} rupees`;
      if (paise > 0) {
        const paiseWords = toWords(paise).replace(/^\w/, (c) =>
          c.toUpperCase()
        );
        result += ` and ${paiseWords} paise`;
      }
      return result;
    } catch (err) {
      console.error("numberToWords conversion failed:", err);
      return `${sign}${intPart.toLocaleString()} rupees`;
    }
  };
  const handleSaveAndNext = async (e) => {
    e.preventDefault();
    await handleSubmitQuotation(); // Let submission handle generation conditionally
  };
  const handleSubmitQuotation = async () => {
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    const row = rows[0] || {};
    const missing = [];
    if (!row.item) missing.push("item");
    if (!row.quantity) missing.push("quantity");
    if (!row.unitPrice) missing.push("unitPrice");
    if (!row.tax) missing.push("tax");
    if (!rfpId) missing.push("rfpId");
    if (!quotationDate) missing.push("quotationDate");
    if (!validityDate) missing.push("validityDate");
    if (!vendor?.value) missing.push("vendor");

    setMissingFields(missing);

    if (missing.length > 0) {
      setSubmitError("Please fill all required fields before submitting.");
      setSubmitting(false);
      return;
    }

    let finalQuotationId = quotationNo;

    // Generate quotation ID only if it doesn't exist
    if (!finalQuotationId) {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const dd = String(now.getDate()).padStart(2, "0");
      const datePart = yy + mm + dd;
      const indentId = row?.indent_id || "";
      const randomDigits = Math.floor(100 + Math.random() * 900);
      finalQuotationId = datePart + indentId + randomDigits;
      setQuotationNo(finalQuotationId);
    }

    try {
      const token = sessionStorage.getItem("token");
      const vendorName =
        vendor?.label || sessionStorage.getItem("userName") || ""; // fallback if available
      const userId = createdBy || sessionStorage.getItem("userId") || "";

      // Build payload for manual endpoint
      const assets = rows.map((r) => ({
        asset_name: r.item,
        quantity: Number(r.quantity) || 0,
        unit_price: Number(r.unitPrice) || 0,
        tax_percentage: Number(r.tax) || 0,
        description: r.description || "",
      }));

      const createPayload = {
        rfp_id: rfpId,
        quotation_id: finalQuotationId,
        quotation_date: quotationDate || undefined,
        validity_date: validityDate || undefined,
        vendor_id: String(vendor.value),
        vendorName: vendorName,
        assets,
      };

      // If an existing quotation was found -> update using existing logic if desired.
      // For manual flow we'll POST to the manual endpoint for creation
      if (existingQuotations.length > 0 && finalQuotationId) {
        // If vendor already has a quotation, call versions endpoint or allow POST as per API rules.
        // We attempt to POST to manual endpoint to add a new grouped manual quotation (API may dedupe server-side)
        await axios.post(
          "https://devdemo.softtrails.net/purchase/supplier_quotation/manual/quotation",
          createPayload,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setSubmitSuccess(
          "Manual quotation submitted (existing found) successfully!"
        );
      } else {
        // Create new manual quotation
        await axios.post(
          "https://devdemo.softtrails.net/purchase/supplier_quotation/manual/quotation",
          createPayload,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        setSubmitSuccess("Manual quotation submitted successfully!");
      }
      setShowSuccessPopup(true);
      // Optionally call callback
      if (onSend) onSend();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "";
      console.error("Quotation submission error:", msg);

      setSubmitError(msg || "Failed to submit/update quotation.");
    } finally {
      setSubmitting(false);
    }
  };
  const taxableAmount = rows.reduce(
    (sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unitPrice) || 0),
    0
  );
  const totalAmount = rows.reduce((sum, r) => sum + getRowAmount(r), 0);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 scrollbar-hide">
        <div className="bg-white rounded-xl w-full max-w-4xl shadow-lg relative max-h-[90vh] overflow-y-auto scrollbar-hide">
          {/* Header */}
          <div className="flex items-start justify-between px-8 py-6 border-b">
            <div>
              <h2 className="text-2xl font-semibold text-[#0B4A87]">
                Manual Quotation
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-black text-lg"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Top fields */}
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-0">
              <div className="flex flex-col gap-4 w-1/2">
                <div className="flex gap-8 items-center">
                  <label className="text-sm text-gray-600 block mb-2">
                    Quotation Date
                  </label>
                  <input
                    type="date"
                    value={quotationDate}
                    onChange={(e) => setQuotationDate(e.target.value)}
                    className="border-b border-gray-300 bg-transparent"
                  />
                </div>
                <div className="flex gap-8 items-center">
                  <label className="text-sm text-gray-600 block mb-2">
                    Validity Date
                  </label>
                  <input
                    type="date"
                    value={validityDate}
                    onChange={(e) => setValidityDate(e.target.value)}
                    className="mt-1 border-b border-gray-200 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-row-2 gap-4">
                <div className="flex gap-8 items-center">
                  <label className=" w-1/4 text-sm text-gray-600 block mb-2">
                    Vendor ID
                  </label>
                  <Select
                    options={vendorList}
                    value={vendor}
                    onChange={(opt) => {
                      setVendor(opt);
                      setRfpId("");
                    }}
                    className="mt-1 w-full border-gray-200 py-2 text-sm outline-none"
                    isClearable
                    placeholder="Select Vendor"
                  />
                </div>
                <div className="flex gap-8 items-center">
                  <label className=" w-1/4 text-sm text-gray-600 block mb-2">
                    RFP ID
                  </label>
                  <div className="w-full">
                    <Select
                      options={rfpOptions}
                      value={rfpOptions.find((o) => o.value === rfpId) || null}
                      onChange={(opt) => setRfpId(opt?.value || "")}
                      isLoading={rfpLoading}
                      placeholder={
                        rfpOptions.length ? "Select RFP" : "Enter RFP ID"
                      }
                      isClearable
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes & Totals */}
            <div className="rounded-2xl overflow-hidden mb-8">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-blue-600 text-white">
                    <th className="py-2 px-3 font-medium text-left rounded-tl-2xl">
                      Item
                    </th>
                    <th className="py-2 px-3 font-medium text-left">Quantity</th>
                    <th className="py-2 px-3 font-medium text-left">
                      Unit Price
                    </th>
                    <th className="py-2 px-3 font-medium text-left">Tax%</th>
                    <th className="py-2 px-3 font-medium text-left">Amount</th>
                    <th className="py-2 px-3 rounded-tr-2xl"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <React.Fragment key={idx}>
                      <tr className="bg-[#F4F8FC]">
                        <td className="py-3 px-3 align-top">
                          <input
                            className={`w-full bg-transparent border-0 border-b ${missingFields.includes("item")
                                ? "border-red-500"
                                : "border-gray-300"
                              } focus:ring-0 focus:border-blue-400 text-gray-900`}
                            value={row.item}
                            onChange={(e) =>
                              handleRowChange(idx, "item", e.target.value)
                            }
                            placeholder="Item"
                          />
                        </td>
                        <td className="py-3 px-3 align-top">
                          <input
                            type="number"
                            className={`w-full bg-transparent border-0 border-b ${missingFields.includes("quantity")
                                ? "border-red-500"
                                : "border-gray-300"
                              } focus:ring-0 focus:border-blue-400 text-gray-900`}
                            value={row.quantity}
                            onChange={(e) =>
                              handleRowChange(idx, "quantity", e.target.value)
                            }
                            placeholder="Qty"
                            min="0"
                          />
                        </td>
                        <td className="py-3 px-3 align-top">
                          <input
                            type="number"
                            className={`w-full bg-transparent border-0 border-b ${missingFields.includes("unitPrice")
                                ? "border-red-500"
                                : "border-gray-300"
                              } focus:ring-0 focus:border-blue-400 text-gray-900`}
                            value={row.unitPrice}
                            onChange={(e) =>
                              handleRowChange(idx, "unitPrice", e.target.value)
                            }
                            placeholder="₹"
                            min="0"
                          />
                        </td>
                        <td className="py-3 px-3 align-top">
                          <input
                            type="number"
                            className={`w-full bg-transparent border-0 border-b ${missingFields.includes("tax")
                                ? "border-red-500"
                                : "border-gray-300"
                              } focus:ring-0 focus:border-blue-400 text-gray-900`}
                            value={row.tax}
                            onChange={(e) =>
                              handleRowChange(idx, "tax", e.target.value)
                            }
                            placeholder="%"
                            min="0"
                          />
                        </td>
                        <td className="py-3 px-3 align-top font-medium text-gray-900">
                          ₹{getRowAmount(row)}
                        </td>
                        <td className="py-3 px-3 align-top">
                          {rows.length > 1 && (
                            <button
                              type="button"
                              className="text-gray-400 hover:text-red-600 text-lg"
                              onClick={() => handleRemoveRow(idx)}
                            >
                              ×
                            </button>
                          )}
                        </td>
                      </tr>
                      <tr className="bg-[#F4F8FC]">
                        <td colSpan={6} className="py-1 px-3 text-xs">
                          <div style={{ fontSize: 11, color: "#555" }}>
                            {typeof row.description === "object"
                              ? row.description.description
                              : row.description}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                  <tr>
                    <td colSpan={6} className="py-2 px-3 text-center">
                      <button
                        type="button"
                        className="text-blue-600 flex items-center gap-1 mx-auto border border-dashed border-gray-400 w-full justify-center rounded-lg py-2"
                        onClick={handleAddRow}
                        style={{ background: "#F4F8FC" }}
                      >
                        <span className="text-lg">＋</span> Add new line
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end gap-12">
              <div className="text-right">
                <div className="mb-1">
                  Amount{" "}
                  <span className="ml-4 font-medium">₹{taxableAmount}</span>
                </div>
                <div className="mb-1">
                  Taxable amount{" "}
                  <span className="ml-4 font-medium">
                    ₹{totalAmount - taxableAmount}
                  </span>
                </div>
                <div className="mb-1 font-bold text-lg mt-4">
                  Total(INR){" "}
                  <span className="ml-4 text-2xl text-black">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Total (in words)
                  <br />
                  <span className="text-black font-bold">
                    {numberToWords(totalAmount)}
                  </span>{" "}
                </div>
              </div>
            </div>
          </div>
          <div className=" m-4">
            <div className="flex justify-end items-center gap-4 mt-6">
              <button
                className="text-gray-700 px-6 py-2 rounded-lg font-semibold shadow hover:bg-gray-100 transition"
                onClick={() => navigate("/app/allquotation")}
              >
                Back
              </button>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
                onClick={handleSaveAndNext}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Save & Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {showSuccessPopup && (
        <PopupModal
          type="success"
          title="Success"
          message={submitSuccess || "Quotation submitted successfully."}
          onClose={() => {
            setShowSuccessPopup(false);
            // close the manual quotation modal
            try { onClose?.(); } catch (e) { }
            // navigate back to quotations list
            // navigate("/app/allquotation");
          }}
        />
      )}
    </>
  );
}
