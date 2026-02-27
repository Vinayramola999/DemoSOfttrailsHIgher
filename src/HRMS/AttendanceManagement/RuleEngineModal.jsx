import { useState } from "react";
import { HRMS_API_BASE } from "../../config/apiBase";

export default function RuleEngineModal({ open, onClose, onSaved, shifts }) {
    // Rule Engine States
    const [selectedShiftId, setSelectedShiftId] = useState("");
    const [graceInEnabled, setGraceInEnabled] = useState(true);
    const [graceOutEnabled, setGraceOutEnabled] = useState(true);
    const [breakEnabled, setBreakEnabled] = useState(true);
    const [workingHoursEnabled, setWorkingHoursEnabled] = useState(true);

    // Dynamic Rule Lists
    const [graceInRules, setGraceInRules] = useState([{ after_minutes: "", action: "warning" }]);
    const [graceOutRules, setGraceOutRules] = useState([{ after_minutes: "", action: "absent" }]);

    // Single Rule Fields
    const [breakRule, setBreakRule] = useState({ after_minutes: "", action: "warning" });
    const [workingHoursRule, setWorkingHoursRule] = useState({ half_day: "", absent: "" });

    const [error, setError] = useState("");

    const resetAndClose = () => {
        setSelectedShiftId("");
        setGraceInEnabled(true);
        setGraceOutEnabled(true);
        setBreakEnabled(true);
        setWorkingHoursEnabled(true);
        setGraceInRules([{ after_minutes: "", action: "warning" }]);
        setGraceOutRules([{ after_minutes: "", action: "absent" }]);
        setBreakRule({ after_minutes: "", action: "warning" });
        setWorkingHoursRule({ half_day: "", absent: "" });
        setError("");
        onClose();
    };

    const addGraceInRule = () => {
        setGraceInRules([...graceInRules, { after_minutes: "", action: "warning" }]);
    };

    const updateGraceInRule = (index, field, value) => {
        const updated = [...graceInRules];
        updated[index][field] = value;
        setGraceInRules(updated);
    };

    const addGraceOutRule = () => {
        setGraceOutRules([...graceOutRules, { after_minutes: "", action: "warning" }]);
    };

    const updateGraceOutRule = (index, field, value) => {
        const updated = [...graceOutRules];
        updated[index][field] = value;
        setGraceOutRules(updated);
    };

    const handleSaveRule = async () => {
        setError("");
        if (!selectedShiftId) {
            setError("Please select a Shift.");
            return;
        }

        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        const payload = {
            shift_id: parseInt(selectedShiftId),
            created_by: userId ? parseInt(userId) : 1,
            rule_config: {
                grace: {
                    is_enabled: graceInEnabled || graceOutEnabled,
                    in: {
                        treatment: graceInEnabled
                            ? graceInRules.map((r) => ({
                                after_minutes: parseInt(r.after_minutes) || 0,
                                action: r.action,
                            }))
                            : [],
                    },
                    out: {
                        treatment: graceOutEnabled
                            ? graceOutRules.map((r) => ({
                                after_minutes: parseInt(r.after_minutes) || 0,
                                action: r.action,
                            }))
                            : [],
                    },
                },
                break: {
                    is_enabled: breakEnabled,
                    treatment: breakEnabled
                        ? [{ after_minutes: parseInt(breakRule.after_minutes) || 0, action: breakRule.action }]
                        : [],
                },
                working_hours: {
                    is_enabled: workingHoursEnabled,
                    half_day_if_less_than_hours: parseInt(workingHoursRule.half_day) || 0,
                    absent_if_less_than_hours: parseInt(workingHoursRule.absent) || 0,
                },
            },
        };

        try {
            const response = await fetch(`${HRMS_API_BASE}/attendance/create-rules`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                onSaved("Rule configuration saved successfully!", "success");
                resetAndClose();
            } else {
                const errData = await response.json().catch(() => ({}));
                setError(errData.message || "Failed to save rules. Please try again.");
            }
        } catch (err) {
            console.error("Error saving rules:", err);
            setError("An error occurred while saving the rules.");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4 z-50">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden relative">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-slate-800">Attendance Rule Engine</h2>
                    <button
                        onClick={resetAndClose}
                        className="text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 space-y-4 max-h-[75vh] overflow-y-auto">

                    {/* Shift Select */}
                    <div>
                        <label className="text-sm font-medium text-slate-700 block mb-1">Shift</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                            value={selectedShiftId}
                            onChange={(e) => setSelectedShiftId(e.target.value)}
                        >
                            <option value="">Select Shift</option>
                            {shifts.map((shift) => (
                                <option key={shift.id || shift.shift_id} value={shift.id || shift.shift_id}>
                                    {shift.shift_name || shift.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* GRACE IN */}
                    <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={graceInEnabled}
                                    onChange={(e) => setGraceInEnabled(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                                />
                                Grace In Rules
                            </label>
                            <button
                                onClick={addGraceInRule}
                                disabled={!graceInEnabled}
                                className="text-xs text-blue-600 font-medium hover:text-blue-800 disabled:opacity-40"
                            >
                                + Add
                            </button>
                        </div>
                        {graceInEnabled && (
                            <div className="space-y-2">
                                {graceInRules.map((rule, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Mins"
                                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                            value={rule.after_minutes}
                                            onChange={(e) => updateGraceInRule(idx, "after_minutes", e.target.value)}
                                        />
                                        <select
                                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                            value={rule.action}
                                            onChange={(e) => updateGraceInRule(idx, "action", e.target.value)}
                                        >
                                            <option value="warning">Warning</option>
                                            <option value="half_day">Half Day</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* GRACE OUT */}
                    <div className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={graceOutEnabled}
                                    onChange={(e) => setGraceOutEnabled(e.target.checked)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                                />
                                Grace Out Rules
                            </label>
                            <button
                                onClick={addGraceOutRule}
                                disabled={!graceOutEnabled}
                                className="text-xs text-blue-600 font-medium hover:text-blue-800 disabled:opacity-40"
                            >
                                + Add
                            </button>
                        </div>
                        {graceOutEnabled && (
                            <div className="space-y-2">
                                {graceOutRules.map((rule, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Mins"
                                            className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                            value={rule.after_minutes}
                                            onChange={(e) => updateGraceOutRule(idx, "after_minutes", e.target.value)}
                                        />
                                        <select
                                            className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                            value={rule.action}
                                            onChange={(e) => updateGraceOutRule(idx, "action", e.target.value)}
                                        >
                                            <option value="warning">Warning</option>
                                            <option value="half_day">Half Day</option>
                                            <option value="absent">Absent</option>
                                        </select>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* BREAK */}
                    <div className="border rounded-lg p-3">
                        <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={breakEnabled}
                                onChange={(e) => setBreakEnabled(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                            />
                            Break Rule
                        </label>
                        {breakEnabled && (
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Mins"
                                    className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={breakRule.after_minutes}
                                    onChange={(e) => setBreakRule({ ...breakRule, after_minutes: e.target.value })}
                                />
                                <select
                                    className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={breakRule.action}
                                    onChange={(e) => setBreakRule({ ...breakRule, action: e.target.value })}
                                >
                                    <option value="warning">Warning</option>
                                    <option value="half_day">Half Day</option>
                                    <option value="absent">Absent</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* WORKING HOURS */}
                    <div className="border rounded-lg p-3">
                        <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-slate-800 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={workingHoursEnabled}
                                onChange={(e) => setWorkingHoursEnabled(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-600"
                            />
                            Working Hours Rule
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <span className="text-xs text-slate-500 block mb-1">Half Day (&lt; Hrs)</span>
                                <input
                                    type="number"
                                    placeholder="Hours"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={workingHoursRule.half_day}
                                    onChange={(e) => setWorkingHoursRule({ ...workingHoursRule, half_day: e.target.value })}
                                />
                            </div>
                            <div>
                                <span className="text-xs text-slate-500 block mb-1">Absent (&lt; Hrs)</span>
                                <input
                                    type="number"
                                    placeholder="Hours"
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                    value={workingHoursRule.absent}
                                    onChange={(e) => setWorkingHoursRule({ ...workingHoursRule, absent: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Inline error */}
                    {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                    <button
                        type="button"
                        onClick={resetAndClose}
                        className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-gray-50 text-gray-700"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveRule}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
