import { useState, useEffect } from "react";
import DocumentTable from "../components/DocumentQueueTable";
import SearchableDropdown from "../components/SearchableDropdown";
import { Upload, X } from "lucide-react";
import UploadTable from "../components/UploadedTable";
import MessageModal from "../components/MessageModal";
import {
  fetchMap,
  fetchServices,
  fetchDocTypes,
  fetchAllowed,
  fetchFormats,
  fetchDocuments,
  uploadDocuments,
  deleteDocument,
} from "../service/Upload";

const DocumentUpload = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [services, setServices] = useState([]);
  const [docTypes, setDocTypes] = useState([]);
  const [allowDocs, setAllowDocs] = useState([]);
  const [map, setMap] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState();
  const [selectedDocTypeId, setSelectedDocTypeId] = useState();
  const [selectedAllowedId, setSelectedAllowedId] = useState();
  const [folderName, setFolderName] = useState();
  const [queuedDocuments, setQueuedDocuments] = useState([]);
  const [publishId, setPublishId] = useState(null);
  const [success, setSuccess] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [includeDocTypeInSearch, setIncludeDocTypeInSearch] = useState(false);
  const [includeAllowedDocInSearch, setIncludeAllowedDocInSearch] =
    useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetchServices(token)
      .then(setServices)
      .catch(() => setServices([]));
    fetchDocuments(token)
      .then(setDocuments)
      .catch(() => setDocuments([]));
    fetchMap(token)
      .then(setMap)
      .catch(() => setMap([]));
  }, [token]);

  useEffect(() => {
    if (
      Array.isArray(map) &&
      map.length > 0 &&
      selectedServiceId &&
      selectedDocTypeId &&
      selectedAllowedId
    ) {
      const found = map.find(
        (item) =>
          item.service_id === selectedServiceId &&
          item.doctype_id === selectedDocTypeId &&
          item.allow_doc_id === selectedAllowedId
      );
      setPublishId(found ? found.id : null);
    }
  }, [map, selectedServiceId, selectedDocTypeId, selectedAllowedId]);

  const handleServiceChange = async (id) => {
    setSelectedServiceId(id);
    setSelectedDocTypeId(null);
    setSelectedAllowedId(null);
    setAllowDocs([]);
    setSelectedFormats([]);

    if (!id) {
      setDocTypes([]);
      return;
    }
    const types = await fetchDocTypes(token, id);
    setDocTypes(types);
  };

  const handleDocTypeChange = async (id) => {
    setSelectedDocTypeId(id);
    setSelectedAllowedId(null);
    setSelectedFormats([]);

    if (!id) {
      setAllowDocs([]);
      return;
    }
    const allowed = await fetchAllowed(token, selectedServiceId, id);
    setAllowDocs(allowed);
  };

  const handleAllowedChange = async (id) => {
    setSelectedAllowedId(id);
    if (!id) {
      setSelectedFormats([]);
      return;
    }
    const formats = await fetchFormats(
      token,
      selectedServiceId,
      selectedDocTypeId,
      id
    );
    setSelectedFormats(formats);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (
      !selectedServiceId ||
      !selectedDocTypeId ||
      !selectedAllowedId ||
      !file
    ) {
      alert("Please select all fields and upload a file.");
      return;
    }
    const found = Array.isArray(map)
      ? map.find(
          (item) =>
            item.service_id === selectedServiceId &&
            item.doctype_id === selectedDocTypeId &&
            item.allow_doc_id === selectedAllowedId
        )
      : null;
    if (!found) {
      alert("Mapping not found. Cannot validate file size.");
      return;
    }
    const allowedSizeMB = found.allowed_size;
    const maxSizeBytes = allowedSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      alert(
        `File size exceeds allowed limit of ${allowedSizeMB} MB for this document.`
      );
      return;
    }
    const selectedService = services.find(
      (s) => s.service_id === selectedServiceId
    );
    const selectedDocType = docTypes.find(
      (d) => d.doctype_id === selectedDocTypeId
    );
    const selectedAllowed = allowDocs.find(
      (a) => a.allow_doc_id === selectedAllowedId
    );
    const newDoc = {
      service: selectedService?.name || "",
      doctype: selectedDocType?.doctype || "",
      allowedDoc: selectedAllowed?.doc_name || "",
      file,
      metadata: {
        service: selectedService?.name || "",
        publish_id: found.id,
        user_id: sessionStorage.getItem("userId"),
        document_name: file.name,
      },
    };
    setQueuedDocuments((prev) => [...prev, newDoc]);
    e.target.value = "";
  };

  const handleRemoveQueued = (index) => {
    setQueuedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!queuedDocuments.length) {
      alert("Queue is empty.");
      return;
    }
    const formData = new FormData();
    queuedDocuments.forEach((doc) => {
      formData.append("documents", doc.file);
    });
    formData.append("ref", "DMS");
    const metadata = queuedDocuments.map((doc) => doc.metadata);
    formData.append("metadata", JSON.stringify(metadata));
    formData.append("custom_folder", folderName || "Default");
    try {
      await uploadDocuments(token, formData);
      setSuccess(true);
      setResponseMessage("Document(s) uploaded successfully!");
      resetModal();
      setIsModalOpen(false);
      setQueuedDocuments([]);
      setConfirm(false);
      fetchDocuments(token)
        .then(setDocuments)
        .catch(() => setDocuments([]));
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to upload document(s).";
      setResponseMessage(message);
      resetModal();
      setSuccess(false);
      setConfirm(false);
      console.error("Upload failed:", err);
    }
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await deleteDocument(token, id);
      fetchDocuments(token)
        .then(setDocuments)
        .catch(() => setDocuments([]));
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const resetModal = () => {
    setSelectedServiceId(null);
    setSelectedDocTypeId(null);
    setSelectedAllowedId(null);
    setDocTypes([]);
    setAllowDocs([]);
    setSelectedFormats([]);
    setQueuedDocuments([]);
    setFolderName("");
  };

  const selectedService = services.find(
    (service) => service.service_id === selectedServiceId
  );

  const filteredDocs = documents.filter((doc) => {
    const search = searchTerm.toLowerCase();

    const serviceMatch = doc.service.name.toLowerCase().includes(search);
    const docTypeMatch =
      includeDocTypeInSearch &&
      doc.document_type.name.toLowerCase().includes(search);
    const allowedDocMatch =
      includeAllowedDocInSearch &&
      doc.allowed_doc.name.toLowerCase().includes(search);

    const uploadedAt = new Date(doc.uploaded_at);
    const isAfterStart = startDate ? uploadedAt >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? uploadedAt <= new Date(endDate) : true;

    return (
      (serviceMatch || docTypeMatch || allowedDocMatch) &&
      isAfterStart &&
      isBeforeEnd
    );
  });

  return (
    <>
      <div className="bg-white p-6 rounded-md border border-gray-300 mb-6">
        <div className="flex">
          <h2 className="text-lg font-bold mb-4 text-blue-800">
            Document Upload
          </h2>
        </div>
        <button
          className="bg-blue-700 hover:bg-blue-600 w-60 text-white px-6 py-3 rounded-md text-sm"
          onClick={() => setIsModalOpen(true)}
        >
          + Add Document
        </button>
      </div>
      <div className="mb-4 flex justify-start items-center gap-4">
        <input
          type="text"
          placeholder="Search ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 placeholder:text-gray-500 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p>also search in: </p>
        <div className="flex items-center gap-2 ">
          <input
            type="checkbox"
            checked={includeDocTypeInSearch}
            onChange={() => setIncludeDocTypeInSearch((prev) => !prev)}
            title="Include Document Type in search"
          />
          <label>Document Type</label>
        </div>
        <div className="flex items-center gap-2 ">
          <input
            type="checkbox"
            checked={includeAllowedDocInSearch}
            onChange={() => setIncludeAllowedDocInSearch((prev) => !prev)}
            title="Include Allowed Document in search"
          />
          <label>Allowed Doctype</label>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="start-date" className="text-sm">
            From:
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="end-date" className="text-sm">
            To:
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          />
        </div>
        <button
          onClick={() => {
            setSearchTerm("");
            setIncludeDocTypeInSearch(false);
            setIncludeAllowedDocInSearch(false);
            setStartDate("");
            setEndDate("");
          }}
          className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-700"
        >
          Clear Filters
        </button>
      </div>
      <div className="rounded-md bg-white">
        <div className="w-full">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <UploadTable docs={filteredDocs} handleDelete={handleDelete} />
          </div>

          {isModalOpen && (
            <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-black">
                <div className="sticky top-0 bg-white px-6 py-4 rounded-t-xl z-50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Add New Document
                    </h2>
                    <button
                      className="text-gray-400 hover:text-white hover:bg-red-500 p-2 rounded-full transition-colors"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetModal();
                      }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setConfirm(true);
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Service *
                        </label>
                        <SearchableDropdown
                          options={services}
                          placeholder="select service"
                          onSelect={(option) => {
                            handleServiceChange(option?.service_id);
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Document Type *
                        </label>
                        <SearchableDropdown
                          key={selectedServiceId}
                          options={docTypes}
                          placeholder="select doctypes"
                          onSelect={(option) => {
                            handleDocTypeChange(option?.doctype_id);
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Allowed Documents *
                        </label>
                        <SearchableDropdown
                          key={selectedDocTypeId}
                          options={allowDocs}
                          placeholder="select allowed docs"
                          onSelect={(option) => {
                            handleAllowedChange(option?.allow_doc_id);
                          }}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload File *
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer border border-gray-300 rounded p-2"
                            onChange={handleFileChange}
                            accept={
                              selectedFormats.length > 0
                                ? selectedFormats
                                    .map((f) => `.${f.toLowerCase()}`)
                                    .join(",")
                                : undefined
                            }
                          />
                        </div>
                      </div>
                      {selectedFormats.length > 0 && (
                        <div className="mb-6 p-4 bg-blue-50 rounded border border-blue-200">
                          <label className="block text-sm font-medium text-blue-800 mb-2">
                            Supported Formats:
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {selectedFormats.map((format, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-200 text-blue-800"
                              >
                                {format}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mb-6 grid grid-cols-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          .../Higher/{selectedService?.name || "service name"}/
                          {folderName || "Default"}
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 px-4 py-2 pr-10 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black cursor-pointer"
                          placeholder="Enter folder name"
                          onChange={(e) => setFolderName(e.target.value)}
                          value={folderName}
                        />
                      </div>
                    </div>

                    <DocumentTable
                      documents={queuedDocuments}
                      onRemove={handleRemoveQueued}
                    />

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                      <button
                        className="px-6 py-2.5 text-black hover:bg-red-500 hover:text-white rounded font-medium transition-colors"
                        onClick={() => {
                          setIsModalOpen(false);
                          resetModal();
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={queuedDocuments.length === 0}
                        className="px-6 py-2.5 bg-blue-500 hover:bg-blue-700 text-white rounded font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Upload{" "}
                        {queuedDocuments.length > 0 &&
                          `(${queuedDocuments.length})`}
                      </button>
                    </div>
                  </form>
                  {confirm && (
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
                          Add Document?
                        </h1>
                        <p className="text-xl text-gray-700 pb-8 text-center">
                          Are you sure you want to add document?
                        </p>
                        <div className="buttons gap-4 flex justify-center pt-6 w-full">
                          <button
                            className="border border-black hover:bg-red-500 hover:text-white text-black px-6 py-2 rounded-md text-lg w-1/2"
                            type="submit"
                            onClick={() => {
                              setConfirm(false);
                            }}
                          >
                            cancel
                          </button>
                          <button
                            className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-lg w-1/2"
                            onClick={handleSubmit}
                          >
                            confirm
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {success !== null && (
        <MessageModal
          type={success ? "success" : "error"}
          message={
            success ? "Service added successfully!" : "Failed to add service."
          }
          onClose={() => setSuccess(null)}
        />
      )}
    </>
  );
};

export default DocumentUpload;
