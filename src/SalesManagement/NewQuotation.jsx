import React, { useState, useEffect } from "react";
import axios from "axios";
import { toWords } from "number-to-words";

import QuotationPDF from "./QuotationPreview";
import { pdf } from "@react-pdf/renderer";
import QuotationPreviewPopup from "./service/QuotationPreviewPopup";
import ShareQuotationPopup from './components/ShareQuotationPopup';
import CenteredModal from './components/CenteredModal';
import { showCustomAlert } from "./components/CustomAlert";


export default function FullQuotationForm() {
  const baseUrl = process.env.REACT_APP_URL_sales || '';
  const baseUrld = process.env.REACT_APP_URL_dms || '';
  const [selectedRfpId, setSelectedRfpId] = useState("");
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [quotationToShare, setQuotationToShare] = useState(null);
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoUrl, setLogoUrl] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload immediately
      const url = await uploadLogoToDMS(file);
      if (url) {
        setLogoUrl(url);
      } else {
        alert("Failed to upload logo.");
      }
    }
  };

  // Function to reset form
  const resetForm = () => {
    setSelectedRfpId("");
    setQuotationNo("");
    setQuotationDate(() => {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    });
    setValidityDate("");
    setFrom({
      country: "India",
      businessName: "",
      phone: "",
      email: "",
      gstin: "",
      pan: "",
      address: "",
      city: "",
      postalCode: "",
      state: "",
    });
    setTo({
      customerId: "",
      customerName: "",
      phone: "",
      gstin: "",
      email: "",
      pan: "",
      address: "",
      city: "",
      postalCode: "",
      state: "",
    });
    setItems([{ name: "", qty: 1, rate: 0, igst: 0, cgst: 0, sgst: 0, description: "" }]);
  };


  const [quotationNo, setQuotationNo] = useState("");
  const [quotationDate, setQuotationDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });
  const [rfpOptions, setRfpOptions] = useState([]);


  const [validityDate, setValidityDate] = useState("");
  const calculateTotalTaxable = (items) => {
    return items.reduce((total, item) => total + item.qty * item.rate, 0);
  };

  const [from, setFrom] = useState({
    country: "India",
    businessName: "",
    phone: "",
    email: "",
    gstin: "",
    pan: "",
    address: "",
    city: "",
    postalCode: "",
    state: "",
  });
  const [to, setTo] = useState({
    customerId: "",
    customerUid: "",
    customerName: "",
    phone: "",
    gstin: "",
    email: "",
    pan: "",
    address: "",
    city: "",
    postalCode: "",
    state: "",
  });
  const [items, setItems] = useState([
    { name: "", qty: 1, rate: 0, igst: 0, cgst: 0, sgst: 0, description: "" },
  ]);



  const addItem = () => {
    setItems([
      ...items,
      { name: "", qty: 1, rate: 0, igst: 0, cgst: 0, sgst: 0 },
    ]);
  };

  const updateItem = (index, key, value) => {
    const updated = [...items];
    
    // Validate numeric fields - prevent negative values
    const numericFields = ['qty', 'rate', 'igst', 'cgst', 'sgst'];
    if (numericFields.includes(key)) {
      // Only allow non-negative numbers
      if (value < 0) {
        return; // Don't update if negative
      }
    }
    
    // If IGST is being set, clear CGST/SGST
    if (key === "igst") {
      updated[index].igst = value;
      if (value > 0) {
        updated[index].cgst = 0;
        updated[index].sgst = 0;
      }
    } else if (key === "cgst" || key === "sgst") {
      updated[index][key] = value;
      if (value > 0) {
        updated[index].igst = 0;
      }
    } else {
      updated[index][key] = value;
    }
    setItems(updated);
  };

  const removeItem = (index) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const calculateAmount = (item) => {
    const { qty, rate, igst = 0, cgst = 0, sgst = 0 } = item;
    const subtotal = qty * rate;
    const totalTax = igst > 0 ? igst : cgst + sgst;
    return subtotal + (subtotal * totalTax) / 100;
  };



  const totalAmount = items.reduce(
    (sum, item) => sum + calculateAmount(item),
    0
  );

  const uploadLogoToDMS = async (file) => {
    try {
      const formData = new FormData();
      formData.append("documents", file, file.name);
      formData.append("ref", "SM");
      formData.append("custom_folder", "sales");
      // Metadata for logo
      const metadata = [
        {
          service: "Sales Management",
          publish_id: dmsCompanyLogoId,
          user_id: sessionStorage.getItem("userId"),
          document_name: file.name,
        },
      ];
      formData.append("metadata", JSON.stringify(metadata));

      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        `${baseUrld}/dmsapi/upload-documents`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );
      
      return response.data?.uploaded_files[0].file_url || response.data?.url || null;
    } catch (error) {
      console.error("Error uploading logo to DMS:", error);
      return null;
    }
  };

  const handleSaveAndPreview = async () => {
    // Validation: ensure validity date is present and in YYYY-MM-DD format
    if (!validityDate) {
      await showCustomAlert({
        title: "Validation Error",
        message: "Please provide a Validity Date before saving the quotation.",
        type: "alert"
      });
      return false;
    }
    // basic format check (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(validityDate)) {
      await showCustomAlert({
        title: "Validation Error",
        message: "Validity Date must be in YYYY-MM-DD format.",
        type: "alert"
      });
      return false;
    }
    // Ensure DMS publish_id is set
    if (!dmsProductQuotationId) {
      try {
        await getDmsPublishId();
      } catch (err) {
        alert("Failed to fetch DMS publish_id");
        return false;
      }
    }

    // Logo URL is already in state 'logoUrl' from handleLogoUpload

    const quotationData = {
      rfp_id: selectedRfpId, // Exact RFP ID from dropdown
      quotation_no: quotationNo, // Auto-generated unique number
      status: "draft", // Initial status
      quotation_date: quotationDate,
      validity_date: validityDate,
      total_taxable: calculateTotalTaxable(items),
      total_amount: totalAmount,
      created_by: sessionStorage.getItem("userId"), // submitted from logged-in user
      company_logo: logoUrl, // Add logo URL here

      quotation_from: {
        business_name: from.businessName || "",
        phone: from.phone || "",
        email: from.email || "",
        gstin: from.gstin || "",
        pan: from.pan || "",
        address: from.address || "",
        city: from.city || "",
        state: from.state || "",
        postal_code: from.postalCode || "",
      },

      quotation_for: {
        customer_id: to.customerId || "",
        customer_uid: to.customerUid || "",
        customer_name: to.customerName || "",
        phone: to.phone || "",
        email: to.email || "",
        gstin: to.gstin || "",
        pan: to.pan || "",
        address: to.address || "",
        city: to.city || "",
        state: to.state || "",
        postal_code: to.postalCode || "",
      },

      items: items.map((item) => ({
        item_name: item.name || "",
        quantity: item.qty || 0,
        unit_rate: item.rate || 0,
        hsn_sac: item.hsn || "",
        tax_percent: item.tax || 0,
        igst: item.igst || 0,
        cgst: item.cgst || 0,
        sgst: item.sgst || 0,
        amount: item.amount || item.qty * item.rate,
        description: item.description || "",
      })),
    };

    try {
      // 1. Generate PDF from the formatted preview section (using frontend data)
      const previewElement = document.getElementById("quotation-preview");
      if (!previewElement) {
        alert("Preview section not found. PDF cannot be generated.");
        return false;
      }

      let dmsFileUrl = null;
      try {
        const pdfBlob = await pdf(
          <QuotationPDF quotationData={quotationData} />
        ).toBlob();
        // Prepare correct metadata array (one object per file)
        const metadataArr = [
          {
            publish_id: dmsProductQuotationId,
            service: "Sales Management",
            user_id: Number(sessionStorage.getItem("userId") || 0),
            document_name: `${quotationNo}.pdf`,
            ref: "SM",
            custom_folder: "sales",
            quotation_no: quotationNo,
            quotation_date: quotationDate,
            validity_date: validityDate,
            status: "draft",
            rfp_id: selectedRfpId,
            quotation_from: from,
            quotation_for: to,
            items: items,
            company_logo: logoUrl, // Include logo in metadata for PDF generation context if needed
            total_taxable: calculateTotalTaxable(items),
            total_amount: items.reduce(
              (sum, item) =>
                sum +
                item.qty *
                  item.rate *
                  (1 +
                    ((item.igst || 0) + (item.cgst || 0) + (item.sgst || 0)) /
                      100),
              0
            ),
            total_in_words:
              toWords(
                Math.floor(
                  items.reduce(
                    (sum, item) =>
                      sum +
                      item.qty *
                        item.rate *
                        (1 +
                          ((item.igst || 0) +
                            (item.cgst || 0) +
                            (item.sgst || 0)) /
                            100),
                    0
                  )
                )
              ) + " rupees.",
          },
        ];
        // Upload PDF to DMS and get the file link
        const formData = new FormData();
        formData.append("documents", pdfBlob, `${quotationNo}.pdf`);
        formData.append("ref", "SM");
        formData.append("custom_folder", "sales");
        formData.append("metadata", JSON.stringify(metadataArr));
        const token = sessionStorage.getItem("token");
        const dmsRes = await axios.post(
          `${baseUrld}/dmsapi/upload-documents`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: token ? `Bearer ${token}` : undefined,
            },
          }
        );
        dmsFileUrl = dmsRes.data?.uploaded_files[0].file_url || dmsRes.data?.url || null;
        if (dmsFileUrl) {
          QuotationCreation(dmsFileUrl, logoUrl);
        }
      } catch (err) {
        console.error("PDF generation or DMS upload failed", err);
        alert("PDF generation or DMS upload failed");
        return false;
      }
    } catch (error) {
      console.error("Error saving quotation:", error);
      alert("Error occurred while saving.");
      return false;
    }
    return true;
  };

  const [filePreview, setFilePreview] = useState(null);

  const QuotationCreation = async (dmsFileUrl, logoUrl) => {
    try {
      const quotationData = {
        rfp_id: selectedRfpId, // Use the exact RFP ID from dropdown
        quotation_no: quotationNo, // Send the auto-generated quotation number
        quotation_file_link: dmsFileUrl,
        status: "draft", // Set initial status as draft
        quotation_date: quotationDate,
      validity_date: validityDate,
      total_taxable: calculateTotalTaxable(items),
      total_amount: totalAmount,
      created_by: sessionStorage.getItem("userId"),
      company_logo: logoUrl, // Send logo URL to backend

      quotation_from: {
        business_name: from.businessName || "",
        phone: from.phone || "",
        email: from.email || "",
        gstin: from.gstin || "",
        pan: from.pan || "",
        address: from.address || "",
        city: from.city || "",
        state: from.state || "",
        postal_code: from.postalCode || "",
        logo_url: logoUrl || "", // Add logo_url to quotation_from
      },

      quotation_for: {
        customer_id: to.customerId || "",
        customer_uid: to.customerUid || "",
        customer_name: to.customerName || "",
        phone: to.phone || "",
        email: to.email || "",
        gstin: to.gstin || "",
        pan: to.pan || "",
        address: to.address || "",
        city: to.city || "",
        state: to.state || "",
        postal_code: to.postalCode || "",
      },

      items: items.map((item) => ({
        item_name: item.name || "",
        quantity: item.qty || 0,
        unit_rate: item.rate || 0,
        hsn_sac: item.hsn || "",
        tax_percent: item.tax || 0,
        igst: item.igst || 0,
        cgst: item.cgst || 0,
        sgst: item.sgst || 0,
        amount: item.amount || item.qty * item.rate,
        description: item.description || "",
      })),
    };

    const token = sessionStorage.getItem("token");
    const response = await axios.post(
      `${baseUrl}/salesmanagement/quotation/quotation-created`,
      quotationData,
      { headers: { Authorization: token ? `Bearer ${token}` : undefined, "Content-Type": "application/json" } }
    );

    if (response.data?.success) {
      // Open PDF in new tab
      window.open(dmsFileUrl, '_blank');
      
      // Store quotation data for sharing
      setQuotationToShare({
        quotation_file_link: dmsFileUrl,
        quotation_no: quotationNo,
        quotation_for: to
      });
      
      // Do not auto-open the share/mail popup after save.
      // The share popup data is stored in `quotationToShare` and can be opened manually if needed.
      return true;
    } else {
      alert("Failed to save quotation.");
      return false;
    }
  } catch (error) {
    console.error("Error creating quotation:", error);
    alert("Error creating quotation. Please try again.");
  }
  };

  // Handle sharing quotation via email
  const handleShareQuotation = async (shareData) => {
    try {
      const token = sessionStorage.getItem("token");
      const url = `${baseUrl}/salesmanagement/quotation/send_quotation_mail/quotation_section/${quotationNo}`;
      const config = { headers: { Authorization: token ? `Bearer ${token}` : undefined } };

      let response;
      if (shareData instanceof FormData) {
        // Let axios set multipart boundaries automatically
        response = await axios.post(url, shareData, config);
      } else {
        // JSON fallback
        response = await axios.post(url, shareData, {
          headers: { ...config.headers, 'Content-Type': 'application/json' },
        });
      }

      if (response.data?.success) {
        // Quotation shared successfully
      }
    } catch (error) {
      console.error("Error sharing quotation:", error);
      throw error; // bubble up so popup can show alerts
    }
  };

  

