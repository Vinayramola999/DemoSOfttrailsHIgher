import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEye } from "react-icons/fa";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
// Optional: Map text to color class
const getTextColorClass = (label) => {
  const colors = [
    "text-red-600",
    "text-blue-600",
    "text-green-600",
    "text-yellow-600",
    "text-purple-600",
    "text-pink-600",
    "text-indigo-600",
    "text-gray-600",
    "text-orange-600",
    "text-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const ProductionInventory = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [allocationModal, setAllocationModal] = useState(false);
  const [allocationType, setAllocationType] = useState("");
  const [users, setUsers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [subLocations, setSubLocations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedSubLocation, setSelectedSubLocation] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [allocationStep, setAllocationStep] = useState(1); // 1 = choose type, 2 = fill form
  const [vendorAllocationStep, setVendorAllocationStep] = useState(1);
  const [pricingType, setPricingType] = useState("");
  const [discount, setDiscount] = useState("");
  const [manualPrice, setManualPrice] = useState("");
  const [markup, setMarkup] = useState("");
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [message, setMessage] = useState(""); // State to store the message
  const [messageType, setMessageType] = useState("");
 const [warrantyExpiryDate,setWarrantyExpiryDate ] = useState("");
  const rowsPerPage = 10;
  const userId = sessionStorage.getItem("userId") || 1;

const fetchProjects = async () => {
  const token = sessionStorage.getItem("token"); // Get token
  try {
    const res = await axios.get(
      `${JAVA_BASE}api/projects/fetch`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to headers
        },
      }
    );
    setProjects(res.data);
  } catch (err) {
    console.error("Error fetching projects:", err);
  }
};

const fetchHistoryData = async () => {
  const token = sessionStorage.getItem("token"); // Get token
  try {
    const res = await axios.get(
      `${ASSET_NODE_BASE}processlifecycle/fine-goods/by-status?status=Inventory`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Add token to headers
        },
      }
    );
    const filteredData = (res.data.data || []).filter(
      (item) => item.status === "Inventory"
    );
    setHistoryData(filteredData);
  } catch (err) {
    console.error("Error fetching fine goods data:", err);
  }
};


  useEffect(() => {
    fetchProjects();
    fetchHistoryData();
  }, []);

