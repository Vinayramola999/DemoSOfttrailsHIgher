import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Calendar } from "react-feather";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditModal = ({ open, data, onClose, onSave, loading }) => {
  const [editForm, setEditForm] = useState(data || {});
  const [goals, setGoals] = useState([]);
  const [kras, setKras] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [verticals, setVerticals] = useState([]);
 

  const [originalData, setOriginalData] = useState({});
  useEffect(() => {
    if (open && data) {
      setEditForm(data); 
      setOriginalData(data); 
    }
  }, [open, data]);


  useEffect(() => {
    if (open) {
      fetchGoals();
      fetchKras();
      fetchDepartments();
      fetchVerticals(data.dept_id);
    }
  }, [open]);

  // Fetch goals
  const fetchGoals = async () => {
    const res = await fetch("https://devdemo.softtrails.net/pms/goals");
    const json = await res.json();
    setGoals(json);
  };

  // Fetch KRAs
  const fetchKras = async () => {
    const res = await fetch("https://devdemo.softtrails.net/pms/kra");
    const json = await res.json();
    setKras(json);
  };

  // Fetch Departments
  const fetchDepartments = async () => {
    const token = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const res = await fetch("https://devdemo.softtrails.net/departments", {
      headers,
    });
    const json = await res.json();
    setDepartments(json);
  };

  // Fetch Verticals
  const fetchVerticals = async (deptId) => {
    const token = sessionStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const res = await fetch(`https://devdemo.softtrails.net/sub_dept/get/${deptId}`, {
      headers,
    });
    const json = await res.json();
    setVerticals(json);
  };

  // Filter KRAs based on goal

  if (!open) return null;
  // Filter KRAs based on selected goal
  const kraOptions = kras
    .filter((k) => k.goal_id === parseInt(editForm.goal_id))
    .map((k) => ({ value: k.id, label: k.kra_name }));

  const departmentOptions = departments.map((d) => ({
    value: d.dept_id,
    label: d.dept_name,
  }));

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-[600px] rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-blue-700">
          Edit Annual Goal
        </h2>

        {/* Goal */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Goal
        </label>
        <Select
          options={goals.map((g) => ({
            value: g.id,
            label: g.goal,
          }))}
          value={
            goals
              .map((g) => ({ value: g.id, label: g.goal }))
              .find((opt) => opt.value === editForm.goal_id) || null
          }
          onChange={(selected) =>
            setEditForm({
              ...editForm,
              goal_id: selected ? selected.value : "",
            })
          }
          placeholder="Select Goal"
          className="mb-3"
        />

        {/* KRA */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select KRA
        </label>
        <Select
          options={kraOptions}
          value={
            kraOptions.find((opt) => opt.value === editForm.kra_mapping_id) ||
            null
          }
          onChange={(selected) =>
            setEditForm({
              ...editForm,
              kra_mapping_id: selected ? selected.value : "",
            })
          }
          placeholder="Select KRA"
          className="mb-3"
        />

        {/* Department */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Department
        </label>
        <Select
          options={departmentOptions}
          value={
            departmentOptions.find((opt) => opt.value === editForm.dept_id) ||
            null
          }
          onChange={(selected) => {
            const deptId = selected ? selected.value : "";
            setEditForm({ ...editForm, dept_id: deptId, sub_id: "" });
            if (deptId) fetchVerticals(deptId);
          }}
          placeholder="Select Department"
          className="mb-3"
        />

        {/* Vertical */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Vertical
        </label>
        <Select
          options={verticals.map((v) => ({
            value: v.sub_id,
            label: v.sub_dept_name,
          }))}
          value={
            verticals
              .map((v) => ({ value: v.sub_id, label: v.sub_dept_name }))
              .find((opt) => opt.value === editForm.sub_id) || null
          }
          onChange={(selected) =>
            setEditForm({
              ...editForm,
              sub_id: selected ? selected.value : "",
            })
          }
          placeholder="Select Vertical"
          isClearable
          isSearchable
          className="mb-3 w-full text-sm"
        />

        {/* Year */}

        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Year
        </label>

        <Select
          options={Array.from({ length: 201 }, (_, i) => {
            const year = 2020 + i; // generates years 1900 → 2100
            return { value: year.toString(), label: year.toString() };
          })}
          value={
            editForm.year
              ? {
                  value: editForm.year.toString(),
                  label: editForm.year.toString(),
                }
              : null
          }
          onChange={(selected) =>
            setEditForm({
              ...editForm,
              year: selected ? selected.value : "",
            })
          }
          placeholder="Select Year"
          className="mb-3 w-full text-sm"
        />

        {/* Weight */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Weight (%)
        </label>
        <input
          type="text"
          value={Math.round(editForm.weight) || ""}
          onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
          className="border px-3 py-2 rounded w-full mb-3"
        />

        {/* Remark */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Remark
        </label>
        <input
          type="text"
          value={editForm.remark || ""}
          onChange={(e) => setEditForm({ ...editForm, remark: e.target.value })}
          className="border px-3 py-2 rounded w-full mb-3"
        />

        {/* Description */}
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={editForm.description || ""}
          onChange={(e) =>
            setEditForm({ ...editForm, description: e.target.value })
          }
          rows={3}
          className="border px-3 py-2 rounded w-full mb-4"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => {
              setEditForm(originalData); // revert ALL changes
              onClose();
            }}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={() => onSave(editForm)}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
