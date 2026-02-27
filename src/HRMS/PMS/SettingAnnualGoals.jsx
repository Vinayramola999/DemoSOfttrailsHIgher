import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Calendar } from "react-feather";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import excelImage from "../../assests/excel.png";
import folderImage from "../../assests/folder.png";
import DatePicker from "react-datepicker";
import { useRef } from "react";
import "jspdf-autotable";
import EditModal from "../../NewComponents/EditModal";
import ViewGoalModal from "../../NewComponents/ViewGoalModal";
import Tooltip from "../../NewComponents/SeeDetailsHover";
import { components } from "react-select";

import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import Dropdown from "react-bootstrap/Dropdown";

import "react-datepicker/dist/react-datepicker.css";

function SettingAnnualGoals() {
  const datepickerRef = useRef(null);
  const [date, setdate] = useState("");
  const [verticals, setVerticals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [goals, setGoals] = useState([]);
  const [kras, setKras] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [filterKra, setFilterKra] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterYear, setFilterYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [workflowDepts, setWorkflowDepts] = useState([]);
  const [showAnnualGoalModal, setShowAnnualGoalModal] = useState(false);


  const [formData, setFormData] = useState({
    goal_id: "",
    kra_mapping_id: "",
    date: "",
    weight: "",
    description: "",
    dept_id: "",
    sub_id: "",
    remark: "",
  });

  const [editData, setEditData] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // State for selected KRA and filtered options
  const [selectedKra, setSelectedKra] = useState("");
  const [kraOptions, setKraOptions] = useState([]);
  const [showCreateGoalSetModal, setShowCreateGoalSetModal] = useState(false);

const [goalSetForm, setGoalSetForm] = useState({
  name: "",
  year: "",
  dept_id: "",
  sub_id: "",
  description: "",
});


  // Ref and handler for year picker in form
  const yearPickerRef = useRef(null);
  const handleFormYearIconClick = () => {
    if (yearPickerRef.current) {
      yearPickerRef.current.setOpen(true);
    }
  };

  // when goal is selected, filter KRAs linked to that goal
  useEffect(() => {
    if (formData.goal_id) {
      const filteredKras = kras
        .filter((k) => k.goal_id === parseInt(formData.goal_id))
        .map((k) => ({
          value: k.id,
          label: k.kra_name,
        }));
      setKraOptions(filteredKras);
    } else {
      setKraOptions([]); // clear when no goal selected
    }
  }, [formData.goal_id, kras]);

  useEffect(() => {
    fetchGoals();
    fetchKras();
    fetchDepartments();
    fetchMappings(); // Fetch departments here
    fetchWorkflowDepartments();
  }, []);

  // add state
  const [verticalsMap, setVerticalsMap] = useState({});

  // helper to fetch all verticals for a list of deptIds and build map sub_id -> name
  const fetchAllVerticalsForDeptIds = async (deptIds = []) => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const requests = deptIds.map((deptId) =>
        axios
          .get(`https://devdemo.softtrails.net/sub_dept/get/${deptId}`, { headers })
          .then((res) => res.data)
          .catch(() => [])
      );

      const results = await Promise.all(requests); // array of arrays

      const map = {};
      results.forEach((arr) => {
        arr.forEach((v) => {
          map[v.sub_id] = v.sub_dept_name;
        });
      });
      setVerticalsMap(map);
      // optional: console.log("verticalsMap", map);
    } catch (err) {
      // console.error("Failed to fetch all verticals", err);
    }
  };

  // handler for year picker icon
  const handleIconClick = () => {
    if (datepickerRef.current) {
      datepickerRef.current.setOpen(true);
    }
  };
  // fetch goals
  const fetchGoals = async () => {
    try {
      const res = await axios.get("https://devdemo.softtrails.net/pms/goals");
      setGoals(res.data);
      //   console.log("Goals data:", res.data);
    } catch (error) {
      console.error("Error fetching goals:", error);
    }
  };

  const fetchKras = async () => {
    try {
      const res = await axios.get("https://devdemo.softtrails.net/pms/kra");
      setKras(res.data);
    } catch (error) {
      console.error("Error fetching KRAs:", error);
    }
  };

  //  Fetch departments
  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const fetchDepartments = async () => {
    try {
      const res = await axios.get("https://devdemo.softtrails.net/departments", {
        headers,
      });
      setDepartments(res.data);
      console.log("Departments data:", res.data);
    } catch (error) {
      console.error("Failed to fetch departments", error);
    }
  };
  // const deptOptions = departments.map((d) => ({
  //   value: d.dept_id,
  //   label: d.dept_name,
  // }));
  const fetchWorkflowDepartments = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        "https://devdemo.softtrails.net/pms/workflows/department",
        { headers }
      );

      setWorkflowDepts(res.data.workflows || []);
    } catch (err) {
      console.error("Failed to fetch workflow departments", err);
    }
  };
  const workflowDeptIds = workflowDepts.map((w) => Number(w.dept_id));

  const filteredDepartments = departments.filter((d) =>
    workflowDeptIds.includes(Number(d.dept_id))
  );

  const deptOptions = filteredDepartments.map((d) => ({
    value: d.dept_id,
    label: d.dept_name,
  }));

  // feth verticals
  const fetchVerticals = async (deptId) => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const res = await axios.get(
        `https://devdemo.softtrails.net/sub_dept/get/${deptId}`,
        { headers }
      );

      setVerticals(res.data);

      //  console.log("Vertical data:", res.data);
    } catch (error) {
      console.error("Failed to fetch verticals", error);
    }
  };

  const fetchMappings = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(
        "https://devdemo.softtrails.net/pms/goal-kra-weight",
        {
          headers,
        }
      );
      setMappings(Array.isArray(res.data.data) ? res.data.data : []);

      // build unique dept ids from returned mappings
      const deptIds = Array.from(
        new Set(
          (Array.isArray(res.data) ? res.data : [])
            .map((m) => m.dept_id)
            .filter(Boolean)
        )
      );
      if (deptIds.length) fetchAllVerticalsForDeptIds(deptIds);
    } catch (error) {
      console.error("Error fetching mappings:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);

    // basic validation
    if (
      !formData.goal_id ||
      !formData.kra_mapping_id ||
      !formData.date ||
      !formData.weight ||
      !formData.dept_id ||
      !formData.sub_id ||
      !formData.description ||
      !formData.remark
    ) {
      return Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
    }

    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const payload = {
        goal_id: parseInt(formData.goal_id),
        kra_mapping_id: parseInt(formData.kra_mapping_id),
        year: formData.date,
        weight: parseFloat(formData.weight),
        dept_id: parseInt(formData.dept_id),
        sub_id: parseInt(formData.sub_id),
        description: formData.description,
        remark: formData.remark,
      };

      const res = await axios.post(
        `https://devdemo.softtrails.net/pms/goal-kra-weight`,
        payload,
        { headers }
      );

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Annual Goal added successfully!",
        confirmButtonText: "OK",
        confirmButtonColor: "#6366F1",
      });
      setFormData({
        goal_id: "",
        kra_mapping_id: "",
        date: "",
        weight: "",
        description: "",
        dept_id: "",
        sub_id: "",
        remark: "",
        status: "",
      });
      setSelectedGoal(null);

      setSelectedKra("");
      // refresh table
      fetchMappings();
    } catch (error) {
      console.log("BACKEND ERROR:", error.response?.data);

      console.error("Error submitting data:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to submit",
        "error"
      );
    }
  };

  const exportToExcel = () => {
    const exportData = mappings.map((m, index) => {
      const goal = goals.find((g) => g.id === m.goal_id);
      const department = departments.find((d) => d.dept_id === m.dept_id);
      const kra = kras.find((k) => k.id === m.kra_mapping_id);

      return {
        "S.No": index + 1,
        ID: m.goal_kra_weight_id || "-",
        Goal: goal?.goal || "-",
        Department: department?.dept_name || "-",
        KRA: kra?.kra_name || "-",
        Year: m.year || "-",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "AnnualGoals");
    XLSX.writeFile(workbook, "AnnualGoals.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Annual Goals", 14, 15);

    const tableColumn = ["S.No", "ID", "Goal", "Department", "KRA", "Year"];
    const tableRows = mappings.map((m, index) => {
      const goal = goals.find((g) => g.id === m.goal_id);
      const department = departments.find((d) => d.dept_id === m.dept_id);
      const kra = kras.find((k) => k.id === m.kra_mapping_id);

      return [
        index + 1,
        m.goal_kra_weight_id || "-",
        goal?.goal || "-",
        department?.dept_name || "-",
        kra?.kra_name || "-",
        m.year,
      ];
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: {
        fontSize: 10,
        cellPadding: 3,
        halign: "left",
        valign: "middle",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      margin: { top: 20 },
    });

    doc.save("AnnualGoals.pdf");
  };

  const filteredData = mappings.filter((m) => {
    const goal = goals.find((g) => g.id === m.goal_id);
    const kra = kras.find((k) => k.id === m.kra_mapping_id);

    const goalName = goal?.goal?.toLowerCase() || "";
    const kraName = kra?.kra_name?.toLowerCase() || "";

    const matchesKra = filterKra ? kraName === filterKra.toLowerCase() : true;

    const matchesSearch = filterSearch
      ? goalName.includes(filterSearch.toLowerCase()) ||
        kraName.includes(filterSearch.toLowerCase())
      : true;

    // ✅ Year filter (based on DatePicker value)
    const selectedYear = filterYear ? filterYear.getFullYear() : null;
    const matchesYear = selectedYear ? m.year === selectedYear : true;

    return matchesKra && matchesSearch && matchesYear;
  });
  const handleDelete = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      await axios.delete(
        `https://devdemo.softtrails.net/pms/goal-kra-weight/${deleteId}`,
        { headers }
      );

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Record deleted successfully.",
        timer: 1500,
        showConfirmButton: false,
      });

      setShowDeleteModal(false);
      setDeleteId(null);
      fetchMappings(); // refresh your table
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to delete record.",
      });
    } finally {
      setLoading(false);
    }
  };

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
  const goalOptions = goals.map((g) => ({
    value: g.id,
    label: g.goal,
    department: g.dept_name,
  }));

  const handleGoalClick = (goal) => {
    // console.log("Clicked goal ID:", goal);
    setSelectedGoal(goal);
    setIsGoalModalOpen(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="">
      <div className="flex justify-start mb-4 border-3">
        <button
  onClick={() => setShowCreateGoalSetModal(true)}
  className="bg-[#005AE6] text-white px-6 py-2 rounded-lg hover:bg-[#004bb5] transition"
>
  Create Goal Set
</button>


     <button
  onClick={() => setShowAnnualGoalModal(true)}
  className="bg-[#005AE6] text-white px-6 py-2 rounded-lg hover:bg-[#004bb5] transition ml-2"
>
  Create Goals
</button>
  </div>



      

      {/* Filters */}
      <div className="flex flex-wrap gap-4  mb-4 mt-6 z-20">
        {/* 🔍 Search Input */}
        <input
          type="text"
          placeholder="Search"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          className="border rounded-md px-4 py-2 w-[250px] h-10 mt-[7px]"
        />

        {/* 🧭 KRA Filter */}
        <Select
          options={kras.map((k) => ({
            value: k.kra_name,
            label: k.kra_name,
          }))}
          onChange={(selected) => setFilterKra(selected?.value || "")}
          placeholder="KRA"
          isClearable
          isSearchable
          className="w-[200px] text-sm mt-2 z-40"
        />

        {/* 📅 Year Picker */}
        <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 w-fit md:h-10 md:mt-2 bg-white shadow-sm text-gray-700 z-40">
          <DatePicker
            selected={filterYear}
            onChange={(date) => setFilterYear(date)}
            showYearPicker
            dateFormat="yyyy"
            placeholderText="Select Year"
            className=" text-sm bg-transparent "
          />

          <Calendar
            size={16}
            className="ml-5 text-gray-500 cursor-pointer z-40"
            onClick={handleIconClick}
          />
        </div>

        {/*  Export Icons */}
        <span className="flex md:ml-80 gap-5 mt-5">
          <img
            src={excelImage}
            className="w-[24px] h-[24px] ml-12 hover:cursor-pointer hover:scale-110 hover:opacity-120"
            onClick={exportToExcel}
          />
          <img
            src={folderImage}
            onClick={exportToPDF}
            className="w-[24px] h-[24px] hover:cursor-pointer hover:scale-110 hover:opacity-120"
          />
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[50vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead
              className="text-[14px] font-medium bg-white sticky top-0 z-10"
              style={{ boxShadow: "0 2px 0 black" }}
            >
              <tr>
                <th className="p-5 text-left text-black">S.No</th>
                <th className="p-5 text-left text-black">ID</th>
                <th className="p-5 text-left text-black z-10">Goal</th>
                {/* <th className="p-5 text-left text-black">Department</th> */}
                <th className="p-5 text-left text-black">KRA</th>
                <th className="p-5 text-left text-black">Year</th>
                <th className="p-5 text-left text-black">Status</th>
                <th className="p-5 text-left text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="7" className="h-2 bg-white"></td>
              </tr>

              {currentData.map((m, i) => {
                const goal = goals.find((g) => g.id === m.goal_id);
                const department = departments.find(
                  (d) => d.dept_id === m.dept_id
                );
                const kra = kras.find((k) => k.id === m.kra_mapping_id);

                return (
                  <tr
                    key={m.goal_kra_weight_id || i}
                    className={`${
                      (i + 1) % 2 === 0 ? "bg-white" : "bg-tableblue mt-2"
                    }`}
                  >
                    {/* S.No */}
                    <td className="px-5 py-2 text-left text-[14px] text-black">
                      {i + 1}
                    </td>

                    {/* ID */}
                    <td className="px-5 py-2 text-left text-[14px] text-black">
                      {m.goal_kra_weight_id || "-"}
                    </td>

                    {/* Goal */}
                    {/* <td className="px-5 py-4 text-left text-[14px] text-black">
                      {goal?.goal || "-"}
                    </td> */}
                    <td
                      className="px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                      onClick={() => {
                        const verticalName = verticalsMap[m.sub_id] || "-";
                        handleGoalClick({
                          ...m,
                          kra: kra?.kra_name,
                          goal: goal?.goal,
                          department: department?.dept_name,
                          vertical: verticalName,
                        });
                      }}
                    >
                      <Tooltip text="Click to view Annual Goal Details">
                        {m.goal || "-"}
                      </Tooltip>
                    </td>
                    {/* Department */}
                    {/* <td className="px-5 py-4 text-left text-[14px] text-black">
                      {department?.dept_name || "-"}
                    </td> */}

                    {/* KRA */}
                    <td className="px-5 py-2 text-left text-[14px] text-black">
                      {m.kra_name || "-"}
                    </td>

                    {/* Date */}

                    <td>{m.year || "-"}</td>

                    {/* Status */}
                    <td className="p-2">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold ${
                          m.status === "approved"
                            ? " text-green-500"
                            : m.status === "rejected"
                            ? " text-red-500"
                            : " text-yellow-400"
                        }`}
                      >
                        {m.status
                          ? m.status.charAt(0).toUpperCase() + m.status.slice(1)
                          : "Pending"}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-2 text-left text-[14px] text-black">
                      <button
                        onClick={() => {
                          setEditData(m);
                          setEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>

                      <button
                        onClick={() => {
                          setDeleteId(m.goal_kra_weight_id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800 md:ml-2"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {showCreateGoalSetModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg w-full max-w-[520px] max-h-[85vh] p-6 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Create Goal Set</h2>
        <button
          onClick={() => setShowCreateGoalSetModal(false)}
          className="text-xl text-gray-500"
        >
          ×
        </button>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();

          if (
            !goalSetForm.name ||
            !goalSetForm.year ||
            !goalSetForm.dept_id ||
            !goalSetForm.sub_id ||
            !goalSetForm.description
          ) {
            Swal.fire("Validation Error", "All fields are required", "warning");
            return;
          }

          // 🔵 API call will go here later
          console.log("Goal Set Payload:", goalSetForm);

          Swal.fire("Success", "Goal Set created successfully", "success");
          setShowCreateGoalSetModal(false);
        }}
        className="space-y-4"
      >
        {/* Goal Set Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Enter Goal Set Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={goalSetForm.name}
            onChange={(e) =>
              setGoalSetForm({ ...goalSetForm, name: e.target.value })
            }
            className="w-full border px-3 py-2 rounded"
            placeholder="Goal Set Name"
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Year <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center border rounded px-3 py-2">
            <DatePicker
              selected={goalSetForm.year ? new Date(goalSetForm.year, 0) : null}
              onChange={(year) =>
                setGoalSetForm({
                  ...goalSetForm,
                  year: year ? year.getFullYear().toString() : "",
                })
              }
              showYearPicker
              dateFormat="yyyy"
              placeholderText="Select Year"
              className="bg-transparent text-sm w-full"
            />
            <Calendar size={16} className="ml-2 text-gray-500" />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Department <span className="text-red-500">*</span>
          </label>
          <Select
            options={deptOptions}
            value={
              deptOptions.find((d) => d.value === goalSetForm.dept_id) || null
            }
            onChange={(selected) => {
              const deptId = selected ? selected.value : "";
              setGoalSetForm({
                ...goalSetForm,
                dept_id: deptId,
                sub_id: "",
              });
              if (deptId) fetchVerticals(deptId);
            }}
            placeholder="Select Department"
            isClearable
            isSearchable
          />
        </div>

        {/* Vertical */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Vertical <span className="text-red-500">*</span>
          </label>
          <Select
            options={verticals.map((v) => ({
              value: v.sub_id,
              label: v.sub_dept_name,
            }))}
            value={
              verticals
                .map((v) => ({
                  value: v.sub_id,
                  label: v.sub_dept_name,
                }))
                .find((opt) => opt.value === goalSetForm.sub_id) || null
            }
            onChange={(selected) =>
              setGoalSetForm({
                ...goalSetForm,
                sub_id: selected ? selected.value : "",
              })
            }
            placeholder="Select Vertical"
            isClearable
            isSearchable
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            value={goalSetForm.description}
            onChange={(e) =>
              setGoalSetForm({
                ...goalSetForm,
                description: e.target.value,
              })
            }
            className="w-full border px-3 py-2 rounded"
            placeholder="Description"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowCreateGoalSetModal(false)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  </div>
)}
      
        {showAnnualGoalModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg  w-full  max-w-[520px] max-h-[85vh] p-6  overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 ">
        <h2 className="text-lg font-semibold">Create Annual Goal</h2>
        <button
          onClick={() => setShowAnnualGoalModal(false)}
          className="text-xl text-gray-500"
        >
          ×
        </button>
      </div>

      {/* FORM (unchanged logic) */}
     <form
  onSubmit={(e) => {
    handleSubmit(e);
    setShowAnnualGoalModal(false);
  }}
  className="space-y-4"
>
  {/* Goal */}
   <div  className="">
    <label className="block text-sm font-medium mb-1">
      Select Goal Set<span className="text-red-500">*</span>
    </label>
    <Select
      
      placeholder="Select Goal Set"
      isClearable
      isSearchable
      components={{ Option: GoalOption, SingleValue: GoalSingleValue }}
    />
  </div>
  <div  className="">
    <label className="block text-sm font-medium mb-1">
      Select Goal <span className="text-red-500">*</span>
    </label>
    <Select
      options={goalOptions}
      value={
        selectedGoal
          ? goalOptions.find((g) => g.value === selectedGoal)
          : null
      }
      onChange={(selected) => {
        const goalId = selected ? selected.value : "";
        setSelectedGoal(goalId);
        setFormData({ ...formData, goal_id: goalId });
      }}
      placeholder="Select Goal"
      isClearable
      isSearchable
      components={{ Option: GoalOption, SingleValue: GoalSingleValue }}
    />
  </div>

  {/* KRA */}
  <div>
    <label className="block text-sm font-medium mb-1">
      Select KRA <span className="text-red-500">*</span>
    </label>
    <Select
      options={kraOptions}
      value={kraOptions.find((k) => k.value === selectedKra) || null}
      onChange={(selected) => {
        const val = selected ? selected.value : "";
        setSelectedKra(val);
        setFormData({ ...formData, kra_mapping_id: val });
      }}
      placeholder="Select KRA"
      isClearable
      isSearchable
    />
  </div>

  {/* Year */}
  <div>
    <label className="block text-sm font-medium mb-1">
      Select Year <span className="text-red-500">*</span>
    </label>
    <div className="flex items-center border rounded px-3 py-2">
      <DatePicker
        ref={yearPickerRef}
        selected={formData.date ? new Date(formData.date, 0) : null}
        onChange={(year) =>
          setFormData({
            ...formData,
            date: year ? year.getFullYear().toString() : "",
          })
        }
        showYearPicker
        dateFormat="yyyy"
        placeholderText="Select Year"
        className="bg-transparent text-sm w-full"
      />
      <Calendar
        size={16}
        className="ml-2 text-gray-500 cursor-pointer"
        onClick={handleFormYearIconClick}
      />
    </div>
  </div>

  {/* Weight */}
  <div>
    <label className="block text-sm font-medium mb-1">
      Weight <span className="text-red-500">*</span>
    </label>
    <input
      type="number"
      min="1"
      max="100"
      value={formData.weight}
      onChange={(e) =>
        setFormData({ ...formData, weight: e.target.value })
      }
      className="w-full border px-3 py-2 rounded"
      placeholder="Enter weight (1–100)"
    />
  </div>

  {/* Department */}
 
  {/* Vertical */}
 

  {/* Remark */}
  <div>
    <label className="block text-sm font-medium mb-1">Remark</label>
    <input
      type="text"
      value={formData.remark}
      onChange={(e) =>
        setFormData({ ...formData, remark: e.target.value })
      }
      className="w-full border px-3 py-2 rounded"
      placeholder="Remark"
    />
  </div>

  {/* Description */}
  
  {/* Footer */}
  <div className="flex justify-end gap-3 pt-2">
    <button
      type="button"
      onClick={() => setShowAnnualGoalModal(false)}
      className="px-4 py-2 border rounded"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
    >
      Submit
    </button>
  </div>
</form>

    </div>
  </div>
)}





        <EditModal
          open={editModalOpen}
          data={editData}
          onClose={() => setEditModalOpen(false)}
          onSave={async (updatedData) => {
            try {
              setLoading(true);

              const payload = {
                goal_id: Number(updatedData.goal_id),
                kra_mapping_id: Number(updatedData.kra_mapping_id),
                dept_id: Number(updatedData.dept_id),
                sub_id: Number(updatedData.sub_id),
                year: updatedData.year,
                weight: updatedData.weight,
                description: updatedData.description,
                remark: updatedData.remark,
              };

              //  console.log("Update Payload:", payload);

              await axios.put(
                `https://devdemo.softtrails.net/pms/update/${updatedData.id}`, // correct endpoint
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
              );

              Swal.fire("Updated!", "Record updated successfully!", "success");
              setEditModalOpen(false);
              fetchMappings(); // refresh table data
            } catch (error) {
              //  console.error("Update Error:", error.response || error);
              Swal.fire(
                "Error",
                error.response?.data?.message ||
                  "Something went wrong while updating!",
                "error"
              );
            } finally {
              setLoading(false);
            }
          }}
          loading={loading}
        />

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
      <ViewGoalModal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        goalData={selectedGoal}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        loading={loading}
        title="Delete Annual Goal?"
        message="Are you sure you want to delete this Annual Goal? This action cannot be undone."
      />
    </div>
  );
}

export default SettingAnnualGoals;
