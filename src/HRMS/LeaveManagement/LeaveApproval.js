import { FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import ConfirmationModal from './ApprovalMsg';
import axios from 'axios';
import excel from "../../assests/excel.png";
import folder from '../../assests/folder.png';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';
import { HRMS_API_BASE } from '../../config/apiBase';

const getUniqueOptions = (array, key) => {
    return [...new Set(array.map((item) => item[key]))];
};

const LeavesTable = ({ leaves, onLeaveSelect, itemsPerPage = 25 }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [paginatedLeaves, setPaginatedLeaves] = useState([]);

    const totalPages = Math.ceil(leaves.length / itemsPerPage);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const selectedLeaves = leaves.slice(startIndex, startIndex + itemsPerPage);
        setPaginatedLeaves(selectedLeaves);
    }, [currentPage, leaves]);

    return (
        <div>
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                {/* Scrollable table section */}
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">UserName</th>
                                <th className="p-5 text-left text-black">Leave Type</th>
                                <th className="p-5 text-left text-black">Start Date</th>
                                <th className="p-5 text-left text-black">End Date</th>
                                <th className="p-5 text-left text-black">Leave Days</th>
                                <th className="p-5 text-left text-black">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {paginatedLeaves.map((leave, index) => (
                                <tr key={leave.id} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`} onClick={() =>
                                    onLeaveSelect(leave)}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{`${leave.employee_first_name} ${leave.employee_last_name}`}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_type}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.start_date).toLocaleDateString("en-GB")}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.end_date).toLocaleDateString("en-GB")}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_days.toFixed(1)}</td>
                                    <td
                                        className={`px-2 md:px-4 py-2 text-center cursor-pointer underline flex items-center space-x-2 ${leave.status === "approved"
                                            ? "text-green-500"
                                            : leave.status === "rejected"
                                                ? "text-red-500"
                                                : "text-blue-500"
                                            }`}
                                    >
                                        {leave.status === "approved" && <FaCheckCircle />}
                                        {leave.status === "rejected" && <FaTimesCircle />}
                                        {leave.status === "pending" && <FaClock />}
                                        {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Sticky pagination at bottom of the fixed-height container */}
                {totalPages > 1 && (
                    <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &lt;
                        </button>

                        <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                        <span>of</span>
                        <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
                            {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const LeaveModal = ({ leave, onClose, onUpdateLeaves }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [remarks, setRemarks] = useState(leave.remarks || ''); // Default to 'NA' if remarks are empty
    const [isEditable, setIsEditable] = useState(leave.status === 'pending'); // Editable only if leave status is pending
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [action, setAction] = useState('');

    // Handle the remarks update
    const handleRequest = async (status) => {
        try {
            setErrorMessage(''); // Reset error message on new request
            // If remarks is empty, set it to 'NA'
            const finalRemarks = remarks.trim() === '' ? 'NA' : remarks;

            const token = sessionStorage.getItem('token');
            const managerId = parseInt(sessionStorage.getItem('userId'), 10);

            if (isNaN(managerId)) {
                throw new Error('Invalid manager ID');
            }
            const payload = {
                manager_id: managerId,
                status: status,
                remarks: finalRemarks, // Include final remarks in the payload
            };
            const response = await axios.put(`${HRMS_API_BASE}/leave/leave-requests/${leave.id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            // Update the remarks and status in the parent component immediately
            // onUpdateLeaves(leave.id, status, finalRemarks);
            onUpdateLeaves(leave.id, status, finalRemarks);

            setIsEditable(false); // Disable editing of remarks after the action
            onClose(); // Close the modal
            console.log('Leave status updated:', response.data);
        } catch (error) {
            const message =
                error.response?.data?.error ||
                error.response?.data?.message ||
                error.message ||
                'An unexpected error occurred.';
            setErrorMessage(message);
            console.error('Error updating leave status:', error);
        }
    };

    const openModal = (actionType) => {
        setErrorMessage("");

        if (remarks.trim() === "") {
            setAction(actionType);
            setIsModalOpen(true);
            return;
        }

        // if remarks exist → directly call API
        handleRequest(actionType);
    };


    const closeModal = () => {
        setIsModalOpen(false);
        setAction('');
    };

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-30">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[55%] max-h-[80vh] overflow-y-auto scrollbar-hide">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-[16px] font-semibold">Leave Details</h2>
                    <button className="text-black-600 text-lg" onClick={onClose}> &times; </button>
                </div>

                {/* Modal Body */}
                <div className="mt-3">
                    {/* ROW 1: User Name, Leave Type, Start Date, End Date */}
                    <div className="grid grid-cols-4 gap-4">
                        {/* User Name */}
                        <div>
                            <label className="text-sm font-medium">User Name</label>
                            <input disabled className="mt-1 p-2 border w-full bg-gray-100 rounded" value={`${leave.employee_first_name || ''} ${leave.employee_last_name || ''}`} />
                        </div>
                        {/* Leave Type */}
                        <div>
                            <label className="text-sm font-medium">Leave Type</label>
                            <input disabled className="mt-1 p-2 border w-full bg-gray-100 rounded"
                                value={leave.leave_type || 'N/A'} />
                        </div>
                        {/* Start Date */}
                        <div>
                            <label className="text-sm font-medium">Start Date</label>
                            <input disabled className="mt-1 p-2 border w-full bg-gray-100 rounded" value={(leave.start_date || '').split('T')[0]} />
                        </div>
                        {/* End Date */}
                        <div>
                            <label className="text-sm font-medium">End Date</label>
                            <input disabled className="mt-1 p-2 border w-full bg-gray-100 rounded" value={(leave.end_date || '').split('T')[0]} />
                        </div>
                    </div>

                    {/* ROW 2: Status, Leave Days, Half Day Start, Half Day End */}
                    <div className="grid grid-cols-4 gap-4 mt-3">
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <input disabled className="mt-1 p-2 border w-full bg-gray-100 rounded" value={leave.status} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Leave Days</label>
                            <input disabled className="mt-1 p-2 border w-full bg-gray-100 rounded" value={leave.leave_days || 'N/A'} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Half Day Start</label>
                            <input disabled className="mt-1 p-2 border w-full bg-gray-100 rounded" value={leave.half_day_start ? "Yes" : "No"} />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Half Day End</label>
                            <input disabled className="mt-1 p-2 border w-full bg-gray-100 rounded" value={leave.half_day_end ? "Yes" : "No"} />
                        </div>
                    </div>

                    {/* ROW 3: Document (ONLY IF EXISTS) */}
                    {leave.document_url && leave.document_url !== "false" && (
                        <div className="mt-3 flex items-center gap-3">
                            <label className="text-sm font-medium">Document:</label>

                            <button
                                onClick={() => window.open(leave.document_url, "_blank")}
                                className="hover:opacity-80 flex items-center"
                            >
                                <img src={folder} alt="PDF" className="w-6 h-6" />
                            </button>
                        </div>
                    )}


                    {/* ROW 4: Reason */}
                    <div className="mt-3">
                        <label className="text-sm font-medium">Reason</label>
                        <textarea disabled className="mt-1 p-2 border w-full bg-gray-100 rounded h-20" value={leave.reason || "N/A"} />
                    </div>

                    {/* ROW 5: Remarks */}
                    <div className="mt-3">
                        <label className="text-sm font-medium">Remarks</label>
                        <textarea className={`mt-1 p-2 border w-full rounded h-20 ${isEditable ? 'bg-white' : 'bg-gray-100'}`} disabled={!isEditable} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Type your remarks..." />
                    </div>
                </div>

                {errorMessage && (
                    <div className="p-3 text-sm text-red-600">{typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage}</div>
                )}

                {/* Action Buttons for Pending Status Only */}
                {leave.status === 'pending' && isEditable && (
                    <div className="flex justify-between mt-4">
                        <button className="bg-red-500 text-white py-2 px-4 rounded" onClick={() => openModal('rejected')} > Reject </button>
                        <button className="bg-blue-600 text-white py-2 px-4 rounded" onClick={() => openModal('approved')} > Approve </button>
                    </div>
                )}

                <ConfirmationModal
                    isOpen={isModalOpen}
                    message={remarks.trim() === "" ? `You haven't added remarks. Do you still want to ${action}?` : `Are you sure you want to ${action} this request?`}
                    onConfirm={() => { handleRequest(action); closeModal(); }}
                    onCancel={closeModal}
                />
            </div>
        </div>
    );
};

const LeaveManagement = () => {
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [leaveTypeFilter, setLeaveTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [usernameFilter, setUsernameFilter] = useState("");

    const fetchLeaves = async () => {
        if (!userId || !token) return;
        try {
            const response = await axios.get(`${HRMS_API_BASE}/leave/manager/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const leaveRequests = response.data.leave_requests || [];
            leaveRequests.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setLeaves(leaveRequests);
            setFilteredLeaves(leaveRequests);
        } catch (error) {
            console.error('Error fetching leaves:', error.response ? error.response.data : error.message);
        }
    };

    const filterLeaves = () => {
        const filtered = leaves.filter((leave) => {
            const matchUsername = usernameFilter
                ? `${leave.employee_first_name} ${leave.employee_last_name}`
                    .toLowerCase()
                    .includes(usernameFilter.toLowerCase())
                : true;
            const matchLeaveType = leaveTypeFilter ? leave.leave_type === leaveTypeFilter : true;
            const matchStatus = statusFilter ? leave.status === statusFilter : true;
            const matchDateRange =
                dateRange.start && dateRange.end
                    ? new Date(leave.start_date) >= new Date(dateRange.start) &&
                    new Date(leave.end_date) <= new Date(dateRange.end)
                    : true;

            return matchUsername && matchLeaveType && matchStatus && matchDateRange;
        });

        setFilteredLeaves(filtered);
    };

    useEffect(() => {
        filterLeaves();
    }, [usernameFilter, leaveTypeFilter, statusFilter, dateRange,leaveTypeFilter, statusFilter, dateRange]);

    useEffect(() => {
        fetchLeaves();
    }, [userId, token]);

    // useEffect(() => {
    //     filterLeaves();
    // }, []);

    const handleLeaveSelect = (leave) => {
        setSelectedLeave(leave);
    };

    // const handleUpdateLeaves = (id, status) => {
    //     const updatedLeaves = filteredLeaves.map((leave) =>
    //         leave.id === id ? { ...leave, status } : leave
    //     );
    //     setFilteredLeaves(updatedLeaves);
    // };

    const handleUpdateLeaves = (id, status, remarks) => {
        // update main list
        const updatedLeaves = leaves.map((leave) =>
            leave.id === id ? { ...leave, status, remarks } : leave
        );
        setLeaves(updatedLeaves);
        const updatedFiltered = filteredLeaves.map((leave) =>
            leave.id === id ? { ...leave, status, remarks } : leave
        );
        setFilteredLeaves(updatedFiltered);
    };

    const downloadExcel = () => {
        const headers = [
            ["S.no.", "Manager Id", "First Name", "Last Name", "Leave Type", "Start Date", "End Date", "Leave Days", "First Half", "Second Half", "Status", "Remarks"]
        ];

        const data = leaves.map((leave, index) => [
            index + 1,
            leave.manager_id,
            leave.employee_first_name,
            leave.employee_last_name,
            leave.leave_type,
            leave.start_date.split('T')[0], // Format date
            leave.end_date.split('T')[0],   // Format date
            leave.leave_days,
            leave.half_day_start,
            leave.half_day_end,
            leave.status,
            leave.remarks
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Approvals");
        XLSX.writeFile(workbook, 'leave_approvals.xlsx');
    };

    const leaveTypes = getUniqueOptions(leaves, 'leave_type');
    const statuses = getUniqueOptions(leaves, 'status');
    return (
        <div>
            <div className="relative mb-4 mt-4 flex flex-wrap items-center gap-4 text-sm justify-between">
                {/* Filters Container */}
                <div className="flex flex-wrap items-center gap-4">
                    <div className="w-auto sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
                        <input type="text" value={usernameFilter} onChange={(e) => setUsernameFilter(e.target.value)} placeholder="Search by username" className="p-2 border rounded w-full sm:w-auto" />
                    </div>

                    {/* Leave Type Filter */}
                    <div className="w-auto sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="w-full sm:w-auto">Leave Type</label>
                        <select value={leaveTypeFilter} onChange={(e) => setLeaveTypeFilter(e.target.value)} className="p-2 border rounded w-full sm:w-auto" >
                            <option value="">All</option>
                            {leaveTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <div className="w-auto sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="w-full sm:w-auto">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="p-2 border rounded w-full sm:w-auto"
                        >
                            <option value="">All</option>
                            {statuses.map((status) => (
                                <option key={status} value={status}>
                                    {status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date Range Filters */}
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
                        <label className="w-full sm:w-auto">Date Range</label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="p-2 border rounded w-full sm:w-auto"
                        />
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="p-2 border rounded w-full sm:w-auto"
                        />
                    </div>
                </div>

                {/* Buttons for PDF and Excel Download */}
                <div className="flex space-x-4 sm:space-x-2">
                    <button onClick={downloadExcel} className="text-green-600 hover:text-green-800">
                        <img src={excel} alt="Excel Logo" className="w-8 h-8" />
                    </button>
                </div>
            </div>

            <LeavesTable leaves={filteredLeaves} onLeaveSelect={handleLeaveSelect} />

            {selectedLeave && (
                <LeaveModal
                    leave={selectedLeave}
                    onClose={() => setSelectedLeave(null)}
                    onUpdateLeaves={handleUpdateLeaves}
                    
                />
            )}
        </div>
    );
};
export default LeaveManagement;