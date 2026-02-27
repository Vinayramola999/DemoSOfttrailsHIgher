import React from "react";
import { X } from "react-feather";

const ViewGoalModal = ({ isOpen, onClose, goalData }) => {
  if (!isOpen || !goalData) return null;
  console.log("Goal Data in Modal:", goalData);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-[450px] relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center border-b pb-2">
          Annual Goal Details
        </h2>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between border-b py-1">
            <span className="font-semibold">Goal:</span>
            <span>{goalData.goal || "-"}</span>
            {/* <td className="px-5 py-4 text-left text-[14px] text-black">
                      {m.date
                      ? new Date(m.date).toLocaleDateString() : "-"}
                    </td> */}
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="font-semibold">KRA:</span>
            <span>{goalData.kra || "-"}</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="font-semibold">Year:</span>
            <span>{goalData.year ? goalData.year : "-"}</span>
          </div>

          <div className="flex justify-between border-b py-1">
            <span className="font-semibold">Weight:</span>
            <span>
              {goalData.weight !== undefined && goalData.weight !== null
                ? `${Math.round(goalData.weight)}%`
                : "-"}
            </span>
          </div>

          <div className="flex justify-between border-b py-1">
            <span className="font-semibold">Department:</span>
            <span>{goalData.department || "-"}</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="font-semibold">Sub Department:</span>
            <span>{goalData.vertical || "-"}</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="font-semibold">Remark:</span>
            <span>{goalData.remark || "-"}</span>
          </div>
          <div className="flex justify-between border-b py-1">
            <span className="font-semibold">Description:</span>
            <span>{goalData.description || "-"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewGoalModal;
