import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import PolicyModal from './PolicyModal';
import PolicyTable from './PolicyTable';
import PolicyDetailsModal from './PolicyDetailsModal';
import MessageModal from '../../NewComponents/MessageModal';
import {HRMS_API_BASE} from '../../config/apiBase';

function LeavePolicy() {
    const [sandwichLeave, setSandwichLeave] = useState('Yes');
    const [applyCondition, setApplyCondition] = useState('false');
    const [leaveSelection, setLeaveSelection] = useState('Leave Left This Year');
    const [fetchedLeaveCondition, setFetchedLeaveCondition] = useState('');
    const [currentCondition, setCurrentCondition] = useState(null);
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchSandwichLeave();
        fetchLeaveDetails();
    }, []);

    const handleSandwichLeave = async () => {
        const token = sessionStorage.getItem('token');
        const enabled = sandwichLeave === 'Yes';
        try {
            const response = await axios.post(`${HRMS_API_BASE}/leave/sandwich`, { enabled },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Sandwich Leave Response:', response.data);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Sandwich Leave condition applied successfully',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error applying Sandwich Leave condition:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error applying Sandwich Leave condition',
                confirmButtonText: 'Try Again',
            });
        }
    };

    const fetchSandwichLeave = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(`${HRMS_API_BASE}/leave/sandwich`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data && response.data.sandwichLeaveEnabled) {
                setSandwichLeave('Yes');
            } else {
                setSandwichLeave('No');
            }
        } catch (error) {
            console.error('Error fetching Sandwich Leave status:', error);
        }
    };

    const handleLeaveDetails = async () => {
        const token = sessionStorage.getItem('token');
        const leaveValue = leaveSelection === 'Leave Left This Year';
        try {
            const response = await axios.post(`${HRMS_API_BASE}/leave/set-condition`, { condition: leaveValue },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Add token to Authorization header
                        'Content-Type': 'application/json',
                    },
                }
            );
            console.log('Leave Details Response:', response.data);
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Leave details submitted successfully',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error submitting leave details:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: 'Error submitting leave details',
                confirmButtonText: 'Try Again',
            });
        }
    };

    const fetchLeaveDetails = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(`${HRMS_API_BASE}/leave/get-condition`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data && response.data.currentCondition !== undefined) {
                setCurrentCondition(response.data.currentCondition);
                setLeaveSelection(response.data.currentCondition ? 'Leave Left This Year' : 'Total Leave');
                setFetchedLeaveCondition(response.data.currentCondition ? 'Leave Left This Year' : 'Total Leave');
                setApplyCondition(response.data.currentCondition.toString());
            }
        } catch (error) {
            console.error('Error fetching leave condition:', error);
        }
    };

    const handleResetMonthlyLeave = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(`${HRMS_API_BASE}/leave/manual-trigger-monthly`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('Reset Monthly Leave Response:', response.data);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message || 'Monthly leave reset successfully',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error resetting monthly leave:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Error resetting monthly leave',
                confirmButtonText: 'Try Again',
            });
        }
    };

    const handleResetYearlyLeave = async () => {
        const token = sessionStorage.getItem('token');
        try {
            const response = await axios.get(`${HRMS_API_BASE}/leave/manual-trigger-yearly`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log('Reset Yearly Leave Response:', response.data);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message || 'Yearly leave reset successfully',
                confirmButtonText: 'OK',
            });
        } catch (error) {
            console.error('Error resetting yearly leave:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.response?.data?.message || 'Error resetting yearly leave',
                confirmButtonText: 'Try Again',
            });
        }
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [policies, setPolicies] = useState([]);
    const initialFormData = {
        policy_name: "",
        allocation_type: "monthly",
        allocation: "",
        constraint_type: "min",
        constraint_value: "",
        tranche_period: "monthly",
        no_of_tranches: "",
        half_day_allowed: false,
        consecutive_leave_restriction: false,
        consecutive_leave_gap_days: "",
        carry_forward_enabled: false,
        carry_forward_monthly_type: "",
        carry_forward_monthly_value: null,
        carry_forward_yearly_type: "",
        carry_forward_yearly_value: null,
        threshold_enabled: false,
        threshold_value: "",
        document_required: false,
        document_threshold: "",
    };
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});

    const fetchPolicies = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const res = await axios.get(`${HRMS_API_BASE}/leave/get-policy`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            setPolicies(res.data.data || []);
        } catch (err) {
            console.error("Error fetching policies", err);
            setPolicies([]);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleViewDetails = (policy) => {
        setSelectedPolicy(policy);
    };

    const handleEdit = (policy) => {
        // map policy fields to formData shape
        setFormData({
            policy_name: policy.policy_name || "",
            allocation_type: policy.allocation_type || "monthly",
            allocation: policy.allocation ?? 0,
            constraint_type: policy.constraint_type || "min",
            constraint_value: policy.constraint_value ?? 0,
            tranche_period: policy.tranche_period || "monthly",
            no_of_tranches: policy.no_of_tranches ?? 0,
            half_day_allowed: !!policy.half_day_allowed,
            consecutive_leave_restriction: !!policy.consecutive_leave_restriction,
            consecutive_leave_gap_days: policy.consecutive_leave_gap_days ?? 0,
                carry_forward_enabled: !!policy.carry_forward_enabled,
                carry_forward_monthly_type: policy.carry_forward_monthly_type || "",
                carry_forward_monthly_value: policy.carry_forward_monthly_value ?? 0,
                carry_forward_yearly_type: policy.carry_forward_yearly_type || "",
                carry_forward_yearly_value: policy.carry_forward_yearly_value ?? 0,
            threshold_enabled: !!policy.threshold_enabled,
            threshold_value: policy.threshold_value ?? 0,
            document_required: !!policy.document_required,
            document_threshold: policy.document_threshold ?? 0,
        });
        setErrors({});
        setEditingId(policy.id || policy._id || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedPolicy(null);
    };


    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            // If carry_forward is disabled, clear monthly/yearly types and values
            if (name === "carry_forward_enabled" && !checked) {
                setFormData({
                    ...formData,
                    [name]: checked,
                    carry_forward_monthly_type: "",
                    carry_forward_monthly_value: 0,
                    carry_forward_yearly_type: "",
                    carry_forward_yearly_value: 0,
                });
                return;
            }
            setFormData({ ...formData, [name]: checked });
        } else if (value === "true" || value === "false") {
            setFormData({ ...formData, [name]: value === "true" });
        } else if (!isNaN(value) && value !== "") {
            setFormData({ ...formData, [name]: Number(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.policy_name) {
            setErrors({ policy_name: "Policy Name is required" });
            return;
        }
        // carry forward validation
        if (formData.carry_forward_enabled) {
            const errs = {};
            if (!formData.carry_forward_monthly_type) {
                errs.carry_forward_monthly_type = "Monthly type is required";
            }
            if (formData.carry_forward_monthly_value === null || formData.carry_forward_monthly_value === "") {
                errs.carry_forward_monthly_value = "Monthly value is required";
            }
            // if yearly type selected, yearly value required
            if (formData.carry_forward_yearly_type && (formData.carry_forward_yearly_value === null || formData.carry_forward_yearly_value === "")) {
                errs.carry_forward_yearly_value = "Yearly value is required when yearly type is selected";
            }
            if (Object.keys(errs).length > 0) {
                setErrors(errs);
                return;
            }
        }
        setIsSubmitting(true);
        try {
            const token = sessionStorage.getItem("token");

            const payload = { ...formData, status: true };
            let res;
            if (editingId) {
                // update existing
                res = await axios.put(`${HRMS_API_BASE}/leave/update-policy/${editingId}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setMessage("Policy updated successfully!");
            } else {
                res = await axios.post(`${HRMS_API_BASE}/leave/leave-policies`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                setMessage("Policy added successfully!");
            }
            setMessageType("success");
            setIsModalOpen(false);
            setFormData(initialFormData);
            setEditingId(null);
            fetchPolicies(); // Refresh table
        } catch (err) {
            console.error(err);
            setMessage("Error adding policy");
            setMessageType("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-x-4 flex flex-col">
            <div className="flex justify-between space-x-4 border-b border-gray-500">
                <div className="justify-between flex mb-3 mt-4">
                    <h2 className="text-lg font-bold mt-1">Reset Leave For :</h2>
                    <div className="items-center grid grid-cols-3">
                        <button
                            onClick={handleResetMonthlyLeave}
                            className="bg-blue-500 text-white px-2 py-2 rounded-lg hover:bg-blue-700 transition duration-300 ml-5"
                        >
                            Monthly
                        </button>
                        <button
                            onClick={handleResetYearlyLeave}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300 ml-5"
                        >
                            Yearly
                        </button>
                        <button
                            onClick={() => { setIsModalOpen(true); setEditingId(null); setFormData(initialFormData); setErrors({}); }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300 items-end ml-5"
                        >
                            + Add Policy
                        </button>
                    </div>

                </div>
            </div>
            <div className="flex flex-wrap justify-start gap-5 mt-5">
                {[
                    {
                        title: "Sandwich Leave",
                        content: (
                            <div className="flex flex-col mb-3">
                                <div className="flex flex-col items-start">
                                    <label className="flex items-center mb-1">
                                        <input
                                            type="radio"
                                            name="sandwichLeave"
                                            value="Yes"
                                            checked={sandwichLeave === "Yes"}
                                            onChange={() => setSandwichLeave("Yes")}
                                            className="form-radio text-blue-600"
                                        />
                                        <span className="ml-2 text-gray-700 text-sm">Yes</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="sandwichLeave"
                                            value="No"
                                            checked={sandwichLeave === "No"}
                                            onChange={() => setSandwichLeave("No")}
                                            className="form-radio text-blue-600"
                                        />
                                        <span className="ml-2 text-gray-700 text-sm">No</span>
                                    </label>
                                </div>
                            </div>
                        ),
                        buttonText: "Submit",
                        buttonAction: handleSandwichLeave,
                    },
                    {
                        title: "Leave Details",
                        content: (
                            <div className="flex flex-col mb-3">
                                <label className="flex items-center mb-1">
                                    <input
                                        type="radio"
                                        name="leaveDetail"
                                        value="Leave Left This Year"
                                        checked={leaveSelection === "Leave Left This Year"}
                                        onChange={() => setLeaveSelection("Leave Left This Year")}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2 text-gray-700 text-sm">Leave Left This Year</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="leaveDetail"
                                        value="Total Leave"
                                        checked={leaveSelection === "Total Leave"}
                                        onChange={() => setLeaveSelection("Total Leave")}
                                        className="form-radio text-blue-600"
                                    />
                                    <span className="ml-2 text-gray-700 text-sm">Total Leave</span>
                                </label>
                                <p className="text-gray-600 mt-3 text-xs">
                                    Carry forward % to be applied on this leave.
                                </p>
                            </div>
                        ),
                        buttonText: "Submit",
                        buttonAction: handleLeaveDetails,
                    },
                ].map((card, index) => (
                    <div
                        key={index}
                        className="bg-white shadow-md rounded-lg p-4 border border-gray-300 flex flex-col w-[280px] min-h-[200px]"
                    >
                        <h2 className="text-[16px] font-semibold mb-3">{card.title}</h2>
                        {card.content}
                        <div className="mt-auto">
                            <button
                                onClick={card.buttonAction}
                                className="bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition duration-300 w-full text-sm"
                            >
                                {card.buttonText}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <MessageModal
                message={message}
                type={messageType}
                setMessage={setMessage}
            />

            <PolicyModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setFormData(initialFormData);
                    setErrors({});
                    setEditingId(null);
                }}
                formData={formData}
                handleChange={handleChange}
                errors={errors}
                handleSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                isEditing={!!editingId}
            />

            <PolicyTable policies={policies} fetchPolicies={fetchPolicies} onEdit={handleEdit} onViewDetails={handleViewDetails} />

            <PolicyDetailsModal
                isOpen={!!selectedPolicy}
                onClose={closeModal}
                policy={selectedPolicy}
            />
        </div>
    );
}
export default LeavePolicy; 