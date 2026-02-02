import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import axios from "axios";
import AddButton from "../NewComponents/AddButton";
import { FaPlus } from "react-icons/fa";
import { MAIN_API_BASE } from "../config/apiBase";
import DeleteConfirmationModal from "../NewComponents/DeleteComponents";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import excel from "../assests/excel.png";

const UserCategory = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [categoryName, setCategoryName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Active");
    const [flagged, setFlagged] = useState(true);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 25;

    useEffect(() => {
        const filtered = categories.filter(cat =>
            cat.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredCategories(filtered);
        setCurrentPage(1);
    }, [searchTerm, categories]);

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentPolicies = filteredCategories.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newCategory = {
            category: categoryName, // match API key
            description: description,
            status: status.toLowerCase() // "active" or "inactive"
        };
        try {
            await axios.post(`${MAIN_API_BASE}/user-category/create`, newCategory,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
            Swal.fire("Success", "Category added!", "success");
            setShowModal(false);
            setCategoryName("");
            setDescription("");
            setStatus("Active");
            fetchCategories(); // Refresh category list
        } catch (error) {
            console.error("Error adding category:", error);
            Swal.fire("Error", "Failed to add category.", "error");
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get(`${MAIN_API_BASE}/user-category/all`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                });
            if (response.data.success) {
                setCategories(response.data.data);
            } else {
                setCategories([]);
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDownloadExcel = () => {
    if (filteredCategories.length === 0) {
        Swal.fire("No Data", "No categories available to download", "info");
        return;
    }

    const excelData = filteredCategories.map((cat, index) => ({
        "S.No": index + 1,
        "Category Name": cat.category,
        "Description": cat.description || "NA",
        "Status": cat.status === "active" ? "Active" : "Inactive",
        "Flagged": cat.flagged ? "Yes" : "No",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "User Categories");

    const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
    });

    const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
    });

    saveAs(blob, `User_Categories_${Date.now()}.xlsx`);
};


    /********************* EDit API***************/
    const [showEditModal, setShowEditModal] = useState(false);
    const [editCategoryName, setEditCategoryName] = useState('');
    const [editCategory, setEditCategory] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editStatus, setEditStatus] = useState('Active');
    const [editFlagged, setEditFlagged] = useState(true);

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${MAIN_API_BASE}/user-category/update/${editCategory.category_id}`,
                {
                    category: editCategoryName,
                    description: editDescription,
                    status: editStatus.toLowerCase(),
                    flagged: editFlagged, // 👈 Add this line
                },
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
            Swal.fire("Success", "Category updated successfully!", "success");
            setShowEditModal(false);
            fetchCategories();
        } catch (error) {
            console.error("Update failed:", error);
            Swal.fire("Error", "Failed to update category.", "error");
        }
    };

    const handleEdit = (category) => {
        setEditCategory(category);
        setEditCategoryName(category.category);
        setEditDescription(category.description);
        setEditStatus(category.status.charAt(0).toUpperCase() + category.status.slice(1));
        setEditFlagged(category.flagged); // 👈 Add this line
        setShowEditModal(true);
    };

    ////////////////////////    Delete  //////////////////////
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);

    const confirmDelete = async () => {
        try {
            await axios.delete(`${MAIN_API_BASE}/user-category/delete/${selectedCategoryId}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                    },
                }
            );
            setShowDeleteModal(false);
            fetchCategories();
            Swal.fire("Deleted!", "Category has been deleted.", "success");
        } catch (error) {
            console.error(error);
            Swal.fire("Error", "Failed to delete category.", "error");
        }
    };

    const handleDeleteClick = (id) => {
        setSelectedCategoryId(id);
        setShowDeleteModal(true);
    };

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                {/* Add Domain Button */}
                <AddButton onClick={() => setShowModal(true)} icon={FaPlus}>Add Category</AddButton>
                <div className="flex-grow">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search"
                        className="w-30 border border-gray-300 rounded-lg p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                {/* Excel Download Button */}
                <button onClick={handleDownloadExcel} className="text-green-500 flex-shrink-0 sm:w-auto w-full text-center">
                    <img src={excel} alt="logo" className="w-8 h-8 mx-auto" />
                </button>
            </div>

            {/* Table */}
            <div className="relative w-full bg-white rounded-lg overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh]">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0 z-60 border-b-2 border-black">
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Category</th>
                                <th className="p-5 text-left text-black">Description</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Flag</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
                            {/* {categories.map((category, index) => ( */}
                                {currentPolicies.map((category, index) => (
                                <tr key={index} className={`${index % 2 === 0 ? 'bg-tableblue' : 'bg-white'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">
                                        {(currentPage - 1) * itemsPerPage + index + 1}
                                    </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">
                                        {category.category}
                                    </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">
                                        {category.description || "NA"}
                                    </td>
                                    <td
                                        className={`py-3 px-5 border-b text-left ${category.status === "active" ? "text-green-600" : "text-red-600"
                                            }`}
                                    >
                                        {category.status.toLowerCase() === "active" ? "Active" : "Inactive"}
                                    </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">
                                        {category.flagged ? "Yes" : "No"}
                                    </td>
                                    <td className="py-4 px-4 border-b space-x-2">
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => handleEdit(category)}
                                        >
                                            <FontAwesomeIcon icon={faEdit} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(category.category_id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="sticky bottom-0 bg-white flex justify-center items-center gap-2 p-4 border-t mt-2">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        &lt;
                    </button>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                    <span className="text-sm font-medium">of</span>
                    <span className="px-3 py-1 border border-blue-600 text-blue-600 rounded">{totalPages}</span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                    >
                        &gt;
                    </button>
                </div>
            )}
            {/* Add Category Modal */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Add Category</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-medium">Category Name</label>
                                <input
                                    type="text"
                                    value={categoryName}
                                    onChange={(e) => setCategoryName(e.target.value)}
                                    required
                                    className="w-full mt-1 p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block font-medium">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full mt-1 p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Status</label>
                                <div className="flex gap-4">
                                    {["Active", "Inactive"].map((option) => (
                                        <label key={option} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="status"
                                                value={option}
                                                checked={status === option}
                                                onChange={() => setStatus(option)}
                                            />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Flagged</label>
                                <div className="flex gap-4">
                                    {[{ label: "Yes", value: true }, { label: "No", value: false }].map((option) => (
                                        <label key={option.label} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="flagged"
                                                value={option.value}
                                                checked={flagged === option.value}
                                                onChange={() => setFlagged(option.value)}
                                                required
                                            />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 bg-red-500 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/*Edit Category Modal */}
            {showEditModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Edit Category</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block font-medium">Category Name</label>
                                <input type="text" value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} required className="w-full mt-1 p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block font-medium">Description</label>
                                <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="w-full mt-1 p-2 border rounded" />
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Status</label>
                                <div className="flex gap-4">
                                    {["Active", "Inactive"].map((option) => (
                                        <label key={option} className="flex items-center gap-2">
                                            <input type="radio" name="editStatus" value={option} checked={editStatus === option} onChange={() => setEditStatus(option)} />
                                            {option}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium mb-1">Flagged</label>
                                <div className="flex gap-4">
                                    {[{ label: "Yes", value: true }, { label: "No", value: false }].map((option) => (
                                        <label key={option.label} className="flex items-center gap-2">
                                            <input type="radio" name="editFlagged" value={option.value} checked={editFlagged === option.value} onChange={() => setEditFlagged(option.value)} />
                                            {option.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-red-500 text-white rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Update</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/*Delete Pop up */}
            <DeleteConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Category?"
                message="Are you sure you want to delete Category?"
            />
        </div>
    );
};
export default UserCategory;