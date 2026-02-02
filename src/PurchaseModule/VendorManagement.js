import React, { useEffect, useState } from "react";
import { FaSearch, FaEdit, FaTrash, FaRegIdCard } from "react-icons/fa";
import excel from "../assests/excel.png";
import axios from "axios";
import Swal from "sweetalert2";
import { Country, State, City } from "country-state-city";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Select from "react-select";
import DownloadTableButtons from "./components/Downloadpdfexcel";
import PopupModal from "./PopupModal";
import API from "../config/api";

const VendorManagement = () => {
  const [search, setSearch] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [editPopup, setEditPopup] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showContactPopup, setShowContactPopup] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [workflowId, setWorkflowId] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showVendorPopup, setShowVendorPopup] = useState(false);
  const [contactDetails, setContactDetails] = useState([]);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const requestForOptions = ["Movable", "Raw Materials"];
  const [requestFor, setRequestFor] = useState("");
  const [category, setCategory] = useState("");
  const [requestAsset, setRequestAsset] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [materialData, setMaterialData] = useState([]);
  const createdBy = sessionStorage.getItem("userId");
  const [assetType, setAssetType] = useState(" "); // Default to "new"
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "Vendor", accessor: "supplier_name" },
    { header: "Email", accessor: "email_id" },
    { header: "Phone no.", accessor: "landline_num" },
    { header: "Workflow", accessor: "workflow" },
    { header: "Stage", accessor: "current_stage" },
    { header: "Status", accessor: "status" },
  ];

  const fetchSuppliers = () => {
    axios
      .get(`${API.PURCHASE_API}/supplier/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Fetched suppliers:", response.data);
        setSuppliers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching supplier data:", error);
      });
  };
  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    setCountries(Country.getAllCountries());
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      setStates(State.getStatesOfCountry(selectedCountry));
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      setCities(City.getCitiesOfState(selectedCountry, selectedState));
    }
  }, [selectedState]);

  // useEffect(() => {
  //   axios
  //     .get(`${API.PURCHASE_API}/budget-workflow/workflows`,
  //                   { headers: { Authorization: `Bearer ${token}` } }

  //     )
  //     .then((response) => {
  //       setWorkflows(response.data);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching workflows:", error);
  //     });
  // }, []);

  //Fetch workflow
  // ...existing code...
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const res = await axios.get(
          `${API.WORKFLOW_API}/workflow/get-modules/module?module_name=Purchase Management&sub_module_name=Vendor Management`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Try common response shapes then normalize to { workflowid, workflowname }
        const rawList = res.data?.workflows || res.data?.data || res.data || [];
        const workflowsList = Array.isArray(rawList) ? rawList : [];

        const normalized = workflowsList
          .map((w) => ({
            workflowid: w.workflowid ?? w.workflow_id ?? w.id ?? w._id ?? "",
            workflowname:
              w.workflowname ??
              w.workflow_name ??
              w.name ??
              w.moduleName ??
              w.displayName ??
              "",
          }))
          .filter((w) => w.workflowid && w.workflowname);

        setWorkflows(normalized);
      } catch (err) {
        console.error("Error fetching workflows:", err, err?.response?.data);
        setWorkflows([]);
      }
    };

    fetchWorkflows();
  }, [token]);
  // ...existing code...

  const getWorkflowName = (id) => {
    const workflow = workflows.find((w) => w.workflowid === id);
    return workflow ? workflow.workflowname : "N/A";
  };

  const [vendorData, setVendorData] = useState({
    supplier_name: "",
    gst_number: "",
    landline_num: "",
    email_id: "",
    pan_no: "",
    tan_number: "",
    address: "",
    city: "",
    state: "",
    country: " ",
    pincode: "",
    lead: "John",
    workflow_id: "",
    current_stage: "Initiated",
    status: "Active",
  });

  const filteredSuppliers = suppliers.filter((vendor) => {
    const matchesSearch =
      vendor.supplier_name?.toLowerCase().includes(search.toLowerCase()) ||
      vendor.email_id?.toLowerCase().includes(search.toLowerCase()) ||
      vendor.current_stage?.toLowerCase().includes(search.toLowerCase()) ||
      vendor.status?.toLowerCase().includes(search.toLowerCase()) ||
      vendor.landline_num?.toLowerCase().includes(search.toLowerCase());

    const matchesCountry = selectedCountry
      ? vendor.country === selectedCountry
      : true;
    const matchesState = selectedState ? vendor.state === selectedState : true;
    const matchesCity = selectedCity ? vendor.city === selectedCity : true;

    return matchesSearch && matchesCountry && matchesState && matchesCity;
  });
  const exportData = filteredSuppliers.map((vendor, idx) => ({
    sno: idx + 1,
    supplier_name: vendor.supplier_name,
    email_id: vendor.email_id,
    landline_num: vendor.landline_num,
    workflow: getWorkflowName(vendor.workflow_id),
    current_stage: vendor.current_stage,
    status: vendor.status,
  }));
  useEffect(() => {
    axios
      .get(`${API.PURCHASE_API}/supplier/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setSuppliers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching supplier data:", error);
      });
  }, []);

  const fieldOrder = [
    "workflow_id",
    "supplier_name",
    "landline_num",
    "email_id",
    "address",
    "country",
    "state",
    "city",
    "pincode",
    "gst_number",
    "pan_no",
    "tan_number",
  ];

  const handleAddVendor = async () => {
    const newErrors = {};

    if (!vendorData.workflow_id) newErrors.workflow_id = "Required";
    if (!vendorData.supplier_name) newErrors.supplier_name = "Required";
    if (!vendorData.landline_num) newErrors.landline_num = "Required";
    if (!vendorData.email_id) newErrors.email_id = "Required";
    if (!vendorData.gst_number) newErrors.gst_number = "Required";
    if (!vendorData.pan_no) newErrors.pan_no = "Required";
    if (!vendorData.tan_number) newErrors.tan_number = "Required";

    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      return;
    }

    setValidationErrors({}); // clear errors

    const confirmResult = await Swal.fire({
      title: "Add Vendor?",
      text: "Are You sure you want to add vendor?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Confirm!",
    });

    if (confirmResult.isConfirmed) {
      try {
        const response = await axios.post(
          `${API.PURCHASE_API}/supplier/suppliers`,
          vendorData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("Add vendor response:", response.data);
        setModalProps({
          type: "success",
          title: "Success",
          message: "Vendor added successfully.",
          onClose: () => {
            setShowModal(false);
            setShowPopup(false);
            // fetchSuppliers();
            setSuppliers(prev => [...prev, response.data]); // Add the new vendor directly
            setVendorData({
              supplier_name: "",
              gst_number: "",
              landline_num: "",
              email_id: "",
              pan_no: "",
              tan_number: "",
              address: "",
              city: "",
              state: "",
              country: " ",
              pincode: "",
              lead: "John",
              workflow_id: "",
              current_stage: "Initiated",
              status: "Active",
            });
            setShowApprovalModal(true);
          },
        });
        setShowModal(true);
      } catch (error) {
        const apiErrors = {};
        if (error.response && error.response.data?.errors) {
          error.response.data.errors.forEach((msg, idx) => {
            if (msg && fieldOrder[idx]) {
              apiErrors[fieldOrder[idx]] = msg;
            }
          });
          setValidationErrors(apiErrors);
        } else {
          setModalProps({
            type: "error",
            title: "Error",
            message: "Something went wrong.",
            onClose: () => setShowModal(false),
          });
          setShowModal(true);
        }
      }
    }
  };

  const handleCountryChange = (e) => {
    const countryValue = e.target.value;
    setSelectedCountry({ country: countryValue });

    setVendorData((prevData) => ({
      ...prevData,
      country: countryValue,
      state: "", // clear state and city on country change
      city: "",
    }));

    // Populate states
    const countryStates = State.getStatesOfCountry(countryValue);
    setStates(countryStates);
  };

  const handleStateChange = (e) => {
    const stateValue = e.target.value;
    setSelectedState({ state: stateValue });

    setVendorData((prevData) => ({
      ...prevData,
      state: stateValue,
      city: "",
    }));

    // Populate cities
    const stateCities = City.getCitiesOfState(
      selectedCountry.country,
      stateValue
    );
    setCities(stateCities);
  };

  const handleCityChange = (e) => {
    const cityValue = e.target.value;
    setSelectedCity({ city: cityValue });

    setVendorData((prevData) => ({
      ...prevData,
      city: cityValue,
    }));
  };

  const handleConfirmDelete = () => {
    if (!selectedVendor) return;

    axios
      .delete(`${API.PURCHASE_API}/supplier/suppliers/${selectedVendor.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        console.log("Deleted:", response.data);
        setIsDeleteModalOpen(false);
        setSelectedVendor(null);
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Vendor deleted successfully.",
        });
      })
      .catch((error) => {
        console.error("Delete error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete vendor.",
        });
      });
  };

  useEffect(() => {
    if (selectedVendor) {
      setWorkflowId(selectedVendor.workflow_id || "");
      // setSelectedCountry(selectedVendor.country || "");
      // setSelectedState(selectedVendor.state || "");
      // setSelectedCity(selectedVendor.city || "");

      // Optionally, you may need to trigger loading of states and cities based on country/state
      if (selectedVendor.country) {
        const countryStates = State.getStatesOfCountry(selectedVendor.country);
        setStates(countryStates);
      }
      if (selectedVendor.state) {
        const stateCities = City.getCitiesOfState(
          selectedVendor.country,
          selectedVendor.state
        );
        setCities(stateCities);
      }

      setVendorData({
        supplier_id: selectedVendor.id || "",
        name: selectedVendor.supplier_name || "",
        landline: selectedVendor.landline_num || "",
        email: selectedVendor.email_id || "",
        address: selectedVendor.address || "",
        city: selectedVendor.city || "",
        country: selectedVendor.country || "",
        state: selectedVendor.state || "",
        pincode: selectedVendor.pincode || "",
        gst: selectedVendor.gst_number || "",
        pan: selectedVendor.pan_no || "",
        tan: selectedVendor.tan_number || "",
      });
    }
  }, [selectedVendor]);

  const fetchContactDetails = async () => {
    if (selectedVendor?.supplier_id) {
      try {
        const response = await axios.get(
          `${API.PURCHASE_API}/S_contact/supplier-contacts/supplier/${selectedVendor.supplier_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setContactDetails(response.data || []);
      } catch (error) {
        console.error("Error fetching contact details:", error);
      }
    }
  };

  useEffect(() => {
    if (showVendorPopup) {
      fetchContactDetails();
    }
  }, [showVendorPopup, selectedVendor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVendorData((prev) => ({ ...prev, [name]: value }));
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteClick = (vendor) => {
    setSelectedVendor(vendor);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedVendor(null);
  };

  useEffect(() => {
    if (selectedVendor) {
      setWorkflowId(selectedVendor.workflow_id || "");
    }
  }, [selectedVendor]);

  const handleVendorClick = async (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorPopup(true);

    try {
      const response = await axios.get(
        `${API.PURCHASE_API}/S_contact/supplier-contacts/supplier/${vendor.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContactDetails(response.data || []);
    } catch (error) {
      console.error("Error fetching contact details:", error);
    }
  };
  const handleUpdate = async (e) => {
    e.preventDefault();

    // show confirm modal instead of Swal.confirm
    setModalProps({
      type: "confirm",
      title: "Update Contact?",
      message: "Are you sure you want to update contact details?",
      onConfirm: async () => {
        try {
          await axios.put(
            `${API.PURCHASE_API}/S_contact/supplier-contacts/${selectedContact.contact_id}`,
            selectedContact,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setIsEditPopupOpen(false);
          await fetchContactDetails();

          // replace success Swal
          setModalProps({
            type: "success",
            title: "Success",
            message: "Contact details were successfully updated.",
            onClose: () => setShowModal(false),
          });
          setShowModal(true);
        } catch (error) {
          console.error("Failed to update contact", error);
          setModalProps({
            type: "error",
            title: "Update Failed",
            message: "Could not update contact. Please try again.",
            onClose: () => setShowModal(false),
          });
          setShowModal(true);
        }
      },
      onCancel: () => setShowModal(false),
    });
    setShowModal(true);
  };

  const handleDelete = async (contact) => {
    setModalProps({
      type: "confirm",
      title: "Delete Contact?",
      message: `Are you sure you want to delete ${contact.contact_person}?`,
      onConfirm: async () => {
        try {
          await axios.delete(
            `${API.PURCHASE_API}/S_contact/supplier-contacts/${contact.contact_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setModalProps({
            type: "success",
            title: "Deleted!",
            message: `"${contact.contact_person}" has been deleted successfully.`,
            onClose: async () => {
              setShowModal(false);
              await fetchContactDetails();
            },
          });
          setShowModal(true);
        } catch (error) {
          console.error("Failed to delete contact:", error);
          setModalProps({
            type: "error",
            title: "Delete Failed",
            message: "There was a problem deleting the contact.",
            onClose: () => setShowModal(false),
          });
          setShowModal(true);
        }
      },
      onCancel: () => setShowModal(false),
    });
    setShowModal(true);
  };
  const [formData, setFormData] = useState({
    contact_person: "",
    phone_num: "",
    email_id: "",
    address: "",
    country: "",
    state: "",
    city: "",
    pincode: "",
    department: "",
    designation: "",
    date_of_start: "",
    date_of_end: "",
    status: "",
  });

  useEffect(() => {
    // clear when no requestFor
    if (!requestFor) {
      setCategoryOptions([]);
      setCategory("");
      // clear material-related state as well
      setAssetOptions([]);
      setMaterialData([]);
      setRequestAsset("");
      return;
    }

    const fetchCategories = async () => {
      // ...existing fetchCategories code...
    };

    fetchCategories();
  }, [requestFor, token]);
  // ...existing code...

  // Replace the other useEffect that fetches assets
  useEffect(() => {
    // if either requestFor or category is missing, clear material dropdown/data
    if (!requestFor || !category) {
      setAssetOptions([]);
      setMaterialData([]);
      setRequestAsset("");
      return;
    }

    const fetchFromPurchaseAndColumns = async () => {
      try {
        const fetchFromPurchase = axios.get(
          `${API.PURCHASE_API}/assets?request_for=${encodeURIComponent(
            requestFor
          )}&category=${encodeURIComponent(category)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const fetchFromColumnTypes = axios.get(
          `${API.COLUMN_TYPES_API}/getColumnTypesAndData/${encodeURIComponent(
            category
          )}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const [res1, res2] = await Promise.allSettled([
          fetchFromPurchase,
          fetchFromColumnTypes,
        ]);

        // normalize purchase assets
        let purchaseArr = [];
        if (res1.status === "fulfilled" && res1.value?.data) {
          const d = res1.value.data;
          purchaseArr = Array.isArray(d)
            ? d
            : Array.isArray(d?.data)
            ? d.data
            : [];
        }

        // normalize column data
        let columnArr = [];
        if (res2.status === "fulfilled" && res2.value?.data) {
          const d2 = res2.value.data;
          columnArr = Array.isArray(d2?.data)
            ? d2.data
            : Array.isArray(d2)
            ? d2
            : [];
        }

        const purchaseAssets = purchaseArr
          .map((item) => ({
            asset_name:
              item.asset_name ||
              item.material_name ||
              item.name ||
              item["Asset Name"] ||
              "",
            source: "purchaseAssets",
            ...item,
          }))
          .filter((i) => i.asset_name);

        const columnAssets = columnArr
          .map((item) => ({
            asset_name:
              item.material_name || item["Asset Name"] || item.asset_name || "",
            source: "columnTypes",
            ...item,
          }))
          .filter((i) => i.asset_name);

        const combined = [...purchaseAssets, ...columnAssets];
        const filtered = combined.filter((item) => item.asset_name);

        // dedupe asset names
        const uniqueAssetNames = Array.from(
          new Set(filtered.map((i) => i.asset_name.trim()))
        ).sort();

        setAssetOptions(uniqueAssetNames);
        setMaterialData(filtered);
        setRequestAsset("");
      } catch (err) {
        console.error("Error fetching combined asset data:", err);
        setAssetOptions([]);
        setMaterialData([]);
        setRequestAsset("");
      }
    };

    fetchFromPurchaseAndColumns();
  }, [assetType, category, requestFor, token]);

  const [contactData, setContactData] = useState({
    supplier_id: "",
    contact_person: "",
    phone_num: "",
    email_id: "",
    address: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    department: "",
    designation: "",
    category_type: "",
    category: "",
    asset_name: "",
    date_of_start: "",
    date_of_end: "",
  });

 const handleAddContact = async () => {
   try {
      // ensure supplier_id is present in payload (use contactData.supplier_id or selectedVendor.id)
      const payload = {
        ...contactData,
        supplier_id: contactData.supplier_id || selectedVendor?.id || null,
      };

      const response = await axios.post(
        `${API.PURCHASE_API}/S_contact/supplier-contacts`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalProps({
        type: "success",
        title: "Success",
        message: "Contact added successfully!",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
      setShowContactPopup(false);
    } catch (error) {
      console.error("Error adding contact:", error);
      setModalProps({
        type: "error",
        title: "Error",
        message: "Failed to add contact",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };
  // ...existing code...
  useEffect(() => {
    // clear when no requestFor
    if (!requestFor) {
      setCategoryOptions([]);
      setCategory("");
      return;
    }

    const fetchCategories = async () => {
      try {
        const formattedRequestFor = requestFor
          .toString()
          .toLowerCase()
          .replace(/\s+/g, "");

        const [res1, res2] = await Promise.allSettled([
          axios.get(
            `${API.COLUMN_TYPES_API}/getColumnTypesAndData/${formattedRequestFor}`
          ),
          axios.get(`${API.PURCHASE_API}/assets?request_for=${requestFor}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Normalize res1
        let catsFromFirst = [];
        if (res1?.status === "fulfilled" && res1.value?.data) {
          const d = res1.value.data;
          const arr = Array.isArray(d)
            ? d
            : Array.isArray(d?.data)
            ? d.data
            : [];
          catsFromFirst = arr
            .map((c) =>
              (c.categoriesname || c.categoryname || c.name || "").trim()
            )
            .filter(Boolean);
        }

        // Normalize res2 (assets) - common shape: [{ category: "..." }, ...]
        let catsFromSecond = [];
        if (res2?.status === "fulfilled" && res2.value?.data) {
          const d2 = res2.value.data;
          const arr2 = Array.isArray(d2)
            ? d2
            : Array.isArray(d2?.data)
            ? d2.data
            : [];
          catsFromSecond = arr2
            .map((a) =>
              (a.category || a.categoryname || a.CATEGORY || "").trim()
            )
            .filter(Boolean);
        }

        // If first API failed but second has data, use second
        const mergedCategories = Array.from(
          new Set([...catsFromFirst, ...catsFromSecond])
        ).sort();

        // If still empty, try to surface raw values for debugging in UI (optional)
        if (mergedCategories.length === 0) {
          console.warn(
            "No categories found from APIs. res1/res2 raw:",
            res1,
            res2
          );
        }

        setCategoryOptions(mergedCategories);
        setCategory("");
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategoryOptions([]);
      }
    };

    fetchCategories();
  }, [requestFor, token]);
  // ...existing code...

  return (
    <div className="flex">
      {/* Header Row */}
      <div className="p-6 w-full">
        <div>
          <button
            className="bg-[#005AE6] text-white px-4 py-2 mb-4  rounded-lg font-semibold"
            onClick={() => setShowPopup(true)}
          >
            + Add Vendor
          </button>

         
        </div>
        {/* Add Vendor Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-5xl w-full relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2 text-red-500 text-2xl font-bold"
              >
                &times;
              </button>
              <h2 className="flex text-xl font-semibold mb-4">Add Vendor</h2>

              <form className="grid grid-cols-3 gap-4">
                <div>
                  <label>Workflow*</label>
                  <select
                    name="workflow_id"
                    value={vendorData.workflow_id}
                    onChange={handleChange}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.workflow_id ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select workflow</option>
                    {workflows.map((wf) => (
                      <option key={wf.workflowid} value={wf.workflowid}>
                        {wf.workflowname}
                      </option>
                    ))}
                  </select>
                  {validationErrors.workflow_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.workflow_id}
                    </p>
                  )}
                </div>

                <div>
                  <label>Vendor Name*</label>
                  <input
                    name="supplier_name"
                    value={vendorData.supplier_name}
                    onChange={handleChange}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.supplier_name ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.supplier_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.supplier_name}
                    </p>
                  )}
                </div>

                <div>
                  <label>Landline no.*</label>
                  <input
                    name="landline_num"
                    value={vendorData.landline_num}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (/^\d{0,10}$/.test(value)) {
                        handleChange(e);
                      }
                    }}
                    maxLength={10}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.landline_num ? "border-red-500" : ""
                    }`}
                  />

                  {validationErrors.landline_num && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.landline_num}
                    </p>
                  )}
                </div>

                <div>
                  <label>Email*</label>
                  <input
                    name="email_id"
                    value={vendorData.email_id}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow input while typing, but validate format
                      handleChange(e);
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                      if (!emailRegex.test(value)) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          email_id: "Please enter a valid email address",
                        }));
                      } else {
                        setValidationErrors((prev) => ({
                          ...prev,
                          email_id: "",
                        }));
                      }
                    }}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.email_id ? "border-red-500" : ""
                    }`}
                  />

                  {validationErrors.email_id && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.email_id}
                    </p>
                  )}
                </div>

                <div>
                  <label>Address</label>
                  <input
                    name="address"
                    value={vendorData.address}
                    onChange={handleChange}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.address ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.address && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label>Country*</label>
                  <select
                    value={selectedCountry}
                    onChange={(e) => {
                      const selectedIso = e.target.value;
                      setSelectedCountry(selectedIso);

                      const countryObj = countries.find(
                        (c) => c.isoCode === selectedIso
                      );
                      const countryName = countryObj ? countryObj.name : "";

                      setVendorData((prev) => ({
                        ...prev,
                        country: countryName,
                        state: "",
                        city: "",
                      }));

                      const countryStates =
                        State.getStatesOfCountry(selectedIso);
                      setStates(countryStates);
                      setSelectedState("");
                      setCities([]);
                      setSelectedCity("");
                    }}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.country ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.country}
                    </p>
                  )}
                </div>

                <div>
                  <label>State*</label>
                  <select
                    value={selectedState}
                    onChange={(e) => {
                      const selectedIso = e.target.value;
                      setSelectedState(selectedIso);

                      const stateObj = states.find(
                        (s) => s.isoCode === selectedIso
                      );
                      const stateName = stateObj ? stateObj.name : "";

                      setVendorData((prev) => ({
                        ...prev,
                        state: stateName,
                        city: "",
                      }));

                      const stateCities = City.getCitiesOfState(
                        selectedCountry,
                        selectedIso
                      );
                      setCities(stateCities);
                      setSelectedCity("");
                    }}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.state ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.state && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label>City*</label>
                  <select
                    value={selectedCity}
                    onChange={(e) => {
                      const selectedName = e.target.value;
                      setSelectedCity(selectedName);

                      setVendorData((prev) => ({
                        ...prev,
                        city: selectedName,
                      }));
                    }}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.city ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select City</option>
                    {cities.map((ct) => (
                      <option key={ct.name} value={ct.name}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                  {validationErrors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label>Pin code</label>
                  <input
                    name="pincode"
                    value={vendorData.pincode}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only digits and max 6 characters
                      if (/^\d{0,6}$/.test(value)) {
                        handleChange(e);
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (!/^\d{6}$/.test(value)) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          pincode: "Pincode must be exactly 6 digits",
                        }));
                      } else {
                        setValidationErrors((prev) => ({
                          ...prev,
                          pincode: "",
                        }));
                      }
                    }}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.pincode ? "border-red-500" : ""
                    }`}
                  />

                  {validationErrors.pincode && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.pincode}
                    </p>
                  )}
                </div>

                <div>
                  <label>GST number*</label>
                  <input
                    name="gst_number"
                    value={vendorData.gst_number}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Allow up to 15 alphanumeric characters
                      if (/^[A-Z0-9]{0,15}$/.test(value)) {
                        handleChange({ target: { name: "gst_number", value } });
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.toUpperCase();
                      const gstRegex =
                        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
                      if (!gstRegex.test(value)) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          gst_number: "Enter a valid 15-character GST number",
                        }));
                      } else {
                        setValidationErrors((prev) => ({
                          ...prev,
                          gst_number: "",
                        }));
                      }
                    }}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.gst_number ? "border-red-500" : ""
                    }`}
                  />

                  {validationErrors.gst_number && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.gst_number}
                    </p>
                  )}
                </div>

                <div>
                  <label>PAN number*</label>
                  <input
                    name="pan_no"
                    value={vendorData.pan_no}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Allow only alphanumeric characters and allow max length of 10
                      if (/^[A-Z0-9]{0,10}$/.test(value)) {
                        handleChange({ target: { name: "pan_no", value } });
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.toUpperCase();
                      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
                      if (!panRegex.test(value)) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          pan_no:
                            "Enter a valid PAN number (5 letters, 4 digits, 1 letter)",
                        }));
                      } else {
                        setValidationErrors((prev) => ({
                          ...prev,
                          pan_no: "",
                        }));
                      }
                    }}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.pan_no ? "border-red-500" : ""
                    }`}
                  />

                  {validationErrors.pan_no && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.pan_no}
                    </p>
                  )}
                </div>

                <div>
                  <label>TAN number</label>
                  <input
                    name="tan_number"
                    value={vendorData.tan_number}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      // Allow only alphanumeric characters and allow max length of 10
                      if (/^[A-Z0-9]{0,10}$/.test(value)) {
                        handleChange({ target: { name: "tan_number", value } });
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value.toUpperCase();
                      const tanRegex = /^[A-Z]{4}[0-9]{4}[A-Z]{1}$/;
                      if (!tanRegex.test(value)) {
                        setValidationErrors((prev) => ({
                          ...prev,
                          tan_number:
                            "Enter a valid TAN number (4 letters, 4 digits, 1 letter)",
                        }));
                      } else {
                        setValidationErrors((prev) => ({
                          ...prev,
                          tan_number: "",
                        }));
                      }
                    }}
                    className={`border w-full p-2 rounded-lg ${
                      validationErrors.tan_number ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors.tan_number && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.tan_number}
                    </p>
                  )}
                </div>
              </form>

              <div className="flex gap-4 mt-6">
                <button
                  className="bg-custome-blue w-1/6 text-white px-6 py-2 rounded-lg"
                  onClick={handleAddVendor}
                >
                  Add
                </button>
                <button
                  className="border border-black w-1/6 px-6 py-2 rounded-lg"
                  onClick={() => setShowPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 px-3 py-2 rounded-lg border w-48"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="border w-1/5 px-3 py-2 rounded-lg bg-white"
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="border w-1/5 px-3 py-2 rounded-lg bg-white"
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="border w-1/5 px-3 py-2 rounded-lg bg-white"
            >
              <option value="">Select City</option>
              {cities.map((ct) => (
                <option key={ct.name} value={ct.name}>
                  {ct.name}
                </option>
              ))}
            </select>

            <select className="border px-3 py-2 rounded-lg bg-white">
              <option>Sort by</option>
            </select>
          </div>

          {/* Export Buttons */}
          <DownloadTableButtons
            data={exportData}
            columns={columns}
            fileName="Vendors"
          />
        </div>
        {/* Table */}
        <div
          className="overflow-x-auto rounded-lg shadow bg-white p-4"
          style={{ maxHeight: 400, overflowY: "auto", minWidth: 900 }}
        >
          {" "}
          <table className="w-full bg-white rounded-lg border-collapse">
            <thead className="border-b-2 border-black  bg-white z-10">
              <tr className="border-b-2 border-gray-200 text-black text-left">
                <th className="p-2">S. No.</th>
                <th className="p-2">Vendor</th>
                <th className="p-2">Email</th>
                <th className="p-2">Phone no.</th>
                <th className="p-2">Workflow</th>
                <th className="p-2">Stage</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((vendor, index) => (
                <tr key={vendor.id} className="odd:bg-blue-50">
                  <td className="p-2">{index + 1}</td>
                  <td
                    className="p-2 text-blue-600 font-semibold cursor-pointer hover:underline"
                    onClick={() => handleVendorClick(vendor)}
                  >
                    {vendor.supplier_name}
                  </td>

                  <td className="p-2">{vendor.email_id}</td>
                  <td className="p-2">{vendor.landline_num}</td>
                  <td className="p-2">{getWorkflowName(vendor.workflow_id)}</td>
                  <td className="p-2 text-green-600">{vendor.current_stage}</td>
                  <td className="p-2">{vendor.status}</td>
                  <td className="p-2 flex items-center justify-center gap-3">
                    <FaEdit
                      className="text-custome-blue cursor-pointer"
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setEditPopup(true);
                      }}
                    />
                    <FaTrash
                      className="text-red-500 cursor-pointer"
                      onClick={() => handleDeleteClick(vendor)}
                    />
                    <FaRegIdCard
                      className="text-gray-700 cursor-pointer"
                      onClick={() => {
                        setSelectedVendor(vendor);
                        setContactData((prev) => ({
                          ...prev,
                          supplier_id: vendor?.id || "",
                        }));
                        setShowContactPopup(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showVendorPopup && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-6xl w-full relative shadow-lg overflow-auto max-h-[90vh]">
              <button
                className="absolute top-2 right-2 text-red-600 text-4xl"
                onClick={() => setShowVendorPopup(false)}
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 text-left">
                Vendor Details
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <p>
                  <strong>Vendor Name:</strong> {selectedVendor.supplier_name}
                </p>
                <p>
                  <strong>Email:</strong> {selectedVendor.email_id}
                </p>
                <p>
                  <strong>Landline:</strong> {selectedVendor.landline_num}
                </p>
                <p>
                  <strong>Address:</strong> {selectedVendor.address}
                </p>
                <p>
                  <strong>Country:</strong> {selectedVendor.country}
                </p>
                <p>
                  <strong>State:</strong> {selectedVendor.state}
                </p>
                <p>
                  <strong>City:</strong> {selectedVendor.city}
                </p>
                <p>
                  <strong>Pin code:</strong> {selectedVendor.pincode}
                </p>
                <p>
                  <strong>GST:</strong> {selectedVendor.gst_number}
                </p>
                <p>
                  <strong>PAN:</strong> {selectedVendor.pan_no}
                </p>
                <p>
                  <strong>TAN:</strong> {selectedVendor.tan_number}
                </p>
                <p>
                  <strong>Lead:</strong> {selectedVendor.lead}
                </p>
              </div>

              {/* Contact Details Table */}
              <h3 className="text-lg font-semibold mb-2 text-left">
                Contact Details
              </h3>
              <table className="w-full table-auto border border-gray-300 text-sm">
                <thead className="bg-gray-300 text-left">
                  <tr>
                    <th className="p-2">Sr. no.</th>
                    <th className="p-2">Contact Person</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Phone no.</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {contactDetails.length > 0 ? (
                    contactDetails.map((contact, index) => (
                      <tr key={contact.contact_id} className="border-t">
                        <td className="p-2">{index + 1}.</td>
                        <td className="p-2">{contact.contact_person}</td>
                        <td className="p-2">{contact.email_id}</td>
                        <td className="p-2">{contact.phone_num}</td>
                        <td className="p-2 capitalize">{contact.status}</td>
                        <td className="p-2 flex gap-2">
                          <FaEdit
                            className="text-custome-blue cursor-pointer"
                            onClick={() => {
                              setSelectedContact(contact); // contact is the row data
                              setIsEditPopupOpen(true);
                            }}
                          />
                          <FaTrash
                            className="text-red-500 cursor-pointer"
                            onClick={() => handleDelete(contact)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-4 text-center text-gray-500" colSpan="6">
                        No contact data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {isEditPopupOpen && (
                <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50">
                  <div className="bg-white rounded-lg shadow-lg p-6 w-[90%] max-w-5xl max-h-[90vh] overflow-y-auto">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Edit Contact</h2>
                      <button
                        onClick={() => setIsEditPopupOpen(false)}
                        className="text-red-500 text-lg"
                      >
                        ✖
                      </button>
                    </div>

                    <form
                      onSubmit={handleUpdate}
                      className="grid grid-cols-3 gap-4"
                    >
                      <div>
                        <label>Category Type*</label>
                        <select
                          value={selectedContact?.category_type || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              category_type: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        >
                          <option value="">Select Category Type</option>
                        </select>
                      </div>

                      <div>
                        <label>Category*</label>
                        <select
                          value={selectedContact?.category || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              category: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        >
                          <option value="">Select Category</option>
                        </select>
                      </div>

                      <div>
                        <label>Asset*</label>
                        <select
                          value={selectedContact?.asset_name || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              asset_name: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        >
                          <option value="">Select Asset</option>
                        </select>
                      </div>

                      <div>
                        <label>Contact Person*</label>
                        <input
                          value={selectedContact?.contact_person || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              contact_person: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        />
                      </div>

                      <div>
                        <label>Phone no.*</label>
                        <input
                          value={selectedContact?.phone_num || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              phone_num: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        />
                      </div>

                      <div>
                        <label>Email*</label>
                        <input
                          value={selectedContact?.email_id || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              email_id: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        />
                      </div>

                      <div className="col-span-3">
                        <label>Address*</label>
                        <input
                          value={selectedContact?.address || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              address: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        />
                      </div>

                      <div>
                        <label>Country*</label>
                        <select
                          value={selectedContact?.country || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              country: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        >
                          <option value="">Select Country</option>
                        </select>
                      </div>

                      <div>
                        <label>State*</label>
                        <select
                          value={selectedContact?.state || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              state: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        >
                          <option value="">Select State</option>
                        </select>
                      </div>

                      <div>
                        <label>City*</label>
                        <select
                          value={selectedContact?.city || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              city: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        >
                          <option value="">Select City</option>
                        </select>
                      </div>

                      <div>
                        <label>Pin code*</label>
                        <input
                          value={selectedContact?.pincode || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              pincode: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        />
                      </div>

                      <div>
                        <label>Department*</label>
                        <input
                          value={selectedContact?.department || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              department: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        />
                      </div>

                      <div>
                        <label>Designation*</label>
                        <input
                          value={selectedContact?.designation || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              designation: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        />
                      </div>

                      <div>
                        <label>Date of Start</label>
                        <input
                          type="date"
                          value={selectedContact?.date_of_start || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              date_of_start: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        />
                      </div>

                      <div>
                        <label>Date of End</label>
                        <input
                          type="date"
                          value={selectedContact?.date_of_end || ""}
                          onChange={(e) =>
                            setSelectedContact({
                              ...selectedContact,
                              date_of_end: e.target.value,
                            })
                          }
                          className="border p-2 w-full"
                        />
                      </div>

                      <div className="col-span-3">
                        <label className="block mb-1">Status*</label>
                        <div className="flex gap-4 items-center">
                          <label>
                            <input
                              type="radio"
                              name="status"
                              value="active"
                              checked={selectedContact?.status === "active"}
                              onChange={() =>
                                setSelectedContact({
                                  ...selectedContact,
                                  status: "active",
                                })
                              }
                            />
                            <span className="ml-1">Active</span>
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="status"
                              value="inactive"
                              checked={selectedContact?.status === "inactive"}
                              onChange={() =>
                                setSelectedContact({
                                  ...selectedContact,
                                  status: "inactive",
                                })
                              }
                            />
                            <span className="ml-1">Inactive</span>
                          </label>
                        </div>
                      </div>

                      <div className="col-span-2 flex gap-4 mt-4">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white w-1/4 px-6 py-2 rounded"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          className="border border-gray-400 w-1/4 px-6 py-2 rounded"
                          onClick={() => setIsEditPopupOpen(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {editPopup && selectedVendor && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-5xl w-full relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setEditPopup(false)}
                className="absolute top-2 right-2 text-red-500 text-2xl font-bold"
              >
                &times;
              </button>
              <h2 className="flex text-xl font-semibold mb-4">Edit Vendor</h2>
              <form className="grid grid-cols-3 gap-4">
                <div>
                  <label>Workflow*</label>
                  <select
                    className="border w-full p-2 rounded-lg"
                    value={workflowId}
                    onChange={(e) => setWorkflowId(e.target.value)}
                  >
                    <option value="">Select Workflow</option>
                    {workflows.map((w) => (
                      <option key={w.workflowid} value={w.workflowid}>
                        {w.workflowname}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label>Vendor Name*</label>
                  <input
                    value={vendorData.name}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, name: e.target.value })
                    }
                    className="border w-full p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label>Landline no.*</label>
                  <input
                    value={vendorData.landline}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, landline: e.target.value })
                    }
                    className="border w-full p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label>Email*</label>
                  <input
                    value={vendorData.email}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, email: e.target.value })
                    }
                    className="border w-full p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label>Address*</label>
                  <input
                    value={vendorData.address}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, address: e.target.value })
                    }
                    className="border w-full p-2 rounded-lg"
                  />
                </div>

                {/* Country Dropdown */}
                <div>
                  <label>Country*</label>
                  <select
                    className="border w-full p-2 rounded-lg"
                    value={selectedCountry}
                    onChange={(e) => {
                      setSelectedCountry(e.target.value);
                      setSelectedState("");
                      setSelectedCity("");
                    }}
                  >
                    <option value="">Select Country</option>
                    {countries.map((c) => (
                      <option key={c.isoCode} value={c.isoCode}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* State Dropdown */}
                <div>
                  <label>State*</label>
                  <select
                    className="border w-full p-2 rounded-lg"
                    value={selectedState}
                    onChange={(e) => {
                      setSelectedState(e.target.value);
                      setSelectedCity("");
                    }}
                  >
                    <option value="">Select State</option>
                    {states.map((s) => (
                      <option key={s.isoCode} value={s.isoCode}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* City Dropdown */}
                <div>
                  <label>City*</label>
                  <select
                    className="border w-full p-2 rounded-lg"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                  >
                    <option value="">Select City</option>
                    {cities.map((ct) => (
                      <option key={ct.name} value={ct.name}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Pin code*</label>
                  <input
                    value={vendorData.pincode}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, pincode: e.target.value })
                    }
                    className="border w-full p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label>GST number*</label>
                  <input
                    value={vendorData.gst}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, gst: e.target.value })
                    }
                    className="border w-full p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label>PAN number*</label>
                  <input
                    value={vendorData.pan}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, pan: e.target.value })
                    }
                    className="border w-full p-2 rounded-lg"
                  />
                </div>

                <div>
                  <label>TAN number</label>
                  <input
                    value={vendorData.tan}
                    onChange={(e) =>
                      setVendorData({ ...vendorData, tan: e.target.value })
                    }
                    className="border w-full p-2 rounded-lg"
                  />
                </div>
              </form>

              <div className="flex gap-4 mt-6">
                <button
                  className="bg-[#005AE6] text-white w-1/6 px-6 py-2 rounded-lg"
                  onClick={() => {
                    axios
                      .put(
                        `${API.PURCHASE_API}/supplier/suppliers/${selectedVendor.id}`,
                        {
                          supplier_name: vendorData.name,
                          landline_num: vendorData.landline,
                          email_id: vendorData.email,
                          address: vendorData.address,
                          country: selectedCountry,
                          state: selectedState,
                          city: selectedCity,
                          pincode: vendorData.pincode,
                          gst_number: vendorData.gst,
                          pan_no: vendorData.pan,
                          tan_number: vendorData.tan,
                          workflow_id: workflowId,
                          current_stage: selectedVendor.current_stage,
                          status: selectedVendor.status,
                        },
                        { headers: { Authorization: `Bearer ${token}` } }
                      )
                      .then((res) => {
                        Swal.fire(
                          "Success",
                          "Vendor updated successfully",
                          "success"
                        );
                        setEditPopup(false);
                      })
                      .catch((err) => {
                        console.error(err);
                        Swal.fire("Error", "Failed to update vendor", "error");
                      });
                  }}
                >
                  Update
                </button>

                <button
                  className="border border-black w-1/6 px-6 py-2 rounded-lg"
                  onClick={() => setEditPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-[350px] text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-4 rounded-full">
                  <FaTrash size={40} className="text-gray-500" />
                </div>
              </div>
              <h2 className="text-xl font-bold">Delete Budget?</h2>
              <p className="text-gray-500 mt-2">
                Are you sure you want to delete{" "}
                <strong>{selectedVendor?.vendorName}</strong>?
              </p>

              <div className="flex justify-center gap-4 mt-6">
                <button
                  onClick={handleCloseDeleteModal}
                  className="border border-black px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {showContactPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-5xl w-full relative overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setShowContactPopup(false)}
                className="absolute top-2 right-2 mr-4 text-red-500 text-2xl font-bold"
              >
                &times;
              </button>
              <h2 className="flex text-xl font-semibold mb-4">
                Create Contact
              </h2>

              <form className="grid grid-cols-3 gap-4">
                {/* New Dropdown Fields */}
                {/* Request For */}
                <div className="w-full">
                  <label className="block text-gray-700 mb-1">
                    Request For
                  </label>
                  <Autocomplete
                    freeSolo
                    options={requestForOptions}
                    value={contactData.category_type || ""}
                    onChange={(event, newValue) => {
                      setContactData((prev) => ({
                        ...prev,
                        category_type: newValue,
                        category: "",
                        requestAsset: "",
                        asset_name: "",
                      }));
                      setRequestFor(newValue || "");
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event?.type === "change") {
                        setContactData((prev) => ({
                          ...prev,
                          category_type: newInputValue,
                          category: "",
                          requestAsset: "",
                          asset_name: "",
                        }));
                        setRequestFor(newInputValue || "");
                      }
                    }}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        className="border w-full p-2 rounded-lg"
                      />
                    )}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-gray-700 mb-1">Category</label>
                  <Autocomplete
                    freeSolo
                    options={categoryOptions}
                    value={contactData.category || ""}
                    onChange={(event, newValue) => {
                      setContactData((prev) => ({
                        ...prev,
                        category: newValue,
                        requestAsset: "",
                        asset_name: "",
                      }));
                      setCategory(newValue || "");
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event?.type === "change") {
                        setContactData((prev) => ({
                          ...prev,
                          category: newInputValue,
                          requestAsset: "",
                          asset_name: "",
                        }));
                        setCategory(newInputValue || "");
                      }
                    }}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        className="border w-full p-2 rounded-lg"
                      />
                    )}
                  />
                </div>
                <div className="w-full">
                  <label className="block text-gray-700 mb-1">Material</label>
                  <Autocomplete
                    freeSolo
                    options={assetOptions}
                    value={contactData.asset_name || ""}
                    onChange={(event, newValue) => {
                      setContactData((prev) => ({
                        ...prev,
                        asset_name: newValue,
                      }));
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event?.type === "change") {
                        setContactData((prev) => ({
                          ...prev,
                          asset_name: newInputValue,
                        }));
                      }
                    }}
                    fullWidth
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        className="border w-full p-2 rounded-lg"
                      />
                    )}
                  />
                </div>
                {/* Existing Fields */}
                <div>
                  <label>Contact Person*</label>
                  <input
                    className="border w-full p-2 rounded-lg"
                    placeholder="Enter person name"
                    value={contactData.contact_person}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        contact_person: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Phone no.*</label>
                  <input
                    className="border w-full p-2 rounded-lg"
                    placeholder="Enter phone no."
                    value={contactData.phone_num}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        phone_num: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Email*</label>
                  <input
                    className="border w-full p-2 rounded-lg"
                    placeholder="Enter email address"
                    value={contactData.email_id}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        email_id: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Address*</label>
                  <input
                    className="border w-full p-2 rounded-lg"
                    placeholder="Enter address"
                    value={contactData.address}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Country*</label>
                  <select
                    className="border w-full p-2 rounded-lg"
                    value={contactData.country}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        country: e.target.value,
                      }))
                    }
                  >
                    <option>Select country</option>
                    <option>India</option>
                  </select>
                </div>
                <div>
                  <label>State*</label>
                  <select
                    className="border w-full p-2 rounded-lg"
                    value={contactData.state}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                  >
                    <option>Select state</option>
                    <option>Uttarakhand</option>
                  </select>
                </div>
                <div>
                  <label>City*</label>
                  <select
                    className="border w-full p-2 rounded-lg"
                    value={contactData.city}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        city: e.target.value,
                      }))
                    }
                  >
                    <option>Select city</option>
                    <option>Dehradun</option>
                  </select>
                </div>
                <div>
                  <label>Pin code*</label>
                  <input
                    className="border w-full p-2 rounded-lg"
                    placeholder="Enter pin code"
                    value={contactData.pincode}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        pincode: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Department*</label>
                  <input
                    className="border w-full p-2 rounded-lg"
                    placeholder="Enter department"
                    value={contactData.department}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        department: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Designation*</label>
                  <input
                    className="border w-full p-2 rounded-lg"
                    placeholder="Enter designation"
                    value={contactData.designation}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Date of Start</label>
                  <input
                    type="date"
                    className="border w-full p-2 rounded-lg"
                    value={contactData.date_of_start}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        date_of_start: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label>Date of End</label>
                  <input
                    type="date"
                    className="border w-full p-2 rounded-lg"
                    value={contactData.date_of_end}
                    onChange={(e) =>
                      setContactData((prev) => ({
                        ...prev,
                        date_of_end: e.target.value,
                      }))
                    }
                  />
                </div>
              </form>

              <div className="mt-4">
                <label>Status*</label>
                <div className="flex gap-6 mt-1">
                  <label className="flex items-center gap-1">
                    <input type="radio" name="status" defaultChecked /> Active
                  </label>
                  <label className="flex items-center gap-1">
                    <input type="radio" name="status" /> Inactive
                  </label>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  className="bg-custome-blue w-1/6 text-white px-6 py-2 rounded-lg"
                  onClick={handleAddContact}
                >
                  Add contact
                </button>

                <button
                  className="border border-black w-1/6 px-6 py-2 rounded-lg"
                  onClick={() => setShowContactPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <button className="px-2 py-1 border rounded-md">{"<"}</button>
          <button className="bg-custome-blue text-white px-3 py-1 rounded-md">
            1
          </button>
          <span>of</span>
          <button className="border px-3 py-1 rounded-md">1</button>
          <button className="px-2 py-1 border rounded-md">{">"}</button>
        </div>
        <>
          {showModal && (
            <PopupModal
              {...modalProps}
              onClose={modalProps?.onClose || (() => setShowModal(false))}
            />
          )}
        </>
      </div>
    </div>
  );
};

export default VendorManagement;
