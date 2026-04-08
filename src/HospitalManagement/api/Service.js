import axios from "axios";

const BASE_URL = 'http://hospital.softtrails.net/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// POST: Register a patient
export const createPatient = async (formData) => {
  try {
    const response = await api.post("/patients/register", formData);
    return response.data;
  } catch (error) {
    console.error("Error in createPatient:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to submit form."
    );
  }
};

// PUT: Update (register) a patient
export const updatePatient = async (formData) => {
  try {
    const id = formData.patientId || formData.id;
    const response = await api.put(`/patients/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error in updatePatient:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to update patient details."
    );
  }
};

// GET: Fetch all patients
export const getPatients = async () => {
  try {
    const response = await api.get("/patients");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch patients."
    );
  }
};



// POST: Register insurance information
export const createInsurance = async (insurance) => {
  try {
    const response = await api.post("/patients/", insurance);
    return response.data;
  } catch (error) {
    console.error("Error in createInsurance:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to submit insurance information."
    );
  }
};

// (Optional) Wrapper for createInsurance, can be removed if not needed
export const registerInsurance = async (formData) => {
  return await createInsurance(formData);
};

// GET: Fetch all insurance information
export const getInsurance = async () => {
  try {
    const response = await api.get("/insurance");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch insurance information."
    );
  }
};



// GET: Fetch phone numbers and patient names for all patients
export const getPatientPhone = async (phone) => {
  try {
    const response = await api.get(`/patients/phone/${phone}`)
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient phone numbers."
    );
  }
};

// GET: Check DMS mapping and get publish_id
export const getDmsPublishId = async (service_name, doctype, doc_name) => {
  if (!service_name || !doctype || !doc_name) {
    throw new Error("Missing required query parameters: service_name, doctype, doc_name");
  }

  const url = `http://13.204.15.86:3002/mapping/check`;
const token= sessionStorage.getItem("token");
  try {
    const response = await axios.get(url, {
      params: { service_name, doctype, doc_name },
      timeout: 10000,
      headers: {
        Authorization: `Bearer ${token}`,
    }});

    if (response.data && response.data.dms_publish_id) {
      return response.data.dms_publish_id;
    } else if (response.data && response.data.error) {
      throw new Error(response.data.error);
    } else {
      throw new Error("Unknown error from DMS mapping check API");
    }
  } catch (error) {
    throw new Error(
      error.response?.data?.error || error.message || "Failed to check DMS mapping."
    );
  }
};


// POST: Upload a document to DMS (updated to use mapping check)
export const uploadDocument = async (
  file,
  {
    service_name = "new patient",
    doctype = "POI",
    doc_name = "identity proof",
    user_id = 5,
    document_name = file.name,
    ref = "HMS",
    custom_folder = "HMS"
  } = {}
) => {
  // Get publish_id from DMS mapping check  
  let publish_id;
  try {
    publish_id = await getDmsPublishId(service_name, doctype, doc_name);
  } catch (err) {
    throw new Error(`DMS Mapping Error: ${err.message}`);
  }

  console.log("Uploading document:", {
    service_name,
    doctype,
    doc_name,
    publish_id,
    user_id,
    document_name,
    ref,
    custom_folder
  });
  const url = "http://13.204.15.86:3002/dmsapi/upload-documents";
  const formData = new FormData();
  formData.append("documents", file);
  formData.append("ref", ref);
  formData.append("custom_folder", custom_folder);

  const metadataArr = [{
    service: service_name,
    publish_id,
    user_id,
    document_name,
  }];
  formData.append("metadata", JSON.stringify(metadataArr));
  const token = sessionStorage.getItem("token");
  formData.append("token", token);

  const response = await axios.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`
    },
    timeout: 30000,
  });
  return response.data;
};




// GET: Fetch patient by ID
export const getPatientById = async (id) => {
  try {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient by ID."
    );
  }
};

// POST: Admit a patient
export const admitPatient = async (payload) => {
  try {
    const response = await api.post("/admissions", payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to admit patient."
    );
  }
};

// GET: Fetch all patients admission details
export const getPatientsAdmissionDetails = async () => {
  try {
    const response = await api.get("/admissions/details");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch patients admission details."
    );
  }
};

// 1. GET: Search Admissions

// Use this to find patients based on search filters (admissionId, patientName, phoneNumber, admissionDate)
export const searchAdmissions = async (params = {}) => {
  try {
    const response = await api.get("/admissions/search", { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error in searchAdmissions:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to search admissions."
    );
  }
};

// GET: Search Admissions by Admission ID, Patient Name, Phone Number, Admission Date
/**
 * Search admissions endpoint.
 * Accepts either:
 * - a search string (will be sent as the `q` query param), or
 * - an object with any of: { admissionId, patientName, phoneNumber, admissionDate }
 * The function normalizes keys and formats `admissionDate` to YYYY-MM-DD when provided.
 */
export const getAdmissionsBySearch = async (searchParams) => {
  try {
    // Allow passing a single string or an object
    let params = {};
    if (!searchParams) {
      params = {};
    } else if (typeof searchParams === 'string') {
      // Backend often supports a generic `q` parameter for free-text search
      params.q = searchParams;
    } else if (typeof searchParams === 'object') {
      const { admissionId, patientName, phoneNumber, admissionDate, q } = searchParams;
      if (admissionId !== undefined && admissionId !== null && String(admissionId).trim() !== '') {
        params.admissionId = String(admissionId).trim();
      }
      if (patientName !== undefined && patientName !== null && String(patientName).trim() !== '') {
        params.patientName = String(patientName).trim();
      }
      if (phoneNumber !== undefined && phoneNumber !== null && String(phoneNumber).trim() !== '') {
        params.phoneNumber = String(phoneNumber).trim();
      }
      if (admissionDate) {
        // Try to parse & format dates to YYYY-MM-DD which many backends expect
        const d = new Date(admissionDate);
        if (!Number.isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          params.admissionDate = `${y}-${m}-${day}`;
        } else if (typeof admissionDate === 'string' && admissionDate.includes('-')) {
          // if already looks like ISO, pass through
          params.admissionDate = admissionDate;
        }
      }
      // support `q` as well if provided
      if (q && !params.q) params.q = q;
    }

    // Default to only currently admitted patients unless caller explicitly requests otherwise
    if (params.admissionStatus === undefined && params.status === undefined && params.admissionStatus !== null) {
      params.admissionStatus = 'ADMITTED';
    }

    const response = await api.get('/admissions/search', { params });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error in getAdmissionsBySearch:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to search admissions.'
    );
  }
};

// 2. GET: Get Patient Admission History
// Fetch all past admissions for a specific patient
export const getPatientAdmissionHistory = async (patientId) => {
  try {
    if (!patientId) {
      throw new Error("Patient ID is required.");
    }
    const response = await api.get(`/patient-charge-allocation/patient-history/${patientId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error in getPatientAdmissionHistory:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient admission history."
    );
  }
};

// PUT: update admission status by ID
export const updatePatientAdmissionStatus = async (id, payload) => {
  try {
    const response = await api.put(`/admissions/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error in updatePatientAdmissionStatus:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to update patient admission status."
    );
  }
};

export const getPatientHistoryAllocationDetails = async (admissionId) => {
  try {
    const response = await api.get(`/patient-charge-allocation/allocation-details/${admissionId}`);
    const raw = response.data;

    // Normalize possible backend shapes
    let items = [];
    if (Array.isArray(raw)) items = raw;
    else if (raw && Array.isArray(raw.data)) items = raw.data;
    else if (raw && Array.isArray(raw.items)) items = raw.items;
    else if (raw && typeof raw === 'object') items = raw.allocations ?? raw.items ?? raw.data ?? [];
    if (!Array.isArray(items)) items = [];

    const mapped = items.map((it) => {
      const start = it.startTime ?? it.start_time ?? it.createdAt ?? it.created_at ?? null;
      const end = it.endTime ?? it.end_time ?? null;
      const base = it.baseAmount ?? it.base_amount ?? it.unitPrice ?? it.unit_price ?? it.charge ?? 0;
      const discount = it.discountAmount ?? it.discount_amount ?? 0;
      const taxPerc = it.taxPercentage ?? it.tax_percentage ?? 0;
      const taxAmt = it.taxAmount ?? it.tax_amount ?? 0;
      const totalBefore = it.totalBeforeDiscount ?? it.total_before_discount ?? it.totalBefore ?? it.total_before ?? 0;
      const totalAfter = it.totalAfterDiscount ?? it.total_after_discount ?? it.totalAfter ?? it.total_after ?? it.total ?? 0;

      return {
        id: it.allocationId ?? it.id ?? null,
        allocationId: it.allocationId ?? it.id ?? null,
        chargeTypeName: it.chargeTypeName ?? (it.chargeType && it.chargeType.name) ?? it.charge_type_name ?? it.name ?? null,
        manageListName: it.manageListName ?? (it.manageList && it.manageList.name) ?? it.manage_list_name ?? it.label ?? null,
        workMode: it.workMode ?? it.work_mode ?? null,
        allocationStatus: (it.allocationStatus ?? it.status ?? 'ACTIVE'),
        quantity: Number(it.quantity ?? it.qty ?? it.count ?? 1) || 0,
        startTime: start,
        endTime: end,
        createdAt: start,
        baseAmount: Number(base) || 0,
        discountAmount: Number(discount) || 0,
        discountDescription: it.discountDescription ?? it.discount_description ?? null,
        taxPercentage: Number(taxPerc) || 0,
        taxAmount: Number(taxAmt) || 0,
        totalBeforeDiscount: Number(totalBefore) || 0,
        totalAfterDiscount: Number(totalAfter) || 0,
        frequency: it.frequency ?? it.workMode ?? it.work_mode ?? null,
        advanceAmount: Number(it.advanceAmount ?? it.advance_amount ?? it.advance ?? 0) || 0,
        raw: it,
      };
    });

    return mapped;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch allocation details for patient history."
    );
  }
};

// CHARGE TYPES API

// POST: Create a new charge type
export const createChargeType = async (chargeTypeData) => {
  try {
    const response = await api.post("/charge-types", chargeTypeData);
    return response.data;
  } catch (error) {
    console.error("Error in createChargeType:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Failed to create charge type."
    );
  }
};



// GET: Fetch all charge types
export const getChargeTypes = async () => {
  try {
    const response = await api.get('charge-types');
    return response.data;
  } catch (error) {
    // If 404, return empty array instead of throwing
    if (error.response && error.response.status === 404) {
      return [];
    }
    // Optionally log or handle other errors
    return [];
  }
};

// GET: Charge types with id only

export const getChargeTypeIds = async () => {
  try {
    const response = await api.get("charge-types/id");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch charge type id."
    );
  }
};

// GET: Fetch only ACTIVE charge types
export const getActiveChargeTypes = async () => {
  try {
    const response = await api.get("charge-types");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch active charge types."
    );
  }
};

// Get ChargeType by ID

export const getChargeTypeById = async (id) => {
  try {
    const response = await api.get(`/charge-types/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch charge type by ID."
    );
  }
};  


// Get Active Services
export const getActiveServices = async () => {
  try {
    // Use explicit backend URL for services
    const response = await api.get('/charge-types/active/services', { timeout: 10000 });

    // Normalize response to an array of objects
    const raw = response.data;
    let items = [];
    if (Array.isArray(raw)) items = raw;
    else if (raw && Array.isArray(raw.data)) items = raw.data;
    else if (raw && Array.isArray(raw.items)) items = raw.items;
    else if (raw && typeof raw === 'object') items = [raw];

    return items.map((it) => ({
      id: it.id,
      name: it.name ?? it.displayName ?? it.chargeTypeName ?? it.label ?? "",
      // UI expects category values like "CHARGEABLE" or "ADVANCE"; normalize to uppercase
      category: (it.category ?? "CHARGEABLE").toString().toUpperCase(),
      // robust charge detection
      charge: Number(it.unitPrice ?? it.charge ?? it.rate ?? it.amount ?? 0) || 0,
      defaultCharge: Number(it.unitPrice ?? it.charge ?? it.rate ?? it.amount ?? 0) || 0,
      raw: it,
    }));
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch active services."
    );
  }
};

