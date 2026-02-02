import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from 'axios';
import Swal from "sweetalert2";
import { MAIN_API_BASE } from '../config/apiBase';

const OtpVerificationPopup = ({ email, onClose }) => {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState("");

  const handleVerifyOtp = async () => {
    try {
      const token = sessionStorage.getItem('token'); // Or wherever you store the token

      const response = await axios.post(`${MAIN_API_BASE}/otp/verify-otp`,
        { email, otp },
        {
          headers: {
            'Authorization': `Bearer ${token}`, // Add token to the headers
          }
        }
      );
      if (response.data.message === "OTP verified. You can now reset your password.") {
        setOtpVerified(true);
        setError('');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Failed to verify OTP.');
    }
  };

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/; // At least 8 characters, 1 uppercase, and 1 number
    return regex.test(pwd);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    if (!validatePassword(pwd)) {
      setErrors("Password must be at least 8 characters long, contain an uppercase letter and a number.");
    } else {
      setErrors("");
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  // const handleResetPassword = async () => {
  //   if (password !== confirmPassword) {
  //     setError('Passwords do not match.');
  //     return;
  //   }
  //   try {
  //     const token = sessionStorage.getItem('token'); 
  //     await axios.post(`${MAIN_API_BASE}/otp/reset-password`,
  //       { email, password, confirmPassword },
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`, 
  //         }
  //       }
  //     );
  //     alert('Password reset successfully. You can now log in.');
  //     onClose();
  //     window.location.href = '/';
  //   } catch (err) {
  //     console.error('Error resetting password:', err);
  //     setError('Failed to reset password.');
  //   }
  // };


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
      await axios.post(`${MAIN_API_BASE}/otp/reset-password`,
        { email, password, confirmPassword },
        {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Password Reset!",
        text: "Password reset successfully. You can now log in.",
        confirmButtonColor: "#3085d6",
      }).then(() => {
        onClose();
        window.location.href = "/";
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

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-md shadow-lg">
        {otpVerified ? (
          <>
            <h3 className="text-2xl font-bold mb-4">Reset Your Password</h3>
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded-lg"
                placeholder="Enter new password"
              />
              <div
                onClick={toggleShowPassword}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {errors && <p className="text-red-500 text-sm mt-2">{errors}</p>}
            <div className="relative w-full mt-4">
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Confirm new password"
              />
              <div
                onClick={toggleShowPassword}
                className="absolute right-3 top-3 cursor-pointer text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-2">Passwords do not match.</p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={!password || !confirmPassword || password !== confirmPassword || errors}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Reset Password
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-4">Enter OTP</h3>
            <p className="mb-4"> OTP has been sent to your email.</p>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full p-2 border rounded-lg"
              placeholder="Enter OTP"
            />
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
            <div className="flex justify-end mt-4">
              <button onClick={onClose} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2">
                Cancel
              </button>
              <button onClick={handleVerifyOtp} className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                Verify OTP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
export default OtpVerificationPopup;