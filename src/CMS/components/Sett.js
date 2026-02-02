import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Sett() {
  const [products, setProducts] = useState([]);
  const [plans, setPlans] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState(null);
  const [error, setError] = useState("");

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          "https://saaspro.softtrails.net/cms/pro/publish/retriveContent"
        );
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.data || [];
        setProducts(arr);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, []);

  // Fetch plans (GLOBAL first, then PRODUCT specific)
  useEffect(() => {
    const fetchPlans = async () => {
      const product = products[activeTab];
      if (!product?.product_id) return;

      try {
        // -------------------------------------------
        // 1) Fetch GLOBAL PLANS from license-plans API
        // -------------------------------------------
        let globalPlans = [];
        try {
          const res = await fetch(
            "https://saaspro.softtrails.net/saas/softsub/pro/api/license-plans"
          );
          const text = await res.text();
          let parsed = text ? JSON.parse(text) : [];
          const arr = Array.isArray(parsed) ? parsed : parsed.data || [];

          globalPlans = arr.map((p) => ({
            planName: p.planName || p.name || "Unnamed Plan",
            price:
              p.price !== undefined && p.price !== null && p.price !== ""
                ? Number(p.price)
                : p.amount !== undefined
                ? Number(p.amount)
                : 0,
            durationDays:
              p.durationDays !== undefined &&
              p.durationDays !== null &&
              p.durationDays !== ""
                ? Number(p.durationDays)
                : p.duration !== undefined
                ? Number(p.duration)
                : 0,
            submodules: p.submodules || p.sub_modules || [],
          }));
        } catch (err) {
          console.warn("Failed to load global plans.");
        }

        // ----------------------------------------------------
        // 2) Fetch PRODUCT-SPECIFIC PLANS for this product
        // ----------------------------------------------------
        let productPlans = [];
        try {
          const res2 = await fetch(
            `https://saaspro.softtrails.net/saas/softsub/pro/product-license-plans/panel/product?id=${product.product_id}`
          );
          const text2 = await res2.text();

          if (text2) {
            let parsed2 = JSON.parse(text2);
            const arr2 = Array.isArray(parsed2) ? parsed2 : parsed2.data || [];

            productPlans = arr2
              .filter((d) => String(d.productId) === String(product.product_id))
              .map((p) => ({
                planName: p.planName || p.name || "Unnamed Plan",
                price:
                  p.price !== undefined && p.price !== null
                    ? Number(p.price)
                    : 0,
                durationDays:
                  p.durationDays !== undefined && p.durationDays !== null
                    ? Number(p.durationDays)
                    : 0,
                submodules: p.submodules || [],
              }));
          }
        } catch (err) {
          console.warn("Failed to load product-specific plans.");
        }

        // ---------------------------------------------------------
        // 3) MERGE: product-specific overrides global plan by name
        // ---------------------------------------------------------
        let merged = [...globalPlans];

        productPlans.forEach((pp) => {
          const index = merged.findIndex(
            (g) => String(g.planName) === String(pp.planName)
          );
          if (index >= 0) merged[index] = pp;
          else merged.push(pp);
        });

        setPlans(merged);
      } catch (err) {
        console.error("Error fetching plans:", err);
      }
    };

    fetchPlans();
  }, [products, activeTab]);

  // Open edit popup and merge saved submodules
  const handleEdit = async (plan) => {
    const product = products[activeTab];
    if (!product) return;
    let price = "";
    let durationDays = "";
    let savedSubmodules = [];

    try {
      const res = await fetch(
        `https://saaspro.softtrails.net/saas/softsub/pro/product-license-plans/panel/product?id=${product.product_id}`
      );
      const text = await res.text();
      if (text) {
        const parsed = JSON.parse(text);
        const dataArr = Array.isArray(parsed) ? parsed : parsed.data || [];
        const match = dataArr.find(
          (d) =>
            String(d.planName) === String(plan.planName) &&
            String(d.productId) === String(product.product_id)
        );
        if (match) {
          price = match.price || "";
          durationDays = match.durationDays || "";
          savedSubmodules = match.submodules || [];
        }
      }
    } catch {
      console.warn("Could not fetch plan details.");
    }

    const mergedSubmodules =
      product.sub_modules?.map((sm) => {
        const existing = savedSubmodules.find(
          (s) => s.submoduleName === sm.sub_module
        );
        return {
          id: existing?.id || null,
          sub_id: sm.sub_id,
          submoduleName: sm.sub_module,
          sub_lic: existing?.sublic || sm.sub_lic || "",
          checked: sm.checked,
          updated_at: sm.updated_at,
          noOfLimit: existing?.noOfLimit || "",
        };
      }) || [];

    setEditData({
      productId: product.product_id,
      productName: product.product_name,
      planName: plan.planName,
      price,
      durationDays,
      submodules: mergedSubmodules,
    });

    setShowEdit(true);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmoduleChange = (index, value) => {
    setEditData((prev) => {
      const subs = [...prev.submodules];
      subs[index].noOfLimit = value;
      return { ...prev, submodules: subs };
    });
  };

  const hasOnlySpacesOrEmpty = (value) => {
    if (typeof value !== "string") {
      if (value == null) return true;
      if (typeof value === "number") value = String(value);
      if (typeof value === "object") return false;
    }
    return value.trim() === "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation: price, durationDays and each submodule limit must not be empty or only spaces
    if (!editData) {
      toast.error("No data to save");
      return;
    }

    if (
      hasOnlySpacesOrEmpty(editData.price) ||
      hasOnlySpacesOrEmpty(editData.durationDays)
    ) {
      const msg = "Price and Duration cannot be empty or only spaces.";
      setError(msg);
      toast.error(msg);
      return;
    }

    const invalidSub = editData.submodules.some((s) =>
      hasOnlySpacesOrEmpty(s.noOfLimit)
    );
    if (invalidSub) {
      const msg = "Licence limits cannot be empty or only spaces.";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      const payload = { ...editData };

      const hasExisting = payload.submodules.some((s) => s.id);
      const method = hasExisting ? "PUT" : "POST";

      const res = await fetch(
        "https://saaspro.softtrails.net/saas/softsub/pro/product-license-plans/panel",
        {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to save plan");

      setPlans((prev) =>
        prev.map((pl) =>
          String(pl.planName) === String(payload.planName)
            ? {
                ...pl,
                price:
                  payload.price !== undefined
                    ? Number(payload.price)
                    : pl.price,
                durationDays:
                  payload.durationDays !== undefined
                    ? Number(payload.durationDays)
                    : pl.durationDays,
              }
            : pl
        )
      );

      setShowEdit(false);
      toast.success("Plan saved successfully!");
    } catch (err) {
      console.error(err);
      const msg = err.message || "Error occurred";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={4000}
        containerStyle={{ marginTop: "60px" }}
      />
      {/* Product Tabs */}
      <div className="z-10 bg-[#FAF9F6] py-4 fixed w-full">
        <div className="flex flex-wrap">
          {products.map((product, idx) => (
            <button
              key={product.product_id || idx}
              onClick={() => setActiveTab(idx)}
              className={`cursor-pointer py-2 px-6 rounded-full text-sm font-medium transition ${
                idx === activeTab
                  ? "bg-gradient-to-r from-[#005AE6] to-[#003280] text-white"
                  : "text-black"
              }`}
            >
              {product.product_name}
            </button>
          ))}
        </div>
      </div>

      {/* Plans */}
      <div className="py-32">
        {products[activeTab] && (
          <div className="space-y-4">
            {plans.map((plan, i) => (
              <div
                key={i}
                className="relative border rounded-2xl p-5 shadow-sm w-[1000px] bg-white"
              >
                <button
                  className="absolute top-3 right-3 bg-[#F2F2F2] p-2 rounded-full shadow hover:scale-110 transition"
                  onClick={() => handleEdit(plan)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="#000"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="m5 16l-1 4l4-1L19.586 7.414a2 2 0 0 0 0-2.828l-.172-.172a2 2 0 0 0-2.828 0zM15 6l3 3m-5 11h8"
                    />
                  </svg>
                </button>
                <h4 className="text-lg font-semibold">{plan.planName}</h4>
                <div className="flex gap-6 text-sm mt-2">
                  <p>
                    Duration:
                    <span className="text-blue-600 ml-1 font-semibold">
                      {plan.durationDays || 0} days
                    </span>
                  </p>
                  <p>
                    Pricing:
                    <span className="text-blue-600 ml-1 font-semibold">
                      ₹{plan.price || 0}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Popup */}
      {showEdit && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 p-6 bg-white rounded-2xl shadow-md w-full max-w-lg relative"
          >
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ×
            </button>

            <div>
              <label className="block font-medium mb-1">Product ID</label>
              <input
                readOnly
                value={editData.productId}
                className="w-full border px-2 py-1 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Product Name</label>
              <input
                readOnly
                value={editData.productName}
                className="w-full border px-2 py-1 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Plan Name</label>
              <input
                readOnly
                value={editData.planName}
                className="w-full border px-2 py-1 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={editData.price}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Duration (Days)</label>
              <input
                type="number"
                name="durationDays"
                value={editData.durationDays}
                onChange={handleChange}
                className="w-full border px-2 py-1 rounded"
              />
            </div>

            <div>
              <label className="block font-medium mb-2">
                Licence Perameters
              </label>
              {editData.submodules.length === 0 ? (
                <p className="text-gray-500 text-sm">No Licence found.</p>
              ) : (
                editData.submodules.map((sub, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <input
                      readOnly
                      value={sub.submoduleName}
                      className="flex-1 border px-2 py-1 rounded bg-gray-100"
                    />
                    <input
                      readOnly
                      value={sub.sub_lic}
                      className="w-32 border px-2 py-1 rounded bg-gray-100"
                      title="Sub License"
                    />
                    <input
                      type="checkbox"
                      checked={sub.checked}
                      readOnly
                      className="w-5 h-5"
                      title="Checked"
                    />

                    <input
                      type="text"
                      placeholder="Limit"
                      value={sub.noOfLimit}
                      onChange={(e) => handleSubmoduleChange(i, e.target.value)}
                      className="w-24 border px-2 py-1 rounded"
                    />
                  </div>
                ))
              )}
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
