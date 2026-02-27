import React, { useEffect, useState } from 'react';
import {HRMS_API_BASE} from '../../config/apiBase'; 

const BalanceLeave = () => {
    const [leaves, setLeaves] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const token = sessionStorage.getItem('token');
    const userId = sessionStorage.getItem('userId');
    const itemsPerPage = 6;

    const fetchLeaveBalance = async () => {
        if (!userId) return;
        try {
            const response = await fetch(`${HRMS_API_BASE}/leave/leave-balances/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
    
            if (response.ok) {
                const sortedLeaves = data.leave_balance.sort((a, b) =>
                    a.leave_type.localeCompare(b.leave_type)
                );
                setLeaves(sortedLeaves);
            } else {
                console.error('Error fetching leave balance:', data.message);
            }
        } catch (error) {
            console.error('Error fetching leave balance:', error);
        }
    };    

    useEffect(() => {
        fetchLeaveBalance();
    }, [userId]);

    // Pagination Logic
    const totalPages = Math.ceil(leaves.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLeaves = leaves.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    return (
        <div>
            {/* Card Grid */}
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 p-4">
                {currentLeaves.length > 0 ? (
                    currentLeaves.map((leave) => (
                        <div key={leave.id} className="bg-white shadow-md rounded-lg p-4 border h-auto w-full sm:w-full md:w-64 lg:w-64">
                            <h2 className="text-lg font-semibold text-custome-blue">{leave.leave_type}</h2>
                            <p className="mt-2"><strong>Allocation Type:</strong> {leave.allocation_type}</p>
                            <p className="mt-1"><strong>Current Year Balance:</strong> {leave.balance}</p>
                            <p className="mt-1"><strong>Previous Year Balance:</strong> {leave.previous_balance}</p>
                            <p className="mt-1"><strong>Total Balance:</strong> {leave.total_balance}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center col-span-full p-4">No data available</p>
                )}
            </div>

            <div className="flex justify-center items-center p-4">
                {totalPages > 1 && (
                    <div className="flex flex-wrap justify-center">
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => handlePageChange(index + 1)}
                                className={`px-3 py-1 mx-1 rounded ${currentPage === index + 1
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 hover:bg-gray-300"
                                    }`}
                            >
                                {index + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
export default BalanceLeave;