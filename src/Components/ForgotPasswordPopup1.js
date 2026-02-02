// import React, { useState } from "react";
// import axios from "axios";
// import Swal from "sweetalert2";
// import { MAIN_API_BASE } from "../config/apiBase";

// const ForgotPasswordPopup = ({ email, onClose, onOtpSent }) => {
//   const [loading, setLoading] = useState(false);

//   const handleSendOtp = async () => {
//     setLoading(true);
//     try {
//       const token = sessionStorage.getItem("token");
//       await axios.post(`${MAIN_API_BASE}/otp/request-otp`, { email },
//         { headers: { Authorization: `Bearer ${token}`, }, }
//       );
//       Swal.fire({
//         icon: "success",
//         title: "OTP Sent!",
//         text: "OTP has been sent to your email.",
//         confirmButtonColor: "#3085d6",
//       });

//       onOtpSent();
//     } catch (err) {
//       console.error("Error sending OTP:", err);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to send OTP. Please try again.",
//         confirmButtonColor: "#d33",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
//       <div className="bg-white p-8 rounded-md shadow-lg">
//         <h3 className="text-2xl font-bold mb-4">Forgot Password</h3>
//         <p className="mb-4">
//           Please enter your registered email to receive an OTP for password
//           reset.
//         </p>
//         <input
//           type="text"
//           value={email}
//           disabled
//           className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700"
//         />
//         <div className="flex justify-end mt-4">
//           <button
//             onClick={onClose}
//             disabled={loading}
//             className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSendOtp}
//             disabled={loading}
//             className={`py-2 px-4 rounded text-white ${loading
//                 ? "bg-blue-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700"
//               }`}
//           >
//             {loading ? "Sending..." : "Send OTP"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default ForgotPasswordPopup;


import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { MAIN_API_BASE } from "../config/apiBase";

const ForgotPasswordPopup = ({ email, onClose, onOtpSent }) => {
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`${MAIN_API_BASE}/otp/request-otp`, { email },
        { headers: { Authorization: `Bearer ${token}`, }, }
      );
      Swal.fire({
        icon: "success",
        title: "OTP Sent!",
        text: "OTP has been sent to your email.",
        confirmButtonColor: "#3085d6",
      });

      onOtpSent();
    } catch (err) {
      console.error("Error sending OTP:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to send OTP. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-md shadow-lg">
        <h3 className="text-2xl font-bold mb-4">Forgot Password</h3>
        <p className="mb-4">Please enter your registered email to receive an OTP for password reset. </p>
        <input type="text" value={email} disabled className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700" />
        <div className="flex justify-end mt-4">
          <button onClick={onClose} disabled={loading} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2" > Cancel </button>
          <button onClick={handleSendOtp} disabled={loading} className={`py-2 px-4 rounded text-white ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700" }`} > {loading ? "Sending..." : "Send OTP"} </button>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPopup;