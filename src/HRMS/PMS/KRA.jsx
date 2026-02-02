import { useEffect, useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from "axios";
import Swal from "sweetalert2";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";

const KRAComponent = () => {
    const [kra, setKra] = useState("");
    const [goalId, setGoalId] = useState("");
    const [goalList, setGoalList] = useState([]);
    const [kraList, setKraList] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [filterGoal, setFilterGoal] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [kraToDelete, setKraToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // // Fetch all goals
    // useEffect(() => {
    //     axios
    //         .get("https://devdemo.softtrails.net/pms/goals")
    //         .then((res) => setGoalList(res.data))
    //         .catch((err) => console.error("Error fetching goals:", err));
    // }, []);

    // // Fetch all KRAs
    // const fetchKRAs = () => {
    //     axios.get("https://devdemo.softtrails.net/pms/kra")
    //         .then((res) => setKraList(res.data))
    //         .catch((err) => console.error("Error fetching KRAs:", err));
    // };
    // useEffect(() => {
    //     fetchKRAs();
    // }, []);

    // const handleSubmit = async () => {
    //     if (kra && goalId) {
    //         try {
    //             const response = await axios.post("https://devdemo.softtrails.net/pms/kra", {
    //                 kra_name: kra,
    //                 goal_id: parseInt(goalId),
    //             });

    //             const newKRA = {
    //                 id: response.data.id || Math.random(),
    //                 kra_name: kra,
    //                 goal: goalList.find((g) => g.id === parseInt(goalId))?.goal || "",
    //                 created_at: new Date().toISOString(),
    //             };

    //             setKraList((prev) => [newKRA, ...prev]); // Prepend to list
    //             setKra("");
    //             setGoalId("");
    //             Swal.fire("Success", "KRA added successfully!", "success");
    //         } catch (error) {
    //             console.error("Error posting KRA:", error);
    //             Swal.fire("Error", "Failed to add KRA. Please try again.", "error");
    //         }
    //     } else {
    //         Swal.fire("Validation Error", "Please fill in all fields.", "warning");
    //     }
    // };

    // Fetch all goals
    useEffect(() => {
        const token = sessionStorage.getItem("token");
        axios
            .get("https://devdemo.softtrails.net/pms/goals", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => setGoalList(res.data))
            .catch((err) => console.error("Error fetching goals:", err));
    }, []);

    // Fetch all KRAs
    const fetchKRAs = () => {
        const token = sessionStorage.getItem("token");
        axios
            .get("https://devdemo.softtrails.net/pms/kra", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => setKraList(res.data))
            .catch((err) => console.error("Error fetching KRAs:", err));
    };
    useEffect(() => {
        fetchKRAs();
    }, []);

    const handleSubmit = async () => {
        if (kra && goalId) {
            try {
                const token = sessionStorage.getItem("token");
                const response = await axios.post(
                    "https://devdemo.softtrails.net/pms/kra",
                    {
                        kra_name: kra,
                        goal_id: parseInt(goalId),
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const newKRA = {
                    id: response.data.id || Math.random(),
                    kra_name: kra,
                    goal: goalList.find((g) => g.id === parseInt(goalId))?.goal || "",
                    created_at: new Date().toISOString(),
                };

                setKraList((prev) => [newKRA, ...prev]); // Prepend to list
                setKra("");
                setGoalId("");
                Swal.fire("Success", "KRA added successfully!", "success");
            } catch (error) {
                console.error("Error posting KRA:", error);
                Swal.fire("Error", "Failed to add KRA. Please try again.", "error");
            }
        } else {
            Swal.fire("Validation Error", "Please fill in all fields.", "warning");
        }
    };

    const filteredKRAs = kraList
        .filter((item) => item.kra_name.toLowerCase().includes(searchText.toLowerCase()))
        .filter((item) => filterGoal ? item.goal === filterGoal : true)
        .filter((item) => {
            if (!fromDate && !toDate) return true;
            const itemDate = new Date(item.created_at || new Date());
            const from = fromDate ? new Date(fromDate) : null;
            const to = toDate ? new Date(toDate) : null;
            return (!from || itemDate >= from) && (!to || itemDate <= to);
        });

    // Pagination
    const totalPages = Math.ceil(filteredKRAs.length / itemsPerPage);
    const currentItems = filteredKRAs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const openDeleteModal = (kraItem) => {
        setKraToDelete(kraItem);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!kraToDelete) return;

        setDeleting(true);
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(
                `https://devdemo.softtrails.net/pms/kra/${kraToDelete.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setKraList(prev => prev.filter(kra => kra.id !== kraToDelete.id));
            Swal.fire("Deleted", "KRA deleted successfully", "success");
        } catch (error) {
            console.error("Delete failed", error);
            Swal.fire("Error", "Failed to delete KRA", "error");
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
            setKraToDelete(null);
        }
    };

    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedKRA, setSelectedKRA] = useState(null);
    const [updatedKRA, setUpdatedKRA] = useState("");
    const [updatedGoalId, setUpdatedGoalId] = useState("");

    return (
        <div >
            {/* Add KRAs */}
            <div className="bg-white border shadow-md p-4 rounded-md mb-4">
                <h2 className="font-semibold text-[18px] text-[#1B254B] mb-4">
                    Add KRA's
                </h2>
                <div className="flex flex-wrap gap-4">
                    <input type="text" placeholder="Enter KRA's" className="border w-[250px] rounded-md px-4 py-2 focus:outline-none" value={kra} onChange={(e) => setKra(e.target.value)} />
                    <div className="relative w-[250px]">
                        <select value={goalId} onChange={(e) => setGoalId(e.target.value)} className="w-full border rounded-md px-4 py-2 appearance-none focus:outline-none" >
                            <option value="">Select Goal</option>
                            {goalList.map((goal) => (
                                <option key={goal.id} value={goal.id}>
                                    {goal.goal}
                                </option>
                            ))}
                        </select>
                        <MdKeyboardArrowDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                    </div>
                    <button onClick={handleSubmit} className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700" > Submit </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center mb-4">
                <input type="text" placeholder="Search" value={searchText} onChange={(e) => setSearchText(e.target.value)} className="border rounded-md px-4 py-2 w-[250px]" />
                <div className="relative">
                    <select value={filterGoal} onChange={(e) => setFilterGoal(e.target.value)} className="border rounded-md px-4 py-2 w-[200px] appearance-none" >
                        <option value="">Filter by Goal</option>
                        {goalList.map((g) => (<option key={g.id} value={g.goal}> {g.goal} </option>))}
                    </select>
                    <MdKeyboardArrowDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="border rounded-md px-2 py-2"
                    />
                    <span>TO</span>
                    <input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="border rounded-md px-2 py-2"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[50vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">KRA's</th>
                                <th className="p-5 text-left text-black">Goal</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="7" className="h-3 bg-white"></td></tr>
                            {currentItems.map((item, index) => {
                                return (
                                    <tr key={item.id || index} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`} >
                                        <td className="px-5 py-4 text-left text-[14px] text-black">                                     {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{item.kra_name}</td>
                                        <td className="px-5 py-4 text-left text-[14px] text-black">{item.goal}</td>
                                        <td className="px-5 py-4 text-left flex gap-2">
                                            <button
                                                className="text-blue-700"
                                                onClick={() => {
                                                    setSelectedKRA(item);
                                                    setUpdatedKRA(item.kra_name);
                                                    const goalObj = goalList.find((g) => g.goal === item.goal);
                                                    setUpdatedGoalId(goalObj?.id || "");
                                                    setShowEditModal(true);
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faEdit} />
                                            </button>
                                            <button onClick={() => openDeleteModal(item)} className="text-red-600" > <FontAwesomeIcon icon={faTrash} /> </button>
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
                        <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed" > &lt; </button>

                        <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                        <span>of</span>
                        <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">{totalPages}</span>

                        <button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed" > &gt; </button>
                    </div>
                )}
            </div>

            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg w-[90%] max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Update KRA</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-red-500 text-xl font-bold">
                                &times;
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">KRA</label>
                            <input
                                type="text"
                                value={updatedKRA}
                                onChange={(e) => setUpdatedKRA(e.target.value)}
                                className="w-full border px-4 py-2 rounded"
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Recommended Goals</label>
                            <select
                                value={updatedGoalId}
                                onChange={(e) => setUpdatedGoalId(e.target.value)}
                                className="w-full border px-4 py-2 rounded"
                            >
                                <option value="">Select Goal</option>
                                {goalList.map((goal) => (
                                    <option key={goal.id} value={goal.id}>
                                        {goal.goal}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-4">
                            <button onClick={() => setShowEditModal(false)} className="px-6 py-2 border rounded-md hover:bg-gray-100" > Cancel </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const token = sessionStorage.getItem("token");
                                        await axios.put(`https://devdemo.softtrails.net/pms/kra/${selectedKRA.id}`,
                                            {
                                                kra_name: updatedKRA,
                                                goal_id: parseInt(updatedGoalId),
                                            },
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,
                                                },
                                            }
                                        );
                                        fetchKRAs();
                                        setShowEditModal(false);
                                        Swal.fire("Updated", "KRA updated successfully", "success");
                                    } catch (err) {
                                        console.error("Update error", err);
                                        Swal.fire("Error", "Failed to update KRA", "error");
                                    }
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmModal
                open={showDeleteModal}
                onCancel={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteConfirm}
                loading={deleting}
                title="Delete KRA?"
                message={`Are you sure you want to delete "${kraToDelete?.kra_name}"?`}
            />
        </div>
    );
};
export default KRAComponent;