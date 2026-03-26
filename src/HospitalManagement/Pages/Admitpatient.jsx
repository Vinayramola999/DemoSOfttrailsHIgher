import React, { useState } from "react";
import {
  getPatientById, 
  getPatientPhone,
  admitPatient,
  getPatientsAdmissionDetails,
} from "../api/Service";
import { useNavigate } from "react-router-dom";
const Admitpatient = ({ onClose, onAdmitSuccess }) => {
  const navigate = useNavigate();
  const [searchBy, setSearchBy] = useState("id");
  const [form, setForm] = useState({
    patientId: "",
    patientName: "",
    contactNumber: "",
    email: "",
    dob: "",
    emergencyContact: "",
    gender: "",
    pincode: "",
    insurance: true,
    insuranceCompanyName: "",
    insuranceId: "",
    insuranceCompanyContact: "",
    insuranceCompanyEmail: "",
    insuranceCompany: "",
  });
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showAdmitConfirm, setShowAdmitConfirm] = useState(false);

  const handleKeyPress = (e, type) => {
    if (type === 'numeric') {
      if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
        e.preventDefault();
      }
    } else if (type === 'alphanumeric') {
      if (!/[a-zA-Z0-9 ]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
        e.preventDefault();
      }
    } else if (type === 'alpha') {
      if (!/[a-zA-Z ]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
        e.preventDefault();
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.patientId) {
      newErrors.patientId = "Patient ID is required";
    } else if (!/^\d{1,10}$/.test(form.patientId)) {
      newErrors.patientId = "Patient ID must be numeric only, max 10 characters";
    }

    if (!form.contactNumber) {
      newErrors.contactNumber = "Mobile number is required";
    } else if (!/^\d{10}$/.test(form.contactNumber)) {
      newErrors.contactNumber = "Mobile number must be exactly 10 digits";
    }

    if (!form.patientName) {
      newErrors.patientName = "Patient name is required";
    } else if (!/^[A-Za-z ]{1,30}$/.test(form.patientName)) {
      newErrors.patientName = "Patient name can only include letters and spaces, max 30 chars";
    }

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (
      form.email.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    ) {
      newErrors.email = "Please enter a valid email within 100 chars";
    }

    if (!form.dob) {
      newErrors.dob = "Date of birth is required";
    } else {
      const date = new Date(form.dob);
      const now = new Date();
      if (Number.isNaN(date.getTime()) || date >= now) {
        newErrors.dob = "Date of birth must be a valid date in the past";
      }
    }

    if (!form.documentType) {
      newErrors.documentType = "Document type is required";
    } else if (!/^[A-Za-z ]{1,30}$/.test(form.documentType)) {
      newErrors.documentType = "Document type can only include letters and spaces, max 30 chars";
    }

    if (!form.documentNumber) {
      newErrors.documentNumber = "Document number is required";
    } else if (!/^[A-Za-z0-9 ]{1,30}$/.test(form.documentNumber)) {
      newErrors.documentNumber = "Document number can only include letters, numbers, and spaces, max 30 chars";
    }

    if (!form.pincode) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{1,6}$/.test(form.pincode)) {
      newErrors.pincode = "Pincode must be numeric only, max 6 characters";
    }

    if (form.insurance) {
      if (!form.insuranceCompanyName) {
        newErrors.insuranceCompanyName = "Insurance company name is required";
      } else if (!/^[A-Za-z ]{1,30}$/.test(form.insuranceCompanyName)) {
        newErrors.insuranceCompanyName = "Insurance company name can only include letters and spaces, max 30 chars";
      }

      if (!form.insuranceId) {
        newErrors.insuranceId = "Insurance ID is required";
      } else if (!/^\d{1,30}$/.test(form.insuranceId)) {
        newErrors.insuranceId = "Insurance ID must be numeric only, max 30 characters";
      }

      if (!form.insuranceCompanyContact) {
        newErrors.insuranceCompanyContact = "Insurance contact number is required";
      } else if (!/^\d{10}$/.test(form.insuranceCompanyContact)) {
        newErrors.insuranceCompanyContact = "Insurance contact number must be 10 digits";
      }

      if (!form.insuranceCompanyEmail) {
        newErrors.insuranceCompanyEmail = "Insurance email is required";
      } else if (
        form.insuranceCompanyEmail.length > 100 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.insuranceCompanyEmail)
      ) {
        newErrors.insuranceCompanyEmail = "Please enter a valid insurance email";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (
      (searchBy === "id" && name === "patientId") ||
      (searchBy === "contactNumber" && name === "contactNumber")
    ) {
      setIsAutoFilled(false);
      setForm((prev) => ({ ...prev, [name]: value }));
      if (searchBy === "id" && name === "patientId" && value.length === 5) {
        handleAutoFill({ target: { name, value } });
      } else if (
        searchBy === "contactNumber" &&
        name === "contactNumber" &&
        value.length === 10
      ) {
        handleAutoFill({ target: { name, value } });
      }
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // auto-fill patient details
  const handleAutoFill = async (e) => {
    const { name, value } = e.target;
    if (!value) return;
    try {
      let data;
      if (searchBy === "id" && name === "patientId") {
        data = await getPatientById(value);
      } else if (searchBy === "contactNumber" && name === "contactNumber") {
        data = await getPatientPhone(value);
      }
      if (data) {
        const patient = Array.isArray(data) ? data[0] : data;
        const firstInsurance =
          Array.isArray(patient.insurances) && patient.insurances.length > 0
            ? patient.insurances[0]
            : {};
        setForm((prev) => ({
          ...prev,
          patientId: patient.patientId || patient.id || prev.patientId,
          patientName: patient.patientName || patient.name || prev.patientName,
          contactNumber: patient.contactNumber || prev.contactNumber,
          email: patient.email || prev.email,
          dob: patient.dob || patient.dateOfBirth || prev.dob,
          documentType: patient.identityDocType || "",
          documentNumber: patient.identityDocNumber || "",
          pincode: patient.pincode || "",
          insuranceCompanyName: firstInsurance.insuranceCompany || "",
          insuranceId: firstInsurance.insuranceId || "",
          insuranceCompanyContact:
            firstInsurance.insuranceCompanyContact || "",
          insuranceCompanyEmail: firstInsurance.insuranceCompanyEmail || "",
        }));
        setIsAutoFilled(true);
      }
    } catch (error) {
      alert(error.message);
      setIsAutoFilled(false);
    }
  };

  // main admit logic (for Save & Next)
  const admitLogic = async () => {
    const admissions = await getPatientsAdmissionDetails();
    const found = admissions.find(
      (a) =>
        (a.patientId === form.patientId || a.patientId === form.id) &&
        a.admissionStatus === "ADMITTED"
    );
    if (found) {
      const error = new Error("Patient is already admitted.");
      error.code = "ALREADY_ADMITTED";
      throw error;
    }
    const admissionData = {
      patientId: form.patientId,
    };
    await admitPatient(admissionData);
  };

  // open confirm modal
  const handleAdmit = () => {
    setShowAdmitConfirm(true);
  };

  // confirm admit logic
  const handleConfirmAdmit = async () => {
    if (!validateForm()) {
      setShowAdmitConfirm(false);
      return;
    }

    setShowAdmitConfirm(false);
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await admitPatient({
        patientId: form.patientId,
        admissionStatus: "ADMITTED",
      });

      console.log("Admit response:", res);

  // Notify parent that admit succeeded; parent will show the success popup and refresh
  if (onAdmitSuccess) onAdmitSuccess();
    } catch (err) {
      console.error("Admit Error:", err);
      setError(err.message || "Patient already admitted.");
      setShowCustomModal(true);
    } finally {
      setLoading(false);
    }
  };

  



  // Save & Next
  const handleSaveAndNext = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    try {
      await admitLogic();
    } catch (err) {
      if (err.code !== "ALREADY_ADMITTED") {
        setError(err.message || "Patient already admitted.");
        setShowCustomModal(true);
        setLoading(false);
        return;
      }
    }

    navigate("/HospitalManagement/ipd/lifecycle");
    if (onAdmitSuccess) onAdmitSuccess();
    onClose();
  };

  // JSX Render
  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
        <div className="relative flex flex-col w-full max-w-5xl p-6 bg-white border border-gray-200 shadow-lg rounded-xl">
          {/* Close button */}
          <button
            className="absolute rounded-full top-3 right-3 hover:bg-gray-100"
            onClick={onClose}
            aria-label="Close"
            type="button"
          >
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="15" fill="#FF3A3A" />
              <path d="M20.2426 11.7574L16 16M16 16L11.7574 20.2426M16 16L20.2426 20.2426M16 16L11.7574 11.7574" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          {/* Title */}
          <h2 className="text-[#00235A] font-[Inter] font-semibold text-[16px] leading-[100%] tracking-normal mb-3 ">Admit Patient</h2>
          {success && <div className="mb-2 text-green-600">{success}</div>}
          
          {/* Patient search by */}
          <div className="mb-4">
            <span className="block mb-2 text-base font-medium">Patient search by</span>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-base">
                <input
                  type="radio"
                  name="searchBy"
                  value="id"
                  checked={searchBy === "id"}
                  onChange={() => { setSearchBy("id"); setIsAutoFilled(false); setForm(f => ({ ...f, patientId: "", contactNumber: "" })); }}
                  className="w-3 h-3 accent-blue-700"
                />
                <span>Patient ID</span>
              </label>
              <label className="flex items-center gap-2 text-base">
                <input
                  type="radio"
                  name="searchBy"
                  value="contactNumber"
                  checked={searchBy === "contactNumber"}
                  onChange={() => { setSearchBy("contactNumber"); setIsAutoFilled(false); setForm(f => ({ ...f, patientId: "", contactNumber: "" })); }}
                  className="w-3 h-3 accent-blue-700"
                />
                <span>Patient Mobile Number</span>
              </label>
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 mb-2 gap-y-4 gap-x-6 md:grid-cols-4">
            <div>
              <label className="block mb-1 text-base font-medium text-gray-700">Patient ID</label>
              <input
                type="text"
                name="patientId"
                value={form.patientId}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, 'numeric')}
                placeholder="Enter Patient ID"
                maxLength="10"
                readOnly={searchBy === "contactNumber" || (isAutoFilled && searchBy !== "id")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
              />
              {errors.patientId && <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>}
            </div>
            <div>
              <label className="block mb-1 text-base font-medium text-gray-700">Mobile Number</label>
              <input
                type="text"
                name="contactNumber"
                placeholder="Enter Mobile Number"
                value={form.contactNumber}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, 'numeric')}
                maxLength="10"
                readOnly={searchBy === "id" || (isAutoFilled && searchBy !== "contactNumber")}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
              />
              {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>}
            </div>
            <div>
              <label className="block mb-1 text-base font-medium text-gray-700">Patient name</label>
              <input
                type="text"
                name="patientName"
                placeholder="Enter Patient Name"
                value={form.patientName}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, 'alpha')}
                maxLength="30"
                readOnly={isAutoFilled}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
              />
              {errors.patientName && <p className="mt-1 text-sm text-red-600">{errors.patientName}</p>}
            </div>
            <div>
              <label className="block mb-1 text-base font-medium text-gray-700">Email</label>
              <input
                type="text"
                name="email"
                placeholder="Enter Email"
                value={form.email}
                onChange={handleChange}
                maxLength="100"
                readOnly={isAutoFilled}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="block mb-1 text-base font-medium text-gray-700">Date of birth</label>
              <input
                type="date"
                placeholder="Enter Date of Birth"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                readOnly={isAutoFilled}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
              />
              {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
            </div>
            <div>
              <label className="block mb-1 text-base font-medium text-gray-700">Document Type</label>
              <input
                type="text"
                name="documentType"
                placeholder="Enter Document Type"
                value={form.documentType}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, 'alpha')}
                maxLength="30"
                readOnly={isAutoFilled}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
              />
              {errors.documentType && <p className="mt-1 text-sm text-red-600">{errors.documentType}</p>}
            </div>
            <div>
              <label className="block mb-1 text-base font-medium text-gray-700">Document Number</label>
              <input
                type="text"
                name="documentNumber"
                placeholder="Enter Document Number"
                value={form.documentNumber}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, 'alphanumeric')}
                maxLength="30"
                readOnly={isAutoFilled}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
              />
              {errors.documentNumber && <p className="mt-1 text-sm text-red-600">{errors.documentNumber}</p>}
            </div>
            <div>
              <label className="block mb-1 text-base font-medium text-gray-700">Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="Enter Pincode"
                value={form.pincode}
                onChange={handleChange}
                onKeyPress={(e) => handleKeyPress(e, 'numeric')}
                maxLength="6"
                readOnly={isAutoFilled}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
              />
              {errors.pincode && <p className="mt-1 text-sm text-red-600">{errors.pincode}</p>}
            </div>
          </div>

          {/* Insurance Information */}
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              name="insurance"
              checked={form.insurance}
              onChange={handleChange}
              disabled={isAutoFilled}
              className="w-3 h-3 mr-2 accent-blue-700"
              id="insurance-info"
            />
            <label htmlFor="insurance-info" className="font-semibold text-blue-800 cursor-pointer text-sm-bold">
              Insurance Information
            </label>
          </div>

          {form.insurance && (
            <div className="grid grid-cols-1 mb-8 gap-y-6 gap-x-8 md:grid-cols-4">
              <div>
                <label className="block mb-1 text-base font-medium text-gray-700">Insurance Company Name</label>
                <input
                  type="text"
                  name="insuranceCompanyName"
                  value={form.insuranceCompanyName || ''}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, 'alpha')}
                  maxLength="30"
                  readOnly={isAutoFilled}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
                  placeholder="Enter insurance company"
                />
                {errors.insuranceCompanyName && <p className="mt-1 text-sm text-red-600">{errors.insuranceCompanyName}</p>}
              </div>
              <div>
                <label className="block mb-1 text-base font-medium text-gray-700">Insurance ID</label>
                <input
                  type="text"
                  name="insuranceId"
                  value={form.insuranceId || ''}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, 'numeric')}
                  maxLength="30"
                  readOnly={isAutoFilled}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
                  placeholder="Enter insurance id"
                />
                {errors.insuranceId && <p className="mt-1 text-sm text-red-600">{errors.insuranceId}</p>}
              </div>
              <div>
                <label className="block mb-1 text-base font-medium text-gray-700">Insurance Contact Number</label>
                <input
                  type="text"
                  name="insuranceCompanyContact"
                  value={form.insuranceCompanyContact || ''}
                  onChange={handleChange}
                  onKeyPress={(e) => handleKeyPress(e, 'numeric')}
                  maxLength="10"
                  readOnly={isAutoFilled}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
                  placeholder="Insurance contact number"
                />
                {errors.insuranceCompanyContact && <p className="mt-1 text-sm text-red-600">{errors.insuranceCompanyContact}</p>}
              </div>
              <div>
                <label className="block mb-1 text-base font-medium text-gray-700">Insurance Company Email</label>
                <input
                  type="email"
                  name="insuranceCompanyEmail"
                  value={form.insuranceCompanyEmail || ''}
                  onChange={handleChange}
                  maxLength="100"
                  readOnly={isAutoFilled}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none text-base bg-gray-50"
                  placeholder="Enter insurance email"
                />
                {errors.insuranceCompanyEmail && <p className="mt-1 text-sm text-red-600">{errors.insuranceCompanyEmail}</p>}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col items-center w-full gap-4 mt-4 md:flex-row md:justify-between">
            <div className="flex w-full gap-4 md:w-auto">
              <button
                type="button"
                onClick={handleAdmit}
                className="bg-[#0e5ede] hover:bg-[#001D4C] text-white font-semibold rounded-lg w-[180px] h-[38px]"
              >
                Admit
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-white text-[#00235A] border border-[#00235A] font-semibold rounded-lg w-[180px] h-[38px] hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>

            <button
              type="button"
              onClick={handleSaveAndNext}
              disabled={loading || !isAutoFilled}
              className="bg-green-700 text-white font-semibold rounded-lg w-[200px] h-[38px]"
            >
              Save & Next
            </button>
          </div>
        </div>
      </div>

      {/* Admit Confirm Modal */}
      {showAdmitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            className="relative"
            style={{ width: 365, height: 346 }}
          >
            <div
              style={{
                width: 365,
                height: 346,
                borderRadius: 30,
                border: "1px solid rgba(181,181,181,1)",
                background: "rgba(255,255,255,1)",
                opacity: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingTop: 24,
                boxSizing: "border-box",
              }}
            >
              {/* Vector circle */}
              <div
                style={{
                  width: 57.5,
                  height: 57.5,
                  borderRadius: 57.5 / 2,
                  background: "rgba(0,90,230,1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 30,
                }}
              >
                <svg width="38" height="38" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {/* Title */}
              <div style={{ width: 342, height: 39, textAlign: "center", marginBottom: 12 }}>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontWeight: 600,
                    fontSize: 32,
                    lineHeight: "100%",
                    color: "rgba(0,90,230,1)",
                    letterSpacing: 0,
                  }}
                >
                  Admit Patient?
                </div>
              </div>

              {/* Message */}
              <div
                style={{
                  width: 318,
                  height: 38,
                  textAlign: "center",
                  color: "rgba(98,98,98,1)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: "100%",
                  marginBottom: 28,
                }}
              >
                Are you sure you want to admit patient?
              </div>

              {/* Buttons row */}
              <div style={{ display: "flex", gap: 12, marginTop: 45 }}>
                <button
                  type="button"
                  onClick={() => setShowAdmitConfirm(false)}
                  style={{
                    width: 160,
                    height: 40,
                    borderRadius: 8,
                    background: "#fff",
                    border: "1px solid rgba(34,34,34,0.15)",
                    color: "#222",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 16,
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAdmit}
                  disabled={loading}
                  style={{
                    width: 160,
                    height: 40,
                    borderRadius: 8,
                    background: "rgba(0,90,230,1)",
                    color: "#fff",
                    border: "none",
                    fontFamily: "Inter, sans-serif",
                    fontSize: 16,
                  }}
                >
                  {loading ? "Admitting..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 text-center bg-white shadow-lg rounded-2xl">
            <h3 className="mb-2 text-2xl font-semibold text-red-600">
              Notice
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              Patient Already Admitted
            </p>
            <button
              type="button"
              className="px-6 py-2 font-medium text-white bg-red-600 rounded-md"
              onClick={() => setShowCustomModal(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Success handling moved to parent via onAdmitSuccess */}
    </>
  );
};

export default Admitpatient;


