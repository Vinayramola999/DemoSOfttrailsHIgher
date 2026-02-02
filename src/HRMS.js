import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import ProfileDropdown from "./ProfileDropdown";
import axios from "axios";
import { MAIN_API_BASE } from "./config/apiBase";

const Card = ({ title, icon, onClick }) => (
  <button
    className="relative flex flex-col items-center justify-center w-[200px] h-[150px] bg-blue-500 rounded-lg shadow-md transition-transform transform hover:scale-105 active:scale-95 cursor-pointer text-gray-700"
    onClick={() => onClick(title)}
  >
    <div className="absolute top-0 right-0 w-full h-full rounded-tl-[100px] shadow-lg bg-gradient-to-r bg-white"></div>
    <div className="relative z-10 flex flex-col items-center">
      <div className="text-4xl mb-2 text-black">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
  </button>
);
const CardPage = () => {
  const [availableBtn, setAvailableBtn] = useState();
  const userId = sessionStorage.getItem("userId");
  const cardTitles = ["LMC", "HR", "AttendanceTab", "PMS"];
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const getUserAccessibleCard = async () => {
      try {
        const token = sessionStorage.getItem("token"); // Get the token from sessionStorage
        if (!token) {
          throw new Error("Token not found. Please log in again.");
        }
        let response = await fetch(`${MAIN_API_BASE}/access/verify-access`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Add the token to the Authorization header
            },
            body: JSON.stringify({
              user_id: parseInt(userId),
              pages: cardTitles,
            }),
          }
        );
        let data = await response.json();
        let availableButton = {};
        Object.entries(data).forEach(([key, value]) => {
          if (value) {
            availableButton[key] = key;
          }
        });
        setAvailableBtn(availableButton);
      } catch (error) {
        alert(error.message);
      }
    };
    getUserAccessibleCard();
  }, [userId]);

  const getTitle = (value) => {
    switch (value) {
      case "LMC":
        return "Leave Management";
      case "HR":
        return "HR Corner";
      case "AttendanceTab":
        return "Attendance Mangement";
      case "PMS":
        return "Performance Management";
      default:
        return "None";
    }
  };

  const getPageName = (value) => {
    switch (value) {
      case "LMC":
        return "Leave";
      case "HR":
        return "HRCorner";
      case "AttendanceTab":
        return "AMSTab";
      case "PMS":
        return "PMSTab";
      default:
        return null;
    }
  };

  const [userData, setUserData] = useState("");
  const getToken = () => {
    const token = sessionStorage.getItem("token");
    return token;
  };
  const token = getToken();

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(`${MAIN_API_BASE}/users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data.user) {
            setUserData(response.data.user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token]);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.post(`${MAIN_API_BASE}/users/verify-token`,
          { token }
        );
        navigate("/HRMS");
      } catch (error) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("tokenExpiry");
        navigate("/");
      }
    };
    verifyToken();
  }, [token, navigate]);

  const handleHome = () => {
    navigate("/Cards");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Handle back button popstate event
  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname !== "/Cards") {
        navigate("/Cards", { replace: true });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [location, navigate]);

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Header */}
      <div className="bg-custome-blue rounded-lg w-full px-3 py-2 flex items-center justify-between shadow-lg">
        {/* Home Button */}
        <button
          onClick={handleHome}
          type="button"
          className="flex items-center p-2 rounded-full"
        >
          <FaHome className="text-white mr-2" size={25} />
        </button>

        {/* Title */}
        <h1 className="text-white text-2xl sm:text-2xl font-bold">HRMS</h1>

        {/* User Profile Section */}
        {userData && (
          <button
            onClick={toggleDropdown}
            type="button"
            className="bg-white flex items-center rounded-full mt-2 sm:mt-0 sm:mr-5 px-2 py-2"
          >
            <div className="bg-white rounded-3xl flex items-center">
              {/* Profile Icon */}
              <div className="mr-2">
                <img
                  src="http://cdn.builder.io/api/v1/image/assets/TEMP/8839e5a86c91c744ae902ecbb75ae11121a15ba11a67d20ec56f825e116dd9ef?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db"
                  alt="Profile Icon"
                  className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                />
              </div>
              {/* User Name */}
              <div className="flex flex-col">
                <h3 className="text-xs sm:text-sm font-semibold text-custome-black">
                  {userData.first_name} {userData.last_name}
                </h3>
              </div>
            </div>
          </button>
        )}
      </div>
      {/* Dropdown */}
      <div className="fixed right-4 top-[70px] sm:top-[90px] w-full sm:w-auto z-10">
        {isDropdownOpen && (
          <ProfileDropdown className="absolute z-10 right-0" />
        )}
      </div>
      {/*END */}

      <div className="bg-white rounded-lg p-6">
        <div className="flex flex-wrap justify-center gap-6">
          {availableBtn &&
            Object.entries(availableBtn).map(([key, value]) => (
              <Card
                key={key} // Add the unique key prop here
                title={getTitle(value)}
                icon={<i className="fas fa-users"></i>}
                bgColor="bg-blue-500"
                onClick={() => navigate(`/${getPageName(value)}`)}
              />
            ))}
        </div>
      </div>
    </div>
  );
};
export default CardPage;
