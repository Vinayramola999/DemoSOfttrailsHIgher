import { useState, useEffect } from "react";
import { HRMS_API_BASE } from "../../config/apiBase";
import MessageModal from "../../NewComponents/MessageModal";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import RuleEngineModal from "./RuleEngineModal";
import Pagination from "../../NewComponents/Pagination";
import { DeleteIcon, EditIcon, EyeIcon } from "../../NewComponents/ReactIcons";

const ITEMS_PER_PAGE = 25;

export default function ShiftRulesPage() {
  const [activeTab, setActiveTab] = useState("shift");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [ruleForm, setRuleForm] = useState(false);

  const [editItem, setEditItem] = useState(null);
  const [shiftStatus, setShiftStatus] = useState(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [shifts, setShifts] = useState([]);
  const [rules, setRules] = useState([]);

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [viewRuleModal, setViewRuleModal] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    fetchShifts();
    fetchRules();
  }, []);

  const fetchShifts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${HRMS_API_BASE}/attendance/get-shifts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setShifts(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  };

  const fetchRules = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`${HRMS_API_BASE}/attendance/get-rules`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRules(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error("Error fetching rules:", error);
    }
  };

  const rawData = activeTab === "shift" ? shifts : rules;

  const filteredData = rawData.filter((item) => {
    const name = item.shift_name || item.name || "";
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Active" && item.is_active === true) ||
      (statusFilter === "Inactive" && item.is_active === false);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const indexOfFirst = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = filteredData.slice(indexOfFirst, indexOfFirst + ITEMS_PER_PAGE);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const form = e.target;
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");

    const payload = {
      shift_name: form.name.value,
      time_in: form.in.value,
      time_out: form.out.value,
      ...(editItem ? { is_active: shiftStatus } : {}),
    };

    if (editItem) {
      try {
        const response = await fetch(`${HRMS_API_BASE}/attendance/update-shift/${editItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          setMessage("Shift updated successfully");
          setMessageType("success");
          setShowForm(false);
          setEditItem(null);
          fetchShifts();
        } else {
          const errData = await response.json().catch(() => ({}));
          setMessage(errData.message || "Failed to update shift");
          setMessageType("error");
        }
      } catch (error) {
        setMessage("An error occurred while updating the shift");
        setMessageType("error");
      }
    } else {
      try {
        const response = await fetch(`${HRMS_API_BASE}/attendance/create-shift`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...payload, created_by: userId ? parseInt(userId) : 1 }),
        });
        if (response.ok) {
          setMessage("Shift created successfully");
          setMessageType("success");
          setShowForm(false);
          setEditItem(null);
          fetchShifts();
        } else {
          const errData = await response.json().catch(() => ({}));
          setMessage(errData.message || "Failed to create shift");
          setMessageType("error");
        }
      } catch (error) {
        setMessage("An error occurred while creating the shift");
        setMessageType("error");
      }
    }
  };

  const handleDeleteShift = async () => {
    if (!deleteModal.item) return;
    setDeleteLoading(true);
    setDeleteError("");
    const token = sessionStorage.getItem("token");
    try {
      const response = await fetch(
        `${HRMS_API_BASE}/attendance/delete-shift/${deleteModal.item.id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        setDeleteModal({ open: false, item: null });
        setMessage("Shift deleted successfully");
        setMessageType("success");
        fetchShifts();
      } else {
        const errData = await response.json().catch(() => ({}));
        setDeleteError(errData.message || "Failed to delete shift. Please try again.");
      }
    } catch (error) {
      setDeleteError("An error occurred while deleting the shift.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:p-2">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange("shift")}
            className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all ${activeTab === "shift"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
          >
            SHIFT
          </button>
          <button
            onClick={() => handleTabChange("rules")}
            className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all ${activeTab === "rules"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
              }`}
          >
            RULES
          </button>
        </div>

        {activeTab === "shift" ? (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Add Shift
          </button>
        ) : (
          <button onClick={() => setRuleForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            + Add Rule
          </button>
        )}
      </div>

      {/* ── Search + Status Filter ── */}
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className="border rounded-lg px-3 py-2 w-52 text-sm focus:outline-none focus:border-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white text-gray-600 min-w-[150px]"
        >
          <option value="all">Select status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* ── Table wrapper (TalentDatabase style) ── */}
      {/* <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white"> */}
      <div className="h-[75vh] sm:h-[60vh] md:h-[65vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
          {activeTab === "shift" && (                        //SHIFT TABLES
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
                <tr>
                  <th className="p-5 text-left text-black">S.No</th>
                  <th className="p-5 text-left text-black">Shift Name</th>
                  <th className="p-5 text-left text-black">Time In</th>
                  <th className="p-5 text-left text-black">Time Out</th>
                  <th className="p-5 text-left text-black">Status</th>
                  <th className="p-5 text-left text-black">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={6} className="h-3 bg-white" /></tr>
                {currentItems.length === 0 ? (
                  <tr> <td colSpan={6} className="px-5 py-8 text-center text-gray-400 text-sm"> No shifts found. </td> </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr key={item.id || index} className={(index + 1) % 2 === 0 ? "bg-white" : "bg-blue-50"} >
                      <td className="px-5 py-4 text-left text-[14px] text-black"> {indexOfFirst + index + 1} </td>
                      <td className="px-5 py-4 text-left text-[14px] text-black font-medium"> {item.shift_name || item.name} </td>
                      <td className="px-5 py-4 text-left text-[14px] text-black"> {item.time_in ? item.time_in.slice(0, 5) : item.in || "-"} </td>
                      <td className="px-5 py-4 text-left text-[14px] text-black"> {item.time_out ? item.time_out.slice(0, 5) : item.out || "-"} </td>
                      <td className="px-5 py-4 text-left text-[14px]"> <span className={`rounded-full text-sm font-semibold ${item.is_active ? "text-green-700" : "text-red-600"}`} > {item.is_active ? "Active" : "Inactive"} </span> </td>
                      <td className="px-5 py-4 text-left">
                        <div className="flex items-center gap-3">
                          <button onClick={() => { setShiftStatus(item.is_active ?? true); setEditItem(item); setShowForm(true); }} title="Edit" className="text-blue-500 hover:text-blue-700 transition-colors" > <EditIcon /> </button>
                          <button onClick={() => { setDeleteError(""); setDeleteModal({ open: true, item }); }} title="Delete" className="text-red-400 hover:text-red-600 transition-colors" > <DeleteIcon /> </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "rules" && (
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
                <tr>
                  <th className="p-5 text-left text-black">S.No</th>
                  <th className="p-5 text-left text-black">Shift Name</th>
                  <th className="p-5 text-left text-black">Grace</th>
                  <th className="p-5 text-left text-black">Working Hours</th>
                  <th className="p-5 text-left text-black">Status</th>
                  <th className="p-5 text-left text-black">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={5} className="h-3 bg-white" /></tr>
                {currentItems.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-sm">No rules found.</td></tr>
                ) : (
                  currentItems.map((rule, index) => (
                    <tr key={rule.id || index} className={(index + 1) % 2 === 0 ? "bg-white" : "bg-blue-50"} >
                      <td className="px-5 py-4 text-[14px] text-black">{indexOfFirst + index + 1}</td>
                      <td className="px-5 py-4 text-[14px] text-black font-medium">{rule.shift_name}</td>
                      <td className="px-5 py-4 text-[14px]"> <span className={` rounded-full text-sm font-semibold ${rule.rule_config?.grace?.is_enabled ? "text-green-700" : "text-red-600"}`} > {rule.rule_config?.grace?.is_enabled ? "Yes" : "No"} </span> </td>
                      <td className="px-5 py-4 text-[14px]"> <span className={` rounded-full text-sm font-semibold ${rule.rule_config?.working_hours?.is_enabled ? "text-green-700" : "text-red-600"}`} > {rule.rule_config?.working_hours?.is_enabled ? "Yes" : "No"} </span> </td>
                      <td className="px-5 py-4 text-left text-[14px]"> <span className={`rounded-full text-sm font-semibold ${rule.is_active ? "text-green-700" : "text-red-600"}`} > {rule.is_active ? "Active" : "Inactive"} </span> </td>
                      <td className="px-5 py-4">
                        <button onClick={() => { setSelectedRule(rule); setViewRuleModal(true); }} className="text-blue-600 hover:text-blue-800" > <EyeIcon /> </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {viewRuleModal && selectedRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg">

            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h2 className="text-lg font-semibold"> {selectedRule.shift_name} </h2>
              <button onClick={() => setViewRuleModal(false)} className="text-gray-400 hover:text-gray-600 text-xl" > × </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 text-sm">

              {/* Shift Timing */}
              <div>
                {/* <p className="font-semibold text-gray-700 mb-1">Shift Timing</p> */}
                <p className="text-sm"><span className="font-semibold text-gray-700 mb-1">Shift Timing: </span>{selectedRule.time_in?.slice(0, 5)} to {selectedRule.time_out?.slice(0, 5)}</p>
              </div>

              {/* Grace IN */}
              <div>
                <p className="font-semibold text-gray-700"> Grace IN — {selectedRule.rule_config?.grace?.is_enabled ? "Yes" : "No"} </p>
                {selectedRule.rule_config?.grace?.is_enabled &&
                  selectedRule.rule_config?.grace?.in?.treatment?.map((t, i) => (
                    <div key={i} className="grid grid-cols-2 gap-6 mt-2 pl-4">
                      <p><span className="font-medium">Time:</span> After {t.after_minutes} mins</p>
                      <p><span className="font-medium">Treatment:</span> {t.action}</p>
                    </div>
                  ))}
              </div>

              {/* Grace OUT */}
              <div>
                <p className="font-semibold text-gray-700">Grace OUT — {selectedRule.rule_config?.grace?.is_enabled ? "Yes" : "No"}</p>
                {selectedRule.rule_config?.grace?.is_enabled &&
                  selectedRule.rule_config?.grace?.out?.treatment?.map((t, i) => (
                    <div key={i} className="grid grid-cols-2 gap-6 mt-2 pl-4">
                      <p><span className="font-medium">Time:</span> After {t.after_minutes} mins</p>
                      <p><span className="font-medium">Treatment:</span> {t.action}</p>
                    </div>
                  ))}
              </div>

              {/* Working Hours */}
              <div>
                <p className="font-semibold text-gray-700">Working Hours — {selectedRule.rule_config?.working_hours?.is_enabled ? "Yes" : "No"}</p>
                {selectedRule.rule_config?.working_hours?.is_enabled && (
                  <div className="mt-2 pl-4 space-y-1">
                    <p> <span className="font-medium">Absent if less than:</span>{" "} {selectedRule.rule_config.working_hours.absent_if_less_than_hours} hrs </p>
                    <p> <span className="font-medium">Half-day if less than:</span>{" "} {selectedRule.rule_config.working_hours.half_day_if_less_than_hours} hrs </p>
                  </div>
                )}
              </div>

              {/* Break Rule */}
              <div>
                <p className="font-semibold text-gray-700">Break Rule — {selectedRule.rule_config?.break?.is_enabled ? "Yes" : "No"}</p>
                {selectedRule.rule_config?.break?.is_enabled &&
                  selectedRule.rule_config?.break?.treatment?.map((t, i) => (
                    <div key={i} className="grid grid-cols-2 gap-6 mt-2 pl-4">
                      <p><span className="font-medium">Time:</span> After {t.after_minutes} mins</p>
                      <p><span className="font-medium">Treatment:</span> {t.action}</p>
                    </div>
                  ))}
              </div>

              {/* Status & Created */}
              <div className="border-t pt-4">
                <p> <span className="font-semibold">Status:</span>{" "} {selectedRule.is_active ? (<span className="text-green-600 font-medium">Active</span>) : (<span className="text-red-600 font-medium">Inactive</span>)} </p>
                <p className="mt-1"> <span className="font-semibold">Created At:</span>{" "} {new Date(selectedRule.created_at).toLocaleString()} </p>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 border-t">
              <button onClick={() => setViewRuleModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm" > Close </button>
            </div>
          </div>
        </div>
      )}


      {/* ── SHIFT MODAL  Form ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold">{editItem ? "Edit Shift" : "Add Shift"}</h2>
              <button onClick={() => { setShowForm(false); setEditItem(null); }} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>

            <form onSubmit={handleSave} className="px-6 py-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Shift Name</label>
                <input name="name" defaultValue={editItem?.shift_name || editItem?.name || ""} placeholder="Enter shift name" required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">In Time</label>
                  <input type="time" name="in" defaultValue={editItem?.time_in || editItem?.in || ""} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium">Out Time</label>
                  <input type="time" name="out" defaultValue={editItem?.time_out || editItem?.out || ""} required className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                </div>
              </div>

              {/* Status radio — edit only */}
              {editItem && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Status</label>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="shiftStatusRadio" checked={shiftStatus === true} onChange={() => setShiftStatus(true)} className="w-4 h-4 border-gray-300 text-green-600 focus:ring-green-500" />
                      <span className="text-sm font-medium text-green-700">Active</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="shiftStatusRadio" checked={shiftStatus === false} onChange={() => setShiftStatus(false)} className="w-4 h-4 border-gray-300 text-red-600 focus:ring-red-400" />
                      <span className="text-sm font-medium text-red-600">Inactive</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditItem(null); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <MessageModal message={message} type={messageType} setMessage={setMessage} />

      {/* ── Delete Confirmation ── */}
      <DeleteConfirmModal
        open={deleteModal.open}
        title="Delete Shift?"
        message={`Are you sure you want to delete "${deleteModal.item?.shift_name || deleteModal.item?.name || "this shift"}"? This action cannot be undone.`}
        onCancel={() => { setDeleteModal({ open: false, item: null }); setDeleteError(""); }}
        onConfirm={handleDeleteShift}
        loading={deleteLoading}
        errorMessage={deleteError}
      />

      {/* ── Rule Engine Modal ── */}
      <RuleEngineModal
        open={ruleForm}
        onClose={() => setRuleForm(false)}
        onSaved={(msg, type) => { setMessage(msg); setMessageType(type); fetchRules(); }}
        shifts={shifts}
      />
    </div>
  );
}