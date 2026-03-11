import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import axios from "axios";
import { MAIN_API_BASE } from "../../config/apiBase";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Pagination from "../../NewComponents/Pagination";
import { FaTable, FaCalendarAlt, FaSearch } from "react-icons/fa";
import Swal from 'sweetalert2';
import { EyeIcon, EditIcon } from "../../NewComponents/ReactIcons";

const IndividualAttendance = () => {
  const [data, setData] = useState([]);
  const [empCode, setEmpCode] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [viewType, setViewType] = useState("table");
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  // Filters
  const [selectedMonth, setSelectedMonth] = useState(moment().month() + 1);
  const [selectedYear, setSelectedYear] = useState(moment().year());

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Form states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [mode, setMode] = useState("date");
  const [date, setDate] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [inTime, setInTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [reason, setReason] = useState("");
  const [editId, setEditId] = useState(null);

  // Fetch Logged-in User Data to get empCode
  useEffect(() => {
    if (userId && token) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${MAIN_API_BASE}/users/id_user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data.user) {
            setUserInfo(response.data.user);
            // Try to find the employee code in common fields
            const code = response.data.user.emp_code || response.data.user.employee_code || response.data.user.user_id;
            if (code) {
              setEmpCode(code);
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [userId, token]);

  const fetchAttendance = async () => {
    if (!empCode) return;
    setLoading(true);
    try {
      const response = await fetch(`https://devdemo.softtrails.net/attendance/att/V12`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setData(result.data);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setIsEditMode(true);
    setEditId(row.id || null);
    setMode("date");
    const formattedDate = row.att_date ? row.att_date.split('T')[0] : "";
    setDate(formattedDate);
    setFromDate(formattedDate);
    setToDate(formattedDate);
    setInTime(row.first_in && row.first_in !== "--:--" ? row.first_in : "");
    setOutTime(row.last_out && row.last_out !== "--:--" ? row.last_out : "");
    setReason(row.reason || "");
    setIsAddModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!userId) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'User ID not found in session' });
      return;
    }
    const payload = {
      user_id: parseInt(userId),
      date_from: mode === "date" ? date : fromDate,
      date_to: mode === "date" ? date : toDate,
      in_time: inTime,
      out_time: outTime,
      reason: reason,
      source: "Regularization"
    };

    try {
      let res;
      const authToken = sessionStorage.getItem("token");
      if (isEditMode) {
        if (!userInfo) {
          Swal.fire({ icon: 'error', title: 'Error', text: 'User data not loaded for edit' });
          return;
        }
        res = await axios.put(`https://devdemo.softtrails.net/attendance/${editId}`, {
          employee_name: `${userInfo.first_name} ${userInfo.last_name}`,
          employee_code: empCode || "NA",
          date_from: mode === "date" ? date : fromDate,
          date_to: mode === "date" ? date : toDate,
          in_time: inTime,
          out_time: outTime,
          reason: reason
        }, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } else {
        res = await axios.post("https://devdemo.softtrails.net/attendance/mark-bulk", payload, {
          headers: { Authorization: `Bearer ${authToken}` },
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

  const resetForm = () => {
    setDate("");
    setFromDate("");
    setToDate("");
    setInTime("");
    setOutTime("");
    setReason("");
    setMode("date");
  };

  useEffect(() => {
    if (empCode) {
      fetchAttendance();
    }
  }, [empCode]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const date = moment(item.att_date);
      return (date.month() + 1) === Number(selectedMonth) && date.year() === Number(selectedYear);
    });
  }, [data, selectedMonth, selectedYear]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case "PRESENT": return "bg-green-100 text-green-700 border-green-200";
      case "ABSENT": return "bg-red-100 text-red-700 border-red-200";
      case "HALFDAY": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Calendar render helper
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const attendance = data.find(item => moment(item.att_date).isSame(date, "day"));
      if (attendance) {
        let bgColor = "bg-gray-400";
        if (attendance.final_status === "PRESENT") bgColor = "bg-green-500";
        if (attendance.final_status === "ABSENT") bgColor = "bg-red-500";
        if (attendance.final_status === "HALFDAY") bgColor = "bg-yellow-500";

        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-1">
            {/* Large status background circle */}
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full shadow-sm ${bgColor} absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0`}></div>
            {/* Date number on top of circle */}
            <span className="relative z-10 text-white font-black text-xs">{date.getDate()}</span>
          </div>
        );
      }
    }
    return null;
  };

  // Override the default date rendering for the calendar days to only show if NO attendance is found
  const formatDay = (locale, date) => {
    const attendance = data.find(item => moment(item.att_date).isSame(date, "day"));
    return attendance ? "" : date.getDate();
  };

  const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const attendance = data.find(item => moment(item.att_date).isSame(date, "day"));
      if (attendance) {
        return "attendance-tile";
      }
    }
    return null;
  };

  // Calculate Monthly Summary for the Sidebar
  const stats = useMemo(() => {
    const total = filteredData.length;
    const present = filteredData.filter(d => d.final_status?.toUpperCase() === "PRESENT").length;
    const absent = filteredData.filter(d => d.final_status?.toUpperCase() === "ABSENT").length;
    const halfday = filteredData.filter(d => d.final_status?.toUpperCase() === "HALFDAY").length;
    const lateCount = filteredData.filter(d => d.late_mark).length;

    return { total, present, absent, halfday, lateCount };
  }, [filteredData]);

  return (
    <div className="px-1 md:px-1 space-y-6 min-h-screen bg-gray-50/30 font-sans">
      {/* Header Bar - Removed Employee Code Filter */}
      {/* Sticky Header Bar */}
      <div className="sticky top-0 z-[30] bg-gray-50/50 backdrop-blur-md py-2">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col">
            {userInfo && (<p className="text-lg font-bold text-blue tracking-widest flex items-center gap-2">{userInfo.first_name} {userInfo.last_name}</p>)}
          </div>

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewType("table")}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${viewType === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FaTable /> Table
            </button>
            <button
              onClick={() => setViewType("calendar")}
              className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${viewType === "calendar" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
            >
              <FaCalendarAlt /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left Sidebar (Only for Calendar View or both?) - Let's make it conditional based on user request "one sides show the calender and on sided all the filter" */}
        {/* Left Sidebar (Filter & Stats) - Scrolls with page */}
        {viewType === "calendar" && (
          <div className="w-full lg:w-80 space-y-4 animate-in slide-in-from-left duration-300">
            {/* Filter Section */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 space-y-5">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b pb-2">Control Panel</h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Select Year</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 appearance-none bg-gray-50/50"
                  >
                    {Array.from({ length: 11 }, (_, i) => moment().year() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 uppercase">Select Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full border rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700 appearance-none bg-gray-50/50"
                  >
                    {moment.months().map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Legend Section */}
              <div className="pt-4 border-t space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase block mb-1">Status Legend</label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50/50 border border-green-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    <span className="text-[10px] font-bold text-green-700 uppercase">Present</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50/50 border border-red-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span className="text-[10px] font-bold text-red-700 uppercase">Absent</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50/50 border border-yellow-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="text-[10px] font-bold text-yellow-700 uppercase">Half Day</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-50/50 border border-orange-100">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                    <span className="text-[10px] font-bold text-orange-700 uppercase">Late</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Stats Section */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 animate-in fade-in delay-150 duration-500">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 border-b pb-2">Monthly Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-gray-500">Attendance Logged</span>
                  <span className="text-sm font-black text-blue-600">{stats.total} Days</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-gray-500">Full Presents</span>
                  <span className="text-sm font-black text-green-600">{stats.present}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-gray-500">Late Entries</span>
                  <span className="text-sm font-black text-orange-500">{stats.lateCount}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs font-bold text-gray-500">Absents</span>
                  <span className="text-sm font-black text-red-500">{stats.absent}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content (Table or Calendar) - Fixed/Sticky relative to viewport */}
        <div className={`flex-1 min-h-[500px] h-fit lg:sticky lg:top-[120px] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-sm font-bold text-gray-400 animate-pulse uppercase tracking-[0.2em]">Synchronizing...</p>
            </div>
          ) : viewType === "table" ? (
            /* Table View Logic */
            <div className="flex flex-col h-full animate-in fade-in duration-300">
              {/* Table Top Filters (Only for Table View) */}
              <div className="p-4 bg-gray-50/30 border-b flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase">Month Filter:</span>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border rounded-lg px-3 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700"
                  >
                    {moment.months().map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase">Year Filter:</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="border rounded-lg px-3 py-1 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 text-gray-700"
                  >
                    {Array.from({ length: 11 }, (_, i) => moment().year() - 5 + i).map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> <span className="text-[10px] font-bold text-gray-400 uppercase">Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> <span className="text-[10px] font-bold text-gray-400 uppercase">Absent</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-auto scrollbar-hide">
                <table className="min-w-full table-auto border-collapse text-sm">
                  <thead className="text-[14px] font-medium bg-white sticky top-0 z-10" style={{ boxShadow: "0 2px 0 black" }}>
                    <tr>
                      <th className="p-5 text-left text-black uppercase tracking-wider">Date</th>
                      <th className="p-5 text-left text-black uppercase tracking-wider">In Time</th>
                      <th className="p-5 text-left text-black uppercase tracking-wider">Out Time</th>
                      <th className="p-5 text-left text-black uppercase tracking-wider text-center">Status</th>
                      <th className="p-5 text-left text-black uppercase tracking-wider text-center">Hours</th>
                      <th className="p-5 text-left text-black uppercase tracking-wider text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td colSpan={6} className="h-3 bg-white" /></tr>
                    {paginatedData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="p-24 text-center">
                          <div className="flex flex-col items-center gap-2 opacity-30">
                            <FaCalendarAlt size={48} className="text-gray-400 mb-2" />
                            <p className="text-gray-400 font-bold italic text-sm">No records for this timeframe</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedData.map((row, index) => (
                        <tr
                          key={row.id || index}
                          className={`group transition-all active:bg-blue-100 ${(index + 1) % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100/50"}`}
                        >
                          <td className="px-5 py-4 text-left text-[14px] text-gray-700 font-bold">
                            {moment(row.att_date).format("DD MMM YYYY")}
                          </td>
                          <td className="px-5 py-4 text-left text-[14px] text-gray-600 font-bold">{row.first_in || "--:--"}</td>
                          <td className="px-5 py-4 text-left text-[14px] text-gray-600 font-bold">{row.last_out || "--:--"}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border shadow-sm ${getStatusColor(row.final_status)}`}>
                              {row.final_status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center text-[14px] font-black text-blue-600">
                            {(() => {
                              const val = row.total_hours;
                              if (!val) return "--:--";
                              if (String(val).includes(':')) {
                                const parts = String(val).split(':');
                                const h = parts[0].padStart(2, '0');
                                const m = parts.length > 1 ? parts[1].substring(0, 2).padStart(2, '0') : '00';
                                const s = parts.length > 2 ? parts[2].substring(0, 2).padStart(2, '0') : '00';
                                return `${h}:${m}:${s}`;
                              }
                              const decimal = parseFloat(val);
                              if (isNaN(decimal)) return "--:--";
                              const totalSecs = Math.round(decimal * 3600);
                              const h = Math.floor(totalSecs / 3600);
                              const m = Math.floor((totalSecs % 3600) / 60);
                              const s = totalSecs % 60;
                              return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                            })()}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <div className="flex justify-center items-center gap-3">
                              <button onClick={() => setSelectedDay(row)} className="text-blue-500 hover:text-blue-700" title="View Details">
                                <EyeIcon />
                              </button>
                              {row.final_status !== "PRESENT" && (
                                <button onClick={() => handleEdit(row)} className="text-blue-500 hover:text-blue-700" title="Edit">
                                  <EditIcon />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {filteredData.length > itemsPerPage && (
                <div className="p-4 border-t border-gray-50 bg-gray-50/20">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Calendar View Logic with custom sizing */
            <div className="p-4 md:p-8 flex items-start justify-center h-full overflow-auto animate-in zoom-in-95 duration-500">
              <style>{`
              .react-calendar {
                width: 100%;
                max-width: 420px;
                border: none;
                font-family: inherit;
                background: white;
              }
              .react-calendar__tile {
                height: 60px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;
                padding: 10px !important;
                border-radius: 20px;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                border: 1px solid transparent;
                font-size: 0.9rem;
                font-weight: 800;
                color: #1e293b;
                position: relative;
                overflow: hidden;
              }
              .react-calendar__tile abbr {
                position: relative;
                z-index: 10;
              }
              .react-calendar__tile:enabled:hover, .react-calendar__tile:enabled:focus {
                background-color: #f1f5f9;
                transform: scale(1.05);
                z-index: 20;
              }
              .react-calendar__tile--now {
                background: #fef2f2 !important;
                color: #dc2626 !important;
                border: 2px solid #fee2e2 !important;
              }
              .react-calendar__tile--active {
                background: #2563eb !important;
                color: white !important;
                box-shadow: 0 10px 15px -3px rgb(37 99 235 / 0.4);
              }
              .react-calendar__tile--active abbr {
                color: white !important;
              }
              .react-calendar__navigation button {
                font-weight: 900;
                color: #0f172a;
                font-size: 1rem;
                padding: 12px;
                transition: all 0.2s;
              }
              .react-calendar__navigation button:enabled:hover {
                background-color: #f8fafc;
                border-radius: 12px;
              }
              .react-calendar__month-view__weekdays {
                font-weight: 900;
                text-transform: uppercase;
                font-size: 0.65rem;
                color: #94a3b8;
                padding-bottom: 0.8rem;
              }
              .react-calendar__month-view__weekdays__weekday abbr {
                text-decoration: none;
              }
              @media (max-width: 640px) {
                .react-calendar__tile {
                  height: 60px;
                  font-size: 0.75rem;
                  padding: 5px !important;
                }
              }
              `}</style>
              <Calendar
                value={new Date(selectedYear, selectedMonth - 1, 1)}
                tileContent={tileContent}
                tileClassName={tileClassName}
                className="rounded-3xl shadow-none"
                onActiveStartDateChange={({ activeStartDate }) => {
                  setSelectedMonth(moment(activeStartDate).month() + 1);
                  setSelectedYear(moment(activeStartDate).year());
                }}
                onClickDay={(value) => {
                  const attendance = data.find(item => moment(item.att_date).isSame(value, "day"));
                  if (attendance) setSelectedDay(attendance);
                }}
                formatDay={formatDay}
              />
            </div>
          )}
        </div>
      </div>

      {/* Detail Popup Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-all animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8 space-y-8 border-4 border-gray-50">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Daily Overview</p>
                <h3 className="text-2xl font-black text-gray-800">{moment(selectedDay.att_date).format("DD MMMM YYYY")}</h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all font-black text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Check In</span>
                <span className="text-xl font-black text-blue-600">{selectedDay.first_in || "--:--"}</span>
              </div>
              <div className="p-4 bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Check Out</span>
                <span className="text-xl font-black text-blue-600">{selectedDay.last_out || "--:--"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl">
                <span className="text-xs font-black text-gray-500 uppercase">Final Status</span>
                <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${getStatusColor(selectedDay.final_status)}`}>
                  {selectedDay.final_status}
                </span>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl">
                <span className="text-xs font-black text-gray-500 uppercase">Worked Hours</span>
                <span className="text-lg font-black text-blue-600">
                  {(() => {
                    const val = selectedDay.total_hours;
                    if (!val) return "--:--";
                    if (String(val).includes(':')) {
                      const parts = String(val).split(':');
                      const h = parts[0].padStart(2, '0');
                      const m = parts.length > 1 ? parts[1].substring(0, 2).padStart(2, '0') : '00';
                      const s = parts.length > 2 ? parts[2].substring(0, 2).padStart(2, '0') : '00';
                      return `${h}:${m}:${s}`;
                    }
                    const decimal = parseFloat(val);
                    if (isNaN(decimal)) return "--:--";
                    const totalSecs = Math.round(decimal * 3600);
                    const h = Math.floor(totalSecs / 3600);
                    const m = Math.floor((totalSecs % 3600) / 60);
                    const s = totalSecs % 60;
                    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                  })()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-4 bg-gray-800 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

      {/* Manual Input / Edit Form */}
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
            {!isEditMode && (
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
            )}

            {/* Date Inputs */}
            {mode === "date" ? (
              <div className="mb-4">
                <label>Date</label>
                <input
                  type="date"
                  className={`w-full border p-2 rounded ${isEditMode ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  readOnly={isEditMode}
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label>From Date</label>
                  <input
                    type="date"
                    className={`w-full border p-2 rounded ${isEditMode ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    readOnly={isEditMode}
                  />
                </div>
                <div>
                  <label>To Date</label>
                  <input
                    type="date"
                    className={`w-full border p-2 rounded ${isEditMode ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''}`}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    readOnly={isEditMode}
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
};

export default IndividualAttendance;
