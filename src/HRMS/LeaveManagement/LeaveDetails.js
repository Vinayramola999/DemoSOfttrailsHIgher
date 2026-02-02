const LeaveDetails = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-3xl p-2 rounded-full transition duration-300 ease-in-out"
          onClick={onClose}
        >
          &times; {/* X symbol for close */}
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">User Details</h2>

        {/* User Details */}
        <div className="space-y-4">
          {/* Each User Detail */}
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Employee ID:</p>
            <p className="text-gray-800 w-2/3">{user.emp_id}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Full Name:</p>
            <p className="text-gray-800 w-2/3">{user.first_name} {user.last_name}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Phone Number:</p>
            <p className="text-gray-800 w-2/3">{user.phone_no}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Email:</p>
            <p className="text-gray-800 w-2/3">{user.email}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Department:</p>
            <p className="text-gray-800 w-2/3">{user.dept_name}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Verticals:</p>
            <p className="text-gray-800 w-2/3">{user.sub_dept_name}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Location:</p>
            <p className="text-gray-800 w-2/3">{user.locality}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Status:</p>
            <p className="text-gray-800 w-2/3">{user.user_status}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Designation:</p>
            <p className="text-gray-800 w-2/3">{user.designation}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Manager ID:</p>
            <p className="text-gray-800 w-2/3">{user.manager_id}</p>
          </div>
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Gender:</p>
            <p className="text-gray-800 w-2/3">{user.gender}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LeaveDetails;