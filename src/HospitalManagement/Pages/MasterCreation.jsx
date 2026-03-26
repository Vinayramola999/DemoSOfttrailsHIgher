import React, { useState, useEffect } from 'react';
import { createUnit, createItemCategory, getUnits, getItemCategories, createItemMaster, getActiveUnits, getItemCategoriesByType, updateUnitStatus, updateItemCategoryStatus } from '../api/Service';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import {
    FaBox,
    FaTags,
    FaTruck,
    FaStore,
    FaBalanceScale,
    FaUsers,
    FaTimesCircle,
    FaSave,
    FaTrash,
    FaFileExcel,
    FaFilePdf
} from 'react-icons/fa';

const MasterCreation = ({ onItemCreated }) => {
    const [activeModule, setActiveModule] = useState('Users');
    const [unitName, setUnitName] = useState('');
    const [unitDescription, setUnitDescription] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [categoryDescription, setCategoryDescription] = useState('');
    const [itemName, setItemName] = useState('');
    const [unitSearchInput, setUnitSearchInput] = useState('');
    const [itemTypeSearchInput, setItemTypeSearchInput] = useState('');
    const [showUnitDropdown, setShowUnitDropdown] = useState(false);
    const [showItemTypeDropdown, setShowItemTypeDropdown] = useState(false);
    const [systemCategory, setSystemCategory] = useState('MEDICINE');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [reorderLevel, setReorderLevel] = useState('');
    const [units, setUnits] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [currentCategoryPage, setCurrentCategoryPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 6;

    const menuItems = [
        { id: 'Items', label: 'Items', desc: 'Manage inventory items and', icon: <FaBox /> },
        { id: 'Categories', label: 'Categories', desc: 'Product groups and classifications', icon: <FaTags /> },
        { id: 'Suppliers', label: 'Suppliers', desc: 'Vendor and distributor details', icon: <FaTruck /> },
        { id: 'Stores', label: 'Stores', desc: 'Pharmacy locations and ward', icon: <FaStore /> },
        { id: 'Units', label: 'Units', desc: 'Measurement units (mg, ml, etc)', icon: <FaBalanceScale /> },
        { id: 'Users', label: 'Users', desc: 'System access and roles', icon: <FaUsers /> },
    ];

    const getFormHeight = () => {
        if (activeModule === 'Users') return 'h-[297px]';
        if (activeModule === 'Suppliers') return 'h-[397px]';
        if (['Stores'].includes(activeModule)) return 'h-[200px]';
        if (['Categories', 'Units'].includes(activeModule)) return 'h-full';
        return 'h-[350px]';
    };

    const handleCreateUnit = async () => {
        if (!unitName || !unitName.trim()) {
            await Swal.fire({ title: 'Please enter a unit name', icon: 'info' });
            return;
        }
        
        // Check if unit already exists
        const unitExists = units.some(u => u.name.toLowerCase() === unitName.trim().toLowerCase());
        if (unitExists) {
            await Swal.fire({ title: 'This unit already exists!', icon: 'warning' });
            return;
        }
        
        // Double confirmation using SweetAlert2
        const first = await Swal.fire({
            title: `Create unit "${unitName.trim()}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        });
        if (!first.isConfirmed) return;

        const second = await Swal.fire({
            title: 'Please confirm again to save this record.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm Save',
            cancelButtonText: 'Cancel'
        });
        if (!second.isConfirmed) return;

        try {
            await createUnit({ name: unitName.trim(), description: unitDescription.trim() });
            await Swal.fire({ title: 'Unit created successfully', icon: 'success' });
            setUnitName('');
            setUnitDescription('');
            await fetchUnits();
        } catch (err) {
            console.error(err);
            await Swal.fire({ title: err.message || 'Failed to create unit', icon: 'error' });
        }
    };

    const handleCreateCategory = async () => {
        if (!categoryName || !categoryName.trim()) {
            await Swal.fire({ title: 'Please enter a category name', icon: 'info' });
            return;
        }
        if (!systemCategory || systemCategory === 'System Category') {
            await Swal.fire({ title: 'Please select a system category', icon: 'info' });
            return;
        }
        
        // Check if category already exists
        const categoryExists = categories.some(c => (c.name || c.categoryName || c.displayName || '').toLowerCase() === categoryName.trim().toLowerCase());
        if (categoryExists) {
            await Swal.fire({ title: 'This category already exists!', icon: 'warning' });
            return;
        }
        
        // Double confirmation using SweetAlert2
        const first = await Swal.fire({
            title: `Create category "${categoryName.trim()}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        });
        if (!first.isConfirmed) return;

        const second = await Swal.fire({
            title: 'Please confirm again to save this record.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm Save',
            cancelButtonText: 'Cancel'
        });
        if (!second.isConfirmed) return;

        try {
            await createItemCategory({ name: categoryName.trim(), description: categoryDescription.trim(), systemCategory });
            await Swal.fire({ title: 'Category created successfully', icon: 'success' });
            setCategoryName('');
            setCategoryDescription('');
            setSystemCategory('MEDICINE');
            await fetchCategories();
        } catch (err) {
            console.error(err);
            await Swal.fire({ title: err.message || 'Failed to create category', icon: 'error' });
        }
    };

    // Fetch units when component mounts or when activeModule is Units
    useEffect(() => {
        if (activeModule === 'Units') {
            fetchUnits();
        }
        if (activeModule === 'Categories') {
            fetchCategories();
        }
        if (activeModule === 'Items') {
            fetchActiveUnits();
            fetchCategoriesByType('MEDICINE');
        }
    }, [activeModule]);

    // Fetch categories by systemCategory type when systemCategory changes (Only in Items module)
    useEffect(() => {
        if (activeModule === 'Items' && systemCategory) {
            fetchCategoriesByType(systemCategory);
            setSelectedCategoryId('');
            setItemTypeSearchInput('');
        }
    }, [systemCategory, activeModule]);

    const fetchUnits = async () => {
        try {
            setLoading(true);
            const data = await getUnits();
            setUnits(data);
            setCurrentPage(1);
        } catch (err) {
            console.error(err);
            await Swal.fire({ title: 'Failed to fetch units', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const fetchActiveUnits = async () => {
        try {
            const data = await getActiveUnits();
            setUnits(data);
        } catch (err) {
            console.error(err);
            await Swal.fire({ title: 'Failed to fetch active units', icon: 'error' });
        }
    };

    const fetchCategoriesByType = async (type) => {
        try {
            const data = await getItemCategoriesByType(type);
            setCategories(Array.isArray(data) ? data : []);
            setCurrentCategoryPage(1);
        } catch (err) {
            console.error(err);
            await Swal.fire({ title: `Failed to fetch categories for ${type}`, icon: 'error' });
        }
    };

    const handleCreateItem = async () => {
        if (!itemName || !itemName.trim()) {
            await Swal.fire({ title: 'Please enter an item name', icon: 'info' });
            return;
        }
        const first = await Swal.fire({
            title: `Create item "${itemName.trim()}"?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        });
        if (!first.isConfirmed) return;
        const second = await Swal.fire({
            title: 'Please confirm again to save this record.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm Save',
            cancelButtonText: 'Cancel'
        });
        if (!second.isConfirmed) return;
        try {
            const payload = {
                name: itemName.trim(),
                systemCategory,
                categoryId: selectedCategoryId ? Number(selectedCategoryId) : undefined,
                unitId: selectedUnitId ? Number(selectedUnitId) : undefined,
                reorderLevel: reorderLevel !== '' ? Number(reorderLevel) : undefined
            };
            await createItemMaster(payload);
            await Swal.fire({ title: 'Item created successfully', icon: 'success' });
            setItemName('');
            setSystemCategory('MEDICINE');
            setSelectedCategoryId('');
            setSelectedUnitId('');
            setUnitSearchInput('');
            setItemTypeSearchInput('');
            setReorderLevel('');
            await fetchCategoriesByType('MEDICINE');
            if (onItemCreated) {
                await onItemCreated();
            }
        } catch (err) {
            console.error(err);
            await Swal.fire({ title: err.message || 'Failed to create item', icon: 'error' });
        }
    };

    const toggleUnitStatus = async (unit) => {
        const newStatus = (unit.status || 'ACTIVE') === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const first = await Swal.fire({
            title: `Change status to ${newStatus}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        });
        if (!first.isConfirmed) return;
        const second = await Swal.fire({
            title: 'Please confirm again to save this change.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm Save',
            cancelButtonText: 'Cancel'
        });
        if (!second.isConfirmed) return;
        try {
            await updateUnitStatus(unit.id, newStatus);
            await Swal.fire({ title: 'Status updated', icon: 'success' });
            await fetchUnits();
        } catch (err) {
            console.error(err);
            await Swal.fire({ title: err.message || 'Failed to update status', icon: 'error' });
        }
    };

    const toggleCategoryStatus = async (cat) => {
        const newStatus = (cat.status || 'ACTIVE') === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        const first = await Swal.fire({
            title: `Change status to ${newStatus}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'Cancel'
        });
        if (!first.isConfirmed) return;
        const second = await Swal.fire({
            title: 'Please confirm again to save this change.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirm Save',
            cancelButtonText: 'Cancel'
        });
        if (!second.isConfirmed) return;
        try {
            await updateItemCategoryStatus(cat.id, newStatus);
            await Swal.fire({ title: 'Status updated', icon: 'success' });
            await fetchCategories();
        } catch (err) {
            console.error(err);
            await Swal.fire({ title: err.message || 'Failed to update status', icon: 'error' });
        }
    };

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getItemCategories();
            setCategories(Array.isArray(data) ? data : []);
            setCurrentCategoryPage(1);
        } catch (err) {
            console.error(err);
            await Swal.fire({ title: 'Failed to fetch categories', icon: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Export functions
    const exportUnitsToExcel = () => {
        try {
            const data = units.map(unit => ({
                'Unit Name': unit.name,
                'Status': unit.status || 'Active'
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Units');
            XLSX.writeFile(workbook, 'Units.xlsx');
            Swal.fire({ title: 'Units exported to Excel successfully', icon: 'success' });
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Failed to export units to Excel', icon: 'error' });
        }
    };

    const exportUnitsToPDF = () => {
        try {
            const doc = new jsPDF();
            const data = units.map(unit => [unit.name, unit.status || 'Active']);
            autoTable(doc, {
                head: [['Unit Name', 'Status']],
                body: data,
                margin: 10,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
            doc.save('Units.pdf');
            Swal.fire({ title: 'Units exported to PDF successfully', icon: 'success' });
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Failed to export units to PDF', icon: 'error' });
        }
    };

    const exportCategoriesToExcel = () => {
        try {
            const data = categories.map(cat => ({
                'Category Name': cat.name ?? cat.categoryName ?? cat.displayName ?? '',
                'Status': (cat.status ?? 'Active') || 'Active'
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Categories');
            XLSX.writeFile(workbook, 'Categories.xlsx');
            Swal.fire({ title: 'Categories exported to Excel successfully', icon: 'success' });
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Failed to export categories to Excel', icon: 'error' });
        }
    };

    const exportCategoriesToPDF = () => {
        try {
            const doc = new jsPDF();
            const data = categories.map(cat => [
                cat.name ?? cat.categoryName ?? cat.displayName ?? '',
                (cat.status ?? 'Active') || 'Active'
            ]);
            autoTable(doc, {
                head: [['Category Name', 'Status']],
                body: data,
                margin: 10,
                theme: 'grid',
                headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: [245, 245, 245] }
            });
            doc.save('Categories.pdf');
            Swal.fire({ title: 'Categories exported to PDF successfully', icon: 'success' });
        } catch (err) {
            console.error(err);
            Swal.fire({ title: 'Failed to export categories to PDF', icon: 'error' });
        }
    };

    // Pagination logic with sorting (Active first, then alphabetically)
    const sortedUnits = [...units].sort((a, b) => {
        const statusA = a.status || 'Active';
        const statusB = b.status || 'Active';
        if (statusA !== statusB) {
            return statusA === 'Active' ? -1 : 1;
        }
        return (a.name || '').localeCompare(b.name || '');
    });
    const totalPages = Math.ceil(sortedUnits.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedUnits = sortedUnits.slice(startIndex, endIndex);
    const displayTotalPages = sortedUnits.length === 0 ? 0 : totalPages;
    const displayCurrentPage = sortedUnits.length === 0 ? 0 : currentPage;
    const prevDisabled = sortedUnits.length === 0 || currentPage === 1;
    const nextDisabled = sortedUnits.length === 0 || currentPage === totalPages;

    const sortedCategories = [...categories].sort((a, b) => {
        const statusA = a.status || 'Active';
        const statusB = b.status || 'Active';
        if (statusA !== statusB) {
            return statusA === 'Active' ? -1 : 1;
        }
        const nameA = a.name ?? a.categoryName ?? a.displayName ?? '';
        const nameB = b.name ?? b.categoryName ?? b.displayName ?? '';
        return nameA.localeCompare(nameB);
    });
    const categoryTotalPages = Math.ceil(sortedCategories.length / itemsPerPage);
    const categoryStartIndex = (currentCategoryPage - 1) * itemsPerPage;
    const categoryEndIndex = categoryStartIndex + itemsPerPage;
    const paginatedCategories = sortedCategories.slice(categoryStartIndex, categoryEndIndex);
    const displayCategoryTotalPages = sortedCategories.length === 0 ? 0 : categoryTotalPages;
    const displayCategoryCurrentPage = sortedCategories.length === 0 ? 0 : currentCategoryPage;
    const prevCategoryDisabled = sortedCategories.length === 0 || currentCategoryPage === 1;
    const nextCategoryDisabled = sortedCategories.length === 0 || currentCategoryPage === categoryTotalPages;

    return (
        <div className="flex gap-8 h-[calc(100vh-180px)]">
            {/* Left Sidebar - Master Data */}
            <div className="w-1/3 min-w-[300px] bg-white rounded-[6.64px] border-[0.83px] border-[#E2E8F0] shadow-[0px_0.83px_1.66px_0px_rgba(0,0,0,0.05)] flex flex-col">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="font-['Inter'] font-[600] text-[14.11px] leading-[23.24px] text-[#0F172A]">Master Data</h2>
                    <p className="mt-[1.66px] text-xs text-gray-500">Select a master to create or edit</p>
                </div>

                <div className="flex-1 p-1 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveModule(item.id)}
                            className={`w-full text-left flex items-center p-3 rounded-[4.98px] border transition-all duration-200 group ${activeModule === item.id
                                ? 'bg-blue-50 border-blue-200 shadow-sm'
                                : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-[4.98px] flex items-center justify-center text-lg mr-3 transition-colors ${activeModule === item.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                }`}>
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <h3 className={`text-sm font-semibold ${activeModule === item.id ? 'text-blue-900' : 'text-gray-700'}`}>
                                    {item.label}
                                </h3>
                                <p className={`text-xs truncate ${activeModule === item.id ? 'text-blue-700' : 'text-gray-500'}`}>
                                    {item.desc}
                                </p>
                            </div>
                            {activeModule === item.id && (
                                <div className="text-blue-600">
                                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Right Content - Form */}
            <div className={`flex flex-col p-5 bg-white w-[657px] rounded-[6.64px] border-[0.83px] border-[#E2E8F0] shadow-[0px_0.83px_1.66px_0px_rgba(0,0,0,0.05)] ${getFormHeight()}`}>
                {activeModule === 'Users' ? (
                    <>
                        <div className="px-2 pb-3 mb-2 border-b border-gray-100">
                            <h2 className="font-['Inter'] font-[600] text-[14.11px] leading-[23.24px] text-[#0F172A]">Create New {activeModule.slice(0, -1)}</h2>
                            <p className="mt-[1.66px] h-[16.6px] text-xs text-gray-500">Fill in the details to create a new record.</p>
                        </div>

                        <form className="px-2 space-y-4">
                            <div className="grid grid-cols-2 gap-y-3 gap-x-[10px]">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Full Name</label>
                                    <input
                                        type="text"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Username</label>
                                    <input
                                        type="text"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Email</label>
                                    <input
                                        type="email"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Role</label>
                                    <div className="relative">
                                        <select className="w-full h-[33.21px] bg-white rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                                            <option>Administrator</option>
                                            <option>Manager</option>
                                            <option>Staff</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Password</label>
                                    <input
                                        type="password"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Confirm Password</label>
                                    <input
                                        type="password"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="flex justify-end gap-3 px-2 pt-6 mt-auto">
                            <button
                                type="button"
                                className="flex gap-2 items-center justify-center w-[114.82px] h-[33.21px] text-xs font-semibold text-[#00235A] rounded-[4.98px] border border-[#00235A] transition-colors hover:bg-gray-50"
                            >
                                <FaTimesCircle size={14} />
                                Reset
                            </button>
                            <button
                                type="button"
                                className="flex gap-2 items-center justify-center w-[114.82px] h-[33.21px] text-xs font-semibold text-white bg-[#2563EB] rounded-[4.98px] shadow-[0px_0.83px_1.66px_0px_rgba(0,0,0,0.05)] transition-all hover:bg-[#1d4ed8]"
                            >
                                <FaSave size={14} />
                                Save Record
                            </button>
                        </div>
                    </>
                ) : activeModule === 'Items' ? (
                    <>
                        <div className="px-2 pb-3 mb-2 border-b border-gray-100">
                            <h2 className="font-['Inter'] font-[600] text-[14.11px] leading-[23.24px] text-[#0F172A]">Create New Item</h2>
                            <p className="mt-[1.66px] w-[393.15px] h-[15.6px] text-xs text-gray-500">Fill in the details to create a new record in the master database.</p>
                        </div>

                        <form className="px-2 space-y-4">
                            <div className="grid grid-cols-2 gap-y-3 gap-x-[10px]">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Item Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Paracetamol 500mg"
                                        maxLength="30"
                                        className="w-[298.02px] h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))}
                                    />
                                </div>

                                {/* <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Item Type</label>
                                    <input
                                        type="text"
                                        placeholder="BAT-001"
                                        className="w-[298.02px] h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div> */}

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Category</label>
                                    <div className="relative">
                                        <select
                                            className="w-[298.02px] h-[33.21px] bg-white rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            value={systemCategory}
                                            onChange={(e) => setSystemCategory(e.target.value)}
                                        >
                                            <option value="MEDICINE">MEDICINE</option>
                                            <option value="CONSUMABLE">CONSUMABLE</option>
                                            <option value="SERVICE">SERVICE</option>
                                            <option value="RESOURCE">RESOURCE</option>
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                                            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" /></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Item Type</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search category..."
                                            className="w-[298.02px] h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            value={itemTypeSearchInput}
                                            onChange={(e) => {
                                                setItemTypeSearchInput(e.target.value);
                                                setShowItemTypeDropdown(true);
                                            }}
                                            onFocus={() => setShowItemTypeDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowItemTypeDropdown(false), 200)}
                                        />
                                        {showItemTypeDropdown && categories.length > 0 && (
                                            <div className="absolute top-[38px] left-0 w-[298.02px] bg-white border border-[#CBD5E1] rounded-[4.98px] shadow-lg z-10 max-h-[150px] overflow-y-auto">
                                                {categories
                                                    .filter(c => {
                                                        const categoryName = c.name ?? c.categoryName ?? c.displayName ?? '';
                                                        return itemTypeSearchInput === '' || categoryName.toLowerCase().includes(itemTypeSearchInput.toLowerCase());
                                                    })
                                                    .sort((a, b) => {
                                                        const nameA = a.name ?? a.categoryName ?? a.displayName ?? '';
                                                        const nameB = b.name ?? b.categoryName ?? b.displayName ?? '';
                                                        return nameA.localeCompare(nameB);
                                                    })
                                                    .map((cat) => {
                                                        const categoryName = cat.name ?? cat.categoryName ?? cat.displayName ?? '';
                                                        return (
                                                            <div
                                                                key={cat.id}
                                                                className="px-[10.79px] py-[8px] text-xs cursor-pointer hover:bg-blue-50 transition-colors"
                                                                onMouseDown={(e) => {
                                                                    e.preventDefault();
                                                                    setSelectedCategoryId(cat.id);
                                                                    setItemTypeSearchInput(categoryName);
                                                                    setShowItemTypeDropdown(false);
                                                                }}
                                                            >
                                                                {categoryName}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Unit</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search unit..."
                                            className="w-[298.02px] h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                            value={unitSearchInput}
                                            onChange={(e) => {
                                                setUnitSearchInput(e.target.value);
                                                setShowUnitDropdown(true);
                                            }}
                                            onFocus={() => setShowUnitDropdown(true)}
                                            onBlur={() => setTimeout(() => setShowUnitDropdown(false), 200)}
                                        />
                                        {showUnitDropdown && units.length > 0 && (
                                            <div className="absolute top-[38px] left-0 w-[298.02px] bg-white border border-[#CBD5E1] rounded-[4.98px] shadow-lg z-10 max-h-[150px] overflow-y-auto">
                                                {units
                                                    .filter(u => u.name && (unitSearchInput === '' || u.name.toLowerCase().includes(unitSearchInput.toLowerCase())))
                                                    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
                                                    .map((u) => (
                                                        <div
                                                            key={u.id}
                                                            className="px-[10.79px] py-[8px] text-xs cursor-pointer hover:bg-blue-50 transition-colors"
                                                            onMouseDown={(e) => {
                                                                e.preventDefault();
                                                                setSelectedUnitId(u.id);
                                                                setUnitSearchInput(u.name || '');
                                                                setShowUnitDropdown(false);
                                                            }}
                                                        >
                                                            {u.name}
                                                        </div>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Reorder Level</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 50"
                                        maxLength="30"
                                        className="w-[298.02px] h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        value={reorderLevel}
                                        onChange={(e) => setReorderLevel(e.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))}
                                    />
                                </div>

                            </div>
                        </form>

                        <div className="flex justify-end gap-3 px-2 pt-6 mt-auto">
                            <button
                                type="button"
                                onClick={() => {
                                    setItemName('');
                                    setSystemCategory('MEDICINE');
                                    setSelectedCategoryId('');
                                    setSelectedUnitId('');
                                    setItemTypeSearchInput('');
                                    setUnitSearchInput('');
                                    setReorderLevel('');
                                }}
                                className="flex gap-2 items-center justify-center w-[114.82px] h-[33.21px] text-xs font-semibold text-[#00235A] rounded-[4.98px] border border-[#00235A] transition-colors hover:bg-gray-50"
                            >
                                <FaTimesCircle size={14} />
                                Reset
                            </button>
                            <button
                                type="button"
                                onClick={handleCreateItem}
                                className="flex gap-2 items-center justify-center w-[114.82px] h-[33.21px] text-xs font-semibold text-white bg-[#2563EB] rounded-[4.98px] shadow-[0px_0.83px_1.66px_0px_rgba(0,0,0,0.05)] transition-all hover:bg-[#1d4ed8]"
                            >
                                <FaSave size={14} />
                                Save Record
                            </button>
                        </div>
                    </>
                ) : activeModule === 'Suppliers' ? (
                    <>
                        <div className="px-2 pb-3 mb-2 border-b border-gray-100">
                            <h2 className="font-['Inter'] font-[600] text-[14.11px] leading-[23.24px] text-[#0F172A]">Create New Supplier</h2>
                            <p className="mt-[1.66px] h-[16.6px] text-xs text-gray-500">Fill in the details to create a new record in the master database.</p>
                        </div>

                        <form className="px-2 space-y-4">
                            <div className="grid grid-cols-2 gap-y-3 gap-x-[10px]">
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Supplier Name</label>
                                    <input
                                        type="text"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Contact Person</label>
                                    <input
                                        type="text"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Email</label>
                                    <input
                                        type="email"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Address</label>
                                    <input
                                        type="text"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Tax ID / GST</label>
                                    <input
                                        type="text"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">License Number</label>
                                    <input
                                        type="text"
                                        className="w-full h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </form>

                        <div className="flex justify-end gap-3 px-2 pt-6 mt-auto">
                            <button
                                type="button"
                                className="flex gap-2 items-center justify-center w-[114.82px] h-[33.21px] text-xs font-semibold text-[#00235A] rounded-[4.98px] border border-[#00235A] transition-colors hover:bg-gray-50"
                            >
                                <FaTimesCircle size={14} />
                                Reset
                            </button>
                            <button
                                type="button"
                                className="flex gap-2 items-center justify-center w-[114.82px] h-[33.21px] text-xs font-semibold text-white bg-[#2563EB] rounded-[4.98px] shadow-[0px_0.83px_1.66px_0px_rgba(0,0,0,0.05)] transition-all hover:bg-[#1d4ed8]"
                            >
                                <FaSave size={14} />
                                Save Record
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="px-2 pb-3 mb-2 border-b border-gray-100">
                            <h2 className="font-['Inter'] font-[600] text-[14.11px] leading-[23.24px] text-[#0F172A]">
                                Create New {activeModule === 'Categories' ? 'Categorie' : activeModule.slice(0, -1)}
                            </h2>
                            <p className="mt-[1.66px] h-[16.6px] text-xs text-gray-500">Fill in the details to create a new record in the master database.</p>
                        </div>

                        <form className="px-2 space-y-4">
                            <div className="space-y-3">
                                <label className="block text-xs font-medium text-gray-700 h-[17px]">Name</label>
                                <div className="flex items-end gap-3">
                                    <input
                                        type="text"
                                        maxLength="30"
                                        placeholder={`e.g. ${activeModule === 'Categories' ? 'Medicine' : activeModule === 'Units' ? 'Tablet' : 'Main Pharmacy'}`}
                                        className="flex-1 h-[33.21px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all "
                                        {...(activeModule === 'Units' ? { value: unitName, onChange: (e) => setUnitName(e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')) } : activeModule === 'Categories' ? { value: categoryName, onChange: (e) => setCategoryName(e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')) } : {})}
                                    />

                                    {activeModule === 'Categories' && (
                                        <div className="space-y-3">
    
                                        <div className="relative flex-1"> 
                                            <select
                                                className="w-full h-[33.21px] bg-white rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                value={systemCategory}
                                                onChange={(e) => setSystemCategory(e.target.value)}
                                            > 
                                                <option value="MEDICINE">MEDICINE</option>
                                                <option value="CONSUMABLE">CONSUMABLE</option>
                                                <option value="SERVICE">SERVICE</option>
                                                <option value="RESOURCE">RESOURCE</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 pointer-events-none">
                                                <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7 7" /></svg>
                                            </div>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={activeModule === 'Units' ? handleCreateUnit : activeModule === 'Categories' ? handleCreateCategory : undefined}
                                        className="flex gap-2 items-center justify-center w-[114.82px] h-[33.21px] text-xs font-semibold text-white bg-[#2563EB] rounded-[4.98px] shadow-[0px_0.83px_1.66px_0px_rgba(0,0,0,0.05)] transition-all hover:bg-[#1d4ed8] flex-shrink-0"
                                    >
                                        <FaSave size={14} />
                                        Save Record
                                    </button>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-xs font-medium text-gray-700 h-[17px]">Description</label>
                                    <textarea
                                        placeholder="Enter description (optional)"
                                        maxLength="90"
                                        className="w-full h-[50px] rounded-[4.98px] border-[0.83px] border-[#CBD5E1] px-[10.79px] py-[7.47px] text-xs transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                                        {...(activeModule === 'Units' ? { value: unitDescription, onChange: (e) => setUnitDescription(e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')) } : activeModule === 'Categories' ? { value: categoryDescription, onChange: (e) => setCategoryDescription(e.target.value.replace(/[^a-zA-Z0-9\s]/g, '')) } : {})}
                                    />
                                </div>
                            </div>
                        </form>

                        {/* All Units Table */}
                        {activeModule === 'Units' && (
                            <div className="flex flex-col flex-1 min-h-0 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between flex-shrink-0 px-2 pb-3">
                                    <h3 className="text-sm font-semibold text-[#0F172A]">All Units</h3>
                                    <div className="flex items-center gap-2">
                                        <FaFileExcel
                                            className="text-green-600 transition-colors cursor-pointer hover:text-green-800"
                                            size={20}
                                            title="Export to Excel"
                                            onClick={exportUnitsToExcel}
                                        />
                                        <FaFilePdf
                                            className="text-red-600 transition-colors cursor-pointer hover:text-red-800"
                                            size={20}
                                            title="Export to PDF"
                                            onClick={exportUnitsToPDF}
                                        />
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="px-2 py-4 text-xs text-center text-gray-500">Loading...</div>
                                ) : sortedUnits.length === 0 ? (
                                    <div className="px-2 py-4 text-xs text-center text-gray-500">No units found</div>
                                ) : (
                                    <>
                                        <div className="flex-1 px-2 space-y-2">
                                            {paginatedUnits.map((unit) => (
                                                <div
                                                    key={unit.id}
                                                    className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-200 rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                                                >
                                                    <span className="text-xs font-medium text-gray-700">{unit.name}</span>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            className="inline-block px-2 py-0.1 text-xs font-medium rounded transition-colors duration-150"
                                                            onClick={() => toggleUnitStatus(unit)}
                                                            style={{
                                                                backgroundColor: (unit.status || 'ACTIVE') === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                                                                color: (unit.status || 'ACTIVE') === 'ACTIVE' ? '#065f46' : '#991b1b',
                                                                border: '1px solid ' + ((unit.status || 'ACTIVE') === 'ACTIVE' ? '#34d399' : '#f87171')
                                                            }}
                                                        >
                                                            {unit.status || 'Active'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 px-2 pb-2 mt-5 text-xs">
                                            <button
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg border ${prevDisabled ? "text-gray-300 bg-white border-gray-300" : "text-gray-500 bg-white border-gray-300 hover:bg-blue-50"}`}
                                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                                disabled={prevDisabled}
                                                aria-label="Previous page"
                                            >
                                                <span className="text-lg">&lt;</span>
                                            </button>
                                            <button
                                                className="flex items-center justify-center font-bold text-white bg-blue-600 rounded-lg shadow-md w-7 h-7"
                                                disabled={units.length === 0}
                                                aria-label="Current page"
                                            >
                                                {displayCurrentPage}
                                            </button>
                                            <span className="mx-1 font-semibold text-black">of</span>
                                            <button
                                                className="flex items-center justify-center font-bold text-blue-600 bg-white border border-blue-500 rounded-lg shadow-md w-7 h-7"
                                                disabled
                                                aria-label="Total pages"
                                            >
                                                {displayTotalPages}
                                            </button>
                                            <button
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg border ${nextDisabled ? "text-gray-300 bg-white border-gray-300" : "text-gray-500 bg-white border-gray-300 hover:bg-blue-50"}`}
                                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                                disabled={nextDisabled}
                                                aria-label="Next page"
                                            >
                                                <span className="text-lg">&gt;</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {activeModule === 'Categories' && (
                            <div className="flex flex-col flex-1 min-h-0 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between flex-shrink-0 px-2 pb-3">
                                    <h3 className="text-sm font-semibold text-[#0F172A]">All Categories</h3>
                                    <div className="flex items-center gap-2">
                                        <FaFileExcel
                                            className="text-green-600 transition-colors cursor-pointer hover:text-green-800"
                                            size={20}
                                            title="Export to Excel"
                                            onClick={exportCategoriesToExcel}
                                        />
                                        <FaFilePdf
                                            className="text-red-600 transition-colors cursor-pointer hover:text-red-800"
                                            size={20}
                                            title="Export to PDF"
                                            onClick={exportCategoriesToPDF}
                                        />
                                    </div>
                                </div>
                                {loading ? (
                                    <div className="px-2 py-4 text-xs text-center text-gray-500">Loading...</div>
                                ) : sortedCategories.length === 0 ? (
                                    <div className="px-2 py-4 text-xs text-center text-gray-500">No categories found</div>
                                ) : (
                                    <>
                                        <div className="flex-1 px-2 space-y-2">
                                            {paginatedCategories.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className="flex items-center justify-between px-3 py-1.5 bg-white border border-gray-200 rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]"
                                                >
                                                    <span className="text-xs font-medium text-gray-700">{cat.name ?? cat.categoryName ?? cat.displayName ?? ''}</span>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            type="button"
                                                            className="inline-block px-2 py-0.1 text-xs font-medium rounded transition-colors duration-150"
                                                            onClick={() => toggleCategoryStatus(cat)}
                                                            style={{
                                                                backgroundColor: ((cat.status ?? 'ACTIVE') || 'ACTIVE') === 'ACTIVE' ? '#d1fae5' : '#fee2e2',
                                                                color: ((cat.status ?? 'ACTIVE') || 'ACTIVE') === 'ACTIVE' ? '#065f46' : '#991b1b',
                                                                border: '1px solid ' + (((cat.status ?? 'ACTIVE') || 'ACTIVE') === 'ACTIVE' ? '#34d399' : '#f87171')
                                                            }}
                                                        >
                                                            {(cat.status ?? 'Active') || 'Active'}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 px-2 pb-2 mt-5 text-xs">
                                            <button
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg border ${prevCategoryDisabled ? "text-gray-300 bg-white border-gray-300" : "text-gray-500 bg-white border-gray-300 hover:bg-blue-50"}`}
                                                onClick={() => setCurrentCategoryPage((prev) => Math.max(1, prev - 1))}
                                                disabled={prevCategoryDisabled}
                                                aria-label="Previous page"
                                            >
                                                <span className="text-lg">&lt;</span>
                                            </button>
                                            <button
                                                className="flex items-center justify-center font-bold text-white bg-blue-600 rounded-lg shadow-md w-7 h-7"
                                                disabled={categories.length === 0}
                                                aria-label="Current page"
                                            >
                                                {displayCategoryCurrentPage}
                                            </button>
                                            <span className="mx-1 font-semibold text-black">of</span>
                                            <button
                                                className="flex items-center justify-center font-bold text-blue-600 bg-white border border-blue-500 rounded-lg shadow-md w-7 h-7"
                                                disabled
                                                aria-label="Total pages"
                                            >
                                                {displayCategoryTotalPages}
                                            </button>
                                            <button
                                                className={`w-7 h-7 flex items-center justify-center rounded-lg border ${nextCategoryDisabled ? "text-gray-300 bg-white border-gray-300" : "text-gray-500 bg-white border-gray-300 hover:bg-blue-50"}`}
                                                onClick={() => setCurrentCategoryPage((prev) => Math.min(prev + 1, categoryTotalPages))}
                                                disabled={nextCategoryDisabled}
                                                aria-label="Next page"
                                            >
                                                <span className="text-lg">&gt;</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MasterCreation;
