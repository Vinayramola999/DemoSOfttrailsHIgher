import React from "react";
import Select from "react-select";

const ApprovalGroup = ({
  label,
  roleOptions,
  groups,
  setGroups,
  bypass,
  setBypass,
}) => {
  // Handle multiple role selection
  const handleRoleChange = (selectedOptions) => {
    const updatedGroups = selectedOptions
      ? selectedOptions.map((opt) => ({ role: opt }))
      : [];
    setGroups(updatedGroups);
  };

  return (
    <div className="flex items-center mb-4  ">
      {/* Label + Select */}
      <div className="w-full">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          {label}
        </label>
        <Select
          isMulti
          isDisabled={bypass}
          options={roleOptions}
          value={groups.map((g) => g.role).filter(Boolean)}
          onChange={handleRoleChange}
          placeholder="Select Role(s)"
          classNamePrefix="select"
          menuPortalTarget={document.body}
          styles={{
            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            control: (base) => ({
              ...base,
              borderColor: "#d1d5db",
              borderRadius: "6px",
              boxShadow: "none",
              minHeight: "38px",
              "&:hover": { borderColor: "#9ca3af" },
            }),
          }}
        />
      </div>

      {/* Bypass toggle */}
      <label className="ml-4 flex items-center mt-6">
        <input
          type="checkbox"
          checked={bypass}
          onChange={() => {
            const newVal = !bypass;
            setBypass(newVal);
            if (newVal) setGroups([{ role: { label: "Bypass", value: "bypass" } }]);
            else setGroups([]);
          }}
          className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <span className="text-sm text-gray-700 font-medium">Bypass</span>
      </label>
    </div>
  );
};

export default ApprovalGroup;
