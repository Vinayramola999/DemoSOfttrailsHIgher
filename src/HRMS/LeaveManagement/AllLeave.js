import React, { useEffect, useState } from "react";
import axios from "axios";
import { EditIcon, DeleteIcon } from "../../NewComponents/ReactIcons";
import Pagination from "../../NewComponents/Pagination";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import MessageModal from "../../NewComponents/MessageModal";
import MultiSelectDropdown from "../../NewComponents/MultiSelectDropdown";
import { FaPlus } from 'react-icons/fa';
import AddButton from "../../NewComponents/AddButton";
import { MAIN_API_BASE, HRMS_API_BASE } from "../../config/apiBase";

const AllLeave = () => {
    const [policies, setPolicies] = useState([]);
    const [categories, setCategories] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Success/Error Message Modal
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");

    const [newLeave, setNewLeave] = useState({
        leave_type: "",
        policy_id: "",
        description: "",
        category_ids: [],
        department_ids: [], // ✅ added
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const totalPages = Math.ceil(leaves.length / itemsPerPage);
    const paginatedLeaves = leaves.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const token = sessionStorage.getItem("token");

    const fetchDepartments = async () => {
        try {
            const res = await axios.get(`${MAIN_API_BASE}/departments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const activeDepts = res.data.filter(
                (d) => d.status?.toLowerCase() === "active"
            );
            setDepartments(activeDepts);
        } catch (err) {
            console.error("Error fetching departments", err);
        }
    };

    const fetchPolicies = async () => {
        try {
            const res = await axios.get(`${HRMS_API_BASE}/leave/get-policy`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setPolicies(res.data.data || []);
        } catch (err) {
            console.error("Error fetching policies", err);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${MAIN_API_BASE}/user-category/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCategories(res.data.data || []);
        } catch (err) {
            console.error("Error fetching categories", err);
        }
    };

    const fetchLeaves = async () => {
        try {
            const res = await axios.get(`${HRMS_API_BASE}/leave/all-leave-types`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setLeaves(res.data.leave_types || []);
        } catch (err) {
            console.error("Error fetching leave types", err);
        }
    };

    useEffect(() => {
        fetchPolicies();
        fetchCategories();
        fetchLeaves();
        fetchDepartments();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // For multi-select category
        if (name === "category_ids") {
            const selectedOptions = Array.from(
                e.target.selectedOptions,
                (option) => parseInt(option.value)
            );
            setNewLeave((prev) => ({ ...prev, category_ids: selectedOptions }));
        } else {
            setNewLeave((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleAddLeave = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${HRMS_API_BASE}/leave/leave-types`, newLeave,
                { headers: { Authorization: `Bearer ${token}` }, }
            );
            setIsAddModalOpen(false);
            setNewLeave({
                leave_type: "",
                policy_id: "",
                description: "",
                category_ids: [],
            });
            fetchLeaves();
            setMessage("Leave created successfully!");
            setMessageType("success");
        } catch (err) {
            console.error("Error adding leave", err);
            const errorMsg =
                err.response?.data?.message || err.response?.data?.error || err.message;

            setMessage(errorMsg);
            setMessageType("error");
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(
                `${HRMS_API_BASE}
                /leave/leave-types/${showDeleteConfirm.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setShowDeleteConfirm(null);
            fetchLeaves();
            setMessage("Leave deleted successfully!");
            setMessageType("success");
        } catch (err) {
            console.error("Error deleting leave", err);
            setMessage("Failed to delete leave.");
            setMessageType("error");
        }
    };

    ///////////// Edit Code ////////////////////
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editLeave, setEditLeave] = useState(null);

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditLeave((prev) => ({ ...prev, [name]: value }));
    };

    const openEditModal = (leave) => {
        setEditLeave({
            ...leave,
            status: leave.status ? "true" : "false",
        });
        setIsEditModalOpen(true);
    };

    const [selectedLeave, setSelectedLeave] = useState(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const openDetailsModal = (leave) => {
        setSelectedLeave(leave);
        setIsDetailsModalOpen(true);
    };

    const handleEditDepartmentChange = (selected) => {
        if (selected.includes("all")) {
            const allDeptIds = departments.map((d) => d.dept_id);
            setEditLeave((prev) => ({ ...prev, department_ids: allDeptIds }));
        } else {
            setEditLeave((prev) => ({ ...prev, department_ids: selected }));
        }
    };

    const handleEditLeave = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `${HRMS_API_BASE}/leave/leave-types/${editLeave.id}`,
                {
                    ...editLeave,
                    status: editLeave.status === "true", // convert back to boolean
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setIsEditModalOpen(false);
            setEditLeave(null);
            fetchLeaves();
            setMessage("Leave updated successfully. Changes will apply in the next allocation cycle.");
            setMessageType("success");
        } catch (err) {
            console.error("Error updating leave", err);
            const errorMsg = err.response?.data?.message || "Failed to update leave.";
            setMessage(errorMsg);
            setMessageType("error");
        }
    };
    ///////////// End Edit Code ////////////////////

    return (
        <div className="w-full">
            {/* Add Leave Button */}
            <div className="justify-between flex mb-3 mt-4">
                <AddButton onClick={() => setIsAddModalOpen(true)} icon={FaPlus}>Create Leave</AddButton>
            </div>

            {/* Add Leave Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Create Leave</h2>

                        <form onSubmit={handleAddLeave}>
                            {/* Leave Type */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">
                                    Leave Type<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="leave_type"
                                    value={newLeave.leave_type}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>

                            {/* Policy */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">
                                    Policy<span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="policy_id"
                                    value={newLeave.policy_id}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                >
                                    <option value="">Select Policy</option>
                                    {policies.map((policy) => (
                                        <option key={policy.id} value={policy.id}>
                                            {policy.policy_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ✅ Department Multi-Select */}
                            <MultiSelectDropdown
                                label="Departments"
                                options={[
                                    { value: "all", label: "All Departments" },
                                    ...departments.map((d) => ({ value: d.dept_id, label: d.dept_name })),
                                ]}
                                selected={newLeave.department_ids}
                                onChange={(val) => setNewLeave((prev) => ({ ...prev, department_ids: val }))}
                                required
                            />


                            {/* Category (Multi-select Dropdown) */}
                            <MultiSelectDropdown
                                label="Category"
                                required
                                options={categories
                                    .filter((cat) => cat.status === "active")
                                    .map((cat) => ({
                                        value: cat.category_id,
                                        label: cat.category,
                                    }))}
                                selected={newLeave.category_ids}
                                onChange={(val) => setNewLeave({ ...newLeave, category_ids: val })}
                            />

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={newLeave.description}
                                    onChange={handleInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    rows={3}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Leave Table */}
            <div className="h-[75vh] sm:h-[60vh] md:h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Leave Type</th>
                                <th className="p-5 text-left text-black">Description</th>
                                <th className="p-5 text-left text-black">Policy</th>
                                <th className="p-5 text-left text-black">Categories</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Date</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedLeaves.map((leave, index) => (
                                <tr key={leave.id} className={`${index % 2 === 0 ? "bg-tableblue" : "bg-white"}`} >
                                    <td className="px-5 py-4">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                    <td className="px-5 py-4 text-blue-600 cursor-pointer hover:underline" onClick={() => openDetailsModal(leave)} > {leave.leave_type} </td>
                                    <td className="px-5 py-4">{leave.description || "NA"}</td>
                                    <td className="px-5 py-4">{policies.find((p) => p.id === leave.policy_id)?.policy_name || leave.policy_id}</td>
                                    <td className="px-5 py-4">{leave.category_ids && leave.category_ids.length > 0 ? leave.category_ids.map((id) => categories.find((c) => c.category_id === id)?.category || id).join(", ") : "NA"}</td>
                                    <td className="px-5 py-4"><span className={`font-medium ${leave.status ? " text-green-600" : " text-red-600"}`} >{leave.status ? "Active" : "Inactive"}</span></td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(leave.created_at).toLocaleDateString("en-GB")}</td>
                                    <td className="px-5 py-4">
                                        <button onClick={() => openEditModal(leave)} className="text-blue-600" > <EditIcon /></button>
                                        <button onClick={() => setShowDeleteConfirm(leave)} className="text-red-600" > <DeleteIcon /> </button>
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
                    onPageChange={setCurrentPage}
                />
            </div>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
                open={!!showDeleteConfirm}
                onCancel={() => setShowDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Delete Leave?"
                message={`Are you sure you want to delete "${showDeleteConfirm?.leave_type}"?`}
            />

            {isEditModalOpen && editLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Edit Leave</h2>

                        <form onSubmit={handleEditLeave}>
                            {/* Leave Type */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">
                                    Leave Type<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="leave_type"
                                    value={editLeave.leave_type}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>

                            {/* Policy */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">
                                    Policy<span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="policy_id"
                                    value={editLeave.policy_id}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                >
                                    <option value="">Select Policy</option>
                                    {policies.map((policy) => (
                                        <option key={policy.id} value={policy.id}>
                                            {policy.policy_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* ✅ Department Multi-Select */}
                            <MultiSelectDropdown
                                label="Department"
                                required
                                options={[
                                    { value: "all", label: "All Departments" },
                                    ...departments.map((d) => ({
                                        value: d.dept_id,
                                        label: d.dept_name,
                                    })),
                                ]}
                                selected={editLeave.department_ids || []}
                                onChange={handleEditDepartmentChange}
                            />

                            {/* Category */}
                            <MultiSelectDropdown
                                label="Category"
                                required
                                options={categories
                                    .filter((cat) => cat.status === "active")
                                    .map((cat) => ({
                                        value: cat.category_id,
                                        label: cat.category,
                                    }))}
                                selected={editLeave.category_ids}
                                onChange={(val) => setEditLeave({ ...editLeave, category_ids: val })}
                            />

                            {/* Description */}
                            <div className="mb-3">
                                <label className="block text-sm font-medium mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={editLeave.description}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    rows={3}
                                />
                            </div>

                            {/* Status */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-1">
                                    Status<span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={editLeave.status}
                                    onChange={handleEditInputChange}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                    required
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="bg-gray-300 px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                                >
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            <MessageModal message={message} type={messageType} setMessage={setMessage} />

            {isDetailsModalOpen && selectedLeave && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-lg">
                        <h2 className="text-xl font-semibold mb-4">Leave Details</h2>

                        <div className="space-y-3 text-sm">
                            <div><strong>Leave Type:</strong> {selectedLeave.leave_type}</div>

                            <div><strong>Description:</strong> {selectedLeave.description || "NA"}</div>

                            <div>
                                <strong>Policy:</strong>{" "}
                                {policies.find((p) => p.id === selectedLeave.policy_id)?.policy_name ||
                                    selectedLeave.policy_id ||
                                    "NA"}
                            </div>

                            <div>
                                <strong>Categories:</strong>{" "}
                                {selectedLeave.category_ids && selectedLeave.category_ids.length > 0
                                    ? selectedLeave.category_ids
                                        .map(
                                            (id) =>
                                                categories.find((c) => c.category_id === id)?.category ||
                                                id
                                        )
                                        .join(", ")
                                    : "NA"}
                            </div>

                            <div>
                                <strong>Departments:</strong>{" "}
                                {selectedLeave.department_ids && selectedLeave.department_ids.length > 0
                                    ? selectedLeave.department_ids
                                        .map(
                                            (id) =>
                                                departments.find((d) => d.dept_id === id)?.dept_name || id
                                        )
                                        .join(", ")
                                    : "NA"}
                            </div>

                            <div> <strong>Status:</strong>{" "} <span className={`font-medium ${selectedLeave.status ? "text-green-600" : "text-red-600"}`} > {selectedLeave.status ? "Active" : "Inactive"} </span> </div>
                            <div> <strong>Created At:</strong>{" "} {new Date(selectedLeave.created_at).toLocaleDateString("en-GB")} </div>
                        </div>

                        <div className="flex justify-end mt-5">
                            <button onClick={() => setIsDetailsModalOpen(false)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400" > Close </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AllLeave;