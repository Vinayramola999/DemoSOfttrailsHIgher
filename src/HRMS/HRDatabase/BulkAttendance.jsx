import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import Pagination from "../../NewComponents/Pagination";
import { EyeIcon } from "../../NewComponents/ReactIcons";
import AddButton from "../../NewComponents/AddButton";

const BulkAttendance = () => {
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [users, setUsers] = useState([]);
    const [selectedEmpCode, setSelectedEmpCode] = useState(null);
    const [filterMonth, setFilterMonth] = useState("");
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [uploading, setUploading] = useState(false);

    const recordsPerPage = 31;

    /* ================= FETCH ATTENDANCE ================= */
    const fetchAttendance = async () => {
        try {
            const response = await fetch("https://devdemo.softtrails.net/attendance/all");
            const result = await response.json();

            if (result.success && Array.isArray(result.data)) {
                setAttendanceData(result.data);
            } else if (Array.isArray(result)) {
                setAttendanceData(result);
            } else {
                setAttendanceData([]);
            }
        } catch (error) {
            console.error("Failed to fetch attendance:", error);
            setAttendanceData([]);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, []);

    /* ================= BULK UPLOAD ================= */
    const handleBulkUpload = async (file) => {
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(
                "https://devdemo.softtrails.net/attendance/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const result = await response.json();

            if (response.ok) {
                Swal.fire("Success", `${result.rows_inserted} records uploaded!`, "success");
                fetchAttendance();
                setCurrentPage(1);
            } else {
                Swal.fire("Error", result.message || "Upload failed", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Something went wrong", "error");
        } finally {
            setUploading(false);
        }
    };

    const fetchUsers = async () => {
        const token = sessionStorage.getItem("token");
        try {
            const response = await fetch("https://devdemo.softtrails.net/users/getusers",
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            const result = await response.json();

            if (result.users && Array.isArray(result.users)) {
                setUsers(result.users);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
            setUsers([]);
        }
    };

    useEffect(() => {
        fetchAttendance();
        fetchUsers();
    }, []);

    const userMap = useMemo(() => {
        const map = new Map();
        users.forEach(user => {
            map.set(user.emp_id, `${user.first_name} ${user.last_name}`);
        });
        return map;
    }, [users]);





    /* ================= DATA PROCESSING ================= */
    // Get unique employees and their most recent attendance
    const employeeSummary = useMemo(() => {
        const map = new Map();

        attendanceData.forEach(item => {
            if (!map.has(item.emp_code)) {
                map.set(item.emp_code, item);
            } else {
                // Keep the most recent record
                const existing = map.get(item.emp_code);
                if (new Date(item.att_date) > new Date(existing.att_date)) {
                    map.set(item.emp_code, item);
                }
            }
        });

        return Array.from(map.values()).filter(emp => {
            const name = userMap.get(emp.emp_code) || "";
            return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.emp_code?.toLowerCase().includes(searchTerm.toLowerCase());
        });
    }, [attendanceData, searchTerm, userMap]);

    // Pagination for employee summary
    const indexOfLast = currentPage * recordsPerPage;
    const indexOfFirst = indexOfLast - recordsPerPage;
    const currentEmployees = employeeSummary.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(employeeSummary.length / recordsPerPage);

    // Selected employee's attendance history
    const historyData = useMemo(() => {
        if (!selectedEmpCode) return [];

        return attendanceData.filter(item => {
            const itemDate = new Date(item.att_date);
            const matchesCode = item.emp_code === selectedEmpCode;
            const matchesMonth = filterMonth ? (itemDate.getMonth() + 1).toString() === filterMonth : true;
            const matchesYear = filterYear ? itemDate.getFullYear().toString() === filterYear : true;
            return matchesCode && matchesMonth && matchesYear;
        }).sort((a, b) => new Date(b.att_date) - new Date(a.att_date));
    }, [attendanceData, selectedEmpCode, filterMonth, filterYear]);

    const selectedEmployee = useMemo(() => {
        return attendanceData.find(e => e.emp_code === selectedEmpCode);
    }, [attendanceData, selectedEmpCode]);

    /* ================= HELPERS ================= */
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getStatusStyle = (final_status) => {
        const status = final_status?.toUpperCase();
        if (status === "P" || status === "PRESENT") return "text-green-700";
        if (status === "A" || status === "ABSENT") return "text-red-700";
        if (status === "L" || status === "LATE") return "text-yellow-700";
        if (status === "HD" || status === "HALF DAY") return "text-orange-700";
        return "text-gray-700";
    };

    /* ================= STATS CALCULATION ================= */
    const stats = useMemo(() => {
        if (!historyData.length) return { total: 0, late: 0, work: 0, avg: 0 };
        const total = historyData.length;
        const late = historyData.filter(d => d.final_status?.toUpperCase() === "LATE" || d.final_status?.toUpperCase() === "L" || d.is_late).length;
        const work = historyData.reduce((acc, curr) => acc + (curr.total_work_minutes || 0), 0);
        return {
            total,
            late,
            work: `${Math.floor(work / 60)}h ${work % 60}m`,
            avg: `${Math.floor((work / total) / 60)}h ${Math.round((work / total) % 60)}m`
        };
    }, [historyData]);

    return (
        <div className="p-1 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl cursor-pointer transition-all shadow-md flex items-center gap-2 text-sm font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    Bulk Upload
                    <input type="file" accept=".xlsx,.xls" hidden onChange={(e) => handleBulkUpload(e.target.files[0])} />
                </label>

                {/* <AddButton
                    onClick={() => navigate("/hrms/attendance")}
                    text="Add Attendance"
                    icon={<PlusIcon />}
                    <input type="file" accept=".xlsx,.xls" hidden onChange={(e) => handleBulkUpload(e.target.files[0])} />
                /> */}


                <div className="flex items-center gap-3">
                    <input type="text" placeholder="Search employee..." className="border rounded-xl px-4 py-2.5 w-64 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none bg-white shadow-sm" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                </div>
            </div>

            {/* Upload Loader Overlay */}
            {uploading && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
                    <div className="bg-white p-8 rounded-[32px] shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-blue-50 border-t-blue-600 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-black text-gray-800">Uploading File</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Processing attendance data...</p>
                        </div>
                    </div>
                </div>
            )}
            {/* Table */}
            <div className="h-[75vh] sm:h-[60vh] md:h-[65vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Emp Code</th>
                                <th className="p-5 text-left text-black">Employee Name</th>
                                <th className="p-5 text-left text-black">Recent Date</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {currentEmployees.length === 0 ? (
                                <tr> <td colSpan="6" className="p-12 text-center text-gray-400">No employees found</td> </tr>
                            ) : (
                                currentEmployees.map((emp, index) => (
                                    <tr key={emp.emp_code} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-5 py-4 text-left text-[14px] text-black"> {indexOfFirst + index + 1} </td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black"> {emp.emp_code} </td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black"> <button onClick={() => { setSelectedEmpCode(emp.emp_code); setShowModal(true); }} className="hover:text-blue-600 font-bold transition-colors underline-offset-4 decoration-blue-500/30 hover:underline" > {userMap.get(emp.emp_code) || "Unknown"} </button> </td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{formatDate(emp.att_date)}</td>
                                        <td className="px-5 py-4 text-left">
                                            <span className={`text-[14px] font-bold uppercase tracking-wider ${getStatusStyle(emp.final_status)}`}>
                                                {emp.final_status === "P" ? "PRESENT" : emp.final_status === "A" ? "ABSENT" : emp.final_status === "L" ? "LATE" : emp.final_status || "UNKNOWN"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-left">
                                            <button onClick={() => { setSelectedEmpCode(emp.emp_code); setShowModal(true); }} className="text-blue-600 hover:text-blue-800" > <EyeIcon /> </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-5 border-t border-gray-50">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Attendance History Modal */}
            {showModal && selectedEmployee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="px-6 py-3 border-b flex items-center justify-between bg-gray-50/50">
                            <div className="flex items-center gap-4">
                                <div>
                                    <h3 className="text-lg font-extrabold text-gray-900">{userMap.get(selectedEmpCode) || "Unknown"}</h3>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{selectedEmpCode} • History</p>
                                </div>
                                <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block" />
                                <div className="hidden md:flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Year</span>
                                        <select
                                            className="bg-gray-100 rounded-lg px-2 py-1 text-xs font-bold outline-none border-none"
                                            value={filterYear}
                                            onChange={(e) => setFilterYear(e.target.value)}
                                        >
                                            {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Month</span>
                                        <select
                                            className="bg-gray-100 rounded-lg px-2 py-1 text-xs font-bold outline-none border-none"
                                            value={filterMonth}
                                            onChange={(e) => setFilterMonth(e.target.value)}
                                        >
                                            <option value="">All</option>
                                            {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                                                <option key={m} value={i + 1}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-1.5 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Stats & Filters Combined Row */}
                        <div className="px-6 py-3 border-b bg-white flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-4 items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total: <span className="text-gray-800">{stats.total}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Late: <span className="text-gray-800">{stats.late}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-blue-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg: <span className="text-blue-700 font-extrabold">{stats.avg}</span></span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Work: <span className="text-gray-800">{stats.work}</span></span>
                                </div>
                            </div>

                            {/* Mobile Filters (visible only on small screens) */}
                            <div className="md:hidden flex items-center gap-2">
                                <select className="bg-gray-100 rounded px-2 py-1 text-[10px] font-bold" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <select className="bg-gray-100 rounded px-2 py-1 text-[10px] font-bold" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
                                    <option value="">Mo</option>
                                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => (
                                        <option key={m} value={i + 1}>{m}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* History Table */}
                        <div className="flex-1 overflow-auto px-4 scrollbar-hide bg-white">
                            <table className="w-full text-left">
                                <thead className="text-[11px] font-black uppercase tracking-widest bg-white sticky top-0 z-20" style={{ boxShadow: "0 2px 0 black" }}>
                                    <tr className="bg-white text-gray-400">
                                        <th className="px-3 py-2 bg-white text-left whitespace-nowrap">Date</th>
                                        <th className="px-3 py-2 bg-white text-left whitespace-nowrap">In</th>
                                        <th className="px-3 py-2 bg-white text-left whitespace-nowrap">Out</th>
                                        <th className="px-3 py-2 bg-white text-left whitespace-nowrap text-center">Status</th>
                                        <th className="px-3 py-2 bg-white text-left whitespace-nowrap">Work Hrs</th>
                                        <th className="px-3 py-2 bg-white text-left whitespace-nowrap">Break</th>
                                        <th className="px-3 py-2 bg-white text-left whitespace-nowrap">Late</th>
                                        <th className="px-3 py-2 bg-white text-left">Remark</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {historyData.length === 0 ? (
                                        <tr>
                                            <td colSpan="8" className="py-12 text-center text-gray-400 text-sm italic font-medium">No records found for the selected period</td>
                                        </tr>
                                    ) : (
                                        historyData.map((item, i) => (
                                            <tr key={i} className="hover:bg-blue-50/30 transition-colors border-b border-gray-50">
                                                <td className="px-3 py-1.5 text-[12px] font-bold text-gray-600">{formatDate(item.att_date)}</td>
                                                <td className="px-3 py-1.5 text-[12px] text-gray-500 font-bold">{item.first_in || "--:--"}</td>
                                                <td className="px-3 py-1.5 text-[12px] text-gray-500 font-bold">{item.last_out || "--:--"}</td>
                                                <td className="px-3 py-1.5 text-center">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(item.final_status)}`}>
                                                        {item.final_status}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-1.5 text-[12px] text-blue-600 font-black">
                                                    {Math.floor((item.total_work_minutes || 0) / 60)}h {(item.total_work_minutes || 0) % 60}m
                                                </td>
                                                <td className="px-3 py-1.5 text-[12px] text-gray-400 font-bold italic">
                                                    {item.break_minutes || 0}m
                                                </td>
                                                <td className="px-3 py-1.5 text-[12px] text-red-400 font-bold italic">
                                                    {item.late_minutes || 0}m
                                                </td>
                                                <td className="px-3 py-1.5 text-[11px] text-gray-400 font-bold italic truncate max-w-[120px]" title={item.treatment}>
                                                    {item.treatment || "-"}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 border-t bg-gray-50/50 flex justify-end">
                            <button onClick={() => setShowModal(false)} className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all" > Close </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default BulkAttendance;