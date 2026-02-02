import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Utility for exporting table data to Excel (CSV format)
 * @param {Array} data - Array of data objects to export
 * @param {Array} headers - Array of header names (e.g., ["S.No.", "Name", "Date"])
 * @param {Function} rowMapper - Function to map data object to row array. If not provided, uses headers as keys
 * @param {String} filename - Name of the CSV file (default: "export.csv")
 * 
 * Example usage:
 * exportToExcel(
 *   leads,
 *   ["S.No.", "Lead Category", "Date", "Description"],
 *   (item, index) => [index + 1, item.leadCategory, item.date, item.description],
 *   "leads_report.csv"
 * )
 */
export const exportToExcel = (data, headers, rowMapper, filename = "export.csv") => {
  try {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Map data to rows using provided mapper function
    const csvContent = data.map((item, index) => 
      rowMapper ? rowMapper(item, index) : Object.values(item)
    );

    // Build CSV string
    const csvString = [headers, ...csvContent]
      .map((row) => row.map(cell => '"' + cell + '"').join(","))
      .join("\n");

    // Create blob and download
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    alert("Failed to export to Excel. Please try again.");
  }
};

/**
 * Utility for exporting table data to PDF
 * @param {Array} data - Array of data objects to export
 * @param {Array} headers - Array of header names (e.g., ["S.No.", "Name", "Date"])
 * @param {Function} rowMapper - Function to map data object to row array. If not provided, uses headers as keys
 * @param {String} filename - Name of the PDF file (default: "export.pdf")
 * @param {String} title - Title to display at top of PDF (default: "Report")
 * @param {Object} options - Additional PDF options (orientation, pageSize, etc.)
 * 
 * Example usage:
 * exportToPDF(
 *   leads,
 *   ["S.No.", "Lead Category", "Date", "Description"],
 *   (item, index) => [index + 1, item.leadCategory, item.date, item.description],
 *   "leads_report.pdf",
 *   "Lead Categories Report"
 * )
 */
export const exportToPDF = (
  data,
  headers,
  rowMapper,
  filename = "export.pdf",
  title = "Report",
  options = {}
) => {
  try {
    const hasData = Array.isArray(data) && data.length > 0;

    const {
      orientation = "portrait",
      pageSize = "a4",
      headerBgColor = [41, 128, 185],
      headerTextColor = 255,
    } = options;

    // Create PDF document
    const doc = new jsPDF({
      orientation,
      unit: "mm",
      format: pageSize,
    });

    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 10);

    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString("en-GB")}`, 14, 18);

    // Prepare table data (fall back to a single-row "No data" table if empty)
    const tableBody = hasData
      ? data.map((item, index) => (rowMapper ? rowMapper(item, index) : Object.values(item)))
      : [["No data available"]];

    const tableOptions = {
      startY: 25,
      theme: "grid",
      body: tableBody,
      margin: { top: 25 },
      didDrawPage: (dt) => {
        // Footer - safer page count detection
        const pageCount = typeof doc.internal.getNumberOfPages === "function"
          ? doc.internal.getNumberOfPages()
          : Object.keys(doc.internal.pages || {}).length;
        doc.setFontSize(10);
        const pageWidth = doc.internal.pageSize.getWidth
          ? doc.internal.pageSize.getWidth()
          : (doc.internal.pageSize.width || 0);
        const pageHeight = doc.internal.pageSize.getHeight
          ? doc.internal.pageSize.getHeight()
          : (doc.internal.pageSize.height || 0);
        doc.text(
          `Page ${dt.pageNumber} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      },
    };

    // If we have headers and data, include head; if no data, omit head and center the message
    if (hasData && Array.isArray(headers) && headers.length > 0) {
      tableOptions.head = [headers];
      tableOptions.headerStyles = {
        fillColor: headerBgColor,
        textColor: headerTextColor,
        fontStyle: "bold",
        halign: "center",
        valign: "middle",
      };
      tableOptions.bodyStyles = { halign: "center", valign: "middle" };
    } else if (!hasData) {
      // if no data, make the single cell span and use a simple layout
      tableOptions.head = [];
      tableOptions.styles = { halign: "center" };
    }

    // Use whichever autoTable API is available: named import or doc.autoTable
    if (typeof autoTable === "function") {
      autoTable(doc, tableOptions);
    } else if (typeof doc.autoTable === "function") {
      doc.autoTable(tableOptions);
    } else {
      // Last resort: draw a simple text line if autoTable is missing
      doc.setFontSize(12);
      doc.text(tableBody[0][0] || "No data available", 14, 30);
    }

    // Download PDF
    doc.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    alert("Failed to generate PDF. Please try again.");
  }
};

/**
 * Export component hook - returns export functions configured with data and headers
 * @param {Array} data - Array of data objects
 * @param {Array} headers - Array of header names
 * @param {Function} rowMapper - Function to map data to row format
 * 
 * Example usage in component:
 * const { handleExportExcel, handleExportPDF } = useExport(
 *   filteredLeads,
 *   ["S.No.", "Lead", "Date"],
 *   (item, idx) => [idx + 1, item.name, item.date]
 * );
 * 
 * <button onClick={() => handleExportExcel("leads.csv")}>Export Excel</button>
 * <button onClick={() => handleExportPDF("leads.pdf", "Leads Report")}>Export PDF</button>
 */
export const useExport = (data, headers, rowMapper) => {
  const handleExportExcel = (filename = "export.csv") => {
    exportToExcel(data, headers, rowMapper, filename);
  };

  const handleExportPDF = (filename = "export.pdf", title = "Report", options = {}) => {
    exportToPDF(data, headers, rowMapper, filename, title, options);
  };

  return { handleExportExcel, handleExportPDF };
};
