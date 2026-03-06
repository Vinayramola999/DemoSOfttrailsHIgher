import { useState, useEffect, useRef } from "react";
import axios from "axios";
import API from "../config/api";
import { FaTrash } from "react-icons/fa";
import { FaUpload } from "react-icons/fa"; // Font Awesome Upload Icon
import Select from "react-select";
import PopupModal from "./PopupModal";
import DownloadTableButtons from "./components/Downloadpdfexcel";
import { FaFilePdf, FaRegFileAlt } from "react-icons/fa"; // <-- added FaRegFileAlt
import { generateRfpPdf } from "./components/RfpTemplate";

const InventryIndenting = () => {
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [productItems, setProductItems] = useState([]);
  const [assetDetails, setAssetDetails] = useState([]);

  const handleItemSelect = (idx) => {
    setSelectedItems((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  };

  const handleSelectAllItems = (e) => {
    if (e.target.checked) {
      setSelectedItems(productItems.map((_, idx) => idx));
    } else {
      setSelectedItems([]);
    }
  };
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [asset, setAsset] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRequestMaterialOpen, setIsRequestMaterialOpen] = useState(false);
  const [currentIndentId, setCurrentIndentId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const createdBy = sessionStorage.getItem("userId");
  const [showRFP, setShowRFP] = useState(false);
  const [rfpId, setRfpId] = useState(null);
  const [requestfor, setRequestfor] = useState("");
  const fileInputRef = useRef();
  const [selectedFileName, setSelectedFileName] = useState("");
  const userId = sessionStorage.getItem("userId");
  const [selectedLogoName, setSelectedLogoName] = useState("");
  const [selectedSpecFileName, setSelectedSpecFileName] = useState("");
  const [documentOptions, setDocumentOptions] = useState([]);
  const [budgetOptions, setBudgetOptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({});
  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "Indent ID", accessor: "id" },
    { header: "RFP ID", accessor: "rfp_id" },
    { header: "Approval Date", accessor: "approval_date" },
  ];
  const [formData, setFormData] = useState({
    title: "",
    issuedDate: new Date().toISOString().split("T")[0], // <-- auto fetch current date
    dueDate: "",
    description: "",
    file: null,
    document_name: "",
    logo: null,
    logoUrl: "",
    requiredDocument: "",
    organization: "",
  });
  const resetForm = () => {
    setFormData({
      organization: "",
      logo: "",
      logoUrl: "",
      file: null,
      title: "",
      issuedDate: new Date().toISOString().split("T")[0], // <-- auto fetch current date
      dueDate: "",
      description: "",
      requiredDocument: "",
    });
    setSelectedLogoName(""); // if you're tracking selected file name
    setSelectedSpecFileName(""); // ✅ reset specification file name
    setProductItems([]); // Clear product items
    setSelectedItems([]); // Clear selected items
    setCurrentIndentId(null); // Clear current indent ID
  };

  const handleIconClick = () => {
    fileInputRef.current.click(); // triggers hidden input
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file, // file is the correct key in your state
        document_name: "", // clear previously uploaded name if any
      }));
      setSelectedSpecFileName(file.name); // use separate state
    }
  };

  useEffect(() => {
    if (showRFP) {
      setSelectedFileName("No file chosen");
      setFormData((prev) => ({ ...prev, logo: null }));
    }
  }, [showRFP]);

