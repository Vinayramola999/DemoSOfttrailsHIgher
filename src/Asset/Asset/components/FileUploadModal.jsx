import React from "react";

const FileUploadModal = ({
  isOpen,
  onClose,
  selectedFile,
  setSelectedFile,
  handleFileUpload,
  setFormData,
  fileFieldName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload File</h2>

        {/* File Input */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1">
            Select File
          </label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            className="p-2 rounded-lg border border-gray-300 w-full"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            className={`bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded disabled:opacity-50`}
            disabled={!selectedFile}
            onClick={async () => {
              if (selectedFile) {
                const uploadedUrl = await handleFileUpload(selectedFile);
                if (uploadedUrl) {
                  // Add uploaded file to formData
                  setFormData((prev) => ({
                    ...prev,
                    [fileFieldName]: { file: selectedFile, url: uploadedUrl },
                  }));
                  onClose();
                }
              }
            }}
          >
            Upload
          </button>

          <button
            className="bg-gray-500 hover:bg-gray-700 text-white py-2 px-4 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileUploadModal;
