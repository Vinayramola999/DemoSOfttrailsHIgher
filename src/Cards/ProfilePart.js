import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Avatar from "../assests/Avatar.png";
import SoftTrails from "../assests/SoftTrails.png";
import { MAIN_API_BASE } from '../config/apiBase';

const ProfilePart = () => {
  const [user, setUser] = useState(null);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");

      if (!userId || !token) {
        console.error("Missing userId or token in sessionStorage");
        setUser({}); // still show UI
        return;
      }
      try {
        const headers = {
          headers: { Authorization: `Bearer ${token}`, }
        };
        const userRes = await axios.get(`${MAIN_API_BASE}/users/id_user/${userId}`, headers);
        const loggedInUser = userRes.data.user;
        setUser(loggedInUser);
        const locRes = await axios.get(`${MAIN_API_BASE}/loc`, headers);
        const userLoc = locRes.data.find(
          loc => loc.locality.toLowerCase() === loggedInUser.locality?.toLowerCase()
        );
        if (userLoc) setLocation(userLoc);
      } catch (err) {
        console.error("Error fetching data:", err);
        setUser({}); // fallback to allow UI rendering
      }
    };
    fetchData();
  }, []);

  if (user === null) return <div className="text-center mt-10">Loading user profile...</div>;

  return (
    <div className="h-full flex flex-col rounded-none md:rounded-xl shadow-md overflow-hidden">
      <div className="bg-blue-100 flex justify-center p-6 relative">
        <img src={Avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white -mb-12" />
      </div>
      <div className="pt-16 pb-6 text-center px-4">
        <h2 className="text-lg font-semibold text-blue-600">
          {user.first_name || "N/A"} {user.last_name || ""}
        </h2>
        <p className="text-sm text-gray-600">{user.email || "N/A"}</p>
      </div>

      <div className="px-6 pb-6">
        <h3 className="text-md font-semibold text-gray-700 mb-3">Basic Information</h3>
        <div className="grid grid-cols-2 gap-y-4 text-sm text-gray-700">
          <div>
            <p className="text-xs text-gray-500">Employee ID</p>
            <p>{user.emp_id || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone number</p>
            <p>{user.phone_no ? `+91-${user.phone_no}` : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Registered date</p>
            <p>{user.user_created_at ? new Date(user.user_created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">User status</p>
            <p>{user.user_status ? user.user_status.charAt(0).toUpperCase() + user.user_status.slice(1) : "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Address</p>
            <p>{location?.locality || "N/A"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">City</p>
            <p>{location?.city || "N/A"}</p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center text-center pb-4">
        <p className="text-sm text-gray-500">Powered by</p>
        <img src={SoftTrails} alt="SoftTrails Logo" className="w-24" />
      </div>
    </div>
  );
};
export default ProfilePart;