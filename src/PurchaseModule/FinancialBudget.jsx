import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
import API from "../config/api";
import {
  FaHome,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlus,
  FaCalendarAlt,
  FaCheck,
  FaSearch,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { parseISO, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { FaFilePdf, FaFileExcel } from "react-icons/fa";
import excel from "../assests/excel.png";

const FinancialBudget = () => {
  const [userData, setUserData] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [workflowOptions, setWorkflowOptions] = useState([]); // Stores fetched workflows

  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [departments, setDepartments] = useState([]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Budget Report", 14, 10);
    doc.autoTable({
      startY: 20,
      head: [
        [
          "S. No.",
          "Budget",
          "Department",
          "Amount",
          "Start Date",
          "End Date",
          "Created On",
        ],
      ],
      body: filteredBudgets.map((budget, index) => [
        index + 1,
        budget.budget_name,
        departments.find((dept) => dept.dept_id === budget.dept_id)
          ?.dept_name || "NA",
        budget.budget,
        budget.start_date.split("T")[0],
        budget.end_date.split("T")[0],
        budget.created_at.split("T")[0],
      ]),
    });
    doc.save("budget_report.pdf");
  };

  const exportExcel = () => {
    const data = filteredBudgets.map((budget, index) => ({
      "S. No.": index + 1,
      Budget: budget.budget_name,
      Department:
        departments.find((dept) => dept.dept_id === budget.dept_id)
          ?.dept_name || "NA",
      Amount: budget.budget,
      "Start Date": budget.start_date.split("T")[0],
      "End Date": budget.end_date.split("T")[0],
      "Created On": budget.created_at.split("T")[0],
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Budgets");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "budget_report.xlsx");
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(`${API.API_BASE}/departments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, [token]);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get(`${API.PURCHASE_API}/budget/get-budget`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBudgets(response.data);
    } catch (error) {
      console.error("Error fetching budgets:", error);
      Swal.fire("Internal server error");
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, [token]);

  useEffect(() => {
    let filtered = budgets;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter((budget) => {
        const deptName = departments.find((dept) => dept.dept_id === budget.dept_id)?.dept_name || "";
        const searchLower = searchTerm.toLowerCase();
        return (
          budget.budget_name.toLowerCase().includes(searchLower) ||
          deptName.toLowerCase().includes(searchLower) ||
          budget.budget.toString().includes(searchLower)
        );
      });
    }

    // Filter by department
    if (selectedDepartment) {
      filtered = filtered.filter((budget) => {
        const deptName = departments.find((dept) => dept.dept_id === budget.dept_id)?.dept_name;
        return deptName === selectedDepartment;
      });
    }

    // Filter by date range (based on budget start_date and end_date)
    if (fromDate && toDate) {
      const startOfFromDate = startOfDay(new Date(fromDate));
      const endOfToDate = endOfDay(new Date(toDate));
      
      filtered = filtered.filter((item) => {
        const budgetStart = new Date(item.start_date);
        const budgetEnd = new Date(item.end_date);
        // Check if budget date range overlaps with selected range
        return budgetStart <= endOfToDate && budgetEnd >= startOfFromDate;
      });
    }

    setFilteredBudgets(filtered);
  }, [fromDate, toDate, budgets, selectedDepartment, departments, searchTerm]);
  const handleEdit = (budget) => {
    setBudgetData({
      id: budget?.id,
      budgetName: budget?.budget_name || "",
      department: budget?.dept_id || "",
      amount: budget?.budget || "",
      startDate: budget?.start_date?.split("T")[0] || "",
      endDate: budget?.end_date?.split("T")[0] || "",
    });

    setIsEditModalOpen(true);
  };

  const handleDelete = (budgetId) => {
  };
  const verifyToken = async () => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
  await axios.post(`${API.API_BASE}/test/users/verify-token`, { token });
      navigate("/FinancialBudget");
    } catch (error) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenExpiry");
      navigate("/");
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [budgetData, setBudgetData] = useState({
    budgetName: "",
    department: "",
    amount: "",
    startDate: "",
    endDate: "",
  });

  const handleAddBudgetClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setBudgetData({
      budgetName: "",
      department: "",
      amount: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBudgetData((prev) => ({
      ...prev,
      [name]: name === "department" ? Number(value) : value,
    }));
  };
 useEffect(() => {
    axios.get(`${API.WORKFLOW_API}/workflow/get-modules/module?module_name=Purchase Management&sub_module_name=Indenting`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        setWorkflowOptions(
          Array.isArray(res.data.workflows) ? res.data.workflows : []
        );
      })
      .catch((err) => console.error("Error fetching workflows:", err));
  }, []);

  const handleSave = async () => {
    const confirmResult = await Swal.fire({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 20 20">
            <path fill="#005AE6" d="M10 20a10 10 0 1 1 0-20a10 10 0 0 1 0 20m2-13c0 .28-.21.8-.42 1L10 9.58c-.57.58-1 1.6-1 2.42v1h2v-1c0-.29.21-.8.42-1L13 9.42c.57-.58 1-1.6 1-2.42a4 4 0 1 0-8 0h2a2 2 0 1 1 4 0m-3 8v2h2v-2z"/>
          </svg>
          <div style="margin-top: 15px; font-weight: bold; font-size: 18px; color: #005AE6;">
            Add Financial Budget?
          </div>
          <div style="margin-top: 8px; font-size: 14px; color: #555;">
            Are you sure you want to add Financial Budget?
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      reverseButtons: true, // This line reverses the order
      customClass: {
        popup: "square-popup",
        cancelButton: "custom-cancel-button",
        confirmButton: "custom-confirm-button",
      },
    });

    if (!confirmResult.isConfirmed) return;

    const payload = {
      budget_name: budgetData.budgetName,
      department: budgetData.department,
      budget: parseFloat(budgetData.amount),
      user_id: userId,
      workflow_id: budgetData.workflow,
      start_date: budgetData.startDate,
      end_date: budgetData.endDate,
    };

    try {
      await axios.post(`${API.PURCHASE_API}/budget`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Financial Budget Added successfully",
        confirmButtonText: "Continue",
        customClass: {
          popup: "square-popup",
          title: "swal-title",
        },
      });

      handleCloseModal();
      await fetchBudgets();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        "Failed to add budget. Please try again.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        customClass: {
          popup: "square-popup",
        },
      });
    }
  };
  const handleSaveEdit = async () => {
    if (!budgetData) return;
    const confirmResult = await Swal.fire({
      html: `
        <div style="display: flex; flex-direction: column; align-items: center;">
          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 20 20">
            <path fill="#005AE6" d="M10 20a10 10 0 1 1 0-20a10 10 0 0 1 0 20m2-13c0 .28-.21.8-.42 1L10 9.58c-.57.58-1 1.6-1 2.42v1h2v-1c0-.29.21-.8.42-1L13 9.42c.57-.58 1-1.6 1-2.42a4 4 0 1 0-8 0h2a2 2 0 1 1 4 0m-3 8v2h2v-2z"/>
          </svg>
          <div style="margin-top: 15px; font-weight: bold; font-size: 18px; color: #005AE6;">
Update?          </div>
          <div style="margin-top: 8px; font-size: 14px; color: #555;">
            Are you sure you want to update Financial Budget?
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Confirm",
      cancelButtonText: "Cancel",
      reverseButtons: true, // This line reverses the order

      customClass: {
        popup: "square-popup",
        cancelButton: "custom-cancel-button",
        confirmButton: "custom-confirm-button",
      },
    });

    if (!confirmResult.isConfirmed) return;

    const payload = {
      budget_name: budgetData.budgetName,
      dept_id: budgetData.department,
      budget: parseFloat(budgetData.amount),
      user_id: budgetData.id,
      start_date: budgetData.startDate,
      end_date: budgetData.endDate,
    };

    try {
      await axios.patch(`${API.PURCHASE_API}/budget/${budgetData.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Financial Budget Updated successfully.",
        customClass: {
          popup: "square-popup",
        },
      });

      setBudgets((prevBudgets) =>
        prevBudgets.map((budget) =>
          budget.id === budgetData.id ? { ...budget, ...payload } : budget
        )
      );

      handleCloseEditModal();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update budget.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
        customClass: {
          popup: "square-popup",
        },
      });
    }
  };

  const handleCloseEditModal = () => setIsEditModalOpen(false);

  const handleDeleteClick = (budget) => {
    setSelectedBudget(budget);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBudget) return;

    try {
      await axios.delete(`${API.PURCHASE_API}/budget/${selectedBudget.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `"${selectedBudget.budget_name}" has been deleted successfully.`,
      });

      // Remove the deleted budget from the state
      setBudgets((prevBudgets) =>
        prevBudgets.filter((budget) => budget.id !== selectedBudget.id)
      );

      handleCloseDeleteModal();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to delete budget.";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedBudget(null);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can change this
  
  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);


  return (
    <div className="flex">
      <div className="p-3 w-full">
        <div className=" mb-4">
          <button
            onClick={handleAddBudgetClick}
            className="bg-[#005AE6] text-white px-8 py-4 rounded-lg hover:bg-[#004bb5] transition duration-300 flex items-center gap-2"
          >
            <FaPlus />
            Add Budget
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          {/* Search Input */}
          <div className="relative w-1/4 min-w-[200px]">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 w-full p-2 pl-10 rounded-xl"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>

          {/* Department Dropdown */}
          <div>
            <select
              id="department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border border-gray-300 p-3 rounded-xl min-w-[200px]"
            >
              <option value="">-- Select Department --</option>
              {departments.map((dept) => (
                <option key={dept.dept_id} value={dept.dept_name}>
                  {dept.dept_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Picker */}
          <div className="flex items-center gap-2 border border-gray-300 p-3 rounded-xl bg-white">
            <input
              type="date"
              value={fromDate ? fromDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setFromDate(e.target.value ? new Date(e.target.value) : null)}
              className="border border-gray-300 p-2 rounded"
            />
            <span className="font-bold">TO</span>
            <input
              type="date"
              value={toDate ? toDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setToDate(e.target.value ? new Date(e.target.value) : null)}
              className="border border-gray-300 p-2 rounded"
            />
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-4 ml-auto">
            <button
              onClick={exportExcel}
              className="bg-transparent hover:scale-105 transition-transform"
            >
              <img src={excel} alt="Excel Logo" className="w-10 h-10" />
            </button>
            <button
              onClick={exportPDF}
              className="bg-transparent hover:scale-105 transition-transform"
            >
              <img
                src="https://img.icons8.com/color/48/pdf.png"
                alt="PDF Icon"
                className="w-10 h-10"
              />
            </button>
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[600px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add Budget</h2>
                <FaTimes
                  className="text-red-500 cursor-pointer"
                  onClick={handleCloseModal}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label>Budget Name</label>
                  <input
                    type="text"
                    name="budgetName"
                    value={budgetData.budgetName}
                    onChange={handleChange}
                    className="border p-2 w-full rounded-lg"
                    placeholder="Enter Budget name"
                  />
                </div>

                <div>
                  <label>Department</label>
                  <select
                    name="department"
                    value={budgetData.department}
                    onChange={handleChange}
                    className="border p-2 w-full rounded-lg"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.dept_id} value={dept.dept_id}>
                        {dept.dept_name}
                      </option>
                    ))}
                  </select>
                </div>
<div>
                 <label>Workflow</label>
                  <select
                    name="workflow"
                    value={budgetData.workflow}
                    onChange={handleChange}
                    className="border p-2 w-full rounded-lg"
                  >
                    <option value="">Select Workflow</option>
                    {workflowOptions.map((wf, idx) => (
                      <option
                        key={wf.workflow_id ?? wf.id ?? idx}
                        value={wf.workflow_id ?? wf.id ?? ""}
                      >
                        {wf.workflow_name ?? wf.name ?? `Workflow ${idx + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={budgetData.amount}
                    onChange={handleChange}
                    className="border p-2 w-full rounded-lg"
                    placeholder="Enter Budget amount"
                  />
                </div>


                <div>
                  <label>Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={budgetData.startDate}
                    onChange={handleChange}
                    className="border p-2 w-full rounded-lg"
                  />
                </div>

                <div>
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={budgetData.endDate}
                    onChange={handleChange}
                    className="border p-2 w-full rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-start gap-4 mt-6">
                <button
                  onClick={handleSave}
                  className="bg-[#005AE6] w-1/3 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>
                <button
                  onClick={handleCloseModal}
                  className="border border-black w-1/3 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto  p-4 rounded-lg shadow bg-white">
        {filteredBudgets.length === 0 ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <p className="text-center text-red-600 font-semibold">No data in range</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[400px]">
            <table className="min-w-full text-sm text-center border-collapse">
              <thead className="bg-gray-200 text-xs uppercase ">
                <tr>
                  <th className="p-2">S. No.</th>
                  <th className="p-2">Budget</th>
                  <th className="p-2">Department</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Start Date</th>
                  <th className="p-2">End Date</th>
                  <th className="p-2">Created On</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBudgets.map((budget, index) => (
                  <tr key={budget.id} className="odd:bg-blue-50">
                    <td className="p-2">{index + 1}</td>
                    <td className="text-custome-blue p-2 cursor-pointer">{budget.budget_name}</td>
                    <td className="p-2">
                      {departments.find((dept) => dept.dept_id === budget.dept_id)?.dept_name || "NA"}
                    </td>
                    <td className="font-bold">{budget.budget}</td>
                    <td className="p-2">{budget.start_date.split("T")[0]}</td>
                    <td className="p-2">{budget.end_date.split("T")[0]}</td>
                    <td className="p-2">{budget.created_at.split("T")[0]}</td>
                    <td className="flex justify-center gap-2 p-2">
                      <FaEdit className="text-custome-blue cursor-pointer" onClick={() => handleEdit(budget)} />
                      <FaTrash className="text-red-500 cursor-pointer" onClick={() => handleDeleteClick(budget)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
          
        <div className="flex items-center gap-2 mt-4 justify-center">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 bg-white border-gray-300  border rounded disabled:opacity-50"
          >
            &lt;
          </button>

          <button className="px-4 py-2 bg-custome-blue border-custome-blue  text-white rounded">
            {currentPage}
          </button>

          <span className="px-2">of</span>

          <button className="px-4 py-2 border rounded text-custome-blue">
            {totalPages}
          </button>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-2 bg-white border-gray-300 border rounded disabled:opacity-50"
          >
            &gt;
          </button>
        </div>

        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[600px]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit Budget</h2>
                <FaTimes
                  className="text-red-500 cursor-pointer"
                  onClick={handleCloseEditModal}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1">Budget Name</label>
                  <input
                    type="text"
                    name="budgetName"
                    value={budgetData.budgetName}
                    onChange={handleChange}
                    placeholder="Enter Budget Name"
                    className="border p-2 w-full rounded-lg"
                  />
                </div>

                {/* <div>
                  <label className="block mb-1">Department</label>
                  <select
                  name="department"
                  value={budgetData.department}
                  onChange={handleChange}
                  className="border p-2 w-full rounded-lg"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.dept_id} value={dept.dept_id}>
                      {dept.dept_name}
                    </option>
                  ))}
                </select>
                
                
                </div> */}

                <div>
                  <label className="block mb-1">Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={budgetData.amount}
                    onChange={handleChange}
                    className="border p-2 w-full rounded-lg"
                    placeholder="Enter Budget Amount"
                  />
                </div>

                <div>
                  <label className="block mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={budgetData.startDate}
                    onChange={handleChange}
                    className="border p-2 w-full rounded-lg"
                  />
                </div>

                <div>
                  <label className="block mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={budgetData.endDate}
                    onChange={handleChange}
                    className="border p-2 w-full rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-start gap-4 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="bg-[#005AE6] w-1/3 text-white px-4 py-2 rounded-lg"
                >
                  Save Change
                </button>
                <button
                  onClick={handleCloseEditModal}
                  className="border border-black w-1/3 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isSuccessModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[350px] text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#005AE6] text-white p-4 rounded-full">
                  <FaCheck size={40} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-[#005AE6]">Success</h2>
              <p className="text-gray-500 mt-2">
                Financial Budget Updated successfully
              </p>
              <button
                onClick={() => setIsSuccessModalOpen(false)}
                className="bg-[#005AE6] text-white px-6 py-2 mt-4 rounded-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[350px] text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-4 rounded-full">
                  <FaTrash size={40} className="text-gray-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold">Delete Budget?</h2>
              <p className="text-gray-500 mt-2">
                Are you sure you want to delete{" "}
                <strong>{selectedBudget?.budgetName}</strong>?
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleCloseDeleteModal}
                  className="border border-black px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialBudget;
