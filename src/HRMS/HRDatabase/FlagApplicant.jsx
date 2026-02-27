import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import excel from '../../assests/excel.png';
import folder from '../../assests/folder.png';
import { DeleteIcon } from "../../NewComponents/ReactIcons";
import DeleteConfirmModal from "../../NewComponents/DeleteConfirmModal"; 
import { HRMS_API_BASE } from "../../config/apiBase";

const FlagApplicant = () => {
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
        const token = sessionStorage.getItem("token");
        try {
            const response = await axios.get(`${HRMS_API_BASE}/resume/flagged`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // Sort by flag date (latest first) — using created_at field
            const sortedData = response.data.data.sort(
                (a, b) => new Date(b.created_at) - new Date(a.created_at)
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

    /***************** DELETE ***********/
    const [deleteId, setDeleteId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const openDeleteConfirm = (id) => {
        setDeleteId(id);
        setErrorMessage("");
        setOpenModal(true);
    };

    const handleCancel = () => {
        setOpenModal(false);
        setDeleteId(null);
    };

    const handleConfirm = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${HRMS_API_BASE}/resume/flagged/${deleteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(errorText || "Failed to delete");
            }
            const updatedRes = await fetch(`${HRMS_API_BASE}/resume/flagged`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
                },
            });

            if (!updatedRes.ok) {
                throw new Error("Failed to fetch updated list");
            }

            const updatedData = await updatedRes.json();
            setData(updatedData.data || []); // ✅ update your state holding the table/list

            // ✅ Close modal and reset state
            setOpenModal(false);
            setLoading(false);
            setErrorMessage("");

        } catch (error) {
            console.error("Delete error:", error);
            setErrorMessage("Failed to delete item. Please try again.");
            setLoading(false);
        }
    };

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
        if (!filteredData || filteredData.length === 0) return;

        // Excel Headers
        const header = [
            [
                "S. No.",
                "Name",
                "Email",
                "Phone No.",
                "Department",
                "Job Title",
                "Message",
                "Years of Experience",
                "CTC (LPA)",
                "Email Verified",
                "Apply Date",
                "Resume Link"
            ],
        ];

        // Data Rows
        const data = filteredData.map((item, index) => [
            index + 1,
            item.name || "NA",
            item.email || "NA",
            item.phone_no || "NA",
            item.department || "NA",
            item.job_title || "NA",
            item.message || "NA",
            item.year_of_experience || "NA",
            item.ctc || "NA",
            item.email_verified ? "Yes" : "No",
            new Date(item.created_at).toLocaleDateString("en-GB"),
            item.resume
                ? { f: `HYPERLINK("${item.resume}", "View Resume")` }
                : "NA"
        ]);

        // Create Excel Sheet
        const worksheet = XLSX.utils.aoa_to_sheet([...header, ...data]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Flagged Candidates");

        // Write and download the Excel file
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        // Trigger download
        saveAs(blob, `Flagged_Candidates_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    // const handlePreview = async (id) => {
    //     try {
    //         const res = await fetch(`${HRMS_API_BASE}/resume/flagged/resume/${id}`,
    //             {
    //                 method: "GET",
    //                 headers: {
    //                     Authorization: `Bearer ${sessionStorage.getItem("token")}`,
    //                 },
    //             }
    //         );

    //         if (!res.ok) {
    //             throw new Error(`Failed to fetch resume: ${res.status}`);
    //         }

    //         const blob = await res.blob();
    //         const url = URL.createObjectURL(blob);
    //         window.open(url, "_blank");
    //     } catch (err) {
    //         console.error("Error previewing resume:", err);
    //     }
    // };

    return (
        <div>
            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4 items-center mt-2">
                <input
                    type="text"
                    placeholder="Search by name/email/phone"
                    className="border rounded px-3 py-2 w-52"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="border rounded px-3 py-2 w-52"
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
                    className="border rounded px-3 py-2 w-52"
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
                <button onClick={exportToExcel} className="text-green-600 hover:text-green-800 ml-5">
                    <img src={excel} alt="Excel Logo" className="w-8 h-8" />
                </button>
            </div>
            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[70vh] rounded-lg flex flex-col">
                <div className="flex-1 overflow-auto scrollbar-hide bg-white">
                    <table className="min-w-full table-auto border-collapse text-sm">
                        <thead className="text-[14px] font-medium bg-white sticky top-0 " style={{ boxShadow: "0 2px 0 black" }} >
                            <tr>
                                <th className="p-5 text-left">S. No.</th>
                                <th className="p-5 text-left">Name</th>
                                <th className="p-5 text-left">Email</th>
                                <th className="p-5 text-left">Phone no.</th>
                                <th className="p-5 text-left">Department</th>
                                <th className="p-5 text-left">Job Title</th>
                                <th className="p-5 text-left">Apply Date</th>
                                <th className="p-5 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td colSpan="5" className="h-3 bg-white"></td></tr>
                            {currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
                                    <tr key={item.id} className={`${(index + 1) % 2 === 0 ? 'bg-white' : 'bg-tableblue'}`}>
                                        <td className="p-5 text-left">{indexOfFirstItem + index + 1}</td>
                                        <td className="p-5 text-left text-blue-600 cursor-pointer" onClick={() => handleOpenModal(item)}>{item.name}</td>
                                        <td className="p-5 text-left">{item.email}</td>
                                        <td className="p-5 text-left">{item.phone_no}</td>
                                        <td className="p-5 text-left">{item.department}</td>
                                        <td className="p-5 text-left">{item.job_title}</td>
                                        <td className="p-5 text-left">{new Date(item.created_at).toLocaleDateString("en-GB")}</td>
                                        <td className="p-5 text-left flex">
                                            {item.resume ? (
                                                <button onClick={() => window.open(item.resume, "_blank")} className="text-blue-500 flex items-center gap-1 hover:text-blue-700" >
                                                    <img src={folder} alt="preview" className="w-5 h-5 mr-1" />
                                                </button>
                                            ) : ("NA")}
                                            <button onClick={() => openDeleteConfirm(item.id)} className="text-red-500 hover:text-red-700 p-1" > <DeleteIcon /> </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="10" className="text-center p-5">No records found.</td></tr>
                            )}
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
                        <button
                            className="absolute top-3 right-3 text-red-600 text-xl"
                            onClick={handleClose}
                        >
                            ❌
                        </button>
                        {/* Candidate Name */}
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 text-left">{selected.name}</h2>
                        {/* Details (Single Column) */}
                        <div className="grid grid-cols-1 gap-3 text-sm text-gray-700">
                            <div><span className="text-gray-500">Email ID:</span> <span className="text-black ml-2">{selected.email}</span></div>
                            <div><span className="text-gray-500">Phone number:</span> <span className="text-black ml-2">{selected.phone_no}</span></div>
                            <div><span className="text-gray-500">Job title:</span> <span className="text-black ml-2">{selected.job_title}</span></div>
                            <div><span className="text-gray-500">Department:</span> <span className="text-black ml-2">{selected.department}</span></div>
                            <div><span className="text-gray-500">Year of experience:</span> <span className="text-black ml-2">{selected.year_of_experience} years</span></div>
                            <div><span className="text-gray-500">Current CTC:</span> <span className="text-black ml-2">{selected.ctc} LPA</span></div>
                            <div><span className="text-gray-500">Apply date:</span> <span className="text-black ml-2">{new Date(selected.created_at).toLocaleDateString()}</span></div>
                            <div><span className="text-gray-500">Message:</span> <span className="text-black ml-2">{selected.message}</span></div>
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

            {/* Delete confirmation modal */}
            <DeleteConfirmModal
                open={openModal}
                onCancel={handleCancel}
                onConfirm={handleConfirm}
                loading={loading}
                errorMessage={errorMessage}
            />
        </div>
    );
};
export default FlagApplicant;