import { useState } from "react";

const DocumentsTable = ({ documents, onViewDocument, loading }) => {
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);

  const handleShowReason = (doc) => {
    setSelectedReason({
      reason: doc.reason || "No reason provided",
      action: doc.action,
      status: doc.publish_id,
    });
    setShowReasonModal(true);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading documents...</p>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No documents found for this user.</p>
      </div>
    );
  }

  return (
    <>
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reference No.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document Type.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Allowed Document Type.
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc, index) => {
            const fileName =
              doc.path?.split("/").pop() || `Document ${index + 1}`;
            const docId = `DOC-${String(index + 1).padStart(3, "0")}`;
            const docNo = `PN-2024-${String(index + 1).padStart(3, "0")}`;

            return (
              <tr
                key={index}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() =>
                  onViewDocument({
                    ...doc,
                    id: docId,
                    docNo: docNo,
                    fileName: fileName,
                    index: index,
                  })
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-blue-600 font-medium">
                    {doc.document_id}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                  {fileName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {doc.reference_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {doc.doctype_name || "General Document"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {doc.allow_doc_name || "General Document"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {doc.created_at
                    ? new Date(doc.created_at).toISOString().split("T")[0]
                    : "2024-01-15"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      (doc.action || '').toUpperCase() === 'APPROVED'
                        ? "bg-green-100 text-green-800"
                        : (doc.action || '').toUpperCase() === 'REJECTED'
                        ? "bg-red-100 text-red-800"
                        : (doc.action || '').toUpperCase() === 'RESUBMITTED'
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {(doc.action || 'OPEN').toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowReason(doc);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                    title="View Reason"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showReasonModal && selectedReason && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-md">
            <div className="bg-white px-6 py-4 flex justify-between items-center border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Reason for {selectedReason.action}
              </h2>
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedReason(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    (selectedReason.action || '').toUpperCase() === 'APPROVED'
                      ? "bg-green-100 text-green-800"
                      : (selectedReason.action || '').toUpperCase() === 'REJECTED'
                      ? "bg-red-100 text-red-800"
                      : (selectedReason.action || '').toUpperCase() === 'RESUBMITTED'
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {(selectedReason.action || 'OPEN').toUpperCase()}
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{selectedReason.reason}</p>
              </div>
            </div>
            <div className="bg-white px-6 py-4 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setSelectedReason(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-md text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentsTable;