// Get Active Consumables
export const getActiveConsumables = async () => {
  try {
    // Use explicit backend URL for consumables
    const response = await api.get('/charge-types/active/consumables', { timeout: 10000 });

    const raw = response.data;  
    let items = [];
    if (Array.isArray(raw)) items = raw;
    else if (raw && Array.isArray(raw.data)) items = raw.data;
    else if (raw && Array.isArray(raw.items)) items = raw.items;
    else if (raw && typeof raw === 'object') items = [raw];

    return items.map((it) => ({
      id: it.id,
      name: it.name ?? it.displayName ?? it.chargeTypeName ?? it.label ?? "",
      category: (it.category ?? "CHARGEABLE").toString().toUpperCase(),
      charge: Number(it.unitPrice ?? it.charge ?? it.rate ?? it.amount ?? 0) || 0,
      defaultCharge: Number(it.unitPrice ?? it.charge ?? it.rate ?? it.amount ?? 0) || 0,
      raw: it,
    }));
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch active consumables."
    );
  }
};


// Update status of charge type by ID
export const updateChargeTypeStatusById = async (id, status) => {
  try {
    const response = await api.put(`/charge-types/${id}/status=INACTIVE`, { status });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update charge type status."
    );
  }
};

// GET: Fetch charge types by category
export const getChargeTypesByCategory = async (category) => {
  try {
    const response = await api.get(`/charge-types/category/${category}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch charge types by category."
    );
  }
};

// GET: Fetch charge types by category
export const getChargeTypesByActiveCategory = async (category) => {
  try {
    const response = await api.get(`/charge-types/active/category/${category}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch charge types by category."
    );
  }
};

