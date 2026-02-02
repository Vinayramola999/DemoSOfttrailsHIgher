// import React, { useState, useEffect } from "react";
// import { FaHome, FaSignOutAlt, FaEdit, FaTrash, FaEye } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// //
// import axios from "axios";
// import MessageModal from "../ApprovalAuthority/MessageModal";
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
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
//   const [assetToDelete, setAssetToDelete] = useState(null); 
//   const [formErrors, setFormErrors] = useState({}); 
//   const [isSubmitMapModalState, setIsSubmitMapModalState] = useState({
//     isOpen: false,
//   });
//   const [selectedAsset, setSelectedAsset] = useState(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(15);
//   const [message, setMessage] = useState(""); 
//   const [messageType, setMessageType] = useState("");
  

//   useEffect(() => {
//       const token = sessionStorage.getItem("token");
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get(
//           `${JAVA_BASE}api/categories/movable`,
//             {
//           headers: {
//             Authorization: token ? `Bearer ${token}` : undefined,
//           },
//         }
//         );
//         setCategories(response.data || []);
//       } catch (error) {
//         console.error("Error fetching categories:", error.message);
//       }
//     };

//     fetchCategories();
//     fetchTableData();
//   }, []);

// useEffect(() => {
//   if (selectedCategory) {
//     fetchTableData(selectedCategory);
//   }
// }, [selectedCategory]);
 
// const fetchTableData = async (categoryName = selectedCategory) => {
//   if (!categoryName) return;

//   const token = sessionStorage.getItem("token"); 

//   try {
//     const response = await axios.get(
//       `${ASSET_NODE_BASE}table-data/${categoryName}`,
//       {
//         headers: {
//           Authorization: token ? `Bearer ${token}` : undefined,
//         },
//       }
//     );

//     setTableData({
//       columns: response.data.columns || [],
//       data: response.data.data || [],
//     });
//     setDynamicFields(response.data.columns || []);
//     setFilteredData(response.data.data || []);
//   } catch (error) {
//     console.error("Error fetching table data:", error.message);
//     setMessage("Failed to fetch table data. Please try again.");
//     setMessageType("error");
//     setTimeout(() => {
//       setMessage("");
//       setMessageType("");
//     }, 5000);
//   }
// };

//   // Handle the form data change
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


//   // Pagination logic
//   const paginate = (data) => {
//     const indexOfLastItem = currentPage * itemsPerPage;
//     const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//     return data.slice(indexOfFirstItem, indexOfLastItem);
//   };
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };


//   // Edit asset function
//   const handleEdit = (unique_id) => {
//     const asset = tableData.data.find((row) => row.unique_id === unique_id);
//     if (asset) {
//       setFormData(asset);
//       setEditingAssetId(unique_id);
//       setIsAssetModalOpen(true);
//     }
//   };
//   // Format the created_at date to 'YYYY-MM-DD'
//   const formatDate = (dateString) => {
//     const date = new Date(dateString);
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-indexed
//     const day = String(date.getDate()).padStart(2, "0"); // Ensure two digits for day

//     return `${year}-${month}-${day}`;
//   };

//   // Filter out `unique_id` and `created_at` fields from dynamic fields
//   const filteredDynamicFields = dynamicFields.filter(
//     (field) =>
//       field !== "unique_id" &&
//       field !== "created_at" &&
//       field !== "status" &&
//       field !== "sub_stages" &&
//       field !== "toapprove" &&
//       field !== "stages"
//   );

//   //TOKEN AND USERPROFILE  START
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
//            `${MAIN_BASE}users/id_user/${userId}`,
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

//   useEffect(() => {
//     const verifyToken = async () => {
//       if (!token) {
//         navigate("/");
//         return;
//       }
//       try {
//         const response = await axios.post(
//         `${MAIN_BASE}users/verify-token`,
//           { token }
//         );
//         console.log("Token is valid:", response.data);
//         navigate("/RepoAllTab");
//       } catch (error) {
//         console.error(
//           "Token verification failed:",
//           error.response ? error.response.data : error.message
//         );
//         sessionStorage.removeItem("token");
//         sessionStorage.removeItem("tokenExpiry");
//         navigate("/");
//       }
//     };
//     verifyToken();
//   }, [token, navigate]);

