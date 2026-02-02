import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
const baseUrl = process.env.REACT_APP_URL_sales || '';

const QuotationPreviewPopup = ({ rfpId, onClose }) => {
  const [quotationData, setQuotationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const cacheRef = useRef({});

  useEffect(() => {
    if (!rfpId) return;

    // If we have cached data for this rfpId, use it and avoid network call
    if (cacheRef.current[rfpId]) {
      console.debug(`QuotationPreview: using cached data for ${rfpId}`);
      setQuotationData(cacheRef.current[rfpId]);
      setLoading(false);
      return;
    }

    const fetchQuotationData = async () => {
      setLoading(true);
      setErrorMsg(null);
      const token = sessionStorage.getItem("token");
      const start = performance.now();
      try {
        const res = await axios.get(
          `${baseUrl}/purchase/sales/salesIndenting/quotationData/${rfpId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
            },
            timeout: 20000,
          }
        );

        const duration = Math.round(performance.now() - start);
        const payloadSize = res && res.data ? JSON.stringify(res.data).length : 0;
        console.info(`QuotationPreview: fetched ${rfpId} in ${duration}ms (payload ${payloadSize} bytes)`);

        if (res.data && res.data.success) {
          setQuotationData(res.data.data);
          // cache the data so opening the same rfp is instant
          cacheRef.current[rfpId] = res.data.data;
        } else {
          const msg = res.data?.message || "No data returned";
          console.warn("QuotationPreview: unexpected response", res.data);
          setErrorMsg(msg);
        }
      } catch (err) {
        console.error("Error fetching quotation:", err);
        const serverMsg = err.response?.data?.message || err.message || "Request failed";
        setErrorMsg(serverMsg + (err.response?.data?.error ? ` — ${err.response.data.error}` : ""));
      } finally {
        setLoading(false);
      }
    };

    fetchQuotationData();
  }, [rfpId]);

  if (!rfpId || loading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg text-center">
          {errorMsg ? (
            <div className="text-red-600">Error: {errorMsg}</div>
          ) : (
            "Loading..."
          )}
        </div>
      </div>
    );

  const vendor = quotationData[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white w-[900px] rounded-xl shadow-xl overflow-y-auto max-h-[90vh] relative p-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-600 text-xl hover:text-red-500"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-blue-700 mb-4">Quotation</h2>

        {/* Header */}
        <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
          <div>
            <p>
              <strong>Quotation No:</strong> {vendor?.quotation_id}
            </p>
            <p>
              <strong>Quotation Date:</strong>{" "}
              {new Date(vendor?.quotation_date).toLocaleDateString()}
            </p>
            <p>
              <strong>Validity Date:</strong>{" "}
              {new Date(vendor?.validity_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p>
              <strong>RFP ID:</strong> {vendor?.rfp_id}
            </p>
            <p>
              <strong>Vendor:</strong> {vendor?.vendor_name}
            </p>
            <p>
              <strong>Status:</strong> {vendor?.status}
            </p>
          </div>
        </div>

        {/* Vendor Info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-semibold text-blue-700">Quotation From</h3>
            <p>Higher India Private Limited</p>
            <p>Dehradun, Uttarakhand - 248001</p>
            <p>GSTIN - 987654323445679</p>
            <p>PAN - 0987654323456789</p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h3 className="font-semibold text-blue-700">Quotation For</h3>
            <p>{vendor?.vendor_name}</p>
            <p>Contact: {vendor?.vendor_contact_name}</p>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border text-sm mb-6">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="py-2 px-3 text-left">Item</th>
              <th className="py-2 px-3 text-center">Qty</th>
              <th className="py-2 px-3 text-center">Unit Price</th>
              <th className="py-2 px-3 text-center">Tax (%)</th>
              <th className="py-2 px-3 text-center">Amount</th>
            </tr>
          </thead>
          <tbody>
            {quotationData.map((item, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">
                  <div className="font-semibold">{item.asset_name}</div>
                  <div className="text-gray-500 text-xs">
                    {item.description}
                  </div>
                </td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-center">₹{item.unit_price}</td>
                <td className="text-center">{item.tax_percentage}%</td>
                <td className="text-center font-semibold">
                  ₹{item.total_amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total Section */}
        <div className="text-right pr-8">
          <p>Taxable amount: ₹{vendor?.total_amount}</p>
          <p>Tax amount: ₹{vendor?.tax_amount}</p>
          <p className="font-bold text-lg mt-2">
            Total (INR): ₹{vendor?.total_with_tax}
          </p>
          <p className="text-sm text-gray-600">
            (in words) —{" "}
            <em>Twenty-seven lakh sixty thousand rupees.</em>
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuotationPreviewPopup;
