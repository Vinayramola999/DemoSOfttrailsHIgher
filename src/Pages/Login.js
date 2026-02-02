////LOGIN WITHOUT CAPTCHA
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import logo from '../assests/SoftTrails.png'
import { FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import login from '../assests/login.jpg';
import PasswordResetPopup from '../Components/PasswordResetPopup';
import OtpVerificationPopup from '../Components/OtpVerificationPopup';
import ForgotPasswordPopup from '../Components/ForgotPasswordPopup1';
import { MAIN_API_BASE } from '../config/apiBase';

const Login = () => { 
  const [email, setEmail] = useState('');
  const [isPasswordResetFlow, setIsPasswordResetFlow] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordResetPopup, setShowPasswordResetPopup] = useState(false);
  const [showOtpVerificationPopup, setShowOtpVerificationPopup] = useState(false);
  const [showOtpVerificationPopup1, setShowOtpVerificationPopup1] = useState(false);
  const [showForgotPasswordPopup, setForgotPasswordPopup] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isEmailAutoPrefilled, setIsEmailAutoPrefilled] = useState(false);
  const navigate = useNavigate();

  // Check if email was verified after password reset
  useEffect(() => {
    const verifiedEmail = sessionStorage.getItem('emailVerified');
    if (verifiedEmail) {
      setEmail(verifiedEmail);
      // Email is auto-prefilled after password reset; require re-verification
      setIsEmailAutoPrefilled(true);
      setIsPasswordResetFlow(true);
      sessionStorage.removeItem('emailVerified');
    }
  }, []);

  const handleEmailVerify = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // const response = await axios.post(`${MAIN_API_BASE}/users/mail-verify`, { email });
      const response = await axios.post(`${MAIN_API_BASE}/users/mail-verify`, { email: email.toLowerCase() });

      if (response.status === 403) {
        setShowPasswordResetPopup(true);
      } else if (response.data.message === "User found. You can proceed to login.") {
        setIsEmailVerified(true);
        // clear auto-prefill flag once user re-verifies
        setIsEmailAutoPrefilled(false);
        setSuccess('Email verified! Please enter your password.');
        setError('');
      } else {
        setError('Unexpected response.');
      }
    } catch (err) {
      if (err.response && err.response.status === 403) {
        setShowPasswordResetPopup(true);
      } else {
        setError('Error verifying email. Please try again.');
      }
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // const response = await axios.post(`${MAIN_API_BASE}/users/login`, { email, password, });
      const response = await axios.post(`${MAIN_API_BASE}/users/login`, {
        email: email.toLowerCase(),
        password,
      });

      const { token, userId } = response.data;
      if (token && userId) {
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('userId', userId);
        sessionStorage.setItem('userId', userId);
        setSuccess('Login successful!');
        setError('');
        setTimeout(() => navigate('/Cards'), 1000);
      } else {
        throw new Error('Token or User ID not received');
      }
    } catch (err) {
      setError('Invalid email or password.');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleOtpSent = () => {
    setForgotPasswordPopup(false);
    setShowOtpVerificationPopup1(true);
  };

  const handleOtpSent1 = () => {
    setForgotPasswordPopup(false);
    setShowOtpVerificationPopup1(true);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-white">
      {/***************  Left Section   **********/}
      <div className="hidden md:flex w-1/2 justify-center items-center bg-gray-50">
        <img src={login} alt="Login Illustration" className="object-cover h-full w-full" />
      </div>
      {/***************  Right Section   ******************/}
      <div className="relative w-full md:w-1/2 bg-white flex flex-col min-h-screen p-6">
        {/* Top Right Logo */}
        <div className="absolute top-4 right-4">
          <img src={logo} alt="Higher India Logo" className="h-6 md:h-6" />
        </div>

        {/* Content Wrapper with flex-grow */}
        <div className="flex-grow w-full flex flex-col items-center">
          <div className="p-8 rounded-lg w-full max-w-md mt-6 md:mt-12">
            {/* Title */}
            <div className="text-center mb-6">
              <h3 className="text-lg md:text-xl font-semibold mt-2">
                {isPasswordResetFlow ? (isEmailVerified ? 'Enter Your Password' : 'Verify Your Email') : 'Login with your account'}
              </h3>
              <p className="text-gray-600 text-sm">
                {isPasswordResetFlow ? (isEmailVerified ? 'Your password has been reset. Enter your new password to login.' : 'Email is auto-filled. Please verify your email to enter password.') : 'Provide your registered email'}
              </p>
            </div>
            {/* Form */}
            <form onSubmit={isEmailVerified ? handleLogin : handleEmailVerify}>
              {/* Email */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-black" />
                  </span>
                  {/* <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full py-3 pl-10 border text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    placeholder="Enter Email"
                  /> */}
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isEmailVerified || isEmailAutoPrefilled}  // <-- Non-editable when auto-prefilled or after verification
                    className={`w-full py-3 pl-10 border text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${(isEmailVerified || isEmailAutoPrefilled) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    placeholder="Enter Email"
                  />

                </div>
              </div>
              {/* Password Section */}
              {isEmailVerified && (
                <>
                  <div className="mb-2 relative">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                      Password
                    </label>
                    <span className="absolute inset-y-0 left-0 pl-3 mt-7 flex items-center pointer-events-none">
                      <FaKey className="text-black" />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      placeholder="Enter Password"
                    />
                    <span
                      className="absolute inset-y-0 right-0 pr-3 mt-8 flex items-center cursor-pointer"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? <FaEye /> : <FaEyeSlash />}
                    </span>
                  </div>
                  {!isPasswordResetFlow && (
                    <p className="text-sm text-blue-600 mb-3">
                      <button type="button" onClick={() => setForgotPasswordPopup(true)}>
                        Forgot Password?
                      </button>
                    </p>
                  )}
                </>
              )}
              {/* Button */}
              <button
                type="submit"
                className="w-full py-3 bg-custome-blue text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {isEmailVerified ? 'Login' : 'Verify Email'}
              </button>
              {/* Errors */}
              {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
              {success && <div className="mt-4 text-green-500 text-sm">{success}</div>}
            </form>
            {/* Popups */}
            {showForgotPasswordPopup && (
              <ForgotPasswordPopup
                email={email}
                onOtpSent={handleOtpSent1}
                onClose={() => setForgotPasswordPopup(false)}
              />
            )}
            {showPasswordResetPopup && (
              <PasswordResetPopup
                email={email}
                onOtpSent={handleOtpSent}
                onClose={() => setShowPasswordResetPopup(false)}
              />
            )}
            {showOtpVerificationPopup && (
              <OtpVerificationPopup
                email={email}
                onClose={() => setShowOtpVerificationPopup(false)}
              />
            )}
            {showOtpVerificationPopup1 && (
              <OtpVerificationPopup
                email={email}
                onClose={() => setShowOtpVerificationPopup1(false)}
              />
            )}
          </div>
        </div>
        {/* Footer stuck to bottom */}
        <div className="text-center text-xs text-gray-500 mb-4">
          SoftTrail is a product of HigherIndia Pvt. Ltd. <br />
          An ISO 9001:2015 | ISO 27001:2022 | CMMI Level 5 Company
        </div>
      </div>
    </div>
  );
}
export default Login;


// LOGIN WITH CAPTCHA
// import React, { useState } from 'react';
// import axios from 'axios';
// import { FaEnvelope, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';
// import { useNavigate } from 'react-router-dom';
// import login from '../assests/login.jpg';
// import ReCAPTCHA from 'react-google-recaptcha';
// import logo from '../assests/Logo.png'
// import PasswordResetPopup from '../Components/PasswordResetPopup';
// import OtpVerificationPopup from '../Components/OtpVerificationPopup';
// import ForgotPasswordPopup from '../Components/ForgotPasswordPopup1';

// const Login = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [isEmailVerified, setIsEmailVerified] = useState(false);
//   const [recaptchaToken, setRecaptchaToken] = useState(null); // State for reCAPTCHA
//   const navigate = useNavigate();
//   const [showOtpVerificationPopup1, setShowOtpVerificationPopup1] = useState(false);
//   const [showForgotPasswordPopup, setForgotPasswordPopup] = useState(false);
//   const [showPasswordResetPopup, setShowPasswordResetPopup] = useState(false);
//   const [showOtpVerificationPopup, setShowOtpVerificationPopup] = useState(false);

//   const handleEmailVerify = async (e) => {
//     e.preventDefault();
//     if (loading) return;
//     setLoading(true);
//     try {
//       // const response = await axios.post(`${MAIN_API_BASE}/users/mail-verify`, { email });
//       const response = await axios.post(`${MAIN_API_BASE}/users/mail-verify`, { email: email.toLowerCase() });

//       if (response.status === 403) {
//         setShowPasswordResetPopup(true);
//       } else if (response.data.message === "User found. You can proceed to login.") {
//         setIsEmailVerified(true);
//         setSuccess('Email verified! Please enter your password.');
//         setError('');
//       } else {
//         setError('Unexpected response.');
//       }
//     } catch (err) {
//       if (err.response && err.response.status === 403) {
//         setShowPasswordResetPopup(true);
//       } else {
//         setError('Error verifying email. Please try again.');
//       }
//       setSuccess('');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (loading) return;
//     setLoading(true);
//     if (!recaptchaToken) {
//       alert('Please verify the reCAPTCHA before submitting.');
//       setLoading(false);
//       return;
//     }
//     try {
//       // const response = await axios.post(`${MAIN_API_BASE}/users/login`, { email, password, recaptchaToken });

//       const response = await axios.post(`${MAIN_API_BASE}/users/login`, {
//         email: email.toLowerCase(),
//         password,
//         recaptchaToken,
//       });
//       const { token, userId } = response.data;
//       if (token && userId) {
//         sessionStorage.setItem('token', token);
//         sessionStorage.setItem('userId', userId);
//         setSuccess('Login successful!');
//         setError('');
//         setTimeout(() => navigate('/Cards'), 1000);
//       } else {
//         throw new Error('Token or User ID not received');
//       }
//     } catch (err) {
//       setError('Invalid email or password.');
//       setSuccess('');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const togglePasswordVisibility = () => setShowPassword(!showPassword);

//   const handleOtpSent = () => {
//     setShowPasswordResetPopup(false);
//     setShowOtpVerificationPopup(true);
//   };

//   const handleOtpSent1 = () => {
//     setForgotPasswordPopup(false);
//     setShowOtpVerificationPopup1(true);
//   };

//   // Handle the reCAPTCHA token
//   const handleRecaptchaChange = (token) => {
//     setRecaptchaToken(token);
//   };

//   return (
//     <div className="h-screen flex flex-col md:flex-row bg-white">
//       {/*********  Left Section **********/}
//       <div className="hidden md:flex w-1/2 justify-center items-center bg-gray-50">
//         <img src={login} alt="Login Illustration" className="object-cover h-full w-full" />
//       </div>
//       <div className="w-full md:w-1/2 bg-white flex flex-col justify-start items-center min-h-screen p-6">
//         <div className="p-8 rounded-lg w-full max-w-md mt-6 md:mt-12">
//           {/***************  Welcome and Logo ****************/}
//           <div className="absolute top-4 right-4">
//             <img src={logo} alt="Higher India Logo" className="h-10 md:h-12" />
//           </div>
//           {/******************* User Msg******************** */}
//           <div className="text-center mb-6">
//             <h3 className="text-lg md:text-xl font-semibold mt-2">
//               Login with your account
//             </h3>
//             <p className="text-gray-600 text-sm">Provide your registered email</p>
//           </div>
//           <form onSubmit={isEmailVerified ? handleLogin : handleEmailVerify}>
//             <div className="mb-4">
//               <label className="block text-black-700 text-[14px] font-bold ml-2 ">Email</label>
//               <div className="relative">
//                 <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <FaEnvelope className="text-black" />
//                 </span>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                   disabled={isEmailVerified}  // <-- Make it non-editable after verification
//                   className={`w-full py-3 pl-10 border text-[14px] font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${isEmailVerified ? 'bg-gray-100 cursor-not-allowed' : ''}`}
//                   placeholder="Enter Email"
//                 />
//               </div>
//             </div>

//             {isEmailVerified && (
//               <div className="mb-2 relative">
//                 <label htmlFor="password" className="block text-black-700 text-[14px] font-bold ml-2 "> Password </label>
//                 <span className="absolute inset-y-0 left-0 pl-3 mt-1 flex items-center pointer-events-none">
//                   <FaKey className="text-black" />
//                 </span>
//                 <input
//                   type={showPassword ? 'text' : 'password'}
//                   id="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full py-3 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
//                   placeholder="Enter Password"
//                 />
//                 <span
//                   className="absolute inset-y-0 right-0 pr-3 mt-1 flex items-center cursor-pointer"
//                   onClick={togglePasswordVisibility}
//                 >
//                   {showPassword ? <FaEye /> : <FaEyeSlash />}
//                 </span>

//                 <p className="text-sm text-blue-600 mb-3">
//                   <button
//                     type="button"
//                     onClick={() => setForgotPasswordPopup(true)}
//                   >
//                     Forgot Password?
//                   </button>
//                 </p>
//               </div>

//             )}

//             {isEmailVerified && (
//               <div className="mb-4">
//                 <ReCAPTCHA
//                   sitekey="6LdJ6HcqAAAAAC9jfeOKaxVpLLQCoveF5iGkHYH9"
//                   onChange={handleRecaptchaChange}
//                   action="LOGIN"
//                 />
//               </div>
//             )}

//             <button
//               type="submit"
//               className="w-full py-3 bg-custome-blue text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
//               enabled={isEmailVerified} // Disable until captcha is verified
//             >
//               {isEmailVerified ? 'Login' : 'Verify Email'}
//             </button>

//             {error && (
//               <div className="mt-4 text-red-500 text-sm">{error}</div>
//             )}
//             {success && (
//               <div className="mt-4 text-green-500 text-sm">{success}</div>
//             )}
//           </form>

//           {showPasswordResetPopup && (
//             <PasswordResetPopup
//               email={email}
//               onOtpSent={handleOtpSent}
//               onClose={() => setShowPasswordResetPopup(false)}
//             />
//           )}

//           {showOtpVerificationPopup && (
//             <OtpVerificationPopup
//               email={email}
//               onClose={() => setShowOtpVerificationPopup(false)}
//             />
//           )}

//           {showForgotPasswordPopup && (
//             <ForgotPasswordPopup
//               email={email}
//               onOtpSent={handleOtpSent1}
//               onClose={() => setForgotPasswordPopup(false)}
//             />
//           )}

//           {showOtpVerificationPopup1 && (
//             <OtpVerificationPopup
//               email={email}
//               onClose={() => setShowOtpVerificationPopup1(false)}
//             />
//           )}
//         </div>
//       </div >
//     </div >
//   );
// };
// export default Login;