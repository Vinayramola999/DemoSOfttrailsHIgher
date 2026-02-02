

import { useEffect } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import templateBg from "../../assests/template.jpg";
import softTrailsLogo from "../../assests/SoftTrails.png";

/**
 * Formats an ISO date string (YYYY-MM-DD) to a readable format (DD MMM YYYY)
 * @param {string} dateString - ISO date string or any date string
 * @returns {string} Formatted date string or empty string if invalid
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (error) {
    return dateString; // Return original string if parsing fails
  }
};

/**
 * Safely extracts a value from rfpData with fallback
 * @param {object} rfpData - The RFP data object
 * @param {string|string[]} keys - Single key or array of keys to try
 * @param {string} fallback - Fallback value (default: empty string)
 * @returns {string} The extracted value or fallback
 */
const safeGet = (rfpData, keys, fallback = "") => {
  if (!rfpData) return fallback;
  const keyArray = Array.isArray(keys) ? keys : [keys];
  for (const key of keyArray) {
    if (rfpData[key] !== undefined && rfpData[key] !== null && rfpData[key] !== "") {
      return String(rfpData[key]);
    }
  }
  return fallback;
};

export async function RfpTemplate(rfpData = {}) {
  // Accept either rfpData prop or formData (for backward compatibility)
  console.log("🚀 RfpTemplate STARTED - formData:", rfpData);
  const formData = rfpData || {};

  // Extract all values dynamically with safe fallbacks (no hardcoded defaults)
  const rfpId = safeGet(formData, ["rfpId", "rfp_id", "RFP_ID"]);
  const indentId = safeGet(formData, ["indentId", "indent_id", "id"]);
  const organization = safeGet(formData, ["organization", "Organization_Name"]);
  const address = "2/1 Rajpur road Survey Chowk, Dehradun. 248001" || safeGet(formData, ["address", "Address"]);
  const title = safeGet(formData, ["title", "Title"]);
  
  // Handle description - can be string or object with description/notes
  let description = "";
  if (formData?.additional_description) {
    const addDesc = formData.additional_description;
    if (typeof addDesc === "object") {
      description = safeGet(addDesc, ["description", "Description"]) || "";
      const notes = safeGet(addDesc, ["notes", "Notes"]);
      if (notes) {
        description = description ? `${description}\n\n${notes}` : notes;
      }
    } else {
      description = String(addDesc);
    }
  } else {
    description = safeGet(formData, ["description", "Description"]);
  }
  
  // Handle dates - format from ISO strings if needed
  const issuedDateRaw = safeGet(formData, ["issuedDate", "Start_Date", "issueDate", "startDate"]);
  const issueDate = issuedDateRaw ? formatDate(issuedDateRaw) : "";
  
  const dueDateRaw = safeGet(formData, ["dueDate", "End_Date", "endDate"]);
  const endDate = dueDateRaw ? formatDate(dueDateRaw) : "";
  
  // Open date defaults to issue date if not provided
  const openDateRaw = safeGet(formData, ["openDate", "open_date"]);
  const openDate = openDateRaw ? formatDate(openDateRaw) : issueDate;
  
  // Logo handling - prefer logoBase64 (fastest, no CORS), then logoUrl
  let logoBase64 = safeGet(formData, ["logoBase64"]);
  let logoUrl = safeGet(formData, ["logoUrl", "Logo", "logo", "logoImg"]);
  
  console.log("📸 Logo source:", {
    hasBase64: !!logoBase64,
    hasLogoUrl: !!logoUrl,
  });
  
  // If logoUrl is empty but there's a formData.logo object, check if it's a URL
  if (!logoUrl && formData.logo && typeof formData.logo === "string") {
    logoUrl = formData.logo;
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size (Page 1)
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Get page dimensions for logo positioning
  const pageWidth = page.getSize().width;
  const pageHeight = page.getSize().height;

  // Background template - drawn FIRST (goes to back)
  const bgBytes = await fetch(templateBg).then((res) => res.arrayBuffer());
  const bgImage = await pdfDoc.embedJpg(bgBytes);
  page.drawImage(bgImage, {
    x: 0,
    y: 0,
    width: 595.28,
    height: 841.89,
  });

  // Load and embed custom organization logo if provided
  // Using exact positioning: x = 197 px, y = 58.84 px, width = 160 px, height = 31 px
  // This is drawn AFTER the template so it appears on top
  let logoImage = null;
  
  // PRIORITY 1: If Base64 is provided (fastest - no network fetch)
  if (logoBase64) {
    try {
      console.log("📸 Using Base64 logo (no CORS issues!)");
      
      // Base64 can be with or without data URL prefix
      let binaryString = logoBase64;
      if (logoBase64.includes(",")) {
        binaryString = logoBase64.split(",")[1];  // Remove "data:image/...;base64," prefix
      }
      
      const binaryData = atob(binaryString);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const imgBytes = bytes.buffer;
      
      console.log("📦 Base64 decoded, size:", imgBytes.byteLength);
      
      // Detect format: PNG has signature 89 50 4E 47, JPG has FF D8 FF
      const view = new Uint8Array(imgBytes);
      const isPng = view[0] === 0x89 && view[1] === 0x50 && view[2] === 0x4E && view[3] === 0x47;
      const isJpg = view[0] === 0xFF && view[1] === 0xD8 && view[2] === 0xFF;
      
      console.log("📷 Format detection - PNG:", isPng, "JPG:", isJpg);
      
      if (isPng) {
        logoImage = await pdfDoc.embedPng(imgBytes);
      } else if (isJpg) {
        logoImage = await pdfDoc.embedJpg(imgBytes);
      } else {
        console.log("⚠️ Unknown image format, trying PNG first");
        try {
          logoImage = await pdfDoc.embedPng(imgBytes);
        } catch {
          logoImage = await pdfDoc.embedJpg(imgBytes);
        }
      }
      console.log("✅ Base64 logo loaded and embedded successfully");
    } catch (err) {
      console.error("❌ Base64 logo error:", err.message);
      logoImage = null;
    }
  }
  
  // PRIORITY 2: If Base64 failed or not available, try logoUrl
  if (!logoImage && logoUrl) {
    const logoSourceUrl = logoUrl;
    console.log("🔍 Logo source URL:", logoSourceUrl);
    
    try {
      console.log("📸 Attempting to load logo from URL:", logoSourceUrl);
      
      // Try to fetch the image
      let response;
      try {
        // First attempt: direct fetch
        response = await fetch(logoSourceUrl, {
          method: 'GET',
          headers: {
            'Accept': 'image/*'
          }
        });
      } catch (corsErr) {
        // If direct fetch fails due to CORS, try with CORS proxy
        console.log("⚠️ Direct fetch failed, trying CORS proxy...");
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(logoSourceUrl)}`;
        response = await fetch(proxyUrl);
      }
      
      console.log("📡 Fetch response received, status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const imgBytes = await response.arrayBuffer();
      console.log("📦 Image bytes received, size:", imgBytes.byteLength);
      
      // Detect image format from response content-type
      const contentType = response.headers.get('content-type') || '';
      let isJpg = contentType.includes('jpeg') || logoSourceUrl.toLowerCase().endsWith('.jpg') || logoSourceUrl.toLowerCase().endsWith('.jpeg');
      let isPng = contentType.includes('png') || logoSourceUrl.toLowerCase().endsWith('.png');
      
      console.log("📷 Content-Type:", contentType, "| Detected format - PNG:", isPng, "JPG:", isJpg);
      
      // If neither detected, try PNG first (most common for logos)
      if (!isPng && !isJpg) {
        isPng = true;
      }
      
      if (isPng) {
        console.log("📷 Loading as PNG");
        logoImage = await pdfDoc.embedPng(imgBytes);
      } else {
        console.log("📷 Loading as JPG");
        logoImage = await pdfDoc.embedJpg(imgBytes);
      }
      console.log("✅ URL logo loaded and embedded successfully");
    } catch (err) {
      console.error("❌ URL logo load error:", err.message);
      logoImage = null;
    }
  }
  
  // PRIORITY 3: Fallback to bundled SoftTrails.png if both methods failed
  if (!logoImage) {
    console.log("⚠️ Falling back to default SoftTrails logo");
    try {
      const fallbackResponse = await fetch(softTrailsLogo);
      if (fallbackResponse.ok) {
        const fallbackBytes = await fallbackResponse.arrayBuffer();
        logoImage = await pdfDoc.embedPng(fallbackBytes);
        console.log("✅ Fallback logo loaded successfully");
      }
    } catch (fallbackErr) {
      console.error("❌ Fallback logo also failed:", fallbackErr.message);
      logoImage = null;
    }
  }

  const drawText = (text, x, y, size = 14, bold = false) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? fontBold : fontRegular,
      color: rgb(0.1, 0.1, 0.1),
    });
  };

  // ========== HEADER ==========
  if (rfpId) {
    drawText(`RFP ID : ${rfpId}`, 30, 800, 14, true);
  }

  // ========== ORGANIZATION DETAILS ==========
  if (organization) {
    drawText(organization, 40, 650, 14, true);
  }

  // address (multi-line) - format address with proper line breaks
  // Format: "2/1 Rajpur road Survey Chowk" on first line, "Dehradun. 248001" on second line
  let yPos = 630;
  if (address) {
    let addressLines = [];
    const addrStr = String(address).trim();
    
    // First check for explicit newlines
    if (addrStr.includes('\n')) {
      addressLines = addrStr.split('\n').map((a) => a.trim()).filter(Boolean);
    }
    // Split by comma - this handles format like "2/1 Rajpur road Survey Chowk, Dehradun. 248001"
    else if (addrStr.includes(',')) {
      addressLines = addrStr.split(',').map((a) => a.trim()).filter(Boolean);
    }
    // Single line - use as is
    else {
      addressLines = [addrStr];
    }
    
    addressLines.forEach((line) => {
      if (line) {
        drawText(line, 40, yPos, 14);
        yPos -= 20;
      }
    });
  }

  // date below address
  if (issueDate) {
    drawText(issueDate, 40, yPos - 5, 14);
  }

  // ========== TITLE ==========
  drawText("Request For Proposal (RFP)", 40, 460, 26, true);

  // Project Title
  if (title) {
    drawText(title, 40, 400, 16, true);
  }

  // ========== DESCRIPTION ==========
  if (description) {
    const maxCharsPerLine = 55;
    const words = String(description).split(" ");
    const lines = [];
    let currentLine = "";
    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      if (testLine.length > maxCharsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    let descY = 370;
    lines.slice(0, 6).forEach((line) => {
      if (line) {
        drawText(line, 40, descY, 14);
        descY -= 14;
      }
    });
  }

  // ========== FOOTER ==========
  if (openDate) {
    drawText(`RFP open date : ${openDate}`, 40, 140, 14, true);
  }
  if (endDate) {
    drawText(`RFP end date : ${endDate}`, 40, 120, 14, true);
  }

  // ========== DRAW LOGO ON TOP OF TEMPLATE ==========
  // Logo was loaded earlier and is drawn AFTER template so it appears on top
  if (logoImage) {
    try {
      // Use exact positioning and dimensions as specified
      const logoExactX = 197;      // x coordinate
      const logoExactY = 75.5;    // y coordinate (from top of page in user space)
      const logoExactWidth = 160;  // width in pixels
      const logoExactHeight = 31;  // height in pixels
      
      // PDF coordinates: bottom-left is (0,0), so convert from top-down to bottom-up
      // pageHeight = 841.89 for A4
      // If user specifies Y=58.84 from top, in PDF it's: pageHeight - Y - Height
      const pdfY = pageHeight - logoExactY - logoExactHeight;
      
      console.log("📍 Logo positioning details:", {
        userY: logoExactY,
        pageHeight,
        logoHeight: logoExactHeight,
        calculatedPdfY: pdfY,
      });
      
      page.drawImage(logoImage, {
        x: logoExactX,
        y: pdfY,
        width: logoExactWidth,
        height: logoExactHeight,
      });
      console.log("✅ Logo successfully drawn at position:", { x: logoExactX, y: pdfY, width: logoExactWidth, height: logoExactHeight });
    } catch (err) {
      console.error("❌ Error drawing logo:", err);
    }
  } else {
    console.log("⚠️ No logo image available to draw");
  }

  // =====================
  // Page 2: Details table
  // =====================
  const page2 = pdfDoc.addPage([595.28, 841.89]);
  const pw = page2.getSize().width;
  const ph = page2.getSize().height;
  const marginX = 40;
  let cursorY = ph - 80; // start below the top

  const black = rgb(0, 0, 0);
  const lightGray = rgb(0.9, 0.91, 0.93); // #E5E7EB-ish
  const headerBg = rgb(0.953, 0.957, 0.965); // #F3F4F6-ish
  const textDark = rgb(0.07, 0.07, 0.07); // #111827-ish
  const textMuted = rgb(0.42, 0.46, 0.50); // #6B7280-ish

  // Helpers
  const drawText2 = ({ text, x, y, size = 12, bold = false, color = textDark }) => {
    page2.drawText(String(text ?? ""), {
      x,
      y,
      size,
      font: bold ? fontBold : fontRegular,
      color,
    });
  };

  const drawRule = (x, y, width, height = 1, color = black) => {
    page2.drawRectangle({ x, y, width, height, color });
  };

  const wrapText = (text, font, size, maxWidth) => {
    const words = String(text || "").split(/\s+/);
    const lines = [];
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (font.widthOfTextAtSize(test, size) > maxWidth) {
        if (line) lines.push(line);
        line = w;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  // Top separator line
  drawRule(marginX, cursorY, pw - marginX * 2, 1, black);
  cursorY -= 30;

  // Meta two-column section
  const gapX = 40;
  const colW = (pw - marginX * 2 - gapX) / 2;
  // Left column - Indent ID (use the indentId extracted at the top)
  drawText2({ text: "Indent ID", x: marginX, y: cursorY, size: 11, color: textMuted });
  drawText2({ 
    text: indentId || "-", 
    x: marginX, 
    y: cursorY - 18, 
    size: 12, 
    bold: true, 
    color: textDark 
  });
  drawRule(marginX, cursorY - 22, colW, 1, lightGray);

  // Right column - RFP ID
  const rightX = marginX + colW + gapX;
  drawText2({ text: "RFP ID", x: rightX, y: cursorY, size: 11, color: textMuted });
  drawText2({ 
    text: rfpId || "-", 
    x: rightX, 
    y: cursorY - 18, 
    size: 12, 
    bold: true, 
    color: textDark 
  });
  drawRule(rightX, cursorY - 22, colW, 1, lightGray);

  // Move the materials section a bit further down to match the
  // reference screenshot spacing (large whitespace after meta block)
  const GAP_AFTER_META = 140; // was 80
  cursorY -= GAP_AFTER_META;

  // Section title
  drawText2({ text: "Material / Asset Details", x: marginX, y: cursorY, size: 14, bold: true });
  cursorY -= 18;

  // Table header
  const colFractions = [2.2, 0.8, 0.8, 2.0];
  const sumFrac = colFractions.reduce((a, b) => a + b, 0);
  const colWidths = colFractions.map((f) => ((pw - marginX * 2) * f) / sumFrac);
  const headers = ["Material / Asset Name", "Quantity", "UOM", "Description"];

  // Header background
  page2.drawRectangle({ x: marginX, y: cursorY - 20, width: pw - marginX * 2, height: 24, color: headerBg });

  let runningX = marginX;
  headers.forEach((h, i) => {
    drawText2({ text: h, x: runningX + 8, y: cursorY - 14, size: 11, bold: true, color: textDark });
    if (i < headers.length - 1) {
      // vertical separators optional; keeping table clean
    }
    runningX += colWidths[i];
  });
  cursorY -= 28; // move below header

  // Table rows from formData.productItems / items
  const productItems = formData?.productItems || formData?.items || [];
  const rows = Array.isArray(productItems) && productItems.length > 0 ? productItems : [];

  const lineHeight = 12 * 1.35;
  const textSize = 12;

  // Note: For simplicity, this version does not paginate rows beyond one page.

  // Draw each row
  rows.forEach((row) => {
    const name = row.product_name || row.asset_name || row.name || "-";
    const qty = row.quantity ?? row.qty ?? "-";
    const uom = row.uom || row.unit || "-";
    const desc = row.description || row.spec || "";

    // Wrap description
    const descMax = colWidths[3] - 16;
    const descLines = wrapText(desc, fontRegular, textSize, descMax);
    const rowHeight = Math.max(lineHeight, descLines.length * lineHeight);

    // Horizontal rule above the row
    drawRule(marginX, cursorY - rowHeight - 4, pw - marginX * 2, 1, lightGray);

    // Name
    drawText2({ text: name, x: marginX + 8, y: cursorY - lineHeight, size: textSize, color: textDark });
    // Quantity
    drawText2({ text: String(qty), x: marginX + colWidths[0] + 8, y: cursorY - lineHeight, size: textSize, color: textDark });
    // UOM
    drawText2({ text: String(uom), x: marginX + colWidths[0] + colWidths[1] + 8, y: cursorY - lineHeight, size: textSize, color: textDark });
    // Description (multi-line)
    let dy = 0;
    descLines.forEach((ln) => {
      drawText2({ text: ln, x: marginX + colWidths[0] + colWidths[1] + colWidths[2] + 8, y: cursorY - lineHeight - dy, size: textSize, color: textMuted });
      dy += lineHeight;
    });

    cursorY -= rowHeight + 12;
  });

  // If no rows, draw an empty line placeholder
  if (!rows.length) {
    drawRule(marginX, cursorY - 18, pw - marginX * 2, 1, lightGray);
    drawText2({ text: "No items provided", x: marginX + 8, y: cursorY - 14, size: 12, color: textMuted });
  }

  // ========== OUTPUT ==========
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  // Create unique filename using both RFP ID and Indent ID
  const fileName = rfpId && indentId 
    ? `RFP_${rfpId}_Indent_${indentId}.pdf`
    : rfpId 
      ? `RFP_${rfpId}.pdf` 
      : indentId
        ? `RFP_Indent_${indentId}.pdf`
        : `RFP_${Date.now()}.pdf`;
  console.log("🔍 RFP PDF Generated:", { rfpId, indentId, fileName });
  const file = new File([blob], fileName, { type: "application/pdf" });
  return file;
}

// Provide a named export that other modules can import
// Accepts either rfpData object or individual props (for backward compatibility)
export async function generateRfpPdf(rfpData = {}) {
  // RfpTemplate already returns a File object
  return await RfpTemplate(rfpData);
}

const RfpGenerator = ({ formData = {}, onFileGenerated }) => {
  useEffect(() => {
    const create = async () => {
      const file = await generateRfpPdf(formData);
      if (onFileGenerated) onFileGenerated(file);
    };
    create();
  }, [formData, onFileGenerated]);

  return null;
};

export default RfpTemplate;