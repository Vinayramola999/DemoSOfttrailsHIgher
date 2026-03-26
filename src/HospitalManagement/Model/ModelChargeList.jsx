import React, { useState } from "react";

const defaultForm = {
  chargeType: "",
  serviceType: "",
  description: "",
  exclusiveGroup: "NONE",
  workMode: "ONE_TIME",
  frequency: "",
  cycleDuration: "",
  checkoutTime: "",
  bufferTime: "",
  chargeAmountType: "Including Tax",
  amount: "",
  infinite: false,
  taxPercent: "",
  chargeTypeName: "",
};

const chargeTypeOptions = [
  { value: "Services", label: "Services" },
  { value: "Consumables", label: "Consumables" },
];

const frequencyOptions = [
  { value: "Daily", label: "Daily" },
  { value: "Hourly", label: "Hour" },
  { value: "Minute", label: "Minute" },
];

function ModelChargeList({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(defaultForm);

  const toISODuration = (timeStr) => {
    if (!timeStr && timeStr !== 0) return null;
    // timeStr may be "HH:MM" or "HH:MM:SS" or already an ISO duration
    if (typeof timeStr !== 'string') return null;
    if (timeStr.startsWith('P') || timeStr.startsWith('PT')) return timeStr;
    const parts = timeStr.split(':').map(p => Number(p));
    if (parts.length === 0 || isNaN(parts[0])) return null;
    const h = parts[0] || 0;
    const m = parts.length > 1 && !isNaN(parts[1]) ? parts[1] : 0;
    const s = parts.length > 2 && !isNaN(parts[2]) ? parts[2] : 0;
    let dur = 'PT';
    if (h) dur += `${h}H`;
    if (m) dur += `${m}M`;
    if (s) dur += `${s}S`;
    // If all zero, explicit PT0S
    if (dur === 'PT') dur = 'PT0S';
    return dur;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // If frequency changes to Daily, clear time-based fields so they don't linger
    if (name === "frequency") {
      setForm((prev) => ({
        ...prev,
        frequency: value,
        cycleDuration: value === "Daily" ? "" : prev.cycleDuration,
        checkoutTime: value === "Daily" ? "" : prev.checkoutTime,
        bufferTime: value === "Daily" ? "" : prev.bufferTime,
      }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleWorkMode = (mode) => {
    setForm((prev) => ({ ...prev, workMode: mode }));
  };

  const handleAmountType = (type) => {
    setForm((prev) => ({ ...prev, chargeAmountType: type }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isConsumable = form.chargeType === "Consumables";
    const payload = {
      name: form.serviceType,
      category: isConsumable ? "CONSUMABLE" : "SERVICE",
      description: form.description,
      taxApplicable: form.chargeAmountType === "Tax Extra",
      taxPercentage: Number(form.taxPercent) || 0,
      exclusiveGroup: form.exclusiveGroup || "NONE"
    };

    if (!isConsumable) {
      payload.inventoryType = form.infinite ? 'INFINITE' : 'FINITE';
      payload.workMode = form.workMode;
      if (form.workMode === 'RECURRING') {
        payload.frequency = form.frequency === "Daily" ? "DAILY" : form.frequency === "Hourly" ? "HOURLY" : "MINUTES";
        if (form.cycleDuration) payload.cycleDuration = toISODuration(form.cycleDuration);
        if (form.checkoutTime) payload.checkoutTime = form.checkoutTime; // Expected HH:mm format
      }
      if (form.bufferTime) payload.bufferTime = toISODuration(form.bufferTime);
    }

    if (onSubmit) onSubmit(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className="relative flex flex-col bg-white border border-gray-300 rounded-lg shadow-lg"
        style={{
          width: "526px",
          maxHeight: "90vh",
          borderRadius: "8px",
          border: "1px solid rgba(221, 221, 221, 1)",
          opacity: 1,
        }}
      >
        {/* Close button */}
        <button
          className="absolute z-10 rounded-full cursor-pointer top-3 right-3 hover:bg-gray-100"
          onClick={onClose}
          aria-label="Close"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="15" cy="15" r="15" fill="#FF3A3A" />
            <path
              d="M20.2426 11.7574L16 16M16 16L11.7574 20.2426M16 16L20.2426 20.2426M16 16L11.7574 11.7574"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Title per spec */}
        <h2
          className="text-[#00235A] font-[Inter] font-semibold text-[16px] leading-[100%] tracking-normal pt-6 px-6"
        >
          Add Charge Type
        </h2>

        {/* Scrollable Form Container */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          <form onSubmit={handleSubmit} className="text-sm text-gray-800" id="chargeTypeForm">
            <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
              <div>
                <label className="block mb-1 font-medium">
                  Charge type name<span className="text-red-500">*</span>
                </label>
                <select
                  name="chargeType"
                  value={form.chargeType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select</option>
                  {chargeTypeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 font-medium">
                  {form.chargeType === "Consumables" ? (
                    <>
                      Consumable name<span className="text-red-500">*</span>
                    </>
                  ) : (
                    <>
                      Service type name<span className="text-red-500">*</span>
                    </>
                  )}
                </label>
                <input
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder={
                    form.chargeType === "Consumables"
                      ? "Enter consumable name"
                      : "Enter service type name"
                  }
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-medium">
                Description<span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter description"
                required
                rows={2}
              />
            </div>

            <div className="mb-3">
              <label className="block mb-1 font-medium">
                Exclusive Group<span className="text-red-500">*</span>
              </label>
              <select
                name="exclusiveGroup"
                value={form.exclusiveGroup}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="NONE">None</option>
                <option value="ROOM">Room</option>
                <option value="BED">Bed</option>
                <option value="ICU">ICU</option>
              </select>
            </div>

            {form.chargeType !== "Consumables" && (
              <>
                <div className="mb-3">
                  <label className="block font-bold mb-2 text-[#00235A]">
                    Work Mode
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="workMode"
                        value="ONE_TIME"
                        checked={form.workMode === "ONE_TIME"}
                        onChange={() => handleWorkMode("ONE_TIME")}
                      />
                      One Time
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="workMode"
                        value="RECURRING"
                        checked={form.workMode === "RECURRING"}
                        onChange={() => handleWorkMode("RECURRING")}
                      />
                      Recurring
                    </label>
                  </div>
                </div>
                {form.workMode === "RECURRING" && (
                  <div className="grid grid-cols-1 gap-4 mb-3 md:grid-cols-2">
                    <div>
                      <label className="block mb-1 font-medium">Frequency</label>
                      <select
                        name="frequency"
                        value={form.frequency}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select</option>
                        {frequencyOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {(form.frequency === "Daily" ||
                      form.frequency === "Hourly" ||
                      form.frequency === "Minute") && (
                        <>
                          {form.frequency !== "Daily" && (
                            <div>
                              <label className="block mb-1 font-medium">
                                Cycle duration
                              </label>
                              <input
                                type="time"
                                name="cycleDuration"
                                value={form.cycleDuration}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="hh - mm"
                              />
                            </div>
                          )}

                          <div>
                            <label className="block mb-1 font-medium">
                              Checkout Time
                            </label>
                            <input
                              type="time"
                              name="checkoutTime"
                              value={form.checkoutTime}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="hh - mm"
                            />
                          </div>

                          <div>
                            <label className="block mb-1 font-medium">
                              Buffer Time
                            </label>
                            <input
                              type="time"
                              name="bufferTime"
                              value={form.bufferTime}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="hh - mm"
                            />
                          </div>
                        </>
                      )}
                  </div>
                )}

              </>
            )}

            <div className="mb-3">
              <label className="block font-bold mb-2 text-[#00235A]">
                Charge Amount
              </label>
              <div className="flex items-center gap-6 mb-2">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="chargeAmountType"
                    value="Including Tax"
                    checked={form.chargeAmountType === "Including Tax"}
                    onChange={() => handleAmountType("Including Tax")}
                  />
                  Including Tax
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="chargeAmountType"
                    value="Tax Extra"
                    checked={form.chargeAmountType === "Tax Extra"}
                    onChange={() => handleAmountType("Tax Extra")}
                  />
                  Tax Extra
                </label>
              </div>

              {(form.chargeAmountType === "Tax Extra" || form.chargeAmountType === "Including Tax") && (
                <div className="mb-3">
                  <input
                    type="number"
                    name="taxPercent"
                    value={form.taxPercent}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="tax %"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              {form.chargeType !== "Consumables" && (
                <div className="mb-2">
                  <label className="block font-bold mb-2 text-[#00235A]">
                    Service Type
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-base font-normal">
                      <input
                        type="radio"
                        name="infinite"
                        value={false}
                        checked={!form.infinite}
                        onChange={() =>
                          setForm((prev) => ({ ...prev, infinite: false }))
                        }
                        className="form-radio h-3 w-3 text-[#005AE6] focus:ring-[#005AE6]"
                        style={{ accentColor: "#005AE6" }}
                      />
                      <span
                        className={
                          !form.infinite
                            ? "text-[#005AE6] font-semibold"
                            : "text-[#222] font-normal"
                        }
                      >
                        Finite
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-base font-normal">
                      <input
                        type="radio"
                        name="infinite"
                        value={true}
                        checked={form.infinite}
                        onChange={() =>
                          setForm((prev) => ({ ...prev, infinite: true }))
                        }
                        className="form-radio h-3 w-3 text-[#005AE6] focus:ring-[#005AE6]"
                        style={{ accentColor: "#005AE6" }}
                      />
                      <span
                        className={
                          form.infinite
                            ? "text-[#005AE6] font-semibold"
                            : "text-[#222] font-normal"
                        }
                      >
                        Infinite
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Footer with Buttons - Fixed at bottom */}
        <div className="flex gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            form="chargeTypeForm"
            type="submit"
            className="flex-1 px-4 py-2 font-semibold text-white transition rounded-lg"
            style={{
              background: "#005AE6",
              hover: "bg-[#004bb5]",
            }}
            onMouseEnter={(e) => e.target.style.background = "#004bb5"}
            onMouseLeave={(e) => e.target.style.background = "#005AE6"}
          >
            Add
          </button>
          <button
            type="button"
            className="flex-1 px-4 py-2 font-semibold text-gray-800 transition border border-gray-800 rounded-lg hover:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModelChargeList;

