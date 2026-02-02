import { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { X } from "lucide-react";
import { updateMapping } from "../service/Setup";
import FormatDropdown from "./FormatDropdown";
import data from "./FormatsData";

const RelationTable = ({
  services,
  handleDelete,
  visibility,
  serviceOptions,
  doctypeOptions,
  allowedDocsOptions,
  onUpdate,
}) => {
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editTargetId, setEditTargetId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [confirmUpdate, setConfirmUpdate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const token = sessionStorage.getItem("token");

  const rowsPerPage = 8;
  const totalPages = Math.ceil(services.length / rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [services.length]);

  const paginatedServices = services.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getServiceName = (id) =>
    serviceOptions.find((s) => s.id === parseInt(id))?.name ?? "N/A";
  const getDoctypeName = (id) =>
    doctypeOptions.find((d) => d.id === parseInt(id))?.doctype ?? "N/A";
  const getAllowedDocName = (id) =>
    allowedDocsOptions.find((a) => a.id === parseInt(id))?.doc_name ?? "N/A";

  return (
    <div className="flex flex-col h-[607px] bg-white rounded-md">
      <div className="overflow-auto flex-grow">
        <table className="min-w-full text-sm">
          <thead className="text-black font-medium border-b border-black">
            <tr className="h-16">
              <th className="px-4 py-4 text-left">S. No.</th>
              <th className="px-4 py-4 text-left">Service</th>
              <th className="px-4 py-4 text-left">Document type</th>
              <th className="px-4 py-4 text-left">Allowed document</th>
              <th className="px-4 py-4 text-left">Allowed file type</th>
              <th className="px-4 py-4 text-left">Allowed size</th>
              <th className="px-4 py-4 text-left">Date</th>
              <th className="px-4 py-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-3" />
            {paginatedServices.length > 0 ? (
              paginatedServices.map((service, idx) => (
                <tr
                  key={service.id}
                  className="hover:bg-gray-50 transition border-b odd:bg-white even:bg-blue-100 h-14"
                >
                  <td className="px-4 py-3">
                    {(currentPage - 1) * rowsPerPage + idx + 1}.
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-600">
                    {getServiceName(service.service_id)}
                  </td>
                  <td className="px-4 py-3">
                    {getDoctypeName(service.doctype_id)}
                  </td>
                  <td className="px-4 py-3">
                    {getAllowedDocName(service.allow_doc_id)}
                  </td>
                  <td className="px-4 py-3 overflow-x-auto max-w-40">
                    {service.format + ", "}
                  </td>
                  <td className="px-4 py-3">{service.allowed_size}</td>
                  <td className="px-4 py-3">
                    {service.created_at.split("T")[0]}
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    {/* <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditTargetId(service.id);
                        setEditFormData({
                          allowed_size: service.allowed_size,
                          format: Array.isArray(service.format)
                            ? service.format
                            : service.format
                            ? [service.format]
                            : [],
                          visibility: service.visibility,
                          approval_needed: service.approval_needed,
                        });
                      }}
                    >
                      <div className="text-xl text-blue-600">
                        <FaEdit />
                      </div>
                    </button>
                    {editTargetId === service.id && (
                      <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded w-3/4 max-w-4xl relative border border-black">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">
                              Edit Service Details
                            </h2>
                            <button
                              className="text-gray-400 hover:text-white hover:bg-red-500 p-2 rounded-full transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTargetId(null);
                              }}
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>

                          <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Service
                                </label>
                                <div className="border p-2 rounded h-10 w-full bg-gray-50 text-gray-600 flex items-center cursor-not-allowed">
                                  {getServiceName(service.service_id)}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Doctype
                                </label>
                                <div className="border p-2 rounded h-10 w-full bg-gray-50 text-gray-600 flex items-center cursor-not-allowed">
                                  {getDoctypeName(service.doctype_id)}
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Allowed Document
                                </label>
                                <div className="border p-2 rounded h-10 w-full bg-gray-50 text-gray-600 flex items-center cursor-not-allowed">
                                  {getAllowedDocName(service.allow_doc_id)}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Allowed Size
                                </label>
                                <input
                                  type="number"
                                  className="border p-2 pr-12 rounded h-10 w-full placeholder:text-black border-gray-300"
                                  value={editFormData.allowed_size ?? ""}
                                  onChange={(e) =>
                                    setEditFormData({
                                      ...editFormData,
                                      allowed_size: e.target.value,
                                    })
                                  }
                                />
                                <span className="absolute right-3 top-[70%] transform -translate-y-1/2 text-gray-500 text-sm">
                                  MB
                                </span>
                              </div>
                              <div className="">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Format
                                </label>
                                <div className="w-full flex flex-wrap">
                                  <FormatDropdown
                                    key={editTargetId}
                                    formats={data.fileFormats}
                                    initialSelected={editFormData.format}
                                    onChange={(selected) =>
                                      setEditFormData({
                                        ...editFormData,
                                        format: selected,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
                                  <label className="text-sm font-medium text-gray-800">
                                    User Preview
                                  </label>
                                  <input
                                    type="checkbox"
                                    checked={editFormData.visibility ?? false}
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        visibility: e.target.checked,
                                      })
                                    }
                                    className="toggle-checkbox w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                </div>

                                <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
                                  <label className="text-sm font-medium text-gray-800">
                                    Document Approval
                                  </label>
                                  <input
                                    type="checkbox"
                                    checked={
                                      editFormData.approval_needed ?? false
                                    }
                                    onChange={(e) =>
                                      setEditFormData({
                                        ...editFormData,
                                        approval_needed: e.target.checked,
                                      })
                                    }
                                    className="toggle-checkbox w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                                  />
                                </div>
                              </div>
                              <div>
                                {editFormData.format &&
                                  editFormData.format.length > 0 && (
                                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                      <label className="block text-sm font-medium text-blue-800 mb-2">
                                        Selected Formats:
                                      </label>
                                      <div className="flex flex-wrap gap-2">
                                        {editFormData.format.map(
                                          (format, index) => (
                                            <span
                                              key={index}
                                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                            >
                                              {format}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmUpdate(true);
                              }}
                            >
                              Save
                            </button>
                            <button
                              className="border px-6 py-2 rounded hover:bg-red-500 hover:text-white"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditTargetId(null);
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                          {confirmUpdate && (
                            <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
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
                                  Update Mapping?
                                </h1>
                                <p className="text-xl text-gray-700 pb-8 text-center">
                                  Are you sure you want to update mapping
                                  details?
                                </p>
                                <div className="buttons gap-4 flex justify-center pt-6 w-full">
                                  <button
                                    className="border border-black hover:bg-red-500 hover:text-white text-black px-6 py-2 rounded-md text-lg w-1/2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmUpdate(false);
                                    }}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-lg w-1/2"
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      try {
                                        const payload = {
                                          format: editFormData.format,
                                          allowed_size: parseInt(
                                            editFormData.allowed_size
                                          ),
                                          visibility: editFormData.visibility,
                                          approval_needed:
                                            editFormData.approval_needed,
                                        };
                                        await updateMapping(
                                          service.id,
                                          payload,
                                          token
                                        );
                                        setEditTargetId(null);
                                        setConfirmUpdate(false);
                                        if (onUpdate) {
                                          onUpdate();
                                        }
                                      } catch (error) {
                                        alert(
                                          "Failed to update: " + error.message
                                        );
                                      }
                                    }}
                                  >
                                    Confirm
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )} */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteTargetId(service.id);
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
                          <h1 className="text-4xl py-6 text-red-700 font-bold">
                            Confirm Delete?
                          </h1>
                          <p className="text-xl text-gray-700 pb-6 text-center">
                            Are you sure you want to delete this service?
                          </p>
                          <div className="flex gap-4 justify-center pt-4 w-full">
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
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="8"
                  className="text-center py-4 text-gray-500 font-medium"
                >
                  No data available.
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
    </div>
  );
};

export default RelationTable;
