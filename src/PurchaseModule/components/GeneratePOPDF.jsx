// // import jsPDF from "jspdf";
// // import "jspdf-autotable";

// // export default function generatePOPDF({ company, supplier, order, items, terms, returnBlob = true }) {
// //   const doc = new jsPDF();

// //   // Header
// //   doc.setFontSize(14);
// //   doc.text(company?.name || "", 14, 20);
// //   doc.setFontSize(10);
// //   doc.text(
// //     [
// //       company?.address,
// //       company?.city,
// //       company?.country
// //     ].filter(Boolean).join(", "),
// //     14, 28
// //   );
// //   doc.text(
// //     `GST: ${company?.gst || ""} | PAN: ${company?.pan || ""}`,
// //     14, 34
// //   );

// //   // Supplier Info
// //   doc.setFontSize(10);
// //   doc.text(`Supplier: ${supplier?.name || ""}`, 14, 50);
// //   doc.text(
// //     [supplier?.address, supplier?.city].filter(Boolean).join(", "),
// //     14, 56
// //   );
// //   doc.text(
// //     `Phone: ${supplier?.phone || ""} | GST: ${supplier?.gst || ""}`,
// //     14, 62
// //   );

// //   // Order Info
// //   doc.text(`PO Number: ${order?.number || ""}`, 150, 20);
// //   doc.text(`Date: ${order?.date || ""}`, 150, 26);

// //   // Table
// //   doc.autoTable({
// //     startY: 70,
// //     head: [["Sr No", "Item", "Description", "U/M", "Unit Price", "Qty", "Tax", "Total"]],
// //     body: (items || []).map((item, idx) => [
// //       idx + 1,
// //       item.item || item.product_name || "",
// //       item.description || "",
// //       item.uom || item.unit || "",
// //       item.unitPrice || item.unit_price || "",
// //       item.qty || item.quantity || "",
// //       item.tax || "",
// //       item.total || ((item.quantity || 0) * (item.unit_price || 0)) || "",
// //     ]),
// //     styles: { fontSize: 9 },
// //     headStyles: { fillColor: [240, 240, 240], textColor: 50 },
// //   });

// //   // Terms & Conditions
// //   let y = doc.lastAutoTable.finalY + 10;
// //   doc.setFontSize(12);
// //   doc.text("Terms & Conditions:", 14, y);
// //   y += 6;

// //   if (Array.isArray(terms) && terms.length > 0) {
// //     doc.setFontSize(10);
// //     terms.forEach((t, i) => {
// //       // If t is an object with title/description
// //       if (typeof t === "object" && (t.title || t.description)) {
// //         doc.text(`• ${t.title ? t.title + ": " : ""}${t.description || ""}`, 18, y);
// //       } else if (typeof t === "string") {
// //         doc.text(`• ${t}`, 18, y);
// //       }
// //       y += 6;
// //     });
// //   }

// //   // Total
// //   y += 10;
// //   doc.setFontSize(12);
// //   doc.text(`TOTAL AMOUNT :`, 14, y);
// //   doc.setFontSize(12);
// //   doc.text(`${order?.totalAmount || ""}`, 70, y);
// //   y += 8;
// //   if (order?.amountInWords) {
// //     doc.setFontSize(11);
// //     doc.text(order.amountInWords, 14, y);
// //     y += 6;
// //     doc.text("Rupees", 14, y);
// //   }

// //   // Footer
// //   y += 20;
// //   doc.setFontSize(9);
// //   doc.text("For any queries, contact: Sales@higherindia.net", 14, 285);
// //   doc.text("Phone: +91 22 1234 5678", 14, 290);
// //   doc.text("Authorized Signatory", 150, 285);
// //   doc.text("TechCorp Solutions", 150, 290);

// //   // Return as Blob (for DMS upload) or Save
// //   if (returnBlob) {
// //     return doc.output("blob");
// //   } else {
// //     doc.save(`${order?.number || "PO"}.pdf`);
// //   }
// // }

// import jsPDF from "jspdf";
// import "jspdf-autotable";

// export default function generatePOPDF({
//   company = {
//     name: "Higher India Pvt Ltd",
//     address: "2/1 Raipur Road, Survey Chowk,",
//     city: "Dehradun, Uttarakhand, 248001",
//     country: "India",
//     gst: "27AABCT1234L1Z5",
//     pan: "AABCT1234L",
//   },
//   supplier = {
//     name: "ABC Suppliers Pvt Ltd",
//     address: "123 Industrial Area, Phase-II",
//     city: "Delhi, India",
//     phone: "+91 9876543210",
//     gst: "07AACCF1234Q1Z2",
//   },
//   order = {},
//   items = [],
//   terms = [],
//   returnBlob = true,
// }) {
//   const doc = new jsPDF();

