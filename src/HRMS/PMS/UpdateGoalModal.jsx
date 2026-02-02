import React, { useEffect, useState } from "react";
import Select from "react-select";
import axios from "axios";
import { IoMdClose } from "react-icons/io";

const UpdateGoalModal = ({ isOpen, onClose, goalData, onUpdated }) => {
    const [goal, setGoal] = useState("");
    const [description, setDescription] = useState("");
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [loading, setLoading] = useState(false);

    const token = sessionStorage.getItem("token");

    // Set form fields when modal opens
    useEffect(() => {
        if (goalData) {
            setGoal(goalData.goal || "");
            setDescription(goalData.description || "");
        }
    }, [goalData]);

    // Fetch departments and pre-fill selected department
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await axios.get("https://devdemo.softtrails.net/departments", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const deptOptions = res.data
                    .filter((d) => d.status === "Active")
                    .map((d) => ({
                        value: d.dept_id.toString(),
                        label: d.dept_name,
                    }));

                setDepartments(deptOptions);

                if (goalData?.department_id) {
                    const selected = deptOptions.find(
                        (d) => d.value === goalData.department_id.toString()
                    );
                    setSelectedDepartment(selected || null);
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        if (isOpen) {
            fetchDepartments();
        }
    }, [isOpen, goalData, token]);

    const handleUpdate = async () => {
        if (!goal || !description || !selectedDepartment) {
            alert("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            await axios.put(
                `https://devdemo.softtrails.net/pms/goals/${goalData.id}`,
                {
                    goal,
                    description,
                    department_id: selectedDepartment.value,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            onUpdated();
            onClose();
        } catch (error) {
            console.error("Update failed", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white w-[500px] rounded-lg p-6 relative">
                <button className="absolute top-4 right-4 text-red-600 text-xl" onClick={onClose}>
                    <IoMdClose />
                </button>

                <h2 className="text-xl font-bold mb-4">Update Goal</h2>

                <label className="text-sm font-medium">Goal</label>
                <input
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    placeholder="Enter goal"
                />

                <label className="text-sm font-medium">Recommended Department</label>
                <Select
                    options={departments}
                    value={selectedDepartment}
                    onChange={setSelectedDepartment}
                    placeholder="Select Department"
                    isSearchable
                    className="mb-4"
                />

                <label className="text-sm font-medium">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded mb-6"
                />

                <div className="flex justify-between">
                    <button
                        onClick={handleUpdate}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? "Updating..." : "Update"}
                    </button>
                    <button
                        onClick={onClose}
                        className="border px-6 py-2 rounded hover:bg-gray-100"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdateGoalModal;
