import axios from "axios";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MappingComponent = () => {
    const [goals, setGoals] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [kras, setKras] = useState([]);
    const [mappings, setMappings] = useState([]);

    const [selectedGoal, setSelectedGoal] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedKra, setSelectedKra] = useState("");

    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [loading, setLoading] = useState(false);

    const itemsPerPage = 25;
    const [currentPage, setCurrentPage] = useState(1);

    // useEffect(() => {
    //     axios.get("https://devdemo.softtrails.net/pms/goals").then(res => setGoals(res.data));
    //     axios.get("https://devdemo.softtrails.net/departments").then(res => setDepartments(res.data));
    //     axios.get("https://devdemo.softtrails.net/pms/kra").then(res => setKras(res.data));
    //     fetchMappings();
    // }, []);

    // const fetchMappings = () => {
    //     axios.get("https://devdemo.softtrails.net/pms/goal-kra-dept-mapping")
    //         .then(res => setMappings(res.data))
    //         .catch(err => console.error("Failed to fetch mappings", err));
    // };

    // const handleSubmit = () => {
    //     if (!selectedGoal || !selectedDept || !selectedKra) {
    //         return Swal.fire({
    //             icon: "warning",
    //             title: "Missing Fields",
    //             text: "All fields are required.",
    //         });
    //     }
    //     const token = sessionStorage.getItem("token");
    //     const headers = {
    //         Authorization: `Bearer ${token}`,
    //     };
    //     axios.post(
    //         "https://devdemo.softtrails.net/pms/goal-kra-dept-mapping",
    //         {
    //             goal_id: parseInt(selectedGoal),
    //             department_id: parseInt(selectedDept),
    //             kra_id: parseInt(selectedKra),
    //         },
    //         { headers }
    //     )
    //         .then(() => {
    //             Swal.fire({
    //                 icon: "success",
    //                 title: "Mapping Added",
    //                 text: "The mapping was added successfully.",
    //             });
    //             fetchMappings();
    //             setSelectedGoal("");
    //             setSelectedDept("");
    //             setSelectedKra("");
    //         })
    //         .catch((error) => {
    //             Swal.fire({
    //                 icon: "error",
    //                 title: "Error",
    //                 text: error?.response?.data?.message || "Something went wrong!",
    //             });
    //         });
    // };

    useEffect(() => {
        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        axios
            .get("https://devdemo.softtrails.net/pms/goals", { headers })
            .then(res => setGoals(res.data))
            .catch(err => console.error("Failed to fetch goals", err));

        axios
            .get("https://devdemo.softtrails.net/departments", { headers })
            .then(res => setDepartments(res.data))
            .catch(err => console.error("Failed to fetch departments", err));

        axios
            .get("https://devdemo.softtrails.net/pms/kra", { headers })
            .then(res => setKras(res.data))
            .catch(err => console.error("Failed to fetch kras", err));

        fetchMappings();
    }, []);

    const fetchMappings = () => {
        const token = sessionStorage.getItem("token");
        axios
            .get("https://devdemo.softtrails.net/pms/goal-kra-dept-mapping", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then(res => setMappings(res.data))
            .catch(err => console.error("Failed to fetch mappings", err));
    };

    const handleSubmit = () => {
        if (!selectedGoal || !selectedDept || !selectedKra) {
            return Swal.fire({
                icon: "warning",
                title: "Missing Fields",
                text: "All fields are required.",
            });
        }

        const token = sessionStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        axios
            .post(
                "https://devdemo.softtrails.net/pms/goal-kra-dept-mapping",
                {
                    goal_id: parseInt(selectedGoal),
                    department_id: parseInt(selectedDept),
                    kra_id: parseInt(selectedKra),
                },
                { headers }
            )
            .then(() => {
                Swal.fire({
                    icon: "success",
                    title: "Mapping Added",
                    text: "The mapping was added successfully.",
                });
                fetchMappings();
                setSelectedGoal("");
                setSelectedDept("");
                setSelectedKra("");
            })
            .catch((error) => {
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text:
                        error?.response?.data?.message ||
                        "Something went wrong!",
                });
            });
    };

    const confirmDelete = (id) => {
        setDeleteId(id);
        setModalOpen(true);
    };

    const handleDelete = () => {
        setLoading(true);
        // Simulate delete — you'd replace with actual delete API when available
        setTimeout(() => {
            setMappings((prev) => prev.filter((m) => m.id !== deleteId));
            setModalOpen(false);
            setLoading(false);
        }, 800);
    };

    const filtered = mappings.filter((m) => {
        const matchSearch = m.goal_name.toLowerCase().includes(search.toLowerCase()) ||
            m.kra_name.toLowerCase().includes(search.toLowerCase());
        const matchDept = filterDept ? m.department_name === filterDept : true;
        const createdAt = new Date(m.created_at);
        const matchFrom = fromDate ? new Date(fromDate) <= createdAt : true;
        const matchTo = toDate ? new Date(toDate) >= createdAt : true;
        return matchSearch && matchDept && matchFrom && matchTo;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    ///////////////////////////// EDIT ////////////////////////
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingMapping, setEditingMapping] = useState(null);
    const [editGoalId, setEditGoalId] = useState("");
    const [editDeptId, setEditDeptId] = useState("");
    const [editKraId, setEditKraId] = useState("");

    return (
        <div>
            {/* Form */}
            <div className="bg-white border rounded-md p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Goal<span className="text-red-500">*</span></label>
                    <select
                        value={selectedGoal}
                        onChange={(e) => setSelectedGoal(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm"
                    >
                        <option value="">Select goal</option>
                        {goals.map((g) => (
                            <option key={g.id} value={g.id}>{g.goal}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Department<span className="text-red-500">*</span></label>
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm"
                    >
                        <option value="">Select Department</option>
                        {departments
                            .filter((d) => goals.find((g) => g.id === parseInt(selectedGoal))?.department_id === d.dept_id)
                            .map((d) => (
                                <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                            ))}
                    </select>
                </div>

                <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">Key Result Area (KRA's)<span className="text-red-500">*</span></label>
                    <select
                        value={selectedKra}
                        onChange={(e) => setSelectedKra(e.target.value)}
                        className="border px-3 py-2 rounded w-full text-sm"
                    >
                        <option value="">Select KRA</option>
                        {kras
                            .filter((k) => k.goal_id === parseInt(selectedGoal))
                            .map((k) => (
                                <option key={k.id} value={k.id}>{k.kra_name}</option>
                            ))}
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4 mt-6">
                <input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="border px-3 py-2 rounded w-[200px]" />
                <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="border px-3 py-2 rounded w-[200px]">
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                        <option key={d.dept_id} value={d.dept_name}>{d.dept_name}</option>
                    ))}
                </select>
                <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="border px-3 py-2 rounded" />
                <span className="self-center">TO</span>
                <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="border px-3 py-2 rounded" />
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
                                <th className="p-5 text-left text-black">KRA's</th>
                                <th className="p-5 text-left text-black">Date</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {currentItems.map((item, index) => {
                                return (
                                    <tr key={item.id || index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`} >
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{item.goal_name}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{item.department_name}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{item.kra_name}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black"> {new Date(item.created_at).toLocaleDateString('en-GB')}</td>
                                        <td className="px-5 py-4 text-left flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingMapping(item);
                                                    setEditGoalId(item.goal_id);
                                                    setEditDeptId(item.department_id);
                                                    // setEditKraId(item.kra_id);
                                                    setEditKraId(parseInt(item.kra_id));
                                                    setEditModalOpen(true);
                                                }}
                                                className="text-blue-700"
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button onClick={() => confirmDelete(item.id)} className="text-red-600" > <FontAwesomeIcon icon={faTrash} /> </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
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
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &gt;
                        </button>
                    </div>
                )}

            </div>

            {editModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-md w-[90%] max-w-lg shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Update Goal Mapping</h2>

                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Goal</label>
                            <select
                                value={editGoalId}
                                onChange={(e) => {
                                    setEditGoalId(e.target.value);
                                    setEditDeptId(""); // reset department when goal changes
                                    setEditKraId("");  // reset KRA when goal changes
                                }}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="">Select Goal</option>
                                {goals.map(g => (
                                    <option key={g.id} value={g.id}>{g.goal}</option>
                                ))}
                            </select>
                        </div>

                        <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">Department</label>
                            <select
                                value={editDeptId}
                                onChange={(e) => setEditDeptId(e.target.value)}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="">Select Department</option>
                                {departments
                                    .filter(d => goals.find(g => g.id === parseInt(editGoalId))?.department_id === d.dept_id)
                                    .map(d => (
                                        <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">KRA's</label>
                            <select
                                value={editKraId}
                                onChange={(e) => setEditKraId(parseInt(e.target.value))}
                                className="w-full border px-3 py-2 rounded"
                            >
                                <option value="">Select KRA</option>
                                {kras
                                    .filter(k => k.goal_id === parseInt(editGoalId))
                                    .map(k => (
                                        <option key={k.id} value={k.id}>{k.kra_name}</option>
                                    ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setEditModalOpen(false)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const token = sessionStorage.getItem("token");
                                        await axios.put(
                                            `https://devdemo.softtrails.net/pms/goal-kra-dept-mapping/${editingMapping.id}`,
                                            {
                                                goal_id: parseInt(editGoalId),
                                                department_id: parseInt(editDeptId),
                                                kra_id: parseInt(editKraId),
                                            },
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            }
                                        );
                                        Swal.fire("Updated", "Mapping updated successfully", "success");
                                        fetchMappings();
                                        setEditModalOpen(false);
                                    } catch (err) {
                                        console.error(err);
                                        const errorMessage =
                                            err?.response?.data?.message || "Failed to update mapping";
                                        Swal.fire("Error", errorMessage, "error");
                                    }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onConfirm={handleDelete}
                loading={loading}
                message="Are you sure you want to delete this mapping?"
            />
        </div>
    );
};
export default MappingComponent;