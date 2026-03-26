import React, { useState, useEffect } from "react";
import { getPatientsAdmissionDetails, searchAdmissions, getPatientAdmissionHistory, getPatientHistoryAllocationDetails } from "../api/Service";
import PatientNavBar from "../Components/PatientNavBar";
import { Eye } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";


const PAGE_SIZE = 10;

const PatientHistory = () => {
  const navigate = useNavigate(); // Add useNavigate hook
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("id");
  const [page, setPage] = useState(1);
  const [activeTab,] = useState("history"); // Initialize activeTab with a default value
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [allocationData, setAllocationData] = useState([]);
  const [serviceSearch, setServiceSearch] = useState("");
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [admissionHistory, setAdmissionHistory] = useState([]);
  const [selectedAdmissionServices, setSelectedAdmissionServices] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [admissionServicesMap, setAdmissionServicesMap] = useState({});

  // Fetch patient admission list (either all admissions or search results)
  useEffect(() => {
    const fetchPatientHistory = async () => {
      try {
        setLoading(true);

        // Build params from the single searchQuery according to filterOption
        const params = {};
        const q = String(searchQuery ?? "").trim();
        if (q !== "") {
          if (filterOption === "id") params.admissionId = q;
          else if (filterOption === "name") params.patientName = q;
          else if (filterOption === "phone") params.phoneNumber = q;
        }

        let data;
        // If any search param provided, use the search endpoint, otherwise fetch all admissions
        if (Object.keys(params).length > 0) {
          data = await searchAdmissions(params);
        } else {
          data = await getPatientsAdmissionDetails();
        }

        setPatients(Array.isArray(data) ? data : []);
        setError("");
      } catch (err) {
        console.error("Error fetching patient history:", err);
        setError("Failed to fetch patient history");
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientHistory();
  }, [searchQuery, filterOption]);

  // Use API results directly (no client-side multi-field fuzzy filtering)
  const filteredPatients = patients;

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / PAGE_SIZE);
  const paginatedPatients = filteredPatients.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  // Reset pagination when search changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, filterOption]);

  // Download Excel
  const handleDownloadExcel = () => {
    const data = patients.map((patient, index) => ({
      "S.No.": index + 1,
      "Patient Name": patient.patientName || "-",
      "Ad ID": patient.admissionId || "-",
      "Phone No.": patient.phoneNumber || "-",
      "Date of Admission": patient.admissionDate
        ? new Date(patient.admissionDate).toLocaleDateString("en-GB")
        : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Patient History");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 12 },
      { wch: 20 },
      { wch: 20 },
    ];

    XLSX.writeFile(workbook, "PatientHistory.xlsx");
  };

  // Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const data = patients.map((patient, index) => [
      index + 1,
      patient.patientName || "-",
      patient.admissionId || "-",
      patient.phoneNumber || "-",
      patient.admissionDate
        ? new Date(patient.admissionDate).toLocaleDateString("en-GB")
        : "-",
    ]);

    autoTable(doc, {
      head: [["S.No.", "Patient Name", "Patient ID", "Phone No.", "Date of Admission"]],
      body: data,
      startY: 10,
      theme: "grid",
      headStyles: {
        fillColor: [13, 71, 161],
        textColor: [255, 255, 255],
        fontSize: 11,
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        fontSize: 10,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    doc.save("PatientHistory.pdf");
  };

  // View patient details with allocations
  const handleViewPatient = async (patient) => {
    try {
      // Fetch allocation details for this admission (use admissionId or fallback to patientId)
      const admissionId = patient.admissionId ?? patient.patientId;
      const data = await getPatientHistoryAllocationDetails(admissionId);
      setAllocationData(Array.isArray(data) ? data : []);
      setSelectedPatient(patient);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching allocation details:", err);
      setAllocationData([]);
      setSelectedPatient(patient);
      setIsModalOpen(true);
    }
  };

  // Fetch all admissions for a patient (when user selects a patient)
  const fetchAdmissionHistoryForPatient = async (patientId) => {
    if (!patientId) {
      console.warn('Patient ID missing - Cannot fetch admission history for this record.');
      alert('Cannot fetch admission history for this record.');
      return;
    }
    try {
      setLoading(true);
      const data = await getPatientAdmissionHistory(patientId);
      setPatients(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (err) {
      console.error('Error fetching admissions for patient:', err);
      alert('Could not fetch patient admission history.');
    } finally {
      setLoading(false);
    }
  };

  // Open patient admission history modal (latest admission + services)
  const openHistoryModal = async (patient) => {
    const patientId = patient?.patientId;
    if (!patientId) {
      console.warn('Patient ID missing - Cannot fetch admission history for this record.');
      alert('Cannot fetch admission history for this record.');
      return;
    }

    try {
      setHistoryLoading(true);
      const admissions = await getPatientAdmissionHistory(patientId);
      const list = Array.isArray(admissions) ? admissions : [];
      setAdmissionHistory(list);

      // Fetch services for each admission (map by admissionId)
      const servicesMap = {};
      await Promise.all(
        list.map(async (adm) => {
          const admissionId = adm.admissionId ?? adm.patientId;
          if (!admissionId) return;
          try {
            const services = await getPatientHistoryAllocationDetails(admissionId);
            servicesMap[admissionId] = Array.isArray(services) ? services : [];
          } catch (err) {
            console.error('Error fetching services for admission:', err);
            servicesMap[admissionId] = [];
          }
        })
      );

      setAdmissionServicesMap(servicesMap);

      // Pick latest admission (assume first if API returns newest-first)
      const latest = list[0] ?? list[list.length - 1];
      if (latest) {
        const admissionId = latest.admissionId ?? latest.patientId;
        setSelectedAdmissionServices(servicesMap[admissionId] ?? []);
      } else {
        setSelectedAdmissionServices([]);
      }

      // Close the small details modal and show the admission history modal
      setIsModalOpen(false);
      setIsHistoryModalOpen(true);
    } catch (err) {
      console.error('Error fetching admission history:', err);
      alert('Could not fetch patient admission history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Helper to compute age from DOB
  const getAge = (dob) => {
    if (!dob) return "";
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return "";
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  };

  // Format helpers
  const formatDateTime = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null || value === "") return "-";
    const n = Number(value);
    if (isNaN(n)) return "-";
    return `₹${n.toFixed(2)}`;
  };

  return (
    <div className="mt-2 bg-[#FAFCFA] ">
      {/* Tabs */}
      <div className="flex gap-2 items-center w-full">
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium text-[12px] leading-[100%] cursor-pointer tracking-normal focus:outline-none transition-all
            ${activeTab === "admission"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          onClick={() => navigate("/HospitalManagement/ipd-management")}
        >
          Patient Admission
        </button>
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium text-[12px] cursor-pointer leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "lifecycle"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          onClick={() => navigate("/HospitalManagement/ipd/lifecycle")}
        >
          Patient Lifecycle
        </button>
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium text-[12px] cursor-pointer leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "billing"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          onClick={() => navigate("/HospitalManagement/billing")}
        >
          Billing
        </button>
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium text-[12px] leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "history"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          onClick={() => navigate("/HospitalManagement/patient-history")}
        >
          Patient History
        </button>
      </div>


      <div className="px-4 py-4">
        {/* Filters and Export Icons */}
        <div className="flex flex-col gap-2 items-center mb-2 md:flex-row">
          <input
            type="text"
            placeholder={
              filterOption === "id"
                ? "Search by admission or patient id"
                : filterOption === "name"
                  ? "Search by patient name"
                  : "Search by phone number"
            }
            className="px-3 py-2 w-full text-sm rounded-lg border border-gray-300 md:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="px-3 py-2 w-full text-sm bg-white rounded-lg border border-gray-300 cursor-pointer md:w-48"
          >
            <option value="id">Patient ID</option>
            <option value="name">Patient Name</option>
            <option value="phone">Phone Number</option>
          </select>
          {/* Additional dedicated fields removed — use the single search box above with the selected filter */}
          <div className="flex gap-2 items-center ml-auto">
            <FaFileExcel
              className="text-green-600 cursor-pointer hover:text-green-800"
              size={24}
              title="Export to Excel"
              onClick={handleDownloadExcel}
            />
            <FaFilePdf
              className="text-red-600 cursor-pointer hover:text-red-800"
              size={24}
              title="Export to PDF"
              onClick={handleDownloadPDF}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-8 text-center">
            <p className="text-gray-600">Loading patient history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-4 py-3 mb-6 text-red-700 bg-red-100 rounded border border-red-400">
            {error}
          </div>
        )}

        {/* Table */}
        {!loading && (
          <div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mt-2">
            <div className="">
              <table className="min-w-full text-sm">
                <thead className="font-medium text-black border-b border-black">
                  <tr className="h-12">
                    <th className="px-3 py-3 text-left">S. No.</th>
                    <th className="px-3 py-3 text-left">Patient Name</th>
                    <th className="px-3 py-3 text-left">Admission ID</th>
                    <th className="px-3 py-3 text-left">Phone No.</th>
                    <th className="px-3 py-3 text-left">Date of Admission</th>
                    <th className="px-3 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="bg-white"></td>
                  </tr>

                  {filteredPatients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-gray-500">
                        No patient history records found.
                      </td>
                    </tr>
                  )}

                  {paginatedPatients.map((patient, idx) => (
                    <tr
                      key={patient.admissionId ?? patient.patientId ?? idx}
                      className="h-10 border-b transition hover:bg-gray-50 odd:bg-white even:bg-blue-100"
                    >
                      <td className="px-2 py-2">{(page - 1) * PAGE_SIZE + idx + 1}.</td>

                      <td className="px-2 py-2">{patient.patientName || "-"}</td>
                      <td className="px-2 py-2">{patient.admissionId ?? patient.patientId ?? "-"}</td>
                      <td className="px-2 py-2">{patient.phoneNumber || "-"}</td>
                      <td className="px-2 py-2">
                        {patient.admissionDate
                          ? new Date(patient.admissionDate).toLocaleDateString("en-GB")
                          : "-"}
                      </td>

                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="text-blue-600 transition cursor-pointer hover:text-blue-800"
                          title="View details"
                        >
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex gap-2 justify-center items-center mt-3 mb-1 text-xs">
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
        )}
      </div>

      {/* Patient Details Modal */}
      {isModalOpen && selectedPatient && (
        <div className="flex fixed inset-0 z-50 justify-center items-center bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl relative max-w-6xl mx-auto w-full p-6 max-h-[90vh] overflow-y-auto">
            <button
              className="flex absolute top-4 right-4 z-10 justify-center items-center w-8 h-8 text-2xl font-bold text-red-500 rounded-full transition-colors hover:text-red-600 hover:bg-red-50"
              onClick={() => setIsModalOpen(false)}
            >
              ×
            </button>

            <h2 className="mb-2 text-lg font-semibold text-slate-800">Patient Details</h2>


            {/* View Past History button (placed near close) */}
            <button
              className="absolute top-4 right-20 z-20 px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              onClick={() => openHistoryModal(selectedPatient)}
            >
              View Past History
            </button>

            <div className="flex flex-col gap-2 p-4 mb-6 bg-blue-50 rounded-md border border-blue-400">
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex-1 min-w-[200px]">
                  <div className="text-2xl font-bold text-slate-900">{selectedPatient.patientName || "-"}</div>
                  <div className="flex gap-2 items-center mt-1 text-slate-600">
                    <span>📞 Phone No: {selectedPatient.phoneNumber ?? "-"}</span>
                    <span>✉️ Email: {selectedPatient.email ?? "-"}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-slate-700 min-w-[200px]">
                  <div>
                    <span>🎂 DOB: </span>
                    <span>
                      {selectedPatient.dateOfBirth
                        ? `${new Date(selectedPatient.dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} (${getAge(selectedPatient.dateOfBirth)} years)`
                        : "-"}
                    </span>
                  </div>
                  <div>
                    <span>🏠 Address: </span>
                    <span>{selectedPatient.address ?? "-"}</span>
                  </div>
                  <div>
                    <span>🆔 Patient ID: {selectedPatient.patientId ?? "-"}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm text-slate-700 min-w-[180px]">
                  <div>
                    <span>🆔 Admission ID: </span>
                    <span className="font-semibold">#{selectedPatient.admissionId ?? "-"}</span>
                  </div>
                  <div>
                    <span>📅 Admission Date: </span>
                    <span>
                      {selectedPatient.admissionDate
                        ? new Date(selectedPatient.admissionDate).toLocaleDateString("en-GB")
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-base font-semibold text-slate-800">Services History</span>
                <input
                  type="text"
                  placeholder="Search services..."
                  className="px-3 py-2 w-64 h-10 text-sm rounded-lg border border-gray-300 text-slate-700 focus:border-blue-500 focus:outline-none"
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                />
              </div>

              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-200">
                      <th className="px-4 py-3 font-semibold text-left">Date</th>
                      <th className="px-4 py-3 font-semibold text-left">Charge Type</th>
                      <th className="px-4 py-3 font-semibold text-left">Charge List</th>
                      <th className="px-4 py-3 font-semibold text-left">Charge</th>
                      {/* <th className="px-4 py-3 font-semibold text-left">Status</th> */}
                      <th className="px-4 py-3 font-semibold text-left">Discount</th>
                      <th className="px-4 py-3 font-semibold text-left">Advance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allocationData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No services found.
                        </td>
                      </tr>
                    ) : (
                      allocationData.map((allocation, idx) => {
                        const formatDate = (dateStr) => {
                          if (!dateStr) return "";
                          const d = new Date(dateStr);
                          return `${d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
                        };
                        return (
                          <tr key={allocation.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-blue-50"}>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {allocation.createdAt ? formatDate(allocation.createdAt) : "-"}
                            </td>
                            <td className="px-4 py-2 font-semibold whitespace-nowrap">
                              {allocation.chargeTypeName ?? "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">{allocation.manageListName ?? "-"}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {allocation.baseAmount !== undefined
                                ? `₹${Number(allocation.baseAmount).toFixed(2)}`
                                : "-"}
                            </td>
                            {/* <td className="px-4 py-2 whitespace-nowrap">{allocation.status ?? "-"}</td> */}
                            <td className="px-4 py-2 whitespace-nowrap">
                              {allocation.discountAmount !== undefined
                                ? `₹${Number(allocation.discountAmount).toFixed(2)}`
                                : "-"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {allocation.advanceAmount !== undefined
                                ? `₹${Number(allocation.advanceAmount).toFixed(2)}`
                                : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>


            </div>
          </div>
        </div>
      )}
      {/* Admission History Modal */}
      {isHistoryModalOpen && selectedPatient && (
        <div className="flex fixed inset-0 justify-center items-center z-60 bg-black/30">
          <div className="bg-white rounded-xl shadow-2xl relative max-w-6xl mx-auto w-full p-6 max-h-[90vh] overflow-y-auto">
            <button
              className="flex absolute top-4 right-4 z-10 justify-center items-center w-8 h-8 text-2xl font-bold text-white bg-red-600 rounded-full transition-colors cursor-pointer"
              onClick={() => setIsHistoryModalOpen(false)}
            >
              ×
            </button>

            <h2 className="mb-1 text-lg font-semibold text-slate-800">Patient Admission History</h2>
            <div className="mb-4 text-sm text-slate-600">{selectedPatient.patientName} (Patient ID: {selectedPatient.patientId ?? '-'})</div>

            <div className="p-4 mb-6 bg-white rounded-md border border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <div className="mb-3 text-sm font-semibold text-slate-700">Current Admission</div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-slate-700">
                    <div>
                      <div className="text-xs text-gray-500">Admission Number</div>
                      <div className="font-medium">{admissionHistory[0]?.admissionId ?? admissionHistory[0]?.admissionNumber ?? '-'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Admission Date</div>
                      <div>
                        {admissionHistory[0]?.admissionDate
                          ? new Date(admissionHistory[0].admissionDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Discharge Date</div>
                      <div>
                        {admissionHistory[0]?.dischargeDate
                          ? new Date(admissionHistory[0].dischargeDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  {!admissionHistory[0]?.dischargeDate && (
                    <span className="px-2 py-1 text-xs text-emerald-800 bg-emerald-100 rounded-full">Not Discharged</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="mb-3 text-base font-semibold">Services History</div>
              <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow">
                {historyLoading ? (
                  <div className="p-6 text-sm text-center text-slate-600">Loading services...</div>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-[#f7fafc] border-b border-gray-200">
                        <th className="px-6 py-4 font-semibold text-left text-slate-700">Date & Time</th>
                        <th className="px-6 py-4 font-semibold text-left text-slate-700">Charge Type</th>
                        <th className="px-6 py-4 font-semibold text-left text-slate-700">Charge List</th>
                        <th className="px-6 py-4 font-semibold text-right text-slate-700">Charge</th>
                        {/* <th className="px-6 py-4 font-semibold text-center text-slate-700">Status</th> */}
                        <th className="px-6 py-4 font-semibold text-right text-slate-700">Discount</th>
                        <th className="px-6 py-4 font-semibold text-right text-slate-700">Advance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedAdmissionServices.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">No services found.</td>
                        </tr>
                      ) : (
                        selectedAdmissionServices.map((allocation, idx) => (
                          <tr key={allocation.id || idx} className={idx % 2 === 0 ? "bg-white" : "bg-[#fbfdff]"}>
                            <td className="px-6 py-6 align-top text-slate-700" style={{ whiteSpace: 'normal', width: '18%' }}>{allocation.createdAt ? formatDateTime(allocation.createdAt) : "-"}</td>
                            <td className="px-6 py-6 align-top text-slate-700" style={{ width: '14%' }}>{allocation.chargeTypeName ?? "-"}</td>
                            <td className="px-6 py-6 align-top text-slate-700" style={{ width: '34%' }}>{allocation.manageListName ?? "-"}</td>
                            <td className="px-6 py-6 text-right align-top text-slate-700" style={{ width: '10%' }}>{formatCurrency(allocation.baseAmount)}</td>
                            {/* <td className="px-6 py-6 text-center align-top text-slate-700" style={{width: '8%'}}>{allocation.status ?? "-"}</td> */}
                            <td className="px-6 py-6 text-right align-top text-slate-700" style={{ width: '8%' }}>{formatCurrency(allocation.discountAmount)}</td>
                            <td className="px-6 py-6 text-right align-top text-slate-700" style={{ width: '8%' }}>{formatCurrency(allocation.advanceAmount)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Description */}
              <div className="pt-2 mt-2">
                <div className="mb-2 text-sm font-semibold text-slate-700">Description</div>
                <div className="text-sm text-slate-600">
                  {admissionHistory[0]?.description || admissionHistory[0]?.notes || admissionHistory[0]?.remarks || "Testing description not available for this admission."}
                </div>
              </div>

              {/* Previous Admissions */}
              {admissionHistory.slice(1).map((adm, i) => {
                const admId = adm.admissionId ?? adm.patientId ?? `adm-${i}`;
                const services = admissionServicesMap[admId] ?? [];
                return (
                  <div key={admId} className="p-4 mt-6 bg-white rounded-md border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="mb-3 text-sm font-semibold text-slate-700">Previous Admission {i + 1}</div>
                        <div className="grid grid-cols-3 gap-4 text-sm text-slate-700">
                          <div>
                            <div className="text-xs text-gray-500">Admission Number</div>
                            <div className="font-medium">{adm.admissionId ?? adm.admissionNumber ?? '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Admission Date</div>
                            <div>{adm.admissionDate ? new Date(adm.admissionDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Discharge Date</div>
                            <div>{adm.dischargeDate ? new Date(adm.dischargeDate).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        {!adm.dischargeDate && (
                          <span className="px-2 py-1 text-xs text-emerald-800 bg-emerald-100 rounded-full">Current</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-3 text-sm font-semibold">Services History</div>
                      <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="bg-[#f7fafc] border-b border-gray-200">
                              <th className="px-6 py-4 font-semibold text-left text-slate-700">Date & Time</th>
                              <th className="px-6 py-4 font-semibold text-left text-slate-700">Charge Type</th>
                              <th className="px-6 py-4 font-semibold text-left text-slate-700">Charge List</th>
                              <th className="px-6 py-4 font-semibold text-right text-slate-700">Charge</th>
                              <th className="px-6 py-4 font-semibold text-center text-slate-700">Status</th>
                              <th className="px-6 py-4 font-semibold text-right text-slate-700">Discount</th>
                              <th className="px-6 py-4 font-semibold text-right text-slate-700">Advance</th>
                            </tr>
                          </thead>
                          <tbody>
                            {services.length === 0 ? (
                              <tr>
                                <td colSpan={7} className="py-8 text-center text-slate-500">No services found.</td>
                              </tr>
                            ) : (
                              services.map((allocation, idx2) => (
                                <tr key={allocation.id || idx2} className={idx2 % 2 === 0 ? "bg-white" : "bg-[#fbfdff]"}>
                                  <td className="px-6 py-6 align-top text-slate-700" style={{ whiteSpace: 'normal', width: '18%' }}>{allocation.createdAt ? formatDateTime(allocation.createdAt) : "-"}</td>
                                  <td className="px-6 py-6 align-top text-slate-700" style={{ width: '14%' }}>{allocation.chargeTypeName ?? "-"}</td>
                                  <td className="px-6 py-6 align-top text-slate-700" style={{ width: '34%' }}>{allocation.manageListName ?? "-"}</td>
                                  <td className="px-6 py-6 text-right align-top text-slate-700" style={{ width: '10%' }}>{formatCurrency(allocation.baseAmount)}</td>
                                  <td className="px-6 py-6 text-center align-top text-slate-700" style={{ width: '8%' }}>{allocation.status ?? "-"}</td>
                                  <td className="px-6 py-6 text-right align-top text-slate-700" style={{ width: '8%' }}>{formatCurrency(allocation.discountAmount)}</td>
                                  <td className="px-6 py-6 text-right align-top text-slate-700" style={{ width: '8%' }}>{formatCurrency(allocation.advanceAmount)}</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="pt-4 mt-4">
                        <div className="mb-2 text-sm font-semibold text-slate-700">Description</div>
                        <div className="text-sm text-slate-600">{adm.description || adm.notes || adm.remarks || 'Testing '}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientHistory;
