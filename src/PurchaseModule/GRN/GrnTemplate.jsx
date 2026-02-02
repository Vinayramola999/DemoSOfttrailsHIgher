import React from "react";

const GrnTemplate = ({ grn = {} }) => {
  // Debug logging
  console.log("🔍 GrnTemplate received grn prop:", grn);
  console.log("🔍 GrnTemplate items:", grn.items);
  console.log("🔍 GrnTemplate vendor_name:", grn.vendor_name);
  console.log("🔍 GrnTemplate supplier_contact:", grn.supplier_contact);
  
  // ✅ Handle both array formats from API or local data
  const items = Array.isArray(grn.items) 
    ? grn.items 
    : Array.isArray(grn.received_items) 
      ? grn.received_items 
      : [];
  
  console.log("🔍 GrnTemplate parsed items array:", items);
  console.log("🔍 GrnTemplate final data:", {
    po_id: grn.po_id,
    grn_id: grn.grn_id,
    vendor_name: grn.vendor_name,
    supplier_contact: grn.supplier_contact,
    itemsCount: items.length,
  });
  
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

  const totalAmount = items.reduce(
    (s, it) => {
      const unitPrice = Number(it.unit_price ?? it.unitPrice ?? it.rate ?? it.price ?? 0);
      const qtyReceived = Number(it.qty_received ?? it.quantity_received ?? it.quantity ?? it.qty ?? 0);
      return s + (unitPrice * qtyReceived);
    },
    0
  );
  const totalItems = items.reduce((s, it) => {
    const qtyReceived = Number(it.qty_received ?? it.quantity_received ?? it.quantity ?? it.qty ?? 0);
    return s + qtyReceived;
  }, 0);

  // PDF-friendly inline styles
  const containerStyle = {
    fontFamily: "Arial, Helvetica, sans-serif",
    backgroundColor: "#ffffff",
    color: "#000000",
    padding: "20px",
    width: "100%",
    minHeight: "600px",
    lineHeight: "1.4",
    visibility: "visible",
    display: "block",
    overflow: "visible",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "24px",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  };

  const hrStyle = {
    borderTop: "2px solid #000000",
    margin: "12px 0",
  };

  const sectionHeaderStyle = {
    fontWeight: "600",
    fontSize: "12px",
    borderBottom: "1px solid #cccccc",
    paddingBottom: "4px",
    marginTop: "12px",
    marginBottom: "8px",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "11px",
    marginBottom: "12px",
  };

  const thStyle = {
    backgroundColor: "#003366",
    color: "#ffffff",
    padding: "8px",
    border: "1px solid #666666",
    textAlign: "left",
    fontWeight: "bold",
  };

  const tdStyle = {
    padding: "6px 8px",
    border: "1px solid #cccccc",
    verticalAlign: "top",
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={titleStyle}>GOODS RECEIVED NOTE</div>
        <div style={hrStyle} />
      </div>

      {/* GRN Info */}
      <div style={{ marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
        <div style={{ fontSize: "12px" }}>
          <div><strong>GRN NUMBER:</strong> {grn.grn_id || "Auto-Generated"}</div>
          <div><strong>DATE:</strong> {formatDate(grn.date || grn.created_at || grn.generated_date)}</div>
        </div>
        <div style={{ fontSize: "12px", textAlign: "right" }}>
          <div><strong>PO ID:</strong> {grn.po_id || "N/A"}</div>
          <div><strong>Quotation ID:</strong> {grn.quotation_id || "N/A"}</div>
          {grn.rfp_id && <div><strong>RFP ID:</strong> {grn.rfp_id}</div>}
        </div>
      </div>

      {/* Delivery & Supplier Info */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "16px" }}>
        <div style={{ flex: 1 }}>
          <div style={sectionHeaderStyle}>DELIVERY INFORMATION:</div>
          <div style={{ fontSize: "11px" }}>
            <div><strong>Delivery Note:</strong> {grn.delivery_note || "N/A"}</div>
            <div><strong>Delivery Date:</strong> {formatDate(grn.delivery_date)}</div>
            <div><strong>Carrier:</strong> {grn.carrier || "N/A"}</div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={sectionHeaderStyle}>SUPPLIER INFORMATION:</div>
          <div style={{ fontSize: "11px" }}>
            <div><strong>Supplier:</strong> {grn.vendor_name || grn.supplier_name || grn.supplier || "No Data"}</div>
            <div><strong>Address:</strong> {grn.supplier_address || grn.address || "N/A"}</div>
            <div><strong>Contact:</strong> {grn.supplier_contact || grn.vendor_contact_name || grn.contact || "N/A"}</div>
            {grn.supplier_email && <div><strong>Email:</strong> {grn.supplier_email}</div>}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div style={{ marginBottom: "16px" }}>
        <div style={sectionHeaderStyle}>RECEIVED ITEMS</div>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "4%" }}>S.NO</th>
              <th style={{ ...thStyle, width: "18%" }}>ITEM NAME</th>
              <th style={{ ...thStyle, width: "14%" }}>DESCRIPTION</th>
              <th style={{ ...thStyle, width: "6%", textAlign: "center" }}>UOM</th>
              <th style={{ ...thStyle, width: "8%", textAlign: "right" }}>QTY ORDERED</th>
              <th style={{ ...thStyle, width: "8%", textAlign: "right" }}>QTY RECEIVED</th>
              <th style={{ ...thStyle, width: "11%", textAlign: "right" }}>UNIT PRICE</th>
              <th style={{ ...thStyle, width: "11%", textAlign: "right" }}>TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td style={{ ...tdStyle, textAlign: "center" }} colSpan={8}>
                  No items received
                </td>
              </tr>
            ) : (
              items.map((it, idx) => {
                const qtyReceived = Number(it.qty_received ?? it.quantity_received ?? it.quantity ?? it.qty ?? 0);
                const qtyOrdered = Number(it.qty_ordered ?? it.quantity ?? it.qty ?? 0);
                const unitPrice = Number(it.unit_price ?? it.unitPrice ?? it.rate ?? it.price ?? 0);
                const lineTotal = qtyReceived * unitPrice;
                
                const itemName = it.asset_name || it.name || it.item_name || it.description || "N/A";
                const itemDesc = it.description || it.desc || "";
                const uom = it.uom || it.unit || it.unit_of_measure || "N/A";
                
                console.log(`🔍 Item ${idx}:`, {
                  asset_name: itemName,
                  description: itemDesc,
                  qty_received: qtyReceived,
                  qty_ordered: qtyOrdered,
                  unit_price: unitPrice
                });
                
                return (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#f5f5f5" }}>
                    <td style={tdStyle}>{idx + 1}</td>
                    <td style={tdStyle}>{itemName}</td>
                    <td style={tdStyle}>{itemDesc || "N/A"}</td>
                    <td style={{ ...tdStyle, textAlign: "center" }}>{uom}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>{qtyOrdered || "N/A"}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>{qtyReceived || "N/A"}</td>
                    <td style={{ ...tdStyle, textAlign: "right" }}>{unitPrice ? formatCurrency(unitPrice) : "N/A"}</td>
                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: "bold" }}>{lineTotal ? formatCurrency(lineTotal) : "N/A"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "24px", marginTop: "12px", paddingTop: "8px", borderTop: "1px solid #cccccc" }}>
          <div style={{ fontSize: "12px", fontWeight: "600" }}>
            <div><strong>TOTAL ITEMS:</strong> {totalItems}</div>
            <div style={{ marginTop: "8px", fontSize: "14px" }}><strong>TOTAL AMOUNT:</strong> {formatCurrency(totalAmount)}</div>
          </div>
        </div>
      </div>

      {/* Received Condition */}
      <div style={{ marginBottom: "16px" }}>
        <div style={sectionHeaderStyle}>RECEIVED CONDITION:</div>
        <div style={{ minHeight: "40px", border: "1px solid #cccccc", padding: "12px", backgroundColor: "#f9f9f9", fontSize: "11px" }}>
          {grn.received_condition || "Good / As per PO"}
        </div>
      </div>

      {/* Comments */}
      <div style={{ marginBottom: "16px" }}>
        <div style={sectionHeaderStyle}>COMMENTS:</div>
        <div style={{ minHeight: "60px", border: "1px solid #cccccc", padding: "12px", backgroundColor: "#f9f9f9", fontSize: "11px" }}>
          {grn.comments || grn.remarks || "No comments"}
        </div>
      </div>

      {/* Signature Section */}
      <div style={{ marginTop: "32px", fontSize: "11px", borderTop: "1px solid #cccccc", paddingTop: "16px" }}>
        <div style={{ marginBottom: "12px" }}><strong>RECEIVED BY:</strong> {grn.received_by || "N/A"}</div>
        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "4px" }}>Name: ______________________</div>
            <div>Signature: ______________________</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: "4px" }}>Department: ______________________</div>
            <div>Date: ______________________</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrnTemplate;