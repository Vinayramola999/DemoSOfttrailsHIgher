import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';

export default function AttendanceTable() {
  const [attendanceData, setAttendanceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [menuOpenIndex, setMenuOpenIndex] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [status, setStatus] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const managerId = parseInt(sessionStorage.getItem("userId"));

  useEffect(() => {
    const fetchManagerAttendance = async () => {
      try {
        const res = await axios.get(`https://devdemo.softtrails.net/attendance/manager/attendance/${managerId}`);
        const data = res.data.attendance;

        const formattedData = data.map((item) => ({
          ...item,
          employeeName: item.employee_name || "NA",
          employeeCode: item.user_id,
          dateFrom: item.date_from?.split("T")[0],
          dateTo: item.date_to?.split("T")[0],
          workingHours: calculateWorkingHours(item.in_time, item.out_time),
        }));

        setAttendanceData(formattedData);
        setFilteredData(formattedData);
      } catch (error) {
        console.error("Error fetching data", error);
      }
    };

    fetchManagerAttendance();
  }, [managerId]);

  const calculateWorkingHours = (inTime, outTime) => {
    if (!inTime || !outTime) return "NA";
    const [inH, inM, inS] = inTime.split(":").map(Number);
    const [outH, outM, outS] = outTime.split(":").map(Number);
    let diffH = outH - inH;
    let diffM = outM - inM;
    let diffS = outS - inS;

    if (diffS < 0) {
      diffS += 60;
      diffM -= 1;
    }
    if (diffM < 0) {
      diffM += 60;
      diffH -= 1;
    }

    return `${diffH}:${String(diffM).padStart(2, "0")}:${String(diffS).padStart(2, "0")} Hours`;
  };

  useEffect(() => {
    const filtered = attendanceData.filter((row) => {
      const matchesName = row.employeeName.toLowerCase().includes(searchText.toLowerCase());
      const matchesStatus = status ? row.status === status : true;
      const matchesDateFrom = dateFrom ? new Date(row.dateFrom) >= new Date(dateFrom) : true;
      const matchesDateTo = dateTo ? new Date(row.dateTo) <= new Date(dateTo) : true;

      // Match selected month (if selected)
      const matchesMonth = selectedMonth
        ? new Date(row.dateFrom).getMonth() + 1 === parseInt(selectedMonth)
        : true;

      return matchesName && matchesStatus && matchesDateFrom && matchesDateTo && matchesMonth;
    });

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchText, dateFrom, dateTo, status, selectedMonth, attendanceData]);


  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };


  const handleBulkAction = async (stage, idsToSend = null) => {
    try {
      const ids = idsToSend || selectedRows;
      if (!ids.length) {
        await Swal.fire({
          icon: 'warning',
          title: 'No records selected!',
          text: 'Please select at least one record to proceed.',
        });
        return;
      }

      await axios.post("https://devdemo.softtrails.net/attendance/manager-approval", {
        manager_id: managerId,
        ids, // always array
        stage,
      });

      await Swal.fire({
        icon: 'success',
        title: `Marked as ${stage} successfully!`,
        showConfirmButton: false,
        timer: 1500,
      });

      // Clear selected rows if it was a bulk action
      if (!idsToSend) {
        setSelectedRows([]);
      }

      setMenuOpenIndex(null);

      // Update local state to reflect stage
      const updated = attendanceData.map((row) =>
        ids.includes(row.id) ? { ...row, stage } : row
      );
      setAttendanceData(updated);

      setSelectedRow(null); // Close modal if single

    } catch (error) {
      console.error("Bulk update error:", error);
      await Swal.fire({
        icon: 'error',
        title: 'Action Failed!',
        text: error.response?.data?.message || 'Something went wrong. Please try again.',
      });
    }
  };


  //////////////////////////////////Function to open Modal///////////////////////////////////
  const [selectedRow, setSelectedRow] = useState(null);

  const openModal = (row) => {
    setSelectedRow({
      ...row,
      date: row.dateFrom,
      inTime: row.in_time,
      outTime: row.out_time,
      description: attendanceData.find((r) => r.id === row.id)?.reason || "",
    });

  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-4">

        {/* Search */}
        <div className="flex items-center border rounded-lg px-2 py-1 bg-white">
          <span className="mr-2 text-gray-500">
            🔍
          </span>
          <input
            type="text"
            placeholder="Search"
            className="outline-none"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        {/* Date Range */}
        <div className="flex items-center border rounded-lg px-2 py-1 relative gap-2 bg-white">
          <input
            type="date"
            className="appearance-none custom-date-input outline-none"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          <span className="font-semibold text-gray-600">TO</span>
          <input
            type="date"
            className="appearance-none custom-date-input outline-none"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          {/* Optional: Custom calendar icon */}
          <span className="absolute right-2 text-gray-400 pointer-events-none">📅</span>
        </div>

        {/* Select Month */}
        <select
          className="border px-3 py-1 rounded-lg"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          <option value="">Select month</option>
          <option value="01">January</option>
          <option value="02">February</option>
          <option value="03">March</option>
          <option value="04">April</option>
          <option value="05">May</option>
          <option value="06">June</option>
          <option value="07">July</option>
          <option value="08">August</option>
          <option value="09">September</option>
          <option value="10">October</option>
          <option value="11">November</option>
          <option value="12">December</option>
        </select>

        {/* Select Status */}
        <select className="border px-3 py-1 rounded-lg" value={status} onChange={(e) => setStatus(e.target.value)} >
          <option value="">Select status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="on leave">On Leave</option>
        </select>
      </div>

      {/* Table */}
      <div className="h-[70vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg relative z-0">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
              <tr>
                <th className="p-4 text-left">S. No.</th>
                <th className="p-4 text-left">Employee name</th>
                <th className="p-4 text-left">Employee code</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">In time</th>
                <th className="p-4 text-left">Out time</th>
                <th className="p-4 text-left">Working hours</th>
                <th className="p-4 text-left">Stage</th>
                <th className="p-4 text-left relative">
                  <button
                    onClick={() => setMenuOpenIndex(menuOpenIndex === "header" ? null : "header")}
                    className="text-xl font-bold"
                  >
                    ⋮
                  </button>
                  {/* Dropdown for bulk actions */}
                  {menuOpenIndex === "header" && (
                    <div className="absolute z-50 mt-2 right-0 w-36 bg-white shadow-md rounded-md">

                      <button
                        className="w-full text-left px-4 py-2 hover:bg-green-100"
                        onClick={() => {
                          handleBulkAction("approved");
                        }}
                      >
                        Approve
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-green-100"
                        onClick={() => {
                          handleBulkAction("rejected");
                        }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-4 text-gray-500">
                    No records found.
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-blue-100"} transition`}
                  >
                    <td className="p-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="p-4">{row.employeeName}</td>
                    <td className="p-4">{row.employeeCode}</td>
                    <td className="p-4">{new Date(row.dateFrom).toLocaleDateString("en-GB", {
                      day: "numeric", month: "long", year: "numeric"
                    })}</td>
                    <td className="p-4">{row.in_time}</td>
                    <td className="p-4">{row.out_time}</td>
                    <td className="p-4">{row.workingHours}</td>
                    <td className={`p-4 cursor-pointer underline ${row.stage === "pending" ? "text-orange-500" : row.stage === "approved" ? "text-green-600" : row.stage === "rejected" ? "text-red-600" : row.stage === "resubmitted" ? "text-yellow-500" : "text-gray-500"}`} onClick={() => openModal(row)} >
                      {row.stage.charAt(0).toUpperCase() + row.stage.slice(1)}
                    </td>
                    {/* <td className="p-4 relative z-[1]">
                      <div className="flex flex-col items-start gap-1 relative z-[1]">
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleRowSelection(row.id)}
                        />
                      </div>
                    </td> */}
                    <td className="p-4 relative z-[1]">
                      <div className="flex flex-col items-start gap-1 relative z-[1]">
                        {(row.stage.toLowerCase() === "approved" || row.status?.toLowerCase() === "present") ? (
                          <span className="text-gray-400 text-xs">✔</span>  // or leave empty
                        ) : (
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={selectedRows.includes(row.id)}
                            onChange={() => toggleRowSelection(row.id)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-lightgray">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            &lt;
          </button>
          <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
          <span>of</span>
          <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">{totalPages}</span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Pop up for Approval */}
      {selectedRow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-xl w-full max-w-[720px] p-6 sm:p-8 relative shadow-lg">

            {/* Close Button */}
            <button
              onClick={() => setSelectedRow(null)}
              className="absolute top-4 right-4 bg-red-600 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-3xl"
            >
              &times;
            </button>

            {/* Title */}
            <h2 className="text-xl font-semibold mb-6">Attendance request</h2>

            {/* Grid Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input className="w-full border p-2 rounded-md" value={selectedRow.employeeName} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Employee code</label>
                <input className="w-full border p-2 rounded-md" value={selectedRow.employeeCode} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <input className="w-full border p-2 rounded-md" value={selectedRow.date} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">In time</label>
                <input className="w-full border p-2 rounded-md" value={selectedRow.inTime} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Out time</label>
                <input className="w-full border p-2 rounded-md" value={selectedRow.outTime} readOnly />
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full border p-2 rounded-md h-24 resize-none"
                value={selectedRow.description || "NA"}
                readOnly
              />
            </div>

            {/* Action Buttons */}
            {selectedRow.stage === "pending" && (
              <div className="flex flex-col sm:flex-row justify-end gap-4">
                <button className="w-full sm:w-40 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
                  onClick={() => handleBulkAction("approved", [selectedRow.id])}>
                  Approve
                </button>

                <button className="w-full sm:w-40 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md"
                  onClick={() => handleBulkAction("rejected", [selectedRow.id])}>
                  Reject
                </button>

                <button className="w-full sm:w-40 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md"
                  onClick={() => handleBulkAction("resubmitted", [selectedRow.id])}>
                  Resubmitted
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}