import { useState, useEffect } from "react";
import SearchableDropdown from "../components/SearchableDropdown";
import FormatDropdown from "../components/FormatDropdown";
import data from "../components/FormatsData";
import RelationTable from "../components/RelationTable";
import { X } from "lucide-react";
import MessageModal from "../components/MessageModal";
import {
  fetchServices,
  fetchDoctypes,
  fetchAllowedDocs,
  fetchMap,
  addMapping,
  deleteMapping,
  updateMappingVisibility,
} from "../service/Setup";

const ServiceDocsRelation = () => {
  const [formData, setFormData] = useState({
    format: [],
    size: 0,
    visibility: true,
    approval: false,
    status: "",
    review: "",
  });
  const [map, setMap] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [serviceOptions, setServiceOptions] = useState([]);
  const [doctypeOptions, setDoctypeOptions] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedDoctypeId, setSelectedDoctypeId] = useState("");
  const [selectedAllowedId, setSelectedAllowedId] = useState("");
  const [allowedDocsOptions, setAllowedDocsOptions] = useState([]);
  const [selectedFormats, setSelectedFormats] = useState([]);
  const [success, setSuccess] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    handleFetchMap();
    handleFetchServiceOptions();
    handleFetchDoctypeOptions();
    handleFetchAllowedDocsOptions();
  }, []);

  const handleFetchServiceOptions = async () => {
    try {
      const data = await fetchServices(token);
      setServiceOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      setServiceOptions([]);
    }
  };

  const handleFetchDoctypeOptions = async () => {
    try {
      const data = await fetchDoctypes(token);
      setDoctypeOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      setDoctypeOptions([]);
    }
  };

  const handleFetchAllowedDocsOptions = async () => {
    try {
      const data = await fetchAllowedDocs(token);
      setAllowedDocsOptions(Array.isArray(data) ? data : []);
    } catch (error) {
      setAllowedDocsOptions([]);
    }
  };

  const handleFetchMap = async () => {
    try {
      const data = await fetchMap(token);
      setMap(Array.isArray(data) ? data : []);
    } catch (error) {
      setMap([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addMapping(
        {
          service_id: selectedServiceId,
          doctype_id: selectedDoctypeId,
          allow_doc_id: selectedAllowedId,
          format: selectedFormats,
          allowed_size: formData.size,
          status: formData.status,
          review: formData.review || "pending",
          visibility: formData.visibility,
          approval_needed: formData.approval,
        },
        token
      );
      resetModal();
      setResponseMessage("Mapping added successfully!");
      setSelectedFormats([]);
      handleFetchMap();
      setIsModalOpen(false);
      setSuccess(true);
      setConfirm(false);
    } catch (error) {
      setResponseMessage(error.message || "Failed to add mapping");
      setSuccess(false);
      setConfirm(false);
    }
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDelete = async (id) => {
    try {
      await deleteMapping(id, token);
      handleFetchMap();
    } catch (error) {
      setResponseMessage(error.message || "Failed to delete mapping");
      setSuccess(false);
    }
  };

  const handleVisibility = async (id) => {
    const visibility = map.find((item) => item.id === id)?.visibility;
    try {
      await updateMappingVisibility(id, !visibility, token);
      handleFetchMap();
    } catch (error) {
      setResponseMessage(error.message || "Failed to update visibility");
      setSuccess(false);
    }
  };

  const getServiceName = (serviceId) => {
    const service = serviceOptions.find((s) => s.id === parseInt(serviceId));
    return service ? service.name : "N/A";
  };
  // const getDoctypeName = (doctypeId) => {
  //   const doctype = doctypeOptions.find((d) => d.id === parseInt(doctypeId));
  //   return doctype ? doctype.doctype : "N/A";
  // };

  // const getAllowedDocName = (allowedDocId) => {
  //   const allowedDoc = allowedDocsOptions.find(
  //     (a) => a.id === parseInt(allowedDocId)
  //   );
  //   return allowedDoc ? allowedDoc.doc_name : "N/A";
  // };

  const filteredServices = map.filter((serviceRelation) => {
    const serviceName = getServiceName(
      serviceRelation.service_id
    ).toLowerCase();
    return serviceName.includes(searchTerm.toLowerCase());
  });

  const resetModal = () => {
    setSelectedServiceId("");
    setSelectedDoctypeId("");
    setSelectedAllowedId("");
    setFormData({
      size: 0,
    });
  };

  return (
    <>
      <div className="bg-white p-6 rounded-md border border-gray-300 mb-6">
        <div className="flex">
          <h2 className="text-lg font-bold mb-4 text-blue-800">
            Service-Document Relation
          </h2>
        </div>
        <div className="name">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-700 hover:bg-blue-600 w-60 text-white px-6 py-3 rounded-md text-sm"
          >
            + Publish
          </button>
        </div>
      </div>
      <div className="mb-4 flex justify-start">
        <input
          type="text"
          placeholder="Search relations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md px-4 py-2 placeholder:text-gray-500 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className=" bg-white w-full h-full rounded">
        <RelationTable
          services={filteredServices}
          handleDelete={handleDelete}
          visibility={handleVisibility}
          serviceOptions={serviceOptions}
          doctypeOptions={doctypeOptions}
          allowedDocsOptions={allowedDocsOptions}
          onUpdate={handleFetchMap}
        />
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-3/4 max-w-4xl relative border border-black">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Publish</h2>
              <button
                className=" text-gray-400 hover:text-white hover:bg-red-500 p-2 rounded-full transition-colors"
                onClick={() => {
                  setIsModalOpen(false);
                  resetModal();
                }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setConfirm(true);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service *
                  </label>
                  <SearchableDropdown
                    options={serviceOptions}
                    placeholder="Select Service"
                    onSelect={({ id }) => {
                      setSelectedServiceId(id);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctype *
                  </label>
                  <SearchableDropdown
                    options={doctypeOptions}
                    placeholder="Select Doctype"
                    onSelect={({ id }) => {
                      setSelectedDoctypeId(id);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Allowed Document *
                  </label>
                  <SearchableDropdown
                    options={allowedDocsOptions}
                    placeholder="Select Allowed Document"
                    onSelect={({ id }) => {
                      setSelectedAllowedId(id);
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <input
                    required
                    type="number"
                    min="0"
                    defaultValue="2"
                    max="10"
                    placeholder="Allowed Size"
                    className="border p-2 pr-12 rounded h-10 w-full placeholder:text-black border-gray-300"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        size:
                          e.target.value === "" ? "" : parseInt(e.target.value),
                      })
                    }
                    value={formData.size === 0 ? "" : formData.size}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    MB
                  </span>
                </div>
                <div className="">
                  <div className="w-full flex flex-wrap">
                    <FormatDropdown
                      formats={data.fileFormats}
                      onChange={(selected) => setSelectedFormats(selected)}
                    />
                  </div>
                </div>
              </div>
              <div className="selected grid grid-cols-1 gap-2">
                {/* <div className="data space-y-1">
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
                    <label
                      htmlFor="visibilityToggle"
                      className="text-sm font-medium text-gray-800"
                    >
                      User Preview
                    </label>
                    <input
                      id="visibilityToggle"
                      type="checkbox"
                      checked={formData.visibility}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          visibility: !prev.visibility,
                        }))
                      }
                      className="toggle-checkbox w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>

                  <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-3">
                    <label
                      htmlFor="approvalToggle"
                      className="text-sm font-medium text-gray-800"
                    >
                      Document Approval
                    </label>
                    <input
                      id="approvalToggle"
                      type="checkbox"
                      checked={formData.approval}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          approval: !prev.approval,
                        }))
                      }
                      className="toggle-checkbox w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                  </div>
                </div> */}
                <div>
                  {selectedFormats.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <label className="block text-sm font-medium text-blue-800 mb-2">
                        Selected Formats:
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedFormats.map((format, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white px-6 py-2 rounded"
                >
                  Publish
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFormats([]);
                    resetModal();
                  }}
                  className="border px-6 py-2 rounded hover:bg-red-500 hover:text-white"
                >
                  Cancel
                </button>
              </div>
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
                      Add Publish?
                    </h1>
                    <p className="text-xl text-gray-700 pb-8 text-center">
                      Are you sure you want to add publish?
                    </p>
                    <div className="buttons gap-4 flex justify-center pt-6 w-full">
                      <button
                        className="border border-black hover:bg-red-500 hover:text-white text-black px-6 py-2 rounded-md text-lg w-1/2"
                        type="submit"
                        onClick={() => {
                          formData.serviceName = "";
                          formData.description = "";
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
            </form>
          </div>
        </div>
      )}
      {success !== null && (
        <MessageModal
          type={success ? "success" : "error"}
          message={responseMessage}
          onClose={() => setSuccess(null)}
        />
      )}
    </>
  );
};

export default ServiceDocsRelation;
