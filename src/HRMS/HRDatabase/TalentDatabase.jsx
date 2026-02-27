import { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Flag } from 'lucide-react';
import excel from '../../assests/excel.png';
import folder from '../../assests/folder.png';
import Swal from 'sweetalert2';
import AddButton from '../../NewComponents/AddButton';
import { FaPlus } from "react-icons/fa";
import { DMS_API_BASE,HRMS_API_BASE } from "../../config/apiBase";

const TalentDatabase = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(25);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDept, setSelectedDept] = useState("");
    const [selectedJob, setSelectedJob] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [selected, setSelected] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleOpenModal = (item) => {
        setSelected(item);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        setSelected(null);
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`${HRMS_API_BASE}/resume/careers`, {
                headers: { Authorization: `Bearer ${sessionStorage.getItem('token')}` },
            });
            const sortedData = response.data.data.sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );

            setData(sortedData);
            setFilteredData(sortedData);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };


    useEffect(() => {
        fetchData();
    }, []);

    /****************FILTER*************** */
    useEffect(() => {
        let filtered = data;
        if (searchTerm) {
            filtered = filtered.filter(
                (item) =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.phone_no.includes(searchTerm)
            );
        }
        if (selectedDept) {
            filtered = filtered.filter((item) => item.department === selectedDept);
        }

        if (selectedJob) {
            filtered = filtered.filter((item) => item.job_title === selectedJob);
        }

        if (fromDate && toDate) {
            filtered = filtered.filter((item) => {
                const createdDate = new Date(item.created_at);
                return (
                    createdDate >= new Date(fromDate) &&
                    createdDate <= new Date(toDate + "T23:59:59")
                );
            });
        }

        setFilteredData(filtered);
        setCurrentPage(1);
    }, [searchTerm, selectedDept, selectedJob, fromDate, toDate, data]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const uniqueDepartments = [...new Set(data.map((item) => item.department))];
    const uniqueJobs = [...new Set(data.map((item) => item.job_title))];

    const handlePageChange = (direction) => {
        if (direction === "prev" && currentPage > 1) {
            setCurrentPage(currentPage - 1);
        } else if (direction === "next" && currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const exportToExcel = () => {
        const header = [
            [
                "S. No.",
                "Candidate Name",
                "Email ID",
                "Phone Number",
                "Department",
                "Job Title",
                "Experience (Years)",
                "Current CTC (LPA)",
                "Source",
                "Status",
                "Apply Date",
                "Resume Link",
            ],
        ];

        // ✅ Format data for export
        const data = filteredData.map((item, index) => [
            index + 1,
            item.name || "NA",
            item.email || "NA",
            item.phone_no || "NA",
            item.department || "NA",
            item.job_title || "NA",
            item.year_of_experience || "NA",
            item.ctc || "NA",
            item.source || "NA",
            item.status || "NA",
            new Date(item.created_at).toLocaleDateString("en-GB"),
            item.resume
                ? { f: `HYPERLINK("${item.resume}", "View Resume")` }
                : "No File",
        ]);
        const worksheet = XLSX.utils.aoa_to_sheet([...header, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Talent Database");

        // ✅ Auto-size columns (optional but looks clean)
        const columnWidths = header[0].map((h) => ({ wch: h.length + 5 }));
        worksheet["!cols"] = columnWidths;

        // ✅ Generate Excel file
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // ✅ Save with timestamped name
        saveAs(blob, `Talent_Database_${new Date().toISOString().split("T")[0]}.xlsx`);
    };

    ///////////////////////// ADD PROFILE  //////////////////
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        yearOfExperience: "",
        currentCTC: "",
        title: "",
        department: "",
        message: "",
        status: "New Application",
    });
    const [file, setFile] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const getDmsPublishId = async () => {
        const url = `${DMS_API_BASE}/mapping/check`;
        const token = sessionStorage.getItem("token");

        try {
            const response = await axios.get(url, {
                params: {
                    service_name: "HRMS",
                    doctype: "Talent Database",
                    doc_name: "Talent Database",
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                timeout: 10000,
            });
            return response.data.dms_publish_id || null;
        } catch (error) {
            console.error("Mapping check failed:", error);
            return null;
        }
    };

    const handleFileUpload = async (file) => {
        const publishId = await getDmsPublishId();
        const userId = sessionStorage.getItem("userId");
        const token = sessionStorage.getItem("token");

        if (!file || !publishId || !userId || !token) {
            console.warn("Missing required fields for file upload");
            return null;
        }

        const uploadData = new FormData();
        uploadData.append("documents", file);
        uploadData.append("ref", "DMS");

        const metadata = [
            {
                service: "HRMS",
                publish_id: parseInt(publishId),
                user_id: userId,
                document_name: file.name.replace(/[^a-zA-Z0-9_.\- ]/g, ""),
            },
        ];
        uploadData.append("metadata", JSON.stringify(metadata));

        try {
            const response = await fetch(`${DMS_API_BASE}/dmsapi/upload-documents`,
                {
                    method: "POST",
                    headers: {Authorization: `Bearer ${token}`,},
                    body: uploadData,
                }
            );

            const data = await response.json();
            return data.uploaded_files?.[0]?.file_url || null;
        } catch (error) {
            console.error("Upload failed:", error);
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fileUrl = await handleFileUpload(file);
            if (!fileUrl) {
                Swal.fire("Error", "Failed to upload resume. Please try again.", "error");
                return;
            }
            const payload = {
                name: formData.name,
                phone_no: formData.phone,
                email: formData.email,
                year_of_experience: formData.yearOfExperience,
                ctc: formData.currentCTC,
                job_title: formData.title,
                department: formData.department,
                message: formData.message,
                resume: fileUrl,
                source: "HR",
                status: "New Application"
            };
            const response = await fetch(`${HRMS_API_BASE}/resume/apply-hr`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });
            if (response.ok) {
                Swal.fire("Success", "Application submitted successfully!", "success");
                setShowForm(false);
                setFormData({
                    name: "",
                    phone: "",
                    email: "",
                    yearOfExperience: "",
                    currentCTC: "",
                    title: "",
                    department: "",
                    message: "",
                });
                setFile(null);
                fetchData();
            } else {
                const error = await response.json();
                Swal.fire("Error", error.message || "Something went wrong", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Failed to submit the form. Please try again later.", "error");
            console.error(error);
        }
    };

    const [showFlagModal, setShowFlagModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const openFlagModal = (id) => {
        setSelectedId(id);
        setShowFlagModal(true);
    };

    const sendFlagStatus = async (flag) => {
        if (!flag) {
            setShowFlagModal(false);
            setSelectedId(null);
            return;
        }

        const token = sessionStorage.getItem('token');
        if (!token) {
            Swal.fire('Error', 'User not authenticated', 'error');
            return;
        }

        try {
            const response = await fetch(`${HRMS_API_BASE}/resume/flag/${selectedId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                Swal.fire('Success', 'Candidate flagged successfully.', 'success');
                fetchData();
            } else {
                Swal.fire('Error', 'Failed to flag candidate.', 'error');
            }
        } catch (error) {
            console.error("Error:", error);
            Swal.fire('Network Error', 'Unable to flag candidate.', 'error');
        } finally {
            setShowFlagModal(false);
            setSelectedId(null);
        }
    };

    //////////////////////Update Status////////////////////
    const handleStatusChange = async (id, newStatus) => {
        try {
            const response = await fetch(`${HRMS_API_BASE}/resume/update-status/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (response.ok) {
                setFilteredData(prev =>
                    prev.map(item =>
                        item.id === id ? { ...item, status: newStatus } : item
                    )
                );
                console.log('Status updated');
            } else {
                console.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error while updating status:', error);
        }
    };

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <AddButton onClick={() => setShowForm(true)} icon={FaPlus}>Add Profile</AddButton>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center mt-2 mb-2">
                <input
                    type="text"
                    placeholder="Search"
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
                    {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                            {dept}
                        </option>
                    ))}
                </select>
                <select
                    className="border rounded-lg px-3 py-2 w-52"
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                >
                    <option value="">Select job title</option>
                    {uniqueJobs.map((job) => (
                        <option key={job} value={job}>
                            {job}
                        </option>
                    ))}
                </select>
                <input
                    type="date"
                    className="border rounded-lg px-3 py-2"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                />
                <span>TO</span>
                <input
                    type="date"
                    className="border rounded-lg px-3 py-2"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                />
                <button onClick={exportToExcel} className="text-green-600 hover:text-green-800 ml-5">
                    <img src={excel} alt="Excel Logo" className="w-8 h-8" />
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto scrollbar-hide max-h-[75vh] sm:max-h-[60vh] md:max-h-[55vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0" style={{ boxShadow: "0 2px 0 black" }} >
                            <tr>
                                <th className="p-5 text-left text-black">S.No</th>
                                <th className="p-5 text-left text-black">Name</th>
                                <th className="p-5 text-left text-black">Email</th>
                                <th className="p-5 text-left text-black">Phone no.</th>
                                <th className="p-5 text-left text-black">Job Title</th>
                                <th className="p-5 text-left text-black">Status</th>
                                <th className="p-5 text-left text-black">Source</th>
                                <th className="p-5 text-left text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="9" className="h-3 bg-white"></td></tr>
                            {currentItems.map((item, index) => (
                                <tr key={item.id} className={`${(index + 1) % 2 === 0 ? "bg-white" : "bg-tableblue"}`} >
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {indexOfFirstItem + index + 1} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-custome-blue underline cursor-pointer" onClick={() => handleOpenModal(item)} >{item.name}</td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {item.email} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {item.phone_no} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black"> {item.job_title} </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">
                                        <select
                                            className={`border rounded px-2 py-1 
    ${item.status === "New Application" ? "bg-gray-100 text-gray-700 border-gray-300" : ""}
    ${item.status === "Interview" ? "bg-yellow-100 text-yellow-800 border-yellow-400" : ""}
    ${item.status === "Rejected" ? "bg-red-100 text-red-700 border-red-400" : ""}
    ${item.status === "Hired" ? "bg-green-100 text-green-700 border-green-400" : ""}
    ${item.status === "Viewed" ? "bg-blue-100 text-blue-800 border-blue-400" : ""}
  `}
                                            value={item.status || "New Application"}
                                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                                        >
                                            <option value="New Application" disabled>
                                                New Application
                                            </option>
                                            <option value="Viewed">Viewed</option>
                                            <option value="Interview">Interview</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Hired">Hired</option>
                                        </select>
                                    </td>
                                    <td className="px-5 py-4 text-left text-[14px] text-black">{item.source}</td>
                                    <td className="px-5 py-4 text-left flex gap-2">
                                        <button onClick={() => openFlagModal(item.id)} className="text-yellow-500 hover:text-yellow-600" title="Flag Candidate" > <Flag size={18} /> </button>
                                        {item.resume ? (
                                            <a href={item.resume} target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-600 flex justify-center items-center gap-1" title="Preview Resume" >
                                                <img src={folder} alt="preview" className="w-5 h-5" />
                                            </a>
                                        ) : (<span className="text-gray-400 text-[13px] italic">NA</span>)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-20 bg-gray-100">
                        <button
                            onClick={() => handlePageChange("prev")}
                            disabled={currentPage === 1}
                            className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            &lt;
                        </button>
                        <span className="px-3 py-1 bg-blue-600 text-white rounded">
                            {currentPage}
                        </span>
                        <span className="text-[10px]">of</span>
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
                    </div>
                )}
            </div>

            {/* Details Pop up */}
            {showModal && selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4">
                    <div className="bg-white rounded-md shadow-lg w-full max-w-2xl relative px-8 py-6">
                        {/* Close Button */}
                        <button className="absolute top-3 right-3 text-red-600 text-xl" onClick={handleClose} > ❌ </button>
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-left">
                            {selected.name}
                        </h2>

                        {/* Details */}
                        <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                            <div>
                                <span className="text-gray-500">Email ID:</span>
                                <span className="text-black ml-2">{selected.email}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Phone number:</span>
                                <span className="text-black ml-2">{selected.phone_no}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Job title:</span>
                                <span className="text-black ml-2">{selected.job_title}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Department:</span>
                                <span className="text-black ml-2">{selected.department}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Year of experience:</span>
                                <span className="text-black ml-2">{selected.year_of_experience} years</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Current CTC:</span>
                                <span className="text-black ml-2">{selected.ctc} LPA</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Apply date:</span>
                                <span className="text-black ml-2">
                                    {new Date(selected.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Source:</span>
                                <span className="text-black ml-2">{selected.source}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span
                                    className={`ml-2 font-semibold ${selected.status?.toLowerCase() === "selected"
                                        ? "text-green-600"
                                        : selected.status?.toLowerCase() === "rejected"
                                            ? "text-red-600"
                                            : "text-yellow-600"
                                        }`}
                                >
                                    {selected.status || "NA"}
                                </span>
                            </div>
                            <div className="whitespace-pre-wrap break-words">
                                <span className="text-gray-500">Message:</span>
                                <span className="text-black ml-2">{selected.message || "NA"}</span>
                            </div>
                        </div>

                        {/* Uploaded Resume */}
                        <div className="mt-6 flex flex-col">
                            <div className="text-sm text-gray-500 font-medium mb-2">
                                Upload file:
                            </div>
                            {selected.resume ? (
                                <a href={selected.resume} target="_blank" rel="noopener noreferrer" className="flex items-center px-4 py-2 text-sm text-green-600 hover:underline" >
                                    <img src={folder} alt="resume" className="w-5 h-5 mr-2" />
                                    <span className="ml-1 font-medium text-black">{selected.name}.pdf</span>
                                </a>
                            ) : (<span className="text-gray-400 italic">No file uploaded</span>)}
                        </div>
                    </div>
                </div>
            )}

            {/* Flag Table */}
            {showFlagModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-[350px] shadow-xl border border-red-500 animate-scaleIn">
                        <div className="flex items-center mb-4">
                            <svg
                                className="w-6 h-6 text-red-600 mr-2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01M5.07 5.07a10 10 0 0113.86 13.86M12 22a10 10 0 100-20 10 10 0 000 20z"
                                />
                            </svg>
                            <h2 className="text-lg font-bold text-red-700">Warning</h2>
                        </div>

                        <p className="mb-2 font-semibold text-red-600 text-sm">
                            Are you sure you want to flag this candidate?
                        </p>
                        <p className="text-sm text-gray-700 mb-6">
                            This action <strong>cannot be undone</strong>. Proceed with caution.
                        </p>

                        <div className="flex justify-end gap-4">
                            <button
                                className="bg-gray-100 text-gray-800 px-4 py-2 rounded hover:bg-gray-200 transition"
                                onClick={() => sendFlagStatus(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                                onClick={() => sendFlagStatus(true)}
                            >
                                Yes, Flag
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/*POP UP FORM */}
            {showForm && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">✨ Add New Profile</h2>
                        <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    name="name"
                                    required
                                    placeholder="Name *"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition w-full"
                                />
                                <input
                                    name="phone"
                                    required
                                    placeholder="Phone No *"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition w-full"
                                />
                                <input
                                    name="email"
                                    required
                                    type="email"
                                    placeholder="Email *"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition w-full"
                                />
                                <input
                                    type="file"
                                    required
                                    onChange={handleFileChange}
                                    className="border border-gray-300 focus:outline-none px-4 py-2 rounded-lg transition w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                                />
                                <input
                                    name="yearOfExperience"
                                    required
                                    placeholder="Year of Experience (e.g.: 2) *"
                                    value={formData.yearOfExperience}
                                    onChange={handleChange}
                                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition w-full"
                                />
                                <input
                                    name="currentCTC"
                                    required
                                    placeholder="Current CTC *"
                                    value={formData.currentCTC}
                                    onChange={handleChange}
                                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition w-full"
                                />
                                <input
                                    name="title"
                                    required
                                    placeholder="Title *"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition w-full"
                                />
                                <input
                                    name="department"
                                    required
                                    placeholder="Department *"
                                    value={formData.department}
                                    onChange={handleChange}
                                    className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition w-full"
                                />
                            </div>
                            <textarea
                                name="message"
                                placeholder="Message"
                                value={formData.message}
                                onChange={handleChange}
                                className="border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-3 rounded-lg w-full resize-none transition"
                                rows={4}
                            />
                            <div className="flex justify-end gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-5 py-2 rounded-lg border  bg-red-600  text-white hover:bg-red-500 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                >
                                    Apply
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
export default TalentDatabase;