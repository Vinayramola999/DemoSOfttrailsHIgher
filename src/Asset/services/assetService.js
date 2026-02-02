import axios from "axios";
import { DMS_BASE, JAVA_BASE, ASSET_NODE_BASE, UCS_BASE, MAIN_BASE } from "../../config/apiBase";

// Helper to get token
const getAuthHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  };
};

// Helper for file upload headers (multipart/form-data)
const getFileUploadHeaders = () => {
  const token = sessionStorage.getItem("token");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      // Content-Type is automatically set by axios for FormData
    },
  };
};

export const assetService = {
  // Categories
  fetchCategories: async () => {
    const response = await axios.get(`${JAVA_BASE}api/categories/movable`, getAuthHeaders());
    return response.data || [];
  },

  // Table Data
  fetchTableData: async (categoryName, offset, limit, search) => {
    const params = {
      offset,
      limit,
      status: "Repository",
      type: "Movable",
      search,
    };
    const response = await axios.get(
      `${ASSET_NODE_BASE}getColumnTypesAndData/${categoryName}`,
      { ...getAuthHeaders(), params }
    );
    return response.data;
  },

  fetchAllAssets: async (page = 1, limit = 50, search = "") => {
    const params = {
      type: "Movable",
      status: "Repository",
      page,
      limit,
      search,
    };
    
    const response = await axios.get(
      `${ASSET_NODE_BASE}getPendingAssetsByTypess`, 
      { ...getAuthHeaders(), params }
    );
    return response.data;
  },

  // Asset Operations
  createAsset: async (payload, categoryName) => {
    const url = `${ASSET_NODE_BASE}insert/${encodeURIComponent(categoryName)}`;
    const response = await axios.post(url, payload, getAuthHeaders());
    return response.data;
  },

  updateAsset: async (payload) => {
    const url = `${ASSET_NODE_BASE}assettable/update`;
    const response = await axios.put(url, payload, getAuthHeaders());
    return response.data;
  },

  deleteAsset: async (uniqueId, categoryName) => {
    const url = `${JAVA_BASE}api/crud/delete/${categoryName}/${uniqueId}`;
    const response = await axios.delete(url, getAuthHeaders());
    return response.data;
  },

  // File Upload (DMS)
  fetchUploadServices: async () => {
    const response = await axios.get(`${DMS_BASE}dmsapi/upload`, getAuthHeaders());
    return response.data;
  },

  fetchDocumentTypes: async (serviceId) => {
    const response = await axios.get(
      `${DMS_BASE}dmsapi/upload?service_id=${serviceId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  fetchAllowedDocuments: async (serviceId, docTypeId) => {
    const response = await axios.get(
      `${DMS_BASE}dmsapi/upload?service_id=${serviceId}&doctype_id=${docTypeId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  fetchFormats: async (serviceId, docTypeId, allowDocId) => {
    const response = await axios.get(
      `${DMS_BASE}dmsapi/upload?service_id=${serviceId}&doctype_id=${docTypeId}&allow_doc_id=${allowDocId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  fetchMappings: async () => {
    const response = await axios.get(`${DMS_BASE}mapping`, getAuthHeaders());
    return response.data;
  },

  getDmsPublishId: async () => {
    const response = await axios.get(
      `${DMS_BASE}mapping/check?service_name=Asset Management&doctype=Movable Assets&doc_name=Movable Assets`,
      getAuthHeaders()
    );
    return response.data?.dms_publish_id;
  },

  uploadFileToDMS: async (formData) => {
    const response = await axios.post(
      `${DMS_BASE}dmsapi/upload-documents`,
      formData,
      getFileUploadHeaders()
    );
    return response.data;
  },

  // Bulk Upload
  bulkUpload: async (category, formData) => {
    const response = await axios.post(
      `${ASSET_NODE_BASE}assets/api/bulkdata/upload-excel/${category}`,
      formData,
      getFileUploadHeaders()
    );
    return response.data;
  },

  // Approval
  approveAsset: async (uniqueId, payload) => {
    const response = await axios.put(
      `${ASSET_NODE_BASE}lifecycle/update-asset-status/${uniqueId}`,
      payload,
      getAuthHeaders()
    );
    return response.data;
  },

  logAssetHistory: async (payload) => {
    const response = await axios.post(
      `${JAVA_BASE}api/assethistory/insert-history`,
      payload,
      getAuthHeaders()
    );
    return response.data;
  },

  // Users & Notifications
  fetchApproverUsers: async (categoryId) => {
    const response = await axios.get(
      `${JAVA_BASE}workflow/users-by-category/${categoryId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  fetchModules: async () => {
    const response = await axios.get(`${UCS_BASE}api/modules`);
    return response.data;
  },

  sendNotification: async (payload) => {
    const response = await axios.post(
      `${UCS_BASE}ucs/send`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  },
  
  fetchUserData: async (userId) => {
      const response = await axios.get(
          `${MAIN_BASE}users/id_user/${userId}`,
          getAuthHeaders()
      );
      return response.data;
  }
};
