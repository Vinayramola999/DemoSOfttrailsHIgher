import React, { useState, useEffect, useRef } from "react";
import { FaHome, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
//
import ProfileDropdown from "../../ProfileDropdown";
import axios from "axios";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const ResubmittedApproval = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userDetails, setUserDetails] = useState({});
  const [categoryNames, setCategoryNames] = useState({});
  const [activeTab, setActiveTab] = useState("category"); // Default active tab is 'category'
  const navigate = useNavigate();
  const token = sessionStorage.getItem("token");

  // Fetch the resubmitted requests for category approval
  const fetchCategoryRequests = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${ASSET_NODE_BASE}AMSlog`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data);
    } catch (error) {
      setError("Error fetching resubmitted requests.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify user token
  const verifyToken = async () => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      await axios.post(`${MAIN_BASE}users/verify-token`, { token });
    } catch (error) {
      console.error("Token verification failed:", error.message);
      sessionStorage.removeItem("token");
      navigate("/");
    }
  };

  useEffect(() => {
    verifyToken();
    fetchCategoryRequests(); // Fetch category requests when the component loads
  }, []); // This will run only once when the component mounts

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_id");
    navigate("/");
  };

  // Fetch user details by ID
  const fetchUserDetails = async (userId) => {
    try {
      const response = await axios.get(
       `${MAIN_BASE}users/id_user/${userId}`
      );
      return `${response.data.first_name} ${response.data.last_name}`; // Assuming user has first_name and last_name properties
    } catch (error) {
      console.error("Error fetching user details", error);
      return "Unknown User";
    }
  };

  // Fetch category name by category ID
  const fetchCategoryName = async (categoryId) => {
    try {
      const response = await axios.get(
        `${JAVA_BASE}api/categories/categoryId/${categoryId}`
      );
      return response.data.name; // Assuming the category has a name property
    } catch (error) {
      console.error("Error fetching category details", error);
      return "Unknown Category";
    }
  };

  // Fetch user and category details for all requests
  const fetchAllUserAndCategoryDetails = async () => {
    const userDetailsObj = {};
    const categoryNamesObj = {};

    for (const request of requests) {
      // Fetch sender and receiver details
      if (!userDetailsObj[request.sender_id]) {
        userDetailsObj[request.sender_id] = await fetchUserDetails(
          request.sender_id
        );
      }
      if (!userDetailsObj[request.receiver_id]) {
        userDetailsObj[request.receiver_id] = await fetchUserDetails(
          request.receiver_id
        );
      }

      // Fetch category name
      if (!categoryNamesObj[request.category_id]) {
        categoryNamesObj[request.category_id] = await fetchCategoryName(
          request.category_id
        );
      }
    }

    setUserDetails(userDetailsObj);
    setCategoryNames(categoryNamesObj);
  };

  useEffect(() => {
    if (requests.length > 0) {
      fetchAllUserAndCategoryDetails();
    }
  }, [requests]);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    // Add event listener to detect clicks outside the dropdown
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Clean up the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  const dropdownRef = useRef(null);

  const handleHome = () => {
    navigate("/Cards");
  };

  const [userData, setUserData] = useState("");
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    console.log("UserId:", userId);
    if (userId) {
      const fetchUserData = async () => {
        try {
          console.log("Fetching data for userId:", userId);
          const response = await axios.get(
           `${MAIN_BASE}users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("API Response:", response);
          if (response.data) {
            const user = response.data;
            console.log("User:", user);
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

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex flex-col w-full">
        {/* Tab Navigation */}
        <div className="mb-4 flex space-x-4 mt-3">
          <button
            onClick={() => setActiveTab("category")}
            className={`px-4 py-2 rounded-lg  ${
              activeTab === "category"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Category Logs
          </button>
          {/* <button
            onClick={() => setActiveTab("asset")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "asset"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Asset Logs
          </button> */}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500 text-white p-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "category" && (
          <>
            {/* Loading Spinner */}
            {isLoading ? (
              <div className="flex justify-center items-center mt-8">
                <div className="spinner-border animate-spin border-4 rounded-full border-t-blue-600 w-8 h-8"></div>
              </div>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full bg-white border border-gray-200 rounded-lg shadow-md">
                  <thead className="sticky top-0 bg-gray-200">
                    <tr className="bg-gray-500 text-white">
                      <th className="py-2 px-4 text-left">S.No</th>
                      <th className="py-2 px-4 text-left">Category Name</th>
                      <th className="py-2 px-4 text-left">Created Date</th>
                      <th className="py-2 px-4 text-left">Sender</th>
                      <th className="py-2 px-4 text-left">Receiver</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.length > 0 ? (
                      requests.map((request, index) => (
                        <tr
                          key={request.category_id}
                          className="hover:bg-gray-100"
                        >
                          <td className="py-2 px-4">{index + 1}</td>
                          <td className="py-2 px-4">
                          {request.categoriesname || "N/A"}</td>
                          <td className="py-2 px-4">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-2 px-4">
                            {userDetails[request.sender_id] || "Loading..."}
                          </td>{" "}
                          {/* Sender */}
                          <td className="py-2 px-4">
                            {userDetails[request.receiver_id] || "Loading..."}
                          </td>{" "}
                          {/* Receiver */}
                          <td className="py-2 px-4">{request.status}</td>
                          <td className="py-2 px-4">
                            {request.description}
                          </td>{" "}
                          {/* Description */}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="text-center py-4 text-gray-600"
                        >
                          No resubmitted requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === "asset" && (
          <div className="text-center text-gray-600 py-4">
            <p>Asset approval data is not available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default ResubmittedApproval;