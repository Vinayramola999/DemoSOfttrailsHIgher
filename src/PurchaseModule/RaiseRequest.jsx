import { Select, MenuItem, TextField, Autocomplete } from "@mui/material";
import axios from "axios";
import API from "../config/api";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Icon } from "@iconify/react";
import PopupModal from "./PopupModal";

const RaiseRequest = ({ deptName }) => {
  const getToken = () => sessionStorage.getItem("token");
  const token = getToken();
  const [assetType, setAssetType] = useState(" "); // Default to "new"
  const [requestFor, setRequestFor] = useState("");
  const [category, setCategory] = useState("");
  const [requestAsset, setRequestAsset] = useState("");
  const [customAsset, setCustomAsset] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [uom, setUom] = useState("");
  const [materialData, setMaterialData] = useState([]);
  const createdBy = sessionStorage.getItem("userId");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [allocation, setAllocation] = useState(null);
  const [requestForOptions, setRequestForOptions] = useState([
    "Movable",
    "Raw Materials",
    "Sales",
    "Create New",
  ]);
  const [showCreateNewInput, setShowCreateNewInput] = useState(false);
  const [newRequestForValue, setNewRequestForValue] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [assetOptions, setAssetOptions] = useState([]);
  const [workflowOptions, setWorkflowOptions] = useState([]); // Stores fetched workflows
  const [selectedWorkflow, setSelectedWorkflow] = useState(""); // Stores selected workflow
  const [budgetOptions, setBudgetOptions] = useState([]); // Store All Budgets
  const [selectedBudget, setSelectedBudget] = useState("");
  const { userId } = useParams();
  const [employeeId, setEmployeeId] = useState(null);
  const navigate = useNavigate();

  // Predefined UOM options
  const uomOptions = [
    "Pieces",
    "kg",
    "Liter",
    "Meter",
    "Box",
    "Packet",
    "Roll",
    "Set",
    "Pair",
    "Case",
    "Bundle",
    "Dozen",
    "Bag",
    "Bottle",
    "Carton",
    "Gram",
    "Gallon",
    "Pack",
  ];

  const canShowRestOfForm = requestFor && category;
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState({
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    const storedEmployeeId = sessionStorage.getItem("employeeeId");
    if (storedEmployeeId) {
      setEmployeeId(storedEmployeeId);
    }
  }, [userId]);

  const resetForm = () => {
    setRequestAsset("");
    setCategory("");
    setRequestFor("");
    setSelectedWorkflow("");
    setBudget("");
    setQuantity("");
    setUom("");
    setBudget("");
    setDescription("");

      setProducts([]);  

  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // If user added multiple products, send them as products array
    let payload;
    if (products && products.length > 0) {
      payload = {
        user_id: createdBy,
        workflow_id: selectedWorkflow,
        products: products.map((p) => ({
          asset_name: p.asset_name,
          quantity: p.quantity,
          uom: p.uom,
          category: p.category,
          request_for: p.request_for,
          remarks: p.remarks || "",
          budget: p.budget,
        })),
      };
    } else {
      const assetToSubmit =
        requestAsset === "Others" ? customAsset : requestAsset;
      const missingFields = [];

      if (!requestFor) missingFields.push("Request For");
      if (!category) missingFields.push("Category");
      if (!assetToSubmit) missingFields.push("Asset");
      if (!quantity) missingFields.push("Quantity");
      if (!uom) missingFields.push("UOM");
      if (!selectedBudget) missingFields.push("Budget");

      if (missingFields.length > 0) {
        setModalProps({
          type: "error",
          title: "Missing Fields!",
          message: (
            <div>
              <div className="mb-2 text-base">
                Please fill the following fields before submitting:
              </div>
              <div className="text-sm text-gray-700">
                {missingFields.join(", ")}
              </div>
            </div>
          ),
        });

        setShowModal(true);
        return;
      }
      payload = {
        user_id: createdBy,
        workflow_id: selectedWorkflow,
        products: [
          {
            asset_name: assetToSubmit,
            quantity: Number(quantity),
            uom,
            category,
            request_for: requestFor,
            remarks: description || "",
            budget: selectedBudget,
          },
        ],
      };
    }

    try {
      const response = await axios.post(
        `${API.PURCHASE_API}/indenting`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Response:", response.data);

      setModalProps({
        type: "success",
        title: "Success!",
        message: "Request submitted successfully!",
      });
      setShowModal(true);

      // Optional: clear form after success
      setRequestFor("");
      setCategory("");
      setRequestAsset("");
      setCustomAsset("");
      setQuantity("");
      setUom("");
      setDescription("");
      setSelectedWorkflow("");
      setSelectedBudget("");
      setProducts([]);
    } catch (error) {
      let errorMessage = "Failed to submit request. Please try again.";
      let errorCode = error.response?.status;

      if (error.response) {
        const data = error.response.data;

        if (typeof data === "string") {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }

        // Customize error based on known codes/messages
        if (errorCode === 404 && errorMessage.includes("User")) {
          errorMessage = "User not found.";
        } else if (errorCode === 404 && errorMessage.includes("Workflow")) {
          errorMessage = " Workflow not found.";
        } else if (errorCode === 404 && errorMessage.includes("Budget")) {
          errorMessage = " Budget not associated with this workflow.";
        } else if (errorCode === 403 && errorMessage.includes("not assigned")) {
          errorMessage = " User is not assigned to this workflow.";
        } else if (
          errorCode === 403 &&
          errorMessage.includes("roles assigned") // or use partial match
        ) {
          errorMessage = " No roles assigned for this workflow or this action.";
        } else if (errorCode === 403 && errorMessage.includes("authorized")) {
          errorMessage = " User role not authorized for this workflow.";
        } else if (
          errorCode === 500 &&
          errorMessage.toLowerCase().includes("error creating")
        ) {
          errorMessage = "Error creating indenting request.";
        }
      }
      resetForm(); // from useForm()

      Swal.fire({
        title: `Error ${errorCode || ""}`,
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleYesClick = () => {
    navigate("/RepoAllTab", {
      state: {
        requestFor, // selected "requestedFor"
        category, // selected "category"
        requestAsset, // selected "material"
        type: "inventory", // ✅ hardcoded value
      },
    });
  };

  const [existingQuantity, setExistingQuantity] = useState(null);
  const [products, setProducts] = useState([]); // items user added for multi-indent
  // Helper to render values safely in table cells
  const formatDisplay = (v) => {
    if (v === null || v === undefined) return "";
    if (typeof v === "string" || typeof v === "number") return v;
    if (typeof v === "object") {
      // try common properties
      if (v.name) return v.name;
      if (v.budget_name && typeof v.budget_name === "string")
        return v.budget_name;
      if (v.budget_name && v.budget_name.name) return v.budget_name.name;
      if (v.asset_name) return v.asset_name;
      if (v.material_name) return v.material_name;
      if (v.label) return v.label;
      if (v.workflow_name) return v.workflow_name;
      if (v.category) return v.category;
      try {
        return JSON.stringify(v);
      } catch (e) {
        return String(v);
      }
    }
    return String(v);
  };
  // Dropdown for Category
  useEffect(() => {
    if (requestFor) {
      const formattedRequestFor = requestFor.toLowerCase().replace(/\s+/g, "");

      // Fetch both APIs, but handle errors separately
      Promise.allSettled([
        axios.get(
          // https://devapi.softtrails.net/saas/java/test/api/categories
          `${API.PRO_API}/categories/${formattedRequestFor}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(`${API.PURCHASE_API}/assets?request_for=${requestFor}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]).then(([res1, res2]) => {
        let categoriesFromFirstAPI = [];
        let categoriesFromSecondAPI = [];

        if (res1.status === "fulfilled" && Array.isArray(res1.value.data)) {
          categoriesFromFirstAPI = res1.value.data.map(
            (cat) => cat.categoriesname
          );
        }
        if (res2.status === "fulfilled" && Array.isArray(res2.value.data)) {
          categoriesFromSecondAPI = res2.value.data.map(
            (item) => item.category
          );
        }

        const mergedCategories = [
          ...new Set([
            ...categoriesFromFirstAPI.filter(Boolean),
            ...categoriesFromSecondAPI.filter(Boolean),
          ]),
        ];

        setCategoryOptions(mergedCategories);
        setCategory(""); // Reset category selection
        setAssetOptions([]); // Reset material options
      });
    }
  }, [requestFor]);

  const handleAddItem = () => {
    const assetToAdd = requestAsset === "Others" ? customAsset : requestAsset;
    const missingFields = [];
    if (!requestFor) missingFields.push("Request For");
    if (!category) missingFields.push("Category");
    if (!assetToAdd) missingFields.push("Material");
    if (!quantity) missingFields.push("Quantity");
    if (!uom) missingFields.push("UOM");
    if (!selectedBudget) missingFields.push("Budget");

    if (missingFields.length > 0) {
      setModalProps({
        type: "warning",
        title: "Missing Fields",
        message: `Please fill: ${missingFields.join(", ")}`,
      });
      setShowModal(true);
      return;
    }

    const newItem = {
      asset_name: assetToAdd,
      quantity: Number(quantity),
      uom,
      category,
      request_for: requestFor,
      remarks: description || "",
      budget: selectedBudget?.id,
    };

    setProducts((p) => [...p, newItem]);

    // clear only item-specific fields (keep workflow if needed)
    setRequestAsset("");
    setCustomAsset("");
    setQuantity(0);
    setUom("");
    setDescription("");
  };

  const handleRemoveProduct = (idx) => {
    setProducts((p) => p.filter((_, i) => i !== idx));
  };

  // Fetch and combine data from both APIs when category or requestFor changes
  useEffect(() => {
    if (category) {
      const fetchFromPurchase = axios.get(
        `${API.PURCHASE_API}/assets?request_for=${requestFor}&category=${category}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const fetchFromColumnTypes = axios.get(
        `${API.COLUMN_TYPES_API}/getColumnTypesAndData/${category}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Promise.allSettled([fetchFromPurchase, fetchFromColumnTypes])
        .then((results) => {
          // results[0] -> fetchFromPurchase, results[1] -> fetchFromColumnTypes
          const purchaseResult = results[0];
          const columnResult = results[1];

          const purchaseArray =
            purchaseResult.status === "fulfilled"
              ? Array.isArray(purchaseResult.value.data)
                ? purchaseResult.value.data
                : Array.isArray(purchaseResult.value.data?.data)
                ? purchaseResult.value.data.data
                : []
              : [];

          const columnArray =
            columnResult.status === "fulfilled"
              ? Array.isArray(columnResult.value.data)
                ? columnResult.value.data
                : Array.isArray(columnResult.value.data?.data)
                ? columnResult.value.data.data
                : []
              : [];

          // If one API failed but the other returned data, use the available data
          const purchaseAssets = purchaseArray.map((item) => ({
            asset_name:
              item.asset_name ||
              item.material_name ||
              item.name ||
              item.asset ||
              "",
            quantity: item.quantity,
            uom: item.uom,
            source: "purchaseAssets",
            ...item,
          }));

          const columnAssets = columnArray.map((item) => ({
            asset_name:
              item.material_name ||
              item["Asset Name"] ||
              item.asset_name ||
              item.name ||
              "",
            quantity: item.quantity,
            uom: item.uom,
            unit_cost: item["Unit Cost"] || item.unit_cost,
            status: item.status,
            created_at: item.created_at,
            source: "columnTypes",
            ...item,
          }));

          const combined = [...purchaseAssets, ...columnAssets];
          const filtered = combined.filter((item) => item.asset_name);

          const uniqueAssetNames = [
            ...new Set(filtered.map((i) => i.asset_name)),
          ].filter(Boolean);

          // Debug logs
          console.debug(
            "Assets API (purchase) fulfilled:",
            purchaseResult.status === "fulfilled"
          );
          console.debug(
            "Assets API (columnTypes) fulfilled:",
            columnResult.status === "fulfilled"
          );
          console.debug("Combined asset list:", filtered);
          console.debug("Unique asset names:", uniqueAssetNames);

          setAssetOptions(uniqueAssetNames);
          setMaterialData(filtered);
          setRequestAsset("");
        })
        .catch((err) => console.error("Error combining asset results:", err));
    }
  }, [assetType, category, requestFor]);

  // Debug: log assetOptions and current requestAsset to help troubleshoot missing dropdown options
  useEffect(() => {
    console.debug("RaiseRequest: assetOptions ->", assetOptions);
    console.debug("RaiseRequest: requestAsset ->", requestAsset);
  }, [assetOptions, requestAsset]);

  useEffect(() => {
    if (requestAsset && materialData.length > 0) {
      const matched = materialData.find(
        (item) => item?.material_name === requestAsset
      );
      if (matched) {
        setExistingQuantity(matched.quantity || 0);
      } else {
        setExistingQuantity(null);
      }
    }
  }, [requestAsset, assetType, materialData]);

  //Fetch workflow
  useEffect(() => {
    axios
      .get(
        `${API.WORKFLOW_API}/workflow/get-modules/module?module_name=Purchase Management&sub_module_name=Indenting`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        setWorkflowOptions(
          Array.isArray(res.data.workflows) ? res.data.workflows : []
        );
        console.log("Fetched workflow options:", res.data.workflows);
      })
      .catch((err) => console.error("Error fetching workflows:", err));
  }, []);

  // useEffect(() => {
  //   const userId = sessionStorage.getItem("userId");
  //   if (!userId) return;

  //   axios
  //     .get(`${API.PURCHASE_API}/budget/department/${userId}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     })
  //     .then((res) => {
  //       // Convert budget_name array to array of objects including workflow_id
  //       const names = Array.isArray(res.data.budget_name)
  //         ? res.data.budget_name
  //         : [];
  //       const budgets = names.map((b) => ({
  //         id: b.id, // REAL budget id
  //         name: b.name, // string
  //         workflow_id: b.workflow_id, // real workflow id
  //       }));

  //       setBudgetOptions(budgets);
  //       console.log("Budget fetch response:", res.data);
  //     })
  //     .catch((err) => console.error("Error fetching budgets:", err));
  // }, [token]);

    useEffect(() => {
    const userId = sessionStorage.getItem("userId");
    if (!userId) return;

    axios
      .get(`${API.PURCHASE_API}/budget/department/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        console.log("Full budget API response:", res.data);
        // API returns { budgets: [...] }
        const budgets = Array.isArray(res.data.budgets)
          ? res.data.budgets.map((b) => ({
              id: b.id,
              name: b.name,
              workflow_id: b.workflow_id || null,
              workflow_name: b.workflow_name,
            }))
          : [];
        console.log("Parsed budgets:", budgets);
        setBudgetOptions(budgets);
        console.log("Budget options set:", budgetOptions); // This will log the old value due to closure
      })
      .catch((err) => {
        console.error("Error fetching budgets:", err);
        console.error("Error details:", err.response?.data);
      });
  }, [token]);

  const handleBudgetChange = (newValue) => {
    setSelectedBudget(newValue || null);

    console.log("Selected budget:", newValue);
    console.log("Workflow name from budget:", newValue?.workflow_name);

    // Autofill workflow by name
    if (newValue?.workflow_name) {
      const matchingWorkflow = workflowOptions.find(w => w.workflow_name === newValue.workflow_name);
      if (matchingWorkflow) {
        setSelectedWorkflow(matchingWorkflow.workflow_id);
        console.log("Auto-selected workflow:", matchingWorkflow.workflow_name);
      } else {
        console.log("No matching workflow found for name:", newValue.workflow_name);
      }
    } else {
      console.log("No workflow_name in budget, workflow not auto-selected");
    }

    // 🔥 UPDATE BUDGET FOR ALL ALREADY ADDED ITEMS
    if (newValue) {
      setProducts((prev) =>
        prev.map((item) => ({
          ...item,
          budget: newValue.id,
        }))
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 ml-0 bg-white rounded-xl shadow-lg">
      <div className="w-full overflow-x-auto p-4">
        <h2 className="text-2xl text-blue-950 font-semibold mb-6 text-left">
          Raise Request for
        </h2>

        <>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="w-full">
                    <label className="block text-sm font-semibold mb-1">
                  Request For
                </label>

                {!showCreateNewInput ? (
                  <Autocomplete
                    freeSolo
                    options={requestForOptions}
                    value={requestFor}
                    forcePopupIcon={true}
                    slotProps={{
                      popper: {
                        placement: 'bottom-start',
                      },
                    }}
                    popupIcon={
                      <Icon icon="mdi:chevron-down" width="24" height="24" />
                    }
                    onChange={(event, newValue) => {
                      if (newValue === "Create New") {
                        setShowCreateNewInput(true);
                        setNewRequestForValue("");
                      } else {
                        setRequestFor(newValue);
                        setCategory("");
                        setRequestAsset("");
                      }
                    }}
                    onInputChange={(event, newInputValue) => {
                      if (event?.type === "change") {
                        setRequestFor(newInputValue);
                        setCategory("");
                        setRequestAsset("");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        placeholder="Select Request For"
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            height: "36px",
                            fontSize: "14px",
                            backgroundColor: "#F4F4F4",
                          },
                        }}
                      />
                    )}
                  />
                ) : (
                  <div className="flex gap-2">
                    <TextField
                      variant="outlined"
                      size="small"
                      placeholder="Enter new Request For"
                      value={newRequestForValue}
                      onChange={(e) => setNewRequestForValue(e.target.value)}
                      InputProps={{
                        sx: {
                          height: "36px",
                          fontSize: "14px",
                          backgroundColor: "#F4F4F4",
                        },
                      }}
                    />
                    <button
                      type="button"
                      className="bg-blue-600 text-white px-4 rounded"
                      onClick={() => {
                        if (
                          newRequestForValue &&
                          !requestForOptions.includes(newRequestForValue)
                        ) {
                          const updatedOptions = [
                            ...requestForOptions.slice(0, -1),
                            newRequestForValue,
                            "Create New",
                          ];
                          setRequestForOptions(updatedOptions);
                          setRequestFor(newRequestForValue);
                        }
                        setShowCreateNewInput(false);
                        setCategory("");
                        setRequestAsset("");
                      }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      className="border px-3 rounded"
                      onClick={() => setShowCreateNewInput(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {requestFor && (
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-1">
                    Category
                  </label>
                  <Autocomplete
                    freeSolo
                    options={categoryOptions}
                    value={category}
                    forcePopupIcon={true}
                    slotProps={{
                      popper: {
                        placement: 'bottom-start',
                      },
                    }}
                    popupIcon={<Icon icon="mdi:chevron-down" />}
                    onChange={(e, newValue) => {
                      setCategory(newValue);
                      setRequestAsset(""); // Reset selected material
                      setAssetOptions([]); // Reset material dropdown list
                      setMaterialData([]); // (Optional) Reset material data
                      setSelectedWorkflow(""); // Reset workflow
                      setSelectedBudget(""); // Reset budget
                    }}
                    onInputChange={(e, newInputValue) => {
                      if (e?.type === "change") {
                        setCategory(newInputValue);
                        setRequestAsset(""); // Reset selected material
                        setAssetOptions([]); // Reset material dropdown list
                        setMaterialData([]); // (Optional) Reset material data
                        setSelectedWorkflow(""); // Reset workflow
                        setSelectedBudget(""); // Reset budget
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Select Category"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            height: "36px",
                            fontSize: "14px",
                            backgroundColor: "#F4F4F4",
                          },
                        }}
                      />
                    )}
                  />
                </div>
              )}

              {category && (
                <div className="w-full">
                  <label className="block text-sm font-semibold mb-1">
                    Material
                  </label>
                  <Autocomplete
                    freeSolo
                    options={assetOptions}
                    getOptionLabel={(option) =>
                      typeof option === "string"
                        ? option
                        : option?.asset_name || option?.label || ""
                    }
                    value={requestAsset}
                    forcePopupIcon={true}
                    slotProps={{
                      popper: {
                        placement: 'bottom-start',
                      },
                    }}
                    popupIcon={<Icon icon="mdi:chevron-down" />} // Always show arrow
                    onChange={(e, newValue) => {
                      // Normalize newValue to a string asset name
                      const normalized =
                        typeof newValue === "string"
                          ? newValue
                          : newValue?.asset_name || newValue?.label || "";
                      setRequestAsset(normalized);

                      const selectedMaterial = materialData?.find(
                        (item) =>
                          item?.asset_name === normalized ||
                          item?.material_name === normalized
                      );
                      setUom(selectedMaterial?.uom || "");
                      setDescription(selectedMaterial?.remarks || "");
                    }}
                    onInputChange={(e, newInputValue) => {
                      if (e?.type === "change") {
                        setRequestAsset(newInputValue);
                        const selectedMaterial = materialData.find(
                          (item) =>
                            item.asset_name === newInputValue ||
                            item.material_name === newInputValue
                        );
                        setUom(selectedMaterial?.uom || "");
                        setDescription(selectedMaterial?.remarks || "");
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="outlined"
                        size="small"
                        placeholder="Select Material"
                        InputProps={{
                          ...params.InputProps,
                          sx: {
                            height: "36px",
                            fontSize: "14px",
                            backgroundColor: "#F4F4F4",
                          },
                        }}
                      />
                    )}
                  />
                </div>
              )}
            </div>

            {canShowRestOfForm && (
              <>
                <label htmlFor="description" className="block text-sm font-semibold mb-1">
                  Description
                </label>
                <textarea
                  placeholder=""
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="p-2 border rounded w-full mb-4 bg-[#F4F4F4] text-gray-700" // <-- add this
                />

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="flex flex-col">
                    <label htmlFor="quantity" className="block text-sm font-semibold mb-1">
                      Quantity
                    </label>
                    <input
                      id="quantity"
                      type="number"
                      placeholder=""
                      value={quantity === 0 ? "" : quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);

                        if (isNaN(val)) {
                          setQuantity(0);
                          setAllocation(false);
                          return;
                        }

                        setQuantity(val);

                        if (requestAsset && val > 0) {
                          setAllocation(true);
                        } else {
                          setAllocation(false);
                        }
                      }}
                      className="p-2 border rounded"
                      min="0"
                      style={{ backgroundColor: "#F4F4F4" }} // <-- add this
                    />
                  </div>

                  <div className="flex flex-col">
                    <label htmlFor="uom" className="block text-sm font-semibold mb-1">
                      UOM (Unit of Measure)
                    </label>
                    <Autocomplete
                      options={uomOptions}
                      value={uom}
                      forcePopupIcon={true}
                      slotProps={{
                        popper: {
                          placement: 'bottom-start',
                        },
                      }}
                      popupIcon={<Icon icon="mdi:chevron-down" />}
                      onChange={(e, newValue) => setUom(newValue || "")}
                      onInputChange={(e, newInputValue) => {
                        if (e?.type === "change") {
                          setUom(newInputValue);
                        }
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          size="small"
                          placeholder="Select UOM"
                          InputProps={{
                            ...params.InputProps,
                            sx: {
                              height: "36px",
                              fontSize: "14px",
                              backgroundColor: "#F4F4F4",
                            },
                          }}
                        />
                      )}
                    />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex flex-col">
                      <label htmlFor="budget" className="block text-sm font-semibold mb-1">
                        Budget
                      </label>

                      <Autocomplete
                        options={budgetOptions}
                        freeSolo={false} // remove this if user should not type
                        getOptionLabel={(option) => option?.name || ""}
                        value={selectedBudget || null}
                        forcePopupIcon={true}
                        slotProps={{
                          popper: {
                            placement: 'bottom-start',
                          },
                        }}
                        popupIcon={
                          <Icon
                            icon="mdi:chevron-down"
                            width="24"
                            height="24"
                          />
                        }
                        onChange={(event, newValue) =>
                          handleBudgetChange(newValue)
                        }
                        isOptionEqualToValue={(option, value) =>
                          option.id === value?.id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            placeholder="Select Budget"
                            inputProps={{
                              ...params.inputProps, // 🔥 real <input> props go here
                              readOnly: true, // if you want user typing blocked
                            }}
                            InputProps={{
                              ...params.InputProps, // 🔥 merge correctly
                              sx: {
                                ...params.InputProps.sx,
                                height: "36px",
                                fontSize: "14px",
                                backgroundColor: "#F4F4F4",
                              },
                            }}
                          />
                        )}
                      />
                        <p className="text-xs text-gray-500 mt-1">
                        ℹ️ The selected budget will be applied to all items in this request.
                      </p>
                    </div>
                  </div>

                  {selectedBudget && (
                    <div className="flex flex-col">
                      <label htmlFor="workflow" className="block text-sm font-semibold mb-1">
                        Workflow
                      </label>

                      <Autocomplete
                        options={workflowOptions}
                        getOptionLabel={(option) =>
                          typeof option === "string"
                            ? option
                            : option.workflow_name || ""
                        }
                        value={
                          workflowOptions.find(
                            (w) => w.workflow_id === selectedWorkflow
                          ) || null
                        }
                        forcePopupIcon={false}
                        open={false}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            size="small"
                            inputProps={{
                              ...params.inputProps,
                              readOnly: true,
                            }}
                            InputProps={{
                              ...params.InputProps,
                              sx: {
                                height: "36px",
                                fontSize: "14px",
                                backgroundColor: "#F4F4F4",
                              },
                            }}
                          />
                        )}
                      />
                     
                    </div>
                  )}
                </div>

                {/* Multi-item add area (Add / Cancel and added items table) */}
                <div className="mb-6">
                  <div className="flex gap-4 mb-4">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="border px-6 py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>

                  {products.length > 0 && (
                    <div className="bg-white rounded shadow-sm border p-4">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="p-2 text-left">Request for</th>
                            <th className="p-2 text-left">Category</th>
                            <th className="p-2 text-left">Material</th>
                            <th className="p-2 text-left">Quantity</th>
                            <th className="p-2 text-left">Uom</th>
                            <th className="p-2 text-left">Budget</th>
                            <th className="p-2 text-left">&nbsp;</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((it, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="p-2">
                                {formatDisplay(it.request_for)}
                              </td>
                              <td className="p-2">
                                {formatDisplay(it.category)}
                              </td>
                              <td className="p-2">
                                {formatDisplay(it.asset_name)}
                              </td>
                              <td className="p-2">
                                {formatDisplay(it.quantity)}
                              </td>
                              <td className="p-2">{formatDisplay(it.uom)}</td>
                              {/* <td className="p-2">
                                {formatDisplay(
                                  workflowOptions.find(
                                    (w) => w.workflow_id === selectedWorkflow
                                  )?.workflow_name
                                ) || "-"}
                              </td> */}
                                                          <td className="p-2">
                                {formatDisplay(
                                  budgetOptions.find((b) => b.id === it.budget)
                                    ?.name
                                ) || formatDisplay(it.budget)}
                              </td>
                              <td className="p-2 text-right">
                                <button
                                  className="text-red-500"
                                  onClick={() => handleRemoveProduct(idx)}
                                >
                                  ×
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {existingQuantity !== null &&
                  existingQuantity !== undefined && (
                    <div className="flex flex-row items-center gap-2 bg-yellow-100 p-4 rounded-lg mb-4">
                      <p className="text-gray-800 font-medium">
                        NOTE: For <strong>{requestAsset}</strong>,{" "}
                        <strong>
                          {existingQuantity !== null
                            ? existingQuantity
                            : allocation !== true}
                        </strong>{" "}
                        quantity is already available. Do you want to allocate
                        this?
                      </p>

                      <div className="flex gap-4 mt-2">
                        <button
                          type="button"
                          onClick={handleYesClick}
                          className="px-6 py-2 rounded-lg bg-blue-600 text-white"
                        >
                          Yes
                        </button>
                      </div>
                    </div>
                  )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={products.length === 0}
                    className={`px-6 py-2 rounded-lg w-1/4 text-white 
      ${
        products.length === 0
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-custome-blue"
      }`}
                  >
                    Submit
                  </button>

                  <button
                    type="button"
                    className="border w-1/4 px-6 py-2 rounded-lg"
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </form>
          {showModal && (
            <PopupModal
              type={modalProps.type}
              title={modalProps.title}
              message={modalProps.message}
              onClose={() => setShowModal(false)}
            />
          )}
        </>
      </div>
    </div>
  );
};

export default RaiseRequest;
