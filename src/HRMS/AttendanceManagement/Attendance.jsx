import { useEffect, useState } from "react";
import axios from "axios";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";

const AttendanceTable = () => {
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   axios.get("/your-api-endpoint") // Replace with your actual API URL
  //     .then((res) => setData(res.data))
  //     .catch((err) => console.error(err));
  // }, []);

  /////////////////Pagination////////////////
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // or any value you want

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div>
      {/* Filter Row */}
      <div className="flex flex-wrap gap-2 items-center mb-4 mt-4">
        <input type="text" placeholder="Search" className="border px-2 py-1 rounded" />
        <input type="date" className="border px-2 py-1 rounded" />
        <span>TO</span>
        <input type="date" className="border px-2 py-1 rounded" />
        <select className="border px-2 py-1 rounded">
          <option>Select month</option>
        </select>
        <select className="border px-2 py-1 rounded">
          <option>Select status</option>
        </select>
        <select className="border px-2 py-1 rounded">
          <option>Source</option>
        </select>
        <FaFileExcel className="text-green-600 cursor-pointer" size={20} />
        <FaFilePdf className="text-red-600 cursor-pointer" size={20} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-h-96 rounded-lg">
        <div className="relative w-full bg-white rounded-lg overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
            <table className="min-w-full table-auto border-collapse text-sm">
              <thead className="text-[14px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                <tr>
                  <th className="p-5 text-left text-black">S.No</th>
                  <th className="p-5 text-left text-black">Employee Name</th>
                  <th className="p-5 text-left text-black">Employee Code</th>
                  <th className="p-5 text-left text-black">Date</th>
                  <th className="p-5 text-left text-black">In Time</th>
                  <th className="p-5 text-left text-black">Out Time</th>
                  <th className="p-5 text-left text-black">Working Hours</th>
                  <th className="p-5 text-left text-black">Source</th>
                  <th className="p-5 text-left text-black">Status</th>
                  <th className="p-5 text-left text-black">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
                {paginatedData.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-4">No data found</td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <tr key={row.id} className="bg-blue-50">
                      <td className="border px-4 py-2">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                      <td className="border px-4 py-2">{row.employeeName}</td>
                      <td className="border px-4 py-2 text-blue-600 font-medium">{row.employeeCode}</td>
                      <td className="border px-4 py-2">{row.date}</td>
                      <td className="border px-4 py-2">{row.inTime}</td>
                      <td className="border px-4 py-2">{row.outTime}</td>
                      <td className="border px-4 py-2">{row.workingHours}</td>
                      <td className="border px-4 py-2">{row.source}</td>
                      <td className="border px-4 py-2 text-green-700">{row.status}</td>
                      <td className="border px-4 py-2"> {/* Add your actions here */} </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="sticky bottom-0 left-0 w-full border-t border-gray-300 z-10 flex justify-center items-center gap-2 px-4 py-2 bg-white">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &lt;
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
            <span>of</span>
            <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">{totalPages}</span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
export default AttendanceTable;
