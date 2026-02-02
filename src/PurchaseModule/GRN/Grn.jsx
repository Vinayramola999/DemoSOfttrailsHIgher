import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import GenerateGrnModal from "./GenerateGrnModal";
import API from "../../config/api";
import GrnTemplate from "./GrnTemplate";
import PopupModal from "../PopupModal";
const Grn = () => {
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showGrnModal, setShowGrnModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);
  const navigate = useNavigate();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [viewGrn, setViewGrn] = useState(null);
  const grnRef = useRef(null);

  const fetchGrnData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${API.PURCHASE_API}/grn/good_receive_note`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setRfps(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching GRN data:", err);
      setError("Failed to load GRN data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrnData();
  }, []);

  const handleGrnSuccess = (message = "GRN created successfully!") => {
    setSuccessMessage(message);
    setShowSuccessModal(true);
    setShowGrnModal(false);
    fetchGrnData(); // refresh table
  };

  const handleDownloadPdf = async () => {
    if (!grnRef.current) return;
    try {
      const canvas = await html2canvas(grnRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // calculate image height in mm to keep ratio
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidthMm = pdfWidth;
      const imgHeightMm = (imgProps.height * imgWidthMm) / imgProps.width;

      if (imgHeightMm <= pdfHeight) {
        pdf.addImage(imgData, "PNG", 0, 0, imgWidthMm, imgHeightMm);
      } else {
        // If content is taller than a single page, split into pages
        let remainingHeight = imgHeightMm;
        let position = 0;
        const pageCanvasHeight = (canvas.height * (pdfHeight / imgHeightMm));
        // Create temporary canvas slices
        const pageCount = Math.ceil(imgHeightMm / pdfHeight);
        for (let i = 0; i < pageCount; i++) {
          const tmpCanvas = document.createElement("canvas");
          tmpCanvas.width = canvas.width;
          tmpCanvas.height = Math.floor(canvas.height / pageCount);
          const ctx = tmpCanvas.getContext("2d");
          ctx.drawImage(
            canvas,
            0,
            i * tmpCanvas.height,
            canvas.width,
            tmpCanvas.height,
            0,
            0,
            canvas.width,
            tmpCanvas.height
          );
          const tmpImg = tmpCanvas.toDataURL("image/png");
          if (i > 0) pdf.addPage();
          pdf.addImage(tmpImg, "PNG", 0, 0, imgWidthMm, (tmpCanvas.height * imgWidthMm) / tmpCanvas.width);
        }
      }

      pdf.save(`${viewGrn?.grn_id || "GRN"}.pdf`);
    } catch (err) {
      console.error("PDF export error:", err);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  // ✅ Search filter
  const filtered = rfps.filter((q) => {
    if (!search?.trim()) return true;
    const s = search.trim().toLowerCase();

    const topFields = [
      q.grn_id,
      q.po_id,
      q.quotation_id,
      q.delivery_date,
      q.status,
      q.vendor_name,
      q.organization_name,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return topFields.includes(s);
  });

  // ✅ Pagination logic
  const paginatedData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // ✅ Modal handlers
  const handleGenerateClick = (item = null) => {
    setSelectedPo(item);
    setShowGrnModal(true);
  };

  const handleViewClick = async (item) => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `https://devdemo.softtrails.net/purchase/grn/one_grn/${item.grn_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.success && res.data?.data?.grn_file) {
        // Open GRN file in new tab
        window.open(res.data.data.grn_file, "_blank");
      } else {
        console.error("GRN file not found in response");
      }
    } catch (err) {
      console.error("Error fetching GRN details:", err);
      alert("Failed to fetch GRN file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModalGenerate = (payload) => {

    setViewGrn(payload);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="flex-1 overflow-auto">
        <main className="p-6 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Goods Received Note
            </h1>
          </div>
        </main>

        <div className="bg-white rounded-lg shadow p-5 overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">All GRN</h2>

            <div className="ml-auto flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search GRN..."
                className="border px-3 py-2 rounded text-sm w-64"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => handleGenerateClick()}
              >
                Generate GRN
              </button>
            </div>
          </div>

          {/* ✅ Table display */}
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : error ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center p-4 text-gray-500">
              No GRN records found
            </div>
          ) : (
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-3">GRN ID</th>
                  <th className="px-4 py-3">PO ID</th>
                  <th className="px-4 py-3">Delivery Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3">{item.grn_id || "--"}</td>
                    <td className="px-4 py-3">{item.po_id || "--"}</td>
                    <td className="px-4 py-3">
                      {item.delivery_date
                        ? new Date(item.delivery_date).toLocaleDateString(
                          "en-GB"
                        )
                        : "N/A"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-orange-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                        {item.qc_grn || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-blue-600">
                      <button
                        onClick={() => handleViewClick(item)}
                        className="hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ✅ Pagination controls */}
          <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
            <div>
              Showing{" "}
              {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)}{" "}
              to {Math.min(currentPage * itemsPerPage, filtered.length)} of{" "}
              {filtered.length} results
            </div>
            <div className="flex gap-1">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : ""
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Generate GRN Modal */}
      {showGrnModal && (
        <GenerateGrnModal
          isOpen={showGrnModal}
          onClose={() => setShowGrnModal(false)}
          po={selectedPo || {}}
          onGenerate={handleModalGenerate}
          onSuccess={handleGrnSuccess}
        />
      )}
      {showSuccessModal && (
        <PopupModal
          type="success"
          title="Success"
          message={successMessage}
          onClose={handleSuccessModalClose}
        />
      )}

      {/* View GRN template/modal */}
      {viewGrn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-3xl p-4 rounded-lg overflow-auto">
            <div className="flex justify-end gap-2 mb-2">
              <button className="px-3 py-1 border rounded" onClick={() => setViewGrn(null)}>Close</button>
              <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={handleDownloadPdf}> PDF</button>
            </div>
            <div ref={grnRef}>
              <GrnTemplate grn={viewGrn} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grn;
