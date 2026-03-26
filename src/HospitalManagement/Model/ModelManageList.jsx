import React, { useState } from "react";

const ModelManageList = ({
  showModal,
  setShowModal,
  handleSubmit,
  form,
  handleFormChange,
  isEdit,
  serviceTypes = [],
  consumableTypes = [],
  inventoryItems = [],
}) => {
  const [localError, setLocalError] = useState('');
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className="relative bg-white"
        style={{
          width: 774,
          border: "1px solid rgba(221, 221, 221, 1)",
          background: "rgba(255, 255, 255, 1)",
          opacity: 1,
          padding: 20,
          borderRadius: 8,
        }}
      >
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-3 right-3 hover:bg-gray-100 rounded-full"
          aria-label="Close"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="15" cy="15" r="15" fill="#FF3A3A" />
            <path
              d="M20.2426 11.7574L16 16M16 16L11.7574 20.2426M16 16L20.2426 20.2426M16 16L11.7574 11.7574"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Title */}
        <h2
          style={{
            position: "absolute",
            top: 18,
            left: 22,
            width: 95,
            height: 19,
            fontFamily: "Inter, sans-serif",
            fontWeight: 600,
            fontSize: 16,
            lineHeight: "100%",
            color: "#1B3A6B",
            letterSpacing: 0,
            opacity: 1,
          }}
        >
          Manage List
        </h2>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Client-side validation for Consumables
            if (form.chargeTypeName === 'Consumables') {
              if (!form.itemId) {
                setLocalError('Please select an item for consumable');
                return;
              }
            }
            setLocalError('');
            handleSubmit(form);
          }}
          style={{
            marginTop: 48,
          }}
        >
          {/* ---------- Row 1 ---------- */}
          <div style={{ display: "flex", gap: 22, marginBottom: 18 }}>
            {/* Charge Type */}
            <div style={{ width: 300, height: 57 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#444", marginBottom: 4, display: "block" }}>
                Charge Type
              </label>
              <select
                name="chargeTypeName"
                value={form.chargeTypeName || ""}
                onChange={handleFormChange}
                style={{ width: "100%", height: 32, borderRadius: 8, border: "1px solid #DDD", padding: "0 12px", fontSize: 14 }}
                required
              >
                <option value="Services">Services</option>
                <option value="Consumables">Consumables</option>
              </select>
            </div>

            {/* Conditionally show Consumable Type or Service Type (use id values) */}
            {form.chargeTypeName === "Consumables" ? (
              <div style={{ width: 300, height: 67 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: "#444", marginBottom: 2, display: "block" }}>
                  Consumable Type
                </label>
                <select
                  name="consumableType"
                  value={form.consumableType || ""}
                  onChange={handleFormChange}
                  style={{ width: "100%", height: 32, borderRadius: 8, border: "1px solid #DDD", padding: "0 12px", fontSize: 14 }}
                >
                  <option value="">Select consumable</option>
                  {Array.isArray(consumableTypes) && consumableTypes.map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.name}</option>
                  ))}

                </select>
              </div>
            ) : (
              <div style={{ width: 300, height: 57 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: "#444", marginBottom: 4, display: "block" }}>
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={form.serviceType || ""}
                  onChange={handleFormChange}
                  style={{ width: "100%", height: 32, borderRadius: 8, border: "1px solid #DDD", padding: "0 12px", fontSize: 14 }}
                >
                  <option value="">Select service</option>
                  {Array.isArray(serviceTypes) && serviceTypes.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Name */}
            <div style={{ width: 300, height: 57 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#444", marginBottom: 4, display: "block" }}>
                Name<span style={{ color: "#FF4D4F" }}>*</span>
              </label>
              <input
                name="name"
                value={form.name || ""}
                onChange={handleFormChange}
                placeholder="Enter name"
                required
                style={{ width: "100%", height: 32, borderRadius: 8, border: "1px solid #DDD", padding: "0 12px", fontSize: 14 }}
              />
            </div>
          </div>

          {/* ---------- Row 2 ---------- */}
          <div style={{ display: "flex", gap: 22, marginBottom: 22 }}>
            {/* UOM */}
            <div style={{ width: 177, height: 57 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#444", marginBottom: 4, display: "block" }}>
                UOM
              </label>
              <input
                name="uom"
                value={form.uom || ""}
                onChange={handleFormChange}
                placeholder="Enter UOM"
                style={{ width: "100%", height: 32, borderRadius: 8, border: "1px solid #DDD", padding: "0 12px", fontSize: 14 }}
              />
            </div>

            {/* Charge */}
            <div style={{ width: 177, height: 57 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: "#444", marginBottom: 4, display: "block" }}>
                Charge
              </label>
              <input
                type="number"
                name="charge"
                value={form.charge || ""}
                onChange={handleFormChange}
                placeholder="₹ 0.00"
                min={0}
                style={{ width: "100%", height: 32, borderRadius: 8, border: "1px solid #DDD", padding: "0 12px", fontSize: 14 }}
              />
            </div>

            {/* Item Dropdown (Consumables Only) */}
            {form.chargeTypeName === "Consumables" && (
              <div style={{ width: 177, height: 57 }}>
                <label style={{ fontSize: 14, fontWeight: 500, color: "#444", marginBottom: 4, display: "block" }}>
                  Item<span style={{ color: "#FF4D4F" }}>*</span>
                </label>
                <select
                  name="itemId"
                  value={form.itemId || ""}
                  onChange={handleFormChange}
                  style={{ width: "100%", height: 32, borderRadius: 8, border: "1px solid #DDD", padding: "0 12px", fontSize: 14 }}
                  required
                >
                  <option value="">Select Item</option>
                  {Array.isArray(inventoryItems) && inventoryItems.map((item) => (
                    <option key={item.itemId} value={item.itemId}>
                      {item.itemName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ---------- Description ---------- */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 500, color: "#444", marginBottom: 4, display: "block" }}>
              Description
            </label>
            <textarea
              name="description"
              value={form.description || ""}
              onChange={handleFormChange}
              placeholder="Enter description"
              style={{ width: "100%", height: 120, borderRadius: 8, border: "1px solid #DDD", padding: "12px", fontSize: 14, resize: "none" }}
              rows={4}
            />
          </div>

          {/* ---------- Buttons ---------- */}
          <div style={{ display: "flex", gap: 22, marginTop: 40 }}>
            {localError && (
              <div style={{ color: '#FF4D4F', fontWeight: 600, marginRight: 12 }}>{localError}</div>
            )}
            <button
              type="submit"
              style={{
                width: 198,
                height: 40,
                borderRadius: 8,
                background: "#0056FF",
                color: "#fff",
                fontWeight: 600,
                fontSize: 16,
                border: "none",
                cursor: "pointer",
                opacity: 1,
                transition: "background 0.5s ease-out",
              }}
            >
              {isEdit ? "Update" : "Add"}
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                width: 198,
                height: 40,
                borderRadius: 8,
                background: "#fff",
                color: "#000",
                fontWeight: 600,
                fontSize: 16,
                border: "1px solid #DDD",
                cursor: "pointer",
                opacity: 1,
                transition: "background 0.5s ease-out",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModelManageList;

