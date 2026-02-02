// import React from 'react';
// import axios from 'axios';
// import {MAIN_API_BASE} from '../config/apiBase';

// const PasswordResetPopup = ({ email, onClose, onOtpSent }) => {

//   const handleSendOtp = async () => {
//     try {
//       const token = sessionStorage.getItem('token');
//       await axios.post(`${MAIN_API_BASE}/otp/request-otp`,
//         { email },
//         { headers: { 'Authorization': `Bearer ${token}`, } }
//       );
//       onOtpSent();
//     } catch (err) {
//       console.error('Error sending OTP:', err);
//       alert('Failed to send OTP.');
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
//       <div className="bg-white p-8 rounded-md shadow-lg">
//         <h3 className="text-2xl font-bold mb-4">Password Reset Required</h3>
//         <p className="mb-4">You are logging in for the first time.<br /> We have sent a one-time password (OTP) to your registered email address.</p>
//         <input type="text" value={email} disabled className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700" />
//         <div className="flex justify-end mt-4">
//           <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"> Cancel</button>
//           <button onClick={handleSendOtp} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Send OTP</button>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default PasswordResetPopup;




import React, { useState } from 'react';
import axios from 'axios';
import {MAIN_API_BASE} from '../config/apiBase';

const PasswordResetPopup = ({ email, onClose, onOtpSent }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    try {
      setIsLoading(true);
      const token = sessionStorage.getItem('token');
      await axios.post(`${MAIN_API_BASE}/otp/request-otp`,
        { email },
        { headers: { 'Authorization': `Bearer ${token}`, } }
      );
      onClose();
      onOtpSent();
    } catch (err) {
      console.error('Error sending OTP:', err);
      alert('Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-md shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Password Reset Required</h3>
        <p className="mb-4">You are logging in for the first time.<br /> We have sent a one-time password (OTP) to your registered email address.</p>
        <input type="text" value={email} disabled className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700" />
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2" disabled={isLoading}> Cancel</button>
          <button onClick={handleSendOtp} disabled={isLoading} className={`text-white py-2 px-4 rounded flex items-center gap-2 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </>
            ) : (
              'Send OTP'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default PasswordResetPopup;