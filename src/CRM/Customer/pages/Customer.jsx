import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { EditIcon, DeleteIcon, ContactIcon, FlagIcon } from "../component/Icons";
import { Country, State, City } from "country-state-city";
import axios from "axios";
import Swal from "sweetalert2";
import excelIcon from "../../../assests/excel.png";
import folderIcon from "../../../assests/folder.png";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
// Import constants
import {
  VALIDATION_REGEX,
  FIELD_LENGTHS,
  PAGINATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  API_PERMISSIONS,
  CUSTOMER_STAGES,
  CUSTOMER_STATUS,
  CONTACT_STATUS,
  STAGE_COLORS,
  DEFAULT_CUSTOMER,
  DEFAULT_CONTACT,
  TABLE_CONFIG,
} from "../utils/constants";
// Custom hooks
import useCustomerData from "../../hooks/useCustomerData";
import useFormValidation from "../../hooks/useFormValidation";
import useAccessControl from "../../hooks/useAccessControl";
// Component imports
import ContactFormModal from "../modals/ContactFormModal";
import CustomerFormModal from "../modals/CustomerFormModal";
import CustomerDetailsModal from "../modals/CustomerDetailsModal";
import ContactDetailsModal from "../modals/ContactDetailsModal";
import CustomerFilters from "../component/CustomerFilters";
import CustomerTable from "../component/CustomerTable";
import Pagination from "../component/pagination";
import LoadingSpinner from "../component/LoadingSpinner";
import ErrorBoundary from "../component/ErrorBoundary";
import ConfirmationModal from "../../../NewComponents/ConfirmationModal";
import MessageModal from "../../../NewComponents/MessageModal";
import "../../../App.css";
const Customer = () => {
  const API_BASE_URL = process.env.REACT_APP_API_CRM_BASE_URL;
  const navigate = useNavigate();

  // ============================================================================
  // CUSTOM HOOKS
  // ============================================================================
  // Data management hook
  const {
    customers,
    loading,
    contactDetails,
    loadingContacts,
    fetchCustomers,
    createCustomer,
    updateCustomerData,
    deleteCustomer,
    flagCustomer,
    verifyCustomer,
    fetchContactDetails,
    createContact,
    updateContactData,
    deleteContact,
  } = useCustomerData();
  // Form validation hook
  const {
    errors: validationErrors,
    validateField,
    validateForm,
    clearErrors: clearValidationErrors,
  } = useFormValidation();

  // Access control hook
  const { permissions, checkAccess } = useAccessControl(API_BASE_URL);

  // ============================================================================
  // LOCAL STATE MANAGEMENT
  // ============================================================================
  // Modal states
  const [modals, setModals] = useState({
    customer: false,
    contact: false,
    editContact: false,
    customerDetails: false,
    contactDetails: false,
    flagReason: false,
  });
  // Form states
  const [newCustomer, setNewCustomer] = useState(DEFAULT_CUSTOMER);
  const [newContact, setNewContact] = useState(DEFAULT_CONTACT);

  // Edit and selection states
  const [editState, setEditState] = useState({
    isEditMode: false,
    currentCustomerIndex: null,
    selectedCustomerId: null,
    selectedCustomer: null,
    selectedContact: null,
    editingContact: null,
  });
  // Error states
  const [errors, setErrors] = useState({
    general: "",
    pan: "",
    gst: "",
    phone: "",
    email: "",
  });
  // Flag functionality states 
  const [flagState, setFlagState] = useState({
    reasonText: "",
    customerId: null,
  });
  // Filter and pagination states
  const [locationData, setLocationData] = useState({
    states: [],
    cities: [],
  });
  const [filterState, setFilterState] = useState({
    searchQuery: "",
    selectedState: "",
    selectedCity: "",
    dateRange: { start: "", end: "" },
    selectedStatus: "",
    selectedStage: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState({});

  // Modal Configuration State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const [messageModal, setMessageModal] = useState({
    message: "",
    type: "",
  });
  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  const getToken = useCallback(() => sessionStorage.getItem("token"), []);

  const validateGST = useCallback((gst) => VALIDATION_REGEX.GST.test(gst), []);
  const validatePAN = useCallback((pan) => VALIDATION_REGEX.PAN.test(pan), []);
  const validateEmail = useCallback((email) => VALIDATION_REGEX.EMAIL.test(email), []);

  const resetForm = useCallback(() => {
    setNewCustomer(DEFAULT_CUSTOMER);
    setEditState(prev => ({
      ...prev,
      isEditMode: false,
      currentCustomerIndex: null,
    }));
    setErrors({
      general: "",
      pan: "",
      gst: "",
      phone: "",
      email: "",
    });
    clearValidationErrors();
  }, [clearValidationErrors]);

  const resetContactForm = useCallback(() => {
    setNewContact(DEFAULT_CONTACT);
    setErrors(prev => ({ ...prev, general: "" }));
  }, []);

  const openModal = useCallback((modalType) => {
    setModals(prev => ({ ...prev, [modalType]: true }));
  }, []);

  const closeModal = useCallback((modalType) => {
    setModals(prev => ({ ...prev, [modalType]: false }));
  }, []);

  // ============================================================================
  // AUTHENTICATION & TOKEN VERIFICATION
  // ============================================================================

  const verifyToken = useCallback(async () => {
    const token = getToken();
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await axios.post(`https://devdemo.softtrails.net/users/verify-token`, { token });
      console.log("Token is valid:", response.data);
    } catch (error) {
      console.error("Token verification failed:", error.response?.data || error.message);
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("tokenExpiry");
      navigate("/");
    }
  }, [API_BASE_URL, getToken, navigate]);

  // CUSTOMER CRUD OPERATIONS

  const handleAddCustomer = useCallback(async (event) => {
    console.log("🚀 handleAddCustomer function called");
    console.log("📝 Form data received:", newCustomer);

    // Prevent default form submission behavior
    event.preventDefault();
    console.log("✅ Default form submission prevented");

    // Clear all previous errors to start fresh
    setErrors(prev => ({
      ...prev,
      general: "",
      gst: "",
      pan: "",
      phone: "",
      email: ""
    }));
    console.log("🧹 Previous errors cleared");

    // ============================================================================
    // STEP 1: VALIDATE REQUIRED FIELDS
    // ============================================================================

    console.log("🔍 Starting validation checks...");

    // Check if customer name is provided (REQUIRED)
    if (!newCustomer.customer_name || !newCustomer.customer_name.trim()) {
      console.log("❌ Validation failed: Customer name is missing");
      setErrors(prev => ({
        ...prev,
        general: "Customer name is required"
      }));
      return;
    }
    console.log("✅ Customer name validation passed:", newCustomer.customer_name);

    // Check that either phone OR email is provided (at least one REQUIRED)
    const hasPhone = newCustomer.phone_number && newCustomer.phone_number.trim();
    const hasEmail = newCustomer.email_id && newCustomer.email_id.trim();

    console.log("📞 Has phone:", hasPhone ? "Yes" : "No", hasPhone || "(empty)");
    console.log("📧 Has email:", hasEmail ? "Yes" : "No", hasEmail || "(empty)");

    if (!hasPhone && !hasEmail) {
      console.log("❌ Validation failed: Neither phone nor email provided");
      setErrors(prev => ({
        ...prev,
        general: "Either phone number or email is required"
      }));
      return;
    }
    console.log("✅ Contact method validation passed - at least one provided");

    // STEP 2: VALIDATE PHONE FORMAT (if provided)

    if (hasPhone) {
      console.log("🔍 Validating phone number format...");

      // Check if phone contains only digits
      if (!VALIDATION_REGEX.PHONE_DIGITS.test(newCustomer.phone_number)) {
        console.log("❌ Phone validation failed: Contains non-digit characters");
        setErrors(prev => ({ ...prev, phone: "Phone number should contain only digits" }));
        return;
      }
      console.log("✅ Phone digits validation passed");

      // Check phone number length
      if (newCustomer.phone_number.length !== FIELD_LENGTHS.PHONE) {
        console.log(`❌ Phone validation failed: Length is ${newCustomer.phone_number.length}, expected ${FIELD_LENGTHS.PHONE}`);
        setErrors(prev => ({ ...prev, phone: ERROR_MESSAGES.INVALID_PHONE_LENGTH }));
        return;
      }
      console.log(`✅ Phone length validation passed (${FIELD_LENGTHS.PHONE} digits)`);
    }

    // STEP 3: VALIDATE EMAIL FORMAT (if provided)

    if (hasEmail) {
      console.log("🔍 Validating email format...");

      if (!validateEmail(newCustomer.email_id)) {
        console.log("❌ Email validation failed: Invalid format");
        setErrors(prev => ({ ...prev, email: ERROR_MESSAGES.INVALID_EMAIL }));
        return;
      }
      console.log("✅ Email format validation passed");
    }

    // STEP 4: VALIDATE GST (optional field)

    if (newCustomer.gst_number && newCustomer.gst_number.trim()) {
      console.log("🔍 Validating GST number (optional field provided)...");

      if (!validateGST(newCustomer.gst_number)) {
        console.log("❌ GST validation failed: Invalid format");
        setErrors(prev => ({ ...prev, gst: ERROR_MESSAGES.INVALID_GST }));
        return;
      }
      console.log("✅ GST validation passed");
    } else {
      console.log("ℹ️ GST number not provided (optional field)");
    }

    // STEP 5: VALIDATE PAN (optional field)

    if (newCustomer.pan_no && newCustomer.pan_no.trim()) {
      console.log("🔍 Validating PAN number (optional field provided)...");

      if (!validatePAN(newCustomer.pan_no)) {
        console.log("❌ PAN validation failed: Invalid format");
        setErrors(prev => ({ ...prev, pan: ERROR_MESSAGES.INVALID_PAN }));
        return;
      }
      console.log("✅ PAN validation passed");
    } else {
      console.log("ℹ️ PAN number not provided (optional field)");
    }

    // STEP 6: USE FORM VALIDATION HOOK (if needed)

    console.log("🔍 Running form validation hook...");
    const validationResult = validateForm(newCustomer);
    console.log("📊 Form validation result:", validationResult);
    console.log("📋 Validation errors:", validationErrors);

    if (!validationResult) {
      console.log("❌ Form validation hook failed - stopping submission");
      return;
    }
    console.log("✅ Form validation hook passed");

    // STEP 7: ALL VALIDATIONS PASSED - ATTEMPT TO CREATE CUSTOMER

    console.log("🎉 All validations passed! Attempting to create customer...");
    console.log("📤 Sending data to API:", newCustomer);

    try {
      // Call the API to create customer and pass "Approved" filter to maintain current view
      const result = await createCustomer(newCustomer, "Approved");
      console.log("📥 API response received:", result);

      if (result.success) {
        console.log("🎉 Customer created successfully!");

        // Close modal and reset form
        closeModal('customer');
        console.log("🔒 Modal closed");

        resetForm();
        console.log("🧹 Form reset");

        // Show success message to user
        await Swal.fire({
          icon: "success",
          title: "Success!",
          text: SUCCESS_MESSAGES.CUSTOMER_CREATED,
          timer: 2000,
          showConfirmButton: false,
        });
        console.log("✅ Success message displayed");

      } else {
        // API returned error
        console.log("❌ API returned error:", result.error);
        setErrors(prev => ({ ...prev, general: result.error || "Failed to create customer" }));
      }

    } catch (error) {
      // Unexpected error occurred
      console.error("💥 Unexpected error occurred:", error);
      console.error("📍 Error stack:", error.stack);
      setErrors(prev => ({
        ...prev,
        general: "An unexpected error occurred. Please try again."
      }));
    }

    console.log("🏁 handleAddCustomer function completed");

  }, [
    newCustomer, validateGST, validatePAN, validateEmail, validateForm, validationErrors, createCustomer, closeModal, resetForm]);

  const handleEditCustomer = useCallback((index) => {
    const customer = customers[index];
    console.log("Customer status from database:", customer.status);

    setNewCustomer({
      customer_name: customer.customer_name || "",
      phone_number: customer.phone_number || "",
      email_id: customer.email_id || "",
      industry: customer.industry || "",
      address: customer.address || "",
      country: customer.country || "",
      state: customer.state || "",
      city: customer.city || "",
      pincode: customer.pincode || "",
      tan_number: customer.tan_number || "",
      gst_number: customer.gst_number || "",
      pan_no: customer.pan_no || "",
      status: customer.status?.toLowerCase() || "active",
    });

    setEditState(prev => ({
      ...prev,
      isEditMode: true,
      currentCustomerIndex: index,
    }));

    openModal('customer');
  }, [customers, openModal]);

  const handleEditSubmit = useCallback(async (event) => {
    event.preventDefault();
    console.log("=== EDIT SUBMIT STARTED ===");
    console.log("newCustomer object:", newCustomer);
    console.log("Status value:", newCustomer.status);

    setErrors({
      general: "",
      pan: "",
      gst: "",
      phone: "",
      email: "",
    });

    // Validate GST and PAN
    if (newCustomer.gst_number && !validateGST(newCustomer.gst_number)) {
      setErrors(prev => ({ ...prev, gst: ERROR_MESSAGES.INVALID_GST }));
      return;
    }

    if (newCustomer.pan_no && !validatePAN(newCustomer.pan_no)) {
      setErrors(prev => ({ ...prev, pan: ERROR_MESSAGES.INVALID_PAN }));
      return;
    }

    const customerId = customers[editState.currentCustomerIndex].customer_id;

    setConfirmationModal({
      isOpen: true,
      title: "Update Customer",
      message: "Are you sure you want to update this customer's details?",
      onConfirm: async () => {
        console.log("Calling updateCustomerData with:", customerId, newCustomer);
        const result = await updateCustomerData(customerId, newCustomer);
        console.log("Update result:", result);

        if (result.success) {
          closeModal('customer');
          resetForm();
          setMessageModal({
            message: SUCCESS_MESSAGES.CUSTOMER_UPDATED,
            type: "success",
          });
        } else {
          setErrors(prev => ({ ...prev, general: result.error }));
          setMessageModal({
            message: result.error || "Failed to update customer",
            type: "error",
          });
        }
      }
    });
  }, [newCustomer, validateGST, validatePAN, customers, editState.currentCustomerIndex, updateCustomerData, closeModal, resetForm]);

  const handleDeleteCustomer = useCallback((customerId) => {
    setConfirmationModal({
      isOpen: true,
      title: "Delete Customer",
      message: "Are you sure you want to delete this customer? This action cannot be undone.",
      onConfirm: async () => {
        const result = await deleteCustomer(customerId, "Approved");
        if (!result.success && result.error !== "Operation cancelled by user") {
          setMessageModal({
            message: result.error || "Failed to delete customer",
            type: "error",
          });
        } else if (result.success) {
          setMessageModal({
            message: SUCCESS_MESSAGES.CUSTOMER_DELETED,
            type: "success",
          });
        }
      }
    });
  }, [deleteCustomer]);

  // ============================================================================
  // CONTACT CRUD OPERATIONS
  // ============================================================================

  const handleAddContact = useCallback((e) => {
    e.preventDefault();
    setErrors(prev => ({ ...prev, general: "" }));

    setConfirmationModal({
      isOpen: true,
      title: "Add Contact",
      message: "Are you sure you want to add this contact?",
      onConfirm: async () => {
        const result = await createContact(newContact, editState.selectedCustomerId);

        if (result.success) {
          resetContactForm();
          closeModal('contact');
          setMessageModal({
            message: "Contact added successfully",
            type: "success",
          });
        } else {
          setErrors(prev => ({ ...prev, general: result.error }));
          setMessageModal({
            message: result.error || "Failed to add contact",
            type: "error",
          });
        }
      }
    });
  }, [newContact, editState.selectedCustomerId, createContact, resetContactForm, closeModal]);

  const handleEditContact = useCallback((contactId) => {
    const contactToEdit = contactDetails.find(
      (contact) => contact.contact_id === contactId
    );
    if (contactToEdit) {
      setEditState(prev => ({ ...prev, editingContact: contactToEdit }));
      openModal('editContact');
    }
  }, [contactDetails, openModal]);

  const handleDeleteContact = useCallback(async (contactId) => {
    const result = await deleteContact(contactId);
    if (!result.success && result.error !== "Operation cancelled by user") {
      await Swal.fire("Error", result.error, "error");
    }
  }, [deleteContact]);

  const updateContactDetails = useCallback(async (contactId, updatedContactData) => {
    const result = await updateContactData(contactId, updatedContactData);

    if (result.success) {
      if (editState.selectedCustomer) {
        await fetchContactDetails(editState.selectedCustomer.customer_id);
      }
      closeModal('editContact');
      setErrors(prev => ({ ...prev, general: "" }));
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: SUCCESS_MESSAGES.CONTACT_UPDATED,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      setErrors(prev => ({ ...prev, general: result.error }));
    }
  }, [updateContactData, editState.selectedCustomer, fetchContactDetails, closeModal]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    console.log("handleChange called:", name, value); // ADD THIS LINE

    setNewCustomer(prevCustomer => ({
      ...prevCustomer,
      [name]: value,
    }));
  }, []);

  const handleNewContactChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setNewContact(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }, []);

  const handleEditContactChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setEditState(prev => ({
      ...prev,
      editingContact: {
        ...prev.editingContact,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  }, []);

  const handleCustomerClick = useCallback(async (customer) => {
    setEditState(prev => ({ ...prev, selectedCustomer: customer }));
    openModal('customerDetails');
    await fetchContactDetails(customer.customer_id);
  }, [fetchContactDetails, openModal]);

  const handleContactClick = useCallback((contact) => {
    setEditState(prev => ({ ...prev, selectedContact: contact }));
    openModal('contactDetails');
  }, [openModal]);

  // Location handlers
  const handleCountryChange = useCallback((e) => {
    const selectedCountry = e.target.value;
    setNewCustomer(prev => ({
      ...prev,
      country: selectedCountry,
      state: "",
      city: "",
    }));
  }, []);

  const handleStateChange = useCallback((e) => {
    const selectedState = e.target.value;
    setNewCustomer(prev => ({
      ...prev,
      state: selectedState,
      city: "",
    }));
  }, []);

  const handleCityChange = useCallback((e) => {
    setNewCustomer(prev => ({
      ...prev,
      city: e.target.value,
    }));
  }, []);


  // Contact Location Handlers
  const handleContactCountryChange = useCallback((e) => {
    const selectedCountry = e.target.value;
    if (modals.editContact) {
      setEditState(prev => ({
        ...prev,
        editingContact: {
          ...prev.editingContact,
          country: selectedCountry,
          state: "",
          city: "",
        }
      }));
    } else {
      setNewContact(prev => ({
        ...prev,
        country: selectedCountry,
        state: "",
        city: "",
      }));
    }
  }, [modals.editContact]);

  const handleContactStateChange = useCallback((e) => {
    const selectedState = e.target.value;
    if (modals.editContact) {
      setEditState(prev => ({
        ...prev,
        editingContact: {
          ...prev.editingContact,
          state: selectedState,
          city: "",
        }
      }));
    } else {
      setNewContact(prev => ({
        ...prev,
        state: selectedState,
        city: "",
      }));
    }
  }, [modals.editContact]);

  const handleContactCityChange = useCallback((e) => {
    const selectedCity = e.target.value;
    if (modals.editContact) {
      setEditState(prev => ({
        ...prev,
        editingContact: {
          ...prev.editingContact,
          city: selectedCity,
        }
      }));
    } else {
      setNewContact(prev => ({
        ...prev,
        city: selectedCity,
      }));
    }
  }, [modals.editContact]);
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [name]: value }));
  }, []);

  // Validation handlers
  const handlemobileChange = useCallback((event) => {
    const { value } = event.target;
    if (!VALIDATION_REGEX.PHONE_DIGITS.test(value)) return;

    setNewCustomer(prevState => ({
      ...prevState,
      phone_number: value,
    }));

    if (value && value.length !== FIELD_LENGTHS.PHONE) {
      setErrors(prev => ({ ...prev, phone: ERROR_MESSAGES.INVALID_PHONE_LENGTH }));
    } else {
      setErrors(prev => ({ ...prev, phone: "" }));
    }
  }, []);

  const handleEmailChange = useCallback((event) => {
    const { value } = event.target;
    setNewCustomer(prevState => ({
      ...prevState,
      email_id: value,
    }));

    if (value && !validateEmail(value)) {
      setErrors(prev => ({ ...prev, email: ERROR_MESSAGES.INVALID_EMAIL }));
    } else {
      setErrors(prev => ({ ...prev, email: "" }));
    }
  }, [validateEmail]);

  // ============================================================================
  // FLAG FUNCTIONALITY
  // ============================================================================

  const toggleFlagCustomer = useCallback((customerId) => {
    setFlagState({
      customerId,
      reasonText: "",
    });
    openModal('flagReason');
  }, [openModal]);

  const handleFlagReasonSubmit = useCallback(async () => {
    const result = await flagCustomer(flagState.customerId, flagState.reasonText);

    if (result.success) {
      closeModal('flagReason');
      setFlagState({
        reasonText: "",
        customerId: null,
      });
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: SUCCESS_MESSAGES.CUSTOMER_FLAGGED,
        timer: 2000,
        showConfirmButton: false,
      });
    }
  }, [flagCustomer, flagState, closeModal]);

  const handleFlagReasonClose = useCallback(() => {
    closeModal('flagReason');
    setFlagState({
      reasonText: "",
      customerId: null,
    });
  }, [closeModal]);

  // ============================================================================
  // VERIFICATION HANDLERS
  // ============================================================================

  const handleVerifyChange = useCallback(async (customerId, field, value) => {
    await verifyCustomer(customerId, field, value);
    // await Swal.fire({
    //   icon: "success",
    //   title: "Updated!",
    //   text: SUCCESS_MESSAGES.VERIFICATION_UPDATED,
    //   timer: 1500,
    //   showConfirmButton: false,
    // });
  }, [verifyCustomer]);

  // ============================================================================
  // DOWNLOAD HANDLERS
  // ============================================================================



  // ============================================================================
  // MEMOIZED VALUES
  // ============================================================================

  const filtersConfig = useMemo(() => [
    { type: "search", key: "searchQuery", placeholder: "Search by Customer name and Email" },
    { type: "select", key: "selectedState", label: "State", options: locationData.states },
    { type: "select", key: "selectedCity", label: "City", options: locationData.cities },
    { type: "dateRange", key: "dateRange", label: "Date Range" },
    {
      type: "select",
      key: "selectedStatus",
      label: "Status",
      options: [CUSTOMER_STATUS.ACTIVE, CUSTOMER_STATUS.INACTIVE]
    },
    {
      type: "select",
      key: "selectedStage",
      label: "Stage",
      options: Object.values(CUSTOMER_STAGES)
    },
  ], [locationData.states, locationData.cities]);

  const filteredCustomers = useMemo(() => {
    const { searchQuery, selectedState, selectedCity, dateRange, selectedStatus, selectedStage } = filterState;

    return customers.filter((customer) => {
      const matchesSearch =
        !searchQuery ||
        customer.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email_id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesState = !selectedState || customer.state === selectedState;
      const matchesCity = !selectedCity || customer.city === selectedCity;

      const matchesDate =
        (!dateRange.start || new Date(customer.created_at) >= new Date(dateRange.start)) &&
        (!dateRange.end || new Date(customer.created_at) <= new Date(dateRange.end));

      const matchesStatus = !selectedStatus || customer.status === selectedStatus;
      const matchesStage = !selectedStage || customer.stage === selectedStage;

      return matchesSearch && matchesState && matchesCity && matchesDate && matchesStatus && matchesStage;
    });
  }, [customers, filterState]);

  const handleDownloadExcel = useCallback(() => {
    if (!filteredCustomers || filteredCustomers.length === 0) {
      Swal.fire("No Data", "No filtered data available to download.", "info");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredCustomers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredCustomers");

    XLSX.writeFile(workbook, "filtered_customers.xlsx");

    Swal.fire({
      icon: "success",
      title: "Download Started!",
      text: "Filtered Excel file is being downloaded.",
      timer: 1500,
      showConfirmButton: false,
    });
  }, [filteredCustomers]);

  const handleDownloadPDF = useCallback(() => {
    if (!filteredCustomers || filteredCustomers.length === 0) {
      Swal.fire("No Data", "No filtered data available to download.", "info");
      return;
    }

    const doc = new jsPDF();
    doc.text("Filtered Customer List", 14, 12);

    const tableColumn = [
      "Customer Name", "Email", "Phone", "State", "City", "Stage"
    ];

    const tableRows = filteredCustomers.map((c) => [
      c.customer_name || "",
      c.email_id || "",
      c.phone_number || "",
      c.state || "",
      c.city || "",
      c.stage || "",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("filtered_customers.pdf");

    Swal.fire({
      icon: "success",
      title: "Download Started!",
      text: "Filtered PDF file is being downloaded.",
      timer: 1500,
      showConfirmButton: false,
    });
  }, [filteredCustomers]);

  console.log("Filtered Customers:", filteredCustomers);


  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredCustomers.length / PAGINATION.CUSTOMER_PAGE_SIZE);
    const paginatedCustomers = filteredCustomers.slice(
      (currentPage - 1) * PAGINATION.CUSTOMER_PAGE_SIZE,
      currentPage * PAGINATION.CUSTOMER_PAGE_SIZE
    );

    return { totalPages, paginatedCustomers };
  }, [filteredCustomers, currentPage]);

  const columns = useMemo(() => [
    {
      label: "S.No.",
      render: (item, i) => (currentPage - 1) * PAGINATION.CUSTOMER_PAGE_SIZE + i + 1,
      className: "w-16",
    },
    {
      label: "Customer Name",
      render: (item) => {
        const LIMIT = 12;
        const text = item.customer_name || "N/A";
        const key = `cust-${item.customer_id}`;

        const isExpanded = expandedRows[key];
        const showDots = text.length > LIMIT && !isExpanded;

        return (
          <div className="max-w-[150px] whitespace-normal break-words flex flex-wrap gap-1">
            {/* Name Modal Click Still Works */}
            <button
              className="text-blue-600 hover:text-blue-800 cursor-pointer whitespace-normal break-words"
              onClick={() => handleCustomerClick(item)}
            >
              {isExpanded ? text : text.substring(0, LIMIT)}
            </button>

            {/* Expand/Collapse Toggle */}
            {showDots && (
              <button
                className="text-blue-600 font-medium text-xs"
                onClick={(e) => {
                  e.stopPropagation(); // prevent opening details
                  setExpandedRows(prev => ({ ...prev, [key]: true }));
                }}
              >
                ...
              </button>
            )}
          </div>
        );
      },
    },

    {
      label: "Email",
      render: (item) => {
        const LIMIT = 20
        const text = item.email_id || "N/A";
        const key = `email-${item.customer_id}`;

        const isExpanded = expandedRows[key];
        const showDots = text.length > LIMIT && !isExpanded;

        return (
          <div className="max-w-[220px] whitespace-normal break-words flex flex-wrap gap-1">
            <span className="text-gray-800 whitespace-normal break-words">
              {isExpanded ? text : text.substring(0, LIMIT)}
            </span>

            {/* Expand button */}
            {showDots && (
              <button
                className="text-blue-600 font-medium text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setExpandedRows(prev => ({
                    ...prev,
                    [key]: true,
                  }));
                }}
              >
                ...
              </button>
            )}
          </div>
        );
      },
    },


    {
      label: "Email Verified Status",
      render: (item) => (
        item.email_id ? (
          <input
            type="checkbox"
            checked={!!item.email_verified}
            disabled
            className="w-4 h-4 accent-green-600 cursor-not-allowed flex items-center justify-center w-full"
            title={item.email_verified ? "Email Verified" : "Email Not Verified"}
            aria-label={`Email verification status for ${item.customer_name}`}
          />
        ) : (
          <span className="text-gray-400 text-sm flex items-center justify-center w-full">N/A</span>
        )
      ),
      className: "hidden lg:table-cell text-center",
    },
    {
      label: "Phone no.",
      key: "phone_number",
      className: "whitespace-nowrap"
    },
    {
      label: "Phone Verified Status",
      render: (item) => (
        item.phone_number ? (
          <input
            type="checkbox"
            checked={!!item.phone_verified}
            disabled
            className="w-4 h-4 accent-green-600 cursor-not-allowed flex items-center justify-center w-full"
            title={item.phone_verified ? "Phone Verified" : "Phone Not Verified"}
            aria-label={`Phone verification status for ${item.customer_name}`}
          />
        ) : (
          <span className="text-gray-400 text-sm flex items-center justify-center w-full">N/A</span>
        )
      ),
      className: "hidden lg:table-cell text-center",
    },
    {
      label: "Source",
      key: "source",
      className: "hidden lg:table-cell"
    },
    {
      label: "Stage",
      render: (item) => {
        const colorClass = STAGE_COLORS[item.stage] || "text-gray-600 bg-gray-100";

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            {item.stage}
          </span>
        );
      },
    },
  ], [currentPage, handleCustomerClick, expandedRows]);


  const tableActions = useMemo(() => [
    {
      label: "Edit",
      icon: EditIcon,
      onClick: (item, index) => handleEditCustomer(index),
      show: permissions.updateCustomer,
      color: "text-blue-500 hover:text-blue-700",
      className: "p-2 md:p-2.5 rounded-lg hover:bg-blue-50 transition-colors",
    },
    {
      label: "Delete",
      icon: DeleteIcon,
      onClick: (item) => handleDeleteCustomer(item.customer_id),
      show: permissions.deleteCustomer,
      color: "text-red-500 hover:text-red-700",
      className: "p-2 md:p-2.5 rounded-lg hover:bg-red-50 transition-colors",
    },
    {
      label: "Contact",
      icon: ContactIcon,
      onClick: (item) => {
        setEditState(prev => ({ ...prev, selectedCustomerId: item.customer_id }));
        openModal('contact');
      },
      show: permissions.createContact,
      color: "text-green-500 hover:text-green-700",
      className: "p-2 md:p-2.5 rounded-lg hover:bg-green-50 transition-colors",
    },
  ], [permissions, handleEditCustomer, handleDeleteCustomer, openModal]);


  useEffect(() => {
    const initializeComponent = async () => {
      await verifyToken();
      await fetchCustomers("Approved"); // ✅ Fetch approved customers only
      await fetchContactDetails();
      await checkAccess();
    };

    initializeComponent();
  }, [verifyToken, fetchCustomers, fetchContactDetails, checkAccess]);



  useEffect(() => {
    const handlePopState = () => {
      navigate("/Cards");
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Update states and cities based on customers and selected filters
  useEffect(() => {
    const uniqueStates = [...new Set(customers.map(c => c.state).filter(Boolean))];

    let filteredCities;
    if (filterState.selectedState) {
      filteredCities = customers
        .filter(c => c.state === filterState.selectedState)
        .map(c => c.city)
        .filter(Boolean);
    } else {
      filteredCities = customers.map(c => c.city).filter(Boolean);
    }

    setLocationData({
      states: uniqueStates,
      cities: [...new Set(filteredCities)],
    });
  }, [customers, filterState.selectedState]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterState]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return <LoadingSpinner message="Loading customers..." />;
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        {/* Main content area that grows to fill available space */}
        <div className="flex-1 flex flex-col overflow-x-auto w-full hide-scrollbar pb-20">
          {/* Add Customer Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            {permissions.createCustomer && (
              <button
                onClick={() => {
                  setEditState(prev => ({ ...prev, isEditMode: false }));
                  openModal('customer');
                  resetForm();
                }}
                className="bg-[#005BE7] text-white font-semibold px-4 py-2 rounded-xl shadow-sm hover:bg-[#004dc5] transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Add customer"
              >
                + Add Customer
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="mb-4 w-full flex items-center justify-between gap-4">
            <CustomerFilters
              filtersConfig={filtersConfig}
              filterState={filterState}
              setFilterState={setFilterState}
            />

            {/* 🚀 Your New Icons Go Here */}
            <div className="flex items-center gap-2 mb-3">
              <button
                title="Download Excel"
                onClick={handleDownloadExcel}
                className="hover:scale-110 transition"
              >
                <img src={excelIcon} alt="Excel" className="w-6 h-6" />
              </button>

              <button
                title="Download PDF"
                onClick={handleDownloadPDF}
                className="hover:scale-110 transition"
              >
                <img src={folderIcon} alt="PDF" className="w-6 h-6" />
              </button>
            </div>
          </div>


          {/* Customer Form Modal */}
          <CustomerFormModal
            isOpen={modals.customer}
            isEditMode={editState.isEditMode}
            newCustomer={newCustomer}
            onChange={handleChange}
            onmobileChange={handlemobileChange}
            onEmailChange={handleEmailChange}
            onInputChange={handleInputChange}
            onSubmit={editState.isEditMode ? handleEditSubmit : handleAddCustomer}
            onClose={() => {
              closeModal('customer');
              setEditState(prev => ({ ...prev, isEditMode: false }));
              resetForm();
            }}
            errorMessage={errors.general}
            mobileError={errors.phone}
            emailError={errors.email}
            gstError={errors.gst}
            panError={errors.pan}
            handleCountryChange={handleCountryChange}
            handleStateChange={handleStateChange}
            handleCityChange={handleCityChange}
            Country={Country}
            State={State}
            City={City}
          />

          {/* Contact Form Modal */}
          <ContactFormModal
            isOpen={modals.contact || modals.editContact}
            isEditMode={modals.editContact}
            contact={modals.editContact ? editState.editingContact : newContact}
            onChange={modals.editContact ? handleEditContactChange : handleNewContactChange}
            onSubmit={modals.editContact ?
              (e) => {
                e.preventDefault();
                updateContactDetails(editState.editingContact.contact_id, editState.editingContact);
              } :
              handleAddContact
            }
            onClose={() => {
              closeModal('contact');
              closeModal('editContact');
              setErrors(prev => ({ ...prev, general: "" }));
              resetContactForm();
            }}
            errorMessage={errors.general}
            handleCountryChange={handleContactCountryChange}
            handleStateChange={handleContactStateChange}
            handleCityChange={handleContactCityChange}
            Country={Country}
            State={State}
            City={City}
          />

          {/* Customer Details Modal */}
          <CustomerDetailsModal
            isOpen={modals.customerDetails}
            customer={editState.selectedCustomer}
            contacts={contactDetails}
            loadingContacts={loadingContacts}
            onClose={() => closeModal('customerDetails')}
            onEditContact={handleEditContact}
            onDeleteContact={handleDeleteContact}
            hasAMSAccessEditContact={permissions.updateContact}
            hasAMSAccessDeleteContact={permissions.deleteContact}
            onContactClick={handleContactClick}
          />

          {/* Contact Details Modal */}
          <ContactDetailsModal
            isOpen={modals.contactDetails}
            contact={editState.selectedContact}
            onClose={() => closeModal('contactDetails')}
          />

          {/* Flag Reason Modal */}
          {modals.flagReason && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white rounded-2xl w-full max-w-xl p-6 shadow-lg relative max-h-[90vh] overflow-y-auto">
                <button
                  className="absolute top-4 right-4 text-red-500 text-xl hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  onClick={handleFlagReasonClose}
                  aria-label="Close Modal"
                >
                  &times;
                </button>

                <h2 className="text-xl font-bold mb-4">Flag Customer</h2>

                <div className="mb-4">
                  <label className="block text-md font-medium mb-2">Reason</label>
                  <textarea
                    className="border rounded px-3 py-2 w-full min-h-[120px] sm:min-h-[150px] resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type reason"
                    value={flagState.reasonText}
                    onChange={(e) => setFlagState(prev => ({ ...prev, reasonText: e.target.value }))}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    type="button"
                    className="bg-[#1976D2] text-white px-8 py-2 rounded font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handleFlagReasonSubmit}
                    disabled={!flagState.reasonText.trim()}
                  >
                    Submit
                  </button>
                  <button
                    type="button"
                    className="border border-black text-black px-8 py-2 rounded font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
                    onClick={handleFlagReasonClose}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Customer Table - this will grow to fill remaining space */}
          <div className="flex-1">
            <CustomerTable
              data={paginationData.paginatedCustomers}
              columns={columns}
              currentPage={currentPage}
              pageSize={PAGINATION.CUSTOMER_PAGE_SIZE}
              actions={tableActions}
              height={TABLE_CONFIG.MIN_HEIGHT}
            />
          </div>
        </div>


        {/* Fixed Pagination at bottom */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 py-4 sticky bottom-0">
          <Pagination
            currentPage={currentPage}
            totalPages={paginationData.totalPages}
            onPageChange={(newPage) => setCurrentPage(newPage)}
          />
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          title={confirmationModal.title}
          message={confirmationModal.message}
          onConfirm={confirmationModal.onConfirm}
          onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
        />

        {/* Message Modal */}
        <MessageModal
          message={messageModal.message}
          type={messageModal.type}
          setMessage={(msg) => setMessageModal(prev => ({ ...prev, message: msg }))}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Customer;