//   const handleLogout = () => {
//     sessionStorage.removeItem("token");
//     navigate("/");
//   };

//   const handleHome = () => {
//     navigate("/Cards");
//   };
//   const formatStages = (stages) => {
//     if (!stages) return ""; // Handle empty or undefined values

//     // Add spaces before capital letters and capitalize each word properly
//     const formattedStage = stages
//       .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space before capital letters
//       .replace(
//         /([A-Z][a-z]*)/g,
//         (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() // Capitalize words
//       )
//       .trim(); // Remove any leading or trailing spaces

//     // Get the color class for the stage
//     const colorClass = getStageColor(stages);

//     // Return the formatted stage as a styled span
//     return (
//       <span
//         className={`px-2 py-1 rounded-full text-sm font-medium ${colorClass}`}
//       >
//         {formattedStage}
//       </span>
//     );
//   };
//   const getRandomColor = () => {
//     const colors = [
     
//       "text-blue-500",
    
//       "text-purple-500",
    
//     ];
//     return colors[Math.floor(Math.random() * colors.length)];
//   };
//   const stageColors = {};

//   const getStageColor = (stage) => {
//     if (!stageColors[stage]) {
//       stageColors[stage] = getRandomColor(); // Assign a random color if not already assigned
//     }
//     return stageColors[stage];
//   };

  
// const handleDamage = async (unique_id) => {
//   const userId = sessionStorage.getItem("userId");
//   const token = sessionStorage.getItem("token"); // Get token from sessionStorage

//   if (!userId) {
//     console.error("User ID is missing or invalid in sessionStorage.");
//     setMessage("User not logged in or user ID is missing.");
//     setMessageType("error");
//     setIsModalOpen(true);
//     return;
//   }

//   const parsedUserId = parseInt(userId, 10);
//   if (isNaN(parsedUserId)) {
//     console.error("Invalid User ID retrieved from sessionStorage.");
//     setMessage("Invalid User ID.");
//     setMessageType("error");
//     setIsModalOpen(true);
//     return;
//   }

//   if (!selectedCategory) {
//     console.error("No category selected.");
//     setMessage("Please select a category.");
//     setMessageType("error");
//     setIsModalOpen(true);
//     return;
//   }

//   const selectedCategoryObj = categories.find(
//     (category) => category.categoriesname === selectedCategory
//   );

//   if (!selectedCategoryObj) {
//     console.error("Category not found in the categories list.");
//     setMessage("Invalid or missing category.");
//     setMessageType("error");
//     setIsModalOpen(true);
//     return;
//   }

//   const selectedCategoryId = selectedCategoryObj.categoryId;

//   const asset = tableData?.data?.find((a) => a.unique_id === unique_id);
//   if (!asset) {
//     console.error("Asset not found in local data.");
//     setMessage("Asset data not found.");
//     setMessageType("error");
//     setIsModalOpen(true);
//     return;
//   }

//   const previousStages = asset?.stages || "";
//   const previousSubStages = asset?.sub_stages || "";
//   const previousStatus = asset?.status || "";
//   const assetname = asset?.["Asset Name"] || "";

//   const payload = {
//     category_id: selectedCategoryId,
//     user_id: parsedUserId,
//     new_stages: "Damage",
//     sub_stages: "AwaitingApproval",
//     action: "DamageRequest",
//     submodule: "Movable"
//   };

