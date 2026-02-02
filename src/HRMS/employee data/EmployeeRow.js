import React,{useState} from "react";
import { FaUser } from "react-icons/fa";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from 'sweetalert2';
import {MAIN_API_BASE } from "../../config/apiBase";

function EmployeeRow({ employee, isAlternate }) {
  // Define a conditional class name for alternating row styles
  const rowClassName = isAlternate
    ? "grid grid-cols-6 gap-4 py-3 px-6 bg-white"
    : "grid grid-cols-6 gap-4 py-3 px-6 bg-blue-50";
    const handleEmployeeClick = () => {
      // Store the employee's user_id in session storage
      sessionStorage.setItem("employeeeId", employee.user_id);
    };
    
    const [status, setStatus] = useState(employee.user_status);

    const handleStatusChange = async () => {
      const newStatus = status === "active" ? "inactive" : "active";
  
      // Show confirmation popup
      const result = await Swal.fire({
        title: "Are you sure?",
        text: `Do you want to change the status to ${newStatus.toUpperCase()}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "No, cancel",
      });
  
      if (result.isConfirmed) {
        try {
          const response = await axios.put(`${MAIN_API_BASE}/users/user/update`, {
            user_id: employee.user_id,
            user_status: newStatus,
          });
          if (response.status === 200) {
            setStatus(newStatus); 
            Swal.fire({
              icon: "success",
              title: "Status Updated",
              text: `Status changed to ${newStatus.toUpperCase()} successfully!`,
              confirmButtonText: "OK",
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "Update Failed",
              text: "Failed to update the status.",
              confirmButtonText: "Try Again",
            });
          }
        } catch (error) {
          console.error("Error updating status:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "An error occurred while updating the status.",
            confirmButtonText: "OK",
          });
        }
      } else {
        // Action cancelled
        Swal.fire({
          icon: "info",
          title: "Cancelled",
          text: "Status update was cancelled.",
          confirmButtonText: "OK",
        });
      }
    };
  
  

  return (
    <div className={rowClassName}>
      {/* Employee Name */}
      <Link
      to={{
        pathname: `/employeelayout/${employee.user_id}`,
        state: { userId: employee.user_id }, // Make sure you're passing `userId`
      }}
      onClick={handleEmployeeClick} // Trigger storing the user_id in session storage
    >
      <div className="flex items-center">
        <FaUser className="text-l mr-2" />
        {employee.first_name} {employee.last_name}
      </div>
    </Link>
    

      {/* Employee ID */}
      <div className="flex items-center">{employee.user_id}</div>

      {/* Department */}
      <div className="flex items-center">{employee.dept_name}</div>

      {/* Email */}
      <div className="flex flex-wrap items-center break-words">
        {employee.email}
      </div>

      {/* Phone Number */}
      <div className="flex items-center">{employee.phone_no}</div>

      {/* Status */}
      <div
      className={`flex items-center font-semibold ${
        status === "active" ? "text-lime-600" : "text-red-600"
      } uppercase cursor-pointer`}
      onClick={handleStatusChange}
    >
      {status}
    </div>
    </div>
  );
}

export default EmployeeRow;
