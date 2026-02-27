import * as XLSX from "xlsx";
import "jspdf-autotable";
import Excel from "../../assests/excel.png";
import Folder from "../../assests/folder.png";
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { HRMS_API_BASE } from '../../config/apiBase';

const LeaveStatus = () => {
    const [leaves, setLeaves] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [monthFilter, setMonthFilter] = useState('');
    const [yearFilter, setYearFilter] = useState('');
    const [usernameFilter, setUsernameFilter] = useState('');
    const [documentFilter, setDocumentFilter] = useState('');
    const [years, setYears] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [leavesPerPage] = useState(25);
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const response = await fetch(`${HRMS_API_BASE}/leave/leave-requests`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                if (data.leave_requests) {
                    const sortedLeaves = data.leave_requests
                        .filter((leave) => leave.status === 'approved' || leave.status === 'rejected' || leave.status === 'pending')
                        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

                    // Extract unique years from the leave data
                    const uniqueYears = [
                        ...new Set(sortedLeaves.map((leave) => new Date(leave.start_date).getFullYear())),
                    ].sort((a, b) => b - a);

                    setLeaves(sortedLeaves);
                    setFilteredLeaves(sortedLeaves);
                    setYears(uniqueYears); // Set years for the dropdown
                } else {
                    console.error('Unexpected response structure:', data);
                }
            } catch (error) {
                console.error('Error fetching leaves:', error);
            }
        };

        fetchLeaves();
    }, [token]);

    useEffect(() => {
        let filteredData = [...leaves];

        if (statusFilter) {
            filteredData = filteredData.filter((leave) => leave.status === statusFilter);
        }

        if (monthFilter) {
            filteredData = filteredData.filter(
                (leave) => new Date(leave.start_date).getMonth() + 1 === parseInt(monthFilter)
            );
        }

        if (yearFilter) {
            filteredData = filteredData.filter(
                (leave) => new Date(leave.start_date).getFullYear() === parseInt(yearFilter)
            );
        }

        if (usernameFilter) {
            filteredData = filteredData.filter((leave) =>
                `${leave.first_name} ${leave.last_name}`.toLowerCase().includes(usernameFilter.toLowerCase())
            );
        }

        // ✅ Document filter
        if (documentFilter === "with") {
            filteredData = filteredData.filter((leave) => leave.document_url);
        } else if (documentFilter === "without") {
            filteredData = filteredData.filter((leave) => !leave.document_url);
        }

        // ✅ Search filter
        filteredData = filteredData.filter(
            (leave) =>
                `${leave.first_name} ${leave.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.leave_type.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredLeaves(filteredData);
        setCurrentPage(1);
    }, [leaves, statusFilter, monthFilter, yearFilter, usernameFilter, searchTerm, documentFilter]);


    const totalPages = Math.ceil(filteredLeaves.length / leavesPerPage);
    const indexOfLastLeave = currentPage * leavesPerPage;
    const indexOfFirstLeave = indexOfLastLeave - leavesPerPage;
    const currentLeaves = filteredLeaves.slice(indexOfFirstLeave, indexOfLastLeave);
    const handlePageChange = (page) => setCurrentPage(page);
    const [selectedLeave, setSelectedLeave] = useState(null);

    //*************************  EXCEL   ***************************/
    const downloadExcel = () => {
        const formattedLeaves = currentLeaves.map(leave => ({
            "Employee Name": `${leave.first_name} ${leave.last_name}`,
            "Manager Name": `${leave.manager_first_name} ${leave.manager_last_name}`,
            "Leave Type": leave.leave_type,
            "Start Date": leave.start_date.split('T')[0],
            "End Date": leave.end_date.split('T')[0],
            "Leave Days": leave.leave_days,
            "Reason": leave.reason,
            "Status": leave.status,
            "Half Day Start": leave.half_day_start ? "Yes" : "No",
            "Half Day End": leave.half_day_end ? "Yes" : "No",
            "Remarks": leave.remarks || "N/A",
            "Created At": leave.created_at
        }));
        const worksheet = XLSX.utils.json_to_sheet(formattedLeaves);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Leaves");
        XLSX.writeFile(workbook, "Leave Status.xlsx");
    };

    return (
        <div>
            {/* Filters */}
            <div className="flex justify-between items-center p-4">
                {/* Filters */}
                <div className="flex space-x-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border rounded"
                    >
                        <option value="">Status</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="pending">Pending</option>
                    </select>

                    <select
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="px-4 py-2 border rounded"
                    >
                        <option value="">Month</option>
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i} value={i + 1}>
                                {new Date(0, i).toLocaleString("default", { month: "long" })}
                            </option>
                        ))}
                    </select>

                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="px-4 py-2 border rounded"
                    >
                        <option value="">Year</option>
                        {years.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>

                    <select
                        value={documentFilter}
                        onChange={(e) => setDocumentFilter(e.target.value)}
                        className="px-4 py-2 border rounded"
                    >
                        <option value="">Document</option>
                        <option value="with">With Document</option>
                        <option value="without">Without Document</option>
                    </select>

                    <input
                        type="text"
                        value={usernameFilter}
                        onChange={(e) => setUsernameFilter(e.target.value)}
                        placeholder="Search by username"
                        className="px-4 py-2 border rounded"
                    />
                </div>

                {/* Download Buttons */}
                <div className="flex space-x-4 sm:space-x-2">
                    <button onClick={downloadExcel} className="text-green-600 hover:text-green-800">
                        <img src={Excel} alt="Excel Logo" className="w-8 h-8" />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                {/* Scrollable table section */}
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">UserName</th>
                                <th className="p-5 text-left text-black">Manager Name</th>
                                <th className="p-5 text-left text-black">Leave Type</th>
                                <th className="p-5 text-left text-black">Start Date</th>
                                <th className="p-5 text-left text-black">End Date</th>
                                <th className="p-5 text-left text-black">Leave Days</th>
                                <th className="p-5 text-left text-black">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {currentLeaves.map((leave, index) => (
                                <tr key={leave.id} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{indexOfFirstLeave + index + 1}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{leave.first_name} {leave.last_name}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{leave.manager_first_name} {leave.manager_last_name}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_type}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.start_date).toLocaleDateString('en-GB')}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.end_date).toLocaleDateString('en-GB')}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_days.toFixed(1)}</td>
                                    <td
                                        className={`px-5 md:px-4 py-4 text-left cursor-pointer underline flex items-center ${leave.status === "approved" ? "text-green-500" : leave.status === "rejected" ? "text-red-500" : "text-blue-500"}`} onClick={() => setSelectedLeave(leave)} >
                                        {leave.status === "approved" && <FaCheckCircle />}
                                        {leave.status === "rejected" && <FaTimesCircle />}
                                        <span>{leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {selectedLeave && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-30">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                            <h2 className="text-xl font-semibold mb-6 text-center text-gray-800 border-b pb-2">
                                Leave Details
                            </h2>

                            <div className="grid gap-y-3">
                                <div className="flex justify-between">
                                    <strong className="text-black">Employee:</strong>
                                    <span className="text-blue-600">{selectedLeave.first_name} {selectedLeave.last_name}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Manager:</strong>
                                    <span className="text-blue-600">{selectedLeave.manager_first_name} {selectedLeave.manager_last_name}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Leave Type:</strong>
                                    <span className="text-blue-600">{selectedLeave.leave_type}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Start Date:</strong>
                                    <span className="text-blue-600">{new Date(selectedLeave.start_date).toLocaleDateString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">End Date:</strong>
                                    <span className="text-blue-600">{new Date(selectedLeave.end_date).toLocaleDateString()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Half-Day Start:</strong>
                                    <span className="text-blue-600">{selectedLeave.half_day_start ? "Yes" : "No"}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Half-Day End:</strong>
                                    <span className="text-blue-600">{selectedLeave.half_day_end ? "Yes" : "No"}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Total Leave Days:</strong>
                                    <span className="text-blue-600">{selectedLeave.leave_days}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Reason:</strong>
                                    <span className="text-blue-600">{selectedLeave.reason}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Status:</strong>
                                    <span className={`font-semibold ${selectedLeave.status === "approved" ? "text-green-600" : "text-red-600"}`}>
                                        {selectedLeave.status}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Remarks:</strong>
                                    <span className="text-blue-600">{selectedLeave.remarks ? selectedLeave.remarks : "NA"}</span>
                                </div>

                                <div className="flex justify-between">
                                    <strong className="text-black">Created At:</strong>
                                    <span className="text-blue-600">{new Date(selectedLeave.created_at).toLocaleString()}</span>
                                </div>

                                {selectedLeave.document_url && (
                                    <div className="flex justify-between items-start mt-1">
                                        <strong className="text-black mb-2">Document:</strong>
                                        <div className="flex items-center space-x-3">
                                            <a href={selectedLeave.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" > <img src={Folder} alt="PDF" className="w-6 h-6" /></a>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-center mt-6">
                                <button
                                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                                    onClick={() => setSelectedLeave(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sticky pagination at bottom of the fixed-height container */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center p-4 rounded">
                        <button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &lt;
                        </button>

                        <span className="px-3 py-1 bg-blue-600 text-white rounded mx-2">{currentPage}</span>
                        <span className="mx-1">of</span>
                        <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded mx-2">
                            {totalPages}
                        </span>

                        <button
                            onClick={() => setCurrentPage(currentPage + 1)}
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
export default LeaveStatus;