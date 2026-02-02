import React, { useState, useEffect } from "react";
import Select from "react-select";
import { Modal, Box } from "@mui/material";
import axios from "axios";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase"
const UpdateMaterialRequest = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  const token = sessionStorage.getItem("token");

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(location?.state?.category || "");
  const [tableData, setTableData] = useState({ columns: [], data: [] });
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedActionAsset, setSelectedActionAsset] = useState(null);
  const [selectedAction, setSelectedAction] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // Category dropdown values
  const categoryOptions = categories.map((category) => ({
    value: category.categoriesname,
    label: category.categoriesname,
  }));

  const handleCategoryChange = (selectedOption) => {
    setFormData({ ...formData, category: selectedOption.value });
    setSelectedCategory(selectedOption.value);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const filtered = tableData.data.filter((row) =>
      Object.values(row).some((val) =>
        (val ?? "").toString().toLowerCase().includes(value.toLowerCase())
      )
    );
    setFilteredData(filtered);
  };

  const paginate = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const getStageColor = (stage) => {
    const colors = [ "text-blue-500", "text-purple-500"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const formatStages = (stages) => {
    if (!stages) return "";
    const formatted = stages.replace(/([a-z])([A-Z])/g, "$1 $2");
    return (
      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStageColor(stages)}`}>
        {formatted}
      </span>
    );
  };

  const openApprovalModal = (asset) => {
    setSelectedActionAsset(asset);
    setModalOpen(true);
    setSelectedAction("");
  };

const handleConfirmAction = async () => {
  if (!selectedAction) return alert("Please select an action");

  const token = sessionStorage.getItem("token"); // get token
  const userId = sessionStorage.getItem("userId");

  try {
    const payload = {
      user_id: Number(userId),
      action: "AssetApproval",
      new_stage: selectedAction,
      submodule:"Raw material"
    };

    await axios.put(
      `${ASSET_NODE_BASE}assets/temp-asset/quantity-lifecycle/${selectedActionAsset.temp_id}`, // ✅ using temp_id
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`, // add token here
          "Content-Type": "application/json",
        },
      }
    );

    setMessage("Action completed successfully");
    setMessageType("success");
    setModalOpen(false);

    // Refresh data
    const res = await axios.get(`${ASSET_NODE_BASE}assets/get-temp-assets`, {
      headers: {
        Authorization: `Bearer ${token}`, // add token here too
      },
    });

    setTableData({ columns: [], data: res.data || [] });
    setFilteredData(res.data || []);
  } catch (error) {
    console.error("Action failed:", error);
    setMessage("Action failed");
    setMessageType("error");
  }
};

useEffect(() => {
  const fetchTempAssets = async () => {
    const token = sessionStorage.getItem("token"); // get token

    try {
      const res = await axios.get(
        `${ASSET_NODE_BASE}assets/get-temp-assets`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // add token here
          },
        }
      );

      setTableData({ columns: [], data: res.data || [] });
      setFilteredData(res.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    }
  };

  fetchTempAssets();
}, []);

  return (
    <div className="p-4 space-y-6 min-h-screen">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* <Select
          options={categoryOptions}
          value={categoryOptions.find((opt) => opt.value === selectedCategory)}
          onChange={handleCategoryChange}
          placeholder="Select Material Category"
          className="w-full md:w-[250px] text-sm"
          isSearchable
        /> */}

        <input
          type="text"
          placeholder="Search.."
          className="px-3 py-2 border rounded-lg w-full md:w-[300px]"
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[65vh]">
          <table className="min-w-full table-auto text-sm border-collapse">
            <thead className="sticky top-0 bg-white border-b-2 border-black text-[16px] font-medium ">
              <tr>
                <th className="p-5 text-center">S.no</th>
                <th className="p-5 text-center">Material Name</th>
                <th className="p-5 text-center">UOM</th>
                <th className="p-5 text-center">Quantity</th>
                <th className="p-5 text-center">Total Cost</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 text-center">Stage</th>
                <th className="p-5 text-center">Sub Stage</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginate(filteredData.filter((d) => d.status === "Repository")).map((asset, index) => (
                <tr
                  key={index}
                  className="odd:bg-white even:bg-blue-50 hover:bg-blue-100"
                >
                  <td className="text-center p-3">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td className="text-center p-3">{asset.material_name}</td>
                  <td className="text-center p-3">{asset.uom}</td>
                  <td className="text-center p-3">{asset.quantity}</td>
                  <td className="text-center p-3">{asset["Total Cost"]}</td>
                  <td className="text-center p-3">{asset.status}</td>
                  <td className="text-center p-3">{formatStages(asset.stages)}</td>
                  <td className="text-center p-3">{formatStages(asset.sub_stages)}</td>
                  <td className="text-center p-3">
                  <button
  onClick={() => openApprovalModal(asset)}
  className="text-blue-600 hover:text-blue-800"
>
  <FaEye />
</button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap justify-center gap-3 p-3 text-sm">
            <button
              onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              &lt;
            </button>
            <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
            <span className="text-sm font-medium">of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* Action Modal */}
    {/* Action Modal */}
<Modal open={modalOpen} onClose={() => setModalOpen(false)}>
  <div className="fixed inset-0 flex items-center justify-center backdrop-blur-[1px] bg-black bg-opacity-40 z-50">
    <div className="bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl p-6 transition-all duration-300">

      {/* Header Icon */}
      <div className="flex items-center justify-center mb-4">
        <span className="text-3xl">🛠️</span>
      </div>

      {/* Title */}
      <h2 className="text-center text-xl md:text-2xl font-bold text-gray-800 mb-2">
        Confirm Asset Action
      </h2>
      <p className="text-center text-gray-600 text-sm mb-6">
        Please choose whether to approve or reject this material request.
      </p>

      {/* Toggle Buttons */}
      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => setSelectedAction("Approved")}
          className={`px-5 py-2 rounded-lg text-sm font-medium border transition 
            ${selectedAction === "Approved" 
              ? "bg-green-600 text-white border-green-600 shadow" 
              : "bg-white text-gray-800 border-gray-300 hover:border-green-500"}`}
        >
          ✅ Approve
        </button>
        <button
          onClick={() => setSelectedAction("Rejected")}
          className={`px-5 py-2 rounded-lg text-sm font-medium border transition 
            ${selectedAction === "Rejected" 
              ? "bg-red-600 text-white border-red-600 shadow" 
              : "bg-white text-gray-800 border-gray-300 hover:border-red-500"}`}
        >
          ❌ Reject
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={handleConfirmAction}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Confirm Action
        </button>
        <button
          onClick={() => setModalOpen(false)}
          className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</Modal>


      {/* Message Modal */}
      <MessageModal message={message} type={messageType} setMessage={setMessage} />
    </div>
  );
};

export default UpdateMaterialRequest;
