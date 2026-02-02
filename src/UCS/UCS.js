import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Pagination from "./Pagination";
const UnifiedService = () => {
  const navigate = useNavigate();

  
  const apiUrl = process.env.REACT_APP_API_URL;

  const API_URLS = {
    auth: {
      // verify-token endpoint uses slightly different base
      // verifyToken: apiUrl.replace(/ucs\/test\/?$/, "test/") + "users/verify-token",
      verifyToken: "https://devdemo.softtrails.net/users/verify-token",
    },
    templates: {
      viewAll: `${apiUrl}ucs/viewAllTemplates`,
      getByName: (name) => `${apiUrl}ucs/getByTemplateName/${encodeURIComponent(name)}`,
      add: `${apiUrl}ucs/addTemplates`,
      delete: (id) => `${apiUrl}ucs/deleteTemplate/${id}`,
      messageId: `${apiUrl}ucs/messageId`,
    },
    email: {
      get: `${apiUrl}api/email/all`,
      save: `${apiUrl}api/email/save`,
      update: (id) => `${apiUrl}api/email/update/${id}`,
      delete: (id) => `${apiUrl}api/email/delete/${id}`,
    },
    sms: {
      get: `${apiUrl}api/sms/all`,
      save: `${apiUrl}api/sms/save`,
      update: (id) => `${apiUrl}api/sms/update/${id}`,
      delete: (id) => `${apiUrl}api/sms/delete/${id}`,
    },
  };

  // --- State Variables ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateType, setTemplateType] = useState("");
  const [message, setMessage] = useState("");
  const [variable, setVariable] = useState("");
  const [addedItems, setAddedItems] = useState([]);
  const [selectedOption, setSelectedOption] = useState("message");

  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [selectedFilterOption, setSelectedFilterOption] = useState("Email");

  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [messageId, setMessageId] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const [isRowPopupOpen, setIsRowPopupOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // --- Helper Functions ---
  const getToken = () => sessionStorage.getItem("token");

  // --- Token Check Helper ---
  const checkTokenOrLogout = useCallback(() => {
    const token = getToken();
    if (!token || token === null || token === undefined) {
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Your session has expired. Please login again.',
        timer: 3000,
        showConfirmButton: false
      }).then(() => {
        sessionStorage.clear();
        navigate("/", { replace: true });
      });
      return false;
    }
    return token;
  }, [navigate]);


  const verifyToken = useCallback(async () => {
    const token = checkTokenOrLogout();
    if (!token) return;
    try {
      // Note: verify-token endpoint previously used a slightly different base.
      // If your .env has correct base for auth endpoints, change below accordingly.
      const response = await axios.post(API_URLS.auth.verifyToken, { token }, { headers: { Authorization: `Bearer ${token}` } });
      console.log("Token is valid:", response.data);
      if (window.location.pathname !== "/AllTabs") {
        navigate("/AllTabs");
      }
    } catch (error) {
      console.error(
        "Token verification failed:",
        error.response ? error.response.data : error.message
      );
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenExpiry");
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Your session has expired. Please login again.',
        timer: 3000,
        showConfirmButton: false
      }).then(() => {
        sessionStorage.clear();
        navigate("/", { replace: true });
      });
    }
  }, [navigate, checkTokenOrLogout]);

  // Fetch Templates for the table
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    const token = checkTokenOrLogout();
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await axios.get(API_URLS.templates.viewAll, { headers: { Authorization: `Bearer ${token}` } });
      setTemplates(response.data);
    } catch (error) {
      console.error("Error fetching templates:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to fetch templates. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [checkTokenOrLogout]);

  // Handle Search based on template name
  const handleSearch = useCallback(
    async (templateNameQuery) => {
      if (!templateNameQuery.trim()) {
        setSearchResults(null);
        return;
      }
      setIsLoading(true);
      const token = checkTokenOrLogout();
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(API_URLS.templates.getByName(templateNameQuery), {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch search results");
        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : [data]);
      } catch (error) {
        console.error("API error during search:", error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [checkTokenOrLogout]
  );

  // --- useEffect Hooks ---

  useEffect(() => {
    verifyToken();
    fetchTemplates();
  }, [verifyToken, fetchTemplates]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch(query);
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [query, handleSearch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilterOption]);

  useEffect(() => {
    const token = getToken();
    console.log("Current token hai :", token);
    if (!token || token === "null" || token === "undefined") {
      Swal.fire({
        icon: 'warning',
        title: 'Session Expired',
        text: 'Your session has expired. Please login again.',
        timer: 3000,
        showConfirmButton: false
      }).then(() => {
        sessionStorage.clear();
        navigate("/", { replace: true });
      });
      return;
    }
  }, [navigate]);

  // --- Event Handlers ---

  const handleTemplateNameChange = (e) => setTemplateName(e.target.value);
  const handleTemplateTypeChange = (e) => setTemplateType(e.target.value);

  const handleAddItem = () => {
    if (selectedOption === "message" && message.trim()) {
      setAddedItems((prev) => [
        ...prev,
        { message: message.trim(), variables: "", role: selectedOption },
      ]);
      setMessage("");
      setSelectedOption("variable");
    } else if (selectedOption === "variable" && variable.trim()) {
      setAddedItems((prev) => [
        ...prev,
        { message: "", variables: variable.trim(), role: selectedOption },
      ]);
      setVariable("");
      setSelectedOption("message");
    } else {
      Swal.fire({
        icon: "warning",
        title: "Input Required!",
        text: `Please enter a ${selectedOption} before adding.`,
      });
    }
  };

  const handlePublish = async () => {
    if (!templateName.trim() || !addedItems.length) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information!",
        text: "Template name and at least one message or variable are required.",
      });
      return;
    }
    if (!templateType) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information!",
        text: "Please select a template type (role).",
      });
      return;
    }

    const payload = addedItems.map((item) => ({
      // message: item.message,
       message: item.message.replace(/\\n/g, "\n"),
      variables: item.variables,
      templateName: templateName.trim(),
      role: templateType,
    }));

    console.log("Payload:", payload);
    const token = checkTokenOrLogout();
    if (!token) return;
    try {
      await axios.post(API_URLS.templates.add, payload, { headers: { Authorization: `Bearer ${token}` } });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Template published successfully.",
      });

      setTemplateName("");
      setTemplateType("");
      setAddedItems([]);
      setMessage("");
      setVariable("");
      setSelectedOption("message");
      setIsModalOpen(false);
      fetchTemplates();
    } catch (error) {
      console.error("Error adding template:", error.response?.data || error);
      const errorMsg =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";
      Swal.fire({ icon: "error", title: "Error!", text: errorMsg });
    }
  };

  const handleCloseAddTemplateModal = () => {
    setIsModalOpen(false);
    setTemplateName("");
    setTemplateType("");
    setAddedItems([]);
    setMessage("");
    setVariable("");
    setSelectedOption("message");
  };

  const handleDeleteTemplate = (templateId) => {
    setTemplateToDelete(templateId);
    setDeleteConfirmationOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (templateToDelete) {
      const token = checkTokenOrLogout();
      if (!token) {
        setDeleteConfirmationOpen(false);
        setTemplateToDelete(null);
        return;
      }
      try {
        await axios.delete(API_URLS.templates.delete(templateToDelete), { headers: { Authorization: `Bearer ${token}` } });
        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Template deleted successfully.",
        });
        fetchTemplates();
      } catch (error) {
        console.error("Error deleting template:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Failed to delete template. Please try again.",
        });
      } finally {
        setDeleteConfirmationOpen(false);
        setTemplateToDelete(null);
      }
    }
  };

  const cancelDeleteTemplate = () => {
    setDeleteConfirmationOpen(false);
    setTemplateToDelete(null);
  };



  const handleUpdateSMSStatus = async () => {
    if (!messageId.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Message ID Required!",
        text: "Please enter a valid Message ID.",
      });
      return;
    }
    setIsStatusModalOpen(false);
    setIsConfirmModalOpen(true);
  };


  const confirmSMSStatusUpdate = async () => {
    const token = checkTokenOrLogout();
    if (!token) {
      setIsConfirmModalOpen(false);
      setSelectedTemplateId(null);
      setMessageId("");
      return;
    }
    try {
      const res = await axios.put(API_URLS.templates.messageId, {}, {
        params: { templateId: selectedTemplateId, messageId: messageId.trim() },
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("API Response:", res.data);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "SMS status updated successfully.",
      });

      // Agar backend response me status mil raha hai to wahi update karo
      setTemplates((prevTemplates) =>
        prevTemplates.map((temp) =>
          temp.templateId === selectedTemplateId
            ? { ...temp, status: res.data.status || "Approved" }
            : temp
        )
      );
    } catch (error) {
      console.error("Error submitting Message ID:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update SMS status. Please try again.",
      });
    }
    finally {
      setIsConfirmModalOpen(false);
      setSelectedTemplateId(null);
      setMessageId("");
    }
  };

  const cancelSMSStatusConfirmation = () => {
    setIsConfirmModalOpen(false);
    setSelectedTemplateId(null);
    setMessageId("");
  };

  const handleRowClickForDetails = (template) => {
    setSelectedRowData(template);
    setIsRowPopupOpen(true);
  };

  // --- Pagination Logic ---
  const displayTemplates = searchResults !== null ? searchResults : templates;
  const filteredTemplates = displayTemplates.filter(
    (template) => template.role === selectedFilterOption
  );
  const totalPages = Math.ceil(filteredTemplates.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTemplates.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="flex w-full">
      <div className="p-6 w-full">
        {/* Template Table Section */}
        <div className="bg-white shadow-lg rounded-t-lg pt-1 pb-1 px-8">
          <div className="flex items-center justify-between gap-4 pt-1 pb-1 px-4 w-full bg-[#ffffff]">
            {/* Search Box & Dropdown - Left Aligned */}
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search by Template Name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-50 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Dropdown for filtering templates */}
              <div className="relative">
                <select
                  value={selectedFilterOption}
                  onChange={(e) => setSelectedFilterOption(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                >
                  <option value="Email">Email</option>
                  <option value="SMS">Sms</option>
                  {/* <option value="Notification">Notification</option> Add if you want to filter by notification too */}
                </select>
              </div>
            </div>

            {/* Add Template Button - Right Aligned */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-custome-blue w-[12%] text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-300"
            >
              + Add Template
            </button>
          </div>
        </div>

        <div className="w-full flex justify-center bg-white p-0 shadow-lg">
          <div className="w-full max-w-6xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto">
                <thead className="sticky border-b-2 border-black bg-white top-0 z-10">
                  <tr className="text-gray-600">
                    <th className="px-6 py-4 ">S.No</th>
                    <th className="px-6 py-4 w-60 ">Template Name</th>
                    <th className="px-6 py-4 ">Template ID</th>
                    <th className="px-6 py-4 ">Date</th>
                    {selectedFilterOption === "SMS" && (
                      <th className="px-6 py-4">Status</th>
                    )}
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading && !currentItems.length ? ( // Show loader only if no items are currently displayed
                    <tr>
                      <td colSpan={selectedFilterOption === "SMS" ? 6 : 5} className="py-10 text-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((template, index) => (
                      <tr key={template.templateId || index} >
                        <td className="px-6 py-4 flex gap-4">
                          {indexOfFirstItem + index + 1}
                        </td>
                        <td
                          title="Click to view details"
                          className="px-6 py-4 cursor-pointer text-blue-500 hover:underline"
                          onClick={() => handleRowClickForDetails(template)}
                        >
                          {template.templateName}
                        </td>
                        <td className="px-4 py-2 ">
                          {template.templateId}
                        </td>
                        <td className=" px-4 py-2">
                          {new Date(template.date).toLocaleDateString("en-GB")}
                        </td>
                        {selectedFilterOption === "SMS" && (
                          <td
                            className={`px-4 py-2 text-center cursor-pointer hover:underline ${template.status === "Approved"
                              ? "text-green-600 font-semibold"
                              : "text-red-600 font-semibold"
                              }`}
                            onClick={() => {
                              // Allow status update only if not already Approved
                              if (template.status !== "Approved") {
                                setSelectedTemplateId(template.templateId);
                                setMessageId(""); // Clear previous message ID
                                setIsStatusModalOpen(true);
                              }
                            }}
                          >
                            {template.status || "Pending"}
                          </td>
                        )}
                        <td className=" px-4 py-2">
                          <button
                            className="text-red-500 hover:text-red-700 transition duration-300"
                            onClick={() => handleDeleteTemplate(template.templateId)}
                            aria-label={`Delete ${template.templateName}`}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={selectedFilterOption === "SMS" ? 6 : 5}
                        className="py-4 text-center text-gray-500"
                      >
                        No templates found for the selected filter or search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Row Details Popup */}
        {isRowPopupOpen && selectedRowData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            {/* Modal container: constrain width, allow vertical scrolling only, prevent horizontal scroll */}
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] max-w-[90vw] max-h-[80vh] overflow-y-auto overflow-x-hidden">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Template Details
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li>
                  <strong>Template Name:</strong>{" "}
                  {selectedRowData.templateName || "N/A"}
                </li>
                <li>
                  <strong>Template ID:</strong>{" "}
                  {selectedRowData.templateId || "N/A"}
                </li>
                <li>
                  <strong>Message:</strong>
                  {/* Message box: wrap text, prevent horizontal overflow, allow vertical scrolling if long */}
                  <div
                    className="mt-2 text-gray-700 whitespace-pre-wrap break-words max-h-[30vh] overflow-y-auto overflow-x-hidden p-2 border border-gray-100 rounded bg-gray-50"
                    // inline style as fallback to ensure long words break
                    style={{ wordBreak: "break-word" }}
                  >
                    {selectedRowData.message || "No message content"}
                  </div>
                </li>
                {/* <li>
                    <strong>Variables:</strong>{" "}
                    {selectedRowData.variables || "No variables"}
                  </li> */}
                <li>
                  <strong>Role:</strong> {selectedRowData.role || "N/A"}
                </li>
                <li>
                  <strong>Date Created:</strong>{" "}
                  {selectedRowData.date
                    ? new Date(selectedRowData.date).toLocaleDateString(
                      "en-GB"
                    )
                    : "N/A"}
                </li>
                {selectedFilterOption === "SMS" && (
                  <li>
                    <strong>Status:</strong>{" "}
                    <span
                      className={`${selectedRowData.status === "Approved"
                        ? "text-green-600"
                        : "text-red-600"
                        } font-medium`}
                    >
                      {selectedRowData.status || "Pending"}
                    </span>
                  </li>
                )}
              </ul>
              <div className="text-right mt-6">
                <button
                  onClick={() => setIsRowPopupOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* </div> */}

        {/* Pagination Controls */}
        {filteredTemplates.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}

        {/* Modal for adding templates */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <div className="w-full max-w-md p-5 bg-white shadow-lg rounded-lg animate-fade-in-up">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Add New Template</h3>
                <button
                  className="text-gray-500 hover:text-gray-700 text-xl"
                  onClick={handleCloseAddTemplateModal}
                  aria-label="Close add template modal"
                >
                  &times;
                </button>
              </div>

              <div className="flex flex-col space-y-4 mb-4">
                <input
                  type="text"
                  placeholder="Enter template name"
                  value={templateName}
                  onChange={handleTemplateNameChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={templateType}
                  onChange={handleTemplateTypeChange}
                  className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Template Type</option>
                  <option value="SMS">SMS</option>
                  <option value="Email">Email</option>
                  {/* <option value="Notification">Notification</option> */}
                </select>
              </div>

              {templateType === "SMS" && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-md mb-4 animate-fade-in">
                  <p className="text-sm font-semibold">
                    Note: The template has to be approved by DLT to enable
                    sending out the SMS. Please visit the{" "}
                    <a
                      href="https://www.dlt.gov.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      DLT website
                    </a>{" "}
                    or contact your SMS service provider for more information.
                  </p>
                </div>
              )}

              <div className="mb-4 flex items-center gap-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="message"
                    checked={selectedOption === "message"}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Message</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="variable"
                    checked={selectedOption === "variable"}
                    onChange={(e) => setSelectedOption(e.target.value)}
                    className="form-radio text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Variable</span>
                </label>
              </div>

              {selectedOption === "message" ? (
                <textarea
                  placeholder="Enter your message content"
                  value={message}
                  onChange={(e) => {
                    console.warn(message);
                    setMessage(e.target.value)}}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-4 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Enter variable name (e.g., {username}, {amount})"
                  value={variable}
                  onChange={(e) => setVariable(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}

              <button
                onClick={handleAddItem}
                className="bg-custome-blue text-white rounded-lg px-4 py-2 mb-4 hover:bg-blue-600 transition duration-300"
              >
                Add {selectedOption === "message" ? "Message Part" : "Variable"}
              </button>

              <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                <p className="text-sm font-semibold mb-2 text-gray-700">Template Structure:</p>
                <ul className="list-disc list-inside text-gray-800">
                  {addedItems.length > 0 ? (
                    addedItems.map((item, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center border-b border-gray-200 py-1 last:border-b-0"
                      >
                        <span className="break-all">
                          {item.message ? item.message : `{${item.variables}}`}
                        </span>
                        <button
                          className="text-red-500 hover:text-red-700 ml-4"
                          onClick={() =>
                            setAddedItems((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                          aria-label="Remove item"
                        >
                          &times;
                        </button>
                      </li>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      No message parts or variables added yet.
                    </p>
                  )}
                </ul>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                {/* <button
                  onClick={handleSave}
                  className="bg-gray-500 text-white rounded-lg px-4 py-2 hover:bg-gray-600 transition duration-300"
                >
                  Save Draft
                </button> */}
                <button
                  onClick={handlePublish}
                  className="bg-custome-blue text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition duration-300"
                >
                  Publish Template
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmationOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] animate-zoom-in">
              <p className="mb-6 text-lg font-medium text-gray-800">
                Are you sure you want to delete this template? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition duration-300"
                  onClick={cancelDeleteTemplate}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition duration-300"
                  onClick={confirmDeleteTemplate}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Status Modal (for SMS Message ID) */}
        {isStatusModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-zoom-in">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">
                Enter DLT Approved Message ID
              </h2>
              <input
                type="text"
                placeholder="DLT Message ID (max 7 digits)"
                value={messageId}
                onChange={(e) => {
                  const input = e.target.value;
                  // Allow only digits and limit to 7 characters
                  if (/^\d{0,7}$/.test(input)) {
                    setMessageId(input);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength="7" // Enforce max length at input level
              />
              <p className="text-sm text-gray-500 mt-1">
                Please enter the 7-digit Message ID approved by DLT.
              </p>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setIsStatusModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 mr-2 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateSMSStatus}
                  className={`bg-blue-600 text-white px-4 py-2 rounded-md ${!messageId.trim() || messageId.trim().length !== 7
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                    } transition duration-300`}
                  disabled={!messageId.trim() || messageId.trim().length !== 7} // Enable only if messageId is exactly 7 digits
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Message ID Submission */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96 animate-zoom-in">
              <p className="text-lg mb-6 text-gray-800">
                Confirming this will assume the template is DLT-approved. The
                SMS will be sent based on DLT/TSP approval.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={cancelSMSStatusConfirmation}
                  className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSMSStatusUpdate}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Confirm & Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnifiedService;