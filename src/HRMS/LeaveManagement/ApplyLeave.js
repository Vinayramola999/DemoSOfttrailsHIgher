import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaCheckCircle, FaTimesCircle, FaClock, FaPlus } from 'react-icons/fa';
import AddButton from "../../NewComponents/AddButton";
import folder from '../../assests/folder.png';

const CreateLeave = ({ closeModal, onLeaveSubmit }) => {
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");
  const [leave_type, setLeaveType] = useState("");
  const [start_date, setStartDate] = useState("");
  const [end_date, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [managerId, setManagerId] = useState("");
  const [managerName, setManagerName] = useState("");
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [halfDayStart, setHalfDayStart] = useState(false);
  const [halfDayEnd, setHalfDayEnd] = useState(false);
  const [halfDayAllowed, setHalfDayAllowed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [workingDaysConfig, setWorkingDaysConfig] = useState([]);
  const [workingDaysCount, setWorkingDaysCount] = useState(0);
  const [document, setDocument] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);

  useEffect(() => {
    const fetchWorkingDays = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(
          "https://devdemo.softtrails.net/leave/working-days",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setWorkingDaysConfig(response.data);
      } catch (error) {
        console.error("Error fetching working days:", error);
      }
    };

    fetchWorkingDays();
  }, []);

  useEffect(() => {
    if (start_date && end_date && workingDaysConfig.length > 0) {
      const count = calculateWorkingDays(
        new Date(start_date),
        new Date(end_date),
        workingDaysConfig
      );
      setWorkingDaysCount(count);
    }
  }, [start_date, end_date, workingDaysConfig]);

  const calculateWorkingDays = (start, end, config) => {
    let count = 0;
    const isWorkingDay = (date) => {
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const dayRule = config.find((d) => d.day_name === dayName);

      // If the API doesn’t define the day at all → not working
      if (!dayRule) return false;

      const weeks = dayRule.weeks;

      // If no week is working → not a working day
      if (!weeks || weeks.length === 0) return false;

      // If "all" → every week of month is working
      if (weeks.includes("all")) return true;

      // Otherwise, check which week of month this date falls in (1st, 2nd, 3rd, etc.)
      const weekOfMonth = Math.ceil(date.getDate() / 7);
      const weekName =
        weekOfMonth === 1
          ? "1st"
          : weekOfMonth === 2
            ? "2nd"
            : weekOfMonth === 3
              ? "3rd"
              : weekOfMonth === 4
                ? "4th"
                : "5th";

      return weeks.includes(weekName);
    };

    // Iterate from start to end date
    let current = new Date(start);
    while (current <= end) {
      if (isWorkingDay(current)) count++;
      current.setDate(current.getDate() + 1);
    }

    return count;
  };

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `https://devdemo.softtrails.net/users/id_user/${userId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data.user) setUserInfo(response.data.user);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [userId, token]);

  // Fetch manager info
  useEffect(() => {
    const fetchManagerDetails = async () => {
      try {
        const token = sessionStorage.getItem("token");

        const response = await axios.get(
          `https://devdemo.softtrails.net/users/id_user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setManagerId(response.data.user.manager_id);
        setManagerName(response.data.user.manager_name);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching manager details:", error);
        setLoading(false);
      }
    };
    if (userId) {
      fetchManagerDetails();
    }
  }, [userId]);

  // Fetch leave types
  const fetchLeaveTypes = async () => {
    try {
      const response = await axios.get(
        "https://devdemo.softtrails.net/leave/leave-types",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && Array.isArray(response.data.leave_types)) {
        setLeaveTypes(response.data.leave_types);
      }
    } catch (error) {
      console.error("Error fetching leave types:", error);
    }
  };

  // Fetch policies
  const fetchPolicies = async () => {
    try {
      const response = await axios.get("https://devdemo.softtrails.net/leave/get-policy", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data.data)) {
        setPolicies(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
    fetchPolicies();
  }, [token]);

  // Handle leave type selection
  // const handleLeaveTypeChange = (e) => {
  //   const selectedType = e.target.value;
  //   setLeaveType(selectedType);

  //   const selectedLeaveType = leaveTypes.find(
  //     (item) => item.leave_type === selectedType
  //   );
  //   if (selectedLeaveType) {
  //     const matchedPolicy = policies.find(
  //       (p) => p.id === selectedLeaveType.policy_id
  //     );
  //     setHalfDayAllowed(matchedPolicy?.half_day_allowed || false);
  //   }

  //   setHalfDayStart(false);
  //   setHalfDayEnd(false);
  // };

  const fetchLeaveBalance = async (selectedType) => {
    try {
      const token = sessionStorage.getItem("token");

      // Fetch balances from backend
      const response = await axios.get(
        `https://devdemo.softtrails.net/leave/leave-balances/${userId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const balances = response.data.leave_balance;

      // Find balance for selected leave type
      const matched = balances.find(
        (b) => b.leave_type === selectedType
      );

      setLeaveBalance(matched || null);
    } catch (error) {
      console.error("Error fetching leave balance:", error);
    }
  };


  const handleLeaveTypeChange = async (e) => {
    const selectedType = e.target.value;
    setLeaveType(selectedType);

    // Fetch balance for selected leave type
    fetchLeaveBalance(selectedType);

    const selectedLeaveType = leaveTypes.find(
      (item) => item.leave_type === selectedType
    );

    if (selectedLeaveType) {
      const matchedPolicy = policies.find(
        (p) => p.id === selectedLeaveType.policy_id
      );
      setHalfDayAllowed(matchedPolicy?.half_day_allowed || false);
    }

    setHalfDayStart(false);
    setHalfDayEnd(false);
  };


  const resetForm = () => {
    setLeaveType("");
    setStartDate("");
    setEndDate("");
    setReason("");
    setHalfDayStart(false);
    setHalfDayEnd(false);
    setDocument(null);
  };

  const getDmsPublishId = async () => {
    const url = "https://devdemo.softtrails.net/mapping/check";
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(url, {
        params: {
          service_name: "HRMS",
          doctype: "Apply Leave",
          doc_name: "Apply Leave",
        },
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      return response.data.dms_publish_id || null;
    } catch (error) {
      console.error("Mapping check failed:", error);
      return null;
    }
  };

  const handleFileUpload = async (file) => {
    const publishId = await getDmsPublishId();
    const token = sessionStorage.getItem("token");

    if (!file || !publishId || !userId || !token) {
      console.warn("Missing required fields for file upload");
      return null;
    }

    const uploadData = new FormData();
    uploadData.append("documents", file);
    uploadData.append("ref", "DMS");

    const metadata = [
      {
        service: "HRMS",
        publish_id: parseInt(publishId),
        user_id: userId,
        document_name: file.name.replace(/[^a-zA-Z0-9_.\- ]/g, ""),
      },
    ];
    uploadData.append("metadata", JSON.stringify(metadata));

    try {
      const response = await fetch(
        "https://devdemo.softtrails.net/dmsapi/upload-documents",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        }
      );

      const data = await response.json();
      if (data.error) {
        setErrorMessage(`Document Upload Error: ${data.error}`);
        throw new Error(data.error);
      }

      return data.uploaded_files?.[0]?.file_url || null;
    } catch (error) {
      console.error("Upload failed:", error);
      setErrorMessage(
        `Document Upload Error: ${error.message || "Unknown upload error"}`
      );
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!userInfo) { setErrorMessage("User info not loaded yet."); return; }
    let documentUrl = null;
    try {
      if (document) { documentUrl = await handleFileUpload(document); }
      const payload = {
        leave_type,
        start_date,
        end_date,
        reason,
        manager_id: managerId,
        user_id: userId,
        half_day_start: halfDayStart,
        half_day_end: halfDayEnd,
        email: userInfo.email,
        phone_no: userInfo.phone_no,
        document_url: documentUrl,
      };
      const response = await axios.post("https://devdemo.softtrails.net/leave/leave-requests",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Swal.fire("Success!", "Leave submitted successfully!", "success");
      if (onLeaveSubmit) await onLeaveSubmit();
      resetForm();
      closeModal();
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Unknown error";
      setErrorMessage(`Leave Request Error: ${msg}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex overflow-hidden flex-col px-5 pt-2.5 pb-7 bg-white rounded-lg shadow-sm border-stone-300 max-w-[553px] modal-container max-h-screen overflow-y-auto" >
      <div className="flex justify-between items-center border-b pb-2">
        <h2 className="text-[16px] font-semibold">Apply Leave</h2>
        <button className="text-black text-lg" onClick={closeModal}> &times; </button>
      </div>

      <div className="max-md:max-w-full">
        <div className="flex flex-col gap-5 max-md:flex-col">
          {/* Manager & Leave Type */}
          <div className="flex gap-5 max-md:flex-col">
            <div className="flex flex-col w-1/2 max-md:w-full">
              <div className="mb-1 mt-4">
                <label className="block text-sm font-medium text-gray-700">Manager Name<span className="text-red-500">*</span></label>
                <div className="px-4 py-2 border border-gray-300 rounded-md">{loading ? "Loading..." : managerName || "Not available"}</div>
              </div>
            </div>
            <div className="flex flex-col w-1/2 max-md:w-full">
              <div className="mb-1 mt-4">
                <label className="block text-sm font-medium text-gray-700">Leave Type <span className="text-red-500">*</span></label>
                <select value={leave_type} onChange={handleLeaveTypeChange} className="px-4 py-2 border border-gray-300 rounded-md w-full" required >
                  <option value="">Leave type</option>
                  {leaveTypes.map((type, idx) => (<option key={idx} value={type.leave_type}>{type.leave_type}</option>))}
                </select>
                {leaveBalance && (
                  <div className="mt-2 p-2 bg-blue-50 border border-blue-300 rounded-md text-sm">
                    <p><strong>Total Balance:</strong> {leaveBalance.total_balance}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Start & End Dates */}
          <div className="flex gap-5 max-md:flex-col">
            <div className="flex flex-1 items-center gap-5 max-md:flex-col">
              <div className="flex flex-col w-1/2 max-md:w-full">
                <label className="block text-sm font-medium text-gray-700"> Start Date<span className="text-red-500">*</span> </label>
                <input type="date" value={start_date} onChange={(e) => setStartDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md w-full" required />
              </div>

              {halfDayAllowed && (
                <div className="flex items-center gap-2 mt-4 max-md:mt-0">
                  <input type="checkbox" checked={halfDayStart} onChange={() => setHalfDayStart(!halfDayStart)} />
                  <label className="text-sm font-medium text-gray-700"> First Half </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-5 max-md:flex-col">
            <div className="flex flex-1 items-center gap-5 max-md:flex-col">
              <div className="flex flex-col w-1/2 max-md:w-full">
                <label className="block text-sm font-medium text-gray-700">End Date<span className="text-red-500">*</span></label>
                <input type="date" value={end_date} onChange={(e) => setEndDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-md w-full" required />
              </div>

              {halfDayAllowed && (
                <div className="flex items-center gap-2 mt-4 max-md:mt-0">
                  <input type="checkbox" checked={halfDayEnd} onChange={() => setHalfDayEnd(!halfDayEnd)} />
                  <label className="text-sm font-medium text-gray-700">Second Half</label>
                </div>
              )}
            </div>
          </div>

          {/* Reason */}
          <div className="flex flex-col mt-4 w-full">
            <label className="block text-sm font-medium text-gray-700">Reason<span className="text-red-500">*</span></label>
            <textarea className="h-32 w-full border rounded-lg p-2 resize-none" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter the reason for leave" required />
          </div>

          {/* Document Upload (if required by policy) */}
          {(() => {
            const selectedLeaveType = leaveTypes.find((item) => item.leave_type === leave_type);
            const matchedPolicy = selectedLeaveType ? policies.find((p) => p.id === selectedLeaveType.policy_id) : null;
            const documentThreshold = matchedPolicy?.document_threshold || null;
            const documentRequired = matchedPolicy?.document_required || false;
            if (
              documentRequired &&
              documentThreshold &&
              workingDaysCount > documentThreshold
            ) {
              return (
                <div className="flex flex-col mt-4 w-full">
                  <label className="block text-sm font-medium text-gray-700">Upload Document</label>
                  <input type="file" onChange={(e) => setDocument(e.target.files[0])} className="px-4 py-2 border border-gray-300 rounded-md" />
                </div>
              );
            }
            return null;
          })()}
        </div>

        {errorMessage && (<div className="text-red-500 text-sm font-medium mb-4">{errorMessage}</div>)}
      </div>

      {/* Buttons */}
      <div className="flex gap-6 self-end mt-6 text-sm whitespace-nowrap">
        <button type="button" className="px-14 py-3 text-black border border-neutral-400 rounded-[30px]" onClick={closeModal} > Cancel </button>
        <button type="submit" className="px-14 py-3 bg-gray-700 hover:bg-blue-600 text-white rounded-[30px]" > Submit </button>
      </div>
    </form >
  );
};

/*************************************** *************************************/
const LeavesTable = ({ leaves, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaveIdToDelete, setLeaveIdToDelete] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const openDeleteModal = (id) => {
    setLeaveIdToDelete(id);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setLeaveIdToDelete(null);
    setErrorMessage('');
    setIsModalOpen(false);
  };

  const confirmDelete = async () => {
    if (onDelete) {
      try {
        await onDelete(leaveIdToDelete);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'The leave request has been deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
        });

        closeDeleteModal();
      } catch (error) {
        const errorMessage = error?.response?.data?.error || error.message || 'Failed to delete leave.';

        Swal.fire({
          icon: 'error',
          title: 'Deletion Failed!',
          text: errorMessage.includes('Cannot delete leave request after the start date')
            ? 'You cannot delete a leave request after the start date.'
            : errorMessage,
        });

        setErrorMessage(errorMessage);
      }
    }
  };

  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen1, setIsModalOpen1] = useState(false);

  // Close modal
  const closeModal = () => {
    setIsModalOpen1(false);
    setSelectedLeave(null);
  };
  /****************** Pagination ****************/
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;
  const totalPages = Math.ceil(leaves.length / itemsPerPage);
  const currentData = leaves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  /************* Pagination End ************* */

  return (
    <div className="overflow-x-auto">
      <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
        <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
          <table className="min-w-full table-auto border-collapse text-sm">
            <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
              <tr>
                <th className="p-5 text-left text-black">S.No</th>
                <th className="p-5 text-left text-black">Leave Type</th>
                <th className="p-5 text-left text-black">Start Date</th>
                <th className="p-5 text-left text-black">End Date</th>
                <th className="p-5 text-left text-black">Leave Days</th>
                <th className="p-5 text-left text-black">Status</th>
                <th className="p-5 text-left text-black">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
              {currentData.map((leave, index) => (
                <tr key={index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                  <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_type}</td>
                  <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.start_date).toLocaleDateString('en-GB')}</td>
                  <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.end_date).toLocaleDateString('en-GB')}</td>
                  <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_days}</td>
                  <td
                    className={`px-2 md:px-4 py-2 text-left cursor-pointer underline flex items-center ${leave.status === "approved"
                      ? "text-green-500"
                      : leave.status === "rejected"
                        ? "text-red-500"
                        : "text-blue-500"
                      }`}
                    onClick={() => {
                      setSelectedLeave(leave);
                      setIsModalOpen1(true);
                    }}>
                    {leave.status === "approved" && <FaCheckCircle />}
                    {leave.status === "rejected" && <FaTimesCircle />}
                    {leave.status === "pending" && <FaClock />}
                    <span>
                      {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-2 md:px-4 py-2 text-left">
                    <div className="flex items-center gap-3">
                      {/* Delete Button */}
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => openDeleteModal(leave.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                      {/* PDF Button */}
                      {leave.document_url && leave.document_url !== "false" && (
                        <button
                          onClick={() => window.open(leave.document_url, "_blank")}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          title="View Document"
                        >
                          <img src={folder} alt="preview" className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Sticky pagination at bottom of the fixed-height container */}
        <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt;
          </button>

          <span className="px-3 py-1 bg-blue-600 text-white rounded">
            {currentPage}
          </span>
          <span>of</span>
          <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
            {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full sm:w-96 mx-4">

            <h2 className="text-2xl font-semibold text-center mb-4">Confirm Delete</h2>
            <p className="text-gray-700 text-center mb-6">
              Are you sure you want to delete this leave request?
            </p>
            <div className="mt-4 flex justify-between gap-4">
              <button
                className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-all"
                onClick={closeDeleteModal}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen1 && selectedLeave && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl">
            <h3 className="text-2xl font-bold text-center text-gray-800 mb-6 border-b pb-2">
              Leave Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-700 text-[15px]">
              <div>
                <span className="font-semibold">Manager Name:</span> {selectedLeave.first_name} {selectedLeave.last_name}
              </div>
              <div> <span className="font-semibold">Leave Type:</span> {selectedLeave.leave_type} </div>
              <div> <span className="font-semibold">Start Date:</span>{" "} {new Date(selectedLeave.start_date).toLocaleDateString()} </div>
              <div> <span className="font-semibold">End Date:</span>{" "} {new Date(selectedLeave.end_date).toLocaleDateString()} </div>
              <div> <span className="font-semibold">Leave Days:</span>{" "} {selectedLeave.leave_days || "N/A"} </div>
              <div>
                <span className="font-semibold">Status:</span>{" "}
                <span className={`px-2 py-1 rounded text-white text-sm ${selectedLeave.status === "approved" ? "bg-green-500" : selectedLeave.status === "pending" ? "bg-yellow-500" : "bg-red-500"}`} > {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)} </span>
              </div>
              <div><span className="font-semibold">Half Day Start:</span>{" "}{selectedLeave.half_day_start ? "Yes" : "No"}</div>
              <div><span className="font-semibold">Half Day End:</span>{" "}{selectedLeave.half_day_end ? "Yes" : "No"}</div>
              <div className="md:col-span-2"><span className="font-semibold">Reason:</span>{" "}{selectedLeave.reason || "N/A"}</div>
              <div className="md:col-span-2"><span className="font-semibold">Remarks:</span>{" "}{selectedLeave.remarks || "N/A"}</div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LeaveManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [managersId, setManagersId] = useState(null);
  const userId = sessionStorage.getItem('userId');
  const token = sessionStorage.getItem('token');
  const fetchLeaves = async () => {
    if (!userId || !token) return;
    try {
      const response = await axios.get(`https://devdemo.softtrails.net/leave/leave-requests/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      let leaveData = response.data.leave_requests || [];
      leaveData.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
      setLeaves(leaveData);
      setManagersId(leaveData[0]?.manager_id || null);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://devdemo.softtrails.net/leave/leave-requests/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { action: "delete" },
      });
      setLeaves((prevLeaves) => prevLeaves.filter((leave) => leave.id !== id));
    } catch (error) {
      console.error('Error deleting leave:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete leave.';
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [userId, token]);

  return (
    <div className='w-full'>
      <div className='justify-between flex mb-3 mt-4'>
        <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Apply Leave</AddButton>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-black opacity-50 absolute inset-0 z-40"
            onClick={() => setIsAddModalOpen(false)}
          ></div>
          <div className="relative z-50">
            <CreateLeave closeModal={() => setIsAddModalOpen(false)}
              onLeaveSubmit={fetchLeaves}
            />
          </div>
        </div>
      )}

      <LeavesTable leaves={leaves} onDelete={handleDelete} />
    </div>
  );
};
export default LeaveManagement;


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import Swal from 'sweetalert2';
// import { faTrash } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { FaCheckCircle, FaTimesCircle, FaClock, FaPlus } from 'react-icons/fa';
// import AddButton from "../../NewComponents/AddButton";
// import folder from '../../assests/folder.png';
// import NotificationSelector from '../../Asset/Components/NotificationSelector';

// const CreateLeave = ({ closeModal, onLeaveSubmit }) => {
//   const userId = sessionStorage.getItem("userId");
//   const token = sessionStorage.getItem("token");
//   const [leave_type, setLeaveType] = useState("");
//   const [start_date, setStartDate] = useState("");
//   const [end_date, setEndDate] = useState("");
//   const [reason, setReason] = useState("");
//   const [managerId, setManagerId] = useState("");
//   const [managerName, setManagerName] = useState("");
//   const [leaveTypes, setLeaveTypes] = useState([]);
//   const [policies, setPolicies] = useState([]);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [halfDayStart, setHalfDayStart] = useState(false);
//   const [halfDayEnd, setHalfDayEnd] = useState(false);
//   const [halfDayAllowed, setHalfDayAllowed] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [userInfo, setUserInfo] = useState(null);
//   const [workingDaysConfig, setWorkingDaysConfig] = useState([]);
//   const [workingDaysCount, setWorkingDaysCount] = useState(0);
//   const [document, setDocument] = useState(null);

//   useEffect(() => {
//     const fetchWorkingDays = async () => {
//       try {
//         const token = sessionStorage.getItem("token");
//         const response = await axios.get(
//           "https://devdemo.softtrails.net/leave/working-days",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setWorkingDaysConfig(response.data);
//       } catch (error) {
//         console.error("Error fetching working days:", error);
//       }
//     };

//     fetchWorkingDays();
//   }, []);

//   useEffect(() => {
//     if (start_date && end_date && workingDaysConfig.length > 0) {
//       const count = calculateWorkingDays(
//         new Date(start_date),
//         new Date(end_date),
//         workingDaysConfig
//       );
//       setWorkingDaysCount(count);
//     }
//   }, [start_date, end_date, workingDaysConfig]);

//   const calculateWorkingDays = (start, end, config) => {
//     let count = 0;
//     const isWorkingDay = (date) => {
//       const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
//       const dayRule = config.find((d) => d.day_name === dayName);

//       // If the API doesn’t define the day at all → not working
//       if (!dayRule) return false;

//       const weeks = dayRule.weeks;

//       // If no week is working → not a working day
//       if (!weeks || weeks.length === 0) return false;

//       // If "all" → every week of month is working
//       if (weeks.includes("all")) return true;

//       // Otherwise, check which week of month this date falls in (1st, 2nd, 3rd, etc.)
//       const weekOfMonth = Math.ceil(date.getDate() / 7);
//       const weekName =
//         weekOfMonth === 1
//           ? "1st"
//           : weekOfMonth === 2
//             ? "2nd"
//             : weekOfMonth === 3
//               ? "3rd"
//               : weekOfMonth === 4
//                 ? "4th"
//                 : "5th";

//       return weeks.includes(weekName);
//     };

//     // Iterate from start to end date
//     let current = new Date(start);
//     while (current <= end) {
//       if (isWorkingDay(current)) count++;
//       current.setDate(current.getDate() + 1);
//     }

//     return count;
//   };

//   useEffect(() => {
//     if (userId) {
//       const fetchUserData = async () => {
//         try {
//           const response = await axios.get(
//             `https://devdemo.softtrails.net/users/id_user/${userId}`,
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           );
//           if (response.data.user) setUserInfo(response.data.user);
//         } catch (error) {
//           console.error("Error fetching user data:", error);
//         }
//       };
//       fetchUserData();
//     }
//   }, [userId, token]);

//   // Fetch manager info
//   useEffect(() => {
//     const fetchManagerDetails = async () => {
//       try {
//         const token = sessionStorage.getItem("token");

//         const response = await axios.get(
//           `https://devdemo.softtrails.net/users/id_user/${userId}`,
//           {
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         );
//         setManagerId(response.data.user.manager_id);
//         setManagerName(response.data.user.manager_name);
//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching manager details:", error);
//         setLoading(false);
//       }
//     };
//     if (userId) {
//       fetchManagerDetails();
//     }
//   }, [userId]);

//   // Fetch leave types
//   const fetchLeaveTypes = async () => {
//     try {
//       const response = await axios.get(
//         "https://devdemo.softtrails.net/leave/leave-types",
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       if (response.data && Array.isArray(response.data.leave_types)) {
//         setLeaveTypes(response.data.leave_types);
//       }
//     } catch (error) {
//       console.error("Error fetching leave types:", error);
//     }
//   };

//   // Fetch policies
//   const fetchPolicies = async () => {
//     try {
//       const response = await axios.get("https://devdemo.softtrails.net/leave/get-policy", {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (response.data && Array.isArray(response.data.data)) {
//         setPolicies(response.data.data);
//       }
//     } catch (error) {
//       console.error("Error fetching policies:", error);
//     }
//   };

//   useEffect(() => {
//     fetchLeaveTypes();
//     fetchPolicies();
//   }, [token]);

//   // Handle leave type selection
//   const handleLeaveTypeChange = (e) => {
//     const selectedType = e.target.value;
//     setLeaveType(selectedType);
//     const selectedLeaveType = leaveTypes.find(
//       (item) => item.leave_type === selectedType
//     );
//     if (selectedLeaveType) {
//       const matchedPolicy = policies.find(
//         (p) => p.id === selectedLeaveType.policy_id
//       );
//       setHalfDayAllowed(matchedPolicy?.half_day_allowed || false);
//     }
//     setHalfDayStart(false);
//     setHalfDayEnd(false);
//   };

//   const resetForm = () => {
//     setLeaveType("");
//     setStartDate("");
//     setEndDate("");
//     setReason("");
//     setHalfDayStart(false);
//     setHalfDayEnd(false);
//     setDocument(null);
//   };

//   const getDmsPublishId = async () => {
//     const url = "https://devdemo.softtrails.net/mapping/check";
//     try {
//       const token = sessionStorage.getItem("token");
//       const response = await axios.get(url, {
//         params: {
//           service_name: "HRMS",
//           doctype: "Apply Leave",
//           doc_name: "Apply Leave",
//         },
//         headers: { Authorization: `Bearer ${token}` },
//         timeout: 10000,
//       });

//       return response.data.dms_publish_id || null;
//     } catch (error) {
//       console.error("Mapping check failed:", error);
//       return null;
//     }
//   };
//   const [isNotificationOpen, setIsNotificationOpen] = useState(false);

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   setErrorMessage("");

//   //   if (!userInfo) {
//   //     setErrorMessage("User info not loaded yet.");
//   //     return;
//   //   }

//   //   let documentUrl = null;

//   //   try {
//   //     if (document) {
//   //       documentUrl = await handleFileUpload(document); // Handles its own error
//   //     }

//   //     const payload = {
//   //       leave_type,
//   //       start_date,
//   //       end_date,
//   //       reason,
//   //       manager_id: managerId,
//   //       user_id: userId,
//   //       half_day_start: halfDayStart,
//   //       half_day_end: halfDayEnd,
//   //       email: userInfo.email,
//   //       phone_no: userInfo.phone_no,
//   //       action: "Request for Leave",
//   //       document_url: documentUrl,
//   //     };

//   //     const response = await axios.post(
//   //       "https://devdemo.softtrails.net/leave/leave-requests",
//   //       payload,
//   //       {
//   //         headers: {
//   //           "Content-Type": "application/json",
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );

//   //     Swal.fire("Success!", "Leave submitted successfully!", "success");
//   //     if (onLeaveSubmit) await onLeaveSubmit();
//   //     resetForm();
//   //     closeModal();
//   //   } catch (error) {
//   //     const backendError = error.response?.data || {};
//   //     let detailedMsg = "";

//   //     // Extract specific error details
//   //     if (backendError.error && backendError.message) {
//   //       detailedMsg = `${backendError.error}: ${backendError.message}`;
//   //     } else if (backendError.error) {
//   //       detailedMsg = backendError.error;
//   //     } else if (backendError.message) {
//   //       detailedMsg = backendError.message;
//   //     } else {
//   //       detailedMsg = error.message || "Unknown error occurred.";
//   //     }
//   //     if (backendError.already_applied_dates?.length) {
//   //       detailedMsg += `\nAlready applied dates: ${backendError.already_applied_dates.join(", ")}`;
//   //     }
//   //     setErrorMessage(detailedMsg);
//   //   }
//   // };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");

//     if (!userInfo) {
//       setErrorMessage("User info not loaded yet.");
//       return;
//     }

//     try {
//       const payload = {
//         leave_type,
//         start_date,
//         end_date,
//         reason,
//         manager_id: managerId,
//         user_id: userId,
//         half_day_start: halfDayStart,
//         half_day_end: halfDayEnd,
//         email: userInfo.email,
//         phone_no: userInfo.phone_no,
//         action: "Request for Leave",
//       };

//       await axios.post("https://devdemo.softtrails.net/leave/leave-requests", payload, {
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//       });

//       Swal.fire("Success!", "Leave submitted successfully!", "success");
//       resetForm();
//       if (onLeaveSubmit) await onLeaveSubmit();

//       setIsNotificationOpen(true);
//     } catch (error) {
//       const backendError = error.response?.data || {};
//       setErrorMessage(backendError.message || "Unknown error occurred.");
//     }
//   };


//   const handleNotificationConfirm = (selected) => {
//     console.log("Notification Methods Selected:", selected);
//     setIsNotificationOpen(false);
//     closeModal(); // ✅ close main modal after notification choice
//   };

//   return (
//     <>
//     <form
//       onSubmit={handleSubmit}
//       className="flex overflow-hidden flex-col px-5 pt-2.5 pb-7 bg-white rounded-lg shadow-sm border-stone-300 max-w-[553px] modal-container max-h-screen overflow-y-auto"
//     >
//       <div className="flex justify-end border-b">
//         <button
//           type="button"
//           className="text-black font-bold text-xl"
//           onClick={closeModal}
//         >
//           &times;
//         </button>
//       </div>

//       <div className="max-md:max-w-full">
//         <div className="flex flex-col gap-5 max-md:flex-col">
//           {/* Manager & Leave Type */}
//           <div className="flex gap-5 max-md:flex-col">
//             <div className="flex flex-col w-1/2 max-md:w-full">
//               <div className="mb-1 mt-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Manager Name<span className="text-red-500">*</span>
//                 </label>
//                 <div className="px-4 py-2 border border-gray-300 rounded-md">
//                   {loading ? "Loading..." : managerName || "Not available"}
//                 </div>
//               </div>
//             </div>
//             <div className="flex flex-col w-1/2 max-md:w-full">
//               <div className="mb-1 mt-4">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Leave Type <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={leave_type}
//                   onChange={handleLeaveTypeChange}
//                   className="px-4 py-2 border border-gray-300 rounded-md w-full"
//                   required
//                 >
//                   <option value="">Leave type</option>
//                   {leaveTypes.map((type, idx) => (
//                     <option key={idx} value={type.leave_type}>
//                       {type.leave_type}
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             </div>
//           </div>

//           {/* Start & End Dates */}
//           <div className="flex gap-5 max-md:flex-col">
//             <div className="flex flex-1 items-center gap-5 max-md:flex-col">
//               <div className="flex flex-col w-1/2 max-md:w-full">
//                 <label className="block text-sm font-medium text-gray-700">
//                   Start Date<span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   value={start_date}
//                   onChange={(e) => setStartDate(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 rounded-md w-full"
//                   required
//                 />
//               </div>

//               {halfDayAllowed && (
//                 <div className="flex items-center gap-2 mt-4 max-md:mt-0">
//                   <input
//                     type="checkbox"
//                     checked={halfDayStart}
//                     onChange={() => setHalfDayStart(!halfDayStart)}
//                   />
//                   <label className="text-sm font-medium text-gray-700">
//                     First Half
//                   </label>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="flex gap-5 max-md:flex-col">
//             <div className="flex flex-1 items-center gap-5 max-md:flex-col">
//               <div className="flex flex-col w-1/2 max-md:w-full">
//                 <label className="block text-sm font-medium text-gray-700">
//                   End Date<span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="date"
//                   value={end_date}
//                   onChange={(e) => setEndDate(e.target.value)}
//                   className="px-4 py-2 border border-gray-300 rounded-md w-full"
//                   required
//                 />
//               </div>

//               {halfDayAllowed && (
//                 <div className="flex items-center gap-2 mt-4 max-md:mt-0">
//                   <input
//                     type="checkbox"
//                     checked={halfDayEnd}
//                     onChange={() => setHalfDayEnd(!halfDayEnd)}
//                   />
//                   <label className="text-sm font-medium text-gray-700">
//                     Second Half
//                   </label>
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Reason */}
//           <div className="flex flex-col mt-4 w-full">
//             <label className="block text-sm font-medium text-gray-700">
//               Reason<span className="text-red-500">*</span>
//             </label>
//             <textarea
//               className="h-32 w-full border rounded-lg p-2 resize-none"
//               value={reason}
//               onChange={(e) => setReason(e.target.value)}
//               placeholder="Enter the reason for leave"
//               required
//             />
//           </div>

//           {/* Document Upload (if required by policy) */}
//           {(() => {
//             const selectedLeaveType = leaveTypes.find(
//               (item) => item.leave_type === leave_type
//             );
//             const matchedPolicy = selectedLeaveType
//               ? policies.find((p) => p.id === selectedLeaveType.policy_id)
//               : null;

//             const documentThreshold = matchedPolicy?.document_threshold || null;
//             const documentRequired = matchedPolicy?.document_required || false;
//             if (
//               documentRequired &&
//               documentThreshold &&
//               workingDaysCount > documentThreshold
//             ) {
//               return (
//                 <div className="flex flex-col mt-4 w-full">
//                   <label className="block text-sm font-medium text-gray-700">
//                     Upload Document
//                   </label>
//                   <input
//                     type="file"
//                     onChange={(e) => setDocument(e.target.files[0])}
//                     className="px-4 py-2 border border-gray-300 rounded-md"
//                   />
//                 </div>
//               );
//             }
//             return null;
//           })()}
//         </div>

//         {errorMessage && (
//           <div className="text-red-500 text-sm font-medium mb-4">
//             {errorMessage}
//           </div>
//         )}
//       </div>

//       {/* Buttons */}
//       <div className="flex gap-6 self-end mt-6 text-sm whitespace-nowrap">
//         <button
//           type="button"
//           className="px-14 py-3 text-black border border-neutral-400 rounded-[30px]"
//           onClick={closeModal}
//         >
//           Cancel
//         </button>
//         <button
//           type="submit"
//           className="px-14 py-3 bg-gray-700 hover:bg-blue-600 text-white rounded-[30px]"
//         >
//           Submit
//         </button>
//       </div>
//     </form >
//     <NotificationSelector
//         open={isNotificationOpen}
//         onClose={() => setIsNotificationOpen(false)}
//         onConfirm={handleNotificationConfirm}
//       />
//     </>
//   );
// };
// /*************************************** *************************************/
// const LeavesTable = ({ leaves, onDelete }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [leaveIdToDelete, setLeaveIdToDelete] = useState(null);
//   const [errorMessage, setErrorMessage] = useState('');

//   const openDeleteModal = (id) => {
//     setLeaveIdToDelete(id);
//     setErrorMessage('');
//     setIsModalOpen(true);
//   };

//   const closeDeleteModal = () => {
//     setLeaveIdToDelete(null);
//     setErrorMessage('');
//     setIsModalOpen(false);
//   };

//   const confirmDelete = async () => {
//     if (onDelete) {
//       try {
//         await onDelete(leaveIdToDelete);
//         Swal.fire({
//           icon: 'success',
//           title: 'Deleted!',
//           text: 'The leave request has been deleted successfully.',
//           timer: 2000,
//           showConfirmButton: false,
//         });

//         closeDeleteModal();
//       } catch (error) {
//         const errorMessage = error?.response?.data?.error || error.message || 'Failed to delete leave.';

//         Swal.fire({
//           icon: 'error',
//           title: 'Deletion Failed!',
//           text: errorMessage.includes('Cannot delete leave request after the start date')
//             ? 'You cannot delete a leave request after the start date.'
//             : errorMessage,
//         });

//         setErrorMessage(errorMessage);
//       }
//     }
//   };

//   const [selectedLeave, setSelectedLeave] = useState(null);
//   const [isModalOpen1, setIsModalOpen1] = useState(false);

//   // Close modal
//   const closeModal = () => {
//     setIsModalOpen1(false);
//     setSelectedLeave(null);
//   };
//   /****************** Pagination ****************/
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 15;
//   const totalPages = Math.ceil(leaves.length / itemsPerPage);
//   const currentData = leaves.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Handle page change
//   const handlePageChange = (page) => {
//     setCurrentPage(page);
//   };
//   /************* Pagination End ************* */

//   return (
//     <div className="overflow-x-auto">
//       <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
//         <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
//           <table className="min-w-full table-auto border-collapse text-sm">
//             <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
//               <tr>
//                 <th className="p-5 text-left text-black">S.No</th>
//                 <th className="p-5 text-left text-black">Leave Type</th>
//                 <th className="p-5 text-left text-black">Start Date</th>
//                 <th className="p-5 text-left text-black">End Date</th>
//                 <th className="p-5 text-left text-black">Leave Days</th>
//                 <th className="p-5 text-left text-black">Status</th>
//                 <th className="p-5 text-left text-black">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
//               {currentData.map((leave, index) => (
//                 <tr key={index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
//                   <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
//                   <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_type}</td>
//                   <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.start_date).toLocaleDateString('en-GB')}</td>
//                   <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.end_date).toLocaleDateString('en-GB')}</td>
//                   <td className="px-5 py-4 text-left text-[14px] text-black">{leave.leave_days}</td>
//                   <td
//                     className={`px-2 md:px-4 py-2 text-left cursor-pointer underline flex items-center ${leave.status === "approved"
//                       ? "text-green-500"
//                       : leave.status === "rejected"
//                         ? "text-red-500"
//                         : "text-blue-500"
//                       }`}
//                     onClick={() => {
//                       setSelectedLeave(leave);
//                       setIsModalOpen1(true);
//                     }}>
//                     {leave.status === "approved" && <FaCheckCircle />}
//                     {leave.status === "rejected" && <FaTimesCircle />}
//                     {leave.status === "pending" && <FaClock />}
//                     <span>
//                       {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
//                     </span>
//                   </td>
//                   <td className="px-2 md:px-4 py-2 text-left">
//                     <div className="flex items-center gap-3">
//                       {/* Delete Button */}
//                       <button
//                         className="text-red-500 hover:text-red-700"
//                         onClick={() => openDeleteModal(leave.id)}
//                       >
//                         <FontAwesomeIcon icon={faTrash} />
//                       </button>
//                       {/* PDF Button */}
//                       {leave.document_url && leave.document_url !== "false" && (
//                         <button
//                           onClick={() => window.open(leave.document_url, "_blank")}
//                           className="text-red-500 hover:text-red-700 flex items-center gap-1"
//                           title="View Document"
//                         >
//                           <img src={folder} alt="preview" className="w-5 h-5" />
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//         {/* Sticky pagination at bottom of the fixed-height container */}
//         <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100">
//           <button
//             onClick={() => handlePageChange(currentPage - 1)}
//             disabled={currentPage === 1}
//             className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             &lt;
//           </button>

//           <span className="px-3 py-1 bg-blue-600 text-white rounded">
//             {currentPage}
//           </span>
//           <span>of</span>
//           <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
//             {totalPages}
//           </span>

//           <button
//             onClick={() => handlePageChange(currentPage + 1)}
//             disabled={currentPage === totalPages}
//             className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             &gt;
//           </button>
//         </div>
//       </div>

//       {/* Delete Confirmation Modal */}
//       {isModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//           <div className="bg-white p-6 rounded-lg shadow-xl w-full sm:w-96 mx-4">

//             <h2 className="text-2xl font-semibold text-center mb-4">Confirm Delete</h2>
//             <p className="text-gray-700 text-center mb-6">
//               Are you sure you want to delete this leave request?
//             </p>
//             <div className="mt-4 flex justify-between gap-4">
//               <button
//                 className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-all"
//                 onClick={closeDeleteModal}
//               >
//                 Cancel
//               </button>
//               <button
//                 className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all"
//                 onClick={confirmDelete}
//               >
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isModalOpen1 && selectedLeave && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl">
//             <h3 className="text-2xl font-bold text-center text-gray-800 mb-6 border-b pb-2">
//               Leave Details
//             </h3>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-gray-700 text-[15px]">
//               <div>
//                 <span className="font-semibold">Manager Name:</span> {selectedLeave.first_name} {selectedLeave.last_name}
//               </div>
//               <div> <span className="font-semibold">Leave Type:</span> {selectedLeave.leave_type} </div>
//               <div> <span className="font-semibold">Start Date:</span>{" "} {new Date(selectedLeave.start_date).toLocaleDateString()} </div>
//               <div> <span className="font-semibold">End Date:</span>{" "} {new Date(selectedLeave.end_date).toLocaleDateString()} </div>
//               <div> <span className="font-semibold">Leave Days:</span>{" "} {selectedLeave.leave_days || "N/A"} </div>
//               <div>
//                 <span className="font-semibold">Status:</span>{" "}
//                 <span className={`px-2 py-1 rounded text-white text-sm ${selectedLeave.status === "approved" ? "bg-green-500" : selectedLeave.status === "pending" ? "bg-yellow-500" : "bg-red-500"}`} > {selectedLeave.status.charAt(0).toUpperCase() + selectedLeave.status.slice(1)} </span>
//               </div>
//               <div><span className="font-semibold">Half Day Start:</span>{" "}{selectedLeave.half_day_start ? "Yes" : "No"}</div>
//               <div><span className="font-semibold">Half Day End:</span>{" "}{selectedLeave.half_day_end ? "Yes" : "No"}</div>
//               <div className="md:col-span-2"><span className="font-semibold">Reason:</span>{" "}{selectedLeave.reason || "N/A"}</div>
//               <div className="md:col-span-2"><span className="font-semibold">Remarks:</span>{" "}{selectedLeave.remarks || "N/A"}</div>
//             </div>

//             <div className="mt-6 flex justify-end">
//               <button
//                 onClick={closeModal}
//                 className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition duration-200"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const LeaveManagement = () => {
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [leaves, setLeaves] = useState([]);
//   const [managersId, setManagersId] = useState(null);
//   const userId = sessionStorage.getItem('userId');
//   const token = sessionStorage.getItem('token');
//   const fetchLeaves = async () => {
//     if (!userId || !token) return;
//     try {
//       const response = await axios.get(`https://devdemo.softtrails.net/leave/leave-requests/${userId}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       let leaveData = response.data.leave_requests || [];
//       leaveData.sort((a, b) => new Date(b.start_date) - new Date(a.start_date));
//       setLeaves(leaveData);
//       setManagersId(leaveData[0]?.manager_id || null);
//     } catch (error) {
//       console.error('Error fetching leaves:', error);
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`https://devdemo.softtrails.net/leave/leave-requests/${id}`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//         data: { action: "delete" },
//       });
//       setLeaves((prevLeaves) => prevLeaves.filter((leave) => leave.id !== id));
//     } catch (error) {
//       console.error('Error deleting leave:', error);
//       const errorMessage = error.response?.data?.error || 'Failed to delete leave.';
//       throw new Error(errorMessage);
//     }
//   };

//   useEffect(() => {
//     fetchLeaves();
//   }, [userId, token]);

//   return (
//     <div className='w-full'>
//       <div className='justify-between flex mb-3 mt-4'>
//         <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Apply Leave</AddButton>
//       </div>

//       {isAddModalOpen && (
//         <div className="fixed inset-0 flex items-center justify-center z-50">
//           <div
//             className="bg-black opacity-50 absolute inset-0 z-40"
//             onClick={() => setIsAddModalOpen(false)}
//           ></div>
//           <div className="relative z-50">
//             <CreateLeave closeModal={() => setIsAddModalOpen(false)}
//               onLeaveSubmit={fetchLeaves}
//             />
//           </div>
//         </div>
//       )}

//       <LeavesTable leaves={leaves} onDelete={handleDelete} />
//     </div>
//   );
// };
// export default LeaveManagement;