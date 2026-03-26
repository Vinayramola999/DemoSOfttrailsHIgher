
import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import { Eye } from "lucide-react";
import { FaFileExcel, FaFilePdf } from "react-icons/fa";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";
import {
  createPatientChargeAllocation,
  getAllocationDetails,
  getPatientAllocationsByAdmissionId,
  completePatientChargeAllocation,
  getPatientsAdmissionDetails,
  getAdmissionsBySearch,
  getActiveServices,
  getActiveConsumables,
  getAdvanceTypes,
  getManageListItems,
  getDiscountsExternal,
  // getAdmissionsWithAllocations was returning a different shape for some environments
  // and caused the PatientLifecycle list to be empty. Use getPatientsAdmissionDetails
  // here (stable endpoint used elsewhere in the app).
} from "../api/Service";

const CATEGORY_ADVANCE = "ADVANCE";
const CATEGORY_CHARGEABLE = "CHARGEABLE";

const PatientAllocationForm = ({ patient, onCancel, onSuccess }) => {
  const [chargeTypes, setChargeTypes] = useState([]);
  const [manageList, setManageList] = useState([]);
  const [category, setCategory] = useState("");
  const [chargeCategory, setChargeCategory] = useState("");
  const [form, setForm] = useState({
    admissionId: "",
    chargeTypeId: "",
    manageListId: "",
    advanceAmount: "",
    discountId: "",

  });
  const [allocations, setAllocations] = useState([]);
  const [loadingAllocations, setLoadingAllocations] = useState(false);

  // Service history search & pagination (for the allocations table)
  const [serviceSearch, setServiceSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;
  // Track which allocation's status popover is open (allocation id)
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(null);

  // NEW: All admissions for dropdown
  const [admissions, setAdmissions] = useState([]);
  const [, setAdmissionsLoading] = useState(false);

  // Discounts loaded from external API
  const [discounts, setDiscounts] = useState([]);
  const [discountsLoading, setDiscountsLoading] = useState(false);

  // Search state
  // Search states for patient details
  const [searchAdmissionId, setSearchAdmissionId] = useState("");
  const [searchPatientName, setSearchPatientName] = useState("");
  const [searchPhoneNumber, setSearchPhoneNumber] = useState("");
  const [searchAdmissionDate, setSearchAdmissionDate] = useState("");
  const [columnSearchResults, setColumnSearchResults] = useState([]);
  const [_columnSearchLoading, setColumnSearchLoading] = useState(false);
  const [_activeColumnDropdown, setActiveColumnDropdown] = useState("");

  // Load charge types when charge category changes
  useEffect(() => {
    const loadTypes = async () => {
      try {
        let res;
        if (chargeCategory === "Advance") {
          res = await getAdvanceTypes();
        } else if (chargeCategory === "Services") {
          res = await getActiveServices();
        } else if (chargeCategory === "Consumables") {
          res = await getActiveConsumables();
        }

        if (res) {
          // our Service helpers now return normalized arrays
          setChargeTypes(Array.isArray(res) ? res : res?.data ?? []);
        } else {
          setChargeTypes([]);
        }
      } catch (err) {
        console.error(`Failed to load ${chargeCategory}:`, err);
        setChargeTypes([]);
      }
    };

    if (chargeCategory) {
      loadTypes();
    } else {
      setChargeTypes([]);
    }
  }, [chargeCategory]);


  // Load all admissions for dropdown on mount (only if not editing a patient)
  useEffect(() => {
    const loadAdmissions = async () => {
      setAdmissionsLoading(true);
      try {
        const res = await getPatientsAdmissionDetails();
        // normalize response to array and keep only currently admitted patients
        const all = Array.isArray(res) ? res : res?.data ?? [];
        setAdmissions(all.filter((a) => (a.admissionStatus || a.status || '').toString().toUpperCase() === 'ADMITTED'));
      } catch (err) {
        console.error("Failed to load admissions:", err);
        // fallback to empty
        setAdmissions([]);
      } finally {
        setAdmissionsLoading(false);
      }
    };

    if (!patient) {
      loadAdmissions();
    }
  }, [patient]);

  // Load discounts from external API on mount
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setDiscountsLoading(true);
      try {
        const data = await getDiscountsExternal();
        if (mounted && Array.isArray(data)) setDiscounts(data);
      } catch (err) {
        console.warn("Failed to load discounts:", err.message || err);
      } finally {
        if (mounted) setDiscountsLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // Set patient info when patient changes
  useEffect(() => {
    if (patient) {
      setForm((prev) => ({
        ...prev,
        admissionId: patient.admissionId || "",
      }));
      // Set mock allocations
      if (patient.admissionId) {
        setLoadingAllocations(true);
        // start with empty until real data is fetched
        setAllocations([]);
        setLoadingAllocations(false);
      }
    }
  }, [patient]);

  // NEW: When admissionId changes (from dropdown), update allocations
  useEffect(() => {
    const loadAllocations = async () => {
      setLoadingAllocations(true);
      try {
        const res = await getAllocationDetails(form.admissionId);
        // getAllocationDetails returns a normalized array
        setAllocations(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to fetch allocations:", err);
        setAllocations([]);
      } finally {
        setLoadingAllocations(false);
      }
    };

    if (!patient && form.admissionId) {
      loadAllocations();
    }
  }, [form.admissionId, patient]);

  // When chargeTypeId or category changes, load manage list items
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!form.chargeTypeId) {
          setCategory("");
          setManageList([]);
          return;
        }

        // Find selected charge type to get its category
        const selectedType = chargeTypes.find(
          (ct) => String(ct.id) === String(form.chargeTypeId)
        );

        if (selectedType) {
          setCategory(selectedType.category);

          // Only load manage list for Services and Consumables
          if (chargeCategory !== "Advance") {
            const res = await getManageListItems(selectedType.id);
            setManageList(Array.isArray(res) ? res : res?.data ?? []);
          } else {
            setManageList([]); // Clear manage list for Advance type
          }
        } else {
          // selected type not found
          setCategory("");
          setManageList([]);
        }
      } catch (err) {
        console.error("Failed to load manage list items:", err);
        setManageList([]);
      }
    };

    loadData();
  }, [form.chargeTypeId, chargeTypes, chargeCategory]);

  // Handler for column search

  const handleColumnSearch = async (type, value) => {
    setColumnSearchResults([]);
    if (!value) {
      setColumnSearchLoading(false);
      return;
    }

    setColumnSearchLoading(true);
    try {
      let params = {};
      if (type === "admissionId") {
        params.admissionId = String(value).trim();
      } else if (type === "patientName") {
        params.patientName = String(value).trim();
      } else if (type === "phoneNumber") {
        params.phoneNumber = String(value).trim();
      } else if (type === "admissionDate") {
        // expect YYYY-MM-DD or parseable input
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          params.admissionDate = `${y}-${m}-${day}`;
        } else {
          params.admissionDate = value;
        }
      } else {
        // fallback to free text
        params.q = String(value).trim();
      }

      const data = await getAdmissionsBySearch(params);
      const results = Array.isArray(data) ? data : [];

      // If a single result is returned, auto-select it (useful when entering any of the fields)
      if (results.length === 1) {
        handleSelectColumnSearchResult(results[0]);
        setColumnSearchLoading(false);
        return;
      }

      // Exact-match / unique-match shortcuts for different types
      if (type === "admissionId") {
        const exact = results.find((r) => String(r.admissionId) === String(value));
        if (exact) {
          handleSelectColumnSearchResult(exact);
          setColumnSearchLoading(false);
          return;
        }
      }

      if (type === "patientName") {
        const lower = String(value).toLowerCase();
        // prefer exact name match
        const exactName = results.find((r) => r.patientName && r.patientName.toLowerCase() === lower);
        if (exactName) {
          handleSelectColumnSearchResult(exactName);
          setColumnSearchLoading(false);
          return;
        }
        // then unique startsWith match (case-insensitive)
        const startsWithMatches = results.filter((r) => r.patientName && r.patientName.toLowerCase().startsWith(lower));
        if (startsWithMatches.length === 1) {
          handleSelectColumnSearchResult(startsWithMatches[0]);
          setColumnSearchLoading(false);
          return;
        }
      }

      if (type === "phoneNumber") {
        const normInput = String(value).replace(/\D/g, "");
        // exact numeric match
        const exactPhone = results.find((r) => {
          const p = String(r.phoneNumber ?? r.contactNumber ?? "").replace(/\D/g, "");
          return p && (p === normInput || p.endsWith(normInput));
        });
        if (exactPhone) {
          handleSelectColumnSearchResult(exactPhone);
          setColumnSearchLoading(false);
          return;
        }
        // unique contains/endsWith match
        const phoneMatches = results.filter((r) => {
          const p = String(r.phoneNumber ?? r.contactNumber ?? "").replace(/\D/g, "");
          return p && (p === normInput || p.endsWith(normInput) || p.includes(normInput));
        });
        if (phoneMatches.length === 1) {
          handleSelectColumnSearchResult(phoneMatches[0]);
          setColumnSearchLoading(false);
          return;
        }
      }

      if (type === "admissionDate") {
        // normalize both sides to YYYY-MM-DD for reliable comparison
        const normalizeDate = (d) => {
          if (!d) return null;
          const dt = new Date(d);
          if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
          return dt.toISOString().slice(0, 10);
        };
        const norm = normalizeDate(value);
        const exactDate = results.find((r) => normalizeDate(r.admissionDate) === norm);
        if (exactDate) {
          handleSelectColumnSearchResult(exactDate);
          setColumnSearchLoading(false);
          return;
        }
      }

      // Limit results to first 10 for UI
      setColumnSearchResults(results.slice(0, 10));
    } catch (err) {
      // Fallback: search within already-loaded admissions client-side
      console.warn("Admissions search failed, falling back to local filter:", err);
      let filtered = Array.isArray(admissions) ? admissions.filter(admission => {
        // Only include admitted patients
        const admStatus = (admission.admissionStatus || admission.status || '').toString().toUpperCase();
        if (admStatus !== 'ADMITTED') return false;

        if (type === "patientName") {
          return admission.patientName && admission.patientName.toLowerCase().startsWith(value.toLowerCase());
        } else if (type === "admissionId") {
          return admission.admissionId && String(admission.admissionId).startsWith(value);
        } else if (type === "phoneNumber") {
          return (admission.phoneNumber && String(admission.phoneNumber).startsWith(value)) || (admission.contactNumber && String(admission.contactNumber).startsWith(value));
        } else if (type === "admissionDate") {
          // compare normalized YYYY-MM-DD
          try {
            const input = new Date(value).toISOString().slice(0, 10);
            return admission.admissionDate && new Date(admission.admissionDate).toISOString().slice(0, 10) === input;
          } catch (e) {
            return admission.admissionDate && String(admission.admissionDate).startsWith(value);
          }
        }
        return false;
      }) : [];

      if (filtered.length === 1) {
        handleSelectColumnSearchResult(filtered[0]);
      } else if (type === "patientName") {
        const lower = String(value).toLowerCase();
        const startsWithMatches = filtered.filter((r) => r.patientName && r.patientName.toLowerCase().startsWith(lower));
        if (startsWithMatches.length === 1) handleSelectColumnSearchResult(startsWithMatches[0]);
      } else if (type === "phoneNumber") {
        const normInput = String(value).replace(/\D/g, "");
        const phoneMatches = filtered.filter((r) => {
          const p = String(r.phoneNumber ?? r.contactNumber ?? "").replace(/\D/g, "");
          return p && (p === normInput || p.endsWith(normInput) || p.includes(normInput));
        });
        if (phoneMatches.length === 1) handleSelectColumnSearchResult(phoneMatches[0]);
      }

      setColumnSearchResults(filtered.slice(0, 10));
    } finally {
      setColumnSearchLoading(false);
    }
  };

  // When a discount is selected from dropdown
  const handleDiscountSelect = (e) => {
    const id = e.target.value;
    // allow manual custom
    if (id === "__custom" || id === "") {
      setForm((f) => ({ ...f, discountId: id, discountAmount: "", discountDescription: "" }));
      return;
    }
    const d = discounts.find((x) => String(x.id) === String(id));
    if (!d) {
      setForm((f) => ({ ...f, discountId: "", discountAmount: "", discountDescription: "" }));
      return;
    }

    // Determine base amount: prefer explicit form.charge, otherwise try chargeTypes defaultCharge
    const base = Number(form.charge) || Number((chargeTypes || []).find((ct) => String(ct.id) === String(form.chargeTypeId))?.defaultCharge) || 0;
    const perc = Number(d.percentage) || 0;
    const amount = +(base * perc / 100).toFixed(2);
    setForm((f) => ({ ...f, discountId: id, discountAmount: amount, discountDescription: `${perc}% - ${d.name}` }));
  };
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // handleChange is used for controlled inputs; avoid noisy logs in production

    // If manageListId is changed, auto-fill related fields
    if (name === "manageListId") {
      const selectedItem = manageList.find(
        (item) => String(item.id) === String(value)
      );


      if (selectedItem) {
        setForm((prev) => ({
          ...prev,
          manageListId: value,
          // Auto-fill charge if available
          ...(selectedItem.charge !== undefined ? { charge: selectedItem.charge } : {}),
        }));
      }
    }
    // If chargeTypeId changes, clear manage list selection
    else if (name === "chargeTypeId") {
      const selectedType = chargeTypes.find(
        (ct) => String(ct.id) === String(value)
      );


      setForm((prev) => ({
        ...prev,
        chargeTypeId: value,
        manageListId: "", // Clear manage list selection
        charge: selectedType?.defaultCharge || "", // Set default charge if available
      }));
    }
    // Handle all other form fields
    else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // When user switches the top-level charge category (Services / Consumables / Advance)
  const handleChargeCategoryChange = (value) => {
    // Reset charge-related form fields to avoid sending stale values
    setChargeCategory(value);
    setForm((prev) => ({
      ...prev,
      chargeTypeId: "",
      manageListId: "",
      charge: "",
      quantity: "",
      advanceAmount: "",
      discountId: "",
      discountDescription: "",
    }));
    // clear any loaded manage list / charge types when switching
    setManageList([]);
    setChargeTypes([]);
  };



  // Find selected admission for patient info display (if not editing a patient)
  const selectedAdmission = !patient && form.admissionId
    ? admissions.find((a) => String(a.admissionId) === String(form.admissionId))
    : patient;

  // Use the chargeTypes loaded for the selected top-level category directly.
  // The loaders (`getActiveServices`, `getActiveConsumables`, `getAdvanceTypes`) already
  // return arrays scoped to the selected category. Avoid filtering by `ct.category`
  // here because backend `category` values may vary (e.g. 'SERVICE', 'CONSUMABLE',
  // or 'CHARGEABLE') which would incorrectly hide valid results.
  const filteredChargeTypes = chargeTypes || [];

  // Submit handler - calls backend API to create allocation (Service / Consumable / Advance)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Show confirmation using SweetAlert2 before proceeding
    if (!form.admissionId) {
      Swal.fire({ icon: 'warning', title: 'Missing Admission ID', text: 'Please select an Admission ID.' });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Confirm Submission',
      text: 'Are you sure you want to submit this allocation?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, submit',
      cancelButtonText: 'Cancel',
    });

    if (!confirm.isConfirmed) return;

    setLoadingAllocations(true);
    try {
      const admissionIdNumber = isNaN(Number(form.admissionId)) ? form.admissionId : Number(form.admissionId);

      // Build payload according to selected UI chargeCategory
      let payload = { admissionId: admissionIdNumber };

      if (chargeCategory === "Advance") {
        // Advance flow: requires advanceTypeId and amount
        const advanceTypeId = form.chargeTypeId;
        const advanceAmount = form.charge || form.advanceAmount;
        if (!advanceTypeId) {
          throw new Error("Please select an advance type.");
        }
        if (!advanceAmount || Number(advanceAmount) <= 0) {
          throw new Error("Advance amount must be greater than zero.");
        }
        // Ensure no manageListId is sent
        if (form.manageListId) {
          throw new Error("Provide either advanceTypeId OR manageListId, not both.");
        }
        payload = {
          ...payload,
          advanceTypeId: Number(advanceTypeId),
          advanceAmount: Number(advanceAmount),
        };
      } else if (chargeCategory === "Consumables" || chargeCategory === "Services") {
        // Service/Consumable flow: requires manageListId
        if (!form.manageListId) {
          throw new Error("Please select a service/consumable from Manage List.");
        }
        payload = {
          ...payload,
          manageListId: Number(form.manageListId),
        };

        // Quantity if provided
        if (form.quantity) payload.quantity = Number(form.quantity);

        // Handle discount input for Services:
        // - If a preset discount (discountId) is selected, send discountId.
        // - If user selected Custom ("__custom"), send discountAmount and discountDescription.
        // - Consumables ignore discounts.
        if (chargeCategory === "Services") {
          if (form.discountId && form.discountId !== "__custom") {
            // Send the selected discount id
            payload.discountId = Number(form.discountId);
          } else if (form.discountId === "__custom") {
            // Custom discount: include amount/description when provided
            if (form.discountAmount !== undefined && form.discountAmount !== null && form.discountAmount !== "") {
              payload.discountAmount = Number(form.discountAmount);
            }
            if (form.discountDescription !== undefined && form.discountDescription !== null && form.discountDescription !== "") {
              payload.discountDescription = form.discountDescription;
            }
          }
        } else if (chargeCategory === "Consumables") {
          // For consumables: send selected preset discount as `discountId`,
          // but do NOT send `discountAmount`. If user selected a custom
          // discount ("__custom"), we explicitly ignore the numeric amount
          // for consumables. We may include a description if provided.
          if (form.discountId && form.discountId !== "__custom") {
            payload.discountId = Number(form.discountId);
          } else {
            if (form.discountDescription !== undefined && form.discountDescription !== null && form.discountDescription !== "") {
              payload.discountDescription = form.discountDescription;
            }
          }
        }
      } else {
        throw new Error("Please select a valid Charge Type (Services / Consumables / Advance).");
      }

      // Call backend API
      const result = await createPatientChargeAllocation(payload);

      // Refresh allocations list for this admission (best-effort)
      try {
        const updated = await getAllocationDetails(admissionIdNumber);
        setAllocations(Array.isArray(updated) ? updated : []);
      } catch (refreshErr) {
        // If refresh fails, keep existing allocations and log
        console.error("Failed to refresh allocations:", refreshErr);
      }

      // success feedback via SweetAlert
      await Swal.fire({ icon: 'success', title: 'Success', text: 'Patient allocation created successfully.' });
      onSuccess?.(result);
    } catch (err) {
      console.error(err);
      await Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to create allocation.' });
    } finally {
      setLoadingAllocations(false);
    }
  };

  // Handlers to complete/cancel allocations (useful for actions in the UI)
  const handleCompleteAllocation = async (allocationId) => {
    if (!allocationId) return;
    try {
      const confirm = await Swal.fire({
        title: 'Confirm Completion',
        text: 'Are you sure you want to mark this allocation as completed?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, complete',
        cancelButtonText: 'Cancel',
      });
      if (!confirm.isConfirmed) return;

      setLoadingAllocations(true);
      const res = await completePatientChargeAllocation(allocationId);

      // Optimistically update local allocations state so UI reflects change immediately
      setAllocations((prev) =>
        Array.isArray(prev)
          ? prev.map((it) => (String(it.id) === String(allocationId) ? { ...it, allocationStatus: 'COMPLETED' } : it))
          : prev
      );

      if (form.admissionId) {
        const updated = await getAllocationDetails(form.admissionId);
        setAllocations(Array.isArray(updated) ? updated : []);
      }

      // Inform user which endpoint was used (POST vs PUT fallback)
      try {
        const method = res?.method || (res && res.data ? 'UNKNOWN' : 'UNKNOWN');
        await Swal.fire({ icon: 'success', title: 'Completed', text: `Allocation completed (${method})` });
      } catch (err) {
        console.debug('Swal display error:', err);
      }
    } catch (err) {
      console.error("Failed to complete allocation:", err);
      await Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to complete allocation.' });
    } finally {
      setLoadingAllocations(false);
    }
  };



  // When a column search result is selected
  const handleSelectColumnSearchResult = (result) => {
    setForm((prev) => ({
      ...prev,
      admissionId: result.admissionId || "",
    }));
    setSearchAdmissionId(result.admissionId || "");
    setSearchPatientName(result.patientName || "");
    setSearchPhoneNumber(result.phoneNumber || result.contactNumber || "");
    // Normalize admissionDate into YYYY-MM-DD for the date input
    if (result.admissionDate) {
      const d = new Date(result.admissionDate);
      if (!Number.isNaN(d.getTime())) {
        setSearchAdmissionDate(d.toISOString().slice(0, 10));
      }
    }
    setActiveColumnDropdown(""); // close the dropdown
    // clear column search UI state
    setColumnSearchResults([]);
    setColumnSearchLoading(false);
  };

  // Utility to allow typing only at the end
  const allowOnlyEndTyping = (e, valueSetter) => {
    const { selectionStart, value } = e.target;
    // Only allow typing if caret is at the end
    if (selectionStart === value.length) {
      valueSetter(e.target.value);
      return true;
    }
    // Otherwise, do not update value
    e.preventDefault();
    return false;
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-black/30">
      <div
        className="relative bg-white"
        style={{
          width: 774,
          border: "1px solid rgba(221, 221, 221, 1)",
          background: "rgba(255, 255, 255, 1)",
          opacity: 1,
          padding: 20,
          borderRadius: 8,
        }}
      >
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 rounded-full cursor-pointer hover:bg-gray-100"
          aria-label="Close"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="15" cy="15" r="15" fill="#FF3A3A" />
            <path
              d="M20.2426 11.7574L16 16M16 16L11.7574 20.2426M16 16L20.2426 20.2426M16 16L11.7574 11.7574"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 style={{
          position: "absolute",
          top: 18,
          left: 22,
          fontFamily: "Inter, sans-serif",
          fontWeight: 600,
          fontSize: 16,
          lineHeight: "100%",
          color: "#1B3A6B",
          letterSpacing: 0,
          opacity: 1,
          backgroundColor: "rgba(255, 255, 255, 1)",
        }}>
          Patient Details
        </h2>

        <form onSubmit={handleSubmit} style={{ marginTop: 48 }}>

          {/* Patient Info Fields */}
          <div className="grid grid-cols-4 gap-5 mb-3">
            {/* ...existing code for patient info fields... */}
            <div className="flex flex-col">
              <label className="text-[14px] font-medium mb-2">Admission ID</label>
              <input
                type="text"
                name="admissionId"
                value={searchAdmissionId}
                onChange={(e) => {
                  if (allowOnlyEndTyping(e, setSearchAdmissionId)) {
                    setSearchPatientName("");
                    setSearchPhoneNumber("");
                    setSearchAdmissionDate("");
                    handleColumnSearch("admissionId", e.target.value);
                  }
                }}
                className="w-[179px] h-[35px] border border-[#DDDDDD] rounded-[8px] px-3 text-sm focus:outline-none bg-white"
                placeholder="Search Admission ID"
                autoComplete="off"
                disabled={!!patient}
                onFocus={() => setActiveColumnDropdown("admissionId")}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[14px] font-medium mb-2">Patient Name</label>
              <input
                type="text"
                name="patientName"
                value={searchPatientName}
                onChange={(e) => {
                  if (allowOnlyEndTyping(e, setSearchPatientName)) {
                    setSearchAdmissionId("");
                    setSearchPhoneNumber("");
                    setSearchAdmissionDate("");
                    handleColumnSearch("patientName", e.target.value);
                  }
                }}
                className="w-[179px] h-[35px] border border-[#DDDDDD] rounded-[8px] px-3 text-sm focus:outline-none bg-white"
                placeholder="Search Patient Name"
                autoComplete="off"
                disabled={!!patient}
                onFocus={() => setActiveColumnDropdown("patientName")}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[14px] font-medium mb-2">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={searchPhoneNumber}
                onChange={(e) => {
                  if (allowOnlyEndTyping(e, setSearchPhoneNumber)) {
                    setSearchAdmissionId("");
                    setSearchPatientName("");
                    setSearchAdmissionDate("");
                    handleColumnSearch("phoneNumber", e.target.value);
                  }
                }}
                className="w-[179px] h-[35px] border border-[#DDDDDD] rounded-[8px] px-3 text-sm focus:outline-none bg-white"
                placeholder="Search Phone Number"
                autoComplete="off"
                disabled={!!patient}
                onFocus={() => setActiveColumnDropdown("phoneNumber")}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[14px] font-medium mb-2">
                Date of Admission
              </label>
              {/* If we're not editing an existing patient allow searching by admission date */}
              {!patient ? (
                <input
                  type="date"
                  name="admissionDate"
                  value={searchAdmissionDate}
                  onChange={(e) => {
                    setSearchAdmissionDate(e.target.value);
                    // value will be YYYY-MM-DD from date input
                    handleColumnSearch("admissionDate", e.target.value);
                    // clear other search fields
                    setSearchAdmissionId("");
                    setSearchPatientName("");
                    setSearchPhoneNumber("");
                  }}
                  className="w-[179px] h-[35px] border border-[#DDDDDD] rounded-[8px] px-3 text-sm bg-white"
                  placeholder="YYYY-MM-DD"
                  autoComplete="off"
                  onFocus={() => setActiveColumnDropdown("admissionDate")}
                />
              ) : (
                <input
                  value={
                    selectedAdmission?.admissionDate
                      ? new Date(selectedAdmission.admissionDate).toLocaleDateString("en-GB")
                      : columnSearchResults.find(
                        (r) =>
                          r.admissionId === form.admissionId ||
                          r.patientName === searchPatientName ||
                          r.phoneNumber === searchPhoneNumber ||
                          r.contactNumber === searchPhoneNumber
                      )?.admissionDate
                        ? new Date(
                          columnSearchResults.find(
                            (r) =>
                              r.admissionId === form.admissionId ||
                              r.patientName === searchPatientName ||
                              r.phoneNumber === searchPhoneNumber ||
                              r.contactNumber === searchPhoneNumber
                          )?.admissionDate
                        ).toLocaleDateString("en-GB")
                        : ""
                  }
                  disabled
                  className="w-[179px] h-[35px] border border-[#DDDDDD] rounded-[8px] px-3 text-sm bg-gray-50"
                  placeholder="14/05/2025"
                />
              )}
            </div>
          </div>

          {/* Column search dropdown (appears when there are results for the focused column) */}
          {columnSearchResults && columnSearchResults.length > 0 && _activeColumnDropdown && (
            <div className="overflow-auto p-2 mt-2 max-h-48 bg-white rounded-md border border-gray-200 shadow">
              {columnSearchResults.map((r) => (
                <div
                  key={r.admissionId || r.id}
                  className="flex justify-between items-center px-3 py-2 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelectColumnSearchResult(r)}
                >
                  <div className="text-sm">
                    <div className="font-semibold">{r.patientName || "-"}</div>
                    <div className="text-xs text-slate-500">ID: {r.admissionId ?? "-"} • {r.phoneNumber ?? r.contactNumber ?? "-"}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {r.admissionDate ? new Date(r.admissionDate).toLocaleDateString("en-GB") : "-"}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* (iv) Allocation Section Title */}
          <h2 className="text-[14px] font-semibold text-[#00235A] mb-2 mt-2">
            Allocation of services & consumables
          </h2>

          <div className="mb-2">
            {/* First row: Charge Type, Select Service, Manage List, Charge all in one line */}
            <div className="flex flex-row gap-4 items-end">
              <div className="flex flex-col w-[190px]">
                <label className="text-[14px] font-medium mb-2">Charge Type</label>
                <select
                  name="chargeCategory"
                  value={chargeCategory}
                  onChange={(e) => handleChargeCategoryChange(e.target.value)}
                  className="w-full h-[35px] border rounded-[8px] px-3 text-sm bg-gray-50"
                >
                  <option value="">Select Charge Type</option>
                  <option value="Services">Services</option>
                  <option value="Consumables">Consumables</option>
                  <option value="Advance">Advance</option>
                </select>
              </div>
              {chargeCategory && (
                <>
                  {chargeCategory === "Advance" ? (
                    <>
                      <div className="flex flex-col w-[190px]">
                        <label className="text-[14px] font-medium mb-2">Select Advance</label>
                        <select
                          name="chargeTypeId"
                          value={form.chargeTypeId}
                          onChange={handleChange}
                          className="w-full h-[35px] border rounded-[8px] px-3 text-sm bg-white"
                        >
                          <option value="">Select advance type</option>
                          {filteredChargeTypes.map((ct) => (
                            <option key={ct.id} value={ct.id}>
                              {ct.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col w-[190px]">
                        <label className="text-[14px] font-medium mb-2">Amount</label>
                        <input
                          type="number"
                          name="charge"
                          value={form.charge}
                          onChange={handleChange}
                          className="w-full h-[35px] border rounded-[8px] px-3 text-sm bg-white"
                          placeholder="Enter amount"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-col w-[190px]">
                        <label className="text-[14px] font-medium mb-2">{chargeCategory === "Consumables" ? "Select Consumable" : "Select Service"}</label>
                        <select
                          name="chargeTypeId"
                          value={form.chargeTypeId}
                          onChange={handleChange}
                          className="w-full h-[35px] border rounded-[8px] px-3 text-sm bg-white"
                        >
                          <option value="">Select {chargeCategory === "Consumables" ? "consumable" : "service"}</option>
                          {filteredChargeTypes.map((ct) => (
                            <option key={ct.id} value={ct.id}>
                              {ct.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col w-[190px]">
                        <label className="text-[14px] font-medium mb-2">Manage List</label>
                        <select
                          name="manageListId"
                          value={form.manageListId}
                          onChange={handleChange}
                          className="w-full h-[35px] border rounded-[8px] px-3 text-sm bg-white"
                        >
                          <option value="">Select from list</option>
                          {manageList.map((ml) => (
                            <option key={ml.id} value={ml.id}>
                              {ml.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col w-[190px]">
                        <label className="text-[14px] font-medium mb-2">Charge</label>
                        <input
                          type={category === CATEGORY_CHARGEABLE ? "number" : "text"}
                          name="charge"
                          value={form.charge}
                          onChange={handleChange}
                          className="w-full h-[35px] border rounded-[8px] px-3 text-sm bg-white"
                          placeholder="₹ 5000.00"
                        />
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            {/* Second row: Discount and Discount percentage, no gap */}
            {chargeCategory && chargeCategory !== "Advance" && (
              <div className="flex flex-row gap-4 mt-2">
                <div className="flex flex-col w-[170px]">
                  <label className="text-[14px] font-medium mb-2">Discount</label>
                  <select
                    name="discountSelect"
                    value={form.discountId || ""}
                    onChange={handleDiscountSelect}
                    className="w-full h-[35px] border rounded-[8px] px-3 text-sm bg-white"
                  >
                    <option value="">Select discount</option>
                    <option value="__custom">Custom amount</option>
                    {discountsLoading ? (
                      <option disabled>Loading...</option>
                    ) : (
                      discounts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} {d.percentage ? `(${d.percentage}%)` : ""}
                        </option>
                      ))
                    )}
                  </select>

                </div>
                <div className="flex flex-col w-[170px]">
                  <label className="text-[14px] font-medium mb-2">Discount Percentage</label>
                  <input
                    type="text"
                    name="discountDescription"
                    value={form.discountDescription}
                    onChange={handleChange}
                    className="w-full h-[35px] border rounded-[8px] px-3 text-sm bg-white"
                    placeholder="35%"
                    disabled={form.discountId && form.discountId !== "__custom"}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit and Cancel buttons - show only when a charge type is selected to match UI */}
          {chargeCategory && (
            <div className="flex gap-4 justify-start mt-6 mb-4">
              <button
                type="submit"
                className="px-16 py-1 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Submit
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-16 py-1 text-gray-700 bg-white rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>

            </div>
          )}


          {/* (vii) Pagination Div */}
          <div className="flex gap-1 justify-end items-center">
            {/* dynamic pagination based on filtered results */}
            {/* <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-2 py-1 text-gray-500 rounded border border-gray-300 hover:bg-gray-100"
        >
          &lt;
        </button>
        {(() => {
          const all = Array.isArray(allocations) ? allocations : [];
          const filtered = serviceSearch
            ? all.filter((a) =>
                (a.chargeTypeName || "").toLowerCase().includes(serviceSearch.toLowerCase()) ||
                (a.manageListName || "").toLowerCase().includes(serviceSearch.toLowerCase())
              )
            : all;
          const totalPagesLocal = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
          const pages = Array.from({ length: totalPagesLocal }, (_, i) => i + 1);
          return pages.map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-2 py-1 text-sm border border-gray-300 rounded ${
                p === page ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p}
            </button>
          ));
        })()} */}
            {/* <button
          onClick={() => setPage((p) => p + 1)}
          className="px-2 py-1 text-gray-500 rounded border border-gray-300 hover:bg-gray-100"
        >
          &gt;
        </button> */}
          </div>
        </form>
      </div>
    </div>
  );

};
// PatientDetailsModal Component
const PatientDetailsModal = ({
  isOpen,
  onClose,
  patient,
  allocations = [],
  onAddAllocation,
  onGenerateBill,
}) => {

  // Helper for age calculation
  const getAge = (dobStr) => {
    if (!dobStr) return "";
    const dobDate = new Date(dobStr);
    const diff = Date.now() - dobDate.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // Format date/time
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Pagination for services history
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  // Remote allocations fetched from the admissions with allocations API
  const [remoteAllocations, setRemoteAllocations] = useState(null);

  // When modal opens, prefer fetching allocations from the admissions-with-allocations API
  React.useEffect(() => {
    let mounted = true;
    const fetchAllocations = async () => {
      const admId = patient?.admissionId;
      if (!admId) return;
      try {
        // Prefer the allocation details for the specific admission. This is a
        // direct and reliable source for allocations for a single admission.
        const list = await getPatientAllocationsByAdmissionId(admId);
        const allocs = Array.isArray(list) ? list : [];

        let finalAllocs = Array.isArray(allocs) ? allocs : [];
        // If the admissions API returned no allocations for this admission, try the allocation-details endpoint as a fallback
        if (finalAllocs.length === 0) {
          try {
            const fallback = await getAllocationDetails(admId);
            finalAllocs = Array.isArray(fallback) ? fallback : finalAllocs;
          } catch {
            // ignore fallback errors and keep finalAllocs as-is
          }
        }

        if (mounted) setRemoteAllocations(finalAllocs);
      } catch {
        if (mounted) setRemoteAllocations([]);
      }
    };


    if (isOpen) {
      fetchAllocations();
    } else {
      // reset when modal closed
      setRemoteAllocations(null);
    }
    return () => { mounted = false; };
  }, [isOpen, patient?.admissionId]);



  // Prefer remoteAllocations only when it's a non-empty array; otherwise fall back to the allocations prop
  const filteredAllocations = (Array.isArray(remoteAllocations) && remoteAllocations.length > 0)
    ? remoteAllocations
    : (Array.isArray(allocations) ? allocations : []);

  React.useEffect(() => { setPage(1); }, [allocations, remoteAllocations]);

  // Search filter for services
  const [serviceSearch, setServiceSearch] = React.useState("");
  const searched = serviceSearch
    ? filteredAllocations.filter(a =>
      (a.chargeTypeName || "").toLowerCase().includes(serviceSearch.toLowerCase()) ||
      (a.manageListName || "").toLowerCase().includes(serviceSearch.toLowerCase())
    )
    : filteredAllocations;
  const paginatedSearched = searched.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const searchedTotalPages = Math.ceil(searched.length / rowsPerPage);

  // Status popover state and handlers for completing / cancelling allocations
  const [statusPopoverOpen, setStatusPopoverOpen] = useState(null);
  // Track allocations that the user has manually changed in this session
  const [manualStatusMap, setManualStatusMap] = useState({});

  const refreshRemoteAllocations = async () => {
    try {
      const admId = patient?.admissionId;
      if (!admId) return;
      const list = await getPatientAllocationsByAdmissionId(admId);
      let allocs = Array.isArray(list) ? list : [];
      if (allocs.length === 0) {
        try {
          const fallback = await getAllocationDetails(admId);
          allocs = Array.isArray(fallback) ? fallback : allocs;
        } catch {
          // ignore
        }
      }
      setRemoteAllocations(allocs);
    } catch (err) {
      console.error("Failed to refresh remote allocations:", err);
    }
  };

  const handleCompleteAllocation = async (allocationId) => {
    if (!allocationId) return;
    try {
      // Find the current allocation to check its status
      const currentAllocation = Array.isArray(remoteAllocations)
        ? remoteAllocations.find((it) => String(it.id) === String(allocationId))
        : null;

      const currentStatus = currentAllocation?.allocationStatus ?? 'ACTIVE';
      const isCurrentlyCompleted = currentStatus.toUpperCase() === 'COMPLETED';

      const res = await completePatientChargeAllocation(allocationId);

      // Toggle between ACTIVE and COMPLETED
      const newStatus = isCurrentlyCompleted ? 'ACTIVE' : 'COMPLETED';

      // Optimistically update remote allocations state
      setRemoteAllocations((prev) =>
        Array.isArray(prev)
          ? prev.map((it) => (String(it.id) === String(allocationId) ? { ...it, allocationStatus: newStatus } : it))
          : prev
      );

      // Mark as manually updated in this session
      setManualStatusMap((m) => ({ ...m, [allocationId]: newStatus }));

      await refreshRemoteAllocations();

      // Inform user of the new status
      try {
        const method = res?.method || (res && res.data ? 'UNKNOWN' : 'UNKNOWN');
        const message = isCurrentlyCompleted ? 'marked as Active' : 'marked as Completed';
        await Swal.fire({ icon: 'success', title: 'Updated', text: `Allocation ${message} (${method})` });
      } catch (err) {
        console.debug('Swal display error:', err);
      }
    } catch (err) {
      console.error("Failed to update allocation:", err);
      await Swal.fire({ icon: 'error', title: 'Error', text: err.message || 'Failed to update allocation.' });
    } finally {
      setStatusPopoverOpen(null);
    }
  };

  // Patient details
  const {
    patientName,
    contactNumber,
    email,
    dateOfBirth,
    address,
    admissionId,
    patientId,
    admissionDate,
  } = patient || {};
  if (!isOpen || !patient) return null;
  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-opacity-10">
      <div className="bg-white rounded-xl shadow-2xl relative max-w-6xl mx-auto w-full p-6 max-h-[90vh] overflow-y-auto">
        <button
          className="flex absolute top-4 right-4 z-10 justify-center items-center w-8 h-8 text-2xl font-bold text-red-500 rounded-full transition-colors hover:text-red-600 bg-color-500 hover:bg-red-50"
          onClick={onClose}
        >
          ×
        </button>
        <div className="">
          {/* Patient Details Header */}
          <h2 className="mb-2 text-lg font-semibold text-slate-800">Patient Details</h2>
          <div className="flex flex-col gap-2 p-4 mb-6 bg-blue-50 rounded-md border border-blue-400">
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="text-2xl font-bold text-slate-900">{patientName || "-"}</div>
                <div className="flex gap-2 items-center mt-1 text-slate-600">
                  <span>📞Phone No: {contactNumber ?? "-"}</span>
                  <span>✉️ Email: {email ?? "-"}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm text-slate-700 min-w-[200px]">
                <div>
                  <span>🎂 DOB: </span>
                  <span>
                    {dateOfBirth
                      ? `${new Date(dateOfBirth).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })} (${getAge(dateOfBirth)} years)`
                      : "-"}
                  </span>
                </div>
                <div>
                  <span>🏠 Address: </span>
                  <span>{address ?? "-"}</span>
                </div>
                <div>
                  <span>🆔 Patient ID: {patientId ?? "-"}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 text-sm text-slate-700 min-w-[180px]">
                <div>
                  <span>🆔 Admission ID: </span>
                  <span className="font-semibold">#{admissionId ?? "-"}</span>
                </div>
                <div>
                  <span>📅 Admission Date: </span>
                  <span>
                    {admissionDate
                      ? new Date(admissionDate).toLocaleDateString("en-GB")
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Services History */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-semibold text-slate-800">Services History</span>
              <input
                type="text"
                placeholder="Search services..."
                className="px-3 py-2 w-64 h-10 text-sm rounded-lg border border-gray-300 text-slate-700 focus:border-blue-500 focus:outline-none"
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
              />
            </div>
            {/* Table - updated UI with Original Columns/Logic */}
            <div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mt-2">
              <div className="">
                <table className="min-w-full text-sm">
                  <thead className="font-medium text-black border-b border-black">
                    <tr className="h-12">
                      <th className="px-3 py-3 text-left">Date</th>
                      <th className="px-3 py-3 text-left">Charge Type</th>
                      <th className="px-3 py-3 text-left">Charge List</th>
                      <th className="px-3 py-3 text-left">Charge</th>
                      <th className="px-3 py-3 text-left">Discount</th>
                      <th className="px-3 py-3 text-left">Advance</th>
                      <th className="px-3 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSearched.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="py-8 text-center text-slate-500">
                          No services found.
                        </td>
                      </tr>
                    ) : (
                      paginatedSearched.map((a, idx) => (
                        <tr
                          key={a.id || idx}
                          className="h-10 border-b transition hover:bg-gray-50 odd:bg-white even:bg-blue-100"
                        >
                          <td className="px-2 py-2 whitespace-nowrap">
                            {a.createdAt ? formatDate(a.createdAt) : "-"}
                          </td>
                          <td className="px-2 py-2 font-semibold text-blue-600 whitespace-nowrap">
                            {a.chargeTypeName ?? "-"}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">{a.manageListName ?? "-"}</td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            {a.baseAmount !== undefined
                              ? `₹${Number(a.baseAmount).toFixed(2)}`
                              : "-"}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            {`₹${Number(a.discountAmount ?? 0).toFixed(2)}`}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            {a.advanceAmount !== undefined
                              ? `₹${Number(a.advanceAmount).toFixed(2)}`
                              : "-"}
                          </td>
                          <td className="px-2 py-2">
                            <div className="relative">
                              {(() => {
                                // Check work mode to determine status behavior
                                // Mask = ONE_TIME (non-editable, locked to Completed)
                                // Rooms = RECURRING (editable, Active → Completed)
                                const workMode = a.workMode ? a.workMode.toString() : 'Rooms';
                                const isMask = workMode === 'Mask';

                                // If Mask: always show "Completed" (non-editable)
                                // If Rooms: use allocation status and allow toggle
                                let status, displayLabel, isEditable;

                                if (isMask) {
                                  status = 'COMPLETED';
                                  displayLabel = 'Completed';
                                  isEditable = false;
                                } else {
                                  // Rooms mode
                                  const allocationStatus = a.allocationStatus ?? 'ACTIVE';
                                  const manual = manualStatusMap[a.id];
                                  status = manual ? manual.toString().toUpperCase() : allocationStatus.toString().toUpperCase();
                                  displayLabel = status === 'ACTIVE' ? 'Active' : 'Completed';
                                  isEditable = true;
                                }

                                return (
                                  <>
                                    <button
                                      className={`flex items-center gap-1 bg-transparent focus:outline-none cursor-pointer ${status === 'ACTIVE' ? 'text-green-600 font-medium' : 'text-blue-600 font-medium'}`}
                                      style={{
                                        cursor: isEditable ? 'pointer' : 'not-allowed'
                                      }}
                                      onClick={() => isEditable && setStatusPopoverOpen(prev => (prev === a.id ? null : a.id))}
                                      disabled={!isEditable}
                                    >
                                      {displayLabel}
                                      {isEditable && (
                                        <span className="inline-block ml-1 align-middle">
                                          <svg width="16" height="16" viewBox="0 0 16 16" fill="black" xmlns="http://www.w3.org/2000/svg">
                                            <polygon points="4,6 8,10 12,6" />
                                          </svg>
                                        </span>
                                      )}
                                    </button>

                                    {statusPopoverOpen === a.id && isEditable && !isMask && (
                                      <div className="absolute left-1/2 z-10 mt-2 bg-white rounded shadow -translate-x-1/2 w-33">
                                        {status === 'ACTIVE' && (
                                          <div
                                            className="px-4 py-2 text-xs font-semibold text-blue-600 cursor-pointer hover:bg-gray-100"
                                            onClick={async () => { setStatusPopoverOpen(null); await handleCompleteAllocation(a.id); }}
                                          >
                                            Mark as Completed
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <button
                className="px-4 py-2 bg-white rounded border border-gray-300 cursor-pointer hover:bg-blue-50"
                onClick={onAddAllocation}
              >
                Add new allocation
              </button>
              <div className="flex gap-2 items-center">
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border ${page === 1 || searchedTotalPages === 1
                    ? "border-gray-300 text-gray-300 bg-white"
                    : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"
                    }`}
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1 || searchedTotalPages === 1}
                  aria-label="Previous page"
                >
                  <span className="text-lg">&lt;</span>
                </button>
                {[...Array(searchedTotalPages).keys()].map(i => (
                  <button
                    key={i}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border ${page === i + 1
                      ? "bg-blue-600 text-white font-semibold"
                      : "border-gray-300 text-gray-700 bg-white hover:bg-blue-50"
                      }`}
                    onClick={() => setPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border ${page === searchedTotalPages || searchedTotalPages === 1
                    ? "border-gray-300 text-gray-300 bg-white"
                    : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"
                    }`}
                  onClick={() => setPage((prev) => Math.min(prev + 1, searchedTotalPages))}
                  disabled={page === searchedTotalPages || searchedTotalPages === 1}
                  aria-label="Next page"
                >
                  <span className="text-lg">&gt;</span>
                </button>
              </div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer rounded-lg px-8 py-2.5 font-medium text-sm transition-colors"
                onClick={onGenerateBill}
              >
                Generate bill &rarr;
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modals removed - handled directly in status popover */}
    </div>
  );
};

// Modal Component
const PatientAllocationModal = ({ isOpen, children }) => {
  if (!isOpen) return null;
  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center bg-opacity-10">
      <div className="">

        <div className="p-8">{children}</div>
      </div>
    </div>
  );
};

// Main Component
const PatientLifecycle = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("lifecycle"); // FIX: useState, not React.useState
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAllocations, setPatientAllocations] = useState([]);

  // Paging state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(9);

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        // Use the stable admissions/details endpoint (used elsewhere in the app)
        // This reliably returns admission records which we normalize for UI.
        const res = await getPatientsAdmissionDetails();
        // Backend may return an array or an object with several wrapper shapes.
        const rawCandidates = Array.isArray(res) ? res : (res && (res.data ?? res.items ?? res.admissions ?? res.result ?? res.results)) ?? [];
        const list = Array.isArray(rawCandidates) ? rawCandidates : [];

        const normalized = list.map((it) => {
          // helper to safely read nested patient fields
          const patientObj = it.patient ?? it.patientInfo ?? it.patient_details ?? it.patientDetails ?? null;

          const admissionId = it.admissionId ?? it.admission_id ?? it.id ?? (it.admission && (it.admission.id ?? it.admission.admissionId)) ?? (patientObj && (patientObj.admissionId ?? patientObj.admission_id)) ?? null;

          const patientName = it.patientName ?? it.patient_name ?? it.name ?? (patientObj && (patientObj.name ?? patientObj.fullName ?? patientObj.displayName)) ?? "-";

          const phoneNumber = it.phoneNumber ?? it.phone_number ?? it.contactNumber ?? it.phone ?? (patientObj && (patientObj.phone ?? patientObj.mobile ?? patientObj.contact)) ?? "-";

          return {
            admissionId,
            patientName,
            phoneNumber,
            email: it.email ?? (patientObj && (patientObj.email)) ?? null,
            dateOfBirth: it.dateOfBirth ?? it.dob ?? (patientObj && (patientObj.dob ?? patientObj.dateOfBirth)) ?? null,
            address: it.address ?? (patientObj && patientObj.address) ?? null,
            patientId: it.patientId ?? it.patient_id ?? (patientObj && (patientObj.id ?? patientObj.patientId)) ?? null,
            admissionDate: it.admissionDate ?? it.admission_date ?? it.createdAt ?? it.created_at ?? null,
            raw: it,
          };
        });

        setPatients(normalized.filter(p => p && (p.admissionId || p.patientName)));
      } catch (err) {
        console.error("Failed to load patients:", err);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    loadPatients();
  }, []);

  const handleViewPatient = (patient) => {
    // Map patient fields to ensure modal gets all required info
    const mappedPatient = {
      ...patient,
      phoneNumber: patient.phoneNumber || patient.contactNumber || "-",
      email: patient.email || "-",
      dateOfBirth: "1990-01-01", // Mock date
      address: "123 Main St, City", // Mock address
      patientId: patient.patientId || "-",
      admissionDate: patient.admissionDate || "-",
    };
    setSelectedPatient(mappedPatient);
    setIsModalOpen(true);
    // Load allocations for this admission from backend
    (async () => {
      try {
        const res = await getAllocationDetails(mappedPatient.admissionId);
        setPatientAllocations(Array.isArray(res) ? res : []);
      } catch (err) {
        console.error("Failed to load patient allocations:", err);
        setPatientAllocations([]);
      }
    })();
  };

  const handleAllocationSuccess = () => {
    // Refresh allocations for the selected patient
    (async () => {
      if (selectedPatient?.admissionId) {
        try {
          const res = await getAllocationDetails(selectedPatient.admissionId);
          setPatientAllocations(Array.isArray(res) ? res : []);
        } catch (err) {
          console.error("Failed to refresh patient allocations:", err);
        }
      }
    })();
  };

  // Handler for "Add new allocation" in modal
  const handleAddAllocation = () => {
    setSelectedPatient(null);
    setPatientAllocations([]);
    setIsModalOpen(true);
  };

  // Handler for "Generate bill" in modal
  const handleGenerateBill = () => {
    alert("Generate bill functionality not implemented.");
  };

  // Paging logic
  const totalPages = Math.max(1, Math.ceil(patients.length / rowsPerPage));
  const paginatedPatients = patients.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [patients]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Excel export handler
  const handleDownloadExcel = () => {
    const data = patients.map((p, idx) => ({
      "S. No.": idx + 1,
      "Patient Name": p.patientName,
      "Admission ID": p.admissionId,
      "Phone No.": p.phoneNumber,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Patients");
    XLSX.writeFile(wb, "patient_lifecycle.xlsx");
  };

  // PDF export handler
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    doc.text("Patient Lifecycle", 40, 30);
    const tableColumn = [
      "S. No.",
      "Patient Name",
      "Admission ID",
      "Phone No.",
    ];
    const tableRows = patients.map((p, idx) => [
      idx + 1,
      p.patientName,
      p.admissionId,
      p.phoneNumber,
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
    doc.save("patient_lifecycle.pdf");
  };

  return (
    <div className="mt-2 bg-slate-50 font-inter">
      {/* Tabs */}
      <div className="flex gap-2 items-center mb-1 w-full">
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter cursor-pointer font-medium text-[12px] leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "admission"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          style={{ marginTop: 0, marginBottom: 0 }}
          onClick={() => {
            setActiveTab("admission");
            navigate("/HospitalManagement/ipd-management");
          }}
        >
          Patient Admission
        </button>
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter cursor-pointer font-medium text-[12px] leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "lifecycle"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          style={{ marginTop: 0, marginBottom: 0 }}
          onClick={() => {
            setActiveTab("lifecycle");
          }}
        >
          Patient Lifecycle
        </button>
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium cursor-pointer text-[12px] leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "billing"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          style={{ marginTop: 0, marginBottom: 0 }}
          onClick={() => {
            setActiveTab("billing");
            navigate("/HospitalManagement/billing"); // <-- Add this to enable navigation
          }}
        >
          Billing
        </button>
        <button
          className={`w-[150px] h-[32px] rounded-[80px] font-inter font-medium text-[12px] cursor-pointer leading-[100%] tracking-normal focus:outline-none transition-all
            ${activeTab === "history"
              ? "bg-blue-800 text-white shadow"
              : "bg-transparent text-black"}
          `}
          onClick={() => navigate("/HospitalManagement/patient-history")}
        >
          Patient History
        </button>
      </div>

      {/* Top actions: Match IpdManagement layout */}
      <div className="flex flex-col md:flex-row">
        <button
          className="bg-blue-700  text-white rounded-lg w-[163px] cursor-pointer h-[35px] opacity-100 mb-3 text-size-sm "
          onClick={() => {
            setSelectedPatient(null);
            setPatientAllocations([]);
            setIsModalOpen(true);
          }}
        >
          + Patient Allocation
        </button>
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

      {/* Filters */}
      <div className="flex gap-1 items-center mb-2">
        <input
          type="text"
          placeholder="Search"
          className="px-2 py-2 w-56 h-10 text-sm rounded-lg border border-gray-300 text-slate-700 focus:border-blue-500 focus:outline-none"
        />
        <input
          type="date"
          className="px-3 py-2 w-40 h-10 text-sm rounded-lg border border-gray-300 text-slate-700 focus:border-blue-500 focus:outline-none"
        />
        <span className="text-sm font-medium text-slate-400">TO</span>
        <input
          type="date"
          className="px-3 py-2 w-40 h-10 text-sm rounded-lg border border-gray-300 text-slate-700 focus:border-blue-500 focus:outline-none"
        />
        <select className="px-3 py-2 w-40 h-10 text-sm rounded-lg border border-gray-300 text-slate-700 focus:border-blue-500 focus:outline-none">
          <option>Status</option>
        </select>
        <div className="flex-1" />
      </div>

      {/* Table - updated UI to match Advance.jsx */}
      <div className="flex flex-col h-[320px] bg-white rounded-md shadow-sm mt-2">
        <div className="">
          <table className="min-w-full text-sm">
            <thead className="font-medium text-black border-b border-black">
              <tr className="h-12">
                <th className="px-3 py-3 text-left">S. No.</th>
                <th className="px-3 py-3 text-left">Admission Id</th>
                <th className="px-3 py-3 text-left">Patient Name</th>
                <th className="px-3 py-3 text-left">Phone Number</th>
                <th className="px-3 py-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="" />
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center">
                    Loading...
                  </td>
                </tr>
              ) : paginatedPatients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 font-medium text-center text-gray-500">
                    No admitted patients found.
                  </td>
                </tr>
              ) : (
                paginatedPatients.map((patient, index) => (
                  <tr
                    key={patient.admissionId || index}
                    className="h-10 border-b transition hover:bg-gray-50 odd:bg-white even:bg-blue-100"
                  >
                    <td className="px-2 py-2">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                    <td className="px-2 py-2 font-semibold text-blue-600">{patient.admissionId}</td>
                    <td className="px-2 py-2">{patient.patientName}</td>
                    <td className="px-2 py-2">{patient.phoneNumber}</td>
                    <td className="px-2 py-2">
                      <Eye
                        className="transition-opacity cursor-pointer hover:opacity-80"
                        title="View"
                        style={{ color: "#0052FF", width: 16, height: 16 }}
                        onClick={() => handleViewPatient(patient)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex gap-2 justify-center items-center mt-2 text-xs">
          <button
            className={`w-8 h-8 flex items-center justify-center rounded-lg border ${currentPage === 1 || totalPages === 1 ? "border-gray-300 text-gray-300 bg-white" : "border-gray-300 text-gray-500 bg-white hover:bg-blue-50"}`}
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || totalPages === 1}
            aria-label="Previous page"
          >
            <span className="text-lg">&lt;</span>
          </button>
          <button
            className="flex justify-center items-center w-8 h-8 font-bold text-white bg-blue-600 rounded-lg shadow-md"
            disabled
            aria-label="Current page"
          >
            {patients.length === 0 ? 0 : currentPage}
          </button>
          <span className="mx-1 font-semibold text-black">of</span>
          <button
            className="flex justify-center items-center w-8 h-8 font-bold text-blue-600 bg-white rounded-lg border border-blue-500 shadow-md"
            disabled
            aria-label="Total pages"
          >
            {patients.length === 0 ? 0 : totalPages}
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

      {/* Patient Modals */}
      <PatientDetailsModal
        isOpen={!!selectedPatient && isModalOpen}
        onClose={() => setIsModalOpen(false)}
        patient={selectedPatient}
        allocations={patientAllocations}
        onAddAllocation={handleAddAllocation}
        onGenerateBill={handleGenerateBill}
      />
      {!selectedPatient && (
        <PatientAllocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <PatientAllocationForm
            patient={selectedPatient}
            onCancel={() => setIsModalOpen(false)}
            onSuccess={handleAllocationSuccess}
          />
        </PatientAllocationModal>
      )}
    </div>
  );
};

export default PatientLifecycle;
