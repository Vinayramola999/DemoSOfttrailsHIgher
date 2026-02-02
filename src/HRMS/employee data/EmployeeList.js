// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import Swal from "sweetalert2";

// function EmployeeList({ employee }) {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [employeeCount, setEmployeeCount] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [selectedUserId, setSelectedUserId] = useState(null);
//   const [statusMap, setStatusMap] = useState({});

//   useEffect(() => {
//     const fetchEmployees = async () => {
//       try {
//         const token = sessionStorage.getItem("token");
//         const response = await axios.get("https://devdemo.softtrails.net/users/flagged-catgeory-users", {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         const employeeData = response.data.users;
//         setEmployees(employeeData);
//         setEmployeeCount(employeeData.length);

//         setStatusMap(
//           employeeData.reduce(
//             (acc, emp) => ({ ...acc, [emp.user_id]: emp.user_status }),
//             {}
//           )
//         );

//         setLoading(false);
//       } catch (error) {
//         console.error("Error fetching employee data:", error);
//         setLoading(false);
//       }
//     };
//     fetchEmployees();
//   }, []);


//   const filteredEmployees = employee?.length > 0 ? employee : employees;

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   const rowsPerPage = 15;
//   const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
//   const displayedEmployees = filteredEmployees.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   const handlePageChange = (page) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const handleEmployeeClick = (userId) => {
//     sessionStorage.setItem("employeeeId", userId);
//     setSelectedUserId(userId);
//   };

//   const handleStatusChange = async (employee) => {
//     const currentStatus = statusMap[employee.user_id];
//     const newStatus = currentStatus === "active" ? "inactive" : "active";
//     let remark = "";
//     if (newStatus === "inactive") {
//       const remarkResult = await Swal.fire({
//         title: "Are you sure?",
//         text: `Change status to INACTIVE? Please provide a remark.`,
//         icon: "warning",
//         input: "text",
//         inputPlaceholder: "Enter remark...",
//         inputValidator: (value) => {
//           if (!value) return "Remark is required to inactivate the user.";
//         },
//         showCancelButton: true,
//         confirmButtonText: "Submit",
//       });

//       if (!remarkResult.isConfirmed) return;
//       remark = remarkResult.value;
//     } else {
//       const confirmResult = await Swal.fire({
//         title: "Are you sure?",
//         text: `Change status to ACTIVE?`,
//         icon: "warning",
//         showCancelButton: true,
//         confirmButtonText: "Yes, update it!",
//       });

//       if (!confirmResult.isConfirmed) return;
//     }
//     try {
//       const token = sessionStorage.getItem("token");
//       const response = await axios.put(
//         "https://devdemo.softtrails.net/users/user/update",
//         {
//           user_id: employee.user_id,
//           user_status: newStatus,
//           remark: remark || null,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`, 
//           },
//         }
//       );
//       if (response.status === 200) {
//         setStatusMap((prev) => ({ ...prev, [employee.user_id]: newStatus }));
//         Swal.fire(
//           "Updated!",
//           `Status changed to ${newStatus.toUpperCase()}`,
//           "success"
//         );
//       }
//     } catch (error) {
//       console.error("Error updating status:", error);
//       Swal.fire("Error!", "Failed to update status.", "error");
//     }
//   };

//   return (
//     <div className="h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] rounded-lg flex flex-col bg-white">
//       {/* Responsive, scrollable table */}
//       <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg">
//         <table className="min-w-[900px] sm:min-w-full table-auto border-collapse text-sm">
//           <thead className="text-[14px] font-medium bg-white sticky top-0 z-10" style={{ boxShadow: "0 2px 0 black" }}>
//             <tr>
//               <th className="p-4 text-left text-black">S.No</th>
//               <th className="p-4 text-left text-black">Employee</th>
//               <th className="p-4 text-left text-black">Employee ID</th>
//               <th className="p-4 text-left text-black">Department</th>
//               <th className="p-4 text-left text-black">Email</th>
//               <th className="p-4 text-left text-black">Phone</th>
//               <th className="p-4 text-left text-black">Location</th>
//               <th className="p-4 text-left text-black">Status</th>
//             </tr>
//           </thead>

//           <tbody>
//             <tr><td colSpan="8" className="h-3 bg-white"></td></tr>
//             {displayedEmployees.map((employee, index) => (
//               <tr
//                 key={employee.id || index}
//                 className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}`}
//               >
//                 <td className="px-4 py-3 text-left text-[14px] text-black">
//                   {(currentPage - 1) * rowsPerPage + (index + 1)}
//                 </td>
//                 <td className="px-4 py-3 text-left text-[14px] text-blue-600 underline">
//                   <Link to={`/employeelayout/${employee.user_id}`} onClick={() => handleEmployeeClick(employee.user_id)}>
//                     {employee.first_name} {employee.last_name}
//                   </Link>
//                 </td>
//                 <td className="px-4 py-3 text-left text-[14px] text-black">{employee.emp_id}</td>
//                 <td className="px-4 py-3 text-left text-[14px] text-black">{employee.dept_name}</td>
//                 <td className="px-4 py-3 text-left text-[14px] text-black break-words">{employee.email}</td>
//                 <td className="px-4 py-3 text-left text-[14px] text-black">{employee.phone_no}</td>
//                 <td className="px-4 py-3 text-left text-[14px] text-black">{employee.locality}</td>
//                 <td
//                   className={`p-2 font-semibold cursor-pointer ${statusMap[employee.user_id] === "active" ? "text-lime-600" : "text-red-600"
//                     }`}
//                   onClick={() => handleStatusChange(employee)}
//                 >
//                   {statusMap[employee.user_id]}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination section */}
//       <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100">
//         <button
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           &lt;
//         </button>

