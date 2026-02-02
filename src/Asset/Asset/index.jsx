import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Select from "react-select";
import * as XLSX from "xlsx";
import { HiUpload } from "react-icons/hi";

import MessageModal from "../ApprovalAuthority/MessageModal";
import DeleteConfirmModal from "../Components/DeleteConfirmModal";
import { assetService } from "../services/assetService";

// Imported Sub-Components
import AssetTable from "./components/AssetTable";
import AssetFormModal from "./components/AssetFormModal";
import BulkUploadModal from "./components/BulkUploadModal";
import FileUploadModal from "./components/FileUploadModal";

const AssetManagementPage = () => {
  // --- State Management ---
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [dynamicFields, setDynamicFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All Assets");
  const [tableData, setTableData] = useState({ columns: [], data: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false); // Used for MessageModal

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(25);
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 25,
    offset: 0,
    nextOffset: null,
    prevOffset: null,
  });
  const [isPaginating, setIsPaginating] = useState(false);

  // File Uploads & Dates
  const [dates, setDates] = useState({});
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [fileFieldName, setFileFieldName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Bulk Upload
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Search Debounce
  const [debounceTimer, setDebounceTimer] = useState(null);

  const navigate = useNavigate();

  // --- Effects ---

  // 1. Fetch Categories & Initial Data
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await assetService.fetchCategories();
        const allAssetsCategory = { categoriesname: "All Assets", categoryId: "all" };
        setCategories([allAssetsCategory, ...(data || [])]);
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
    fetchTableData("All Assets", 1, itemsPerPage, searchTerm);
  }, []);

  // 2. Reset Form on Modal Close
  useEffect(() => {
    if (!isAssetModalOpen) {
      setEditingAssetId(null);
      setFormData({});
      setDates({});
      setFormErrors({});
    }
  }, [isAssetModalOpen]);

  // --- Helper Functions ---

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${day}-${month}-${year}`;
  };

  const formatStages = (stages) => {
    if (!stages) return "";
    const formattedStage = stages
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/([A-Z][a-z]*)/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .trim();

    // Simple color logic (can be expanded)
    const colorClass = "text-blue-500";
    return (
      <span className={`px-2 py-1 rounded-full text-sm font-medium ${colorClass}`}>
        {formattedStage}
      </span>
    );
  };

  // --- API Interactions ---

  const fetchTableData = async (
    categoryName = selectedCategory,
    offsetOrPage = 1,
    limit = itemsPerPage,
    search = searchTerm
  ) => {
    // Prevent API call if no category is selected
    if (!categoryName) return;

    try {
      let response;
      let newData = [];
      let newColumns = [];
      let newPagination = {};

      if (categoryName === "All Assets") {
        const page = offsetOrPage > 0 ? offsetOrPage : 1;
        response = await assetService.fetchAllAssets(page, limit, search);

        if (response && response.success && response.records) {
          newData = response.records.flatMap(record => record.data.map(item => ({
            ...item,
            categoryName: record.category
          })));

          newColumns = [
            { columnName: "Asset Name", dataType: "text" },
            { columnName: "categoryName", dataType: "text" },
            { columnName: "created_at", dataType: "date" },
            { columnName: "status", dataType: "text" },
            { columnName: "stages", dataType: "text" }
          ];

          const totalCount = response.records.reduce((acc, curr) => acc + (curr.total || 0), 0);

          newPagination = {
            total: totalCount,
            limit: limit,
            offset: (page - 1) * limit,
            page: page
          };
        }
      } else {
        const offset = offsetOrPage;
        response = await assetService.fetchTableData(categoryName, offset, limit, search);

        const { columns = [], data = [], pagination = {} } = response || {};
        newData = data.map((item) => ({
          ...item,
          categoryName: response.table || selectedCategory,
        }));
        newColumns = columns;

        newPagination = {
          total: pagination.total ?? data.length,
          limit: pagination.limit ?? limit,
          offset: pagination.offset ?? offset,
          nextOffset: pagination.nextOffset,
          prevOffset: pagination.prevOffset
        };
      }

      setTableData({ columns: newColumns, data: newData, table: categoryName });
      setDynamicFields(newColumns);
      setFilteredData(newData);
      setPagination({
        total: newPagination.total || 0,
        limit: newPagination.limit || limit,
        offset: newPagination.offset || 0,
        page: newPagination.page,
        nextOffset: newPagination.nextOffset !== undefined ? Number(newPagination.nextOffset) : null,
        prevOffset: newPagination.prevOffset !== undefined ? Number(newPagination.prevOffset) : null,
      });

    } catch (error) {
      console.error("Error fetching table data:", error.message);
    }
  };

  // --- Event Handlers ---

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    const newTimer = setTimeout(() => {
      const currentOffsetOrPage = selectedCategory === "All Assets" ? 1 : 0;
      fetchTableData(selectedCategory, currentOffsetOrPage, pagination.limit, value.trim());
    }, 800);
    setDebounceTimer(newTimer);
  };

  const handlePageChange = useCallback(async (direction) => {
    if (isPaginating || !pagination) return;
    setIsPaginating(true);

    const totalPages = Math.ceil(pagination.total / pagination.limit);
    let newOffset = pagination.offset;

    if (direction === "next") {
      if (pagination.offset + pagination.limit >= pagination.total) return;
      newOffset = pagination.nextOffset ?? (pagination.offset + pagination.limit < pagination.total ? pagination.offset + pagination.limit : pagination.offset);
    } else if (direction === "prev") {
      if (pagination.offset <= 0) return;
      newOffset = pagination.prevOffset ?? (pagination.offset - pagination.limit >= 0 ? pagination.offset - pagination.limit : 0);
    }

    let fetchParam = newOffset;
    if (selectedCategory === "All Assets") {
      const newPage = direction === "next" ? currentPage + 1 : currentPage - 1;
      fetchParam = newPage;
      setCurrentPage(newPage);
    } else {
      setCurrentPage((prev) => direction === "next" ? prev + 1 : prev - 1);
    }

    await fetchTableData(selectedCategory, fetchParam, pagination.limit, searchTerm);
    setTimeout(() => setIsPaginating(false), 300);
  },
    [pagination, selectedCategory, isPaginating, searchTerm, currentPage]
  );

  const handleCategoryChange = async (option) => {
    const value = option?.value;
    setSelectedCategory(value);
    setCurrentPage(1);
    const initialOffsetOrPage = value === "All Assets" ? 1 : 0;
    await fetchTableData(value, initialOffsetOrPage, pagination.limit, searchTerm);
    setFormErrors({});
    setFormData({});
  };

  // --- Form & Modal Handlers ---

  const handleAddAsset = () => {
    setFormData({});
    setIsAssetModalOpen(true);
  };

  const handleEdit = async (unique_id) => {
    const asset = tableData.data.find((row) => row.unique_id === unique_id);
    if (!asset) return;

    const categoryName = asset.categoryName || tableData.table || selectedCategory || "";
    if (!categoryName) {
      setMessage("Unable to determine asset category.");
      setMessageType("error");
      setIsModalOpen(true);
      return;
    }

    try {
      const response = await assetService.fetchTableData(categoryName, 0, 1, "");
      const columns = response.columns || [];
      const parsedFormData = {};
      const parsedDates = {};

      Object.keys(asset).forEach((key) => {
        const value = asset[key];
        if (key.toLowerCase().includes("date")) {
          parsedFormData[key] = value || "";
          parsedDates[key] = value ? new Date(value) : null;
        } else if (typeof value === "string" && !isNaN(value)) {
          parsedFormData[key] = parseFloat(value);
        } else {
          parsedFormData[key] = value;
        }
      });

      parsedFormData.category = categoryName;
      setDynamicFields(columns);
      setFormData(parsedFormData);
      setDates(parsedDates);
      setEditingAssetId(unique_id);
      setSelectedAsset({ assetId: asset.unique_id, assetname: asset["Asset Name"] || "" });
      setIsAssetModalOpen(true);
    } catch (error) {
      console.error("Error loading asset fields:", error.message);
      setMessage("Failed to load asset data.");
      setMessageType("error");
      setIsModalOpen(true);
    }
  };

  const handleDelete = (asset) => {
    if (asset?.unique_id) {
      setAssetToDelete(asset);
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (assetToDelete) {
      try {
        const categoryToUse = assetToDelete.categoryName || selectedCategory;
        await assetService.deleteAsset(assetToDelete.unique_id, categoryToUse);

        const currentOffsetOrPage = selectedCategory === "All Assets" ? currentPage : pagination.offset;
        fetchTableData(selectedCategory, currentOffsetOrPage, pagination.limit, searchTerm);

        setMessage("Asset deleted successfully.");
        setMessageType("success");
        setIsDeleteModalOpen(false);
        setAssetToDelete(null);
      } catch (error) {
        setMessage("Failed to delete asset.");
        setMessageType("error");
        setIsDeleteModalOpen(false);
      }
      setTimeout(() => { setMessage(""); setMessageType(""); }, 3000);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setAssetToDelete(null);
  };

  // --- Form Submission ---

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      return;
    }

    // Validation logic (simplified)
    const field = dynamicFields.find((f) => f.columnName === name);
    let errorMsg = "";
    if (field?.isNullable === false && (!value || value.toString().trim() === "")) {
      errorMsg = "Required";
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: errorMsg }));

    if (name === "category") {
      fetchFormFieldsForCategory(value);
    }
  };

  const fetchFormFieldsForCategory = async (catName) => {
    try {
      const response = await assetService.fetchTableData(catName, 0, 1, "");
      setDynamicFields(response.columns || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDateChange = (date, columnName) => {
    setDates((prev) => ({ ...prev, [columnName]: date }));
    handleChange({ target: { name: columnName, value: date ? format(date, "yyyy-MM-dd") : "" } });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const categoryToSubmit = formData.category || (selectedCategory !== "All Assets" ? selectedCategory : "");
    if (!categoryToSubmit || categoryToSubmit === "All Assets") {
      setMessage("Please select a valid category (not 'All Assets').");
      setMessageType("error");
      setIsModalOpen(true);
      return false;
    }

    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    const categoryObj = categories.find(c => c.categoriesname === categoryToSubmit);
    if (!categoryObj) return;

    // Remove UI only field
    const { category, ...submissionData } = formData;

    // ⭐ Convert Purchase Date from ISO → YYYY-MM-DD
    if (submissionData["Purchase Date"]) {
      submissionData["Purchase Date"] = submissionData["Purchase Date"].split("T")[0];
    }

    // ⭐ Remove empty values (same as OLD working logic)
    const filteredValues = Object.fromEntries(
      Object.entries(submissionData).filter(
        ([key, value]) =>
          key !== "unique_id" &&
          key !== "category_id" &&
          key !== "categoryName" &&
          value !== "" &&
          value !== null &&
          value !== undefined
      )
    );

    // ⭐ Build update payload same as OLD working version
    const payload = editingAssetId
      ? {
        action: "AssetAddition",
        category_id: categoryObj.categoryId,
        unique_id: editingAssetId,
        fieldsToUpdate: filteredValues,
        submodule: "Movable"
      }
      : {
        category_id: categoryObj.categoryId,
        user_id: parseInt(userId),
        action: "AssetAddition",
        values: filteredValues,
        submodule: "Movable"
      };

    try {
      let res;
      if (editingAssetId) res = await assetService.updateAsset(payload);
      else res = await assetService.createAsset(payload, categoryToSubmit);

      if (JSON.stringify(res).toLowerCase().includes("error")) {
        setMessage("Failed");
        setMessageType("error");
      } else {
        setMessage("Success");
        setMessageType("success");
        setIsAssetModalOpen(false);
        const currentOffsetOrPage = selectedCategory === "All Assets" ? currentPage : pagination.offset;
        fetchTableData(selectedCategory, currentOffsetOrPage, pagination.limit, searchTerm);
      }
    } catch (err) {
      setMessage("Error");
      setMessageType("error");
    }

    setIsModalOpen(true);
  };

  const handleApproval = async (unique_id) => {
    const assetToApprove = tableData.data.find((row) => row.unique_id === unique_id);
    if (!assetToApprove) return;

    const categoryName = assetToApprove.categoryName || (selectedCategory !== "All Assets" ? selectedCategory : "");
    const categoryId = assetToApprove.category_id;
    const userId = sessionStorage.getItem("userId");

    if (!categoryName || !categoryId || !userId) {
      setMessage("Missing info"); setMessageType("error"); setIsModalOpen(true); return;
    }

    const payload = {
      category_id: categoryId,
      user_id: parseInt(userId),
      new_stages: "AwaitingApproval",
      sub_stages: "Added",
      action: "AssetAddition",
      submodule: "Movable"
    };

    try {
      await assetService.approveAsset(unique_id, payload);
      setMessage("Sent for approval"); setMessageType("success");
      const currentOffsetOrPage = selectedCategory === "All Assets" ? currentPage : pagination.offset;
      fetchTableData(selectedCategory, currentOffsetOrPage, pagination.limit, searchTerm);
    } catch (e) {
      setMessage("Failed"); setMessageType("error");
    }
    setIsModalOpen(true);
  };

  // --- File Upload Handlers ---

  const handleFileUpload = async (file) => {
    try {
      const publishId = await assetService.getDmsPublishId();
      if (!publishId) return null;

      const userId = sessionStorage.getItem("userId");
      const uploadData = new FormData();
      uploadData.append("documents", file);
      uploadData.append("ref", "DMS");
      uploadData.append("metadata", JSON.stringify([{
        service: "Asset Management",
        publish_id: parseInt(publishId),
        user_id: userId,
        document_name: file.name
      }]));

      const data = await assetService.uploadFileToDMS(uploadData);
      return data.uploaded_files?.[0]?.file_url || null;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const handleBulkUploadSubmit = async (e) => {
    e.preventDefault();
    if (!bulkCategory || !bulkFile) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", bulkFile);
    formData.append("action", "AssetAddition");
    formData.append("submodule", "Movable");
    formData.append("category", bulkCategory);

    try {
      await assetService.bulkUpload(bulkCategory, formData);
      setMessage("Upload successful"); setMessageType("success");
      setShowBulkUploadModal(false);
      setBulkFile(null);
    } catch (e) {
      setMessage("Upload failed"); setMessageType("error");
    } finally {
      setIsUploading(false);
      setIsModalOpen(true);
    }
  };
  const handleDownloadTemplate = () => {
    const removeFields = [
      "unique_id",
      "category_id",
      "status",
      "stages",
      "created_at",
      "id",
      "sub_stages",
      "toapprove",
      "categoryName"
    ];

    const headers = dynamicFields
      .filter(f => !removeFields.includes(f.columnName))  // Remove unwanted ones
      .map(f => f.columnName);

    const ws = XLSX.utils.json_to_sheet([], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template.xlsx");
  };


  // --- Render ---

  return (
    <div className="flex flex-col overflow-hidden w-full">
      <div className="flex w-full">
        <div className="w-full">
          <div className="p-4 md:p-5 flex flex-col space-y-6 min-h-screen w-full">
            {/* Controls Section */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-md shadow-sm w-full">
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                <button
                  onClick={handleAddAsset}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition duration-200 shadow-sm w-full sm:w-auto whitespace-nowrap"
                >
                  + Add Asset
                </button>

                <div className="w-full sm:w-[250px]">
                  <Select
                    id="category"
                    placeholder="Select Asset Category"
                    isSearchable
                    classNamePrefix="react-select"
                    value={selectedCategory ? { label: selectedCategory, value: selectedCategory } : null}
                    onChange={handleCategoryChange}
                    options={categories.map((category) => ({
                      label: category.categoriesname,
                      value: category.categoriesname,
                    }))}
                  />
                </div>

                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  className="bg-green-600 text-white px-5 py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-green-700 transition duration-200 shadow-sm w-full sm:w-auto whitespace-nowrap"
                >
                  <HiUpload className="text-xl" />
                  Bulk Upload
                </button>
              </div>

              <div className="relative w-full lg:w-[300px]">
                <input
                  type="text"
                  placeholder="Search assets..."
                  className="w-full h-[42px] pl-10 pr-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200"
                  value={searchTerm}
                  onChange={handleSearch}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.15-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
                </svg>
              </div>
            </div>

            {/* Asset Table */}
            <AssetTable
              tableData={tableData}
              filteredData={filteredData}
              pagination={pagination}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              selectedCategory={selectedCategory}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handlePageChange={handlePageChange}
              formatDate={formatDate}
              formatStages={formatStages}
            />

            {/* Modals */}
            <AssetFormModal
              isOpen={isAssetModalOpen}
              onClose={() => setIsAssetModalOpen(false)}
              editingAssetId={editingAssetId}
              selectedCategory={selectedCategory}
              categories={categories}
              filteredDynamicFields={dynamicFields}
              formData={formData}
              formErrors={formErrors}
              dates={dates}
              handleChange={handleChange}
              handleDateChange={handleDateChange}
              handleSubmit={handleSubmit}
              handleApproval={handleApproval}
              handleDownloadTemplate={handleDownloadTemplate}
              setShowBulkUploadModal={setShowBulkUploadModal}
              setFileFieldName={setFileFieldName}
              setIsFileModalOpen={setIsFileModalOpen}
              handleFileUpload={handleFileUpload}
            />

            <BulkUploadModal
              isOpen={showBulkUploadModal}
              onClose={() => setShowBulkUploadModal(false)}
              bulkCategory={bulkCategory}
              setBulkCategory={setBulkCategory}
              setBulkFile={setBulkFile}
              isUploading={isUploading}
              handleBulkUploadSubmit={handleBulkUploadSubmit}
              categories={categories}
            />

            <FileUploadModal
              isOpen={isFileModalOpen}
              onClose={() => setIsFileModalOpen(false)}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              handleFileUpload={handleFileUpload}
              setFormData={setFormData}
              fileFieldName={fileFieldName}
            />

            <MessageModal
              message={message}
              type={messageType}
              setMessage={setMessage}
            />

            <DeleteConfirmModal
              open={isDeleteModalOpen}
              title="Delete Asset?"
              message="Are you sure you want to delete this asset?"
              onCancel={cancelDelete}
              onConfirm={confirmDelete}
              loading={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManagementPage;
