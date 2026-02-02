//06/11/2025 with the new Policy functionlaity//////////
import { useState, useEffect } from "react";
import folder from "../../assests/folder.png";
import AddButton from '../../NewComponents/AddButton';
import Pagination from "../../NewComponents/Pagination";
import { DeleteIcon, EditIcon } from "../../NewComponents/ReactIcons";
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";

const HRPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const policiesPerPage = 25;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [policyList, setPolicyList] = useState([]);
  const [showNewPolicyInput, setShowNewPolicyInput] = useState(false);
  const [localPolicyList, setLocalPolicyList] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [documentUrl, setDocumentUrl] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [formData, setFormData] = useState({
    category: "",
    categoryId: "",
    policyName: "",
    description: "",
    status: true,
  });
  const token = sessionStorage.getItem("token");

  useEffect(() => {
    fetch("https://devdemo.softtrails.net/dmsapi/upload",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => response.json())
      .then((data) => {
        setServices(data);
      });
  }, [selectedService]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");

    const payload = {
      category_id: formData.categoryId,
      name: formData.policyName,
      description: formData.description,
      document: documentUrl,
      status: formData.status,
    };

    const apiUrl = isEditMode
      ? `https://devdemo.softtrails.net/hr-policy/update-policy/${editPolicyData.policy_id}`
      : "https://devdemo.softtrails.net/hr-policy/upload-policy";

    const method = isEditMode ? "PUT" : "POST";

    try {
      const response = await fetch(apiUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: isEditMode ? "Updated!" : "Uploaded!",
          text: isEditMode
            ? "Policy updated successfully."
            : "Policy uploaded successfully.",
        });

        setShowForm(false);
        setIsEditMode(false);
        setEditPolicyData(null);
        setFormData({ categoryId: "", policyName: "", description: "" });
        setDocumentUrl("");
        setLocalPolicyList([]);
        fetchPolicies();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: result.message || "Something went wrong.",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong during upload.",
      });
    }
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setShowForm(false);
    setIsEditMode(false);
    setEditPolicyData(null);
    setFormData({ categoryId: "", policyName: "", description: "" });
    setDocumentUrl("");
    setSelectedFiles([]);
  };



  //////////////////////////EDit PARt//////////////////////////////////
  const [isEditMode, setIsEditMode] = useState(false);
  const [editPolicyData, setEditPolicyData] = useState(null);

  const handleEdit = (policy) => {
    setIsEditMode(true);
    setShowForm(true);
    setEditPolicyData(policy);
    setFormData({
      categoryId: policy.category_id || "",
      policyName: policy.name || "",
      description: policy.description || "",
      status: policy.status || true,
    });
    setDocumentUrl(policy.document || "");
  };

  const filteredPolicies = policies.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * policiesPerPage;
  const indexOfFirst = indexOfLast - policiesPerPage;
  const currentPolicies = filteredPolicies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPolicies.length / policiesPerPage);

  const fetchPolicies = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("https://devdemo.softtrails.net/hr-policy/policies", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (result.success) {
        setPolicies(result.data);
      } else {
        console.error("Failed to fetch policies");
      }
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPolicies();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("https://devdemo.softtrails.net/hr-policy/categories",
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );
      const data = await res.json();
      if (res.ok) {
        setCategories(data.data || []);
      } else {
        console.error("Failed to load categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const getCategoryName = (categoryId) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat ? cat.name : "Unknown";
  };

  const handleAddCategory = async () => {
    const token = sessionStorage.getItem("token");
    if (!newCategory.trim()) return;

    try {
      const response = await fetch(
        "https://devdemo.softtrails.net/hr-policy/create-category",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: newCategory.trim() }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire("Success", "Category added!", "success");
        await fetchCategories();
        setFormData((prev) => ({ ...prev, category: newCategory.trim() }));
        setNewCategory("");
        setShowNewCategoryInput(false);
      } else {
        Swal.fire("Error", result.message || "Failed to add category", "error");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      Swal.fire("Error", "Something went wrong", "error");
    }
  };
  /////////////////////////Delete ///////////////////
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedPolicyId, setSelectedPolicyId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const openConfirmPopup = (policyId) => {
    setSelectedPolicyId(policyId);
    setShowConfirm(true);
    setErrorMessage("");
  };

  const cancelDelete = () => {
    setShowConfirm(false);
    setSelectedPolicyId(null);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`https://devdemo.softtrails.net/hr-policy/policies/${selectedPolicyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        setPolicies(policies.filter(p => p.policy_id !== selectedPolicyId));
        setShowConfirm(false);
        setSelectedPolicyId(null);
      } else {
        setErrorMessage("Failed to delete the policy.");
      }
    } catch (error) {
      console.error("Error deleting policy:", error);
      setErrorMessage("An error occurred while deleting.");
    }
  };

  const getDmsPublishId = async () => {
    const url = "https://devdemo.softtrails.net/mapping/check";
    const token = sessionStorage.getItem("token");

    try {
      const response = await axios.get(url, {
        params: {
          service_name: "HRMS",
          doctype: "HR Policy",
          doc_name: "HR Policy",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });
      return response.data.dms_publish_id || null;
    } catch (error) {
      console.error("Mapping check failed:", error);
      return null;
    }
  };

  const handleFileUpload = async (file) => {
    const publishId = await getDmsPublishId();
    const userId = sessionStorage.getItem("userId");
    const token = sessionStorage.getItem("token");

    if (!file || !publishId || !userId || !token) {
      console.warn("Missing required fields for file upload");
      return null;
    }

    const uploadData = new FormData();
    uploadData.append("documents", file);
    uploadData.append("ref", "DMS");

    const metadata = [
      {
        service: "HRMS",
        publish_id: parseInt(publishId),
        user_id: userId,
        document_name: file.name.replace(/[^a-zA-Z0-9_.\- ]/g, ""),
      },
    ];
    uploadData.append("metadata", JSON.stringify(metadata));

    try {
      const response = await fetch(
        "https://devdemo.softtrails.net/dmsapi/upload-documents",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadData,
        }
      );

      const data = await response.json();
      return data.uploaded_files?.[0]?.file_url || null;
    } catch (error) {
      console.error("Upload failed:", error);
      return null;
    }
  };

  return (
    <div className="p-1 w-full">
      <div className="flex justify-between items-center mb-4">
        <AddButton onClick={() => setShowForm(true)} icon={FaPlus}>Add Policy</AddButton>
        <input type="text" placeholder="Search Policy" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="border rounded px-4 py-2 w-1/4" />
      </div>


      {/***TABLE***/}
      <div className="w-full overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[65vh] rounded-lg bg-white">
        <table className="min-w-[800px] md:min-w-full table-auto border-collapse text-sm">
          <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
            <tr>
              <th className="p-5 text-left text-black">S.No</th>
              <th className="p-5 text-left text-black">Category</th>
              <th className="p-5 text-left text-black">Policy </th>
              <th className="p-5 text-left text-black">Description</th>
              <th className="p-5 text-left text-black">Version</th>
              <th className="p-5 text-left text-black">Date</th>
              <th className="p-5 text-left text-black">Status</th>
              <th className="p-5 text-left text-black">Document</th>
              <th className="p-5 text-left text-black">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
            {currentPolicies.length > 0 ? (
              currentPolicies.map((policy, index) => (
                <tr key={policy.policy_id} className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}`} >
                  <td className="px-5 py-4 text-left">{indexOfFirst + index + 1}</td>
                  <td className="px-5 py-4 text-left">{getCategoryName(policy.category_id)}</td>
                  <td className="px-5 py-4 text-left">{policy.name}</td>
                  <td className="px-5 py-3 text-left text-gray-700 max-w-[200px]">
                    <div className="overflow-hidden whitespace-pre-wrap">
                      {expandedId === policy.policy_id ? (
                        <> {policy.description || "NA"} <button onClick={() => setExpandedId(null)} className="text-blue-600 ml-2 hover:underline" > Less </button> </>
                      ) : (
                        <>
                          {(policy.description && policy.description.length > 10) ? policy.description.substring(0, 10) + "..." : policy.description || "NA"}
                          {policy.description && policy.description.length > 10 && (<button onClick={() => setExpandedId(policy.policy_id)} className="text-blue-600 ml-2 hover:underline" > More </button>)}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-left">{policy.version}</td>
                  <td className="px-5 py-4 text-left">{new Date(policy.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-left">{policy.status ? (<span className="text-green-600 font-medium">Active</span>) : (<span className="text-red-600 font-medium">Inactive</span>)}</td>
                  <td className="px-5 py-4 text-left">
                    {policy.document ? (<a href={policy.document} target="_blank" rel="noopener noreferrer" className="hover:text-blue-800 flex items-center" > <img src={folder} alt="preview" className="w-5 h-5 mr-2" /> </a>) : (<span className="text-gray-500">No Document</span>)}
                  </td>
                  <td className="px-5 py-4 text-left flex items-center gap-2">
                    <button className="text-blue-600 hover:text-blue-800 p-1" onClick={() => handleEdit(policy)} > <EditIcon /> </button>
                    <button className="text-red-500 hover:text-red-700 p-1" onClick={() => openConfirmPopup(policy.policy_id)} > <DeleteIcon /> </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" className="text-center p-4">No records found.</td></tr>
            )}
          </tbody>
        </table>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-[600px] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {isEditMode ? "Edit Policy" : "Add Policy"}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-red-600 text-xl font-bold" > &times; </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium">Category</label>
                  <select
                    value={formData.categoryId || ""}
                    onChange={async (e) => {
                      const selectedId = e.target.value;

                      if (selectedId === "__add_new__") {
                        setFormData((prev) => ({
                          ...prev,
                          categoryId: "",
                          categoryName: "",
                        }));
                        setShowNewCategoryInput(true);
                        setPolicyList([]);
                        setLocalPolicyList([]); // 🟢 clear local policies when switching
                      } else {
                        const selectedCategory = categories.find(
                          (cat) => String(cat.id) === selectedId
                        );

                        setFormData((prev) => ({
                          ...prev,
                          categoryId: selectedCategory?.id || "",
                          categoryName: selectedCategory?.name || "",
                        }));
                        setShowNewCategoryInput(false);

                        try {
                          const res = await fetch(
                            `https://devdemo.softtrails.net/hr-policy/${selectedId}`,
                            {
                              headers: { Authorization: `Bearer ${token}` },
                            }
                          );
                          const result = await res.json();
                          if (result.success && Array.isArray(result.data)) {
                            setPolicyList(result.data);
                          } else {
                            setPolicyList([]);
                          }
                          setLocalPolicyList([]); // 🟢 clear temp policies for new category
                        } catch (err) {
                          console.error("Policy fetch failed:", err);
                          setPolicyList([]);
                          setLocalPolicyList([]);
                        }
                      }
                    }}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                    <option value="__add_new__">+ Add New Category</option>
                  </select>


                  {/* Add New Category */}
                  {showNewCategoryInput && (
                    <div className="mt-2 flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Enter new category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="flex-1 border rounded px-2 py-1"
                      />
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                {/* Policy Name Dropdown */}
                <div>
                  <label className="block text-sm font-medium">Policy Name</label>
                  <select
                    value={formData.policyName || ""}
                    onChange={(e) => {
                      const selectedValue = e.target.value;

                      if (selectedValue === "__add_new_policy__") {
                        setShowNewPolicyInput(true);
                        setFormData((prev) => ({ ...prev, policyName: "" }));
                      } else {
                        setFormData((prev) => ({ ...prev, policyName: selectedValue }));
                      }
                    }}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="">Select Policy Name</option>

                    {/* 🟢 combine policies (backend + temporary added) */}
                    {[...new Map(
                      [...policyList, ...localPolicyList.filter(
                        (p) => p.category_id === formData.categoryId
                      )].map((p) => [p.name, p])
                    ).values()].map((policy) => (
                      <option key={policy.name} value={policy.name}>
                        {policy.name}
                      </option>
                    ))}

                    <option value="__add_new_policy__">+ Add New Policy</option>
                  </select>


                  {/* Add New Policy Input + Add Button */}
                  {showNewPolicyInput && (
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="text"
                        value={formData.policyName}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, policyName: e.target.value }))
                        }
                        placeholder="Enter new policy name"
                        className="border rounded px-3 py-2 w-full"
                      />
                      <button
                        onClick={() => {
                          const trimmed = formData.policyName.trim();
                          if (!trimmed) return;

                          // Avoid duplicates
                          const alreadyExists =
                            policyList.some((p) => p.name === trimmed) ||
                            localPolicyList.some((p) => p.name === trimmed);

                          if (!alreadyExists) {
                            setLocalPolicyList((prev) => [
                              ...prev,
                              { name: trimmed, category_id: formData.categoryId },
                            ]);
                          }

                          setShowNewPolicyInput(false);
                        }}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Add
                      </button>
                    </div>
                  )}

                </div>

                {/* Description */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                  />
                </div>
              </div>

              {/* Upload HR Policy Section */}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
                className="w-full border rounded px-3 py-2"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (!file) return;
                  try {
                    const uploadedUrl = await handleFileUpload(file);
                    if (uploadedUrl) {
                      setDocumentUrl(uploadedUrl);

                      Swal.fire({
                        icon: "success",
                        title: "Uploaded!",
                        text: "File uploaded successfully.",
                        confirmButtonColor: "#3085d6",
                      });
                    } else {
                      Swal.fire({
                        icon: "error",
                        title: "Upload Failed!",
                        text: "Something went wrong during upload.",
                        confirmButtonColor: "#d33",
                      });
                    }
                  } catch (err) {
                    Swal.fire({
                      icon: "error",
                      title: "Error",
                      text: "Unexpected error while uploading file.",
                      confirmButtonColor: "#d33",
                    });
                    console.error("Upload error:", err);
                  }
                }}
              />
              <div className="mt-3">
                <label className="block text-sm font-medium mb-1">Status</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="status"
                      value="true"
                      checked={formData.status === true}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, status: true }))
                      }
                    />
                    Active
                  </label>
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="status"
                      value="false"
                      checked={formData.status === false}
                      onChange={() =>
                        setFormData((prev) => ({ ...prev, status: false }))
                      }
                    />
                    Inactive
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="border px-4 py-2 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {isEditMode ? "Update" : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            {errorMessage && <p className="text-red-500 text-sm text-center mb-2">{errorMessage}</p>}
            <h3 className="text-xl font-bold text-center text-gray-800">Confirm Deletion</h3>
            <p className="text-gray-600 text-center mt-4">Are you sure you want to delete this policy?</p>
            <div className="flex justify-center gap-4 mt-6">
              <button
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default HRPolicies;