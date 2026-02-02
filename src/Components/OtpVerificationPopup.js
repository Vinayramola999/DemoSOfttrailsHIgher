// import React, { useEffect, useState } from 'react';
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import Swal from "sweetalert2";
// import { MAIN_API_BASE } from '../config/apiBase';
// import axios from 'axios';

// const OtpVerificationPopup = ({ email, onClose }) => {
//   const [otp, setOtp] = useState('');
//   const [otpVerified, setOtpVerified] = useState(false);
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [error, setError] = useState('');
//   const [errors, setErrors] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [timer, setTimer] = useState(60);
//   const [canResend, setCanResend] = useState(false);

//   useEffect(() => {
//     if (timer > 0) {
//       const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
//       return () => clearInterval(countdown);
//     } else {
//       setCanResend(true);
//     }
//   }, [timer]);

//   const handleVerifyOtp = async () => {
//     try {
//       const token = sessionStorage.getItem('token');
//       const response = await axios.post(`${MAIN_API_BASE}/otp/verify-otp`,
//         { email, otp },
//         {
//           headers: { 'Authorization': `Bearer ${token}` }
//         }
//       );
//       if (response.data.message === "OTP verified. You can now reset your password.") {
//         setOtpVerified(true);
//         setError('');
//       }
//     } catch (err) {
//       console.error('Error verifying OTP:', err);
//       setError('Failed to verify OTP.');
//     }
//   };

//   const handleResendOtp = async () => {
//     try {
//       const token = sessionStorage.getItem('token');
//       await axios.post(`${MAIN_API_BASE}/otp/request-otp`,
//         { email },
//         {
//           headers: { 'Authorization': `Bearer ${token}` }
//         }
//       );
//       setTimer(30);
//       setCanResend(false);
//       setError('');
//     } catch (err) {
//       console.error('Error resending OTP:', err);
//       setError('Failed to resend OTP.');
//     }
//   };

//   // const handleResetPassword = async () => {
//   //   if (password !== confirmPassword) {
//   //     setError('Passwords do not match.');
//   //     return;
//   //   }
//   //   try {
//   //     const token = sessionStorage.getItem('token');
//   //     await axios.post(`${MAIN_API_BASE}/otp/reset-password`,
//   //       { email, password, confirmPassword },
//   //       {
//   //         headers: { 'Authorization': `Bearer ${token}` }
//   //       }
//   //     );
//   //     alert('Password reset successfully. You can now log in.');
//   //     onClose();
//   //     window.location.href = '/';
//   //   } catch (err) {
//   //     console.error('Error resetting password:', err);
//   //     setError('Failed to reset password.');
//   //   }
//   // };

//   const handleResetPassword = async () => {
//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       Swal.fire({
//         icon: "warning",
//         title: "Mismatch",
//         text: "Passwords do not match!",
//         confirmButtonColor: "#3085d6",
//       });
//       return;
//     }

//     try {
//       const token = sessionStorage.getItem("token");
//       await axios.post(
//         `${MAIN_API_BASE}/otp/reset-password`,
//         { email, password, confirmPassword },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       Swal.fire({
//         icon: "success",
//         title: "Password Reset!",
//         text: "Password reset successfully. You can now log in.",
//         confirmButtonColor: "#3085d6",
//       }).then(() => {
//         onClose();
//         window.location.href = "/";
//       });
//     } catch (err) {
//       console.error("Error resetting password:", err);
//       setError("Failed to reset password.");
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to reset password. Please try again.",
//         confirmButtonColor: "#d33",
//       });
//     }
//   };

//   const validatePassword = (pwd) => /^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(pwd);

//   const handlePasswordChange = (e) => {
//     const value = e.target.value;
//     setPassword(value);
//     if (!validatePassword(value)) {
//       setErrors("Password must be at least 8 characters long, contain an uppercase letter and a number.");
//     } else {
//       setErrors('');
//     }
//   };

//   const toggleShowPassword = () => setShowPassword(prev => !prev);

//   return (
//     <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
//       <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-md">
//         {otpVerified ? (
//           <>
//             <h3 className="text-2xl font-bold mb-4">Reset Your Password</h3>
//             <div className="relative mb-4">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={password}
//                 onChange={handlePasswordChange}
//                 className="w-full p-2 border rounded-lg"
//                 placeholder="Enter new password"
//               />
//               <span
//                 onClick={toggleShowPassword}
//                 className="absolute right-3 top-3 cursor-pointer text-gray-500"
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
//               {errors && <p className="text-red-500 text-sm mt-2">{errors}</p>}
//             </div>
//             <div className="relative mb-4">
//               <input
//                 type={showPassword ? 'text' : 'password'}
//                 value={confirmPassword}
//                 onChange={(e) => setConfirmPassword(e.target.value)}
//                 className="w-full p-2 border rounded-lg"
//                 placeholder="Confirm new password"
//               />
//               <span
//                 onClick={toggleShowPassword}
//                 className="absolute right-3 top-3 cursor-pointer text-gray-500"
//               >
//                 {showPassword ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>
//             {confirmPassword && password !== confirmPassword && (
//               <p className="text-red-500 text-sm">Passwords do not match.</p>
//             )}
//             <div className="flex justify-end">
//               <button
//                 onClick={onClose}
//                 className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleResetPassword}
//                 disabled={!password || !confirmPassword || password !== confirmPassword || errors}
//                 className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
//               >
//                 Reset Password
//               </button>
//             </div>
//           </>
//         ) : (
//           <>
//             <h3 className="text-2xl font-bold mb-4">Enter OTP</h3>
//             <p className="mb-4">An OTP has been sent to your email.</p>
//             <input
//               type="text"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               className="w-full p-2 border rounded-lg mb-2"
//               placeholder="Enter OTP"
//             />
//             {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

