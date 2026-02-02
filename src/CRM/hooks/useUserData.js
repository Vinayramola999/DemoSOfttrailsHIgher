import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../config/api";


export default function useUserData() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!userId || !token) {
      setError("User ID or token is missing");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users/id_user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data || null);
      } catch (err) {
        setError("Failed to fetch user data");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return { userData, loading, error };
}
