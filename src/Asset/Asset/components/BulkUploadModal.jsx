import React from "react";
import Select from "react-select";

const BulkUploadModal = ({
  isOpen,
  onClose,
  bulkCategory,
  setBulkCategory,
  setBulkFile,
  isUploading,
  handleBulkUploadSubmit,
  categories,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 p-6 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            Bulk Upload Assets
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700"
          >
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

        <form onSubmit={handleBulkUploadSubmit} className="space-y-4">
          {/* Category Dropdown */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Select Asset Category
            </label>
            <Select
              isSearchable
              placeholder="Select Category"
              value={
                bulkCategory
                  ? {
                      value: bulkCategory,
                      label:
                        categories.find(
                          (cat) => cat.categoryId === bulkCategory
                        )?.categoriesname || "Select Category",
                    }
                  : null
              }
              onChange={(option) => setBulkCategory(option?.value)}
              options={categories
                .filter((cat) => cat.categoriesname !== "All Assets")
                .map((cat) => ({
                  value: cat.categoryId,
                  label: cat.categoriesname,
                }))}
              className="rounded"
              classNamePrefix="react-select"
            />
          </div>

          {/* File Upload */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1">
              Upload Excel File
            </label>
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={(e) => setBulkFile(e.target.files[0])}
              className="p-2 border rounded"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isUploading}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              isUploading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </form>

        {/* Loader Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mb-3"></div>
            <p className="text-gray-700 font-medium">Processing your file...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadModal;
