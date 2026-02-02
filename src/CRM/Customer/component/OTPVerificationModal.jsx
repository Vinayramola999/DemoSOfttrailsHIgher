// ./CRM/Customer/components/OTPVerificationModal.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button"; // if you're using shadcn, else use <button>
import axios from "axios";
import Swal from "sweetalert2";

const OTPVerificationModal = ({ isOpen, onClose, customerId, field, onVerified }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!otp) {
      Swal.fire("Error", "Please enter the OTP", "error");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post("http://your-api/verify-otp", {
        customerId,
        field, // "email" or "phone"
        otp,
      });
      if (res.data.success) {
        Swal.fire("Success", `${field} verified successfully`, "success");
        onVerified(); // refresh customer data
        onClose();
      } else {
        Swal.fire("Error", res.data.message || "Invalid OTP", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[350px]">
        <h2 className="text-lg font-semibold mb-4">Verify {field}</h2>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="border w-full p-2 rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;
