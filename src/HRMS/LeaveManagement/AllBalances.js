import React, { useEffect, useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import Modal from "react-modal";
import axios from "axios";
import Pagination from "../../NewComponents/Pagination";

const AllBalances = () => {
    const [leaveData, setLeaveData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const [updatedBalance, setUpdatedBalance] = useState(0);
    const [updatedPreviousBalance, setUpdatedPreviousBalance] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [detailsLeave, setDetailsLeave] = useState(null);
    const [selectedLeaveType, setSelectedLeaveType] = useState('');

    const fetchLeaveData = async () => {
        try {
            const response = await fetch("https://devdemo.softtrails.net/leave/leave-balances", {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });
            const data = await response.json();
            if (data.message === "Leave balances for active users retrieved successfully.") {
                const sortedData = data.leave_balances.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );
                setLeaveData(sortedData);
            }
        } catch (error) {
            console.error("Error fetching leave data:", error);
        }
    };

    useEffect(() => {
        fetchLeaveData();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLeaveType]);

    // Extract unique leave types for filter
    const leaveTypes = useMemo(() => {
        const types = leaveData.map((leave) => leave.leave_type);
        return [...new Set(types)];
    }, [leaveData]);

    // Filtered leaves
    const filteredLeaves = useMemo(() => {
        return leaveData.filter((leave) =>
            (leave.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.leave_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                leave.status?.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedLeaveType ? leave.leave_type === selectedLeaveType : true)
        );
    }, [leaveData, searchTerm, selectedLeaveType]);

    // Pagination logic
    const paginatedLeaves = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredLeaves.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredLeaves, currentPage]);
    const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

    // Show details modal when clicking username
    const handleUserClick = (leave) => {
        setDetailsLeave(leave);
        setIsDetailsOpen(true);
    };

    const handleEditClick = (leave) => {
        setSelectedLeave(leave);
        setUpdatedPreviousBalance(leave.previous_balance);
        setUpdatedBalance(leave.balance);
        setIsModalOpen(true);
    };

    const handleUpdate = async () => {
        if (selectedLeave) {
            const { id } = selectedLeave;
            const token = sessionStorage.getItem("token");

            try {
                await axios.put(
                    `https://devdemo.softtrails.net/leave/leave-balances-update/${id}`,
                    {
                        balance: updatedBalance,
                        previous_balance: updatedPreviousBalance,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                Swal.fire({
                    icon: 'success',
                    title: 'Sent for Approval',
                    text: 'Leave balance has been sent for approval.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'OK',
                });

                fetchLeaveData(); // refresh leave data
                closeModal();
            } catch (error) {
                console.error("Error updating balance", error);
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedLeave(null);
    };

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center gap-4">
                <input type="text" placeholder=" Search " className="border border-gray-300 rounded px-3 py-2 w-1/5" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select value={selectedLeaveType} onChange={(e) => setSelectedLeaveType(e.target.value)} className="border border-gray-300 rounded px-3 py-2" >
                    <option value="">All Leave Types</option>
                    {leaveTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>

            {/* Table */}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">UserName</th>
                                <th className="p-5 text-left text-black">Leave Type</th>
                                <th className="p-5 text-left text-black">Previous Year Balance</th>
                                <th className="p-5 text-left text-black">Current Balance</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {paginatedLeaves.map((leave, index) => (
                                <tr key={leave.id} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td
                                        className="px-5 py-4 text-left text-[14px] text-blue-600 cursor-pointer"
                                        onClick={() => handleUserClick(leave)}
                                    >
                                        {leave.name || "N/A"}
                                    </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_type || "N/A"}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{leave.previous_balance || "N/A"}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{leave.balance || "N/A"}</td>
                                    <td className={`px-5 py-4 text-left ${leave.status === "pending" ? "text-blue-500" : leave.status === "approved" ? "text-green-500" : leave.status === "rejected" ? "text-red-500" : "text-gray-500"}`}>
                                        {leave.status
                                            ? leave.status.charAt(0).toUpperCase() + leave.status.slice(1)
                                            : "N/A"}
                                    </td>
                                    <td className="px-5 py-4 text-left flex gap-2">
                                        <button onClick={() => handleEditClick(leave)} className="text-blue-500 hover:text-blue-700" > <FontAwesomeIcon icon={faEdit} /> </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>

            {/***************************** EDIT BALANCE************************/}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                className="modal max-w-sm mx-auto my-auto rounded-md shadow-lg z-20"
                overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            >
                <div className="bg-white p-4">
                    <h2 className="text-xl font-semibold mb-4">Edit Leave Balance</h2>
                    {selectedLeave && (
                        <>
                            <label className="block mb-2">
                                Leave Type: <strong>{selectedLeave.leave_type}</strong>
                            </label>
                            <label className="block mb-2">
                                Previous Year Balance:
                                <input
                                    type="number"
                                    value={updatedPreviousBalance}
                                    onChange={(e) => setUpdatedPreviousBalance(e.target.value)}
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                            </label>
                            <label className="block mb-2">
                                Current Balance:
                                <input
                                    type="number"
                                    value={updatedBalance}
                                    onChange={(e) => setUpdatedBalance(e.target.value)}
                                    className="border border-gray-300 p-2 rounded w-full"
                                />
                            </label>
                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={handleUpdate}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
                                >
                                    Update
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>

            {/***************************** USER DETAILS MODAL ************************/}
            <Modal
                isOpen={isDetailsOpen}
                onRequestClose={() => setIsDetailsOpen(false)}
                className="modal max-w-lg w-full mx-auto my-auto rounded-lg shadow-lg z-20"
                overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            >
                <div className="bg-white p-6 rounded-lg">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">
                        User Leave Details
                    </h2>

                    {detailsLeave && (
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-gray-700">
                            <p><span className="font-medium">User Name:</span></p>
                            <p>{detailsLeave.name}</p>

                            <p><span className="font-medium">Leave Type:</span></p>
                            <p>{detailsLeave.leave_type}</p>

                            <p><span className="font-medium">Allocation Type:</span></p>
                            <p>{detailsLeave.allocation_type}</p>

                            <p><span className="font-medium">Previous Year Balance:</span></p>
                            <p>{detailsLeave.previous_balance}</p>

                            <p><span className="font-medium">Current Year Balance:</span></p>
                            <p>{detailsLeave.balance}</p>

                            <p><span className="font-medium">Total Balance:</span></p>
                            <p>{detailsLeave.total_balance}</p>

                            <p><span className="font-medium">Status:</span></p>
                            <p className={`font-semibold ${detailsLeave.status === "approved" ? "text-green-600" : detailsLeave.status === "pending" ? "text-yellow-600" : detailsLeave.status === "rejected" ? "text-red-600" : "text-gray-600"}`} >
                                {detailsLeave?.status ? detailsLeave.status.charAt(0).toUpperCase() + detailsLeave.status.slice(1): "N/A"}</p>
                            {/* ✅ Show Pending Changes only if not approved */}
                            {detailsLeave.status !== "approved" && detailsLeave.pending_changes && (
                                <>
                                    <p className="font-medium text-red-600">Pending Current Year Balance:</p>
                                    <p className="text-red-600">{detailsLeave.pending_changes.pending_balance}</p>
                                    <p className="font-medium text-red-600">Pending Previous Year Balance:</p>
                                    <p className="text-red-600">{detailsLeave.pending_changes.pending_previous_balance}</p>
                                </>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end mt-6">
                        <button
                            onClick={() => setIsDetailsOpen(false)}
                            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
export default AllBalances;



///////////////////////////UCS INTEGRATION///////////////////////////////
// import React, { useEffect, useState, useMemo } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEdit } from "@fortawesome/free-solid-svg-icons";
// import Swal from "sweetalert2";
// import Modal from "react-modal";
// import axios from "axios";
// import Pagination from "../../NewComponents/Pagination";
// import NotificationSelector from "../../Asset/Components/NotificationSelector";

// const AllBalances = () => {
//   const [leaveData, setLeaveData] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 25;
//   const [updatedBalance, setUpdatedBalance] = useState(0);
//   const [updatedPreviousBalance, setUpdatedPreviousBalance] = useState(0);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedLeave, setSelectedLeave] = useState(null);
//   const [isDetailsOpen, setIsDetailsOpen] = useState(false);
//   const [detailsLeave, setDetailsLeave] = useState(null);
//   const [selectedLeaveType, setSelectedLeaveType] = useState("");
//   const [notificationOpen, setNotificationOpen] = useState(false);

//   // Manager & UCS info
//   const [managerContact, setManagerContact] = useState(null);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [filteredModule, setFilteredModule] = useState(null);

//   const token = sessionStorage.getItem("token");

//   // ---------------- Fetch Leave Data ----------------
//   const fetchLeaveData = async () => {
//     try {
//       const response = await fetch("https://devdemo.softtrails.net/leave/leave-balances", {
//         method: "GET",
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await response.json();
//       if (data.message === "Leave balances for active users retrieved successfully.") {
//         const sortedData = data.leave_balances.sort((a, b) => a.name.localeCompare(b.name));
//         setLeaveData(sortedData);
//       }
//     } catch (error) {
//       console.error("❌ Error fetching leave data:", error);
//     }
//   };

//   useEffect(() => {
//     fetchLeaveData();
//   }, []);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, selectedLeaveType]);

//   // ---------------- Filters & Pagination ----------------
//   const leaveTypes = useMemo(() => {
//     const types = leaveData.map((leave) => leave.leave_type);
//     return [...new Set(types)];
//   }, [leaveData]);

//   const filteredLeaves = useMemo(() => {
//     return leaveData.filter(
//       (leave) =>
//         (leave.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           leave.leave_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           leave.status?.toLowerCase().includes(searchTerm.toLowerCase())) &&
//         (selectedLeaveType ? leave.leave_type === selectedLeaveType : true)
//     );
//   }, [leaveData, searchTerm, selectedLeaveType]);

//   const paginatedLeaves = useMemo(() => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return filteredLeaves.slice(startIndex, startIndex + itemsPerPage);
//   }, [filteredLeaves, currentPage]);
//   const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

//   // ---------------- Handle Modals ----------------
//   const handleUserClick = (leave) => {
//     setDetailsLeave(leave);
//     setIsDetailsOpen(true);
//   };

//   const handleEditClick = (leave) => {
//     setSelectedLeave(leave);
//     setUpdatedPreviousBalance(leave.previous_balance);
//     setUpdatedBalance(leave.balance);
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     setSelectedLeave(null);
//   };

//   // ---------------- Update Leave & Trigger Notification ----------------
//   const handleUpdate = async () => {
//     if (!selectedLeave) return;

//     try {
//       const res = await axios.put(
//         `https://devdemo.softtrails.net/leave/leave-balances-update/${selectedLeave.id}`,
//         {
//           balance: updatedBalance,
//           previous_balance: updatedPreviousBalance,
//         },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (res.data.message === "Leave balance updated successfully") {
//         const updated = res.data.leave_balance;
//         await fetchManagerDetails(updated.manager_id, updated.user_id);
//         await fetchUCSModule();
//         setNotificationOpen(true);
//       }
//     } catch (error) {
//       console.error("❌ Error updating balance:", error);
//     }
//   };

//   // ---------------- Fetch Manager Info ----------------
//   const fetchManagerDetails = async (manager_id, user_id) => {
//     try {
//       const res = await axios.get("https://devdemo.softtrails.net/users/getusers", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.data && res.data.users) {
//         const users = res.data.users;
//         const user = users.find((u) => u.user_id === user_id);
//         setSelectedUser(user);
//         const manager = users.find((u) => u.user_id === manager_id);
//         if (manager) {
//           setManagerContact({
//             phone_no: manager.phone_no,
//             email: manager.email,
//             name: `${manager.first_name} ${manager.last_name}`,
//           });
//         }
//       }
//     } catch (error) {
//       console.error("❌ Error fetching users:", error);
//     }
//   };

//   // ---------------- Fetch UCS Module ----------------
//   const fetchUCSModule = async () => {
//     try {
//       const res = await axios.get("https://ucsdemo.softtrails.net/api/modules", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const filtered = res.data.find(
//         (mod) =>
//           mod.moduleName === "Leave Management" && mod.subModuleName === "Applying Balance"
//       );
//       setFilteredModule(filtered);
//     } catch (error) {
//       console.error("❌ Error fetching UCS module:", error);
//     }
//   };

//   // ---------------- Send UCS Notification ----------------
//   const handleNotificationConfirm = async (selectedOptions) => {
//     if (!managerContact || !filteredModule || !selectedUser) return;

//     const payloadToSend = {
//       email: selectedOptions.includes("email") ? managerContact.email : null,
//       phone_no: selectedOptions.includes("sms") ? managerContact.phone_no : null,
//       username: `${selectedUser.first_name} ${selectedUser.last_name}`,
//     };

//     const finalPayload = {
//       ...payloadToSend,
//       name: managerContact.name,
//       moduleName: filteredModule.moduleName,
//       subName: filteredModule.subModuleName,
//       uniqueIdentifierName: filteredModule.uniqueIdentifierName,
//       applicationName: filteredModule.applicationName,
//     };

//     try {
//       await axios.post(
//         "https://devdemo.softtrails.net/ucs/send",
//         finalPayload,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       Swal.fire({
//         icon: "success",
//         title: "UCS Notification Sent",
//         text: "Notification has been sent successfully.",
//         confirmButtonColor: "#3085d6",
//         confirmButtonText: "OK",
//       });
//       setNotificationOpen(false);
//       closeModal();
//       fetchLeaveData();
//     } catch (error) {
//       console.error("❌ Error sending UCS notification:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to send UCS notification.",
//       });
//     }
//   };

//   // ---------------- JSX ----------------
//   return (
//     <div className="p-4">
//       {/* Search & Filter */}
//       <div className="mb-4 flex items-center gap-4">
//         <input
//           type="text"
//           placeholder="Search"
//           className="border border-gray-300 rounded px-3 py-2 w-1/5"
//           value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//         />
//         <select
//           value={selectedLeaveType}
//           onChange={(e) => setSelectedLeaveType(e.target.value)}
//           className="border border-gray-300 rounded px-3 py-2"
//         >
//           <option value="">All Leave Types</option>
//           {leaveTypes.map((type) => (
//             <option key={type} value={type}>
//               {type}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Table */}
//       <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
//         <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
//           <table className="min-w-full table-auto border-collapse text-sm">
//             <thead
//               className="text-[14px] font-medium bg-white sticky top-0"
//               style={{ boxShadow: "0 2px 0 black" }}
//             >
//               <tr>
//                 <th className="p-5 text-left text-black">S.No</th>
//                 <th className="p-5 text-left text-black">User Name</th>
//                 <th className="p-5 text-left text-black">Leave Type</th>
//                 <th className="p-5 text-left text-black">Previous Year Balance</th>
//                 <th className="p-5 text-left text-black">Current Balance</th>
//                 <th className="p-5 text-left text-black">Status</th>
//                 <th className="p-5 text-left text-black">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td colSpan="7" className="h-3 bg-white"></td>
//               </tr>
//               {paginatedLeaves.map((leave, index) => (
//                 <tr
//                   key={leave.id}
//                   className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}`}
//                 >
//                   <td className="px-5 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                   <td
//                     className="px-5 py-4 text-blue-600 cursor-pointer"
//                     onClick={() => handleUserClick(leave)}
//                   >
//                     {leave.name || "N/A"}
//                   </td>
//                   <td className="px-5 py-4">{leave.leave_type || "N/A"}</td>
//                   <td className="px-5 py-4">{leave.previous_balance || "N/A"}</td>
//                   <td className="px-5 py-4">{leave.balance || "N/A"}</td>
//                   <td className="px-5 py-4">
//                     {leave.status
//                       ? leave.status.charAt(0).toUpperCase() + leave.status.slice(1)
//                       : "N/A"}
//                   </td>
//                   <td className="px-5 py-4">
//                     <button
//                       onClick={() => handleEditClick(leave)}
//                       className="text-blue-500 hover:text-blue-700"
//                     >
//                       <FontAwesomeIcon icon={faEdit} />
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         <Pagination
//           currentPage={currentPage}
//           totalPages={totalPages}
//           onPageChange={setCurrentPage}
//         />
//       </div>

//       {/* Edit Modal */}
//       <Modal
//         isOpen={isModalOpen}
//         onRequestClose={closeModal}
//         className="modal max-w-sm mx-auto my-auto rounded-md shadow-lg z-20"
//         overlayClassName="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
//       >
//         <div className="bg-white p-4">
//           <h2 className="text-xl font-semibold mb-4">Edit Leave Balance</h2>
//           {selectedLeave && (
//             <>
//               <label className="block mb-2">
//                 Leave Type: <strong>{selectedLeave.leave_type}</strong>
//               </label>
//               <label className="block mb-2">
//                 Previous Year Balance:
//                 <input
//                   type="number"
//                   value={updatedPreviousBalance}
//                   onChange={(e) => setUpdatedPreviousBalance(e.target.value)}
//                   className="border border-gray-300 p-2 rounded w-full"
//                 />
//               </label>
//               <label className="block mb-2">
//                 Current Balance:
//                 <input
//                   type="number"
//                   value={updatedBalance}
//                   onChange={(e) => setUpdatedBalance(e.target.value)}
//                   className="border border-gray-300 p-2 rounded w-full"
//                 />
//               </label>
//               <div className="flex justify-end mt-4">
//                 <button
//                   onClick={handleUpdate}
//                   className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
//                 >
//                   Update
//                 </button>
//                 <button
//                   onClick={closeModal}
//                   className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </Modal>

//       {/* UCS Notification Selector */}
//       <NotificationSelector
//         open={notificationOpen}
//         onClose={() => setNotificationOpen(false)}
//         onConfirm={handleNotificationConfirm}
//       />
//     </div>
//   );
// };

// export default AllBalances;