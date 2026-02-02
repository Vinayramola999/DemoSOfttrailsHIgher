import React from "react";
import Select from "react-select";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Excel from "../../../assests/excel.png";
import { HiUpload } from "react-icons/hi";

const AssetFormModal = ({
  isOpen,
  onClose,
  editingAssetId,
  selectedCategory,
  categories,
  filteredDynamicFields,
  formData,
  formErrors,
  dates,
  handleChange,
  handleDateChange,
  handleSubmit,
  handleApproval,
  handleDownloadTemplate,
  setShowBulkUploadModal,
  setFileFieldName,
  setIsFileModalOpen,
  handleFileUpload,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 ">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2">
        {/* Header */}
        <div className="flex justify-between items-center bg-gray-100 p-4 rounded-t-lg">
          <h2 className="text-lg font-bold text-gray-800">
            {editingAssetId ? "Edit Asset" : "Add Asset"}
          </h2>

          <div className="flex items-center space-x-3">
            {/* Bulk Upload Button */}
            {!editingAssetId && (
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                title="Bulk Upload"
              >
                <HiUpload className="text-xl" />
                Bulk Upload
              </button>
            )}
          {!editingAssetId &&
  (formData.category || selectedCategory) &&
  (formData.category || selectedCategory) !== "All Assets" &&
  filteredDynamicFields.length > 0 && (
    <div className="relative group">
      <button
        type="button"
        onClick={handleDownloadTemplate}
        className="p-2 bg-white border border-gray-300 rounded-full hover:shadow-md hover:bg-gray-100 transition-all duration-300 flex items-center justify-center"
        title="Download Excel Template"
      >
        <img src={Excel} alt="Excel Icon" className="w-8 h-8" />
      </button>

      <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white border border-gray-300 shadow-lg rounded-md px-3 py-2 text-sm text-gray-800 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        📥 Download Excel based on selected category
      </div>
    </div>
)}


            <button onClick={onClose} className="text-red-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {/* Asset Category Selection */}
          <div className="flex flex-col">
            <label
              htmlFor="category"
              className="mb-1 text-sm font-medium text-gray-700"
            >
              Asset Category
            </label>
            <Select
              isSearchable
              placeholder="Select Asset Category"
              name="category"
              value={
                formData.category || (selectedCategory !== "All Assets" ? selectedCategory : null)
                  ? {
                      value: formData.category || (selectedCategory !== "All Assets" ? selectedCategory : ""),
                      label:
                        categories.find(
                          (cat) => cat.categoriesname === (formData.category || (selectedCategory !== "All Assets" ? selectedCategory : ""))
                        )?.categoriesname || (formData.category || (selectedCategory !== "All Assets" ? selectedCategory : "")),
                    }
                  : null
              }
              onChange={(option) =>
                handleChange({
                  target: { name: "category", value: option.value },
                })
              }
              options={categories
                .filter((cat) => cat.categoriesname !== "All Assets") // Exclude "All Assets" from form dropdown
                .map((cat) => ({
                  value: cat.categoriesname,
                  label: cat.categoriesname,
                }))}
              className="react-select-container"
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  backgroundColor: "#F0F0F0",
                  borderColor: "#D1D5DB", // Tailwind's gray-300
                  boxShadow: "none",
                  "&:hover": {
                    borderColor: "#6366F1", // Tailwind's indigo-500
                  },
                }),
              }}
            />
          </div>

          {/* Dynamic Fields */}
          {(editingAssetId || (selectedCategory !== "All Assets") || formData.category) && filteredDynamicFields
            .filter(
              (column) =>
                ![
                  "unique_id",
                  "category_id",
                  "status",
                  "stages",
                  "created_at",
                  "id",
                  "sub_stages",
                  "toapprove",
                  "categoryName"
                ].includes(column.columnName)
            )
            .map((field, index) => (
              <div key={index} className="flex flex-col">
                {/* Label with Conditional Text */}
                <label
                  htmlFor={field.columnName}
                  className="mb-1 text-sm font-medium text-gray-700"
                >
                  {field.columnName === "Useful Life" &&
                    "Useful Life (in months)"}
                  {field.columnName === "Scrap Value" &&
                    "Scrap Value (in Rupees)"}
                  {field.columnName === "Original Cost" &&
                    "Original Cost (in Rupees)"}
                  {![
                    "Useful Life",
                    "Scrap Value",
                    "Original Cost",
                  ].includes(field.columnName) && field.columnName}
                  {field.isNullable === false && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>

                {/* Render Date Picker for Date Fields */}
                {field.dataType === "date" ? (
                  <ReactDatePicker
                    selected={dates[field.columnName] || null}
                    onChange={(date) =>
                      handleDateChange(date, field.columnName)
                    }
                    dateFormat="yyyy-MM-dd"
                    className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0] w-full"
                    placeholderText="YYYY-MM-DD"
                  />
                ) : field.dataType === "file" || field.dataType === "json" ? (
                  <div className="flex flex-col">
                    <input
                      type="file"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const url = await handleFileUpload(file);
                          if (url) {
                            // Backend expects a stringified JSON object with a 'url' key
                            const valueToSend = JSON.stringify({ url: url });
                            handleChange({
                              target: { name: field.columnName, value: valueToSend },
                            });
                          }
                        }
                      }}
                      className="p-2 rounded border border-gray-300 bg-[#F0F0F0] w-full text-sm"
                    />
                    {formData[field.columnName] && (
                      <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded-md flex items-center gap-2">
                        <span className="text-xl">📄</span>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Current File</span>
                          <a
                            href={(() => {
                              const val = formData[field.columnName];
                              try {
                                if (typeof val === "string" && val.trim().startsWith("{")) {
                                  const parsed = JSON.parse(val);
                                  return parsed.url || "#";
                                }
                                return (typeof val === "object" && val) ? val.url : val;
                              } catch (e) {
                                return typeof val === "string" ? val : "#";
                              }
                            })()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-700 font-medium hover:underline truncate"
                            title="Click to view file"
                          >
                            {(() => {
                               const val = formData[field.columnName];
                               let url = "";
                               try {
                                 if (typeof val === "string" && val.trim().startsWith("{")) {
                                   url = JSON.parse(val).url;
                                 } else {
                                   url = (typeof val === "object" && val) ? val.url : val;
                                 }
                               } catch(e) { url = val; }
                               
                               if (!url) return "View File";
                               const filename = url.split("/").pop();
                               return decodeURIComponent(filename);
                            })()}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : ["Scrap Value", "Original Cost"].includes(
                    field.columnName
                  ) ? (
                  // ₹ Input field for Scrap Value and Original Cost
                  <div className="flex items-center border border-gray-300 rounded bg-[#F0F0F0]">
                    <span className="px-2 text-gray-600">₹</span>
                    <input
                      type="number"
                      name={field.columnName}
                      value={formData[field.columnName] || ""}
                      onChange={handleChange}
                      min="0"
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault(); // prevent negative and exponential
                        }
                      }}
                      className="p-2 bg-[#F0F0F0] w-full focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                ) : (
                  // Standard text input
                  <input
                    type="text"
                    name={field.columnName}
                    value={formData[field.columnName] || ""}
                    onChange={handleChange}
                    className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0] w-full"
                  />
                )}

                {/* Validation Errors */}
                {formErrors[field.columnName] && (
                  <span className="text-red-600 text-sm">
                    {formErrors[field.columnName]}
                  </span>
                )}
              </div>
            ))}

          {/* Show General Error */}
          {formErrors.general && (
            <p className="text-red-600 text-sm">{formErrors.general}</p>
          )}

          {/* Submit Buttons */}
          <div className="col-span-3 flex justify-end mt-4">
            {formData.stages !== "AwaitingApproval" && (
              <>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded mr-2"
                >
                  {editingAssetId ? "Update Asset" : "Add Asset"}
                </button>

                {editingAssetId && (
                  <button
                    type="button"
                    onClick={() => {
                      handleApproval(editingAssetId);
                      onClose();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                  >
                    Submit For Approval
                  </button>
                )}
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetFormModal;
