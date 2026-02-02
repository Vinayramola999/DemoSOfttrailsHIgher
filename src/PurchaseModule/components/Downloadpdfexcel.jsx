import React from 'react';
import { FaFilePdf, FaFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DownloadTableButtons = ({ data, columns, fileName = 'report' }) => {

  const downloadExcel = () => {
    const worksheetData = [columns.map(col => col.header), ...data.map(row => columns.map(col => row[col.accessor]))];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text(fileName, 14, 10);
    doc.autoTable({
      head: [columns.map(col => col.header)],
      body: data.map(row => columns.map(col => row[col.accessor])),
    });
    doc.save(`${fileName}.pdf`);
  };

  return (
    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
      <button onClick={downloadPDF} title="Download PDF">
        <FaFilePdf color="red" size={18} /> 
      </button>
      <button onClick={downloadExcel} title="Download Excel">
        <FaFileExcel color="green" size={18} /> 
      </button>
    </div>
  );
};

export default DownloadTableButtons;