// GET: Fetch only active chargeable charge types
export const getActiveChargeableChargeTypes = async () => {
  try {
    const response = await api.get("charge-types");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch active chargeable charge types."
    );
  }
};



// PUT: Update charge type
// export const updateChargeType = async (id, data) => {
//   try {
//     const response = await api.put(`/charge-types/${id}`, data);
//     return response.data;
//   } catch (error) {
//     throw new Error(
//       error.response?.data?.message || "Failed to update charge type."
//     );
//   }
// };

// DELETE: Delete charge type by ID
export const deleteChargeTypeById = async (id) => {
  try {
    const response = await api.delete(`/charge-types/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to delete charge type."
    );
  }
};

// // PUT: Update active charge type by ID (custom API)
export const updateActiveChargeTypeById = async (id, status) => {
  if (!status || typeof status !== 'string' || !status.trim()) {
    throw new Error('Status is required and must be a non-empty string.');
  }
  try {
    const response = await api.put(`/charge-types/${id}`, { status });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update active charge type."
    );
  }
};

// MANAGE LIST APIs
// 2 POST: Add item to charge type table
export const addManageListItem = async (id, data) => {
  try {
    const response = await api.post(`/manage-list`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to add item to manage list."
    );
  }
};

// GET: Fetch only data
export const getaddManageListItem = async (id) => {
  try {
    const config = {};
    if (id !== undefined && id !== null) {
      config.params = { chargeTypeId: id };
    }
    const response = await api.get(`/manage-list`, config);
    // Normalize backend shape to what the UI expects.
    // Handle cases where API returns the array directly or wrapped inside an object.
    let data = [];
    if (Array.isArray(response.data)) {
      data = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      data = response.data.data;
    } else if (response.data && Array.isArray(response.data.items)) {
      data = response.data.items;
    } else if (response.data && typeof response.data === 'object') {
      // If it's a single object, wrap it
      data = [response.data];
    }
    const normalized = data.map((item) => {
  // Determine charge: backend may return unitPrice or charge. Ensure it's a number.
  let charge = item.unitPrice !== undefined ? item.unitPrice : item.charge !== undefined ? item.charge : 0;
  charge = charge === null || charge === undefined || charge === '' ? 0 : Number(charge) || 0;
      // Determine a sensible quantity for display: prefer availableQuantity, then totalCapacity, then maxQuantity
  const quantity = item.availableQuantity ?? item.totalCapacity ?? item.maxQuantity ?? item.quantity ?? 0;

  // Normalize createdAt: backend may send createdAt or created_at
  const createdAt = item.createdAt ?? item.created_at ?? item.createdOn ?? null;

      return {
  // keep original fields where useful
  id: item.id,
    name: item.name ?? item.displayName ?? item.label ?? item.manageListName ?? "",
    // normalize chargeTypeId from different possible backend fields
    chargeTypeId: item.chargeTypeId ?? item.charge_type_id ?? item.chargeType ?? (item.chargeType && item.chargeType.id) ?? null,
    chargeTypeName: item.chargeTypeName ?? (item.chargeType && item.chargeType.name) ?? null,
        description: item.description,
        uom: item.uom,
        status: item.status,
  createdAt,
        // normalized fields expected by ManageList.jsx
        charge,
        unitPrice: item.unitPrice ?? item.charge ?? null,
        quantity,
        maxQuantity: item.maxQuantity,
        availableQuantity: item.availableQuantity,
        totalCapacity: item.totalCapacity,
        allocatedCapacity: item.allocatedCapacity,
        taxApplicable: item.taxApplicable,
        taxPercentage: item.taxPercentage,
      };
    });
    return normalized;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to add item to manage list."
    );
  }
};



// // GET: Get all items by charge type
export const getManageListItems = async (chargeTypeId) => {
  try {
    // The API to return all manage-list items (no chargeType filter)
    const url = `http://65.1.86.178:9000/api/manage-list`;
    const token = sessionStorage.getItem("token");
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });

    // Normalize similar to getaddManageListItem: backend may return array or wrapped object
    let data = [];
    if (Array.isArray(response.data)) {
      data = response.data;
    } else if (response.data && Array.isArray(response.data.data)) {
      data = response.data.data;
    } else if (response.data && Array.isArray(response.data.items)) {
      data = response.data.items;
    } else if (response.data && typeof response.data === 'object') {
      data = [response.data];
    }

    const normalized = data.map((item) => {
      let charge = item.unitPrice !== undefined ? item.unitPrice : item.charge !== undefined ? item.charge : 0;
      charge = charge === null || charge === undefined || charge === '' ? 0 : Number(charge) || 0;
      const quantity = item.availableQuantity ?? item.totalCapacity ?? item.maxQuantity ?? item.quantity ?? 0;
      const createdAt = item.createdAt ?? item.created_at ?? item.createdOn ?? null;

      return {
        id: item.id,
        name: item.name ?? item.displayName ?? item.label ?? item.manageListName ?? "",
        chargeTypeId: item.chargeTypeId ?? item.charge_type_id ?? item.chargeType ?? (item.chargeType && item.chargeType.id) ?? null,
        chargeTypeName: item.chargeTypeName ?? (item.chargeType && item.chargeType.name) ?? null,
        description: item.description,
        uom: item.uom,
        status: item.status,
        createdAt,
        charge,
        unitPrice: item.unitPrice ?? item.charge ?? null,
        quantity,
        maxQuantity: item.maxQuantity,
        availableQuantity: item.availableQuantity,
        totalCapacity: item.totalCapacity,
        allocatedCapacity: item.allocatedCapacity,
        taxApplicable: item.taxApplicable,
        taxPercentage: item.taxPercentage,
      };
    });

    // If a chargeTypeId was provided, filter client-side so callers that expect filtered lists still work
    if (chargeTypeId) {
      return normalized.filter((it) => String(it.chargeTypeId) === String(chargeTypeId));
    }

    return normalized;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch manage list items."
    );
  }
};

