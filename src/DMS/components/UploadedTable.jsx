import { useState, useEffect } from "react";
import { X } from "lucide-react";

const UploadTable = ({ docs, handleDelete }) => {
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [approvalPopupData, setApprovalPopupData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 8;
  const totalPages = Math.ceil(docs.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [docs.length]);

  const paginatedDocs = docs.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex flex-col h-[606px] bg-white rounded-md">
      <div className="overflow-auto flex-grow">
        <table className="min-w-full text-sm">
          <thead className="text-black font-medium border-b border-black">
            <tr className="h-16">
              <th className="px-4 py-4 text-left">S. No.</th>
              <th className="px-4 py-4 text-left">Service</th>
              <th className="px-4 py-4 text-left">Document Type</th>
              <th className="px-4 py-4 text-left">Allowed DocType</th>
              <th className="px-4 py-4 text-left">Upload Date</th>
              <th className="px-4 py-4 text-left">Uploaded By</th>
              <th className="px-4 py-4 text-left">File</th>
              {/* <th className="px-4 py-4 text-left">Visibility</th>
              <th className="px-4 py-4 text-left">Approval</th> */}
              <th className="px-4 py-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-3"></tr>
            {paginatedDocs.length > 0 ? (
              paginatedDocs.map((doc, index) => (
                <tr
                  key={doc.document_id}
                  className="hover:bg-gray-50 transition border-b odd:bg-white even:bg-blue-100 h-14"
                >
                  <td className="px-4 py-3">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-600">
                    {doc.service.name}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-600">
                    {doc.document_type.name}
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-600">
                    {doc.allowed_doc.name}
                  </td>
                  <td className="px-4 py-3">{doc.uploaded_at.split("T")[0]}</td>
                  <td className="px-4 py-3">{doc.uploaded_by.name}</td>

                  <td className="px-4 py-3">
                    <a
                      onClick={(e) => {
                        e.preventDefault();
                        setPreviewDoc(doc);
                      }}
                      href={doc.document_url}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      {doc.document_name}
                    </a>
                  </td>
                  {/* <td className="px-4 py-3">
                    <p
                      className={`${
                        doc.visibility ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {doc.visibility ? "Public" : "Private"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p
                      className={`${
                        doc.approval_needed ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {doc.approval_needed ? (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setApprovalPopupData(doc.approval);
                          }}
                          className="text-sm text-blue-600 hover:underline mt-1"
                        >
                          <p>Yes</p>
                        </button>
                      ) : (
                        "No"
                      )}
                    </p>
                  </td> */}
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteTargetId(doc.document_id);
                      }}
                    >
                      <svg
                        width="16"
                        height="18"
                        viewBox="0 0 16 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.6667 3.16406C14.8877 3.16406 15.0996 3.25186 15.2559 3.40814C15.4122 3.56442 15.5 3.77638 15.5 3.9974C15.5 4.21841 15.4122 4.43037 15.2559 4.58665C15.0996 4.74293 14.8877 4.83073 14.6667 4.83073H13.8333L13.8308 4.8899L13.0533 15.7824C13.0234 16.2029 12.8352 16.5964 12.5268 16.8837C12.2183 17.171 11.8124 17.3307 11.3908 17.3307H4.60833C4.18678 17.3307 3.78089 17.171 3.4724 16.8837C3.16392 16.5964 2.97576 16.2029 2.94583 15.7824L2.16833 4.89073L2.16667 4.83073H1.33333C1.11232 4.83073 0.900358 4.74293 0.744078 4.58665C0.587797 4.43037 0.5 4.21841 0.5 3.9974C0.5 3.77638 0.587797 3.56442 0.744078 3.40814C0.900358 3.25186 1.11232 3.16406 1.33333 3.16406H14.6667ZM9.66667 0.664062C9.88768 0.664063 10.0996 0.75186 10.2559 0.90814C10.4122 1.06442 10.5 1.27638 10.5 1.4974C10.5 1.71841 10.4122 1.93037 10.2559 2.08665C10.0996 2.24293 9.88768 2.33073 9.66667 2.33073H6.33333C6.11232 2.33073 5.90036 2.24293 5.74408 2.08665C5.5878 1.93037 5.5 1.71841 5.5 1.4974C5.5 1.27638 5.5878 1.06442 5.74408 0.90814C5.90036 0.75186 6.11232 0.664063 6.33333 0.664062H9.66667Z"
                          fill="#E33629"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-gray-500">
                  No documents found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 flex justify-center items-center gap-2 select-none py-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
        >
          &#x2039;
        </button>

        <button className="w-9 h-9 flex items-center justify-center rounded-md border bg-blue-600 text-white font-semibold">
          {currentPage}
        </button>

        <span className="text-sm font-medium text-gray-600">of</span>

        <button className="w-9 h-9 flex items-center justify-center rounded-md border text-blue-600 border-blue-500 font-semibold">
          {totalPages}
        </button>

        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
        >
          &#x203A;
        </button>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded w-[90%] h-[90%] relative">
            <button
              className="absolute -top-4 -right-4 text-black bg-gray-100 hover:text-white hover:bg-red-500 rounded-full p-2"
              onClick={() => setPreviewDoc(null)}
            >
              <X size={28} />
            </button>
            <iframe
              title={previewDoc.document_name}
              src={previewDoc.document_url}
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}

      {approvalPopupData && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-3xl w-max max-w-lg min-w-[400px] relative flex flex-col items-center border border-black shadow-lg">
            <h1 className="text-2xl py-4 text-blue-700 font-bold">
              Approval Status
            </h1>
            <div className="w-full text-left px-4">
              <p className="text-lg text-gray-800 mb-2">
                <strong>Action:</strong>{" "}
                <span
                  className={`font-normal text-md border px-2 py-1 rounded-full ${
                    approvalPopupData.action === "APPROVED"
                      ? "bg-green-500 text-white"
                      : approvalPopupData.action === "REJECTED"
                      ? "bg-red-500 text-white"
                      : approvalPopupData.action === "RESUBMITTED"
                      ? "bg-yellow-500 text-white"
                      : "bg-blue-100 text-black"
                  }`}
                >
                  {approvalPopupData.action || "N/A"}
                </span>
              </p>
              <p className="text-lg text-gray-800 mb-4 flex flex-col">
                <strong>Reason:</strong>
                <span className="font-normal">
                  {approvalPopupData.reason || "No reason provided"}
                </span>
              </p>
            </div>
            <div className="buttons gap-4 flex justify-center pt-2 w-full">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-lg"
                onClick={() => setApprovalPopupData(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTargetId && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-3xl w-max max-w-4xl relative flex flex-col items-center border border-black">
            <svg
              width="22"
              height="28"
              viewBox="0 0 22 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 24.5C2 26.15 3.35 27.5 5 27.5H17C18.65 27.5 20 26.15 20 24.5V9.5C20 7.85 18.65 6.5 17 6.5H5C3.35 6.5 2 7.85 2 9.5V24.5ZM20 2H16.25L15.185 0.935C14.915 0.665 14.525 0.5 14.135 0.5H7.865C7.475 0.5 7.085 0.665 6.815 0.935L5.75 2H2C1.175 2 0.5 2.675 0.5 3.5C0.5 4.325 1.175 5 2 5H20C20.825 5 21.5 4.325 21.5 3.5C21.5 2.675 20.825 2 20 2Z"
                fill="red"
              />
            </svg>
            <h1 className="text-4xl py-8 text-red-700 font-bold">
              Confirm Delete?
            </h1>
            <p className="text-xl text-gray-700 pb-8 text-center">
              Are you sure you want to delete this service?
            </p>
            <div className="buttons gap-4 flex justify-center pt-6 w-full">
              <button
                className="border border-black hover:bg-red-500 hover:text-white text-black px-6 py-2 rounded-md text-lg w-1/2"
                onClick={() => setDeleteTargetId(null)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-lg w-1/2"
                onClick={() => {
                  handleDelete(deleteTargetId);
                  setDeleteTargetId(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadTable;
