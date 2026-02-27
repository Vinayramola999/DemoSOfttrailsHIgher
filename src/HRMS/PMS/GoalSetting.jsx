import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Swal from "sweetalert2";
import Dropdown from "react-bootstrap/Dropdown";

import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export default function GoalSetting() {
  const [goal, setGoal] = useState(null);
  const [kra, setKra] = useState(null);
  const [kras, setKras] = useState([]);
  const [goals, setGoals] = useState([]);
  // const [goalsList, setGoalsList] = useState([]);
  const [kraOptions, setKraOptions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showGoalSettingModal, setShowGoalSettingModal] = useState(false);


  const [form, setForm] = useState({
    target: "",
    weight: "",
    remark: "",
    description: "",
    date: "",
  });

  const [selectedList, setSelectedList] = useState([]);
  const totalWeight = selectedList.reduce(
    (sum, item) => sum + Number(item.weight || 0),
    0
  );

  const remainingWeight = Math.max(100 - totalWeight, 0);

  const token = sessionStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [goalKraData, setGoalKraData] = useState([]);

  const fetchGoalKraData = async () => {
    try {
      const res = await axios.get(
        "https://devdemo.softtrails.net/pms/goal-kra-weight",
        { headers }
      );
      const approvedData = res.data.data.filter(
        (item) => item.status === "approved"
      );
      setGoalKraData(approvedData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGoalKraData();
  }, []);
  const goalsList = React.useMemo(() => {
    return Array.from(
      new Map(
        goalKraData.map((item) => [
          item.goal_id,
          { value: Number(item.goal_id), label: item.goal },
        ])
      ).values()
    );
  }, [goalKraData]);

  useEffect(() => {
    if (goal) {
      const filteredKras = goalKraData
        .filter((item) => item.goal_id === goal.value)
        .map((item) => ({
          value: item.kra_mapping_id,
          label: item.kra_name,
          target: item.target,
          weight: item.weight,
          remark: item.remark,
          description: item.description,
          year: item.year,
        }));
      setKraOptions(filteredKras);
      setKra(null);

      // Reset form
      setForm({
        target: "",
        weight: "",
        remark: "",
        description: "",
        year: "",
      });
    } else {
      setKraOptions([]);
      setKra(null);
    }
  }, [goal, goalKraData]);
  useEffect(() => {
    if (kra) {
      setForm({
        target: kra.target || "",
        weight: kra.weight || "",
        remark: kra.remark || "",
        description: kra.description || "",
        year: kra.year || "",
      });
    }
  }, [kra]);

  // =====================================================
  // HANDLE ADD KRA TO TABLE
  // =====================================================
  const handleAdd = () => {
    if (!goal || !kra) {
      Swal.fire("Please select both Goal and KRA!");
      return;
    }

    const exists = selectedList.some(
      (item) => item.goal_id === goal.value && item.kra_id === kra.value
    );

    if (exists) {
      Swal.fire("This KRA is already added!");
      return;
    }

    const newItem = {
      goal_id: goal.value,
      kra_id: kra.value,
      goal: goal.label,
      kra: kra.label,
      year: form.year,
      target: form.target,
      weight: form.weight,
      remark: form.remark,
      description: form.description,
    };

    setSelectedList([...selectedList, newItem]);
    // Reset selections
    setGoal(null);
    setKra(null);
    setForm({
      target: "",
      weight: "",
      remark: "",
      description: "",
      year: "",
    });
  };

  // =====================================================
  // HANDLE EDIT/REMOVE FROM TABLE
  // =====================================================
  const handleEdit = (row) => {
    const updatedList = selectedList.filter(
      (item) => item.kra_id !== row.kra_id
    );
    setSelectedList(updatedList);
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================
  const handleSubmit = () => {
    if (totalWeight !== 100) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Weight",
        text: "Total KRA weight must be exactly 100% before submitting.",
      });
      return;
    }

    console.log("Submitting:", selectedList);
  };

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className=" w-full   rounded">
      {/* Form Row 1 */}
      <h2 className="">
       
  <button
    onClick={() => setShowGoalSettingModal(true)}
    className="bg-[#005AE6] text-white px-6 py-2 rounded-lg hover:bg-[#004bb5] transition"
  >
    Goal Setting
  </button>