// 1 GET: Get specific item by ID
export const getManageListItemById = async (id) => {
  try {
    const response = await api.get(`/manage-list/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch manage list item by ID."
    );
  }
};

// PUT: Update item in charge type table
export const updateManageListItem = async (id, data) => {
  try {
    const response = await api.put(`/manage-list/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update manage list item."
    );
  }
};

// DELETE: Delete item from charge type table
// export const deleteManageListItem = async (id) => {
//   try {
//     const response = await api.delete(`/manage-list/${id}`);
//     return response.data;
//   } catch (error) {
//     throw new Error(
//       error.response?.data?.message || "Failed to delete manage list item."
//     );
//   }
// };

// GET: Status of manage list item
export const getManageListItemStatus = async (status) => {
  try {
    const response = await api.get(`/manage-list/status/${status}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch manage list item status."
    );
  }
};

// 3 PATCH: Update status of manage list item by ID
export const updateManageListItemStatus = async (id, status) => {
  try {
    const response = await api.patch(`/manage-list/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update manage list item status."
    );
  }
};

// PATCH: Update status of a charge type by ID
export const updateChargeTypeStatus = async (id, status) => {
  try {
    const response = await api.patch(`charge-types/${id}/status?status=${status}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update charge type status."
    );
  }
};




// POST: Create a new patient charge allocation (Service/Consumable/Advance)
export const createPatientChargeAllocation = async (payload) => {
  try {
    const response = await api.post('/patient-charge-allocation', payload);
    return response.data;
  } catch (error) {
    console.error('Error in createPatientChargeAllocation:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to create patient charge allocation.'
    );
  }
};

// PUT: Update allocation (update discount or status)
export const updatePatientChargeAllocation = async (id, payload) => {
  try {
    const response = await api.put(`/patient-charge-allocation/${id}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error in updatePatientChargeAllocation:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to update patient charge allocation.'
    );
  }
};

