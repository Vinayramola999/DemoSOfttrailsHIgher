import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import generatePurchaseOrderPDF from "./PurchaseOrderPDF"; // 👈 custom generator

export default function downloadPDF({ data = [], columns = [], fileName = "purchase_order" }) {
  const orderData = {
    company: {
      name: "Higher India Pvt Ltd",
      address: "2/1 Raipur Road,Survey Chowk,",
      city: "Dehradun, Uttarakhand, 248001",
      country: "India",
      gst: "27AABCT1234L1Z5",
      pan: "AABCT1234L",
    },
    supplier: {
      name: "ABC Suppliers Pvt Ltd",
      address: "456 Industrial Area, Sector 18",
      city: "Noida, UP 201301",
      phone: "‪+91 9876543210‬",
      gst: "09AABCA1234M1Z5",
    },
    order: {
      number: "PO-2024-001",
      date: "March 15, 2024",
      totalAmount: "260,392.00",
      amountInWords: "TWO LAKH SIXTY THOUSAND THREE HUNDRED NINETY TWO Rupees",
    },
    items: [
      {
        sr: 1,
        item: "Laptop",
        description: "Item description",
        uom: "Nos",
        unitPrice: "₹85,000",
        qty: 5,
        tax: "18%",
        total: "₹4,25,000",
        totalWithTax: "₹5,01,500",
      },
      {
        sr: 2,
        item: "Laptop",
        description: "Item description",
        uom: "Nos",
        unitPrice: "₹85,000",
        qty: 5,
        tax: "18%",
        total: "₹4,25,000",
        totalWithTax: "₹5,01,500",
      },
    ],
    terms: [
      "Payment terms: Net 30 days from invoice date",
      "Delivery within 15 working days from PO confirmation",
      "All items must be delivered to the specified address",
      "Warranty as per manufacturer's standard terms",
      "Any damages during transit to be borne by the supplier",
      "GST as applicable will be charged extra",
    ],
  };

  // === PDF Download Handler ===
  const downloadPDF = () => {
    if (fileName === "purchase_order") {
      generatePurchaseOrderPDF({
        poId: orderData.order.number,
        quotationId: "",
        vendorName: orderData.supplier.name,
        deliveryDate: orderData.order.date,
        deliveryAddress: `${orderData.company.address}, ${orderData.company.city}`,
        items: orderData.items.map((i) => ({
          name: i.item,
          qty: i.qty,
          unit_price: parseFloat(i.unitPrice.replace(/[₹,]/g, "")),
        })),
        totalAmount: orderData.items.reduce(
          (sum, r) => sum + r.qty * parseFloat(r.unitPrice.replace(/[₹,]/g, "")),
          0
        ),
        terms: orderData.terms.map((t, i) => ({
          title: `Term ${i + 1}`,
          description: t,
        })),
      });
    } else {
      const doc = new jsPDF();
      doc.text(fileName, 14, 10);
      doc.autoTable({
        head: [columns.map((col) => col.header)],
        body: data.map((row) => columns.map((col) => row[col.accessor])),
      });
      doc.save(`${fileName}.pdf`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white shadow-2xl">
        {/* ... your same PO JSX content ... */}

        {/* Download Button */}
        <div className="p-4 text-right">
          <button
            onClick={downloadPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
