import React, { useState, useEffect ,useRef} from "react";
import {
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaHome,
  FaSignOutAlt,
} from "react-icons/fa";
//
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileDropdown from '../../Cards/ProfileDropdown';
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const OrganizationLevel = () => {
  const userId = sessionStorage.getItem("userId");
  const navigate = useNavigate();
  const [levels, setLevels] = useState([]);
  const [levelName, setLevelName] = useState("");
  const [description, setDescription] = useState("");
  const [userData, setUserData] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newLevelName, setNewLevelName] = useState("");
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();

  const verifyToken = async () => {
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const response = await axios.post(
        `${MAIN_BASE}users/verify-token`,
        {
          token: token,
        }
      );
      console.log("Token is valid:", response.data);
      navigate("/OrganizationLevel");
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
    verifyToken();
  }, []);

  const addLevel = () => {
    if (levelName && description) {
      setLevels([
        ...levels,
        { id: levels.length + 1, levelName, description, subLevels: [] },
      ]);
      setLevelName("");
      setDescription("");
    }
  };

  const toggleExpandRow = (id) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const deleteLevel = (id) => {
    setLevels(levels.filter((level) => level.id !== id));
  };

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (userId) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `${MAIN_BASE}users/id_user/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (response.data) {
            const user = response.data;
            setUserData(user);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }
  }, [token, userId]);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("tokenExpiry");
    navigate("/");
  };

  const handleHome = () => {
    navigate("/Cards");
  };

  const handleAddCategory = (levelId) => {
    if (newCategoryName) {
      setLevels((prevLevels) =>
        prevLevels.map((level) =>
          level.id === levelId
            ? {
              ...level,
              subLevels: [
                ...level.subLevels,
                { id: level.subLevels.length + 1, name: newCategoryName },
              ],
            }
            : level
        )
      );
      setNewCategoryName("");
    }
  };

  const handleAddLevel = (levelId) => {
    if (newLevelName) {
      setLevels((prevLevels) =>
        prevLevels.map((level) =>
          level.id === levelId
            ? {
              ...level,
              subLevels: [
                ...level.subLevels,
                { id: level.subLevels.length + 1, name: newLevelName },
              ],
            }
            : level
        )
      );
      setNewLevelName("");
    }
  };

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

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex">
       
        <div className="w-full p-6">
          {/* Header */}
          <div className="bg-custome-blue rounded-lg w-full px-3 py-2 flex items-center justify-between shadow-lg">
            {/* Home Button and Title Section */}
            <div className="flex items-center">
              {/* Home Button */}
              <button
                onClick={handleHome}
                type="button"
                className="flex items-center p-2 rounded-full"
              >
                <FaHome className="text-white mr-2" size={25} />
              </button>

              {/* Title */}
              <h1 className="text-white text-2xl sm:text-2xl font-bold ml-2"> Organization Level </h1>
            </div>

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
                    <h3 className="text-xs sm:text-sm font-bold text-custome-black">
                      {userData.first_name} {userData.last_name}
                    </h3>
                  </div>
                </div>
              </button>
            )}
          </div>
          <div className=" ml-[61%] w-[50%] fixed z-10">
            {isDropdownOpen && (
              <div ref={dropdownRef}>
                <ProfileDropdown className="absolute z-10 right-0" />
              </div>
            )}
          </div>
          {/*END*/}

          {/* Form Section */}
          <div className="bg-white shadow rounded-lg p-6 mb-6 mt-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <input
                type="text"
                placeholder="Add new level"
                value={levelName}
                onChange={(e) => setLevelName(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full text-sm"
              />
              <textarea
                placeholder="Add description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 w-full text-sm"
              ></textarea>
              <button
                onClick={addLevel}
                className="bg-blue-500 text-white rounded-lg px-4 py-2 hover:bg-blue-600 transition text-sm"
              >
                Submit
              </button>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Sr. No.
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {levels.map((level, index) => (
                    <React.Fragment key={level.id}>
                      <tr>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          Higher India Private Limited
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {level.levelName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {level.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 flex items-center space-x-4">
                          <button
                            onClick={() => toggleExpandRow(level.id)}
                            className="text-blue-500 hover:underline flex items-center"
                          >
                            {expandedRows[level.id] ? (
                              <>
                                Collapse <FaChevronUp className="ml-1" />
                              </>
                            ) : (
                              <>
                                Expand <FaChevronDown className="ml-1" />
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => deleteLevel(level.id)}
                            className="text-red-500 hover:underline"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                      {expandedRows[level.id] && (
                        <tr>
                          <td colSpan="5" className="bg-gray-50 px-4 py-3">
                            <div className="space-y-4">
                              {/* Add Category */}
                              <div className="flex gap-4">
                                <input
                                  type="text"
                                  value={newCategoryName}
                                  onChange={(e) => setNewCategoryName(e.target.value)}
                                  placeholder="Category Name"
                                  className="border border-gray-300 rounded-lg p-2 w-full text-sm"
                                />
                                <button
                                  onClick={() => handleAddCategory(level.id)}
                                  className="bg-green-500 text-white rounded-lg px-4 py-2 text-sm"
                                >
                                  Add Category
                                </button>
                              </div>

                              {/* Add Level */}
                              <div className="flex gap-4">
                                <input
                                  type="text"
                                  value={newLevelName}
                                  onChange={(e) => setNewLevelName(e.target.value)}
                                  placeholder="New Level Name"
                                  className="border border-gray-300 rounded-lg p-2 w-full text-sm"
                                />
                                <button
                                  onClick={() => handleAddLevel(level.id)}
                                  className="bg-blue-500 text-white rounded-lg px-4 py-2 text-sm"
                                >
                                  Add Level
                                </button>
                              </div>

                              {/* Display Sub-levels */}
                              <div className="mt-4">
                                {level.subLevels.map((sub, index) => (
                                  <div key={index} className="text-sm text-gray-500">
                                    {sub.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationLevel;
