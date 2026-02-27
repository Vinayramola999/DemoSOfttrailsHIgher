import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MAIN_API_BASE } from '../config/apiBase';

const profileItems = [
  {
    icon: "http://cdn.builder.io/api/v1/image/assets/TEMP/a407c21bbddbba8e9f32540c38b89b1bc9feea9abe41dade9b0eb372ade13f3c?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db",
    text: "My Profile",
  },
];

function ProfileItem({ icon, text }) {
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  const handleClick = () => {
    if (text === "My Profile") {
      navigate(`/employeelayout/${userId}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex gap-2.5 mt-4 text-xs text-neutral-600 w-full"
    >
      <img
        loading="lazy"
        src={icon}
        alt=""
        className="object-contain shrink-0 w-6 aspect-square"
      />
      <span className="my-auto">{text}</span>
    </button>
  );
}

function LogoutButton() {
  const navigate = useNavigate();

  const Logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("userId");
    navigate("/");
  };
  return (
    <button className="flex gap-2.5 self-stretch px-2.5 py-2 mt-5 text-xs text-red-400 rounded-lg bg-zinc-300 bg-opacity-50 w-full" onClick={Logout} >
      <img
        loading="lazy"
        src="http://cdn.builder.io/api/v1/image/assets/TEMP/342bb2da21789f81ffbfd2d7b23f61fcc6c937b98e58d57453a75ada6e36e758?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db"
        alt=""
        className="object-contain shrink-0 w-6 aspect-square"
      />
      <span className="grow shrink my-auto w-[179px]">Log Out</span>
    </button>
  );
}

function ProfileDropdown() {
  const userId = sessionStorage.getItem("userId") || sessionStorage.getItem("employeeeId");
  const [userData, setUserData] = useState(null);
  const token = sessionStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.post(`${MAIN_API_BASE}/users/verify-token`, { token });
        console.log("Token is valid:", response.data);
      } catch (error) {
        console.error(
          "Token verification failed:",
          error.response ? error.response.data : error.message
        );
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("tokenExpiry");
        navigate("/");
      }
    };

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${MAIN_API_BASE}/users/id_user/${userId}`,
          { headers: { Authorization: `Bearer ${token}`, }, }
        );
        if (response.data.user) {
          setUserData(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    verifyToken();
    if (userId) {
      fetchUserData();
    }
  }, [token, userId, navigate]);

  return (
    <section
      className="
    absolute right-2 top-14 
    sm:fixed sm:right-5 sm:top-16
    flex flex-col items-start 
    px-4 py-3.5 
    bg-white rounded-lg border border-zinc-500 
    w-[95vw] sm:w-[295px] 
    max-w-[95vw] sm:max-w-sm 
    z-[9999] shadow-lg mt-4
  "
    >
      <header className="flex gap-3.5 w-full">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/8839e5a86c91c744ae902ecbb75ae11121a15ba11a67d20ec56f825e116dd9ef"
          alt="User avatar"
          className="object-contain shrink-0 aspect-square w-10 sm:w-[45px]"
        />
        <div className="flex flex-col justify-center break-words max-w-[70%]">
          {userData && (
            <h3 className="font-semibold text-custome-black text-sm sm:text-[14px] leading-tight">
              {userData.first_name} {userData.last_name}
              <br />
              <span className="text-xs text-gray-600 break-all">{userData.email}</span>
            </h3>
          )}
        </div>
      </header>

      <hr className="w-full mt-3 border border-zinc-400" />
      <nav className="w-full">
        {profileItems.map((item, index) => (
          <ProfileItem key={index} icon={item.icon} text={item.text} />
        ))}
      </nav>
      <LogoutButton />
    </section>

  );
}
export default ProfileDropdown;