import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import PopupModal from "../PopupModal";
const QuotationView = () => {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [showPopupModal, setShowPopupModal] = useState(false);
  const [popupModalProps, setPopupModalProps] = useState({ type: "success", message: "" });

  const handleShortlist = async () => {
    if (!data) return;
    // prevent double submit
    if (shortlistLoading) return;
    setShortlistLoading(true);
    try {
      const payload = {
        rfp_id: data.rfp_id || data.rfpId || rfpId,
        quotation_id: data.quotation_id || data.quotationId || quotationNo,
        vendor_id: data.vendor_id ?? data.vendorId ?? data.vendor_id ?? data.vendor_id,
        status: "Shortlisted",
      };
      const url = `https://devdemo.softtrails.net/purchase/supplier_quotation/shortlist`;
      const res = await axios.patch(url, payload, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      // update local state so UI reflects new status
      setData((d) => ({ ...(d || {}), status: "Shortlisted" }));

      setPopupModalProps({
        type: "success",
        message: res.data?.message || "Quotation shortlisted successfully",
      });
      setShowPopupModal(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to shortlist";
      setPopupModalProps({ type: "error", message: msg });
      setShowPopupModal(true);
    } finally {
      setShortlistLoading(false);
    }
  };
  // ...existing code...
  useEffect(() => {
    const fetchQuotation = async () => {
      if (!quotationId) return setLoading(false);
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_PURCHASE_API}/supplier_quotation/Allquotations/${quotationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Normalize payload: API may return array of rows or a single object.
        const raw = res.data?.data ?? res.data ?? null;

        if (!raw) {
          setData(null);
          return;
        }

        // Case A: API returned an array
        if (Array.isArray(raw)) {
          if (raw.length === 0) {
            setData(null);
            return;
          }

          // If server returned multiple rows representing line items for the same quotation,
          // merge common meta into a single object and attach items array.
          const first = raw[0];

          // Heuristic to decide if array is "rows for one quotation"
          const looksLikeLineItems = raw.every(
            (r) =>
              (r.quotation_id && r.quotation_id === first.quotation_id) ||
              "asset_name" in r ||
              "item_name" in r
          );

          if (looksLikeLineItems) {
            const items = raw.map((r) => ({
              asset_name:
                r.asset_name ?? r.item_name ?? r.name ?? r.material_name,
              quantity: r.quantity ?? r.qty,
              unit_price: r.unit_price ?? r.price ?? r.amount,
              tax_percentage: r.tax_percentage ?? r.tax,
              total_amount: r.total_amount ?? r.amount,
              description: r.description ?? r.desc ?? "",
              uom: r.uom ?? "",
            }));

            const merged = {
              // copy main/top-level fields from first row
              quotation_id: first.quotation_id ?? first.id,
              rfp_id: first.rfp_id ?? first.rfpId,
              vendor_name: first.vendor_name ?? first.vendor,
              vendor_contact_name:
                first.vendor_contact_name ?? first.vendor_contact,
              quotation_date: first.quotation_date ?? first.date,
              validity_date: first.validity_date ?? first.validity,
              status: first.status,
              vendor_id: first.vendor_id,
              // attach normalized items
              items,
              // keep raw for debugging if needed
              _raw: raw,
            };
            setData(merged);
          } else {
            // Array but not clearly line-items: pick first object as fallback
            setData(raw[0]);
          }
        } else if (typeof raw === "object") {
          // Case B: single object returned — keep as-is
          setData(raw);
        } else {
          setData(null);
        }
      } catch (err) {
        console.error("Failed to fetch quotation:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [quotationId, token]);
  // ...existing code...

  if (loading) return <div className="p-6">Loading quotation...</div>;

  if (!data)
    return (
      <div className="p-6">
        <div className="mb-4">Quotation not found.</div>
        <button className="border px-4 py-2" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>
    );

  // Try to resolve common fields
  const quotationNo = data.quotation_id || data.quotationId || data.id || "--";
  const quotationDate = data.quotation_date || data.date || null;
  const validity = data.validity_date || data.validity || "--";
  const rfpId = data.rfp_id || data.rfpId || "--";
  const vendor = data.vendor_name || data.vendor || "--";

  // Items may be under different keys
  const items =
    data.items ||
    data.line_items ||
    data.required_items ||
    data.quotation_items ||
    [];

  // If items not found, try to detect an items-like array inside the payload
  const detectItemsFromData = (payload) => {
    if (!payload || typeof payload !== "object") return [];
    for (const key of Object.keys(payload)) {
      const val = payload[key];
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object") {
        const sample = val[0];
        if (
          "quantity" in sample ||
          "unit_price" in sample ||
          "asset_name" in sample ||
          "item_name" in sample ||
          "total_amount" in sample ||
          "amount" in sample
        ) {
          console.debug("Detected items array under key:", key, val);
          return val;
        }
      }
    }
    return [];
  };
  let resolvedItems =
    Array.isArray(items) && items.length > 0
      ? items
      : detectItemsFromData(data);
  if (
    (!resolvedItems || resolvedItems.length === 0) &&
    data &&
    typeof data === "object"
  ) {
    // Heuristic: treat top-level object as a single line item if it has typical item fields
    const singleItemKeys = [
      "asset_name",
      "item_name",
      "name",
      "material_name",
      "quantity",
      "unit_price",
      "total_amount",
      "amount",
    ];
    const hasItemFields = singleItemKeys.some((k) => k in data);
    if (hasItemFields) resolvedItems = [data];
  }
  // Totals calculation helpers
  const parseNumber = (v) => {
    if (v == null) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  const amount = (resolvedItems || []).reduce((acc, it) => {
    const line =
      parseNumber(it.total_amount) ||
      parseNumber(it.unit_price) * parseNumber(it.quantity);
    return acc + line;
  }, 0);

  const taxTotal = (resolvedItems || []).reduce((acc, it) => {
    const base =
      parseNumber(it.total_amount) ||
      parseNumber(it.unit_price) * parseNumber(it.quantity);
    const taxPerc = parseNumber(it.tax_percentage) || parseNumber(it.tax) || 0;
    return acc + (base * taxPerc) / 100;
  }, 0);

  const totalWithTax = amount + taxTotal;

  // Simple number to words (supports up to crores)
  const numberToWords = (num) => {
    if (!Number.isFinite(num)) return "zero rupees";
    const a = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const b = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    const inWords = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " hundred" +
          (n % 100 ? " " + inWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          inWords(Math.floor(n / 1000)) +
          " thousand" +
          (n % 1000 ? " " + inWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          inWords(Math.floor(n / 100000)) +
          " lakh" +
          (n % 100000 ? " " + inWords(n % 100000) : "")
        );
      return (
        inWords(Math.floor(n / 10000000)) +
        " crore" +
        (n % 10000000 ? " " + inWords(n % 10000000) : "")
      );
    };

    const rounded = Math.floor(Math.abs(num));
    const words = rounded === 0 ? "zero" : inWords(rounded);
    return words.charAt(0).toUpperCase() + words.slice(1) + " rupees.";
  };

  const totalInWords = numberToWords(Math.round(totalWithTax));

  return (
    <div className="p-6 min-h-[70vh]">
      {/* Top breadcrumb/header (back button + breadcrumbs + RFP id) */}
      <div className="bg-white rounded-xl p-4 mb-4 flex items-center justify-between shadow">
        <div className="flex items-center ">
          <button
            onClick={() => navigate(-1)}
            className="text-2xl p-2 rounded-full hover:bg-gray-100"
            aria-label="Back"
          >
            ←
          </button>
          <div>
            <div className="text-xs text-gray-600">
              Vendor ID  &nbsp;
              {vendor || "Vendor Name"} &nbsp; &gt; &nbsp;{" "}
              {data.contact_person || data.vendor_contact_name || ""} &nbsp;
              &gt; &nbsp;
            </div>
            <div className="text-sm font-semibold mt-1">{rfpId || "--"}</div>
          </div>
        </div>
        {/* Right side intentionally left empty (removed Reject Quotation button) */}
        <div className="flex items-center justify-end">
          <button
            className={`bg-[#0057FF] text-white font-semibold px-5 py-2 rounded-lg shadow disabled:opacity-60`}
            onClick={handleShortlist}
            disabled={shortlistLoading || (data && data.status === "Shortlisted")}
          >
            {shortlistLoading ? "Processing..." : (data && data.status === "Shortlisted" ? "Shortlisted" : "Shortlist")}
          </button>
        </div>
      </div>
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Quotation</h2>
            <div className="mt-3 text-sm text-gray-700">
              <div>
                <strong>Quotation No.</strong> {quotationNo}
              </div>
              <div>
                <strong>Quotation date</strong>{" "}
                {quotationDate
                  ? new Date(quotationDate).toLocaleDateString()
                  : "--"}
              </div>
              <div>
                <strong>Validity date</strong>{" "}
                {validity ? new Date(validity).toLocaleDateString() : "--"}
              </div>
            </div>
          </div>
          <div className="text-right text-sm text-gray-700">
            <div>
              <strong>RFP ID.</strong> {rfpId}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left">Item & Description</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Tax (%)</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {resolvedItems && resolvedItems.length > 0 ? (
                resolvedItems.map((it, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 align-top">
                      <div className="font-semibold">
                        {it.asset_name ||
                          it.item_name ||
                          it.name ||
                          it.material_name ||
                          "Item"}
                      </div>
                      <div className="text-sm text-gray-600">
                        {it.description || it.desc || ""}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      {it.quantity ?? it.qty ?? "--"}
                    </td>
                    <td className="p-3 text-center">
                      {it.unit_price
                        ? `₹${Number(it.unit_price).toLocaleString()}`
                        : it.price
                          ? `₹${it.price}`
                          : "--"}
                    </td>
                    <td className="p-3 text-center">
                      {it.tax_percentage ?? it.tax ?? "--"}
                    </td>
                    <td className="p-3 text-center">
                      {it.total_amount
                        ? `₹${Number(it.total_amount).toLocaleString()}`
                        : it.amount
                          ? `₹${it.amount}`
                          : "--"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-600">
                    No line items available for this quotation.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals - right aligned to match screenshot */}
        <div className="mt-6 flex justify-end">
          <div className="w-full md:w-1/3 lg:w-1/4 p-4">
            <div className="border rounded p-4">
              <div className="flex justify-between text-sm text-gray-600">
                <div>Amount</div>
                <div>
                  ₹
                  {amount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <div>Taxable amount</div>
                <div>
                  ₹
                  {(amount - taxTotal).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between items-end">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">Total(INR)</div>
                  {/* <div className="text-xs text-gray-500 mt-1">Total (in words)</div>
                  <div className="text-sm mt-1">{totalInWords}</div> */}
                </div>

                <div className="text-2xl font-bold">
                  ₹
                  {totalWithTax.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showPopupModal && (
        <PopupModal
          type={popupModalProps.type}
          message={popupModalProps.message}
          onClose={() => setShowPopupModal(false)}
        />
      )}
    </div>
  );
};

export default QuotationView;
