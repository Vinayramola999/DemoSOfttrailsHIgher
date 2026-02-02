import React, { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import { FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import MessageModal from "../ApprovalAuthority/MessageModal";
import { DMS_BASE, JAVA_BASE, ASSET_NODE_BASE, UCS_BASE, MAIN_BASE, WORKFLOW_BASE } from "../../config/apiBase"
const IndentModal = ({ asset, onClose }) => {
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");

  const [workflowList, setWorkflowList] = useState([]);
  const [budgetList, setBudgetList] = useState([]);
  const [categoryName, setCategoryName] = useState("Loading...");

  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);

  const [loadingCategory, setLoadingCategory] = useState(true);
  const [loadingBudget, setLoadingBudget] = useState(true);
  const [loadingWorkflow, setLoadingWorkflow] = useState(true);

  // ---------- MESSAGE MODAL STATES ----------
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, warning

  const token = sessionStorage.getItem("token");
  const user_id = sessionStorage.getItem("userId");
  const categoryId = asset?.category_id;

  // Fetch Category
  useEffect(() => {
    if (!categoryId) return;

    axios
      .get(
        `${JAVA_BASE}api/categories/rawmaterials`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        const match = res.data.find((c) => c.categoryId === categoryId);
        setCategoryName(match ? match.categoriesname : "N/A");
      })
      .finally(() => setLoadingCategory(false));
  }, [categoryId]);

  // Workflow list
  useEffect(() => {
    axios
      .get(
        "https://devapi.softtrails.net/saas/uniworkflow/workflow/get-modules/module?module_name=Purchase%20Management&sub_module_name=Indenting",
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setWorkflowList(
          res.data?.workflows?.map((w) => ({
            value: w.workflow_id,
            label: w.workflow_name,
          })) || []
        );
      })
      .finally(() => setLoadingWorkflow(false));
  }, []);

  // Budget list
  useEffect(() => {
    axios
      .get(
        `https://devapi.softtrails.net/saas/purchase/test/purchase/budget/department/${user_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setBudgetList(
          (res.data?.budget_name || []).map((b) => ({
            value: b.id,
            label: b.name,
          }))
        );
      })
      .finally(() => setLoadingBudget(false));
  }, [asset]);

  // ----------- SUBMIT HANDLER WITH MESSAGE MODAL -----------
  const handleSubmit = async () => {
    if (!selectedWorkflow || !selectedBudget || !quantity) {
      setMessage("Please fill all required fields");
      setMessageType("warning");
      return;
    }

    const payload = {
      user_id,
      workflow_id: selectedWorkflow.value,
      products: [
        {
          asset_name: asset.material_name,
          quantity: Number(quantity),
          uom: asset.uom,
          category: categoryName,
          request_for: "Raw Materials",
          remarks,
          budget: selectedBudget.value,
        },
      ],
    };

    try {
      await axios.post(
        "https://devapi.softtrails.net/saas/purchase/test/purchase/indenting",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // SUCCESS MESSAGE
      setMessage("Indent Created Successfully!");
      setMessageType("success");

      // Auto-close modal after message disappears
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      // ERROR MESSAGE
      setMessage("Indent request failed. Please try again.");
      setMessageType("error");
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* CLEAN COMPACT MODAL */}
          <motion.div
            initial={{ scale: 0.87, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.87, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-xl shadow-xl w-[90%] sm:w-[70%] md:w-[45%] p-6"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-semibold text-gray-800">
                Raise Indent Request
              </h2>

              <button
                onClick={onClose}
                className="text-gray-600 hover:text-red-600 text-2xl"
              >
                <FiX />
              </button>
            </div>

            {/* GRID: 2 per row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">Material Name</label>
                <input
                  readOnly
                  value={asset.material_name}
                  className="w-full mt-1 p-2 border rounded-md text-sm bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">UOM</label>
                <input
                  readOnly
                  value={asset.uom}
                  className="w-full mt-1 p-2 border rounded-md text-sm bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Category</label>
                <input
                  readOnly
                  value={loadingCategory ? "Loading..." : categoryName}
                  className="w-full mt-1 p-2 border rounded-md text-sm bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Workflow</label>
                <Select
                  isLoading={loadingWorkflow}
                  options={workflowList}
                  value={selectedWorkflow}
                  onChange={setSelectedWorkflow}
                  placeholder="Select Workflow"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Budget</label>
                <Select
                  isLoading={loadingBudget}
                  options={budgetList}
                  value={selectedBudget}
                  onChange={setSelectedBudget}
                  placeholder="Select Budget"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md text-sm"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            {/* REMARKS */}
            <div className="mb-5">
              <label className="text-sm text-gray-600">Remarks</label>
              <textarea
                rows={3}
                className="w-full p-2 border rounded-md text-sm"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Write remarks..."
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded-md text-sm hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="px-5 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Submit Indent
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* GLOBAL MESSAGE MODAL */}
      <MessageModal message={message} type={messageType} setMessage={setMessage} />
    </>
  );
};

export default IndentModal;
