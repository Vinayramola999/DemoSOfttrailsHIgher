import React, { useEffect, useState } from "react";
import axios from "axios";
import { LuPencil } from "react-icons/lu";
import { RiDeleteBin6Line } from "react-icons/ri";
import { Link } from "react-router-dom";
import { AiFillFilePdf } from "react-icons/ai";

function OurProducts({ onOpenGuide }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_name: "",
    description: "",
    image_url: "",
    created_by: "",
    product_no: "",
    url: "",
    ref_no: "",
    document_id: "",
    visibility: false,
    comingsoon: false,

    // NEW ICON FIELDS
    icon_url: "",
    icon_ref_no: "",
    icon_id: "",
  });

  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const PATH_PREFIX = "/products/";

  useEffect(() => {
    fetch("https://saaspro.softtrails.net/cms/pro/publish/retriveContent")
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
          ? data.data
          : Array.isArray(data.content)
          ? data.content
          : [];

        setProducts(items);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, []);

  // Helper: check blank (empty or only whitespace)
  function isBlank(val) {
    return !val || String(val).trim().length === 0;
  }

  // const handleDelete = async (product_id) => {
  //   try {
  //     await fetch(
  //       `https://saaspro.softtrails.net/cms/pro/content/deleteContent/${product_id}`,
  //       { method: "DELETE" }
  //     );
  //     setProducts((prev) => prev.filter((p) => p.product_id !== product_id));
  //   } catch (err) {
  //     console.error("Error deleting product:", err);
  //   }
  // };

  const openEditModal = (product) => {
    setForm({
      product_name: product.product_name,
      description: product.description,
      image_url: product.image_url,
      created_by: product.created_by,
      product_no: product.product_no,
      url: product.url,
      ref_no: product.ref_no || "",
      document_id: product.document_id || "",
      visibility: product.visibility || false,
      comingsoon: product.comingsoon || false,

      // icon fields
      icon_url: product.icon_url || "",
      icon_ref_no: product.icon_ref_no || "",
      icon_id: product.icon_id || "",
    });
    setEditId(product.product_id);
    setMessage("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      // Validate inputs (no empty or whitespace-only values)
      const nameTrim = (form.product_name || "").trim();
      const descriptionTrim = (form.description || "").trim();
      const urlPart = ((form.url || "") + "").replace(PATH_PREFIX, "").trim();
      if (isBlank(nameTrim)) {
        setMessage("Product name cannot be empty or only spaces.");
        return;
      }
      if (isBlank(descriptionTrim)) {
        setMessage("Product description cannot be empty or only spaces.");
        return;
      }
      if (isBlank(urlPart)) {
        setMessage(
          "Product path cannot be empty. Please enter a path after the prefix."
        );
        return;
      }
      // Step 1️⃣ — Update visibility
      await axios.patch(
        `https://saaspro.softtrails.net/cms/pro/publish/visibility/${editId}`,
        { value: !!form.visibility }
      );

      // Step 2️⃣ — Update comingsoon (only if visible)
      if (form.visibility) {
        await axios.patch(
          `https://saaspro.softtrails.net/cms/pro/publish/comingsoon/${editId}`,
          { value: !!form.comingsoon }
        );
      } else {
        console.warn("Skipping comingsoon because visibility is false");
      }

      // Step 3️⃣ — Update product details
      const payload = {
        product_name: nameTrim,
        description: descriptionTrim,
        url: PATH_PREFIX + urlPart,
        product_no: form.product_no,
        image_url: form.image_url,
        ref_no: form.ref_no,
        document_id: form.document_id,

        // new icon metadata
        icon_url: form.icon_url,
        icon_ref_no: form.icon_ref_no,
        icon_id: form.icon_id,
      };

      await axios.patch(
        `https://saaspro.softtrails.net/cms/pro/content/updateContent/${editId}`,
        payload
      );

      // Step 4️⃣ — Update frontend state (use trimmed payload values)
      setProducts((prev) =>
        prev.map((p) => (p.product_id === editId ? { ...p, ...payload } : p))
      );

      setMessage("Product updated successfully!");
      setShowModal(false);
    } catch (err) {
      console.error("Error updating product:", err.response?.data || err);
      setMessage(
        err.response?.data?.message ||
          "Update failed! Please check backend rules or console."
      );
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setMessage("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // ensure product has a valid name before attaching image metadata
    if (isBlank(form.product_name)) {
      setMessage("Product name is required before uploading image.");
      return;
    }

    try {
      const uploadRes = await fetch(
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
            allow_doc_payload: {
              doc_name: "card logo",
              description: "logos",
            },
          }),
        }
      );

      const uploadData = await uploadRes.json();
      const publish_id = uploadData?.id || uploadData?.data?.id;

      if (!publish_id) {
        setMessage("Image registration failed.");
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
            user_id: form.created_by,
            document_name: form.product_name,
          },
        ])
      );

      // attach auth token from sessionStorage to the upload request
      const token = sessionStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const docRes = await fetch(
        "https://devdemo.softtrails.net/dmsapi/upload-documents",
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      const docData = await docRes.json();
      const uploadedFile = docData?.uploaded_files?.[0] || {};

      setForm((prev) => ({
        ...prev,
        image_url: uploadedFile.file_url || "",
        ref_no: uploadedFile.ref_no || "",
        document_id: uploadedFile.document_id || "",
      }));

      setMessage("Image uploaded! You can now update the content.");
    } catch (error) {
      setMessage("Image upload failed!");
    }
  };

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const token = sessionStorage.getItem("token");
      const userId = sessionStorage.getItem("user_id"); // ✅ Correct user reference

      // Step 1: Delete existing icon if exists
      if (form.icon_id) {
        await fetch(
          `https://devdemo.softtrails.net/dmsapi/documents/${form.icon_id}`,
          {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
      }

      // Step 2: Register icon metadata
      const uploadRes = await fetch(
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
              doctype: "CMS icon",
              description: "icon for product",
            },
            allow_doc_payload: { doc_name: "card icon", description: "icons" },
          }),
        }
      );

      const uploadData = await uploadRes.json();
      const publish_id = uploadData?.id || uploadData?.data?.id;

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
            user_id: userId, // 👈 Correct FK
            document_name: form.product_name + "_icon",
          },
        ])
      );

      const docRes = await fetch(
        "https://devdemo.softtrails.net/dmsapi/upload-documents",
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );

      const docData = await docRes.json();
      const uploaded = docData?.uploaded_files?.[0] || {};

      setForm((prev) => ({
        ...prev,
        icon_url: uploaded.file_url || "",
        icon_ref_no: uploaded.ref_no || "",
        icon_id: uploaded.document_id || "",
      }));
    } catch (err) {
      console.error("Icon upload error:", err);
    }
  };

  return (
    <>
      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mr-5 text-start">
        {products.map((product) => (
          <div
            key={product.product_id}
            className="mb-4 border rounded-lg p-4 shadow-lg bg-white"
          >
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-full h-[120px] object-cover rounded"
            />
            <h3 className="font-semibold mt-2 text-sm">
              {product.product_name}
            </h3>
            <p className="text-[10px] text-[#4A4A4A] leading-tight mt-1 h-[40px]">
              {product.description}
            </p>
            <div className="grid grid-cols-11 gap-2 mt-3">
              <Link
                to={`/product-show/${product.product_id}`}
                state={{ product }}
                className="col-span-7 rounded bg-[#005AE6] text-[12px] font-medium py-1 text-white flex items-center justify-center"
              >
                Explore
              </Link>
              <button
                onClick={() => openEditModal(product)}
                className="text-xs px-4 rounded col-span-2 flex flex-col items-center justify-end border-[#DDDDDD] border-[1px]"
              >
                <LuPencil size={12} />
                <span className="text-[10px] text-[#4D4D4D] py-0">Edit</span>
              </button>
              <button
                onClick={() => {
                  console.log("PDF button clicked, onOpenGuide:", onOpenGuide);
                  if (onOpenGuide) {
                    onOpenGuide(product);
                  }
                }}
                className="text-xs px-4 rounded col-span-2 flex flex-col items-center justify-end border-[#DDDDDD] border-[1px]"
              >
                <AiFillFilePdf size={12} />

                <span className="text-[10px] text-[#4D4D4D] py-0">pdf</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]">
          <div className="my-16 p-5 text-start space-y-4 border-[1px] border-[#DDDDDD] rounded-lg bg-white w-full max-w-xl relative shadow-lg">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-xl font-bold text-gray-700"
            >
              ×
            </button>

            <div
              className="overflow-y-auto scrollbar-hide"
              style={{ maxHeight: "600px" }}
            >
              <p className="text-[#00235A] font-semibold mb-4">
                Update Product
              </p>
              <form onSubmit={handleUpdate} className="space-y-4">
                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium py-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      placeholder="Product Name"
                      value={form.product_name}
                      onChange={handleChange}
                      className="block bg-[#F4F4F4] p-2 rounded-lg w-full text-sm text-[#8D8D8D]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium py-1">
                      Product Description
                    </label>
                    <textarea
                      name="description"
                      placeholder="Description"
                      value={form.description}
                      onChange={handleChange}
                      className="block bg-[#F4F4F4] p-2 rounded-lg w-full text-sm text-[#8D8D8D]"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="border border-[#DDDDDD] rounded-lg p-5 space-y-5 my-5">
                  <div className="space-y-3">
                    <label className="text-sm font-medium py-3">
                      Current Image
                    </label>
                    <img
                      src={form.image_url}
                      alt="Current"
                      className="w-full h-[200px] object-cover rounded"
                    />
                  </div>
                  <div
                    className="border-2 border-dashed border-[#000000] rounded-lg p-6 flex flex-col items-center justify-center text-center bg-white cursor-pointer hover:border-blue-400"
                    onClick={() =>
                      document.getElementById("update-image-input").click()
                    }
                  >
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
                        document.getElementById("update-image-input").click();
                      }}
                    >
                      Browse File
                    </span>
                    <input
                      id="update-image-input"
                      type="file"
                      accept=".jpeg,.jpg,.png,.pdf,.svg"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                  </div>
                </div>

                <div className="border border-[#DDDDDD] rounded-lg p-5 space-y-5 my-5">
                  <label className="text-sm font-medium py-1">
                    Current Icon
                  </label>
                  <img
                    src={form.icon_url}
                    alt="Current Icon"
                    className="w-20 h-20 object-cover rounded my-2"
                  />

                  <div
                    className="border-2 border-dashed border-[#000] rounded-lg p-6 flex flex-col items-center text-center cursor-pointer"
                    onClick={() =>
                      document.getElementById("edit-icon-input").click()
                    }
                  >
                    <p className="text-sm">Choose New Icon</p>
                    <input
                      id="edit-icon-input"
                      type="file"
                      accept=".jpeg,.jpg,.png,.svg"
                      onChange={handleIconUpload}
                      style={{ display: "none" }}
                    />
                  </div>
                </div>

                {/* URL + Toggles */}
                <div>
                  <label className="text-sm font-medium py-1">Path</label>
                  <div className="flex">
                    <span
                      className="bg-[#F4F4F4] p-2 rounded-l-lg border border-[#DDDDDD] border-r-0 text-gray-500 select-none"
                      style={{ fontSize: "12px", minWidth: "210px" }}
                    >
                      {PATH_PREFIX}
                    </span>
                    <input
                      type="text"
                      name="url"
                      placeholder="Enter path after products/"
                      value={(form.url || "").replace(PATH_PREFIX, "")}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          url: PATH_PREFIX + e.target.value.replace(/^\/+/, ""),
                        }))
                      }
                      className="block bg-[#F4F4F4] p-2 rounded-r-lg w-full text-sm text-[#8D8D8D] border border-[#DDDDDD] border-l-0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 my-5">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="visibility"
                      checked={form.visibility}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          visibility: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">Visibility</span>
                  </label>

                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.comingsoon}
                      disabled={!form.visibility}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          comingsoon: e.target.checked,
                        }))
                      }
                    />
                    <span className="text-sm">Coming Soon</span>
                  </label>
                </div>

                {/* Buttons */}
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
                    className="p-3 w-[200px] rounded-lg text-sm font-medium border border-[#000000]"
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
    </>
  );
}

export default OurProducts;
