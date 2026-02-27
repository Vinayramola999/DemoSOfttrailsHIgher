import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import AddButton from '../../NewComponents/AddButton';
import { FaPlus } from "react-icons/fa";
import JobDetailsModal from "./JobDetailsModal";
import { DeleteIcon, EditIcon } from "../../NewComponents/ReactIcons";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal";
import { HRMS_API_BASE, MAIN_API_BASE } from "../../config/apiBase";

const PostJob = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(25);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [isJobModalOpen, setIsJobModalOpen] = useState(false);


    /****************FILTER*************** */
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const uniqueDepartments = [...new Set(data.map((item) => item.department))];

    const handlePageChange = (direction) => {
        if (direction === "prev" && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else if (direction === "next" && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const [departments, setDepartments] = useState([]);
    const [jobForm, setJobForm] = useState({
        title: "",
        department_id: "",
        description: "",
        eligibility: "",
        responsibilities: "",
        skills: "",
        work_mode: "",
        experience: "",
        destination: "",
        close_date: "",
        location: "",
        status: "active",
    });

    const [showField, setShowField] = useState({
        eligibility: true,
        responsibilities: false,
        skills: false
    });

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetch(`${MAIN_API_BASE}/departments`,
            { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
        )
            .then(res => res.json())
            .then(data => {
                const activeDepts = data.filter(d => d.status === "Active");
                setDepartments(activeDepts);
            })
            .catch(err => console.error("Error loading departments", err));
    }, []);

    ///////////////////// JOB POST //////////////
    const openModal = () => setIsOpen(true);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setJobForm(prev => ({
            ...prev,
            [name]: name === "department_id" ? Number(value) : value
        }));
    };

    const handleCheckboxToggle = (field) => {
        setShowField(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = { ...jobForm };

            // Close date format check
            if (payload.close_date && payload.close_date.includes("/")) {
                const [day, month, year] = payload.close_date.split("/");
                payload.close_date = `${year}-${month}-${day}`;
            }

            const token = sessionStorage.getItem("token"); // ✅ Get token from session storage

            let response;
            if (isEdit) {
                // Update job
                response = await fetch(`${HRMS_API_BASE}/jobs/update/${jobForm.id}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // ✅ Add token header
                    },
                    body: JSON.stringify(payload),
                });
            } else {
                // Create job
                response = await fetch(`${HRMS_API_BASE}/jobs/create`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // ✅ Add token header
                    },
                    body: JSON.stringify(payload),
                });
            }

            const result = await response.json();

            // ✅ Check API success
            if (!response.ok || result.success === false) {
                throw new Error(result.message || "Something went wrong. Please try again.");
            }

            // ✅ Show success only if backend confirms success
            Swal.fire({
                icon: "success",
                title: isEdit ? "Job Updated" : "Job Posted",
                text: isEdit ? "The job was updated successfully!" : "The job was posted successfully!",
                timer: 2000,
                showConfirmButton: false,
            });

            resetForm();
            setIsOpen(false);
            fetchJobs();
            setIsEdit(false);
        } catch (err) {
            console.error("Error submitting job", err);

            // ✅ Show backend error in UI
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.message || "Failed to create/update job. Please try again.",
            });
        }
    };

    const fetchJobs = () => {
        const token = sessionStorage.getItem("token");
        fetch(`${HRMS_API_BASE}/jobs/list`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(response => {
                if (response.success && Array.isArray(response.data)) {
                    setData(response.data);
                }
            })
            .catch(err => console.error("Error fetching jobs", err));
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const [selectedWorkMode, setSelectedWorkMode] = useState("");
    const [selectedDestination, setSelectedDestination] = useState("");

    useEffect(() => {
        let filtered = data;

        if (searchTerm) {
            filtered = filtered.filter(item =>
                item.title?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        if (selectedDept) {
            filtered = filtered.filter(item => String(item.department_id) === String(selectedDept));
        }

        if (selectedWorkMode) {
            filtered = filtered.filter(item => item.work_mode === selectedWorkMode);
        }

        if (selectedDestination) {
            filtered = filtered.filter(item => item.destination === selectedDestination);
        }

        if (fromDate && toDate) {
            filtered = filtered.filter((item) => {
                const closeDate = new Date(item.close_date);
                return closeDate >= new Date(fromDate) && closeDate <= new Date(toDate + "T23:59:59");
            });
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchTerm, selectedDept, selectedWorkMode, selectedDestination, fromDate, toDate, data]);

    ///////////////DELETE//////////////////////
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleDeleteClick = (id) => {
        setSelectedJobId(id);
        setShowDeleteModal(true);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setSelectedJobId(null);
    };

    const handleConfirmDelete = () => {
        setLoading(true);
        const token = sessionStorage.getItem("token"); // ✅ Get token from session storage

        fetch(`${HRMS_API_BASE}/jobs/delete/${selectedJobId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`, // ✅ Add token to headers
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to delete job");
                return res.json();
            })
            .then(() => {
                setShowDeleteModal(false);
                setSelectedJobId(null);
                setLoading(false);
                Swal.fire("Deleted!", "Job has been deleted.", "success");
                fetch(`${HRMS_API_BASE}/jobs/list`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                    .then((res) => res.json())
                    .then((response) => {
                        if (response.success && Array.isArray(response.data)) {
                            setData(response.data);
                        }
                    });
            })
            .catch((err) => {
                console.error("Error deleting job", err);
                setLoading(false);
                Swal.fire("Error", "Failed to delete job", "error");
            });
    };

    const [isEdit, setIsEdit] = useState(false);

    const openEditModal = (job) => {
        setIsEdit(true);
        setJobForm(job); // <-- prefill values
        setShowField({
            eligibility: !!job.eligibility,
            responsibilities: !!job.responsibilities,
            skills: !!job.skills,
        });
        setIsOpen(true);
    };

    const initialJobForm = {
        title: "",
        department_id: "",
        description: "",
        eligibility: "",
        responsibilities: "",
        skills: "",
        work_mode: "",
        experience: "",
        destination: "",
        close_date: "",
        location: "",
        status: "active",
    };

    const resetForm = () => {
        setJobForm(initialJobForm);
        setShowField({
            eligibility: false,
            responsibilities: false,
            skills: false,
        });
    };

    const closeModal = () => {
        resetForm();          // clear form fields
        setIsEdit(false);     // reset edit mode
        setIsOpen(false);     // close modal
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <AddButton onClick={openModal} icon={FaPlus}>Add Job Post</AddButton>
            </div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center mt-2 mb-2">
                <input
                    type="text"
                    placeholder="Search "
                    className="border rounded-lg px-3 py-2 w-52"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="border rounded-lg px-3 py-2 w-52"
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                        <option key={dept.dept_id} value={dept.dept_id}>
                            {dept.dept_name}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    className="border rounded px-3 py-2"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
                <span>TO</span>
                <input
                    type="date"
                    className="border rounded px-3 py-2"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
                <select className="border rounded-lg px-3 py-2 w-52" value={selectedWorkMode} onChange={(e) => setSelectedWorkMode(e.target.value)}>
                    <option value="">Select work mode</option>
                    <option value="remote">Remote</option>
                    <option value="on-site">On Site</option>
                    <option value="hybrid">Hybrid</option>
                </select>

                <select className="border rounded-lg px-3 py-2 w-52" value={selectedDestination} onChange={(e) => setSelectedDestination(e.target.value)}>
                    <option value="">Select destination</option>
                    <option value="Softtrails">Softtrails</option>
                    <option value="HigherIndia">HigherIndia</option>
                </select>
            </div>
            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }}>
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Job Title</th>
                                <th className="p-5 text-left text-black">Department</th>
                                <th className="p-5 text-left text-black">Work mode</th>
                                <th className="p-5 text-left text-black">Destination</th>
                                <th className="p-5 text-left text-black">Close date</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={item.id} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                        <td className="px-5 py-4 text-left">{indexOfFirstItem + index + 1}</td>
                                        <td className="px-5 py-4 text-left text-blue-600 underline cursor-pointer" onClick={() => {
                                            setSelectedJob(item);
                                            setIsJobModalOpen(true);
                                        }}>{item.title}</td>
                                        <td className="px-5 py-4 text-left">{departments.find(d => d.dept_id === item.department_id)?.dept_name || "N/A"}</td>
                                        <td className="px-5 py-4 text-left capitalize">{item.work_mode}</td>
                                        <td className="px-5 py-4 text-left">{item.destination}</td>
                                        <td className="px-5 py-4 text-left">{new Date(item.close_date).toLocaleDateString("en-GB")}</td>
                                        <td
                                            className={`px-5 py-4 text-left font-semibold ${item.status.toLowerCase() === "active"
                                                ? "text-green-600"
                                                : "text-red-600"
                                                }`}
                                        >
                                            {item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
                                        </td>
                                        <td className="px-5 py-4 text-left flex gap-2">
                                            <button className="text-blue-700" onClick={() => openEditModal(item)} > <EditIcon /> </button>
                                            <button className="text-red-600" onClick={() => handleDeleteClick(item.id)}><DeleteIcon /></button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="text-center p-4">No records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                {totalPages > 1 &&(
                <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-20">
                    <button
                        onClick={() => handlePageChange("prev")}
                        disabled={currentPage === 1}
                        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lt;
                    </button>
                    <span className="px-3 py-1 bg-blue-600 text-white rounded">{currentPage}</span>
                    <span className="text-[8px]">of</span>
                    <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
                        {totalPages}
                    </span>
                    <button
                        onClick={() => handlePageChange("next")}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &gt;
                    </button>
                </div>)}
            </div>

            {isJobModalOpen && selectedJob && (
                <JobDetailsModal
                    job={selectedJob}
                    deptName={departments.find(d => d.dept_id === selectedJob.department_id)?.dept_name || "N/A"}
                    onClose={() => setIsJobModalOpen(false)}
                />
            )}

            <DeleteConfirmModal
                open={showDeleteModal}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                loading={loading}
            />

            {/* Add Post */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div className="bg-white rounded-lg w-[90%] scrollbar-hide max-w-sm md:max-w-xl lg:max-w-2xl p-4 md:p-6 relative text-sm max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <button className="absolute top-3 right-3 text-red-600 text-xs font-bold" onClick={closeModal} > ❌ </button>
                        <h2 className="text-[15px] font-medium mb-4">{isEdit ? "Edit Job Post" : "Add Job Post"}</h2>
                        <form onSubmit={handleJobSubmit} className="space-y-4">
                            {/* Job title and Department */}
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="w-full md:w-1/2">
                                    <label className="block mb-1">Job title<span className="text-red-600">*</span></label>
                                    <input
                                        name="title"
                                        type="text"
                                        value={jobForm.title}
                                        onChange={handleFormChange}
                                        placeholder="Enter job title"
                                        className="w-full border p-2 rounded-lg"
                                        required
                                    />
                                </div>
                                <div className="w-full md:w-1/2">
                                    <label className="block mb-1">Department<span className="text-red-600">*</span></label>
                                    <select
                                        name="department_id"
                                        value={jobForm.department_id}
                                        onChange={handleFormChange}
                                        className="w-full border p-2 rounded-lg"
                                        required
                                    >
                                        <option value="">Select department</option>
                                        {departments.map((dept) => (
                                            <option key={dept.dept_id} value={dept.dept_id}>
                                                {dept.dept_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Job Description */}
                            <div>
                                <label className="block mb-1">Job Overview<span className="text-red-600">*</span></label>
                                <input
                                    name="description"
                                    type="text"
                                    value={jobForm.description}
                                    onChange={handleFormChange}
                                    placeholder="Enter job description"
                                    className="w-full border p-2 rounded-lg"
                                />
                            </div>

                            {/* Checkboxes */}
                            <div>
                                <label className="block mb-1">Check:<span className="text-red-600">*</span></label>
                                <div className="flex flex-wrap gap-4 items-center">
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={showField.eligibility}
                                            onChange={() => handleCheckboxToggle("eligibility")}
                                        />
                                        Eligibility<span className="text-red-600">*</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={showField.responsibilities}
                                            onChange={() => handleCheckboxToggle("responsibilities")}
                                        />
                                        Responsibilities<span className="text-red-600">*</span>
                                    </label>
                                    <label className="flex items-center gap-1">
                                        <input
                                            type="checkbox"
                                            checked={showField.skills}
                                            onChange={() => handleCheckboxToggle("skills")}
                                        />
                                        Skills<span className="text-red-600">*</span>
                                    </label>
                                </div>
                            </div>

                            {showField.eligibility && (
                                <div>
                                    <label className="block mb-1">Eligibility</label>
                                    <textarea
                                        name="eligibility"
                                        value={jobForm.eligibility}
                                        onChange={handleFormChange}
                                        placeholder="Enter eligibility (each line will be a bullet)"
                                        className="w-full border p-2 rounded-lg"
                                        rows={4}
                                    />
                                    {jobForm.eligibility && (
                                        <ul className="list-disc pl-5 mt-2">
                                            {jobForm.eligibility.split("\n").map((point, idx) => (
                                                <li key={idx}>{point}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {showField.responsibilities && (
                                <div>
                                    <label className="block mb-1">Responsibilities</label>
                                    <textarea
                                        name="responsibilities"
                                        value={jobForm.responsibilities}
                                        onChange={handleFormChange}
                                        placeholder="Enter responsibilities (each line will be a bullet)"
                                        className="w-full border p-2 rounded-lg"
                                        rows={4}
                                    />
                                    {jobForm.responsibilities && (
                                        <ul className="list-disc pl-5 mt-2">
                                            {jobForm.responsibilities.split("\n").map((point, idx) => (
                                                <li key={idx}>{point}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                            {showField.skills && (
                                <div>
                                    <label className="block mb-1">Skills</label>
                                    <textarea
                                        name="skills"
                                        value={jobForm.skills}
                                        onChange={handleFormChange}
                                        placeholder="Enter skills (each line will be a bullet)"
                                        className="w-full border p-2 rounded-lg"
                                        rows={4}
                                    />
                                    {jobForm.skills && (
                                        <ul className="list-disc pl-5 mt-2">
                                            {jobForm.skills.split("\n").map((point, idx) => (
                                                <li key={idx}>{point}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}

                            {/* Work Mode */}
                            <div>
                                <label className="block mb-1">Work mode<span className="text-red-600">*</span></label>
                                <div className="flex flex-wrap gap-6 items-center">
                                    {["on-site", "remote", "hybrid"].map((mode) => (
                                        <label key={mode} className="flex items-center gap-1 capitalize">
                                            <input
                                                type="radio"
                                                name="work_mode"
                                                value={mode}
                                                checked={jobForm.work_mode === mode}
                                                onChange={handleFormChange}
                                            />
                                            {mode}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Experience, Destination, Location City, Close Date */}
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="w-full md:w-1/4">
                                    <label className="block mb-1">Experience<span className="text-red-600">*</span></label>
                                    <input
                                        name="experience"
                                        type="text"
                                        value={jobForm.experience}
                                        onChange={handleFormChange}
                                        placeholder="Enter experience"
                                        className="w-full border p-2 rounded-lg"
                                    />
                                </div>

                                <div className="w-full md:w-1/4">
                                    <label className="block mb-1">Destination<span className="text-red-600">*</span></label>
                                    <select
                                        name="destination"
                                        value={jobForm.destination}
                                        onChange={handleFormChange}
                                        className="w-full border p-2 rounded-lg"
                                    >
                                        <option value="">Select destination</option>
                                        <option>HigherIndia</option>
                                        <option>Softtrails</option>
                                    </select>
                                </div>

                                {/* ✅ New Location City field */}
                                <div className="w-full md:w-1/4">
                                    <label className="block mb-1">Location City<span className="text-red-600">*</span></label>
                                    <input
                                        name="location"
                                        type="text"
                                        value={jobForm.location}
                                        onChange={handleFormChange}
                                        placeholder="Enter city"
                                        className="w-full border p-2 rounded-lg"
                                    />
                                </div>

                                <div className="w-full md:w-1/4">
                                    <label className="block mb-1">Close date<span className="text-red-600">*</span></label>
                                    <input
                                        name="close_date"
                                        type="date"
                                        value={jobForm.close_date}
                                        onChange={handleFormChange}
                                        className="w-full border p-2 rounded-lg"
                                    />
                                </div>
                            </div>
                            {isEdit && (
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Status
                                    </label>
                                    <div className="flex gap-4 items-center text-sm">
                                        <label className="flex items-center gap-1">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="active"
                                                checked={jobForm.status === "active"}
                                                onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                                                className="w-3 h-3 accent-green-600"
                                            />
                                            <span className="text-gray-700">Active</span>
                                        </label>

                                        <label className="flex items-center gap-1">
                                            <input
                                                type="radio"
                                                name="status"
                                                value="inactive"
                                                checked={jobForm.status === "inactive"}
                                                onChange={(e) => setJobForm({ ...jobForm, status: e.target.value })}
                                                className="w-3 h-3 accent-red-600"
                                            />
                                            <span className="text-gray-700">Inactive</span>
                                        </label>
                                    </div>
                                </div>
                            )}
                            {/* Buttons */}
                            <div className="flex justify-end gap-4 pt-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg"
                                >
                                    {isEdit ? "Update" : "Submit"}
                                </button>
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="border px-6 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default PostJob;