import React, { useState } from "react";
import axios from "axios";
import { MAIN_API_BASE } from "../config/apiBase";
import { useNavigate } from "react-router-dom";

const VerMsg = ({ open, onClose }) => {
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [smsVerificationCode, setSmsVerificationCode] = useState("");
  const navigate = useNavigate();

  const handleEmailOtpChange = (e) => {
    setEmailVerificationCode(e.target.value);
  };

  const handleSmsOtpChange = (e) => {
    setSmsVerificationCode(e.target.value);
  };
  

  const handleOtpSubmit = async () => {
    try {
      const res = await axios.post(`${MAIN_API_BASE}/verify`, {
        emailVerificationCode: emailVerificationCode,
        smsVerificationCode: smsVerificationCode,
      });
      const responseMessage = res.data.message.trim();

      if (responseMessage === "Verification successful. You can now log in.") {
        alert("OTP Verified Successfully!");
        navigate("/Login");
        onClose();
      } else {
        alert("Invalid OTP. Please try again.");
      }
    } catch (error) {
      console.log("Error during OTP verification:", error);
      alert("An error occurred while verifying the OTP.");
    }
  };

  return open ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-bold mb-4">Verification</h2>

        <p className="mb-4">Enter the OTP sent to your email:</p>
        <input
          type="text"
          value={emailVerificationCode}
          onChange={handleEmailOtpChange}
          placeholder="Enter Email OTP"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-300 block w-full p-2.5 shadow-md focus:outline-none focus:bg-white focus:border-gray-300 mb-4"
        />

        <p className="mb-4">Enter the OTP sent to your phone:</p>
        <input
          type="text"
          value={smsVerificationCode}
          onChange={handleSmsOtpChange}
          placeholder="Enter SMS OTP"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-300 block w-full p-2.5 shadow-md focus:outline-none focus:bg-white focus:border-gray-300 mb-4"
        />

        <button
          onClick={handleOtpSubmit}
          className="w-full bg-blue-500 text-white p-2 rounded-lg"
        >
          Verify OTP
        </button>
        <button onClick={onClose} className="w-full text-red-500 mt-2">
          Cancel
        </button>
      </div>
    </div>
  ) : null;
};

export default VerMsg;
