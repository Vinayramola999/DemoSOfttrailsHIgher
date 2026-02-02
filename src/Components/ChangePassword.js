import React, { useState } from 'react';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { AiFillEye, AiFillEyeInvisible, AiOutlineLoading } from 'react-icons/ai';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Button from '../Components/buttons';
import { MAIN_API_BASE } from '../config/apiBase';

const ChangePassword = () => {
  const [password, setPassword] = useState({
    old: '',
    new: '',
    confirm: '',
  });

  const [visible, setVisible] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notificationShown, setNotificationShown] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleBackButtonClick = () => {
    window.history.back();
  };

  const handlePasswordCheck = (text) => {
    const regExpStrong = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    return regExpStrong.test(text);
  };

  const getToken = () => {
    const token = sessionStorage.getItem('token');
    return token;
  };
  const token = getToken();
  console.log('Retrieved token:', token);


  const ChangePassword = async () => {
    if (password.new !== password.confirm) {
      setNotificationMessage("New password and confirmation do not match.");
      setNotificationShown(true);
      return;
    }

    const token = sessionStorage.getItem('token');
    if (!token) {
      console.error('Token is missing');
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      const url = `${MAIN_API_BASE}/users/change-password`;
      const data = {
        oldPassword: password.old,
        newPassword: password.new,
        confirmPassword: password.confirm,
      };

      // Set the token in the headers
      const response = await axios.put(url, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.data.message === 'Password updated successfully for user') {
        setPassword({
          old: '',
          new: '',
          confirm: '',
        });
        setNotificationMessage("Password changed successfully.");
      } else {
        setNotificationMessage(response.data.error); // Adjust according to API response
      }
    } catch (error) {
      setNotificationMessage("An error occurred while changing the password.");
      console.log(error.message);
    } finally {
      setNotificationShown(true);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.old || !password.new || !password.confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.new !== password.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (!handlePasswordCheck(password.new)) {
      setError('Your new password is weak. Please use a stronger password.');
      return;
    }
    setError(null);
    ChangePassword();
  };

  const toggleVisibility = (field) => {
    setVisible((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  return (
    // <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
    //   {loading && (
    //     <div className="flex justify-center items-center p-10 rounded-xl fixed inset-0 bg-[#f2f2f25f]">
    //       <AiOutlineLoading className="animate-spin text-lg" />
    //       Loading...
    //     </div>
    //   )}

    //   <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg">
    //     <div className="flex items-center justify-between mb-4">
    //       <button
    //         className="flex items-center px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700"
    //         onClick={handleBackButtonClick}
    //       >
    //         <IoMdArrowRoundBack className="mr-2" />
    //         Back
    //       </button>
    //     </div>
    //     <h2 className="mb-6 text-2xl font-semibold text-center text-gray-700">Change Password</h2>
    //     <form onSubmit={handleSubmit}>
    //       <div className="mb-4 relative">
    //         <label htmlFor="oldPassword" className="block mb-2 text-sm font-medium text-gray-600">
    //           Current Password
    //         </label>
    //         <input
    //           type={visible.old ? 'text' : 'password'}
    //           id="oldPassword"
    //           className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
    //           value={password.old}
    //           onChange={(e) => setPassword({ ...password, old: e.target.value })}
    //           required
    //         />
    //         <div
    //           className="absolute inset-y-0 right-0 top-7 flex items-center px-2 cursor-pointer"
    //           onClick={() => toggleVisibility('old')}
    //         >
    //           {visible.old ? <AiFillEyeInvisible /> : <AiFillEye />}
    //         </div>
    //       </div>
    //       <div className="mb-4 relative">
    //         <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-600">
    //           New Password
    //         </label>
    //         <input
    //           type={visible.new ? 'text' : 'password'}
    //           id="newPassword"
    //           className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
    //           value={password.new}
    //           onChange={(e) => setPassword({ ...password, new: e.target.value })}
    //           required
    //         />
    //         <div
    //           className="absolute inset-y-0 right-0 top-7 flex items-center px-2 cursor-pointer"
    //           onClick={() => toggleVisibility('new')}
    //         >
    //           {visible.new ? <AiFillEyeInvisible /> : <AiFillEye />}
    //         </div>
    //       </div>
    //       <div className="mb-4 relative">
    //         <label htmlFor="confirmNewPassword" className="block mb-2 text-sm font-medium text-gray-600">
    //           Confirm New Password
    //         </label>
    //         <input
    //           type={visible.confirm ? 'text' : 'password'}
    //           id="confirmNewPassword"
    //           className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
    //           value={password.confirm}
    //           onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
    //           required
    //         />
    //         <div
    //           className="absolute inset-y-0 right-0 top-7 flex items-center px-2 cursor-pointer"
    //           onClick={() => toggleVisibility('confirm')}
    //         >
    //           {visible.confirm ? <AiFillEyeInvisible /> : <AiFillEye />}
    //         </div>
    //       </div>
    //       {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
    //       <div className="flex items-center justify-center">
    //         <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
    //           Change Password
    //         </Button>
    //       </div>
    //       {notificationShown && (
    //         <div className="mt-4 text-center text-green-600">
    //           {notificationMessage}
    //         </div>
    //       )}
    //     </form>
    //   </div>
    // </div>
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      {loading && (
        <div className="flex justify-center items-center p-10 rounded-xl fixed inset-0 bg-[#f2f2f25f]">
          <AiOutlineLoading className="animate-spin text-lg" />
          Loading...
        </div>
      )}

      <div className="w-full mt-[10%] max-w-md p-8 bg-white shadow-lg rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <button
            className="flex items-center px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-700"
            onClick={handleBackButtonClick}
          >
            <IoMdArrowRoundBack className="mr-2" />
            Back
          </button>
        </div>
        <h2 className="mb-6 text-2xl font-semibold text-center text-gray-700">Change Password</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 relative">
            <label htmlFor="oldPassword" className="block mb-2 text-sm font-medium text-gray-600">
              Current Password
            </label>
            <input
              type={visible.old ? 'text' : 'password'}
              id="oldPassword"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={password.old}
              onChange={(e) => setPassword({ ...password, old: e.target.value })}
              required
            />
            <div
              className="absolute inset-y-0 right-0 top-7 flex items-center px-2 cursor-pointer"
              onClick={() => toggleVisibility('old')}
            >
              {visible.old ? <AiFillEyeInvisible /> : <AiFillEye />}
            </div>
          </div>
          <div className="mb-4 relative">
            <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-600">
              New Password
            </label>
            <input
              type={visible.new ? 'text' : 'password'}
              id="newPassword"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={password.new}
              onChange={(e) => setPassword({ ...password, new: e.target.value })}
              required
            />
            <div
              className="absolute inset-y-0 right-0 top-7 flex items-center px-2 cursor-pointer"
              onClick={() => toggleVisibility('new')}
            >
              {visible.new ? <AiFillEyeInvisible /> : <AiFillEye />}
            </div>
          </div>
          <div className="mb-4 relative">
            <label htmlFor="confirmNewPassword" className="block mb-2 text-sm font-medium text-gray-600">
              Confirm New Password
            </label>
            <input
              type={visible.confirm ? 'text' : 'password'}
              id="confirmNewPassword"
              className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              value={password.confirm}
              onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
              required
            />
            <div
              className="absolute inset-y-0 right-0 top-7 flex items-center px-2 cursor-pointer"
              onClick={() => toggleVisibility('confirm')}
            >
              {visible.confirm ? <AiFillEyeInvisible /> : <AiFillEye />}
            </div>
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <div className="flex items-center justify-center">
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">
              Change Password
            </Button>
          </div>
          {notificationShown && (
            <div className="mt-4 text-center text-green-600">
              {notificationMessage}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
export default ChangePassword;