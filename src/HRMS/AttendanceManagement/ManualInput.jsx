import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaCalendarAlt } from "react-icons/fa";
import AddButton from "../../NewComponents/AddButton";
import Swal from 'sweetalert2';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AttendanceTable = () => {
    const [data, setData] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [mode, setMode] = useState("date");
    const [inTime, setInTime] = useState("");
    const [outTime, setOutTime] = useState("");
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null); // Store attendance ID

    const handleSubmit = async () => {
        const userId = sessionStorage.getItem("userId");

        if (!userId) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'User ID not found in session' });
            return;
        }

        const payload = {
            user_id: parseInt(userId), // Convert to number if required by API
            date_from: mode === "date" ? date : fromDate,
            date_to: mode === "date" ? date : toDate,
            in_time: inTime,
            out_time: outTime,
            reason: reason,
            source: "Regularization"
        };
        const token = sessionStorage.getItem("token");
        const userData = sessionStorage.getItem("userId");
        try {
            let res;
            if (isEditMode) {
                // Fall back to userData if needed for edit (if required by edit API)
                if (!userData) {
                    Swal.fire({ icon: 'error', title: 'Error', text: 'User data not loaded for edit' });
                    return;
                }
                res = await axios.put(`https://devdemo.softtrails.net/attendance/${editId}`, {
                    employee_name: `${userData.first_name} ${userData.last_name}`,
                    employee_code: userData.emp_id || "NA",
                    date_from: mode === "date" ? date : fromDate,
                    date_to: mode === "date" ? date : toDate,
                    in_time: inTime,
                    out_time: outTime,
                    reason: reason
                }, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            } else {
                // New manual attendance using mark-bulk API
                res = await axios.post("https://devdemo.softtrails.net/attendance/mark-bulk", payload, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: isEditMode ? 'Attendance updated successfully' : 'Attendance marked successfully',
            });
            setIsAddModalOpen(false);
            if (!isEditMode) {
                resetForm();
            }
            setIsEditMode(false);
            setEditId(null);
            fetchAttendance();
        } catch (error) {
            console.error("Submission Error:", error);
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Something went wrong';
            Swal.fire({
                icon: 'error',
                title: 'Failed',
                text: errorMessage,
            });
        }
    };

    const handleEdit = (item) => {
        setIsEditMode(true);
        setEditId(item.id);

        // Pre-fill values
        setMode("date"); // or "range" if needed
        setDate(item.date_from?.slice(0, 10)); // trimming time if present
        setFromDate(item.date_from?.slice(0, 10));
        setToDate(item.date_to?.slice(0, 10));
        setInTime(item.in_time || '');
        setOutTime(item.out_time || '');
        setReason(item.reason || '');

        setIsAddModalOpen(true);
    };

    // For the filter bar
    const [filterFromDate, setFilterFromDate] = useState('');
    const [filterToDate, setFilterToDate] = useState('');

    ////////////////////////////////////////////////
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const itemsPerPage = 25;

    useEffect(() => {
        fetchAttendance();
    }, [currentPage]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const userId = sessionStorage.getItem("userId");
            const response = await axios.get(`https://devdemo.softtrails.net/attendance/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = response.data;
            const attendanceData = result.attendance || [];
            setFullData(attendanceData);
            applyFilters(attendanceData);
        } catch (error) { console.error("Error fetching attendance data:", error); }
        finally { setLoading(false); }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };
    //////////////////////////////////////////////
    const calculateWorkingHours = (inTime, outTime) => {
        const inT = new Date(`1970-01-01T${inTime}`);
        const outT = new Date(`1970-01-01T${outTime}`);
        const diffMs = outT - inT;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
        return `${hours}h ${minutes}m`;
    };
    /////////////DELETE/////////////////
    const handleDelete = async (id) => {
        const token = sessionStorage.getItem('token');

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this record?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel',
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`https://devdemo.softtrails.net/attendance/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (response.ok) {
                    Swal.fire('Deleted!', 'The record has been deleted.', 'success');
                    await fetchAttendance(); // ✅ refresh table after delete
                } else {
                    Swal.fire('Error', data.message || 'Failed to delete', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Something went wrong', 'error');
            }
        }
    };
    ////////////////////Filters/////////////////////
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [fullData, setFullData] = useState([]); // store original data

    const applyFilters = (rawData = fullData) => {
        let filtered = [...rawData];

        // Filter by date range
        if (filterFromDate && filterToDate) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.date_from);
                return itemDate >= new Date(filterFromDate) && itemDate <= new Date(filterToDate);
            });
        }

        // Filter by month
        if (selectedMonth) {
            filtered = filtered.filter(item => {
                const month = new Date(item.date_from).toLocaleString('default', { month: 'long' });
                return month.toLowerCase() === selectedMonth.toLowerCase();
            });
        }

        // Filter by status
        if (statusFilter) {
            filtered = filtered.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
        }

        // Pagination
        const start = (currentPage - 1) * itemsPerPage;
        const paginated = filtered.slice(start, start + itemsPerPage);
        setData(paginated);
        setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    };

    useEffect(() => {
        applyFilters();
    }, [filterFromDate, filterToDate, selectedMonth, statusFilter, currentPage]);

    /////////Reset Form//////
    const resetForm = () => {
        setDate('');
        setFromDate('');
        setToDate('');
        setInTime('');
        setOutTime('');
        setReason('');
        setMode('date');
        setIsEditMode(false);
        setEditId(null);
    };

    const capitalize = (word) => word?.charAt(0).toUpperCase() + word?.slice(1).toLowerCase();  //For Capital Letter

    return (
        <div >
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2 mb-3">
                <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Add Regularization</AddButton>
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-2 items-center mb-4">
                {/* Date range input */}
                <div className="flex items-center border rounded-lg px-2 py-1 text-sm bg-white">
                    <input
                        type="date"
                        className="outline-none"
                        value={filterFromDate}
                        onChange={(e) => setFilterFromDate(e.target.value)}
                    />
                    <span className="mx-2">TO</span>
                    <input
                        type="date"
                        className="outline-none"
                        value={filterToDate}
                        onChange={(e) => setFilterToDate(e.target.value)}
                    />
                    <FaCalendarAlt className="ml-2 text-gray-500" />
                </div>


                {/* Month dropdown */}
                <select className="border px-2 py-1 rounded-lg text-sm" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                    <option value="">Select month</option>
                    <option>January</option>
                    <option>February</option>
                    <option>March</option>
                    <option>April</option>
                    <option>May</option>
                    <option>June</option>
                    <option>July</option>
                    <option>August</option>
                    <option>September</option>
                    <option>October</option>
                    <option>November</option>
                    <option>December</option>
                </select>

                {/* Status dropdown */}
                <select className="border px-2 py-1 rounded-lg text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} >
                    <option value="">Select status</option>
                    <option>Present</option>
                    <option>Absent</option>
                </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Start Date</th>
                                <th className="p-5 text-left text-black">End Date</th>
                                <th className="p-5 text-left text-black">In Time</th>
                                <th className="p-5 text-left text-black">Out Time</th>
                                <th className="p-5 text-left text-black">Working Hours</th>
                                <th className="p-5 text-left text-black">Stage</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {data.map((item, index) => (
                                <tr key={item.id} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(item.date_from).toLocaleDateString()}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(item.date_to).toLocaleDateString()}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{item.in_time}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{item.out_time}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{calculateWorkingHours(item.in_time, item.out_time)}</td>
                                    <td className={`px-5 py-4 text-left text-[14px] font-medium ${item.stage.toLowerCase() === 'pending' ? 'text-yellow-500' : item.stage.toLowerCase() === 'approved' ? 'text-green-600' : 'text-black'}`}>{capitalize(item.stage)}</td>
                                    <td className={`px-5 py-4 text-left text-[14px] font-medium ${item.status.toLowerCase() === 'absent' ? 'text-red-500' : item.status.toLowerCase() === 'present' ? 'text-green-600' : 'text-black'}`}>{capitalize(item.status)}</td>
                                    {/* <td className="px-5 py-4 text-left flex gap-2">
                                        <button className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)} ><FontAwesomeIcon icon={faTrash} /></button>
                                        <button className="text-blue-500 hover:text-blue-600" onClick={() => handleEdit(item)} > <FontAwesomeIcon icon={faEdit} /></button>
                                    </td> */}
                                    <td className="px-5 py-4 text-left flex gap-2">
                                        {item.status.toLowerCase() !== 'present' ? (
                                            <>
                                                <button className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)} >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                                <button className="text-blue-500 hover:text-blue-600" onClick={() => handleEdit(item)} >
                                                    <FontAwesomeIcon icon={faEdit} />
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Not allowed</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10">
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
            </div>

            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl relative">
                        <button
                            className="absolute top-2 right-2 text-red-600 text-2xl"
                            onClick={() => setIsAddModalOpen(false)}
                        >
                            &#10006;
                        </button>

                        <h2 className="text-lg font-semibold mb-4">
                            {isEditMode ? 'Edit Attendance' : 'Manual Attendance'}
                        </h2>

                        {/* Mode Selection */}
                        <div className="flex gap-4 mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="mode"
                                    value="date"
                                    checked={mode === "date"}
                                    onChange={(e) => setMode(e.target.value)}
                                />
                                Date
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="mode"
                                    value="range"
                                    checked={mode === "range"}
                                    onChange={(e) => setMode(e.target.value)}
                                />
                                Date Range
                            </label>
                        </div>

                        {/* Date Inputs */}
                        {mode === "date" ? (
                            <div className="mb-4">
                                <label>Date</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label>From Date</label>
                                    <input
                                        type="date"
                                        className="w-full border p-2 rounded"
                                        value={fromDate}
                                        onChange={(e) => setFromDate(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label>To Date</label>
                                    <input
                                        type="date"
                                        className="w-full border p-2 rounded"
                                        value={toDate}
                                        onChange={(e) => setToDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Time Inputs */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label>In Time</label>
                                <input
                                    type="time"
                                    className="w-full border p-2 rounded"
                                    value={inTime}
                                    onChange={(e) => setInTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label>Out Time</label>
                                <input
                                    type="time"
                                    className="w-full border p-2 rounded"
                                    value={outTime}
                                    onChange={(e) => setOutTime(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="mb-4">
                            <label>Reason</label>
                            <textarea
                                className="w-full border p-2 rounded"
                                rows={3}
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            ></textarea>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={handleSubmit}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                {isEditMode ? 'Update' : 'Submit'}
                            </button>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    if (!isEditMode) {
                                        resetForm(); // Clear only for Add mode
                                    }
                                    setIsEditMode(false);
                                    setEditId(null);
                                }}
                                className="border px-4 py-2 rounded"
                            >
                                Cancel
                            </button>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default AttendanceTable;