//             <div className="flex items-center justify-between mb-4">
//               <button
//                 onClick={handleResendOtp}
//                 disabled={!canResend}
//                 className={`py-2 px-4 rounded ${canResend ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400'} text-white`}
//               >
//                 {canResend ? 'Resend OTP' : `Resend in ${timer}s`}
//               </button>
//             </div>

//             <div className="flex justify-end">
//               <button
//                 onClick={onClose}
//                 className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleVerifyOtp}
//                 className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
//               >
//                 Verify OTP
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };
// export default OtpVerificationPopup;


import React, { useEffect, useState, useRef } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import { MAIN_API_BASE } from '../config/apiBase';
import axios from 'axios';

const OtpVerificationPopup = ({ email, onClose }) => {
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpVerified, setOtpVerified] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errors, setErrors] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(countdown);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 4) {
      setError('Please enter all 4 digits.');
      return;
    }
    try {
      setIsVerifying(true);
      const token = sessionStorage.getItem('token');
      const response = await axios.post(`${MAIN_API_BASE}/otp/verify-otp`, { email, otp: otpString },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (response.data.message === "OTP verified. You can now reset your password.") {
        setOtpVerified(true);
        setError('');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (!/^\d*$/.test(value)) return;
    
    // Only allow single digit
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input if a digit is entered
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
    
    setError('');
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.post(`${MAIN_API_BASE}/otp/request-otp`, { email },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      setTimer(30);
      setCanResend(false);
      setError('');
    } catch (err) {
      console.error('Error resending OTP:', err);
      setError('Failed to resend OTP.');
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      Swal.fire({
        icon: "warning",
        title: "Mismatch",
        text: "Passwords do not match!",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${MAIN_API_BASE}/otp/reset-password`, { email, password, confirmPassword },
        { headers: { Authorization: `Bearer ${token}` }, }
      );
      Swal.fire({
        icon: "success",
        title: "Password Reset!",
        text: "Password reset successfully. You can now log in.",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        // Store email as verified and close popup (no page reload)
        sessionStorage.setItem('emailVerified', email);
        onClose();
      });
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Failed to reset password.");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to reset password. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  const validatePassword = (pwd) => /^(?=.*[A-Z])(?=.*[0-9])(?=.{8,15})/.test(pwd);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (!validatePassword(value)) {
      setErrors("Password must be at least 8 characters long, contain an uppercase letter and a number.");
    } else {
      setErrors('');
    }
  };

  const toggleShowPassword = () => setShowPassword(prev => !prev);

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md">
        {otpVerified ? (
          <>
            <h3 className="text-3xl font-bold mb-2 text-gray-800">Reset Password</h3>
            <p className="text-gray-600 mb-6 text-sm">Create a new secure password</p>
            
            <div className="relative mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={handlePasswordChange} maxLength="15" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition" placeholder="Enter new password (8-15 chars)" />
              <span onClick={toggleShowPassword} className="absolute right-3 top-10 cursor-pointer text-gray-500 hover:text-gray-700" > {showPassword ? <FaEyeSlash /> : <FaEye />} </span>
              {errors && <p className="text-red-500 text-xs mt-2">{errors}</p>}
            </div>
            
            <div className="relative mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} maxLength="15" className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none transition" placeholder="Confirm new password" />
              <span onClick={toggleShowPassword} className="absolute right-3 top-10 cursor-pointer text-gray-500 hover:text-gray-700" > {showPassword ? <FaEyeSlash /> : <FaEye />} </span>
            </div>
            {confirmPassword && password !== confirmPassword && (<p className="text-red-500 text-sm mb-4">Passwords do not match.</p>)}
            
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg font-medium transition" > Cancel </button>
              <button onClick={handleResetPassword} disabled={!password || !confirmPassword || password !== confirmPassword || errors} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-6 rounded-lg font-medium transition" > Reset Password </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-gray-800">Verify OTP</h3>
              <p className="text-gray-600 text-sm mt-2">Enter the 4-digit code sent to</p>
              <p className="text-blue-600 font-medium text-sm">{email}</p>
            </div>
            
            {/* 4-Box OTP Input */}
            <div className="flex gap-3 justify-center mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={otpRefs[index]}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                  placeholder="–"
                />
              ))}
            </div>
            
            {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 p-2 rounded-lg">{error}</p>}

            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-600 text-sm">Didn't receive OTP?</span>
              <button onClick={handleResendOtp} disabled={!canResend} className={`py-2 px-4 rounded-lg font-medium transition ${canResend ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`} > {canResend ? 'Resend OTP' : `Resend in ${timer}s`} </button>
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded-lg font-medium transition" > Cancel </button>
              <button onClick={handleVerifyOtp} disabled={isVerifying} className={`${isVerifying ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-6 rounded-lg font-medium flex items-center gap-2 transition`} >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OtpVerificationPopup;