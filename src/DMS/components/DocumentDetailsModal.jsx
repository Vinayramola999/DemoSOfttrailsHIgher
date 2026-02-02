import { useState } from "react";
import { updateDocumentAction } from "../service/approval";

const DocumentDetailsModal = ({ isOpen, onClose, document, onUpdate }) => {
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState("");
  const [reason, setReason] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  if (!isOpen || !document) return null;

  const handleApprove = () => {
    setActionType("Approval");
    setShowActionModal(true);
  };

  const handleReject = () => {
    setActionType("Reject");
    setShowActionModal(true);
  };

  const handleResubmit = () => {
    setActionType("Resubmit");
    setShowActionModal(true);
  };

  const executeAction = async () => {
    let apiAction = "";
    if (actionType === "Approval") apiAction = "APPROVED";
    else if (actionType === "Reject") apiAction = "REJECTED";
    else if (actionType === "Resubmit") apiAction = "RESUBMITTED";
    const token = sessionStorage.getItem("token");

    try {
      await updateDocumentAction(
        token,
        document.document_id,
        apiAction,
        reason
      );
      console.log(`${actionType} document:`, document.id, "Reason:", reason);
      setShowActionModal(false);
      setShowConfirmModal(false);
      setReason("");
      onUpdate && onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating action:", error);
    }
  };

  const handleCancelAction = () => {
    setShowActionModal(false);
    setReason("");
  };

  const handleConfirmAction = () => {
    setShowConfirmModal(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
      <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-6xl h-[90vh] flex flex-col">
        <div className="bg-white px-6 py-4 flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Document Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {!showActionModal ? (
          <>
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-4 gap-6 mb-2">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Document ID:
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {document.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Document No.:
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {document.docNo}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Document Name:
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {document.fileName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Date:
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {document.created_at
                      ? new Date(document.created_at)
                          .toISOString()
                          .split("T")[0]
                      : "2024-01-15"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-2">
                <div className="bg-gray-50 rounded-lg h-[640px]">
                  {document.path ? (
                    <iframe
                      src={document.path}
                      className="w-full h-full border-0 rounded"
                      title="Document Viewer"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>
                        This is a sample document content area. In a real
                        application, this would display the actual document
                        content, attachments, or embedded document viewer.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={handleApprove}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-md font-medium"
              >
                Approve
              </button>
              <button
                onClick={handleReject}
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-md font-medium"
              >
                Reject
              </button>
              <button
                onClick={handleResubmit}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2 rounded-md font-medium"
              >
                Resubmit
              </button>
            </div>
          </>
         ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Document ID:
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {document.id}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Document No.:
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {document.docNo}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Document Name:
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {document.fileName}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Date:
                  </label>
                  <p className="text-base font-semibold text-gray-900">
                    {document.created_at
                      ? new Date(document.created_at)
                          .toISOString()
                          .split("T")[0]
                      : "2024-01-15"}
                  </p>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-sm text-gray-700 mb-2">
                  Reason for {actionType} :
                </h3>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={`Enter reason for ${actionType.toLowerCase()}...`}
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="bg-white px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={handleCancelAction}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-8 py-2 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`px-8 py-2 rounded-md font-medium text-white ${
                  actionType === "Approval"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : actionType === "Reject"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-yellow-500 hover:bg-yellow-600"
                }`}
              >
                Submit {actionType}
              </button>
            </div>
            {showConfirmModal && (
              <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-[70]">
                <div className="bg-white p-6 rounded-3xl w-max max-w-4xl relative flex flex-col items-center border border-black">
                  <svg
                    width="61"
                    height="61"
                    viewBox="0 0 61 61"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M30.5 0.3125C38.5062 0.3125 46.1845 3.49296 51.8458 9.15421C57.507 14.8155 60.6875 22.4938 60.6875 30.5C60.6875 38.5062 57.507 46.1845 51.8458 51.8458C46.1845 57.507 38.5062 60.6875 30.5 60.6875C22.4938 60.6875 14.8155 57.507 9.15421 51.8458C3.49296 46.1845 0.3125 38.5062 0.3125 30.5C0.3125 22.4938 3.49296 14.8155 9.15421 9.15421C14.8155 3.49296 22.4938 0.3125 30.5 0.3125ZM32.0999 13.2155C28.5896 13.2155 25.8382 14.2117 23.7984 16.2041C21.7111 18.1964 20.7149 20.9478 20.7149 24.4582H26.1228C26.1228 22.4658 26.5023 20.9004 27.3088 19.8093C28.2101 18.4811 29.6806 17.8644 31.7679 17.8644C33.3807 17.8644 34.6616 18.2913 35.5629 19.1926C36.4167 20.0939 36.8911 21.3273 36.8911 22.8927C36.8911 24.0787 36.4642 25.2172 35.6103 26.2608L35.0411 26.9249C31.9576 29.6763 30.1076 31.6687 29.4909 32.9495C28.8267 34.2303 28.5421 35.7957 28.5421 37.5984V38.2625H33.9974V37.5984C33.9974 36.4599 34.2346 35.4637 34.709 34.5149C35.1359 33.6611 35.7526 32.8546 36.6065 32.1431C38.8835 30.1507 40.2592 28.8699 40.6861 28.3955C41.8246 26.8775 42.4413 24.9326 42.4413 22.5607C42.4413 19.667 41.4926 17.39 39.5951 15.7297C37.6976 14.0219 35.1834 13.2155 32.0999 13.2155ZM31.2461 40.5869C30.2788 40.5607 29.3406 40.919 28.637 41.5831C28.2896 41.9103 28.0166 42.3084 27.8365 42.7504C27.6564 43.1924 27.5735 43.6679 27.5934 44.1447C27.5934 45.1884 27.9254 46.0423 28.637 46.7064C29.3354 47.3842 30.2729 47.7592 31.2461 47.75C32.2897 47.75 33.1436 47.4179 33.8551 46.7538C34.2099 46.4198 34.4904 46.0149 34.6784 45.5654C34.8664 45.1159 34.9576 44.6319 34.9462 44.1447C34.9553 43.6693 34.8674 43.1969 34.688 42.7565C34.5086 42.3161 34.2413 41.9169 33.9026 41.5831C33.1806 40.9178 32.2275 40.5604 31.2461 40.5869Z"
                      fill="#005AE6"
                    />
                  </svg>
                  <h1 className="text-4xl py-8 text-blue-700 font-bold">
                    {actionType} Document?
                  </h1>
                  <p className="text-xl text-gray-700 pb-8 text-center">
                    Are you sure you want to {actionType.toLowerCase()} this
                    document?
                  </p>
                  <div className="buttons gap-4 flex justify-center pt-6 w-full">
                    <button
                      className="border border-black hover:bg-red-500 hover:text-white text-black px-6 py-2 rounded-md text-lg w-1/2"
                      onClick={() => setShowConfirmModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-lg w-1/2"
                      onClick={executeAction}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DocumentDetailsModal;
