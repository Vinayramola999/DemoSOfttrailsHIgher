import React, { useEffect, useState, useMemo } from "react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { getPatientsAdmissionDetails, updatePatientAdmissionStatus } from "../api/Service";
import Admitpatient from "./Admitpatient";
import Success from "../Components/Success";
import { useNavigate } from "react-router-dom";

const statusOptions = [
  { label: "All", value: "" },
  { label: "Admitted", value: "ADMITTED" },
  { label: "Discharged", value: "DISCHARGED" },
];

const IpdManagement = () => {
  const navigate = useNavigate();
  const [activeTab] = useState("admission");
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAdmitModal, setShowAdmitModal] = useState(false);
  // success popup shown after admitting a patient (moved from Components/Success.jsx)
  const [showAdmitSuccess, setShowAdmitSuccess] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(9);

  // Fetch patients
  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await getPatientsAdmissionDetails();
      setPatients(data || []);
    } catch {
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Optimized filtering with useMemo
  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        search === "" ||
        p.patientName?.toLowerCase().includes(search.toLowerCase()) ||
        p.phoneNumber?.includes(search) ||
        p.admissionId?.toString().includes(search);

      const matchesStatus = status === "" || (p.admissionStatus && p.admissionStatus === status);

      let matchesDate = true;
      if (dateFrom) {
        matchesDate = new Date(p.admissionDate) >= new Date(dateFrom);
      }
      if (matchesDate && dateTo) {
        matchesDate = new Date(p.admissionDate) <= new Date(dateTo);
      }
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [patients, search, status, dateFrom, dateTo]);

  // ✅ Optimized totalPages with useMemo
  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredPatients.length / rowsPerPage)),
    [filteredPatients, rowsPerPage]
  );

  // ✅ Optimized pagination with useMemo
  const paginatedPatients = useMemo(() => {
    return filteredPatients.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  }, [filteredPatients, currentPage, rowsPerPage]);

  // Reset the current page to 1 when any of the filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, dateFrom, dateTo, rowsPerPage]);

  // Ensure currentPage stays within bounds when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Keyboard navigation for pagination (left/right arrows)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft" && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else if (e.key === "ArrowRight" && currentPage < totalPages) {
        setCurrentPage((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentPage, totalPages]);

  // Excel export handler
  const handleDownloadExcel = () => {
    const data = filteredPatients.map((p) => ({
      "Admission ID": p.admissionId,
      "Patient Name": p.patientName,
      "Phone Number": p.phoneNumber,
      "Date of Admission": p.admissionDate
        ? new Date(p.admissionDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
      "Date of Discharge": p.dischargeDate
        ? new Date(p.dischargeDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
      Days: p.days,
      Status: p.admissionStatus,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Admissions");
    XLSX.writeFile(wb, "ipd_admissions.xlsx");
  };

  // PDF export handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
    doc.text("IPD Admissions", 40, 30);
    const tableColumn = [
      "Admission ID",
      "Patient Name",
      "Phone Number",
      "Date of Admission",
      "Date of Discharge",
      "Days",
      "Status",
    ];
    const tableRows = filteredPatients.map((p) => [
      p.admissionId,
      p.patientName,
      p.phoneNumber,
      p.admissionDate
        ? new Date(p.admissionDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
      p.dischargeDate
        ? new Date(p.dischargeDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "-",
      p.days,
      p.admissionStatus,
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { left: 20, right: 20 },
      tableWidth: "auto",
    });
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
    doc.save("ipd_admissions.pdf");
  };

  const handleStatusToggle = (patient) => {
    if (patient.admissionStatus === "ADMITTED") {
      setSelectedPatient(patient);
      setShowDischargeModal(true);
    }
  };

  const confirmDischarge = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const payload = {
        admissionId: selectedPatient.admissionId,
        admissionDate: selectedPatient.admissionDate,
        dischargeDate: new Date().toISOString(),
        admissionStatus: "DISCHARGED",
      };
      await updatePatientAdmissionStatus(selectedPatient.admissionId, payload);
      setShowDischargeModal(false);
      setSelectedPatient(null);
      await fetchPatients();
    } catch (error) {
      alert(error.message || "Failed to discharge patient.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 bg-[#FAFCFA] ">
      {/* Tabs */}
      <div className="flex gap-2 items-center mb-3 w-full">
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium text-[12px] cursor-pointer leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "admission"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          onClick={() => navigate("/HospitalManagement/ipd/admission")}
        >
          Patient Admission
        </button>
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium cursor-pointer text-[12px] leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "lifecycle"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          onClick={() => navigate("/HospitalManagement/ipd/lifecycle")}
        >
          Patient Lifecycle
        </button>
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium cursor-pointer text-[12px] leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "billing"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          onClick={() => navigate("/HospitalManagement/billing")}
        >
          Billing
        </button>
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium cursor-pointer text-[12px] leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "history"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          onClick={() => navigate("/HospitalManagement/patient-history")}
        >
          Patient History
        </button>
      </div>

      {/* Top actions */}
      <div className="flex relative flex-col md:flex-row md:items-center md:justify-between">
        <button
          className="bg-blue-700 hover:bg-blue-800 text-white rounded-lg w-[163px] h-[35px] cursor-pointer opacity-100 mb-3"
          onClick={() => setShowAdmitModal(true)}
        >
          + Admit patient
        </button>
        <div className="flex gap-2 items-center ml-auto">
          <FaFileExcel className="text-green-600 cursor-pointer hover:text-green-800" size={24} title="Export to Excel" onClick={handleDownloadExcel} />
          <FaFilePdf className="text-red-600 cursor-pointer hover:text-red-800" size={24} title="Export to PDF" onClick={handleDownloadPDF} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-2 items-center mb-2 md:flex-row">
        <input
          type="text"
          placeholder="Search"
          className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 md:w-64"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex items-center w-full md:w-auto">
          <input
            type="date"
            className="px-2 py-2 text-sm rounded-lg border border-gray-300"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
          />
          <span className="mx-1 text-gray-500">TO</span>
          <input
            type="date"
            className="px-2 py-2 text-sm rounded-lg border border-gray-300"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 md:w-48"
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mt-2">
        <div className="">
          <table className="min-w-full text-sm">
            <thead className="font-medium text-black border-b border-black">
              <tr className="h-12">
                <th className="px-3 py-3 text-left">Admission Id</th>
                <th className="px-3 py-3 text-left">Patient Name</th>
                <th className="px-3 py-3 text-left">Phone Number</th>
                <th className="px-3 py-3 text-left">Date of Admission</th>
                <th className="px-3 py-3 text-left">Date of Discharge</th>
                <th className="px-3 py-3 text-left">Days</th>
                <th className="px-3 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="" />

              {loading ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center">Loading...</td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center">No patients found.</td>
                </tr>
              ) : (
                paginatedPatients.map((p, idx) => (
                  <tr
                    key={p.admissionId || idx}
                    className="h-10 border-b transition hover:bg-gray-50 odd:bg-white even:bg-blue-100"
                  >
                    <td className="px-2 py-2">{p.admissionId || '-'}</td>
                    <td className="px-2 py-2">{p.patientName || '-'}</td>
                    <td className="px-2 py-2">{p.phoneNumber || '-'}</td>
                    <td className="px-2 py-2">{p.admissionDate ? new Date(p.admissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                    <td className="px-2 py-2">{p.dischargeDate ? new Date(p.dischargeDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</td>
                    <td className="px-2 py-2">
                      {p.admissionStatus === "DISCHARGED" && p.admissionDate && p.dischargeDate
                        ? Math.max(
                            1,
                            Math.ceil(
                              (new Date(p.dischargeDate) - new Date(p.admissionDate)) / (1000 * 60 * 60 * 24)
                            )
                          )
                        : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {p.admissionStatus === "ADMITTED" ? (
                        <button
                          className="flex gap-1 items-center bg-transparent border-none cursor-pointer outline-none"
                          style={{ color: 'green', fontWeight: 500 }}
                          onClick={() => handleStatusToggle(p)}
                        >
                          Admitted
                          <span className="inline-block ml-1 align-middle">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="black" xmlns="http://www.w3.org/2000/svg">
                              <polygon points="4,6 8,10 12,6" />
                            </svg>
                          </span>
                        </button>
                      ) : (
                        <span className="flex gap-1 items-center" style={{ color: 'red', fontWeight: 500 }}>
                          Discharged
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6L14 14M14 6L6 14" stroke="red" strokeWidth="2" strokeLinecap="round"/></svg>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls: Modern Small Style */}
        <div className="flex gap-2 justify-center items-center mt-2 mb-2 text-xs">
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === 1 || totalPages === 1 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || totalPages === 1}
            aria-label="Previous page"
          >
            <span className="text-lg">&lt;</span>
          </button>
          <button
            className={`flex justify-center items-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg`}
            style={{ boxShadow: "0 2px 8px 0 rgba(24, 144, 255, 0.08)" }}
            disabled
          >
            {filteredPatients.length === 0 ? 0 : currentPage}
          </button>
          <span className="mx-1 font-semibold text-black">of</span>
          <button
            className={`flex justify-center items-center w-8 h-8 font-bold text-blue-600 bg-white rounded-lg border border-blue-500`}
            style={{ boxShadow: "0 2px 8px 0 rgba(24, 144, 255, 0.08)" }}
            disabled
          >
            {filteredPatients.length === 0 ? 0 : totalPages}
          </button>
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === totalPages || totalPages === 1 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 1}
            aria-label="Next page"
          >
            <span className="text-lg">&gt;</span>
          </button>
        </div>
      </div>

      {/* Admit Patient Modal */}
      {showAdmitModal && (
        <Admitpatient
          onClose={() => setShowAdmitModal(false)}
          // When Admitpatient calls onAdmitSuccess we close the admit modal, refresh list
          // and show the success popup from this parent component.
          onAdmitSuccess={() => {
            setShowAdmitModal(false);
            fetchPatients();
            setShowAdmitSuccess(true);
          }}
        />
      )}

      <Success
        open={showAdmitSuccess}
        onContinue={() => setShowAdmitSuccess(false)}
        title="Success"
        message="Patient admitted successfully"
      />

      {/* Discharge Confirmation Modal */}
      {showDischargeModal && selectedPatient && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-opacity-30">
          <div className="p-4 w-full max-w-md bg-white rounded-xl shadow-lg">
            <h2 className="mb-2 text-xl font-bold text-red-700">Discharge Patient</h2>
            <p className="mb-6">
              Are you sure you want to discharge patient <b>{selectedPatient.patientName}</b> (Admission Id: <b>{selectedPatient.admissionId}</b>)?
            </p>
            <div className="flex gap-4 justify-end">
              <button
                className="px-6 py-2 font-semibold rounded border"
                onClick={() => {
                  setShowDischargeModal(false);
                  setSelectedPatient(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 font-semibold text-white bg-blue-600 rounded"
                onClick={confirmDischarge}
              >
                Discharge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IpdManagement;   