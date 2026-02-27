import Select from "react-select";

const AccessUserSelect = ({
  label = "Select User",
  options = [],
  value,
  onChange,
  isMulti = false,
  placeholder = "Search or select user...",
  width = "50%",
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center mt-5 ml-5 w-full sm:w-[${width}]`}>
      <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-0 sm:mr-4">
        {label}:
      </label>

      <div className="w-full sm:w-[60%]">
        <Select
          options={options}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          isSearchable
          isMulti={isMulti}
          classNamePrefix="react-select"
          styles={{
            control: (base) => ({
              ...base,
              borderRadius: "0.5rem",
              padding: "2px",
              borderColor: "#d1d5db",
              boxShadow: "none",
              "&:hover": { borderColor: "#2563eb" },
            }),
          }}
        />
      </div>
    </div>
  );
};

export default AccessUserSelect;
