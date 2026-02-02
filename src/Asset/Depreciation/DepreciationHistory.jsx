import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Select from "react-select";
import { ASSET_NODE_BASE, JAVA_BASE } from "../../config/apiBase";
import { FiDownload, FiTrendingDown } from "react-icons/fi";
import DepreciationDrawer from "../Components/DepreciationDrawer"; // ✅ Drawer Component

const DepreciationHistory = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [historyData, setHistoryData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState(null);

  const itemsPerPage = 20;

  const allowedColumns = [
    "Asset Name",
    "Purchase Date",
    "Original Cost",
    "Scrap Value",
    "Useful Life",
    "unique_id",
    "created_at",
  ];

  // ✅ Fetch categories
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    axios
      .get(`${JAVA_BASE}api/categories/movable`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // ✅ Fetch data (server-side pagination + search)
  const fetchData = useCallback(
    async (category, page = 1, search = "") => {
      if (!category) return;
      setLoading(true);
      const token = sessionStorage.getItem("token");

      try {
        const res = await axios.get(
          `${ASSET_NODE_BASE}getColumnTypesAndData/${category}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              type: "Movable",
              status: "Inventory",
              limit: itemsPerPage,
              offset: (page - 1) * itemsPerPage,
              search: search || "",
            },
          }
        );

        const allColumns = res.data.columns || [];
        const allData = res.data.data || [];

        const filteredColumns = allColumns.filter((col) =>
          allowedColumns.includes(col.columnName)
        );

        const filteredData = allData.map((row) => {
          const filteredRow = {};
          allowedColumns.forEach((key) => {
            if (key in row) filteredRow[key] = row[key];
          });
          return filteredRow;
        });

        setColumns(filteredColumns);
        setHistoryData(filteredData);
        setTotalPages(Math.ceil((res.data.pagination?.total || 1) / itemsPerPage));
        setCurrentPage(page);
      } catch (error) {
        console.error("Error fetching depreciation data:", error);
        setColumns([]);
        setHistoryData([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    },
    [itemsPerPage]
  );

  // ✅ Fetch on category/page change
  useEffect(() => {
    if (selectedCategory) fetchData(selectedCategory, currentPage, searchTerm);
  }, [selectedCategory, currentPage]);

  // ✅ Debounce search
  useEffect(() => {
    const delay = setTimeout(() => {
      if (selectedCategory) fetchData(selectedCategory, 1, searchTerm.trim());
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // ✅ Handlers
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  // ✅ Open Drawer on Depreciation Icon Click
  const handleDepreciationClick = (asset) => {
    setSelectedAssetId(asset.unique_id);
    setIsDrawerOpen(true);
  };

  const customColumns = [
    { key: "unique_id", label: "Asset ID" },
    { key: "Asset Name", label: "Asset Name" },
    { key: "Purchase Date", label: "Purchase Date" },
    { key: "Original Cost", label: "Original Cost" },
    { key: "Scrap Value", label: "Scrap Value" },
    { key: "Useful Life", label: "Useful Life" },
    { key: "created_at", label: "Created On" },
  ];

  return (
    <div className="min-h-screen bg-white px-4 py-6 sm:px-6 lg:px-12">
      {/* Header + Controls */}
      <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6 max-w-full flex-wrap">
        <div className="flex flex-col w-full md:w-64">
          <label htmlFor="category" className="mb-1 text-gray-700 font-medium">
            Select Category:
          </label>
          <Select
            id="category"
            className="w-full"
            classNamePrefix="react-select"
            placeholder="-- Choose Category --"
            isSearchable
            value={
              selectedCategory
                ? { label: selectedCategory, value: selectedCategory }
                : null
            }
            onChange={(option) =>
              handleCategoryChange({ target: { value: option?.value } })
            }
            options={categories.map((cat) => ({
              label: cat.categoriesname,
              value: cat.categoriesname,
            }))}
          />
        </div>

        <div className="flex flex-col w-full md:w-64">
          <label htmlFor="search" className="mb-1 text-gray-700 font-medium">
            Search:
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="border rounded p-2 w-full md:w-auto"
          />
        </div>
      </div>

      {/* Info Note */}
      {selectedCategory && (
        <div className="mb-4 p-4 border-l-4 border-blue-500 bg-blue-50 text-blue-800 rounded">
          <p className="text-sm font-medium">
            <strong>Note:</strong> Click the <span className="text-blue-700 font-semibold">📉</span> icon to view the
            detailed yearly depreciation breakdown of an asset.
          </p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-blue-500 font-medium">Loading data...</p>
      ) : historyData.length > 0 ? (
        <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
            <table className="min-w-full table-auto text-sm border-collapse">
              <thead className="sticky top-0 bg-white" style={{ boxShadow: "0 2px 0 black" }}>
                <tr>
                  {customColumns.map((col, i) => (
                    <th key={i} className="p-5 text-left font-bold whitespace-nowrap">
                      {col.label}
                    </th>
                  ))}
                  <th className="p-5 text-center font-bold whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historyData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className={`cursor-pointer ${
                      rowIndex % 2 === 0 ? "bg-blue-50" : "bg-white"
                    } hover:bg-blue-100 transition`}
                  >
                    {customColumns.map((col, colIndex) => {
                      const value = row[col.key];
                      return (
                        <td
                          key={colIndex}
                          className="px-5 py-3 text-left text-gray-700 whitespace-nowrap max-w-xs truncate"
                          title={typeof value === "object" ? JSON.stringify(value) : value}
                        >
                          {col.key === "created_at" || col.key === "Purchase Date"
                            ? value
                              ? new Date(value).toLocaleDateString("en-GB")
                              : "NA"
                            : value || "NA"}
                        </td>
                      );
                    })}
                    <td className="px-5 py-3 text-center">
                      <button
                        className="text-blue-600 hover:text-blue-800 transition"
                        title="View Depreciation History"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDepreciationClick(row);
                        }}
                      >
                        <FiTrendingDown className="text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                &lt;
              </button>

              <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
                {currentPage}
              </span>

              <span className="text-sm font-medium">of</span>

              <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">
                {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      ) : selectedCategory ? (
        <p className="text-gray-500 italic">No depreciation history found for this category.</p>
      ) : null}

      {/* ✅ Drawer Component */}
      <DepreciationDrawer
        categoryName={selectedCategory}
        assetId={selectedAssetId}
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default DepreciationHistory;
