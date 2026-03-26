import React, { useEffect, useMemo, useState } from 'react';
import {
    FaBox,
    FaExclamationTriangle,
    FaClock,
    FaTimesCircle,
    FaShoppingCart,
    FaArrowUp,
    FaSearch,
    FaFileExcel,
    FaFilePdf,
    FaPlus,
    FaMinus,
    FaExchangeAlt,
    FaHistory
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import MasterCreation from './MasterCreation';
import LogReports from './LogReports';
import Swal from 'sweetalert2';
import { getInventorySummary, getItemById, receiveInventoryStock, issueInventoryStock, getInventoryLogsByItem } from '../api/Service';

const InventoryControl = () => {
    const [activeTab, setActiveTab] = useState('Inventory Control');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;
    const [search, setSearch] = useState('');
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalType, setModalType] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formQty, setFormQty] = useState('');
    const [formBatch, setFormBatch] = useState('');
    const [formExpiry, setFormExpiry] = useState('');
    const [logsOpen, setLogsOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [logsItemName, setLogsItemName] = useState('');

    // const stats = useMemo(() => {
    //     const totalQty = summary.reduce((acc, s) => acc + Number(s.totalQuantity || 0), 0);
    //     const lowCount = summary.filter(s => s.lowStock).length;
    //     const nearCount = summary.filter(s => s.nearExpiry).length;
    //     return [
    //         { title: 'Total Stock', value: String(totalQty), icon: <FaBox className="text-xl text-blue-600" />, bg: 'bg-blue-50' },
    //         { title: 'Low Stock', value: String(lowCount), icon: <FaExclamationTriangle className="text-xl text-orange-600" />, bg: 'bg-orange-50' },
    //         { title: 'Near Expiry', value: String(nearCount), icon: <FaClock className="text-xl text-orange-600" />, bg: 'bg-orange-50' },
    //         { title: 'Expired', value: '-', icon: <FaTimesCircle className="text-xl text-red-600" />, bg: 'bg-red-50' },
    //         { title: 'Today Purchase', value: '-', icon: <FaShoppingCart className="text-xl text-green-600" />, bg: 'bg-green-50' },
    //         { title: 'Today Issue', value: '-', icon: <FaArrowUp className="text-xl text-purple-600" />, bg: 'bg-purple-50' },
    //     ];
    // }, [summary]);
    const stats = useMemo(() => {
    return [
        { title: 'Total Stock', value: '-', icon: <FaBox className="text-xl text-blue-600" />, bg: 'bg-blue-50' },
        { title: 'Low Stock', value: '-', icon: <FaExclamationTriangle className="text-xl text-orange-600" />, bg: 'bg-orange-50' },
        { title: 'Near Expiry', value: '-', icon: <FaClock className="text-xl text-orange-600" />, bg: 'bg-orange-50' },
        { title: 'Expired', value: '-', icon: <FaTimesCircle className="text-xl text-red-600" />, bg: 'bg-red-50' },
        { title: 'Today Purchase', value: '-', icon: <FaShoppingCart className="text-xl text-green-600" />, bg: 'bg-green-50' },
        { title: 'Today Issue', value: '-', icon: <FaArrowUp className="text-xl text-purple-600" />, bg: 'bg-purple-50' },
    ];
}, []);


    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await getInventorySummary();
                setSummary(Array.isArray(data) ? data : []);
            } catch (err) {
                await Swal.fire({ title: err.message || 'Failed to load inventory', icon: 'error' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Function to refresh inventory summary
    const refreshInventorySummary = async () => {
        try {
            const data = await getInventorySummary();
            setSummary(Array.isArray(data) ? data : []);
            setCurrentPage(1);
            setSearch('');
        } catch (err) {
            console.error('Failed to refresh inventory:', err);
        }
    };

    // Helper to get status styles
    const getStatusStyle = (status) => {
        switch (status) {
            case 'Good Stock': return 'bg-green-100 text-green-700 border border-green-200';
            case 'Low Stock': return 'bg-orange-100 text-orange-700 border border-orange-200';
            case 'Near Expiry': return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
            case 'Expired': return 'bg-red-100 text-red-700 border border-red-200';
            default: return 'bg-gray-100 text-gray-700 border border-gray-200';
        }
    };

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return summary;
        return summary.filter(s =>
            String(s.itemName || '').toLowerCase().includes(term) ||
            String(s.unitName || '').toLowerCase().includes(term)
        );
    }, [search, summary]);

    const pageTotal = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
    const start = (currentPage - 1) * rowsPerPage;
    const visibleRows = filtered.slice(start, start + rowsPerPage);

    const handleExportExcel = () => {
        const data = filtered.map(item => ({
            ItemName: item.itemName,
            Unit: item.unitName,
            TotalQuantity: item.totalQuantity,
            LowStock: item.lowStock ? 'Yes' : 'No',
            NearExpiry: item.nearExpiry ? 'Yes' : 'No',
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Inventory");
        XLSX.writeFile(wb, "InventoryReport.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Inventory Report", 14, 20);
        autoTable(doc, {
            startY: 30,
            head: [['Item Name', 'Unit', 'Total Qty', 'Low Stock', 'Near Expiry']],
            body: filtered.map(item => [
                item.itemName,
                item.unitName,
                item.totalQuantity,
                item.lowStock ? 'Yes' : 'No',
                item.nearExpiry ? 'Yes' : 'No'
            ]),
        });
        doc.save("InventoryReport.pdf");
    };

    const openModal = async (type, row) => {
        try {
            setLoading(true);
            const item = await getItemById(row.itemId);
            const cat = String(item.systemCategory || '').toUpperCase();
            if (type === 'receive' && (cat === 'SERVICE' || cat === 'RESOURCE')) {
                await Swal.fire({ title: 'Not allowed for this item type', icon: 'warning' });
                return;
            }
            setSelectedItem(item);
            setModalType(type);
            setFormQty('');
            setFormBatch('');
            setFormExpiry('');
            setModalOpen(true);
        } catch (err) {
            await Swal.fire({ title: err.message || 'Failed to load item', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const submitModal = async () => {
        if (!selectedItem) return;
        const qty = Number(formQty);
        if (!qty || qty <= 0) {
            await Swal.fire({ title: 'Enter valid quantity', icon: 'info' });
            return;
        }
        if (modalType === 'receive') {
            const cat = String(selectedItem.systemCategory || '').toUpperCase();
            if (cat === 'SERVICE' || cat === 'RESOURCE') {
                await Swal.fire({ title: 'Not allowed for this item type', icon: 'warning' });
                return;
            }
            if (!String(formBatch || '').trim()) {
                await Swal.fire({ title: 'Batch number is required', icon: 'info' });
                return;
            }
            if (cat === 'MEDICINE') {
                if (!String(formExpiry || '').trim()) {
                    await Swal.fire({ title: 'Expiry date is required for Medicine', icon: 'info' });
                    return;
                }
            }
        }
        const first = await Swal.fire({
            title: modalType === 'receive' ? 'Receive stock?' : 'Issue stock?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        });
        if (!first.isConfirmed) return;
        try {
            setLoading(true);
            if (modalType === 'receive') {
                if (selectedItem.systemCategory === 'SERVICE' || selectedItem.systemCategory === 'RESOURCE') {
                    await Swal.fire({ title: 'Not allowed for this item type', icon: 'warning' });
                    setLoading(false);
                    return;
                }
                const payload = {
                    itemId: selectedItem.id ?? selectedItem.itemId,
                    batchNumber: String(formBatch).trim(),
                    expiryDate: String(selectedItem.systemCategory || '').toUpperCase() === 'MEDICINE' ? String(formExpiry).trim() : undefined,
                    quantity: qty
                };
                await receiveInventoryStock(payload);
                await Swal.fire({ title: 'Stock received', icon: 'success' });
            } else if (modalType === 'issue') {
                const payload = { itemId: selectedItem.id ?? selectedItem.itemId, quantity: qty };
                await issueInventoryStock(payload);
                await Swal.fire({ title: 'Stock issued', icon: 'success' });
            }
            const data = await getInventorySummary();
            setSummary(Array.isArray(data) ? data : []);
            setCurrentPage(1);
            setSearch('');
            setModalOpen(false);
        } catch (err) {
            await Swal.fire({ title: err.message || 'Action failed', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const viewLogs = async (row) => {
        try {
            setLoading(true);
            const data = await getInventoryLogsByItem(row.itemId);
            const items = Array.isArray(data) ? data : [];
            const formatDateTime = (ts) => {
                if (!ts) return '-';
                const d = new Date(ts);
                if (isNaN(d.getTime())) return '-';
                const date = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return `${date} ${time}`;
            };
            const mapped = items.map((l) => {
                const action = String(l.movementType || '').includes('OUT') ? 'Issue' : 'Add';
                const qty = Math.abs(Number(l.quantity || 0)) || 0;
                const date = l.createdAt || l.created_at || '';
                return { date: formatDateTime(date), action, qty };
            });
            setLogs(mapped);
            setLogsItemName(row.itemName || '');
            setLogsOpen(true);
        } catch (err) {
            await Swal.fire({ title: err.message || 'Failed to load logs', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#FAFCF9] p-2 font-['Inter']">
            {/* Top Tabs */}
            <div className="flex gap-6 items-center mb-2">
                {['Inventory Control', 'Master Creation', 'Reports And Logs'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`w-[149px] h-[32px] rounded-[80px] text-[12px] leading-[100%] font-[500] transition-colors ${activeTab === tab
                            ? 'bg-blue-800 text-white shadow-sm'
                            : 'bg-white text-gray-700 hover:text-gray-900 border border-gray-200'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {activeTab === 'Inventory Control' && (
                <>
                    {/* Header */}
                    <div className="mb-2">
                        <h1 className="w-[307px] h-[26px] text-[19.2px] leading-[25.6px] font-[700] text-gray-900">Inventory Dashboard</h1>
                        <p className="w-[307px] h-[16px] text-[12px] leading-[24px] font-[400] text-[#64748B]">Real-time overview of hospital stock and movements.</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 mb-2 md:grid-cols-3 lg:grid-cols-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col justify-between w-[155px] h-[114px] bg-white rounded-[6.84px] border-[0.85px] border-[#E2E8F0] shadow-[0px_0.85px_1.71px_0px_rgba(0,0,0,0.05)] p-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10.17px] leading-[17.1px] font-[500] text-gray-700">{stat.title}</span>
                                    <div className={`flex justify-center items-center w-[41.04px] h-[41.04px] rounded-[6.84px] ${stat.bg}`}>
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="text-[21.8px] leading-[30.78px] font-[700] text-black">{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filters & Actions */}
                    <div className="flex flex-col gap-4 justify-between items-center mb-2 md:flex-row">
                        <div className="flex gap-4 w-full md:w-auto">
                            {/* Search */}
                            <div className="relative w-[253px]">
                                <span className="absolute left-[12px] top-[12px] text-gray-400">
                                    <FaSearch />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search"
                                    className="w-[253px] h-[40px] bg-white rounded-[8px] border-[1px] border-[#CBD5E1] pl-[46px] pr-[12px] text-[12px] focus:outline-none focus:border-blue-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            {/* Dropdowns */}
                            <select className="w-[164px] h-[40px] px-[12px] text-[12px] text-gray-700 bg-white rounded-[8px] border-[1px] border-[#CBD5E1] focus:outline-none">
                                <option>All Categories</option>
                            </select>
                            <select className="w-[164px] h-[40px] px-[12px] text-[12px] text-gray-700 bg-white rounded-[8px] border-[1px] border-[#CBD5E1] focus:outline-none">
                                <option>All Stores</option>
                            </select>
                        </div>

                        {/* Exports */}
                        <div className="flex gap-3">
                            <button onClick={handleExportExcel} className="p-2 text-green-600 rounded transition hover:bg-green-50">
                                <FaFileExcel size={24} />
                            </button>
                            <button onClick={handleExportPDF} className="p-2 text-red-500 rounded transition hover:bg-red-50">
                                <FaFilePdf size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Table - match Discount.jsx UI */}
                    <div className="flex flex-col h-[250px] bg-white rounded-md shadow-sm mt-2">
                        <div className="">
                            <table className="min-w-full text-sm">
                                <thead className="font-medium text-black border-b border-black">
                                    <tr className="h-12">
                                        <th className="px-3 py-3 text-left">S. No.</th>
                                        <th className="px-3 py-3 text-left">Item Name</th>
                                        <th className="px-3 py-3 text-left">Unit</th>
                                        <th className="px-3 py-3 text-left">Available Qty</th>
                                        <th className="px-3 py-3 text-left">Status</th>
                                        <th className="px-3 py-3 text-left">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="" />
                                {loading && (
                                    <tr><td colSpan={6} className="py-4 font-medium text-center text-gray-500">Loading...</td></tr>
                                )}
                                {!loading && visibleRows.length === 0 && (
                                    <tr><td colSpan={6} className="py-4 font-medium text-center text-gray-500">No data</td></tr>
                                )}
                                {!loading && visibleRows.map((item, idx) => {
                                    const status = item.lowStock ? 'Low Stock' : item.nearExpiry ? 'Near Expiry' : 'Good Stock';
                                    return (
                                    <tr key={item.itemId} className="h-10 border-b transition hover:bg-gray-50 odd:bg-white even:bg-blue-100">
                                        <td className="px-3 py-3">{start + idx + 1}</td>
                                        <td className="px-3 py-3 font-medium text-gray-800">{item.itemName}</td>
                                        <td className="px-3 py-3 text-gray-700">{item.unitName}</td>
                                        <td className={`px-3 py-3 font-semibold ${status === 'Low Stock' ? 'text-red-600' : 'text-gray-800'}`}>
                                            {item.totalQuantity}
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(status)}`}>
                                                {status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex gap-3 items-center bg-transparent">
                                                <button className="p-1 text-blue-600 rounded hover:bg-blue-100" onClick={() => openModal('receive', item)}><FaPlus /></button>
                                                <button className="p-1 text-orange-500 rounded hover:bg-orange-100" onClick={() => openModal('issue', item)}><FaMinus /></button>
                                         
                                                <button className="p-1 text-red-500 rounded hover:bg-red-100" disabled><FaExclamationTriangle /></button>
                                                <button className="p-1 text-gray-400 rounded hover:bg-gray-100" onClick={() => viewLogs(item)}><FaHistory /></button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex gap-2 justify-center items-center pb-2 mt-14">
                        <button className="flex justify-center items-center w-8 h-8 text-gray-400 rounded border border-gray-200 hover:bg-gray-50" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>&lt;</button>
                        <button className="flex justify-center items-center w-8 h-8 font-medium text-white bg-blue-600 rounded">{currentPage}</button>
                        <span className="text-sm text-gray-500">of</span>
                        <button className="flex justify-center items-center w-8 h-8 font-medium text-blue-600 rounded border border-blue-200">{pageTotal}</button>
                        <button className="flex justify-center items-center w-8 h-8 text-gray-400 rounded border border-gray-200 hover:bg-gray-50" onClick={() => setCurrentPage(p => Math.min(pageTotal, p + 1))}>&gt;</button>
                    </div>
                </>
            )}

            {activeTab === 'Master Creation' && <MasterCreation onItemCreated={refreshInventorySummary} />}

            {activeTab === 'Reports And Logs' && <LogReports />}

            {modalOpen && selectedItem && (
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/30">
                    <div className="w-[400px] bg-white rounded-lg p-4">
                        <h3 className="mb-3 text-lg font-semibold">{modalType === 'receive' ? 'Receive Stock' : 'Issue Stock'}</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-600">Item</label>
                                <div className="text-sm font-medium">{selectedItem.name ?? selectedItem.itemName}</div>
                            </div>
                            {modalType === 'receive' && (
                                <>
                                    <div>
                                        <label className="block text-xs text-gray-600">Batch Number</label>
                                        <input className="px-3 py-2 w-full text-sm rounded border" value={formBatch} onChange={(e) => setFormBatch(e.target.value)} />
                                    </div>
                                    {selectedItem.systemCategory === 'MEDICINE' && (
                                        <div>
                                            <label className="block text-xs text-gray-600">Expiry Date</label>
                                            <input type="date" className="px-3 py-2 w-full text-sm rounded border" value={formExpiry} onChange={(e) => setFormExpiry(e.target.value)} />
                                        </div>
                                    )}
                                </>
                            )}
                            <div>
                                <label className="block text-xs text-gray-600">Quantity</label>
                                <input type="number" min="1" className="px-3 py-2 w-full text-sm rounded border" value={formQty} onChange={(e) => setFormQty(e.target.value)} />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end mt-4">
                            <button className="px-3 py-2 rounded border" onClick={() => setModalOpen(false)}>Cancel</button>
                            <button className="px-3 py-2 text-white bg-blue-600 rounded" onClick={submitModal}>Submit</button>
                        </div>
                    </div>
                </div>
            )}
            {logsOpen && (
                <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/30">
                    <div className="w-[560px] bg-white rounded-xl p-4 shadow">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold">History - {logsItemName}</h3>
                            <button className="text-gray-500" onClick={() => setLogsOpen(false)}>✕</button>
                        </div>
                        <div className="bg-white rounded-md border border-gray-200">
                            <table className="min-w-full text-sm">
                                <thead className="text-gray-600">
                                    <tr className="h-12">
                                        <th className="px-3 py-2 text-left">Date</th>
                                        <th className="px-3 py-2 text-left">Action</th>
                                        <th className="px-3 py-2 text-left">Qty</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logs.map((r, i) => (
                                        <tr key={i} className="border-t">
                                            <td className="px-3 py-2">{r.date}</td>
                                            <td className="px-3 py-2">{r.action}</td>
                                            <td className="px-3 py-2">{r.qty}</td>
                                        </tr>
                                    ))}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td className="px-3 py-3 text-center text-gray-500" colSpan={3}>No logs</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button className="px-3 py-2 bg-gray-100 rounded" onClick={() => setLogsOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryControl;
