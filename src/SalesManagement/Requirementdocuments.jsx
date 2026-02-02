import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { showCustomAlert } from "./components/CustomAlert";
import { useLocation } from "react-router-dom";
import * as XLSX from "xlsx";

const baseUrl = process.env.REACT_APP_URL_sales || '';
const baseUrld = process.env.REACT_APP_URL_dms || '';
const baseUrlp = process.env.REACT_APP_URL_purchase || '';
const baseUrlw = process.env.REACT_APP_URL_workflow || '';

// const baseUrl = process.env.REACT_APP_URL || "${baseUrlp}";


export default function RequirementDocumentForm() {
  const [loading, setLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [formData, setFormData] = useState({
    customerId: "",
    customerUid: "",
    lead_id: "",
    customerName: "",
    QueryNo: "",
    documentName: "",
    // Separate descriptions: one for the overall document, one for each item
    documentDescription: "",
    itemDescription: "",
    assetname: "",
    file: null,
    tradingGoods: "",
    itemCategory: "",
    quantity: "",
    uom: "",
    category: "",
    request_for: "",
    budget: "",
    document_upload_link: "",
  });

  const location = useLocation();

  const verifiedLeadRaw = location.state?.leadId ?? null;

  const [leads, setLeads] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedLeadUid, setSelectedLeadUid] = useState(null);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomerUid, setSelectedCustomerUid] = useState("");
  const [selectedCustomerName, setSelectedCustomerName] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [selectedQueryId, setSelectedQueryId] = useState("");
  const [searchExisting, setSearchExisting] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedService, setSelectedService] = useState("Sales Management");
  const [services, setServices] = useState([]);
  const [map, setMap] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [workflowLoading, setWorkflowLoading] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch leads, budgets
  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const res = await axios.get(
          `${baseUrl}/salesmanagement/leads/get-verifyedlead`,
          {
            headers: { Authorization: token ? `Bearer ${token}` : undefined },
          }
        );
        if (res.data?.success) {
          setLeads(res.data.leads || []);
        } else {
          setLeads(res.data?.leads || []);
        }
      } catch (err) {
        console.error("Error fetching leads", err);
      }
    };

    const fetchBudgets = async () => {
      setLoading(true);
      try {
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");
        if (!userId) {
          console.warn("No userId found in sessionStorage");
          setBudgets([]);
          return;
        }
        if (!token) {
          console.warn("No token found in sessionStorage");
          setBudgets([]);
          return;
        }

        const res = await fetch(
          `${baseUrlp}/budget/department/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok)
          throw new Error(`Network response was not ok: ${res.status}`);

        const data = await res.json();
        console.log("Budget API Data:", data);

        // Use budget_name array from API response
        setBudgets(Array.isArray(data.budget_name) ? data.budget_name : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };


    fetchLeads();
    fetchBudgets();
  }, []);

  // When a document_upload_link exists (after upload), fetch available workflows
  // Fetch workflows helper (call after upload or when document_upload_link exists)
  const fetchWorkflows = useCallback(async () => {
    const token = sessionStorage.getItem("token");
    setWorkflowLoading(true);
    try {
      const res = await fetch(
        `${baseUrlw}uniworkflow/workflow/get-modules/module?module_name=Purchase Management&sub_module_name=Indenting`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error(`Failed to fetch workflows: ${res.status}`);
      const data = await res.json();
      const wf = data?.workflows || [];
      setWorkflows(wf);
    } catch (err) {
      console.error("Error fetching workflows:", err);
      setWorkflows([]);
    } finally {
      setWorkflowLoading(false);
    }
  }, []);



  // Also fetch workflows on component mount so selector works even without an uploaded document
  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  // Do NOT auto-select a workflow; user should choose explicitly.

  // Render a workflow selector only after workflows are fetched


  // Excel upload & parsing (component scope)
  async function handleExcelFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (!Array.isArray(rawJson) || rawJson.length === 0) {
        await showCustomAlert({ type: "info", title: "Info", message: "Excel file contains no data" });
        return;
      }

      const mapKeys = {
        item: ["item", "items", "asset", "asset name", "assetname", "item name"],
        category: ["category", "item category", "itemcategory"],
        quantity: ["quantity", "qty", "qnt"],
        uom: ["uom", "unit", "units", "unit of measurement", "unit(s)", "u.o.m", "measurement unit"],
        budget: ["budget", "budget name", "budget_id"],
        description: ["description", "desc", "remarks"],
      };

      const parsedItems = rawJson
        .map((row) => {
          const normalized = {};
          Object.keys(mapKeys).forEach((field) => {
            const candidates = mapKeys[field];
            let value = "";
            for (const rawKey of Object.keys(row)) {
              const k = String(rawKey).toLowerCase().trim();
              // match exact or substring for flexible header names
              if (
                candidates.some((c) =>
                  k === c || k.includes(c) || c.includes(k)
                )
              ) {
                value = row[rawKey];
                break;
              }
            }
            normalized[field] = value;
          });

          const qty = normalized.quantity;
          const quantity = qty === "" ? "" : Number(qty);

          let budgetVal = normalized.budget;
          if (budgets && budgets.length > 0 && typeof budgetVal === "string") {
            const match = budgets.find((b) => String(b.name).toLowerCase() === String(budgetVal).toLowerCase());
            if (match) budgetVal = match.id;
          }

          return {
            item: normalized.item || "",
            category: normalized.category || "",
            quantity: quantity || normalized.quantity || "",
            uom: normalized.uom || "",
            budget: budgetVal || "",
            description: normalized.description || "",
          };
        })
        .filter((r) => r.item || r.quantity || r.category);

      if (parsedItems.length === 0) {
        await showCustomAlert({ type: "info", title: "Info", message: "No valid rows found in Excel to import" });
      } else {
        setItems((prev) => [...prev, ...parsedItems]);
        await showCustomAlert({ type: "success", title: "Success", message: `Imported ${parsedItems.length} rows from Excel` });
      }
    } catch (err) {
      console.error("Excel parse error:", err);
      await showCustomAlert({ type: "info", title: "Error", message: "Failed to parse Excel file: " + err.message });
    } finally {
      if (e.target) e.target.value = "";
    }
  }

  //   useEffect(() => {
  //   console.log("Mapping data:", map);
  // }, [map]);

  // Fetch services + mapping for DMS
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const fetchServiceOptions = async () => {
      try {
        const response = await fetch(`${baseUrld}/service`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setServices(data || []);
        }
      } catch (error) {
        console.error("Error fetching service options:", error);
      }
    };

    const fetchMap = async () => {
      try {
        const response = await fetch(`${baseUrld}/mapping`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setMap(data || []);
        }
      } catch (error) {
        console.error("Error fetching map:", error);
      }

      // fetch workflows only when token available? We'll fetch later when document uploaded
    };

    if (token) {
      fetchServiceOptions();
      fetchMap();
    }
  }, []);

  // Sync lead selection
  // useEffect(() => {
  //   if (verifiedLeadRaw != null) {
  //     setSelectedLeadId(String(verifiedLeadRaw));
  //   }
  // }, [verifiedLeadRaw]);

  useEffect(() => {
    if (verifiedLeadRaw != null && leads.length > 0) {
      const selectedLead = leads.find(
        (lead) => String(lead.lead_id) === String(verifiedLeadRaw)
      );

      if (selectedLead) {
        setSelectedLeadId(String(selectedLead.lead_id));
        setSelectedLeadUid(selectedLead.lead_uid || null); // ✅ FIX
        // Set QueryNo in formData if available
        setFormData((prev) => ({
          ...prev,
          QueryNo: selectedLead.query_id || "",
        }));
      }
    }
  }, [verifiedLeadRaw, leads]);

  useEffect(() => {
    if (!selectedLeadId || leads.length === 0) return;
    const selectedLead = leads.find(
      (lead) => String(lead.lead_id) === String(selectedLeadId)
    );
    if (selectedLead) {
      const custUid = selectedLead.customer_uid ?? "";
      const custNumericId = selectedLead.customer_id ?? "";
      const custName = selectedLead.customer_name ?? selectedLead.name ?? "";

      setSelectedCustomerId(String(custNumericId));
      setSelectedCustomerUid(String(custUid));
      setSelectedCustomerName(custName);

      setFormData((prev) => ({
        ...prev,
        customerId: String(custNumericId),
        customerUid: String(custUid),
        customerName: custName,
      }));
    }
  }, [selectedLeadId, leads]);

  // Handlers
  // const handleLeadSelect = (e) => setSelectedLeadId(e.target.value);

  const handleLeadSelect = (e) => {
    const leadId = e.target.value;
    setSelectedLeadId(leadId);

    const selectedLead = leads.find((lead) => String(lead.lead_id) === leadId);
    setSelectedLeadUid(selectedLead ? selectedLead.lead_uid : null);
    // Set QueryNo in formData if available
    setFormData((prev) => ({
      ...prev,
      QueryNo: selectedLead?.query_id || "",
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!formData.assetname || !formData.quantity) {
      await showCustomAlert({ type: "info", title: "Validation", message: "Please provide item name and quantity." });
      return;
    }

    const newItem = {
      item: formData.assetname,
      category: formData.itemCategory,
      quantity: formData.quantity,
      uom: formData.uom,
      // per-item budget removed; use form-level budget or Excel-provided budget
      // use itemDescription for per-item descriptions
      description: formData.itemDescription,
    };

    setItems((prev) => [...prev, newItem]);
    setFormData((prev) => ({
      ...prev,
      tradingGoods: "",
      itemCategory: "",
      quantity: "",
      uom: "",
      assetname: "",
      // keep form-level budget intact
      itemDescription: "",
    }));
  };

  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  // File Change + Upload to DMS (fix publish_id selection)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // If an Excel file was chosen, parse and import rows into items
    const ext = file.name.split(".").pop().toLowerCase();
    if (ext === "xls" || ext === "xlsx") {
      // reuse the excel handler
      await handleExcelFileChange(e);
      return;
    }

    setUploadingFile(true);
    setFormData((prev) => ({ ...prev, file }));

    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("userId");

    // 1. Find the service object by name
    const service = services.find(
      (s) => s.name.toLowerCase() === selectedService.toLowerCase()
    );

    if (!service) {
      await showCustomAlert({ type: "info", title: "Error", message: `Service "${selectedService}" not found` });
      setUploadingFile(false);
      return;
    }

    // 2. Find mapping rule for this service + file extension
    const publish = map.find(
      (m) => m.service_id === service.id && m.format.includes(ext)
    );

    if (!publish) {
      await showCustomAlert({ type: "info", title: "Error", message: `No publish rule for "${selectedService}" with file type ".${ext}"` });
      setUploadingFile(false);
      return;
    }

    // 4. Prepare metadata with publish_id
    const dmsFormData = new FormData();
    dmsFormData.append("documents", file);
    dmsFormData.append("ref", "DMS");
    dmsFormData.append("custom_folder", "requirement_docs");

    dmsFormData.append(
      "metadata",
      JSON.stringify([
        {
          publish_id: publish.id,
          doctype_id: publish.doctype_id,
          service_id: publish.service_id,
          user_id: userId,
          document_name: file.name,
        },
      ])
    );

    try {
      const response = await fetch(
        `${baseUrld}/service/upload-documents`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: dmsFormData,
        }
      );

      const data = await response.json();
      console.log("DMS Upload Response:", data); // Debug log

      if (response.ok) {
        // Extract file_url from uploaded_files array
        let uploadedLink = "";

        if (data?.uploaded_files && Array.isArray(data.uploaded_files) && data.uploaded_files.length > 0) {
          uploadedLink = data.uploaded_files[0]?.file_url || "";
        } else if (data?.file_url) {
          uploadedLink = data.file_url;
        }

        console.log("Extracted file link:", uploadedLink); // Debug log

        if (uploadedLink) {
          setFormData((prev) => ({
            ...prev,
            document_upload_link: uploadedLink,
          }));
          await showCustomAlert({ type: "success", title: "Uploaded", message: `Document uploaded to DMS!\nLink: ${uploadedLink}` });
        } else {
          await showCustomAlert({ type: "info", title: "Error", message: "Upload succeeded but couldn't extract file link from response" });
          setFormData((prev) => ({
            ...prev,
            document_upload_link: "",
          }));
        }
      } else {
        await showCustomAlert({ type: "info", title: "Error", message: `Failed to upload: ${data.error || data.message || "Unknown error"}` });
        setFormData((prev) => ({
          ...prev,
          document_upload_link: "",
        }));
      }
    } catch (error) {
      console.error("Upload error:", error);
      await showCustomAlert({ type: "info", title: "Error", message: "Something went wrong during upload: " + error.message });
      setFormData((prev) => ({
        ...prev,
        document_upload_link: "",
      }));
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      await showCustomAlert({ type: "info", title: "Validation", message: "Add at least one indent before submitting." });
      return;
    }

    // Check if a file was selected but upload hasn't completed
    if (uploadingFile) {
      await showCustomAlert({ type: "info", title: "Validation", message: "File is still uploading. Please wait..." });
      return;
    }

    // Ensure a customer is selected (either via selectedCustomerId or formData.customerId)
    if (!selectedCustomerId && !formData.customerId) {
      await showCustomAlert({ type: "info", title: "Validation", message: "Please select a lead or set a customer before submitting." });
      return;
    }

    setLoading(true);
    try {
      const workflowIdForPayload = (() => {
        if (!selectedWorkflowId) return 1;
        const n = Number(selectedWorkflowId);
        return Number.isNaN(n) ? selectedWorkflowId : n;
      })();

      const indents = items.map((row) => ({
        asset_name: row.item,
        quantity: row.quantity === "" || row.quantity == null ? 0 : Number(row.quantity),
        uom: row.uom,
        category: row.category,
        request_for: "Sales",
        remarks: row.description,
        // use selected workflow id if available, otherwise default to 1
        workflow_id: workflowIdForPayload,
        // Use per-item budget if present, otherwise fall back to form-level budget
        budget: row.budget ? Number(row.budget) : (formData.budget ? Number(formData.budget) : null),
        lead_id: selectedLeadId || null,
        lead_uid: selectedLeadUid || null,
      }));

      const payload = {
        user_id: Number(sessionStorage.getItem("userId") || 26),
        customer_id: selectedCustomerId || formData.customerId || null,
        customer_uid: selectedCustomerUid || formData.customerUid || null,
        reference_number: formData.QueryNo,
        requirement_document_name: formData.documentName,
        document_upload_link: formData.document_upload_link || "",
        document_remarks: formData.documentDescription || "",
        submitted_by: Number(sessionStorage.getItem("userId") || 26),
        indents,
      };

      console.log("Submitting payload:", payload); // Debug log
      console.log("document_upload_link value:", formData.document_upload_link); // Debug log

      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        // `${baseUrl}/salesmanagement/indent/add-multiple-indents`,
        `${baseUrl}/salesmanagement/indent/add-indents`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Server response:", response.status, response.data);

      if (response.status === 200 || response.status === 201) {
        await showCustomAlert({ type: "success", title: "Success", message: "Indent submitted successfully!" });
        // Reset form to initial state
        resetForm();
      } else {
        await showCustomAlert({ type: "info", title: "Error", message: "Failed to submit indent" });
      }
    } catch (error) {
      console.error("Submission Error:", error);
      // Log server response body if available for debugging
      if (error.response) {
        console.error("Server response data:", error.response.data);
      }
      await showCustomAlert({ type: "info", title: "Error", message: "Something went wrong: " + (error.response?.data?.message || error.message) });
    } finally {
      setLoading(false);
    }
  };

  // Reset the entire form and items to initial state
  function resetForm() {
    setItems([]);
    setFormData({
      customerId: "",
      lead_id: "",
      lead_uid: "",
      customerName: "",
      QueryNo: "",
      documentName: "",
      documentDescription: "",
      itemDescription: "",
      assetname: "",
      file: null,
      tradingGoods: "",
      itemCategory: "",
      quantity: "",
      uom: "",
      category: "",
      request_for: "",
      budget: "",
      document_upload_link: "",
    });
    setSelectedLeadId("");
    setSelectedLeadUid("");
    setSelectedCustomerId("");
    setSelectedCustomerUid("");
    setSelectedCustomerName("");
    setSelectedWorkflowId("");
    // Clear file input
    if (fileInputRef.current) {
      try {
        fileInputRef.current.value = "";
      } catch (err) {
        // ignore
      }
    }
  }

  const selectedLeadObject = leads.find(
    (l) => String(l.lead_id) === String(selectedLeadId)
  );

  //   const selectedLeadObject = leads.find(
  //   (l) => String(l.lead_id) === String(selectedLeadId) && l.status === "verified"
  // );

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg border mt-4">
      <h2 className="text-xl font-semibold text-[#003566] mb-6">
        Requirement document
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Lead ID</label>
          {verifiedLeadRaw ? (
            <input
              className="bg-gray-100 px-3 py-2 rounded text-sm cursor-not-allowed"
              value={
                selectedLeadObject
                  ? `${selectedLeadObject.lead_uid || selectedLeadObject.lead_id
                  } (${selectedLeadObject.name ||
                  selectedLeadObject.customer_name ||
                  ""
                  })`
                  : selectedLeadId
              }
              readOnly
            />
          ) : (
            <select
              className="bg-gray-100 px-3 py-2 rounded text-sm"
              value={selectedLeadId}
              onChange={handleLeadSelect}
            >
              <option value="">Select Lead</option>
              {leads
                // .filter((lead) => lead.status?.toLowerCase().trim() === "Verified")
                .filter(
                  (lead) =>
                    lead.status &&
                    lead.status.toLowerCase().trim() === "verified"
                )
                .map((lead) => (
                  <option key={lead.lead_id} value={String(lead.lead_id)}>
                    {lead.lead_uid || lead.lead_id} (
                    {lead.name || lead.customer_name || ""})
                  </option>
                ))}
            </select>
          )}
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Customer UID</label>
          <input
            className="bg-gray-100 px-3 py-2 rounded text-sm cursor-not-allowed"
            value={selectedCustomerUid || ""}
            readOnly
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Customer Name</label>
          <input
            type="text"
            value={
              selectedLeadObject?.customer_name ||
              selectedCustomerName ||
              formData.customerName ||
              ""
            }
            readOnly
            className="bg-gray-100 px-3 py-2 rounded text-sm cursor-not-allowed"
          />
        </div>
        {/* <div className="flex flex-col">
          <label className="mb-1 font-medium">Workflow</label>
          {workflowLoading ? (
            <select
              disabled
              aria-busy="true"
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-600"
            >
              <option value="">Select Workflow</option>
            </select>
          ) : workflows.length > 0 ? (
            <select
              value={selectedWorkflowId || ""}
              onChange={(e) => setSelectedWorkflowId(e.target.value)}
              className="w-full border rounded px-3 py-2 bg-gray-100"
            >
              <option value="">Select Workflow</option>
              {workflows.map((w) => {
                const id = w?.workflow_id ?? w?.workflow_uuid ?? "";
                return (
                  <option key={id} value={String(id)}>
                    {w.workflow_name} ({id})
                  </option>
                );
              })}
            </select>
          ) : (
            <p className="text-xs text-red-600 mt-1">No workflows found</p>
          )}
        </div> */}
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Budget</label>
          <select
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 bg-gray-100"
          >
            <option value="">Select Budget</option>
            {budgets.map((budget) => (
              <option key={budget.id} value={budget.id}>
                {budget.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="flex flex-col">
          <label className="mb-1 font-medium">Required document name </label>
          <input
            type="text"
            name="documentName"
            value={formData.documentName}
            onChange={handleChange}
            placeholder="Enter document name"
            className="bg-gray-100 px-3 py-2 rounded text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">Query No.</label>
          <input
            type="text"
            name="QueryNo"
            value={
              selectedLeadObject?.query_id ||
              selectedQueryId ||
              formData.QueryNo ||
              ""
            }
            onChange={handleChange}
            placeholder="Enter QueryNo."
            className="bg-gray-100 px-3 py-2 rounded text-sm"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 font-medium">
            Upload Reference Document (Optional)
          </label>
          <input
            type="file"
            ref={fileInputRef}
            className="bg-gray-100 px-3 py-[7px] rounded text-sm cursor-pointer"
            onChange={handleFileChange}
            disabled={uploadingFile}
          />
          {/* {uploadingFile && (
            <p className="text-xs text-blue-600 mt-1">📤 Uploading file...</p>
          )} */}
          {/* Excel uploads are handled via the same file input above (auto-detected) */}
          {/* Workflow selector moved to its own column */}
        </div>


      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Description</label>
        <textarea
          name="documentDescription"
          value={formData.documentDescription}
          onChange={handleChange}
          rows="4"
          className="w-full bg-gray-100 px-3 py-2 rounded text-sm resize-none"
          placeholder="Description"
        />
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-semibold text-[#003566] mb-4">
          Raise Request for
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="flex flex-col">
            {/* Asset Name */}
            <label className="mb-1 text-sm font-medium">Items</label>
            <input
              type="text"
              className="border rounded px-3 py-2 bg-gray-100"
              placeholder="Enter Items Name"
              value={formData.assetname}
              onChange={(e) =>
                setFormData((p) => ({ ...p, assetname: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Item Category</label>
            <input
              type="text"
              className="border rounded px-3 py-2 bg-gray-100"
              placeholder="Enter Item Category"
              value={formData.itemCategory}
              onChange={(e) =>
                setFormData((p) => ({ ...p, itemCategory: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">Quantity</label>
            <input
              type="number"
              className="border rounded px-3 py-2 bg-gray-100"
              placeholder="0"
              value={formData.quantity}
              onChange={(e) =>
                setFormData((p) => ({ ...p, quantity: e.target.value }))
              }
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 text-sm font-medium">UOM (unit of measurement)</label>
            <input
              type="text"
              name="uom"
              value={formData.uom}
              onChange={handleChange}
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="itemDescription"
            value={formData.itemDescription}
            onChange={handleChange}
            rows="4"
            className="w-full bg-gray-100 px-3 py-2 rounded text-sm resize-none"
            placeholder="Description"
          />
        </div>
        {/* 
        <div className="bg-[#F2F6FF] p-3 rounded flex items-center gap-2 mb-6">
          <span className="text-red-600 font-medium text-sm">
            NOTE: Would you like to search an existing item?*
          </span>
          <button
            className={`px-4 py-1 rounded text-white text-sm ${
              searchExisting === true ? "bg-blue-700" : "bg-[#0063F7]"
            }`}
            onClick={() => setSearchExisting(true)}
          >
            Yes
          </button>
          <span className="text-sm text-gray-600">or</span>
          <button
            className={`px-4 py-1 rounded text-white text-sm ${
              searchExisting === false ? "bg-red-700" : "bg-[#F04438]"
            }`}
            onClick={() => setSearchExisting(false)}
          >
            No
          </button>
        </div> */}

        <div className="flex gap-4 mt-6">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            onClick={handleAddItem}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Add Indent"}
          </button>
        </div>

        {items.length > 0 && (
          <div className="overflow-auto flex-grow bg-white hide-scrollbar mt-6">
            <table className="min-w-full text-sm">
              <thead className="h-[70px] sticky top-0 bg-white border-b-black border-b-2">
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-4 border-b text-center">Item</th>
                  <th className="py-2 px-4 border-b text-center">
                    Item Category
                  </th>
                  {/* <th className="py-2 px-4 border-b text-center">Asset</th> */}
                  <th className="py-2 px-4 border-b text-center">Quantity</th>
                  <th className="py-2 px-4 border-b text-center">Uom</th>
                  {/* Budget column removed - budget is now a form-level field */}
                  <th className="py-2 px-4 border-b text-center">
                    Description
                  </th>
                  <th className="py-2 px-4 border-b text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, index) => (
                  <tr key={index}>
                    <td className="p-3 text-center align-middle">{row.item}</td>
                    <td className="p-3 text-center align-middle">
                      {row.category}
                    </td>
                    {/* <td className="p-3 text-center align-middle">
                      {row.asset}
                    </td> */}
                    <td className="p-3 text-center align-middle">
                      {row.quantity}
                    </td>
                    <td className="p-3 text-center align-middle">{row.uom}</td>
                    {/* per-item budget removed from table; use form-level budget or Excel-provided budget when submitting */}
                    <td className="p-3 text-center align-middle">
                      {row.description}
                    </td>
                    <td className="p-3 text-center align-middle">
                      <button
                        className="text-red-500 font-bold"
                        onClick={() => handleRemoveItem(index)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-4 mt-6">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit"}
              </button>
              <button
                className="border border-gray-500 text-black px-6 py-2 rounded hover:bg-gray-100"
                onClick={() => {
                  resetForm();
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>


  );
}