//   try {
//     const response = await fetch(
//       `${ASSET_NODE_BASE}lifecycle/sub_stage/${unique_id}`,
//       {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : undefined,
//         },
//         body: JSON.stringify(payload),
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`Error: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("Damage request successful:", data);

//     const historyPayload = {
//       assetId: unique_id,
//       categoryId: selectedCategoryId,
//       updatedBy: parsedUserId,
//       assetname,
//       previousSubStages,
//       currentSubStages: "AwaitingApproval",
//       previousStatus,
//       currentStatus: "Damage",
//       previousStages,
//       currentStages: "Damage",
//       action: "Asset Damage Request",
//     };

//     const historyRes = await fetch(
//      `${JAVA_BASE}api/assethistory/insert-history`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : undefined,
//         },
//         body: JSON.stringify(historyPayload),
//       }
//     );

//     if (!historyRes.ok) {
//       throw new Error("Failed to log asset history");
//     }
//         await fetchTableData(selectedCategory);

//     setIsAssetModalOpen(false);
//     setMessage("Asset successfully marked as damaged and history logged!");
//     setMessageType("success");

//     // Clear message after 5 seconds
//     setTimeout(() => {
//       setMessage("");
//       setMessageType("");
//     }, 5000);
//   } catch (error) {
//     console.error("Damage request failed:", error);
//     setMessage("Failed to damage the asset. Please try again.");
//     setMessageType("error");
//     setIsAssetModalOpen(false);
//     setTimeout(() => {
//       setMessage("");
//       setMessageType("");
//     }, 5000);
//   }
// };

//   const categoryOptions = categories.map((category) => ({
//   value: category.categoriesname,
//   label: category.categoriesname,
// }));

//   return (
//     <div className="flex flex-col overflow-hidden">
//       <div className="flex">
//         <div className=" w-full">
//           <div className="p-4 md:p-5 flex flex-col space-y-6 min-h-screen">
//             {/* Add Asset Button, Category Dropdown, and Search Input */}
//             <div className="flex items-center justify-between flex-wrap space-y-4 md:space-y-0">
//               {/* Left Section: Add Asset Button and Category Dropdown */}
//               <div className="flex items-center space-x-4">
               
//                 <div className="flex flex-col">
//                     <label
//                     htmlFor="category"
//                     className="block mb-1 text-sm font-medium text-gray-700"
//                   ></label>
//                 <div className="w-[250px]"></div>
//                    <Select
//       options={categoryOptions}
//       value={categoryOptions.find((opt) => opt.value === selectedCategory)}
//       onChange={(selectedOption) =>
//         setFormData((prev) => ({
//           ...prev,
//           category: selectedOption.value,
//         })) || setSelectedCategory(selectedOption.value)
//       }
//       placeholder="Select Asset category"
//       className="react-select-container"
//      classNamePrefix="react-select"
//       isSearchable
//     />
//                 </div>
//               </div>

//               {/* Right Section: Search Bar */}
//          <div className="relative w-[250px] mt-4 md:mt-0">
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
// <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
//   <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
//     <table className="min-w-full table-auto text-sm border-collapse">
//       <thead className="sticky top-0  bg-white border-b-2 border-black text-[16px] font-medium ">
//         <tr>
//           {selectedCategory && <th className="p-5 text-center">S.no</th>}

//           {[
//             "Asset Name",
//             "Created On",
//             "Status",
//             "Stage",
//             "Sub stage",
//             "User Name",
//             "Location",
//           ].map((column, index) => (
//             <th
//               key={index}
//               className="p-5 text-center "
//             >
//               {column}
//             </th>
//           ))}

//           {selectedCategory && <th className="p-5 text-center">Action</th>}
//         </tr>
//       </thead>

//       <tbody className="bg-white divide-y divide-gray-200">
//         {paginate(
//           filteredData.filter(
//             (asset) =>
//               asset.stages === "Mapped" && asset.status === "Inventory"
//           )
//         ).map((asset, index) => (
//           <React.Fragment key={index}>
//             <tr
//               className={`cursor-pointer ${
//                 index % 2 === 0 ? "bg-blue-50" : "bg-white"
//               } hover:bg-blue-100`}
//             >
//               {selectedCategory && (
//                 <td className="px-5 py-3 text-center">
//                   {(currentPage - 1) * itemsPerPage + index + 1}
//                 </td>
//               )}

//               {[
//                 "Asset Name",
//                 "created_at",
//                 "status",
//                 "stages",
//                 "sub_stages",
//                 "name",
//                 "location_details",
//               ].map((column, colIndex) => (
//                 <td
//                   key={colIndex}
//                   className="px-5 py-3 text-center truncate"
//                   title={asset[column]}
//                 >
//                   {column === "created_at"
//                     ? formatDate(asset[column])
//                     : column === "stages" || column === "sub_stages"
//                     ? formatStages(asset[column])
//                     : asset[column] || ""}
//                 </td>
//               ))}

//               {selectedCategory && (
//                 <td className="px-5 py-3 text-center">
//                   <button
//                     className="text-red-600 hover:text-red-800"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       handleEdit(asset.unique_id);
//                     }}
//                   >
//                     <FaEye className="text-base" />
//                   </button>
//                 </td>
//               )}
//             </tr>

//             {selectedAsset && selectedAsset.unique_id === asset.unique_id && (
//               <tr className="bg-gray-50">
//                 <td
//                   colSpan={selectedCategory ? 9 : 8}
//                   className="px-5 py-4 text-left"
//                 >
//                   <div className="relative">
//                     <div className="flex justify-between items-center mb-4">
//                       <h3 className="text-lg font-bold">Asset Details</h3>
//                       <button
//                         onClick={() => setSelectedAsset(null)}
//                         className="text-red-600 hover:text-red-800 font-bold text-lg"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                       <div>
//                         <strong>Asset Name:</strong> {asset["Asset Name"]}
//                       </div>
//                       <div>
//                         <strong>Status:</strong> {asset.status}
//                       </div>
//                       <div>
//                         <strong>Stages:</strong> {asset.stages}
//                       </div>
//                       <div>
//                         <strong>Original Cost:</strong> {asset.original_cost}
//                       </div>
//                       <div>
//                         <strong>Mapped Location:</strong>{" "}
//                         {asset.location_details}
//                       </div>
//                       <div>
//                         <strong>Assign User:</strong> {asset.name}
//                       </div>
//                       <div>
//                         <strong>Created At:</strong>{" "}
//                         {formatDate(asset.created_at)}
//                       </div>
//                     </div>
//                   </div>
//                 </td>
//               </tr>
//             )}
//           </React.Fragment>
//         ))}
//       </tbody>
//     </table>
//   </div>

//   {/* Pagination */}
//   {totalPages > 1 && (
//     <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
//       <button
//         onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
//         disabled={currentPage === 1}
//         className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
//       >
//         &lt;
//       </button>

//       <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
//         {currentPage}
//       </span>

//       <span className="text-sm font-medium">of</span>

//       <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">
//         {totalPages}
//       </span>

//       <button
//         onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
//         disabled={currentPage === totalPages}
//         className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
//       >
//         &gt;
//       </button>
//     </div>
//   )}
// </div>

//             {/* Modal Section */}
//             {isAssetModalOpen && (
//               <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//                 <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-3/4 lg:w-1/2">
//                   <div className="flex justify-between items-center bg-gray-100 p-4 rounded-t-lg">
//                     <h2 className="text-lg font-bold text-gray-800">
//                       {editingAssetId ? " Review Asset" : "Add Asset"}
//                     </h2>
//                     <button
//                       onClick={() => setIsAssetModalOpen(false)}
//                       className="text-red-500"
//                     >
//                       <svg
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="h-6 w-6"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           d="M6 18L18 6M6 6l12 12"
//                         />
//                       </svg>
//                     </button>
//                   </div>
//                   <form
                  
//                     className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4"
//                   >
//                     <div className="flex flex-col">
//                       <label
//                         htmlFor="category"
//                         className="mb-1 text-sm font-medium text-gray-700"
//                       >
//                         Category
//                       </label>
//                       <select
//                         name="category"
//                         value={selectedCategory}
//                         onChange={handleChange}
//                         className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
//                         disabled
//                       >
//                         <option value="">Select Asset category</option>
//                         {categories.map((category, i) => (
//                           <option key={i} value={category.categoriesname}>
//                             {category.categoriesname}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                     {filteredDynamicFields
//                       .filter(
//                         (column) =>
//                           ![
//                             "unique_id",
//                             "category_id",
//                             "status",
//                             "stages",
//                             "created_at",
//                             "id",
//                             "location_details",
//                             "sub_stages",
//                             "toapprove"
//                           ].includes(column.columnName)
//                         )
                        
//                       .map((field, index) => (
//                         <div key={index} className="flex flex-col">
//                           <label
//                             htmlFor={field}
//                             className="mb-1 text-sm font-medium text-gray-700"
//                           >
//                             {field.columnName || field}
//                           </label>
//                           <input
//                             type="text"
//                             name={field.columnName || field}
//                             value={formData[field.columnName || field] || ""}
//                             onChange={handleChange}
//                             className="p-2 rounded border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 bg-[#F0F0F0]"
//                             disabled
//                           />
//                           {formErrors[field.columnName || field] && (
//                             <span className="text-red-600 text-sm">
//                               {formErrors[field.columnName || field]}
//                             </span>
//                           )}
//                         </div>
//                       ))}
//                     {/* Show general error */}
//                     {formErrors.general && (
//                       <p className="text-red-600 text-sm">
//                         {formErrors.general}
//                       </p>
//                     )}
//                     <div className="col-span-2 flex justify-end mt-4">
//                     {formData.stages === "Mapped" && formData.sub_stages === "Approved" && (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           handleDamage(editingAssetId); 
//                           setIsAssetModalOpen(false); 
//                         }}
//                         className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
//                       >
//                         Damage Claim Submission
//                       </button>
//                         )}
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             )}
    
        
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


