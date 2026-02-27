import React, { useState } from "react";
import axios from "axios";
import Pagination from "../../NewComponents/Pagination";
import { DeleteIcon,EditIcon } from "../../NewComponents/ReactIcons";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import { HRMS_API_BASE } from "../../config/apiBase";

const PolicyTable = ({ policies, fetchPolicies, onEdit, onViewDetails }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [policyToDelete, setPolicyToDelete] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    
    const itemsPerPage = 25;
    const totalPages = Math.ceil((policies?.length || 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentPolicies = policies?.slice(startIndex, startIndex + itemsPerPage) || [];

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Open delete modal
    const handleDeleteClick = (policy) => {
        // prevent opening if another delete is in progress
        if (deletingId) return;
        setPolicyToDelete(policy);
        setDeletingId(policy.id || policy._id || null);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!policyToDelete) return;
        if (loading) return; 
        setLoading(true);
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${HRMS_API_BASE}/leave/leave-policy/${policyToDelete.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            await fetchPolicies();
            setIsDeleteModalOpen(false);
            setPolicyToDelete(null);
            setDeletingId(null);
        } catch (error) {
            console.error("Delete failed:", error);
        } finally {
            setLoading(false);
            setDeletingId(null);
        }
    };
    const handleViewDetails = (policy) => {
        if (onViewDetails) return onViewDetails(policy);
    };

    return (
        <div className="relative mt-3">
            <div className="h-[75vh] sm:h-[50vh] md:h-[40vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white rounded-lg">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Policy Name</th>
                                <th className="p-5 text-left text-black">Allocation Frequency</th>
                                <th className="p-5 text-left text-black">Allocation</th>
                                <th className="p-5 text-left text-black">Half Day Allowed</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Date</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="6" className="h-3 bg-white"></td></tr>
                            {currentPolicies.map((policy, index) => (
                                <tr key={index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {(currentPage - 1) * itemsPerPage + index + 1} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-blue-600 cursor-pointer hover:underline" onClick={() => handleViewDetails(policy)} > {policy.policy_name} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{policy.allocation_type}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{policy.allocation}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {policy.half_day_allowed ? "Yes" : "No"} </td>
                                    <td className="px-5 py-4"><span className={`font-medium ${policy.status ? " text-green-600" : " text-red-600"}`} >{policy.status ? "Active" : "Inactive"}</span></td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(policy.created_at).toLocaleDateString("en-GB")}</td>
                                    <td className="px-2 md:px-4 py-2 text-left flex items-center">
                                        <button className={`text-blue-600 hover:text-blue-800 mr-3 p-1 rounded ${deletingId === (policy.id || policy._id) ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => onEdit ? onEdit(policy) : null} aria-label={`Edit ${policy.policy_name}`} > <EditIcon /> </button>
                                        <button className={`text-red-500 hover:text-red-700 p-1 rounded ${deletingId === (policy.id || policy._id) ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={() => handleDeleteClick(policy)} disabled={deletingId === (policy.id || policy._id)} aria-label={`Delete ${policy.policy_name}`} > <DeleteIcon /> </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            </div>

            <DeleteConfirmModal
                open={isDeleteModalOpen}
                onCancel={() => {
                    if (loading) return; 
                    setIsDeleteModalOpen(false);
                    setPolicyToDelete(null);
                    setDeletingId(null);
                }}
                onConfirm={handleConfirmDelete}
                loading={loading}
                title="Delete Policy?"
                message={`Are you sure you want to delete policy "${policyToDelete?.policy_name}"?`}
            />
        </div>
    );
};
export default PolicyTable;