//   // Company Header
//   doc.setFontSize(14);
//   doc.text(company.name, 14, 20);
//   doc.setFontSize(10);
//   doc.text(
//     [company.address, company.city, company.country].filter(Boolean).join(", "),
//     14,
//     28
//   );
//   doc.text(`GST: ${company.gst} | PAN: ${company.pan}`, 14, 34);

//   // Logo placeholder (if you add image from assets)
//   // Example:
//   // const img = new Image();
//   // img.src = '/assets/logo.png'; // path to your logo
//   // doc.addImage(img, 'PNG', 160, 10, 35, 20);

//   // Supplier Info (dummy for now)
//   doc.setFontSize(10);
//   doc.text(`Supplier: ${supplier.name}`, 14, 50);
//   doc.text(
//     [supplier.address, supplier.city].filter(Boolean).join(", "),
//     14,
//     56
//   );
//   doc.text(
//     `Phone: ${supplier.phone} | GST: ${supplier.gst}`,
//     14,
//     62
//   );

//   // Order Info
//   doc.text(`PO Number: ${order.number || "PO-0001"}`, 150, 20);
//   doc.text(`Date: ${order.date || new Date().toLocaleDateString()}`, 150, 26);

//   // Table
//   doc.autoTable({
//     startY: 70,
//     head: [
//       ["Sr No", "Item", "Description", "U/M", "Unit Price", "Qty", "Tax", "Total"],
//     ],
//     body: (items || []).map((item, idx) => [
//       idx + 1,
//       item.item || item.product_name || "",
//       item.description || "",
//       item.uom || item.unit || "",
//       item.unitPrice || item.unit_price || "",
//       item.qty || item.quantity || "",
//       item.tax || "",
//       item.total || (item.quantity || 0) * (item.unit_price || 0) || "",
//     ]),
//     styles: { fontSize: 9 },
//     headStyles: { fillColor: [240, 240, 240], textColor: 50 },
//   });

//   // Terms & Conditions
//   let y = doc.lastAutoTable.finalY + 10;
//   doc.setFontSize(12);
//   doc.text("Terms & Conditions:", 14, y);
//   y += 6;

//   if (Array.isArray(terms) && terms.length > 0) {
//     doc.setFontSize(10);
//     terms.forEach((t) => {
//       if (typeof t === "object" && (t.title || t.description)) {
//         doc.text(`• ${t.title ? t.title + ": " : ""}${t.description || ""}`, 18, y);
//       } else if (typeof t === "string") {
//         doc.text(`• ${t}`, 18, y);
//       }
//       y += 6;
//     });
//   }

//   // Total
//   y += 10;
//   doc.setFontSize(12);
//   doc.text("TOTAL AMOUNT :", 14, y);
//   doc.text(`${order.totalAmount || "0.00"}`, 70, y);
//   y += 8;
//   if (order.amountInWords) {
//     doc.setFontSize(11);
//     doc.text(order.amountInWords, 14, y);
//     y += 6;
//     doc.text("Rupees", 14, y);
//   }

//   // Footer
//   y += 20;
//   doc.setFontSize(9);
//   doc.text("For any queries, contact: Sales@higherindia.net", 14, 285);
//   doc.text("Phone: +91 22 1234 5678", 14, 290);
//   doc.text("Authorized Signatory", 150, 285);
//   doc.text("Higher India Pvt Ltd", 150, 290);

//   // Return Blob or Save
//   if (returnBlob) {
//     return doc.output("blob");
//   } else {
//     doc.save(`${order.number || "PO"}.pdf`);
//   }
// }

