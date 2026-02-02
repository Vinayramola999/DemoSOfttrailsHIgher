import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const DMS_HOST = "https://devdemo.softtrails.net";
const GUIDE_OPTIONS = ["User Guide", "Data Sheet"];

export default function ProductGuideManager({ product, isOpen, onClose }) {
  const [guideDraft, setGuideDraft] = useState({
    guide_title: "",
    url: "",
    ref_no: "",
    document_id: "",
    file: null,
    product_id: "",
  });

  const [guides, setGuides] = useState([]);
  const [guideUploadStatus, setGuideUploadStatus] = useState("");

  const [editGuide, setEditGuide] = useState(null);
  const [editGuideDraft, setEditGuideDraft] = useState({
    id: "",
    guide_title: "",
    url: "",
    ref_no: "",
    document_id: "",
    file: null,
  });

  // ---------- Load guides when modal opens ---------- //
  useEffect(() => {
    if (!product || !isOpen) return;
    loadGuides(product.product_id);
    setGuideDraft((d) => ({ ...d, product_id: product.product_id }));
  }, [product, isOpen]);

  async function loadGuides(pid) {
    try {
      const res = await fetch(
        `https://saaspro.softtrails.net/cms/pro/docs/product-guide/${pid}`
      );
      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data || [];
      setGuides(items);
    } catch (err) {
      console.error("Failed to fetch guides:", err);
    }
  }

  // ---------- Check titles ---------- //
  function isGuideTitleTaken(title) {
    return guides.some(
      (g) => String(g.guide_title).toLowerCase() === String(title).toLowerCase()
    );
  }

  // ---------- Upload new guide file ---------- //
  async function handleUploadGuideFile() {
    try {
      const { file, guide_title } = guideDraft;
      if (!file || !guide_title) return toast.error("Missing file/title");

      if (isGuideTitleTaken(guide_title)) {
        return toast.error("Guide title already exists");
      }

      // register
      const regRes = await fetch(
        `https://saaspro.softtrails.net/cms/pro/content/uploadImage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_payload: { name: "new CMS" },
            doctype_payload: { doctype: "CMS logo" },
            allow_doc_payload: { doc_name: "card logo" },
          }),
        }
      );
      const regData = await regRes.json();
      const publish_id = regData?.id || regData?.data?.id;

      const token = sessionStorage.getItem("token");
      const fd = new FormData();
      fd.append("documents", file);
      fd.append("ref", "CMS");
      fd.append("custom_folder", "guide");
      fd.append(
        "metadata",
        JSON.stringify([
          {
            service: "new CMS",
            publish_id,
            user_id: sessionStorage.getItem("userId"),
            document_name: guide_title,
          },
        ])
      );

      const uploadRes = await fetch(`${DMS_HOST}/dmsapi/upload-documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const uploadData = await uploadRes.json();
      const up = uploadData.uploaded_files?.[0] || {};

      setGuideDraft((prev) => ({
        ...prev,
        url: up.file_url,
        ref_no: up.ref_no,
        document_id: up.document_id,
      }));

      setGuideUploadStatus("Uploaded ✔");
      toast.success("Guide uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  }

  // ---------- Save new guide ---------- //
  async function handleSaveGuide(e) {
    e.preventDefault();
    try {
      const payload = {
        ...guideDraft,
        product_id: product.product_id,
      };

      if (isGuideTitleTaken(payload.guide_title)) {
        return toast.error("Guide already exists");
      }

      await axios.post(
        `https://saaspro.softtrails.net/cms/pro/docs/product-guide`,
        payload
      );

      toast.success("Guide saved");
      loadGuides(product.product_id);
      setGuideDraft({
        guide_title: "",
        url: "",
        ref_no: "",
        document_id: "",
        file: null,
        product_id: product.product_id,
      });
      setGuideUploadStatus("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Save failed");
    }
  }

  // ---------- Edit guide ---------- //
  function startEditGuide(g) {
    setEditGuide(g);
    setEditGuideDraft({
      id: g.id,
      guide_title: g.guide_title,
      url: g.url,
      ref_no: g.ref_no,
      document_id: g.document_id,
      file: null,
    });
  }

  async function handleUpdateGuide(e) {
    e.preventDefault();
    try {
      const payload = { ...editGuideDraft, product_id: product.product_id };

      await axios.put(
        `https://saaspro.softtrails.net/cms/pro/docs/product-guide`,
        payload
      );

      toast.success("Guide updated!");
      setEditGuide(null);
      loadGuides(product.product_id);
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
    }
  }

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="p-6 bg-white rounded-xl shadow-xl w-full max-w-xl overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-3 text-xl">
          ×
        </button>

        <h2 className="text-xl font-semibold text-blue-800 mb-4">
          Manage Guides — {product.product_name}
        </h2>

        {/* ADD GUIDE SECTION */}
        {/* Your existing form fields go here (same as in your modal) */}
        {/* ------------------- */}

        {/* GUIDE LIST */}
        <div className="mt-6">
          <h3 className="font-medium mb-2">Existing Guides</h3>

          {guides.length === 0 && (
            <p className="text-gray-500">No guides uploaded yet.</p>
          )}

          {guides.map((g) => (
            <div key={g.id} className="border p-3 rounded mb-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">{g.guide_title}</div>
                  <div className="text-xs text-gray-600">Ref: {g.ref_no}</div>
                </div>
                <button
                  onClick={() => startEditGuide(g)}
                  className="text-sm bg-yellow-100 px-2 py-1 rounded"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* EDIT GUIDE MODAL */}
        {editGuide && (
          <div className="mt-6 border p-4 bg-white rounded-lg">
            <h3 className="font-semibold mb-3">Edit Guide</h3>

            <form onSubmit={handleUpdateGuide}>
              {/* your edit fields here */}

              <button
                type="submit"
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
              >
                Update
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