</h2>

      
     
      {/* Table */}
      <h2 className="font-semibold mb-2 mt-4">Selected Goal KRAs</h2>

      <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[50vh] rounded-lg flex flex-col">
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
                <th className="p-5 text-left text-black">Action</th>
              </tr>
            </thead>

            <tbody>
              {selectedList.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="text-center py-6 text-gray-500 text-[14px]"
                  >
                    No KRAs added yet.
                  </td>
                </tr>
              )}

              {selectedList.map((row, i) => (
                <tr
                  key={i}
                  className={`${
                    (i + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"
                  } mt-2`}
                >
                  <td className="px-5 py-4">{i + 1}</td>
                  <td className="px-5 py-4">{row.goal}</td>
                  <td className="px-5 py-4">{row.kra}</td>
                  <td className="px-5 py-4">{row.year}</td>
                  <td className="px-5 py-4">
                    {row.weight ? `${parseFloat(row.weight).toFixed(0)}%` : ""}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleEdit(row)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-blue-200 text-blue-700 rounded-md px-4 py-3 mb-4 mt-4">
        <div className="flex justify-between font-semibold">
          <span>Total Weight</span>
          <span>{totalWeight}%</span>
        </div>

        <div className="mt-1 text-sm">Remaining weight: {remainingWeight}%</div>
      </div>

      {/* Submit */}
      <div className="mt-6 text-center">
        <button
          onClick={handleSubmit}
          disabled={totalWeight !== 100}
          className={`px-6 py-2 rounded text-white
    ${totalWeight === 100 ? "bg-blue-600" : "bg-gray-400 cursor-not-allowed"}
  `}
        >
          Submit
        </button>
      </div>
      {showGoalSettingModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div className="bg-white rounded-lg w-full max-w-[720px] max-h-[85vh] p-6 overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Goal Setting</h2>
        <button
          onClick={() => setShowGoalSettingModal(false)}
          className="text-xl text-gray-500"
        >
          ×
        </button>
      </div>

      {/* FORM */}
      <div className="space-y-4">

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Goal <span className="text-red-500">*</span>
          </label>
          <Select
            options={goalsList}
            value={goal}
            onChange={setGoal}
            placeholder="Select Goal"
            isClearable
            isSearchable
          />
        </div>

        {/* KRA */}
        <div>
          <label className="block text-sm font-medium mb-1">
            KRA <span className="text-red-500">*</span>
          </label>
          <Select
            options={kraOptions}
            value={kraOptions.find((opt) => opt.value === kra?.value) || null}
            onChange={setKra}
            placeholder="Select KRA"
            isClearable
            isSearchable
          />
        </div>

        {/* Year */}
        <div>
          <label className="block text-sm font-medium mb-1">Year</label>
          <input
            value={form.year}
            className="border rounded w-full px-3 py-2 bg-gray-100"
            readOnly
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium mb-1">Weight</label>
          <input
            value={form.weight ? `${parseFloat(form.weight).toFixed(0)}%` : ""}
            className="border rounded w-full px-3 py-2 bg-gray-100"
            readOnly
          />
        </div>

        {/* Remark */}
        <div>
          <label className="block text-sm font-medium mb-1">Remark</label>
          <input
            value={form.remark}
            className="border rounded w-full px-3 py-2 bg-gray-100"
            readOnly
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={form.description}
            className="border rounded w-full px-3 py-2 bg-gray-100"
            rows={3}
            readOnly
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={() => {
              setGoal(null);
              setKra(null);
              setForm({
                target: "",
                weight: "",
                remark: "",
                description: "",
                year: "",
              });
            }}
            className="px-4 py-2 border rounded"
          >
            Reset
          </button>

          <button
            onClick={handleAdd}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            + Add KRA
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>

  );
}
