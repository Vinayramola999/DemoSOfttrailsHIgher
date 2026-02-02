import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Cropper from "react-easy-crop"; // Import Cropper
import getCroppedImg from "./cropImageHelper"; // Utility function for cropping
import {
  FaCamera,
  FaEdit,
  FaEnvelope,
  FaMarsStroke,
  FaPhone,
  FaUserTie,
} from "react-icons/fa";
import { FaCopy } from "react-icons/fa";
import DocumentPage from "./DocumentManager";
import DocUpload from "./DocumentManager";
import PersonalInfo from "./personalInfo";
import JobDetails from "./JobDetails";
import Swal from "sweetalert2";
import HRPoliciesTab from "./HRPoliciesTab";
import {MAIN_API_BASE } from "../../config/apiBase";

function EmployeeLayout() {
  const fileInputRef = useRef(null);
  const userId = useParams(); // Extract userId from URL\
  console.warn(userId.employeeId);
  const [employeeId, setEmployeeId] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [cropType, setCropType] = useState("profile");
  const [activeTab, setActiveTab] = useState("personalInfo");

  const tabs = [
    { id: "personalInfo", label: "Employee Info" },
    { id: "documents", label: "My Documents" },
    { id: "hrpolicies", label: "HR Policy" },   
  ];

  useEffect(() => {
    const storedEmployeeId =
      sessionStorage.getItem("employeeeId") || sessionStorage.getItem("userId");
    if (storedEmployeeId) {
      setEmployeeId(userId.employeeId);
    }

  }, [userId]);

  useEffect(() => {
    if (employeeId) {
      axios
        .get(`${MAIN_API_BASE}/users/id_user/${employeeId}`, {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        })
        .then((response) => {
          setEmployeeData(response.data.user);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setEmployeeData(null);
        });
    }
  }, [employeeId]);


  const handleFileSelect = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setCropType(type); // Set crop type (either 'profile' or 'background')

      setImageSrc(fileUrl); // Set image for cropping modal
      setIsCropModalOpen(true); // Open crop modal
    }
  };

  const handleCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };
  const handleSaveCroppedImage = async () => {
    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (cropType === "profile") {
        setProfileImage(croppedImage);
      } else {
        setBackgroundImage(croppedImage);
      }
      setIsCropModalOpen(false);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  const handleCopyClick = (userId) => {
    navigator.clipboard
      .writeText(userId)
      .then(() => {
        Swal.fire("User ID copied to clipboard!");
      })
      .catch((error) => {
        console.error("Failed to copy: ", error);
      });
  };

  const [backgroundImage, setBackgroundImage] = useState("");
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/150?text=Profile+Photo"
  );
  const handleEditClick = (type) => {
    fileInputRef.current.dataset.type = type; // Set the image type (profile or background)
    fileInputRef.current.click(); // Trigger file input click
  };

  const handleProfileClick = () => {
    setIsModalOpen(true); // Open modal
  };

  // Close modal
  const handleCloseModal = () => {
    setIsModalOpen(false); // Close modal
  };

  return (
    <div className="flex h-[85vh] gap-6 p-4 max-md:flex-col max-md:h-auto max-md:pb-20">
      {/* Sidebar - Fixed Left Panel */}
      <div className="w-[350px] shrink-0 h-full max-md:w-full max-md:h-auto">
        <div className="flex flex-col h-full bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden">
          <div className="relative h-40 w-full bg-gray-200 group shrink-0">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: `url('${backgroundImage ||
                  "https://miro.medium.com/v2/resize:fit:1400/0*IMK4r0ciK6Sa7k_k"
                  }')`,
              }}
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
            
            <button
              onClick={() => {
                fileInputRef.current.dataset.type = "background";
                handleEditClick("background");
              }}
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
              title="Change Background"
            >
              <FaEdit size={14} />
            </button>
          </div>

          <div className="relative px-6 pb-6 -mt-14 flex flex-col flex-1 overflow-y-auto scrollbar-hide">
            <div className="flex flex-col items-center text-center w-full mb-6">
               {/* Profile Image */}
              <div className="relative w-28 h-28 mb-3 group shrink-0">
                <div className="w-full h-full rounded-full p-1 bg-white shadow-xl">
                  <img
                    src={
                       profileImage === "https://via.placeholder.com/150?text=Profile+Photo" 
                       ? "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?semt=ais_hybrid" 
                       : profileImage
                    }
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover border-4 border-white"
                    onClick={handleProfileClick}
                  />
                </div>
                <button
                  onClick={() => {
                    fileInputRef.current.dataset.type = "profile";
                    handleEditClick("profile");
                  }}
                  className="absolute bottom-1 right-1 p-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
                  title="Change Profile Photo"
                >
                  <FaCamera size={12} />
                </button>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) =>
                  handleFileSelect(e, fileInputRef.current.dataset.type)
                }
                style={{ display: "none" }}
              />

              {/* Basic Identity */}
              {employeeData ? (
                <div className="animate-fade-in-up w-full">
                  <h2 className="text-xl font-bold text-gray-800">
                    {employeeData.first_name} {employeeData.last_name}
                  </h2>
                  <p className="text-sm font-medium text-gray-500 mb-3">{employeeData.designation || "N/A"}</p>

                  <div className="flex justify-center gap-2 mb-4">
                     <span className={`px-3 py-0.5 text-xs font-bold rounded-full uppercase tracking-wider border ${
                       employeeData.user_status?.toLowerCase() === 'active' 
                        ? 'bg-green-50 text-green-600 border-green-200' 
                        : 'bg-red-50 text-red-600 border-red-200'
                     }`}>
                       {employeeData.user_status || "Unknown"}
                     </span>
                  </div>
                </div>
               ) : (
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
               )}
            </div>

            {/* Professional Details Section (Sidebar) */}
            {employeeData && (
              <div className="space-y-4 w-full text-left">
                <div className="h-px bg-gray-100 w-full" />
                
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Professional Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 group">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <FaEnvelope size={14} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-gray-500 font-medium">Email</p>
                      <p className="text-sm text-gray-800 font-medium truncate" title={employeeData.email}>
                        {employeeData.email || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                      <FaPhone size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Contact</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {employeeData.phone_no || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Department</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {employeeData.dept_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-100 transition-colors">
                      <FaUserTie size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Manager</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {employeeData.manager_name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 group">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                      <FaMarsStroke size={14} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Gender</p>
                      <p className="text-sm text-gray-800 font-medium">
                        {employeeData.gender || "N/A"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 group">
                    <div className="p-2 bg-gray-50 text-gray-600 rounded-lg group-hover:bg-gray-100 transition-colors">
                      <FaCopy size={14} />
                    </div>
                     <div 
                        className="flex-1 cursor-pointer" 
                        onClick={() => handleCopyClick(employeeData.emp_id)}
                        title="Click to Copy ID"
                     >
                       <p className="text-xs text-gray-500 font-medium">Employee ID</p>
                       <div className="flex items-center gap-2">
                         <p className="text-sm text-gray-800 font-bold font-mono">
                           {employeeData.emp_id}
                         </p>
                       </div>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modal for Enlarged Profile Photo */}
            {isCropModalOpen && (
              <div className="fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                  <div className="p-4 border-b">
                    <h2 className="text-lg font-bold text-gray-800">
                      Adjust Image
                    </h2>
                  </div>
                  <div className="relative w-full h-80 bg-gray-900">
                    <Cropper
                      image={imageSrc}
                      crop={crop}
                      zoom={zoom}
                      aspect={cropType === "profile" ? 1 / 1 : 16 / 9}
                      onCropChange={setCrop}
                      onZoomChange={setZoom}
                      onCropComplete={handleCropComplete}
                    />
                  </div>
                  <div className="p-4 flex gap-3 justify-end bg-gray-50">
                    <button
                      onClick={() => setIsCropModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveCroppedImage}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isModalOpen && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
                onClick={handleCloseModal}
              >
                <div className="relative max-w-2xl w-full">
                  <button
                    onClick={handleCloseModal}
                    className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-auto max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable Right Panel */}
      <div className="flex-1 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] max-md:h-auto max-md:overflow-visible">
        <div className="flex flex-col gap-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 rounded-full p-1 relative">
            {activeTab !== "uploadDocuments" && (
              <motion.div
                layoutId="activeTab"
                className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                style={{
                  width: `calc(100% / ${tabs.length})`,
                  left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`,
                }}
                transition={{
                  type: "spring",
                  stiffness: 600,
                  damping: 20,
                }}
              />
            )}

            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${
                  activeTab === tab.id && tab.id !== "uploadDocuments"
                    ? "text-white"
                    : "text-gray-700"
                }`}
                onClick={() => setActiveTab(tab.id)}
                style={
                  tab.id === "uploadDocuments"
                    ? { backgroundColor: "transparent" }
                    : {}
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === "personalInfo" && <PersonalInfo />}
            {activeTab === "jobInfo" && <JobDetails />}
            {activeTab === "documents" && (
              <DocumentPage setActiveTab={setActiveTab} />
            )}
            {activeTab === "uploadDocuments" && (
              <DocUpload setActiveTab={setActiveTab} />
            )}
            {activeTab === "hrpolicies" && <HRPoliciesTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
export default EmployeeLayout;