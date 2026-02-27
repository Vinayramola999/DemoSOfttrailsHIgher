import axios from "axios";
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import Select from "react-select";
import DownloadTableButtons from "./components/Downloadpdfexcel";
import API from "../config/api";

const IndentApprovals = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("allRequests");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
const [budgetOptions, setBudgetOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [workflows, setWorkflows] = useState([]);
const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(""); // Changed from selectedBudget

  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "User Id", accessor: "user_id" },
    { header: "Indent ID", accessor: "indent_id" },
    { header: "Department", accessor: "department" },
    { header: "Status", accessor: "status" },
  ];

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get(
        `${API.COLUMN_TYPES_API}/budget-workflow/workflows`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWorkflows(response.data); // assuming response.data is an array
    } catch (error) {
      console.error("Error fetching workflows:", error);
    }
  };

  useEffect(() => {
    fetchWorkflows();
  }, [token]);

useEffect(() => {
  const userId = sessionStorage.getItem("userId");
  if (!userId) return;

  axios
    .get(
      `${API.PURCHASE_API}/budget/department/${userId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    .then((res) => {
      // Convert budget_name array to array of objects
      const names = Array.isArray(res.data.budget_name) ? res.data.budget_name : [];
      const budgets = names.map((name, idx) => ({
        id: idx + 1, // or use name as id if unique
        budget_name: name,
      }));
      setBudgetOptions(budgets);
    })
    .catch((err) => console.error("Error fetching budgets:", err));
}, [token]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `${API.API_BASE}/departments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDepartments(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };

    fetchDepartments();
  }, [token]);

  useEffect(() => {
    const fetchAllIndentingData = async () => {
      try {
        const [indentingRes, salesRes] = await Promise.all([
          axios.get(`${API.PURCHASE_API}/indenting`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API.PURCHASE_API}/sales/salesIndenting`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const indentingData = Array.isArray(indentingRes.data)
          ? indentingRes.data
          : [];
        const salesData = Array.isArray(salesRes.data)
          ? salesRes.data
          : [];

        // ✅ Filter only Approved
        const approvedIndenting = indentingData.filter(
          (item) => item.status === "Approved"
        );
        const approvedSales = salesData.filter(
          (item) => item.status === "Approved"
        );

        const combinedData = [...approvedIndenting, ...approvedSales];

        setData(combinedData);
      } catch (error) {
        console.error("Error fetching indenting data:", error);
      }
    };

    if (token) {
      fetchAllIndentingData();
    }
  }, [token]);

  const [selectedBudget, setSelectedBudget] = useState(""); // or null based on budget dropdown

 const filteredData = data.filter((item) => {
    const matchesStatus = selectedStatus
      ? item.status === selectedStatus
      : true;
    const matchesDepartment = selectedDepartment
      ? String(item.dept_id) === String(selectedDepartment)
      : true;

    // Search by User Id, Department Name, Request, Request for, etc.
    const departmentName =
      departments.find((b) => b.dept_id === item.dept_id)?.dept_name || "";
    const matchesSearch = searchTerm
      ? (
          item.user_id +
          " " +
          departmentName +
          " " +
          (item.asset_name || "") +
          " " +
          (item.request_for || "") +
          " " +
          (item.uom || "") +
          " " +
          (item.status || "")
        )
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : true;

    return matchesStatus && matchesDepartment && matchesSearch;
  });

  const handleStatusClick = (item) => {
    setSelectedItem(item);
    setIsPopupOpen(true);
  };

  const handleStatusUpdate = (status) => {
    if (!selectedItem) return;

    const payload = {
      user_id: selectedItem.user_id,
      status: status,
    };

    axios
      .put(
        `${API.PURCHASE_API}/indenting/update-status/${selectedItem.id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        console.log(`${status} successful:`, response.data);

        // Show success Swal popup
        Swal.fire({
          icon: "success",
          title: "Status Updated",
          text: `Request has been ${status.toLowerCase()} successfully.`,
        }).then(() => {
          // Update local state after user closes popup
          setData((prevData) =>
            prevData.map((item) =>
              item.id === selectedItem.id ? { ...item, status } : item
            )
          );
          closePopup();
        });
      })
      .catch((error) => {
        console.error(`${status} failed:`, error);

        const errorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          "Something went wrong!";

        Swal.fire({
          icon: "error",
          title: "Request Failed",
          text: errorMessage,
        });
      });
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setSelectedItem(null);
  };
  const budgetSelectOptions = [
    { value: "", label: "All Budgets" },
...(Array.isArray(budgetOptions) ? budgetOptions : []).map((b) => ({
      value: b.id,
      label: b.budget_name,
    })),
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // You can change this

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const paginatedApproval = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const exportData = filteredData.map((item, idx) => ({
    sno: idx + 1,
    user_id: item.user_id,
    indent_id: item.indent_id || item.id || "-",
    department:
      departments.find((b) => b.dept_id === item.dept_id)?.dept_name || "N/A",
    status: item.status,
  }));
 const departmentSelectOptions = [
    { value: "", label: "All Departments" },
    ...(Array.isArray(departments) ? departments : []).map((d) => ({
      value: d.dept_id,
      label: d.dept_name,
    })),
  ];

  return (
    <div className=" w-full">
      {/* Tab Content */}
      <div>
        {activeTab === "allRequests" && (
          <>
            <div className="flex mb-4 gap-2">
              <div className="relative w-1/4">
                <input
                  type="text"
                  placeholder="Search"
                  className="border border-gray-300 w-full p-2 pl-10 rounded-xl"
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>

               <Select
                className="mr-4 w-1/6 mb-4"
                options={departmentSelectOptions}
                value={
                  departmentSelectOptions.find(
                    (opt) => opt.value === selectedDepartment
                  ) || departmentSelectOptions[0]
                }
                onChange={(opt) => setSelectedDepartment(opt.value)}
                isSearchable
                placeholder="All Departments"
              />
              <div className="flex-1 flex justify-end">
                <DownloadTableButtons
                  data={exportData}
                  columns={columns}
                  fileName="Approved Indents"
                />
              </div>
            </div>
            <div
              className="oveIndent-Approvaluto rounded-lg shadow bg-white p-4"
              style={{ maxHeight: 600, overflowY: "auto", minWidth: 900 }}
            >
              {/* <table className="w-full bg-white rounded-lg border-collapse"> */}
              <table className="w-full bg-white border-collapse">
                <thead className="border-b-2 border-black  top-0 bg-white z-10">
                  <tr className="p-4 ">
                    <th>S. No.</th>
                    <th className="p-2">User Id</th>
                    <th className="p-2">Department</th>
                   <th className="p-2">Indent Id</th>
                   <th className="p-2 text-center">Stage</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedApproval.map((item, index) => (
                    <tr key={index} className="odd:bg-blue-50 text-center">
                      <td className="p-2">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="p-2">{item.user_id}</td>
                      <td className="p-2">
                        {departments.find((b) => b.dept_id === item.dept_id)
                          ?.dept_name || "N/A"}
                      </td>
                    <td className="p-2">{item.indent_id}</td>
                    <td className="p-2">{item.stage || "N/A"}</td>
                      <td
                        className={` ${
                          item.status === "Pending"
                            ? "text-yellow-500 underline"
                            : item.status === "Approved"
                            ? "text-[#0FB900]"
                            : item.status === "Rejected"
                            ? "text-[#f33535]"
                            : item.status === "Resubmitted"
                            ? "text-[#2500b9] underline"
                            : ""
                        }`}
                        onClick={() =>
                          (item.status === "Pending" ||
                            item.status === "Resubmitted") &&
                          handleStatusClick(item)
                        }
                      >
                        {item.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          </>
        )}
      </div>
      {/* Popup */}
      {isPopupOpen && selectedItem && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[830px] max-w-full relative">
            <button
              className="absolute top-4 right-4 text-red-600 text-xl"
              onClick={closePopup}
            >
              ✖
            </button>

            <h2 className="text-xl font-bold text-left mb-1">
              #{selectedItem.user_id}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {departments.find((b) => b.dept_id === selectedItem.dept_id)
                ?.dept_name || "N/A"}
            </p>

            {/* Grid layout for form fields */}
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">Request for</label>
                <input
                  type="text"
                  className="border rounded-md w-full px-2 py-1"
                  value={selectedItem.request_for}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Category</label>
                <input
                  type="text"
                  className="border rounded-md w-full px-2 py-1"
                  value={selectedItem.category_name || "Category name"}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Request Material
                </label>
                <input
                  type="text"
                  className="border rounded-md w-full px-2 py-1"
                  value={selectedItem.asset_name}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Quantity</label>
                <input
                  type="text"
                  className="border rounded-md w-full px-2 py-1"
                  value={selectedItem.quantity}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium">UOM</label>
                <input
                  type="text"
                  className="border rounded-md w-full px-2 py-1"
                  value={selectedItem.uom}
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Budget</label>
                <input
                  type="text"
                  className="border rounded-md w-full px-2 py-1"
                  value={
                    budgetOptions.find((b) => b.id === selectedItem.budget_id)
                      ?.budget_name || "N/A"
                  }
                  readOnly
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                className="border rounded-md w-full px-2 py-2"
                rows="4"
                value={selectedItem.remarks}
                readOnly
              />
            </div>

            {/* Action buttons selectedItem */}
            {/* Action buttons */}
            {selectedItem.status === "Pending" ? (
              <div className="flex justify-between">
                <div className="flex justify-between">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-md"
                    onClick={() => handleStatusUpdate("Resubmitted")}
                  >
                    Resubmit
                  </button>
                </div>
                <div className="flex space-x-4">
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md"
                    onClick={() => handleStatusUpdate("Rejected")}
                  >
                    Reject
                  </button>
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                    onClick={() => handleStatusUpdate("Approved")}
                  >
                    Approve
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IndentApprovals;
