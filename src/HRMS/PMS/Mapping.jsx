import axios from "axios";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Calendar } from "react-feather";
import excelImage from "../../assests/excel.png";
import folderImage from "../../assests/folder.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Select from "react-select";
import DatePicker from "react-datepicker";
import { components } from "react-select";

const MappingComponent = () => {
  const [goals, setGoals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [kras, setKras] = useState([]);
  const [mappings, setMappings] = useState([]);

  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedKra, setSelectedKra] = useState("");

  const [search, setSearch] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [editYear, setEditYear] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filterYear, setFilterYear] = useState(null);

  const itemsPerPage = 25;
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateMappingModal, setShowCreateMappingModal] = useState(false);

  const [modalGoal, setModalGoal] = useState(null);
  const [modalYear, setModalYear] = useState(null);
  const [modalKra, setModalKra] = useState(null);

  // useEffect(() => {
  //     axios.get("https://devdemo.softtrails.net/pms/goals").then(res => setGoals(res.data));
  //     axios.get("https://devdemo.softtrails.net/departments").then(res => setDepartments(res.data));
  //     axios.get("https://devdemo.softtrails.net/pms/kra").then(res => setKras(res.data));
  //     fetchMappings();
  // }, []);

  // const fetchMappings = () => {
  //     axios.get("https://devdemo.softtrails.net/pms/goal-kra-dept-mapping")
  //         .then(res => setMappings(res.data))
  //         .catch(err => console.error("Failed to fetch mappings", err));
  // };

  // const handleSubmit = () => {
  //     if (!selectedGoal || !selectedDept || !selectedKra) {
  //         return Swal.fire({
  //             icon: "warning",
  //             title: "Missing Fields",
  //             text: "All fields are required.",
  //         });
  //     }
  //     const token = sessionStorage.getItem("token");
  //     const headers = {
  //         Authorization: `Bearer ${token}`,
  //     };
  //     axios.post(
  //         "https://devdemo.softtrails.net/pms/goal-kra-dept-mapping",
  //         {
  //             goal_id: parseInt(selectedGoal),
  //             department_id: parseInt(selectedDept),
  //             kra_id: parseInt(selectedKra),
  //         },
  //         { headers }
  //     )
  //         .then(() => {
  //             Swal.fire({
  //                 icon: "success",
  //                 title: "Mapping Added",
  //                 text: "The mapping was added successfully.",
  //             });
  //             fetchMappings();
  //             setSelectedGoal("");
  //             setSelectedDept("");
  //             setSelectedKra("");
  //         })
  //         .catch((error) => {
  //             Swal.fire({
  //                 icon: "error",
  //                 title: "Error",
  //                 text: error?.response?.data?.message || "Something went wrong!",
  //             });
  //         });
  // };
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get("https://devdemo.softtrails.net/pms/goals", { headers })
      .then((res) => setGoals(res.data))
      .catch((err) => console.error("Failed to fetch goals", err));

    axios
      .get("https://devdemo.softtrails.net/departments", { headers })
      .then((res) => setDepartments(res.data))
      .catch((err) => console.error("Failed to fetch departments", err));

    axios
      .get("https://devdemo.softtrails.net/pms/kra", { headers })
      .then((res) => setKras(res.data))
      .catch((err) => console.error("Failed to fetch kras", err));

    fetchMappings();
  }, []);

  const fetchMappings = () => {
    const token = sessionStorage.getItem("token");

    axios
      .get("https://devdemo.softtrails.net/pms/goal-kra-year-mapping", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // Your API returns { count, data }
        const data = Array.isArray(res.data.data) ? res.data.data : [];
        setMappings(data);
      })
      .catch((err) => console.error("Failed to fetch mappings", err));
  };

  const handleSubmit = () => {
    if (!selectedGoal || !selectedYear || !selectedKra) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "All fields are required.",
      });
    }

    const token = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .post(
        "https://devdemo.softtrails.net/pms/goal-kra-mapping",
        {
          goal_id: parseInt(selectedGoal),
          // department_id: parseInt(selectedDept),
          kra_id: parseInt(selectedKra),
          year: selectedYear.getFullYear(),
        },
        { headers }
      )
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Mapping Added",
          text: "The mapping was added successfully.",
        });
        fetchMappings();
        setSelectedGoal("");
        setSelectedDept("");
        setSelectedKra("");
        setSelectedYear("");
      })
      .catch((error) => {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.message || "Something went wrong!",
        });
      });
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setModalOpen(true);
  };

  const handleDelete = () => {
    setLoading(true);
    // Simulate delete — you'd replace with actual delete API when available
    setTimeout(() => {
      setMappings((prev) => prev.filter((m) => m.id !== deleteId));
      setModalOpen(false);
      setLoading(false);
    }, 800);
  };

  const filtered = mappings.filter((m) => {
    const matchSearch =
      m.goal_name.toLowerCase().includes(search.toLowerCase()) ||
      m.kra_name.toLowerCase().includes(search.toLowerCase());
    const matchDept = filterDept ? m.department_name === filterDept : true;
    const createdAt = new Date(m.created_at);
    const matchFrom = fromDate ? new Date(fromDate) <= createdAt : true;
    const matchTo = toDate ? new Date(toDate) >= createdAt : true;
    return matchSearch && matchDept && matchFrom && matchTo;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  ///////////////////////////// EDIT ////////////////////////
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [editGoalId, setEditGoalId] = useState("");
  const [editDeptId, setEditDeptId] = useState("");
  const [editKraId, setEditKraId] = useState("");

  // ------------------------ EXPORT TO EXCEL ------------------------
  const handleExportToExcel = () => {
    if (!filtered.length) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There is no data to export.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    // Prepare export data
    const exportData = filtered.map((item, index) => ({
      "S.No": index + 1,
      Goals: item.goal_name,
      Department: item.department_name,
      "KRA's": item.kra_name,
      Date: new Date(item.created_at).toLocaleDateString("en-GB"),
    }));

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Mappings");

    // Convert workbook to Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    // Trigger file download
    saveAs(
      blob,
      `Mapping_Report_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // ------------------------ EXPORT TO PDF ------------------------
  const handleExportToPDF = () => {
    if (!filtered.length) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There is no data to export.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text("Goal-KRA-Department Mapping Report", 14, 15);

    // Define table columns
    const tableColumn = ["S.No", "Goal", "Department", "KRA", "Year"];
    const tableRows = filtered.map((item, index) => [
      index + 1,
      item.goal_name,
      item.department_name,
      item.kra_name,
      item.year,
    ]);

    // Create table
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    // Footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(10);
    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      14,
      pageHeight - 10
    );

    // Save file
    doc.save(`Mapping_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };
  const kraOptions = kras
    .filter((k) => k.goal_id === parseInt(selectedGoal))
    .map((k) => ({
      value: k.id,
      label: k.kra_name,
    }));

  const deptOptions = departments.map((d) => ({
    value: d.dept_name,
    label: d.dept_name,
  }));
  const GoalOption = (props) => {
    const { innerProps, innerRef, data } = props;
    return (
      <div
        ref={innerRef}
        {...innerProps}
        className="p-2 hover:bg-blue-100 cursor-pointer"
      >
        <div className="font-medium text-gray-900">{data.label}</div>
        <div className="text-xs text-gray-500">{data.department}</div>
      </div>
    );
  };
  const GoalSingleValue = ({ data, ...props }) => {
    return (
      <components.SingleValue {...props}>
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{data.label}</span>
          <span className="text-xs text-gray-500">{data.department}</span>
        </div>
      </components.SingleValue>
    );
  };

  return (
    <div>
      {/* Form */}

      <div className="flex justify-start mb-4 border-3">
        <button
          onClick={() => setShowCreateMappingModal(true)}
          className="bg-[#005AE6] text-white px-6 py-2 rounded-lg hover:bg-[#004bb5] transition"
        >
          Create Mapping
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 mt-4">
        <input
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-md px-4 py-2 w-[250px] h-10 mt-[7px] "
        />
        <Select
          options={deptOptions}
          value={deptOptions.find((opt) => opt.value === filterDept) || null}
          onChange={(selected) => setFilterDept(selected ? selected.value : "")}
          placeholder="Select Department"
          isClearable
          isSearchable
          className="w-[200px] text-sm mt-2"
        />
        <div className="flex items-center border border-gray-300 rounded-md px-3 h-10 bg-white shadow-sm text-gray-700 mt-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2 h-8 text-sm outline-none border-none bg-transparent no-calendar"
          />

          <span className="mx-2 text-sm font-medium text-black-500">TO</span>

          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2 h-8 text-sm outline-none border-none bg-transparent no-calendar"
          />

          <Calendar size={18} className="ml-2 text-gray-500" />
        </div>

        <span className="flex md:ml-60 gap-5 mt-5">
          <img
            src={excelImage}
            className="w-[24px] h-[24px] ml-10 hover:cursor-pointer hover:scale-110 hover:opacity-120"
            onClick={handleExportToExcel}
          ></img>
          <img
            src={folderImage}
            onClick={handleExportToPDF}
            className="w-[24px] h-[24px] hover:cursor-pointer hover:scale-110 hover:opacity-120"
          ></img>
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[70vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead
              className="text-[14px] font-medium bg-white sticky top-0"
              style={{ boxShadow: "0 2px 0 black" }}
            >
              <tr>
                <th className="p-5 text-left text-black">S.No</th>
                <th className="p-5 text-left text-black">Goals</th>
                <th className="p-3 text-left text-black ">
                  {" "}
                  Recommended Department
                </th>
                <th className="p-3 text-left text-black">KRA's</th>
                <th className="p-5 text-left text-black">Year</th>
                <th className="p-5 text-left text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="7" className="h-2 bg-white"></td>
              </tr>
              {currentItems.map((item, index) => {
                return (
                  <tr
                    key={item.id || index}
                    className={`${
                      (index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"
                    }`}
                  >
                    <td className="px-5 py-2 text-left text-[14px] text-black">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-5 py-2 text-left text-[14px] text-black">
                      {item.goal_name}
                    </td>
                    <td className="px-10 py-2 text-left text-[14px] text-black">
                      {departments.find(
                        (d) =>
                          d.dept_id ===
                          goals.find((g) => g.id === item.goal_id)
                            ?.department_id
                      )?.dept_name || "-"}
                    </td>

                    <td className="px-2 py-2 text-left text-[14px] text-black">
                      {item.kra_name}
                    </td>
                    <td className="px-5 py-2 text-left text-[14px] text-black">
                      {" "}
                      {item.year}
                    </td>
                    <td className="px-5 py-2 text-left flex gap-2">
                      <button
                        onClick={() => {
                          setEditingMapping(item);
                          setEditGoalId(item.goal_id);
                          setEditYear(new Date(item.year, 0));
                          // setEditKraId(item.kra_id);
                          setEditKraId(parseInt(item.kra_id));
                          setEditModalOpen(true);
                        }}
                        className="text-blue-700"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button
                        onClick={() => confirmDelete(item.id)}
                        className="text-red-600"
                      >
                        {" "}
                        <FontAwesomeIcon icon={faTrash} />{" "}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>

            <span className="px-3 py-1 bg-blue-600 text-white rounded">
              {currentPage}
            </span>
            <span>of</span>
            <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
              {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
      {showCreateMappingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg w-[520px] p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Create Goal–KRA Mapping</h2>
              <button
                onClick={() => setShowCreateMappingModal(false)}
                className="text-xl text-gray-500"
              >
                ×
              </button>
            </div>

            {/* Goal */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Goal <span className="text-red-500">*</span>
              </label>
              <Select
                options={goals.map((g) => ({
                  value: g.id,
                  label: g.goal,
                  department: g.dept_name,
                }))}
                value={modalGoal}
                onChange={(val) => {
                  setModalGoal(val);
                  setModalKra(null);
                }}
                placeholder="Select Goal"
                isClearable
                components={{
                  Option: GoalOption,
                  SingleValue: GoalSingleValue,
                }}
              />
            </div>

            {/* Year */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-1 block">
                Year <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center border rounded px-3 py-2">
                <DatePicker
                  selected={modalYear}
                  onChange={(year) => setModalYear(year)}
                  showYearPicker
                  dateFormat="yyyy"
                  placeholderText="Select Year"
                  className="text-sm bg-transparent"
                />
                <Calendar size={16} className="ml-auto text-gray-500" />
              </div>
            </div>

            {/* KRA */}
            <div className="mb-6">
              <label className="text-sm font-medium mb-1 block">
                KRA <span className="text-red-500">*</span>
              </label>
              <Select
                options={kras
                  .filter((k) => k.goal_id === modalGoal?.value)
                  .map((k) => ({
                    value: k.id,
                    label: k.kra_name,
                  }))}
                value={modalKra}
                onChange={(val) => setModalKra(val)}
                placeholder="Select KRA"
                isClearable
              />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateMappingModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!modalGoal || !modalYear || !modalKra) {
                    Swal.fire(
                      "Validation Error",
                      "All fields are required",
                      "warning"
                    );
                    return;
                  }

                  try {
                    const token = sessionStorage.getItem("token");

                    await axios.post(
                      "https://devdemo.softtrails.net/pms/goal-kra-mapping",
                      {
                        goal_id: modalGoal.value,
                        kra_id: modalKra.value,
                        year: modalYear.getFullYear(),
                      },
                      {
                        headers: { Authorization: `Bearer ${token}` },
                      }
                    );

                    Swal.fire(
                      "Success",
                      "Mapping created successfully",
                      "success"
                    );
                    fetchMappings();

                    setModalGoal(null);
                    setModalYear(null);
                    setModalKra(null);
                    setShowCreateMappingModal(false);
                  } catch (err) {
                    Swal.fire("Error", "Failed to create mapping", "error");
                  }
                }}
                className="bg-blue-600 text-white px-5 py-2 rounded"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-[90%] max-w-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Update Goal Mapping</h2>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Goal</label>
              <select
                value={editGoalId}
                onChange={(e) => {
                  setEditGoalId(e.target.value);
                  setEditDeptId(""); // reset department when goal changes
                  setEditKraId(""); // reset KRA when goal changes
                }}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select Goal</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.goal}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">Year</label>

              <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white">
                <DatePicker
                  selected={editYear}
                  onChange={(year) => setEditYear(year)}
                  showYearPicker
                  dateFormat="yyyy"
                  placeholderText="Select Year"
                  className="text-sm bg-transparent"
                />
                <Calendar size={16} className="ml-auto text-gray-500" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">KRA's</label>
              <select
                value={editKraId}
                onChange={(e) => setEditKraId(parseInt(e.target.value))}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="">Select KRA</option>
                {kras
                  .filter((k) => k.goal_id === parseInt(editGoalId))
                  .map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.kra_name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    const token = sessionStorage.getItem("token");
                    await axios.put(
                      `https://devdemo.softtrails.net/pms/goal-kra-year-mapping/update`,
                      {
                        goal_id: parseInt(editGoalId),
                        year: editYear.getFullYear(),

                        kra_id: parseInt(editKraId),
                      },
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    Swal.fire(
                      "Updated",
                      "Mapping updated successfully",
                      "success"
                    );
                    fetchMappings();
                    setEditModalOpen(false);
                  } catch (err) {
                    console.error(err);
                    const errorMessage =
                      err?.response?.data?.message ||
                      "Failed to update mapping";
                    Swal.fire("Error", errorMessage, "error");
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onConfirm={handleDelete}
        loading={loading}
        message="Are you sure you want to delete this mapping?"
      />
    </div>
  );
};
export default MappingComponent;