// GET: Get allocation by ID
export const getAllocationById = async (id) => {
  try {
    const response = await api.get(`/patient-charge-allocation/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error in getAllocationById:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to get allocation details.'
    );
  }
};

// GET: Get all allocations for an admission
export const getAllocationsForAdmission = async (admissionId) => {
  try {
    const response = await api.get(`/patient-charge-allocation/admission/${admissionId}`);
    return response.data;
  } catch (error) {
    console.error('Error in getAllocationsForAdmission:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to get allocations for admission.'
    );
  }
};

// POST: Complete allocation with recurring calculation
export const completePatientChargeAllocation = async (id) => {
  try {
  
    try {
      const response = await api.post(`/patient-charge-allocation/${id}/complete`);
      console.debug('completePatientChargeAllocation: used POST /complete', { id, status: response?.status });
      return { data: response.data, method: 'POST' };
    } catch (err) {
      console.debug('completePatientChargeAllocation POST failed, trying PUT fallback:', err?.response?.status || err?.message || err);
      const fallbackResponse = await api.put(`/patient-charge-allocation/${id}`, { allocationStatus: 'COMPLETED' });
      console.debug('completePatientChargeAllocation: used PUT /{id} fallback', { id, status: fallbackResponse?.status });
      return { data: fallbackResponse.data, method: 'PUT' };
    }
  } catch (error) {
    console.error('Error in completePatientChargeAllocation:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to complete allocation.'
    );
  }
};

// GET: Get detailed allocation breakdown for admission
export const getAllocationDetails = async (admissionId) => {
  try {
    const response = await api.get(`/patient-charge-allocation/allocation-details/${admissionId}`);
    // Normalize backend payload to a consistent shape the UI expects.
    const raw = response.data;
    let items = [];
    if (Array.isArray(raw)) items = raw;
    else if (raw && Array.isArray(raw.data)) items = raw.data;
    else if (raw && Array.isArray(raw.items)) items = raw.items;
    else if (raw && typeof raw === 'object') items = [raw];

    const mapped = items.map((it) => {
      const start = it.startTime ?? it.start_time ?? it.createdAt ?? it.created_at ?? null;
      const end = it.endTime ?? it.end_time ?? null;
      const base = it.baseAmount ?? it.base_amount ?? it.unitPrice ?? it.unit_price ?? it.charge ?? 0;
      const discount = it.discountAmount ?? it.discount_amount ?? 0;
      const taxPerc = it.taxPercentage ?? it.tax_percentage ?? 0;
      const taxAmt = it.taxAmount ?? it.tax_amount ?? 0;
      const totalBefore = it.totalBeforeDiscount ?? it.total_before_discount ?? it.totalBefore ?? it.total_before ?? 0;
      const totalAfter = it.totalAfterDiscount ?? it.total_after_discount ?? it.totalAfter ?? it.total_after ?? it.total ?? 0;

      return {
        id: it.allocationId ?? it.id,
        allocationId: it.allocationId ?? it.id,
        chargeTypeName: it.chargeTypeName ?? (it.chargeType && it.chargeType.name) ?? it.charge_type_name ?? null,
        manageListName: it.manageListName ?? (it.manageList && it.manageList.name) ?? it.manage_list_name ?? null,
        workMode: it.workMode ?? it.work_mode ?? null,
        allocationStatus: (it.allocationStatus ?? it.status ?? 'ACTIVE'),
        startTime: start,
        endTime: end,
        createdAt: start,
        baseAmount: Number(base) || 0,
        discountAmount: Number(discount) || 0,
        discountDescription: it.discountDescription ?? it.discount_description ?? null,
        taxPercentage: Number(taxPerc) || 0,
        taxAmount: Number(taxAmt) || 0,
        totalBeforeDiscount: Number(totalBefore) || 0,
        totalAfterDiscount: Number(totalAfter) || 0,
        frequency: it.frequency ?? it.workMode ?? null,
        advanceAmount: Number(it.advanceAmount ?? it.advance_amount ?? 0) || 0,
        raw: it,
      };
    });

    return mapped;
  } catch (error) {
    console.error('Error in getAllocationDetails:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to get allocation details.'
    );
  }
};

// POST: Cancel allocation
export const cancelAllocation = async (id) => {
  try {
    const response = await api.post(`/patient-charge-allocation/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error in cancelAllocation:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to cancel allocation.'
    );
  }
};


// admission controller