//         <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
//         <span>of</span>
//         <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">{totalPages}</span>

//         <button
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           &gt;
//         </button>
//       </div>
//     </div>
//   );
// }
// export default EmployeeList;

////////////////////////////////////////////

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { MAIN_API_BASE } from "../../config/apiBase";

function EmployeeList({ employee }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employeeCount, setEmployeeCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [statusMap, setStatusMap] = useState({});

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${MAIN_API_BASE}/users/flagged-catgeory-users`,
          { headers: { Authorization: `Bearer ${token}` }, }
        );

        const employeeData = response.data.users;
        setEmployees(employeeData);
        setEmployeeCount(employeeData.length);

        setStatusMap(
          employeeData.reduce(
            (acc, emp) => ({ ...acc, [emp.user_id]: emp.user_status }),
            {}
          )
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  const filteredEmployees = employee?.length > 0 ? employee : employees;

  if (loading) {
    return <div>Loading...</div>;
  }

  const rowsPerPage = 15;
  const totalPages = Math.ceil(filteredEmployees.length / rowsPerPage);
  const displayedEmployees = filteredEmployees.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleEmployeeClick = (userId) => {
    sessionStorage.setItem("employeeeId", userId);
    setSelectedUserId(userId);
  };

  // ✅ Function to handle reason input (moved out for clarity)
  const handleStatusReason = async (currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    let remark = "";

    if (newStatus === "inactive") {
      const remarkResult = await Swal.fire({
        title: "Are you sure?",
        text: `Change status to INACTIVE? `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Submit",
      });
      if (!remarkResult.isConfirmed) return null;
      remark = remarkResult.value;
    } else {
      const confirmResult = await Swal.fire({
        title: "Are you sure?",
        text: `Change status to ACTIVE?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, update it!",
      });
      if (!confirmResult.isConfirmed) return null;
    }

    return { newStatus, remark };
  };

  // ✅ Cleaned-up status change handler
  const handleStatusChange = async (employee) => {
    const currentStatus = statusMap[employee.user_id];
    const result = await handleStatusReason(currentStatus);
    if (!result) return;

    const { newStatus, remark } = result;

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.put(`${MAIN_API_BASE}/users/user/update`,
        {
          user_id: employee.user_id,
          user_status: newStatus,
          remark: remark || null,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setStatusMap((prev) => ({ ...prev, [employee.user_id]: newStatus }));
        Swal.fire(
          "Updated!",
          `Status changed to ${newStatus.toUpperCase()}`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire("Error!", "Failed to update status.", "error");
    }
  };

  return (
    <div className="h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] rounded-lg flex flex-col bg-white">
      {/* Table */}
      <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 rounded-lg">
        <table className="min-w-[900px] sm:min-w-full table-auto border-collapse text-sm">
          <thead className="text-[14px] font-medium bg-white sticky top-0 z-10" style={{ boxShadow: "0 2px 0 black" }} >
            <tr>
              <th className="p-4 text-left text-black">S.No</th>
              <th className="p-4 text-left text-black">Employee</th>
              <th className="p-4 text-left text-black">Employee ID</th>
              <th className="p-4 text-left text-black">Department</th>
              <th className="p-4 text-left text-black">Email</th>
              <th className="p-4 text-left text-black">Phone</th>
              <th className="p-4 text-left text-black">Location</th>
              <th className="p-4 text-left text-black">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan="8" className="h-3 bg-white"></td></tr>
            {displayedEmployees.map((employee, index) => (
              <tr key={employee.id || index} className={`${ (index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue" }`} >
                <td className="px-4 py-3 text-left text-[14px] text-black">{(currentPage - 1) * rowsPerPage + (index + 1)}</td>
                <td className="px-4 py-3 text-left text-[14px] text-blue-600 underline">
                  <Link to={`/employeelayout/${employee.user_id}`} onClick={() => handleEmployeeClick(employee.user_id)} > {employee.first_name} {employee.last_name} </Link>
                </td>
                <td className="px-4 py-3 text-left text-[14px] text-black">{employee.emp_id}</td>
                <td className="px-4 py-3 text-left text-[14px] text-black">{employee.dept_name}</td>
                <td className="px-4 py-3 text-left text-[14px] text-black break-words">{employee.email}</td>
                <td className="px-4 py-3 text-left text-[14px] text-black">
                  {employee.phone_no}
                </td>
                <td className="px-4 py-3 text-left text-[14px] text-black">
                  {employee.locality}
                </td>
                <td className={`p-2 font-semibold cursor-pointer ${ statusMap[employee.user_id] === "active" ? "text-lime-600" : "text-red-600" }`} onClick={() => handleStatusChange(employee)} >
                  {statusMap[employee.user_id]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
  );
}
export default EmployeeList;