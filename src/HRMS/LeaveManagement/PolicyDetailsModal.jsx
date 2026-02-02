const PolicyDetailsModal = ({ isOpen, onClose, policy }) => {
  if (!isOpen || !policy) return null;

  const formatValue = (value, key) => {
    if (value === null || value === undefined || value === "") return "NA";

    if (key === "status") {
      return (
        <span
          className={`font-semibold ${value ? "text-green-600" : "text-red-600"}`}
        >
          {value ? "Active" : "Inactive"}
        </span>
      );
    }

    if (typeof value === "boolean") return value ? "Yes" : "No";

    // ✅ Format date only if it looks like a real date (not numbers or short strings)
    if (
      typeof value === "string" &&
      value.length > 10 && // prevent short numeric strings
      !isNaN(Date.parse(value))
    ) {
      return new Date(value).toLocaleString();
    }

    return value.toString();
  };

  const fieldLabels = {
    policy_name: "Policy Name",
    allocation_type: "Leave Allocation Frequency",
    allocation: "Leave Allocation Value",
    constraint_type: "Allowed Consecutive Leaves",
    constraint_value: "Allowed Consecutive Value",
    tranche_period: "No. of Leave Application",
    no_of_tranches: "No. of Leave Application Value",
    half_day_allowed: "Half Day Allowed",
    consecutive_leave_restriction: "Consecutive Leave Restriction",
    consecutive_leave_gap_days: "No. of Days for Consecutive Leave",
    carry_forward_enabled: "Carry Forward",
    carry_forward_monthly_type: "Carry Forward Monthly Type",
    carry_forward_monthly_value: "Carry Forward Monthly Value",
    carry_forward_yearly_type: "Carry Forward Yearly Type",
    carry_forward_yearly_value: "Carry Forward Yearly Value",
    document_required: "Document Required",
    document_threshold: "No. of Leaves for Document",
    threshold_value: "Threshold Value",
    status: "Status",
  };

  const shouldShowField = (key) => {
    // Hide carry-forward-related fields if disabled
    if (
      !policy.carry_forward_enabled &&
      [
        "carry_forward_monthly_type",
        "carry_forward_monthly_value",
        "carry_forward_yearly_type",
        "carry_forward_yearly_value",
      ].includes(key)
    ) {
      return false;
    }

    // Hide document threshold if not required
    if (!policy.document_required && key === "document_threshold") {
      return false;
    }

    // ✅ Hide consecutive_leave_gap_days if restriction is "No"
    if (
      key === "consecutive_leave_gap_days" &&
      policy.consecutive_leave_restriction === false
    ) {
      return false;
    }

    return true;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white w-full max-w-xl mx-4 md:mx-auto rounded-lg scrollbar-hide shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl items-center font-semibold">Policy Details</h2>
          <button onClick={onClose} className="text-red-600 text-3xl font-bold">
            &times;
          </button>
        </div>

        <div className="space-y-2">
          {Object.keys(fieldLabels).map(
            (key) =>
              shouldShowField(key) && (
                <div key={key} className="flex justify-between border-b py-1">
                  <span className="font-medium">{fieldLabels[key]}</span>
                  <span>{formatValue(policy[key], key)}</span>
                </div>
              )
          )}
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
export default PolicyDetailsModal;