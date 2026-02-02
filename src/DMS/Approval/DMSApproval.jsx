import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Approval from "./Approval";

const DmsApproval = () => {
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");

  const verifyToken = async () => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const response = await axios.post(
        "https://devdemo.softtrails.net/users/verify-token",
        {
          token: token,
        }
      );
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

  useEffect(() => {
    if (userId) {
      const fetchUserData = async () => {
        try {
          console.log("Fetching data for userId:", userId);
          const response = await axios.get(
            `https://devdemo.softtrails.net/users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("API Response:", response);
          if (response.data) {
            const user = response.data;
            setUserData(user);
          } else {
            console.log("No user data found");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token, userId]);

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <div className="flex ">
      <div className=" w-full">
        <div className="mt-2">
          <Approval />
        </div>
      </div>
    </div>
  );
};

export default DmsApproval;