import jsPDF from "jspdf";
import "jspdf-autotable";
import logo from "../../assests/SoftTrails.png";
export default function generatePOPDF({
  company = {
    name: "Higher India Pvt Ltd",
    address: "2/1 Raipur Road, Survey Chowk,",
    city: "Dehradun, Uttarakhand, 248001",
    country: "India",
    gst: "27AABCT1234L1Z5",
    pan: "AABCT1234L",
  },
  supplier = {
    name: "ABC Suppliers Pvt Ltd",
    address: "123 Industrial Area, Phase-II",
    city: "Delhi, India",
    phone: "+91 9876543210",
    gst: "07AACCF1234Q1Z2",
  },
  order = {},
  items = [],
  terms = [],
  returnBlob = true,
}) {
  // Add logging to track PDF generation
  console.log("=== Generating PDF ===");
  console.log("PO Number:", order.number);
  console.log("Date:", order.date);
  console.log("Supplier:", supplier.name);
  console.log("Items count:", items.length);
  console.log("Items:", items);

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header layout
  const leftX = 30;
  const rightX = pageWidth - 35;
  const headerTop = 28;

  // Add logo - match on-screen layout
  doc.addImage(logo, "PNG", leftX, headerTop, 150, 32);

  let curY = headerTop + 60;
  doc.setFontSize(15);
  doc.setFont("helvetica", "bold");
  doc.text(company.name || "Higher India Pvt Ltd", leftX, curY);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(
    company.address || "2/1 Raipur Road, Survey Chowk,",
    leftX,
    curY + 15
  );
  doc.text(company.city || "Dehradun, Uttarakhand, 248001", leftX, curY + 24);
  doc.text(company.country || "India", leftX, curY + 36);
  doc.text(`GST No: ${company.gst || "27AABCT1234L1Z5"}`, leftX, curY + 48);
  doc.text(`PAN No: ${company.pan || "AABCT1234L"}`, leftX, curY + 60);

  // Purchase Order title (right)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // Blue color
  const titleY = headerTop + 6;
  doc.text("Purchase Order placed on", rightX, titleY, { align: "right" });

  // PO Number and Date under title (right aligned)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.text(`PO Number: ${order.number || "PO-0001"}`, rightX, titleY + 15, {
    align: "right",
  });
  doc.text(
    `Date: ${order.date || new Date().toLocaleDateString()}`,
    rightX,
    titleY + 24,
    { align: "right" }
  );

  // Supplier block - boxed on right under the PO details
  const supplierBoxTop = Math.max(curY + 6, titleY + 36);
  const supplierLinesRaw = [];
  if (supplier?.name) supplierLinesRaw.push(supplier.name);
  if (supplier?.address) supplierLinesRaw.push(supplier.address);
  if (supplier?.city) supplierLinesRaw.push(supplier.city);
  if (supplier?.phone) supplierLinesRaw.push(`Phone: ${supplier.phone}`);
  if (supplier?.gst) supplierLinesRaw.push(`GSTIN: ${supplier.gst}`);

  const boxWidth = 200;
  const boxLeft = rightX - boxWidth;
  const fontSizeSupplier = 9;
  const lineHeight = 12;

  doc.setFontSize(fontSizeSupplier);
  const wrappedLines = supplierLinesRaw.map((ln) =>
    doc.splitTextToSize(ln, boxWidth - 16)
  );
  const totalWrapped = wrappedLines.reduce((sum, arr) => sum + arr.length, 0);

  const padding = 10;
  const boxHeight = padding + totalWrapped * lineHeight + padding;

  // Draw box with gray background
  doc.setFillColor(249, 250, 251);
  doc.setDrawColor(209, 213, 219);
  doc.rect(boxLeft, supplierBoxTop, boxWidth, boxHeight, "FD");

  // Draw supplier lines
  doc.setFont("helvetica", "bold");
  let sy = supplierBoxTop + padding + 8;

  // First line bold (supplier name)
  if (wrappedLines.length > 0 && wrappedLines[0].length > 0) {
    doc.text(wrappedLines[0][0], boxLeft + 8, sy);
    sy += lineHeight;

    // Rest normal weight
    doc.setFont("helvetica", "normal");
    for (let i = 1; i < wrappedLines[0].length; i++) {
      doc.text(wrappedLines[0][i], boxLeft + 8, sy);
      sy += lineHeight;
    }

    for (let i = 1; i < wrappedLines.length; i++) {
      wrappedLines[i].forEach((textLine) => {
        doc.text(textLine, boxLeft + 8, sy);
        sy += lineHeight;
      });
    }
  }

  // Move to table start
  const tableStartY = supplierBoxTop + boxHeight + 20;

  // Table - items with blue header matching screenshot
  doc.autoTable({
    startY: tableStartY,
    head: [
      [
        "S. No",
        "Item",
        "Description",
        "U/M",
        "Unit Price",
        "Qty",
        "Tax",
        "Total",
        "Total with Tax",
      ],
    ],
    body: (items || []).map((item, idx) => {
      const qty = item.qty ?? item.quantity ?? 0;
      const unitPrice = item.unitPrice ?? item.unit_price ?? 0;
      const lineTotal = item.total ?? qty * unitPrice;
      const taxPerc = item.tax ?? item.tax_percentage ?? 0;
      const totalWithTax = lineTotal + (lineTotal * (taxPerc || 0)) / 100;

      return [
        String(idx + 1),
        String(item.item || item.product_name || ""),
        String(item.description || "Item description"),
        String(item.uom || item.unit || "Nos"),
        `Rs ${Number(unitPrice).toFixed(0)}`,
        String(qty),
        taxPerc ? `${taxPerc}%` : "0%",
        `Rs ${Number(lineTotal).toFixed(2)}`,
        `Rs ${Number(totalWithTax).toFixed(2)}`,
      ];
    }),
    styles: {
      fontSize: 9,
      cellPadding: 4,
      lineColor: [209, 213, 219],
      lineWidth: 0.5,
      valign: "middle",
    },
    headStyles: {
      fillColor: [219, 234, 254], // Light blue
      textColor: [55, 65, 81], // Dark gray
      halign: "center",
      valign: "middle",
      fontStyle: "bold",
      lineColor: [96, 165, 250], // Blue border
      lineWidth: 0.75,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      1: { cellWidth: 50, halign: "center" },
      2: { cellWidth: 80, halign: "center" },
      3: { cellWidth: 28, halign: "center" },
      4: { cellWidth: 55, halign: "center" },
      5: { cellWidth: 32, halign: "center" },
      6: { cellWidth: 28, halign: "center" },
      7: { cellWidth: 65, halign: "center" },
      8: { cellWidth: "auto", halign: "center" },
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    tableLineColor: [96, 165, 250],
    tableLineWidth: 0.75,
    margin: { left: leftX, right: 40 },
  });

  // Terms & Conditions
  let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : tableStartY + 130;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Terms and Conditions:", leftX, y);
  y += 15;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  if (Array.isArray(terms) && terms.length > 0) {
    terms.forEach((t) => {
      const line =
        typeof t === "string"
          ? `• ${t}`
          : `• ${t.title ? t.title + ": " : ""}${t.description || ""}`;
      const split = doc.splitTextToSize(line, pageWidth - leftX * 2);
      doc.text(split, leftX, y);
      y += split.length * 10;
    });
  } else {
    const defaultTerms = [
      "• Payment terms: Net 30 days from invoice date",
      "• Delivery within 15 working days from PO confirmation",
      "• All items must be delivered to the specified address",
      "• Warranty as per manufacturer's standard terms",
      "• Any damages during transit to be borne by the supplier",
      "• GST as applicable will be charged extra",
    ];
    defaultTerms.forEach((term) => {
      doc.text(term, leftX, y);
      y += 10;
    });
  }

  // Totals block (right bottom) - compute from items
  const computedAmount = (items || []).reduce((acc, it) => {
    const qty = it.qty ?? it.quantity ?? 0;
    const unitPrice = it.unitPrice ?? it.unit_price ?? 0;
    const line =
      it.total != null
        ? Number(it.total)
        : Number(qty) * Number(unitPrice || 0);
    return acc + Number(line || 0);
  }, 0);

  const computedTax = (items || []).reduce((acc, it) => {
    const qty = it.qty ?? it.quantity ?? 0;
    const unitPrice = it.unitPrice ?? it.unit_price ?? 0;
    const line =
      it.total != null
        ? Number(it.total)
        : Number(qty) * Number(unitPrice || 0);
    const taxPerc = it.tax ?? it.tax_percentage ?? 0;
    return acc + (Number(line || 0) * Number(taxPerc || 0)) / 100;
  }, 0);

  const grandTotal = computedAmount + computedTax;

  // simple number to words (uppercase RUPEES)
  const toWords = (num) => {
    if (!Number.isFinite(num)) return "ZERO RUPEES";
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
    return words.toUpperCase() + " RUPEES";
  };

  // Render totals block on the right - matching screenshot
  y += 18;
  const valueX = pageWidth - 40; // right aligned value

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL AMOUNT :", valueX, y, { align: "right" });

  y += 14;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(
    grandTotal.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
    valueX,
    y,
    { align: "right" }
  );

  // Amount in words
  const words = order.amountInWords || toWords(Math.round(grandTotal));
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(words, valueX, y, { align: "right" });
  y += 10;
  doc.text("Rupees", valueX, y, { align: "right" });

  // Footer (authorized signatory etc.)
  const footerY = Math.max(y + 40, doc.internal.pageSize.getHeight() - 60);

  // Draw separator line
  doc.setDrawColor(209, 213, 219);
  doc.line(leftX, footerY - 20, pageWidth - 40, footerY - 20);

  // Contact info (bottom left)
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text("For any queries, contact: Sales@higherindia.net", leftX, footerY);
  doc.text("Phone: +91 22 1234 5678", leftX, footerY + 10);

  // Authorized signatory (bottom right)
  const sigX = pageWidth - 140;
  doc.text("Authorized Signatory", sigX, footerY - 10);

  // Signature line
  doc.setDrawColor(75, 85, 99);
  doc.line(sigX, footerY + 20, sigX + 100, footerY + 20);

  doc.setTextColor(156, 163, 175);
  doc.text("TechCorp Solutions", sigX, footerY + 30);

  console.log("=== PDF Generation Complete ===");
  console.log("Generated PDF for PO:", order.number);
  console.log("Grand Total:", grandTotal);

  // Return Blob or save
  if (returnBlob) {
    const blob = doc.output("blob");
    console.log("PDF Blob size:", blob.size, "bytes");
    return blob;
  } else {
    doc.save(`${order.number || "PO"}.pdf`);
  }
}
