import axios from 'axios';
import { useState, useEffect } from 'react';
import "jspdf-autotable";
import * as XLSX from "xlsx";
import excel from '../../assests/excel.png';
import Swal from "sweetalert2";
import { HRMS_API_BASE } from '../../config/apiBase';

const ApprovalAuthority = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const itemsPerPage = 25;

  const fetchLeaveData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("No token found. Please login again.");
        return;
      }

      const leaveResponse = await fetch(`${HRMS_API_BASE}/leave/leave-balances-for-manager`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await leaveResponse.json();
      if (data.message === "Pending leave balances fetched successfully") {
        // Combine first and last names properly
        const formattedData = data.leave_balances.map((item) => ({
          ...item,
          name: `${item.first_name?.trim() || ""} ${item.last_name?.trim() || ""}`.trim(),
        }));

        const sortedData = formattedData.sort((a, b) =>
          (a.name || "").localeCompare(b.name || "")
        );

        setLeaveData(sortedData);
        setFilteredData(sortedData);
      } else {
        console.warn("Unexpected response message:", data.message);
      }
    } catch (error) {
      console.error("Error fetching leave data:", error);
    }
  };

  useEffect(() => {
    fetchLeaveData();
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = leaveData.filter((leave) =>
      leave.name.toLowerCase().includes(term)
    );
    setFilteredData(filtered);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentLeaves = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const filteredLeaves = currentLeaves.filter((leave) =>
    statusFilter ? leave.status === statusFilter : true
  );

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      filteredData.map((leave, index) => ({
        "S.No.": index + 1,
        "Name": `${leave.first_name || ""} ${leave.last_name || ""}`.trim(),
        "User ID": leave.user_id,
        "Leave Type": leave.leave_type,
        "Allocation Type": leave.allocation_type,
        "Previous Balance": leave.previous_balance,
        "Balance": leave.balance,
        "Pending Previous Balance":
          leave.status === "approved" || leave.status === "rejected"
            ? "NA"
            : leave.pending_changes?.pending_previous_balance || "NA",
        "Pending Balance":
          leave.status === "approved" || leave.status === "rejected"
            ? "NA"
            : leave.pending_changes?.pending_balance || "NA",
        "Total Balance": leave.total_balance,
        "Request Count": leave.request_count,
        "Status": leave.status,
        "Updated At": new Date(leave.updated_at).toLocaleString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Leave Details");
    XLSX.writeFile(workbook, "leave_details.xlsx");
  };

  const handleUserClick = (leave) => {
    setSelectedUser(leave);
  };

  const handleApproveReject = async (status) => {
    if (selectedUser) {
      const token = sessionStorage.getItem("token");
      try {
        await axios.put(`${HRMS_API_BASE}/leave/leave-balances-approval/${selectedUser.id}`,
          { status },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        Swal.fire({
          icon: "success",
          title: `Leave Balance ${status === "approved" ? "Approved" : "Rejected"}`,
          text: `The leave balance has been successfully ${status}.`,
          confirmButtonColor: "#3085d6",
          confirmButtonText: "OK",
        });

        fetchLeaveData();
        setSelectedUser(null);
      } catch (error) {
        console.error("Error updating status", error);
        Swal.fire({
          icon: "error",
          title: "Authorization Error",
          text:
            error.response?.data?.message ||
            "You are not authorized to approve or disapprove this leave balance.",
        });
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden flex-col w-full">
      {/* Header Filters */}
      <div className="mb-4 flex flex-wrap items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by Username"
          className="border p-2 rounded w-full sm:w-auto mb-2 sm:mb-0 ml-2"
        />

        <select
          value={statusFilter}
          onChange={handleStatusFilterChange}
          className="border p-2 rounded w-full sm:w-auto mb-2 sm:mb-0 ml-5"
        >
          <option value="">All Statuses</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Pending</option>
        </select>

        <div className="flex justify-end ml-auto mt-2 sm:mt-0">
          <button
            onClick={downloadExcel}
            className="text-green-600 hover:text-green-800 ml-5"
          >
            <img src={excel} alt="Excel Logo" className="w-8 h-8" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-96 rounded-lg">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="py-2 px-4 border-b text-left">S.No.</th>
              <th className="py-2 px-4 border-b text-left">Username</th>
              <th className="py-2 px-4 border-b text-left">Leave Type</th>
              <th className="py-2 px-4 border-b text-left">Allocation Type</th>
              <th className="py-2 px-4 border-b text-left">Current Year Balance</th>
              <th className="py-2 px-4 border-b text-left">Previous Year Balance</th>
              <th className="py-2 px-4 border-b text-left">
                Pending Current Year Balance
              </th>
              <th className="py-2 px-4 border-b text-left">
                Pending Previous Year Balance
              </th>
              <th className="py-2 px-4 border-b text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeaves.length > 0 ? (
              filteredLeaves.map((leave, index) => (
                <tr
                  key={index}
                  className={`border-t ${
                    index % 2 === 0 ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <td className="p-3 border-b text-left">{index + 1}</td>
                  <td className="p-3 border-b text-left">{leave.name}</td>
                  <td className="p-3 border-b text-left">{leave.leave_type}</td>
                  <td className="p-3 border-b text-left">{leave.allocation_type}</td>
                  <td className="p-3 border-b text-left">{leave.balance}</td>
                  <td className="p-3 border-b text-left">
                    {leave.previous_balance}
                  </td>
                  <td className="p-3 border-b text-left text-red-500">
                    {leave.status === "approved" || leave.status === "rejected"
                      ? "NA"
                      : leave.pending_changes?.pending_balance || "NA"}
                  </td>
                  <td className="p-3 border-b text-left text-red-500">
                    {leave.status === "approved" || leave.status === "rejected"
                      ? "NA"
                      : leave.pending_changes?.pending_previous_balance || "NA"}
                  </td>
                  <td
                    className={`p-3 border-b text-left cursor-pointer ${
                      leave.status === "approved"
                        ? "text-green-600"
                        : leave.status === "rejected"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                    onClick={() => handleUserClick(leave)}
                  >
                    {leave.status
                      ? leave.status.charAt(0).toUpperCase() + leave.status.slice(1)
                      : "Pending"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" className="p-3 text-center text-gray-500">
                  No matching results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center p-4 space-x-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={isFirstPage}
              className={`px-3 py-1 rounded border ${
                isFirstPage ? "text-gray-400 bg-white" : "hover:bg-gray-200"
              }`}
            >
              &lt;
            </button>

            <button className="px-3 py-1 rounded bg-blue-600 text-white">
              {currentPage}
            </button>
            <span className="mx-1">of</span>
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1 rounded border text-blue-600 hover:bg-blue-50"
            >
              {totalPages}
            </button>

            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={isLastPage}
              className={`px-3 py-1 rounded border ${
                isLastPage ? "text-gray-400 bg-white" : "hover:bg-gray-200"
              }`}
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-center items-center z-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold text-black border-b pb-2 mb-4">
              {selectedUser.name}
            </h2>

            <div className="space-y-2 text-sm">
              <p className="font-semibold text-gray-700">
                Leave Type:{" "}
                <span className="text-blue-600">
                  {selectedUser.leave_type}
                </span>
              </p>
              <p className="font-semibold text-gray-700">
                Allocation Type:{" "}
                <span className="text-blue-600">
                  {selectedUser.allocation_type}
                </span>
              </p>
              <p className="font-semibold text-gray-700">
                Balance:{" "}
                <span className="text-blue-600">{selectedUser.balance}</span>
              </p>
              <p className="font-semibold text-gray-700">
                Previous Balance:{" "}
                <span className="text-blue-600">
                  {selectedUser.previous_balance}
                </span>
              </p>
              <p className="font-semibold text-gray-700">
                Total Balance:{" "}
                <span className="text-blue-600">
                  {selectedUser.total_balance}
                </span>
              </p>
              <p className="font-semibold text-gray-700">
                Status:
                <span
                  className={`ml-2 px-2 py-1 rounded-lg text-white text-sm ${
                    selectedUser.status === "approved"
                      ? "bg-green-500"
                      : selectedUser.status === "rejected"
                      ? "bg-red-500"
                      : "bg-gray-400"
                  }`}
                >
                  {selectedUser.status
                    ? selectedUser.status.charAt(0).toUpperCase() +
                      selectedUser.status.slice(1)
                    : "NA"}
                </span>
              </p>

              {selectedUser.status !== "approved" &&
                selectedUser.status !== "rejected" && (
                  <>
                    <p className="font-semibold text-gray-700">
                      Pending Balance:{" "}
                      <span className="text-blue-600">
                        {selectedUser.pending_changes?.pending_balance || "N/A"}
                      </span>
                    </p>
                    <p className="font-semibold text-gray-700">
                      Pending Previous Balance:{" "}
                      <span className="text-blue-600">
                        {
                          selectedUser.pending_changes
                            ?.pending_previous_balance || "N/A"
                        }
                      </span>
                    </p>
                  </>
                )}
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-4">
              {selectedUser.status !== "approved" &&
                selectedUser.status !== "rejected" && (
                  <>
                    <button
                      onClick={() => handleApproveReject("approved")}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproveReject("rejected")}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
                    >
                      Reject
                    </button>
                  </>
                )}
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ApprovalAuthority;