// Get allocations by admission ID
export const getPatientChargeAllocationsByAdmissionId = async (admissionId) => {
  try {
    const response = await api.get(`patient-charge-allocation/allocation-details/${admissionId}`);
    // Normalize same as getAllocationDetails to keep UI consistent
    const raw = response.data;
    let items = [];
    if (Array.isArray(raw)) items = raw;
    else if (raw && Array.isArray(raw.data)) items = raw.data;
    else if (raw && Array.isArray(raw.items)) items = raw.items;
    else if (raw && typeof raw === 'object') items = [raw];

    return items.map((it) => ({
      id: it.allocationId ?? it.id,
      allocationId: it.allocationId ?? it.id,
      chargeTypeName: it.chargeTypeName ?? (it.chargeType && it.chargeType.name) ?? it.charge_type_name ?? null,
      manageListName: it.manageListName ?? (it.manageList && it.manageList.name) ?? it.manage_list_name ?? null,
      workMode: it.workMode ?? it.work_mode ?? null,
      allocationStatus: (it.allocationStatus ?? it.status ?? 'ACTIVE'),
      startTime: it.startTime ?? it.start_time ?? it.createdAt ?? it.created_at ?? null,
      endTime: it.endTime ?? it.end_time ?? null,
      createdAt: it.startTime ?? it.createdAt ?? it.created_at ?? null,
      baseAmount: Number(it.baseAmount ?? it.base_amount ?? it.unitPrice ?? it.unit_price ?? it.charge ?? 0) || 0,
      discountAmount: Number(it.discountAmount ?? it.discount_amount ?? 0) || 0,
      discountDescription: it.discountDescription ?? it.discount_description ?? null,
      taxPercentage: Number(it.taxPercentage ?? it.tax_percentage ?? 0) || 0,
      taxAmount: Number(it.taxAmount ?? it.tax_amount ?? 0) || 0,
      totalBeforeDiscount: Number(it.totalBeforeDiscount ?? it.total_before_discount ?? it.totalBefore ?? it.total_before ?? 0) || 0,
      totalAfterDiscount: Number(it.totalAfterDiscount ?? it.total_after_discount ?? it.totalAfter ?? it.total_after ?? it.total ?? 0) || 0,
      frequency: it.frequency ?? it.workMode ?? null,
      advanceAmount: Number(it.advanceAmount ?? it.advance_amount ?? 0) || 0,
      raw: it,
    }));
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient allocations."
    );
  }
};


// Get by search
export const searchPatientChargeAllocations = async (query) => {
  try {
    const response = await api.get(`admissions/search`, { params: { q: query } });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to search patient charge allocations."
    );
  }
};

//post allocations by admission
export const createPatientAllocationsByAdmissionId = async (payload) => {
  try {
    const response = await api.post(`patient-charge-allocation`, payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create patient charge allocations."
    );
  }
};

  //Get allocations by admission ID
export const getPatientAllocationsByAdmissionId = async (admissionId) => {
  try {
    const response = await api.get(`patient-charge-allocation/allocation-details/${admissionId}`);
    const raw = response.data;
    let items = [];
    if (Array.isArray(raw)) items = raw;
    else if (raw && Array.isArray(raw.data)) items = raw.data;
    else if (raw && Array.isArray(raw.items)) items = raw.items;
    else if (raw && typeof raw === 'object') items = [raw];

    return items.map((it) => ({
      id: it.allocationId ?? it.id,
      allocationId: it.allocationId ?? it.id,
      chargeTypeName: it.chargeTypeName ?? (it.chargeType && it.chargeType.name) ?? it.charge_type_name ?? null,
      manageListName: it.manageListName ?? (it.manageList && it.manageList.name) ?? it.manage_list_name ?? null,
      workMode: it.workMode ?? it.work_mode ?? null,
      allocationStatus: (it.allocationStatus ?? it.status ?? 'ACTIVE'),
      startTime: it.startTime ?? it.start_time ?? it.createdAt ?? it.created_at ?? null,
      endTime: it.endTime ?? it.end_time ?? null,
      createdAt: it.startTime ?? it.createdAt ?? it.created_at ?? null,
      baseAmount: Number(it.baseAmount ?? it.base_amount ?? it.unitPrice ?? it.unit_price ?? it.charge ?? 0) || 0,
      discountAmount: Number(it.discountAmount ?? it.discount_amount ?? 0) || 0,
      discountDescription: it.discountDescription ?? it.discount_description ?? null,
      taxPercentage: Number(it.taxPercentage ?? it.tax_percentage ?? 0) || 0,
      taxAmount: Number(it.taxAmount ?? it.tax_amount ?? 0) || 0,
      totalBeforeDiscount: Number(it.totalBeforeDiscount ?? it.total_before_discount ?? it.totalBefore ?? it.total_before ?? 0) || 0,
      totalAfterDiscount: Number(it.totalAfterDiscount ?? it.total_after_discount ?? it.totalAfter ?? it.total_after ?? it.total ?? 0) || 0,
      frequency: it.frequency ?? it.workMode ?? null,
      advanceAmount: Number(it.advanceAmount ?? it.advance_amount ?? 0) || 0,
      raw: it,
    }));
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch patient allocations."
    );
  }
};

// Get admissions with allocations
export const getAdmissionsWithAllocations = async () => {
  try {
    const response = await api.get("admissions/api/admissions/with-allocations");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch admissions with allocations."
    );
  }
};



// ADVANCE TYPES API

