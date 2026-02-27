const PolicyModal = ({ isOpen, onClose, formData, handleChange, errors, handleSubmit, isSubmitting, isEditing, }) => {
  if (!isOpen) return null;

  // const sanitizeNumberInput = (e) => {
  //   const name = e.target.name;
  //   let value = e.target.value === '' ? '' : String(e.target.value);
  //   value = value.replace(/[^0-9.]/g, '');
  //   const parts = value.split('.');
  //   if (parts.length > 2) {
  //     value = parts[0] + '.' + parts.slice(1).join('');
  //   }
  //   if (value.startsWith('.')) value = '0' + value;
  //   e.target.value = value;
  //   handleChange(e);
  // };

  const sanitizeNumberInput = (e, typeFieldName = null) => {
  const name = e.target.name;
  let value = e.target.value === '' ? '' : String(e.target.value);

  // Remove unwanted chars
  value = value.replace(/[^0-9.]/g, '');

  const parts = value.split('.');
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('');
  }

  if (value.startsWith('.')) value = '0' + value;

  // Convert to number safely
  let num = value === '' ? '' : Number(value);

  // 🚀 If linked type is percentage → restrict between 1 and 100
  if (typeFieldName && formData[typeFieldName] === 'percentage' && num !== '') {
    if (num > 100) num = 100;
    if (num < 1) num = 1;
    value = String(num);
  }

  // ❌ If 0 → make blank
  if (num === 0) {
    value = '';
  }

  e.target.value = value;
  handleChange(e);
};

  const preventBadChars = (e) => {
    // prevent +, -, e, E
    if (e.key === '+' || e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  const preventBeforeInput = (e) => {
    const data = e.data;
    if (data && /[+\-eE]/.test(data)) {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white w-full max-w-2xl mx-4 md:mx-auto rounded-lg shadow-lg scrollbar-hide overflow-y-auto max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">{isEditing ? 'Edit Leave Policy' : 'Add Leave Policy'}</h2>
          <button className="text-gray-600 hover:text-gray-900 text-2xl font-bold" onClick={onClose} > &times; </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Policy Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Policy Name</label>
            <input type="text" name="policy_name" value={formData.policy_name} onChange={handleChange} className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none ${errors.policy_name ? "border-red-500" : "border-gray-300"}`} placeholder="Enter Policy Name" />
            {errors.policy_name && (<p className="text-red-500 text-xs mt-1">{errors.policy_name}</p>)}
          </div>

          {/* Allocation Type + Allocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1"> Leave Allocation Frequency </label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2"> <input type="radio" name="allocation_type" value="monthly" checked={formData.allocation_type === "monthly"} onChange={handleChange} /> Monthly </label>
                <label className="flex items-center gap-2"> <input type="radio" name="allocation_type" value="yearly" checked={formData.allocation_type === "yearly"} onChange={handleChange} /> Yearly </label>
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Leave Allocation Value</label>
                <input
                  type="text"
                  name="allocation"
                  value={formData.allocation}
                  onBeforeInput={preventBeforeInput}
                  onInput={(e) => {
                    let raw = e.target.value === '' ? '' : String(e.target.value);
                    raw = raw.replace(/[^0-9.]/g, '');
                    const parts = raw.split('.');
                    if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('');
                    if (raw.startsWith('.')) raw = '0' + raw;
                    const num = raw === '' ? '' : Number(raw);
                    const max = formData.allocation_type === 'yearly' ? 365 : 31;
                    if (num !== '' && num > max) {
                      raw = String(max);
                      e.target.value = raw;
                    } else {
                      e.target.value = raw;
                    }
                    handleChange(e);
                  }}
                  className={`w-full border rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none ${errors.allocation ? "border-red-500" : "border-gray-300" }`}
                  placeholder={formData.allocation_type === 'yearly' ? 'Max 365' : 'Max 31'}
                  inputMode="decimal"
                />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Allowed Consecutive Leaves</label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2"> <input type="radio" name="constraint_type" value="min" checked={formData.constraint_type === "min"} onChange={handleChange} /> Min </label>
                <label className="flex items-center gap-2"> <input type="radio" name="constraint_type" value="max" checked={formData.constraint_type === "max"} onChange={handleChange} /> Max </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1"> Allowed Consecutive Leaves Value </label>
              <input
                type="text"
                name="constraint_value"
                value={formData.constraint_value}
                onBeforeInput={preventBeforeInput}
                onInput={(e) => { sanitizeNumberInput(e); }}
                onKeyDown={preventBadChars}
                onPaste={(e) => { const text = (e.clipboardData || window.clipboardData).getData('text'); if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault(); }}
                inputMode="decimal"
                step="any"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter Constraint Value"
              />
            </div>
          </div>

          {/* No. of Tranches + Tranche Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">No. of Leave Application</label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2"> <input type="radio" name="tranche_period" value="monthly" checked={formData.tranche_period === "monthly"} onChange={handleChange} /> Monthly </label>
                <label className="flex items-center gap-2"> <input type="radio" name="tranche_period" value="yearly" checked={formData.tranche_period === "yearly"} onChange={handleChange} /> Yearly </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">No. of Leave Application Value</label>
              <input
                type="text"
                name="no_of_tranches"
                value={formData.no_of_tranches}
                onBeforeInput={preventBeforeInput}
                onInput={(e) => { sanitizeNumberInput(e); }}
                onKeyDown={preventBadChars}
                onPaste={(e) => { const text = (e.clipboardData || window.clipboardData).getData('text'); if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault(); }}
                inputMode="decimal"
                step="any"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                placeholder="Enter No. of Tranches"
              />
            </div>
          </div>

          {/* Half Day Allowed + Consecutive Leave Restriction (same row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Half Day Allowed</label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2"> <input type="radio" name="half_day_allowed" value={true} checked={formData.half_day_allowed === true} onChange={handleChange} /> Yes </label>
                <label className="flex items-center gap-2"> <input type="radio" name="half_day_allowed" value={false} checked={formData.half_day_allowed === false} onChange={handleChange} /> No </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Consecutive Leave Restriction</label>
              <div className="flex gap-6 mt-1">
                <label className="flex items-center gap-2"> <input type="radio" name="consecutive_leave_restriction" value={true} checked={formData.consecutive_leave_restriction === true} onChange={handleChange} /> Yes </label>
                <label className="flex items-center gap-2"> <input type="radio" name="consecutive_leave_restriction" value={false} checked={formData.consecutive_leave_restriction === false} onChange={handleChange} /> No </label>
              </div>

              {/* Gap Days Field (Visible only if Restriction is Enabled) */}
              {formData.consecutive_leave_restriction === true && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">No. of Gap Days Between Consecutive Leaves</label>
                  <input
                    type="text"
                    name="consecutive_leave_gap_days"
                    value={formData.consecutive_leave_gap_days}
                    onBeforeInput={preventBeforeInput}
                    onInput={(e) => { sanitizeNumberInput(e); }}
                    onKeyDown={preventBadChars}
                    onPaste={(e) => { const text = (e.clipboardData || window.clipboardData).getData('text'); if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault(); }}
                    inputMode="decimal"
                    step="1"
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="Enter No. of Days"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Carry Forward */}
          <div>
            <div className="flex items-center">
              <input type="checkbox" name="carry_forward_enabled" checked={formData.carry_forward_enabled} onChange={handleChange} className="mr-2" /> <span className="font-medium text-lg">Carry Forward</span>
            </div>

            {formData.carry_forward_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Type</label>
                  <select name="carry_forward_monthly_type" value={formData.carry_forward_monthly_type || ""} onChange={handleChange} className={`w-full rounded-md p-2 ${errors.carry_forward_monthly_type ? 'border-red-500' : 'border border-gray-300'}`} >
                    <option value="">Select</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  {errors.carry_forward_monthly_type && (<p className="text-red-500 text-xs mt-1">{errors.carry_forward_monthly_type}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Monthly Value</label>
                  <input
                    type="text"
                    name="carry_forward_monthly_value"
                    value={formData.carry_forward_monthly_value ?? ""}
                    onBeforeInput={preventBeforeInput}
                    // onInput={(e) => { sanitizeNumberInput(e); }}
                    onInput={(e) => sanitizeNumberInput(e, "carry_forward_monthly_type")}
                    onKeyDown={preventBadChars}
                    onPaste={(e) => { const text = (e.clipboardData || window.clipboardData).getData('text'); if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault(); }}
                    inputMode="decimal"
                    step="any"
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Enter Monthly Value"
                  />
                  {errors.carry_forward_monthly_value && (<p className="text-red-500 text-xs mt-1">{errors.carry_forward_monthly_value}</p>)}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Yearly Type</label>
                  <select name="carry_forward_yearly_type" value={formData.carry_forward_yearly_type || ""} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" disabled={!formData.carry_forward_monthly_type || formData.carry_forward_monthly_value === null || formData.carry_forward_monthly_value === ""} >
                    <option value="">Select</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed</option>
                  </select>
                  {errors.carry_forward_yearly_value && (<p className="text-red-500 text-xs mt-1">{errors.carry_forward_yearly_value}</p>)}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Yearly Value</label>
                  <input
                    type="text"
                    name="carry_forward_yearly_value"
                    value={formData.carry_forward_yearly_value ?? ""}
                    onBeforeInput={preventBeforeInput}
                    // onInput={(e) => { sanitizeNumberInput(e); }}
                    onInput={(e) => sanitizeNumberInput(e, "carry_forward_yearly_type")}
                    onKeyDown={preventBadChars}
                    onPaste={(e) => { const text = (e.clipboardData || window.clipboardData).getData('text'); if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault(); }}
                    inputMode="decimal"
                    step="any"
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Enter Yearly Value"
                    disabled={!formData.carry_forward_monthly_type || formData.carry_forward_monthly_value === null || formData.carry_forward_monthly_value === ""}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Threshold + Document in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input type="checkbox" name="threshold_enabled" checked={formData.threshold_enabled} onChange={handleChange} className="mr-2" />
              <span className="text-lg font-medium">Leave Accumulation </span>
              {formData.threshold_enabled && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1">Leave Accumulation Value</label>
                  <input
                    type="text"
                    name="threshold_value"
                    value={formData.threshold_value}
                    onBeforeInput={preventBeforeInput}
                    onInput={(e) => { sanitizeNumberInput(e); }}
                    onKeyDown={preventBadChars}
                    onPaste={(e) => { const text = (e.clipboardData || window.clipboardData).getData('text'); if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault(); }}
                    inputMode="decimal"
                    step="any"
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Enter Threshold Value"
                  />
                </div>
              )}
            </div>

            <div>
              <input type="checkbox" name="document_required" checked={formData.document_required} onChange={handleChange} className="mr-2" />
              <span className="text-lg font-medium">Enable Document</span>
              {formData.document_required && (
                <div className="mt-2">
                  <label className="block text-sm font-medium mb-1"> No. of Leaves </label>
                  <input
                    type="text"
                    name="document_threshold"
                    value={formData.document_threshold}
                    onBeforeInput={preventBeforeInput}
                    onInput={(e) => { sanitizeNumberInput(e); }}
                    onKeyDown={preventBadChars}
                    onPaste={(e) => { const text = (e.clipboardData || window.clipboardData).getData('text'); if (!/^[0-9]*\.?[0-9]*$/.test(text)) e.preventDefault(); }}
                    inputMode="decimal"
                    step="any"
                    className="w-full border border-gray-300 rounded-md p-2"
                    placeholder="Enter Document Value"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400" > Cancel </button>
            <button type="submit" disabled={isSubmitting} className={`px-4 py-2 rounded text-white ${isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`} > {isSubmitting ? 'Submitting...' : 'Save Policy'} </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default PolicyModal;