const fetchUsers = async () => {
  const token = sessionStorage.getItem("token");
  try {
    const res = await axios.get(`${MAIN_BASE}users/getusers`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    
    setUsers(res.data.users || []);
  } catch (err) {
    console.error("Error fetching users:", err);
    setUsers([]);
  }
};


const fetchLocations = async () => {
  const token = sessionStorage.getItem("token");
  try {
    const res = await axios.get(`${MAIN_BASE}loc`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLocations(res.data);
  } catch (err) {
    console.error("Error fetching locations:", err);
  }
};

const fetchSubLocations = async (locationId) => {
  const token = sessionStorage.getItem("token");
  try {
    const res = await axios.get(`${ASSET_NODE_BASE}sloc/${locationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSubLocations(res.data);
  } catch (err) {
    console.error("Error fetching sub locations:", err);
  }
};

const fetchSuppliers = async () => {
  const token = sessionStorage.getItem("token");
  try {
    const res = await axios.get(`${ASSET_NODE_BASE}supplier/suppliers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setSuppliers(res.data);
  } catch (err) {
    console.error("Error fetching suppliers:", err);
  }
};

  // const handleSubmitAllocation = async () => {
  //   if (!requestedQuantity || requestedQuantity <= 0) {
  //     setMessage("Please enter a valid requested quantity.");
  //     setMessageType("error");
  //     return;
  //   }

  //   if (allocationType === "allocation to user" && !selectedUser) {
  //     setMessage("Please select a user.");
  //     setMessageType("error");
  //     return;
  //   }

  //   if (
  //     allocationType === "allocation to location" &&
  //     (!selectedLocation || !selectedSubLocation)
  //   ) {
  //     setMessage("Please select both location and sub-location.");
  //     setMessageType("error");
  //     return;
  //   }

  //   const payload = {
  //     project_id: selectedLog.project_id,
  //     requested_quantity: Number(requestedQuantity),
  //     requested_by: userId,
  //     pricing_type: "default",
  //     allocation_type: allocationType,
  //   };

  //   if (allocationType === "allocation to user") {
  //     payload.user_id = selectedUser.user_id;
  //     payload.user_name = `${selectedUser.first_name} ${selectedUser.last_name}`;
  //   } else if (allocationType === "allocation to location") {
  //     payload.location_id = selectedSubLocation;
  //   }

  //   try {
  //     const res = await axios.post(
  //       "https://saaspro.softtrails.net/saas/asset/pro/processlifecycle/fine-goods/mapping/request",
  //       payload
  //     );

  //     setMessage("Allocation request submitted successfully.");
  //     setMessageType("success");
  //     setTimeout(() => {
  //       setAllocationModal(false);
  //       resetAllocationState();
  //     }, 1500);
  //   } catch (err) {
  //     const errorMsg =
  //       err?.response?.data?.error || "Error submitting allocation request";
  //     setMessage(errorMsg);
  //     setMessageType("error");
  //   }
  // };


const handleSubmitAllocation = async () => {
  const token = sessionStorage.getItem("token");

  if (!requestedQuantity || requestedQuantity <= 0) {
    setMessage("Please enter a valid requested quantity.");
    setMessageType("error");
    return;
  }

  if (allocationType === "allocation to user" && !selectedUser) {
    setMessage("Please select a user.");
    setMessageType("error");
    return;
  }

  if (
    allocationType === "allocation to location" &&
    (!selectedLocation || !selectedSubLocation)
  ) {
    setMessage("Please select both location and sub-location.");
    setMessageType("error");
    return;
  }

  // ✅ Prepare batches array
  const batchesArray = [
    {
      batch_id: selectedLog.id, // Fine goods batch ID
      allocated_quantity: Number(requestedQuantity),
    },
  ];

  // ✅ Base payload (common fields only)
  const payload = {
    project_id: Number(selectedLog.project_id),
    pricing_type: "default", // or "discount" if needed
    requested_by: userId,
    allocation_type: allocationType,
    batches: batchesArray,
    action: "FineGoodsMapping",
  };

  // ✅ Add fields only for user allocation
  if (allocationType === "allocation to user") {
    payload.suplierid = selectedUser.user_id;
    payload.user_name = `${selectedUser.first_name} ${selectedUser.last_name}`;
  }

  // ✅ Add field only for location allocation
  if (allocationType === "allocation to location") {
    payload.location_id = selectedSubLocation;
  }

  try {
    const res = await axios.post(
      `${ASSET_NODE_BASE}processlifecycle/fine-goods/Manual/mappingss`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Added token
      }
    );

    setMessage("Allocation request submitted successfully.");
    setMessageType("success");
    setTimeout(() => {
      setAllocationModal(false);
      resetAllocationState();
    }, 1500);
  } catch (err) {
    const errorMsg =
      err?.response?.data?.error || "Error submitting allocation request";
    setMessage(errorMsg);
    setMessageType("error");
  }
};



  const handleAllocateClick = (log) => {
    setSelectedLog(log);
    setAllocationModal(true);
    setAllocationType("");
    setAllocationStep(1);
  };


  const filteredData = historyData
    .filter((item) =>
      selectedProject ? item.project_id === selectedProject : true
    )
    .filter((item) =>
      item.project_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentLogs = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const openModal = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };
  // const handleSubmitVendorAllocation = async () => {
  //   if (!selectedSupplier) {
  //     setMessage("Please select a vendor.");
  //     setMessageType("error");
  //     return;
  //   }

  //   if (!requestedQuantity || requestedQuantity <= 0) {
  //     setMessage("Please enter a valid requested quantity.");
  //     setMessageType("error");
  //     return;
  //   }

  //   if (!pricingType) {
  //     setMessage("Please select a pricing type.");
  //     setMessageType("error");
  //     return;
  //   }

  //   if (
  //     (pricingType === "discount" && (!discount || discount <= 0)) ||
  //     (pricingType === "manual" && (!manualPrice || manualPrice <= 0)) ||
  //     (pricingType === "markup" && (!markup || markup <= 0))
  //   ) {
  //     setMessage("Please enter a valid value for the selected pricing type.");
  //     setMessageType("error");
  //     return;
  //   }

  //   const payload = {
  //     project_id: selectedLog.project_id,
  //     user_id: selectedSupplier.id,
  //     user_name: selectedSupplier.supplier_name,
  //     requested_quantity: Number(requestedQuantity),
  //     pricing_type: pricingType,
  //     requested_by: userId,
  //     allocation_type: "allocation to vendor",
  //   };

  //   if (pricingType === "discount") {
  //     payload.discount_percentage = Number(discount);
  //   } else if (pricingType === "manual") {
  //     payload.manual_price = Number(manualPrice);
  //   } else if (pricingType === "markup") {
  //     payload.additional_markup_percentage = Number(markup);
  //   }

  //   try {
  //     const res = await axios.post(
  //       "https://saaspro.softtrails.net/saas/asset/pro/processlifecycle/fine-goods/mapping/request",
  //       payload
  //     );

  //     setMessage("Vendor allocation submitted successfully.");
  //     setMessageType("success");
  //     setTimeout(() => {
  //       setAllocationModal(false);
  //       resetVendorAllocationStates();
  //     }, 1500);
  //   } catch (err) {
  //     const errorMsg =
  //       err?.response?.data?.error || "Error submitting vendor allocation";
  //     setMessage(errorMsg);
  //     setMessageType("error");
  //   }
  // };


const handleSubmitVendorAllocation = async () => {
  const token = sessionStorage.getItem("token"); // ✅ Get token from sessionStorage

  if (!selectedSupplier) {
    setMessage("Please select a vendor.");
    setMessageType("error");
    return;
  }

  if (!requestedQuantity || requestedQuantity <= 0) {
    setMessage("Please enter a valid requested quantity.");
    setMessageType("error");
    return;
  }

  if (!pricingType) {
    setMessage("Please select a pricing type.");
    setMessageType("error");
    return;
  }

  if (
    (pricingType === "discount" && (!discount || discount <= 0)) ||
    (pricingType === "manual" && (!manualPrice || manualPrice <= 0)) ||
    (pricingType === "markup" && (!markup || markup <= 0))
  ) {
    setMessage("Please enter a valid value for the selected pricing type.");
    setMessageType("error");
    return;
  }

  // ✅ Batches array
  const batchesArray = [
    {
      batch_id: selectedLog.id,
      allocated_quantity: Number(requestedQuantity),
    },
  ];

  const payload = {
    project_id: Number(selectedLog.project_id),
    suplierid: selectedSupplier.id,
    user_name: selectedSupplier.supplier_name,
    pricing_type: pricingType,
    requested_by: userId,
    allocation_type: "allocation to vendor",
    warranty_expiry_date: warrantyExpiryDate,
    batches: batchesArray,
    action: "FineGoodsMapping",
  };

  // ✅ Add pricing type details dynamically
  if (pricingType === "discount") {
    payload.discount_percentage = Number(discount);
  } else if (pricingType === "manual") {
    payload.manual_price = Number(manualPrice);
  } else if (pricingType === "markup") {
    payload.additional_markup_percentage = Number(markup);
  }

  try {
    const res = await axios.post(
     `${ASSET_NODE_BASE}processlifecycle/fine-goods/Manual/mappingss`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Added token
      }
    );

    setMessage("Vendor allocation submitted successfully.");
    setMessageType("success");
    setTimeout(() => {
      setAllocationModal(false);
      resetVendorAllocationStates();
    }, 1500);
  } catch (err) {
    const errorMsg =
      err?.response?.data?.error || "Error submitting vendor allocation";
    setMessage(errorMsg);
    setMessageType("error");
  }
};


  const resetVendorAllocationStates = () => {
    setPricingType("");
    setVendorAllocationStep(1);
    setSelectedSupplier(null);
    setRequestedQuantity("");
    setDiscount("");
    setManualPrice("");
    setMarkup("");
  };
  const resetAllocationState = () => {
    setAllocationModal(false);
    setAllocationType("");
    setAllocationStep(1);
    setRequestedQuantity("");
    setSelectedSupplier(null);
    setSelectedUser(null);
    setSelectedLocation("");
    setSelectedSubLocation("");
    setPricingType("");
    setDiscount("");
    setManualPrice("");
    setMarkup("");
  };

  const resetToStep1 = () => {
    setAllocationStep(1);
    setRequestedQuantity("");
    setSelectedUser(null);
    setSelectedLocation("");
    setSelectedSubLocation("");
    setSelectedSupplier(null);
    setPricingType("");
    setDiscount("");
    setManualPrice("");
    setMarkup("");
  };

  return (
    <div className="p-4">
      {/* Dropdown & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[300px]"
        >
          <option value="">All Projects</option>
          {projects.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.projectName}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search by Project Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md w-full md:w-[300px]"
        />
      </div>

      {/* Table */}
      <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
        <div className="flex flex-col max-h-[70vh] overflow-y-auto">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse ">
              <thead className="text-[16px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                <tr>
                  <th className="p-5 text-left">S.No</th>
                  <th className="p-5 text-left">Batch No</th>
                  <th className="p-5 text-left">Project Name</th>
                  <th className="p-5 text-left">Units Produced</th>
                  <th className="p-5 text-left"> Available Units </th>
                   <th className="p-5 text-left"> Allocated Units </th>
                  <th className="p-5 text-left">Cost/Unit</th>
                  <th className="p-5 text-left">Selling Price/Unit</th>
                  <th className="p-5 text-left">Total Selling Price</th>
                  <th className="p-5 text-left">Status</th>
                  <th className="p-5 text-left">Stage</th>
                  <th className="p-5 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLogs.length > 0 ? (
                  currentLogs.map((log, idx) => (
                    <tr
                      key={log.id}
                      className={`cursor-pointer border-t ${
                        idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                      }`}
                      onClick={() => openModal(log)}
                    >
                      <td className="px-5 py-3">{indexOfFirst + idx + 1}</td>
                      <td className="px-5 py-3">{log.batch_number}</td>
                      <td className="px-5 py-3">{log.project_name}</td>
                      <td className="px-5 py-3">{log.quantity}</td>
                       <td className="px-5 py-3">{log.available_quantity}</td>
                      <td className="px-5 py-3">{log.used_quantity}</td>
                      <td className="px-5 py-3">₹{log.cost_per_unit}</td>
                      <td className="px-5 py-3">
                        ₹{log.selling_price_per_unit}
                      </td>
                      <td className="px-5 py-3">₹{log.total_selling_price}</td>
                      <td className="px-5 py-3 font-medium">
                        <span className={getTextColorClass(log.status)}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium">
                        <span className={getTextColorClass(log.stages)}>
                          {log.stages}
                        </span>
                      </td>

                      <td
                        className="px-5 py-3 text-blue-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleAllocateClick(log); // Open allocation modal
                        }}
                      >
                        <FaEye />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="10"
                      className="py-6 px-4 text-center text-gray-500"
                    >
                      No production data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sticky bottom-0 bg-white flex justify-center items-center gap-2 p-3 border-t border-gray-300">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                &lt;
              </button>
              <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
                {currentPage}
              </span>
              <span className="text-sm font-medium">of</span>
              <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">
                {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 relative animate-fadeIn">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-lg"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
              Fine Goods Details
            </h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Project Name:</strong> {selectedLog.project_name}
              </p>
              <p>
                <strong>Batch No:</strong> {selectedLog.batch_number}
              </p>
              <p>
                <strong>Units Produced:</strong> {selectedLog.quantity}
              </p>
              <p>
                <strong>Cost/Unit:</strong> ₹{selectedLog.cost_per_unit}
              </p>
              <p>
                <strong>Total Cost:</strong> ₹{selectedLog.total_cost}
              </p>
              <p>
                <strong>Selling Price/Unit:</strong> ₹
                {selectedLog.selling_price_per_unit}
              </p>
              <p>
                <strong>Total Selling Price:</strong> ₹
                {selectedLog.total_selling_price}
              </p>
              <p>
                <strong>Profit:</strong> ₹{selectedLog.expected_profit}
              </p>
              <p>
                <strong>Profit Margin:</strong> {selectedLog.profit_margin}%
              </p>
              <p>
                <strong>Stage:</strong> {selectedLog.stages}
              </p>
              <p>
                <strong>Status:</strong> {selectedLog.status}
              </p>
              <p>
                <strong>Repository Date:</strong>{" "}
                {new Date(selectedLog.repository_at).toLocaleDateString(
                  "en-GB"
                )}
              </p>
              {/* <p><strong>QR Code:</strong> <a href={selectedLog.qr_code} className="text-blue-600 underline" target="_blank" rel="noreferrer">View QR</a></p> */}
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Allocation Modal */}
     {allocationModal && selectedLog && (
  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
    <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 relative overflow-y-auto max-h-[90vh]">
      {/* Close Button */}
      <button
        className="absolute top-3 right-4 text-gray-500 hover:text-red-600 text-2xl"
        onClick={() => resetAllocationState()}
      >
        ×
      </button>

      {/* Step 1: Choose Type */}
      {allocationStep === 1 && (
        <div className="space-y-6 text-center">
          <h2 className="text-2xl font-bold text-blue-700">Select Allocation Type</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => {
                setAllocationType("allocation to user");
                setAllocationStep(2);
                fetchUsers();
              }}
              className="flex-1 min-w-[140px] py-3 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium"
            >
              Allocation To User
            </button>
            <button
              onClick={() => {
                setAllocationType("allocation to location");
                setAllocationStep(2);
                fetchLocations();
              }}
              className="flex-1 min-w-[140px] py-3 px-4 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium"
            >
              Allocation To Location
            </button>
            <button
              onClick={() => {
                setAllocationType("allocation to vendor");
                setAllocationStep(3);
                fetchSuppliers();
              }}
              className="flex-1 min-w-[140px] py-3 px-4 rounded-md bg-purple-600 hover:bg-purple-700 text-white font-medium"
            >
              Allocation To Vendor
            </button>
          </div>
        </div>
      )}

      {/* Step 2: User/Location */}
      {allocationStep === 2 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-gray-800">
            {allocationType === "allocation to user" ? "Allocate to User" : "Allocate to Location"}
          </h2>

          {allocationType === "allocation to user" ? (
            <select
              className="w-full border rounded-md px-4 py-2"
              value={selectedUser?.user_id || ""}
              onChange={(e) =>
                setSelectedUser(users.find((u) => u.user_id === parseInt(e.target.value)))
              }
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.user_id} value={user.user_id}>
                  {user.first_name} {user.last_name}
                </option>
              ))}
            </select>
          ) : (
            <>
              <select
                className="w-full border rounded-md px-4 py-2"
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  fetchSubLocations(e.target.value);
                }}
              >
                <option value="">Select Location</option>
                {locations.map((loc) => (
                  <option key={loc.location_id} value={loc.location_id}>
                    {loc.locality}, {loc.city}
                  </option>
                ))}
              </select>

              <select
                className="w-full border rounded-md px-4 py-2"
                value={selectedSubLocation}
                onChange={(e) => setSelectedSubLocation(e.target.value)}
              >
                <option value="">Select Sub-Location</option>
                {subLocations.map((sloc) => (
                  <option key={sloc.sub_location_id} value={sloc.sub_location_id}>
                    Building {sloc.building_no}, Floor {sloc.floor}, Section {sloc.section}
                  </option>
                ))}
              </select>
            </>
          )}

          <input
            type="number"
            min="1"
            placeholder="Enter Requested Quantity"
            value={requestedQuantity}
            onChange={(e) => setRequestedQuantity(Number(e.target.value))}
            className="w-full border px-4 py-2 rounded-md"
          />

          <div className="flex justify-between pt-4">
            <button
              onClick={resetToStep1}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
            >
              ← Back
            </button>
            <button
              onClick={() => {
                if (!requestedQuantity || requestedQuantity <= 0) {
                  setMessage("Enter a valid quantity");
                  setMessageType("error");
                  return;
                }
                if (allocationType === "allocation to user" && !selectedUser) {
                  setMessage("Select a user");
                  setMessageType("error");
                  return;
                }
                if (
                  allocationType === "allocation to location" &&
                  (!selectedLocation || !selectedSubLocation)
                ) {
                  setMessage("Select location and sub-location");
                  setMessageType("error");
                  return;
                }
                handleSubmitAllocation();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Vendor + Pricing */}
    {/* Step 3: Vendor + Pricing */}
{allocationStep === 3 && (
  <div className="space-y-6">
    <h2 className="text-xl font-bold text-gray-800 border-b pb-2">
      Allocate to Vendor
    </h2>

    {/* Vendor Selection */}
    <select
      className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
      value={selectedSupplier?.id || ""}
      onChange={(e) => {
        const supplier = suppliers.find((s) => s.id === parseInt(e.target.value));
        setSelectedSupplier(supplier);
      }}
    >
      <option value="">Select Vendor</option>
      {suppliers.map((supplier) => (
        <option key={supplier.id} value={supplier.id}>
          {supplier.supplier_name}
        </option>
      ))}
    </select>

    {/* Requested Quantity */}
    <input
      type="number"
      min="1"
      placeholder="Enter Requested Quantity"
      value={requestedQuantity}
      onChange={(e) => setRequestedQuantity(Number(e.target.value))}
      className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
    />

    {/* Warranty Expiry Date */}
    <div className="flex flex-col gap-2">
      <label className="text-gray-700 font-medium">Warranty Expiry Date</label>
      <input
        type="date"
        value={warrantyExpiryDate}
        onChange={(e) => setWarrantyExpiryDate(e.target.value)}
        className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
      />
    </div>

    {/* Pricing Options */}
    <div className="space-y-2">
      {["discount", "manual", "markup"].map((type) => (
        <label key={type} className="flex items-center space-x-2">
          <input
            type="radio"
            name="pricingType"
            value={type}
            checked={pricingType === type}
            onChange={() => setPricingType(type)}
          />
          <span className="capitalize">
            {type === "manual"
              ? "Manual Price (₹)"
              : `${type.charAt(0).toUpperCase() + type.slice(1)} (%)`}
          </span>
        </label>
      ))}
    </div>

    {/* Pricing Inputs */}
    {pricingType === "discount" && (
      <input
        type="number"
        min="1"
        placeholder="Enter Discount %"
        value={discount}
        onChange={(e) => setDiscount(Number(e.target.value))}
        className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
      />
    )}
    {pricingType === "manual" && (
      <input
        type="number"
        min="1"
        placeholder="Enter Manual Price ₹"
        value={manualPrice}
        onChange={(e) => setManualPrice(Number(e.target.value))}
        className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
      />
    )}
    {pricingType === "markup" && (
      <input
        type="number"
        min="1"
        placeholder="Enter Markup %"
        value={markup}
        onChange={(e) => setMarkup(Number(e.target.value))}
        className="w-full border px-4 py-2 rounded-md focus:ring-2 focus:ring-purple-500"
      />
    )}

    {/* Action Buttons */}
    <div className="flex justify-between pt-4">
      <button
        onClick={resetToStep1}
        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
      >
        ← Back
      </button>
      <button
        onClick={() => {
          if (!selectedSupplier) {
            setMessage("Select a vendor");
            setMessageType("error");
            return;
          }
          if (!requestedQuantity || requestedQuantity <= 0) {
            setMessage("Enter valid quantity");
            setMessageType("error");
            return;
          }
          if (!warrantyExpiryDate) {
            setMessage("Select warranty expiry date");
            setMessageType("error");
            return;
          }
          if (!pricingType) {
            setMessage("Choose pricing type");
            setMessageType("error");
            return;
          }
          if (
            (pricingType === "discount" && (!discount || discount <= 0)) ||
            (pricingType === "manual" && (!manualPrice || manualPrice <= 0)) ||
            (pricingType === "markup" && (!markup || markup <= 0))
          ) {
            setMessage("Enter a valid pricing value");
            setMessageType("error");
            return;
          }
          handleSubmitVendorAllocation();
        }}
        className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md shadow-md"
      >
        Submit
      </button>
    </div>
  </div>
)}

    </div>
  </div>
)}


      {/* Message Modal */}
      <MessageModal
        message={message}
        type={messageType}
        setMessage={setMessage}
      />
    </div>
  );
};

export default ProductionInventory;
