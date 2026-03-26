import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPatient, uploadDocument } from '../api/Service';

const InsuranceInformation = ({ formData = { insurance: {} }, setFormData = () => { }, errors = {} }) => {
  const navigate = useNavigate();
  const insurance = formData.insurance || {};
  const [insuranceDocPreview, setInsuranceDocPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);

  const handleChange = (e) => {
    let { name, value } = e.target;

    // Add validation for Insurance Contact Number: only numbers, max 10 digits, not starting with 0
    if (name === "insuranceCompanyContact") {
      value = value.replace(/\D/g, "");
      if (value.length > 10) value = value.slice(0, 10);
      if (value.length > 0 && value[0] === "0") value = value.slice(1);
    }

    setFormData((prev) => ({
      ...prev,
      insurance: {
        ...((prev && prev.insurance) || {}),
        [name]: value,
      },
    }));
  };

  // // Complete the validateInsuranceEmail function
  // const validateInsuranceEmail = (email) => {
  //   return (
  //     !!email &&
  //     /^(?!.*\.\.)(?!.*\.$)[^\W][\w.-]{0,29}@[A-Za-z0-9][A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email) &&
  //     email.length <= 320 &&
  //     email.includes("@") &&
  //     !email.startsWith(".") &&
  //     !email.endsWith(".") &&
  //     email.split("@")[0].length <= 64 &&
  //     (email.split("@")[1] || "").length <= 255
  //   );
  // };

  // Handle insurance document upload with improved error handling and debugging
  const handleInsuranceDocUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation
    const minSize = 10 * 1024; // 10KB
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (file.size < minSize) {
      clearDocumentData();
      alert("File size must be at least 10 KB");
      e.target.value = ''; // Clear the input
      return;
    }

    if (file.size > maxSize) {
      clearDocumentData();
      alert("File size must not exceed 2 MB");
      e.target.value = ''; // Clear the input
      return;
    }

    // Only allow specific file types: jpg, jpeg, png, pdf
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png'
    ];
    if (!allowedTypes.includes(file.type)) {
      clearDocumentData();
      alert("Only JPG, JPEG, PNG, and PDF files are allowed.");
      e.target.value = ''; // Clear the input
      return;
    }

    setIsUploading(true);

    // Validate required DMS parameters
    const service_name = "new patient";
    const doctype = "POI";
    const doc_name = "identity proof";
    if (!service_name || !doctype || !doc_name) {
      clearDocumentData();
      alert("DMS upload error: Required DMS parameters are missing. Please contact admin.");
      setIsUploading(false);
      return;
    }

    try {
      // Use the new uploadDocument API function
      const uploadRes = await uploadDocument(file, {
        service_name,
        doctype,
        doc_name,
        user_id: 5,
        document_name: file.name,
        ref: "DMS",
        custom_folder: "Default"
      });

      console.log("Upload response:", uploadRes);

      const uploadedFile = uploadRes?.uploaded_files?.[0];
      const insuranceDocLink = uploadedFile?.file_url || "";
      const insuranceDocId = uploadedFile?.document_id?.toString() || "";

      setFormData((prev) => ({
        ...prev,
        insurance: {
          ...((prev && prev.insurance) || {}),
          insuranceDocumentFile: file,
          insuranceDocumentUrl: insuranceDocLink, // for preview
          insuranceDocumentId: insuranceDocId,   // for reference
          insuranceDocLink: insuranceDocLink,    // for backend/modal
          insuranceDocId: insuranceDocId,        // for backend/modal
          insuranceDocumentName: file.name,
        },
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        setInsuranceDocPreview(ev.target.result);
      };
      reader.readAsDataURL(file);

      console.log("Document uploaded successfully");

    } catch (error) {
      console.error("Document upload failed:", error); 
      clearDocumentData();
      // Show the actual error message from the API if available
      let errorMessage = error.message || "Failed to upload document. Please try again.";
      alert(errorMessage);
      e.target.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  // Helper function to clear document data
  const clearDocumentData = () => {
    setFormData((prev) => ({
      ...prev,
      insurance: {
        ...((prev && prev.insurance) || {}),
        insuranceDocumentFile: null,   // always blank
        insuranceDocLink: "",          // always blank
        insuranceDocumentName: "",     // always blank
        insuranceDocId: "",            // always blank
      },
    }));
    setInsuranceDocPreview(null);      // clear preview
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!insurance.insuranceCompany) {
      alert("Please enter insurance company name");
      return;
    }
    if (!insurance.insuranceDocumentFile) {
      alert("Please upload an insurance document");
      return;
    }

    try {
      // Prefer already-uploaded info; otherwise upload now using centralized API
      let insuranceDocLink = insurance.insuranceDocLink || "";
      let insuranceDocId = insurance.insuranceDocId || "";

      // If a file exists but hasn't been uploaded yet, upload via Service.uploadDocument
      if (insurance.insuranceDocumentFile && !insuranceDocLink) {
        setIsUploading(true);
        try {
          const uploadRes = await uploadDocument(insurance.insuranceDocumentFile, {
            service_name: "new patient",
            doctype: "POI",
            doc_name: "identity proof",
            user_id: 1,
            document_name: insurance.insuranceDocumentFile.name,
            ref: "DMS",
            custom_folder: "Default",
          });

          const uploadedFile = uploadRes?.uploaded_files?.[0];
          insuranceDocLink = uploadedFile?.file_url || "";
          insuranceDocId = uploadedFile?.document_id?.toString() || "";
        } catch (err) {
          console.error("Document upload failed:", err);
          alert(err.message || "Failed to upload document. Please try again.");
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const patientToSave = {
        ...formData,
        insurances: formData.insurance.insuranceCompany
          ? [
              {
                insuranceCompany: formData.insurance.insuranceCompany,
                insuranceId: formData.insurance.insuranceId,
                insuranceCompanyContact: formData.insurance.insuranceCompanyContact,
                insuranceCompanyEmail: formData.insurance.insuranceCompanyEmail,
                insuranceDocLink,
                insuranceDocId,
                status: "ACTIVE",
                stages: "APPLIED",
              },
            ]
          : [],
      };
      delete patientToSave.insurance;

      console.log("Submitting patient data:", patientToSave);
      await createPatient(patientToSave);
      alert("Insurance information submitted successfully!");

      // Clear UI fields (keep preview if desired)
      setFormData((prev) => ({
        ...prev,
        insurance: {
          ...((prev && prev.insurance) || {}),
          insuranceCompany: "",
          insuranceId: "",
          insuranceCompanyContact: "",
          insuranceCompanyEmail: "",
        },
      }));

      navigate("/HospitalManagement/patient-details");
    } catch (error) {
      console.error("Submission failed:", error);
      alert(error.message || "Failed to submit insurance information.");
    }
  };

  const insuranceList = formData.insuranceList; 

  // const handleMobileChange = (e) => {
  //   const value = e.target.value.replace(/\D/g, '').slice(0, 10);
  //   setFormData(prev => ({
  //     ...prev,
  //     contactNumber: value,
  //     insurance: {
  //       insuranceCompany: "",
  //       insuranceId: "",
  //       insuranceCompanyContact: "",
  //       insuranceCompanyEmail: "",
  //       insuranceDocLink: "",
  //       insuranceDocId: "",
  //       status: "ACTIVE",
  //       stages: "APPLIED"
  //     }
  //   }));
  // };

  return (
    <div>
      <div className="max-w-6xl bg-white rounded-xl flex flex-col">
        <div className="mb-4 px-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Insurance Company Name</label>
              <input
                type="text"
                name="insuranceCompany"
                placeholder="Enter insurance company"
                value={insurance.insuranceCompany || ""}
                onChange={handleChange}
                maxLength={50}
                required
                className="bg-gray-100 text-gray-700 border border-gray-300 rounded-lg h-[44px] px-4 focus:outline-none focus:ring-0 w-full"
              />
              {errors.insuranceCompany && (
                <span className="text-red-500 text-sm mt-1">{errors.insuranceCompany}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Insurance ID</label>
              <input
                type="text"
                name="insuranceId"
                placeholder="Enter insurance id"
                value={insurance.insuranceId || ""}
                onChange={handleChange}
                maxLength={50}
                required
                className="bg-gray-100 text-gray-700 border border-gray-300 rounded-lg h-[44px] px-4 focus:outline-none focus:ring-0 w-full"
              />
              {errors.insuranceId && (
                <span className="text-red-500 text-sm mt-1">{errors.insuranceId}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Insurance Contact Number</label>
              <input
                type="text"
                name="insuranceCompanyContact"
                placeholder="Insurance contact number"
                value={insurance.insuranceCompanyContact || ""}
                onChange={handleChange}
                maxLength={10}
                required
                className="bg-gray-100 text-gray-700 border border-gray-300 rounded-lg h-[44px] px-4 focus:outline-none focus:ring-0 w-full"
              />
              {errors.insuranceCompanyContact && (
                <span className="text-red-500 text-sm mt-1">{errors.insuranceCompanyContact}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-1">Insurance Company Email</label>
              <input
                type="email"
                name="insuranceCompanyEmail"
                placeholder="Enter insurance email"
                value={insurance.insuranceCompanyEmail || ""}
                onChange={handleChange}
                required
                className="bg-gray-100 text-gray-700 border border-gray-300 rounded-lg h-[44px] px-4 focus:outline-none focus:ring-0 w-full"
              />
              {errors.insuranceCompanyEmail && (
                <span className="text-red-500 text-sm mt-1">{errors.insuranceCompanyEmail}</span>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Upload Document</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleInsuranceDocUpload}
              className="border border-gray-300 rounded-lg bg-gray-100 text-gray-700 h-[44px] px-4 w-full"
              required
            />
            <span className="text-xs text-gray-500 mt-1">Allowed: JPG, JPEG, PNG, PDF (10KB - 2MB)</span>
          </div>
          <div className="flex flex-col justify-end">
            <label className="text-sm font-medium mb-1 invisible">Preview</label>
            {insurance.insuranceDocLink ? (
              <div className="border border-gray-300 rounded-lg p-2 h-[44px] flex items-center w-full mb-5">
                <button
                  type="button"
                  onClick={() => setShowDocModal(true)}
                  className="text-blue-600 hover:text-blue-800 underline flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" >
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  preview Document
                </button>
              </div>
            ) : (
              <div className="w-full h-[44px] border border-dashed border-gray-300 rounded-lg px-3 flex items-center justify-center mb-5">
                <span className="text-gray-400 text-xs w-full text-center">No document uploaded</span>
              </div>
            )}
          </div>
          <div></div>
          <div></div>
        </div>
      </div>

      {/* Insurance List Display */}
      <div className="mt-2">
        {(insuranceList || []).map((insurance, idx) => (
          <div key={idx} className="p-2 border rounded mb-1">
            {insurance.name || insurance.insuranceCompany}
          </div>
        ))}
      </div>
      {/* Modal for document preview */}
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
            <div className="w-full h-[70vh] flex.
            3">
              {insurance.insuranceDocLink && insurance.insuranceDocLink.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={insurance.insuranceDocLink}
                  title="Document"
                  className="w-full h-full rounded"
                />
              ) : (
                <img
                  src={insurance.insuranceDocLink}
                  alt="Document Preview"
                  className="max-h-[65vh] max-w-full rounded object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable input field component
const InputField = ({ label, name, type = "text", error, placeholder, required, ...props }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium mb-1">
      {label} {required && <span className="text-red-500"></span>}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition h-[42px]"
      {...props}
    />
    {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
  </div>
);

export default InsuranceInformation;

