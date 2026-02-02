// import React, { useState, useEffect } from "react";
// import {
//   FaHome,
//   FaSignOutAlt,
//   FaEdit,
//   FaEye,
//   faQrcode,
//   FaRegFileAlt,
// } from "react-icons/fa";
// import { BiQr } from "react-icons/bi";
// import { useNavigate } from "react-router-dom";
// //
// import axios from "axios";
// import MessageModal from "./MessageModal";
// import { QRCodeCanvas } from "qrcode.react"; // Use QRCodeCanvas
// import Select from "react-select";
// import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
// const AssetManagementPage = () => {
//   const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [dynamicFields, setDynamicFields] = useState([]);
//   const [formData, setFormData] = useState({});
//   const [selectedCategory, setSelectedCategory] = useState("");
//   const [tableData, setTableData] = useState({ columns: [], data: [] });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredData, setFilteredData] = useState([]);
//   const [editingAssetId, setEditingAssetId] = useState(null);
//   const [formErrors, setFormErrors] = useState({});
//   const [isSubmitMapModalState, setIsSubmitMapModalState] = useState({
//     isOpen: false,
//   });
//   const [selectedAsset, setSelectedAsset] = useState(null);
//   const [locationDetails, setLocationDetails] = useState([]);
//   const [startDate, setStartDate] = useState(null);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(25);
//   const [allUsers, setAllUsers] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [type, setType] = useState("");
//   const [categoryId, setCategoryId] = useState("");
//   const [uniqueId, setUniqueId] = useState(null);
//   const [subLocations, setSubLocations] = useState([]);
//   const [selectedLocation, setSelectedLocation] = useState(
//     isSubmitMapModalState?.locationId || ""
//   );

//   const [mappingType, setMappingType] = useState(null);
//   const [pagination, setPagination] = useState({
//     total: 0,
//     limit: 20,
//     offset: 0,
//     nextOffset: null,
//     prevOffset: null,
//   });
  
//   const [debounceTimer, setDebounceTimer] = useState(null);
  
//   const [isPaginating, setIsPaginating] = useState(false);
//   useEffect(() => {
//     const token = sessionStorage.getItem("token");

//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get(
//           `${JAVA_BASE}api/categories/movable`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setCategories(response.data || []);
//       } catch (error) {
//         console.error("Error fetching categories:", error.message);
//       }
//     };

//     const fetchLocations = async () => {
//       try {
//         const locationResponse = await axios.get(
//           `${MAIN_BASE}loc`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setLocationDetails(locationResponse.data || []);
//       } catch (error) {
//         console.log("Error fetching locations", error);
//       }
//     };

//     const fetchAllUsers = async () => {
//       try {
//         const userResponse = await axios.get(
//           `${MAIN_BASE}/getusers`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setAllUsers(userResponse.data || []);
//       } catch (error) {
//         console.log("Error fetching users", error);
//       }
//     };

//     fetchCategories();
//     fetchTableData();
//     fetchLocations();
//     fetchAllUsers();
//   }, []);
// useEffect(() => {
//   if (selectedCategory) {
//     fetchTableData(selectedCategory);
//   }
// }, [selectedCategory]);

//   useEffect(() => {
//     const token = sessionStorage.getItem("token");

//     if (selectedLocation) {
//       axios
//         .get(
//           `${ASSET_NODE_BASE}sloc/${selectedLocation}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         )
//         .then((response) => {
//           setSubLocations(response.data || []);
//         })
//         .catch((error) => {
//           console.error("Error fetching sub-locations:", error);
//         });
//     } else {
//       setSubLocations([]);
//     }
//   }, [selectedLocation]);

//   console.log("all users", allUsers);

//   const fetchTableData = async (categoryName = selectedCategory) => {
//     setIsLoading(true);
//     const token = sessionStorage.getItem("token");

//     try {
//       console.log("Fetching table data for category:", categoryName);
//       const response = await axios.get(
//        `${ASSET_NODE_BASE}table-data/${categoryName}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       console.log("Fetched data:", response.data);

//       setTableData({
//         columns: response.data.columns || [],
//         data: response.data.data || [],
//       });
//       setDynamicFields(response.data.columns || []);
//       setFilteredData(response.data.data || []);

//       setFormErrors({});
//     } catch (error) {
//       console.error("Error fetching table data:", error.message);
//       setFormErrors({
//         general: "Error fetching table data. Please try again.",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: value,
//     });

//     if (name === "category") {
//       setSelectedCategory(value);
//       fetchTableData(value);
//       handleEdit(value);
//     }
//   };
//   console.log(tableData);

