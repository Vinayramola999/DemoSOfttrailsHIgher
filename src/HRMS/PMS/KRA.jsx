import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { Calendar } from "react-feather";
import excelImage from "../../assests/excel.png";
import folderImage from "../../assests/folder.png";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import { faTrash, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { components } from "react-select";

const KRAComponent = () => {
  const [kra, setKra] = useState("");
  const [goalId, setGoalId] = useState("");
  const [goalList, setGoalList] = useState([]);
  const [kraList, setKraList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const [departments, setDepartments] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [kraToDelete, setKraToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreateKRAModal, setShowCreateKRAModal] = useState(false);
  const [modalKRA, setModalKRA] = useState("");
  const [modalGoalId, setModalGoalId] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    axios
      .get("https://devdemo.softtrails.net/pms/goals", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setGoalList(res.data))
      .catch((err) => console.error("Error fetching goals:", err));

    fetchKRAs();
    fetchDepartments();
  }, []);

  const fetchKRAs = () => {
    const token = sessionStorage.getItem("token");
    axios
      .get("https://devdemo.softtrails.net/pms/kra", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setKraList(res.data))
      .catch((err) => console.error("Error fetching KRAs:", err));
  };
  const fetchDepartments = () => {
    const token = sessionStorage.getItem("token");

    axios
      .get("https://devdemo.softtrails.net/departments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setDepartments(res.data);
      })
      .catch((err) => {
        console.error("Error fetching departments:", err);
      });
  };

  const handleSubmit = async () => {
    if (kra && goalId) {
      try {
        console.log("Submitting KRA:", { kra, goalId });
        const token = sessionStorage.getItem("token");
        const response = await axios.post(
          "https://devdemo.softtrails.net/pms/kra",
          {
            kra_name: kra,
            goal_id: parseInt(goalId),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const newKRA = {
          id: response.data.id || Math.random(),
          kra_name: kra,
          goal: goalList.find((g) => g.id === parseInt(goalId))?.goal || "",
          created_at: new Date().toISOString(),
        };

        setKraList((prev) => [newKRA, ...prev]);
        setKra("");
        setGoalId("");
        Swal.fire("Success", "KRA added successfully!", "success");
      } catch (error) {
        console.error("Error posting KRA:", error);
        Swal.fire("Error", "Failed to add KRA. Please try again.", "error");
      }
    } else {
      Swal.fire("Validation Error", "Please fill in all fields.", "warning");
    }
  };

  const filteredKRAs = kraList
    .filter((item) =>
      item.kra_name.toLowerCase().includes(searchText.toLowerCase())
    )
    .filter((item) => {
      if (!fromDate && !toDate) return true;
      const itemDate = new Date(item.created_at || new Date());
      const from = fromDate ? new Date(fromDate) : null;
      const to = toDate ? new Date(toDate) : null;
      return (!from || itemDate >= from) && (!to || itemDate <= to);
    });

  const totalPages = Math.ceil(filteredKRAs.length / itemsPerPage);
  const currentItems = filteredKRAs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const openDeleteModal = (kraItem) => {
    setKraToDelete(kraItem);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!kraToDelete) return;

    setDeleting(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`https://devdemo.softtrails.net/pms/kra/${kraToDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setKraList((prev) => prev.filter((kra) => kra.id !== kraToDelete.id));
      Swal.fire("Deleted", "KRA deleted successfully", "success");
    } catch (error) {
      console.error("Delete failed", error);
      Swal.fire("Error", "Failed to delete KRA", "error");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
      setKraToDelete(null);
    }
  };

  const handleExportToExcel = () => {
    if (!filteredKRAs.length) {
      Swal.fire({
        icon: "info",
        title: "No Data",
        text: "There is no data to export.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const exportData = filteredKRAs.map((kra, index) => ({
      "S.No": index + 1,
      "KRA Name": kra.kra_name,
      Goal: kra.goal,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KRAs");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });
    saveAs(blob, `KRAs_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  const handleExportToPDF = () => {
    if (!filteredKRAs.length) {
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
    doc.setFontSize(16);
    doc.text("KRA Report", 14, 15);

    const tableColumn = ["S.No", "KRA Name", "Goal"];
    const tableRows = filteredKRAs.map((kra, index) => [
      index + 1,
      kra.kra_name,
      kra.goal,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 102, 204] },
    });

    doc.save(`KRAs_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const deptOptions = departments.map((d) => ({
    value: d.dept_name,
    label: d.dept_name,
  }));
  const GoalOption = ({ innerProps, innerRef, data }) => (
    <div
      ref={innerRef}
      {...innerProps}
      className="p-2 hover:bg-blue-100 cursor-pointer"
    >
      <div className="font-medium">{data.label}</div>
      <div className="text-xs text-gray-500">{data.department}</div>
    </div>
  );

  const GoalSingleValue = ({ data, ...props }) => (
    <components.SingleValue {...props}>
      <div className="flex flex-col">
        <span className="font-medium">{data.label}</span>
        <span className="text-xs text-gray-500">{data.department}</span>
      </div>
    </components.SingleValue>
  );

  return (
    <div>
      {/* Form */}

      <button
        onClick={() => setShowCreateKRAModal(true)}
        className="bg-[#005AE6] text-white px-6 py-2 rounded-lg hover:bg-[#004bb5] transition"
      >
        Create KRA
      </button>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 mt-4">
        <input
          type="text"
          placeholder="Search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border rounded-md px-4 py-2 w-[250px] h-10"
        />
        <div className="flex items-center border border-gray-300 rounded-md px-3 py-1 w-fit bg-white shadow-sm text-gray-700">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="px-2 py-1 rounded-md text-sm outline-none border-none bg-transparent"
          />
          <span className="mx-2 text-sm text-black-500 font-medium">TO</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="px-2 py-1 rounded-md text-sm outline-none border-none bg-transparent"
          />
          <Calendar size={18} className="ml-2 text-gray-500" />
        </div>
        <span className="flex gap-5 mt-5">
          <img
            src={excelImage}
            className="w-[24px] h-[24px] hover:cursor-pointer hover:scale-110 hover:opacity-120"
            onClick={handleExportToExcel}
          />
          <img
            src={folderImage}
            onClick={handleExportToPDF}
            className="w-[24px] h-[24px] hover:cursor-pointer hover:scale-110 hover:opacity-120"
          />
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
                <th className="p-5 text-left text-black">KRA Name</th>
                <th className="p-5 text-left text-black">Goal</th>
                <th className="p-5 text-left text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="7" className="h-2 bg-white"></td>
              </tr>
              {currentItems.map((item, index) => (
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
                    {item.kra_name}
                  </td>
                  <td className="px-5 py-2 text-left text-[14px] text-black">
                    {item.goal}
                  </td>
                  <td className="px-5 py-2 text-left flex gap-2">
                    <button
                      className="text-blue-700"
                      onClick={() => openDeleteModal(item)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
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
      {showCreateKRAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg w-[520px] p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Create KRA
              </h2>
              <button
                onClick={() => setShowCreateKRAModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            {/* KRA Name */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                KRA Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={modalKRA}
                onChange={(e) => setModalKRA(e.target.value)}
                placeholder="Enter KRA name"
                className="border rounded-md px-4 py-2 w-full"
              />
            </div>

            {/* Goal Select */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Goal <span className="text-red-500">*</span>
              </label>
              <Select
                options={goalList.map((g) => ({
                  value: g.id,
                  label: g.goal,
                  department: g.dept_name,
                }))}
                value={modalGoalId}
                onChange={(selected) => setModalGoalId(selected)}
                placeholder="Select Goal"
                isClearable
                components={{
                  Option: GoalOption,
                  SingleValue: GoalSingleValue,
                }}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: "40px",
                    fontSize: "14px",
                    borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
                    "&:hover": { borderColor: "#3b82f6" },
                  }),
                }}
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateKRAModal(false)}
                className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!modalKRA || !modalGoalId) {
                    Swal.fire(
                      "Validation Error",
                      "All fields are required",
                      "warning"
                    );
                    return;
                  }

                  setKra(modalKRA);
                  setGoalId(modalGoalId.value);

                  await handleSubmit();

                  setModalKRA("");
                  setModalGoalId(null);
                  setShowCreateKRAModal(false);
                }}
                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete KRA?"
        message={`Are you sure you want to delete "${kraToDelete?.kra_name}"?`}
      />
    </div>
  );
};

export default KRAComponent;
