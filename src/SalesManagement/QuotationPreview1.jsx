import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
const baseUrl = process.env.REACT_APP_URL_sales || '';

const QuotationPreview = () => {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${baseUrl}/salesmanagement/quotation/preview/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setQuotation(response.data?.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quotation:", error);
        setLoading(false);
      }
    };

    fetchQuotation();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!quotation) return <div>No data found for quotation ID {id}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Quotation</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <p><strong>Quotation No.:</strong> {quotation.quotation.quotation_no}</p>
          <p><strong>Quotation Date:</strong> {new Date(quotation.quotation.quotation_date).toLocaleDateString()}</p>
          <p><strong>Validity Date:</strong> {new Date(quotation.quotation.validity_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p><strong>RFP ID:</strong> {quotation.quotation.rfp_id}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-xl">
          <h2 className="text-blue-600 text-lg font-semibold mb-2">Quotation From</h2>
          <p className="font-bold">{quotation.quotation_from.business_name}</p>
          <p>{quotation.quotation_from.address}</p>
          <p>{quotation.quotation_from.country} - {quotation.quotation_from.zip_code}</p>
          <p>GSTIN - {quotation.quotation_from.gstin}</p>
          <p>PAN - {quotation.quotation_from.pan}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-xl">
          <h2 className="text-blue-600 text-lg font-semibold mb-2">Quotation For</h2>
          <p className="font-bold">{quotation.quotation_for.customer_name}</p>
          <p>{quotation.quotation_for.address}</p>
          <p>{quotation.quotation_for.country} - {quotation.quotation_for.zip_code}</p>
          <p>GSTIN - {quotation.quotation_for.gstin}</p>
          <p>PAN - {quotation.quotation_for.pan}</p>
        </div>
      </div>

      <table className="w-full border-collapse">
        <thead className="bg-blue-600 text-white">
          <tr>
            <th className="px-4 py-2 text-left">Item</th>
            <th className="px-4 py-2 text-left">Quantity</th>
            <th className="px-4 py-2 text-left">Unit Rate</th>
            <th className="px-4 py-2 text-left">HSN / SAC</th>
            <th className="px-4 py-2 text-left">Tax (%)</th>
            <th className="px-4 py-2 text-left">Amount</th>
          </tr>
        </thead>
        <tbody>
          {quotation.items?.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
              <td className="px-4 py-2">{item.item_name}</td>
              <td className="px-4 py-2">{item.quantity}</td>
              <td className="px-4 py-2">₹{item.unit_rate}</td>
              <td className="px-4 py-2">{item.hsn_code}</td>
              <td className="px-4 py-2">{item.tax_percentage} %</td>
              <td className="px-4 py-2">₹{Number(item.amount).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 text-right">
        <p>Amount: ₹{quotation.quotation.amount}</p>
        <p>Taxable Amount: ₹{quotation.quotation.taxable_amount}</p>
        <p className="text-xl font-bold mt-2">
          Total (INR): ₹{quotation.quotation.total_amount}
        </p>
        <p className="mt-1 italic">In words: {quotation.quotation.amount_in_words}</p>
      </div>
    </div>
  );
};

export default QuotationPreview;