// POST: Create a new advance type
export const createAdvanceType = async (advanceTypeData) => {
  // advanceTypeData: { name, description, status }
  try {
    const response = await api.post("/advance-types", advanceTypeData);
    return response.data;
  } catch (error) {
    // 400 if name exists
    throw new Error(
      error.response?.data?.message || "Failed to create advance type."
    );
  }
};

// GET: Fetch all advance types
export const getAdvanceTypes = async () => {
  try {
    // explicit backend URL for advance types
    const response = await api.get('/advance-types', { timeout: 10000 });
    const raw = response.data;
    let items = [];
    if (Array.isArray(raw)) items = raw;
    else if (raw && Array.isArray(raw.data)) items = raw.data;
    else if (raw && Array.isArray(raw.items)) items = raw.items;
    else if (raw && typeof raw === 'object') items = [raw];

    return items.map((it) => ({
      id: it.id,
      name: it.name ?? it.displayName ?? it.label ?? "",
      // Mark advance types with ADVANCE so UI filtering works
      category: it.category ?? "ADVANCE",
      // Normalize status from multiple possible backend shapes (boolean, number, string, nested)
      status: (() => {
        const s = it.status ?? it.active ?? it.isActive ?? it.is_active ?? null;
        if (s === null || s === undefined) return null;
        if (typeof s === 'boolean') return s ? 'ACTIVE' : 'INACTIVE';
        if (typeof s === 'number') return s === 1 ? 'ACTIVE' : s === 0 ? 'INACTIVE' : String(s).toUpperCase();
        try {
          return String(s).toUpperCase();
        } catch {
          return null;
        }
      })(),
      // normalize createdAt and description to be usable by UI
      createdAt: it.createdAt ?? it.created_at ?? it.createdOn ?? null,
      description: it.description ?? it.desc ?? it.details ?? null,
      charge: it.amount ?? it.defaultAmount ?? it.unitPrice ?? it.charge ?? 0,
      defaultCharge: it.amount ?? it.defaultAmount ?? it.unitPrice ?? it.charge ?? 0,
      raw: it,
    }));
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch advance types."
    );
  }
};

// GET: Fetch advance type by ID
export const getAdvanceTypeById = async (id) => {
  try {
    const response = await api.get(`/advance-types/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch advance type by ID."
    );
  }
};

// GET: Fetch only ACTIVE advance types
export const getActiveAdvanceTypes = async () => {
  try {
    const response = await api.get("/advance-types/active");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch active advance types."
    );
  }
};

// PATCH: Update status of advance type by ID
export const updateAdvanceTypeStatus = async (id, status) => {
  if (!status || (status !== "ACTIVE" && status !== "INACTIVE")) {
    throw new Error("Status must be 'ACTIVE' or 'INACTIVE'.");
  }
  try {
    const response = await api.patch(`/advance-types/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update advance type status."
    );
  }
};

// DISCOUNT APIs

// POST: Create a new discount
export const createDiscount = async (discountData) => {
  // discountData: { name, description, percentage, status }
  if (!discountData.name || typeof discountData.name !== "string" || !discountData.name.trim()) {
    throw new Error("Discount name is required and cannot be empty.");
  }
  if (typeof discountData.percentage !== "number" || discountData.percentage < 0 || discountData.percentage > 100) {
    throw new Error("Discount percentage must be between 0 and 100.");
  }
  try {
    const response = await api.post("/discounts", discountData);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to create discount."
    );
  }
};

// GET: Fetch all discounts
export const getDiscounts = async () => {
  try {
    const response = await api.get("/discounts");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch discounts."
    );
  }
};

// GET: Fetch discounts from explicit external service URL (used by UI where required)
export const getDiscountsExternal = async () => {
  try {
    const url = "http://65.1.86.178:9000/api/discounts";
    const token = sessionStorage.getItem("token");
    const response = await axios.get(url, { 
      timeout: 10000,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    // Expect an array payload like the example in the ticket
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Error fetching external discounts:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Failed to fetch external discounts.");
  }
};

// GET: Fetch discount by ID
export const getDiscountById = async (id) => {
  try {
    const response = await api.get(`/discounts/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || `Discount not found with id: ${id}`
    );
  }
};

// GET: Fetch only ACTIVE discounts
export const getActiveDiscounts = async () => {
  try {
    const response = await api.get("/discounts/active");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to fetch active discounts."
    );
  }
};

// PATCH: Update status of discount by ID
export const updateDiscountStatus = async (id, status) => {
  if (!status || (status !== "ACTIVE" && status !== "INACTIVE")) {
    throw new Error("Status must be 'ACTIVE' or 'INACTIVE'.");
  }
  try {
    const response = await api.patch(`/discounts/${id}/status`, null, {
      params: { status }
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || `Discount not found with id: ${id}`
    );
  }
};


// Billing API

// GET:  Preview Bill

export const previewBill = async (admissionId) => {
  try {
    const response = await api.get(`/billing/${admissionId}/preview`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      
      throw new Error(`No bill found for admission id: ${admissionId}`);
    }
    throw new Error(
      error.response?.data?.message || "Failed to preview bill."
    );
  }
};


// GET: Final Bill

export const getFinalizedBill = async (admissionId) => {
  try {
    const response = await api.get(`/billing/${admissionId}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      
      throw new Error(`No finalized bill found for admission id: ${admissionId}`);
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch finalized bill."
    );
  }
};

// POST: Generate final bill for an admission

export const generateFinalBill = async (admissionId, insuranceAmount = 0) => {
  try {
    const payload = { insuranceAmount: insuranceAmount === undefined || insuranceAmount === null ? 0 : Number(insuranceAmount) };
    const response = await api.post(`/billing/${admissionId}/final`, payload, {
      params: { insuranceAmount: payload.insuranceAmount }
    });
    return response.data;
  } catch (error) {
    console.error('Error in generateFinalBill:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || error.response?.data || "Failed to generate final bill."
    );
  }
};



//* Inventory API

// 1. UNIT APIs

//  POST: Create a new unit
export const createUnit = async (unitData) => {
  try {
    const response = await api.post('/units', unitData);
    return response.data;
  } catch (error) {
    console.error('Error in createUnit:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to create unit.'
    );
  }
};

// GET: Fetch all units (Admin View - both ACTIVE and INACTIVE)
export const getUnits = async () => {
  try {
    const response = await api.get('/units');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error in getUnits:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch units.'
    );
  }
};

// GET: Fetch ACTIVE units only (For Item Form Dropdown)
export const getActiveUnits = async () => {
  try {
    const response = await api.get('/units/active');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error in getActiveUnits:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch active units.'
    );
  }
};