// Function to generate quotation number
const generateQuotationNumber = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QTN${year}${month}${day}${random}`;
};

// Handle RFP change and fetch indent details
const handleRfpChange = async (e) => {
  const selectedRfp = e.target.value;
  setSelectedRfpId(selectedRfp);
  
  if (!selectedRfp) {
    setQuotationNo('');
    setItems([{ name: "", qty: 1, rate: 0, tax: 0, description: "" }]);
    return;
  }
  
  try {
    // Generate a new quotation number
    const newQuotationNumber = generateQuotationNumber();
    setQuotationNo(newQuotationNumber);
    const token = sessionStorage.getItem("token");
    const res = await axios.get(
      `${baseUrl}/salesmanagement/indent/get-allindent/${selectedRfp}`,
      { headers: { Authorization: token ? `Bearer ${token}` : undefined } }
    );

    if (res.data && res.data.data && res.data.data.length > 0) {
      const indentGroup = res.data.data[0];

      // 🔹 Extract Customer details
      const customer = indentGroup.customer_details || {};
      setTo({
        customerId: customer.customer_id || "",
        customerUid: customer.customer_uid || customer.customer_id || "",
        customerName: customer.customer_name || "",
        phone: customer.phone_number || "",
        gstin: customer.gst_number || "",
        pan: customer.pan_no || "",
        email: customer.email_id || "",
        address: customer.address || "",
        city: customer.city || "",
        postalCode: customer.pincode || "",
        state: customer.state || "",
      });

      // 🔹 Extract Business (From) details
      const fromData = indentGroup.quotation_from || {};
      setFrom({
        businessName: fromData.business_name || "",
        phone: fromData.phone || "",
        email: fromData.email || "",
        gstin: fromData.gstin || "",
        pan: fromData.pan || "",
        address: fromData.address || "",
        city: fromData.city || "",
        postal_code: fromData.postal_code || "",
        state: fromData.state || "",
      });

      // 🔹 Extract Logo URL if available
      if (fromData.logo_url) {
        setLogoPreview(fromData.logo_url);
        setLogoUrl(fromData.logo_url);
      }

      // 🔹 Extract Indent items
      const indents = indentGroup.indents || [];
      setItems(
        indents.map((indent) => ({
          name: indent.asset_name || "",
          qty: indent.quantity || 1,
          rate: indent.unit_rate || 0, // optional if not in API
          hsn: indent.hsn_sac || "",
          tax: indent.tax_percent || 0, // optional if not in API
          description: indent.remarks || "",
        }))
      );

      // Validity Date will be entered manually by the user. Do not auto-set it from indent data.
    }
  } catch (err) {
    console.error("Error fetching indent data:", err);
    setItems([{ name: "", qty: 1, rate: 0, tax: 0, description: "" }]);
  }
};


  const [dmsProductQuotationId, setDmsProductQuotationId] = useState(null);
  const [dmsCompanyLogoId, setDmsCompanyLogoId] = useState(null);
  // Preview popup state (for "View xyzabc" link)
  const [previewRfpId, setPreviewRfpId] = useState(null);

  const getDmsPublishId = async () => {
    const service_name = "Sales Management";
    const url = `${baseUrld}/mapping/check`;
    const token = sessionStorage.getItem("token");
    // First: Product Quotation
    try {
      const responsePQ = await axios.get(url, {
        params: {
          service_name,
          doctype: "Product Quotation",
          doc_name: "Product Quotation",
        },
        timeout: 10000,
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      if (responsePQ.data.dms_publish_id) {
        setDmsProductQuotationId(responsePQ.data.dms_publish_id);
      }
    } catch (error) {
      console.log(error);
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Failed to check DMS mapping for Product Quotation."
      );
    }
    // Second: Company Logo
    try {
      const responseLogo = await axios.get(url, {
        params: {
          service_name,
          doctype: "Company Logo",
          doc_name: "Company Logo",
        },
        timeout: 10000,
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      if (responseLogo.data.dms_publish_id) {
        setDmsCompanyLogoId(responseLogo.data.dms_publish_id);
      }
    } catch (error) {
      throw new Error(
        error.response?.data?.error ||
          error.message ||
          "Failed to check DMS mapping for Company Logo."
      );
    }
  };

  // Fetch RFP options from the API
  const fetchRfpOptions = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${baseUrl}/salesmanagement/indent/get-allrfps`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );

      if (response.data && response.data.rfps) {
        setRfpOptions(response.data.rfps);
      } else {
        console.warn("Unexpected RFP response format", response.data);
      }
    } catch (error) {
      console.error("Failed to fetch RFP options", error);
    }
  };
  useEffect(() => {
    getDmsPublishId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchRfpOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex  ">
      <main className="flex items-center justify-center bg-gray-50 overflow-auto h-full">
        <div className="p-5 bg-white shadow rounded" id="quotation-preview">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">Quotation</h1>
              <div className="mt-4 space-y-2">
                <div>
                  <span className="font-semibold">Quotation Date:</span>{" "}
                  <input
                    type="date"
                    className="border rounded px-2 py-1 ml-2 bg-gray-100 cursor-not-allowed"
                    value={quotationDate}
                    readOnly
                    disabled
                  />
                </div>
                <div>
                  <span className="font-semibold">Validity Date:</span>{" "}
                  <input
                    type="date"
                    className="border rounded px-2 py-1 ml-2"
                    value={validityDate}
                    onChange={(e) => setValidityDate(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="flex flex-col">
                <label className="mb-1 text-sm font-medium text-gray-700">
                  RFP ID
                </label>
                <select
                  value={selectedRfpId || ''}
                  onChange={handleRfpChange}
                  className="border rounded px-3 py-2"
                >
                  <option value="">Select RFP ID</option>
                  {rfpOptions.map((rfp) => (
                    <option key={rfp.rfp_id} value={rfp.rfp_id}>
                      {rfp.rfp_id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-2">
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  id="logo-upload"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={!!logoUrl} // Disable if logo is already present
                />
                <label
                  htmlFor="logo-upload"
                  className={`block w-[257px] h-[92px] border border-dashed border-gray-300 rounded-[8px] flex flex-col items-center justify-center overflow-hidden ${
                    logoUrl ? 'cursor-not-allowed bg-gray-50' : 'cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Business Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-sm text-gray-500">Add Business Logo</span>
                      <br />
                      <span className="text-xs text-gray-400">(PNG/JPEG up to 1080×1080)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* From and For Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 py-6">
            {/* Quotation From */}
            <div className="sticky top-4 self-start bg-[#FAFAF6] rounded-lg p-6 border z-10">
              <h2 className="text-lg font-semibold mb-1">Quotation from</h2>
              <p className="text-sm text-gray-500 mb-4">Your details</p>

              <select
                className="w-full border rounded px-3 py-2 mb-4"
                value={from.country}
                onChange={(e) => setFrom({ ...from, country: e.target.value })}
              >
                <option value="India">India</option>
                <option value="USA">USA</option>
              </select>

              <input
                placeholder="Your Business name (required)"
                className="w-full border rounded px-3 py-2 mb-4"
                value={from.businessName}
                onChange={(e) =>
                  setFrom({ ...from, businessName: e.target.value })
                }
              />

              <div className="flex items-center gap-2 mb-4">
                <span>🇮🇳</span>
                <span>+91</span>
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="flex-1 border rounded px-3 py-2"
                  value={from.phone}
                  onChange={(e) => setFrom({ ...from, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  placeholder="Your GSTIN (required)"
                  className="border rounded px-3 py-2"
                  value={from.gstin}
                  onChange={(e) => setFrom({ ...from, gstin: e.target.value })}
                />
                <input
                  placeholder="Your PAN (required)"
                  className="border rounded px-3 py-2"
                  value={from.pan}
                  onChange={(e) => setFrom({ ...from, pan: e.target.value })}
                />
              </div>

              <input
                placeholder="Address (required)"
                className="w-full border rounded px-3 py-2 mb-4"
                value={from.address}
                onChange={(e) => setFrom({ ...from, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  placeholder="City (required)"
                  className="border rounded px-3 py-2"
                  value={from.city}
                  onChange={(e) => setFrom({ ...from, city: e.target.value })}
                />
                <input
                  placeholder="Postal Code / Zip Code"
                  className="border rounded px-3 py-2"
                  value={from.postalCode}
                  onChange={(e) =>
                    setFrom({ ...from, postalCode: e.target.value })
                  }
                />
              </div>

              <input
                placeholder="State (required)"
                className="w-full border rounded px-3 py-2"
                value={from.state}
                onChange={(e) => setFrom({ ...from, state: e.target.value })}
              />
            </div>

            {/* Quotation For */}
            <div className="sticky top-4 self-start bg-[#FAFAF6] rounded-lg p-6 border z-10">
              <h2 className="text-lg font-semibold mb-1">Quotation for</h2>
              <p className="text-sm text-gray-500 mb-4">Customer's details</p>

              <input
                placeholder="Customer UID"
                className="w-full border rounded px-3 py-2 mb-4"
                value={to.customerUid}
                onChange={(e) => setTo({ ...to, customerUid: e.target.value })}
              ></input>

              <input
                placeholder="Customer's name"
                className="w-full border rounded px-3 py-2 mb-4"
                value={to.customerName}
                onChange={(e) => setTo({ ...to, customerName: e.target.value })}
              />

              <div className="flex items-center gap-2 mb-4">
                <span>🇮🇳</span>
                <span>+91</span>
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="flex-1 border rounded px-3 py-2"
                  value={to.phone}
                  onChange={(e) => setTo({ ...to, phone: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  placeholder="Customer's GSTIN (required)"
                  className="border rounded px-3 py-2"
                  value={to.gstin}
                  onChange={(e) => setTo({ ...to, gstin: e.target.value })}
                />
                <input
                  placeholder="Customer's PAN (required)"
                  className="border rounded px-3 py-2"
                  value={to.pan}
                  onChange={(e) => setTo({ ...to, pan: e.target.value })}
                />
              </div>

              <input
                placeholder="Address (required)"
                className="w-full border rounded px-3 py-2 mb-4"
                value={to.address}
                onChange={(e) => setTo({ ...to, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  placeholder="City (required)"
                  className="border rounded px-3 py-2"
                  value={to.city}
                  onChange={(e) => setTo({ ...to, city: e.target.value })}
                />
                <input
                  placeholder="Postal Code / Zip Code"
                  className="border rounded px-3 py-2"
                  value={to.postalCode}
                  onChange={(e) => setTo({ ...to, postalCode: e.target.value })}
                />
              </div>

              <input
                placeholder="State (required)"
                className="w-full border rounded px-3 py-2"
                value={to.state}
                onChange={(e) => setTo({ ...to, state: e.target.value })}
              />
            </div>
          </div>

          {/* Item Table */}
          <div className="w-full">
            {/* Header */}
            <div className="grid grid-cols-8 gap-3 font-semibold text-sm text-white bg-[#0057E4] px-4 py-2 rounded-t-md">
              <div>Item</div>
              <div>Qty</div>
              <div>Unit Rate</div>
              <div>HSN/SAC</div>
              <div>IGST %</div>
              <div>CGST %</div>
              <div>SGST %</div>
              <div>Amount</div>
            </div>

            {/* Items */}
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-[#EDF4FF] rounded-b-md px-4 py-3 mb-3 border border-t-0 border-[#D0DFF7]"
              >
                <div className="grid grid-cols-8 gap-3 items-center text-sm">
                  {/* Item Name */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Item"
                      value={item.name}
                      onChange={(e) =>
                        updateItem(index, "name", e.target.value)
                      }
                      className="w-full bg-transparent border-b border-gray-400 focus:outline-none"
                    />
                    <button
                      onClick={() => removeItem(index)}
                      className="absolute top-0 right-0 text-gray-400 hover:text-red-600 text-base"
                    >
                      ×
                    </button>
                  </div>

                  {/* Quantity */}
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={item.qty}
                    onChange={(e) =>
                      updateItem(index, "qty", Number(e.target.value))
                    }
                    className="bg-transparent border-b border-gray-400 focus:outline-none text-center"
                  />

                  {/* Unit Rate */}
                  <input
                    type="number"
                    placeholder="₹0"
                    min="0"
                    value={item.rate}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      updateItem(index, "rate", value);
                    }}
                    className="bg-transparent border-b border-gray-400 focus:outline-none text-center"
                  />

                  {/* HSN/SAC */}
                  <input
                    type="text"
                    placeholder="HSN/SAC"
                    value={item.hsn}
                    onChange={(e) => updateItem(index, "hsn", e.target.value)}
                    className="bg-transparent border-b border-gray-400 focus:outline-none text-center"
                  />

                  {/* IGST */}
                  <input
                    type="number"
                    placeholder="0%"
                    min="0"
                    value={item.igst}
                    onChange={(e) =>
                      updateItem(index, "igst", Number(e.target.value))
                    }
                    className="bg-transparent border-b border-gray-400 focus:outline-none text-center"
                    disabled={item.cgst > 0 || item.sgst > 0}
                  />

                  {/* CGST */}
                  <input
                    type="number"
                    placeholder="0%"
                    min="0"
                    value={item.cgst}
                    onChange={(e) =>
                      updateItem(index, "cgst", Number(e.target.value))
                    }
                    className="bg-transparent border-b border-gray-400 focus:outline-none text-center"
                    disabled={item.igst > 0}
                  />

                  {/* SGST */}
                  <input
                    type="number"
                    placeholder="0%"
                    min="0"
                    value={item.sgst}
                    onChange={(e) =>
                      updateItem(index, "sgst", Number(e.target.value))
                    }
                    className="bg-transparent border-b border-gray-400 focus:outline-none text-center"
                    disabled={item.igst > 0}
                  />

                  {/* Amount */}
                  <div className="text-right font-semibold text-black whitespace-nowrap min-w-[80px]">
                    ₹{calculateAmount(item).toLocaleString()}
                  </div>
                </div>

                {/* Description Below */}
                <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                  <input
                    type="text"
                    placeholder="Add description"
                    value={item.description}
                    onChange={(e) =>
                      updateItem(index, "description", e.target.value)
                    }
                    className="w-full bg-transparent border-b border-gray-300 focus:outline-none mr-2"
                  />
                  <button
                    onClick={() => updateItem(index, "description", "")}
                    className="text-gray-300 hover:text-red-400 text-base"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Line */}
            <button
              onClick={addItem}
              className="w-full border-dashed border border-gray-400 py-2 text-center text-blue-600 mt-4 rounded hover:bg-blue-50 text-sm"
            >
              + Add new line
            </button>
          </div>

          {/* Quick link to preview an existing quotation (matches design) */}
          <div className="mt-4 mr-auto w-full lg:w-1/2">
            <button
              type="button"
              className={`text-blue-600 hover:underline bg-transparent p-0 ${
                !selectedRfpId
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              onClick={() => selectedRfpId && setPreviewRfpId(selectedRfpId)}
              disabled={!selectedRfpId}
              aria-disabled={!selectedRfpId}
            >
              {selectedRfpId ? `View ${selectedRfpId}` : "Select RFP to view"}
            </button>
            {/*
              Note: Previously this link used `quotationNo` which is the generated quotation number
              (e.g., QTN2025...). That caused the preview to pass a quotation id to the API.
              We now use `selectedRfpId` so the preview receives the RFP ID as intended.
            */}
          </div>

          {/* Summary Section - replaced with requested Tailwind layout */}
          <div className="border-t mt-8 pt-4 max-w-md ml-auto text-right space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span>₹{calculateTotalTaxable(items).toLocaleString()}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Taxable amount</span>
              <span>
                ₹{(totalAmount - calculateTotalTaxable(items)).toLocaleString()}
              </span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between font-semibold text-lg">
              <span>Total (INR)</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowConfirmation(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Save & Preview
            </button>
          </div>
          {filePreview && (
            <div className="inset-0 absolute bg-white border p-4 z-50 bg-black/50 w-screen h-screen">
              <div className="w-full h-full bg-white p-4 rounded shadow-lg">
                <div
                  className="text-white text-2xl text-right cursor-pointer"
                  onClick={() => setFilePreview(null)}
                >
                  X
                </div>
                <iframe
                  src={filePreview}
                  title="uploaded file"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          )}
          {previewRfpId && (
            <QuotationPreviewPopup
              rfpId={previewRfpId}
              onClose={() => setPreviewRfpId(null)}
            />
          )}

          {/* Share Quotation Popup */}
          <ShareQuotationPopup
            isOpen={showSharePopup}
            onClose={() => setShowSharePopup(false)}
            quotationData={quotationToShare}
            onShare={handleShareQuotation}
          />

          {/* Confirmation Modal */}
          <CenteredModal
            isOpen={showConfirmation}
            onClose={() => setShowConfirmation(false)}
            type="confirm"
            title="Update?"
            message="Are you sure you want to Update Request Raise for Asset?"
            onConfirm={async () => {
              try {
                const success = await handleSaveAndPreview();
                setShowConfirmation(false);
                if (success) {
                  setShowSuccessModal(true);
                }
              } catch (error) {
                setShowConfirmation(false);
                console.error('Error saving quotation:', error);
              }
            }}
          />

          {/* Success Modal */}
          <CenteredModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            type="success"
            title="Success"
            message="Request Raise for Asset Update & sent successfully"
            onContinue={() => {
              // Close success modal and clear form state
              setShowSuccessModal(false);
              try {
                resetForm();
              } catch (err) {
                console.error('Error resetting form after success:', err);
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
