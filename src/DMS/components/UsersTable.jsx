import { useState } from "react";

const UsersTable = ({ users, onUserClick }) => {
  const rowsPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(users.length / rowsPerPage);
  const paginatedUsers = users.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex flex-col h-[675px] bg-white rounded-md">
      <div className="overflow-auto flex-grow">
        <table className="min-w-full text-sm">
          <thead className="text-black font-medium border-b border-black">
            <tr className="h-16">
              <th className="px-4 py-4 text-left">S. No.</th>
              <th className="px-4 py-4 text-left">Name</th>
              <th className="px-4 py-4 text-left">User ID</th>
              <th className="px-4 py-4 text-left">Documents Count</th>
              <th className="px-4 py-4 text-left">Approval Docs Count</th>
              <th className="px-4 py-4 text-left">Application Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-3"></tr>
            {paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, index) => (
                <tr
                  key={user.user_id}
                  onClick={() => onUserClick(user.user_id)}
                  className="hover:bg-gray-50 transition border-b odd:bg-white even:bg-blue-100 h-14 cursor-pointer"
                >
                  <td className="px-4 py-3">
                    {(currentPage - 1) * rowsPerPage + index + 1}.
                  </td>
                  <td className="px-4 py-3 font-semibold text-blue-600">
                    {user.full_name}
                  </td>
                  <td className="px-4 py-3">{user.user_id}</td>
                  <td className="px-4 py-3 font-semibold">
                    {user.documents_count}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    {user.approval_needed_count}
                  </td>
                  <td className={"px-4 py-3 font-semibold "}>
                    <div
                      className={`px-2 py-1 rounded-full w-max ${
                        user.application_status === "Approved"
                          ? "text-green-600 bg-green-100"
                          : user.application_status === "Pending"
                          ? "text-yellow-600 bg-yellow-100"
                          : "text-red-600 bg-red-100"
                      }`}
                    >
                      {user.application_status}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-4 text-gray-500 font-medium"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 bg-white border-t border-gray-200 flex justify-center items-center gap-2 select-none py-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
        >
          &#x2039;
        </button>

        <button className="w-9 h-9 flex items-center justify-center rounded-md border bg-blue-600 text-white font-semibold">
          {currentPage}
        </button>

        <span className="text-sm font-medium text-gray-600">of</span>

        <button className="w-9 h-9 flex items-center justify-center rounded-md border text-blue-600 border-blue-500 font-semibold">
          {totalPages}
        </button>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`w-9 h-9 flex items-center justify-center rounded-md border ${
            currentPage === totalPages
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "hover:bg-gray-200"
          }`}
        >
          &#x203A;
        </button>
      </div>
    </div>
  );
};

export default UsersTable;
