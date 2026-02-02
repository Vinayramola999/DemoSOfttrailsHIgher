import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import login from '../assests/login.jpg'; 
import { MAIN_API_BASE } from '../config/apiBase';

const EmailVerificationForm = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  const [verificationCode, setVerificationCode] = useState(['', '', '', '']);

  const handleInputChange = (index, value) => {
    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    if (value && index < 3) {
      document.getElementById(`input-${index + 1}`).focus();
    }
  };

  const handleResendCode = () => {
    console.log('Resending code...');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = verificationCode.join('');
    console.log('Verification Code:', code);

    try {
      const response = await fetch(`${MAIN_API_BASE}/otp/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }), // Send the verification code
      });

      if (!response.ok) {
        throw new Error('Verification failed');
      }

      const data = await response.json();
      // Check the response data for success
      if (data.success) {
        // Navigate to the password page
        navigate('/set-password'); // Update this path as needed
      } else {
        alert('Invalid verification code. Please try again.'); // Handle error message
      }
    } catch (error) {
      console.error('Error during verification:', error);
      alert('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="h-screen flex">
      <div className="w-1/2 flex justify-center items-center">
        <img src={login} alt="Login Illustration" className="object-cover h-[100%]" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col items-center ml-[15%] mt-[12%] font-medium text-black rounded-none max-w-[350px]">
        <img loading="lazy"
          src="http://cdn.builder.io/api/v1/image/assets/TEMP/fecaf9133fed713870d2a16659f994a899acb781bae1c0ae7a5f82cf77616162?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db"
          className="object-contain aspect-square w-[45px]" alt="Verification logo"
        />
        <h1 className="mt-6 text-2xl font-semibold">Verify your email</h1>
        <p className="text-base text-black text-opacity-80">
          We sent a code to rana@untitleduo.com
        </p>
        <div className="flex gap-3 mt-10 w-full text-2xl font-bold whitespace-nowrap max-w-[312px]">
          {verificationCode.map((value, index) => (
            <input key={index} id={`input-${index}`} type="text"
              inputMode="numeric"
              pattern="\d*"
              maxLength="1"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              className={`px-7 bg-white rounded-xl border ${value ? 'border-blue-700' : 'border-black border-opacity-20'
                } border-solid h-[69px] w-[69px] text-center`}
              aria-label={`Verification code digit ${index + 1}`}
            />
          ))}
        </div>
        <p className="mt-7 text-base text-black text-opacity-80">
        Didn't get a code?{' '}
        <button
          type="button"
          onClick={handleResendCode}
          className="font-bold underline"
        >
          Click to resend
        </button>
      </p>
        <button
          type="submit"
          className="self-stretch px-16 py-3 mt-9 w-full text-sm text-white whitespace-nowrap bg-blue-700 rounded-md"
        >
          Continue
        </button>
      </form>
    </div>
  );
};

export default EmailVerificationForm;