const fetchRequests = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [indentingRes, salesIndentingRes] = await Promise.all([
        axios.get(`${API.PURCHASE_API}/indenting`, { headers }),
        axios.get(`${API.PURCHASE_API}/sales/salesIndenting`, { headers }),
      ]);

      // Check if data exists and is an array
      const indentingData = Array.isArray(indentingRes.data)
        ? indentingRes.data
        : [];

      const salesIndentingData = Array.isArray(salesIndentingRes.data)
        ? salesIndentingRes.data
        : [];

      salesIndentingData.forEach((item) => {
        item.id = item.indent_id; // 🔹 normalize field
      });

      // Sort by created_at in descending order (newest first), falling back to updated_at if created_at is not available
      const combinedData = [...indentingData, ...salesIndentingData].sort(
        (a, b) => {
          const dateA = new Date(a.created_at || a.updated_at);
          const dateB = new Date(b.created_at || b.updated_at);
          return dateB - dateA; // descending order (newest first)
        }
      );

      setRequests(combinedData);
    } catch (error) {
      console.error("API fetch error:", error?.response || error);
      setModalProps({
        type: "error",
        title: "Error!",
        message:
          "Failed to fetch indenting or sales indenting data. " +
          (error?.response?.message || error.message || ""),
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);


  const handleRequestMaterialClick = (item) => {
    setSelectedRequest(item);
    setIsRequestMaterialOpen(true);
    setIsEditOpen(false);
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        logo: file,
        logoUrl: "", // reset uploaded link
      }));
      setSelectedLogoName(file.name);
    }
  };

  const handleGenerateRFPClick = async (item = null) => {
    const indentingId =
      item?.id ??
      item?.indent_id ??
      item?.indentId ??
      selectedRequest?.id ??
      selectedRequest?.indent_id ??
      selectedRequest?.indentId;

    // Store the current indent ID to be used in handleSave
    console.log("✅ handleGenerateRFPClick - Setting currentIndentId:", indentingId);
    setCurrentIndentId(indentingId);

    try {
      const sourceData = item || selectedRequest;
      let products = [];

      // Prepare product list
      if (
        Array.isArray(sourceData?.products) &&
        sourceData.products.length > 0
      ) {
        products = sourceData.products;
      } else if (sourceData) {
        products = [
          {
            product_name: sourceData.asset_name || "",
            asset_name: sourceData.asset_name || "",
            request_for: sourceData.request_for || "",
            category: sourceData.category || "",
            quantity: sourceData.quantity || "",
            uom: sourceData.uom || "",
            unit: sourceData.uom || "",
            workflow: sourceData.workflow_id || "",
            budget: sourceData.budget_id || sourceData.budget || "",
            description: sourceData.remarks || sourceData.description || "",
            id: sourceData.id || null,
          },
        ];
      }

      const mappedProducts = products.map((p) => ({
        product_name: p.product_name || p.asset_name || "",
        asset_name: p.asset_name || p.product_name || "",
        request_for: p.request_for || sourceData?.request_for || "",
        category: p.category || sourceData?.category || "",
        quantity: p.quantity || 0,
        uom: p.uom || p.unit || "",
        unit: p.uom || p.unit || "",
        workflow: p.workflow || sourceData?.workflow_id || "",
        budget: p.budget || p.budget_id || sourceData?.budget_id || "",
        description:
          p.description || p.remarks || p.note || sourceData?.remarks || "",
        id: p.id || null,
      }));

      setProductItems(mappedProducts);
      setSelectedItems([]);

      // ✅ Unified RFP API (works for both normal & sales indent)
      const response = await axios.put(
        `${API.PURCHASE_API}/indenting/${indentingId}/rfp`,
        { indenting_id: indentingId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.RFP_ID) {
        console.log("🔑 RFP_ID received:", response.data.RFP_ID);
        setRfpId(response.data.RFP_ID);
      } else {
        console.log("⚠️ No RFP_ID in response");
        setRfpId(null);
      }

      // Fetch indent details
      try {
        const indentResponse = await axios.get(
          `${API.PURCHASE_API}/indenting/${indentingId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (indentResponse.data) {
          if (
            Array.isArray(indentResponse.data.products) &&
            indentResponse.data.products.length > 0
          ) {
            const items = indentResponse.data.products.map((p) => ({
              product_name: p.product_name || p.asset_name || "",
              asset_name: p.asset_name || p.product_name || "",
              request_for:
                p.request_for || indentResponse.data.request_for || "",
              category: p.category || indentResponse.data.category || "",
              quantity: p.quantity || 0,
              uom: p.uom || p.unit || "",
              unit: p.uom || p.unit || "",
              workflow: p.workflow || indentResponse.data.workflow_id || "",
              budget:
                p.budget || p.budget_id || indentResponse.data.budget_id || "",
              description:
                p.description || p.remarks || indentResponse.data.remarks || "",
              id: p.id || null,
            }));
            setProductItems(items);
          } else {
            const items = [
              {
                product_name:
                  indentResponse.data.product_name ||
                  indentResponse.data.asset_name ||
                  "",
                asset_name: indentResponse.data.asset_name || "",
                request_for: indentResponse.data.request_for || "",
                category: indentResponse.data.category || "",
                quantity: indentResponse.data.quantity || 0,
                uom: indentResponse.data.uom || indentResponse.data.unit || "",
                unit: indentResponse.data.uom || indentResponse.data.unit || "",
                workflow: indentResponse.data.workflow_id || "",
                budget:
                  indentResponse.data.budget ||
                  indentResponse.data.budget_id ||
                  "",
                description:
                  indentResponse.data.description ||
                  indentResponse.data.remarks ||
                  "",
                id: indentResponse.data.id || null,
              },
            ];
            setProductItems(items);
          }
        } else {
          setProductItems([]);
        }
      } catch (error) {
      }

      setShowRFP(true);
      fetchDetails();
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      const apiData = error.response?.data?.data;

      if (apiMessage === "RFP ID already generated" && apiData) {
        setRfpId(apiData);
        setShowRFP(true);

        try {
          const indentResponse = await axios.get(
            `${API.PURCHASE_API}/indenting/${indentingId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (indentResponse.data) {
            const items =
              Array.isArray(indentResponse.data.products) &&
              indentResponse.data.products.length > 0
                ? indentResponse.data.products.map((p) => ({
                    product_name: p.product_name || p.asset_name || "",
                    asset_name: p.asset_name || p.product_name || "",
                    request_for:
                      p.request_for || indentResponse.data.request_for || "",
                    category: p.category || indentResponse.data.category || "",
                    quantity: p.quantity || 0,
                    uom: p.uom || p.unit || "",
                    unit: p.uom || p.unit || "",
                    workflow:
                      p.workflow || indentResponse.data.workflow_id || "",
                    budget:
                      p.budget ||
                      p.budget_id ||
                      indentResponse.data.budget_id ||
                      "",
                    description:
                      p.description ||
                      p.remarks ||
                      indentResponse.data.remarks ||
                      "",
                    id: p.id || null,
                  }))
                : [
                    {
                      product_name:
                        indentResponse.data.product_name ||
                        indentResponse.data.asset_name ||
                        "",
                      asset_name: indentResponse.data.asset_name || "",
                      request_for: indentResponse.data.request_for || "",
                      category: indentResponse.data.category || "",
                      quantity: indentResponse.data.quantity || 0,
                      uom:
                        indentResponse.data.uom ||
                        indentResponse.data.unit ||
                        "",
                      unit:
                        indentResponse.data.uom ||
                        indentResponse.data.unit ||
                        "",
                      workflow: indentResponse.data.workflow_id || "",
                      budget:
                        indentResponse.data.budget ||
                        indentResponse.data.budget_id ||
                        "",
                      description:
                        indentResponse.data.description ||
                        indentResponse.data.remarks ||
                        "",
                      id: indentResponse.data.id || null,
                    },
                  ];

            setProductItems(items);
          }
        } catch (innerErr) {
          console.error("Failed to fetch indent after RFP exists:", innerErr);
        }

        fetchDetails();
        return;
      }

      setModalProps({
        type: "error",
        title: "Error!",
        message:
          apiMessage ||
          error.response?.data?.error ||
          error.message ||
          "Failed to generate RFP. Please try again.",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
      setShowRFP(true);
      fetchDetails();

      if (error.response?.data?.RFP_ID) {
        setRfpId(error.response.data.RFP_ID);
      } else if (item?.rfp_id) {
        setRfpId(item.rfp_id);
      } else if (selectedRequest?.rfp_id) {
        setRfpId(selectedRequest.rfp_id);
      }
    }
  };

  const filteredRequests = requests.filter((item) => {
    let matches = true;

    if (item.status !== "Approved") {
      matches = false;
    }

    if (search) {
      // normalize search term and include numeric id/user searches
      const searchTerm = search.toString().trim().toLowerCase();
      const inAssetName = item.asset_name
        ?.toString()
        .toLowerCase()
        .includes(searchTerm);
      const inCategory = item.category
        ?.toString()
        .toLowerCase()
        .includes(searchTerm);
      const inRequestFor = item.request_for
        ?.toString()
        .toLowerCase()
        .includes(searchTerm);
      const inIndentId =
        item.indent_id?.toString().toLowerCase().includes(searchTerm) ||
        item.id?.toString().toLowerCase().includes(searchTerm);
      const inUserId = item.user_id
        ?.toString()
        .toLowerCase()
        .includes(searchTerm);
      if (
        !(inAssetName || inCategory || inRequestFor || inIndentId || inUserId)
      ) {
        matches = false;
      }
    }

    if (requestfor && item.request_for !== requestfor) {
      matches = false;
    }

    if (asset && item.category !== asset) {
      matches = false;
    }

    if (department && item.dept_id !== parseInt(department)) {
      matches = false;
    }

    if (status && item.status !== status) {
      matches = false;
    }

    return matches;
  });

  const handleAssetChange = (e) => {
    setAsset(e.target.value);
    setStatus("");
  };

  const handlerequestforChange = (e) => {
    setRequestfor(e.target.value);
    setAsset(""); // Reset category selection
  };

  const handlePreviewRFP = async (item) => {
    // Normalize rfp id from different possible fields
    const rfpId = item?.rfp_id ?? item?.rfpId ?? item?.RFP_ID ?? item?.rfp;

    if (!rfpId) {
      setModalProps({
        type: "error",
        title: "Error!",
        message: "RFP ID is missing for this record!",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
      return;
    }

    try {
      console.log("🔍 Requesting RFP preview for:", rfpId);
      const response = await axios.get(
        `${API.PURCHASE_API}/rfps/preview_rfp/${rfpId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'arraybuffer' // ✅ Get binary data as arraybuffer
        }
      );

      console.log("📦 Response received:", {
        dataLength: response.data.byteLength,
        contentType: response.headers['content-type'],
        status: response.status
      });

      // ✅ Create proper PDF blob
      if (response.data && response.data.byteLength > 0) {
        // Always treat as PDF
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const pdfUrl = window.URL.createObjectURL(pdfBlob);
        
        console.log("✅ PDF Blob created, opening in new tab:", pdfUrl);
        
        // Open PDF in new tab
        const newWindow = window.open(pdfUrl, "_blank");
        
        if (!newWindow) {
          throw new Error("Failed to open new tab. Check if pop-ups are allowed.");
        }
        
        // Add filename to the window for reference
        if (newWindow) {
          newWindow.document.title = `RFP-${rfpId}.pdf`;
        }
      } else {
        throw new Error("No file data received from server");
      }
    } catch (error) {
      console.error("Preview RFP Error:", error);

      setModalProps({
        type: "error",
        title: "Error!",
        message:
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to preview RFP",
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
    }
  };

  const getDmsPublishId = async (service_name, doctype, doc_name) => {
    try {
      console.log("Fetching publish_id for:", {
        service_name,
        doctype,
        doc_name,
      });
      const res = await axios.get(
        API.DMS_MAPPING_CHECK ||
          "https://devapi.softtrails.net/saas/mapping/check",
        {
          params: { service_name, doctype, doc_name },
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.data.dms_publish_id) throw new Error("No publish_id returned");
      return res.data.dms_publish_id;
    } catch (err) {
      const msg = err.response?.data?.error || "Unknown error";
      throw new Error(msg);
    }
  };

 const handleSave = async () => {
    try {
      setLoading(true); // Start loader
      const userId = sessionStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found in session storage");

      // Validate required form fields: End Date is required in the UI.
      if (!formData.dueDate) {
        setModalProps({
          type: "warning",
          title: "Missing End Date",
          message: "Please fill the End Date before generating the RFP.",
          onClose: () => setShowModal(false),
        });
        setShowModal(true);
        setLoading(false); // Stop loader
        return; // stop further processing until End Date is provided
      }

    
      const uploadToDMS = async (file, docType, folderName, docName) => {
        console.log(`📤 Uploading to DMS:`, { docType, fileName: file.name, docName });
        const publish_id = await getDmsPublishId(
          "purchase",
          docType,
          docName || docType
        );

        const formData = new FormData();
        formData.append("documents", file);
        formData.append("ref", "RFP");
        formData.append(
          "metadata",
          JSON.stringify([
            {
              service: "purchase",
              publish_id,
              user_id: userId,
              document_name: file.name,
            },
          ])
        );
        formData.append("custom_folder", folderName);

        const uploadRes = await axios.post(
          API.DMS_UPLOAD ||
            "https://devapi.softtrails.net/saas/dmsapi/upload-documents",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fileUrl = uploadRes.data?.uploaded_files?.[0]?.file_url;
        if (!fileUrl) throw new Error(`${docType} upload failed`);
        return fileUrl;
      };

      // === 1. Upload logo if a file ===
      let logoUrl = formData.logoUrl;
      let logoBase64 = ""; // NEW: Will store Base64 version for PDF embedding
      if (formData.logo instanceof File) {
        // Convert logo to Base64 for use in PDF (NO CORS issues!)
        const reader = new FileReader();
        logoBase64 = await new Promise((resolve, reject) => {
          reader.onload = () => {
            console.log("📸 Logo converted to Base64");
            resolve(reader.result); // This is the Base64 string with data URL prefix
          };
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(formData.logo);
        });
        
        // Also upload ORGANIZATION_LOGO to DMS for backup
        logoUrl = await uploadToDMS(
          formData.logo,
          "ORGANIZATION_LOGO",
          "purchase"
        );
      }

      // === 2. Upload user-selected specification file (if any) as RFP_SPECIFICATION ===
      let specFileUrl = "";
      if (formData.file instanceof File) {
        specFileUrl = await uploadToDMS(
          formData.file,
          "RFP_SPECIFICATION",
          "purchase"
        );
      }

      // === 3. Generate RFP PDF using generateRfpPdf (which already returns a File object) ===
      // Use currentIndentId which was set in handleGenerateRFPClick
      const indentId = currentIndentId || selectedRequest?.id || selectedRequest?.indent_id || selectedRequest?.indentId;
      console.log("📋 handleSave - Generating PDF with:", { 
        currentIndentId, 
        indentId, 
        rfpId,
        rfpIdState: rfpId,
        hasLogoBase64: !!logoBase64  // NEW: Show Base64 is available
      });
      const pdfFile = await generateRfpPdf({
        ...formData,
        rfpId,
        logoUrl, // Pass the resolved logoUrl (either uploaded or from formData)
        logoBase64, // NEW: Pass Base64 version (fastest - no CORS!)
        productItems,
        assetDetails,
        indentId: indentId,
        indent_id: indentId,
        id: indentId,
      });

      const generatedRfpUrl = await uploadToDMS(
        pdfFile,
        "RFP",
        "purchase",
        "Generated RFP"
      );

      let additionalDocUrl = "";
      if (formData.additionalDoc instanceof File) {
        additionalDocUrl = await uploadToDMS(
          formData.additionalDoc,
          "ADDITIONAL_DOC",
          "purchase"
        );
      }

      // Build required_doc as comma-separated string of selected documents
      const requiredDocObj = Array.isArray(formData.requiredDocument) 
        ? formData.requiredDocument.join(", ") 
        : "";

      const rfpPayload = {
        rfp_id: rfpId || undefined,
        user_id: Number(userId),
        Organization_Name: formData.organization || "",
        Logo: logoUrl || "",
        Title: formData.title || "",
        Start_Date: formData.issuedDate || "",
        End_Date: formData.dueDate || "",
        Upload_file: specFileUrl || "",
        additional_description: {
          description: formData.description || "",
          notes: formData.notes || "",
        },
        required_doc_count: Array.isArray(formData.requiredDocument)
          ? formData.requiredDocument.length
          : 0,
        required_doc: requiredDocObj,
        rfp_file_link: generatedRfpUrl || "",
      };


      // === 6. Call create_rfp API ===
      const rfpResponse = await axios.post(
        `${API.PURCHASE_API}/rfps/create_rfp`,
        rfpPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setModalProps({
        type: "success",
        title: "Success!",
        message: "RFP created successfully!",
        onClose: () => {
          setShowModal(false);
          setShowRFP(false); // Close the RFP modal
          fetchRequests(); // Refresh the table
        },
      });
      setShowModal(true);
      setLoading(false); // Stop loader
    } catch (error) {
      const apiMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create RFP";
      setModalProps({
        type: "error",
        message: apiMsg,
        onClose: () => setShowModal(false),
      });
      setShowModal(true);
      setLoading(false); // Stop loader
    }
  };
  const fetchDetails = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API.PURCHASE_API}/rfps/organization_rfp_details?user_id=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const orgData = response.data?.data || [];

      const orgNames = orgData.map((item) => item.organization_name).join(", ");

      setFormData((prev) => ({
        ...prev,
        organization: orgNames,
        logo: orgData[0]?.logo_file_link || "",
        logoUrl: orgData[0]?.logo_file_link || "",
      }));
    } catch (error) {
      console.error("Failed to fetch organization data:", error);
    } finally {
      setLoading(false); // stop loader
    }
  };

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      if (requestfor) {
        try {
          const response = await axios.get(
            `${API.PURCHASE_API}/assets?request_for=${requestfor}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const categories = Array.isArray(response.data)
            ? response.data.map((item) => item.category)
            : [];
          setCategoryOptions([...new Set(categories)].sort());
        } catch (error) {
          console.error("Error fetching category options:", error);
          setCategoryOptions([]);
        }
      } else {
        setCategoryOptions([]);
      }
    };

    fetchCategoryOptions();
  }, [requestfor, token]);
  const requestForOptions = [
    { value: "Movable", label: "Movable" },
    { value: "Raw Materials", label: "Raw Materials" },
  ];

  const categorySelectOptions = categoryOptions.map((cat) => ({
    value: cat,
    label: cat,
  }));

  useEffect(() => {
    // Only fetch when popup opens
    if (!showRFP) return;

    const fetchDocumentOptions = async () => {
      try {
        // 1. Get service_id for "purchase"
        const serviceRes = await axios.get(`${API.API_BASE}/service`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const purchaseService = serviceRes.data.find(
          (s) => s.name?.toLowerCase() === "purchase"
        );
        if (!purchaseService) throw new Error("Purchase service not found");
        const service_id = purchaseService.id;

        // 2. Get doctype_id for "POI" (or any doctype you want)
        const doctypeRes = await axios.get(`${API.API_BASE}/doctype`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const doctype = doctypeRes.data.find(
          (d) => d.doctype?.toLowerCase() === "required documents"
        );
        if (!doctype) throw new Error("Doctype not found");
        const doctype_id = doctype.id;

        // 3. Fetch document options using service_id and doctype_id
        const docRes = await axios.get(
          `${API.API_BASE}/dmsapi/upload?service_id=${service_id}&doctype_id=${doctype_id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDocumentOptions(
          (docRes.data || []).map((doc) => ({
            value: doc.doc_name,
            label:
              doc.doc_name + (doc.description ? ` - ${doc.description}` : ""),
          }))
        );
      } catch (err) {
        console.error("Failed to fetch document types", err);
        setDocumentOptions([]);
      }
    };

    fetchDocumentOptions();
  }, [showRFP, token]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Change as needed

  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

  // Slice requests for the current page
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, asset, requestfor, department, status, requests]);

  const exportData = filteredRequests.map((item, idx) => ({
    sno: idx + 1,
    id: item.indent_id || item.id,
    rfp_id: item.rfp_id || "-",
    approval_date: item.updated_at
      ? new Date(item.updated_at).toLocaleDateString("en-GB")
      : "-",
  }));

  useEffect(() => {
    const loadBudgets = async () => {
      try {
        const res = await axios.get(`${API.PURCHASE_API}/budget/get-budget`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const mapped = data.map((item, idx) => ({
          id:
            item.id ??
            item.budget_id ??
            (item.budget_name ? idx + 1 : idx + 1), // fallback id
          budget_name:
            item.budget_name || item.name || item.budget || String(item.id || item.budget_id || idx + 1),
        }));
        setBudgetOptions(mapped);
      } catch (err) {
        console.error("Error fetching budgets (get-budget):", err);
        setBudgetOptions([]);
      }
    };

    loadBudgets();
  }, [token]);

    const getBudgetDisplayName = (budgetVal) => {
    if (budgetVal === null || budgetVal === undefined) return "";
    const found = budgetOptions.find(
      (b) =>
        String(b.id) === String(budgetVal) ||
        String(b.budget_name) === String(budgetVal)
    );
    return found ? found.budget_name : String(budgetVal);
  };
  return (
    <div className="p-2">
      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-xl"
        />

        <div style={{ minWidth: 180 }}>
          <Select
            options={requestForOptions}
            value={
              requestForOptions.find((opt) => opt.value === requestfor) || null
            }
            onChange={(opt) =>
              handlerequestforChange({ target: { value: opt?.value || "" } })
            }
            placeholder="Request for"
            isClearable
          />
        </div>
        <div style={{ minWidth: 180 }}>
          <Select
            options={categorySelectOptions}
            value={
              categorySelectOptions.find((opt) => opt.value === asset) || null
            }
            onChange={(opt) =>
              handleAssetChange({ target: { value: opt?.value || "" } })
            }
            placeholder="All Category"
            isClearable
          />
        </div>
        <div className="flex-1 flex justify-end">
          <DownloadTableButtons
            data={exportData}
            columns={columns}
            fileName="Inventry"
          />
        </div>
      </div>
      <div
        className="overflow-x-auto rounded-lg shadow bg-white p-4"
        style={{ maxHeight: 600, overflowY: "auto", minWidth: 900 }}
      >
        <table className="w-full bg-white rounded-lg border-collapse">
          <thead className="border-b-2 border-black">
            {" "}
            <tr>
              <th className="p-2 text-center">S. No.</th>
              <th className="p-2 text-center">Indent ID</th>
              <th className="p-2 text-center">RFP ID</th>
              <th className="p-2 text-center">Approval Date</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.map((item, index) => (
              <tr key={item.id} className="odd:bg-blue-50">
                <td className="p-2 text-center">
                  {index + 1 + (currentPage - 1) * rowsPerPage}
                </td>
                <td
                  className="p-2 text-center cursor-pointer text-blue-600"
                  onClick={() => handleRequestMaterialClick(item)}
                >
                  {item.indent_id}
                </td>

                <td className="p-2 text-center">{item.rfp_id || ""}</td>
                <td className="p-2 text-center">
                  {new Date(item.updated_at).toLocaleDateString("en-GB")}
                </td>

                <td className="p-2 flex items-center justify-center gap-2">
                  {/* Preview PDF (only when rfp_id exists) */}
                  {item?.rfp_id ?? item?.rfpId ?? item?.RFP_ID ?? item?.rfp ? (
                    <div
                      className="text-custome-blue cursor-pointer"
                      title="Preview RFP"
                      onClick={() => handlePreviewRFP(item)}
                    >
                      <FaFilePdf color="red" size={18} />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm">&nbsp;</div>
                  )}

                  {/* Generate / Regenerate RFP (visible for every row) */}
                  <div
                    className="bg-blue-600 text-white p-1 rounded cursor-pointer hover:bg-blue-700"
                    title={item.rfp_id ? "Regenerate RFP" : "Generate RFP"}
                    onClick={() => handleGenerateRFPClick(item)}
                  >
                    <FaRegFileAlt size={14} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center gap-2 mt-4 justify-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-white border-gray-300  border rounded disabled:opacity-50"
        >
          &lt;
        </button>

        <button className="px-4 py-2 bg-custome-blue border-custome-blue  text-white rounded">
          {currentPage}
        </button>

        <span className="px-2">of</span>

        <button className="px-4 py-2 border rounded text-custome-blue">
          {totalPages}
        </button>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-white border-gray-300 border rounded disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
      {/* Request Material Popup */}
      {isRequestMaterialOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] md:w-[50%] max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">Raise request details</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Indent Id: {selectedRequest.indent_id || "N/A"}
                </p>
              </div>
              <button onClick={() => setIsRequestMaterialOpen(false)}>
                <span className="text-red-500 text-2xl">✖</span>
              </button>
            </div>

            <div className="overflow-x-auto border rounded-lg mt-4">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Sr.No.</th>
                    <th className="p-3 text-left">Request for</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Material</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left">Uom</th>
                    <th className="p-3 text-left">Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(selectedRequest.products) &&
                  selectedRequest.products.length > 0
                    ? selectedRequest.products
                    : [
                        {
                          request_for:
                            selectedRequest.request_for || "Item Name",
                          category: selectedRequest.category || "Category Name",
                          asset_name:
                            selectedRequest.asset_name || "Asset Name",
                          quantity: selectedRequest.quantity || "08",
                          uom: selectedRequest.uom || "-",
                          // workflow: selectedRequest.workflow || "Workflow name",
                          budget: selectedRequest.budget || "NA",
                          description: "Description Example xyz",
                        },
                      ]
                  ).map((item, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-3 align-top">{index + 1}</td>
                      <td className="p-3 align-top">
                        <div className="font-medium">{item.request_for}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="p-3 align-top">{item.category}</td>
                      <td className="p-3 align-top">{item.asset_name}</td>
                      <td className="p-3 align-top">{item.quantity}</td>
                      <td className="p-3 align-top">{item.uom}</td>

                       <td className="p-3 align-top">
                     {getBudgetDisplayName(item.budget ?? item.budget_id ?? selectedRequest.budget)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedRequest.remarks && (
              <div className="mt-4">
                <p className="font-semibold mb-1">Description:</p>
                <div className="p-3 border rounded-lg bg-white text-sm text-justify">
                  {selectedRequest.remarks}
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-start gap-4">
              <button
                onClick={handleGenerateRFPClick}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Generate RFP
              </button>

              <button
                onClick={() => setIsRequestMaterialOpen(false)}
                className="border border-gray-400 px-4 py-2 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showRFP && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-5 w-[95%] max-w-3xl max-h-[80vh] overflow-y-auto">
            {/* Loader Overlay */}
            {loading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60]">
                <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-700 font-semibold">Creating RFP...</p>
                </div>
              </div>
            )}
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="font-semibold text-xl">Request for proposal</h2>
                <p className="text-sm text-gray-600">
                  {rfpId ? rfpId : "Loading RFP ID..."}
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setShowRFP(false);
                }}
                className="text-red-600 text-2xl"
              >
                ✖
              </button>
            </div>
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              {loading ? (
                <div className="col-span-full text-center py-4 text-blue-600 font-semibold">
                  Loading organization details...
                </div>
              ) : (
                <>
                  {/* Info message for prefilled data */}
                  {(formData.organization || formData.logoUrl) && (
                    <div className="col-span-full bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-sm rounded">
                      This logo and organization name are fetched from
                      previously saved data.You can update the existing info or
                      upload a new one below.
                    </div>
                  )}

                  {/* Organization Input */}
                  <div className="col-span-full md:col-span-2">
                    <label className="block font-medium">
                      Your organization description{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Organization name, Address, PinCode"
                      value={formData.organization}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          organization: e.target.value,
                        })
                      }
                      className="border border-gray-300 rounded px-3 py-2 w-full"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block font-medium ">
                      Your Image/logo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      className="hidden border border-gray-300 rounded px-3 py-2 w-full"
                    />
                    <div className="flex items-center justify-between border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-700 bg-white">
                      <span
                        className={`truncate w-full ${
                          formData.logoUrl
                            ? "text-blue-600 cursor-pointer underline"
                            : ""
                        }`}
                        onClick={() => {
                          if (formData.logoUrl)
                            window.open(formData.logoUrl, "_blank");
                        }}
                        title={formData.logoUrl ? "Click to view logo" : ""}
                      >
                        {formData.logoUrl || selectedLogoName || "Upload logo"}
                      </span>
                      <FaUpload
                        className="text-gray-400 ml-2 flex-shrink-0 cursor-pointer"
                        onClick={handleIconClick}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <hr className="border-t border-gray-300 my-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block font-medium">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
              <div>
                <label className="block font-medium">Start Date</label>
                <input
                  type="text"
                  value={formData.issuedDate}
                  disabled
                  className="border border-gray-300 rounded px-3 py-2 w-full bg-gray-100"
                />
              </div>
              <div>
                <label className="block font-medium">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="border border-gray-300 rounded px-3 py-2 w-full"
                />
              </div>
            </div>
            {/* Material/Asset Details Table */}
            <div className="col-span-full mb-4">
              <h3 className="font-medium mb-2">Material / Asset Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse bg-white shadow-sm rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left border-b"></th>
                      <th className="p-3 text-left border-b">Request for</th>
                      <th className="p-3 text-left border-b">Category</th>
                      <th className="p-3 text-left border-b">Asset Name</th>
                      <th className="p-3 text-left border-b">Quantity</th>
                      <th className="p-3 text-left border-b">UOM</th>
                      {/* <th className="p-3 text-left border-b">Workflow</th> */}
                      <th className="p-3 text-left border-b">Budget</th>
                      <th className="p-3 text-left border-b">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-3 border-b">
                          <input
                            type="checkbox"
                            checked={selectedItems?.includes(idx)}
                            onChange={() => handleItemSelect(idx)}
                          />
                        </td>
                        <td className="p-3 border-b">
                          <div className="font-medium">
                            {item.request_for || "-"}
                          </div>
                        </td>
                        <td className="p-3 border-b">{item.category || "-"}</td>
                        <td className="p-3 border-b">
                          {item.asset_name || item.product_name || "-"}
                        </td>
                        <td className="p-3 border-b">{item.quantity ?? "-"}</td>
                        <td className="p-3 border-b">
                          {item.uom || item.unit || "-"}
                        </td>
                        {/* <td className="p-3 border-b">{item.workflow || "-"}</td> */}
                         <td className="p-3 align-top">
                      {getBudgetDisplayName(item.budget ?? item.budget_id ?? selectedRequest.budget)}
                      </td>
                        <td className="p-3 border-b">
                          {item.description || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* File Upload */}
            <div className="mb-4 border-2 border-dashed border-gray-400 p-4 text-center rounded">
              <p className="mb-1 text-gray-600">
                Choose a specification file or drag & drop it here.
              </p>
              <p className="mb-1 text-sm text-gray-500">
                PDF format, up to 10 MB.
              </p>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="fileUpload"
              />

              <label
                htmlFor="fileUpload"
                className="text-blue-600 cursor-pointer underline"
              >
                Browse File
              </label>

              {selectedSpecFileName && (
                <p className="mt-1 text-sm text-green-600 font-medium">
                  Selected File: {selectedSpecFileName}
                </p>
              )}
            </div>
              <div className="mb-3">
              <label className="block font-medium mb-1">
                Required Documents
              </label>
              <Select
                options={documentOptions}
                value={documentOptions.filter((opt) =>
                  Array.isArray(formData.requiredDocument)
                    ? formData.requiredDocument.includes(opt.value)
                    : false
                )}
                onChange={(opts) =>
                  setFormData({
                    ...formData,
                    requiredDocument: opts ? opts.map((opt) => opt.value) : [],
                  })
                }
                placeholder="Select or type document"
                isClearable
                isSearchable
                isMulti
                className="w-full"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: "35px",
                    height: "35px",
                  }),
                  valueContainer: (base) => ({
                    ...base,
                    height: "35px",
                    padding: "0 8px",
                  }),
                  input: (base) => ({
                    ...base,
                    margin: "0px",
                  }),
                }}
              />
            </div>
            {/* Description */}
            <div className="mb-3">
              <label className="block font-medium mb-1">
                Additional Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={2}
                className="border border-gray-300 rounded px-3 py-2 w-full"
              />
            </div>
          
            {/* Action Buttons */}
            <div className="flex justify-start gap-4">
              <button
                onClick={async () => {
                  if (selectedItems.length === 0) {
                    setModalProps({
                      type: "warning",
                      title: "Warning",
                      message: "Please select at least one item",
                      onClose: () => setShowModal(false),
                    });
                    setShowModal(true);
                    return;
                  }

                  try {
                    await handleSave();
                    // await handleGenerate();
                  } catch (error) {
                    console.error("Error in generate:", error);
                    setModalProps({
                      type: "error",
                      title: "Error",
                      message: error.message || "Failed to generate RFP",
                      onClose: () => setShowModal(false),
                    });
                    setShowModal(true);
                  }
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded"
              >
                GENERATE
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowRFP(false);
                  fetchRequests(); // <-- Refresh table when popup is closed
                }}
                className="border border-gray-500 text-gray-700 px-6 py-2 rounded"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && <PopupModal {...modalProps} />}
    </div>
  );
};

export default InventryIndenting;
