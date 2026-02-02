import React from "react";

const PolicyModal = ({
  isOpen,
  onClose,
  formData,
  handleChange,
  errors,
  handleSubmit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl mx-4 md:mx-auto rounded-lg shadow-lg scrollbar-hide overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Add Leave Policy</h2>
          <button
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Policy Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Policy Name</label>
            <input
              type="text"
              name="policy_name"
              value={formData.policy_name}
              onChange={handleChange}
              className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none ${errors.policy_name ? "border-red-500" : "border-gray-300"
                }`}
              placeholder="Enter Policy Name"
            />
            {errors.policy_name && (
              <p className="text-red-500 text-xs mt-1">{errors.policy_name}</p>
            )}
          </div>

          {/* Allocation Type + Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Leave Allocation Frequency
              </label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="allocation_type"
                    value="monthly"
                    checked={formData.allocation_type === "monthly"}
                    onChange={handleChange}
                  />
                  Monthly
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="allocation_type"
                    value="yearly"
                    checked={formData.allocation_type === "yearly"}
                    onChange={handleChange}
                  />
                  Yearly
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Leave Allocation Value</label>
              <input
                type="number"
                name="allocation"
                value={formData.allocation}
                onChange={handleChange}
                className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none ${errors.allocation ? "border-red-500" : "border-gray-300"
                  }`}
                placeholder="Enter Allocation"
                min="0"
              />
            </div>
          </div>

          {/* Constraint Type + Constraint Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Allowed Consecutive Leaves
              </label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="constraint_type"
                    value="min"
                    checked={formData.constraint_type === "min"}
                    onChange={handleChange}
                  />
                  Min
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="constraint_type"
                    value="max"
                    checked={formData.constraint_type === "max"}
                    onChange={handleChange}
                  />
                  Max
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Allowed Consecutive Leaves Value
              </label>
              <input
                type="number"
                name="constraint_value"
                value={formData.constraint_value}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter Constraint Value"
                min="0"
              />
            </div>
          </div>

          {/* No. of Tranches + Tranche Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">No. of Leave Application</label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tranche_period"
                    value="monthly"
                    checked={formData.tranche_period === "monthly"}
                    onChange={handleChange}
                  />
                  Monthly
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="tranche_period"
                    value="yearly"
                    checked={formData.tranche_period === "yearly"}
                    onChange={handleChange}
                  />
                  Yearly
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No. of Leave Application Value</label>
              <input
                type="number"
                name="no_of_tranches"
                value={formData.no_of_tranches}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter No. of Tranches"
                min="0"
              />
            </div>
          </div>

          {/* Half Day Allowed */}
          <div>
            <label className="block text-sm font-medium mb-1">Half Day Allowed</label>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="half_day_allowed"
                  value={true}
                  checked={formData.half_day_allowed === true}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="half_day_allowed"
                  value={false}
                  checked={formData.half_day_allowed === false}
                  onChange={handleChange}
                />
                No
              </label>
            </div>
          </div>

          {/* Consecutive Leave Restriction */}
          <div >
            <label className="block text-sm font-medium mb-1">
              Consecutive Leave Restriction
            </label>
            <div className="flex gap-6 mt-1">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="consecutive_leave_restriction"
                  value={true}
                  checked={formData.consecutive_leave_restriction === true}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="consecutive_leave_restriction"
                  value={false}
                  checked={formData.consecutive_leave_restriction === false}
                  onChange={handleChange}
                />
                No
              </label>
            </div>

            {/* Gap Days Field (Visible only if Restriction is Enabled) */}
            {formData.consecutive_leave_restriction === true && (
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">
                  No. of Gap Days Between Consecutive Leaves
                </label>
                <input
                  type="number"
                  name="consecutive_leave_gap_days"
                  value={formData.consecutive_leave_gap_days}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder="Enter No. of Days"
                  min="0"
                  step="1" // ensures only integers (no decimal points)
                />
              </div>
            )}
          </div>

          {/* Carry Forward */}
          <div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="carry_forward_enabled"
                checked={formData.carry_forward_enabled}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="font-medium text-lg">Carry Forward</span>
            </div>

            {formData.carry_forward_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-3">
                {/* Monthly Carry Forward */}
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      name="carry_forward_monthly_enabled"
                      checked={formData.carry_forward_monthly_enabled}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="font-medium text-sm">
                      Enable Monthly Carry Forward
                    </span>
                  </div>
                  {formData.carry_forward_monthly_enabled && (
                    <div className="grid gap-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Monthly Type
                        </label>
                        <select
                          name="carry_forward_monthly_type"
                          value={formData.carry_forward_monthly_type}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md p-2"
                        >
                          <option value="">Select</option>
                          <option value="percentage">Percentage</option>
                          <option value="fixed">Fixed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Monthly Value
                        </label>
                        <input
                          type="number"
                          name="carry_forward_monthly_value"
                          value={formData.carry_forward_monthly_value}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md p-2"
                          placeholder="Enter Monthly Value"
                          min="0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Yearly Carry Forward */}
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      name="carry_forward_yearly_enabled"
                      checked={formData.carry_forward_yearly_enabled}
                      onChange={handleChange}
                      disabled={!formData.carry_forward_monthly_enabled}
                      className="mr-2"
                    />
                    <span
                      className={`font-medium text-sm ${!formData.carry_forward_monthly_enabled
                        ? "text-gray-400"
                        : ""
                        }`}
                    >
                      Enable Yearly Carry Forward
                    </span>
                  </div>
                  {formData.carry_forward_yearly_enabled &&
                    formData.carry_forward_monthly_enabled && (
                      <div className="grid gap-2">
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Yearly Type
                          </label>
                          <select
                            name="carry_forward_yearly_type"
                            value={formData.carry_forward_yearly_type}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2"
                          >
                            <option value="">Select</option>
                            <option value="percentage">Percentage</option>
                            <option value="fixed">Fixed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">
                            Yearly Value
                          </label>
                          <input
                            type="number"
                            name="carry_forward_yearly_value"
                            value={formData.carry_forward_yearly_value}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2"
                            placeholder="Enter Yearly Value"
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Threshold */}
          <div>
            <input
              type="checkbox"
              name="threshold_enabled"
              checked={formData.threshold_enabled}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-lg font-medium">Leave Accumulation </span>
            {formData.threshold_enabled && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">
                  Leave Accumulation Value
                </label>
                <input
                  type="number"
                  name="threshold_value"
                  value={formData.threshold_value}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter  Accumulation Value"
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Document */}
          <div>
            <input
              type="checkbox"
              name="document_required"
              checked={formData.document_required}
              onChange={handleChange}
              className="mr-2"
            />
            <span className="text-lg font-medium">Enable Document</span>
            {formData.document_required && (
              <div className="mt-2">
                <label className="block text-sm font-medium mb-1">
                  No. of Leaves
                </label>
                <input
                  type="number"
                  name="document_threshold"
                  value={formData.document_threshold}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md p-2"
                  placeholder="Enter Document Value"
                  min="0"
                />
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Save Policy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PolicyModal;