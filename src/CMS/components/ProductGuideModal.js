import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DMS_HOST = "https://devdemo.softtrails.net";
const GUIDE_OPTIONS = ["User Guide", "Data Sheet"];

export default function ProductGuideModal({
  showGuideModal,
  guideProduct,
  onClose,
  onGuideSaved,
}) {
  const [guideDraft, setGuideDraft] = useState({
    guide_title: "",
    url: "",
    ref_no: "",
    document_id: "",
    file: null,
    id: "",
    product_id: "",
  });

  const [guidesByProduct, setGuidesByProduct] = useState({});
  const [guideUploadStatus, setGuideUploadStatus] = useState("");
  const [editGuide, setEditGuide] = useState(null);
  const [showEditGuideModal, setShowEditGuideModal] = useState(false);
  const [editGuideDraft, setEditGuideDraft] = useState({
    id: "",
    guide_title: "",
    url: "",
    ref_no: "",
    document_id: "",
    file: null,
  });
  const [saveDisabled, setSaveDisabled] = useState(false);

  // Fetch product guides
  useEffect(() => {
    if (showGuideModal && guideProduct?.product_id) {
      fetchProductGuides(guideProduct.product_id);
      // Reset draft when opening modal
      setGuideDraft({
        guide_title: "",
        url: "",
        ref_no: "",
        document_id: "",
        file: null,
        id: "",
        product_id: guideProduct.product_id || "",
      });
      setGuideUploadStatus("");
      setSaveDisabled(false); // Reset save disabled when modal opens
    }
  }, [showGuideModal, guideProduct]);

  async function fetchProductGuides(productId) {
    try {
      const res = await fetch(
        `https://saaspro.softtrails.net/cms/pro/docs/product-guide/${productId}`
      );
      const data = await res.json();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : [];
      setGuidesByProduct((prev) => ({ ...prev, [productId]: items }));
    } catch (err) {
      console.error("Failed to fetch product guides:", err);
    }
  }

  // Helper: check if a guide title already exists for a product
  function isGuideTitleTaken(productId, title) {
    if (!productId || !title) return false;
    const list = guidesByProduct[productId] || [];
    return list.some(
      (g) =>
        String(g.guide_title || g.document_name || "").toLowerCase() ===
        String(title || "").toLowerCase()
    );
  }

  // Start editing an existing guide
  function startEditGuide(g) {
    setEditGuide({ ...g });
    setEditGuideDraft({
      id: g.id || "",
      guide_title: g.guide_title || "",
      url: g.url || "",
      ref_no: g.ref_no || "",
      document_id: g.document_id || "",
      file: null,
    });
    setShowEditGuideModal(true);
  }

  // Cancel editing
  function cancelEditGuide() {
    setEditGuide(null);
    setEditGuideDraft({
      id: "",
      guide_title: "",
      url: "",
      ref_no: "",
      document_id: "",
      file: null,
    });
    setShowEditGuideModal(false);
    setGuideUploadStatus("");
    setSaveDisabled(false); // Reset save disabled when cancelling edit
  }

  // Upload file while editing guide
  async function handleUploadEditGuideFile() {
    try {
      const { file, guide_title } = editGuideDraft;
      const userId =
        sessionStorage.getItem("userId") ||
        sessionStorage.getItem("user_id") ||
        sessionStorage.getItem("user") ||
        guideProduct?.created_by ||
        "";
      if (!file || !guide_title || !userId) {
        toast.error("Please choose a file and provide a guide title!");
        return;
      }

      const uploadRes = await fetch(
        `https://saaspro.softtrails.net/cms/pro/content/uploadImage`,
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
            allow_doc_payload: { doc_name: "card logo", description: "logos" },
          }),
        }
      );

      const uploadData = await uploadRes.json();
      const publish_id = uploadData?.id || uploadData?.data?.id;
      if (!publish_id) {
        toast.error("Guide registration failed");
        return;
      }

      const formData = new FormData();
      formData.append("documents", editGuideDraft.file);
      formData.append("ref", "CMS");
      formData.append("custom_folder", "guide");
      formData.append(
        "metadata",
        JSON.stringify([
          {
            service: "new CMS",
            publish_id,
            user_id: userId,
            document_name: editGuideDraft.guide_title,
          },
        ])
      );

      const token = sessionStorage.getItem("token");
      const docRes = await fetch(`${DMS_HOST}/dmsapi/upload-documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const docData = await docRes.json();
      const uploaded = docData?.uploaded_files?.[0] || {};

      setEditGuideDraft((prev) => ({
        ...prev,
        url: uploaded.file_url || "",
        ref_no: uploaded.ref_no || "",
        document_id: uploaded.document_id || "",
      }));
      setEditGuide((prev) => ({
        ...prev,
        url: uploaded.file_url || "",
        ref_no: uploaded.ref_no || "",
        document_id: uploaded.document_id || "",
      }));
      setGuideUploadStatus("Guide uploaded successfully");
      toast.success("Guide uploaded successfully!");
    } catch (err) {
      console.error("Guide upload error:", err);
      setGuideUploadStatus("Guide upload failed.");
      toast.error("Guide upload failed!");
    }
  }

  // Update existing guide
  async function handleUpdateGuide(e) {
    e?.preventDefault?.();
    if (!guideProduct || saveDisabled) return;
    if (!editGuideDraft.id) {
      toast.error("Invalid guide id");
      return;
    }
    setSaveDisabled(true);
    try {
      const payload = {
        product_id: guideProduct.product_id,
        guide_title: editGuideDraft.guide_title,
        url: editGuideDraft.url,
        ref_no: editGuideDraft.ref_no,
        document_id: editGuideDraft.document_id,
      };
      const token = sessionStorage.getItem("token");
      const idToUse = parseInt(editGuideDraft.id, 10);
      const res = await axios.put(
        `https://saaspro.softtrails.net/cms/pro/docs/product-guide`,
        { id: idToUse, ...payload },
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      console.log("Edit update response:", res?.data || res);
      const returnedGuide = res?.data?.data || res?.data || null;
      // Update local list
      setGuidesByProduct((prev) => {
        const list = prev[guideProduct.product_id] || [];
        const newList = list.map((item) =>
          String(item.id) === String(idToUse)
            ? returnedGuide || { ...item, ...payload, id: idToUse }
            : item
        );
        return { ...prev, [guideProduct.product_id]: newList };
      });
      toast.success("Guide updated successfully!");
      cancelEditGuide();
      await fetchProductGuides(guideProduct.product_id);
    } catch (err) {
      console.error("Update guide error:", err?.response?.data || err);
      toast.error("Failed to update guide.");
    } finally {
      // Enable save after 10 seconds
      setTimeout(() => setSaveDisabled(false), 10000);
    }
  }

  // Upload file for add guide
  async function handleUploadGuideFile() {
    try {
      const { file, guide_title } = guideDraft;
      const userId =
        sessionStorage.getItem("userId") ||
        sessionStorage.getItem("user_id") ||
        sessionStorage.getItem("user") ||
        guideProduct?.created_by ||
        "";
      if (!file || !guide_title || !userId) {
        toast.error("Please choose a file and provide a guide title!");
        return;
      }

      // Prevent uploading if same guide title exists
      const pid = guideDraft.product_id || guideProduct?.product_id;
      if (isGuideTitleTaken(pid, guide_title)) {
        toast.error("This guide title already exists for this product");
        return;
      }

      const uploadRes = await fetch(
        `https://saaspro.softtrails.net/cms/pro/content/uploadImage`,
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
            allow_doc_payload: { doc_name: "card logo", description: "logos" },
          }),
        }
      );

      const uploadData = await uploadRes.json();
      const publish_id = uploadData?.id || uploadData?.data?.id;
      if (!publish_id) {
        toast.error("Guide registration failed");
        return;
      }

      const formData = new FormData();
      formData.append("documents", file);
      formData.append("ref", "CMS");
      formData.append("custom_folder", "guide");
      formData.append(
        "metadata",
        JSON.stringify([
          {
            service: "new CMS",
            publish_id,
            user_id: userId,
            document_name: guide_title,
          },
        ])
      );

      const token = sessionStorage.getItem("token");
      const docRes = await fetch(`${DMS_HOST}/dmsapi/upload-documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const docData = await docRes.json();
      const uploaded = docData?.uploaded_files?.[0] || {};

      setGuideDraft((prev) => ({
        ...prev,
        url: uploaded.file_url || "",
        ref_no: uploaded.ref_no || "",
        document_id: uploaded.document_id || "",
      }));
      if (editGuide) {
        setEditGuide((prev) => ({
          ...prev,
          url: uploaded.file_url || "",
          ref_no: uploaded.ref_no || "",
          document_id: uploaded.document_id || "",
        }));
      }
      setGuideUploadStatus("Guide uploaded successfully");
      toast.success("Guide uploaded successfully!");
    } catch (err) {
      console.error("Guide upload error:", err);
      setGuideUploadStatus("Guide upload failed.");
      toast.error("Guide upload failed!");
    }
  }

  // Save product guide POST
  async function handleSaveGuide(e) {
    e?.preventDefault?.();
    if (!guideProduct || saveDisabled) return;
    setSaveDisabled(true);
    try {
      const productIdToUse = guideDraft.product_id || guideProduct.product_id;
      const payload = {
        product_id: productIdToUse,
        guide_title: guideDraft.guide_title,
        url: guideDraft.url,
        ref_no: guideDraft.ref_no,
        document_id: guideDraft.document_id,
      };
      const token = sessionStorage.getItem("token");

      // Prevent saving duplicate title
      if (isGuideTitleTaken(productIdToUse, guideDraft.guide_title)) {
        toast.error(
          "Cannot save: this guide title already exists for the product"
        );
        setSaveDisabled(false);
        return;
      }

      const createRes = await axios.post(
        `https://saaspro.softtrails.net/cms/pro/docs/product-guide`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      console.log("Create response:", createRes?.data || createRes);
      toast.success("Product guide saved successfully!");

      // Refresh list
      await fetchProductGuides(productIdToUse);

      // Reset draft
      setGuideDraft({
        guide_title: "",
        url: "",
        ref_no: "",
        document_id: "",
        file: null,
        id: "",
        product_id: "",
      });
      setGuideUploadStatus("");

      // Notify parent
      if (onGuideSaved) {
        onGuideSaved();
      }
    } catch (err) {
      console.error("Save guide error:", err?.response?.data || err);
      toast.error("Failed to save product guide.");
    } finally {
      // Enable save after 10 seconds
      setTimeout(() => setSaveDisabled(false), 10000);
    }
  }

  if (!showGuideModal || !guideProduct) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="my-16 p-5 text-start space-y-4 border-[1px] border-[#DDDDDD] rounded-lg bg-white w-full max-w-xl relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-xl font-bold text-gray-700"
        >
          ×
        </button>

        <div
          className="overflow-y-auto scrollbar-hide"
          style={{ maxHeight: "600px" }}
        >
          <p className="text-[#00235A] font-semibold mb-4">
            Manage Product Guides for: {guideProduct.product_name}
          </p>

          {/* Edit Guide Modal (nested) */}
          {showEditGuideModal && editGuide && (
            <div className="mb-4 p-4 border-l-4 border-yellow-400 bg-yellow-50">
              <p className="text-[#00235A] font-semibold mb-4">Edit Guide</p>
              <form onSubmit={handleUpdateGuide} className="space-y-4">
                <div>
                  <label className="text-sm font-medium py-1">ID</label>
                  <input
                    type="text"
                    value={editGuideDraft.id}
                    readOnly
                    className="block bg-[#F4F4F4] p-3 rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium py-1">
                    Guide Title
                  </label>
                  <input
                    type="text"
                    value={editGuideDraft.guide_title}
                    onChange={(e) =>
                      setEditGuideDraft((prev) => ({
                        ...prev,
                        guide_title: e.target.value,
                      }))
                    }
                    className="block bg-[#F4F4F4] p-3 rounded-lg w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium py-1">URL</label>
                  <input
                    type="text"
                    value={editGuideDraft.url}
                    onChange={(e) =>
                      setEditGuideDraft((prev) => ({
                        ...prev,
                        url: e.target.value,
                      }))
                    }
                    className="block bg-[#F4F4F4] p-3 rounded-lg w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium py-1">Ref No</label>
                    <input
                      type="text"
                      value={editGuideDraft.ref_no}
                      onChange={(e) =>
                        setEditGuideDraft((prev) => ({
                          ...prev,
                          ref_no: e.target.value,
                        }))
                      }
                      className="block bg-[#F4F4F4] p-3 rounded-lg w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium py-1">
                      Document ID
                    </label>
                    <input
                      type="text"
                      value={editGuideDraft.document_id}
                      onChange={(e) =>
                        setEditGuideDraft((prev) => ({
                          ...prev,
                          document_id: e.target.value,
                        }))
                      }
                      className="block bg-[#F4F4F4] p-3 rounded-lg w-full"
                    />
                  </div>
                </div>
                <div className="border-[1px] border-[#DDDDDD] rounded-lg p-5 space-y-4 my-2">
                  <label className="text-sm font-medium py-1">
                    Choose a new file (optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) =>
                      setEditGuideDraft((prev) => ({
                        ...prev,
                        file: e.target.files?.[0],
                      }))
                    }
                    className="block bg-[#F4F4F4] p-2 rounded-lg w-full"
                    accept=".pdf,.doc,.docx,.jpeg,.jpg,.png,.svg"
                  />
                  <button
                    type="button"
                    onClick={handleUploadEditGuideFile}
                    className="p-3 w-full rounded-lg bg-green-500 text-white font-semibold"
                  >
                    Upload File & Get Refs
                  </button>
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="p-3 w-[200px] rounded-lg bg-[#005AE6] text-sm text-white font-medium"
                    disabled={saveDisabled}
                  >
                    {saveDisabled ? "Updating..." : "Update"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditGuide}
                    className="p-3 w-[200px] rounded-lg text-sm font-medium border-[1px] border-[#000000]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
              <hr className="my-4" />
            </div>
          )}

          {/* Add Guide Form */}
          {!showEditGuideModal && (
            <form onSubmit={handleSaveGuide} className="space-y-4">
              <div>
                <label className="text-sm font-medium py-1">Product ID</label>
                <input
                  type="text"
                  placeholder="Product ID"
                  value={guideDraft.product_id}
                  readOnly
                  className="block bg-[#F4F4F4] p-3 rounded-lg w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium py-1">Guide Title</label>
                <div className="mt-2 flex flex-col gap-2">
                  <div className="flex space-x-4">
                    {GUIDE_OPTIONS.map((opt) => {
                      const pid =
                        guideDraft.product_id || guideProduct.product_id;
                      const disabled = isGuideTitleTaken(pid, opt);
                      return (
                        <label
                          key={opt}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="radio"
                            name="guide_title"
                            value={opt}
                            checked={guideDraft.guide_title === opt}
                            disabled={disabled}
                            onChange={() =>
                              setGuideDraft((prev) => ({
                                ...prev,
                                guide_title: opt,
                              }))
                            }
                          />
                          <span
                            className={
                              disabled ? "text-gray-400" : "text-gray-800"
                            }
                          >
                            {opt}
                          </span>
                          {disabled && (
                            <span className="text-xs text-red-500 ml-2">
                              (already uploaded)
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                  {GUIDE_OPTIONS.every((opt) =>
                    isGuideTitleTaken(
                      guideDraft.product_id || guideProduct.product_id,
                      opt
                    )
                  ) && (
                    <div className="text-sm text-red-600">
                      Both guides are already uploaded for this product.
                    </div>
                  )}
                </div>
              </div>

              <div className="border-[1px] border-[#DDDDDD] rounded-lg p-5 space-y-4 my-2">
                <label className="text-sm font-medium py-1">
                  Choose Guide File
                </label>
                <input
                  type="file"
                  onChange={(e) =>
                    setGuideDraft((prev) => ({
                      ...prev,
                      file: e.target.files?.[0],
                    }))
                  }
                  className="block bg-[#F4F4F4] p-2 rounded-lg w-full"
                  accept=".pdf,.doc,.docx,.jpeg,.jpg,.png,.svg"
                />
                <button
                  type="button"
                  onClick={handleUploadGuideFile}
                  className="p-3 w-full rounded-lg bg-green-500 text-white font-semibold"
                  disabled={
                    !guideDraft.guide_title ||
                    isGuideTitleTaken(
                      guideDraft.product_id || guideProduct.product_id,
                      guideDraft.guide_title
                    )
                  }
                >
                  Upload Guide & Get Refs
                </button>
                {guideUploadStatus && (
                  <div className="mt-2 text-sm text-blue-600">
                    {guideUploadStatus}
                  </div>
                )}
                {guideDraft.url && (
                  <div className="mt-2 text-xs">
                    <a
                      href={guideDraft.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Open uploaded guide
                    </a>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-4">
                <button
                  type="submit"
                  className="p-3 w-[200px] rounded-lg text-sm font-medium bg-[#19325c] text-white"
                  disabled={
                    !guideDraft.guide_title ||
                    !guideDraft.url ||
                    isGuideTitleTaken(
                      guideDraft.product_id || guideProduct.product_id,
                      guideDraft.guide_title
                    ) ||
                    saveDisabled
                  }
                >
                  {saveDisabled ? "Saving..." : "Save Guide"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-3 w-[200px] rounded-lg text-sm font-medium border-[1px] border-[#000000]"
                >
                  Close
                </button>
              </div>
            </form>
          )}

          <hr className="my-4" />
          <p className="text-sm font-medium mb-2">Existing Guides</p>
          <div className="space-y-3">
            {(guidesByProduct[guideProduct.product_id] || []).length === 0 && (
              <div className="text-sm text-gray-500">
                No guides uploaded for this product.
              </div>
            )}
            {(guidesByProduct[guideProduct.product_id] || []).map((g) => (
              <div
                key={(g.id || g.document_id || g.ref_no || g.url).toString()}
                className="p-3 border rounded bg-[#FAFAFA]"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{g.guide_title}</div>
                    <div className="text-xs text-gray-600">
                      Ref: {g.ref_no || g.ref}
                    </div>
                  </div>
                  <div className="space-x-2">
                    {g.url && (
                      <a
                        href={g.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-blue-600 underline"
                      >
                        Open
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => startEditGuide(g)}
                      className="ml-2 inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
