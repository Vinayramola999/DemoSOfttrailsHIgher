// export default AllRequest;
import { useState, useEffect } from "react";
import axios from "axios";
import API from "../config/api";
import { FaEdit, FaTrash } from "react-icons/fa";
import Select from "react-select";
import PopupModal from "./PopupModal";
import DownloadTableButtons from "./components/Downloadpdfexcel";

// Helper for department ID to Name mapping
const deptIdToNameMap = {
  1: "Development",
  3: "HR",
};

const AllRequest = () => {
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [asset, setAsset] = useState("");
  const [department, setDepartment] = useState(""); // Will store dept_id
  const [status, setStatus] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRequestMaterialOpen, setIsRequestMaterialOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const createdBy = sessionStorage.getItem("userId");
  const [requestfor, setRequestfor] = useState("");
  const [assetOptions, setAssetOptions] = useState([]);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  // reference some variables to avoid lint "assigned but never used" warnings
  // these are intentionally kept because their values are set elsewhere and used in UI later
  void setDepartment;
  void assetOptions;
  void departmentOptions;
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    type: "success",
    title: "",
    message: "",
  });
  const [budgetOptions, setBudgetOptions] = useState([]);
  const columns = [
    { header: "S. No.", accessor: "sno" },
    { header: "Request for", accessor: "request_for" },
    { header: "Category", accessor: "category" },
    { header: "Request Material", accessor: "asset_name" },
    { header: "Quantity", accessor: "quantity" },
    { header: "UOM", accessor: "uom" },
    { header: "Status", accessor: "status" },
  ];
  const filteredRequests = requests.filter((item) => {
    let matches = true;

    if (search) {
      // normalize search term (trim + lowercase)
      const searchTerm = search.trim().toLowerCase();
      const inAssetName = item.asset_name?.toString().toLowerCase().includes(searchTerm);
      const inCategory = item.category?.toString().toLowerCase().includes(searchTerm);
      const inRequestFor = item.request_for?.toString().toLowerCase().includes(searchTerm);
      const inIndentId = item.indent_id?.toString().toLowerCase().includes(searchTerm) ||
        item.id?.toString().toLowerCase().includes(searchTerm);
      const inUserId = item.user_id?.toString().toLowerCase().includes(searchTerm);
      if (!(inAssetName || inCategory || inRequestFor || inIndentId || inUserId)) {
        matches = false;
      }
    }

    if (requestfor && item.request_for !== requestfor) {
      matches = false;
    }

    if (asset && item.category !== asset) {
      matches = false;
    }

    if (department && item.dept_id !== parseInt(department)) {
      matches = false;
    }

    if (status && item.status !== status) {
      matches = false;
    }

    return matches;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; // Change as needed

  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);
  const paginatedRequests = filteredRequests.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Reset to first page whenever the filters/search change so results aren't hidden
  useEffect(() => {
    setCurrentPage(1);
  }, [search, asset, requestfor, department, status, requests]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [indentingRes, salesIndentingRes] = await Promise.all([
          axios.get(`${API.PURCHASE_API}/indenting`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API.PURCHASE_API}/sales/salesIndenting`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // Responses may include nested products array. Normalize each record
        const rawIndenting = Array.isArray(indentingRes.data)
          ? indentingRes.data
          : [];
        const rawSales = Array.isArray(salesIndentingRes.data)
          ? salesIndentingRes.data
          : [];

        const normalize = (item) => {
          const firstProduct =
            Array.isArray(item.products) && item.products.length > 0
              ? item.products[0]
              : {};
          return {
            // keep original ids but ensure `id` exists for legacy code
            id: item.id ?? item.indent_id ?? item.indentId ?? null,
            indent_id: item.indent_id ?? item.id ?? null,
            user_id: item.user_id,
            dept_id: item.dept_id,
            status: item.status,
            stage: item.stage || "",
            workflow_id: item.workflow_id,
            budget_id: item.budget_id ?? firstProduct.budget_id ?? null,
            created_at: item.created_at,
            updated_at: item.updated_at,
            // expose top-level product fields (first product) for table rows
            products: Array.isArray(item.products) ? item.products : [],
            product_count:
              item.product_count ??
              (Array.isArray(item.products) ? item.products.length : 0),
            asset_name: firstProduct.asset_name || item.asset_name || "",
            quantity: firstProduct.quantity ?? item.quantity ?? "",
            uom: firstProduct.uom || item.uom || "",
            category: firstProduct.category || item.category || "",
            request_for: firstProduct.request_for || item.request_for || "",
            remarks: firstProduct.remarks || item.remarks || "",
            // keep original object for full-detail modal
            raw: item,
          };
        };

        const indentingData = rawIndenting.map(normalize);
        const salesData = rawSales.map(normalize);

        // Merge both and sort by newest created_at (fallback to updated_at)
        const combinedRequests = [...indentingData, ...salesData];
        combinedRequests.sort((a, b) => {
          const aTime = new Date(a.created_at || a.updated_at || 0).getTime();
          const bTime = new Date(b.created_at || b.updated_at || 0).getTime();
          return bTime - aTime; // newest first
        });
        setRequests(combinedRequests);

        if (combinedRequests.length > 0) {
          // Asset Options
          // collect asset names from products arrays (all products) first, fallback to top-level asset_name
          const allAssetNames = combinedRequests.flatMap((item) =>
            Array.isArray(item.products) && item.products.length > 0
              ? item.products.map((p) => p.asset_name)
              : [item.asset_name]
          );
          const uniqueAssetNames = [...new Set(allAssetNames.filter(Boolean))];
          setAssetOptions(uniqueAssetNames.sort());

          // Department Options
          const uniqueDeptIds = [
            ...new Set(
              combinedRequests
                .map((item) => item.dept_id)
                .filter((id) => id !== null && id !== undefined)
            ),
          ];
          const deptOpts = uniqueDeptIds
            .map((id) => ({
              value: id.toString(),
              label: `${deptIdToNameMap[id] || `Department ID ${id}`}`,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));
          setDepartmentOptions(deptOpts);

          // Status Options
          const uniqueStatuses = [
            ...new Set(
              combinedRequests.map((item) => item.status).filter(Boolean)
            ),
          ];
          setStatusOptions(uniqueStatuses.sort());
        } else {
          setAssetOptions([]);
          setDepartmentOptions([]);
          setStatusOptions([]);
        }
      } catch (error) {
        console.error("Error fetching indenting data:", error);
        setRequests([]);
        setAssetOptions([]);
        setDepartmentOptions([]);
        setStatusOptions([]);
        setModalProps({
          type: "error",
          title: "Error!",
          message: "Failed to fetch indenting or sales indenting data.",
        });
        setShowModal(true);
      }
    };

    fetchRequests();
  }, [token]);

  useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    axios
      .get(`${API.PURCHASE_API}/budget/department/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Budget API response:", res.data);
        // API returns { budgets: [...] }
        const budgets = Array.isArray(res.data.budgets)
          ? res.data.budgets.map((b) => ({
              id: b.id,
              budget_name: b.name, // Map name to budget_name for consistency
              name: b.name,
              workflow_id: b.workflow_id,
              workflow_name: b.workflow_name,
            }))
          : [];
        console.log("Parsed budgets:", budgets);
        setBudgetOptions(budgets);
      })
      .catch((err) => console.error("Error fetching budgets:", err));
  }, [token]);

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API.PURCHASE_API}/indenting/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests((prev) => prev.filter((request) => request.id !== id));
      setModalProps({
        type: "success",
        title: "Deleted!",
        message: "The indent has been deleted.",
      });
      setShowModal(true);
    } catch (error) {
      setModalProps({
        type: "error",
        title: "Error",
        message: "Failed to delete the indent.",
      });
      setShowModal(true);
      console.error("Delete error:", error);
    }
  };

  const handleEdit = (item) => {
    // Ensure products array exists for editing
    const products =
      Array.isArray(item.products) && item.products.length > 0
        ? item.products.map((p) => ({ ...p }))
        : [
            {
              id: item.id ?? null,
              asset_name: item.asset_name || "",
              quantity: item.quantity ?? "",
              uom: item.uom || "",
              category: item.category || "",
              request_for: item.request_for || "",
              remarks: item.remarks || "",
              budget: item.budget ?? item.budget_id ?? null,
            },
          ];

    setEditData({ ...item, products }); // item has request_for (lowercase f)
    setIsEditOpen(true);
    setIsRequestMaterialOpen(false);
  };

  const handleUpdate = async () => {
    if (!editData) return;

    try {
      // Build products payload from editData.products
      const productsPayload = (
        Array.isArray(editData.products) ? editData.products : []
      ).map((p) => ({
        id: p.id ?? null,
        asset_name: p.asset_name || "",
        quantity: Number(p.quantity) || 0,
        uom: p.uom || "",
        category: p.category || "",
        request_for: p.request_for || "",
        remarks: p.remarks || "",
        budget: p.budget ?? p.budget_id ?? null,
      }));

      const payload = {
        user_id: Number(createdBy) || null,
        indent_id: editData.indent_id ?? editData.id ?? null,
        products: productsPayload,
      };

      // Build URL and append indent_id as query parameter when available
        // await axios.delete(`${API.PURCHASE_API}/indenting/${id}`
      const baseUrl =
        `${API.PURCHASE_API}/indenting/update-details/`;
      const indentParam = payload.indent_id
        ? `${encodeURIComponent(payload.indent_id)}`
        : "";
      const url = `${baseUrl}${indentParam}`;

      const response = await axios.put(url, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        // Update local list: optimistic refresh using response.updatedIndenting or by mapping changed products
        // If backend returns updated indent, use it; otherwise, update locally from editData
        const updated = response.data?.updatedIndenting ?? null;
        setRequests((prev) =>
          prev.map((item) => {
            if (
              (item.id && item.id === editData.id) ||
              (item.indent_id && item.indent_id === editData.indent_id)
            ) {
              if (updated) return { ...item, ...updated };
              return { ...item, ...editData };
            }
            return item;
          })
        );
        setIsEditOpen(false);
        setModalProps({
          type: "success",
          title: "Success!",
          message: "Request updated successfully!",
        });
        setShowModal(true);
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to update request. Please try again.";
      setModalProps({ type: "error", title: "Error!", message: errorMessage });
      setShowModal(true);
      console.error("Update error:", error.response || error);
    }
  };

  const handleRequestMaterialClick = (item) => {
    setSelectedRequest(item);
    setIsRequestMaterialOpen(true);
    setIsEditOpen(false);
  };

  // Update product field in editData
  const handleProductChange = (index, field, value) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const products = Array.isArray(prev.products) ? [...prev.products] : [];
      products[index] = { ...products[index], [field]: value };
      return { ...prev, products };
    });
  };

  const handleRemoveProduct = (index) => {
    setEditData((prev) => {
      if (!prev) return prev;
      const products = Array.isArray(prev.products) ? [...prev.products] : [];
      products.splice(index, 1);
      return { ...prev, products };
    });
  };

  useEffect(() => {
    const fetchCategoryOptions = async () => {
      if (requestfor) {
        try {
          const response = await axios.get(
            `${API.PURCHASE_API}/assets?request_for=${requestfor}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const categories = Array.isArray(response.data)
            ? response.data.map((item) => item.category)
            : [];
          setCategoryOptions([...new Set(categories)].sort());
        } catch (error) {
          console.error("Error fetching category options:", error);
          setCategoryOptions([]);
        }
      } else {
        setCategoryOptions([]);
      }
    };

    fetchCategoryOptions();
  }, [requestfor, token]);

  const handleAssetChange = (e) => {
    setAsset(e.target.value);
    setStatus("");
  };

  const handlerequestforChange = (e) => {
    setRequestfor(e.target.value);
    setAsset(""); // Reset category selection
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    // setAsset("");
  };

  useEffect(() => {
    const fetchCategoryOptionsForEdit = async () => {
      if (editData?.request_for) {
        try {
          const response = await axios.get(
            `${API.PURCHASE_API}/assets?request_for=${editData.request_for}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const categories = Array.isArray(response.data)
            ? response.data.map((item) => item.category)
            : [];
          setCategoryOptions([...new Set(categories)].sort());
        } catch (error) {
          console.error("Error fetching category options for edit:", error);
          setCategoryOptions([]);
        }
      }
    };

    if (isEditOpen && editData) {
      fetchCategoryOptionsForEdit();
    }
  }, [editData, isEditOpen, token]);

  const requestForOptions = [
    { value: "Movable", label: "Movable" },
    { value: "Raw Materials", label: "Raw Materials" },
    { value: "Sales", label: "Sales" },
  ];
  const categorySelectOptions = categoryOptions.map((cat) => ({
    value: cat,
    label: cat,
  }));
    const statusSelectOptions = statusOptions.map((s) => ({ value: s, label: s }));
  const handleStatusSelectChange = (opt) => {
    setStatus(opt?.value || "");
  };
  const exportData = filteredRequests.map((item, idx) => ({
    sno: idx + 1,
    request_for: item.request_for,
    category: item.category,
    asset_name: item.asset_name,
    quantity: item.quantity,
    uom: item.uom,
    status: item.status,
  }));
  const getBudgetDisplayName = (budgetVal) => {
    if (budgetVal === null || budgetVal === undefined) return "";
    const found = budgetOptions.find(
      (b) =>
        String(b.id) === String(budgetVal) ||
        String(b.budget_name) === String(budgetVal)
    );
    return found ? found.budget_name : String(budgetVal);
  };  return (
    <div className="p-2">
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="text"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded-xl"
        />

        <div style={{ minWidth: 180 }}>
          <Select
            options={requestForOptions}
            value={
              requestForOptions.find((opt) => opt.value === requestfor) || null
            }
            onChange={(opt) =>
              handlerequestforChange({ target: { value: opt?.value || "" } })
            }
            placeholder="Request for"
            isClearable
          />
        </div>

        <div style={{ minWidth: 180 }}>
          <Select
            options={categorySelectOptions}
            value={
              categorySelectOptions.find((opt) => opt.value === asset) || null
            }
            onChange={(opt) =>
              handleAssetChange({ target: { value: opt?.value || "" } })
            }
            placeholder="All Category"
            isClearable
          />
        </div>

         <div style={{ minWidth: 180 }}>
          <Select
            options={statusSelectOptions}
            value={statusSelectOptions.find((opt) => opt.value === status) || null}
            onChange={(opt) => handleStatusSelectChange(opt)}
            placeholder="All Status"
            isClearable
          />
        </div>
        <div className="flex-1 flex justify-end">
          <DownloadTableButtons
            data={exportData}
            columns={columns}
            fileName="AllRequests"
          />
        </div>
      </div>
      <div
        className=" rounded-lg shadow bg-white p-4"
        style={{ maxHeight: 600, overflowY: "auto", minWidth: 900 }}
      >
        <table className="w-full bg-white rounded-lg border-collapse">
          <thead className="border-b-2 border-black  bg-white z-10">
            <tr>
              <th className="p-2 text-center">S. No.</th>
              <th className="p-2 text-center">Indent ID</th>
              <th className="p-2 text-center"> User ID</th>

              <th className="p-2 text-center"> Created At</th>
              <th className="p-2 text-center"> Stage </th>
              <th className="p-2 text-center">Status</th>
              <th className="p-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequests.length > 0 ? (
              paginatedRequests.map((item, index) => (
                <tr key={item.indent_id || item.id} className="odd:bg-blue-50">
                  <td className="p-2 text-center">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>{" "}
                  <td
                    className="p-2 text-center text-blue-600 cursor-pointer"
                    onClick={() => handleRequestMaterialClick(item)}
                  >
                    {item.indent_id}
                  </td>
                  <td className="p-2 text-center">{item.user_id}</td>
                  <td className="p-2 text-center">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-2 text-center">{item.stage || "N/A"}</td>
                  <td
                    className={`p-2 text-center ${
                      item.status === "Pending"
                        ? "text-orange-500"
                        : item.status === "Approved"
                        ? "text-green-500"
                        : item.status === "Rejected"
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {item.status}
                  </td>
                  <td className="p-2 flex justify-center items-center gap-4">
                    {/* Edit Action */}
                    <div
                      className={`relative group flex items-center justify-center ${
                        item.status === "Pending" ||
                        item.status === "Resubmitted"
                          ? "cursor-pointer"
                          : "cursor-not-allowed opacity-40"
                      }`}
                      onClick={() => {
                        if (
                          item.status === "Pending" ||
                          item.status === "Resubmitted"
                        ) {
                          handleEdit(item);
                        }
                      }}
                    >
                      <FaEdit className="text-blue-500 text-lg" />

                      {/* Tooltip for disabled status */}
                      {item.status !== "Pending" &&
                        item.status !== "Resubmitted" && (
                          <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            Edit not allowed
                          </div>
                        )}
                    </div>

                    {/* Delete Action */}
                    <div
                      className={`flex items-center justify-center cursor-pointer ${
                        item.status === "Approved"
                          ? "opacity-40 cursor-not-allowed"
                          : ""
                      }`}
                      onClick={() => {
                        if (item.status !== "Approved") {
                          setDeleteId(item.id ?? item.indent_id);
                          setShowDeleteModal(true);
                        }
                      }}
                    >
                      <FaTrash className="text-red-500" size={16} />{" "}
                      {/* 👈 smaller size */}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex items-center gap-2 mt-4 justify-center">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 bg-white border-gray-300  border rounded disabled:opacity-50"
        >
          &lt;
        </button>

        <button className="px-4 py-2 bg-custome-blue border-custome-blue  text-white rounded">
          {currentPage}
        </button>

        <span className="px-2">of</span>

        <button className="px-4 py-2 border rounded text-custome-blue">
          {totalPages}
        </button>

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="px-3 py-2 bg-white border-gray-300 border rounded disabled:opacity-50"
        >
          &gt;
        </button>
      </div>

      {isEditOpen && editData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] md:w-[50%] max-h-[80vh] overflow-y-auto shadow-lg mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Raise Request</h2>
              <button
                onClick={() => setIsEditOpen(false)}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <span className="text-gray-600 text-lg">✖</span>
              </button>
            </div>

            <div className="mb-4 text-sm">
                <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-xs text-gray-500">Indent Id</span>
                  <span className="font-medium">
                    {editData.indent_id || editData.id || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Created By</span>
                  <span className="font-medium">
                    {editData.user_id || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-left">Sr.No.</th>
                    <th className="p-3 text-left">Request for</th>
                    <th className="p-3 text-left">Category</th>
                    <th className="p-3 text-left">Material</th>
                    <th className="p-3 text-left">Quantity</th>
                    <th className="p-3 text-left">Uom</th>
                    <th className="p-3 text-left">Budget</th>
                    <th className="p-3 text-left"> </th>
                  </tr>
                </thead>
                <tbody>
                  {(Array.isArray(editData.products)
                    ? editData.products
                    : []
                  ).map((p, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="p-3 align-top">{idx + 1}.</td>
                      <td className="p-3 align-top">
                        <input
                          type="text"
                          value={p.request_for || ""}
                          onChange={(e) =>
                            handleProductChange(
                              idx,
                              "request_for",
                              e.target.value
                            )
                          }
                          className="border p-2 rounded w-full"
                        />
                      </td>
                      <td className="p-3 align-top">
                        <input
                          type="text"
                          value={p.category || ""}
                          onChange={(e) =>
                            handleProductChange(idx, "category", e.target.value)
                          }
                          className="border p-2 rounded w-full"
                        />
                      </td>
                      <td className="p-3 align-top">
                        <input
                          type="text"
                          value={p.asset_name || ""}
                          onChange={(e) =>
                            handleProductChange(
                              idx,
                              "asset_name",
                              e.target.value
                            )
                          }
                          className="border p-2 rounded w-full"
                        />
                      </td>
                      <td className="p-3 align-top">
                        <input
                          type="number"
                          value={p.quantity ?? ""}
                          onChange={(e) =>
                            handleProductChange(idx, "quantity", e.target.value)
                          }
                          className="border p-2 rounded w-24"
                        />
                      </td>
                      <td className="p-3 align-top">
                        <input
                          type="text"
                          value={p.uom || ""}
                          onChange={(e) =>
                            handleProductChange(idx, "uom", e.target.value)
                          }
                          className="border p-2 rounded w-28"
                        />
                      </td>
                      <td className="p-3 align-top">
                        <input
                          type="number"
                          value={p.budget ?? p.budget_id ?? ""}
                          onChange={(e) =>
                            handleProductChange(idx, "budget", e.target.value)
                          }
                          className="border p-2 rounded w-28"
                        />
                      </td>
                      <td className="p-3 align-top text-right">
                        <button
                          onClick={() => handleRemoveProduct(idx)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          ✖
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-start gap-4 mt-6">
              <button
                onClick={handleUpdate}
                className="bg-[#005AE6] min-w-[140px] text-white p-3 rounded-lg hover:bg-blue-700"
              >
                Update
              </button>
              <button
                onClick={() => setIsEditOpen(false)}
                className="border border-black min-w-[140px] p-3 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <PopupModal
          type={modalProps.type}
          title={modalProps.title}
          message={modalProps.message}
          onClose={() => setShowModal(false)}
        />
      )}
      {showDeleteModal && (
        <PopupModal
          type="delete"
          title="Are you sure?"
          message="This action cannot be undone."
          onConfirm={async () => {
            await handleDelete(deleteId);
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteId(null);
          }}
        />
      )}
      {isRequestMaterialOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-[90%] md:w-[50%] max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Raise request details</h2>
              <div className="flex items-center gap-3">
                {selectedRequest?.status && (
                  <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium">
                    {selectedRequest.status}
                  </span>
                )}
                <button
                  onClick={() => setIsRequestMaterialOpen(false)}
                  aria-label="Close"
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <span className="text-gray-600 text-lg">✖</span>
                </button>
              </div>
            </div>

            <div className="text-sm">
              <div className="mb-4 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Indent Id:</span>
                    <span className="font-medium">
                      {selectedRequest.indent_id || selectedRequest.id || "N/A"}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-gray-500">Created By:</span>
                    <span className="font-medium">
                      {selectedRequest.user_id || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Products table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Sr.No.</th>
                      <th className="p-3 text-left">Request for</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Material</th>
                      <th className="p-3 text-left">Quantity</th>
                      <th className="p-3 text-left">Uom</th>
                      {/* <th className="p-3 text-left">Workflow</th> */}
                      <th className="p-3 text-left">Budget</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(Array.isArray(selectedRequest.products) &&
                    selectedRequest.products.length > 0
                      ? selectedRequest.products
                      : [
                          {
                            asset_name: selectedRequest.asset_name,
                            category: selectedRequest.category,
                            quantity: selectedRequest.quantity,
                            uom: selectedRequest.uom,
                            request_for: selectedRequest.request_for,
                            budget_id: selectedRequest.budget_id,
                          },
                        ]
                    ).map((p, idx) => (
                      <tr
                        key={idx}
                        className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="p-3 align-top">{idx + 1}.</td>
                        <td className="p-3 align-top">
                          <div className="font-medium">
                            {p.request_for || "-"}
                          </div>
                          {p.remarks && (
                            <div className="text-xs text-gray-500">
                              {p.remarks}
                            </div>
                          )}
                        </td>
                        <td className="p-3 align-top">{p.category || "-"}</td>
                        <td className="p-3 align-top">{p.asset_name || "-"}</td>
                        <td className="p-3 align-top">{p.quantity ?? "-"}</td>
                        <td className="p-3 align-top">{p.uom || "-"}</td>
                        {/* <td className="p-3 align-top">
                          {selectedRequest.workflow_id || "-"}
                        </td> */}
                        <td className="p-3 align-top">
                          {getBudgetDisplayName(p.budget_id ?? selectedRequest.budget_id)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Remarks shown only for Rejected and Resubmitted statuses */}
              {(selectedRequest.status === "Rejected" ||
                selectedRequest.status === "Resubmitted") && (
                <div className="mt-4">
                  <p className="font-semibold mb-1">Remark</p>
                  <div className="p-3 border rounded-lg bg-white text-sm text-justify">
                    {selectedRequest.remarks || "No description provided."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllRequest;
