// constants.js - Place this in src/utils/ or src/constants/

// Validation Regex Patterns
export const VALIDATION_REGEX = {
  GST: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/,
  PAN: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_DIGITS: /^[0-9]*$/
};

// Form Field Lengths
export const FIELD_LENGTHS = {
  PHONE: 10,
  GST: 15,
  PAN: 10,
  MIN_PASSWORD: 8,
  MAX_CUSTOMER_NAME: 100,
  MAX_EMAIL: 255,
};

// Pagination Constants
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 8,
  CUSTOMER_PAGE_SIZE: 10,
  CONTACT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
  PAGE_SIZE: 10,
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_GST: "Invalid GST Number. It must be a 15-character alphanumeric code.",
  INVALID_PAN: "Invalid PAN Number. It must be in the format ABCDE1234F.",
  INVALID_EMAIL: "Invalid email format. Please enter a valid email address.",
  INVALID_PHONE: "Phone number must be exactly 10 digits.",
  INVALID_PHONE_LENGTH: "mobile number must be exactly 10 digits.",
  REQUIRED_FIELD: "This field is required.",
  NETWORK_ERROR: "Network error. Please try again.",
  UNAUTHORIZED: "You don't have permission to perform this action.",
  SERVER_ERROR: "Server error. Please try again later.",
  TITLE: "Error",
  UPDATE_FAILED: "Failed to update customer. Please try again.",
  AUTH_TITLE: "Authentication Error",
  AUTH_TEXT: "User session has expired. Please login again.",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  CUSTOMER_CREATED: "Customer created successfully!",
  CUSTOMER_UPDATED: "Customer updated successfully!",
  CUSTOMER_DELETED: "Customer deleted successfully!",
  CONTACT_CREATED: "Contact created successfully!",
  CONTACT_UPDATED: "Contact updated successfully!",
  CONTACT_DELETED: "Contact deleted successfully!",
  CUSTOMER_FLAGGED: "Customer flagged successfully!",
  VERIFICATION_UPDATED: "Verification status updated successfully!",
  APPROVED_TITLE: "Approved!",
  APPROVED_TEXT: "Customer request has been approved.",
  REJECTED_TITLE: "Rejected!",
  REJECTED_TEXT: "Customer request has been rejected.",
  RESUBMITTED_TITLE: "Resubmitted!",
  RESUBMITTED_TEXT: "Customer request has been marked as Resubmitted.",
};

// API Permissions
export const API_PERMISSIONS = {
  CREATE_CUSTOMER: "create_customer",
  CREATE_CONTACT: "create_contact",
  UPDATE_CUSTOMER: "update_customer",
  DELETE_CUSTOMER: "delete_customer",
  UPDATE_CONTACT: "update_contact",
  DELETE_CONTACT: "delete_contact",
  FLAG_CUSTOMER: "flag_customer",
};

// Customer Stages
export const CUSTOMER_STAGES = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  FLAGGED: "Flagged",
  RESUBMITTED: "Resubmitted",
};

// Customer Status
export const CUSTOMER_STATUS = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

// Contact Status
export const CONTACT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
};

// Update Stage Colors to include hex values for SweetAlert
export const STAGE_COLORS = {
  [CUSTOMER_STAGES.PENDING]: "text-yellow-600 bg-yellow-100",
  [CUSTOMER_STAGES.APPROVED]: "text-green-700 bg-green-100",
  [CUSTOMER_STAGES.REJECTED]: "text-red-700 bg-red-100",
  [CUSTOMER_STAGES.FLAGGED]: "text-orange-700 bg-orange-100",
  [CUSTOMER_STAGES.RESUBMITTED]: "text-blue-700 bg-blue-100",

  // Add hex color values for SweetAlert buttons
  APPROVED: "#10b981", // green
  REJECTED: "#ef4444", // red
};

// Modal Types
export const MODAL_TYPES = {
  CREATE_CUSTOMER: "create_customer",
  EDIT_CUSTOMER: "edit_customer",
  CUSTOMER_DETAILS: "customer_details",
  CREATE_CONTACT: "create_contact",
  EDIT_CONTACT: "edit_contact",
  CONTACT_DETAILS: "contact_details",
  FLAG_REASON: "flag_reason",
};                                                                                                                                                                                                                                                                                                                                        

// Table Configuration
export const TABLE_CONFIG = {
  MIN_HEIGHT: "h-[60vh]",
  MOBILE_BREAKPOINT: "sm",
  TABLET_BREAKPOINT: "md",
};

// Form Default Values
export const DEFAULT_CUSTOMER = {
  customer_name: "",
  phone_number: "",
  email_id: "",
  address: "",
  country: "",
  state: "",
  city: "",
  pincode: "",
  tan_number: "",
  gst_number: "",
  pan_no: "",
};

export const DEFAULT_CONTACT = {
  contact_person: "",
  email_id: "",
  phone_num: "",
  address: "",
  country: "",
  state: "",
  city: "",
  pincode: "",
  department: "",
  designation: "",
  date_of_start: "",
  date_of_end: "",
  status: CONTACT_STATUS.ACTIVE,
};

// Filter Configuration
export const FILTER_TYPES = {
  SEARCH: "search",
  SELECT: "select",
  DATE_RANGE: "dateRange",
  MULTI_SELECT: "multiSelect",
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: "DD/MM/YYYY",
  API: "YYYY-MM-DD",
  DATETIME_DISPLAY: "DD/MM/YYYY HH:mm",
  DATETIME_API: "YYYY-MM-DD HH:mm:ss",
};

// Animation Durations (for any animations you might add)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
};