// PATCH: Change Unit Status
export const updateUnitStatus = async (id, status) => {
  try {
    const response = await api.patch(`/units/${id}/status?status=${status}`);
    return response.data;
  } catch (error) {
    console.error('Error in updateUnitStatus:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to update unit status.'
    );
  }
};

// // DELETE: Delete unit by ID
// export const deleteUnit = async (id) => {
//   try {
//     const response = await api.delete(`/units/${id}`);
//     return response.data;
//   } catch (error) {
//     console.error('Error in deleteUnit:', error.response?.data || error.message);
//     throw new Error(
//       error.response?.data?.message || 'Failed to delete unit.'
//     );
//   }
// };


// ITEM CATEGORY APIs

// POST: Create a new item category
export const createItemCategory = async (categoryData) => {
  try {
    const response = await api.post('/item-categories', categoryData);
    return response.data;
  } catch (error) {
    console.error('Error in createItemCategory:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to create item category.'
    );
  }
};

// GET: Fetch all item categories (Admin View)
export const getItemCategories = async () => {
  try {
    const response = await api.get('/item-categories');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error in getItemCategories:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch item categories.'
    );
  }
};

// GET: Fetch ACTIVE categories by Item Type (systemCategory)
export const getItemCategoriesByType = async (systemCategory) => {
  if (!systemCategory) {
    throw new Error('systemCategory is required');
  }
  try {
    const response = await api.get(`/item-categories/type/${systemCategory}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error('Error in getItemCategoriesByType:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || `Failed to fetch categories for type ${systemCategory}.`
    );
  }
};

// PATCH: Change Item Category Status
export const updateItemCategoryStatus = async (id, status) => {
  try {
    const response = await api.patch(`/item-categories/${id}/status?status=${status}`);
    return response.data;
  } catch (error) {
    console.error('Error in updateItemCategoryStatus:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to update item category status.'
    );
  }
};

//🔹 3. ITEM MASTER APIs

// POST: Create a new item master

export const createItemMaster = async (itemData) => {
  try {
    const response = await api.post('/items', itemData);
    return response.data;
  } catch (error) {
    console.error('Error in createItemMaster:', error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || 'Failed to create item master.'
    );
  }
};



export const getItemById = async (itemId) => {
  if (!itemId || Number(itemId) <= 0) {
    throw new Error('Valid itemId is required.');
  }
  try {
    const response = await api.get(`/items/${itemId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch item.'
    );
  }
};

export const receiveInventoryStock = async (payload) => {
  if (!payload || Number(payload.itemId) <= 0) {
    throw new Error('Valid itemId is required.');
  }
  if (!payload.quantity || Number(payload.quantity) <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }
  try {
    const response = await api.post('/inventory/receive', payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to receive stock.'
    );
  }
};

export const issueInventoryStock = async (payload) => {
  if (!payload || Number(payload.itemId) <= 0) {
    throw new Error('Valid itemId is required.');
  }
  if (!payload.quantity || Number(payload.quantity) <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }
  try {
    const response = await api.post('/inventory/issue', payload);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to issue stock.'
    );
  }
};

export const getInventorySummary = async () => {
  try {
    const response = await api.get('/inventory/summary');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch stock summary.'
    );
  }
};

export const getInventorySummaryByItem = async (itemId) => {
  if (!itemId || Number(itemId) <= 0) {
    throw new Error('Valid itemId is required.');
  }
  try {
    const response = await api.get(`/inventory/summary/${itemId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch item summary.'
    );
  }
};

export const getInventoryLogsByItem = async (itemId) => {
  if (!itemId || Number(itemId) <= 0) {
    throw new Error('Valid itemId is required.');
  }
  try {
    const response = await api.get(`/inventory/logs/item/${itemId}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch item logs.'
    );
  }
};

export const getInventoryLogs = async () => {
  try {
    const response = await api.get('/inventory/logs');
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Failed to fetch logs.'
    );
  }
};