//   ;

//  const handleSearch = (e) => {
//   const searchValue = e.target.value.toLowerCase();
//   setSearchTerm(e.target.value);

//   if (!searchValue.trim()) {
//     // If search bar is empty, show all data
//     setFilteredData(tableData.data || []);
//     return;
//   }

//   const filtered = (tableData.data || []).filter((row) =>
//     Object.values(row || {}).some((val) => {
//       if (val === null || val === undefined) return false; // ✅ Prevent crash
//       return val.toString().toLowerCase().includes(searchValue);
//     })
//   );

//   setFilteredData(filtered);
// };


//   const paginate = (data) => {
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     return data.slice(indexOfFirstItem, indexOfLastItem);
//   };
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const handleEdit = (unique_id) => {
//     const asset = tableData.data.find((row) => row.unique_id === unique_id);
//     if (asset) {
//       const parsedData = {};
//       Object.keys(asset).forEach((key) => {
//         const value = asset[key];
//         if (key.includes("date")) {
//           parsedData[key] = value ? new Date(value) : null; // Format as 'yyyy-MM-dd'
//           // Handle empty or invalid dates
//         } else if (typeof value === "string" && !isNaN(value)) {
//           parsedData[key] = parseFloat(value);
//         } else {
//           parsedData[key] = value;
//         }
//       });
//       setFormData(parsedData);
//       setEditingAssetId(unique_id);
//       setSelectedAsset({
//         assetId: asset.unique_id,
//         assetname: asset["Asset Name"] || "", // 🛠️ get exact key from backend
//       });
//       setIsAssetModalOpen(true);
//     }
//   };

//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
//     const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits for day

//     return `${year}-${month}-${day}`;
//   };

//   const filteredDynamicFields = dynamicFields.filter(
//     (field) =>
//       field !== "unique_id" &&
//       field !== "created_at" &&
//       field !== "status" &&
//       field !== "stages"
//   );

//   const userId = sessionStorage.getItem("userId");
//   const [userData, setUserData] = useState("");
//   const navigate = useNavigate();
//   const getToken = () => {
//     const token = sessionStorage.getItem("token");
//     return token;
//   };
//   const token = getToken();
//   console.log("Retrieved token:", token);

//   useEffect(() => {
//     const userId = sessionStorage.getItem("userId");
//     console.log("UserId:", userId);
//     if (userId) {
//       const fetchUserData = async () => {
//         try {
//           console.log("Fetching data for userId:", userId);
//           const response = await axios.get(
//             `${MAIN_BASE}users/id_user/${userId}`,
//             {
//               headers: {
//                 Authorization: `Bearer ${token}`,
//               },
//             }
//           );
//           console.log("API Response:", response);
//           if (response.data) {
//             const user = response.data;
//             console.log("User:", user);
//             setUserData(user);
//           } else {
//             console.log("No user data found");
//           }
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//         }
//       };
//       fetchUserData();
//     }
//   }, [token, userId]);

//   console.log({ userData });

//   const handleLogout = () => {
//     sessionStorage.removeItem("token");
//     navigate("/");
//   };

//   const handleHome = () => {
//     navigate("/Cards");
//   };


//   const parseResponse = async (response) => {
//     const contentType = response.headers.get("Content-Type");
//     if (contentType && contentType.includes("application/json")) {
//       return await response.json();
//     } else {
//       return await response.text();
//     }
//   };


//   const handleApproveMappedAsset = async (unique_id) => {
//     const userId = sessionStorage.getItem("userId");
//     const token = sessionStorage.getItem("token"); // ✅ Token

//     if (!userId) {
//       console.error("User ID is missing or invalid in sessionStorage.");
//       setMessage("User not logged in or user ID is missing.");
//       setMessageType("error");
//       setIsModalOpen(true);
//       return;
//     }

//     if (!token) {
//       setMessage("Authentication token missing. Please log in again.");
//       setMessageType("error");
//       setIsModalOpen(true);
//       return;
//     }

//     const parsedUserId = parseInt(userId, 10);
//     if (isNaN(parsedUserId)) {
//       console.error("Invalid User ID retrieved from sessionStorage.");
//       setMessage("Invalid User ID.");
//       setMessageType("error");
//       setIsModalOpen(true);
//       return;
//     }

//     if (!selectedCategory) {
//       console.error("No category selected.");
//       setMessage("Please select a category.");
//       setMessageType("error");
//       setIsModalOpen(true);
//       return;
//     }

//     const selectedCategoryObj = categories.find(
//       (category) => category.categoriesname === selectedCategory
//     );

//     if (!selectedCategoryObj) {
//       console.error("Category not found in the categories list.");
//       setMessage("Invalid or missing category.");
//       setMessageType("error");
//       setIsModalOpen(true);
//       return;
//     }

//     const selectedCategoryId = selectedCategoryObj.categoryId;

//     const payload = {
//       category_id: selectedCategoryId,
//       user_id: parsedUserId,
//       new_stages: "Mapped",
//       sub_stages: "Approved",
//       action: "MappingApprove",
//       submodule: "Movable"
//     };

//     try {
//       const response = await fetch(
//        `
// ${ASSET_NODE_BASE}lifecycle/update-asset-status/${unique_id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("Approval successful:", data);

//       try {
//         const historyPayload = {
//           assetId: parseInt(unique_id, 10),
//           categoryId: selectedCategoryId,
//           updatedBy: parsedUserId,
//           previousSubStages: "AwaitingApproval",
//           currentSubStages: "Approved",
//           currentStatus: "Inventory",
//           previousStatus: "Inventory",
//           action: "Asset Mapping Approved",
//           locationId:
//             mappingType === "user-with-location"
//               ? parseInt(isSubmitMapModalState?.subLocationId, 10)
//               : null,
//           assetname: selectedAsset?.assetname || "",
//         };

//         const historyResponse = await fetch(
//           `${JAVA_BASE}api/assethistory/insert-history`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${token}`,
//             },
//             body: JSON.stringify(historyPayload),
//           }
//         );

//         const historyData = await historyResponse.json();
//         if (!historyResponse.ok || historyData.error) {
//           throw new Error(
//             historyData.message || "Failed to log asset history."
//           );
//         }

//         console.log("Asset History Recorded:", historyData);
//       } catch (historyError) {
//         console.error("Asset History API error:", historyError);
//       }

//       setIsAssetModalOpen(false);
//       setMessage("Asset Allocation Successfully Approved!");
//       setMessageType("success");

//        await fetchTableData(selectedCategory);
//     } catch (error) {
//       console.error("Approval failed:", error);
//       setMessage("Failed to approve the asset. Please try again.");
//       setMessageType("error");
//       setIsAssetModalOpen(false);
//     }
//   };

//   const formatStages = (stages) => {
//     if (!stages) return "";

//     const formattedStage = stages
//       .replace(/([a-z])([A-Z])/g, "$1 $2")
//       .replace(
//         /([A-Z][a-z]*)/g,
//         (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//       )
//       .trim();

//     const colorClass = getStageColor(stages);

//     return (
//       <span
//         className={`px-2 py-1 rounded-full text-sm font-medium ${colorClass}`}
//       >
//         {formattedStage}
//       </span>
//     );
//   };
//   const getRandomColor = () => {
//     const colors = ["text-blue-500"];
//     return colors[Math.floor(Math.random() * colors.length)];
//   };
//   const stageColors = {};

//   const getStageColor = (stage) => {
//     if (!stageColors[stage]) {
//       stageColors[stage] = getRandomColor();
//     }
//     return stageColors[stage];
//   };

//   const categoryOptions = categories.map((category) => ({
//     value: category.categoriesname,
//     label: category.categoriesname,
//   }));

//   return (
//     <div className="flex flex-col overflow-hidden">
//       <div className="flex">
//         <div className=" w-full">
//           <div className="p-4 md:p-5 flex flex-col space-y-6 min-h-screen">
//             <div className="flex items-center justify-between flex-wrap space-y-4 md:space-y-0">
//               <div className="flex items-center space-x-4">
//                 <div className="flex flex-col">
//                   <label
//                     htmlFor="category"
//                     className="block mb-1 text-sm font-medium text-gray-700"
//                   ></label>
//                   <div className="w-[250px]"></div>

//                   <Select
//                     options={categoryOptions}
//                     value={categoryOptions.find(
//                       (opt) => opt.value === selectedCategory
//                     )}
//                     onChange={(selectedOption) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         category: selectedOption.value,
//                       })) || setSelectedCategory(selectedOption.value)
//                     }
//                     placeholder="Select Asset category"
//                     className="react-select-container"
//                     classNamePrefix="react-select"
//                     isSearchable
//                   />
//                 </div>
//               </div>

//               {/* Right Section: Search Bar */}
// <div className="relative w-[250px] mt-4 md:mt-0">
//   <input
//     type="text"
//     placeholder="Search assets..."
//     className="w-full h-[42px] pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
//     value={searchTerm}
//     onChange={handleSearch}
//   />
//   {/* Search Icon */}
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
//     fill="none"
//     viewBox="0 0 24 24"
//     stroke="currentColor"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth={2}
//       d="M21 21l-4.35-4.35m1.15-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
//     />
//   </svg>
// </div>

//             </div>

//             {/* Table */}
//             <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
//               <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
//                 <table className="min-w-full table-auto text-sm border-collapse">
//                   <thead className="sticky top-0  bg-white border-b-2 border-black text-[16px] font-medium ">
//                     <tr>
//                       {selectedCategory && (
//                         <th className="p-5 text-center">S.no</th>
//                       )}
//                       {[
//                         "Asset Name",
//                         "Created On",
//                         "Status",
//                         "Stage",
//                         "Sub Stage",
//                         "Next Stage",
//                         "Assign User",
//                       ].map((column, index) => (
//                         <th
//                           key={index}
//                           className="p-5 text-center "
//                         >
//                           {column}
//                         </th>
//                       ))}
//                       {selectedCategory && (
//                         <th className="p-5 text-center">Action</th>
//                       )}
//                     </tr>
//                   </thead>

//                   <tbody className="bg-white divide-y divide-gray-200">
//                     {paginate(
//                       filteredData.filter(
//                         (asset) =>
//                           asset.sub_stages === "AwaitingApproval" &&
//                           asset.toapprove === "Mapping" &&
//                           asset.stages === "Active"
//                       )
//                     ).map((asset, index) => (
//                       <React.Fragment key={index}>
//                         <tr
//                           className={`cursor-pointer ${
//                             index % 2 === 0 ? "bg-blue-50" : "bg-white"
//                           } hover:bg-blue-100`}
//                         >
//                           {selectedCategory && (
//                             <td className="px-5 py-3 text-center">
//                               {(currentPage - 1) * itemsPerPage + index + 1}
//                             </td>
//                           )}

//                           {[
//                             "Asset Name",
//                             "created_at",
//                             "status",
//                             "stages",
//                             "sub_stages",
//                             "toapprove",
//                             "name",
//                           ].map((column, colIndex) => (
//                             <td
//                               key={colIndex}
//                               className="px-5 py-3 text-center truncate"
//                               title={asset[column]}
//                             >
//                               {column === "created_at"
//                                 ? formatDate(asset[column])
//                                 : column === "stages" || column === "sub_stages"
//                                 ? formatStages(asset[column])
//                                 : asset[column] || ""}
//                             </td>
//                           ))}

//                           {selectedCategory && (
//                             <td className="px-5 py-3 text-center">
//                               <div className="flex items-center justify-center gap-3">
//                                 <button
//                                   className="text-red-600 hover:text-red-800"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     handleEdit(asset.unique_id);
//                                   }}
//                                   title="View Asset"
//                                 >
//                                   <FaEye className="text-sm md:text-base" />
//                                 </button>

//                                 {Object.entries(asset).map(([key, value]) => {
//                                   if (
//                                     value &&
//                                     typeof value === "object" &&
//                                     value.url
//                                   ) {
//                                     return (
//                                       <a
//                                         key={key}
//                                         href={value.url}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-green-600 hover:text-green-800"
//                                         title={`View Document: ${key}`}
//                                         onClick={(e) => e.stopPropagation()}
//                                       >
//                                         <FaRegFileAlt className="text-sm md:text-base" />
//                                       </a>
//                                     );
//                                   }
//                                   return null;
//                                 })}
//                               </div>
//                             </td>
//                           )}
//                         </tr>

//                         {selectedAsset &&
//                           selectedAsset.unique_id === asset.unique_id && (
//                             <tr className="bg-gray-50">
//                               <td
//                                 colSpan={selectedCategory ? 9 : 8}
//                                 className="p-4"
//                               >
//                                 <div className="relative">
//                                   <div className="flex justify-between items-center mb-4">
//                                     <h3 className="text-lg font-bold">
//                                       Asset Details
//                                     </h3>
//                                     <button
//                                       onClick={() => setSelectedAsset(null)}
//                                       className="text-red-600 hover:text-red-800 font-bold text-lg"
//                                     >
//                                       ✕
//                                     </button>
//                                   </div>
//                                   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                                     <div>
//                                       <strong>Asset Name:</strong> {asset.name}
//                                     </div>
//                                     <div>
//                                       <strong>Status:</strong> {asset.status}
//                                     </div>
//                                     <div>
//                                       <strong>Stages:</strong> {asset.stages}
//                                     </div>
//                                     <div>
//                                       <strong>Original Cost:</strong>{" "}
//                                       {asset.original_cost}
//                                     </div>
//                                     <div>
//                                       <strong>Created At:</strong>{" "}
//                                       {formatDate(asset.created_at)}
//                                     </div>
//                                   </div>
//                                 </div>
//                               </td>
//                             </tr>
//                           )}
//                       </React.Fragment>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>

//               {/* Pagination */}
//               {totalPages > 1 && (
//                 <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
//                   <button
//                     onClick={() =>
//                       handlePageChange(Math.max(currentPage - 1, 1))
//                     }
//                     disabled={currentPage === 1}
//                     className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
//                   >
//                     &lt;
//                   </button>

//                   <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
//                     {currentPage}
//                   </span>

//                   <span className="text-sm font-medium">of</span>

//                   <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">
//                     {totalPages}
//                   </span>

//                   <button
//                     onClick={() =>
//                       handlePageChange(Math.min(currentPage + 1, totalPages))
//                     }
//                     disabled={currentPage === totalPages}
//                     className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
//                   >
//                     &gt;
//                   </button>
//                 </div>
//               )}
//             </div>
// {/* Modal Section */}
// {isAssetModalOpen && (
//   <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//     <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2">
//       {/* Header */}
//       <div className="flex justify-between items-center bg-gray-100 p-4 rounded-t-lg">
//         <h2 className="text-lg font-bold text-gray-800">
//           {editingAssetId ? "Review Asset" : "Add Asset"}
//         </h2>
//         <button
//           onClick={() => setIsAssetModalOpen(false)}
//           className="text-red-500 hover:text-red-700 transition"
//         >
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="h-6 w-6"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M6 18L18 6M6 6l12 12"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Form */}
//       <form
      
//         className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
//       >
//         {/* Category Field */}
//         <div className="flex flex-col">
//           <label
//             htmlFor="category"
//             className="mb-1 text-sm font-medium text-gray-700"
//           >
//             Category
//           </label>
//           <select
//             name="category"
//             value={selectedCategory}
//             onChange={handleChange}
//             className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
//             disabled
//           >
//             <option value="">Select Asset category</option>
//             {categories.map((category, i) => (
//               <option key={i} value={category.categoriesname}>
//                 {category.categoriesname}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Dynamic Fields */}
//         {filteredDynamicFields
//           .filter(
//             (column) =>
//               ![
//                 "unique_id",
//                 "category_id",
//                 "status",
//                 "stages",
//                 "created_at",
//                 "id",
//                 "sub_stages",
//                 "name",
//                 "toapprove",
//               ].includes(column.columnName)
//           )
//           .map((field, index) => {
//             const isEditableField = [
//               "Original Cost",
//               "Useful Life",
//               "Scrap Value",
//             ].includes(field.columnName);

//             const fieldValue = field.columnName.includes("Date")
//               ? formData[field.columnName]
//                 ? new Date(formData[field.columnName])
//                     .toISOString()
//                     .split("T")[0]
//                 : ""
//               : formData[field.columnName] || "";

//             return (
//               <div key={index} className="flex flex-col mb-2 w-full">
//                 {fieldValue &&
//                 typeof fieldValue === "object" &&
//                 fieldValue.url ? (
//                   <>
//                     <label
//                       htmlFor={field.columnName}
//                       className="mb-1 text-sm font-medium text-gray-700"
//                     >
//                       View Document
//                     </label>
//                     <a
//                       href={fieldValue.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-600 underline hover:text-blue-800 font-bold text-sm transition-all duration-300"
//                       title="Click to view document"
//                     >
//                       {fieldValue.url.split("/").pop()}
//                     </a>
//                   </>
//                 ) : (
//                   <>
//                     <label
//                       htmlFor={field.columnName}
//                       className="mb-1 text-sm font-medium text-gray-700"
//                     >
//                       {field.columnName}
//                     </label>
//                     <input
//                       type="text"
//                       name={field.columnName}
//                       value={fieldValue}
//                       onChange={handleChange}
//                       className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
//                       disabled={!isEditableField}
//                     />
//                   </>
//                 )}

//                 {formErrors[field.columnName] && (
//                   <span className="text-red-600 text-sm">
//                     {formErrors[field.columnName]}
//                   </span>
//                 )}
//               </div>
//             );
//           })}

//         {formErrors.general && (
//           <p className="text-red-600 text-sm col-span-2">{formErrors.general}</p>
//         )}

//         {/* ✅ Single Approve Button */}
//         <div className="col-span-2 flex justify-end mt-4">
//           <button
//             type="button"
//             onClick={() => handleApproveMappedAsset(editingAssetId)}
//             className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition"
//           >
//             Approve
//           </button>
//         </div>
//       </form>
//     </div>
//   </div>
// )}



//           </div>
//         </div>
//       </div>
//       {/* Message Modal */}
//       <MessageModal
//         message={message}
//         type={messageType}
//         setMessage={setMessage}
//       />
//     </div>
//   );
// };
// export default AssetManagementPage;



/* ============================
   ASSET MANAGEMENT PAGE (UPDATED)
   ============================ */

import React, { useState, useEffect, useRef } from "react";
import { FaEye } from "react-icons/fa";
import Select from "react-select";
import axios from "axios";
import MessageModal from "./MessageModal";
import { ASSET_NODE_BASE, JAVA_BASE } from "../../config/apiBase";
import { useNavigate } from "react-router-dom";

/**
 * AssetManagementPage
 *
 * - Keeps your original table UI / pagination look & feel.
 * - Uses the asset-mapping-detailss API (by categoryId).
 * - Shows ONLY assets where:
 *      sub_stages === "AwaitingApproval"
 *      toapprove === "Mapping"
 *      stages === "Active"
 * - Shows allocation_type column (Type Of Allocation).
 * - Uses colored badges for Stage / Sub-stage / Allocation / Mapping status.
 * - Modal design follows the snippet you provided ("Asset Review" with sections).
 * - Approve button updates lifecyle (same payload you used earlier).
 *
 * Drop-in replacement for your previous component.
 */

const AssetManagementPage = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tableData, setTableData] = useState([]); // rows after server + filter
  const [page, setPage] = useState(1);
  const [limit] = useState(15); // matches your payload / pagination
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);

  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  // stage color cache so each stage keeps same color during session
  const stageColorsRef = useRef({});

  /* --------------------- fetch categories on mount --------------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${JAVA_BASE}api/categories/movable`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setCategories(res.data || []);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
    // do not auto-navigate here; keep same as your prior code
  }, [token]);

  /* ------------------ fetch table data with debounce ------------------ */
  useEffect(() => {
    if (!selectedCategory) {
      setTableData([]);
      return;
    }

    if (debounceTimer) clearTimeout(debounceTimer);
    const t = setTimeout(() => {
      fetchTableData();
    }, 300);
    setDebounceTimer(t);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, page, searchTerm]);

