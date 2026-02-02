import { useState, useEffect } from "react";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import { DeleteIcon } from "../../NewComponents/ReactIcons";
import Pagination from "../../NewComponents/Pagination";
import AddButton from '../../NewComponents/AddButton';
import { FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

const HREmpDocument = () => {
    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const policiesPerPage = 25;
    const [categories, setCategories] = useState([]);
    const [HRDocuments, setHRDocuments] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [newDescription, setNewDescription] = useState("");

    /* ---------------- Filter & Pagination ---------------- */
    const filteredDocs = HRDocuments.filter((doc) =>
        doc.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const indexOfLast = currentPage * policiesPerPage;
    const indexOfFirst = indexOfLast - policiesPerPage;
    const currentHRDocs = filteredDocs.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredDocs.length / policiesPerPage);

    /* ---------------- Fetch Categories (GET API) ---------------- */
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        const Token = sessionStorage.getItem("token");
        try {
            const res = await fetch(
                "https://devdemo.softtrails.net/documents/categories?source=emp_doc",
                {
                    headers: {
                        Accept: "application/json",
                        Authorization: `Bearer ${Token}`,
                    },
                }
            );
            const data = await res.json();
            setCategories(Array.isArray(data) ? data : []);
            setHRDocuments(Array.isArray(data) ? data : []);

        } catch (error) {
            console.error("Failed to fetch categories:", error);
        }
    };

    /* ---------------- Submit New Category ---------------- */
    const handleSubmitForm = async () => {
        if (!newCategory.trim()) {
            Swal.fire("Required", "Category Name is required", "warning");
            return;
        }
        const payload = {
            category_name: newCategory.trim(),
            description: newDescription.trim(),
            source: "emp_doc",
        };
        const Token = sessionStorage.getItem("token");
        try {
            const response = await fetch(
                "https://devdemo.softtrails.net/documents/categories",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${Token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );
            const result = await response.json();
            if (response.ok) {
                Swal.fire("Success", "Category Added!", "success");
                setShowForm(false);
                setNewCategory("");
                setNewDescription("");
                fetchCategories();
            } else {
                Swal.fire("Failed", result.message || "Unable to submit", "error");
            }

        } catch (error) {
            Swal.fire("Error", "Something went wrong!", "error");
        }
    };

    /* ---------------- Delete Category ---------------- */
    const openDeleteModal = (id) => {
        setDeleteId(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        setDeleteError("");

        const Token = sessionStorage.getItem("token");

        try {
            const res = await fetch(
                `https://devdemo.softtrails.net/documents/categories/${deleteId}`,
                {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${Token}` },
                }
            );

            if (res.ok) {
                Swal.fire("Deleted!", "Category deleted successfully", "success");
                setShowDeleteModal(false);
                fetchCategories();
            } else {
                setDeleteError("Cannot delete this category.");
            }

        } catch (error) {
            setDeleteError("Server error! Try again.");
        }
        setDeleteLoading(false);
    };

    return (
        <div>
            {/* ---------- HEADER ---------- */}
            <div className="flex items-center mb-4">
                <AddButton onClick={() => setShowForm(true)} icon={FaPlus}>Add Category</AddButton>
                <input
                    type="text"
                    placeholder="Search"
                    className="border rounded-lg px-4 py-2 w-1/5 ml-5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* ---------- TABLE ---------- */}
            <div className="h-[75vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">

                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="bg-white sticky top-0 z-10" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left">S.No</th>
                                <th className="p-5 text-left">Document</th>
                                <th className="p-5 text-left">Description</th>
                                <th className="p-5 text-left">Action</th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentHRDocs.map((doc, index) => (
                                <tr
                                    key={doc.id}
                                    className={((index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue")}
                                >
                                    <td className="px-5 py-4">{indexOfFirst + index + 1}</td>
                                    <td className="px-5 py-4">{doc.category_name || "NA"}</td>
                                    <td className="px-5 py-4">{doc.description || "NA"}</td>
                                    <td className="px-5 py-4">
                                        <button
                                            className="text-red-500"
                                            onClick={() => openDeleteModal(doc.id)}
                                        >
                                            <DeleteIcon />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                        if (page >= 1 && page <= totalPages) {
                            setCurrentPage(page);
                        }
                    }}
                />
            </div>

            {/* ---------- ADD CATEGORY MODAL ---------- */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded w-[500px] max-h-[90vh] overflow-y-auto">

                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold">Add New Category</h2>
                            <button
                                className="text-black text-xl font-bold"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>
                        </div>

                        {/* Category Name */}
                        <div className="mb-4">
                            <label className="text-sm font-medium">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="border rounded px-3 py-2 w-full"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Enter category name"
                            />
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label className="text-sm font-medium">Description<span className="text-red-500">*</span></label>
                            <textarea
                                className="border rounded px-3 py-2 w-full"
                                rows={3}
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                placeholder="Enter description "
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                type="button"
                                className="border px-4 py-2 rounded"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="bg-blue-600 text-white px-4 py-2 rounded"
                                onClick={handleSubmitForm}
                            >
                                Submit
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ---------- DELETE MODAL ---------- */}
            <DeleteConfirmModal
                open={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                loading={deleteLoading}
                errorMessage={deleteError}
                title="Delete Category?"
                message="Are you sure you want to delete this document?"
            />
        </div>
    );
};
export default HREmpDocument;
