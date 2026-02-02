import React, { useEffect, useState } from "react";
import axios from "axios";
import { LuPencil } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import OurProducts from "./OurProducts";
import ProductGuideModal from "./ProductGuideModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AiFillFilePdf } from "react-icons/ai";

const PATH_PREFIX = "/products/";
const DMS_HOST = "https://devdemo.softtrails.net";

export default function Products() {
  const [activeTab, setActiveTab] = useState(1);

  // Add-product form fields (use a single draft object)
  const [productDraft, setProductDraft] = useState({
    file: null,
    documentName: "",
    userId: "",
    productName: "",
    description: "",
    imageUrl: "",
    refNo: "",
    documentId: "",
    url: "",

    // NEW icon fields
    iconFile: null,
    iconName: "",
    iconUrl: "",
    iconRefNo: "",
    iconId: "",
  });

  const [uploadStatus, setUploadStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // listing & edit modal
  const [products, setProducts] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [editProduct, setEditProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");

  // Track errors related to editing/updating a product and loading state
  const [editError, setEditError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Product Guide modal and related state
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideProduct, setGuideProduct] = useState(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();

    // Prefill userId from sessionStorage (try multiple common keys)
    const storedUserId =
      sessionStorage.getItem("userId") ||
      sessionStorage.getItem("user_id") ||
      sessionStorage.getItem("user") ||
      "";
    if (storedUserId) {
      setProductDraft((prev) => ({ ...prev, userId: storedUserId }));
    }
  }, []);

  // Helper: check blank (empty or only whitespace)
  function isBlank(val) {
    return !val || String(val).trim().length === 0;
  }

  async function fetchProducts() {
    try {
      const res = await fetch(
        `https://saaspro.softtrails.net/cms/pro/publish/retriveContent`
      );
      const data = await res.json();

      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
        ? data.data
        : Array.isArray(data.content)
        ? data.content
        : [];

      const sorted = items.slice().sort((a, b) => {
        const da = a.created_on ? new Date(a.created_on) : new Date(0);
        const db = b.created_on ? new Date(b.created_on) : new Date(0);
        return da - db;
      });

      setProducts(sorted);
      setRecentProducts(sorted.length > 0 ? [sorted[0]] : []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  }

  // Delete product
  // async function handleDelete(product_id) {
  //   try {
  //     await fetch(`https://saaspro.softtrails.net/cms/pro/content/deleteContent/${product_id}`, {
  //       method: "DELETE",
  //     });
  //     setProducts((prev) => prev.filter((p) => p.product_id !== product_id));
  //     setRecentProducts((prev) =>
  //       prev.filter((p) => p.product_id !== product_id)
  //     );
  //     toast.success("Product deleted");
  //   } catch (err) {
  //     console.error("Error deleting product:", err);
  //     toast.error("Delete failed");
  //   }
  // }

  // Edit modal open/close
  function openEditModal1(product) {
    setEditProduct({
      ...product,
      visibility: !!product.visibility,
      comingsoon: !!product.comingsoon,
      icon_url: product.icon_url || "",
      icon_ref_no: product.icon_ref_no || "",
      icon_id: product.icon_id || "",
    });
    setMessage("");
    setShowModal(true);
  }

  // Open Guide modal for a product
  async function openGuideModal(product) {
    setGuideProduct(product);
    setShowGuideModal(true);
  }

  function closeGuideModal() {
    setShowGuideModal(false);
    setGuideProduct(null);
  }

  function closeModal() {
    setShowModal(false);
    setEditProduct(null);
    setMessage("");
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditProduct((prev) => ({ ...prev, [name]: value }));
  }

  // Image upload while editing
  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !editProduct) return;

    // ensure product has a valid name before attaching image metadata
    if (isBlank(editProduct.product_name)) {
      setMessage("Product name is required before uploading image.");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      if (editProduct.document_id) {
        await fetch(`${DMS_HOST}/dmsapi/documents/${editProduct.document_id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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
        setMessage("Image registration failed");
        return;
      }

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
            user_id: editProduct.created_by,
            document_name: editProduct.product_name,
          },
        ])
      );

      const docRes = await fetch(`${DMS_HOST}/dmsapi/upload-documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const docData = await docRes.json();
      const uploaded = docData?.uploaded_files?.[0] || {};

      setEditProduct((prev) => ({
        ...prev,
        image_url: uploaded.file_url || "",
        ref_no: uploaded.ref_no || "",
        document_id: uploaded.document_id || "",
      }));

      setMessage("Image uploaded successfully!");
    } catch (err) {
      console.error("Image upload error:", err);
      setMessage("Image upload failed!");
    }
  }

  // Update product (visibility + comingsoon + metadata)
  async function handleUpdate(e) {
    e.preventDefault();
    if (!editProduct) return;
    setMessage("");
    setEditError("");
    setIsUpdating(true);
    try {
      const id = editProduct.product_id;

      // Validate fields are not only spaces
      const nameTrim = (editProduct.product_name || "").trim();
      const descriptionTrim = (editProduct.description || "").trim();
      const urlPart = ((editProduct.url || "") + "")
        .replace(PATH_PREFIX, "")
        .trim();
      if (isBlank(nameTrim)) {
        setEditError("Product name cannot be empty or only spaces.");
        setIsUpdating(false);
        toast.error("Product name required");
        return;
      }
      if (isBlank(descriptionTrim)) {
        setEditError("Product description cannot be empty or only spaces.");
        setIsUpdating(false);
        toast.error("Product description required");
        return;
      }
      if (isBlank(urlPart)) {
        setEditError("Product path cannot be empty.");
        setIsUpdating(false);
        toast.error("Product path required");
        return;
      }

      // 1) visibility
      await axios.patch(
        `https://saaspro.softtrails.net/cms/pro/publish/visibility/${id}`,
        {
          value: !!editProduct.visibility,
        }
      );

      // 2) comingsoon (only if visibility)
      if (editProduct.visibility) {
        await axios.patch(
          `https://saaspro.softtrails.net/cms/pro/publish/comingsoon/${id}`,
          {
            value: !!editProduct.comingsoon,
          }
        );
      } else {
        console.warn("Skipping 'comingsoon' step because visibility is false");
      }

      // 3) update content
      const payload = {
        product_name: nameTrim,
        description: descriptionTrim,
        url: PATH_PREFIX + urlPart,
        product_no: editProduct.product_no,
        image_url: editProduct.image_url,
        ref_no: editProduct.ref_no,
        document_id: editProduct.document_id,

        // NEW ICON FIELDS
        icon_url: editProduct.icon_url,
        icon_ref_no: editProduct.icon_ref_no,
        icon_id: editProduct.icon_id,
      };

      await axios.patch(
        `https://saaspro.softtrails.net/cms/pro/content/updateContent/${id}`,
        payload
      );

      // Update state
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === id ? { ...p, ...payload, ...editProduct } : p
        )
      );
      setRecentProducts((prev) =>
        prev.map((p) =>
          p.product_id === id ? { ...p, ...payload, ...editProduct } : p
        )
      );

      setMessage("Product updated successfully!");
      toast.success("Product updated");
      setShowModal(false);
      setEditProduct(null);
      setEditError("");
      setIsUpdating(false);
    } catch (err) {
      console.error("Error updating product:", err?.response?.data || err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Update failed! Check console.";
      setMessage(errMsg);
      setEditError(errMsg);
      toast.error("Update failed");
      setIsUpdating(false);
    } finally {
      // ensure updating flag is cleared if not already
      setIsUpdating(false);
    }
  }

  // Upload and Add product
  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setProductDraft((prev) => ({ ...prev, file: selectedFile }));
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(selectedFile);
    }
    // If no file selected (cancel), do nothing to preserve previous selection
  }

  async function handleUploadAndSetRefs() {
    try {
      const { file, documentName, userId } = productDraft;
      // validate that required fields are not empty or only spaces
      if (!file || isBlank(documentName) || isBlank(userId)) {
        setUploadStatus(
          "Please provide file, a valid document name, and user id."
        );
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
        setUploadStatus("Failed to register image (publish_id missing).");
        return;
      }

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

      const token = sessionStorage.getItem("token"); // <-- token from sessionStorage

      const docRes = await fetch(`${DMS_HOST}/dmsapi/upload-documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const docData = await docRes.json();
      const uploadedFile = docData?.uploaded_files?.[0] || {};

      setProductDraft((prev) => ({
        ...prev,
        imageUrl: uploadedFile.file_url || "",
        refNo: uploadedFile.ref_no || "",
        documentId: uploadedFile.document_id || "",
      }));
      setUploadStatus("Upload successful. Now you can submit the product.");
    } catch (err) {
      console.error("Upload error:", err);
      setUploadStatus("Upload failed.");
    }
  }

  async function handleSubmitContent() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const {
        productName,
        description,
        imageUrl,
        userId,
        refNo,
        url,
        documentId,
      } = productDraft;
      if (!imageUrl || !refNo) {
        setIsSubmitting(false);
        toast.error("Please upload image first.");
        return;
      }

      // Validate productName and path (cannot be only spaces)
      const nameTrim = (productName || "").trim();
      const descriptionTrim = (description || "").trim();
      const urlPart = ((url || "") + "").replace(PATH_PREFIX, "").trim();
      if (isBlank(nameTrim)) {
        setIsSubmitting(false);
        toast.error("Product name cannot be empty or only spaces.");
        return;
      }
      if (isBlank(descriptionTrim)) {
        setIsSubmitting(false);
        toast.error("Product description cannot be empty or only spaces.");
        return;
      }
      if (isBlank(urlPart)) {
        setIsSubmitting(false);
        toast.error(
          "Product path cannot be empty. Please enter a path after 'products/'."
        );
        return;
      }

      const contentRes = await fetch(
        `https://saaspro.softtrails.net/cms/pro/content/addContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            product_name: nameTrim,
            description: descriptionTrim,
            image_url: imageUrl,
            created_by: userId,
            ref_no: refNo,
            url: PATH_PREFIX + urlPart,
            document_id: documentId,

            // NEW fields
            icon_url: productDraft.iconUrl,
            icon_ref_no: productDraft.iconRefNo,
            icon_id: productDraft.iconId,
          }),
        }
      );

      await contentRes.json();
      toast.success("Product submitted successfully!");
      // Reset all fields after successful submit
      const storedUserId =
        sessionStorage.getItem("userId") ||
        sessionStorage.getItem("user_id") ||
        sessionStorage.getItem("user") ||
        "";
      setProductDraft({
        file: null,
        documentName: "",
        userId: storedUserId,
        productName: "",
        description: "",
        imageUrl: "",
        refNo: "",
        documentId: "",
        url: "",

        // NEW icon fields
        iconFile: null,
        iconName: "",
        iconUrl: "",
        iconRefNo: "",
        iconId: "",
      });
      setUploadStatus("");
      setPreviewUrl("");
      setIsSubmitting(false);
      // Reset file inputs
      document.getElementById("file-upload-input").value = "";
      document.getElementById("icon-file-input").value = "";
      await fetchProducts();
    } catch (err) {
      console.error("Submit error:", err);
      setIsSubmitting(false);
      toast.error("Failed to submit product.");
    }
  }

  async function handleUploadIcon() {
    try {
      const { iconFile, iconName, userId } = productDraft;
      // validate icon name is not only spaces
      if (!iconFile || !iconName || !userId || !iconName.trim()) {
        toast.error("Please provide icon file and a valid icon name.");
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
              doctype: "CMS icon",
              description: "icon for product",
            },
            allow_doc_payload: { doc_name: "card icon", description: "icons" },
          }),
        }
      );

      const uploadData = await uploadRes.json();
      const publish_id = uploadData?.id || uploadData?.data?.id;
      if (!publish_id) {
        toast.error("Icon register failed");
        return;
      }

      const formData = new FormData();
      formData.append("documents", iconFile);
      formData.append("ref", "CMS");
      formData.append("custom_folder", "icon");
      formData.append(
        "metadata",
        JSON.stringify([
          {
            service: "new CMS",
            publish_id,
            user_id: userId,
            document_name: iconName,
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

      setProductDraft((prev) => ({
        ...prev,
        iconUrl: uploaded.file_url || "",
        iconRefNo: uploaded.ref_no || "",
        iconId: uploaded.document_id || "",
      }));

      toast.success("Icon uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Icon upload failed!");
    }
  }

  async function handleIconUploadEdit(e) {
    const file = e.target.files?.[0];
    if (!file || !editProduct) return;

    try {
      const token = sessionStorage.getItem("token");

      if (editProduct.icon_id) {
        await fetch(`${DMS_HOST}/dmsapi/documents/${editProduct.icon_id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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
              doctype: "CMS icon",
              description: "icon for product",
            },
            allow_doc_payload: { doc_name: "card icon", description: "icons" },
          }),
        }
      );

      const uploadData = await uploadRes.json();
      const publish_id = uploadData?.id || uploadData?.data?.id;
      if (!publish_id) {
        setMessage("Icon registration failed");
        return;
      }

      const formData = new FormData();
      formData.append("documents", file);
      formData.append("ref", "CMS");
      formData.append("custom_folder", "icon");
      formData.append(
        "metadata",
        JSON.stringify([
          {
            service: "new CMS",
            publish_id,
            user_id: editProduct.created_by,
            document_name: editProduct.product_name + "_icon",
          },
        ])
      );

      const docRes = await fetch(`${DMS_HOST}/dmsapi/upload-documents`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const docData = await docRes.json();
      const uploaded = docData?.uploaded_files?.[0] || {};

      setEditProduct((prev) => ({
        ...prev,
        icon_url: uploaded.file_url || "",
        icon_ref_no: uploaded.ref_no || "",
        icon_id: uploaded.document_id || "",
      }));

      setMessage("Icon uploaded successfully!");
    } catch (err) {
      console.error("Icon upload error:", err);
      setMessage("Icon upload failed!");
    }
  }

  return (
    <div className="">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        containerStyle={{ marginTop: "60px" }}
      />

      {/* Tabs */}
      <div className="flex space-x-2 mb-4 absolute">
        <button
          className={`cursor-pointer py-2 px-6 rounded-full whitespace-nowrap text-sm font-medium transition ${
            activeTab === 1
              ? "bg-gradient-to-r from-[#005AE6] to-[#003280] text-white"
              : "text-black"
          }`}
          onClick={() => setActiveTab(1)}
        >
          Add
        </button>
        <button
          className={`cursor-pointer py-2 px-6 rounded-full whitespace-nowrap text-sm font-medium transition ${
            activeTab === 2
              ? "bg-gradient-to-r from-[#005AE6] to-[#003280] text-white"
              : "text-black"
          }`}
          onClick={() => setActiveTab(2)}
        >
          Manage
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 1 && (
        <div className="grid grid-cols-11 gap-6">
          {/* Left: Add form */}
          <div className="bg-white mt-16 p-5 text-start space-y-4 col-span-7 border-[1px] border-[#DDDDDD] rounded-lg">
            <div
              className="overflow-y-auto scrollbar-hide h-[71vh]"
              style={{ maxHeight: "600px" }}
            >
              <p className="text-[#00235A] font-semibold">Add Product</p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium py-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Add Product Name"
                    value={productDraft.productName}
                    onChange={(e) =>
                      setProductDraft((prev) => ({
                        ...prev,
                        productName: e.target.value,
                      }))
                    }
                    className="block bg-[#F4F4F4] p-3 rounded-lg w-full placeholder:text-[#8D8D8D] placeholder:text-[12px]"
                    style={{ fontSize: "14px" }}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium py-1">
                    Product Description
                  </label>
                  <textarea
                    placeholder="Add Description  (max 15 words)"
                    value={productDraft.description}
                    onChange={(e) =>
                      setProductDraft((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="block bg-[#F4F4F4] p-2 rounded-lg w-full placeholder:text-[#8D8D8D] placeholder:text-[12px]"
                  />
                </div>
              </div>

              <div className="border-[1px] border-[#DDDDDD] rounded-lg p-5 space-y-5 my-5">
                <div>
                  <label className="text-sm font-medium py-1 ">
                    Product Card image
                  </label>
                  <input
                    type="text"
                    placeholder="Document Name"
                    value={productDraft.documentName}
                    onChange={(e) =>
                      setProductDraft((prev) => ({
                        ...prev,
                        documentName: e.target.value,
                      }))
                    }
                    className="block bg-[#F4F4F4] p-2 rounded-lg w-full placeholder:text-[#8D8D8D] placeholder:text-[12px]"
                  />
                </div>
                <p className="text-[12px] text-red-600 text-end">
                  Best aspect ratio is (3:2)
                </p>

                <div
                  className="border-2 border-dashed border-[#000000] rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:border-blue-400"
                  onClick={() =>
                    document.getElementById("file-upload-input")?.click()
                  }
                  style={{ minHeight: "150px", position: "relative" }}
                >
                  <svg
                    width="48"
                    height="48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M24 6v24m0 0l-8-8m8 8l8-8"
                      stroke="#8D8D8D"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <rect
                      x="4"
                      y="34"
                      width="40"
                      height="8"
                      rx="2"
                      fill="#F4F4F4"
                    />
                  </svg>
                  <p className="mt-2 text-[#222] text-base font-medium">
                    Choose a file or drag & drop it here.
                  </p>
                  <p className="text-[#8D8D8D] text-xs mb-2">
                    JPEG, PNG, PDF, and SVG formats, up to 5 MB. (Best aspect
                    ratio is 3:2)
                  </p>
                  <span
                    className="text-blue-600 text-sm font-medium underline cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById("file-upload-input")?.click();
                    }}
                  >
                    Browse File
                  </span>
                  <input
                    id="file-upload-input"
                    type="file"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    accept=".jpeg,.jpg,.png,.pdf,.svg"
                  />
                  {productDraft.file && (
                    <div className="mt-2 text-xs text-green-600">
                      Selected: {productDraft.file.name}
                    </div>
                  )}
                  {previewUrl && (
                    <div
                      className="mt-4 flex justify-center items-center"
                      style={{
                        width: "360px",
                        height: "240px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        overflow: "hidden",
                        background: "#f4f4f4",
                      }}
                    >
                      <img
                        src={previewUrl}
                        alt="Preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={async () => {
                    await handleUploadAndSetRefs();
                  }}
                  className="p-3 w-full rounded-lg bg-blue-500 text-white font-semibold"
                >
                  Upload Image & Get Refs
                </button>
                {uploadStatus && (
                  <div className="mt-2 text-sm text-blue-600">
                    {uploadStatus}
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium py-1">user id</label>
                <input
                  type="text"
                  placeholder="User ID (e.g., admin_user)"
                  value={productDraft.userId}
                  readOnly
                  onChange={(e) =>
                    setProductDraft((prev) => ({
                      ...prev,
                      userId: e.target.value,
                    }))
                  }
                  className="block bg-[#F4F4F4] p-2 rounded-lg w-full placeholder:text-[#8D8D8D] placeholder:text-[12px]"
                />
              </div>

              <div className="border-[1px] border-[#DDDDDD] rounded-lg p-5 space-y-5 my-5">
                <p className="text-sm font-medium">Product Icon image</p>

                <input
                  type="text"
                  placeholder="Icon Document Name"
                  value={productDraft.iconName}
                  onChange={(e) =>
                    setProductDraft((prev) => ({
                      ...prev,
                      iconName: e.target.value,
                    }))
                  }
                  className="block bg-[#F4F4F4] p-2 rounded-lg w-full"
                />

                <input
                  id="icon-file-input"
                  type="file"
                  onChange={(e) =>
                    setProductDraft((prev) => ({
                      ...prev,
                      iconFile: e.target.files?.[0],
                    }))
                  }
                  className="block bg-[#F4F4F4] p-2 rounded-lg w-full"
                  accept=".jpeg,.jpg,.png,.svg"
                />

                <button
                  className="p-3 w-full rounded-lg bg-green-500 text-white font-semibold"
                  onClick={handleUploadIcon}
                >
                  Upload Icon & Get Refs
                </button>
              </div>

              <div>
                <label className="text-sm font-medium py-1">Path</label>
                <div className="flex">
                  <span
                    className="bg-[#F4F4F4] p-2 rounded-l-lg border-r-0 border border-[#DDDDDD] text-gray-500 select-none"
                    style={{ fontSize: "14px", minWidth: "210px" }}
                  >
                    {PATH_PREFIX}
                  </span>
                  <input
                    type="text"
                    id="url"
                    name="url"
                    placeholder="Enter path after products/"
                    value={productDraft.url.replace(PATH_PREFIX, "")}
                    onChange={(e) =>
                      setProductDraft((prev) => ({
                        ...prev,
                        url: PATH_PREFIX + e.target.value.replace(/^\/+/, ""),
                      }))
                    }
                    className="block bg-[#F4F4F4] p-2 rounded-r-lg w-full placeholder:text-[#8D8D8D] placeholder:text-[12px] border border-[#DDDDDD] border-l-0"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-12">
                <button
                  onClick={handleSubmitContent}
                  className="p-3 w-[200px] rounded-lg bg-[#005AE6] text-sm text-white font-medium"
                  disabled={
                    !productDraft.imageUrl ||
                    !productDraft.refNo ||
                    isSubmitting
                  }
                >
                  Submit Product
                </button>
                <button
                  onClick={() => {
                    const storedUserId =
                      sessionStorage.getItem("userId") ||
                      sessionStorage.getItem("user_id") ||
                      sessionStorage.getItem("user") ||
                      "";
                    setProductDraft({
                      file: null,
                      documentName: "",
                      userId: storedUserId,
                      productName: "",
                      description: "",
                      imageUrl: "",
                      refNo: "",
                      documentId: "",
                      url: "",

                      // NEW icon fields
                      iconFile: null,
                      iconName: "",
                      iconUrl: "",
                      iconRefNo: "",
                      iconId: "",
                    });
                    setPreviewUrl("");
                    setUploadStatus("");
                    // Reset file inputs
                    document.getElementById("file-upload-input").value = "";
                    document.getElementById("icon-file-input").value = "";
                  }}
                  className="p-3 w-[200px] rounded-lg text-sm font-medium border-[1px] border-[#000000]"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Right: Recent product (latest only) */}
          <div className="mr-5 mt-16 text-start col-span-4">
            <p className="text-[#00235A] text-sm font-semibold mb-2">
              Recent Product
            </p>

            <div className="max-w-[400px]">
              {recentProducts.length === 0 && (
                <div className="text-sm text-gray-500">No recent product</div>
              )}

              {recentProducts.map((product) => (
                <div
                  key={product.product_id}
                  className="mb-4 border rounded-lg p-4 shadow-lg bg-white"
                >
                  <img
                    src={product.image_url}
                    alt={product.product_name}
                    className="w-full h-[200px] object-cover rounded"
                  />
                  <h3 className="font-semibold mt-2">{product.product_name}</h3>
                  <p className="text-[12px] text-[#4A4A4A]">
                    {product.description}
                  </p>

                  <div className="grid grid-cols-11 gap-4 mt-3 ">
                    {/* <button className="col-span-7 rounded bg-[#005AE6] text-[12px] font-medium py-3 text-white">
                      Explore
                    </button> */}
                    <button
                      onClick={() => openEditModal1(product)}
                      className="text-xs rounded col-span-2 py-1 flex flex-col items-center justify-end border-[#DDDDDD] border-[1px]"
                    >
                      <LuPencil size={16} />
                      <p className="text-[10px] text-[#4D4D4D] py-0">Edit</p>
                    </button>
                    <button
                      onClick={() => openGuideModal(product)}
                      className="text-xs rounded col-span-2  py-1 flex flex-col items-center justify-end border-[#DDDDDD] border-[1px]"
                    >
                      <AiFillFilePdf size={16} />

                      <p className="text-[10px] text-[#4D4D4D] py-">Pdf</p>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Edit Modal for recent product (reused below for manage as well) */}
            {showModal && editProduct && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="my-16 p-5 text-start space-y-4 border-[1px] border-[#DDDDDD] rounded-lg bg-white w-full max-w-xl relative shadow-lg">
                  <button
                    onClick={closeModal}
                    className="absolute top-2 right-3 text-xl font-bold text-gray-700"
                  >
                    ×
                  </button>

                  <div
                    className="overflow-y-auto scrollbar-hide"
                    style={{
                      maxHeight: "600px",
                      msOverflowStyle: "none",
                      scrollbarWidth: "none",
                    }}
                  >
                    <p className="text-[#00235A] font-semibold mb-4">
                      Update Product
                    </p>

                    <form onSubmit={handleUpdate} className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium py-1">
                            Product Name
                          </label>
                          <input
                            type="text"
                            name="product_name"
                            placeholder="Product Name"
                            value={editProduct.product_name || ""}
                            onChange={handleEditChange}
                            className="block bg-[#F4F4F4] p-3 rounded-lg w-full"
                            style={{ fontSize: "12px", color: "#8D8D8D" }}
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium py-1">
                            Product Description
                          </label>
                          <textarea
                            name="description"
                            placeholder="Description"
                            value={editProduct.description || ""}
                            onChange={handleEditChange}
                            className="block bg-[#F4F4F4] p-3 rounded-lg w-full"
                            style={{ fontSize: "12px", color: "#8D8D8D" }}
                          />
                        </div>
                      </div>

                      <div className="border-[1px] border-[#DDDDDD] rounded-lg p-5 space-y-5 my-5">
                        <div>
                          <label className="text-sm font-medium py-1 ">
                            Current Image
                          </label>
                          <img
                            src={editProduct.image_url}
                            alt="Current"
                            className="w-full h-[200px] object-cover rounded my-2"
                          />
                        </div>

                        <div
                          className="border-2 border-dashed border-[#000000] rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:border-blue-400"
                          onClick={() =>
                            document
                              .getElementById("edit-file-upload-input")
                              ?.click()
                          }
                          style={{ minHeight: "150px", position: "relative" }}
                        >
                          <svg
                            width="48"
                            height="48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M24 6v24m0 0l-8-8m8 8l8-8"
                              stroke="#8D8D8D"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <rect
                              x="4"
                              y="34"
                              width="40"
                              height="8"
                              rx="2"
                              fill="#F4F4F4"
                            />
                          </svg>
                          <p className="mt-2 text-[#222] text-base font-medium">
                            Choose a file or drag & drop it here.
                          </p>
                          <p className="text-[#8D8D8D] text-xs mb-2">
                            JPEG, PNG, PDF, and SVG formats, up to 5 MB.
                          </p>
                          <span
                            className="text-blue-600 text-sm font-medium underline cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              document
                                .getElementById("edit-file-upload-input")
                                ?.click();
                            }}
                          >
                            Browse File
                          </span>
                          <input
                            id="edit-file-upload-input"
                            type="file"
                            onChange={handleImageUpload}
                            style={{ display: "none" }}
                            accept=".jpeg,.jpg,.png,.pdf,.svg"
                          />
                        </div>
                      </div>

                      <div className="border-[1px] border-[#DDDDDD] rounded-lg p-5 space-y-5 my-5">
                        <label className="text-sm font-medium py-1">
                          Current Icon
                        </label>
                        <img
                          src={editProduct.icon_url}
                          alt="Current Icon"
                          className="w-24 h-24 object-cover rounded my-2"
                        />

                        <div
                          className="border-2 border-dashed border-[#000000] rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:border-blue-400"
                          onClick={() =>
                            document
                              .getElementById("edit-icon-upload-input")
                              ?.click()
                          }
                        >
                          <p className="mt-2 text-[#222] text-base font-medium">
                            Change Icon (Optional)
                          </p>

                          <input
                            id="edit-icon-upload-input"
                            type="file"
                            onChange={handleIconUploadEdit}
                            style={{ display: "none" }}
                            accept=".jpeg,.jpg,.png,.svg"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 my-5">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="visibility"
                            checked={!!editProduct.visibility}
                            disabled={isUpdating}
                            onChange={(e) =>
                              setEditProduct((prev) => ({
                                ...prev,
                                visibility: e.target.checked,
                              }))
                            }
                          />
                          <span className="text-sm">visibility</span>
                        </label>

                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            name="comingsoon"
                            checked={!!editProduct.comingsoon}
                            disabled={!editProduct.visibility || isUpdating}
                            onChange={(e) =>
                              setEditProduct((prev) => ({
                                ...prev,
                                comingsoon: e.target.checked,
                              }))
                            }
                          />
                          <span className="text-sm">Coming Soon</span>
                        </label>
                      </div>

                      {editError && (
                        <div className="text-red-500 text-xs mt-2 text-center">
                          {editError}
                        </div>
                      )}

                      <div>
                        <label className="text-sm font-medium py-1">Path</label>
                        <div className="flex">
                          <span
                            className="bg-[#F4F4F4] p-2 rounded-l-lg border-r-0 border border-[#DDDDDD] text-gray-500 select-none"
                            style={{ fontSize: "12px", minWidth: "210px" }}
                          >
                            {PATH_PREFIX}
                          </span>
                          <input
                            type="text"
                            name="url"
                            placeholder="Enter path after products/"
                            value={(editProduct.url || "").replace(
                              PATH_PREFIX,
                              ""
                            )}
                            onChange={(e) =>
                              setEditProduct((prev) => ({
                                ...prev,
                                url:
                                  PATH_PREFIX +
                                  e.target.value.replace(/^\/+/, ""),
                              }))
                            }
                            className="block bg-[#F4F4F4] p-3 rounded-r-lg w-full border border-[#DDDDDD] border-l-0"
                            style={{ fontSize: "12px", color: "#8D8D8D" }}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mt-12">
                        <button
                          type="submit"
                          className="p-3 w-[200px] rounded-lg bg-[#005AE6] text-sm text-white font-medium"
                        >
                          Update Product
                        </button>
                        <button
                          type="button"
                          onClick={closeModal}
                          className="p-3 w-[200px] rounded-lg text-sm font-medium border-[1px] border-[#000000]"
                        >
                          Cancel
                        </button>
                      </div>

                      {message && (
                        <div className="text-red-500 text-xs text-center mt-2">
                          {message}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Product Guide Modal - extracted to separate component */}
            <ProductGuideModal
              showGuideModal={showGuideModal}
              guideProduct={guideProduct}
              onClose={closeGuideModal}
              onGuideSaved={() => {
                // Optional: refresh products list if needed
              }}
            />
          </div>
        </div>
      )}

      {/* Manage tab: show all products and reuse modal */}
      {activeTab === 2 && (
        <div className="py-6">
          <h2 className="text-xl font-semibold  mt-9 overflow-y-auto scrollbar-hide h-[75vh]">
            <OurProducts onOpenGuide={openGuideModal} />{" "}
          </h2>
        </div>
      )}

      {/* Product Guide Modal - rendered outside tabs so it's accessible from both Add and Manage tabs */}
      <ProductGuideModal
        showGuideModal={showGuideModal}
        guideProduct={guideProduct}
        onClose={closeGuideModal}
        onGuideSaved={() => {
          // Optional: refresh products list if needed
        }}
      />
    </div>
  );
}
// https://higherindia.s3.ap-south-1.amazonaws.com/Higher/new CMS/fdf/CMS20250711974_7/card logo.jpg
