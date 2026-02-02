import { useState, useEffect } from 'react';
import { MAIN_API_BASE } from '../config/apiBase';
import axios from 'axios';

function UserDetails({ user, onClose }) {
  const [managerName, setManagerName] = useState('');
  const [managerEmail, setManagerEmail] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingManager, setLoadingManager] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);

  useEffect(() => {
  fetch(`${MAIN_API_BASE}/users/getusers`, {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
  })
    .then((response) => response.json()) // ✅ convert to JSON
    .then((data) => {
      const users = data.users || [];
      const manager = users.find((u) => u.user_id === user.manager_id);

      if (manager) {
        setManagerName(`${manager.first_name} ${manager.last_name}`);
        setManagerEmail(manager.email);
      }
      setLoadingManager(false);
    })
    .catch((error) => {
      console.error('Error fetching users:', error);
      setLoadingManager(false);
    });

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const currentToken = sessionStorage.getItem('token');
      const response = await axios.get(`${MAIN_API_BASE}/user-category/all`,
        {
          headers: { Authorization: `Bearer ${currentToken}` },
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        const options = response.data.data
          .filter((cat) => cat.status === 'active') // only active
          .map((cat) => ({
            value: cat.category_id,
            label: cat.category,
          }));
        setCategoryOptions(options);
      } else {
        setCategoryOptions([]);
      }
      setLoadingCategory(false);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategoryOptions([]);
      setLoadingCategory(false);
    }
  };

  fetchCategories();
}, [user.manager_id]);


  const bandOptions = [
    { value: 1, label: 'A' },
    { value: 2, label: 'B' },
    { value: 3, label: 'C' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-3xl p-2 rounded-full"
          onClick={onClose}
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          User Details
        </h2>

        {/* User Details */}
        <div className="space-y-4">
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Employee ID:</p>
            <p className="text-gray-800 w-2/3">{user.emp_id}</p>
          </div>

          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Full Name:</p>
            <p className="text-gray-800 w-2/3">
              {user.first_name} {user.last_name}
            </p>
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
            <p className="text-gray-800 w-2/3">
              {user.user_status.charAt(0).toUpperCase() +
                user.user_status.slice(1)}
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Designation:</p>
            <p className="text-gray-800 w-2/3">{user.designation}</p>
          </div>

          {/* Manager */}
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Manager:</p>
            <p className="text-gray-800 w-2/3">
              {loadingManager
                ? 'Loading...'
                : managerName || 'No Manager Assigned'}
              <br />
              <span className="text-sm text-gray-500">
                {managerEmail || ''}
              </span>
            </p>
          </div>

          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Gender:</p>
            <p className="text-gray-800 w-2/3">{user.gender}</p>
          </div>

          {/* Band */}
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Band:</p>
            <p className="text-gray-800 w-2/3">
              {bandOptions.find((b) => b.value === parseInt(user.band))?.label ||
                'No Band'}
            </p>
          </div>

          {/* Category */}
          <div className="flex justify-between">
            <p className="font-medium text-gray-600 w-1/3">Category:</p>
            <p className="text-gray-800 w-2/3">
              {loadingCategory
                ? 'Loading...'
                : categoryOptions.find(
                    (cat) => cat.value === user.category_id
                  )?.label || 'No Category'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default UserDetails;