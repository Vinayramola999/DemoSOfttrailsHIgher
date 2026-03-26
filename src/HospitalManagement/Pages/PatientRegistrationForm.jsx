import { validatePatientRegistration, clearAutoFilledData as modelClearAutoFilledData, getPatientToSave, handlePatientNameChange } from "../Model/ModelPatientRegistration";
import React, { useState, useEffect, useRef } from "react";
import Success from "../Components/Success";
import { useNavigate } from "react-router-dom";
import { createPatient, getPatientPhone, uploadDocument, updatePatient } from "../api/Service";
import PatientNavBar from "../Components/PatientNavBar";
import InsuranceInformation from "../Pages/InsuranceInformation";
import query from "india-pincode-search";
import RegisterPatient from "../Components/RegisterPatient";
// import Success from "../Components/Success"; 

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const documentTypes = ["Aadhar", "PAN", "Driving License"];

const PatientRegistrationForm = () => {
  const [errors, setErrors] = useState({});
  const [showInsurance, setShowInsurance] = useState(false);
  const [showAddPatientInput, setShowAddPatientInput] = useState(false);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [uploadResponse, setUploadResponse] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalPatientData, setOriginalPatientData] = useState(null);
  const [formData, setFormData] = useState({
    patientName: "",
    gender: "",
    email: "",
    state: "",
    dateOfBirth: "",
    contactNumber: "",
    address: "",
    emergencyNumber: "",
    city: "",
    pincode: "",
    country: "",
    patientBloodGroup: "",
    identityDocType: "",
    identityDocNumber: "",
    identityDocLink: "",
    identityDocId: "",
    documentFile: null,
    documentType: "",
    documentTypeOther: "",
    documentNumber: "",
    insurance: {
      insuranceCompany: "",
      insuranceId: "",
      insuranceCompanyContact: "",
      insuranceCompanyEmail: "",
      insuranceDocLink: "",
      insuranceDocId: "",
      status: "ACTIVE",
      stages: "APPLIED"
    },
  });
  const [phonePatientMap, setPhonePatientMap] = useState({});
  const [submitMessage, setSubmitMessage] = useState("");
  const [submitStatus, setSubmitStatus] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [mobile, setMobile] = useState("");

  // Add ref for file input
  const fileInputRef = useRef(null);

  const navigate = useNavigate();

  const [isLoadingPatient, setIsLoadingPatient] = useState(false);
  const [showAutoFillConfirm, setShowAutoFillConfirm] = useState(false);
  const [pendingPatientData, setPendingPatientData] = useState(null);
  const [autoFilledFields, setAutoFilledFields] = useState([]);

  const [showDocModal, setShowDocModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pendingSubmitEvent, setPendingSubmitEvent] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (formData.contactNumber.length !== 10) return;

    setIsLoadingPatient(true);
    getPatientPhone(formData.contactNumber)
      .then((data) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
          setIsLoadingPatient(false);
          setIsEditMode(false);
          setOriginalPatientData(null);
          return;
        }

        if (data.length === 1) {
          const patient = data[0];
          // Store original data for edit mode
          setOriginalPatientData(patient);
          
          // Set form data directly when there's only one patient
          setFormData(prev => ({
            ...prev,
            patientName: patient.patientName || "",
            gender: patient.gender || "",
            email: patient.email || "",
            state: patient.state || "",
            dateOfBirth: patient.dateOfBirth || "",
            address: patient.address || "",
            emergencyNumber: patient.emergencyNumber || "",
            city: patient.city || "",
            pincode: patient.pincode || "",
            country: patient.country || "",
            patientBloodGroup: patient.patientBloodGroup || "",
            documentType: patient.identityDocType || "",
            documentNumber: patient.identityDocNumber || "",
            documentFile: patient.identityDocLink ? {
              name: "Previous Document",
              type: patient.identityDocLink.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
              url: patient.identityDocLink
            } : null,
            insurance: patient.insurances && patient.insurances[0]
              ? {
                  insuranceCompany: patient.insurances[0].insuranceCompany || "",
                  insuranceId: patient.insurances[0].insuranceId || "",
                  insuranceCompanyContact: patient.insurances[0].insuranceCompanyContact || "",
                  insuranceCompanyEmail: patient.insurances[0].insuranceCompanyEmail || "",
                  insuranceDocLink: patient.insurances[0].insuranceDocLink || "",
                  insuranceDocId: patient.insurances[0].insuranceDocId || "",
                  status: patient.insurances[0].status || "ACTIVE",
                  stages: patient.insurances[0].stages || "APPLIED"
                }
              : {
                  insuranceCompany: "",
                  insuranceId: "",
                  insuranceCompanyContact: "",
                  insuranceCompanyEmail: "",
                  insuranceDocLink: "",
                  insuranceDocId: "",
                  status: "ACTIVE",
                  stages: "APPLIED"
                }
          }));

          // Set document preview link
          if (patient.identityDocLink) {
            setDocumentPreview(patient.identityDocLink);
          }

          // Show insurance section if there's insurance data
          if (patient.insurances && patient.insurances[0]) {
            setShowInsurance(true);
          }
        }

        const map = {};
        data.forEach((item) => {
          if (item.contactNumber && item.patientName) {
            if (!map[item.contactNumber]) map[item.contactNumber] = [];
            map[item.contactNumber].push(item.patientName);
          }
        });
        setPhonePatientMap(map);
      })
      .catch((error) => {
        setSubmitMessage("No patient found with this mobile number");
        setSubmitStatus("error");
        setShowToast(true);
        setOriginalPatientData(null);
        setIsEditMode(false);
        setTimeout(() => setShowToast(false), 2000);
      })
      .finally(() => {
        setIsLoadingPatient(false);
      });
  }, [formData.contactNumber]);

  const handleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (!isEditMode) {
      setSubmitMessage("Edit mode enabled - you can now modify address and contact details");
      setSubmitStatus("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else {
      setSubmitMessage("Edit mode disabled");
      setSubmitStatus("success");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const validateBasicInfo = () => {
  const newErrors = validatePatientRegistration(formData);
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Only allow specific file types: jpg, jpeg, png, pdf
    const allowedTypes = [
      "application/pdf",
      "image/jpeg", 
      "image/jpg",
      "image/png"
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        documentFile: "Only JPG, JPEG, PNG, and PDF files are allowed."
      }));
      setFormData((prev) => ({ ...prev, documentFile: null }));
      setDocumentPreview(null);
      setUploadResponse(null);
      setUploadError("");
      return;
    }

    const minSize = 10 * 1024;
    const maxSize = 2 * 1024 * 1024;
    if (file.size < minSize || file.size > maxSize) {
      setErrors((prev) => ({ ...prev, documentFile: "File size must be between 10 KB and 2 MB" }));
      setFormData((prev) => ({ ...prev, documentFile: null }));
      setDocumentPreview(null);
      setUploadResponse(null);
      setUploadError("");
      return;
    }
    setFormData((prev) => ({ ...prev, documentFile: file }));
    setErrors((prev) => ({ ...prev, documentFile: "" }));

    // Upload the document and set the preview to the returned link
    try {
      const uploadRes = await uploadDocument(file, {
        service_name: "new patient",
        custom_folder: "HMS"
      });
      const fileUrl = uploadRes?.uploaded_files?.[0]?.file_url || "";
      const documentId = uploadRes?.uploaded_files?.[0]?.document_id?.toString() || "";
      setDocumentPreview(fileUrl);
      setFormData((prev) => ({
        ...prev,
        documentFile: {
          name: file.name,
          type: file.type,
          url: fileUrl,
          documentId: documentId
        }
      }));
    } catch (err) {
      setDocumentPreview(null);
      setErrors((prev) => ({ ...prev, documentFile: "Error uploading document" }));
      setFormData((prev) => ({ ...prev, documentFile: null }));
      setUploadError(err.message || "Error uploading document");
      alert(err.message || "Error uploading document");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");
    setSubmitStatus("");
    let identityDocLink = "";
    let identityDocId = "";

    // Use uploaded document URL and ID if available
    if (formData.documentFile && formData.documentFile.url) {
      identityDocLink = formData.documentFile.url;
      identityDocId = formData.documentFile.documentId || "";
    } else if (formData.documentFile) {
      // If not uploaded yet, upload now (fallback)
      try {
        const uploadRes = await uploadDocument(formData.documentFile, {
          service_name: "patient",
          custom_folder: "patient_documents"
        });
        identityDocLink = uploadRes?.uploaded_files?.[0]?.file_url || "";
        identityDocId = uploadRes?.uploaded_files?.[0]?.document_id?.toString() || "";
      } catch (err) {
        setSubmitMessage(err.message || "Error uploading document");
        setSubmitStatus("error");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
    }

    if (validateBasicInfo()) {
      try {
        if (isEditMode && originalPatientData) {
          const updatedPatientData = {
            address: formData.address,
            contactNumber: formData.contactNumber,
            emergencyNumber: formData.emergencyNumber,
            pincode: formData.pincode,
            city: formData.city,
            state: formData.state,
            country: formData.country,
          };
          await updatePatient(originalPatientData._id, updatedPatientData);
          // setSubmitMessage("Patient information updated successfully!");
          // setSubmitStatus("success");
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          setIsEditMode(false);
          setOriginalPatientData({
            ...originalPatientData,
            ...updatedPatientData,
          });
        }

        // For new patient registration, create new record
  const patientToSave = getPatientToSave({ formData, identityDocLink, identityDocId, showInsurance });

        const response = await createPatient(patientToSave);
        console.log("API response:", response);
        // setSubmitMessage("Patient registered successfully!");
        // setSubmitStatus("success");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

        // 3. Show Success modal
        setShowSuccessModal(true);

        // Clear ALL form data including document file and preview
        setFormData({
          patientName: "",
          gender: "",
          email: "",
          state: "",
          dateOfBirth: "",
          contactNumber: "",
          address: "",
          emergencyNumber: "",
          city: "",
          pincode: "",
          country: "",
          patientBloodGroup: "",
          documentType: "",
          documentTypeOther: "",
          documentNumber: "",
          documentFile: null, 
          insurance: {
            insuranceCompany: "",
            insuranceId: "",
            insuranceCompanyContact: "",
            insuranceCompanyEmail: "",
            insuranceDocLink: "",
            insuranceDocId: "",
          },
        });
        setDocumentPreview(null);
        setUploadResponse(null);
        setUploadError("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setErrors({});
        setShowAddPatientInput(false);
        setShowInsurance(false);
        setIsEditMode(false);
        setOriginalPatientData(null);
      } catch (error) {
        setSubmitMessage(error.message || "Something went wrong. Please try again later.");
        setSubmitStatus("error");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "pincode") {
      if (/^\d{6}$/.test(value)) {
        try {
          const pinData = query.search(value);
          if (pinData && pinData.length > 0) {
            const firstResult = pinData[0];
            setFormData((prev) => ({
              ...prev,
              pincode: value,
              state: firstResult.state || firstResult.stateName || "",
              city: firstResult.district || firstResult.districtName || firstResult.city || "",
              country: firstResult.country || firstResult.countryName || "India",
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              pincode: value,
              state: "",
              city: "",
              country: "",
            }));
          }
        } catch (error) {
          setFormData((prev) => ({
            ...prev,
            pincode: value,
            state: "",
            city: "",
            country: "",
          }));
        }
      } else {
        setFormData((prev) => ({
          ...prev,
          pincode: value,
          state: "",
          city: "",
          country: "",
        }));
      }
      setErrors((prev) => ({ ...prev, pincode: "" }));
    } else if (name === "dateOfBirth") {
      setFormData((prev) => ({
        ...prev,
        dateOfBirth: value,
      }));
      setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleInsuranceCheckbox = (e) => {
    setShowInsurance(e.target.checked);
  };

  const fetchPatientByMobile = async (mobileNumber) => {
    try {
      const data = await getPatientPhone(mobileNumber);
      if (data && data.length > 0) {
        const patient = data[0];
        setFormData((prev) => ({
          ...prev,
          patientName: patient.patientName || "",
          gender: patient.gender || "",
          email: patient.email || "",
          state: patient.state || "",
          dateOfBirth: patient.dateOfBirth || "",
          address: patient.address || "",
          emergencyNumber: patient.emergencyNumber || "",
          city: patient.city || "",
          pincode: patient.pincode || "",
          country: patient.country || "",
          patientBloodGroup: patient.patientBloodGroup || "",
          // Always leave these blank
          documentType: "",
          documentTypeOther: "",
          documentNumber: "",
          documentFile: null,
        }));
      }
    } catch (error) {
      // handle error
    }
  };

  const handleMobileBlur = (e) => {
    const value = e.target.value;
    setMobile(value);
    if (value.length === 10) {
      fetchPatientByMobile(value);
    }
  };

  // Removed unused handleAutoFillConfirm function to fix the error

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setSubmitMessage("");
        setSubmitStatus("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Removed unused clearAutoFilledData function to fix the error

  const handleViewDocument = async () => {
    const response = await fetch(documentPreview, { credentials: 'include' });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  const handlePatientNameChangeWrapper = (e) => {
    handlePatientNameChange({
      value: e.target.value,
      formData,
      setFormData,
      setShowAddPatientInput,
      setDocumentPreview,
      setErrors,
      fileInputRef,
      setShowInsurance,
      getPatientPhone
    });
  };

  const handleConfirmRegister = () => {
    setShowRegisterModal(false);
    // Call your existing handleSubmit logic here, or move the code from handleSubmit here
    handleSubmit(pendingSubmitEvent);
  };

  return (
    <div className="max-w-9xl bg-white rounded-lg shadow border border-gray-200 mx-auto" style={{ minHeight: "auto"}}>
      <PatientNavBar currentPage="registration" />
      {/* Success/Error Toast Message */}
      {showToast && submitMessage && (
        <div
          className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg font-semibold
            ${submitStatus === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}
          `}
          style={{ minWidth: 250, textAlign: "center" }}
        >
          {submitMessage}
        </div>
      )}

      <form
        onSubmit={e => {
          e.preventDefault();
          setPendingSubmitEvent(e);
          setShowRegisterModal(true);
        }}
        className="w-full max-w-7xl bg-white rounded-xl border border-blue-200 shadow-md flex flex-col"
      >
        {isEditMode && (
          <div className="">
            {/* <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-800 font-medium">Edit Mode Active</span>
                <span className="text-yellow-700 text-sm">You can now modify address and contact details</span>
              </div>
            </div> */}
          </div>
        )}
        <div className="px-4 pt-4 pb-6 bg-blue-200 rounded-t-xl">
          <h2 className="text-lg font-bold text-blue-700 text-center tracking-wide">
            Patient Registration
          </h2>
        </div>
        <div className="flex flex-col gap-2 p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col justify-end">
              <label className="text-sm font-medium mb-1 flex items-center gap-2">
                <span>Mobile Number</span>
                <span className="text-red-600 text-sm">*</span>
                {originalPatientData && formData.patientName && phonePatientMap[formData.contactNumber] && phonePatientMap[formData.contactNumber].includes(formData.patientName) && (
                  <button
                    type="button"
                    onClick={handleEditMode}
                    className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      isEditMode 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Edit
                  </button>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="contactNumber"
                  placeholder="Enter phone number"
                  value={formData.contactNumber}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData(prev => ({ ...prev, contactNumber: value }));
                    setOriginalPatientData(null);
                    setIsEditMode(false);
                  }}
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[1-9][0-9]{9}"
                  className="w-full border border-gray-300 p-2 rounded-lg bg-gray-100 text-gray-700"
                  required
                />
              </div>
              {errors.contactNumber && (
                <span className="text-red-500 text-sm mt-1">{errors.contactNumber}</span>
              )}
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-sm font-medium mb-1">Patient Name</label>
              <div className="space-y-2">
                {phonePatientMap[formData.contactNumber] && phonePatientMap[formData.contactNumber].length > 0 && !showAddPatientInput ? (
                  <select
                    name="patientName"
                    value={formData.patientName}
                    onChange={handlePatientNameChangeWrapper}
                    className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Registered Patient</option>
                    {phonePatientMap[formData.contactNumber]?.map((name, idx) => (
                      <option key={idx} value={name}>
                        {name}
                      </option>
                    ))}
                    <option value="+add">+ Add New Patient</option>
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      name="patientName"
                      placeholder="Enter patient name"
                      value={formData.patientName}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-2 rounded-lg bg-gray-100 text-gray-700"
                      required
                    />
                    {phonePatientMap[formData.contactNumber] && phonePatientMap[formData.contactNumber].length > 0 && showAddPatientInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddPatientInput(false);
                          setFormData(prev => ({ ...prev, patientName: "" }));
                          setDocumentPreview(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                      >
                        Back to List
                      </button>
                    )}
                  </div>
                )}
              </div>
              {errors.patientName && (
                <span className="text-red-500 text-sm mt-1">{errors.patientName}</span>
              )}
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-sm font-medium mb-1 flex items-center">
                <span>Emergency Mobile Number</span>
              </label>
              <input
                type="text"
                name="emergencyNumber"
                placeholder="Enter emergency contact"
                value={formData.emergencyNumber}
                onChange={handleChange}
                maxLength={10}
                inputMode="numeric"
                pattern="[1-9][0-9]{9}"
                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-700"
                required
              />
              {errors.emergencyNumber && (
                <span className="text-red-500 text-sm mt-1">{errors.emergencyNumber}</span>
              )}
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-700"
                required
              />
              {errors.email && (
                <span className="text-red-500 text-sm mt-1">{errors.email}</span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Address"
              name="address"
              placeholder="Full address"
              value={formData.address}
              onChange={handleChange}
              error={errors.address}
              className={'bg-gray-100 text-gray-700'}
            />
            <InputField
              label="Pin Code"
              name="pincode"
              placeholder="Enter pin code"
              value={formData.pincode}
              onChange={handleChange}
              type="text"
              pattern="[0-9]{6}"
              maxLength={6}
              inputMode="numeric"
              className={'bg-gray-100 text-gray-700'}
            />
            <div className="flex flex-col justify-end">
              <label className="text-sm font-medium mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={'border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-700'}
                placeholder="City"
                tabIndex={-1}
              />
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-sm font-medium mb-1">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={'border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-700'}
                placeholder="State"
                tabIndex={-1}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <InputField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              placeholder="DD - MM - YYYY"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
              className={'bg-gray-100 text-gray-700'}
            />
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <span className="text-red-500 text-sm mt-1">{errors.gender}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Blood Group</label>
              <select
                name="patientBloodGroup"
                value={formData.patientBloodGroup}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select blood group</option>
                {bloodGroups.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
              {errors.patientBloodGroup && (
                <span className="text-red-500 text-sm mt-1">{errors.patientBloodGroup}</span>
              )}
            </div>
            <div className="flex flex-col justify-end">
              <label className="text-sm font-medium mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                className={'border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-700'}
                placeholder="Country"
                tabIndex={-1}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Document Type with "Other" option */}
            <div className="flex flex-col relative">
              <label className="text-sm font-medium mb-1">Document Type</label>
              {formData.documentType === "Other Document" ? (
                <input
                  type="text"
                  name="documentTypeOther"
                  placeholder="Enter document type"
                  value={formData.documentTypeOther}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-lg bg-gray-100 text-gray-700"
                  required
                />
              ) : (
                <select
                  name="documentType"
                  value={formData.documentType}
                  onChange={handleChange}
                  className="border border-gray-300 p-2 rounded-lg bg-gray-100 text-gray-700"
                  required
                >
                  <option value="">Select Document Type</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  <option value="Other Document">Other Document</option>
                </select>
              )}
              {errors.documentType && (
                <span className="text-red-500 text-sm mt-1">{errors.documentType}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Document Number</label>
              <input
                type="text"
                name="documentNumber"
                placeholder="Enter document number"
                value={formData.documentNumber}
                onChange={handleChange}
                className="border border-gray-300 p-2 rounded-lg bg-gray-100 text-gray-700"
                required
              />
              {errors.documentNumber && (
                <span className="text-red-500 text-sm mt-1">{errors.documentNumber}</span>
              )}
            </div>
            {/* Align Upload and Preview fields horizontally and visually */}
            <div className="col-span-1 lg:col-span-2 grid grid-cols-2 gap-4 items-start">
              <div className="flex flex-col justify-start w-full">
                <label className="text-sm font-medium mb-1">Upload Document</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleDocumentUpload}
                  className="border border-gray-300 p-2 rounded-lg bg-gray-100 text-gray-700 h-[42px]"
                  required
                />
                {errors.documentFile && (
                  <span className="text-red-500 text-sm mt-1">{errors.documentFile}</span>
                )}
                <span className="text-xs text-gray-500 mt-1">Allowed: JPG, JPEG, PNG, PDF (10KB - 2MB)</span>
              </div>
              <div className="flex flex-col justify-end w-full">
                {documentPreview ? (
                  <div className="border border-gray-300 rounded-lg p-2 h-[42px] flex items-center w-full mt-6">
                    <button
                      type="button"
                      onClick={() => setShowDocModal(true)}
                      className="text-blue-600 hover:text-blue-800 underline flex items-center cursor-pointer gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" >
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      preview Document
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-[42px] border border-dashed border-gray-300 rounded-lg px-3 flex items-center justify-center mt-6">
                    <span className="text-gray-400 text-xs w-full text-center">No document uploaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center px-6 pb-2 mt-*">
          <input
            type="checkbox"
            id="showInsurance"
            checked={showInsurance}
            onChange={handleInsuranceCheckbox}
            className="mr-2 accent-blue-600 w-4 h-4"
          />
          <label htmlFor="showInsurance" className="text-sm font-medium select-none cursor-pointer">
            Add Insurance Information
          </label>
        </div>
        {showInsurance && (
          <div className="mb-4 px-4 mt-*">
            <InsuranceInformation
              formData={formData}
              setFormData={setFormData}
              errors={errors}
            />
          </div>
        )}
        
        <div className="bg-blue-200  px-6 py-6 pt-6 pb-4 flex flex-col sm:flex-row justify-end gap-4  rounded-b-xl">
          <button
            className="w-full sm:w-auto px-12 py-2 bg-blue-700 text-white rounded-lg font-semibold cursor-pointer  border-blue-600 shadow transition"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-4 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-red-600 text-2xl"
              onClick={() => setShowDocModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="w-full h-[70vh] flex items-center justify-center">
              {documentPreview.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={documentPreview}
                  title="Document"
                  className="w-full h-full rounded"
                />
              ) : (
                <img
                  src={documentPreview}
                  alt="Document Preview"
                  className="max-h-[65vh] max-w-full rounded object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
      <RegisterPatient
        open={showRegisterModal}
        onCancel={() => setShowRegisterModal(false)}
        onConfirm={handleConfirmRegister}
      />
      {/* 4. Render Success modal */}
      {/* Define title/message/onContinue so the provided snippet works unchanged */}
      {showSuccessModal && (
        (() => {
          const title = "Patient Registered";
          const message = "The patient has been registered successfully.";
          const onContinue = () => setShowSuccessModal(false);

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black opacity-40" onClick={onContinue} />
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 z-10">
                <h3 className="text-2xl font-semibold text-blue-600 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 mb-6">{message}</p>
                <div className="flex justify-end">
                  <button
                    onClick={onContinue}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
};

const InputField = ({ label, name, type = "text", list, error, className = "", ...props }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">{label}</label>
    <input
      type={type}
      name={name}
      list={list}
      className={`border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${error ? "border-red-400" : ""} ${className}`}
      {...props}
    />
    {error && (
      <span className="text-red-500 text-sm mt-1">{error}</span>
    )}
  </div>
);

export default PatientRegistrationForm;