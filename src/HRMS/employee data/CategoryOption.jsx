import React from "react";
import { DeleteIcon } from "../../NewComponents/ReactIcons"; // ✅ FIXED (Named import)

const CategoryOption = (props) => {
  const { innerProps, data } = props;

  return (
    <div
      {...innerProps}
      className="flex justify-between items-center px-2 py-2 hover:bg-gray-100 cursor-pointer"
    >
      <span>{data.label}</span>

      <DeleteIcon className="text-red-500 cursor-pointer" onClick={(e) => { e.stopPropagation();  data.onDelete(data.value); }} />
    </div>
  );
};

export default CategoryOption;
