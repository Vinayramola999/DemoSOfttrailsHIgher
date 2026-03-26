import React, { useEffect, useMemo, useState } from 'react';
import { FaSearch, FaFileExcel, FaFilePdf } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import Swal from 'sweetalert2';
import { getInventoryLogs } from '../api/Service';

const LogReports = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 9;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await getInventoryLogs();
        setLogs(Array.isArray(data) ? data : []);
      } catch (err) {
        await Swal.fire({ title: err.message || 'Failed to load logs', icon: 'error' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const formatDateTime = (ts) => {
    if (!ts) return '-';
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '-';
    const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${date} ${time}`;
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return logs;
    return logs.filter((l) => {
      const fields = [
        String(l.itemName || ''),
        String(l.batchNumber || ''),
        String(l.movementType || ''),
        String(l.quantity ?? ''),
        String(l.reason || ''),
        String(formatDateTime(l.createdAt || l.created_at || '')),
      ].map((s) => s.toLowerCase());
      return fields.some((f) => f.includes(term));
    });
  }, [search, logs]);

  const pageTotal = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const start = (currentPage - 1) * rowsPerPage;
  const visibleRows = filtered.slice(start, start + rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (currentPage > pageTotal) setCurrentPage(pageTotal);
  }, [pageTotal, currentPage]);

  const handleExportExcel = () => {
    const data = filtered.map((l) => ({
      ItemName: l.itemName || '',
      BatchNumber: l.batchNumber || '',
      MovementType: l.movementType || '',
      Quantity: Number(l.quantity || 0) || 0,
      Reason: l.reason || '',
      CreatedAt: formatDateTime(l.createdAt || l.created_at || ''),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'InventoryLogs');
    XLSX.writeFile(wb, 'InventoryLogs.xlsx');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Inventory Logs', 14, 20);
    autoTable(doc, {
      startY: 30,
      head: [['Item Name', 'Batch No.', 'Movement', 'Qty', 'Reason', 'Date & Time']],
      body: filtered.map((l) => [
        l.itemName || '',
        l.batchNumber || '',
        l.movementType || '',
        Number(l.quantity || 0) || 0,
        l.reason || '',
        formatDateTime(l.createdAt || l.created_at || ''),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [0, 90, 230] },
    });
    doc.save('InventoryLogs.pdf');
  };

  return (
    <div className="bg-[#FAFCF9]  font-['Inter']">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="w-[307px] h-[26px] text-[19.2px] leading-[25.6px] font-[700] text-gray-900">Log Reports</h1>
          <p className="w-[500px] h-[16px] text-[12px] leading-[24px] font-[400] text-[#64748B]">Inventory movements including purchase and issue activities.</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative w-[600px]">
          <span className="absolute left-[12px] top-[12px] text-gray-400">
            <FaSearch />
          </span>
          <input
            type="text"
            placeholder="Search"
            className="w-full h-[35px] bg-white rounded-[8px] border-[1px] border-[#CBD5E1] pl-[46px] pr-[12px] text-[12px] focus:outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3 ml-auto">
          <button onClick={handleExportExcel} className="p-2 text-green-600 rounded transition hover:bg-green-50">
            <FaFileExcel size={24} />
          </button>
          <button onClick={handleExportPDF} className="p-2 text-red-500 rounded transition hover:bg-red-50">
            <FaFilePdf size={24} />
          </button>
        </div>
      </div>

      <div className="flex flex-col mt-2 bg-white rounded-md shadow-sm">
        <div className="">
          <table className="min-w-full text-sm">
            <thead className="font-medium text-black border-b border-black">
              <tr className="h-12">
                <th className="px-3 py-3 text-left">S. No.</th>
                <th className="px-3 py-3 text-left">Item Name</th>
                <th className="px-3 py-3 text-left">Batch No.</th>
                <th className="px-3 py-3 text-left">Movement Type</th>
                <th className="px-3 py-3 text-left">Quantity</th>
                <th className="px-3 py-3 text-left">Reason</th>
                <th className="px-3 py-3 text-left">Date & Time</th>
              </tr>
            </thead>
            <tbody>
              <tr className="" />
              {loading && (
                <tr><td colSpan={7} className="py-4 font-medium text-center text-gray-500">Loading...</td></tr>
              )}
              {!loading && visibleRows.length === 0 && (
                <tr><td colSpan={7} className="py-4 font-medium text-center text-gray-500">No data</td></tr>
              )}
              {!loading && visibleRows.map((l, idx) => (
                <tr key={`${l.itemName}-${idx}`} className="h-10 border-b transition hover:bg-gray-50 odd:bg-white even:bg-blue-100">
                  <td className="px-3 py-3">{start + idx + 1}</td>
                  <td className="px-3 py-3 font-medium text-gray-800">{l.itemName || '-'}</td>
                  <td className="px-3 py-3 text-gray-700">{l.batchNumber || '-'}</td>
                  <td className="px-3 py-3 text-gray-700">{l.movementType || '-'}</td>
                  <td className="px-3 py-3 font-semibold text-gray-800">{Number(l.quantity || 0) || 0}</td>
                  <td className="px-3 py-3 text-gray-700">{l.reason || '-'}</td>
                  <td className="px-3 py-3 text-gray-700">{formatDateTime(l.createdAt || l.created_at || '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-2 justify-center items-center mt-2">
        <button className="flex justify-center items-center w-8 h-8 text-gray-400 rounded border border-gray-200 hover:bg-gray-50" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&lt;</button>
        <button className="flex justify-center items-center w-8 h-8 font-medium text-white bg-blue-600 rounded">{visibleRows.length === 0 ? 0 : currentPage}</button>
        <span className="text-sm text-gray-500">of</span>
        <button className="flex justify-center items-center w-8 h-8 font-medium text-blue-600 rounded border border-blue-200">{filtered.length === 0 ? 0 : pageTotal}</button>
        <button className="flex justify-center items-center w-8 h-8 text-gray-400 rounded border border-gray-200 hover:bg-gray-50" onClick={() => setCurrentPage(p => Math.min(pageTotal, p + 1))}>&gt;</button>
      </div>
    </div>
  );
};

export default LogReports;
