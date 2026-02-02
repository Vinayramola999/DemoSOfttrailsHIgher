// Centralized API endpoints — read from environment variables
const API = {
  API_BASE: process.env.REACT_APP_API_BASE || "",
  PURCHASE_API: process.env.REACT_APP_PURCHASE_API || "",
  WORKFLOW_API: process.env.REACT_APP_WORKFLOW_API || "",
  PRO_API: process.env.REACT_APP_PRO_API || "",
  COLUMN_TYPES_API: process.env.REACT_APP_COLUMN_TYPES_API || "",
  DMS_UPLOAD: process.env.REACT_APP_DMS_UPLOAD || "",
  DMS_MAPPING_CHECK: process.env.REACT_APP_DMS_MAPPING_CHECK || "",
};

export default API;
