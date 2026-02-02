import React from "react";
import softTrailsLogo from "../../assests/SoftTrails.png";
export default function generatePurchaseOrderPDF({
  company = {
    name: "Higher India Pvt Ltd",
    address: "2/1 Raipur Road,Survey Chowk,",
    city: "Dehradun, Uttarakhand, 248001",
    country: "India",
    gst: "27AABCT1234L1Z5",
    pan: "Generate",
  },
  supplier = {},
  order = {},
  items = [],
  terms = [],
}) {
  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl">
        <div className="w-full bg-white relative overflow-hidden font-roboto">
          {/* Header Section */}
          <div className="px-4 sm:px-5 pt-6 pb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:gap-10">
              {/* Left Column - Logo and Company Info */}
              <div className="flex-1 sm:-mt-1">
                <div className="mb-6">
                  <img
                    src={softTrailsLogo}
                    alt="Soft Trails Logo"
                    className="w-40 h-auto mb-5"
                    style={{ width: "170px", height: "34px" }}
                  />
                </div>
                <div className="space-y-2">
                  <div
                    className="text-gray-900 font-semibold"
                    style={{ fontSize: "16px", lineHeight: "22px" }}
                  >
                    {company.name}
                  </div>
                  <div
                    className="text-gray-800"
                    style={{ fontSize: "12px", lineHeight: "18px" }}
                  >
                    {company.address}
                  </div>
                  <div
                    className="text-gray-800"
                    style={{ fontSize: "12px", lineHeight: "18px" }}
                  >
                    {company.city}
                  </div>
                  <div
                    className="text-gray-800"
                    style={{ fontSize: "12px", lineHeight: "18px" }}
                  >
                    {company.country}
                  </div>
                  <div
                    className="text-gray-800"
                    style={{ fontSize: "12px", lineHeight: "18px" }}
                  >
                    <span>GST No: </span>
                    <span>{company.gst}</span>
                  </div>
                  <div
                    className="text-gray-800"
                    style={{ fontSize: "12px", lineHeight: "18px" }}
                  >
                    <span>PAN No: </span>
                    <span>{company.pan}</span>
                  </div>
                </div>
              </div>
              {/* Right Column - Order Info and Supplier Details */}
              <div className="flex-1 text-right sm:text-right flex flex-col items-end">
                <h1
                  className="font-bold text-right mb-1"
                  style={{
                    fontSize: "18px",
                    lineHeight: "24px",
                    color: "#2563EB",
                  }}
                >
                  Purchase Order placed on
                </h1>
                <div className="space-y-0.5 mb-4">
                  <div
                    className="text-gray-700"
                    style={{ fontSize: "11px", lineHeight: "18px" }}
                  >
                    <span className="font-medium">PO Number: </span>
                    <span>{order.number}</span>
                  </div>
                  <div
                    className="text-gray-700"
                    style={{ fontSize: "11px", lineHeight: "18px" }}
                  >
                    <span className="font-medium">Date: </span>
                    <span>{order.date}</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded p-4 mt-2 bg-gray-50 w-full max-w-xs">
                  <div
                    className="space-y-0.5 text-right"
                    style={{
                      maxWidth: 280,
                      width: "100%",
                      wordBreak: "break-word",
                    }}
                  >
                    {supplier?.name ? (
                      <div
                        className="text-gray-800 font-semibold"
                        style={{ fontSize: "11px", lineHeight: "18px" }}
                      >
                        {supplier.name}
                      </div>
                    ) : null}

                    {supplier?.address ? (
                      <div
                        className="text-gray-700"
                        style={{ fontSize: "10px", lineHeight: "16px" }}
                      >
                        {supplier.address}
                      </div>
                    ) : null}

                    {supplier?.city ? (
                      <div
                        className="text-gray-700"
                        style={{ fontSize: "10px", lineHeight: "16px" }}
                      >
                        {supplier.city}
                      </div>
                    ) : null}

                    {supplier?.phone ? (
                      <div
                        className="text-gray-700"
                        style={{ fontSize: "10px", lineHeight: "16px" }}
                      >
                        <span className="font-medium">Phone: </span>
                        <span>{supplier.phone}</span>
                      </div>
                    ) : null}

                    {supplier?.gst ? (
                      <div
                        className="text-gray-700"
                        style={{ fontSize: "10px", lineHeight: "16px" }}
                      >
                        <span className="font-medium">GSTIN: </span>
                        <span>{supplier.gst}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Table Section */}
          <div className="mx-4 sm:mx-5 mb-6">
            <div className="w-full overflow-x-auto">
              <table
                className="w-full text-xs border-collapse border border-blue-400"
                style={{ fontSize: "9px" }}
              >
                <thead>
                  <tr className="bg-blue-50">
                    <th
                      className="border-r border-blue-400 px-2 py-2.5 text-center font-semibold text-gray-700"
                      style={{ minWidth: "40px" }}
                    >
                      S. No
                    </th>
                    <th
                      className="border-r border-blue-400 px-2 py-2.5 text-center font-semibold text-gray-700"
                      style={{ minWidth: "80px" }}
                    >
                      Item
                    </th>
                    <th
                      className="border-r border-blue-400 px-3 py-2.5 text-center font-semibold text-gray-700"
                      style={{ minWidth: "120px" }}
                    >
                      Description
                    </th>
                    <th
                      className="border-r border-blue-400 px-2 py-2.5 text-center font-semibold text-gray-700"
                      style={{ minWidth: "50px" }}
                    >
                      U/M
                    </th>
                    <th
                      className="border-r border-blue-400 px-2 py-2.5 text-center font-semibold text-gray-700"
                      style={{ minWidth: "80px" }}
                    >
                      Unit Price
                    </th>
                    <th
                      className="border-r border-blue-400 px-2 py-2.5 text-center font-semibold text-gray-700"
                      style={{ minWidth: "50px" }}
                    >
                      Qty
                    </th>
                    <th
                      className="border-r border-blue-400 px-2 py-2.5 text-center font-semibold text-gray-700"
                      style={{ minWidth: "50px" }}
                    >
                      Tax
                    </th>
                    <th
                      className="border-r border-blue-400 px-2 py-2.5 text-center font-semibold text-gray-700"
                      style={{ minWidth: "80px" }}
                    >
                      Total
                    </th>
                    <th
                      className="px-2 py-2.5 text-left font-semibold text-gray-700"
                      style={{ minWidth: "90px" }}
                    >
                      Total with Tax
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const qty = item.qty ?? item.quantity ?? 0;
                    const unitPrice = item.unitPrice ?? item.unit_price ?? 0;
                    const lineTotal = item.total ?? qty * unitPrice;
                    const taxPerc = item.tax ?? item.tax_percentage ?? 0;
                    const totalWithTax =
                      lineTotal + (lineTotal * (taxPerc || 0)) / 100;
                    return (
                      <tr
                        key={idx}
                        className="border-b border-gray-300 bg-white"
                      >
                        <td
                          className="border-r border-gray-300 px-2 py-2.5 text-center text-gray-800"
                          style={{ fontSize: "9px" }}
                        >
                          {item.sr || idx + 1}
                        </td>
                        <td
                          className="border-r border-gray-300 px-2 py-2.5 text-left text-gray-800"
                          style={{ fontSize: "9px" }}
                        >
                          {item.item ||
                            item.product_name ||
                            item.name ||
                            "Item"}
                        </td>
                        <td
                          className="border-r border-gray-300 px-3 py-2.5 text-left text-gray-800"
                          style={{ fontSize: "9px" }}
                        >
                          {item.description || item.desc || "Item description"}
                        </td>
                        <td
                          className="border-r border-gray-300 px-2 py-2.5 text-center text-gray-800"
                          style={{ fontSize: "9px" }}
                        >
                          {item.uom || item.unit || "Nos"}
                        </td>
                        <td
                          className="border-r border-gray-300 px-2 py-2.5 text-left text-gray-800"
                          style={{ fontSize: "9px" }}
                        >
                          Rs {Number(unitPrice).toFixed(0)}
                        </td>
                        <td
                          className="border-r border-gray-300 px-2 py-2.5 text-center text-gray-800"
                          style={{ fontSize: "9px" }}
                        >
                          {qty}
                        </td>
                        <td
                          className="border-r border-gray-300 px-2 py-2.5 text-center text-gray-800"
                          style={{ fontSize: "9px" }}
                        >
                          {taxPerc ? `${taxPerc}%` : "0%"}
                        </td>
                        <td
                          className="border-r border-gray-300 px-2 py-2.5 text-left text-gray-800"
                          style={{ fontSize: "9px" }}
                        >
                          Rs {Number(lineTotal).toFixed(2)}
                        </td>
                        <td
                          className="px-2 py-2.5 text-left text-gray-800"
                          style={{ fontSize: "9px" }}
                        >
                          Rs {Number(totalWithTax).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          {/* Terms and Conditions Section */}
          <div className="mx-4 sm:mx-5 mb-6">
            <h3
              className="text-gray-800 font-semibold mb-2"
              style={{
                fontSize: "13px",
                fontWeight: "600",
                lineHeight: "20px",
              }}
            >
              Terms and Conditions:
            </h3>
            <div
              className="space-y-1 text-gray-700"
              style={{ fontSize: "9px", lineHeight: "18px" }}
            >
              {(terms || []).map((term, idx) => (
                <div key={idx} className="flex">
                  <span className="mr-2">•</span>
                  <span>
                    {term.title
                      ? `${term.title}: ${term.description}`
                      : term.description || term}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Total Amount Section */}
          {/* Compute totals */}
          {(() => {
            const computedAmount = items.reduce((acc, it) => {
              const qty = it.qty ?? it.quantity ?? 0;
              const unitPrice = it.unitPrice ?? it.unit_price ?? 0;
              const line = it.total ?? qty * unitPrice;
              return acc + Number(line || 0);
            }, 0);

            const computedTax = items.reduce((acc, it) => {
              const qty = it.qty ?? it.quantity ?? 0;
              const unitPrice = it.unitPrice ?? it.unit_price ?? 0;
              const line = it.total ?? qty * unitPrice;
              const taxPerc = it.tax ?? it.tax_percentage ?? 0;
              return acc + (Number(line || 0) * (taxPerc || 0)) / 100;
            }, 0);

            const grandTotal = computedAmount + computedTax;

            // Simple number to words (uppercase)
            const toWords = (num) => {
              if (!Number.isFinite(num)) return "ZERO";
              // reuse small conversion from QuotationView style but uppercase and simpler
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
                  return (
                    b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "")
                  );
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
              return words.toUpperCase() + " RUPEES";
            };

            return (
              <div className="mx-4 sm:mx-5 mb-8">
                <div className="flex justify-end">
                  <div className="text-right">
                    <div className="mb-4">
                      <p
                        className="text-gray-800 font-semibold mb-1"
                        style={{ fontSize: "12px" }}
                      >
                        TOTAL AMOUNT :
                      </p>
                      <p
                        className="text-gray-900 font-bold"
                        style={{ fontSize: "20px", lineHeight: "28px" }}
                      >
                        {grandTotal.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div
                      className="text-gray-700 font-medium"
                      style={{ fontSize: "10px", lineHeight: "16px" }}
                    >
                      <p>{toWords(Math.round(grandTotal))}</p>
                      <p className="mt-0.5">Rupees</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
          {/* Footer Section */}
          <div className="mx-4 sm:mx-5 pt-6 mt-8 border-t border-gray-300">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4 pb-4">
              <div className="space-y-0.5">
                <div
                  className="text-gray-600"
                  style={{ fontSize: "8px", lineHeight: "14px" }}
                >
                  For any queries, contact: Sales@higherindia.net
                </div>
                <div
                  className="text-gray-600"
                  style={{ fontSize: "8px", lineHeight: "14px" }}
                >
                  Phone: +91 22 1234 5678
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-gray-600 mb-8"
                  style={{ fontSize: "8px", lineHeight: "14px" }}
                >
                  Authorized Signatory
                </div>
                <div className="w-32 border-b border-gray-700 mb-1"></div>
                <div
                  className="text-gray-500"
                  style={{ fontSize: "8px", lineHeight: "14px" }}
                >
                  TechCorp Solutions
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
