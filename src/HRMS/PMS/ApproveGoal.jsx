import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ApproveGoal = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState([]);
  const [kraMapping, setKraMapping] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [verticals, setVerticals] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [approveId, setApproveId] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [statusFilter, setStatusFilter] = useState(null);
  const totalItems = data.length; // or selectedList.length

  const statusOptions = [
    // { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  // Fetch all data
  useEffect(() => {
    fetchGoals();
    fetchKraMapping();
    fetchGoalData();
    fetchDepartments();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await axios.get("https://devdemo.softtrails.net/pms/goals");
      setGoals(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchKraMapping = async () => {
    try {
      const res = await axios.get("https://devdemo.softtrails.net/pms/kra");
      setKraMapping(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(
        "https://devdemo.softtrails.net/departments",

        { headers }
      );
      setDepartments(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVerticals = async (deptId) => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        `https://devdemo.softtrails.net/sub_dept/get/${deptId}`,
        { headers }
      );

      setVerticals(res.data || []);
    } catch (err) {
      console.error("Fetch verticals error:", err);
      Swal.fire("Error!", "Failed to fetch verticals", "error");
    }
  };

  const fetchGoalData = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        "https://devdemo.softtrails.net/pms/goal-kra-weight",
        { headers }
      );

      setData(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const openModal = async (item) => {
    setSelectedGoal(item);
    if (item.dept_id) await fetchVerticals(item.dept_id);
    setModalOpen(true);
  };

  // Update status
  const updateStatus = async (status) => {
    if (!selectedGoal) return;

    setApproveLoading(true);

    const payload = {
      status,
      goal_id: selectedGoal.goal_id,
      kra_mapping_id: selectedGoal.kra_mapping_id,
      year: selectedGoal.year,
      weight: selectedGoal.weight,
      description: selectedGoal.description,
      remark: selectedGoal.remark,
    };

    try {
      await axios.put(
        `https://devdemo.softtrails.net/pms/update/${selectedGoal.goal_kra_weight_id}`,
        payload,
        { headers }
      );

      Swal.fire("Success!", `Goal ${status} successfully`, "success");
      fetchGoalData(); // Refresh table
      setModalOpen(false);
      setSelectedGoal(null);
    } catch (err) {
      console.error(err);
      Swal.fire(
        "Error!",
        err.response?.data?.message || "Failed to update status",
        "error"
      );
    } finally {
      setApproveLoading(false);
    }
  };
  // Filtered data for pagination
  const filteredData = data.filter((item) => {
    if (!statusFilter || statusFilter === "") return true;
    return item.status === statusFilter;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers (1, 2, 3, ...)
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-semibold mb-4 text-blue-600">
        Approve Goals
      </h2>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-60">
          <Select
            options={statusOptions}
            placeholder="Filter by Status"
            value={statusOptions.find((o) => o.value === statusFilter)}
            onChange={(opt) => setStatusFilter(opt ? opt.value : "")}
            isClearable
          />
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead
              className="text-[14px] font-medium bg-white sticky top-0"
              style={{ boxShadow: "0 2px 0 black" }}
            >
              <tr>
                <th className="p-5 text-left text-black">S.No</th>
                <th className="p-5 text-left text-black">Goal</th>
                <th className="p-5 text-left text-black">KRA</th>
                <th className="p-5 text-left text-black">Year</th>
                <th className="p-5 text-left text-black">Weight</th>
                <th className="p-5 text-left text-black">Status</th>
                <th className="p-5 text-left text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              {data
                .filter((item) => {
                  if (!statusFilter || statusFilter === "") return true;
                  return item.status === statusFilter;
                })
                .slice(
                  (currentPage - 1) * itemsPerPage,
                  currentPage * itemsPerPage
                )
                .map((item, i) => {
                  const goalName = item.goal;
                  const kraName = item.kra_name;

                  const statusColor =
                    item.status === "approved"
                      ? " text-green-500 text-3xl"
                      : item.status === "rejected"
                      ? " text-red-600 text-3xl"
                      : " text-yellow-400 text-3xl";

                  return (
                    <tr
                      key={item.id || i}
                      className={`${
                        (i + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"
                      } mt-2`}
                    >
                      <td className="px-5 py-2">{i + 1}</td>
                      <td className="px-5 py-2">{goalName}</td>

                      <td className="px-5 py-2">{kraName}</td>
                      <td className="px-5 py-2">{item.year}</td>
                      <td className="px-5 py-2">
                        {item.weight != null
                          ? parseInt(item.weight, 10) + "%"
                          : "-"}
                      </td>
                      <td className="px-5 py-2">
                        <span
                          className={`px-3 py-1 rounded-full text-base font-semibold ${statusColor}`}
                        >
                          {item.status
                            ? item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)
                            : "Pending"}
                        </span>
                      </td>
                      <td className="px-5 py-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => openModal(item)}
                        >
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      {/* Pagination UI */}
      {totalItems > 10 && (
        <div className="sticky bottom-0 left-0 w-full flex justify-center items-center gap-3 px-4 py-3 bg-gray-100 border-t">
          {/* Previous button */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md text-sm hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          {/* Current Page */}
          <span className="px-4 py-1 bg-blue-600 text-white rounded-md text-sm font-medium">
            {currentPage}
          </span>

          <span className="text-sm text-gray-700">of</span>

          {/* Total Pages */}
          <span className="px-4 py-1 border border-blue-500 text-blue-600 rounded-md text-sm font-medium">
            {totalPages}
          </span>

          {/* Next button */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md text-sm hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && selectedGoal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white w-[600px] rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-blue-700">
              Approve / Reject Goal
            </h2>

            <div className="mb-3">
              <strong>Goal:</strong>{" "}
              {goals.find((g) => g.id === selectedGoal.goal_id)?.goal || "-"}
            </div>
            <div className="mb-3">
              <strong>KRA:</strong>{" "}
              {kraMapping.find((k) => k.id === selectedGoal.kra_mapping_id)
                ?.kra_name || "-"}
            </div>
            <div className="mb-3">
              <strong>Year</strong>{" "}
              {selectedGoal.year
                ? new Date(selectedGoal.year, 0).getFullYear()
                : "-"}
            </div>
            <div className="mb-3">
              <strong>Weight:</strong>{" "}
              {selectedGoal.weight != null
                ? parseInt(selectedGoal.weight, 10)
                : "-"}
            </div>
            <div className="mb-3">
              <strong>Remark:</strong> {selectedGoal.remark || "-"}
            </div>
            <div className="mb-3">
              <strong>Description:</strong> {selectedGoal.description || "-"}
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => updateStatus("approved")}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => updateStatus("rejected")}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveGoal;