// AssetManagementPage.jsx
import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import Select from "react-select";
import axios from "axios";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { JAVA_BASE, ASSET_NODE_BASE, MAIN_BASE } from "../../config/apiBase";
import { useNavigate } from "react-router-dom";

const AssetManagementPage = () => {
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tableData, setTableData] = useState([]); // list of assets
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    // fetch categories on mount
    const fetchCategories = async () => {
      try {
        const resp = await axios.get(`${JAVA_BASE}api/categories/movable`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        setCategories(resp.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [token]);

  // fetch table data based on selected category (uses ASSET_NODE_BASE asset-mapping-detailss)
  useEffect(() => {
    if (!selectedCategory) {
      setTableData([]);
      setFilteredData([]);
      setTotalPages(1);
      return;
    }
    fetchTableData(selectedCategory, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  useEffect(() => {
    // client-side search filter (keeps original table design)
    if (!searchTerm) {
      setFilteredData(tableData);
      setCurrentPage(1);
      setTotalPages(Math.max(1, Math.ceil(tableData.length / itemsPerPage)));
      return;
    }
    const s = searchTerm.toLowerCase();
    const filtered = (tableData || []).filter((row) =>
      Object.values(row || {}).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(s);
      })
    );
    setFilteredData(filtered);
    setCurrentPage(1);
    setTotalPages(Math.max(1, Math.ceil(filtered.length / itemsPerPage)));
  }, [searchTerm, tableData, itemsPerPage]);

const fetchTableData = async (categoryName, page = 1, limit = 15, search = "") => {
  if (!categoryName) return;
  setIsLoading(true);

  try {
    const catObj = categories.find(
      (c) => c.categoriesname === categoryName || c.name === categoryName
    );
    const categoryId = catObj?.categoryId || catObj?.id || categoryName;

    const url = `${ASSET_NODE_BASE}asset-mapping-detailss/${categoryId}`;

    const resp = await axios.get(url, {
      headers: { Authorization: token ? `Bearer ${token}` : undefined },
      params: {
        page,
        limit,
        search,

      
        status: "Inventory",
        stages: "Mapped",
      },
    });

    const data = resp.data || {};
    const items = data.data || [];

  
    setTableData(items);
    setFilteredData(items);

    const tPages =
      data.pagination?.totalPages ||
      Math.max(1, Math.ceil(items.length / limit));

    setTotalPages(tPages);
    setCurrentPage(data.pagination?.currentPage || page);
  } catch (err) {
    console.error("Error fetching table data:", err);
    setTableData([]);
    setFilteredData([]);
    setTotalPages(1);
  } finally {
    setIsLoading(false);
  }
};


  // helpers
  const safe = (v) => (v === null || v === undefined || v === "null" ? "" : String(v));
  const fDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

  // stage formatting + color badges (kept from your code)
  const stageColors = {};
  const getRandomColor = () => {
    const colors = ["text-blue-500", "text-purple-500"];
    return colors[Math.floor(Math.random() * colors.length)];
  };
  const getStageColor = (stage) => {
    if (!stage) return "text-gray-600";
    if (!stageColors[stage]) stageColors[stage] = getRandomColor();
    return stageColors[stage];
  };
  const formatStages = (stages) => {
    if (!stages) return "";
    const formatted = stages
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z][a-z]*)/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .trim();
    return <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStageColor(stages)}`}>{formatted}</span>;
  };

  const handleEdit = (unique_id) => {
    const asset = tableData.find((a) => Number(a.unique_id) === Number(unique_id));
    if (!asset) return;
    setEditingAssetId(unique_id);
    setSelectedAsset(parseAssetForModal(asset));
    setIsAssetModalOpen(true);
  };

  // Format asset for modal: hide empty/null keys, normalize dates
  const parseAssetForModal = (asset) => {
    if (!asset) return null;
    const parsed = { ...asset };
    // normalize known date fields
    ["created_at", "Purchase Date", "allocatedtime"].forEach((k) => {
      if (parsed[k]) parsed[k] = fDate(parsed[k]);
    });
    return parsed;
  };

  // damage logic preserved (same as your earlier implementation)
  const handleDamage = async (unique_id) => {
    const userId = sessionStorage.getItem("userId");
    const tokenLocal = sessionStorage.getItem("token");
    if (!userId) {
      setMessage("User not logged in.");
      setMessageType("error");
      return;
    }
    if (!selectedCategory) {
      setMessage("Please select a category first.");
      setMessageType("error");
      return;
    }
    const selectedCategoryObj = categories.find((c) => c.categoriesname === selectedCategory || c.name === selectedCategory);
    const selectedCategoryId = selectedCategoryObj?.categoryId || selectedCategoryObj?.id;
    if (!selectedCategoryId) {
      setMessage("Category ID not found.");
      setMessageType("error");
      return;
    }

    const asset = tableData.find((a) => Number(a.unique_id) === Number(unique_id));
    if (!asset) {
      setMessage("Asset not found.");
      setMessageType("error");
      return;
    }

    const payload = {
      category_id: selectedCategoryId,
      user_id: parseInt(userId, 10),
      new_stages: "Damage",
      sub_stages: "AwaitingApproval",
      action: "DamageRequest",
      submodule: "Movable",
    };

    try {
      const resp = await fetch(`${ASSET_NODE_BASE}lifecycle/sub_stage/${unique_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: tokenLocal ? `Bearer ${tokenLocal}` : undefined,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      const data = await resp.json();

      // write history (best-effort)
      const historyPayload = {
        assetId: unique_id,
        categoryId: selectedCategoryId,
        updatedBy: parseInt(userId, 10),
        assetname: asset["Asset Name"] || asset.name || "",
        previousSubStages: asset.sub_stages || "",
        currentSubStages: "AwaitingApproval",
        previousStatus: asset.status || "",
        currentStatus: "Damage",
        previousStages: asset.stages || "",
        currentStages: "Damage",
        action: "Asset Damage Request",
      };
      try {
        await fetch(`${JAVA_BASE}api/assethistory/insert-history`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: tokenLocal ? `Bearer ${tokenLocal}` : undefined,
          },
          body: JSON.stringify(historyPayload),
        });
      } catch (e) {
        console.warn("History logging failed:", e);
      }

      // refresh table
      await fetchTableData(selectedCategory, currentPage, itemsPerPage, searchTerm);
      setIsAssetModalOpen(false);
      setMessage("Asset marked damaged and history logged.");
      setMessageType("success");
    } catch (err) {
      console.error("Damage error:", err);
      setMessage("Damage request failed. Try again.");
      setMessageType("error");
    }
  };

  // pagination helpers
  const paginate = (arr) => {
    const start = (currentPage - 1) * itemsPerPage;
    return arr.slice(start, start + itemsPerPage);
  };

  // build options for Select
  const categoryOptions = categories.map((c) => ({
    value: c.categoriesname || c.name,
    label: c.categoriesname || c.name,
  }));

  // When user selects category
  const onCategoryChange = (opt) => {
    const val = opt?.value || "";
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  // compute current page slice and total pages
  const dataToShow = paginate(filteredData || []);
  const visibleCount = filteredData.length;
  const calcTotalPages = Math.max(1, Math.ceil(visibleCount / itemsPerPage));
  useEffect(() => setTotalPages(calcTotalPages), [calcTotalPages]);

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex">
        <div className="w-full">
          <div className="p-4 md:p-5 flex flex-col space-y-6 min-h-screen">
            <div className="flex items-center justify-between flex-wrap space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                  <div className="w-[250px]">
                    <Select
                      options={categoryOptions}
                      value={categoryOptions.find((o) => o.value === selectedCategory)}
                      onChange={onCategoryChange}
                      placeholder="Select Asset category"
                      className="react-select-container"
                      classNamePrefix="react-select"
                      isSearchable
                    />
                  </div>
                </div>
              </div>

              <div className="relative w-[250px] mt-4 md:mt-0">
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full h-[42px] pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.15-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
                </svg>
              </div>
            </div>

            {/* Table */}
            <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
                <table className="min-w-full table-auto text-sm border-collapse">
                  <thead className="sticky top-0 bg-white border-b-2 border-black text-[16px] font-medium">
                    <tr>
                      {selectedCategory && <th className="p-5 text-center">S.no</th>}
                      {["Asset Name", "Created On", "Status", "Stage", "Sub stage", "Mapping Type"].map((col, idx) => (
                        <th key={idx} className="p-5 text-center">{col}</th>
                      ))}
                      {selectedCategory && <th className="p-5 text-center">Action</th>}
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      <tr>
                        <td colSpan={selectedCategory ? 8 : 6} className="text-center py-8">Loading...</td>
                      </tr>
                    ) : dataToShow.length === 0 ? (
                      <tr>
                        <td colSpan={selectedCategory ? 8 : 6} className="text-center py-8">No assets found.</td>
                      </tr>
                    ) : (
                      dataToShow.map((asset, index) => (
                        <tr key={asset.unique_id || index} className={`cursor-pointer ${index % 2 === 0 ? "bg-blue-50" : "bg-white"} hover:bg-blue-100`}>
                          {selectedCategory && <td className="px-5 py-3 text-center">{(currentPage - 1) * itemsPerPage + index + 1}</td>}

                          <td className="px-5 py-3 text-center truncate" title={safe(asset["Asset Name"])}>
                            {safe(asset["Asset Name"])}
                          </td>

                          <td className="px-5 py-3 text-center">{fDate(asset.created_at)}</td>

                          <td className="px-5 py-3 text-center">{safe(asset.status)}</td>

                          <td className="px-5 py-3 text-center">{formatStages(asset.stages)}</td>

                          <td className="px-5 py-3 text-center">{formatStages(asset.sub_stages)}</td>

                          <td className="px-5 py-3 text-center">{safe(asset.allocation_type)}</td>

                          {selectedCategory && (
                            <td className="px-5 py-3 text-center">
                              <button
                                className="text-blue-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(asset.unique_id);
                                }}
                              >
                                <FaEye />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400">&lt;</button>

                  <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">{currentPage}</span>

                  <span className="text-sm font-medium">of</span>

                  <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">{totalPages}</span>

                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400">&gt;</button>
                </div>
              )}
            </div>
{/* MODAL */}
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
            <p><strong>Asset Name:</strong> {safe(selectedAsset["Asset Name"])}</p>
            <p><strong>Status:</strong> {safe(selectedAsset.status)}</p>
            <p><strong>Stage:</strong> {formatStages(selectedAsset.stages)}</p>
            <p><strong>Sub Stage:</strong> {formatStages(selectedAsset.sub_stages)}</p>
            {/* <p><strong>Created:</strong> {fDate(selectedAsset.created_at)}</p> */}
            {/* <p><strong>Mapping Status:</strong> {safe(selectedAsset.mapping_status)}</p> */}
            {/* {selectedAsset.mapping_id && <p><strong>Mapping ID:</strong> {safe(selectedAsset.mapping_id)}</p>} */}
            {selectedAsset.allocation_type && <p><strong>Allocation Type:</strong> {safe(selectedAsset.allocation_type)}</p>}
          </div>
        </div>

        {/* TYPE BLOCKS */}
        {selectedAsset.allocation_type === "allocation to user" && (
          <div>
            <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">User Allocation</h3>
            <p><strong>Allocated User:</strong> {safe(selectedAsset.allocated_user_name)}</p>
            {/* <p><strong>Mapping ID:</strong> {safe(selectedAsset.mapping_id)}</p> */}
          </div>
        )}

        {selectedAsset.allocation_type === "allocation to location" && (
          <div>
            <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">Location Allocation</h3>

            <p><strong>Allocated Location:</strong> {safe(selectedAsset.location_full_address || selectedAsset.location_master_address)}</p>
            <p><strong>Allocated User:</strong> {safe(selectedAsset.allocated_user_name)}</p>
            {/* <p>
              <strong>Building/Floor/Room:</strong> 
              {`${safe(selectedAsset.building_no)} / ${safe(selectedAsset.floor)} / ${safe(selectedAsset.room)}`}
            </p>

            <p><strong>Mapping ID:</strong> {safe(selectedAsset.mapping_id)}</p> */}
             <p>
      <strong>Full Address:</strong>{" "}
      {[
        safe(selectedAsset.locality),
        safe(selectedAsset.city),
        safe(selectedAsset.state)
      ]
        .filter(Boolean) 
        .join(", ")}       
    </p>
          </div>
        )}

        {selectedAsset.allocation_type === "asset to asset allocation" && (
          <div>
            <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">Asset to Asset Mapping</h3>

            <p><strong>Asset Being Mapped:</strong> {safe(selectedAsset.source_asset_name)}</p>
            <p><strong>Map With Asset:</strong> {safe(selectedAsset.destination_asset_name)}</p>
            {/* <p><strong>Mapping ID:</strong> {safe(selectedAsset.mapping_id)}</p> */}
          </div>
        )}

        {/* FINANCIAL DETAILS */}
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
        {Object.entries(selectedAsset).some(([k, v]) => v?.url) && (
          <div>
            <h3 className="font-semibold text-blue-700 border-b pb-1 mb-3">Documents</h3>

            {Object.entries(selectedAsset).map(([k, v]) =>
              v?.url ? (
                <a
                  key={k}
                  href={v.url}
                  className="text-blue-600 underline block"
                  target="_blank"
                  rel="noreferrer"
                >
                  {k} — {v.url.split("/").pop()}
                </a>
              ) : null
            )}
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          {selectedAsset.stages === "Mapped" &&
            selectedAsset.sub_stages === "Approved" && (
              <button
                onClick={() => {
                  handleDamage(editingAssetId);
                  setIsAssetModalOpen(false);
                }}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              >
                Damage Claim Submission
              </button>
            )}

          <button
            onClick={() => setIsAssetModalOpen(false)}
            className="px-4 py-2 rounded border"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </div>
)}

          </div>
        </div>
      </div>

      <MessageModal message={message} type={messageType} setMessage={setMessage} />
    </div>
  );
};

export default AssetManagementPage;
