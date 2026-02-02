import axios from "axios";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import { useRef } from "react";
import html2pdf from "html2pdf.js";
import API from "../../config/api";

const GenerateGrnModal = ({
  isOpen,
  onClose,
  po = {},
  onGenerate,
  submitToApi = true,
  onSuccess,
}) => {
  const [selectedPo, setSelectedPo] = useState(null);
  const [rows, setRows] = useState([]);
  const [poRecord, setPoRecord] = useState(null);
  const [apiRecords, setApiRecords] = useState([]);
  const [currentDate, setCurrentDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [otherFile, setOtherFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPoId, setCurrentPoId] = useState(null);
  const token = sessionStorage.getItem("token");
  const [modal, setModal] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const lastFetchedRef = useRef(null);

  const resetForm = () => {
    setRows([]);
    setPoRecord(null);
    setApiRecords([]);
    setCurrentDate(new Date().toISOString().split("T")[0]);
    setDeliveryDate("");
    setInvoiceFile(null);
    setOtherFile(null);
    setError("");
    setStatus("QC");
    setSelectedItems([]);
    setCurrentPoId(null);
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setSelectedPo(po?.po_id ? { value: po.po_id, label: po.po_id } : null);
      setCurrentDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen, po]);

  // Fetch PO options
  useEffect(() => {
    let mounted = true;
    const url = `${process.env.REACT_APP_PURCHASE_API}/purchase_order/AllPO`;

    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (!mounted) return;
        const list = (res.data?.data || []).map((item) => ({
          value: item.po_id,
          label: item.po_id,
        }));
        setOptions(list);
      })
      .catch((error) => {
        console.error("Error fetching PO data:", error);
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  // Fetch PO Details
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    let timer = null;

    const fetchPoDetails = async (poId) => {
      try {
        setError("");
        
        const url = `${API.PURCHASE_API}/supplier_grn/quotation_data/${poId}`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });
        
        if (!mounted) return;

        const payload = res.data || {};
        const dataArray = Array.isArray(payload.data) ? payload.data : (payload.data ? [payload.data] : []);
        const record = dataArray[0];


        setApiRecords(dataArray);
        setCurrentPoId(poId);
        lastFetchedRef.current = poId;

        if (payload.po_id) {
          setSelectedPo({ value: payload.po_id, label: payload.po_id });
        }

        if (record) {
          setPoRecord(record);
          
          const mappedRows = dataArray.map((it) => ({
            asset_name: it.asset_name || it.name || "",
            quantity: Number(it.quantity ?? it.qty ?? 0),
            unitPrice: Number(it.unit_price ?? it.unitPrice ?? 0),
            uom: it.uom || it.unit || "",
            description: it.description || "",
            qc: false,
            receiving: false,
            vendor_name: it.vendor_name || "",
            vendor_contact_name: it.vendor_contact_name || "",
            quotation_id: it.quotation_id || "",
            rfp_id: it.rfp_id || "",
          }));

          setRows(mappedRows);
          setSelectedItems(mappedRows.map((_, idx) => idx));

          setCurrentDate(
            record.quotation_date ? record.quotation_date.slice(0, 10) : new Date().toISOString().split("T")[0]
          );
          if (record.delivery_date) setDeliveryDate(record.delivery_date.slice(0, 10));
        }
      } catch (err) {
        if (!mounted) return;
        if (axios.isCancel?.(err)) return;
        console.error("Failed to fetch PO details:", err);
        setError("Failed to load PO details");
      }
    };

    const poId = selectedPo?.value;
    if (isOpen && poId && lastFetchedRef.current !== poId) {
      timer = setTimeout(() => fetchPoDetails(poId), 200);
    }

    return () => {
      mounted = false;
      if (timer) clearTimeout(timer);
      controller.abort();
    };
  }, [isOpen, selectedPo?.value, token]);

  if (!isOpen) return null;

  const handleToggle = (index, key) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, [key]: !r[key] } : r)));
  };

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
      setSelectedItems(rows.map((_, idx) => idx));
    } else {
      setSelectedItems([]);
    }
  };

  const getDmsPublishId = async (service_name, doctype, doc_name) => {
    try {
      console.log("📋 Fetching publish_id for:", { service_name, doctype, doc_name });
      const res = await axios.get(API.DMS_MAPPING_CHECK, {
        params: { service_name, doctype, doc_name },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.data.dms_publish_id) throw new Error("No publish_id returned");
      console.log("✅ Publish ID:", res.data.dms_publish_id);
      return res.data.dms_publish_id;
    } catch (err) {
      const msg = err.response?.data?.error || "Unknown error";
      throw new Error(msg);
    }
  };

  // ✅ DIRECT HTML TEMPLATE - No React rendering issues
  const generateGrnHtml = (grnData) => {
    const formatDate = (d) => {
      if (!d) return "N/A";
      try {
        return new Date(d).toLocaleDateString("en-GB");
      } catch (e) {
        return "N/A";
      }
    };

    const formatCurrency = (v) => {
      if (!v || v === "" || v === "N/A") return "N/A";
      const num = Number(v);
      if (isNaN(num)) return "N/A";
      return num.toLocaleString("en-IN", { style: "currency", currency: "INR" });
    };

    const items = grnData.items || [];
    const totalAmount = items.reduce((s, it) => s + (Number(it.unit_price || 0) * Number(it.qty_received || 0)), 0);
    const totalItems = items.reduce((s, it) => s + Number(it.qty_received || 0), 0);

    return `
      <div style="font-family: Arial, Helvetica, sans-serif; background-color: #ffffff; color: #000000; padding: 20px; width: 100%; min-height: 600px; line-height: 1.4;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="font-size: 24px; font-weight: bold; letter-spacing: 0.05em; margin-bottom: 8px;">GOODS RECEIVED NOTE</div>
          <div style="border-top: 2px solid #000000; margin: 12px 0;"></div>
        </div>

        <!-- GRN Info -->
        <div style="margin-bottom: 16px; display: flex; justify-content: space-between;">
          <div style="font-size: 12px;">
            <div><strong>GRN NUMBER:</strong> ${grnData.grn_id || "Auto-Generated"}</div>
            <div><strong>DATE:</strong> ${formatDate(grnData.date || grnData.created_at || grnData.generated_date)}</div>
          </div>
          <div style="font-size: 12px; text-align: right;">
            <div><strong>PO ID:</strong> ${grnData.po_id || "N/A"}</div>
            <div><strong>Quotation ID:</strong> ${grnData.quotation_id || "N/A"}</div>
            ${grnData.rfp_id ? `<div><strong>RFP ID:</strong> ${grnData.rfp_id}</div>` : ""}
          </div>
        </div>

        <!-- Delivery & Supplier Info -->
        <div style="display: flex; gap: 24px; margin-bottom: 16px;">
          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 12px; border-bottom: 1px solid #cccccc; padding-bottom: 4px; margin-top: 12px; margin-bottom: 8px;">DELIVERY INFORMATION:</div>
            <div style="font-size: 11px;">
              <div><strong>Delivery Note:</strong> ${grnData.delivery_note || "N/A"}</div>
              <div><strong>Delivery Date:</strong> ${formatDate(grnData.delivery_date)}</div>
              <div><strong>Carrier:</strong> ${grnData.carrier || "N/A"}</div>
            </div>
          </div>

          <div style="flex: 1;">
            <div style="font-weight: 600; font-size: 12px; border-bottom: 1px solid #cccccc; padding-bottom: 4px; margin-top: 12px; margin-bottom: 8px;">SUPPLIER INFORMATION:</div>
            <div style="font-size: 11px;">
              <div><strong>Supplier:</strong> ${grnData.vendor_name || grnData.supplier_name || grnData.supplier || "No Data"}</div>
              <div><strong>Address:</strong> ${grnData.supplier_address || grnData.address || "N/A"}</div>
              <div><strong>Contact:</strong> ${grnData.supplier_contact || grnData.vendor_contact_name || grnData.contact || "N/A"}</div>
              ${grnData.supplier_email ? `<div><strong>Email:</strong> ${grnData.supplier_email}</div>` : ""}
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 600; font-size: 12px; border-bottom: 1px solid #cccccc; padding-bottom: 4px; margin-top: 12px; margin-bottom: 8px;">RECEIVED ITEMS</div>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px;">
            <thead>
              <tr>
                <th style="background-color: #003366; color: #ffffff; padding: 8px; border: 1px solid #666666; text-align: left; font-weight: bold; width: 5%;">S.NO</th>
                <th style="background-color: #003366; color: #ffffff; padding: 8px; border: 1px solid #666666; text-align: left; font-weight: bold; width: 15%;">ITEM NAME</th>
                <th style="background-color: #003366; color: #ffffff; padding: 8px; border: 1px solid #666666; text-align: left; font-weight: bold; width: 15%;">DESCRIPTION</th>
                <th style="background-color: #003366; color: #ffffff; padding: 8px; border: 1px solid #666666; text-align: center; font-weight: bold; width: 8%;">UOM</th>
                <th style="background-color: #003366; color: #ffffff; padding: 8px; border: 1px solid #666666; text-align: right; font-weight: bold; width: 10%;">QTY ORDERED</th>
                <th style="background-color: #003366; color: #ffffff; padding: 8px; border: 1px solid #666666; text-align: right; font-weight: bold; width: 10%;">QTY RECEIVED</th>
                <th style="background-color: #003366; color: #ffffff; padding: 8px; border: 1px solid #666666; text-align: right; font-weight: bold; width: 12%;">UNIT PRICE</th>
                <th style="background-color: #003366; color: #ffffff; padding: 8px; border: 1px solid #666666; text-align: right; font-weight: bold; width: 12%;">TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${items.length === 0 ? `
                <tr>
                  <td style="padding: 6px 8px; border: 1px solid #cccccc; text-align: center;" colspan="8">No items received</td>
                </tr>
              ` : items.map((it, idx) => {
                const qtyReceived = Number(it.qty_received ?? it.quantity_received ?? it.quantity ?? it.qty ?? 0);
                const qtyOrdered = Number(it.qty_ordered ?? it.quantity ?? it.qty ?? 0);
                const unitPrice = Number(it.unit_price ?? it.unitPrice ?? it.rate ?? it.price ?? 0);
                const lineTotal = qtyReceived * unitPrice;
                const itemName = it.asset_name || it.name || it.item_name || it.description || "N/A";
                const itemDesc = it.description || it.desc || "";
                const uom = it.uom || it.unit || it.unit_of_measure || "N/A";
                
                return `
                  <tr style="background-color: ${idx % 2 === 0 ? '#ffffff' : '#f5f5f5'};">
                    <td style="padding: 6px 8px; border: 1px solid #cccccc;">${idx + 1}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cccccc;">${itemName}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cccccc;">${itemDesc || "N/A"}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cccccc; text-align: center;">${uom}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cccccc; text-align: right;">${qtyOrdered || "N/A"}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cccccc; text-align: right;">${qtyReceived || "N/A"}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cccccc; text-align: right;">${unitPrice ? formatCurrency(unitPrice) : "N/A"}</td>
                    <td style="padding: 6px 8px; border: 1px solid #cccccc; text-align: right; font-weight: bold;">${lineTotal ? formatCurrency(lineTotal) : "N/A"}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <!-- Totals -->
          <div style="display: flex; justify-content: flex-end; gap: 24px; margin-top: 12px; padding-top: 8px; border-top: 1px solid #cccccc;">
            <div style="font-size: 12px; font-weight: 600;">
              <div><strong>TOTAL ITEMS:</strong> ${totalItems}</div>
              <div style="margin-top: 8px; font-size: 14px;"><strong>TOTAL AMOUNT:</strong> ${formatCurrency(totalAmount)}</div>
            </div>
          </div>
        </div>

        <!-- Received Condition -->
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 600; font-size: 12px; border-bottom: 1px solid #cccccc; padding-bottom: 4px; margin-top: 12px; margin-bottom: 8px;">RECEIVED CONDITION:</div>
          <div style="min-height: 40px; border: 1px solid #cccccc; padding: 12px; background-color: #f9f9f9; font-size: 11px;">
            ${grnData.received_condition || "Good / As per PO"}
          </div>
        </div>

        <!-- Comments -->
        <div style="margin-bottom: 16px;">
          <div style="font-weight: 600; font-size: 12px; border-bottom: 1px solid #cccccc; padding-bottom: 4px; margin-top: 12px; margin-bottom: 8px;">COMMENTS:</div>
          <div style="min-height: 60px; border: 1px solid #cccccc; padding: 12px; background-color: #f9f9f9; font-size: 11px;">
            ${grnData.comments || grnData.remarks || "No comments"}
          </div>
        </div>

        <!-- Signature Section -->
        <div style="margin-top: 32px; font-size: 11px; border-top: 1px solid #cccccc; padding-top: 16px;">
          <div style="margin-bottom: 12px;"><strong>RECEIVED BY:</strong> ${grnData.received_by || "N/A"}</div>
          <div style="display: flex; gap: 16px;">
            <div style="flex: 1;">
              <div style="margin-bottom: 4px;">Name: ______________________</div>
              <div>Signature: ______________________</div>
            </div>
            <div style="flex: 1;">
              <div style="margin-bottom: 4px;">Department: ______________________</div>
              <div>Date: ______________________</div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  // ✅ Simple PDF generation using plain HTML
  const generateGrnPdf = async (grnData) => {
    return new Promise((resolve, reject) => {
      
      // Create element with HTML
      const element = document.createElement("div");
      element.innerHTML = generateGrnHtml(grnData);
      element.style.width = "210mm";
      element.style.padding = "0";
      element.style.margin = "0";
      
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `GRN-${grnData.grn_id || Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        },
      };

      html2pdf()
        .set(opt)
        .from(element)
        .toPdf()
        .output('blob')
        .then((pdfBlob) => {
          console.log("✅ PDF generated successfully");
          
          const pdfFile = new File(
            [pdfBlob], 
            `GRN-${grnData.grn_id || Date.now()}.pdf`, 
            { type: 'application/pdf' }
          );
          
          resolve(pdfFile);
        })
        .catch((err) => {
          console.error("❌ PDF generation error:", err);
          reject(err);
        });
    });
  };

  // Upload to DMS
  const uploadToDMS = async (file, docType, folderName, docName) => {
    
    const userId = sessionStorage.getItem("userId");
    const publish_id = await getDmsPublishId("purchase", docType, docName || docType);

    const formData = new FormData();
    formData.append("documents", file);
    formData.append("ref", docType);
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

    const uploadRes = await axios.post(API.DMS_UPLOAD, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    const fileUrl = uploadRes.data?.uploaded_files?.[0]?.file_url;
    if (!fileUrl) throw new Error(`${docType} upload failed`);
    
    console.log(`✅ ${docType} uploaded:`, fileUrl);
    return fileUrl;
  };

  const handleGenerate = async () => {
    setError("");
    setLoading(true);

    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) throw new Error("User ID not found in session storage");

      if (selectedItems.length === 0) {
        setModal({
          isOpen: true,
          type: "warning",
          title: "Warning",
          message: "Please select at least one item",
        });
        setLoading(false);
        return;
      }

      if (!currentDate || !deliveryDate) {
        setModal({
          isOpen: true,
          type: "warning",
          title: "Missing Required Fields",
          message: "Please fill Current Date and Delivery Date",
        });
        setLoading(false);
        return;
      }
      const vendorData = poRecord || apiRecords[0] || {};
      const selectedRows = selectedItems.map(idx => rows[idx]);
      
      const formItems = selectedRows.map((r) => ({
        asset_name: r.asset_name || r.name || "",
        description: r.description || "",
        uom: r.uom || r.unit || "",
        qty_ordered: Number(r.quantity || 0),
        qty_received: Number(r.quantity || 0),
        unit_price: Number(r.unitPrice || r.unit_price || 0),
      }));

      if (formItems.length === 0) {
        throw new Error("No items to include in GRN");
      }
      
      const grnData = {
        po_id: selectedPo?.value || currentPoId || po?.po_id || "",
        quotation_id: vendorData.quotation_id || "",
        rfp_id: vendorData.rfp_id || "",
        grn_id: `GRN-${Date.now()}`,
        date: currentDate,
        delivery_date: deliveryDate,
        vendor_name: vendorData.vendor_name || po?.vendor_name || "",
        supplier_address: vendorData.supplier_address || po?.supplier_address || "",
        supplier_contact: vendorData.vendor_contact_name || po?.supplier_contact || "",
        delivery_note: po?.delivery_note || `DN-${selectedPo?.value || currentPoId || ""}`,
        carrier: po?.carrier || "TBD",
        items: formItems,
        received_condition: po?.received_condition || "Good / As per PO",
        comments: po?.comments || po?.remarks || "",
        received_by: sessionStorage.getItem("userName") || "",
      };


      const pdfFile = await generateGrnPdf(grnData);
    

      const grnUrl = await uploadToDMS(pdfFile, "GRN", "purchase", "GRN");

      let invoiceUrl = "";
      if (invoiceFile) {
        try {
          invoiceUrl = await uploadToDMS(invoiceFile, "GRN invoice", "purchase", "GRN invoice");
        } catch (err) {
          console.warn("Failed to upload invoice:", err);
        }
      }

      let documentsUrl = "";
      if (otherFile) {
        try {
          documentsUrl = await uploadToDMS(otherFile, "GRN_DOCUMENT", "purchase", "DOCUMENT");
        } catch (err) {
          console.warn("Failed to upload documents:", err);
        }
      }

      const apiEndpoint = `${API.PURCHASE_API}/supplier_grn/create_grn`;
      
      // Determine status based on QC checks
      const allQcPassed = selectedRows.every(row => row.qc === true);
      const grnStatus = allQcPassed ? "QC" : "QC Failed";
      
      const body = {
        po_id: grnData.po_id,
        generated_date: grnData.date,
        delivery_date: grnData.delivery_date,
        invoice: invoiceUrl || "",
        documents: documentsUrl || "",
        grn_file: grnUrl || "",
        qc_status: grnStatus,
      };
      
      const res = await axios.post(apiEndpoint, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res?.data?.success) {
        const enrichedResponse = {
          ...res.data,
          ...grnData,
        };
        
        setModal({
          isOpen: true,
          type: "success",
          title: "Success!",
          message: "GRN created successfully!",
        });
        
        if (typeof onSuccess === "function") {
          onSuccess();
        }
        
        onGenerate?.(enrichedResponse);
      } else {
        throw new Error(res?.data?.message || "Failed to create GRN");
      }
    } catch (err) {
      console.error("❌ Error creating GRN:", err);
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Failed to create GRN";
      setError(errorMsg);
      setModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setModal({ ...modal, isOpen: false });
    if (modal.type === "success") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4" aria-modal="true">
      <div className="w-full max-w-4xl bg-white rounded-xl overflow-hidden shadow-lg">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[60] rounded-xl">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-gray-700 font-semibold">Creating GRN...</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between px-6 py-4 bg-blue-600 text-white">
          <div>
            <h3 className="text-lg font-semibold">Generate GRN</h3>
            <p className="text-sm text-blue-100">{selectedPo?.value || "Select PO"}</p>
          </div>
          <button 
            onClick={onClose} 
            className="rounded-full p-1 bg-blue-700 hover:bg-blue-800" 
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className=" w-1/2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PO ID <span className="text-red-500">*</span>
            </label>
            <Select
              value={selectedPo}
              onChange={(selected) => setSelectedPo(selected)}
              options={options}
              placeholder="Search PO"
              isClearable
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  borderRadius: "0.5rem",
                  minHeight: "38px",
                  boxShadow: "none",
                  // width: "50%",
                }),
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700">Material Details</div>
              {/* <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={selectedItems.length === rows.length && rows.length > 0}
                  onChange={handleSelectAllItems}
                />
                Select All
              </label> */}
            </div>
            <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto max-h-64 border border-gray-200">
              <table className="min-w-full text-xs whitespace-nowrap">
                <thead>
                  <tr className="text-left bg-gray-200 text-gray-700 sticky top-0">
                    <th className="px-2 py-2 min-w-40">Material Name</th>
                    <th className="px-2 py-2 w-16">Qty</th>
                    <th className="px-2 py-2 w-12">Unit</th>
                    <th className="px-2 py-2 w-20">Unit Price</th>
                    <th className="px-2 py-2 w-20">Total</th>
                    <th className="px-2 py-2 w-10">QC</th>
                    <th className="px-2 py-2 w-16">Receiving</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx} className={`border-t text-xs ${selectedItems.includes(idx) ? 'bg-blue-50' : ''}`}>
                 
                      <td className="px-2 py-2 truncate">{r.asset_name || r.name || "-"}</td>
                      <td className="px-2 py-2">{r.quantity || "-"}</td>
                      <td className="px-2 py-2">{r.uom || r.unit || "-"}</td>
                      <td className="px-2 py-2">₹{Number(r.unitPrice).toLocaleString()}</td>
                      <td className="px-2 py-2">₹{(Number(r.unitPrice || 0) * Number(r.quantity || 0)).toLocaleString()}</td>
                      <td className="px-2 py-2">
                        <input type="checkbox" checked={r.qc} onChange={() => handleToggle(idx, "qc")} />
                      </td>
                      <td className="px-2 py-2">
                        <input type="checkbox" checked={r.receiving} onChange={() => handleToggle(idx, "receiving")} />
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-2 py-4 text-center text-gray-500">
                        No items found. Please select a PO.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="border-gray-300" />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={currentDate} 
                onChange={(e) => setCurrentDate(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Date <span className="text-red-500">*</span>
              </label>
              <input 
                type="date" 
                value={deliveryDate} 
                onChange={(e) => setDeliveryDate(e.target.value)} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Invoice</label>
              <input 
                type="file" 
                accept=".pdf,.png,.jpg,.jpeg" 
                onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)} 
                className="w-full text-sm" 
              />
              {invoiceFile && <div className="text-xs mt-1 text-blue-600">{invoiceFile.name}</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Other Document</label>
              <input 
                type="file" 
                accept=".pdf,.png,.jpg,.jpeg" 
                onChange={(e) => setOtherFile(e.target.files?.[0] || null)} 
                className="w-full text-sm" 
              />
              {otherFile && <div className="text-xs mt-1 text-blue-600">{otherFile.name}</div>}
            </div>
          </div>

          <div className="flex justify-start gap-4 pt-4">
            <button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60 font-medium"
            >
              {loading ? "Generating..." : "GENERATE"}
            </button>
            <button 
              onClick={() => {
                resetForm();
                onClose();
              }} 
              className="border border-gray-400 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <div className="flex items-center gap-3 mb-4">
              {modal.type === "success" ? (
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : modal.type === "warning" ? (
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              ) : (
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <h2 className="text-lg font-semibold text-gray-900">{modal.title}</h2>
            </div>
            <p className="text-gray-600 mb-6">{modal.message}</p>
            <button
              onClick={handleModalClose}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateGrnModal;