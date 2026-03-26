import { PatientDetailsModal, InsuranceDetailsModal, EditPatientModal } from "../Model/ModelPatientDetails";
import React, { useEffect, useState, useRef } from "react";
import * as api from "../api/Service";
import PatientNavBar from "../Components/PatientNavBar";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import axios from "axios";
import { FaPen } from "react-icons/fa"; 
import Swal from 'sweetalert2';
import { Eye } from "lucide-react";

const PAGE_SIZE = 11;

const PatientDetails = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [docUrl, setDocUrl] = useState(null);
  const [editPatient, setEditPatient] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [documentUploadError, setDocumentUploadError] = useState("");
  const [documentUploadSuccess, setDocumentUploadSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Insurance document upload state
  const [insuranceDocUploading, setInsuranceDocUploading] = useState(false);
  const [insuranceDocUploadError, setInsuranceDocUploadError] = useState("");
  const [insuranceDocUploadSuccess, setInsuranceDocUploadSuccess] = useState("");
  const insuranceFileInputRef = useRef(null);

  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    const fetchPatients = async () =>{
      try {
        const data = await api.getPatients();
        console.log("Fetched patients:", data);
        setPatients(data);
      } catch {
        setPatients([]);
      }
    };
    fetchPatients();
  }, []);

  const filteredPatients = patients.filter((patient) => {
    const q = search.toLowerCase();
    const insuranceCompany =
      Array.isArray(patient.insurances) && patient.insurances.length > 0 && patient.insurances[0].insuranceCompany
        ? patient.insurances[0].insuranceCompany.toLowerCase()
        : "";
    return (
      patient.patientName?.toLowerCase().includes(q) ||
      patient.contactNumber?.toLowerCase().includes(q) ||
      patient.email?.toLowerCase().includes(q) ||
      insuranceCompany.includes(q)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE);
  const paginatedPatients = filteredPatients.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  // Removed unused handlePageInput function

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleClosePatientModal = () => setSelectedPatient(null);
  const handleCloseInsuranceModal = () => setSelectedInsurance(null);



  // Download all filtered patients as Excel
  const handleDownloadAllExcel = () => {
    const data = filteredPatients.map((patient) => ({
      "Patient ID": patient.patientId,
      "Patient Name": patient.patientName,
      "Gender": patient.gender,
      "Date of Birth": patient.dateOfBirth,
      "Phone No.": patient.contactNumber,
      "Emergency No.": patient.emergencyNumber,
      "Email": patient.email,
      "Address": patient.address,
      "City": patient.city,
      "State": patient.state,
      "Pin Code": patient.pincode,
      "Blood Group": patient.patientBloodGroup,
      "Insurance Company": Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.insuranceCompany).join(", ")
        : "",
      "Insurance ID": Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.insuranceId).join(", ")
        : "",
      "Insurance Contact Number": Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.insuranceCompanyContact).join(", ")
        : "",
      "Insurance Company Email": Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.insuranceCompanyEmail).join(", ")
        : "",
      "Insurance Status": Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.status).join(", ")
        : "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(wb, "all_patients.xlsx");
  };

  // Download all filtered patients as PDF
  const handleDownloadAllPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4"
    });
    doc.text("All Patient Details", 40, 30);
    const tableColumn = [
      "Patient ID",
      "Patient Name",
      "Gender",
      "Date of Birth",
      "Phone No.",
      "Emergency No.",
      "Email",
      "Address",
      "City",
      "State",
      "Pin Code",
      "Blood Group",
      "Insurance Company",
      "Insurance ID",
      "Insurance Contact Number",
      "Insurance Company Email",
      "Insurance Status"
    ];

    const tableRows = filteredPatients.map((patient) => [
      patient.patientName,
      patient.gender,
      patient.dateOfBirth,
      patient.contactNumber,
      patient.emergencyNumber,
      patient.email,
      patient.address,
      patient.city,
      patient.state,
      patient.pincode,
      patient.patientBloodGroup,
      Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.insuranceCompany).join(", ")
        : "",
      Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.insuranceId).join(", ")
        : "",
      Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.insuranceCompanyContact).join(", ")
        : "",
      Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.insuranceCompanyEmail).join(", ")
        : "",
      Array.isArray(patient.insurances) && patient.insurances.length > 0
        ? patient.insurances.map((ins) => ins.status).join(", ")
        : "",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: 20, right: 20 },
      tableWidth: "auto"
    });

    // Add page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    }

    doc.save("all_patients.pdf");
  };

  // Validation for edit form
  const validateEditForm = (fields = editForm) => {
    const errors = {};
    if (!fields.patientName || fields.patientName.trim().length < 2) {
      errors.patientName = "Patient name is required (min 2 chars)";
    }
    if (!fields.email) {
      errors.email = "Email is required";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(fields.email)
    ) {
      errors.email = "Please enter a valid email address";
    }
    if (!fields.gender) {
      errors.gender = "Gender is required";
    }
    if (!fields.dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required";
    }
    if (!fields.address) {
      errors.address = "Address is required";
    }
    if (!fields.city) {
      errors.city = "City is required";
    }
    if (!fields.state) {
      errors.state = "State is required";
    }
    if (!fields.pincode || !/^\d{6}$/.test(fields.pincode)) {
      errors.pincode = "Pin code must be 6 digits";
    }
    if (!fields.country) {
      errors.country = "Country is required";
    }
    if (!fields.patientBloodGroup) {
      errors.patientBloodGroup = "Blood group is required";
    }
    if (!fields.identityDocType) {
      errors.identityDocType = "Identity document type is required";
    }
    if (!fields.identityDocNumber) {
      errors.identityDocNumber = "Identity document number is required";
    }
    // Insurance validations if insurance exists
    if (fields.insurances && fields.insurances.length > 0) {
      const ins = fields.insurances[0];
      if (!ins.insuranceCompany) {
        errors.insuranceCompany = "Insurance company is required";
      }
      if (ins.insuranceCompanyEmail && (
        !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(ins.insuranceCompanyEmail)
      )) {
        errors.insuranceCompanyEmail = "Enter a valid insurance email";
      }
      if (ins.insuranceCompanyContact && !/^[1-9][0-9]{9}$/.test(ins.insuranceCompanyContact)) {
        errors.insuranceCompanyContact = "Insurance contact must be 10 digits and not start with 0";
      }
      if (!ins.insuranceId) {
        errors.insuranceId = "Insurance ID is required";
      }
      if (!ins.status) {
        errors.status = "Insurance status is required";
      }
      if (!ins.stages) {
        errors.stages = "Insurance stage is required";
      }
    }
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open edit modal
  const handleEdit = (patient) => {
    setEditPatient(patient);
    setEditForm({ ...patient });
    setEditErrors({});
    setTouched({});
    setSuccessMsg("");
    setIsEditMode(false); // Ensure it's false when opening for editing
  };

  // Handle form changes
  const handleEditChange = async (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateEditForm({ ...editForm, [name]: value });

    if (name === "pincode" && value.length === 6 && /^\d{6}$/.test(value)) {
      setPincodeLoading(true);
      try {
        // Use a public pincode API (India example)
        const res = await axios.get(`https://api.postalpincode.in/pincode/${value}`);
        const data = res.data && res.data[0];
        if (data && data.Status === "Success" && data.PostOffice && data.PostOffice.length > 0) {
          const post = data.PostOffice[0];
          setEditForm((prev) => ({
            ...prev,
            city: post.District || "",
            state: post.State || "",
            country: post.Country || "",
          }));
        }
      } catch {
        // Optionally show error or clear fields
      }
      setPincodeLoading(false);
    }
  };

  // Handle insurance field changes
  const handleEditInsuranceChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      insurances: [
        {
          ...((prev.insurances && prev.insurances[0]) || {}),
          [name]: value,
        },
      ],
    }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    const ins = {
      ...((editForm.insurances && editForm.insurances[0]) || {}),
      [name]: value,
    };
    validateEditForm({ ...editForm, insurances: [ins] });
  };

  // Save edited patient
  const handleEditSave = async () => {
    console.log("handleEditSave called");
    // if (!validateEditForm()) return; // Temporarily disable validation for debugging
    setLoading(true);
    try {
      const updatedPatient = await api.updatePatient(editForm);

      // Try to match by both id and patientId
      setPatients((prev) =>
        prev.map((p) =>
          (p.patientId && updatedPatient.patientId && p.patientId === updatedPatient.patientId) ||
          (p.id && updatedPatient.id && p.id === updatedPatient.id)
            ? { ...p, ...updatedPatient }
            : p
        )
      );
      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Patient details updated successfully!',
        timer: 1500,
        showConfirmButton: false
      });
      setTimeout(() => {
        setEditPatient(null);
        setSuccessMsg("");
      }, 1200);
    } catch {
      setSuccessMsg("");
      alert("Failed to update patient.");
    }
    setLoading(false);
  };

  // Document upload handler for identity doc
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
      setDocumentUploadError("Only JPG, JPEG, PNG, and PDF files are allowed.");
      return;
    }

    setDocumentUploading(true);
    setDocumentUploadError("");
    setDocumentUploadSuccess("");
    try {
      const dmsRes = await api.uploadDocument(file, {
        service: "patient",
        document_name: file.name,
        custom_folder: "PatientDocs",
      });
      const docLink = dmsRes?.data?.[0]?.document_url || dmsRes?.data?.[0]?.url || "";
      const docId = dmsRes?.data?.[0]?.document_id || dmsRes?.data?.[0]?.id || "";
      setEditForm((prev) => ({
        ...prev,
        identityDocLink: docLink,
        identityDocId: docId,
      }));
      setDocumentUploadSuccess("Document uploaded successfully!");
    } catch {
      setDocumentUploadError("Failed to upload document.");
    }
    setDocumentUploading(false);
  };

  // Insurance document upload handler
  const handleInsuranceDocumentUpload = async (e) => {
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
      setInsuranceDocUploadError("Only JPG, JPEG, PNG, and PDF files are allowed.");
      return;
    }

    setInsuranceDocUploading(true);
    setInsuranceDocUploadError("");
    setInsuranceDocUploadSuccess("");
    try {
      const dmsRes = await api.uploadDocument(file, {
        service: "insurance",
        document_name: file.name,
        custom_folder: "InsuranceDocs",
      });
      const docLink = dmsRes?.data?.[0]?.document_url || dmsRes?.data?.[0]?.url || "";
      const docId = dmsRes?.data?.[0]?.document_id || dmsRes?.data?.[0]?.id || "";
      setEditForm((prev) => ({
        ...prev,
        insurances: [
          {
            ...((prev.insurances && prev.insurances[0]) || {}),
            insuranceDocLink: docLink,
            insuranceDocId: docId,
          },
        ],
      }));
      setInsuranceDocUploadSuccess("Insurance document uploaded successfully!");
    } catch {
      setInsuranceDocUploadError("Failed to upload insurance document.");
    }
    setInsuranceDocUploading(false);
  };

  return (
    <div className="bg-[#fcfcf7]">
      {/* PatientNavBar always visible */}
      <PatientNavBar
        search={search}
        setSearch={setSearch}
        currentPage="details"
        handleDownloadAllExcel={handleDownloadAllExcel}
        handleDownloadAllPDF={handleDownloadAllPDF}
      />

      {/* Table - updated UI: sticky header, table-auto, spacer row, pagination below table */}
      <div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mt-2">
        <div className="">
          <table className="min-w-full text-sm">
            <thead className="font-medium text-black border-b border-black">
              <tr className="h-12">
                <th className="px-3 py-3 text-left">Patient ID</th>
                <th className="px-3 py-3 text-left">Patient Name</th>
                <th className="px-3 py-3 text-left">Phone No.</th>
                <th className="px-3 py-3 text-left">Email</th>
                <th className="px-3 py-3 text-left">Insurance Company</th>
                <th className="px-3 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="bg-white"></td>
              </tr>

              {paginatedPatients.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-gray-400">
                    No patients found.
                  </td>
                </tr>
              )}

              {paginatedPatients.map((patient, idx) => (
                <tr
                  key={patient.id || idx}
                  className="h-10 border-b transition hover:bg-gray-50 odd:bg-white even:bg-blue-100"
                >
                  <td className="px-2 py-2">{patient.patientId || '-'}</td>
                  <td
                    className="px-2 py-2 text-blue-700 cursor-pointer"
                    onClick={() => setSelectedPatient(patient)}
                  >
                    {patient.patientName}
                  </td>
                  <td className="px-2 py-2">{patient.contactNumber || '-'}</td>
                  <td className="px-2 py-2">{patient.email || '-'}</td>
                  <td className="px-2 py-2">
                    {Array.isArray(patient.insurances) && patient.insurances.length > 0
                      ? patient.insurances.map((ins, i) => (
                        <div
                          key={i}
                          className="text-blue-700 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInsurance(ins);
                          }}
                        >
                          {ins.insuranceCompany}
                        </div>
                      ))
                      : "-"}
                  </td>
                  <td className="px-2 py-2">
                    <button
                      className="flex gap-1 items-center text-blue-600 cursor-pointer hover:text-blue-800"
                      onClick={() => handleEdit(patient)}
                      title="Edit"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex gap-2 justify-center items-center mt-2 mb-4 text-xs">
              <button
                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${page === 1 || totalPages === 1 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
                onClick={handlePrev}
                disabled={page === 1 || totalPages === 1}
                aria-label="Previous page"
              >
                <span className="text-lg">&lt;</span>
              </button>
              <button
                className={`flex justify-center items-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg`}
                style={{ boxShadow: "0 2px 8px 0 rgba(24, 144, 255, 0.08)" }}
                disabled
              >
                {paginatedPatients.length === 0 ? 0 : page}
              </button>
              <span className="mx-1 font-semibold text-black">of</span>
              <button
                className={`flex justify-center items-center w-8 h-8 font-bold text-blue-600 bg-white rounded-lg border border-blue-500`}
                style={{ boxShadow: "0 2px 8px 0 rgba(24, 144, 255, 0.08)" }}
                disabled
              >
                {paginatedPatients.length === 0 ? 0 : totalPages}
              </button>
              <button
                className={`w-8 h-8 flex items-center justify-center rounded-lg border ${page === totalPages || totalPages === 1 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
                onClick={handleNext}
                disabled={page === totalPages || totalPages === 1}
                aria-label="Next page"
              >
                <span className="text-lg">&gt;</span>
              </button>
            </div>
          )}
        </div>
      </div>

  <PatientDetailsModal 
    selectedPatient={selectedPatient} 
    handleClosePatientModal={handleClosePatientModal} 
    setDocUrl={setDocUrl} 
  />

  <EditPatientModal
    editPatient={editPatient}
    handleCloseEditModal={() => setEditPatient(null)}
    isEditMode={isEditMode}
    setIsEditMode={setIsEditMode}
    editForm={editForm}
    touched={touched}
    editErrors={editErrors}
    handleEditChange={handleEditChange}
    handleEditInsuranceChange={handleEditInsuranceChange}
    fileInputRef={fileInputRef}
    documentUploading={documentUploading}
    handleDocumentUpload={handleDocumentUpload}
    documentUploadError={documentUploadError}
    documentUploadSuccess={documentUploadSuccess}
    insuranceFileInputRef={insuranceFileInputRef}
    insuranceDocUploading={insuranceDocUploading}
    handleInsuranceDocumentUpload={handleInsuranceDocumentUpload}
    insuranceDocUploadError={insuranceDocUploadError}
    insuranceDocUploadSuccess={insuranceDocUploadSuccess}
    handleEditSave={handleEditSave}
    loading={loading}
    successMsg={successMsg}
    pincodeLoading={pincodeLoading}
  />
  <InsuranceDetailsModal selectedInsurance={selectedInsurance} handleCloseInsuranceModal={handleCloseInsuranceModal} setDocUrl={setDocUrl} />

      {/* Document Viewer */}
      {docUrl && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-opacity-50">
          <div className="w-[90vw] h-[90vh] p-4 bg-white rounded-lg shadow-lg relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Document Viewer</h3>
              <div className="flex gap-4 items-center">
                {/* Close Button */}
                <button
                  className="text-2xl text-gray-400 hover:text-red-600"
                  onClick={() => {
                    setDocUrl(null);
                  }}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Document Frame */}
            <div className="w-full h-[calc(90vh-8rem)]">
              {(() => {
                // Get file extension
                const fileExt = docUrl.split('.').pop()?.toLowerCase();

                // PDF files
                if (fileExt === 'pdf') {
                  return (
                    <iframe
                      src={docUrl}
                      title="Document"
                      className="w-full h-full rounded border border-gray-200"
                      style={{
                        overflow: 'hidden',
                        border: 'none',
                        width: '100%',
                        height: '100%'
                      }}
                    />
                  );
                }

                // Image files
                if (['jpg', 'jpeg', 'png'].includes(fileExt)) {
                  return (
                    <div className="flex justify-center items-center w-full h-full bg-gray-100 rounded">
                      <img
                        src={docUrl}
                        alt="Document Preview"
                        className="object-contain max-w-full max-h-full"
                      />
                    </div>
                  );
                }

                // Unsupported formats
                return (
                  <div className="flex flex-col justify-center items-center w-full h-full bg-gray-100 rounded">
                    <div className="mb-4 text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6a2 2 0 002-2v-6a2 2 0 00-2-2h-6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-center text-gray-600">
                      Preview not available for this file type.<br />
                      Please use your browser's right-click menu to download or view the document.
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    
    </div>
  );
};

export default PatientDetails;