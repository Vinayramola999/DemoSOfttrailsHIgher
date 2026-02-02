import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";
import { FaPencilAlt } from "react-icons/fa";
import { GoPencil } from "react-icons/go";

export default function SetupLicenseParameter() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [subModules, setSubModules] = useState([]);
  const [newSubModule, setNewSubModule] = useState({
    sub_module: "",
    checked: false,
    sub_lic: "",
    sub_id: null,
    isEdit: false,
  });
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Fetch products and submodules
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://saaspro.softtrails.net/cms/pro/publish/retriveContent"
        );
        const data = await res.json();
        if (data && Array.isArray(data.data)) {
          setProducts(data.data);
        } else {
          console.error("Unexpected response:", data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, []);

  // When a product is selected
  useEffect(() => {
    if (!selectedProduct) {
      setSubModules([]);
      return;
    }

    const found = products.find((p) => p.product_id === selectedProduct.value);
    if (found && Array.isArray(found.sub_modules)) {
      setSubModules(found.sub_modules);
    } else {
      setSubModules([]);
    }
  }, [selectedProduct, products]);

  const selectedProductDetails = products.find(
    (p) => p.product_id === selectedProduct?.value
  );

  // Add new submodules
  const handleNewSubModuleChange = (field, value) => {
    setNewSubModule((prev) => ({
      ...prev,
      [field]: field === "checked" ? value : value,
    }));
  };

  const hasOnlySpacesOrEmpty = (value) => {
    if (typeof value !== "string") {
      if (value == null) return true;
      if (typeof value === "number") value = String(value);
      if (typeof value === "object") return false;
    }
    return value.trim() === "";
  };

  const handleAddSubModule = async () => {
    if (!selectedProductDetails) {
      toast.error("Please select a product first!");
      return;
    }
    if (
      hasOnlySpacesOrEmpty(newSubModule.sub_module) ||
      hasOnlySpacesOrEmpty(newSubModule.sub_lic)
    ) {
      toast.error("Licence cannot be empty or only spaces");
      return;
    }
    setLoading(true);
    try {
      // If editing, update submodule
      if (newSubModule.isEdit && newSubModule.sub_id) {
        const payload = {
          sub_id: newSubModule.sub_id,
          product_id: selectedProductDetails.product_id,
          sub_module: newSubModule.sub_module,
          checked: Boolean(newSubModule.checked),
          sub_lic: newSubModule.sub_lic,
        };
        const res = await fetch(
          "https://saaspro.softtrails.net/cms/pro/content/subModule",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (res.ok) {
          // Update local state
          const refreshed = await fetch(
            "https://saaspro.softtrails.net/cms/pro/publish/retriveContent"
          );
          const data = await refreshed.json();
          const found = data.data?.find(
            (p) => p.product_id === selectedProductDetails.product_id
          );
          if (found && Array.isArray(found.sub_modules)) {
            setSubModules(found.sub_modules);
          }
          setNewSubModule({
            sub_module: "",
            checked: false,
            sub_lic: "",
            sub_id: null,
            isEdit: false,
          });
          setEditIndex(null);
          toast.success("Licence updated successfully!");
        } else {
          toast.error("Failed to update Licence!");
          console.error(await res.text());
        }
      } else {
        // Add new submodule
        const payload = {
          product_id: selectedProductDetails.product_id,
          sub_module: newSubModule.sub_module,
          checked: Boolean(newSubModule.checked),
          sub_lic: newSubModule.sub_lic,
        };
        const res = await fetch(
          "https://saaspro.softtrails.net/cms/pro/content/subModule",
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );
        if (res.ok) {
          // Fetch latest submodules from backend
          const refreshed = await fetch(
            "https://saaspro.softtrails.net/cms/pro/publish/retriveContent"
          );
          const data = await refreshed.json();
          const found = data.data?.find(
            (p) => p.product_id === selectedProductDetails.product_id
          );
          if (found && Array.isArray(found.sub_modules)) {
            setSubModules(found.sub_modules);
          }
          setNewSubModule({
            sub_module: "",
            checked: false,
            sub_lic: "",
            sub_id: null,
            isEdit: false,
          });
          toast.success("Licence added successfully!");
        } else {
          toast.error("Failed to add Licence!");
          console.error(await res.text());
        }
      }
    } catch (err) {
      console.error("Error saving Licence:", err);
      toast.error("Error while saving Licence.");
    } finally {
      setLoading(false);
    }
  };

  // handleSaveNew removed: obsolete after refactor

  // Edit submodule
  const handleEdit = (index) => {
    // Move submodule data to newSubModule for editing in the form
    const sub = subModules[index];
    setNewSubModule({
      sub_module: sub.sub_module,
      checked: sub.checked ?? false,
      sub_lic: sub.sub_lic ?? "",
      sub_id: sub.sub_id,
      isEdit: true,
    });
    setEditIndex(index);
  };

  // Removed unused editValues and handleUpdate logic

  // Delete submodule
  const handleDelete = async (index) => {
    const sub = subModules[index];
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${sub.sub_module}"?`
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `https://saaspro.softtrails.net/cms/pro/content/subModule/${sub.sub_id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.ok) {
        const updated = subModules.filter((_, i) => i !== index);
        setSubModules(updated);
        toast.success("Licence deleted successfully!");
      } else {
        toast.error("Failed to delete Licence!");
        console.error(await res.text());
      }
    } catch (err) {
      console.error("Error deleting Licence:", err);
    }
  };

  // Build options for react-select
  const options = products.map((p) => ({
    value: p.product_id,
    label: p.product_name,
  }));

  return (
    <div className="p-[1px] mb-4">
      <ToastContainer
        position="top-right"
        autoClose={4000}
        containerStyle={{ marginTop: "60px" }}
      />
      <div className="fixed bg-[#FAF9F6] w-full ">
        <p className="text-gray-700 font-medium pt-2 py-2">Product</p>
        {/* Searchable Dropdown */}
        <div className="w-[300px] border border-[#D1D5DB] rounded-lg ">
          <Select
            options={options}
            value={selectedProduct}
            onChange={setSelectedProduct}
            placeholder="Search or select a product..."
            isSearchable
          />
        </div>
      </div>

      {/* Form Section */}
      {selectedProductDetails && (
        <div className="bg-white mt-24 px-6 py-4 border border-gray-300 rounded-lg w-[550px] overflow-y-scroll scrollbar-hide mb-28">
          <div className="mb-2">
            {/* <span className="font-semibold">Product Name:</span>{" "} */}
            <p className="font-semibold text-[#111827]">
              {selectedProductDetails.product_name}
            </p>
          </div>
          <div className="mb-2">
            <p className="text-[#6B7280]">
              <span>Product ID:</span> {selectedProductDetails.product_id}
            </p>
          </div>

          {/* Existing Submodules */}
          <div className="mt-5">
            <h4 className="font-medium text-[#111827] my-2">
              Existing Licence Parameter
            </h4>
            {subModules.length > 0 ? (
              subModules.map((sub, index) => (
                <div
                  key={sub.sub_id || index}
                  className="mb-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                >
                  {/* Only show display mode, edit is handled in the form below */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="">
                      <label className="text-[#6B7280] text-[10px]">
                        On Website
                      </label>
                      <p className="text-sm font-medium">{sub.sub_module}</p>
                    </div>
                    <div>
                      <label className="text-[#6B7280] text-[10px]">
                        For Developers
                      </label>
                      <p className="text-sm font-medium">{sub.sub_lic ?? ""}</p>
                    </div>
                    <div>
                      <button onClick={() => handleEdit(index)} className="">
                        <GoPencil color="blue" size={20} />
                      </button>
                    </div>
                  </div>
                  <label className="">
                    {sub.checked ? (
                      <p className=" px-3 py-1 bg-[#DCFCE7] w-16 flex items-center justify-center rounded-full">
                        <span className="text-[10px] font-medium text-[#166534]">
                          Active
                        </span>
                      </p>
                    ) : (
                      <p className=" px-3 py-1 bg-[#f447471c] w-16 flex items-center justify-center rounded-full">
                        <span className="text-[10px] font-medium text-[#e41919]">
                          Inactive
                        </span>
                      </p>
                    )}
                  </label>
                  {/* <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 text-white px-3 py-1 rounded ml-2 hover:bg-red-600 transition"
                  >
                    Delete
                  </button> */}
                </div>
              ))
            ) : (
              <p>No submodules found for this product.</p>
            )}
          </div>

          {/* Add/Edit Submodules */}
          <div className="mt-4 ">
            <h4 className="font-medium text-[#111827] ">
              {newSubModule.isEdit
                ? "Edit Licence Parameter"
                : "Add New Licence Parameter"}
            </h4>
            <div className="mt-2 space-y-4 ">
              <div className="flex flex-col gap-1 ">
                <label className="text-[#374151] font-medium">On Website</label>
                <input
                  type="text"
                  placeholder="Licence Parameter"
                  value={newSubModule.sub_module}
                  onChange={(e) =>
                    handleNewSubModuleChange("sub_module", e.target.value)
                  }
                  className=" px-4 py-2 border border-[#D1D5DB] rounded-lg text-[12px]"
                />
              </div>
              <div className="flex flex-col gap-1  ">
                <label className="text-[#374151]  font-medium">
                  For Developers
                </label>
                <input
                  type="text"
                  placeholder="Licence Parameter"
                  value={newSubModule.sub_lic}
                  onChange={(e) =>
                    handleNewSubModuleChange("sub_lic", e.target.value)
                  }
                  className=" px-4 py-2 border border-[#D1D5DB] rounded-lg text-[12px]"
                />
              </div>
              <label className="mr-2 gap-2 flex items-center">
                <input
                  type="checkbox"
                  checked={newSubModule.checked}
                  onChange={(e) =>
                    handleNewSubModuleChange("checked", e.target.checked)
                  }
                  className="mr-1"
                />
                <p className="text-[#374151] text-sm">Visible On Website</p>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAddSubModule}
                className="mt-2 bg-[#2563EB] text-white text-sm py-3 rounded-lg w-full"
                disabled={loading}
              >
                {loading
                  ? newSubModule.isEdit
                    ? "Updating..."
                    : "Adding..."
                  : newSubModule.isEdit
                  ? "Update"
                  : "Add"}
              </button>
              {newSubModule.isEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setNewSubModule({
                      sub_module: "",
                      checked: false,
                      sub_lic: "",
                      sub_id: null,
                      isEdit: false,
                    });
                    setEditIndex(null);
                  }}
                  className="mt-2 bg-gray-400 text-white text-sm py-3 rounded-lg w-full"
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Save Button removed: not needed */}
        </div>
      )}
    </div>
  );
}
