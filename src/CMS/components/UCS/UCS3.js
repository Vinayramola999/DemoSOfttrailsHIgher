import { Dialog } from "@headlessui/react";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import { useEffect, useState, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import "../App.css";
import Pagination from './Pagination';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
const LeaveManagement1 = () => {
  const [emailData, setEmailData] = useState([]); // Email Data
  const [smsData, setSmsData] = useState([]); // SMS Data
  const [filteredData, setFilteredData] = useState([]); // Data to be shown in the table
  const [editData, setEditData] = useState({});
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen1, setIsOpen1] = useState(false);
  const [selectedService, setSelectedService] = useState("email"); // 'email' or 'sms'. This is the main state for toggling.
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRowData, setSelectedRowData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({}); // track inline required errors
  const navigate = useNavigate(); // Initialize useNavigate
  const apiUrl = "https://devdemo.softtrails.net/ucs/intra/";

  console.log("API Base URL:", apiUrl);


  const API_URLS = {
    email: {
      get: `${apiUrl}api/email/all`,
      save: `${apiUrl}api/email/save`,
      update: id => `${apiUrl}api/email/update/${id}`,
      delete: id => `${apiUrl}api/email/delete/${id}`,
    },
    sms: {
      get: `${apiUrl}api/sms/all`,
      save: `${apiUrl}api/sms/save`,
      update: id => `${apiUrl}api/sms/update/${id}`,
      delete: id => `${apiUrl}api/sms/delete/${id}`,
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Email Data Fetch
      const emailResponse = await fetch(API_URLS.email.get, { headers });
      if (!emailResponse.ok) throw new Error("Email API fetch failed");
      const emailResult = await emailResponse.json();
      //  setEmailData(emailResult);
      setEmailData(Array.isArray(emailResult)
        ? emailResult.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : emailResult);

      // SMS Data Fetch
      const smsResponse = await fetch(API_URLS.sms.get, { headers });
      if (!smsResponse.ok) throw new Error("SMS API fetch failed");
      const smsResult = await smsResponse.json();
      //  setSmsData(smsResult);
      setSmsData(Array.isArray(smsResult)
        ? smsResult.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : smsResult);

    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire("Error", "Failed to load data from the server.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiUrl]);


  useEffect(() => {
    // 1. Determine the source data based on the selected service
    const sourceData = selectedService === "email" ? emailData : smsData;

    // 2. Filter the data based on the search term
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    if (!lowerCaseSearchTerm) {
      // If search is empty, show all data for the selected service
      setFilteredData(sourceData);
    } else {
      const filtered = sourceData.filter((item) => {
        if (selectedService === "email") {
          // Filter Email data by Service Name or Username
          return (
            item.serviceName?.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.username?.toLowerCase().includes(lowerCaseSearchTerm)
          );
        } else { // For SMS
          // Filter SMS data by Service Name OR Sender ID
          return (
            item.serviceName?.toLowerCase().includes(lowerCaseSearchTerm) ||
            item.senderId?.toString().toLowerCase().includes(lowerCaseSearchTerm)
          );
        }
      });
      setFilteredData(filtered);
    }
    setCurrentPage(1); // Reset to first page on filter change
  }, [selectedService, searchTerm, emailData, smsData]); // Reruns whenever these values change


  const handleEdit = useCallback((data) => {
    if (!data || Object.keys(data).length === 0) {
      console.error("Error: No data provided for editing!");
      return;
    }
    setEditData(data);
    setSelectedService(data.type); // Ensure the modal knows which service type it's editing
    setIsOpen(true);
  }, []);

  const openDialog = (rowData) => {
    if (!rowData) {
      console.error("Error: rowData is null or undefined!");
      return;
    }
    setEditData(rowData || {});
    setIsOpen(true);
  };

  const closeDialog = () => {
    setEditData(null);
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // clear inline error for this field when user edits it
    setFieldErrors(prev => {
      if (!prev || !prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const handleSubmit = async () => {
    if (!editData || !editData.id) {
      alert("Error: Missing edit data!");
      return;
    }

    // Validation: ensure all required fields are present depending on service type
    const type = selectedService || editData.type;
    // Build inline error map
    const errors = {};
    if (type === 'email') {
      if (!editData.serviceName || String(editData.serviceName).trim() === '') errors.serviceName = true;
      if (!editData.host || String(editData.host).trim() === '') errors.host = true;
      if (!editData.port || String(editData.port).trim() === '') errors.port = true;
      if (!editData.username || String(editData.username).trim() === '') errors.username = true;
      const pwd = editData.password ? String(editData.password).trim() : '';
      if (!pwd) errors.password = true;
      else if (pwd.length < 7) errors.password = true;
    } else {
      if (!editData.serviceName || String(editData.serviceName).trim() === '') errors.serviceName = true;
      if (!editData.apiKey || String(editData.apiKey).trim() === '') errors.apiKey = true;
      if (!editData.apiUrl || String(editData.apiUrl).trim() === '') errors.apiUrl = true;
      if (!editData.senderId || String(editData.senderId).trim() === '') errors.senderId = true;
      if (!editData.route || String(editData.route).trim() === '') errors.route = true;
      if (!editData.language || String(editData.language).trim() === '') errors.language = true;
    }

    // set inline errors for rendering
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Show Swal only if Service Name is missing
      if (errors.serviceName) {
        Swal.fire({ icon: 'error', title: 'Missing Service Name', text: 'Please provide Service Name' });
      }
      return;
    }
    // clear errors on success path
    setFieldErrors({});

    const token = sessionStorage.getItem("token"); // <-- Add this line
    const url = selectedService === "email"
      ? API_URLS.email.update(editData.id)
      : API_URLS.sms.update(editData.id);

    const payload =
      selectedService === "email"
        ? {
          id: editData.id,
          host: editData.host,
          port: editData.port,
          username: editData.username,
          password: editData.password,
          serviceName: editData.serviceName,
        }
        : {
          id: editData.id,
          apiKey: editData.apiKey,
          apiUrl: editData.apiUrl,
          senderId: editData.senderId,
          route: editData.route,
          language: editData.language,
          serviceName: editData.serviceName,
        };

    try {
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const textResponse = await response.text();
      if (!response.ok) {
        throw new Error(`Update failed! Server response: ${textResponse}`);
      }

      Swal.fire("Success", "Service updated successfully!", "success");

      // Manually update the state to reflect changes instantly
      const updateDataSource = selectedService === 'email' ? setEmailData : setSmsData;
      updateDataSource(prevData => prevData.map(item => item.id === editData.id ? { ...item, ...payload } : item));

      closeDialog();
    } catch (error) {
      console.error("Update error:", error);
      alert(`Failed to update: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const token = sessionStorage.getItem("token"); // <-- Add this line
    const { id, service } = itemToDelete;
    const url = service === "email" ? API_URLS.email.delete(id) : API_URLS.sms.delete(id);

    try {
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Delete failed!");

      await Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Item deleted successfully.",
        timer: 2000,
        showConfirmButton: false,
      });

      // Remove from state instantly
      if (service === 'email') {
        setEmailData(prev => prev.filter(item => item.id !== id));
      } else {
        setSmsData(prev => prev.filter(item => item.id !== id));
      }

      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Delete Error:", error);
      Swal.fire("Failed!", "Something went wrong while deleting.", "error");
    }
  };

  const openDeleteModal = (id, serviceType) => {
    setItemToDelete({ id, service: serviceType });
    setDeleteModalOpen(true);
  };

  const [formData, setFormData] = useState({
    serviceName: "", host: "", port: "", username: "", password: "",
    apiKey: "", apiUrl: "", senderId: "", route: "", language: "",
  });

  const handleChange1 = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // clear inline error for this field when user edits it
    setFieldErrors(prev => {
      if (!prev || !prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const resetForm = () => {
    setFormData({
      serviceName: "", host: "", port: "", username: "", password: "",
      apiKey: "", apiUrl: "", senderId: "", route: "", language: "",
    });
    setShowPassword(false);
    // Clear inline validation errors when resetting/closing modal
    setFieldErrors({});
  };

  const handleSubmit1 = async () => {
    const token = sessionStorage.getItem("token");
    const url = selectedService === "email" ? API_URLS.email.save : API_URLS.sms.save;

    // Special case: Service Name missing -> show Swal (as requested)
    if (!formData.serviceName || String(formData.serviceName).trim() === "") {
      await Swal.fire({
        icon: "error",
        title: "Failed to save the service",
        text: "Service Name cannot be empty!",
      });
      return;
    }

    // Validate other required fields and collect inline messages
    const errors = {};
    if (selectedService === "email") {
      if (!formData.host || String(formData.host).trim() === "") errors.host = "Host cannot be empty!";
      if (!formData.port || String(formData.port).trim() === "") errors.port = "Port cannot be empty!";
      if (!formData.username || String(formData.username).trim() === "") errors.username = "Username cannot be empty!";
      const pwd = formData.password ? String(formData.password).trim() : "";
      if (!pwd) errors.password = "Password cannot be empty!";
      else if (pwd.length < 7) errors.password = "Password must be at least 7 characters!";
    } else {
      if (!formData.apiKey || String(formData.apiKey).trim() === "") errors.apiKey = "API Key cannot be empty!";
      if (!formData.apiUrl || String(formData.apiUrl).trim() === "") errors.apiUrl = "API URL cannot be empty!";
      if (!formData.senderId || String(formData.senderId).trim() === "") errors.senderId = "Sender ID cannot be empty!";
      if (!formData.route || String(formData.route).trim() === "") errors.route = "Route cannot be empty!";
      if (!formData.language || String(formData.language).trim() === "") errors.language = "Language cannot be empty!";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      // Do not close modal; show inline messages only
      return;
    }

    // Clear previous inline errors and proceed
    setFieldErrors({});

    const data = selectedService === "email"
      ? { serviceName: formData.serviceName, host: formData.host, port: formData.port, username: formData.username, password: formData.password }
      : { serviceName: formData.serviceName, apiKey: formData.apiKey, apiUrl: formData.apiUrl, senderId: formData.senderId, route: formData.route, language: formData.language };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status: ${response.status}`);
      }

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: "Service setup successfully!",
      });

      // Refresh data and reset
      fetchData();
      setIsOpen1(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting data:", error);
      Swal.fire({ icon: "error", title: "Error", text: error.message || 'Failed to save the service' });
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const itemsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentItems = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredData.slice(indexOfFirstItem, indexOfLastItem);
  }, [filteredData, currentPage, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage; // Redundant, currentItems already handles slicing
  const indexOfFirstItem = indexOfLastItem - itemsPerPage; // Redundant

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setCurrentPage(newPage);
  }, [totalPages]);

  const [passwordVisible, setPasswordVisible] = useState(false);


  const fieldNameMap = {
    id: "ID", username: "User Name", host: "Host", serviceName: "Service Name",
    createdAt: "Created On", senderId: "Sender ID", route: "Route",
    apiKey: "API Key", apiUrl: "API URL", port: "Port", language: "Language",
    password: "Password"
  };

  const columns = useMemo(() => [
    { key: "sno", label: "S.No" },
    { key: "serviceName", label: "Service Name" },
    { key: selectedService === "email" ? "username" : "senderId", label: selectedService === "email" ? "User Name" : "Sender ID" },
    ...(selectedService === "sms" ? [{ key: "route", label: "Route" }] : []),
    ...(selectedService === "email" ? [{ key: "host", label: "Host" }] : []),
    { key: "createdAt", label: "Created On" },
    { key: "action", label: "Action" }
  ], [selectedService]);



  return (
    <div className="flex">
      <div className="p-6 w-full">
        <div className="bg-white  rounded-t-lg pt-1 pb-1 px-8">
          <div className="flex items-center justify-between gap-4 pt-1 pb-1 px-4 w-full bg-[#ffffff]">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search by Service Name"
                className="w-50 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearchChange}
              />

              <div className="relative">
                <select
                  className="border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                >
                  <option value="email">Email</option>
                  <option value="sms">Sms</option>
                </select>
              </div>
            </div>

            <button
              className="bg-custome-blue w-[12%] text-white px-4 py-2 rounded-2xl hover:bg-blue-600 transition duration-300"
              onClick={() => { resetForm(); setFieldErrors({}); setIsOpen1(true); }}
            >
              + Setup
            </button>
          </div>

          {isOpen1 && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
              <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-4xl relative">
                <button
                  className="absolute top-4 right-4 text-gray-600 hover:text-black"
                  onClick={() => { setIsOpen1(false); resetForm(); setFieldErrors({}); }}
                >✕</button>
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
                  Setup Communication Service
                </h2>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Select Communication Type:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input type="radio" value="email" checked={selectedService === "email"} onChange={(e) => setSelectedService(e.target.value)} /> Email
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" value="sms" checked={selectedService === "sms"} onChange={(e) => setSelectedService(e.target.value)} /> SMS
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Service Name:</label>
                  <input type="text" name="serviceName" value={formData.serviceName} onChange={handleChange1} placeholder="Enter Service Name" maxLength={20} className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                </div>

                <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
                  {selectedService === "email" ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <input type="text" name="host" value={formData.host} onChange={handleChange1} placeholder="Host" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                        {fieldErrors.host && <div className="text-red-600 text-sm mt-1">{fieldErrors.host}</div>}
                      </div>
                      <div>
                        <input type="number" name="port" value={formData.port} onChange={handleChange1} placeholder="Port" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                        {fieldErrors.port && <div className="text-red-600 text-sm mt-1">{fieldErrors.port}</div>}
                      </div>
                      <div>
                        <input type="text" name="username" value={formData.username} onChange={handleChange1} placeholder="Username" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                        {fieldErrors.username && <div className="text-red-600 text-sm mt-1">{fieldErrors.username}</div>}
                      </div>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange1} placeholder="Password" className="border p-3 pr-10 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                        <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 focus:outline-none">
                          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                        </button>
                        {fieldErrors.password && <div className="text-red-600 text-sm mt-1">{fieldErrors.password}</div>}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <input type="text" name="apiKey" value={formData.apiKey} onChange={handleChange1} placeholder="API Key" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                        {fieldErrors.apiKey && <div className="text-red-600 text-sm mt-1">{fieldErrors.apiKey}</div>}
                      </div>
                      <div>
                        <input type="text" name="apiUrl" value={formData.apiUrl} onChange={handleChange1} placeholder="API URL" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                        {fieldErrors.apiUrl && <div className="text-red-600 text-sm mt-1">{fieldErrors.apiUrl}</div>}
                      </div>
                      <div>
                        <input type="text" name="senderId" value={formData.senderId} onChange={handleChange1} placeholder="Sender ID" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                        {fieldErrors.senderId && <div className="text-red-600 text-sm mt-1">{fieldErrors.senderId}</div>}
                      </div>
                      <div>
                        <input type="text" name="route" value={formData.route} onChange={handleChange1} placeholder="Route" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                        {fieldErrors.route && <div className="text-red-600 text-sm mt-1">{fieldErrors.route}</div>}
                      </div>
                      <div>
                        <input type="text" name="language" value={formData.language} onChange={handleChange1} placeholder="Language" className="border p-3 rounded-lg w-full outline-none focus:ring-2 focus:ring-blue-400" />
                        {fieldErrors.language && <div className="text-red-600 text-sm mt-1">{fieldErrors.language}</div>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button onClick={() => { setIsOpen1(false); resetForm(); setFieldErrors({}); }} className="border px-5 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition">Cancel</button>
                  <button onClick={handleSubmit1} className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition">Submit</button>
                </div>
              </div>
            </div>
          )}

          {isOpen && (
            <Dialog open={isOpen} onClose={closeDialog} className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30">
              <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                <Dialog.Title className="text-lg font-semibold">Edit {editData?.type?.toUpperCase()} Service</Dialog.Title>
                <div className="mt-4 space-y-3">
                  {editData?.type === "email" ? (
                    <>
                      <div>
                        <input type="text" name="host" value={editData?.host || ""} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Host" />
                        {fieldErrors.host && (
                          <div className="text-red-600 text-sm mt-1">
                            {typeof fieldErrors.host === "string" ? fieldErrors.host : "Host is required"}
                          </div>
                        )}
                      </div>

                      <div>
                        <input type="text" name="port" value={editData?.port || ""} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Port" />
                        {fieldErrors.port && (
                          <div className="text-red-600 text-sm mt-1">
                            {typeof fieldErrors.port === "string" ? fieldErrors.port : "Port is required"}
                          </div>
                        )}
                      </div>

                      <div>
                        <input type="text" name="username" value={editData?.username || ""} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Username" />
                        {fieldErrors.username && (
                          <div className="text-red-600 text-sm mt-1">
                            {typeof fieldErrors.username === "string" ? fieldErrors.username : "Username is required"}
                          </div>
                        )}
                      </div>

                      <div className="relative">
                        <input type={passwordVisible ? "text" : "password"} name="password" value={editData?.password || ""} onChange={handleChange} className="w-full border p-2 rounded pr-10" placeholder="Password" />
                        <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"><FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} /></button>
                        {fieldErrors.password && (
                          <div className="text-red-600 text-sm mt-1">
                            {typeof fieldErrors.password === "string" ? fieldErrors.password : "Password is required (min 7 chars)"}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <input type="text" name="apiKey" value={editData?.apiKey || ""} onChange={handleChange} className="w-full border p-2 rounded" placeholder="API Key" />
                        {fieldErrors.apiKey && <div className="text-red-600 text-sm mt-1">{typeof fieldErrors.apiKey === "string" ? fieldErrors.apiKey : "API Key is required"}</div>}
                      </div>

                      <div>
                        <input type="text" name="apiUrl" value={editData?.apiUrl || ""} onChange={handleChange} className="w-full border p-2 rounded" placeholder="API URL" />
                        {fieldErrors.apiUrl && <div className="text-red-600 text-sm mt-1">{typeof fieldErrors.apiUrl === "string" ? fieldErrors.apiUrl : "API URL is required"}</div>}
                      </div>

                      <div>
                        <input type="text" name="senderId" value={editData?.senderId || ""} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Sender ID" />
                        {fieldErrors.senderId && <div className="text-red-600 text-sm mt-1">{typeof fieldErrors.senderId === "string" ? fieldErrors.senderId : "Sender ID is required"}</div>}
                      </div>

                      <div>
                        <input type="text" name="route" value={editData?.route || ""} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Route" />
                        {fieldErrors.route && <div className="text-red-600 text-sm mt-1">{typeof fieldErrors.route === "string" ? fieldErrors.route : "Route is required"}</div>}
                      </div>

                      <div>
                        <input type="text" name="language" value={editData?.language || ""} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Language" />
                        {fieldErrors.language && <div className="text-red-600 text-sm mt-1">{typeof fieldErrors.language === "string" ? fieldErrors.language : "Language is required"}</div>}
                      </div>
                    </>
                  )}
                  <div>
                    <input type="text" name="serviceName" value={editData?.serviceName || ""} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Service Name" />
                    {fieldErrors.serviceName && (
                      <div className="text-red-600 text-sm mt-1">
                        {typeof fieldErrors.serviceName === "string" ? fieldErrors.serviceName : "Service Name is required"}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button onClick={closeDialog} className="px-4 py-2 bg-gray-400 text-white rounded">Cancel</button>
                  <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">Submit</button>
                </div>
              </div>
            </Dialog>
          )}
        </div>

        <div className="w-full flex justify-center bg-white p-0 ">
          <div className="w-full max-w-6xl">
            {/* make horizontal scroll allowed, remove fixed max-height to avoid vertical scrollbar */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse table-auto">
                <thead className="sticky border-b-2 border-black bg-white top-0 z-10">
                  <tr className="text-gray-600">
                    {columns.map(col => (
                      <th key={col.key} className="px-6 py-4">{col.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={columns.length} className="py-10 text-center"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((rowData, index) => (
                      <tr key={rowData.id}>
                        {columns.map(col => {
                          if (col.key === "sno") {
                            return (
                              <td key={col.key} className="px-6 py-4">{indexOfFirstItem + index + 1}</td>
                            );
                          }
                          if (col.key === "action") {
                            return (
                              <td key={col.key} className="px-6 py-4 flex gap-4">
                                <button onClick={() => handleEdit({ ...rowData, type: selectedService })} className="text-blue-500 hover:text-blue-700"><PencilSquareIcon className="h-4 w-4" /></button>
                                <button onClick={() => openDeleteModal(rowData.id, selectedService)} className="text-red-500 hover:text-red-700"><FontAwesomeIcon icon={faTrash} /></button>
                              </td>
                            );
                          }
                          if (col.key === "serviceName") {
                            return (
                              <td
                                key={col.key}
                                className="px-6 py-4 cursor-pointer text-blue-500 hover:underline"
                                title="Click to view details"
                                onClick={() => { setSelectedRowData(rowData); setIsModalOpen(true); }}
                              >
                                {rowData[col.key]}
                              </td>
                            );
                          }
                          return (
                            <td key={col.key} className="px-6 py-4">
                              {(col.key === "createdAt" || col.key === "updatedAt") && typeof rowData[col.key] === "string"
                                ? rowData[col.key].includes("T")
                                  ? rowData[col.key].split("T")[0]
                                  : rowData[col.key]
                                : rowData[col.key]}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={columns.length} className="text-center py-4 text-gray-500">{searchTerm ? "No matching data found" : "No data available"}</td></tr>
                  )}
                </tbody>
              </table>
              {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-96 border border-gray-300">
                    <h2 className="text-lg font-semibold">Confirm Deletion</h2>
                    <p className="mt-2">Are you sure you want to delete this item?</p>
                    <div className="mt-4 flex justify-end gap-3">
                      <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 bg-gray-400 text-white rounded">No</button>
                      <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">Yes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* removed overflow-y wrapper so table won't show vertical scroll like before */}
            {isModalOpen && selectedRowData && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[80vh] overflow-y-auto border border-gray-300">
                  <h2 className="text-xl font-semibold mb-4">{selectedRowData.serviceName} Details</h2>
                  <ul className="space-y-2">
                    {Object.entries(selectedRowData).map(([key, value]) => {
                      const label = fieldNameMap[key] || key;
                      if (key === 'password' || value === null || value === "") return null; // Don't show password or empty fields

                      let displayValue = String(value);
                      if ((key === 'createdAt' || key === 'updatedAt') && typeof value === "string") {
                        // Agar value string hai aur T hai to split kar lo
                        displayValue = value.includes("T") ? value.split("T")[0] : value;
                      }

                      return (<li key={key}><strong>{label}:</strong> {displayValue}</li>);
                    })}
                  </ul>
                  <div className="mt-6 text-right"><button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-blue-600 text-white rounded">Close</button></div>
                </div>
              </div>
            )}          </div>
        </div>

        {filteredData.length > itemsPerPage && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} show={filteredData.length > itemsPerPage} />
        )}
      </div>
    </div>
  );
};

export default LeaveManagement1;