const fetchTableData = async () => {
  try {
    const catObj = categories.find((c) => c.categoriesname === selectedCategory);
    const categoryId = catObj?.categoryId;
    if (!categoryId) {
      setTableData([]);
      return;
    }

    const res = await axios.get(
      `${ASSET_NODE_BASE}asset-mapping-detailss/${categoryId}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        params: {
          page,
          limit,
          search: searchTerm || undefined,

          // 🔥 SEND FILTERS TO API (NO FRONTEND FILTER)
          sub_stages: "AwaitingApproval",
          toapprove: "Mapping",
          stages: "Active",
        },
      }
    );

    const raw = res.data?.data || [];

    // ❌ Remove frontend filtering
    // raw = raw.filter(...)

    setTableData(raw);
    setTotalPages(res.data?.pagination?.totalPages || 1);
  } catch (err) {
    console.error("fetchTableData error:", err);
    setTableData([]);
    setTotalPages(1);
  }
};

  /* -------------------------- helpers / formatters -------------------------- */
  const safe = (v) => {
    if (v === null || v === undefined) return "";
    if (v === "null") return "";
    return String(v);
  };

  const fDate = (d) => {
    if (!d) return "";
    try {
      return new Date(d).toISOString().split("T")[0];
    } catch {
      return d;
    }
  };

  // format stage text: add spaces before capitals and capitalise words
  const formatStages = (st) => {
    if (!st) return "";
    return st
      .toString()
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z][a-z]*)/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .trim();
  };

  // pick a color class for stages / sub-stages / allocation / mapping status
  const getRandomBadge = (key) => {
    const palette = [
      " text-blue-700",
      " text-green-700",
      " text-purple-700",
      " text-yellow-800",
      " text-pink-700",
      " text-indigo-700",
    ];
    return palette[Math.floor(Math.random() * palette.length)];
  };

  const getStageColorClass = (stage) => {
    if (!stage) return "bg-gray-100 text-gray-700";
    if (!stageColorsRef.current[stage]) {
      stageColorsRef.current[stage] = getRandomBadge(stage);
    }
    return stageColorsRef.current[stage];
  };

  /* --------------------------- actions --------------------------- */
  const handleEdit = (unique_id) => {
    const asset = tableData.find((r) => r.unique_id === unique_id);
    setSelectedAsset(asset || null);
    setEditingAssetId(unique_id);
    setIsAssetModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const catObj = categories.find((c) => c.categoriesname === selectedCategory);
      if (!editingAssetId || !catObj) {
        setMessage("Missing data for approval");
        setMessageType("error");
        return;
      }

      await axios.put(
        `${ASSET_NODE_BASE}lifecycle/update-asset-status/${editingAssetId}`,
        {
          category_id: catObj.categoryId,
          user_id: parseInt(userId, 10),
          new_stages: "Mapped",
          sub_stages: "Approved",
          action: "MappingApprove",
          submodule: "Movable",
        },
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );

      setMessage("Approved Successfully!");
      setMessageType("success");
      setIsAssetModalOpen(false);
      // refetch to refresh the table
      fetchTableData();
    } catch (err) {
      console.error("approve error:", err);
      setMessage("Approval failed");
      setMessageType("error");
    }
  };
 const handleReject = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const catObj = categories.find((c) => c.categoriesname === selectedCategory);
      if (!editingAssetId || !catObj) {
        setMessage("Missing data for approval");
        setMessageType("error");
        return;
      }

      await axios.put(
        `${ASSET_NODE_BASE}lifecycle/update-asset-status/${editingAssetId}`,
        {
          category_id: catObj.categoryId,
          user_id: parseInt(userId, 10),
          new_stages: "rejected",
          // sub_stages: "Approved",
          action: "MappingApprove",
          submodule: "Movable",
        }, 
        { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
      );

      setMessage("Rejected Successfully!");
      setMessageType("success");
      setIsAssetModalOpen(false);
      fetchTableData();
    } catch (err) {
      console.error("approve error:", err);
      setMessage("Approval failed");
      setMessageType("error");
    }
  };
  /* ------------------------- table column defs ------------------------- */
  const tableColumns = [
    { key: "Asset Name", label: "Asset Name" },
    { key: "allocation_type", label: "Type Of Allocation" },
    { key: "created_at", label: "Created On" },
    { key: "status", label: "Status" },
    { key: "stages", label: "Stage" },
    { key: "sub_stages", label: "Sub Stage" },
  ];

  const categoryOptions = categories.map((c) => ({ value: c.categoriesname, label: c.categoriesname }));

  /* --------------------------- UI render --------------------------- */
  return (
    <div className="p-4">
      {/* CATEGORY + SEARCH */}
      <div className="flex justify-between mb-5 flex-wrap">
        <div className="w-[260px]">
          <Select
            options={categoryOptions}
            value={categoryOptions.find((o) => o.value === selectedCategory) || null}
            onChange={(opt) => {
              setSelectedCategory(opt ? opt.value : "");
              setPage(1);
            }}
            placeholder="Select Category"
            isClearable
          />
        </div>

        <div className="relative w-[250px]">
          <input
            className="w-full h-[42px] pl-10 pr-3 border border-gray-300 rounded shadow-sm"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* TABLE */}
      <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[75vh]">
          <table className="min-w-full table-auto text-sm border-collapse">
            <thead className="sticky top-0 bg-white border-b-2 border-black text-[16px] font-medium">
              <tr>
                <th className="p-5 text-center">S.no</th>
                {tableColumns.map((c) => (
                  <th key={c.key} className="p-5 text-center">
                    {c.label}
                  </th>
                ))}
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.length === 0 ? (
                <tr>
                  <td colSpan={tableColumns.length + 2} className="text-center py-6">
                    No Records Found
                  </td>
                </tr>
              ) : (
                tableData.map((row, idx) => (
                  <tr
                    key={row.unique_id}
                    className={`${idx % 2 === 0 ? "bg-blue-50" : "bg-white"} hover:bg-blue-100 cursor-pointer`}
                  >
                    <td className="p-5 text-center">{(page - 1) * limit + idx + 1}</td>

                    {tableColumns.map((col) => (
                      <td key={col.key} className="px-5 py-3 text-center">
                        {col.key === "created_at" ? (
                          fDate(row[col.key])
                        ) : col.key === "stages" ? (
                          <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStageColorClass(row[col.key])}`}>
                            {formatStages(row[col.key])}
                          </span>
                        ) : col.key === "sub_stages" ? (
                          <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStageColorClass(row[col.key])}`}>
                            {formatStages(row[col.key])}
                          </span>
                        ) : col.key === "allocation_type" ? (
                          <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStageColorClass(row[col.key])}`}>
                            {safe(row[col.key])}
                          </span>
                        ) : (
                          safe(row[col.key])
                        )}
                      </td>
                    ))}

                    <td className="p-5 text-center">
                      <button
                        className="text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(row.unique_id);
                        }}
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI (kept like your previous design) */}
        {totalPages > 1 && (
          <div className="sticky bottom-0 bg-white flex justify-center items-center gap-2 p-3 border-t border-gray-300">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 bg-gray-200 rounded">
              Prev
            </button>

            <span className="px-3 py-1 rounded bg-blue-600 text-white">{page}</span>

            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 bg-gray-200 rounded">
              Next
            </button>
          </div>
        )}
      </div>

      {/* MODAL: Asset Review (your requested UI) */}
      {isAssetModalOpen && selectedAsset && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center bg-gray-100 p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">Asset Review</h2>
              <button onClick={() => setIsAssetModalOpen(false)}>✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* BASIC DETAILS */}
              <div>
                <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">Basic Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <p><strong>Asset Name:</strong> {safe(selectedAsset["Asset Name"] || selectedAsset.name)}</p>
                  <p><strong>Status:</strong> {safe(selectedAsset.status)}</p>
                  <p><strong>Stage:</strong> <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStageColorClass(selectedAsset.stages)}`}>{formatStages(selectedAsset.stages)}</span></p>
                  <p><strong>Sub Stage:</strong> <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStageColorClass(selectedAsset.sub_stages)}`}>{formatStages(selectedAsset.sub_stages)}</span></p>
                  <p><strong>Created:</strong> {fDate(selectedAsset.created_at)}</p>
                  <p><strong>Mapping Status:</strong> <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStageColorClass(selectedAsset.mapping_status)}`}>{safe(selectedAsset.mapping_status)}</span></p>
                </div>
              </div>

              {/* TYPE BLOCKS */}
              {selectedAsset.allocation_type === "allocation to user" && (
                <div>
                  <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">User Allocation</h3>
                  <p><strong>User:</strong> {safe(selectedAsset.allocated_user_name)}</p>
                  <p><strong>Mapping ID:</strong> {safe(selectedAsset.mapping_id)}</p>
                </div>
              )}

              {selectedAsset.allocation_type === "allocation to location" && (
                <div>
                  <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">Location Allocation</h3>
                  <p><strong>Address:</strong> {safe(selectedAsset.location_full_address || selectedAsset.location_master_address)}</p>
                  <p><strong>Building/Floor/Room:</strong> {`${safe(selectedAsset.building_no)} / ${safe(selectedAsset.floor)} / ${safe(selectedAsset.room)}`}</p>
                  <p><strong>Mapping ID:</strong> {safe(selectedAsset.mapping_id)}</p>
                </div>
              )}

              {selectedAsset.allocation_type === "asset to asset allocation" && (
                <div>
                  <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">Asset to Asset Mapping</h3>
                  <p><strong>Source:</strong> {safe(selectedAsset.source_asset_name)}</p>
                  <p><strong>Destination:</strong> {safe(selectedAsset.destination_asset_name)}</p>
                  <p><strong>Mapping ID:</strong> {safe(selectedAsset.mapping_id)}</p>
                </div>
              )}

              {/* FINANCIAL */}
              <div>
                <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">Financial Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <p><strong>Purchase Date:</strong> {fDate(selectedAsset["Purchase Date"])}</p>
                  <p><strong>Original Cost:</strong> {safe(selectedAsset["Original Cost"])}</p>
                  <p><strong>Scrap Value:</strong> {safe(selectedAsset["Scrap Value"])}</p>
                  <p><strong>Useful Life:</strong> {safe(selectedAsset["Useful Life"])}</p>
                </div>
              </div>

              {/* DOCUMENTS */}
              {Object.entries(selectedAsset).some(([k, v]) => v && typeof v === "object" && v.url) && (
                <div>
                  <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">Documents</h3>
                  {Object.entries(selectedAsset).map(([k, v]) =>
                    v && typeof v === "object" && v.url ? (
                      <a key={k} href={v.url} target="_blank" rel="noreferrer" className="text-blue-600 underline block">
                        {k} — {v.url.split("/").pop()}
                      </a>
                    ) : null
                  )}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex justify-end gap-3">
                {/* Approve (keeps your payload) */}
                <button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Reject
                </button>


        
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message modal (your existing component) */}
      <MessageModal message={message} type={messageType} setMessage={setMessage} />
    </div>
  );
};

export default AssetManagementPage;
