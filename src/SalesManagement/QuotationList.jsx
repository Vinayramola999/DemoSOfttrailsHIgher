import React, { useState, useEffect } from "react";
import axios from "axios";
import QuotationPreviewPopup from "./service/QuotationPreviewPopup";

const baseUrl = process.env.REACT_APP_URL_sales || '';

export default function QuotationList() {
  const [selectedRfpId, setSelectedRfpId] = useState(null);
  const [allQuotations, setAllQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          `${baseUrl}/salesmanagement/quotation/allquotation`,
          { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
        );
        setAllQuotations(response.data?.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching quotations:", err);
        setError("Failed to load quotations");
      } finally {
        setLoading(false);
      }
    };
    fetchQuotations();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading quotations...</div>;
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Quotation List</h1>

      {allQuotations.length === 0 ? (
        <p className="text-gray-600">No quotations found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-2 text-left">Quotation No</th>
                <th className="p-2 text-left">RFP ID</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {allQuotations.map((item, idx) => (
                <tr key={idx} className="border-t hover:bg-gray-50">
                  <td className="p-2">{item.quotation?.quotation_no || "-"}</td>
                  <td className="p-2">{item.quotation?.rfp_id || "-"}</td>
                  <td className="p-2">{item.quotation_for?.customer_name || "-"}</td>
                  <td className="p-2">
                    {item.quotation?.quotation_date
                      ? new Date(item.quotation.quotation_date).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="p-2">{item.quotation?.status || "-"}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => setSelectedRfpId(item.quotation?.rfp_id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedRfpId && (
        <QuotationPreviewPopup
          rfpId={selectedRfpId}
          onClose={() => setSelectedRfpId(null)}
        />
      )}
    </div>
  );
}
