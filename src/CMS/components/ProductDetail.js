// src/components/ProductExplore.js
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MdDeleteSweep } from "react-icons/md";

/**
 * Small helper to bust cached image URLs (do NOT store this busted URL to DB)
 */
function bustUrl(url, bustKey) {
  if (!url) return "";
  const joiner = url.includes("?") ? "&" : "?";
  return `${url}${joiner}v=${bustKey}`;
}

/**
 * Reusable File Upload with:
 * - Optional existing preview URL (with cache-busting)
 * - Optional instantly-selected file preview via Object URL
 * - Disabled mode
 */
function FileUpload({
  label,
  onFileSelect,
  required,
  previewUrl,
  disabled,
  file,
  bustKey,
  aspectRatio = "1 / 1", // <-- Add default aspect ratio
}) {
  const [fileName, setFileName] = useState("");
  const [localPreviewUrl, setLocalPreviewUrl] = useState(""); // object URL for newly selected file
  const inputId = label.replace(/\s+/g, "_");

  // Derive filename from previewUrl on first paint (when we have no file yet)
  useEffect(() => {
    if (previewUrl && !fileName && !file) {
      try {
        const urlParts = previewUrl.split("/");
        setFileName(urlParts[urlParts.length - 1]);
      } catch {}
    }
  }, [previewUrl, fileName, file]);

  // Build/revoke object URL for selected file
  useEffect(() => {
    if (!file) {
      setLocalPreviewUrl("");
      return;
    }
    const objUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objUrl);
    return () => {
      URL.revokeObjectURL(objUrl);
    };
  }, [file]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFileName(f.name);
      onFileSelect(f);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (disabled) return;
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFileName(f.name);
      onFileSelect(f);
    }
  };

  const displayUrl =
    localPreviewUrl || (previewUrl ? bustUrl(previewUrl, bustKey) : "");

  return (
    <div className="mb-4">
      <label className="block mb-1 text-[#19325c] font-medium text-[12px]">
        {label}
      </label>

      {displayUrl ? (
        <div className="mb-2 flex justify-center">
          <div
            style={{
              aspectRatio: aspectRatio,
              width: "120px",
              background: "#f4f4f4",
              border: "1px solid #ddd",
              borderRadius: "8px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={displayUrl}
              alt={label}
              onError={(e) => (e.currentTarget.style.display = "none")}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        </div>
      ) : null}

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={disabled ? undefined : handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
          disabled
            ? "border-gray-200 bg-gray-100 cursor-not-allowed"
            : "border-gray-300 hover:border-blue-400 cursor-pointer"
        }`}
        onClick={() => !disabled && document.getElementById(inputId)?.click()}
      >
        <CloudArrowUpIcon className="mx-auto h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">
          {fileName || "Choose a file or drag & drop it here"}
        </p>
        <p className="text-xs text-gray-400">JPEG, PNG, PDF, SVG up to 5MB</p>
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,application/pdf,image/svg+xml"
        onChange={handleFileChange}
        required={required && !previewUrl}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const productFromLocation = location.state?.product;

  const initialFormState = {
    detail_id: "",
    product_id: "",
    product_name: "",
    product_image: "",
    product_description: "",
    home_image: "",
    home_header: "",
    home_description: "",
    created_by: "",
    split_image: "",
    mobile_image: "",
    slug: "",
    sub_templates: [{ header: "", description: "" }],
  };

  const [form, setForm] = useState(initialFormState);
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Cache-busting key; update this after successful save to force <img> refresh
  const [imgBust, setImgBust] = useState(() => Date.now());

  // File states for new selections (instant preview)
  const [productImageFile, setProductImageFile] = useState(null);
  const [homeImageFile, setHomeImageFile] = useState(null);
  const [splitImageFile, setSplitImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://saaspro.softtrails.net/cms/pro/publish/getExplore"
      );
      const data = await res.json();

      let list = [];
      if (Array.isArray(data)) list = data;
      else if (Array.isArray(data?.data)) list = data.data;
      else if (Array.isArray(data?.result)) list = data.result;
      else if (data && typeof data === "object") {
        if (data.product_id || data.detail_id) list = [data];
        else list = [];
      }

      const match =
        list.find(
          (item) =>
            String(item.product_id) === String(id) ||
            String(item.detail_id) === String(id)
        ) || null;

      if (match) {
        // Existing product => locked until Edit
        const mapped = {
          detail_id: match.detail_id || "",
          product_id: match.product_id ?? "",
          product_name: match.product_name ?? "",
          product_image: match.product_image ?? "",
          product_description: match.product_description ?? "",
          home_image: match.home_image ?? "",
          home_header: match.home_header ?? "",
          home_description: match.home_description ?? "",
          created_by: match.created_by ?? "",
          split_image: match.split_image ?? "",
          mobile_image: match.mobile_image ?? "",
          slug: match.slug ?? "",
          sub_templates:
            match.sub_templates && match.sub_templates.length
              ? match.sub_templates.map((st) => ({
                  temp_id: st.temp_id,
                  header: st.header ?? "",
                  description: st.description ?? "",
                }))
              : [{ header: "", description: "" }],
        };
        setForm(mapped);
        setOriginalData(mapped);
        setIsEditing(false);
      } else if (productFromLocation) {
        // New entry seeded from location's product => editing ON
        setForm((prev) => ({
          ...prev,
          product_id: productFromLocation.product_id ?? id,
          product_name: productFromLocation.product_name ?? "",
          created_by: productFromLocation.created_by ?? "",
        }));
        setOriginalData(null);
        setIsEditing(true);
      } else {
        // Brand-new => editing ON
        setForm({ ...initialFormState, product_id: id });
        setOriginalData(null);
        setIsEditing(true);
      }
    } catch (err) {
      console.error("Failed to fetch explore data:", err);
      toast.error("Failed to load existing product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      await fetchProductData();
    };
    loadData();
    return () => {
      cancelled = true;
    };
  }, [id, productFromLocation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubTemplateChange = (idx, e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      sub_templates: prev.sub_templates.map((st, i) =>
        i === idx ? { ...st, [name]: value } : st
      ),
    }));
  };

  const addSubTemplate = () => {
    setForm((prev) => ({
      ...prev,
      sub_templates: [...prev.sub_templates, { header: "", description: "" }],
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    toast.info("You can now update the data");
  };

  const resetFileSelections = () => {
    setProductImageFile(null);
    setHomeImageFile(null);
    setSplitImageFile(null);
    setMobileImageFile(null);
  };

  const handleCancel = () => {
    if (originalData) setForm(originalData);
    else setForm(initialFormState);
    resetFileSelections();
    setIsEditing(false);
    setImgBust(Date.now()); // refresh previews back to original
    toast.info("Update reset");
  };

  async function uploadImage(file, documentName, userId) {
    if (!file) throw new Error("No file provided to uploadImage");

    const publishRes = await fetch(
      "https://saaspro.softtrails.net/cms/pro/content/uploadImage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_payload: {
            name: "new CMS",
            description: "service for new CMS",
          },
          doctype_payload: {
            doctype: "CMS logo",
            description: "logo for cards",
          },
          allow_doc_payload: { doc_name: documentName, description: "logos" },
        }),
      }
    );

    if (!publishRes.ok) {
      const txt = await publishRes.text().catch(() => "");
      throw new Error("Failed to get publish id" + (txt ? `: ${txt}` : ""));
    }
    const publishData = await publishRes.json();
    const publish_id = publishData?.id || publishData?.data?.id;

    const formData = new FormData();
    formData.append("documents", file);
    formData.append("ref", "CMS");
    formData.append("custom_folder", "fdf");
    formData.append(
      "metadata",
      JSON.stringify([
        {
          service: "new CMS",
          publish_id,
          user_id: userId,
          document_name: documentName,
        },
      ])
    );

    // Add token from sessionStorage (tries a few common keys)
    const token =
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("access_token") ||
      sessionStorage.getItem("authToken") ||
      "";

    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const docRes = await fetch(
      "https://devdemo.softtrails.net/dmsapi/upload-documents",
      { method: "POST", headers, body: formData }
    );

    if (!docRes.ok) {
      const txt = await docRes.text().catch(() => "");
      throw new Error("File upload failed" + (txt ? `: ${txt}` : ""));
    }
    const docData = await docRes.json();
    return docData?.uploaded_files?.[0]?.file_url;
  }

  const hasOnlySpacesOrEmpty = (value) => {
    if (typeof value !== "string") {
      // If value is null/undefined, treat as empty
      if (value == null) return true;
      // If value is a number, convert to string
      if (typeof value === "number") value = String(value);
      // If value is an object, treat as not empty (for safety)
      if (typeof value === "object") return false;
    }
    return value.trim() === "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !isEditing) return;

    // Validate all fields for only spaces or empty
    const requiredFields = [
      form.product_name,
      form.product_description,
      form.home_header,
      form.home_description,
      form.slug,
      form.created_by,
    ];
    if (requiredFields.some(hasOnlySpacesOrEmpty)) {
      toast.error("Fields cannot be empty or only spaces.");
      return;
    }
    // Validate sub_templates only when updating an existing product
    // For initial creation (no detail_id yet) allow empty sub-templates
    if (form.detail_id) {
      if (
        form.sub_templates.some(
          (st) =>
            hasOnlySpacesOrEmpty(st.header) ||
            hasOnlySpacesOrEmpty(st.description)
        )
      ) {
        toast.error("Sub-template fields cannot be empty or only spaces.");
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const userId = form.created_by;

      // Upload any selected images (new create)
      let productImageUrl = form.product_image || "";
      let homeImageUrl = form.home_image || "";
      let splitImageUrl = form.split_image || "";
      let mobileImageUrl = form.mobile_image || "";

      if (productImageFile)
        productImageUrl = await uploadImage(
          productImageFile,
          "Product Image",
          userId
        );
      if (homeImageFile)
        homeImageUrl = await uploadImage(homeImageFile, "Home Image", userId);
      if (splitImageFile)
        splitImageUrl = await uploadImage(
          splitImageFile,
          "Split Image",
          userId
        );
      if (mobileImageFile)
        mobileImageUrl = await uploadImage(
          mobileImageFile,
          "Mobile Image",
          userId
        );

      const payload = {
        ...form,
        detail_id: form.detail_id || undefined,
        product_id: Number(form.product_id),
        created_by: Number(form.created_by),
        product_image: productImageUrl,
        home_image: homeImageUrl,
        split_image: splitImageUrl,
        mobile_image: mobileImageUrl,
      };

      const res = await fetch(
        "https://saaspro.softtrails.net/cms/pro/explore/addExplore",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error("Submit failed" + (txt ? `: ${txt}` : ""));
      }

      let returned = {};
      try {
        returned = await res.json();
      } catch {}

      const returnedDetailId =
        returned?.detail_id ||
        returned?.data?.detail_id ||
        returned?.id ||
        returned?.result?.detail_id ||
        returned?.data?.id ||
        "";

      // Deduplicate sub_templates by header+description
      const uniqueSubTemplates = [];
      const seen = new Set();
      for (const st of form.sub_templates) {
        const key = `${st.header.trim()}|${st.description.trim()}`;
        if (!seen.has(key)) {
          uniqueSubTemplates.push(st);
          seen.add(key);
        }
      }

      // POST only new, non-empty sub-templates (without temp_id)
      let subTemplatesWithId = [];
      for (const st of uniqueSubTemplates) {
        if (
          !st.temp_id &&
          st.header.trim() !== "" &&
          st.description.trim() !== ""
        ) {
          const subPayload = {
            detail_id: returnedDetailId,
            header: st.header,
            description: st.description,
          };
          const subRes = await fetch(
            "https://saaspro.softtrails.net/cms/pro/explore/subTemplate",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(subPayload),
            }
          );
          let subReturned = {};
          try {
            subReturned = await subRes.json();
          } catch {}
          subTemplatesWithId.push({
            ...st,
            temp_id: subReturned?.temp_id || subReturned?.id,
          });
        } else {
          subTemplatesWithId.push(st);
        }
      }

      const updatedForm = {
        ...payload,
        ...(returnedDetailId ? { detail_id: returnedDetailId } : {}),
        sub_templates: subTemplatesWithId,
      };

      // Update local state & bust cache so previews refresh immediately
      setForm(updatedForm);
      setOriginalData(updatedForm);
      resetFileSelections();
      setIsEditing(false);
      setImgBust(Date.now());

      toast.success("Product submitted successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!isEditing || !form.detail_id) {
      toast.error("No detail_id found. Cannot update.");
      return;
    }

    // Validate all fields for only spaces or empty
    const requiredFields = [
      form.product_name,
      form.product_description,
      form.home_header,
      form.home_description,
      form.slug,
      form.created_by,
    ];
    if (requiredFields.some(hasOnlySpacesOrEmpty)) {
      toast.error("Fields cannot be empty or only spaces.");
      return;
    }
    // Validate sub_templates
    if (
      form.sub_templates.some(
        (st) =>
          hasOnlySpacesOrEmpty(st.header) ||
          hasOnlySpacesOrEmpty(st.description)
      )
    ) {
      toast.error("Sub-template fields cannot be empty or only spaces.");
      return;
    }

    try {
      setIsSubmitting(true);
      const userId = form.created_by;

      // Upload only changed files; keep existing URLs otherwise
      let productImageUrl = form.product_image || "";
      let homeImageUrl = form.home_image || "";
      let splitImageUrl = form.split_image || "";
      let mobileImageUrl = form.mobile_image || "";

      if (productImageFile)
        productImageUrl = await uploadImage(
          productImageFile,
          "Product Image",
          userId
        );
      if (homeImageFile)
        homeImageUrl = await uploadImage(homeImageFile, "Home Image", userId);
      if (splitImageFile)
        splitImageUrl = await uploadImage(
          splitImageFile,
          "Split Image",
          userId
        );
      if (mobileImageFile)
        mobileImageUrl = await uploadImage(
          mobileImageFile,
          "Mobile Image",
          userId
        );

      const productPayload = {
        product_name: form.product_name,
        product_image: productImageUrl,
        product_description: form.product_description,
        home_image: homeImageUrl,
        home_header: form.home_header,
        home_description: form.home_description,
        split_image: splitImageUrl,
        mobile_image: mobileImageUrl,
        slug: form.slug,
      };

      const res = await fetch(
        `https://saaspro.softtrails.net/cms/pro/explore/updateExplore/${form.detail_id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productPayload),
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error("Update failed" + (txt ? `: ${txt}` : ""));
      }

      // Save or update sub-templates
      for (const st of form.sub_templates) {
        const subPayload = {
          detail_id: form.detail_id,
          header: st.header,
          description: st.description,
        };

        if (st.temp_id) {
          // Update existing sub-template
          await fetch(
            `https://saaspro.softtrails.net/cms/pro/explore/subTemplate/${st.temp_id}`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(subPayload),
            }
          );
        } else {
          // Add new sub-template
          await fetch(
            "https://saaspro.softtrails.net/cms/pro/explore/subTemplate",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(subPayload),
            }
          );
        }
      }

      // Reflect updated data locally & refresh preview via cache-bust
      const updatedForm = {
        ...form,
        ...productPayload,
      };
      setForm(updatedForm);
      setOriginalData(updatedForm);
      resetFileSelections();
      setIsEditing(false);
      setImgBust(Date.now());

      toast.success("Product updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Update failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubTemplate = async (idx, temp_id) => {
    // Prevent deleting the last remaining sub-template
    if (form.sub_templates && form.sub_templates.length <= 1) {
      toast.error("At least one sub-template must remain.");
      return;
    }

    if (!temp_id) {
      // Just remove from local state if not saved yet
      setForm((prev) => ({
        ...prev,
        sub_templates: prev.sub_templates.filter((_, i) => i !== idx),
      }));
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await fetch(
        `https://saaspro.softtrails.net/cms/pro/explore/subTemplate/${temp_id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to delete sub-template");
      setForm((prev) => ({
        ...prev,
        sub_templates: prev.sub_templates.filter((_, i) => i !== idx),
      }));
      toast.success("Sub-template deleted!");
    } catch (err) {
      toast.error(err.message || "Delete failed!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!form.product_id) {
      toast.error("No product ID found");
      return;
    }

    try {
      const res = await fetch(
        `https://saaspro.softtrails.net/cms/pro/publish/${form.product_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error("Publish failed" + (txt ? `: ${txt}` : ""));
      }

      toast.success("Product published successfully!");
      // Refresh data from getExplore API
      await fetchProductData();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to publish product");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className=" flex-col flex gap-28 ">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        containerStyle={{ marginTop: "60px" }}
      />

      <div className="flex justify-between p-2   border-[1px] bg-white border-[#DDDDDD] rounded-lg shadow-md fixed w-[80vw] z-30">
        <div>
          <h1 className="font-semibold">{form.product_name || "Product"}</h1>
          <p className="text-[#6B6B6B] text-[12px] font-medium">
            {form.product_description}
          </p>
        </div>

        {/* Show Edit only when it's an existing record and not already editing */}

        <div className=" flex gap-4 items-center">
          {form.detail_id && !isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-[12px]"
            >
              Edit
            </button>
          )}

          {/* Show Cancel in header while editing an existing product */}
          {form.detail_id && isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="mt-2 px-4 py-1 ml-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 text-[12px]"
              title="Cancel editing"
            >
              Cancel
            </button>
          )}

          {/* Close / back to previous tab */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-3 mt-2 px-2 p-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-[16px]"
            title="Close and return to previous tab"
            aria-label="Close"
          >
            X
          </button>
        </div>
      </div>

      <div className="mx-[150px] mb-6  ">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-lg"
        >
          {/* Product ID */}
          <div className="mb-4">
            <label className="block mb-1 text-[#19325c] font-medium text-[12px]">
              Product ID
            </label>
            <input
              name="product_id"
              type="number"
              value={form.product_id}
              readOnly
              className="block bg-gray-200 p-2 rounded-lg w-full cursor-not-allowed"
              style={{ fontSize: "12px", color: "#8D8D8D" }}
            />
          </div>

          {/* Product Name */}
          <div className="mb-4">
            <label className="block mb-1 text-[#19325c] font-medium text-[12px]">
              Product Name
            </label>
            <input
              name="product_name"
              value={form.product_name}
              readOnly
              className="block bg-gray-200 p-2 rounded-lg w-full cursor-not-allowed"
              style={{ fontSize: "12px", color: "#8D8D8D" }}
            />
          </div>

          {/* Product Description */}
          <div className="mb-4">
            <label className="block mb-1 text-[#19325c] font-medium text-[12px]">
              Product Description
            </label>
            <textarea
              name="product_description"
              placeholder=" (max 50 words)"
              value={form.product_description}
              onChange={handleChange}
              required
              disabled={!isEditing}
              className="block  p-2 rounded-lg w-full  border"
              style={{ fontSize: "12px", color: "#8D8D8D" }}
            />
          </div>

          {/* Created By */}
          <div className="mb-4">
            <label className="block mb-1 text-[#19325c] font-medium text-[12px]">
              Created By (User ID)
            </label>
            <input
              name="created_by"
              type="number"
              value={form.created_by}
              readOnly
              className="block bg-gray-200 p-2 rounded-lg w-full cursor-not-allowed"
              style={{ fontSize: "12px", color: "#8D8D8D" }}
            />
          </div>

          {/* Home Header */}
          <div className="mb-4">
            <label className="block mb-1 text-[#19325c] font-medium text-[12px]">
              Home Header
            </label>
            <input
              name="home_header"
              value={form.home_header}
              onChange={handleChange}
              disabled={!isEditing}
              className="block  border p-2 rounded-lg w-full"
              style={{ fontSize: "12px", color: "#8D8D8D" }}
            />
          </div>

          {/* Home Description */}
          <div className="mb-4">
            <label className="block mb-1 text-[#19325c] font-medium text-[12px]">
              Home Description
            </label>
            <textarea
              name="home_description"
              value={form.home_description}
              onChange={handleChange}
              disabled={!isEditing}
              className="block  border p-2 rounded-lg w-full"
              style={{ fontSize: "12px", color: "#8D8D8D" }}
            />
          </div>

          {/* File Uploads with instant preview + cache-busting */}
          <FileUpload
            label="Product Image File"
            onFileSelect={setProductImageFile}
            previewUrl={form.product_image}
            disabled={!isEditing}
            file={productImageFile}
            bustKey={imgBust}
            aspectRatio="1 / 1" // 2:2 ratio (square)
          />
          <FileUpload
            label="Home Image File"
            onFileSelect={setHomeImageFile}
            previewUrl={form.home_image}
            disabled={!isEditing}
            file={homeImageFile}
            bustKey={imgBust}
            aspectRatio="1 / 1" // 2:2 ratio (square)
          />
          <FileUpload
            label="Split Image File"
            onFileSelect={setSplitImageFile}
            previewUrl={form.split_image}
            disabled={!isEditing}
            file={splitImageFile}
            bustKey={imgBust}
            aspectRatio="3 / 2" // 3:2 ratio
          />
          <FileUpload
            label="Mobile Image File"
            onFileSelect={setMobileImageFile}
            previewUrl={form.mobile_image}
            disabled={!isEditing}
            file={mobileImageFile}
            bustKey={imgBust}
            aspectRatio="1 / 1" // 2:2 ratio (square)
          />

          {/* Slug */}
          <div className="mb-4">
            <label className="block mb-1 text-[#19325c] font-medium text-[12px]">
              Slug
            </label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              disabled={!isEditing}
              className="block  border p-2 rounded-lg w-full"
              style={{ fontSize: "12px", color: "#8D8D8D" }}
            />
          </div>

          {/* Sub Templates: Show only if detail_id exists and there is any data */}
          <div className="z-0">
            {form.detail_id &&
              form.sub_templates &&
              form.sub_templates.length > 0 && (
                <>
                  <h4 className="text-[#19325c] my-2 font-semibold">
                    Sub Templates
                  </h4>
                  {form.sub_templates.map((st, idx) => (
                    <div key={idx} className="rounded space-y-2 mb-4 relative">
                      {/* Delete icon (show only in edit mode) */}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteSubTemplate(idx, st.temp_id)
                          }
                          className="absolute top- right-2 text-red-500 hover:text-red-700"
                          title="Delete sub-template"
                          disabled={isSubmitting}
                        >
                          <MdDeleteSweep size={22} />
                        </button>
                      )}
                      <label className="block text-[#19325c] font-medium text-[12px]">
                        Header
                      </label>
                      {isEditing && form.detail_id ? (
                        <input
                          name="header"
                          value={st.header}
                          onChange={(e) => handleSubTemplateChange(idx, e)}
                          disabled={!isEditing}
                          className="block  border p-2 rounded-lg w-full"
                          style={{ fontSize: "12px", color: "#8D8D8D" }}
                        />
                      ) : (
                        <div className="block bg-gray-200 p-2 rounded-lg w-full text-[12px] text-[#8D8D8D]">
                          {st.header}
                        </div>
                      )}
                      <label className="block text-[#19325c] font-medium text-[12px]">
                        Description
                      </label>
                      {isEditing && form.detail_id ? (
                        <textarea
                          name="description"
                          value={st.description}
                          onChange={(e) => handleSubTemplateChange(idx, e)}
                          disabled={!isEditing}
                          className="block  border p-2 rounded-lg w-full"
                          style={{ fontSize: "12px", color: "#8D8D8D" }}
                        />
                      ) : (
                        <div className="block bg-gray-200 p-2 rounded-lg w-full text-[12px] text-[#8D8D8D]">
                          {st.description}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Only show Add button in update mode */}
                  {isEditing && form.detail_id && (
                    <button
                      type="button"
                      onClick={addSubTemplate}
                      className="my-4 flex items-center justify-center w-full border-2 border-dashed border-gray-400 rounded-md py-2 text-gray-600 hover:bg-gray-50 transition"
                    >
                      <span className="text-blue-500 text-[12px] mr-2">＋</span>
                      Add new sub-module
                    </button>
                  )}
                </>
              )}
          </div>

          {/* Submit / Update Buttons */}
          <div className="flex  gap-2">
            {isEditing && form.detail_id ? (
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-[12px] w-full sm:w-auto"
              >
                {isSubmitting ? "Updating..." : "Update Product"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-[12px] w-full sm:w-auto"
              >
                {isSubmitting ? "Submitting..." : "Submit Product"}
              </button>
            )}
            <button
              type="button"
              onClick={handleCancel}
              className=" px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-700 text-center text-[12px]"
            >
              Reset Form
            </button>
            <button
              type="button"
              onClick={handlePublish}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-center text-[12px]"
            >
              Publish Info
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
