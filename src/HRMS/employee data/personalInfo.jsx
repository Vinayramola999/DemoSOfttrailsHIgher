import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { FaUser, FaPhoneAlt, FaBriefcase, FaEdit } from "react-icons/fa";
import { MAIN_API_BASE } from "../../config/apiBase";

const InfoSection = ({ title, icon, fields, onEdit }) => {
  const column1Fields = fields.slice(0, Math.ceil(fields.length / 2));
  const column2Fields = fields.slice(Math.ceil(fields.length / 2));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative bg-white/80 backdrop-blur-md shadow-lg rounded-2xl p-8 border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      {/* Decorative gradient blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm text-blue-600 text-xl">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-800 tracking-tight">{title}</h3>
        </div>
        {onEdit && (
          <button
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200"
            onClick={onEdit}
            title="Edit"
          >
            <FaEdit size={18} />
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 relative z-10">
        <div className="flex-1 space-y-4">
          {column1Fields.map(({ label, value, isTitle }, index) => (
            <div key={index} className="group">
              <div
                className={`text-sm ${isTitle
                  ? "font-bold text-gray-800 text-base mt-2 mb-2 border-b border-gray-100 pb-1"
                  : "text-gray-500 font-medium mb-1"
                  }`}
              >
                {label}
              </div>
              {!isTitle && (
                <div className="text-gray-900 font-semibold text-[15px] break-words group-hover:text-blue-700 transition-colors">
                  {value || "NA"}
                </div>
              )}
            </div>
          ))}
        </div>

        {column2Fields.length > 0 && (
          <div className="flex-1 space-y-4">
            {column2Fields.map(({ label, value, isTitle }, index) => (
              <div key={index} className="group">
                <div
                  className={`text-sm ${isTitle
                    ? "font-bold text-gray-800 text-base mt-2 mb-2 border-b border-gray-100 pb-1"
                    : "text-gray-500 font-medium mb-1"
                    }`}
                >
                  {label}
                </div>
                {!isTitle && (
                  <div className="text-gray-900 font-semibold text-[15px] break-words group-hover:text-blue-700 transition-colors">
                    {value || "NA"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EditModal = ({ visible, onClose, data, onSave }) => {
  const [formData, setFormData] = useState(data || {});

  // List of non-editable fields
  const nonEditableFields = [
    "Full Name",
    "Email",
    "Joining Date",
    "Department",
    "Sub Department",
    "Pin",
    "Locality",
    "Job Title",
    "Manager",
    "Employment Status",
    "Profile Created At"
  ];

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Validation for Contact Number fields
    if (
      name === "Spouse Contact Number" ||
      name === "Emergency Contact" ||
      name.toLowerCase().includes("contact") ||
      name.toLowerCase().includes("phone") ||
      name.toLowerCase().includes("mobile")
    ) {
      // Allow only numbers
      value = value.replace(/\D/g, "");
      // Limit to 10 digits
      if (value.length > 10) return;
    }

    // Validation for PIN
    if (name === "Pin" || name.toLowerCase().includes("pin")) {
      // Allow only numbers
      value = value.replace(/\D/g, "");
      // Limit to 6 digits
      if (value.length > 6) return;
    }

    setFormData({ ...formData, [name]: value });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Edit Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          <div className="space-y-4">
            {Object.keys(formData || {}).filter((key) => key !== "Spouse Details").map((key, index) => (
              <div key={index}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">{key}</label>
                {nonEditableFields.includes(key) ? (
                  <input
                    type="text"
                    name={key}
                    value={formData[key]}
                    readOnly
                    className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none cursor-not-allowed"
                  />
                ) : key === "D.O.B." || key === "DOB" ? (
                  <input
                    type="date"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                ) : (
                  <input
                    type="text"
                    name={key}
                    value={formData[key]}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            className="px-5 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg transition-all"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all"
            onClick={() => onSave(formData)}
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const PersonalInfo = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const userId = useParams();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEditData, setCurrentEditData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Retrieve the employeeId from sessionStorage, fallback to localStorage
    const storedEmployeeId =
      sessionStorage.getItem("employeeeId") || sessionStorage.getItem("userId");
    if (storedEmployeeId) {
      setEmployeeId(userId.employeeId || storedEmployeeId);
    }
  }, [userId]);

  const fetchData = async () => {
    if (!employeeId) return;
    try {
      setLoading(true);

      // 1. Get user data with Authorization header
      const userRes = await axios.get(
        `${MAIN_API_BASE}/users/id_user/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );
      const userData = userRes.data.user;
      setUserInfo(userData);

      // 2. Get locations (with header if protected)
      const locationRes = await axios.get(`${MAIN_API_BASE}/loc`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });
      const locations = locationRes.data;

      const matchedLocation = locations.find(
        (loc) =>
          loc.locality.trim().toLowerCase() ===
          userData.locality?.trim().toLowerCase()
      );
      const matchedPin = matchedLocation?.code || "";

      const transformedSections = [
        {
          title: "Personal Information",
          icon: <FaUser />,
          fields: [
            {
              label: "Full Name:",
              value: `${userData.first_name} ${userData.last_name}`,
            },
            {
              label: "D.O.B.:",
              value: userData?.dob
                ? new Date(userData.dob).toLocaleDateString("en-CA")
                : "",
            },
            { label: "Blood Group:", value: userData?.extra_details?.blood_group || "NA" },
            { label: "Marital Status:", value: userData?.marital_status || "", },
            { label: "Education:", value: userData?.extra_details?.education || "", },
          ],
        },
        {
          title: "Contact Information",
          icon: <FaPhoneAlt />,
          fields: [
            { label: "Email:", value: userData?.email || "" },
            { label: "Locality:", value: userData?.locality || "" },
            { label: "Pin:", value: matchedPin },
            { label: "Emergency Contact:", value: userData?.extra_details?.emergency_contact?.contact_number || "", },
            { label: "Personal Phone:", value: userData?.personal_number || "" },
          ],
        }
      ];

      setSections(transformedSections);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [employeeId]);

  const handleEdit = (section) => {
    if (section.isReadOnly) return;
    const editData = section.fields.reduce((acc, field) => {
      if (!field.isTitle) {
        acc[field.label.replace(":", "")] = field.value;
      }
      return acc;
    }, {});
    setCurrentEditData(editData);
    setModalVisible(true);
  };

  const handleSave = async (updatedData) => {
    try {
      const toNull = (value) => {
        if (value === "" || value === "NA" || value === undefined) {
          return null;
        }
        return value;
      };

      // Helper to get value from updatedData if present, otherwise fallback to userInfo
      const getValue = (key, fallback) => {
        return updatedData.hasOwnProperty(key) ? toNull(updatedData[key]) : fallback;
      };

      const postPayload = {
        user_id: Number(employeeId),
        dob: getValue("D.O.B.", userInfo?.dob),
        address: getValue("Locality", userInfo?.locality),
        marital_status: getValue("Marital Status", userInfo?.marital_status),
        personal_number: getValue("Personal Phone", userInfo?.personal_number),
        blood: getValue("Blood Group", userInfo?.blood),

        extra_details: {
          education: getValue("Education", userInfo?.extra_details?.education),
          pin: getValue("Pin", userInfo?.extra_details?.pin),
          blood_group: getValue("Blood Group", userInfo?.extra_details?.blood_group),

          emergency_contact: {
            contact_number: getValue("Emergency Contact", userInfo?.extra_details?.emergency_contact?.contact_number),
            // Preserving other potential fields even if not in UI
            name: userInfo?.extra_details?.emergency_contact?.name || null,
            relation: userInfo?.extra_details?.emergency_contact?.relation || null
          },

          spouse_details: {
            name: getValue("Spouse Name", userInfo?.extra_details?.spouse_details?.name),
            occupation: getValue("Spouse Occupation", userInfo?.extra_details?.spouse_details?.occupation),
            contact_number: getValue("Spouse Contact Number", userInfo?.extra_details?.spouse_details?.contact_number),
          },
        },
      };
      await axios.post(`${MAIN_API_BASE}/users/user-details`,
        postPayload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          },
        }
      );

      // Refresh data to ensure userInfo is updated for subsequent edits
      await fetchData();

      Swal.fire("Success!", "Your changes have been saved.", "success");
      setModalVisible(false);
      setError(null);
    } catch (error) {
      console.error("Failed to save data", error);
      Swal.fire("Error!", "Failed to save changes. Please try again.", "error");
      setModalVisible(false);
    }
  };
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  if (error) return <div className="text-red-500 text-center p-4">{error}</div>;

  return (
    <div className="pb-8">
      <div className="grid grid-cols-1 gap-8">
        {sections.map((section, index) => (
          <InfoSection
            key={index}
            title={section.title}
            icon={section.icon}
            fields={section.fields}
            onEdit={section.isReadOnly ? null : () => handleEdit(section)}
          />
        ))}
      </div>
      <EditModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={currentEditData}
        onSave={handleSave}
      />
    </div>
  );
};
export default PersonalInfo;



