import { useEffect, useState } from "react";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import UpdateGoalModal from "./UpdateGoalModal";

const GoalManager = () => {
    const [goals, setGoals] = useState([]);
    const [filteredGoals, setFilteredGoals] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    const [goal, setGoal] = useState("");
    const [description, setDescription] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [searchText, setSearchText] = useState("");
    const [filterDept, setFilterDept] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    const token = sessionStorage.getItem("token");

    // Fetch Departments
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get("https://devdemo.softtrails.net/departments", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const activeDepartments = response.data
                    .filter((d) => d.status === "Active")
                    .map((d) => ({
                        value: d.dept_id.toString(),
                        label: d.dept_name,
                    }));
                setDepartments(activeDepartments);
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };
        fetchDepartments();
    }, [token]);

    // Fetch Goals
    const fetchGoals = async () => {
        setLoading(true);
        try {
            const response = await axios.get("https://devdemo.softtrails.net/pms/goals", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGoals(response.data);
        } catch (error) {
            console.error("Error fetching goals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    // Form Submit
    const handleSubmit = async () => {
        if (!goal || !description || !selectedDepartment) {
            Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "Please fill all fields before submitting.",
            });
            return;
        }

        const payload = {
            goal,
            description,
            department_id: selectedDepartment.value,
        };

        try {
            const response = await axios.post("https://devdemo.softtrails.net/pms/goals", payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const newGoal = {
                id: response.data?.id || Date.now(), // fallback to temp id
                goal,
                description,
                department_id: selectedDepartment.value,
                created_at: new Date().toISOString(), // temp date
            };

            setGoals((prev) => [newGoal, ...prev]); // append new goal to the beginning
            setGoal("");
            setDescription("");
            setSelectedDepartment(null);

            Swal.fire({
                icon: "success",
                title: "Goal Submitted",
                text: "Your goal has been successfully added.",
                timer: 2000,
                showConfirmButton: false,
            });
        } catch (error) {
            console.error("Error submitting goal:", error);
            Swal.fire({
                icon: "error",
                title: "Submission Failed",
                text: "There was an issue submitting your goal.",
            });
        }
    };

    // Filter Logic
    useEffect(() => {
        let filtered = [...goals];

        if (searchText) {
            const lower = searchText.toLowerCase();
            filtered = filtered.filter(
                (g) =>
                    g.goal.toLowerCase().includes(lower) ||
                    (g.description && g.description.toLowerCase().includes(lower))
            );
        }

        if (filterDept) {
            filtered = filtered.filter((g) => g.department_id === filterDept.value);
        }

        if (fromDate) {
            filtered = filtered.filter(
                (g) => new Date(g.created_at) >= new Date(fromDate)
            );
        }

        if (toDate) {
            filtered = filtered.filter(
                (g) => new Date(g.created_at) <= new Date(toDate)
            );
        }

        setFilteredGoals(filtered);
        setCurrentPage(1); // Reset on filter
    }, [goals, searchText, filterDept, fromDate, toDate]);

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentGoals = filteredGoals.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredGoals.length / itemsPerPage);

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    ///////////////////Delete/////////////////////////////////
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [goalToDelete, setGoalToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    //////////////Edit////////////////////
    const [selectedGoal, setSelectedGoal] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const handleEdit = (goal) => {
        setSelectedGoal(goal);
        setShowEditModal(true);
    };

    const handleGoalUpdated = () => {
        fetchGoals(); // Refetch goals or update local state
    };

    return (
        <div >
            {/* Form */}
            <div className="bg-white border rounded-md p-4 grid grid-cols-5 gap-4 items-end ">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Goal<span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter goal" value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Description<span className="text-red-500">*</span></label>
                    <input type="text" placeholder="Enter description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full mt-1 border rounded-md px-3 py-2 text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Department<span className="text-red-500">*</span></label>
                    <Select options={departments} value={selectedDepartment} onChange={setSelectedDepartment} placeholder="Select department" isSearchable className="text-sm" />
                </div>
                <div className="col-span-1"></div>
                <div>
                    <button onClick={handleSubmit} className="bg-blue-600 text-white rounded-md w-full py-2 px-4 text-sm" > Submit </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mt-6 mb-5">
                <input type="text" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="border px-3 py-2 rounded-md text-sm w-1/4" />

                <Select options={departments} value={filterDept} onChange={setFilterDept} placeholder="Filter by Department" className="text-sm w-1/4" isClearable />

                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border px-3 py-2 rounded-md text-sm" />
                <span className="text-sm text-gray-500">TO</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border px-3 py-2 rounded-md text-sm" />
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[50vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Goals</th>
                                <th className="p-5 text-left text-black">Department</th>
                                <th className="p-5 text-left text-black">Description</th>
                                <th className="p-5 text-left text-black">Date</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {currentGoals.map((goal, index) => {
                                const deptName = departments.find((d) => d.value === String(goal.department_id))?.label || "N/A";
                                return (
                                    <tr key={goal.id || index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`} >
                                        <td className="px-5 py-4 text-left text-[14px] text-black"> {(currentPage - 1) * itemsPerPage + index + 1} </td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{goal.goal}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{deptName}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">
                                            {goal.description?.length > 50 ? `${goal.description.slice(0, 50)}... ` : goal.description}
                                            {goal.description?.length > 50 && (<span className="text-blue-600 cursor-pointer">Read more...</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{new Date(goal.created_at).toLocaleDateString()}</td>
                                        <td className="px-5 py-4 text-left flex gap-2">
                                            <button className="text-blue-700" onClick={() => handleEdit(goal)}>
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button className="text-red-600" onClick={() => { setGoalToDelete(goal); setIsModalOpen(true); }} >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {/* {totalPages > 1 && ( */}
                <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lt;
                    </button>

                    <span className="px-3 py-1 bg-blue-600 text-white rounded">
                        {currentPage}
                    </span>
                    <span>of</span>
                    <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
                        {totalPages}
                    </span>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &gt;
                    </button>
                </div>
                {/* )} */}
            </div>

            <DeleteConfirmModal
                open={isModalOpen}
                title={`Delete Goal "${goalToDelete?.goal}"?`}
                message="Are you sure you want to delete this goal?"
                onCancel={() => {
                    setIsModalOpen(false);
                    setGoalToDelete(null);
                }}
                onConfirm={async () => {
                    setIsDeleting(true);
                    try {
                        await axios.delete(
                            `https://devdemo.softtrails.net/pms/goals/${goalToDelete?.id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        setGoals((prevGoals) =>
                            prevGoals.filter((g) => g.id !== goalToDelete?.id)
                        );
                    } catch (error) {
                        console.error("Error deleting goal:", error);
                    } finally {
                        setIsDeleting(false);
                        setIsModalOpen(false);
                        setGoalToDelete(null);
                    }
                }}
                loading={isDeleting}
            />

            <UpdateGoalModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                goalData={selectedGoal}
                departments={departments}         // 👈 pass departments here
                onUpdated={handleGoalUpdated}
            />
        </div>
    );
};
export default GoalManager;